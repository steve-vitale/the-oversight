# Journey endgame r135 — Lane B run note (2026-11-04 23:00 CST run)

Leg 4 (endgame), near-reproduction of the r131 pilot on the r131
substrate exactly (capable + deedhunt + vetcommit + greedy deferral
at shipped defaults + armorydrive + fullseat-diag + vetguard;
FULLSEAT/VETCOMMIT/CAPABLE_GREEDY/ARMORYDRIVE/CAPABLE_VETGUARD/
TELEMETRY_FULL/RELAYGREY = 1; 180d, death-aware +10d tail max).
Pilot seeds (explicit SEEDS env, only the 4 pre-registered —
r131's 7-seed method error NOT repeated): 89701 waves, 89702
waves, 89704 forcedrift control, 89705 wavesnw.

Run-start: no lock at start (no stale-lock recovery needed); main
clean, disk 31%, reap removed nothing (13/16 active, sibling
trees preserved); worktree journey2-endgame registered
(run_id 2026-11-05T05:00:11Z, heartbeat verified by read-back;
standing loop beats every 600s — one mid-run read-back scare
proved to be a misread: 05:03:55Z was only ~8 min old at the
time, and the loop pid was alive throughout; manual beat
refreshed to 05:11:57Z regardless).

## Pilot result: REPRODUCTION EXACT (modulo named text deltas)

Pilot exit 0. Per-seed headlines, census outcomes, firenarr and
hurtreturn counts match r131 exactly on all 4 seeds:

- 89701 waves: announced d90, sat d92, WON LESSER (feared/light,
  final:mercy), 5 fights [talkDown,mFlee,mFlee,mFlee,vKill], uw4,
  standing peak 199, peakVet 1@d91, alive 9. Win-seat binding
  ['w5'] — full seat wants 0/2 wave-5 faced.
- 89702 waves: NO window, end survived to d180, 21 fights, 3
  kills, uw4, standing peak 199, peakVet 2@d88 (end 0), alive 2.
  The veteran pair broke when Ines died d100.
- 89704 forcedrift: village-lost (no-successor d45), uw3,
  standing 0, 0 fights, alive 0.
- 89705 wavesnw: village-lost (scattering d110, third hungry
  day), uw3, standing peak 99, 0 fights, alive 1.

Analyzer (fixed r135 analyzer, see below):
PRIMARY-BINDINGS GO | PRIMARY NO-GO | ALL NO-GO.
All bindings GO. The only NO-GO verdicts are the three tally ids
(M3-conversion, M4-wave5-or-full, W5-question) — the expected
closed-road reading, same as r121/r124/r128/r130/r131. Road
tally: lesser 1/4, uw5 0/4, w5faces 0, full-seat 0/4.
Bindings detail: M1 3/4 (89702 no-window-no-voice,
89704/89705 honest-death); M2 census all outcomes named, engine
opens == census fights (5/21/0); M2c/M2d 13/13 uncommitted
classified; MFLEE-routed 6/6; KILL-ANATOMY 26/26; M5 voicing
vacuous per r124 rule (control dead before window, no relay
final); M10 gap named (w5:0/2); M11 peaks 4/4; FIRENARR 14 lines
and HURTRETURN 6 lines captured on 4/4 JSONs; FALLEN-ambush 4/4.

## Transcript diff vs r131: every line accounted for

Total diff lines: 89701: 40, 89702: 176, 89704: 24, 89705: 172.
Classification (no unaccounted class):
- header line (run number) — 1/seed, expected.
- goalLine-loss — 7/47/5/41 (+1 same-shape loss on 89705 with
  the "Good kit is the difference out there." suffix): departure
  lines LOSE a trailing annotation ("Company makes the road
  shorter." / "The pantry won't fill itself." / "Better close to
  the fire today.") — named delta (c), the deepening r102 stale
  goalLine reset. The departure line itself is intact; this is
  the fix-shaped loss the prereg predicted, not a content loss.
- turncoat-rotation — 3 lines on 89701: the player Turncoat
  opener now rotates ("You lay it out, calm as a ledger…", "You
  plant the doubt where it grows fastest…") where the r131 pilot
  had only the single canonical line. The r131 rotation fix is
  now visible in pilot play — fix-confirmed, not a flip.
- hurt-return clause — 1 line on 89705: Leo's return gains
  "hurt on the way home" — named delta (a), the exphurt
  homecoming clause firing exactly where a returnee is hurt.
- FRAG-FRAME pride (named delta b): NOT observed — no no-words
  sitting occurred in this pilot (89701's sitting won mercy
  with words), so the framing had no place to fire. Unobserved,
  not failed.

## People check (SENSE-TESTING LAW): the sitting finale reads as people

89701's finale (transcript lines 569-595) coheres as a story,
not a ledger dump: the audit prices the run honestly ("A lesser
seat — global standing, waves 1–3 faced (15/12/8), with 4
wave-4 fought, 8 contests survived, 5 crises weathered. The
table does not rise. It prices."), the full-seat gap is named in
plain words ("only 0 of 2 different wave-5 monsters faced"), the
feared path resolves through a real choice ("Show mercy" —
"the galaxy learns that the feared one chose gentleness"), the
two ascensions are named as village memory ("Marcus Webb and
Jorge Silva ascended together, and gods, it turns out, have
politics"), and the stasis-kids coda lands ("That is what the
word means. Not the watching — anyone can watch. The oversight
is the looking away."). No fabricated shared history, no filler
loop, no self-contradiction found. One honest note: the r131
note's "teeth fix NOT live-confirmed by pilot text" is NOT
resolved here — the "teeth and the weather" SYSTEM line at
89701:575 is byte-identical to r131's; the war-path remainder
branches the fix touched still did not fire in a pilot (89701
won mercy, not war path), so the fix still stands on its r130
proof test (6/6), not on pilot text.

## Village assessment (plain words)

- 89701's village won, but thinly: nine people left, a lesser
  seat, two of their own ascended to gods who still argue about
  them. They are strong enough to be priced, not strong enough
  to be seated fully — one living veteran where the full seat
  wants two, and no fifth-wave monster ever faced.
- 89702's village endured everything and sat nowhere: 180 days,
  two people left, 21 fights, three kills, standing maxed at
  199 — but the window never came, and the two veteran killers
  they briefly held were both gone by the end. Survival without
  a sitting is the quiet tragedy of this leg.
- 89704's village simply ran out of people: no successor by
  day 45, nobody left to lose.
- 89705's village starved on the road: scattered on the third
  hungry day, one person left, no fights at all — hunger, not
  monsters, ended it.

## Blank filled: analyzer PRIMARY-BINDINGS (r131 metric-review proposal)

The r131 proposal, carried unlanded by r132, is now landed in
scripts/analyze-endgame-r135-20261104.js: PRIMARY is kept
byte-for-byte for continuity, and a new PRIMARY-BINDINGS line
judges only the binding ids (primaryIds minus the tally ids
M3-conversion, M4-wave5-or-full, W5-question). No threshold
changed, no verdict changed, exit code still follows ALL.
Proof: scripts/test-analyzer-primary-bindings.js runs the
baseline r131 analyzer and the fixed analyzer against the
committed r131 corpus (temp copies in /tmp with a mirrored
layout; nothing written into the repo) and asserts identical
per-id verdict lines, unchanged PRIMARY/ALL, and
PRIMARY-BINDINGS GO. Result: PASS — 36 verdict lines
identical; baseline final [PRIMARY NO-GO | ALL NO-GO]; fixed
final [PRIMARY-BINDINGS GO | PRIMARY NO-GO | ALL NO-GO]; the
only NO-GO ids are exactly the three tally ids. Two proof-test
bugs were found and fixed during the run (temp-copy __dirname
broke the analyzer's relative corpus path; NO-GO id parsing
kept a trailing colon) — the passing run above is after both
fixes. On this run's own corpus the fixed analyzer prints
PRIMARY-BINDINGS GO, which is the correct headline: the
bindings pass and the road is closed, and those are now two
different sentences instead of one misleading NO-GO.

Second blank (godpath twin Turncoat line, godpath.js kit_turn-
coat, villager voice, single string): NOT taken — the line
never fired in this pilot (zero occurrences across all four
transcripts), so per the prereg condition it stays documented,
not forced. The player-side rotation landing in this same pilot
strengthens the case for rotating the twin when it next fires,
but that change needs its own firing proof.

## Telemetry deviation check: 1 LOUD line, EXPLAINED, baseline NOT rolled

`node scripts/telemetry-check.js --baseline .../endgame.json
--current 'evidence/2026-11-04/perseed-endgame-r135/*.json'
--metrics uw5,w5faces,fullseat` → LOUD: "fullseat newly
appeared: baseline 0 -> current 696 (n=4 files)". Verdict:
explained, not a game deviation. The r135 'fullseat' objects
are field-for-field identical to r131's for the same four
seeds (days, max vectors, winSeat binding ['w5'] all match);
696 is the script's fallback sum of numeric leaves under the
key, and the baseline file itself warns its keys are
regime-mixed ("Do not compare pre-seat corpora against this
file; re-seed from a same-regime corpus"). Baseline re-seed is
a panel decision, not this run's; baseline NOT rolled forward.

## Corpus purity (corrected instrument note)

A naive file-vs-log-line equality test FAILS on all four seeds
and would falsely report impurity: the pilot log line is the
probe's SUMMARY projection (flattened fields: alive, seat,
path, branch, end, fullseatMax), while the file JSON is the
FULL record. The correct check — 16 summary projections
matched seed-for-seed (announceDay, satDay, won, finalPickId,
fullseatMax==fullseat.max, seat==satSeatKind, path==walkedPath,
branch==walkedBranch, end==endReason, alive==census.alive,
peakVet, peakVetDay, unlockedWave, livingVeterans, census
outcomes, census count) — passes 4/4. Pilot dir contains zero
diagnostic files (8 files: 4 JSON + 4 transcripts).

## Verdicts

- REACHABLE: yes for the lesser seat (reproduced exactly);
  the full seat remains unreached (0/2 wave-5 faced on every
  seed) — the road is closed at wave-4 kills/veterans, not at
  the table.
- FUN: yes for the sitting seed — the finale reads as people
  (see above); the non-sitting seeds' stories (endurance
  without a sitting, starvation on the road) are coherent
  tragedies, not dead ends.
- WINNABLE: partially — lesser win reproduced; full win still
  unwon in this leg, consistent with every endgame run since
  r121. No gate, price, deed, or seat change was made or is
  proposed here (gating freeze stands).

## Metric review (for the NEXT run, never applied mid-run)

- PRIMARY-BINDINGS is now the headline to quote for binding
  health; PRIMARY stays as the legacy line. Next run's prereg
  should judge on PRIMARY-BINDINGS and report PRIMARY only for
  continuity.
- The corpus-purity check must compare summary projections,
  not file-vs-log equality (see above) — the naive test is a
  false-alarm instrument.
- SIT-DAY-DEATHS dedupe (r124 proposal) stays open: no
  sitting seed with a sit-day death recurred.
- Telemetry baseline re-seed for endgame remains a panel
  decision; this run's LOUD line must not be used to justify a
  same-run roll-forward.

## Closeout (filled at landing)

- Regression: check.js --quick in the worktree (unique cache
  /tmp/jest-cache-playtest2), 279 passed, 11 failed in 1570s
  (see journey-endgame-r135-checkquick.log). Triage, all
  11 accounted for, none caused by this run (this run touches
  ZERO src/js files; worktree src diff vs HEAD is empty):
  - 6 assertion failures, pre-existing on master-identical
    src (standing families): godpath/test-measurement-proof-
    update, godpath/test-measurement-workflow (neutrality proof
    vs current inputs), godpath/test-mobile-combat-cadence
    (2 items), godpath/test-occupation-panels,
    godpath/test-phone-frame-proof (proof freshness),
    test-establishment-r20-fixes (racks-full voice gate,
    expected 2 got 1). Each re-run standalone with the same
    assertion failure.
  - 4 timeouts at the 120s cap (test-trust-observer-neutrality,
    test-synergy-stall, test-capable-bot-20261014,
    test-table-endings-20261014): load artifacts — a sibling
    Lane A suite ran concurrently for the whole window. No
    assertion failed in any of the four before the cap.
  - 1 unresolved: godpath/test-measurement-cache-flags
    (failed in-suite at 93s and standalone-under-contention
    with "both actual CLI configurations complete valid
    neutral panels"). r119's precedent (passed 4/4 once the
    sibling suite finished) could not be re-verified this run
    because a sibling suite was still running at closeout;
    its failure shape matches the standing proof-freshness
    family above, but it is recorded as UNRESOLVED (standing
    vs artifact), not claimed either way. It is not a blocker
    for this landing: the commit below contains scripts +
    evidence only, no game code.
  - Rebase: master advanced during the run (ship version bump
    8f7aa8cfa); branch rebased clean onto it, proof test
    re-run green post-rebase (see below).
- Commit/merge/rotation/lock: (filled at landing).
