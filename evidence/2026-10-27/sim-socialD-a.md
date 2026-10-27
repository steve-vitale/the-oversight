# sim-socialD-a — social-family (D) separation arm (axis scale-onramp)

Run: fleshout loop A, run fleshout-20261027T1215Z, arm sim-socialD-a.
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever, no lever proposal. No [needs-eyes] flag applies:
measurement only, no feel/combat/UI change — stated explicitly, as
assigned.

## PRE-REGISTRATION

Full text, committed FIRST before any sweep:
evidence/2026-10-27/sim-socialD-prereg-a.md (commit 19344bb53).
Judged only against it — in particular the BINDING VERDICT RULE
below, quoted verbatim in substance, and the PRIMARY COMPARISON:
D-off measured against FALLBACK-OFF, never against plain control.

## VERDICT: D-RULED-OUT — NO-GO for D as a residual explainer

Family D (the social / conversation-visibility family) does NOT
explain the residual wave-4 arrivals that remain after staffing
fallbacks are removed. The D-off band is not merely close to the
fallback-off band — it is IDENTICAL to it, seed by seed, row by
row, on every measured field. The rule decides this, not the
analyst:

- COST BAR (deciding, from sim-scalemetric — applies FIRST):
  D starvation 1 <= F starvation + 2 = 3 ✓; D median survival
  137d >= 0.8 x F median 137d = 109.6d ✓. Cost bar PASSES, so
  the count bands decide (a cost-bar failure would have forced
  NO-GO regardless of arrivals; it did not happen).
- D-EXPLAINS needs D arrivals <= 12 AND D median
  first-standing-100 day >= F median + 5 = 73. D arrivals 17 ✗;
  D median 68 ✗. NOT met.
- D-CONTRIBUTES needs D arrivals <= 14. D arrivals 17 ✗.
  NOT met.
- D-RULED-OUT needs D arrivals >= 15. D arrivals 17 ✓.
  → D-RULED-OUT.

What this means, in plain words: taking the village-talk verb
away too, on top of taking the cooks-and-fishers fallback away,
changed literally nothing. Not fewer monsters, not later
standing, not longer lives, not different deaths — nothing, on
any of the eight villages. The reason is measured, not guessed:
on this band the policy never picks a conversation choice at
all (see TALK CENSUS below), so a menu-visibility change has
nothing to act on. D's share of the surge is not small — on
this band's substrate it is zero, because its channel never
fires. The residual 17 arrivals stand unexplained by either
family tested so far: fallbacks stay CONTRIBUTES (surgeconfirm
INCONCLUSIVE), D is now RULED-OUT on this band. The surge's
remaining explanation lives in chaotic trajectories or in
families not yet separated — not in village-talk visibility.

## BINDING VERDICT RULE (from the prereg, applied)

Let F = fallback-off band, D = D-off band (fallback-off +
ask:others filter), identical seeds. COST BAR first: D
starvation <= F starvation + 2 AND D median survival >= 0.8 x
F median survival; fail => NO-GO regardless of arrivals.
If the cost bar passes: D-EXPLAINS iff D arrivals <= 12 AND
D median first-standing-100 day >= F median + 5; D-CONTRIBUTES
iff D arrivals <= 14 and not EXPLAINS; D-RULED-OUT iff D
arrivals >= 15 (including exact equality).
Applied: cost bar PASS (1 <= 3; 137 >= 109.6); D arrivals 17;
D median standing-100 day 68 vs F median 68 (EXPLAINS needs
>= 73); reaching counts F 6/8, D 6/8. → D-RULED-OUT.

## WHAT D-OFF IS (and is not)

D-off here is the ask:others VISIBILITY sub-family as expressed
through the policy's choice picker — the only policy-side
expression of D (prereg scope limit, fixed before sweeping):
the r54 rank lift (ask:others rank 4 -> 3), the r54 subject-menu
re-list, the r55 main-menu exemption, and the r59 party-trim
protection, all removed by one picker rule: pickTalkChoice never
returns 'ask:others'. The r53 ask_favor re-ask guard and the r54
winddown grace beat are engine-internal, not policy-expressible,
and were NOT removed; they are carried as negligible per the
arrivalsurge disposition. A RULED-OUT verdict therefore rules out
the visibility sub-family on this band, not those two voice/guard
bits. A future arm that wants the full family removed needs a
game-code revert, which is out of this measurement-only arm's
scope — named as a next blank below, not run here.

## FALLBACK-OFF REPRODUCTION GATE (report-only): EXACT

The re-run fallback-off arm reproduces the surgeconfirm
fallback-off table on EVERY field, including the transient
table flag (no snap artifact here — same wrapper as
surgeconfirm, same result):

| field | re-run fallback-off | surgeconfirm fallback-off | match |
|---|---|---|---|
| wins | 3/8 | 3/8 | ✓ |
| national-ever | 5/8 | 5/8 | ✓ |
| national-final | 4/8 | 4/8 | ✓ |
| table invited-flag | 4/8 | 4/8 | ✓ |
| entered | 3/8 | 3/8 | ✓ |
| wave-4 | 3/8 | 3/8 | ✓ |
| wave-5 | 0/8 | 0/8 | ✓ |
| median survival | 137d | 137d | ✓ |
| deaths | 295 | 295 | ✓ |
| starvation | 1 | 1 | ✓ |
| wave-4 arrivals | 17 | 17 | ✓ |
| tile-entry / scripted-titan | 15 / 2 | 15 / 2 | ✓ |
| median standing-100 day | 68 (reached 6/8) | 68 (reached 6/8) | ✓ |

Per seed, the re-run matches the surgeconfirm fallback-off row
EXACTLY on every trajectory field (days, gameDays, endReason,
won, waveReach, maxArc, finalRank, maxRank, nationalEver,
nationalFinal, entered, deathTotal, starvationDeaths), on faced,
on waveKillLog entries, on ts records, and on the table flag —
all 8 seeds (proof script prints the per-seed lines). There is
no base movement to report: the base this arm ran on is the
surgeconfirm base for this comparison. Plain control was NOT
re-run, by prereg design (secondary reference only, never the
judge); its surgeconfirm numbers (arrivals 31, median
standing-100 day 66, wins 4/8, national-ever 7/8, national-final
5/8, entered 4/8, wave-4 5/8, wave-5 0/8, median 130d, deaths 284,
starvation 2) are quoted here only as that reference.

## PER-SEED METRICS (both arms — identical, so one table)

Fallback-off and D-off agree on every cell below (proof:
D-off rows are byte-identical to fallback-off rows modulo the
policy name and corpus-file path, 8/8 seeds). Arrivals from the
verbatim analyzer; standing/readiness from the sweep's pure
reads; feasts = final raw standing feasts; cook/fish = final ctx
counters (fallback counters 0/0 in both arms, as required).

| seed | end | arrivals | standing100d | readinessd | open day | feasts | cook/fish staffed | talk (talked/deepConvos/deepTurns/filtered) |
|---|---|---|---|---|---|---|---|---|
| 73671 | lost 164d, wave 4 | 14 | 65 | 90 | 90 | 0 | 69/164 | 171/0/0/0 |
| 73672 | lost 137d, wave 4 | 3 | 57 | 103 | 103 | 0 | 109/231 | 140/0/0/0 |
| 73673 | won 90d, wave 3 | 0 | 72 | — | — | 4 | 61/199 | 94/0/0/0 |
| 73674 | won 118d, wave 4 | 0 | 68 | 117 | 117 | 3 | 92/225 | 122/0/0/0 |
| 73675 | lost 173d, wave 3 | 0 | — | 111 | — | 3 | 113/403 | 177/0/0/0 |
| 73676 | lost 40d, wave 2 | 0 | — | — | — | 0 | 14/80 | 44/0/0/0 |
| 73677 | won 90d, wave 3 | 0 | 66 | 45 | 66 | 4 | 67/166 | 94/0/0/0 |
| 73678 | lost 167d, wave 3 | 0 | 155 | — | — | 1 | 62/336 | 172/0/0/0 |

Arrival detail (both arms, identical): 73671 — reunion@d90,
suburb@d91 (melted), strike@d100 (killed by player fight),
influencer@d106, herald@d107 (scripted-titan), eulogy@d110,
reunion@d112, reunion@d113 (melted), eulogy@d128, eulogy@d132,
reunion@d137, eulogy@d155, eulogy@d161, reunion@d163 (10 still
present at end, 2 melted, 1 killed, 1 titan still present);
73672 — influencer@d119 (killed by player fight),
herald@d123 (scripted-titan), eulogy@d128 (still present).
Wave-4 kills: 2 in each arm, both log-matched (73671 strike,
73672 influencer). All other seeds: zero wave-4 arrivals in
both arms. Feasts total 15 in each arm; no arm's feast count
explains its arrivals (73671 has 0 feasts yet 14 arrivals —
the same non-explanation surgeconfirm noted).

## TALK CENSUS — the channel dormancy proof (the load-bearing fact)

Band totals, both arms identical: talked 1,014; deepConvos 0;
deepTurns 0; askOthersFiltered 0.

Reading it: the policy opened 1,014 conversations across the
band (talkRound: talkTo + immediate leave, 44–177 per seed)
and held ZERO of them — no held sitting, no conversation turn,
no choice picked, and therefore no ask:others candidate ever
presented to the D-off filter. The filter is proven live code
anyway (proof unit tests: OLD pickTalkChoice returns
'ask:others' for a single-choice menu; NEW returns null, and
returns the next-best choice on a mixed menu; 2-arg calls still
work), so the zero-fire result is a finding about the band,
not a broken variant: D's menu changes cannot move a band
whose policy picks no menu choices. The arrivalsurge mechanism
sentence ("the village-talk verb gets picked more often by the
policy's talk loop") does not survive contact with this band's
talk loop: the loop that runs (talkRound) picks nothing, and
the loop that picks (deepTalk / holdConversation) is gated by
COMPETENT_TALK=1, which is unset in this substrate — exactly as
in surgeconfirm, deliberately, so the numbers stay comparable.
Any future claim that D moves arrivals on a band must first
show a non-zero deepTurns count on that band; on this band the
count is zero in both arms.

## WALL NUMBERS (both arms — identical)

Wins 3/8, national-ever 5/8, national-final 4/8, table
invited-flag 4/8, entered 3/8, wave-4 3/8, wave-5 0/8, median
137d, deaths 295, starvation 1. Full seat unreached; wins still
come only through default-OFF instruments and the lesser seat
(the same wall picture as surgeconfirm's fallback-off arm —
D-off moves nothing on the wall either, as expected from row
identity).
Death-cause shares (295 deaths, both arms identical):
villager combat 115 (39.0%), villager-vs-villager 67 (22.7%),
player arena 56 (19.0%), expedition 18 (6.1%: villager 17 +
player 1), monster 10 (3.4%), ambush 6 (2.0%), sickness 5
(1.7%), wound that wouldn't close 4 (1.4%), dehydration 3
(1.0%), lockjaw 3 (1.0%), contest 2 (0.7%), singles (0.3% each):
Choir Toad, experiment, starvation, Grief Counselor, alien,
the night.

## SENSE-TESTING READ (color, clearly labeled — replay text never enters any count)

Sense seed by the pre-registered rule: most wave-4 arrivals in
the FALLBACK-OFF corpus — 73671 (14 arrivals; 73672 next at 3).
NON-MEASURED narration replays (seed + arm + end day 164,
say/sysSay taps) ran for BOTH arms:
perseed-socialD-a/sense-73671-fallbackoff.txt and
sense-73671-socialDoff.txt. The two replay files are identical
except the arm name in the header line (288 lines each) — the
sense read, like the census, finds no D difference. The replay
trajectory matches the census thread (fights d134, d145, d156,
d161–d164, ending inside a Eulogy fight on day 164, the
village's losing day) — no trajectory-shift disclosure needed
beyond the standard non-measured label.

D-specific sense read: the 11 others/gossip/talk-about lines
in the d134–164 window are NOT held conversations. One is a
villager-want line (Nathan "talks about wanting to belong
somewhere the way people talk about weather — often, and with
no plans to change it"); the rest are witness accounts
(Theo/Brian/Grace in the Witness contest) and raid aftermath
("The village will talk about this for a long time / for
days"). No ask:others turn, no gossip exchange, no
villager-about-villager dialogue turn appears anywhere in
either replay — consistent with the talk census (0 deep
turns). The village talks ABOUT things in narration, but on
this band its people never actually sit down and talk to each
other. That is the sense-side echo of the census finding.

Flagged (documented, not fixed — outside this arm's scope):
REPEATED gift lines. The daily gift narration serves the same
full sentence almost every day in the window — "You hold
Reading Glasses. You read the fine print on medicine bottles
for Alma next door, because their hands shook..." (~20
repetitions d135–d164) alternating with the Marked Bus Map
line ("You rode the 42 every morning for six years..."). A
player reading day after day meets the same two paragraphs,
not a person with new things to say. The Eulogy's scripted
verses also repeat by design (its fight script), which is
fine; the gift lines are the static ones. (Note: lines that
appear twice in a row in the replay files are the say + sysSay
tap doubling — instrumentation, not in-game repetition — and
are not counted as repeats.)
No other robotic, static, or repeated dialogue was newly
flagged by this arm; the table-talk situation-blindness lines
in the backlog stand untouched (they need Steve's ruling
before any voice change).

## WHAT WAS NOT RUN

- Plain control re-run: forbidden as a judge by the prereg;
  surgeconfirm control numbers are the secondary reference.
- A COMPETENT_TALK=1 substrate: setting it would break
  comparability to the surgeconfirm fallback-off numbers and
  would test a different band, not the residual. It is the
  named next blank below, not a run this arm starts.
- A game-code D revert (conversation.js / party-formal.js):
  out of this measurement-only arm's scope (zero src/js by
  assignment). The visibility sub-family is ruled out here
  through its only policy expression; the guard/beat bits are
  carried as negligible, not tested.
- Nothing here pre-judges a talk-active band: if held
  conversations ever run on a band (deepTurns > 0), D's
  visibility changes could matter there, and this arm's
  verdict would not transfer to that band without re-running.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No metric was re-scored. The run was judged exactly against
its prereg: the PRIMARY comparison (D-off vs fallback-off,
never vs plain control), the fallback-off reproduction gate
(report-only, EXACT — stronger than required), the six
per-seed metrics, the talk census, and the binding verdict
rule (cost bar first, then the 12 / 14 / 15 count bands).
Three method notes, none a revision:
(1) The prereg's channel-honesty section predicted the filter
might fire zero times; the sweep confirmed it band-wide
(askOthersFiltered 0/0). That prediction being right does not
weaken the verdict — the verdict rule judges arrivals, and
the zero census explains WHY arrivals are identical. A
zero-fire result with a unit-proven filter is evidence, not
an inconclusive run.
(2) The balanced panel / telemetry check were NOT run, per
the standing exception for recorder rows (panel cannot ingest
per-seed recorder corpora — carried from surgeconfirm/repin).
The sweep summary + analyzer output + proof re-derivation are
the comparison of record. No telemetry baseline was rolled.
(3) The sense replays are NON-MEASURED by design; their
identity across arms is color supporting the census, never
an input to the verdict. No game code changed in this run;
no [needs-eyes] flag applies (measurement only).

## Infrastructure notes

- Proof: scripts/test-socialD-a.js — ALL CHECKS PASS (48
  checks: verdict-rule + cost-bar + median boundaries, filter
  fail-on-old / pass-on-new, 5 recorder sha256, 3 variant
  diffs, 4 untouched-file checks, corpus + idle guards per arm,
  analyzer re-derivation, row identity 8/8, surgeconfirm
  reproduction per seed, verdict re-derivation). Sweep:
  scripts/test-socialD-diag-sweep.js (CORPUS: PASS; summary
  FALLBACKOFF-vs-SURGECONFIRM: EXACT). Analyzer:
  scripts/test-w4funnel-diag.js reused verbatim via its
  exported analyzeW4funnel. Sense:
  scripts/test-socialD-sense.js (NON-MEASURED replay only).
- Variant files: scripts/policies/competent-nofallback-
  socialD.js (header + ask:others filter + chooser call site
  only, vs competent-nofallback.js), leanlinkrescue-nofallback-
  socialD.js (require + id only), tableseat-nowait-nofallback-
  socialD.js (require line only). scripts/policies/competent.js
  and the whole nofallback chain NEVER edited (proof checks
  pass; git status for them empty throughout).
- LOUD FAILURE FOUND AND FIXED MID-RUN (disclosed, not
  hidden): the sense script's import dedupe dropped the
  fallback-off base import, so the first fallback-off sense
  replay crashed with ReferenceError (tableseatNowaitNofallback
  is not defined) while the socialDoff replay ran clean. The
  crashed run wrote only an error file, which was OVERWRITTEN
  by the clean re-run (exit 0) — no crashed output was counted
  or kept. Fix: the import was restored; both replays then ran
  clean and are identical except the header line. Lesson, same
  class as the 1121Z trap: a variant file that exports under
  the original name must be aliased at EVERY import site, not
  just the sweep — the sense script got the guard the sweep
  already had (throw on missing base), but the missing import
  itself is what the guard cannot catch; the fix is to diff
  the import block after adapting a script.
- No idle sweep rows: every row has cook+fish staffed > 0 and
  fallback counters 0/0 (summary corpus PASS). No EPERM flap
  blocked this run's writes; all 16 rows wrote first try.
  Sweep time ~7.5 min for 16 rows (probe + 15); validator
  seconds; sense replays ~30s each.
- Safe-commit index clobber hit the prereg commit (19344bb53)
  — the known class: commit correct, main index showing a
  bogus staged deletion after. Repaired via HEAD-blob
  cacheinfo, verified with `git status --short` empty +
  `git diff HEAD` empty + worktree file intact, before any
  further work. Same repair to be verified after the final
  commit below.
- Commits: prereg 19344bb53 (alone, before sweeping); this
  evidence + scripts + variants + corpus to follow in the
  run's second commit (hash in the coordinator report).
  Ready for coordinator merge; NOT pushed, NOT bumped, live
  NOT verified (coordinator/ship-loop line, not this arm's).
  No [needs-eyes] flag: measurement only.
