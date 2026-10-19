'use strict';
const fs=require('fs'),path=require('path'),K=require('./lib'),T=K.reporter('Wake speech boundary');
(async()=>{
 const G=await K.load({seed:190019});K.newRun(G);
 const app=fs.readFileSync(path.join(__dirname,'../../src/js/app.js'),'utf8');
 const body=app.slice(app.indexOf('function questOverlay(cb)'),app.indexOf('// cellPopup:'));
 const screen={innerHTML:''},button={},spoken=[];
 const render=Function('Game','screen','bar','esc','document',body+';return questOverlay;')(G,screen,()=>'',s=>String(s).replaceAll('"','&quot;'),{getElementById:()=>button});
 G.convoSpeakLine=(id,line)=>spoken.push({id,line,clean:G.voiceCleanText(line,true)});
 const pick=G.pickRandomVillager;
 const ids=G.state.village.roster.filter(id=>id!==G.villagerId);
 for(const foreign of [false,true]){
  const id=ids.find(id=>(G.npcEnglishLevel(id)===0)===foreign);
  if(!id)throw Error('Missing real roster language cohort');
  G.pickRandomVillager=()=>id;G.state.questGiven=false;spoken.length=0;
  render(()=>{});
  if(foreign){
   T.ok('foreign wake description is displayed without speech quotes',!screen.innerHTML.includes('&quot;Someone is shaking')&&!screen.innerHTML.includes('"Someone is shaking'));
   T.ok('foreign wake description is silent',spoken[0].clean==='');
  }else{
   T.ok('English wake speech has explicit spoken quotes',spoken[0].line.startsWith('"')&&spoken[0].line.endsWith('"'));
   T.ok('English wake speech reaches the speech-only voice cleaner',spoken[0].clean.length>10);
  }
 }
 G.pickRandomVillager=pick;T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1});
