'use strict';
// Same validated23-metric methodology calculation, with a narrower source
// scope for explicit player-strategy experiments. No source rewriting.
const {compareHarnessRevision}=require('./harness-comparison');
function comparePolicyRevision(before,after,declaration){
 const files=Object.keys(declaration?.changes||{});
 if(!files.length||files.some(f=>!f.startsWith('scripts/policies/')&&f!=='scripts/sweep-compare.js'))return{comparisonKind:'policy_revision',decision:'invalid',errors:['Policy comparison may change only declared policy files or their registry'],policies:[]};
 const result=compareHarnessRevision(before,after,declaration);
 return{...result,comparisonKind:'policy_revision',note:'Explicit player-strategy revision, not a Game-only balance comparison. Original inputs are preserved. '+(result.note||'Invalid comparisons require repair before interpretation.')};
}
module.exports={comparePolicyRevision};
