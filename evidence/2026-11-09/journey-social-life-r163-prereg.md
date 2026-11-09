# Journey social life r163 — PRE-REGISTRATION (Lane B, 2026-11-09)

Leg 5 (social life). Rotation-b read 5 at run start (r162 endgame
landed 2026-11-09 ~06:25 CST, rotation 4→5). This run plays 5 and
writes 6 (crisis next) at closeout. Run number r163 follows r162.
Base: master a3ba1d22c. Lock: playtest-loop-2.lock run_id
2026-11-09T12:55:30Z. Worktree slug: journey2-social (branch
journey2-social).

## Registration delay (infrastructure, loud)

Worktree registration took ~25 min of the run: the first attempt's
`git worktree add` ran 6 min then died (cause undetermined — the
exec session ended with exit 2 and no FAIL text); two detached
retries died silently within ~2 min; a 400s sleep probe then proved
backgrounded exec sessions survive past 400s, so the session cap was
NOT the killer. The real blocker was an EPERM flap: O_EXCL file
creation on the btrfs filesystem failed with EPERM while leaving a
0-byte file behind (the documented 2026-11-05 flare signature),
which made `git worktree add` fail on writing
`.git/worktrees/journey2-social/locked` deterministically — even
while a /tmp+workspace probe said OK seconds earlier (the flap
flaps on a seconds timescale). A probe-gated retry loop
(single-success trigger, unique probe file per attempt, unlink on
every outcome) caught a clear window at 13:19:07Z and the register
completed in ~7.7 min. Flap state at prereg time: clear (13:29Z
probe OK). If the flap returns mid-panel, the panel retries rather
than re-scoring.

## Base movement since r159's panel

96 commits since 15f498359. Two src/js changes on the social
surface — this panel is a re-measurement on a moved base, not a
pure repeat:
- b98ac0730 journey-deepening r120: secret-response fix — a
  villager's confession now gets an answer [needs-eyes]
  (conversation.js). The panel exercises confessions; the fix's
  live behavior is a re-measurement dimension, not a new metric.
- f496b0072 journey crisis r156 (adopted): no-words foreign-phrase
  dedupe in conversation.js (nv-foreign). Touches M7's dedupe
  surface directly — a same-beat flag in the no-words family this
  run is read against this fix.

## Seed-band freshness (local_seed_band_freshness)

Chosen band 42801–42804. Full-scope check:
- `grep -rln "42801|42802|42803|42804" evidence/ --include='*.md'`:
  ZERO hits (every dated prereg, screen, note).
- `grep -rln "4280" evidence/*/sim-*-prereg.md
  evidence/2026-11-0*/*prereg.md`: ZERO hits.
- `grep -rln "42801|42802|42803|42804" evidence/
  --include='*.json'` (100s bounded run): ZERO hits.
- No file named with 42801–42804.
- Standacc forbidden band is 99201–99208 — a different band.
  Previous social bands 41801–41804 (r141), 41901–41904 (r144),
  42001–42004 (r145), 42201–42204 (r149), 42301–42304 (r153) +
  confirmation 42305, 42601–42604 (r154), 42701–42704 (r159).
  42101–42104 stays COLLIDED (sim-snarecatch-b 2026-10-19) — do
  not reuse. 42501 stays skipped (game.js line number in an old
  note, not a seed, skipped anyway to keep freshness claims
  unambiguous).

## Jobs this run

(A) CONTINUITY PANEL: the leg-5 panel on fresh seeds, same metrics
as r159 (M1–M9 below). Fifth datapoint on Q1
(villager-initiated bonds) with the bond-initiate build live,
third panel on the recap-cap-fixed base, first panel on the
secret-response + nv-foreign base.

(B) NARR COACH-LINE REPEAT FIX (r159 open item — the blank this
run fills). In truth.js `confrontWindup`, the `priorDeflect`
branch serves a HARDCODED single string (`They've deflected you
before. The evidence needs to be heavier this time — one more
thread before you speak.`) — not a pool — so it repeats verbatim
every time the player re-presses the doubt probe in one sitting
(r159: 7× panel-wide, 3× in Leo's sitting, 2× in Heinrich's).
Every other coach line draws from a 2-line pool via
`drawTruthLine`, which carries per-game no-repeat. FIX: a
`coachPriorDeflect` pool of 3 variants (the original wording kept
as one variant, meaning unchanged) drawn via `drawTruthLine` —
the "vary the line" shape r159 recorded. 3 variants cover the
observed 3×-in-one-sitting case exactly; a 4th press recycles
the pool (never the same line as the one that ended the cycle),
matching the existing coach pools' behavior. No meaning change,
no new advice, no gate change.
PROOF: scripts/test-journey-social-r163-coach.js — pool
assertions (≥3 lines, no {truth}/{told} placeholders, no
verbatim repeat among 3 draws for one villager) + behavioral
(3× `confrontWindup` with deflection evidence → 3 distinct
coach beats). The defect specimen (the hardcoded string served
twice verbatim) is demonstrated by the pre-fix pool shape in the
test header. JUDGE: the panel corpora, not the proof test alone
— the NARR scan (job C3) is the live check.

(C) TOOLING (r159 open items, read-only except the driver
capture):
(1) SCATTERING CAPTURE: the driver records at village end
`scattered` (`Game.state.village.scattered`), `hungryDays`,
`aliveEnd` and `endReason` — r159's 42703 village ended at d46
with 5 alive and the corpus could not confirm the scattering
path (game.js: pantry empty for 3+ hungry days → people walk
away). Next scattering in this panel is confirmed or refuted
from the record, not by elimination.
(2) RE-OFFER FURNITURE FILTER: `tallyReoffers` gains a
filtered panelMax excluding structural ids
(`leave`/`bye`/`goodbye`/`silence`) — the r159 headline
(238/246 conversations with a re-offer, panelMax 12) was
dominated by menu furniture. Raw perId kept for audit.
(3) M7 NARR SCAN: the analyzer's near-dup scan gains a
separate NARR-lines pass (same strip-prefix + same-opening /
Jaccard rules, NARR lines only), reported separately from the
NPC-lines M7 verdict — the r159 metric review asked whether
the scan includes NARR lines; this run answers it with data
while keeping M7's NPC verdict clean. A NARR repeat after the
job-B fix is a live regression signal, not a metric failure.

(D) REACT SHAPE RE-TALLY (r153/r154/r159 open question — report,
no fix). The agree/joke/silence trio is structurally unreachable
on goal-thread turns; `dlg:react` '(listen)' is the live react
surface. Whether agree/joke should ALSO surface there remains a
DESIGN question for Steve — this run re-tallies the offers on
the fresh panel to confirm the shape holds (agree=0, joke=0,
silence>0 from finalizeMenu's unconditional append,
dlg:react present, moreOffered=0) and leaves the menu surface
unchanged.

## Canon

docs/CANON.md + docs/CONVERSATIONS.md read this run (r159 canon
section stands: "Tell me more." goes deeper until honestly
exhausted; "Replies belong to the spoken exchange"; "No repeats,
ever"). The coach-pool fix is a "No repeats, ever" repair in
code, not a design change. The agree/joke question is left as a
Steve design question.

## Driver

scripts/journey-social-life-r163-20261109.js = r159 driver
verbatim EXCEPT: fresh seeds 42801–42804, OUTDIR
evidence/2026-11-09, filenames r163, PLUS the scattering capture
(job C1) in the end-state evidence. Analyzer:
scripts/analyze-journey-social-r163-20261109.js = r159 analyzer
verbatim except filenames, PLUS: NARR near-dup pass (job C3) and
furniture-filtered re-offer reporting (job C2). Helpers:
scripts/journey-social-r163-helpers.js = r159 helpers verbatim,
PLUS the furniture filter in `tallyReoffers` (job C2) and
`tallyNarrDup` (job C3). Proof tests
scripts/test-journey-social-r163.js (r159 fixtures verbatim +
C2/C3 fixtures) + scripts/test-journey-social-r163-coach.js
(job B). Smoke first: SEED=42801 DAYS=5 into a scratch subdir,
no instrumentErrors, NARR lines present distinctly in the corpus
if any coach beat fires (if none fires in 5 days, the panel is
the live check).

## Leg questions
1. Q1 (continuity): do villagers initiate bonds in wild social
   play, fifth datapoint with the build live? (M2 count question.)
2. Q2 (continuity): arming motive — every plot grievance-linked;
   d30 drought bound (BROKEN once in r141 — a second break
   retires the bound as a claim, it does not re-open it);
   accomplices cold while leader hot?
3. Q3 (continuity): invite refusal — party/lure accept/decline,
   split by inviter (succession-proof, inviterWasBearer).
4. Q4 (sense): do full transcripts still read as real people?
   (M4 judged from the analyzer's M4 section, in-run.) Does the
   goal-thread react shape hold (agree/joke 0, dlg:react
   present)? Does the 3-label 'more' pool suffice (longest
   continuer run <5)? Do NARR coach lines vary now (job B — the
   NARR scan is the live check)? Do doubt-probe re-offers /
   dropped threads persist (job C watch)?
5. Q5 (guardrail): survival — how many villages past d100?
   Sequence now 1/4, 1/4, 0/4, 1/4, 0/4, 0/4, 0/4, 2/4, 3/4,
   0/4 (r159) — a standing survival fact, do not re-score it.
6. Q6 (gossip-position, re-aligned): 0 naming-beat lines emitted
   while the scholar is beyond radius-1 of Haven (gate
   definition), debates still kicking and settling. Strict
   on-tile counts reported alongside as the metric-review
   discrepancy, not a failure.
7. Q7 (dedupe): does the wild panel show any same-beat flag in a
   fixed pool (fix not holding), or in a pool left as legitimate
   variety? NARR lines scanned separately this run (job C3).
8. Q8 (counter-settle, settled r153): driver still settles
   counters; report fresh vs blocked split + links formed. No
   new bar.
9. Q9 (recap cap, re-confirmation): does the cap still fire in
   the wild on the fixed code — no conversation presses 'recap'
   6+ times?
10. Q10 (scattering, new): does any village end scattered with
    people alive — and does the record confirm it (job C1)?

## Panel (binding)
- Policy journey (socialite base + real conversations), DAYCAP 140,
  PILOT seeds 42801–42804, sequential.
- Smoke first: SEED=42801 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.
- Coach-pool fix lands BEFORE the panel: proof test GREEN after
  (and the defect specimen demonstrates the old verbatim repeat);
  then the 4-seed panel judges the social fabric with coach lines
  drawn from the pool.

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
  per-initiator ≤8/90d — scored on person-kind; link raises
  reported separately with their 14-day per-pair cooldown), and
  end bonds + whether the engine records a proposer. ANSWERED if
  ≥1 villager-initiated person-bond proposal occurs in the wild
  panel; still open if 0. Person-kind per-initiator max printed
  separately.
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
  reported that way. Eleventh consecutive short panel expected —
  report the sequence, do not re-score it mid-run.
- M6 gossip-position GO (RE-ALIGNED): 0 burst/settle/witness/
  tale lines emitted while the scholar is beyond radius-1 of Haven
  (gate-away counts, playerAtHaven definition) across the 4-seed
  panel, AND ≥1 debate kicks and settles somewhere in the panel
  (mechanics alive, not silenced). NO-GO if any gate-away line
  appears, or if no debate kicks at all (fix overshot into
  silence). Strict on-tile *Away counts are reported alongside as
  the known metric/gate definition discrepancy — they do NOT fail
  M6 this run.
- M7 dedupe fix holds: no same-beat flag in any fixed pool in the
  wild panel (analyzer M4 scan); a flag in a fixed pool reopens
  the fix. A flag in a pool left as legitimate variety is
  reported, not a failure. NARR-lines scan is reported
  separately (job C3) and does NOT fail M7 this run — it is the
  live check on the job-B fix.
- M8 counter-settle (settled r153): CONFIRM — ≥1 link forms
  via a driver settle AND no re-raise loop; report fresh vs blocked
  proposeLink split regardless.
- M9 recap cap (re-confirmation): HOLDS if no conversation presses
  'recap' 6+ times and 'recap' is never offered after the 5th press
  on the fresh 4-seed panel; FAILS if any conversation reaches 6
  recap presses (fix did not hold in the wild).
- M10 coach variation (new, job B): HOLDS if no NARR coach line
  repeats verbatim within one sitting in the panel corpora
  (the NARR scan, job C3, is the instrument); FAILS if the same
  coach text appears 2+ times in one transcript (pool not
  varying — the fix did not hold in the wild).

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
- A NARR coach line repeating verbatim in one sitting (M10 FAIL —
  the pool fix did not hold in the wild).
- A dropped secret that resurfaces next sitting (open-thread ledger
  working) or a dropped PROMISE (canon violation — defect).
- A village ending scattered with people alive, CONFIRMED by the
  new record (Q10 — the r159 42703 question answered).
- A confession answered in the wild on the r120-fixed base
  (secret-response fix live behavior).

## Telemetry
- Metrics: same l3.* keys as r159 vs baseline
  telemetry-baselines/social.json. Known schema drift: the social
  driver never emits l3.* fields, so LOUD-disappeared lines are
  explained, not a bug. Baseline NOT rolled on a single 4-seed
  panel.
