'use strict';
// Descriptive totals only. This does not replace the game-only comparator.
const f=require('fs'),z=require('zlib');
const [before,after,out]=process.argv.slice(2);if(!before||!after||!out)throw Error('Usage: node knack-policy-summary.cjs <before.json.gz> <after.json.gz> <out.json>');
const read=n=>JSON.parse(z.gunzipSync(f.readFileSync(n))),a=read(before),b=read(after);
for(const k of ['observerDigest','contractDigest'])if(a[k]!==b[k])throw Error('Changed '+k);
for(const k of ['days','policies','seeds','region','origin','flags','nodeVersion'])if(JSON.stringify(a.options[k])!==JSON.stringify(b.options[k]))throw Error('Unmatched '+k);
const changes=[...new Set([...Object.keys(a.sources),...Object.keys(b.sources)])].filter(n=>a.sources[n]!==b.sources[n]);
if(changes.join()!=='scripts/policies/capable.js')throw Error('Unexpected source delta '+changes);
for(const p of [a,b])if(!p.validity.sourcesStable||p.validity.neutrality.some(x=>!x.match||x.warnings)||p.rows.some(r=>r.warnings.length||r.observerErrors.length||r.gear.errors.length))throw Error('Invalid panel');
const result={comparisonKind:'Descriptive policy-revision screen, not a game-only balance verdict',gameSourcesIdentical:true,changedFingerprintSources:changes,policies:{}};
for(const policy of a.options.policies){const x=a.rows.filter(r=>r.row.policy===policy),y=b.rows.filter(r=>r.row.policy===policy),metrics={};
 if(x.length!==a.options.seeds.length||y.length!==x.length||x.some(r=>!y.some(t=>t.row.seed===r.row.seed)))throw Error('Missing paired cases');
 for(const k of Object.keys(x[0].metrics)){const agg=rows=>{const v=rows.map(r=>r.metrics[k]).filter(Number.isFinite);return {known:v.length,total:v.reduce((n,v)=>n+v,0)};};metrics[k]={before:agg(x),after:agg(y)};}
 result.policies[policy]={n:x.length,metrics};
}
f.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
