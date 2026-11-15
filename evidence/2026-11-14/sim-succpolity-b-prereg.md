# sim-succpolity-b — PREREG

Run: fleshout-loop-b-20261114T2345Z (Loop B), arm sim-succpolity-b
Axis: winnability chain. MEASUREMENT arm: the env-gated SUCCPOLITY=1 and
SUCCGRACE=1 levers (already in src/js/hierarchy.js, default OFF) against
the hold — 7 realm dissolutions in the answercourt confirm band, 2 never
re-climbed. Zero src/js changes for this arm: measure only.
Branch: sim-succpolity-b — worktree ~/workspace/worktrees/sim-succpolity-b
Date: 2026-11-14

## Canon note (read first)

docs/CANON.md read, then docs/SCALE.md (the scale-ladder canon — the only
canon doc covering hierarchy/diplomacy). There is NO HIERARCHY.md /
DIPLOMACY.md — stated, not invented. Mechanics below are from docs/SCALE.md
+ src/js/hierarchy.js (header comments + successionCrisis /
_linkSeasoned / answerRenegotiation), never invented. No canon doc covers
realm holding/dissolution (holdrealm metric review §5) — the rules are
grounded only in the code + the corpus.

## The hold (from sim-holdrealm-b, read fully)

Confirm band (100201–100216, 150d, armed competent-answercourt-b): 13/16
reached national; **7 dissolved** (series-observed national→regional
transitions, never end-state arithmetic); 2 of the 7 re-climbed; 5 stayed
dissolved at the end. Per-dissolution table (holdrealm-b-analysis.json):

| seed | national | dissolved | held | mechanism | end |
|------|----------|-----------|------|-----------|-----|
| 100203 | d62 | d90 | 28d | speaker-death-verified | survived d150, never re-climbed |
| 100204 | d68 | d139 | 71d | trust-slide / probable-succession | fell d140 |
| 100206 | d62 | d134 | 72d | trust-slide / probable-succession | fell d137 |
| 100208 | d64 | d101 | 37d | speaker-death-verified | fell d132, re-climbed d113 |
| 100211 | d63 | d107 | 44d | trust-slide / probable-succession | survived d150, re-climbed d127 |
| 100212 | d65 | d142 | 77d | trust-slide / probable-succession | survived d150, never re-climbed |
| 100216 | d63 | d97 | 34d | succession-wounded-then-erosion | fell d105 |

Structural rule (hierarchy.js): a realm is Haven + exactly 3 seasoned
links (seasoned = 30+ days old AND trust 40+) and tolerates ONE weak link;
the succession haircut (−8 to ALL links, same day) drops every marginal
link at once, so any realm with two links near the bar dies on one
funeral. Re-climb needs trust back to 40+ on every polity link + one
answered national beat — fast when attempted (100208 in 12d with no
tends; 100211 in 20d; pilot 100106 in 5d). Re-climb blockers: 100203 —
trust 21/39/22 at d150, zero tends in 60 days, pantry never above 14,447
kcal (poverty trap); 100212 — trust 25/28 with only 8 days of horizon
left. The pending global summons bought 0–1 days in all 9 dissolutions
— not life support; the polity's first-failure day is the honest clock.

## The levers (read from src/js/hierarchy.js)

- **SUCCPOLITY=1** (header ~line 82; `_succPolityGate` ~line 311;
  `onLeaderDeath` ~line 1859; `_succTrustOf` ~line 329): onLeaderDeath
  stamps each shaken link with its pre-death standing (`_succDay` /
  `_succTrust`); for 14 days after, the polity-membership trust bars
  (belong's >=50, seasoned >=40 on the lead/covenant/trade roads) read
  the inherited standing, not the funeral hour's shaken trust. Chaos
  untouched: the −8 haircut still lands on `link.trust`, mourning still
  gags gains 7d, tribute still renegotiates, the neglect snap still
  kills. Past the window without re-tending, the realm dissolves aloud
  as before. Standing's diplomacy count keeps the shaken trust — the
  grace is polity membership only, not wave math. Also read at the
  BELONG good-standing bar (~line 2248).
- **SUCCGRACE=1** (header ~line 108; `_succGraceGate` ~line 320;
  `successionCrisis` ~line 1977; `answerRenegotiation` ~line 2072): at
  succession, a Haven-primary link below the seasoned bar (trust < 40)
  at the funeral that would dissolve the realm aloud gets an answerable
  renegotiation beat (gift/visit/wait, real costs, expires aloud in 7
  days) instead of the silent verdict. Staging conditions (all must
  hold): gate on; link active, no beat already pending, `primary ===
  HOME`, link age >= 30d, NOT seasoned for polity purposes, and
  `state.nationalLive && !_havenPolity()` — i.e. the realm is actually
  about to come apart. While pending, `_linkSeasoned` holds the fire's
  place; the beat's answers land through the mourning choke (mourning
  itself untouched: ordinary gains stay gagged); unanswered, the realm
  dissolves aloud exactly as today. GRIEF COALESCES: a link already
  grieving takes no second beat/haircut from a new death.
  Beat answers (`answerRenegotiation(linkId, how)`): 'gift' — 1,500 kcal
  from the pantry (proportional if thin), trust +8; 'visit' — speaker
  rides out 2 days (real absence), trust +5 (word + promises, +2, if
  the bench is empty); 'wait' — the silence answers NOW (trust −6, the
  lapse outcome). Unanswered beats expire after 7 days
  (`_renegotiationTick`), said aloud.

Prior evidence for both levers (2026-10-15, Loop A, different substrate
— leadfeast/belongfeast policies, 180d, 32-run sweeps): SUCCPOLITY proof
7/7, succession-collapse 0/16 armed vs 1/16 control, guardrails green
(evidence/2026-10-15/sim-succpolity.md); SUCCGRACE proof 10/10, 2/2
eligible staged, 0 violations, guardrails green
(evidence/2026-10-15/sim-succgrace.md). This arm measures them on the
answercourt corpus substrate instead — the hold's own seeds.

## Baseline: the committed answercourt-confirm corpus

`evidence/2026-11-14/perseed-answercourt-confirm-b/` — 32 per-seed files
(16 seeds × armed competent-answercourt-b + baseline
competent-scaleclimb-b, 150d), anchor commit
b3de4e512cf003e4004d7254431146ead1195039. The baseline leg for THIS arm
is the corpus's ARMED leg (answercourt policy, env defaults): the levers
are measured as deltas on top of the answered court.

**CORRECTION TO THE BRIEF (found before any judged run): the brief's
"Zero src/js behavior changes since that corpus" is FALSE.** `git diff
b3de4e512..HEAD -- src/js/` = `build.js` (version stamp only) +
`game.js` (17 lines) + `partyTactics.js` (73 lines): the Reunion ARENA
balance (Steve-ordered 2026-11-14 — arena Reunion HP ×0.4, damage ×0.6
via a per-fight clone; arena mirror cap 1), gated on
`state.arenaContest` being live at `startCombat` entry; field fights
and the wild Reunion keep the full def. Whether any corpus seed ever
enters an arena Reunion fight is unknown — the REPRO GATE below
decides empirically. If the gate fails, the arm STOPS and reports; no
silent re-baseline.

## Policies (recovered byte-identical from ed6df749e — do NOT merge those branches)

- `scripts/policies/competent-scaleclimb-b.js` — baseline policy, 265
  lines, sha256
  24d6b4ad8fbe8d3c5ff542cc99a8cd08fb6be1b4da3bff7b09f092b668d2a032.
  Committed in this branch for the record; NOT run as a fresh leg (the
  corpus's scaleclimb files are the baseline leg's wall numbers only).
- `scripts/policies/competent-answercourt-b.js` — the armed baseline
  policy, 132 lines, sha256
  616aa98670770697fac49fba3dad06c6ec9895f16361368eaf6d757d4a25a0c2
  (verified against the brief's stated hash). Scaleclimb verbatim as its
  courtship core plus ONE addition: answering every staged national
  beat. **Verified: it does NOT answer renegotiation beats** (no
  `Renegot` in either recovered policy; the corpus's armed 100203 file
  carries 0 `answerRenegotiation` verb events; the engine's
  `_answermailDriveDaily` — the only other answerer — is DEFAULT-OFF
  and was unset in the corpus env). So in the corpus, every staged
  renegotiation beat lapsed unanswered after 7 days.
- `scripts/policies/competent-succpolity-b.js` — NEW, this arm:
  answercourt verbatim + ONE addition: answer ONLY succgrace beats
  (`link.pendingRenegotiation && link.pendingRenegotiation.succgrace`)
  with `'gift'`, at the start of daily, before the national-beat
  answer. Young-link renegotiation beats (`succgrace` falsy) are LEFT
  to lapse exactly as the baseline does — that isolates the SUCCGRACE
  lever from the young-link grace idiom. Answer choice 'gift' (1,500
  kcal, trust +8): matches the engine's own answermail-drive precedent
  (answers every renegotiation beat with grain, never silence);
  strongest trust gain (+8 vs visit's +5); no speaker absence during
  the funeral week; 'wait' is the lapse (−6) and is never chosen.
  Documented in the file header; unit-tested (fake-Game legs: succgrace
  beat answered gift; young-link beat untouched; no-beat no-op; gift
  cost/trust read from the engine's own `answerRenegotiation`).

## Instrument (recovered from ed6df749e; changes are instrument-only)

- DRIVER `scripts/succpolity-driver-20261114.js` — the answercourt
  driver recovered byte-identical (sha256
  1257e215ff601ccbd2fa52b2aff6ed6fe12e1e36b698ecdb76b5591b8f89b7c8),
  renamed literals only (RUN default `succpolity-b`, OUTDIR
  `perseed-succpolity-b`, arm `succpolity-b`), PLUS two additive
  instrument changes: (a) the snapshot link roll records `prSg`
  (`pendingRenegotiation.succgrace ? 1 : 0`) alongside `pr`, so
  succgrace beats are countable from the series; (b) the `Game.say`
  capture uses `scripts/linklines-capture.js` (`createLinkCapture`) —
  general buffer unchanged (600, same regex), additive
  `dissolutionLines` episode ring (60), so late dissolutions keep
  their voiced lines past the cap (holdrealm's fix, wired here into
  the answercourt driver for the first time). Zero src/js changes.
  Env-driven (SEEDS / POLICY / DAYS / RUN / OUTDIR) plus SUCCPOLITY /
  SUCCGRACE read by the engine at call time.
- ANALYZER `scripts/analyze-succpolity-b.js` — counts dissolutions as
  EVENTS from the per-day series (national→regional transitions;
  holdrealm metric review §1), re-climbs (regional→national after a
  dissolution), held-days, per-seed wall numbers, succgrace beats
  staged/answered/lapsed (prSg series + verbEvents), starvation deaths,
  median survival. Mechanism labels (speaker-death / trust-slide /
  probable-succession) are an ALONGSIDE read, never the judge. The
  driver's `se` field calls `_linkSeasoned` WITHOUT `forPolity`, so it
  is the RAW bar — dissolutions are read from `scaleRank` transitions
  in the series, never from `se`.
- PANEL BUILDER `scripts/build-succpolity-panels-20261114.js` — §15
  pseudo-panel compare per the answercourt precedent (panel compare is
  invalid by contract for policy levers; the driver numbers judge).
  Built for the record; attached to the evidence file.
- PROOF TEST `scripts/test-succpolity-b-20261114.js` — static legs
  (policy byte-identity vs the ed6df749e blobs; succpolity policy
  answers ONLY succgrace beats; driver/analyzer exports; zero src/js
  diff vs master) + fake-Game answer legs per beat kind + a 60d game
  smoke on 100201 (both policies, SUCCPOLITY+SUCCGRACE on).

## Legs (each vs the corpus ARMED leg — the answercourt armed files)

- (a) **SUCCPOLITY=1 only** — policy competent-answercourt-b
  (byte-identical), env `SUCCPOLITY=1`.
- (b) **SUCCGRACE=1 only** — policy competent-succpolity-b, env
  `SUCCGRACE=1`.
- (c) **Both on** — policy competent-succpolity-b, env `SUCCPOLITY=1
  SUCCGRACE=1`.
- ENV otherwise defaults, matching the corpus (COUNTER_ANSWER,
  COMPETENT_FLEE_REPAIR, ANSWERMAIL_DRIVE all unset). Every flag is
  recorded here; there are no others.

## Seeds + horizon

Pilot 8 seeds (100201–100208) per leg first; confirm legs that pass
the pilot on all 16 (100201–100216). Horizon 150d, death-aware (dead
villages stop simulating, +10d tail max) — identical to the corpus.
Band 100201–100216 is the corpus band, reused BY DESIGN (before/after
on identical seeds); no new seeds are introduced, so no fresh-band
check applies. The 7 known dissolution seeds are 100203, 100204,
100206, 100208, 100211, 100212, 100216; the pilot band holds 4 of
them (100203, 100204, 100206, 100208).

## REPRO GATE (before any judged leg — binding)

Re-run baseline seeds 100201, 100203, 100208 × both policies (6 cells)
with the recovered driver/policies, env defaults, into a scratch dir
(`perseed-succpolity-b-repro`, NOT committed as corpus). Compare each
file to the committed corpus file modulo `anchorCommit`, `run`, and
file-name fields (the run name differs by design). PASS iff all 6
match field-for-field on: series (`scaleRank` per day, link roll,
pantry, deaths), verbEvents, capSummary, deaths, waveKills, standing,
endReason, days. If ANY cell differs, STOP: report the diff to the
coordinator, do not re-baseline, do not run judged legs. (The known
src/js delta is arena-Reunion-only; the gate tests whether it ever
fires on these seeds. The confirm arm's own determinism check
re-ran 100209 both policies byte-identical — but on the corpus
anchor's src/js, not this HEAD's.)

## Primary metric + GO bars (binding, §14)

- **G1 INSTRUMENT VALIDITY** — GO iff the driver captures a full
  per-day link roll on all run configs, 0 instrument errors, every
  succgrace beat staged is accounted (staged = answered + lapsed,
  counted from the prSg series + verbEvents + expiry lines), and 0
  `answerRenegotiation` calls land on a link-day with prSg=0 (the
  succgrace-only answer must not touch young-link beats — joined
  from verbEvents to the series). Any instrument error, unaccounted
  beat, or young-link answer = NO-GO.
- **G2 THE LEVER (per leg)** — GO iff on the leg, counted on the 7
  known dissolution seeds from the per-day series: dissolutions
  **≤ 4 of 7** (corpus armed leg: 7/7 dissolved; the bar asks the
  lever to prevent — or delay past day 150 — at least 3 of the 7)
  AND at least one of **100203 / 100212 re-climbs** (regional→
  national after its dissolution, `nationalLive` true at any later
  day) AND the cost bar below is clean. A miss on any part = NO-GO
  for that leg — never re-scored mid-run.
- **PILOT GATE (per leg, 8 seeds 100201–100208)** — a leg proceeds to
  confirm iff on the pilot seeds: dissolutions **≤ 2 of 4** known
  pilot-band dissolution seeds (100203, 100204, 100206, 100208) AND
  no cost-bar breach on the pilot band. A leg that fails pilot is
  KILLED AT PILOT (no confirm spend).
- **G3 LEVER-ONLY** — GO iff zero `src/js` changes in the branch diff
  and the proof test is green. Any src/js change = NO-GO.
- **COST BAR** (same shape as the answercourt confirm): starvation
  deaths pooled per leg ≤ corpus-armed-leg total + 2 (corpus armed:
  6, so ≤ 8; totals AND arm-only per seed) AND median survival ≥
  0.8× corpus armed median (121.5d → ≥ 97.2d). Guardrail (§14c):
  villager combat deaths are a co-primary read on every seed — the
  evidence reports deaths per seed and the verdict names any seed
  where leg deaths exceed the corpus-armed deaths by >50%.

## Wall numbers (every leg)

National ever / at end, table, wins, wave 4–5 reached, median
survival, starvation deaths, total deaths — reported per leg against
the corpus armed leg (13/16 national ever, 8/16 at end, table 0,
wins 0, wave 4 16/16, wave 5 8/16, median 121.5d, starvation 6,
total deaths 1225).

## Sense-testing (SENSE-TESTING LAW)

Quote the staged succgrace beats + gift answers and the dissolution
lines from `dissolutionLines`; judge whether the proving window /
renegotiation reads as a played negotiation or a silent meter — AND
whether a held realm's villagers say anything different from a
dissolving one's. Read villager dialogue in the captured lines where
present; judge meaning and coherence, never just counts.

## Evidence

- Prereg: this file.
- Policies: scripts/policies/competent-scaleclimb-b.js,
  competent-answercourt-b.js (recovered byte-identical from
  ed6df749e), competent-succpolity-b.js (new: answercourt + succgrace
  gift answer only).
- Driver: scripts/succpolity-driver-20261114.js (answercourt driver
  recovered byte-identical, renamed literals + prSg + episode ring).
- Analyzer: scripts/analyze-succpolity-b.js.
- Panel builder: scripts/build-succpolity-panels-20261114.js.
- Proof: scripts/test-succpolity-b-20261114.js.
- Per-seed JSON: evidence/2026-11-14/perseed-succpolity-b/ (pilot 24
  files if all 3 legs pilot; confirm adds up to 48).
- Repro scratch: evidence/2026-11-14/perseed-succpolity-b-repro/
  (NOT committed as corpus — the gate's working files; kept only if
  the gate passes, as proof of reproduction).
- Panel: evidence/2026-11-14/succpolity-panel.{json,md}
  (+ -before/-after .json.gz pair).
- Evidence: evidence/2026-11-14/sim-succpolity-b.md (per-leg
  verdicts, per-seed tables, verb table, wall numbers,
  sense-testing, metric review).

## Convergence state

Winnability chain — this arm measures the hold BUILD candidates
(SUCCPOLITY / SUCCGRACE) against the hold's own seeds. A GO leg is a
measured hold lever, not a landing (env-gated levers stay OFF by
default; any default flip is a Steve-call). A NO-GO leg is killed
with its numbers.

## Metric review (placeholder — filled in the evidence file)

To be written after the run: did G1/G2/G3 measure the lever, or did
the metric prove wrong (bad proxy, blind channel)?
