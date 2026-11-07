# Journey social life r153 — PRE-REGISTRATION (Lane B, 2026-11-07)

Leg 5 (social life). Rotation-b read 5 at run start. This run writes 6
(crisis next) at closeout. Run number r153 follows r152 (endgame, today)
and r151 (succession, today); r150 was the r149 closeout run.
Base: master 4ce3c0c1f (measurement-proof refresh on finish-instrument;
bond-initiation 5ba7f167f in base; drive build NOT on base — built+tested,
unmerged, 64-seed run owed; one-brain audit is context only).
Lock: playtest-loop-2.lock run_id 2026-11-07T15:55:40Z.
Worktree slug: journey2-social (branch journey2-social).

## Base movement since r149's gate (4a60f7f56 → 4ce3c0c1f)

Conversation-relevant landings: journey-deepening r114 (bond/link
decisions gated on shared words; convoTurn clears the decided kind's
pending + held beats so a later goon cannot re-speak the answered ask;
langate proof 24/24) and journey-succession r151 (ask_favor both-blocked
three-variant extension), plus xp-gear (patrol deed, synergy bonus,
gear protection retune — survival-side, affects the social window).
This panel is therefore a re-measurement on a CHANGED base, not a pure
repeat of r149.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 42301–42304. Full-scope check:
- `grep -rln "42301|42302|42303|42304" evidence/ --include='*.md'`: ZERO
  hits (every dated prereg, screen, note).
- No file named with 42301–42304 (`find evidence -name '*4230[1-4]*'`).
- Standacc forbidden band is 99201–99208 — a different band. Previous
  social bands 41801–41804 (r141), 41901–41904 (r144), 42001–42004 (r145),
  42201–42204 (r149). 42101–42104 stays COLLIDED (sim-snarecatch-b
  2026-10-19) — do not reuse.

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics as
r125/r132/r136/r141/r144/r145/r149 (M1–M7 below). Ninth datapoint on
Q1 (villager-initiated bonds), second with the bond-initiate build
live. M2 SCOPE NOTE (r149 metric review): the amendment-5
per-initiator ≤8/90d cap covers PERSON-bond proposals; link raises run
under their own 14-day per-pair cooldown and are reported separately
— the cap is scored on person-kind only this run.

(B) COUNTER-SETTLE EXPERIMENT (fresh question — the r149 finding):
r149 found Amina and Shanice each raising village links 10 times in
~31 days, all 9 proposeLink calls returning 'counter', no link ever
forming. The code read this run deepens the diagnosis:
- `proposeLink` scores 35–54 → `_stageCounter` sets
  `state.pendingCounter` and returns 'counter' (hierarchy.js).
- While `pendingCounter` is set, EVERY later `proposeLink` — any
  village — returns 'counter' immediately at the "offer on the table"
  guard WITHOUT scoring. A pending counter NEVER expires on its own.
- A real player settles it: `Game.answerCounter('accept'|'sweeten'|
  'walk')`, with UI buttons (app.js data-counter-accept/sweeten/walk).
  'accept' forms the link on their terms (Haven subordinate, 5,000
  kcal/week tribute). The sim driver never called it — so r149's 9
  counters may be 1 fresh stage + 8 blocked re-attempts, and the
  re-raise loop may be a DRIVER artifact, not a game defect.
- The r149 `proposeCalls` target names ("A man, maybe 30s",
  "Someone") are a driver wart: the wrap ran vname() on a VILLAGE id.
  r153 records the raw targetId alongside.
This run's driver SETTLES: once per day after the daily, if
`Game.state.pendingCounter` is set, call `Game.answerCounter('accept')`
and record {day, targetId, terms, tribute, pantryKcalAtSettle, result,
linkFormed}. The proposeLink wrap records `pendingBefore` (was a
counter already pending — fresh stage vs blocked re-attempt) and
`pendingAfter`. The answerCounter wrap records every answer (driver
settles only; no other sim caller exists). Pending counter at village
end is recorded.
HYPOTHESIS: settling breaks the loop — links form, re-raises stop
(linkWith guard), the 14-day re-raise cadence disappears.
FALSIFIER: settles fail/return null, links never form, or the loop
persists despite settling (then the defect is real and in the game,
not the driver).
NOTE: 'accept' makes Haven subordinate at 5,000 kcal/week — a real
price. Pantry at settle time is recorded so the report can say
whether the price was survivable; the experiment answers "does
settling break the loop", not "should a player always accept".

(C) RECAP-CAP VERIFICATION (r149 wart, re-read this run): the
"Wait — what were we talking about?" choice staying offered after the
NPC answered it three times is the DESIGNED reframe pool, not a bug:
convoRecapLine (conversation.js) reframes honestly 3 times ("As I
said — ..."), escalates at the 4th ("I've told you three times
now — ..."), and spends the choice out for the sitting after the
5th via convoSpendChoice (r27/r31). This run VERIFIES the cap fires
in the wild: the driver records recapPresses per conversation and
whether 'recap' is offered on any turn AFTER the 5th press. A 6th
recap press inside one conversation = cap failure (defect). No code
change pre-committed.

(D) M4 SENSE READ: from the analyzer's M4 candidates, in-run.
Check generic-reply recurrence ('more'-press runs) in the new panel.

(E) CONDITIONAL FIX — continuer label pool: IF the panel reproduces
a 'more'-press run ≥5 in any transcript, widen the dlg:more 3-label
pool (REPLY_POOLS in convo-beats.js — the same literal
['"Tell me more."', '"Go on."', '"I’m listening."'] at 10 sites) to
≥6 distinct variants via ONE shared const, plus a proof test
(distinct 'more' labels ≥5 across a long goal thread) and a 1-seed
confirmation re-run of the analyzer's dup scan. IF NOT reproduced,
no change. Rationale: canon ("Tell me more." goes deeper until
honestly exhausted, CONVERSATIONS.md) governs CONTENT; the 3-label
menu is the visible drag when the driver — or a persistent player —
presses 'more' repeatedly. Data-only change; new labels are distinct
texts so convoPick's by-text dedupe is unaffected.

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run. CONVERSATIONS.md:
"Tell me more." goes deeper until honestly exhausted; "Replies belong
to the spoken exchange"; "No repeats, ever" (convoPick tracks said
lines by TEXT). The dedupe work follows the "No repeats, ever" rule.
Data over code per repo AGENTS.md. The counter negotiation is canon
(hierarchy.js: negotiation_is_played — played, never rolled).

## Driver

scripts/journey-social-life-r153-20261107.js = r149 driver verbatim
EXCEPT: fresh seeds 42301–42304, OUTDIR evidence/2026-11-07,
filenames r153, PLUS:
(1) counter-settle policy + instrumentation (job B): proposeLink wrap
adds pendingBefore/pendingAfter + raw targetId; answerCounter wrap
(read-only record); daily-wrapper settle via answerCounter('accept')
with pantry + tribute recorded; pendingCounter at village end;
(2) recap tracking (job C): driveConversation records recapPresses
and recapOfferedAfterCap per transcript record;
(3) proposeCalls target wart fixed (raw targetId kept).
Analyzer: scripts/analyze-journey-social-r153-20261107.js = r149
analyzer verbatim except filenames, PLUS: counter section (fresh vs
blocked proposeLink calls, settles, links formed, loop verdict) and
recap section (max recap presses, cap-failure check).
Helpers: scripts/journey-social-r153-helpers.js = r149 helpers
verbatim PLUS summarizeCounters + tallyRecap.
Proof test scripts/test-journey-social-r153.js: r149 fixtures PLUS
summarizeCounters fixtures (fresh vs blocked split, settle→link
count, blocked-after-settle) and tallyRecap fixtures (press counts,
offered-after-cap detection). RED-verified against the unmodified
counting logic, GREEN after.
Smoke first: SEED=42301 DAYS=5 into a scratch subdir, no
instrumentErrors, then the panel.

## Leg questions
1. Q1 (continuity): do villagers initiate bonds in wild social play,
   second datapoint with the build live? (M2 count question.)
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
   sequence now 1/4, 1/4, 0/4, 1/4, 0/4, 0/4, 0/4 — a standing
   survival fact, do not re-score it.
6. Q6 (gossip-position, re-aligned): 0 naming-beat lines emitted
   while the scholar is beyond radius-1 of Haven (gate definition),
   debates still kicking and settling. Strict on-tile counts reported
   alongside as the metric-review discrepancy, not a failure.
7. Q7 (dedupe): does the wild panel show any same-beat flag in a
   fixed pool (fix not holding), or in a pool left as legitimate
   variety?
8. Q8 (NEW, job B): does settling counters break the link-raise loop
   — links form, re-raises stop? Or does the loop persist despite
   settling (real defect)?
9. Q9 (NEW, job C): does the recap cap fire in the wild — no
   conversation presses 'recap' 6+ times?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 42301–42304, sequential.
- Smoke first: SEED=42301 DAYS=5 into a scratch subdir, driver wrap
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
  per-initiator counts for PERSON kind only (amendment-5 cap:
  per-initiator ≤8/90d — scored on person-kind; link raises reported
  separately with their 14-day per-pair cooldown), and end bonds +
  whether the engine records a proposer. ANSWERED if ≥1
  villager-initiated person-bond proposal occurs in the wild panel;
  still open if 0.
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
  reported that way. Eighth consecutive short panel expected —
  report the sequence, do not re-score it mid-run.
- M6 gossip-position GO (RE-ALIGNED): 0 burst/settle/witness/
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
- M8 counter-settle (job B): SETTLED if ≥1 link forms via a driver
  settle (answerCounter('accept') → link) AND no villager re-raises
  the same village within 14 days of a settled counter; LOOP-PERSISTS
  if re-raises continue after settles or settles fail. Report fresh
  vs blocked proposeLink split regardless of verdict.
- M9 recap cap (job C): HOLDS if no conversation presses 'recap'
  6+ times and 'recap' is never offered after the 5th press;
  FAILS if any conversation reaches 6 recap presses (cap not firing
  in the wild).

## What would count as interesting
- ≥1 link formed via a driver settle (M8 SETTLED — r149 loop closed
  as a driver artifact).
- All r149-style counters shown to be 1 fresh + N blocked (the
  pendingCounter block, not 9 negotiations).
- A settle failing (answerCounter null/blocked) or the loop
  persisting despite settling (real defect).
- A recap cap failure (6th press in one conversation).
- A 'more'-press run ≥5 reproducing (triggers the conditional pool
  widening, job E).
- A villager-initiated proposal ACCEPTED (bond formed by NPC action).
- A plot arming after d30 again (drought bound retired as a claim).
- A grievance-holder accomplice (cold-friends pattern broken).
- A second d100+ village (M5 threshold met), or a new death shape.
- A senseless transcript (M4 NO-GO with quote).
- The react never offered on goal threads in the wild (wiring bug —
  fixable, reopens job C of r149 as a build).
- M6 gate-away NO-GO (r141 fix fails under its own definition) or a
  stranded scholar who never hears a settled name on return (relay gap).
- A same-beat flag in a fixed pool (M7 — fix not holding).

## Telemetry
- Metrics: same l3.* keys as r125/r132/r136/r141/r144/r145/r149 vs
  baseline telemetry-baselines/social.json. Known schema drift: the
  social driver never emits l3.* fields, so LOUD-disappeared lines
  are explained, not a bug. Baseline NOT rolled on a single 4-seed
  panel.
