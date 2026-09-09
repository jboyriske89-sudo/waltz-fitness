const state = {
  step: 0,
  profile: {
    gender: null, age: 30, bodyType: null, goal: null, weight: 75, height: 175,
    focus: [], experience: null, location: null, days: 5, limitations: ""
  },
  selectedWeek: 1,
  completed: JSON.parse(localStorage.getItem("waltzCompleted") || "{}")
};

const steps = [
  renderGender, renderAge, renderBodyType, renderGoal, renderMeasurements,
  renderFocus, renderExperience, renderLocation, renderSchedule
];

const exerciseDB = {
  chest: [
    ["Barbell Bench Press","Chest","4","6-10","90 sec"],
    ["Incline Dumbbell Press","Upper Chest","3","8-12","75 sec"],
    ["Cable Fly","Chest","3","12-15","60 sec"],
    ["Push-Up","Chest","3","AMRAP","60 sec"]
  ],
  back: [
    ["Lat Pulldown","Lats","4","8-12","75 sec"],
    ["Seated Cable Row","Mid Back","4","8-12","75 sec"],
    ["Chest-Supported Row","Upper Back","3","10-12","75 sec"],
    ["Straight-Arm Pulldown","Lats","3","12-15","60 sec"]
  ],
  biceps: [
    ["EZ-Bar Curl","Biceps","3","8-12","60 sec"],
    ["Incline Dumbbell Curl","Biceps","3","10-12","60 sec"],
    ["Hammer Curl","Brachialis","3","10-14","60 sec"]
  ],
  triceps: [
    ["Rope Pushdown","Triceps","3","10-15","60 sec"],
    ["Overhead Cable Extension","Long Head Triceps","3","10-12","60 sec"],
    ["Assisted Dip","Triceps","3","8-12","75 sec"]
  ],
  shoulders: [
    ["Seated Dumbbell Shoulder Press","Shoulders","4","8-12","75 sec"],
    ["Cable Lateral Raise","Side Delts","4","12-15","45 sec"],
    ["Reverse Pec Deck","Rear Delts","3","12-15","45 sec"],
    ["Face Pull","Rear Delts","3","12-15","45 sec"]
  ],
  glutes: [
    ["Barbell Hip Thrust","Glutes","4","8-12","90 sec"],
    ["Bulgarian Split Squat","Glutes / Quads","3","8-12 / leg","75 sec"],
    ["Cable Kickback","Glutes","3","12-15 / leg","45 sec"],
    ["Hip Abduction","Glute Medius","3","15-20","45 sec"]
  ],
  quads: [
    ["Back Squat","Quadriceps","4","6-10","120 sec"],
    ["Leg Press","Quadriceps","4","10-12","90 sec"],
    ["Leg Extension","Quadriceps","3","12-15","60 sec"]
  ],
  hamstrings: [
    ["Romanian Deadlift","Hamstrings","4","8-10","90 sec"],
    ["Seated Leg Curl","Hamstrings","4","10-15","60 sec"],
    ["Lying Leg Curl","Hamstrings","3","10-15","60 sec"]
  ],
  calves: [
    ["Standing Calf Raise","Calves","4","10-15","45 sec"],
    ["Seated Calf Raise","Calves","3","12-20","45 sec"]
  ],
  abs: [
    ["Cable Crunch","Abs","3","12-15","45 sec"],
    ["Hanging Knee Raise","Lower Abs","3","10-15","45 sec"],
    ["Plank","Core","3","30-60 sec","45 sec"]
  ]
};

function show(id){
  document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
function startOnboarding(){
  show("onboarding"); document.getElementById("resetBtn").classList.remove("hidden"); state.step=0; renderStep();
}
function resetApp(){ localStorage.removeItem("waltzProfile"); localStorage.removeItem("waltzPlan"); localStorage.removeItem("waltzCompleted"); location.reload(); }
document.getElementById("resetBtn").onclick=resetApp;

function renderStep(){
  const pct=Math.round((state.step+1)/steps.length*100);
  document.getElementById("stepLabel").textContent=`Step ${state.step+1} of ${steps.length}`;
  document.getElementById("stepPercent").textContent=`${pct}%`;
  document.getElementById("progressBar").style.width=`${pct}%`;
  document.getElementById("backBtn").style.visibility=state.step===0?"hidden":"visible";
  document.getElementById("nextBtn").textContent=state.step===steps.length-1?"Build My 12-Week Plan":"Continue";
  steps[state.step]();
}
function nextStep(){
  if(!validateCurrent()) return;
  if(state.step<steps.length-1){ state.step++; renderStep(); } else buildPlan();
}
function prevStep(){ if(state.step>0){state.step--;renderStep();} }
function selectSingle(key,val,el){
  state.profile[key]=val; el.closest(".option-grid").querySelectorAll(".option-card").forEach(x=>x.classList.remove("selected")); el.classList.add("selected");
}
function toggleFocus(val,el){ const a=state.profile.focus; const i=a.indexOf(val); if(i>=0){a.splice(i,1);el.classList.remove("selected")}else{a.push(val);el.classList.add("selected")} }
function card(title,desc,onclick,selected=false,extra=""){ return `<button type="button" class="option-card ${selected?"selected":""}" onclick="${onclick}">${extra}<h3>${title}</h3><p>${desc}</p></button>` }
function wrap(title,subtitle,body){ document.getElementById("stepHost").innerHTML=`<div class="step"><h2>${title}</h2><p>${subtitle}</p>${body}</div>` }

function renderGender(){
  wrap("First, tell us about you","Choose the option that best fits how you want the app and exercise demos presented.",`<div class="option-grid">
  ${card("Man","Male exercise demonstrations and default training templates.",`selectSingle('gender','male',this)`,state.profile.gender==="male","<div class='icon-figure'><div class='body-silhouette athletic'></div></div>")}
  ${card("Woman","Female exercise demonstrations and default training templates.",`selectSingle('gender','female',this)`,state.profile.gender==="female","<div class='icon-figure'><div class='body-silhouette curvy'></div></div>")}
  </div>`);
}
function renderAge(){
  wrap("How old are you?","Age helps us set a sensible starting volume and recovery profile.",`<div class="field-grid"><div class="field"><label>AGE</label><input id="age" type="number" min="16" max="80" value="${state.profile.age}" oninput="state.profile.age=+this.value"></div></div>`);
}
function renderBodyType(){
  wrap("Which body shape looks closest?","This is only a visual preference and does not determine your training plan by itself.",`<div class="option-grid three">
  ${card("Lean","Naturally slimmer frame.",`selectSingle('bodyType','lean',this)`,state.profile.bodyType==="lean","<div class='icon-figure'><div class='body-silhouette lean'></div></div>")}
  ${card("Athletic","Moderate muscular frame.",`selectSingle('bodyType','athletic',this)`,state.profile.bodyType==="athletic","<div class='icon-figure'><div class='body-silhouette athletic'></div></div>")}
  ${card("Curvy / Broad","Fuller or broader frame.",`selectSingle('bodyType','curvy',this)`,state.profile.bodyType==="curvy","<div class='icon-figure'><div class='body-silhouette curvy'></div></div>")}
  </div>`);
}
function renderGoal(){
  const opts=[["lose-fat","Lose fat","Improve conditioning while preserving muscle."],["build-muscle","Build muscle","Prioritize hypertrophy and progressive overload."],["strength","Get stronger","Focus on major lifts and strength progression."],["tone","Tone & define","Build lean muscle with balanced conditioning."],["fitness","Improve fitness","General strength, endurance, and consistency."]];
  wrap("What is your main goal?","Your goal has the biggest influence on exercise volume and progression.",`<div class="option-grid">${opts.map(o=>card(o[1],o[2],`selectSingle('goal','${o[0]}',this)`,state.profile.goal===o[0])).join("")}</div>`);
}
function renderMeasurements(){
  wrap("Your measurements","These help establish a baseline for your plan and progress tracking.",`<div class="field-grid">
    <div class="field"><label>WEIGHT (KG)</label><input type="number" min="35" max="300" value="${state.profile.weight}" oninput="state.profile.weight=+this.value"></div>
    <div class="field"><label>HEIGHT (CM)</label><input type="number" min="120" max="230" value="${state.profile.height}" oninput="state.profile.height=+this.value"></div>
  </div>`);
}
function renderFocus(){
  const options=["Full body","Abs","Glutes","Chest","Back","Shoulders","Biceps","Triceps","Quads","Hamstrings","Calves"];
  wrap("What do you want to focus on?","Select one or several areas. Your program will still train your whole body responsibly.",`<div class="option-grid three">${options.map(x=>card(x,"",`toggleFocus('${x.toLowerCase().replace(" ","-")}',this)`,state.profile.focus.includes(x.toLowerCase().replace(" ","-")))).join("")}</div>`);
}
function renderExperience(){
  const opts=[["beginner","Beginner","Less than 1 year of consistent resistance training."],["intermediate","Intermediate","1–3 years of consistent training."],["advanced","Advanced","3+ years and comfortable with compound lifts."]];
  wrap("What's your training level?","This changes starting volume, exercise selection, and progression.",`<div class="option-grid three">${opts.map(o=>card(o[1],o[2],`selectSingle('experience','${o[0]}',this)`,state.profile.experience===o[0])).join("")}</div>`);
}
function renderLocation(){
  wrap("Where do you train?","We'll use exercises that fit your available equipment.",`<div class="option-grid">
  ${card("Gym","Full gym equipment, machines, cables, dumbbells, and barbells.",`selectSingle('location','gym',this)`,state.profile.location==="gym")}
  ${card("Home","Bodyweight and basic home equipment.",`selectSingle('location','home',this)`,state.profile.location==="home")}
  </div>`);
}
function renderSchedule(){
  wrap("Final details","Choose your weekly schedule and add any limitations we should account for.",`<div class="field-grid">
  <div class="field"><label>DAYS PER WEEK</label><select onchange="state.profile.days=+this.value">${[3,4,5,6].map(n=>`<option value="${n}" ${state.profile.days===n?"selected":""}>${n} days</option>`).join("")}</select></div>
  <div class="field"><label>INJURIES / LIMITATIONS (OPTIONAL)</label><input style="font-size:16px" value="${state.profile.limitations}" placeholder="e.g. sensitive right shoulder" oninput="state.profile.limitations=this.value"></div>
  </div>`);
}
function validateCurrent(){
  const p=state.profile; const requirements=[p.gender,p.age,p.bodyType,p.goal,p.weight&&p.height,p.focus.length,p.experience,p.location,p.days];
  if(!requirements[state.step]){ alert("Please make a selection before continuing."); return false;} return true;
}

function buildPlan(){
  localStorage.setItem("waltzProfile",JSON.stringify(state.profile));
  show("loading");
  const msgs=["Analyzing your profile...","Balancing upper and lower body volume...","Building progressive overload phases...","Creating your 12-week schedule..."];
  let i=0; const t=setInterval(()=>{document.getElementById("loadingText").textContent=msgs[i++%msgs.length]},600);
  setTimeout(()=>{clearInterval(t); const plan=generateProgram(); localStorage.setItem("waltzPlan",JSON.stringify(plan)); state.plan=plan; renderDashboard(); show("dashboard");},2400);
}

function splitTemplate(){
  const p=state.profile;
  if(p.days===3) return [["Full Body A",["chest","back","quads","hamstrings","abs"]],["Full Body B",["shoulders","glutes","back","biceps","triceps"]],["Full Body C",["chest","quads","hamstrings","shoulders","abs"]]];
  if(p.days===4) return [["Upper A",["chest","back","shoulders","triceps"]],["Lower A",["glutes","quads","hamstrings","calves"]],["Upper B",["back","chest","shoulders","biceps"]],["Lower B",["glutes","quads","hamstrings","abs"]]];
  if(p.days===5 && p.gender==="female") return [["Glutes",["glutes","hamstrings","abs"]],["Back + Biceps",["back","biceps"]],["Legs",["quads","hamstrings","calves"]],["Shoulders + Triceps",["shoulders","triceps"]],["Legs + Glutes",["glutes","quads","hamstrings"]]];
  if(p.days===5) return [["Chest + Triceps",["chest","triceps"]],["Back + Biceps",["back","biceps"]],["Legs",["quads","hamstrings","glutes","calves"]],["Shoulders + Triceps",["shoulders","triceps"]],["Chest + Back + Biceps",["chest","back","biceps"]]];
  return [["Push",["chest","shoulders","triceps"]],["Pull",["back","biceps"]],["Legs A",["quads","glutes","calves"]],["Upper",["chest","back","shoulders"]],["Legs B",["hamstrings","glutes","quads"]],["Arms + Core",["biceps","triceps","abs"]]];
}

function makeExercise(name,muscle,sets,reps,rest,week,idx){
  const p=state.profile; let s=+sets;
  if(p.experience==="beginner") s=Math.max(2,s-1);
  if(week>=5 && week<=8) s+=1;
  if(week>=9) reps = reps.includes("-") ? reps.split("-").map((x,i)=>Math.max(4,+x-(i?2:2))).join("-") : reps;
  return {id:`${name}-${week}-${idx}`.replace(/\s+/g,"-").toLowerCase(),name,muscle,sets:s,reps,rest,videoGender:p.gender};
}
function generateProgram(){
  const split=splitTemplate(), focus=state.profile.focus;
  const weeks=[];
  for(let w=1;w<=12;w++){
    const workouts=split.map((day,di)=>{
      let groups=[...day[1]];
      const focusGroups=focus.map(x=>x.replace("full-body","")).filter(Boolean);
      for(const f of focusGroups){ if(exerciseDB[f] && !groups.includes(f)) groups.push(f); }
      const ex=[]; groups.forEach(g=>{ (exerciseDB[g]||[]).slice(0, g==="abs"||g==="calves"?2:3).forEach((e,ei)=>ex.push(makeExercise(...e,w,`${di}-${g}-${ei}`))); });
      const cap=state.profile.experience==="beginner"?7:9;
      return {day:di+1,name:day[0],exercises:ex.slice(0,cap),estimated:Math.min(85,30+ex.slice(0,cap).length*6)};
    });
    weeks.push({week:w,phase:phaseFor(w),workouts});
  }
  return {profile:state.profile,weeks};
}
function phaseFor(w){
  if(w<=2)return {name:"Foundation",desc:"Technique, control, and movement quality."};
  if(w<=4)return {name:"Base Volume",desc:"Build consistent training volume and confidence."};
  if(w<=8)return {name:"Progressive Overload",desc:"Gradually increase load, reps, or total quality work."};
  if(w<=11)return {name:"Intensification",desc:"Heavier work with focused accessory training."};
  return {name:"Consolidation",desc:"Finish strong, benchmark progress, and prepare for your next block."};
}

function renderDashboard(){
  const p=state.profile, goalNames={"lose-fat":"Fat Loss","build-muscle":"Muscle Building","strength":"Strength","tone":"Tone & Definition","fitness":"General Fitness"};
  document.getElementById("programTitle").textContent=`${goalNames[p.goal]} Program`;
  document.getElementById("programSubtitle").textContent=`${p.days} days/week • ${p.experience} • ${p.location}`;
  renderWeekSelector(); renderWeek(state.selectedWeek); updateProgress();
  setupTabs();
}
function renderWeekSelector(){
  document.getElementById("weekSelector").innerHTML=Array.from({length:12},(_,i)=>`<button class="week-chip ${state.selectedWeek===i+1?"active":""}" onclick="renderWeek(${i+1})">${i+1}</button>`).join("");
}
function renderWeek(w){
  state.selectedWeek=w; document.getElementById("currentWeek").textContent=w; renderWeekSelector();
  const week=state.plan.weeks[w-1], ph=week.phase; document.getElementById("phaseName").textContent=ph.name; document.getElementById("phaseDesc").textContent=ph.desc;
  document.getElementById("phaseProgress").style.width=`${Math.round(w/12*100)}%`;
  document.getElementById("workoutList").innerHTML=week.workouts.map((x,i)=>{
    const key=`w${w}d${i+1}`,done=state.completed[key];
    return `<div class="workout-card"><div><span class="mini-label">DAY ${i+1}</span><h3>${x.name} ${done?"✓":""}</h3><p>${x.exercises.length} exercises • ~${x.estimated} min</p></div><button onclick="openWorkout(${w},${i})">${done?"Review":"Start Workout"}</button></div>`
  }).join("");
  renderToday();
}
function setupTabs(){
  document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab,.tab-content").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.getElementById(b.dataset.tab+"Tab").classList.add("active")});
}
function renderToday(){
  const week=state.plan.weeks[state.selectedWeek-1], idx=(new Date().getDay()+6)%7, wi=Math.min(idx,week.workouts.length-1), x=week.workouts[wi];
  document.getElementById("todayWorkout").innerHTML=`<div class="workout-card"><div><span class="mini-label">TODAY</span><h3>${x.name}</h3><p>${x.exercises.length} exercises • ~${x.estimated} min</p></div><button onclick="openWorkout(${state.selectedWeek},${wi})">Start Workout</button></div>`;
}
function updateProgress(){
  const count=Object.values(state.completed).filter(Boolean).length,total=state.profile.days*12,pct=Math.round(count/total*100);
  document.getElementById("completedCount").textContent=count;document.getElementById("completionPercent").textContent=pct+"%";document.getElementById("streakCount").textContent=count?Math.min(count,7)+" days":"0 days";
}

function openWorkout(w,i){
  state.activeWorkout={w,i,e:0}; show("workoutPlayer"); renderExercise();
}
function renderExercise(){
  const {w,i,e}=state.activeWorkout, workout=state.plan.weeks[w-1].workouts[i], ex=workout.exercises[e], key=`w${w}d${i+1}-${e}`;
  const saved=JSON.parse(localStorage.getItem(key)||"{}");
  document.getElementById("playerHost").innerHTML=`<div class="player-card">
    <div class="video-placeholder">
      <div><div class="demo-person animate"><div class="head"></div><div class="torso"></div><div class="limb arm1"></div><div class="limb arm2"></div><div class="limb leg1"></div><div class="limb leg2"></div></div>
      <p><strong>${state.profile.gender==="female"?"Female":"Male"} exercise demo</strong><br><span style="color:#aaa">AI video slot ready for ${ex.name}</span></p></div>
    </div>
    <div class="player-body"><span class="mini-label">${workout.name} • Exercise ${e+1}/${workout.exercises.length}</span><h2>${ex.name}</h2>
    <div class="exercise-meta"><span class="badge">${ex.muscle}</span><span class="badge">${ex.sets} sets</span><span class="badge">${ex.reps} reps</span><span class="badge">Rest ${ex.rest}</span></div>
    <div class="set-table">${Array.from({length:ex.sets},(_,s)=>`<div class="set-row"><strong>Set ${s+1}</strong><input inputmode="decimal" placeholder="kg" value="${saved[s]?.weight||""}" id="wt-${s}"><input inputmode="numeric" placeholder="reps" value="${saved[s]?.reps||""}" id="rp-${s}"><button class="${saved[s]?.done?"done":""}" onclick="toggleSet(${s})">${saved[s]?.done?"✓":"Done"}</button></div>`).join("")}</div>
    <div class="player-actions"><button class="secondary" onclick="prevExercise()">Previous</button><button class="primary" onclick="nextExercise()">${e===workout.exercises.length-1?"Finish Workout":"Next Exercise"}</button></div>
    </div></div>`;
}
function saveSets(){
  const {w,i,e}=state.activeWorkout, ex=state.plan.weeks[w-1].workouts[i].exercises[e], key=`w${w}d${i+1}-${e}`,obj=JSON.parse(localStorage.getItem(key)||"{}");
  for(let s=0;s<ex.sets;s++){ obj[s]=obj[s]||{}; obj[s].weight=document.getElementById(`wt-${s}`)?.value||""; obj[s].reps=document.getElementById(`rp-${s}`)?.value||""; }
  localStorage.setItem(key,JSON.stringify(obj));
}
function toggleSet(s){
  saveSets(); const {w,i,e}=state.activeWorkout,key=`w${w}d${i+1}-${e}`,obj=JSON.parse(localStorage.getItem(key)||"{}");obj[s]=obj[s]||{};obj[s].done=!obj[s].done;localStorage.setItem(key,JSON.stringify(obj));renderExercise();
}
function nextExercise(){
  saveSets(); const a=state.activeWorkout, workout=state.plan.weeks[a.w-1].workouts[a.i];
  if(a.e<workout.exercises.length-1){a.e++;renderExercise()}else{state.completed[`w${a.w}d${a.i+1}`]=true;localStorage.setItem("waltzCompleted",JSON.stringify(state.completed));closeWorkout();}
}
function prevExercise(){ saveSets(); if(state.activeWorkout.e>0){state.activeWorkout.e--;renderExercise()} }
function closeWorkout(){ show("dashboard"); renderWeek(state.selectedWeek);updateProgress(); }

(function boot(){
  const p=localStorage.getItem("waltzProfile"),pl=localStorage.getItem("waltzPlan");
  if(p&&pl){state.profile=JSON.parse(p);state.plan=JSON.parse(pl);document.getElementById("resetBtn").classList.remove("hidden");renderDashboard();show("dashboard");}
})();
