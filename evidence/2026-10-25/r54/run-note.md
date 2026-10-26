# Journey social r54 — THE FIX RUN, SPLIT VERDICT (lane B, 2026-10-25)

Leg 5 (social life), cycle r54. Follows r53 (menu fix NO-GO: pooled
unsteered subject-no-offer 96.3%, late unsteered others picks 0/4 seeds;
diagnosis: discussed-and-unchanged exclusion 67.8% of menu-problem turns,
pagination buries the rest ~32%).

Rotation-b read 5 at run start (r53's closeout write of 6 evidently did
not persist — its landing was finished by a successor after a heartbeat
failure; this run plays 5 and writes 6 at closeout). Playing 5 is also
r53's named next on the merits, so no queue-jump is involved.

## PRE-REGISTER (written before any r54 seed ran — see prereg.md)

**Leg question:** does the r54 menu fix move NATURAL play?
Fix (src/js/conversation.js, this run):
1. SUBJECT-MENU DISCUSSED-'OTHERS' RE-LIST: the subject menu appends
   'ask:others' from t2discussed after the asks loop ('others' ONLY, never
   while it is the current thread). Precedent: gossip verbs already ride
   after the cap.
2. PAGER RANK: 'ask:others' moves from rank 4 (default, sorts last) to
   rank 3 — the social-verbs band, with gossip/spread_rumor — in
   finish(). Rank only: no cap, no budget, no menu-size change.
   The main menu needs no structural change (it already lists t2discussed;
   the rank lift helps it too).
Design note: re-serving unchanged 'others' is not a repeat — the pick
recomputes, lines come through the said-ledger (no verbatim repeats);
pool exhaustion yields the honest path. The proof test asserts this.

**Bindings (a miss is NO-GO, never re-scored):**
- F1 (SAME bar r53 failed): pooled UNSTEERED subject-no-offer rate BELOW
  r53's 96.3% AND late (d91-140) UNSTEERED others picks >= 2 on >= 2/4
  seeds. Steered picks excluded from both counts.
- F1a (attribution): post-fix no-offer turns split by inBuilt (new probe
  field: whether 'ask:others' is in offeredReplies, the pre-pagination
  built list); discussed-same-pick probes must show 'others' offered on
  the pooled majority; fresh probes must show page-1 offers.
- M1 formation >= 10 deep2 pairs/seed; M3-cond pooled late close-read TP
  >= 40%; M4 same-speaker knack repeats = 0/seed; M5 people: 5 transcripts
  sense-read, 0 fabricated-history flags; M6 guardrail report-only.
- NO-REGRESSION: check.js --quick green + conversation/gossip/moot subset
  green; r54 proof test FAIL pre-fix, PASS post-fix, in that order.

**Seeds:** fresh block 5001-5004 (5001/5002 steering arm, 5003/5004
no-steering arm, carried for comparability; G1 not re-litigated as a
primary). Smoke 5005, 30d: PASS. Horizon DAYCAP=140, death-aware.
Policy unchanged from r53: warm-competent + 3 gossip-first convos/day
(deep mode) + 1 others-steered convo/day.

**Instrument change (only):** the subject-no-offer probe records inBuilt
(offeredReplies contains 'ask:others'). A post-fix no-offer turn then
splits into not-built vs built-but-paged — the distinction r53's probe
could not make. Analyzer: scripts/analyze-journey-social-r54-funnel-20261025.js
(r53 analyzer fork + inBuilt cross-tab).

## Pilot results

Driver: scripts/journey-social-r54-20261025.js (r53 fork + inBuilt probe).
Seeds 5001-5004 x 140d, death-aware. Smoke (5005 x 30d): PASS.

| seed | steer | days | alive | deep2 | unsteered no-offer | unsteered offered | unsteered picked | late picks | knackSame | condRate |
|------|-------|------|-------|-------|--------------------|-------------------|------------------|------------|-----------|----------|
| 5001 | yes | 96 | 0 | 15 | 103/183 = 56.3% | 54 | 0 | 0 | 0 | 89.7% |
| 5002 | yes | 111 | 0 | 25 | 149/244 = 61.1% | 80 | 4 | 0 | 0 | 78.8% |
| 5003 | no | 141 | 7 | 18 | 120/294 = 40.8% | 160 | 1 | 1 | 0 | 88.9% |
| 5004 | no | 141 | 4 | 32 | 254/338 = 75.1% | 79 | 3 | 0 | 0 | 82.0% |
| POOLED | | | | 90 | 626/1059 = 59.1% | 373 | 8 | 1 (5003) | 0 | 82.9% |

### F1: SPLIT — rate PASS (decisive), picks FAIL

- Rate clause: 59.1% vs r53's 96.3% — PASS, and the drop is large on
  every seed (56/61/41/75% vs r53's 98/96/94/96%). The menu fix moved
  offers decisively.
- Picks clause: late unsteered picks 0/0/1/0 — FAIL (bar: >= 2 on
  >= 2/4 seeds). F1 as pre-registered is therefore a MISS, split.
- The split has a mechanism (see below) — it is not a re-score to say
  so; the bar stands as failed and the mechanism is the finding.

### F1a attribution: fresh problem nearly gone; same-pick dominates the rest

Funnel analyzer on the capped probe sample (200/seed, first probes):
r54 menu-problem turns (pick exists, page 1 lacks 'others'): 666 total.
- never-served: 15 (2.3%, was 16.3% in r53)
- served-changed-pick: 29 (4.4%, was 15.9%)
- served-same-pick: 622 (93.4%, was 67.8%)
- no-pick (neutral, no content): 114 (not a menu bug)
Fresh 'others' now surfaces: the rank fix eliminated the fresh-pick
pagination burial. What remains in the probe sample is same-pick turns.
inBuilt on same-pick probes: true only 123/622 (20%). That residual is
NOT cleanly interpretable with the persisted data: the probe fires on
every subject-menu turn without 'others', including turns where
non-offer is CORRECT (already asked this convo — askedTopics excludes
it; reactive/generic answer-only menus with choosingSubject still set;
mid-thread subject menus, where the re-list is deliberately guarded
off). The per-seed JSON does not persist per-convo picked/offered state
for probes, so the residual cannot be split into correct vs genuine
misses. The per-CONVO funnel (the authoritative measure) is unambiguous:
offers rose from ~2-4% (r53 unsteered offered) to 35.2% pooled, reoffer
offers exploded (r53 ~20/seed -> r54 77/152/207/133), and t2picks pooled
109 -> 343. The re-list works at the convo level; the turn-level probe
needs a "convo already saw/picked others" flag to be interpretable
(named next, metric review).

### Why picks didn't follow offers (mechanism, stated not proven)

Natural PICKS flow through the MAIN menu, not the subject menu. The
driver's deep policy (gossip-first, ans-first, one steer/day, then thread
follow-ups) picks 'others' from the main menu when it is FRESH (r53's
exemption + r54's rank) — hence the 8 total unsteered picks, mostly
early. Late in a run 'others' is mostly discussed-and-unchanged: the
main menu still caps it behind asks (topicCapMood), and only the subject
menu re-lists it — a menu the driver reaches unsteered only via late
fallback. So offers moved (subject menu) while picks stayed flat (main
menu cap still binds). Named next: main-menu discussed-'others'
surfacing, and/or a browsing-policy probe that tags picks by menu so the
next run can measure which menu natural picks actually come from.

### M1 formation: GO — 15/25/18/32, all >= 10
### M3-cond: GO — pooled late TP 116/140 = 82.9% (>= 40%)
### M4 same-speaker knack: GO — 0 on all seeds (cross-speaker retells
reported as circulation only: 2/2/3/3)
### M5 people: GO — 5/5 sense-reads meet the quality bar, 0 fabricated-history flags
- s5001-bondy-1-Sreyashi (d4): warm, coherent; unnamed person rendered
  as a description ("A person, maybe 40s, with deep-set eyes"), never a
  fabricated name; deed-memory line ("Harper talks to the garden").
- s5003-late-d100-Patrick: the seeded grievance at 81 days back, with
  the honest change-ack on re-offer ("You asked me that before. It's a
  different question now"). The "doors stay closed" line sits inside a
  genuine grievance line — exactly why r53 removed it from the deflection
  matcher.
- s5002-seeded-d27-Landon: Dwayne grievance 5 days back, change-ack,
  honest close ("Good — the others, settled. Feels better said out loud").
- s5002-wrapserve-deflection-1-Nino: "Ava? I'd rather not. Some doors
  stay closed." — the NPC wants privacy; pressing it deflects honestly
  ("I don't remember saying that"). The want is engaged, not bypassed.
- s5004-wrapserve-other-4-Omar: "Giulia and Omar don't speak. It's not
  new." — a hist-form grievance naming the pair (the speaker is one of
  the pair, so the third-person self-reference reads oddly but is the
  template's honest form, not fabricated history).
Small blanks (documented, not failures):
- Nino transcript: two near-identical party-invite options in a row
  ("Want to come with us?" / "Want to come with me?") — menu duplication
  nit.
- Omar transcript: closing line "Glad we circled back to that favor"
  with no favor discussed in the transcript — stock closing callback
  without an anchor.
### M6 guardrail (report-only): 5001 died d96 (0 alive), 5002 died d111
(0 alive), 5003 alive 7, 5004 alive 4. Death causes: arena 9/15 on 5001,
5/9 on 5002, 1/2 on 5003, 3/6 on 5004 — the standing arena-deaths
question (opened r52, carried r53) is still open; this run does not
re-litigate it and does not hide it.

### G1 crack control (carried, not gated): all crack7=false
Seeded pairs all class 'rise' (v rose by day+7 on every seed). 5003's
seeded pair Patrick<>Titilayo was talked about 104 times (a grievance
serve nearly every day from d25 to d140) yet ended as deep friends
(final depth 3, v=100). Talking about a rift does not by itself damage
the pair bond in this instrument — the crack model measures something
other than talk volume. Carried as an observation for the crack thread,
not a verdict.

## Proof test (demonstrated in order)

scripts/test-journey-social-r54-others-menu.js:
- Pre-fix: RED, exit 1 — discussed-unchanged 'ask:others' absent from
  the subject-menu built list AND page 1; second serving never offered.
- Post-fix: GREEN, exit 0 — built list AND page 1 both offer it, and the
  re-served unchanged pick gives a DIFFERENT pool line plus the honest
  change-ack ("I answered that once — back when the answer was simpler"),
  never a verbatim repeat.

## Village assessment (plain words)

Four villages, same warm player, very different endings — and the same
social weather: everybody talks about everybody now, but the talk itself
doesn't pick fights or make friends.

**Seed 5001 — the village that died in the arena.** 15 dead by day 96,
none left. 9 of the deaths were "the arena." Before it died it was
socially dense (15 deep pairs) and gossiping constantly. The deaths
weren't social — they were the show.

**Seed 5002 — the quieter death.** 9 dead by day 111, none left; 5 in the
arena. 25 deep pairs, the most close reads that landed true (41). The
village talked well and still died.

**Seed 5003 — the seven who stayed.** 2 dead all run, 7 alive at day 141.
Patrick and Titilayo fought on the trail on day 19 (the seeded rift),
the village talked about it for 120 days — and the pair ended as deep
friends anyway (v=100). The rift became gossip, not a wound. 18 deep
pairs, trust 91.3.

**Seed 5004 — the four.** 6 dead, 4 alive at day 141. 32 deep pairs — the
densest graph of the four — built on Hermann, who is friends with
everyone (depth 3 with Arthur, Giulia, Omar, Quinn, Nino, Elena). Trust
held. Nothing burned; the talk just kept going.

What they knew: each other's business — bonds, rifts, deeds, the stray
dog, the garden-talkers — and they said it out loud when asked, with
dates attached ("81 days back"). What was missing: the talk never turned
into action by itself. A rift talked about 104 times healed anyway; a
village that talked beautifully still died in the arena. Conversation is
the village's memory now, not its fate.

## Reachable / fun / winnable (social leg)

- **Reachable:** yes, and more than r53 — 'others' is offered in ~35% of
  unsteered convos (was ~2-4%) and re-offered constantly once discussed.
  The remaining reachability gap is the MAIN menu's cap on
  discussed-'others' (see mechanism above), not the subject menu.
- **Fun:** the transcripts are the evidence — the change-ack on re-offer
  reads like a real person remembering ("I answered that once"), the
  seeded grievance lands with a date and a door left closed, deflections
  stay honest under pressure. The two small blanks (double invite
  options, unanchored favor callback) are nits, not holes.
- **Winnable:** not this leg's question; 2/4 villages survived to day
  141+ with social fabric intact (M1/M3/M4 all GO). The 2 deaths were
  arena-loaded, a question owned elsewhere.

## Metric review (§14)

- F1: SPLIT — rate PASS (59.1% vs 96.3%), picks FAIL (0/0/1/0 vs >= 2 on
  >= 2/4). The bar stands as failed; it is not re-scored. The mechanism
  (picks flow through the main menu, offers moved in the subject menu)
  is the finding, and it names the next fix (main-menu discussed-'others'
  surfacing) rather than excusing the miss.
- Proposed revision for the NEXT run (not this one): split F1 into
  F1-offers (the menu fix's direct effect, judged by the unsteered
  no-offer rate — PASS here) and F1-picks (judged only under a driver
  policy that actually browses the subject menu unsteered, with picks
  tagged by menu). As written, the picks clause measures driver pick
  policy more than menu reachability — the 160-offered/1-picked split on
  5003 proves the decoupling.
- F1a: fresh problem eliminated (2.3% + 4.4% vs r53's 32.2%); same-pick
  residual (93.4% of the capped probe sample) is not cleanly splittable
  with the persisted probe fields. Next run: add a per-probe
  "convo already saw/picked others" flag, or restrict probes to the first
  subject-menu turn per convo where 'others' is unasked.
- M1/M3/M4/M5: all GO, no revisions proposed.
- M6: report-only as specified; arena-death load (9/15, 5/9 on the dead
  villages) stays open for Steve's loop.
- G1 (carried): all 'rise' — the crack instrument's talk-volume vs bond
  relationship needs its own question; not this run's to answer.
- P1/P2-style dryness: not re-measured here (r53's instrument stack
  carried; dry rates were not part of r54's bindings).

## Telemetry

Deviation check vs telemetry-baselines/social.json (stale schema: the
baseline predates the current instrument — its l3 keys
deepBonds/betrayalCases/mootsConvened/gossipConvos no longer exist in
per-seed JSONs, whose l3 carries bonds/deep2/t2picks instead):
- LOUD lines on the current instrument's paths are all "newly appeared"
  (deep2 90, t2picks 343, knack 70, grievanceServes 125 pooled) — a
  schema artifact, not a deviation.
- Direct r54-vs-r53 comparison (same instrument): deep2 114 -> 90
  (two early village deaths truncate formation; not a regression
  signal); t2picks 109 -> 343 (3.1x — the intended effect of the
  re-list); knack 84 -> 70 (comparable); grievanceServes 5 -> 125
  (5003's seeded-pair talk volume — explained, not a bug).
- Baseline NOT rolled: it belongs to the pre-r51 regime and does not
  bind this instrument (same practice as r53).

## Regressions

- Proof test scripts/test-journey-social-r54-others-menu.js: RED pre-fix,
  GREEN post-fix (demonstrated in that order).
- check.js --quick (evidence/2026-10-25/r54-check-quick.log): 279 passed,
  8 failed in 1040s — EXACTLY r53's standing profile (same 8 files:
  hide-discovery, measurement proof-freshness trio + workflow, mobile
  combat cadence, occupation panels, phone frame proof, parity gear).
  Zero conversation/gossip/moot failures in the quick set. The --quick
  bar is therefore met at the standing-profile standard, not at literal
  green — the 8 are pre-existing and unrelated to this change.
- Conversation/gossip/moot --only subsets (r54-check-only-*.log):
  conversation 5 passed / 2 failed, gossip 6 passed / 6 failed, moot 8
  passed / 1 failed. All 9 failures are PRE-EXISTING harness rot in old
  scripts, proven by re-running all 9 with the r54 change stashed: they
  fail identically (same exit codes) without the change. Root pattern:
  `Text is not defined` at genCharacter (their eval lists predate the
  Text module) or null-village harness crashes at roster setup — they
  die before any menu logic runs, so they cannot be regressions from
  the rank/re-list change. Left as-is (out of this run's scope; the
  --quick set is the binding regression net).
- No src/js changes beyond conversation.js (rank + re-list, 2 sites).

## Infra notes (for the next run)

- A detached nohup heartbeat loop dies with its parent exec session
  (tick 1 landed, ticks 2+ never did). The fix that worked: run the
  driver through a script that embeds the heartbeat loop INSIDE the
  tracked exec session (scripts in goal hidden_files:
  journey2-social-r54-run.sh). Do not pkill a heartbeat script by a
  pattern matching your own command line (self-kill, this run).
- A `cmd1 && cmd2 && (loop) &` chain backgrounds the WHOLE chain, so a
  later command runs in the wrong cwd — the first r54 launch died on a
  missing log path for exactly this reason. Use a script file.
