'use strict';
const fs = require('fs'), vm = require('vm');
let html = fs.readFileSync('index.html', 'utf8').replace('<head>', '<head><base href="/">');
const code = String.raw`
let formalProof;
document.getElementById('formal-prepare').onclick = () => {
  const G=Scattering.Game;
  G.tbfight=null;G.over=false;G.genRoster('Columbus, Ohio');G.newGame('Columbus, Ohio',null,G.generatedRoster[0].id);G.depart();
  const s=G.state.scholar,v=G.state.village,id=v.roster.find(x=>x!==G.villagerId&&G.npcAge(x)>=18);
  s.day=85;s.kcal=4000;s.health=100;s.insideHaven=false;s.knackChosen=true;s.knackChoices=null;s.mx=0;s.my=4;
  G.state.systemArrived=true;G.state.systemAnimationShown=true;
  G.map.px=4;G.map.py=5;
  const t=G.playerTile();t.type='grove';t.detail=Array.from({length:9},()=>Array(9).fill('grass'));
  const dest=G.tileAt(3,5);dest.type='haven';dest.isHaven=true;dest.blockage=null;
  v.positions={};for(const who of v.roster)v.positions[who]={mx:8,my:8};
  v.party=[id];v.health=v.health||{};v.health[id]=77;
  G.vpOf(id).equipped={melee:{itemId:'hunting_spear'},torso:{itemId:'leather_jacket'}};
  s.monster={id:'review_drone',mx:6,my:4};G.startCombat('review_drone');
  formalProof={id,entry:structuredClone(G.tbfight.fighters.find(x=>x.kind==='villager'&&x.villagerId===id))};
  window.dispatchEvent(new CustomEvent('tb-turn',{detail:{phase:'player'}}));document.getElementById('formal-read').click();
};
document.getElementById('formal-read').onclick=()=>{
  const G=Scattering.Game,p=formalProof;
  document.getElementById('formal-result').textContent=p?'Entry '+p.entry.hp+'/'+p.entry.maxHp+' HP; worn weapon '+(p.entry.wbonus||0)+', armor '+(p.entry.varmor||0)+'. World HP now '+G.state.village.health[p.id]+'. Fight '+(G.tbfight&&!G.tbfight.over?'live':G.tbfight?.result||'ended')+'. Current turn '+(G.tbCurrent()?.kind||'none')+'.':'Prepare first.';
};`;
new vm.Script(code);
html=html.replace('</body>', '<aside style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#17231c;color:white;padding:4px;font:12px/1.4 system-ui"><b>PREPARED FAR COMPANION BODY PROOF</b> · wounded77, worn spear/jacket · step west through barrier<br><button id="formal-prepare">Prepare far companion</button> <button id="formal-read">Read body</button><div id="formal-result"></div></aside><script>'+code+'</script></body>');
fs.writeFileSync(process.argv[2]||'.git/formal-companion-phone.html',html);
