'use strict';
// Assemble a compact public merge from two already-public parents. No push.
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),P=require('../../scripts/phone-frame-proof-update');
const root=process.cwd(),git=(args,input,extra={})=>cp.execFileSync('git',args,{cwd:root,input,encoding:'utf8',env:{...process.env,...extra},maxBuffer:12e6}).trim(),common=path.resolve(root,git(['rev-parse','--git-common-dir']));
const previous=JSON.parse(fs.readFileSync(path.join(common,'phone-preview-publication-r4.json'))),base='0545151a5a9ae46b2247f5b5c8525aac45e50d67',preview=previous.sha,source=git(['rev-parse','HEAD']);
for(const[name,expected]of [['main',base],['master',base],['codex/phone-preview',preview]])if(git(['ls-remote','origin','refs/heads/'+name]).split(/\s/)[0]!==expected)throw Error('Remote advanced: '+name);
const retained=git(['ls-files','evidence/2026-10-19/*release-main67*']).split('\n').filter(Boolean),paths=[...new Set([...previous.paths,...retained])];
const extra={GIT_INDEX_FILE:path.join(common,'release-main67-publication-index-r1')};git(['read-tree',base],undefined,extra);git(['restore','--source',source,'--staged','--',...paths],undefined,extra);
const runtimeInputs=P.expectedInputs(root),metadata={sourceCommit:source,museMain:base,priorPhonePreview:preview,build:JSON.parse(fs.readFileSync('version.json')).version,scope:'Authorized combined live development build; public-launch clearance remains open.',runtimeInputs,runtimeInputsDigest:crypto.createHash('sha256').update(JSON.stringify(runtimeInputs)).digest('hex'),evidence:'evidence/2026-10-19/release-main67-audit-r1.md'};
const blob=git(['hash-object','-w','--stdin'],JSON.stringify(metadata,null,2)+'\n');git(['update-index','--add','--cacheinfo','100644,'+blob+',build-source.json'],undefined,extra);
const tree=git(['write-tree'],undefined,extra),sha=git(['commit-tree',tree,'-p',base,'-p',preview],'Ship reconciled Muse and phone/combat development build [needs-eyes]\n');
git(['update-ref','refs/heads/codex/live-integration-20261019',sha,'0000000000000000000000000000000000000000']);
const receipt={source,base,preview,sha,tree,paths,metadata};fs.writeFileSync(path.join(common,'release-main67-publication-r1.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({source,base,preview,sha,tree,paths:paths.length}));
