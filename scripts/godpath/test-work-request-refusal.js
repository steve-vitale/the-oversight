'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),K=require('./lib'),T=K.reporter('work-request refusal');
(async()=>{
 const G=await K.load({seed:7});K.newRun(G);
 const npc=G.data.villagers.find(v=>v.id!==G.villagerId),vid=npc.id;
 G.state.village.trust[vid]=5;
 const refusal=G.assignTask(vid,'wood',{via:'in-person'});
 assert(refusal?.refused,'real task engine must refuse the prepared low-trust request');
 const source=fs.readFileSync(path.join(K.ROOT,'src/js/app.js'),'utf8').replace(/\r\n/g,'\n');
 const start=source.indexOf('  function renderAssignInline('),end=source.indexOf('  // assignTaskSheet is now inline',start);
 assert(start>=0&&end>start);const renderSource=source.slice(start,end);
 function mount(text,view){
  let html='',paints=0,wiredClose=0,inlineView=view;const elements=new Map();
  const slot={set innerHTML(value){html=value;elements.clear();for(const m of value.matchAll(/data-(act|task|refuse)="([^"]+)"/g)){const key='[data-'+m[1]+'="'+m[2]+'"]';elements.set(key,{dataset:{[m[1]]:m[2]},onclick:null});}},get innerHTML(){return html;},querySelector:s=>elements.get(s)||null,querySelectorAll:s=>[...elements].filter(([key])=>key.startsWith(s.slice(0,-1)+'=')).map(([,v])=>v)};
  const fn=new Function('Game','slot','view','esc','inlineHead','wireInlineX','inlineMapKey','refresh', 'let inlineView=view;'+text+';renderAssignInline(slot,view);return ()=>inlineView;');
  const getView=fn(G,slot,view,s=>String(s),s=>'<header>'+s+'</header>',()=>wiredClose++,()=> 'prepared-haven',()=>paints++);
  return{slot,elements,getView,paints:()=>paints,wiredClose:()=>wiredClose,html:()=>html};
 }
 const refused={kind:'assign',vid,line:null,via:'in-person',refused:true,refusedTask:'wood'};
 const before=JSON.stringify(G.state),panel=mount(renderSource,refused);
 T.ok('actual refused request renders without a Back button',!panel.elements.has('[data-act="back"]')&&panel.html().includes('data-refuse="leave"'));
 T.ok('refusal retains the real engine reason',panel.html().includes(G.state.village.lastRefusal.reason));
 T.ok('actual refusal follow-up Leave is wired',typeof panel.elements.get('[data-refuse="leave"]').onclick==='function');
 panel.elements.get('[data-refuse="leave"]').onclick();
 T.ok('Leave returns to the person without a false success',panel.getView().kind==='person'&&panel.getView().result===null&&panel.paints()===1);
 T.ok('opening and leaving refusal changes no resources or committed state',JSON.stringify(G.state)===before);
 const normal=mount(renderSource,{kind:'assign',vid,line:null,via:'in-person'});
 T.ok('ordinary task list still wires its actual Back button',typeof normal.elements.get('[data-act="back"]').onclick==='function');
 normal.elements.get('[data-act="back"]').onclick();T.ok('ordinary Back returns to the person',normal.getView().kind==='person'&&normal.paints()===1);
 const regressed=renderSource.replace('const back = slot.querySelector(\'[data-act="back"]\');\n    if (back) back.onclick', 'slot.querySelector(\'[data-act="back"]\').onclick');
 T.ok('rejecting control removes the actual new guard',regressed!==renderSource);
 assert.throws(()=>mount(regressed,refused),/null|onclick/);T.ok('removing the guard reproduces the real null-button crash',true);
 T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
