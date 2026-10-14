/* Funciones compartidas y carga del catálogo. */
(() => {
  const documents = new Map();
  const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
  const normalizeText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const isRetiredAudio = value => String(value || "").split(/[?#]/)[0].endsWith("/phil-collins-one-more-night.mp3");

  async function loadDocument(url) {
    if (!documents.has(url)) {
      const request = (async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
        return new DOMParser().parseFromString(await response.text(), 'text/html');
      })();
      documents.set(url, request);
      request.catch(() => {
        if (documents.get(url) === request) documents.delete(url);
      });
    }
    return documents.get(url);
  }

  async function loadSongs({selector = '.explore-song-card[data-audio]', keep = 'last'} = {}) {
    const document = await loadDocument('explorar.html?v=artists-15');
    const songs = new Map();
    document.querySelectorAll(selector).forEach(element => {
      const song = {...element.dataset};
      if (!song.audio || (keep === 'first' && songs.has(song.audio))) return;
      songs.set(song.audio, song);
    });
    /* Cada módulo recibe una copia independiente del catálogo. */
    return [...songs.values()];
  }

  async function loadArtists() {
    const document = await loadDocument('artistas.html?v=artists-15');
    return [...document.querySelectorAll('.artist-catalog-card')].map(card => ({
      id: card.dataset.artistId,
      name: card.querySelector('h3')?.textContent || '',
      image: card.querySelector('img')?.getAttribute('src') || '',
      genre: card.querySelector('.artist-catalog-info>span')?.textContent || 'Artista ANDROMEDA'
    }));
  }

  window.andromedaCore = Object.freeze({escapeHTML, normalizeText, loadSongs, loadArtists, isRetiredAudio});
})();
