# Coordinator evidence — loop B run fleshout-loop-b-20261026T0530Z (axis food-economy, 2 DIAG arms LANDED, merged locally pending ship)

Run: oversight-flesh-out-loop-b, run_id fleshout-loop-b-20261026T0530Z.
Axis: food-economy (converging). Loop A was live on scale-onramp at run
start (claim fleshout-20261026T0340Z, arms deedtest/qualityrefresh/
devotiongate) and finished during this run (its arms landed + a batch ship
bump, master de87ffe79 -> cc855cf08); loop A was NOT touched at any point.
B's previous run (0435Z stafffallback landing) had already retired its claim
and lock, so this run started with no B lock and no live B claim.

## Pre-registration (coordinator level, bound before any sim)

- Arms (2, planned up front, independent systems, no shared files):
  1. sim-fishstaff-b — DIAG, fish staffing refusal vs persisting assignments.
  2. sim-racksvoice-b — DIAG census, racks-full voice frequency.
- Shared substrate where applicable: policy leadfeast, DEPOSITGATE=1,
  FEASTSCALE_R13=1, SEATDRIVE=0, death-aware horizons (100d for both arms).
- What was NOT re-run or re-judged: the landed cook staffing fallback
  (908ad0f12), the preserver-widening verdicts (preserveact, rotdecide2),
  the say-capture verdict (saystub-b), and any scale-onramp arm. The
  stafffallback Rosa capture is already fixed; this run does not re-prove it.
- Each arm carried its own pre-registered GO threshold in its evidence
  header; both arms are judged against their own headers below, never
  against a friendlier metric after the fact.

## Arm 1 — sim-fishstaff-b: DIAG-GO (commit eff027b48, proof green on merged master)

Question (backlog open item, onzero9754-b assign logs, seed 9754):
assignTask('fish') refused ~99% of calls, yet snapshot fish assignments
persisted (17 days on pd0). Observed, never reconciled — until now.

Verdict: DIAG-GO. GO leg 1 (9754 both sides, mechanism named with exact
counts) MET. GO leg 2 (same classification on >=6/8 band seeds pd0) MET —
8/8, zero deviating seeds. Neutrality: instrumented runs match
recorder-free baselines exactly on both 9754 sides (pd0: 34 days, wave 2;
pd1: 52 days, wave 3).

The reconciling mechanism, in plain words: refusals and assignments are
two different villagers' stories, and the long tail is shelter, not fresh
staffing. (1) The refusals are ONE repeated ask: the only caller of
assignTask('fish') in the policy is counterPlay -> assignAnother (the
creek-crew loop), which re-reads free villagers every iteration and always
picks the top scorer — so when the top scorer refuses, she stays free,
stays top, and absorbs every iteration that day. On 9754 every refusal is
rosa_mendez (pd0: 19/19; pd1: 14/14), all on the trust gate ("Trust too
low"), all with stored trust below 10. Across the band, every refusal on
every seed is trust-below-10. (2) Every snapshot fish-holder is either
FRESH-OK (an ok assignTask call that day, via 'in-person') or STALE.
No assignment ever came from offerDeal or appealToGoal (0 calls on all
runs) — there is no second path. (3) STALE means SHELTERED, proven:
179 STALE holders across the corpus, all 179 sheltered=true at snapshot
time, with matching kept (not resolved) resolve events while sheltered.
Zero unsheltered STALE holders. A sheltered fisher keeps the creek-crew
slot while catching nothing, and counterPlay counts that stale holder as
a fisher, so it staffs fewer fresh fishers while the muster lasts. The
background cell's 17 days decompose to 2 fresh ok calls (greta_hansen,
days 84-85) plus ONE assignment that stopped resolving from day 86 to
day 100. (4) Trust-0 quirk, reproduced: Rosa's pd1 ok call (day 17)
happened at stored trust 0, because checkObedience reads trust with
`|| 10`, so a stored 0 reads as "unknown" -> 10 and passes the fish gate
of 10. A villager at rock-bottom trust can accept fish duty while a
villager at trust 5 refuses it.

Per-seed table (fixed instrument; full table in sim-fishstaff-b.md):
9754 pd0: 34d, 19 calls, 0 ok, 19 refused, 0 snap days, wave 2, no national.
9754 pd1: 52d, 16 calls, 2 ok, 14 refused, 1 snap day, wave 3, no national.
Band pd0 (9750-9757): days 100/100/100/93/34/78/100/100; refused 0/8/0/2/19/
13/82/4; snap fish-days 100/96/99/91/0/71/87/97; national yes on
9750/9752/9753/9756/9757. No wins, no table on any run (SEATDRIVE=0
construction, not a reachability claim).

Fix shapes for a FUTURE arm (NOT implemented here, zero src/js changes):
(a) fish staffing fallback mirroring the landed cook fallback — walk down
the scored candidate list until someone accepts, instead of re-asking the
top scorer; (b) trust-0 vs unknown in checkObedience — read stored trust
with an explicit undefined check (as offerDeal already does); design call
for Steve: should a 0-trust villager refuse honestly, or is "0 means
unmeasured" intended; (c) sheltered-holder crew counting — design
question, not a bug claim: should sheltered holders still count toward
wantFishers when a muster lasts weeks.

Instrument-bug disclosure (worker's own, read before trusting any number):
the FIRST instrument version's registerDeath wrapper counted deaths but
never delegated to the original, so villages lived far longer (9754 pd0:
95 days instead of 34) and every first-pass number was trajectory-
perturbed. The bug was caught by the pre-registered neutrality check,
fixed (delegate, then count), and EVERYTHING was re-run with the fixed
instrument; all numbers above are from the fixed runs. The perturbed
first-pass numbers are NOT in the evidence table and must not be quoted.
Base drift note: 9754 now dies day 34/52 instead of surviving 100 as in
the background corpus, because the base moved — but the STRUCTURE
reproduces exactly (one refuser + a handful of fresh ok calls +
shelter-stale tail).

Proof: scripts/test-fishstaff-b.js — TEST PASS on the branch, post-rebase,
and on merged master (neutrality matches on both 9754 sides). Corpus:
evidence/2026-10-26/sim-fishstaff-b-corpus/ (11-file manifest asserted).

## Arm 2 — sim-racksvoice-b: DIAG-GO (commit 4f0bc3335, proof 57/57 on merged master)

Question (backlog open item, saystub-b): seed 9757's racks-full voice
fires 106 times — documented for a future sense arm, not chased there.

Verdict: DIAG-GO. (a) 9757 REPRODUCED EXACTLY: racksFull 106, sayTotal
370, worked 43, batches 107, resolutions 43, deaths 3, daysAlive 100,
national — identical to saystub-b on every reported field, no drift to
explain. (b) Gate + recurrence shape named with exact counts on 8/8
seeds, no deviating seed in gate terms: on every seed, every cook's
racks-full count EQUALS that cook's distinct complaint days (test T2
"gate holds" 8/8). (c) Validity: 16/16 files present and parsing;
batches >= resolutions on every cell; worked == resolutions on every
CAP=1 cell (52/54/50/62/34/20/61/43). Neutrality guard: CAP=0 vs CAP=1
numeric fields identical on 8/8 seeds — the capture moves nothing.

The governing gate, in plain words: the cook's job runs about three
times a day. Each time, the game checks whether the smoke racks are
overfull (all smoked + rendered food vs what the village can eat before
it turns — about 13 days' worth for an unskilled cook). If the pile is
bigger than that AND there is fresh food about to rot that could have
been smoked, the cook says so — but only ONCE per cook per day. A
notebook (`_racksFullVoice`) remembers which cook already complained
today. On the cook's second/third jobs that day, or on a day when the
racks are full but nothing is about to rot, the cook just says the plain
"cooked for the haven" line. The fullness is re-checked every time;
only the VOICE is gated.

The recurrence shape: it is MANY cooks, each complaining on their own
cook-days — not one cook repeating daily, and not a gate that resets.
A racks-bound village with two cooks working the same day produces TWO
complaints that day, and a village stuck racks-bound for weeks produces
a complaint per cook per day for the whole stretch. 9757's 106 = Miguel
55 + Grace 36 + Kealan 14 + Hryts 1 over 55 distinct days (d44-d100);
most racks-bound days carry two complaints. Other seeds: 9753: 64 lines
(Courtney 50, Roberto 14); 9750: 33 (Sierra 18, Malik 15); 9752: 37
(Mason 3, then Theo alone 34 days); 9756: 17 (Grace alone); 9751: 4;
9755: 4; 9754: 0 (racks never filled; village lost day 95 — the gate
working, not silence).

Sense judgment (SENSE-TESTING LAW): the line never lies about the pile,
but as VOICE it degrades into pure repetition exactly when the pile is
frozen — which is most of a long racks-bound stretch. Examples: 9755 —
16,256 kcal on all 4 lines; 9752 — 17,033 kcal x 11 straight days
(d38-d48), then 16,043 x 7 days; 9757 — 19,409 / 19,349 / 19,467 each
frozen for multi-day runs inside the 106. A player reading the log sees
"the racks are already full (19,467 kcal kept...)" day after day from
two cooks, with nothing new said. The honest complaint becomes noise
not because the number is wrong, but because nothing changed and it is
said again anyway. Counter-note: the plain frame is the largest single
voice in the corpus (9757: 221 plain of 370 cook lines vs 106
complaints); plain lines cannot be split further from text alone (they
cover second/third resolutions, racks-full days with no about-to-rot
surplus, and non-full days with nothing to smoke) — a stated limit,
not a finding.

Future-arm designs documented (NOT implemented here, zero src/js changes):
designs B / C / B+C for the racks-full voice gate (see
sim-racksvoice-b.md) — a future arm owns the choice, including whether
a frozen-pile complaint should repeat at all.

Per-seed table (CAP=1 census; CAP=0 numerics identical): 9750: 100d,
batches 144, res 52, racksFull 33, deaths 6, national, wave 4. 9751:
100d, 145, 54, 4, 8, national, wave 3. 9752: 100d, 147, 50, 37, 3,
national, wave 2. 9753: 100d, 162, 62, 64, 3, national, wave 3. 9754:
95d (lost), 72, 34, 0, 14, regional, wave 3. 9755: 82d (lost), 51, 20,
4, 14, regional, wave 4. 9756: 100d, 171, 61, 17, 3, global, wave 4.
9757: 100d, 107, 43, 106, 3, national, wave 4. Totals: racksFull 265
over 8 seeds; worked 336; plain 708; say 1380. No table, no wins
(SEATDRIVE=0 construction).

Proof: scripts/test-racksvoice-b.js — 57 PASS / 0 FAIL on the branch,
post-rebase, and on merged master. Corpus:
evidence/2026-10-26/sim-racksvoice-b-corpus/ (16 files).

## Wall numbers (this run's judged corpora — both arms SEATDRIVE=0, so table/wins are construction zeros, not wall findings)

- Fishstaff (11 configs): national reached on staffed seeds; 9754 dies
  young (34/52d) with the creek unstaffed; wave reach 2-4; deaths 3-15
  per run, starvation 0-3.
- Racksvoice (16 configs): national-or-better 6/8 (national 5, global 1),
  regional 2/8; wave reach 2-4; deaths 3-14.
- Combined: table 0, wins 0, full seat 0, wave 5 0 — all by construction
  on these corpora (no seat legs, no win chain). Nothing here moves the
  scale wall; both arms are food-economy diagnostics, and their value is
  mechanism truth (shelter-stale staffing, voice-gate shape), not wall
  progress. food-economy stays converging; scale-onramp stays converging
  (untouched; loop A's arms landed separately this morning).

## Village assessment (plain words)

On seeds where the creek crew staffs, the village fishes every day and
the crew turns over normally — people take the job, work the creek, and
the job opens again tomorrow. On 9754 the village never gets that going:
the same person is asked over and over, says no over and over (she
doesn't trust the leader enough yet), and the village dies young with
the creek unstaffed. When a crisis musters the village inside, fishers
keep their assignments but catch nothing — and because the crew count
includes them, the leader staffs fewer replacements, so a muster quietly
thins the food line even after the danger passes. The villagers are not
acting robotically here: the refuser refuses for a named reason (low
trust), the sheltered villagers are inside for a named reason (muster),
and the rest work when asked. The robotic-looking part is the LEADER's
loop — asking the same refuser up to 3 times a day instead of moving to
the next candidate — which is exactly the cook-fallback shape that
already landed for cooks. In the kitchens, the cooks talk honestly about
their work, but on a racks-bound village the same honest complaint
repeats day after day from two cooks about a pile that hasn't changed —
true, but noise.

## Reachability / sense verdicts

- Waves 1-5: wave 4 reached on both corpora; wave 5 reached on neither
  (no wave-5 content is exercised by these food-economy diagnostics).
- Arc II/III/IV, regional -> national, table, win flag: national reached
  (see above); table/win not exercised (SEATDRIVE=0) and not claimed.
- Villagers act like people: YES on both arms' traces, with the two
  named exceptions that are leader-loop / voice-gate shapes, not
  villager behavior (the re-ask loop; the frozen-pile repetition).

## Blanks filled or documented

- FILLED (mechanism, DIAG): fish refusal vs assignment persistence —
  reconciled (single-caller re-ask + shelter-stale tail + trust-0
  quirk). Backlog fish-staffing item marked fixed by this run.
- FILLED (mechanism + sense, DIAG): racks-full voice recurrence —
  characterized (per-cook-per-day gate, many-cook multiplication,
  frozen-pile repetition as the sense failure).
- DOCUMENTED (future arms, not implemented): fish staffing fallback
  (mirror the cook fallback); trust-0 checkObedience fix + Steve's
  design call on 0-vs-unknown; sheltered-holder crew counting;
  racks-full voice gate designs B/C/B+C. All appended to the findings
  backlog by this run.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current '<per-seed-evidence-glob>' --metrics national,table,wins,exiled`
on BOTH corpora: exactly 2 LOUD lines each (table 16->0, wins 16->0) —
the known WINSEAT-regime artifact class (SEATDRIVE=0 corpora vs a
WINSEAT baseline; table/wins are structurally 0 here). Baseline NOT
rolled, no new investigation. Balanced panel: both arms attempted it;
the panel cannot ingest recorder corpora (racksvoice §15, same failure
class as all prior recorder runs) and the fishstaff panel attempt died
on an EPERM write inside the panel's own worker. No panel inputs were
fabricated; the analyzers' per-seed tables are the §15 fallback.

## Infrastructure (loud, for the next coordinator)

- Container EPERM flap was active intermittently all run: blocked the
  second worktree registration twice (racksvoice branch shell left at
  master HEAD, 0 commits ahead — verified, then deleted and re-registered
  clean after the flap cleared); blocked the fishstaff rebase 4 times
  (head-name write EPERM; recovered with `git rebase --quit` to a clean
  state, then a retry loop — attempt 4 rebased clean); blocked a /tmp
  script write once (recovered inline). NEVER force ref surgery during
  the flap; the retry-and-quit pattern is the recovery.
- Safe-commit index clobber: repaired by the racksvoice worker on its
  commit (verified via git show --stat); fishstaff commit clean.
- Ship loop landed a version bump mid-run (cc855cf08) plus loop A's
  devotiongate/qualityrefresh arms; both B arms rebased onto the moving
  master clean, proofs re-run green after every rebase and on merged
  master.
- Pre-flight reap: all existing trees dirty (sibling work protected,
  none removed); active 7/16 at start, 6/16 at closeout (both B trees
  released done-merged, branches deleted, worktrees removed). Main tree
  clean at closeout (git status --short empty).
- check.js --quick NOT re-run: both landed commits are DIAG-only, zero
  src/js, own proofs green on merged master.

## Metric review (§14 — for the NEXT run; these verdicts are NOT re-scored)

- The fishstaff arm's first-instrument bug (registerDeath wrapper that
  never delegated) is a standing warning: any future wrapper instrument
  must prove delegation on a neutrality pair BEFORE its numbers are
  judged, not after. The neutrality pair caught it here; keep that gate.
- The racksvoice arm's plain-line split limit (221 plain lines on 9757
  that cannot be split from text alone) should be named in any future
  voice census header, so a future arm does not promise a split the
  text cannot support.
- No metric in this run proved wrong in a verdict-changing way; the
  pre-registered thresholds held as written.

## Convergence state

food-economy stays converging (NOT converged): two staffing/voice
mechanisms are now measured truth with fix shapes documented, but no
food-economy game-code fix landed from this run (both arms DIAG-only),
and the fish fallback / trust-0 / voice-gate fixes are still future
arms. scale-onramp stays converging (untouched; loop A). The standing
directive stands until the tracker records an axis converged on measured
evidence. Next blanks, in order: (1) fish staffing fallback arm (mirror
the landed cook fallback) on the 9754 + band substrate; (2) trust-0
checkObedience fix, pending Steve's 0-vs-unknown design call; (3)
racks-full voice gate arm (designs B/C/B+C); (4) sheltered-holder crew
counting question; (5) away-ration fix remains KILLED at pilot (do not
re-try the same pack-sizing lever); (6) preserver-widening stays
refused on its deciding corpus (do not re-judge).

Claim deleted; lock deleted. Evidence: this file (coordinator) +
evidence/2026-10-26/sim-fishstaff-b.md + sim-fishstaff-b-corpus/
(eff027b48) + evidence/2026-10-26/sim-racksvoice-b.md +
sim-racksvoice-b-corpus/ (4f0bc3335). Merged locally, pending ship.
