# Same-fight different labels — Loop B, run fleshout-loop-b-20261127T1830Z, arm sim-samelabel-b (BUILD)

Axis: winnability chain (re-point 2026-11-03). Answers wilddeath
blank #3 (evidence/2026-11-24/sim-wilddeath-b.md): in ONE fight —
Sam Wilson, seed 109448, day 88, four people vs three wave-4
Reunions — the scholar dies "the wild" while companions Olivia
Bennett and Caleb Jones die "combat".

Prereg: `evidence/2026-11-27/sim-samelabel-b-prereg.md` (committed
c35a265e5 BEFORE any code change). No new sims: the wilddeath
corpus (seeds 109447–109462) is already the evidence; the fixture
repro is the proof, not a band.

## Verdict — GO (CANON NOTE, not a fix — B1 and B3 pass; B2 partial, caveated below)

B2 as frozen ("affected tests green ... check.js --quick green")
is NOT fully met: check.js --quick is 339/344. The verdict stays
GO because every test that touches this arm's area is green
(proof test 7/7, wilddeath 11/11, arenalabel 13/13,
arenafallback 32/32) and all 5 quick failures are proven
pre-existing on the tip and unrelated to this change (arm diff
is docs-only; failing tests read only files this arm did not
touch). Per §14 the bar is NOT re-scored — it is recorded as
PARTIAL here, with the failures filed in sim-findings.md for a
proof-refresh arm. A future reader must not quote this run as
"check.js green".

| # | Frozen bar | Result |
|---|-----------|--------|
| B1 | Sam-fight repro shows the promised labels (scholar 'the wild', both companions 'combat', one day + one fight) | **PASS — 7/7 checks** (`scripts/test-samelabel-b-20261127.js`) |
| B2 | Affected tests green (wilddeath 11/11, arenalabel, arenafallback, check.js --quick) | **PARTIAL — 11/11, 13/13, 32/32 green; check.js --quick 339/344 with 5 failures, all 5 pre-existing on the tip and unrelated to this change (see below)** |
| B3 | No census/test regression: wilddeath analyzer re-run reproduces the frozen verdict; determinism replay identical | **PASS — 95 wild, 18/18 WILD-TB-FIGHT, 0 unclassified, 0 non-scholar wild; replay identical on all 5 attribution streams** |

## The decision, in one line

**CANON NOTE.** Both labels are true — the scholar's is PLACE,
the companion's is MANNER — so neither pipeline is wrong, and no
unifying relabel is safe. The asymmetry is now documented in
docs/MONSTER-WAVES.md §"Death causes in wild fights" (+ a
CANON.md change-log line), and pinned by the proof test so a
future relabel fails loudly instead of silently re-scoring a
census.

## Why not a fix (decision rule, judged)

The prereg's rule required ALL THREE conditions for a FIX.
It fails on the first two:

1. **Neither label is wrong.** The scholar DID die in the wild:
   departed, lost played field fight vs monsters, stamped by
   `tbFightDeathCause` (game.js:47978) — and the death line
   ("🕯️ Sam is dead — the wild") reads as a place. The
   companions DID die in combat: killed by monster blows in a
   fought fight, stamped by `tbDamage` (game.js:40928/40938).
   A difference is not a defect; each pipeline answers a
   different question with a true answer.
2. **Both candidate relabels break a load-bearing reader.**
   - Scholar → 'combat' would silence the standing.js:704
     wave-5 shortfall voice — the player-facing line that names
     scholars "dead in the wild while the fifth draft waits."
     It filters `village.scholarDeaths` on cause 'the wild' /
     'the expedition', and those rows carry no departed/tile
     field, so the voice could not be repaired without a schema
     change. It would also destroy the deliberate
     sim-arenalabel-b (2026-10-28) design: 'the wild' is what
     lets succession sweeps split arena deaths out from wild
     losses, and the arenalabel/arenafallback analyzers expect
     it.
   - Companions → 'the wild' in wild fights would not unify
     anything: the label would mean place in wild fights and
     manner in arena/contest fights — the same inconsistency
     relocated, not removed. And it would change the frozen
     wilddeath verdict on re-run (2 non-scholar 'the wild'
     deaths where the census says 0), violating the rule's
     corpus-reproduction clause.
3. **The unifying label is unprovable because it does not
   exist.** One cause string cannot carry place AND manner AND
   person-role. The correct unification is at the census layer:
   join same-fight deaths by day + fight (player flag + live
   `tbfight` / `tbFightId`), which the wilddeath instrument
   already does. That is the rule the canon note prescribes.

## What the proof test proves (B1)

`scripts/test-samelabel-b-20261127.js` — 7/7 PASS on the branch
tip, through the REAL paths (shared harness, seed 109448):

- `startCombat('reunion')` builds the mirror pack itself: three
  Reunion fighters (m_0/m_1/m_2) — the engine's own mirror, not
  a fixture invention — and auto-joins a nearby villager. The
  fixture tops the companions up to two from the real roster.
- `tbFightDeathCause(fight)` reads 'the wild' for the staged
  fight (proven wild: monsters, no hostile, no flags).
- Both companions fall to lethal `tbDamage(..., "Reunion's Your
  Move", 'm_0')` — the godpath lifeline holds one ally once per
  fight, so the test re-strikes until down — and each carries
  exactly one `registerDeath` row: kind 'person', cause
  'combat', player:false.
- The scholar goes down (`tbEndCheck` → `tbEnd('lost')`) and
  `playerDeath` is called exactly once with 'the wild'.
- All three deaths share one day + one fight id; the scholar
  label is not 'combat' and neither companion label is
  'the wild'.
- The scholar death lands 'the wild' everywhere it derives:
  fallen, scholarDeaths (the standing.js voice input, with the
  fight day), lineage, and the death line ("is dead — the
  wild"). The companions land 'combat' on the fallen roll too —
  the same asymmetry, second derivation.

## The full label map (read from code + corpus, for the note)

Corpus-wide `deathEvents` on the 16-seed wilddeath band:
('villager','monster',False) 48; ('person','combat',False) 2 —
exactly Olivia and Caleb, the only companions to die inside a
scholar's tb fight on the band; ('villager','the wild',True) 95.

- Scholar, lost tb fight → `tbEnd('lost')` →
  `playerDeath(tbFightDeathCause(f))`: 'the wild' (wild),
  'the arena' (arena), 'betrayal' / 'the table trial' /
  'the coalition arena' / 'a stranger' by origin.
- Companion in the same fight → `tbDamage` →
  `registerDeath({kind:'person', cause:'combat'})`.
- Villager, monster wounds outside the scholar's fight →
  `hurtVillager(..., 'monster', ...)` (game.js:8588) → 'monster'
  (48 on the band — this is what the wilddeath evidence's
  "another villager dies of 'monster' the same day" line was:
  a different villager dying elsewhere, not a companion in
  Miguel's fight).
- Villager, expedition death → `expedDeath`
  (villager-agency.js) → the killer's DISPLAY NAME as cause
  (e.g. 'The Eater').

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The decision rule's condition 1 ("one label is WRONG") was
  the wrong shape for this wart: the investigation proved
  within the first code read that both labels are true, so the
  rule could only ever return NOTE. A future fix-vs-note arm
  should pre-register the load-bearing-reader test (condition
  2) as the primary gate and treat "wrongness" as the
  exception, not the default.
- B2's `check.js --quick` is the slowest bar in this arm (box
  load from sibling sims, not this change — the change touches
  no src/js). If a future arm is docs+test only, the quick
  check still has to run; budget for it.
- The fixture stages the fight on day 1 (setupGame start), not
  day 88 — the Sam shape is structural (party vs mirror pack),
  not a replay. The seed (109448) is fidelity garnish, not a
  claim that the run was reproduced.
- The lifeline hold (godpath allyWouldFall, once per fight) is
  a real fixture hazard: a single lethal tbDamage may NOT kill
  a companion. The proof test re-strikes until down and asserts
  exactly one registerDeath row per companion — the pattern to
  reuse for any future tb companion-death fixture.

## Proof and landing

- Proof: `scripts/test-samelabel-b-20261127.js` — 7/7 PASS on
  the branch tip (re-run green after the canon note landed;
  the note changes no code, so the test result is unaffected
  by it — the note and the test were committed together).
- B2: `scripts/test-wilddeath-b-20261124.js` 11/11 PASS;
  `scripts/test-arenalabel-b.js` 13 passed, 0 failed;
  `scripts/test-arenafallback-b.js` 32 passed, 0 failed.
  `node scripts/check.js --quick`: 339 passed, 5 failed in 927s
  (EXIT 1) — NOT green, and the bar as frozen is therefore not
  fully met; the verdict stays GO only because all 5 failures
  are proven unrelated to this change (see below) and the
  change touches no src/js. The 5:
  - `test-measurement-proof-update.js` (exit 1): "Proof source
    inputs are not current" — the retained balance proof's
    manifest no longer matches the tip's observer inputs.
  - `test-measurement-workflow.js` (exit 1): "retained
    neutrality proof covers the current Game/controller/harness
    inputs" fails (8 passed, 1 failed).
  - `test-phone-frame-proof.js` (exit 1): retained phone
    receipt is stale vs current source (index.html,
    alienPlayers.json, build-notes.json, foreignSpeech.json,
    regions.json, statusEffects.js); 3 passed, 3 failed.
  - `test-living-garden-deed-attainment.js` and
    `test-one-person-army-deed-attainment.js`: [check.js]
    TIMEOUT after 120s each (slow deed-attainment sims under
    box load 12–15 with sibling sims running; the same
    living-garden script was observed running in a sibling
    loop's check at the same time).
  Pre-existence proof: `git diff HEAD --stat` for this arm is
  exactly docs/CANON.md + docs/MONSTER-WAVES.md (59 insertions)
  plus untracked new files (the proof test + this evidence);
  the failing tests read only src/js, src/data, index.html,
  and the retained proof JSONs — files this arm did not touch.
  The three fast failures reproduce deterministically on
  direct re-run (same messages), i.e. stale retained proofs on
  the tip, not flakes. They are the ship loop's / a proof-refresh
  arm's to clear, not this arm's: refreshing a balance/phone
  proof is a separate maintained-proof workflow (AGENTS.md:
  "Refresh it with scripts/balance-proof-update.js") and
  outside the fix-vs-note scope. Filed in sim-findings.md.
- B3: re-ran `scripts/wilddeath-b-analyze-20261124.js`
  `summarizeAll` over the 16 judged per-seed JSONs
  (evidence/2026-11-24/perseed-wilddeath-b/, driver in /tmp —
  no repo writes): 95 wild deaths, 18/18 veteran
  WILD-TB-FIGHT, share 1.0, 0 unclassified wild veteran
  deaths, 0 unclassified wild deaths; monster counts identical
  to the frozen verdict (reunion 11, editor 4, suburb 4,
  eulogy 4, timeslot 2, audit 1, algorithm 1; w4 21, w5 6).
  Determinism: the 109447 replay file matches its judged twin
  on all 5 attribution streams (deathEvents, killEvents,
  playerDeaths, regDeaths, daily) — files differ only in the
  RUN slot. The old verdict is NOT re-judged; it reproduces.
- Commits (this worktree branch sim-samelabel-b; coordinator
  merges via --ff-only; ready to merge, pending ship — no push,
  no bump, no live verification by this worker):
  - `c35a265e5` sim-samelabel-b prereg (before any code change)
  - `5463b661b` sim-samelabel-b canon note (MONSTER-WAVES.md § +
    CANON.md log) + proof test (7/7, re-run green on the tip)
  - (evidence commit follows)
- Files: prereg + evidence in `evidence/2026-11-27/
  sim-samelabel-b*.md`; proof test
  `scripts/test-samelabel-b-20261127.js`; canon note in
  `docs/MONSTER-WAVES.md` §"Death causes in wild fights" +
  `docs/CANON.md` change log.
- Wall numbers: no sims staged by this arm (fixture only).
  The wilddeath corpus numbers stand: wins 0/16, national 0/16,
  table 0/16, wave-5 unlocks 9/16, median survival 150
  (censored) — see evidence/2026-11-24/sim-wilddeath-b.md.
- Convergence state: GO (CANON NOTE) — wilddeath blank #3
  closed. The wart is documented and pinned; the next work on
  this chain is the fight itself (win-fielddmg lane,
  persistent parties), not attribution.
- Infrastructure: safe-commit index clobber struck on the
  prereg commit (committed file showed staged-deleted,
  byte-identical on disk); repaired with the documented pipe
  (`git ls-tree -r HEAD -- <path> | git update-index --add
  --index-info`), verified status empty + diff HEAD empty +
  hash-object matches. No write-flap window hit this run.
