#!/usr/bin/env node
// diag-succession-r22-20261017.js — SUCCESSION LEG r22: WHO GETS THE DEAD BEARER'S STUFF?
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life — and the death pack. Pre-registered per MEASUREMENT.md §§9-12, 14.
//
// LEG QUESTION: when the mantle passes, the dead bearer's gear rides home on
// the corpse (death pack; loot-as-action, nothing auto-transfers — Steve
// 2026-10-09). Across the successor's first 26 days, what happens to the pack,
// and does the village treat the successor's handling of it as grave-robbing,
// inheritance, or nothing at all?
//
// PRIOR ART: r20 (forced mantle, bearer-name fix), r21 (double mantle, the
// "You're not X" beat closed, 7588ec23). Both covered identity/mourning/trust.
// Neither touched the death-pack economy: who takes the gear, what it costs,
// what the village says about it.
//
// INTERESTING FINDING CRITERIA:
//   (a) the successor batch-loots the predecessor's pack and the documented
//       costs (trauma via _corpseFirstTouch, loot_corpse witness ripple,
//       gossip) DON'T fire — blank: the heaviest cost in the corpse system
//       is silent on the one corpse that matters most;
//   (b) on control seeds the unlooted pack is buried with the body (items
//       destroyed, buried=true) with zero village acknowledgment — a quiet
//       economy sink + narrative blank (nobody claims the old bearer's bow);
//   (c) the cost fires but no transcript ever names it — trauma without
//       meaning (SENSE-TESTING violation: cost without fiction);
//   (d) anything sensical the village does with the pack that the design never
//       named — a discovered behavior worth naming.
//
// SEEDS: 4101, 4102 = LOOT condition (successor walks to the body and
//        batch-loots the pack d15);
//        4103, 4104 = CONTROL (the successor walks to the grave and buries
//        the bearer <redacted> d16 — "the filling of it is yours"; the pack goes
//        into the ground with them. Policy looting of the dead bearer's corpse
//        suppressed by pilot wrapper so the fate is the burial's).
// POLICY: competent. HORIZON: kill at day 14, play successor to day 40.
// Death-aware: village dead/scattered -> stop.
// PRIMARY METRICS (binding, §14):
//   M1: >=3/4 seeds — mantle passes cleanly AND the death pack exists (>=1
//       item) AND rides home (recovered=true overnight).
//   M2 (loot seeds, binding on the MECHANISM not the fiction): on BOTH loot
//       seeds, batch-looting the predecessor's pack fires the documented cost
//       (>=1 of: trauma gain, loot_corpse witness ripple / rep movement on the
//       successor, a gossip entry about the taking). 0/2 -> blank confirmed.
//   M3 (control seeds): the burial's fate is enumerated — pack items buried
//       with the body (inaccessible thereafter), and whether any burial
//       narration names the gear going into the ground.
//   M4 (people check): >=2/4 seeds — a full transcript around the death-pack
//       decision meets the quality bar (the NPC wants something; options
//       engage or deflect it; endings resolve/plant/owe).
// KILL RULE: mantle fails to pass (no successor / over / softlock) on >=2/4
// seeds -> SUBSTRATE-MISSING; document and move on.
//
// Usage: SEED=4101 LOOT=1 node scripts/diag-succession-r22-20261017.js
//        SEED=4103 LOOT=0 node scripts/diag-succession-r22-20261017.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '4101', 10);
const LOOT = process.env.LOOT === '1';
const KILL_DAY = 14, LOOT_DAY = 15, END_DAY = 40;

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function trustOf(Game, vid) { try { return (Game.state.village.trust || {})[vid]; } catch (e) { return undefined; } }
function traumaOf(Game) { try { return Game.state.scholar.trauma || 0; } catch (e) { return 0; } }
function repOf(Game, vid) {
  try { return typeof Game.repOf === 'function' ? Game.repOf(vid) : null; } catch (e) { return null; }
}
function census(Game, label) {
  const v = Game.state.village || {};
  const lines = [`--- CENSUS (${label}), day ${dayOf(Game)}, Bearer: ${firstName(rawName(Game, Game.villagerId))} ---`];
  lines.push(`  roster: ${((v.roster || []).length)} living | pantry: ${pantryKcal(Game).toLocaleString()} kcal | trauma: ${traumaOf(Game)}`);
  const fallen = (v.fallen || []).slice(-6).map(f => `${firstName(f.name || '?')} d${f.day} (${f.cause})`);
  lines.push(`  fallen (recent): ${fallen.length ? fallen.join('; ') : 'none'}`);
  return lines.join('\n');
}
function pantryKcal(Game) {
  const v = Game.state.village || {};
  return Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)));
}
function lineageDump(Game) {
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  return lin.map((e, i) => `  #${i} ${e.name || '?'} d${e.day || '?'} cause=${e.cause || e.outcome || '?'}`).join('\n') || '  (empty)';
}
function packState(Game, oldId) {
  const c = (Game.state.corpses || []).find(x => x && x.villagerId === oldId);
  if (!c) return { found: false };
  const items = (c.items || []).filter(i => i && (i.units == null ? 1 : i.units) > 0);
  return {
    found: true, id: c.id, buried: !!c.buried, looted: !!c.looted, recovered: !!c.recovered,
    stage: (function () { try { return Game.corpseStageInfo(c).id; } catch (e) { return '?'; } })(),
    items: items.map(i => ({ name: i.name || i.itemId, units: i.units || 1 })),
  };
}
function gossipAbout(Game, rx) {
  const out = [];
  try {
    const g = Game.state.gossip || Game.state.village.gossip || [];
    for (const e of (Array.isArray(g) ? g : Object.values(g))) {
      const t = String((e && (e.text || e.summary || e.kind)) || '');
      if (rx.test(t)) out.push(t.slice(0, 200));
    }
  } catch (e) {}
  return out;
}

// Conversation driver: mourning lives in ask:lately; we want the pack too.
function driveConvo(Game, vid, tag, deadFirst, maxTurns) {
  maxTurns = maxTurns || 12;
  const out = [`## ${tag} — bearer <redacted> to ${firstName(rawName(Game, vid))}`];
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', flags: {} }; }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => c.id === 't2:lately');
    if (!pick && t < 3) pick = choices.find(c => c.id === 'dlg:subject');
    if (!pick) pick = choices.find(c => /died|dead|mourn|burial|buried|grave|gone|mantle|belongings|gear|took|taking|pack/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => /^want:/.test(c.id));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 100)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 400)}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  const full = [];
  for (const e of ((c && c.transcript) || [])) full.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  out.push('\n### FULL TRANSCRIPT');
  out.push(full.join('\n'));
  const txt = full.join('\n');
  const df = deadFirst || '';
  const flags = {
    mournCarry: /(died|dead|buried|funeral|mourn|since .* died|rest .* soul|gone)/i.test(txt),
    namedMourn: df ? new RegExp('\\b' + df + '\\b', 'i').test(txt) : false,
    packMention: /(gear|belongings|pack|took .* from|stripped|pockets|inherit|his bow|her knife|their things)/i.test(txt),
    want: (c && c.want && (c.want.id || c.want.hook)) || 'none',
  };
  out.push(`\nCARRY-FLAGS: mourn=${flags.mournCarry} namedMourn=${flags.namedMourn} packMention=${flags.packMention} want=${flags.want}`);
  return { text: out.join('\n'), flags };
}

const rec = {
  seed: SEED, loot: LOOT, notes: [], anomalies: [],
  mantle: {}, lootEvent: null, packD40: null, convos: [], sayLines: [],
  m1: null, m2: null, m3: null, m4: null,
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r22', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;

  const _say = Game.say;
  Game.say = function (t) {
    const s = String(t || '');
    if (/🕯️|mantle|You're not|Codex|journal|buried|grave|digging|picks up|syncing|keep writing|died|dead|trauma|Taken:|stripped|pockets|village watches|Theirs\. Take it/i.test(s))
      rec.sayLines.push({ day: dayOf(Game), text: s.slice(0, 300) });
    return _say ? _say.call(this, t) : undefined;
  };

  // ---- phase 1: establish ----
  await runDays(Game, competent, { days: KILL_DAY });
  if (Game.over) { rec.notes.push('village over before kill — seed skipped'); console.log(JSON.stringify(rec)); return; }
  E(census(Game, 'pre-death'));

  // ---- the kill ----
  const oldId = Game.villagerId;
  const oldFirst = firstName(rawName(Game, oldId));
  const oldTrust = trustOf(Game, oldId);
  Game.playerDeath('the expedition');
  const newId = Game.villagerId;
  const newFirst = firstName(rawName(Game, newId));
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  let deadCorpse = (Game.state.corpses || []).find(c => c && c.villagerId === oldId);
  const packAtDeath = deadCorpse ? (deadCorpse.items || []).filter(i => i && (i.units == null ? 1 : i.units) > 0).length : 0;
  rec.mantle = {
    passed: newId !== oldId && !Game.over,
    oldFirst, newFirst, oldTrust, newTrustAtPass: trustOf(Game, newId),
    lineageEntry: !!(lastLin.cause && !lastLin.outcome && lastLin.villagerId === oldId),
    corpseFound: !!deadCorpse, packItems: packAtDeath,
  };
  E(`MANTLE: ${oldFirst} -> ${newFirst} | passed=${rec.mantle.passed} pack=${packAtDeath} corpse=${rec.mantle.corpseFound}`);
  E(`LINEAGE:\n${lineageDump(Game)}`);

  // CONTROL: suppress policy looting of the dead bearer's corpse only.
  // (pilot-only runtime guard; game code untouched)
  let deadCorpseId = deadCorpse ? deadCorpse.id : null;
  if (!LOOT && deadCorpseId) {
    const wrap = (fnName) => {
      const orig = Game[fnName];
      if (typeof orig !== 'function') return;
      Game[fnName] = function (cid, ...rest) {
        if (cid === deadCorpseId) {
          if (fnName === 'corpseLootAll') return { taken: [], left: [], skipped: 0, looted: false };
          return null;
        }
        return orig.call(this, cid, ...rest);
      };
    };
    ['corpseLootAll', 'corpseTakeItem', 'corpseUseItem', 'corpseEatItem'].forEach(wrap);
    rec.notes.push(`control: policy looting suppressed for corpse ${deadCorpseId}`);
  }

  // ---- phase 2: overnight recovery, then the pack decision ----
  await runDays(Game, competent, { days: 1 }); // to day 15; recoverBearer fires overnight
  if (Game.over) { rec.notes.push('village over before loot day — scored on mantle only'); console.log(JSON.stringify(rec)); return; }
  deadCorpse = (Game.state.corpses || []).find(c => c && c.villagerId === oldId);
  if (deadCorpse) deadCorpseId = deadCorpse.id;
  const ps15 = packState(Game, oldId);
  E(`PACK d15 (post-recovery): recovered=${ps15.recovered} stage=${ps15.stage} items=${(ps15.items || []).length}`);
  if ((ps15.items || []).length) E('  items: ' + ps15.items.map(i => `${i.name} x${i.units}`).join(', '));

  if (LOOT && deadCorpse && !deadCorpse.buried) {
    // WALK TO THE BODY: a competent player walks to the corpse by the fire.
    // (pilot-only positioning; the verb's range check is the game's own)
    try { Game.state.scholar.mx = deadCorpse.mx; Game.state.scholar.my = deadCorpse.my; } catch (e) {}
    const traumaBefore = traumaOf(Game);
    const trustBefore = trustOf(Game, newId);
    const repBefore = repOf(Game, newId);
    const gossipBefore = gossipAbout(Game, /loot|pocket|corpse|stripped|took/i).length;
    let lootRes = null;
    try { lootRes = Game.corpseLootAll(deadCorpse.id, (it) => it.plantId === 'meat_human'); } catch (e) { rec.anomalies.push('corpseLootAll threw: ' + e.message); }
    const traumaAfter = traumaOf(Game);
    const trustAfter = trustOf(Game, newId);
    const repAfter = repOf(Game, newId);
    const gossipAfter = gossipAbout(Game, /loot|pocket|corpse|stripped|took/i);
    rec.lootEvent = {
      taken: (lootRes && lootRes.taken || []).map(t => `${t.name} x${t.units}`),
      left: (lootRes && lootRes.left || []).map(t => `${t.name} x${t.units}`),
      traumaBefore, traumaAfter, traumaDelta: traumaAfter - traumaBefore,
      trustBefore, trustAfter,
      repBefore: repBefore ? { honest: repBefore.honest, generous: repBefore.generous, brave: repBefore.brave } : null,
      repAfter: repAfter ? { honest: repAfter.honest, generous: repAfter.generous, brave: repAfter.brave } : null,
      gossipDelta: gossipAfter.length - gossipBefore,
      gossipNew: gossipAfter.slice(gossipBefore),
      costFired: (traumaAfter - traumaBefore) > 0 || (gossipAfter.length - gossipBefore) > 0,
    };
    E(`LOOT: took ${(rec.lootEvent.taken || []).length} stacks | trauma ${traumaBefore}->${traumaAfter} | trust ${trustBefore}->${trustAfter} | gossip +${rec.lootEvent.gossipDelta}`);
    if (rec.lootEvent.gossipNew.length) E('  gossip: ' + rec.lootEvent.gossipNew.join(' / '));
  } else if (LOOT) {
    rec.anomalies.push('loot seed but corpse missing/buried at d15 — could not loot');
  }

  // ---- mourning convo inside the mantle-memory window ----
  if (!Game.over) {
    const vd = Game.state.village || {};
    const trust = (vd.trust || {});
    const mourner = (vd.roster || []).filter(id => id !== Game.villagerId)
      .sort((a, b) => (trust[b] || 0) - (trust[a] || 0))[0];
    if (mourner) {
      const dc = driveConvo(Game, mourner, `mourner-d${dayOf(Game)}`, oldFirst);
      rec.convos.push(Object.assign({ day: dayOf(Game), partner: firstName(rawName(Game, mourner)) }, dc));
      E(dc.text.split('\n### FULL TRANSCRIPT')[0]);
    }
  }

  // CONTROL: the successor does their duty — walk to the grave and fill it.
  // (buryCorpse is the player-facing verb; the fiction says "the filling of
  // it is yours".) Records whether the burial names the gear going into the
  // ground with the body.
  if (!LOOT && !Game.over) {
    deadCorpse = (Game.state.corpses || []).find(c => c && c.villagerId === oldId);
    if (deadCorpse && !deadCorpse.buried) {
      try { Game.state.scholar.mx = deadCorpse.mx; Game.state.scholar.my = deadCorpse.my; } catch (e) {}
      const traumaBefore = traumaOf(Game);
      const sayBefore = rec.sayLines.length;
      let buriedOk = null;
      try { buriedOk = Game.buryCorpse(deadCorpse.id); } catch (e) { rec.anomalies.push('buryCorpse threw: ' + e.message); }
      const burialSay = rec.sayLines.slice(sayBefore).map(l => l.text);
      rec.burial = {
        ok: !!buriedOk, traumaBefore, traumaAfter: traumaOf(Game),
        packItemsBuried: (deadCorpse.items || []).filter(i => i && (i.units == null ? 1 : i.units) > 0).map(i => i.name || i.itemId),
        burialSay,
        gearNamed: burialSay.some(t => /vine|fan care|stone knife|gear|belongings|pack/i.test(t)),
      };
      E(`BURIAL: ok=${rec.burial.ok} trauma ${traumaBefore}->${rec.burial.traumaAfter} gearNamed=${rec.burial.gearNamed}`);
      if (burialSay.length) E('  say: ' + burialSay.join(' / ').slice(0, 300));
    } else {
      rec.anomalies.push('control: corpse missing/already buried at burial time');
    }
  }

  // ---- phase 3: successor lives to day 40 ----
  for (let i = 0; i < 30 && !Game.over && dayOf(Game) < END_DAY; i++) await runDays(Game, competent, { days: 1 });
  E(census(Game, 'end (day ~40)'));
  rec.packD40 = packState(Game, oldId);
  E(`PACK d40: found=${rec.packD40.found} buried=${rec.packD40.buried} stage=${rec.packD40.stage} items=${((rec.packD40.items || []).length)}`);
  if ((rec.packD40.items || []).length) E('  remaining: ' + rec.packD40.items.map(i => `${i.name} x${i.units}`).join(', '));
  // where did the taken items go? (loot seeds)
  if (LOOT && rec.lootEvent) {
    const inv = ((Game.state.scholar || {}).inventory || []).map(i => i.name || i.itemId);
    const stillHeld = (rec.lootEvent.taken || []).filter(t => inv.some(n => t.startsWith(String(n).slice(0, 12))));
    rec.lootEvent.stillHeldD40 = stillHeld.length;
    E(`  taken items still in successor inventory at d40: ${stillHeld.length}/${rec.lootEvent.taken.length}`);
  }

  // ---- metric roll-up ----
  rec.m1 = rec.mantle.passed && rec.mantle.packItems >= 1 && !!(deadCorpse && deadCorpse.recovered);
  if (LOOT) rec.m2 = !!(rec.lootEvent && rec.lootEvent.costFired);
  else rec.m3 = rec.burial ? { buried: rec.burial.ok, gearNamed: rec.burial.gearNamed, items: rec.burial.packItemsBuried } : null;
  const quals = rec.convos.map(c => c.flags);
  rec.m4 = quals.filter(f => f && (f.mournCarry || f.packMention) && f.want !== 'none').length;

  const outPath = path.join(ROOT, 'evidence', '2026-10-17', `journey-succession-r22-${SEED}.json`);
  try { fs.writeFileSync(outPath, JSON.stringify(rec, null, 2)); E(`wrote ${outPath}`); } catch (e) { E('write failed: ' + e.message); }
  console.log(JSON.stringify({ seed: SEED, loot: LOOT, m1: rec.m1, m2: rec.m2, m3: rec.m3, m4: rec.m4, notes: rec.notes, anomalies: rec.anomalies }));
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
