document.addEventListener('DOMContentLoaded', () => {
  // The standalone Explore page needs its playback controller initialized too.
  if (!document.getElementById('mainHome') && document.querySelector('.explore-page') && typeof window.initExplorar === 'function') window.initExplorar();
  const audio = document.getElementById('audioPlayer');
  const progress = document.getElementById('progressBar');
  const volume = document.getElementById('volumeBar');
  const mute = document.getElementById('playerMuteBtn');
  if (!audio || !progress || !volume || !mute) return;
  const time = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2,'0')}`;
  function syncProgress() {
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const percent = duration ? audio.currentTime / duration * 100 : 0;
    progress.style.setProperty('--range-fill', `${Math.min(100,Math.max(0,percent))}%`);
    progress.setAttribute('aria-valuetext', `${time(audio.currentTime || 0)} de ${time(duration)}`);
  }
  function syncVolume() {
    volume.value = audio.muted ? 0 : audio.volume;
    volume.style.setProperty('--range-fill', `${Number(volume.value) * 100}%`);
    const silent = audio.muted || audio.volume === 0;
    mute.setAttribute('aria-pressed', String(silent));
    mute.setAttribute('aria-label', silent ? 'Activar sonido' : 'Silenciar');
    mute.querySelector('i').className = silent ? 'bi bi-volume-mute' : audio.volume < .5 ? 'bi bi-volume-down' : 'bi bi-volume-up';
  }
  mute.addEventListener('click', () => {
    if (!audio.muted && audio.volume === 0) audio.volume = .8;
    else audio.muted = !audio.muted;
    syncVolume();
  });
  volume.addEventListener('input', () => { audio.muted = false; syncVolume(); });
  progress.addEventListener('input', () => progress.style.setProperty('--range-fill', `${progress.value}%`));
  for (const event of ['timeupdate','loadedmetadata','durationchange','seeked','emptied']) audio.addEventListener(event, syncProgress);
  audio.addEventListener('volumechange', syncVolume);
  syncProgress(); syncVolume();
});
