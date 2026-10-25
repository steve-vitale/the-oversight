# sim-expedid-b — thread monsterId through the expedDeath path (backlog #1047)

Run: fleshout-loop-b-20261025T2030Z (Sun 2026-10-25, loop B, second axis).
Worker tree: ~/workspace/worktrees/sim-expedid-b. Axis: food-economy (measurement
plumbing, not a balance sweep — no lever, no balance numbers move).

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave law) for the
monster context. No canon doc covers the death ledger or the fallen roll —
those are engine instruments, not Steve designs — and nothing here invents
canon to fill that gap. The N=2 rule and the Big Beast HOLD disposition come
from evidence/2026-10-25/sim-n2beast-b.md (this run changes neither).

Context (read before touching code): evidence/2026-10-25/sim-n2beast-b.md and
backlog item #1047 (`hidden_files/sim-findings.md` line 1047): "The Big
Beast" is a generated village-name alias (2 rows: s73747 day 77, s73796 day
106), both genuine expedition deaths via expedDeath — and expedDeath passes
killerId null, so the alias cannot be tied to a roster species. The
hurtVillager path already threads monsterId into fallen entries.

## PRE-REGISTRATION (written BEFORE implementing; judged only against this)

Scope, fixed:
- Thread monsterId from the expedition-death killer into the fallen entry,
  mirroring the hurtVillager path exactly. No other behavior change.
- Do NOT change the N=2 rule, do NOT reclassify Big Beast (it stays HOLD
  under the rule until threaded data exists), do NOT edit the monster
  roster, do NOT change displayed names — monsterId is plumbing, the alias
  still displays as before.

What the code actually shows (read before implementing, not assumed):
- The only expedDeath call site is src/js/villager-agency.js:461, inside
  expeditionMonster's vDie branch, where the killer monster object `m` is
  in scope (m.id is already used there for recordWaveKill and fought).
- expedDeath (villager-agency.js:488) calls registerDeath with killerId
  null and no monsterId, and pushes NO fallen entry at all — removeVillager
  pushes none either, and the npc-triggers 'death' row only does gossip +
  moment + grief voice. So "mirror the hurtVillager path" means two
  threadings, both mirroring game.js hurtVillager (game.js:7812+):
  (1) registerDeath gains monsterId (corpse + tele wave, as hurtVillager's
  registerDeath call does), and (2) expedDeath gains the fallen push
  hurtVillager has (villagerId, day, cause, name via fallenName,
  monsterId, monsterName) — the push itself is new to this path because
  the path never had one. The cause stays mName, the display name, exactly
  as before; only the plumbing fields are added.
- The hurtVillager fallen push shape is the template, copied field for
  field: `{ villagerId, day, cause, name: fallenName(vid), monsterId,
  monsterName }`. For expedDeath, monsterName is mName (the display name
  the hurtVillager call sites likewise pass as monsterName).
- Signature: expedDeath(vid, mName, nm, playerAtHaven, monsterId) — the
  5th arg is optional; an absent arg lands null, so the one existing call
  site and any wrapper (scripts/fieldfightsrc-20261016.js wraps expedDeath
  with a 4-arg signature but forwards `arguments`) keep working.
- No other expedDeath call site exists in src/ (grep-verified).

PRIMARY metric (the GO bar):
- On a synthetic expedition death with a known killer, the fallen entry
  carries monsterId non-null and equal to that killer's roster id.
- Before/after = the IDENTICAL synthetic scenario: before the fix, the
  same call yields no monsterId-carrying fallen entry (null/absent);
  after the fix, it yields monsterId equal to the killer's roster id.
- Synthetic scenario, fixed: loadGame via scripts/sim-harness.js (seed
  42), setupGame, pick a non-player roster villager, set a minimal
  expedition entry, call Game.expedDeath(vid, 'The Big Beast',
  displayName, false, 'gallowdeer'). Killer 'gallowdeer' is a roster id
  (Highbeam Deer); 'The Big Beast' is the generated-alias display name
  from the n2beast corpus, chosen deliberately so the test proves the
  alias-vs-species split: display stays the alias, plumbing carries the
  species. If no expedition death can be produced synthetically, this run
  stops loudly and claims nothing from a code read alone.

GO threshold (judged only against this):
- PRIMARY passes AND death-related existing tests stay green.
- Secondary checks (reported, not GO-gating): corpse carries the same
  monsterId; tele 'death' wave matches the killer's roster wave; cause
  still displays as the alias; old-signature call (no 5th arg) still
  works and lands monsterId null; no other file's behavior changes.

Method: scripts/test-expedid-b.js proves the change (before/after on the
identical synthetic scenario — run once BEFORE the fix, once AFTER).
Node harness via scripts/sim-harness.js (the shared kit, not copied eval
boilerplate): full src/js list in index.html order, minus DOM-only files;
Math.random seeded before eval by loadGame. Never stub Game.save. No
concurrent jest; --cacheDirectory=/tmp/jest-cache-sim-expedid-b for any
jest invocation. Regression: the relevant existing death/fallen-entry
tests (see RESULTS).

## RESULTS

### The change (2 files touched, 1 game file)

- src/js/villager-agency.js — the only game-code change:
  - Call site (expeditionMonster vDie branch): `expedDeath(vid, mName, nm,
    playerAtHaven, m.id)` — the killer object `m` was already in scope.
  - expedDeath signature gains optional 5th arg `monsterId` (absent
    lands null; the one existing call site and the fieldfightsrc wrapper,
    which forwards `arguments`, keep working).
  - registerDeath call gains `monsterId: monsterId || null,
    monsterName: mName` (corpse + tele wave, exactly as hurtVillager's
    registerDeath call does).
  - NEW fallen push mirroring hurtVillager's push field for field:
    `{ villagerId, day, cause: mName, name: fallenName(vid),
    monsterId, monsterName: mName }`. This push is new to this path
    because the path never had one — see the finding below. Cause stays
    mName: displayed names do not change.
- scripts/test-expedid-b.js — the proof (below).
- This evidence file.

### Finding the pre-registration did not assume: the roll missed them entirely

The pre-registration assumed expedDeath produced a fallen entry with a
null monsterId. It does not: before the fix, a synthetic expedition death
produced NO fallen entry at all — no memorial-roll record, no corpse
monsterId, no tele wave. removeVillager pushes no fallen entry, and the
npc-triggers 'death' row only does gossip + moment + grief voice. So
"mirror the hurtVillager path" required adding the push, not just
filling a field. This is the same class as the wound-death gap fixed
2026-10-22 (journey-succession r34): a death path with corpse, gossip,
and grief but no dead mark. Expedition deaths were undercounted on the
memorial roll exactly the way wound deaths were.

Consequence, stated plainly for future census readers: from this commit
on, memorial-roll counts include expedition deaths (previously zero).
The deathrow/deathext pooled death counts are NOT affected — those
sweeps read the tele 'death' stream, not v.fallen. The tele 'death'
wave for expedition deaths moves from null to the killer's roster wave
(the same threading hurtVillager deaths already had); cause, kind, and
who are unchanged.

### Before/after on the identical synthetic scenario (PRIMARY)

Scenario (fixed, seed 42): loadGame + setupGame, non-player villager
gen_t5uw0jl, minimal expedition entry, `expedDeath(vid, 'The Big Beast',
displayName, false, 'gallowdeer')`.

BEFORE the fix — `node scripts/test-expedid-b.js` — 9 FAIL:
- no fallen entry for the victim; corpse monsterId null; tele wave null
  (killer wave 1); tele cause 'The Big Beast' and roster removal already
  correct. The gap was proven empirically, not from a code read alone —
  the synthetic expedition death was producible, and it carried nothing.
- Old-signature leg likewise produced no fallen entry.

AFTER the fix — same script, same scenario — 14/14 PASS:
- PRIMARY: fallen entry
  `{"villagerId":"gen_t5uw0jl","day":1,"cause":"The Big Beast",
  "name":"the person in their 40s","monsterId":"gallowdeer",
  "monsterName":"The Big Beast"}` — monsterId non-null and equal to the
  killer's roster id. GO threshold met on the primary.
- Secondary, all pass: corpse monsterId 'gallowdeer'; tele 'death' wave
  1 = gallowdeer's roster wave; cause still displays 'The Big Beast';
  old-signature call works and lands monsterId null; victim leaves the
  roster as before.
- Sense-check on the fallen name: "the person in their 40s" is the
  knowledge-gated descriptor (fallenName), not the true name — the
  synthetic villager was unknown to the village, so the roll correctly
  does NOT leak the true name. The plumbing (monsterId) is exact while
  the displayed name stays gated. That is the alias-vs-species split
  working as designed: the village knows it lost someone to "The Big
  Beast" and now the record knows the beast was a gallowdeer.

### What this does NOT do (scope guardrails, verified)

- N=2 rule untouched; Big Beast stays HOLD (this run adds threading, not
  threaded data — no expedition death in any existing corpus carries a
  monsterId yet, so no reclassification is authorized by this commit).
- Monster roster untouched; no displayed name changed anywhere.
- No other expedDeath call site exists (grep-verified in src/); the only
  wrapper (scripts/fieldfightsrc-20261016.js) forwards `arguments`.
- No balance lever, no sim numbers move: this is measurement plumbing.

### Regression (death/fallen-entry tests, all green)

- scripts/test-fallen-memorial-20261022.js — ALL GREEN.
- scripts/test-wound-death-fallen-20261022.js — all legs OK (wound +
  thirst fallen entries intact).
- scripts/test-double-death-guard-20261011.js — 8 passed, 0 failed.
- node scripts/check.js --quick — NOT COMPLETED: my invocation produced
  no output in ~9.5 min and was stopped; the task's regression bar is the
  death/fallen-entry tests (all green above), and a sibling run's
  check.js was active in another worktree at the time, so no re-run was
  attempted here (never stack concurrent suite runs). Reported honestly,
  not claimed.

### SENSE-TESTING — villagers acting like people

The change touches nothing visible: no dialogue, gossip, grief, or
display text changes. The one visible-adjacent artifact, the fallen
entry's name, was checked above and stays knowledge-gated ("the person
in their 40s", not a leaked true name). The trigger reactions (gossip +
moment + grief voice) run unchanged — the synthetic death still fired
them through the untouched npcTrigger call. Nothing robotic, static, or
repeated was introduced; the memorial roll now simply stops forgetting
expedition deaths.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- No metric was re-scored: the pre-registered PRIMARY (fallen monsterId
  === killer roster id) is the metric judged, and it passed after the
  fix after failing before it on the identical scenario. No friendlier
  metric was substituted mid-run.
- One pre-registration correction, recorded not hidden: the header said
  "before (null)" for the fallen entry; the before run showed the entry
  itself was absent, not null-carrying. The PRIMARY still judged the
  same property (a fallen entry carrying the killer's monsterId), and
  the correction strengthens rather than weakens the verdict — the gap
  was bigger than assumed.
- No balanced-panel compare .md is attached: this is a plumbing fix
  with a before/after proof test, not a balance lever with a before/after
  panel comparison — same standing precedent as instrument-only arms.
  The proof test is the comparison of record.
- Method note for the NEXT run: existing corpora (deathrow-b, deathext-b)
  predate this threading, so their expedition-death rows still carry no
  monsterId. A future arm that wants threaded Big Beast data must run
  fresh sims on a build containing this commit — re-analyzing the old
  corpora cannot produce monsterIds that were never recorded.

## PROOF

- `node --check` clean on scripts/test-expedid-b.js and on the edited
  src/js/villager-agency.js.
- BEFORE: `node scripts/test-expedid-b.js` — 9 FAIL (no fallen entry,
  corpse monsterId null, tele wave null). AFTER: 14 PASS, 0 FAIL.
- Regression: test-fallen-memorial-20261022.js ALL GREEN;
  test-wound-death-fallen-20261022.js all legs OK;
  test-double-death-guard-20261011.js 8 passed, 0 failed.
- node scripts/check.js --quick: NOT completed (my invocation produced no
  output in ~9.5 min and was stopped; a sibling run's check.js was active
  in another worktree, so no re-run was stacked). The task's regression
  bar — the death/fallen-entry tests — is green (above).
- No push, no version bump, no live verification (coordinator merges
  to local master; ship loop owns deploys).
- No sibling axis, tree, branch, claim, or file touched. Worktree
  changes are exactly: src/js/villager-agency.js,
  scripts/test-expedid-b.js, evidence/2026-10-25/sim-expedid-b.md.

## VILLAGE ASSESSMENT (plain words)

Nothing about village life changes for the player — and that is the
point. A villager who dies on expedition still gets the same grief at
the fire, the same gossip, the same moment in the book, and the same
name on the loss: "The Big Beast," whatever the village called it.
What changes is only what the village's own record remembers: the
memorial roll no longer forgets expedition deaths entirely, and it now
remembers which beast did it, in the beast's true roster name, while
the displayed name stays the village's own plain words. The next time
two villages both lose someone to "The Big Beast," the record will be
able to say whether it was the same beast twice or two different
beasts with the same plain name — which is the difference between a
mystery and a false certainty. The blank filled here is a record-keeping
one: the village's dead are now all on the roll, with their killers
named in the ledger even when the village itself only ever knew the
alias.

