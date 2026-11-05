# Journey social life r141 — PRE-REGISTRATION (Lane B, 2026-11-05)

Leg 5 (social life). Rotation-b read 5 at run start (r140 endgame jumped
the queue and wrote 4→5 at its closeout, 17:24Z); this run writes 6
(crisis next) at closeout. Run number: r141 follows r140 (endgame,
merged bf487b6b4; ship 1a898136c).
Base: master 1a898136c (post r140 fiDealt/'You take'/harry-when-stuck
fixes + batch ship 05d82de89-20261105-172446).
Lock: playtest-loop-2.lock run_id 2026-11-05T17:56:51Z.
Worktree slug: journey2-social (branch journey2-social).

## Two jobs this run (both pre-registered)

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics as
r125/r132/r136 (M1–M5 below). Fifth datapoint on Q1 (villager-initiated
bonds); the build-bond-initiate build is a SEPARATE lane's in-flight
work (uncommitted in its own worktree, unmerged) — this run measures,
does not build bonds.

(B) LAND THE GOSSIP-POSITION FIX: sim-gossipcensus-a (today, Lane A)
proved DIAG-GO that the haven-gossip burst reaches a stranded scholar
and reads wrong — 2/25 stranded sleep windows = 8.0%, same as the
1,670-window background rate; both hits quoted verbatim; fix direction
named (gate delivery on position, or re-voice as a dawn relay). This
run LANDS fix direction (a): the naming debate's narration waits until
the scholar is at the haven. No canon doc covers naming-gossip
delivery position (docs/CONVERSATIONS.md covers conversation UI/NPC
talk; docs/MONSTER-WAVES.md has no naming-delivery rule) — the fix
follows the census's named direction + Steve's perception law
(scholar knows only what they can sense) + "No silent actions" (the
news is queued and delivered on return, not dropped).

## Fix shape (pre-registered, before any judged sim)

New Game helpers in src/js/game.js (naming-beat neighborhood):
- `scholarAtHaven()`: true when the scholar is physically at the
  haven — `playerTile().type === 'haven' || isHaven`, or
  `this.location === 'haven'`; defensive try/catch, false on error.
  Same notion as havenStoresAccess (insideHaven + haven tile) and the
  census's stranded determination (not inside Haven at daily exit).
- `sayHavenNews(text, kind, mid)`: say now if at Haven; else queue
  `{text, kind, mid, day}` to `state.pendingHavenNews` (cap 20, drop
  oldest). No RNG consumed on either path.
- `flushHavenNews()`: called at the top of endDay; if at Haven,
  delivers queued lines, DROPPING word/debate lines for a beast that
  already has a villageName (its settle line, itself queued, covers
  the outcome). Returns count delivered.

Routed lines (say -> sayHavenNews, mechanics untouched):
1. monsterNewsCheck "Word gets around the haven..." (kind 'word')
2. seedMonsterNames "Back at the haven the argument starts..." ('debate')
3. monsterNamingCheck "It's settled..." ('settled')
4. endDay witness branch "came back from the treeline white-faced..."
   ('witness') — the knowers.push stays outside the gate
5. tellKillerTale fireside prose "The fire settles..." ('tale') — the
   tale log + report + knowers wiring stay outside the gate

NOT in scope (documented, separate mechanisms, own arms): the raid
call ("The village looks to you. Four ways to call..."), "You overhear
it at the fire" riders lines, pantry "full shelves" lines, and the
dayPart-3 "Night settles. The fire is the whole world now." ambient —
all position-blind in the same stranded windows (census backlog
items), but each is a different code path, not the naming machinery.

Mechanics invariant (asserted by proof): kick/proposals/majority/
knowers/tale-log run identically whether the scholar is away or at
Haven — only the delivery waits.

## Proof test (new, before/after)

scripts/test-gossip-position-r141.js — shared harness, emit captured:
1. STRANDED: scholar moved to a non-haven tile; reported monster with
   knowers >= need -> monsterNewsCheck emits 0 burst lines AND
   namingKicked true; seedMonsterNames emits 0 debate lines AND
   proposals seeded; monsterNamingCheck with a majority emits 0 settle
   lines AND villageName set.
2. RETURN: scholar back on the haven tile -> flushHavenNews delivers
   the queued settle line; the stale word/debate lines are NOT
   delivered (dropped, covered by the settle).
3. CONTROL: scholar at Haven -> word/debate said immediately, queue
   stays empty.
4. WITNESS: endDay loop (seeded RNG, reported-but-unkicked monster)
   with the scholar away -> knowers grows AND 0 witness lines in the
   captured stream.
5. TALE: queueKillerTale + killerTaleBeat with the scholar away -> 0
   tale prose lines AND e.reported true; after return + flush, the
   tale prose is delivered.
PASS bar: all 5 green. The test must FAIL on pre-fix master for (1)
(burst lines present while away) — verified by running it against a
git-stash of the fix or by asserting the old behavior first; record
which.

## Driver

scripts/journey-social-life-r141-20261105.js = r136 driver verbatim
EXCEPT: fresh seeds 41801–41804 (band verified fresh: no 4180x in any
prior prereg), OUTDIR evidence/2026-11-05, filenames r141, PLUS:
- initialBearer fix (r136 metric-review cosmetic defect): capture
  AFTER the ctxShared literal, not before it.
- determinism proof compares with `ms` stripped (r136 metric-review
  proposal: byte-compare minus the wall-clock field).
Analyzer: scripts/analyze-journey-social-r141-20261105.js = r136
analyzer verbatim except filenames.
Smoke first: SEED=41801 DAYS=5 into a scratch subdir, no
instrumentErrors, then the panel.

## Leg questions
1. Q1 (primary): do villagers EVER initiate a bond in wild social
   play — link/covenant/trade proposal, or party/outing/visit
   invitation extended by an NPC? Baseline: 0 propose verbs across
   linkseek/standaccum/deepening-r103/r125/r132/r136. Fifth datapoint.
2. Q2 (continuity): arming motive — every plot grievance-linked;
   d30 drought bound; accomplices cold while leader hot?
3. Q3 (continuity): invite refusal — party/lure accept/decline,
   split by inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people?
5. Q5 (guardrail): survival — how many villages past d100?
6. Q6 (NEW, this run): does the gossip-position fix hold in wild
   play — 0 burst/settle/witness lines in stranded sleep windows
   across the panel, with the debate still kicking and settling?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 41801–41804, sequential.
- Smoke first: SEED=41801 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.

## Pre-registered verdicts (BINDING, §14)
- M1 arming motive GO: ≥1 plot arms grievance-linked
  (grievanceTargetToLeader > 0 at arming, or an accomplice motive
  with grievance) OR ≥1 grievance-holder later leads a plot. NO-GO
  if every plot arms with grievance links 0 and reasons
  ambition-only or empty. Drought read: any plot arming after d30
  breaks the d9–d19 drought bound; none after d30 confirms it again.
- M2 villager-initiated bonds: COUNT question, no GO/NO-GO bar.
  Report propose* calls by initiator, lureDecisions by inviter
  (inviterWasBearer) per kind, and end bonds. ANSWERED if ≥1
  villager-initiated bond proposal occurs in the wild panel;
  still open if 0 (fifth baseline datapoint for the queued build).
- M3 invite refusal, wrapper only: REPORT party/lure
  accept/decline counts (split by inviter). No threshold.
- M4 sense GO: ≥1 full transcript read (friendship, talk request,
  or ambush-recall) passes the bar: NPC wants something real,
  options engage or deflect it, ending resolves/plants/owes.
  Otherwise NO-GO with the failing transcript quoted.
- M5 census guardrail: ≥2/4 villages past d100, else all
  dark-channel verdicts are within-window only and must be
  reported that way. Fourth consecutive short panel (1/4, 1/4,
  0/4, ?) — report the sequence, do not re-score it mid-run.
- M6 gossip-position GO: 0 burst/settle/witness/tale lines in any
  stranded sleep window across the 4-seed panel (same window
  classifier as gossipcensus-a), AND ≥1 debate kicks and settles
  somewhere in the panel (mechanics alive, not silenced). NO-GO
  if any stranded-window burst line appears, or if no debate kicks
  at all (fix overshot into silence).

## What would count as interesting
- ≥1 villager-initiated bond proposal (Q1 answered YES).
- A plot arming after d30 (drought broken).
- A grievance-holder accomplice (cold-friends pattern broken).
- A second d100+ village (M5 threshold met), or a new death shape.
- A senseless transcript (M4 NO-GO with quote).
- M6 NO-GO (fix fails in the wild) or a stranded scholar who never
  hears a settled name on return (relay gap).

## Out of scope this run (held, not killed)
- No bonds BUILD (separate lane's queued build).
- No gating/threshold retunes (frozen, Steve-call).
- No survival bisect (separate larger job).
- No live-build screenshot pass: this run changes narration text
  delivery, not UI or dialogue text; transcripts re-read the
  r125/r132/r136 way. (The fix's own proof is node-harness.)
- No raid-call / fire-overhear / pantry-line position fixes
  (separate mechanisms; see "NOT in scope" above).

## Telemetry
- Metrics: same l3.* keys as r125/r132/r136 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel.

## INSTRUMENT CORRECTION (pre-judgment of M6, before any verdict is read)

The first full panel (seeds 41801–41804, driver as pre-registered
above) ran clean and its trajectories are the record — but it cannot
judge M6: the driver records no per-night position, so there is no
stranded-window data in its JSONs (the captured stream is not
persisted, only ambush-filtered lines). CORRECTION (read-only, no Game
call changes, no RNG): the driver gains a nightlyNews census — per
day, the count of burst/settle/witness/tale lines in that day's emit
slice plus stranded-at-daily-exit (scholarAtHaven), classified with
the gossipcensus-a classifiers — and a namingEnd census (reported /
namingKicked / villageName / queued per monster). The analyzer gains
an M6 section. The first panel's JSONs are KEPT as the trajectory
record (not verdict inputs for M6) and the panel is RE-RUN with the
corrected driver; the determinism proof (field-level walk, `ms` +
the two new M6 fields stripped) must show identical trajectories
before the re-run is judged. M6's window notion is a per-day slice
with stranded-at-daily-exit, not the census's sleep window — the fix
gates delivery on position entirely, so ANY naming-beat line on a
stranded day is the defect; the approximation is named here, not
hidden. Metrics M1–M6 are unchanged — only the instrument that reads
M6.
