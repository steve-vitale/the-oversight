'use strict';
// Faults run in separate copied roots; never edit the active Game source.
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),z=require('zlib');
const root=path.resolve(__dirname,'..'),a=process.argv.indexOf('--out'),out=a<0?null:process.argv[a+1];
if(!out)throw Error('--out <new evidence prefix> required');if(fs.existsSync(out+'.json.gz'))throw Error('Retained proof already exists');
const faults=[
  {
    "name": "ordinary-unknown",
    "file": "src/js/game.js",
    "from": "if (it && it.id) S.ITEM_TIER[it.id] = it.lootTier || it.tier || 1;",
    "to": "if (it && it.id && it.lootTier) S.ITEM_TIER[it.id] = it.lootTier;",
    "expected": "FAIL every actual catalog item"
  },
  {
    "name": "tier-only-armor",
    "file": "src/js/game.js",
    "from": "it.lootTier || it.tier || 1",
    "to": "it.lootTier || 1",
    "expected": "FAIL tier-only alien armor"
  },
  {
    "name": "no-final-dawn-save",
    "file": "src/js/godverbs.js",
    "from": "if (changed) { try { game.save(); }",
    "to": "if (false) { try { game.save(); }",
    "expected": "FAIL real Continue retains the fresh coin"
  },
  {
    "name": "repeat-player-dawn",
    "file": "src/js/godverbs.js",
    "from": "s.godhood._godDawnDay !== day)",
    "to": "true)",
    "expected": "FAIL re-entering the same dawn cannot regenerate another coin"
  },
  {
    "name": "repeat-npc-dawn",
    "file": "src/js/godverbs.js",
    "from": "if (rec._godDawnDay === day) continue;",
    "to": "if (false) continue;",
    "expected": "FAIL NPC same-day dawn re-entry"
  },
  {
    "name": "guard-needs-wish-book",
    "file": "src/js/godhood.js",
    "from": "if (!sch.godhood) return;",
    "to": "if (!sch.godhood || !sch.godhood.capstoneUsed) return;",
    "expected": "FAIL player regains one coin even without ever using a daily action"
  },
  {
    "name": "unknown-activation-price",
    "file": "src/js/godverbs.js",
    "from": "if (!itemId || !S.Godhood || !S.Godhood.itemTier(itemId)) return",
    "to": "if (!itemId) return",
    "expected": "FAIL unknown public wish refuses before its activation fuel"
  }
];
const rows=[];
for(const fault of faults){const temp=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-market-dawn-'+fault.name+'-'));for(const f of ['src','scripts','index.html','sw.js','version.json'])fs.cpSync(path.join(root,f),path.join(temp,f),{recursive:true});const file=path.join(temp,fault.file),s=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');if(s.split(fault.from).length!==2)throw Error('Nonunique fault anchor '+fault.name);fs.writeFileSync(file,s.replace(fault.from,fault.to));const r=cp.spawnSync(process.execPath,[path.join(root,'scripts/godpath/test-market-dawn-catalog.js'),'--root',temp],{cwd:temp,env:{...process.env,SEED:'7'},encoding:'utf8',timeout:60000,maxBuffer:8e6});const rejected=r.status!==0&&r.stdout.includes(fault.expected)&&/market-dawn-catalog: \d+ passed, [1-9]\d* failed/.test(r.stdout);rows.push({name:fault.name,temp,status:r.status,error:r.error?.message||null,rejected,stdout:r.stdout,stderr:r.stderr});console.log(fault.name+': '+(rejected?'rejected':'UNPROVEN'));}
fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify({scope:'Isolated targeted faults; roots retained in temporary directories, active source never mutated',rows})+'\n'),{flag:'wx'});if(rows.some(r=>!r.rejected))process.exitCode=1;
