// journey-establishment r225 — stage-0 want must never be resolved by a pick.
// PROOF TEST for the r225 favorless-ask defect (panel: 19/19 favorless sits
// are class E1 — the want opener never ran; a resume/recall/case thread
// pre-empted the opening, so the fresh ask_favor want waits at stage 0 with
// a LIVE need and no favor attached). The defect: pressing 'dlg:cant'
// ("I can't right now", said to the resumed thread) treated the unvoiced
// want as live (wantLive = stage < 3), wrote a false 'deflected' memory
// ("you turned down their ask"), spoke the fresh want's deflectBeat, and
// closed the ask at stage 3 — for a need the player was never told about.
// The same stage-blind arc ran through the generic turn handler's
// deflect_q branch (Stan d34). NOTE (corrected during proof): favorDeclined
// does NOT fire in this shape — ask_favor.resolve early-returns when no
// favor is attached, so the 3-day need block never lands; the real harm
// is the false memory + false deflectBeat + the ask closed for the sitting.
// The fix: a stage-0 want is not live — dlg:cant's wantLive requires
// stage 1-2, and the deflect_q arc requires stage >= 1. (deflect_q's own
// harm is narrower — the stage-3 close with a 'deflected' resolution, no
// memory write — but the ask is still recorded as refused unheard.)
// A surfaced (stage-1) want still deflects on the same press (positive control).
// Run: node scripts/test-journey-establishment-r225-stage0-cant-20261116.js
'use strict';

const { loadGame, setupGame } = require('./sim-harness');

let pass = 0;
let fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function seedState(Game, vid, def) {
  const v = Game.state.village;
  // Stage the panel's pre-empted state: fresh ask_favor want at stage 0,
  // no favor attached, live sick need, a recall thread owning the opening.
  const c = Game.convoGet(vid);
  c.want = { id: 'ask_favor', def: def, stage: 0, fromSeed: false, seedNote: null, seedFavorId: null, seedQid: null };
  c.want.favor = null;
  c.thread = 'recall';
  // Ruby shape: a settled favor sits in the ledger.
  v.favorLedger = v.favorLedger || {};
  v.favorLedger[vid] = { id: 'favor-' + vid + '-1-1', vid, kind: 'forage_help', state: 'acknowledged', short: 'the pantry run', askedDay: 1 };
  if (v.favorDeclined) delete v.favorDeclined[vid];
}

(async () => {
  const { Game } = await loadGame({ seed: 5001, mode: 'mvc', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
  check('setup: living villagers exist', living.length > 0, 'living=' + living.length);

  // Plant a live sick need on every living villager (u4 — ask_favor wins
  // the weighted pick over first-meeting curiosity's 3).
  v.sick = v.sick || {};
  for (const id of living) v.sick[id] = { daysLeft: 3, severity: 2, name: 'wound fever' };

  // Find a villager whose weighted pick is ask_favor.
  let vid = null, def = null;
  for (const id of living) {
    const sel = Game.convoSelectWant(id);
    if (sel && sel.id === 'ask_favor') { vid = id; def = sel.def; break; }
  }
  check('A villager selects ask_favor on a sick need', !!vid, 'vid=' + vid);
  if (!vid) { console.log('RESULT ' + pass + ' pass / ' + fail + ' fail'); process.exit(1); }
  const need = Game.convoFindFavorNeed(vid);
  check('A live sick_help need is present', !!need && need.kind === 'sick_help', 'need=' + JSON.stringify(need));

  // --- (B) stage the pre-empted state -------------------------------------
  Game.startConvo(vid);
  seedState(Game, vid, def);
  const cB = Game.convoGet(vid);
  check('B preempted state staged (stage 0, no favor, live need)',
    (cB.want.stage || 0) === 0 && !cB.want.favor && !!(Game.convoFindFavorNeed(vid) || {}).kind,
    'stage=' + cB.want.stage + ' favor=' + JSON.stringify(cB.want.favor));

  // --- (C) dlg:help on the settled favor: "It's already handled" -----------
  const help = Game.convoTurn(vid, 'dlg:help');
  const cC = Game.convoGet(vid);
  check('C help on settled favor leaves the stage-0 want alone',
    (cC.want.stage || 0) === 0,
    'stage=' + cC.want.stage + ' line=' + (help && help.line));
  check('C2 help speaks the settled-favor line',
    !!(help && help.line && /already handled/i.test(help.line)),
    'line=' + (help && help.line));

  // --- (D) dlg:cant on the unvoiced want: the defect ----------------------
  const memBeforeD = ((v.memory || {})[vid] || []).filter(m => (m.t || m.type) === 'deflected').length;
  Game.convoTurn(vid, 'dlg:cant');
  const wD = Game.convoGet(vid).want;
  check('D cant on a stage-0 want leaves stage 0',
    (wD.stage || 0) === 0, 'stage=' + wD.stage + ' resolution=' + wD.resolution);
  check('D2 cant on a stage-0 want writes no deflected resolution',
    !wD.resolution, 'resolution=' + wD.resolution);
  const memAfterD = ((v.memory || {})[vid] || []).filter(m => (m.t || m.type) === 'deflected').length;
  check('D3 cant on a stage-0 want writes no false deflected memory',
    memAfterD === memBeforeD, 'deflected-memories before=' + memBeforeD + ' after=' + memAfterD);
  Game.endConvo(vid, 'done');
  check('D4 cant on a stage-0 want plants no seed',
    !((v.convoSeeds || {})[vid] != null), 'seed=' + JSON.stringify((v.convoSeeds || {})[vid]));

  // --- (E) deflect_q on a fresh pre-empted sitting: same defect class ------
  Game.startConvo(vid);
  seedState(Game, vid, def);
  const cE = Game.convoGet(vid);
  cE.pendingQ = { id: 'q_test_r225', answers: [] };
  const memBeforeE = ((v.memory || {})[vid] || []).filter(m => (m.t || m.type) === 'deflected').length;
  Game.convoTurn(vid, 'deflect_q');
  const wE = Game.convoGet(vid).want;
  check('E deflect_q on a stage-0 want leaves stage 0',
    (wE.stage || 0) === 0, 'stage=' + wE.stage + ' resolution=' + wE.resolution);
  check('E2 deflect_q on a stage-0 want writes no deflected resolution',
    !wE.resolution, 'resolution=' + wE.resolution);
  const memAfterE = ((v.memory || {})[vid] || []).filter(m => (m.t || m.type) === 'deflected').length;
  check('E3 deflect_q on a stage-0 want writes no false deflected memory',
    memAfterE === memBeforeE, 'deflected-memories before=' + memBeforeE + ' after=' + memAfterE);
  Game.endConvo(vid, 'done');

  // --- (F) POSITIVE CONTROL: a surfaced want still deflects ----------------
  Game.startConvo(vid);
  const cF = Game.convoGet(vid);
  // The opener surfaced the want (stage >= 1, favor attached) — do not reset.
  const surfaced = cF.want && cF.want.id === 'ask_favor' && (cF.want.stage || 0) >= 1 && !!cF.want.favor;
  check('F control: the fresh sitting surfaces ask_favor with a favor',
    !!surfaced,
    'want=' + (cF.want && cF.want.id) + ' stage=' + (cF.want && cF.want.stage) + ' favor=' + JSON.stringify(cF.want && cF.want.favor && cF.want.favor.kind));
  if (surfaced) {
    Game.convoTurn(vid, 'dlg:cant');
    const wF = Game.convoGet(vid).want;
    check('F2 cant on a surfaced want still deflects it',
      (wF.stage || 0) >= 3 && wF.resolution === 'deflected',
      'stage=' + wF.stage + ' resolution=' + wF.resolution);
    Game.endConvo(vid, 'done');
    check('F3 a real refusal still writes favorDeclined',
      !!((v.favorDeclined || {})[vid] != null),
      'favorDeclined=' + JSON.stringify((v.favorDeclined || {})[vid]));
  }

  console.log('RESULT ' + pass + ' pass / ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH', e && e.stack || e); process.exit(2); });
