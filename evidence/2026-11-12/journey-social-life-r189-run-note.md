# Journey social life r189 — RUN NOTE (Lane B, 2026-11-13, adopted as r190)

Leg 5 (social life). Rotation-b read 5 at run start; this run plays 5
and writes 6 (crisis next) at closeout. Prereg:
evidence/2026-11-12/journey-social-life-r189-prereg.md (written by the
r189 coordinator; this run adopts and completes it — see Adoption).
Base: master dc95859a8 (Version bump f06c8e4e7-20261113-052450, batch
ship). Seeds 43801–43804 (fresh band, checked in the prereg), DAYCAP
140, policy journey (socialite base + real conversations). Driver
scripts/journey-social-life-r189-20261112.js, analyzer
scripts/analyze-journey-social-r189-20261112.js, helpers
scripts/journey-social-r189-helpers.js. Analysis:
evidence/2026-11-12/journey-social-life-r189-analysis.txt.

## Adoption (read first)

The r189 coordinator registered journey2-social at 05:25:40Z, wrote the
prereg, renamed the r181 tooling to r189, added the M11 tally + proof
test — then died (no heartbeat ever landed; the 04:59:10Z lock was
stale). This run (r190) adopted the tree: stale-lock recovery (lock
deleted, own lock journey2-5-20261113T075554Z written), heartbeat
landed 07:58:37Z, hbloop journey2-social-hbloop-r190.sh every 10 min.
The rename broke two carried tests (vendetta test required the old
helpers filename; proposelabel test read the old driver filename) —
fixed by repointing both requires to the r189 filenames (tooling-only,
no game change). All 14 carried proof tests then green (r172 ×8,
r179 faceguard, r180 narrsplit + favorreq-exit, r181 proposelabel +
vendetta, r189 recapempty 10/10). Smoke SEED=43801 DAYS=5 clean, no
instrumentErrors. Panel ran 08:04–08:33Z, ~7 min/seed.

## Panel verdicts (BINDING, §14)

- M1 arming motive GO: 11 plots armed, all 11 grievance-linked at
  arming; 5 grievance-holder → later-leader cases. Vendetta watch:
  maxUnordered=4 (Demekech<->Lillian, 4 arms d19–d39) — below the 8+
  bar; no cooling-off design look.
- M2 villager-initiated bonds ANSWERED (12th datapoint): 143
  villager-initiated proposals (50 person-kind, 93 link raises),
  34 accepted (13 person, 21 link), 7 refused. Per-initiator max 16
  (Rosa, person+link) — below the NEW combined bar of 20; person-kind
  max 4 (Hassan/Fatima/Daire/Yara) — inside the amendment-5 cap of 8.
  No combined-cap design look. Scholar-initiated person proposals: 0.
- M3 invite refusal: NPC lure accept 321 / decline 343 — invitations
  sometimes taken, as ruled. Player party accept 25 / decline 20.
  NPC bond accept 7 / decline 7.
- M4 sense GO: 380 transcripts, 4/4 candidates read in full (below) —
  NPCs want real things, options engage or deflect, endings resolve.
  Senseless 0. React shape holds: agree 0 / joke 0 / silence 2666,
  dlg:react present. Longest 'more' run 3 (< 5) — the 3-label pool
  suffices.
- M5 census guardrail MISS (third consecutive): 1/4 villages past
  d100 (d131, d97, d82, d62; median 89.5d). Sequence now 2/4 (r172),
  2/4 (r179), 1/4 (r180), 1/4 (r181), 1/4 (r189). All dark-channel
  verdicts are within-window only. Metric review owed — see below.
- M6 gossip-position GO (re-aligned gate definition): 0 naming-beat
  lines beyond radius-1 of Haven; 126 debates kicked and settled.
  Strict on-tile away total 39 — reported as the known metric/gate
  discrepancy, does NOT fail M6.
- M7 dedupe HOLDS: 143 near-dup flags, 0 exact-verbatim pairs —
  pool-cycle only (same core, different nod suffix, never verbatim).
- M8 counter-settle SETTLED: 3 driver settles, 3 links formed,
  0 blocked re-raises, 0 fresh re-links after a settle.
- M9 recap cap HOLDS: maxPresses 3, totalPresses 318, 0 offered
  after cap, 0 cap failures.
- M10 coach variation HOLDS: 0 NARR coach verbatim repeats in one
  sitting. M10b face-guard HOLDS: 0 accuseFace verbatim repeats
  (r179 guard holds in the wild, fifth re-confirmation).
- B2 double-confession HOLDS: 10 sittings with confession, 0 double
  sittings (fifth re-confirmation).
- Q11 scattering CONFIRMED: every seed records scattered /
  hungryDays / aliveEnd (2/4 scattered).
- M11 recap-empty tally: 1 of 143 flags (r181 anchor 19 of 126).
  Bar >= 10 NOT met — the job-B1 pool fix does NOT land. Documented,
  not fixed. The cluster essentially vanished on this base (see
  "Interesting" below).
- Moots: 7 total (1/3/2/1) — trigger alive, no investigation.
- Dropped threads: 5 drops; one resurfaced next sitting
  (visjoin_113: "We never finished talking about that warning") —
  the open-thread ledger works. No dropped promise seen.

## Village assessment (plain words)

Four villages, all lost. 63 people fell, 5 alive at the end.

- 43801 (131 days, Grace's village): the long one. Twenty-one fell —
  the wild took 12, monsters 3, strangers 2, one ambush, one contest,
  one night death, one wound. Ten scholars carried the mantle in a
  row (Vito → Nolan → Carolina → Srinivas → Rosa → Miriam → Devon →
  Juan → Aroha → Henry → Noella) — the village kept going through ten
  bearers and still died on day 131 with nobody left, four dead on
  the last day alone. Pantry still held 10,834 kcal at the end; they
  knew 68 Codex plants. They were not starving — the wild killed them.
- 43802 (97 days, Hunter's village): eleven fell, seven to the wild.
  One survivor: Ivy, a journalist, warm and trusting (69) with no
  abilities — alone at the end with an empty pantry.
- 43803 (82 days, Mariana's village): twenty-two fell, fifteen to the
  wild and five to monsters. Nobody left. Pantry empty.
- 43804 (62 days, Lillian's village): nine fell; four survived —
  Demekech the army medic (4 abilities), Christian, Lucas the police
  officer (3 abilities), Giulia. They knew 34 Codex plants and had
  nothing in the pantry; one died of thirst, one of starvation on
  the last day.

What they knew: villagers initiate bonds constantly (143 proposals),
raise village links (93), settle debates (126), hold moots (7), and
carry real grudges into plots (all 11 armed plots grievance-linked).
What was missing: nobody lived long enough for any of it to compound
— every village died to the wild before day 132, and three of four
ended with an empty pantry. The social life is rich; the survival
floor underneath it is not. That is the survival collapse, not a
social defect — see M5 review.

## People check (full transcripts, M4)

All four candidates pass the bar.

1. gen_95dpeib (43801, friendship, 11 turns): a villager coaxing
   themselves into talking about personal stuff — "mending. Sounds
   small. But small useful things stack." Warm ending. Watch: the
   driver repeats "You don't have to say it all at once." five times
   — the DRIVER's line, not the NPC's; a real player would not say
   the same sentence five times in one sitting (r180 watch item,
   player-side repetition, still driver-side only).
2. gen_2h4swg4 (43802, talk request, 11 turns): "Someone saved me the
   last of the stew once... I think about that bowl more than I think
   about the monsters." Then on the System: "It gives power but never
   context... We're incidental to whatever it's actually doing." Real
   want, real reflection, warm ending. Minor: two YOU questions in a
   row — driver artifact.
3. gen_p6wqoa3 (43803, talk request, 11 turns): Ada proposes linking
   with Thornfield, walks you to the tree line, then asks for
   something funny because she desperately needs it — "I used to
   laugh easy, before... Everything else I'm performing a little."
   Shares a hidden skill (weather-reading: "nobody's died from it
   yet"). Passes strongly.
4. rosa_mendez (43804, talk request, 8 turns): the Lucas ambush
   investigation — "You've been over this ground twice now... the
   trail is going cold" — then the confession: "I wasn't an infantry
   soldier. I was a line cook. Everyone out here is selling
   something." Passes strongly.

## Blanks filled / documented

- FILLED (tooling): the r189 rename broke two carried tests
  (vendetta, proposelabel) — repointed to the r189 filenames,
  both green again. No game change.
- DOCUMENTED (not fixed): M11 recap-empty — 1 flag vs the >= 10
  bar. The one-line pool stays as is this run.
- DOCUMENTED (watch): re-offer furniture-free max 12 — `party_name`
  offered 12 times in one Aroha sitting (43801). Same order as
  r181's 11 (teach/subject 10); long sittings keep re-offering the
  handful of menu items the driver never takes. Not a defect — a
  real player takes one or leaves — but if a future panel shows a
  player-side item (not leave/silence) climbing past 12, the
  re-offer cap question reopens.
- DOCUMENTED (watch): seed 43801's ten-bearer succession chain —
  the mantle passed ten times in 131 days and the village still
  died. Leg 7's question (does the new bearer's life cohere?) is
  visible here as census color, not measured this run.

## Interesting (not pre-registered)

- M11 collapsed from 19 (r181) to 1 (r189) with NO game change to
  the recap line. Total near-dup flags rose slightly (126 → 143)
  while recap-empty nearly vanished — the flag mix moved, not the
  volume. Most likely the r187/r186 pool-picker fixes changed which
  lines repeat (the Haven-door requirement variants now dominate:
  ~40 of 143 flags are the four "same side of the Haven door"
  phrasings cycling). The recap-empty pool is no longer the densest
  cluster; the Haven-door requirement phrasings are. Not a fix job
  this run — the M7 wording counts pool-cycle flags as depth, not
  failure — but the next social run should watch whether the
  door-requirement cluster is the new M11-shaped item.
- Bond proposals rose 115 (r181) → 143 with the same 4-seed shape,
  person-kind 50 vs r181's lower count, and 13 person-bonds
  accepted (r181: fewer). The r187/r186 pool-picker fixes + r133
  gesture accept/decline did not suppress social volume; if
  anything the villages talked more while dying sooner (488 full
  conversations vs r181's 344).

## Metric review (M5 — job B3, owed by the third consecutive miss)

Question from r181: does >=2/4 past d100 still measure village
longevity under current survival tuning, or has survival tuning
moved under it?

Data weighed: panel lived-days r172 (2/4 past d100), r179 (2/4),
r180 (1/4), r181 (1/4: 75/48/62/111, median 68.5), r189 (1/4:
131/97/82/62, median 89.5). Survival-collapse control
(sim-survivalcontrol-b, 2026-11-11): 1/8 survive on current master
vs 6/8 pre-reconcile, median 126d vs 150d. Death causes this panel:
the wild 39 of 63 fallen (62%), monsters 9, starvation 5 — the
villages die to the world, not to anything social. The d100 bar was
set when villages routinely lived past d100; under the collapse a
4-seed panel meeting 2/4 is roughly a coin flip against the control
baseline, so M5 now re-measures the collapse (owned separately,
top-priority winnability work) rather than anything about social
life. Its misses carry no information about conversations, bonds,
or plots.

Proposal for the NEXT run (this panel NOT re-scored): M5 becomes
report-only — median lived-days + past-d100 count judged against
the survival-control median (126d), with the "within-window only"
guardrail reading triggered only if 0/4 villages pass d75 (a floor
that still catches a panel where villages die before social
systems can even fire). The hard 2/4-past-d100 bar is retired; if
the survival collapse is fixed and villages live longer, a future
run may reinstate an absolute bar at the then-current control
median.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/social.json --current 'evidence/2026-11-12/journey-social-life-r189-*.json' --metrics l3.bonds,l3.deepBonds,l3.betrayalCases,l3.mootsConvened,l3.gossipConvos`:
5 LOUD lines, all "disappeared: baseline N -> current 0" — the known
explained schema drift (the social driver never emits l3.* fields).
Explained, not a bug. Baseline NOT rolled.

## Measurement-proof gate (job B5)

`node scripts/godpath/test-measurement-proof-update.js` FAILS on
manifest staleness ("Proof source inputs are not current") — re-run
on the rebased tip bad4acd2c (base f7352f946, b10 landed) at
adoption, same failure as the pre-rebase run. Cause: r134's src/js
change (conversation.js, convo-beats.js) post-dates b10's panel, so
proof refresh round 11 is owed — not this run, and not attributable
to this leg (branch touches 6 scripts files only, zero src/js
changes). Reported only, per prereg. Does not block the merge.

## Verdicts

- REACHABLE: yes — 488 full conversations, 143 villager-initiated
  proposals, 11 plots, 7 moots across 4 villages; every social
  system fired in the wild.
- FUN: yes, in the moment — the transcripts read like people
  (the stew bowl, the line-cook confession, Ada's laugh). The fun
  is cut short by villages dying, not by the conversations.
- WINNABLE: not judged by this leg — no village lived long enough
  for social systems to touch the win chain; M5's third miss says
  the survival floor is the binding constraint, and it is owned
  elsewhere.

## Closeout

- check.js --quick (adoption re-run on rebased tip bad4acd2c):
  331 passed, 9 failed in 1484s — GO after adjudication. All 6
  load-artifact failures green standalone (living-garden,
  occupation panels 25/0, one-person-army, trust-observer-neutrality
  6/0, capable-bot 42/0, cache-flags 4/4); staleness pair
  (proof-update + workflow) owed to proof refresh round 11 (B5);
  phone-frame stale receipt standing. Zero failures attributable to
  this leg (scripts-only, no src/js changes). The 14 carried social
  proof tests are green on the rebased tip (see Adoption). The r190
  coordinator's 08:22Z gate run (pid 27849) died with the run
  timeout; this re-run supersedes it.
- Commits: bad4acd2c (tooling, rebased onto f7352f946) + evidence
  commit (this commit).
- Merged locally, pending ship (no version bump, no push, no live
  verification — ship loop owns those).
- Rotation-b: 5 -> 6 (crisis next).
- Lock deleted at closeout; hbloop killed.
