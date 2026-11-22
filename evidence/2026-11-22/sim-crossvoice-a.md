# sim-crossvoice-a — Crossbow/sling volleys read as their own weapons, not bows

- Arm: sim-crossvoice-a (NARRATION FIX), Loop A run fleshout-20261122T0815Z, arm 1 of 1.
- Base: worktree HEAD `e67224635` (Loop A 0215Z adoption round record);
  local master moved three times during this arm — rebased onto
  `4681e740f`, then `efd5f4273`, then `96f638c8a` (see §7).
  Branch `sim-crossvoice-a`.
- Prereg: `evidence/2026-11-22/sim-crossvoice-a-prereg.md` (committed
  `79ceb43eb`, frozen ~09:10 UTC 2026-11-22, before any judged run).
- Instrument commit: `79ceb43eb` (prereg +
  `scripts/crossvoice-fixture-a.js` + `scripts/test-crossvoice-a.js`).
- Fix commit: `0168ec2cf` ("sim-crossvoice-a: crossbow/sling volleys
  read as their own weapons, not bows [needs-eyes]").
- No live-game code change beyond narration: shots, hit chance, damage,
  ammo spend, and the CELLGATE hold are untouched. Default ON, no env
  gate — an env gate would ship the crossbow still "nocking arrows" by
  default, defeating the fix. If a reviewer path treats narration as
  balance, the answer is that no number moved (see §1 table: judged
  mechanics identical to the pre-fix RED run).
- Horizon (fixture): staged single fights, seed 7. Seeds: none (no band —
  this arm judges transcript assertions on the staged fixture).

## Verdict: GO — the crossbow reads as a crossbow, the sling as a sling; the bow lines survive untouched

All six frozen bars pass on the judged run (exit 0). The crossbow
volley reads: "sees the sky coming and cranks a bolt into place — the
fight opens at range (3 shots)", three times "loosed — the bolt takes
the sky for 21/21/18", "lowers the Crossbow — the sky is on them now.
(3/3 hit)". The sling volley reads: "whirls the Sling — the fight
opens at range (2 shots)", twice "loosed — the stone takes the sky for
11", "lowers the Sling — the sky is on them now. (2/2 hit)". The
phase sling reads the same way with its own name ("whirls the Phase
sling", "lowers the Phase sling", stones for 25 each). Dry legs read
their own mechanism honestly: "has Crossbow but no crossbow bolts —
the crank clicks on nothing", "has Sling but no stones — the pouch
hangs empty". Zero bow language and zero gun language anywhere in any
crossbow/sling/phase_sling transcript. The bow control still says
"nocks an arrow" / "lowers the bow" byte-identical, the killloot
fixture still passes (`--compare` GO), and the mechanics are
byte-identical to the pre-fix run — every leg's volley, outcome,
rounds and HP match the RED run exactly. The RED run before the fix
failed exactly S1/S2/S3 (bow lines present) while S4/S5/S6 passed,
proving the instrument detects the defect.

## Frozen-bar table (prereg §6)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| S1. Crossbow/sling voice (opening crank/whirl, every shot 'the bolt'/'the stone' + 'takes'/'(spent)', closing 'lowers the Crossbow/Sling/Phase sling', shot lines === volley.shots, a hit line OBSERVED per weapon, frozen miss strings verbatim in source) | all must hold | crossbow 3/3 hits observed, sling 2/2, phase_sling 2/2; all lines weapon-worded; both miss strings in source | ✅ |
| S2. No bow language AND no gun language in any crossbow/sling/phase_sling transcript (armed + dry) | must hold | 0 hits on 'nocks an arrow'/'the arrow'/'lowers the bow'/'string stays drawn' and on 'Searcaster'/'fires'/'cell spent'/'trigger' (whole-log scan, 6 transcripts) | ✅ |
| S3. Dry lines honest, weapon words ('no crossbow bolts' + 'the crank clicks on nothing'; 'no stones' + 'the pouch hangs empty'; bow 'no arrows' + 'string stays drawn'); volley.shots === 0; no 'string stays drawn' in crossbow/sling dry transcripts | all must hold | all four dry lines exact; 0 shots on every dry leg | ✅ |
| S4. Bow lines preserved, source-level AND in use (REVISED per searvoice §5: source presence alone insufficient) | all must hold | four bow strings verbatim in source; bow armed leg opens 'nocks an arrow', closes 'lowers the bow', shot lines byte-identical old bow lines; bow dry still 'string stays drawn' | ✅ |
| S5. Fixture still GO (`--compare` exit 0 on refreshed legs) | must hold | compare GO, notes empty, armArrowLine false | ✅ |
| S6. Determinism (armed reruns match primaries on judged fields AND volley-line slices, all four weapons) | both must hold | all four reruns identical | ✅ |

## 1. The fix (fieldFights.js volley block, :989–1090)

Two discriminators, following the block's own CELLGATE/searvoice
convention (`_isGun = (_rwId === 'searcaster')`):
`var _isCrossbow = (_rwId === 'crossbow');`
`var _isSling = (_rwId === 'sling' || _rwId === 'phase_sling');`
Five lines branch on them; every other weapon keeps its old string
byte-identical (bow = the else branch, so crude_bow, starfall_bow and
apex_bow keep the bow lines too, as bows should; the gun branch is
untouched):

| Line | Bow (unchanged, else branch) | Crossbow (`_isCrossbow`) | Sling (`_isSling`) | Gun (`_isGun`, unchanged) |
| --- | --- | --- | --- | --- |
| Dry | `has <name> but no <ammo> — the string stays drawn, useless.` | `has <name> but no <ammo> — the crank clicks on nothing.` | `has <name> but no <ammo> — the pouch hangs empty.` | `has <name> but no <ammo> — the trigger clicks on nothing.` |
| Opening | `sees <m> coming and nocks an arrow — the fight opens at range (<n> shot[s]).` | `sees <m> coming and cranks a bolt into place — the fight opens at range (<n> shot[s]).` | `sees <m> coming and whirls the <name> — the fight opens at range (<n> shot[s]).` | `sees <m> coming and raises the <name> — the fight opens at range (<n> shot[s]).` |
| Hit | `  loosed — it takes <m> for <d> (<hp> left).` | `  loosed — the bolt takes <m> for <d> (<hp> left).` | `  loosed — the stone takes <m> for <d> (<hp> left).` | `  the <name> fires — it takes <m> for <d> (<hp> left).` |
| Miss | `  loosed wide — the arrow buries itself in the dirt. (spent)` | `  loosed wide — the bolt buries itself in the dirt. (spent)` | `  loosed wide — the stone skips away into the dirt. (spent)` | `  fires wide — the discharge scorches the dirt beside <m>. (cell spent)` |
| Closing | `lowers the bow — <m> is on them now. (<h>/<n> hit)` | `lowers the <name> — <m> is on them now. (<h>/<n> hit)` | `lowers the <name> — <m> is on them now. (<h>/<n> hit)` | `lowers the <name> — <m> is on them now. (<h>/<n> hit)` |

`<name>` is `_rdef.name` ('Crossbow' / 'Sling' / 'Phase sling' in
practice; the dry line falls back to 'a crossbow' / 'a sling',
mirroring the old `(_rdef.name || 'a bow')`). "loosed" is kept for
crossbow/sling hits and misses: the crossbow's own flavor is "Crank,
lock, loose", and a sling looses its stone — what changes is the ammo
noun (bolt / stone, never arrow) and the mechanism words. The
CELLGATE hold line ("holds the Searcaster — … the cells are saved for
harder prey") is untouched. Mechanics proof — judged run vs pre-fix
RED run, identical seeds and substrate:

| Leg | RED (pre-fix) | Judged (post-fix) |
| --- | --- | --- |
| Crossbow armed volley | 3 shots, 3 hits, 60 dmg, 1 bolt left | 3 shots, 3 hits, 60 dmg, 1 bolt left |
| Sling armed volley | 2 shots, 2 hits, 22 dmg, 2 stones left | 2 shots, 2 hits, 22 dmg, 2 stones left |
| Phase sling armed volley | 2 shots, 2 hits, 50 dmg, 2 stones left | 2 shots, 2 hits, 50 dmg, 2 stones left |
| Bow armed volley | 2 shots, 2 hits, 36 dmg, 2 arrows left | 2 shots, 2 hits, 36 dmg, 2 arrows left |
| All dry legs | 0 shots | 0 shots |
| Outcomes / rounds | vFlee R8 (crossbow) / R7 / R7 / R7; dry vFlee R11 | identical, every leg |
| Killloot arm / ctl | 2 shots 0 hits vKill R11 / 0 shots vKill R11 | identical |

Only the log strings changed. The killlootfixture-a JSONs refreshed
by this arm differ from searvoice's only in `anchorCommit` (1 line
each).

## 2. Sense-test — the transcripts read aloud

Crossbow armed (verbatim, 48 log lines): "the man in his 40s, with a
long braid sees the sky coming and cranks a bolt into place — the
fight opens at range (3 shots)." Then three times: "loosed — the bolt
takes the sky for 21 (761 left)" / 21 (740) / 18 (722), and "lowers
the Crossbow — the sky is on them now. (3/3 hit)". It reads as a
person cranking and loosing three bolts, all three hitting. The rest
of the fight is unchanged from the probe: both allies charge in at
the door, the holder strikes ~19–22/round, the party flees at R8
("sees how this ends — and runs while running still works").

Sling armed (verbatim, 42 lines): "sees the sky coming and whirls
the Sling — the fight opens at range (2 shots)", twice "loosed — the
stone takes the sky for 11", "lowers the Sling — the sky is on them
now. (2/2 hit)". It reads as a person whirling a sling twice and
landing both stones. Phase sling (42 lines): identical shape with its
own name — "whirls the Phase sling", "the stone takes the sky for
25", "lowers the Phase sling". The fight that follows is the same
party fight, vFlee R7.

Bow armed (verbatim, 42 lines, the control): "nocks an arrow — the
fight opens at range (2 shots)", twice "loosed — it takes the sky
for 18", "lowers the bow — the sky is on them now. (2/2 hit)".
Byte-identical to the pre-fix bow lines — the fix did not touch them.

Dry legs (verbatim): "has Crossbow but no crossbow bolts — the crank
clicks on nothing." / "has Sling but no stones — the pouch hangs
empty." / "has Phase sling but no stones — the pouch hangs empty." /
"has Bow but no arrows — the string stays drawn, useless." Each
states its own constraint honestly, in its own mechanism's words,
and the fights that follow are the same vFlee R11 party fights as the
probe's dry legs.

Two notes, neither a defect in this fix:

1. **No miss line was observed in a transcript.** Every staged shot
   at seed 7 hit (crossbow 3/3, sling 2/2, phase_sling 2/2, bow 2/2),
   so the three new miss lines ("the bolt buries itself in the
   dirt", "the stone skips away into the dirt") are asserted by
   construction — S1 requires them verbatim in source — never read
   aloud from a fight. They share the branch and the template with
   the observed hit/closing lines, so the residual risk is a typo in
   an unobserved string, not a logic gap. This is the mirror image
   of searvoice's unobserved hit line; between the two arms, the
   hit line is now observed and the miss line is the remaining
   unobserved one. A future arm that forces a volley *miss*
   (lower-hit-chance staging, e.g. a longer-range weapon or a
   faster monster) should read the miss lines aloud.
2. **"The sky" is still the Herald.** The beast is called "the sky"
   throughout ("the bolt takes the sky", "The sky is wounded past
   its line"). Already judged not-a-bug by sim-killlootfixture-a §2:
   correct knowledge-gating (the herald's `unknown` descriptor is
   "the sky, with a face in it", truncated at the comma). The new
   lines inherit the phrase honestly.

## 3. Wall numbers

Fixture, not a band — no wall numbers (no wins/national/table to count
from staged fights). No band run.

## 4. Instrument notes and deviations

- **Pre-flight (NOT judged):** proof test 12/12, analyzer selftest
  17/17, re-run on the base before any judged run and again post-fix.
  Green both times.
- **RED run (NOT judged, proves the instrument):** `node
  scripts/test-crossvoice-a.js` before the fix — NO-GO, S1/S2/S3
  fail with the bow lines quoted verbatim, S4/S5/S6 pass, exit 1.
  The judged run after the fix passes all six, exit 0. Mechanics
  identical between the two runs (§1 table).
- **Instrument commit delayed by the write flap (deviation from
  the prereg §7 order, recorded honestly):** the prereg froze
  ~09:10 UTC and the instrument commit was attempted immediately,
  but the host write flap was refusing git writes (loose-object and
  index-lock writes: `fatal: unable to write loose object file:
  Operation not permitted`, `fatal: sha1 file '...lock' write
  error: Operation not permitted`) from ~08:44 to ~09:39 UTC.
  safe-commit.sh refused three times with its mass-deletion guard
  (294,214 "deleted" lines in src/) — a FALSE POSITIVE, not a stale
  tree: the flap left the private temp index empty (verified:
  manual `git read-tree` exited 128 with the same lock error,
  `git ls-files` 0 entries, guard number identical every time).
  No `--force-delete` was used. The RED run was executed while the
  instrument commit was still unlanded (prereg already frozen on
  disk and unmodified since) because the RED run needs no git
  writes; the instrument commit (`79ceb43eb`) landed as soon as git
  writes cleared at ~09:39, before the fix commit (`0168ec2cf`).
  The ordering deviation changes nothing judged: the prereg text,
  the fixture, and the judge are byte-identical to their frozen
  state, and the judged run ran after both commits.
- **RED runs killed twice by the flap before the clean RED:**
  the first two full-judge RED attempts were abandoned mid-run
  (one killed by the operator after the first leg burned its full
  120 s writeRobust retry window into `@@FALLBACK`; the second
  ended by SIGTERM at ~155 s with 2 legs done). Root cause: the
  flap was refusing NEW-file writes while existing-file writes
  went through — the armed JSONs did not exist yet, so each leg
  burned 120 s in the tmp+rename path. Response, per the
  local_write_flap_response skill: the 8 missing armed/rerun JSONs
  were pre-created as empty placeholders (one `: >` each, all
  succeeding), which put the fixture's writeRobust on its
  existing-file direct-write path; the following RED run landed
  all 16 legs in ~102 s with zero `@@FALLBACK`s. The instrument
  and the bars are unchanged — only the pre-existing state of the
  output directory differs, exactly as the dry and killlootfixture
  JSONs already existed from prior runs. One side effect, noted
  honestly: the pre-create truncated the probe's
  `crossvoice-a-phase_sling-armed.json` (4,451 bytes, landed at
  09:02) to 0 bytes; it was rebuilt deterministically by the RED
  run itself (same seed, same code, identical volley 2/2/50), per
  the skill's "rebuild a generated file from its deterministic
  source" rule.
- **Index-clobber on BOTH commits (known class, AGENTS.md
  2026-10-22):** after safe-commit.sh created `79ceb43eb`, the
  main index showed the three newly-added files staged-as-deleted
  (worktree files untracked, byte-identical to HEAD). After the fix
  commit `0168ec2cf`, the index showed fieldFights.js as `MM`
  (staged + unstaged). Both repaired with the `git ls-tree -r HEAD
  -- <paths> | git update-index --add --index-info` pipe; verified
  empty status + empty diff HEAD + hash-object == HEAD blob per
  file. Both commits were always correct (`79ceb43eb`: 755
  insertions, 3 files; `0168ec2cf`: 31 insertions, 4 deletions,
  fieldFights.js only).
- **Heartbeat:** `scripts/worktree-heartbeat.sh sim-crossvoice-a`
  failed twice with the flap (`PermissionError` writing
  REGISTRY.json) and landed at ~09:33 UTC once the flap cleared
  for that file. The tree was dirty (uncommitted instrument)
  throughout, so the reaper would not have touched it.
- **check.js --quick: GREEN.** `node scripts/check.js --quick
  --cacheDirectory=/tmp/jest-cache-sim-crossvoice-a` → exit 0
  (344 scripts), completed at ~280 s wall under heavy sibling
  load. No red.
- **Green-list scan (substitute-coverage check, done pre-fix):**
  no test pins the old bow lines for a crossbow/sling holder. The
  two green-list fieldfight tests do not reference them;
  test-blitz-combatstats.js asserts bow lines for a BOW fighter
  (still true); test-w4dpr2-fixtures.js stages Mara with a bow;
  test-spikecontact-20261031.js, test-volleyfix-20261031.js and
  analyze-dmgshape-b.js mention the lines only inside static
  fixture strings / a recorded corpus (never a live assertion);
  rollwall-driver-a.js only counts matching lines. One stale
  literal, noted not fixed: spikecontact's fixture log says
  "Joaquín has Crossbow but no arrows — the string stays drawn,
  useless." — a frozen analyzer-fixture string that asserts
  flight classification, not narration; it now reads oddly against
  the new engine line ("no crossbow bolts — the crank clicks on
  nothing") but the test does not run the engine and does not
  break. A future cleanup may update the literal; not this arm's
  scope.

## 5. Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged run** (prereg, committed
  `79ceb43eb`): all six pass on the judged run; no bar was
  re-scored. The RED run is documented in §4, not judged. The
  instrument commit landed after the RED run (flap, §4) but the
  prereg file itself was frozen before the RED run and is
  byte-identical to its frozen state.
- **The revised S4 bar did its job.** Searvoice's §5 warned that
  "strings exist in source" alone would no longer be sufficient
  once another weapon branched off — this arm's S4 asserts source
  presence AND live use by a bow leg, and it passes on both halves:
  the bow strings are in source and the bow leg still speaks them
  while crossbow/sling do not. The revision is now the standing
  form for narration arms: any future branch must keep the
  source-plus-use check.
- **Hit lines observed this time; miss lines are the new thin
  direction.** Unlike searvoice (hit line unobserved), seed 7
  observes crossbow, sling and phase_sling hit lines (3/2/2 hits)
  — no seed sweep was needed. The miss lines are asserted by
  construction only (S1 source check). See §2 note 1: a future
  miss-forcing arm should read them aloud. The bar was not
  weakened: S1 still requires the frozen miss strings verbatim in
  source.
- **No canon doc covers volley narration** — said in the prereg
  rather than inventing canon. The new lines ground only in the
  weapon data (crossbow flavor "Crank, lock, loose"; sling flavor
  "Two cords and a pouch").

## 6. Findings (for the coordinator to append to sim-findings.md)

- [fixed] 2026-11-22 — narration — Crossbow/sling volleys narrate
  as bow-and-arrow: the fieldFight volley block used bow language
  for every non-searcaster ranged weapon ("nocks an arrow",
  "loosed wide — the arrow buries itself in the dirt", "lowers the
  bow"; dry line "the string stays drawn" even for a sling with
  stones). FIXED by sim-crossvoice-a (Loop A run
  fleshout-20261122T0815Z, evidence/2026-11-22/sim-crossvoice-a.md,
  verdict GO, fix commit `0168ec2cf`): the volley block now
  branches on `_rwId === 'crossbow'` and `_rwId === 'sling' ||
  'phase_sling'` — crossbow lines read crank/bolt, sling lines
  whirl/stone, bow lines survive byte-identical for bows, gun
  lines survive byte-identical. This closes the searvoice §5/§6
  leftover (same defect class, different weapons).
- (leftover, not filed as a new finding — same class, narrower
  scope) The volley *miss* lines are asserted by construction
  only: no miss was observed at seed 7 (every staged shot hit).
  A miss-forcing arm should read them aloud. Also the
  spikecontact analyzer fixture still carries the stale literal
  "Joaquín has Crossbow but no arrows — the string stays drawn,
  useless." — a static string, not engine output; a cleanup may
  update it.

## 7. Run identity

- **Base:** worktree HEAD `e67224635` at first edit; branch
  `sim-crossvoice-a`; local master did not move during the arm —
  no rebase. **Pre-flight:** `node
  scripts/test-killlootbundle-a.js` → 12/12;
  `node scripts/analyze-killlootbundle-a.js --selftest` → 17/17.
- **Probe (pre-freeze, NOT judged):** crossvoice fixture, seed 7,
  armed + dry for all four weapons — setup gates all passed;
  crossbow 3/3/60, sling 2/2/22, phase_sling 2/2/50, bow 2/2/36;
  dry legs 0 shots. Armed JSONs did not land (flap `@@FALLBACK`
  to stdout); dry JSONs landed.
- **RED (pre-fix, NOT judged):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 node
  scripts/test-crossvoice-a.js` → NO-GO, S1/S2/S3 fail, S4/S5/S6
  pass, exit 1.
- **Judged (post-fix):** same command → GO, S1–S6 pass, exit 0.
- **Instrument commit:** `79ceb43eb` ("sim-crossvoice-a: prereg +
  crossbow/sling volley fixture and judge (frozen, pre-fix)").
- **Fix commit:** `0168ec2cf` ("sim-crossvoice-a: crossbow/sling
  volleys read as their own weapons, not bows [needs-eyes]").
- **Post-commit re-run:** `node scripts/test-crossvoice-a.js` once
  after the fix commit → GO, S1–S6 pass, exit 0, assertions
  identical to the judged run; all JSONs carry `anchorCommit:
  0168ec2cf`.
- **Post-fix proofs:** proof test 12/12, selftest 17/17, green.
- **Gate:** `node scripts/check.js --quick
  --cacheDirectory=/tmp/jest-cache-sim-crossvoice-a` → exit 0
  (344 scripts), ~280 s wall under load.
- **Rebase at landing (master moved):** local master moved to
  `4681e740f` (sim-hypofloor-b, 1 commit; touches fieldFights.js
  at :1572 and :2736+, outside the volley block) after the judged
  run, so the branch was rebased onto `4681e740f` before merging.
  The rebase hit the documented stop-at-pick quirk on the 3rd pick
  (`ccdf68c5d`, the evidence commit — "Could not execute the todo
  command", rescheduled); verified the pick unapplied via `git diff
  ccdf68c5d -- evidence/2026-11-22/` (non-empty, 2.2M lines) with
  the worktree clean, then `git rebase --continue` — all 3 commits
  replayed clean, each exactly once. New hashes: instrument
  `ba1fb1e92` (was `79ceb43eb`), fix `63d90d857` (was
  `0168ec2cf`), evidence `04e153abe` (was `ccdf68c5d`). The
  replayed fix patch is byte-identical to the original (diff of the
  two patches, excluding hash headers, empty). **Proofs re-run
  after the rebase** (same commands): proof test 12/12, selftest
  17/17, `test-crossvoice-a.js` → GO, S1–S6 pass, exit 0,
  identical assertions; refreshed JSONs differ from the pre-rebase
  ones only in `anchorCommit` (now `04e153abe`, the branch tip at
  re-run time — 1 line each).
- **Second rebase at landing (master moved again):** after that
  rebase, local master moved again to `efd5f4273` (3 commits:
  journey succession r266 ×2 + journey-deepening r249,
  evidence-only + driver/analyzer/tests; none touches any of this
  arm's files — `git diff --name-only 4681e740f efd5f4273` shows no
  fieldFights.js, crossvoice, searvoice, or killlootfixture path),
  so the branch was rebased again onto `efd5f4273`. The stop-at-pick
  quirk struck a second time, again on the 3rd pick (the evidence
  commit `04e153abe` — "Could not execute the todo command",
  rescheduled); verified the pick unapplied via `git diff
  04e153abe -- evidence/2026-11-22/` (non-empty, 881,319 lines)
  with the worktree clean, then `git rebase --continue` — all 4
  commits replayed clean, each exactly once. New hashes: instrument
  `90126ee07` (was `ba1fb1e92`), fix `fb23cb9e1` (was `63d90d857`),
  evidence `807ef3489` (was `04e153abe`), rebase note `891b474cd`
  (was `3c859c5b0`). The replayed fix patch is byte-identical to
  the original (diff of the two patches, excluding hash headers,
  empty). **Proofs re-run after the second rebase** (same
  commands): proof test 12/12, selftest 17/17,
  `test-crossvoice-a.js` → GO, S1–S6 pass, exit 0, identical
  assertions (bow lines observed in use: "nocks an arrow", "lowers
  the bow"); refreshed JSONs differ only in `anchorCommit` (now
  `891b474cd`, the branch tip at re-run time — 1 line each).
- **Third rebase at landing (master moved again):** after that,
  local master moved again to `96f638c8a` (4 commits, sim-killrate-a
  arm landing: prereg, proof tests, judged band + evidence, rebase
  record; the tip commit touches only
  `evidence/2026-11-22/sim-killrate-a.md` — no overlap with any of
  this arm's files), so the branch was rebased a third time onto
  `96f638c8a`. The stop-at-pick quirk struck a third time, this
  time on the 5th pick (the second rebase-note commit `d04b76849`
  — "Could not execute the todo command", rescheduled); verified
  the pick unapplied via `git diff d04b76849 --
  evidence/2026-11-22/` (non-empty, 1,405 lines) with the worktree
  clean, then `git rebase --continue` — all 5 commits replayed
  clean, each exactly once. New hashes: instrument `18efd0713`
  (was `90126ee07`), fix `44b4e97b5` (was `fb23cb9e1`), evidence
  `baf36f390` (was `807ef3489`), first rebase note `d61932a33`
  (was `891b474cd`), second rebase note `1e28ad16c` (was
  `d04b76849`). The replayed fix patch is byte-identical to the
  original (diff of the two patches, excluding hash headers,
  empty). **Proofs re-run after the third rebase** (same commands):
  proof test 12/12, selftest 17/17, `test-crossvoice-a.js` → GO,
  S1–S6 pass, exit 0, identical assertions; refreshed JSONs differ
  only in `anchorCommit` (now `1e28ad16c`, the branch tip at re-run
  time — 1 line each). Master was still at `96f638c8a` after the
  re-run, so the branch sits on the current tip.
- **Green-list scan:** no test pins the old bow lines for a
  crossbow/sling holder (see §4).

## Files

- Prereg: `evidence/2026-11-22/sim-crossvoice-a-prereg.md` (`79ceb43eb`)
- Instrument: `scripts/crossvoice-fixture-a.js`, `scripts/test-crossvoice-a.js` (`79ceb43eb`)
- Fix: `src/js/fieldFights.js` (fix commit `0168ec2cf`)
- Fixture outputs (this arm's dir):
  `evidence/2026-11-22/crossvoice-a-crossbow-armed.json`,
  `crossvoice-a-crossbow-dry.json`,
  `crossvoice-a-crossbow-armed-rerun.json`,
  `crossvoice-a-sling-armed.json`, `crossvoice-a-sling-dry.json`,
  `crossvoice-a-sling-armed-rerun.json`,
  `crossvoice-a-phase_sling-armed.json`,
  `crossvoice-a-phase_sling-dry.json`,
  `crossvoice-a-phase_sling-armed-rerun.json`,
  `crossvoice-a-bow-armed.json`, `crossvoice-a-bow-dry.json`,
  `crossvoice-a-bow-armed-rerun.json`
- Refreshed killlootfixture-a JSONs (anchorCommit only):
  `evidence/2026-11-22/killlootfixture-a-ctl.json`,
  `killlootfixture-a-arm.json`,
  `killlootfixture-a-ctl-rerun.json`,
  `killlootfixture-a-arm-rerun.json`
