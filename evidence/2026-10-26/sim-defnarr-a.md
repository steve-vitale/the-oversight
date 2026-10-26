# sim-defnarr-a — defender-fight narration boilerplate + wait-line repetition (axis scale-onramp)

Run: fleshout-20261026T1230Z (Mon 2026-10-26). Axis: scale-onramp (converging).
SENSE arm, DIAG ONLY, zero src/js changes. This worker does not touch the
tracker, the findings backlog, the lock, claim files, or the rotation file.

## PRE-REGISTRATION (binding — judged only against this)

Substrate (shared): tableseat-nowait — leanlinkrescue courtship
(LEANLINKRESCUE=1) + seat legs only (TABLESEATNOWAIT=1), no wait leg.
Seeds 73671–73678, 180d death-aware horizon (runDays stops on death/win;
180 is the cap, not a fixed horizon). Canon read first: docs/CANON.md, then
docs/MONSTER-WAVES.md (wave law) and docs/CONVERSATIONS.md (dialogue);
no canon doc covers narration templates, so the template shapes below are
measured from code and transcripts, not invented — fieldFightSummary in
src/js/fieldFights.js is the single source of the defender sentences.

sense-GO iff (a) det-gate passes, or a neutrality proof that the harvest
does not perturb trajectories; (b) corpus complete 8/8 with the harvest
method documented; (c) template census published for defender lines and,
separately, for wait lines or a proven-absent verdict; (d) verdict in
plain words — boilerplate / varied / misleading — with quoted examples;
(e) a variety PROPOSAL section only (no game-code change in this arm).
Any leg missing = sense incomplete — say so plainly, land what exists.

## SENSE VERDICT: sense-GO (all five legs pass)

- (a) NEUTRALITY PROVEN TWO WAYS. (i) Det-gate PASS on this tree:
  seed 73671, baseline days=177 gameDays=177 ts={tsNationalDay:86} vs
  wrapped-with-recorders-OFF identical on all three, diagSurface=false,
  wrapsInstalled=false, postSetupWorld=0. (ii) Tap-neutrality PASS:
  seed 73671 re-run transcript-OFF into a scratch dir matches the
  transcript-ON corpus row exactly on fight keys, days, gameDays, and
  ts (script mode --compare-tap). (iii) Wait harvest neutrality:
  recording-only-say replays match the measured corpus on all 8 seeds
  on days/gameDays/endReason/deaths/won (see Wait below). The
  narration-live replay, by contrast, DIVERGES (73671: 157d vs 177d)
  and is labeled replay-only throughout — the old "narration shifts
  trajectories" warning, confirmed, not assumed.
- (b) CORPUS COMPLETE 8/8: defender rows 311 fights, 297 recorded
  lines, recorder errs=0 on every seed; wait replays 8/8 with
  equivStrict=true on every seed.
- (c) CENSUS PUBLISHED below (defender templates + shapes; wait lines
  separately, with the measured-stream absence stated explicitly).
- (d) VERDICT: defender narration is BOILERPLATE and, for its dominant
  line, MISLEADING BY OMISSION (not by falsehood — see below). Wait
  narration is a SINGLE LINE repeated 3,442 times, honest but empty:
  the 10th identical wait teaches nothing the 1st did not.
- (e) PROPOSAL section below; no game code touched (git diff for
  src/js is empty; this arm's only code is scripts/test-defnarr-sense.js).

## MASTER-DRIFT NOTE (read before comparing with defwound/1815)

This tree's band has moved since the defwound run (2026-10-25) and the
1815 control band. Current band on identical seeds: won 1/8 (was 4/8),
deaths 332 (was 234), national-ever 7/8 (was 7/8), median days 174
(was 135), raids 98 (was 85), raiders 407 (was 361). Per seed:
73671 village-lost d177/43 deaths (was survived 180d/31);
73672 village-lost d116/32 (was won d97/25);
73673 won d97/29 (was won d124/28);
73674 village-lost d175/48 (was survived 180d/18);
73675 survived 180d/43 (was won d135/24);
73676 village-lost d156/64 (was village-lost d70/31);
73677 village-lost d174/41 (was village-lost d143/43);
73678 village-lost d106/36 (was won d116/34).
The drift is IN THE TREE, not in the tap: the det-gate baseline
itself (pure tableseat-nowait, no recorders, no transcript) gives
177d/tsNationalDay 86 on 73671, against defwound's 180d/77. No
1815 or defwound number is used as a bar in this arm; every census
number below is on the current tree's trajectories. The coordinator
may want a re-baseline note: the 1815 band no longer reproduces.

## (1) DEFENDER-FIGHT awayNews CENSUS

Harvest method: the defwound-diag sweep composition reused VERBATIM
(scripts/test-defwound-diag-sweep.js, never edited) with
DEFWOUND_TRANSCRIPT=1, so every resolve row carries the engine's own
awayNews line for that fight. The tap reads scholar.awayNews length
before/after delegating; a full queue (cap 8) drops the line and the
row records null — counted, never hidden. Corpus:
evidence/2026-10-26/perseed-sim-defnarr-a/ (8 per-seed JSONs +
defnarr-census.json). Template rule (documented, reproducible):
strip the leading emoji, replace the villager first name with
{NAME}, the monster display name with {MONSTER}, every number with
{N}; keep the loot clause as [loot] and the post-flee-rest clause
as [rest]. Round counts, damage numbers, and monster names are
slots, NOT separate templates — splitting by "3 rounds" vs "0
rounds" would hide the boilerplate question. Exact-verbatim
repetition is counted separately. Unmatched lines: 0 (selftest
9/9 + census gate).

Defender fights: 311. Recorded lines: 297. Dropped (queue full at
fight time): 14 (4.5%) — concentrated on 73676 (5) and 73678 (9);
by outcome: mFlee 10, vFlee 2, vKill 2. Outcomes overall:
mFlee 243, vFlee 32, vKill 34, vDie 2.

Templates (names/numbers abstracted; singular/plural kept apart):
- 190 (64.0%): "{NAME} stared down {MONSTER} and it backed off —
  {N} rounds, not a scratch on them. It's still out there, somewhere."
- 36 (12.1%): "{NAME} stood down {MONSTER} and kept walking —
  {N} rounds, bloodied but breathing. It's still out there, somewhere."
- 23 (7.7%): "The {MONSTER} mauled {NAME} (-{N} health) over
  {N} rounds. They're lucky to be breathing."
- 19 (6.4%): "{NAME} killed {MONSTER} alone — {N} rounds, {N}
  taken. Word travels fast. The village cheers."
- 7 (2.4%): same kill line, "1 round" singular.
- 7 (2.4%): same stood-down line, "1 round" singular.
- 4 (1.3%): mauled line + [rest] ("— staying out of sight for the
  rest of the day").
- 4 (1.3%): kill line + [loot] ("Took X off the body.").
- 2 (0.7%): mauled line, "1 round" singular.
- 2 (0.7%): kill line + [loot], "1 round" singular.
- 1 (0.3%): "The {MONSTER} killed {NAME} in {N} rounds. The
  village mourns." (+1 more with "1 round").
- 1 (0.3%): "The {MONSTER} came for {NAME} and missed — they got
  clear over {N} rounds, unharmed. They're lucky to be breathing."

Merged shapes (singular/plural merged; loot kept as its own shape
because loot is content, not grammar): 8 shapes total.
Stared-down 190 (64.0%), stood-down 43 (14.5%), killed 26 (8.8%),
mauled 25 (8.4%), killed+loot 6 (2.0%), mauled+rest 4 (1.3%),
villager-killed 2 (0.7%), came-for-and-missed 1 (0.3%).
TOP-TEMPLATE SHARE: 64.0%. If loot is also treated as a slot,
there are 7 sentence skeletons — the whole defender news channel
is seven sentences.

What the top template IS (the census fact that decides the
verdict): ALL 190 stared-down lines are rounds-0, pre-wounded,
vTaken=0. Not one is a real fight. 150/190 end with the monster
below 5% HP; 40/190 end at 5–25%. The stood-down lines are the
opposite: 43 lines, all rounds>0, 40 manufactured (the defender
fight itself wrote the wound). So the channel's dominant sentence
is exclusively the phantom-meeting sentence: a monster that
arrived already wounded, met, and fled before round 1.

Exact-verbatim repetition: 260 distinct verbatim lines for 297
recorded lines; lines repeated more than once cover 66 recorded
lines. Most-repeated single line (x4):
"⚔️ Elena stared down the Highbeam Deer and it backed off — 0
rounds, not a scratch on them. It's still out there, somewhere."
Same-instance chains (same seed + spawn seq, same full line):
max x3 — 73675 gallowdeer seq 9 (Elena/Highbeam Deer, days 48/74/81),
73675 voice_mimic_radio seq 21 (Nina/Loud Beast, days 81/104/125),
73677 heckler seq 14 (Michael/Heckler, days 36/87/94). Per-instance
totals run higher (the same animal produces several DIFFERENT
lines across meetings): 73675 gallowdeer seq 9 has 8 defender
lines (5 distinct) — first a mauling (d19, Elena -48 over 2
rounds), then stare-downs at 1% HP on d38/d48/d66/d74/d81/d96/d104.

Delivery thinning (mechanism, not counted in the census): tell()
caps the queue at 8, and returnToVillage speaks only the first 5
queued lines, summarizing the rest as "...and N more. Ask around
— they'll tell you." So the player HEARS at most 5 defender lines
per return, and only the first 5 queued — the census counts lines
the engine WROTE, which is an upper bound on what any player hears.

## Is the dominant line MISLEADING? (judged, not just counted)

Literally false? No. "Not a scratch on them" describes the
villager (singular they): the defender took no damage, 0 rounds
were fought, and that is all true. Misleading by omission? Yes,
in the specific way that matters for play:

1. The line never states the monster's condition. A monster at
   1% HP that has been met six times reads exactly like a healthy
   monster that just backed off. The reader cannot tell "we drove
   off a beast" from "the same dying animal shambled back again."
2. The sequence inverts the story. The real fight's line says
   "bloodied but breathing" (the monster was hurt); every later
   meeting says "not a scratch" (as if nothing ever happened to
   either of them). A reader following one animal sees: hurt →
   unhurt → unhurt → unhurt. The wound is erased from the story
   even though it persists in the world.
3. "It's still out there, somewhere" is the most honest clause in
   the channel — it is the ONLY part of the line that tells the
   player the animal persists. Everything else in the line is
   about a single meeting that did not happen.
4. The edge case proves the shape: d100, seed 73671, Owen vs a
   wave-3 gavel at 0.00 → 0.00 HP: "Owen stared down the
   Loud-Eyes and it backed off — 0 rounds, not a scratch on
   them." A monster at effectively zero health still "backs off"
   and is "still out there, somewhere." The line cannot express
   "this thing is finished but nobody finished it."

What must stay stable (so the player can trust the signal): the
outcome vocabulary itself — stared/stood/mauled/killed/mourns —
and the "still out there" persistence clause for mFlee. What
should vary: whether the line says the monster is already
wounded, and on repeats, that this is the SAME animal again.
(Proposal section below.)

Name instability (observed, mechanism not fully established):
the same instance appears under different display names in the
news, including from the same reporter days apart — 73675
voice_mimic_radio seq 21 is "the Static" on d66/d74 and "the
Loud Beast" on d81/d96/d104/d125/d133; hushwolf seq 11 is
"Hushpuppy" on d19/d48 and "Big-Eyes" on d81/d115/d125.
monsterNoun is codex-dependent (villageName vs descriptor), so
names legitimately change as knowledge changes — but the effect
in this channel is that an individual animal cannot be followed
through the news by name. Flagged as an observation + open
question for the coordinator, not a proven bug: whether the
d74→d81 "Static"→"Loud Beast" change is a codex churn event or
something else was not established here.

## (2) WAIT-LINE REPETITION

Wait texts, located in code (never invented):
- Out-of-combat wait (game.js doAction 'wait', kind='wait'):
  "You wait. The light changes. Nothing asks anything of you."
  Said ONLY when no fight, no pending encounter, and the game is
  not over. The sim day loop's driver calls doAction('wait') 3x
  per loop-day (sim-harness), so this is the common wait line.
- In-combat wait (game.js tbPlayerWait): "You hold still,
  watching." — or, when heckler-compelled, the answer-back line
  ("Oh, you want to TALK about it? ..." with a (-N SHAME) number).
  tbPlayerWait is also the default fight driver's end-turn action.

MEASURED-STREAM VERDICT: wait lines do NOT appear in the
measured sim transcripts — by harness design, not by absence of
waiting. Standard sweep runs silence Game.say (sim-harness:
say/sysSay are no-ops unless narration:true), so the wait lines
the engine would have said are swallowed before any transcript
exists. The measured corpus therefore contains zero wait lines,
and no wait line was counted from it. Anyone claiming a wait
census from a standard sweep run is counting nothing.

FAITHFUL HARVEST (the census of record): recording-only-say
replays — loadGame with narration OFF (the measured condition),
only Game.say replaced by a recorder that writes nothing to game
state (no emit, no log push, no RNG; feedback() still emits
exactly as in measured runs). Equivalence per seed, all 8:
days/gameDays/endReason/deaths/won match the measured corpus
exactly (73671: 177/177/village-lost/43/0; 73672: 116/116/
village-lost/32/0; 73673: 97/97/over-other/29/1; 73674: 175/175/
village-lost/48/0; 73675: 180/181/survived/43/0; 73676: 156/156/
village-lost/64/0; 73677: 174/174/village-lost/41/0; 73678: 106/106/
village-lost/36/0). Corpus:
evidence/2026-10-26/perseed-sim-defnarr-a-wait/ (sXXXX-wait2.json
+ wait-census.json + per-seed wait transcripts).

Wait census (trajectory-faithful say-calls, 8 seeds):
- Total say-calls: 105,612. Out-wait calls: 3,442 (3.3% of all
  say-calls), per seed 512/331/288/504/527/452/515/313.
  Out-wait kept after full-stream dedup: 3,442 (100% — day-part
  headers and other lines always intervene, so the engine's
  consecutive-duplicate rule never drops an out-wait line).
- In-wait calls: 95 (per seed 0/0/4/4/23/41/22/1), kept 84 after
  dedup (11 dropped — in-combat waits CAN repeat consecutively
  with nothing between, e.g. 73676 d97, three in a row).
- Heckler answer-back calls: 0 on all 8 seeds. Every tbPlayerWait
  call on this band took the "You hold still, watching." branch;
  the compelled branch never fired (tbPlayerWait totals equal
  in-wait totals per seed: 0/0/4/4/23/41/22/1).
- Driver wait actions (pacing): 3,540 total. Out-wait lines
  3,442 — the gap of 98 is exactly the code's suppression rule
  (a fight, pending encounter, or game-over intervened, so no
  line was said): per seed 19/16/3/19/13/16/7/5.
- Wait total: 3,537 calls (3.3% of say-calls), kept 3,526.

REPLAY-ONLY COMPARISON (narration-live + emit tap, seed 73671):
14,510 emit lines, 456 out-wait calls, 0 in-wait calls, trajectory
157d/village-lost/38 deaths vs measured 177d/43 — DIVERGENT, so
these counts describe a different village's days, not the census
trajectories. The divergence itself is the finding the prior
arms warned about: with say live, the log grows (and log-length
readers such as encounters.js feedbackMark see a different
stream) and the run ends 20 days earlier. A narration-live replay
must never enter a census; it is useful only as a qualitative
look at the visible stream.

## (3) TRANSCRIPTS READ END-TO-END (plain words)

Read in full: defender transcript 73671 (48 fights, d9–d157),
defender transcript 73675 (61 fights, d19–d179), wait transcript
73671 (512 wait lines, d1–d177). Plus the prior run's transcripts
(defwound 73671, fieldfinish 73675 d178–d181) re-read as context.

What a player learns from the 10th identical line that the 1st
did not teach: nothing — except, if they are keeping count, that
the animal is still alive. The 73675 deer arc is the whole story
in miniature: day 19, the deer mauls Elena (a real event, with a
cost: -48 health). Then the same deer, at 1% health, is "stared
down" on days 38, 48, 66, 74, 81, 96, 104 — seven times, by four
different villagers, in the same words, with no mention that it
is the same deer, that it is dying, or that anyone has met it
before. By the 10th line the player has learned to skip the
channel: defender news is noise with occasional kills in it.
The kill lines and mauling lines still land (they carry cost and
consequence: -62 health, a corpse, loot), because they vary with
what happened. The stare-down line cannot vary, because it is
fired for a non-event, and non-events have nothing to vary with
— except repetition itself, which the line never mentions.

The wait line is the same shape of problem with the opposite
cause: the wait line is honest ("nothing asks anything of you"
is true on exactly the days it fires — the code suppresses it
when a fight intervenes, and the 98 suppressed cases prove the
suppression works), but it is empty. It does not say which part
of the day, what the weather is, whether anyone is nearby, or
whether this is the third quiet part in a row. A player waiting
through a siege and a player waiting through a peaceful afternoon
read the same sentence. The line's honesty is its only virtue;
its information content is zero after the first reading.

What should vary (and what must stay stable): for defender news,
vary ONLY the wound/persistence facts — "already bleeding,"
"again," "the same beast as last week" — and keep the outcome
vocabulary and the "still out there" clause stable, because
those are the signal. For wait, vary ONLY the quiet context —
day part, a nearby villager, weather — and keep the "nothing
asks anything of you" assurance stable, because that assurance
is what the player is waiting to hear. Do NOT vary the outcome
words themselves ("stared" vs "stood" already encode a real
distinction: 0-damage vs damage-taken); inventing synonyms for
them would destroy the one trustworthy distinction the channel
has.

## VARIETY PROPOSAL (section only — NO game-code change in this arm)

All proposals are narration-only (fieldFightSummary / doAction
'wait' / tbPlayerWait text), require no mechanic change, and are
for the coordinator/Steve to rule on — none is implemented here:

1. PHANTOM TAG (defender mFlee, rounds-0, pre-wounded): append a
   short, stable clause when the monster arrived wounded, e.g.
   "— already bleeding, and still standing" on first re-meet,
   and "— again" when this instance has been met before. The
   data already exists at the resolve site (start fraction,
   instance identity via the spawnsrc tag pattern). This fixes
   the misleading-by-omission finding without changing any
   outcome, loot, or deed.
2. REPEAT COUNT, NOT REPEAT TEXT: when the same instance is met
   for the 3rd+ time at rounds-0, replace the sentence with a
   one-line acknowledgment ("The [X] is back at the treeline
   again — still bleeding, still not finished.") so the 10th
   meeting reads as a story beat instead of a copy-paste.
3. NAME STABILITY IN awayNews: pin the display name per instance
   for the awayNews channel (first name used for that instance
   sticks in news lines), even while knowledge-gated names
   elsewhere keep evolving. Without this, proposal 1's "again"
   cannot work — the reader cannot tell it IS again.
4. WAIT CONTEXT SLOT: give the out-of-combat wait line one
   varying slot — the day part ("Midday. You wait. ...") — and
   nothing else. The line stays one sentence, stays honest, and
   stops being identical 3x/day. Do NOT add random flavor: the
   wait line's job is to confirm quiet, and random flavor would
   make players read it for news that is not there.
5. IN-COMBAT WAIT: leave "You hold still, watching." alone — it
   fires rarely (95 calls in 8 runs), always means a deliberate
   combat choice, and its repetition (max 3 in a row, deduped
   to the log's rule) is the player holding a stance, not the
   engine idling. No change proposed.
6. DELIVERY: leave the 8-cap/5-spoken rule alone — it already
   thins the channel. Any variety work should be judged on the
   SPOKEN lines (≤5 per return), not the written census.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- No metric was re-scored mid-run. The pre-registered sense-GO
  legs were judged exactly as written. Two method changes are
  disclosed, neither a threshold change: (i) the tap-neutrality
  comparison is against a same-tree transcript-OFF rerun, not
  against the defwound corpus — because the det-gate baseline
  itself proves this tree's trajectories moved (177d/86 vs
  180d/77), so a literal defwound match would test master drift,
  not tap neutrality; (ii) the wait census uses recording-only
  say replays, not narration-live replays — because the
  narration-live replay was PROVEN divergent on 73671 and would
  have made the wait counts describe the wrong trajectories.
- Balanced panel (§15): NOT run as a compare, deliberately —
  this arm makes no before/after balance claim (no lever, no
  game-code change), so there is nothing for the panel to
  compare. The panel's known recorder-corpus limitation (ninth
  sighting class, per defwound) is not invoked here.
- Counts vs hearings: the defender census counts lines WRITTEN
  (297); lines HEARD are fewer (queue cap 8, spoken cap 5 per
  return) and were not counted — a spoken-line census would
  need return-to-village tracking the recorders do not have.
- Transcript bug found and fixed during this run (disclosed):
  the first version of the wait-transcript writer computed dedup
  over the wait-only stream, falsely marking nearly every wait
  line "(deduped from log)". Fixed to full-stream dedup before
  any verdict was drawn; the corrected files show 0 deduped
  out-wait lines and 11 deduped in-wait lines, reconciling
  exactly with the wait census. No numbers were re-run or
  patched, only the annotation.

## INSTRUMENT NOTES

- New: scripts/test-defnarr-sense.js (--selftest 9/9, --census,
  --compare-tap, --waitreplay/--waitreplay2 + -all, --waitcensus,
  --transcripts). Template function unit-proven on all 7 sentence
  shapes + loot/rest suffixes; census gate fails on any unmatched
  line (0 unmatched on this corpus).
- Reused VERBATIM (never edited): scripts/test-defwound-diag-sweep.js,
  scripts/policies/defwound-diag.js, raftdraft-diag, spawnsrc-diag,
  oldcore-diag, tableseat-nowait, sim-harness.
- Corpus: evidence/2026-10-26/perseed-sim-defnarr-a/ (8 per-seed
  JSONs + defnarr-census.json + 8 defender transcripts);
  evidence/2026-10-26/perseed-sim-defnarr-a-wait/ (8 wait2 JSONs +
  wait-census.json + 8 wait transcripts + the divergent 73671
  live replay file, labeled); evidence/2026-10-26/
  perseed-sim-defnarr-a-tapoff/ (73671 transcript-OFF rerun, the
  tap-neutrality proof).
- What the harvest cannot see (stated, not hidden): player (tb)
  fights have no resolve rows, so defender "alone" in kill lines
  is the template's word, not a verified ally count (the recorder
  does not capture allies); spoken (vs written) awayNews lines
  were not counted; the same-instance name-change mechanism was
  observed but not root-caused.

## NEXT BLANKS, IN ORDER (for the coordinator, not this run)

1. The variety proposals above (1–4) need a Steve/coordinator
   ruling before any narration arm implements them — they are
   text changes to a trusted signal channel, and the wrong
   variant (random flavor, synonym churn) would damage the one
   honest distinction the channel has.
2. Same-instance name instability in awayNews (Static → Loud
   Beast for one instance within 7 days, same reporter) — needs
   a codex/monsterNoun read to establish whether it is
   villageName churn or another mechanism, before proposal 3
   can be specified exactly.
3. The 1815/defwound band no longer reproduces on this tree
   (won 1/8 vs 4/8, deaths 332 vs 234) — the coordinator's
   re-baseline question, not this arm's: every later arm that
   cites the 1815 band as control is citing a stale control.
4. Narration-live trajectory divergence (157d vs 177d on 73671)
   — the mechanism (log-length readers vs something else) was
   narrowed to live emit/log growth but not root-caused; any
   future sense replay that needs census-grade counts must use
   the recording-only-say method proven here, not narration:true.

scale-onramp stays converging (NOT converged): this arm moved no
lever and changed no mechanic — it measured a narration blank
(defender + wait boilerplate) on current-master trajectories.
Convergence state: converging.
