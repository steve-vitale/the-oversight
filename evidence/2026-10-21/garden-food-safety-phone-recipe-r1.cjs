'use strict';
const fs=require('fs');
let source=fs.readFileSync('evidence/2026-10-21/garden-intake-phone-r6.cjs','utf8')
 .replaceAll('garden-intake-phone-fixture-r2','garden-food-safety-phone-fixture-r1')
 .replaceAll('garden-intake-r6-','garden-food-safety-r1-')
 .replaceAll('garden-intake-phone-','garden-food-safety-phone-')
 .replaceAll('failure-r6','failure-r1').replaceAll("+'-r6.json'","+'-r1.json'");
const mark="await tap('.inline-head [data-x]');await tap('[data-lm=\"pack\"]');await snap('pack exposes actual new garden food');";
if(!source.includes(mark))throw Error('Phone recipe changed');
source=source.replace(mark,`const repeatBefore=await read();await tap('[data-garden="harvest"]');const repeatAfter=await read();if(JSON.stringify(repeatAfter)!==JSON.stringify(repeatBefore))throw Error('Empty harvest changed saved resources');await snap('empty harvest refuses without payment');
 ${mark}
 const rawIndex=await page.evaluate(()=>Scattering.Game.state.scholar.inventory.findIndex(i=>i.plantId==='stinging_nettle'));const raw=(await read()).inventory[rawIndex];if(!raw.needsCooking||!raw.diseaseRisk)throw Error('Harvested nettle lost its raw risk');const cook='[data-cook="'+rawIndex+'"]';await reach(cook);await snap('harvested nettle exposes cooking requirement and actual Cook control');await tap(cook);await snap('real cooking resolves raw risk');const cooked=(await read()).inventory[rawIndex];if(cooked.foodState!=='cooked'||cooked.needsCooking||cooked.diseaseRisk||cooked.gardenShares?.assisted!==1)throw Error('Actual cooking or source preservation failed');`);
source=source.replace("const sel='[data-eatone=\"'+index+'\"]';await reach(sel);await tap(sel);", "const expectedKcal=(await read()).inventory[index].kcalEach;const sel='[data-eatone=\"'+index+'\"]';await reach(sel);await tap(sel);")
 .replace("state.intake?.origins[kind]?.kcal!==45","state.intake?.origins[kind]?.kcal!==expectedKcal")
 .replace('actual phone Continue, paid cast, harvest, ordinary/assisted pack meals','actual phone Continue, paid cast, harvest, raw nettle warning, real cooking, ordinary/assisted pack meals');
fs.writeFileSync('evidence/2026-10-21/garden-food-safety-phone-r1.cjs',source,{flag:'wx'});
