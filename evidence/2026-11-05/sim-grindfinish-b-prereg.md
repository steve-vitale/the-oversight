# Grind-to-finish chain decomposition — PRE-REGISTRATION (arm sim-grindfinish-b)

Run: fleshout-loop-b-20261105T1322Z. Axis: scale-onramp / winnability chain
(wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Tracker's freshest open blank: the GRIND-TO-FINISH
chain, from the 2026-11-05 0915Z run (sim-dmground-a). Committed BEFORE any
judged sim. DIAG ONLY — zero src/js changes, zero default flips, zero
gate/price/deed-number changes, no readyDemand or VETSHAPE touch. No
[needs-eyes] flag: measurement only.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": wave-4 bands (anchored):
  damage 35–95, HP 850–1500, pierce 0.2–0.5. Wave 5 demands 2 LIVING
  villagers with wave-4+ kills. No canon invented here.
- `docs/CONTESTS.md`: contests are played, not RNG — TB fights the
  scholar enters through a contest/trial are the fight's own waves, not
  the tile monster (bystander hold, game.js:34512-34528).
- Steve 2026-10-08 (MONSTER-WAVES.md / CANON.md): "Monster encounters
  are fought, not rolled" — blow-by-blow with real stats. This DIAG
  measures the fought chain, never an outcome table.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-05/sim-dmground-a.md` (band 99201–99208, 150d, 8
  seeds, GEARFULL NO-GO): kills are TB finishes of ground-down beasts
  — all 9 armed kills entered at median 14% of def-max HP (5 of 9 below
  15%); eulogy chains show each fight's entry roughly the previous
  fight's exit (99203: field 900→146, field 773→39, TB 509→89, TB
  420→48, TB 372→267, TB 105→46, TB 59→28, TB 31→KILL). Field kills
  0/33. Baseline 0 kills in 27 fights.
- `evidence/2026-10-24/sim-fieldfinish-a.md` (DIAG-GO): field wounds
  persist onto the world entity; wounded-repeats proven (14 strict
  wave-3+); 0 villager field kills wave-3+; the 15% break line makes
  below-line arrivals zero-round mFlee flights. 1-HP arrivals mostly
  unobserved (43→1, 28→1 gaps with no recorded fight between).
- sim-findings.md #1167 (TB CHANNEL RESET, sim-w4dmg-a, 2026-10-26):
  TB fights rebuild monster HP from the def's HP range and never
  inherit field wounds — whether TB should inherit field wounds is a
  steve-call, not a fix to smuggle in. NOTE: that finding PREDATES the
  sim-w4tbkill-a phase B lift (2026-10-28, see mechanism map below) —
  this DIAG measures whether the lift now covers the chain in practice,
  it does not re-litigate #1167's text.

## The mechanism map (read from the code in this worktree, before any sim)

All line numbers are this worktree (`sim-grindfinish-b` branch):

1. **Field wounds persist** onto the world entity:
   `src/js/fieldFights.js:2391` — `m.hp = rec.mHpLeft` on every
   non-vKill outcome.
2. **Field break line**: `fieldFights.js:664` — mBreak = 0.15 for
   wave >= 2; `:992` — post-volley, hp/maxHp < mBreak gives mFlee
   even with zero volley damage (arrival wounds trigger it).
3. **World spawn HP**: `src/js/game.js:20240-20268` (spawnWorldMonster)
   — a fresh world entity spawns at hp = maxHp = `hp[0]` (the LOW end
   of the def range, e.g. eulogy 900/900, not a roll).
4. **TB lift (sim-w4tbkill-a phase B, 2026-10-28)**: `game.js:34018`
   (tbWorldHpFor) + `:34274` — a wave-4+ TB fight whose tile monster
   (`state.scholar.monster`, the playerMonster alias) IS the fight's
   monster enters the primary fighter at the world monster's current
   hp/maxHp. Veterans excluded (fresh roll, +50% HP). The lift applies
   ONLY when the alias matches the fight's mid; pending/contest/trial
   fights that do not lift the tile monster roll fresh from the def
   range (`mdef.hp[0] + rand*(hp[1]-hp[0])`).
5. **TB exit — ordinary wild entities are NOT restored**:
   `game.js:34528` — `worldOrigin` is recorded ONLY for titans /
   lingerers. The world monster is removed at fight start
   (`removeWorldMonster`, `:34525`). `game.js:45502-45519` (tbEnd):
   lingerers restore at `min(preHp, fighterEndHp)` floored at 1
   (`:45511`); titans restore at full (`:45519`); an ordinary wild
   monster that ends fled/lost is simply GONE — no restore path
   exists. A won fight removes it by death.
6. **Door-flee stash**: `game.js:36244` — a door flee stashes fighter
   HP in `state.doorFledMonsters`; `game.js:12320` — re-engage honors
   stashed wounds via `mf.hp = Math.max(1, Math.min(mf.maxHp, w.hp))`
   — the 1-HP floor, a confirmed mechanism behind fieldfinish's
   1-HP arrivals.
7. **Fled-monster recovery**: `game.js:12794-12802` — a fearful world
   monster that reaches an edge is stashed in `state.fledMonsters`
   with its HP and respawns on arrival at the adjacent node.

Consequences the DIAG tests empirically: a TB fight CAN inherit field
wounds (lift, rule 4) but only for tile-monster fights; a fled/lost TB
fight against an ordinary wild beast DELETES the grind's progress
(rule 5 — the entity is gone, the next fight of that type is a new
entity); the grind's only durable carrier is a world entity that
keeps being re-met (rules 1–3, 6–7).

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 99309–99316: verified free — exact whole-token grep of
  each seed across ALL dated preregs (`evidence/*/sim-*-prereg.md`)
  plus all dated evidence `.md` files: zero hits. The 99301–99308
  band the brief suggested is NOT fresh (judged leg of sim-diplo-b,
  2026-11-04; also sim-linkseek-b) and is not used. Old-Oct JSON
  corpora: whole-token (`\b993(09|1[0-6])\b`, ripgrep over all of
  `evidence/`) hits exactly 2 files, both verified coincidental
  in-run quantities, NOT seed uses — `control-leadfeast.json`
  (2026-10-21) carries 99315 as a village food quantity, and
  `leadfeast-s884.json` (2026-10-16) carries 99312 twice as a
  `cumTakes` food total. No filename in `evidence/` names any
  99309–99316 seed. Band verdict: FRESH.
- Competent policy verbatim (`scripts/policies/competent.js`,
  `competent` export), 150d death-aware horizon (dead villages stop
  simulating, +10d tail max via runDays). 150d because wave-4
  unlocks need standing + readiness; the dmground band's median
  survival was 87–116d and still produced 27–74 wild wave-4 fights.
- 8 seeds pilot, DIAG leg only (`RUN=grindfinish-diag`), one leg, no
  armed leg — the DIAG measures the chain as it stands. Same
  instrument, driver, analyzer for the whole pilot.
- Stage 0 smoke (seed 99309, 5d live + 10d off/on neutrality, to
  /tmp, NOT judged): instrument fires — per-fight records present, 0
  instrument errors, off/on identical days/endReason/kill-log length.
  Proof: `scripts/test-grindfinish-20261105.js` 26/26.
- Corpus to `evidence/2026-11-05/perseed-grindfinish-b/` (one file
  per seed, `instrumentErrors` 0 required; any instrument error is a
  loud failure to fix, not to paper over).
- Stage 2 (ONLY on DIAG-GO): a buildable lever named by the DIAG,
  tested as a default-OFF instrument or a policy-side arm with its own
  pre-registered GO bar, on the same band. A policy-side lever is
  preferred (e.g. re-find aid — the competent policy sending a party
  back to a known wounded beast, perception-gated on a prior fight).
  A TB-inherits-field-wounds probe may be built ONLY as a default-OFF
  instrument with the steve-call (#1167) flagged in the evidence;
  NEVER flip a default, NEVER change a gate/price/deed number, NEVER
  touch readyDemand or VETSHAPE. If the DIAG shows the chain is not
  the binder, report DIAG-NO and name the next blank — no Stage 2.

## Chain decomposition (the four measures; analyzer computes, evidence judges)

For EVERY wave-4+ fight (field + player TB), per seed, per mid, day
order. Kill matching is STRICT (dmground rule): a kill-log row
matches at most one same-day same-mid fight whose fighters include
the killer. TB "won" is never counted as a kill without a kill-log
row. Entry fractions use the def range: `entryFracHi = entryHp /
hp[1]` (primary fighter for TB, entity HP for field); wounded is
`entryFracHi < 0.25`, fresh is `>= 0.75`.

- (a) field→TB: TB fights split lifted (pre-call tile-monster alias
  id === mid) vs fresh. Lift fidelity: lifted entryHpPrimary ==
  worldHpAtLift.hp. Strict field→TB link: lifted TB entryHpPrimary
  == most recent prior field fight's mHpLeft for the same mid.
  Also: door-flee re-engages, pending-live TB fights, worldOrigin
  (titan/lingering) TB fights, veteran TB fights.
- (b) TB→TB: successive TB fights vs the same mid; entry vs previous
  exit — reset (entry > prev exit), continuation (entry == prev
  exit), further-wounded (entry < prev exit). Pairs split by whether
  a field fight of the same mid intervened.
- (c) re-find: wounded field exits (0 < mHpLeft < defHpLo) re-met by
  a later field fight of the same mid at exactly that HP (strict),
  or by a lifted TB entry at exactly that HP; gap in days; shares
  at ≤7d, ≤30d, ever.
- (d) kill conversion: matched TB kills split by entry frac —
  wounded / middle / fresh buckets; same split for field fights.

## Primary metric (binding — judge only against this)

DIAG-GO (the chain IS the binder and names a buildable lever)
requires BOTH:

- **D4-gap**: wounded-entry TB kill rate >= 15% AND >= 3
  wounded-entry kills AND fresh-entry TB kill rate <= 5%
  (wounded-entry TB fights >= 5, else the band is thin and the
  DIAG is NO on thinness, not on the gap).
- **Loss channel material** (at least one):
  - D2: TB→TB reset share with no field fight between >= 50%, OR
  - D3: strict 7-day re-find share of wounded field exits < 25%, OR
  - D1: lifted share of TB fights < 20% (the lift exists in code
    but almost never covers a TB fight in practice).

DIAG-NO otherwise: the chain is not the binder on this band, and the
evidence names the next blank from the four measures (e.g. kills
happen fresh too → the binder is damage/survival, not the grind;
lifted share high and continuation high → the grind already works
and the binder is elsewhere; thin band → the next run needs a
fatter band or a different question).

## Secondary (reported, never re-scored)

- Per-mid fight chains printed as sequences (entry→exit per fight)
  for the evidence file — the eulogy-chain read, per seed.
- Field-channel kill rate by entry frac; TB damage fraction median;
  field rounds median; 1-HP arrivals (field entries at 1 HP, TB
  entries at 1 HP, field exits at 1 HP) — the fieldfinish open item.
- Lifted-entry vs fresh-entry fracHi medians; lift fidelity
  match/checked; pending-live and veteran TB shares.
- Wall numbers: wins, national, table, wave 4–5 unlocks, wave 4–5
  faced, readiness-5-ready days, median survival.
- Per-seed table: days, end reason, wave-4 fights (field/TB),
  wave-4 kills, killers ever, living killers at end.
- Village assessment in plain words and the named next blank.
- Sense-testing law: read at least one kill chain's transcript/log
  end to end (death-day say lines + one fight's log), judged for
  meaning, not just counts.
- Telemetry deviation check per loop-body step 10 (attempted; if the
  tool refuses recorder corpora, say so and report wall numbers
  directly, never fabricate a compare).
- Balanced panel (§15): before/after runs through
  `scripts/balance-panel.js`; the compare `.md` is attached to the
  evidence file. If the panel tool cannot run on this corpus, say so
  instead of fabricating it (dmground recorded the same limit — a
  DIAG corpus has no before/after pair to panel).

## Metric review (per §14; filled at verdict time, not now)

- Whether the D4 bar was judgeable on 8 seeds / 150d (wounded-entry
  TB fights >= 5), or the band was too thin to name the binder.
- Whether the strict linkage (exact-HP equality) excluded real
  re-meets (e.g. same entity re-met after in-fight healing or a
  packmate swap) and whether a looser link would change any verdict
  input.
- Whether the lifted/fresh split matches the code's intent (rule 4)
  or exposes a coverage gap (pending/contact fights never lifting).
- Whether the TB→TB reset classification conflates new-entity spawns
  with TB-exit restores, and whether that distinction matters for the
  named lever.

## Proof (committed with this prereg, before judged sims)

`scripts/test-grindfinish-20261105.js` 26/26 — instrument fixtures
(field capture incl. def fracs + entity loc, TB fresh vs lifted vs
bystander, uninstall restores), analyzer fixtures (strict kill
matching, determinism, chain (a) strict field→TB link + lift
fidelity, chain (b) reset + continuation pairs, chain (c) 7-day
re-find, chain (d) DIAG-GO + DIAG-NO rules), live harness smoke (5d,
seed 99309) + off/on neutrality leg (10d, seed 99309: identical days,
endReason, kill-log length, 0 instrument errors). Instrument:
`scripts/grindfinish-instrument-20261105.js` (dmground base + chain
fields). Driver: `scripts/grindfinish-driver-20261105.js`. Analyzer:
`scripts/grindfinish-analyze-20261105.js`.
