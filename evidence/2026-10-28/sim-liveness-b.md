# sim-liveness-b — challenge/posture dead-target liveness (loop B, 2026-10-28)

Prereg: evidence/2026-10-28/sim-liveness-b-prereg.md (committed before
any after-measurement, commit bfff2a36). Gap: backlog
refusalprecheck/liveness-gap, from
evidence/2026-10-27/sim-refusalprecheck-b.md §metric review 6 and
docs/ABILITY-REFUSALS.md §2.

## Verdict: GO

The gap is real, symmetric, and now closed with the smallest alignment
the prereg called for: dead-flag targets refuse before payment, in
both the precheck and the impl, for both actions. Living behavior is
byte-identical before/after on fixtures and on the policy band.

## The gap, fixture-proven (RED, unmodified code)

scripts/test-liveness-b.js, seeds 9981–9988, one tap per fixture at
dayTicks 100 (non-boundary). Dead partner = first non-scholar roster
member with Game.getPerson(partner).dead = true set after setup,
partner still on the roster, dead flag read back true on all 32 dead
rows before the tap.

| fixture | path | BEFORE (unmodified) | AFTER (fix) |
| --- | --- | --- | --- |
| D1 challenge explicit dead | explicit | ACCEPTED 8/8, success narration, challengeDay stamped | REFUSED 8/8 pre-payment |
| D2 posture explicit dead | explicit | ACCEPTED 8/8, success narration, postureDay stamped | REFUSED 8/8 pre-payment |
| D3 challenge convo dead | convo-scan | ACCEPTED 8/8, bar read ENABLED 8/8 | REFUSED 8/8, bar read disabled 8/8 |
| D4 posture convo dead | convo-scan | ACCEPTED 8/8, bar read ENABLED 8/8 | REFUSED 8/8, bar read disabled 8/8 |

Symmetry confirmed: challenge and posture both accept dead targets,
on both paths. Before the fix a dead villager "grins", "goes pale",
or "yields the point" — a corpse answering a dare. After the fix the
tap is one line, nothing taken: day, ticks, and kcal all unchanged,
flag unstamped, audience sentence present ("A challenge needs
someone to challenge — and they have to be here, alive, and one of
yours. Talk to them first." / "Posturing needs an audience —
someone whose dispute you are ending. Talk to them first."), with
the standard " (action name)" wrapper on the useAbility path.

Note on the bar read: for explicit fixtures the bar read is disabled
both before and after (the bar passes no target and no conversation
is active in those fixtures — the same honesty as the living
explicit fixtures). The player-facing change is the convo path: a
dead conversation partner's button goes from enabled to disabled
with the audience reason. That is why the fix commit carries
[needs-eyes].

## The fix (one file, 50 insertions / 8 deletions)

src/js/abilityActions.js only, four sites, no narration change, no
cost change, no new eligibility:

- war_cry.challenge precheck + impl, intimidating_presence
  .end_it_before precheck + impl: the conversation scan now skips
  dead-flag partners (so a dead active partner does not block a
  living one, and a dead-only audience refuses), and an explicit
  dead-flag target refuses with the existing audience sentence.
- The impl mirrors the precheck exactly (same getPerson(vid).dead
  test), so the button and the tap cannot disagree — the class this
  lineage keeps fixing. Trophy mark has no target and is untouched.

## Proof

- Fixture assert mode: RED on unmodified code (dead rows fail on
  result, ticks, kcal, sentence, flag, and bar state), GREEN after
  the fix — PASS, all 64 fixtures (32 dead refuse, 32 living succeed).
- Det-gate (fixture corpus, dump mode before vs after):
  evidence/2026-10-28/sim-liveness-b-corpus/before.json vs after.json
  — exactly the 32 dead rows move (accept → refuse, ticks 103→100,
  kcal 4960→5000, D3/D4 bar true→false); all 32 living rows
  byte-identical including sayLines. No living success flipped.
- Policy guardrail band (sweep-compare, competent, seeds 9981–9988,
  60d death-aware, no COMPETENT_* overrides): detgate-before.json vs
  detgate-after.json — every per-seed run and the byPolicy aggregate
  identical except the run label strings and the generated
  timestamp. Headlines both legs: won 0/8, median survival 60 (at
  cap), max 60, max wave 3, national 0%, vests 0, deliberations/day
  21, identical death-cause shares (monster:combat 22,
  monster:villager combat 53, monster:expedition 8, player:the arena
  7, villager:sickness 9, villager:a wound that wouldn't close 5,
  person:ambush 4, villager:starvation 3, player:contest 2,
  villager:monster 2, villager:Choir Toad 1, player:starvation 1).
  Starvation deaths (player 1, villager 3) and median survival are
  therefore identical, satisfying the prereg's starvation/median
  guards by identity, not by averaging.
- Balanced panel (§15): panels-before / panels-after under
  sim-liveness-b-corpus/ (panel.json.gz committed, cases/ caches
  deleted, never committed), compare attached as
  panels-compare.md / panels-compare.json. Panel decision, verbatim:
  "review_required". That label is NOT a movement signal: every
  paired metric delta is exactly 0 with a 0-to-0 interval (win rate
  0→0, table entry 0→0, national 0→0, player deaths 1.25→1.25,
  village deaths 14.625→14.625, community loss 0.125→0.125, and so
  on across all 26 rows). The decision rule marks review_required
  whenever any metric carries a descriptive / insufficient /
  not_observed status by contract — those statuses apply regardless
  of delta, and here every one of them sits on a zero delta. The
  prereg's judge is guardrail 3's headline identity, and it holds.

## Wall numbers (judged policy band, both legs identical)

Competent, 8 seeds, 60d death-aware: national 0/8, table 0/8,
wins 0/8, wave 4–5 reach 0/8 (max wave 3), median survival 60 AT CAP
(7 villages survived to the 60d cap; seed 9983 village-lost day 12),
max 60. Probe fixtures carry no wall numbers (single day-1 setups,
not villages) and none are estimated for them.

## Sense read (SENSE-TESTING LAW — plain words)

Before: you point at a dead villager, in front of everyone, and the
game tells you they grin, or go pale, or yield the point — then
stamps the day's dare/posture as spent and seeds the gossip. The
village remembers a dare to someone who cannot hear it. After: one
line — "A challenge needs someone to challenge — and they have to
be here, alive, and one of yours. Talk to them first." Nothing is
taken, nothing is stamped, nobody is said to have answered. The
refusal now says what the game already believed everywhere else:
dead people do not act, yield, or remember (calm already checks
alive; pocketed ammo already refuses the dead; the table already
skips them). The living taps read unchanged — the dare still points
at a named villager, the room still hears it.

## Village assessment (what the judged band shows)

The 60d competent villages are early-game villages: max wave 3, no
national reach, no table, no wins — the same picture before and
after, which is exactly what an identity gate should show for a
change that only refuses dead targets. Nothing in this band taps
challenge / end_it_before through useAbility under competent policy
(COMPETENT_TALK off by default), so the band proves no collateral
movement, while the fixtures prove the fix itself. Deaths inside the
villages are dominated by villager combat (53) and monster combat
(22) — the world kills villagers in fights, not the liveness change.

## Sibling regression check (pre-existing stale test, NOT this arm)

scripts/test-refusalprecheck-b.js fails on this tree: FAILURES (32),
all on R13/R14 (non-boundary once-a-day). Cause: that test still
encodes the refusalprecheck-era residual ("once-a-day refuses
post-payment, ticks consumed, silent 40 kcal burn"), but the landed
sim-onceaday-b work now prechecks once-a-day day-roll-aware, so
those taps refuse pre-payment with ticks/kcal unchanged — the test's
expectations, never updated since commit 10ef1e627, are stale.
Proven pre-existing, not a regression from this arm: the same test
on pristine HEAD abilityActions.js (fix temporarily reverted, then
restored byte-identical via the saved patch) also reports FAILURES
(32), and this arm touches no once-a-day logic (diff is the four
liveness sites only). Updating that stale test belongs to a
onceaday follow-up, not to this arm's diff. This arm's own test
passes 64/64 on the fixed code.

## Blanks filled / documented

- FILLED (this arm): challenge/posture liveness — dead-flag roster
  members no longer accepted as challenge/posture targets, on either
  path, in either layer (precheck + impl).
- DOCUMENTED, not chased: whether a dead villager's conversation
  can stay active in real play (the fixture sets the state directly;
  real-play reachability of dead+active-convo is a separate question
  for a future arm, not assumed here). The fix is correct in both
  worlds: if the state cannot occur, the check is inert; if it can,
  it refuses honestly.

## Metric review (§14)

- Prereg judged as written: primary metric 32/32 dead refusals
  pre-payment — MET. Guardrails 1–3 met by identity (living rows
  identical, policy headlines identical). No re-scoring: no metric
  was swapped mid-run.
- Asymmetry note: none found — challenge and posture behave
  identically on both paths, before and after. The prereg's
  report-each-separately requirement is satisfied by the table above.
- Panel decision label vs prereg judge: the panel reported
  review_required on all-zero deltas (see above) — recorded here,
  not treated as movement, exactly the refusalprecheck precedent
  for the same contract quirk.
- Infrastructure note: the prereg's safe-commit hit the known
  safe-commit index-clobber class (commit bfff2a36 correct, 111
  insertions; main index then showed a bogus staged deletion of the
  byte-identical file). Repaired with git update-index --cacheinfo
  from the HEAD blob and verified (git status empty, git diff HEAD
  empty, hash-object matches HEAD blob) before any further work.
  The same check was run after the fix commit.

## Files

- scripts/test-liveness-b.js (fixture proof, dump + assert modes)
- src/js/abilityActions.js (the fix)
- evidence/2026-10-28/sim-liveness-b-prereg.md
- evidence/2026-10-28/sim-liveness-b-corpus/before.json,
  after.json, detgate-before.json, detgate-after.json,
  panels-before/panel.json.gz, panels-after/panel.json.gz,
  panels-compare.md, panels-compare.json
