#!/usr/bin/env node
'use strict';
// Prepared casts and scores; real authored watch choices and real verdicts.
// Each arm boots a separate shared-harness Game with the same seed.
const assert = require('assert');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');
const seed = Number(process.env.SEED || 424242);
let checks = 0;
function check(label, condition) { assert(condition, label); checks++; console.log('  ok ' + label); }
async function scenario(kind) {
  const { Game: G, loadFails } = await loadGame({ seed, mode: 'contest-cheer-proof' });
  check('all production modules load', loadFails.length === 0);
  await setupGame(G);
  const pid = G.state.village.roster.find(id => id !== G.villagerId);
  check('prepared cast uses a real villager', !!pid && !!G.vpOf(pid));
  G.state.scholar.day = 20;
  G.state.systemArrived = true;
  G.state.notability = G.state.notability || {};
  G.state.notability[pid] = {};
  G.agencyOf(pid).xp[pid].bravery = 0;
  G.state.village.trust[pid] = 0;
  const scoreTarget = kind.startsWith('strong') ? 15 : 8;
  const temper = G._cxCaseScore(pid, 0);
  G.state.village.trust[pid] = (scoreTarget - temper) * 10;
  // A strong case can include actual public notability deeds, rather than
  // taking trust above its normal range just to prepare a score.
  if (G.state.village.trust[pid] > 100) {
    G.addNotability(pid, 'wave2Kill'); G.addNotability(pid, 'contestWin'); G.addNotability(pid, 'showmanship');
    G.state.village.trust[pid] -= 60;
  }
  check('prepared trust stays within its real range', G.state.village.trust[pid] >= 0 && G.state.village.trust[pid] <= 100);
  check('prepared case has the declared real score', G._cxCaseScore(pid, 0) === scoreTarget);
  if (kind === 'veteran') for (let i = 0; i < 3; i++) G.contestLearn('moot', 'watched');
  check('warning knowledge is explicit', G.contestKnowledge('moot').level === (kind === 'veteran' ? 2 : 0));
  const receipts = [], scores = [], groups = G.contestResolveGroup, caseScore = G._cxCaseScore;
  G.contestResolveGroup = function (ids, contest, opts) {
    const result = groups.call(this, ids, contest, opts);
    receipts.push(JSON.parse(JSON.stringify({ ids, contest: { id: contest.id, risk: contest.risk, cat: contest.cat }, opts, result })));
    return result;
  };
  G._cxCaseScore = function (id, lift) {
    const result = caseScore.call(this, id, lift); scores.push({ id, lift, result }); return result;
  };
  const contest = G.contestPool().find(c => c.id === 'moot');
  check('real Moot definition exists', !!contest && contest.cat === 'moot');
  G.contestInterruption(contest, [pid]);
  const ac = G.state.activeContest;
  check('actual interruption opens the watched cast', ac?.phase === 'watching' && ac.participant === pid);
  const chosen = [];
  const cheering = !kind.endsWith('silent');
  for (let step = 0; step < 3; step++) {
    const phase = ac.phases[ac.phaseIdx];
    const index = phase.choices.findIndex(c => step < 2
      ? cheering ? c.do?.cheer > 0 : !c.do?.cheer && !c.do?.bet && !c.do?.study && !c.do?.trauma
      : c.next === 'VERDICT' && !c.do?.comfort);
    check('required authored watch choice exists at step ' + step, index >= 0);
    chosen.push({ phase: ac.phaseIdx, label: phase.choices[index].label, cheer: phase.choices[index].do?.cheer || 0 });
    G.contestChoose(index);
    if (step < 2) check('real choice advances the watch phase', ac.phaseIdx === step + 1);
  }
  const expectedCheer = cheering ? kind === 'veteran' ? 0.15 : 0.10 : 0;
  check('choices accumulate the actual capped support', Math.abs((ac.cheer || 0) - expectedCheer) < 1e-9);
  check('one real group verdict resolves the watched villager', receipts.length === 1 && receipts[0].ids.length === 1 && receipts[0].ids[0] === pid);
  const receipt = receipts[0];
  check('verdict receives actual support as performance', receipt.opts.cheerBonus === Math.round(expectedCheer * 100) && Math.abs(receipt.opts.cheerLift - expectedCheer * 20) < 1e-9);
  check('real case score consumes the lift', scores.length === 1 && scores[0].id === pid && scores[0].lift === receipt.opts.cheerLift && Math.abs(scores[0].result - scoreTarget - receipt.opts.cheerLift) < 1e-9);
  check('verdict uses the real medium-risk Moot', receipt.contest.id === 'moot' && receipt.contest.cat === 'moot' && receipt.contest.risk === 'medium');
  check('real watch verdict completes', ac.phase === 'done');
  console.log('CHEER_RESULT ' + JSON.stringify({ kind, seed, checks, pid, scoreTarget, chosen, cheer: ac.cheer || 0, scores, receipt }));
}
async function main() {
  if (process.env.CHEER_CHILD) return scenario(process.env.CHEER_CHILD);
  const rows = {};
  for (const kind of ['silent', 'novice', 'veteran', 'strong-silent', 'strong-cheer']) {
    const out = execFileSync(process.execPath, [__filename], { env: { ...process.env, CHEER_CHILD: kind }, encoding: 'utf8', maxBuffer: 2e6 });
    process.stdout.write(out);
    const r = JSON.parse(out.split('\n').find(line => line.startsWith('CHEER_RESULT ')).slice(13));
    checks += r.checks; rows[kind] = r;
  }
  const outcome = r => r.receipt.result[r.pid].outcome;
  check('matched arms retain the same real contestant', new Set(Object.values(rows).map(r => r.pid)).size === 1);
  check('prepared marginal case loses without support', outcome(rows.silent) === 'lost');
  check('actual novice support lifts the marginal case into a win', outcome(rows.novice) === 'won' && rows.novice.scores[0].result > rows.silent.scores[0].result);
  check('earned warning provides more support than novice advice', rows.veteran.scores[0].result > rows.novice.scores[0].result);
  check('strong case wins in both arms while performance still improves', outcome(rows['strong-silent']) === 'won' && outcome(rows['strong-cheer']) === 'won' && rows['strong-cheer'].scores[0].result > rows['strong-silent'].scores[0].result);
  console.log('contest cheer proof green: ' + checks + ' checks');
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });
