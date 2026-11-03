# sim-sortiev2-a — sortie-v2 mechanism-settling diagnostic (Loop A, axis scale-onramp)

DIAGNOSTIC, NOT a retry, NOT a game change. Zero src/js changes.
Prereg (committed first, before any judged work):
scripts/sortiev2-prereg-20261103.md, commit 6695cf24b.
Instrument + proof test: scripts/sortiev2-replay.js,
scripts/test-sortiev2-a.js (6/6 legs green, see below).

## Questions and verdicts

### Q1 — stale-offer invalidation: SETTLED-YES (reactive rule)

A policy-side layer CAN detect and skip stale offers using only
perception-law-legal inputs. The rule, pre-registered and proven on
the real sortie-b corpus:

- On a verb return of 'none', invalidate every offer recorded
  BEFORE that return. A fresh gorge line recorded after the return
  is a fresh offer and may be answered.
- 'no-fighters' does NOT invalidate (treeline occupied, bench bare).
- Per-name refinement, code-grounded (not corpus-proven — the say
  transcripts lived in /tmp and are gone): a moved-on line names the
  departed lingerer through the same display-name function as the
  gorge line, so an offer for that spoken name recorded before the
  moved-on line is dead. Caveat: display names are knowledge-gated
  (game.js monsterDisplayName: village name if known, true name
  once the System has arrived, else the unknown descriptor or
  'something moving'), so two unidentified lingerers can share one
  spoken string and a per-name drop could over-drop a twin. The
  global 'none' rule has no such caveat. A future retry arm may use
  the refinement, but the corpus proof below rests on the global
  rule alone.
- Proactive age expiry (drop offers older than N nights) is examined
  and REJECTED: an old offer answered while NEW lingerers gorge
  still fights a live target, so age alone does not prove staleness.
  Only emptiness proves staleness, and emptiness is spoken ('none',
  'treeline is quiet', moved-on line) or returned.

Why the flood happened (mechanism, grounded): the engine keeps NO
offer objects at all. A "queued offer" is purely the policy's own
record of a spoken gorge line. Each dawn, EVERY lingering monster
gorges and speaks its own line (havenGrowthDaily loops all lingering
monsters, one line each), but the sortie-b policy answered at most
once per day — so on multi-lingerer nights the queue grew faster
than it drained. Meanwhile the 6-night drift valve
(day - lingerSince > 6 clears lingering) emptied the treeline while
the queue still held offers from those nights. The policy then kept
answering the backlog into an empty treeline, one wasted answer per
day, because it marked offers "answered" but never "dead".

Replay result (scripts/sortiev2-replay.js over the archive variant
per-seed JSONs, evidence/2026-11-03/perseed-sortie-a/):
- Attempts 47 -> kept 30, suppressed 17.
- 'none' attempts 24 -> 7 (exactly one per empty stretch: the first
  'none' that proves the emptiness; 98401: 2 kept / 5 suppressed,
  98402: 2 / 0, 98405: 3 / 12, 98406: 0 / 0).
- Suppressed attempts are ALL 'none': all 16 ok attempts and all 7
  no-fighters attempts are kept. Zero useful attempts lost.
- The replay is a filter on the recorded sequence, not a
  re-simulation — and that reading is sound because a 'none' return
  happens BEFORE any muster or ration spend (lingererSortie early
  return), so a suppressed attempt changes no game state except the
  spoken 'none' line itself, which no decision input reads.

What "stale" means, precisely: the engine marks nothing stale.
Staleness is a policy-layer concept — an offer is stale when no
lingerers remain (global 'none' / quiet line) or when its named
lingerers have moved on (moved-on line). The state that WOULD mark
it in the engine (the monster entity's lingering flag / lingerSince
/ hp) is behind a roster/position channel and is NOT available to
policy. The rule above never reads it.

### Q2 — target agreement: SETTLED-NO (no policy-side hook exists)

Policy CANNOT make the sortie target follow the offered name. Two
independent grounds, each sufficient on its own:

1. NO PARAMETER TO STEER WITH. answerLingerer(how) takes only the
   choice string ('endure' / 'sortie') — src/js/havenGrowth.js,
   answerLingerer branch: 'sortie' calls this.lingererSortie() with
   no arguments. lingererSortie() takes no arguments and fights
   EVERY current lingerer in turn, in world-array order
   (`for (const m of raiders.slice())`, raiders from
   lingeringRaiders(), i.e. worldMonsters filtered to lingering).
   The offered name is never an input anywhere in this path: the
   engine does not know which name was offered, because an "offer"
   is just a spoken gorge line, not state. In game code, the sole
   caller is the beats-panel handler in src/js/app.js (kind
   'lingerer' -> Game.answerLingerer(spec[1])); sim-side callers
   (drivers, the sortie-b policy, partyfinish) all pass only the
   bare 'sortie' string — none passes a target, because there is
   no target parameter to pass.
2. NO LEGAL WAY TO KNOW WHICH LINGERER IS WHICH. The offered name
   is a spoken display string (monsterDisplayName); the engine's
   lingerer list is entities with ids and tile positions. Joining
   the two would need either a roster read (lingeringRaiders() /
   worldMonsters() — forbidden: list-fed decision, position API)
   or a display-name-to-id reverse lookup through data tables
   (not perception: the player never sees ids). And even with the
   id in hand, ground 1 still blocks: there is no parameter to
   pass it to.

Exhaustive hook search (all examined, all fail):
- Harness policy hooks (scripts/sim-harness.js): setup (tap install
  only), upkeep (3x/day, same verb, no target param), daily (same),
  fight (drives OPEN scholar turn-based fights via driveFights only
  — lingererSortie's fieldFights are synchronous engine-internal
  calls, never create a tbfight, never pass through policy.fight;
  fieldFights.js contains no policy callback and no tbfight
  reference), contest (activeContest driver only), pending
  (pendingEncounter scholar encounters only). None observes or
  steers a lingerer sortie.
- Calling lingererSortie() directly instead of answerLingerer():
  same loop, same order, still no target parameter — not a hook.
- Mutating/reordering worldMonsters(): engine-state mutation through
  an internal array reference, not a policy hook; forbidden as a
  roster/position channel; excluded, not an option.
- Beats panel (src/js/app.js, DOM-only, not loaded in node): ONE
  row for ALL lingerers (names joined with commas), ONE sortie
  button carrying no monster id (data-beat="lingerer:sortie" ->
  spec[1] only). The phone player cannot aim either — this is a
  UI + engine gap, not a policy gap.

THE FIX SHAPE (named, NOT landed — a game-code fix is a separate
later arm with its own prereg):
- Thread an optional target through answerLingerer(how, targetId?)
  -> lingererSortie(targetId?): when given, fight the matching
  raider FIRST (then the rest in current order, if the party
  survives) — or ONLY it; that is a design call for the later arm,
  since today a sortie fights every lingerer in turn. Fall back to
  current order when the id is absent or unmatched.
- The beats panel must then carry the id: per-lingerer buttons
  (data-beat="lingerer:sortie:<id>") or a first-named-target button.
  A single button for a joined name list cannot express a target.
- The sim policy side then becomes trivial: answer with the
  offered name's id — but the policy still needs a legal
  name-to-id join, which today does not exist either. The later arm
  must decide whether the beats button (which DOES hold the entity)
  is the join, or whether the engine should record the last
  announced offer as state. Do not let a retry arm "solve" Q2 by
  reading the roster in policy: that would be a perception-law
  violation wearing a fix's clothes.

## Retry readiness: RETRY-BLOCKED-ON-Q2 (needs-game-code-arm)

Q1 settled YES, Q2 settled NO. Per the prereg, a sortie retry is
ready ONLY if BOTH settle YES. It is not ready. The next blank is
the Q2 game-code arm (thread the target parameter + beats-panel id,
own prereg, own proof), after which a retry arm may combine the Q1
invalidation rule with aimed sorties. A retry that re-uses the Q1
rule alone would still fight the engine's target, not the offered
name — the exact failure sortie-b already proved.

## Archive numbers (NOT new wall movement — no fresh sims ran)

Neither probe-clause trigger fired (replay suppressed no ok /
no-fighters attempt; hook search found no unexamined candidate), so
per the prereg NO fresh probe sims ran and no new wall numbers
exist. The numbers below are sortie-b archive numbers, restated
for context only:
- National / table / wins: 1 / 8 / 8 both arms; wave-4 unlock 6/8,
  wave-5 0/8; median survival 90d (days-to-win, not days-to-death).
- Offers 64, attempts 47 (16 ok, 7 no-fighters, 24 none) on seeds
  98401-98408, closecommit stack, 180d death-aware cap.

## Sense-testing

No new transcripts exist to read (no fresh sims; /tmp say
transcripts from sortie-b are gone). The sense judgment carried
forward from sortie-b stands and is sharpened by this diagnostic:
the 'none' flood reads as a village pressing a dead button — a
phone player stops after the first "Nothing holds the treeline",
and the Q1 rule is exactly that stopping behavior, formalized.
The target mismatch reads as a village answering "the Reunion" and
being handed "the Callback" — a broken promise between the spoken
offer and the fight, which no policy wording can repair because
the offer and the fight share no identifier. Both readings point
the same way: Q1 is a policy habit fixable in policy; Q2 is an
engine wiring gap fixable only in game code.

## Proof test

`node scripts/test-sortiev2-a.js` — 6/6 legs green:
1. Replay totals match the archive (47 attempts, 24 none).
2. Replay suppresses only 'none' attempts (16 ok + 7 no-fighters
   all kept).
3. Replay leaves one 'none' per empty stretch (24 -> 7; per-seed
   98401 2/5, 98402 2/0, 98405 3/12, 98406 0/0).
4. Suppressed attempts are state-neutral ('none' return precedes
   muster in lingererSortie).
5. Gorge and moved-on lines share the display-name source
   (monsterDisplayName in both branches).
6. The replay instrument contains no roster/position channel token.

## Metric review

Diagnostic verdicts are not GO/KILL bars — this arm passes or fails
nothing in the game; SETTLED-NO on Q2 is a successful diagnostic
outcome, not a failed arm. What a future retry arm must
pre-register (from the prereg, restated):
(a) the Q1 invalidation rule, with a flood metric ('none' share of
attempts, target: only first-none-per-stretch remains) and a cost
bar defined on fighter-attributed deaths (cause 'sortie combat'),
NOT the sortie-b day-join (which counted 27 deaths for 4
fighter-attributed ones);
(b) a target-agreement metric: sortie fights by FOUGHT monster
from the deed/kill record, never by offered name;
(c) offer-availability pre-screening or judging on offer-receiving
seeds only, since zero-offer seeds (98403, 98404, 98407, 98408)
cannot move under any answer policy.
No metric was re-scored mid-run: there was no judged sim to
re-score, and the replay rule was fixed in the prereg before the
instrument ran.

## Files

- Prereg: scripts/sortiev2-prereg-20261103.md (commit 6695cf24b).
- Instrument: scripts/sortiev2-replay.js.
- Proof test: scripts/test-sortiev2-a.js (green, above).
- Evidence: evidence/2026-11-03/sim-sortiev2-a.md (this file).
- No src/js changes. No policy files created or deleted. No fresh
  per-seed JSONs (archive corpus reused, not re-run).
