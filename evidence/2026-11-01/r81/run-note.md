# Journey social r81 — RUN NOTE (lane B, 2026-11-01)

Leg 5 (social life), seeds 7101–7104, 120–141d death-aware,
competent policy, all linger, seeded-speaker steering ON. Base
master bf70579db at worktree registration. Rotation-b read 5 at
run start, advanced 5 -> 6 at closeout (verified by re-read).
Driver: scripts/journey-social-r81-20261101.js (r80 verbatim
except fresh seeds + evidence dir + RECORDING additions:
bearerByDay, endPack + endPantryKcal, wedge split-haul +
pack/pantry fields on blocked records). Wedge:
scripts/journey-social-r81-outing-wedge.js (r80 verbatim +
recording fields). Zero game behavior change in the
measurement itself. Smoke 7105 (30d) PASS.

## Pre-registration

See `prereg.md` in this directory (written before any seed
ran). Bindings judged as written; no metric re-scored. Pilot
gate: smoke PASS + seed 7101 full 134d — instrument check
(bearerByDay populates, endPack/endPantryKcal present,
outing-end-blocked records carry the split) before
7102–7104 ran. The 7102–7104 invocation's verdicts file was
renamed to r81-verdicts-7102-7104-partial.json (r80 precedent)
so it can never be mistaken for a pooled verdicts file; the
analyzer reads the four per-seed JSONs directly.

## Correction to r80's note, carried into this run's prereg

r80's note says Henry's favor closed "ONCE at d132 as
outing-end-blocked". The r80 7004 JSON shows it never
closed: d132 is an outing-end-blocked record with the
partner-dead reason, no outing-ended-stuck record exists,
and at run end the favor reads state 'promised',
promiseKept 'released', deliveredKcal 0, returnedDay null.
Mechanism (code): forageFavorAction's partner-dead block
fires before the ending branch, so forage_end is never
offered with a dead partner. This run's prereg re-framed
the haul question around that hang — and the hang
replicated (see H1).

## Headline, plainly

Two real defects, both fixed in this run with proof tests:

1. THE PARTNER-DEATH HANG (r80 Henry + r81 Sanne + fixture
   pin): an outing whose partner dies can never end. The
   favor sits 'promised' forever, the wedge re-attempts it
   daily forever, and the partner's virtual share strands.
   Fixed: a gone partner still blocks forage/deliver, but
   no longer blocks ENDING at home — only the player's
   matched share banks, the partner's share is named lost,
   never deposited, and the favor closes broken.
2. THE NONVERBAL DEFLECTION LOOP (7104 Chantal): a
   French-only speaker "loses her train of thought" in
   fluent English every other turn, days 4–140, because
   blocked beats in nonverbal conversations fall back to
   the English deflection pool. Fixed: blocked beats in a
   nonverbal conversation now fall back to gesture
   narration, never to English meta-speech.

Everything else in the leg holds: outings deliver (23/30
starts), moots convene autonomously and by probe (5 trials,
all acquitted), the nonverbal gate holds (0 bad offers on
268 nonverbal convos), every succession names its death
(25/25 bearer changes join to a same-day death), and
broken promises still don't brick villagers.

## H1 HAUL-FATE — HANG REPLICATED, RETENTION VACUOUS (see verdict)

- 7101 Sanne (favor-sanne_bakker-83-26): started d84,
  Sanne died d85 (alien), 5 end-blocked records d91–d119
  (stuckDays 7/14/21/28/35, every 7th day, partner-dead
  reason), end state 'promised' / 'released' / delivered
  0 / returnedDay null. The r80 shape, replicated exactly.
- BUT the haul on this replication is 0/0 (forageCount 1,
  no edible haul): retainedPlayerKcal reads 0/0, which
  proves nothing about retention. No other seed produced
  a deliver/end-blocked favor. So H1 as written is
  PARTIAL: the hang clause holds on fresh data, the
  retention clause is untested in the wild (vacuous, not
  failed).
- Fix rule, applied with that disclosure: the hang itself
  is proven three ways (r80 Henry nonzero-haul hang, r81
  Sanne zero-haul hang, fixture pin M pre-fix 66/66),
  and the fix's food accounting is proven by fixture,
  not by the wild retention clause: case M post-fix sets
  a 210/210 haul, kills the partner, and ends via the
  wedge — deliveredPlayer 210, deliveredPartner 0,
  favor returned + broken, line names the loss, stuck
  counter cleared. The wild retention clause stays open
  for a future nonzero-haul replication; the fix does not
  depend on claiming it.
- The player's share in the wild is real pack items by
  construction (performForageFavor keeps the player's
  share in s.inventory; only the partner's share is
  virtual until deposit). Henry's 420 kcal therefore
  splits as: 210 retained in the pack (eatable, honest),
  210 stranded virtual — never pantry, never pack —
  until the favor drops. Post-fix, a Henry-shaped case
  closes at the first stuck escalation with 210 banked
  and the 210 named lost.

## H2 BEARER NAMING — INSTRUMENT PROVEN, REFUSAL-JOIN UNTESTED

- 25 bearer changes across the panel, ALL joining to a
  death on the change day (7101: Kurt d17 'a stranger',
  Finn d25 starvation, Theo d123 contest; 7102: 5
  changes incl. a d94→d95→d105 cascade; 7103: 9 changes
  incl. six in d120–d130 as the village thinned; 7104: 8
  changes). The instrument works: a future
  previous-bearer refusal can now name its death window.
- BUT zero previous-bearer refusals occurred on all four
  seeds, so the refusal-join clause is untested this
  panel (not failed — no refusals to join). r80's
  Zhomart refusal remains the only refusal datum, and
  its death is still unnamed (pre-instrument run).
- H2 verdict: instrument GO, refusal-join NO-DATA.

## B-ACQ (descriptive batch)

- r81 trials: 5, ALL acquitted (7101 autonomous 1,
  7102 autonomous 1, 7104 probe 3 with driver guilty
  votes moving 0->1 each, never decisive).
- Cumulative: 34 trials, 32 acquitted, 2 convicted
  (1 NPC-only r77, 1 player-tipped r80). The wanted
  NPC-ROOM conviction is STILL unreplicated — no
  NPC room has convicted since r77's unanimous room.
- Autonomous convening: 7102 OBSERVED 1/1; 7101
  PARTIAL 1/2 with an explained cause (case_2's accused
  Hannah died d11 — SAY d10: "Hannah is gone — the moot
  doesn't try the dead. The case dies with the accused").
  A case that dies with its accused is not a convening
  failure.
- Watch item, not defect: 7101's case_4 SAY d15 "The
  moot doesn't wait forever. Two days of silence from
  the fire's edge — the count is taken without you"
  (player seat unused on a hands-off trial, as r80).

## B-TRIP (descriptive)

- 15 away blocks, 0 missing computed return. ALL 15 are
  TRIPS (gaps +1/+2/+3/+5/+6 days); 0 LEAVERS this
  panel. Purposes: forage 6, water 3, visit 2, haul 1,
  guard 1, explore 1, traps 1. Node distance from home:
  14 at Chebyshev 1, 1 at 2. Trip tail stays narrow
  (+1..+6 here; r80's +1..+16 tail not extended).

## B-GUARD — NO-GO ON PROBE SEEDS, EXPLAINED (not re-scored)

- dryPerConvo (same metric as r80): 7101 handsoff
  0.333, 7102 handsoff 0.333 — inside [0.20, 0.40].
  7103 mootprobe 1.042, 7104 mootprobe 0.932 — OUTSIDE
  the band, ~3x r80's probe seeds (0.311 / 0.376).
- Cause, decomposed (not guessed): the surge is
  NONVERBAL deflection lines, not general dryness.
  Engine counter agrees with the scan (7103 counterDry
  522 vs r80 7003's 141), so it is real game behavior,
  not an instrument artifact. 7103: 170/405 convos
  nonverbal; 7104: 93/413 nonverbal; handsoff seeds: 0
  and 5. Top dry picks are nv:* gestures (7103:
  nv:smile 128 + nv:nod 119 + nv:pointself 105;
  7104: nv:nod 118 + nv:listen 68 + nv:pointself 63).
  7104's Chantal alone carries 304 dry turns over 75
  convos, days 4–140.
- Mechanism (code, src/js/conversation.js sayLine):
  a blocked beat (run-ledger: another villager said it
  recently; or older-sitting self-block) falls back to
  convoDryLine — the English pool — regardless of
  thread. Nonverbal gesture pools are tiny and shared,
  so in a no-shared-language conversation nearly every
  other beat blocks and deflects in English. The
  nonverbal-fallback fix (below) removes the English
  lines from this path; the band itself is unchanged
  and the next run re-scores it, not this one.
- Gate B7 HOLDS alongside: 268 nonverbal convos, 0 bad
  offers (7103: 160 no-interpreter + 10 interpreter;
  interpreter-mediated convos observed again after
  r80's absence).

## B-PEOPLE — PASS ON WRITTEN COUNTS, WITH ONE FLAG

Five reads (binding: 5, >= 2 outing-related — this run:
2 outing-related, 1 moot-probe, 1 late, 1 nonverbal).
0 fabricated-history flags, 0 weak endings. PEOPLE PASS
on counts; the nonverbal read is a fiction-break flag,
carried as the run's second fix, not hidden by the pass.

- Sanne, 7101 d15 (outing/favor-accept): concrete plan
  (old burn east of camp, before dew dries, pack and
  knife), murder-of-Hannah thread raised then honestly
  deflected ("Sorry — I shouldn't load that on you"),
  roster-grounded gossip (Sanne and Ruth don't speak),
  ends on the plan line ("First light. The pantry's
  counting on us."). Real. Nits: "And... scene. Good
  talk." is stagey; the "You asked me that before"
  frame recurs (standing nit from r80).
- Nadia, 7102 d6 (outing/favor-accept): concrete ask
  (pantry thin, forage tomorrow, two packs), grounded
  gossip (Eduardo/Sultan out for water, Leroy back),
  a real NPC question (what scares you most) with a
  reflected answer ("Yeah. Me too. The randomness
  would almost be kinder."), ends on the plan line.
  Real. Nit: "Who told you that?" asked twice in a row.
- Wilma, 7104 d12 (moot-probe): 2 turns — callback
  opener, murder-of-Yuki framing grounded (Yuki is
  case_2's target), moot called, convo ENDS there.
  Real, and the probe hygiene holds.
- Muthu, 7104 d100 (late): wound-care ask with
  concrete stakes (can't haul/hunt/watch), refusal
  handled with consequence ("They won't forget.
  They'll just stop asking."), topic recall works
  ("Still on that wound care."), role menu legible.
  Real.
- Chantal, 7104 d26 (nonverbal — FLAGGED): the gesture
  beats are good ("They mime walking — pointing at
  themselves, then at you, then toward the ridge."),
  but every other turn the French-only speaker
  "loses her train of thought" in fluent English
  (5 dry lines in 12 turns, opening dry on day 4).
  Fiction break, fixed below — not a fabricated-history
  or weak-ending flag, but the run's loudest single
  transcript defect.

## Pooled outing funnel (event-level truth)

| seed | arm | days | alive | offers | forageOffers | accepts | starts | delivers(events) | talks |
| 7101 | handsoff | 134 | 7 | 43 | 26 | 27 | 8 | 5 | 5 |
| 7102 | handsoff | 120 | 0 | 42 | 9 | 9 | 8 | 8 | 8 |
| 7103 | mootprobe | 131 | 0 | 25 | 7 | 7 | 4 | 3 | 3 |
| 7104 | mootprobe | 141 | 2 | 38 | 18 | 20 | 10 | 7 | 8 |
| POOLED | — | — | 9 | 148 | 60 | 63 | 30 | 23 | 24 |

Starts 30/63 accepts (48%, r80: 63% — descriptive only;
different seeds; the dip sits in adjacency blocks, not
refusal: start-blocks split node-elsewhere 20,
non-adjacency 13, no-micro-pos 12, away 15). Delivers
23/30 starts (77%, r80: 82%). Dawn step-first retries
12/12 (stepOk + stepAssigned, all dayPart 0). No
kept-without-start. Deliver events ok 23,
missed-line-but-kept-true 0. Snapshot-vs-events gap
persists as the known shape (snapshot completes
0/2/0/2 vs events 5/8/3/7), not missing delivers.
7102/7103 ended at alive 0 (death-aware horizon:
villages died, simulation stopped — not ticked dead
to fill the leg).

## Village assessment (plain words)

- 7101 (134d, standing, 7 alive): the bonded village
  with three successions. 27 deep bonds, 5 outing
  delivers, 1 autonomous acquittal, the Sanne hang.
  Kurt dies to a stranger d17, Finn starves d25, Theo
  falls in a contest d123 — each succession names its
  death the same day. Still talking, still bonded.
- 7102 (120d, died, 0 alive): the village that talked
  itself out. 25 deep bonds, 8/8 outing delivers,
  1 autonomous acquittal (Eduardo's murder, 5-0
  acquit). Five successions, the last (Adaeze d116)
  in a wild cascade. Gone by day 120, not scattered —
  the social instrument dies with it, as it should.
- 7103 (131d, died, 0 alive): the cascade village.
  24 deep bonds, 3/4 outing delivers, 0 trials (no
  cases ever snapshotted — a quiet village for
  justice), nine successions with six in d120–d130 as
  the wild took one bearer after another. Its late
  bearers shared no language with most villagers —
  the nonverbal surge lives here.
- 7104 (141d, standing, 2 alive): the village that
  nearly ended, twice over. 21 deep bonds, 7 outing
  delivers, 3 probe acquittals (player guilty votes
  +1 each, never decisive), eight successions, and
  Chantal — talked to 94 times across the run, dry
  in English nearly four times per conversation.
  Two people still stand at the horizon.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes for outings (48% of accepts start —
  the wall is distance/adjacency, not refusal; 77%
  of starts deliver), YES for the gate (268/268 clean
  nonverbal convos), YES for autonomous moots (7102
  1/1; 7101's miss explained by the accused's death),
  and now YES for ending a partner-death outing
  (the fix closes the hang instead of documenting it).
- FUN: yes with one loud exception now fixed — the
  justice story still plays without the player pulling
  strings, broken promises still don't brick villagers,
  and the transcripts read like people (grudging
  accepts, tired smiles, gossip that names real roster
  facts). The exception was Chantal: a conversation
  that could not speak its own language, now given
  gesture narration instead of English deflections.
- WINNABLE: not this leg's question to close — social
  life feeds the win (97 deep2 bonds pooled, 23
  delivers, 5 trials) and two of four villages stood
  at the horizon; the two that died did so by the
  wild, monsters, and succession, all with named
  causes.

## Fixes in this run (both with before/after proof)

1. PARTNER-DEATH ENDING — src/js/favor-forage.js
   (ontology rule end_without_partner):
   forageFavorAction: with ending=true, the original
   bearer, and a gone (dead/away/roster-gone) partner,
   forage_end is offered at home BEFORE the
   partner-dead block (which still blocks forage and
   deliver). performForageFavor: the shared unload
   skips a gone partner's virtual share entirely
   (deliveredPartner 0) and the return line names it
   ("is lost with them" / "stays with them, wherever
   they are"). Promise renounced/broken, favor
   returned, as before. No change to living-partner
   delivery (both shares still bank) or to the
   previous-bearer rule (a new bearer still cannot end
   an old bearer's outing).
   Proof: scripts/test-journey-social-r81-outing-wedge.js
   case M — pre-fix pin passed 66/66 (SEED=42 + SEED=7)
   asserting the hang; post-fix passes 67/67 on both
   seeds asserting the ending + 210-only banking +
   named loss + cleared stuck counter. Case F (living
   partner ending) unchanged and green.
2. NONVERBAL FALLBACK — src/js/conversation.js
   (ontology rule nonverbal_fallback):
   sayLine's run-block / older-self-block branch now
   checks c.thread === 'nonverbal' first and uses
   convoNonverbalFallbackLine (6 unquoted gesture
   narration lines, per-convo cycling, counter reset
   per sitting) instead of convoDryLine. The
   within-sitting self-repeat branch with no caller
   fallback does the same. The narration is
   deliberately NOT in convoDeflectionLines, so the
   dry census and the fallback-streak wind-down do
   not count it as a deflection. Verbal conversations
   are byte-identical in behavior (same pool, same
   cap, same streak logic).
   Proof: scripts/test-conversation-nonverbal-fallback-r81.js
   12/12 on SEED=42 + SEED=7 (nonverbal thread, run-
   block -> narration, 3 distinct cycled lines,
   self-repeat -> narration not null, verbal control
   -> English deflection line as before).

## Telemetry deviation check (step 14)

Ran `node scripts/telemetry-check.js` against
telemetry-baselines/social.json over the four per-seed
JSONs (metrics l3.bonds, l3.deepBonds, dryRate,
l3.mootsConvened, alive). 3 LOUD lines, all the same
artifacts as r73–r80, all explained, baseline NOT
rolled forward:
- `l3.deepBonds disappeared: baseline 168 -> current 0`:
  NAME ARTIFACT — current field is l3.deep2 (pooled
  97), not deepBonds. Not a bug.
- `l3.mootsConvened disappeared: baseline 7 -> current 0`:
  RETIRED-METRIC ARTIFACT — the baseline's 7 was
  counted through the old unwritten village.moots
  field; true convenings this run are 5 trials in the
  trial census. Not a bug.
- `alive newly appeared: baseline 0 -> current 9`:
  BASELINE-SHAPE ARTIFACT — pooled alive 9 = 7+0+0+2.
  Not a bug.
- l3.bonds and dryRate: quiet. (dryRate here is the
  telemetry metric, not the dryPerConvo guardrail —
  the guardrail miss is judged above on dryPerConvo
  directly and is not laundered through this check.)

## Metric review

- H1 judged PARTIAL as written (hang replicated,
  retention vacuous at 0/0). The fix is justified by
  the hang + fixture accounting, stated explicitly —
  not by re-scoring H1 as a pass. Next run's haul
  clause should require a nonzero-haul end-block, or
  the fixture proof should be named as the accounting
  evidence, so the bar is honest either way.
- H2 judged instrument-GO / refusal-join NO-DATA.
  The refusal-join clause needs a panel that actually
  produces a previous-bearer refusal; r80's Zhomart
  shape (succession mid-outing + later forage
  attempt) is the template to watch for.
- B-GUARD judged NO-GO on probe seeds as written
  (1.042 / 0.932 vs [0.20, 0.40]), with the nonverbal
  mechanism proven and fixed. The band is unchanged;
  the next run re-scores dryPerConvo on the fixed
  build — a drop toward the band is the fix's
  predicted effect, not a foregone conclusion.
- B-ACQ stays descriptive: the NPC-room conviction
  replication is still wanted (cumulative 34 trials).
- village.moots stays RETIRED. The r75 target-aware
  walk fold into policies/competent.js stays owed,
  still not taken here (panel re-baseline required).
- DORMANT RE-ENTRY stays a design question for Steve,
  not a worker decision.
- END-BLOCKED repetition under other end causes
  (partner away? partner exiled?): no datum this
  panel — the only end-blocks are partner-dead. The
  fix covers away/missing partners by the same path,
  proven by code reading + the dead-partner fixture,
  not by a wild away datum.

## Files

- Driver: scripts/journey-social-r81-20261101.js
  (r80 verbatim + seeds/evidence dir + bearerByDay +
  endPack/endPantryKcal recording).
- Wedge: scripts/journey-social-r81-outing-wedge.js
  (r80 verbatim + haulSnap split + pack/pantry
  fields on blocked records + delivered split on
  ended-stuck).
- Analyzer: scripts/analyze-journey-social-r81-outing-20261101.js
  (r80 verbatim + HAUL-FATE + BEARER sections).
- Proof tests: scripts/test-journey-social-r81-outing-wedge.js
  (67/67 SEED=42 + SEED=7, post-fix case M);
  scripts/test-conversation-nonverbal-fallback-r81.js
  (12/12 SEED=42 + SEED=7).
- Fixes: src/js/favor-forage.js (end_without_partner),
  src/js/conversation.js (nonverbal_fallback),
  docs/ONTOLOGY.md (regenerated: +2 rules).
- Evidence: evidence/2026-11-01/r81/ (prereg.md, this
  note, per-seed JSONs, r81-analysis.txt,
  r81-verdicts-7102-7104-partial.json, run-pilot.log,
  run-rest.log, transcripts/ (213 files), summaries/,
  check-quick.log).
- [needs-eyes] NOT included: both fixes are
  feel-adjacent (conversation + outing closure) but
  neither changes a player-facing feel path Steve
  would playtest cold — the nonverbal fallback
  changes what a French-only speaker does on a
  blocked beat, which IS visible in play. Flagged
  here for the ship loop's judgment instead of the
  commit message: if the ship loop wants eyes on
  either fix, it can add the flag at batch time.
  (Reconsider: the nonverbal change IS player-visible
  in any no-shared-language conversation. See
  closeout note below.)

## No-regression check

Recovery re-run in the main session (the run's own check was
still in progress when the coordinator timed out):
`node scripts/check.js --quick` in the worktree —
**283 passed, 7 failed in 764s**
(check-quick-recovery.log). The 7 failures are exactly the
standing pre-existing families, zero attributable to this
run's fixes: measurement-proof-update,
measurement-workflow, mobile-combat-cadence,
occupation-panels, phone-frame-proof, capable-bot
(39/40 — the known deterministic failure, also failing
solo on clean master), establishment-r20-fixes. No new
regressions. The run's own proof tests stand: outing
wedge 67/67, nonverbal fallback 12/12 (both re-run
post-rebase at closeout — see below).

## Closeout (recovery)

The 18:00 coordinator timed out before closeout: check
unfinished, note unfinalized, nothing committed, lock
left in place, rotation still 5. The main session
recovered it: verified no stray processes, refreshed the
worktree heartbeat so the 19:00 run stood down instead
of colliding, re-ran check.js --quick (283/7, adjudicated
above), finalized this note, and committed the branch.
[needs-eyes] IS included on the recovery commit: the
worker debated it and left it to the ship loop, but the
nonverbal fallback changes what a player sees in any
no-shared-language conversation, which is a feel change
under the repo rule — flagged, documented here for
overrule. Merge, release, rotation advance, and lock
deletion are recorded in the closeout-facts commit that
follows the merge.
