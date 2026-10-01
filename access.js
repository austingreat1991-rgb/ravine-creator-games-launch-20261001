/* A personal link is a bearer credential. Never put it in a public build. */
(function(){
 'use strict';
 const KEY='rcg.private-link.v1';
 let token='', incoming=false;
 try {
  const u=new URL(location.href), frag=new URLSearchParams(u.hash.slice(1));
  const candidate=frag.get('access');
  if(candidate!==null){
   incoming=true;
   try{localStorage.removeItem(KEY);}catch{}
   if(/^[a-f0-9]{64}$/.test(candidate))token=candidate;
  }else{
   try{const saved=localStorage.getItem(KEY);if(/^[a-f0-9]{64}$/.test(saved||''))token=saved;}catch{}
  }
  if(u.searchParams.has('k'))u.searchParams.delete('k');
  if(incoming)u.hash='';
  history.replaceState(null,'',u.pathname+u.search+u.hash);
 }catch{}
 // The old app kept account data and a published routing code on the device.
 // Remove only Ravine's old keys. Leave other apps on this origin alone.
 try{
  Object.keys(localStorage).filter(k=>k==='ravine_creator_games_v2'||k==='rcg_backend'||k.startsWith('rcg.v3.'))
   .forEach(k=>localStorage.removeItem(k));
  document.cookie='ravine_creator_games_v2=;path=/;max-age=0;SameSite=Lax';
 }catch{}
 window.RCGAccess={
  get:()=>token,
  remember:()=>{try{if(token)localStorage.setItem(KEY,token);}catch{}},
  clear:()=>{token='';try{localStorage.removeItem(KEY);}catch{}},
  accept:value=>{
   let candidate=String(value||'').trim();
   try{if(candidate.startsWith('https://'))candidate=new URLSearchParams(new URL(candidate).hash.slice(1)).get('access')||'';}catch{}
   if(!/^[a-f0-9]{64}$/.test(candidate))return false;
   token=candidate;return true;
  }
 };
})();
