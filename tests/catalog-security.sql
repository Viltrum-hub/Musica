-- Ejecutar en SQL Editor. Todas las pruebas se revierten al finalizar.
begin;
insert into public.music_songs(artist_id,title,artist,genre,audio,image,status) values ('eminem','__ANDROMEDA_RLS_TEST__','Eminem','hiphop','https://example.com/andromeda-test.mp3','assets/universe-electronic-v2.webp','draft');
set local role anon;
do $$ begin
 if (select count(*) from public.music_songs where title='__ANDROMEDA_RLS_TEST__') <> 0 then raise exception 'Anonymous draft visibility failed'; end if;
 begin
  insert into public.music_songs(artist_id,title,artist,genre,audio,image) values ('eminem','__DENIED__','Eminem','hiphop','https://example.com/denied.mp3','assets/universe-electronic-v2.webp');
  raise exception 'Anonymous write unexpectedly succeeded';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin perform set_config('request.jwt.claims',jsonb_build_object('sub',(select id from auth.users where id not in(select user_id from public.catalog_admins) limit 1),'role','authenticated','user_metadata',jsonb_build_object('role','admin'),'app_metadata',jsonb_build_object('role','admin'))::text,true);end $$;
set local role authenticated;
do $$ declare n integer; begin
 if auth.uid() is null then raise exception 'Need a registered non-admin for this test';end if;
 if (select count(*) from public.music_songs where title='__ANDROMEDA_RLS_TEST__') <> 0 then raise exception 'Normal user can read draft'; end if;
 begin
  insert into public.catalog_admins(user_id) values ((select auth.uid()));
  raise exception 'User escalated own privileges';
 exception when insufficient_privilege then null; end;
 update public.music_songs set title='__DENIED__' where title='Mockingbird';get diagnostics n=row_count;
 if n>0 then raise exception 'Normal user updated catalog'; end if;
 begin
  insert into storage.objects(bucket_id,name) values ('andromeda-audio','__denied__/test.mp3');
  raise exception 'Normal user uploaded catalog media';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into public.catalog_admins(user_id) select (current_setting('request.jwt.claims')::jsonb->>'sub')::uuid;
set local role authenticated;
do $$ begin
 if (select count(*) from public.music_songs where title='__ANDROMEDA_RLS_TEST__') <> 1 then raise exception 'Admin cannot see draft'; end if;
 update public.music_songs set title='__ANDROMEDA_ADMIN_EDIT__' where title='__ANDROMEDA_RLS_TEST__';
 if not found then raise exception 'Admin write denied'; end if;
 update public.music_artists set image='https://example.com/andromeda-artist.webp' where id='eminem';
 if exists(select 1 from public.music_songs where artist_id='eminem' and image<>'https://example.com/andromeda-artist.webp') then raise exception 'Artist cover sync failed'; end if;
 insert into storage.objects(bucket_id,name) values ('andromeda-audio','__test__/admin.mp3');
 begin
  insert into public.music_songs(artist_id,title,artist,genre,audio,image) values ('eminem',' MÓCKINGBIRD! ','Eminem','hiphop','https://example.com/dupe.mp3','assets/universe-electronic-v2.webp');
  raise exception 'Duplicate title accepted';
 exception when unique_violation then null; end;
 delete from public.music_songs where title='__ANDROMEDA_ADMIN_EDIT__';
end $$;
reset role;
rollback;
select 'Passed: public read, drafts private, anonymous/user write denial, forged role denial, self-promotion denial, admin CRUD, storage upload RLS, cover sync, duplicate rejection; rolled back' as tests;
