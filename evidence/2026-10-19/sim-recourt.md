# sim-recourt — re-court DEATH-MODE attribution (flesh-out loop A, 2026-10-19, ARM sim-recourt)

Run: fleshout-20261019T2115Z, arm sim-recourt. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY DIAGNOSTIC — zero src/js changes, zero scripts/policies changes.
Instruments + evidence only.

Canon: docs/CANON.md (read first). docs/SCALE.md — regional links/diplomacy/
polities/seasoning, the canon doc for the scale road this target sits on.
No canon doc covers the bond/standing/v3-switch systems themselves (the
seasoning bar is 30d/40-trust; the deferral table and the v3 consolidator
switch are engine code — src/js/standing.js, hierarchy.js — and policy code
— belongseek's rideConsolidator). Said so here, not invented.

Named next from sim-seasonblock (evidence/2026-10-19/sim-seasonblock.md):
the DIAG named the SEASONING blocker per bond on the 3 stall seeds with
day-exact evidence (DIAG-GO, 6/6 bonds, 0 unexplained) — but left
unexplained why the runs themselves died when they did: the v3 re-courts
died before seasoning on 2/3 stall seeds (age 29/17 at death), and s64207's
re-court died at d149 one day after seasoning's paywall was crossed. This
arm answers: per re-court, the death mode and the day-exact mechanism.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**PRIMARY (DIAG-GO):** fraction of re-courts (the 3 re-court bonds on the
stall seeds) with a day-exact attributed death mechanism. GO bar: all
re-courts on the stall seeds attributed (DIAG-GO), or an honest
"unexplained: X" with the named next instrument.

**DIAGNOSTIC MISS:** any re-court without a named, day-exact death mechanism.
A miss is NO-GO, never re-scored against a friendlier bar mid-run (§14).

**Horizon:** 180d death-aware (dead villages stop simulating; the honest
surface for a pre-seat scale question).

**Seeds:** 64201, 64202, 64207 (the stall seeds) × {belongfeast} = 3 runs.
Shared substrate with seasonblock: seeds 64201–64208 × {leadfeast,
belongfeast}, 180d death-aware horizons, the feastgap substrate — the same
corpus the question is drawn from.

**Substrate (this arm):** the feastgap substrate, verbatim:
`withSeatDrive(withWinDefer(withReposition(TF base)))` on belongfeast
tribfloor base. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 (same
instrument envelope as the seasonblock sweep, so trajectories stay
comparable seed-for-seed).

**Instrument:** scripts/probe-recourt-20261019.js (village-death
instrument: per-day villageSnap — pantry, hungryDays/scattered/extinct
flags, roster-living count, scholar-alive, vid; full death-tele records via
the vendored seasonblock installDeathCapture — identical by construction;
flow wraps via FG.installFlowRecording; a filtered Game.say log capturing
death-relevant fiction; succession days; link.history dump. DET/SMOKE
gates). scripts/analyze-recourt-20261019.js (per-re-court death-mode naming:
bond death — neglect-snap / walked / active-at-village-death — plus village
death — scattering / extinction / no-successor — plus the day-exact
mechanism tail: pantry curve, tribute pressure, death channels, succession
churn). scripts/test-recourt-20261019.js (proof: analyzer fixtures
RED→GREEN, village-snap extraction fixture, say-filter fixture, DET 3/3
byte-identical).

**No [needs-eyes]**: instrument-only, no player-facing change.

## Results

3/3 runs swept, 0 bad files, 0 instrument errors. Death days reproduce the
seasonblock corpus byte-for-byte (86/83/150) — the trajectories are the same
runs; only the attribution is new.

**Verdict: DIAG-GO.** 3/3 re-courts carry a day-exact attributed death
mechanism. 0 unexplained.

### Per-re-court death attribution (day-exact)

**s64201 — EXTINCTION d86 (combat attrition), the bond died WITH the village**
- Death mode: **extinction** — "Nobody is left. Not scattered, not gone
  looking for food — dead, every one, and the fire has nobody left to warm.
  The village ends here, the way villages end when the teeth find them
  first." (game.js extinction path). Pantry 13,189 at death — this is NOT
  starvation.
- Mechanism, day-exact: the village had been bled down for weeks (living
  1/6 by d76 — the rest of the roster dead on their feet). d82 Rosa died to
  a monster in the wild (channel wild); d83 Ella died to a monster in the
  wild; d84 the policy paid tribute 11,275 kcal to Thornfield (the
  ratcheted 11,250/wk — paid, arrears 0); d85 a 4-raider raid hit Haven at
  night; d86 the show-fight ("6 heads rise out of the murmur — three all
  MOUTH") killed scholar yara_haddad (combat, raid channel) and
  catalina_reyes (combat, expedition channel). Succession yara→meera fired
  d86 — and there was no one left to pick up the Codex's fire.
- The re-court bond (village_2/Thornfield, f57): ACTIVE at village death,
  age 29, trust 15. Seasonblock's "one day short of the 30-day bar" is now
  corrected: the trust trajectory ran 30 (d66) → 16 (d69) → 13 (d72) →
  11 (d75) → 22 (d84) under succession haircuts (d67) and the mourning gag —
  even at age 30 the bond would have failed on trust<40 (seasoned needs
  age≥30 AND trust≥40). The real killers were combat attrition and, behind
  it, the succession churn that kept the trust bar out of reach. Death
  mode: **window combat → extinction**.

**s64202 — SCATTERING d83 (famine), the bond died WITH the village**
- Death mode: **the scattering** — "Haven couldn't hold. On the third
  hungry day, people started walking — in different directions. The
  scattering, again." (game.js famine path, 3-day limit). Elijah starved
  d82 ("Elijah starved. Slowly. The village is 8 now."), Victor starved d83.
- Mechanism, day-exact: three night raids in a row — d78 The Red Table
  carried off ~1,200 kcal, d79 Stonebridge ~1,493, d80 Emberhold ~1,609
  (~4,300 kcal total, fiction said aloud each night). d81 the Binding oath
  was sworn at Emberhold's court — the re-court seal: 3,091 kcal. d81
  pantry 6,657 → 400; d82 pantry 0 (first STARVING beats, "The spiral has
  started"); d83 second starvation death, third hungry day → scattering.
- The re-court bond (village_0, f66): ACTIVE at village death, age 17,
  trust 68, arrears 0 — a healthy bond. The village starved around it. The
  tribute here was courtship terms (~5k/wk: d67 5,014 / d70 5,033 / d77
  5,154), NOT the ratchet. The killers were raid attrition and the oath
  sealing cost, on a pantry the re-court timing (d66, after the policy's
  12k wait) had left thin. Death mode: **starvation — the scattering**
  (raids + oath gift, not the tribute ratchet).

**s64207 — NEGLECT SNAP d149 (bond), then SCATTERING d150 (village)**
- Bond death mode: **the neglect snap**, day-exact. The bond history:
  d91 succession → grief leverage ratchets tribute 7,500 → 11,250/wk;
  d98 last tribute paid (11,250); d112 first arrears (11,250); d119
  22,500; d126 33,750 (+ d127 demand REFUSED); d133 45,000; d140 56,250;
  d147 67,500; d149 succession beat ("With Haven grieving again,
  Thornfield installs their own speaker at the table — and reaches for
  the grief card once more. The table has heard it before: the grief card
  is spent. Tribute stays at 11,250 kcal/week.") and in the same breath
  'Link broken (succession).' — "In the chaos, the neglected link snaps —
  no tribute, no deeds, no one left who kept it. Nobody meant it. That's
  how these things go." Bond age 92, endTrust 0. (Confirms seasonblock's
  attribution independently, with the fiction joined.)
- Village death mode: **the scattering** d150 — "Haven couldn't hold. On
  the third hungry day, people started walking — in different directions."
  Mechanism: combat attrition collapsed the workforce d91–137 (raid deaths
  d91, d99, d101, d124, d132, d137; wild deaths d119, d134; living 9 → 1)
  while the tribute ratchet made the bond unpayable; pantry fell
  46,550 (d90) → 0 (d138) feeding 1–4 people; d149 elijah_scott died of
  lockjaw (disease — "The spasms lock everything shut at once... It never
  opens again"); d149 succession (elijah→gen_lznvlrx) + the neglect snap;
  d150 third hungry day with pantry 0 → scattering.
- Death modes: bond = **neglect snap (d149)**; village = **starvation —
  the scattering (d150)**. The ratchet didn't kill the village directly
  (no tribute was paid after d98); it killed the bond's good standing,
  which killed the bond, one day before famine scattered what was left.

### The mechanism taxonomy (the named halves)

| Seed | Re-court bond | Bond death | Village death | Primary mechanism |
|------|---------------|------------|---------------|-------------------|
| 64201 | village_2 f57, age 29 | active-at-village-death | extinction d86 | window combat attrition (wave-3 wild + raids + the d86 fight) |
| 64202 | village_0 f66, age 17 | active-at-village-death | scattering d83 | starvation: 3 raids (~4.3k) + oath gift (3,091) |
| 64207 | village_2 f57, age 92 | neglect snap d149 | scattering d150 | tribute ratchet → arrears → snap (bond); workforce collapse + famine (village) |

The neglect snap fired on 1/3 re-courts. The tribute ratchet killed a bond
(s64207) but did NOT starve any village directly — the famines came from
raids + oath costs (s64202) and workforce collapse (s64207). Window combat
killed one village outright (s64201) and bled the other two.

### Sense-testing (SENSE-TESTING LAW)

Read: the filtered say-log fiction around each death (d82–86 s64201;
d78–83 s64202; d147–150 s64207), joined to the day-exact instrument.

**The deaths read as sensible fiction, all three.**
- s64201's extinction lands in one breath: the Codex page-turn ("Yara
  Haddad is dead. You didn't ask. It knew."), the treaty line ("Yara is
  dead — and the dead hold no treaties. Every link Haven has shakes."),
  the grave beat, the succession docket line ("The village's quarrel was
  with Yara — and Yara is dead. The sentence doesn't cross the grave."),
  then the extinction sentence. Combat attrition reads as combat
  attrition: the wild-monster deaths are announced days before the end,
  the raid is announced the night before, the final fight is played on
  screen (the mouth-heads/eye-heads show — a real contest, not a roll).
- s64202's famine is narrated as a cascade: three consecutive nights of
  raids with the kcal carried off said aloud, the oath gift said aloud
  ("sealed with 3,091 kcal of Haven's harvest"), the STARVING spiral
  lines, the two slow starvation deaths ("starved. Slowly."), the half-
  rations vote, the granary-gap line ("The granary wants food that WAITS —
  0 of 2,000 kcal preserved"), and the scattering sentence. Every step of
  the causal chain is said aloud.
- s64207's double-beat (seasonblock's read, re-confirmed): the spent-grief-
  card beat and the neglect snap are said in the same breath, and the
  snap line names its own cause ("no tribute, no deeds, no one left who
  kept it"). The lockjaw death is a played-out disease beat (2-day
  warning, the jaw locking, the grave). The scattering the next morning
  reads as the coda, not a surprise.

**Blanks (robotic/static):** one instrument note, carried from seasonblock:
the d86 show-fight's eye-head narration repeats its line ~30 times in the
log ("The eye-head blinks aside — it only watches.") — that's the
instrument's broad filter catching combat narration, not a game bug, but
the in-game repetition of that line across a long fight is worth a sense
note for the contest-fiction lane.

## Metric review

The pre-registered bar (all re-courts on the stall seeds with a day-exact
attributed death mechanism; 0 unexplained) is met: 3/3 attributed —
s64201 extinction d86, s64202 scattering d83, s64207 neglect snap d149 +
scattering d150. No re-score (§14). DIAG-GO stands.

**§14 honest metric doubts — for the NEXT run, not this one:**
1. "The v3 re-courts died before seasoning" was slightly mis-framed: on
   s64201/s64202 the bonds didn't die — the villages did (extinction /
   scattering) with the bonds active at age 29/17. The interesting half
   was the village death mode, which is what this arm measured. On s64207
   the bond did die (neglect snap, d149) one day before the village
   scattered.
2. The "age 29, one day short" framing from seasonblock understated the
   s64201 case: the bond's trust had collapsed to 11–22 under succession
   churn (d67 on), so even at age 30 it would have failed on trust<40. A
   next arm on the succession cost stack (the named steve-call from
   seasonblock) should measure how often succession churn keeps re-courted
   bonds under the trust bar — the "trust churn" channel beside the
   "age reset" channel.
3. The tribute ratchet's kill mode is bond-specific, not pantry-specific:
   on s64207 the ratchet broke the bond's good standing (arrears) without
   draining the pantry (no tribute paid after d98); the pantry collapse
   came from workforce loss. A dip-hold arm should track bond-death and
   village-death as separate outcomes.

## Named nexts

1. **steve-call (carried from seasonblock, sharpened):** the succession
   cost stack on the belong road — haircut + mourning gag + tribute ratchet
   per succession. New evidence: the same stack also keeps re-courted
   bonds under the 40-trust bar for weeks (s64201: trust 11–22, d69–84),
   so succession churn attacks seasoning on BOTH legs (clock via the
   neglect snap, trust via the haircut/gag). Is that the intended price of
   succession, or should the trust cost be once-per-primary?
2. **sim-diphold (seasonblock's named next, GO — unchanged):** the
   dip-HOLDING arm now has a second outcome to pre-register: bond-death
   vs village-death as separate primaries (s64207: snap d149, scattering
   d150 — one day apart, different mechanisms).
3. Out-of-arm sense note: the eye-head show-fight line repeats ~30× in a
   long fight — named for the contest-fiction lane, not chased here.

## Out-of-arm findings

(Appended to `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`; not chased.)
- [open] 2026-10-19 — contest-fiction — the show-fight eye-head line ("The eye-head blinks aside — it only watches.") repeats ~30× across a long fight (s64201 d86) — a repetition/variety blank for the contest-fiction lane. (sim-recourt)

## Convergence

**converging.** The diagnostic answered its question (DIAG-GO: 3/3
re-courts with day-exact attributed death mechanisms, 0 unexplained) and
corrects one seasonblock framing (s64201's trust bar was already failed at
d69–84 — the "one day short" was the age leg only). The axis stays
converging: the stall seeds' village deaths are now fully mechanized —
window combat (extinction), raid+oath famine (scattering), and the
ratchet→snap→famine chain — and the armed lever arms (sim-diphold,
sim-switchtime) inherit a clean mechanism map.

## Files

- scripts/probe-recourt-20261019.js — sweep probe (villageSnap per-day
  series, full death-tele records, filtered say-log fiction capture,
  succession days, link.history dump; DET/SMOKE gates)
- scripts/analyze-recourt-20261019.js — per-re-court death-mode naming
  (bondDeath / villageDeath / mechanismTail / attribute, fails closed)
- scripts/test-recourt-20261019.js — proof: analyzer fixtures RED→GREEN,
  village-snap extraction, say-filter fixture, DET 3/3 byte-identical
- evidence/2026-10-19/perseed-recourt/belongfeast/s64201.json,
  s64202.json, s64207.json — 3 per-seed sweep JSONs
- evidence/2026-10-19/recourt-analysis.json — analyzer output
- evidence/2026-10-19/sim-recourt.md — this file
