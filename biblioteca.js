/* SONORA Library: the existing account and Supabase tables are the source of truth. */
(() => {
  const account = () => window.sonoraAccount;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const key = song => [song.title,song.artist,song.audio].join('|');
  let root, playlists = [], favorites = [], catalog = [], following = [], loadedUser = null;
  let tab = 'favorites', selected = null, search = '', generation = 0, loading = false, loadError = '';
  let editing = null, pickerPlaylist = null, busy = false, catalogPromise;
  let queue = [], position = 0, ownedSource = '';
  const audio = () => document.getElementById('audioPlayer');
  const ownsAudio = () => window.sonoraPlaybackOwner === 'biblioteca' && ownedSource && audio()?.src === ownedSource;
  const status = message => { if (root?.isConnected) root.querySelector('.sl-status').textContent = message; };
  const report = error => error?.code === '23505' ? 'Esta canción ya está en la playlist.' : 'No se pudo guardar el cambio. Inténtalo de nuevo.';
  const songAttrs = song => `data-title="${esc(song.title)}" data-artist="${esc(song.artist)}" data-audio="${esc(song.audio)}" data-image="${esc(song.image)}" data-genre="${esc(song.genre)}"`;
  const imageURL = image => {
    // Saved values must remain URLs, never HTML or script content.
    try { const url = new URL(image || '', document.baseURI); return ['http:','https:'].includes(url.protocol) && image ? image : 'assets/universe-electronic-v2.webp'; } catch { return 'assets/universe-electronic-v2.webp'; }
  };
  const mosaic = songs => {
    const covers = [...new Set(songs.map(song=>song.image).filter(Boolean))].slice(0,4);
    if (!covers.length) return '<div class="sl-mosaic"><span class="sl-mosaic-empty"><i class="bi bi-music-note-beamed" aria-hidden="true"></i></span></div>';
    while(covers.length > 1 && covers.length < 4) covers.push(covers[covers.length%2]);
    return `<div class="sl-mosaic">${covers.map(cover=>`<img src="${esc(imageURL(cover))}" alt="" loading="lazy">`).join('')}</div>`;
  };
  const countLabel = count => `${count} ${count===1?'canción':'canciones'}`;
  function playlistCard(playlist) {
    const songs = playlist.playlist_songs || [];
    return `<article class="sl-playlist">${mosaic(songs)}<div class="sl-playlist-footer"><div class="sl-playlist-copy"><button type="button" data-library-open="${esc(playlist.id)}">${esc(playlist.name)}</button><p>Playlist · ${countLabel(songs.length)}</p></div><button type="button" class="sl-icon sl-round-play" data-library-playlist="${esc(playlist.id)}" ${songs.length?'':'disabled'} aria-label="Reproducir ${esc(playlist.name)}"><i class="bi bi-play-fill"></i></button><button type="button" class="sl-icon" data-library-open="${esc(playlist.id)}" aria-label="Abrir ${esc(playlist.name)}"><i class="bi bi-three-dots-vertical"></i></button></div></article>`;
  }
  function track(song, index, kind) {
    const favorite = kind === 'favorites' ? '<button type="button" class="favorite-song-btn is-favorite" aria-label="Quitar de favoritos" aria-pressed="true"><i class="bi bi-heart-fill"></i></button>' : '';
    const remove = kind === 'playlist' ? `<button type="button" class="sl-icon" data-library-remove="${esc(song.id)}" aria-label="Quitar ${esc(song.title)} de esta playlist"><i class="bi bi-dash-lg"></i></button>` : '';
    return `<article class="sl-track ${kind==='favorites'?'explore-song-card':''}" ${songAttrs(song)} data-library-source="${esc(song.audio)}"><img src="${esc(imageURL(song.image))}" alt="" loading="lazy"><div class="sl-track-copy"><h3>${esc(song.title)}</h3><p>${esc(song.artist)}</p></div><span class="sl-track-genre">${esc(song.genre)}</span>${favorite}<button type="button" class="sl-icon" data-library-track="${index}" data-library-kind="${kind}" aria-label="Reproducir ${esc(song.title)}"><i class="bi bi-play-fill"></i></button>${remove}</article>`;
  }
  const empty = (icon,title,copy,action='') => `<div class="sl-empty"><i class="bi bi-${icon}" aria-hidden="true"></i><h2>${title}</h2><p>${copy}</p>${action}</div>`;
  function updateProfile() {
    const count = document.getElementById('profilePlaylists'), songs = document.getElementById('profileSongs'), rows = document.querySelector('.sl-profile-rows');
    if (count) count.textContent = String(playlists.length);
    const favoriteCount = document.getElementById('profileFavorites');
    if (favoriteCount) favoriteCount.textContent = String(favorites.length);
    if (songs) songs.textContent = String(new Set([...favorites,...playlists.flatMap(p=>p.playlist_songs||[])].map(s=>s.audio)).size);
    if (rows) rows.innerHTML = playlists.length ? playlists.slice(0,3).map(p=>`<a class="sl-profile-row" href="index.html?page=biblioteca&playlist=${encodeURIComponent(p.id)}" data-page="biblioteca" data-playlist-id="${esc(p.id)}"><i class="bi bi-music-note-list"></i><div><strong>${esc(p.name)}</strong><span>${countLabel((p.playlist_songs||[]).length)}</span></div></a>`).join('') : `<p class="sl-profile-note">${loadError?'No pudimos cargar tus playlists. Abre Biblioteca para reintentar.':'Crea tu primera playlist en Biblioteca y aparecerá aquí.'}</p>`;
  }
  async function refresh() {
    const user = account()?.user, ticket = ++generation;
    if (!user) { loadedUser = null; playlists=[]; favorites=[]; loading=false; loadError=''; updateProfile(); render(); return; }
    if (loadedUser !== user.id) { playlists=[]; favorites=[]; }
    loading=true; loadError=''; render();
    try {
      const results = await Promise.all([
        account().client.from('playlists').select('id,name,description,created_at,playlist_songs(id,song_key,title,artist,audio,image,genre,added_at)').eq('user_id',user.id).order('created_at',{ascending:false}),
        account().client.from('favorites').select('id,song_key,title,artist,audio,image,genre,created_at').eq('user_id',user.id).order('created_at',{ascending:false})
      ]);
      if (ticket !== generation || account()?.user?.id !== user.id) return;
      for (const result of results) if (result.error) throw result.error;
      playlists=(results[0].data||[]).map(p=>({...p,playlist_songs:(p.playlist_songs||[]).sort((a,b)=>String(a.added_at).localeCompare(String(b.added_at))||a.id-b.id)}));
      favorites=results[1].data||[]; loadedUser=user.id;
    } catch (error) {
      if(ticket!==generation) return;
      loadError='No pudimos cargar tu biblioteca. Revisa tu conexión y vuelve a intentar.';
      console.error('SONORA Biblioteca:',error);
    } finally {
      if(ticket===generation){loading=false;updateProfile();render();}
    }
  }
  async function loadCatalog() {
    if(catalogPromise) return catalogPromise;
    catalogPromise=(async()=>{
      const response=await fetch('explorar.html');if(!response.ok)throw new Error('Catálogo no disponible');
      const doc=new DOMParser().parseFromString(await response.text(),'text/html');
      catalog=[...doc.querySelectorAll('.explore-song-card[data-audio]')].map(card=>({...card.dataset}));
      catalog=[...new Map(catalog.map(song=>[song.audio,song])).values()];
      const artistsResponse=await fetch('artistas.html?v=premium-1');if(!artistsResponse.ok)throw new Error('Artistas no disponibles');
      const artistsDoc=new DOMParser().parseFromString(await artistsResponse.text(),'text/html');
      following=[...artistsDoc.querySelectorAll('.artist-catalog-card')].map(card=>({id:card.dataset.artistId,name:card.querySelector('h3')?.textContent||'',image:card.querySelector('img')?.getAttribute('src')||'',genre:card.querySelector('.artist-catalog-info>span')?.textContent||'Artista SONORA'}));
    })().catch(error=>{catalogPromise=null;throw error});
    return catalogPromise;
  }
  function render() {
    if(!root?.isConnected)return;
    const panel=root.querySelector('.sl-panel');panel.setAttribute('aria-labelledby',`sl-tab-${tab}`);panel.setAttribute('aria-busy',String(loading));
    root.querySelectorAll('[data-library-tab]').forEach(button=>{const active=button.dataset.libraryTab===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    if(tab==='following') {
      let saved=[];try{saved=JSON.parse(localStorage.getItem('sonora-followed-artists')||'[]');}catch{}
      const artists=following.filter(artist=>Array.isArray(saved)&&saved.includes(artist.id));
      panel.innerHTML=`<div class="sl-section-heading"><h2>Artistas que sigues</h2><span>${artists.length} artistas</span></div>`+(artists.length?`<div class="sl-follow-grid">${artists.map(artist=>`<a href="index.html?page=artistas&artist=${encodeURIComponent(artist.id)}" data-page="artistas" data-artist-id="${esc(artist.id)}" class="sl-follow-card"><img src="${esc(imageURL(artist.image))}" alt="${esc(artist.name)}"><h3>${esc(artist.name)}</h3><p>${esc(artist.genre)}</p></a>`).join('')}</div>`:empty('people','Encuentra tu próximo artista favorito','Sigue artistas desde sus perfiles para reunirlos aquí.','<a class="sl-button" href="index.html?page=artistas" data-page="artistas">Explorar artistas <i class="bi bi-arrow-right"></i></a>'));
      return;
    }
    if(!account()?.user) { panel.innerHTML=empty('collection','Tu música merece su propio espacio','Inicia sesión para guardar tus favoritos y crear playlists que te acompañen en cada visita.','<button type="button" class="sl-button" data-library-login>Iniciar sesión <i class="bi bi-arrow-right"></i></button>');return; }
    if(loadError){panel.innerHTML=empty('cloud-slash','Tu colección sigue a salvo',loadError,'<button type="button" class="sl-button" data-library-retry>Reintentar</button>');return;}
    if(loading&&!loadedUser){panel.innerHTML=empty('cloud-arrow-down','Abriendo tu universo','Estamos recuperando tus playlists y favoritos.');return;}
    const playlist=playlists.find(p=>p.id===selected);
    if(selected&&playlist) {
      const songs=playlist.playlist_songs||[];
      panel.innerHTML=`<button type="button" class="sl-text-button sl-detail-back" data-library-back><i class="bi bi-arrow-left"></i> Todas mis playlists</button><section class="sl-detail-header">${mosaic(songs)}<div class="sl-detail-copy"><p class="sl-eyebrow">PLAYLIST · SOLO PARA TI</p><h2>${esc(playlist.name)}</h2><p>${esc(playlist.description||'Una selección con tu propia identidad.')}</p><span class="sl-eyebrow">${countLabel(songs.length)}</span><div class="sl-detail-actions"><button type="button" class="sl-button" data-library-playlist="${esc(playlist.id)}" ${songs.length?'':'disabled'}><i class="bi bi-play-fill"></i> Escuchar</button><button type="button" class="sl-button sl-secondary" data-library-picker="${esc(playlist.id)}"><i class="bi bi-plus-lg"></i> Añadir canciones</button><button type="button" class="sl-button sl-secondary" data-library-edit="${esc(playlist.id)}">Editar</button><button type="button" class="sl-button sl-danger" data-library-delete="${esc(playlist.id)}">Eliminar</button></div></div></section><div class="sl-section-heading"><h2>Dentro de tu playlist</h2><span>${countLabel(songs.length)}</span></div>`+(songs.length?`<div class="sl-track-list">${songs.map((song,i)=>track(song,i,'playlist')).join('')}</div>`:empty('music-note-list','El comienzo de una buena selección','Añade canciones de Explorar para darle vida a tu playlist.',`<button type="button" class="sl-button" data-library-picker="${esc(playlist.id)}">Elegir canciones</button>`));
      syncPlayback();return;
    }
    let html=`<div class="sl-section-heading"><h2>${tab==='playlists'?'Tus playlists':'Hechas por ti'}</h2>${tab==='favorites'&&playlists.length>2?'<button type="button" class="sl-text-button" data-library-tab="playlists">Ver todas <i class="bi bi-arrow-right"></i></button>':`<span>${playlists.length} playlists</span>`}</div>`;
    const visible=tab==='playlists'?playlists:playlists.slice(0,2);
    html+=visible.length?`<div class="sl-grid">${visible.map(playlistCard).join('')}</div>`:empty('music-note-list','Una playlist, muchas formas de sentir','Reúne tus canciones de Explorar. Tú eliges el nombre, el ritmo y la historia.','<button type="button" class="sl-button" data-library-create><i class="bi bi-plus-lg"></i> Crear mi primera playlist</button>');
    if(tab==='favorites') {
      const songs=favorites.filter(song=>normalize(`${song.title} ${song.artist}`).includes(normalize(search)));
      html+=`<div class="sl-section-heading"><h2>Tus favoritos</h2><label class="sl-search"><i class="bi bi-search"></i><input type="search" value="${esc(search)}" data-library-search placeholder="Buscar en favoritos" aria-label="Buscar en favoritos"></label></div><div class="sl-favorites-results">${favoriteResults(songs)}</div>`;
    }
    panel.innerHTML=html;syncPlayback();
  }
  function favoriteResults(songs) {
    return songs.length?`<div class="sl-track-list">${songs.map(song=>track(song,favorites.indexOf(song),'favorites')).join('')}</div>`:empty('heart',search?'No hay coincidencias':'Las canciones que se quedan contigo',search?'Prueba con otro título o artista.':'Pulsa el corazón de una canción para encontrarla aquí.','<a class="sl-button sl-secondary" href="index.html?page=explorar" data-page="explorar">Explorar canciones <i class="bi bi-arrow-right"></i></a>');
  }
  function syncPlayback() {
    if(!root?.isConnected)return;
    const player=audio();const source=player?.getAttribute('src');
    root.querySelectorAll('[data-library-source]').forEach(row=>{
      const active=source&&new URL(row.dataset.librarySource,document.baseURI).href===player.src;
      row.setAttribute('aria-current',String(!!active));
      const button=row.querySelector('[data-library-track]');if(button){button.querySelector('i').className=active&&!player.paused?'bi bi-pause-fill':'bi bi-play-fill';button.setAttribute('aria-label',`${active&&!player.paused?'Pausar':'Reproducir'} ${row.dataset.title}`);}
    });
    if(ownsAudio()){const control=document.getElementById('mainPlayBtn');control?.setAttribute('aria-label',player.paused?'Reproducir':'Pausar');const icon=control?.querySelector('i');if(icon)icon.className=player.paused?'bi bi-play-fill':'bi bi-pause-fill';}
  }
  async function play(index) {
    const song=queue[index], player=audio();if(!song||!player)return;
    position=index;window.sonoraPlaybackOwner='biblioteca';player.src=song.audio;ownedSource=player.src;
    document.getElementById('playerTitle').textContent=song.title;document.getElementById('playerArtist').textContent=song.artist;
    const img=document.createElement('img');img.src=imageURL(song.image);img.alt=song.title;document.getElementById('playerCover').replaceChildren(img);
    try{await player.play();status('');}catch{status('No se pudo reproducir esta canción. Intenta de nuevo.');}syncPlayback();
  }
  function openEditor(id=null) {
    if(!account()?.user){account()?.signIn();return;}
    editing=id;const playlist=playlists.find(p=>p.id===id);const dialog=root.querySelector('.sl-editor');
    dialog.querySelector('form').reset();dialog.querySelector('#slName').value=playlist?.name||'';dialog.querySelector('#slDescription').value=playlist?.description||'';
    dialog.querySelector('h2').textContent=id?'Editar playlist':'Crear playlist';dialog.querySelector('.sl-form-status').textContent='';dialog.showModal();
  }
  async function openPicker(id) {
    pickerPlaylist=id;const dialog=root.querySelector('.sl-picker');dialog.querySelector('input').value='';dialog.querySelector('.sl-picker-status').textContent='Cargando canciones…';dialog.showModal();
    try{await loadCatalog();if(!root?.isConnected)return;dialog.querySelector('.sl-picker-status').textContent='';renderPicker();}catch{dialog.querySelector('.sl-picker-status').textContent='No pudimos abrir el catálogo. Cierra esta ventana y vuelve a intentar.';}
  }
  function renderPicker() {
    if(!root?.isConnected)return;const dialog=root.querySelector('.sl-picker'),playlist=playlists.find(p=>p.id===pickerPlaylist);
    const existing=new Set((playlist?.playlist_songs||[]).map(s=>s.audio));const query=normalize(dialog.querySelector('input').value);
    const songs=catalog.filter(s=>normalize(`${s.title} ${s.artist}`).includes(query));
    dialog.querySelector('.sl-picker-songs').innerHTML=songs.length?songs.map(song=>`<article class="sl-track"><img src="${esc(imageURL(song.image))}" alt="" loading="lazy"><div class="sl-track-copy"><h3>${esc(song.title)}</h3><p>${esc(song.artist)}</p></div><button type="button" class="sl-icon" data-library-add="${catalog.indexOf(song)}" ${existing.has(song.audio)?'disabled':''} aria-label="${existing.has(song.audio)?'Ya añadida':'Añadir'} ${esc(song.title)}"><i class="bi bi-${existing.has(song.audio)?'check-lg':'plus-lg'}"></i></button></article>`).join(''):'<p class="sl-profile-note">No encontramos canciones con esa búsqueda.</p>';
  }
  async function mutate(work,button,success) {
    if(busy)return;const user=account()?.user;if(!user){account()?.signIn();return;}
    busy=true;if(button)button.disabled=true;
    try {const result=await work(user);if(result.error)throw result.error;if(account()?.user?.id!==user.id)return;await refresh();if(success)success(result.data);}
    catch(error){status(report(error));const dialog=root?.querySelector('dialog[open]');const el=dialog?.querySelector('.sl-form-status,.sl-picker-status');if(el)el.textContent=report(error);}
    finally{busy=false;if(button?.isConnected)button.disabled=false;}
  }
  document.addEventListener('click',event=>{
    const control=event.target.closest('#mainPlayBtn,#previousBtn,#nextBtn');if(!control||!ownsAudio())return;
    event.preventDefault();event.stopImmediatePropagation();
    if(control.id==='mainPlayBtn'){if(audio().paused)audio().play().catch(()=>status('No se pudo iniciar la reproducción.'));else audio().pause();}
    else play((position+(control.id==='nextBtn'?1:-1)+queue.length)%queue.length);
  },true);
  document.addEventListener('DOMContentLoaded',()=>{
    const player=audio();player?.addEventListener('play',syncPlayback);player?.addEventListener('pause',syncPlayback);
    player?.addEventListener('ended',event=>{if(!ownsAudio())return;event.stopImmediatePropagation();if(position+1<queue.length)play(position+1);else syncPlayback();},true);
    if(account()?.user)refresh();else updateProfile();
  });
  window.addEventListener('sonora-account-change',()=>{
    root?.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());selected=null;loadedUser=null;playlists=[];favorites=[];
    if(window.sonoraPlaybackOwner==='biblioteca'){audio()?.pause();queue=[];ownedSource='';window.sonoraPlaybackOwner='';}
    refresh();
  });
  window.addEventListener('sonora-favorites-change',refresh);
  window.addEventListener('sonora-profile-open',refresh);
  window.initBiblioteca = async options => {
    root=document.querySelector('.sonora-library');if(!root)return;
    tab='favorites';selected=options?.playlist||null;search='';
    root.addEventListener('click',async event=>{
      const button=event.target.closest('button');if(!button)return;
      if(button.matches('[data-library-close]')){button.closest('dialog').close();return;}
      if(button.matches('[data-library-login]')){account()?.signIn();return;}
      if(button.matches('[data-library-retry]')){refresh();return;}
      if(button.matches('[data-library-tab]')){tab=button.dataset.libraryTab;selected=null;search='';render();return;}
      if(button.matches('[data-library-create]')){openEditor();return;}
      if(button.matches('[data-library-edit]')){openEditor(button.dataset.libraryEdit);return;}
      if(button.matches('[data-library-open]')){selected=button.dataset.libraryOpen;tab='playlists';render();return;}
      if(button.matches('[data-library-back]')){selected=null;tab='playlists';render();return;}
      if(button.matches('[data-library-picker]')){await openPicker(button.dataset.libraryPicker);return;}
      if(button.matches('[data-library-playlist]')){const playlist=playlists.find(p=>p.id===button.dataset.libraryPlaylist);queue=[...(playlist?.playlist_songs||[])];await play(0);return;}
      if(button.matches('[data-library-track]')){const songs=button.dataset.libraryKind==='favorites'?favorites:playlists.find(p=>p.id===selected)?.playlist_songs||[];const index=Number(button.dataset.libraryTrack);const same=audio()?.src===new URL(songs[index].audio,document.baseURI).href;if(same&&!audio().paused){audio().pause();return;}queue=[...songs];await play(index);return;}
      if(button.matches('[data-library-add]')){
        const song=catalog[Number(button.dataset.libraryAdd)],id=pickerPlaylist;
        await mutate(()=>account().client.from('playlist_songs').insert({playlist_id:id,song_key:key(song),title:song.title,artist:song.artist,audio:song.audio,image:song.image,genre:song.genre}),button,()=>{renderPicker();root.querySelector('.sl-picker-status').textContent=`${song.title} añadida.`;});return;
      }
      if(button.matches('[data-library-remove]')){
        const playlist=playlists.find(p=>p.id===selected);if(!playlist)return;
        await mutate(()=>account().client.from('playlist_songs').delete().eq('id',button.dataset.libraryRemove).eq('playlist_id',playlist.id).select('id'),button,()=>status('Canción quitada de la playlist.'));return;
      }
      if(button.matches('[data-library-delete]')){
        const id=button.dataset.libraryDelete,playlist=playlists.find(p=>p.id===id);if(!playlist||!confirm(`¿Eliminar «${playlist.name}» y su selección de canciones?`))return;
        await mutate(user=>account().client.from('playlists').delete().eq('id',id).eq('user_id',user.id).select('id'),button,()=>{selected=null;tab='playlists';render();status('Playlist eliminada.');});return;
      }
    });
    root.addEventListener('input',event=>{
      if(event.target.matches('[data-library-search]')){search=event.target.value;const songs=favorites.filter(s=>normalize(`${s.title} ${s.artist}`).includes(normalize(search)));root.querySelector('.sl-favorites-results').innerHTML=favoriteResults(songs);syncPlayback();}
      if(event.target.closest('.sl-picker'))renderPicker();
    });
    root.querySelector('.sl-tabs').addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const buttons=[...root.querySelectorAll('.sl-tabs button')];let i=buttons.indexOf(document.activeElement);i=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[i].click();buttons[i].focus();
    });
    root.querySelector('.sl-edit-form').addEventListener('submit',async event=>{
      event.preventDefault();const form=event.target,name=form.elements.name.value.trim(),description=form.elements.description.value.trim();
      if(!name){form.querySelector('.sl-form-status').textContent='Escribe un nombre para tu playlist.';form.elements.name.focus();return;}
      const id=editing,button=form.querySelector('[type=submit]');
      await mutate(user=>id?account().client.from('playlists').update({name,description,updated_at:new Date().toISOString()}).eq('id',id).eq('user_id',user.id).select('id').single():account().client.from('playlists').insert({name,description,user_id:user.id}).select('id').single(),button,data=>{
        form.closest('dialog').close();selected=data.id;tab='playlists';render();status(id?'Playlist actualizada.':'Playlist creada. Añade tus primeras canciones.');
      });
    });
    render();loadCatalog().then(()=>{if(tab==='following')render();}).catch(()=>status('El catálogo no está disponible ahora. Puedes volver a abrir Biblioteca.'));
    await refresh();
  };
})();
