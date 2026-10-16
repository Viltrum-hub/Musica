/* Catálogo compartido de Supabase. */
(() => {
  const labels = {electronic:'Electrónica',rock:'Rock',pop:'Pop',hiphop:'Hip hop',celestial:'Cristiana',aurora:'Romántica'};
  const featuredPriority = {
        electronic: ['daft-punk', 'alan-walker', 'eiffel-65'],
        rock: ['queen', 'axl-rose', 'scorpions', 'mana', 'the-police', 'the-outfield', 'chicago'],
        pop: ['madonna', 'lady-gaga', 'elton-john', 'justin-bieber', 'george-michael', 'wham', 'mark-ronson'],
        hiphop: ['eminem', 'snoop-dogg', '50-cent', 'dr-dre', 'the-notorious-b-i-g', 'ice-cube', 'travis-scott', 'coolio'],
        celestial: ['steve-green', 'felipe-garibo', 'junior-kelly-marchena'],
        aurora: ['luis-miguel', 'marco-antonio-solis', 'cristian-castro']
    };
  const matchesTheme = (song, theme) => song.genre === theme || (song.themeTags || '').split(/\s+/).includes(theme);
  function featuredArtists(profiles, theme) {
    const eligible = Object.keys(profiles).filter(id => profiles[id].tracks.some(song => matchesTheme(song, theme)));
    const preferred = (featuredPriority[theme] || []).filter(id => eligible.includes(id));
    const rest = eligible.filter(id => !preferred.includes(id));
    return [...preferred, ...rest.filter(id => profiles[id].universe === theme), ...rest.filter(id => profiles[id].universe !== theme)];
  }
  function featuredSongs(songs, theme, artists = []) {
    const eligible = songs.filter(song => matchesTheme(song, theme));
    const rank = id => { const index = (featuredPriority[theme] || []).indexOf(id); return index < 0 ? 100 : index; };
    const artistId = song => song.artistId || artists.find(a => a.name === song.artist)?.id;
    return eligible.map((song, index) => ({song,index})).sort((a,b) => rank(artistId(a.song)) - rank(artistId(b.song)) || Number(b.song.genre === theme) - Number(a.song.genre === theme) || a.index-b.index).map(item => item.song);
  }
  const escape = value => window.andromedaCore.escapeHTML(value);
  let snapshot, pending, expires = 0;
  const client = async () => {
    if (window.sonoraAccount?.client) return window.sonoraAccount.client;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { document.removeEventListener('andromeda-account-ready', ready); reject(new Error('No se pudo conectar con la cuenta.')); }, 10000);
      function ready() { clearTimeout(timer); resolve(); }
      document.addEventListener('andromeda-account-ready', ready, {once:true});
    });
    return window.sonoraAccount.client;
  };
  const safeURL = value => {
    try { const url = new URL(value, document.baseURI); return url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin) ? value : ''; } catch { return ''; }
  };
  function song(row) {
    return {catalogId:row.id,title:row.title,artist:row.artist,artistId:row.artist_id,genre:row.genre,themeTags:row.theme_tags.join(' '),audio:safeURL(row.audio),image:safeURL(row.image)};
  }
  async function load({fresh = false} = {}) {
    if (!fresh && snapshot && Date.now() < expires) return structuredClone(snapshot);
    if (!pending) pending = (async () => {
      const db = await client();
      const results = await Promise.all([
        db.from('music_songs').select('*').eq('status','published').order('sort_order').order('created_at'),
        db.from('music_artists').select('*').order('sort_order').order('name')
      ]);
      for (const result of results) if (result.error) throw result.error;
      snapshot = {songs:results[0].data.map(song), artists:results[1].data}; expires = Date.now() + 30000;
      return snapshot;
    })().finally(() => { pending = null; });
    return structuredClone(await pending);
  }
  function invalidate() { snapshot = null; expires = 0; document.dispatchEvent(new Event('andromeda-catalog-changed')); }
  function artwork(value) {
    if (!snapshot || !value) return '';
    let absolute; try { absolute = new URL(value, document.baseURI).href; } catch { return ''; }
    return snapshot.songs.find(song => new URL(song.audio,document.baseURI).href === absolute)?.image || '';
  }
  function artistArtwork(source) {
    if (!snapshot) return '';
    const file = String(source || '').match(/assets\/andromeda\/(?:artists|albums|songs)\/([^?#]+)/)?.[1];
    const artist = file && snapshot.artists.find(a => file === `${a.id}.svg` || file.startsWith(`${a.id}-`));
    return artist?.image || '';
  }
  async function hydrateExplore(root) {
    const {songs} = await load();
    const grid = root.querySelector('#exploreSongGrid');
    grid.innerHTML = songs.map(s => `<article class="explore-song-card" data-catalog-id="${escape(s.catalogId)}" data-artist-id="${escape(s.artistId)}" data-title="${escape(s.title)}" data-artist="${escape(s.artist)}" data-genre="${escape(s.genre)}" data-theme-tags="${escape(s.themeTags)}" data-audio="${escape(s.audio)}" data-image="${escape(s.image)}"><div class="explore-song-image"><img loading="lazy" decoding="async" src="${escape(s.image)}" alt="Portada de ${escape(s.title)}"><button class="explore-play-button" type="button" aria-label="Reproducir ${escape(s.title)}"><i class="bi bi-play-fill" aria-hidden="true"></i></button></div><button type="button" class="favorite-song-btn" aria-label="Agregar a favoritos"><i class="bi bi-heart" aria-hidden="true"></i></button><div class="explore-song-info"><div><h3>${escape(s.title)}</h3><p>${escape(s.artist)}</p></div><span class="song-genre">${escape(labels[s.genre])}</span></div></article>`).join('');
  }
  async function hydrateArtists(root) {
    const {songs,artists} = await load(), profiles = {};
    const active = artists.filter(artist => songs.some(song => song.artistId === artist.id));
    root.querySelector('#artistsGrid').innerHTML = active.map(a => {
      const tracks = songs.filter(song => song.artistId === a.id), first = tracks[0];
      profiles[a.id] = {...a, image:safeURL(a.image), tags:a.tags.map(tag => /^\d+ canci/.test(tag) ? `${tracks.length} ${tracks.length === 1 ? "canción" : "canciones"}` : tag), tracks};
      const genres = [...new Set(tracks.flatMap(s => [s.genre,...s.themeTags.split(' ')]))].join(' ');
      return `<article class="artist-catalog-card" data-artist-id="${escape(a.id)}" data-name="${escape(a.name)}" data-genre="${escape(genres)}"><div class="artist-catalog-image"><img loading="lazy" src="${escape(safeURL(a.image))}" alt="${escape(a.name)}"><button class="artist-card-play artist-song-play" type="button" aria-label="Reproducir ${escape(first.title)}" data-title="${escape(first.title)}" data-artist="${escape(first.artist)}" data-audio="${escape(first.audio)}" data-image="${escape(first.image)}"><i class="bi bi-play-fill" aria-hidden="true"></i></button></div><div class="artist-catalog-info"><span>${escape(a.genre)}</span><h3>${escape(a.name)}</h3><button class="artist-details-button" type="button" data-artist-id="${escape(a.id)}">Explorar perfil <i class="bi bi-arrow-up-right" aria-hidden="true"></i></button></div></article>`;
    }).join('');
    return profiles;
  }
  async function hydrateHome() {
    const grid = document.querySelector('.home-track-grid');
    if (!grid) return;
    grid.setAttribute('aria-busy','true');
    try {
      const {songs,artists} = await load();
      const theme = document.body.dataset.theme || 'electronic';
      const ranked = featuredSongs(songs, theme, artists);
      const seen = new Set();
      const firstByArtist = ranked.filter(song => { if (seen.has(song.artistId)) return false; seen.add(song.artistId); return true; });
      const selection = [...firstByArtist,...ranked.filter(song => !firstByArtist.includes(song))];
      const selected = [...document.querySelectorAll('#mainHome .album-card')].map((card,i) => {
        const sectionIndex = card.classList.contains('home-track') ? i : i - grid.querySelectorAll('.home-track').length;
        const song = selection[sectionIndex];
        card.hidden = !song;
        if (!song) return null;
        Object.assign(card.dataset,song);
        card.querySelector('h3').textContent = card.classList.contains('home-track') ? song.artist : song.title;
        card.querySelector('p').textContent = card.classList.contains('home-track') ? song.title : song.artist;
        card.querySelector('img').src = song.image; card.querySelector('img').alt = song.artist;
        card.querySelector('.play-card').setAttribute('aria-label',`Escuchar ${song.title}`);
        return song;
      });
      const profiles = Object.fromEntries(artists.map(a => [a.id,{...a,tracks:songs.filter(song => song.artistId === a.id)}]));
      const artistOrder = featuredArtists(profiles, theme);
      document.querySelectorAll('#mainHome .artist-card').forEach((card,index) => {
        const profile = profiles[artistOrder[index]];
        card.hidden = !profile;
        if (!profile) return;
        card.querySelector('h3').textContent = profile.name; card.querySelector('p').textContent = profile.genre;
        const image = card.querySelector('img'); image.src = safeURL(profile.image); image.alt = profile.name;
        const button = card.querySelector('[data-artist-id]'); button.dataset.artistId = profile.id; button.setAttribute('aria-label',`Ver perfil de ${profile.name}`);
      });
      document.dispatchEvent(new CustomEvent('andromeda-home-catalog',{detail:selected}));
    } catch { grid.innerHTML = '<p role="status">No pudimos cargar la selección. <button type="button" class="catalog-retry">Reintentar</button></p>'; grid.querySelector('button').onclick = () => location.reload(); }
    finally {grid.removeAttribute('aria-busy');}
  }
  window.andromedaCatalog = Object.freeze({client,load,invalidate,artwork,artistArtwork,hydrateExplore,hydrateArtists,hydrateHome,labels,safeURL,matchesTheme,featuredArtists,featuredSongs});
  document.addEventListener('DOMContentLoaded', () => {
    hydrateHome();
    new MutationObserver(hydrateHome).observe(document.body,{attributes:true,attributeFilter:['data-theme']});
  });
})();
