'use strict';
const assert = require('assert/strict'), crypto = require('crypto'), cp = require('child_process');
const K = require('./lib'), {validateAskContract} = require('../lib/ask-contract');
const hash = x => crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
async function setup() {
  const G = await K.load({seed: 88107, narration:true}); K.newRun(G);
  const vid = G.state.village.roster.find(id => id !== G.villagerId);
  G.startConvo(vid); return {G,vid};
}
(async () => {
  if (process.argv.includes('--purity-on') || process.argv.includes('--purity-off')) {
    const {G,vid} = await setup();
    if (process.argv.includes('--purity-on')) assert(validateAskContract(G,vid).ok);
    console.log('@@PURITY@@' + JSON.stringify({state:hash(G.state), data:hash(G.data), map:hash(G.map),
      log:hash(G.log), next:Array.from({length:32}, () => Math.random())})); return;
  }
  const T = K.reporter('isolated ask contract'), {G,vid} = await setup();
  function audit(options) {
    const before = JSON.stringify([G.state,G.data,G.map,G.log]);
    const r = validateAskContract(G,vid,options);
    assert.equal(JSON.stringify([G.state,G.data,G.map,G.log]), before);
    return r;
  }
  const ordinary = audit(); assert(ordinary.ok, ordinary.failures.join('; '));
  assert.equal(ordinary.surface,'Game.convoChoices'); assert(ordinary.prepared);
  assert.equal(ordinary.coverage.bespoke,G.data.characterGen.convo.questions.length);
  assert.equal(ordinary.coverage.reactive,Object.keys(G.REACTIVE_DEFS).length);
  assert.equal(ordinary.coverage.generic,6);
  assert(ordinary.cases.some(c => c.id === 'reason' && c.family === 'generic'));
  assert(ordinary.cases.some(c => c.id === 'day' && c.family === 'generic'));
  T.ok('Actual final public menus cover every authored/reactive question and all six generic kinds',true);
  const c = G.convoGet(vid);
  c.spokenBeat={tag:'closing',line:'"See you."'}; c.windingDown=true;
  c.partyDecision={kind:'name',choices:[{id:'party_namepick:0',label:'Example'}]};
  const before = JSON.stringify(c); const closed = audit();
  assert(closed.ok,closed.failures.join('; ')); assert.equal(JSON.stringify(c),before);
  assert.deepEqual(closed.cases,ordinary.cases);
  T.ok('Closing and unrelated decision states are preserved while the isolated fixture owns each posed question',true);
  for (const [control,reason] of [['real','no real answer'],['boundary','missing honest opt-out'],['silence','missing silence'],['empty','empty offered label']]) {
    const r = audit({control}); assert(!r.ok); assert(r.failures.some(f => f.includes(reason)));
  }
  T.ok('Removing real answers, boundaries, silence or words from the final menu fails the gate',true);
  const broken = audit({control:'throw'}); assert(!broken.ok && broken.error);
  assert(broken.failures.some(f => f.includes('injected public-menu failure')));
  T.ok('A thrown menu is an explicit failed audit and changes no caller state/log/data/map',true);
  const q = G.data.characterGen.convo.questions[0], originalAnswers=q.answers;
  q.answers=q.answers.map(a => ({...a,honest_opt_out:true}));
  const allBoundaries=audit();q.answers=originalAnswers;
  assert(!allBoundaries.ok);assert(allBoundaries.failures.some(f=>f.includes('bespoke:'+q.id+': no real answer')));
  T.ok('A boundary cannot masquerade as the required substantive answer',true);
  function purity(mode) {
    const p=cp.spawnSync(process.execPath,[__filename,'--purity-'+mode],{cwd:K.ROOT,encoding:'utf8',timeout:60000,maxBuffer:8*1024*1024});
    assert.equal(p.status,0,p.stderr);const records=p.stdout.split(/\r?\n/).filter(s=>s.startsWith('@@PURITY@@'));
    assert.equal(records.length,1);return JSON.parse(records[0].slice('@@PURITY@@'.length));
  }
  assert.deepEqual(purity('on'),purity('off'));
  T.ok('Independent matched processes retain exact canonical state/data/map/log and the next32 seeded RNG draws',true);
  assert.equal(typeof G.validateAskContract,'undefined');
  T.ok('The speculative audit is absent from the production Game API',true);
  T.done();
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
