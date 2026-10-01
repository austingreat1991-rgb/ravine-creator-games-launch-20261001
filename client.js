/* Server-backed build. No creator directory or local XP/reward storage. */
(function(){
'use strict';
const root=document.getElementById('root');
const CFG={url:'https://wzlsestcuynztzwjidvj.supabase.co',key:'sb_publishable_mhwRXWamFhAnxUj5svJn6Q_ZQB_Sfht'};
const SKOOL='https://www.skool.com/ravine-trybe-6834/about';
const hints={post3:'Post three Ravine videos in Skool. Include the post links and what you want feedback on.',recreate:'Link the reference ad, then show your Ravine version. Borrow the format and film your own footage.',unaware:'Start with a situation your audience recognizes before introducing Ravine. Submit the video and explain the opening.',hooks:'Film three different openings for the same concept. Submit all three together.',revise:'Show the first cut, the feedback, and your new cut. Tell us what changed.',call:'Attend the weekly creator call. Include the date and one thing you will use in your next video.',one1:'Attend a 1:1 with Austin. Include the date and the next step you agreed on.',objection:'Make a video that answers one real customer objection. Include the objection and your video.',five:'Submit five distinct top or middle of funnel concepts. Include all five submission links.',comment:'Give another creator useful feedback on their video. Link your comment. Up to three per day and 30 XP per month.',streak:'Contribute something useful in Skool on seven consecutive days. Include dated links for review.',leader:'Finish first on the seven-day Skool leaderboard at the weekly cutoff. Austin verifies the dated snapshot.'};
let data=null,queue=null,tab='Home',generation=0,libQuery='',libCategory='All',libLimit=36;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toLocaleString('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
const card=(title,body)=>`<section class="card"><h3>${esc(title)}</h3>${body}</section>`;
function notify(text){const el=document.getElementById('message');if(el)el.textContent=text;}
async function rpc(name,args={}){
 const token=window.RCGAccess.get();
 if(!token)throw new Error('Personal link required');
 const response=await fetch(CFG.url+'/rest/v1/rpc/'+name,{
  method:'POST',cache:'no-store',referrerPolicy:'no-referrer',
  headers:{apikey:CFG.key,'Content-Type':'application/json'},
  body:JSON.stringify({...args,p_token:token}),signal:AbortSignal.timeout(20000)
 });
 if(!response.ok)throw new Error('Could not load account');
 return response.json();
}
function gate(note=''){
 data=null;queue=null;
 root.innerHTML=`<div class="wrap" style="max-width:470px"><div class="brand">RAVINE <b>CREATOR GAMES</b></div><h1>Your next great video starts here.</h1><p class="muted">Open the personal link Austin sent you to go straight into your account.</p><section class="card"><form id="login"><label for="personalLink">Have your link handy?</label><input id="personalLink" type="password" autocomplete="off" placeholder="Paste your personal link" required><button class="primary" type="submit">Open my account</button></form><p class="muted" id="loginNote">${esc(note)}</p><p class="muted">Need a new link? Message Austin in Skool.</p><a href="${SKOOL}" target="_blank" rel="noopener noreferrer">Open Ravine on Skool</a></section></div>`;
 document.getElementById('login').onsubmit=async e=>{
  e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;
  if(!window.RCGAccess.accept(document.getElementById('personalLink').value)){
   document.getElementById('loginNote').textContent='Use the full personal link Austin sent you.';button.disabled=false;return;
  }
  await load();
 };
}
async function load(){
 const version=++generation;data=null;queue=null;
 if(!window.RCGAccess.get()){gate();return;}
 root.innerHTML='<div class="wrap"><p>Loading your account...</p></div>';
 try{
  const account=await rpc('rcg_link_bootstrap');
  if(version!==generation)return;
  window.RCGAccess.remember();
  data=account;
  if(account.is_admin){tab='Review';queue=await rpc('rcg_link_review_queue');}
  else if(tab==='Review')tab='Home';
  if(version===generation)render();
 }catch{
  if(version!==generation)return;
  data=null;queue=null;
  root.innerHTML=`<div class="wrap"><div class="brand">RAVINE <b>CREATOR GAMES</b></div>${card('Let\'s get you back in','<p>We could not open your account. Try again, or ask Austin to check your personal link.</p><div class="actions"><button id="retry">Try again</button><button id="logout">Use another link</button></div>')}</div>`;
  document.getElementById('retry').onclick=load;document.getElementById('logout').onclick=logout;
 }
}
function logout(){++generation;data=null;queue=null;tab='Home';window.RCGAccess.clear();document.querySelectorAll('dialog').forEach(d=>d.remove());gate();}
function body(){
 const xp=data.ledger.reduce((s,t)=>s+t.xp,0);
 if(tab==='Home'){
  const stats=data.stats;
  return `<h1>Hey, ${esc(data.creator.name)}.</h1><p class="muted">Pick a concept. Film it. Get feedback. Keep improving.</p><div class="grid">${card('Lifetime XP',`<div class="number">${xp}</div>`)}${card('Your numbers',stats?`<div class="number">${money(stats.sales)}</div><p class="muted">${stats.period_kind==='all_time'?'All time sales as of '+esc(stats.period_end):'Sales, '+esc(stats.period_start)+' to '+esc(stats.period_end)}</p><p>${money(stats.earnings)} earnings</p><p class="muted">${stats.approved} approved videos · ${stats.submissions} submitted</p>`:'<p class="muted">No Trybe sync recorded yet.</p>')}</div>${card('Make your next video better','<p>Quests earn XP after Austin reviews the evidence. Start with three videos for review.</p><button data-tab="Improve" class="primary">Find a quest</button>')}<p class="muted">${stats?'Numbers synced '+esc(new Date(stats.synced_at).toLocaleString()):'No sync recorded'}. Quest progress comes from your account.</p>`;
 }
 if(tab==='Compete')return `<h1>Bring your best concepts.</h1>${card('Competition setup','<p>Scoring is not live yet. Dates, judging and final rules will be posted before the challenge opens.</p>')}<div class="notice">The planned challenge counts your first 20 submitted videos. Top and middle of funnel only. Later videos can still earn sales, but will not score in the challenge.</div><p class="muted">Individual submission tracking is waiting for a verified Trybe feed. No sample numbers are shown as live results.</p>`;
 if(tab==='Watch'){
  const library=window.RCGLibrary||[],cats=['All',...new Set(library.map(v=>v.category))];
  const filtered=library.filter(v=>(libCategory==='All'||v.category===libCategory)&&(!libQuery||[v.title,v.category,v.note].join(' ').toLowerCase().includes(libQuery.toLowerCase())));
  return `<h1>Find your next angle.</h1>${card('Ravine creator community','<p>Open Skool for video reviews, calls and the latest briefs.</p><a class="button primary" href="'+SKOOL+'" target="_blank" rel="noopener noreferrer">Open Ravine on Skool</a>')}<p class="muted">Study a format, then film your own version. These are public examples from the existing library. Links may change, and an ad library listing does not prove sales performance.</p><form id="librarySearch" class="actions"><label for="libraryQuery">Find a reference</label><input id="libraryQuery" value="${esc(libQuery)}" type="search" placeholder="Search an angle or format"><select id="libraryCategory" aria-label="Filter by category">${cats.map(c=>`<option${c===libCategory?' selected':''}>${esc(c)}</option>`).join('')}</select><button type="submit">Search</button></form><p class="muted">${filtered.length} references${libCategory!=='All'?' · '+esc(libCategory):''}</p><div class="grid">${filtered.slice(0,libLimit).map(v=>card(v.title,`<p class="tag">${esc(v.category)}</p><p class="muted">${esc(v.note)}</p><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">Watch reference</a>`)).join('')}</div>${filtered.length>libLimit?'<button id="moreReferences">Show more</button>':''}`;
 }
 if(tab==='Review')return `<h1>Ready for your feedback.</h1>${queue.length?queue.map(q=>card(q.name,`<p class="tag">${esc(q.quest)}</p><pre>${esc(q.evidence.note||'')}</pre><p>${(q.evidence.links||[]).filter(s=>/^https:\/\//.test(s)).map(s=>`<a href="${esc(s)}" target="_blank" rel="noopener noreferrer">Open evidence</a>`).join('<br>')}</p><div class="actions"><button data-approve="${esc(q.id)}" class="primary">Approve</button><button data-return="${esc(q.id)}">Request changes</button></div>`)).join(''):'<p class="muted">No submissions waiting for review.</p>'}`;
 return `<h1>Earn it with better videos.</h1><p class="muted">${xp} XP lifetime. Every quest is reviewed before XP is added.</p>${data.milestones.map(m=>{const claim=data.claims.find(c=>c.milestone===m.name);return card(m.name,`<p>${m.xp_required} XP${m.cash_value?' · '+money(m.cash_value)+' bonus':''}</p><progress max="${m.xp_required||1}" value="${Math.min(xp,m.xp_required)}"></progress><p class="muted">${m.concepts_required?m.concepts_required+' distinct approved TOF/MOF concepts also required.':''}</p>${claim?'<p>'+esc(claim.state.replaceAll('_',' '))+'</p>':xp>=m.xp_required?'<button data-claim="'+esc(m.name)+'">Request reward</button>':''}`);}).join('')}<h2>Choose a quest</h2>${data.quests.map(q=>{const instances=data.instances.filter(i=>i.quest_key===q.quest_key).sort((a,b)=>b.created_at.localeCompare(a.created_at));const pending=instances.find(i=>i.state==='submitted'),changes=instances.find(i=>i.state==='needs_changes');return card(q.title,`<div class="row"><span class="tag">${q.xp_value} XP</span><small>${q.per_period_limit} per ${esc(q.period_kind)}${q.monthly_xp_cap?' · '+q.monthly_xp_cap+' XP monthly cap':''}</small></div><p class="muted">${esc(hints[q.quest_key]||'Submit evidence for Austin to review.')}</p>${pending?'<p>Waiting for review</p>':`<button data-quest="${esc(q.quest_key)}"${changes?' data-instance="'+esc(changes.id)+'"':''}>${changes?'Update submission':'Open quest'}</button>`}${changes?'<p class="notice">'+esc(changes.review_note)+'</p>':''}`);}).join('')}`;
}
function render(){
 if(!data)return;
 root.innerHTML=`<div class="wrap"><header><div class="brand">RAVINE <b>CREATOR GAMES</b></div><button id="logout">Sign out</button></header><nav aria-label="Main navigation">${['Home','Compete','Improve','Watch',...(queue!==null?['Review']:[])].map(t=>`<button data-tab="${t}" aria-current="${tab===t}">${t}</button>`).join('')}</nav><p class="notice" id="message" role="status"></p>${body()}</div>`;
 document.getElementById('logout').onclick=logout;
 root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render();});
 const search=document.getElementById('librarySearch');if(search)search.onsubmit=e=>{e.preventDefault();libQuery=document.getElementById('libraryQuery').value.trim();libCategory=document.getElementById('libraryCategory').value;libLimit=36;render();};
 const more=document.getElementById('moreReferences');if(more)more.onclick=()=>{libLimit+=36;render();};
 root.querySelectorAll('[data-quest]').forEach(b=>b.onclick=()=>openQuest(b.dataset.quest,b.dataset.instance));
 root.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>mutate(b,()=>rpc('rcg_link_request_claim',{p_milestone:b.dataset.claim})));
 root.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>mutate(b,()=>rpc('rcg_link_approve_quest',{p_instance:b.dataset.approve})));
 root.querySelectorAll('[data-return]').forEach(b=>b.onclick=()=>{const note=prompt('What should the creator improve?');if(note?.trim())mutate(b,()=>rpc('rcg_link_return_quest',{p_instance:b.dataset.return,p_note:note.trim()}));});
}
async function mutate(button,action){
 button.disabled=true;
 try{const r=await action();const outcome=Array.isArray(r)?r[0]:r;await load();if(outcome?.why)notify(outcome.why);}catch{button.disabled=false;notify('That did not save. Try again.');}
}
function openQuest(key,instance){
 const q=data.quests.find(q=>q.quest_key===key);const existing=data.instances.find(i=>i.id===instance);const d=document.createElement('dialog');
 d.innerHTML=`<h2>${esc(q.title)}</h2><p class="tag">${q.xp_value} XP after review</p><p>${esc(hints[key]||'Submit your evidence for review.')}</p><form><label for="evidenceNote">What did you create or contribute?</label><textarea id="evidenceNote" required maxlength="4000">${esc(existing?.evidence?.note||'')}</textarea><label for="evidenceLinks">Evidence links, one per line</label><textarea id="evidenceLinks" maxlength="6000">${esc((existing?.evidence?.links||[]).join('\n'))}</textarea><p class="muted">Share links Austin can open. Please leave private customer information out.</p><div class="actions"><button class="primary" type="submit">Submit for review</button><button id="closeQuest" type="button">Cancel</button></div><p id="questError" role="status"></p></form>`;
 document.body.append(d);d.showModal();d.querySelector('#closeQuest').onclick=()=>d.close();d.onclose=()=>d.remove();
 d.querySelector('form').onsubmit=async e=>{
  e.preventDefault();const b=e.target.querySelector('[type=submit]');b.disabled=true;
  const links=d.querySelector('#evidenceLinks').value.split('\n').map(s=>s.trim()).filter(Boolean);
  if(links.some(s=>!/^https:\/\//.test(s))){d.querySelector('#questError').textContent='Use full https:// links.';b.disabled=false;return;}
  try{await rpc('rcg_link_submit_quest',{p_quest:key,p_evidence:{note:d.querySelector('#evidenceNote').value.trim(),links},p_instance:instance||null});d.close();await load();notify('Submitted. Austin will review it before XP is added.');}catch{d.querySelector('#questError').textContent='Could not submit. Check whether another submission is waiting for review.';b.disabled=false;}
 };
}
load();
})();
