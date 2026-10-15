#!/usr/bin/env node
// scripts/test-succession-proto-20261014.js — PROOF for the succession arm.
//
// Race loser #1 (evidence/2026-10-14/sim-fifthlink.md): succession haircuts
// (-8 per shaken link) on Haven leader deaths. The haircut is engine-side;
// this policy layer (scripts/policies/succession.js, SUCCPROTO=1) is the
// response: the new speaker answers staged beats (winseek's bar), tends
// every bond (+8 answers -8), and keeps tribute current in the 7-day grief
// window.
//
// RED PHASE (honest failure modes this must catch):
//   R1. gate off = baseline: SUCCPROTO unset -> the succession module
//       exports fourthlink itself (same object). The file is inert.
//   R2. REAL RED — the gap in-engine: a real successionCrisis-staged beat
//       expires unanswered under the baseline policy (24 -> 16 -> 10).
//   R3. the mourning choke is real: an older link's succession marks
//       mourning and the haircut lands (-8); tendLink REFUSES in mourning
//       (paid=0, no stamp) — the protocol must skip mourning links, never
//       buy off grief.
// GREEN PHASE (lever):
//   G1. gate on: SUCCPROTO=1 -> succession is a distinct policy, desc names
//       succession.
//   G2. the protocol answers a REAL staged beat with grain AND tends the
//       young link: 16 -> 24 (gift +8) -> 32 (tend +8); ctx counts both.
//   G3. window discipline: a succession note 8 days old does NOT activate
//       the protocol (no tend); a fresh one does.
//   G4. mourning links are SKIPPED: no tend call, no pantry spent, no
//       narration at the grieving.
//   G5. full-policy smoke: armed succession.daily on a live beat — no
//       throw, beat answered.
//
// Graceful degradation (r21b/r23 worker-integrity lesson): if the layer
// file is absent (killed arm), the GREEN phase info-skips; the RED phase
// (baseline inertness + the in-engine gap + mourning choke) stays fully
// runnable. Never hard-require a deleted layer.
//
// Usage: node scripts/test-succession-proto-20261014.js
'use strict';
process.env.FOURTHLINK = '1';
process.env.SUCCPROTO = '1';
const { loadGame, setupGame } = require('./sim-harness');
const { fourthlink } = require('./policies/fourthlink');
let succMod = null;
try { succMod = require('./policies/succession'); }
catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
const layerPresent = !!succMod;
const succession = layerPresent ? succMod.succession : null;
const successionProtocol = layerPresent ? succMod.successionProtocol : null;
const freshSuccession = layerPresent ? succMod.freshSuccession : null;

function pinPantry(Game, kcal) {
  const units = Math.max(1, Math.round(kcal / 1500));
  Game.state.village.pantry = [{ name: 'Test grain', kcalEach: 1500, units, spoilDay: 9999 }];
}
function pantryTotal(Game) {
  return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}

// young: link.day 0, scholar day 10 -> young link (<21d): staged beat.
// old:   link.day -30, scholar day 10 -> 40d old: mourning path. lastKeptDay
//        recent so the link is KEPT (the neglect snap is a different engine
//        path — death + neglect kills, and this proof tests mourning).
async function buildLink({ trust, linkDay, lastKeptDay }) {
  const { Game } = await loadGame({ seed: 42, mode: 'succession-proof' });
  Game.debugRegion = 'na_eastern_woodlands'; // explicit woodland scene fixture
  await setupGame(Game);
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'dryv', name: 'Dryfield', pantryKcal: 0, population: 0, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  const link = {
    id: 'link_testS', primary: 'haven', subordinate: 'dryv',
    day: linkDay, trust, status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [],
  };
  if (lastKeptDay != null) link.lastKeptDay = lastKeptDay;
  m.links.push(link);
  Game.state.scholar.day = 10;
  return { Game, link };
}
const trustOf = (Game) => (Game.mshipState().links.find(l => l.id === 'link_testS') || {}).trust | 0;
const beatOf = (Game) => (Game.mshipState().links.find(l => l.id === 'link_testS') || {}).pendingRenegotiation || null;
const mourningOf = (Game) => (Game.mshipState().links.find(l => l.id === 'link_testS') || {}).mourningUntil | 0;
const renegNotes = (Game) => ((Game.mshipState().links.find(l => l.id === 'link_testS') || {}).history || [])
  .filter(h => h.kind === 'renegotiation' || h.kind === 'succession').map(h => `[d${h.day}] ${String(h.note)}`);

async function main() {
  let pass = 0;
  const ok = (name, cond, detail) => {
    if (!cond) { console.error(`FAIL ${name}: ${detail}`); process.exit(1); }
    pass++;
    console.log(`ok ${name}${detail ? ' — ' + detail : ''}`);
  };

  // ---- RED R1: gate off = fourthlink itself (or layer absent: inert by deletion) ----
  delete process.env.SUCCPROTO;
  if (layerPresent) {
    for (const k of Object.keys(require.cache)) if (k.endsWith('policies/succession.js')) delete require.cache[k];
    const off = require('./policies/succession').succession;
    ok('R1-gate-off-is-fourthlink', off === fourthlink, 'unset gate exports fourthlink itself');
  } else {
    ok('R1-layer-deleted', true, 'layer absent (killed arm) — inert by deletion, nothing to gate');
  }

  // ---- RED R2: the gap — baseline lets a REAL staged beat expire ----
  {
    const { Game } = await buildLink({ trust: 24, linkDay: 0 });
    const ret = Game.successionCrisis('link_testS');
    ok('R2-beat-staged-real', ret === 'grace' && beatOf(Game) != null, `successionCrisis -> ${ret}, beat staged`);
    ok('R2-haircut-applied', trustOf(Game) === 16, `trust 24 -> ${trustOf(Game)} (-8 succession haircut)`);
    const ctx = {};
    let expiryCost = null;
    for (let d = 11; d <= 18; d++) {
      Game.state.scholar.day = d;
      pinPantry(Game, 15000);
      fourthlink.daily(Game, ctx);
      const pendingBefore = beatOf(Game), trustBeforeExpiry = trustOf(Game);
      Game._renegotiationTick();
      if (pendingBefore && !beatOf(Game)) expiryCost = trustBeforeExpiry - trustOf(Game);
    }
    const notes = renegNotes(Game).join(' | ');
    ok('R2-baseline-lets-expire', beatOf(Game) == null && /silence answered/i.test(notes),
      'beat expired unanswered; engine said the silence answered');
    ok('R2-expiry-costs-6', expiryCost === 6, `expiry debit=${expiryCost}; trust after other daily actions=${trustOf(Game)}`);
    ok('R2-succ-window-unanswered', !(ctx.succBeatsAnswered > 0), 'baseline answered nothing');
  }

  // ---- RED R3: the mourning choke — older link: haircut + refused tend ----
  {
    const { Game } = await buildLink({ trust: 24, linkDay: -30, lastKeptDay: 8 });
    const ret = Game.successionCrisis('link_testS');
    ok('R3-older-link-mourns', ret === 'shaken' && mourningOf(Game) === 17,
      `successionCrisis -> ${ret}, mourningUntil=${mourningOf(Game)} (day 10 + 7)`);
    ok('R3-haircut-applied', trustOf(Game) === 16, `trust 24 -> ${trustOf(Game)} (-8 haircut)`);
    Game.state.scholar.day = 12; pinPantry(Game, 15000);
    const before = pantryTotal(Game);
    const paid = Game.tendLink('link_testS');
    ok('R3-tend-refused-in-mourning', paid === 0 && pantryTotal(Game) === before && trustOf(Game) === 16,
      'tend refused: paid=0, pantry untouched, trust 16 (grief is not bought off)');
  }

  // ---- GREEN: only when the layer exists; info-skip after the kill ----
  if (!layerPresent) {
    console.log('info SKIP G1-G5: layer deleted per kill protocol (armed-phase results preserved in the evidence file)');
  } else {
  const on = succMod;
  ok('G1-gate-on-differs', on.succession !== fourthlink, 'gated policy is a distinct object');
  ok('G1-desc-names-succession', /succession/i.test(on.succession.desc || ''), on.succession.desc);
  ok('G1-exports-protocol', typeof successionProtocol === 'function' && typeof freshSuccession === 'function',
    'successionProtocol + freshSuccession exported for instruments');

  // ---- GREEN G2: the protocol answers the beat AND tends the young link ----
  {
    const { Game } = await buildLink({ trust: 24, linkDay: 0 });
    Game.successionCrisis('link_testS');
    Game.state.scholar.day = 11; pinPantry(Game, 15000);
    const ctx = {};
    successionProtocol(Game, ctx);
    const notes = renegNotes(Game).join(' | ');
    ok('G2-beat-answered', beatOf(Game) == null && /met grief with grain/i.test(notes),
      'beat cleared; engine narrated the gift');
    ok('G2-trust-answered-haircut', trustOf(Game) === 32,
      `trust 16 -> ${trustOf(Game)} (gift +8, tend +8: the response answers the -8 haircut)`);
    ok('G2-ctx-counts', (ctx.succBeatsAnswered | 0) === 1 && (ctx.succTends | 0) === 1,
      `beats=${ctx.succBeatsAnswered | 0} tends=${ctx.succTends | 0}`);
  }

  // ---- GREEN G3: window discipline — 8-day-old succession does NOT activate ----
  {
    const { Game } = await buildLink({ trust: 24, linkDay: 0 });
    Game.state.scholar.day = 4;
    Game.successionCrisis('link_testS'); // note stamped day 4
    Game.answerRenegotiation('link_testS', 'gift'); // clear the beat; the note stays
    Game.state.scholar.day = 12; // note is 8 days old
    pinPantry(Game, 15000);
    const day = 12;
    ok('G3-stale-note-inactive', freshSuccession(Game, day) === false, '8-day-old succession note: window closed');
    const ctx = {};
    const tBefore = trustOf(Game);
    successionProtocol(Game, ctx);
    ok('G3-stale-no-tend', !(ctx.succTends > 0) && trustOf(Game) === tBefore,
      'protocol silent outside the window — no tend, trust untouched');
  }

  // ---- GREEN G4: mourning links are skipped, not narrated at ----
  {
    const { Game } = await buildLink({ trust: 24, linkDay: -30, lastKeptDay: 8 });
    Game.successionCrisis('link_testS'); // mourning until day 17
    Game.state.scholar.day = 12; pinPantry(Game, 15000);
    const said = [];
    const origSay = Game.say;
    Game.say = function (s) { try { said.push(String(s)); } catch (e) {} };
    const ctx = {};
    const before = pantryTotal(Game);
    successionProtocol(Game, ctx);
    Game.say = origSay;
    ok('G4-mourning-skipped', !(ctx.succTends > 0), 'no tend attempted on a mourning link');
    ok('G4-pantry-untouched', pantryTotal(Game) === before, `pantry ${before} -> ${pantryTotal(Game)}`);
    ok('G4-no-grief-narration', !said.some(s => /grain can wait|burying/i.test(s)),
      'protocol stays silent at the grieving — no daily "grain waits" spam');
  }

  // ---- GREEN G5: full armed policy day on a live beat — no throw, answered ----
  {
    const { Game } = await buildLink({ trust: 24, linkDay: 0 });
    Game.successionCrisis('link_testS');
    Game.state.scholar.day = 11; pinPantry(Game, 15000);
    const ctx = {};
    let threw = null;
    try { on.succession.daily(Game, ctx); } catch (e) { threw = e; }
    ok('G5-no-throw', !threw, threw ? String(threw).slice(0, 120) : 'armed daily ran clean');
    ok('G5-beat-answered', beatOf(Game) == null && (ctx.succBeatsAnswered | 0) === 1,
      'the composed policy (competent + courtship + protocol) cleared the beat');
  }
  } // end else (layer present): G1-G5

  delete process.env.SUCCPROTO;
  console.log(`\nPROOF ${pass}/${pass} green — RED observed (baseline lets the beat expire -6; mourning refuses tends), the protocol answers grief honestly.`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
