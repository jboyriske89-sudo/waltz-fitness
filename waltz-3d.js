import * as THREE from 'three';

const active=new Map();
const V=(x,y,z)=>new THREE.Vector3(x,y,z);

function mat(color,opts={}){return new THREE.MeshStandardMaterial({color,roughness:.42,metalness:.05,...opts});}
function capsuleBetween(scene,a,b,r,material){
  const d=new THREE.Vector3().subVectors(b,a),len=d.length();
  const g=new THREE.CapsuleGeometry(r,Math.max(.01,len-2*r),8,16);
  const m=new THREE.Mesh(g,material);m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());m.castShadow=true;scene.add(m);return m;
}
function sphere(scene,p,r,material){const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),material);m.position.copy(p);m.castShadow=true;scene.add(m);return m;}
function ellipsoid(scene,p,s,material){const m=sphere(scene,p,1,material);m.scale.set(...s);return m;}
function box(scene,size,p,material){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...p);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}

function buildBench(scene){
  const pad=mat(0x171a1d,{roughness:.7}), metal=mat(0x5c6167,{metalness:.8,roughness:.3});
  box(scene,[.78,.15,2.45],[0,.45,0],pad);
  [[-.28,.18,-.82],[.28,.18,-.82],[-.28,.18,.82],[.28,.18,.82]].forEach(p=>box(scene,[.10,.55,.10],p,metal));
}
function buildBar(scene){
  const barMat=mat(0xc5cad0,{metalness:.9,roughness:.2}),plateMat=mat(0x111317,{metalness:.3,roughness:.55});
  const bar=new THREE.Group();scene.add(bar);
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.032,.032,3.0,28),barMat);shaft.rotation.z=Math.PI/2;shaft.castShadow=true;bar.add(shaft);
  [-1.24,1.24].forEach(x=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.09,32),plateMat);p.rotation.z=Math.PI/2;p.position.x=x;p.castShadow=true;bar.add(p)});
  return bar;
}

function buildMannequin(scene){
  const skin=mat(0xd9dde2,{roughness:.48}), joint=mat(0xc8cdd2,{roughness:.5});
  const green=mat(0x35ff68,{emissive:0x35ff68,emissiveIntensity:1.1,roughness:.32});
  const red=mat(0xff4055,{emissive:0xff4055,emissiveIntensity:1.0,roughness:.32});
  const parts=[];
  const add=(m)=>{parts.push(m);return m};
  // static trunk/head lying flat on bench, head toward -Z
  add(ellipsoid(scene,V(0,.69,-.15),[.29,.16,.42],skin));
  add(ellipsoid(scene,V(0,.66,.34),[.23,.14,.28],skin));
  add(capsuleBetween(scene,V(0,.69,-.47),V(0,.69,-.58),.09,skin));
  add(ellipsoid(scene,V(0,.70,-.73),[.16,.18,.20],skin));
  // chest primary overlays
  add(ellipsoid(scene,V(-.14,.83,-.24),[.145,.035,.13],green));
  add(ellipsoid(scene,V(.14,.83,-.24),[.145,.035,.13],green));
  // hips
  add(ellipsoid(scene,V(0,.62,.62),[.27,.15,.22],skin));
  // legs: knees bent, both feet planted on floor
  const hips=[V(-.16,.61,.67),V(.16,.61,.67)], knees=[V(-.27,.78,1.10),V(.27,.78,1.10)], ankles=[V(-.30,.12,1.30),V(.30,.12,1.30)], toes=[V(-.30,.08,1.02),V(.30,.08,1.02)];
  for(let i=0;i<2;i++){
    add(capsuleBetween(scene,hips[i],knees[i],.095,skin));add(sphere(scene,knees[i],.105,joint));
    add(capsuleBetween(scene,knees[i],ankles[i],.082,skin));add(sphere(scene,ankles[i],.085,joint));
    add(capsuleBetween(scene,ankles[i],toes[i],.075,skin));
  }
  // dynamic arms are updated each frame
  const arm={};
  for(const side of ['l','r']){
    arm[side]={upper:capsuleBetween(scene,V(0,0,0),V(0,.1,0),.075,skin),fore:capsuleBetween(scene,V(0,0,0),V(0,.1,0),.065,skin),hand:ellipsoid(scene,V(0,0,0),[.07,.055,.11],skin),tri:capsuleBetween(scene,V(0,0,0),V(0,.1,0),.036,red)};
  }
  return {arm,skin,red};
}

function orientCapsule(mesh,a,b,r){
  const d=new THREE.Vector3().subVectors(b,a),len=d.length();
  mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.set(1,Math.max(.01,(len-2*r)/.1),1);
  mesh.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize());
}

function addButtonHooks(container,state){
  container.querySelectorAll('[data-pose]').forEach(btn=>btn.addEventListener('click',()=>state.manual=btn.dataset.pose));
  const play=container.querySelector('[data-play]');if(play)play.addEventListener('click',()=>{state.manual=null;state.start=performance.now()});
}

export async function mountWaltz3D(container,exercise){
  if(!container||active.has(container))return;
  const state={manual:null,start:performance.now()};active.set(container,state);
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x050607);
  const camera=new THREE.PerspectiveCamera(35,16/9,.1,100);camera.position.set(3.05,2.25,3.65);camera.lookAt(0,.72,.18);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;container.prepend(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff,0x111318,2.6));const key=new THREE.DirectionalLight(0xffffff,4.5);key.position.set(3,5,4);key.castShadow=true;scene.add(key);const rim=new THREE.DirectionalLight(0x4aff78,1.5);rim.position.set(-4,3,-2);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(12,12),mat(0x090b0d,{roughness:.95}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  buildBench(scene);const bar=buildBar(scene);const man=buildMannequin(scene);
  const msg=container.querySelector('.three-status');if(msg)msg.remove();
  const size=()=>{const w=Math.max(280,container.clientWidth);renderer.setSize(w,w*9/16,false);camera.aspect=16/9;camera.updateProjectionMatrix()};size();window.addEventListener('resize',size,{passive:true});addButtonHooks(container,state);

  function updateArm(side,p){
    const s=side==='l'?-1:1;
    const shoulder=V(.34*s,.78,-.24);
    const wrist=V(.62*s,THREE.MathUtils.lerp(1.38,.98,p),-.32);
    // elbow travels outward/down while wrists stay locked to the bar grip
    const elbow=V(.63*s,THREE.MathUtils.lerp(1.08,.78,p),-.20);
    const A=man.arm[side];
    // recreate geometry orientation by setting position/rotation and Y-scale relative to base .1 body length
    const set=(mesh,a,b)=>{const d=new THREE.Vector3().subVectors(b,a),len=d.length();mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.set(1,Math.max(.2,len/.1),1);mesh.quaternion.setFromUnitVectors(V(0,1,0),d.clone().normalize())};
    set(A.upper,shoulder,elbow);set(A.fore,elbow,wrist);
    A.hand.position.copy(wrist);A.hand.rotation.set(0,0,Math.PI/2);
    const triA=shoulder.clone().lerp(elbow,.18),triB=shoulder.clone().lerp(elbow,.78);set(A.tri,triA,triB);
    return wrist;
  }
  function pose(p){
    const left=updateArm('l',p),right=updateArm('r',p);
    const y=(left.y+right.y)/2;bar.position.set(0,y,-.32);
  }
  function animate(now){
    if(!document.body.contains(container)){renderer.dispose();active.delete(container);return}
    let p;
    if(state.manual)p=state.manual==='start'?0:state.manual==='lower'?1:.08;
    else{const t=((now-state.start)/6000)%1;p=t<.42?t/.42:t<.52?1:1-(t-.52)/.48;p=Math.max(0,Math.min(1,p));p=.5-.5*Math.cos(Math.PI*p)}
    pose(p);renderer.render(scene,camera);requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
window.mountWaltz3D=mountWaltz3D;
window.mountVisibleWaltz3D=function(){document.querySelectorAll('.waltz-3d-host[data-exercise]').forEach(el=>mountWaltz3D(el,el.dataset.exercise));};
