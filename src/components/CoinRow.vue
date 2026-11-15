<script setup>
import { money, pct, arrow, tone, hue } from "../utils/format.js";

defineProps({
  coin: Object,
  trend: String,       // "up" | "down" | "" -> menentukan warna kedip harga
  favorite: Boolean,
});
defineEmits(["open", "toggle"]);
</script>

<template>
  <li class="row" tabindex="0" @click="$emit('open')" @keydown.enter="$emit('open')">
    <span class="rank">{{ coin.rank }}</span>
    <span class="avatar" :style="{ '--h': hue(coin.symbol) }" aria-hidden="true">{{ coin.symbol.slice(0, 4) }}</span>

    <span class="name">
      <b>{{ coin.symbol }}</b>
      <small>{{ coin.name }}</small>
    </span>

    <span class="price">
      <!-- :key berubah saat harga berubah -> animasi kedip diputar ulang -->
      <b :key="coin.price_usd" :class="trend">{{ money(coin.price_usd) }}</b>
      <small :class="tone(coin.percent_change_24h)">
        USD · {{ arrow(coin.percent_change_24h) }} {{ pct(coin.percent_change_24h) }}
      </small>
    </span>

    <button
      class="star"
      :class="{ on: favorite }"
      :aria-pressed="favorite"
      :aria-label="(favorite ? 'Hapus dari favorit: ' : 'Tambah ke favorit: ') + coin.name"
      @click.stop="$emit('toggle')"
    >
      {{ favorite ? "★" : "☆" }}
    </button>
  </li>
</template>

<style scoped>
.row {
  display: grid; grid-template-columns: 26px 44px 1fr auto 44px; align-items: center; gap: 10px;
  min-height: 68px; margin-bottom: 8px; padding: 8px 4px 8px 12px;
  border: 1px solid var(--line); border-radius: 18px; background: var(--card);
  box-shadow: var(--shadow); cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.row:hover { transform: translateY(-1px); }
.row:active { transform: scale(0.985); }

.rank { text-align: center; font-size: 13px; font-weight: 600; color: var(--mut); }
.name b { display: block; font-size: 17px; line-height: 1.2; }
.name small, .price small { font-size: 12px; color: var(--mut); }
.price { text-align: right; }
.price b { display: inline-block; padding: 0 4px; border-radius: 6px; font-size: 16px; font-variant-numeric: tabular-nums; }
.price small { display: block; }

.price b.up   { animation: flash-up 1.2s; }
.price b.down { animation: flash-down 1.2s; }
@keyframes flash-up   { from { background: var(--upbg);   color: var(--up); } }
@keyframes flash-down { from { background: var(--downbg); color: var(--down); } }

.star { width: 44px; height: 44px; border: 0; background: transparent; font-size: 22px; color: var(--mut); transition: transform 0.2s; }
.star.on { color: var(--star); }
.star:active { transform: scale(1.3) rotate(15deg); }
</style>
