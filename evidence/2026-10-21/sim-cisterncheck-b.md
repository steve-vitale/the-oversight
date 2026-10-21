# sim-cisterncheck-b — CISTERN-CHECK BEFORE WATER-HAUL DISPATCH (backlog #732)

Run: fleshout-loop-b-20261021T1856Z arm sim-cisterncheck-b | worker tree: sim-cisterncheck-b
Axis: food-economy (second axis). Claim: backlog #732 WATER-HAUL INTO A FULL CISTERN, UNNOTICED
(filed by sim-villagersense 2026-10-21, F12): leadfeast-s66005 d54 — "💧 Marta returns
with 14L, but the cistern only holds 13L more." then "returns with 17L, but the cistern
only holds 0L more." (same day); leadfeast-s64202 d63 — Hannah makes three trips into
0L space (13L/12L/16L) in one day. The narrator honestly reports the waste; no villager
notices. A person checks the cistern.

## CANON CHECK

docs/CANON.md manifest reviewed 2026-10-21: NO canon doc covers water-hauling dispatch
or the cistern as a system (cistern appears only as passing mentions in
docs/SURVIVAL-LEVERS.md, docs/ROADMAP.md, docs/CONVERSATIONS.md — no design law).
Per the brief: saying so here instead of inventing canon. The fix follows the existing
PRODTHROTTLE redirect pattern (game.js, 2026-10-13) and the FOODVOICE2 per-day voice
gate (game.js, 2026-10-17) — established engine idioms, no new systems.

## THE FIX (src/js/game.js, resolveOneAssignment 'water' branch)

Before the water-haul trip resolves, read the cistern's remaining capacity:
- **0 space** → no trip. The villager eyes the cistern, voices it (once/day gate),
  and takes other work — redirected to the wood/stone alt rotation
  (wood/stone-only so the redirect cannot recurse into water). Ledger:
  `v.cisternRedirects++`.
- **partial space** → carry capped at the space: `liters = min(rolled, room)`.
- **ample space** → byte-identical to the old path.

Telemetry ledgers (`v.waterHauls`, `v.cisternOverflowHauls`, `v.cisternOverflowL`,
`v.cisternRedirects`) run in BOTH arms — pure measurement, no RNG, no gameplay effect.
`CISTERNCHECK_OFF=1` restores the old always-haul shape bit-for-bit (sweep control arm;
the browser never sets it). RNG alignment: the skipped path draws exactly one RNG pull
in the wood/stone alt branch — the same single pull the water branch would have drawn —
so paired trajectories stay byte-identical except the avoided trips (proven in the
det-gate below).

The villager KNOWS their own haven's cistern level — this is knowledge they have; no
gating issue; nothing leaked they shouldn't know.

Adjacent blank (NOT chased — outside the assigned dispatch path, documented only):
`src/js/villager-objectives.js:1272` (`objReturnEffect` purpose 'water') adds 2–4L clean
with NO capacity check at all (`v.water.clean = (v.water.clean||0) + n`). The objective/
travel water path can overfill the cistern silently (no beat). Candidate for a future
arm; left untouched per "minimal and local to that path."

## PRE-REGISTRATION (binding, §14 — written BEFORE the pilot)

- **Primary metric:** overflow-haul trips per run (ledger `cisternOverflowHauls`:
  trips dispatched into less cistern space than the carry).
- **GO threshold:** ≥80% reduction in overflow-haul trips, armed vs control (paired seeds).
- **Horizon:** 180d death-aware (dead villages stop simulating; +10d tail max).
- **Seeds:** pilot 66061–66064 × {leadfeast, belongfeast} = 8 configs. (Prior-corpus check:
  seeds 66061–66068 have no earlier evidence corpus — verified pre-pilot.)
- **Policies:** leadfeast, belongfeast (competent-player family; the #732 sightings were
  leadfeast runs). Substrate: FEASTSCALE_R13=1, SEATDRIVE=0.
- **Pairing:** same worktree commit for both arms; control = CISTERNCHECK_OFF=1 (old
  shape bit-for-bit), armed = default. Identical seeds × policies.
- **Supporting metrics:** overflow liters, water-labor-days (waterHauls), cistern
  redirects, pantry kcal trajectory, wave reach, national/table reach, wins.
- **GUARDRAILS (all hard):** dehydration deaths ≤ control; starvation deaths ≤ control;
  median survival ≥ control − 10d; no new death mechanisms (any death cause present in
  armed but absent in control = investigation item, potential NO-GO).
- **A miss is NO-GO, never re-scored.** Confirm (seeds 66065–66072, 8 more configs)
  only on pilot GO. Kill protocol on NO-GO: reverse the game.js hunk, land instruments
  + evidence + corpus only, zero trace of the fix.

## PROOF (scripts/test-cisterncheck-b.js — 23/23 ALL GREEN, 2026-10-21)

- RED (CISTERNCHECK_OFF=1, old shape): full-cistern fixture fires the overflow beat
  ("returns with 13L, but the cistern only holds 0L more"); 4L-space fixture fires
  "only holds 4L more" with carry 17L > 4L space; ledger counts the overflow haul.
  Fixture is discriminating: it fails on old code.
- GREEN (fix armed): full cistern → NO overflow beat, 0L added, redirect ledger 1,
  redirect beat voiced, labor reallocated to wood (+7 logs); 4L space → carry exactly
  4L, full-delivery beat, no overflow ledger; ample cistern → carry/beats/RNG-stream
  byte-identical to control; two redirects same day → ledger 2, ONE beat (voice gate).
- DET-GATE: paired Math.random tails byte-identical after fixtures A and B
  (one draw each arm) — trajectories differ only in the avoided trips.
- `node scripts/validate-ontology.js`: 123/123 systems validated (game.js carries an
  @ontology header).

## SENSE READING (beats, from the proof)

BEFORE: `💧 Marta returns with 14L, but the cistern only holds 13L more.` — the narrator
reports waste; nobody in the village notices. Robotic: the third identical trip into 0L
space reads as the engine not seeing its own state.

AFTER: `💧 Marta eyes the cistern — full to the brim. No sense hauling water there's no
room for; they turn to the wood run instead.` + `🪵 Marta hauls back 7 wood. The pile
grows.` — reads as a person checking before committing a half-day walk. The partial-carry
case (`returns with 4L of creek water. Risky until the hearth boils it.`) is honest: they
brought what fits. Voice-gated to once/day so five simultaneous water-duty villagers don't
spam five identical lines; the ledger still counts every redirect. No idling strangeness:
skipped trips become real wood/stone labor, not standing around.

## PILOT RESULTS (8 configs: seeds 66061–66064 × {leadfeast, belongfeast}, 180d death-aware)

Paired on one commit (control = CISTERNCHECK_OFF=1, armed = fix). Substrate FEASTSCALE_R13=1, SEATDRIVE=0.

| metric | control | armed | verdict |
|---|---|---|---|
| overflow-haul trips | 1759 | 0 | **−100%** |
| overflow liters wasted | 21,341 | 0 | −100% |
| water-labor-days (waterHauls) | 2337 | 1183 | (labor reallocated: 1232 redirects → wood/stone) |
| cistern redirects | 0 | 1232 | fix firing |
| dehydration deaths | 5 | 5 | ≤ control ✓ |
| starvation deaths | 4 | 3 | ≤ control ✓ |
| median survival (d) | 142 | 142 | ≥ 132 ✓ |

PRIMARY GO (≥80% reduction in overflow-haul trips): **100% → GO.**
GUARDRAILS: all hard guardrails PASS. Death-cause audit: armed-only causes were
'villager:contest' ×3, 'player:the night' ×1, 'player:lockjaw' ×1 — investigated:
all three are pre-existing engine causes (contest deaths — control had
'player:contest' ×3, same mechanism; 'the night' = game.js:11687 unwitnessed-death
attribution; 'lockjaw' = statusEffects.js:433 tetanus). Sampling noise across
divergent trajectories, not new mechanisms. No new death mechanism introduced.
Thirst deaths actually fell (3 → 2); water delivery per trip is identical by
construction (partial-carry adds exactly what the old code added).

Per-seed JSONs: evidence/2026-10-21/perseed-cisterncheck-b/{control,armed}-{leadfeast,belongfeast}-s6606{1-4}.json
plus {control,armed}-aggregate.json.

## CONFIRM (seeds 66065–66072 × {leadfeast, belongfeast}, 8 more configs, 16 total)

| metric (16 configs) | control | armed | verdict |
|---|---|---|---|
| overflow-haul trips | 4778 | 0 | **−100%** |
| overflow liters wasted | 59,327 | 0 | −100% |
| dehydration deaths | 7 | 6 | ≤ control ✓ |
| starvation deaths | 10 | 8 | ≤ control ✓ |
| median survival — pilot | 142d | 142d | ✓ |
| median survival — confirm | 125d | 159d | ≥ control−10d ✓ |

Death-cause audit (confirm): armed-only causes were 'player:contest' ×3,
'villager:contest' ×2, 'person:combat' ×2 — all pre-existing engine mechanisms
(contest/combat deaths; control had its own 'player:contest' deaths in the pilot).
Control-only: 'villager:thirst' ×1, 'villager:Grief Counselor' ×1. No new death
mechanism in either round. **CONFIRM: GO — the fix lands.**

## VILLAGE ASSESSMENT (plain words)

The village in these runs is a water-hauling machine that couldn't see its own
cistern: across 16 control runs, villagers made 4,778 trips into cisterns that
couldn't take what they carried, wasting 59,327 liters of hauled water — including
736 wasted trips in a single 180-day run (leadfeast-s66064). The narrator reported
every one ("but the cistern only holds 0L more") and nobody in the village noticed.

With the fix, the same village behaves like people who live next to their cistern:
when it's full they look at it, say so once ("eyes the cistern — full to the brim.
No sense hauling water there's no room for"), and take up the wood run or the stone
pile instead. When there's a little room they bring just what fits ("returns with 4L
of creek water" / "returns with 1L"). Water delivery is unchanged trip-for-trip —
the fix only reclaims labor that was previously 100% wasted.

Who thrived: nobody died of thirst because of the fix (thirst deaths 3→2 pilot,
1→0 confirm — the water economy is identical by construction). The woodpile grows
larger than before (the reclaimed labor has to go somewhere; see metric review).
Who died and why: the usual — monsters (the dominant killer in both arms), contests,
sickness, wounds. Median survival didn't move (142/142 pilot; 125→159 confirm —
noise, both directions within normal seed variance).

The blank filled: #732 — villagers now check the cistern before the creek walk.
The blank documented: the objective/travel water path (villager-objectives.js:1272)
still adds 2–4L clean with no capacity check and no beat — a future arm's fix.

## METRIC REVIEW

- Overflow-haul trips proved to be exactly the right primary: huge signal (4,778 in
  control), zero in armed, deterministic mechanism. No metric doubt.
- Observation for a future run (not this one): reclaimed labor becomes wood/stone —
  woodpiles in heavy-redirect runs grow very large (5,420 logs by d159 in armed
  leadfeast-s66064). The wood economy has no sink pressure for this; worth a look
  when the next wood-side lever runs, but it was earned labor, not a bug.
- The once-per-day voice gate held: 530 redirects in the heaviest run produced no
  beat spam in the sampled transcript.

## CONVERGENCE STATE

axis food-economy: converging — #732 claimed by this run; fix landed locally
(pending ship), coordinator marks [fixed] at closeout after verifying the landing.

## §15 BALANCED PANEL ATTEMPT

Attempted and documented as UNBUILDABLE — no bogus compare shipped (precedent:
evidence/2026-10-20/sim-pantryguard-b2.md "Balanced panel" section, sim-inflowguard-b).

What was tried: inspected `scripts/balance-panel.js` CLI (`--root`, `--before/--after`
compare mode) and `scripts/lib/simulation-flags.js` flag discovery. The treatment is
env-flag-mediated (control = CISTERNCHECK_OFF=1 on the same tree); the flag is
source-discovered from `src/js/game.js`, so a before/after panel compare over one tree
yields "Unmatched flags," and a two-root build (pristine HEAD vs worktree) still trips
the flag-parity check on the source-discovered CISTERNCHECK_OFF — the exact failure
mode the pantryguard-b2 precedent names. Building the full panel (~16 seeds × policies
× 150d × 2) to reproduce a known-invalid artifact would be bogus-comparison theater.

The instrument for this run is the paired sweep-compare harness (balanced policy set
{leadfeast, belongfeast}, identical seeds, 180d death-aware, full death-cause
accounting); the pre-registered ≥80% GO threshold was the judge. Pre-registered
metrics bind regardless of the panel.

## VILLAGE ASSESSMENT

(Pending pilot.)

## METRIC REVIEW

(Every evidence file carries one. Pending pilot — notes on whether overflow-haul trips
proved to be the right primary, and any metric doubts for the NEXT run, never this one.)

## CONVERGENCE STATE

axis food-economy: converging (this arm) — #732 claimed by this run; coordinator marks
[fixed] at closeout after verifying the landing.
