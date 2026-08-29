-- Jalankan ini di Supabase SQL Editor (project zenoot) SEBELUM pakai fitur Sumber Kunjungan.
-- Ini cuma NAMBAH kolom baru, tidak mengubah/menghapus data yang sudah ada.

alter table analytics_events
  add column if not exists source text;

create index if not exists analytics_events_source_idx on analytics_events(source);
