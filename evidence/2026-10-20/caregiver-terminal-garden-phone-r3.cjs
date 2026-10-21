'use strict';
// Reuse the retained native combat journey; add gardening only after victory
// and native Continue. Never prepare a garden or grant an ability/resource.
const fs=require('fs');
let source=fs.readFileSync('evidence/2026-10-20/caregiver-terminal-fight-phone-r2.cjs','utf8').replace("process.argv[2]||'r2'","process.argv[2]||'garden-r3'");
const anchor=" if(errors.length)throw Error(errors.join('\\n'));return{height,trace,errors,turns,beforeUnload,continued,scope:";
const extra=String.raw`
 const gardenState=()=>page.evaluate(()=>{const G=Scattering.Game,s=G.state.scholar;return{day:s.day,ticks:s.dayTicks,kcal:s.kcal,inside:s.insideHaven,abilities:s.abilities.map(a=>({id:a.id,level:a.level})),plots:JSON.parse(JSON.stringify(G.map.tiles[4][4].plots)),saved:JSON.parse(localStorage.getItem(G.state.runKey))};});
 await tap('[data-field-panel="place"]');await tap('[data-open-garden]');await snap('natural late-game Garden');
 if(await page.locator('[data-garden="outside"]').count())await tap('[data-garden="outside"]');
 const gardenBefore=await gardenState();await tap('[data-garden="cultivate"]');await snap('natural invested cultivation after combat');const gardenPaid=await gardenState();
 if(gardenPaid.kcal!==gardenBefore.kcal-200||!gardenPaid.plots.some((p,i)=>(p.magicGrowth||0)>=(gardenBefore.plots[i].magicGrowth||0)+20)||gardenPaid.saved.scholar.kcal!==gardenPaid.kcal)throw Error('Expected natural paid level3+3 cultivation and immediate save');
 if(!await page.locator('[data-garden="cultivate"]').isDisabled())throw Error('Garden permits a second same-day cast');
 await page.goto(base);await page.waitForLoadState('networkidle');await tap('[data-load="'+setup.key+'"]');await present();await snap('native Continue retains invested garden work');const gardenContinued=await gardenState();
 if(gardenPaid.kcal!==gardenContinued.kcal||JSON.stringify(gardenPaid.plots)!==JSON.stringify(gardenContinued.plots))throw Error('Continue lost paid garden work');
 trace.at(-1).garden={before:{...gardenBefore,saved:undefined},paid:{...gardenPaid,saved:undefined},continued:{...gardenContinued,saved:undefined}};
`;
if(!source.includes(anchor))throw Error('Combat recipe anchor changed');
source=source.replace(anchor,extra+'\n'+anchor).replaceAll('caregiver-terminal-fight-phone-','caregiver-terminal-garden-phone-');
// Compile as a separate module so the retained helper imports resolve normally.
const Module=require('module'),m=new Module(__filename,module);m.filename=__filename;m.paths=module.paths;m._compile(source,__filename);
