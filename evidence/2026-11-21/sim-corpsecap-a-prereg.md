# sim-corpsecap-a — PREREG (frozen)

**Arm:** sim-corpsecap-a · **Loop A run:** fleshout-20261121T2315Z, arm 1 of 3
**Axis:** scale-onramp · **Type:** DIAG + conditional LEVER — corpse-cap gun sink
**Base master:** `c55bc8503` (worktree `~/workspace/worktrees/sim-corpsecap-a`;
`git fetch origin master` 2026-11-21 ~23:20 UTC: fetched tip `cb20cd650`
is an ANCESTOR of this HEAD — the worktree already sits on the current
master tip; no rebase was needed at cut. The brief's "70d9dda36" does not
match the fetched tip; the fetched tip governs.)
**Branch:** `sim-corpsecap-a`
**Frozen:** 2026-11-21 ~23:25 UTC, before any judged sim run. No judged sim has run.

## 1. The question (from the brief)

sim-grantrate-a (DIAG-GO, evidence/2026-11-21/sim-grantrate-a.md §4/§6)
found the one gun loss on its band, and named the mechanism: seed 107237,
amina_diallo wins a searcaster by kill loot on day 71 (0 cells), dies
"the wild" day 87, and the gun sits on her corpse (`corpse_87_b1n8dn`,
unburied, unlooted) for **62 days** — through day 148. On day 149 the gun
total falls to 0 with no corpse-take ever recorded. The mechanism, read
from code: the corpse list is capped at 40 — on overflow the oldest
fully-decayed (stage-4) corpse is spliced out of the list, items and all
(`corpses.js:248-253`, the ONLY corpse-list removal). 107237 had 106
deaths by day 149 — the list overflowed constantly. An unrecovered corpse
gun has a hard expiry at the cap. The vanishcause arm closed the
UNKNOWN-sink question (every gun located every day on its band); the cap
is a KNOWN sink, still unquantified and unlevered.

This arm quantifies it on a fresh band, then levers it only if the diag
finds a real loss:

- (a) DIAG: cap-cull events, guns lost to cap culling, gun-days stranded
  on corpses, per seed.
- (b) LEVER (conditional): exempt searcaster-bearing corpses from the cap
  splice, judged arm vs ctl on identical seeds.
- (c) SENSE: read transcripts / villager behaviour around corpse recovery
  where relevant; judge meaning, not just counts.

## 2. Code-read priors (from code on this base — hypotheses, not conclusions)

Canon: docs/CANON.md read. **No canon doc covers corpses, the corpse
cap, or corpse looting** — the CORPSE SYSTEM header in `src/js/corpses.js`
("bodies persist", "real-time decay", "looting has weight", "death is
knowledge") is the design statement; the 40-cap and the stage-4 splice
are implementation, not a Steve design. Said here rather than inventing
canon.

- `registerDeath(opts)` (`src/js/corpses.js:148`): builds the corpse
  (`{ id, kind, villagerId, monsterId, dayDied, cause, items, looted,
  buried, ... }`), pushes it onto `this.corpses()`, then:
  ```
  // bones persist as markers, but cap the list
  if (list.length > 40) {
    const idx = list.findIndex(c => this.corpseStage(c) === 4);
    if (idx >= 0) list.splice(idx, 1);
  }
  ```
  The splice removes the FIRST (oldest) stage-4 corpse, items and all.
  It is the ONLY corpse-list removal in the code: burial only sets
  `buried=true` and keeps the items; `recoverBearer` only moves the
  corpse's node; `_corpseTakeStack` zeroes taken item stacks in place.
- `corpseStage(c)` (`corpses.js:93`): days since death vs STAGES
  (`fresh <1d, stiff <2d, bloating <4d, rotting <8d, bones ≥8d` — stage 4
  is 'bones', `until: 1e9`). Ash corpses are stage 0 forever and are
  never splice candidates. So a corpse becomes cullable 8 days after
  death, and the cap culls the OLDEST bones corpse on each overflow.
- Static prior: a gun is lost to the cap only if (i) a searcaster ends up
  on a corpse, (ii) it sits unrecovered ≥ 8 days, and (iii) a death
  overflows the list while it is the oldest bones corpse. Grants are
  ~0.6/seed (grantrate band), holders die rarely, and the scholar
  recovers some corpses — so the expected band rate is **0–1 cap gun
  losses per 8 seeds**. The diag may honestly find 0; the verdict table
  (§6) handles that without re-scoring.
- Lever shape (conditional, NOT built unless the diag GOes): in the
  splice branch, prefer a stage-4 corpse whose items carry NO searcaster;
  only if every stage-4 corpse carries one, splice the oldest stage-4
  anyway (the cap must still bound the list — never let it grow
  unbounded). Env-gated `CORPSECAP=1`, node sims only
  (`typeof process !== 'undefined' && process.env && ... === '1'` —
  same pattern as GUNRATE in `contests.js:218`). Zero RNG draws; the
  splice choice is deterministic on the list. Default OFF = the old
  game.
- Gun census reuse: `gunLocationsOf` (grantrate driver, copied) locates
  every searcaster daily (equipped / carried / stashed / scholar pack /
  scholar equipped / stash / corpse). A cap gun loss reads as: gun total
  falls AND a cull event the same day names a corpse carrying it.

## 3. Band freshness (local_seed_band_freshness skill)

- **Band: 107271–107278 (fresh).** Searched every prereg under
  `evidence/*/sim-*-prereg.md` for `10727[1-8]|107269|107270` — zero
  hits. Searched `evidence/*/sim-*.md` for `10727[1-8]|107269|107270` —
  zero hits. Searched the goal `hidden_files/sim-findings.md` and
  `hidden_files/convergence-tracker.md` for `10727[1-8]` — zero hits.
  Forbidden bands from the brief (106751–106766, 107221–107228,
  107191–107198, 107131–107138, 107111–107118, 107091–107098,
  107081–107088, 107051–107058, 107021–107028) do not overlap
  107271–107278. Nearest used bands: 107261–107268 (killlootbundle) and
  the single seed 107283 named in a dmgpin reprereg census doc (not a
  band reservation). **Band FRESH.**

## 4. Instrument (frozen design)

Reuse of the grantrate driver family — adapt, don't rebuild:

- `scripts/corpsecap-driver-a.js` — clone of
  `scripts/grantrate-driver-a.js` (same wraps: fireContest, _contestEnd,
  _cxItemPrize with pre/post snapshot diff, rollAlienLoot with caller
  taxonomy, alienLootGrant, villagerKillLoot, _corpseTakeStack, daily
  gun-location census, wall fields), PLUS:
  - `registerDeath(opts)` wrap with pre/post corpse-list snapshot diff:
    snapshot = `[{ id, villagerId, kind, dayDied, stage, buried,
    searcasters, cells }]` (searcasters/cells counted from `c.items`
    with the grantrate `countItemIn`, units-0 stacks excluded). A corpse
    present before and absent after, with NO other removal path, is a
    **cap cull**: record `{ day, corpseId, corpseVid, kind, dayDied,
    stage, searcasters, cells, listLenBefore, listLenAfter }`. The wrap
    runs the game function exactly once, untouched.
  - Daily gun census extended: per-day count of searcasters on corpses
    (`gun-days stranded on corpses`, summed per seed) + per-day corpse
    list length + bones-corpse count (cap pressure).
  - `MODE=diag|ctl|arm`: diag runs with the lever code absent (driver
    STOPS if `CORPSECAP` is set during diag); ctl requires the lever code
    present in `corpses.js` and `CORPSECAP` unset; arm requires
    `CORPSECAP=1`. Substrate identical on all legs:
    `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
    BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND` unset;
    `PRESENCE` unset.
- `scripts/analyze-corpsecap-a.js` — per-seed cull table + cap gun
  losses + gun-days stranded + grants + corpse-takes + wall numbers +
  frozen-bar verdict; `--compare` ctl arm; `--selftest` green before
  pilot.
- `scripts/test-corpsecap-a.js` — proof test (mechanism proof, lever
  phase only): staged `registerDeath` with 41 corpses, oldest bones
  corpse carrying a searcaster → CORPSECAP=1 spares it and culls a
  different bones corpse; CORPSECAP unset culls the searcaster corpse;
  all-bones-carry-searcaster fallback still caps the list at 40;
  no-searcaster behaviour identical on/off. GREEN before the lever
  pilot. (Diag phase: the cull-diff instrument is proven by the
  analyzer selftest + a fixture run of the wrap against a staged
  registerDeath, in the same test file.)
- `scripts/build-corpsecap-panels-a.js` — panel builder (grantrate
  builder pattern): ctl → before, arm → after panel JSONs →
  `scripts/balance-panel.js compare` (§15).

## 5. Definitions (frozen)

- **Cap cull:** a `registerDeath` call after which a corpse present in
  the pre-call snapshot is absent in the post-call snapshot (the only
  removal path inside `registerDeath` is the cap splice).
- **Cap gun loss:** a cap cull whose culled corpse's items contain ≥ 1
  searcaster (units > 0). Counted per seed; each loss also names the
  culled corpse, the holder, the days the gun sat on the corpse, and
  the cells on it (if any).
- **Gun-days stranded:** daily census days on which ≥ 1 searcaster sits
  on a corpse, summed per seed (a gun on a corpse for 62 days = 62
  gun-days, whether or not it is eventually culled).
- **Recovered gun:** a `_corpseTakeStack` event with itemId
  `searcaster` (scholar recovery of a corpse gun).
- **Guardrails (scalemetric cost bar, per the brief):** starvation
  deaths per leg ≤ ctl + 2 on totals AND on arm-only deaths; median
  survival ≥ 0.8 × ctl median; panel compare ctl → arm must show no
  material signal on starvation or median survival.

## 6. Frozen bars (judge: the analyzer on the full band + panel compare)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — proof test 100% + analyzer `--selftest` pass; 0 instrument errors; every cull event carries corpse id + items summary; every daily census row present | all must hold |
| 2 | **Diag answer quantified** — per-seed table: cull events, cap gun losses, gun-days stranded, grants, corpse-takes, corpse-list pressure (max length, bones count); wall numbers per leg | all must hold |
| 3 | **Diag GO rule** — cap gun losses ≥ 1 on the band → build the lever (arm proceeds to §6 bar 4). Cap gun losses = 0 → **DIAG-NO-GO on the sink**: report plainly, build no lever, do not force one | frozen rule |
| 4 | **Lever GO (only if diag GO)** — arm cap gun losses **0** vs ctl **≥ 1** on identical seeds; guardrails (starvation ≤ ctl+2 totals AND arm-only; median ≥ 0.8× ctl) hold; panel compare no material signal on starvation/median | all must hold for GO |
| 5 | **Coverage** — 100% of gun-location census days present; every searcaster grant attributed (contest / kill-loot / other); every gun-total drop to 0 explained by a cull event or a named sink; 0 unexplained gun losses | all must hold |

GO = bars 1–2 pass AND (bar 3 GOes, then bar 4 passes) OR (bar 3
DIAG-NO-GO with bars 1–2 + 5 passing — the verdict is then DIAG-NO-GO,
not a failure). A miss on bars 1, 2, 4, or 5 is NO-GO, never re-scored
against a friendlier metric mid-run (§14).

## 7. Run plan (frozen)

- **Smoke (pre-pilot validation, NOT judged data):** seed **107271**,
  diag mode, gate: 0 instrument errors + driver runs to completion +
  cull wrap records events or the corpse list stays ≤ 40 the whole run.
  Proceed on the gate, not on any loss count.
- **Diag pilot (judged):** 8 seeds, **107271–107278**, horizon 150d
  death-aware, competent verbatim policy
  (`scripts/policies/competent.js`). One leg (diag), substrate env as
  §4.
- **Lever phase (only if diag GO):** build the CORPSECAP lever + proof
  test (GREEN before pilot) + analyzer `--compare`; ctl vs arm pilot,
  same 8 seeds, same horizon, same substrate; only `CORPSECAP` differs.
  Det-gate: ctl trajectories must match the diag leg exactly (lever
  off = old game, zero draws) — any divergence is investigated before
  judging.
- **Wall numbers** recorded per leg: wins, national, table, wave 4–5
  unlocks, median survival.
- **Canon:** docs/CANON.md read; no canon doc covers corpses/the cap —
  the corpse-system design statement is code-header text (see §2), said
  here rather than inventing canon.

## 8. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)
