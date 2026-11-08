# Journey social life r154 — PRE-REGISTRATION (Lane B, 2026-11-07)

Leg 5 (social life). Rotation-b read 5 at run start. r153's closeout
never wrote 6 — its coordinator died before landing and the main-session
adoption landed the fix but left rotation-b at 5. This run plays 5 again
and writes 6 (crisis next) at closeout. Run number r154 follows r153
(social, today). Base: master c9fea16ee (r153 conversation.js fixes in
base: cross-key cycle reset + opener-carried skip, landed via adoption).
Lock: playtest-loop-2.lock run_id 2026-11-08T02:56:19Z.
Worktree slug: journey2-social (branch journey2-social).

## Base movement since r153's gate

No conversation landings since r153 (base is the adoption round +
sim-winnability work, zero src/js in the winnability arms). This panel
is a re-measurement on the r153-fixed base, not a pure repeat of r153:
the two r153 defects are IN the base, so M7 (dedupe holds) and the
continuer-run question are re-tested, and M9 is the fix target.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 42601–42604. Full-scope check:
- `grep -rln "42601|42602|42603|42604" evidence/ --include='*.md'`: ZERO
  hits (every dated prereg, screen, note).
- No file named with 42601–42604 (`find evidence -name '*4260[1-4]*'`).
- Standacc forbidden band is 99201–99208 — a different band. Previous
  social bands 41801–41804 (r141), 41901–41904 (r144), 42001–42004
  (r145), 42201–42204 (r149), 42301–42304 (r153) + confirmation 42305.
  42101–42104 stays COLLIDED (sim-snarecatch-b 2026-10-19) — do not
  reuse. (42501 was considered first and rejected: it appears once in
  evidence as a game.js LINE number
  (evidence/2026-10-18/journey-succession-r25.md:184, "game.js:42501"),
  not a seed — but the band is skipped anyway to keep the freshness
  claim unambiguous.)

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics as
r153 (M1–M9 below). Tenth datapoint on Q1 (villager-initiated bonds),
third with the bond-initiate build live, first with the r153 dedupe
fixes in base.

(B) M9 RECAP-CAP FIX (r153 open defect, the build of this run).
Root cause, diagnosed by code read before this run (not a guess):
`convoRecapLine` (conversation.js) spends 'recap' only in the
`_recapReframes >= 5` branch — i.e. only when the SAME raw recap line
has been repeated 5 times. But the raw line is derived from the last
two thread-log entries, which change as the conversation moves through
topics, so a fresh re-anchor never increments the reframe counter and
the spend never fires. r153: 7 conversations to 6 presses, 196 total
presses on seed 42302, offeredAfterCap 7. The cap is keyed to
identical-line repetition, not to recap-press count — and the prereg
definition ("spends the choice out for the sitting after the 5th")
and the analyzer metric (6th press = cap failure) are press-count
based. The single runtime caller of convoRecapLine is the recap
handler (conversation.js:6388), so counting calls inside it counts
presses exactly.
FIX (src/js/conversation.js, convoRecapLine): per-sitting press
counter `c._recapPresses`; after serving the 5th press, spend
'recap' via convoSpendChoice regardless of whether the raw line
repeated. The r27/r31 reframe/escalation line-content machinery is
untouched; the existing same-line spend stays as a redundant guard.
The served 5th-press line stays the normal re-anchor (honest: the
NPC did answer) — no fake escalation on a fresh line. Offer side
needs no change: both offer sites (beat menu, base menu) flow
through buildMenu → finalizeMenu, which filters `c.spent` ids.
PROOF: scripts/test-journey-social-r154-recap.js — synthetic
long-thread conversations (thread log forced to advance each press,
so the raw line is fresh every time): RED on unfixed code (6th
press served, choice still offered), GREEN after (5th press served,
6th offer absent, spent.recap set; same-line repeat path still
escalates and spends). Plus a 1-seed confirmation re-run of the
analyzer's recap tally on the fixed code before the panel.
JUDGE: the panel (M9 below), not the proof test alone.

(C) REACT CODE READ (r153 open question — read, verdict, no silent
fix). Code read done before this run: on goal-thread turns the live
menu is the beat menu (`beatMenuResponses`, convo-beats.js), which
carries `dlg:react` '(listen)' with voiced variants but never the
`agree`/`joke`/`silence` ids. `pushReact` (agree/joke/silence trio)
lives in buildMenu's topic-assembly fallback, which the beat-menu
early return (`return finish(full)`) skips whenever a beat menu
exists. The 2269 'silence' offers in r153 are finalizeMenu's
unconditional silence append (step 4), not a react offer. VERDICT:
not a broken gate — a pipeline fact. The live react surface on goal
threads is `dlg:react` '(listen)'; agree/joke are structurally
unreachable there. Whether agree/joke should ALSO surface on goal
threads (endorsement/humor on the most substantive thread type) is
a DESIGN question for Steve, not a defect fix — this run reports
the read and proposes it as an open item; it does NOT land a
menu-surface change alongside the recap fix. This run re-tallies
the offers on the fresh panel to confirm the shape holds
(agree=0, joke=0, silence>0, dlg:react present).

(D) M2 KIND SPLIT (r153 metric review): the analyzer prints the
person-kind per-initiator max separately from the mixed-kinds max
(r153: person max 5, Ingrid; mixed max 9).

(E) M4 SENSE READ: from the analyzer's M4 candidates, in-run.
Check the continuer run (r153 job E question: does the 3-label
'more' pool suffice now the cycle is fixed — longest run <5 on the
fresh panel means yes; ≥5 reopens pool widening).

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r153 prereg
canon section stands: "Tell me more." goes deeper until honestly
exhausted; "Replies belong to the spoken exchange"; "No repeats,
ever"). The recap fix implements the ALREADY-DECIDED r27/r31
spend-out design ("then the recap choice spends out of the menu
for the sitting") — it changes the mechanism to match the design,
not the design itself. The player can still ask what the
conversation is about, five times a sitting; after that the NPC has
answered enough and the menu moves on.

## Driver

scripts/journey-social-life-r154-20261107.js = r153 driver verbatim
EXCEPT: fresh seeds 42601–42604, OUTDIR evidence/2026-11-07,
filenames r154. Analyzer:
scripts/analyze-journey-social-r154-20261107.js = r153 analyzer
verbatim except filenames, PLUS: M2 person-kind per-initiator max
printed separately (job D). Helpers:
scripts/journey-social-r154-helpers.js = r153 helpers verbatim.
Proof test scripts/test-journey-social-r154.js: r153 fixtures
verbatim. New proof scripts/test-journey-social-r154-recap.js
(job B). Smoke first: SEED=42601 DAYS=5 into a scratch subdir, no
instrumentErrors, then the panel.

## Leg questions
1. Q1 (continuity): do villagers initiate bonds in wild social play,
   third datapoint with the build live? (M2 count question.)
2. Q2 (continuity): arming motive — every plot grievance-linked; d30
   drought bound (BROKEN once in r141 — a second break retires the
   bound as a claim, it does not re-open it); accomplices cold while
   leader hot?
3. Q3 (continuity): invite refusal — party/lure accept/decline, split
   by inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people? (M4
   judged from the analyzer's M4 section, in-run.) Does the
   goal-thread react shape hold (agree/joke 0, dlg:react present)?
   Does the 3-label 'more' pool suffice (longest continuer run <5)?
5. Q5 (guardrail): survival — how many villages past d100? Short-panel
   sequence now 1/4, 1/4, 0/4, 1/4, 0/4, 0/4, 0/4, 2/4 — a standing
   survival fact, do not re-score it.
6. Q6 (gossip-position, re-aligned): 0 naming-beat lines emitted
   while the scholar is beyond radius-1 of Haven (gate definition),
   debates still kicking and settling. Strict on-tile counts reported
   alongside as the metric-review discrepancy, not a failure.
7. Q7 (dedupe): does the wild panel show any same-beat flag in a
   fixed pool (fix not holding), or in a pool left as legitimate
   variety?
8. Q8 (counter-settle, settled r153): driver still settles counters;
   report fresh vs blocked split + links formed. No new bar — the
   loop was a driver artifact; this run confirms it stays settled.
9. Q9 (recap cap, THE FIX): does the cap fire in the wild on the
   fixed code — no conversation presses 'recap' 6+ times?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 42601–42604, sequential.
- Smoke first: SEED=42601 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.
- Fix lands BEFORE the panel: proof test RED on unfixed code, GREEN
  after; 1-seed confirmation re-run of the recap tally on fixed
  code; then the 4-seed panel judges M9.

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
  still open if 0. Person-kind per-initiator max printed separately.
- M3 invite refusal, wrapper only: REPORT party/lure
  accept/decline counts (split by inviter). No threshold.
- M4 sense GO: ≥1 full transcript read (friendship, talk request,
  or ambush-recall) passes the bar: NPC wants something real,
  options engage or deflect it, ending resolves/plants/owes.
  Otherwise NO-GO with the failing transcript quoted. Judged from
  the analyzer's M4 section this run. Also report: react shape on
  goal threads (agree/joke/dlg:react/silence counts) and longest
  'more'-press run in any candidate.
- M5 census guardrail: ≥2/4 villages past d100, else all
  dark-channel verdicts are within-window only and must be
  reported that way. Ninth consecutive short panel expected —
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
- M8 counter-settle (job B, settled r153): CONFIRM — ≥1 link forms
  via a driver settle AND no re-raise loop; report fresh vs blocked
  proposeLink split regardless.
- M9 recap cap (job B, THE FIX): HOLDS if no conversation presses
  'recap' 6+ times and 'recap' is never offered after the 5th press
  on the fresh 4-seed panel; FAILS if any conversation reaches 6
  recap presses (fix did not hold in the wild).

## What would count as interesting
- M9 HOLDS on the fresh panel (the fix works in the wild).
- M9 FAILS again (fix shape wrong — the defect lives elsewhere,
  e.g. a second offer path bypassing finalizeMenu).
- A 'more'-press run ≥5 reproducing on the fixed base (reopens
  pool widening, r153 job E).
- A villager-initiated proposal ACCEPTED (bond formed by NPC action).
- A plot arming after d30 again (drought bound retired as a claim).
- A grievance-holder accomplice (cold-friends pattern broken).
- A second d100+ village (M5 threshold met), or a new death shape.
- A senseless transcript (M4 NO-GO with quote).
- The react shape changing (agree/joke offered on goal threads —
  would mean a menu-path change since r153, investigate).
- M6 gate-away NO-GO (r141 fix fails under its own definition) or a
  stranded scholar who never hears a settled name on return (relay gap).
- A same-beat flag in a fixed pool (M7 — fix not holding).

## Telemetry
- Metrics: same l3.* keys as r153 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed
  panel.
