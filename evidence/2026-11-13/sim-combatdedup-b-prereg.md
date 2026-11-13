# sim-combatdedup-b — PREREGISTRATION (arm sim-combatdedup-b, run fleshout-loop-b-20261113T0830Z)

## Filing

sim-findings.md #2293 (COMBAT LINES REPEAT, filed 2026-11-13 from
sim-tendshift-a evidence): identical combat lines repeat 5–14× within a
single day — interaction 190398 d27 "Catalina strikes the Scarred The
Moderator." ×14, d63 "Catalina strikes the Elder Loud-Eyes." ×11;
baseline 190396 d26 "The Scarred ducks in a row (head) falls." ×7;
baseline 190395 d53 "The Elder Buffering SNAPS!" ×6. The lines carry no
round variation, damage, or outcome. Same family as the pack-leader
freeze repetition (finding #2291, Loop A arm sim-freezeline-a).

## Canon

No canon doc covers combat-narration dedup. CANON.md manifest checked
2026-11-13; MONSTER-WAVES.md has no strike/kill/snap narration lines.
This is narration hygiene, not a canon change.

## Freezeline status observed (2026-11-13 ~10:30Z, re-checked before writing)

- Loop A arm sim-freezeline-a HAS a commit on its branch:
  `40144c0f5` "[needs-eyes] sim-freezeline-a: freeze line once per
  monster per fight (44->21 lines, survival byte-identical 9/9)".
- It is NOT on master: `git merge-base --is-ancestor sim-freezeline-a
  master` = NO; `evidence/2026-11-13/sim-freezeline-a.md` absent from
  master; `_stunAnnounced` 0× in master `src/js/game.js`. The goal
  findings file marking #2291 [fixed] is therefore premature — the fix
  exists only on Loop A's branch. This arm does NOT close #2291.
- Mechanism (read-only from branch `sim-freezeline-a`, commit
  40144c0f5): in `tbMonsterTurn`, the stunned branch says the freeze
  line only if `!f._stunAnnounced[m.key]`, then sets the flag — a
  once-per-monster-per-fight flag on the fight object `f`. This arm
  composes with the same pattern (fight-object flag, different
  namespace) and extends the already-existing general mechanism
  `sayOncePerFight` (game.js ~47423: exact-text, once per live fight,
  keyed on the fight object) — see "Fix shape" below. No second system.
- The 0× vs 44 contradiction is a CAPTURE difference, resolved by
  reading the drivers, not by trusting either count: tendshift's
  vetSays filter (`SAY_RE`, tendshift-driver-20261113.js:306) matches
  only veteran|blooded|scarred|elder|pack-leader|… — the freeze line
  ("…is still frozen from your scream.") contains none of those
  keywords, so tendshift's "freeze line fires 0×" is a filter artifact,
  not a real zero. Freezeline's driver captures the freeze line
  directly and counted 44. This arm re-measures the freeze line with
  its own UNFILTERED combat capture as a control (reported, not
  fixed — freeze belongs to Loop A).

## Emit sites (read on current master 85f9cbff6)

1. **Villager strike/harry** — `src/js/game.js:41135`, `tbVillagerTurn`:
   `this.say(`${v.name} ${a.type === 'strike' ? 'strikes' : 'harries'} the ${this.encTheName(t)}.`)`
   Fires on EVERY villager strike/harry action: no damage, no round
   variation. Provably redundant: `tbDamage` voices every hit right
   after with "`${source} hits ${target} for ${final}.`" (game.js
   ~39899), so silencing repeat announcements loses no outcome info.
2. **Monster falls** — `src/js/game.js:40064`, `tbDamage` death branch:
   `this.say(`${this.encSubject(t)} falls.`)` — once per monster death.
   Snake segments are separate fighters ("…(head)", "…(3)"), and a
   mid-snake kill splits the snake (`tbSnakeSplit`, game.js:39136),
   which announces its own line ("🦆 The head goes down — the next
   duck in line takes the lead…"). Whether the ×7 falls are distinct
   deaths in ONE fight or across fights is decided from the
   fight-tagged baseline below — see "Falls decision rule".
3. **Ambush SNAPS** — `src/js/game.js:46126`, `tbMonsterTurn` ambush
   branch: `this.say(`💥 The ${this.encTheName(m)} SNAPS! No warning.
   There never is.`)` — fires every round the ambush monster has an
   adjacent foe. The snap IS the monster's declaration (like the
   freeze line, the bellow already announces each fresh stun); the
   damage itself is voiced separately by the `tbDamage` loop that
   follows. Turtle variant at :46118 (`… SNAPS! Its head is suddenly
   somewhere else.`) is the same family.

## Existing dedup mechanisms (ROOT-CAUSE FIRST)

- `emit()` (game.js ~47372) dedups only the EXACT CONSECUTIVE line
  (last log entry). The repeats here are non-consecutive (other lines
  interleave), so it never fires on them — that is the root cause of
  the family: every per-round/per-death say-site re-announces an
  identical line and nothing between the sites remembers.
- `sayOncePerFight(msg)` (game.js ~47423): exact-text, once per live
  fight, store `_midFightRefusals` on the fight object; degrades to
  plain `say` outside combat. Used today only for refusal texts.
- `sayGated(key, msg, maxPerDay)`: per-day throttle, off-state counter.
- `pickFresh` / `rotLine`: rotation variety (e.g. `tbVillagerWaitLine`
  fixed 547 identical "holds and watches" the same way, r147).

## Baseline measurement (CHECK leg, before any fix)

- Driver: `scripts/combatdedup-driver-20261113.js` (own capture, modeled
  on the freezeline driver): wraps `Game.say`, captures EVERY say line
  in the four combat classes with game day AND fight index (a running
  counter incremented whenever `Game.tbfight` changes identity, so
  repeats can be attributed to one fight vs many fights in a day).
  Classes: STRIKE (`/strikes the|harries the/`), FALLS
  (`/^(☠ |The |A |An ).* falls\.$/`), SNAPS (`/SNAPS!/`), FREEZE
  (control only: `/still frozen from your scream/`).
  Per-seed JSON to `evidence/2026-11-13/perseed-combatdedup-b-check/`.
- Seeds: matched band 190391–190398 (8) — the same band as tendshift
  and freezeline, so before/after is comparable.
- Policy: competent verbatim (`scripts/policies/competent.js` as on
  master; sha recorded per seed).
- Horizon: 150d death-aware (§10: reachability-class; the filed
  observations sit at d26–d63).
- Anchor: `85f9cbff6` (worktree base). The driver refuses any other HEAD.
  **CORRECTION (before the check leg ran):** an exact-hash guard is
  unworkable for a driver that lives in the repo — the prereg + driver
  commits themselves moved HEAD past 85f9cbff6, so the guard as written
  refused the very tree it was committed on (caught on the first smoke
  run, no seeds run). The guard now proves what matters instead: HEAD
  descends from 85f9cbff6 AND `git diff 85f9cbff6..HEAD -- src/js` is
  empty AND no COMBATDEDUP marker is present. Verified at the time of
  the correction: the diff touches ONLY the prereg and the two new
  scripts, zero `src/js` changes — so the check leg runs on current
  master 85f9cbff6 game code plus measurement tooling.
- CHECK rule (pre-registered): REPRODUCES if any class (strike/harry,
  falls, SNAPS) has max identical line per (seed, day) ≥ 4 on any seed.
  KILLED-ON-CHECK if every class is ≤ 3 everywhere.

## Fix shape (decided from the mechanisms above, before the fix)

- Generalize `sayOncePerFight` from refusal-only to the general
  per-fight exact-text combat dedup: keep the name and the
  outside-combat degradation, generalize the store (same fight-object
  keying). Then route the strike/harry line (site 1) and the SNAPS
  line (site 3, keyed per monster — same flag pattern as freezeline's
  `_stunAnnounced`, different namespace, so two same-named monsters
  in one fight still each snap once) through it. A new fight gets a
  fresh voice; a different attacker, target, or verb is a different
  exact text and still voices.
- Falls (site 2) decision rule, decided from the fight-tagged
  baseline and recorded in the evidence BEFORE judging the after-leg:
  INCLUDE falls in the per-fight dedup ONLY if the baseline shows ≥2
  same-label falls inside a SINGLE fight (i.e. the repeats are
  same-fight re-announcements, not distinct fights); otherwise falls
  stays fully voiced (each fall is a distinct death — the only
  announcement of that kill) and is reported as a documented blank
  with its counts, not deduped. The snake-split line already voices
  the reform, so a same-fight repeat is redundant by the same
  argument as the strike line.
- No RNG draws added or removed anywhere in the fix (narration only);
  `sayOncePerFight` and the flag check draw nothing, so the sim
  stream is untouched by construction.

## GO bar (pre-registered; judged against this header)

- After-leg, on the SAME 8 seeds, same driver: for the strike/harry
  and SNAPS classes, max identical line per (seed, day) ≤ 3 on every
  seed, AND total repeat-lines (Σ(count − 1) over repeat groups)
  reduced ≥ 80% vs the baseline leg.
- Falls class judged by the decision rule above (included → same
  ≤ 3 bar; excluded → reported with counts, no bar).
- Survival/wave numbers BYTE-IDENTICAL on the same 8 seeds (days,
  endReason, maxWave, standing, scaleRank, endPantryKcal, full deaths
  arrays) — narration-only proof, or the fix is rejected.
- Distinct-event preservation: different attacker / target / verb /
  fight still voice — proven by the unit test (RED before, GREEN
  after) AND the after-leg distinct-combat-line count drops by no
  more than the collapsed repeats account for.
- Proof test `scripts/test-combatdedup-b.js`: distinct events voice;
  repeated identical lines collapse; RED before the fix, GREEN after.

## Scale-wall numbers (reported every run)

national / table / wins, wave 4–5 unlocks, median survival — read off
the same 8-seed legs (baseline + after) and reported in the evidence
file.
