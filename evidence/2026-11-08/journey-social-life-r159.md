# Journey social life r159 — run note (Lane B, 2026-11-08)

Leg 5 (social life). Rotation-b read 4 at run start; this run played 5
and writes 6 (crisis next). Rotation stayed 4 because r158's closeout
never landed — its coordinator died after the gate adjudication.
Base: master 15f498359 (r158 merged via adoption this run, see below).
Seeds 42701–42704, DAY_CAP 140, policy journey (socialite base + real
conversations). Driver scripts/journey-social-life-r159-20261108.js,
analyzer scripts/analyze-journey-social-r159-20261108.js, helpers
scripts/journey-social-r159-helpers.js, proof
scripts/test-journey-social-r159.js +
scripts/test-journey-social-r159-narr.js.

## Adoption first: r158 endgame closeout (this run)

Stale-lock recovery: lock `2026-11-08T20:04:56Z` (no registry entry
for that run_id; the journey2-endgame tree's heartbeat 22:59:41Z was
56 min stale) → dead run per the body rule. Lock deleted, new lock
`2026-11-09T00:03:00Z` written. Main tree clean, disk 30%.
`git pull --ff-only` FAILED: local master is 142 commits ahead of
origin/master and 76 behind (Codex PR merges #49/#50, OVE- work, on
origin but not in local master). This is the standing loop state —
loops land locally, the ship loop owns pushes and reconciliation —
so this run proceeded on local master per the loop body's procedure
(merge locally, never push) and reports the divergence LOUDLY here
rather than stopping: the ship loop's 3-way merge owns it. No
rebase/force-push attempted.
r158 adoption: branch journey2-endgame held 2 clean commits
(evidence + docs/TABLE.md lesser-seat bar + ladder-line proof test;
no game code). Rebasing onto master 93e7bea26 was clean (master
untouched TABLE.md in range); proof test 9/9 on the rebased tree;
the 292/8 gate adjudication from r158's note stands (all 8 failures
pre-existing/load, none attributable — the branch carries no game
code). Merged ff-only as 15f498359, tree released, branch deleted,
rotation 4→5. The r158 note's claim that "main session finished
the closeout (merge, release, rotation 4→5)" was NOT true on the
ground — the branch was unmerged, rotation still 4, tree still
registered. The adoption completed it.

## Panel verdicts (binding, §14)

- M1 arming motive: GO — 8 plots, all 8 grievance-linked at arming;
  2 grievance-holder → later leader cases (Ethel, 42702, plots 3
  and 5 after Ivy ambushed her d11). 0 plots after d30, so the
  drought bound is NOT re-broken (noted, not re-confirmed).
- M2 villager-initiated bonds: ANSWERED — 92 villager-initiated
  proposals (34 person, 58 link), 31 accepted (14 person, 17
  link); end bonds 78/85/67/70. Person-kind per-initiator max 5
  (Rafael) — within the amendment-5 cap ≤8/90d, so the cap HOLDS
  on the person-kind split. Mixed max 13 (Nora, link-heavy) — the
  mixed number is NOT the cap. Fourth datapoint with the
  bond-initiate build live.
- M3 invite refusal (report): party accept 17 / decline 20 (player
  invites); lure accept 8 / decline 6 (NPC invites); bond accept 2
  / decline 6 (NPC invites). Every lure was taken or refused, never
  ignored — split by inviter in the analysis.
- M4 sense: GO — 4/4 candidates pass cleanly. Ruth's confrontation
  + librarian confession (42701); Heinrich's deflections then
  "I'm not from Denver. I'm from Columbus, Ohio. I wanted an
  edge... I used it." (42702); Amelia's dream arc — Columbus,
  Ohio, the street that keeps getting longer (42703); Leo's
  deflections then "I don't actually want to belong somewhere. I
  want to keep everyone fed." (42704). Warts, documented not
  failed: the doubt probe pressed 4× in one sitting (Ruth, re-offer
  after deflection, template-variety deflections, no verbatim NPC
  repeat); the NARR coach line repeats verbatim 2–3× in two
  sittings (see Blanks/watch items); dropped threads never
  resurface (see below).
- M5 census guardrail: 0/4 villages past d100 — threshold NOT MET.
  Dark-channel verdicts are within-window only. Sequence now
  1/4, 1/4, 0/4, 1/4, 0/4, 0/4, 0/4, 2/4, 3/4, 0/4. Villages ran
  d46–d88; 9–19 fallen each. The scholar's mantle passed 30 times
  across the panel (7/11/5/7).
- M6 gossip-position: GO (re-aligned gate definition) — 0
  naming-beat lines emitted beyond radius-1 of Haven; 131 debates
  kicked and settled. Strict on-tile away total 39 — the known
  metric/gate definition discrepancy, NOT a failure this run
  (prereg).
- M7 dedupe: HOLDS as instrumented — 92 near-dup flags across 246
  transcripts, all in legitimate-variety families: recap reframe
  pairs, nonverbal nod variants, pantry/creek favor reframes,
  teaching templates (same frame, different plant), landmark
  templates. No verbatim same-beat repeat in a fixed NPC pool.
  Caveat (new this run, see metric review): the near-dup scan
  covers NPC lines only; the NARR coach line repeats verbatim
  (7× panel-wide) and is invisible to M7 as instrumented.
- M8 counter-settle: NO COUNTER STAGED — vacuous. 17 proposeLink
  calls, all fresh, 0 counters, 0 settles. Nothing to confirm; not
  a failure. Counter staging is rare (2 in r154, 0 here).
- M9 recap cap (re-confirmation): HOLDS — maxPresses 5,
  totalPresses 208, offeredAfterCap 0, capFailures 0 across all 4
  seeds. The fix holds in the wild on the second panel.

## Village assessment (plain words)

All four villages were lost (d88/d67/d46/d82; 9–19 fallen each).
The wild did most of the killing (34 of 62), then sickness (7 —
five of them on 42704), monsters (6), starvation (4), thirst (2),
wounds (2), strangers (3), the arena (2). One village, 42703,
ended at day 46 with five people still alive — the shape matches
the scattering (pantry-empty) end, not extinction, but the corpus
carries no village snapshot or end say-line to confirm the
hungry-days count (instrument gap, see below). And yet social life
was dense while it lasted: 246 full conversations (233 natural
ends), 92 villager-initiated bond proposals, 31 accepted, 17
village links formed via proposals, 131 naming debates kicked and
settled, 39 feasts, 6 moots. Two villages never held a moot at all
(42702, 42703). The social fabric held while the village died
around it: villagers proposed, debated, confessed, taught, and
mourned; the village still ran out of people — or, on 42703, out
of food while people lived.

Per seed: 42701 d88 fallen 19 (wild 8, starvation 3); 42702 d67
fallen 18 (wild 12); 42703 d46 fallen 9 (wild 7) — scattered, 5
alive; 42704 d82 fallen 16 (sickness 5, wild 7).

## Blanks filled (1 tooling fix, scripts/ only — no src/js change)

NARR-LINE PRINTING (r154 open item). The driver flattened every
non-'you' transcript entry to 'NPC' at three sites, so truth.js
codex-gated coaching beats (`{ who: 'narr', text: '*...*' }`)
printed as NPC speech in M4 candidates. Fix: shared mapper
`mapTranscriptEntry` in the r159 helpers (you→YOU, narr→NARR,
anything else→NPC), used at all three driver transcript sites.
The analyzer needed no change — it prints `e.who` verbatim, and
its NPC-lines filter for near-dup flagging correctly excludes
narrator coaching. No game behavior changes: the mapper touches
only what the driver records.
Proof: scripts/test-journey-social-r159-narr.js ALL PASS (14/14)
on fixed code; the old inline expression, quoted verbatim as the
defect specimen, maps a narr entry to NPC. The panel corpora are
the live proof: 38 NARR lines print distinctly (11 distinct
texts), including the `*Confessions need weight...*` coaching
lines r154 saw flattened as NPC speech. No NARR line reads as NPC
speech (no quoted dialogue, no first-person NPC voice) — the
mapper does not over-reach. Smoke-catch: the r159 driver initially
kept the r154 output filename template (smoke wrote
journey-social-life-r154-42701.json); fixed before the panel, no
panel impact.

## Watch items (documented, not fixed this run)

- DOUBT-PROBE RE-OFFER (r154 wart, persists): `dlg:doubt` ("That
  doesn't quite add up") re-offers after a deflection and can be
  pressed 4× in one sitting (Ruth, 42701). The deflections vary by
  template, no verbatim NPC repeat — a real interrogation dynamic,
  not a loop bug. The re-offer tally's headline (238/246
  conversations with a re-offer, panelMax 12) is dominated by menu
  furniture (`leave`/`silence` offered every turn); the meaningful
  signal is dlg:doubt 4, recap offers 5–7, dlg:subject 5–8.
- NARR COACH-LINE REPEAT (new visibility from the NARR fix): the
  coach line `*They've deflected you before. The evidence needs to
  be heavier this time — one more thread before you speak.*` fires
  7× panel-wide, 3× in Leo's sitting and 2× in Heinrich's. The
  other NARR texts are stage-direction beats (4–5 occurrences each
  across the panel, once per sitting — a small cycling pool, fine).
  The coach repeat is the System repeating its hint to a player
  who keeps pressing doubt without new threads; whether the System
  should vary it or say it once per sitting is a design call, not
  a defect fix this run. The fix shape (vary the line / suppress
  after first telling) is recorded for the next run.
- DROPPED THREADS NEVER RESURFACE (Theo's photo-secret pattern
  generalizes): 9 "lost my train of thought" drops across 246
  conversations. In 7, a later sitting with the same villager
  opens on a NEW topic (a wound, hunger, the creek run) — the
  dropped thread does not come back. In 2, no later sitting
  exists. None of the 9 drops replaced a promise (contexts are
  landmark/teaching/wound topics), so no canon violation. Pattern
  note: 4 of the 9 drops follow the player asking "What places
  have you found out there?" after the NPC offered a landmark
  ("an old trapline — I'll show you on the map sometime") — the
  landmark thread dies on the follow-up question. Watch whether
  the open-thread ledger is meant to carry landmarks across
  sittings.
- 42703 SCATTERING (instrument gap): village-lost at d46 with 5
  alive. By elimination the scattering path (game.js: the pantry
  empty for 3 hungry days, people walk away — extinction needs 0
  living, no-successor needs no candidates), but the corpus
  carries no village snapshot, scattered flag, or end say-line to
  confirm. Next run: capture `v.scattered` / hungryDays at end in
  the driver evidence.
- RE-OFFER TALLY FURNITURE: the tally counts `leave`/`silence` on
  every turn, so its headline is unreadable without filtering.
  Next run: exclude structural ids from the panelMax/rows (keep
  the raw perId for audit).

## React shape (r153/r154 open question — report, no fix)

The shape holds on the fresh panel: agree=0, joke=0,
silence=1618 (finalizeMenu's unconditional append on every menu),
moreOffered=0, followGoalOffered=0, longestContinuerRun=4 (<5 —
the 3-label 'more' pool suffices). `dlg:react` '(listen)' is the
live react surface on goal threads. Whether agree/joke should ALSO
surface there remains a DESIGN question for Steve; the menu
surface is unchanged this run.

## Metric review (§14)

- M7's instrument covers NPC lines only; the NARR coach repeat is
  real but invisible to it. M7 HOLDS as instrumented; the next
  run should decide whether the near-dup scan includes NARR lines
  (a coach line is a fixed pool of one — a repeat there is a
  different claim than an NPC-line repeat).
- The re-offer tally needs structural ids (leave/silence) excluded
  from its headline numbers — recorded above as a next-run change,
  not a re-score.
- M8 was vacuous (0 counters). No bar change: the metric stands,
  the panel simply staged no counter. The counter-staging rate
  (2 in r154, 0 here) is itself the observation.
- M5's threshold is now NOT MET (0/4) — the sequence is a standing
  survival fact, still reported, not re-scored.
- M2's person-kind split is printed separately as specified:
  maxPerInitiatorPerson=5 (Rafael), mixed max=13 (Nora).
- Telemetry: `node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/social.json --current
  'evidence/2026-11-08/journey-social-life-r159-4270*.json' --metrics
  l3.bonds,l3.deepBonds,l3.betrayalCases,l3.mootsConvened,l3.gossipConvos`
  — all 5 l3.* keys LOUD-disappeared (baseline 318/168/8/7/99 →
  current 0, n=4). EXPLAINED, prereg-known schema drift: the social
  driver never emits l3.* fields (bonds live under bondEnd, moots 6
  in the analysis). Baseline NOT rolled.

## Reachable / fun / winnable

- Reachable: yes — conversations, bonds, links, debates, and the
  recap verb all fire in wild play with no player intervention;
  the recap cap fires too, and narrator coaching now reads as
  narrator coaching.
- Fun: the transcripts read as real people — Ruth hiding her old
  life as a librarian, Heinrich admitting he used the new
  scholar, Amelia dreaming of the street that keeps getting
  longer, Leo confessing he just wants everyone fed. The
  confrontation arcs (deflect, deflect, confess) are the best
  social content in the sequence.
- Winnable: N/A for the social leg alone; villages still die out
  (0/4 survive, and one scattered while people lived).

## Next run

Rotation-b 5→6 (crisis next). Open items: agree/joke on goal
threads (Steve design question); doubt-probe re-offer (mild,
template variety holds); NARR coach-line repeat — vary or
suppress after first telling (design call); dropped threads never
resurface + landmark follow-up dead end (open-thread ledger
question); 42703 scattering confirmation (capture scattered flag
at end); re-offer tally furniture filter; M7 NARR-scan question.
Seed band for the next social panel must be fresh (42701–42704
now used; 42101–42104 stays collided).

## Gate

ADJUDICATED by adoption (Lane B 20:00 run, 2026-11-09T02:02Z, this
occurrence — r159's coordinator timed out at bookkeeping; nothing
below is taken on the run's word).

- Proof tests re-run by the adopter on the rebased tree (master
  6e69df4ef): scripts/test-journey-social-r159-narr.js ALL PASS
  (14/14); scripts/test-journey-social-r159.js RESULT: PASS. Both
  also passed on the original base 15f498359 before the rebase.
- Full gate (check.js) as run by r159 on base 15f498359:
  296 passed, 4 failed in 657s (log
  evidence/2026-11-08/journey-social-life-r159-gate.log). The 4
  failures were re-run individually by the adopter on the rebased
  tree and reproduce identically: test-mobile-combat-cadence.js
  (enemy-announced / Continue-wrap), test-occupation-panels.js
  (real CLI workflow), test-phone-frame-proof.js (stale phone
  receipt — 3 assertions), test-establishment-r20-fixes-20261020.js
  (racks-full next-day voice: expected 2, got 1). The branch
  carries no src/js change and touches none of those areas, so all
  4 are PRE-EXISTING on master, none attributable to this branch.
  Gate: GO with 4 pre-existing failures (not re-run in full — the
  per-test reproduction on the rebased tree is the attribution
  check; a full 11-min re-run would re-prove nothing new).
- Telemetry re-run by the adopter: same 5 LOUD lines
  (l3.bonds/deepBonds/betrayalCases/mootsConvened/gossipConvos
  baseline → 0). Verdict stands EXPLAINED — prereg-known schema
  drift, the social driver never emits l3.* fields. Baseline NOT
  rolled.
- Rebase: branch journey2-social (0 commits, all work untracked)
  rebased onto explicit master SHA 6e69df4ef, clean; proof tests
  re-run after. Merge ff-only, tree released, rotation 5→6.
