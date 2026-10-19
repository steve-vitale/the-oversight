'use strict';
// Faults run in separate copied roots; never edit the active Game source.
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),z=require('zlib');
const root=path.resolve(__dirname,'..'),a=process.argv.indexOf('--out'),out=a<0?null:process.argv[a+1];
if(!out)throw Error('--out <new evidence prefix> required');if(fs.existsSync(out+'.json.gz'))throw Error('Retained proof already exists');
const faults=[
  {
    "name": "bare-delivery",
    "file": "src/js/godhood.js",
    "from": "sch.inventory.push(delivery || { itemId: itemId, units: 1, marketBought: true });",
    "to": "sch.inventory.push({ itemId: itemId, units: 1, marketBought: true });",
    "expected": "FAIL dried_apples: actual paid wish"
  },
  {
    "name": "zero-food",
    "file": "src/js/game.js",
    "from": "kg: def.kg ?? 0.3, kcalEach: def.kcalEach || 0",
    "to": "kg: def.kg ?? 0.3, kcalEach: 0",
    "expected": "FAIL dried_apples: actual paid wish"
  },
  {
    "name": "world-start-expiry",
    "file": "src/js/game.js",
    "from": "(this.state.scholar.day || 0) + def.spoilDay : 9999",
    "to": "def.spoilDay : 9999",
    "expected": "FAIL dried_apples: actual paid wish"
  },
  {
    "name": "no-material-role",
    "file": "src/js/game.js",
    "from": "if (material) entry.material = material;",
    "to": "if (false) entry.material = material;",
    "expected": "FAIL real crafting consumes the purchased stone"
  },
  {
    "name": "revealed-alien",
    "file": "src/js/game.js",
    "from": "if (def.origin === 'alien') { entry.alienLoot = true; entry.alienEffectHidden = true; }",
    "to": "if (def.origin === 'alien') { entry.alienLoot = true; entry.alienEffectHidden = false; }",
    "expected": "FAIL alien delivery conceals its effect"
  }
];
const rows=[];
for(const fault of faults){const temp=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-market-delivery-'+fault.name+'-'));for(const f of ['src','scripts','index.html','sw.js','version.json'])fs.cpSync(path.join(root,f),path.join(temp,f),{recursive:true});const file=path.join(temp,fault.file),s=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');if(s.split(fault.from).length!==2)throw Error('Nonunique fault anchor '+fault.name);fs.writeFileSync(file,s.replace(fault.from,fault.to));const r=cp.spawnSync(process.execPath,[path.join(root,'scripts/godpath/test-market-delivery.js'),'--root',temp],{cwd:temp,env:{...process.env,SEED:'7'},encoding:'utf8',timeout:60000,maxBuffer:8e6});const rejected=r.status!==0&&r.stdout.includes(fault.expected)&&/market delivery: \d+ passed, [1-9]\d* failed/.test(r.stdout);rows.push({name:fault.name,temp,status:r.status,error:r.error?.message||null,rejected,stdout:r.stdout,stderr:r.stderr});console.log(fault.name+': '+(rejected?'rejected':'UNPROVEN'));}
fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify({scope:'Isolated targeted faults; roots retained in temporary directories, active source never mutated',rows})+'\n'),{flag:'wx'});if(rows.some(r=>!r.rejected))process.exitCode=1;
