'use strict';
// Explicit methodology comparison. The ordinary Game-only comparator keeps
// rejecting changed policy/harness inputs; never rewrite source identities.
const S=require('./balance-scorecard'),crypto=require('crypto');
function compareHarnessRevision(before,after,declaration){
 const invalid=errors=>({comparisonKind:'harness_revision',decision:'invalid',errors,policies:[]});
 if(!declaration||typeof declaration.reason!=='string'||!declaration.reason.trim()||!declaration.changes)return invalid(['Explicit harness revision reason and exact changed-source identities required']);
 for(const p of [before,after])if(crypto.createHash('sha256').update(JSON.stringify(p.sources)).digest('hex')!==p.sourceDigest)return invalid(['Source manifest digest does not match the retained identity']);
 const changed=[...new Set([...Object.keys(before.sources||{}),...Object.keys(after.sources||{})])].filter(n=>before.sources[n]!==after.sources[n]).sort(),declared=Object.keys(declaration.changes).sort();
 if(!changed.length||JSON.stringify(changed)!==JSON.stringify(declared))return invalid(['Changed sources do not match the declared harness revision']);
 for(const file of changed){const d=declaration.changes[file];if(!file.startsWith('scripts/')||!d||d.before!==before.sources[file]||d.after!==after.sources[file])return invalid(['Invalid harness source declaration: '+file]);}
 const ordinary=S.comparePanels(before,after),expected=changed.map(f=>'Policy/harness changed: '+f).sort();
 if(ordinary.decision!=='invalid'||JSON.stringify([...ordinary.errors].sort())!==JSON.stringify(expected))return invalid(ordinary.errors.length?ordinary.errors:['Ordinary comparison did not reject the changed methodology']);
 const byKey=new Map(before.rows.map(r=>[r.row.policy+':'+r.row.seed,r]));
 const policies=after.options.policies.map(policy=>{const rows=after.rows.filter(r=>r.row.policy===policy),metrics=S.contract.metrics.map(m=>S.compareMetric(rows.map(r=>byKey.get(r.row.policy+':'+r.row.seed).metrics[m.id]),rows.map(r=>r.metrics[m.id]),m,policy+'/'+m.id));return{policy,cases:rows.length,confirmationSized:rows.length>=S.contract.confirmationSeeds,decision:metrics.some(m=>!['descriptive','no_material_signal'].includes(m.status))?'review_required':'no_material_signal',metrics};});
 return{schemaVersion:1,comparisonKind:'harness_revision',reason:declaration.reason,changedSources:declaration.changes,ordinaryComparisonDecision:ordinary.decision,decision:policies.some(p=>p.decision==='review_required')?'review_required':'no_material_signal',errors:[],policies,note:'Different simulation methodology, explicitly declared. These are paired changes under the harness revision, not estimates of a Game-only balance lever. Original source identities and raw rows remain unchanged. No weighted score; win movement in either direction requires investigation; no material signal is not equivalence.'};
}
module.exports={compareHarnessRevision};
