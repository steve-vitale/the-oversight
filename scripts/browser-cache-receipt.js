'use strict';
// Passive Playwright page.evaluate function; never invokes gameplay or saves.
async function collectInstalledCache(){
 const build=globalThis.BUILD_VERSION,cacheName=(await caches.keys()).find(k=>k.includes(build));
 if(!cacheName)throw Error('No cache for running build');
 const cache=await caches.open(cacheName),inputs={};
 for(const req of await cache.keys()){
  const res=await cache.match(req);
  if(!/javascript|json|html|css/.test(res.headers.get('content-type')||''))continue;
  const text=(await res.text()).replace(/\r\n/g,'\n'),url=new URL(req.url);
  inputs[url.pathname+url.search]={normalizedSha256:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('')};
 }
 return {build,controller:!!navigator.serviceWorker.controller,cacheName,inputs,
  dataRequests:performance.getEntriesByType('resource').filter(r=>r.name.includes('/src/data/')).map(r=>r.name),
  phone:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio,touch:navigator.maxTouchPoints,coarse:matchMedia('(pointer: coarse)').matches,hover:matchMedia('(hover: hover)').matches}};
}
if(typeof module!=='undefined')module.exports=collectInstalledCache;
