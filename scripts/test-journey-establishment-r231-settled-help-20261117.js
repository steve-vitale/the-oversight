// journey-establishment r231 — a stage-0 ask_favor want must SURFACE even
// when the ledger holds a SETTLED favor.
// PROOF TEST for the r231 residual-favorless defect (panel, matched band
// 101201-101205: 13/82 raised asks (15.9%) still never materialized into a
// committable favor, all class E1 — opener never ran). The r230 fix made
// the ask reachable (menu offers dlg:help, the wedge presses it), but
// 10 of the 13 pressed dlg:help and the want STILL never surfaced:
// every one of those sittings carried a SETTLED ledger favor at sit
// start (moot/acknowledged/declined — e.g. Liam 101203 d22: moot
// food_share favor, live forage_help/u2 need) while the want itself had
// NO favor (deferred ask, stage 0). The dlg:help handler in
// convo-dialogue.js short-circuits on ANY settled ledger favor —
// "It's already handled. Thank you for asking." — and returns WITHOUT
// calling convoWantEngage, so the live ask is never stated. The
// engageBeat in convo-wants.js already has the deferred-after-resume
// guard for exactly this shape (dialog audit #1, seed 7 Nolan), but
// the handler's own short-circuit fires first, so the guard is dead
// code on the dlg:help path — and it only covers RESUMED sittings,
// while 4 of the 13 residual sits have resumedOnce false (pre-empted
// by a secret/trade/recall thread instead).
// The fix (both guards): skip the settled short-circuit when the want
// has NO favor, is still at stage 0, and a LIVE need exists — the
// player is asking about the live need, not the dead favor. The
// settled answer stays honest when the want's OWN favor is settled
// (r7 shape) and when no live need exists.
// Run: node scripts/test-journey-establishment-r231-settled-help-20261117.js
'use strict';

const { loadGame, setupGame } = require('./sim-harness');

let pass = 0;
let fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function plantSickNeeds(Game, living) {
  const v = Game.state.village;
  v.sick = v.sick || {};
  v.trust = v.trust || {};
  for (const id of living) {
    v.sick[id] = { daysLeft: 3, severity: 2, name: 'wound fever' };
    v.trust[id] = 30;
  }
}

// Stage a NATURAL resume-pre-empted sitting: backed open recall thread +
// live sick need, then startConvo until the resume fires with a fresh
// ask_favor want at stage 0. Returns { vid, open } or null. (r230 pattern.)
function stageResumePreempted(Game, living, used) {
  const v = Game.state.village;
  for (const id of living) {
    if (used.has(String(id))) continue;
    const sel = Game.convoSelectWant(id);
    if (!sel || sel.id !== 'ask_favor') continue;
    if (v.convoSeeds) delete v.convoSeeds[id];
    const c0 = Game.convoGet(id);
    c0.answered = { q_test: 'yes' };
    Game.convoThreadOpen(id, 'recall', 'something personal', 'changed the subject',
      '"I still think about what my mother used to say about the winters here, back before the scattering took her."');
    const r = Game.startConvo(id);
    const c = Game.convoGet(id);
    if (c && c._resumedOnce && c.want && c.want.id === 'ask_favor' && (c.want.stage || 0) === 0) {
      used.add(String(id));
      return { vid: id, open: r };
    }
    Game.endConvo(id, 'done');
  }
  return null;
}

// Plant a SETTLED ledger favor of a DIFFERENT kind than the live need
// (the Liam shape: moot food_share favor, live forage_help need).
function plantMootFavor(Game, vid) {
  const v = Game.state.village;
  v.favorLedger = v.favorLedger || {};
  v.favorLedger[vid] = { id: 'favor-' + vid + '-test', kind: 'food_share', state: 'moot', short: 'the food I needed' };
}

(async () => {
  const { Game } = await loadGame({ seed: 5001, mode: 'mvc', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
  check('setup: living villagers exist', living.length > 0, 'living=' + living.length);
  plantSickNeeds(Game, living);
  const used = new Set();

  // --- (C) resumed deferred ask + moot ledger favor: help must surface it
  const stC = stageResumePreempted(Game, living, used);
  check('C resume pre-empts the opening (stage-0 ask_favor, live need)', !!stC,
    stC ? 'vid=' + stC.vid : 'no villager resumed with ask_favor stage 0');
  if (!stC) { console.log('RESULT ' + pass + ' pass / ' + fail + ' fail'); process.exit(1); }
  plantMootFavor(Game, stC.vid);
  const needC = Game.convoFindFavorNeed(stC.vid);
  const cC0 = Game.convoGet(stC.vid);
  check('C0 staged state holds (stage 0, no favor, live need, moot ledger)',
    (cC0.want.stage || 0) === 0 && !cC0.want.favor && !!(needC && needC.kind) &&
    Game.convoGetFavor(stC.vid) && Game.convoGetFavor(stC.vid).state === 'moot',
    'stage=' + cC0.want.stage + ' favor=' + JSON.stringify(cC0.want.favor) +
    ' need=' + JSON.stringify(needC) + ' ledger=' + JSON.stringify(Game.convoGetFavor(stC.vid)));
  const rC = Game.convoTurn(stC.vid, 'dlg:help');
  const cC = Game.convoGet(stC.vid);
  check('C help states the live ask (not "already handled")',
    !!(rC && rC.line && /feverish|wound fever|help me/i.test(rC.line)) && !/already handled/i.test(rC.line || ''),
    'line=' + JSON.stringify(rC && rC.line));
  check('C2 help moves stage 0 -> 2', (cC.want.stage || 0) === 2, 'stage=' + cC.want.stage);
  check('C3 help attaches the favor with the need kind',
    !!(cC.want.favor && cC.want.favor.kind === (needC && needC.kind)),
    'favor=' + JSON.stringify(cC.want.favor && cC.want.favor.kind));
  Game.endConvo(stC.vid, 'done');

  // --- (D) NON-resumed deferred ask + moot ledger favor: same surface ----
  // The E1 pre-emptor need not be a resume opener (secret/trade/recall
  // threads pre-empt the same way — 4 of the 13 residual sits have
  // resumedOnce false). Stage the natural resumed shape, then clear the
  // flag: the mechanism under test (handler + engageBeat) must not
  // depend on it.
  const stD = stageResumePreempted(Game, living, used);
  check('D non-resumed deferred ask stages', !!stD, stD ? 'vid=' + stD.vid : 'no villager left to stage');
  if (stD) {
    plantMootFavor(Game, stD.vid);
    const cD0 = Game.convoGet(stD.vid);
    cD0._resumedOnce = false;
    const needD = Game.convoFindFavorNeed(stD.vid);
    const rD = Game.convoTurn(stD.vid, 'dlg:help');
    const cD = Game.convoGet(stD.vid);
    check('D help states the live ask without the resume flag',
      !!(rD && rD.line && /feverish|wound fever|help me/i.test(rD.line)) && !/already handled/i.test(rD.line || ''),
      'line=' + JSON.stringify(rD && rD.line));
    check('D2 help moves stage 0 -> 2 without the resume flag', (cD.want.stage || 0) === 2, 'stage=' + cD.want.stage);
    check('D3 help attaches the favor without the resume flag',
      !!(cD.want.favor && cD.want.favor.kind === (needD && needD.kind)),
      'favor=' + JSON.stringify(cD.want.favor && cD.want.favor.kind));
    Game.endConvo(stD.vid, 'done');
  }

  // --- (E) scope: NO live need + moot ledger favor -> "already handled" --
  // The settled answer stays honest when there is no live ask to state.
  // Monkey-patch the need finder to null for the press only (r230 E shape).
  const stE = stageResumePreempted(Game, living, used);
  check('E no-live-need case stages', !!stE, stE ? 'vid=' + stE.vid : 'no villager left to stage');
  if (stE) {
    plantMootFavor(Game, stE.vid);
    const origNeed = Game.convoFindFavorNeed;
    Game.convoFindFavorNeed = () => null;
    let rE = null;
    try { rE = Game.convoTurn(stE.vid, 'dlg:help'); } finally { Game.convoFindFavorNeed = origNeed; }
    const cE = Game.convoGet(stE.vid);
    check('E no live need answers "already handled"',
      !!(rE && rE.line && /already handled/i.test(rE.line)),
      'line=' + JSON.stringify(rE && rE.line));
    check('E2 no live need leaves the want at stage 0', (cE.want.stage || 0) === 0, 'stage=' + cE.want.stage);
    Game.endConvo(stE.vid, 'done');
  }

  // --- (F) scope: the want's OWN favor settled (r7 shape) -> "handled" ---
  // Fresh sitting, opener runs (stage >= 1, favor attached), then the
  // favor goes moot mid-conversation: the settled answer is honest here.
  plantSickNeeds(Game, living);
  let gVid = null;
  for (const id of living) {
    if (used.has(String(id))) continue;
    const sel = Game.convoSelectWant(id);
    if (!sel || sel.id !== 'ask_favor') continue;
    if (v.convoSeeds) delete v.convoSeeds[id];
    const r = Game.startConvo(id);
    const c = Game.convoGet(id);
    if (c && !c._resumedOnce && c.want && c.want.id === 'ask_favor' && (c.want.stage || 0) >= 1 && c.want.favor) { gVid = id; break; }
    Game.endConvo(id, 'done');
  }
  check('F surfaced want stages (opener ran, favor attached)', !!gVid, gVid ? 'vid=' + gVid : 'no non-resume ask_favor sitting found');
  if (gVid) {
    used.add(String(gVid));
    const cF0 = Game.convoGet(gVid);
    cF0.want.favor.state = 'moot';
    const rF = Game.convoTurn(gVid, 'dlg:help');
    check('F own favor settled answers "already handled"',
      !!(rF && rF.line && /already handled/i.test(rF.line)),
      'line=' + JSON.stringify(rF && rF.line));
    Game.endConvo(gVid, 'done');
  }

  // --- (G) positive control: no ledger favor at all -> help states ask ----
  // The r230 path, unbroken by the fix. Runs in a FRESH game (seed 5002):
  // in the first process C and D already stated the templated ask twice,
  // and the run ledger can block a third identical ask line through the
  // handler's F4c guard (the fallback nowant line speaks while the favor
  // still attaches — G2/G3 pass either way, so the line check needs a
  // clean ledger to discriminate).
  {
    const g2 = await loadGame({ seed: 5002, mode: 'mvc', fullTelemetry: false });
    const Game2 = g2.Game;
    await setupGame(Game2);
    const v2 = Game2.state.village;
    const living2 = (v2.roster || []).filter(id => String(id) !== String(Game2.villagerId) && !((Game2.getPerson(id) || {}).dead));
    plantSickNeeds(Game2, living2);
    const used2 = new Set();
    const stG = stageResumePreempted(Game2, living2, used2);
    check('G plain deferred ask stages (no ledger favor)', !!stG, stG ? 'vid=' + stG.vid : 'no villager left to stage');
    if (stG) {
      if (v2.favorLedger) delete v2.favorLedger[stG.vid];
      const needG = Game2.convoFindFavorNeed(stG.vid);
      const rG = Game2.convoTurn(stG.vid, 'dlg:help');
      const cG = Game2.convoGet(stG.vid);
      check('G help states the ask with no ledger favor',
        !!(rG && rG.line && /feverish|wound fever|help me/i.test(rG.line)),
        'line=' + JSON.stringify(rG && rG.line));
      check('G2 help moves stage 0 -> 2 with no ledger favor', (cG.want.stage || 0) === 2, 'stage=' + cG.want.stage);
      check('G3 help attaches the favor with no ledger favor',
        !!(cG.want.favor && cG.want.favor.kind === (needG && needG.kind)),
        'favor=' + JSON.stringify(cG.want.favor && cG.want.favor.kind));
      Game2.endConvo(stG.vid, 'done');
    }
  }

  console.log('RESULT ' + pass + ' pass / ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST-ERROR', e && e.stack || e); process.exit(1); });
