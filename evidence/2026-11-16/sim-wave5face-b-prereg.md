# sim-wave5face-b — PREREG (binding)

Run: fleshout-loop-b-20261116T2230Z (Loop B), axis winnability chain, arm
sim-wave5face-b — DIAG follow-up: seed 102706 released on the final day
(d151) — does it face wave 5? (tracker blank #8). Branch `sim-wave5face-b`
(worktree `~/workspace/worktrees/sim-wave5face-b`). Base: master
`cc0daf6c9` at arm start (Loop A's planignite DIAG + journey-landing r140
already on master). Binding prereg: THIS file — frozen before any judged
sim. The instrument (driver, analyzer, proof test) is built AFTER this
commit; no judged numbers exist yet. Commit this file FIRST
(`scripts/safe-commit.sh` "sim-wave5face-b: frozen prereg — ..." — see
the worker brief), then build.

## The question, in plain words

On the stand199 band 102701–102708 (150d, competent verbatim), 4 of 8
villages released from the standing-199 stall when their second living
veteran arrived (102701 d102, 102702 d98, 102704 d115, 102706 d151). Two
of them killed wave-5 monsters (3 kills total — the first on any standing
band). But 102706 released on the post-horizon snapshot (d151, the last
possible day), so whether it then faces wave 5 or collapses under the open
door is unmeasured. And engagement without a kill is still unmeasured —
the reused snapshots have no w5faced field. This arm answers: do the
released villages face wave 5? This is a DIAG — measure it, do not build
a fix.

## Band reuse (recorded + justified)

- Band: **102701–102708** (8 seeds), REUSED from sim-stand199-b — this is
  the NAMED follow-up on those exact seeds, not a fresh-band question.
  The variable is the horizon (150d → 200d); identical seeds, same
  policy. Do NOT re-judge the 150d corpus; cite it only as the 150d
  reference (`evidence/2026-11-16/perseed-stand199-b-off/` +
  `perseed-stand199-b-on/`, already committed under arm sim-stand199-b).
- Justification: the question is defined ON those seeds (102706's d151
  release; the 4 released seeds; the 2 seeds with wave-5 kills). A fresh
  band would answer a different question (how often villages face wave 5
  in general) and could not say what happened to 102706 after its door
  opened. Reuse is the correct design for a named follow-up; the
  seed-band freshness rule exists to keep fresh questions from reusing
  bands, and this is not a fresh question.
- The 150d reference values: the stand199 ON-leg per-seed table
  (evidence/2026-11-16/sim-stand199-b.md §Per-seed table): released
  102701 d102, 102702 d98, 102704 d115, 102706 d151; defer5 102703,
  102705, 102707, 102708; wave-5 kills 102701: 2, 102704: 1.

## Prior art (read first)

- `evidence/2026-11-16/sim-stand199-b.md` + prereg — the subject: the
  199 stall is the defer5 veterans gate; 4/8 released, each on its
  second living veteran's arrival day; first wave-5 kills on any
  standing band (3 kills, 2/8 seeds). Metric review: "Engagement
  without a kill is still unmeasured (no w5faced field in the reused
  snapshots); a next arm that needs the facing should wrap a wave-5
  engagement entry point" and "102706's release lands on the
  post-horizon snapshot (d151) ... A longer horizon would say whether
  102706 then faces wave 5 or collapses under the open door."
- `evidence/2026-11-16/sim-standing199-a.md` — the instrument this arm
  reuses (`scripts/standing199-instrument-20261110.js`), and the
  standing199-a metric review's earlier note that facing needs an
  engagement wrap.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave law: wave 5
  "The Producers", gate standing >= 200 AND wave-4 faced; 8 named
  Producers — Cancellation, Editor, Rerun, Spoiler, Timeslot, Nielsen,
  Finale, Network Note — plus 2 finale variants in
  `src/data/monsters.json`, 10 wave-5 ids total; bands damage 50–130,
  HP 1000–2200; engagements feed the endgame deed bars only, never the
  ledger; vDie records nothing, evade records nothing).
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  the standing / scale system specifically (carried from the stand199
  prereg). Nothing in this evidence invents canon: every mechanism below
  is grounded in the code read (file:function cited) and will be
  confirmed or overturned by the measured corpus.

## Code read (hypotheses to test, NOT verdicts)

All function names re-located on THIS tree at arm start (line numbers
drift daily; the proof test locates by function name):

- **The engagement entry point is `recordDeedFight(monsterId)`**
  (`src/js/progression.js:652`): the choke point every real blow-by-blow
  fight flows through. It is fed by three wraps (`progression.js:1436`,
  `1444`, `1471`): `startCombat` (the player's TB fight entry — a fight
  that actually starts; the double-tap refusal path creates no tbfight
  and records nothing; fleeing still counts), `recordWaveKill` (every
  real kill path — player TB, villager field/patrol), and `fieldFight`
  outcomes `vKill` / `mFlee` / `vFlee` (villager blow-by-blow fights).
  It writes `deedState().wavesFaced[monsterId] = wave`, deduped by
  monster id — the first fight per type records; repeat fights vs the
  same type record nothing. `Game.waveEngaged(5)` (`src/js/game.js:34540`)
  reads that map: distinct wave-5 types faced. Wave 5 has 10 ids in
  `src/data/monsters.json`, so at most 10 distinct wave-5 engagements
  per run.
- **What the entry point CANNOT see (frozen limitations, not bugs to
  fix in this arm):** (1) pre-combat evades (`evade` — "saw it, gave it
  room") never call `recordDeedFight`, so an evaded wave-5 monster is
  invisible to this wrap; (2) villager field-fight deaths (`vDie` —
  "the dead told no tale") never feed the deed map, so a villager dying
  to a never-before-faced wave-5 type leaves no engagement record. The
  facing count this arm measures is therefore a LOWER BOUND on distinct
  wave-5 types fought — the engine's own deed definition of "faced"
  (a fight that started, or a kill). Both gaps are recorded here and in
  the evidence metric review; neither is re-scored mid-run.
- **Outcome classification (frozen, per engagement):** an engagement is
  recorded at wrap time with day, monster id, gated/raw standing, and
  living-veteran count. Its outcome is resolved at end of run from
  state the engine already keeps:
  - `killed` — `state.waveKillLog` contains an entry with
    `mid == monsterId`, `w == 5`, `d == engagement day` (the same-day
    kill of that type; a later kill of the same type belongs to a later
    fight, and the deed feed's per-type dedupe means it is not this
    engagement).
  - `died` — no same-day kill of that type AND >= 1 death sample on the
    engagement day with `kind` in (`monster`, `wild`) — a combat death
    on the engagement day, plausibly from that day's wave-5 fight. The
    death count that day is recorded in the event; attribution is
    same-day, not per-fight, and is stated as such in the evidence.
  - `fled` — faced, no same-day kill of that type, no same-day combat
    death. (Driving the monster off, `mFlee`, and fleeing, `vFlee`,
    both land here — the deed feed counts both as faced; the
    distinction is not tracked by this entry point and is not claimed.)
  - `evaded` — NOT an outcome this instrument can observe (see above);
    the outcome set is killed / fled / died, and the evaded gap is a
    metric-review item.
- **Release-set definition (frozen):** a seed is **released** iff its
  peak wave reaches 5 during THIS run's 200d ON leg (the stand199
  classifier, `standing199-analyze-20261110.js`). The stand199 release
  set (102701/102702/102704/102706) is the REFERENCE expectation; if
  this run's released set differs, both sets are reported per seed and
  the difference is explained by the 150d-prefix divergence check
  below — never hidden, never re-scored.
- **A released seed counts as faced** iff at least one wave-5 engagement
  is recorded for it by d200. A released seed with no engagement by d200
  counts as **never-faced**, not unknown. A seed that dies before its
  release day does not count against the instrument (it never released).

## Base movement since stand199 (why the 150d reference may not reproduce exactly)

The stand199 corpus was measured on base `7bb50f3dc` (policy sha
`74a890f0844e…`). This arm's base is `cc0daf6c9`. Between them:
- `scripts/policies/competent.js` +10 lines: the r140 BUDGET STOP
  (journey-landing r140) — a spent movement budget now refuses every
  tile at once instead of spamming one refusal per candidate, in
  `closeStep` and `beastStrikeTarget`. This is a real policy-behavior
  change inside combat movement and CAN move fight outcomes and
  trajectories.
- `src/js/conversation.js` (+87/−?), `convo-dialogue.js`, `convo-scene.js`
  (journey r140: silent `warn_you` heed turns + close/budget stop) —
  conversation-path game-code changes that CAN move trajectories where
  the policy's conversation choices change outcomes.
- Loop A's planignite DIAG (instrument-only, no game change).
So the 150d-prefix check below is a MEASUREMENT, not an assumption of
identity: per seed, first divergence day + diverging fields vs the
committed stand199 ON corpus, explained (r140 policy/conversation
change) rather than waived. A divergence is a finding about the moved
base, not an instrument failure — unless the divergence is in a field
the recorder itself writes, which would be investigated as an
instrument defect.

## Design — the recorder (frozen)

One shared band, TWO legs, zero `src/js` game-code change on either:

- **OFF leg** = master as-is, recorder off (trajectory reference).
  **ON leg** = master as-is + recorder wraps only (the judged leg).
  The judged comparison is ON (measured facing) against the OFF leg's
  trajectories (neutrality — the recorder must not move the game). No
  seed call, no lever, no balance change: this is a DIAG follow-up,
  NOT a change.
- Instrument (REUSED, proven): `scripts/standing199-instrument-20261110.js`
  (arm sim-standing199-a; 0 instrument errors on ~1,060 daily snapshots
  on its band; reconciliation exact) — daily standing snapshots kept
  UNCHANGED so the 150d reference values are comparable. New driver
  `scripts/wave5face-driver-20261116.js` (based on
  `scripts/stand199-driver-20261116.js`, same harness shape) EXTENDS it
  driver-side only (the shared instrument module is untouched):
  - wraps `Game.recordDeedFight` (scripts-side, in the driver): before
    calling the original, read the wave-5 faced set
    (`deedState().wavesFaced` keys with value 5); after calling it,
    diff — any NEW wave-5 id is one engagement, recorded driver-locally
    with `{day, mid, gated, raw, war, diplomacy, plenty, veterans
    (living wave-4+ killer vids count), scaleRank}`. Pure reads + a
    driver-local array push — no game-state writes, no RNG draws.
    `WAVE5FACE_RECORDER=off` skips installing the wrap (D2 leg).
  - daily snapshot augmentation (driver-side only): `w5facedCount` =
    `Game.waveEngaged(5)` and `w5facedIds` (sorted wave-5 faced ids),
    recorded on BOTH legs (pure reads, so the OFF leg carries the same
    shape for the D2 comparison).
  - end-of-run: engagement outcomes resolved per §Code read from
    `state.waveKillLog` + the run's death samples; reconciliation
    check — recorded engagements == final `waveEngaged(5)` count AND
    the recorded mid set == the `wavesFaced` wave-5 key set (mismatch
    is an instrument error, counted, never waived).
  - `Game.say` tap kept (same tight filter as stand199) for the
    standing lines; the sense leg (below) is the System-voice source.
- Analyzer `scripts/wave5face-analyze-20261116.js`: reuses the stand199
  analyzer's `analyzeSeed` for the pin/release classification, and adds
  the facing table (per released seed: release day, first-faced day or
  never, engagements with outcomes, wave-5 kills, fate by d200), the
  wall numbers, the OFF-vs-ON D2 comparison (daily signatures incl. the
  new w5 fields + wall fields), and the 150d-prefix comparison against
  the committed stand199 ON corpus (per seed: first divergence day +
  diverging fields, or identical).
- Proof `scripts/test-wave5face-b.js`: static checks (zero `src/` diff;
  wraps named, incl. the new engagement wrap; instrument reused by
  path) + fixtures (engagement recording on a synthetic faced-set diff;
  outcome classification killed/fled/died incl. the same-day rule;
  reconciliation mismatch detection) + live harness legs: smoke (1
  seed, 30d, 0 instrument errors, every snapshot reconciles), D1
  determinism (recorder ON twice, seed 102701, 60d, identical facing
  corpus incl. engagements), D2 neutrality (recorder ON vs OFF, seed
  102701, 60d, identical daily trajectory signatures + identical wall
  fields), D3 (analyzer re-derivation: recorded engagements reconcile
  with `waveEngaged(5)` + `wavesFaced` on the ON corpus, mismatch 0).
- Sense leg (supplementary, NOT judged): one-seed run with
  `loadGame({captureSysSay})` on a released seed at its first wave-5
  facing, with a trajectory-identity guard (common-day gated/raw/living
  values identical to the ON corpus, 0 diffs) before any line is quoted.
  The pilot's `Game.say` tap caught 0 lines on all 8 stand199 seeds —
  the hold beats live on `sysSay` — so the sense leg uses `captureSysSay`,
  NOT the `Game.say` tap (the stand199 metric-review say-tap gap, applied).

## Primary metric + GO bar (frozen)

Primary metric: **wave-5 facing among the released seeds by d200** —
faced vs never-faced, with wave-5 kills as a secondary count.

GO (instrument validity) iff ALL hold:

1. **All 8 seeds produce valid corpora, 0 instrument errors** (8 OFF +
   8 ON files parse as JSON; `instrumentErrors` empty on every ON file;
   reconciliation: recorded engagements == `waveEngaged(5)` on every ON
   file).
2. **Proof green**: `scripts/test-wave5face-b.js` — static checks (zero
   `src/` diff; wraps named, incl. the new engagement wrap) + D1
   determinism (recorder ON twice, one seed, 60d, identical facing
   corpus) + D2 neutrality (recorder ON vs OFF, same seed, 60d,
   identical daily trajectory signatures + identical wall fields),
   green on the instrument tip.
3. **The facing question answered for ≥3 of the released seeds in this
   run** (a seed that dies before its release day does not count against
   the instrument; a released seed with no engagement by d200 counts as
   never-faced, not unknown). If this run's released set differs from
   the stand199 set, both sets are reported per seed.
4. **Wall numbers reported** (national by standing ≥200 AND by
   scaleRank, table, wins, wave 4/5 unlocked, median survival, wave-4
   kills, wave-5 kills, deaths) — for the ON leg, with the OFF leg's
   beside them for the neutrality read.

The VERDICT is the facing table itself: per released seed — release day,
faced day (or never), kills, fate by d200. A DIAG GO means the instrument
is valid and the table is trustworthy — not that any hypothesis "wins".
No balanced panel (DIAG, no game change) — stated in the evidence.

## Seed band (reused, verified)

- Band: **102701–102708** (8 seeds), OFF leg first (recorder off), then
  ON leg (recorder on), identical seeds, same policy/horizon. See §Band
  reuse for the justification. NEVER 100621–100636, 100861–100868,
  100821–100828, 100721–100728, 100761–100768, 10100–10139,
  190391–190398, 190621–190628, 190631–190638, 190541–190548,
  190561–190568, 102131–102138, 102201–102208 (the poolmarginals
  forbidden list, carried over, plus the awayhaven/seedpaths/haventarget
  bands).

## Horizon, policy, death-awareness, legs

- Horizon **200 days**, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js` —
  sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`,
  VERIFIED by the worker on this tree before the prereg commit with
  `sha256sum` — do not trust the brief's value blindly; the policy
  changed under journey-landing r140, and this hash is the post-r140
  blob).
- OFF anchor = the instrument commit (driver + analyzer + proof test,
  recorder OFF by env); ON anchor = the same commit, recorder ON by env
  (no `src/` change between legs — the legs differ ONLY by the
  `WAVE5FACE_RECORDER` env flag). Both SHAs are recorded in the evidence
  file (they are the same commit; the env flag is the leg).
- Determinism: D1/D2 as in §Primary metric. Drift check: the analyzer's
  re-derivation must pass on every snapshot; the full-band OFF-vs-ON
  daily-signature comparison must show 0 divergences (any divergence is
  investigated, not waived). 150d-prefix check vs the committed stand199
  ON corpus: per seed, first divergence day + fields (see §Base movement
  since stand199).

## Sense-testing (mandatory)

Read the say lines for a released village's first wave-5 facing. Quote
the departure/return/fight lines for at least one facing (or state that
none fired). Judge meaning, not just counts: does the village hear WHY
it is walking into the Producers, and does the fight read as a fight
rather than a ledger tick? The sense leg uses `captureSysSay` with the
trajectory-identity guard (see §Design); the pilot's `Game.say` tap is
the secondary source.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did the 200d horizon answer 102706 (released d151 at 150d) — faced,
  never-faced, or dead before facing?
- Did any released seed face wave 5 without killing (engagement without
  a kill now measured) — and what were those engagements' outcomes?
- Did the released set change vs stand199 (policy r140 + conversation
  changes) — which seeds, and what does the 150d-prefix divergence say?
- Were there engagements the wrap could not see (evaded monsters,
  vDie field fights vs never-faced types) — is the lower-bound caveat
  load-bearing on any seed's verdict?
- Was 200d the right horizon, or did facings/releases cluster at the
  tail / before the first death?
- Did the OFF leg reproduce the ON leg's trajectories exactly (D2
  full-band), or did the recorder move anything?

## Wall numbers (report every run)

National (standing >= 200 AND scaleRank), table, wins, wave-4 unlocked,
wave-5 unlocked, wave-5 faced, median survival, wave-4 kills, wave-5
kills, deaths — per leg.

## Correction 1 (recorded AFTER the judged sweep, BEFORE the evidence — read first)

The prereg's frozen outcome rule for `died` was wrong about what the
run-days death samples contain, and the first ON-leg corpus was resolved
under the wrong rule. The error was found by reading the engine while
checking the v1 outcomes against the corpus deaths list, before any
evidence was written.

- **The error.** The prereg says `died` = "no same-day kill and >= 1
  death sample on the engagement day with kind in (monster, wild)".
  The death samples (`sim-harness.js` live capture of `Game.tele('death')`)
  mix TWO kinds of death (`src/js/corpses.js` registerDeath: "kind
  covers person/monster/animal"). `kind='monster'` rows are MONSTER
  deaths — the village killed something, `who` is the monster id —
  NOT fighter deaths. And `kind='wild'` never occurs in the corpus (0
  rows on all 8 seeds). The villager field-combat death signal is
  `kind='villager'` (or `'person'`) with a combat cause (`'the wild'`,
  `'monster'`, or a named monster).
- **What it mislabeled.** Exactly one engagement: 102706 d158 nielsen
  (v1 outcome `died`, combatDeathsSameDay 1) — the only death that day
  is a monster the villagers killed (influencer, `villager combat`); no
  villager died that day. Its correct outcome is `fled`. The other two
  v1 `died` engagements keep their outcome under the corrected rule
  (102702 d144 editor and 102704 d118 cancellation each have a real
  villager wild-death that day); their combatDeathsSameDay counts drop
  (2→1 and 4→1 — the monster-death rows no longer inflate them).
- **The corrected rule (now in the driver).** `died` = no same-day kill
  of that type AND >= 1 person combat death that day: kind
  `villager`|`person` with cause `'the wild'`, `'monster'`, or the
  id/name of a wave-5 monster. `combatDeathsSameDay` counts qualifying
  person combat deaths only.
- **What changed and what did not.** The driver (`classifyEngagements`)
  and its proof fixtures are corrected; the analyzer gains a
  re-derivation cross-check (`rederiveOutcomes`, corpus deaths list
  only) that flags any disagreement with the driver's kill-log read.
  The ON leg was RE-RUN under the corrected driver (deterministic —
  D1 proven — trajectories byte-identical to v1 except the outcome
  fields; verified by diff, v1 corpus kept in /tmp, not committed).
  The OFF leg was NOT re-run (it carries no engagements; D2 compares
  daily signatures + wall fields, none of which include outcomes).
  Corrected outcome totals: killed 3, fled 10, died 2 (v1: killed 3,
  fled 9, died 3). The facing verdict is UNCHANGED (5/5 released seeds
  faced; 102706 faced 3 types) — one outcome label flips, no seed's
  faced status moves. No GO bar moved: the bars judge the instrument
  (valid corpora, proof green, facing answered for >=3 released seeds,
  wall numbers), and all four hold under the corrected rule.
- **Why this is a correction, not a re-score.** The frozen rule's INTENT
  ("a combat death on the engagement day, plausibly from that day's
  wave-5 fight") is unchanged; the rule's KIND READ was factually wrong
  about the engine's death records. The correction makes the
  implementation match the frozen intent, and the evidence reports both
  the v1 and corrected values per affected engagement.
