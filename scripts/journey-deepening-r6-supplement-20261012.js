#!/usr/bin/env node
// journey-deepening-r6-supplement-20261012.js — R6 extra telemetry on the same
// 6 seeds (10101,20202,30303,40404,50505,60606), DAYCAP 110, competent policy.
//
// R6 collects BEYOND the r5 harness (which ran these seeds already on current
// master):
//   1. Knowledge economy: per survivor plants (count + familiar/taught/bg
//      breakdown), player-taught diffs (day 40 -> end), beasttrick reveals.
//   2. Contests: fired during days 40-110 (start/end logged off
//      state.activeContest), played vs watched, stranded detection.
//   3. Favor directions: VERBATIM raw THEM text of 10+ favor ASK
//      conversations per run (no analysis — dump only).
//   4. Day-45 full conversation transcript per run.
//
// Read-only vs game code: runs sims, writes evidence JSONs only. Never edits
// game files, never commits.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [10101, 20202, 30303, 40404, 50505, 60606]);
const DAYCAP = parseInt(process.env.DAYCAP || '110', 10);
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-12');

const { loadGame, setupGame, runDays, manifest } = require('./sim-harness');
const { competent } = require('./policies/competent');

let G = null;
function gday() { try { return (G.state && G.state.scholar && G.state.scholar.day) || 0; } catch (e) { return 0; } }
function vname(vid) { try { return G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return G.getPerson(vid) || {}; } catch (e) { return {}; } }
function aliveRoster() {
  try { return ((G.state.village || {}).roster || []).filter(id => { try { return !person(id).dead; } catch (e) { return false; } }); }
  catch (e) { return []; }
}
function inFight() { try { const f = G.tbfight; return !!(f && !f.over); } catch (e) { return false; } }

// ---- knowledge snapshot ----
function knowledgeSnapshot() {
  const v = G.state.village || {};
  const out = [];
  for (const vid of ((v.roster || []))) {
    const p = person(vid);
    let known = [];
    try { known = G.plantsKnownBy(vid) || []; } catch (e) {}
    const fam = ((v.familiar || {})[vid] || []).length;
    const taught = ((v.taught || {})[vid] || []).length;
    const tbp = ((v.taughtByPlayer || {})[vid] || []);
    const bg = ((v.plantKnowledge || {})[vid] || []).length;
    const trust = ((v.trust || {})[vid] !== undefined) ? v.trust[vid] : null;
    out.push({
      vid, name: vname(vid), alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      plantsKnown: known.length, familiar: fam, taughtInRun: taught,
      background: bg, taughtByPlayer: tbp.slice(), trust,
    });
  }
  // player codex levels
  let codexLevels = {};
  try {
    const cp = (G.state.codex || {}).plants || {};
    for (const pid of Object.keys(cp)) {
      const lvl = (cp[pid] && cp[pid].level) || 0;
      codexLevels[lvl] = (codexLevels[lvl] || 0) + 1;
    }
  } catch (e) {}
  return { day: gday(), villagers: out, playerCodexLevels: codexLevels };
}

// ---- conversation driver (engage-first, favor-biased) ----
const ENGAGE = ['alive:want:ask_favor', 'dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy', 'agency:ask_field', 'alive:want:share_news'];
function pickChoice(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 5) return react;
  return list.find(x => x && x.id === 'leave') || null;
}

function runConversation(vid, maxTurns, savePath) {
  const L = [];
  const log = (s) => L.push(s);
  let themLines = [];
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = G.startConvo(vid);
    const c = G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== conversation with ${nm} (${vid}) day ${gday()} ===`);
    log(`occupation=${p.formerOccupation || p.occupation || '?'} trust=${((G.state.village.trust || {})[vid] ?? '?')}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0})`);
    log(`THEM: ${r0.line || '(no line)'}`);
    if (r0.line) themLines.push(String(r0.line));
    let r = r0;
    for (let turn = 0; turn < maxTurns; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = G.convoChoices(vid); } catch (e) { choices = []; } }
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = G.convoTurn(vid, pick.id);
      if (r.line) { log(`THEM: ${r.line}`); themLines.push(String(r.line)); }
      if (r.ended) { log('(ended by engine)'); break; }
    }
    try { const endR = G.endConvo(vid, 'done'); if (endR && endR.line) { log(`closing: ${endR.line}`); themLines.push(String(endR.line)); } } catch (e) {}
    const c2 = G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`want final: id=${w2.id || 'none'} resolution=${w2.resolution || 'none'}`);
  } catch (e) { log('CONVO ERROR: ' + (e && e.message)); }
  if (savePath) { try { fs.writeFileSync(savePath, L.join('\n')); } catch (e) {} }
  return { themLines, wantId: null };
}

function openingWant(vid) {
  try { const c = G.convoGet(vid); return (c && c.want) || {}; } catch (e) { return {}; }
}

// ---- contest instruments: wrap the fire/end chokes directly ----
// Anatomy (contests.js): fireContest = ANNOUNCEMENT (1-day countdown via
// state.pendingContest; grab the next dawn in resolveContest, then phases).
// fireShow / fireRatingsSummons set state.activeContest immediately.
// Ends: _contestEnd / _contestDie / _contestRefuse (contests),
// _showEnd / _showVillagerEnd (shows/summons).
// (Earlier polling of state.activeContest missed everything: announcement
// and grab+phases all run inside single driveContests calls.)
function playerInIds(ids) {
  try {
    const vid = String(G.villagerId);
    const parts = (ids || []).map(x => String(x));
    return parts.indexOf(vid) >= 0 || parts.indexOf('player') >= 0;
  } catch (e) { return false; }
}
function acPlayed(ac) {
  try { return !!(ac && ((ac.phases || []).length || (ac.phase && ac.phase !== 'intro'))); }
  catch (e) { return false; }
}
function instrumentContests(supp) {
  const openRec = (kind) => {
    const kinds = kind === 'show' ? ['show', 'summons'] : [kind];
    for (let i = supp.contestLog.length - 1; i >= 0; i--) {
      const r = supp.contestLog[i];
      if (r.dayEnd == null && r.started && kinds.indexOf(r.started.kind) >= 0) return r;
    }
    return null;
  };
  const logStart = (started, via) => {
    try { supp.contestLog.push({ dayStart: gday(), via, started, dayEnd: null, outcome: null }); } catch (e) {}
  };
  const logEnd = (kind, ac, via) => {
    try {
      const rec = openRec(kind);
      const note = via + '(' + (ac && ac.phase ? String(ac.phase).slice(0, 30) : '?') + ')';
      if (rec) { rec.dayEnd = gday(); rec.played = acPlayed(ac); rec.outcome = note; }
      else supp.contestLog.push({ dayStart: gday(), via: via + '-end-only', started: null, dayEnd: gday(), outcome: note, played: acPlayed(ac), orphanId: (ac && (ac.contestId || ac.showId)) || null });
    } catch (e) {}
  };
  const wrap = (name, fn) => {
    try {
      const orig = G[name];
      if (typeof orig !== 'function' || orig._r6wrapped) return;
      const w = function (...a) {
        let r;
        try { r = orig.apply(this, a); } catch (e) { r = undefined; }
        try { fn(a, r); } catch (e) {}
        return r;
      };
      w._r6wrapped = true;
      G[name] = w;
    } catch (e) {}
  };
  // announcements
  wrap('fireContest', (a) => {
    let pc = null;
    try { pc = G.state.pendingContest || null; } catch (e) {}
    const arg = (a && a[0]) || {};
    logStart({
      kind: 'contest', id: (pc && pc.contestId) || arg.id || '?',
      name: arg.name || '?', variant: (pc && pc.variant) || arg.variant || null,
      pilot: !!(pc && pc.pilot), firesDay: (pc && pc.firesDay) || null,
      participants: ((pc && pc.participants) || []).slice(),
      playerIn: playerInIds((pc && pc.participants) || []),
    }, 'fireContest(announce)');
  });
  wrap('fireShow', () => {
    let ac = null;
    try { ac = G.state.activeContest; } catch (e) {}
    if (!ac) return;
    const p = ac.participant;
    logStart({ kind: 'show', id: ac.showId || '?', name: ac.showName || '?', participant: p, playerIn: p === 'player' || String(p) === String(G.villagerId) }, 'fireShow');
  });
  wrap('fireRatingsSummons', () => {
    let ac = null;
    try { ac = G.state.activeContest; } catch (e) {}
    if (!ac) return;
    logStart({ kind: 'summons', id: 'ratings_summons', name: 'ratings summons', playerIn: true }, 'fireRatingsSummons');
  });
  // grab path: merge into the announcement record (fireContest announces a day
  // earlier; the grab is the same contest). Only creates a record if no
  // announcement was ever seen (genuine announcement-less grab).
  wrap('contestInterruption', (a) => {
    const contest = (a && a[0]) || {};
    const ids = (a && a[1]) || [];
    const rec = openRec('contest');
    if (rec && rec.started && (rec.started.id === (contest.id || '?') || rec.started.id === '?')) {
      rec.grabDay = gday();
      rec.grabParticipants = ids.slice();
      rec.grabPlayerIn = playerInIds(ids);
    } else {
      logStart({ kind: 'contest', id: contest.id || '?', name: contest.name || '?', participants: ids.slice(), playerIn: playerInIds(ids), grabOnly: true }, 'contestInterruption(grab-no-announce)');
    }
  });
  // ends
  wrap('_contestEnd', (a) => logEnd('contest', a[0], '_contestEnd'));
  wrap('_contestDie', (a) => logEnd('contest', a[0], '_contestDie'));
  wrap('_contestRefuse', (a) => logEnd('contest', a[0], '_contestRefuse'));
  wrap('_showEnd', (a) => logEnd('show', a[0], '_showEnd'));
  wrap('_showVillagerEnd', (a) => logEnd('show', a[0], '_showVillagerEnd'));
}

// runDays creates ctx internally; capture it by wrapping setup.
async function main() {
  for (const seed of SEEDS) {
    try {
      const loaded = await loadGame({ seed, mode: 'deep-r6-supplement', fullTelemetry: true });
      G = loaded.Game;
      await setupGame(G);
      let saved = null;
      const policy = Object.create(competent);
      policy.id = 'deepening-r6-supplement';
      policy.setup = function (GG, c) {
        competent.setup(GG, c);
        saved = c.supp = {
          contestLog: [],
          favorAsks: [], favorConvoCount: 0, roundRobin: 0,
          snap40: null, beast40: null, transcript45: null,
          counters40: null,
        };
        instrumentContests(saved);
      };
      policy.daily = function (GG, c) {
        competent.daily(GG, c);
        if (G.over || inFight()) return;
        const s = c.supp;
        const day = gday();
        if (day === 40) {
          s.counters40 = { held: G.state.contestsHeld || 0, seen: JSON.parse(JSON.stringify(G.state.contestsSeen || {})) };
        }
        if (day === 40 && !s.snap40) s.snap40 = knowledgeSnapshot();
        if (day === 45) {
          const roster = aliveRoster().filter(id => id !== G.villagerId);
          const vid = roster[0];
          if (vid) {
            const fp = `/tmp/journey-deep-r6-transcript-${seed}-45.txt`;
            runConversation(vid, 8, fp);
            s.transcript45 = fp;
          }
        }
        if (day === 40 && !s.beast40) {
          let asked = 0, taught = 0;
          for (const vid of aliveRoster()) {
            if (vid === G.villagerId) continue;
            try { const r = G.askAbout(vid, 'beasttricks'); asked++; if (r && r.taught) taught++; } catch (e) {}
          }
          s.beast40 = { asked, taught };
        }
        if (day >= 40 && day <= 100 && s.favorAsks.length < 12) {
          const roster = aliveRoster().filter(id => id !== G.villagerId);
          if (roster.length) {
            const vid = roster[s.roundRobin % roster.length];
            s.roundRobin++;
            try {
              const r0 = G.startConvo(vid);
              const w = openingWant(vid);
              const isFavor = w && w.id && /favor/i.test(w.id);
              const L = [`=== seed ${seed} day ${day} — favor sampler with ${vname(vid)} (${vid}) ===`,
                `want: ${w.id || 'none'} stage=${w.stage || 0}`,
                `THEM: ${r0.line || '(no line)'}`];
              const themLines = r0.line ? [String(r0.line)] : [];
              if (isFavor) {
                let r = r0;
                for (let turn = 0; turn < 3; turn++) {
                  let choices = (r.choices && r.choices.length) ? r.choices : null;
                  if (!choices) { try { choices = G.convoChoices(vid); } catch (e) { choices = []; } }
                  const pick = pickChoice(choices, turn);
                  if (!pick || pick.id === 'leave') break;
                  L.push(`YOU: [${pick.id}] ${pick.label}`);
                  r = G.convoTurn(vid, pick.id);
                  if (r.line) { L.push(`THEM: ${r.line}`); themLines.push(String(r.line)); }
                  if (r.ended) break;
                }
                try { const endR = G.endConvo(vid, 'done'); if (endR && endR.line) { L.push(`closing: ${endR.line}`); themLines.push(String(endR.line)); } } catch (e) {}
                const n = s.favorConvoCount++;
                const fp = `/tmp/journey-deep-r6-favor-${seed}-${n}.txt`;
                try { fs.writeFileSync(fp, L.join('\n')); } catch (e) {}
                s.favorAsks.push({ n, day, npc: vname(vid), wantId: w.id, file: fp, texts: themLines });
              } else {
                try { G.endConvo(vid, 'done'); } catch (e) {}
              }
            } catch (e) { /* sampling must not kill the run */ }
          }
        }
      };
      const result = await runDays(G, policy, { days: DAYCAP, manifest: manifest(seed, 'deep-r6-supplement') });
      // close any still-open contest records; flag stranded (announced, never resolved)
      for (const rec of saved.contestLog) {
        if (rec.dayEnd == null) {
          rec.dayEnd = gday();
          rec.outcome = 'run-ended-open';
          rec.stranded = true;
        }
      }
      const countersEnd = { held: G.state.contestsHeld || 0, seen: JSON.parse(JSON.stringify(G.state.contestsSeen || {})) };
      const snapEnd = knowledgeSnapshot();
      // teach diffs: what each survivor learned in-run between day 40 and end
      const diffs = [];
      const by40 = {};
      if (saved.snap40) for (const v of saved.snap40.villagers) by40[v.vid] = v;
      for (const v of snapEnd.villagers) {
        if (!v.alive) continue;
        const a = by40[v.vid] || { taughtInRun: 0, familiar: 0, background: 0, taughtByPlayer: [] };
        diffs.push({
          name: v.name, vid: v.vid, alive: true,
          plantsKnown: v.plantsKnown, familiar: v.familiar, taughtInRun: v.taughtInRun,
          background: v.background, trust: v.trust,
          taughtByPlayer: v.taughtByPlayer,
          newTaughtByPlayerSince40: v.taughtByPlayer.filter(p => !(a.taughtByPlayer || []).includes(p)),
        });
      }
      const out = {
        seed, maxGameDay: result.days, endReason: result.endReason, ms: result.ms,
        knowledge: { snap40: saved.snap40, snapEnd, teachDiffs: diffs, beast40: saved.beast40 },
        contests: { log: saved.contestLog, count: saved.contestLog.length, counters40: saved.counters40, countersEnd },
        favorAsks: saved.favorAsks, favorAskCount: saved.favorAsks.length,
        transcript45: saved.transcript45,
      };
      const fp = path.join(EVIDIR, `journey-deepening-r6supp-${seed}.json`);
      fs.writeFileSync(fp, JSON.stringify(out, null, 1));
      console.log(`SEED ${seed} SUPP DONE: day=${result.days} end=${result.endReason} contests=${saved.contestLog.length} favorAsks=${saved.favorAsks.length} ms=${result.ms} -> ${fp}`);
    } catch (e) {
      console.log(`SEED ${seed} SUPP FATAL: ` + (e && e.stack || e));
    }
  }
  console.log('\n########## SUPPLEMENT COMPLETE ##########');
}
main().catch(e => { console.error('SUPPLEMENT ERROR:', e); process.exit(2); });
