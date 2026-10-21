'use strict';
// Read retained observations only; no Game loading, RNG, source or result edits.
const fs=require('fs'),z=require('zlib'),crypto=require('crypto'),assert=require('assert/strict');
const file='evidence/2026-10-21/garden-intake-long-after-r2.json.gz',bytes=fs.readFileSync(file),raw=JSON.parse(z.gunzipSync(bytes));assert(raw.stable);
const observed=raw.results.filter(r=>r.garden),tiers={};
for(const r of observed)for(const d of r.garden.days){const t=tiers[d.tier]||(tiers[d.tier]={sampledDays:0,cases:new Set(),maxPlots:0,plantedDays:0});t.sampledDays++;t.cases.add(r.row.policy+':'+r.row.seed+':'+r.job.days);t.maxPlots=Math.max(t.maxPlots,d.plots);if(d.planted)t.plantedDays++;}
for(const t of Object.values(tiers)){t.cases=t.cases.size;}
const result={scope:'Historical retained natural garden-intake long audit on released14dd8521d. Capacity exposure only; not rerun on safety candidate, not food usefulness.',source:file,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),observedCases:observed.length,tiers,controllerRule:'workGarden uses Math.min(4, Game.gardenCapacity()). Larger Haven tiers do not imply the bot attempts six/nine beds.',decision:'Add actual capacity/affordability opportunities to controller evaluation. Do not force maximum planting as a balance objective or infer upper-tier usefulness from these runs.'};
fs.writeFileSync('evidence/2026-10-21/garden-food-safety-controller-gap-r1.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
