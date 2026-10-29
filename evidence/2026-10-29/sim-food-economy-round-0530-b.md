# Loop B 0530Z — food-economy ADOPTION ROUND (merged locally, pending ship)

Run: fleshout-loop-b-20261029T0530Z, axis food-economy (converging).
Loop A live on scale-onramp throughout (0415Z claim, arms w4dpr2-finish +
lottery-a; w4dpr2 landed as 271c59584 mid-run, NOT touched) -> B worked
food-economy, the second axis.

## STALE-LOCK RECOVERY at start (this run's first result)

The previous B run (0330Z, arms nighttravel-verdict + creekpath-armc) was
dead on arrival: its worker heartbeats sat at 05:08/05:09Z — 32 minutes
stale, past the ~30-minute heartbeat cadence, with no worker writes after
05:28–05:29Z and none 05:30–05:40Z while this run watched. The 0330Z lock
was deleted, its claim retired to .DEAD, and this run took the adoption.
(The timeout is confirmed in the run record: nighttravel pilot corpora
done with verdict pending; creekpath Arm C before-leg done, after-leg
pending.) The 15-minute guard letter would also have called it dead; the
extra 10-minute watch (past one full cadence, with file-activity checks)
is what kept this from deleting a live run's lock — the workers' last
writes were 1–5 minutes before this run's 05:30Z start, so a hasty
heartbeat-only call at 05:33Z would have been wrong in spirit. Lesson
for the next recovery: heartbeat age alone is not liveness when the
heartbeat cadence itself is ~30 minutes; check file activity + one
cadence interval before deleting.

Both stranded trees were heartbeated by this run before any reap, so the
reaper could not touch them; both adoption trees were registered fresh
(10/16 active at the time). Registration was slow under load (~7 min for
the first tree, ~14 min total for both; git worktree add itself parked,
not the registry lock).

## Arm 1 — sim-nighttravel-verdict-adopt-b: GO (LANDED db622ad66)

Adoption of the stranded verdict arm. Bank commit bf3b685c9 (36-qualifier
bank from scan 0c8409f69, prereg ffa772515) cherry-picked clean onto
current master as 24e8677fb; stranded pilot corpora (8+8 files, same 8
seeds both legs) + wedge file copied verbatim, every file verified
parsing + non-zero, no re-run needed. Adoption prereg written BEFORE any
judging (thresholds verbatim from the bank prereg). Staged verdict:

- Wedge: NOT REPRODUCED. The stranded wedge file (insideevening s11149,
  71,263 bytes) is byte-identical to the corpus file — the run completed.
  The 1934Z chain park (25:50 at 0:19 CPU, 8 control files 0 bytes) is
  NOT diagnosed by this run; every leg here completed (pilot adopted +
  extension + confirm fresh, 28 more seeds, no park). Honest statement:
  a transient of the dead run's chain, not a property of the instrument.
- Pilot 8 (adopted): withinReach 2/3, n = 3 < 8 -> INSUFFICIENT-DATA per
  the prereg's minimum-n rule (not a GO, not a NO-GO); extension mandatory.
- Pooled 16 (pilot + extension): withinReach 7/8 = 0.875, n = 8 met; G1
  30 vs 30, G2 2 vs 3, G3-fixed 0 violations -> confirm spent.
- Pooled bank 36 (pilot + extension + confirm 20): PRIMARY M1r 19/22 =
  0.864 vs bar 0.50, n = 22 >= 8 -> GO. G1 median daysAlive 30 vs 30
  (>= control - 2) PASS. G2 starvation-cause counts 8 vs 12
  (<= control + 2) PASS. G3-fixed 0 violations; 115/115 refused hops
  verified (arrival == departure, 'travel-refused'); 0 moved hops
  landing off-haven; 0 mid-fight/tent entries. Partition sums hold every
  seed; unclassifiedAway 0 everywhere. Secondary: streaks broken 19/45;
  away taps converted 4/25; within-reach taps converted 4/5.
- Proofs on pooled 36 (re-run by the coordinator on the rebased branch
  with the correct 36-seed list): test-nighttravel-b T1–T9 GREEN,
  test-nighttravel-rerun-b R1–R11 GREEN, test-nighttravel-bank-b B1–B8
  GREEN, adoption proof A1–A6 GREEN, no src/js changes. Coordinator
  note: the first coordinator re-run used the scripts' DEFAULT seed list
  (10700–10707, the old 2224Z band) and showed PROOF-RED on completeness
  legs — an invocation error, not a branch defect; re-running with the
  bank's 36 seeds reproduced the worker's GREEN exactly. Never judge a
  proof re-run without checking its seed list first.

Landing scope (per the bank prereg's GO rule): the default-OFF policy
instrument ONLY (scripts/policies/nighttravel.js + trace/analyzer/proof
instruments). NO driver adopts it, NO default flip, NO src/js change —
measurement + instrument, NOT a game change.

Plain-words meaning: when the player ends the day away but home is
actually offered as a travel target AND the hop isn't blocked, they get
home 19 times out of 22. But that trigger genuinely fires rarely: of 176
away evenings on the policy leg, only 22 were within reach; 115 were
home-offered but refused on a blockage (washed out, fallen tree, rubble,
creek), 20 too far to be offered, 19 in combat/tent. The lever converts
a narrow, real slice. The dominant population is blocked-path — the next
question, not this lever's failure.

## Arm 2 — sim-creekpath-armc-adopt-b: PILOT NO-GO, KILLED (LANDED b9dca5dd1)

Adoption of the stranded Arm C (standing go-home rule). Stranded prereg
copied verbatim (explicit GO thresholds, so no addendum needed);
before-pilot (8) + before-confirm (16) corpora copied, all 24 files
verified parsing + non-zero, no re-run needed. Delta split verified
BEFORE applying: the stranded competent.js delta was Arm C ONLY (Arm B's
TRIPHOME gate postdates the stranded base and was NOT re-applied — it is
already on master via 927de35c2); after applying, the diff vs master
contained only the standing-home gate + helper + daily call + exports.
Before-leg cross-check reproduces Arm B's published after-leg numbers
exactly (pilot refused 3, pooled refused 7, pooled no-move refused 5).

After-pilot (8 seeds, COMPETENT_STANDING_HOME=1, all other gates
identical): primary stranded evenings 3 -> 0 (bar <= 1) PASS; no-move
co-primary 2 -> 0 (bar <= 1) PASS; strand guard PASS (10752 strand 3 ->
0); G2 counterfactual deaths 0 HOLD — but G1 starvation deaths 0 -> 4
(player starvation 0 -> 0) VIOLATION. Seven of eight seeds byte-identical
in death counts; only 10752 diverged, exactly at the standing step (day
12 rescue; four villager starvation deaths days 25–26, 13–14 days later,
plus other trajectory shifts). Read honestly, this looks like a
consequence cascade after the rescued day rather than a direct cost of
walking home — but the prereg's G1 counts pooled starvation deaths
regardless of causality, and §14 binds: a miss is NO-GO, never re-scored
mid-run. No confirm after-leg was run (prereg forbids confirm spend
until the pilot passes). ALL policy/code changes were reverted to master;
the committed tree carries evidence + proof/measurement scripts only, no
policy trace of Arm C. The standing go-home rule is NOT in the game.

Sense: the rescue itself reads real ("You walk back into Haven. 15 Codex
entries. The village is glad to see you."; before leg strands the seed
days 12–14 at kcal 890 -> 137 -> 0, after leg ends day 12 at home, day 13
at kcal 2390). The kill is a guard kill, not a mechanism failure.
Narration blanks documented, not built: the detour walk has no "going
around the rubble" line (arrives as plain "Travel 3 tiles to Haven");
and a pre-existing oddity — the day's trip says "You clear the rubble,
stone by stone. The path is clear." yet the hop home is still refused
afterwards, with no villager comment. That trip/blockage disagreement
belongs to the trip/blockage area, not this arm.

## Wall numbers (this run's judged corpora)

- Nighttravel (36 seeds x 2 legs, 30d traces): national / table / wins
  NOT OBSERVABLE in position traces (no fields) — reported, not claimed.
  Wave 4–5 unlocks 0/36 both legs; max wave 3 on 1/36 each leg; median
  survival 30d both legs (policy 36/36 survived; control 35/36, one
  village-lost day 29 — single-seed observation, not a survival claim).
- Creekpath Arm C (pilot 8 seeds, 30d): national / table / wins NOT
  OBSERVABLE in a 30d horizon; wave 4–5 none (max wave 2 in 7/8 pilot
  seeds both legs); median survival 30d both legs. No wall movement is
  claimed or implied by either arm.

## Telemetry deviation check

On both corpora vs scale-wall.json (metrics national,table,wins,exiled):
3 LOUD lines each (national 12->0, table 16->0, wins 16->0), all the KNOWN
field-shape + regime artifact class (30d trace corpora carry no
top-level national/table/wins fields; pre-seat/policy substrates vs the
WINSEAT baseline). No exiled LOUD line. Baseline NOT rolled, no
investigation item.

## Infrastructure

- Master moved under the run from sibling lanes (fixall-map closeout
  d09f5aaf9; journey establishment r56 74419616c; journey crisis r63
  032dff51c; ship bumps) — zero file overlap with either arm. Verdict
  branch rebased clean in its worktree (2 commits replayed); proofs
  re-run green after rebase (with the corrected seed list, see above).
  Armc branch merged ff-only from its own base (no rebase needed).
- Safe-commit index clobber: hit the armc worker's commit (repaired via
  HEAD-blob cacheinfo, commit verified correct). No clobber on the
  verdict worker's commits or the coordinator merges. No EPERM flap
  blocked this run's git writes (registrations were slow, not failed).
- check.js --quick NOT re-run at coordinator level: both arms are zero
  src/js (verdict: policy instrument default-OFF + instruments; armc:
  killed, evidence only), proofs green post-rebase; standing 280/7
  pre-existing profile last recorded by the 2215Z/2315Z rounds.
- Stranded original trees (sim-nighttravel-verdict-b,
  sim-creekpath-armc-b) were left registered with coordinator-refreshed
  heartbeats; their content is preserved (verdict bank on master via
  723b96814; armc prereg + corpora + instruments on master via
  b9dca5dd1). The reaper will remove the trees when heartbeats go stale;
  branches remain as record. Adoption trees released done-merged,
  branches deleted.

## Backlog maintenance (sim-findings.md, this run)

Appended [open]: blocked-path dominance (115/176 away evenings refused
on blockages — evening blockage-clearing as the next lever question,
pre-registered separately); unmarked out-of-reach nights (no narration
line for sleeping away when home is too far); detour narration blank
(routed returns unnamed in the log); trip-clearance vs hop-refusal
disagreement (10752 day 12); G1 causal-window proposal for any
standing-home retry (player-only or N-day window or pooled-confirm
requirement before a single-seed cluster kills — a NEW prereg, not a
revision of this run's verdict).

## Verdicts

- food-economy stays converging (NOT converged): the nighttravel bank
  verdict is settled GO as a default-OFF instrument, and creekpath Arm C
  is killed at pilot — but neither is a game change, and no food-economy
  fix has landed as game code in this run. scale-onramp stays converging
  (untouched; sibling loop A lane).
- Next blanks, in order: (1) blocked-path evenings — whether evening
  blockage-clearing (or daytime clearing habits) moves the 115-evening
  population, pre-registered separately, never folded into the
  nighttravel verdict; (2) a standing-home retry ONLY under a new prereg
  with a revised G1 (causal window / player-only / pooled-confirm rule)
  plus detour narration in its sense-test; (3) the 1934Z chain park
  remains undiagnosed — no instrument change proposed, since every leg
  since has completed.

Claim deleted; lock deleted. Merged locally, pending ship.
