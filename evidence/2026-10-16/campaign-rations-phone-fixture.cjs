'use strict';
const fs=require('fs'),vm=require('vm'),crypto=require('crypto');
let html=fs.readFileSync('index.html','utf8').replace('<head>','<head><base href="/">');
const modules=['idle','competent','campaign-rations'],wrap=modules.map(n=>{const source=fs.readFileSync('scripts/policies/'+n+'.js','utf8');return 'mods['+JSON.stringify(n)+']={exports:{}};(function(module,require,process){\n'+source+'\n})(mods['+JSON.stringify(n)+'],n=>mods[n.replace("./","")].exports,{env:{}});';}).join('\n');
const code=String.raw`const mods={};
WRAP
const R=mods['campaign-rations'].exports;let ctx={},before=null;
function readRations(){const G=Scattering.Game,s=G.state.scholar,v=G.state.village,id=G.villagerId;document.getElementById('ration-result').textContent=JSON.stringify({prepared:true,inside:s.insideHaven,exiled:!!s.exiled,pack:R.food(G),pantry:G.pantryKcal(),takes:v.takes?.[id]||0,gives:v.gives?.[id]||0,daily:G.fullLine(),reserve:2*G.villageDailyNeed(),ctx,before},null,2);}
document.getElementById('ration-prepare').onclick=()=>{const G=Scattering.Game;G.tbfight=null;G.pendingEncounter=null;G.over=false;G.genRoster('Columbus, Ohio');G.newGame('Columbus, Ohio',null,G.generatedRoster[0].id);G.depart();const s=G.state.scholar,v=G.state.village,id=G.villagerId;s.day=85;s.kcal=2400;s.health=100;s.inventory=[];s.abilities=[];s.insideHaven=false;s.exiled=false;s.integration=5;s.knackChosen=true;s.knackChoices=null;G.state.systemArrived=true;G.state.systemAnimationShown=true;v.pantry=[{name:'Prepared ration proof',foodState:'ready',safe:true,edible:true,units:200,kcalEach:500,kg:.1,spoilDay:9999}];v.gives={[id]:100000};v.takes={[id]:0};v.takeHist={[id]:[]};ctx={campaignTarget:'herald'};before={pack:0,pantry:G.pantryKcal()};readRations();};
document.getElementById('ration-run').onclick=()=>{R.provision(Scattering.Game,ctx,12400);readRations();};
document.getElementById('ration-exile').onclick=()=>{Scattering.Game.state.scholar.exiled=true;readRations();};
document.getElementById('ration-read').onclick=readRations;
`.replace('WRAP',wrap);new vm.Script(code);
const digest=crypto.createHash('sha256').update(fs.readFileSync('scripts/policies/campaign-rations.js')).digest('hex');
html=html.replace('</body>',`<aside style="position:fixed;inset:0;z-index:99999;background:#17231c;color:white;font:14px/1.4 system-ui;padding:12px;overflow:auto"><b>PREPARED RATION POLICY PROOF</b><p>Prepared day85, food stock and contribution credit. Exact Node policy runs in this browser through real game verbs. This does not prove natural access.</p><button id="ration-prepare">Prepare hall supply</button> <button id="ration-run">Run ration provision</button> <button id="ration-exile">Prepare exile</button> <button id="ration-read">Read state</button><pre id="ration-result" style="white-space:pre-wrap"></pre><small>Policy SHA256 ${digest}</small></aside><script>${code}</script></body>`);
fs.writeFileSync(process.argv[2]||'.git/campaign-rations-phone.html',html);
