# Scale-onramp round — run fleshout-20261027T1215Z (3 arms, all LANDED, merged locally pending ship)

Axis: scale-onramp (topmost non-converged axis; standing directive still in force).
Sibling loop B live at closeout on food-economy (1230Z claim: sim-day99demand-b +
sim-9954trace-b, heartbeats 12:47Z) — NOT touched. B's 1130Z round landed before
this run's arms finished (master 043a3dec5 at run start); a sibling journey landing
(journey endgame r56, master 4728c2cdd) moved master mid-run. Zero file overlap with
either sibling landing. No lock/claim collision: no lock file existed at run start,
no live claim existed; this run's claim (fleshout-20261027T1215Z) was the only live
A claim for its duration.

## Arms (all measurement/policy only, zero src/js)

### Arm 1 — sim-socialD-a: D-RULED-OUT (NO-GO for D as a residual explainer)
Prereg 19344bb5 (committed alone, before sweeping) + evidence/instruments/corpus
25ed3a91a (rebased onto 4728c2cdd, proof re-green post-rebase).
Comparison fixed exactly as the 1121Z report demanded: PRIMARY = D-off
(fallback-off + ask:others filter) vs FALLBACK-OFF alone; plain control is a
secondary reference only, never the judge. D-off is the ask:others visibility
sub-family (r54 rank lift, r54 subject re-list, r55 main-menu exemption, r59
party-trim protection) removed at the policy's choice picker. The r53 ask_favor
guard and r54 winddown grace beat are engine-internal, not policy-expressible,
and were carried as negligible per arrivalsurge.
Band: repin seeds 73671–73678, 180d death-aware, same five recorders.
Result: D-off arrivals 17 = fallback-off arrivals 17 (tile-entry 15 +
scripted-titan 2); per-seed rows byte-identical on all 8 seeds, including
deaths 295, starvation 1, wins 3/8, national-ever 5/8, national-final 4/8,
entered 3/8, wave-4 3/8, wave-5 0/8, wave-4 kills 2. Cost bar PASSED
(starvation 1 ≤ 3; median 137d ≥ 109.6d), so the count band decides: 17 ≥ 15 →
D-RULED-OUT. Median standing-100 day 68 = 68 (EXPLAINS needed ≥ 73).
Why: the channel is dormant on this band. Talk census, both arms identical:
1,014 conversations opened, 0 held sittings, 0 conversation turns, 0 ask:others
candidates filtered. The policy's talk loop that runs (talkRound) picks no choice;
the loop that picks (deepTalk) is gated by COMPETENT_TALK=1, unset here exactly
as in surgeconfirm. The filter itself is proven live (unit test: old picker
returns ask:others, new picker never does), so zero-fire is evidence, not a
broken variant. The arrivalsurge sentence "the village-talk verb gets picked more
often by the policy's talk loop" does not survive contact with this band's talk
loop. Fallback-off reproduction gate: EXACT on every trajectory field.
Sense read (non-measured replays, seed 73671, both arms): replay files identical
except the header line; no ask:others/gossip turn appears — only narration *about*
talking (witness accounts, raid aftermath). Documented sense blank: the daily
gift lines repeat nearly verbatim (~20× Reading Glasses / Marked Bus Map lines
across d135–d164).
Loud failures disclosed in arm evidence: (1) sense-script import bug (same class
as the 1121Z renamed-export trap) — first fallback-off replay crashed with
ReferenceError, wrote only an error file, overwritten by the clean re-run;
nothing crashed was counted or kept. (2) Safe-commit index clobber, twice
(known class) — repaired via HEAD-blob cacheinfo both times, verified empty
status/diff/diff-cached, proof green on the committed tree.
Proof: scripts/test-socialD-a.js, 48 checks, ALL PASS, verdict re-derived.
Evidence: evidence/2026-10-27/sim-socialD-a.md + prereg + corpus
evidence/2026-10-27/perseed-socialD-a/ (16 rows + summary + 2 sense replays).
Variants committed as instruments per the surgeconfirm precedent (a completed
measurement, not a killed arm, not a landing candidate):
scripts/policies/competent-nofallback-socialD.js,
leanlinkrescue-nofallback-socialD.js, tableseat-nowait-nofallback-socialD.js.

### Arm 2 — sim-waitlong-a: wait NO-GO on a qualified longer-unready band
Prereg 4f09c474a + results 39677d075 (rebased twice: onto 4728c2cdd, then onto
the socialD merge; corpus spot-checked after each rebase, verdict unchanged).
Question: does waiting matter on bands where the seat stays unready longer?
The 1955Z tableseat result (seat+wait replicates seat-only exactly) was on a band
whose longest unready stretch was 2 days. Fresh, uncherry-picked band
74001–74008, 180d death-aware, one shared leanlinkrescue-only baseline vs
seat-only vs seat+wait = 24 configs, zero src/js, no new policy files (both legs
reuse the prior arms' files verbatim).
Band QUALIFIED via the prereg's latency branch: seat-only latency on 74004 is
9 days (invitation day 85 → seat day 94), 4.5× the 1955Z band's max (2 days).
The not-ready branch failed (total 1 < 6) — reported, not hidden.
PRIMARY: seat+wait entered 3 − seat-only entered 3 = delta 0 (need ≥ +2) → FAIL.
Cost bar passes (starvation 3 ≤ 3+2, arm-only 0 ≤ 2, median 180 ≥ 0.8×180) but
cannot rescue a failed primary. Seat+wait replicates seat-only exactly: same
seat days (94/157/95, all lesser, all Feared), same wins (3=3), same starvation,
per-seed deaths + court counters identical on all 8 seeds — the wait leg's only
trace is its own counters on 74004 (2 Haven-days, scholar already at Haven both
times, 0 returns, 0 stranded).
Mechanism, not just a null: ZERO Haven blocks in 24 configs (106 baseline
block-days: 69 ready, 37 combat). The wait leg only fixes not-at-Haven, which
never fired; 74004's 9-day latency is the day-90 floor + rank-gated days + one
combat-blocked day at Haven itself — none of which waiting clears.
Wall numbers (this band): baseline national-ever 8/8, final 5/8, table invited
3/8, entered 0, wins 0; armed entered 3/8, wins 3/8 per leg; wave-4 baseline 6 /
armed 5 (win artifact: 74007 won day 95 pre-wave-4); wave-5 0/24; max arc 4;
median survival 180 all legs (horizon-saturated — flagged in metric review as
making the median cost bar uninformative here).
Sense read (74004 seat+wait replay, seat day 94 matching the measured run):
table scene coherent and earned; waiting in-fiction is just the generic
"You wait. The light changes…" line (already backlog #1030) — no table vigil is
voiced. Caveat disclosed in arm evidence: the ring is a 240-line tail (days
92–94 only), so the actual 85–92 waiting stretch is not visible in it.
Loud failures / deviations, all disclosed in arm evidence:
(1) Prereg probe P1 failed on its written 1955Z expectations — root cause is
BASE DRIFT, not the instrument. Prior instruments run on this base diverge
identically (prior det-gate baseline 73601: 180d not 179d; prior nowait sweep
73601: maxArc 3, table 0, entered 0 — 73601 no longer reaches Arc IV).
Same-base comparison PASSES exactly (this arm's baseline == prior baseline;
this arm's seat-only == prior armed on days/gameDays/entered/won), proving the
wrapper neutral. The worker did NOT follow the prereg's failure branch (strip
the wrapper) because the deeper check falsified its premise; the prereg file is
left unedited and this amendment lives in the arm evidence file. COORDINATOR
IMPLICATION: the 1955Z control band is stale on current base (extends finding
#1058 to 73601) — future seat arms must re-baseline before judging against
1955Z numbers. (2) Safe-commit index clobber hit both commits — repaired both
times with HEAD-blob cacheinfo, commits verified via git show --stat, final
status empty, diff HEAD empty. (3) No other loud failures: no safe-commit
refusal, no EPERM flap, no policy file created or deleted (nothing to clean on
this NO-GO), no idle rows hidden (5 idle seeds counted in denominators and
labeled idle), probe scratch dir deleted uncommitted, balanced panel attempted
and not ingested (same balance-scorecard.js:44 TypeError as both 1955Z arms).
(4) Instrument gaps disclosed: post-daily firstWaitingDay leaves first-day
seats with null latency and undercounts armed invitations (1 vs true 3) —
entered/won unaffected; future arms should record everTable pre-daily. G2 was
vacuous (all seeds national on all legs); substitute read-only evidence is the
5 idle seeds identical across all 3 legs.
Proof: scripts/test-waitlong-sweep.js (sweep + --probe + --sense); corpus
evidence/2026-10-27/perseed-waitlong-a/ (24 rows) + sim-waitlong-a-sweep.json
+ sim-waitlong-a-sense.txt. Coordinator re-derived the headline from committed
rows post-rebase: seat-only entered 3, seat+wait entered 3, identical per seed.
Recommendation carried from the arm: stop spending arms on the wait leg (NO-GO
on two bands, mechanism explained) and spend the next seat arm on path diversity
(#917) or the full seat (#920), after a re-baseline of the seat bands.

### Arm 3 — sim-d94-a: CLOSED — direct-build alien duel
Commit 11a45b491 (rebased onto the waitlong merge; proof re-green post-rebase).
The 73671 d94 unmatched end (band 188 starts / 156 ends) is a genuine fight
outcome with no counted start, not a counting error. Row: day 94, activeStart
null, result lost, id fmgpspijo_f53f9n, token 15, postId null; player p dead at
0 HP, hostile sarge (ap_sarge) alive at 80 HP. No monster-kind fighter, no wave,
no linger. No start row carries that id, token 15, or arg sarge; no start exists
on day 94 at all (neighbours: d93 focus_group settled, d102 mirrormoth /
bright_idea settled); the id appears nowhere in the other 7 seeds' rows. Token 15
sits contiguously between token 14 (d93 start) and token 16 (d102 start) — first
seen at tbEnd, never through any startCombat call. activeStart null rules out
instant settlement (73671's 4 instant settlements, d10/d18/d74/d160, all carry
their call index). throws [] and dissolves [] rule out a thrown call or
dissolve. Mechanism, from code comments (CANON.md read; no canon doc covers
alien-player duels): encounters.js startAlienCombat "builds the fight directly
instead of via Game.startCombat" and alien-player fights "bypassed startCombat";
alienPlayers.js apStartEncounter calls it, Sarge is a COMBAT_PILOT with base
build HP 80. A startCombat-wrapping recorder therefore cannot see the start,
while its tbEnd wrapper still fires — exactly one unmatched end. Ruled out with
rows: duplicate end (34 unique ids/tokens), day/seed key shift (no such start row
anywhere), wrapper snap-timing artifact (a recorder-free replay still produces
the d94 duel), recorder gap (diag errs 0, no overflow), melt fight (no monster,
Sarge alive).
Closure arithmetic: 73671: 33 startCombat-begun (29 settled + 4 instant) + 1
direct-build = 34 ends. Band: 155 + 1 = 156 ends vs 188 startCombat calls
(143 settled + 12 instant + 33 titan refusals). Every begun fight has exactly
one end, and every end has exactly one begun fight.
Headlines touched: NONE. W4melt melts stay 5 — 73671's reunion d167 melt is a
settled start (callIdx 28 → end token 30, lost), verified in the proof. Wave-4
kills stay 2 — 73671's congregation d121 kill is a settled start (callIdx 20 →
token 22, won); the d94 end adds/removes zero kills (Sarge alive, player lost,
not a wave fight). Headline totals under reclassification: only the
definitional restatement ("starts" = startCombat calls); no headline field
derives from start counts and armed == plain is already EXACT.
Transcript, in plain words (two NON-MEASURED replays, seed 73671 to day 100,
no tbstarts recorder, wording/presence only): on day 94 a human-shaped figure
steps out of the treeline — "They move like someone who's done this before.
Many times. On many worlds" — and the game introduces him only as "STRANGER!
You're on your own" (no villager within 4 squares joins; pre-reveal descriptor,
not a name). He closes in patiently, plants his feet every third turn for a
heavy strike (7 damage a time), then at about round 42 raises a beam weapon —
"The air tastes like copper" — for 69 beam damage; "You go down." The Codex
turns a page: Landon Hayes is dead, the mantle passes to Brunhilde Han, and the
run continues to the 180d cap. A real, legible, costly duel — the only silence
is the counter's definition boundary.
Carried note (recorder, not a game gap, no fix proposed): any future corpus
wanting "fights begun" as one number must count startAlienCombat alongside
startCombat, or label its counter "startCombat calls."
The tbstarts verdict was NOT re-judged: 33 titan-gate refusals on 73675 and the
5 settled w4melt melts stand as recorded.
Loud failure: safe-commit index clobber struck the evidence commit (bogus
staged deletions in the main index after a correct commit). Repaired via
HEAD-blob update-index --cacheinfo (with --add); verified status empty,
diff HEAD empty, hashes match. No other failures; corpus was present so no
sweep was re-run; zero src/js changes.
Proof: scripts/test-d94-a.js, 44 PASS, 0 FAIL; tbstarts validator re-run 10/10.

## Wall numbers (this run's judged corpora — no new win-seeking band)
- Repin band (socialD controls agree): national-ever 5/8, national-final 4/8,
  invited 4/8 (table flag), entered 3/8, wins 3/8 (lesser seat only), wave-4 3/8,
  wave-5 0/8, median 137d, deaths 295, starvation 1, wave-4 kills 2.
- Fresh band 74001–74008 (waitlong): national-ever 8/8, final 5/8 baseline,
  entered 3/8 armed, wins 3/8 armed (lesser, all Feared), wave-5 0/24,
  median 180d (horizon-saturated).
- Full seat still unreached anywhere in this run; wins still come only through
  default-OFF instruments and the lesser seat. Wave-5 still 0 in every band here.
- Villager-behaviour sample: socialD band talk is narration-about-talking only
  (no deep turns to judge); waitlong band table scene is coherent and earned.
  Robotic/static flags: repeated gift lines (socialD, ~20×) and the generic wait
  line (waitlong, backlog #1030) — both documented, neither newly gamed.

## Metric review
- SocialD: prereg binding held — primary vs fallback-off, cost bar, channel
  honesty all judged as written; no re-scoring. The verdict (D-RULED-OUT) is
  band-scoped: it does not transfer to a talk-active (COMPETENT_TALK=1) band
  without re-running, and the guard/beat bits of D would need a game-code
  revert to test (out of measurement scope).
- Waitlong: prereg binding held except the probe-P1 failure branch, where the
  deeper check falsified the branch's premise (base drift, not instrument
  failure) — the deviation is disclosed in the arm evidence, prereg left
  unedited, and the verdict (NO-GO) rests on the same-base comparison, not on
  the stale 1955Z numbers. Band qualification via latency (not not-ready count)
  worked as preregistered. The horizon-saturated median (180 all legs) makes
  the median cost bar uninformative on this band; future seat arms on
  horizon-saturated bands should pre-register a different cost discriminator
  (e.g. death-count or starvation-only bar) rather than leaning on the median.
- D94: single-row archaeology, no metric revision needed; the "starts" label
  correction is definitional, not a re-judgment.
- Balanced panel (§15): NOT ingested this run. The waitlong worker attempted it
  and hit the same balance-scorecard.js:44 TypeError as both 1955Z arms; the
  coordinator's --help probe confirms the script requires --out and offers no
  usable compare path from the CLI surface alone. Arm proofs (48-check, sweep
  aggregate, 44-check) plus coordinator corpus re-derivation are the
  attributable verification. The panel failure is a tooling blank for the next
  run, not a reason to hold these measurement landings — no panel number is
  claimed in this evidence.

## Telemetry deviation check
Run on both new corpora (script takes a single --current; run twice):
- socialD: 2 LOUD lines (national 12 -> 0, wins 16 -> 0; n=17 files incl. summary).
- waitlong: 3 LOUD lines (national 12 -> 0, table 16 -> 0, wins 16 -> 0; n=24).
All are the KNOWN ingestion/regime artifacts: the scale-wall baseline is a
WINSEAT full-win stack whose _regime note forbids comparing pre-seat/courtship
substrates against it, and per-seed rows carry nationalEver/entered/won, not
top-level national/wins paths. No exiled LOUD line in either run. Baseline NOT
rolled. No new investigation opened.

## Infrastructure
- Master moved twice under the run (B 1130Z round pre-run; journey r56
  mid-run). All three arms rebased clean (socialD once, waitlong twice, d94
  once), proofs green post-rebase, merged ff-only in order socialD → waitlong →
  d94. First ff-only attempts for waitlong/d94 correctly refused (master had
  moved under them); no force, no merge commits.
- Safe-commit index clobber hit all three workers' commits and is the run's
  recurring infrastructure tax — repaired via HEAD-blob cacheinfo every time,
  commits always correct, main tree clean at closeout.
- Registration slow (~4 min per tree, sibling I/O contention, matching the
  1121Z precedent). No EPERM flap blocked this run's writes. No check.js
  --quick run: zero src/js, zero green-list files, arm proofs are the
  attributable verification (same precedent as 1016Z/1121Z).
- Rotation left at 3 (convergence-directed work overrides the rotation; the
  lever index is not advanced by this run).
- Repo AGENTS.md read at coordinator closeout (after the evidence file was
  drafted). No push made (ship loop owns pushes, per both the task body and
  repo push discipline). check.js --quick NOT re-run: zero src/js, zero
  green-list files, arm proofs are the attributable verification — the same
  precedent as the 1016Z/1121Z rounds, where --quick produced zero output
  under sibling contention and was stopped rather than blocking landing.

## Village assessment, in plain words
The village on the repin band is a place where people talk about each other
constantly but never actually sit down to talk — a thousand conversations
opened, none held. That is why the social explanation for the extra arrivals
fails: there is no social channel firing for it to work through. On the fresh
seat band, the village that waits, waits correctly and still gains nothing —
waiting only fixes being away from home, and nobody was away. The one true
fight the counters missed was a stranger stepping out of the trees and killing
the scholar in a fair, legible duel the Codex recorded and the counter did not.
None of these are broken villages; they are villages whose instruments were
counting the wrong thing, and the counting is now corrected in three places.

## Blanks filled or documented
FILLED: (1) social-family (D) separation — D ruled out on the repin band, with
the dormant-channel mechanism. (2) Waiting on a longer-unready band — NO-GO,
mechanism explained (zero Haven blocks), wait leg closed on two bands.
(3) 73671 d94 unmatched end — CLOSED as a direct-build alien duel, headlines
untouched. DOCUMENTED (not filled): repeated gift-line narration (sense blank);
generic wait line (backlog #1030); 1955Z control band stale on current base
(73601 no longer Arc IV — re-baseline before any future seat judgment);
panel compare failure (balance-scorecard.js:44, same as 1955Z arms).
CARRIED (steve-call, untouched): Haven pile-up intended-behaviour.

## Next blanks, in order
(1) Next seat arm: path diversity (#917) or the full seat (#920), AFTER a
re-baseline of the seat bands — do not judge against 1955Z numbers again.
(2) D on a talk-active substrate (COMPETENT_TALK=1 with a fresh baseline) if
D's effect when conversations actually happen is ever wanted — the D-RULED-OUT
verdict does not transfer there. (3) The residual 17 arrivals on the repin
band: explained by neither family tested so far (fallbacks CONTRIBUTES, D
RULED-OUT) — the next family, or a new channel, is still unidentified.
(4) Repeated gift-line narration as a sense blank. (5) Recorder counting rule:
count startAlienCombat alongside startCombat, or label counters
"startCombat calls."

scale-onramp stays converging (NOT converged): the surge attribution is now
narrowed to fallbacks-CONTRIBUTES + D-RULED-OUT with the residual 17 still
unexplained, the wait leg is closed on two bands with its mechanism explained,
and the TB-starts gap is closed — but wave 5 is still 0 everywhere in this run,
the full seat is still unreached, and wins still come only through default-OFF
instruments and the lesser seat. food-economy stays converging (untouched;
sibling loop B live on its 1230Z next blanks at closeout).
Claim deleted; lock deleted.
Evidence: evidence/2026-10-27/sim-scale-onramp-round-1215.md (coordinator) +
sim-socialD-a.md + prereg + corpus + sim-waitlong-a.md + prereg + corpus +
sim-d94-a.md. Merged locally, pending ship.
