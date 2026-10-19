'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),K=require('./lib'),B=require('../balance-panel'),P=require('../phone-frame-proof-update'),S=require('../lib/balance-scorecard');
const T=K.reporter('portable proof text identity'),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const parent=fs.realpathSync(os.tmpdir()),temp=fs.mkdtempSync(path.join(parent,'oversight-eol-'));
try {
  const roots=['lf','crlf'].map(name=>path.join(temp,name));
  for(let i=0;i<roots.length;i++)for(const rel of [...B.observerFiles,'scripts/balance-metrics.json']){
    const file=path.join(roots[i],rel),text=fs.readFileSync(path.join(K.ROOT,rel),'utf8').replace(/\r\n/g,'\n');
    fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,i?text.replace(/\n/g,'\r\n'):text);
  }
  const lf=B.observerIdentity(roots[0]),crlf=B.observerIdentity(roots[1]);
  T.ok('fixture really has different checkout bytes',sha(fs.readFileSync(path.join(roots[0],B.observerFiles[0])))!==sha(fs.readFileSync(path.join(roots[1],B.observerFiles[0]))));
  T.ok('observer fingerprints agree across LF and CRLF',lf.observerDigest===crlf.observerDigest);
  T.ok('contract fingerprints agree across LF and CRLF',lf.contractDigest===crlf.contractDigest);
  T.ok('scoring and collection share the same contract identity',S.contractDigest===lf.contractDigest);
  const observerFile=path.join(roots[1],B.observerFiles[0]);fs.appendFileSync(observerFile,'\r\n// actual source edit\r\n');
  T.ok('real observer edits still invalidate identity',B.observerIdentity(roots[1]).observerDigest!==lf.observerDigest);
  const beforeHelper=B.observerIdentity(roots[1]).observerDigest;
  fs.appendFileSync(path.join(roots[1],'scripts/lib/source-text.js'),'\r\n// normalization helper edit\r\n');
  T.ok('normalization helper edits also invalidate observer identity',B.observerIdentity(roots[1]).observerDigest!==beforeHelper);
  const contractFile=path.join(roots[1],'scripts/balance-metrics.json');fs.appendFileSync(contractFile,' ');
  T.ok('a contract edit still invalidates identity',B.observerIdentity(roots[1]).contractDigest!==lf.contractDigest);
  const receipt=JSON.stringify({message:'original',trace:[1,2]},null,2)+'\n',files=roots.map(root=>path.join(root,'receipt.json'));
  fs.writeFileSync(files[0],receipt);fs.writeFileSync(files[1],receipt.replace(/\n/g,'\r\n'));
  T.ok('retained receipt fingerprints agree across checkouts',P.normalized(files[0])===P.normalized(files[1]));
  fs.writeFileSync(files[1],receipt.replace('original','changed'));
  T.ok('receipt tampering still changes the fingerprint',P.normalized(files[0])!==P.normalized(files[1]));
} finally {
  const target=fs.realpathSync(temp);
  if(path.dirname(target)!==parent||!path.basename(target).startsWith('oversight-eol-'))throw Error('Unexpected temporary cleanup path');
  fs.rmSync(target,{recursive:true,force:true});
}
T.done();
