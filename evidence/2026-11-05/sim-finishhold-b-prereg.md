# Finishing probe/build — PRE-REGISTRATION (arm sim-finishhold-b)

Run: fleshout-loop-b-20261105T0618Z. Axis: winnability chain (wild
ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Tracker's next blank #1. Committed BEFORE any
judged sim. ONE game-code lever (focus fire, lever (c) below). NO gate,
price, deed-gate, readyDemand, or VETSHAPE-default change, ever.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": wave-4 bands (anchored):
  damage 35–95, HP 850–1500, pierce 0.2–0.5 — a 4–6 round fight for a
  godhood build (~220 dmg/round). Wave 5 demands 2 LIVING villagers
  with wave-4+ kills. No canon invented here.
- Steve 2026-11-02 monster-commitment ruling (MONSTER-WAVES.md,
  fieldFights.js `mCanFlee`): monsters do not flee without an explicit
  flee component. It covers MONSTERS, not villagers — it is not cited
  here as covering villager flight. Wave-4 monsters carry no flee
  component (`flee: false` on all 10 wave-4 defs in
  `src/data/monsters.json`), so in a wild wave-4 field fight the only
  flee that ever happens is the villager's.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-05/sim-secondkiller-b.md` (band 99151–99158, 150d,
  8 seeds): FINISHING binds. 3 kills in 58 wild wave-4 fights (5.2%),
  every kill a first blood; field fights 0 kills in 30, median 2.7% of
  monster HP dealt in 2–3 rounds before fleeing (18) or dying (11);
  scholar turn-based fights 3/28, 24 deaths, median ~20% HP. Parties
  reach wave-4 monsters constantly and cannot hurt them fast enough or
  stay past round 3.
- Corpus re-read for this prereg (numbers computed from
  `evidence/2026-11-05/perseed-secondkiller-b/`, not re-judged):
  field fights max 4 rounds, max damage fraction 0.287 (one fight:
  seed 99152 day 87, strike, 349 damage, ally weapon bonus 60);
  next-best 0.212, 0.144. Field rounds distribution: 0:1, 1:4, 2:15,
  3:9, 4:1. Monster entry HP was below 85% of its def maximum in 25
  of 27 field fights with a known entry HP, minimum 25% of max
  (eulogy, seed 99154 day 79, entry 280/1100) — world monsters persist
  wounded across fights, so parties do meet already-hurt beasts.
  No field fight met a monster below 15% of max HP.

## Step 1 verdict — policy-side hold-ground / focus-fire: NOT expressible

Determined from the code, before any sim (file/function names):

- `Game.fieldFight(vid, mdef, m, opts)` is called by game code only:
  `src/js/villager-agency.js:420` (wild seeker fights),
  `src/js/game.js:7940` and `:20522` (wild patrol/wanderer routers,
  passing `{allies, allyVids}`), `src/js/nomad-wild.js:329`,
  `src/js/havenGrowth.js:872` (raid, `cornered: true`),
  `src/js/alienPlayers.js:2735`. The competent policy
  (`scripts/policies/competent.js`) drives the SCHOLAR only and never
  calls `fieldFight`; it has no knob for a villager's flee line.
- Intent is derived INSIDE `fieldFight` (fieldFights.js ~line 540):
  trick-known or party present → `engage`, else `learn-first`. No
  opts knob sets it.
- Morale is computed INSIDE `fieldFight`: `vBreak` from bravery XP +
  temperament, `holdBonus` from weapon/allies/bonds/day-7, `fleeAt`
  from the hopeless/winning trajectory (`rtd < rtk * 0.85`,
  party-HP-pool form with a live ally, WINFIELD-DMG 2026-11-03), floor
  flee at 0.05. The only opts that touch the decision are
  `braveryBonus` (contest cheer only), `noFlee` (sealed arenas only),
  and `allyFromStart` (aid fights only). None of them is a
  hold-ground / focus-fire knob a sim policy could set for wild
  fights.
- Turn-based channel: the scholar already fights to the death (24/28
  TB fights end in death in the DIAG) — a hold-ground policy variant
  would be byte-identical in outcome. Focus fire in TB is
  engine-driven companions, not a policy choice.
- Therefore: game-code lever required. No policy probe is run.

## Lever picked — (c) damage concentration / focus fire (ONE lever)

**FOCUS FIRE: a mustered party fights together from the opening
round.** In `Game.fieldFight`, when wave >= 3 AND `!opts.noFlee` AND
`!opts.cornered` AND `opts.allies > 0` with a non-empty `allyVids`,
the first mustered ally enters at fight start (allyIn from round 1 —
same body, gear, and entry as the hopeless-shout join and the
existing `allyFromStart` path in comms.js aid fights) instead of
waiting for the round-2+ hopeless shout. The shout can still call a
further ally if any remain and `helpCalled` is unset — mirroring the
existing one-ally contract. The lever sets a record-only flag
`rec.focusFire = true` and logs one line ("X fights beside Y from
the first blow — the party came together. (Focus fire)"). Nothing
else changes: no damage formula, no flee line, no HP, no round cap.

Why (c), and why not (a) or (b) — decided from the measured corpus:

- (a) "party commits while the monster is below its break line /
  below X% HP": the engine's own break line is `mBreak = 0.15`
  (wave >= 2). NO field fight in the DIAG corpus met a monster below
  15% of max HP (minimum entry 25%), and parties deal at most 28.7%
  (median 2.7%) before the flee decision is made — the monster is
  never below its break line when the decision happens. As specified,
  (a) would fire ~0 times on the pilot band: untestable, rejected.
  (The wound-persistence finding above — entries down to 25% — is
  recorded for a future variant; it does not save (a) at the 15%
  line.)
- (b) "veteran-led party holds the line": veterans are essentially
  never present — the DIAG's alive window is 0–1 days (1 of 58 fights
  happened while a first killer lived). A veteran-gated lever would
  fire ~0 times on the pilot band: untestable, rejected.
- (c) fires in EVERY mustered-party wave-3+ wild fight, and touches
  the actual binding constraint — damage dealt before the round-2/3
  flee — by moving the ally's strikes to round 1 (the baseline ally
  joins at the round-2 hopeless check, so it first strikes in round
  3) and by putting the party-HP pool into the round-2 hopeless math
  from the start. It is a board change (a combatant present from the
  opening, not a stat multiplier), in the same wave-3+-scoped
  finishing-mechanic family as the existing twoblow committed finish.

Honest expectation, stated now (not a hedge on the verdict): the
damage×survival math says kills likely stay near zero. The best
observed field fight dealt 28.7% in 4 rounds; a kill needs ~100%
while the party survives monster damage 35–95/round on ~100 HP.
Focus fire adds roughly one ally-round of strikes per fight plus a
possible extra round of holding — it moves damage fraction and
rounds, and it may convert flees into deaths. The GO below is set at
the brief's bar anyway and judged strictly; if it NO-GOs, the
diagnostic intermediates decide the NEXT blank (damage-per-round or
survival, not the flee decision), and the game-code change is
reverted, leaving no trace.

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 99161–99168: verified free — no `99161`…`99168` token in
  `evidence/2026-11-05/*.md`, `evidence/2026-11-04/sim-*.md`, or any
  `perseed-*` filename in `evidence/2026-11-05/` at prereg time.
- Competent policy verbatim (`scripts/policies/competent.js`,
  `competent` export), 150d death-aware horizon (dead villages stop
  simulating, +10d tail max via runDays).
- 8 seeds pilot, baseline FIRST on current code
  (`RUN=finishhold-baseline`), then armed on IDENTICAL seeds
  (`RUN=finishhold-armed`) after the lever lands. Same instrument,
  same driver, same analyzer for both legs.
- Stage 0 smoke (1 seed, 99161, to /tmp, NOT judged): instrument
  fires — per-fight records present, 0 instrument errors, field + TB
  wrappers restore cleanly (off/on neutrality leg, see Proof).
- Corpus to `evidence/2026-11-05/perseed-finishhold-b/` (one file per
  seed per leg, `instrumentErrors` 0 required; any instrument error
  is a loud failure to fix, not to paper over).
- Confirm 12–16 seeds on a FRESH band ONLY on pilot GO. Pilot
  NO-GO ends the arm: revert the game-code change, keep instruments
  + evidence + proof as the killed-verdict record.

## Per-fight record (instrument: secondkiller base + finishhold fields)

For EVERY wave-4+ fight (field + player TB), as in secondkiller, PLUS:
`focusFire` (rec.focusFire, false on baseline), `committedFinish`
(rec.committedFinish), `committedRounds`, `shoutRound` (rec.shoutRound
or null), `everWinning` / `everHopeless` (rec flags or null). Field
fights are split by `allyVid` presence (a real joiner), NOT by
mustered partySize — partySize overstates combatants (DIAG: 27/30
field fights mustered triples, only 16 had a joining ally). TB damage
is judged by HP fraction (`damageFrac`), NOT by player strikes
(companion strikes are uncounted; the DIAG's Sigrun kill fight shows
0 player strikes). Armor is read from torso/legs/shoes slots via the
engine's `armorOf`, never an `armor` slot (secondkiller post-corpus
fix, kept).

## Primary metric (binding — judge only against this)

Wave-4 kill rate per wild wave-4 fight (matched kill-log rows only,
STRICT matching: killer must be among the fight's fighters; TB "won"
is never counted as a kill without a kill-log row), baseline vs armed
on identical seeds 99161–99168.

- **GO: armed kill rate >= 15% AND >= 3 kills on the pilot band.**
- **Guardrails (both must hold, else NO-GO even on a kill GO):**
  median survival (armed) not worse than baseline by > 10 days;
  field-fight party deaths (vDie endings, count) not up by > 25%
  relative to baseline.
- Pilot-gate rule: 8 seeds before/after before ANY confirm spend.
  Confirm 12–16 seeds on a FRESH band only on pilot GO.

## Secondary (reported, never re-scored)

- Field channel: median damage fraction, median rounds, flee/death
  shares, focusFire fire rate (armed: fights with `focusFire` true /
  mustered-party wave-4+ fights), ally-joined share by `allyVid`.
- TB channel: kill rate, median damage fraction, death share (the
  lever does not touch TB; any TB movement is a spillover read, not
  a verdict input).
- Wall numbers every run: wins, national, table, wave 4–5 unlocks,
  wave 4–5 faced, median survival days (both legs).
- Per-seed table per leg: days, end reason, wave-4 fights, wave-4
  kills, killers ever, living killers at end.
- Village assessment in plain words and the named next blank.
- Sense-testing law: read at least one fight's transcript/log end to
  end (death-day say lines + one field-fight log), judged for
  meaning, not just counts.
- Telemetry deviation check per loop-body step 10 (attempted; if the
  tool refuses recorder corpora, say so and report wall numbers
  directly, never fabricate a compare).
- Balanced panel (§15): before/after runs through
  `scripts/balance-panel.js`; the compare `.md` is attached to the
  evidence file. If the panel tool cannot run on this corpus, say so
  instead of fabricating it.

## Correction — shout cannot add a second ally (closeout 2026-11-05)

The lever description above says "The shout can still call a further
ally if any remain and `helpCalled` is unset". That sentence is wrong
as written: the focus-fire join sets `helpCalled = true`, and the
hopeless-shout branch is gated on `!helpCalled` (fieldFights.js, the
morale block) — so after a focus-fire join the shout can NEVER call a
further ally. The one-ally-per-fight contract holds, satisfied at
round 1 instead of round 2+. The lever's code comment was corrected
the same way in the lever commit. No behavior changed; only the words
were wrong. (Worker note: the "prereg wording correction" flagged at
timeout was this sentence.)

## Metric review (per §14; filled at verdict time, not now)

- Whether the kill-rate GO was reachable at all given the
  damage×survival product (best field fight 28.7% in 4 rounds), and
  whether a damage-fraction or rounds-held threshold would have been
  the honest primary for a staying lever.
- Whether the focus-fire fire rate matched the mustered-party share
  (any fight where the lever should have fired but did not, and why).
- Whether 8 seeds / 150d gave enough wild wave-4 fights to judge the
  GO, or the band was too thin.
- Whether TB spillover (if any) was real or seed noise.

## Proof (committed with this prereg, before judged sims)

`scripts/test-finishhold-20261105.js` — fixture tests (instrument
field capture incl. focusFire/committedFinish/shoutRound, analyzer
allyVid split, TB-damage-by-HP-fraction rule, strict kill matching,
determinism) + a live harness smoke (5d) + an off/on neutrality leg
(10d, seed 99161: identical days, endReason, kill-log length, 0
instrument errors). Lever fixtures (gate conditions: fires wave 3+,
wild, mustered; does not fire wave 1–2, sealed, cornered, or solo;
ally strikes round 1) are added with the lever commit, in the same
file, before the armed pilot. Instrument:
`scripts/finishhold-instrument-20261105.js` (secondkiller base +
finishhold fields). Driver:
`scripts/finishhold-driver-20261105.js`. Analyzer:
`scripts/finishhold-analyze-20261105.js`.
