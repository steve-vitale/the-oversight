# Long-run sim loop — round 2359A (axis scale-onramp — 1 BUILD GO + 1 DIAG-GO, merged locally pending ship)

Run: fleshout-loop-a-20261101T0000Z. Coordinator: loop A.
Axis: scale-onramp (converging, NOT converged). Sibling Loop B live on
food-economy for the whole run (2343Z claim: strandtile + refusedband —
NOT touched; B landed twice mid-run, see below). Claim filed before any
sims; rotation file untouched (convergence-directed axis work supersedes
rotation). Pre-flight: main tree clean, disk 19%; worktree-reap removed
nothing — sibling dirty trees refused as designed.

## Stale-lock recovery (this run's start)

The previous Loop A run (2156Z) had landed on master (coordinator evidence
b0973a64b: twoblow + contactrec merged) but its lock and claim cleanup was
missed: lock dated 2026-10-31T21:57:23Z, claim still live, no registered
tree for that run_id, no worker processes. Per the concurrency guard that
is a dead run no matter how fresh the lock looks. A concurrent closeout
retired both at 23:59Z (claim renamed .DEAD with a note) while this run's
own lock/claim were being created; this run verified the retirement and
did not touch Loop B's live 2343Z claim. No work was redone: 2156Z's arms
were taken as landed, and this run worked the next items on its closeout
list. The engine-cap decision (steve-call) was NOT built.

## Pre-registration (both arms, before sims)

- sim-chorus-a prereg: evidence/2026-10-31/sim-chorus-a-prereg.md
  (commit fee8fc4cb, rebased onto master as part of the landing chain).
  Primary: committed fights lost to a chorus downbeat round; pilot GO =
  leak count to 0 AND converted kills >= baseline AND committed deaths 0
  AND median survival >= baseline -10% AND wave->=3 field deaths <= 7.
  Confirm bar: same bars on 12 fresh seeds.
- sim-spikecontact-a prereg: evidence/2026-10-31/sim-spikecontact-a-prereg.md
  (commit 0c173d9de, plus two amendments acb810c76 and 211a37d05, both
  committed before any evidence verdict and neither changing a GO
  threshold). Primary: 100% classification of committed fights and
  contact meetings under both damage definitions and the instrument
  split, with zero unclassified, on re-analysis and a fresh pilot.
  DIAG arm: no before/after comparison, so panel §15 is N/A as
  preregistered.

## Arm 1 — sim-chorus-a (BUILD GO: PILOT GO + CONFIRM GO, game code landed)

One file of game code, src/js/fieldFights.js (+36 lines): CHORUS-HOLD.
Mechanism proven from code + both leak transcripts: the twoblow gate sets
committedFinish but does not suppress later break checks, which re-gate
every round and fail on any round without a landed lead strike. A chorus
downbeat dance consumes the whole turn, so commit round N -> dance round
N+1 -> beast flees. Fix: a per-round dancedThisRound flag (set in the
dance branch); at the break check, if already committed + danced this
round + beast alive + arena not sealed, the beast does not flee — log
line "(Committed finish, chorus hold)", loop continues. The twoblow gate
is wrapped in the else branch, behavior-identical when the hold does not
fire. NOT re-opened: 60% HP gate, break line (0.15), 40% companion floor
(fires first if breached), committed-finish NO-GO, sealed arenas. No
strike is forced through a dance round; the dancer still pays the whole
turn. Dance-only by design — a general hold would also cover 0-damage
strikes, shouts, waits, wider than the leak justifies. Proof test
scripts/test-chorus-20261031.js: 73/73 post-rebase. Engine legs: 1100
hold fights — 1049 vKill, 51 honest later mFlee; every hold follows
commit < dance < hold; spool negative 0 holds. Det-gate: recorder ON/OFF
byte-identical on 87104/87127; judged lever seed 87123 re-ran identical.

Numbers, identical seeds, per-band never pooled:

- Pilot (8 seeds): chorus-leak fights 2 -> 0 (bar PASS); converted field
  kills 1 -> 2 (bar PASS); committed deaths 0 -> 0 (bar PASS); median
  survival 119.5 -> 121d (bar >= 107.55 PASS); wave->=3 field deaths
  4 -> 4 (bar <= 7 PASS); national/table/wins 7/7/7 both legs; wave-4
  5/8, wave-5 0, full seat 0 both legs. Only seed 87123's trajectory
  diverges (other 7 per-seed files byte-identical): the Kate kill changes
  the village's downstream story, so Gabriela's later fight does not
  recur in the same form on the lever leg. The judged leak metric is
  therefore 0 dance-lost committed fights anywhere on the lever leg —
  not "both named fights re-fought and held." Stated plainly so
  "2 -> 0" is not over-read.
- Confirm (12 fresh seeds 87142-87153): leak 0 -> 0; converted 0 -> 0;
  committed deaths 0 -> 0; median 118.5 -> 118.5d; wave->=3 field deaths
  3 -> 3; national 8/12, table 9/12, wins 8/12, wave-4 7/12, wave-5 0/12,
  full seat 0 — identical both legs. All 12 per-seed files
  byte-identical between legs (modulo anchorCommit): the lever is
  exactly inert where no dance-round commit occurs. Vacuity, disclosed
  not hidden: the confirm band contains ZERO leak opportunities (only
  1 committed fight in 12 seeds, a spool floor flight on 87146).
  Confirm proves no-harm + narrowness, NOT independent effect
  replication; the effect evidence is the pilot + 1100-fight engine
  proof. Confirm-band effect replication would need outcome-screened
  seeds and is not recommended.
- Pooled 20 (judgement pooling only): leak 2 -> 0, converted 1 -> 2,
  committed deaths 0, wave->=3 field deaths 7 -> 7, national 15/20,
  table 16/20, wins 15/20, wave-4 12/20, wave-5 0, full seat 0.

Panel (§15): review_required (screen-only conservatism, same as twoblow)
with every mapped metric delta exactly 0 — no regression signal.
Panels built from sweep corpora (twoblow precedent; deviation stated on
the compare file).

Sense-reads (plain words): baseline Kate (87123 d75) and Gabriela (d93)
do NOT read sensibly — both do everything right, dodge the kick exactly
as the chorus demands, and watch the beast walk away (15 HP, 35 HP).
The dance was defensive, not a retreat — a story failure, not a
decision. Lever Kate reads sensibly: identical through R7, R8 dances
(kick catches air, 30 avoided), hold line ("holds through the downbeat
— … the dance was the price of staying in it"), R9 strikes for 20, lead
falls. One loose phrase, honestly noted: at 15 HP with ~20-damage
strikes she was really one blow from falling, but the hold line says
"two blows" — it inherits the commit line's window phrasing, not a
fresh prediction. Wording-pass candidate, not a rule failure.

Check suite (resolved, not waived): check.js --quick twice (626s, 616s):
284 passed, 6 failed — exactly twoblow's pre-existing set
(measurement-proof-update, measurement-workflow, mobile-combat-cadence,
occupation-panels, phone-frame-proof, establishment-r20), none naming
field fights or chorus. All 6 re-run on base-restored fieldFights.js
fail identically; lever file then restored hash-verified. Pre-existing
base debt, not waived, not caused here. Commit carries [needs-eyes]
(combat feel).

## Arm 2 — sim-spikecontact-a (DIAG-GO, instrument/policy only, zero src/js)

Verified: zero files under src/ changed across the whole branch.
Re-analysis of the 20-seed twoblow corpora + a fresh 8-seed pilot on
current master, with the prior twoblow instrument run verbatim as a
control driver (dayHash arrays byte-identical on 87104/87127 — base moved
without moving trajectories). Proof test
scripts/test-spikecontact-20261031.js: 18/18.

(a) Spike-vs-last-two separation — KEEP THE LAST-TWO DEFINITION.
Re-analysis, per leg never pooled for judging: U-COMMITTED (lever legs,
6 fights, 0 unclassified): both 5, last-two-only 1, spike-only 0
(impossible by construction). Conversions 3/3 under both definitions.
U-FLIGHT (break-check mFlee flights, 0 unclassified in every leg):
24 flights total. The only spike-only flights in 20 seeds are two
single-blow Callback fights (Joaquin s87124 d71: 55 vs 25 HP; Meshari
s87135 d127: 40 vs 16 HP) — and neither is convertible under the full
gate set (learn intent; fighter at 35% HP). A spike rule with gates
unchanged converts 0 additional fights. No multi-strike spike-only
flight exists. The binding constraint is the gate set (60% HP, engage
intent, struck-this-round), not the damage definition — proven again
by the fresh pilot's redactor flight (110-damage spike, both
definitions pass, beast still flees because the fighter is at 29% HP).
Fresh pilot: committed 3, 0 unclassified (both 2, last-two-only 1);
flights 6, 0 unclassified (both 2, last-two-only 2, neither 2,
spike-only 0). The pilot reproduces the old lever-pilot band exactly.
Do NOT build a spike-only rule: it adds nothing under the gates that
stand.

(b) Contact-finish BUILD readiness — the BUILD's numbers, fresh pilot.
Wave-3 rows 92; CONTACT meetings 20 (21.7%), all ending mFlee, 0 evade;
20/20 instrument-classified, 0 unclassified. BUILD universe (primary,
weapon-instrument): 14 — every one finishable via melee, 0 via a usable
ranged weapon (a bow with arrows looses a volley first, so any volley
damage disqualifies the row from CONTACT). No-real-instrument
remainder: 6 (the BUILD must leave alone or narrate honestly).
Sensitivities, reported not folded in: spear-inclusive 17,
unarmed-inclusive 20. Lie rate: 20/20 = 100% — split: no-ranged-at-all
12, bow-no-arrows 5, other-ranged-no-arrows 3 (all hunting spears);
lie-with-melee 14. Beast HP at contact: median 8.5 HP; 10 of 20 at
exactly 1 HP. Callers wild 16, aid 4; monsters callback 8, chorus_line
5, spool 4, redactor 3. Evade-row HP capture 12/12 = 100%.
Narration constraints, binding on any BUILD: (1) a no-arrows bow must
never count as the finish instrument; (2) the drive-off line must name
the held weapon — today it always says "with the bow", including for
12 fighters holding no ranged weapon at all; (3) the bow-no-arrows
contradiction is visible in the log itself. BUILD prereg, writable
verbatim: universe 14 (primary) / 17 (spear-inclusive) / 20
(unarmed-inclusive), remainder 6 / 3 / 0 — the universe choice must be
preregistered before the BUILD runs. One new sim-findings item appended
(2026-11-01, spear-in-ranged-slot edge: the BUILD prereg must decide
explicitly whether spear counts as melee, 14 vs 17).

Sense-reads: 4 contact transcripts — all rounds 0, mDealt 0, a single
drive-off line. Dmitri (bow-no-arrows, no melee) — the log refutes its
own line. Sanne (hunting spear, beast at 1 HP) — a single invented-bow
line; the spear edge in one line. Mia (crossbow-no-arrows, sharpened
stick) — finishable via the unnamed stick. Weronika (crowbar, beast at
1 HP) — the crowbar drives nothing in this sentence. Verdict: drive-off
narration is systematically dishonest about the instrument in 20/20
cases. Committed transcripts: Emma s87124 d33 (textbook real decision)
and Gabriela s87123 d93 (commits last-two-only at R11, then a chorus
downbeat dance round at R12 means no strike, so the beast flees at
35 HP — the 2156Z chorus-downbeat leak, re-confirmed; a spike rule
would not have saved it either, max 24 < 35).

Wall numbers, fresh pilot band (per band, never pooled): national 7/8,
table 7/8, wins 7/8, wave-4 5/8, wave-5 0/8, median survival 119.5d, max
197d, full seat 0/8. No wall movement claimed (DIAG arm, no lever
judged). Arc reach, four-realm formation, trap acquisition, counter
discovery, young-link succession: unmeasured in these corpora, not zero.

## Metric review (mandatory, §14)

- Both preregs judged as written; no metric re-scored mid-run.
  Chorus pilot and confirm both pass every bar as written, with the
  confirm vacuity disclosed above (zero leak opportunities in the
  confirm band) rather than hidden. Spikecontact passes all 4 bars.
- Chorus confirm-baseline method disclosure (twoblow precedent, kept
  from the worker): the confirm baseline ran on fieldFights.js
  temporarily restored byte-identical to the base commit (diff empty,
  CHORUS-HOLD grep 0), then restored from HEAD and hash-verified. The
  evidence text — not the JSON anchor — is authoritative for which code
  that leg ran on.
- Spikecontact prereg amendments (2) committed before any evidence
  verdict, neither changing a GO threshold; recorded, not a
  re-scoring.
- Telemetry-check refusal is a design feature, not a gap: see below.

## Landing

Sibling Loop B landed twice mid-run (its 2343Z coordinator evidence, plus
a batch-ship version bump), and a journey-deepening landing also moved
master during registration. Both worker branches were based on older
tips, so both were rebased onto current master before merging: chorus
7 commits re-applied clean, spikecontact 7 commits re-applied clean
(no conflicts; sibling range carries no fieldFights change beyond a
version bump). Proof tests re-run post-rebase (chorus 73/73,
spikecontact 18/18). Merged --ff-only in sequence: chorus feb28ae79,
spikecontact ce448820e. Both edits coexist (chorus game code +
spikecontact instruments, zero src overlap by design). Trees released
as merged, branches deleted, main tree clean. Index clobber hit every
safe-commit on both workers (known 2026-10-22/23 class); every commit
verified correct and the index repaired via --add --cacheinfo from HEAD
blobs before continuing — flag to the ship loop as a recurring
infrastructure wart, not a data problem. Container EPERM write flap
active ~23:47–00:03Z (per B's 2343Z closeout, same window): spikecontact's
first registration failed and an orphan branch delete failed, both
recovered by retries only — no force, no ref surgery, no registry
hand-edits; the orphan branch was deleted only after verifying its tip
equaled master exactly.

TELEMETRY DEVIATION CHECK: `node scripts/telemetry-check.js
--baseline .../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-31/perseed-chorus-lever-pilot/leadfeast/*.json'
--metrics national,table,wins,exiled` — REFUSED the recorder corpus by
design ("all 8 rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs"), same as 2156Z. No LOUD lines, baseline NOT
rolled. The panel compares (attached to the chorus evidence) are the
comparison for this stack.

## Wall numbers (per-band, never pooled)

Chorus pooled 20: national 15/20, table 16/20, wins 15/20, wave-4 12/20,
wave-5 0, full seat 0. Spikecontact fresh pilot: national 7/8, table
7/8, wins 7/8, wave-4 5/8, wave-5 0, full seat 0. Overall wall UNCHANGED:
full seat 0 and wave-5-reached 0 stand — but narrowed further: the
chorus dance leak is plugged (a committed fighter no longer loses a
beast she had already earned to a defensive dance), the last-two damage
definition is confirmed as the right one (a spike rule would add zero
conversions under the standing gates), and the contact-finish BUILD
universe is now exactly quantified (14 primary) with its narration
constraints binding.

## Village assessment (plain words)

The village's fighters now hold their nerve through the chorus's dance:
a fighter who has proven twice over that she can finish a beast no
longer watches it walk away just because the beast made her dance first
— she holds through the downbeat and finishes on the next strike, and
nobody died for it in 20 seeds. The other picture got sharper, not
prettier: about a fifth of wave-3 meetings end the instant beast and
villager meet, and every single time the story lies about how — it
always says "with the bow," even for villagers holding no bow at all,
even for villagers with a bow but no arrows. Fourteen of those meetings
could honestly become real finishes, because the villager is holding a
melee weapon the story never names. The next build has to count those
fourteen, name the real weapon, and leave the other six alone.

## Blanks filled or documented

- FILLED (landed): the chorus-downbeat leak — CHORUS-HOLD, a dance-only
  hold for committed finishes, with pilot + confirm GO and no
  survivability cost.
- FILLED (measured): spike-vs-last-two separation — last-two confirmed,
  spike-only ruled out as a BUILD (0 additional conversions under the
  standing gates); and the contact-finish BUILD universe — 14 primary /
  17 spear-inclusive / 20 unarmed-inclusive, remainder 6 / 3 / 0, lie
  rate 100%, narration constraints binding.
- DOCUMENTED (future arms, not built here): (1) contact-finish BUILD —
  now fully prereg-ready, universe choice must be preregistered, plus
  the spear-counts-as-melee decision (new sim-findings item
  2026-11-01); (2) chorus hold-line wording pass ("two blows" phrasing
  at 15 HP) — wording candidate, not a rule failure; (3) engine-cap
  decision — still steve-call, not built; (4) veterans-2 manufacture —
  still the wall: twoblow + chorus-hold add conversions but narrowly,
  wave 5 still unreached; (5) chorus confirm-band effect replication
  needs outcome-screened seeds and is not recommended.
- NOT re-opened: the break line, the committed-finish NO-GO, any gate
  threshold, the HP-gate relaxation (still forbidden by the HOLD-collapse
  lesson), the spike rule (measured dead, not retried).

scale-onramp stays converging (NOT converged): a real game change
landed this run, but no wave-5 or full-seat reachability shown.
food-economy untouched (sibling Loop B lane). Claim and lock deleted at
closeout (after this commit). Merged locally, pending ship.
