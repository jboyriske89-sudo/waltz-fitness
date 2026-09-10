import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODEL_URL='https://raw.githubusercontent.com/UMRAM-Bilkent/supine-human-model/main/assets/human.glb';
const active=new Map();

function norm(s){return (s||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function findBones(root){
  const all=[]; root.traverse(o=>{if(o.isBone) all.push(o)});
  const pick=(...terms)=>all.find(b=>terms.some(t=>norm(b.name).includes(t)));
  return {
    lUpper:pick('upperarml','leftupperarm','lupperarm','upperarmleft','shoulderl'),
    rUpper:pick('upperarmr','rightupperarm','rupperarm','upperarmright','shoulderr'),
    lFore:pick('forearml','leftforearm','lforearm','lowerarml'),
    rFore:pick('forearmr','rightforearm','rforearm','lowerarmr'),
    lHand:pick('handl','lefthand','lhand'),
    rHand:pick('handr','righthand','rhand')
  };
}
function addEllipsoid(parent,pos,scale,color){
  const g=new THREE.SphereGeometry(1,28,18),m=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.45,roughness:.35,metalness:.05,transparent:true,opacity:.88});
  const x=new THREE.Mesh(g,m);x.position.set(...pos);x.scale.set(...scale);parent.add(x);return x;
}
function cylinderBetween(a,b,r,mat){
 const d=new THREE.Vector3().subVectors(b,a),len=d.length(),g=new THREE.CylinderGeometry(r,r,len,24),m=new THREE.Mesh(g,mat);
 m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());return m;
}
function buildBench(scene){
 const dark=new THREE.MeshStandardMaterial({color:0x181a1d,roughness:.65,metalness:.35});
 const metal=new THREE.MeshStandardMaterial({color:0x575b61,roughness:.35,metalness:.8});
 const pad=new THREE.Mesh(new THREE.BoxGeometry(.72,.16,2.55),dark);pad.position.set(0,.42,0);scene.add(pad);
 [[-.28,.12,-.82],[.28,.12,-.82],[-.28,.12,.82],[.28,.12,.82]].forEach(p=>{const l=new THREE.Mesh(new THREE.BoxGeometry(.1,.6,.1),metal);l.position.set(...p);scene.add(l)});
 const barMat=new THREE.MeshStandardMaterial({color:0xb9bec5,metalness:.9,roughness:.22});
 const bar=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,3.3,32),barMat);bar.rotation.z=Math.PI/2;bar.position.set(0,1.64,.05);scene.add(bar);
 [ -1.35,1.35].forEach(x=>{const plate=new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,.10,32),new THREE.MeshStandardMaterial({color:0x15171a,roughness:.5,metalness:.35}));plate.rotation.z=Math.PI/2;plate.position.set(x,1.64,.05);scene.add(plate)});
 return bar;
}
function addButtonHooks(container,state){
 container.querySelectorAll('[data-pose]').forEach(btn=>btn.addEventListener('click',()=>{state.manual=btn.dataset.pose;state.manualAt=performance.now()}));
 const play=container.querySelector('[data-play]'); if(play) play.addEventListener('click',()=>{state.manual=null;state.start=performance.now()});
}
export async function mountWaltz3D(container,exercise){
 if(!container||active.has(container))return;
 const state={manual:null,manualAt:0,start:performance.now()};active.set(container,state);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x050607);
 const camera=new THREE.PerspectiveCamera(32,16/9,.1,100);camera.position.set(3.7,2.75,4.6);camera.lookAt(0,.75,0);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;
 container.prepend(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xffffff,0x111318,2.0));const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(3,5,4);key.castShadow=true;scene.add(key);const rim=new THREE.DirectionalLight(0x8cff9a,2.0);rim.position.set(-4,3,-3);scene.add(rim);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.MeshStandardMaterial({color:0x090b0d,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
 const bar=buildBench(scene);
 const loader=new GLTFLoader();
 let human=null,bones={},bind={};
 try{
  const gltf=await loader.loadAsync(MODEL_URL);human=gltf.scene;human.scale.setScalar(.0137);human.rotation.x=-Math.PI/2;human.position.set(0,1.07,.03);
  human.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material=new THREE.MeshStandardMaterial({color:0xd8dde2,roughness:.52,metalness:.04})}});
  scene.add(human);bones=findBones(human);
  Object.entries(bones).forEach(([k,b])=>{if(b)bind[k]=b.quaternion.clone()});
  addEllipsoid(human,[-.14,1.19,.20],[.18,.09,.05],0x35ff68);addEllipsoid(human,[.14,1.19,.20],[.18,.09,.05],0x35ff68);
  addEllipsoid(human,[-.36,.94,.14],[.07,.18,.07],0xff4055);addEllipsoid(human,[.36,.94,.14],[.07,.18,.07],0xff4055);
 }catch(e){container.classList.add('three-load-error');const msg=container.querySelector('.three-status');if(msg)msg.textContent='3D model could not load';}
 const size=()=>{const w=Math.max(280,container.clientWidth);renderer.setSize(w,w*9/16,false);camera.aspect=16/9;camera.updateProjectionMatrix()};size();window.addEventListener('resize',size,{passive:true});
 addButtonHooks(container,state);
 const tmpE=new THREE.Euler();
 function setDelta(b,key,x,y,z){if(!b||!bind[key])return;b.quaternion.copy(bind[key]);tmpE.set(x,y,z,'XYZ');b.quaternion.multiply(new THREE.Quaternion().setFromEuler(tmpE));}
 function pose(p){
   const elbow=THREE.MathUtils.lerp(.15,1.28,p), abduct=THREE.MathUtils.lerp(.88,.48,p);
   setDelta(bones.lUpper,'lUpper',0,0,-abduct);setDelta(bones.rUpper,'rUpper',0,0,abduct);
   setDelta(bones.lFore,'lFore',0,0,-elbow);setDelta(bones.rFore,'rFore',0,0,elbow);
   if(bar)bar.position.y=THREE.MathUtils.lerp(1.64,1.19,p);
 }
 function animate(now){
   if(!document.body.contains(container)){renderer.dispose();active.delete(container);return}
   let p;
   if(state.manual){p=state.manual==='start'?0:state.manual==='lower'?1:.15}
   else{const t=((now-state.start)/6000)%1;p=t<.42?(t/.42):t<.52?1:(1-(t-.52)/.48);p=Math.max(0,Math.min(1,p));p=.5-.5*Math.cos(Math.PI*p)}
   pose(p);renderer.render(scene,camera);requestAnimationFrame(animate);
 }
 requestAnimationFrame(animate);
}
window.mountWaltz3D=mountWaltz3D;
window.mountVisibleWaltz3D=function(){document.querySelectorAll('.waltz-3d-host[data-exercise]').forEach(el=>mountWaltz3D(el,el.dataset.exercise));};
