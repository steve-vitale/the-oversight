#!/usr/bin/env node
// journey-succession-r9-20261012.js — SUCCESSION LEG (7) r9: "the week after."
//
// The mantle invariants were proven in r5/r7/r8. This run sense-tests the
// MOURNING PERIOD as lived experience, end to end through the real systems:
//   1. The funeral beat: overnight village recovery (new), then the
//      successor's payRespects + buryCorpse through the real APIs.
//   2. Mourning conversations: full transcripts on days +1/+4/+8 after the
//      death — the r8 firstRef fix, sense-tested in the REAL flow (the unit
//      proof only covered the API). Every mourning line read raw.
//   3. Grief as weather: npcMood + t2LatelyEvent sweeps — does the village
//      actually grieve, or act fine the next morning?
//   4. Double-death chain (seed 501): a second death — do the inherited
//      lines stay honest across two mantles?
//   5. Village assessment: census in plain words; reachable/fun/winnable.
//
// Usage: SEEDS=501-503 node scripts/journey-succession-r9-20261012.js
// Output: one JSON line per seed to stdout; transcripts + census to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const DAYS1 = parseInt(process.env.DAYS1 || '14', 10);
const DAYS2 = parseInt(process.env.DAYS2 || '10', 10);
function parseSeeds() {
  const s = process.env.SEEDS || '501-503';
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
  const lines = [`--- CENSUS (${label}), day ${s.day || 0}, Bearer: ${rawName(Game, Game.villagerId)} ---`];
  for (const vid of (v.roster || [])) {
    const trust = ((v.trust || {})[vid] == null ? '?' : (v.trust[vid]));
    lines.push(`  alive ${rawName(Game, vid)} [${occOf(Game, vid)}] trust=${trust}`);
  }
  const fallen = (v.fallen || []).map(f => `${rawName(Game, f.villagerId) || f.name || '?'} d${f.day} (${f.cause})`);
  lines.push(`  fallen: ${fallen.length ? fallen.join('; ') : 'none'}`);
  lines.push(`  grief=${v.grief || 0} cheer=${v.cheer || 0} pendingBurials=${JSON.stringify(v.pendingBurials || [])}`);
  lines.push(`  codex: ${Object.keys((Game.state.codex || {}).plants || {}).length} plants, ` +
    `${Object.keys((Game.state.codex || {}).skills || {}).length} skills`);
  lines.push(`  pantry: ${Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)))} kcal`);
  return lines.join('\n');
}

// grief-seeking conversation driver: chase mourning/grief topics first,
// then the natural path. Full transcript returned.
function driveGriefConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 10;
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

function latelySweep(Game) {
  const out = [];
  for (const vid of ((Game.state.village || {}).roster || [])) {
    if (vid === Game.villagerId) continue;
    let ev = null, mood = '?';
    try { ev = Game.t2LatelyEvent(vid); } catch (e) { ev = { kind: 'threw' }; }
    try { mood = Game.npcMood(vid); } catch (e) {}
    out.push(`${rawName(Game, vid)}: mood=${mood} lately=${ev ? ev.kind : 'none'}${ev && ev.name ? ' name=' + JSON.stringify(ev.name) : ''}`);
  }
  return out;
}

async function playSeed(seed, doubleDeath) {
  const { Game } = await loadGame({ seed, mode: 'journey-succession-r9', fullTelemetry: true });
  const says = [];
  Game.say = (t) => { says.push(String(t)); };
  Game.sysSay = (t) => { says.push(String(t)); };
  await setupGame(Game);
  const rec = { seed, checks: [], convo: [], mourningLines: [], census: {} };
  const check = (id, ok, detail) => rec.checks.push({ id, ok: !!ok, detail: detail || '' });

  await runDays(Game, competent, { days: DAYS1 });
  rec.census.pre = census(Game, 'BEFORE DEATH');
  const s0 = Game.state.scholar;
  const oldId = Game.villagerId;
  const oldName = rawName(Game, oldId);
  const deathDay = s0.day || 0;
  const sayMark = says.length;
  Game.playerDeath('the hunt');
  rec.census.deathBeat = says.slice(sayMark);
  const afterDeathMark = says.length;
  const s1 = Game.state.scholar;
  const newId = Game.villagerId;
  const newName = rawName(Game, newId);
  rec.death = { day: deathDay, oldBearer: oldName, newBearer: newName, over: !!Game.over };
  check('mantle-passes', !Game.over && newId !== oldId, '');

  // the funeral: give the village its overnight recovery FIRST (the grave
  // is dug by the fire), then the successor performs the rites — the
  // filling of the grave is theirs.
  await runDays(Game, competent, { days: 2 });
  const corpse = (Game.corpses() || []).find(c => c.villagerId === oldId);
  check('recovery-fired', !!corpse && corpse.recovered === true, corpse ? `recovered=${corpse.recovered} node=${JSON.stringify(corpse.node)}` : 'no corpse');
  rec.recoveryBeat = says.slice(afterDeathMark);
  const funMark = says.length;
  let prOk = false, brOk = false;
  try { prOk = Game.payRespects(corpse.id) === true; } catch (e) {}
  try { brOk = Game.buryCorpse(corpse.id) === true; } catch (e) {}
  rec.funeral = says.slice(funMark);
  check('funeral-fires', prOk && brOk && corpse.buried === true, `respects=${prOk} buried=${brOk}`);

  // the week after: conversations on +1/+4/+8, sweeps each time
  const convoDays = [1, 4, 8];
  for (let d = 0; d < DAYS2; d++) {
    await runDays(Game, competent, { days: 1 });
    const since = (Game.state.scholar.day || 0) - deathDay;
    if (convoDays.includes(since)) {
      rec.convo.push(`### LATELY SWEEP day+${since}\n` + latelySweep(Game).join('\n'));
      const trust = Game.state.village.trust || {};
      const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
      const byTrust = roster.slice().sort((a, b) => (trust[b] || 0) - (trust[a] || 0));
      if (byTrust[0]) rec.convo.push(driveGriefConvo(Game, byTrust[0], `DAY+${since} successor talks to ${rawName(Game, byTrust[0])} (highest trust)`));
      if (since === 4 && byTrust[byTrust.length - 1]) rec.convo.push(driveGriefConvo(Game, byTrust[byTrust.length - 1], `DAY+${since} successor talks to ${rawName(Game, byTrust[byTrust.length - 1])} (lowest trust)`));
    }
  }
  rec.census.post = census(Game, 'SUCCESSOR +10 DAYS');

  // collect mourning lines + the single-letter-collapse guard
  const allText = rec.convo.join('\n');
  const mournHits = allText.split('\n').filter(l => /Since .* died|is gone and the world|expecting to see .* at the fire|extra portion|doesn't schedule/i.test(l));
  rec.mourningLines = mournHits;
  check('mourning-surfaces', mournHits.length > 0, `${mournHits.length} mourning lines`);
  const collapsed = mournHits.filter(l => /\bSince A died\b/.test(l));
  check('no-single-letter-collapse', collapsed.length === 0, collapsed.join(' | ').slice(0, 200));
  const unnamed = mournHits.filter(l => /Since someone died|Since  died/.test(l));
  check('mourning-names-someone', unnamed.length === 0, unnamed.join(' | ').slice(0, 200));

  // double-death chain (seed 501): a second death, then one more conversation
  if (doubleDeath && !Game.over) {
    const sN = Game.state.scholar;
    const oldId2 = Game.villagerId, oldName2 = rawName(Game, oldId2);
    const ddMark = says.length;
    Game.playerDeath('a boar');
    rec.doubleDeath = { beat: says.slice(ddMark), oldBearer: oldName2, newBearer: rawName(Game, Game.villagerId) };
    await runDays(Game, competent, { days: 2 });
    const trust = Game.state.village.trust || {};
    const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
    const byTrust = roster.slice().sort((a, b) => (trust[b] || 0) - (trust[a] || 0));
    if (byTrust[0]) rec.convo.push(driveGriefConvo(Game, byTrust[0], `AFTER SECOND DEATH — successor talks to ${rawName(Game, byTrust[0])}`));
    const mantleOf = (Game.state.village.mantleOf || []);
    check('mantle-chain-2', mantleOf.length >= 2, `mantleOf=${mantleOf.length}`);
    rec.census.doubleDeath = census(Game, 'AFTER SECOND DEATH');
  }
  return rec;
}

(async () => {
  const seeds = parseSeeds();
  for (const seed of seeds) {
    try {
      const rec = await playSeed(seed, seed === 501);
      console.error(`\n===== SEED ${seed} =====`);
      console.error(rec.census.pre);
      console.error('\n--- DEATH BEAT ---');
      for (const t of rec.census.deathBeat) console.error('  ' + String(t).replace(/\n/g, '\n  '));
      console.error('\n--- RECOVERY (overnight) ---');
      for (const t of (rec.recoveryBeat || [])) console.error('  ' + String(t).replace(/\n/g, '\n  '));
      console.error('\n--- FUNERAL ---');
      for (const t of rec.funeral) console.error('  ' + String(t).replace(/\n/g, '\n  '));
      console.error('\n' + rec.census.post);
      if (rec.census.doubleDeath) {
        console.error('\n--- SECOND DEATH BEAT ---');
        for (const t of rec.doubleDeath.beat) console.error('  ' + String(t).replace(/\n/g, '\n  '));
        console.error('\n' + rec.census.doubleDeath);
      }
      console.error('\n--- MOURNING LINES (raw) ---');
      for (const l of rec.mourningLines) console.error('  ' + l);
      console.error('\n--- CHECKS ---');
      for (const c of rec.checks) console.error(`  [${c.ok ? 'OK' : 'FAIL'}] ${c.id}${c.detail ? ' — ' + c.detail : ''}`);
      for (const c of rec.convo) { console.error('\n' + c); }
      console.log(JSON.stringify({
        seed, death: rec.death, mourningLineCount: rec.mourningLines.length,
        checks: rec.checks.map(c => ({ id: c.id, ok: c.ok })),
        doubleDeath: rec.doubleDeath ? { old: rec.doubleDeath.oldBearer, new: rec.doubleDeath.newBearer } : null,
      }));
    } catch (e) {
      console.error(`SEED ${seed} THREW: ${e.stack}`);
      console.log(JSON.stringify({ seed, error: e.message }));
    }
  }
})();
