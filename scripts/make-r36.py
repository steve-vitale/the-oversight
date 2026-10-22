#!/usr/bin/env python3
"""Generate scripts/journey-landing-r36-20261022.js from the r35 driver.

Lineage: r29-driver -> R34 instruments -> R35 (nv-winddown wild check +
near-dupe detector refinement) -> R36 (food-economy regime change:
SURPLUSFEED removal + behavioral plenty-deprioritization + fallen
memorial-roll audit).
"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'scripts' / 'journey-landing-r35-20261021.js'
DST = ROOT / 'scripts' / 'journey-landing-r36-20261022.js'

HEADER = '''#!/usr/bin/env node
// Journey leg: LANDING (days 1-14) R36 — food-economy regime change check
// + near-dupe detector hold, on tip 09ff3090e.
// Landing-window exposure of commits since r35's base (6381306b9):
//   - 9f5015716 Remove SURPLUSFEED governor (Steve 2026-10-21: "a bad way to
//     control outcomes") — the post-hoc pantry trim is GONE. LANDING-EXPOSED:
//     surplus accumulation was the mechanism that kept landing pantries
//     full; without the trim, rot pressure + villager behavior absorb it.
//   - df66ebaff sim-plentydepri-b: behavioral plenty-deprioritization of
//     production (Steve 2026-10-21 ruling: villagers deprioritize PRODUCTION
//     and STORAGE when food is plentiful). Villagers ease 50% of the surplus
//     push above their own meal-need estimate when the pantry is plentiful
//     (>4 fresh days, duty-PRODTHROTTLE's definition; hungryStreak>=3 stands
//     it down). Own meal sacred. Day-level voice: one 🍽️ line/day after the
//     meal loop, rotating speaker, 12-line pool naming real instead-of work.
//     LANDING-EXPOSED: landing villages ran 0.98-1.10 self-sufficiency in
//     r34/r35 — the pantry IS plentiful in-window, so the deprioritization
//     fires here. The V2 gate (>=40% of 14-day kcal draw from villager
//     production) is the pressure point: if production eases, does the leg
//     still feed itself? A V2 miss is an INTERESTING FINDING, not a re-score
//     (§14 — metric review queue, next-run revision).
//   - b5cb18d53 Lane B succession r34: wound/thirst fallen-count fix —
//     guarded v.fallen pushes in game.js. LANDING-EXPOSED: wound deaths in
//     the window left no memorial-roll record (census undercounted). R36
//     audits the roll: exactly one fallen entry per death (no dupes).
//   - 42d328d35 Lane B social r40: stale c.invitePending leak fix in
//     conversation.js — LANDING-EXPOSED: shared conversation machinery.
//   - 03b1e0a79 [needs-eyes] journey-social r39 (lane B): the grapevine
//     carries stories; deed-gossip born-dead fix + rumor salience fix.
//     LANDING-EXPOSED: gossip machinery is shared; gossip-resume instrument
//     stays.
//   - 5d8f5d551 sim-hurtvillager-id-b: thread monster id through
//     hurtVillager — LANDING-EXPOSED: kill-site narration.
//   - ab5f8db3e journey-scale r20: withdrawal-honesty + winddown test fix —
//     scripts only for landing exposure.
//   - 0b2e2ea3d sim-stalkfail-beats-b: stalk-fail 4-variant pool via
//     stream-neutral leadPick; DET-GATE byte-identical — no narration drift
//     expected in-window.
// Driver: pinned competent (r14–r35 continuity). R35 instruments kept:
//   NV_PROBE, nv instruments (nv-winddown wild hold), the refined near-dupe
//   detector (quote-explained pairs excluded), all r34/r30 instruments.
// R36 additions:
//   - PLENTY: stream scan for the 🍽️ plenty-voice lines (1/day when the
//     throttle engages); per-day ledger read from
//     village._plentyDepri.days[day] {depri, kcal, vids} + prodThrottle
//     engaged flag. Sense-read: the named instead-of work must be real
//     work verbs (mending/maintenance/training/fire-sitting/water), speaker
//     rotation, no verbatim 4-day loop.
//   - FALLEN: memorial-roll audit — exactly one v.fallen entry per death
//     (dupes = 0); the wound/thirst fixes' wild hold.
//   - No control arm this run (PLENTYDEPRI=0): the lever's own proof covered
//     det-gate; r36 asks the wild question on the shipped default.
//
// Pre-registered (docs/MEASUREMENT.md sections 9-12, 14 — binding; §14
// anti-drift: a miss is NO-GO, never re-scored mid-run):
//   Question A (food-economy regime change): with SURPLUSFEED gone and
//     behavioral plenty-deprioritization live, does landing stay fed,
//     green, and legible?
//   Gates (binding):
//     R36 PLENTY-ENGAGE: the throttle engages on >=1 seed (voice lines
//       fire); every fired line is sense-read (real work, rotation, no
//       verbatim loop). If the pantry never reaches plentiful, the gate is
//       documented-absent (the leg was lean), not a miss.
//     R36 FALLEN: 0 fallen dupes across all deaths; exactly-one entry per
//       death on any wound/thirst death in-window (else documented-absent).
//     R36 V2-PRESSURE (watch): V2 holds at >=40% on >=3 seeds WITH the new
//       behavior. If it misses, the miss is recorded under metric review —
//       the plenty-deprioritization is MEANT to ease production; the metric
//       may need a regime-aware revision next run. NOT re-scored now.
//   Stay-green spine (same gates as r34/r35): V1'', V2 (with the above
//     watch), V3 (+scholar carve-out), V4' (refined detector; >=8
//     transcripts sense-read, 0 fabric-history, 0 near-dupes), V5', V6,
//     M2 (System d8), WILD HAUL ARC, DAY-FREEZE, OPEN BOOK, BEAT-IDENTITY
//     WILD, R34 DEATH-LITURGY, R34 THEFT-RATE, R35 NV-HOLD (nvPicks>0 on
//     the nv sit; 0 stuck loops; surfaced winddowns close naturally).
//   Seeds: 205, 206 (pilot), 207, 208 (main); probe 101 (REPEAT_SIT=1,
//     MOURN_PROBE=1). Policy: competent, PINNED.
//   Horizon: 14 days, death-aware stop (+10d tail). One process per seed.
//   Pilot sizing: 205, 206 + probe 101; expand to 207, 208 iff the pilot
//     shows anything interesting (§9). The food-economy question is
//     interesting by construction (regime change); the full 4 fresh seeds
//     also carry the V4' people check.
//   Binding metrics: R36 PLENTY-ENGAGE + R36 FALLEN + R36 V2-PRESSURE +
//     V1'', V2, V3, V4', V5', V6, M2, WILD HAUL ARC, DAY-FREEZE, OPEN BOOK,
//     BEAT-IDENTITY WILD, R34 DEATH-LITURGY, R34 THEFT-RATE, R35 NV-HOLD +
//     standing pipeline metrics.
//   Canon read: CANON.md (reread); DISEASES.md (reread), CONVERSATIONS.md,
//     DIRECTIVES.md, KIN.md, PRESERVATION.md (r28–r35). No new canon
//     invented.
//
// Usage: node scripts/journey-landing-r36-20261022.js
// Probe: SEEDS=101 REPEAT_SIT=1 MOURN_PROBE=1 node scripts/journey-landing-r36-20261022.js
// Outputs route to OUTDIR (env) or the goal evidence dir — never /tmp
// (service restarts wipe /tmp mid-run, 2026-10-14).

'''

text = SRC.read_text()

# 1. Swap the header (through the blank line before `const fs = require('fs');`).
m = re.search(r'const fs = require\(\'fs\'\);', text)
assert m, 'header anchor not found'
text = HEADER + text[m.start():]

# 2. Global renames in the body.
text = re.sub(r'\br35\b', 'r36', text)
text = re.sub(r'\bR35\b', 'R36', text)
text = text.replace('20261021', '20261022')
text = text.replace('2026-10-21/landing-r35', '2026-10-22/landing-r36')
text = text.replace('2026-10-21/landing-r36', '2026-10-22/landing-r36')

# 3. New seeds.
text = text.replace(": [201, 202, 203, 204]);", ": [205, 206, 207, 208]);")

# 4a. MET init additions (anchor: R30 death-liturgy block tail).
old_met = """  fleshHaulSeenLines: [], fleshExperimentLines: [],
};
function bump(obj, k) { obj[k] = (obj[k] || 0) + 1; }"""
new_met = """  fleshHaulSeenLines: [], fleshExperimentLines: [],
  // R36: plenty-deprioritization (df66ebaff) + fallen memorial-roll audit (b5cb18d53)
  plentyVoiceLines: 0, plentyVoiceSamples: [],
  fallenDupes: 0, fallenDupeSamples: [],
};
function bump(obj, k) { obj[k] = (obj[k] || 0) + 1; }"""
assert old_met in text, 'MET anchor not found'
text = text.replace(old_met, new_met)

# 4b. plentyScan + cap hook (anchor: r34Scan def + cap function).
old_scan = """function cap(line) {
  if (line == null) return;
  const s = String(line);
  feastScan(s);
  waterScan(s);
  takeScan(s);
  r34Scan(s);"""
new_scan = """// R36: plenty-deprioritization voice — one 🍽️ line/day when the throttle engages.
// R36b: day-attributed samples (d<day>:) so within-village repeats can be
// checked against the design claim (period-12 per-speaker key, no <4-day
// verbatim loop, no same-day collision).
const PLENTY_VOICE_RE = /🍽️ /;
function plentyScan(line) {
  const s = String(line || '');
  if (PLENTY_VOICE_RE.test(s)) { MET.plentyVoiceLines++; (MET.plentyVoiceSamples = MET.plentyVoiceSamples || []).push(`d${gday()}: ` + s.slice(0, 200)); }
}
function cap(line) {
  if (line == null) return;
  const s = String(line);
  feastScan(s);
  waterScan(s);
  takeScan(s);
  r34Scan(s);
  plentyScan(s);"""
assert old_scan in text, 'cap anchor not found'
text = text.replace(old_scan, new_scan)

# 4c. Per-day plenty snapshot in the series entry (anchor: popAlive line).
old_snap = """      day: gday(), pantryKcal: pantryKcal(), pop: popAlive(),"""
new_snap = """      day: gday(), pantryKcal: pantryKcal(), pop: popAlive(),
      // R36: plenty-deprioritization ledger read — the df66ebaff hook writes
      // village._plentyDepri.days[day] = {depri, kcal, vids} when the throttle
      // engages (>4 fresh days, hungryStreak<3).
      plenty: (() => {
        try {
          const v = Game.state.village || {};
          const d = gday();
          const rec = ((v._plentyDepri || {}).days || {})[d] || null;
          return {
            throttle: !!(Game.prodThrottleEngaged && Game.prodThrottleEngaged()),
            depri: rec ? rec.depri : 0,
            kcalEased: rec ? Math.round(rec.kcal || 0) : 0,
            villagers: rec ? ((rec.vids || []).length) : 0,
          };
        } catch (e) { return null; }
      })(),"""
assert old_snap in text, 'snapshot anchor not found'
text = text.replace(old_snap, new_snap)

# 4d. Rename the summary var and add R36 fields.
old_sumvar = """  var r34 = {
    nvPicks: MET.nvPicks || 0,"""
new_sumvar = """  var r36 = {
    nvPicks: MET.nvPicks || 0,"""
assert old_sumvar in text, 'summary var anchor not found'
text = text.replace(old_sumvar, new_sumvar)

old_sumtail = """    caughtRedHandedLines: (MET.caughtRedHandedLines || []).slice(0, 10),
    headcountCodaLines: (MET.headcountCodaLines || []).slice(0, 10),
    griefBeatLines: (MET.griefBeatLines || []).slice(0, 20),
  };"""
new_sumtail = """    caughtRedHandedLines: (MET.caughtRedHandedLines || []).slice(0, 10),
    headcountCodaLines: (MET.headcountCodaLines || []).slice(0, 10),
    griefBeatLines: (MET.griefBeatLines || []).slice(0, 20),
    // R36: plenty-voice + fallen audit + per-day ledger series
    plentyVoiceLines: MET.plentyVoiceLines || 0,
    plentyVoiceSamples: (MET.plentyVoiceSamples || []).slice(0, 14),
    fallenDupes: MET.fallenDupes || 0,
    fallenDupeSamples: (MET.fallenDupeSamples || []).slice(0, 10),
    plentyLedger: series.map(s => ({ day: s.day, plenty: s.plenty })),
  };"""
assert old_sumtail in text, 'summary tail anchor not found'
text = text.replace(old_sumtail, new_sumtail)

old_key = "starvAutopsies, r34Summary: r34,"
assert old_key in text, 'summary key anchor not found'
text = text.replace(old_key, "starvAutopsies, r36Summary: r36,")

# 4e. Fallen memorial-roll audit in the census write (anchor: deaths line with kind).
old_deaths = """    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),"""
new_deaths = """    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    // R36: memorial-roll audit — the wound/thirst fallen fixes' wild hold.
    // Exactly one fallen entry per (villager, day, cause); repeats counted.
    fallenAudit: (() => {
      const out = { dupes: 0, perVillager: [] };
      try {
        const v = Game.state.village || {};
        const fallen = v.fallen || [];
        const byId = {};
        for (const f of fallen) { const id = f.villagerId || f.id || 'unknown'; (byId[id] = byId[id] || []).push(f); }
        for (const [id, arr] of Object.entries(byId)) {
          const seen = {};
          for (const f of arr) {
            const key = `${f.day}|${f.cause}`;
            if (seen[key]) {
              out.dupes++; MET.fallenDupes++;
              (MET.fallenDupeSamples = MET.fallenDupeSamples || []).push(`${vname(id)} d${f.day}: ${f.cause}`.slice(0, 160));
            }
            seen[key] = 1;
          }
          out.perVillager.push({ id, name: vname(id), n: arr.length });
        }
      } catch (e) {}
      return out;
    })(),"""
assert old_deaths in text, 'deaths anchor not found'
text = text.replace(old_deaths, new_deaths)

# 4f. R36b: nv wild-hold corrections (pilot false positives) + census-time
# plenty ledger (the per-day snapshot reads the current day before the meal
# loop runs — always zeros; the final ledger holds the 14-day history).
old_nvdecl = "    let wdSurfacedAt = -1, turns = 0, endedByEngine = false, lastPickWasNv = false;"
new_nvdecl = "    let wdSurfacedAt = -1, turns = 0, endedByEngine = false, lastPickWasNv = false, leftViaLeave = false;"
assert old_nvdecl in text, 'nv decl anchor not found'
text = text.replace(old_nvdecl, new_nvdecl)

old_leave = "      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }"
new_leave = "      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); lastPickWasNv = false; leftViaLeave = true; break; }"
assert old_leave in text, 'leave anchor not found'
text = text.replace(old_leave, new_leave)

old_nvsum = """      if (wdSurfacedAt >= 0 && endedByEngine) { MET.nvWinddownClosed = (MET.nvWinddownClosed || 0) + 1; log('nv winddown: surfaced then closed naturally ✓'); }
      else if (wdSurfacedAt >= 0) log(`nv winddown: surfaced at turn ${wdSurfacedAt} but did NOT close naturally (endedByEngine=${endedByEngine})`);
      if (nvPicks >= 4 && stillActive && lastPickWasNv) { MET.nvStuckLoops = (MET.nvStuckLoops || 0) + 1; log('!! NV STUCK LOOP: >=4 gesture picks, last pick a gesture, convo still active — the r19 bug signature'); }
      log(`nv summary: picks=${nvPicks} maxStreak=${nvMaxStreak} offeredNv=${offeredNv} wdSurfacedAt=${wdSurfacedAt} endedByEngine=${endedByEngine} stillActive=${stillActive}`);"""
new_nvsum = """      // R36b: the r19 wild hold — the winddown surfaces, the menu narrows
      // (no more nv: spam), and the conversation reaches a proper ending.
      // Leaving via the narrowed 'leave' IS the natural close (the closing
      // line fires); requiring endedByEngine false-negatived the pilot.
      if (wdSurfacedAt >= 0 && (endedByEngine || leftViaLeave)) { MET.nvWinddownClosed = (MET.nvWinddownClosed || 0) + 1; log(`nv winddown: surfaced at turn ${wdSurfacedAt} then closed ${endedByEngine ? 'by engine' : 'via narrowed leave'} ✓`); }
      else if (wdSurfacedAt >= 0) log(`nv winddown: surfaced at turn ${wdSurfacedAt} but did NOT close (endedByEngine=${endedByEngine} leftViaLeave=${leftViaLeave})`);
      // R36b: the true r19 bug signature is gesture-spam to the driver's
      // 8-turn cap with the winddown NEVER surfacing (beat queued forever).
      // A surfaced winddown followed by leave is the fix working, not the bug.
      if (turns >= 8 && stillActive && wdSurfacedAt < 0) { MET.nvStuckLoops = (MET.nvStuckLoops || 0) + 1; log('!! NV STUCK LOOP: 8-turn cap, convo still active, winddown never surfaced — the r19 bug signature'); }
      log(`nv summary: picks=${nvPicks} maxStreak=${nvMaxStreak} offeredNv=${offeredNv} wdSurfacedAt=${wdSurfacedAt} endedByEngine=${endedByEngine} leftViaLeave=${leftViaLeave} stillActive=${stillActive}`);"""
assert old_nvsum in text, 'nv summary anchor not found'
text = text.replace(old_nvsum, new_nvsum)

old_fallena = "    // R36: memorial-roll audit — the wound/thirst fallen fixes' wild hold."
new_fallena = """    // R36b: plenty ledger at census time — the per-day snapshot reads the
    // CURRENT day's record before the day's meal loop runs (always zeros);
    // the final ledger holds the whole 14-day history.
    plentyLedgerFinal: (() => { try { return JSON.parse(JSON.stringify((Game.state.village || {})._plentyDepri || null)); } catch (e) { return null; } })(),
    // R36: memorial-roll audit — the wound/thirst fallen fixes' wild hold."""
assert old_fallena in text, 'fallen audit anchor not found'
text = text.replace(old_fallena, new_fallena)

DST.write_text(text)
print('wrote', DST, len(text.splitlines()), 'lines')
