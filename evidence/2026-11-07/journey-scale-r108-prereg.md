# journey-scale r108 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-20261107T0845Z (scheduled 08:45 CST 2026-11-07).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@8ee8dcfb6 at first scored seed (r114 deepening merge:
langGate bond/link decisions + clear decided asks).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — raise answers read only live
pending raises from named villagers, answered in a real conversation
with the raiser; direct proposals read only villages the scholar knows.
**DELIVER OVER MEASURE (2026-11-01):** this run builds and tests the
lever r107 named — it does not re-prove the ask question.

## Standing context (read before scoring)

- **r107 (this morning, band 97001–97004, policy scalecourt-morntrace3
  UNCHANGED): ASK-HAPPENS.** The ask fires the first allowed day on
  every seed (known d4, attempt d25, link d25, accord d26, Dawn d47,
  identical on all 4 seeds). Regional 4/4; national 0/4, global 0/4;
  lesser seat priced on 1/4 (97001, d56), never sat. The binding gate
  after the ask is **survival, not the ask**: no link ever reaches the
  national bar (30 days seasoned + trust 40) because the villages end
  first (hunger scatter d54–93; road deaths d131–133).
- **Blank named by r107 (this run's lever): the villagers' link raises
  all die unanswered.** Villagers raised link ideas on every seed
  (3–5 raises each) and **all 16 expired** — 0 accepted, 0 declined, 1
  still pending when 97002 ended. The game stages the raises; the scale
  driver never answers them. Same class as r113's Q1 before-panel
  (driver-side, not game-side).
- **sim-linkdrive-b (Loop B, landed today, GO):** on the STAGED
  substrate the same class of lever works — 19 raise answers in real
  conversations (18 linked on the spot), links 0 → 41, regional 0/8 →
  8/8, lesser seats 0 → 4/8, wave-5 faced 1/8 → 4/8. Its raise-answer
  shape (in-conversation `link:accept`, never the bare verb, never a
  decline, courtship-ready det sub ≥ 55) is the shape this run ports
  to the scale driver. This run does NOT copy linkdrive's propose/tend/
  hold steps — the scale driver already proposes (d25) and already
  answers counters/accords; only the raise step is added.
- **Base drift since r107:** r114 landed after r107 (langGate: bond/
  link choices gated on shared words; decided asks cleared so a later
  goon cannot re-speak them). The scale driver's raise answers pick
  `link:accept` in conversation, which r114 touches — so the
  before-panel is REPLAYED on this base, not assumed from r107's
  corpus. Verdicts are judged against the replayed baseline; r107's
  corpus is the reference.
- **Band reuse (deliberate, §15 balanced panel):** seeds 97001–97004
  are REUSED — the same matched seeds before/after, exactly as
  linkdrive-b reused 53001–53008. Freshness check: the band is named
  in exactly one earlier prereg (journey-scale-r107-prereg.md, today)
  and in no forbidden/contaminated list, screen, or extension band
  (grep over evidence/*/sim-*-prereg.md + evidence/2026-11-07/
  journey-scale-r107-prereg.md; the only other hits are float/kcal
  values, e.g. `"pantryFreshAfter":97004`). The reuse IS the design:
  r107's corpus is the before-panel, this run's replay is the guard,
  the armed leg is the after-panel. No new band is consumed.

## Q1 — DOES ANSWERING LINK RAISES MOVE THE SCALE OUTCOME DOWNSTREAM? (binding)

New policy `scripts/policies/scalecourt-nogate-morntrace3-linkraise.js`:
wraps the FROZEN scalecourt-morntrace3 policy (unmodified) and, after
`scalecourt.daily` each day, runs ONE raise step — at most one raise
answer per day, oldest pending raise first:
- Raiser must be a living roster villager; raised village must exist
  and be unlinked; detJudge sub ≥ 55 (the linkdrive courtship-ready
  rule, reused via require — not a copy).
- Answer happens IN CONVERSATION with the raiser (`talkTo` + up to 5
  real turns via `chooseConversationChoice`; `link:accept` only when
  offered; answers the villager's question first, continues their
  story, navigates to the subject once — the linkdrive shape, reused
  via require). NEVER the bare `acceptLinkRaise` verb, NEVER
  `link:decline` — a decline is the player's call, not the policy's.
  A not-ready raise is left pending (it expires; the villager may
  re-raise after the 14-day cooldown).
- All other policy behavior is byte-identical to r107: same pilgrimage
  climb, same day-25 propose, same counter/accord/national/global
  answers, same tribute/demand handling. Zero src/js changes.

Driver `scripts/journey-scale-r108-20261107.js` (r107 driver clone,
labels/seeds/EVIDIR only + linkraise stats in the census + the r107
console-line nit fixed: the per-seed line printed `proposed=0` because
it read `ctx.proposedLead`, which the policy never sets; it now reads
`ctx.proposed`). Two legs on identical seeds 97001–97004, DAYCAP=180,
death-aware:
- **BASELINE leg** (`LINKRAISE=0`, EVIDIR `journey-scale-r108-baseline`):
  r107 driver behavior, plain morntrace3 policy, replayed on this base.
- **ARMED leg** (default, EVIDIR `journey-scale-r108`): linkraise policy.

**Verdicts (checked in order, judged against the REPLAYED baseline):**
- **GO** — national ≥ 1/4 OR a lesser seat sat ≥ 1/4 on the armed leg.
  The downstream wall moves.
- **PARTIAL** — raises answered ≥ 4 total AND links ever ≥ 12 (vs
  before 8) AND regional 4/4 maintained, but no national and no seat
  sat. The ask works; the wall is seasoning/survival, not the ask.
- **NO-GO** — raises answered < 4 OR links ever ≤ 8. Answering does
  not change the played game (raises are for not-ready villages, or
  the talk fails, or the answers do not stick).

**What counts as interesting:** a GO (first national / first sat seat
on the scale driver); a PARTIAL with a named downstream gate (natGate
tells which — RUNG / NO-SHAPE / survival); a NO-GO with a named cause
(not-ready vs talk-failed vs not-offered, from the policy counters).

## Purity guard (binding)

The only policy difference between the legs is the raise step, which
acts only when a raise is pending and ready. Divergence check: from
the reggate daily rows, the first day the armed leg differs from the
replayed baseline (gate / known / links / proposeCalls) must be ≥ the
first raise-talk day (first day the policy opened a conversation for a
raise, from the policy events). If the legs diverge BEFORE any raise
talk, STOP — the instrument or the policy is not pure. The baseline
replay must reproduce r107's shape (regional 4/4, Dawn d47, propose
1/seed, raises 0 answered) within stream noise; a material baseline
divergence is itself a finding (r114 drift) and is reported before any
armed verdict is claimed.

## Secondaries (report-only, not judged)

- **National/global staging** (natGate watch, as r103–r107): rank
  timeline, shape, dissolve / re-stage, viewership at global.
- **Table approach** (tableWatch): seat priced daily, arc, tableWaiting /
  tableAnnounced; seats sat.
- **Village assessment:** census in plain words — who lived, who died,
  what they knew, what was missing; end-cause per seed (hunger scatter
  vs road deaths vs wave deaths).
- **People check:** CONVO_DAYS [90, 120] transcripts read in full
  (SENSE-TESTING LAW) — do villagers act like people at the scale
  horizon? Plus the raise-answer conversations themselves (from the
  capture): does the accept read as a real agreement, not a menu press?
- **D-THING / bonds / betrayals:** carried from the r106 analyzer as
  report-only counts.
- **Raise ledger:** per seed — staged / answered-linked / answered-
  counter / skipped-not-ready / skipped-no-raiser / talk-failed /
  not-offered / expired, from the policy stats + raiseHistory.

## Method

- Driver `scripts/journey-scale-r108-20261107.js` (r107 clone + policy
  switch + linkraise stats + console-nit fix). Analyzer
  `scripts/analyze-journey-scale-r108-20261107.js` (r107 analyzer +
  before/after section over the baseline + armed dirs; the regional
  corpus JSONs are also readable by
  `scripts/regionalstep-analyze-20261107.js` directly). Proof
  `scripts/test-journey-scale-r108-linkraise-20261107.js` (wiring:
  policy composes scalecourt daily unchanged; raise step skips
  not-ready / dead raiser / already-linked; in-conversation accept
  forms the link on a fake Game; live smoke leg on seed 97001 in /tmp
  asserting 0 policy errors and stats recorded). Proof green BEFORE
  any scored seed runs.
- PILOT GATE: baseline seed 97001 runs first. Crash, recorder errors
  > 0, or a reggate file with 0 rows → STOP, do not score the band.
  Then armed seed 97001; then the remaining seeds, baseline leg fully
  before the armed leg (so a crash mid-band leaves a complete baseline).
- Telemetry: `telemetry-check.js` against
  `telemetry-baselines/scale.json` after evidence is written (metrics:
  firstCourt, watchers, tableTele, fightsTotal, fightsByWave.4,
  maxGameDay). Any LOUD line is a same-run investigation item before
  the baseline rolls forward. (r107 caveat stands: the per-seed files
  may not carry those metrics in resolvable form — report honestly,
  do not roll a zeroed baseline forward.)
- **Gate note (carried, not hidden):** the full `check.js --quick`
  gate will NOT run inside this run — the r114 gate (284/6, all
  adjudicated pre-existing) ran on this exact master, and this run
  changes ZERO src/js (scripts + evidence only). The gate is owed on
  the next run that touches src/js; the r108 proof tests + pilot
  evidence are the regression cover, as for r107 and regionalstep-b.

## Pre-registered metrics (bind the run — §14)

- PRIMARY: per-seed raises answered/linked/countered/skipped (policy
  stats) + links ever + first-link day + Dawn day + nationalLive day +
  globalLive day + seat sat (y/n/day) + regional 4/4. A miss is NO-GO,
  never re-scored against a friendlier metric mid-run.
- SECONDARY (report-only): survived days, end cause, pop alive/end,
  D-THING named/testable, bond sittings answered, transcript senseless
  count (must be 0 to claim the people check clean), raise-answer
  conversation senseless count (must be 0).
- Every run note carries a "metric review" section; if a metric proves
  wrong, the revision is proposed for the NEXT run.
