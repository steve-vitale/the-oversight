# TB retreat-and-refind — PRE-REGISTRATION (arm sim-tbretreat-b)

Run: fleshout-loop-b-20261105T1423Z. Axis: scale-onramp / winnability
chain (wild ally-join → wave-4 kills → veterans → readiness-5 release
→ wave-5 facing → full seat). Tracker's next blank (#2 from the 1322Z
run, sim-grindfinish-b): the grind step's price — a TB fight ends
death-or-win, so every grind step costs a scholar's life. Committed
BEFORE any judged sim.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": wave-4 bands (anchored):
  damage 35–95, HP 850–1500, pierce 0.2–0.5. Wave 5 demands 2 LIVING
  villagers with wave-4+ kills. No canon invented here.
- `docs/CONTESTS.md`: contests are played, not RNG — a TB fight the
  scholar enters through a contest/trial is the fight's own waves, not
  the tile monster (bystander hold, game.js:34512-34528). This lever
  never touches a contest fight: it only records an origin when the
  tile monster IS one of the fight's monsters.
- Steve 2026-11-02 monster-commitment ruling (MONSTER-WAVES.md,
  fieldFights.js `mCanFlee`): monsters do NOT flee unless their kind
  carries an explicit flee component. This arm changes NO monster flee
  behavior: the monster never withdraws, never flees, never routs
  because of this lever. Only the FIGHTER withdraws — the player /
  scholar walking out through the barrier, exactly as the engine
  already allows (tbBarrierExit). The proof carries a
  monster-flee-unchanged control.
- Steve 2026-10-08 (MONSTER-WAVES.md / CANON.md): "Monster encounters
  are fought, not rolled" — blow-by-blow with real stats. This arm
  measures fought retreats and re-finds, never an outcome table.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-05/sim-grindfinish-b.md` (band 99309–99316, 150d,
  8 seeds, DIAG-NO): the chain's plumbing works (lift 88.2% of TB
  fights, fidelity 29/30; TB→TB continuation 13/14, reset 0; re-find
  36% in 7 days) and the kills that happened came fresh, not wounded
  (2/9 fresh-entry kills, 0/30 lifted). The price binds: TB fights
  end death-or-win — 32 death, 2 won, **0 fled** band-wide. Six
  scholars died to one beast across days 63–65 (seed 99313, roster
  7→0, beast left at 114 HP). The grind is invisible in the fiction
  — no line ever names the beast or its remaining HP.
- `evidence/2026-11-05/sim-staypolicy-a.md` (band 99241–99248, 150d,
  8+8 seeds, NO-GO on kills): the policy-side disengage
  (flee-when-losing, frozen 50/50 trigger) works mechanically —
  trigger fired 17/23 armed TB fights (74%, 17/17 on the line), TB
  flees 0 → 6, TB deaths 21 → 16 — but kills did not move (armed
  1/49 = 2.0% vs baseline 0/43, bar ≥15% and ≥3; the one armed kill
  is a mop-up the trigger never touched). Exact accounting of the 17
  firings: 6 exits, 5 sealed-fallback deaths, 6 died mid-retreat.
  Staypolicy's next blank names damage/survival per round and an
  EARLIER disengage line — neither is this arm. This arm tests the
  OTHER half staypolicy could not: what happens AFTER the exit.
  Staypolicy never measured whether the beast's wounds survive a
  retreat, because on its code the answer was already known — they
  don't (see mechanism map, rule 5).
- `evidence/2026-11-04/sim-fleerepair-confirm-a.md` (12-seed confirm,
  GO): the flee branch repair (directional flee, exit-verified,
  stuck fallbacks) is confirmed policy-side; its game-code port is a
  Steve call and is NOT claimed here. This arm does not touch the
  flee branch, the competent.js flee(), or any fleerepair file. The
  disengage verbs this arm's driver uses are the w4abstain-proven
  barrier-exit verbs, unchanged since staypolicy-a.

## The mechanism map (read from the code in this worktree, before any sim)

All line numbers are this worktree (`sim-tbretreat-b` branch, tip
1de41ff6f):

1. **Fight start lifts the tile monster off the map** —
   `src/js/game.js:34518`: `if (_origin && _originIsFighter)
   this.removeWorldMonster(_origin)`. The world entity is removed
   the moment the fight starts.
2. **Only titans/lingerers are remembered for restore** —
   `game.js:34528`: `if (_origin && _originIsFighter &&
   (_origin.titan || _origin.lingering) && this.tbfight)
   this.tbfight.worldOrigin = _origin`. An ordinary wild tile
   monster gets NO worldOrigin recorded.
3. **tbEnd restores only what was recorded** — `game.js:45480-45530`:
   the restore block runs on `f.worldOrigin` only. Lingerers restore
   on fled/lost at `min(preHp, fighterEndHp)` floored at 1, placed
   back at the village treeline (`game.js:45511`); titans restore at
   full HP. An ordinary wild monster that ends fled/lost is simply
   GONE — no restore path exists (grindfinish rule 5). A won fight
   removes it by death.
4. **The lifted world object is untouched during the fight** —
   wall-wounds comment (`game.js:45502-45511`): the fighter is a
   fresh copy built from the mdef range, so `o.hp` at tbEnd IS the
   pre-fight world HP. The restore cap `min(preHp, fighterEndHp)`
   therefore never heals pre-fight wounds.
5. **Door-flee already preserves wounds its own way** —
   `game.js:36244`: a door flee stashes fighter HP in
   `state.doorFledMonsters`; `game.js:12320` re-engage honors stashed
   wounds via `mf.hp = max(1, min(mf.maxHp, w.hp))`. A door-fled
   beast is preserved by the stash, not by the world — this lever
   must not double-preserve it (see lever, rule R5).
6. **Barrier exit ends the fight as 'fled'** — `game.js:36245`
   (door branch), `game.js:36370-36420` (barrier branch: no-chaser /
   Haven / all-chasers-gave-up call `this.tbEnd('fled')`). The chase
   continues on the new node when chasers persist — no tbEnd, no
   restore, the fight is still live.
7. **The re-find channel already exists and is perception-gated** —
   a restored world monster sits on a tile; the village meets it
   again only by being there (travel, patrol, wanderer contact,
   treeline) or by the lift when a fight starts on its tile. No
   roster, no snapshot, no list is fed to any decision: the beast is
   a world entity on the ground where the fighter saw it, and the
   re-find is measured the same strict way grindfinish measured
   re-finds (exact-HP equality, day gap). The retreat decision
   itself is the fighter's own: scholar HP and the monster HP in
   front of them, in this fight, right now (staypolicy trigger).

Consequences the lever tests empirically: today a retreat deletes
the grind's progress for ordinary wild beasts (rule 3) — the next
fight of that type is a fresh entity. If the beast stays wounded on
its tile, the next scholar faces it at the exit HP and the grind
continues without a death. The lever is the restore, not the retreat:
the retreat already works (staypolicy: 6 exits).

## Lever picked — TBRETREAT_RESTORE (game-code instrument, default OFF)

**Flag:** `TBRETREAT_RESTORE=1` (env, read at tbEnd/startCombat
time, same convention as `FOODVOICE2_GATE`, `FIGHTOPEN`,
`RAIDDENSITY` in src/js). Default OFF in production (the browser
has no process.env) and OFF in the baseline leg. No default flip,
no gate/price/deed/readiness/XP/gear change, ever. No monster flee
behavior is added or changed: the monster's flee component, or its
absence, is untouched — the flag's code runs only inside tbEnd
after a fighter-initiated 'fled' result.

**R1 — record the origin (startCombat, game.js:34528, beside the
titan/lingering line):** when the flag is on and `_origin &&
_originIsFighter` and NOT (`_origin.titan || _origin.lingering`),
record `this.tbfight.tbRetreatOrigin = _origin`. A separate field —
`worldOrigin` and the titan/lingering restore path are byte-untouched.
Contest/trial fights never record (their `_origin` is null or a
bystander, same guard as worldOrigin).

**R2 — restore on retreat (tbEnd, after the existing worldOrigin
restore block):** when the flag is on and `result === 'fled'` and
`f.tbRetreatOrigin` is present and `f.worldOrigin` is absent, restore
the origin monster:
- wave gate: the monster's wave (fighter mdef.wave) must be >= 4.
  Waves 1–3 keep today's melt-away behavior exactly.
- standing: at least one fighter of that monster id must be alive
  (`standing.length > 0`, same shape as the lingerer block). A beast
  killed to 0 HP is dead, not restored — a 'fled' with all monsters
  dead restores nothing.
- no duplicate: skip if the origin is already in `worldMonsters()`
  or a monster already sits at its tile (`monsterAt(o.tx, o.ty)`).
- hp: `o.hp = max(1, min(preHp, standing[0].hp))` where preHp is
  `o.hp` at tbEnd (the untouched pre-fight world HP, rule 4),
  floored at 1 — the wall-wounds formula, same as lingerers.
- tile: the origin keeps its OWN pre-fight tile (`o.tx, o.ty`
  untouched — NOT moved to the village treeline; the treeline move
  is the lingerer/siege rule, this beast was met in the wild and
  stays where it was met, where the fighter saw it).
- publish: `worldMonsters().push(o)`, `touchTileScene(o.tx, o.ty)`,
  `syncMonsterAlias()`, and one honest say line naming the wound
  kept (so the retreat is visible in the fiction, closing
  grindfinish's narration blank for this channel).

**R3 — 'lost' does NOT restore for ordinary wild monsters.** The
fighter died; the beast stays gone, exactly as today. Extending the
restore to deaths is a separate, bigger decision (it would change
the grind's price for every death, not just retreats) and is named
as a follow-up in the evidence, never smuggled in here.

**R4 — pack approximation, disclosed:** the restore uses
`standing[0].hp` (first standing fighter of that id), the same
approximation the lingerer block uses. In a multi-monster pack the
restored HP may be a packmate's end HP rather than the lifted
origin's. The instrument measures restore fidelity (restored HP vs
the fight's recorded primary end HP) so any pack skew shows up in
the corpus instead of being assumed away.

**R5 — door-flee skip:** if `state.doorFledMonsters` holds an entry
for this monster id at tbEnd time, skip the restore — the stash
already preserves that beast's wounds and re-engages with them
honored (rule 5). One preservation channel per beast, never two.

**Policy driver:** `scripts/policies/competent-tbretreat-b.js` — a
thin wrapper re-exporting `flee-when-losing.js` VERBATIM (frozen
50/50 trigger: scholar HP fraction < 0.50 AND live wave-4
monsters' remaining HP fraction > 0.50; stuck/sealed guards
unchanged; nearest-edge barrier exit). NO trigger tuning — the
earlier-line variant is staypolicy's named follow-up, not this
arm's. The wrapper exists so the arm has a named policy and the
driver can capture `stayStats` per seed; it changes no behavior.
The armed leg is therefore IDENTICAL to staypolicy-a's armed leg
except the flag — the delta against staypolicy-a's published armed
numbers isolates the restore. `competent.js` is byte-identical.

**Perception law (local_perception_first):** every decision this
lever adds is grounded in what the fighter saw: the retreat fires
on the HP in front of them in this fight; the beast stays where it
was met; the re-find happens only when the village meets it again
on the ground. No roster, crew list, outdoor list, or snapshot is
passed into any decision. The proof shows a re-find firing from a
restored world entity met on its tile, not from a list.

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 99721–99728: verified free — exact whole-token grep of
  each seed across ALL dated preregs (`evidence/*/sim-*-prereg.md`)
  plus all dated evidence `.md` files: zero hits. No perseed
  filename in `evidence/` names any 99721–99728 seed (the only
  `*9972*` filenames are seed 9972 and seed 99972 — different
  seeds). Whole-token ripgrep (`-w 99721|…|99728`) over
  `hidden_files/` .md/.json/.txt plus `evidence/` .md/.json/.txt
  hits exactly 13 files, ALL verified coincidental in-run food
  quantities, NOT seed uses (same class as grindfinish's 99315-as-
  food-quantity precedent): 99727 as `"pantryKcal":99727` in the
  leadfeast-s44 corpus (4 files incl. the hidden_files copy),
  99726 as `"freshKcal":99726` (raiddor s9874 corpus), 99724 as
  `"pantry": 99724` (predation-b-fifthlink, 2 files), 99725 as
  `"depriKcalCum":99725` (belongcost s94102 corpus, 2 files).
  99721, 99722, 99723, 99728 have zero hits anywhere. A
  `"seed": 9972[1-8]` field search over all evidence JSON returns
  zero hits. Band verdict: FRESH. The brief's suggested band is
  used as suggested.
- Competent policy verbatim (`scripts/policies/competent.js`,
  `competent` export) for the baseline leg; armed leg =
  `competent-tbretreat-b` wrapper + `TBRETREAT_RESTORE=1`. 150d
  death-aware horizon (dead villages stop simulating, +10d tail max
  via runDays). 150d because wave-4 unlocks need standing +
  readiness and the sibling bands' median survival was 74–121d.
- 8 seeds pilot, baseline FIRST on current code
  (`RUN=tbretreat-baseline`, flag OFF, driver refuses the leg if
  the flag is set), then armed on IDENTICAL seeds
  (`RUN=tbretreat-armed`, flag ON) after the lever lands. Same
  instrument, same driver, same analyzer for both legs.
- Stage 0 smoke (seed 99721, 5d live + 10d off/on neutrality, to
  /tmp, NOT judged): instrument fires — per-fight records present,
  0 instrument errors, off/on identical days/endReason/kill-log
  length. Proof: `scripts/test-tbretreat-20261105.js`.
- Corpus to `evidence/2026-11-05/perseed-tbretreat-b/` (one file per
  seed per leg, `instrumentErrors` 0 required; any instrument error
  is a loud failure to fix, not to paper over).
- Confirm 12–16 seeds on a FRESH band ONLY on pilot GO. Pilot
  NO-GO ends the arm: revert the src/js change (no src/js trace
  remains), delete the policy wrapper (it re-exports a kept file,
  so nothing is lost), keep instrument/driver/analyzer/proof as the
  measurement record.

## Per-fight record (instrument: grindfinish base + retreat fields)

`scripts/tbretreat-instrument-20261105.js` = the grindfinish
instrument verbatim (field + player-TB record shape, lift fields,
kill/death tracking, daily snapshots), plus per TB fight:
- `retreatOrigin`: the pre-fight tile-monster origin id + tile
  (tx,ty) + pre-fight HP, when one was recorded (flag-on armed leg
  only; null on baseline — the field is recorded whenever the
  fight's tile monster is a fighter, so the baseline shows the
  WOULD-BE origins the flag would have kept).
- `restored`: at tbEnd('fled'), whether a world monster of this mid
  is present after tbEnd returns at the origin tile with HP equal to
  the restore formula (checked post-call by the instrument's tbEnd
  wrapper: worldMonsters scan for id + tile + hp). `restoredHp`,
  `restoredTile`, `restoreSkippedDoorStash` (a doorFledMonsters
  entry for this mid existed at tbEnd), `restoreSkippedReason`
  (wave / no-standing / occupied-tile / door-stash / flag-off).
- `scholarHpFracAtExit`: the scholar fighter's HP fraction at tbEnd
  (the trigger's own number, for the survival leg).
- `stayStats` per seed, captured by the driver from the wrapper's
  `resetStayStats`/`stayStats` (trigger fires, flee turns, exits,
  stuck/sealed fallbacks, per-firing events).
- Say-line capture (driver): barrier lines included this time
  (staypolicy's measurement gap — its say-wrap regex never captured
  a barrier line, so no exit was visible in the transcript).

## Primary metric (binding — judge only against this)

Baseline vs armed on identical seeds 99721–99728. Analyzer:
`scripts/tbretreat-analyze-20261105.js` (grindfinish analyzer copy,
prefix `tbretreat-s`, plus the retreat section). All four legs must
hold for pilot GO:

- **G1 — retreat survival:** fled TB endings / trigger-fired wave-4
  TB fights >= 25% on the armed leg (baseline 0 fled; staypolicy
  measured 6 exits / 17 firings = 35% on the same driver, so the
  bar is the driver reproducing, not a new claim).
- **G2 — re-find:** retreated beasts re-found within 7 days / all
  retreated beasts (armed leg) >= 25%. Retreated = fled TB fight
  with a restored world monster (restoredHp recorded). Re-found =
  a later fight (field or lifted TB) of the same mid at exactly the
  restored HP, gap <= 7 days (grindfinish strict rule). Thin-band
  guard: if retreated beasts < 4, G2 is reported as thin and the
  verdict rests on G1 + G3 + G4 plus the mechanism check (restored
  share of fled tile-monster fights — the restore must fire ~always
  when its conditions hold; a mechanism miss is a bug, not a
  verdict input).
- **G3 — kill rate not halved:** armed wave-4 kill rate (matched
  kills / wild wave-4 fights, STRICT same-day matching, dmground
  rule) >= 1/2 baseline wave-4 kill rate. (The brief's bar; the
  kill rate itself is NOT expected to rise — a retreat lever cuts
  deaths, it cannot add damage — so the bar is a no-harm bar on
  kills, and the evidence says so plainly.)
- **G4 — survival not harmed:** median village survival (armed) >=
  0.8 x baseline median.

Pilot-gate rule: 8 seeds before/after before ANY confirm spend.
Confirm 12–16 seeds on a FRESH band only on pilot GO.

## Secondary (reported, never re-scored)

- Restore mechanism: fled tile-monster TB fights (armed) split
  restored / skipped-by-reason; restore fidelity (restoredHp ==
  min(preHp, primary end HP)); fled non-tile fights (pending-live,
  contest) — no origin, no restore, counted separately.
- Trigger diagnostics (armed): trigger fire rate, exits vs deaths
  mid-retreat, stuck/sealed fallback counts (stayStats, same shape
  as staypolicy-a for the delta read).
- TB channel: kill rate, median damage fraction, death share, flee
  share (the lever's channel), scholar deaths in TB vs out of TB.
- Field channel (control): kill rate, flee/death shares — any
  movement here is spillover.
- Re-find detail: per retreated beast — mid, day, tile, restored
  HP, re-found day/gap/channel, and whether the re-find fight
  killed it (the grind continuing to a kill is the chain's payoff).
- TB→TB pairs where the previous fight ended 'flee' (the new
  continuation class — grindfinish had 0 fled TB fights, so this
  pair type is new to the corpus).
- Wall numbers every run: wins, national, table, wave 4–5 unlocks,
  wave 4–5 faced, readiness-5-ready days, median survival days
  (both legs).
- Per-seed table per leg: days, end reason, wave-4 fights, wave-4
  kills, killers ever, living killers at end.
- Village assessment in plain words and the named next blank.
- Sense-testing law: read at least one retreat + re-find sequence
  end to end (death-day say lines + the retreat's barrier lines +
  the re-find fight's log), judged for meaning — does the village
  know the beast is still out there, does the retreat read like a
  person choosing to live — not just counts. The restore say line
  must appear in the transcript for a counted restore (same
  corroboration standard as fleerepair-a's escapes).
- Telemetry deviation check per loop-body step 10 (attempted; if
  the tool refuses recorder corpora, say so and report wall numbers
  directly, never fabricate a compare).
- Balanced panel (§15): before/after comparisons run through
  `scripts/balance-panel.js`; the compare `.md` is attached to the
  evidence file. LIMIT, stated now (same as staypolicy-a /
  grindfinish-b): the panel runs its own sweep-compare registry
  children and does not accept a two-corpus comparison or an
  unregistered probe policy — attempting it is the run's job, and
  if it cannot run on this corpus the evidence says so instead of
  fabricating a compare.

## Metric review (per §14; filled at verdict time, not now)

- Whether the kill-rate bar (G3, a no-harm bar) was the honest
  primary for a retreat lever, given staypolicy's finding that a
  disengage lever cannot add damage — and whether a
  scholar-survival or exits-per-firing threshold should have been
  the primary instead.
- Whether the 50/50 trigger line (frozen from staypolicy-a) fired
  where specified on this band, and whether its lateness (6 of 17
  firings died on the walk in staypolicy-a) shows up again here.
- Whether 8 seeds / 150d gave enough retreated beasts to judge G2,
  or the band was too thin (retreated beasts < 4 guard).
- Whether the strict re-find rule (exact-HP equality) excluded real
  re-meets (e.g. same entity re-met after in-fight healing or a
  packmate swap) and whether a looser link would change any verdict
  input.
- Whether the day-boundary kill-matching limitation (staypolicy-a:
  midnight-spanning kills score 0 matched) undercounts kills on
  either leg, and whether the ±1-day join should be proposed for
  the next run.

## Proof (committed with this prereg, before judged sims)

`scripts/test-tbretreat-20261105.js` — fixture tests on a fake Game
(restore math: cap at pre-HP, floor at 1, wounded deepening;
wave gate: wave-3 origin never restored; titan/lingering origin
never touched by the new path; door-stash skip; no-standing skip;
occupied-tile skip; monster-flee unchanged: the flag adds no flee
path for any monster and a monster fighter with no flee component
still stands — old-code-fails control: the same fixture with the
flag OFF restores nothing; flag ON restores exactly once) +
instrument fixtures (retreat fields, restore detection, stayStats
capture) + analyzer fixtures (re-find 7d rule, restore mechanism
splits, GO/NO-GO rules) + live harness smoke (5d) + off/on
neutrality leg (10d, seed 99721: identical days, endReason,
kill-log length, 0 instrument errors) + armed-leg smoke (flag ON +
driver, 10d, 0 instrument errors). Instrument:
`scripts/tbretreat-instrument-20261105.js` (grindfinish base +
retreat fields). Driver: `scripts/tbretreat-driver-20261105.js`
(POLICY=baseline|tbretreat, TBRETREAT_RESTORE passthrough).
Analyzer: `scripts/tbretreat-analyze-20261105.js`. Policy wrapper:
`scripts/policies/competent-tbretreat-b.js` (re-exports
flee-when-losing verbatim). Game change: `src/js/game.js`
(tbRetreatOrigin record + tbEnd restore, both flag-gated).
