# sim-scale-onramp-round-0915-a — coordinator evidence (Loop A, axis scale-onramp)

Run: loop A fleshout-20261031T0915Z, axis scale-onramp (converging, NOT converged).
Lock created 2026-10-31T09:17:02Z. Claim: hidden_files/lever-claims/fleshout-20261031T0915Z.json
(arms: sim-heraldcontact-a, sim-pocketdesign-a, sim-spearxbow-a).
Rotation left at 3 (convergence work does not cycle it).
Loop B live on food-economy for the whole run (claim fleshout-loop-b-20261031T0841Z:
morningcarry / axefirst / warmthfuel, NOT touched). Journey and other lanes
landed on master during this run (warmthfuel, axefirst, journey-establishment);
zero file overlap with any arm; worker branches rebased clean in their own
worktrees, proofs re-run after every rebase and before merging.
Zero src/js, zero policy-default flips in this run. No [needs-eyes]
(all three arms measurement-only, nothing player-facing ships).

## Pre-registered method (this run's header)

- Primary question: does the scale wall move on measured evidence — national /
  table / wins, wave 4–5 unlocks, median survival — on the scale-onramp axis?
- Arms: 3 DIAG arms, each with its own prereg written before judged sims.
  Pilot 8 seeds/fixtures before confirm spend (all arms); death-aware horizons
  for the sim arms, forced-meeting fixture bands where a long sim would diverge
  and empty the sample (spearxbow). Judge each arm against its own prereg only.
  No metric re-scoring mid-run (§14); every arm evidence file carries a
  "metric review" section.
- Panel (§15): NOT APPLICABLE to any arm — all three are single-base DIAG
  measurements with no before/after comparison; none fabricated (same
  declaration as mustercall-b/2, herald-b, pocketcall-a). A later lever arm
  reusing a corpus as its baseline runs the panel then.

## Arm 1 — sim-heraldcontact-a: INSUFFICIENT-DATA (merged d046c7fab, proof 28/28)

Second-cluster Herald-contact hunt, longevity-screened, on a fresh pool
(87101–87140, freshness verified). Pilot gate tightened per the 0726Z metric
review: the gate requires a Herald CONTACT signal (>= 1 pilot seed), not omen
stage alone.

- Pilot: 8/8 seeds ran, instrument fired on all 8, instrumentErrors 0.
- Herald CONTACT on pilot seeds: 0/8 — 0 scholar attempts, 0 field fights,
  0 muster snapshots, 0 muster verbs. 3/8 pilots ended at omen stage 2, which
  under mustercall2-a's omen-accepting gate would have passed the pilot and
  spent a confirm on a contactless band; the tightening saved that spend.
- The run therefore STOPPED at pilot exactly as the prereg orders: no confirm
  seeds were run, no band-shopping to chase a contact. The 11 selected confirm
  seeds were never censused and are named in the arm evidence only as the
  un-run selection, not as data.
- Screen: 40-seed pool, 21/40 excluded for winning on/before day 120 (13 of
  them exactly day 90). Prereg deviation, recorded not hidden: the pool yielded
  only 19 selectable seeds, so a confirm would have been 11, not the prereg's
  12 — moot for this verdict (the pilot gate stopped the run first), but a
  future arm reusing this selection rule must screen a larger pool or
  pre-register "confirm = all remaining selected seeds".
- Wall (pilot, 8 seeds): national 8/8, table 2/8, won 2/8 (days 121 and 146),
  wave 4 4/8, wave 5 0/8, median survival 184d, max 201d (4 pilots to the 200d
  cap un-won). The arm's plain-words read: the scale wall here does not look
  like starvation — villages climb to national, win lesser or endure, and the
  Herald chapter stays unopened. Forcing the Herald window open (longevity
  screen removing the day-90-win excuse) still produces no Herald meeting.
- Verdict: mustercall-b's "offered and reachable" headline REMAINS a
  single-seed (85106) census — neither generalized, bounded, nor contradicted
  by this third band. Completeness 0/0 (undefined, not 100%).
- Evidence: evidence/2026-10-31/sim-heraldcontact-a.md + prereg
  sim-heraldcontact-a-prereg.md. Corpus:
  evidence/2026-10-31/perseed-heraldcontact/ (pilot leadfeast s87104, s87109,
  s87115, s87119, s87120, s87127, s87137, s87140 + screen-87101-87140.json).
  Proof scripts/test-heraldcontact-20261031.js 28/28 on the branch AND on the
  rebased branch AND on merged master content (coordinator re-runs).

## Arm 2 — sim-pocketdesign-a: DIAG-GO on all four inputs (merged 6856df77f, proof 43/43)

Pocket-call design-inputs census on the delegating-player band (S-PATROL).
The four inputs pocketcall-a left unmeasured are now measured:

1. PATROL BAND — GO. Screen bar (>= 8 resolvePatrol calls on >= 2 seeds) met
   on S-PATROL: 141 calls on 6/8 screening seeds. Confirm band (16 seeds):
   374 patrol calls on 14/16 seeds. Patrol silence was a band/policy
   artifact, not a rule: patrols fire once someone actually assigns them.
   257 of 258 patrols that went out met a monster (exactly one uneventful
   patrol band-wide); patrols fight small beasts (165 wave-1, 37 wave-2,
   54 wave-3, a single wave-4 meeting, a melee patroller fleeing a Suburb).
2. SAT-OUT GATE ATTRIBUTION — GO. 211/211 sat-outs attributed (100% >= 80%),
   zero 'other', zero integrity flags. Gate table: heal 206 (97.6%), sick 5
   (2.4%), range 0. Range is STRUCTURALLY zero, not missing data:
   startExpedition only ever invokes wanderers/explorers, so a homebody never
   reaches the range gate, and resolvePatrol has no range gate at all.
   Sat-out rate 211/559 = 37.7% of pocket-site departure calls (pocketcall
   supply band: 95/203 = 46.8% — different policy band, labeled, never
   claimed as a lever effect; no panel was run).
3. TOP-UP MOMENT — GO. Timeline completeness 7/7. Dry-at-meeting classes:
   never-pocketed-in-outing 5, pocket-failed 1, spent-in-outing 0,
   timeline-other 0. The Jovan spent-in-outing pattern from the supply band
   does NOT reproduce on this band (0 cases) — a future top-up design must
   still cover it (proven on the other band), but the priced moments here are
   different: (a) FIRST-CALL moment, dominant (5/6 dry never pocketed in any
   outing; four never departed at all) — a departure-only top-up cannot help
   them at all, they need a first call; (b) POCKET-FAILED moment (1/6):
   a bow fighter went on expedition day 127 and the pocket call added 0
   arrows because the pile held FIBER 0 for days 120–130 while holding sticks
   7 and stone 2,002 — the bow chain breaks on fiber, not sticks. He fought
   dry day 131 and died. The working chain is also priced step by step (the
   ARMED fight: stones pocketed, spent across low-wave volleys, topped up at
   departure, fired into a wave-4 Suburb 4 days into the outing — departure
   top-up WORKED there because the meeting came early in the outing and
   stones come straight from the pile reservoir).
4. CROSS-NODE SHOUT INPUTS — GO. Shout-row completeness 7/7. The 6-fighter
   call-design population: node delta d0:1, d1:3, d2:2; channels C1:1, C2:0,
   C3:1, C4:0, union 2, unreachable 4. A 1-node shout reaches 4/6 dry
   fighters, a 2-node shout all 6 — but 2/6 were ALREADY reachable (one on
   the same node as the leader, one marching in the crew) and still fought
   dry. Reachability is not the missing piece; a TRIGGER is. The call must
   fire on something — a departure, a sighting, a muster — not merely be
   reachable. (C2 same-grid fires 0 times on two consecutive bands — grid
   positions are null even for the on-node fighter; see the arm's metric
   review: C2 may be unpopulated, not out of range.)
- Instrument note: the v1 screen exposed two instrument gaps (callerOf
  misread, fought-by-wave missing for low-wave patrol fights); both were fixed
  in v2 BEFORE confirm judgments, and the screen seeds re-run with v2
  reproduced every v1 seed line EXACTLY, proving v2 trajectory-neutral. All
  judged numbers come from v2.
- Wall (confirm band, honest, same caveats as pocketcall): national 9/16,
  table 14/16, wins 10/16, wave 4 unlocked 14/16, wave 5 unlocked 2/16, median
  survival 90d, max 201d. Table/win flags are the policy stack's substrate
  flags, not ordinary-play claims, and the cross-band difference vs
  pocketcall's supply band (national 12/16, table 11/16, wins 11/16, wave 4
  10/16, wave 5 0/16, median 95d, max 202d) is labeled, never an effect claim
  — whether the delegate layer moves any wall number is a future panel arm's
  question, not this census's finding. Arc II/III/IV reach, four-realm
  formation, trap acquisition by source, counter discovery/kill rates, and
  young-link succession survival are NOT instrumented in this substrate and
  are NOT reported.
- Sense test: five transcripts read as scenes; see the arm evidence for the
  scenes (including a feverish patroller walking out unscreened, and a dying
  village refusing its leader).
- Evidence: evidence/2026-10-31/sim-pocketdesign-a.md + prereg
  sim-pocketdesign-a-prereg.md (plus v2 addendum before confirm judgments).
  Corpus: evidence/2026-10-31/perseed-pocketdesign-a/. Proof
  scripts/test-pocketdesign-20261031.js 43/43 on the branch AND on the
  rebased branch (coordinator re-runs).

## Arm 3 — sim-spearxbow-a: SPEAR GO + XBOW GO (merged 7bc426f6e, proof 27/27)

The unrun SPEAR slot proof + XBOW top confirm variants from the partyvolley
ranking, on a divergence-proof forced-meeting fixture band through the real
Game.fieldFight (176 fights: 20 pilot + 156 confirm). No game code changed.

- Pilot gate: PASS (from-start join 20/20, XBOW volley 4/4, SPEAR
  equippedRanged == hunting_spear 4/4), so the confirm ran. Pilot numbers are
  reported separately and never pooled into the confirm.
- SPEAR slot proof: GO. S1 equippedRanged == hunting_spear on 36/36 confirm
  SPEAR fights (100% >= 90%). S2 volley shots null/0 on 36/36 (100% >= 90%),
  despite a crude bow and 8 arrows in the same inventory. Backlog #1370 is
  now PROVEN in-fixture, not assumed: the spear takes the ranged slot
  (range 2 > 1 under equipment.js isRangedWeapon) and the bow never fires,
  because the volley requires a ranged weapon WITH an ammo field and the
  spear has none. The spear displaces ONLY the bow — melee stays machete,
  torso stays hide_armor on all 36.
- XBOW top confirm: GO. X1 XBOW median volley damage ranks #1 among the four
  tiers on the pooled 3-beast band AND on every beast individually. X2 XBOW
  median total damage >= BOW median total pooled (118 vs 93) AND on every
  beast. The volleyfix lone-fighter ranking (XBOW > SLING > BOW) survives the
  move to party scale with one reorder: at P2+hide it is XBOW > BOW > SLING >
  SPEAR on volley. Pooled medians (36 fights per tier): XBOW volley 42 /
  total 118, BOW 28.5 / 93, SPEAR 0 / 82, SLING 20.5 / 76. Against the #1369
  yardstick 57.25 sustained DPR: only XBOW (62.25) clears it; BOW (52.5)
  sits ~8% short, SPEAR/SLING (~42–43) well short — directional, not a
  live-sortie verdict (fixture forced meetings, same-instrument caveat as
  partyvolley-b).
- Engine cap re-observed, not circumvented: from-start join 176/176, shout
  join 0/176 — no fixture here pretends a shouted ally arrives. All 176
  fights ended vFlee; kills/drive-offs 0/176.
- Coordinator catch (this run's loudest process finding): the arm's proof
  did NOT reproduce green on first coordinator re-run — 25/27, with both
  determinism-gate checks failing (fresh reruns byte-identical to each other
  but different from the committed corpus), while all 25 other checks passed
  including verdict-fields-match-recomputation. The arm was NOT merged in
  that state. A narrow fix-up worker root-caused it: the corpus was anchored
  on HEAD, and HEAD moved when the corpus itself was committed
  (self-referential anchor). Fix: anchor the corpus on the last src/ commit,
  not HEAD; regenerated corpus differs ONLY in anchorCommit; verdicts
  unchanged. Proof re-run by the coordinator on the fixed HEAD: 27/27 GREEN,
  and again 27/27 on the rebased branch before merging. The gate was never
  weakened. Lesson for future arms: never anchor a corpus on HEAD when the
  corpus itself is about to be committed.
- Evidence: evidence/2026-10-31/sim-spearxbow-a.md + prereg
  sim-spearxbow-a-prereg.md. Corpus:
  evidence/2026-10-31/perseed-spearxbow-a/fixture-band.json. Proof
  scripts/test-spearxbow-20261031.js 27/27 (branch, fixed HEAD, rebased
  branch — coordinator re-runs).

## Wall (this run's judged corpora)

- Heraldcontact pilot: national 8/8, table 2/8, wins 2/8, wave 4 4/8,
  wave 5 0/8, median survival 184d, max 201d.
- Pocketdesign confirm band (delegating-player substrate, caveated above):
  national 9/16, table 14/16, wins 10/16, wave 4 unlocked 14/16, wave 5
  unlocked 2/16, median 90d, max 201d. The wave-5 unlock flags on this band
  are substrate flags, not ordinary-play claims, and no wave-5 monster was
  met in any live judged corpus this run.
- Spearxbow fixtures: no live wall numbers (forced meetings, not sorties).
- Overall wall UNCHANGED: full seat 0, wave 5 reached 0 in live play stands.
  What moved is the diagnosis around it: the Herald road is contact-starved
  on a third band even after longevity screening; the pocket-call design now
  has all four measured inputs (patrol band, gate attribution, priced
  top-up/first-call moments, shout inputs); and the weapon-slot ranking is
  proven in-fixture with XBOW alone clearing the sustained-damage yardstick.

## Village assessment, in plain words

The villages in this run climb. On the longevity-screened band, every pilot
village reached national standing, most survived past day 120, and two won —
but the win came through the lesser seat, and the Herald — the towering
figure whose call should open the titan road — never once showed up to any
of them, even when villages lasted 200 days. The road to the bigger story
isn't blocked by hunger here; it's blocked by absence. The Herald chapter
simply never opens.

On the patrol band, villages do send people out on patrol, and those patrols
almost always meet something — the perimeter is never empty. But the people
who sit out sit out for one reason above all: they're hurt and there's no
healer. The same hurt people get asked again and again and sit out again
and again. And the fighters who go into a big fight with an empty bow fall
into two groups: most were never called at all (no one told them to pack),
and one packed nothing because the village pile had run out of fiber — the
stringy plant stuff arrows need — while sitting on a mountain of stone.
Even when a fighter stands right next to the leader, or marches in the same
crew, and still fights dry, the missing piece isn't reach — it's a trigger:
nobody fires the call at the right moment.

In the weapon fixtures, the spear turns out to be a trap in plain sight: a
fighter carrying a spear and a bow will never loose an arrow, because the
spear claims the ranged slot and has no ammunition of its own. The crossbow
is the only weapon that clears the damage bar the party-volley yardstick
sets. None of this changes what a player sees yet — these are measurements,
not game changes — but the next design (a call with a trigger, a fiber
supply, a spear warning) now has numbers instead of guesses.

## Blanks filled or documented

Filled (measured, landed as evidence + instruments, no game defaults flipped):
- The pocket-call design inputs, all four (patrol band, sat-out attribution,
  top-up/first-call moments, shout inputs) — pocketdesign-a.
- The SPEAR slot proof + XBOW top confirm — spearxbow-a (backlog #1370 proven).
- The contact-gated second-cluster hunt design itself: the pilot gate
  tightening (contact, not omen stage) saved a confirm spend on a contactless
  band — heraldcontact-a.

Documented (evidence, no build yet):
- Herald placement vs wandering; wave unlock decoupled from scale;
  late wave-4 + fast lesser win; day-90 win cluster (confirmed on a fresh
  pool); patrol-silent seeds; patrols don't screen sickness; fiber drought
  breaks bows; repeat sat-out concentration; uneventful patrols ~0 — all
  appended to hidden_files/sim-findings.md by the coordinator, with prior
  items #1370, #1593, #1611–#1616 annotated with this run's measurements.
- Still open, in order: (1) a Herald position instrument (where the lair sits
  relative to villager paths; does the placed Herald move toward inhabited
  tiles?) — measurement before any routing build; (2) the pocket-call design
  itself (trigger-first, not reach-first; fiber-priced supply) — design
  decision first, then build; (3) the #1538 ruling still pending before any
  muster-routing build; (4) wave-unlock gating on the win-pursuit stack
  (national-without-wave-4 as road or stall).

## Metric review

- Heraldcontact: the prereg's confirm size (12, or 16 if tier A alone supplied
  >= 24) could not have been met from the 40-seed pool (only 19 selectable);
  moot here (pilot gate stopped the run), but the next arm reusing this
  selection rule must pre-register "confirm = all remaining selected seeds"
  or screen a larger pool. The contact-gated pilot rule itself is validated
  by this run (it saved a confirm spend) and should stay.
- Pocketdesign: C2 (same-grid <= 1) fires 0 times on two consecutive bands —
  the arm flags C2 may be unpopulated, not out of range; a future shout
  design must not quote C2 coverage until the channel is populated or the
  instrument is fixed. Sat-out rate cross-band comparisons (37.7% vs 46.8%)
  are labeled band differences, never lever effects (no panel run).
- Spearxbow: fixture yardstick comparisons are directional, not live-sortie
  verdicts (stated in the arm evidence and repeated here). Corpus anchoring
  rule for future arms: anchor on the last src/ commit, never on HEAD when
  the corpus itself is being committed.
- No metric was re-scored mid-run. No pre-registered threshold was changed
  after judged sims began.

## Telemetry deviation check

Run on both per-seed corpora against
hidden_files/telemetry-baselines/scale-wall.json (metrics
national,table,wins,exiled): REFUSED by the tool itself on both corpora —
recorder rows carry top-level anchorCommit, so they are sweep recorder rows,
not runs ("Recorder corpora are compared with sweep-compare tables, never
against a run baseline here"). Same class as the 0342Z and 0726Z runs. No
comparison performed, no LOUD lines, baseline NOT rolled. The spearxbow
fixture corpus is not per-seed runs; telemetry is NOT APPLICABLE there and
none was fabricated.

## Infrastructure

- Worktree registration slow throughout (~3–11 min per tree, same class as
  prior runs) with heavy sibling churn (Loop B food-economy arms, journey
  lanes registering/reaping concurrently); registry-lock contention made one
  heartbeat round take ~14 min. All heartbeats verified landed by readback.
- EPERM flap on .git ref writes ACTIVE at run start: the first coord
  registration failed ("couldn't write .git/refs/heads/coord-0915-a.lock");
  NO ref surgery forced. Later registrations succeeded as the flap eased.
  One spearxbow registration attempt failed on checkout ("Could not reset
  index file to revision 'HEAD'"); the retry succeeded.
- Safe-commit index clobber was NOT hit on this run's coordinator path
  (worker commits verified correct via log + status; no repairs needed).
- Coordinator proof discipline caught a real defect: spearxbow merged only
  after the fix-up worker's 27/27 re-proof, not on the worker's first claim.
- The 0726Z coordinator evidence landed on master as 003a9c2f3 during this
  run by another lane (observed on master, not this run's work); this run
  did not re-land it, and its pending file is that lane's to retire.
- check.js --quick NOT re-run (zero src/js, zero policy-default flips; arm
  proofs green on merged master content — same disclosure class as
  0643Z/0342Z/0726Z/0741Z).
- Worktrees released as merged, branches deleted: sim-heraldcontact-a,
  sim-pocketdesign-a, sim-spearxbow-a. Claim retired to .DEAD; lock deleted.
  Evidence: worker evidence sim-heraldcontact-a.md, sim-pocketdesign-a.md,
  sim-spearxbow-a.md (on master); coordinator evidence: this file.
  Merged locally, pending ship.

scale-onramp stays converging (NOT converged): the muster-call headline is
still a single-seed census (now on three bands of contactlessness), the
pocket-call design inputs are measured but no call design is built, the
weapon ranking is proven in-fixture but no gear/supply change is landed,
and wave 5 reached 0 / full seat 0 stands in live play. food-economy stays
converging (untouched; sibling Loop B lane).
