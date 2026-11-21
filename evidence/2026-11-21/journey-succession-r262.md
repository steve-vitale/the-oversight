# Journey succession r262 — run note (2026-11-21)

- Run: r262, Lane B leg 7 SUCCESSION (EARLY_KILL_DAY=40, POST_DAYS=70)
- Run id: playtest-loop-2-20261121T0355Z (scheduled Fri 2026-11-20 22:00 CST)
- Base: local master `36d694f13` at registration (Lane A scale r248 merged
  mid-pre-flight; the 03:55Z pull predates it — base re-verified in the
  worktree; the scale merge is what moved master under the run, not a
  rebase — the branch is master + 0)
- Branch: `journey2-succession`, worktree `~/workspace/worktrees/journey2-succession`
- Rotation read `7` (succession); write `7→4` at closeout with read-back
- Policy: competent + succession driver (r258 fork + pre-death WIT-SIT scan)
- Seeds: 34403 (KNOWN supply replay) + smoke 33998 (standing control);
  M12 panel-confirm seed 45787 (r260 driver, separate OUTDIR)
- Prereg: `evidence/2026-11-21/journey-succession-r262-prereg.md` (this note
  adjudicates against it; metric binding applies — a miss is NO-GO, never
  re-scored mid-run)

## Pre-registration (from the prereg)

Three arms, in order: (1) M12 escalator cap — fix the favor-requirements
escalator cycle (r260 Ines d27, "three times now" 3x in one sitting),
proof test RED→GREEN, panel-confirm on seed 45787 (M12-native bar
max≤1, 0 sittings 2+, exits≥1). (2) Succession leg question — STAGE the
witness sitting: the r262 driver runs the WIT-SIT scan after each
PRE-death day too, on the known-supply replay 34403 + smoke 33998;
bars STAGE (≥1 staged wit-sit fires on 34403), REL-WIT (PASS = ≥1
judged witness serving with rel.witnessed true, 0 where not witnessed;
0 servings despite a staged sitting = INSUFFICIENT-DATA, the question
narrowing to the pick), plus carried r258 bars (REL-BOND, REL-VET,
MOURN-TEMPLATE, MOURN-EXHAUST, MANTLE-FINE, DRY, WILD, C3d, CONTROLS
— smoke snapshot matches r233 exactly). (3) Conditional: "You asked
me that before" strip addition to the M4 discourse-opener strip.

## Arm 1 — M12 escalator cap: FIXED, proven, panel-confirmed [PENDING CONFIRM RESULT]

DEFECT (mechanism, read from src/js/convo-dialogue.js before any play,
proven by the RED run): the favor-requirements repeat handler escalates
As I said → Like I said → Still the same thing → "I've told you three
times now" → spend-out "We're going in circles" — then RESETS
`_favorReqEscalations` to 0. The next repeat re-serves "three times
now", then circles again, then three-times again, as long as the player
keeps pressing (the spend only drops `dlg:favor_requirements` from the
menu; the outing action re-enters the same path — exactly the r260
Ines sitting).

FIX (`src/js/convo-dialogue.js` + one line in `src/js/conversation.js`):
per-sitting, per-block-reason latch `c._favorReqCirclesServed[escKey]`.
Once the circles exit has fired for an escKey, every further repeat for
that key serves the circles line (and re-spends the choice), never
"three times now" again. A new block reason re-arms honestly; a fresh
sitting resets the latch with the convo object (the reset lives in
conversation.js's sitting-reset block, beside the other favor-req
counters — the first GREEN run caught the latch leaking across sittings
because that block is the only reset site; fixed in the same arm).

PROOF (`scripts/test-journey-succession-r262-escalator-cap-20261121.js`,
r195 staging, seed 777036, 8 presses):
- RED (pre-fix): 5 FAILURES — three-times 3x (presses 4, 6, 8),
  circles 2x (5, 7). The cycle reproduced exactly as the r260 sitting.
- GREEN (post-fix): 8 transcript door lines; three-times exactly once
  (4th); lines 5–8 all circles; spent stays true; fresh sitting resets
  counters + latch. First GREEN run had 1 failure (latch leak) — the
  conversation.js reset line above is the fix for it; re-run fully
  GREEN.
- Neighbors stay GREEN: r195 favorreq-cycle, r180 favorreq-exit, r21
  favorreq-repeat (ALL PASS), r35 favorreq-spendout (GREEN).

PANEL-CONFIRM (r260 driver, seed 45787 only, OUTDIR
evidence/2026-11-21/r262-confirm — the committed r260 JSONs are NOT
overwritten): **PASS on the M12-native bar.** tallyThreeTimes over
the confirm JSON's 84 transcripts: total 14 three-times lines, **max
1 per sitting, 0 sittings with 2+, exits 24**. The worst sitting is
Ines Duarte herself (D-talk-request, 9 turns) — the same villager
from the r260 defect — now serving "three times now" exactly once.
The escalator cycle is dead in the wild on its native seed.
Confirm driver exit 0; the r260 JSONs in evidence are untouched
(verify at commit: git status shows only r262 files).

## Arm 2 — succession: the sitting STAGED, the pick missed (once)

PANEL (driver `scripts/journey-succession-r262-20261121.js`, analyzer
`scripts/analyze-journey-succession-r262-20261121.js`, runner
`scripts/run-journey-succession-r262-panel.sh`): 34403 pilot exit 0,
smoke 33998 exit 0, analyzer exit 0.

### What happened on 34403 (the replay diverged — read this first)

The 34403 replay is NOT r258's trajectory. On r258, Duc died
organically day 29 and Karimi died in an ambush (witnesses Giulia +
Grace). On this replay Duc died by the SCRIPTED kill day 41, Karimi
never died at all (she is alive at census; no Karimi corpse), and the
chain ran Duc → Giulia (contest d64) → Grace (stranger d95) → Cesar.
Cause: the base moved between r258 (d352834ef) and this run
(36d694f13, carrying the r248 scale commit's bond-initiation.js
change) AND the worktree carries the M12 fix — either perturbs convo
RNG enough over 40 days to butterfly the deaths. The pre-death scan
itself did NOT perturb phase A on this seed: no pre-death sitting
fired (no witnessed pre-death death occurred), so the driver drove
nothing before the leg death. The divergence is a fresh trajectory on
a changed base, not a controlled re-run — recorded honestly, not
explained away. The staging question was still answered, by a
different witnessed death (below).

### The staged sitting — Isabella, day 82

Isabella died in combat day 81–82, witnessed by Cesar + Grace. The
post-death scan staged Cesar the same day (d+41, freshPersonN=1,
single-fresh): latelyDead=Isabella, latelyWitnessed=true, refused=
false. The sitting is the first staged single-fresh witness sitting
on any succession panel. The pick drew the VETERAN variant, not the
witness one — Cesar: "Isabella killed the things that come at night.
I did too. That's a small club, and it's smaller now."
(opener:vet-club, judged HELD: bothVet=true, witnessed=true). The
witness lines were in the pool (2 of ~9); one draw, one miss.
witnessServed=null in the driver record, 0 witness servings in the
analyzer. No transcript-dup collision (transcriptDup=false).

### Results — analyzer verdicts

| Question | Verdict | Numbers |
|---|---|---|
| STAGE (new, binding) | **PASS** | 1 staged wit-sit fired on 34403, single-fresh, latelyWitnessed=true, lately named the staged dead 1/1 |
| REL-WIT (binding) | **INSUFFICIENT-DATA** | 0 servings; 1 single-fresh witness draw < 3-draw floor. The question narrows to the pick, not the sitting (per prereg) |
| REL-BOND (binding) | **PASS** | 3/3 held (Ella d+64 bond-knew ×3 shapes) |
| REL-VET (binding) | **INSUFFICIENT-DATA** | 1 serving held (Cesar vet-club); 6 opener draws < 10-draw floor |
| MOURN-TEMPLATE (binding) | **PASS** | 23 servings, 0 same-speaker repeats, 0 village-window repeats |
| MOURN-EXHAUST (binding) | **PASS** | 0 exhausted-line servings |
| MANTLE-FINE (binding) | **PASS** | 4 deaths observed, 0 flippedImmediate=false, 0 fineLatency≥2, 0 day-skips |
| DRY CENSUS (binding) | **PASS** | 0 dry hits |
| WILD CHECK (binding) | **PASS** | no regressions observed (see below) |
| C3d WILD HOLD (binding) | **PASS** | 0 erasures (recap opener fires — see People check) |
| CONTROLS (binding) | **PASS** | smoke 33998 matches r233 exactly (see below) |
| CAP-NC (descriptive) | INSUFFICIENT-DATA | 0/0 eligible |
| HABIT-COLLISION | PASS | 0 collisions |
| MULTI-NAME SITTING | 0 sittings | no driven sitting landed in a multi-name window |
| WITNESS-CENSUS | SUPPLY-PRESENT | 1 witnessed person corpse (Isabella, combat, Cesar+Grace) |

CONTROLS detail (smoke 33998): handoff d6 Heinrich → Grace
(scripted), relPost bonds 33, relD14 50, selfId grace_obi, pick rank
1, funeral INCALL true, selfReq 0 — the r233 snapshot exactly, on
every field. The pre-death scan drove nothing on the smoke (no
witnessed pre-death death), so the driver change is inert there.

WILD CHECK detail: the r254 multiwit proof (4 cases), r232
relationship-mourning proof, r225 F5 harness (22/22), and r258
selfwit proof all re-run GREEN on this base. No F4a/F4b/F4c/F5/F6/
C3c/F2/C3d regression observed in the panel transcripts.

## Census (plain words)

Two villages. 34403 lived 110 days past the leg death: Duc fell on
the expedition, Giulia took the mantle and fell in a contest, Grace
took it and was taken by a stranger, Cesar carries it now — three
h clean handoffs, nobody's day skipped, 9 alive at the end. The
village buried its dead by name: 19 mourning servings, every one
naming the right dead, none repeated for the wrong person. One death
was watched — Isabella fell in combat with Cesar and Grace standing
there — and the village sat with the witness the same day. He spoke
about her as a fellow fighter, not as a sight he couldn't shake;
the words about seeing her fall are still unspoken, waiting on a
second draw. 33998 is the quiet control: Heinrich fell on the
expedition day 6, Grace took the mantle, 11 alive at the end, the
village still talking about him a week later.

## People check (SENSE-TESTING LAW — read full transcripts)

- **Cesar (34403, day 82, the staged sitting):** a real person with
  two things on his mind at once. He opens on the water — the
  cistern's nearly dry, 6 liters left, haul the creek at dawn — and
  the door rule blocks him ("Move next to your partner, on the same
  side of the Haven door."). He pivots to what's weighing on him
  and names Isabella through the shared-veteran lens ("That's a
  small club, and it's smaller now."). The want and the grief share
  one conversation without fighting each other, and it ends clean
  ("This was good." They mean it.). The sitting is the leg's thesis
  working: the witness speaks, in his own voice, about the one he
  saw fall — he just reaches for the fighter's words first.
  Sensical. PASS.
- **The "You asked me that before" prefix fires in the wild in this
  very sitting** — Cesar's vet-club line arrives behind it. It is a
  change-ack, not content — the Arm 3 strip's premise, observed
  live.
- **Ruby (33998, day 13, mourning Heinrich):** carried from the
  smoke's d+7 sittings — "Heinrich is gone and the world just...
  continues." plus the last-words turn. Sensical, characterful
  (r258's reading stands; the smoke is byte-identical to r233's
  control, so the transcripts are the same ones).
- **Verdict: PASS.** Conversations have want, engagement, and
  endings that resolve or plant. No fabricated shared history
  spotted; no filler loops outside the (now capped) escalator.

## Arm 3 — "You asked me that before" strip: DONE, pins hold

`scripts/journey-social-r226-helpers.js`: the prefix joins
stripM4DiscourseOpener (same shape as the ack-question stem). Proof
test extended (`scripts/test-journey-social-life-r250-m4-split-20261119.js`,
section 6): 3 strip cases on the aroha trio verbatim, trio unflags
as a set, same-content-with-recap-tail still flags. **49/49 GREEN**,
and the r238 corpus pins hold EXACTLY at 181 / 174 / 7 — the strip
moves nothing on the corpus (the 56 prefix occurrences in r238 sit
in lines that never paired), so no re-baseline is needed. The r260
panel would read 9 conversational instead of 12 with the strip (the
aroha trio unflags); the r260 note's prediction is confirmed by the
proof test, not by re-running the panel.

## Metric review

- **REL-WIT stays INSUFFICIENT-DATA, but the binding constraint
  moved.** r258: no sitting ever fired (WIT-SIT NO-STAGING). r262:
  the sitting fired, single-fresh, latelyWitnessed=true, named the
  staged dead — and the pick drew the veteran variant instead. The
  next step is NOT a wider screen or another staging tweak: it is
  draws. One sitting gives one draw from a ~9-line pool; the 3-draw
  floor needs three staged single-fresh sittings, and this panel
  produced one. A next run should stage MORE sittings per seed
  (raise the cap, or stage the same witnessed death across two
  sittings on consecutive fresh days) rather than screen more seeds.
  The variant is proven by harness (r254) and the pool is proven
  reachable (this sitting); only the pick is unmeasured.
- **The 34403 replay diverged.** Supply is trajectory-fragile: a
  base move + a game fix between panels re-rolled which deaths
  happen. Replays of "known supply" seeds are fresh trajectories,
  not controlled re-runs — future preregs should say so, and the
  STAGE bar should not depend on a named corpse surviving a base
  move (this run's bar didn't: it asked for ANY staged sitting, and
  Isabella supplied it).
- **M12-native:** the fix is proven by the harness and (pending)
  the 45787 confirm. If the confirm reads max≤1, the escalator
  cycle is dead in the wild.
- **M4 strip:** the r238 pins hold exactly; the strip buys the
  headroom r260 wanted (12 → 9 on the r260 panel, by proof test).
- Proof refresh rounds 11 + 12 remain owed (measurement-proof
  track, carried since r192/r194/r195).
- Scout-role ping-pong / driver re-ask pestering: carried, unchanged.
- m3v2b: 34403 echoOld 8 / echoV2 10 / echoV2b 9; 33998 4 / 5 / 5.
  Carried, not a bar.
- BOWCRAFT bisect for the 34362 drift stays open (not this run's).
- Outing-chain re-tune stays open (conversion 12.9%, r260).
- F5 V3 still never served in the wild.
- Day-skip watch: twenty-fourth straight panel watch, 0 day-skips.

## Proof tests (this run)

- `test-journey-succession-r262-escalator-cap-20261121.js` — RED 5
  failures pre-fix → GREEN post-fix (8 presses; three-times exactly
  once). Neighbors r195 / r180 / r21 / r35 all GREEN.
- `test-journey-social-life-r250-m4-split-20261119.js` — 49/49 GREEN
  (extended §6; corpus pins 181 / 174 / 7 exact).
- Re-runs on this base: r254 multiwit ALL GREEN; r232
  relationship-mourning ALL GREEN; r225 F5 22/22; r258 selfwit ALL
  GREEN.

## Telemetry

`node scripts/telemetry-check.js` on the panel corpora: **quiet**
(2 files, 5 metrics, no large deviations). Per-file means for the
record — deaths.bearer 2.0 (34403: 3, 33998: 1), census.alive 10.0
(9, 11), census.fallen 3.5 (6, 1), integrationStage 3.0 (3, 3),
week2.deadBearerMentions 3.5 (5, 2). Baseline NOT rolled (quiet;
prereg rule also forbids rolling a forced-chain panel forward).

## Infrastructure

- Registration took ~10 min under box load (`git reset --hard`
  CPU-bound, load 15+; not stuck). Heartbeat loop
  `journey2-succession-hbloop-r262.sh` (setsid, 10-min cadence)
  ran the whole run; no stale heartbeat.
- No write flap observed this run (all writes succeeded first try).
- Safe-commit index clobber: watch for it after every safe-commit
  (known class; repair via `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info`).
- VM restarts: none observed during this run (uptime stayed 44+ min
  from the 03:2xZ replacement).
- Sibling activity (untouched): Loop B fleshout 0330Z registered
  sim-holderstate-b mid-run (the #2605 per-part holder-state
  recorder); Lane A scale r248 adoption merged 36d694f13 into master
  during pre-flight (this run's base); Loop A 0315Z (rollwall +
  holdersupply) running in parallel.

## Verdicts

| Leg question | Verdict |
|---|---|
| M12 escalator cap (fix) | **FIXED + PROVEN** — RED→GREEN, neighbors green; panel-confirm [PENDING] |
| STAGE (new) | **PASS** — first staged single-fresh witness sitting ever |
| REL-WIT (binding) | **INSUFFICIENT-DATA** — 1 draw < 3 floor; the pick, not the sitting, is now the wall |
| REL-BOND (binding) | **PASS** (3/3 held) |
| REL-VET (binding) | **INSUFFICIENT-DATA** (6 draws < 10 floor; the 1 serving held) |
| MOURN-TEMPLATE | **PASS** (23 servings, 0 repeats) |
| MOURN-EXHAUST | **PASS** (0) |
| MANTLE-FINE | **PASS** (0 issues, 0 day-skips) |
| DRY CENSUS | **PASS** (0 dry) |
| WILD CHECK | **PASS** (all four proof re-runs green) |
| C3d WILD HOLD | **PASS** (0 erasures) |
| CONTROLS | **PASS** (smoke matches r233 exactly) |
| M4 strip (Arm 3) | **DONE** — 49/49, corpus pins exact |
| **Succession r262** | **reachable: yes; fun: yes (the staged sitting reads true; the mantle passes cleanly); winnable: not yet — the witness variant still waits on a second and third draw** |

## Closeout

- [TO BE COMPLETED: confirm result, gate, commit, merge, rotation, lock.]
