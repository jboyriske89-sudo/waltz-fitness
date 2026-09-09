function demoTypeForExercise(name){
  const n=name.toLowerCase();
  if(/squat|leg press|split squat|lunge/.test(n)) return 'squat';
  if(/deadlift|romanian/.test(n)) return 'hinge';
  if(/hip thrust|kickback|abduction/.test(n)) return 'glute';
  if(/bench|press|push-up|dip/.test(n)) return 'press';
  if(/row|pulldown|face pull|pulldown/.test(n)) return 'pull';
  if(/curl/.test(n)) return 'curl';
  if(/lateral raise|reverse pec/.test(n)) return 'raise';
  if(/extension|pushdown/.test(n)) return 'triceps';
  if(/crunch|knee raise|plank/.test(n)) return 'core';
  if(/calf/.test(n)) return 'calf';
  return 'general';
}

function exerciseDemoSVG(name, gender){
  const type=demoTypeForExercise(name);
  const torso = gender==='female' ? '#c7c7cb' : '#b8b8bd';
  const limb = '#a7a7ad';
  const accent = '#e7ff3c';
  const cycle='1.6s';
  let motion='';
  if(type==='squat') motion=`<animateTransform attributeName="transform" type="translate" values="0 0;0 28;0 0" dur="${cycle}" repeatCount="indefinite"/><animateTransform attributeName="transform" additive="sum" type="scale" values="1 1;1 .88;1 1" dur="${cycle}" repeatCount="indefinite"/>`;
  else if(type==='hinge') motion=`<animateTransform attributeName="transform" type="rotate" values="0 160 115;28 160 115;0 160 115" dur="${cycle}" repeatCount="indefinite"/>`;
  else if(type==='press') motion=`<animateTransform attributeName="transform" type="translate" values="0 18;0 -18;0 18" dur="${cycle}" repeatCount="indefinite"/>`;
  else if(type==='pull') motion=`<animateTransform attributeName="transform" type="translate" values="0 -8;0 14;0 -8" dur="${cycle}" repeatCount="indefinite"/>`;
  else if(type==='curl') motion=`<animateTransform attributeName="transform" type="rotate" values="0 160 120;-42 160 120;0 160 120" dur="${cycle}" repeatCount="indefinite"/>`;
  else if(type==='raise') motion=`<animateTransform attributeName="transform" type="rotate" values="0 160 105;-18 160 105;0 160 105" dur="${cycle}" repeatCount="indefinite"/>`;
  else if(type==='triceps') motion=`<animateTransform attributeName="transform" type="translate" values="0 -10;0 18;0 -10" dur="${cycle}" repeatCount="indefinite"/>`;
  else if(type==='glute') motion=`<animateTransform attributeName="transform" type="translate" values="0 14;0 -8;0 14" dur="${cycle}" repeatCount="indefinite"/>`;
  else if(type==='core') motion=`<animateTransform attributeName="transform" type="rotate" values="0 160 150;-18 160 150;0 160 150" dur="${cycle}" repeatCount="indefinite"/>`;
  else if(type==='calf') motion=`<animateTransform attributeName="transform" type="translate" values="0 8;0 -8;0 8" dur="1.2s" repeatCount="indefinite"/>`;
  else motion=`<animateTransform attributeName="transform" type="translate" values="0 0;0 -8;0 0" dur="${cycle}" repeatCount="indefinite"/>`;

  const equipment = type==='curl' ? `<line x1="100" y1="180" x2="220" y2="180" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>` :
    type==='press' ? `<line x1="90" y1="90" x2="230" y2="90" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>` :
    type==='squat' ? `<line x1="88" y1="86" x2="232" y2="86" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>` :
    type==='pull' ? `<line x1="78" y1="38" x2="242" y2="38" stroke="${accent}" stroke-width="7" stroke-linecap="round"/>` : '';

  return `<div class="exercise-visual" role="img" aria-label="Animated demonstration of ${name}">
  <svg viewBox="0 0 320 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="220" rx="18" fill="#111114"/>
    <text x="16" y="24" fill="#e7ff3c" font-size="11" font-family="system-ui" font-weight="700">ANIMATED EXERCISE DEMO</text>
    ${equipment}
    <g>${motion}
      <circle cx="160" cy="58" r="17" fill="#d8d8db"/>
      <rect x="137" y="77" width="46" height="67" rx="18" fill="${torso}"/>
      <line x1="143" y1="91" x2="112" y2="137" stroke="${limb}" stroke-width="13" stroke-linecap="round"/>
      <line x1="177" y1="91" x2="208" y2="137" stroke="${limb}" stroke-width="13" stroke-linecap="round"/>
      <line x1="149" y1="139" x2="132" y2="194" stroke="${limb}" stroke-width="15" stroke-linecap="round"/>
      <line x1="171" y1="139" x2="188" y2="194" stroke="${limb}" stroke-width="15" stroke-linecap="round"/>
    </g>
    <text x="160" y="211" text-anchor="middle" fill="#f1f1f2" font-size="13" font-family="system-ui" font-weight="700">${name}</text>
  </svg></div>`;
}

const baseRenderExercise=window.renderExercise;
window.renderExercise=function(){
  baseRenderExercise();
  try{
    const {w,i,e}=state.activeWorkout;
    const ex=state.plan.weeks[w-1].workouts[i].exercises[e];
    const slot=document.querySelector('.video-placeholder');
    if(slot) slot.innerHTML=exerciseDemoSVG(ex.name,state.profile.gender);
  }catch(_e){}
};
