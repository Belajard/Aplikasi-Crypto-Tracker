<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import AppHeader from "./components/AppHeader.vue";
import CoinRow from "./components/CoinRow.vue";
import CoinSheet from "./components/CoinSheet.vue";
import { useCoins } from "./composables/useCoins.js";
import { useAutoRefresh } from "./composables/useAutoRefresh.js";
import { usePersisted } from "./composables/usePersisted.js";

// ---------- State ----------
const { coins, prev, loading, error, updatedAt, load } = useCoins();
const favorites = usePersisted("favs", []);
const theme = usePersisted("theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

const q = ref("");            // kata pencarian
const filter = ref("all");    // all | fav | up | down
const sortBy = ref("rank");   // rank | name | price | change
const visible = ref(25);      // jumlah baris yang ditampilkan

const selectedId = ref(null); // koin yang sedang dibuka detailnya
const sheetOpen = ref(false);
const toast = ref("");
const header = ref(null);
let toastTimer;

// ---------- Memuat data ----------
async function refresh() {
  const hadData = coins.value.length > 0;
  reset();
  const ok = await load();
  if (ok === null) return;                       // masih memuat -> abaikan
  if (!ok) showToast("Gagal memuat data");
  else if (hadData) showToast("Data diperbarui"); // tidak perlu notifikasi saat pemuatan pertama
}
const { enabled: auto, countdown, reset, seconds } = useAutoRefresh(refresh, 30);

// ---------- Data turunan ----------
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase();
  let list = coins.value.filter((c) => (c.name + " " + c.symbol).toLowerCase().includes(s));
  if (filter.value === "fav") list = list.filter((c) => favorites.value.includes(c.id));
  if (filter.value === "up") list = list.filter((c) => +c.percent_change_24h > 0);
  if (filter.value === "down") list = list.filter((c) => +c.percent_change_24h < 0);

  const sorters = {
    rank: (a, b) => a.rank - b.rank,
    name: (a, b) => a.name.localeCompare(b.name),
    price: (a, b) => b.price_usd - a.price_usd,
    change: (a, b) => b.percent_change_24h - a.percent_change_24h,
  };
  return list.sort(sorters[sortBy.value]);
});
const shown = computed(() => filtered.value.slice(0, visible.value));

const filters = computed(() => [
  { id: "all", label: "Semua", count: coins.value.length },
  { id: "fav", label: "★ Favorit", count: favorites.value.length },
  { id: "up", label: "▲ Naik", count: coins.value.filter((c) => +c.percent_change_24h > 0).length },
  { id: "down", label: "▼ Turun", count: coins.value.filter((c) => +c.percent_change_24h < 0).length },
]);

const statusText = computed(() =>
  updatedAt.value ? "Diperbarui " + updatedAt.value.toLocaleTimeString("id-ID") : "Memuat data…",
);
const selectedCoin = computed(() => coins.value.find((c) => c.id === selectedId.value));
const emptyIsFav = computed(() => filter.value === "fav" && !q.value);

// ---------- Aksi ----------
const isFav = (id) => favorites.value.includes(id);
function toggleFav(id) {
  favorites.value = isFav(id) ? favorites.value.filter((x) => x !== id) : [...favorites.value, id];
}
function openDetail(c) {
  selectedId.value = c.id;
  sheetOpen.value = true;
}
function trendOf(c) {
  const old = prev.value[c.id];
  const now = Number(c.price_usd);
  return old == null || old === now ? "" : now > old ? "up" : "down";
}
function showToast(msg) {
  toast.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ""), 1800);
}
function copyPrice(text) {
  (navigator.clipboard ? navigator.clipboard.writeText(String(text)) : Promise.reject())
    .then(() => showToast("Harga disalin"))
    .catch(() => showToast("Tidak bisa menyalin"));
}
function resetFilters() {
  q.value = "";
  filter.value = "all";
}

// ---------- Pengamat & pintasan keyboard ----------
watch([q, filter, sortBy], () => (visible.value = 25));
watch(theme, (t) => (document.documentElement.dataset.theme = t), { immediate: true });

function onKey(e) {
  if (e.key === "Escape") sheetOpen.value = false;
  if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
    e.preventDefault();
    header.value?.focusSearch();
  }
}
onMounted(() => {
  addEventListener("keydown", onKey);
  refresh();
});
onBeforeUnmount(() => removeEventListener("keydown", onKey));
</script>

<template>
  <div class="app">
    <div v-if="auto" class="progress"><i :style="{ width: (countdown / seconds) * 100 + '%' }"></i></div>

    <AppHeader
      ref="header"
      v-model:q="q"
      v-model:filter="filter"
      :filters="filters"
      :status="statusText"
      :theme="theme"
      :loading="loading"
      @refresh="refresh"
      @toggle-theme="theme = theme === 'dark' ? 'light' : 'dark'"
    />

    <div class="sortbar">
      <label class="switch"><input type="checkbox" v-model="auto" /> Auto 30 dtk</label>
      <label>
        Urutkan
        <select v-model="sortBy" aria-label="Urutkan">
          <option value="rank">Rank</option>
          <option value="name">Nama A–Z</option>
          <option value="price">Harga tertinggi</option>
          <option value="change">Naik terbanyak 24j</option>
        </select>
      </label>
    </div>

    <main>
      <!-- Gagal memuat -->
      <div v-if="error && !coins.length" class="state">
        <strong>Data tidak bisa dimuat</strong>
        {{ error }}. Periksa koneksi internet Anda.<br /><br />
        <button class="btn pri" @click="refresh">Coba lagi</button>
      </div>

      <!-- Sedang memuat (kerangka) -->
      <ul v-else-if="loading && !coins.length" class="list" aria-busy="true">
        <li v-for="n in 8" :key="n" class="skel"></li>
      </ul>

      <!-- Daftar koin -->
      <template v-else>
        <TransitionGroup name="list" tag="ul" class="list">
          <CoinRow
            v-for="(c, i) in shown"
            :key="c.id"
            :coin="c"
            :trend="trendOf(c)"
            :favorite="isFav(c.id)"
            :style="{ '--i': Math.min(i, 10) }"
            @open="openDetail(c)"
            @toggle="toggleFav(c.id)"
          />
        </TransitionGroup>

        <div v-if="!shown.length" class="state">
          <strong>{{ emptyIsFav ? "Belum ada favorit" : "Tidak ada koin yang cocok" }}</strong>
          {{ emptyIsFav ? "Ketuk ☆ pada koin untuk menandainya." : "Coba kata kunci lain." }}<br /><br />
          <button class="btn" @click="resetFilters">Reset filter</button>
        </div>

        <button v-if="filtered.length > visible" class="btn more" @click="visible += 25">
          Tampilkan lebih banyak ({{ filtered.length - visible }})
        </button>
      </template>
    </main>

    <CoinSheet
      :coin="selectedCoin"
      :open="sheetOpen"
      :favorite="selectedCoin ? isFav(selectedCoin.id) : false"
      @close="sheetOpen = false"
      @toggle="toggleFav(selectedId)"
      @copy="copyPrice"
    />

    <Transition name="toast">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.progress { position: absolute; top: 0; left: 0; right: 0; z-index: 6; height: 3px; }
.progress i { display: block; height: 100%; background: var(--pri); transition: width 1s linear; }

.sortbar { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 14px 0; font-size: 13px; color: var(--mut); }
.sortbar label { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.sortbar select { min-height: 40px; padding: 0 8px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); color: var(--ink); font: inherit; font-size: 14px; }
.switch { min-height: 40px; cursor: pointer; }
.switch input { width: 18px; height: 18px; accent-color: var(--pri); }

.list { position: relative; margin: 0; padding: 12px 14px 4px; list-style: none; }

.skel {
  height: 68px; margin-bottom: 8px; border-radius: 18px;
  background: linear-gradient(90deg, var(--chip), var(--line), var(--chip)) 0 0 / 200% 100%;
  animation: shimmer 1.2s linear infinite;
}
@keyframes shimmer { to { background-position: -200% 0; } }

.state { margin: 30px 14px; padding: 28px 18px; text-align: center; border: 1px dashed var(--line); border-radius: 18px; color: var(--mut); }
.state strong { display: block; margin-bottom: 4px; font-size: 17px; color: var(--ink); }
.more { display: block; width: calc(100% - 28px); margin: 4px 14px 28px; }

.toast {
  position: fixed; left: 50%; bottom: calc(22px + env(safe-area-inset-bottom)); z-index: 30;
  transform: translateX(-50%); padding: 10px 18px; border-radius: 999px;
  background: var(--ink); color: var(--card); font-size: 14px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}
.toast-enter-active, .toast-leave-active { transition: all 0.25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 12px); }
</style>
