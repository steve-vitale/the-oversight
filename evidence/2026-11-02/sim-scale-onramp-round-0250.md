# sim-scale-onramp-round-0250 — Loop A 0250Z: sum-trigger muster call + titan ghost stop

Run: fleshout-loop-a-20261102T0250Z, axis scale-onramp (converging, NOT
converged). Sibling Loop B live on food-economy throughout (0047Z claim,
then its next-blank arms gardenpool/gatefloor/tasktag appearing mid-run) —
NOT touched. Rotation file untouched (convergence-directed axis work
supersedes rotation; rotation stands at 3). Both arms LANDED, merged
locally, pending ship. No version bump, no push, no live verification —
the batch ship job owns deploys.

## Stale-lock recovery at run start (read first)

The 0045Z Loop A lock was 2h old with no registry tree for that run_id,
no fleshout processes running, and all three of its arms already on
master (quotatrigger e645d7f46, trustbleed 716781d93, heraldkill
978ff20cf). Per the guard, that run was DEAD: lock replaced, its claim
retired to `.DEAD` with a note. The main session's own recovery of the
0045Z closeout then landed mid-run (commit 9da23adc5, coordinator
evidence for quotatrigger NO-GO / trustbleed recovery EXISTS / heraldkill
HURTS) — that tree was NOT touched, and this round's tracker review
below does not re-do its closeout. This round takes the 0045Z delivery
specs, per DELIVER OVER MEASURE (2026-11-01): decision-grade work that
delivers, not another round of re-proving.

## Arm 1 — sim-sumtrigger-a: PILOT GO (policy-side, zero src/js)

What it is: the quotatrigger delivery spec built as a policy variant
(`scripts/policies/sumtrigger.js`) — sound the titan call when projected
allied yield + Haven commit >= 10, summing per-link quotas (6 trusted,
else 2) capped by generated-roster free adults, with NO weakest-link
veto, at the first ready moment. Commits (rebased onto master, merged
--ff-only): fc1f4f585 prereg (BEFORE any judged sim), fd752cecb policy +
replay + split + validator + unit proof, 876710046 pilot evidence +
corpus. Post-merge proofs green: validator `test-sumtrigger-a.js pilot`
VERDICT GO fails=0; `test-sumtrigger-policy.js` 16/16.

Before/after on identical seeds (8 seeds, DAYS=180, frozen quotatrigger
stack; baseline = quotatrigger corpus):

- Trigger defined 6/8 (bar >= 6/8 — PASS; baseline every-link: 5/8).
  The gain is 95425, the bleed seed, firing at its first refusal
  (day 157) before the bleed.
- Sounded yield >= 10 on 6/6 sounded seeds, and projected == sounded
  EXACTLY on 6/6 (allies 7/10/11/13/11/17; Haven 3/3/3/3/2/2).
- Fight outcome recorded 6/6: same-day fight, result 'won', Herald
  slain same day, 6/6. No later refusals or fights.
- Guardrails 6/6: link count unchanged 3->3, all responders verified,
  all instrument/muster/interceptor/projection errors 0.
- Median survival 134.5d vs baseline 108d (bar: no worse — PASS).
- Wall (sum pilot): national(end) 5/8, table 5/8, won 3/8, wave-4 8/8,
  wave-5 2/8; ends: lesser-seat win 3, village-lost 2, survived 3.
  Baseline: 6/8, 4/8, 2/8, 8/8, 2/8. Deltas are single-seed tail moves
  — NOT claimed as improvement. No full-seat win under either trigger.
- Casualties, measured for the first time: 5/6 fights cost ZERO
  allied/Haven lives in-fight. 95438 cost 4 allied lives (all day 86,
  cause 'combat'). Haven's 4 'off-roster' flags are later bearer
  deaths (days 121–152, 'the wild'/'contest'), NOT fight deaths —
  the arm evidence corrects this conflation explicitly.

Two findings a deploy arm must carry:

1. 95423's weakest-link counterexample DISSOLVES once refusals are
   counted. Emberhold (72/20) carries arrears 3000, so the call refuses
   it; faithful projection is 6 allies + Haven <= 3 = max 9/10 —
   correctly never fires. A naive quota-sum ignoring refusals hits 10
   on all 11 rows and would sound a 9-blade muster that fails the hard
   gate. A deploy rule must respect refusals. The untrusted link (46)
   still counts its 2 — no weakest-link veto.
2. 90111 proves no-veto firing at EXACTLY 10 (3+2+2 allies + 3 Haven,
   Stonebridge 49 and Thornfield 68 both untrusted) — but it is also
   the one seed where the pre-registered generation side effect moved
   the timeline (trigger 88->97, trusts reshaped; tail flips
   lost->lesser-win, entangled, n=1, not a claim). The other five
   sounded seeds fired on their first refusal row with trigger days
   matching baseline exactly. A deploy arm must choose lazy vs eager
   roster generation explicitly. Haven availability moves within
   bursts (95423: 3->0 same day; 95411: 0->3 across days) —
   projections are momentary, never cached.

Panel (§15): declared NOT APPLICABLE with the quotatrigger-class
justification (event-triggered trigger-moment census, not a
sweep-compare policy run; no panel fabricated). Before/after is direct
on identical seeds vs the quotatrigger corpus. No [needs-eyes] (policy
measurement only). Confirm NOT run per prereg: it needs a resumed screen
at 95447 with its own prereg — a follow-up run's job.

## Arm 2 — sim-titanghost-a: B1 GO + B2 GO (game code, titans.js only)

What it is: the heraldkill Layer-1 ghost stop plus the trustbleed hunger
legibility spec. Commits (rebased onto master, merged --ff-only):
20174f481 prereg + probe + analyzer (BEFORE any judged sim),
b73beec3f B1 ghost stop [needs-eyes], c0ab17918 B1 follow-up:
campaign-node presence + 6 fixtures [needs-eyes], 02891e9dc B2 hunger
legibility [needs-eyes]. Post-merge proof green:
`test-titanghost-a.js` 21/21 (13 B1 + 2 follow-up + 6 B2).

B1 — stop the ghost (all 5 prereg bars): new `titanMonsterPresent`
helper (def.monster id, or any campaign-node id). `titanEscalate`
returns early for an absent titan; `soundTitanCall` says the
nothing-located line and returns null without creating a muster;
`titanCommitOwn` refuses with the same line (slain-first kept; a
pending commit for an absent titan lapses). Before/after on the
heraldkill kill seeds (95402/95433/95438/95439/95440, DAYS=180,
tableseat-nowait + fullseat-diag + wavegate-diag stack):

- Phantom Herald escalation lines: 26 -> 0 (per seed 2/4/6/6/8 -> 0).
- Musters formed against the absent titan: 5/5 -> 0/5 (call null,
  commit null both taps, Haven 0).
- Upkeep charged after probe call/commit: 0 kcal on all 5.
- Guardrail controls (95423, 95413, Herald alive): BYTE-IDENTICAL
  call/commit/blades/upkeep before vs after.
- Panel (§15, context only): base vs B1, competent, 95423/95413, 180d
  — decision `review_required` on n=2 only; all 23 metrics paired
  delta 0.
- B1 follow-up: Network campaign nodes are objects ({id, monster}),
  not strings — the helper now counts node monsters too (live summoned
  Networks spawn all nine pieces, heart included, so live play was
  covered, but the helper is now correct for all march states). Plus 6
  more fixtures that set stage-2 omens without placing their titan.
  13 fixture files touched total, NO assertion changed in any of them.
- Secondary consequence (not verdict-driving): 95433 (lost d152) and
  95439 (lost d174) now SURVIVE to 181d — the ghost strikes were
  killing villages, not just lying.

B2 — hunger legibility (all 5 prereg bars, narration only, NO balance
change): hunger line now states "trust −2 per fire per day";
`titanMusterUpkeep` writes one `link.history` entry per charged link
per hunger day (kind `muster-hunger`, amount −2). On the trustbleed
intervened 90111 twin (replay unmodified, MODE=intervene, DAYS=180):

- Hunger days identical before/after: 35 days, 73–107; price line 35/35.
- History entries: before 0 -> after EXACTLY 90 (3/active link/day,
  days 73–102; 0 on broken-link days 103–107), all amount −2 — judged
  by a new snapshot-diff instrument, because the replay's history
  stream saturates at the 40-entry cap and misses entries after ~day
  90 for ALL kinds (documented in the arm's metric review).
- No balance change: per-link trust series byte-identical, end fields
  identical (village lost day 107, regional), say lines identical
  except the price clause (306 vs 306).

Layer 2 NOT built (re-placement, kill-gating, slain credit) — Steve's
design call. The road stays bricked after a field kill but is no longer
billed: call/commit buttons still appear for a dead-but-unslain Herald,
but now refuse honestly.

## Village assessment (plain words)

The village's friendships decide the titan road before the Herald ever
arrives, and this round finally measured the call itself rather than
the trigger. When the friendships are there, the sum rule sounds the
call at the first ready moment and the fight happens the same day and
is won — five of six fights without losing a single allied life. When
one friendship is weak, the old every-link rule said "never"; the sum
rule says "not yet" honestly, because it counts who would actually
answer, refusals included. And the road's cruelest bug is fixed at its
root: a village that killed its own Herald was still being charged for
a monster that did not exist — phantom night-strikes eating pantry
food and cutting friendships, hard enough to kill two villages
outright. Now the dead Herald is silent, the call refuses honestly,
and the hunger price of a standing muster is written where the player
can read it. What is still missing is the decision only Steve can
make: what a field kill MEANS — whether the road restarts, refuses, or
counts the kill. Until he rules, the road after a kill is honest but
still closed.

## Reachability verdict

- Muster call by sum rule: REACHABLE in policy (6/8 pilot, fights won
  6/6). Game-side deploy (when the game itself sounds or prompts)
  still owed; the deploy prereg must respect refusals, choose lazy vs
  eager roster generation, and never cache projections.
- Titan road after a Herald field kill: still BRICKED by design-call
  absence (Layer 2 unruled), but no longer HARMFUL — ghost billing is
  0, ghost strikes are 0, the call refuses honestly.
- Full seat: still 0 on every measured band this round (sum pilot 0/8
  under either trigger). Wave 5: 2/8 on the sum pilot band (tail seeds),
  0 on the heraldkill kill-seed band by construction (descriptive
  only). The scale wall stands: national reached, table reached, wins
  real through the lesser seat — the full seat is not yet won anywhere.

## Blanks filled / documented

- FILLED (policy): sum-trigger muster call judged on 8 seeds — trigger
  6/8, projection exact 6/6, fights won 6/6, casualties 0 on 5/6.
- FILLED (game): ghost stop landed — phantom lines 26->0, ghost
  musters 5/5->0, ghost upkeep 0, alive-titan controls byte-identical.
- FILLED (game): hunger legibility landed — price line 35/35, history
  entries 0->90 exactly, trust series byte-identical.
- DOCUMENTED (not built): Layer-2 titan meaning (steve-call); deploy
  rule details (refusals, generation timing, momentary projections);
  confirm band for sum-trigger (resume screen at 95447, own prereg);
  replay history-stream 40-entry cap (instrument limitation, all
  kinds, not just muster-hunger).

## Metric review (no bar changed here)

1. Panel declarations differ by arm and are each justified in the arm
   evidence: sumtrigger quotatrigger-class N/A (trigger-moment
   census); titanghost context-only panel (n=2, review_required on
   sample size alone, all 23 observed deltas 0). No panel fabricated
   for either arm.
2. Sumtrigger validator usage is `test-sumtrigger-a.js pilot` (the
   `<prefix>` is the corpus file prefix, not a path) — the coordinator
   first ran it bare, got the usage line, and re-ran correctly:
   VERDICT GO fails=0.
3. Titanghost quick-check accounting is the worker's, not re-run by
   the coordinator: 6 failures remain pre-existing at base (stale
   measurement proofs, phone-frame receipt, mobile-combat-cadence,
   occupation-panels, establishment-r20). The ship loop's check is
   the confirming run.
4. National here is END-of-run scaleRank, matching the 0045Z arms'
   convention; ever-national is never mixed in.

## Infrastructure notes

- Rebase stop-at-pick quirk hit THREE times on the titanghost branch
  (twice on the first rebase, once on the second): the pick appears in
  both done and todo, tree clean, pick unapplied. Recovery per
  AGENTS.md both times: verify clean + unapplied, `git rebase
  --continue` — sails through. Final logs show each commit exactly
  once; no todo edits, no aborts.
- Safe-commit index clobber hit all worker commits (both arms);
  workers repaired via HEAD-blob cacheinfo and verified clean each
  time. Coordinator merges showed no clobber (main index clean after
  both merges, verified).
- Pre-flight reap auto-removed the 4h-stale build-capable-bisect tree
  (branch kept, 1 commit ahead of master — build coordinator's, NOT
  touched beyond the mandated reap).
- Titanghost worktree removal first failed (its `.git` file was gone,
  worktree "prunable"); recovered with `git worktree prune` + branch
  delete (branch was already fully merged: master == branch tip). No
  work lost; both worker branches deleted, trees removed.
- Master moved repeatedly under the run (journey r99/r100 landings,
  main-session 0045Z evidence 9da23adc5, succession r100 closeout):
  both arms rebased clean onto the moving tip before merging; no
  merge conflict, no force, no sibling branch touched.

## Corpus

- evidence/2026-11-02/perseed-sumtrigger-a/ (pilot stdout/stderr + 8
  per-seed JSONs); scripts/policies/sumtrigger.js,
  scripts/sumtrigger-replay-20261101.js,
  scripts/sumtrigger-split-20261101.js, scripts/test-sumtrigger-a.js,
  scripts/test-sumtrigger-policy.js.
- evidence/2026-11-02/perseed-titanghost-a/ + titanghost-b2-*.json;
  scripts/sim-titanghost-a-probe.js, scripts/sim-titanghost-b2-snap.js,
  scripts/test-titanghost-a.js; panel base/B1 `.json.gz` + compare
  `.md` in the arm evidence dir.
- Arm evidence: evidence/2026-11-02/sim-sumtrigger-a.md (+ prereg),
  evidence/2026-11-02/sim-titanghost-a.md (+ prereg).

## Telemetry deviation check

See coordinator closeout (run after this file's merge): telemetry-check
against hidden_files/telemetry-baselines/scale-wall.json on the
per-seed corpora above, metrics national,table,wins,exiled. LOUD lines
(if any) reported in the run note with verdicts; baseline NOT rolled
forward on a refusal or an unexplained deviation.

Merged locally, pending ship.
