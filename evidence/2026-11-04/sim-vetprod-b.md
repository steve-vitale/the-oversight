# Veterans-production diag — Loop B verdict (run fleshout-loop-b-20261104T2015Z, arm sim-vetprod-b)

Axis: winnability chain (tracker next blank #2, sharpened 1830Z
as "the real 199-hold cause"). DIAG ONLY, zero src/js. Gates,
prices, deeds, and readyDemand untouched.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-vetprod-b-prereg.md`
(commit b35e915fc). In short: competent policy verbatim,
default env, seeds 99101–99108 (the gearbar band re-run on
current master), 150d death-aware horizon, kill-level recorder
(fight-start events player-TB vs field, post-run waveKillLog
copy, FULL fallen list, daily readiness-5 snapshots,
peak-gated-standing snapshot). DIAG-GO iff: (1) all 8 seeds
classified into exactly one class; (2) one dominant class, or
one pre-named two-class split (S1 "kills don't stick" =
KILLED-DEAD-KILLER + KILLED-LIVING-SHORT; S2 "no kill
opportunity" = NEVER-FACED-WAVE4 + FACED-NO-KILL), accounts
for the shortfall on >= 5 of 8 seeds; (3) instrument errors 0
on all judged seeds. Otherwise DIAG-NO-CANDIDATE;
INSUFFICIENT-DATA only if > 2 seeds carry instrument errors.
Balanced panel (§15): INAPPLICABLE for a pure diagnostic —
stated, not fabricated.

## Grounding verified in code before the pilot (not assumed)

- `src/js/standing.js` `waveCombatReadiness(w)`: VETERANS =
  DISTINCT killer vids with a wave-(w-1)+ kill in
  `state.waveKillLog`, LIVING only by default (the default-OFF
  `VETSHAPE=1` instrument counts living-OR-DEAD; NOT flipped
  here). Wave 5 demands 2 living villagers with wave-4+ kills.
- `src/js/game.js` `recordWaveKill(monsterId, killerVid, via,
  detail)`: the per-kill choke point; every real kill (player
  TB, villager field fight, contest) appends `{d, mid, w, by,
  via, trick}` to the append-only `state.waveKillLog`, which
  survives the killer's death. `src/js/game.js`
  `waveEngaged(w)` reads the deed feed
  `deedState().wavesFaced`, fed by real `startCombat` /
  `fieldFight` / `recordWaveKill` only.
- Monster-veteran vs villager-veteran distinction (code-read):
  a MONSTER veteran is a hardened older-wave monster
  (spawn-flagged); killing one counts toward the readiness
  bar as its BASE wave only. The VILLAGER veterans bar counts
  living villagers with wave-(w-1)+ kills. The two "veteran"
  concepts are separate; this arm measures the villager bar
  only. (Sense-test note below: the game itself uses the
  word "veteran" for both, on screen.)
- Canon: `docs/MONSTER-WAVES.md` covers the standing gate and
  the readiness gate ("Standing opens the wave door; combat
  readiness decides whether the village walks through"). No
  canon invented.

## Verdict — DIAG-NO-CANDIDATE (judged strictly against the prereg)

1. All 8 seeds classified, none forced, none OTHER: 4
   NEVER-FACED-WAVE4, 3 KILLED-DEAD-KILLER, 1
   KILLED-LIVING-SHORT, 0 FACED-NO-KILL.
2. NO dominant class and NO pre-named split reaches 5/8:
   dominant class 4/8, split S1 ("kills don't stick") 4/8,
   split S2 ("no kill opportunity") 4/8 — an exact 4/4 tie.
   The prereg bar (5/8) is not met, so the verdict is
   DIAG-NO-CANDIDATE, not re-scored against a friendlier
   bar. The tie IS the finding (see below): the shortfall
   is two equal problems, not one.
3. Instrument errors 0 on all 8 seeds (~860 daily snapshots,
   42 wave-4 fight events, 8 wave-4 kills, full fallen lists).
Proof: `scripts/test-vetprod-20261104.js` — 13/13 PASS (11
fixture classification tests incl. same-day fleeting, base-
wave exclusion, precedence, and anomaly handling; live
harness smoke; determinism leg; off/on neutrality leg on
seed 99108 at 10d: identical days, endReason, and kill-log
length with the instrument on vs off). No balanced-panel
comparison exists for a diag, so none is fabricated and
none is attached (per §15, stated not omitted silently).

## Replication check (instrument neutrality corroboration)

This run reproduces standaccum's band EXACTLY on every
shared number: days 150 / 116 / 121 / 150 / 52 / 59 / 72 /
48, end reasons, peak gated standing 199 / 199 / 180 / 199 /
140 / 150 / 50 / 20, peak raw 355 / 215 / 180 / 225 / 140 /
150 / 50 / 20, wave-4 faced seeds (99101, 99103, 99104,
99105), and daily engine vet-bar maxima 1 / 0 / 1 / 1 / 1 /
0 / 0 / 0. The kill-level recorder did not perturb the
trajectories it measured — and the standaccum numbers it
was built to explain are confirmed, not drifted.

## THE VETERANS ANSWER (plain words)

Half the villages never meet a wave-4 monster at all. The
other half meet them, kill them — and then lose the killers
within days, before a second veteran can stand beside the
first. Nobody ever holds two living wave-4 killers at once,
but for opposite reasons on opposite seeds.

- **Never faced (4/8): 99102, 99106, 99107, 99108.** Zero
  wave-4 fights, zero wave-4 kills, zero wave-4 types in the
  deed faced feed. Two of them (99102, 99106) are the
  unlocked-but-unmet case: their final unlocked wave is 4 —
  the door opened — and in 116 / 59 days they still never
  fought a wave-4 monster. The other two (99107, 99108)
  never unlocked wave 4 at all (peak standing 50 / 20), so
  no wave-4 monster could spawn for them. "Never faced"
  therefore splits further, but the prereg class is one
  class and the split is reported here, not re-scored:
  unlocked-but-unmet 2, never-unlocked 2.
- **Killed, killers dead (3/8): 99101, 99103, 99104.** Eight
  wave-4 kills across the band's four facing seeds, seven
  distinct killers ever, and by end of run ZERO of them
  alive on these three seeds. Kill-to-death spans: 5, 0
  (same-day, arena), 2 (contest), 7, 14, 0 (same-day, wound)
  days — median 3.5 days from first blood to death. Death
  causes for the six dead killers: the wild ×3, the arena
  ×1, contest ×1, a wound that wouldn't close ×1. Unlike
  vetkill's wave-3 band (arena-dominated), these wave-4
  killers mostly die in the wilds, not the show — but just
  as fast. And they never overlap: reconstructed maximum
  simultaneous living wave-4 killers is 1 on all three
  seeds, matching the daily engine bar maximum of 1.
- **Killed, killer lives, still short (1/8): 99105.** One
  wave-4 kill (day 51, player channel, the Congregation),
  killer alive at end of run, peak vet bar 1 of 2 — the
  village died on day 52, one day after its only veteran
  was blooded. The shortfall here is time, not death: the
  second veteran never got the chance to exist.
- **No seed faced wave 4 without killing.** FACED-NO-KILL
  is 0/8: every village that met wave 4 killed at least
  once (42 wave-4 fights → 8 kills: 99101 13 fights → 3
  kills, 99103 17 → 1, 99104 8 → 3, 99105 4 → 1). The
  fight-interior verdict (finishing binds) is NOT
  contradicted — kills do happen — but on this band the
  binding failure is AFTER the kill, not in the fight:
  killers die or villages die before a second veteran
  stands. This arm does not re-decompose fights (per brief).
- **Peak and kill never coincide.** On 99101 the standing
  peak (day 98, gated 199) comes BEFORE the first wave-4
  kill (day 101). On 99104 the peak day (121) is the very
  day its two-kill veteran dies in the wilds — the
  end-of-day vet bar reads 0. Even the kills that happen
  arrive after, or die on, the standing peak. The bar and
  the peak pass each other like strangers.

## Per-seed table (peak = first day at peak gated standing)

| seed | days | end | peak gated (day) | w4 fights TB/field | w4 kills (via) | killers ever | living at end | max sim living (day) | engine daily max vets | peak vets | class |
|------|------|-----|------------------|--------------------|----------------|--------------|---------------|----------------------|-----------------------|-----------|-------|
| 99101 | 150 | survived | 199 (98) | 13 (9/4) | 3 (player ×3) | 3 | 0 | 1 (101) | 1 | 0 | KILLED-DEAD-KILLER |
| 99102 | 116 | lost | 199 (103) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | NEVER-FACED-WAVE4 |
| 99103 | 121 | lost | 180 (95) | 17 (11/6) | 1 (companion ×1) | 1 | 0 | 1 (74) | 1 | 0 | KILLED-DEAD-KILLER |
| 99104 | 150 | survived | 199 (121) | 8 (3/5) | 3 (player ×2, aid-crisis ×1) | 2 | 0 | 1 (107) | 1 | 0 | KILLED-DEAD-KILLER |
| 99105 | 52 | lost | 140 (51) | 4 (4/0) | 1 (player ×1) | 1 | 1 | 1 (51) | 1 | 1 | KILLED-LIVING-SHORT |
| 99106 | 59 | lost | 150 (52) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | NEVER-FACED-WAVE4 |
| 99107 | 72 | lost | 50 (54) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | NEVER-FACED-WAVE4 |
| 99108 | 48 | lost | 20 (26) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | NEVER-FACED-WAVE4 |

## Killer ledger (wave-4+ kills only; death days from the FULL fallen list)

| seed | killer | kills (days, monsters) | via | death day (cause) | kill→death |
|------|--------|------------------------|-----|-------------------|------------|
| 99101 | gen_0tkxrod | 1 (d101, strike) | player | d106 (the wild) | 5d |
| 99101 | aria_thompson | 1 (d123, strike) | player | d123 (the arena) | 0d (same day) |
| 99101 | stan_kowalski | 1 (d141, congregation) | player | d143 (contest) | 2d |
| 99103 | app_mgpspie3545 | 1 (d74, eulogy) | companion | d81 (the wild) | 7d |
| 99104 | gen_ciish5s | 2 (d107 strike, d120 influencer) | player | d121 (the wild) | 14d (1d after 2nd kill) |
| 99104 | visjoin_145 | 1 (d149, eulogy) | aid-crisis | d149 (a wound that wouldn't close) | 0d (same day) |
| 99105 | gen_imdatzd | 1 (d51, congregation) | player | — (alive at end) | — |

No chronology anomaly on any seed (no fallen entry dated
before its killer's first kill day) — the vetkill ethan_hunt
class of anomaly does not recur here. No killer's class
depends on ambiguous timing. Distinct wave-4 types faced
(deed feed): 99101: 6, 99103: 2, 99104: 4, 99105: 1.
Zero wave-5 fights, zero wave-5 kills, zero wave-5 faced
types on all 8 seeds. Contest share of wave-4 kills: 0 via
`contest` (the two contest-adjacent deaths are death
causes, not kill channels — kill vias are player ×6,
companion ×1, aid-crisis ×1).

## Wall numbers (this corpus, baseline observations, not wall movement)

Wins 0/8. National 0/8, table 0/8 (scaleRank "village" on
all 8; no seed leaves village scale). Wave-4 unlocks 6/8,
wave-4 faced 4/8 (99101, 99103, 99104, 99105), wave-5
unlocks 0/8, wave-5 faced 0/8. Readiness-5-ready days 0/8.
Median run-days 94 (days sorted 48 / 52 / 59 / 72 / 116 /
121 / 150 / 150; 2 seeds censored at the 150d horizon:
99101, 99104 survived). Death-cause shares for villages
generally: not instrumented by this arm — not reported,
not guessed. Killer death causes (above) are the only
death-cause numbers this arm owns.

## Village assessment (plain words)

Picture eight villages playing competently. Four of them
never even see the fourth draft — two because the door
never opened, two because it opened and nothing came
through it. The other four see it, fight it, and blood a
fighter or three — and then watch those fighters die: one
the same afternoon in the arena, one the same day of a
wound that wouldn't close, the rest within a fortnight in
the wilds. One village bloods its only veteran on day 51
and dies itself the next day. The System's line is honest
— "blood your fighters (0 of 2 veterans)" — but on the
three 199-held seeds the village HAS blooded fighters;
they are just dead, and the bar counts the living only.
The 199-hold is not one lock with one key. It is a door
half the villages never reach, and a roster the other
half cannot keep alive long enough to walk through with
two veterans at once.

## Sense-test

- The System's "veteran kill" celebration fires for wave-3
  kills too ("Naran just put down Spool... on CAMERA.
  That's a veteran kill, folks") — the fiction calls a
  wave-3 kill a veteran kill, which is true for the wave-4
  bar (wave-3+ kills count there) but NOT for the wave-5
  bar (wave-4+ only). A player hearing "veteran kill" for
  a Spool would reasonably think they are banking wave-5
  veterans. They are not.
- The word "veteran" collides with itself on screen: the
  same corpus shows "A Scarred veteran" and "A Pack-leader
  veteran" as MONSTER warnings (hardened older-wave
  monsters), while the readiness bar wants VILLAGER
  veterans. Two different things, one word, both shouted
  by the game. A player told to "blood your fighters (0
  of 2 veterans)" while fighting "veterans" in the wilds
  is being given a riddle, not an instruction.
- Kill narration itself is coherent: wave-4 kills land on
  named monsters (the Strike, the Congregation, the
  Eulogy, the Influencer) through named channels, and the
  killer ledger reconciles exactly with the log.
- Instrument limitation (not a game finding): the say
  sample cap (150 lines/seed) fills in early days, so no
  peak-day standing hold line was captured for quotation
  here — standaccum already quoted it verbatim ("HELD at
  wave 4: the fifth draft waits (blood your fighters (0
  of 2 veterans))"), and this arm does not re-quote what
  it did not capture. No robotic villager behavior was
  flagged by this arm's corpus; the sense-test gap is the
  veteran-word collision above.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The per-seed classes held up: every seed fit exactly
  one class without forcing, and OTHER never fired. The
  precedence order mattered once (99105's living killer
  vs its dead predecessors is LIVING-SHORT by the stated
  rule, not DEAD — the rule did its job).
- The faced split (player-TB vs field) held up and is
  reported as built: wave-4 fights split 27 TB / 15 field
  across the band. The contest-vs-wild split inside field
  fights is NOT engine-distinguished at the fieldFight
  call site, so it is not fabricated: contest share is
  reported exactly for KILLS (via channel) and not at all
  for non-kill faced fights. A next arm that needs the
  faced-contest split must wrap a contest entry point,
  not infer it from fieldFight opts.
- Reconstructed simultaneity agreed with the daily engine
  vet-bar maximum on all 8 seeds (1 / 0 / 1 / 1 / 1 / 0 /
  0 / 0) — the log reconstruction and the engine agree,
  and neither hides a fleeting second veteran (both
  same-day kill-and-die cases contribute to no day, by
  rule and by the engine's end-of-day sample alike).
- The prereg's 5/8 bar for a dominant class or split was
  the right strength: at 4/4 it refused to crown a single
  lever, and that refusal is the result. A next arm that
  wants a GO must either carry a two-track design (one
  track per half) or re-band to a population where one
  half dominates — it must not lower the bar to 4/8 after
  seeing the tie.
- Say-sample cap: anchor the sense-test sample at peak
  standing days (or raise the cap with a tighter filter)
  in the next arm's prereg, so peak-day hold lines are
  quotable from that arm's own corpus.

## Next blanks, in order

1. Two-track veterans work (this arm's finding, NOT a
   single lever — that is why the verdict is
   DIAG-NO-CANDIDATE): track A, encounter opportunity for
   the unlocked-but-unmet seeds (99102, 99106: wave 4
   unlocked, zero wave-4 fights — why does nothing come
   through an open door? spawn/encounter routing, not
   demand numbers); track B, killer survivorship /
   simultaneity for the killed-dead seeds (killers live a
   median 3.5 days after first blood and never overlap —
   the bar needs two alive AT ONCE, and the current
   survivorship never supplies that window). Do NOT move
   readyDemand numbers on this evidence: the never-faced
   half has no kill for any demand shape to count, and
   the killed-dead half's problem is the living-only
   window, not the number 2 — the already-existing
   default-OFF VETSHAPE instrument (living-OR-DEAD
   killers count) is the named probe for track B's shape
   question, not a default flip.
2. Veteran-word collision (sense-test finding): the game
   calls both hardened monsters and blooded villagers
   "veterans" on screen. A naming pass (not a mechanics
   change) is the documented blank; it needs a design eye,
   not a sim.
3. Standing accumulation, part 2 (standaccum blank 3,
   still open): after blanks 1–2, re-measure whether a
   village that both meets wave 4 and keeps two killers
   alive reaches 200 gated AND ready — the release this
   arm, like standaccum, never observed.

## Proof and landing

- Proof: `scripts/test-vetprod-20261104.js` — 13/13 PASS
  (11 fixture tests + live harness smoke + determinism leg
  + off/on neutrality leg).
- Commits (this worktree branch sim-vetprod-b; coordinator
  merges via --ff-only; merged locally, pending ship — no
  push, no bump, no live verification by this worker):
  - b35e915fc sim-vetprod-b prereg (before any judged sim)
  - e98b7121e sim-vetprod-b instruments + proof 13/13 (zero src/js)
  - (pilot + evidence commit below)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-vetprod-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-vetprod-b/` (8 files,
  vetprod-pilot run); scripts
  `vetprod-instrument-20261104.js`,
  `vetprod-driver-20261104.js`,
  `vetprod-analyze-20261104.js`,
  `test-vetprod-20261104.js`.
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the main index after both commits (prereg +
  instruments); repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status` empty
  + `git diff HEAD` empty. The commits themselves were always
  correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers beyond the pilot + evidence commit
  below (verified before reporting).
