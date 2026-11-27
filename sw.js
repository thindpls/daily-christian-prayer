// Network-first for public pages; cached copies support offline reading.
const CACHE = 'daily-christian-prayer-v15';
const PAGES = ['./index.html','./christmas-prayers.html','./about.html','./privacy.html','./contact.html'];
const ASSETS = ['./manifest.webmanifest','./icon-192.png','./icon-512.png','./analytics.js','./offline.html','./404.html','./paypal-qr.png','./og-1200x630.png','./og-christmas.png'];
const root = new URL('./', self.registration.scope);
const absolute = path => new URL(path, root).href;
const shell = [...PAGES, ...ASSETS].map(absolute);
const allowed = new Set(shell);
self.addEventListener('install', event => event.waitUntil((async()=>{
 const cache = await caches.open(CACHE);
 await cache.addAll(shell.map(url=>new Request(url,{cache:'reload'})));
 await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil((async()=>{
 for(const key of await caches.keys()) if(key.startsWith('daily-christian-prayer-') && key!==CACHE) await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
 const req=event.request, url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==root.origin||!url.pathname.startsWith(root.pathname)) return;
 // Only cache known app files. Leave sitemap, verification and arbitrary URLs alone.
 const key=url.pathname===root.pathname ? absolute('./index.html') : url.origin+url.pathname;
 if(!allowed.has(key)){
  if(req.mode==='navigate' && !/\.(xml|txt)$/i.test(url.pathname)) event.respondWith(fetch(req).catch(async()=> (await caches.open(CACHE)).match(absolute('./offline.html'))));
  return;
 }
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(req);
   if(response.ok){try{await cache.put(key,response.clone());}catch(_){}}
   return response;
  }catch(_){
   const saved=await cache.match(key);
   if(saved)return saved;
   if(req.mode==='navigate')return (await cache.match(absolute('./offline.html'))) || Response.error();
   return Response.error();
  }
 })());
});
