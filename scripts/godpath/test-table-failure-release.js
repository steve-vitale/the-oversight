'use strict';
const K=require('./lib'),T=K.reporter('Table failure consequence');
(async()=>{
 const memory=new Map();global.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k),key:i=>[...memory.keys()][i]??null,get length(){return memory.size}};
 const G=await K.load({seed:Number(process.env.SEED||7)});let s,table;
 function fresh(){G.tbfight=null;G.over=false;G.won=false;K.newRun(G);s=G.state.scholar;s.day=120;s.kcal=3000;s.integration=60;s.insideHaven=true;G.state.systemArrived=true;G.state.networkLive=true;G.scaleRank=()=> 'regional';const pg=G.progState();pg.table={};pg.tableDone=true;pg.tableWaiting=true;pg.sentimentTaught=true;s.prog.feastSurgeUsed=true;pg.crises={raid:true,illness:true};const d=G.deedState();d.contestsSurvived=2;d.wavesFaced={};for(const[w,n]of [[1,4],[2,4],[3,3]])for(const m of G.data.monsters.filter(m=>m.wave===w).slice(0,n))d.wavesFaced[m.id]=w;G.tableStartPath('feared');table=G.tableState();G.tableFail('prepared failed footage');}
 fresh();T.ok('real failed challenge closes its door and offers a fallback',table.failedDoors.includes('feared')&&table.phase==='downgrade'&&s.tableChoices.options.some(o=>o.id==='downgrade:assimilated'));
 const snapshot=()=>JSON.stringify({table,kcal:s.kcal,choices:s.tableChoices});let before=snapshot();G.chooseTableOption('downgrade:feared');T.ok('stale failed-door choice cannot restart or regrant the challenge',snapshot()===before);
 fresh();before=snapshot();G.tableStartPath('feared');T.ok('direct stale path entry also preserves the closed door and paid state',snapshot()===before);
 fresh();G.chooseTableOption('downgrade:assimilated');T.ok('actual offered fallback begins a live challenge',table.path==='assimilated'&&table.phase==='challenge'&&s.tableChoices.options.length>0);
 T.ok('weakened fallback actually spends one opening advantage',table.weakened===1&&table.meters.comfort===1,JSON.stringify(table.meters));
 G.save();const key=G.state.runKey;T.ok('actual save and Continue preserve failed doors and paid opening advantage',G.load(key)&&G.tableState().failedDoors.includes('feared')&&G.tableState().meters.comfort===1);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1});
