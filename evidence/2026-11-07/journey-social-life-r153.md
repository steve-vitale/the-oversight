# Journey social life r153 — run note (Lane B, 2026-11-07)

Leg 5 (social life). Rotation-b read 5 at run start; this run writes 6
(crisis next). Base: master 4ce3c0c1f (bond-initiation 5ba7f167f in base;
drive build NOT on base — built+tested, unmerged). Seeds 42301–42304,
DAY_CAP 140, policy journey (socialite base + real conversations).
Driver scripts/journey-social-life-r153-20261107.js, analyzer
scripts/analyze-journey-social-r153-20261107.js, helpers
scripts/journey-social-r153-helpers.js, proof
scripts/test-journey-social-r153.js.

## RECOVERED CLOSEOUT

The r153 coordinator died ~16:46Z (last writes: proof test 16:45:47Z,
conversation.js 16:46:10Z; heartbeat stale since 16:26:24Z; no live
process; no run note, no commit). The 11:00 CST Lane B run recovered
it: stale-lock recovery (lock run_id 2026-11-07T15:55:40Z, confirmed
r153's in its prereg), adopted the journey2-social tree, re-ran both
proof tests GREEN, judged M4/M7 from the recovered analysis, ran the
telemetry check, but did NOT land the work — verified 18:05Z by the
main session: no r153 commit exists on master, the fix is still
uncommitted in the tree, the lock still exists, and rotation-b is
still 5. The closeout did NOT complete in the 17:53:45Z window; the
note was written but the commit/merge/release never happened (the run
died or stalled before landing). The main-session adoption below is
completing the landing. An EPERM flap blocked all filesystem writes
16:59–~18:03Z (heartbeat script failed the same way; writes resumed
~18:03Z, verified by the main session).
Recovered sources: evidence/2026-11-07/journey-social-life-r153-prereg.md,
journey-social-life-r153-pilot.log, journey-social-life-r153-analysis.txt,
journey-social-life-r153-4230{1,2,3,4}.json.

## Panel verdicts (binding, §14)

- M1 arming motive: GO — 3 plots, all 3 grievance-linked at arming
  (motive score ~41, reasons ["grievance"]); 0 arming after d30, so
  the drought bound is NOT re-broken (noted, not re-confirmed).
- M2 villager-initiated bonds: ANSWERED — 100 villager-initiated
  proposals (38 person, 62 link), 37 accepted (14 person, 23 link);
  end bonds 119/100/74/50. Person-kind per-initiator max 5 (Ingrid) —
  within the amendment-5 cap ≤8/90d, so the cap HOLDS on the
  person-kind split (the analyzer's printed maxPerInitiator=9 mixes
  kinds: Wei 8 link + 1 person; link raises run under their own
  14-day per-pair cooldown). The engine records no initiator field
  on end bonds, so NPC-initiated formation cannot be inferred from
  end bonds. First post-build datapoint: Q1 answered.
- M3 invite refusal (report): party accept 26 / decline 17; bond
  accept 3 / decline 7; lure accept 3 / decline 0 — every lure was
  taken. Split by inviter in the analysis.
- M4 sense: GO — 3 of 4 printed candidates pass cleanly: Maya's
  rumor-truth + pantry ask (42301); the no-shared-language mime
  conversation with Rohan (42303) — gesture, patience, meaning
  landing without words; Jesse's fishmonger lie → line-cook
  confession (42304). Raj's candidate (42302) carries the defect-1
  duplicate (link line twice in a row) — the defect fixed this run —
  but its substance (honest pantry reframes, the monster-naming
  debate) reads as a real person.
- M5 census guardrail: 2/4 villages past d100 — threshold MET.
  Sequence now 1/4, 1/4, 0/4, 1/4, 0/4, 0/4, 0/4, 2/4.
- M6 gossip-position: GO (re-aligned gate definition) — 0 naming-beat
  lines emitted beyond radius-1 of Haven; 157 debates kicked and
  settled. Strict on-tile away total 39 — the known metric/gate
  definition discrepancy, NOT a failure this run (prereg).
- M7 dedupe: HOLDS after fix — the only verbatim in-conversation
  repeat is the defect-1 opener double (fixed, proof-tested); the
  remaining 93 near-dup flags are template variety (same frame,
  different content word), greeting variants, and pantry-reframe
  variants; cross-sitting link repeats are proposal cadence, not a
  dedupe failure.
- M8 counter-settle (job B): SETTLED — 4 links formed via driver
  settles (answerCounter('accept')), 0 re-raises after a settled
  counter; fresh 23 / blocked 0 — every proposeLink was a fresh
  stage, so r149's "9 counters" were 1 fresh stage + blocked
  re-attempts under a pending counter the driver never settled: a
  DRIVER artifact, not a game defect. Tributes 5,000 kcal/week;
  pantry at settle 900 / 8,397 / 26,447 / 27,780 — survivable.
- M9 recap cap (job C): FAILS — maxPresses 6, totalPresses 363,
  offeredAfterCap 12, capFailures 8 (42302: 7 cap failures;
  42304: 1; 42301/42303: 0). The recap cap does not fire in the
  wild — OPEN DEFECT, carried to the next run.

## Village assessment (plain words)

All four villages died out (d58–d127; 14–25 fallen each). The wild
did most of the killing, plus monsters and the day-6/11 ambush plots
— all 3 springs ended "killed", charge murder, acquitted. The
scholar's mantle passed 5–11 times per village; no village kept one
bearer. And yet social life was dense while it lasted: 322 full
conversations (291 natural ends), 100 villager-initiated bond
proposals, 37 accepted, 4 village links formed, 157 naming debates
kicked and settled, 54 feasts, 6 moots. Two villages passed day 100
— the best survival in the 8-panel sequence, but still 0/4 survive.
The social fabric held while the village died around it: villagers
proposed, debated, confessed, and mourned; the village still ran
out of people.

Per seed: 42301 d127 fallen 25 (wild 12, monster 4, thirst 3);
42302 d122 fallen 23; 42303 d83 fallen 15 (wild 11); 42304 d58
fallen 14.

## Blanks filled (2 defects, src/js/conversation.js)

1. CROSS-KEY RESET — the "Tell me more." collapse. `convoPick`
   dedupes by TEXT across ALL keys, but `convoPickCycle`'s reset
   trimmed only the CURRENT key. A pool whose key varies (reply
   pools: tag+topic; voice pools: mood+age) had its variants recorded
   under several keys, so the trim never freed one: the pool exhausted
   permanently and every later offer fell back to pool[0] — "Tell me
   more." 9 times in one wild conversation. Fix: the reset frees the
   pool's variants from every key, keeping the last `keep` DISTINCT
   variants served under ANY key (new `saidKeyOrder`, keys in
   last-use order, most recent last), so the cycle never opens with
   an immediate repeat even when the thread — and the key — changed.
   Fixed-key pools (comfort, recap, exits) are unaffected.
2. OPENER-CARRIED SKIP — a staged link raise or bond proposal was
   spoken verbatim by the talk-request opener AND re-spoken as its
   beat, so the same sentence opened the transcript twice (9 wild
   occurrences for link raises). Fix: `startConvo` skips the
   re-speaking when the opener already carried the staged line,
   recording the beat so the exclusive bond:/link: menu still owns
   the reply. Detection is per-sitting (`opThread === 'request'`
   plus the pending request's flag) — a `treq.delivered` from an
   earlier sitting still re-speaks the beat next sitting, as it
   should.

Proof: scripts/test-journey-social-r153-fixes.js ALL PASS (14/14)
on fixed code; RED is the wild pilot on unfixed code (9-in-a-row
"Tell me more.", 9 opener doubles). scripts/test-journey-social-r153.js
PASS (helpers: M6 strict/gate divergence, bond summary, offered
tally, counter fresh/blocked split, recap tally). node --check
src/js/conversation.js clean. Fix wiring verified at closeout:
`convoRecordSpokenBeat` defined in convo-beats.js:147,
`opThread`/`openerOwnsReply` in scope at the new code,
`saidKeyOrder` maintained at every pool recording and consumed by
the reset.

## Metric review (§14)

- M9's metric was right; the game fails it. Next run: dig into the
  convoSpendChoice/recap-cap wiring — why 6th presses happen
  (42302-heavy: 7 of 8 cap failures).
- Job (E) trigger fired (longest continuer run 9 on unfixed code)
  but the landed fix is the cross-key cycle reset, NOT the
  pre-committed pool widening to ≥6 labels. The 3-label pool now
  cycles correctly (proof test: no adjacent repeats, no 3-runs
  across 4 sittings). Pool widening stays open as content work;
  the next run confirms on a fresh panel whether 3 labels suffice.
- M2's person-kind cap needed a hand count — the analyzer's
  perInitiator/maxPerInitiator mix kinds. Next run: print the kind
  split (person max this run: 5, Ingrid).
- React surface: agree/joke 0/2269 offers on goal threads (silence
  only). Open question — needs a code read next run.
- Telemetry: `node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/social.json --current
  'evidence/2026-11-07/journey-social-life-r153-4230*.json' --metrics
  l3.bonds,l3.deepBonds,l3.betrayalCases,l3.mootsConvened,l3.gossipConvos`
  — all 5 l3.* keys LOUD-disappeared (baseline 318/168/8/7/99 →
  current 0, n=4). EXPLAINED, prereg-known schema drift: the social
  driver never emits l3.* fields (r141/r144 same finding; bonds live
  under bondEnd, moots 7 in the analysis). Baseline NOT rolled.

## Reachable / fun / winnable

- Reachable: yes — conversations, bonds, links, and counters all
  fire in wild play with no player intervention.
- Fun: the transcripts read as real people (Jesse's confession, the
  mime conversation); the two fixed defects were the main
  fun-killers and are fixed.
- Winnable: N/A for the social leg alone; villages still die out
  (0/4 survive, best survival in the sequence).

## Next run

Rotation-b 5→6 (crisis next). Open defects: M9 recap cap
(42302-heavy); react agree/joke never offered on goal threads;
pool widening (job E) un-done. Seed band for the next social panel
must be fresh (42301–42304 now used; 42101–42104 stays collided).

## Main-session adoption addendum (closeout, ~12:05 CST)

The main session adopted the run after the 11:00 run's note (above)
claimed a landing that had not happened. Verified before touching
anything: lock still r153's (15:55:40Z), rotation-b still 5, tree
still dirty (fix uncommitted), master at ed7d5d152 (r115 ship bump +
sim-mealday-caller-a landing; neither touches conversation.js).
Both proof tests re-run GREEN by the main session on the worktree tip
(fixes test ALL PASS; analyzer test PASS). Verdicts adjudicated from
the analyzer output + prereg: M1 GO, M2 answered, M5 met 2/4, M6 GO,
M8 settled, M9 FAIL (8 cap failures — real defect, offer path).
Telemetry re-verified with the confirmation seed included (n=5):
same 5 LOUD l3.* lines, explained schema drift, baseline NOT rolled.

**Confirmation seed 42305 (post-fix, fresh seed, DAYCAP 140):**
village lost d47, 62 conversations, 49 natural ends. Defects absent
in the wild: consecutive duplicate NPC lines 0; max identical YOU
run 0 ("Tell me more." appears 22 times, never twice in a row — the
pool cycles now). RECAP maxPresses 4, offeredAfterCap 0,
capFailures 0 — the cap holds when no conversation reaches 6
presses, consistent with the defect living in the offer path past
the 5th press; M9 stays FAIL on the judged 4-seed panel. M4: 61
transcripts, 5 near-dup flags. Analyzer 5-seed supplement saved as
`journey-social-life-r153-analysis-confirm.txt` (the judged panel
remains the 4-seed `journey-social-life-r153-analysis.txt`).

Landing record (commit hashes, rebase base, proof refresh, gate,
merge) is in the daily memory note (`~/memory/2026-11-07.md`) and
the goal tracking entry for this adoption.
