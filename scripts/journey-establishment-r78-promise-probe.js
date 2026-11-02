#!/usr/bin/env node
// Journey-establishment r78 PROMISE PROBE — targeted repro of the landing-r72
// Jorge blank: a promised forage favor that never appeared in any dawn scan,
// had no favorsEnd entry, and left no rot line. Code-read (prereg) found NO
// favorLedger delete path and exactly one writer (convoStoreFavor), so this
// probe wraps the writer + the commit + promise transitions and dawn-snaps
// the raw ledger, discriminating: silent vanish vs overwrite vs rot vs
// commit-that-never-landed vs census artifact.
// Usage: SEED=381 EVID=<dir> node scripts/journey-establishment-r78-promise-probe.js
// One seed per process (clean harness state per seed).
const fs = require('fs');
const path = require('path');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-02/r78-panel';
const SEED = parseInt(process.env.SEED || '381', 10);
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const dayOf = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const nameOf = (G, id) => { try { return id === 'player' ? 'You' : (G.displayName ? G.displayName(id) : id); } catch (e) { return String(id); } };
const living = (G) => { try { return ((G.state.village || {}).roster || []).filter(id => { try { return !(G.getPerson(id) || {}).dead; } catch (e) { return true; } }); } catch (e) { return []; } };

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) {} }

  const out = { seed: SEED, run: 'r78-promise-probe', sits: [], storeLog: [], commitLog: [],
    promiseTransitions: [], dawnSnaps: [], performLog: [], target: null, verdict: 'NO-COMMIT', error: null };

  // ---- wraps (logging only, no state changes, no RNG) ----
  const _store = Game.convoStoreFavor ? Game.convoStoreFavor.bind(Game) : null;
  if (_store) Game.convoStoreFavor = function (favor) {
    try {
      const v = Game.state.village || {};
      const before = v.favorLedger ? v.favorLedger[favor && favor.vid] : null;
      out.storeLog.push({ day: dayOf(Game), vid: String(favor && favor.vid), name: nameOf(Game, favor && favor.vid),
        kind: favor && favor.kind, state: favor && favor.state,
        beforeKind: before ? before.kind : null, beforeState: before ? before.state : null });
    } catch (e) {}
    return _store.apply(this, arguments);
  };
  const _commit = Game.convoFavorCommit ? Game.convoFavorCommit.bind(Game) : null;
  if (_commit) Game.convoFavorCommit = function (vid, favor) {
    const r = _commit.apply(this, arguments);
    try { out.commitLog.push({ day: dayOf(Game), vid: String(vid), name: nameOf(Game, vid),
      kind: favor && favor.kind, ok: !!(r && r.ok), away: !!(r && r.away), unsupported: !!(r && r.unsupported),
      closed: !!(r && r.closed), blocked: !!(r && r.blocked), line: r && r.line ? String(r.line).slice(0, 160) : null }); } catch (e) {}
    return r;
  };
  const _checkP = Game.checkPromises ? Game.checkPromises.bind(Game) : null;
  if (_checkP) Game.checkPromises = function (kind, vid, opts) {
    let before = null;
    try { const p = ((Game.state.village || {}).promises || {})[vid]; before = p ? { favorId: p.favorId, kept: p.kept } : null; } catch (e) {}
    const r = _checkP.apply(this, arguments);
    try { const p = ((Game.state.village || {}).promises || {})[vid]; const after = p ? { favorId: p.favorId, kept: p.kept } : null;
      if (JSON.stringify(before) !== JSON.stringify(after)) out.promiseTransitions.push({ day: dayOf(Game), kind, vid: String(vid), before, after }); } catch (e) {}
    return r;
  };
  const _perf = Game.performForageFavor ? Game.performForageFavor.bind(Game) : null;
  if (_perf) Game.performForageFavor = function (vid, favor, ending) {
    const r = _perf.apply(this, arguments);
    try { out.performLog.push({ day: dayOf(Game), vid: String(vid), ok: !!(r && r.ok), line: r && r.line ? String(r.line).slice(0, 120) : null }); } catch (e) {}
    return r;
  };

  function driveOneDay() {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) {} }
      try { driveFights(Game, policy, ctx); } catch (e) {}
      try { driveContests(Game, policy, ctx); } catch (e) {}
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) {}
      try { driveFights(Game, policy, ctx); } catch (e) {}
      try { driveContests(Game, policy, ctx); } catch (e) {}
      if (Game.over) break;
    }
    if (Game.over) return;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) {} }
    try { Game.sleep(); } catch (e) {}
    dawnSnap('dawn'); // post-sleep snap: the dawn itself, whatever part the harness lands on
  }
  function dawnSnap(tag) {
    try {
      const v = Game.state.village || {};
      const t = out.target;
      if (!t) return;
      const f = (v.favorLedger || {})[t.vid] || null;
      const p = (v.promises || {})[t.vid] || null;
      let waiting = false; try { waiting = !!(Game.forageFavorWaiting && Game.forageFavorWaiting(t.vid)); } catch (e) {}
      let due = null; try { due = Game.promiseDueDay ? Game.promiseDueDay(p) : null; } catch (e) {}
      const node = (v.nodePos || {})[t.vid] || {};
      let playerAtHaven = null, playerNode = null;
      try { playerAtHaven = Game.playerAtHaven ? Game.playerAtHaven() : null; } catch (e) {}
      try { playerNode = { nx: Game.map.px, ny: Game.map.py }; } catch (e) {}
      out.dawnSnaps.push({ tag, day: dayOf(Game), dayPart: Game.dayPart, playerAtHaven, playerNode,
        favorPresent: !!f, favorKind: f ? f.kind : null, favorState: f ? f.state : null,
        favorMeetDay: f ? (f.meetDay || null) : null, hasRun: !!(f && f.forageRun),
        promisePresent: !!p, promiseKept: p ? p.kept : null, favorIdMatch: !!(p && f && p.favorId === f.id),
        makerMine: !!(p && p.maker === Game.villagerId), dueDay: due,
        onRoster: ((v.roster || []).includes(t.vid)), dead: !!((Game.getPerson(t.vid) || {}).dead),
        away: !!((v.away || {})[t.vid]), nodeNx: node.nx ?? null, nodeNy: node.ny ?? null, waiting });
    } catch (e) { out.dawnSnaps.push({ tag, error: String(e && e.message) }); }
  }
  // Sit one villager: press dlg:commit when a forage_help favor is on offer,
  // else goon, else first non-structural choice. Returns 'committed' |
  // 'refused' | 'no-forage' | 'error'.
  function sit(vid) {
    const rec = { vid: String(vid), name: nameOf(Game, vid), day: dayOf(Game), picks: [], result: 'no-forage' };
    try {
      let r = Game.startConvo(vid);
      const seen = {};
      const NO_PICK = new Set(['leave', 'bye', 'dlg:commit', 'dlg:favor_action', 'dlg:favor_cancel', 'dlg:renounce', 'dlg:invite']);
      for (let turn = 0; turn < 12; turn++) {
        let c = null; try { c = Game.convoGet ? Game.convoGet(vid) : null; } catch (e) {}
        if (!c || !c.active) break;
        const choices = (r && r.choices) || (c && c.choices) || [];
        if (!choices.length) break;
        const wantFavor = (c.want && c.want.favor) || null;
        const wantId = (c.want && c.want.id) || null;
        let pick = null;
        // R78 pilot fix: dlg:commit is pressed ONLY for a forage_help
        // ask_favor. The old fallback (first non-leave choice) pressed it
        // for a heal_help favor, and a generic "I'll do it" for a
        // non-favor want never touches convoFavorCommit at all — both
        // misread as favor commits. State-changing dlg:* choices are
        // never fallback picks.
        if (wantId === 'ask_favor' && wantFavor && wantFavor.kind === 'forage_help' && choices.find(ch => ch.id === 'dlg:commit')) pick = choices.find(ch => ch.id === 'dlg:commit');
        else if (choices.find(ch => ch.id === 'goon')) pick = choices.find(ch => ch.id === 'goon');
        else pick = choices.find(ch => !NO_PICK.has(ch.id) && !seen[ch.id]) || null;
        if (!pick) break;
        seen[pick.id] = 1;
        rec.picks.push({ id: pick.id, wantId, wantFavorKind: wantFavor ? wantFavor.kind : null });
        r = Game.convoTurn(vid, pick.id);
        if (pick.id === 'dlg:commit') {
          const f = ((Game.state.village || {}).favorLedger || {})[vid] || null;
          const p = ((Game.state.village || {}).promises || {})[vid] || null;
          const cl = out.commitLog[out.commitLog.length - 1] || null;
          rec.commitLog = cl;
          if (f && f.state === 'promised' && p && p.favorId === f.id) { rec.result = 'committed'; rec.favorId = f.id; }
          else rec.result = 'refused';
          break;
        }
        if (r && r.ended) break;
      }
    } catch (e) { rec.result = 'error'; rec.error = String(e && e.message).slice(0, 200); }
    try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) {}
    out.sits.push(rec);
    return rec.result;
  }

  try {
    // Drive to day 15 (establishment window), then sit fresh villagers one
    // per day until a forage commit lands (r72 driver shape: one fresh
    // villager per day, never re-sat).
    let guard = 0;
    while (dayOf(Game) < 15 && !Game.over && guard++ < 40) driveOneDay();
    const sat = new Set();
    guard = 0;
    while (!out.target && !Game.over && guard++ < 12) {
      const cands = living(Game).filter(id => String(id) !== String(Game.villagerId) && !sat.has(String(id)));
      if (!cands.length) break;
      const vid = cands[0]; sat.add(String(vid));
      const res = sit(vid);
      if (res === 'committed') {
        const v = Game.state.village || {};
        const f = (v.favorLedger || {})[vid];
        const p = (v.promises || {})[vid];
        let due = null; try { due = Game.promiseDueDay ? Game.promiseDueDay(p) : null; } catch (e) {}
        out.target = { vid: String(vid), name: nameOf(Game, vid), commitDay: dayOf(Game),
          favorId: f && f.id, meetDay: f && f.meetDay, dueDay: due };
        break;
      }
      driveOneDay();
      if (Game.over) break;
    }
    if (out.target) {
      // Dawn-scan through dueDay+2 (or until the favor closes).
      guard = 0;
      while (!Game.over && guard++ < 10) {
        dawnSnap('dawn');
        const v = Game.state.village || {};
        const f = (v.favorLedger || {})[out.target.vid] || null;
        const p = (v.promises || {})[out.target.vid] || null;
        const closed = f && !['asked', 'promised'].includes(f.state);
        if (dayOf(Game) > (out.target.dueDay || 99) + 1) break;
        if (closed && dayOf(Game) >= (out.target.meetDay || 0)) break;
        driveOneDay();
      }
      dawnSnap('final');
      const last = out.dawnSnaps[out.dawnSnaps.length - 1] || {};
      const f = ((Game.state.village || {}).favorLedger || {})[out.target.vid] || null;
      if (!f) out.verdict = 'VANISHED';
      else if (f.state === 'fulfilled') out.verdict = 'KEPT';
      else if (f.state === 'broken') out.verdict = 'BROKEN-EXPLAINED';
      else if (!last.favorPresent) out.verdict = 'VANISHED';
      else out.verdict = 'SURVIVED-OPEN';
      out.final = { favorPresent: !!f, favorState: f ? f.state : null, favorKind: f ? f.kind : null,
        promisePresent: !!((Game.state.village || {}).promises || {})[out.target.vid] };
    }
  } catch (e) { out.error = String(e && e.stack || e).slice(0, 1000); }
  out.endDay = dayOf(Game); out.over = !!Game.over;
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `journey-establishment-r78-promise-seed${SEED}.json`), JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ seed: SEED, verdict: out.verdict, target: out.target, sits: out.sits.length, storeLog: out.storeLog.length, commitLog: out.commitLog.length, dawnSnaps: out.dawnSnaps.length }, null, 1));
}
main().catch(e => { console.error(e); process.exit(1); });
