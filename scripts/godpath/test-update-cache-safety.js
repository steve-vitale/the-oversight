'use strict';
const fs=require('fs'),path=require('path'),K=require('./lib'),T=K.reporter('update-cache-safety');
async function main(){
 const source=fs.readFileSync(process.env.UPDATE_ENTRY_SOURCE||path.join(K.ROOT,'index.html'),'utf8');
 const body=source.match(/  function doApply\(\) \{[\s\S]*?\n  function fail\(\)/);
 if(!body)throw Error('Actual update handler missing');
 const timers=[],deleted=[],unregistered=[],messages=[];
 const location={href:'https://example.test/?old=1',reload(){throw Error('Unexpected fallback');}};
 const caches={keys:async()=>['installed-old','installing-new'],delete:async key=>{deleted.push(key);return true;}};
 const navigator={serviceWorker:{getRegistrations:async()=>[{unregister:async()=>{unregistered.push(true);return true;}}]}};
 const apply=new Function('window','navigator','caches','URL','setTimeout','show','remoteVersion','fail',body[0].replace(/\n  function fail\(\)$/,'')+';return doApply;')({location,caches},navigator,caches,URL,(fn,ms)=>timers.push({fn,ms}),s=>messages.push(s),'candidate-20261019-040100',()=>{throw Error('Unexpected failure');});
 apply();
 for(let i=0;i<12;i++)await Promise.resolve();
 T.ok('actual update does not delete installed or installing caches',deleted.length===0,JSON.stringify(deleted));
 T.ok('actual update preserves the worker while its successor installs',unregistered.length===0);
 T.ok('navigation is scheduled without waiting for storage operations',timers.some(t=>t.ms<=500));
 for(const timer of timers.sort((a,b)=>a.ms-b.ms))timer.fn();
 const url=new URL(location.href);
 T.ok('real navigation uses the selected build and removes stale query',url.searchParams.get('v')==='candidate-20261019-040100'&&!url.searchParams.has('old'));
 T.ok('one handoff message despite repeated timer delivery',messages.filter(s=>s.includes('Reloading')).length===1);
 const failureBody=source.match(/  function fail\(\) \{[\s\S]*?\n  \}/);
 if(!failureBody)throw Error('Actual failure handler missing');
 const failureMessages=[];
 const failure=new Function('show','var state="working",failCount=0;'+failureBody[0]+';return function(){fail();return state;};')(s=>failureMessages.push(s));
 T.ok('first update failure remains retryable',failure()==='failed'&&/retry/i.test(failureMessages[0]));
 T.ok('repeated update failure remains retryable',failure()==='failed'&&/retry/i.test(failureMessages[1]));
 T.ok('failure guidance preserves the installed app and saves',failureMessages.every(s=>!/delete|uninstall|re-add|reinstall/i.test(s))&&/connection/i.test(failureMessages[1]));
 const registration=source.match(/  \/\/ Offline worker follows[\s\S]*?(?=\n  check\(\);)/);
 T.ok('actual entry has a build-scoped offline worker handoff',!!registration);
 if(registration){
  let loaded,registered,updateFound;const messages=[];
  const worker=(version,state)=>({scriptURL:'https://example.test/sw.js?v='+version,state,postMessage:m=>messages.push({version,...m}),addEventListener:(_name,fn)=>{installed=fn;}});
  let installed;const current=worker('candidate','installing'),future=worker('future','installed');
  const reg={waiting:future,installing:current,addEventListener:(_name,fn)=>{updateFound=fn;}};
  const nav={serviceWorker:{register:async(url,options)=>{registered={url,options};return reg;}}};
  new Function('window','navigator','URL',registration[0])({BUILD_VERSION:'candidate',location:{href:'https://example.test/?v=candidate'},addEventListener:(_name,fn)=>{loaded=fn;}},nav,URL);
  loaded();for(let i=0;i<4;i++)await Promise.resolve();
  T.ok('registration bypasses stale worker HTTP cache and pins the running build',registered.url==='https://example.test/sw.js?v=candidate'&&registered.options.updateViaCache==='none');
  T.ok('future or unfinished workers are never activated by this page',messages.length===0);
  current.state='installed';installed();
  T.ok('completed matching worker receives the native activation message',messages.length===1&&messages[0].type==='SKIP_WAITING'&&messages[0].version==='candidate');
  reg.installing=future;updateFound();
  T.ok('later update discovery cannot activate a different build',messages.length===1);
 }
 T.done();
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
