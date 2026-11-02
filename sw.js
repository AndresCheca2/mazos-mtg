const SHELL='mtg-shell-v2',IMG='mtg-img-v1';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==SHELL&&k!==IMG).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET')return;
 if(u.hostname==='cards.scryfall.io'||u.hostname==='svgs.scryfall.io'){
  e.respondWith(caches.open(IMG).then(async c=>{
   const hit=await c.match(r);if(hit)return hit;
   try{const res=await fetch(r);if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}catch(err){return Response.error()}
  }));return;
 }
 if(u.origin===location.origin){
  e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(SHELL).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(h=>h||caches.match('index.html'))));
 }
});
