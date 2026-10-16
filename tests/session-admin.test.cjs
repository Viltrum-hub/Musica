const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const repo=path.resolve(__dirname,'..');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};

test('Las consultas del perfil se ejecutan fuera del aviso de Auth',async()=>{
 const source=fs.readFileSync(path.join(repo,'musica.js'),'utf8');
 const start=source.indexOf('supabaseClient.auth.onAuthStateChange(');
 const end=source.indexOf('\n    );',start)+7;
 let callback,locked=false,loaded=0;const scheduled=[];
 vm.runInNewContext(source.slice(start,end),{
  supabaseClient:{auth:{onAuthStateChange(fn){callback=fn;}}},
  setTimeout(fn){scheduled.push(fn);},console,
  async updateUserInterface(session){assert.equal(locked,false);assert.equal(session.user.id,'account');loaded++;}
 });
 locked=true;callback('SIGNED_IN',{user:{id:'account'}});assert.equal(loaded,0);locked=false;
 for(const fn of scheduled)fn();await flush();assert.equal(loaded,1);
});

test('Abrir Mi perfil reconoce permisos nuevos y retirados sin recargar',async()=>{
 let isAdmin=false;const link={hidden:true},user={id:'account'};
 const window=new EventTarget(),document=new EventTarget();
 document.querySelectorAll=selector=>selector==='.admin-profile-link'?[link]:[];
 document.hidden=false;
 const db={auth:{getSession:async()=>({data:{session:{user}}}),getUser:async()=>({data:{user}}),onAuthStateChange(){}},from(table){assert.equal(table,'catalog_admins');const b={select(){return b;},eq(){return b;},maybeSingle:async()=>({data:isAdmin?{user_id:user.id}:null})};return b;}};
 window.sonoraAccount={client:db,user};window.andromedaCatalog={client:async()=>db,labels:{}};window.andromedaCore={escapeHTML:String,normalizeText:String};
 vm.runInNewContext(fs.readFileSync(path.join(repo,'admin.js'),'utf8'),{window,document,Event,setTimeout,setInterval(){},URL,console});
 document.dispatchEvent(new Event('DOMContentLoaded'));await flush();assert.equal(link.hidden,true);
 isAdmin=true;window.dispatchEvent(new Event('sonora-profile-open'));await flush();assert.equal(link.hidden,false);
 isAdmin=false;window.dispatchEvent(new Event('sonora-profile-open'));await flush();assert.equal(link.hidden,true);
});
