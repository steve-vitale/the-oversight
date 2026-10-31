# Long-run sim loop — round 2156A (axis scale-onramp — 1 BUILD GO + 1 instrument GO, merged locally pending ship)

Run: fleshout-loop-a-20261031T2156Z. Coordinator: loop A.
Axis: scale-onramp (converging, NOT converged). Sibling Loop B live on
food-economy for the whole run (2130Z claim, then its 2343Z claim — NOT
touched). Claim filed before any sims; rotation file untouched
(convergence-directed axis work supersedes rotation). Pre-flight: main
tree clean, disk 20%; worktree-reap deferred nothing — sibling dirty
trees refused as designed.

Arms taken, in order, from the 2058Z closeout's next-BUILD list:
(1) two-blow finish window; (2) contact-finish recorder gap (evade-HP
fields) as the instrument precursor to any contact-finish rule. No
strand design revived.

## Pre-registration (both arms, before sims)

- sim-twoblow-a prereg: evidence/2026-10-31/sim-twoblow-a-prereg.md
  (commit 986aae4e5, rebased to 1faa398d0). Primary: converted wave-3+
  field kills; pilot GO ≥1 conversion AND median survival ≥ baseline
  −10% AND wave-≥3 field deaths ≤7. Confirm bar ≥1 conversion on
  fresh seeds.
- sim-contactrec-a prereg: evidence/2026-10-31/sim-contactrec-a-prereg.md
  (commit 2282c5880, rebased to 596da384e). Primary: evade-row HP
  capture ≥90%, classifier reconciliation 100%, corrected contact-break
  estimate with uncertainty stated.

## Arm 1 — sim-twoblow-a (BUILD GO: PILOT GO + CONFIRM GO, game code landed)

One file of game code, src/js/fieldFights.js (+59 lines): at a wave-3+
beast's in-round break check, if the fighter's last two proven blows
sum to at least the beast's remaining HP, the finish converts instead
of fleeing. Gates as preregistered, all held: wave ≥3 only (wave-1/2
fights byte-identical — refuses fieldfinish2's early-lesser-win
divergence class); lead alive; last-two sum ≥ remaining HP (proven =
lead-strike damage after multipliers, >0 only; volley, ambush opener,
collision, ally strikes excluded); fighter HP ≥60% — UNCHANGED,
non-negotiable (the spool suicide-hold lesson and the 2026-10-25 HOLD
collapse still bind); intent engage; this round's strike landed; arena
not sealed. On firing, the round loop continues and any kill comes
from real strikes in later rounds — never a table roll. Companion
(retained from fieldfinish2): once committed, a fighter dropping below
40% HP flees instead of holding to the 5% floor. Break line, all other
thresholds, every other src/js file untouched. Proof test
scripts/test-twoblow-20261031.js: 77/77 post-rebase.

Numbers, identical seeds, per-band never pooled:

- Pilot (8 seeds): converted field kills 0 → 1 (bar ≥1 PASS); wave-3
  field vKills 0 → 2; median survival 118.5 → 119.5d (bar ≥106.65
  PASS); wave-≥3 field deaths 4 → 4 (bar ≤7 PASS); committed fights 3
  (1 kill, 2 flights); committed deaths 0; national/table/wins 7/7/7
  both legs; wave-4 4 → 5, wave-5 0 both.
- Confirm (12 fresh seeds): converted kills 0 → 2 (bar ≥1 PASS);
  committed fights 3 (2 kills, 1 companion flight); field deaths
  4 → 4 (bar ≤7 PASS); median survival 90 → 90d (bar ≥81 PASS);
  national/table/wins 7/10/9 both legs; wave-4 9 → 10, wave-5 0 both.
- Pooled 20 (judgement pooling only): converted 0 → 3; committed
  fights 6 (3 kills, 2 monster-flights, 1 companion flight); committed
  deaths 0; field deaths 8 → 8; median 90.0 → 90.5d; national 14/20,
  table 17/20, wins 16/20, village-lost 4 — identical both legs;
  wave-4 13 → 15, wave-5 0 both. Full seat 0 and wave-5-reached 0
  stand on both legs.

Panel (§15): review_required (screen-only conservatism) with every
mapped metric delta exactly 0 and no regression signal — the opposite
of fieldfinish2's national regression. Panels built from sweep corpora
(dangerfit pattern) because the official driver cannot express this
stack; deviation stated on the face of the compare file.

Sense-reads (plain words): Emma vs Chorus Line (87124 d33) is the
textbook kill — nine steady strikes, 35 damage taken, holds at 65% HP
with the beast at 22 HP (last two blows 36+35), kills next strike. The
spool case is answered the right way: the 17%-HP suicide hold is still
refused by the 60% gate, while a 65%-HP proven-blow finish converts.
Nikolai vs Spool (87126 d79) proves the companion: commits at exactly
60% HP, strikes the beast to 3 HP, the replay hits him to 37% — and
the floor fires, he runs while running still works. Committed deaths
stay 0. Documented leak (future-arm item, NOT a mid-run redesign):
Kate (87123 d75) and Gabriela (87123 d93) commit, then the next round
is a chorus downbeat round and the fighter dances instead of striking,
so the beast flees (at 15 HP and 35 HP). Honest scale: 3 conversions
in 20 seeds is a narrow lever, exactly as finishgate predicted — NOT
a wave-3 kill pipeline, and no scale-wall movement is claimed beyond
the directionally-right wave-4 rise.

Check suite (resolved, not waived): check.js --quick 284 passed,
6 failed (488s). All 6 re-run on pre-rule code (fieldFights.js
restored byte-identical to the prereg commit) and fail identically,
same assertions — pre-existing base debt, none naming field fights or
twoblow: measurement-proof-update, measurement-workflow, mobile-combat-
cadence, occupation-panels, phone-frame-proof, establishment-r20.
Det-gate passed (recorder ON/OFF byte-identical, 2 seeds); judged seed
87124 re-ran byte-identical. Commit carries [needs-eyes] (combat feel).

## Arm 2 — sim-contactrec-a (instrument GO, zero game behavior change)

Fixes the evade-row HP-capture recorder gap from contactbreak-a.
Root cause proven: the old recorder captured HP pre-call from the
world-entity argument `m`; the expedition channel calls
fieldFight(vid, mdef, null, {awareness: true}) — `m` is null, so
pre-call capture is null. In the old corpus ALL 22 missing-HP wave-3
rows are caller=expedition (baseline 15, lever 7); all present-HP rows
are wild/aid.

Fix (instrument-only; no contact-finish rule built): src/js/
fieldFights.js pure logging emission ONLY (`rec.mHpStart =
members[0].hp; rec.mMaxHp = members[0].maxHp;` right after members
construction — no existing field touched, no RNG, no state write, no
engine code reads the new keys, grep-verified); policy capture in
preference order (pre-call entity HP, post-call emission, evade-only
exact fill — opening HP = rec.mHpLeft since the evade return precedes
all damage — plus m=null band-top max; fought rows never get an
invented mHpStart). Rebuilt sweep/splitter from the fieldkill recipe
(the fieldfinish2 instruments were lost in the 2058Z recovery).
Proof test scripts/test-contactrec-20261031.js: 33/33 post-rebase.

Corrected contact-break share (per leg, never pooled): fresh leg with
fixed recorder — CONTACT 27/104 = 26.0%, FOUGHT 77, UNCLASSIFIED 0.
Evade-row HP capture 0/9 → 9/9 = 100%; reconciliation 104/104.
The corrected share is numerically the same as the old floor, but now
a point estimate with zero unclassified remainder, not a floor with a
27–36 range: the 9 contact-shaped evade rows are healthy beasts at
0.83–0.98 of max HP (all FOUGHT — the 36/104 sensitivity bound is
refuted, not just narrowed), and the 6 fought ephemeral rows are
filled by the emission (all FOUGHT). The fresh contact set is
IDENTICAL to the old one (same seed/day/monster keys; median 4 HP).
Fresh trajectories are byte-identical in dayHash + end fields to the
old baseline corpus on all 8 seeds (substrate moved, trajectories did
not), so this is a re-measurement of the same meetings. Fresh wall
numbers (unchanged, no lever judged): national 7/8, table 7/8, wins
7/8, wave-4 4/8, wave-5 0/8. The diverged lever leg was NOT re-run
(backfilled 0/68/3 stands as cross-check only).

Sense-reads: contact logs read coherently except the known
contradiction, still present in 10/27 fresh contact logs — a villager
with "Crude bow but no arrows" drives a beast off "with the bow"; one
fresh log adds a second slip ("has Sling but no arrows" yet the
drive-off line says "with the bow"). A future contact-finish BUILD
must still not let a no-arrows bow count as the finish instrument, and
the drive-off line must name the held weapon. Fresh evade logs (all 9)
read coherently at near-full HP — evades are avoidances of whole
beasts, not contact meetings. Untouched: break line, committed-finish
NO-GO, all gate thresholds.

## Metric review (mandatory, §14)

- Both preregs judged as written; no metric re-scored mid-run.
  Twoblow pilot and confirm both pass every bar; contactrec passes
  all 4 bars.
- Twoblow confirm-baseline method disclosure (from the worker, kept
  here): the confirm baseline ran on fieldFights.js temporarily
  restored byte-identical to the prereg commit (TWOBLOW grep 0, diff
  empty), then restored from HEAD and hash-verified. The confirm
  JSONs' anchorCommit records the then-current HEAD (the rule
  commit), so the evidence text — not the JSON anchor — is the
  authority for which code that leg ran on. Baseline pilot ran on
  prereg-commit code, so its anchor is exact.
- Telemetry-check refusal is a design feature, not a gap: see below.
- Contactrec's fresh-leg equality (byte-identical trajectories) is
  the strongest form of this check — the recorder fix changed no
  game outcome.

## Landing

Sibling Loop B landed twice mid-run (2230-b coordinator evidence and
its arms; 2343Z claim live at closeout — NOT touched). Both worker
branches were based on the pre-landing tip, so both were rebased onto
current master before merging: contactrec 4 commits re-applied clean,
twoblow 8 commits re-applied clean (no conflicts; sibling range
carries zero src/ changes). Proof tests re-run post-rebase (33/33,
77/77). Merged --ff-only: contactrec a8fc9c6b3, twoblow 5aa816b4e.
Both edits coexist in fieldFights.js (emission line 636 + twoblow
markers, verified post-merge). Trees released as merged, branches
deleted, main tree clean. Index clobber hit every safe-commit on both
workers (known 2026-10-22/23 class); every commit verified correct
and the index repaired via --add --cacheinfo from HEAD blobs before
continuing — flag to the ship loop as a recurring infrastructure wart,
not a data problem. One registration per earlier runs' notes was
slow (registry contention) but completed; no SIGTERM this run.

TELEMETRY DEVIATION CHECK: `node scripts/telemetry-check.js
--baseline .../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-31/perseed-twoblow-lever-pilot/leadfeast/*.json'
--metrics national,table,wins,exiled` — REFUSED the recorder corpus
by design ("all 8 rows carry top-level anchorCommit, so they are
sweep recorder rows, not runs"), same as 2058Z. No LOUD lines,
baseline NOT rolled. The panel compare (attached to the twoblow
evidence) is the comparison for this stack.

## Wall numbers (per-band, never pooled)

Twoblow pooled 20: national 14/20, table 17/20, wins 16/20, wave-4
13 → 15 (baseline → lever), wave-5 0 both legs, full seat 0.
Contactrec fresh leg: national 7/8, table 7/8, wins 7/8, wave-4 4/8,
wave-5 0. Overall wall UNCHANGED: full seat 0, wave 5 reached 0
stand — but narrowed further: the in-round gate now converts real
wave-3 kills (3 in 20 seeds) without any survivability cost, and the
contact-break class is now a measured 26.0% point estimate, not a
floor. The remaining volume for a contact-finish BUILD is now
quantified exactly.

## Village assessment (plain words)

The village fights wave-3 beasts and now sometimes finishes them:
a healthy fighter who has already proven, twice over, that she can
cover the beast's remaining health will step in and end it — and a
fighter who is already hurt will still correctly refuse. Nobody died
because of the new rule in 20 seeds. The contact-break picture is
cleaner too: about a quarter of wave-3 meetings end the moment beast
and villager meet, usually with the beast nearly dead (median 4 HP
left) — except the story sometimes lies about the bow doing it when
the villager has no arrows. That narration lie is now a named item
for the next pass, not a mystery.

## Blanks filled or documented

- FILLED (landed): the two-blow finish window — a real wave-3 kill
  converter behind the unchanged 60% HP gate, with a working
  companion floor (committed deaths 0 in 20 seeds).
- FILLED (measured): the contact-break share as a point estimate
  (27/104 = 26.0%, zero unclassified) plus the proven recorder root
  cause (expedition m=null) and the emission fix any future BUILD
  arm reuses.
- DOCUMENTED (future arms, not built here): (1) chorus-downbeat leak
  — 2 of 6 committed fights lost because the next round is a dance
  round, not a strike round; (2) contact-finish BUILD — now
  unblocked by the recorder fix, with two narration constraints
  (no-arrows bow ≠ finish instrument; drive-off line must name the
  held weapon) and the requirement to pre-register on the leg it
  will be judged against; (3) spike-vs-last-two separation —
  unmeasured, all 3 conversions pass under both definitions;
  (4) narration outside the fight log (contactrec sense-reads).
- NOT re-opened: the break line, the committed-finish NO-GO, any
  gate threshold, the HP-gate relaxation (still forbidden by the
  HOLD-collapse lesson).

scale-onramp stays converging (NOT converged): a real game change
landed this run, but no wave-5 or full-seat reachability shown.
food-economy untouched (sibling Loop B lane). Claim deleted; lock
deleted. Merged locally, pending ship.
