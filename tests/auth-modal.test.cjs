const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','musica.js'),'utf8');
const start=source.indexOf('    const passwordVisibility =');
const code=source.slice(start,source.indexOf('    /* ACTUALIZAR INTERFAZ */',start));
function setup({register=true,error=null,session=null}={}){
 const handlers={},nodes={};
 for(const id of ['authEmail','authPassword','authPasswordVisibility','authNotice']){
  nodes[id]={value:id==='authEmail'?' test@example.com ':'secret123',type:'password',hidden:true,attributes:{},addEventListener(event,fn){handlers[id+event]=fn;},setAttribute(key,value){this.attributes[key]=value;}};
 }
 let closed=false,reset=false,updates=0;
 const form={addEventListener(event,fn){handlers[event]=fn;},reportValidity:()=>true,setAttribute(){},removeAttribute(){},reset(){reset=true;}};
 const message={dataset:{},textContent:''},submit={disabled:false},sw={disabled:false};
 const context={document:{getElementById:id=>nodes[id]},authForm:form,authMessage:message,authSubmit:submit,authSwitch:sw,authOverlay:{classList:{remove(name){assert.equal(name,'show');closed=true;}}},registerMode:register,supabaseClient:{auth:{signUp:async()=>({data:{session},error}),signInWithPassword:async()=>({data:{session},error})}},updateUserInterface:async()=>{updates++;},setTimeout:()=>1,clearTimeout(){},console};
 vm.runInNewContext(code,context);
 return {nodes,message,submit,sw,handlers,run:()=>handlers.submit({preventDefault(){}}),state:()=>({closed,reset,updates})};
}
test('Registro con confirmación cierra el modal y conserva el aviso de correo fuera de él',async()=>{
 const h=setup();await h.run();assert.deepEqual(h.state(),{closed:true,reset:true,updates:0});
 assert.match(h.nodes.authNotice.textContent,/confirma tu cuenta/);assert.equal(h.nodes.authNotice.hidden,false);assert.equal(h.submit.disabled,false);
});
test('Registro con sesión e inicio de sesión cierran y actualizan el perfil',async()=>{
 for(const register of [true,false]){const h=setup({register,session:{user:{id:'u'}}});await h.run();assert.deepEqual(h.state(),{closed:true,reset:true,updates:1});}
});
test('Credenciales inválidas mantienen el formulario abierto y muestran un error legible',async()=>{
 const h=setup({register:false,error:{code:'invalid_credentials'}});await h.run();
 assert.equal(h.state().closed,false);assert.equal(h.state().reset,false);assert.match(h.message.textContent,/no son correctos/);assert.equal(h.message.dataset.state,'error');assert.equal(h.sw.disabled,false);
});
test('Mostrar contraseña alterna el campo y su etiqueta accesible',()=>{
 const h=setup();h.handlers.authPasswordVisibilityclick();assert.equal(h.nodes.authPassword.type,'text');assert.equal(h.nodes.authPasswordVisibility.attributes['aria-label'],'Ocultar contraseña');
 h.handlers.authPasswordVisibilityclick();assert.equal(h.nodes.authPassword.type,'password');
});
