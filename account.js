let waltzSupabase = null;
let waltzUser = null;
let waltzEntitled = false;

function accountConfigured(){
  const c=window.WALTZ_CONFIG||{};
  return Boolean(c.SUPABASE_URL && c.SUPABASE_ANON_KEY);
}

function initWaltzAccount(){
  if(!accountConfigured() || !window.supabase) return;
  waltzSupabase = window.supabase.createClient(window.WALTZ_CONFIG.SUPABASE_URL, window.WALTZ_CONFIG.SUPABASE_ANON_KEY);
  waltzSupabase.auth.onAuthStateChange(async (_event, session)=>{
    waltzUser=session?.user||null;
    await refreshEntitlement();
    renderAccountHeader();
  });
  hydrateAccount();
}

async function hydrateAccount(){
  if(!waltzSupabase) return;
  const {data:{session}}=await waltzSupabase.auth.getSession();
  waltzUser=session?.user||null;
  await refreshEntitlement();
  renderAccountHeader();
  if(waltzUser) await loadCloudState();
  if(location.search.includes('checkout=success')){
    history.replaceState({},'',location.pathname);
    await refreshEntitlement(true);
    if(waltzEntitled && state.plan){ renderDashboard(); show('dashboard'); }
  }
}

async function refreshEntitlement(retry=false){
  waltzEntitled=false;
  if(!waltzSupabase || !waltzUser) return;
  for(let i=0;i<(retry?5:1);i++){
    const {data}=await waltzSupabase.from('profiles').select('paid_access').eq('id',waltzUser.id).maybeSingle();
    waltzEntitled=Boolean(data?.paid_access);
    if(waltzEntitled) break;
    if(retry) await new Promise(r=>setTimeout(r,1200));
  }
}

function renderAccountHeader(){
  const host=document.getElementById('accountActions');
  if(!host) return;
  if(waltzUser){
    host.innerHTML=`<span class="user-chip">${escapeHtml(waltzUser.email||'Account')}</span><button class="ghost" onclick="logoutWaltz()">Log out</button>`;
  } else {
    host.innerHTML=`<button class="ghost" onclick="showLogin()">Log in</button>`;
  }
}

function showLogin(){
  document.getElementById('authTitle').textContent='Welcome back';
  document.getElementById('authCopy').textContent='Log in to access your private WALTZ Fitness program and progress.';
  document.getElementById('authMode').value='login';
  document.getElementById('authSubmit').textContent='Log in';
  document.getElementById('authSwitch').textContent='Need an account? Create one';
  show('account');
}

function showSignup(){
  document.getElementById('authTitle').textContent='Create your WALTZ account';
  document.getElementById('authCopy').textContent='Your profile, 12-week plan, workout history, weights, reps, and progress will belong to your account.';
  document.getElementById('authMode').value='signup';
  document.getElementById('authSubmit').textContent='Create account';
  document.getElementById('authSwitch').textContent='Already have an account? Log in';
  show('account');
}

function switchAuthMode(){
  document.getElementById('authMode').value==='signup'?showLogin():showSignup();
}

async function submitAuth(ev){
  ev.preventDefault();
  const err=document.getElementById('authError'); err.textContent='';
  if(!accountConfigured()){
    err.textContent='Account service is not connected yet. The app owner needs to add the Supabase project keys.'; return;
  }
  const email=document.getElementById('authEmail').value.trim();
  const password=document.getElementById('authPassword').value;
  const mode=document.getElementById('authMode').value;
  let result;
  if(mode==='signup') result=await waltzSupabase.auth.signUp({email,password});
  else result=await waltzSupabase.auth.signInWithPassword({email,password});
  if(result.error){err.textContent=result.error.message;return;}
  waltzUser=result.data.user||result.data.session?.user||null;
  if(!waltzUser){
    err.textContent='Check your email to confirm your account, then log in.'; return;
  }
  await saveCloudProfile();
  await refreshEntitlement();
  renderAccountHeader();
  if(waltzEntitled){ await loadCloudState(); renderDashboard(); show('dashboard'); }
  else showPaywall();
}

async function logoutWaltz(){
  if(waltzSupabase) await waltzSupabase.auth.signOut();
  waltzUser=null; waltzEntitled=false; renderAccountHeader(); show('welcome');
}

function showPaywall(){
  document.getElementById('paywallEmail').textContent=waltzUser?.email||'your account';
  show('paywall');
}

async function startCheckout(){
  const err=document.getElementById('paywallError'); err.textContent='';
  if(!waltzUser){showSignup();return;}
  const url=window.WALTZ_CONFIG?.CHECKOUT_FUNCTION_URL;
  if(!url){err.textContent='Payments are not connected yet. The app owner needs to finish the Stripe setup.';return;}
  const {data:{session}}=await waltzSupabase.auth.getSession();
  const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${session.access_token}`},body:JSON.stringify({success_url:`${location.origin}${location.pathname}?checkout=success`,cancel_url:`${location.origin}${location.pathname}?checkout=cancel`})});
  const body=await res.json().catch(()=>({}));
  if(!res.ok || !body.url){err.textContent=body.error||'Unable to start checkout.';return;}
  location.href=body.url;
}

async function saveCloudProfile(){
  if(!waltzSupabase || !waltzUser) return;
  await waltzSupabase.from('profiles').upsert({id:waltzUser.id,email:waltzUser.email,profile_json:state.profile,updated_at:new Date().toISOString()});
  if(state.plan) await waltzSupabase.from('programs').upsert({user_id:waltzUser.id,program_json:state.plan,updated_at:new Date().toISOString()},{onConflict:'user_id'});
}

async function saveCloudProgress(){
  if(!waltzSupabase || !waltzUser) return;
  await waltzSupabase.from('progress').upsert({user_id:waltzUser.id,completed_json:state.completed,updated_at:new Date().toISOString()},{onConflict:'user_id'});
}

async function loadCloudState(){
  if(!waltzSupabase || !waltzUser) return;
  const [profileRes,programRes,progressRes]=await Promise.all([
    waltzSupabase.from('profiles').select('profile_json').eq('id',waltzUser.id).maybeSingle(),
    waltzSupabase.from('programs').select('program_json').eq('user_id',waltzUser.id).maybeSingle(),
    waltzSupabase.from('progress').select('completed_json').eq('user_id',waltzUser.id).maybeSingle()
  ]);
  if(profileRes.data?.profile_json) state.profile=profileRes.data.profile_json;
  if(programRes.data?.program_json){state.plan=programRes.data.program_json;localStorage.setItem('waltzPlan',JSON.stringify(state.plan));}
  if(progressRes.data?.completed_json){state.completed=progressRes.data.completed_json;localStorage.setItem('waltzCompleted',JSON.stringify(state.completed));}
}

function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

// Replace the MVP's final onboarding action with account + $10 paywall flow.
window.buildPlan=function(){
  localStorage.setItem('waltzProfile',JSON.stringify(state.profile));
  show('loading');
  const msgs=['Analyzing your profile...','Balancing upper and lower body volume...','Building progressive overload phases...','Creating your private 12-week schedule...'];
  let i=0; const t=setInterval(()=>{document.getElementById('loadingText').textContent=msgs[i++%msgs.length]},550);
  setTimeout(async()=>{
    clearInterval(t);
    state.plan=generateProgram();
    localStorage.setItem('waltzPlan',JSON.stringify(state.plan));
    if(waltzUser) await saveCloudProfile();
    if(waltzUser){await refreshEntitlement(); waltzEntitled?unlockDashboard():showPaywall();}
    else showSignup();
  },2200);
};

async function unlockDashboard(){
  await saveCloudProfile();
  renderDashboard(); show('dashboard');
}

// Hook workout completion so progress is copied to the user's private cloud record.
const originalCloseWorkout=window.closeWorkout;
window.closeWorkout=function(){ originalCloseWorkout(); saveCloudProgress(); };

// Lock an existing local program behind the user's account when cloud auth is configured.
window.addEventListener('load',()=>{
  initWaltzAccount();
  setTimeout(()=>{
    if(accountConfigured() && state.plan && (!waltzUser || !waltzEntitled)){
      waltzUser?showPaywall():showLogin();
    }
  },400);
});
