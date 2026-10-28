# sim-caughtlift-fix-b — caught-lift trust booking fix: GO/NO-GO (pending)

Run: fleshout-loop-b-20261028T0630Z, axis food-economy, arm
sim-caughtlift-fix-b. Fix arm (not measurement-only): routes the
caught-lift / caught-take −20 through bumpTrust with a reason and
gives observe('caught_you_stealing') a live action-table entry.
Follows sim-caughtlift-b (evidence/2026-10-28/sim-caughtlift-b.md),
which proved the −20 lands with narration but no durable trace.

## PRE-REGISTRATION (written BEFORE any after-measurements; §14 binding)

- Primary metric: durable trace exists. GO iff ALL hold:
  (a) scripted caught lifts on BOTH seeds 9820 + 9850 produce a
      tele('trust') event and/or a memory/gossip/ledger record
      carrying −20 and a reason, while trust delta stays exactly
      −20 and narration is unchanged (verbatim vs
      sim-caughtlift-b);
  (b) the ordinary-take caught path shows the same trace;
  (c) an 8-seed pilot band (competent-player policy, 100d
      death-aware cap, same seeds 10420–10427 before/after)
      completes 8/8 with no crash, lift calls reported, and wall
      numbers (national/table/wins, wave 4–5 reach, median
      survival) reported before/after.
- Seeds: 9820 + 9850 fixtures, plus 8-seed pilot band on identical
  seeds before/after. Before numbers: fixtures from
  sim-caughtlift-b (delta −20, narration PASS, trace FAIL on both
  seeds); band before from the same file (national 0/8, table 0/8,
  won 0/8, wave-4 reach 2/8, wave-5 0/8, median 100d cap-censored,
  lift calls 0/8 seeds).
- Harness: sim-harness loadGame/setupGame/runDays, seed before
  eval, full src/js list minus DOM-only files, Game.save never
  stubbed. Fixture coin forced only during the judged call.
- A miss is NO-GO, never re-scored mid-run; doubts go under
  "metric review" for the next run.

## THE FIX (scope: ONLY this)

1. src/js/abilityActions.js, 'thief.steal_pantry' caught branch:
   direct `v.trust[vid] = max(0, (v.trust[vid] || 15) - 20)` replaced
   by `game.bumpTrust(vid, -20, 'caught stealing from the pantry')`.
   The existing observe('caught_you_stealing') call and the
   narration line are untouched, verbatim.
2. src/js/game.js, takeFromPantry thief-caught branch: same direct
   write replaced by `this.bumpTrust(vid, -20, 'caught stealing
   from the pantry')`, and the branch now also calls
   observe('caught_you_stealing') (mirroring the lift path; the
   branch previously called no observe at all). Narration line
   untouched, verbatim. theftConfrontation still runs after, unchanged.
3. src/js/game.js, observe() action table: new entry
   `caught_you_stealing: { honest: -25, generous: -15, brave: -3,
   competent: 0 }` — the same dims as 'theft' (hands in a pack is
   the same act read by witnesses). Canon-safe: gossip/rep move
   only, never trust directly (trust ≠ reputation); the player's
   own −20 comes from bumpTrust alone, never double-moved (the
   roster loop excludes the player id).

## DECISION — the trust-default minor (stated, not silent)

Caught branches used `|| 15`; bumpTrust defaults undefined → 10.
CALL: route through bumpTrust as-is, do NOT pre-seed trust to 15.
Why: for a −20 loss the discrepancy is numerically invisible —
both paths floor at 0 for an unset villager (old: max(0, 15−20)=0;
new: max(0, 10−20)=0), and for every defined value the two are
identical (losses land whole under bumpTrust; no progressive
scaling applies to losses). No reachable trust value changes.
One additive side effect, disclosed: bumpTrust's milestone drama
(💔 crossing 50/25 down) can now fire when the player is at the
haven with a tile — the same visible-moment rule every other
trust loss already follows; it adds no narration line and changes
no number. In the fixtures it does not fire (no haven position).

## DECISION — observe entry, not a direct remember()

The task allowed an action-table entry OR a direct remember().
CALL: entry only. A pantry lift has no victim villager, and
remember() keys a memory onto one villager id — writing it under
the player's own id would be a self-memory no villager's
conversation ever reads (t2mem reads the villager being talked
to), so it would fake the trace without making the convo line
reachable. The durable trace is therefore: tele('trust') with
delta + reason on every caught lift/take, plus rep ripple and
gossip seeding whenever witnesses actually exist (seen-crime
rule: no positions/party → no witnesses → no gossip, by design).
RESIDUAL, STATED HONESTLY: the convoTopics line "I know about my
pack. Hands where I can see them, next time." still surfaces
only where a victim-keyed memory exists (the pack-theft path
already writes one); a pantry lift writes no victim memory, so
that line is still not reachable from a pantry lift alone. That
is a documented blank for a later run, not a claim in this one.

## RESULTS (filled after measurement)

Instrument: scripts/test-caughtlift-fix-b.js (this arm). Baseline
re-confirmed on the pre-fix tree first with test-caughtlift-b.js
--fixtures-only: trace FAIL on both seeds, exactly as
sim-caughtlift-b reported — so the after-numbers below are a true
before/after on identical seeds, not a re-run of old output.

### Fixtures — GO on all judged legs, both paths, both seeds

| Seed | Path | (a) delta | (b) narration | (c) durable trace |
|------|------|-----------|---------------|-------------------|
| 9820 | ability lift, caught | PASS 50 → 30 (−20), 400 kcal lifted, +400 inv | PASS verbatim | PASS tele('trust') {delta: −20, reason: "caught stealing from the pantry"} |
| 9820 | ordinary take, caught | PASS 50 → 30 (−20) | PASS verbatim | PASS same tele event |
| 9850 | ability lift, caught | PASS 50 → 30 (−20), 400 kcal lifted, +400 inv | PASS verbatim | PASS same tele event |
| 9850 | ordinary take, caught | PASS 50 → 30 (−20) | PASS verbatim | PASS same tele event |

No other villager's trust moved in any fixture
(otherTrustMoves empty) — the player's −20 is not double-paid.
Memory/gossip are still empty in the fixtures, by design: the
fixture has no positioned witnesses and no party, so the
seen-crime rule correctly seeds nothing. The tele event is the
durable trace in the fixture; the witness probe below proves the
observe leg is live when witnesses exist.

Controls (preservation claims hold):
- Clean lift, both seeds: trust 50 → 50, zero tele('trust')
  events, clean narration verbatim. The fix touches caught
  branches only; a clean palm still books nothing.
- Unset-trust caught lift, both seeds: trust unset → 0, exactly
  the old direct-write result (max(0, 15−20) = 0). The || 15 vs
  || 10 default question is settled by measurement, not just
  arithmetic: no reachable value changed.
- Witness probe (seed 9820, one positioned witness): direct
  observe('caught_you_stealing') moved witness rep honest 0 → −20
  (the −25 table dims at the 0.8 non-target witness weight) and
  generous 0 → −12, and seeded 1 gossip entry. Before this fix
  the same call was a full no-op (rep 0 → 0, gossip 0 → 0, per
  sim-caughtlift-b). The call site's promised social consequence
  now actually happens — but only for real witnesses, never
  broadcast to the whole village.

### Pilot band — 8/8 complete, no crash, wall numbers UNCHANGED

Competent policy, 100d death-aware cap, seeds 10420–10427:

| | Before (sim-caughtlift-b) | After (this run) |
|---|---|---|
| national | 0/8 | 0/8 |
| table | 0/8 | 0/8 |
| won | 0/8 | 0/8 |
| wave-4 reach | 2/8 (10421, 10423) | 2/8 (10421, 10423) |
| wave-5 reach | 0/8 | 0/8 |
| median survival | 100d (cap-censored; 7/8 survived cap, 10420 lost day 28) | 100d (identical: same 7/8 survived, 10420 lost day 28) |
| lift calls | 0 on all 8 seeds | 0 on all 8 seeds |

Per-seed after rows match before seed-for-seed (10420 days 28
village-lost wave 2; 10421/10423 wave 4; rest wave 2–3; arc 3 on
all 8). The only lift lines are the same GRANT lines as before
(10424, 10426 Level 1; 10427 Level 2 + stranger-teaches JACKPOT).
This is the expected no-regression signature, not a failure:
competent play never lifts (outflowzero-b, re-confirmed), so a
booking-only fix is unobservable in band play — the fixtures
carry the verdict, the band carries the no-regression proof.

No balance-panel compare is attached (standing panel exception,
stated not faked): scripts/balance-panel.js ingests its own
observer-driver per-seed corpora, not fixture-script output or
band aggregates; the judged comparison here is fixture
before/after on identical seeds plus the band wall numbers above,
which are the panel's own headline metrics reported directly.

### Regression checks on the changed area

- node --check clean on both edited files; no remaining direct
  caught-write (`|| 15` −20) in either branch.
- Targeted green-list trust/theft tests, run directly after the
  fix: test-takefrompantry-zero-trust-20261013 ALL GREEN,
  test-trustdeltas-20261014 46 passed / 0 failed,
  test-trust-news-witnesses-20261011 23 passed / 0 failed.
- Three green-list tests fail with the fix AND identically
  without it (verified by stashing only the two src files,
  re-running, and restoring via explicit stash@{0} pop; sibling
  stashes untouched): test-theft-givefood-20261007,
  test-social-progressive-trust-20261008,
  test-convo-engine-trust — all die in genRoster/harness setup,
  before any trust code runs. Pre-existing, not caused here.
- scripts/check.js --quick was run (observed progressing through
  its test sequence for ~17 min under heavy sibling load) but its
  final tail output was lost when the background session cleared;
  full-check green is therefore NOT claimed — the targeted
  results above plus the arm's own proof script are what is
  claimed. The coordinator's merge-time suite run is the backstop.

## VERDICT: GO

All pre-registered legs hold: (a) tele('trust') with −20 and a
caught-stealing reason on both seeds, both paths, delta exactly
−20, narration verbatim; (b) ordinary-take path same trace;
(c) 8/8 band complete with wall numbers reported before/after
(unchanged, as a booking fix should be). No metric re-scored.

## REACHABILITY VERDICT

Unchanged by this fix, by design: waves 1–5, Arc II/III/IV,
regional → national, the table, and the win flag are exactly as
reachable (or not) as before — the band's wave/national/table
numbers are identical seed-for-seed. This arm changes booking,
not reachability, and the band proves it moved nothing else.

## VILLAGE ASSESSMENT (plain words)

The village now remembers a caught theft in the one place that
matters for the game itself: its own record. Before, a caught
thief heard one anonymous hand close on their wrist, lost 20
trust, and then nobody — not the game, not a villager, not a
rumor — could ever point back to it. Now the −20 is written
down with its reason ("caught stealing from the pantry"), so
any later system that reads the trust record can see what
happened and why. And when someone actually saw it happen, the
village now reacts the way the old code pretended it did: the
witness thinks worse of you, and the story starts travelling as
gossip. What still isn't true: no villager will bring it up in
conversation from a pantry lift alone, because a pantry lift has
no single victim to remember it — that line ("Hands where I can
see them, next time") still belongs to being caught with your
hand in someone's own pack, which already writes that memory.
The blank this arm closed was the booking blank; the
conversation blank for pantry lifts is documented below, not
claimed closed.

## METRIC REVIEW

No metric re-scored; the pre-registered legs held as written.
Two notes for the next run: (1) leg (c)'s record list should
name the message-log ring explicitly (carried over from
sim-caughtlift-b's review) — it would not change this verdict,
since the log holds the sentence, not a booked move, and the
tele event now books the move regardless; (2) a future run that
wants the pantry-lift convo line reachable needs a prereg leg
about victim-keyed memory design (who remembers a victimless
pantry theft?), which is a design question for Steve, not a
measurement tweak — flagged for the findings backlog, not
answered here.

## SENSE NOTE

Read the transcripts, not just the counts. The caught-lift
transcript is unchanged word-for-word — the fix adds no new
sentence, and that is the point: the village already said the
right thing ("The pantry remembers") while remembering nothing.
Now the sentence is true. The witness probe's numbers read
sensically too: a witness who saw a theft thinks of you as less
honest (−20) and less generous (−12), not as a different person
entirely — a cooled opinion, not a condemnation. And the clean
lift still says nobody saw, and books nothing — a thief who got
away clean leaves no trace, which is the honest version of the
same rule. No dialogue was read from band play because competent
play never lifts; the band's grant lines are the same learned-
ability announcements as before, not lifts, and are not counted
as such anywhere in this file.

## NEW BLANK (for the findings backlog)

- Pantry-lift convo line still unreachable from a pantry lift:
  the convoTopics "I know about my pack" line keys on a
  victim-keyed 'caught_you_stealing' memory, and a pantry lift
  has no victim. Booking is now fixed (tele + witness rep/gossip);
  the conversation reachability question (who should remember a
  victimless pantry theft?) needs a design call before any work.

