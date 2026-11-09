# sim-53007-bisect-b — the endpoint moved (DIAG, zero src/js)

**Arm:** sim-53007-bisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T0330Z (Loop B, arm 3 of 3) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-53007-bisect-b, base master `55b5e5aaee4d8f980af9b239cb7044921edd95d7` (verified unchanged in the main tree at spawn) · **Prereg:** `evidence/2026-11-08/sim-53007-bisect-b-prereg.md` (+ Amendment 1) · **Instrument:** DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg, 150d death-aware, seed 53007 only. Corpora committed under `evidence/2026-11-08/perseed-53007-bisect-b/` (armed) and `evidence/2026-11-08/perseed-53007-bisect-b-unrec/` (unrecorded control). Proof `scripts/test-53007-bisect-b.js` **22 passed, 2 failed, 8 skipped** — the 2 failures ARE the verdict signal (see § Proof).

## Verdict: ENDPOINT-MOVED — STOP, no bisect

**The current-master endpoint headline is not reproduced, so the bisect does not run.** The prereg's stop rule fires as written: "if current-master 53007 no longer survives 150d / sits d95, STOP and report the endpoint as moved, do NOT bisect a ghost." Seed 53007 still survives 150 days on current master `55b5e5aae`, but it sits on **d90, not d95**, at **standing 199, not ≥ 500**, with **2 wave-4 kills, not 5**, and **maxWave 4, not 5**. The headline the bisect was to judge against — the 53007-a village (150d, lesser d95, standing 584, 5 w4 kills, wave 5) — no longer exists. The midpoint runs (`b74dc3007`, `ff252c1ac`) were never started; both midpoint legs in the proof SKIP. No landing is fingered, no landing is cleared. The medic-duty question stays open until a stable current-master 53007 headline exists to bisect against.

**What still holds:** the death is still gone in the weak sense — the village survives 150 days, and the sickness cascade still never forms (only Rafael dies of sickness, d16, the same first grave as on every master). What moved is not the survival but the *shape* of the survival: the village that lives is a different, harder-fought village, and its mechanism flipped from sickness-first to combat-led.

## The re-verification — old vs new headline

| | 53007-a master `6680d7924` | This arm, master `55b5e5aae` |
|---|---|---|
| Days / end | 150, survived | 150, survived |
| gameDays | 150 | 151 |
| Standing | 584 | 199 |
| maxWave / unlocked | 5 / 5 | 4 / 4 |
| Seat | lesser d95 | lesser d90 |
| Wave-4 kills (waveKillLog) | 5 | 2 |
| Wave-4 faced (finalSeat w4) | 5 | 6 |
| Fallen | 4 | 9 |
| Mechanism | sickness-first | combat-led (7/9 violent) |
| Living at end | 8 | 9 |
| Pantry at end | 400 kcal (0.2 food-days) | 29,100 kcal (13 food-days) |

The unrecorded control reproduces the new headline exactly (150d, survived, 199, maxWave 4, lesser d90, w4 2, 9 fallen) — G2 neutrality PASS, so the movement is master movement, not the recorder. The proof's endpoint-stability leg FAILS on exactly the moved fields (`headline.gameDays, headline.maxWave, headline.unlockedWave, headline.standing, fallen, daily, waveKillLog, takeseatStats`) — the designed signal, not a defect.

**Fallen, old:** d16 Rafael (sickness), d39 Luz (the wild), d68 Katarina (sickness), d147 Luke (the wild).
**Fallen, new:** d16 Rafael (sickness), d57 Luz (the wild), d75 Luke (the wild), d77 Klaus (the wild), d80 Se-ri (the wild), d81 Stan (the wild), d84 Katarina (thirst), d85 Riley (the wild), d87 Elena (the wild).

The new village bleeds out in the wild between d57–d87: eight deaths in thirty days, seven of them 'the wild', living 11 → 6 (joins mask part of the drop — one living note, Elena d87). The old village lost one person in the same window. The fights are the same fights — the village faces wave 4 six times, up from five — but it only kills twice. The pantry, meanwhile, is healthy at the end (29,100 kcal vs 400): this village does not die of hunger or sickness. It dies in the wild and survives anyway, thinner.

**The sickness story is unchanged.** The d14–16 cluster is identical in shape — Omar tick fever, Riley food poisoning (raw), Rafael wound fever, all with daysLeft counting down, all clearing by d17 except Rafael, who dies on d16. Sick on 70/149 rows, max 3 at once. The cascade that killed the healed endpoint never forms on either master. The pellet holder is null on every row (pelletPassDay null throughout) — no pellet bearer, so the pellet radiation rework cannot be the mover for this seed.

## What moved it (suspects, NOT proven)

78 commits sit between `6680d7924` and `55b5e5aae`; only seven touch `src/js/`:

1. **fightblend (`ecf3ff60d`, `3f405ff78`) — prime suspect.** Numerator-aware fight judgment + the fieldFights.js move. The signature fits exactly: same fights, worse outcomes for villagers (w4 kills 5→2, wild deaths 2→7, standing 584→199, Fight standing 7→6, Forage 33→23). The village fights wave 4 more often and wins less.
2. **sitmetric-b (`6a89df359`) — suspect for the seat day only.** "Close the reached-but-never-sat metric gap (finalSeat aligned with seatTaken…)" — the sit is now recorded when taken (d90, table set d90 in the transcript, audit the same day) rather than when the spool completes (d95). This can move the seat-day reading without moving the game; it cannot move standing, kills, or the mechanism flip.
3. **tenddrive — a wash.** Applied (`647e416fa`), reverted (`152ec1076`), re-applied (`9d7323b69`), reverted again (`48d9cf91b`, "zero src/js diff vs base"). Net zero against the base.
4. **Pellet radiation rework (`d3f63d49e`, `0d57a2378`) — ruled out for this seed.** No pellet bearer on any day (recorder diag, all rows null), same argument as 53007-a #16.

The movement is therefore most plausibly the fightblend landing's fight-judgment change, with the sitmetric change explaining the seat-day part of the headline shift. Neither is proven by this arm — proving it needs a before/after on the fightblend landing itself, which is a different arm.

## Village assessment — what the village looked like

Haven starts with twelve people and the same first grave as always: Rafael dies of wound fever on day 16, the village digs its first grave and understands at once that this place can kill you. Then the sickness that killed the healed endpoint never comes back — Omar's tick fever clears, Se-ri's wound fever clears, the sick count never passes three. Instead the wild takes the village apart in the wave-4 window: Luz on day 57, then Luke, Klaus, Se-ri, Stan, Riley, Elena, one after another, each with the full mourning beat — the village stops, somebody screams, somebody else starts digging, keepsakes buried, the quarrel not crossing the grave, the right speakers at each grave naming the next person. Katarina dies of thirst on day 84 while the pantry holds food — water, not calories, is the gap that day.

Around the dying, the region keeps score. The Red Table's tribute rises as Haven grieves — 4,000 kcal/week, then 6,000 after Luz's death ("Grief is leverage, and they know it"), then 9,000 — and the arrears notice comes on day 98 (37,000 kcal). Sam of The Red Table begs food at Haven's fire three times and is ignored three times, in identical words. The village still sits the lesser seat on day 90 and still ends the horizon with nine people alive and a full pantry — a village that survived its wild, not a village that solved it. The Audit comes on day 113 and the scholar, James, and Hassan bring it down with Harvest Scythes while the village watches the broadcast; Hassan is already telling the fire about James by day 114. That is the village's best day, and it happens a month after its worst month.

**Sense-test.** The mourning beats cohere and the names rotate correctly; the Red Table tribute arc reads as cause and consequence (grief → leverage → higher tribute). Two things read wrong: Sam's begging repeats verbatim three times with no escalation and no acknowledgement — the same event, the same lines, the same silence, as if the first two never happened; and the show's "Thumbnails" trailer lines repeat ~20 times identically on day 77, which reads as transcript spam rather than a broadcast. The Codex's "X is dead. You didn't ask. It knew." fires for every monster kill with names that repeat across kills (Big Loud dies six times) — coherent as a Codex tic, but the names are not unique per instance. See § Findings for the backlog.

## Wall numbers (this run — one seed, doorwalk baseline leg)

- National 0/1, table sits 1/1 (lesser only), wins 0/1 (baseline leg never walks a door).
- Wave-4 unlocks 1/1, wave-5 unlocks 0/1.
- Survival 150d (n=1); max 150d; min 150d.
- Telemetry deviation check: not run — DIAG re-verification, no lever before/after; the endpoint-stability leg is the validity check.
- Balanced panel (§15): not run — DIAG recorder corpus, same standing as 53007-a; `balance-panel.js` refuses recorder corpora by design (recorded, not forced).

## Proof

`node scripts/test-53007-bisect-b.js` — **22 passed, 2 failed, 8 skipped** (run after the corpora were committed-present):

- G1 det-gate — PASS on fixtures + committed corpora (P1 sickness-first, healed sickness-first, collapsed mixed/other, broken-classifier/broken-headline sensitivity, synthetic headline predicate incl. the 80d-death and standing-499 middle-shape checks, committed endpoint reads endpoint, committed 53007-a reads master).
- G2 neutrality — PASS on the re-verification pair (armed == unrecorded, same master `55b5e5aae`).
- G3 integrity — PASS on both new corpora (armed: gaps d2→d4 only; one living note, Elena d87, join-masked).
- The 2 FAILs are the endpoint-moved signal, by design: the re-verification headline reads **middle** (150d, standing 199, seatDay 90, combat-led) — neither the pre-registered master headline nor the endpoint headline — and the endpoint-stability leg fails on the moved fields. The proof refuses to call the moved endpoint "master", which is exactly what the prereg asked of it.
- The 8 SKIPped legs are the two midpoint runs (armed + unrecorded + integrity + headline each) — never run, per the stop rule.

## GO bars (binding)

1. Current-master re-verification reproduces the 53007-a headline — **FAILED: endpoint moved** (150d ✓, sit d95 ✗ d90, standing ≥ 500 ✗ 199). STOP fires; the run ends here.
2. Midpoint corpora with end snapshots — **not run** (stop rule).
3. Midpoint headline judged against the GO bar — **not run** (stop rule).
4. G1 det-gate — **PASS** (fixtures + committed corpora; the 2 proof FAILs are the endpoint-moved signal, not det-gate failures).
5. G2 recorder neutrality — **PASS** on the re-verification pair (armed == unrecorded on `55b5e5aae`).
6. G3 corpus integrity — **PASS** on both new corpora.

## Method note

- CANON.md read first; DISEASES.md and PRESERVATION.md for the area. No canon doc covers a "seed supposed to die" — the question was answered from measurement.
- Flap: ACTIVE ~04:20–04:59Z (~40 min), then flickering minute-to-minute. It killed three corpus writes (0-byte files removed each time) and one tar extraction, and refused two git probe writes. The clear at 04:59:48 lasted seconds for node writes (git writes passed, the next node write failed). Response: a retry preload (`scripts/flap-retry-preload-20261109.js`, written via the flap-proof write path, never committed, deleted after use) that wraps `fs.writeFileSync` with a bounded EPERM retry (180 × 2s, `Atomics.wait` — the harness freezes `Date.now`, so a `Date.now` spin loop exits early; the first version failed that way). The armed corpus landed on retry ~40–50; the unrecorded control landed on its first retry pass. The preload changes no measurement: same driver, same sim, same JSON — the corpus write is retried, nothing else.
- Safe-commit index clobber struck both commits this run (prereg; Amendment 1 + proof) — repaired via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, status clean + `git diff HEAD` empty after each. Hash-object matched the HEAD blob before each repair.
- Anchor quirk, disclosed (same as 53007-a): the new corpora's `anchorCommit` reads the worktree tip, not `55b5e5aae` — the driver runs `git rev-parse HEAD` in REPO and the scratch-dir path does not apply here; the re-verification ran in the worktree whose `src/` is byte-identical to master `55b5e5aae` (DIAG only — `git diff HEAD -- src/` is empty; the branch holds only prereg, amendment, proof, and corpora). The master under test is recorded here (`55b5e5aae`).
- No midpoint was extracted and no scratch dir was created (the stop rule fired before any midpoint work). No game-code change.

## Metric review

- The primary metric is the midpoint headline, judged against the GO bar — and the GO bar held: the re-verification's middle shape (150d, standing 199, seatDay 90, combat-led) was reported as middle, never forced into the master headline. The proof's 2 FAILs are the verdict, not a defect to work around.
- The stop rule's trigger deserves one note: the survival itself (150d) still holds — the death-removal premise survives in the weak sense. What moved is the village's shape (sit day, standing, kills, mechanism). The bisect was designed to judge the removal against the 53007-a headline; with that headline gone, running the midpoints would attribute a removal to a village that no longer exists in that form. The STOP is the prereg working as designed, not a missed run.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- One metric note carried from 53007-a: the `deathSays` filter catches "deadfall" (it contains "dead") — the first deathSays entries are deadfall-gathering lines, not deaths. A future instrument should filter `deadfall` out of the death regex. It did not affect any judgment here (the genuine death lines were read directly).

## Findings for the backlog

- "Ad Break" is a monster name, not a new death-cause family (this run: Stan puts down Ad Break on camera d29; the 53007-a "Ad Break" cause label on 53001 was the killer monster's name, same as Drum-Belly). The classifier's OTHER bucket does not need a new family for it.
- Sam of The Red Table begs food at Haven's fire three times (d57, d102, d126) with verbatim-identical lines and identical silence each time — no escalation, no acknowledgement, as if the earlier begging never happened.
- The show's "Thumbnails" trailer lines repeat ~20 times identically on d77 (transcript spam, not a broadcast).
- Codex "X is dead" lines fire per monster kill with names that repeat across kills (Big Loud dies six times) — monster names are not unique per instance.
- `deathSays` filter catches "deadfall" (contains "dead") — instrument quirk for the next recorder.

## Convergence state

scale-onramp stays **converging** (NOT converged): the 53007 bisect is BLOCKED, not answered — the endpoint moved under it, and the frozen band's shape is stale on the new master (53007-a warned this; now proven for the lead seed). The next blanks, in order: (1) a fresh re-baseline of the frozen band on the new master before any confirm leans on it; (2) re-ask the bisect once a stable current-master 53007 headline exists; (3) the fightblend movement itself — wave-4 kills down, wild deaths up, standing down by two-thirds on the same seed — is a winnability-chain signal worth its own arm, since it moves the chain's binding link in the wrong direction.

## Adoption handoff

1. **Verdict: ENDPOINT-MOVED — STOP.** The bisect did not run. Current-master 53007 (55b5e5aae): 150d, survived, lesser d90, standing 199, maxWave 4, w4 2, combat-led (7/9 wild). The 53007-a headline (d95, 584, maxWave 5, w4 5) is not reproduced. Unrecorded control matches exactly (G2 PASS) — the movement is master movement.
2. **No midpoint ran.** `b74dc3007` (medic duty) and `ff252c1ac` (double-night) are neither fingered nor cleared. The medic-duty question stays open.
3. **Prime suspect for the movement:** fightblend (`ecf3ff60d`/`3f405ff78`, numerator-aware fight judgment) — signature fits exactly (same fights, fewer kills, more wild deaths); sitmetric-b (`6a89df359`) for the seat-day reading only. Tenddrive is a wash; pellet radiation is ruled out (no bearer).
4. **Proof:** 22 passed, 2 failed (the designed endpoint-moved signal), 8 skipped (midpoint legs). G1/G2/G3 all PASS on what ran.
5. **Findings backlog:** five items under § Findings for the backlog above (Ad Break is a monster name; Sam's begging repeats verbatim ×3; Thumbnails spam ×20; Codex monster names repeat; deathSays catches "deadfall").
6. Worktree `~/workspace/worktrees/sim-53007-bisect-b`, branch `sim-53007-bisect-b`. No game-code trace: prereg + Amendment 1 + proof + 1 armed corpus + 1 unrecorded control. The flap-retry preload was deleted after use (never committed). No scratch dir was created.
