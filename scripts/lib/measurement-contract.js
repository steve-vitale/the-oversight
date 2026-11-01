'use strict';
// Offline report readers opt into known historical contracts. Live panel
// comparisons and maintenance proofs retain their strict current identities.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),B=require('../balance-panel'),S=require('./balance-scorecard');
const root=path.resolve(__dirname,'../..'),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n')).digest('hex');
const historical=[{observerDigest:'3ecc25477bb1c3c0695759f89a77b32623912c31a0c78d56a0efadf300f3c020',contractDigest:'84239af682aefdaa16f3061d543fc21b952856246bf61bbeedefdfa9ea19db65',file:'scripts/contracts/balance-metrics-pre31.json',sourceCommit:'88d70f5cd433283eefa5fe6582300729563eae77'}, {observerDigest:'72d7f2954862806368492d125da5e2a7449a77b41d34956dcf9f1a09850fbdb2',contractDigest:'cd5aea63d710332f49c59b33dbe8a750eb49965198566e88f72c027370288ca9',file:'scripts/contracts/balance-metrics-pre407.json',sourceCommit:'455f8bea576ce56a538252930560e388c2d7da45'}];
function select(identity,{historical:allowHistorical=false}={}){
 const current=B.observerIdentity(root);let contract=S.contract,record=null,mode='current';
 if(identity?.observerDigest!==current.observerDigest||identity?.contractDigest!==current.contractDigest){
  if(allowHistorical!==true)throw Error('Historical measurements require explicit historical:true; current identity is required by default');
  record=historical.find(r=>r.observerDigest===identity?.observerDigest&&r.contractDigest===identity?.contractDigest);
  if(!record)throw Error('Unknown historical observer/metric contract identity');
  if(hash(record.file)!==record.contractDigest)throw Error('Historical contract bytes do not match their retained digest');
  contract=JSON.parse(fs.readFileSync(path.join(root,record.file),'utf8'));mode='historical';
  // Current pure interval/comparison math is reusable only with exactly the
  // same analysis settings. A future method change must not silently reinterpret
  // an archived experiment under a different pair threshold or bootstrap.
  for(const key of ['schemaVersion','minimumPairs','confirmationSeeds','bootstrapSamples'])if(contract[key]!==S.contract[key])throw Error('Historical analysis settings differ: '+key+'; use an explicitly versioned analyzer');
 }
 return{contract,measurementIdentity:{mode,observerDigest:identity.observerDigest,contractDigest:identity.contractDigest,revision:contract.revision,metricCount:contract.metrics.length,
  ...(record?{sourceCommit:record.sourceCommit,contractFile:record.file}:{}),
  analyzerInputs:Object.fromEntries(['scripts/lib/measurement-contract.js','scripts/lib/balance-scorecard.js'].map(f=>[f,hash(f)])),
  scope:mode==='historical'?'Historical contract re-analysis only; no newly observed luck values, current-source calibration or release clearance.':'Current collector/contract interpretation; source and control validation remain required.'}};
}
module.exports={select};
