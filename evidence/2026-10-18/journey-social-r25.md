# Journey social r25 — dry-line grammar fixes (2026-10-18, lane B)

## Pre-registration (written before the pilot ran)
- **Leg question**: when a conversation runs out of content — mid-thread or at
  the end — does the engine stay human (one honest exhausted line, then a pivot
  or temperament winddown) or strand the player in dead air?
- **Interesting-finding bar**: a transcript showing 3+ dead-air NPC lines in a
  row with the player still offered 'more'/reacts; or a "Sure." ->
  "lost my train of thought" on a live thread.
- **Binding (pilot)**: P1 gap-exhaust-streak (>=1 convo with >=3 dead-air NPC
  lines in a row and no winddown), P2 gap-react-dry (>=1 react pick on a live
  thread answered with deflection/exhausted class), P3 gate/end-class (>=25% of
  convo-final NPC lines deflection/exhausted rather than winddown/beat).
  Any GO -> the gap is real -> fix. All miss -> document and move on.
- **Seeds**: 1701, 1702 (same-seed before/after vs the r24 pre-fix pilot),
  1801, 1802 (fresh). Horizon DAYCAP=60, death-aware. Policy: 'deep' driver
  (answer questions, 'more' to exhaustion, fresh topics, reacts, leave last)
  + favoritism wrapper (2 favorites kind, 2 outsiders hostile/theft every 5d).
- **Note**: this run inherited r24 from a dead prior run of this same loop
  (stale-lock recovery — lock 17:55:47Z, registry heartbeat 18:12:07Z, 43 min
  stale at check; lock deleted, run note records it). The dead run's
  uncommitted conversation fixes were adopted, re-verified RED->GREEN in this
  run's tree, and landed here.

## What was found and fixed

### Adopted: r24 orphan fixes (dead run's work, verified here)
1. **Per-sitting self-block** (conversation.js): the no-repeat self-block read
   the flat `c.saidLines`, which persists across sittings — goodbye/silence/
   subject-change lines said days ago blocked their own repeats forever and
   fell back to deflection dry lines ("...Sorry, lost my train of thought."
   AS a goodbye). Now reads per-sitting `c.saidLinesConvo`. Proof:
   `scripts/test-sitting-repeat-20261018.js` — RED 3/6 pre-fix (T1/T2/T5 fail
   with the exact wart), GREEN 6/6 post-fix.
2. **Invite-accept honesty** (betrayal.js): the accept outcome rode the
   inviteBeat diegetic-act exemption (was: "Sure." -> "lost my train of
   thought").

### r25a: mood-silence is grammar (NEW this run)
Single player silences were answered with dry-line deflections even on fresh
sittings (turn-0 silences: "d26 Miriam t0 <silence>", "d32 Katarina t0
<silence>"). Root cause: mood-silence lines are stage directions
("The silence stretches a beat too long"), not content — but the run-ledger
anti-parrot block treated them as content. Fix: the mood-silence turn sets
`structuralTurn` (same exemption as the r17 resume/recap beats); per-sitting
ledger still applies. Proof: `scripts/test-silence-grammar-20261018.js` —
RED 2/4 pre-fix, GREEN 4/4 post-fix; T3 control confirms content lines still
run-block.

### r25b: betrayal outcomes are diegetic acts (NEW this run)
Pre-existing blank, surfaced in every pilot: betrayal-menu outcome labels are
FIXED STRINGS ('Said. Now it's theirs to carry.', 'The moot is called...',
'Your question hangs in the air...') firing once per case — the run ledger
false-positived them as parroting whenever two cases resolved inside the
48-entry window (pre-fix pilot: tellside 13 + askheard 12 streak-picks).
Fix: `betrayal.js finish()` passes `{ diegeticAct: true }` (generalizing the
r24 inviteBeat exemption); `sayLine` honors it via the diegeticAct alias.
Game logic already guards true repeats (tellSide's toldSide). Proof:
`scripts/test-betrayal-diegetic-20261018.js` — RED 2/3 pre-fix (T2 fails with
the exact wart), GREEN 3/3 post-fix.

### r25c: goodbyes are grammar (NEW this run)
`<leave>` picks produced deflection-class farewells ("...Actually, forget it."
AS the goodbye) when the 3-line exit pools hit the run ledger. Fix:
`endConvo`'s goodbye emission passes `{ structural: true }`. Proof:
`scripts/test-goodbye-grammar-20261018.js` — RED 0/2 pre-fix, GREEN 2/2
post-fix. (First version of the test wasn't sensitive — polluted the wrong
pool index; fixed to pollute all three exit lines, then RED verified.)

## Before/after (deterministic pilot — byte-identical across repeat runs)

| seed | deflection endings pre -> post | beat+winddown pre -> post | P1 streaks | P2 react-dry |
|------|-------------------------------|---------------------------|------------|--------------|
| 1701 | 47 -> 27 (-43%) | 12 -> 32 | 23 -> 1 (-96%) | 17 -> 0 (-100%) |
| 1702 | 46 -> 14 (-70%) | 13 -> 26 | 22 -> 1 (-95%) | 22 -> 1 (-95%) |
| 1801 | - -> 30 (fresh) | - -> 29 | 0 | 1 |
| 1802 | - -> 24 (fresh) | - -> 35 | 0 | 0 |

The betrayal class is gone entirely (no betrayal picks in any residual streak).
Residual (documented, not fixed): 2 streaks + 2 react-dry in 236 conversations —
`ask:lately` / `alive:event:show` topic beats hitting the run-ledger block when
the day's news is re-asked across villagers. That's the ledger doing its
designed job on CONTENT lines (two villagers sharing the day's news); the
honest fix is a "you've probably heard" framing in the lately machinery, not a
ledger exemption — queued for r26.

## Village assessment (plain words)
Four mid-run villages (day 44-54 snapshots, 8-9 of 12 alive): Natalie died
day 17 (1701), Aurora Nikolaev and Marvin Gallagher day 42 (1701), Aaron
Peters/Emilio/Palesa days 8-17 (1801), Bessie Joshi day 7 and Mukhtar day 32
(1802). 217 conversations driven, 118 of them deep (multi-exchange). The
living talk about sides forming ("Everyone's choosing sides and pretending
they aren't"), ask the player direct questions (trade, fears, trust), remember
what they were told, and close warm when it went well. Nobody is stuck
repeating themselves anymore; the dead air that used to eat ~80% of
conversation endings is down to roughly half, with beat/winddown endings now
the majority on 3 of 4 seeds.

## People check (sense-testing law — full transcripts read)
- **Tashi (1701)**: opens asking the player's trade, hates the sides forming,
  wants "something to DO together", fears "waking up alone", winds down
  warm. A person with a view and a want. 2 dry lines in 12 turns (down from
  streaks of 3+ pre-fix).
- **Miriam (1702)**: opens "Is there someone here you don't trust? Be
  honest." — an intel want with an edge ("something curdled"); "Noted. I'll
  watch too" (alliance consequence); fear "forgetting faces"; quirk "smells
  food before eating when the fear gets loud". A person.
- **Nathan (1802)**: shy stranger ("not good at the talking-to-strangers
  part"); the one deflection in his transcript reads as character, not bug.
Verdict: villagers act like people — they want things, remember, have
opinions about the village, and end conversations like humans. No fabricated
shared history, no filler loops observed in the read transcripts.

## Reachable / fun / winnable (social leg)
- **Reachable**: yes — conversations fire from day 1 off the Talk button;
  the pilot reached deep threads (goal/past/village/plans), betrayal beats,
  invitations, and moots by day 60 on all seeds.
- **Fun**: yes, with the fixes — transcripts read as real people; the
  pre-fix dry-streak rate (a deflection ending on ~80% of conversations)
  would have strangled it.
- **Winnable**: social play progresses the run (trust, bonds, intel,
  invitations); no social-leg softlock observed. Full-run (140d) social
  arcs not yet measured — r26.

## Metric review (§14)
Pre-registered bindings held: P1/P2/P3 all fired pre-fix (gap real), and the
fixes moved every bound metric in the predicted direction on same-seed
re-runs. No mid-run re-scoring. Proposed for r26: add a "dry lines per 12
turns" rate metric (the streak binding under-counts distributed dryness), and
a lately-reframe metric for the documented residual.

## Regressions
- Green-list convo: 13/13 pass. Betrayal: 2/2 pass. Social: 46 pass, 3 fail —
  all 3 fail identically on clean HEAD (pre-existing: test-social-animals
  clean-miss text, test-social-play liars branch, test-socialite-r8-deadends
  stranded menu).
- test-convo-mood.js fails identically pre/post (old eval boilerplate lacks
  the Phase 2 resolver — pre-existing, noted).
- test-resume-repair-r17: 9/10, the 1 failure pre-existing.
- test-convo-norepeat-fallback: 10/10.

## Telemetry
`telemetry-check.js` against `telemetry-baselines/social.json`: LOUD lines
are instrument mismatch (that baseline tracks qa.* from an older harness;
this pilot tracks dry-line classes) — explained, not a bug; baseline left
untouched. Seeded `telemetry-baselines/social-dryline.json` (post-fix, 4
seeds: p1.streaks=2, p2.reactDry=2, deflection=95, beat=65, winddown=57) for
future runs.
