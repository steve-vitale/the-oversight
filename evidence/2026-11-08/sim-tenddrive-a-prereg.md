# sim-tenddrive-a — prereg: the Binding-leg tend drive while national

Run: fleshout-20261108T1622Z (Loop A). Worktree:
`~/workspace/worktrees/sim-tenddrive-a` (branch sim-tenddrive-a, cut at
master 6680d7924 — pellet-boost landed; NO rebase at start).
Axis: scale-onramp / winnability chain (converging, NOT converged).
Tracker blank 3 from run 1530Z; findings backlog #1918; the sized lever
from sim-tendtrust-b. Game-code BUILD. ADOPTION / RESTART: a first
worker was cancelled ~19 min in with NO output — zero commits, zero
files written, tree verified clean at base 6680d7924. This brief starts
fresh; the lesson carried over is COMMIT EARLY AND OFTEN (prereg first,
then instruments as written).

## Canon + code read first (before any sweep)

- docs/CANON.md, docs/SCALE.md.
- Prior decomposition, NOT re-measured:
  evidence/2026-11-08/sim-tendtrust-b.md + sim-tendtrust-b-prereg.md
  (the DIAG that sized this lever) and evidence/2026-11-08/sim-binddiag-b.md
  (the Binding funnel).
- The engine tend drive, exactly (`src/js/win-plan.js`, `winPlanBondsTick`
  line 539, read on this base):
  - Line 542: `if (st.nationalLive || st.pendingNational) return null;`
    — the whole drive switches off the day the realm is won.
  - Lines 543–549: gates that stay untouched — ≥2 Haven-primary links
    (`ownPrimaryLinks`), a plan actor AT Haven (`planActorsAtHaven`),
    `pantryDays >= 3`.
  - Line 555: `if ((l.trust || 0) >= 50) continue;` — the tend cap.
  - Lines 556–567: once per week per link (`tendedWeek`), mourning skip,
    `tendLink(l.id)` → +8 trust, 1,500 kcal (hierarchy.js:1147, read:
    tendLink itself carries NO trust cap; the cap lives only here).
  - `winPlanMusterTick` (line 569) carries its OWN identical early
    return at line 572 — a separate function, a separate leg (muster
    stand-down), NOT touched by this build.
  - Called from `src/js/villager-agency.js:253`, once per agency tick,
    alongside the muster tick.

## THE BUILD (exact construction — pre-registered, do not widen silently)

In `src/js/win-plan.js`, `winPlanBondsTick` ONLY:

1. DELETE the early return at line 542
   (`if (st.nationalLive || st.pendingNational) return null;`) — the
   TENDING leg no longer blocks while national or while a national beat
   is pending. `winPlanMusterTick`'s early return (line 572) stays
   exactly as-is; every other leg's nationalLive behavior stays as-is.
2. Raise the tend cap at line 555 from 50 to 55 WHILE nationalLive:
   `if ((l.trust || 0) >= (st.nationalLive ? 55 : 50)) continue;`
   — cap stays 50 when not national (including pendingNational, which
   is not nationalLive).

Nothing else in the drive changes: the ≥2-link gate, the actor-at-Haven
gate, pantryDays ≥ 3, once/week/link cadence, the mourning skip, and the
tendLink +8 / 1,500 kcal are all untouched. This arm changes the GATE,
not the firing rate: the drive's ~1-in-3-week firing rate
(actor-presence throttle, unmeasured) is a measured property, not a bar.

Sizing (from tendtrust, computed not simulated): observed national-loss
dips are 3, 7, and 12 trust points = 1, 1, and 2 tends of headroom at
lift +8. At cap 55 a link banks 15 points above the 40 bar, which holds
the largest observed dip (12); at cap 50 it banks only 10, which does
NOT hold the 12-point dip (50−12=38 < 40).

## Substrate, seeds, horizon

- Substrate (both legs): tableseat-nowait (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1) wrapped with the tendtrust-b recorder
  (TENDTRUST=1 — proven neutral, G2 in tendtrust; the recorder counts
  engine tends while nationalLive on both legs, identically).
- Pilot seeds: 76401–76408 — REUSED deliberately, same band as
  binddiag/tendtrust, stated not contamination. Own baseline
  replication on THIS base — do NOT reuse tendtrust's corpus as the
  control; its numbers are only a reproduction check.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Leg order: BASELINE leg FIRST on the unfixed worktree, then the
  CANDIDATE leg on the fixed worktree. Both legs run the same sweep
  script (`scripts/test-tenddrive-a-sweep.js`, adapted from
  test-tendtrust-b-sweep.js: same two arms per leg — plain
  tableseat-nowait + recorder-wrapped — so each leg carries its own G2
  recorder-neutrality check; the GO judgment compares the recorded
  arms across legs, identical instruments, only the game code differs).
- Reproduction check (tendtrust baseline, base 715c2918d — NOT the
  control): national ever 4/8, final 3/8, losses 76407 d122 + 76408
  d92, won 2/2, median 90d. Base drift is expected (this base is
  6680d7924); the judgment uses MY OWN baseline leg, never tendtrust's
  numbers.

## GO BARS (binding, §14 — a miss is NO-GO, never re-scored)

- PRIMARY: national held to end — candidate national final ≥ baseline
  + 2 (i.e. ≥5/8 if baseline replicates 3/8) AND the two observed
  loss seeds (76407, 76408) hold national to end (their loss dips
  absorbed).
- MECHANISM leg: engine tends while nationalLive observed on ≥1 seed,
  AND at least one link topped to trust ≥55 while national.
- SECONDARY cost bar (scalemetric): starvation ≤ control + 2 (totals
  AND arm-only), median ≥ 0.8× control median.
- 76404 is EXCLUDED from any win claim: it never forms a third sub
  (courtship failure on a poor pantry), so no tend count fixes it — per
  the tendtrust spec.
- GO = primary + mechanism + secondary all hold. Confirm (only if
  pilot GO): a FRESH 764xx-series band (worker-verified fresh, 12
  seeds — see freshness check below), same policy/horizon, same bars.
- If NO-GO: revert the game-code change completely (zero src/js diff)
  and commit prereg + instruments + evidence + corpora only. If the
  drive never fires on a loss seed, that is a measured NO-GO mechanism
  (actor-presence throttle) — do NOT widen scope mid-run to fix firing.

## Seed-band freshness check (confirm band) — WORKER-VERIFIED

- Chosen confirm band: **76409–76420** (12 seeds, 764xx series).
- Search scope: every dated prereg `evidence/*/sim-*-prereg.md`
  (all dates, after expanding this sparse tree's checkout to the full
  `evidence/` tree), grepped for `764` — only 76401–76408 are named
  anywhere (binddiag / tendtrust / this arm's lineage); the explicit
  regex `764(09|1[0-9]|2[0-9])` across all preregs returns NOTHING.
- Forbidden/contaminated lists: the ten preregs that mention
  "forbidden"/"contaminated" were read for their lists — they name
  other bands (74201–74208, 73601–73608, 9700–9711, 9930–9941, 9950,
  10000) and other subjects (spoilDay); NONE names any 764xx band.
- Tracker + findings: `grep 764` on
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/convergence-tracker.md`
  and `sim-findings.md` — matches are commit SHAs (76421939b,
  874646764), the 976x stock bands, and the 76401–76408 band itself
  (finding #1918, this arm's own blank). No 76409–76420 naming.
- Result: **76409–76420 is FRESH.** No prior prereg, forbidden list,
  contaminated list, screen, extension band, tracker line, or findings
  entry names any seed in it.

## Proof

- `scripts/test-tenddrive-a.js` — unit legs: (1) the drive tends while
  nationalLive (fixture: nationalLive on, dipping link at 42, drive
  fires a tend); (2) cap 55 while national / 50 otherwise; (3)
  recorder neutrality (recorded run identical to unrecorded on a
  control seed). The proof must FAIL on unfixed code and PASS on fixed
  code — green assertions alone are not proof of an effect.
- `node scripts/check.js --quick` on the fixed tree (or name each
  failing line with its cause). Never run concurrent jest; use
  `--cacheDirectory=/tmp/jest-cache-sim-tenddrive-a`.
- Balanced panel (§15): `scripts/balance-panel.js` before (unfixed
  worktree) and after (fixed worktree) on the 764 band (capable,
  risk-aware, socialite, winseek, 180d); compare and attach the
  compare .md. The panel is the instrument; the pre-registered GO bars
  are the judge. If the compare returns `invalid`, follow the
  COMPARE-CONTRACT repair route in
  evidence/2026-11-08/sim-comparecontract-a.md (rebuild the
  before-panel under the wrapper policy with the flag unset) — do not
  silently drop the panel.
- Sense-testing law: read a national-hold trajectory in plain words on
  both legs (what the realm looked like, what changed, what it meant),
  plus a village assessment. Read transcripts, judge meaning — never
  just counts. Note the known silence: the tend/trust story is silent
  in narration (tendtrust sense read) — if the build changes what the
  village hears, say so; if it stays silent, say that too.

## Notes (pre-registered, not bars)

- (1) The double-tend night quirk (tendtrust: a week-boundary night can
  deliver two tends, delta +16) — record if observed; not a bar.
- (2) The engine drive's ~1-in-3-week firing rate is a measured
  property, not a bar — this arm changes the gate, not the firing rate.
- (3) Base 6680d7924 contains the pellet pantry-cost build; MEMORY
  (2026-11-08 11:54 CST ruling, landed in the run's context after this
  brief was written) says the pellet cost is being reworked to
  radiation poisoning (health, not pantry) before the next ship. That
  rework is a sibling lane, NOT this arm's scope; the pellet build is
  constant across both my legs, so it cannot confound the before/after.
- (4) The tendtrust-b recorder's header comment still says the engine
  drive "never [tends] while nationalLive" — true of the OLD gate, stale
  under the fix. The recorder file itself is a landed instrument from
  another arm and is NOT modified here; the stale comment is recorded,
  not fixed, in this arm's evidence.

## Landing rule

- GO → fix lands as its own commit with `[needs-eyes]` (villager
  behavior change: a drive that runs while national) + proof test +
  evidence + corpora; confirm on the fresh band follows.
- NO-GO → revert the game-code change completely (zero src/js diff);
  commit prereg + instruments + evidence + corpora only.
- Do NOT push, do NOT bump versions, do NOT verify live — report
  'ready-to-merge' with branch tip, verdict, proof results, evidence
  path. The coordinator merges via --ff-only.

## Flap protocol

Probe O_EXCL file creation (`git update-ref refs/heads/probe HEAD`,
then delete it) before every sweep and every commit; if the probe
fails, do read work and retry later — never force a write, never route
around the denial with a manual ref edit. Probe OK at prereg time
(2026-11-08 ~16:30Z; flap cleared ~17:00Z per brief — probe passed
this run at ~16:30Z, before the prereg write). Do NOT run
scripts/worktree-heartbeat.sh (REGISTRY.lock flock stall — coordinator
owns the registry entry; tree safe ~4h without a heartbeat; if still
running past ~20:30Z, tell the coordinator the tree needs a heartbeat).

## Metric review (to fill at evidence time)

- (To be written in sim-tenddrive-a.md: whether the bars worked as
  written, any instrument gaps found, panel outcome.)
