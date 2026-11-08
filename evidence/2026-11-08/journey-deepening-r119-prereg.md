# Journey leg: DEEPENING (days 40–80) R119 — "THE LADDER, READ LIVE" — 2026-11-08

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r119 plays deepening, wrote 2->3
at run start with verified read-back ("3"). (Rotation history: establishment
r114 wrote 1->2 at 10:09Z this morning; landing r118 wrote 0->1; deepening
r118 wrote 2->3 last night — the file as read this run is the establishment
write, so no leg is skipped and no jump reason is needed.)
Base: master 246ce6dc2 at worktree creation (worktree registered 10:46Z;
sim-binddiag-b evidence + corpus on top). Run id:
laneA-20261108T1045Z (scheduled 04:45 CST 2026-11-08).
Policy: competent (r118 driver lineage, LISTEN in sittings — the r118 policy
decision stands: the competent player KEEPS sitting no-language holders and
listens). CONVO_DAYS [45, 60, 80], DAYCAP=100, death-aware stop.
Seeds: fresh 96701–96704. Horizon: DAYCAP=100, death-aware stop.
Smoke seed 96700 (outside the main band) x DAYCAP=45 proves the r119 driver
+ instruments before the main run; smoke outputs deleted after the check.

Freshness check for 96701–96704 + smoke 96700 (full check per the
2026-11-05 AGENTS.md lesson + local_seed_band_freshness skill — ALL dated
preregs + ALL dated .md + evidence filenames + seed-context patterns +
live processes, not just today's files): COMPLETED before the panel ran.
Word-boundary .md mentions of 9670x across evidence/: 0. docs/: 0.
scripts/*.js: 0. Filename hits for *9670*: none. Prereg hits for 967:
none. Live processes on 9670x: none. The band is fresh.

## The questions

### Q1 (PRIMARY) — THE STANDING LADDER, READ LIVE: DOES IT MOVE ON REAL DEEPENING VILLAGES?

**Basis.** Ladder leg 1 merged to local master this morning (69fc5207c:
`src/js/ladder.js`, thresholds cumulative 12/26/40, per-track cap 60% of
the NEXT rung's threshold, stage = highest rung whose capped total meets
its threshold, rungs nest; `villageLadder()` is a PURE READ, only
`ladderTick()` writes beat markers). Its proofs are rigged-state unit
proofs (cap 25/25, minting 34/34) — no real village has ever been read
through it. The deepening leg (days 40–80) is exactly where the Village
stage (12) and the Regional stage (26) should start showing, if the
thresholds are in reach of ordinary play. This run is the first live
read: no threshold, cap, or minting change — leg 4 owns calibration —
just the read, on the same competent policy and seeds the leg already
plays.

**Instruments (driver-only, single panel).** `ladderSnaps`: a
`Game.villageLadder()` read at days 40/50/60/70/80/90/100 and at seed
end, per seed — `{ day, stage, peakStage, counted, cap, tracks,
countedTracks, capped, shortfall, nextThreshold, detail }`. The read is
wrapped in try/catch; a throw is recorded as `{ day, err }` (never a
crash). The analyzer adds a Q1-LADDER section: per-seed stage
trajectory, per-track counted points, cap binds, shortfall at horizon,
stage drops (the ladder is LIVE, not ratcheted — deaths can pull a
stage down), and the minting breadth (which tracks ever mint > 0).

**Pre-registered verdicts (binding, panel-level):**
- **LADDER-OPENS** if ≥1 seed reaches Village stage (≥1) by day 80 on
  the live read = the ladder opens inside the deepening leg on ordinary
  play.
- **LADDER-MINTS** if all five tracks mint > 0 counted points on ≥1
  seed each = the ladder reads the whole village, not one track.
- **LADDER-SILENT** if 0 seeds reach stage ≥1 by day 100 despite
  villages alive = the thresholds are out of reach in-leg — a finding
  for leg 4 / the main session (thresholds or minting, not this run).
- **LADDER-BROKEN** if `villageLadder()` throws on any seed, or the
  read is internally inconsistent (counted ≥ threshold while stage 0,
  countedTracks summing wrong, cap not binding where the unit proof
  says it must) = a GAME defect; fix + proof test, before/after panel
  on the same seeds.
- **LADDER-LATE** if the first Village stage arrives only after day 80
  on every reaching seed = the ladder opens after the leg it should
  open inside; reported, not a fail — leg 4's calibration question.
- The verdicts are independent: LADDER-OPENS + LADDER-MINTS can both
  hold; LADDER-SILENT overrides OPENS (0 reaching seeds). A stage drop
  (peak > live at horizon) is reported descriptively in all cases.

### Q2 — TRUST, INSTRUMENTED: DOES THE DEATH PAYMENT REACH STRANGERS?

**Basis.** r116 carried question, mechanism verified in source (r118
prereg): the `playerDeath` wrap in `villager-agency.js:1484-1499` pays
EVERY roster member `min(12, floor(agencyScore(id)/4))` trust on EVERY
scholar death — `agencyScore` is earned without ever talking to the
scholar (achievements + expeditions×2 + monsterKills×8 + nodes +
tier×4). r116's Elif 39→92 (+53 over 9 deaths, ~+6 each) matches the
formula. The panel check was NOT instrumented in r118 ("the driver
records no trust time-series"). This run instruments it. The design
call (fix or not) stays with the main session — this run measures and
reports; no trust-wrap change.

**Instruments (driver-only, single panel).** `trustDeaths`: the
runSeed `playerDeath` wrap (which already records day + cause) also
records trust-before/after (shallow copy of `state.village.trust`),
old/new bearer id, and the per-member delta — the delta IS the
payment, observed, not recomputed. `trustSnaps`: a daily snapshot in
`policy.daily` — day, scholar id, scholar health, trust map copy,
`v.fallen` length + last fallen entry (day + name). `mantlePasses`
(derived in the analyzer from trustSnaps + trustDeaths): per
succession, death day (fallen entry day), first day the successor is
bearer, and any day a bearer with health ≤ 0 stays bearer.
**Contact join:** the analyzer joins each death-day gainer against
prior scholar contact — bond instrument `convoEvents` talkTo targets
+ `talkedSittings` before that death day. A gainer with zero prior
contact is a stranger paid for a death they never witnessed.

**Pre-registered verdicts (binding, panel-level):**
- **TRUST-PAID-TO-STRANGERS** if ≥1 death pays trust to a villager
  with zero prior scholar contact = the Elif mechanism fires in the
  wild; reported to the main session with the counts (how many
  strangers, how much trust, over how many deaths). No fix this run.
- **TRUST-EARNED-ONLY** if every death-day gain goes to villagers
  with prior contact, or all gains are 0 = the payment is contact-
  gated in practice (or never fires); the r116 mechanism stands as
  source-only.
- **TRUST-MOVES-ELSEWHERE** (descriptive, either way): trust changes
  on non-death days — deeds earning trust outside deaths. Name the
  writers if the snapshots show any.
- **MANTLE-LATENCY** (descriptive): the distribution of
  (first-day-successor-bearer − death day). Any latency ≥ 2, or any
  day a health-≤0 bearer stays bearer, is a LOUD finding (r107 seed
  1009: Wanjiru d24 → Felicia d26, latency 2). Latency 0–1 with no
  dead-bearer day = the r107 case does not reproduce in-leg on this
  panel (reported, not re-judged).

## Secondary (carried, re-judged fresh)

- **SURV-CONTROL-4 (9th control point):** lineage r107 2/4, r108 3/4,
  r109 2/4, r110 2/4, r113-before 4/4, r113-after 2/4, r114-before 4/4,
  r114-after 3/4, r116-before 4/4, r116-after 3/4, r118-before 2/4,
  r118-after 2/4. Verdict rule as r110's: >=2/4 survive -> funnel
  unchanged; 0/4 -> base moved (bisect job, no claim about which
  change); 1/4 -> ambiguous. NOTE: base moved since r118 (ladder leg
  1 merged 69fc5207c + neutral-proof refreshes + sim-binddiag-b
  evidence). Any funnel move is reported, not attributed without a
  bisect.
- **P-KEEP (revised, minus bare "forgot"), RE-ASK (4 variants +
  origin split), DEBRIEF-CAPTURE, B-SIT / B-FOLLOW / B-LEAD,
  FIZZLE-WATCH, S-TRACE, D-THING (revised per r110 metric review),
  G-STICK (distribution, not stuck-count), G-SENSE, AWAY-LINE (r113
  Q2, regression watch), Q1-REQUESTS (r113, carried),
  INVITE-REPLAY WATCH (hand-read), V-INIT (bondSittings count —
  should a villager walk up and ask face-to-face? r118 after-panel
  recorded the first ever, 1 sitting — a sighting, not a pattern),
  r110 nits #3/#4/#6:** same scans as r118.
- **Regression watches (r114/r118 fixes, both panels in r118 — now
  single-panel re-proves):** langGate: 0 'none' offers/decisions
  expected; replay scan: 0 replays expected; menuFlip: 0 flips
  expected (r118 fix A holds); safety goalLine capture > 0 expected
  (r118 fix E holds). A regression is a LOUD finding, not a
  re-verdict — r118 already judged the fixes FIX-WORKS / ARC-FIRES /
  GOALS-FIXED.
- **All-tracks read (Steve 2026-11-06 11:48 CST, REWARD ALL PATHS):**
  the village assessment carries a descriptive all-tracks read
  (goal-top distribution per seed, mapped to tracks).

## Carried context (reported, not re-judged)

- r118 Q1/Q2 fixes are IN the base (listen-menu flip fix A–D +
  indoor goal lines fix E, commit 5f85ea5f, live in the Nov 7 ship):
  the r119 single panel re-proves them as regression watches above.
- One-brain order (Steve 2026-11-06 17:12 CST): noted as context.
  Bond proposals and link raises are a second decision channel that
  never reaches the one scorer — a later-phase fold-in, per the
  order.
- Gating freeze (2026-10-27 16:53) stands — no threshold, bar,
  price, or gate change in this run. Perception law (2026-10-28)
  stands — all instruments read-only; pickers press offered menu
  items only. DELIVER OVER MEASURE (2026-11-01): a code change lands
  ONLY if a defect is proven in game code with a before/after proof
  test.
- The r118 driver finding (dead npcComm guards) is ANSWERED by the
  r118 policy decision, not re-litigated here.
- Ladder leg 2 is in progress in a sibling worktree
  (build-ladder-leg2, active at run start): seat surgery in
  table.js/deedGateReady + capstone delivery + feast `bundle` flag.
  This run reads leg 1's ladder only and touches none of leg 2's
  files. If leg 2 lands mid-run, the panel's base is the prereg base
  (246ce6dc2) — the panel is judged on that base, and any leg-2
  landing is noted, not chased.
- Knowledge goal lines stay GOALS-FAULT by design (the quiet-beat
  design stands: SEEK gets no new beat) — reported, not fixed.

## What this run does NOT do

- Does not change ladder thresholds, the per-track cap, minting
  divisors, or any ladder formula (leg 4 calibration owns those).
- Does not change the playerDeath trust wrap (Elif) — mechanism
  measured only; the design call stays with the main session.
- Does not change staging (stageBondProposal / stageLinkRaise), the
  warmth window, the 3-day expiry, the 14-day refusal cooldown, or any
  bond probability.
- Does not change the r114 language gate, the decided-ask clear, or
  the r118 listen/goal-line fixes.
- Does not add a SEEK beat (quiet-beat design stands).
- Does not touch win prices, deed gates, or any balance number.
- Does not re-judge wave 4 (r90), beast-trick teaching (r92),
  standing/scale two-rulers (r93), villager goals as a system, or the
  standing/scale question. Carried as context only.
- Does not re-score the r118 panel. r118 stands as computed.

## Seeds, pilot, shape

- Panel: fresh seeds 96701–96704, DAYS=100 (DAYCAP), OUTDIR
  deepening-r119 (goal hidden_files evidence/2026-11-08/).
- Single panel (no before/after — nothing is fixed yet; if Q1
  returns LADDER-BROKEN, the fix + before/after panel becomes a
  second phase on the same seeds, pre-registered then).
- PILOT FIRST: smoke 96700 x DAYCAP=45 proves the r119 driver +
  instruments before the main run (seeds run, snapshots present,
  ladderSnaps + trustSnaps + trustDeaths present, transcripts
  written; smoke outputs deleted after the check). Then 2-seed pilot
  (96701–96702) before expanding to 4 — the pilot validates the
  ladder + trust instruments on real output before the panel expands.
- Shape: prereg commit → proof tests (ladder-snap + trust-death +
  analyzer joins, RED before the instruments exist) → smoke → pilot
  (2 seeds) → panel (4 seeds, ONE SEED PER PROCESS — r116 metric
  review #3) → analyzer verdicts → run note → gate → merge.
- Proof tests: scripts/test-journey-deepening-r119-instruments-20261108.js
  (ladderSnap shapes a villageLadder() read incl. throw case;
  trustDeath delta join; mantle-latency join incl. dead-bearer day;
  analyzer Q1/Q2 sections on synthetic panels).

## Metric review (filled at closeout, never mid-run)
- (to be filled)

## Infrastructure notes
- Worktree registration slow (~9 min, 10:45–10:54Z) under sibling load
  (Lane B occurrence registering in parallel); `git status` in the
  worktree took 4+ min (D-state restat under load) — not a flap
  (plain + O_EXCL writes verified OK 11:00Z). Heartbeat landed
  10:46:21Z.
- Lock created 2026-11-08T10:43:49Z, run_id 2026-11-08T10:43:49Z.
  NOTE (r118 flag, still true): this run held NO registered tree
  while registration was in flight, so the overlap guard's registry
  check would have judged it dead — a later Lane A occurrence could
  have deleted the lock mid-wait. Flagged; the lock survived (no
  Lane A occurrence ran 10:43–10:54Z).
