# sim-axeacq-b — PREREG ADDENDUM (instrument v2, BEFORE confirm)

Written after the v1 pilot legs (8 seeds, 16101–16108, guard leg,
DAYS=60) were analyzed and BEFORE any confirm seed runs. The
prereg's DIAG-GO conditions, horizon, seeds, and policies are
UNCHANGED. What changes is measurement fidelity only: two
acquisition channels the v1 recorder could not see, found by
reading the v1 pilot corpus (not by changing the game).

## What v1 showed (exploration, not judged numbers)

- v1 pilot classification: 2 ACQUIRED (16105, 16108), 6 BLOCKED,
  0 unclassified, 0 recorder errors — so the pilot GO conditions
  on classification completeness and recorder errors held. But
  the two ACQUIRED sources were weak: 16105 'other-named' and
  16108 'unrecorded'. Reading the corpus day lines resolved
  both, and both resolutions are channels, not noise:
- 16105: corpse-loot-as-action. Day-41 lines: 'Taken: Bow x1,
  Hatchet x1, ...' + 'You take bow, hatchet, ... from Nina.'
  + 'The body is stripped.' Nina died day 11 (ambush). The
  vessel looted a dead villager's body on day 41 and the hatchet
  entered the pack that day. The v1 classifier missed it because
  its loot patterns required 'corpse'/'loot' literals; the
  game's loot lines say 'Taken:' + 'You take ... from <name>'.
- 16108: succession. Morning-49 inventory (grandfathers_knife,
  hunting_spear, ...) is wholesale replaced by morning-50
  inventory (fate_threads, wildmark_wraps, lighter; hatchet
  EQUIPPED). The deaths sample shows a player:true death on
  day 50 (owen_smith, 'the wild'). The vessel died and the
  successor arrived already carrying a hatchet. The v1
  recorder captured no vessel id, so the change was invisible
  except as an 'unrecorded' gain.
- Spawn-kit correction (live probe, seeds 16101 + 16105): the
  vessel's carried-5 at spawn contain NO woodcut tool on any
  v1 pilot seed (tier 'none', 'bare hands'), and the prereg's
  'spawn lottery' framing needs one correction. The opening
  gamble is an 8-item fullPool; the vessel carries 5 and
  stashes 3. 16105's fullPool CONTAINS a hatchet — stashed,
  not carried. So the spawn question has three rungs, not
  two: hatchet in the pool at all? carried at spawn? stashed
  (equippable later by the owner)? The v1 recorder captured
  none of the pool/stash fields, so it could not answer any
  of them. The walktree bot's Stone knife is the same shape:
  16101's fullPool contains stone_knife, stashed, not carried
  — the knife in hand at stranded mornings arrived later
  (stash-equip or another channel), not at spawn.

## Instrument v2 (recorders only, zero game/policy change)

- Driver scripts/axeacq-trace-b.js: axeSnap gains villagerId
  (Game.villagerId, a scalar, no NPC hydration) on every snap,
  and fullPool + stashed (vessel only, via getPerson on the
  already-materialized player character) on the spawn snap.
  Behavior-neutral: pure reads, no state edit, same policy
  stack, same env gates.
- Analyzer scripts/analyze-axeacq-b.js: (a) loot classification
  now matches 'You take ... from <name>' and 'Taken:' paired
  with a from-line or a 'body is stripped' tail line; (b) a
  vessel-id change at the first-axe morning with no
  loot/grant/find/trade line that day classifies as
  'succession', corroborated from the deaths sample
  (player:true within ±1 day) when present; (c) per-seed rows
  gain spawnPoolHatchet / spawnStashedHatchet /
  successionCount; summary gains pool + succession counts.
- Proof scripts/test-axeacq-b.js Part B gains synthetic
  'loot-taken' and 'succession' cases (fixtures 24/24).
- Source taxonomy gains two entries: 'loot' (now including
  the Taken/from pattern) and 'succession' (new vessel's
  carried kit). 'unrecorded' remains the honest fallback and
  must still be reported as such when it occurs.

## What happens next (binding)

- The v1 pilot corpus is SUPERSEDED, not judged: the pilot is
  re-run with v2 on the same 8 seeds (16101–16108), then the
  determinism re-run (16101, 16102), then — only on pilot GO
  (all 8 classified, 0 recorder errors, determinism holds) —
  the confirm 8 seeds (16109–16116). Judged numbers come
  from v2 legs only; v1 numbers appear in the evidence file
  solely as the exploration that motivated v2, labeled as
  such, never as the census.
- Column (b) bank legs also run on v2 (same driver), so
  stranded-morning axe reads carry villagerId + pool context.
- The verdict taxonomy gains one rung: if axes arrive only via
  loot-of-the-dead and succession (never via the living bot's
  own effort, craft, or stash-equip), the answer names that
  distribution explicitly instead of collapsing it to a
  single word — 'later-than-day-7' with the channel split
  shown, or 'unbuilt' for the living-bot channels if they
  never fire. The single-word answer is still given, with
  the channel table beside it.
