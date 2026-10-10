const CACHE='yiting-shell-v1';
const local=path=>new URL(path,self.registration.scope).href;
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['offline.html','assets/app-icon-192.png','assets/app-icon-512.png'].map(local))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('yiting-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope)||request.headers.has('range')||/\.(mp4|m4a|mp3|wav)$/i.test(url.pathname)||url.pathname.includes('/downloads/'))return;
 const eligible=request.mode==='navigate'||['style','script','image','font'].includes(request.destination);if(!eligible)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{const response=await fetch(request);if(response.ok){await cache.put(request,response.clone());const keys=await cache.keys();if(keys.length>60)await cache.delete(keys[3]);}return response;}
  catch{const stored=await cache.match(request);if(stored)return stored;if(request.mode==='navigate')return cache.match(local('offline.html'));return Response.error();}
 })());
});
