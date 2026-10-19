'use strict';
const K=require('./lib'),T=K.reporter('Pack action feedback');
const src=K.readSrc('src/js/app.js').replace(/\r\n/g,'\n');
(async()=>{
 const G=await K.load({seed:181031,narration:true});K.newRun(G);
 const a=src.indexOf('  function packActionFeedback('),b=src.indexOf('  function renderInvInline(',a);
 T.ok('Pack uses a shared outcome feedback handler',a>=0&&b>a);
 if(a<0){T.done();return;}
 const run=new Function('Game',src.slice(a,b)+'\nreturn packActionFeedback;')(G),s=G.state.scholar;
 s.water=[{quality:'clean',source:'prepared bottle'}];s.hydration=100;let ticks=s.dayTicks;
 let result=run(()=>G.doAction('drink'),'Drank.');
 T.ok('refused drink displays its actual reason',/not thirsty/i.test(result)&&!/^Drank\./.test(result));
 T.ok('refused drink consumes no bottle or time',s.water.length===1&&s.dayTicks===ticks&&s.hydration===100);
 s.hydration=40;result=run(()=>G.doAction('drink'),'Drank.');
 T.ok('successful drink displays the actual clean-water result',/Drank clean water/i.test(result));
 T.ok('successful drink settles one bottle and the actual hydration gain',s.water.length===0&&s.hydration===90&&s.dayTicks===ticks+1);
 s.inventory=[{name:'Prepared meal',units:2,kcalEach:100,spoilDay:9999}];s.insideHaven=false;
 let inv=JSON.stringify(s.inventory);result=run(()=>G.donateToPantry(0),'Donated to the pantry.');
 T.ok('remote donation displays the actual pantry refusal',/pantry is in the hall/i.test(result)&&!/^Donated/.test(result));
 T.ok('remote donation leaves physical food in the pack',JSON.stringify(s.inventory)===inv);
 s.insideHaven=true;result=run(()=>G.donateToPantry(0),'Donated to the pantry.');
 T.ok('actual pantry donation displays its real settlement',/Donated Prepared meal/i.test(result)&&s.inventory.length===0);
 T.ok('an opaque return value cannot fabricate generic success',run(()=>({status:'opaque'}),'Crafted.')==null);
 T.ok('a browser handled flag cannot fabricate success',run(()=>true,'Drank.')==null);
 T.ok('silent refusal retains its explicit reason',run(()=>({ok:false,why:'The counter is closed.'}),'Packed.')==='The counter is closed.');
 T.ok('explicit silent success retains its fallback',run(()=>({ok:true}),'Packed.')==='Packed.');
 G.learnRecipe('arrow',3);s.inventory=[];ticks=s.dayTicks;
 result=run(()=>G.craft('arrow'),'Crafted.');
 T.ok('actual missing-material craft shows its refusal rather than generic success',!!result&&!/^Crafted\.$/.test(result)&&G.ammoCount('arrow')===0&&s.dayTicks===ticks,result);
 const buttonSource=src.match(/  function craftButtonHTML\(recipe, level\) \{[\s\S]*?\n  \}/)?.[0];
 if(!buttonSource)throw Error('Actual crafting button renderer missing');
 const button=Function('Game',buttonSource+'\nreturn craftButtonHTML;')(G);
 for(const level of[1,2,3]){const expected=Math.round(Math.max(0,Math.min(1,G.modTarget('craft.success',level<2?.35:.85)))*100),html=button({id:'arrow'},level);T.ok('real L'+level+' button states the engine probability and failed-material cost',html.includes('('+expected+'%)')&&html.includes('Materials are used even if crafting fails.'))}
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1;});
