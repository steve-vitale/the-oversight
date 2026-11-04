# BELONG-zombie census + conditional clear probe — Loop B, arm sim-belongzombie-a

Axis: scale-onramp / winnability chain (the recovery leg of the
polityfrag diagnosis). This arm tests ONLY the BELONG-direction
zombie question, never the Haven-primary clear (held on branch
sim-recovery-zombie-b — NOT touched, NOT merged, NOT re-proven
here), never tend-through, never bundled. Gates, win prices, deed
numbers, the 12,000-kcal proposal gate, and all trust numbers stay
UNTOUCHED. A clear rule, if it ever lands, only breaks an
already-dead (trust <= 0) link.

## Context read before this prereg

- evidence/2026-11-04/sim-winnability-round-0930.md (recovery-tend
  + recovery-zombie pilots) and sim-winnability-round-1030.md
  (recoverylong: Haven-primary trust-0 in life on exactly 1 of 16
  seeds; the only trust-0 links on the 998 band were
  BELONG-direction, out of the Haven-primary clear's scope).
- evidence/2026-11-04/sim-recovery-zombie-b.md,
  sim-recoverylong-b.md (+ preregs), sim-leadbelong-b.md
  (the BELONG link on 99401 is untended by leadcourt's
  primary-only tend loop — a policy confound, not a shape
  effect — and its trust reaches 0 at d85, breaks d97).
- docs/CANON.md first, then docs/SCALE.md: BELONG = Haven is a
  subordinate in good standing (trust >= 50, arrears 0, link age
  >= 14 days) to a primary whose realm holds >= 4 villages;
  seasoned = 30+ days AND trust 40+. No canon doc covers the
  diplomacy pipeline's day-to-day trust mechanics in the same
  detail — stated here instead of inventing canon; trust
  mechanics are read from src/js/hierarchy.js, as in the 0930Z
  prereg.
- docs/MEASUREMENT.md §§9–12, 14–15 apply as the loop brief
  encodes them (pilot gate, death-aware horizon,
  pre-registration, metric binding, balanced panel where a
  comparison exists — see the panel note).

## Question (the blank left by 1030Z)

On the 998 band, the ONLY trust-0 links in life were
BELONG-direction (99808: three links, primary = another village,
subordinate = haven, breaking on the death day) — out of the
held Haven-primary rule's scope. The same shape reproduced on
99401 (0930Z). Question, in order: (1) CENSUS: on a
survival-first substrate, do BELONG-direction links reach trust
<= 0 in life, do such zombie links block a proposal slot, and
would clearing them free a re-proposal? (2) ONLY if the census
shows an addressable pool meeting the bar below: does a
BELONG-direction clear rule (same pattern as the held rule:
said aloud, broken as 'faded', scoped to BELONG-direction
links) produce re-proposals / re-links after a clear, with the
village surviving the clear by 35+ days with pantry above the
12,000 proposal gate?

## §14b pre-pilot substrate checklist (run BEFORE this prereg's bar)

1. CONTACT — PASS, on stored corpora (no new sims): BELONG
   trust-0 in life occurs under leadcourt. Offline census of
   the stored per-seed JSONs (diplo instrument snapshots):
   998 band (recoverylong armed legs): 3 BELONG zombies on
   99808 (village_0 firstZero d96, village_2 d96, village_1
   d99; 32/32/29 in-life trust-0 snapshots; all break on the
   death day d161, never cleared, never re-proposed in life).
   994 band (recoveryzombie legs): 1 BELONG zombie on 99401
   (firstZero d85, 12 in-life trust-0 snapshots, break d97,
   village lost d98). Diplo 993 band: 0 BELONG links at all.
   So contact is proven on leadcourt, but the pool is thin
   and concentrated: 4 zombie links on 2 of 16 leadcourt
   seeds. The judged census below must not re-use 99808 or
   99401 — both bands are already judged, and picking them
   now would select on the outcome. The census band is
   therefore survival-screened fresh seeds (see substrate).
2. POOL SIZING — bar set from the pool, not from nowhere:
   stored pool = 4 zombie links / 2 zombie seeds / 16 seeds.
   The census bar (below) requires >= 2 ADDRESSABLE seeds
   (zombie + 35d post-zero life + pantry gate open) on an
   8-seed survival-selected band. That is the same order of
   magnitude as the observed zombie-seed rate (2/16), not a
   30x-pool bar. If the screened band yields 0 zombie links,
   the verdict is SUBSTRATE-MISSING; if it yields zombies
   but < 2 addressable seeds, INSUFFICIENT-DATA — neither
   is a kill of the concept, and no rule is landed.
3. VERB EXISTENCE — PASS with one stated partial: the clear
   verbs exist (breakLink + say, proven by the held rule's
   live fixture + wild clear); the re-proposal verb exists
   in the engine (proposeLink, any direction) and the
   blocking guard is code-verified (below). PARTIAL: the
   leadcourt POLICY never proposes BELONG-intent (it
   proposes asSubordinate:false only) and never pays BELONG
   tribute (its tend loop filters primary === 'haven').
   A BELONG link under leadcourt forms only via a
   counter-accept flip (99808's three BELONG links all
   formed that way: proposals d39/d41/d52 returned
   'counter', links formed d40/d42/d53 as BELONG). So a
   cleared BELONG link's re-proposal under leadcourt can
   only be (a) a LEAD re-proposal to the same village
   (the pair slot freed), or (b) a new counter-flip to
   BELONG. Step-2 GO therefore counts ANY re-proposal /
   re-link to the cleared village, direction-agnostic, and
   a GO must NOT be reported as BELONG-road recovery.
   A BELONG-intent re-formation test would need the
   belongseek policy — named as the follow-up substrate,
   not smuggled into this arm.
4. HORIZON FIT — PASS: historically BELONG firstZero lands
   d85–d103; a 35-day re-seasoning window needs life to
   ~d140+. The 300d death-aware horizon fits (death, not
   the cap, ends these runs; max observed 213d on the
   screen below). Raising the cap buys nothing.

## Code verification (before any rule — the candidate shape checked)

- proposeLink's duplicate guard refuses ONLY active links:
  linkWith() skips every non-'active' link AND is
  direction-agnostic (returns a link whether Haven is
  primary or subordinate, hierarchy.js linkWith). A broken
  link does NOT block a fresh proposal to that village.
  Confirmed in code.
- leadcourt's proposal loop filters candidates with
  !(linkWith(v.id)) — so a zombie BELONG link makes its
  village invisible to leadcourt's courtship entirely,
  not merely unproposable: 99808 records ZERO proposals
  to any of its three zombie villages after firstZero
  while the links stayed active, although the policy was
  still proposing (its 2 splinter LEAD links formed
  d54/d56 and subs stayed < 3). The zombie blocks the
  PAIR slot (that village), NOT the LEAD count slot:
  leadcourt's subs count filters primary === 'haven'
  only, so a BELONG zombie never inflates the subs >= 3
  stop. Any claim that a BELONG zombie "blocks a proposal
  slot" must carry this pair-slot scope — a count-slot
  claim would be false.
- BELONG trust decay path: linkTick's subordinate === HOME
  branch charges -6 trust per unpaid week (clamped at 0),
  arrears accumulate; leadcourt pays nothing toward it
  (no payTribute call for BELONG links), so an untended
  BELONG link decays toward 0 by policy design. Trust
  flickers around 0 in the wild (99808: 0 -> 1-2 -> 0
  repeatedly) because small gains still land — a weekly
  boundary clear must therefore trigger on trust <= 0 AT
  THE TICK, not on "first ever touched 0".
- The neglect snap is NOT the blocker here either (it is
  succession-only, as 0930Z verified): the blockers are
  the linkWith active-only duplicate guard + leadcourt's
  !linkWith candidate filter. Clearing removes both at
  once for that pair.

## Substrate (survival-first, selected on survival ALONE)

- Screen (pre-pilot probe, days-only — the screen driver
  recorded NO link data, so it cannot select on clears):
  fresh seeds 99001–99024, leadcourt verbatim, 300d
  death-aware. Freshness verified before the screen: 0
  hits for 99001–99024 in evidence/2026-11-04/*.md and
  in evidence/2026-11-04/perseed-*/ corpus filenames.
  Screen distribution (days): 18, 24, 34, 36, 41, 45, 48,
  49, 62, 67, 72, 82, 83, 90, 96, 106, 116, 121, 127,
  132, 132, 135, 163, 213. Median 86.5, max 213 (99023
  — the only >= 200d village in 24 screened seeds, 1/24).
  Baseline comparison: 994 band median 109 / max 146;
  998 band median 76.5 / max 161. A >= 200d leadcourt
  village is rare (~1/24 here, 0/16 across the two prior
  bands); a band of eight >= 200d seeds is not
  obtainable by screening within this run's budget, so
  the census band is the survival-ranked top 8 below —
  the longest-lived band available under the identical
  policy, chosen on survival alone.
- CENSUS BAND (judged legs, 8 seeds): 99023 (213d),
  99008 (163d), 99006 (135d), 99004 (132d), 99013 (132d),
  99016 (127d), 99009 (121d), 99017 (116d). Median
  129.5d — longer-lived than both prior bands on median
  and max, and containing one true >= 200d seed. The
  census legs (diplo instrument) may reproduce slightly
  different day counts than the screen (instrument
  wraps are call-through/RNG-neutral by design); the
  judged survival numbers are the census legs' own.
- COMPARATOR (not judged, not pooled): the stored 998
  armed corpus (recoverylong) — cited for §14b pool
  sizing only. Its numbers never enter the census judge.
- Policy (judged legs): scripts/policies/leadcourt.js
  {leadcourt} VERBATIM, default env. Same diplo
  instrument (scripts/diplo-instrument-20261104.js)
  reused verbatim. Horizon 300d, death-aware (+10d tail
  max as implemented by runDays). Snapshot discipline
  as recoverylong (daily snapshot never calls
  villageStandingTotal or unlockedWave; ONE end-of-run
  unlockedWave call reported separately, never counted
  as a natural door-open).

## Pre-registration — STEP 1: census (committed before any census leg)

- Instrument: scripts/test-belongzombie-driver-20261104.js
  (output evidence/2026-11-04/perseed-belongzombie-a/,
  RUN=belongzombie-census; refuses to overwrite) and
  analyzer scripts/test-belongzombie-analyze-20261104.js.
  Analyzer proof scripts/test-belongzombie-20261104.js
  green before any census leg (verified 17/17 at prereg).
- BELONG zombie (analyzer definition): a link with
  primary !== 'haven' and subordinate === 'haven' that
  reads trust <= 0 while 'active' on a snapshot BEFORE
  the village's death day. Death-day snapshots excluded.
  Flicker handled: firstZero = first in-life trust-0
  snapshot; zeroDaysInLife counts in-life trust-0
  snapshots only.
- ADDRESSABLE zombie: a zombie whose village lives
  >= 35 days past firstZero (postZeroLife = death day
  minus firstZero, or censored at last snapshot if the
  village survives) AND whose pantry reads >= 12,000
  kcal on at least one in-life snapshot in
  (firstZero, firstZero+35].
- PRIMARY METRIC (per seed, census leg): BELONG zombie
  links (village, formed day, firstZero, zeroDaysInLife,
  break day, postZeroLife, pantry gate open?) +
  proposals to the zombie village while the link is
  active (expected 0 — the blocking record) +
  whether the policy was still proposing elsewhere
  (so "0 attempts" reads as blocking, not a dead
  policy).
- CENSUS BAR (binding): GO-TO-STEP-2 iff >= 2 seeds on
  the census band carry >= 1 addressable zombie.
  Otherwise: 0 zombie links on the band =
  SUBSTRATE-MISSING; >= 1 zombie link but < 2
  addressable seeds = INSUFFICIENT-DATA. In either
  non-GO case the verdict is NOT a kill of the concept,
  NO rule is built or landed, and the run reports the
  pool number (zombie links, zombie seeds, addressable
  seeds) as the result. No sweeping unregistered seeds
  to hunt a pass, no expansion to 12–16 on this
  worker's authority.
- COST BAR: not applicable to the census leg (no rule,
  no armed leg — the census leg IS control behaviour).
  Wall numbers are reported, not judged, on the census
  legs.

## Pre-registration — STEP 2: conditional clear probe (same prereg)

Runs ONLY if step 1 judges GO-TO-STEP-2, on the SAME 8
census seeds, as a paired armed/control comparison
(armed = rule on; control = hierarchy.js swapped for
its pre-rule version for the control run only, then
restored; restoration verified with
`git diff HEAD -- src/js/hierarchy.js` empty before
any verdict is written).

- THE RULE (this branch only, never the held branch):
  in linkTick's per-link IIFE, after the week's tribute
  accounting and the speaker-death check (the exact
  site of the held Haven-primary rule), a link with
  subordinate === 'haven', primary !== 'haven', NOT
  conquered, status === 'active', trust <= 0 is said
  aloud ("The bond with X has faded to nothing — no
  trust left to tend, no fire left to feed. The bond is
  gone, and the table is open again: a new bond could
  be built where this one stood.") and broken via
  breakLink(id, 'faded'), with a _linkNote 'faded'.
  Trust math, tribute rates, seasoned bars, polity
  size, gates, prices, deed numbers untouched. A tend
  or tribute payment landing between trust hitting 0
  and the weekly boundary rescues the link first
  (trust back above 0) — same rescue semantics as the
  held rule.
- CLEAR EVENT (analyzer definition): a BELONG link
  active -> non-active whose last active trust was
  <= 0 AND a 'faded' say line fires within 7 days
  before the broken snapshot. Breaks without a faded
  line are otherBreaks, never clears.
- PRIMARY METRIC + GO THRESHOLD (binding): GO iff at
  least 1 armed seed has ALL of: (a) a BELONG clear,
  (b) a re-proposal OR re-link to the cleared village
  after the clear (direction-agnostic — see the verb
  partial above), (c) survival after clear >= 35 days
  (snapshot days, conservative by the 1-day
  say/snapshot lag), AND (d) a post-clear diplomacy
  recovery whose snapshot pantryKcal >= 12,000.
  Otherwise NO-GO, with the blocker named. If the
  pilot yields zero clears surviving 35+ days, that IS
  the NO-GO result — no sweeping, no expansion on this
  worker's authority.
- COST BAR (paired, same seeds — a breach makes the
  verdict NO-GO regardless of the GO legs):
  starvation deaths armed <= control + 2 on totals AND
  on per-seed excess (armed minus control per seed,
  floored at 0, summed) AND armed median survival
  >= 0.8 x control median. Starvation = deathEvents
  cause 'starvation' via the polityfrag analyzer's
  deathCauses. Arm-only deaths reading: the per-seed
  excess clause above.
- SECONDARY (reported, not judged, both steps): wall
  numbers every run — wins, national / table
  (scaleRank), wave 4–5 unlocks (peak transitions)
  and facing (waveEngaged), median survival, wave
  reach 1–5, death-cause shares, ready days. Arc
  reach: not instrumented (stated, not faked). Table:
  not instrumented (stated, not faked).
- SENSE-TEST (SENSE-TESTING LAW): read the zombie-link
  transcripts (census) and any clear + aftermath
  transcripts (step 2) and judge them as a player
  (does a trust-0 bond sitting active read as neglect
  or as silence? does the faded line read as a
  consequence? does the aftermath read as a real
  re-courtship chance or a formality?).
- BALANCED PANEL (§15): the comparison is the PAIRED
  per-seed before/after on identical seeds (step-2
  armed vs control legs) — that pairing IS the panel
  discipline for this corpus. scripts/balance-panel.js
  is attempted as a supplement after the legs; it
  expects panel-format corpora, not diplo per-seed
  JSONs, so if it refuses for field-shape reasons the
  refusal is recorded honestly and the paired per-seed
  table stands as the comparison — no panel comparison
  is fabricated. Stated up front, per the brief: on a
  zero-delta pilot the panel returns review_required
  as a coverage artifact (insufficient / not_observed
  luck metrics on an 8-seed pilot), not a harm signal.
- TELEMETRY DEVIATION CHECK: attempted after the legs
  (node scripts/telemetry-check.js against
  hidden_files/telemetry-baselines/scale-wall.json);
  if the tool refuses for field-shape reasons (as it
  did on both 0930Z corpora), the refusal is recorded
  honestly, never fabricated, and the baseline is NOT
  rolled.
- The 8 seeds ARE the pilot/screening leg; do NOT
  expand to 12–16 on this worker's own authority —
  report the pilot verdict and let the coordinator
  decide on confirm.

## Metric review (placeholder — completed in the evidence file)

- The evidence file carries the completed metric review:
  what the metric proved, what it missed, and any revision
  proposed for the NEXT run (never applied in-run).
