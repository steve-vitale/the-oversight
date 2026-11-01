'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict'),cp=require('child_process');
const K=require('./lib'),T=K.reporter('Exact Git Game comparison inputs'),P=require('../prepare-game-comparison'),C=require('../prepare-calendar-ablation'),B=require('../balance-panel');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'oversight-game-pair-'));
const git=(root,...args)=>cp.execFileSync('git',['-C',root,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
try{
 const input=path.join(temp,'input');C.copySimulationInputs(K.ROOT,input);
 git(input,'init','--quiet');git(input,'config','core.autocrlf','false');git(input,'add','--','src','index.html');
 const commit=()=>{git(input,'-c','user.name=Oversight input test','-c','user.email=input-test@example.invalid','commit','--quiet','-m','Owned fixture inputs');return git(input,'rev-parse','HEAD');};
 const before=commit(),file='src/js/overtime.js',old=fs.readFileSync(path.join(input,file));
 fs.appendFileSync(path.join(input,file),'\n// Owned constructor test variation.\n');git(input,'add','--',file);const after=commit();
 const source=B.manifest(input),args={repo:input,toolRoot:input,baselineRef:before,candidateRef:after,out:path.join(temp,'pair')},receipt=P.prepare(args);
 T.ok('two immutable Game revisions are distinguished without copying historical controllers',receipt.arms[0].gameCommit===before&&receipt.arms[1].gameCommit===after&&receipt.differences.join(',')===file);
 T.ok('baseline retains exact earlier Git bytes and candidate retains the actual current bytes',fs.readFileSync(path.join(receipt.arms[0].root,file)).equals(old)&&fs.readFileSync(path.join(receipt.arms[1].root,file)).equals(fs.readFileSync(path.join(input,file))));
 T.ok('both roots use the same real current observer and contract',JSON.stringify(B.observerIdentity(receipt.arms[0].root))===JSON.stringify(B.observerIdentity(receipt.arms[1].root)));
 assert.throws(()=>P.prepare(args),/Fresh comparison output/);
 T.ok('existing output cannot be overwritten',fs.readFileSync(path.join(receipt.arms[0].root,file)).equals(old));
 const nested=path.join(input,'nested');assert.throws(()=>P.prepare({...args,out:nested}),/outside tool source/);
 T.ok('nested output is refused before any files are created',!fs.existsSync(nested));
 assert.throws(()=>P.snapshot(input,'HEAD'),/immutable full Git commit/);T.ok('moving ref names are refused',true);
 const mismatch=path.join(temp,'mismatch');fs.appendFileSync(path.join(input,file),'\n// Uncommitted contamination.\n');
 assert.throws(()=>P.prepare({...args,out:mismatch}),/Current Game must match pinned candidate/);
 T.ok('contaminated candidate input is refused before output creation',!fs.existsSync(mismatch));
 fs.writeFileSync(path.join(input,file),Buffer.concat([old,Buffer.from('\n// Owned constructor test variation.\n')]));
 T.ok('construction and refusals preserve the actual input manifest',JSON.stringify(B.manifest(input))===JSON.stringify(source));
}finally{
 const owned=fs.realpathSync(temp),parent=fs.realpathSync(os.tmpdir());assert.equal(path.dirname(owned),parent);assert(path.basename(owned).startsWith('oversight-game-pair-'));
 fs.rmSync(owned,{recursive:true,force:true});
}
T.done();
