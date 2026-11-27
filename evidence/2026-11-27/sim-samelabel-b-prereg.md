# Same-fight different labels — Loop B, run fleshout-loop-b-20261127T1830Z, arm sim-samelabel-b (BUILD)

Axis: winnability chain (re-point 2026-11-03). This arm answers
wilddeath blank #3 (evidence/2026-11-24/sim-wilddeath-b.md,
"SAME-FIGHT DIFFERENT LABELS"): in ONE fight — Sam Wilson, seed
109448, day 88, four people vs three wave-4 Reunions — the
scholar's death is stamped "the wild" via `tbFightDeathCause`
(game.js:47978) while companions Olivia Bennett and Caleb Jones
die "combat" in the same fight via the fight settlement pipeline.
One event, two labels; any future census counting "wild" deaths
as non-fight deaths misreads the engine.

Anchor: HEAD at prereg time (branch sim-samelabel-b; this
worktree's tip — see commit). Canon read first: docs/CANON.md,
docs/MONSTER-WAVES.md. Evidence read first: the wilddeath
evidence §"SAME-FIGHT DIFFERENT LABELS" and its sense-test trace
(Sam 109448 d88), plus the corpus row itself
(evidence/2026-11-24/perseed-wilddeath-b/wilddeath-b-s109448-wilddeath-b.json:
deathEvents day 88 — caleb_jones "combat", olivia_bennett
"combat", sam_wilson "the wild", all player:false/false/true).

## The two pipelines (read from code before this prereg)

- Scholar: `tbEnd('lost')` → `playerDeath(tbFightDeathCause(f))`
  (game.js:48334). `tbFightDeathCause` (game.js:47978) is
  origin-labeled BY DESIGN (sim-arenalabel-b 2026-10-28): a
  proven wild fight — ≥1 monster fighter, no hostile fighter,
  none of the arena/betrayal/table-trial/coalition flags — reads
  'the wild'; arena reads 'the arena'; betrayal / table trial /
  coalition arena / alien-hostile name themselves. `playerDeath`
  (ledger.js:744+) records the cause verbatim into registerDeath
  (player:true), fallen, scholarDeaths, lineage, and the death
  line ("🕯️ X is dead — the wild").
- Companion (villager/ally kind) falling in the SAME fight:
  `tbDamage` (game.js:40131, death branch ~40928/40938) →
  `registerDeath({kind:'person', cause:'combat'})` — a manner
  label, with no fight-origin information at the call site.
- Villager dying of monster wounds OUTSIDE the scholar's fight:
  `hurtVillager(vid, dmg, 'monster', ...)` (game.js:8588) →
  cause 'monster'. Villager dying on expedition: `expedDeath`
  (villager-agency.js) → cause is the monster's DISPLAY NAME
  (e.g. 'The Eater'). The corpus bears this out: 48
  ('villager','monster',False) deaths vs exactly 2
  ('person','combat',False) deaths on the 16-seed wilddeath band
  — the two companions in Sam's fight.
- Readers of the scholar's 'the wild' label: standing.js:704
  (the wave-5 shortfall voice names scholars "dead in the
  wild" — player-facing); the arenalabel/arenafallback analyzers
  (which expect 'the wild' for wild-origin tbEnd losses);
  cascade / fighterhold / attrition analyzers; the COMBAT_CAUSES
  sets (which already include 'the wild' as a combat cause).
- Readers of the companion 'combat' label: the same
  COMBAT_CAUSES sets; memorial / graves / journal display.

## Question

FIX or CANON NOTE? A small fix unifying the label is preferred
IF it is safe and provable; otherwise the asymmetry is
documented in the right canon doc so no future census re-learns
it.

## Decision rule (frozen — judged in the evidence file, not revised mid-run)

FIX only if ALL THREE hold:
1. One pipeline's label is WRONG for the event (contradicts
   the fiction or the code's own account of it) — not merely
   different from the other pipeline's label.
2. Unifying it changes NO player-facing read of the label
   (standing.js shortfall voice, death line, memorial/graves/
   journal) and NO analyzer's classification on the wilddeath
   corpus (the frozen verdict — 95 wild deaths, 18/18 veteran
   WILD-TB-FIGHT, 0 non-scholar wild — must still reproduce).
3. The unifying label is provable on the Sam-fight fixture
   (scholar + 2 companions dying in one staged wild field
   fight).
Otherwise CANON NOTE: a section in docs/MONSTER-WAVES.md (+ a
CANON.md change-log line) stating the asymmetry, the two call
sites, why each label is true (place vs manner), why the
scholar label must stay 'the wild' (standing voice +
  arenalabel design), and the census rule (never count 'the
  wild' as non-fight; join same-fight deaths by day + fight,
  not by cause string alone). Either way the fixture test pins
the documented behavior so a future relabel breaks loudly.

## Pre-registration (binding, §11/§14) — FROZEN BARS

Judge ONLY against these bars. GO requires ALL of:

1. **B1 — Sam-fight repro shows the promised labels.**
   New proof `scripts/test-samelabel-b-20261127.js`: a staged
   wild field fight (scholar + 2 companions vs 3 wave-4
   Reunions, the Sam 109448 shape) asserts the scholar's death
   carries 'the wild', BOTH companions' deaths carry 'combat',
   and all three deaths share one day + one fight id (the
   fight-join rule identifies them as one fight). The test
   passes on the branch tip.
2. **B2 — affected tests green.** `scripts/test-wilddeath-b-20261124.js`
   (11/11), `scripts/test-arenalabel-b.js`, and
   `scripts/test-arenafallback-b.js` all green on the branch tip;
   `node scripts/check.js --quick` green.
3. **B3 — no census/test regression.** The wilddeath analyzer
   re-run on its own corpus
   (evidence/2026-11-24/perseed-wilddeath-b/, 16 judged files)
   reproduces the frozen verdict (95 wild deaths, 18/18 veteran
   wild deaths WILD-TB-FIGHT, 0 non-scholar wild, 0
   unclassified); the determinism replay file still matches its
   judged twin on every attribution stream. The old verdict is
   NOT re-judged — the re-run only checks it still reproduces.

Secondary (recorded, NOT judged): whether the fix-vs-note
decision is FIX or NOTE (the decision rule above decides it;
either outcome is a GO if the bars pass); the standing.js
shortfall voice still fires for a 'the wild' scholar death
(read from code, not re-staged); wall numbers (this arm stages
no sims — the wilddeath corpus, seeds 109447–109462, is already
the evidence).

## Method

No new sims. Fixture repro is the proof, not a band (§9–12 as
they apply: pilot = the fixture itself; the corpus is the
pre-existing evidence). Staging: the proof test drives the REAL
`startCombat('reunion')` + `tbDamage` + `tbEnd('lost')` paths
through the shared harness (`scripts/sim-harness.js`,
seeded Math.random before eval, full src/js list in index.html
order minus DOM-only files). Never stub Game.save.
Deliverables: this prereg (committed BEFORE any code change);
the proof test; the fix (if the rule says FIX) or the canon
note (if NOTE); evidence `evidence/2026-11-27/sim-samelabel-b.md`
with the decision, the judged numbers per bar, and a "metric
review" section (§14); findings outside this arm appended to
`hidden_files/sim-findings.md`, not chased. No push, no bump, no
live verification (coordinator merges --ff-only; ship loop owns
deploys).
