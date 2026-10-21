'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),assert=require('assert/strict'),z=require('zlib'),B=require('../../scripts/balance-panel');
const common=path.resolve(cp.execFileSync('git',['rev-parse','--git-common-dir'],{encoding:'utf8'}).trim());
const current=B.manifest(process.cwd()),files=new Set(Object.keys(current));
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(/\.(js|json)$/.test(f))files.add(f.replace(/\\/g,'/'));}}walk('scripts');
const roots={};for(const arm of ['before','after']){
 const root=path.join(common,'garden-transfer-'+arm+'-r1');if(fs.existsSync(root))throw Error('Frozen root exists: '+root);
 for(const rel of files){const file=path.resolve(root,rel);assert(file.startsWith(root+path.sep));fs.mkdirSync(path.dirname(file),{recursive:true});fs.copyFileSync(rel,file);}
 if(arm==='before')fs.writeFileSync(path.join(root,'scripts/policies/competent.js'),cp.execFileSync('git',['show','HEAD:scripts/policies/competent.js']));
 roots[arm]={root,sources:B.manifest(root)};
}
const old=JSON.parse(z.gunzipSync(fs.readFileSync('evidence/2026-10-21/solo-campaign-after-r1.json.gz')));
assert.deepEqual(roots.before.sources,old.sources);
assert.deepEqual(Object.keys(current).filter(f=>roots.before.sources[f]!==roots.after.sources[f]),['scripts/policies/competent.js']);
fs.writeFileSync('evidence/2026-10-21/garden-transfer-roots-r1.json',JSON.stringify(roots,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(Object.fromEntries(Object.entries(roots).map(([k,v])=>[k,v.root]))));
