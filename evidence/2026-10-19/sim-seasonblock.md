# sim-seasonblock — belong upward-bond SEASONING-BLOCKER attribution (flesh-out loop A, 2026-10-19, ARM sim-seasonblock)

Run: fleshout-20261019T2015Z, arm sim-seasonblock. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY DIAGNOSTIC — zero src/js changes, zero scripts/policies changes.
Instruments + evidence only.

Canon: docs/CANON.md (read first), docs/SCALE.md (regional links / diplomacy / polities /
seasoning — the canon doc for this target; the deferral-5 bar itself is engine code,
src/js/standing.js — no canon doc covers the deferral table itself, said so here, not invented),
docs/PRESERVATION.md (pantry flows relevance).

Named next from sim-feastgap (evidence/2026-10-19/sim-feastgap.md): the deferral-5 gap is
M-SEASONED-LINK-DIPLOMACY (t5 = 200 needs +34/seasoned-link diplomacy; lead's 3 subordinate
bonds season together, dip 0→102 on a single day d57–68; belong's upward bond carries trust
70–100 but seasons 0–1x per run). Trust is NOT the blocker. The split between link-age resets
(succession churn ~10/run: "the bond is young" beat fires per succession; the v3 consolidator
switch re-courts) vs the primary's polity never reaching regional scale is UNMEASURED — this
arm measures it.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY (DIAG-GO):** the blocker named per bond — one of (age-reset by succession /
age-reset by v3 re-court / primary polity < 4 fires) — with day-exact evidence on the stall
seeds, 0 unexplained stall seed-pairs. A pair is "unexplained" if no blocker from the
pre-registered set with day-exact evidence pins it, or if any bond-day carries an
'unexplained' failing leg (the analyzer fails closed on it).

**DIAGNOSTIC MISS:** the blocker unidentifiable on any stall seed, or ≥1 unexplained
stall seed-pair. A miss is NO-GO, never re-scored against a friendlier bar mid-run (§14).

**Horizon:** 180d death-aware (dead villages stop simulating; the honest surface for a
pre-seat scale question).

**Seeds:** 64201–64208 (the feastgap seed set) × {belongfeast (focus: stall seeds 64201,
64202, 64207), leadfeast (paired comparison for attribution power)} = 16 runs, paired on
identical seeds.

**Substrate (this arm):** the feastgap substrate, verbatim:
`withSeatDrive(withWinDefer(withReposition(TF base)))` on {leadfeast, belongfeast} tribfloor
bases. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 (SEATDRIVE='0' → seatdrive pure delegation; REPOSITION
unset → inert; VETREL unset → companion-veteran channel OFF; KILLDISC=1 → read-only
kill census — the same instrument envelope as the feastgap sweep, so trajectories stay
comparable seed-for-seed).

**Instrument:** scripts/probe-seasonblock-20261019.js (bond census: per link per day —
age (= scholar.day − link.day; link.day is written once at _formLink and NEVER reassigned,
grep-verified 2026-10-19, so an age reset is always a break+re-form), trust, arrears,
_linkSeasoned (age≥30, trust≥40), _linkRegionalPlus (for the belong bond: polityOf(primary)
= good standing (trust≥50, arrears 0, age≥14) AND the foreign realm at ≥4 fires), per-link
dip grant today, the foreign primary's polity fire count (2 + fp.subs.length), scholar vid;
succession days day-exact; "the bond is young" / speaker-install / grief-card / oath-summons
beat capture via call-through Game.say wrap; full link.history[] dump at run end — breakLink
notes 'Link broken (<how>).' day-exact, which names the reset cause: 'walked' = v3 re-court,
'succession' = succession, other = other). scripts/doorcheck-seasonblock-20261019.js
(deferral-5 door check on the stall seeds: standingDeferral(5) + capped-standing trajectory,
pure reads, DET-pinned). DET/SMOKE/FIDELITY gates; scripts/test-seasonblock-20261019.js
(proof: dipFailLeg/nameReset/stallVerdict fixtures RED→GREEN (36/36), census-extraction
fixture, vendored-installDeathCapture verbatim parity guard, DET 4/4 byte-identical,
FIDELITY 2/2 byte-identical). scripts/analyze-seasonblock-20261019.js (blocker naming +
corpus summary).

**No [needs-eyes]**: instrument-only, no player-facing change.

## Results

16/16 runs swept, 0 bad files, 0 instrument errors. Substrate verified in every
per-seed JSON (`pre-seat-winside-novetrel`).

**Wall on this substrate, current master 8c055140a (16 runs):** national 10/16, table
12/16, wins 0/16, wave-4 11/16, wave-5 0/16, median survival ~120d (max 182d).
leadfeast: national 6/8, table 5/8, wave4 6/8, median 110d. belongfeast: national 4/8,
table 7/8, wave4 5/8, median 131d.

**BASE DRIFT vs feastgap (disclosed):** the feastgap sweep ran on base e374e9a3; this arm
ran on 8c055140a. Trajectories moved: feastgap's belongfeast-s64207 had "dip 0 the whole
run"; on current master the same seed's re-courted bond seasons at d87 and grants +34 for
26 days. The stall-seed findings below are measured on current master. A sibling lever
sized on feastgap's numbers should re-sweep.

**Verdict: DIAG-GO.** Every bond on the 3 stall seeds carries a blocker named from the
pre-registered set with day-exact evidence; 0 unexplained stall seed-pairs (0
'unexplained' bond-days across the corpus). The doorcheck confirms the door never opened
on any stall seed (firstDef5 null on all three; peak cap 100/100/159).

### Per-bond blockers (day-exact)

**s64201 (belongfeast, died d86) — the door never opened (cap peaked 100, the plenty ceiling)**
- Bond 1 → Emberhold: formed d20. Aged to 35; the 5 aged days (d50–54) ALL fail on
  **primary polity < 4 fires** (trust 66–70, arrears 0, Emberhold's realm stuck at 2 fires).
  Walked d55 by the **v3 re-court** (consolidator switch: 'Link broken (walked).').
- Bond 2 → Thornfield: re-courted d57 (+2d, a 4-fire realm). Trust 30→33→25→29 under
  succession churn (d59, d67); the village died d86 with the bond at **age 29 — one day
  short of the 30-day bar**. Blocker: **age-reset by v3 re-court** (re-court product of
  the d55 walk).

**s64202 (belongfeast, died d83) — the door never opened (cap peaked 100)**
- Bond 1 → village_2: formed d20. 5 aged days (d50–54) ALL **primary polity < 4 fires**.
  Walked d55 by the **v3 re-court**.
- Bond 2 → village_0: re-courted d66 (+11d lag — the policy waited for pantry > 12k).
  Died d83 at age 17. Blocker: **age-reset by v3 re-court**.

**s64207 (belongfeast, died d150) — the pure stall; cap peaked 159 on d90 (war 25 + dip 34 + plenty 100), 41 short of the 200 bar**
- Bond 1 → Stonebridge: formed d20. 7 aged days (d50–56) ALL **primary polity < 4 fires**
  (Stonebridge's realm at 2 fires; trust in the 90s). Walked d57 by the **v3 re-court** —
  the bond was 37 days old, i.e. the switch threw away an age-seasoned bond whose realm
  would never consolidate. Re-courted Thornfield the SAME day (+0d; a 4-fire realm).
- Bond 2 → Thornfield: formed d57. Tended to trust 100 (d69 young-link succession beat,
  d71 Binding oath SWEAR for 3,111 kcal, d76 renegotiation silence → tribute 7,500/wk).
  **Seasoned d87 → +34 dip granted, held 26 days (d87–d112).** Then the dip-HOLDING
  failure: d91+ succession churn, grief leverage ratcheted tribute 7,500 → 11,250/wk;
  d112 first arrears (pantry couldn't carry 11,250/wk) → good-standing bar fails → dip 0
  from d113; arrears 11,250 → 67,500 by d147; trust 100 → 0 (haircuts + mourning gag +
  a d127 demand REFUSED); d149 **neglect snap** ('Link broken (succession).'). Blocker:
  **age-reset by succession** — with the dip granted d87, held 26d, then lost to
  trust<40/arrears (the dip-HOLDING problem, outside the pre-registered set — see metric
  review).

### The v3 re-court's timing (the mechanism the instrument was built to see)

On all three stall seeds the consolidator switch fired at d55–57 — 5–7 days AFTER the
first bond crossed the 30-day age bar, and on bonds whose realms sat at 2 fires while a
4-fire realm showed its hand. The switch is doing its designed job (ride the
consolidator). Its cost, measured: on s64201/s64202 it discarded age-35 bonds for
re-courts that died before seasoning (age 29 / 17 at death); on s64207 it discarded an
age-37 bond and the re-court seasoned — then succession economics killed the dip.

### Lead paired comparison (attribution power)

Lead's 3 subordinate bonds form d25–27 and grant dip on the SAME day (d57, d63, d68 —
the +102 landing) on 7/8 seeds; no bond is ever walked. Belong's single upward bond is
walked at d55–57 on all three stall seeds — the road's own switch restarts the clock 5–7
days after the age bar, while lead's bonds are never touched. (s64206: both villages
died d22, no bonds.)

## Village assessment

What the villages looked like: 16 villages on the pre-seat full win-side stack without
vetrel. The belong villages are not starving villages — s64207's pantry carried the
tribute through d112 and the village stood 1st of 6 while its bond earned +34. They are
villages whose diplomacy engine keeps getting reset by their own road's verbs: the v3
switch walks the bond at d55–57 (right after the age bar, when the realm arithmetic is
finally legible), and succession churn — 9–11 successions per stall run — ratchets the
tribute (grief leverage ×1.5 per qualifying succession: 5,000 → 7,500 → 11,250/wk) until
arrears break the good-standing bar and the neglect snap breaks the bond.

Who thrived and who died and why: the scholar dies 9–11 times per stall run on both
roads (the same field-combat grind). The divergence is not a death gap; it is a
standing-composition gap with a re-court tax: belong's upward bond is re-formed at
d55–57 on every stall seed, so its 30-day clock restarts exactly when lead's three bonds
land their +102. On s64207 the re-court worked — the bond seasoned and paid +34 for 26
days — and then the succession economy (tribute ratchet → arrears → trust collapse →
neglect snap) took the dip back.

What was missing: not trust (70–100 on the stall bonds), not food (pantries carried
tribute for months) — but a realm that consolidates (the first primaries sat at 2 fires
forever) and, once found, a way to HOLD the dip through succession churn (the tribute
ratchet outran the pantry).

## Sense-testing (SENSE-TESTING LAW)

Read: all captured succession beats on s64201 (8) and s64207 (7), joined to the bond's
TRUE age that day from the census.

**The "bond is young" beat is fiction-honest everywhere it fires.** s64201: d25 (true
age 5, Emberhold), d59 (true age 2, Thornfield — the re-courted bond), d67 (true age 10).
s64207: d69 (true age 12, Thornfield). Zero firings at true age ≥ 21 across the corpus.
The beat's age claim matches the instrument on every firing — the fiction never lies
about the bond's age.

**The grief economy reads as designed.** The ratchet is said aloud each time ("Grief is
leverage, and they know it. Tribute rises to 11,250 kcal/week."), the anti-repeat idiom
fires honestly ("reaches for the grief card once more... the grief card is spent.
Tribute stays"), and the d149 neglect snap is said aloud ("In the chaos, the neglected
link snaps — no tribute, no deeds, no one left who kept it.") in the same breath as the
spent-card beat — the bond would hold, but neglect killed it. That double-beat reads
sensically as fiction: two true things at once.

**The Binding beat is played, not rolled.** s64207 d71: "SWEAR the oath of the realm (a
gift seals it), SERVE at their court (seven days of your speaker's life), or WALK —
break the link and stay a free fire" — answered d72 with a real 3,111 kcal gift ("Swore
the oath of the realm").

**Blanks (robotic/static):** none in the beat text. One instrument note: the v3
consolidator's walk itself ('Link broken (walked).') has no SAY line captured by this
instrument's beat filter — the re-court is visible in link.history[] but not narrated in
the captured beat set. Whether the walk is said aloud elsewhere (gossip/ovEvent) was
not checked — named as a sense question for the next run, not a finding.

## Metric review

The pre-registered bar (blocker named per bond from the set, day-exact, 0 unexplained
stall seed-pairs) is met: 6/6 bonds named, 0 'unexplained' bond-days in the corpus, 0
unexplained pairs. No re-score (§14). DIAG-GO stands.

**§14 honest metric doubts — for the NEXT run, not this one:**
1. **The dip-HOLDING problem is outside the pre-registered set.** s64207's bond granted
   +34 for 26 days then lost it to the succession economy (tribute ratchet → arrears →
   trust collapse → neglect snap). The three candidates cover seasoning; none covers
   holding. A next arm should pre-register the holding question (dip-days-held, arrears
   onset, trust decay curve) as its primary.
2. **"age-reset by succession" never resets the clock directly.** grep-verified:
   link.day is written once at _formLink and never reassigned — succession cannot
   re-young a bond by itself. The candidate names only the funeral-hour neglect snap
   (trust<20 + no upkeep 14d → break → re-court). The feastgap fiction read ("every
   succession re-youngs it") is not what the engine does; what succession does is
   haircut trust (-8), gag gains (7-day mourning), and ratchet tribute (grief leverage).
   The steve-call candidate in the backlog (should succession re-young the bond or
   merely delay the verdict?) is answered by the code: it does neither to the clock —
   the question for Steve is whether the haircut/gag/ratchet stack is the intended
   succession cost on the belong road.
3. **Base relativity.** This arm ran on 8c055140a; feastgap ran on e374e9a3. s64207's
   dip went 0 days → 26 days between bases. Re-sweep before sizing any lever on these
   numbers.
4. **The v3 switch's walk is policy, not engine.** The d55–57 walks are belongseek's
   rideConsolidator (policy-side). The engine never walks a bond unprompted. A lever arm
   on the switch's timing (e.g. don't walk a bond that already crossed the age bar) is
   policy-side and safe to run multi-arm.

## Named nexts

1. **sim-diphold — GO.** The dip-HOLDING arm: pre-register dip-days-held as the primary
   (GO: median held-days up with the tribute ratchet capped or arrears-tolerant
   good-standing), on the s64207-like seeds where the bond seasons. Candidate levers:
   cap the grief-leverage tribute ratchet on the belong road, or make arrears-clearing
   (not arrears-absence) the good-standing bar. Policy-side safe.
2. **sim-switchtime — GO.** The v3-switch-timing arm: don't walk a bond that already
   crossed the age bar (30d) unless the new primary's realm is ≥5 fires (strictly
   better, not merely ≥4). Policy-side, multi-arm safe. Pre-register: re-courted-bond
   seasoning rate on the stall seeds.
3. **steve-call:** the succession cost stack on the belong road — haircut + mourning gag
   + tribute ratchet per succession. With ~10 successions/run the ratchet alone
   (5,000 → 11,250/wk) bankrupts the tribute the road's standing bar requires. Is that
   the intended price of succession, or should the ratchet be once-per-primary?
4. Sense question for the next run: is the consolidator's walk narrated aloud anywhere
   (gossip/ovEvent), or does the bond vanish silently from the fiction?

## Out-of-arm findings

(Appended to `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`; not chased.)
- (this arm's two named nexts are above, not in the backlog — the backlog's
  seasoning-blocker item is answered here)

## Convergence

**converging.** The diagnostic answered its question (DIAG-GO: 6/6 bonds named with
day-exact evidence, 0 unexplained pairs) and hands the coordinator two GO lever arms
(sim-diphold, sim-switchtime) plus one steve-call. The axis stays converging: wins 0/16,
wave-5 0/16 on this substrate; national 10/16, table 12/16.

## Files

- scripts/probe-seasonblock-20261019.js — sweep probe (bond census + beat capture + vendored feastgap death/flow instruments; DET/SMOKE/FIDELITY gates)
- scripts/analyze-seasonblock-20261019.js — blocker naming + corpus summary
- scripts/doorcheck-seasonblock-20261019.js — deferral-5 door check on the stall seeds
- scripts/test-seasonblock-20261019.js — proof: fixtures RED→GREEN (36/36), census extraction, verbatim parity guard, DET 4/4
- evidence/2026-10-19/perseed-seasonblock/{leadfeast,belongfeast}/s64201–s64208.json — 16 per-seed sweep JSONs
- evidence/2026-10-19/seasonblock-corpus-summary.json — corpus summary (analyzer output)
- evidence/2026-10-19/seasonblock-doorcheck.json — door check (def5 + capped-standing trajectories on the stall seeds)
- evidence/2026-10-19/sim-seasonblock.md — this file
