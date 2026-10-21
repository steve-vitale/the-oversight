'use strict';
const fs=require('fs'),Module=require('module');
let source=fs.readFileSync('evidence/2026-10-21/garden-intake-prepare-phone-r2.cjs','utf8')
 .replaceAll('garden-intake-phone-fixture-r2','garden-food-safety-phone-fixture-r1')
 .replace("G.gardenPlant(G.gardenPlots()[1],'dandelion',5);","G.state.codex.plants.stinging_nettle={level:3,prepKnown:true};G.learnTechnique('cook','trial');G.gardenPlant(G.gardenPlots()[1],'stinging_nettle',5);")
 .replace('ordinary 30-day crop and 26-day crop awaiting a real paid growth cast.','ordinary dandelion and 26-day stinging nettle awaiting a real paid growth cast; known cooking technique supplied. Neither food nor completed cooking supplied.');
const m=new Module(__filename,module);m.filename=__filename;m.paths=module.paths;m._compile(source,__filename);
