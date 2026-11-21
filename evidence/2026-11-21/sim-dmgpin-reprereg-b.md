# sim-dmgpin-reprereg-b — judged evidence (Loop B 0430Z resumption, arm-1)

**Verdict: NO-GO kind SUPPLY-THIN.** The armed leg supplied **zero fought
door fights** on the fresh band, so the re-registered P1/P2/B1 bars were
unmeasurable — not failed by the lever, never reached by it. Per the frozen
prereg, zero fought doors on the armed leg is SUPPLY-THIN, not a lever
failure. **No confirm spend** (the confirm rule fires only on a pilot GO).

The DMGPIN lever did not play once on this band: the armed corpora are
**byte-identical to the control corpora on all 8 seeds except the
`dmgpinFlag` value itself** (verified by a JSON comparison ignoring only
that flag). The lever's doubling never changed a single number, because no
pinned wave-4+ fight ever happened for it to fire in. The 0330Z pilot's
finding stands unchallenged and unrepeated: the lever works when a pinned
quad meets a wave-4 monster at the door (door damage 112.4 → 216.8/round;
the 106722 d115 kill) — this band simply never staged that fight.

## What the lever is (unchanged)

DMGPIN: a pinned quad strikes as one unit — in a field fight where the full
pinned trio entered at the door, every party member's strike damage is
doubled (x2.0), strikes only, wave-gated ≥ 4, env-gated OFF by default,
inert without the pin. No game-code change in this arm; the lever code is
commit `86e96cb38`, flag-gated OFF by default. Canon grounding unchanged:
MONSTER-WAVES.md wave-4 bands (HP 850–1500, damage 35–95; "a 4-6 round
fight for a godhood build (~220 dmg/round)").

## The run (frozen prereg 5462be81, judged as frozen)

- **Base/branch:** `sim-pinquaddoor-b`, tip `8acf866b5` (verified at start:
  `git log` tip matches, tree clean except the empty
  `dmgpin-reprereg-b-legs.log`, fieldFights.js ~3304–3313 reads correctly:
  ally3Settles hurtVillager block, then the PLANRESEED sighting stamp,
  then `return _sealed`). No rebase — the branch is HELD (PINQUAD +
  ALLYSLOT3 src changes must not merge); the judged legs compare control
  vs armed WITHIN this branch on the frozen base. Anchor
  `8acf866b5e46` on every corpus file of both legs; brainSha
  `f93aee904395`.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
  (first 12: `1884c8852d38`) — identical to sense3, pinquaddoor-b, the
  wide band, the reprereg, and the dmgpin run.
- **Substrate (both legs):** `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
  FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1`
  (+ `DMGPIN=1` armed only). NOTE — the resumption task's flag list
  omitted FLEEREPAIR2; the frozen prereg includes it, the dmgpin run
  ran with it, and the driver hard-requires it (`FLEEREPAIR2=1
  required (substrate)`, exit 2 without it). This run used the prereg's
  list, matching the dmgpin run exactly.
- **Seeds:** 106729–106736, 8 FRESH seeds (pilot, never a subset).
  Freshness re-verified at run start the way the prereg did: no dated
  `.md` cites any seed except the frozen prereg itself; no corpus
  filename under `evidence/` matches; no corpus JSON `"seed":` cites
  any of them in the Nov 20–21 `perseed-*` dirs; `scripts/` + `docs/`
  cite them only in `scripts/test-dmgpin-reprereg-b.js` §0, which
  asserts the prereg names the band (a proof-test label, not a prior
  judged use). Result: FRESH.
- **Legs:** control + armed, 150d death-aware, chunked 4+4 per the
  prereg. Control 106729–106732 (CTL-A, ~19.8 min, exit 0), control
  106733–106736 (CTL-B, ~8.4 min, exit 0), armed 106729–106732 (ARM-A,
  ~15.1 min, exit 0), armed 106733–106736 (ARM-B, ~12.5 min, exit 0).
  0 instrument errors on all 16 files. Legs log
  `evidence/2026-11-21/dmgpin-reprereg-b-legs.log` (16 JSON lines + 4
  EXIT lines). Corpora
  `evidence/2026-11-21/perseed-dmgpin-reprereg-b-control/` and
  `...-armed/` (8 files each). Census JSONs
  `dmgpin-reprereg-b-control-census.json` /
  `dmgpin-reprereg-b-armed-census.json` saved beside the corpora.
- **Proofs (all green, before judged legs, on tip 8acf866b5):** M1
  `test-allyslot3-b.js` **18/18**; M2 `test-pinquaddoor-b.js`
  **35/35** (analyzer selftest 26/26 inside it); M2w
  `test-pinquaddoor-wide-b.js` **16/16**; M3 `test-dmgpin-b.js`
  **29/29**; M3b `test-dmgpin-reprereg-b.js` **30/30** (the
  re-registered P1/B1 computation: fixture kill derived 1,275 =
  `mHpStartRec`, dealt bound 1,253; every vKill row in the dmgpin
  corpora has `mHpStart` null).

## Frozen-bar table

| Bar | Frozen requirement | Measured | Result |
| --- | --- | --- | --- |
| M1 port gate | test-allyslot3-b 18/18 | 18/18 | PASS |
| M2 staged pin proof | test-pinquaddoor-b 35/35 | 35/35 | PASS |
| M2w wide-instrument proof | test-pinquaddoor-wide-b 16/16 | 16/16 | PASS |
| M3 damage proof | test-dmgpin-b 29/29 | 29/29 | PASS |
| M3b re-registration proof | test-dmgpin-reprereg-b 30/30 | 30/30 | PASS |
| P1 door kill (re-registered) | ≥ 1 armed FRESH door kill (roundsDetail-derived entry HP ≥ 500; NEVER mHpStart) | 0 fought door fights on the armed leg → 0 door kills, 0 derivations run | UNMEASURABLE (supply) |
| P2 D-shape | mean D/round across FOUGHT armed door fights ≥ 111/round | no fought armed door fights; denominator 0 | UNMEASURABLE (supply) |
| B1 pin delivery (re-registered) | armed fought-subset ally3Vid rate ≥ control rate − 10pp AND ≥ 3 armed ally3Vid rows | control 0/0, armed 0/0 (wave-4+ fought subset); armed ally3Vid rows 0 | UNMEASURABLE (supply) |
| B2 ally3Dealt | armed total ally3Dealt > 0 AND ≥ 1 armed fight with ally3Dealt ≥ 10 | pinned-subset ally3Dealt total 0, max 0 | MISS (supply — no pinned wave-4+ fight to deal damage in) |
| B3a kill conversion | armed corpus-wide vKill rate on wave-4+ ≥ control − 2pp | 8/105 = 7.6% both legs (Δ 0) | PASS |
| B4 substrate sanity | control files dmgpinFlag null + pinquadFlag '1'; armed '1' + '1'; control pinned wave-4+ fights ≥ 1 | flags pass on all 16 files; control pinned wave-4+ fights = 0 | PARTIAL — flags pass, supply clause MISS |
| M5 guardrail | balanced-panel compare `review_required` with NO `regression_signal` on village deaths / deaths-per-100d | `review_required`, 8 paired cases, every paired delta 0; no `regression_signal` anywhere in the compare | PASS |
| M6 deliverable | this evidence file + panel compare attached + sense-test transcript read | this file; `dmgpin-reprereg-b-panel.md` attached; transcript read below (no door fight exists to quote — documented, not faked) | PASS (with the documented blank) |

**How P1/P2/B1 were computed:** the analyzer's re-registered
computation (`deriveDoorEntryHp` / `dealtBound` / `freshDoorKill`) over
both corpora, cross-checked by an independent node one-liner over the
raw `v4encounters` rows (door = `origin === 'expedition'` AND
`allyFromStart` AND `pinned`, wave ≥ 4; fought = rounds ≥ 1). Both agree
exactly: 0 doors, 0 fought doors, 0 door kills on either leg. No
derivation was run on any kill row because no door-kill row exists;
nothing was guessed from `mHpStart` (null on every vKill row, as the
prereg established) or from `mHpStartRec` (a diagnostic cross-check,
never a judge).

## The supply story (why the bars were unmeasurable)

Across 105 wave-4+ encounters on each leg, **zero carried a live pin**
(`pinned` false on all 105 rows, both legs). The pin itself barely
formed on this band:

- Only **1 of 8 villages ever pinned at all** — seed 106729, days
  131–132, six pinned fights, all wave 1–2 (4× wave 1, 2× wave 2), five
  evades and one 1-round kill. While pinned it never met a wave-4+
  monster.
- The other seven villages: zero `pinFights` rows, zero pinned
  `v4gates` rows. At gate time no fighter on any seed carried a live
  pin at wave 4+.
- `allyFromStart` rows: **0** across all 105 encounters — no
  expedition ever departed with the full trio from the start at wave
  4+, pinned or not.

Comparison with the prior band (same one-liner, same definition):
the dmgpin band's control supplied 18 pinned wave-4+ encounters, 9
doors, 6 fought doors, 1 door kill — but concentrated in a single
"pin village" (seed 106722 supplied 10 pinned / 8 doors / 5 fought /
1 kill; 6 of its 8 seeds supplied zero doors). The reprereg band
supplied 3 fought doors in 16 seeds. Door supply is carried by one
village per band, and on this band that village never showed up at
wave 4+. The prereg's expectation (1–7 fought doors on 8 seeds) missed
low: 0.

In plain words: the damage lever is a weapon with no fight to fire in.
The villages on this band never got a full pinned team to a wave-4
monster's door together — the pin formed once, late (day 131), and only
met small fry. Everything else about the villages ran identically with
the lever on or off, because the lever's trigger condition never
occurred. That is a fact about the pin, not about the damage: the
0330Z pilot already proved the damage doubling works when the fight
happens. The open question this band leaves is pin formation and
delivery to the door — not strike damage.

## Before / after numbers (control vs armed — identical)

Because the corpora are byte-identical except `dmgpinFlag`, every
before/after number below is the same on both legs. The lever played
zero fights, so there is no before/after movement to report — that
identity IS the measurement.

| Number | Control (PIN-ONLY) | Armed (PIN+DMGPIN) |
| --- | --- | --- |
| Wave-4+ encounters | 105 | 105 |
| Pinned wave-4+ encounters | 0 | 0 |
| Door fights (expedition + allyFromStart + pinned, w4+) | 0 | 0 |
| Fought door fights (rounds ≥ 1) | 0 | 0 |
| Door kills | 0 | 0 |
| Mean D/round, fought doors | n/a (no fights) | n/a (no fights) |
| vKill rate, wave-4+ encounters | 8/105 = 7.6% | 8/105 = 7.6% |
| Pinned fights, all waves | 6 (fought 1) | 6 (fought 1) |
| Pinned kills, all waves | 1 | 1 |
| Pinned ally3Dealt (all waves) | 0 (max 0) | 0 (max 0) |
| ally3Dealt total, all encounters | 24 (max 24) | 24 (max 24) |
| Launches (quads) | 3 (1) | 3 (1) |

## Wall numbers (both legs identical)

- **Wins 0/8, national 0/8, table 0/8** — no village won, reached
  national scale, or sat at the table on either leg.
- **Wave 5 unlocked 3/8** (106729 standing 475, 106730 standing 425,
  106736 standing 275); **wave 4 unlocked 8/8**. Standing ≥ 200 on
  3/8 villages.
- **Median survival 146.5 days** (days sorted: 82, 97, 120, 143, 150,
  150, 150, 150; mean 130.25d). The analyzer's wall line prints its
  upper-median, 150d — same underlying days. Survived 4/8; villages
  lost 4/8 (106731 d120, 106733 d97, 106734 d82, 106736 d143).
- **Deaths 723 total** (90.375 per run; 68.0894 per 100 calendar
  days, panel figures — identical both legs).
- Per-seed (control = armed on every line): 106729 150d survived w5
  standing 475 deaths 237; 106730 150d survived w5 standing 425
  deaths 75; 106731 120d lost w4 standing 199 deaths 86; 106732 150d
  survived w4 standing 199 deaths 63; 106733 97d lost w4 standing
  199 deaths 62; 106734 82d lost w4 standing 195 deaths 44; 106735
  150d survived w4 standing 199 deaths 89; 106736 143d lost w5
  standing 275 deaths 67.
- Starvation: not recorded by this instrument (the recorder logs
  pantry kcal per seed — end-pantry 0 on all four lost villages,
  8,181 / 7,784 / 3,127 / 5,267 kcal on the four survivors — but no
  starvation-death count; blank documented, not filled).

## Village assessment (plain words)

Four villages lived the full 150 days and four died, and none of them
came close to winning: no national standing, no seat, no full win. The
strongest village (106729) reached standing 475 and wave 5 but still
lost 237 people along the way — the highest death toll on the band —
while the quietest (106734) died on day 82 with only 44 deaths. Three
villages got stuck at standing 199, one point short of the wave-5 door
(the readiness hold), which is the same 199-stall the program has seen
before. The villages fight wave-4 monsters — 105 encounters, 8 kills —
but they fight them unpinned, in scratch parties that form mid-fight
when someone shouts for help, not as a pinned team that walks out the
door together. The pin, the thing the whole door strategy depends on,
formed exactly once in eight villages. Until a village can reliably
form and keep a pinned team, doubling that team's damage cannot move
the wall — there is no team to double.

## Sense-test transcript read

**No door fight exists to quote.** M6 asks for at least one door fight
quoted blow-by-blow, and if a door kill happens, that fight. There was
no door fight on either leg, so there is nothing to quote — this blank
is documented, not filled with a substitute presented as a door fight.

The closest real things, quoted as what they are:

1. **The only fought pinned fight on the band** — seed 106729, day
   132, Paparazzo (wave 2), fighter Marcus, pinned trio
   Marcus + two allies + Hannah Kim as third ally, 1 round, vKill,
   ally3Dealt 0. `pinFights` rows carry **no log field by design**, so
   no blow-by-blow exists for this fight. What the row does say: a
   pinned trio met a wave-2 monster and killed it in a single round
   without the third ally dealing damage. The lever's wave gate (≥ 4)
   excludes this fight twice over.
2. **One unpinned wave-4 fight, blow-by-blow** (seed 106729, day 141,
   The Suburb, wave 4, aid-origin, unpinned, fighter Tariq with
   Marcus and Penelope joining mid-fight; 6 rounds, 333 dealt, vKill;
   entry HP per the diagnostic 325, no pre-round volley):

   ```
   R1: Tariq strikes for 24 (301 left)
   Tariq's gear absorbs 34.
   R1: Property Tax hits Tariq for 5 (70 left)
   R2: Tariq strikes for 23 (278 left)
   Tariq's gear absorbs 43.
   R2: Property Tax hits Tariq for 6 (64 left)
   Tariq is losing — shouts for help! Marcus charges in!
   R3: Tariq strikes for 25 (253 left)
   R3: Marcus strikes for 58 (195 left)
   Tariq's gear absorbs 30.
   R3: HOA Fine hits Tariq for 4 (60 left)
   Tariq is still losing — shouts again! Penelope charges in!
   R4: Tariq strikes for 24 (171 left)
   R4: Marcus strikes for 56 (115 left)
   R4: Penelope strikes for 21 (94 left)
   Tariq's gear absorbs 33.
   R4: Property Tax hits Tariq for 5 (55 left)
   Big Loud is wounded past its line — and holds its ground. It is not leaving. (Committed)
   R5: Tariq stops mid-fight and binds the wound — field medicine, +20 HP.
   R5: Marcus strikes for 58 (36 left)
   R5: Penelope strikes for 19 (17 left)
   Penelope's gear absorbs 32.
   R5: Property Tax hits Penelope for 5 (95 left)
   Big Loud is wounded past its line — and holds its ground. It is not leaving. (Committed)
   R6: Tariq strikes for 25 (0 left)
   The lead falls — the pack's coordination shatters. The rest scatter or die.
   ```

   Sense check: this reads as a real fight. A lone fighter meets a
   wave-4 monster, loses, shouts, and two allies charge in one at a
   time — the party forms mid-fight by shouting, not by departing
   together. The monster hits back for small numbers through gear,
   holds its ground when wounded, and the fight ends when the lead
   falls. This is exactly the shape the pin is meant to replace (a
   team that leaves together) and exactly the shape that, unpinned,
   the lever correctly does not touch. Note the fight's damage shape:
   three fighters deal 333 over 6 rounds (~55/round) — far below the
   ~220/round godhood anchor and below the frozen P2 floor of 111,
   which is what the lever exists to fix when the team is pinned.

## Secondaries (reported, not binding)

- **(S1) Pin-subset B1 rate:** wave-4+ pinned ally3Vid 0/0 (n/a) on
  both legs; all-waves 1/6 (16.7%), fought subset 1/1 (100.0%) —
  the single fought pinned fight carried a third ally (Hannah Kim)
  who dealt 0.
- **(S2) Drive-offs on pinned fights:** 0 / 6 pinned fights; pinned
  end causes {evade: 5, killed: 1}; pinned kills (all waves) 1;
  pinned ally3Dealt (all waves) 0.
- **(S3) SEEK decisions:** pinned {total: 0, seek: 0, avoid: 0,
  other: 0} — no pinned gate ever faced a SEEK choice; unpinned
  {total: 109, seek: 2, avoid: 66, other: 41}. The armed-pinned
  SEEK question stays unproven (it was 0/9 on the dmgpin band too).
- **(S4) Pinned fights at all waves:** 6 (fought 1) by wave
  {w1: 4, w2: 2}, all seed 106729, days 131–132.
- **(S5) Door-fight table:** EMPTY — zero armed door fights. The
  table has no rows; the per-seed door census is: 106729–106736 all
  0 doors / 0 fought / 0 kills, both legs (verified by the analyzer
  and the independent one-liner).
- **(S6) Wall numbers:** see "Wall numbers" above (identical both
  legs).

## Balanced panel (M5)

`scripts/build-pinquaddoor-b-panels.js` +
`node scripts/balance-panel.js compare` →
`evidence/2026-11-21/dmgpin-reprereg-b-panel.md` (attached; panel JSONs
`dmgpin-reprereg-b-panel-before.json.gz` /
`dmgpin-reprereg-b-panel-after.json.gz` beside it). Decision
**review_required**, 8 paired cases, screen only. **NO
regression_signal**: village deaths per run 90.375 → 90.375 (paired
delta 0, 95% exploratory interval 0 to 0, no_material_signal);
village deaths per 100 calendar days 68.0894 → 68.0894 (delta 0,
interval 0 to 0, no_material_signal). Every observed metric has
paired delta 0 — the corpora are identical, so the panel can only
confirm identity. Wins / national / table 0/0 on both sides. The
panel is the instrument, the frozen bars are the judge: no signal
here re-scores anything. (Compare exit code 2 is the designed
`review_required` exit, not a failure.)

## Telemetry check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-21/perseed-dmgpin-reprereg-b-armed/*.json'
--metrics national,table,wins,exiled` → **exit 2, the designed
recorder-corpus refusal** (all 8 `--current` rows carry top-level
`anchorCommit`, so they are sweep recorder rows, not runs; recorder
corpora are compared with sweep-compare tables, never against a run
baseline here). Recorded as expected; **the baseline was NOT rolled**.

## Metric review (for the NEXT run — this run is judged as frozen)

1. **P1/P2/B1/B2 all share one supply denominator, and this band
   zeroed it.** The re-registered derivations never got exercised on
   judged data: no door-kill row existed for `deriveDoorEntryHp` /
   `dealtBound` / `freshDoorKill` to judge, and B1's non-inferiority
   has no control rate (0/0). The re-registration itself is vindicated
   as an instrument (the proof test's fixture agreement stands), but
   the pilot cannot say whether the re-registered bars are reachable
   — only that this band supplied nothing to reach them with.
2. **B4's control-supply clause (control pinned wave-4+ fights ≥ 1)
   failed on the same fact.** A pilot whose control supplies zero
   pins cannot pass B4 even if the armed leg supplied doors. The
   clause conflates substrate sanity (flags — which passed on all 16
   files) with band supply. A future prereg should either drop the
   supply clause from B4 or fold it into the SUPPLY-THIN rule, so one
   empty band does not read as two failures.
3. **Door supply is a single-village phenomenon.** Across three bands
   (dmgpin 8 seeds, reprereg 16, this pilot 8), fought doors per band
   were 6, 3, and 0 — and on the dmgpin band one seed supplied 5 of
   6. An 8-seed pilot is a coin flip on whether the pin village shows
   up at wave 4+ at all. A future re-judge should either run a wider
   pilot (16 seeds, the reprereg's width) or pre-screen the band for
   pin formation — e.g. a cheap control-only scout that confirms ≥ 1
   pinned wave-4+ fight exists before spending the armed leg — rather
   than burning a full paired pilot on an empty band.
4. **The SEEK side effect stays unproven** (pinned SEEK 0/0 here,
   0/9 armed on the dmgpin band). No bar turns on it; it remains a
   diagnostic.
5. **The pin is now the binding constraint, not the damage.** The
   0330Z pilot proved damage doubles and kills follow when the fight
   happens; this pilot proves the fight usually does not happen. The
   next lever in this chain should be pin formation / delivery to the
   door (why a village pins once in eight, why it pins at day 131,
   why pinned teams meet only wave-1/2 monsters), not a bigger
   damage multiplier.
6. **Median note:** the analyzer's wall line prints the upper median
   (150d); the true median of the eight survival days is 146.5d.
   Future evidence should quote the true median and note the
   analyzer's convention, as this file does.
7. **The door-line order quirk** (door lines print 2, 3, 1) persists
   in the ported slot code; cosmetic, no bar. (Carried from the
   dmgpin prereg.)

## What is ready / held

- **Ready to land (evidence only):** this evidence file, the legs
  log, the two census JSONs, the panel files, and the 16 corpus
  files — committed as evidence-only on this branch for the
  coordinator to cherry-pick onto master. This branch itself never
  merges (it holds PINQUAD + ALLYSLOT3 src changes).
- **Held:** the DMGPIN lever itself (unchanged, flag-gated OFF by
  default) — unjudged on this band, neither landed nor killed. The
  0330Z pilot's NO-GO kind METRIC-BROKEN + B1 miss is superseded as
  a verdict on the bars, not on the lever: the bars were fixed, the
  band supplied nothing, and the lever remains exactly where the
  0330Z pilot left it — proven to work when it fires, unproven at
  the wall.
- **No confirm run.** The pilot NO-GOed (SUPPLY-THIN); the confirm
  rule spends no seeds after a pilot NO-GO.
