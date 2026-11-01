'use strict';
const K=require('./lib'),T=K.reporter('Field ability result bindings');
(async()=>{
 const G=await K.load({seed:7,narration:true});K.newRun(G);
 const src=K.readSrc('src/js/app.js');
 const between=(a,b)=>{const start=src.indexOf(a),end=src.indexOf(b,start);if(start<0||end<start)throw Error('Missing actual app boundary '+a);return src.slice(start,end);};
 const reader=between('  let fieldActionResult = null,','  function runCellAction(');
 const emit=between('  const combatOriginalEmit = Game.emit;',"  document.addEventListener('click'");
 const input=between('  function combatInput(action){','  function wireCombatPanel()');
 const binding=between('  function wireAbilityBar()','  function wireTargetBar()');
 const originalEmit=G.emit,actualMenu=G.activatableAbilities;
 function mounted(code=binding,targeted=false,captureCode=reader){
   G.emit=originalEmit;
   const button={dataset:{ab:'green_thumb.ask'}},bar={querySelectorAll:()=>[button]};let pick;
   const document={querySelector:q=>q==='.abilitybar'?bar:null};
   G.activatableAbilities=function(){return actualMenu.call(this).map(a=>a.id==='green_thumb.ask'&&targeted?{...a,target:'villager'}:a);};
   const api=new Function('Game','matchMedia','document','villagersNear','enterTargeting','refresh','refreshFeedback',captureCode+'\nlet combatActorCapture=null,combatPlayerCapture=null,combatSaveWarning=null;\n'+emit+'\n'+input+'\n'+code+'\nwireAbilityBar();return {read:fieldActionResultText};')(G,()=>({matches:true}),document,()=>[{id:'known-resident'}],v=>{pick=v.onPick;},()=>{},()=>{});
   return {read:api.read,tap:()=>{button.onclick();if(targeted){if(!pick)throw Error('No target selection');pick({id:'known-resident'});}}};
 }
 function ready(){
   K.openSlots(G,3);K.giveAbility(G,'green_thumb',{level:1});
   Object.assign(G.state.scholar,{kcal:2000,health:100,hydration:100,monster:null});
   delete G.state.scholar._askPlantsDay;G.pendingEncounter=null;G.tbfight=null;
   const offer=actualMenu.call(G).find(a=>a.id==='green_thumb.ask');if(!offer?.available)throw Error('Actual earned action unavailable '+JSON.stringify(offer));
 }
 for(const targeted of [false,true]){
   ready();const ui=mounted(binding,targeted),s=G.state.scholar,kcal=s.kcal;ui.tap();const text=ui.read();
   T.ok((targeted?'targeted':'ordinary')+' actual bound action retains its finding and payment',/plants (say|gossip)/i.test(text)&&/20 kcal/.test(text));
   T.ok('actual activation pays once and records the real daily use',s.kcal===kcal-20&&s._askPlantsDay===s.day);
   const before=JSON.stringify(G.state);ui.read();ui.read();T.ok('reader does not mutate the saved game',JSON.stringify(G.state)===before);
 }
 // Remove the actual new binding, rather than manufacture a failing result.
 const removed=binding.replaceAll('fieldActionFeedback(() => combatInput(', '((action) => action())(() => combatInput(');
 if(removed===binding)throw Error('New binding missing: baseline must fail before the fix');
 ready();const rejected=mounted(removed);rejected.tap();
 T.ok('removing the actual binding loses the grouped ability finding',rejected.read()==='');
 const impl=globalThis.AbilityActionImpls['green_thumb.ask'],warn=console.warn,warnings=[];
 const faulty=function(...args){impl(...args);throw Error('prepared composite binding failure');};
 const noFailureGuard=reader.replace('capture.failed || ','');
 if(noFailureGuard===reader)throw Error('Actual failed-capture guard missing');
 try{
   console.warn=(...args)=>warnings.push(args.map(String).join(' '));
   ready();globalThis.AbilityActionImpls['green_thumb.ask']=faulty;const control=mounted(binding,false,noFailureGuard);control.tap();
   T.ok('removing the failed-capture guard wrongly exposes the partial finding',/plants (say|gossip)/i.test(control.read()));
   K.newRun(G);ready();globalThis.AbilityActionImpls['green_thumb.ask']=faulty;const failed=mounted();failed.tap();
   T.ok('a caught activation exception cannot present a partial finding as success',failed.read()==='');
   T.ok('actual input caller shows reload guidance instead',/could not finish safely/.test(String(G.log.at(-1))));
   T.ok('the failed state cannot overwrite the earlier durable checkpoint',G.save()==='settlement_failed');
   T.ok('failure is reported rather than silently retried',warnings.some(w=>w.includes('[foodPower] ability activation failed')));
 }finally{globalThis.AbilityActionImpls['green_thumb.ask']=impl;console.warn=warn;}
 G.emit=originalEmit;G.activatableAbilities=actualMenu;T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
