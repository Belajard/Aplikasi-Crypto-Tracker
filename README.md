# Crypto Tracker (Vue 3 + Vite)

Aplikasi mobile-first yang menampilkan daftar cryptocurrency (rank, name, symbol, price_usd)
dari API `https://api.coinlore.net/api/tickers/`.

## Cara menjalankan

Syarat: **Node.js 18 atau lebih baru** (cek dengan `node -v`).

```bash
npm install      # sekali saja, mengunduh Vue & Vite
npm run dev      # jalankan, lalu buka http://localhost:5173
```

Perintah lain:

```bash
npm run build    # membuat versi siap-publikasi di folder dist/
npm run preview  # mencoba hasil build di http://localhost:4173
```

Untuk mencoba di HP: pastikan HP dan komputer satu Wi-Fi, lalu buka alamat **Network**
yang tampil di terminal setelah `npm run dev`.

## Deploy ke GitHub Pages (GitHub Actions)

Workflow sudah tersedia di `.github/workflows/deploy.yml`. Langkahnya:

1. Buat repository baru di GitHub (misalnya `crypto-tracker`), lalu push isi folder ini:
   ```bash
   git init
   git add .
   git commit -m "Crypto Tracker"
   git branch -M main
   git remote add origin https://github.com/USERNAME/crypto-tracker.git
   git push -u origin main
   ```
2. Di GitHub buka **Settings -> Pages**, pada **Source** pilih **GitHub Actions**.
3. Buka tab **Actions** dan tunggu workflow "Deploy ke GitHub Pages" selesai (sekitar 1 menit).
   Jika belum jalan, tekan **Run workflow**.
4. Aplikasi dapat dibuka di `https://USERNAME.github.io/crypto-tracker/`.

Setiap `git push` ke branch `main` akan otomatis memperbarui situs.

## Struktur file

```
crypto-tracker/
├── index.html                    Halaman dasar; memuat src/main.js
├── package.json                  Daftar library & perintah (dev, build, preview)
├── vite.config.js                Pengaturan Vite (plugin Vue, base "./" untuk GitHub Pages)
├── .github/workflows/deploy.yml  Workflow GitHub Actions: build lalu terbitkan ke Pages
└── src/
    ├── main.js                   Titik awal: memasang App ke halaman + memuat font & CSS
    ├── App.vue                   Komponen utama: menyatukan semua bagian, mengatur state
    ├── components/
    │   ├── AppHeader.vue         Bagian atas: logo, tema, pencarian, tombol Refresh, chip filter
    │   ├── CoinRow.vue           Satu baris koin: rank, nama, simbol, price_usd, perubahan 24 jam
    │   └── CoinSheet.vue         Panel detail koin yang muncul dari bawah
    ├── composables/
    │   ├── useCoins.js           Mengambil data dari API (fetch) + menyimpan harga sebelumnya
    │   ├── useAutoRefresh.js     Refresh otomatis tiap 30 detik + hitung mundur
    │   └── usePersisted.js       Menyimpan favorit & tema di localStorage
    ├── utils/
    │   └── format.js             Format angka: 27604.54 -> "27,604.54", +1.20%, dll.
    └── assets/
        └── main.css              Warna (terang/gelap), font, gaya yang dipakai bersama
```

Alur singkatnya: `useCoins` mengambil data -> `App.vue` memfilter dan mengurutkannya
(`computed`) -> setiap koin digambar oleh `CoinRow` -> mengetuk baris membuka `CoinSheet`.

## Fitur

- Tombol **Refresh**, plus **auto-refresh** 30 detik dengan bar hitung mundur
- **Cari** nama/simbol (tekan `/` untuk fokus ke kolom cari)
- **Filter**: Semua, Favorit, Naik, Turun (24 jam)
- **Urutkan**: Rank, Nama, Harga tertinggi, Naik terbanyak
- **Favorit** (★) yang tersimpan di browser
- **Detail koin**: perubahan 1 jam / 24 jam / 7 hari, market cap, volume, tombol salin harga
- Tema **terang & gelap** (mengikuti pengaturan perangkat, bisa diganti manual)
- Harga berkedip hijau/merah lembut saat naik/turun setelah Refresh
- Animasi dimatikan otomatis bagi pengguna dengan pengaturan "reduce motion"

## Mengubah warna

Semua warna ada di bagian atas `src/assets/main.css` (blok `:root` untuk tema terang,
`[data-theme="dark"]` untuk tema gelap). Ganti nilai `--pri`, `--bg1`..`--bg3`, atau `--hero`
dan seluruh aplikasi ikut berubah.

## Jika data tidak muncul

- Periksa koneksi internet, lalu tekan **Refresh** atau **Coba lagi**.
- Buka DevTools (F12) -> tab Console/Network untuk melihat pesan error dari API.
- Jika `npm install` gagal, pastikan versi Node minimal 18.
