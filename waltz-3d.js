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
function addWorldEllipsoid(scene,pos,scale,color){
  const g=new THREE.SphereGeometry(1,28,18);
  const m=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.25,roughness:.35,transparent:true,opacity:.82});
  const x=new THREE.Mesh(g,m);x.position.set(...pos);x.scale.set(...scale);scene.add(x);return x;
}
function buildBench(scene){
 const dark=new THREE.MeshStandardMaterial({color:0x181a1d,roughness:.65,metalness:.35});
 const metal=new THREE.MeshStandardMaterial({color:0x575b61,roughness:.35,metalness:.8});
 const pad=new THREE.Mesh(new THREE.BoxGeometry(.72,.16,2.25),dark);pad.position.set(0,.42,0);scene.add(pad);
 [[-.28,.12,-.82],[.28,.12,-.82],[-.28,.12,.82],[.28,.12,.82]].forEach(p=>{const l=new THREE.Mesh(new THREE.BoxGeometry(.1,.6,.1),metal);l.position.set(...p);scene.add(l)});
 const barMat=new THREE.MeshStandardMaterial({color:0xb9bec5,metalness:.9,roughness:.22});
 const bar=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,3.05,32),barMat);bar.rotation.z=Math.PI/2;bar.position.set(0,1.43,-.38);scene.add(bar);
 [-1.25,1.25].forEach(x=>{const plate=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.10,32),new THREE.MeshStandardMaterial({color:0x15171a,roughness:.5,metalness:.35}));plate.rotation.z=Math.PI/2;plate.position.set(x,1.43,-.38);scene.add(plate)});
 return bar;
}
function addButtonHooks(container,state){
 container.querySelectorAll('[data-pose]').forEach(btn=>btn.addEventListener('click',()=>{state.manual=btn.dataset.pose;}));
 const play=container.querySelector('[data-play]'); if(play) play.addEventListener('click',()=>{state.manual=null;state.start=performance.now()});
}
export async function mountWaltz3D(container,exercise){
 if(!container||active.has(container))return;
 const state={manual:null,start:performance.now()};active.set(container,state);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x050607);
 const camera=new THREE.PerspectiveCamera(34,16/9,.1,100);camera.position.set(3.0,2.35,3.75);camera.lookAt(0,.75,0);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 container.prepend(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xffffff,0x15181c,2.8));
 const key=new THREE.DirectionalLight(0xffffff,4.2);key.position.set(3,5,4);key.castShadow=true;scene.add(key);
 const rim=new THREE.DirectionalLight(0x57ff83,1.7);rim.position.set(-4,3,-3);scene.add(rim);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.MeshStandardMaterial({color:0x090b0d,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
 const bar=buildBench(scene);
 const loader=new GLTFLoader();
 let human=null,bones={},bind={};
 try{
  const gltf=await loader.loadAsync(MODEL_URL);human=gltf.scene;
  // The previous prototype used a hard-coded 0.0137 scale, making the person nearly invisible.
  // Normalize whatever scale is embedded in the GLB to a consistent 1.75 m adult.
  human.scale.setScalar(1);human.rotation.set(0,0,0);human.position.set(0,0,0);human.updateMatrixWorld(true);
  let box=new THREE.Box3().setFromObject(human), size=new THREE.Vector3();box.getSize(size);
  const sourceHeight=Math.max(size.x,size.y,size.z)||1;
  human.scale.setScalar(1.75/sourceHeight);
  // Original model is upright (+Y) and faces +Z. Lay it supine with its chest facing upward.
  human.rotation.x=-Math.PI/2;human.updateMatrixWorld(true);
  box.setFromObject(human);const center=new THREE.Vector3();box.getCenter(center);
  human.position.x-=center.x;human.position.z-=center.z;human.position.y+=.515-box.min.y;
  human.updateMatrixWorld(true);
  human.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material=new THREE.MeshStandardMaterial({color:0xd9dde2,roughness:.48,metalness:.02})}});
  scene.add(human);bones=findBones(human);
  Object.entries(bones).forEach(([k,b])=>{if(b)bind[k]=b.quaternion.clone()});
  // Simple WALTZ muscle overlays for this prototype. These remain separate so the mannequin skin stays consistent.
  addWorldEllipsoid(scene,[-.13,.79,-.36],[.15,.045,.10],0x35ff68);addWorldEllipsoid(scene,[.13,.79,-.36],[.15,.045,.10],0x35ff68);
  addWorldEllipsoid(scene,[-.34,.80,-.35],[.055,.05,.15],0xff4055);addWorldEllipsoid(scene,[.34,.80,-.35],[.055,.05,.15],0xff4055);
  const msg=container.querySelector('.three-status');if(msg)msg.remove();
 }catch(e){console.error('WALTZ 3D model load failed',e);container.classList.add('three-load-error');const msg=container.querySelector('.three-status');if(msg)msg.textContent='3D mannequin could not load';}
 const sizeCanvas=()=>{const w=Math.max(280,container.clientWidth);renderer.setSize(w,w*9/16,false);camera.aspect=16/9;camera.updateProjectionMatrix()};sizeCanvas();window.addEventListener('resize',sizeCanvas,{passive:true});
 addButtonHooks(container,state);
 const tmpE=new THREE.Euler();
 function setDelta(b,key,x,y,z){if(!b||!bind[key])return;b.quaternion.copy(bind[key]);tmpE.set(x,y,z,'XYZ');b.quaternion.multiply(new THREE.Quaternion().setFromEuler(tmpE));}
 function pose(p){
   const elbow=THREE.MathUtils.lerp(.12,1.18,p),abduct=THREE.MathUtils.lerp(.82,.46,p);
   setDelta(bones.lUpper,'lUpper',0,0,-abduct);setDelta(bones.rUpper,'rUpper',0,0,abduct);
   setDelta(bones.lFore,'lFore',0,0,-elbow);setDelta(bones.rFore,'rFore',0,0,elbow);
   if(bar)bar.position.y=THREE.MathUtils.lerp(1.43,1.02,p);
 }
 function animate(now){
   if(!document.body.contains(container)){renderer.dispose();active.delete(container);return}
   let p;
   if(state.manual){p=state.manual==='start'?0:state.manual==='lower'?1:.12;}
   else{const t=((now-state.start)/6000)%1;p=t<.42?t/.42:t<.52?1:1-(t-.52)/.48;p=Math.max(0,Math.min(1,p));p=.5-.5*Math.cos(Math.PI*p);}
   pose(p);renderer.render(scene,camera);requestAnimationFrame(animate);
 }
 requestAnimationFrame(animate);
}
window.mountWaltz3D=mountWaltz3D;
window.mountVisibleWaltz3D=function(){document.querySelectorAll('.waltz-3d-host[data-exercise]').forEach(el=>mountWaltz3D(el,el.dataset.exercise));};
