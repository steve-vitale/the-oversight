# sim-vet2-a — veterans-2 reachability census on the win-pursuit stack (DIAG ONLY)

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T1535Z.
Worktree branch: sim-vet2-a.
Base anchor: worktree HEAD at sweep time 9f22a0838928e68340f42325d9e4951e219d94bc
(sim-scale-onramp round-1415-a coordinator evidence) — every judged
JSON carries `anchorCommit: 9f22a0838`. This base is NEWER than the
wavegate sweep anchor (4c92bbb04); the interval includes src/js
changes (lootabilities Arm 6 villager self-craft). Trajectories on
the same seeds DIFFER MATERIALLY from the wavegate census (see
Base-shift note). This arm judges ONLY its own corpus on THIS base;
wavegate numbers are quoted as prior-base context, never as current
data. Wavegate's DEFER5 / W4-FACED labels in the tables below are
SEED-SELECTION labels from its base, not outcomes on this base —
each seed's own-base end blocker is re-measured from this arm's
wavegate rows and shown alongside.
Pre-registration: evidence/2026-10-31/sim-vet2-a-prereg.md (written
BEFORE any judged sims; one amendment appended before the pilot
gate was declared — the pyrrhic-capture fix, see Instrument).
Instrument: scripts/policies/vet2-diag.js (VET2=1, NEW) +
scripts/vet2-sweep-20261031.js (stdout-runner) +
scripts/vet2-split-20261031.js + scripts/vet2-analyze-20261031.js.
Proof: scripts/test-vet2-20261031.js — 29 checks green (23
synthetic + 6 corpus legs that re-derive the band verdict gates
from the judged corpus: 19 usable, key 9/9 with the one explained
exception, everVet2 0, maxVet5 1, wave5 0).
Corpus: evidence/2026-10-31/perseed-vet2/leadfeast/s<seed>.json
(19 seeds, all non-empty) + evidence/2026-10-31/vet2-analysis.json
(analyzer output).
No game code changed. No policy file edited. No gate threshold
moved. No [needs-eyes] (measurement only, nothing player-facing).
Panel (§15): NOT APPLICABLE — single-base DIAG census, no
before/after comparison exists in this arm; none fabricated (same
declaration as wavegate-a). The det leg compares recorder-on vs
recorder-off trajectories of the SAME stack; it is a neutrality
proof, not a panel comparison, and its numbers never enter the
census tables.

## Verdict: DIAG-GO

Judged exactly against the prereg's band verdict:

- Usable judged seeds: 19/19 (pilot 8 + confirm 11, the prereg's
  fixed band — no band-shopping, no substitutions).
- Completeness: 9/9 key seeds fully tabled (max living veterans,
  veterans at end, wave-4+ kills per villager kill-time-keyed
  with scholar vs companion share, veteran deaths + replacement
  outcomes, first day with veterans>=2 vs win/table day).
  Strict cross-check completeness is 8/9; the ninth (87135) has
  exactly one cross-check (iii) mismatch, and it is succession-
  shaped and human-verified (see Cross-check exception) — the
  prereg's read-only explanation clause. With it, 9/9.
- Det-gate: byte-identical hashes + identical end fields on
  both det seeds (87115, 87126), re-run with the fixed sweep —
  PASSED (see Det-gate).
- Determinism leg: pilot seed 87115 re-run to a scratch dir is
  BYTE-IDENTICAL to its judged JSON (132,744 bytes both, `cmp`
  clean).
- Recorder errors 0 on all 19 seeds (wavegate errs, vet errs,
  capture errs all 0). Cross-checks (i) snapshot-vs-rd counts,
  (ii) capture-vs-log, (iv) derived-vs-engine uw pass on 19/19;
  (iii) capture-vs-census passes on 18/19 with the one
  explained exception above.
- Verdict sections (a) veterans-2 reachable or not, with
  seed/day evidence, and (b) whether wave 5 is a post-win
  curiosity, are both stated below.

## Answer in one paragraph

(a) Veterans-2 is NOT reachable on this stack as measured: on
no day of no seed does any village hold 2 living wave-4+
killers (firstVet2Day null on 19/19; max living vet5 = 1 on
only 4 seeds, 0 on the other 15). The binding constraint is
not veteran mortality alone — it is wave-4 kills themselves:
the whole 19-seed band records FOUR wave-4+ kills total (3
scholar, 1 companion), so a second living vet5 almost never
even has a chance to exist. The four vet5s live 12, 22, 2,
and 9 days respectively; two die unreplaced, two survive to a
win that still has only one of them. (b) Wave 5 is therefore
NOT a post-win curiosity — it is unreached by any route, and
the win-day censoring is a compounding cause, not the whole
story: 15/19 seeds win (8 of them on day 90 itself, the
band's earliest win day), which closes most roads early — but
the two longest unwon runs (87109, died day 146; 87135, died
day 144) also never reach vet2, and 87135 never makes a
wave-4 kill at all despite unlocking wave 4 on day 135 and
living 9 more days. Fixing the win timing alone would not
open wave 5; the village must first learn to kill wave-4
monsters twice, with both killers alive at once.

## Base-shift note (read before comparing with wavegate — loud)

On wavegate's base these same 19 seeds gave national 15/19,
table 7/19, won 6/19 (win days 121–164), wave 4 11/19, median
survival 137. On THIS base the same stack gives national
14/19, table 16/19, won 15/19 (win days 90–197, eight of them day
90), wave 4 12/19, median survival 90. The win-pursuit stack
now wins at the earliest observed day on most seeds. Every
late road — vet2, wave 5, the omen clock — is compressed by
that shift, and the DEFER5/W4-FACED seed labels moved with
it (own-base end blockers below differ from the wavegate-base
labels on several seeds). None of this is a vet2-instrument
artifact: the det OFF leg (wavegate stack, no vet2) on this
base reproduces the day-90 wins exactly. The verdict above
is about this base and this stack; a future arm that wants
wavegate comparability must re-run wavegate's census on this
base, not quote its numbers across it.

## (a) Per-seed veterans trajectory table — the 9 key seeds

DEFER5/W4-FACED = wavegate-base selection label. Own-base
blocker5 is from this arm's last wavegate row (DEFER5 =
readiness short incl. veterans; W4-FACED = wave 4 open but
never faced; WAVE4-NOT-OPEN = wave 4 never unlocked; BELOW =
raw standing < 200). MaxV5/MaxV4 = max living vet5/vet4 set
sizes over daily rows. EndV5 = living vet5 members at run
end. W4 kills are kill-time-keyed (S = scholar at kill time,
V = villager/companion at kill time).

| Seed (label) | Nat | W4 | Table | Win | End | MaxV5 | MaxV4 | EndV5 | FirstVet2 | W4 kills S/V | Vet deaths (replacement) | Own-base blocker5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 87115 (DEFER5) | 77 | — | 87 | 90 | won (90, global) | 0 | 0 | — | null | 0 (0/0) | none (no veteran ever) | WAVE4-NOT-OPEN |
| 87123 (DEFER5) | 86 | 103 | 104 | 110 | won (110, global) | 0 | 1 | — | null | 0 (0/0) | none (Paola vet4, survives) | W4-FACED |
| 87132 (DEFER5) | 77 | 69 | 59 | 90 | won (90, global) | 1 | 2 | Nino | null | 1 (0/1) | Chloe d86, unreplaced | DEFER5 |
| 87134 (DEFER5) | — | — | 73 | 90 | won (90, regional) | 0 | 0 | — | null | 0 (0/0) | none (no veteran ever) | WAVE4-NOT-OPEN |
| 87135 (DEFER5) | 105 | 135 | — | — | lost (144, national) | 0 | 0 | — | null | 0 (0/0) | none (Maeve's w3 kill d135, died same day — never a living veteran) | W4-FACED |
| 87137 (DEFER5) | — | 74 | 80 | — | lost (89, regional) | 0 | 1 | — | null | 0 (0/0) | Leo d79 (replaced same day by Mia); Mia d80, unreplaced | DEFER5 |
| 87120 (W4-FACED) | 77 | 71 | 90 | 103 | won (103, global) | 1 | 1 | — | null | 1 (1/0) | Caleb d88, unreplaced (15 days before the win) | DEFER5 |
| 87121 (W4-FACED) | 79 | 90 | 75 | 90 | won (90, global) | 0 | 1 | — | null | 0 (0/0) | none (Mohamed vet4, survives) | W4-FACED |
| 87126 (W4-FACED) | 77 | — | 57 | 90 | won (90, global) | 0 | 0 | — | null | 0 (0/0) | none (no veteran ever) | WAVE4-NOT-OPEN |

Wave-4+ kills per villager on the key seeds (kill-time-keyed;
the whole band has only 4 such kills — see Band totals):
- 87132: Nino — exactly 1 kill on the run, and it is the
  wave-4 kill (companion, day 69, influencer, the wave-4
  unlock day itself). Nino is the band's only companion vet5
  and its only end-living vet5 on a key seed. Chloe — exactly
  1 kill, wave-3 (companion, day 69, ad_break), vet4 days
  69–85, died day 86, never replaced.
- 87120: Caleb — 1 wave-3 kill (scholar, day 71, chorus_line)
  + 1 wave-4 kill (scholar, day 76, strike); vet5 days 76–87,
  died day 88, never replaced; the village wins day 103
  without him.
- 87123: Paola — 1 wave-3 kill (scholar), vet4, survives to
  the day-110 win; never faces a wave-4 monster (W4-FACED).
- 87121: Mohamed — 1 wave-3 kill (companion), vet4, survives;
  wave 4 unlocks on the win day itself (day 90).
- 87137: Leo — 1 wave-3 kill (scholar), died day 79, replaced
  the same day by Mia — 1 wave-3 kill (scholar), died day 80,
  unreplaced. Two vet4s in two days, neither overlapping the
  other, neither reaching wave 4.
- 87135: Maeve — 1 wave-3 kill (scholar, day 135, spool),
  died the same day; never a living veteran (see Cross-check
  exception — the kill is real, the veteran never is).
- 87115, 87134, 87126: zero wave-3+ kills on the whole run.

## The other 10 seeds (band completeness)

| Seed | Nat | W4 | Table | Win | End | MaxV5 | MaxV4 | EndV5 | W4 kills S/V | Vet deaths | Own-base blocker5 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 87103 | — | — | — | — | lost (60, regional) | 0 | 0 | — | 0 | none | WAVE4-NOT-OPEN |
| 87104 | 77 | 158 | 159 | 159 | won (159, global) | 0 | 1 | — | 0 | none (Onni vet4 survives) | W4-FACED |
| 87107 | 77 | 87 | 60 | 90 | won (90, global) | 0 | 1 | — | 0 | Denise d51 (replaced d87 by Sam) | W4-FACED |
| 87109 | 84 | 65 | — | — | lost (146, regional) | 1 | 1 | — | 1 (1/0) | Lucas d81 (replaced d136 by Daniyar); Daniyar vet5 d136–137, died d138, unreplaced | BELOW |
| 87119 | 80 | 67 | 64 | 90 | won (90, global) | 0 | 1 | — | 0 | Salvador d74, unreplaced | DEFER5 |
| 87124 | 77 | — | 47 | 92 | won (92, global) | 0 | 0 | — | 0 | none | WAVE4-NOT-OPEN |
| 87127 | 78 | — | 127 | 127 | won (127, global) | 0 | 0 | — | 0 | none | WAVE4-NOT-OPEN |
| 87128 | — | 55 | 50 | 91 | won (91, regional) | 0 | 1 | — | 0 | Abdelilah d76, unreplaced | BELOW |
| 87138 | 77 | 40 | 47 | 90 | won (90, global) | 1 | 1 | Daniyar | 1 (1/0) | Connor d41 (repl. d51 Jacob); Jacob d59 (repl. d59 Jorge); Jorge d61 (repl. d82 Daniyar) | DEFER5 |
| 87140 | 77 | — | 197 | 197 | won (197, national) | 0 | 0 | — | 0 | none | WAVE4-NOT-OPEN |

Notes: 87138 is the band's relay race — four successive scholar
vet4s, each killing exactly one wave-3 monster (Connor d40,
Jacob d51, Jorge d59) before dying, until Daniyar's wave-4 kill
on day 82 makes the band's second end-living vet5; vet4 never
exceeds 1 on any day. 87109 is the longest unwon run's version
of the same story: a 55-day veteran gap (days 81–136 with no
living veteran at all), then a vet5 that lives 2 days. 87140,
the longest run on the band (197 days, won), never records a
wave-3+ kill — longevity without blood.

## Band totals (19 seeds, own base)

| Measure | Band |
|---|---|
| National reached | 14/19 (73.7%) |
| Table reached | 16/19 (84.2%) |
| Won | 15/19 (78.9%; 8 of them on day 90) |
| Wave 4 reached | 12/19 (63.2%) |
| Wave 5 reached | 0/19 |
| Median survival | 90 days; max 197 |
| Ever held vet4 >= 1 | 11/19; ever held vet5 >= 1: 4/19; ever held vet5 >= 2: 0/19 |
| Wave-3+ kills (kill-time-keyed) | 22 total: 18 scholar, 4 companion |
| Wave-4+ kills (kill-time-keyed) | 4 total: 3 scholar, 1 companion |
| Capture calls (all waves) | 409, incl. 4 pyrrhic kills; exact-duplicate calls deduped by the analyzer (e.g. 87140: 27 calls -> 20 log entries) |
| Own-base wave-5 end blockers (12 wave-4 seeds) | DEFER5 5, W4-FACED 5, BELOW 2, CAP 0 |

Scope note (not a gap to hide): this arm measures veteran
trajectories only. Arc reach, four-realm formation, trap
acquisition by source, counter discovery rates, and young-link
succession survival are NOT in this corpus — unmeasured, not
zero. Death-cause shares are not re-judged here (wavegate's
corpus carries them on its base).

## Why vet2 never happens — the decomposition

Three stacked reasons, in order of how much they explain:

1. Wave-4 kills almost never happen (the dominant cause).
   Four wave-4+ kills in 19 runs. Seven seeds never record a
   wave-3+ kill at all (87103, 87115, 87124, 87126, 87127,
   87134, 87140), so they cannot even make a vet4. Of
   the 12 seeds that unlock wave 4, 5 never face a wave-4
   monster before the run ends (W4-FACED own-base), and 2
   more end below the t5 standing bar. Only 5 seeds end
   DEFER5 — and even those hold at most 1 vet5.
2. Veteran mortality removes the few vet5s that do appear.
   Of the 4 vet5s, 2 die unreplaced (Caleb d88 on 87120,
   Daniyar d138 on 87109 after a 2-day vet5 life). The 2
   survivors (Nino on 87132, Daniyar on 87138) win with a
   vet5 count of 1 — the second veteran was never made, not
   lost.
3. Win-day censoring compresses the window. Eight wins land on
   day 90; and three seeds win within days of their wave-4
   unlock (87121, counted among the eight, unlocks and wins
   the same day 90; 87123: unlock 103, win 110, never faced;
   87104: unlock 158, win 159).
   But censoring is NOT sufficient to explain the zero: the
   unwon long runs (87109, 87135) and the 197-day winner
   (87140) had the time and still never made a second
   wave-4 kill. A lever that only delays the win would give
   the village more days, not more wave-4 kills — the kill
   rate itself is the gap.

A further mechanism worth naming: same-day death erases
veteran status before it ever counts. Maeve (87135) kills a
wave-3 spool as scholar on day 135 and dies the same day;
she appears in no living vet set on any daily row, so the
gate never sees her. A killer who dies on their blood day
contributes a log entry but never a veteran. That is one
kill, not the verdict driver — but it is the same
living-only rule that makes every vet5 death a full reset
of the count.

## Sense-testing read (SENSE-TESTING LAW)

Two moments, read from kill ledger + daily rows + hold/release
beats (wavegate beats array in each judged JSON):

- 87132, day 69 — the band's best day, and the beat is a day
  late. Scholar Katarina's companions Chloe (ad_break, wave 3)
  and Nino (influencer, wave 4) land killing blows the day
  wave 4 opens. The release beats fire ("Wave 4 talent has
  been released. The Mirror Draft opens."), and the defer5
  beat on the same day says "blood your fighters (0 of 2
  veterans)" — stale by day's end, because the daily snapshot
  already shows vet5 = 1 (Nino). The beat fired before the
  kills landed; by day 76 it corrects to "(1 of 2 veterans)"
  and stays honest through day 90. Chloe dies on day 86
  (she briefly held the mantle herself on day 85 — scholar
  Katarina -> Chloe -> a new holder on day 86). No beat
  marks her death or the vet4 drop from 2 to 1: the village
  hears "(1 of 2 veterans)" on day 83 and again on day 90
  with no change in the telling, even though the second
  vet4 is gone. The count is honest; the loss is silent.
  The fiction notices the unlock, not the casualty.
- 87138, days 40–82 — the relay nobody narrates. Four
  successive scholars each kill exactly one wave-3 monster
  (Connor d40, Jacob d51, Jorge d59) and die within days;
  Daniyar's wave-4 kill on day 82 finally makes a vet5, 8
  days before the day-90 win. Every one of these kills is a
  scholar kill at kill time (via player, killer == mantle
  holder) — the end-of-run keying would agree here by luck,
  since each killer died before succession could confuse it,
  but the kill-time capture is what proves that rather than
  assuming it. The day-40 beat ("blood your fighters (0 of
  1 veterans)") fires alongside the wave-4 release, before
  Connor's kill lands — the same fire-before-kill ordering
  as 87132. A village living this relay would hear the same
  "blood your fighters" line at each changing of the guard
  with no acknowledgment that the last blooded fighter died.

Judged: the hold beats track the living veteran count
honestly across days (0 -> 1 on 87132, 1 held on 87138's
tail), but they are fire-time snapshots, not day-end truth,
and nothing in the beat stream marks a veteran's death.
That is a narration gap, not a gate gap — the counts the
gate uses are correct; the village is never told what it
lost. Steve-call if the death of a veteran should speak.

## Cross-check exception (87135 — read, not smoothed)

One cross-check (iii) mismatch on the whole band: 87135, day
135, spool, by gen_23d2m8q (Maeve). The exact capture says
scholar (scholarVidAtCall = Maeve, via player — a scholar
TB kill). The daily census says villager (latest daily row
with day <= 135 is the day-135 row itself, scholar
emma_larsen). The daily series resolves it: day 134 scholar
= Maeve, day 135 scholar = Emma — succession fell between
the kill moment and the day-135 daily snapshot. Maeve killed
as scholar and died the same day; Emma holds the mantle by
the time the daily row is written. The exact capture wins
per the prereg, and the mismatch is succession-shaped (the
analyzer machine-checks the shape: prior row scholar == by,
kill-day row scholar == census scholar). This is the same
succession hazard the sim-compchan correction exists for,
caught live on a wave-3 kill. It moves no vet5 number
(Maeve's kill is wave 3, and she is dead either way), but
it is proof the exact capture — not the census — is the
right primary for kill-time keying.

## Instrument (what was built, and the fix mid-run)

- policies/vet2-diag.js: daily scholar vid + living vet4/vet5
  sets (standing.js isLiving rule) + vid->name maps. Pure
  reads, VET2-gated, delegates byte-identically when unset
  (proof-test guard).
- vet2-sweep-20261031.js: stdout-runner — one JSON line per
  seed on stdout, nothing else on stdout, progress on stderr;
  the game-loaded process never writes a file. The splitter
  (vet2-split-20261031.js, plain node) writes the per-seed
  JSONs with the resilient writer (180 x 10s, full-size
  verify, 0-byte deleted on failure).
- Kill capture: wraps BOTH waveKillLog writers. The first
  pilot run caught the gap: game.js has two writers,
  recordWaveKill AND recordPyrrhicKill (a monster killed on
  a dying tick in a lost fight writes the log directly,
  deliberately scoring nothing toward wave bars). The
  capture initially wrapped only recordWaveKill and missed
  one pyrrhic kill on 87134 (day 61 belltoad, wave 1) — cc2
  MISMATCH, pilot gate not declared. The first pilot corpus
  was DISCARDED (files deleted, not retained as judged
  data), the prereg was amended before any re-run, the
  det-gate was re-run with the fixed sweep, and the pilot
  was re-run fresh. The pyrrhic finding matters beyond this
  arm: a pyrrhic wave-3+ kill WOULD enter the log the gate
  reads, so any future kill census that wraps only
  recordWaveKill is incomplete in principle, not just on
  one seed.
- Analyzer cross-checks (i)–(iv) as pre-registered, plus the
  succession-shape check on cc3 mismatches (machine-checked,
  human-verified in the exception above).

## Det-gate (trajectory neutrality, prereg requirement)

- ON vs OFF on 87115 and 87126 (same stack, same seeds,
  scratch dirs, never the judged corpus; re-run with the
  fixed sweep after the pyrrhic amendment): hashes IDENTICAL
  (90 vs 90 on both seeds), end fields IDENTICAL (gameDays,
  won, national, table, maxWave, endScaleRank, endReason) on
  both seeds. DET-GATE PASSED (twice — once per sweep
  version). The vet2 layer + both kill captures do not move
  trajectories.
- Deviation from the prereg letter, documented: the prereg
  names scratch dirs generically; the arm's det legs ran to
  worktree scratch dirs (scratch-vet2-det/, deleted before
  commit) instead of /tmp — the sibling-cleanup lesson, same
  as wavegate-a. The requirement (scratch, never the judged
  corpus; byte-identity + end-field comparison) is preserved
  exactly; only the scratch location differs.

## Determinism leg (corpus trust, prereg requirement)

- Pilot seed 87115 re-run to a scratch dir is BYTE-IDENTICAL
  to its judged JSON (132,744 bytes both, `cmp` clean).
  The judged corpus is reproducible on this base.

## Metric review (for the NEXT run — mandatory section)

1. The snapshot counts matched the rd counts daily on 19/19
   seeds (cc1 clean) — the vet2 snapshot re-implements the
   standing.js living rule independently and agrees
   everywhere, including the 87132 same-day unlock (vet5 = 1
   on the unlock row) and the 87126 same-day pattern class.
2. Capture-vs-log (cc2) is the check that earned its keep:
   it caught the pyrrhic writer on the first pilot. Any
   future kill census must wrap both writers (or read the
   log itself, not the choke point). The analyzer's dedupe
   (exact (d,mid,by,via,trick) repeats) is also load-bearing:
   87140 alone has 7 duplicate calls the log correctly
   collapses.
3. Capture-vs-census (cc3) disagreed exactly once, and the
   disagreement proved the exact capture's value (87135
   same-day succession). Future arms should treat the exact
   capture as primary and the census as the cross-check,
   never the reverse — and should expect same-day
   succession mismatches wherever a scholar kills and dies
   on one day.
4. The pilot gate behaved: the first pilot failed it on a
   real instrument gap (cc2), the fix was made before any
   verdict was declared, and the re-run pilot passed 7/7
   key seeds cleanly. The "discard, don't patch" handling
   of the first pilot is the pattern to keep: no judged JSON
   from a superseded instrument survives.
5. Prereg wording for the next arm: the capture paragraph
   should name both writers from the start (the amendment
   already does for this arm), and the pilot gate should
   name cc2 explicitly as a gate condition (it was implied
   by the verdict clause; making it explicit avoids any
   argument about whether a cc2 failure blocks the pilot —
   here it did, correctly).
6. Base-shift warning for the next arm: this base's day-90
   win clustering compresses every late measurement. An arm
   that needs post-day-90 veteran trajectories (e.g. vet2
   survival over time) needs either a longer-lived band
   (seeds that don't win at 90) or a stack that doesn't win
   at the floor — otherwise the census will keep measuring
   a 90-day window no matter what the question is.

## Backlog items (for the coordinator — NOT chased mid-run)

1. Wave-4 kill rate is the gap behind the vet2 zero: 4
   wave-4+ kills in 19 runs, 5 wave-4 seeds never facing a
   wave-4 monster at all. Measurement question: are wave-4
   monsters avoided, fled, or lost — and does the day-90 win
   cluster (8/19 win on day 90) mechanically pre-empt the facing window?
   Needs an encounter (not kill) instrument on the wave-4
   pool, on a band that doesn't win at 90.
2. Veteran-death narration gap: no beat marks a veteran's
   death or the vet-count drop (87132 Chloe d86, 87120
   Caleb d88). Design question: should a veteran's death
   speak? Steve-call if it changes narration.
3. Same-day-death veteran erasure: a killer who dies on
   their blood day never counts as a veteran (87135 Maeve).
   Design question, not a bug claim: is living-at-day-end
   the intended veteran rule, or should the blood day
   itself count? The gate reads living killers; the fiction
   (companion kill beat) notices the kill either way.
4. Base-shift: the win-pursuit stack on this base wins at
   day 90 on 8/19 seeds vs 6/19 wins at days 121–164 on
   wavegate's base. If the ship loop lands the intervening
   src/js changes, the scale-wall picture (national/table/
   wins) needs re-baselining before any lever is judged
   against wavegate-era numbers.
