# sim-barwhy-b — action-bar why reasons: GO

Run: fleshout-loop-b-20261028T0630Z, axis food-economy, arm sim-barwhy-b.
Worktree branch: sim-barwhy-b. Prereg: evidence/2026-10-28/sim-barwhy-b-prereg.md
(committed as 94c04755 BEFORE any after-measurement; judged fixtures ran only
after it). Proof: scripts/test-barwhy-b.js. Background: the prior loop-B run
(evidence/2026-10-28/sim-onceaday-scope-b.md) found the bar renders disabled
buttons + effect text but never the why reason, and legacy rows carry
why 'Used today.' even when enabled. This arm fills exactly that blank.

Canon: docs/CANON.md read first. No canon doc covers ability-action refusals
generally (tracker blank 5, 2026-10-28) — stated, not invented. Rules applied:
"No silent actions" (every action narrates honestly, including failures) and
"If you don't know, it doesn't show." Surfacing the existing reason verbatim
is the no-silent-actions rule applied to the button itself: the player used
to learn why only by wasting a tap on a refusing button.

## Verdict: GO — all four pre-registered legs hold

(a) Disabled buttons show their why: in the after run, all 50 disabled rows
    render their why reason verbatim in the bar HTML (segHasWhy=true on every
    disabled button). Before: 0 of 50 — the reason existed only as internal
    state.
(b) Enabled buttons carry no stale why: after run, 0 of 90 rows is an enabled
    button with a why, and no enabled button's rendered HTML carries a why
    span. Before: 28 enabled legacy rows carried a refusal sentence
    (time_skip / echo_location 'Used today.', blood_magic 'Need at least
    11 HP.', field_medicine 'Already at full health.', herbal_remedy /
    purify 'Used today.', compost_king 'No food to bury.' — each false in
    the state where the button was live).
(c) Availability parity: the assert run compared all 90 after rows against
    the before snapshot (identical seeds, identical fixture setup) — zero
    availability changes, zero rows appeared or disappeared. No action got
    easier or harder to press; no precheck, cost, or narration text changed.
(d) Pilot band 8/8 before and after, no crash, wall numbers identical
    seed-by-seed (see §2).

## 1. The fix (only this; 2 files, +25/−12)

- src/js/app.js `abilityBarHTML`: a disabled button now renders
  `<span class="ctx-why"> — {why}</span>` after its effect text, and the
  button title gains the reason too. Enabled buttons (including
  choiceAvailable god buttons, which count as enabled) render no why.
  No CSS change: the new span renders like the existing unstyled ctx-desc
  span, so layout risk is nil.
- src/js/abilityActions.js `_legacyActivatables`: a row's why is null when
  the row is available and carries the refusal sentence only when disabled.
  Named rows time_skip / echo_location plus the same stale-why pattern in
  sibling legacy rows (blood_magic, field_medicine, herbal_remedy, purify,
  compost_king) — the prereg judged EVERY enabled button, so fixing only
  the two named rows would have failed leg (b) on the siblings. Cannibal
  frenzy already followed the rule; dowsing carries no why; data-driven,
  god, and keepsake rows already emit why=null when available.
- Explicitly NOT changed: any enabled/disabled state, any precheck, any
  narration string (all whys surfaced verbatim), calm_beast targeting
  (separate future arm), the DEAD hardcoded `activatableAbilities` copy in
  game.js (marked unreachable; kept until a --force-delete cleanup is
  approved).

Proof method, stated plainly: app.js is DOM-only and excluded from the node
harness, so the render half is proven by evaluating the REAL abilityBarHTML
function source extracted from src/js/app.js against stubbed Game/esc — no
re-typed template. Row-data legs come from the live game via sim-harness
(seed before eval, full src/js list minus DOM-only files, Game.save never
stubbed), seeds 9981 + 9982, 7 scenarios per seed (legacy live / spent /
sick-live / blood-blocked, convo / no-convo, scaffolded fight).

## 2. Pilot band — before vs after (competent, 100d death-aware cap)

Seeds 10430–10437, identical before/after. Corpus:
evidence/2026-10-28/sim-barwhy-b-band-before.json and -after.json.

| Seed | Before | After |
|---|---|---|
| 10430 | 100d survived, wave 3, arc 3, village | identical |
| 10431 | 35d village-lost, wave 2, arc 3 | identical |
| 10432 | 100d survived, wave 4, arc 3 | identical |
| 10433 | 100d survived, wave 3, arc 3 | identical |
| 10434 | 100d survived, wave 3, arc 3 | identical |
| 10435 | 100d survived, wave 3, arc 3 | identical |
| 10436 | 100d survived, wave 3, arc 3 | identical |
| 10437 | 100d survived, wave 2, arc 3 | identical |

Wall numbers, before = after: wins 0/8, national 0/8, table 0/8, vests 0,
max wave 4, median survival 100d (capped; one loss at day 35), 169 deaths
total (monster:combat 62, monster:villager combat 55, monster:expedition 20,
player:the arena 10, rest single digits). The band is a regression guard
for a display-only fix, and it behaves exactly as one: nothing moved.

Reachability verdict: unchanged by design — waves 1–4 reached, wave 5 not
reached in this 100d band, Arc III reached on all 8, national/table/win
not reached. That is the known scale wall, not something this arm moves.

## 3. Village assessment (plain words)

Seven villages lived to the 100-day cap; one (seed 10431) was wiped out by
day 35. The villages that lived did so on the usual competent diet — forage,
pantry, talk, a few fights — and none got near the wider world: no national
standing, no table, no win in 100 days. Deaths were overwhelmingly monster
fights, not starvation (2) or thirst (3), so these villages fed themselves
and still died to teeth. Nothing in this arm changes that picture, and it
should not: a button that explains itself does not feed a village or open
a road. What it does change is the moment-to-moment honesty of the screen:
a player deciding whether to press a greyed-out button now sees the reason
up front instead of discovering it by tapping and being refused.

## 4. Sense note (read, not counted)

The refusal sentences, now visible on the button, are specific and
in-character: "The plants have told you enough today.", "Posturing needs
an audience — someone whose dispute you are ending. Talk to them first.",
"No game to dress. Hunt or trap something first, then break it down
clean." One sentence stays visibly wrong in the prior arm's sense, and it
is deliberately NOT fixed here: calm_beast still reads "Nothing here to
calm." on its disabled button — now visible in a fight next to a hostile
villager, still untrue about the room. That dishonesty belongs to the
calm_beast targeting arm, which must give Calm a target or a fight scan;
this arm only makes the existing reason visible, per its orders. No other
villager dialogue was sampled this run; the judged surfaces are the button
reasons themselves.

## 5. Checks and limits

- scripts/test-barwhy-b.js assert vs the before snapshot: PASS, 90 rows
  (disabled carry visible why, enabled carry none, availability parity).
- node --check clean on both changed files.
- node scripts/check.js --quick: 279 passed, 8 failed in 1563s. All 8
  failures were re-run on BASE code (fix temporarily reverted in this
  worktree, restored byte-identical afterward — restored diff verified
  identical) and fail identically there: hide-discovery counter, 3
  measurement-proof freshness tests, measurement-workflow, mobile-combat
  cadence, occupation-panels, phone-frame-proof (retained receipts stale
  against current source — a refresh-maintenance item, not a behavior
  regression), establishment-r20 racks voice. None is caused by this arm.
- Balanced-panel exception (standing rule, stated not faked):
  scripts/balance-panel.js cannot ingest this corpus — it requires its own
  observer-driver corpus, not fixture rows + sweep-compare band JSON. No
  panel artifact is attached; the before/after comparison is direct on
  identical seeds, which is the §15 intent without a fabricated panel.
- /tmp note: the before-snapshot JSON in /tmp vanished mid-run (sibling
  /tmp-cleanup wipe class, already known). The assert PASS against the real
  snapshot was observed before the loss; the before stale-why count (28)
  is reconstructed from the parity-proven after corpus (enabled legacy
  rows, whose old code carried why unconditionally — visible in the diff)
  plus the before-run output. The after corpus is committed in evidence/
  so it cannot be wiped the same way.

## Metric review

- The pre-registered rule held with no re-scoring: legs (a)–(d) were
  judged exactly as written. No metric proved wrong mid-run.
- Doubt for the NEXT run, not this one: the render proof evaluates the
  real template function with stubbed Game/esc, not inside a browser. A
  phone-frame receipt refresh (scripts/phone-frame-proof-update.js) is the
  step that would prove the rendered bar on a real phone screen; it is
  maintenance the ship loop owns, not something this arm faked in node.
- The calm_beast targeting arm should re-run this script's C1-combat
  scenario as its before fixture: calm_beast must become enabled (or its
  reason rewritten) in a fight with a live hostile villager adjacent.

## Commits (branch sim-barwhy-b, no push, no bump, no live check)

- 94c04755 — prereg (committed before judged fixtures; index-clobber
  phantom staged deletion repaired via HEAD-blob cacheinfo, verified).
- (this run) — src/js/app.js + src/js/abilityActions.js fix,
  scripts/test-barwhy-b.js, this evidence file, band before/after JSONs,
  after-rows corpus. Worktree clean at handoff; committed in worktree,
  pending coordinator merge.
