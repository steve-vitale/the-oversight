# Journey social life r144 — PRE-REGISTRATION (Lane B, 2026-11-05)

Leg 5 (social life). Rotation-b read 5 at run start (r143 endgame closeout
wrote 4→5; r141's 5→6 write was overwritten by r143's closeout — the file
reads 5, so leg 5 is due); this run writes 6 (crisis next) at closeout.
Run number: r144 follows r143 (endgame, merged a7dfc4a45).
Base: master a7dfc4a45 (post r143 Fixes B/C + gorge fix).
Lock: playtest-loop-2.lock run_id 2026-11-06T00:55:52Z.
Worktree slug: journey2-social (branch journey2-social).
Registration was slow (~17 min, load 21, git reset --hard starved) — not a
flap; files wrote fine, tree reached 7.7G before completing.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 41901–41904. Searched all of evidence/ for "41901|41902|41903|
41904" (every dated prereg, screens, extension bands): ZERO hits. The
standacc forbidden band named in 2026-11-04 preregs is 99201–99208 — a
different band. 41801–41804 (r141) is the previous social band; 4190x is
unused. Search scope: `grep -r "41901|41902|41903|41904" evidence/`
plus the standacc forbidden-list check above.

## Three jobs this run (all pre-registered)

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics as
r125/r132/r136/r141 (M1–M6 below). Sixth datapoint on Q1
(villager-initiated bonds); re-check of the M1 drought bound, which r141
BROKE (2 plots armed after d30); the bond-initiate build is a SEPARATE
lane's in-flight work — this run measures, does not build bonds.

(B) M4 ANALYZER LINE (r141 metric-review fix): r141 recorded no M4 verdict
in the run — the closeout read the transcript from the panel JSONs in the
main session. This run's analyzer carries the M4 section: it prints the
best candidate full transcript per seed (longest natural-end conversation,
preferring C-friendship / talk-request / ambush-recall tags) plus a
near-duplicate flag scan (descriptive, not a binding metric) so the M4
verdict is judged from analyzer output in-run.

(C) LAND THE GOALFOLLOW DEDUPE FIX: r141's M4 read found a real defect in
the leadership-bid conversation (Katarina, seed 41801, C-friendship,
10 turns, natural end): two goalFollow.lead lines fired two turns apart
that say the same beat near-verbatim —
  "Someone asked me what we should do yesterday. I had an answer. That felt... right."
  "Someone asked me yesterday what the plan was. I had one. That's new. That's — something."
Both live in the same 12-line `goalFollow.lead` pool in
src/data/characterGen.json, so the text-based repeat ledger (CONVERSATIONS.md
"No repeats, ever" — tracked by TEXT) cannot catch them: different strings,
same beat. A pool scan found a second, exact defect in the same structure:
`goalFollow.remember` lists "Tell me something you remember about before.
Anything. I collect them." TWICE, verbatim — a true duplicate line.
Fix (data only, no code): rewrite the second lead line to a distinct beat
(head-counting at the fire — care, not being asked) and replace the
duplicated remember line with a distinct line on the same theme. Other
first-3-word collisions in the scan (family "If I ever...", prove "Back home
I...", alone, escape, belong, survive, heal) are same-opening / different-beat
lines — legitimate variety, NOT defects, left alone.
Proof test scripts/test-goal-follow-dedupe-r144.js (deterministic, data-level):
(1) no exact-duplicate line inside any goalFollow pool; (2) the lead pool
contains no two lines sharing normalized first-3-words "someone asked me".
RED verified pre-fix (run against the unmodified characterGen.json — expect
both checks to fail), GREEN post-fix. The wild panel's M4 near-duplicate
flags (job B) are the in-the-wild observation of the same fix.

NOT in scope (documented, held): the player-side generic prompts in goal
conversations ("Tell me more." x4 / "Go on" / "I'm listening" in Katarina's
bid; trust 55→55, no movement) — the reply menu for goal threads offers
only generic continuations, so the player can never agree, deflect, or
challenge a bid. That needs a design decision (authored player replies to
bids), not a data edit; r141 judged M4 GO despite it. No bonds BUILD. No
gating/threshold retunes (frozen, Steve-call). No survival bisect. No
live-build screenshot pass (data-only change; transcripts re-read the
r125/r132/r136/r141 way). No raid-call / fire-overhear / pantry-line
position fixes (separate mechanisms, own arms).

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run. The fix follows the
"No repeats, ever" rule (convoPick tracks said lines by TEXT) — the defect
is that two different texts carry the same beat, so the ledger is blind to
it. Data over code per repo AGENTS.md.

## Driver

scripts/journey-social-life-r144-20261105.js = r141 driver verbatim EXCEPT:
fresh seeds 41901–41904, OUTDIR evidence/2026-11-05, filenames r144.
Analyzer: scripts/analyze-journey-social-r144-20261105.js = r141 analyzer
verbatim except filenames, PLUS the M4 section (job B).
Smoke first: SEED=41901 DAYS=5 into a scratch subdir, no instrumentErrors,
then the panel.

## Leg questions
1. Q1 (primary): do villagers EVER initiate a bond in wild social play?
   Baseline: 0 propose verbs across linkseek/standaccum/r103/r125/r132/
   r136/r141. Sixth datapoint.
2. Q2 (continuity): arming motive — every plot grievance-linked; d30
   drought bound (BROKEN in r141 — re-check, do not re-score); accomplices
   cold while leader hot?
3. Q3 (continuity): invite refusal — party/lure accept/decline, split by
   inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people? (M4 now
   judged from the analyzer's M4 section, in-run.)
5. Q5 (guardrail): survival — how many villages past d100? Short-panel
   sequence now 1/4, 1/4, 0/4, 1/4 — a standing survival fact, do not
   re-score it.
6. Q6 (gossip-position, r141 fix re-verify): 0 burst/settle/witness lines
   in stranded sleep windows across the panel, debates still kicking and
   settling (emit-time classification, correction 3 instrument).

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 41901–41904, sequential.
- Smoke first: SEED=41901 DAYS=5 into a scratch subdir, driver wrap
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
  still open if 0 (sixth baseline datapoint for the queued build).
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
  reported that way. Fifth consecutive short panel expected —
  report the sequence, do not re-score it mid-run.
- M6 gossip-position GO: 0 burst/settle/witness/tale lines emitted
  while away (emit-time *Away counts) across the 4-seed panel, AND
  ≥1 debate kicks and settles somewhere in the panel (mechanics
  alive, not silenced). NO-GO if any *Away line appears, or if no
  debate kicks at all (fix overshot into silence).

## What would count as interesting
- ≥1 villager-initiated bond proposal (Q1 answered YES).
- A plot arming after d30 again (drought bound retired as a claim).
- A grievance-holder accomplice (cold-friends pattern broken).
- A second d100+ village (M5 threshold met), or a new death shape.
- A senseless transcript (M4 NO-GO with quote).
- M6 NO-GO (r141 fix fails in the wild) or a stranded scholar who
  never hears a settled name on return (relay gap).
- Near-duplicate flags in r144 transcripts: the scan flags template-variant
  families by design (nonverbal "They answer at length" nods, opener stems,
  teaching/landmark templates) — the read is for a same-beat flag in a
  goalFollow pool, i.e. the lead-pool fix not holding in the wild; none
  such flag means the fix holds.

## Telemetry
- Metrics: same l3.* keys as r125/r132/r136/r141 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed panel.
