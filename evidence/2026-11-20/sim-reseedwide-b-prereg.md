# sim-reseedwide-b — PREREG (frozen before any judged sim)

**Arm:** sim-reseedwide-b — the WIDER BAND + LONGER WINDOW for the #2626
expiry follow bars (finding #2626, sim-findings.md). Loop B run
fleshout-loop-b-20261121T0030Z, axis winnability chain, arm 3 of 3.

**Branch:** `sim-reseedexpiry-b` (worktree
`~/workspace/worktrees/sim-reseedexpiry-b`). Base: the HELD
`sim-reseedexpiry-b` tip `9c8f83d44` (expiry half NO-GO RESEED,
evidence `f7e68d418`), REBASED onto current master `faa5d65a9`
(new tip `91e815132`, clean rebase, 5 commits, no conflicts).
The rebase re-applies the HELD reseed lever (`planReseedPick` in
`src/js/win-plan.js`, sighting stamps in `src/js/fieldFights.js`)
on top of master — verified present after the rebase; the lever
itself is UNCHANGED by this arm. This arm does NOT re-judge the
re-seed half and does NOT merge the held fix.

## Read first (not re-measured)

- `evidence/2026-11-20/sim-reseedexpiry-b.md` + its prereg (on
  this branch): expiry half MEASURED — 2 expiries in 16 armed
  seeds, both band A (106301 d43 Lorenzo, redactor; 106307 d36
  Emmett, terms_of_service); both fired exactly as designed with
  the fireside beat; re-seed within 7d 1/2 = 0.500 vs frozen ≥ 2/3
  — FAIL by half a holder; fought again within 14d 2/2 PASS;
  post-expiry targetless launches 0 PASS; guardrail PASSES both
  bands. Expiry rate ~1 per 8 armed seeds.
- `evidence/2026-11-20/sim-reseed-b.md` + prereg: re-seed half
  works (dead-target launches 2/16 → 0/18 armed, 6 re-seed
  commits, 4 re-seed launches).
- Finding #2626 (sim-findings.md): stays OPEN; the coordinator
  call left open — judge the combined fix on the re-seed half
  (dead-0 on both new bands) + guardrail, OR run a wider band /
  longer window for the expiry follow bars. This arm does BOTH:
  the wider band + longer window AND the combined-fix judgment.
- docs/CANON.md + docs/MONSTER-WAVES.md (read before building).
- CANON GAP (inherited, stated not invented): no canon doc covers
  expedition destination picking — the re-seed picks a TARGET TYPE
  from what the holder has heard, never a destination tile.

## What this arm is, in plain words

The last arm measured the expiry half and missed its 7-day bar by
one holder out of two — a knife-edge at n=2. This arm buys more
denominator: twice the seeds (16 fresh) and a longer window (180
days instead of 150), so more expiries can accumulate. It judges
the expiry follow-through ONLY if enough expiries arrive (n ≥ 3,
see JUDGE RULE below); otherwise the shares are reported, not
judged, and the arm's verdict rests on the combined-fix judgment:
the re-seed half still launches at zero dead targets, holders
still re-seed, and the guardrail still holds. Either way the fix
stays HELD and unmerged on this verdict.

## JUDGE RULE (FROZEN — §14 metric binding; no mid-run re-scoring)

The expiry follow-through bars —

- re-seed onto a live target within 7 days ≥ 2/3 of expired holders,
- fight a wave-3+ beast within 14 days ≥ 2/3 of expired holders,
- post-expiry targetless launches = 0 —

are judged ONLY if expiries n ≥ 3 pooled across both sub-bands.
If n < 3 the shares are REPORTED, not judged: the analyzer's
pooled judge returns verdict `REPORTED`, kind `LOW-N` (new
`--min-expiries 3` extension — see Instrument), and the arm's GO
hinges on the COMBINED-FIX JUDGMENT below. If n ≥ 3 the bars are
judged at their frozen thresholds AND the combined-fix judgment
must also pass for a GO.

**COMBINED-FIX JUDGMENT (frozen):** GO requires ALL of —

- re-seed half: dead-target launches = 0 on BOTH armed legs
  (the re-seed's dead-0 holds on the new band), re-seed commits
  reported per leg;
- guardrail per sub-band against that sub-band's own control:
  survived ≥ control−1 AND median survival ≥ control−5d AND
  starvation ≤ control+1 (a miss on any one is a guardrail miss);
- instrument clean (0 errors, 8 files per leg dir, gate 0/0,
  expiry-rule 0, pool-agreement 0) and dead-target commits > 0
  pooled (the survey saw the condition's neighborhood).

**VERDICT KINDS (frozen):**

- `GO` — n ≥ 3, all three follow bars pass, combined-fix
  judgment passes.
- `GO (combined)` — n < 3, shares reported (not judged),
  combined-fix judgment passes. The expiry follow-through stays
  unproven at this n; the verdict says so in one line.
- `NO-GO RESEED` / `FIGHT-AGAIN` / `POST-BLOCK` — n ≥ 3 and a
  follow bar missed.
- `NO-GO DEAD` — dead-target launches > 0 on either armed leg
  (the re-seed half regressed on the new band).
- `NO-GO GUARDRAIL` — guardrail missed on either sub-band.
- `NO-GO INSTRUMENT` — instrument bars failed (cross-check
  mismatch, missing gate snapshots, instrument errors, pool
  disagreements).
- `NO-GO UNREACHABLE` — dead-target commits 0 pooled: the survey
  never saw the condition's neighborhood at all.
- `NO-GO METRIC-BROKEN` — reserved for the instrument being
  unable to measure the bars at all.

## Secondary (reported, not GO bars)

- Pool floor (min / median / distribution) across dead-target
  commits per sub-band and pooled; dead-target commit count per
  seed; earliest/latest dead-commit days.
- Re-seed commits/launches per leg (the re-seed half is NOT
  re-judged, but its counts are reported for continuity).
- Post-expiry hold rows ≥ 1 expected IF expiries occur.
- Expiry beats + re-seed beats visible in the corpus transcript
  (`vetSays`, SAY_RE-matched "put down").
- Scale-wall numbers every leg (national / table / wins, wave 4–5
  unlocks, median survival, starvation).
- Sense-test: every expiry + at least one re-seed story in plain
  words (transcripts read, not just counts).

## Horizon, seeds, policies, substrate (FROZEN)

- **Horizon: 180d, death-aware** (longer window to accumulate
  expiries; baseline median survival ~147–151d, so 180d keeps the
  +15d tail rule honest — dead villages stop simulating, +10d tail
  max).
- **Seeds: 106601–106616, 16 fresh seeds**, run as TWO 8-seed
  sub-bands so the reused analyzer's 8-file-per-dir bar holds
  unchanged: sub-band A 106601–106608, sub-band B 106609–106616.
  Freshness verified below. Control + armed legs per sub-band
  (4 legs × 8 seeds = 32 files).
- **Policy: competent verbatim** (scripts/policies/competent.js;
  policy sha256[:12] verified on this base BEFORE the freeze:
  `1884c8852d38` — identical to the reseed / reseedexpiry arms).
- **Substrate (all legs, verified on this base):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1`
  (all five flag readers present in `src/js`).
  `ALLYSLOT3` and `LAUNCHSURVIVE` verified absent from `src/js`
  (no references); keep all legs identical. The driver enforces
  all of this at runtime — a stop is a loud failure, never a
  re-scope.
- **Legs:** control (`PLANRESEED` unset) and armed
  (`PLANRESEED=1`), each sub-band, same driver
  (`scripts/reseedwide-driver-b.js`, ported from the reseedexpiry
  driver — horizon + naming only, see below), same analyzer
  (ported + `minExpiries` extension, see below). RUN names
  `reseedwide-b-<band>-control` / `-armed`; OUTDIRs:
  `perseed-reseedwide-b-<band>-control` /
  `perseed-reseedwide-b-<band>-armed`.
  Before/after comparison through the balanced panel
  (`scripts/balance-panel.js` via
  `scripts/build-reseedwide-b-panels.js`, `--out
  evidence/2026-11-20/reseedwide-b-panel-<band>`) per §15.
- **Chunking:** sweeps chunked to ≤ 8 seeds per exec call (one
  sub-band-leg per call).

## Seed-band freshness check (recorded at freeze)

Band 106601–106616 is **FRESH**. Search scope (per the
seed-band-freshness skill): every dated prereg under
`evidence/*/sim-*-prereg.md` (grep for each of the 16 seed
numbers individually + `10660`/`10661` — zero hits); the
per-seed corpus directory names under `evidence/*/perseed-*/`
(no `*1066*` dir); `sim-findings.md` and the convergence
tracker (no `10660x` / `10661x` mention); no forbidden /
contaminated band list names any of them (searched the tracker +
`hidden_files/` — no single list file exists; the tracker cites
band reservations inline). Prior arms used 106301–106308,
106401–106408 (reseedexpiry), 106081–106092 (reseed), 106501–
106508 (held spare, unused) — none overlap 106601–106616.

## Instrument (reuse + extend for 180d only)

- `scripts/reseedexpiry-driver-b.js` is copied to
  `scripts/reseedwide-driver-b.js` with ONLY: header/arm string,
  RUN/OUTDIR defaults, corpus prefix `reseedwide-b-s`, MODE guard
  `reseedwide`, loadGame mode prefix `reseedwide-`, and the DAYS
  default `150` → `180`. All recorder logic (gate snapshot,
  rumor-pool snapshot, expiry rows, substrate stops) is
  byte-identical in behavior. DAYS remains env-overridable; the
  judged legs run DAYS=180 explicitly.
- `scripts/analyze-reseedexpiry-b.js` gains ONE extension:
  `judgePooled(analyses, opts)` accepts `opts.minExpiries`
  (CLI `--min-expiries N`); when set and pooled expiries
  `ec < minExpiries`, the `reseed-pooled` and
  `holders-fight-again-pooled` bars are marked `pass: null`
  ("reported, not judged — n < N") and the verdict path skips
  them: if every hard bar passes the verdict is `REPORTED`,
  kind `LOW-N`; the post-expiry bar is likewise reported, not
  judged, at n < N. When `ec >= minExpiries` (or the option is
  unset) the judge behaves exactly as before. The single-leg
  `judge()` is UNCHANGED. Selftest gains §H (LOW-N reporting,
  n ≥ 3 normal path, n = 0 UNREACHABLE unchanged).
- `scripts/build-reseedexpiry-b-panels.js` is copied to
  `scripts/build-reseedwide-b-panels.js` with ONLY: filename
  pattern `reseedwide-b-s…-reseedwide`, DAYS `150` → `180`,
  observerDigest `reseedwide-b-instrument-v1`, defaults for
  sub-band A 106601–106608.
- **Do NOT change the held reseed lever. Do NOT flip any
  default.** This arm is a measurement re-run.

## Proof tests (before judged sims)

- New `scripts/test-reseedwide-b.js`:
  (a) HORIZON + NAMING: the ported driver defaults DAYS 180 and
  the corpus filename / self-description carry `reseedwide-b`
  + MODE `reseedwide`; the MODE guard rejects anything else.
  (b) DRIVER SMOKE: armed 1-seed smoke through the ported driver
  (DAYS=180, seed 106601) records `rumorPool` on depart rows
  with a target, and the corpus self-describes the flag + base.
  (c) ANALYZER §H: pooled-judge LOW-N behavior on synthetic
  corpora — ec=2 with minExpiries 3 → REPORTED / LOW-N, shares
  reported; ec=3 with shares ≥ 2/3 → DIAG-GO; ec=3 with
  re-seed share < 2/3 → NO-GO RESEED; ec=0 → NO-GO UNREACHABLE
  unchanged; minExpiries unset → legacy behavior unchanged.
- Re-run the reseedexpiry proof suite on this base (no
  regression): `scripts/test-reseedexpiry-b.js` 58/58 + analyzer
  selftest 52/52 + new §H, all green before judged legs.
- `node scripts/check.js --quick` after the build is NOT run on
  this branch: sibling gates were running at the reseedexpiry
  closeout and the discipline forbids a third concurrent run;
  this arm carries no src/js changes, and the arm's own gates
  (proof + selftest + 0 instrument errors on all legs) are the
  check. Recorded honestly in the evidence file.

## Metric review (carried from reseedexpiry, plus new)

1. The analyzer's `live` class means "last seen alive in a
   fight", not "alive now" — unchanged.
2. Same-day kill-then-sighting is conservatively blocked —
   unchanged.
3. The gate's `villageLastSeenDay` stamp covers every `fieldFight`
   contact including arena/contest fights — unchanged.
4. The re-seed count has two honest numbers: commits
   (`planReseeds`) and launches. The bar counts launches —
   unchanged.
5. The pool snapshot is a replica, not the real pick: fidelity
   proven by the reseedexpiry §A fixtures AND by the live
   cross-check on every dead-target commit (poolN 0 → expired /
   held; poolN ≥ 1 → reseeded). A disagreement is an instrument
   failure: STOP, investigate, never silently count.
6. **NEW — the n ≥ 3 rule is a pre-registered power floor, not a
   re-score:** it is frozen here, before any judged sim, because
   the reseedexpiry arm's n=2 knife-edge showed the 2/3 share
   cannot be judged on 1–2 holders. At n < 3 the arm deliberately
   does NOT call the follow-through pass or fail — it reports
   the shares and judges the combined fix instead. The next run
   may widen further or re-derive the bar; this run does not.
7. **NEW — the 180d horizon changes the guardrail's meaning
   slightly:** villages that survive past 150d now have 30 more
   days to die or to win; the guardrail compares armed vs control
   on the SAME horizon, so the comparison stays fair, but the
   raw survival numbers are not comparable to the 150d arms —
   the evidence says so beside the table.
8. Stage 2 construction (from the reseedexpiry prereg) is NOT
   carried over: Stage 1 already yielded live expiries, so the
   live band IS the condition; this arm widens it.
9. The guardrail's 8-seed allowance is per sub-band, not per
   seed count — the evidence reports the raw counts beside the
   pass/fail so the looseness is visible.

## Convergence state

Axis: winnability chain, dead-target gate step (#2626 expiry half).
Status at freeze: **PREREG FROZEN, BUILD + LEGS OWED**. The
re-seed fix stays HELD, unmerged, on `sim-reseedexpiry-b`
(rebased tip `91e815132`); this arm branches from it and never
merges it. No win price or deed gate changed. No other lever
touched.
