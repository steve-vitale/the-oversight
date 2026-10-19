'use strict';
// Faults run in separate copied roots; never edit the active Game source.
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),z=require('zlib');
const root=path.resolve(__dirname,'..'),a=process.argv.indexOf('--out'),out=a<0?null:process.argv[a+1];
if(!out)throw Error('--out <new evidence prefix> required');if(fs.existsSync(out+'.json.gz'))throw Error('Retained proof already exists');
const faults=[
  {
    "name": "activation-not-quoted",
    "file": "src/js/godverbs.js",
    "from": "S.Godhood.marketTerms({ kcal: s.kcal - status.activationKcal }, id)",
    "to": "S.Godhood.marketTerms({ kcal: s.kcal }, id)",
    "expected": "FAIL quote accounts for activation before affordability"
  },
  {
    "name": "catalog-leak",
    "file": "src/js/godverbs.js",
    "from": "this.data.items.filter(d => known.has(d.id))",
    "to": "this.data.items.filter(d => true)",
    "expected": "FAIL suggestions hide unobserved catalog names"
  },
  {
    "name": "named-choice-disabled",
    "file": "src/js/godverbs.js",
    "from": "choiceAvailable: act.id === 'name_price' && this.marketWishStatus().ok",
    "to": "choiceAvailable: false",
    "expected": "FAIL having the strongest weapon does not disable named choice"
  },
  {
    "name": "cheap-relic",
    "file": "src/js/godhood.js",
    "from": "markersTaken: tier >= 4 ? 2 : paidKcal ? 0 : 1",
    "to": "markersTaken: tier >= 4 ? 1 : paidKcal ? 0 : 1",
    "expected": "FAIL relic quote includes both markers"
  },
  {
    "name": "paid-inspection",
    "file": "src/js/godverbs.js",
    "from": "const status = this.marketWishStatus();",
    "to": "this.state.scholar.kcal -= 1; const status = this.marketWishStatus();",
    "expected": "FAIL known suggestions and repeated quote calls do not mutate"
  }
];
const rows=[];
for(const fault of faults){const temp=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-market-choice-'+fault.name+'-'));for(const f of ['src','scripts','index.html','sw.js','version.json'])fs.cpSync(path.join(root,f),path.join(temp,f),{recursive:true});const file=path.join(temp,fault.file),s=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');if(s.split(fault.from).length!==2)throw Error('Nonunique fault anchor '+fault.name);fs.writeFileSync(file,s.replace(fault.from,fault.to));const r=cp.spawnSync(process.execPath,[path.join(root,'scripts/godpath/test-market-choice.js'),'--root',temp],{cwd:temp,env:{...process.env,SEED:'7'},encoding:'utf8',timeout:60000,maxBuffer:8e6});const rejected=r.status!==0&&r.stdout.includes(fault.expected)&&/market choice: \d+ passed, [1-9]\d* failed/.test(r.stdout);rows.push({name:fault.name,temp,status:r.status,error:r.error?.message||null,rejected,stdout:r.stdout,stderr:r.stderr});console.log(fault.name+': '+(rejected?'rejected':'UNPROVEN'));}
fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify({scope:'Isolated targeted faults; roots retained in temporary directories, active source never mutated',rows})+'\n'),{flag:'wx'});if(rows.some(r=>!r.rejected))process.exitCode=1;
