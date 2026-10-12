# Long-run sim — lever 2 r5: wave unlock pacing, drop reactions + extra-cap experiment (2026-10-12)

**Context:** r4 audited the villager-xp ledger channels, proved Steve's
villager-XP law complete, fixed the aidFight gap and the -0-health lie, and
left one documented blank: villagers never react when a wave DROPS. Since
r4, combat r6 landed (HEAD 60125f47): the competent policy equips best armor
and crafts bark armor — wave-2 fight losses 21→10, wave-3 wins 1→3 on 24
seeds. This run re-baselines on current master, fills the reaction blank,
and runs the perTypeCap experiment r4 proposed.

Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, VILLAGER XP LAW,
counter convention, breadth-not-throughput). Method:
`scripts/sweep-wave-lever.js`, 20 seeds × 200d, competent policy, seeds 1–20
(same seed set as r4). Raw: `sweep-out/wavelever-r5-baseline.json`
(baseline) and `sweep-out/wavelever-r5-extraCap2.json` (experiment).

## 1. RE-BASELINE: what combat r6's armor did to wave pacing (20 seeds × 200d)

| measure (20 seeds) | r4 (pre-r6) | r5 (post-r6) |
|---|---|---|
| median survival | 67d | 54.5d |
| max days | 170 | **200 (a full 200d run)** |
| deaths (20 runs) | 171 | **138 (−19%)** |
| monster+combat share | 57% | 66% (50+41) |
| starvation | 41 (24%) | 24 (17%) |
| wave-2 unlock | 18/20, med 21 | **19/20, med 20** |
| wave-3 unlock | 9/20, med 53 | **9/20, med 47** |
| wave-4 / wave-5 | 0/20 | 0/20 (still scale-bound) |
| counter discoveries | 177 | 175 |
| w1 kills (vill %) | 261 (72%) | 263 (68% ledger) |
| w2 kills (vill %) | 70 (57%) | 63 (63% ledger) |
| w2 types touched | 13 | 13 |
| counterExtras w1 / w2 | 4 / 1 | **0 / 1** |
| bar→unlock gap | 0 (all) | **0 (all 28)** |
| day floors | inert | inert (earliest w2 unlock d12 > 8; earliest w2 bar-fill d37 > 25) |
| maxArc | — | **3 on 20/20** |
| national / win / four-realm | 0 / 0 / 0 | 0 / 0 / 0 |

The honest read: armor cut total deaths 19% and one village went the full
200 days, but median run length dipped (higher variance — 19/20 runs still
end village-lost). Wave pacing barely moved: w3 holds 9/20 with a better
median day (53→47). The counter bonus is now LITERALLY decorative: **1
extra point across 20 runs** (w2), 0 in w1. The dial r4 flagged doesn't just
barely turn — it doesn't turn at all. Villager share of LEDGER kills (not
just slain): w1 68%, w2 63% — Steve's law holds in the ledger itself.

## 2. BLANK FILLED: villagers react when a wave drops

`Game.waveDropVillagerReactions(wave)` (game.js), wired into
`checkWaveUnlockBeat` after the System beat. One fire-side line per drop:
wave 3 gets two voices (the treeline fear beat), waves 4/5 get one. Living
roster only, uniform `pickRandomVillager` (Steve's rule), temperament-keyed
pools (fear/steady/bold/wry), present-tense — a reaction to the broadcast,
never fabricated shared history. Ungated on `playerAtHaven`: the RATINGS
beat is televised, the whole village hears it, and the reaction rides the
same "Word travels fast" channel as fight summaries. Idempotent via
`_waveAnnounced`; exception-guarded; waves 1–2 no-op (wave 2's beat lives in
checkSystemArrival).

Copy (per wave × 4 buckets):
- w3: fear "Don't go near the treeline alone anymore. Promise me." /
  steady "The treeline's different now. We mark it, we tell everyone, we
  don't go alone." / bold "Then we meet it with torches and steel. I'm done
  being hunted." / wry "Great. The woods got an upgrade. Love that for us."
- w4: "It wears our faces? Then we don't trust faces after dark." /
  "We check each other now. Names, scars — the things only we know." /
  "Let it wear my face. I'll teach it what that costs." /
  "Of course it looks like us. Flattering. Still killing it."
- w5: "The sky's fighting back? Then we go quiet. We go small." /
  "Same work. Sharper eyes. The show doesn't eat unless we feed it." /
  "Good. Let it come down here and say that to my face." /
  "We're the main event now. Somebody tell my agent."

**SENSE verdict (transcripts read, in-sim):** the drop sequence fires at the
exact honest moment — seed 1: player kills the mosquito that fills the w2
bar → counter-learned beat → codex beat → "WAVE LEDGER — wave 2's bar is
full" → RATINGS → System's FINAL DRAFT → treeline narration → Lena (steady)
+ David (fear) at the fire → combat wrap. Seed 5: a VILLAGER's kill fills
the bar while the player forages — David + Marcus answer anyway, and
Devon's ambient "Stay close, yeah?" lands right after as an accidental
rhyme. Two distinct voices per drop, no echo (sense-caught a same-line
parrot in the first draft — fixed by preferring distinct temperament
buckets; proof asserts no-echo across 12 seeds), no dead villagers, never
the scholar, idempotent. Meaning: the village is scared of the treeline
and says so. Coherent, consequential, present-tense. PASS.

Tooling: `scripts/sense-wave-drops-20261012.js` (prints unlock-day
transcripts for the human read); sweep's BEAT_RE now captures "at the fire"
lines (they fired but were invisible to the sweep before).

## 3. LEVER EXPERIMENT: counter extras exempt from perTypeCap — MEASURED, NOT LANDED

r4: "the perTypeCap=2 mastery bonus clips counter extras to ~1pt/type —
the dial barely turns." Experiment: `WAVE_EXTRA_CAP` env → separate per-type
allowance for counter extras (perTypeX), outside the shared cap; blind
farming still caps at 2/type. Default 0 = legacy (production untouched).
Identical 20 seeds, before/after:

| measure | baseline | WAVE_EXTRA_CAP=2 |
|---|---|---|
| extras paid (20 runs) | 1 | **102** |
| wave-2 unlock | 19/20, med 20 | 20/20, med 18 (5 seeds 6–9d earlier) |
| wave-3 unlock | 9/20, med 47 | 11/20, med 46 |
| deaths | 138 | **181 (+31%)** — monster 50→60, combat 41→53, starvation 24→38 |
| w2-bar breadth (types) | 3–7 | one run effectively 2 |
| bar→unlock gap | 0 | 0 (bar still binds; floors inert) |
| villager ledger-kill share | 68% / 63% | 76% / 62% (law holds) |

**The call (mine — Steve 2026-10-07): DO NOT LAND.** Three findings:
1. The lever moves the WRONG gate: extras overfill the w1 bar → wave 2
   lands up to 9 days earlier → harder monsters hit younger villages →
   deaths +31%. The w3 gate it was aimed at barely moves (9→11, med 47→46)
   because it's throughput-bound (4 w2 kills), not extras-bound.
2. Breadth weakens in practice, not just theory: a w2 bar filled on
   effectively 2 types (one invisible in the dump — extras-only types write
   perTypeX without a perType entry). Canon says breadth-not-throughput.
3. The trade is bad: +2 wave-3 unlocks for +43 deaths and a faster, bloodier
   early game. The cap is load-bearing.

The code stays env-gated at default 0 — zero production effect. If Steve
wants the dial turned later, the honest version needs the w1 bar protected
(extras only from wave 2 on) AND a breadth floor that survives extras; even
then the w3 gate won't move much. Documented here instead.

## 4. REACHABILITY

- Waves 1–3: reachable (w3 9–11/20, days 28–85). Waves 4–5: 0/20 — still
  scale-bound (0/20 reach regional; lever 8's wall). Documented, not fixed here.
- Ledger beat honesty: re-verified in transcripts ("kills only, not
  near-misses"; full-beat names the real next gate). The w5 "You're the show
  now" line remains sim-unreachable (unit-test-only).
- aidFight channel (r4's fix): still scores after combat-r6's kit changes —
  `test-wave-kill-channels-20261012` 17/17 green.
- r4's stale suites repaired again: `test-reach-wavebeat-20261010` was
  1 pass / 7 fail on PRISTINE HEAD (asserted the reversed engagement lanes
  + a cap-ignorant rig) — rewritten to canon: reversal asserted, cap-aware
  rig, adopt silence, no wave-2 villager beat. 8/8.

## 5. VILLAGERS AS PEOPLE (sampled)

- Fight summaries read like people: "Moshe killed the Nightlight alone —
  3 rounds, 40 taken. Word travels fast." / "The Choir Toad killed Sunan in
  2 rounds. The village mourns." The r4 "-0 health" lie fix holds.
- Wave-3 fights: villagers flee 48, kill 0, die 3 — sensible (w3 bands are
  mid-build fights; villagers aren't mid-build).
- Fire-side chatter is alive: David muttering about the smoke rack, Lena's
  gossip ("Someone's been leaving food out..."), David's relief beat
  ("We can't just watch this happen..."). Nothing robotic in the sampled
  lines.
- Flagged but not fixed: villager first names repeat across seeds (the
  generator's name pool — David in seed 1 and seed 5 are different people);
  fine within a run, noticeable across runs in evidence. Not a bug.

## Village assessment (plain words)

The villages are armored now and it shows in the death toll (138 vs 171)
but not in the story: 19 of 20 villages still wipe, median day 54. Wave 3
is a real era on nearly half the runs (9/20, as early as day 37), and now
the village SAYS something when it arrives — Lena marking the treeline,
David asking you to promise. The ledger is honest about who does the
killing: two-thirds of it is villagers. Nobody reached regional, nobody saw
the table — the late game is still a wall, and the experiment proved the
wave-3 gate won't be hurried by ledger tricks: it wants bodies, and bodies
want time.

## Blanks filled

1. **Villager wave-drop reactions** (game.js): the village answers the
   drop — 12 lines of copy across waves 3/4/5, temperament-voiced,
   sense-read in-sim. Proof `test-wave-drop-reactions-20261012` 14/14
   (red-checked, no-echo, idempotency, dead-exclusion).
2. **Extra-cap experiment measured, not landed** (waveLedger.js, env-gated,
   default legacy): 102 extras paid but pacing worsens (+31% deaths) and
   breadth loosens — documented, dial left alone. Proof
   `test-wave-extra-cap-20261012` 15/15.
3. **test-reach-wavebeat rewritten to canon** (was asserting reversed
   design): 8/8.
4. **Sweep transcript capture**: BEAT_RE now records "at the fire" lines;
   new `sense-wave-drops-20261012.js` tool.

## Documented (not fixed)

- Waves 4–5 sim-unreachable (scale wall, lever 8). w5 beat unit-test-only.
- test-wave3-5 roster-count asserts stale (56→59) — content loop's drift,
  pre-existing.
- aid-comms 3 pre-existing failures — endgame build's, per MEMORY.md.
- Extra-cap variant: needs w1-bar protection + breadth floor to be
  landable; w3 gate is throughput-bound regardless.

## Tests & commits

- NEW `scripts/test-wave-drop-reactions-20261012.js` — 14/14 (1 red pre-fix
  control, no-echo sense assert)
- NEW `scripts/test-wave-extra-cap-20261012.js` — 15/15
- NEW `scripts/sense-wave-drops-20261012.js` — sense tooling
- FIXED `scripts/test-reach-wavebeat-20261010.js` — 8/8 (was 1/7 on pristine)
- FIXED `scripts/sweep-wave-lever.js` — BEAT_RE captures fire-side lines
- Regressions: wave-ledger 31/31, villager-wave-xp 20/20, wave-kill-channels
  17/17, fieldfight-summary 11/11, wave-bar 13/13, bal-waves 30/30,
  contest-ledger 22/22, wave45-coherence 22/22, counterplay 36/36,
  ontology 84/84
- Sweeps: `sweep-out/wavelever-r5-baseline.json`,
  `sweep-out/wavelever-r5-extraCap2.json` (20 seeds × 200d competent,
  identical seeds)
- `[needs-eyes]`: wave-drop reaction copy is player-visible (fire-side
  lines Steve will see on his phone)
