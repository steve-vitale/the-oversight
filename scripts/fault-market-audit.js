'use strict';
// Faults run in separate copied roots; never edit the active Game source.
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),z=require('zlib');
const root=path.resolve(__dirname,'..'),a=process.argv.indexOf('--out'),out=a<0?null:process.argv[a+1];
if(!out)throw Error('--out <new evidence prefix> required');if(fs.existsSync(out+'.json.gz'))throw Error('Retained proof already exists');
const faults=[
 {name:'worn-escape',file:'src/js/godhood.js',from:'if (!opts.equippedInInventory) for (const [slot, item]',to:'if (false) for (const [slot, item]',expected:'FAIL player Audit takes the finest worn item'},
 {name:'whole-stack',file:'src/js/godhood.js',from:'if (unitsOf(item) > 1) source[key]',to:'if (false) source[key]',expected:'FAIL an Audit takes one physical unit'},
 {name:'ghost-weapon',file:'src/js/godhood.js',from:'if (slot) delete equipped[slot];',to:'if (slot) void slot;',expected:'FAIL NPC Audit removes the worn copy'},
 {name:'no-save',file:'src/js/game.js',from:'        if (!opts || opts.save !== false) this.save();\n        return r;\n      } catch (e) { console.warn(\'[market] Audit settlement\'',to:'        void 0;\n        return r;\n      } catch (e) { console.warn(\'[market] Audit settlement\'',expected:'FAIL native saved state retains'},
 {name:'unwired-npc',file:'src/js/godverbs.js',from:'if ((rec.marketDebt || 0) >= 3 && game.marketAuditCollect) game.marketAuditCollect(vid, { save: false });',to:'if ((rec.marketDebt || 0) >= 3) void rec;',expected:'FAIL actual NPC dawn takes its highest tier'},
];
const rows=[];
for(const fault of faults){const temp=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-market-audit-'+fault.name+'-'));for(const f of ['src','scripts','index.html','sw.js','version.json'])fs.cpSync(path.join(root,f),path.join(temp,f),{recursive:true});const file=path.join(temp,fault.file),s=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');if(s.split(fault.from).length!==2)throw Error('Nonunique fault anchor '+fault.name);fs.writeFileSync(file,s.replace(fault.from,fault.to));const r=cp.spawnSync(process.execPath,[path.join(root,'scripts/godpath/test-market-audit-ownership.js'),'--root',temp],{cwd:temp,env:{...process.env,SEED:'7'},encoding:'utf8',timeout:60000,maxBuffer:8e6});const rejected=r.status!==0&&r.stdout.includes(fault.expected)&&/market-audit-ownership: \d+ passed, [1-9]\d* failed/.test(r.stdout);rows.push({name:fault.name,temp,status:r.status,error:r.error?.message||null,rejected,stdout:r.stdout,stderr:r.stderr});console.log(fault.name+': '+(rejected?'rejected':'UNPROVEN'));}
fs.writeFileSync(out+'.json.gz',z.gzipSync(JSON.stringify({scope:'Isolated targeted faults; roots retained in temporary directories, active source never mutated',rows})+'\n'),{flag:'wx'});if(rows.some(r=>!r.rejected))process.exitCode=1;
