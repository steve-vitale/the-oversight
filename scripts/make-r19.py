#!/usr/bin/env python3
"""Build scripts/journey-scale-r19-20261021.js from the r18 instrument.
R19 = THE WITHDRAWN SEAT. r18's named-next: "force the seat-withdrawal path
(deed re-check with a failing seat during a long wait) and verify the
withdrawal beat fires aloud."

The deterministic proof (scripts/test-tablewithdraw-20261021.js, GREEN)
already shows the beat fires aloud on an integration-slip seat loss and the
TABLE RE-FIRE re-extends the invitation aloud. This sim answers the
reachability half: can a real player actually lose the seat in the scale
window, and does each candidate path behave?

Per-seed arms (R19_ARM, aligned with SEEDS):
  defiant — after the announce, refuse every System favor (-3 integration,
             spoken) and use the System relay in crises to rack up owed
             favors (real verbs, real costs). If integration slips below 40
             the seat regresses to 'none' and the dawn re-check must withdraw
             aloud; then the driver pays favors to re-earn and watches for
             the re-fire. Sits after withdrawal+re-fire, or 35d post-announce
             if the seat never slips (reachability data).
  gambit   — after the announce, break EVERY active link via
             breakLink('gambit') (the vassal's gambit, real verb). Pre-
             registered expectation: NO withdrawal — networkLive never
             clears, so scaleRank stays 'regional' and the seat survives.
             Documents the sticky-Regional-Dawn design question.
  control  — prompt sit (r18's tier-0 policy), substrate check.

Auditable transform; every replacement is asserted.
"""
import re, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
src = (ROOT / 'journey-scale-r18-20261021.js').read_text()

def rep(old, new, count=1):
    global src
    n = src.count(old)
    assert n == count, f'expected {count} of {old[:70]!r}, found {n}'
    src = src.replace(old, new)

# ---------- header ----------
old_header_start = "// scripts/journey-scale-r18-20261021.js — journey leg SCALE (days 80–140) R18:"
i = src.index(old_header_start)
j = src.index("'use strict';")
new_header = """// scripts/journey-scale-r19-20261021.js — journey leg SCALE (days 80–140) R19:
// THE WITHDRAWN SEAT. r18's named-next: "force the seat-withdrawal path
// (deed re-check with a failing seat during a long wait) and verify the
// withdrawal beat fires aloud."
//
// The deterministic proof (scripts/test-tablewithdraw-20261021.js) is GREEN:
// an integration-slip seat loss (45->39, stage 2->1) makes tableSeat() return
// 'none'; the dawn re-check (ledger.js endDay wrap -> tableAnnounce ->
// tableScene) fires the withdrawal beat ALOUD with exact state transitions
// (tableWaiting=false, tableAnnounced=false, tableDone=false); and re-earning
// re-extends the invitation ALOUD via checkArc's TABLE RE-FIRE. The withdrawal
// copy does NOT name the failed bar ("THE DEEDS ARE NOT ALL DONE" when the
// deeds were done and the integration slipped) — documented blank.
//
// This sim answers the reachability half: can a real player actually lose the
// seat in the scale window? The lesser bar's regressable component is the
// integration stage (waves/contests/crises/food-deeds are monotonic;
// networkLive never clears, so scale loss can't drop the seat).
//
// PRE-REGISTER (2026-10-21, MEASUREMENT.md sections 9-12, 14):
//   Leg question: when a seated run's deeds slip below the bar after the
//   announce, does the deed re-check withdraw the seat aloud at dawn, name
//   the loss honestly, and re-extend the invitation aloud on re-earn? And
//   does breaking every link withdraw it, or does the Regional Dawn stick?
//   Arms (R19_ARM, per seed): defiant / gambit / control / control.
//   Binding metrics (NO-GO never re-scored; revisions go to "metric review"):
//     M1 staging — the table is announced (tableAnnounced) on >=2/4 seeds
//       (substrate: r16 5/10, r17/r18 4/4 with this policy). A seed that
//       never announces is replaced, never a miss.
//     M2a defiant — IF integration drops below 40 on a defiant seed, the
//       withdrawal beat fires aloud at the next dawn (copy captured,
//       tableWaiting=false state-verified, no silent flip). If integration
//       never drops below 40, the arm reports refusal count + final
//       integration (no miss — reachability is the finding).
//     M2b gambit — breaking all links does NOT withdraw the seat
//       (pre-registered: networkLive is sticky); the audit's rank line is
//       captured for the design question (regional standing, no network).
//     M3 proof — scripts/test-tablewithdraw-20261021.js GREEN (deterministic
//       beat + re-fire; run before the sim).
//     M4 people — >=4 full transcripts sense-read, 0 senseless flags.
//     M5 survival — villages alive+coherent at the decision day.
//   Interesting-finding bar: the withdrawal voice in a real run; the re-fire
//   behavior; how many refusals it takes to slip the seat; whether the
//   gambit arm's audit flatters ("regional standing" with zero links).
//   Horizon: DAYCAP=185 loop-days, death-aware stop (+10d tail max).
//   PILOT FIRST: 4 seeds 19001-19004 (fresh, disjoint from r9-r18).
//   Policy: belongfeast-watchfeast base (FEASTSCALE_R13=1; r16-r18 continuity).
//   The Binding answered 'swear'; the Watchers answered 'feast'.
//   Telemetry: compare against the belong-shaped baseline
//   (telemetry-baselines/scale-belong.json), same as r14-r18.
// Usage: SEEDS=19001,19002 node scripts/journey-scale-r19-20261021.js
//   R19_ARM=defiant,gambit,control,control (default; per-seed, aligned)
//   R15_WATCHERS_ANSWER=feast R15_FEAST=1 R14_BINDING_ANSWER=swear (as r18).

"""
src = new_header + src[j:]

# ---------- seeds ----------
rep("const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [18001, 18002, 18003, 18004]);",
    "const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [19001, 19002, 19003, 19004]);")

# ---------- R19 arms (replaces the R18 delay block) ----------
rep("""const R18_DELAYS = (process.env.R18_DELAY || '7,14,21,42').split(',').map(s => parseInt(s, 10));
function delayFor(seed) {
  const i = SEEDS.indexOf(seed);
  if (i >= 0 && i < R18_DELAYS.length) return R18_DELAYS[i];
  return R18_DELAYS.length ? R18_DELAYS[0] : 14;
}""",
"""// R19: per-seed arms — defiant (integration-slip force), gambit (break every
// link), control (prompt sit, substrate check).
const R19_ARMS = (process.env.R19_ARM || 'defiant,gambit,control,control').split(',').map(s => s.trim().toLowerCase());
function armFor(seed) {
  const i = SEEDS.indexOf(seed);
  if (i >= 0 && i < R19_ARMS.length && R19_ARMS[i]) return R19_ARMS[i];
  return 'control';
}
function integStageNow() { try { return (_G.integrationStage ? _G.integrationStage() : 0); } catch (e) { return 0; } }
function seatNowStr() { try { return (((typeof _G.tableSeat === 'function') ? _G.tableSeat() : null) || {}).seat || null; } catch (e) { return 'seat-err'; } }
function integNow() { try { return (_G.state && _G.state.scholar && _G.state.scholar.integration) || 0; } catch (e) { return 0; } }""")

# ---------- the R19 force driver (before driveTableApproach) ----------
rep("""// ---- R18: THE OVERTIME LEDGER (competent player waits; driver adapted from R17) ----""",
"""// ---- R19: THE WITHDRAWN SEAT — force drivers (real player verbs only) ----
function driveR19Force(ctx) {
  const flog = (ctx.r19force = ctx.r19force || []);
  try {
    const pg = (_G.progState ? _G.progState() : {}) || {};
    if (!pg.tableAnnounced || pg.tableDone) return;
    const arm = armFor(_currentSeed);
    const day = gday();
    if (arm === 'defiant') {
      // The defiant client: refuse every System favor (-3 integration, spoken
      // "Integration slips"). Before any withdrawal, also rack up owed favors
      // with the real relay verb during real crises (help now, won't pay later
      // — a coherent competent-player story). After a withdrawal, PAY favors
      // to re-earn (the re-fire half of the question).
      let pend = null;
      try { pend = _G.state.pendingSystemFavor; } catch (e) {}
      if (pend) {
        const how = ctx._taWithdrawLogged ? 'pay' : 'refuse';
        const before = integNow();
        const cap0 = capture.length;
        let r = null, err = null;
        try { r = _G.answerSystemFavor(how); } catch (e) { err = String(e && e.message); }
        flog.push({ day, ev: 'favor-' + how, integBefore: before, integAfter: integNow(),
          stage: integStageNow(), err,
          lines: capture.slice(cap0, cap0 + 4).map(String) });
      } else if (!ctx._taWithdrawLogged) {
        let crisis = false;
        try { crisis = !!(_G.aidCrisis && _G.aidCrisis()); } catch (e) {}
        const owed = (_G.state.systemFavorsOwed || 0);
        if (crisis && owed < 4) {
          const cap0 = capture.length;
          let r = null, err = null;
          try { r = _G.aidSystemRelay(); } catch (e) { err = String(e && e.message); }
          flog.push({ day, ev: 'relay-used', owedAfter: (_G.state.systemFavorsOwed || 0), err,
            lines: capture.slice(cap0, cap0 + 4).map(String) });
        }
      }
    } else if (arm === 'gambit') {
      // The vassal's gambit: break EVERY active link. Pre-registered
      // expectation: no withdrawal (networkLive never clears).
      if (ctx._gambitDone) return;
      let links = [];
      try { links = (_G.hierarchyState ? _G.hierarchyState() : []).filter(l => l && l.status === 'active'); } catch (e) {}
      const rankBefore = scaleNow(), seatBefore = seatNowStr();
      const broke = [];
      for (const l of links) {
        const cap0 = capture.length;
        try {
          _G.breakLink(l.id, 'gambit');
          broke.push({ id: String(l.id).slice(-8), kind: l.kind,
            other: l.subordinate === 'haven' ? l.primary : l.subordinate,
            lines: capture.slice(cap0, cap0 + 4).map(String) });
        } catch (e) { broke.push({ id: String(l.id).slice(-8), err: String(e && e.message) }); }
      }
      ctx._gambitDone = true; ctx._gambitDay = day;
      flog.push({ day, ev: 'gambit', broke, rankBefore, rankAfter: scaleNow(),
        seatBefore, seatAfter: seatNowStr(), integ: integNow(), stage: integStageNow() });
    }
  } catch (e) { flog.push({ day: gday(), ev: 'force-err', err: String(e && e.message) }); }
}
// ---- R19: THE WITHDRAWN SEAT (seat-loss forcing; driver adapted from R18) ----""")

# ---------- re-fire watch (after the withdrawal watch) ----------
rep("""    if (!ctx._taWithdrawLogged) {
        tlog.push({ day: gday(), ev: 'seat-withdrawn', seat: pv0seat(), beat });
        ctx._taWithdrawLogged = true;
      }""",
"""    if (!ctx._taWithdrawLogged) {
        tlog.push({ day: gday(), ev: 'seat-withdrawn', seat: pv0seat(), beat });
        ctx._taWithdrawLogged = true;
        ctx._taCapMark = capture.length;
      }
    }
    // R19: the re-fire watch — after a withdrawal, the re-earned invitation
    // must come back ALOUD (progression.js TABLE RE-FIRE), never silently.
    if (ctx._taWithdrawLogged && !ctx._refireLogged && pg.tableAnnounced && !pg.tableDone) {
      const beat = capture.slice(ctx._taCapMark || 0)
        .filter(x => /The table is being set/i.test(String(x))).map(String).slice(0, 6);
      if (beat.length) {
        tlog.push({ day: gday(), ev: 'seat-refired', beat,
          integ: integNow(), stage: integStageNow(), seat: seatNowStr() });
        ctx._refireLogged = true;
      }""")

# ---------- arm-aware sitting (replaces the R18 delay gate) ----------
rep("""    // R18: the competent player dithers. Sit only once the graded wait is over.
    const delay = delayFor(_currentSeed);
    const waitDay = (ctx.tableAnnounceDay || day) + delay;
    if (day < waitDay) {
      if (day === ctx._taDrvDay - 1 || !ctx._taWaitLogged || ctx._taWaitLogged.day !== day) {
        tlog.push({ day, ev: 'waiting', delay, waitDay, tier: pv.overtime || 0,
          penalty: pv.standingCost || 0, losses: pv.losses || 0 });
        ctx._taWaitLogged = { day };
      }
      return;
    }""",
"""    // R19: arm-aware sitting.
    const arm = armFor(_currentSeed);
    let sitDay = ctx.tableAnnounceDay || day; // control: sit promptly
    if (arm === 'defiant') {
      if (!ctx._taWithdrawLogged) sitDay = (ctx.tableAnnounceDay || day) + 35; // wait for the slip
      else if (!ctx._refireLogged) sitDay = (ctx.tableAnnounceDay || day) + 50; // wait for the re-fire
      else sitDay = day;
    } else if (arm === 'gambit') {
      sitDay = (ctx._gambitDay || (ctx.tableAnnounceDay || day)) + 3; // let the dawn re-check run
    }
    if (day < sitDay) {
      if (!ctx._taWaitLogged || ctx._taWaitLogged.day !== day) {
        tlog.push({ day, ev: 'waiting', arm, sitDay,
          integ: integNow(), stage: integStageNow(), seat: seatNowStr(),
          withdrawn: !!ctx._taWithdrawLogged, refired: !!ctx._refireLogged,
          tier: pv.overtime || 0, penalty: pv.standingCost || 0, losses: pv.losses || 0 });
        ctx._taWaitLogged = { day };
      }
      return;
    }""")

# ---------- take-seat log: arm instead of delay ----------
rep("      auditLine, overtimeAudit, overtimeState, delay: delayFor(_currentSeed),",
    "      auditLine, overtimeAudit, overtimeState, arm: armFor(_currentSeed),")

# ---------- hook the force driver into policy.daily ----------
rep("    driveTableApproach(ctx); // R17: a competent player sits when the table is set",
    "    driveR19Force(ctx); // R19: seat-loss forcing (real player verbs)\n    driveTableApproach(ctx); // R19: arm-aware sitting")

# ---------- evidence: include the force log ----------
rep("    tableApproach: ctx.tableApproach || [],",
    "    tableApproach: ctx.tableApproach || [],\n    r19force: ctx.r19force || [],")

# ---------- naming ----------
rep("journey-scale-r18-${POLICY}-transcript-", "journey-scale-r19-${POLICY}-transcript-")
rep("`journey-scale-r18-${POLICY}-${seed}.json`", "`journey-scale-r19-${POLICY}-${seed}.json`")
rep("console.log(`\\n########## SEED ${seed} POLICY=${POLICY} SCALE-R18 watchers=", "console.log(`\\n########## SEED ${seed} POLICY=${POLICY} SCALE-R19 watchers=")
rep("mode: 'journey-scale-r18-belong'", "mode: 'journey-scale-r19-belong'", count=2)
rep("fs.writeFileSync(`/tmp/r18-cap-${POLICY}-${seed}.txt`, txt);", "fs.writeFileSync(`/tmp/r19-cap-${POLICY}-${seed}.txt`, txt);")
rep("policy.id = 'journey-scale-r18-' + POLICY;", "policy.id = 'journey-scale-r19-' + POLICY;")

(ROOT / 'journey-scale-r19-20261021.js').write_text(src)
print('written,', len(src.splitlines()), 'lines')
