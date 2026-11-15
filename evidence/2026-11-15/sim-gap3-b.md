# sim-gap3-b — gap-3+ established-bearer deaths: DIAG-NO-GO

**Verdict: DIAG-NO-GO (Stage 1 complete, no build).** The scoped
map-decline lever cannot move P1 anywhere near the bar, because the
gap-3+ deaths are not mostly destination fights: 24 of 34 happen at
Haven, and only 8 are map-decline candidates at all. First-order
ceiling **0.921x control** (known-only 0.968x); even the generous
episode-truncation ceiling is **0.746x** — all far above the 0.6x GO
bar. Per the prereg's frozen decision rule, no Stage 2 builds. The
dominant channel is the SAME lingering-besieger Haven channel the
cascade arm owns — its lever (`if (m.lingering) return;` in
`monsterTurn`) is the live answer for these deaths too.

Loop B run `fleshout-loop-b-20261115T0930Z` (ADOPTION of the 0730Z run,
whose workers were cancelled before finishing), axis winnability
chain, tracker blank 4. Prereg:
`evidence/2026-11-15/sim-gap3-b-prereg.md` (uncommitted in the
adopted tree; binds). Branch: `sim-gap3-b`. Base master `8b77f0f40`.

## The question, in plain words

The new bearer dies the same day the old one dies — that is the
cascade, and the cascade arm owns it. But 37 of the 88 scholar
deaths in the control pilot happen 3+ days after succession, to
established bearers who should know better. The prereg's premise was
that these are ordinary-trip deaths: a bearer walks out to a forage
destination, a wave-4 beast is standing on it, the bearer's own race
verdict says the fight is lost, and they walk in anyway. The scoped
map-decline lever would have the policy skip exactly those
destinations. The diag says the premise is wrong for ~70% of the
bucket — the established bearer does not die on a trip. They die at
home, to a beast already standing on the Haven tile.

## Stage 0 — reproduction: PASS

The gap3 driver (`scripts/gap3-driver-20261115.js`) reproduces the
successorcaution fresh control exactly on the 8-seed pilot band
(100201–100208, 150d, competent-answercourt-b): P1 **0.1649** (63
while-national scholar `the wild` deaths / 382 national-days), gaps
23/22/5/38, total wild scholar deaths 88. Analyzer join quality is
perfect: unmatched 0, ambiguous 0, race errors 0, no-context races 0.
`scripts/test-gap3-b.js` independently confirms the repro on seeds
100201/100203 (judged fields identical). The instrumentation is
trajectory-neutral; the corpus is the judged corpus.

Note: the corpus is pre-v5 (the driver was iterated v1→v5 with
Stage-0 re-verified at each step — the v2/v3/v4/v5check single-seed
files are identical judged fields on seed 100201). The v5 control
re-run (`perseed-gap3-b-control-v5/`) was eaten by the write flap
(5× 0-byte tmp files, deleted as debris by the adopting run). The
pre-v5 corpus lacks the v5 raid log, so raid-class attribution reads
`no-v5-data` — but the ceiling math does not depend on raid class
(map-decline candidates are counted from destination fights, which
the pre-v5 driver already records), so the verdict does not wait on
a v5 corpus. A v5 re-run would refine Haven attribution only.

## Stage 1 — DIAG: the gap-3+ decomposition (34 matched + 4 first-deaths)

Analyzer: `scripts/analyze-gap3-b.js` over
`evidence/2026-11-15/perseed-gap3-b-control/` (8 files, intact).
Haven timeline: `scripts/analyze-gap3-haven-timeline-b.js` (first
sighting of the killer species on the Haven tile in the travelTo log).

| dimension | gap-3+ (n=34) |
|---|---|
| location | haven-grounds 24, dest:forage 8, dest:other 2 |
| wave | w4 25, w5 3, w3 5, w2 1 |
| allies at fight start | 0 allies 29, 1 ally 3, 2 allies 1, 3 allies 1 |
| bearer | never-killed 22, fighter (≥1 kill) 12 |
| policy race verdict | decline (lost cause) 33, hold 1 |
| codex knowledge | none-known 20, all-known 14 |
| Haven mechanism | arrived-after-scholar 14, waiting-on-tile 7, other-monster-waiting 2, was-on-departure-tile 1, not-Haven 10 |
| scholar HP at fight start | median 99; 22/34 at 98+ (full health) |
| days since succession | median 8, max 44 |

Map-decline candidates: **8** (all destinations the race declines),
**3** known-only (codex-known species). First-order ceilings on P1:
**0.921x** control (all), **0.968x** (known-only). Episode-truncation
ceilings (the whole episode, not just the one death): **0.746x** /
**0.794x**. GO bar **0.6x**. None meets it — first-order, known-only,
or episode. **DIAG-NO-GO** by the frozen rule. Do not build the lever.

### Why the ceiling is so low — the deaths are Haven deaths

All 88 scholar `the wild` deaths, by location: haven-grounds 49,
haven-inside 20, dest:forage 16, dest:other 2, non-dest 1. **69 of 88
at Haven.** The Haven timeline traces all 69: the killer was first
seen on the Haven tile **3+ days before the death in 37 cases**, 1 day
before in 15, 2 days in 7 — **59 of 69 squatters, seen on Haven ≥1 day
before they kill**; only 2 arrived the same day (8 unknown, pre-v5
corpus). Haven mechanism: waiting-on-tile 28, arrived-after-scholar
23, was-on-departure-tile 14, other-monster-waiting 4. The bearer is
not choosing a bad destination. A beast that has been standing on the
home tile for days steps onto the scholar the moment they move — the
same `monsterTurn` hunt the cascade diag proved with instance ids.
A destination-decline policy cannot decline a fight that starts in
the hall.

The 8 destination deaths are real (all 8 are forage destinations the
race declines — the policy's own verdict says lost: rounds-to-die ~1.7
vs rounds-to-kill 6–34), and a scoped decline would save at most 5
while-national deaths (ceiling P1 0.1518 vs control 0.1649). That is a
real but tiny lever — 0.921x against a 0.6x bar — and building it
would spend a policy variant and a confirm band on a 8% P1 move while
the 24 Haven deaths in the same bucket stay untouched. The fighterhold
rule applies: a lever that does not reduce scholar fight deaths at the
scale of the bar cannot move held-days or dissolutions. Killed
before building, correctly.

## Sense-testing

Seed 100202, day 50: bearer `gen_ckdkshw` (Anna), gap 6, full health
(php 100), alone, killed at Haven grounds by a wave-3
`terms_of_service` that arrived after her. The death line fires —
"Anna is dead — and the dead hold no treaties. Every link Haven has
shakes." — and the world reacts honestly afterwards (a raid that
night, Ashford pressing the tribute down while the chair is empty).
But nothing in the fiction ever says a beast was standing on the
Haven tile, or that it had been there, or that the bearer walked into
it by moving. The village grieves a tragedy; it never learns it is a
siege it could see. Same dishonesty the cascade report found on
100207 — the siege is invisible in the fiction on both arms.

## Reachability verdict (control leg — same corpus as cascade Stage 1)

- **Waves 1–5:** wave-4 8/8; wave-5 3/8.
- **Regional → national:** national-ever 8/8; end-state national 7/8.
- **The table:** 0/8. **Wins:** 0/8.

## Wall numbers (control leg, 8 seeds)

- P1 **0.1649** (63 while-national scholar `the wild` deaths / 382
  national-days); total scholar `the wild` deaths 88; total player
  deaths 103; total deaths 652; dissolutions **1**; median national
  held-days **47.5**; median survival **117.5d**; starvation pooled
  **0**; wave-5 unlocked 3/8; wave-4 8/8; wins 0; table 0.
- Gap shares (88 scholar wild deaths): gap-0 23, gap-1 22, gap-2 5,
  gap-3+ 38. Haven deaths 69/88; destination deaths 16/88.
- Control corpus: `evidence/2026-11-15/perseed-gap3-b-control/`
  (8 files, intact, pre-v5 driver).

## Metric review

P1 conflates Haven deaths (69/88) with destination deaths (16/88)
and with same-day cascade deaths (23/88) — the diag quantifies
exactly how much of P1 the scoped map-decline can ever move
(ceiling 0.921x), and the shortfall is not a measurement gap: it is
Haven deaths outside any destination choice (24/34 in this bucket)
plus cascade deaths the lever structurally cannot reach. The
episode-truncation ceiling (0.746x) prices the most generous reading
— even if every prevented destination death also prevented its whole
follow-on episode, the bar still fails by a wide margin. The pre-v5
corpus limits raid-class attribution only; it cannot change the
ceiling. If the cascade pilot lands, the gap-3+ Haven deaths fall
with it — re-measure this bucket on the cascade-armed leg rather than
building a second lever against it.

## Proof test

`scripts/test-gap3-b.js`: **15/15 ALL GREEN** (re-run by the adopting
run after the flap cleared, 2026-11-15 ~09:52Z). The determinism case
passed with byte-identical judged + diag counts on two 30d runs. It
had failed once during the flap with ENOENT creating
`perseed-gap3-b-det-a/` — a flap artifact, not a driver defect; the
0-byte tmp file it left behind was deleted as debris and is not
committed.

## Files (uncommitted in the adopted tree `sim-gap3-b`)

- `scripts/gap3-driver-20261115.js` (new) — diag driver.
- `scripts/analyze-gap3-b.js` (new) — gap shares + gap-3+
  decomposition + ceilings.
- `scripts/analyze-gap3-haven-timeline-b.js` (new) — Haven
  first-sighting tracer.
- `scripts/test-gap3-b.js` (new) — proof test (14/15, 1 flap artifact).
- `evidence/2026-11-15/sim-gap3-b-prereg.md` (new) — binding prereg.
- `evidence/2026-11-15/perseed-gap3-b-control/` — 8 files (judged
  corpus, intact). Also `perseed-gap3-b-control-v1/` (4 files) and
  `-v4/` (8 files) — earlier driver versions, intact; `perseed-gap3-b-v2check/`
  through `-v5check/` — single-seed Stage-0 checks, intact.
- This file: `evidence/2026-11-15/sim-gap3-b.md`.

## Adoption note (0930Z run)

Recovered from the dead 0730Z run: prereg + driver + both analyzers +
test + all corpora intact except `perseed-gap3-b-control-v5/` (flap,
5× 0-byte tmp files, deleted as debris). No report had been written;
the diag above was computed fresh by the adopting run from the intact
control corpus. Nothing was re-run; no new sims were spent (the flap
blocks per-seed writes). Commit + merge are owed after the flap
clears: the arm is evidence-only (no src/js change), so landing is a
plain safe-commit of the files above on branch `sim-gap3-b`, ff-only
merge to local master, tree release. Resume: `cd
~/workspace/worktrees/sim-gap3-b && git update-ref refs/heads/probe
HEAD` (must succeed) → `bash scripts/safe-commit.sh "sim-gap3-b:
gap-3+ DIAG-NO-GO ..." -- <files>` → re-run test-gap3-b.js (expect
15/15) → merge ff-only → release tree.
