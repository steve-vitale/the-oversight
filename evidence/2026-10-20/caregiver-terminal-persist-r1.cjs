'use strict';
// Preload for a separate natural campaign with real storage. Captures only
// completed normal saves; no ability, age, health, position or inventory edits.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),B=require('../../scripts/balance-panel');
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1];};
const root=path.resolve(arg('root','.')),prefix=arg('save-prefix',null),capture=arg('capture','1')==='1';if(!prefix)throw Error('Missing save prefix');
const storage=new Map();global.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),key:i=>[...storage.keys()][i]??null,get length(){return storage.size;}};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),sources=B.manifest(root),captured=new Set(),opportunities={late:0,table:0,fight:0};
const H=require(path.join(root,'scripts/sim-harness')),load=H.loadGame;
H.loadGame=async function(...args){const result=await load.apply(this,args),G=result.Game,save=G.save;
 G.save=function(...args){const okay=save.apply(this,args),s=this.state.scholar,pg=s.prog||{};
  if(okay!==true||this.over||s.day<180||!storage.has(this.state.runKey))return okay;
  const kinds=[];
  if(this.map.px===4&&this.map.py===4&&!this.tbfight)kinds.push('late');
  if(pg.tableWaiting||pg.tableDone||pg.tableState)kinds.push('table');
  if(this.tbfight&&!this.tbfight.over)kinds.push('fight');
  for(const kind of kinds){opportunities[kind]++;if(!capture||captured.has(kind))continue;captured.add(kind);
   const artifact={scope:'Natural persistent caregiver seed10004, current source. Read from a successful actual save; no prepared resources, ages, abilities, people or scene. Storage-enabled trajectory is separate from the earlier audit without storage.',setup:{key:this.state.runKey,kind},observed:{day:s.day,bearer:this.villagerId,node:[this.map.px,this.map.py],inside:!!s.insideHaven,health:s.health,hydration:s.hydration,kcal:s.kcal,tableWaiting:!!pg.tableWaiting,tableDone:!!pg.tableDone},storage:Object.fromEntries(storage),sources,adapterSha256:sha(fs.readFileSync(__filename))};
   fs.writeFileSync(prefix+'-'+kind+'.json',JSON.stringify(artifact,null,2)+'\n',{flag:'wx'});
  }
  return okay;
 };
 return result;
};
let finished=false;process.on('beforeExit',()=>{if(finished)return;finished=true;fs.writeFileSync(prefix+'-storage.json',JSON.stringify({capture,captured:[...captured],opportunities,storageDigest:sha(JSON.stringify(Object.fromEntries(storage))),sources,adapterSha256:sha(fs.readFileSync(__filename))},null,2)+'\n',{flag:'wx'});});
