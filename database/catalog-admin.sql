-- Catálogo público y permisos de administración.
begin;
create table public.catalog_admins (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.catalog_admins enable row level security;
revoke all on public.catalog_admins from anon, authenticated;
grant select on public.catalog_admins to authenticated;
create policy "Consultar mi permiso de administración" on public.catalog_admins for select to authenticated using (user_id = (select auth.uid()));

create table public.music_artists (
 id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
 name text not null check (length(btrim(name)) between 1 and 160),
 genre text not null default 'Artista ANDROMEDA',
 universe text not null check (universe in ('rock','pop','electronic','hiphop','celestial','aurora')),
 image text not null check (image ~ '^(https://|assets/)'),
 bio text not null default '' check (length(bio)<=3000),
 tags text[] not null default '{}',
 sort_order integer not null default 1000,
 revision integer not null default 1,
 created_at timestamptz not null default now()
);
create unique index music_artists_name_key on public.music_artists (lower(btrim(name)));
create table public.music_songs (
 id uuid primary key default gen_random_uuid(),
 artist_id text not null references public.music_artists(id),
 title text not null check (length(btrim(title)) between 1 and 240),
 artist text not null check (length(btrim(artist)) between 1 and 240),
 genre text not null check (genre in ('rock','pop','electronic','hiphop','celestial','aurora')),
 theme_tags text[] not null default '{}',
 audio text not null check (audio ~ '^(https://|Canciones/)'),
 image text not null check (image ~ '^(https://|assets/)'),
 status text not null default 'draft' check (status in ('draft','published')),
 sort_order integer not null default 1000,
 revision integer not null default 1,
 normalized_title text generated always as (regexp_replace(lower(translate(title,'ÁÉÍÓÚÜÑáéíóúüñ','AEIOUUNaeiouun')), '[^a-z0-9]', '', 'g')) stored,
 created_at timestamptz not null default now(),
 unique(artist_id, normalized_title),
 unique(audio)
);
create index music_songs_artist_idx on public.music_songs(artist_id);
create index music_songs_public_idx on public.music_songs(status,sort_order);
alter table public.music_artists enable row level security;
alter table public.music_songs enable row level security;
revoke all on public.music_artists,public.music_songs from anon,authenticated;
grant select on public.music_artists,public.music_songs to anon,authenticated;
grant insert,update,delete on public.music_artists,public.music_songs to authenticated;
create policy "Consultar artistas" on public.music_artists for select to anon,authenticated using (true);
create policy "Administrar artistas" on public.music_artists for all to authenticated
 using ((select exists(select 1 from public.catalog_admins where user_id=(select auth.uid()))))
 with check ((select exists(select 1 from public.catalog_admins where user_id=(select auth.uid()))));
create policy "Consultar canciones publicadas" on public.music_songs for select to anon,authenticated using (status='published');
create policy "Administrar canciones" on public.music_songs for all to authenticated
 using ((select exists(select 1 from public.catalog_admins where user_id=(select auth.uid()))))
 with check ((select exists(select 1 from public.catalog_admins where user_id=(select auth.uid()))));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('andromeda-audio','andromeda-audio',true,26214400,array['audio/mpeg','audio/mp4','audio/ogg','audio/wav','audio/x-wav','audio/flac','audio/x-flac']),
 ('andromeda-covers','andromeda-covers',true,5242880,array['image/jpeg','image/png','image/webp']);
create policy "Admin consultar archivos del catálogo" on storage.objects for select to authenticated
 using (bucket_id in ('andromeda-audio','andromeda-covers') and (select exists(select 1 from public.catalog_admins where user_id=(select auth.uid()))));
create policy "Admin subir archivos del catálogo" on storage.objects for insert to authenticated
 with check (bucket_id in ('andromeda-audio','andromeda-covers') and (select exists(select 1 from public.catalog_admins where user_id=(select auth.uid()))));
create policy "Admin borrar archivos del catálogo" on storage.objects for delete to authenticated
 using (bucket_id in ('andromeda-audio','andromeda-covers') and (select exists(select 1 from public.catalog_admins where user_id=(select auth.uid()))));
commit;
