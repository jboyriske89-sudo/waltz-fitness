// WALTZ guided exercise demo system.
// Uses a gender-neutral articulated mannequin, clear movement loops, target-muscle
// highlights, concise technique cues, and a demo-first -> log-sets flow.

const WALTZ_DEMOS = {
  "Barbell Bench Press": { motion:"horizontal-push", view:"front", primary:["Chest"], activation:["Triceps","Front delts"], how:["Lie with eyes under the bar and plant both feet.","Lower the bar under control toward mid-chest.","Keep shoulder blades set and wrists stacked.","Press up until the arms are straight without bouncing."] },
  "Incline Dumbbell Press": { motion:"horizontal-push", view:"front", primary:["Upper chest"], activation:["Triceps","Front delts"], how:["Set the bench to a low incline and brace your upper back.","Start dumbbells beside the upper chest.","Press up and slightly inward.","Lower slowly until elbows are just below the torso."] },
  "Cable Fly": { motion:"fly", view:"front", primary:["Chest"], activation:["Front delts"], how:["Stand tall with a slight forward lean.","Keep a soft bend in the elbows.","Bring the handles together in front of the chest.","Return slowly until the chest is comfortably stretched."] },
  "Push-Up": { motion:"pushup", view:"side", primary:["Chest"], activation:["Triceps","Core"], how:["Set hands slightly wider than shoulders.","Keep head, hips and heels in one line.","Lower the chest toward the floor with elbows controlled.","Push the floor away to return to the top."] },
  "Lat Pulldown": { motion:"vertical-pull", view:"front", primary:["Lats"], activation:["Biceps","Upper back"], how:["Grip the bar just outside shoulder width.","Keep the chest tall and ribs controlled.","Pull elbows down toward your sides.","Return the bar overhead without shrugging."] },
  "Seated Cable Row": { motion:"row", view:"front", primary:["Mid back","Lats"], activation:["Biceps","Rear delts"], how:["Sit tall with a neutral spine.","Start with shoulders relaxed and arms long.","Drive elbows back and squeeze the shoulder blades.","Return under control without rounding forward."] },
  "Chest-Supported Row": { motion:"row", view:"front", primary:["Upper back"], activation:["Lats","Biceps"], how:["Keep the chest supported and neck neutral.","Let the arms reach fully at the bottom.","Pull elbows back beside the torso.","Pause briefly, then lower slowly."] },
  "Straight-Arm Pulldown": { motion:"straight-pulldown", view:"front", primary:["Lats"], activation:["Core","Triceps"], how:["Stand tall with arms nearly straight overhead.","Brace your core and keep elbows softly bent.","Sweep the bar down toward the thighs.","Return overhead without losing torso position."] },
  "EZ-Bar Curl": { motion:"curl", view:"front", primary:["Biceps"], activation:["Forearms"], how:["Stand tall with elbows close to your sides.","Curl the bar without swinging the torso.","Squeeze the biceps near the top.","Lower until the elbows are almost fully straight."] },
  "Incline Dumbbell Curl": { motion:"curl", view:"front", primary:["Biceps"], activation:["Forearms"], how:["Lean back against the bench with arms hanging long.","Keep upper arms behind the torso.","Curl without moving the shoulders forward.","Lower slowly to a full stretch."] },
  "Hammer Curl": { motion:"curl", view:"front", primary:["Brachialis","Biceps"], activation:["Forearms"], how:["Hold dumbbells with palms facing each other.","Keep elbows fixed beside the torso.","Curl without rotating the wrists.","Lower slowly to the starting position."] },
  "Rope Pushdown": { motion:"triceps", view:"front", primary:["Triceps"], activation:["Forearms"], how:["Pin elbows beside your ribs.","Press the rope down by straightening the elbows.","Separate the rope slightly at the bottom.","Return only as far as you can keep elbows still."] },
  "Overhead Cable Extension": { motion:"overhead-triceps", view:"front", primary:["Triceps"], activation:["Core"], how:["Brace your ribs and keep elbows pointing forward.","Start with hands behind the head.","Straighten the elbows overhead.","Lower under control without flaring the elbows."] },
  "Assisted Dip": { motion:"dip", view:"front", primary:["Triceps","Chest"], activation:["Front delts"], how:["Keep shoulders down and chest slightly forward.","Lower by bending the elbows under control.","Stop before the shoulders roll forward.","Press through the handles to return to the top."] },
  "Seated Dumbbell Shoulder Press": { motion:"vertical-push", view:"front", primary:["Shoulders"], activation:["Triceps","Upper chest"], how:["Sit tall with ribs stacked over the pelvis.","Start dumbbells around shoulder height.","Press overhead without over-arching the back.","Lower until elbows return just below shoulder level."] },
  "Cable Lateral Raise": { motion:"lateral-raise", view:"front", primary:["Side delts"], activation:["Upper traps"], how:["Stand tall and keep the working elbow softly bent.","Raise the arm out to the side.","Stop around shoulder height.","Lower slowly without leaning or swinging."] },
  "Reverse Pec Deck": { motion:"rear-fly", view:"front", primary:["Rear delts"], activation:["Upper back"], how:["Keep chest supported and shoulders down.","Open the arms out and back in a wide arc.","Lead with the elbows rather than the hands.","Return slowly until the rear delts are stretched."] },
  "Face Pull": { motion:"face-pull", view:"front", primary:["Rear delts","Upper back"], activation:["Biceps","Rotator cuff"], how:["Set the rope around face height.","Pull toward the forehead while spreading the rope.","Finish with elbows high and shoulder blades back.","Return under control without shrugging."] },
  "Barbell Hip Thrust": { motion:"hip-thrust", view:"side", primary:["Glutes"], activation:["Hamstrings","Core"], how:["Set the upper back against the bench and feet flat.","Tuck the ribs and brace the core.","Drive through the heels until hips are fully extended.","Lower the hips under control without over-arching the back."] },
  "Bulgarian Split Squat": { motion:"split-squat", view:"side", primary:["Glutes","Quads"], activation:["Hamstrings","Core"], how:["Place the rear foot on a bench and set the front foot firmly.","Lower the back knee while keeping the front foot planted.","Let the torso lean slightly forward for glute emphasis.","Drive through the front foot to stand."] },
  "Cable Kickback": { motion:"kickback", view:"side", primary:["Glutes"], activation:["Hamstrings","Core"], how:["Brace your torso and keep the standing knee soft.","Drive the working leg back from the hip.","Keep the pelvis square and avoid arching the low back.","Return slowly until the hip is neutral."] },
  "Hip Abduction": { motion:"abduction", view:"front", primary:["Glute medius"], activation:["Glutes"], how:["Sit tall and brace lightly.","Press the knees outward against the pads.","Pause briefly at your comfortable end range.","Return slowly without letting the stack slam."] },
  "Back Squat": { motion:"squat", view:"front", primary:["Quadriceps","Glutes"], activation:["Hamstrings","Core"], how:["Set feet around shoulder width and brace your core.","Sit the hips down and slightly back while the knees track over the toes.","Keep the whole foot planted and chest controlled.","Drive through the floor to stand tall."] },
  "Leg Press": { motion:"leg-press", view:"side", primary:["Quadriceps","Glutes"], activation:["Hamstrings"], how:["Place the whole foot securely on the platform.","Lower the sled until the knees bend comfortably.","Keep the hips and low back against the pad.","Press through the feet without locking the knees aggressively."] },
  "Leg Extension": { motion:"leg-extension", view:"side", primary:["Quadriceps"], activation:["Hip flexors"], how:["Align the knee with the machine pivot.","Extend the knees until the legs are nearly straight.","Squeeze the quadriceps briefly at the top.","Lower under control to the starting bend."] },
  "Romanian Deadlift": { motion:"hinge", view:"side", primary:["Hamstrings","Glutes"], activation:["Back extensors","Core"], how:["Start tall with a soft bend in the knees.","Push the hips back while keeping the spine neutral.","Lower until you feel a strong hamstring stretch.","Drive the hips forward to stand without leaning back."] },
  "Seated Leg Curl": { motion:"leg-curl", view:"side", primary:["Hamstrings"], activation:["Calves"], how:["Keep hips and back firmly against the pad.","Curl the heels down and back.","Squeeze the hamstrings at the bottom.","Return slowly until the knees are almost straight."] },
  "Lying Leg Curl": { motion:"leg-curl", view:"side", primary:["Hamstrings"], activation:["Calves"], how:["Keep hips pressed into the bench.","Curl the heels toward the glutes.","Avoid lifting the pelvis as the knees bend.","Lower the weight slowly to full control."] },
  "Standing Calf Raise": { motion:"calf", view:"side", primary:["Calves"], activation:["Foot/ankle stabilizers"], how:["Keep knees softly straight and torso tall.","Rise onto the balls of the feet as high as comfortable.","Pause briefly at the top.","Lower the heels slowly through a full range."] },
  "Seated Calf Raise": { motion:"calf", view:"side", primary:["Calves"], activation:["Foot/ankle stabilizers"], how:["Keep the balls of the feet secure on the platform.","Raise the heels as high as comfortable.","Pause and squeeze the calves.","Lower slowly until you feel a stretch."] },
  "Cable Crunch": { motion:"crunch", view:"front", primary:["Abs"], activation:["Obliques"], how:["Kneel with the rope beside the head.","Keep the hips relatively still.","Curl the ribs toward the pelvis using the abs.","Return under control without pulling only with the arms."] },
  "Hanging Knee Raise": { motion:"knee-raise", view:"front", primary:["Lower abs"], activation:["Hip flexors","Grip"], how:["Hang tall with shoulders active.","Tuck the pelvis and lift the knees toward the chest.","Avoid swinging or using momentum.","Lower the legs slowly to the start."] },
  "Plank": { motion:"plank", view:"side", primary:["Core"], activation:["Glutes","Shoulders"], how:["Stack elbows below the shoulders.","Keep head, hips and heels in one line.","Brace the abs and squeeze the glutes.","Breathe normally while holding the position."] }
};

function demoFor(name){
  return WALTZ_DEMOS[name] || {motion:"general",view:"front",primary:["Target muscle"],activation:["Stabilizers"],how:["Set a stable starting position.","Move through a controlled, pain-free range.","Keep the target area working and avoid momentum.","Return slowly to the start."]};
}

function targetRegion(primary){
  const s=primary.join(' ').toLowerCase();
  if(/quad|hamstring|glute|calf|leg/.test(s)) return 'LOWER BODY';
  if(/chest|shoulder|tricep|bicep|back|lat|delt/.test(s)) return 'UPPER BODY';
  return 'CORE';
}

function mannequinSVG(ex){
  const d=demoFor(ex.name), m=d.motion;
  const primary='#38f36a', tension='#ff4d57', skin='#d9d9dc', shade='#9f9fa6';
  const region=targetRegion(d.primary);
  const front = d.view !== 'side';

  // Muscles are deliberately schematic: the goal is fast visual understanding,
  // while the articulated mannequin demonstrates the exercise path.
  const muscleMap = front ? `
    <g class="muscles primary-muscles" fill="${primary}" opacity=".95">
      ${/lower body/i.test(region)?'<ellipse cx="143" cy="238" rx="14" ry="43"/><ellipse cx="177" cy="238" rx="14" ry="43"/>':''}
      ${/upper body/i.test(region)?'<path d="M126 116 Q160 95 194 116 L188 145 Q160 134 132 145Z"/>':''}
      ${/core/i.test(region)?'<rect x="145" y="138" width="30" height="55" rx="12"/>':''}
    </g>
    <g class="muscles tension-muscles" fill="${tension}" opacity=".82">
      ${/lower body/i.test(region)?'<ellipse cx="143" cy="301" rx="10" ry="34"/><ellipse cx="177" cy="301" rx="10" ry="34"/>':''}
      ${/upper body/i.test(region)?'<ellipse cx="112" cy="135" rx="10" ry="28"/><ellipse cx="208" cy="135" rx="10" ry="28"/>':''}
      ${/core/i.test(region)?'<ellipse cx="132" cy="158" rx="8" ry="28"/><ellipse cx="188" cy="158" rx="8" ry="28"/>':''}
    </g>` : `
    <g class="muscles primary-muscles" fill="${primary}" opacity=".95">
      ${/lower body/i.test(region)?'<ellipse cx="171" cy="226" rx="23" ry="25"/><path d="M170 245 Q193 257 184 306 Q169 300 160 267Z"/>':''}
      ${/upper body/i.test(region)?'<path d="M145 113 Q181 109 193 145 L174 164 Q158 143 144 131Z"/>':''}
      ${/core/i.test(region)?'<path d="M145 137 Q175 136 177 185 L149 184Z"/>':''}
    </g>
    <g class="muscles tension-muscles" fill="${tension}" opacity=".84">
      ${/lower body/i.test(region)?'<path d="M181 253 Q196 278 188 314 L176 308 Q180 277 166 259Z"/>':''}
      ${/upper body/i.test(region)?'<ellipse cx="188" cy="151" rx="9" ry="26"/>':''}
      ${/core/i.test(region)?'<ellipse cx="151" cy="158" rx="7" ry="25"/>':''}
    </g>`;

  const frontFigure=`
    <g class="wman motion-${m}">
      <g class="w-head"><circle cx="160" cy="72" r="24" fill="${skin}"/><ellipse cx="168" cy="75" rx="9" ry="17" fill="#c6c6ca" opacity=".6"/></g>
      <g class="w-torso"><path d="M124 108 Q160 91 196 108 L184 196 Q160 208 136 196Z" fill="url(#bodyGrad)"/></g>
      ${muscleMap}
      <g class="w-arm left-arm"><rect x="104" y="112" width="24" height="70" rx="12" fill="${shade}"/><rect x="96" y="172" width="20" height="68" rx="10" fill="${skin}"/></g>
      <g class="w-arm right-arm"><rect x="192" y="112" width="24" height="70" rx="12" fill="${shade}"/><rect x="204" y="172" width="20" height="68" rx="10" fill="${skin}"/></g>
      <g class="w-leg left-leg"><rect x="134" y="190" width="26" height="82" rx="13" fill="${shade}"/><rect x="136" y="260" width="22" height="86" rx="11" fill="${skin}"/><ellipse cx="143" cy="348" rx="22" ry="8" fill="${skin}"/></g>
      <g class="w-leg right-leg"><rect x="160" y="190" width="26" height="82" rx="13" fill="${shade}"/><rect x="162" y="260" width="22" height="86" rx="11" fill="${skin}"/><ellipse cx="177" cy="348" rx="22" ry="8" fill="${skin}"/></g>
      ${equipmentSVG(m)}
    </g>`;

  const sideFigure=`
    <g class="wman side motion-${m}">
      <g class="w-head"><circle cx="169" cy="72" r="24" fill="${skin}"/><ellipse cx="178" cy="76" rx="8" ry="15" fill="#c0c0c5" opacity=".65"/></g>
      <g class="w-torso"><path d="M144 108 Q175 96 193 119 L178 195 Q156 201 143 186Z" fill="url(#bodyGrad)"/></g>
      ${muscleMap}
      <g class="w-arm right-arm"><rect x="178" y="116" width="22" height="68" rx="11" fill="${shade}"/><rect x="181" y="174" width="18" height="66" rx="9" fill="${skin}"/></g>
      <g class="w-leg right-leg"><rect x="154" y="188" width="28" height="86" rx="14" fill="${shade}"/><rect x="161" y="259" width="22" height="87" rx="11" fill="${skin}"/><ellipse cx="177" cy="349" rx="25" ry="8" fill="${skin}"/></g>
      <g class="w-leg left-leg" opacity=".72"><rect x="140" y="193" width="24" height="82" rx="12" fill="#8c8c93"/><rect x="145" y="261" width="20" height="84" rx="10" fill="#c7c7ca"/></g>
      ${equipmentSVG(m)}
    </g>`;

  return `<div class="waltz-demo-stage">
    <div class="demo-stage-label"><span>HOW TO DO IT</span><strong>${escapeHtml(ex.name).toUpperCase()}</strong></div>
    <div class="body-focus-strip"><span>FRONT</span><span class="active">${region}</span><span>BACK</span></div>
    <svg class="waltz-mannequin" viewBox="0 0 320 390" role="img" aria-label="Looping demonstration of ${escapeHtml(ex.name)}">
      <defs><linearGradient id="bodyGrad" x1="0" x2="1"><stop offset="0" stop-color="#eeeeef"/><stop offset=".5" stop-color="#b7b7bd"/><stop offset="1" stop-color="#f4f4f5"/></linearGradient><filter id="greenGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <ellipse cx="160" cy="358" rx="94" ry="12" fill="#000" opacity=".5"/>
      ${front?frontFigure:sideFigure}
    </svg>
    <div class="demo-legend"><span><i class="green"></i>Primary</span><span><i class="red"></i>Activation / tension</span></div>
  </div>`;
}

function equipmentSVG(m){
  const bar='#d8ff3f';
  if(/horizontal-push|squat/.test(m)) return `<g class="equipment"><rect x="86" y="103" width="148" height="8" rx="4" fill="${bar}"/><circle cx="92" cy="107" r="13" fill="#444"/><circle cx="228" cy="107" r="13" fill="#444"/></g>`;
  if(/curl/.test(m)) return `<g class="equipment"><rect x="102" y="225" width="116" height="7" rx="4" fill="${bar}"/></g>`;
  if(/vertical-pull|straight-pulldown|triceps|face-pull/.test(m)) return `<g class="equipment"><rect x="84" y="39" width="152" height="6" rx="3" fill="${bar}"/><line x1="160" y1="39" x2="160" y2="92" stroke="#777" stroke-width="3"/></g>`;
  return '';
}

function renderSetLogger(ex, workout, key, saved){
  return `<div class="waltz-log-panel hidden" id="exerciseLogPanel">
    <div class="player-body">
      <span class="mini-label">${workout.name}</span><h2>${escapeHtml(ex.name)}</h2>
      <div class="exercise-meta"><span class="badge">${escapeHtml(ex.muscle)}</span><span class="badge">${ex.sets} sets</span><span class="badge">${escapeHtml(ex.reps)} reps</span><span class="badge">Rest ${escapeHtml(ex.rest)}</span></div>
      <div class="set-table">${Array.from({length:ex.sets},(_,s)=>`<div class="set-row"><strong>Set ${s+1}</strong><input inputmode="decimal" placeholder="kg" value="${saved[s]?.weight||''}" id="wt-${s}"><input inputmode="numeric" placeholder="reps" value="${saved[s]?.reps||''}" id="rp-${s}"><button class="${saved[s]?.done?'done':''}" onclick="toggleSet(${s})">${saved[s]?.done?'✓':'Done'}</button></div>`).join('')}</div>
      <div class="player-actions"><button class="secondary" onclick="backToExerciseDemo()">Watch Demo</button><button class="primary" onclick="nextExercise()">Next</button></div>
    </div>
  </div>`;
}

function renderGuidedExercise(){
  const {w,i,e}=state.activeWorkout;
  const workout=state.plan.weeks[w-1].workouts[i], ex=workout.exercises[e], key=`w${w}d${i+1}-${e}`;
  const saved=JSON.parse(localStorage.getItem(key)||'{}'), d=demoFor(ex.name);
  document.getElementById('playerHost').innerHTML=`<div class="player-card guided-player">
    <div id="exerciseDemoPanel" class="waltz-demo-panel">
      ${mannequinSVG(ex)}
      <div class="player-body demo-copy">
        <span class="mini-label">${workout.name} • Exercise ${e+1}/${workout.exercises.length}</span>
        <h2>${escapeHtml(ex.name)}</h2>
        <section class="how-card"><h3>How to do it</h3><ol>${d.how.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol></section>
        <section class="target-card"><h3>Target</h3><div><span class="target-label primary">Primary</span><strong>${d.primary.map(escapeHtml).join(' • ')}</strong></div><div><span class="target-label tension">Activation</span><strong>${d.activation.map(escapeHtml).join(' • ')}</strong></div></section>
        <button class="primary start-exercise-btn" onclick="startLoggedExercise()">Start Exercise</button>
        <div class="demo-nav"><button class="secondary" onclick="prevExercise()">Previous exercise</button>${e===workout.exercises.length-1?'':'<button class="secondary" onclick="skipExerciseDemo()">Next demo</button>'}</div>
      </div>
    </div>
    ${renderSetLogger(ex,workout,key,saved)}
  </div>`;
}

window.startLoggedExercise=function(){
  document.getElementById('exerciseDemoPanel')?.classList.add('hidden');
  document.getElementById('exerciseLogPanel')?.classList.remove('hidden');
  document.getElementById('workoutPlayer')?.scrollIntoView({behavior:'smooth',block:'start'});
};
window.backToExerciseDemo=function(){
  saveSets();
  document.getElementById('exerciseLogPanel')?.classList.add('hidden');
  document.getElementById('exerciseDemoPanel')?.classList.remove('hidden');
};
window.skipExerciseDemo=function(){
  const a=state.activeWorkout, workout=state.plan.weeks[a.w-1].workouts[a.i];
  if(a.e<workout.exercises.length-1){a.e++;renderGuidedExercise();}
};

// Replace the original placeholder player completely.
window.renderExercise=renderGuidedExercise;
