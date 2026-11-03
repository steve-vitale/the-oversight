# gap-audit11 — audit leftovers (Nov 1 loot/abilities audit, items #1, #2, #7)

Branch: `gap-audit11` (base `a63ffc8c9`). Worktree: `~/workspace/worktrees/gap-audit11`.
One commit per leg. No gate/threshold retunes anywhere (gating freeze honored).
No live verification by this arm — the coordinator merges and verifies.

## COORDINATOR CLOSEOUT — READ FIRST (EPERM flap blocked the last commits)

Branch tip at handoff: `47a2bf408` (leg 2 only). Legs 1 and 7 are BUILT,
FIXTURE-PROVEN, and sitting UNCOMMITTED in the worktree (see `git status`
below) because safe-commit failed 38 consecutive times on the flap
(`/tmp/idx-safecommit-*.lock` EPERM; shell/node direct writes to /tmp AND
to the worktree also fail right now — only the file tools still write).
Do NOT lose the worktree; do NOT release it. When the flap passes, land
in this order (each step: safe-commit, then `git status --short` FIRST,
then the index-clobber repair if it appears):

1. LEG 1 commit (files hold ONLY leg 1 right now — verified: competent.js
   diff is 65 added lines, no leg-7 hunk):
   `bash scripts/safe-commit.sh "[needs-eyes] gap-audit11 leg1: competent policy presses combat buttons when sensible" -- scripts/policies/competent.js scripts/test-gap-audit11-policy.js`
2. Re-apply the leg-7 policy hunk (it was reverted to keep step 1 clean):
   in `scripts/policies/competent.js`, in `gearUp`'s `weapons()` `add`,
   replace
     `if (!def || def.class !== 'weapon' || (it.units == null ? 1 : it.units) <= 0) return;`
   with
     `// WEAPON PROFILE, NOT CLASS LABEL (gap audit 2026-11-02, leg 7):`
     `// same widening as equipment.js equipScore — a tool-class machete`
     `// carrying a weapon profile counts as a weapon here too.`
     `if (!def || !def.weapon || (it.units == null ? 1 : it.units) <= 0) return;`
   then re-run `node scripts/test-gap-audit11-loot.js` (must be ALL PASS;
   see leg 7 section — the scholar assertions fail without this hunk).
3. LEG 7 commit:
   `bash scripts/safe-commit.sh "[needs-eyes] gap-audit11 leg7: trailblazer machete earns its weapon profile; equip paths accept weapon profiles" -- scripts/policies/competent.js src/data/items.json src/js/equipment.js scripts/test-gap-audit11-loot.js`
4. Evidence commit (report + diag tool + panel JSONs):
   `bash scripts/safe-commit.sh "gap-audit11 evidence: legs 1+2 panel before/after, leg 7 fixture notes" -- evidence/2026-11-02/gap-audit11-report.md evidence/2026-11-02/gap-audit11-diag/seed-31001.json evidence/2026-11-02/gap-audit11-diag/seed-31002.json evidence/2026-11-02/gap-audit11-diag-after/seed-31001.json evidence/2026-11-02/gap-audit11-diag-after/seed-31002.json scripts/test-gap-audit11-diag.js`
   (Delete the 0-byte `evidence/2026-11-02/gap-audit11-diag-after/seed-3100*.json`
   confusion first if needed: the AFTER jsons now hold real content, written
   via the file tools — verify with `python3 -c "import json; json.load(...)"`
   before committing; the 0-byte files were overwritten, not appended.)
5. Retry the heartbeat (`bash scripts/worktree-heartbeat.sh gap-audit11`
   from the repo dir) — it also failed on the flap, so the registry may
   look stale; verify the registration before merging.
6. Negative control owed for leg 7 (same pattern as leg 2): temporarily
   restore the old class-gated filters, run the loot fixture expecting
   FAIL on the scholar assertions, restore via the file tool, re-run
   expecting ALL PASS. The partial run in this session already showed
   the discrimination (scholar FAIL / villager PASS with the policy
   hunk reverted), but the full old-vs-new control was not run because
   the leg-1 commit had to go first.

Worktree state at handoff (`git status --short`):
 M scripts/policies/competent.js (leg 1 only)
 M src/data/items.json (leg 7)
 M src/js/equipment.js (leg 7)
 ?? evidence/2026-11-02/gap-audit11-diag-after/ (after-panel JSONs, real content)
 ?? evidence/2026-11-02/gap-audit11-diag/ (baseline JSONs)
 ?? evidence/2026-11-02/gap-audit11-report.md (this file)
 ?? scripts/test-gap-audit11-diag.js
 ?? scripts/test-gap-audit11-loot.js
 ?? scripts/test-gap-audit11-policy.js

## Leg 2 — synergy discovery in competent play (audit #2) — LANDED

Commit: `47a2bf408` (`[needs-eyes] gap-audit11 leg2: trigger-side resonance
for sequential synergies with passive second leg`).

Diagnosis (measured on seeds 31001/31002, 120 days, base `a63ffc8c9`;
baselines in `evidence/2026-11-02/gap-audit11-diag/seed-3100{1,2}.json`):
co-holding happened (15/57 synergies co-held at some observation on 31001),
but discovery attempts stalled at 0 because the TRIGGER leg's use never
happens in competent play. The sequential rule only counted a use of the
second leg in `discovery_method.order` after the first leg earlier the same
day, and the existing passive-resonance rule only covered a passive FIRST
leg. When the SECOND leg is passive (no button, no engine logging path —
e.g. `steady_hands`), the trigger use can never happen. Twin-pair proof:
`field_pharmacy` (order `[herbal_remedy, field_medicine]`) discovered, while
`fevers_end` (same legs, reversed order) stayed at 0 attempts, because the
policy's heal path picks one treatment ability and never produces a
field-then-herbal same-day sequence.

Fix (`src/js/game.js`, sequential branch of `checkSynergyDiscovery`, 10
lines): when the use is real (not synthetic) and equals the FIRST leg in
order, a held passive second leg counts as the combined use — a passive leg
held is always brought to bear, so using the first step while holding it IS
the combined use. Still 3 combined uses to unlock; no power or threshold
change. Synthetic events excluded so one real moment can't double-count.
`same_target` left untouched (zero such synergies exist in data);
`simultaneous`/`sustained` already handled passive resonance symmetrically.

Proof: `node scripts/test-gap-audit11-synergy.js` — ALL PASS (5/5):
steady_hands has no actions; unrelated uses leave surgeons_calm at 0;
two triage uses = 2 attempts, not discovered; third triage use discovers
surgeons_calm; everybodys_friend still stalls with no logged leg use.
Negative control (branch temporarily disabled via the file tool only):
fixture FAILED as expected (attempts 0, nothing discovered), then the
branch was restored and the fixture passed again.

Residual, held not forced: pairs with NO logged use on either leg (e.g.
`everybodys_friend`: silver_tongue + gossip_network, neither logged
anywhere) can never progress under any resonance rule. Fixing those needs
per-ability logging paths — a separate arm, not this one-leg fix.

Plain words: villagers and players who already hold both halves of a
teamwork trick will now actually discover it by using the half they can
use, instead of the trick staying locked forever because the other half
has no button to press.

## Leg 1 — competent policy presses combat buttons (audit #1) — BUILT, FIXTURE-GREEN, COMMIT BLOCKED BY FLAP

Commit: NOT YET COMMITTED — see COORDINATOR CLOSEOUT above. The work is
complete in the worktree; only the safe-commit step is blocked.

Diagnosis: `scripts/policies/competent.js` `fight()` never called
`Game.useAbility`. Garden abilities reached the audit count via
`cultivateGarden`, not button presses. Of 44 combat actions in data, 30
are scholar-side pressable and 14 have no scholar-side implementation
(`useAbility` refuses them before payment — listed below as follow-up
wiring gap, NOT pressed by this arm): aegis_link.link, raise_earth.raise,
gravity_well.pull, landslide.quake, pack_hunt.sic, mending_hands.mend,
blink.blink, switcheroo.swap, foresight.foresee, live_broadcast.go_live,
the_crowd_moves.command, stoke.stoke, coin_guard.coins, bribe.pay_off.
(The audit spec's stoke/blink/field_medicine/mending/live-broadcast lines
are therefore not `useAbility`-pressable; blink still triggers
automatically via cheat-death.)

Fix (`scripts/policies/competent.js`, helper `abilityPressPlay` + one call
in `fight()` after the DPS-race block, before beast-trick play): per-turn
cascade, at most one turn-costing press per turn, only for held actions
passing `_actionAvailable` with 200 kcal kept back for dinner:
turncoat.persuade with 2+ live monsters; war_cry.bellow when losing
(<50% HP); bird_strike.call once per fight on non-trivial fights only
(total live-monster max HP >= 40, or 2+ monsters, or losing — never 60
kcal of birds on a lone hummice); when losing, first available of
pocket_sand.throw_sand, freeze_tag.tag, fear_aura.loom; rage.unleash_rage
when winning and non-trivial. Turn accounting reads engine state
(`tbFighter('p').acted`), not the press return value, so a fizzled press
(which still spent the turn) is never followed by a strike, and a refused
press (nothing spent) falls through to tricks/strikes. After a press the
policy ends the turn ONLY if it is still the player's turn (no
double-advance). The turn-1 walk-away (outmatched fights) still outranks
presses; losing presses fire once a fight is committed. No ability
numbers moved; no new system.

Proof: `node scripts/test-gap-audit11-policy.js` — ALL PASS (9/9):
bird on entry vs bulldozer; rage when healthy; war_cry first when losing
at 40% HP in a committed fight; pocket_sand when losing with pocket only;
no press vs lone glasswing (trivial); no press at 250 kcal (dinner
reserve: 250-60 < 200); turncoat first vs two monsters; full drive: bird
exactly once per fight, fight progressed/resolved, no stall. (A lone
hummice spawns as a 4-choir, i.e. multi-monster and non-trivial by
design — the fixture uses glasswing for the trivial case. A bulldozer
drive can honestly kill the scholar; death counts as resolved, not as
failure.)

Panel before/after (identical seeds, 120 days, diag script):
- BEFORE (base, legs 1+2 absent): seed 31001: green_thumb 27,
  green_whisper 32, discovered field_pharmacy only, survived 121 days;
  seed 31002: green_thumb 7, green_whisper 46, discovered none,
  village-lost day 74. (Baseline JSONs in
  `evidence/2026-11-02/gap-audit11-diag/`.)
- AFTER (legs 1+2 in): seed 31001: green_thumb 13, green_whisper 67,
  pocket_sand 2, rage 15 — combat buttons pressed where the baseline had
  zero combat presses — but the village was lost day 108 (baseline
  survived 121), so field_pharmacy sat at 2/3 attempts undiscovered when
  the run ended; seed 31002: green_thumb 6, green_whisper 44, rage 7,
  discovered none, village-lost day 74 — the same fate as baseline, the
  same co-holds (surgeons_calm 171/0, everybodys_friend 51/0, farsight
  195/0, tells/string_wall/airtight 68/0), plus 7 rage presses.
  (After JSONs in `evidence/2026-11-02/gap-audit11-diag-after/`.)
- Honest reading: the panel PROVES leg 1 (combat presses appear on both
  seeds; 31002's trajectory is otherwise unchanged). For leg 2 it is
  INCONCLUSIVE in the wild, and the report says so rather than claiming
  a win: the leg-2 mechanism is proven by the fixture, but in these runs
  the first-leg uses it needs never happened (no triage uses at all in
  either run — surgeons_calm co-held 171–240 observations with 0
  attempts before and after), one run died before field_pharmacy's third
  attempt, and the diag's attempts/discovered figures read the CURRENT
  scholar only, so scholar turnover alone moves them. Assembly in the
  wild still needs the first leg to actually be used; the fix removes
  the structural block, it does not conjure uses. The after-panel was
  recovered through a stdout variant of the diag script (identical
  computation, file sink replaced) because the EPERM flap blocked the
  script's own file write; the variant lives only in /tmp and is not
  committed.

Plain words: the computer player now actually uses the fight buttons it
already owns — calling in birds, rallying cries, and sand in the eyes —
when the situation calls for it and dinner is still covered, instead of
only ever pressing garden buttons.

## Leg 7 — scholar loot-use loop (audit #7) — BUILT, FIXTURE PARTIAL (policy hunk held for leg-1 commit; see CLOSEOUT)

Diagnosis (from prior session, re-verified at build time):
`trailblazer_machete` (items.json): class `tool`, slot `melee`, prose
"+20 melee damage", but NO `weapon` object — so villager `autoEquip`
(`equipment.js` `equipScore` requires class `weapon` + `weapon` object)
and policy `gearUp` (weapons filter requires class `weapon`) never pick
it, and `equippedWeapon().bonus` reads 0 even if manually equipped. The
"+20" prose is a lie in code terms. `gravity_hook` is NOT a leak (its
`carryBonus` works from inventory). `truthbrand` is the same defect
class with no damage number in prose — held residual, no invented bonus.

Fix (3 edits): data first — `weapon: {bonus: 20, type: 'melee', range: 1,
damageType: 'physical'}` on trailblazer_machete (exactly the prose
number, below the plain machete's 35 so preference ordering stays
honest); then candidacy widened in both places on the principle "an item
with a weapon profile is a weapon for equip purposes, whatever its class
label" (`equipScore` melee/ranged branch; `gearUp` weapons filter). Class
stays `tool`. Side effect, intended: `chefs_knife` (tool, weapon bonus 8)
is the only other non-weapon-class weapon profile in data (217 items
checked) and becomes a last-resort melee pick — a knife in hand beats
bare hands, and it still loses to every real weapon. `isRangedWeapon`
needs no change (range 1, no bow/sling in the name → melee either way).

Proof: `node scripts/test-gap-audit11-loot.js` — PARTIAL at draft time:
data premise PASS; villager autoEquip PASS (trailblazer to melee);
scholar gearUp FAIL only because the policy hunk was temporarily
reverted to keep the leg-1 commit clean (see Incidents) — the full
fixture must be re-run after the leg-1 commit lands and the hunk is
re-applied, including the first-strike reveal assertions (equipped
instance starts `alienEffectHidden: true` as granted loot; one strike
clears it via `alienLootReveal`, which the strike path already calls).
Before state, observed in that same partial run: with the policy filter
still class-gated, gearUp equipped nothing and `equippedWeapon().bonus`
read 0 while the scholar struck unarmed (83 -> 74 HP on a bulldozer).

Panel re-check (planned): after the leg-7 commit, confirm trailblazer
equips when best-owned in panel runs.

## Incidents

- EPERM flap (2026-11-03, ~04:00–05:00+): truncated `src/js/game.js` to 0
  bytes in the prior session; restored from the hash-verified pristine
  sibling copy (`gap-counterbtn`, hash
  `98f9daf6bc49eb4ba0e5810a9a78c2ba9b095bcb`, size 2766167) via a retry
  loop, verified by hash + `node --check`. NOTE: `gap-encounter`'s copy
  is NOT pristine (it carries its own 99-insertion edit as of 04:25) —
  do not use it as a restore source. The flap later hit safe-commit's
  `/tmp` private index: 38 consecutive failures across three retry loops
  plus a fresh probe (no partial commit ever — safe-commit fails atomic;
  worktree index verified clean after each failure). Leg-1 and leg-7
  commits are therefore BLOCKED, not abandoned — see COORDINATOR CLOSEOUT.
  No ref surgery was performed on any tree.
- COMMIT ORDERING HAZARD (2026-11-03, this session): leg 7's policy hunk
  landed in the worktree while the leg-1 commit retry loop was still
  running — a successful retry would have swept the leg-7 hunk into the
  leg-1 commit. The loop was killed before that happened (HEAD verified
  still `47a2bf408`), the leg-7 policy hunk was reverted via the file
  tool, and the leg-1 diff was re-verified as leg-1-only (65 added
  lines, fixture green) before restarting the commit loop. Rule: never
  run a commit retry loop while other legs' edits sit in the same files.
- PANEL WRITES (2026-11-03, this session): both after-panel diag runs
  finished their 120-day sims in ~10s but failed on the final JSON write
  (EPERM at `test-gap-audit11-diag.js:119`, 0-byte files left behind);
  a retry loop is re-running them. File-tool writes (edit/write) kept
  working through the same window — the flap bites shell/node direct
  writes, not the file tools.
- HEARTBEAT (2026-11-03): one heartbeat attempt failed with EPERM on the
  registry write; retry pending. If the registry goes stale, the tree
  risks reaping — the coordinator should verify the registration before
  merging.
