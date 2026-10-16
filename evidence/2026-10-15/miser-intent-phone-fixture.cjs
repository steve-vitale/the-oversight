// Import the retained natural checkpoint; no XP, ability or equipment grants.
// Skip browser-only arrival/knack prompts left unanswered by the Node driver.
const fs=require('fs'),z=require('zlib'),vm=require('vm');
const record=JSON.parse(z.gunzipSync(fs.readFileSync('evidence/2026-10-15/miser-intent-checkpoint.json.gz')));
let html=fs.readFileSync('index.html','utf8').replace('<head>','<head><base href="/">');
const code=`const naturalMiser=${JSON.stringify(record.checkpoint)};
document.getElementById('miser-import').onclick=()=>{const G=Scattering.Game;G.state=JSON.parse(JSON.stringify(naturalMiser.state));G.data.villagers=JSON.parse(JSON.stringify(naturalMiser.villagers));G.state.systemAnimationShown=true;G.state.scholar.knackChosen=true;G.state.scholar.knackChoices=[];const r=G.state.run;for(const k of ['map','dayPart','location','departed','homeRegion','villagerId','encounterDone','wanderer'])G[k]=r[k];G.log=r.log;G.over=false;G.tbfight=null;G.pendingEncounter=false;G.pendingMonsterId=null;G.pendingInTent=false;const saved=G.save();document.getElementById('miser-proof').textContent=saved!==true?' Save refused: '+saved:' Imported day '+G.state.scholar.day+' · '+G.state.scholar.godpath.path+'/'+G.state.scholar.godpath.subclass+' · '+G.state.scholar.abilities.length+' earned slots. Reload, then Continue.';};`;
new vm.Script(code);
html=html.replace('</body>','<aside style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#17231c;color:white;padding:5px;font:12px/1.4 system-ui"><b>NATURAL MISER CHECKPOINT REPLAY</b> · seed4, original kit, day75 · includes the reactor · early UI prompts skipped<br><button id="miser-import">Import natural checkpoint</button><span id="miser-proof"></span></aside><script>'+code+'</script></body>');
fs.writeFileSync('.git/miser-intent-phone.html',html);
