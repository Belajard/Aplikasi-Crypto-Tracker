<script setup>
import { ref } from "vue";

defineProps({
  status: String,     // teks "Diperbarui 17.30"
  theme: String,      // "light" | "dark"
  loading: Boolean,
  filters: Array,     // [{ id, label, count }]
});
defineEmits(["refresh", "toggle-theme"]);

// v-model dari induk: kata pencarian & filter aktif
const q = defineModel("q", { default: "" });
const filter = defineModel("filter", { default: "all" });

const searchEl = ref(null);
defineExpose({ focusSearch: () => searchEl.value?.focus() }); // dipanggil saat menekan "/"
</script>

<template>
  <header class="top">
    <div class="bar">
      <div class="brand">
        <span class="logo" aria-hidden="true">₿</span>
        <div>
          <h1>Crypto Tracker</h1>
          <p>{{ status }}</p>
        </div>
      </div>
      <button
        class="icon"
        @click="$emit('toggle-theme')"
        :aria-label="theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'"
      >
        {{ theme === "dark" ? "☀" : "☾" }}
      </button>
    </div>

    <div class="search-row">
      <label class="search">
        <span aria-hidden="true">⌕</span>
        <input
          ref="searchEl"
          v-model="q"
          type="text"
          inputmode="search"
          placeholder="Cari koin… (tekan /)"
          aria-label="Cari koin"
          autocomplete="off"
        />
        <button v-if="q" class="clear" @click="q = ''" aria-label="Hapus pencarian">✕</button>
      </label>
      <button class="refresh" :disabled="loading" @click="$emit('refresh')">
        <span :class="{ spin: loading }" aria-hidden="true">↻</span>{{ loading ? "Memuat" : "Refresh" }}
      </button>
    </div>

    <div class="chips" role="group" aria-label="Filter">
      <button
        v-for="f in filters"
        :key="f.id"
        class="chip"
        :class="{ on: filter === f.id }"
        :aria-pressed="filter === f.id"
        @click="filter = f.id"
      >
        {{ f.label }}<b>{{ f.count }}</b>
      </button>
    </div>
  </header>
</template>

<style scoped>
.top {
  position: sticky; top: 0; z-index: 5;
  padding: 12px 14px 10px;
  background: color-mix(in srgb, var(--bg1) 86%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.brand { display: flex; align-items: center; gap: 10px; }
.logo {
  display: grid; place-items: center; width: 40px; height: 40px;
  border-radius: 14px; background: var(--hero); color: var(--ink);
  font-size: 20px; font-weight: 800; box-shadow: var(--shadow);
}
h1 { margin: 0; font-size: 18px; line-height: 1.2; letter-spacing: -0.2px; }
.brand p { margin: 0; font-size: 12px; color: var(--mut); }

.search-row { display: flex; gap: 8px; }
.search {
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px;
  min-height: 44px; padding: 0 6px 0 12px;
  border: 1px solid var(--line); border-radius: 14px; background: var(--card); color: var(--mut);
}
.search:focus-within { border-color: var(--pri); box-shadow: 0 0 0 3px color-mix(in srgb, var(--pri) 22%, transparent); }
.search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--ink); font: inherit; font-size: 16px; }
.clear { width: 36px; height: 36px; border: 0; border-radius: 50%; background: transparent; color: var(--mut); }

.refresh {
  display: flex; align-items: center; gap: 6px;
  min-height: 44px; padding: 0 16px; border: 0; border-radius: 14px;
  background: var(--btn); color: var(--pri-ink); font-weight: 600;
  transition: transform 0.1s, opacity 0.2s;
}
.refresh:active { transform: scale(0.95); }
.refresh:disabled { opacity: 0.7; cursor: wait; }
.spin { display: inline-block; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.chips { display: flex; gap: 6px; margin-top: 10px; overflow-x: auto; scrollbar-width: none; }
.chip {
  flex: 1 0 auto; min-height: 40px; padding: 0 7px; white-space: nowrap;
  border: 1px solid var(--line); border-radius: 999px; background: var(--card);
  font-size: 13px; transition: all 0.2s;
}
.chip b { margin-left: 5px; font-weight: 600; opacity: 0.7; }
.chip.on { background: var(--pri); border-color: var(--pri); color: var(--pri-ink); }
</style>
