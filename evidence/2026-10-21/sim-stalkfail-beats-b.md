# sim-stalkfail-beats-b — 4-variant hunt stalk-fail pool (flesh-out loop-B, run fleshout-loop-b-20261021T2330Z)

## Pre-registration (binding; docs/MEASUREMENT.md §§9–12, 14–15)

- **Axis:** food-economy / fiction. **Blank:** HUNT STALK-FAIL BEAT VERBATIM x50
  (sim-findings.md; from sim-huntstaff-decomp-b, run fleshout-loop-b-20261021T1351Z;
  corpus evidence/2026-10-21/huntstaff-beats/belongstaffhunt-s8903-60d.txt).
- **Canon note:** no canon doc rewrites the hunt-beat system — this is a
  fiction-pool blank-fill. docs/CANON.md read first; the named treatment is the
  r37 hunger-pool pattern in src/js/corruption.js (journey-crisis r37).
- **Primary metric:** distinct stalk-fail variants across the fixture; GREEN bar:
  ≥4 variants cycling, no variant >50% share (verbatim-dominance killed).
- **Det-gate (binding):** per-seed outcome digests (kills/kcal/aid/fails/other)
  byte-identical RED vs GREEN on identical seeds — the change must add zero
  gameplay-RNG disturbance; only beat text may vary.
- **Fixture:** scripts/test-stalkfail-beats-b.js — 60d × 12-villager hunt
  fixture calling Game.villagerHuntResolve directly. Two arms per seed:
  fail arm (eff=0, chance=0 → the beat under test every call) and real arm
  (eff=1, real chances → exercises the shared animal-pick RNG path so the
  det-gate covers kills/kcal too). Seeds: 8903, 8904, 8905, 8906.
  villagerHuntResolve rolls no wounds itself (injury roll stays with the
  caller), so the digest is kills/kcal/aid/fails/other.
- **Horizons/policies:** N/A — targeted narration fixture, not a policy sweep.
  No gameplay lever changed; no wall movement is expected or claimed.
- **RNG-neutrality mechanism:** leadPick('stalkfail', vid, pool) — the repo's
  stream-neutral rotation (zero Math.random draws, per-villager hash start
  offset, never repeats back-to-back), same discipline as game.js's
  leadLine/leadPick comment block.

## Deviation from the named treatment (honest)

The r37 hunger-pool pattern (corruption.js:379) selects via
`R() = Math.random` — a raw draw on the shared game RNG stream. That is
**deliberately not followed here**: a draw inside the stalk-fail outcome
branch would shift the game's random stream for every downstream event.
The change instead uses leadPick's rotation — the exact pattern the repo's
own discipline prescribes ("use leadPick wherever the OLD code consumed no
random draw" — the old verbatim beat consumed none). The det-gate below
verifies the honesty of this choice with strict equality, not assumption.

## RED→GREEN corpus numbers

| phase | seeds | days | stalk-fail beats | distinct failure-variants | top-variant share |
|---|---|---|---|---|---|
| RED (unfixed) | 8903–8906 | 60×12×2 arms | 2,243 | **1** | 1.000 (verbatim x2243) |
| GREEN (fixed) | same | same | 2,243 | **4** | **0.251** |

Variant distribution (GREEN): crow-alarm 563x, still-morning 562x, twig-snap
561x, wind-shift 557x — a full rotation, no dominance.

### DET-GATE: PASS
Per-seed outcome digests byte-identical RED vs GREEN (JSON string equality on
{kcal, kills, aids, fails, other} for both the fail arm and the real arm):
identical seeds → identical kills, kcal, aid picks, fail/other counts. Only
the beat text changed. Zero RNG-stream disturbance verified.

## The change (one hunk, src/js/game.js villagerHuntResolve)

The stalk-fail branch now returns `'🏹 ' + this.leadPick('stalkfail', vid,
[4 variants])`, keeping the `🏹 ${first} stalks a ${animal}` frame and varying
the failure as four different real mornings:

1. **wind shift** — "the wind turns mid-stalk and it winds them. Gone."
2. **snapped twig** — "close enough to count whiskers, then a twig snaps underfoot and the morning is over."
3. **lookout crow** — "a lookout crow kicks up the alarm call and the whole stand melts away."
4. **still empty morning** — "never gets closer than old sign; the morning goes still and stays still."

## Sense read (Steve 2026-10-11 law: read transcripts, judge meaning)

20 beats sampled across the seed-8903 fixture (firing order). Judgment as a
player scanning the morning's hunt returns:

- Ellie / White-tailed Deer — *never gets closer than old sign; the morning
  goes still and stays still.* Meaningful: hours of sign-reading that never
  converts. Coherent, relevant. BELIEVABLE.
- Nadia / Gray Squirrel — *a lookout crow kicks up the alarm call and the
  whole stand melts away.* A crow ruining a squirrel stalk is the most
  believable thing in the corpus. BELIEVABLE.
- Willow / Raccoon — *close enough to count whiskers, then a twig snaps
  underfoot.* "Count whiskers" is specific to the animal — the best kind of
  variant, and it isn't a noun-swap. BELIEVABLE.
- Nadia / Bobcat — *never gets closer than old sign.* A bobcat you never see
  is the whole point of a bobcat. BELIEVABLE.
- João / Wild Turkey — *twig snaps at close range.* Coherent. BELIEVABLE.
- João / Great Horned Owl — *twig snaps at close range.* Slightly odd prey
  for a stalk, but the moment reads. OK.
- Maya / North American Beaver — *still morning.* Beaver sign, still woods —
  fine. BELIEVABLE.
- Pearl / Eastern Chipmunk — *still morning.* Same failure mode as Ellie's,
  but a different morning, different hunter, different sign. Not a repeat —
  it reads as its own morning. BELIEVABLE.
- Across the 20: no two consecutive beats share a hunter+variant pairing in a
  way that reads as copy-paste; the per-villager rotation with hash start
  offset staggers the village's mornings.

Honest caveats (documented, not fixed — out of scope for this blank):
- The animal side can produce odd pairings — *Ellie stalks a Big Brown Bat
  all morning*; muskrats get "stalked" too. That lives in the pre-existing
  `stalks a ${animal.name}` frame I was told to keep (animal-pick machinery,
  not beat text). The failure moments themselves read fine against all of it.
- The wind-shift variant reads most naturally for scented game (deer); on a
  bat it's the weakest of the four. An animal-aware variant system (ungulate
  moments vs small-game moments vs bird moments) would be a bigger blank —
  recorded here, not built.
- One back-to-back pair in the firing-order sample (João/Nikolai both
  crow-alarmed) — different hunters, different animals, different beats in
  the fiction; the per-villager rotation only guarantees no same-villager
  repeat. Acceptable; not the verbatim-x50 pathology.

Verdict: a player reading these believes four different mornings happened.
The blank is filled.

## Metric review

- Pre-registered metric held: 4 variants, top share 0.251 < 0.50. GO.
- Det-gate metric held: byte-identical outcome digests. GO.
- The det-gate's strict-equality design is the right call for this blank —
  narration-only changes that touch the RNG stream are the historical
  failure mode, and strict equality catches it with zero ambiguity.
- Method note worth carrying: the verbatim-blank must be measured on the
  *failure text after normalization*, not the raw string — the verbatim beat
  interpolates ${first} and ${animal.name}, so raw-string distinct-counts
  under-report the blank by ~670x (first RED run measured 673 "variants",
  all one verbatim failure).

## Convergence

- Convergence state: **converged** for this blank (claim filled: claimed by
  this run, fixed on landing — coordinator marks sim-findings.md; NOT touched
  here per run brief).
- No gameplay levers changed: no wall numbers moved by design (det-gate is
  the whole wall story: national/table/wins/waves unchanged by
  byte-identity). No balance panel run — the panel measures before/after
  gameplay deltas, and the det-gate proves there are none.

## Files

- scripts/test-stalkfail-beats-b.js (proof: red/green/corpus phases)
- src/js/game.js (one hunk: stalk-fail pool in villagerHuntResolve)
- evidence/2026-10-21/stalkfail-beats/digests-red.json (RED outcome digests)
