(() => {
  const {escapeHTML:esc,normalizeText:normalize} = window.andromedaCore;
  const catalog = window.andromedaCatalog, labels = catalog.labels;
  let root, allowed = false, verifiedUser = null, checkTicket = 0, view = 'songs';
  let songs = [], artists = [], query = '', universe = '', publication = '', page = 0;
  let editId = null, busy = false, loadingTicket = 0, coverPreview = '', permissionTimer;
  const pageSize = 8;
  const colorLabels = {electronic:'Cian · Violeta',rock:'Escarlata · Cobre',pop:'Rosa · Coral',hiphop:'Violeta · Índigo',celestial:'Ámbar · Perla',aurora:'Rubí · Champán'};
  const universeNames = {...labels,celestial:'Celestial',aurora:'Aurora'};
  const icons = {overview:'grid',songs:'music-note-beamed',artists:'people',albums:'vinyl',universes:'planet',access:'shield-lock'};
  const names = {overview:'Resumen',songs:'Canciones',artists:'Artistas',albums:'Álbumes',universes:'Universos',access:'Acceso admin'};
  const titles = {overview:'Tu universo, en orden.',songs:'Tu catálogo',artists:'Las voces de ANDROMEDA',albums:'Tus colecciones',universes:'Seis mundos. Una identidad.',access:'Acceso admin'};
  const descriptions = {overview:'Una vista del catálogo que tienes publicado.',songs:'Gestiona la música de tu universo.',artists:'Una misma identidad en cada apartado del sitio.',albums:'Las selecciones se actualizan con las canciones publicadas.',universes:'Cada canción, en el lugar que le corresponde.',access:''};
  const options = (selected='',empty='Todos los universos') => `<option value="">${empty}</option>${Object.entries(labels).map(([id,name]) => `<option value="${id}" ${selected===id?'selected':''}>${name}</option>`).join('')}`;
  const badge = genre => `<span class="andromeda-admin-badge" data-universe="${esc(genre)}">${esc(universeNames[genre])}</span>`;
  const baseAudio = value => { try { return new URL(value,document.baseURI).href; } catch { return ''; } };
  function message(text,error=false) {
    if (!root?.isConnected) return;
    const node = root.querySelector('.andromeda-admin-status');
    if (node) {node.textContent=text; node.dataset.error=String(error);}
  }
  function revokePreview() { if (coverPreview) URL.revokeObjectURL(coverPreview); coverPreview=''; }
  function lock(kind='signedout') {
    allowed = false; songs=[];artists=[];busy=false;editId=null;revokePreview();++loadingTicket;
    if (!root?.isConnected) return;
    const text = kind==='error' ? 'No pudimos verificar tu permiso. Revisa la conexión y vuelve a intentarlo.' : kind==='denied' ? 'Tu cuenta no tiene permisos para administrar ANDROMEDA. Puedes seguir disfrutando del sitio.' : 'Inicia sesión con una cuenta autorizada para gestionar el catálogo.';
    root.innerHTML=`<div class="andromeda-admin-gate"><i class="bi bi-shield-lock" aria-hidden="true"></i><h1 id="adminHeading">${kind==='denied'?'Acceso reservado':'Acceso de administración'}</h1><p>${text}</p><div class="andromeda-admin-actions">${kind==='signedout'?'<button class="andromeda-admin-button andromeda-admin-button-primary" type="button" data-admin-signin>Iniciar sesión</button>':'<button class="andromeda-admin-button" type="button" data-admin-recheck>Comprobar de nuevo</button>'}<a class="andromeda-admin-button" href="index.html" data-page="inicio">Volver al sitio</a></div></div>`;
    root.querySelector('[data-admin-signin]')?.addEventListener('click',()=>window.sonoraAccount.signIn());
    root.querySelector('[data-admin-recheck]')?.addEventListener('click',()=>checkAccess(true));
  }
  async function checkAccess(render=false) {
    const ticket=++checkTicket;
    try {
      const db=await catalog.client();
      const {data:{session},error:sessionError}=await db.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {if(ticket===checkTicket){verifiedUser=null;lock();toggleLink(false);}return false;}
      const {data:{user},error}=await db.auth.getUser();
      if (error) throw error;
      const result=await db.from('catalog_admins').select('user_id').eq('user_id',user.id).maybeSingle();
      if(result.error) throw result.error;
      if(ticket!==checkTicket) return false;
      const wasAllowed=allowed, changed=verifiedUser!==user.id;
      verifiedUser=user.id;allowed=!!result.data;toggleLink(allowed);
      if(!allowed){lock('denied');return false;}
      if(root?.isConnected && (render||!wasAllowed||changed)){build();await reload();}
      return true;
    } catch {
      if(ticket===checkTicket){toggleLink(false);lock('error');}
      return false;
    }
  }
  function toggleLink(show) {document.querySelectorAll('.admin-profile-link').forEach(link=>link.hidden=!show);}
  function build() {
    if (!root?.isConnected||!allowed) return;
    root.innerHTML=`<div class="andromeda-admin-layout"><aside class="andromeda-admin-sidebar" aria-label="Administración"><div class="andromeda-admin-wordmark"><img src="assets/andromeda/pulsar.svg" alt="">ANDROMEDA</div><p class="andromeda-admin-eyebrow">Administración</p>${Object.keys(names).map(id=>`<button type="button" data-admin-view="${id}" aria-current="${id===view?'page':'false'}"><i class="bi bi-${icons[id]}" aria-hidden="true"></i>${names[id]}</button>`).join('')}<div class="andromeda-admin-orbit" aria-hidden="true"></div><a class="andromeda-admin-return" href="index.html" data-page="inicio"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i>Volver al sitio</a></aside><div class="andromeda-admin-main"><div class="andromeda-admin-breadcrumb"><span>Administración / <span data-admin-location>${names[view]}</span></span><span class="andromeda-admin-account"><i class="bi bi-shield-check" aria-hidden="true"></i>Administrador</span></div><header class="andromeda-admin-heading"><div><h1 id="adminHeading">${titles[view]}</h1><p data-admin-description>${descriptions[view]}</p></div><div class="andromeda-admin-actions"><button class="andromeda-admin-button" type="button" data-admin-refresh aria-label="Actualizar catálogo"><i class="bi bi-arrow-clockwise" aria-hidden="true"></i>Actualizar</button><button class="andromeda-admin-button andromeda-admin-button-primary" type="button" data-admin-new><i class="bi bi-plus-lg" aria-hidden="true"></i>Nueva canción</button></div></header><p class="andromeda-admin-status" role="status" aria-live="polite"></p><div class="andromeda-admin-stats"></div><div class="andromeda-admin-content"></div></div></div><dialog class="andromeda-admin-confirm" aria-labelledby="adConfirmTitle"><h2 id="adConfirmTitle"></h2><p></p><form method="dialog"><button class="andromeda-admin-button" value="cancel">Cancelar</button><button class="andromeda-admin-button andromeda-admin-danger" value="confirm">Confirmar</button></form></dialog>`;
    root.querySelectorAll('[data-admin-view]').forEach(button=>button.onclick=()=>changeView(button.dataset.adminView));
    root.querySelector('[data-admin-refresh]').onclick=async()=>{if(busy)return;if(await checkAccess()){catalog.invalidate();await reload();}};
    root.querySelector('[data-admin-new]').onclick=()=>{
      if(busy)return;
      if(view!=='artists'&&view!=='songs')changeView('songs');
      openEditor();
    };
  }
  async function reload() {
    const ticket=++loadingTicket, user=verifiedUser;
    message('Cargando catálogo…');
    try {
      const db=await catalog.client();
      const results=await Promise.all([db.from('music_songs').select('*').order('sort_order').order('created_at'),db.from('music_artists').select('*').order('sort_order').order('name')]);
      for(const result of results)if(result.error)throw result.error;
      if(!allowed||ticket!==loadingTicket||user!==verifiedUser||!root?.isConnected)return;
      songs=results[0].data;artists=results[1].data;message('');render();
    } catch {if(ticket===loadingTicket)message('No pudimos cargar el catálogo. Pulsa Actualizar para reintentar.',true);}
  }
  function changeView(next) {
    if(busy)return;
    revokePreview();view=next;query='';universe='';publication='';page=0;editId=null;
    root.querySelectorAll('[data-admin-view]').forEach(button=>button.setAttribute('aria-current',String(button.dataset.adminView===view?'page':'false')));
    root.querySelector('#adminHeading').textContent=titles[view];root.querySelector('[data-admin-description]').textContent=descriptions[view];root.querySelector('[data-admin-location]').textContent=names[view];
    const action=root.querySelector('[data-admin-new]');action.hidden=!['songs','artists','overview'].includes(view);action.innerHTML=`<i class="bi bi-plus-lg" aria-hidden="true"></i>${view==='artists'?'Nuevo artista':'Nueva canción'}`;
    message('');render();
  }
  function renderStats() {
    const published=songs.filter(s=>s.status==='published').length;
    root.querySelector('.andromeda-admin-stats').innerHTML=[[songs.length,'Canciones','music-note-beamed'],[artists.length,'Artistas','people'],[published,'Publicadas','broadcast'],[songs.length-published,'Borradores','file-earmark-music']].map(([count,label,icon])=>`<div class="andromeda-admin-stat"><i class="bi bi-${icon}" aria-hidden="true"></i><div><strong>${count}</strong><span>${label}</span></div></div>`).join('');
  }
  function render() {
    if(!allowed||!root?.isConnected)return;
    renderStats();
    const content=root.querySelector('.andromeda-admin-content');
    if(view==='access'){renderAccess(content);return;}
    if(['overview','universes','albums'].includes(view)){renderTiles(content);return;}
    content.innerHTML=`<div class="andromeda-admin-workspace"><div class="andromeda-admin-list"><div class="andromeda-admin-filters"><label class="andromeda-admin-search"><i class="bi bi-search" aria-hidden="true"></i><input type="search" aria-label="Buscar ${view==='artists'?'artista':'canción o artista'}" placeholder="${view==='artists'?'Buscar artista…':'Buscar canción o artista…'}" value="${esc(query)}"></label><select data-admin-universe aria-label="Filtrar por universo">${options(universe)}</select>${view==='songs'?`<select data-admin-publication aria-label="Filtrar por estado"><option value="">Todos los estados</option><option value="published" ${publication==='published'?'selected':''}>Publicadas</option><option value="draft" ${publication==='draft'?'selected':''}>Borradores</option></select>`:''}</div><div class="andromeda-admin-table-wrap"><table class="andromeda-admin-table"><thead><tr><th>${view==='artists'?'Artista':'Canción'}</th><th>${view==='artists'?'Canciones':'Artista'}</th><th>Universo</th><th>Estado</th><th><span class="visually-hidden">Acciones</span></th></tr></thead><tbody></tbody></table><p class="andromeda-admin-empty" hidden>No hay resultados con estos filtros.</p></div><div class="andromeda-admin-pagination"></div></div><aside class="andromeda-admin-editor" aria-label="Editar catálogo" hidden></aside></div>`;
    const input=content.querySelector('input');input.oninput=()=>{query=input.value;page=0;renderRows();};
    content.querySelector('[data-admin-universe]').onchange=event=>{universe=event.target.value;page=0;renderRows();};
    const filter=content.querySelector('[data-admin-publication]');if(filter)filter.onchange=event=>{publication=event.target.value;page=0;renderRows();};
    renderRows();
  }
  function renderRows() {
    const artistMode=view==='artists';
    const matches=(artistMode?artists:songs).filter(row=>(!universe||(artistMode?row.universe:row.genre)===universe)&&(!publication||row.status===publication)&&normalize([row.title,row.name,row.artist].filter(Boolean).join(' ')).includes(normalize(query)));
    page=Math.max(0,Math.min(page,Math.ceil(matches.length/pageSize)-1));
    const slice=matches.slice(page*pageSize,(page+1)*pageSize);
    root.querySelector('tbody').innerHTML=slice.map(row=>`<tr><td><div class="andromeda-admin-song-cell"><img src="${esc(catalog.safeURL(row.image))}" alt="" loading="lazy"><div><strong>${esc(artistMode?row.name:row.title)}</strong><small>ANDROMEDA</small></div></div></td><td>${artistMode?songs.filter(s=>s.artist_id===row.id).length:esc(row.artist)}</td><td>${badge(artistMode?row.universe:row.genre)}</td><td><span class="andromeda-admin-state ${row.status==='draft'?'andromeda-admin-state-draft':''}">${artistMode?'En catálogo':row.status==='published'?'Publicada':'Borrador'}</span></td><td><div class="andromeda-admin-row-actions"><button class="andromeda-admin-icon" type="button" data-admin-edit="${esc(row.id)}" aria-label="Editar ${esc(artistMode?row.name:row.title)}"><i class="bi bi-pencil" aria-hidden="true"></i></button><button class="andromeda-admin-icon andromeda-admin-danger" type="button" data-admin-delete="${esc(row.id)}" aria-label="Eliminar ${esc(artistMode?row.name:row.title)}"><i class="bi bi-trash3" aria-hidden="true"></i></button></div></td></tr>`).join('');
    root.querySelector('.andromeda-admin-empty').hidden=!!matches.length;
    const totalPages=Math.max(1,Math.ceil(matches.length/pageSize));
    root.querySelector('.andromeda-admin-pagination').innerHTML=`<span>${matches.length?`${page*pageSize+1}–${Math.min((page+1)*pageSize,matches.length)} de ${matches.length}`:'0 resultados'}</span><div><button class="andromeda-admin-icon" type="button" data-admin-prev aria-label="Página anterior" ${page===0?'disabled':''}><i class="bi bi-chevron-left" aria-hidden="true"></i></button><span>${page+1} / ${totalPages}</span><button class="andromeda-admin-icon" type="button" data-admin-next aria-label="Página siguiente" ${page+1>=totalPages?'disabled':''}><i class="bi bi-chevron-right" aria-hidden="true"></i></button></div>`;
    root.querySelector('[data-admin-prev]').onclick=()=>{page--;renderRows();};root.querySelector('[data-admin-next]').onclick=()=>{page++;renderRows();};
    root.querySelectorAll('[data-admin-edit]').forEach(b=>b.onclick=()=>{if(!busy)openEditor(b.dataset.adminEdit);});
    root.querySelectorAll('[data-admin-delete]').forEach(b=>b.onclick=()=>remove(b.dataset.adminDelete));
  }
  function openEditor(id=null) {
    revokePreview();editId=id;
    const artistMode=view==='artists', row=(artistMode?artists:songs).find(row=>row.id===id);
    const editor=root.querySelector('.andromeda-admin-editor');editor.hidden=false;
    const image=row?.image||artists[0]?.image||'assets/universe-electronic-v2.webp';
    editor.innerHTML=`<div class="andromeda-admin-editor-heading"><h2>${row?'Editar':artistMode?'Nuevo':'Nueva'} ${artistMode?'artista':'canción'}</h2><button class="andromeda-admin-icon" type="button" data-admin-cancel aria-label="Cerrar editor"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div><form class="andromeda-admin-form"><div class="andromeda-admin-cover"><img src="${esc(catalog.safeURL(image))}" alt="Vista previa de portada"><label><i class="bi bi-image" aria-hidden="true"></i> Cambiar portada<input type="file" name="cover" accept="image/jpeg,image/png,image/webp" aria-label="Seleccionar portada"></label><p class="andromeda-admin-help">JPG, PNG o WebP · Hasta 5 MB</p></div>${artistMode?`<label>Nombre del artista<input name="name" required maxlength="160" value="${esc(row?.name||'')}" placeholder="Nombre del artista o banda"></label><label>Género visible<input name="genreLabel" maxlength="160" required value="${esc(row?.genre||'')}" placeholder="Rock · Pop rock"></label>`:`<label>Título de la canción<input name="title" required maxlength="240" value="${esc(row?.title||'')}" placeholder="Escribe el título…"></label><label>Artista<select name="artist_id" required><option value="">Selecciona un artista…</option>${artists.map(a=>`<option value="${esc(a.id)}" ${row?.artist_id===a.id?'selected':''}>${esc(a.name)}</option>`).join('')}</select></label><label>Créditos de la canción<input name="artist" maxlength="240" required value="${esc(row?.artist||'')}" placeholder="Artista y colaboraciones"></label>`}<label>Universo<select name="universe" required>${options(artistMode?row?.universe:row?.genre,'Selecciona un universo…')}</select></label>${artistMode?`<label>Biografía<textarea name="bio" maxlength="3000" rows="4" placeholder="Presenta al artista…">${esc(row?.bio||'')}</textarea></label><label>Etiquetas, separadas por comas<input name="tags" value="${esc(row?.tags.join(', ')||'')}" maxlength="400" placeholder="Banda, Reino Unido…"></label>`:`<label>También aparece en<select name="secondary">${options(row?.theme_tags?.[0]||'','Solo su universo principal')}</select></label><label>Estado<select name="status"><option value="draft" ${row?.status!=='published'?'selected':''}>Borrador</option><option value="published" ${row?.status==='published'?'selected':''}>Publicada</option></select></label><label class="andromeda-admin-upload"><i class="bi bi-cloud-arrow-up" aria-hidden="true"></i><span data-admin-filename>${row?'Reemplazar archivo de audio':'Subir archivo de audio'}</span><input type="file" name="audio" accept=".mp3,.mpeg,.m4a,.ogg,.wav,.flac,audio/*" aria-label="Seleccionar audio"></label><p class="andromeda-admin-help">MP3, M4A, OGG, WAV o FLAC · Hasta 25 MB${row?' · El audio actual se conserva si no eliges otro.':''}</p>`}<p class="andromeda-admin-validation" role="status"></p><div class="andromeda-admin-form-actions"><button class="andromeda-admin-button" type="button" data-admin-cancel>Cancelar</button><button class="andromeda-admin-button andromeda-admin-button-primary" type="submit">Guardar ${artistMode?'artista':'canción'}</button></div></form>`;
    const form=editor.querySelector('form');
    editor.querySelectorAll('[data-admin-cancel]').forEach(b=>b.onclick=()=>{if(!busy){editor.hidden=true;editId=null;revokePreview();}});
    form.elements.cover.onchange=()=>{
      const file=form.elements.cover.files[0];revokePreview();
      if(file){if(file.size>5242880||!['image/jpeg','image/png','image/webp'].includes(file.type)){validation('La portada debe ser JPG, PNG o WebP de hasta 5 MB.',true);form.elements.cover.value='';return;}coverPreview=URL.createObjectURL(file);editor.querySelector('.andromeda-admin-cover>img').src=coverPreview;}
      else editor.querySelector('.andromeda-admin-cover>img').src=image;
    };
    if(!artistMode){
      form.elements.artist_id.onchange=()=>{const a=artists.find(a=>a.id===form.elements.artist_id.value);if(a){form.elements.artist.value=a.name;form.elements.universe.value=a.universe;if(!form.elements.cover.files.length)editor.querySelector('.andromeda-admin-cover>img').src=a.image;}validateDuplicate();};
      form.elements.title.oninput=validateDuplicate;
      form.elements.audio.onchange=()=>{editor.querySelector('[data-admin-filename]').textContent=form.elements.audio.files[0]?.name||(row?'Reemplazar archivo de audio':'Subir archivo de audio');};
    }
    form.onsubmit=event=>{event.preventDefault();save(form,row,artistMode);};
    if(innerWidth<1200)editor.scrollIntoView({behavior:'instant',block:'start'});
    form.querySelector('input:not([type="file"])')?.focus({preventScroll:true});
  }
  function validation(text,error=false){const node=root?.querySelector('.andromeda-admin-validation');if(node){node.textContent=text;node.dataset.error=String(error);}}
  const titleKey=value=>normalize(value).replace(/[^a-z0-9]/g,'');
  function validateDuplicate(){
    const form=root.querySelector('.andromeda-admin-form');if(!form?.elements.title)return false;
    const duplicate=songs.some(s=>s.id!==editId&&s.artist_id===form.elements.artist_id.value&&titleKey(s.title)===titleKey(form.elements.title.value));
    validation(duplicate?'Esta canción ya está en el catálogo de este artista.':form.elements.title.value&&form.elements.artist_id.value?'Sin coincidencias en el catálogo.':'',duplicate);return duplicate;
  }
  async function upload(db,bucket,file,uploads){
    const extensions=bucket==='andromeda-covers'?{jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'}:{mp3:'audio/mpeg',mpeg:'audio/mpeg',m4a:'audio/mp4',ogg:'audio/ogg',wav:'audio/wav',flac:'audio/flac'};
    const ext=file.name.split('.').pop().toLowerCase(),type=extensions[ext];
    if(!type||file.size>(bucket==='andromeda-covers'?5242880:26214400)||!file.size)throw new Error('Revisa el formato y el tamaño del archivo.');
    const path=`${verifiedUser}/${crypto.randomUUID()}.${ext}`;
    const body=file.slice(0,file.size,type);
    const {error}=await db.storage.from(bucket).upload(path,body,{contentType:type,cacheControl:'3600',upsert:false});if(error)throw error;
    uploads.push({bucket,path});return db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
  async function save(form,row,artistMode){
    if(busy||(!artistMode&&validateDuplicate())||!form.reportValidity())return;
    const currentRoot=root,uploads=[],user=verifiedUser;
    busy=true;form.querySelectorAll('button,input,select,textarea').forEach(el=>el.disabled=true);validation('Guardando…');
    try{
      if(!await checkAccess())throw new Error('Tu cuenta ya no tiene acceso de administración.');
      if(!currentRoot.isConnected||verifiedUser!==user)return;
      const db=await catalog.client();
      const val=name=>String(form.elements[name]?.value||'').trim();
      const artist=artistMode?null:artists.find(a=>a.id===val('artist_id'));
      if(!artistMode&&!artist)throw new Error('Selecciona un artista.');
      if(!artistMode&&!row&&!form.elements.audio.files[0])throw new Error('Selecciona el archivo de audio de la canción.');
      let image=row?.image||artist?.image;
      if(form.elements.cover.files[0])image=await upload(db,'andromeda-covers',form.elements.cover.files[0],uploads);
      if(!image)throw new Error('Agrega la portada del artista.');
      let payload;
      if(artistMode){payload={name:val('name'),genre:val('genreLabel'),universe:val('universe'),image,bio:val('bio'),tags:val('tags').split(',').map(s=>s.trim()).filter(Boolean)};if(!row)payload.id=titleKey(val('name')).slice(0,70)+'-'+crypto.randomUUID().slice(0,8);}
      else{
        const audio=form.elements.audio.files[0]?await upload(db,'andromeda-audio',form.elements.audio.files[0],uploads):row?.audio;
        payload={title:val('title'),artist:val('artist'),artist_id:artist.id,genre:val('universe'),theme_tags:val('secondary')&&val('secondary')!==val('universe')?[val('secondary')]:[],audio,image,status:val('status')};
      }
      const table=artistMode?'music_artists':'music_songs';
      if(row)payload.revision=row.revision+1;
      const request=row?db.from(table).update(payload).eq('id',row.id).eq('revision',row.revision):db.from(table).insert(payload);
      const result=await request.select('id');if(result.error)throw result.error;
      if(!result.data?.length)throw new Error('Este registro cambió en otra sesión o tu permiso fue retirado. Actualiza el catálogo.');
      uploads.length=0;catalog.invalidate();revokePreview();editId=null;
      if(artistMode&&row&&image!==row.image){message('Artista guardado. La nueva portada se usará en sus canciones, perfil y colecciones.');}
      await reload();message(artistMode?'Artista guardado.':payload.status==='published'?'Canción guardada y publicada en el sitio.':'Borrador guardado. Solo lo ven los administradores.');
      await catalog.hydrateHome();
    }catch(error){
      const db=await catalog.client();await Promise.allSettled(uploads.map(u=>db.storage.from(u.bucket).remove([u.path])));
      const storageCode=error.error||error.code;
      const text=storageCode==='InvalidMimeType'||/mime type.*not supported/i.test(error.message||'')?'Revisa el formato del archivo: el servidor no lo reconoce como audio o imagen compatible.':storageCode==='EntityTooLarge'||String(error.statusCode)==='413'?'Revisa el tamaño del archivo: audio hasta 25 MB y portadas hasta 5 MB.':error.code==='23505'?'Ya existe una canción o artista con esos datos.':error.code==='42501'?'Tu cuenta no tiene permiso para guardar este cambio.':error.message?.startsWith('Selecciona')||error.message?.startsWith('Agrega')||error.message?.startsWith('Revisa')||error.message?.startsWith('Este registro')?error.message:'No pudimos guardar. Revisa tu conexión, el espacio disponible y vuelve a intentar.';
      if(currentRoot.isConnected){validation(text,true);message(text,true);}
    }finally{busy=false;if(form.isConnected)form.querySelectorAll('button,input,select,textarea').forEach(el=>el.disabled=false);}
  }
  async function confirmAction(title,copy){
    const dialog=root.querySelector('.andromeda-admin-confirm');dialog.querySelector('h2').textContent=title;dialog.querySelector('p').textContent=copy;dialog.returnValue='cancel';dialog.showModal();
    return new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true}));
  }
  async function remove(id){
    if(busy)return;
    const artistMode=view==='artists',row=(artistMode?artists:songs).find(s=>s.id===id);if(!row)return;
    if(artistMode&&songs.some(s=>s.artist_id===id)){message('Este artista tiene canciones. Reasígnalas o elimínalas antes de eliminar su perfil.',true);return;}
    if(!await confirmAction(`Eliminar ${artistMode?'artista':'canción'}`,`¿Quieres eliminar «${artistMode?row.name:row.title}» del catálogo? ${artistMode?'':'También puedes editarla y pasarla a borrador para conservarla.'} Los archivos de audio y portada se conservarán.`))return;
    busy=true;
    try{
      if(!await checkAccess())return;
      const db=await catalog.client();const result=await db.from(artistMode?'music_artists':'music_songs').delete().eq('id',id).eq('revision',row.revision).select('id');
      if(result.error||!result.data?.length)throw result.error||new Error('conflict');
      catalog.invalidate();await reload();message('Registro eliminado del catálogo.');await catalog.hydrateHome();
    }catch{message('No pudimos eliminarlo. Actualiza el catálogo y revisa tus permisos.',true);}finally{busy=false;}
  }
  function renderTiles(content){
    if(view==='overview'){
      content.innerHTML=`<div class="andromeda-admin-tiles"><article class="andromeda-admin-tile"><h2>Canciones</h2><button class="andromeda-admin-button andromeda-admin-button-primary" data-open-songs>Gestionar canciones</button></article><article class="andromeda-admin-tile"><h2>Artistas</h2><button class="andromeda-admin-button" data-open-artists>Gestionar artistas</button></article><article class="andromeda-admin-tile"><h2>Administradores</h2><button class="andromeda-admin-button" data-open-access>Gestionar acceso</button></article></div>`;
      for(const id of ['songs','artists','access'])content.querySelector(`[data-open-${id}]`).onclick=()=>changeView(id);return;
    }
    const data=view==='universes'?Object.keys(labels).map(id=>({id,name:universeNames[id],image:`assets/universe-${id}-v2.webp`,songs:songs.filter(s=>s.status==='published'&&(s.genre===id||s.theme_tags.includes(id))),copy:colorLabels[id]})):artists.map(a=>({...a,songs:songs.filter(s=>s.artist_id===a.id&&s.status==='published')})).filter(a=>a.songs.length);
    content.innerHTML=`<div class="andromeda-admin-tiles">${data.map(item=>`<article class="andromeda-admin-tile"><img src="${esc(view==='universes'?universeImage(item.id):item.image)}" alt="" loading="lazy"><h2>${esc(item.name)}</h2><p>${item.songs.length} ${item.songs.length===1?'canción publicada':'canciones publicadas'}${item.copy?' · '+item.copy:''}</p><button class="andromeda-admin-button" type="button" data-filter-catalog="${esc(item.id)}">Ver canciones <i class="bi bi-arrow-up-right" aria-hidden="true"></i></button></article>`).join('')}</div>`;
    content.querySelectorAll('[data-filter-catalog]').forEach(button=>button.onclick=()=>{const id=button.dataset.filterCatalog,wasUniverse=view==='universes';changeView('songs');if(wasUniverse){universe=id;root.querySelector('[data-admin-universe]').value=id;}else{query=artists.find(a=>a.id===id).name;root.querySelector('.andromeda-admin-search input').value=query;}renderRows();});
  }
  function universeImage(id){return document.querySelector(`.home-universe-card[data-theme="${id}"] img`)?.getAttribute('src')||({'rock':'assets/universe-rock-v3.webp','pop':'assets/universe-pop-v3.webp','hiphop':'assets/universe-hiphop-v3.webp','celestial':'assets/universe-celestial-v2.webp','aurora':'assets/universe-aurora-v2.webp'}[id])||'assets/universe-electronic-v2.webp';}
  function renderAccess(content){
    content.innerHTML=`<article class="andromeda-admin-guide"><p class="andromeda-admin-eyebrow">Acceso admin</p><a class="andromeda-admin-button" href="https://supabase.com/dashboard/project/tiqwiqwtobuldmncrnrp/sql/new" target="_blank" rel="noopener">Abrir SQL Editor <i class="bi bi-arrow-up-right" aria-hidden="true"></i></a><h2>Asignar administrador</h2><pre>insert into public.catalog_admins (user_id)
select id from auth.users
where lower(email) = lower('correo@ejemplo.com')
on conflict (user_id) do nothing;</pre><h2>Retirar administrador</h2><pre>delete from public.catalog_admins
where user_id in (
  select id from auth.users
  where lower(email) = lower('correo@ejemplo.com')
);</pre></article>`;
  }

  window.initAdmin=async()=>{root=document.querySelector('.andromeda-admin');if(!root)return;view='songs';query='';universe='';publication='';page=0;await checkAccess(true);};
  document.addEventListener('DOMContentLoaded',async()=>{
    const db=await catalog.client();
    db.auth.onAuthStateChange(()=>{setTimeout(()=>checkAccess(),0);});
    checkAccess();
    window.addEventListener('focus',()=>checkAccess());
    window.addEventListener('sonora-profile-open',()=>checkAccess());
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkAccess();});
    permissionTimer=setInterval(()=>{if(verifiedUser || window.sonoraAccount?.user || root?.isConnected)checkAccess();},45000);
  });
})();
