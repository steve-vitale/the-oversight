# Journey social life r154 — run note (Lane B, 2026-11-07)

Leg 5 (social life). Rotation-b read 5 at run start; this run writes 6
(crisis next). Rotation stayed 5 because r153's closeout never wrote 6 —
its coordinator died before landing and the main-session adoption landed
the fix but left the rotation file at 5. Base: master c9fea16ee (r153
conversation.js fixes in base). Seeds 42601–42604, DAY_CAP 140, policy
journey (socialite base + real conversations). Driver
scripts/journey-social-life-r154-20261107.js, analyzer
scripts/analyze-journey-social-r154-20261107.js, helpers
scripts/journey-social-r154-helpers.js, proof
scripts/test-journey-social-r154.js + scripts/test-journey-social-r154-recap.js.

## Panel verdicts (binding, §14)

- M1 arming motive: GO — 13 plots, all 13 arms grievance-linked at
  arming (motive score with "grievance" reasons); 0 plots after d30, so
  the drought bound is NOT re-broken (noted, not re-confirmed). 9
  grievance-holder → later leader cases.
- M2 villager-initiated bonds: ANSWERED — 116 villager-initiated
  proposals (52 person, 64 link), 40 accepted (17 person, 23 link);
  end bonds 89/97/60/91. Person-kind per-initiator max 5 (Raj) — within
  the amendment-5 cap ≤8/90d, so the cap HOLDS on the person-kind split
  (new this run: the analyzer prints the kind split separately; the
  mixed max is 17, Zuri, link-heavy — the mixed number is NOT the cap).
  Third datapoint with the bond-initiate build live.
- M3 invite refusal (report): party accept 24 / decline 15 (player
  invites); lure accept 12 / decline 12 (NPC invites); bond accept 3 /
  decline 7 (NPC invites). Every lure was taken or refused, never
  ignored — split by inviter in the analysis.
- M4 sense: GO — 4/4 candidates pass cleanly. Ella's fireside
  vulnerability + honest recap reframes (42601); Brian's home-as-feeling
  arc with the continuer pool cycling correctly (42602); Abigail's
  confrontation arc — doubt, denial, then a real confession ("Yeah, I
  took 1× Stone. What are you going to do about it?") and a philosophy
  ("If I don't step up, someone worse will. That's not ambition, that's
  arithmetic.") (42603); Theo's confided secret + three honest recap
  reframes in a row, no verbatim cycle (42604). Warts, documented not
  failed: the doubt probe pressed twice in one conversation re-offers
  with template-variety deflections (Brian, Theo); Theo's photo secret
  is offered then dropped on "...Sorry, lost my train of thought" with
  no resume in the sitting — watch whether the open-thread ledger
  resurfaces it next sitting. The `*Confessions need weight...*` lines
  are NOT a defect: they are codex-gated coaching in narrator voice
  (truth.js, `who: 'narr'`, asterisked) — the analyzer's candidate
  printer flattens 'narr' into 'NPC', which is a display wart in the
  tooling, not the game. Next run: teach the driver/analyzer to print
  NARR lines distinctly.
- M5 census guardrail: 3/4 villages past d100 — threshold MET. Best
  in the sequence (1/4, 1/4, 0/4, 1/4, 0/4, 0/4, 0/4, 2/4, now 3/4).
  Villages ran d97–d123; 13–19 fallen each, the wild doing most of the
  killing. The scholar's mantle passed 5–12 times per village.
- M6 gossip-position: GO (re-aligned gate definition) — 0 naming-beat
  lines emitted beyond radius-1 of Haven; 173 debates kicked and
  settled. Strict on-tile away total 34 — the known metric/gate
  definition discrepancy, NOT a failure this run (prereg).
- M7 dedupe: HOLDS — 122 near-dup flags across 408 transcripts, all
  in legitimate-variety families: recap reframe pairs (plain vs
  "That's still where we are"), nonverbal nod variants, pantry/creek
  favor reframes, teaching templates (same frame, different plant),
  landmark templates, goal-opener variants. No verbatim same-beat
  repeat in a fixed pool.
- M8 counter-settle: SETTLED (confirmed) — 23 proposeLink, 2 counters
  (both fresh stages), 2 driver settles, 2 links formed, 0 re-raises,
  0 blocked. Tributes 5,000 kcal/week; pantry at settle 3,800 /
  24,464 — survivable.
- M9 recap cap (THE FIX): HOLDS — maxPresses 5, totalPresses 627,
  offeredAfterCap 0, capFailures 0 across all 4 seeds. The driver
  pressed 'recap' 627 times and never once got a 6th press. The fix
  works in the wild.

## Village assessment (plain words)

All four villages died out (d97–d123; 13–19 fallen each). The wild did
most of the killing, plus monsters, ambushes, contests, and one arena.
And yet social life was dense while it lasted: 408 full conversations
(393 natural ends), 116 villager-initiated bond proposals, 40 accepted,
23 village links formed via proposals + 2 via counter settles, 173
naming debates kicked and settled, 60 feasts, 7 moots. Three villages
passed day 100 — the best survival in the 9-panel sequence — but still
0/4 survive. The social fabric held while the village died around it:
villagers proposed, debated, confessed, taught, and mourned; the
village still ran out of people.

Per seed: 42601 d110 fallen 13 (wild 6, thirst 2); 42602 d123 fallen
18 (wild + monsters); 42603 d97 fallen 14; 42604 d107 fallen 19.

## Blanks filled (1 defect, src/js/conversation.js)

RECAP CAP, press-count-based (M9). `convoRecapLine` spent 'recap'
only when the SAME raw recap line had been repeated 5 times — but the
raw line derives from the last two thread-log entries, which change as
the conversation moves, AND every recap press itself appends a
thread-log entry (convoTurn's tail calls convoNoteBeat), so the next
press always re-anchors to a new arc. A fresh re-anchor never
incremented the reframe counter and the choice never spent (r153: 7
conversations to 6 presses, 196 presses on one seed). Even on an
unchanging thread the old code spent on the 6th press, not after the
5th as the r27/r31 design says — off by one on both paths. Fix:
per-sitting press counter `c._recapPresses` (reset in startConvo);
after serving the 5th press, spend 'recap' via convoSpendChoice
whatever the line was. The r27/r31 reframe/escalation line content is
untouched; the served 5th-press line stays the honest re-anchor or
escalation. Offer side needs no change: both offer sites flow through
buildMenu → finalizeMenu, which filters `c.spent` ids.

Proof: scripts/test-journey-social-r154-recap.js ALL PASS (16/16) on
fixed code; RED on unfixed code (6 presses served, all 6 lines distinct
fresh re-anchors, spent.recap unset, recap still offered after the 6th
— the wild defect reproduced exactly). The same-line path is also RED
on unfixed code (5th press escalates "three times" but never spends)
and GREEN after. node --check src/js/conversation.js clean.
Smoke: SEED=42601 DAYCAP=5 — maxRecapPresses 5, offeredAfterCap 0.

## React code read (r153 open question — verdict, no silent fix)

On goal-thread turns the live menu is the beat menu
(`beatMenuResponses`, convo-beats.js), which carries `dlg:react`
'(listen)' with voiced variants but never the `agree`/`joke`/`silence`
ids. `pushReact` (the agree/joke/silence trio) lives in buildMenu's
topic-assembly fallback, which the beat-menu early return skips
whenever a beat menu exists. The trio ALSO fires on generic-question
turns (gqActive branch, one of the three picked at random). The r154
panel confirms the shape: agree=0, joke=0, silence=2706 (finalizeMenu's
unconditional silence append on every menu), moreOffered=0 (the beat
menu emits `dlg:more`, not `more`), followGoalOffered=0 (follow-ups
live in the skipped fallback). VERDICT: not a broken gate — a pipeline
fact. The live react surface on goal threads is `dlg:react` '(listen)'.
Whether agree/joke (endorse / deflect-with-humor) should ALSO surface
on goal threads is a DESIGN question for Steve, not a defect fix —
this run reports the read and leaves the menu surface unchanged. The
3-label 'more' pool question (r153 job E) is CLOSED: longest continuer
run 4 on the fresh panel (<5), the cycle fix suffices, no widening.

## Metric review (§14)

- M9's metric was right; the game failed it in r153 and passes it now
  on the fixed code. The fix is press-count-based as the prereg
  defined; the same-line reframe path's off-by-one is corrected by the
  same change (spend moves from the 6th press to after the 5th).
- M2's person-kind split is now printed separately (r153 metric
  review, done): maxPerInitiatorPerson=5 (Raj), mixed max=17 (Zuri).
  The cap reads on person-kind only.
- The analyzer's bond verdict text dropped its stale ordinal claims
  ("first post-build datapoint" was wrong on the third datapoint).
- M5's threshold is now MET (3/4) — the sequence is a standing
  survival fact, still reported, not re-scored.
- The M4 candidate printer flattens narrator ('narr') beats into
  'NPC' — the truth.js coach lines looked like NPC speech in print.
  Next run: preserve 'narr' through the driver transcript mapping
  and print it distinctly.
- Telemetry: `node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/social.json --current
  'evidence/2026-11-07/journey-social-life-r154-4260*.json' --metrics
  l3.bonds,l3.deepBonds,l3.betrayalCases,l3.mootsConvened,l3.gossipConvos`
  — all 5 l3.* keys LOUD-disappeared (baseline 318/168/8/7/99 →
  current 0, n=4). EXPLAINED, prereg-known schema drift: the social
  driver never emits l3.* fields (bonds live under bondEnd, moots 7 in
  the analysis). Baseline NOT rolled.

## Reachable / fun / winnable

- Reachable: yes — conversations, bonds, links, counters, and the
  recap verb all fire in wild play with no player intervention; the
  cap now fires too.
- Fun: the transcripts read as real people (Abigail's confession,
  Brian's home-as-feeling arc, Ella by the fire); the recap fix
  removes the one visible loop (a player mashing "what were we
  talking about?" now gets five honest answers and then the menu
  moves on, instead of an endless re-anchor).
- Winnable: N/A for the social leg alone; villages still die out
  (0/4 survive, best survival in the sequence).

## Next run

Rotation-b 5→6 (crisis next). Open items: agree/joke on goal threads
(Steve design question — endorse/humor alongside '(listen)'?); the
doubt probe re-offered after a deflection (mild — template variety,
no verbatim repeat); Theo's photo secret dropped on "lost my train of
thought" (watch whether the open-thread ledger resurfaces it);
analyzer NARR-line printing. Seed band for the next social panel must
be fresh (42601–42604 now used; 42101–42104 stays collided; 42501 is
a game.js line number in an old note, not a seed, but the band was
skipped anyway to keep freshness claims unambiguous).

## Closeout recovery (2026-11-08, Lane B — stale-lock recovery of the dead 02:57Z run)

The r154 coordinator died before closeout: lock playtest-loop-2.lock
(run_id 2026-11-08T05:01:07Z, no registry entry) + worktree
journey2-social heartbeat 05:26:22Z, 30+ min stale at 05:56Z recovery,
no live process, last file write 03:42Z. Per the overlap guard the run
is DEAD; lock deleted, recovery run_id 2026-11-08T06:05:20Z, tree
re-heartbeated 06:08:36Z. No fresh leg played (2026-11-01 r80
precedent): this run completes r154's closeout instead of a duplicate
social run. Rotation-b 5→6 written at closeout (crisis next).

RECOVERED STATE: the panel, prereg, analyzer, driver, helpers, both
proof tests and the run note survived as untracked files — but the
src/js/conversation.js recap-cap fix was ABSENT from disk (git diff
empty; no `_recapPresses` anywhere; proof test RED 7 failures, exactly
the wild defect: 6 presses served, spent=false). The fix was never
committed and the edit did not persist to the worktree. Re-applied
verbatim from the prereg (convoRecapLine press counter + startConvo
reset, 15 insertions, r27/r31 line content untouched).

PROOF: scripts/test-journey-social-r154-recap.js RED on unfixed code
(7 failures) → ALL PASS 16/16 after. Sibling
scripts/test-journey-social-r154.js PASS. node --check clean.

1-SEED CONFIRMATION on the re-applied fix (SEEDS=42601, DAYCAP=140,
scratch OUTDIR so the panel corpus is untouched): reproduces panel
seed 42601 EXACTLY — d110, village-lost, 13 fallen, same names/days
(Debbie d10 ambush, Nicole d29 wound, Ella d33 starvation), 89 convs,
150 recap presses, maxPresses 5, offeredAfterCap 0. The fix holds in
the wild, and the panel trajectory matches fixed-code behavior, so the
panel's M9 HOLDS stands as measured. Independent tally of the 4
committed corpora confirms the analyzer: 419 convs, 627 presses,
max 5, offeredAfterCap 0.

TELEMETRY (body step 14): same 5 LOUD-disappeared l3.* lines as r154
(baseline 318/168/8/7/99 → 0, n=4) — EXPLAINED schema drift, baseline
NOT rolled.

This closeout lands the fix + tests + tooling + evidence; rotation
5→6; lock deleted. Open items carry from r154: agree/joke on goal
threads (Steve design question); doubt-probe re-offer after
deflection; Theo's dropped photo secret; analyzer NARR-line printing.
