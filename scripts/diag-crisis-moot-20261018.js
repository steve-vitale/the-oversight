#!/usr/bin/env node
// diag-crisis-moot-20261018.js -- CRISIS LEG r17: the moot tries the cannibal.
// Witnessed cannibalism in a HEALTHY village: justice ladder -> moot -> sentence
// -> exile enforcement, per docs/CORRUPTION.md ("Healthy village -> exile.
// Discovered cannibalism fast-tracks the moot; the charge outranks murder").
// Staging uses REAL functions only: a wound-death via the real trio
// (registerDeath + removeVillager(id,'killed') + seedGossip('death') — the same
// three calls game.js makes for wound deaths), corpseButcher (real, desecration
// recorded), eatCannibal (real, witnessed — 3 villagers positioned in range).
// Everything downstream — justiceTick, confrontation, moot demand, accusation,
// trial, sentence, exile — is fully real code.
// Per-seed confrontation POLICY: 7201 refuse, 7202 pay (buy-off probe),
// 7203 silence-timeout then DEFY exile (stay at Haven past dawn).
// Usage: SEED=7201 node scripts/diag-crisis-moot-20261018.js
// Output: JSON record to stdout; narrative + beats to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || "7201", 10);
const ESTABLISH = 20, TAIL = 14;

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingNpcs(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    if (id === Game.villagerId) return false;
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
function justiceSnap(Game) {
  try {
    const j = Game.justiceState();
    return { stage: j.stage || 0, heat: Game.justiceHeat(), crimes: (j.crimes || []).map(c => c.type + (c.witnessed === false ? '(unseen)' : '(seen)')), confrontedBy: j.confrontedBy || null, pendingConfront: !!j.pendingConfront, mootDemanded: !!j.mootDemanded, exiled: !!j.exiled, exileDay: j.exileDay || null };
  } catch (e) { return { err: String(e && e.message || e) }; }
}
function caseSnap(Game) {
  try {
    const bs = Game.betrayalState ? Game.betrayalState() : {};
    return (bs.cases || []).map(c => ({ id: c.id, charge: c.charge, status: c.status, resolution: c.resolution || null, accused: (c.accused || []).map(a => { try { return a === Game.villagerId ? 'PLAYER(' + firstName(rawName(Game, a)) + ')' : firstName(rawName(Game, a)); } catch (e) { return String(a).slice(0, 8); } }), trial: c.trial ? { guilty: c.trial.guilty, wildDay: !!c.trial.wildDay } : null, accuser: c.accuser ? firstName(rawName(Game, c.accuser)) : null }));
  } catch (e) { return []; }
}
function fallenCount(Game) { try { return ((Game.state.village || {}).fallen || []).length; } catch (e) { return -1; } }

const rec = { seed: SEED, staged: null, beats: [], notes: [], justice: [], cases: [] };
const E = (s) => console.error(s);
// Policy via env: refuse | pay | silence (default by seed: 7201 refuse, 7202 pay, else silence)
const POLICY = process.env.POLICY || (SEED === 7202 ? 'pay' : SEED === 7201 ? 'refuse' : 'silence');

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-moot-cannibal', fullTelemetry: true });
  await setupGame(Game);
  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  const pop = livingNpcs(Game).length;
  let norm = '?', starving = '?';
  try { norm = Game.cannibalNorm(); } catch (e) { rec.notes.push('cannibalNorm threw: ' + e.message); }
  try { starving = !!Game.starvingVillage(); } catch (e) {}
  E(`[HEALTH] d${dayOf(Game)} pop=${pop} cannibalNorm=${norm} starving=${starving}`);
  rec.staged = { day: dayOf(Game), pop, norm, starving };
  if (norm !== 'exile' || starving) { E('[HEALTH] NOT a healthy village — staging would test the wrong norm. Abort.'); console.log(JSON.stringify(rec)); return; }

  // Capture narrative lines.
  const sayBuf = [];
  const _say = Game.say;
  Game.say = function (txt) { try { sayBuf.push(String(txt)); } catch (e) {} return _say.apply(this, arguments); };

  // ---- STAGE THE DEATH (real trio, mirroring game.js wound-death path) ----
  const npcs = livingNpcs(Game);
  if (!npcs.length) { E('[STAGE] no living NPCs — abort'); console.log(JSON.stringify(rec)); return; }
  const victim = npcs[Math.floor(npcs.length / 2)];
  const vname = rawName(Game, victim);
  E(`[STAGE] d${dayOf(Game)}: staging wound-death of ${firstName(vname)} (real registerDeath+removeVillager+seedGossip trio)`);
  try { Game.registerDeath({ kind: 'villager', villagerId: victim, name: vname, cause: 'a wound that wouldn\'t close', killerId: null }); } catch (e) { rec.notes.push('registerDeath threw: ' + e.message); }
  try { Game.removeVillager(victim, 'killed'); } catch (e) { rec.notes.push('removeVillager threw: ' + e.message); }
  try { Game.seedGossip('death', { who: victim }, []); } catch (e) {}
  const corpse = (Game.corpses ? Game.corpses() : []).find(c => c.villagerId === victim && !c.buried);
  if (!corpse) { E('[STAGE] no corpse registered — abort'); console.log(JSON.stringify(rec)); return; }
  E(`[STAGE] corpse ${corpse.id} at node (${corpse.node.x},${corpse.node.y}) mx,my=(${corpse.mx},${corpse.my})`);

  // Cutting tool: grant a real blade if the scholar lacks one.
  let hasBlade = false;
  try { hasBlade = Game.hasCuttingTool(); } catch (e) {}
  if (!hasBlade) {
    const def = ((Game.data || {}).items || []).find(d => d && (d.class === 'weapon' || d.class === 'tool') && /knife|machete|blade/i.test(String(d.name || '') + ' ' + String(d.id || '')));
    if (def) {
      Game.state.scholar.inventory.push({ id: def.id, name: def.name, plantId: def.id, units: 1, kcalEach: 0, edible: false });
      E(`[STAGE] granted blade: ${def.name}`);
    } else { rec.notes.push('no blade def found in data.items'); }
  }

  // Witnesses: 3 living NPCs at the scholar's elbow.
  const s = Game.state.scholar;
  const witVids = livingNpcs(Game).slice(0, 3);
  try {
    const pos = Game.state.village.positions || (Game.state.village.positions = {});
    for (const wid of witVids) pos[wid] = { mx: s.mx, my: s.my };
  } catch (e) { rec.notes.push('positioning witnesses threw: ' + e.message); }
  E(`[STAGE] witnesses positioned: ${witVids.map(w => firstName(rawName(Game, w))).join(', ')}`);

  // PAY-PROBE PROVISIONING: the pay POLICY needs food in the pack. Grant real
  // smoked-meat stacks in the standard food schema (the pay mechanics, not the
  // food's provenance, are under test).
  if (POLICY === 'pay') {
    Game.state.scholar.inventory.push(
      { id: 'staged_smoked', name: 'Smoked meat', plantId: 'meat_smoked', foodKind: 'meat', foodState: 'smoked', edible: true, units: 20, kcalEach: 500, spoilDay: dayOf(Game) + 30, unit: 'portion', kg: 0.3 });
    E('[STAGE] pay-probe: granted 20x500 kcal smoked meat to the pack');
  }

  // ---- THE DARK BEAT (real functions) ----
  const sayMark = sayBuf.length;
  let meat = null;
  try { meat = Game.corpseButcher(corpse.id); } catch (e) { rec.notes.push('corpseButcher threw: ' + e.message); }
  E(`[BUTCHER] ${meat ? 'human meat in pack' : 'FAILED'}`);
  const inv = Game.state.scholar.inventory || [];
  const midx = inv.findIndex(it => it && it.plantId === 'meat_human' && (it.units || 0) > 0);
  let ate = false;
  if (midx >= 0) {
    try { ate = Game.eatCannibal(midx); } catch (e) { rec.notes.push('eatCannibal threw: ' + e.message); }
  } else { rec.notes.push('no meat_human in inventory after butcher'); }
  E(`[EAT] witnessed cannibalism: ${ate ? 'DONE' : 'FAILED'}`);
  const darkLines = sayBuf.slice(sayMark);
  rec.beats.push({ kind: 'dark-beat', day: dayOf(Game), lines: darkLines });
  for (const l of darkLines) E('  DARK: ' + l.slice(0, 200));
  E(`[JUSTICE] post-beat: ${JSON.stringify(justiceSnap(Game))}`);

  // ---- DRIVE THE LADDER ----
  const bearer0 = Game.villagerId;
  const fallen0 = fallenCount(Game);
  rec.bearer0 = firstName(rawName(Game, bearer0));
  E(`[BEARER] staged bearer: ${rec.bearer0}, fallen=${fallen0}`);
  E(`[POLICY] confrontation POLICY for seed ${SEED}: ${POLICY}`);
  let confronted = false, responded = false;
  const trialsSeen = {}, sentencedSeen = {};
  let payAttempts = 0;
  const PAY_MAX = 6;
  let lastStage = justiceSnap(Game).stage;
  for (let d = 0; d < TAIL && !Game.over; d++) {
    const mark = sayBuf.length;
    const dayMark = sayBuf.length;
    await runDays(Game, oracleV2, { days: 1 });
    const js = justiceSnap(Game);
    const cases = caseSnap(Game);
    // Bearer / death watch: did the mantle pass?
    if (Game.villagerId !== bearer0 && !rec.mantle) {
      rec.mantle = { day: dayOf(Game), from: rec.bearer0, to: firstName(rawName(Game, Game.villagerId)), fallen: fallenCount(Game) };
      E(`[MANTLE] d${dayOf(Game)}: bearer changed ${rec.bearer0} -> ${rec.mantle.to} (fallen ${fallen0} -> ${rec.mantle.fallen})`);
    }
    if (js.stage !== lastStage) {
      rec.justice.push({ day: dayOf(Game), stage: js.stage, heat: js.heat, crimes: js.crimes });
      E(`[LADDER] d${dayOf(Game)} stage ${lastStage} -> ${js.stage} (heat ${js.heat})`);
      lastStage = js.stage;
    }
    // Confrontation beat: capture the voice, then apply the per-seed POLICY.
    // Pay POLICY: pay on EVERY pending confrontation (up to PAY_MAX), to test
    // whether the village re-confronts and can be bought off repeatedly.
    if (js.pendingConfront && (POLICY !== 'pay' ? !responded : payAttempts < PAY_MAX)) {
      confronted = true;
      const confLines = sayBuf.slice(mark).concat(sayBuf.slice(Math.max(0, mark - 6), mark)).filter(l => /⚖|We need to talk|confront/i.test(l));
      // capture ALL fresh lines for the sense read
      const fresh = sayBuf.slice(mark);
      rec.beats.push({ kind: 'confrontation', day: dayOf(Game), confronter: js.confrontedBy ? firstName(rawName(Game, js.confrontedBy)) : null, lines: fresh });
      E(`[CONFRONT] d${dayOf(Game)} by ${js.confrontedBy ? firstName(rawName(Game, js.confrontedBy)) : '?'}:`);
      for (const l of fresh.slice(0, 8)) E('  CONF: ' + l.slice(0, 220));
      if (POLICY === 'refuse') {
        try { Game.justiceRespond('refuse'); E('[RESPOND] refused'); } catch (e) { rec.notes.push('justiceRespond refuse threw: ' + e.message); }
      } else if (POLICY === 'pay') {
        // PAY PROBE (B2): pay whenever a confrontation is pending, up to 6
        // pays across the tail. The question: can witnessed cannibalism in a
        // healthy village be bought off with food?
        payAttempts++;
        let r = null;
        try { r = Game.justiceRespond('pay'); } catch (e) { rec.notes.push('justiceRespond pay threw: ' + e.message); }
        const js3 = justiceSnap(Game);
        E(`[PAY] attempt ${payAttempts} -> ${JSON.stringify(r)} ; now stage=${js3.stage} heat=${js3.heat} pending=${js3.pendingConfront}`);
        rec.beats.push({ kind: 'pay-response', day: dayOf(Game), attempt: payAttempts, result: r, heatAfter: js3.heat, stageAfter: js3.stage });
      } else { E('[RESPOND] silence (letting the 2-day timeout run)'); }
      responded = true;
    }
    const seenCaseIds = rec._seenCaseIds || (rec._seenCaseIds = {});
    for (const c of cases) {
      if (!seenCaseIds[c.id]) {
        seenCaseIds[c.id] = true;
        rec.cases.push({ day: dayOf(Game), event: 'case-opened', id: c.id, charge: c.charge, accuser: c.accuser, accused: c.accused });
        E(`[MOOT] d${dayOf(Game)} case ${c.id} opened: charge=${c.charge} accuser=${c.accuser} accused=${(c.accused || []).join(',')}`);
      }
      if (c.trial && !trialsSeen[c.id]) {
        trialsSeen[c.id] = true;
        rec.cases.push({ day: dayOf(Game), event: 'trial', guilty: c.trial.guilty, wildDay: c.trial.wildDay });
        E(`[TRIAL] d${dayOf(Game)} verdict: guilty votes=${c.trial.guilty} wildDay=${c.trial.wildDay}`);
        // TRIAL-DAY CAPTURE: the whole day's say lines — the trial speeches
        // live here, not just in the tail. Filter to trial-relevant markers
        // for the log, keep everything in the record.
        const dayLines = sayBuf.slice(dayMark);
        const trialish = dayLines.filter(l => /moot|trial|verdict|guilty|acquit|fire|stand|speak|defense|accus|Cannibal|exile|sentence|vote|count/i.test(l));
        rec.beats.push({ kind: 'trial-day', day: dayOf(Game), lines: dayLines });
        E(`[TRIAL-DAY] ${dayLines.length} lines, ${trialish.length} trialish:`);
        for (const l of trialish.slice(0, 40)) E('  TRL: ' + l.slice(0, 220));
      }
      if (c.resolution && !sentencedSeen[c.id]) {
        sentencedSeen[c.id] = true;
        rec.cases.push({ day: dayOf(Game), event: 'sentence', resolution: c.resolution });
        E(`[SENTENCE] d${dayOf(Game)} resolution=${c.resolution}`);
        const fresh = sayBuf.slice(mark);
        rec.beats.push({ kind: 'sentence', day: dayOf(Game), lines: fresh.slice(-10) });
        for (const l of fresh.slice(-10)) E('  SENT: ' + l.slice(0, 220));
      }
    }
    // Exile defiance (7203): stay at Haven past dawn, watch for the uprising.
    if (SEED === 7203 && Object.keys(sentencedSeen).length) {
      const v = Game.state.village || {};
      try { Game.map.px = v.px ?? 4; Game.map.py = v.py ?? 4; } catch (e) {}
    }
    if (Game.over) { E('[TAIL] game over — death-aware stop'); break; }
  }
  Game.say = _say;
  rec.finalJustice = justiceSnap(Game);
  rec.finalCases = caseSnap(Game);
  rec.scholarExiled = !!(Game.state.scholar && Game.state.scholar.exiled);
  rec.villagePop = livingNpcs(Game).length;
  E(`[END] d${dayOf(Game)} justice=${JSON.stringify(rec.finalJustice)} exiled=${rec.scholarExiled} pop=${rec.villagePop}`);
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
