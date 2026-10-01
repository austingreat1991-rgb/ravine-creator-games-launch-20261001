const VERSION='rcg-private-links-20260930-2';
const PUBLIC_FILES=new Set(['index.html','access.js','client.js','library.js','style.css','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png']);
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys()){
  if(key!==VERSION&&/^(rcg|ravine)/i.test(key))await caches.delete(key);
  else{const cache=await caches.open(key);for(const req of await cache.keys()){
   const u=new URL(req.url);if(u.origin===self.location.origin&&u.pathname.startsWith(new URL(self.registration.scope).pathname+'u/'))await cache.delete(req);
  }}
 }
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request,u=new URL(req.url);
 const scope=new URL(self.registration.scope).pathname;
 if(req.method!=='GET'||u.origin!==self.location.origin||!u.pathname.startsWith(scope)||req.headers.has('authorization'))return;
 if(u.pathname.startsWith(scope+'u/')){event.respondWith(Promise.resolve(new Response('Retired private endpoint',{status:410})));return;}
 const name=u.pathname.split('/').pop()||'index.html';
 if(!PUBLIC_FILES.has(name)||u.search)return;
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  try{const response=await fetch(req,{cache:'no-store'});if(response.ok)await cache.put(req,response.clone());return response;}
  catch(error){const stored=await cache.match(req);if(stored)return stored;throw error;}
 })());
});
