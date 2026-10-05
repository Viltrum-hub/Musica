/* The Home preview follows the existing shared audio player. */
document.addEventListener('DOMContentLoaded', () => {
  const preview = document.querySelector('.home-now-playing');
  const audio = document.getElementById('audioPlayer');
  const title = document.getElementById('playerTitle');
  const artist = document.getElementById('playerArtist');
  const cover = document.getElementById('playerCover');
  if (!preview || !audio) return;
  const label = preview.querySelector('small');
  const name = preview.querySelector('strong');
  const subtitle = preview.querySelector('.home-now-copy > span');
  const artwork = preview.querySelector('.home-now-cover');
  const icon = preview.querySelector('.home-now-icon i');
  function sync() {
    const hasTrack = !!audio.getAttribute('src');
    label.textContent = hasTrack ? audio.paused ? 'EN TU REPRODUCTOR' : 'AHORA SUENA' : 'TU UNIVERSO EMPIEZA AQUÍ';
    name.textContent = hasTrack ? title.textContent : 'Encuentra tu próxima canción';
    subtitle.textContent = hasTrack ? artist.textContent : 'Escucha la selección SONORA';
    icon.className = hasTrack && !audio.paused ? 'bi bi-pause-fill' : 'bi bi-play-fill';
    preview.setAttribute('aria-label', hasTrack && !audio.paused ? 'Pausar canción actual' : hasTrack ? 'Reproducir canción actual' : 'Escuchar selección SONORA');
    const image = hasTrack && cover.querySelector('img');
    if (image) {
      const img = document.createElement('img'); img.src = image.src; img.alt = ''; artwork.replaceChildren(img);
    } else artwork.innerHTML = '<i class="bi bi-soundwave" aria-hidden="true"></i>';
  }
  preview.addEventListener('click', () => {
    if (!audio.getAttribute('src')) document.querySelector('.home-track .play-card')?.click();
    else document.getElementById('mainPlayBtn')?.click();
  });
  for (const event of ['play', 'pause', 'loadedmetadata', 'emptied', 'ended']) audio.addEventListener(event, sync);
  const observer = new MutationObserver(sync);
  for (const target of [title, artist, cover]) if (target) observer.observe(target, {childList:true, subtree:true});
  sync();
});
