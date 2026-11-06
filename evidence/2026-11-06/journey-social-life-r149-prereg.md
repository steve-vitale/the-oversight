# Journey social life r149 — PRE-REGISTRATION (Lane B, 2026-11-06)

Leg 5 (social life). Rotation-b read 5 at run start (r147 endgame closeout
wrote 4→5; r148 endgame STOOD DOWN 2026-11-06 ~13:58 CST, lane blocked by
the r147 closeout in flight — no work, no evidence files, so this run
takes r149). This run writes 6 (crisis next) at closeout.
Run number: r149 follows r147 (endgame, merged c7bf1e308).
Base: master c7bf1e308 (r147 landed; bond-initiation 5ba7f167f in base;
drive build NOT on base — built+tested, unmerged, 64-seed run owed per
the 2026-11-06 alignment update; one-brain audit is context only).
Lock: playtest-loop-2.lock run_id 2026-11-06T21:01:54Z.
Worktree slug: journey2-social (branch journey2-social).

## Run incidents (stale-lock recovery, before this prereg)

This run opened on a stale lock (2026-11-06T17:55:29Z, the r147 run):
registry heartbeat frozen at 19:24:07Z (91 min stale at 20:55Z), so the
r147 coordinator was dead by the 15-min rule — BUT a landing check
(`node scripts/check.js --quick` in journey2-endgame, started 20:48Z)
was live in the tree, so this run waited instead of deleting another
run's lock mid-landing. At 21:00Z the check finished (283 passed, 7
failed — r147's landing gate), the registry read done-merged with a
fresh 20:59:07Z heartbeat, and the lock was gone (deleted by the r147
closeout itself). No lock was deleted by this run. Rotation-b re-read
5 after the closeout (it had read 4 before the closeout finished
writing 4→5). Lesson for the next worker: a stale heartbeat + a live
process in the tree means WAIT, not delete — the guard's "dead no
matter how fresh the lock is" covers a dead run, not a run whose
closeout is mid-flight in another session.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 42201–42204. Full-scope check:
- `grep -rln "42201|42202|42203|42204" evidence/ --include='*.md'`: ZERO
  hits (every dated prereg, screen, note).
- No file named with 42201–42204 (`find evidence -name '*4220[1-4]*'`).
- Standacc forbidden band is 99201–99208 — a different band. Previous
  social bands 41801–41804 (r141), 41901–41904 (r144), 42001–42004 (r145).
- COLLISION RECORDED: first choice 42101–42104 is TAKEN — named in
  evidence/2026-10-19/sim-snarecatch-b.md and in belongfeast/leadfeast
  JSON filenames s42101–s42104 (2026-10-19). Per the skill a named band
  is used even without a judged corpus; do not reuse 42101–42104.
  (Also named in evidence/2026-10-10/break-combat-r3.md.)
- Bare-substring greps over *.json were NOT re-run for 42201–42204:
  the 42101 check showed they flood output with 6-digit counters
  containing the band as a substring; the .md + filename scopes are
  the binding check (same scope r145 used, plus filenames).

## Three jobs this run (all pre-registered)

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics as
r125/r132/r136/r141/r144/r145 (M1–M7 below). Eighth datapoint on Q1
(villager-initiated bonds) — the FIRST with the bond-initiate build
live on master. Re-check of the M1 drought bound; M6 re-aligned (see
below); M7 dedupe fix re-check.

(B) Q1 WITH THE BUILD LIVE: bond_proposed telemetry is captured LIVE
in the driver (a Game.tele wrap installed before runDays, same
chaining pattern the harness uses for _liveDeaths — runDays wraps
tele and chains through _origTele, so the driver's wrap still fires).
Each record: { day, initiator, initiatorKind (scholar vs villager,
judged against Game.villagerId AT FIRE TIME — succession-proof),
target, kind ('person' bond / 'link' village-link raise), outcome,
chance }. The tele stream also carries day/part stamps, but the live
wrap is the exact initiator read. Cross-check: proposeBond decisions
go through npcInviteDecision kind 'bond', which the driver already
wraps (lureDecisions). NOTE from the code read: the bond module
records `bondState()[key] = { day, outcome, initiator, target }` and
on acceptance writes `bnd.proposer = initiator` onto the bond record
(bond-initiation.js) — so the r141/r144/r145 carry-forward ("bond
records need an initiator field") may already be RESOLVED by the
landed build; the analyzer's initiatorRecorded check (regex on the
bond sample) will confirm or deny it in the wild. No player-invoked
proposeBond caller exists in src/js (only villager-objectives daily
pair tick / visits + the daily bondtick) — every proposal in the sim
is autonomous; the scholar-vs-villager split is still reported so
Q1 is answered in the strongest sense (a non-player villager
proposing).

(C) GOAL-THREAD MENU DIAGNOSTIC — COMPLETE (code read done in this
prereg; panel verifies the wild surfacing). What the menu offers on a
goal thread (buildMenu, conversation.js, onThread path):
- 'more' (convoMoreLabel — varied continuer labels, NOT the literal
  "Tell me more." every time) while convoThreadHasMore: walks the
  goalFollow beats one per press, until honestly exhausted.
- ONE follow-up: '"Tell me more about what you want to do."'
  (TOPIC_FOLLOWUPS.goal — single item, used once per conversation).
- ONE random react: agree ('"You're right."') / joke ('"Ha —
  yeah."') / silence ('"..."') — pushReact picks one at random, so
  agree IS offered ~1/3 of goal-thread turns.
- leave / subject navigation.
What does NOT exist: a goal-specific agree/challenge/commit ON-thread.
offer_help is deliberately OFF-thread (!onThread, thread-coherence
design: discovery actions wait for the thread to resolve). deflect_q
exists ONLY for pendingQ (NPC asked the player a question).
VERDICT: NOT a wiring bug — the react path fires, the thread walks
its beats, the exhaustion admission exists. The r144/r145 "held for
design decision" stands: whether a leadership bid deserves an
on-thread agree/challenge/commit is a DESIGN call, not a fix. This
run's panel verifies in the wild: (i) the react surfaces on goal
threads (offered-id tally in the analyzer), (ii) how often the
driver/player presses 'more' repeatedly (the "Tell me more" ×6
pattern in r144/r145 is the 'more' label repeating while the NPC
beats differ — the label, not the content, is the visible drag).
No code change in this run unless the wild panel shows the react
never firing (wiring bug) — then fix + proof test.

(D) M4 SENSE READ: from the analyzer's M4 candidates, in-run.
Check generic-reply recurrence ('more'-press runs) in the new
panel's transcripts.

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run. CONVERSATIONS.md:
"Tell me more." goes deeper until honestly exhausted; "Replies belong
to the spoken exchange" (a question/invitation/price/live request
owns its menu — a goal statement is a topic, not a request, so the
generic thread menu is canon-consistent); "No repeats, ever"
(convoPick tracks said lines by TEXT). The dedupe work follows the
"No repeats, ever" rule. Data over code per repo AGENTS.md.

## Driver

scripts/journey-social-life-r149-20261106.js = r145 driver verbatim
EXCEPT: fresh seeds 42201–42204, OUTDIR evidence/2026-11-06,
filenames r149, PLUS:
(1) bond_proposed LIVE capture (Game.tele wrap, see job B);
(2) M6 second classification: each naming-beat line also records
atHavenGate via Game.playerAtHaven() (radius-1, the gate's
definition) alongside atHaven via scholarAtHaven() (on-tile, the
strict test); nightly aggregation adds burstAwayGate/settleAwayGate/
witnessAwayGate/taleAwayGate.
Analyzer: scripts/analyze-journey-social-r149-20261106.js = r145
analyzer verbatim except filenames, PLUS: bond_proposed panel
section (count by initiatorKind, kind, outcome; per-initiator
counts; link raises; cross-check vs lure kind 'bond'); M6 gate
counts + gate verdict; offered-id tally across transcripts (react
surfacing on goal threads).
Proof test scripts/test-journey-social-r149.js: bond_proposed
extraction/classification on fixture telemetry (scholar vs villager
initiator, person vs link kind, outcome split, per-initiator cap
count) + M6 gate classification on fixture newsLines (strict-away
vs gate-away diverge exactly on the radius-1 ring). RED-verified
against the unmodified counting logic, GREEN after.
Smoke first: SEED=42201 DAYS=5 into a scratch subdir, no
instrumentErrors, then the panel.

## Leg questions
1. Q1 (primary): do villagers EVER initiate a bond in wild social
   play — now WITH the build live? Baseline: 0 propose verbs across
   linkseek/standaccum/r103/r125/r132/r136/r141/r144/r145 (all
   pre-build). Eighth datapoint, first post-build.
2. Q2 (continuity): arming motive — every plot grievance-linked; d30
   drought bound (BROKEN once in r141 — a second break retires the
   bound as a claim, it does not re-open it); accomplices cold while
   leader hot?
3. Q3 (continuity): invite refusal — party/lure accept/decline, split
   by inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people? (M4
   judged from the analyzer's M4 section, in-run.) Does the
   goal-thread generic-reply pattern recur? Does the react surface?
5. Q5 (guardrail): survival — how many villages past d100? Short-panel
   sequence now 1/4, 1/4, 0/4, 1/4, 0/4, 0/4 — a standing survival
   fact, do not re-score it.
6. Q6 (gossip-position, re-aligned): 0 naming-beat lines emitted
   while the scholar is beyond radius-1 of Haven (gate definition),
   debates still kicking and settling. Strict on-tile counts reported
   alongside as the metric-review discrepancy, not a failure.
7. Q7 (dedupe): does the wild panel show any same-beat flag in a
   fixed pool (fix not holding), or in a pool left as legitimate
   variety?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 42201–42204, sequential.
- Smoke first: SEED=42201 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.

## Pre-registered verdicts (BINDING, §14)
- M1 arming motive GO: ≥1 plot arms grievance-linked
  (grievanceTargetToLeader > 0 at arming, or an accomplice motive
  with grievance) OR ≥1 grievance-holder later leads a plot. NO-GO
  if every plot arms with grievance links 0 and reasons
  ambition-only or empty. Drought read: any plot arming after d30
  breaks the d9–d19 drought bound again (r141 already broke it once —
  a second break RETIRES the bound as a claim, it does not re-open
  it); none after d30 is noted, not a re-confirmation.
- M2 villager-initiated bonds: COUNT question, no GO/NO-GO bar.
  Report bond_proposed events by initiatorKind (scholar/villager),
  kind (person/link), outcome (staged/accepted/refused/expired),
  per-initiator counts (amendment-5 cap: per-initiator ≤8/90d), and
  end bonds + whether the engine records a proposer (bond sample
  regex). ANSWERED if ≥1 villager-initiated person-bond proposal
  occurs in the wild panel; still open if 0 (eighth baseline
  datapoint, first post-build — a 0 now means the build does not
  fire in wild social play, not that the build does not exist).
- M3 invite refusal, wrapper only: REPORT party/lure
  accept/decline counts (split by inviter). No threshold.
- M4 sense GO: ≥1 full transcript read (friendship, talk request,
  or ambush-recall) passes the bar: NPC wants something real,
  options engage or deflect it, ending resolves/plants/owes.
  Otherwise NO-GO with the failing transcript quoted. Judged from
  the analyzer's M4 section this run. Also report: react offered on
  goal threads (yes/no + count) and longest 'more'-press run in any
  candidate.
- M5 census guardrail: ≥2/4 villages past d100, else all
  dark-channel verdicts are within-window only and must be
  reported that way. Seventh consecutive short panel expected —
  report the sequence, do not re-score it mid-run.
- M6 gossip-position GO (RE-ALIGNED — r145 metric review: "align
  them or pre-register which one judges"): 0 burst/settle/witness/
  tale lines emitted while the scholar is beyond radius-1 of Haven
  (gate-away counts, playerAtHaven definition) across the 4-seed
  panel, AND ≥1 debate kicks and settles somewhere in the panel
  (mechanics alive, not silenced). NO-GO if any gate-away line
  appears, or if no debate kicks at all (fix overshot into silence).
  Strict on-tile *Away counts are reported alongside as the known
  metric/gate definition discrepancy — they do NOT fail M6 this run.
- M7 dedupe fix holds: no same-beat flag in any fixed pool in the
  wild panel (analyzer M4 scan); a flag in a fixed pool reopens the
  fix. A flag in a pool left as legitimate variety is reported, not
  a failure.

## What would count as interesting
- ≥1 villager-initiated bond proposal (Q1 answered YES, post-build).
- A villager-initiated proposal ACCEPTED (bond formed by NPC action).
- A bond sample carrying proposer (initiator-field carry-forward CLOSED).
- A plot arming after d30 again (drought bound retired as a claim).
- A grievance-holder accomplice (cold-friends pattern broken).
- A second d100+ village (M5 threshold met), or a new death shape.
- A senseless transcript (M4 NO-GO with quote).
- The react never offered on goal threads in the wild (wiring bug —
  fixable, reopens job C as a build).
- M6 gate-away NO-GO (r141 fix fails under its own definition) or a
  stranded scholar who never hears a settled name on return (relay gap).
- A same-beat flag in a fixed pool (M7 — fix not holding).

## Telemetry
- Metrics: same l3.* keys as r125/r132/r136/r141/r144/r145 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel.
