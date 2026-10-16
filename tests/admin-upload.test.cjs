const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {File}=require('node:buffer');
const {randomUUID}=require('node:crypto');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','admin.js'),'utf8');
const code=source.slice(source.indexOf('  async function upload('),source.indexOf('  async function save('));
const upload=vm.runInNewContext(code+';upload',{verifiedUser:'admin',crypto:{randomUUID}});

test('El audio MPEG enviado como vídeo conserva sus bytes y sale con MIME de audio',async()=>{
 const file=new File(['ID3-audio-bytes'],'cancion.mp3.mpeg',{type:'video/mpeg'});
 const uploads=[];
 const db={storage:{from(bucket){assert.equal(bucket,'andromeda-audio');return {
  async upload(path,body,options){
   assert.equal(body.type,'audio/mpeg');
   assert.equal(options.contentType,'audio/mpeg');
   assert.equal(options.upsert,false);
   assert.deepEqual(Buffer.from(await body.arrayBuffer()),Buffer.from(await file.arrayBuffer()));
   const form=new FormData();form.append('file',body);
   const wire=await new Response(form).text();
   assert.match(wire,/Content-Type: audio\/mpeg/);
   assert.doesNotMatch(wire,/video\/mpeg/);
   return {error:null};
  },getPublicUrl(path){return {data:{publicUrl:'https://example.test/'+path}};}
 };}}};
 assert.match(await upload(db,'andromeda-audio',file,uploads),/^https:/);
 assert.equal(uploads.length,1);
});

test('No se inicia una subida para formatos o tamaños no admitidos',async()=>{
 const db={storage:{from(){assert.fail('No debe enviar archivos inválidos');}}};
 for(const file of [new File(['x'],'video.mp4'),new File([],'vacio.mp3'),{name:'grande.mp3',size:26214401}]){
  await assert.rejects(upload(db,'andromeda-audio',file,[]),/Revisa el formato y el tamaño/);
 }
});
