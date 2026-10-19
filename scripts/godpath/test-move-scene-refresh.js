'use strict';
const K=require('./lib'),T=K.reporter('move scene refresh');
const source=K.readSrc('src/js/app.js').replace(/\r\n/g,'\n');
const a=source.indexOf('  function moveSig()'),b=source.indexOf('  MoveAnim.hooks.step',a);
(async()=>{
 const G=await K.load({seed:181029,narration:true});K.newRun(G);
 let paints=0;
 // DOM plumbing only. Real Game status/travel/narration drive the actual
 // application decision between a full scene render and light bar refresh.
 const doc={getElementById:()=>null,querySelector:()=>null};
 const ui=new Function('Game','document','expeditionScreen','expHeadHTML','dayTickBar','statusBars',source.slice(a,b)+'\nreturn {moveSig,syncAfterMove};')(G,doc,()=>{paints++;},()=>'',()=>'',()=>'');
 const s=G.state.scholar;G.map.px=3;G.map.py=4;s.mx=8;s.my=2;s.insideHaven=false;
 let step={_sig:ui.moveSig()};const crossed=G.tryNodeExit(1,0);ui.syncAfterMove(step,crossed);
 T.ok('actual dpad node arrival requests a new scene',crossed?.moved&&G.playerTile().type==='haven'&&paints===1);
 step={_sig:ui.moveSig()};const before=paints;ui.syncAfterMove(step,{moved:false});
 T.ok('unchanged blocked step can keep the light refresh',paints===before);
 step={_sig:ui.moveSig()};G.say('A new observation arrives while walking.');ui.syncAfterMove(step,{moved:true});
 T.ok('real narration invalidates the scene even without state.log',paints===before+1);
 step={_sig:ui.moveSig()};s.insideHaven=!s.insideHaven;const preInside=paints;ui.syncAfterMove(step,{moved:true});
 T.ok('hall and grounds are distinct rendered scenes',paints===preInside+1);
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
