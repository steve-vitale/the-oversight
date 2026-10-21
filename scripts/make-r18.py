#!/usr/bin/env python3
"""Build scripts/journey-scale-r18-20261021.js from the r17 instrument.
R18 = the overtime ledger: a competent player who waits after the announce.
Graded delays per seed (R18_DELAY=7,14,21,42 -> tiers 1,2,3,6).
Auditable transform; every replacement is asserted."""
import re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
src = (ROOT / 'journey-scale-r17-20261021.js').read_text()

def rep(old, new, count=1):
    global src
    n = src.count(old)
    assert n == count, f'expected {count} of {old[:70]!r}, found {n}'
    src = src.replace(old, new)

# ---------- header ----------
old_header_start = "// scripts/journey-scale-r17-20261021.js — journey leg SCALE (days 80–140) R17:"
i = src.index(old_header_start)
j = src.index("'use strict';")
new_header = """// scripts/journey-scale-r18-20261021.js — journey leg SCALE (days 80–140) R18:
// THE OVERTIME LEDGER. r17 played the table approach (4/4 seats taken aloud,
// audits state-verified exact, doors offered honestly). r17's named-next:
// "does the overtime line speak honestly at tier ≥ 1?" — the overtime clock
// starts at the announce and every 7 unseated days = +1 tier (cap 6);
// each tier the System speaks a line on air, raids come sooner, wave-4/5
// fights become RERUNS, and the seat price drops (−4 standing/tier −3 per
// Haven person lost, cap −40). r17 sat promptly (tier 0 on all four). This
// run dithers: a competent player who waits.
//
// PRE-REGISTER (2026-10-21, MEASUREMENT.md sections 9-12, 14):
//   Leg question: after the table is announced, what does WAITING cost and
//   does the game speak it honestly — does each overtime tier stage aloud
//   on air, does the Haven Table block line it, does the audit at sitting
//   name the delay tier and the price honestly (numbers == state), are the
//   door standings really docked (state-verified, never copy-trusted), and
//   is any part a trap, a silent flip, or unfireable? (withdrawal beats too.)
//   Driver: graded delays per seed (R18_DELAY=7,14,21,42 -> tiers 1,2,3,6).
//   When tableAnnounced && !tableDone, the harness previews daily (pure-read
//   M5 check), watches for the withdrawal beat, and sits on the first ready
//   day >= announceDay + delay. The 7-door modal is left OPEN; path entry is
//   lane B's domain and is not touched. Zero game-code change.
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     M1 staging — the table is announced (tableAnnounced) on >=2/4 pilot
//       seeds (substrate established: r16 5/10, r17 4/4 with this policy).
//       A seed that never announces is replaced, never a miss.
//     M2 overtime honest — on every announced seed: overtime tier events
//       fire at 1 tier / 7 unseated days (System line on air captured,
//       overtime_tier telemetry matches, tier == floor(days/7) capped 6),
//       the sitting audit names the delay tier aloud, the offered door
//       standings == earned − 4*tier − 3*havenLost (cap −40, state-verified
//       against the seat detail and tableChoices), no silent flip (a seat
//       that takes or withdraws with no text is NO-GO).
//     M3 people — >=4 full transcripts sense-read (announce day, sitting day,
//       two ordinary scale days), 0 senseless flags.
//     M4 survival — >=2/4 villages alive+coherent AT the sitting day
//       (revised per r17 metric review: score at sitting, not d120 — the
//       post-sitting modal-open days are not natural play).
//     M5 instrument-honesty — tablePreview() is a pure read: two consecutive
//       calls return deep-equal results with no progState mutation between
//       them (r1 instrument-honesty, the havenViewership() lesson).
//   Interesting-finding bar: the overtime price curve (tier -> standing dock
//   per door, tier -> raid/rerun texture); whether the System's on-air lines
//   and the Haven block stay honest at high tiers; whether a long delay can
//   withdraw the seat (the beat must fire aloud) and whether the approach
//   still completes after; any flattery (the audit naming a rank the run no
//   longer holds) or any price the audit names but never charges.
//   Horizon: DAYCAP=185 loop-days, death-aware stop (+10d tail max).
//   PILOT FIRST: 4 seeds 18001-18004 (fresh, disjoint from r9-r17).
//   Policy: belongseek + feast layer (FEASTSCALE_R13=1; r16's proven staging
//   instrument). The Binding answered 'swear'; the Watchers answered 'feast'.
//   Telemetry: compare against the belong-shaped baseline
//   (telemetry-baselines/scale-belong.json), same as r14-r17.
// Usage: SEEDS=18001,18002 node scripts/journey-scale-r18-20261021.js
//   R18_DELAY=7,14,21,42 (default; per-seed, aligned with SEEDS) — days to
//   wait after the announce before sitting.
//   R15_WATCHERS_ANSWER=feast (r15's env name kept; feast is the default).
//   R15_FEAST=1|0 (default: 1) — feast layer on/off.
//   R14_BINDING_ANSWER=swear|serve|walk (default: swear).

"""
src = new_header + src[j:]

# ---------- seeds ----------
rep("const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [17001, 17002, 17003, 17004]);",
    "const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [18001, 18002, 18003, 18004]);")

# ---------- R18 delay env (after the POLICY/BASE consts) ----------
rep("const BASE = R15_FEAST === '1' ? belongfeast : belongseek;",
    "const BASE = R15_FEAST === '1' ? belongfeast : belongseek;\n"
    "// R18: graded waiting — days after the announce before sitting, per seed\n"
    "// (aligned with SEEDS; a single number applies to all). 7/14/21/42 days\n"
    "// probe tiers 1/2/3/6. Tiers never exceed 6; a withdrawn seat pauses the\n"
    "// clock and the driver waits it out, never resets.\n"
    "const R18_DELAYS = (process.env.R18_DELAY || '7,14,21,42').split(',').map(s => parseInt(s, 10));\n"
    "function delayFor(seed) {\n"
    "  const i = SEEDS.indexOf(seed);\n"
    "  if (i >= 0 && i < R18_DELAYS.length) return R18_DELAYS[i];\n"
    "  return R18_DELAYS.length ? R18_DELAYS[0] : 14;\n"
    "}")

# ---------- driveTableApproach: gate on delay, watch tiers + withdrawal ----------
rep("""function driveTableApproach(ctx) {
  const tlog = (ctx.tableApproach = ctx.tableApproach || []);
  try {
    const pg = (_G.progState ? _G.progState() : {}) || {};
    if (!pg.tableAnnounced || pg.tableDone) return;
    const day = gday();
    if (ctx._taDrvDay === day) return; ctx._taDrvDay = day;
    let pv = null;
    try { pv = _G.tablePreview ? _G.tablePreview() : null; }
    catch (e) { tlog.push({ day, ev: 'preview-err', err: String(e && e.message) }); return; }
    if (!pv) {
      let floor = null;
      try { floor = !!(_G.winDayFloorOk && _G.winDayFloorOk()); } catch (e) {}
      tlog.push({ day, ev: 'preview-null', waiting: !!pg.tableWaiting, dayFloor: floor });
      return;
    }""",
"""function driveTableApproach(ctx) {
  const tlog = (ctx.tableApproach = ctx.tableApproach || []);
  try {
    const pg = (_G.progState ? _G.progState() : {}) || {};
    // R18: the withdrawal watch — the seat can be withdrawn while we wait
    // (deed re-check at dawn withdraws aloud, never silently). Track it.
    if (ctx.tableAnnounceDay && !pg.tableAnnounced && !pg.tableDone && ctx._taDrvDay) {
      const beat = capture.slice(ctx._taCapMark || 0)
        .filter(x => /THE TABLE — the ring of pale light|withdrawn|RESCHEDULE|does not come/i.test(String(x)))
        .map(String).slice(0, 8);
      if (!ctx._taWithdrawLogged) {
        tlog.push({ day: gday(), ev: 'seat-withdrawn', seat: pv0seat(), beat });
        ctx._taWithdrawLogged = true;
      }
    }
    if (!pg.tableAnnounced || pg.tableDone) return;
    const day = gday();
    if (ctx._taDrvDay === day) return; ctx._taDrvDay = day;
    let pv = null;
    try { pv = _G.tablePreview ? _G.tablePreview() : null; }
    catch (e) { tlog.push({ day, ev: 'preview-err', err: String(e && e.message) }); return; }
    if (!pv) {
      let floor = null;
      try { floor = !!(_G.winDayFloorOk && _G.winDayFloorOk()); } catch (e) {}
      tlog.push({ day, ev: 'preview-null', waiting: !!pg.tableWaiting, dayFloor: floor });
      return;
    }
    // R18: overtime-tier change watch — each tier must stage aloud on air
    // (System line + overtime_tier telemetry + Haven block line).
    const _otNow = pv.overtime || 0;
    if (_otNow !== (ctx._lastOT || 0)) {
      const otLines = capture.slice(ctx._otCapMark || 0)
        .filter(x => /OVERTIME|overtime/i.test(String(x))).map(String).slice(0, 10);
      tlog.push({ day, ev: 'overtime-tier', tier: _otNow, penalty: pv.standingCost || 0,
        losses: pv.losses || 0, daysWaited: ctx.tableAnnounceDay ? day - ctx.tableAnnounceDay : null,
        lines: otLines });
      ctx._lastOT = _otNow; ctx._otCapMark = capture.length;
    }""")

# ---------- delay gate before the sitting ----------
rep("""    tlog.push(rec);
    if (!pv.ready) return; // blocked aloud (contest, combat, access) — retry next day
    // Competent player: go sit. Capture the scene + audit + doors.""",
"""    tlog.push(rec);
    if (!pv.ready) return; // blocked aloud (contest, combat, access) — retry next day
    // R18: the competent player dithers. Sit only once the graded wait is over.
    const delay = delayFor(_currentSeed);
    const waitDay = (ctx.tableAnnounceDay || day) + delay;
    if (day < waitDay) {
      if (day === ctx._taDrvDay - 1 || !ctx._taWaitLogged || ctx._taWaitLogged.day !== day) {
        tlog.push({ day, ev: 'waiting', delay, waitDay, tier: pv.overtime || 0,
          penalty: pv.standingCost || 0, losses: pv.losses || 0 });
        ctx._taWaitLogged = { day };
      }
      return;
    }
    // Competent player: go sit. Capture the scene + audit + doors.""")

# ---------- overtime in the scene filter + audit capture ----------
rep("const scene = capture.slice(cap0)\n      .filter(x => /table|audit|doors|ring|watch|sitting|priced/i.test(String(x)));",
    "const scene = capture.slice(cap0)\n      .filter(x => /table|audit|doors|ring|watch|sitting|priced|overtime|kept waiting/i.test(String(x)));")

rep("""    // The audit line (copy) vs the seat detail (state) — verified in analysis.
    let auditLine = null;
    for (const s of scene.map(String)) {
      if (/lesser seat —|A full seat\\./.test(s)) { auditLine = s; break; }
    }""",
"""    // The audit line (copy) vs the seat detail (state) — verified in analysis.
    let auditLine = null;
    for (const s of scene.map(String)) {
      if (/lesser seat —|A full seat\\./.test(s)) { auditLine = s; break; }
    }
    // R18: the overtime audit line(s) at sitting.
    let overtimeAudit = null;
    for (const s of scene.map(String)) {
      if (/notes the overtime|kept waiting|OVERTIME/i.test(s)) { overtimeAudit = s; break; }
    }
    // R18: the overtime price state, for state-verification of the dock.
    let overtimeState = null;
    try {
      const ot = _G.overtimeStanding ? _G.overtimeStanding() : null;
      const tt = _G.overtimeTier ? _G.overtimeTier() : null;
      overtimeState = ot ? { tier: tt, penalty: ot.penalty, losses: ot.losses } : { tier: tt, penalty: 0, losses: 0 };
    } catch (e7) {}""")

rep("""    tlog.push({ day, ev: 'take-seat',
      ok: !!(res && res.ok), msg: res ? res.msg : null, takeErr,
      tableDone: !!pg2.tableDone, seat: seatNow,
      sceneLines: scene.map(String).slice(0, 24),
      auditLine, auditDetail: detail, doorOffer });""",
"""    // R18: the price state-verification — capture the UNDOCKED strengths by
    // forcing tier 0 momentarily (tableEarnedPaths is a pure prereq read;
    // progState is restored immediately after, before any tick).
    let undockedPaths = null, undockedErr = null, undockedRestored = false;
    try {
      const pgx = _G.progState();
      const saveOT = pgx.overtime, saveLoss = pgx.overtimeLosses;
      pgx.overtime = 0; pgx.overtimeLosses = 0;
      undockedPaths = (_G.tableEarnedPaths ? _G.tableEarnedPaths() : []).map(p => ({ id: p.id, earned: !!p.earned, strength: p.strength }));
      pgx.overtime = saveOT; pgx.overtimeLosses = saveLoss;
      undockedRestored = (pgx.overtime === saveOT) && (pgx.overtimeLosses === saveLoss);
    } catch (e8) { undockedErr = String(e8 && e8.message); }
    tlog.push({ day, ev: 'take-seat',
      ok: !!(res && res.ok), msg: res ? res.msg : null, takeErr,
      tableDone: !!pg2.tableDone, seat: seatNow,
      sceneLines: scene.map(String).slice(0, 24),
      auditLine, overtimeAudit, overtimeState, delay: delayFor(_currentSeed),
      announceDay: ctx.tableAnnounceDay || null,
      undockedPaths, undockedErr, undockedRestored,
      auditDetail: detail, doorOffer });""")

# ---------- pv0seat helper (used by the withdrawal watch) ----------
rep("""// ---- R17: THE TABLE APPROACH (competent player sits when the table is set) ----""",
"""function pv0seat() {
  try {
    const pv = (_G.tablePreview ? _G.tablePreview() : null) || {};
    return pv.seat || null;
  } catch (e) { return 'preview-err'; }
}
// ---- R18: THE OVERTIME LEDGER (competent player waits; driver adapted from R17) ----""")

# ---------- naming ----------
rep("strength: p.strength || null", "strength: (p.strength == null ? null : p.strength)")
# ---------- R18 instrument: engage non-verbal choices (language-barrier villagers) ----------
rep("'alive:want:curious'];",
    "'alive:want:curious',\n  // R18 (2026-10-21): language-barrier villagers (no shared words) offer only\n  // non-verbal choices — a real player nods/smiles/points/listens. The old\n  // list matched none of them and the driver bailed at turn 0.\n  'nv:nod', 'nv:smile', 'nv:pointself', 'nv:listen'];")
rep("journey-scale-r17-${POLICY}-transcript-", "journey-scale-r18-${POLICY}-transcript-")
rep("`journey-scale-r17-${POLICY}-${seed}.json`", "`journey-scale-r18-${POLICY}-${seed}.json`")
rep("console.log(`\\n########## SEED ${seed} POLICY=${POLICY} SCALE-R17 watchers=", "console.log(`\\n########## SEED ${seed} POLICY=${POLICY} SCALE-R18 watchers=")
rep("mode: 'journey-scale-r17-belong'", "mode: 'journey-scale-r18-belong'", count=2)
rep("fs.writeFileSync(`/tmp/r16-cap-${POLICY}-${seed}.txt`, txt);", "fs.writeFileSync(`/tmp/r18-cap-${POLICY}-${seed}.txt`, txt);")
rep("policy.id = 'journey-scale-r17-' + POLICY;", "policy.id = 'journey-scale-r18-' + POLICY;")
rep("satRec=(out.tableApproach||[]).filter(e=>e.ev==='take-seat'&&e.tableDone)[0]",
    "satRec=(out.tableApproach||[]).filter(e=>e.ev==='take-seat'&&e.tableDone)[0]")

(ROOT / 'journey-scale-r18-20261021.js').write_text(src)
print('written,', len(src.splitlines()), 'lines')
