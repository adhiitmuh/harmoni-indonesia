# Harmoni Indonesia — Portal & aturan kerja lintas aplikasi

Portal login semua aplikasi Harmoni (Firebase project `harmoni-indonesia`). Repo ini juga memegang
**Firestore rules bersama** (`firestore.rules`) — di-deploy otomatis oleh GitHub Actions saat push ke main.

## Aturan kerja (dari Owner — wajib)
- Push langsung ke `main` di tiap repo (GitHub Pages langsung live).
- Jangan edit Firestore rules di Console — ubah `firestore.rules` di repo, CI yang deploy.
- Jangan pernah menempel secret key di chat; jangan commit data bank pribadi.
- Jangan cantumkan identitas model di commit. Trailer commit sesuai instruksi sistem sesi.
- Tidak ada WA otomatis (tanpa Fonnte). Hanya link WA manual yang ditekan user (`api.whatsapp.com/send`, bukan `wa.me` — emoji rusak).
- Data khusus Owner hanya boleh terlihat Owner.
- Claude tidak menulis data Firebase milik user — user yang melakukan aksi data lewat UI.
- Bahasa UI & komunikasi: Bahasa Indonesia, sapaan "Bapak". Semua fitur harus nyaman di HP, tablet & komputer.
- Uji UI dengan Playwright (stub Firebase) sebelum push; laporkan hasil apa adanya.

## Aplikasi & repo
| App | Repo | Firebase project | Catatan |
|---|---|---|---|
| Portal | harmoni-indonesia | harmoni-indonesia | login, `users/{uid}` (role, `apps.<key>.akses/role`) |
| Custom Order | custom-order-harmoni | harmoni-custom-order | punya CLAUDE.md sendiri |
| YH Sistem Produksi | yh-sistem-produksi | yh-sistem-produksi | konveksi, katalog kain; CLAUDE.md sendiri |
| Stok Manager | harmoni-stok-manager | harmoni-stok (data) + harmoni-indonesia (auth) | CLAUDE.md sendiri |
| Analitik Penjualan | harmoni-analitik-penjualan | harmoni-indonesia | CLAUDE.md sendiri |
| Barcode, Laporan Keuangan, dll | repo masing-masing | — | |

Kunci app di `users.apps`: `yhk`, `harmoni_stok`, `harmoni_analitik`, `custom_order`, …
Owner (`role:'owner'`) selalu boleh semua.

## Data bersama di project harmoni-indonesia (`settings/*`)
- `stok_fisik` `{toko:{SKU:qty}, gudang:{SKU:qty}, *_updated_at/by}` — stok dipakai Analitik & Stok Manager (dua arah).
- `modal_produk` `{m:{SKU:modal}, s:{SKU:supplierUtama}, sup:{nama:{lama,wa}}, h:{SKU:{SUP:[harga,tgl,kualitas,jenis]}}}` — ditulis Stok Manager, dibaca Analitik.
- `final_order` `{m:{SKU:qty}}` — Final Order Rekomendasi Stok (Analitik), sama di semua perangkat.
- `penjualan` (Owner/Admin) & `penjualan_operator` (ringkasan bulanan per SKU, dibaca Stok Manager untuk "laku/bln").
