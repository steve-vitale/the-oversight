#!/usr/bin/env node
// journey-succession-r10-20261012.js — SUCCESSION LEG (7) r10: "the successor's first week."
//
// r5/r7/r8 proved the mantle invariants; r9 lived the week after (funeral,
// mourning). This run plays the NEW BEARER'S first week as a different person:
//   1. Inheritance audit: what carries (integration, System abilities, codex,
//      trust@60%) vs what resets (body, budgets, statuses, inventory,
//      background kit). The break-it r6 occupation bug was fixed — but has any
//      run watched a successor actually USE their background abilities?
//   2. System continuity: no second arrival beat, no re-tutorial, the System
//      addresses the office, not the dead name.
//   3. Phantom-name scan: every post-death say line mentioning the dead
//      bearer's first name, listed raw for manual review.
//   4. People check: two full conversations with villagers who knew the dead
//      Bearer <redacted> transcripts raw (SENSE-TESTING LAW).
//   5. Wipe probe (seed 604): the other bookend — last-survivor death.
//      Is the ending honest and resolved, or a bare screen?
//
// Usage: SEEDS=601-603 node scripts/journey-succession-r10-20261012.js
//        SEEDS=604 node scripts/journey-succession-r10-20261012.js  (wipe probe)
// Output: one JSON line per seed to stdout; census/transcripts/checks to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const DAYS1 = parseInt(process.env.DAYS1 || '16', 10); // post-System death
const DAYS2 = parseInt(process.env.DAYS2 || '8', 10);
function parseSeeds() {
  const s = process.env.SEEDS || '601-603';
  const out = [];
  for (const part of s.split(',')) {
    const m = part.match(/^(\d+)-(\d+)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); }
    else if (/^\d+$/.test(part)) out.push(+part);
  }
  return out;
}
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function occOf(Game, vid) {
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid] || {};
    return rc.occupationId || rc.occupation || '?';
  } catch (e) { return '?'; }
}
function census(Game, label) {
  const v = Game.state.village || {}, s = Game.state.scholar || {};
  const lines = [`--- CENSUS (${label}), day ${s.day || 0}, Bearer: ${rawName(Game, Game.villagerId)} [${occOf(Game, Game.villagerId)}] ---`];
  for (const vid of (v.roster || [])) {
    const trust = ((v.trust || {})[vid] == null ? '?' : (v.trust[vid]));
    lines.push(`  alive ${rawName(Game, vid)} [${occOf(Game, vid)}] trust=${trust}`);
  }
  const fallen = (v.fallen || []).map(f => `${rawName(Game, f.villagerId) || f.name || '?'} d${f.day} (${f.cause})`);
  lines.push(`  fallen: ${fallen.length ? fallen.join('; ') : 'none'}`);
  lines.push(`  codex: ${Object.keys((Game.state.codex || {}).plants || {}).length} plants`);
  lines.push(`  pantry: ${Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)))} kcal`);
  return lines.join('\n');
}
// neutral conversation driver: grief/lately topics first, then natural.
function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 12;
  const out = [];
  out.push(`## ${tag} — talking to ${rawName(Game, vid)} [${occOf(Game, vid)}]`);
  try { Game.startConvo(vid); } catch (e) { return out.join('\n') + ' (startConvo threw: ' + e.message + ')'; }
  const GRIEF = /lately|mourn|grief|griev|died|dead|gone|miss|bury|buried|grave|funeral|since|loss|lost/i;
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => GRIEF.test((c.text || '') + ' ' + (c.id || '')) && !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${((pick.text || pick.label || '').slice(0, 100))}`);
    try { Game.convoTurn(vid, pick.id); }
    catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  out.push('### FULL TRANSCRIPT');
  for (const e of ((c && c.transcript) || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
  return out.join('\n');
}

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'journey-succession-r10', fullTelemetry: true });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);
  const rec = { seed, checks: [], convo: [], census: {}, phantomLines: [] };
  const check = (id, ok, detail) => rec.checks.push({ id, ok: !!ok, detail: detail || '' });

  await runDays(Game, competent, { days: DAYS1 });
  rec.census.pre = census(Game, 'BEFORE DEATH');
  const s0 = Game.state.scholar;
  const oldId = Game.villagerId, oldName = rawName(Game, oldId), oldFirst = oldName.split(' ')[0];
  const stage0 = Game.integrationStage ? Game.integrationStage() : -1;
  const sysAbs0 = (s0.abilities || []).map(a => (a.id || a));
  const bg0 = (s0.backgroundAbilities || []).map(a => (a.id || a));
  const trust0 = Object.assign({}, Game.state.village.trust || {});
  const trustOld = trust0[oldId];
  const inv0names = (s0.inventory || []).map(i => i.name || i.itemId);
  const inv0owners = (s0.inventory || []).map(i => i.owner);
  const arrived0 = !!Game.state.systemArrived;
  const deathDay = s0.day || 0;
  const sayMark = says.length;
  Game.playerDeath('a hushwolf');
  const deathBeat = says.slice(sayMark);
  rec.deathBeat = deathBeat;
  const s1 = Game.state.scholar;
  const newId = Game.villagerId, newName = rawName(Game, newId), newFirst = newName.split(' ')[0];
  rec.death = { day: deathDay, oldBearer: oldName, newBearer: newName, newOcc: occOf(Game, newId), over: !!Game.over };
  check('mantle-passes', !Game.over && newId !== oldId, `${oldName} -> ${newName}`);
  if (Game.over) return rec;

  // 1. inheritance audit
  const stage1 = Game.integrationStage ? Game.integrationStage() : -1;
  check('integration-continues', stage1 === stage0 && stage0 >= 1,
    `stage ${stage0} -> ${stage1} (post-System death; integration is the office's)`);
  const sysAbs1 = (s1.abilities || []).map(a => (a.id || a));
  const sysKept = sysAbs0.filter(id => sysAbs1.includes(id));
  check('system-abilities-pass', sysAbs1.length >= sysAbs0.length && sysKept.length === sysAbs0.length,
    `kept ${sysKept.length}/${sysAbs0.length}: ${sysAbs0.join(',') || '(none held)'}`);
  const newChar = ((Game.data || {}).villagers || []).find(x => x.id === newId) || {};
  const bg1 = (s1.backgroundAbilities || []).map(a => (a.id || a));
  const bgSeen = bg1.filter(id => { try { return !!Game.hasAbility(id); } catch (e) { return false; } });
  check('background-kit-honest', bg1.length > 0 && bgSeen.length === bg1.length,
    `occ=${occOf(Game, newId)} granted=[${bg1.join(',')}] hasAbility-sees=${bgSeen.length}/${bg1.length}`);
  rec.backgroundKit = bg1;
  // trust discount: 60% of the office's trust, or 20 default for missing entry
  const expectTrust = Math.round(((trustOld == null ? 20 : trustOld)) * 0.6);
  const trust1 = (Game.state.village.trust || {})[newId];
  check('trust-discounted', trust1 === expectTrust,
    `old=${trustOld == null ? 'missing(20)' : trustOld} -> new=${trust1} (expect ${expectTrust})`);
  // the successor's own kit: owner = newId, <=5, bonded
  const inv1 = s1.inventory || [];
  const ownKit = inv1.every(i => (i.owner === newId || !i.owner) && i.bonded);
  check('own-kit-not-inherited', inv1.length <= 5 && ownKit,
    `inventory=${inv1.length} items: ${(inv1.map(i => i.name).join(', ') || 'empty')}`);
  // the dead bearer's gear rides the corpse (loot-as-action), not the successor
  const corpse = (Game.corpses ? Game.corpses() : []).find(c => c.villagerId === oldId);
  const packNames = ((corpse && corpse.items) || []).map(i => i.name || i.itemId);
  const leaked = inv0names.filter(n => packNames.includes(n) === false && (inv1.map(i => i.name || i.itemId).includes(n)));
  check('death-pack-on-corpse', !!corpse && packNames.length > 0 && leaked.length === 0,
    `corpse items=${packNames.length}, old-gear-leaked-to-successor=${leaked.length}`);
  // new body: fresh budgets
  check('new-body-fresh', (s1.statuses || []).length === 0 && (s1.diseases || []).length === 0 &&
    s1.kcal === 1500 && s1.bloodPriceWound === 0,
    `statuses=${(s1.statuses || []).length} kcal=${s1.kcal} wound=${s1.bloodPriceWound}`);
  // 2. System continuity: no second arrival
  const postDeath = says.slice(sayMark);
  const arrivalHits = postDeath.filter(t => /SYSTEM ARRIV|arrival of the System|first contact|tutorial/i.test(t));
  check('no-second-arrival', !!Game.state.systemArrived && arrivalHits.length === 0,
    `systemArrived=${!!Game.state.systemArrived} arrival-beats=${arrivalHits.length}`);
  const mantleSys = postDeath.filter(t => /MANTLE TRANSFER DETECTED/.test(t));
  rec.systemContinuity = { mantleSys: mantleSys.slice(0, 3) };
  // 3. phantom-name scan: every post-death line mentioning the dead bearer's first name
  const phantom = postDeath.filter(t => t.includes(oldFirst));
  rec.phantomLines = phantom;
  check('phantom-scan-captured', true, `${phantom.length} post-death lines mention "${oldFirst}" (manual review)`);
  // the "you're not her" line must use the LIVE roster only
  const youreNot = postDeath.filter(t => /You're not /.test(t));
  check('youre-not-her-honest', youreNot.length <= 1, youreNot.slice(0, 1).join(' | ').slice(0, 160));

  // 4. the successor's week
  for (let d = 0; d < DAYS2; d++) await runDays(Game, competent, { days: 1 });
  rec.census.post = census(Game, 'SUCCESSOR +8 DAYS');

  // 5. people check: two conversations, transcripts raw
  const trust = Game.state.village.trust || {};
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const byTrust = roster.slice().sort((a, b) => (trust[b] || 0) - (trust[a] || 0));
  if (byTrust[0]) rec.convo.push(driveConvo(Game, byTrust[0], `DAY+8 successor [${newName}] talks to ${rawName(Game, byTrust[0])} (highest trust)`));
  const low = byTrust[byTrust.length - 1];
  if (low && low !== byTrust[0]) rec.convo.push(driveConvo(Game, low, `DAY+8 successor [${newName}] talks to ${rawName(Game, low)} (lowest trust)`));

  // background-ability USE probe: does the successor's own past actually work?
  // pick first granted background id and find a gated action that names it.
  const useProbe = { granted: bg1[0] || null, tried: null, result: null };
  if (bg1[0]) {
    const id = bg1[0];
    try {
      const acts = (Game.actions ? Game.actions() : []) || [];
      const gated = acts.filter(a => JSON.stringify(a).includes(id));
      useProbe.tried = gated.length > 0 ? (gated[0].id || gated[0].label || '?') : '(no gated action surfaced)';
      useProbe.result = gated.length > 0 ? 'surfaced' : 'not-surfaced';
    } catch (e) { useProbe.result = 'probe-threw: ' + e.message; }
  }
  rec.useProbe = useProbe;
  check('background-use-probe', useProbe.result === 'surfaced', `${useProbe.granted} -> ${useProbe.tried}`);
  return rec;
}

async function wipeSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'journey-succession-r10-wipe', fullTelemetry: true });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  await setupGame(Game);
  const rec = { seed, checks: [] };
  const check = (id, ok, detail) => rec.checks.push({ id, ok: !!ok, detail: detail || '' });
  await runDays(Game, competent, { days: 10 });
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  // kill every NPC through the real villager-death path
  for (const vid of roster) {
    try {
      Game.registerDeath({ kind: 'villager', villagerId: vid, name: rawName(Game, vid), cause: 'the famine', killerId: null });
      Game.removeVillager(vid, 'killed');
    } catch (e) {}
  }
  const after = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  check('roster-emptied', after.length === 0, `npc roster=${after.length} (Bearer <redacted> still stands)`);
  let wipeCalled = 0;
  const origWipe = Game.wipe.bind(Game);
  Game.wipe = function () { wipeCalled++; return origWipe(); };
  const sayMark = says.length;
  const bearerName = rawName(Game, Game.villagerId);
  Game.playerDeath('starvation');
  rec.wipeBeat = says.slice(sayMark);
  check('wipe-over', !!Game.over && !!Game.villageLost, `over=${!!Game.over} villageLost=${!!Game.villageLost}`);
  check('wipe-said', says.slice(sayMark).some(t => /No one is left to pick up the Codex/.test(t)), 'beat line fired');
  check('wipe-wiped', wipeCalled >= 1, `wipe() called ${wipeCalled}x`);
  let lin = [];
  try { lin = Game.lineage() || []; } catch (e) {}
  const last = lin[lin.length - 1] || {};
  check('legend-recorded', last.outcome === 'village-lost' && /./.test(last.name || ''),
    `outcome=${last.outcome} name=${last.name}`);
  rec.legend = last;
  rec.bearer = bearerName;
  return rec;
}

(async () => {
  const seeds = parseSeeds();
  for (const seed of seeds) {
    try {
      const rec = seed === 604 ? await wipeSeed(seed) : await playSeed(seed);
      console.error(`\n===== SEED ${seed} =====`);
      if (rec.census) {
        console.error(rec.census.pre);
        console.error('\n--- DEATH BEAT ---');
        for (const t of rec.deathBeat) console.error('  ' + String(t).replace(/\n/g, '\n  '));
        console.error(`\ndeath: ${JSON.stringify(rec.death)}`);
        console.error('\n--- PHANTOM-NAME SCAN (post-death lines mentioning the dead bearer) ---');
        for (const t of rec.phantomLines) console.error('  PHANTOM? ' + String(t).replace(/\n/g, '\n  '));
        console.error('\n--- SYSTEM CONTINUITY ---');
        for (const t of (rec.systemContinuity.mantleSys || [])) console.error('  ' + t);
        console.error('\n' + rec.census.post);
        console.error('\n--- BACKGROUND USE PROBE ---');
        console.error('  ' + JSON.stringify(rec.useProbe));
      } else {
        console.error(`bearer=${rec.bearer}`);
        console.error('--- WIPE BEAT ---');
        for (const t of rec.wipeBeat) console.error('  ' + String(t).replace(/\n/g, '\n  '));
        console.error('legend: ' + JSON.stringify(rec.legend));
      }
      console.error('\n--- CHECKS ---');
      for (const c of rec.checks) console.error(`  [${c.ok ? 'OK' : 'FAIL'}] ${c.id}${c.detail ? ' — ' + c.detail : ''}`);
      for (const c of (rec.convo || [])) console.error('\n' + c);
      console.log(JSON.stringify({ seed, death: rec.death || null, checks: rec.checks.map(c => ({ id: c.id, ok: c.ok })) }));
    } catch (e) {
      console.error(`SEED ${seed} THREW: ${e.stack}`);
      console.log(JSON.stringify({ seed, error: e.message }));
    }
  }
})();
