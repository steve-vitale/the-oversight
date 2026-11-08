# sim-binddiag-b — prereg: the national Binding / LEAD realm formation behind the full seat

Run: fleshout-loop-b-20261108T0230Z (Loop B, second axis). Worktree:
`~/workspace/worktrees/sim-binddiag-b` (branch sim-binddiag-b, cut at master
e9399e09e). Axis: scale-onramp / winnability chain (converging, NOT converged).
Tracker blank (3) from the 0730Z winnability round
(evidence/2026-11-08/sim-winnability-round-0730.md): "national Binding (LEAD
realm formation) behind the full seat".

## Canon + code read first (before any sim)

- docs/CANON.md, docs/TABLE.md, docs/SCALE.md, docs/COHERENCE-SPINE.md,
  docs/godpath/STEVE-ANSWERS.md. No canon invented.
- Prior decompositions, NOT re-measured: evidence/2026-10-24/sim-fullseat-diag-a.md
  (2115Z: full seat 0/8 on tableseat band; binding blockers w5 8/8, w4 6/8, w3
  6/8, foodDeeds 6/8; national 7/8 ever, 6/8 final) and
  evidence/2026-10-24/sim-standing99-diag-a.md (2215Z: standing-99 pin is the
  defer4 hold, bound solely by living veterans 0/1 on 7/7 pinned seeds; wave-5
  block is defer5 at 199, veterans 0/2, rd5 ready 0 days on 8/8 seeds).

## NAMING CORRECTION (code authority — the task's phrase conflates two beats)

"The Binding" is the **BELONG** road's beat (swear/serve/walk), NOT the LEAD
road's. Citations: `src/js/hierarchy.js:2489`
(`belong: 'The Binding'` in the exiled-answerer beat-name map),
`hierarchy.js:2541` (stageNationalBeat comment: "BELONG — 'The Binding'
(swear/serve/walk)"), docs/SCALE.md ("BELONG → The Binding"). The LEAD
road's beat is **"The First Court"** (feast/host/cold) — `hierarchy.js:2541`,
docs/SCALE.md. This diag covers the whole national pipeline with SHAPE
ATTRIBUTION at every stage, so the LEAD question is answered by shape: which
road actually stages, answers, and delivers national in sims — LEAD (First
Court), BELONG (The Binding), covenant, or trade — instead of assuming the
LEAD road is the one that fires.

## The gate, exactly (code authority)

LEAD realm formation — `src/js/hierarchy.js`:

1. **Links form.** Substrate courtship proposes from day 25
   (`scripts/policies/leanlinkrescue.js:104`, `proposeLink(vid,
   {asSubordinate: false, tributeKcalPerWeek: 4000})`). NOTE: the counter
   band flips the role — `_stageCounter` (`hierarchy.js:700`) sets
   `asSubordinate: true` ("They won't bow to Haven. But they'll TAKE Haven"),
   and leanlinkrescue answers counters accept/sweeten, so links can land
   Haven-SUBORDINATE (the BELONG road) even though the proposal asked for
   Haven-primary. Shape attribution must read the formed link's real role,
   never the proposal's intent.
2. **Seasoning.** `_linkSeasoned` (`hierarchy.js:233`): 30+ days old AND trust
   40+ (conquered: the season, not the trust). (SCALE.md says "28+ days" in
   one comment; the function enforces 30 — the function is the authority,
   and the recorder reproduces the function.)
3. **Polity qualifies.** `polityOf(HOME)` (`hierarchy.js:2196`): ≥3 active
   SEASONED Haven-primary subordinates = a realm (four fires under one head);
   shape `lead`, or `conquest` if every subordinate was taken by force.
   `_havenPolity()` (`hierarchy.js:2245`) priority: lead → belong →
   covenant → trade. BELONG needs Haven subordinate in good standing
   (trust ≥50, arrears 0, link ≥14d) to a primary whose realm holds ≥4
   villages; covenant/trade need ≥3 seasoned peer links each.
4. **Staging gate.** `_checkNational` (`hierarchy.js:2425`): stages the beat
   only when a polity qualifies AND `networkLive` AND (day − networkLiveDay)
   ≥ 30 (one rung per season, scale-pacing 2026-10-11); never when
   `scaleRefused`, never while the answerer is exiled, never while a beat is
   already pending. Walking away from a covenant/trade beat defers only that
   shape 14 days (`state._natDefer`); walking from BELONG's Binding refuses
   the scale permanently.
5. **Answer.** `answerNationalChoice` (`hierarchy.js:2598`): the LEAD branch
   re-checks ACTIVE subs ≥ 3 (not seasoned — if the realm dissolved before
   the court sat, the beat dies aloud, "The court never sits"). Any
   understood answer sets `nationalLive = true` + `nationalDay` +
   `nationalFirstDay` + `nationalShape` (`hierarchy.js:2926`). The substrate
   answers lead→feast (5,000 kcal, proportional trust if the pantry is
   thin), belong→swear, covenant→pact, trade→sign
   (`leanlinkrescue.js:67`).
6. **Persistence.** National is a LIVE state, not a title
   (`hierarchy.js:2428`): the moment `_havenPolity()` is null with no pending
   beat, `nationalLive` and `globalLive` clear aloud and the pending global
   summons dies. A realm that dissolves takes the rank with it (2115Z seed
   73644 decayed national → regional).

## How the Binding step interacts with the veterans lock (code-level answer, to be confirmed empirically)

The Binding/court pipeline reads NO standing input anywhere:
`_checkNational`, `stageNationalBeat`, `answerNationalChoice`, `polityOf`,
`_linkSeasoned` never call `standing.js`, `villageStanding`,
`waveUnlockReady`, or veterans. **The Binding step sits BESIDE the veterans
lock, not behind it.** The dependency runs the OTHER way: standing's
diplomacy counts a seasoned link ONLY inside a regional+ polity
(`standing.js` `_linkRegionalPlus`: a LEAD sub link counts iff
`polityOf('haven')` exists; 3 links = 102 only once the realm exists). So
the Binding is UPSTREAM of the standing raw sum that the veterans lock then
holds at 99 (defer4) / 199 (defer5). The full seat needs BOTH legs —
national (Binding) AND wave bars (veterans lock) — and on the tableseat
substrate the Binding leg already cleared (national 7–8/8 in 2115Z/2215Z)
while the wave leg bound. This diag decomposes the Binding leg's own
pipeline stages, which neither prior diag did: it does NOT re-measure the
veterans lock, it measures the funnel the Binding leg runs through and
whether national, once won, survives to the table.

## Composition choice (decided before sweeping, documented per brief)

- REUSE `scripts/policies/tableseat-nowait.js` unmodified — leanlinkrescue
  courtship (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no
  wait leg. Same substrate as 2115Z/2215Z, which reached national 7/8 and
  8/8 — a substrate that never reaches national cannot measure Binding (and
  the doorwalk/takeseat frozen-instrument baseline leg, national 0/16 by
  construction, is NOT used as the judge here).
- `fullseat-diag.js` is NOT reused: it stores no pipeline trajectory, no
  link-role counts, no beat staging/answer events, and no national-loss
  events — it cannot answer which pipeline stage blocks. The new recorder
  below reproduces only the pure-read definitions it needs.
- NEW recorder `scripts/policies/binddiag-b.js` (`BINDIAG=1` gate; unset
  delegates byte-identically). PURE-READ, modeled on standing99-diag.js:
  it NEVER calls `villageStandingTotal()` during a run (that function
  releases peaks and emits hold beats — side effects); it computes the
  standing breakdown from `villageStanding()` + `waveUnlockReady(4/5)` +
  `state._standingPeakWave`, and validates the computed gated total against
  the engine's gated total only AFTER runDays. It writes nothing to game
  state and draws no RNG. Pipeline reads are pure computations over
  `hierarchyState()` links + `Game._linkSeasoned` + `state.foreignPolities`
  (read, never written) + `state.pendingNational` / `nationalLive` /
  `scaleRefused` flags + `scaleRank()`. It does NOT call `polityOf()` (which
  initializes `state.foreignPolities` on the non-HOME branch) — LEAD
  qualification is reproduced directly from the seasoned-sub count, BELONG
  from link trust/arrears/age + the foreign-polity size read from state.
- The recorder samples AFTER the inner daily delegates (same convention as
  fullseat-diag/standing99-diag: end-of-day samples).

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait — leanlinkrescue courtship
  (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no wait leg.
- Baseline: tableseat-nowait, `BINDIAG` unset. Own baseline replication (8),
  NOT another arm's corpus.
- Armed: tableseat-nowait wrapped with `scripts/policies/binddiag-b.js`
  (`BINDIAG=1`).
- Seeds (pilot): 76401–76408. Freshness verified at run start (see below).
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Primary (DIAG-GO, ALL must hold):
  1. 8/8 armed configs produce a full daily Binding trajectory (link-role
     counts, seasoned-sub count, per-shape qualification, pendingNational
     events, nationalLive transitions, standing + rd4/rd5 alongside) with
     first-days for every pipeline stage and an end snapshot;
  2. a ranked binding-STAGE list: for each pipeline stage (links formed →
     subs formed → subs seasoned → polity qualifies → beat stages → beat
     answered → national persists to end), the count of seeds reaching it
     and the first seed-blocked stage, with median first-days;
  3. shape attribution: which shape staged first / delivered national on
     each seed (lead vs belong vs covenant vs trade), and the count of
     national-lost events after nationalLive first set;
  4. det-gate G1 PASSES (see below);
  5. recorder neutrality G2 PASSES (see below);
  6. corpus integrity G3 PASSES (see below).
  Any full seat reached is a breakthrough — entered-full count reported
  prominently. (Expected 0/8: the wave leg is already proven binding; this
  diag judges the Binding leg, not the seat.)
- Cost bar (diagnostic, reported even for a diag): starvation totals,
  median days, baseline vs armed.
- Proof gates:
  - G1 det-gate: with the recorder unset, wrapped policy == unwrapped
    policy on one seed (days/gameDays/ts counters identical, no
    `_binddiag` surface on ctx).
  - G2 recorder neutrality: for ALL 8 seeds, baseline vs armed identical
    on days/gameDays/ts counters/starvation (a daily recorder that leaks
    anywhere is NO-GO).
  - G3 corpus integrity: 16/16 rows; every armed row carries the full
    daily trajectory + stage first-days + end snapshot; every baseline row
    carries a post-run pure-read end snapshot (baselines cannot carry a
    trajectory without the recorder — that would make them armed — so the
    trajectory clause applies to the 8 armed rows, stated here before
    sweeping).
  - Engine-gated validation: the recorder's computed gated standing total
    equals the engine's `villageStandingTotal()` at run end on every armed
    seed (same validation as standing99-diag).
- Landing rule: DIAG-GO → this run's commit is instruments + evidence +
  corpus (new default-OFF recorder policy; no game-code change, no default
  flips). Det-gate failure → NO-GO, instruments + evidence only, verdict
  recorded.
- Balanced panel (§15): attempt `scripts/balance-panel.js` compare on the
  corpus; if it throws (known 1955Z/2115Z/2215Z failure on per-seed rows),
  record exactly why + sweep-compare tables as the §15 comparison.
- Sense-testing law: one NON-MEASURED narration-on replay read of a seed
  where the pipeline stalls — judge meaning/coherence/consequences, never
  just counts: does the game ever TELL the village which Binding stage it
  is stuck at, or does it stall silently?

## Seed-band freshness (per local_seed_band_freshness skill — full search, not just today)

- Chosen band: **76401–76408**.
- Search scope: every dated prereg under `evidence/` (`evidence/*/sim-*-prereg.md`),
  every dated `evidence/*/sim-*.md`, seed filenames anywhere under
  `evidence/`, and `scripts/` — run 2026-11-08 ~08:45Z.
- Result: **0 hits** in all preregs, **0 hits** in all dated sim .md files,
  **0 seed-filename collisions**. Two spurious substring hits, both
  non-seeds: `s17640` corpus files (seed 17640, not 76401) and a hex hash
  in `scripts/phone-frame-proof.json` (`764b1d5e776401c1…`, a SHA, not a
  seed).
- REJECTED band, recorded so the next worker does not repeat it:
  **73701–73708** — named in 2026-10-27 preregs (sim-fullseatgate-a,
  sim-w5block-a, sim-w5twokey-a, sim-waitlong-a) and used by
  `scripts/sweep-deathrow-b.js`. Also NOT reused: 73641–73648 (2115Z),
  73671–73678 (2215Z).

## Instrument

- `scripts/policies/binddiag-b.js` (new recorder, `BINDIAG=1` gate).
- `scripts/test-binddiag-b-sweep.js` (sweep + --detgate + --sense modes),
  modeled on `scripts/test-fullseat-diag-sweep.js` (loadGame/setupGame/runDays,
  per-config incremental corpus writes via
  `scripts/sim-postunlock2-b-writer.js`).
- `scripts/test-binddiag-b.js` (proof test: pipeline-stage computation on
  synthetic link sets, recorder purity on a mock Game).
- Corpus: `evidence/2026-11-08/perseed-binddiag-b/` (16 rows + summary.json).
- Evidence: `evidence/2026-11-08/sim-binddiag-b.md` (with metric review +
  wall numbers: national / table / wins, wave 4–5 unlocks, median survival).

## Flap protocol

Probe O_EXCL file creation (`git update-ref refs/heads/probe-sim-binddiag-b
HEAD` then delete it) before every sweep and every commit; if the probe
fails, wait and retry — never force ref surgery during a flap. Heartbeat the
tree every ~30 min (`bash scripts/worktree-heartbeat.sh sim-binddiag-b`); if
the heartbeat script hangs >2 min, kill it and continue. Probe OK 08:43:51Z
at prereg time.
