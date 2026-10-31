# sim-pocketcall-trigger-a — the TRIGGER-FIRST pocket-call (NO-GO, arm killed)

Run: Loop A worker, arm sim-pocketcall-trigger-a, axis scale-onramp, run
fleshout-20261031T1107Z. POLICY-SIDE lever arm: one new policy file
(scripts/policies/pocketcall-trigger.js, default-OFF via
POCKETCALL_TRIGGER=1), zero src/js changes, zero edits to existing
files (delegate.js and deadfall-b.js reused VERBATIM; all five
diagnostic instruments reused VERBATIM).
Worktree branch: sim-pocketcall-trigger-a. Base anchor at sweep time:
4c92bbb042d4 (recorded per seed as anchorCommit). NOTE: this base
DIFFERS from the pocketdesign census anchor (003a9c2f391e) — so the
judge is the fresh baseline sweep run in THIS worktree (S-PATROL
stack, policy layer present but OFF), on identical seeds, and the
pocketdesign corpus is a cross-base reference only.
Pre-registration: evidence/2026-10-31/sim-pocketcall-trigger-a-prereg.md
(written BEFORE any judged sims; judged exactly against it below).
Proof: scripts/test-pocketcall-trigger-20261031.js — 22/22 GREEN at
proof time (static perception scan, layerOn, T1 fixtures incl.
throttle and all skip cases, live OFF-identity gate on non-band seed
85901 30d with day hashes identical no-layer vs layer-OFF, synthetic
corpora through the real analyzer with confirm GO on the synthetic).
No [needs-eyes] is claimed for the kill: nothing player-facing ships
(the policy is deleted with the arm; see §Verdict).
Panel (§15): NOT APPLICABLE, none fabricated — scripts/balance-panel.js
`compare` requires panel.json.gz artifacts from the panel's own driver
over sweep-compare registry policies, and its driver cannot run this
arm's custom stack (fullseat+delegate+deadfall+trigger layers are not
registry policies; its 150d capable-substrate runs would measure a
different substrate, not this arm's before/after). The honest
comparison instrument for this axis is the pocketdesign analyzer
lineage (identical seeds, identical stack, identical instruments,
only the env flag differs), run here as
scripts/pocketcall-trigger-analyze-20261031.js over both corpora.
Same declaration as the pocketcall/pocketdesign arms.

## Verdict: NO-GO (judged exactly against the prereg)

Confirm (16 seeds, both arms, all four bars required):
- C1 primary: FAIL. Baseline dry-at-fight count 6; threshold
  floor(2/3 x 6) = 4; trigger dry count 13 > 4. The count rose even
  though the dry SHARE fell (see §The count-vs-share problem).
- C2 attribution: PASS. All 13 trigger armed fights are T1-attributed
  (a T1 log row for that vid with after > 0 on day <= fight day).
- C3 cost bars: PASS. Starvation deaths trigger 2 <= baseline 1 + 2;
  median gameDays trigger 96 >= 0.8 x baseline 90 (= 72).
- C4 instruments clean: PASS. 0 errors on all five diags, all 16
  seeds, both arms; 0 join problems; 0 pocket-seq problems.
confirmGO = false → NO-GO. Per the prereg and the task brief, the arm
is KILLED: the policy file, the sweep, the proof test, the offgate
helper, and the proof fixtures are DELETED before commit (killed arms
leave no trace). What lands is this evidence, the prereg, the two
corpora, and the standalone analyzer — so a future arm can re-derive
every number and can reuse the T1 log format without resurrecting
the lever.

Pilot (8 seeds) had been PILOT-GO on all four pilot bars (instruments
clean; mechanism firing with 619 T1 attempts / 95 armed; all 8 armed
seeds complete; starvation 2 <= 0 + 2 and median 101 >= 0.8 x 90),
which is why the confirm was spent. The pilot already showed the
warning sign this verdict turns on: dry count 2 → 5 while dry share
fell 67% → 42% (see §Metric review: the count bar and the share
story point opposite ways, and §14 binding keeps this run's verdict
NO-GO regardless).

## The answer, in plain words

The trigger works — and the count still fails, and both halves of
that sentence are true. Give the leader a rule — "when you stand at
the fire with a fighter whose quiver is empty, hand them ammo" — and
he does it constantly: 1,614 trigger calls across sixteen villages,
183 of them actually putting ammo in a quiver, and every single
armed wave-4 fight in the trigger arm (13 of 13) traces to one of
those hand-offs. Ruby's story is the clean version: the leader tops
her up on days 12, 30, and 56, following her weapon as it changes
from sling to phase sling, and she walks into a wave-4 Audit with
six stones and fires all three shots she gets. But arming more
fighters also means more fighters meeting bigger beasts: wave-4+
meetings nearly quadruple (20 → 70 band-wide), so even though a
smaller FRACTION of ranged fighters fights dry (86% → 50%), the
absolute number of dry fighters doubles (6 → 13). And the second
half of the hole is not the trigger at all: on the worst village
(s85110) the leader tries 547 times across 200 days — nearly every
day, for three bow fighters — and arms nobody, because the pile
never holds stick + stone + fiber together at the moment he asks.
The trigger cannot pay what the pile does not hold. The call was
never the only hole; the pile is the other one, and this arm priced
it exactly (see §The pile cannot pay).

## Band numbers (judged band, 16 seeds, identical seeds both arms)

- Wave >= 4 fights (all fighters): baseline 20, trigger 70.
  Wave >= 4 ranged fights: baseline 7, trigger 26.
  Dry-at-fight (carriedNeeded == 0): baseline 6, trigger 13.
  Armed: baseline 1, trigger 13 (all 13 T1-attributed).
  Dry share of ranged fights: baseline 6/7 = 86%, trigger 13/26 = 50%.
- Volley (analyzer counts: fights with a volley object, shots, damage):
  baseline 7 fights / 4 shots / 73 damage; trigger 22 fights /
  34 shots / 357 damage. (Baseline's 7 volley objects include dry
  fights with 0 shots; the shots/damage columns are the meaningful
  comparison: volley damage nearly quintuples.)
- T1 totals (trigger arm): attempts 1,614; armed (after > before)
  183; craft-failed 131; the remainder are pile-short no-craft
  attempts (see §The pile cannot pay). By seed: 85101: 106/25/9,
  85102: 45/16/7, 85103: 30/6/7, 85104: 3/2/0, 85105: 95/13/16,
  85106: 163/14/13, 85107: 142/12/5, 85108: 35/7/7, 85109: 38/13/6,
  85110: 547/0/2, 85111: 193/8/8, 85112: 14/8/0, 85113: 43/22/8,
  85114: 15/9/5, 85115: 78/17/18, 85116: 67/11/20
  (attempts/armed/craft-failed).
- Classification of baseline dry fights (6): NEVER-CALLED 5,
  DRY-AT-FIGHT 1, ARMED 1 (of 7 ranged). Trigger dry fights (13):
  DRY-AT-FIGHT 9, DRY-AT-HOME 4, NEVER-CALLED 0. The never-called
  class — the census's dominant class, 5/6 of baseline dry — is
  EMPTY in the trigger arm. The trigger did exactly what it was
  built to do to that class; the remaining dryness is fighters who
  were called (by T1, by departures, or both) and still came up
  empty (pile-short, craft-failed, or spent — see §Still-dry anatomy).
- Outcomes, ranged fights: baseline: vFlee 2 (incl. the armed Ruby
  fight), vDie 4, mFlee 1. Trigger: vFlee / vDie / evade / mFlee
  mixed across 26 (armed fights: vFlee 5, vDie 7, evade 1; dry
  fights: vFlee 7, vDie 3, evade 3 — arming does not by itself
  decide wave-4 fights; volleys soften, they don't decide, third
  data point after Maya's 48 and Ruby's 73).

## Wall numbers (honest, same caveats as pocketdesign)

Baseline → trigger (16 seeds): national 9 → 10, table reached
14 → 10, wins 10 → 7, wave 4 unlocked 14 → 15, wave 5 unlocked
2 → 3, median survival 90 → 96 days, max 201 → 201 days, total
deaths 604 → 704, starvation deaths 1 → 2. Table/win flags are the
policy stack's substrate flags, not ordinary-play claims. Arc
II/III/IV reach, four-realm formation, trap acquisition by source,
counter discovery/kill rates, and young-link succession survival
are NOT instrumented in this substrate and are NOT reported.
Reading the wall honestly: national and wave reach tick UP while
table and wins tick DOWN and deaths rise by 100 — with trajectories
diverged seed-for-seed by the RNG stream (see §Why the denominator
moved), these wall moves are noisy, not a verdict on the trigger.
The cost bars that bind (starvation, median) both pass; the deaths
rise rides with more/longer villages fighting more (median up,
wave-4 meetings up 3.5x), not with starvation (only +1).

## Why the denominator moved (wave-4 meetings 20 → 70)

Total fieldFight calls (all waves) are nearly identical on the
pilot (930 baseline vs 946 trigger): villages meet beasts at the
same rate. What changes is the WAVE MIX: wave-4+ meetings go 20 →
70 band-wide (ranged 7 → 26, non-ranged 13 → 44). Two mechanisms,
not distinguished by this corpus, both consistent with the numbers:
(a) RNG-stream cascade — T1 craft rolls (~1,600 attempts drawing
Math.random) shift every downstream draw, so trajectories diverge
seed-for-seed and meeting composition moves chaotically; (b) real
progression — T1 arming raises volley damage (73 → 357) and village
standing, unlocking higher waves sooner and keeping villages alive
longer (median 90 → 96) to meet more. The analyzer cannot separate
(a) from (b) on this corpus, and the evidence does not pretend
otherwise. What it CAN say: the denominator move is not a T1 bug
(T1 draws no meetings, assigns no tasks, touches no spawn code),
and any future arm judging dry counts must either hold the RNG
stream fixed (impossible for a craft-rolling policy) or judge dry
SHARE alongside count (see §Metric review).

## Still-dry anatomy (trigger arm, 13 dry fights)

- DRY-AT-HOME 4: henry_zhang s85106 d71 twice (vFlee, then vDie
  the same day — two meetings, one empty quiver), visjoin_51
  s85116 d53 (vDie). Home-node fights by fighters T1 could see:
  henry's case is the sharpest — the trigger fires at Haven, yet
  he fought dry at home twice in a day. His T1 rows must have been
  pile-short or craft-failed at every attempt that day (the
  analyzer does not break no-craft reasons per fight; the s85110
  pattern below is the general mechanism).
- DRY-AT-FIGHT 9: gen_erylf7t s85106 d92, elena_petrova s85107
  d173 + d191 (same fighter, twice — a repeat-dry case: T1-armed
  on another day (d19, see the armed list) does not protect a
  later outing), gen_c3um0on s85110 d175/d177/d182/d183 (four
  dry meetings, one fighter, one village — see §s85110), zoe_adams
  s85116 d50 + d56 (see §Sense test), visjoin_53 s85116 d55
  (the T2 case: dry d55, then T1-armed d57 — see §T2).
- NEVER-CALLED 0 (was 5 on baseline). The first-call hole, as a
  class, is closed on this band: every ranged fighter who fought
  had been pocket-called at least once before fighting.

## The pile cannot pay (the second hole, priced)

T1 no-op breakdown (trigger arm, attempts minus armed): craft-failed
131 (the engine's blind 35% / learned 85% roll said no); the rest —
about 1,300 attempts — are no-craft, i.e. the pile was short on at
least one recipe material at the attempt moment (arrow: 2 stick +
1 stone + 1 fiber; bolt: 2 stick + 1 stone). Sling (stone-only)
arms efficiently (e.g. pilot: 13/17, 4/5, 8/8 on three seeds);
bows starve. The extreme case is s85110: 547 attempts, all arrow,
545 no-craft + 2 craft-failed, 0 armed, across 3 bow fighters
(oliver_moore 194, nino_kapanadze 194, gen_c3um0on 159 — nearly
every day for 200 days) in a patrol-heavy village (429 patrol
calls, 396 went). The pile in that village never once held the
arrow recipe together at a T1 moment. This generalizes the
pocketdesign B3 fiber drought: bow ammo's binding constraint is
pile-material availability at the moment of asking, and a
trigger that asks daily still starves when the village's material
economy never accumulates a surplus. A future supply arm should
price pile-material availability AT T1 MOMENTS (not just at fight
moments, where pocketcall-a found the pile adequate) — the two
moments have different pile states, because the village consumes
materials all day.

## T2 — shout-answered top-up: measured through T1, 1 arming

As pre-registered, T2 has no separate policy mechanism (no
policy-visible callback for a distant NPC fight's answered shout;
a fieldFight wrap would be a list learned without a perceivable
channel). Judged through T1, T2-attributable arming = 1:
visjoin_53 (s85116): dry crossbow fight d55 (vFlee), T1 attempt
d55 craft-failed, T1 armed d57 (0 → 5 bolts), armed fight d57
(volley 4 shots, 3 hits, 65 damage, vDie). Two further T2 MOMENTS
did not arm: gen_c3um0on (dry d175 with shout answered by
Alejandro; T1 attempts d178–d182 all no-craft, pile short; fights
d182/d183 still dry) and zoe_adams (dry d50 with shout answered by Sigrun; T1 attempts
d50–d56 — seven straight craft failures, the blind 35% roll saying
no every day — and her d56 fight still dry).
So T2-through-T1 is real but thin (1 arming in 16 seeds) and, like
T1 generally, pile-bound. A true T2 (a shout report reaching the
scholar) still needs game code — a return/report channel — and is
a follow-up design question for the coordinator, not this arm.
T2 is NOT claimed as implemented.

## Sense test (SENSE-TESTING LAW)

Four transcripts read as scenes (trigger corpus):

1. T1-ARMED, same-day success — Samuel (visjoin_53), s85116 d57:
   T1 d55 craft-failed, T1 d57 armed 0 → 5 bolts (upkeep, the
   morning of the fight), then: "Samuel sees The Eulogy coming and
   nocks an arrow — the fight opens at range (4 shots). / loosed
   wide ... / loosed — 22 (511 left) / loosed — 22 (489 left) /
   loosed — 21 (468 left) / Samuel lowers the bow — The Eulogy is
   on them now. (3/4 hit) / R1: Samuel strikes for 20 (448 left)
   / R1: Final Chapter hits Samuel for 59 (0 left)". Judgment:
   the arming reads as a real hand-off with a real volley — and
   the volley does not save him (65 damage against a ~530 HP
   Eulogy, then a 59-damage killing blow). T1 changes the fight's
   opening, not its class. (Narration nit, same class as
   pocketcall-a's: the dry/volley lines say "arrow" for a
   crossbow — bolts, not arrows.)
2. STILL-DRY, same-day craft failure — Zoe, s85116 d50: T1 d50
   attempted in upkeep and craft-failed (blind roll), then the
   fight: "Zoe has Bow but no arrows — the string stays drawn,
   useless. / R1: strikes 16 / Final Chapter hits for 50 (50 left)
   / R2: strikes 15 / hits for 48 (2 left) / Zoe is losing —
   shouts for help! Sigrun charges in! / Sigrun answered Zoe's
   shout, but Zoe is past holding — they run while running still
   works." Judgment: the cruelest T1 timing in the corpus — the
   trigger fired the same day, the dice said no, and she fought
   dry hours later at 2 HP. The shout that brings a swordsman is
   still not the shout that brings a bolt.
3. STILL-DRY, pile-short siege — Anthony (gen_c3um0on), s85110
   d175: T1 attempts d165/d170/d172 all no-craft, then: "Anthony
   walks straight into The Congregation. / Anthony was already
   waiting — ambush! / Anthony has Crude bow but no arrows /
   R1: eyes go red (Rage) / gear absorbs 56 / Absolution hits for
   72 (28 left) / R2: binds the wound — field medicine, +20 HP /
   hits for 37 (11 left) / Anthony is losing — shouts for help!
   Alejandro charges in! / Alejandro answered Anthony's shout,
   but Anthony is past holding — they run." Judgment: reads like
   a person (Rage, field medicine, answered shout, retreat), and
   the dryness reads as a village that cannot make arrows, not a
   leader who forgot — he was asked daily and the pile said no.
4. T1-ARMED, sustained — Ruby, s85102 d84: T1 d12 (sling, 0 → 6
   stones), d30 and d56 (phase_sling, 0 → 6), then: "Ruby walks
   straight into The Audit. / Ruby sees The Audit coming and
   nocks an arrow — the fight opens at range (3 shots). / loosed
   — 23 / 26 / 24 (3/3 hit, 73 damage) / Ruby lowers the bow /
   ... / Ruby sees how this ends — and runs while running still
   works." Judgment: the sustained version of the design — the
   leader keeps one fighter's quiver full across a weapon upgrade
   (sling → phase_sling), and the volley is a real opening that
   still ends in retreat. This is the pocketdesign Ruby fight
   (d78, bow, 4/73) replayed on the new base with a new weapon
   and a T1 hand-off behind it.

## What the village looked like, in plain words

A village where the leader finally stands at the fire and hands
out ammo — constantly, sometimes hundreds of times — and the
fighters who get it walk out and actually shoot: thirteen armed
wave-4 fights where the baseline band had one, volleys quadrupling
in damage. A village where that same leader, in one patrol-heavy
town, asks three bow fighters nearly every day for 200 days and
never once manages to make them an arrow, because the pile never
holds the pieces together. A village where a woman's quiver is
filled the morning she fights and still dies in the first round,
because a volley softens a wave-4 beast but does not decide it.
And a village where the dryness that remains is no longer "nobody
called them" — nobody fights never-called anymore — but "called,
and the pile said no," "called, and the dice said no," and
"called once, spent, and met the next beast empty." The trigger
closed the class it was built for. The count failed because the
village started meeting bigger beasts far more often, and because
the pile — not the call — is now the binding hole for bows.

## Findings for the coordinator (reported here, NOT edited into hidden_files/sim-findings.md — coordinator owns that file)

- K1 (new): PILE-SHORT AT T1 MOMENTS. ~1,300 of 1,614 T1 attempts
  are no-craft (pile short on a recipe material at the attempt
  moment); s85110 is the extreme (547/547 arrow attempts unpaid).
  A future supply arm should census pile-material availability at
  T1/departure moments, not only at fight moments — the pile state
  differs by moment, and fight-moment adequacy (pocketcall-a) does
  not imply attempt-moment adequacy.
- K2 (new): REPEAT-DRY FIGHTERS. elena_petrova (d173 + d191) and
  gen_c3um0on (d175/d177/d182/d183) fight dry repeatedly — T1
  arming on one day does not protect later outings (spent ammo,
  pile-short re-arms). A top-up design needs a re-arm cadence that
  survives spending, not just a first call.
- K3 (new): DRY-AT-HOME PERSISTS UNDER T1. 4 trigger dry fights
  are at home (henry_zhang twice in one day) — Haven co-location
  does not guarantee Haven arming when the pile is short or the
  craft fails. Home fights are a first-class dry population, not
  an expedition-only problem.
- K4 (carried, still open): VOLLEY-AS-WIN remains open (third
  data point: volleys soften, never decide wave-4 fights — 65
  damage then death, 73 damage then retreat).
- K5 (method, for the next arm): the RNG-stream cascade (T1 craft
  rolls shift all downstream draws) makes per-seed fight identity
  unmatchable between arms; band totals + attribution are the only
  honest judge, and count bars need a share companion (see
  §Metric review).

## Metric review (for the NEXT run, never a re-score of this one)

1. C1 (absolute dry count) punishes an arm that increases total
   ranged meetings even while halving the dry rate (this run:
   count 6 → 13, share 86% → 50%, all 13 armed fights attributed).
   The NEXT run's prereg should judge dry SHARE (dry / ranged
   fights) alongside count, with attribution as the tiebreaker —
   or hold the meeting denominator fixed by design. This run's
   NO-GO stands under its own binding bars; the share story is
   reported here, not used to overturn it.
2. The analyzer's volley.fights counts fights with a volley object
   (present even for dry fights with 0 shots); shots and damage
   are the comparable volley columns, not the fight count.
3. The analyzer's T2 rows for still-dry fights record T1 ATTEMPTS
   after a prior dry shout fight, not armings — read them as
   "the T2 moment was attempted," never as "T2 armed." Only the
   t2Attributable count (1) is an arming.
4. Per-seed fight identity is unmatchable between arms (RNG-stream
   cascade, §Why the denominator moved). Future arms must not
   promise seed-for-seed fight matching; band totals + attribution
   are the instrument.
5. s85110-class villages (scholar home daily, patrol-heavy, chronic
   pile shortage) dominate T1 attempt counts (547 of 1,614 on one
   seed). Future T1 reporting should include per-seed attempt
   concentration, not just band totals — one village's drought
   can swamp the band's arming rate.

## Convergence state

converging — the scale-onramp axis measurement: the trigger-first
call is now BUILT and MEASURED (not merely designed): it closes
the never-called class on this band (5 → 0), arms 13/13 armed
fights by attribution, and prices the pile as the next binding
hole — but it FAILS its pre-registered count bar (dry 6 → 13 on a
quadrupled meeting denominator) and is killed as a lever. The
pocket-call design question moves from "who calls?" (answered:
the Haven co-location trigger) to "what pays?" (the pile at the
moment of asking) and "how is dryness judged?" (count vs share).

## Files (as committed; killed-arm contents removed)

- Pre-registration: evidence/2026-10-31/sim-pocketcall-trigger-a-prereg.md
- Evidence: evidence/2026-10-31/sim-pocketcall-trigger-a.md (this file)
- Analyzer: scripts/pocketcall-trigger-analyze-20261031.js
  (derives every judged number from the per-seed JSONs only)
- Corpora: evidence/2026-10-31/perseed-pocketcall-trigger-a/baseline/
  s85101–s85116.json; evidence/2026-10-31/perseed-pocketcall-trigger-a/trigger/
  s85101–s85116.json (S-PATROL stack, this worktree's base
  4c92bbb042d4; baseline = policy layer present but OFF)
- DELETED before commit (killed arm, no trace): the policy file
  (scripts/policies/pocketcall-trigger.js), the sweep
  (scripts/pocketcall-trigger-sweep-20261031.js), the proof test
  (scripts/test-pocketcall-trigger-20261031.js), the offgate helper
  (scripts/pocketcall-trigger-offgate-20261031.js), the proof
  fixtures (scripts/test-pocketcall-trigger-fixtures/), and the
  run logs (pilot/confirm *.log) plus diagnostic scratch scripts.
- Reused, unmodified: scripts/ammo-diag-20261031.js,
  scripts/supply-diag-20261031.js, scripts/stickfiber-diag-20261031.js,
  scripts/pocketcall-diag-20261031.js, scripts/pocketdesign-diag-20261031.js,
  scripts/policies/deadfall-b.js (VERBATIM), scripts/policies/delegate.js
  (VERBATIM).
- Infrastructure note (for the coordinator, not a finding about the
  game): the container EPERM write flap was active through much of
  this run (windows lasting minutes; sibling agents' git/evidence
  writes flapping concurrently). Mitigations used: the sweep's
  writeSeedFile retry (verify size > 0 + JSON parse, 15s x 40),
  the proof's OFF gate over stdout (no corpus writes), and
  committed proof fixtures instead of runtime-written synthetic
  corpora. A side investigation established the flap is episodic
  in time (not caused by requiring sim-harness — an early
  correlation that did not reproduce once the window cleared);
  diagnostic scratch scripts from that investigation were deleted
  with the kill.
