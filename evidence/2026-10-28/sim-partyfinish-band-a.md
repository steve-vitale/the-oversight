# sim-partyfinish-band-a — the driver fires, the wave-4 field conversion does not: NO-GO

Run: fleshout loop, run fleshout-20261028T1528Z. Axis: scale-onramp
(the blocking axis). Worker: sim-partyfinish-band-a. Worktree:
`~/workspace/worktrees/sim-partyfinish-band-a` (branch
sim-partyfinish-band-a). Base: master at worktree creation
(includes the landed partyfinish mechanism + driver and the
1415Z censuses).

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-partyfinish-band-a-prereg.md (commit
4da3f5680). Corpus: evidence/2026-10-28/perseed-partyfinish-band-a/
(8 rows + summary.json + analysis.json). Instruments (new this
arm): scripts/test-partyfinish-band-a.js (census analyzer + GO
judge; copy of scripts/test-w4convert-postparty.js with ONLY
the corpus path, the control target, and the verdict legs
changed, plus the pre-registered party-size extension),
scripts/test-partyfinish-band-a-sense.js (sense replay,
NON-MEASURED). Sweep instrument scripts/test-partyfinish-sweep.js
UNEDITED, with EVID pointed at the new corpus dir (never into
perseed-partyfinish-a/, which holds the landed partyfinish-a
corpora). DETGATE: PASS on 75101 before the band (plain
days=132, gameDays=132, tsNationalDay=77 — identical to the
1415Z detgate numbers; wrapped-all-OFF identical, no diag
surface, no pf surface, no wraps installed). Zero src/js
changes, zero default flips, no [needs-eyes]: measurement only,
as tasked.

## Plain words first

Switching the partyfinish driver ON does not convert wave 4.
The driver fires exactly as it did when it landed — 12 sorties,
29 beasts cleared, 18 counted party finishes — but every one
of those finishes is a wave-1/2 beast at 1 HP, and wave-4
field kills stay at zero, exactly as they were with the
driver off. The band's 3 wave-4 kills (vs 2 with the driver
off) all come through the same channel as the control's:
the scholar grinding a lingering beast down over repeated
turn-based fights. One short of the pre-registered bar of 4,
so the verdict is NO-GO — and the more important finding is
not the miss by one, it is that the driver's own mechanism
contributed zero wave-4 kills. A bigger band would not fix
that; it would only re-measure the same TB attrition with
more noise. Per the prereg's kill-fast rule, no holdout band
was run.

## Verdict: NO-GO (binding prereg, judged exactly as written)

Judged by scripts/test-partyfinish-band-a.js (mechanical
PASS, exit 0) plus the detgate (PASS):

- KILLED 3 vs need ≥ 4: FAIL (the deciding leg).
- Party kills 2 vs need ≥ 1: PASS.
- Cost bar: PASS. Starvation 1 ≤ control 1 + 2; median 140d
  ≥ 117d (0.8 × 146d).
- Driver fired: PASS. pfSortieCalls 12 (> 0).
- Census validity: PASS. 8/8 rows, every recorder errs 0,
  no overflow, unclassified 0, vanished 0, control re-census
  with the same definitions reproduces 44/21/21/2 exactly
  (self-check PASS on all 11 fields).
- NO-GO on leg 1 alone is NO-GO. No holdout, no re-score.

## The census (band vs 1415Z PARTYFINISH=0 control, identical seeds)

| measure | PARTYFINISH=1 | control | delta |
|---|---|---|---|
| wave-4 universe / faced / engaged | 46 / 19 / 17 | 44 / 21 / 21 | +2 / −2 / −4 |
| wave-4 KILLED | 3 | 2 | +1 → misses bar |
| field faced/engaged/killed | 7 / 7 / 0 | 11 / 11 / 0 | −4 / −4 / 0 |
| raid faced/engaged/killed (drafted-only) | 16 / 3 / 0 (10) | 16 / 2 / 0 (9) | 0 / +1 / 0 |
| TB faced/engaged/killed | 10 / 10 / 3 | 14 / 14 / 2 | −4 / −4 / +1 |
| never-met / met-no-kill | 27 / 16 | 23 / 19 | +4 / −3 |

Per-seed census: 75101 2/1/1/0; 75102 3/1/1/0; 75103 9/2/2/0;
75104 11/7/6/0; 75105 10/5/4/2; 75106 2/0/0/0; 75107 0/0/0/0;
75108 9/3/3/1 (universe/faced/engaged/killed). Note 75107's
universe is 0: wave 4 unlocked (waveReach 4) but no wave-4
monster was ever spawned on that seed's trajectory — reach
without a single beast to meet.

## The 3 kills (and what changed vs the control's 2)

Band kills (party size from the winning fight's record, per
the pre-registered definitions):

- 75105 d121 Eater, TB, party 2 (scholar + vasyl_shevchenko).
- 75105 d167 Strike, TB, party 2 (scholar + visjoin_163).
- 75108 d113 Strike, TB, SOLO (scholar alone).

Control kills: 75102 d172 Reunion, TB, solo; 75108 d95
Suburb, TB, party 2. So the band did NOT keep the control's
kills and add to them: it lost the 75102 kill outright (the
armed 75102 trajectory spawns no Reunion instance at all —
universe 3, maintain + scripted-titan — and faces only a
herald, fled in a raid), kept a kill on 75108 but against a
different beast (Strike seq 33, solo, not the control's
Suburb seq 32), and gained two party kills on 75105, a seed
where the control killed nothing. Net +1, all of it
TB-channel trajectory movement, none of it sortie-caused.

## The mechanism finding (why NO-GO is structural, not a near miss)

The secondary analyzer (scripts/test-partyfinish.js, control
vs this band) reproduces the landed partyfinish-a result
exactly on this band: counted sortie finishes 18, baseline
0 — the same 18 beasts, the same days, the same parties of
3, all wave 1/2, all at 1 HP, all round 1, all corneredHold
true. Zero of the 18 is wave 4. The driver works; it just
never touches a wave-4 beast, for two compounding reasons
visible in the same data:

1. The sortie gates almost never admit a wave-4 lingerer.
   Sorties fire only when the weakest lingerer is ≤ 80 HP
   and the treeline sums ≤ 300 HP. Wave-4 beasts arrive at
   850–1500 HP; the TB attrition that grinds them down
   (75102's Reunion fought at 300, 171, 120, 120 HP in the
   control) rarely pushes one under 80 HP while it still
   lingers, and the driver held 27 times on minHp across
   the band — the common hold, overwhelmingly against
   wave-1/2 treelines.
2. Even a held round 1 cannot finish a wave-4 beast. The
   cornered hold guarantees one round, not a kill; a party
   that deals ~60–200 damage in round 1 leaves an 850-HP
   beast standing, and the in-round break check then flees
   it exactly as before. The hold finishes 1-HP beasts by
   construction. It was never a wave-4 mechanism, and this
   band proves it: 12 sorties, 29 cleared, 0 wave-4 field
   kills.

The honest reading: wave-4 conversion on this substrate is
a TB-attrition phenomenon (scholar-led repeated fights
against a lingering beast), not a village-party phenomenon.
The 2 party kills on 75105 are real party wins — a scholar
plus one villager finishing an Eater and a Strike — but
they are TB wins, not the driver's sortie finishes, and
they arrived by trajectory luck (75105's armed trajectory
is bloodier: 75 deaths vs 48 control), not by a mechanism
any policy switched on.

## Wall numbers (THIS band only, never pooled)

| field | PARTYFINISH=1 | control |
|---|---|---|
| national ever / final | 8/8 / 6/8 | 7/8 / 6/8 |
| table invited / entered | 7/8 / 5/8 | 4/8 / 3/8 |
| wins (lesser / full) | 5/8 (5 / 0) | 3/8 (3 / 0) |
| wave-4 unlock | 8/8 | 6/8 |
| wave-5 unlock | 0/8 | 0/8 |
| median survival | 140d (days: 90, 131, 132, 134, 140, 162, 180, 180) | 146d |
| max survival | 180d | 180d |
| starvation deaths | 1 (75108) | 1 (75108) |
| deaths total | 312 | 286 |

Per-seed ends, band -> control: 75101 won lesser d162 ->
won d132; 75102 survived d180 -> d180 (no win either way);
75103 won lesser d132 -> won d132 (identical); 75104
village-lost d131 -> won d90; 75105 survived d180 ->
d180 (no win either way); 75106 won lesser d90 -> lost
d146; 75107 won lesser d134 -> survived d180; 75108 won
lesser d140 -> lost d102. All wins are lesser-seat wins;
the full seat is still nobody's story, wave 5 still
unreached, on either band. The band's wall numbers reproduce
the landed partyfinish-a ARMED band exactly (wins 5,
median 140d, deaths 312, courtship 119, sorties 12/29) —
the driver + mechanism reproduce, the wave-4 census on them
is what is new here.

Death-cause shares, band (312 deaths): villager combat 125
(40.1%), villager-vs-villager combat 75 (24.0%), arena 39
(12.5%), expedition 24 (7.7%), sortie combat 22 (7.1%),
monster 8 (2.6%), ambush 4, sickness 5, starvation 1
(0.3%), remainder small. Control (286): combat 110
(38.5%), villager combat 80 (28.0%), arena 43 (15.0%),
expedition 22 (7.7%), monster 14 (4.9%), starvation 1.
The cost bar as pre-registered (median + starvation)
passes, but the +26 deaths — including 22 sortie-combat
deaths and one won -> lost seed flip (75104) — are
reported here, not hidden behind the win count, exactly
as in the partyfinish-a evidence. Arm-only dead seeds:
75104 only (died armed, won control); starvation there 0
(≤ 2, passes the arm-only part of the bar).

## Sense-testing read (non-measured replay, seed 75104)

Replay trajectory disclosure first: the sense replay ends
d144 village-lost, while the judged 75104 row ends d131
village-lost. Same outcome, different day — the replay's
trajectory does NOT match the judged row, so every line
below is wording evidence only, never a count, and no
replay line is claimed to have happened on the judged
trajectory. (The replay runs the same policy with
narration on; its RNG stream diverges from the sweep's.)

What the replay shows, in plain words: the village's
judgment about wave 4 reads like people deciding under
risk, and it is also the demand gap itself. On d86 the
muster beat says: "scouts report The Eater hunting near
Haven, and it is beyond us. Everyone inside. No one walks
the treeline alone — the garden crews double up, the
hunters stand down. We outlast it." That is a coherent
retreat judgment — and it is why no sortie ever goes out
against a wave-4 beast: the village judges it cannot win,
so the party never forms for that fight. When the village
DOES judge the treeline weak enough, the sortie lines read
honestly: d90 "Pamela, Boris, Norkys take up arms and a
day's rations (6,258 kcal from the stores) and walk out to
the treeline. Nobody's coming back the same." — named
fighters, a real price said aloud, a sober last line, no
promise of a kill. The kill lines then credit the party,
not one hero: "Pamela killed the Ugly-Eyes with their
party — 1 round, 7 taken. Word travels fast. Cornered at
the treeline, it could not slip away before a blow. The
carcass is out there — haul it home before it rots."
(The cornered clause lives in the fight record, not in a
spoken beat — CORNER_LINES=0 in the replay, the same
narration shape as partyfinish-a.)

One robotic note, documented not fixed: the Herald's
titan-call line ("THE HERALD does not notice you the way
prey notices a hunter... sound the call, muster 10 allied
blades (you have 0). This is not courage. This is
arithmetic.") fires verbatim 33 times over d108–d111 in
the replay — up to ~17 times in a single day. A true
warning repeated until it is wallpaper is not people
talking; it is spam. It is not this arm's mechanism (it is
the Herald call line), so it is flagged here for a future
narration pass, not fixed here.

## Village assessment (plain words)

Five of these eight villages win through the lesser seat
and go home — three of them (75106, 75107, 75108) only
because the armed village finishes what the control
village watched leave or died to, and one of them (75102)
survives where the control village's shape was worse.
Three villages do not win: one dies armed that the
control saved (75104, won d90 -> lost d131, the sortie
blood price made concrete), one survives on both bands
(75105, bloodier armed, 75 deaths), one wins on both
bands at different lengths (75101, 75103). Every village
reaches wave 4 armed; none reaches wave 5 or the full
seat. The treeline is no longer a place where broken
beasts sit unanswered — twelve sorties answer it — but
wave 4 is still not a village fight: villagers meet it
alone in the field and flee or die (field outcomes on the
band: vFlee dominant, vDie present, vKill zero), and the
only beasts that die are the ones the scholar grinds down
in repeated turn-based fights. What this arm proves is
narrow and final for this mechanism: the cornered-party
hold is a 1-HP finisher, not a wave-4 converter. The next
arm on this axis has to pick a different lock — the
sortie gates (a wave-4 lingerer will almost never be
≤ 80 HP), the held-round damage (one round cannot dent
850+ HP), or the TB attrition channel itself — and it
must pre-register field-channel kills, because TB party
wins can pass a party leg without the driver (see metric
review).

## Blanks filled or documented

- MEASURED, NOT FILLED: wave-4 conversion under the
  partyfinish driver — NO-GO (3 vs bar 4, field kills 0).
  The 1415Z blank 1 is now answered: the driver does not
  convert wave 4. No holdout run; the pilot killed the arm
  cleanly.
- DOCUMENTED, NOT FIXED: sortie gates exclude wave-4
  lingerers by construction (min ≤ 80 HP vs 850–1500 HP
  arrivals); held round 1 cannot finish a wave-4 beast;
  TB attrition is the only wave-4 kill channel on this
  substrate, in both bands; the Herald titan-call line
  spams verbatim (33× over 4 replay days).
- CARRIED (not chased here): field-party formation on
  meeting (1415Z blank 2 — still 0 field parties on
  meeting; this band's field fights are lone villagers);
  veteran survival/conversion (1415Z blank 3 — veterans
  remain near-zero at fight starts; the 75105 party kills'
  villager fighters are not recorded as veterans in the
  census's terms); TB attrition shape design look (1415Z
  blank 4, steve-call candidate — both control kills and
  all 3 band kills are scholar-led TB attrition wins).

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged
exactly against its prereg GO rule (killed ≥ 4, party
kills ≥ 1, starvation ≤ control + 2, median ≥ 117d,
sortie calls > 0, census validity). All legs except killed
pass; the verdict is NO-GO on the killed leg, full stop.
Judgment notes, disclosed, none a re-score:

1. PARTY LEG WITHOUT A CHANNEL REQUIREMENT. The party-kill
   leg passed (2 party kills) on TB fights alone — fights
   the driver never touches. A future prereg that wants
   driver-caused conversion must pre-register a
   field/sortie-channel kill requirement (e.g. ≥ 1 wave-4
   field kill, or ≥ 1 sortie-caused kill), because a TB
   party win can pass the party leg while the mechanism
   under test contributes zero. That revision applies to
   the NEXT run, never this one — and it would not have
   changed this verdict, which already fails on killed.
2. DRIVER COUNTERS ON THE CONTROL PRINT. The analyzer's
   driver-counters line prints CONTROL: {} — the control
   corpus (perseed-w4convert-postparty) was generated
   under tableseat-nowait without the partyfinish wrapper,
   so its rows carry no pf.* counters. The driver-off proof
   for the control is the 1415Z finding (zero sortie rows,
   no sortie call in tableseat-nowait, engine default
   'endure'), not this print. Not a gap in the band: the
   band's own counters (12 sorties, 29 cleared) prove the
   driver fired.
3. SENSE REPLAY DIVERGENCE. The sense replay's trajectory
   (d144) does not match the judged 75104 row (d131).
   Sense text is wording-only by design, so this changes
   no judged number — but a future sense script should pin
   the replay to the judged trajectory (same sweep mode and
   sample cadence) before any replay line is quoted as
   happening on a judged seed. Recorded here, not fixed by
   re-running the band.
4. PANEL. scripts/balance-panel.js compare still requires
   --before/--after panel.json.gz files built from live
   roots; it has NO corpus-ingest mode for a single-arm
   census corpus (re-checked this run: usage error
   "compare --before <panel.json.gz> --after <panel.json.gz>
   --out <prefix>"). No panel artifact was faked; the
   paired control/armed census tables on identical seeds/
   substrate/recorders, with the driver the only difference,
   are the §15 substitute, as in the 1415Z runs.
5. TELEMETRY DEVIATION CHECK (loop body step 10, run AFTER
   writing evidence): 2 LOUD lines on this corpus
   (national disappeared: baseline 12 -> current 0;
   wins disappeared: baseline 16 -> current 0; n=10 files =
   8 rows + summary.json + analysis.json). Verdict: KNOWN
   ARTIFACT, baseline NOT rolled — the same field-shape
   artifact as the 1415Z runs (per-seed rows carry
   nationalEver/entered/won, not top-level national/wins
   paths) plus the baseline's own winseat-regime note. No
   table LOUD line this time (band table invited 7 vs
   baseline 16, a −56% swing below the LOUD threshold —
   itself consistent with the real wall movement, table
   4 -> 7). The corpus's real wall numbers are
   nationalEver 8/8, table entered 5/8, wins 5/8.

## Infrastructure notes

- Sweep: scripts/test-partyfinish-sweep.js (unedited), 8
  seeds, per-seed invocations (~1–2 min/seed, ~14 min/band)
  + detgate (one seed's two runs, same script, run before
  the band) + sense replay (~80 s) + analyzer (seconds).
  Corpus gate PASS.
- Safe-commit EPERM flap hit the prereg commit twice
  ("sha1 file '/tmp/idx-safecommit-*.lock' write error:
  Operation not permitted", same container-EPERM class as
  the jest chown quirk); third attempt succeeded, commit
  4da3f5680 verified correct. Safe-commit index clobber
  hit the same commit (bogus staged deletion for the file
  byte-identical to HEAD); repaired via HEAD-blob cacheinfo
  (blob 3fc591bc8d3f9825d739b25f78e533dc75d2c183),
  verified status clean + diff HEAD empty + hash match,
  before any sweep ran.
- Worktree heartbeat slow once (~70 s, registry-lock
  contention with a sibling process) but landed; later
  heartbeats landed normally.
- The band's wall numbers reproduce the landed
  partyfinish-a ARMED band exactly on every field (wins 5,
  median 140d, deaths 312, courtship 119, sorties 12,
  cleared 29, per-seed ends identical) — a trajectory
  reproduction across bases, not a new claim: the driver +
  mechanism reproduce, and this run's new contribution is
  the wave-4 census on those trajectories.
- Branch ready, pending coordinator merge; NOT pushed, NOT
  bumped, live NOT verified (coordinator/ship-loop line,
  not this arm's).
- check.js --quick: NOT run by this worker, deliberately
  (zero src/js changes; the proofs of record are the
  analyzer mechanical PASS, the detgate PASS, the sweep
  corpus gate PASS, and the secondary partyfinish analyzer
  GO on its own legs — that analyzer's GO judges sortie
  finishes, NOT this arm's wave-4 GO, and must not be
  quoted as this arm's verdict).

## Findings for the coordinator (NOT appended by this worker)

- [measured-NO-GO] 2026-10-28 — partyfinish driver ON —
  wave-4 KILLED 3 vs bar 4 (control 2), field kills 0 both
  bands, sortie finishes 18 all wave 1/2 at 1 HP, party
  kills 2 (both TB, 75105), cost bar passes (starvation 1,
  median 140d), driver fired (12 sorties). NO-GO; no
  holdout per kill-fast rule.
- [open] 2026-10-28 — wave-4 sortie gates exclude wave-4
  lingerers by construction (min ≤ 80 HP vs 850–1500 HP
  arrivals; 27 minHp holds on the band, none wave-4).
  Next arm must re-think the gates, the held-round damage,
  or the TB attrition channel itself — not re-run this
  driver.
- [open] 2026-10-28 — Herald titan-call line spam (33
  verbatim repeats over 4 replay days) — narration pass
  candidate, not a mechanism fix.
- [open] 2026-10-28 — future wave-4 preregs must require
  field/sortie-channel kills: TB party wins pass a bare
  party leg without the tested mechanism (metric review
  item 1).
