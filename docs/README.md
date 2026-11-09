# Haimiya School Dashboard

Starter project untuk dashboard IX-A.

## Isi
- Frontend HTML/CSS/JS dengan jam WITA dan highlight pelajaran aktif.
- Jadwal IX-A diambil dari file Excel 2026/2027.
- UI nilai, tabungan, belajar malam, checklist dan streak memakai localStorage pada starter ini.
- Cloudflare Worker: endpoint AI OpenAI dan alur OTP Gmail API.
- Skema Cloudflare D1.

## Penting sebelum publikasi
Data nilai/tabungan pada starter frontend masih disimpan di localStorage browser, bukan database bersama. Karena situs dipilih publik, siapa pun yang membuka browsernya bisa melihat data lokal browser tersebut, tetapi data belum tersinkron antarpengunjung. Jangan gunakan untuk data pribadi sungguhan sebelum endpoint D1 dan kebijakan akses selesai.
Alur OTP ini masih starter: setelah OTP valid, implementasikan session cookie HttpOnly + Secure + SameSite, proteksi CSRF, validasi origin, rate-limit OTP request, dan endpoint admin yang memeriksa session. Jangan aktifkan halaman admin sebagai panel produksi sebelum itu selesai. IP block berdasarkan IP saja bisa berdampak ke pengguna lain di jaringan bersama.
Gmail API memerlukan OAuth Client ID, Client Secret, Refresh Token, serta ADMIN_EMAIL. Simpan semuanya sebagai Worker secrets, bukan di frontend.
Backup D1 perlu dijadwalkan melalui Cloudflare scheduled worker dan diuji pemulihannya.

## Deploy ringkas
1. Buat repo GitHub lalu push isi folder.
2. Buat Cloudflare D1 database dan jalankan `database/schema.sql`.
3. Isi `database_id` di `worker/wrangler.toml`.
4. Pasang Worker secrets: `OPENAI_API_KEY`, `OPENAI_MODEL`, `ADMIN_EMAIL`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`.
5. Deploy Worker dengan Wrangler.
6. Hubungkan folder `frontend` ke Cloudflare Pages. Atur route `/api/*` ke Worker atau gunakan Pages Functions/proxy yang sesuai.
7. Ganti `APP_ORIGIN` dan tambahkan CORS allowlist yang hanya mengizinkan domain produksi.

## Catatan jadwal
Jam pada jadwal menggunakan WITA (Asia/Makassar), sesuai lokasi sekolah Wakatobi. Nama guru ditampilkan tanpa gelar.
