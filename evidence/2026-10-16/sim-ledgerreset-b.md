# sim-ledgerreset-b — sim-findings #16: succession ledger reset (loop B, 2026-10-16)

## Canon
READ docs/CANON.md first. **No canon doc covers the ledger** — there is no
ledger entry in the canon manifest (checked 2026-10-16). The semantics below
are derived from the code (src/js/ledger.js, game.js, justice.js) and the r8
design notes, not invented: where "personal" was ambiguous, the reading most
consistent with the freeloader clock's purpose (fair-share accounting per
person) was chosen, and the ambiguity is documented under "Design notes".

## The finding
`[open] 2026-10-13 — ledger — Ledger doesn't reset on succession:
successors' NPC-era takes persist as "mystery takes" (found in r7 selfeed arm).`

## Investigation (read the code — no invented semantics)

**(a) Where succession happens.** Exactly ONE village succession path:
`playerDeath(cause)` in src/js/ledger.js (~line 770). Scholar death →
village mourns → corpse + burial → trust-sorted successor chosen from
`npcIds()` → `this.villagerId = newId` → `mantleBecome(oldId, newId)` (the
successor's own kit/abilities/tracks — Steve 2026-10-14 "you become that
villager") → the FRESH SOCIAL LEDGER reset → office trust inheritance.
A second mantle-passing path exists in src/js/nomad.js (`nomadKill`, the
Long Way Home road) — it passes the bearer <redacted> the party, calls
`mantleBecome`, but does NOT touch the village takes ledger. Out of scope:
the road has no village pantry/takes book; the finding is about village
succession. Noted as a related blank, not chased.

**(b) How the ledger is keyed.** Per-VILLAGER (person), not per-role:
- `v.takes[vid]` / `v.gives[vid]` — cumulative gross takes/gives (game.js).
- `v.takeHist[vid]` / `v.giveHist[vid]` — dated `[{day, kcal}]` histories,
  7-day window (r8/r9 fair-share rate accounting; `takeRate7`/`giveRate7`).
- `v.freeload[vid]` — the freeloader clock `{days, stage}` (game.js
  `freeloaderTick`).
- `v.trust[vid]` — trust entries (the office inheritance recomputes the
  successor's; see below).
Readers all key on the CURRENT scholar: `justiceHeat()` reads
`v.takes[this.villagerId]` / `v.gives[this.villagerId]` (justice.js:101-102);
`freeloaderTick` reads `takeRate7(vid)`/`giveRate7(vid)` per roster member;
the fictiongate journalNote reads the same dated rates (justice.js:143-144).

**(c) How the successor inherited the predecessor's NPC-era takes.**
While a villager, every communal meal and pantry draw accrues under their
own id (`villagerMealDay`: `v.takes[vid] += pile.taken` + `recordTakeHist`).
Pre-r8, `playerDeath` never cleared these. The moment they became scholar,
`justiceHeat()` and the freeloader clock read the NPC-era book as the new
bearer's personal hoarding — "mystery takes": ordinary villager meals
recast as the scholar's theft. r8 evidence: exiled successors carried
10k+ kcal of NPC-era takes; `netDrain` started deeply negative on day one
of their tenure; the 12-day freeload clock ran → vote → exile (5/8 exiles
before, 0/8 with the reset isolated).

**What SHOULD persist vs reset.** The office is the village's: the
leadership vector (`pg.ledger` — might/brokerage/…/foodShared), ledger
events/beats, Codex, trust (discounted inheritance), arc/integration.
The body is new: takes, gives, takeHist, giveHist — the new face's own
book. The freeload clock `v.freeload[newId]` is intentionally NOT reset
(r8 design note: "a known drain becoming bearer is a design question for
a future run") — per-person state, not inherited, and out of this
finding's scope.

## The fix — ALREADY LIVE (r8, commit 26c1ac56, 2026-10-13)
`playerDeath` (src/js/ledger.js:851-865, FRESH SOCIAL LEDGER block) resets
`takes`/`gives`/`takeHist`/`giveHist` for `newId` AFTER `mantleBecome`
(order verified — nothing re-dirties the book afterwards). r9 added the
`giveHist` reset. This arm therefore VERIFIES rather than re-lands:
the proof below shows the bug reproduces iff the reset is neutralized,
and the pilot measures the reset's causal contribution on the current base.

## Deconfliction
Sibling loop A arm sim-wave3ledger touches src/js `checkMonsterCounter`
(game.js:30505) + trick-resolution region (game.js ~30465–30777,
`discoverMonsterCounter`, src/js/waveLedger.js, src/js/fieldFights.js).
This arm made ZERO src/js edits (proof + sweep + evidence only). No overlap
— verified by grep; different files entirely.

## Proof — scripts/test-ledgerreset-20261016.js (19/19 GREEN)
- RED (5/5): with ONLY the four reset lines neutralized (string-surgical,
  hash-verified `git checkout` restore — tree byte-identical afterwards),
  the succession fixture (crowned NPC, 12,345 kcal NPC-era takes) shows the
  takes/gives/takeHist persisting and `takeRate7` reading the NPC-era book:
  the bug reproduces on demand. The test is not a tautology.
- GREEN (14/14): on current HEAD the successor's takes/gives/takeHist/
  giveHist all reset to 0/[]; dated rates read clean; the leadership vector
  (`foodShared`=7, `might`=3) and ledger events persist; the office trust
  inheritance applies exactly (own=100, office=1 → trust 40); another
  villager's book is untouched; no tracked files modified.

## Pilot — scripts/sweep-ledgerreset-20261016.js (16 runs)
Substrate: pre-seat courtship, SEATDRIVE=0 explicit, FEASTSCALE_R13=1,
policies leadfeast/belongfeast (= leadcourt/belongseek + the r13 feast
layer). 4 seeds × leadfeast (11/22/33/44) + 4 seeds × belongfeast
(55/66/77/88); each (policy, seed) under control (reset neutralized
driver-side — behaviorally pre-r8 for the four stores) and armed (reset
live); identical seeds across cells. 180d death-aware.

PRE-REGISTERED (binding §14):
- PRIMARY (a) no ledger regression: scholar-vessel freeload stage≥2
  escalations armed ≤ control (aggregate); succession trust-deltas sane
  (median within [-60,+60], no |d|>90); death-cause modes identical (no new
  mode with n≥2).
- PRIMARY (b) coverage: ≥1 succession-reset event on the armed side
  (successor carried nonzero NPC-era takes the reset cleared), else
  no-coverage.
- GUARDRAILS: national armed ≥ control−2; median survival armed ≥
  control−10d.
- GO = PRIMARY(a) + PRIMARY(b) + guardrails. (No new game code to land —
  GO closes #16 as fixed-by-r8, verified.)

### Results

16 runs completed (all cells; no run failures). Per-seed JSONs:
`evidence/2026-10-16/perseed-ledgerreset/`; aggregate
`evidence/2026-10-16/ledgerreset-sweep.json`.

| cell | n | national | table | won | exiled | median d | successions | resetEv | mystery kcal | esc2+ |
|---|---|---|---|---|---|---|---|---|---|---|
| control (bug present) | 8 | 5/8 | 7/8 | 0/8 | 0/8 | 147d | 50 | 48 | 397,694 | 0 |
| armed (reset live) | 8 | 7/8 | 8/8 | 0/8 | 0/8 | 180d | 81 | 74 | 590,144 | 0 |

Death-cause modes (aggregate counts): control {villager combat 72,
monster 35, combat 184, expedition 15, dehydration 4, ambush 2, starvation 8,
alien 2, sickness 7, wound 3, contest 2, the night 1}; armed {villager
combat 77, monster 39, combat 225, ambush 1, expedition 14, dehydration 4,
sickness 6, contest 5, starvation 2, alien 1, the night 1, wound 2, "The
Bright Bastard" 1}. Mode sets identical except one n=1 monster-named cause
on armed (below the n≥2 new-mode bar).

Trust deltas on succession: control median −16 (min −55, max +4); armed
median −18 (min −54, max −3). Negative-by-design: the office inheritance
discounts (0.4×own + 0.4×office), so successors start below their NPC-era
personal trust. Sane, bounded, no outliers.

**Verdict: GO** — coverage 74 reset events (≥1 required); esc2+ 0 ≤ 0;
trust sane; national 7 ≥ 5−2; median 180d ≥ 147−10d; no new death mode.
No new game code to land — GO closes #16 as fixed-by-r8, verified.

Note on the esc2+ channel: it was dormant on this substrate (0
escalations both sides; 0 exiles both sides — cf. r8's 5/8 pre-fix exiles
on leadcourt/belongseek without the feast layer). The no-regression read
on that specific metric is therefore weak, but the coverage read is
strong: 74 successions where the reset cleared a nonzero NPC-era book
(~590k kcal). The trust / death-mode / national / median metrics all
hold independently.

## Sense-testing (transcripts read — SENSE-TESTING LAW)
Succession beats read as people, not meters (belong-s66, s77):
- "📖 The Codex turns a page: June Aguilar, 19 days. The mantle passes to
  David Cox." / "🪞 You wake up somebody else. David Cox, 58 — a Sailor."
- "\"Ray's gone.\" Esperanza looks at you for a long moment. \"You're not
  Ray.\" No heat in it. Just fact. You'll have to earn this face."
- The System's mantle-transfer beat + the r15 "successor's own record"
  vouching fire in-fiction.
The reset itself is silent bookkeeping (no say line) — correct: the fix
*removes* a false punishment, and its signature is the ABSENCE of false
beats. Zero theft-confrontation / freeloader / hoard-accusation lines
fired against any successor on either side across 16 runs.
The fictiongate journalNote fires honestly on the meal-driven cold
shoulder (d13–14): "📓 Codex: The village has gone quiet around me.
I don't know why — I've eaten only what was set before me." The scholar
ate only served meals; the dated-voluntary ledger is clean; the line
says exactly that. (Adjacent observation, not chased: the d14 cold
shoulder still fires on cumulative meal takes — the #14 steve-call
family about the cumulative bar. Documented, out of this finding's scope.)

Sampled villager reactions to freeloader-adjacent pressure: none fired
this pilot (pipeline dormant on the feast substrate) — no robot verdicts
to judge; r8's sense test already covered the Route B fiction reading
as village decisions ("We've carried you long enough… Hands: 5 for
exile, 1 against").

## Village assessment
Scholars die constantly (131 successions / 16 runs, ~8 per run) — the
mantle is a revolving door on the courtship road, mostly to combat
(409 combat/monster/expedition deaths aggregate). Villages that survive
the churn reach national (7/8 armed) and the table waits (8/8 armed);
none won (0/8 both) — the mortality wall, not the ledger, binds wins.
The ledger reset is load-bearing precisely because succession is so
frequent: 74/81 armed successions carried a nonzero NPC-era book.
Who thrived: villages whose successors kept clean books held the
courtship window (national 7/8 armed vs 5/8 control). Who died: scholars
in the field, same as baseline. Missing: nothing in the ledger lane —
the blank is filled.

## Metric review
- The esc2+ PRIMARY was the right metric for the r8 mechanism but the
  channel is substrate-dependent (dormant under FEASTSCALE_R13=1). A
  future ledger arm on a non-feast substrate should re-check it; the
  verdict here does not claim the channel is dead, only that the reset
  introduces no regression where the channel is silent.
- Per-seed determinism: control/armed pairs share seeds; the harness
  freezes Date.now and seeds Math.random pre-eval (det-clean). The
  sweep's own wall-time logging was cosmetic-broken (Date.now is the sim
  clock) — results unaffected.
- Wave 4–5 unlocks were not instrumented in this pilot (ledger-arm
  scope); national/table/wins/median are reported as the wall numbers.

## Verdict
**GO — finding #16 CLOSED as fixed-by-r8, verified end-to-end.**
The r8 FRESH SOCIAL LEDGER reset is live, load-bearing (74/81 armed
successions cleared a real NPC-era book), and regression-free on every
pre-registered metric. No game-code change in this arm: deliverables are
the proof (scripts/test-ledgerreset-20261016.js, 19/19), the sweep
(scripts/sweep-ledgerreset-20261016.js), per-seed JSONs, and this file.
sim-findings.md #16 marked [fixed].
