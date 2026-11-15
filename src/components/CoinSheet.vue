<script setup>
import { computed } from "vue";
import { money, compact, pct, arrow, tone, hue } from "../utils/format.js";

const props = defineProps({
  coin: Object,
  open: Boolean,
  favorite: Boolean,
});
defineEmits(["close", "toggle", "copy"]);

const changes = computed(() =>
  props.coin
    ? [
        ["1 jam", props.coin.percent_change_1h],
        ["24 jam", props.coin.percent_change_24h],
        ["7 hari", props.coin.percent_change_7d],
      ]
    : [],
);
</script>

<template>
  <Transition name="sheet">
    <div v-if="open && coin" class="overlay" @click.self="$emit('close')">
      <section class="panel" role="dialog" aria-modal="true" :aria-label="'Detail ' + coin.name">
        <div class="grab"></div>

        <div class="head">
          <span class="avatar big-avatar" :style="{ '--h': hue(coin.symbol) }" aria-hidden="true">{{ coin.symbol.slice(0, 4) }}</span>
          <div>
            <h2>{{ coin.name }}</h2>
            <p>{{ coin.symbol }} · Rank #{{ coin.rank }}</p>
          </div>
          <button class="icon" @click="$emit('close')" aria-label="Tutup">✕</button>
        </div>

        <div class="hero">
          <small>Harga saat ini</small>
          <div class="big">{{ money(coin.price_usd) }} <span>USD</span></div>
        </div>

        <div class="pills">
          <div class="pill" v-for="[label, value] in changes" :key="label">
            <small>{{ label }}</small>
            <b :class="tone(value)">{{ arrow(value) }} {{ pct(value) }}</b>
          </div>
        </div>

        <dl class="stats">
          <div><dt>Market cap</dt><dd>{{ compact(coin.market_cap_usd) }}</dd></div>
          <div><dt>Volume 24 jam</dt><dd>{{ compact(coin.volume24) }}</dd></div>
          <div><dt>Harga dalam BTC</dt><dd>{{ coin.price_btc }}</dd></div>
          <div><dt>Suplai beredar</dt><dd>{{ compact(coin.csupply).slice(1) }} {{ coin.symbol }}</dd></div>
        </dl>

        <div class="actions">
          <button class="btn" @click="$emit('toggle')">{{ favorite ? "★ Difavoritkan" : "☆ Favorit" }}</button>
          <button class="btn pri" @click="$emit('copy', coin.price_usd)">Salin harga</button>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.overlay { position: fixed; inset: 0; z-index: 20; display: flex; align-items: flex-end; justify-content: center; background: rgba(35, 28, 18, 0.45); }
.panel {
  width: 100%; max-width: 480px; max-height: 90dvh; overflow: auto;
  padding: 10px 18px calc(18px + env(safe-area-inset-bottom));
  border-radius: 26px 26px 0 0; background: var(--card);
}
.grab { width: 40px; height: 4px; margin: 0 auto 12px; border-radius: 2px; background: var(--line); }

.head { display: flex; align-items: center; gap: 12px; }
.head h2 { margin: 0; font-size: 20px; line-height: 1.2; }
.head p { margin: 0; font-size: 13px; color: var(--mut); }
.head .icon { margin-left: auto; }
.big-avatar { width: 52px; height: 52px; font-size: 13px; }

.hero { margin: 14px 0 10px; padding: 14px 16px; border-radius: 20px; background: var(--hero); }
.hero small { font-size: 12px; color: var(--mut); }
.big { font-size: 34px; font-weight: 700; line-height: 1.2; letter-spacing: -0.5px; font-variant-numeric: tabular-nums; }
.big span { font-size: 14px; font-weight: 500; color: var(--mut); letter-spacing: 0; }

.pills { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.pill { padding: 10px; border-radius: 14px; background: var(--chip); text-align: center; }
.pill small { display: block; font-size: 12px; color: var(--mut); }
.pill b { font-size: 15px; }

.stats { margin: 14px 0; }
.stats div { display: flex; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid var(--line); font-size: 15px; }
.stats dt { color: var(--mut); }
.stats dd { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; }

.actions { display: flex; gap: 10px; }
.actions .btn { flex: 1; }

/* Animasi: latar memudar, panel naik dari bawah */
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.25s; }
.sheet-enter-active .panel, .sheet-leave-active .panel { transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .panel, .sheet-leave-to .panel { transform: translateY(100%); }
</style>
