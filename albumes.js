/* Collections use the live Explore catalog; no duplicate song database. */
(() => {
  let queue = [], position = 0, ownedSource = '';
  const audio = () => document.getElementById('audioPlayer');
  const ownsAudio = () => ownedSource && audio()?.src === ownedSource;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const status = message => { const el = document.querySelector('.sa-status'); if (el) el.textContent = message; };
  function sync() {
    if (!ownsAudio()) return;
    const playing = !audio().paused;
    const control = document.getElementById('mainPlayBtn');
    if (control) { control.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir'); const icon = control.querySelector('i'); if (icon) icon.className = playing ? 'bi bi-pause-fill' : 'bi bi-play-fill'; }
    document.querySelectorAll('.sa-track').forEach(el => el.setAttribute('aria-current', String(el.dataset.source === queue[position]?.audio)));
  }
  async function play(index) {
    const song = queue[index], player = audio();
    if (!song || !player) return;
    position = index; player.src = song.audio; ownedSource = player.src;
    for (const [id, text] of [['playerTitle', song.title], ['playerArtist', song.artist]]) { const el = document.getElementById(id); if (el) el.textContent = text; }
    const cover = document.getElementById('playerCover');
    if (cover) { const img = document.createElement('img'); img.src = song.image; img.alt = song.artist; cover.replaceChildren(img); }
    try { await player.play(); status(''); } catch { status('No se pudo reproducir esta canción. Prueba otra o pulsa reproducir.'); }
    sync();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('#mainPlayBtn, #previousBtn, #nextBtn');
    if (!button || !ownsAudio()) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (button.id === 'mainPlayBtn') { if (audio().paused) audio().play().catch(() => status('No se pudo iniciar la reproducción.')); else audio().pause(); }
    else play((position + (button.id === 'nextBtn' ? 1 : -1) + queue.length) % queue.length);
  }, true);
  document.addEventListener('DOMContentLoaded', () => {
    const player = audio(); if (!player) return;
    player.addEventListener('ended', event => { if (!ownsAudio()) return; event.stopImmediatePropagation(); if (position + 1 < queue.length) play(position + 1); else sync(); }, true);
    player.addEventListener('play', sync); player.addEventListener('pause', sync);
    player.addEventListener('error', () => { if (ownsAudio()) status('Esta canción no está disponible. Puedes elegir otra de la colección.'); });
  });
  window.initAlbumes = async () => {
    const root = document.querySelector('.sonora-albums'); if (!root) return;
    const featured = root.querySelector('.sa-featured'), grid = root.querySelector('.sa-grid'), dialog = root.querySelector('dialog');
    let groups = [], genre = 'all', search = '';
    const labels = {rock:'Rock',pop:'Pop',electronic:'Electrónica',jazz:'Jazz',hiphop:'Hip hop'};
    function listen(group, index = 0) { queue = group.songs; play(index); }
    function details(group) {
      root.querySelector('.sa-detail').innerHTML = `<span class="sa-eyebrow">SELECCIÓN SONORA</span><h2 id="sa-detail-title">${escape(group.artist)}</h2><p class="sa-meta">${group.songs.length} canciones de Explorar</p>${group.songs.map((song, i) => `<button class="sa-track" data-index="${i}" data-source="${escape(song.audio)}"><span>${String(i+1).padStart(2,'0')}</span><span>${escape(song.title)}</span><i class="bi bi-play-fill" aria-hidden="true"></i></button>`).join('')}`;
      root.querySelectorAll('.sa-track').forEach(button => button.onclick = () => listen(group, Number(button.dataset.index)));
      dialog.showModal(); sync();
    }
    root.querySelector('.sa-close').onclick = () => dialog.close();
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
    function render() {
      const matches = groups.filter(group => (genre === 'all' || group.genre === genre) && normalize(group.artist + ' ' + group.songs.map(song => song.title).join(' ')).includes(normalize(search)));
      root.querySelector('.sa-count').textContent = `${matches.length} colecciones`;
      root.querySelector('.sa-status').textContent = matches.length ? '' : 'No encontramos colecciones. Prueba otra búsqueda o filtro.';
      featured.hidden = !matches.length;
      const hero = matches.find(group => group.artist === "Guns N' Roses") || matches[0];
      if (hero) {
        featured.innerHTML = `<img class="sa-cover" src="${escape(hero.image)}" alt="${escape(hero.artist)}"><div><span class="sa-eyebrow">SELECCIÓN DESTACADA / SONORA</span><h2>${escape(hero.artist)}</h2><p class="sa-description">Las canciones que siempre vuelves a escuchar. Descubre esta colección y encuentra tu próximo favorito.</p><p class="sa-meta">${escape(labels[hero.genre] || hero.genre)} · ${hero.songs.length} canciones disponibles</p><div class="sa-actions"><button class="sa-button sa-button-primary" data-listen><i class="bi bi-play-fill" aria-hidden="true"></i>Escuchar colección</button><button class="sa-button" data-details>Ver canciones <span aria-hidden="true">↗</span></button></div></div>`;
        featured.querySelector('[data-listen]').onclick = () => listen(hero);
        featured.querySelector('[data-details]').onclick = () => details(hero);
      }
      grid.replaceChildren();
      matches.forEach(group => {
        const card = document.createElement('article'); card.className = 'sa-card';
        card.innerHTML = `<div class="sa-art"><img class="sa-cover" loading="lazy" src="${escape(group.image)}" alt="${escape(group.artist)}"><button class="sa-card-play" aria-label="Escuchar ${escape(group.artist)}"><i class="bi bi-play-fill" aria-hidden="true"></i></button></div><button class="sa-card-open">${escape(group.artist)} <span aria-hidden="true">↗</span></button><p>Selección SONORA · ${group.songs.length} canciones</p>`;
        card.querySelector('.sa-card-play').onclick = () => listen(group);
        card.querySelector('.sa-card-open').onclick = () => details(group); grid.appendChild(card);
      });
    }
    try {
      const response = await fetch('explorar.html'); if (!response.ok) throw new Error('catalog');
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const byArtist = new Map(), seen = new Set();
      doc.querySelectorAll('[data-audio][data-title][data-artist]').forEach(el => {
        const song = {...el.dataset}; if (!song.audio || seen.has(song.audio)) return; seen.add(song.audio);
        let group = byArtist.get(song.artist);
        if (!group) { group = {artist:song.artist, genre:song.genre || 'rock', image:song.image, songs:[]}; byArtist.set(song.artist, group); }
        group.songs.push(song);
      });
      if (!root.isConnected) return;
      groups = [...byArtist.values()];
      const filters = root.querySelector('.sa-filters');
      ['all', ...new Set(groups.map(group => group.genre))].forEach(value => {
        const button = document.createElement('button'); button.className = 'sa-chip'; button.textContent = value === 'all' ? 'Todos' : labels[value] || value; button.setAttribute('aria-pressed', String(value === genre));
        button.onclick = () => { genre = value; filters.querySelectorAll('button').forEach(el => el.setAttribute('aria-pressed', String(el === button))); render(); }; filters.appendChild(button);
      });
      root.querySelector('input').addEventListener('input', event => { search = event.target.value; render(); }); render();
    } catch { if (root.isConnected) { root.querySelector('.sa-status').textContent = 'No se pudo cargar el catálogo. Recarga la página para intentarlo de nuevo.'; } }
  };
})();
