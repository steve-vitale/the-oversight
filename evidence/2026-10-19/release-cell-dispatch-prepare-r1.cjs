'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'../..'),f=JSON.parse(fs.readFileSync(path.join(root,'evidence/2026-10-18/installed-update-old-save-r1.json'))),key=Object.keys(f.storage).find(k=>k.startsWith('scattering-save-v1-')),s=JSON.parse(f.storage[key]);
s.scholar.inventory=[{name:'Prepared smoked meat',foodKind:'meat',foodState:'preserved',units:2,kcalEach:400,kg:0.2},{name:'Prepared rendered fat',foodKind:'fat',foodState:'rendered',units:1,kcalEach:810,kg:0.1},{name:'Prepared berries',foodKind:'plant',plantId:'blackberry',units:2,kcalEach:30,kg:0.1}];
s.codex.techniques={...(s.codex.techniques||{}),render:true,shell:true};s.corpses=[];s.village.positions={};s.scholar.insideHaven=true;s.scholar.mx=4;s.scholar.my=4;
f.storage[key]=JSON.stringify(s);f.fixture='Prepared fire-menu ingredients/knowledge and empty nearby corpse field; captured campaign, no natural attainment claim';
fs.writeFileSync(path.join(__dirname,'release-cell-dispatch-fixture-r1.json'),JSON.stringify(f)+'\n',{flag:'wx'});
