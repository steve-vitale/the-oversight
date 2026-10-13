#!/usr/bin/env node
// journey-succession-20261013.js — LEG 7 SUCCESSION pilot (village journey sim loop).
// Plays competent runs (seeded) and studies PC death -> mantle pass -> successor life.
// Captures per bearer death: cause, trust transfer, death pack, corpse recovery,
// journal epitaph/welcome lines, promises released, death-beat narration, and
// post-death full conversations with the NEW Bearer <redacted> check, village
// reaction, fabricated-shared-history). Ends with a plain-words census.
// Death-aware horizons: stops at village-lost (+0 tail; the story ended) or DAYCAP.
// Usage: SEEDS=501,602,703,804 DAYCAP=140 node scripts/journey-succession-20261013.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '501,602,703,804').split(',').map(s => parseInt(s, 10));
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);
// STOP_AFTER_DEATH_DAYS: when >0, halt the clock this many days after the FIRST
// bearer death (the village is usually still alive then) so the people check
// runs against a living village. 0 = run to DAYCAP / village-lost.
const STOP_AFTER_DEATH_DAYS = parseInt(process.env.STOP_AFTER_DEATH_DAYS || '0', 10);
const OUTDIR = path.join(ROOT, 'evidence', '2026-10-13');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function firstOf(n) { return String(n || 'someone').split(' ')[0]; }
function corpseOf(Game, oldId) {
  try {
    const cs = (Game.corpses ? Game.corpses() : []) || [];
    return cs.find(c => c && (c.villagerId === oldId || c.name === oldId)) || null;
  } catch (e) { return null; }
}

// natural-path conversation driver (adapted from the social-life leg).
// Full arc: opening -> middles -> natural end or bye, full transcript captured.
function driveConversation(Game, vid, maxTurns) {
  const out = { vid, name: vname(Game, vid), turns: 0, naturalEnd: false, forcedClose: false, transcript: [], offered: [] };
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  const snap = () => { let c = null; try { c = Game.convoGet(vid); } catch (e) {} return c; };
  const EXIT_SIGNAL = /duty calls|good pause|should get back|should be going|i should|let me get back|time to go|see you|good talking/i;
  for (let t = 0; t < (maxTurns || 10); t++) {
    const c = snap();
    if (!c) { out.error = 'convoGet null at turn ' + t; break; }
    if (!c.active) {
      out.naturalEnd = true; out.turns = t;
      out.transcript = (c.transcript || []).map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '').slice(0, 500) }));
      break;
    }
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) {
      out.naturalEnd = true;
      out.transcript = (c.transcript || []).map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '').slice(0, 500) }));
      break;
    }
    out.offered.push(choices.map(x => String((x && x.id) || '')).slice(0, 12));
    const lastNPC = (c.transcript || []).filter(e => e.who !== 'you').slice(-1)[0];
    const byeFirst = lastNPC && EXIT_SIGNAL.test(String(lastNPC.text || ''));
    let pick = byeFirst ? choices.find(x => x && /^(leave|bye|goodbye)/.test(String(x.id || ''))) : null;
    if (!pick) pick = choices.find(x => x && /^gq:/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /^(dlg:help|dlg:details|want:)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /how|feeling|holding|news|day|worried|afraid|hungry|sick|village|everyone/i.test(String(x.text || '')));
    if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) { out.forcedClose = true; break; }
    if (/^(leave|bye|goodbye)/.test(String(pick.id || ''))) out.leftViaBye = true;
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
  }
  if (!out.naturalEnd) {
    const c = snap();
    if (c) out.transcript = (c.transcript || []).map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '').slice(0, 500) }));
    try {
      const choices = Game.convoChoices(vid) || [];
      const bye = choices.find(x => x && /^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (bye) Game.convoTurn(vid, bye.id);
      else Game.endConvo(vid, 'left');
      out.forcedClose = true;
    } catch (e) {}
  }
  return out;
}

async function runSeed(seed) {
  const { Game, loadFails } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  const ev = {
    seed, loadFails: (loadFails || []).length, pdCalls: [], keptLines: [],
    peopleCheck: [], deathBeats: [], census: null, journalMantle: null,
  };

  // --- narration capture: restore say/sysSay through emit.
  // Death-anchored: a small ring always turns; every line emitted within
  // 2 days after any bearer death is KEPT (the death beat, the "you're not
  // her" line, the Codex sync, the village bringing the Bearer <redacted> Everything
  // else is dropped — a rolling full buffer evicted early deaths.
  const origEmit = Game.emit.bind(Game);
  const ring = [];
  Game.emit = function (text, surface) {
    try {
      const s = (this.state || {}).scholar || {};
      const day = s.day || 0;
      const line = { day, surface: surface || 'narration', text: String(text).slice(0, 500) };
      ring.push(line); if (ring.length > 150) ring.shift();
      if (ev.pdCalls.some(d => day >= d.day && day <= d.day + 2)) {
        ev.keptLines.push(line);
        if (ev.keptLines.length > 3000) ev.keptLines.splice(0, 500);
      }
    } catch (e) {}
    return origEmit.call(this, text, surface);
  };
  Game.say = function (m) { return this.emit(m, 'narration'); };
  Game.sysSay = function (m) { return this.emit(m, 'dialogue'); };

  // --- exact death capture: wrap playerDeath (outermost; journal/agency wraps sit inside) ---
  const origPD = Game.playerDeath.bind(Game);
  Game.playerDeath = function (cause) {
    const s = this.state.scholar, v = this.state.village;
    const oldId = this.villagerId;
    const oldName = vname(this, oldId);
    const oldTrust = ((v.trust || {})[oldId]);
    const pr = v.promises || {};
    const promisesOpen = Object.keys(pr).filter(k => { const p = pr[k]; return p && !p.kept; }).length;
    const rec = {
      day: (s || {}).day || 0, oldId, oldName, cause: cause || '?',
      oldTrust: oldTrust == null ? null : oldTrust, promisesOpen,
      rosterSize: (v.roster || []).length, dayPart: this.dayPart,
    };
    ev.pdCalls.push(rec);
    const r = origPD.call(this, cause);
    try {
      rec.newId = this.villagerId; rec.newName = vname(this, this.villagerId);
      rec.newTrust = ((v.trust || {})[rec.newId]);
      const mo = (v.mantleOf || []);
      rec.mantleEntry = mo[mo.length - 1] || null;
      const c = corpseOf(this, oldId);
      rec.corpse = c ? {
        id: c.id, items: (c.items || []).length,
        buried: !!c.buried, recovered: !!c.recovered,
        node: c.node ? { x: c.node.x, y: c.node.y } : null,
        deathKnown: !!c.deathKnown,
      } : null;
      rec.pendingBurials = (v.pendingBurials || []).length;
      let mr = null; try { mr = this.mantleRecord(); } catch (e) {}
      if (mr) {
        const lives = mr.lives || [];
        rec.lives = lives.length;
        const lastLife = lives[lives.length - 1] || null;
        rec.lastLife = lastLife ? { name: lastLife.name, startDay: lastLife.startDay, endDay: lastLife.endDay, cause: lastLife.cause, register: lastLife.register } : null;
        rec.marginaliaCount = (mr.marginalia || []).length;
        rec.lastMarginalia = ((mr.marginalia || []).slice(-2)).map(m => String(m.text || '').slice(0, 300));
      }
      const pr2 = v.promises || {};
      rec.promisesReleased = Object.keys(pr2).filter(k => pr2[k] && pr2[k].kept === 'released' && pr2[k].inherited).length;
      // death-beat lines: the ring holds ~150 lines around the death (the beat
      // itself fired inside origPD, just before this post-recording runs)
      rec.beatLines = ring.slice(-120).map(l => `[d${l.day}] ${l.text}`);
      // scholar state reset checks
      const ns = this.state.scholar || {};
      rec.stateReset = {
        kcal: ns.kcal, health: ns.health, mx: ns.mx, my: ns.my,
        insideHaven: ns.insideHaven, statuses: (ns.statuses || []).length,
        backgroundAbilities: (ns.backgroundAbilities || []).length,
        inventory: (ns.inventory || []).length,
      };
    } catch (e) { rec.postError = e.message; }
    try { console.error(`[seed ${seed}] MANTLE day ${rec.day}: ${firstOf(rec.oldName)} (${rec.cause}) -> ${firstOf(rec.newName)}; trust ${rec.oldTrust}->${rec.newTrust}; promises released ${rec.promisesReleased}`); } catch (e) {}
    return r;
  };

  await setupGame(Game);
  ev.startBearer = vname(Game, Game.villagerId);
  // stop-the-clock N days after the first bearer death (people-check mode):
  // the village is usually still alive, so conversations run as the successor.
  const pol = Object.assign({}, competent, {
    id: 'succession-competent',
    daily(G2, ctx2) {
      if (competent.daily) competent.daily(G2, ctx2);
      if (STOP_AFTER_DEATH_DAYS > 0 && ev.pdCalls.length > 0 && !ev.stoppedEarly) {
        const d0 = ev.pdCalls[0].day;
        const day = ((G2.state || {}).scholar || {}).day || 0;
        if (day >= d0 + STOP_AFTER_DEATH_DAYS) {
          ev.stoppedEarly = true;
          try { console.error(`[seed ${seed}] stopping clock ${STOP_AFTER_DEATH_DAYS}d after first death (day ${day})`); } catch (e) {}
          G2.over = true; // runDays breaks on this; reset to false below — the run isn't over, the clock is
        }
      }
    },
  });
  const res = await runDays(Game, pol, { days: DAYCAP, manifest: null });
  if (ev.stoppedEarly) Game.over = false; // the run lives on; only the clock stopped
  ev.endReason = ev.stoppedEarly ? 'stopped-after-death' : res.endReason;
  ev.days = res.days; ev.gameDays = res.gameDays;
  ev.finalBearer = Game.villageLost ? null : vname(Game, Game.villagerId);
  ev.villageLost = !!Game.villageLost;

  // --- death beats: ring lines captured at each death + kept post-death lines ---
  for (const d of ev.pdCalls) {
    const beats = (d.beatLines || []).filter(t =>
      /dead|died|mantle|you're not|Codex turns|grave|bring .* home|MANTLE TRANSFER|picks up the journal|epitaph|grief|mourning|funeral|bury|MANTLE TRANSFER DETECTED|syncing/i.test(t));
    ev.deathBeats.push({
      day: d.day, oldName: d.oldName, newName: d.newName,
      youreNotHer: beats.some(t => /you're not/i.test(t)),
      mantleTransferSysLine: beats.some(t => /MANTLE TRANSFER DETECTED/i.test(t)),
      lines: beats,
    });
  }
  // post-death kept lines (village brings Bearer <redacted>, grave dug, etc.)
  ev.postDeathLines = ev.keptLines
    .filter(l => /bring .* home|grave is dug|filling of it|MANTLE TRANSFER|mourning|grief/i.test(l.text))
    .map(l => `[d${l.day}] ${l.text}`);

  // --- journal mantle record at end ---
  try {
    const mr = Game.mantleRecord();
    ev.journalMantle = {
      lives: (mr.lives || []).map(l => ({ name: l.name, startDay: l.startDay, endDay: l.endDay, cause: l.cause, register: l.register })),
      marginaliaCount: (mr.marginalia || []).length,
      sampleMarginalia: ((mr.marginalia || []).slice(0, 4)).map(m => ({ by: m.first || m.name, register: m.register, text: String(m.text || '').slice(0, 250) })),
    };
  } catch (e) { ev.journalMantle = { error: e.message }; }

  // --- corpse states at end (recovery/burial/looting) ---
  ev.corpseEndStates = [];
  for (const d of ev.pdCalls) {
    const c = corpseOf(Game, d.oldId);
    ev.corpseEndStates.push({
      oldName: d.oldName, day: d.day,
      state: c ? { items: (c.items || []).length, buried: !!c.buried, recovered: !!c.recovered, looted: !!c.looted } : 'GONE',
    });
  }

  // --- people check: full conversations as the CURRENT Bearer <redacted> deaths happened and village alive) ---
  if (ev.pdCalls.length && !Game.villageLost && !Game.over) {
    const v = Game.state.village || {};
    const trust = v.trust || {};
    const roster = (v.roster || []).filter(id => id !== Game.villagerId);
    const byTrust = roster.slice().sort((a, b) => (trust[b] || 0) - (trust[a] || 0));
    const picks = [];
    if (byTrust[0]) picks.push({ vid: byTrust[0], tag: 'closest-trust' });
    const other = roster.find(id => id !== byTrust[0]);
    if (other) picks.push({ vid: other, tag: 'other-villager' });
    for (const p of picks) {
      const rec = driveConversation(Game, p.vid, 10);
      rec.tag = p.tag; rec.trust = trust[p.vid];
      // fabricated-history scan: dead bearers' names appearing in the new bearer's convo
      const deadNames = ev.pdCalls.map(d => firstOf(d.oldName)).filter(Boolean);
      rec.deadNameMentions = [];
      for (const t of (rec.transcript || [])) {
        for (const dn of deadNames) {
          if (dn.length > 2 && new RegExp('\\b' + dn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(t.text)) {
            rec.deadNameMentions.push({ who: t.who, text: t.text.slice(0, 300) });
          }
        }
      }
      ev.peopleCheck.push(rec);
      try { console.error(`[seed ${seed}] people-check ${p.tag}: ${rec.name}, turns=${rec.turns}, naturalEnd=${rec.naturalEnd}, deadNameMentions=${rec.deadNameMentions.length}`); } catch (e) {}
    }
  }

  // --- census ---
  try {
    const v = Game.state.village || {};
    const s = Game.state.scholar || {};
    const cx = Game.state.codex || {};
    const trust = v.trust || {};
    const roster = (v.roster || []).map(id => {
      let occ = '?';
      try { const p = Game.getPerson ? Game.getPerson(id) : null; occ = (p && (p.occupationId || p.formerOccupation)) || '?'; } catch (e) {}
      return { id: String(id).slice(0, 14), name: firstOf(vname(Game, id)), occ, trust: trust[id] == null ? null : trust[id] };
    });
    const fallen = (v.fallen || []).map(f => ({ name: firstOf(f.name || f.villagerId), day: f.day, cause: f.cause }));
    ev.census = {
      endReason: ev.endReason, gameDays: ev.gameDays,
      alive: roster.length, roster,
      fallen: fallen.length, fallenList: fallen,
      bearerDeaths: ev.pdCalls.length,
      codexBreadth: { plants: Object.keys(cx.plants || {}).length, monsters: Object.keys(cx.monsters || {}).length, skills: Object.keys(cx.skills || {}).length },
      mantleOf: (v.mantleOf || []).map(m => ({ from: firstOf(m.fromName), to: firstOf(m.toName), day: m.day })),
      pantryKcal: (() => { try { return Math.round(((v.pantry || [])).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); } catch (e) { return -1; } })(),
      finalBearer: ev.finalBearer,
    };
  } catch (e) { ev.census = { error: e.message }; }

  const out = path.join(OUTDIR, `journey-succession-seed${seed}.json`);
  fs.writeFileSync(out, JSON.stringify(ev, null, 1));
  try { console.error(`[seed ${seed}] wrote ${out} (${ev.pdCalls.length} bearer deaths, end=${ev.endReason})`); } catch (e) {}
  return ev;
}

(async () => {
  const all = [];
  for (const seed of SEEDS) {
    try { all.push(await runSeed(seed)); }
    catch (e) { try { console.error(`[seed ${seed}] FATAL: ${e.message}`); } catch (e2) {} all.push({ seed, fatal: e.message }); }
  }
  const summary = all.map(a => ({
    seed: a.seed, deaths: (a.pdCalls || []).length, end: a.endReason, gameDays: a.gameDays,
    causes: (a.pdCalls || []).map(d => `d${d.day}:${d.cause}`).join(', '),
    chain: (a.pdCalls || []).map(d => `${firstOf(d.oldName)}->${firstOf(d.newName)}`).join(' | '),
  }));
  fs.writeFileSync(path.join(OUTDIR, 'journey-succession-summary.json'), JSON.stringify(summary, null, 1));
  console.error('SUMMARY: ' + JSON.stringify(summary));
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
