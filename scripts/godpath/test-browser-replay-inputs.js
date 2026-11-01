'use strict';
// A passing receipt must not hide an omitted starting fixture in a fresh port.
// Resolve modules without importing/evaluating the browser recipes.
const fs=require('fs'),path=require('path'),{createRequire}=require('module'),cp=require('child_process');
const T=require('./lib').reporter('browser replay input closure');
const root=path.resolve(__dirname,'../..'),manifest=require('../browser-replay-inputs.json');
function inspect(roots){
 const pending=[...roots],seen=new Set(),resolved=new Set(),errors=[];
 while(pending.length){const file=path.resolve(root,pending.shift());if(seen.has(file))continue;seen.add(file);
  if(!file.startsWith(root+path.sep)){errors.push('Input escapes repository: '+file);continue;}
  if(!fs.existsSync(file)){errors.push('Missing input: '+path.relative(root,file));continue;}
  if(!/\.(js|cjs)$/.test(file))continue;
  const resolve=createRequire(file).resolve,source=fs.readFileSync(file,'utf8');
  for(const m of source.matchAll(/require\(\s*(['"])(\.[^'"]+)\1\s*\)/g)){
   try{const dependency=resolve(m[2]);if(!dependency.startsWith(root+path.sep))errors.push('Relative import escapes repository: '+m[2]);else{resolved.add(dependency);if(dependency.startsWith(path.join(root,'evidence')+path.sep))pending.push(dependency);}}
   catch(e){errors.push(path.relative(root,file)+' -> '+m[2]+': '+e.code);}
  }
  for(const m of source.matchAll(/readFileSync\(\s*(['"])((?:evidence|scripts)\/[^'"]+)\1\s*[,)]/g))pending.push(m[2]);
 }
 return{errors,files:seen.size,inputs:[...new Set([...seen,...resolved])].map(f=>path.relative(root,f).replace(/\\/g,'/'))};
}
const roots=[...manifest.recipes,...manifest.explicitInputs],actual=inspect(roots);
const tracked=new Set(cp.execFileSync('git',['ls-files','-z','--',...actual.inputs],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean));
const untracked=(files,index)=>files.filter(f=>!index.has(f));
T.ok('declared recipes and dynamic inputs have a valid unique contract',manifest.schemaVersion===1&&manifest.recipes.length>=24&&new Set(roots).size===roots.length);
T.ok('fresh-checkout static recipe imports and declared starting fixtures exist',actual.errors.length===0,actual.errors.join('; '));
T.ok('both dynamic search starting scenes remain declared', ['underfoot','approach'].every(c=>manifest.explicitInputs.includes('evidence/2026-10-21/search-fixture-'+c+'-r2.json')));
T.ok('documented Table retention utility is packaged with its replay recipes',manifest.recipes.includes('evidence/2026-10-22/late-table-retain-r1.cjs'));
T.ok('documented installed source pinning utility is packaged',manifest.recipes.includes('evidence/2026-10-21/published-lifecycle-pin-r1.cjs'));
T.ok('replay inputs are included in Git, not only present on this machine',untracked(actual.inputs,tracked).length===0,untracked(actual.inputs,tracked).join('; '));
const omitted='evidence/2026-10-21/carry-arrival-fixture-r1.json',incomplete=new Set([...tracked].filter(f=>f!==omitted));
T.ok('a locally present fixture omitted from the commit is rejected',untracked(actual.inputs,incomplete).includes(omitted));
T.ok('missing declared input is rejected without evaluating a recipe',inspect([...roots,'evidence/__missing_browser_starting_fixture__.json']).errors.some(e=>e.includes('__missing_browser_starting_fixture__')));
T.done();
