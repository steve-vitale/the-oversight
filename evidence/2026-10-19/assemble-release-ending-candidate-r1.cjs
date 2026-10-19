'use strict';
// Compact, non-production child of the already-public candidate. No push.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),P=require('../../scripts/phone-frame-proof-update');
const git=(args,input,extra={})=>cp.execFileSync('git',args,{encoding:'utf8',input,env:{...process.env,...extra},maxBuffer:10e6}).trim(),common=path.resolve(git(['rev-parse','--git-common-dir']));
const base='8c305ee2d654f14511a4317209006b6921ba5c9e',source=git(['rev-parse','HEAD']);
if(git(['ls-remote','origin','refs/heads/codex/phone-preview']).split(/\s/)[0]!==base)throw Error('Shared candidate advanced');
const paths=git(['diff','--name-only','fe70654f7030bef78260349970f5eccc953937a3',source]).split('\n').filter(Boolean);
if(paths.some(p=>!p.startsWith('evidence/2026-10-19/')&&!['src/js/app.js','src/css/main.css','scripts/balance-proof.json','scripts/phone-frame-proof.json','scripts/validate-ontology.js','docs/MOBILE-PLAYTEST.md','docs/ROADMAP.md'].includes(p)))throw Error('Unexpected candidate path');
const extra={GIT_INDEX_FILE:path.join(common,'release-ending-candidate-index-r1')};git(['read-tree',base],undefined,extra);git(['restore','--source',source,'--staged','--',...paths],undefined,extra);
const runtimeInputs=P.expectedInputs(process.cwd()),metadata={sourceCommit:source,baseProduction:'007c4febca00986aae5bc36bcd4d6966a08c7c04',scope:'Unshipped ending/succession release candidate. No new service-worker stamp, production deployment or physical-device clearance.',runtimeInputs,runtimeInputsDigest:crypto.createHash('sha256').update(JSON.stringify(runtimeInputs)).digest('hex'),evidence:'evidence/2026-10-19/release-ending-audit-r1.md'};
const blob=git(['hash-object','-w','--stdin'],JSON.stringify(metadata,null,2)+'\n');git(['update-index','--add','--cacheinfo','100644,'+blob+',build-source.json'],undefined,extra);
const tree=git(['write-tree'],undefined,extra),sha=git(['commit-tree',tree,'-p',base],'Keep mobile ending action visible and prove actual succession/Table flows [needs-eyes]\n');git(['update-ref','refs/heads/codex/ending-candidate-20261019',sha,'0000000000000000000000000000000000000000']);
fs.writeFileSync(path.join(common,'release-ending-candidate-publication-r1.json'),JSON.stringify({source,base,sha,tree,paths,metadata},null,2)+'\n',{flag:'wx'});console.log({source,base,sha,tree,paths:paths.length});
