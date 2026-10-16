'use strict';
// Prepared late-game holders, real hit/turn/Strike paths; no access claim.
const fs=require('fs'),vm=require('vm');
let html=fs.readFileSync('index.html','utf8').replace('<head>','<head><base href="/">');
const code=String.raw`
function readSupport(){const G=Scattering.Game,p=G.tbFighter('p'),m=G.tbfight?.fighters.find(x=>x.kind==='monster');document.getElementById('support-result').textContent='Player rally '+(p?.rallyBuff||0)+'; stunned '+(p?.stunned||0)+'; full '+(p?.stunFull||0)+'; current '+(G.tbCurrent()?.key||'none')+'; round '+G.tbfight?.round+'; foe HP '+m?.hp;}
function prepareSupport(god){const G=Scattering.Game;G.tbfight=null;G.over=false;G.genRoster('Columbus, Ohio');G.newGame('Columbus, Ohio',null,G.generatedRoster[0].id);G.depart();const s=G.state.scholar,v=G.state.village;s.day=85;s.kcal=1200;s.health=100;s.abilities=[];s.inventory=[];s.insideHaven=false;s.knackChosen=true;s.knackChoices=null;G.state.systemArrived=true;G.state.systemAnimationShown=true;const roster=v.roster.slice(),id=roster.find(x=>x!==G.villagerId);v.npcAbilities={[id]:[]};v.npcSkills={[id]:[]};v.npcGodhood={[id]:{active:[god],recognized:{[god]:85}}};s.mx=3;s.my=4;G.genDetail(G.map.px,G.map.py);const tile=G.playerTile();tile.type='grove';tile.detail=Array.from({length:9},()=>Array(9).fill('grass'));tile.plantSpecies={};v.roster=[];s.monster={id:'review_drone',mx:4,my:4};G.startCombat('review_drone');v.roster=roster;const f=G.tbfight,p=G.tbFighter('p'),m=f.fighters.find(x=>x.kind==='monster');p.mx=3;p.my=4;p.hp=100;p.alive=true;p.acted=false;m.mx=4;m.my=4;m.hp=m.maxHp=10000;const a={key:'v_support',kind:'villager',villagerId:id,name:G.displayName(id),hp:60,maxHp:100,mx:2,my:4,alive:true,fled:false,ai:'brave'};f.fighters.push(a);f.order=['p',a.key,m.key];f.turnIdx=0;f.round=1;delete f._gv;G.tbDamage(a.key,god==='one_person_army'?20:999,'prepared physical hit',m.key,{undodgeable:true});window.dispatchEvent(new CustomEvent('tb-turn',{detail:{phase:'player'}}));readSupport();}
document.getElementById('support-brawler').onclick=()=>prepareSupport('one_person_army');
document.getElementById('support-voice').onclick=()=>prepareSupport('voice_of_the_relay');
document.getElementById('support-read').onclick=readSupport;
`;
new vm.Script(code);
html=html.replace('</body>','<aside style="position:fixed;left:0;top:0;right:0;z-index:99999;background:#17231c;color:white;font:12px/1.4 system-ui;padding:4px"><b>PREPARED NPC SUPPORT PROOF</b><br><button id="support-brawler">Prepare wounded brawler</button> <button id="support-voice">Prepare fallen Voice</button> <button id="support-read">Read support</button><div id="support-result"></div></aside><script>'+code+'</script></body>');
fs.writeFileSync(process.argv[2]||'.git/god-support-phone.html',html);
