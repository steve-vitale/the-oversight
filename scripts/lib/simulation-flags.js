'use strict';
// Cache inputs come from the actual root's source, not just an older branch's
// hand-maintained list. Never copy the whole host environment into evidence.
const fs=require('fs'),path=require('path');
function discover(root,sources,legacy=[]){
 const names=new Set(legacy);
 for(const file of Object.keys(sources).filter(n=>n.endsWith('.js'))){
  const text=fs.readFileSync(path.join(root,file),'utf8');
  for(const m of text.matchAll(/process\.env(?:\.([A-Z][A-Z0-9_]*)|\[\s*['"]([A-Z][A-Z0-9_]*)['"]\s*\])/g))names.add(m[1]||m[2]);
  // Existing policy wrappers save/restore process.env[k] from literal ENV
  // objects. Uppercase literal object keys retain those options too.
  for(const obj of text.matchAll(/\b(?:const|let|var)\s+(?:ENV|env|flags)\s*=\s*\{([\s\S]*?)\}/g))
   for(const m of obj[1].matchAll(/(?:\b|['"])([A-Z][A-Z0-9_]+)['"]?\s*:/g))names.add(m[1]);
 }
 return [...names].sort();
}
function snapshot(root,sources,legacy=[],env=process.env){const fixed=new Set(legacy);return Object.fromEntries(discover(root,sources,legacy).filter(k=>fixed.has(k)||env[k]!==undefined).map(k=>[k,env[k]??null]));}
module.exports={discover,snapshot};
