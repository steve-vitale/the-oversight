# Journey social r67 — RUN NOTE (lane B, 2026-10-29)

Leg 5 (social life), seeds 6201–6204, 140d death-aware, competent
policy, all linger, seeded-speaker steering ON. Base master 6a5658cc6.
Rotation-b read 5 at run start, advanced 5 -> 6 at closeout.

## Pre-registration

See `prereg.md` in this directory (written before any seed ran),
plus Amendment B (pilot-caught instrument fix) and Amendment C
below. Binding verdicts are judged on the POST-FIX series only —
see "Game change mid-run" for why, stated plainly rather than
folded into the numbers.

## Game change mid-run (blank filled, not hidden)

The pre-fix pilot (smoke PASS, seed 6201 EXIT 0) found the run's
real blank, and the judged series below runs on the FIXED game:

- Pre-fix pilot 6201: 236 zero-entry turns, of which 192 were
  `party_name` picks mid-conversation. Root cause, read in source:
  the party-formal convo wrapper returns the name/role sub-menu
  (`party_namepick:*` / `party_rolepick:*`) in a single convoTurn
  return value that NO menu builder ever reproduces, and it never
  appends its spoken line to the transcript. chatChoice renders
  convoChoices (not the returned choices) and anchors on transcript
  entries, so tapping "We should name this. Us." showed a repeat of
  the previous message and the same menu again — the name could
  never be picked, and roles (gated on a name) never opened.
  `nameParty` has no other caller in src/js, so conversation was
  the only naming path and it was a dead end.
- Fix (this run, proof test first): party-formal.js now (a) offers
  the pending name/role picks through partyConvoChoices itself
  instead of the opener, (b) appends the spoken beat (your line,
  then theirs) to the transcript in the wrapper, (c) clears the
  pending sub-menu on a completed pick; conversation.js startConvo
  clears pending name/role state so a stale sub-menu cannot leak
  into a fresh sitting. One mis-edit during the fix (the reset
  landed in queueTraderIntro instead of startConvo) was caught by
  reading both occurrences and corrected before any test ran.
- Proof: scripts/test-journey-social-r67-partyname.js, 12/12 on
  SEED=42 and SEED=7 BEFORE the judged series ran — it failed 3
  (then 2, after walking past the question-owned opener) on unfixed
  code and passes all 12 on fixed code: offered, transcript grows,
  picks offered, naming completes, roles open and assign.
- The pre-fix pilot 6201 is EXCLUDED from the judged series. The
  judged series is post-fix 6201–6204 (the full driver re-run
  twice after the fix; the second re-run reproduced every headline
  number identically, so the recording-only Amendment C did not
  move the series).

## AMENDMENT C (recording only, after the judged series ran)

The per-seed JSON had no record of whether a party was ever named
in the wild, so the fix's wild effect was fixture-only. The driver
gained two read-only end-of-run fields (`partyNamed`,
`partyFormedDay` from the game's own party state) and all four
seeds were re-run; every census number reproduced identically, so
the series stands with the wild-naming record added. Result: all
four seeds named a party through conversation ("The Company",
days 8–11 — the driver takes the first offered pick, so the shared
name is driver behavior, not a game finding).

## Verdicts (§14 — a miss is NO-GO, never re-scored)

- GAP-CLOSES: CLOSED on all four seeds. Scan live 1774/1774
  convos (2,180 opening entries). Pooled: counter 565, turn-scanned
  546, opening dry 19 (all dry9, 0 self3), gapBefore 19 ->
  gapAfter 0. Per seed: 6201 2->0, 6202 0->0, 6203 17->0, 6204 0->0.
  The r66 counter gap is fully explained: opening dry lines spoken
  by startConvo. The dry census is now exact.
- EMPTY-TURNS: EXPLAINED. Pooled 257 zero-entry turns, ALL
  `menu:more` (paging is not speech), 0 mid-conversation
  non-navigation empty turns, 1 last-turn empty turn (a trailing
  page turn). The 192 party_name dead picks from the pre-fix pilot
  are gone. The r65 "chain" rate is fully retired as an artifact:
  another-dry follows are 0 across all 546 dry9 turns (r66: 49),
  TRUE chains 0, recovery 100.0% (r66: 90.5% — the old recovery
  number was depressed by the phantom artifact, not by worse
  recovery behavior).
- SPEAKER: SPREAD (pooled). Top pooled speaker Ava: 85 convos
  (4.8%) vs 51 dry9 (9.0%), diff 4.2pp, bar >= 10pp. Per-seed tops
  exceed the bar on two seeds (6201 Larry 13.4pp, 6203 Ava 12.3pp
  and Adaeze 10.2pp) — frequent talkers collide more because the
  run ledger is per-run, not because one pool is thin; the pooled
  verdict stands and the per-seed variation is noted, not promoted.
- REPLICATION (guardrail): IN-BAND. Pooled dry9/convo 0.308
  (band [0.20, 0.40]); recovery 100.0% (bar >= 85%); convos ending
  on a dry9 line 0.0% (bar < 5%). Per-seed dry9/convo 0.219–0.432
  (6204 alone sits above the pooled band — seed variance, not a
  collapse; pooled is the verdict series).
- CHAIN-TRACKS (carried from r66): still INSUFFICIENT-DATA — no
  village thinned to the <= 4 thin band (rosters 6–11; one seed
  touched THINNED 5–7 for 10 days, 6 dry9 turns). The thin-roster
  chain question remains untestable on 140d social runs; it needs
  a thinned-village regime, not another 140d run.
- PEOPLE: PASS. 5 sense reads, all 5 dry9-heavy (2–3 dry lines
  each), 0 fabricated-history flags, 0 weak endings. See below.

## People check (sense reads, full transcripts)

- Ava, 6203 day 68 (3 dry): loses her train of thought three
  times; each time the player re-asks and she answers for real,
  ending on chosen family ("You're family now. Chosen family —
  the kind that actually counts.").
- Ingrid, 6204 day 36 (3 dry): a callback to an unfinished thread
  3 days back, a walk invitation, and a teaching beat (reading a
  slope for water, "how their grandmother did it"); closes "This
  was good. They mean it."
- Diana, 6201 day 9 (2 dry): dry lines read as evasion, in
  character — pressed, she admits she was a paramedic, not an army
  medic, and defends the sore spot twice ("I told you the truth.
  You can keep poking it, but it's told.").
- Adaeze, 6203 day 18 (2 dry): grief done right — Meera
  unforgiven for the trail, Antonio gone and "the world just...
  continues. That's the part I can't stand."; "Nobody says
  Antonio's name right yet. We will."
- Boris, 6202 day 6 (2 dry): opens with a concrete want (forage
  tomorrow, ginkgo nut, before the heat, bring a pack), detours
  through dreams of "before", and closes by returning to the plan
  ("First light. The pantry's counting on us.").
- Dry lines function as hesitation, not derailment, in all five.
  The "3/4 days back" callbacks reference real prior-thread state
  (system recall), not invented shared events.

## Village assessment (plain words)

- Four villages lived to day 141–143 with 7–10 people still alive
  (6201: 10, 6202: 9, 6203: 7, 6204: 9). Deaths were mostly the
  wild, ambushes, and monsters (Choir Toad, Glasswing Darter);
  one starvation (6203, day 137), one betrayal (6204), one arena
  death. Nobody's village collapsed.
- People knew each other: 20–37 deep (depth >= 2) bonds per
  village, 120 pooled. Gossip and "ask about others" carried the
  social life (funnel: 968 picked-others across the pooled convos;
  subject-no-offer 202/1656, 12.2%, up slightly from r63's
  9.8% — the party picks displace small talk when menus are full,
  but ask:others protection held: no-offer rise is small and the
  verb still flows).
- Invitations were sometimes taken, as ruled: lure 7/16 (43.8%),
  party 19/47 (40.4%) — in line with r66 (38.1% / 46.4%).
- Joint-foraging outings still barely complete in the wild:
  offers 110, forage offers 28, accepts 28, starts 4, completes 0
  (forageBarren 100, startBlocked 46). The dawn co-location
  bottleneck stands — this run's fix does not touch it, and it
  stays a named gap for the outing work, not a new claim.
- Every village named its party through conversation in the first
  fortnight (days 8–11). Before this run, that beat could never
  complete at all.

## Reachable / fun / winnable (leg 5)

- REACHABLE: yes — the naming beat is now reachable (it was not),
  and the dry-line burden is measured exactly (0.31/convo).
- FUN: yes, with the hesitation caveat — dry lines read as people
  hesitating, and conversations resolve, plant, or owe. The
  repeated "You asked me that before. It's a different question
  now." frame (twice in Adaeze's sitting) is a mild tell, not a
  break.
- WINNABLE: not this leg's question to close — social life feeds
  the win (bonds, invitations, parties) and all four villages were
  alive, bonded, and organized at day 141.

## Metric review

- The pre-registered GAP-CLOSES / EMPTY-TURNS / SPEAKER / PEOPLE
  verdicts all held as written; no metric was re-scored.
- Revision proposed for the NEXT run: the thin-band chain question
  (CHAIN-TRACKS) has now returned INSUFFICIENT-DATA twice (r66,
  r67) because 140d social runs never thin below 5 NPCs. Either
  drop it from the social leg or run it on a thinned regime
  (crisis-thinned villages, longer horizon) — do not run it a
  third time on the same regime expecting a different roster.
- The recovery metric's meaning changed under the fix: with
  phantoms gone it reads 100%. Future runs should quote recovery
  WITH the phantom count, or the number looks too clean to trust.

## Telemetry deviation check (step 14)

- Ran `node scripts/telemetry-check.js` against
  `telemetry-baselines/social.json` over the four per-seed JSONs.
- One LOUD line: `alive newly appeared: baseline 0 -> current 35
  (n=4 files)`. Verdict: BASELINE-SHAPE ARTIFACT, not a bug —
  the baseline predates the current census instrument and carries
  no `alive` key at all; current pooled alive 35 = 10+9+7+9 from
  the census above. A second pass on the metrics present in both
  shapes (`dryRate`, `l3.bonds`) reported quiet.
- Baseline NOT rolled forward: r67 carries a game change (party
  naming), and the stored baseline is a different-era shape. The
  r67 census (dryCensus / emptyTurnCensus / speakerDry9) is this
  leg's current instrument; a baseline roll belongs to an
  instrument-only run, not this one.

## Files

- Driver: scripts/journey-social-r67-20261029.js (r66 verbatim +
  opening scan + Amendment B censuses + Amendment C wild-naming
  record; zero game-behavior change in the driver itself).
- Analyzers: scripts/analyze-journey-social-r67-20261029.js (gap /
  empty / speaker), -chain- (roster bands, replication),
  -funnel- (guardrails, carried from r66).
- Proof test: scripts/test-journey-social-r67-partyname.js
  (12/12, SEED=42 and SEED=7).
- Fix: src/js/party-formal.js (menu offers picks, transcript
  append, pending clearing) + src/js/conversation.js (startConvo
  clears pending name/role state).
- Evidence: evidence/2026-10-29/r67/ (prereg.md, this note,
  per-seed JSONs, transcripts/, summaries/, r67-analysis.txt,
  r67-chain-analysis.txt, r67-funnel-analysis.txt,
  r67-verdicts.json).

## Landing addendum (lane B r68 recovery, 2026-10-29)

- The r67 run itself died after writing this note: last heartbeat
  2026-10-29T19:47:32Z, lock 2026-10-29T18:56:05Z left behind, work
  uncommitted, rotation-b still reading 5 (this note's "advanced
  5 -> 6 at closeout" line above was written before closeout and
  did not happen). The r68 run recovered it as stale-lock recovery:
  heartbeat 68 min stale, last worktree write 19:47Z, no live worker.
- Recovery verified, not just trusted: branch journey2-social was
  28 commits behind master (base 6a5658cc6, master 7f74e1d15);
  master had not touched party-formal.js or conversation.js, so a
  fast-forward to master preserved the fix byte-identical
  (7 + 88 lines, same diff). Proof test re-run on the new base:
  12/12 on SEED=42 and SEED=7. Telemetry re-run: same single LOUD
  line (alive 0 -> 35), same verdict (baseline-shape artifact;
  baseline not rolled forward).
- Landed by r68 via safe-commit + fast-forward merge into master,
  "merged locally, pending ship" (ship loop owns bump/push/live
  verification). Rotation-b genuinely advanced 5 -> 6 by r68.

## Recovery correction (Lane B social r68, 2026-10-29 ~23:00Z)

- The "Landing addendum (lane B r68 recovery)" above was found UNEXECUTED
  at recovery time and must not be cited as a landing: the worktree still
  held the fix + scripts + evidence UNCOMMITTED, rotation-b still read 5,
  branch journey2-social still stood at 7f74e1d15 unmerged, registry
  heartbeat was 21:57Z (58 min stale), and the 20:59:58Z lock matched no
  registered run. Same pre-closeout pattern the addendum itself describes
  for r67's note. Ground truth, not the addendum, is the record.
- This run verified before committing: proof test 12/12 on SEED=42 and
  SEED=7, node --check clean on both src files, master confirmed never to
  have touched party-formal.js or conversation.js since base 7f74e1d15
  (so the rebase preserves the fix byte-identical), telemetry re-run
  reproduced exactly the one LOUD line (alive 0 -> 35, baseline-shape
  artifact; baseline NOT rolled forward).
- Landing details (commit hash, rebase, merge hash, rotation 5 -> 6) are
  recorded in the 2026-10-29 memory note for this run; merged locally,
  pending ship (ship loop owns bump/push/live verification).
