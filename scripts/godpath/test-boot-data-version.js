'use strict';
const K=require('./lib'),fs=require('fs'),path=require('path'),T=K.reporter('boot data version');
(async()=>{
 const G=await K.load({seed:181031}),originalFetch=global.fetch,originalData=global.SCATTER_DATA,originalVersion=global.BUILD_VERSION,originalLocation=global.location;
 const requests=[],version='fixture-new-build',stale=[{id:'stale-old-plant'}];
 delete global.SCATTER_DATA;
 // Assigned after module evaluation, like build.js in the real script order.
 global.BUILD_VERSION=version;
 global.location={protocol:'https:',origin:'https://boot.test'};
 global.fetch=async(url,options)=>{
  requests.push({url,options});
  const u=new URL(url,'https://boot.test/');
  // An existing worker can serve the old unversioned response even when the
  // page asks for no-store. Versioned requests reach fresh definitions.
  const body=u.searchParams.get('v')===version
   ?JSON.parse(fs.readFileSync(path.join(K.ROOT,u.pathname.slice(1)),'utf8')):stale;
  return {ok:true,status:200,json:async()=>body};
 };
 try{
  const data=await G.init(),plan=require('../build-offline-assets').collect(K.ROOT);
  const stamp=JSON.parse(fs.readFileSync(path.join(K.ROOT,'version.json'),'utf8')).version;
  T.ok('real init loads current definitions despite an old worker cache',JSON.stringify(data.plants)===JSON.stringify(JSON.parse(fs.readFileSync(path.join(K.ROOT,'src/data/plants.json'),'utf8'))));
  T.ok('all required and optional JSON requests carry the late build stamp',requests.length===43&&requests.every(r=>new URL(r.url,'https://boot.test/').searchParams.get('v')===version),requests.length);
  T.ok('company favor rules load through the real versioned boot',JSON.stringify(data.favorRules)===JSON.stringify(JSON.parse(fs.readFileSync(path.join(K.ROOT,'src/data/favor-rules.json'),'utf8'))));
  T.ok('network misses bypass warm HTTP cache',requests.every(r=>r.options?.cache==='no-store'));
  T.ok('each boot data request has an exact generated offline key',requests.every(r=>plan.data.includes('./'+r.url.replace(version,encodeURIComponent(stamp)))));
  global.fetch=async()=>({ok:false,status:503,json:async()=>stale});
  let rejected=false;try{await G.init();}catch(e){rejected=/Data load failed:.*503/.test(e.message);}
  T.ok('failed required data cannot boot a misleading partial run',rejected);
 }finally{global.fetch=originalFetch;global.SCATTER_DATA=originalData;global.BUILD_VERSION=originalVersion;global.location=originalLocation;}
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
