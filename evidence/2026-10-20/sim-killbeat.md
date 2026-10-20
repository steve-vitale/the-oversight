# sim-killbeat — killbeat misattribution fix (2026-10-20)

Run: sim-killbeat, tree `~/workspace/worktrees/sim-killbeat`, base f60d253b7.
Axis: scale-onramp (the blocking axis). Named next #5 from
evidence/2026-10-20/sim-villagergear.md, corrected by the 1615Z judgment run.

## PRE-REGISTRATION (binding, §14)

- **PRIMARY**: on the repro case (the committed s64006 transcript), the
  Understudy broadcast no longer names companions for the scholar-finished
  fight. The d61 transcript shows the scholar striking the final blow
  ("You STRIKE the understudy for 31 (Stone knife)... +20 style — dropped
  the Understudy!") while the broadcast aired "📺 Tariq, Aurora brought down
  The Understudy. Together."
- **GUARDRAIL**: zero other broadcast beats change — the beat path run over
  a 4-seed instrumented control corpus; only the misattributed class may
  change. The d61 Strike veteran-kill beat ("Tariq just put down The
  Strike... That's a veteran kill, folks.") must be byte-identical
  before/after.
- **Proof**: scripts/test-killbeat.js RED->GREEN (RED: misattribution
  reproduces on the instrumented repro; GREEN: attribution correct).
  Re-verify the proof after any rebase.
- **Check**: `node scripts/check.js --quick` after the change (repo
  AGENTS.md rule). No new src/js module, so no ontology change.

## What the bug was

The "brought down" broadcast is composed once, in
`partyVictoryBeat` (src/js/party-formal.js) — NOT in game.js. The brief's
"src/js/game.js only" location guess was wrong; the beat is reached via the
tbEnd wrapper in party-formal.js, which names `this.partyMembers()` (the
formal party, which excludes the scholar) for ANY won fight they were in.
Both the 📺 line (broadcastLine, mag-8 deed) and the 📣 line (recordDeed's
at-Haven echo) derive from the same deed text, so one fix covers both.

The brief's "key it on the waveKillLog final-blow attribution" mechanism is
what shipped: each dying monster fighter carries the `_tbKilledBy` stamp
('p'/'player' = scholar, a villager fighter key = companion, unset =
legacy) — the exact stamp the game.js TRICKTAG path (recordWaveKill) writes
to waveKillLog. The beat now keys on the same stamp the log uses, so the
fiction and the log can no longer disagree. The veteran channel (which
depends on honest kill attribution) can now use killbeat fiction as
evidence for who killed what.

## The hunk (src/js/party-formal.js — two adjacent hunks)

1. `partyVictoryBeat(monstersDown)` → `partyVictoryBeat(monstersDown,
   deadFighters)`: if every dead monster was finished by the scholar
   (`_tbKilledBy` null/'p'/'player' — the null case matches recordWaveKill's
   legacy tag, which also attributes unresolvable killers to the scholar),
   the beat names the scholar ("You" — betrayal.js disp convention) and
   names NO companion, and drops the "Together." suffix (one person).
   Otherwise the text is byte-identical to before.
2. The tbEnd wrapper captures `deadFighters` (dead monster fighter records
   with mdef, pre-origTbEnd, same objects the name list was built from) and
   passes them in.

Design calls (documented, Steve can overrule):
- Scholar-finished → names the scholar, not silent. The show is televised;
  "You brought down The Understudy." is true, preserves the mag-8 airing,
  and the companions' real contribution is already honored by the 🏆 party
  line and the style beats.
- Companion-finished → byte-identical ("Tariq, Aurora brought down The
  Strike. Together."). The loose party framing stands; companionKillBeat
  gives the precise credit for wave-3+.
- `recordDeed(members[0], 'party_kill', ...)` vid unchanged — NPC
  viewership board untouched by this fix.
- Known limitation: mixed-finisher multi-monster fights keep the old party
  framing (can't name one finisher honestly; the beat stays honest about
  the fight being shared). Rare in practice (gate fights are single-monster).

## RED -> GREEN

scripts/test-killbeat.js (new; uses the shared godpath/lib.js kit, seeded
BEFORE eval, no Game.save stub, no copied boilerplate). Instrumented TB
kills run the FULL tbEnd path on 4 seeds: scholar-finished 'understudy',
companion-finished 'understudy', companion-finished wave-3 'redactor'.

- RED (pre-fix): 20 pass / 4 fail — the 4 PRIMARY assertions fail exactly
  on the bug: scholar-finished fight aired "A person, maybe 30s brought
  down a blank shape at the tree line, watching. learning.. Together."
  (companion named, scholar not). Pre-arrival, the monster name is the
  knowledge-gated unknown descriptor — expected, and the attribution fix
  is orthogonal to it.
- GREEN (post-fix): 24 pass / 0 fail. Scholar-finished:
  "You brought down a blank shape at the tree line, watching. learning.."
  — no companion named. Companion-finished: per-seed exact match with the
  old-format template. Veteran beat: per-seed exact match with its template.
- Cross-seed byte-equality was dropped as a check: companion descriptors
  are seed-random, so per-seed template equality IS the byte-identical
  guardrail.

Guardrail result: companion-finished class byte-identical on all 4 seeds;
veteran-kill beat byte-identical on all 4 seeds. Only the misattributed
(scholar-finished) class changed. GO.

## Sense note (SENSE-TESTING LAW)

Read the d61 window of
evidence/2026-10-20/villagergear-transcripts/vgear-leadfeast-s64006.txt.
The Understudy fight: the scholar strikes for 50 (PATIENT AIM doubled),
Tariq and Aurora chip in (14/11/13/10), and the scholar lands the killing
blow — "You STRIKE the understudy for 31... dropped the Understudy!",
followed by "Tariq stares at the body, then at you." The old broadcast
("Tariq, Aurora brought down The Understudy. Together.") is false against
this fiction — Tariq's body language says he watched YOU do it. The fixed
beat ("You brought down The Understudy.") matches what the fight shows.
The Strike fight right after (Tariq's final blow, "Tariq just put down The
Strike... on CAMERA. That's a veteran kill, folks.") is untouched —
its party beat still reads "Tariq, Aurora brought down The Strike.
Together.", which is loose but not false, and the precise credit stands.

## Metric review

- The pre-registered PRIMARY is met on the instrumented repro of the exact
  transcript case (the transcript itself is a recording, not re-runnable;
  the instrumented fight reproduces the same beat path with the same party
  composition and the same scholar final blow).
- The guardrail held: only the misattributed class changed.
- One deviation from the brief to record: the fix is in
  src/js/party-formal.js, not src/js/game.js — the beat never lived in
  game.js. No sibling arm claims party-formal.js (live claim
  fleshout-20261020T1744Z: vgearbeats/scholarcare are policy-only), so arm
  independence is preserved.
- Proposed for next run: none. The metric was the right one.

## check.js --quick

Two runs (repo AGENTS.md rule):
- Run 1 (post-fix): 249 passed, 8 failed in 1636s — 3 were TIMEOUT-after-120s
  flakes under sibling-arm CPU contention; the other 5 were the stable set.
- Run 2 (post-fix, full output captured): **253 passed, 4 failed in 1256s**.
  All 4 failures are pre-existing on master, none caused by this change:
  - `test-main67-gossip-resume-beat.js` — gossip narrator dry-beat wording
    assertions (untouched by this fix).
  - `test-measurement-proof-update.js` — "Proof source inputs are not
    current."
  - `test-measurement-workflow.js` — "retained neutrality proof covers the
    current Game/controller/harness inputs."
  - `test-phone-frame-proof.js` — stale/missing phone evidence
    ("Phone receipt source is stale or missing: index.html").
  - The two measurement failures are the retained-neutrality-proof
    staleness class: the proof (scripts/balance-proof.json) was last
    refreshed at 007c4febc and 31 src/ commits landed between it and this
    base (f60d253b7) — the manifest walks ALL of src/, so ANY src change
    since the proof trips it. Refreshing it requires a fresh real
    observer-neutral panel (heavy; the loops' measurement maintenance
    owns it), out of scope for this one-hunk arm. Documented here, not
    fixed here.
- `scripts/test-party.js` (touches partyVictoryBeat's area) crashes
  identically on pristine HEAD — pre-existing (stale 2026-10-07 eval
  boilerplate: `checkPendingPracticeDeeds`/`betrayalState` not functions),
  unrelated to this fix.
- `scripts/test-killbeat-20261019.js` (the sibling companion-beat proof,
  same tbEnd path): 19 passed, 0 failed on the fixed code.

## Verdict: GO

Convergence: the misattribution class is fixed and proven; killbeat fiction
is usable as kill evidence again.
