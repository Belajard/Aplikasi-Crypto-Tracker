import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  // base "./" -> semua file dimuat lewat alamat relatif, jadi hasil build bisa
  // berjalan di GitHub Pages (username.github.io/nama-repo/) tanpa menyebut nama repo.
  base: "./",
  // host: true -> bisa dibuka dari HP lewat Wi-Fi yang sama (alamat "Network" di terminal)
  server: { host: true },
});
