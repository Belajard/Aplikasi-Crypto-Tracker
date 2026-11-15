// Fungsi kecil untuk mengubah data mentah API menjadi teks yang enak dibaca.

// 27604.54 -> "27,604.54" | 0.999867 -> "0.999867"
export const money = (v) =>
  Number(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: Number(v) < 1 ? 6 : 2,
  });

// 540000000000 -> "$540B"
export const compact = (v) =>
  "$" + new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(Number(v) || 0);

// "-3.2" -> "-3.20%" | "1.5" -> "+1.50%"
export const pct = (v) => (Number(v) > 0 ? "+" : "") + Number(v).toFixed(2) + "%";

export const arrow = (v) => (Number(v) > 0 ? "▲" : Number(v) < 0 ? "▼" : "•");

// Nama kelas warna: hijau (pos) untuk naik, merah lembut (neg) untuk turun
export const tone = (v) => (Number(v) > 0 ? "pos" : Number(v) < 0 ? "neg" : "");

// Setiap simbol mendapat rona warna tetap (dipakai untuk avatar pastel)
export const hue = (symbol) => [...symbol].reduce((a, ch) => a + ch.charCodeAt(0) * 31, 7) % 360;
