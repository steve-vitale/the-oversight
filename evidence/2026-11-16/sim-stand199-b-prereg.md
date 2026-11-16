# sim-stand199-b — PREREG (binding)

Run: fleshout-loop-b-20261116T2030Z (Loop B), axis winnability chain, arm
sim-stand199-b — DIAG: the standing-199 stall. Branch `sim-stand199-b`
(worktree `~/workspace/worktrees/sim-stand199-b`). Base: master
`7bb50f3dc4bcc38436a3fcfc5f4095ee9650ab7b` at arm start (the worktree
HEAD; the coordinator rebases at landing and re-runs proofs).
Binding prereg: THIS file — frozen before any judged sim. The instrument
(driver, analyzer, proof test) is built AFTER this commit; no judged
numbers exist yet. Commit this file FIRST (`scripts/safe-commit.sh`
"sim-stand199-b: frozen prereg — ..." — see the worker brief), then build.

## The question, in plain words

On the haventarget band (102201–102208), five of eight villages end at
standing exactly 199 on BOTH legs (identical OFF/ON), while two reach
295 and 420. A repeated exact value across independent seeds smells
like a cap or a contribution that stops counting. Two prior arms have
already read this number on other bands — this arm re-tests their
answer on a FRESH band and answers the three questions they left
open: (1) cap or missing contribution — which contribution stops, on
which day, on how many seeds? (2) do the 295/420-type seeds (released,
gated >= 200) differ from the pinned seeds in one NAMED contribution?
(3) is the 199 stall the same mechanism as the "national is not
sticky" trust-lapse, or a different one?

## Prior art (read first)

- `evidence/2026-11-16/sim-haventarget-b.md` + prereg — the subject:
  5/8 seeds end at standing exactly 199 on both legs (102201/102204/
  102205/102206/102208); s102203 reaches 295, s102207 reaches 420.
  Wall: national-by-standing 2/8, national-by-rank 0/8, table 0/8,
  wins 0/8, wave 4 8/8, wave 5 2/8, median survival 150d.
- `evidence/2026-11-10/sim-standing199-a.md` + prereg — the mechanism
  as read on band 170233–170240: 199 = t5−1; the pin is the defer5
  combat-readiness deferral, veterans the only short bar at first pin
  on 5/5 pinned seeds (215 pin-days); plenty-cap 0 days; releases on
  the second veteran's arrival day (3/8 released). Raw standing never
  decays; readiness decays (veteran deaths, gear attrition).
- `evidence/2026-11-14/sim-standing99107-b.md` + prereg — the 99107
  pattern class: standing is war-only on 99101–99108 (diplomacy 0
  everywhere, plenty thin); capped >= 200 on 6/8; readiness-ready days
  7, all on one seed, door opens the same day; 317 standing-ok-but-
  not-ready village-days, short bar always veterans. The 99107
  pattern (ready for days, standing short) does NOT reproduce on
  current master.
- `evidence/2026-11-16/sim-seasoning-b.md` §Wall numbers / §National
  is not sticky — the trust-lapse: 4/8 courtship seeds LOST national
  after reaching it, always one covenant link's trust drifting below
  40 (1–4 points); re-staged within 2–14 days on 3/4. Gated standing
  capped at 199 on 4 covenant seeds (raw 225–515) and 7 courtship
  seeds (raw 270–497) — the regional cap. Metric-review item 5 of
  that file is the standing-cap note this arm tests.
- `docs/CANON.md` (read first), `docs/TABLE.md` (the table prices
  the run; the full seat keeps the national bar + wave bars).
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  the standing / scale system specifically. `docs/TABLE.md` is the
  closest (seat pricing, §The seat). Nothing in this evidence invents
  canon: every mechanism below is grounded in the code read
  (file:function cited) and will be confirmed or overturned by the
  measured corpus.

## Code read (hypotheses to test, NOT verdicts)

All function names re-located on THIS tree at arm start (line numbers
drift daily; the proof test locates by function name):

- **H1 — 199 is the defer5 hold (t5−1), not a cap and not a stopped
  contribution.** `villageStandingTotal()` (`src/js/standing.js`):
  t4 = 100, t5 = 200; raw = war + diplomacy + plenty from
  `villageStanding()` (war 25 per wave-3+ ledger kill point, per-type
  cap 2; diplomacy 34 per seasoned REGIONAL+ link; plenty 20 per
  major feast, quality >= 1); capped = war + diplomacy +
  min(plenty, 100). Three holds: `cap` (raw >= 200, capped < 200 →
  hold at 199); `defer4` (raw >= 100, readiness-4 not ready → hold at
  99); `defer5` (capped >= 200, readiness-5 not ready → hold at 199).
  The peak ratchet floors the gated total at the released wave's
  threshold forever once opened. Predicted: pinned seeds show
  `defer5`, `cap` fires 0 days, and NO contribution "stops" — raw
  keeps growing under the pin (as on band 170233–170240, raw 200 →
  320 under a 97-day pin).
- **H2 — the binding short bar at first pin is veterans.**
  `waveCombatReadiness(5)` (`src/js/standing.js`): four bars —
  armor, armed, tricks, veterans (2 LIVING wave-4+ killers). Prior
  bands: veterans the only short bar at first pin on every pinned
  seed; the other three bars never bind at the pin. Predicted: same
  on this band.
- **H3 — released seeds differ in READINESS, not in any standing
  contribution.** A 295/420-type seed is a seed whose peak ratchet
  fired (two living veterans coincided while capped >= 200), after
  which gated == raw. Its war/diplomacy/plenty split is the same
  shape as a pinned seed's — the difference is the veteran count on
  the release day, not the points. Predicted: released vs pinned
  best-day splits overlap; released seeds show a 2-living-veteran
  day, pinned seeds never do (or never while the other bars hold).
- **H4 — the 199 stall and the national trust-lapse are DIFFERENT
  mechanisms.** The stall lives in `standing.js` (readiness gate on
  the wave-5 door). The lapse lives in `hierarchy.js`: `scaleRank()`
  reads the live `state.nationalLive` flag; national is a live state
  that clears when the realm dissolves — a polity needs >= 3 seasoned
  subordinates (`polityOf`, 30+ days AND trust 40+, `_linkSeasoned`),
  so one link's trust dipping below 40 unseasons it and the polity
  dissolves. Predicted: the pin table and the lapse table are
  separable — a seed can sit pinned at 199 while holding national,
  and can lapse national while released (or while never pinned).
  If the corpus shows every lapse coincides with a pin day AND the
  same link event, H4 is wrong and the code read is overturned in
  the evidence — the per-day tables, not the code read, are the judge.

## Design — the recorder (frozen)

One shared band, TWO legs, zero `src/js` game-code change on either:

- **OFF leg** = master as-is, recorder off (trajectory reference).
  **ON leg** = master as-is + recorder wraps only (the judged leg).
  The judged comparison is ON (measured standing trajectories)
  against the OFF leg's trajectories (neutrality — the recorder must
  not move the game). No seed call, no lever, no balance change:
  this is a DIAG reproduction of the subject, NOT a change.
- Instrument (REUSED, proven): `scripts/standing199-instrument-
  20261110.js` (arm sim-standing199-a; 0 instrument errors on ~1,060
  daily snapshots on its band; reconciliation exact). Daily snapshots
  of raw/gated/capped standing, war/diplomacy/plenty split, ledger
  per wave, the FULL active link roll with the reason each link does
  or does not count (seasoned/regional/trust/age), feast log,
  readiness-4/5 bars with per-bar counts vs demand, living wave-4+
  killer vids, peak wave, standingLine. No new instrument module is
  written; the driver augments each snapshot (driver-side only) with
  `scaleRank` + `nationalLive` pure reads for the H4 table.
- Recorder wraps (scripts-side in the new driver
  `scripts/stand199-driver-20261116.js`, pure reads + writes to
  driver-local arrays — no game-state writes, no RNG draws;
  `STAND199_RECORDER=off` skips installing them):
  - ON leg: instrument install + daily snapshot (via the policy
    `daily` wrapper, same shape as the standing199-a driver) +
    `Game.say` tap (tight filter: standing lines / hold beats
    only) for sense-testing.
  - OFF leg: daily trajectory signature only (day, living roster,
    cumulative deaths, pantry kcal, gated standing, raw standing,
    scaleRank, nationalLive — pure reads), no instrument, no say
    tap.
  - Both legs: end-of-run wall fields (days, end, scaleRank,
    nationalEver, wave unlocks, wave-4/5 kills, deaths by cause,
    standing end gated/raw, peak wave).
  - Sense leg (supplementary, NOT judged): one-seed run with
    `loadGame({captureSysSay})` on the first pinned seed (the
    standing199-a lesson: `Game.say` taps cannot hear `sysSay`
    hold beats; the harness silences `sysSay` by default), with a
    trajectory-identity guard (common-day gated/raw/living values
    identical to the ON corpus, 0 diffs) before any beat is quoted.
- A seed is **pinned** on a day iff gated == 199 while raw >= 200
  (holdKind recompute from the snapshot's own fields, by the
  `villageStandingTotal()` logic: cap := raw >= 200 && capped < 200;
  defer5 := capped >= 200 && !readiness5.ready; defer4 := raw >= 100
  && !readiness4.ready; peak-gated). **Released** iff peak wave
  reaches 5 during the run. **Standing-short** iff raw never reaches
  200. **Mixed** iff two pin kinds occur on different days.
- A **contribution stops** on the day of its LAST gain (last day the
  contribution increased); days-at-plateau at end = end day minus
  last-gain day. War's last gain is the last wave-3+ ledger point;
  plenty's is the last qualifying feast; diplomacy's is the last
  seasoned-regional+ link gain (0 throughout if none ever counts).
- A **national lapse** is a day where nationalLive flips 1 → 0; the
  lapsing link is the link whose trust crossed below 40 that day
  (or whose seasoned/regional flag flipped), named from the link
  roll. A **re-stage** is a 0 → 1 flip.

## Classification (frozen — every seed gets exactly one class)

- Pin class: **released** | **defer5** | **cap** | **defer4** |
  **standing-short** | **mixed-199** | **unclassified** (must be 0).
  A seed with pin-days of one kind only takes that kind; a seed with
  pin-days of two kinds is mixed-199 (named per kind with day split).
- Contribution-stop verdict per seed: for each of war/diplomacy/
  plenty — last-gain day, days-at-plateau at end, and whether the
  contribution was still growing on the first-pin day (yes/no).
  "The contribution stopped" is only claimed when the last-gain day
  precedes the first-pin day AND the contribution never grows again.
- H4 verdict per seed: pinned-at-199 days vs nationalLive days —
  overlap table (pinned-while-national, pinned-while-not-national,
  lapsed-while-pinned, lapsed-while-released, lapsed-while-never-
  pinned). H4 holds iff at least one seed separates the two (a pin
  without a lapse, or a lapse without a pin); H4 fails iff every
  lapse coincides with a pin day on the same link event.
- The analyzer RE-DERIVES the pin class from the raw snapshot fields
  (D3): gated == 199 ⟺ a 199-hold recomputes; raw == war + diplomacy
  + plenty and capped == war + diplomacy + min(plenty, 100) on every
  snapshot. Mismatch 0.

## Primary metric + GO bar (frozen)

Primary metric: **share of seeds classified by pin class AND
contribution-stop verdict AND H4 table, unknown 0**, on the ON leg.

GO (instrument validity) iff ALL hold:

1. **8/8 ON-leg seeds classified** (pin class + per-contribution
   stop verdict + H4 row) — unknown 0, unclassified 0.
2. **Corpus 16/16 files parse** (8 OFF + 8 ON legs, one file per
   seed per leg).
3. **Proof green**: `scripts/test-stand199-b.js` — static checks
   (zero `src/` diff; instrument reused by path; wraps named) +
   determinism D1 (recorder ON twice, seed 102701, 60d, identical ON
   corpus) + D2 (recorder ON vs OFF, seed 102701, 60d, identical
   daily trajectory signatures + identical wall fields) + D3
   (analyzer re-derivation, mismatch 0 on the ON corpus), green on
   the instrument tip.
4. **Wall numbers reported** for the ON leg (national by standing
   >= 200 AND by scaleRank, table, wins, wave 4/5 unlocked, wave-5
   faced, median survival, wave-4 kills, deaths) — and the OFF leg's
   wall numbers beside them for the neutrality read.
5. **Measurement bar**: every pinned seed carries its first-pin day,
   first-pin short bars, pin-days, and per-contribution last-gain
   days; every released seed carries its release day and the
   veteran-arrival day it matches; the released-vs-pinned
   contribution comparison is stated per contribution (war /
   diplomacy / plenty — which differs, by how much); the H4 table
   is reported per seed with the lapse cause named.

The VERDICT is the per-seed table itself: pin class, first-pin day
and short bars, pin-days, last-gain day per contribution, release
day, national lapses with cause. A DIAG GO means the instrument is
valid and the table is trustworthy — not that any hypothesis "wins".
No balanced panel (DIAG, no game change) — stated in the evidence.

## Seed bands (fresh, verified)

- Band: **102701–102708** (8 seeds), OFF leg first (recorder off),
  then ON leg (recorder on), identical seeds, same policy/horizon.
- FRESH: verified 2026-11-16 by the worker: `grep -rln "10270[1-8]"
  evidence/*/sim-*-prereg.md` returns nothing (exit 1) and
  `grep -rln "10270[1-8]" evidence/2026-11-1*/*.md` returns nothing
  (exit 1) — no prereg under evidence/*/sim-*-prereg.md and no
  evidence .md names any of 102701–102708. Coordinator-verified
  fresh before the arm; re-verified by the worker before the sweep
  and recorded here. This is a NEW band, not the haventarget band
  (102201–102208) — the haventarget numbers are the subject, not
  the corpus.
- NEVER 100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568, 102131–102138,
  102201–102208 (the poolmarginals forbidden list, carried over,
  plus the awayhaven/seedpaths/haventarget bands).

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js` —
  sha256 `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`,
  verified by the worker before the prereg commit; same blob the
  haventarget / poolmarginals / awayhaven / seedpaths preregs cite).
- OFF anchor = the instrument commit (driver + analyzer + proof
  test, recorder OFF by env); ON anchor = the same commit, recorder
  ON by env (no `src/` change between legs — the legs differ ONLY
  by the `STAND199_RECORDER` env flag). Both SHAs are recorded in
  the evidence file (they are the same commit; the env flag is the
  leg).
- Determinism: D1/D2 as in §Primary metric. Drift check D3 (same
  shape as seedpaths/haventarget): the analyzer's re-derivation must
  pass on every snapshot; the full-band OFF-vs-ON daily-signature
  comparison must show 0 divergences (any divergence is
  investigated, not waived).

## Sense-testing (mandatory)

Read the standingLine rows and the hold beats as stories: does the
village hear WHY the number stopped moving? Quote the first-pin
standingLine and at least one hold beat per pinned seed (or state
that none fired). One line that misnames the short bar is a finding,
quoted verbatim — not a rounding error. The sense leg uses
`captureSysSay` with the trajectory-identity guard (see §Design);
the pilot's `Game.say` tap is the secondary source.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did the plenty-cap hold fire on ANY day (H1's cap leg), or is it
  0 days again?
- Did any contribution actually STOP before the first pin (last-gain
  day < first-pin day, never growing again) — or does raw keep
  growing under every pin?
- Do released seeds differ from pinned seeds in a standing
  contribution, or only in readiness (H3)?
- Is the 199 stall the same mechanism as the trust-lapse, or
  different (H4)? Name the separating seed(s).
- Was 150d the right horizon, or did pins/releases cluster at the
  tail / before the first death?
- Did the OFF leg reproduce the ON leg's trajectories exactly (D2
  full-band), or did the recorder move anything?
- Standing-line cap note (from standing99107-b metric review): the
  99107 instrument's standingLines cap (400) cost the release line
  on its one door. This instrument snapshots one standingLine per
  day (uncapped count, ~150 max) and the say tap caps at 150 — note
  here whether any release-day line was lost to a cap.

## Wall numbers (report every run)

National (standing >= 200 AND scaleRank), table, wins, wave-4
unlocked, wave-5 unlocked, wave-5 faced, median survival, wave-4
kills, deaths — per leg.
