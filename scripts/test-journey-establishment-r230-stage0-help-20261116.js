// journey-establishment r230 — a stage-0 ask_favor want must be SURFACABLE.
// PROOF TEST for the r230 favorless-ask defect (panel: 26/74 raised asks
// (35.1%) never materialized into a committable favor, all class E1 — the
// want opener never ran because a resume/recall/case thread pre-empted
// the opening, so the fresh ask_favor want waited at stage 0 with a LIVE
// need and no favor attached). The r225 fix stopped the false refusal
// (stage-0-deflected 0/26 on this panel), but the ask itself stayed
// unreachable: convoWantMenu returned [] at stage 0 AND on non-want
// threads, so the menu never offered dlg:help in a resume-owned sitting
// (staged probe: 0 offers in 10 turns of goon presses; the startConvo
// comment claims "the menu surfaces it once the old thread settles").
// The fix: convoWantMenu offers ONLY dlg:help for a stage-0 ask_favor
// want with a live need. Pressing it runs engageBeat, whose
// deferred-after-resume branch already states the ask correctly
// (stage 0 -> 2, favor attached). No commit/cant is offered at stage 0 —
// deciding an ask the player never heard is the phantom-promise /
// false-refusal shape. A surfaced (stage-2) want is untouched, and other
// wants keep the stage-0 gate.
// Run: node scripts/test-journey-establishment-r230-stage0-help-20261116.js
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
// ask_favor want at stage 0. Returns { vid, def, open } or null.
function stageResumePreempted(Game, living) {
  const v = Game.state.village;
  for (const id of living) {
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
      return { vid: id, def: sel.def, open: r };
    }
    Game.endConvo(id, 'done');
  }
  return null;
}

(async () => {
  const { Game } = await loadGame({ seed: 5001, mode: 'mvc', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
  check('setup: living villagers exist', living.length > 0, 'living=' + living.length);
  plantSickNeeds(Game, living);

  // --- (B) stage the pre-empted state -------------------------------------
  const st = stageResumePreempted(Game, living);
  check('B resume pre-empts the opening (stage-0 ask_favor, live need)', !!st,
    st ? 'vid=' + st.vid : 'no villager resumed with ask_favor stage 0');
  if (!st) { console.log('RESULT ' + pass + ' pass / ' + fail + ' fail'); process.exit(1); }
  const vid = st.vid;
  const cB = Game.convoGet(vid);
  const needB = Game.convoFindFavorNeed(vid);
  check('B2 pre-empted state holds (stage 0, no favor, live need)',
    (cB.want.stage || 0) === 0 && !cB.want.favor && !!(needB && needB.kind),
    'stage=' + cB.want.stage + ' favor=' + JSON.stringify(cB.want.favor) + ' need=' + JSON.stringify(needB));

  // --- (C) the menu offers dlg:help for the stage-0 ask --------------------
  const menu = Game.convoWantMenu(vid) || [];
  const menuIds = menu.map(o => o.id);
  check('C stage-0 ask_favor menu offers dlg:help', menuIds.includes('dlg:help'),
    'menu=[' + menuIds.join(',') + ']');
  check('C2 stage-0 menu offers ONLY the engage verb (no commit, no cant)',
    menuIds.length === 1 && menuIds[0] === 'dlg:help', 'menu=[' + menuIds.join(',') + ']');
  const turn0Ids = ((st.open && st.open.choices) || []).map(ch => ch.id);
  check('C3 dlg:help leads the turn-0 menu', turn0Ids[0] === 'dlg:help',
    'turn0=[' + turn0Ids.join(',') + ']');

  // --- (D) pressing dlg:help states the ask --------------------------------
  const rD = Game.convoTurn(vid, 'dlg:help');
  const cD = Game.convoGet(vid);
  check('D help states the ask (names the need)',
    !!(rD && rD.line && /feverish|wound fever|help me/i.test(rD.line)),
    'line=' + JSON.stringify(rD && rD.line));
  check('D2 help moves stage 0 -> 2', (cD.want.stage || 0) === 2, 'stage=' + cD.want.stage);
  check('D3 help attaches the favor with the need kind',
    !!(cD.want.favor && cD.want.favor.kind === (needB && needB.kind)),
    'favor=' + JSON.stringify(cD.want.favor && cD.want.favor.kind));
  Game.endConvo(vid, 'done');

  // --- (E) no-need guard: stage-0 ask with no live need offers nothing -----
  // A natural stage-0 ask_favor sitting ALWAYS has a live need by
  // construction (the pick is weight-0 without one — every villager in
  // this state has one), so the guard is tested by staging the need
  // away: monkey-patch the need finder to null for the menu call only.
  const stE = stageResumePreempted(Game, living);
  if (stE) {
    const vidE = stE.vid;
    const origNeed = Game.convoFindFavorNeed;
    Game.convoFindFavorNeed = () => null;
    let menuE = [];
    try { menuE = Game.convoWantMenu(vidE) || []; } finally { Game.convoFindFavorNeed = origNeed; }
    check('E stage-0 ask with NO live need offers nothing', menuE.length === 0,
      'menu=[' + menuE.map(o => o.id).join(',') + ']');
    Game.endConvo(vidE, 'done');
  } else {
    check('E stage-0 ask with NO live need offers nothing', false, 'could not re-stage a resume sitting');
  }

  // --- (F) scope guard: another want at stage 0 still gets [] --------------
  // The weighted pick here is curious for most villagers (no sick needs);
  // stage a curious want at stage 0 on a recall thread.
  for (const id of living) delete v.sick[id];
  let curiousVid = null, curiousDef = null;
  for (const id of living) {
    const sel = Game.convoSelectWant(id);
    if (sel && sel.id === 'curious') { curiousVid = id; curiousDef = sel.def; break; }
  }
  if (curiousVid) {
    Game.startConvo(curiousVid);
    const cF = Game.convoGet(curiousVid);
    cF.want = { id: 'curious', def: curiousDef, stage: 0, fromSeed: false, seedNote: null, seedFavorId: null, seedQid: null };
    cF.thread = 'recall';
    const menuF = Game.convoWantMenu(curiousVid) || [];
    check('F stage-0 curious still gets no menu (scope preserved)', menuF.length === 0,
      'menu=[' + menuF.map(o => o.id).join(',') + ']');
    Game.endConvo(curiousVid, 'done');
  } else {
    check('F stage-0 curious still gets no menu (scope preserved)', false, 'no curious pick found');
  }

  // --- (G) positive control: a surfaced want still offers commit/cant ------
  // Fresh sitting, no resume: the opener runs, the ask is stated (stage 1),
  // help engages it (stage 2) on the want thread, and the menu offers commit.
  plantSickNeeds(Game, living);
  let gVid = null;
  for (const id of living) {
    const sel = Game.convoSelectWant(id);
    if (!sel || sel.id !== 'ask_favor') continue;
    if (v.convoSeeds) delete v.convoSeeds[id];
    const r = Game.startConvo(id);
    const c = Game.convoGet(id);
    if (c && !c._resumedOnce && c.want && c.want.id === 'ask_favor' && (c.want.stage || 0) >= 1) { gVid = id; break; }
    Game.endConvo(id, 'done');
  }
  if (gVid) {
    const helpG = Game.convoTurn(gVid, 'dlg:help');
    const cG = Game.convoGet(gVid);
    const menuG = (Game.convoWantMenu(gVid) || []).map(o => o.id);
    check('G surfaced want engages to stage 2 on help', (cG.want.stage || 0) === 2,
      'stage=' + cG.want.stage + ' line=' + JSON.stringify(helpG && helpG.line && helpG.line.slice(0, 60)));
    check('G2 surfaced want menu still offers commit/cant', menuG.includes('dlg:commit') && menuG.includes('dlg:cant'),
      'menu=[' + menuG.join(',') + ']');
    Game.endConvo(gVid, 'done');
  } else {
    check('G surfaced want engages to stage 2 on help', false, 'no non-resume ask_favor sitting found');
    check('G2 surfaced want menu still offers commit/cant', false, 'no non-resume ask_favor sitting found');
  }

  console.log('RESULT ' + pass + ' pass / ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('TEST-ERROR', e && e.stack || e); process.exit(1); });
