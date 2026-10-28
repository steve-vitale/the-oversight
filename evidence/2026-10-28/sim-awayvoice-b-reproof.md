# sim-awayvoice-b RE-PROOF (loop B, run fleshout-loop-b-20261028T1930Z) — DUPLICATE DISPATCH, NOT A NEW LEVER

## Duplicate-dispatch finding (established BEFORE any new sims)

This worker was dispatched to build the away-hunger voice beat. That beat
already exists in current master and already landed:

- Pilot commit a7d84bdba (2026-10-25): "away-hunger voice beat —
  narration only, pilot GO 35/35 [needs-eyes]".
- Confirm commit 862721ade: "confirm GO 35/35 on fresh seeds
  94901–94916".
- Merge fix 50d75fb6d (combined packtail + voice accounting).
- Coordinator adoption 2870c771c: "packtail + awayvoice confirms
  adopted, judged, landed".
- Code present on this worktree's HEAD (894d86451, = master tip):
  `src/js/game.js` `awayHungerVoice` (~29290): narration only, fires
  only for away villagers at health <= 7, at most once per (vid,day),
  name from that meal's own vid via getPerson, no Math.random, no
  amount/draw/outcome change. The packtail top-up (sim-packtail-b)
  coexists in `packMeal` above it.

Rebuilding the beat would duplicate landed code and risk a conflicting
second voice line. Per loop discipline (coordinate, never duplicate)
this run therefore does NOT build, re-land, or re-judge a lever. It
RE-PROVES the landed beat on current master: does it still fire, on
the right travelers, and stay silent when healthy, after three days
of master movement? No src/js change is made or proposed by this run.
If the re-proof fails, the finding is reported as a regression on the
landed beat, not as a new arm verdict.

## Canon (read before verifying)

- docs/CANON.md: "No silent actions. Every action narrates honestly,
  including failures." The beat is that rule applied to away meals.
- docs/PRESERVATION.md: pack food moves only what fits in the actual
  pack — the beat reports the actual pack/take, never an invented one.
- docs/ABILITY-REFUSALS.md (pantry ledger): the beat changes no pantry
  number, so no ledger door is touched.
- Prior evidence (read): evidence/2026-10-25/sim-awayvoice-b.md
  (pilot + confirm, including the David health-8 threshold-edge miss,
  kept as a next-run metric-review proposal, NOT re-tuned here),
  evidence/2026-10-25/sim-food-awayration-round-0630.md (Miguel shape),
  evidence/2026-10-24/sim-awayration-size-b.md (3–7 HP death shape;
  pack sizing was KILLED at pilot there and is NOT retried here).

## RE-PROOF PRE-REGISTRATION (written BEFORE any re-proof sims; a miss is reported as a regression, never re-scored)

- Substrate: competent policy ONLY, unmodified
  (scripts/policies/competent.js as shipped). Env: PLENTYDEPRI=1,
  DEPOSITGATE=1 (shipped defaults, FATAL-asserted by the sweep).
- Horizon: 150d death-aware (dead villages stop; no fixed-200d run).
- Seeds: FRESH 8, 96001–96008. Freshness verified 2026-10-28 before
  this file was committed: no per-seed corpus filename matching
  *9600* under evidence/, and no mention of 96001–96008 in dated
  .md files under evidence/2026-10-2*/. (A full-content grep over
  all corpora was started and killed as too slow; the filename +
  dated-note check is the same standard the 2026-10-25 confirm used
  for its band, and is recorded here as the check actually run.)
  Bands NOT reused: pilot replays 944xx/946xx/94801, confirm
  94901–94916, size 94501–94508, casecount 94601–94664, cover
  94701–94732, fix-pilot 94801–94808, recent B bands 10040–10065,
  104xx.
- Definitions (identical to the landed arm, NOT re-derived):
  - Low-health away day = a packMeal call with away === true and
    healthBefore <= 7 (upper bound of the 3–7 HP death shape).
  - Healthy away day = a packMeal call with away === true and
    healthBefore >= 50.
  - A beat fire = a say line emitted during that packMeal call
    containing "away from the haven" (call-attributed capture, the
    same method as the landed sweep — never substring search over
    the whole log).
- RE-PROOF BAR (all required; this is a re-proof, not a new GO):
  1. Existing proof scripts/test-awayvoice-b.js green on current HEAD.
  2. Beat fires on >= 80% of low-health away days in the fresh band
     (the landed arm's own bar, applied to fresh seeds).
  3. Beat fires on 0 healthy away days in the fresh band.
  4. Every fired beat names the traveler of its own packMeal call
     (firstName match, call-attributed) — zero name-borrowing.
  5. Zero src/js diff from this run (narration-only beat already
     landed; nothing to land).
- Instruments (new, derived, deltas declared):
  scripts/sweep-awayvoice-reproof-b.js — DERIVED from
  scripts/sweep-awayvoice-b.js. Deltas: (1) seeds exactly
  96001–96008, DAYS exactly 150, single cell "reproof" (current
  master IS the armed code; there is no baseline cell because no
  code change is being judged — the baseline comparison was already
  proven at pilot + confirm, and re-running a beat-stripped baseline
  would re-litigate a landed verdict); (2) per-seed files
  awayvoice-b-reproof-s<seed>.json in
  evidence/2026-10-28/sim-awayvoice-b-reproof-corpus/; (3) all
  wrappers, policy, env asserts, writeRobust, and day-series code
  otherwise identical to the landed sweep.
  scripts/analyze-awayvoice-reproof-b.js — counts, from the
  per-seed files only: low-health away packCalls, fires among them,
  healthy away packCalls, fires among them, name-match check, and
  one sense excerpt per seed with a fired beat (death-day beats
  preferred). Writes no files.
- Balanced panel (§15): N/A, stated explicitly — there is no
  before/after comparison arm in a re-proof (no code change), and
  the panel measures no pack/voice metric (fourth/fifth sighting
  of the TypeError on sweep corpora is not re-run; the landed
  pilot + confirm evidence already records it). No verdict is
  faked through the panel.
- Metric review (pre-sims):
  - The re-proof cannot re-prove narration-only identity (no
    baseline cell by design); identity was proven at pilot +
    confirm (meal/death/pack-call identity exact, say-log
    subsequence exact). If the fresh band shows a beat firing on
    a healthy day or naming the wrong traveler, that alone fails
    the re-proof regardless of the fire rate.
  - The David health-8 edge (pilot: death-day packCall at 8 HP,
    no beat) is NOT re-tuned here: the <= 7 line stands as
    landed. A fresh-band death-day miss at 8 HP would be
    reported as the same known edge, not as a re-proof failure
    of the rate (the rate denominator is packMeal-call days at
    <= 7, as landed).
  - A fresh band with zero low-health away days would make legs
    2–4 vacuous, not passed: in that case the re-proof is
    INCONCLUSIVE and the pilot-replay seeds would be the
    fallback evidence, reported as such.

## Results — RE-PROOF (filled after sims; judged against the bar above)

- Proof test: scripts/test-awayvoice-b.js 10/10 legs green on current
  HEAD (L1–L5 live harness, A1–A3 analyzer, S1–S2 sweep guards) —
  re-proof leg 1 PASS.
- Fresh-band sweep: 8/8 seeds complete (competent, 150d death-aware,
  PLENTYDEPRI=1/DEPOSITGATE=1). Days: 150×6, 126 (96007, village-lost),
  106 (96008, village-lost); median survival 150d. Deaths total 52.
  Wall numbers (competent-only, not win-seeking): national 0/8,
  table 0/8, wins 0/8, wave-4 6/8, wave-5 0/8. Corpus:
  evidence/2026-10-28/sim-awayvoice-b-reproof-corpus/ (8 per-seed
  files + sweep-reproof.json). Wall-clock slowness was sibling CPU
  contention (load ~9–11; per-seed sim time itself 1.6–2.7s); no
  EPERM flap blocked this run.
- Analyzer (scripts/analyze-awayvoice-reproof-b.js):

| seed | days | away packCalls | low (<=7) | low fired | healthy (>=50) | healthy fired | borrow |
| 96001 | 150 | 62 | 1 | 1 | 50 | 0 | 0 |
| 96002 | 150 | 135 | 1 | 1 | 120 | 0 | 0 |
| 96003 | 150 | 73 | 1 | 1 | 56 | 0 | 0 |
| 96004 | 150 | 156 | 1 | 1 | 141 | 0 | 0 |
| 96005 | 150 | 60 | 1 | 1 | 42 | 0 | 0 |
| 96006 | 150 | 199 | 3 | 3 | 131 | 0 | 0 |
| 96007 | 126 | 108 | 0 | 0 | 99 | 0 | 0 |
| 96008 | 106 | 71 | 0 | 0 | 56 | 0 | 0 |
| TOTAL | — | 864 | 8 | 8 | 695 | 0 | 0 |

- Re-proof legs: (2) fire rate 8/8 = 1.000 >= 0.80 PASS; (3) healthy
  fires 0/695 PASS; (4) name-borrowing 0 PASS; (5) zero src/js diff
  from this run PASS (git diff HEAD -- src/js/ empty; the only
  committed files are this evidence file, the two new scripts, and
  the corpus).
- RE-PROOF VERDICT: PASS — the landed beat still fires on every
  low-health away day on fresh seeds, stays silent on healthy away
  days, and names its own traveler every time.
- Observation (not a failure): all 8 fires in this band are the
  ADEQUATE variant (take == want) — with the packtail top-up live,
  low-health away meals now meet want from the pantry top-up, so
  no short-meal or empty-pack variant fired here. The short (30)
  and empty (1) variants were already proven at pilot + confirm;
  this band proves the adequate variant's honesty: it claims no
  shortfall it does not have, it reports hurt + away + pack.
- Coverage limit (honest, same class as pilot): the band holds
  only 1 starvation death, and it is a HAVEN death (Arnold, s96003
  d10, away=false) — so no away-starvation death-day beat could
  be sampled here. The beat's work in this band is decline arcs,
  not death days (see SENSE). The David health-8 edge did not
  recur as a sampled case and is NOT re-tuned, per prereg.

## SENSE (SENSE-TESTING LAW — one voiced away decline, read in full)

KURT, s96006 (the trough-and-recovery arc the beat exists for):
health 38 (d15, away, silent — above the line) → 24 (d16, away,
silent) → 3 (d17, away, BEAT) → 21 (d18, haven) → 49 (d19, away,
silent) → 77 (d20, haven). The beat fires exactly at the trough
and nowhere else on the arc; the recovery days stay silent, as
they should — the line marks the danger, not every away day.

Quoted beat (d17, from the say log, with its neighbours — the old
Miguel contrast, now answered):

> "d17 Village meal: +1000 kcal, +1L water from the communal pantry.
> (Half ration — they don't trust you yet.)"
> "d17 Kurt eats away from the haven — 1220 kcal from the pack —
> while hurt (health 3/100), far from the haven's shelves."

The haven eats on-screen AND Kurt's own away meal is now named in
the same window: traveler, pack amount, hurt health, distance from
the shelves. Nothing is invented — take (1220) equals want (1220)
and the line claims no shortfall. A player reading d17 knows Kurt
was away, hurt, and fed from his pack while the village ate at
home. The decline that was silent for Miguel is legible here.
PASS.

## Metric review (post-run)

- No metric was re-scored mid-run. The re-proof bar was written
  before the sweep and judged as written.
- The single-cell design (no beat-stripped baseline) is a stated
  limit, not a gap: narration-only identity was proven at pilot +
  confirm, and re-running a stripped baseline would re-litigate a
  landed verdict. What this run proves is current-master firing
  behavior on fresh seeds, which is the question a duplicate
  dispatch actually needs answered.
- Freshness check limit: the full-content corpus grep was killed
  as too slow; freshness rests on per-seed filenames + dated-note
  mentions (the 2026-10-25 confirm's own standard). A filename
  collision inside a corpus JSON's body (not its name) would not
  have been caught — but the sweep writes its own per-seed files
  under new names, so no judged file was overwritten.
- Balanced panel §15: N/A as pre-registered (no comparison arm, no
  panel metric for voice). Not run, not faked.
- Open items for the coordinator backlog (NOT chased here):
  (a) David health-8 threshold edge — still a next-run
  metric-review proposal, not a change; (b) the haven-beat
  name-borrowing line ("Theo paces the hall…") still appears
  beside away beats in the same window — the voice beat
  out-informs it but does not remove it (landed arm's own
  backlog item, still open).

## Verdict

DUPLICATE DISPATCH RESOLVED AS RE-PROOF, NOT A LANDING: the
away-hunger voice beat was already landed 2026-10-25 and is
verified alive on current master (proof 10/10, fresh-band fire
rate 1.000, healthy silence 0/695, zero borrowing, zero src/js
change). NOTHING TO MERGE AS A GAME CHANGE — the branch carries
only this evidence file, the re-proof sweep + analyzer, and the
fresh-band corpus. Coordinator action: close the duplicate arm;
do not re-land the beat.
