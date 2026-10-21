'use strict';
// Capture normal decision boundaries, rather than an arbitrary nested save
// inside overnight resolution. Interrupted writes remain a separate test case.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),B=require('../../scripts/balance-panel'),gear=require('../../scripts/gear-usage-audit');
const arg=(n,d)=>{const i=process.argv.indexOf('--'+n);return i<0?d:process.argv[i+1];};
const root=path.resolve(arg('root','.')),prefix=arg('save-prefix',null),capture=arg('capture','1')==='1';if(!prefix)throw Error('Missing save prefix');
const storage=new Map();global.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>[...storage.keys()][i]??null,get length(){return storage.size;}};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),sources=B.manifest(root),captured=new Set(),opportunities={late:0,table:0,fight:0};let rejectedClock=0,rejectedStale=0;
function sample(G,boundary){
 const s=G.state.scholar;if(G.over||s.day<180)return;
 if(!Number.isInteger(G.dayPart)||G.dayPart<0||G.dayPart>3||s.dayTicks>=G.TIME.TICKS_PER_DAY){rejectedClock++;return;}
 const raw=storage.get(G.state.runKey);if(!raw)return;const saved=JSON.parse(raw);
 const f=G.tbfight&&!G.tbfight.over?G.tbfight:null,stored=saved.run?.tbfight||null;
 const core=p=>({key:p.key,hp:p.hp,mx:p.mx,my:p.my,acted:p.acted,moveLeft:p.moveLeft,alive:p.alive,fled:p.fled,statuses:p.statuses});
 if(saved.run?.dayPart!==G.dayPart||saved.scholar?.dayTicks!==s.dayTicks||saved.run?.map?.px!==G.map.px||saved.run?.map?.py!==G.map.py||
  gear.gameplayHash(saved)!==gear.gameplayHash(G.state)||!!f!==!!stored||f&&(f.id!==stored.id||f.round!==stored.round||f.turnIdx!==stored.turnIdx||JSON.stringify(f.fighters.map(core))!==JSON.stringify(stored.fighters.map(core)))){rejectedStale++;return;}
 const pg=s.prog||{},kinds=[];if(G.map.px===4&&G.map.py===4&&!f)kinds.push('late');if(pg.tableWaiting||pg.tableDone)kinds.push('table');if(f)kinds.push('fight');
 for(const kind of kinds){opportunities[kind]++;if(!capture||captured.has(kind))continue;captured.add(kind);
  fs.writeFileSync(prefix+'-'+kind+'.json',JSON.stringify({scope:'Unedited natural persistent caregiver seed10004, current public-Wait harness. Actual saved bytes at a coherent completed policy boundary; clock, complete canonical state and active fight core agree with the running game. Not an interruption fixture.',setup:{key:G.state.runKey,kind},boundary,observed:{day:s.day,dayPart:G.dayPart,dayTicks:s.dayTicks,bearer:G.villagerId,node:[G.map.px,G.map.py],inside:!!s.insideHaven,health:s.health,hydration:s.hydration,kcal:s.kcal,tableWaiting:!!pg.tableWaiting,tableDone:!!pg.tableDone},storage:Object.fromEntries(storage),sources,adapterSha256:sha(fs.readFileSync(__filename))},null,2)+'\n',{flag:'wx'});
 }
}
const H=require(path.join(root,'scripts/sim-harness')),run=H.runDays;
H.runDays=async function(G,policy,options){const wrapped={...policy};for(const hook of ['setup','upkeep','daily']){const original=policy[hook];wrapped[hook]=function(g,ctx){sample(g,hook+'.before');const result=original?.call(this,g,ctx);sample(g,hook+'.after');return result;};}return run.call(this,G,wrapped,options);};
let finished=false;process.on('beforeExit',()=>{if(finished)return;finished=true;fs.writeFileSync(prefix+'-storage.json',JSON.stringify({capture,captured:[...captured],opportunities,rejectedClock,rejectedStale,storageDigest:sha(JSON.stringify(Object.fromEntries(storage))),sources,adapterSha256:sha(fs.readFileSync(__filename))},null,2)+'\n',{flag:'wx'});});
