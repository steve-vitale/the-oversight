#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),B=require('./build-offline-assets');
const ROOT=path.resolve(__dirname,'..'),base='https://offline.test/',source=fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');let checks=0;
function check(name,value){assert(value,name);checks++;console.log('PASS '+name);}
(async()=>{
 check('release script refreshes assets after stamping',fs.readFileSync(path.join(ROOT,'scripts/bump-sw-version.sh'),'utf8').trimEnd().endsWith('node scripts/build-offline-assets.js'));
 const plan=B.update(ROOT,true),handlers={},stores=new Map(),requests=[];let offline=false,claimed=false,networkCalls=0;
 const key=value=>new URL(typeof value==='string'?value:value.url,base).href;
 function responseFor(value){const url=new URL(key(value)),file=path.join(ROOT,url.pathname==='/'?'index.html':decodeURIComponent(url.pathname).slice(1));if(!fs.existsSync(file)||!fs.statSync(file).isFile())throw Error('404 '+url.pathname);return new Response(fs.readFileSync(file));}
 const caches={async open(name){if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name);return{async addAll(urls){const responses=urls.map(u=>[key(u),responseFor(u)]);for(const [url,res]of responses)map.set(url,res);requests.push(...urls);},async put(req,res){map.set(key(req),res.clone());}}},async keys(){return[...stores.keys()]},async delete(name){return stores.delete(name)},async match(req,options={}){for(const map of stores.values()){if(map.has(key(req)))return map.get(key(req)).clone();if(options.ignoreSearch){const wanted=new URL(key(req));for(const [url,response]of map){const candidate=new URL(url);if(candidate.origin===wanted.origin&&candidate.pathname===wanted.pathname)return response.clone();}}}}};
 const self={clients:{async claim(){claimed=true}},skipWaiting(){throw Error('install must not skip waiting')},addEventListener(type,fn){handlers[type]=fn}};
 const fetch=async req=>{networkCalls++;if(offline)throw Error('network stopped');return responseFor(req)};
 vm.runInNewContext(source,{self,caches,fetch,URL,console});
 let installed;handlers.install({waitUntil(p){installed=p}});await installed;
 check('actual install caches every generated URL',requests.length===plan.assets.length&&new Set(requests).size===plan.assets.length);
 check('current index scripts retain exact query keys',plan.scripts.every(u=>requests.includes(u))&&plan.scripts.some(u=>u.includes('?v=')));
 check('live JSON inventory is cached',plan.data.length>0&&plan.data.every(u=>requests.includes(u)));
 const version=JSON.parse(fs.readFileSync(path.join(ROOT,'version.json'),'utf8')).version;
 check('every JSON cache key matches the runtime build',plan.data.every(u=>new URL(u,base).searchParams.get('v')===version));
 check('retired data and audio binaries are not installed',requests.every(u=>!u.includes('/_archive/')&&!/\.(mp3|wav|ogg)(?:\?|$)/i.test(u)));
 const regional=plan.scripts.filter(u=>u.split('?')[0]==='./src/js/regional-audio.js');
 check('cache includes exact current shared regional renderer URL',regional.length===1&&requests.includes(regional[0]));
 stores.set('old-version',new Map());let activated;handlers.activate({waitUntil(p){activated=p}});await activated;
 check('actual activation claims clients and retires old cache',claimed&&!stores.has('old-version'));
 offline=true;const at=networkCalls;
 async function get(url,mode='no-cors'){let result;handlers.fetch({request:{method:'GET',url:new URL(url,base).href,mode},respondWith(p){result=p}});return result;}
 for(const url of plan.scripts){const response=await get(url);check('offline script '+url,!!response&&response.status===200&&(await response.text()).length>0);}
 for(const url of plan.data){const response=await get(url);check('offline JSON '+url,!!response&&response.status===200&&JSON.parse(await response.text())!==undefined);}
 const index=await get('./index.html','navigate'),css=plan.assets.find(u=>u.includes('.css'));
 const indexText=await index.text();check('offline entry document resolves',!!index&&indexText.includes('src/js/regional-audio.js'));
 check('offline exact versioned stylesheet resolves',!!css&&!!await get(css));
 check('all installed boot requests avoid the stopped network',networkCalls===at);
 const fallback=await get('./unknown-route','navigate');check('offline navigation uses actual cached index fallback',(await fallback.text())===indexText);
 const script=plan.scripts.find(u=>u.includes('?v='));let rejected=false;try{await get(script.replace(/\?v=[^&]+/,'?v=wrong-build'));}catch(error){rejected=error.message==='offline';}
 check('wrong build query cannot silently serve a cached old script',rejected);
 let wrongData=false;try{await get(plan.data[0].replace(/\?v=[^&]+/,'?v=old-build'));}catch(error){wrongData=error.message==='offline';}
 check('wrong build JSON cannot silently use another build cache',wrongData);
 const fixture=fs.mkdtempSync(path.join(require('os').tmpdir(),'oversight-offline-'));
 try{for(const file of ['sw.js','index.html','manifest.json','version.json'])fs.copyFileSync(path.join(ROOT,file),path.join(fixture,file));let failed=false;try{B.collect(fixture)}catch(error){failed=/Missing offline asset/.test(error.message)}check('collector rejects a missing real boot dependency',failed);}finally{for(const file of fs.readdirSync(fixture))fs.unlinkSync(path.join(fixture,file));fs.rmdirSync(fixture);}
 console.log('OFFLINE_ASSET_RESULT '+JSON.stringify({checks,urls:requests.length,scripts:plan.scripts.length,data:plan.data.length,networkCallsBeforeOffline:at,version:source.match(/const VERSION = '([^']+)'/)[1]}));console.log(`offline asset proof green: ${checks} checks`);
})().catch(e=>{console.error(e.stack);process.exitCode=1});
