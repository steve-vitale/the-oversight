# Journey succession r170 — Lane B, leg 7 (succession) — PREREGISTRATION

Written before any r170 play (adoption + fix work only). Rotation-b
read 7 at run start; this run writes 4 (endgame next) at closeout
and VERIFIES the file reads 4 afterwards. Run number r170 = next
Lane B number after r169 succession (died at its gate, adopted
this run). Base: master 53185abea (meleefirst-b adoption).

## Standing state (why this run adopts + replays leg 7)

r169-succession DIED at its gate: coordinator timed out ~09:56Z,
two `check.js --quick` processes were still live at 09:57Z (main
session verified), then both exited; last file write 09:46Z, last
heartbeat 09:53:40Z (63 min stale at this run's 10:57Z start), no
live processes in the tree. Dead by the guard's own test
(heartbeat stale + no live processes). Its work, stranded:
- Commit 836993301 [needs-eyes]: dlg:more dry closer is wind-down
  grammar (structural exemption; Javier 34003 d71).
- Uncommitted Amendment A1: blocked dlg:more beats fall through
  honestly (Ernst 34015 d55) + proof-test 3rd case + transcript-scan
  assertion + prereg amendment + full panel evidence + run note.
- Gate NEVER completed: checkquick.log ends mid-progress (204
  bytes, last write 09:55:16Z). Rotation NOT advanced (still 7).
Adoption this run: verify A1 (r169 proof + family proofs re-run
GREEN on the A1 tip), commit A1, re-run the gate, rebase onto the
explicit master SHA, merge, release, advance rotation.

## The carried blank: Catalina ask:lately dry (pinned pre-play)

The wild case, from the committed r169 record (no new play yet):
- Seed 34016 d62 Catalina, successor-life d+30: the player asks
  "How are you holding up — really?" (ask:lately) and hears
  "...Sorry, lost my train of thought." — a dry line as the answer
  to a caring question, a non-sequitur: she had not lost her train
  of thought, she had news to share.
- Mechanism pinned from the committed sayTrace
  (evidence/2026-11-10/journey-succession-r169-34016.stdout.json,
  the seed's only fellBack entry): pick ask:lately, key
  '"Huh. Let me think about that." "You asked me that before.
  It\'s a different question now." "Have you felt it? Like the air
  before a storm, but — bigger. Something\'s on its way."',
  preSelf=false, preRun=TRUE, fellBack=true, returned the dry line.
  Sites: conversation.js:7169 (generic answer emission),
  conversation.js:8236, convo-dialogue.js:882.
- Chain: the lately topic is the village-wide table-waiting event
  (t2gen_lately 'table'/'waiting', 2 variants); topic2Ask picks
  the event line, prepends the t2changeLine ack when re-asked
  after the clock moves, and _convoTurn's convoComposeBeat
  prepends a random topic ack (1 of 3) — so the composed line is
  ack + change + event. With 3 acks x 3 change lines x 2 event
  lines, two villagers can compose the IDENTICAL string; the
  first speaker ledgers it, the second speaker's sayLine
  (structural:false, diegeticAct:false at :7169) run-blocks it
  and dry-replaces it — and the dry line comes back TRUTHY, so
  the `|| line` fallback never fires (the r166 lesson, same shape
  as Javier/Ernst). The event line is village-wide news: every
  villager feels the same storm coming. Two villagers reporting
  the same shared event in the same words is not parroting.

## Design call (this run's call — Steve can overrule)

A lately answer is shared village news, not per-villager content
— the same class as the r17 structural beats (resume openers,
recap lines, thread-resume responses) and the r25 mood-silence
line ("two villagers filling quiet the same way on one day is
not parroting") and the r169 dlg:more closer (wind-down grammar).
The fix: the ask:lately branch sets `structuralTurn = true`, so
the generic emission at conversation.js:7169 skips the
run-ledger block for the lately answer — exactly the r25 silence
precedent (a one-line flag in the branch, same emission site).
What does NOT change: the per-sitting ledger still applies (a
true same-conversation repeat keeps the honest "I just said"
path); the event/ack/change pools still cycle per villager
(t2pick, convoComposeBeat); the dry line stays available for
genuine content-beat blocks; no other ask: topic is touched.
Scope: the ask:lately branch in src/js/conversation.js ONLY
(the observed miss). Same-class sites NOT touched this run:
convoThreadBeat's `exh` closers and the base `more` choice —
none dried on the r169 panel; the design call above already
covers them for a future run.

## Question (r170)

Does the structural exemption on the ask:lately answer make the
Catalina turn speak the honest event line instead of the dry
line, without changing any unblocked path — and do the carried
regression bars still hold?

## Fix (this run)

- src/js/conversation.js ask: branch: `if (topic === 'lately')
  structuralTurn = true;` with a comment citing the Catalina
  case + the r17/r25 precedent.
- Proof test scripts/test-journey-succession-r170-lately-dry.js:
  collision pair (two villagers, table-waiting live, both event
  variants poisoned in the run ledger so the event pick is a free
  draw): the second speaker's reply must be the honest event
  line, never a dry line, with a transcript-scan assertion (no
  dry line anywhere). Seed found by search script (see below).
  Control (no poisoning): both speakers answer honestly.
  Verified RED on unfixed code and GREEN after.
- Seed search: ~/workspace/worktrees/journey2-succession-r170-
  lately-search.js (throwaway; seeds 5600+, A-then-B ask:lately,
  both event variants poisoned, reports match=true dryB=true).

## After-leg (this run)

- NO fresh panel: the fix is a one-line exemption in the same
  class as r169's, verified by proof test + wild-seed re-run.
- Wild re-run: seed 34016 on the fixed code (r169 driver,
  EARLY_KILL_DAY=40, POST_DAYS=70): Catalina must speak the
  event line at d62, 0 ask:lately fellBack on the seed.
- Analyzer revision (secondary, time-boxed): implement the r169
  metric-review proposal in the r170 analyzer — exclude
  over==true rows from the MANTLE-FINE binding verdict, and
  classify fineLatency==1 as SAMPLING-or-CLEAN when an earlier
  death shares the entryDay (or flippedImmediate==true at
  return) — then re-run it on the committed r169 panel JSONs and
  report the revised verdict. If it gets hairy, carry it again
  with the reason noted; the bar is NOT re-scored for r169.
- Family proofs re-run GREEN on the final tip (r146/r147/r151/
  r155/r157/r161/r166/r169) + gate check.js --quick.

## Seed-band freshness (local_seed_band_freshness)

- Proof-test collision seed: found by search over 5600+ (fresh
  band; no prereg reserves 56xx). The search script, not a panel,
  spends the band; the hardcoded seed is a proof seed, not a
  panel seed.
- Wild re-run seed 34016 is the r169 panel seed — a re-run, not a
  fresh reservation; no new band is spent.
- No forbidden/contaminated band list names 56xx.

## Bars (binding, §14)

- PROOF TEST (binding): r170 lately-dry RED on unfixed code,
  GREEN after (both cases + transcript-scan).
- WILD RE-RUN (binding): seed 34016 on fixed code — 0
  ask:lately fellBack; Catalina d62 speaks the event line.
- FAMILY PROOFS (binding): r146 + r147 + r151 + r155 + r157 +
  r161 + r166 + r169 ALL GREEN on the final tip.
- GATE (binding): check.js --quick on the final tip; standing
  failures only, no new attributable failure; load timeouts
  re-run standalone.

## What would count as an interesting finding

- A lately turn still drying after the fix (fix incomplete).
- A NEW dry appearing on the 34016 re-run (another same-class
  site firing in the wild).
- The lately answer repeating verbatim back-to-back in a way
  that reads as parroting rather than shared news (the exemption
  overreaching — the per-villager pools must still vary it).
- Any control changing (trapline line, CAP-NC, self-request).

## Telemetry

Baseline hidden_files/telemetry-baselines/succession.json, metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions. Run on the
r169 panel tele files (already diagnosed in the r169 note as the
summation artifact; re-run to confirm the same result on the
final tip — the fix touches only dialogue, per-seed means must
not move). The 34016 re-run tele file is a single-seed check,
not a panel; do not roll the baseline forward on it.

## Metric review (to be filled after the after-leg)

- r169 proposals carried into this run as the analyzer revision
  above (VILLAGE-OVER exclusion, SAME-DAY-CASCADE
  classification). The r169 letter-FAIL stands; the revision is
  judged on whether the re-run verdict matches the adjudicated
  substance (65/65 synchronous handoffs, 0 real deferrals).
- The day-skip instrument correction stays open (r166/r169:
  zero day-skips across 67 deaths / 9 seeds / ~800 sleeps, no
  deterministic staging path) — carried, not implemented.
- CAP-NC denominator: stays descriptive (r169: 2 eligible).
  A decisive verdict needs a longer panel or a band with
  earlier arrivals — a future run's question, not this run's.
