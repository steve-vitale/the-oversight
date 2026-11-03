# Winnability-push funnel tracking (arm 3): after-panel, arms 1+2

Measurement only: zero `src/js` changes, zero policy changes, zero
default flips. New files only: prereg, extension instrument, driver,
analyzer, proof test, per-seed corpus, this evidence file.

## Policy stack and tips (read this first — no silent mixing)

- PRIMARY panel policy: `scripts/policies/competent.js` `{competent}`
  VERBATIM, default env — the SAME policy as the baseline. It contains
  ZERO scale code by design and forms zero links ever (see below).
- Attribution guard (parent, 2026-11-03): arm 4 (national) landed on
  master as 29782dbd3 + ff1725835 as a POLICY leg only
  (`scripts/policies/natwindow.js`, `withNatWindow` wrapper, applied
  in the natprobe driver on top of the closecommit stack, never inside
  competent). Verified by grep: competent.js has no reference to
  natwindow, and arm 4 touched no `src/js` and did not modify
  competent.js. The primary panel therefore ALREADY isolates arms 1+2
  (wild ally-join + field-fight damage/staying) — no natwindow in the
  stack, nothing removed to achieve that.
- Optional second arm WITH natwindow: NOT run, deliberately. Natwindow's
  rules (tend links, stand down a muster) both require primary
  subordinate links, which plain competent never forms — so
  competent+natwindow would be identical to competent on this panel by
  construction, and 20 more seeds would measure a no-op. The combined
  question belongs on a scale-courting stack, which is arm 4's own
  judged panel (see national note below), not this one.
- Master tip at panel start: ff1725835 (main tree and worktree agree).
  Master tip at panel end: ff1725835 — UNCHANGED, no mid-panel
  commits, no re-run needed. Worktree tip at run time: 5eb68e45f
  (ff1725835 + this arm's instruments only; game code identical to
  ff1725835, i.e. arms 1+2 as landed in d8f334da8).
- Baseline (NOT re-run): `evidence/2026-11-03/sim-w5faced-competent-a.md`,
  20 seeds, RUN `compdiag`, anchor 4daf2b73a-era master.
- After panel: SAME 20 seeds (98901–98908, 98911–98922), SAME horizon
  (180 days, death-aware), SAME mode string (`competent-w5faced`),
  RUN `winfunnel`, corpus
  `evidence/2026-11-03/perseed-winfunnel-a/`. Staging per prereg:
  seed 98901 ran first as the instrument check (errors 0, extension
  fields sane), then the remaining 19.
- Matched seeds are NOT matched trajectories: once game code changes,
  the same seed's RNG stream diverges (different code paths consume
  RNG differently). The comparison below is population rates over 20
  runs, never per-seed pairing. (Example: baseline 98903 was the one
  release; after-panel 98903 never releases. Baseline 98906 never
  released; after-panel 98906 is the one release.)

## Before vs after (denominator = all 20 runs)

| metric | BEFORE (baseline) | AFTER (arms 1+2) | movement |
|---|---|---|---|
| veterans banked (>= 2 living w4+ killers, any day) | 1/20 | 1/20 | none |
| readiness-5 releases (seeds with >= 1 ready day) | 1/20 | 1/20 | none |
| wave-5 unlocks | 1/20 | 1/20 | none |
| wave-5 facings (>= 1 distinct kind) | 1/20 | 1/20 | none |
| wave-5 fights (starts + fields) | 1/20 | 1/20 | none |
| wave-5 kills | 0/20 | 0/20 | none |
| national reached | 0/20 (policy blank, see below) | 0/20 (policy blank, see below) | n/a |
| wild ally-join rate (field fights carrying >= 1 ally) | 0 joins in arm 1's pre-fix census (202/202 wild fights solo) | 1137/1476 = 77.0% | MECHANISM NOW FIRES IN THE WILD |
| wins / table latch | 0/20 / 0 | 0/20 / 0 | none |
| wave-4 unlocked | 13/20 | 16/20 | descriptive only |
| median survival | 110.5d | 92d | descriptive only; all 20 after-runs end village-lost (baseline: 18 lost, 2 cap survivors) |

Instrument health: `instrumentErrors` = 0 on all 20 seeds. Wrapper
fire totals over N = 20: target / cast / spawn / trigger / start /
tbEnd / field / remove are in the per-seed files; wave-5 stage totals:
target→5 3, cast→5 0, spawns 3 (all fight-candidate, 0 campaignOnly),
trigger→5 0, starts 0, fields 1, kills 0. Every zero below is a
measured zero with a firing wrapper behind it.

## The one release, after (seed 98906) — the funnel in miniature

- Veterans: 1 from d133, 2 on d140. Release: d140–d146, SEVEN
  consecutive ready days (armored 4, armed 6, tricks 26, veterans 2 —
  every bar met exactly), vs the baseline release's single ready day
  (98903, d95). Single-seed observation in each panel, NOT a
  population shift — but the release, when it comes, now holds for a
  week instead of a day.
- Unlock d140 at standing 200. Window: 26 days (d140 → death d166).
- Spawns: 3, all fight-candidate, ALL on the player's own tile
  (distPlayer 0): network_note d142 and d148, editor d161.
- Fights: exactly 1 — a FIELD fight d153, villager visjoin_131 vs
  network_note, outcome vFlee (the villager fled). No TB starts.
- Faced kinds at end: 1 (network_note). Kills: 0. Distance to the
  full-seat bar of 2: 1 kind short.
- Conditional chain on the one unlocked seed: faced|unlocked 1/1,
  fought|faced 1/1, killed|fought 0/1 — the same shape as baseline
  (fought but no kill), reached by a different route: one field fight
  that fled, instead of four TB fights that killed the village's
  leaders in a day. Faced kinds per unlocked day: 1/26 = 0.038
  (baseline 2/12 = 0.167; n = 1 seed each — do not over-claim a rate
  change from single seeds).

## Wild ally-join: the mechanism moved, the funnel did not

- Pooled: 1476 field fights, 1137 carrying >= 1 ally = 77.0%.
  Every seed joins on a majority of its field fights (lowest seed
  59.4%, most 65–90%).
- Sensing coherence: sensing-helper calls 1372, hits (>= 1 villager
  returned) 1137 — and allyJoinFights is 1137 on the nose, equal to
  sense hits on EVERY seed individually. Every joined fight traces to
  a sensing hit; every sensing hit produced a join. This is arm 1's
  wiring proof, now at campaign scale.
- Gap note: 104/1476 field fights (7.0%) never consulted the helper
  (senseCalls < fieldFights). Those fights carry no allies. Which
  router they take is an open measurement question, not a finding.
- Aid-path note: aidFight calls 41, of which 38 carried allies — the
  aid path is a small minority of joins; most joins arrive via
  fieldFight opts directly.

## Why veterans still bind (after-only observation, no baseline delta)

- Veterans banked distribution (max over daily snapshots): 0 on 14
  seeds, 1 on 5 seeds, 2 on 1 seed. Nineteen of twenty villages never
  hold two living wave-4+ killers at once.
- Wave-4 field fights: 83 across the panel, of which villagers KILL 2,
  die 21 times, flee 55 times, evade 5. The veteran maker — a wave-4
  kill — almost never lands in the field, which is where competent
  villagers meet wave-4 monsters. Arm 2's damage/staying changes did
  not make wave-4 field fights winnable in competent play (descriptive:
  the baseline instrument did not record field outcomes by wave, so
  no before/after delta is claimed here).
- The other release bars are not the story this panel: maxArmored
  reaches 4+ and maxArmed reaches 6+ on the release seed for a full
  week, and wave-4 unlocks rose descriptively to 16/20. Armor and
  weapons assemble; veterans do not.

## National note (policy blank — NOT a national finding)

- After-panel national reached: 0/20, national at end 0/20, max scale
  rank `village` on all 20 seeds. Plain competent contains zero scale
  code by design and forms zero links ever, so 0/20 here measures the
  policy, not the game. Do NOT cite it as "national is still unwon."
- Arm 4's numbers, cited ONLY with anchor + caveat: on the
  scale-courting closecommit stack at anchor 6fb93c5c4, natwindow
  moved national reach 3/12 -> 6/12; after arms 1+2 landed, the
  mechanism re-verified on a 5-seed subset at 0/5 -> 2/5. CAVEAT:
  seed trajectories do NOT transfer across src landings, so the
  12-seed numbers must never be quoted as current-master rates. The
  national question was judged by arm 4 on its own stack, not by this
  panel.

## Verdict, in plain words

Arms 1+2 moved the mechanism but not the funnel. Villagers in the wild
now fight together — more than three out of four wild fights have an
ally beside the fighter, where before none did. But the funnel's
numbers did not move at all: still one village in twenty puts together
a ready fighting force, still one in twenty opens the fifth wave,
still one in twenty meets a fifth-wave monster, still none kills one.
The binding constraint is still the veterans bar: villages almost
never bank two living wave-4 killers, because wave-4 kills almost
never land — two kills in eighty-three wild wave-4 fights, the rest
flights and deaths. The one village that did release held its
readiness for a full week and still came away with one faced kind, one
fled fight, and no kill. Until wave-4 kills become achievable in
ordinary play — or the veterans bar stops demanding two of them at
once — the fifth wave stays a one-in-twenty event, and the full seat
stays unwon. That is a finding about the funnel, not a call to change
any gate or price: the gating freeze stands, and this arm changed
nothing.

## Infrastructure

- Registry wedge at setup: `worktree-register.sh` hung inside its
  reap pre-step (sibling reap processes wedged on the registry lock).
  Worked around by creating the worktree directly (`git worktree add
  ~/workspace/worktrees/win-funnel -b win-funnel`, same path/branch
  the register would have made), locking it against pruning
  (`git worktree lock`), and recording the deviation here. Heartbeat
  is N/A for an unregistered slug (script fails fast with "slug not
  registered" — no silent loop). Per the 2026-11-03 AGENTS.md lesson
  (registry holds a `trees` LIST; timeout reports do not prove death),
  no lock/claim/tree of any other run was touched.
- Safe-commit index clobber struck on the instruments commit
  (5eb68e45f) — repaired via HEAD-blob cacheinfo, commit verified
  correct, tree clean after repair.
- No [needs-eyes] — measurement only, no game or UI change. Merge
  pending coordinator: instruments commit 5eb68e45f + corpus/evidence
  commit below.
