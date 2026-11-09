# Journey social life r159 — PRE-REGISTRATION (Lane B, 2026-11-08)

Leg 5 (social life). Rotation-b read 4 at run start: the r158 endgame
closeout never landed (coordinator died after the gate adjudication;
branch journey2-endgame held 2 clean commits, heartbeat 56 min stale,
lock 2026-11-08T20:04:56Z with no registry entry). This run adopted
r158 first (stale-lock recovery, rebase onto master 93e7bea26, proof
test 9/9, ff-only merge 15f498359, tree released, rotation 4→5) and
then plays 5. This run writes 6 (crisis next) at closeout. Run number
r159 follows r158 (endgame). Base: master 15f498359 (r158 merged:
TABLE.md lesser-seat bar in ladder terms + ladder-line proof test;
no game-code change from r158). Lock: playtest-loop-2.lock run_id
2026-11-09T00:03:00Z. Worktree slug: journey2-social (branch
journey2-social).

## Base movement since r154's panel

No conversation landings since r154 (r158 was docs + proof test +
evidence only; sim-flipsocial-b was evidence/panels). This panel is a
re-measurement on the r154-fixed base, not a pure repeat: the recap
cap fix is IN the base, so M9 is a re-confirmation, and the NARR
tooling fix (job B) changes only what the driver records, never game
behavior — the panel judges whether the social fabric still reads
the same with narrator lines shown as narrator lines.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 42701–42704. Full-scope check:
- `grep -rln "42701|42702|42703|42704" evidence/ --include='*.md'`:
  ZERO hits (every dated prereg, screen, note).
- `grep -rln "42701|42702|42703|42704" evidence/` (all files): 10
  hits, ALL digit noise, none a band naming — `pantryFreshBefore /
  pantryFreshAfter: 42703` kcal counts in 2026-10-16 crumbguard /
  crumbdefault census JSONs, and the float `2.7520714270174143` in
  2026-10-17 feastvoice-b-beats JSONs. Word-boundary grep confirms
  only those pantry-count JSONs hold the strings as standalone
  numbers — pantry calories, not seeds.
- `grep -rln "4270" evidence/*/sim-*-prereg.md
  evidence/2026-11-0*/*prereg.md`: ZERO hits.
- No file named with 42701–42704.
- Standacc forbidden band is 99201–99208 — a different band.
  Previous social bands 41801–41804 (r141), 41901–41904 (r144),
  42001–42004 (r145), 42201–42204 (r149), 42301–42304 (r153) +
  confirmation 42305, 42601–42604 (r154). 42101–42104 stays COLLIDED
  (sim-snarecatch-b 2026-10-19) — do not reuse. 42501 stays skipped
  (game.js line number in an old note, not a seed, skipped anyway
  to keep freshness claims unambiguous).

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r154 (M1–M9 below). Fourth datapoint on Q1 (villager-initiated
bonds) with the bond-initiate build live, second panel on the
recap-cap-fixed base.

(B) NARR-LINE PRINTING FIX (r154 open item, tooling only — the
blank this run fills). The analyzer's M4 candidate printer flattened
narrator ('narr') beats into 'NPC': truth.js emits codex-gated
coaching beats as `{ who: 'narr', text: '*...*' }` (truth.js:1225-1226),
but the driver maps every transcript entry with `e.who === 'you' ?
'YOU' : 'NPC'` at three sites (driver lines 105/113/141), so a
coaching line printed as NPC speech. FIX: a shared mapper
`mapTranscriptEntry` in the r159 helpers — you→YOU, narr→NARR,
anything else→NPC — used at all three driver sites. The analyzer
needs no change: it prints `e.who` verbatim (line 162), and its
NPC-lines filter for near-dup flagging (`e.who === 'NPC'`, line 147)
correctly excludes narrator coaching from NPC-speech checks. No
game behavior changes: the mapper touches only what the driver
RECORDS, never convo logic (the live `lastNPC` exit-signal filter
reads `convoGet` directly, not the mapped transcript).
PROOF: scripts/test-journey-social-r159-narr.js — mapper unit cases
(you/npc/narr/missing-who) GREEN after; the old inline expression,
quoted verbatim from the r154 driver, maps a narr entry to NPC
(the defect specimen, RED on old code). Live proof: the panel
corpora carry NARR lines distinctly (r154's `*Confessions need
weight...*` lines print as NARR, not NPC).
JUDGE: the panel corpora, not the proof test alone.

(C) WATCH TALLIES (r154 open items, analyzer additions, read-only):
(1) RE-OFFER: per conversation, any choice id offered on 2+ turns
(from `t.offered`) — the doubt-probe wart (r154: the doubt probe
re-offered after a deflection, template-variety, no verbatim
repeat). Report the max re-offer count, the ids, and whether the
doubt-probe shape persists. No threshold — a watch metric.
(2) DROPPED-THREAD: transcripts containing "lost my train of
thought" — count them, list seed/vid/tag + surrounding lines, and
for each, the NEXT sitting with the same vid in the same seed
(array order = play order): does the thread/secret resurface, or
stay dropped (Theo's photo secret, r154)? A listing for the human
read, not an automated verdict — the sense judgment is in the run
note. Canon note: the repeat ledger must not replace a successful
promise with "lost my train of thought" (docs/CONVERSATIONS.md) —
a drop after a SECRET OFFER is the shape to watch, a drop replacing
a promise would be a defect.

(D) REACT SHAPE RE-TALLY (r153/r154 open question — report, no fix).
The agree/joke/silence trio is structurally unreachable on
goal-thread turns (beat-menu early return skips buildMenu's
topic-assembly fallback; `dlg:react` '(listen)' is the live react
surface). Whether agree/joke should ALSO surface there is a DESIGN
question for Steve, not a defect fix — this run re-tallies the
offers on the fresh panel to confirm the shape holds (agree=0,
joke=0, silence>0 from finalizeMenu's unconditional append,
dlg:react present, moreOffered=0) and leaves the menu surface
unchanged.

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r154 canon
section stands: "Tell me more." goes deeper until honestly
exhausted; "Replies belong to the spoken exchange"; "No repeats,
ever"). The NARR fix is tooling display, not a design change. The
agree/joke question is left as a Steve design question.

## Driver

scripts/journey-social-life-r159-20261108.js = r154 driver verbatim
EXCEPT: fresh seeds 42701–42704, OUTDIR evidence/2026-11-08,
filenames r159, PLUS the NARR mapper (job B) at the three
transcript sites. Analyzer:
scripts/analyze-journey-social-r159-20261108.js = r154 analyzer
verbatim except filenames, PLUS: re-offer + dropped-thread tallies
(job C). Helpers:
scripts/journey-social-r159-helpers.js = r154 helpers verbatim,
PLUS `mapTranscriptEntry` (job B) and `tallyReoffers` /
`tallyDroppedThreads` (job C). Proof tests
scripts/test-journey-social-r159.js (r154 fixtures verbatim) +
scripts/test-journey-social-r159-narr.js (job B). Smoke first:
SEED=42701 DAYS=5 into a scratch subdir, no instrumentErrors,
NARR lines present distinctly in the corpus if any coach beat
fires (if none fires in 5 days, the panel is the live check).

## Leg questions
1. Q1 (continuity): do villagers initiate bonds in wild social play,
   fourth datapoint with the build live? (M2 count question.)
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
   Do NARR lines print distinctly (job B)? Do doubt-probe
   re-offers / dropped threads persist (job C)?
5. Q5 (guardrail): survival — how many villages past d100? Sequence
   now 1/4, 1/4, 0/4, 1/4, 0/4, 0/4, 0/4, 2/4, 3/4 (r154) — a
   standing survival fact, do not re-score it.
6. Q6 (gossip-position, re-aligned): 0 naming-beat lines emitted
   while the scholar is beyond radius-1 of Haven (gate definition),
   debates still kicking and settling. Strict on-tile counts reported
   alongside as the metric-review discrepancy, not a failure.
7. Q7 (dedupe): does the wild panel show any same-beat flag in a
   fixed pool (fix not holding), or in a pool left as legitimate
   variety?
8. Q8 (counter-settle, settled r153): driver still settles counters;
   report fresh vs blocked split + links formed. No new bar.
9. Q9 (recap cap, re-confirmation): does the cap still fire in the
   wild on the fixed code — no conversation presses 'recap' 6+
   times?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 42701–42704, sequential.
- Smoke first: SEED=42701 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.
- NARR fix lands BEFORE the panel: proof test GREEN after (and the
  defect specimen demonstrates the old flattening); then the 4-seed
  panel judges the social fabric with NARR lines shown distinctly.

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
  reported that way. Tenth consecutive short panel expected —
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
- M8 counter-settle (settled r153): CONFIRM — ≥1 link forms
  via a driver settle AND no re-raise loop; report fresh vs blocked
  proposeLink split regardless.
- M9 recap cap (re-confirmation): HOLDS if no conversation presses
  'recap' 6+ times and 'recap' is never offered after the 5th press
  on the fresh 4-seed panel; FAILS if any conversation reaches 6
  recap presses (fix did not hold in the wild).

## What would count as interesting
- M9 FAILS again (fix shape wrong — the defect lives elsewhere).
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
- A NARR line that is actually NPC speech in disguise (the mapper
  over-reaches — would mean a non-narr beat carries who:'narr').
- A dropped secret that resurfaces next sitting (open-thread ledger
  working) or a dropped PROMISE (canon violation — defect).

## Telemetry
- Metrics: same l3.* keys as r154 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed
  panel.
