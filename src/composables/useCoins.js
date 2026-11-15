import { ref } from "vue";

// Alamat API dari soal. limit=100 -> 100 koin teratas.
const API = "https://api.coinlore.net/api/tickers/?start=0&limit=100";

// Mengurus semua hal tentang pengambilan data koin.
export function useCoins() {
  const coins = ref([]); // data terbaru dari API
  const prev = ref({}); // harga sebelumnya { id: harga }, untuk efek naik/turun
  const loading = ref(false);
  const error = ref("");
  const updatedAt = ref(null);

  // Mengembalikan true (berhasil), false (gagal), atau null (sedang memuat)
  async function load() {
    if (loading.value) return null;
    loading.value = true;
    error.value = "";
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { data } = await res.json();
      prev.value = Object.fromEntries(coins.value.map((c) => [c.id, Number(c.price_usd)]));
      coins.value = data;
      updatedAt.value = new Date();
      return true;
    } catch (e) {
      error.value = e.message;
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { coins, prev, loading, error, updatedAt, load };
}
