const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','artistas.js'),'utf8');
const catalogSource=fs.readFileSync(path.join(__dirname,'..','catalogo.js'),'utf8');
const helpers=catalogSource.slice(catalogSource.indexOf('  const featuredPriority'),catalogSource.indexOf('  const escape'));
const selection=vm.runInNewContext(helpers+';({matchesTheme,featuredArtists,featuredSongs})');
const code=source.slice(source.indexOf('    const featuredIds ='),source.indexOf('    /* UNIVERSO DEL ARTISTA */'));
function setup(profiles){
 const document={body:{dataset:{theme:'electronic'}}};
 const result=vm.runInNewContext(code+';({getFeaturedOrder,getFeaturedTrack})',{artistProfiles:profiles,document,window:{andromedaCatalog:{...selection,labels:{electronic:'',rock:'',pop:'',hiphop:'',celestial:'',aurora:''}}}});
 return {...result,document};
}
test('Cada universo abre con su artista principal y excluye artistas sin canciones afines',()=>{
 const selected={electronic:'daft-punk',rock:'queen',pop:'madonna',hiphop:'eminem',celestial:'steve-green',aurora:'luis-miguel'};
 const profiles={};
 for(const [theme,id] of Object.entries(selected)){
  profiles['other-'+theme]={universe:theme,tracks:[{genre:theme}]};
  profiles[id]={universe:theme,tracks:[{genre:theme}]};
 }
 const h=setup(profiles);
 for(const [theme,id] of Object.entries(selected)){
  h.document.body.dataset.theme=theme;
  assert.equal(h.getFeaturedOrder()[0],id);
  assert.ok(h.getFeaturedOrder().every(id=>profiles[id].tracks.some(s=>s.genre===theme)));
 }
});
test('Las prioridades ausentes no dejan huecos y los nuevos artistas siguen disponibles',()=>{
 const h=setup({'new-electronic':{universe:'electronic',tracks:[{genre:'electronic'}]},'alan-walker':{universe:'electronic',tracks:[{genre:'electronic'}]}});
 assert.deepEqual(Array.from(h.getFeaturedOrder()),['alan-walker','new-electronic']);
});
test('La canción destacada pertenece al universo seleccionado, incluso para artistas compartidos',()=>{
 const h=setup({});
 const profile={tracks:[{title:'Pop',genre:'pop'},{title:'Balada',genre:'aurora'},{title:'Crossover',genre:'rock',themeTags:'electronic'}]};
 h.document.body.dataset.theme='aurora';assert.equal(h.getFeaturedTrack(profile).title,'Balada');
 h.document.body.dataset.theme='electronic';assert.equal(h.getFeaturedTrack(profile).title,'Crossover');
});

test('La selección compartida de canciones sigue las mismas prioridades en todas las páginas',()=>{
 const songs=[{artistId:'eiffel-65',genre:'electronic'},{artistId:'alan-walker',genre:'electronic'},{artistId:'daft-punk',genre:'electronic'},{artistId:'queen',genre:'rock'}];
 assert.deepEqual(Array.from(selection.featuredSongs(songs,'electronic'),song=>song.artistId),['daft-punk','alan-walker','eiffel-65']);
 assert.equal(songs[0].artistId,'eiffel-65');
 for(const file of ['catalogo.js','explorar.js','albumes.js'])assert.match(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),/featuredSongs\(/);
});
