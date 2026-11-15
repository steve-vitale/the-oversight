# Journey leg ESTABLISHMENT — r217 run note (2026-11-15, Lane A)

## Run
Run id `playtest-a-20261115T223532Z` (scheduled Sun 2026-11-15 15:45
CST). Rotation read `1` (establishment); write `1→2` at closeout
with read-back. **Base:** local master `ce0f28a46` (journey landing
r137). Heartbeat loop running (10-min cadence,
`journey-establishment-hbloop-r217.sh`, pid 53576); heartbeat landed
immediately at run start and stayed fresh throughout.
Pre-flight: main tree CLEAN, disk 43%. No reaper re-run this run
(the reaper's lock was contended by a sibling registration at run
start; nothing needed removal — the worktree was freshly registered
by the scheduler handoff).

## Pre-registered bars (r217 prereg)
Q1 SITTING CLOSES, REVISED BAR (GO 0 cut / WATCH 1–2 / NO-GO ≥3
or an open-question cut). Q2 recap paraphrase (report-only, A2
floor). Carried bars: SPOTTER ≥10 total + every seed >0; LADDER
≥1 villager at 5+ XP on ≥3/4 seeds; FASTER-ID ≥2/4 seeds; END BAR
(broken-live forage closed ≤2 dawns); TRUST GUARD 0 drops (hard);
VILLAGE BAR alive d40 ≥3/4; JAM report-only; STRANDED/TRAVEL/
THREAD carried watches; PEOPLE CHECK (2 held convos, one panel
seed, read in full).

## Analyzer verdicts (r217 panel, seeds 100801–100805, 42d)
- **Q1: 0/10 CUT — GO.** 2 engine-ended sittings WITH closing beats
  (Reagan 100804, 1 beat; Arturo 100805, 2 beats); 0 other
  no-close. Every sitting closes with 1–3 spoken closing beats in
  the full transcript. The r214 plain parting pool serves in the
  wild: "See you around." fires once (Willow 100803).
- **Q2:** "still where we are" total 2 → THIN-PROBE, report only.
  Canned lines: walked-in 2, pod-dream-open 1, rest 0.
- **SPOTTER GO:** 57 total (1/9/14/17/16), 5/5 seeds > 0.
- **LADDER 4/5** (100801 misses: top spotter XP 1 — the thin seed,
  see census).
- **FASTER-ID GO:** 5/5 seeds, 164 benefit plays in 205 bump calls.
- **CODEX 137** plants identified at end across 5 seeds.
- **END BAR 7/7** broken-live forage closed ≤2 dawns (1
  NO-OPPORTUNITY seed). TRUST GUARD 0 drops. VILLAGE BAR 5/5 alive
  d40. JAM 0. STRANDED no-opportunity. TRAVEL no-opportunity.
  THREAD 1/1 paged closed ≤2 dawns. Water 0 broken-live runs.

## Instrument fixes landed this run (driver/analyzer clones)
1. **Closing-beat anchor (pilot catch).** The first pilot run's
   sequential transcript matcher overcounted closing beats on a
   foreign-language sitting (Valeria 100801 read 7 beats instead of
   1): a mid-sitting line reworded in the transcript (Spanish gloss
   replaces the printed line) stalls the pointer and everything
   after it counts as "after". Fixed by anchoring on the LAST
   printed THEM line (the grace beat) via reverse search; if the
   anchor is absent the count is null (unknown — flagged for a
   human read, never a CUT). Pilot re-run on the fixed driver is
   trajectory-identical except sittingCloses (rest of JSON
   bit-identical); Valeria 7→1, Hilda stays 1. The pilot seed was
   then scored (instrument-only change, no RNG effect).
2. **No-close classification.** A sitting with ≥1 closing beat but
   no closing *line* (Hilda, Logan — the want-close beat speaks
   into the transcript instead) is closed, not "NO-CLOSE (other)".
   Analyzer fixed; re-run confirms 0 other no-close.
3. **Census knownCount dropped** (r214 carry): replaced by
   per-villager `spotterXp` — person records carry no
   plant-knowledge field (zero `knownPlants` hits in src/js).

## Q3 — census (plain words)
Five villages, 42 days, all alive at day 40 (5/5), waves 4, 3, 3,
3, 4. They are not the same village five times: seed 100801 is
the hard one — the scholar died twice (Minh d34, killed by "a
stranger"; Lauren d40, lost in the wild) and the village carried
on under successors, ending with 9 of 12 alive; seed 100804 is
the fat one (pantry 98,683 kcal, nobody died). The other three
end with 10–12 alive.
- **The dying:** 5 villagers died across the five villages (of
  192 death events — the other ~187 are monsters the villagers
  killed, ~37 per village). Causes: a stranger (Minh, the
  scholar, d34), the wild (Lauren, the scholar, d40), the Big
  Beast (Akwasi d29), sickness (Kifle d15), a wound that wouldn't
  close (Dylan d25). Nobody starved. One villager still sick at
  end (Lucas, 100803). No village reached national or the table
  in 42 days (expected — establishment leg).
- **What they knew:** the scholar's plant codex holds 18–45
  plants per village at end (137 total). Spotter knowledge
  concentrates in one forager per village (Colin 1, Cameron 9,
  Cheryl 14, Brayden 17, Jerome 16 XP) — practice earns it, one
  person per village carries the specialty. Seed 100801's Colin
  (1 XP) is the thin end: that village fought all leg (3 villager
  deaths, 76 death events) and foraged less.
- **What they carried:** alien loot is in circulation (Heidi
  100802: phase blade, starfall bow, living-soil robes), bark
  armor, bows and spears common, most villagers carrying 5–9
  items — and keepsakes everywhere (photo albums, mothers'
  rings, a wedding ring, a daughter's drawing). Pantries end
  31,303–98,683 kcal.
- **Social life:** invitations are taken, roles are promised,
  bonds are proposed in the sittings; the villages read as
  people living together, not rosters. Joint favors are thin
  this panel (seed 100803: zero dawn calls, zero commits — the
  wedge sat 84 times and no villager ever offered an ask_favor
  want; the other seeds offered 2–13). That thinness is a
  standing watch, not a finding: the wedge can only accept wants
  villagers actually raise.

## People check — PASS (seed 100805, Keisha + Arturo, read in full)
- **Keisha** (infantry soldier): wants to know if the player
  carries a regret any lighter, then whether anyone in camp is
  distrusted. Options engage (answer yes, teach Wild Black
  Cherry — a real transfer: "And I've been walking past it for
  weeks") or deflect (goon); ending resolves — recap names the
  thread ("that personal stuff — that's still where we are"),
  then three closing beats ("Take care of yourself." / "Good
  talk." / "Come back anytime."). Meaning, coherence,
  consequence: yes. Watch, not a defect: the opener asserts the
  player "said there was something you regretted" — a thread
  resume; the wedge sits during the 42-day leg could have
  planted it, and the sitting's own transcript is coherent, so
  no fabrication is proven. Same class as r214's Marta-origin
  check, which turned out grounded.
- **Arturo** (welder): wants one person to know about the
  letters he'll never send. The player accepts the walk
  (betrayal:accept → the cache spot, quiet, "Sometimes that's
  the whole point" — a diegetic act with a felt beat), promises
  the secret, is thanked; then Arturo turns curious ("Did you
  leave someone behind?") — the player answers, deflectable.
  Farewell spoken, engine ends, transcript closes with two
  beats ("Good talk." / "This was good."). PASS.
- Transcript nit, not a defect: Arturo's transcript carries a
  want line ("Help me haul something back? Too much for one.")
  the per-turn dump never printed — the ask behind the accept
  choice. The live UI renders the full transcript, so the player
  sees it; the per-turn dump is lossy, as established in r214.

## Verdicts (leg: establishment, days 14–40)
- **Reachable:** YES. All five villages play the full 42 days;
  sittings, teaching, favors, contests, waves 3–4 all fire.
- **Fun:** YES. Conversations land, close, and resolve; the
  villages feel inhabited; the hard seed's double scholar death
  with succession carrying on is the village-as-protagonist
  promise working as designed.
- **Winnable:** ON TRACK for the leg. Villages survive, gear up,
  kill ~37 monsters each, bank spotter skill, and reach wave 4
  on 2/5 seeds. No village reached national/table — expected
  at day 42.

## Metric review (§14)
- **Q1 revised bar WORKS.** It counts what the live game shows:
  0/10 CUT on a fresh band, with the two engine-ended sittings
  proven closed by their transcript beats. The bar should stay
  as written for the next establishment run. The analyzer's
  UNKNOWN-BEATS escape hatch (anchor not found) fired 0 times
  this panel — keep it; a foreign-language sitting could still
  trip it.
- **Q2:** THIN-PROBE (2). The recap reframe is grammar, varied
  across sittings, not the over-represented formulation. No
  second formulation owed.
- **LADDER pace read, again:** the thin seed (100801) misses
  the ladder because it fought all leg — spotter XP tracks
  foraging volume, not time (same mechanism as r210). Not a
  bar failure.
- **Joint-favor thinness (100803: 0 offers in 42 days):** the
  wedge's denominator is wants villagers raise. If a future run
  wants the END BAR stressed harder, the question is why no
  villager raised a joint want all leg on that seed — a dawn
  -decision question, not a wedge question. Carried as a watch.
- **Death telemetry names:** 187/192 death events are monsters
  ("villager combat" / "expedition"); only 5 name a villager.
  The census can say how many monsters died, not who killed
  them. Known limitation, not a finding.

## Telemetry check (§14)
`telemetry-check.js` vs `telemetry-baselines/establishment.json`
(metrics guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths):
- LOUD: guardrails.deaths 604 → 0; guardrails.popAlive 178 → 0;
  guardrails.pantryKcal 1210411 → 0.
- Adjudicated: the KNOWN schema mismatch (prereg-predicted) —
  the driver never emits `guardrails.*` fields, so the checker
  reads missing paths as 0. Not a game change; the r217 panel's
  deaths / pantry are all in-band in the analyzer (5/5 alive
  d40, pantries 31k–99k, 0 starvation deaths). Baseline NOT
  rolled (prereg: never roll on a mismatch).

## Gate check
- check.js --quick: **329 passed, 11 failed in 1123s. 0
  attributable to this run** (this run's branch touches no src/js
  — scripts + evidence only).
- 6 TIMEOUTS (exit null at 120.1s, check.js kill — no assertion
  failure): all pass standalone, load flake under the parallel
  gate: living-garden (exit 0, ~400s standalone), one-person-army
  (exit 0), occupation-panels (25/25), trust-observer-neutrality
  (6/6), synergy-stall (exit 0), capable-bot (40/40).
- 5 assertion failures, all pre-existing / known substrate:
  - test-measurement-proof-update.js + test-measurement-workflow.js:
    PRE-EXISTING — fail identically on pristine code (r214
    verified; retained observer-neutral proof stale on the r213
    base; refresh needs a fresh real panel via
    balance-proof-update.js — a maintenance job for the balance
    lane, not this run).
  - test-phone-frame-proof.js: PRE-EXISTING — fails identically
    on pristine code (r214 verified; retained phone receipt stale
    vs current sources; needs fresh 390x736/390x844 receipts per
    MOBILE-PLAYTEST.md).
  - test-ladder-bundle-20261108.js: KNOWN SUBSTRATE — same
    signature as r213 deepening (control: 200 monster turns
    WITHOUT delivery fire the ambient raid — fires 0; the
    lingerer guard suppresses the ambient-raid control).
  - test-person-trust-20261108.js: KNOWN SUBSTRATE — same
    signature as r213 deepening (HAUL:3 vs 0 drift, correlational
    with the r214 parting-pool RNG shift).
- Proof tests for this run's instruments: r214 mood-goodbye
  10/10, r139 spotter 35/35.

## Closeout
- Committed 0138f8583 (prereg + clones) and 510bd835c (anchor
  fix) in the worktree; safe-commit index clobber struck both
  commits (repaired via ls-tree -r pipe, hashes verified).
  Proof tests re-run on the final tip: r214 mood-goodbye 10/10,
  r139 spotter 35/35.
- [MERGE-RESULT — filled at closeout]
