-- Mantener la portada del artista en sus canciones al reemplazarla.
begin;
create schema if not exists andromeda_internal;
revoke all on schema andromeda_internal from public,anon,authenticated;
create function andromeda_internal.sync_artist_cover()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 if new.image is distinct from old.image then
  update public.music_songs set image=new.image,revision=revision+1 where artist_id=new.id;
 end if;
 return new;
end;
$$;
revoke all on function andromeda_internal.sync_artist_cover() from public,anon,authenticated;
create trigger sync_artist_cover after update of image on public.music_artists for each row execute function andromeda_internal.sync_artist_cover();
commit;
