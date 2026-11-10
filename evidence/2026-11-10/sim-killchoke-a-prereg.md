# sim-killchoke-a — preregistration (DIAG ONLY, zero src/js changes)

- Arm: sim-killchoke-a (Loop A run fleshout-20261110T1915Z, axis scale-onramp / winnability chain)
- Branch: sim-killchoke-a; base anchor `70e3af870` (worktree `~/workspace/worktrees/sim-killchoke-a`)
- Instrument: scripts/killchoke-a-driver.js + scripts/killchoke-a-analyze.js (new; derived from scripts/vetcount-b-driver.js — same daily census, competent policy, 150d death-aware — PLUS per-call attribution with an independent implementation: raw stack frames stored in the corpus and classified OFFLINE in the analyzer, settlement-invocation counting, fight/monster-instance identity, dead-fighter census, per-call ledger scoring). Proof: scripts/test-killchoke-a.js.
- Context (must-read): evidence/2026-11-10/sim-vetcount-reconcile-b.md § "The disagreement was bigger than wave 4", and evidence/2026-11-10/sim-choketrace-b.md.

## Sibling-work disclosure (read before running)

Loop B arm **sim-choketrace-b already answered this exact question on this exact band** — commit `74eccccd2` (2026-11-10 16:18Z), already on local master, evidence `evidence/2026-11-10/sim-choketrace-b.md`, corpus `evidence/2026-11-10/perseed-choketrace-b/`. Its verdict was DIAG-GO: 16/16 bursts attributed, 0 UNATTRIBUTED; the headline finding overturns the premise — **there is no re-fire**: all 32 "duplicate" calls are genuine second/third/fourth bodies that the (day, mid, by, via, trick) dedupe key collapses (belltoad-chorus packs in one TB fight, contest gauntlet waves, two wild fights same day). Ledger double-score: 4 calls scored +1, 28 already capped, 0 bar crossings.

This arm therefore runs as an **independent replication / confirmation**, not a first trace, with a genuinely independent implementation (see Method) plus one coverage extension the sibling left open. The coordinator's 1915Z claim listed the kill-choke trace as tracker blank #9, apparently unaware choketrace-b had already landed; this arm does not pretend otherwise. If this replication AGREES with choketrace-b on every per-seed count, the premise-overturning result is doubly confirmed and the backlog item can be closed as answered. If it DISAGREES anywhere, the discrepancy is investigated in-run and reported, not smoothed over.

## Primary metric

**Attribution coverage of re-fire bursts.** A re-fire burst is a maximal group of
recordWaveKill calls sharing one dedupe key (day, mid, by, via, trick) with
size >= 2 (the first call is the kill, the rest are re-fires). DIAG-GO iff
every re-fire burst on the band is attributed to a named caller path, none
UNATTRIBUTED.

## DIAG-GO threshold (strict)

- Every re-fire burst on seeds 140201–140208 is attributed to one of the nine
  named caller paths below; zero bursts classified UNATTRIBUTED.
- For each burst, the attribution states the burst shape: same settlement
  invocation (one fight, several dead fighters of the type — genuine
  multi-body) vs several settlement invocations (separate fights same day),
  with the monster-instance identity where the path stamps it.
- Ledger verdict quantified: for each re-fire call, whether scoreLedgerKill
  scored it twice (cap room existed, add > 0) or it was already capped
  (add = 0); count and verdict on whether the double-score matters.
- Replication agreement (secondary, strict): per-seed call totals, dup-call
  totals, pyrrhic totals, and burst count agree EXACTLY with the choketrace-b
  corpus on all 8 seeds. Any mismatch is a finding, investigated before verdict.

## Coverage extension (beyond the sibling)

Choketrace-b left four of nine paths unexercised (patrol, sortie,
contest-hide, contest-beastmaster — 0 calls). This arm additionally counts
**settlement-invocation totals**: how often each settlement function itself
runs per seed (tbEnd, resolvePatrol, resolveWildMonsterEncounter, aidFight,
_cxBlood, _cxOther, lingererSortie, expeditionMonster), so a zero-call path
can be told apart as "never ran" vs "ran but reported no kills". The
extension is reported as coverage data; it does not change the GO bar.

## Candidate caller paths (from the grep census, read before running)

Nine recordWaveKill call sites, eight `via` channels (same census as
choketrace-b, re-verified by grep in this worktree before running):

1. `tb-end` — src/js/game.js tbEnd, via `player` / `companion`.
2. `patrol` — src/js/game.js resolvePatrol, via `patrol`.
3. `wild` — src/js/game.js resolveWildMonsterEncounter, via `wild`.
4. `aid-crisis` — src/js/comms.js aidFight, via `aid-crisis`.
5. `contest-blood` — src/js/contestEngine.js _cxBlood, via `contest`.
6. `contest-hide` — src/js/contestEngine.js _cxOther (hide), via `contest`.
7. `contest-beastmaster` — src/js/contestEngine.js _cxOther (beastmaster), via `contest`.
8. `sortie` — src/js/havenGrowth.js lingererSortie, via `sortie`.
9. `agency` — src/js/villager-agency.js expeditionMonster, via `agency`.

recordPyrrhicKill has one call site only (game.js tbEnd, lost fights);
recorded for completeness, not a re-fire path (it never calls
scoreLedgerKill).

## Horizon

150d death-aware (same as the vetcount band: reachability horizon per
MEASUREMENT.md §10 — the bursts live on the vetcount band and the question
is about that band's accounting, not a new lever).

## Seeds — REUSED BAND, rationale recorded (per task + seed-band skill)

Band **140201–140208 is REUSED deliberately** — it is named in the vetcount
prereg, the choketrace-b prereg, and this prereg, so under the
local_seed_band_freshness skill it counts as used, not fresh. The reuse is
the sanctioned exception the skill describes ("reuse a band only after its
reservation is explicitly released"): the assignment itself releases it,
because this arm's question is defined BY that band — attribution of the
bursts measured there, and replication agreement with the choketrace-b
corpus, are only meaningful on identical seeds. A fresh band would answer a
different question (do bursts generalize?) and could not confirm or refute
the sibling's verdict. Search scope for the freshness check: preregs under
`evidence/2026-11-10/sim-*-prereg.md` naming 140201–140208 — vetcount
(140201–140208), choketrace-b (140201–140208), capstoneready re-measure
(140201–140208). No other band is used by this arm. Policy: competent
(plain competent policy, as in the vetcount driver).

## Method

1. Recorder derived from scripts/vetcount-b-driver.js. Each recordWaveKill /
   recordPyrrhicKill call stamps: method, day, mid, by, via, trick, logged,
   dup (as vetcount did) PLUS the raw call-stack function names (top 14,
   stored verbatim in the corpus — the analyzer classifies paths OFFLINE
   from these, so the corpus is auditable and the classification can be
   re-derived without re-running), settlement-invocation id (lightweight
   pass-through wrappers around the eight settlement functions — they count
   invocations and stamp the active id only; no RNG, no state mutation),
   fight/monster-instance identity (tbfight object id for TB; fieldFight
   monster-object id for field paths), dead-fighter census by type at call
   time (TB, only inside an active tbEnd invocation), and per-call ledger
   scoring (ledger per-type before/after around the call).
2. Settlement-invocation counters (extension): per-seed totals of each
   settlement function running, reported alongside kill-call counts.
3. Classify every re-fire burst by caller path (offline, from stored
   stacks); per-path counts; burst shapes (same-day / same-killer /
   same-monster / same-channel, same vs several invocations, same vs
   several monster instances). A burst whose shape contradicts the
   genuine-body reading (same settlement invocation, ONE dead fighter of
   the type, same monster object) is classified RE-FIRE, not genuine.
4. Ledger question: for each re-fire, inside cap room (scored twice) or
   already capped (no effect). Count + verdict.
5. Replication agreement: per-seed call/dup/pyrrhic/burst counts vs the
   choketrace-b corpus files (read-only comparison, no overwrite).
6. Scale-wall numbers for the corpus: national / table / wins, wave 4–5
   unlocks, median survival.
7. Proof test scripts/test-killchoke-a.js: offline classifier mapping (all
   nine settlement names → path; unknown stack → UNATTRIBUTED with frames
   preserved), synthetic-burst attribution (tb multi-body, contest
   gauntlet, wild distinct objects, and a FORCED same-instance re-fire
   classified RE-FIRE), determinism (same seed twice, 30d, identical call
   records), neutrality (recorder off = identical trajectories vs recorder
   on, 30d), settlement-invocation counting (tbEnd count > 0 on a 30d run).

## Attribution limit (stated up front)

The (day, mid, by, via, trick) dedupe key cannot distinguish a re-reported
kill from a genuine second beast of the same type killed the same day by the
same killer via the same channel with the same trick. This arm's attribution
goes one level deeper — settlement-invocation id + monster-instance identity
+ dead-fighter census — which separates (a) one settlement, several dead
fighters of the type (genuine multi-body), from (b) several settlements the
same day, and (c) the same world monster object fought twice (re-fire of one
instance) from different instances. Where a path cannot stamp a monster
instance (agency picks a fresh mdef each encounter; sortie/contest beasts
are fresh objects), the limit stands and is stated as such in the evidence
— the burst is still attributed to its caller path, but the same-instance
vs second-beast call is marked UNRESOLVED for that burst, not guessed.

## Metric review

(To be filled in the evidence file after the run.)
