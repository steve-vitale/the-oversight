'use strict';
const fs=require('fs'),path=require('path'),Module=require('module');
const root=path.resolve(process.argv[2]), out=process.argv[3], observe=process.argv[4]!=='off', file=path.join(root,'scripts/test-capable-bot-20261014.js');
if(!out||!['on','off'].includes(process.argv[4]))throw Error('Usage: node formal-companion-short-diagnostic.cjs <root> <fresh-jsonl> on|off');
if(fs.existsSync(out))throw Error('Output must not exist (append-only rows within one test execution)');
let src=fs.readFileSync(file,'utf8');
for(const needle of ['await H.setupGame(G);','Object.assign({}, capable, { setup(g, c)','days += r.days;'])if(src.split(needle).length!==2)throw Error('Legacy test changed: '+needle);
src=src.replace('await H.setupGame(G);',`await H.setupGame(G);
      const snapshots=[],entries=[];
      const daily=capable.daily;
      const observed=Object.assign({},capable,{daily(g,c){const r=daily.call(this,g,c),s=g.state.scholar; if(${observe})snapshots.push(structuredClone({day:s.day,bearer:g.villagerId,hp:s.health,kcal:s.kcal,party:[...(g.state.village.party||[])],sentiment:!!s.prog?.sentimentTaught,surge:s.prog?.feastSurge,used:!!s.prog?.feastSurgeUsed,knack:s.knack,abilities:s.abilities,reactor:s.fusionReactor}));return r;}});
      if(${observe})for(const name of ['startCombat','startBetrayalCombat']){const orig=G[name];G[name]=function(...args){const s=this.state.scholar,v=this.state.village,prior={day:s.day,bearer:this.villagerId,party:[...(v.party||[])],health:{...v.health}};const r=orig.apply(this,args);entries.push({name,...prior,fighters:(this.tbfight?.fighters||[]).filter(x=>x.kind==='villager').map(x=>({id:x.villagerId,hp:x.hp,max:x.maxHp,weapon:x.wbonus,armor:x.varmor}))});return r;};}
    `);
src=src.replace('Object.assign({}, capable, { setup(g, c)', 'Object.assign({}, observed, { setup(g, c)');
src=src.replace('days += r.days;',`require('fs').appendFileSync(${JSON.stringify(out)},JSON.stringify({seed,observe:${observe},row:r,stateHash:require('./gear-usage-audit').gameplayHash({...G.state,__run:{villagerId:G.villagerId,over:G.over,won:G.won,dayPart:G.dayPart,map:G.map}}),snapshots,entries,food:!!(G.progState().sentimentTaught&&G.state.scholar.prog?.feastSurgeUsed)})+'\\n'); days += r.days;`);
const m=new Module(file);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(src,file);
