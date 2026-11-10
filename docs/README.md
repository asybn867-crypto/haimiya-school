# Haimiya School Dashboard

## Isi
- Frontend HTML/CSS/JS untuk jadwal IX-A, nilai, tabungan, belajar malam, checklist, dan asisten AI.
- Jadwal sekolah ditampilkan dari `frontend/js/schedule-data.js`.
- Nilai, tabungan, dan aktivitas belajar pada starter frontend masih disimpan di localStorage browser, bukan database bersama.
- Cloudflare Worker menyediakan login admin, pemeriksaan sesi, logout, dan endpoint AI.
- Cloudflare KV binding `STORE` menyimpan percobaan login, blokir sementara, sesi admin, dan penghitung permintaan AI.
- Skema D1 tersedia, tetapi belum terhubung ke Worker saat ini.

## Keamanan yang diterapkan di kode
- Login admin memakai Worker Secrets `ADMIN_USERNAME` dan `ADMIN_PASSWORD`; jangan pernah menaruh kredensial di frontend atau Git.
- Setelah 3 kegagalan login dalam jendela 15 menit, IP dan pasangan IP/username diblokir sementara. Durasi meningkat 15 menit, 1 jam, lalu 24 jam.
- Sesi admin memakai token acak yang hanya disimpan dalam bentuk hash di KV dan dikirim ke browser melalui cookie HttpOnly, Secure, SameSite=None, Partitioned, Path=/api/admin, dengan masa berlaku 8 jam.
- Endpoint admin memeriksa Origin dan sesi di backend. CORS hanya mengizinkan APP_ORIGIN.
- Endpoint AI membatasi panjang pesan dan menerapkan penghitung permintaan 30 pesan per IP per menit.
- Cloudflare Pages memakai security headers dan Content Security Policy dari `frontend/_headers`.
- Request body login dan AI dibatasi berdasarkan ukuran aktual, bukan hanya Content-Length.

## Batasan yang masih perlu diperhatikan
- Penghitung KV adalah mitigasi dasar, bukan rate limiter atomik. KV bersifat eventually consistent sehingga request paralel atau perpindahan lokasi edge dapat melewati batas. Pasang Cloudflare WAF/Rate Limiting Rules untuk endpoint `/api/admin/login` dan `/api/ai` sebagai lapisan tambahan.
- Cookie lintas-origin memakai SameSite=None. Browser yang memblokir third-party cookies dapat menolak sesi jika frontend dan API berada pada site berbeda. Untuk keandalan terbaik, gunakan custom domain dalam satu site atau proxy API melalui Pages Functions dengan origin yang sama.
- APP_ORIGIN di wrangler.toml harus sama persis dengan origin frontend yang benar-benar dipakai pengunjung. Jangan menambahkan slash di akhir.
- Tidak ada MFA/2FA. Tambahkan sebelum menyimpan data yang sensitif atau membuka panel ke banyak admin.
- Admin dashboard saat ini hanya menampilkan ringkasan dan jadwal; belum ada endpoint pengelolaan data admin.
- Nilai dan tabungan masih localStorage. Data itu bukan privat dari orang lain yang memakai browser/perangkat yang sama dan tidak tersinkron antarpengunjung.
- D1 schema dan audit_log belum dipakai oleh Worker. Jangan menganggap audit log atau database sudah aktif.
- IP blocking dapat memengaruhi orang lain yang memakai jaringan publik/NAT yang sama.

## Konfigurasi Cloudflare
Pastikan Worker mempunyai:
- KV binding bernama `STORE` dengan namespace yang sesuai dengan ID di `worker/wrangler.toml`.
- Workers AI binding bernama `AI`.
- Worker Secrets: `ADMIN_USERNAME` dan `ADMIN_PASSWORD`.
- Variable `APP_ORIGIN` yang cocok dengan domain frontend.

Gunakan password admin unik dan panjang. Jika password lama pernah dipakai di layanan lain atau pernah dibagikan, ganti sebelum deploy.

## Deploy
1. Pastikan repository terhubung ke Cloudflare Pages dan Worker.
2. Pastikan binding KV `STORE` dan Workers AI `AI` aktif di Worker production.
3. Tambahkan Worker Secrets `ADMIN_USERNAME` dan `ADMIN_PASSWORD`.
4. Verifikasi `APP_ORIGIN` pada `worker/wrangler.toml`.
5. Deploy Worker dan tunggu status deployment sukses.
6. Deploy Cloudflare Pages dari folder `frontend`.
7. Uji login, refresh dashboard, logout, tiga percobaan password salah, dan endpoint AI.

## Catatan jadwal
Jam pada jadwal menggunakan WITA (Asia/Makassar), sesuai lokasi sekolah Wakatobi.
