# Journey social life r145 — PRE-REGISTRATION (Lane B, 2026-11-06)

Leg 5 (social life). Rotation-b read 5 at run start (r144 endgame closeout
wrote 4→5; the r144 social run's 5→6 write was overwritten by the intervening
crisis/succession cycle — the file reads 5, so leg 5 is due); this run writes
6 (crisis next) at closeout.
Run number: r145 follows r144 (social, merged 2026-11-06 ~02:40Z).
Base: master cc4345e1e (post r144 endgame closeout; includes smallfixes
pocket_sand flee-order + raid-cooldown).
Lock: playtest-loop-2.lock run_id 2026-11-06T10:59:55Z.
Worktree slug: journey2-social (branch journey2-social).

## Run incidents (stale-lock recovery, before this prereg)

This run opened on a stale lock (2026-11-06T08:55:38Z, the timed-out r144
endgame run): heartbeat frozen at 09:51:59Z (64 min stale), zero
journey2-endgame worker processes, main session had already verified the
run dead and written the r144 note. Per the overlap guard the lock was
deleted (stale-lock recovery) and this run's lock created. The r144
evidence was uncommitted in the journey2-endgame tree: committed here as
e4cfecde5 (32 files) + index-clobber repair, then the main session's own
worker rebased the branch (a concurrent rebase by the main session was
found running at 11:04Z — this run killed ITS OWN rebase to avoid the
race, removed its stale index.lock, and deferred the landing to the main
session, which merged r144 as 4b4754173 + note completion cc4345e1e).
Rotation-b was bumped 4→5 as the r144 closeout intended; the main session
recorded the lock-delete + rotation steps as moot/superseded by this run.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 42001–42004. Full-scope check:
- `grep -r "42001|42002|42003|42004" evidence/ --include='*.md'`: ZERO hits
  (every dated prereg, screen, note).
- No file named with 42001–42004 (`find evidence -name '*4200[1-4]*'`).
- Seed-context patterns in .md (`seed...4200[1-4]`, `SEEDS?=...4200[1-4]`):
  ZERO hits.
- Bare-substring grep over ALL evidence files DOES hit — adjudicated as
  false positives: the matches are 6-digit counters containing 4200x as a
  substring (sample: `"?" : 142001` in evidence/2026-10-13/r6-baseline.json),
  never a seed assignment. Recorded so the next worker does not re-litigate.
- Standacc forbidden band is 99201–99208 — a different band. Previous
  social bands 41801–41804 (r141), 41901–41904 (r144).

## Three jobs this run (all pre-registered)

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics as
r125/r132/r136/r141/r144 (M1–M6 below). Seventh datapoint on Q1
(villager-initiated bonds); re-check of the M1 drought bound; the
bond-initiate build is a SEPARATE lane's in-flight work — this run
measures, does not build bonds. Checked this run: no bond-initiate
commit on master since 2026-11-05 (proposeLink/proposeCovenant/
proposeTrade exist in hierarchy.js as player-invoked verbs only).

(B) M4 ANALYZER LINE (carried from r144): the analyzer prints the best
candidate full transcript per seed plus a near-duplicate flag scan, so M4
is judged in-run.

(C) FULL-POOL CONVO DEDUPE SCAN + FIX: r144 fixed two same-beat defects
in goalFollow only. This run scans EVERY convo pool in
src/data/characterGen.json (89 pools, 968 lines — scan script
scripts/scan-convo-dupes-r145-20261106.js). Findings: 1 exact-dupe
(adjudicated NOT a defect — the label "Yes." offered by two DIFFERENT
questions, q_trust and q_left_behind; same word, different menus, never
co-present) and 42 first-3-word collision groups. Of those, 13 are true
same-beat pairs (different strings, one beat) and are fixed data-only
(one line rewritten to a distinct beat on the same theme):
goalFollow.prove "back home i", goalFollow.escape "theres a way",
goalFollow.survive "i do what", goalFollow.survive "one more day",
pastFollow "i kept a" (journal pair), plansFollow "i want to" build pair,
plansFollow "i want to" go-further pair, plansFollow "im going to"
learn-names pair, exits.warm "take care of", exits.bold "good talk now",
exits.steady "alright back to", exits.grieving "sorry i need",
openers "do you ever" (being-watched pair). The other 29 groups are
same-opening / different-beat (legitimate variety) and are left alone —
listed in the scan output. Proof test
scripts/test-convo-dedupe-r145.js: (1) no exact-duplicate line inside any
NPC-spoken pool (answer labels excluded — see the "Yes." adjudication);
(2) at most one line per fixed (pool, first-3-words) key, including the
r144 goalFollow regression (no lead "someone asked me" pair). RED verified
pre-fix (against HEAD's characterGen.json), GREEN post-fix. The wild
panel's M4 near-duplicate flags are the in-the-wild observation.

DIAGNOSTIC (not a build unless a wiring bug is found): the goal-thread
reply menu offers only generic continuations ("Tell me more" / "Go on" /
"I'm listening") — the player cannot agree, deflect, or challenge a
leadership bid, and trust sits 55→55 in the r144 candidate. This run
reads the menu code once: if authored agree/deflect/challenge replies
exist but never fire (wiring bug), fix it; if the content genuinely does
not exist, document it again as held (needs a design decision, not a
data edit) with the r145 panel's evidence.

NOT in scope (documented, held): no bonds BUILD; no gating/threshold
retunes (frozen, Steve-call); no survival bisect; no live-build
screenshot pass (data-only change; transcripts re-read the
r125/r132/r136/r141/r144 way).

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run. The fix follows the
"No repeats, ever" rule (convoPick tracks said lines by TEXT) — the defect
is that two different texts carry the same beat, so the ledger is blind to
it. Data over code per repo AGENTS.md.

## Driver

scripts/journey-social-life-r145-20261106.js = r144 driver verbatim EXCEPT:
fresh seeds 42001–42004, OUTDIR evidence/2026-11-06, filenames r145.
Analyzer: scripts/analyze-journey-social-r145-20261106.js = r144 analyzer
verbatim except filenames (M4 section kept).
Smoke first: SEED=42001 DAYS=5 into a scratch subdir, no instrumentErrors,
then the panel.

## Leg questions
1. Q1 (primary): do villagers EVER initiate a bond in wild social play?
   Baseline: 0 propose verbs across linkseek/standaccum/r103/r125/r132/
   r136/r141/r144. Seventh datapoint.
2. Q2 (continuity): arming motive — every plot grievance-linked; d30
   drought bound (BROKEN once in r141 — re-check, do not re-score);
   accomplices cold while leader hot?
3. Q3 (continuity): invite refusal — party/lure accept/decline, split by
   inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people? (M4 judged
   from the analyzer's M4 section, in-run.) Does the goal-thread
   generic-reply pattern recur?
5. Q5 (guardrail): survival — how many villages past d100? Short-panel
   sequence now 1/4, 1/4, 0/4, 1/4, 0/4 — a standing survival fact, do
   not re-score it.
6. Q6 (gossip-position, r141 fix re-verify): 0 burst/settle/witness lines
   in stranded sleep windows across the panel, debates still kicking and
   settling (emit-time classification, correction 3 instrument).
7. Q7 (job C): does the wild panel show any same-beat flag in a fixed
   pool (fix not holding), or in a pool left as legitimate variety?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 42001–42004, sequential.
- Smoke first: SEED=42001 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.

## Pre-registered verdicts (BINDING, §14)
- M1 arming motive GO: ≥1 plot arms grievance-linked
  (grievanceTargetToLeader > 0 at arming, or an accomplice motive
  with grievance) OR ≥1 grievance-holder later leads a plot. NO-GO
  if every plot arms with grievance links 0 and reasons
  ambition-only or empty. Drought read: any plot arming after d30
  breaks the d9–d19 drought bound again (r141 already broke it once —
  a second break retires the bound as a claim, it does not re-open it);
  none after d30 is noted, not a re-confirmation.
- M2 villager-initiated bonds: COUNT question, no GO/NO-GO bar.
  Report propose* calls by initiator, lureDecisions by inviter
  (inviterWasBearer) per kind, and end bonds. ANSWERED if ≥1
  villager-initiated bond proposal occurs in the wild panel;
  still open if 0 (seventh baseline datapoint for the queued build).
  Bond records still carry no initiator field (r141 metric review) —
  the bond-initiate build's panel needs it; this run does not add it
  (separate lane's work).
- M3 invite refusal, wrapper only: REPORT party/lure
  accept/decline counts (split by inviter). No threshold.
- M4 sense GO: ≥1 full transcript read (friendship, talk request,
  or ambush-recall) passes the bar: NPC wants something real,
  options engage or deflect it, ending resolves/plants/owes.
  Otherwise NO-GO with the failing transcript quoted. Judged from
  the analyzer's M4 section this run.
- M5 census guardrail: ≥2/4 villages past d100, else all
  dark-channel verdicts are within-window only and must be
  reported that way. Sixth consecutive short panel expected —
  report the sequence, do not re-score it mid-run.
- M6 gossip-position GO: 0 burst/settle/witness/tale lines emitted
  while away (emit-time *Away counts) across the 4-seed panel, AND
  ≥1 debate kicks and settles somewhere in the panel (mechanics
  alive, not silenced). NO-GO if any *Away line appears, or if no
  debate kicks at all (fix overshot into silence).
- M7 dedupe fix holds: no same-beat flag in any fixed pool in the
  wild panel (analyzer M4 scan); a flag in a fixed pool reopens the
  fix. A flag in a pool left as legitimate variety is reported, not
  a failure.

## What would count as interesting
- ≥1 villager-initiated bond proposal (Q1 answered YES).
- A plot arming after d30 again (drought bound retired as a claim).
- A grievance-holder accomplice (cold-friends pattern broken).
- A second d100+ village (M5 threshold met), or a new death shape.
- A senseless transcript (M4 NO-GO with quote).
- M6 NO-GO (r141 fix fails in the wild) or a stranded scholar who
  never hears a settled name on return (relay gap).
- A same-beat flag in a fixed pool (M7 — fix not holding).
- The goal-thread reply menu: a wiring bug found (fixable) vs the
  generic-only pattern recurring in r145 transcripts (held, again).

## Telemetry
- Metrics: same l3.* keys as r125/r132/r136/r141/r144 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel.
