'use strict';
// Faults run in separate copied roots; never edit the active Game source.
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),z=require('zlib');
const root=path.resolve(__dirname,'..'),a=process.argv.indexOf('--out'),out=a<0?null:process.argv[a+1];
if(!out)throw Error('--out <new evidence prefix> required');if(fs.existsSync(out+'.json.gz'))throw Error('Retained proof already exists');
const faults=[
  {
    "name": "unobserved-market",
    "file": "scripts/gear-usage-audit.js",
    "from": "  marketNamePrice: 'market',\n",
    "to": "",
    "expected": "FAIL actual Market grant boundary"
  },
  {
    "name": "ordinary-trade-alias",
    "file": "scripts/gear-usage-audit.js",
    "from": "marketNamePrice: 'market'",
    "to": "marketNamePrice: 'trade'",
    "expected": "FAIL one direct physical unit has one Market source"
  },
  {
    "name": "unborrowed-relic",
    "file": "scripts/gear-usage-audit.js",
    "from": "borrowed: Number.isFinite(result?.tier) ? result.tier >= 4 : null",
    "to": "borrowed: false",
    "expected": "FAIL borrowed receipt distinguishes actual debt"
  },
  {
    "name": "starting-gear-earned",
    "file": "scripts/gear-usage-audit.js",
    "from": "rec.sample = () => {",
    "to": "rec.sample = () => { rec.grants.push({day:G.state.scholar.day,source:'market',id:'searcaster',who:'player',n:1,tier:4,gear:true});",
    "expected": "FAIL observed starting high-tier gear is never an earned acquisition"
  },
  {
    "name": "observation-charges-food",
    "file": "scripts/gear-usage-audit.js",
    "from": "const after = inventory();",
    "to": "if(lane==='market')G.state.scholar.kcal-=1; const after = inventory();",
    "expected": "FAIL real paid-action observer on/off preserves full Game hash"
  }
];
const rows=[];
for(const fault of faults){const temp=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-market-observer-'+fault.name+'-'));for(const f of ['src','scripts','index.html','sw.js','version.json'])fs.cpSync(path.join(root,f),path.join(temp,f),{recursive:true});const file=path.join(temp,fault.file),s=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');if(s.split(fault.from).length!==2)throw Error('Nonunique fault anchor '+fault.name);fs.writeFileSync(file,s.replace(fault.from,fault.to));const r=cp.spawnSync(process.execPath,[path.join(temp,'scripts/godpath/test-market-gear-observer.js')],{cwd:temp,env:{...process.env,SEED:'7'},encoding:'utf8',timeout:60000,maxBuffer:8e6});const rejected=r.status!==0&&r.stdout.includes(fault.expected)&&/market gear observer: \d+ passed, [1-9]\d* failed/.test(r.stdout);rows.push({name:fault.name,temp,status:r.status,error:r.error?.message||null,rejected,stdout:r.stdout,stderr:r.stderr});console.log(fault.name+': '+(rejected?'rejected':'UNPROVEN'));}
fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify({scope:'Isolated targeted faults; roots retained in temporary directories, active source never mutated',rows})+'\n'),{flag:'wx'});if(rows.some(r=>!r.rejected))process.exitCode=1;
