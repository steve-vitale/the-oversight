# sim-rackscap-b — smoke-racks capacity (game-code arm, RACKSCAP_B)

Run: fleshout-loop-b-20261018T1530Z, arm sim-rackscap-b. Worker tree: ~/workspace/worktrees/sim-rackscap-b.
Claimed finding: #534 — RACKS-FULL GUARD IS THE BINDING PRESERVATION CONSTRAINT, NOT THE DINNER RESERVE.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15)

- QUESTION: does doubling the smoke-racks cap move doomed fresh into smoked-and-eaten stock without creating preserved rot?
- PRIMARY (binding): (rot:fresh + rot:preserved) ABSOLUTE per 100 days alive — armed <= 0.85x control. (Share is confounded with survival length — finding #534's metric review; the game.js comment warns smoking anyway converts fresh rot into preserved rot.)
- ENGAGEMENT (kill-fast): extra preserved kcal produced armed vs control >= 100k across the armed side (duty-time cook drive throughput delta). If the doubled cap never binds differently, KILL at pilot.
- GUARDRAILS: rot:preserved ABSOLUTE <= control (the cap must not create preserved rot — the whole point of the cap per the game.js comment; a preserved-rot rise kills the arm even if total rot falls); median survival >= control-10d; per-pair starvation <= +2 (collapse-aware); laundering 0 measured AT CONVERT TIME (lesson #101 — the spoilsmoke at-convert-time pattern); det-gate byte-identical gate-off; no new death mode.
- HORIZON: 180d death-aware. SUBSTRATE: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (pre-seat); base courtship policies (leadfeast, belongfeast). SEEDS: 5111-5118 FRESH (banned list checked; 5101-5108 rejected — used by sweep-leanwinter-20261017) x {leadfeast,belongfeast} x {control,armed} = 32 runs, identical seeds, own in-sweep paired control.
- ARM: coordinator-authorized game-code change at src/js/game.js:6635 (was `125 *` → env-gated `250 *` under RACKSCAP_B=1). Eligibility window (<=2d), dinner reserve, budget, and the existing racks-full guard logic all stay identical. Env-gated, default OFF, zero-trace revertible; FOODLEVER_R5 opt-in-gate pattern followed (try/catch process.env check).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. "Rot can't be smoked back into food" — the duty drive skips spoiled stacks (game.js:6611 `isSpoiled(it, 0)` continue); the arm does not touch that. The ladder is respected: smoking only re-labels fresh→preserved at 0.80x (blind) with the cook's ownShelf, no calorie creation.

## Instruments

- scripts/test-rackscap-b.js — proof: RED on pristine (RACKSCAP_B=1 changes nothing; 3 on-assertions FAIL), GREEN post-edit 9/9 (gate-on smokes through the old cap ~0.80x of the 4000 budget; gate-off pristine parity; two identical gate-off fixtures → identical pantry digests).
- scripts/detgate-rackscap-b.js — pre-change digests recorded on pristine game.js (scripts/detgate-rackscap-b.digests.json); post-change gate-off verify 4/4 IDENTICAL (2 seeds x 2 policies, 60d). The env read draws no RNG and mutates nothing.
- scripts/sweep-rackscap-b.js — 32 runs: rot:fresh vs rot:preserved split (deduped by item identity in sweepSpoiled), duty-time cook drive throughput (resolveOneAssignment cook wrap), laundering measured at convert time, kind-aware person/villager deaths (findings #517/#525/#530), starveDays (npcNeeds hunger>70), racks-full vs racks-worked narration capture for sense-testing.
- scripts/analyze-rackscap-b.js — aggregator with the pre-registered verdict.
- scripts/build-rackscap-panels.js — §15 balanced-panel compare (cookbulk pattern: panels from the sweep's own per-seed JSONs; panel = instrument, threshold = judge). Compare .md attached.

## Results

32 runs: seeds 5111-5118 x {leadfeast, belongfeast} x {control, armed}, 180d death-aware,
FEASTSCALE_R13=1, SEATDRIVE=0, master verified by probe (all runs on the gated game.js
build; gate unset on control, RACKSCAP_B=1 on armed). Per-seed JSONs:
evidence/2026-10-18/perseed-rackscap-b/.

Aggregate (scripts/analyze-rackscap-b.js):

| metric | control (16) | armed (16) | delta |
|---|---|---|---|
| rot fresh absolute | 2,375k | 2,180k | -195k (moved, not removed) |
| rot preserved absolute | 206k | 406k | **+200k (guardrail KILL)** |
| rot (f+p) per 100d alive | 113,422 kcal | 113,497 kcal | **ratio 1.001 (PRIMARY FAIL, bar <=0.85)** |
| duty preserved (engagement) | 1,505k | 2,314k | **+809k (ENGAGEMENT PASS, bar >=100k)** |
| racks beats full / worked | 1137 / 583 | 587 / 942 | -550 / +359 |
| median survival | 149d | 151d | +2d (guardrail PASS) |
| median starveDays/100d | 23.6 | 20.3 | -3.4 |
| per-pair starvation deaths | — | — | 1 worse / 11 tied / 4 better, max +1 (PASS) |
| laundered (at convert time) | 0 | 0 | PASS |
| national | 4/16 | 8/16 | +4 |
| table | 13/16 | 13/16 | 0 (leadfeast 7->5, belongfeast 6->8) |
| wins | 0/16 | 0/16 | 0 |
| wave 4 / wave 5 | 13/16 / 0/16 | 10/16 / 0/16 | -3 / 0 |
| exiled | 0 | 0 | 0 |
| death causes (top) | combat:146 monster:89 sickness:11 starvation:6 | combat:130 monster:63 sickness:11 contest:10 | no new death mode |

VERDICT: NO-GO at pilot per §14. Engagement fired hard (the doubled cap binds
differently — +809k preserved produced, racks-full beats halved), but total rot
did not move (ratio 1.001) and preserved rot ROSE +200k: the extra smoked stock
is not eaten before it turns. The game.js comment was empirically confirmed —
"a preserved stockpile bigger than the haven can eat before it turns rots on
the racks; smoking anyway converts fresh rot into preserved rot." The cap is
load-bearing, not a tuning guess.

The kill is clean on mechanism, not on engagement: the arm did exactly what it
was designed to do (move doomed fresh onto the racks), and the village could
not convert the larger preserved stockpile into eaten food. Killing the cap
doubling does not mean preservation is maxed — it means the *cap* is not the
binding constraint; the *draw* is (the village eats ~125 kcal/person/day from
the pantry and eats fresh-first, so preserved stock beyond ~2 nights of draw
is a rot liability).

### Pair-level notes (same-seed control vs armed, most informative)

- s5112 leadfeast: control died d173 (rot 206k/30k); armed SURVIVED 180d (rot
  208k/104k, duty 228k vs 98k). The arm's best pair — survival +7d, but note the
  armed side's preserved rot still tripled (104k vs 30k).
- s5115 leadfeast: control d124 rot 304k/21k (racksFull 229); armed d178 rot
  699k/125k (duty 330k, racksFull 304). A glut seed where the arm smoked
  aggressively and the preserved stock rotted at scale — the guardrail failure
  in miniature.
- s5116 belongfeast: identical numbers both sides (d147, rot 96k/0k, duty 39k,
  racksFull 0) — the racks never filled on this pair, so the gate never
  engaged; honest null pair.
- s5111 leadfeast: control d75 rot 73k/0k; armed d82 rot 124k/5k — small early
  death, rot worsened.

### §15 balanced-panel compare

scripts/build-rackscap-panels.js (cookbulk pattern; panels from the sweep's own
per-seed JSONs; detgate-rackscap-b.js pins gate-off neutrality per policy).
Compare: evidence/2026-10-18/rackscap-panel.{json,md} (+ -before/-after .json.gz).
Decision: review_required — driven by a leadfeast table regression_watch
(delta -0.25, CI [-0.5, 0]); belongfeast table moved the other way (+0.25),
net 13=13. Small-sample wobble, not a directional arm effect; the panel is the
instrument, the pre-registered threshold is the judge (primary FAIL either way).

### Telemetry deviation check

vs scale-wall.json (national,table,wins,exiled): one LOUD — "wins disappeared:
baseline 16 -> current 0". Investigated: NOT an arm effect (control side is
also 0/16 wins on these seeds). The baseline's _regime label (loop A, finding
#532) explicitly warns against comparing the winseat 100%-win suite to the
pre-seat courtship substrate. Not rolled. national 4+8=12 matches baseline 12
exactly across the two files.

## Wall numbers

national 4/16 control vs 8/16 armed (12/32 total); table 26/32 (lesser seat,
SEATDRIVE=0 pre-seat); wins 0/32; wave-4 unlocks 23/32 (13 control, 10 armed);
wave-5 unlocks 0/32; median survival 149d control / 151d armed. The scale wall
is unchanged: no wins on this substrate by design (pre-seat); national reach
improved on the armed side but the rot verdict kills the arm regardless.

## Sense-testing

Sampled racks narration from the sweep (sense-cookbulk-style random sample,
verbatim):

- Control, leadfeast s5112: "🍲 Salvatore cooked for the haven — meals
  stretched. The racks are already full (20,659 kcal kept — more than the haven
  can eat before it turns), so Salvatore left the fresh pile for tonight's
  dinner instead of smoking it onto the rot pile."
- Armed, leadfeast s5115: same line at 29,606 kcal kept — and the data says the
  armed side's preserved rot tripled. The line reads as honest cook judgment on
  both sides; the armed-side data gives it new weight: the guard's claim ("more
  than the haven can eat before it turns") is empirically load-bearing.
- Armed, leadfeast s5113: "🍲 DeAndre cooked for the haven — meals stretched.
  DeAndre worked the smoke racks too — 1 batch preserved (~3200 kcal, keeps a
  couple of weeks)." Honest, legible, matches the mechanism.

Judgment: the duty-time cook voice is meaningful on both sides — it names the
kept amount, states the reason, and narrates the decision. The one sense
wrinkle: on heavy-glut runs the racks-full line can fire 2-3x/day verbatim
(control-belongfeast s5115: 286 racks-full beats in 122 days). That's the
pantry-check-beat repetition class (cf. foodvoice2) — documented, not chased
(stay on axis; the repetition is a content/voice question, not a lever).

## Village assessment

What the village looked like: a competent pre-seat courtship village that eats
fresh-first and preserves what it can, living under a racks-full guard that
fires constantly on glut seeds (s5112 control: 164 racks-full beats vs 42
worked; s5115 control: 229 vs 28). Who thrived: larger-roster, longer-lived
villages (s5114/s5117 survived the full 180d, reached national/global, wave 4)
where the cook could work through gluts day after day. Who died: early-death
villages (s5111, s5116: wave 2-3, d44-82) where the pantry never filled enough
for the cap to matter — the gate never engaged. What knowledge was missing:
nothing about the smoke technique itself (blind penalties teach, the 16-tick
pace holds); the missing piece is on the *draw* side — the village's
nightly pantry draw is the binding constraint on preserved stock, and no lever
on the *supply* side (reserve halving, cap doubling) can move rot past it.
Which blank I filled: finding #534's named next is now answered — the racks-full
guard is not over-conservative; doubling the cap converts fresh rot into
preserved rot (+200k) with zero total-rot movement. The guard's 125×roster×shelf
cap is load-bearing. Documented (evidence) rather than shipped (killed at pilot).

## Metric review

- The absolute-per-100-days-alive primary behaved as intended (finding #534's
  metric review): share would have flattered the arm (armed survived slightly
  longer), the absolute showed the null.
- Engagement threshold (>=100k) fired at +809k — the mechanism genuinely
  engaged; a higher threshold would not have changed the verdict since the
  guardrail, not engagement, killed.
- Guardrail choice vindicated: "rot:preserved absolute <= control" was the
  decisive line, pre-registered before the first sim ran. Without it, the
  engagement PASS (+809k smoked) could have been read as progress.
- One instrument note for future runs: build-rackscap-panels.js's read() first
  read the .json.gz as UTF-8 (Z_DATA_ERROR); fixed to buffer read. The sibling
  build-cookbulk-panels-v2.js carries the same latent bug.

## Convergence state

killed-at-pilot. The cap-alone variant is concept-dead on this substrate:
engagement does not imply conversion, and the game.js comment's mechanism
(fresh rot -> preserved rot) is measured, not hypothetical.
KILL PROTOCOL: game.js reverted zero-trace (verified `git diff --quiet HEAD --
src/js/game.js`); instruments (proof 9/9 GREEN pre-revert, det-gate 4/4
IDENTICAL, sweep, analyzer, panel builder) + this evidence landed. Post-revert
re-verification: proof gate-off 4/4 PASS + gate-on 3 FAIL = RED (the gate is
gone, expected); det-gate 4/4 IDENTICAL on the reverted tree. Layer leaves
no trace in src/.

INFRA NOTE (pre-existing, not this arm): scripts/check.js --quick shows 1
failure — scripts/test-sprites-valid-20261014.js (dustboar/sunback/sweeps_week/
cliffhanger sprite diffs). Unrelated to this arm (src/ pristine in this tree;
my only game-code change was reverted). Left for the owning lane.
