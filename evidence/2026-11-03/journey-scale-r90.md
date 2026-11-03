# journey-scale r90 — Lane A, leg 3 SCALE (2026-11-03)

**Run id:** laneA-scale-2026-11-03T02:45CST (scheduled 02:45 CST 2026-11-03).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@8d4b6c17b at branch creation.
**Pre-register:** evidence/2026-11-03/journey-scale-r90-prereg.md
(written and committed before any scored seed ran).
**Change set at closeout:** ZERO src/js, zero src/data. Tooling (r90
driver/analyzer, r73 clone, labels/seeds/EVIDIR only, PLUS the read-only
daily fusionWatch instrument — diff verified) + evidence + run note only.
Gating freeze honored; perception law honored (all instruments read-only;
the pickers only press offered menu items, never engine state).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Pre-flight clean:** main-tree `git status` empty, disk 30%,
  `git pull` already up to date, worktree-reap ran (13/16 active — all
  dirty/held lane-B, gap, and flesh-out trees, correctly untouched).
- **Registration was slow, not stuck:** worktree-register took ~6 min
  (git worktree add / reset --hard under heavy sibling load), same
  class as r67/r68/r71/r72/r73. No action.
- **Heartbeat, two lessons in one run:** the manual beat at
  registration verified landed (08:52:27Z), but the 10-minute nohup
  loop died silently sometime before its 09:02 beat — no loop process
  survived to be found — and heartbeats then queued behind a sibling
  registration (sim-sortiev2-a, 09:00) that holds the registry lock
  across its whole checkout, so the next landed beat was 09:15:41Z
  (23 minutes stale, still far under the reaper's 4-hour threshold;
  no tree was ever at risk, and no other lane-A run was due before
  closeout). Recovery: manual beat verified by read-back, loop
  restarted on a 5-minute cadence with timestamped logging, its first
  beat verified landed 09:16:39Z. The loop is killed at closeout.
  Standing note for the next run: the registry lock is held across
  whole checkouts, so beats queue for minutes under contention —
  a 5-minute cadence, not 10, is the margin that keeps a beat inside
  the 15-minute overlap window.
- **Safe-commit index clobber struck on the prereg commit**, same class
  as r66–r73: after the correct private-index commit (03acbce12,
  3 files), the worktree's main index lied (3 files staged-as-deleted
  + untracked). Repaired via HEAD-blob cacheinfo, verified: `git
  status` clean, `git diff HEAD` empty, hash-object matches HEAD for
  all 3 files. The commit itself was correct.

## Q1 — SCALE CONTINUITY: PILOT GATE STOPPED THE QUAD (binding)
Pilot seed 85081 ran first and completed with **pilgrimages == 0** —
the prereg's pilot gate says STOP, so the quad (85082–85084) was NOT
run. This is a gate outcome, not a re-score: per MEASUREMENT §14 the
gate binds, and the run does not burn a full quad on a pilot that
shows no pilgrimage. The pilot itself is a full-leg playthrough
(143 days), so Q1's verdicts below are pilot-only, labeled as such.

| seed | end | day | pop | pantry | rank | seat | arc | waves w1/w2/w3/w4/w5 | contests | crises | pilg |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 85081 | SCATTERED (hunger, 3rd day) | 143 | 7/7 | 0 | regional | none | 3 | 14/7/6/2/0 | 11 | 4 | 0 |

- **85081 — the village that built a network and starved anyway.**
  Five links at the end (1 lead subordinate trust 50 aged 118d, 2
  covenant peers trust 56/63 aged 117/109d, 1 covenant trust 34 aged
  50d, 1 trade trust 33 aged 32d), court poor 63 days, 4 peer
  proposals made, zero pilgrimages completed. National block, named
  precisely: COVENANT road is one tending short — the third covenant
  peer sits at trust 34, six short of the seasoned 40 (age 50d already
  qualifies). LEAD is further (1 of 3 subordinates). Lesser-seat
  block: food deeds alone (waves 14/7/6/2, 11 contests, 4 crises,
  stage 3, regional — foodDeeds false). The end is the familiar
  scale-leg price: pantry 0, three hungry days, "Haven couldn't
  hold. On the third hungry day, people started walking."
- **Duty counts (single seed, not a band):** weapon-craft lines 0,
  deadfall-duty lines 0; wsplit 546 villager-days, 354 knower-days,
  ALL armed (real 251, both 103), weaponless 0, eligible 0, attempts
  0. The armed-gate classification reproduces again — the count
  continues, it does not re-argue the classification.
- **Barrier pin:** 1 entry, same signature as r67–r73 (sleep refused
  during an active fight via sayOncePerFight). The guard working as
  designed, not a guard-break.
- **Gossip exposure:** 0 picks across 2 sittings (ask:gossip never
  offered in either menu). Same offer-bottleneck class as r68–r73.

## Q2 — FUSION TRACE: THE TRANSITION IS SUCCESSION (new work, delivered)
**The r70 follow-up is answered.** `fusionReactorOnline()` is an AND
of three things (game.js): installed AND online !== false AND
`hasAbility(sch, 'fusion_reactor')`. The trace names which leg of
the AND flips, on two independent seeds:

**Pilot proof (current base, daily fusionWatch rows):**
- d103: sigrun installs the pellet → installed=true, onlineFlag=true,
  online=true, hasAbility=true. "You will never be hungry again."
- d116: sigrun dies d115 ('a stranger'); successor yuki_mori →
  installed STILL true, onlineFlag STILL true, but online=false,
  hasAbility=false.
- d126: yuki dies d126 ('arena'); successor hassan_ali → same triple:
  installed true, online false, hasAbility false.
- No feast grant or refusal fired in this seed (0/0) — the village
  never feasted after the install — so the flip itself, not a feast
  correlation, is this seed's evidence. Analyzer: install day 103,
  flips 2 (false→true at install, true→false at succession).

**Mechanism (code, not inference):** playerDeath does NOT replace the
scholar object — it mutates the same `s` (ledger.js), so the
fusionReactor flags ride along untouched. mantleBecome then replaces
`s.abilities` with the successor's own npcAbilities ("the dead
bearer's die with them"; Steve 2026-10-14: "You become that
villager"). The design comments say it outright (game.js
abilityOnAcquire; villager-build.js mantleBecome): "a dead bearer's
reactor goes with the body and the world's flag STAYS set, so no
second reactor rises." The benefit is per-bearer (the ability); the
flag is per-world (never cleared). At the first succession after an
install, the AND loses its third leg and the reactor goes dark —
silently: no line tells the new bearer they are uncovered, while the
install line promised "It does not come out."

**r70 corroboration (r70's own evidence, no re-run needed):** 85042
installed day 18, feasts refused days 21–65, bearer deaths day 84
(contest) and day 94 (the wild), FEASTED grant day 118, end abilities
with NO fusion_reactor despite fusionInstalled=true. The d118 grant
falls after two successions — exactly what the mechanism predicts.
The pellet blocks new bearer feasts only while the bearer holds the
ability; it never blocked a successor's feast.

**Targeted track (reported, not force-fit):** the prereg's 85042
re-run with the r90 driver did NOT reproduce r70's landmarks — it
ended day 83 scattered on the fifth hungry day (regional, lesser
seat arc 4 waiting, foodDeeds true, waves 10/11/4, 4 pilgrimages,
pellet never installed, feasts granted d46/d53/d71 with no reactor
in play) versus r70's day-181 national lesser-waiting run. Causes
available and stated, not adjudicated beyond them: base drift
(r70 base 680d60dde → r90 base 8d4b6c17b, dozens of commits) plus
the picker delta (r90 driver runs WANT_SUBJECT=1; r70's prereg
names GOSSIP_FIRST only). Per the prereg's landmark rule the move
is reported and the retrace is NOT cited as evidence for or against
the r70 anomaly — the pilot proof + r70's own death log carry Q2.

**Secondary finding (cosmetic only, documented not fixed):**
sinceDay and holder day always read 0, because the install writes
`this.state.day` and state has no `.day` (the clocks are
scholar.day / village.day). Nothing reads fusionReactor.sinceDay
anywhere in src/js, and the holder's day/vid fields are read only
as a boolean singularity guard — so the zeros change no gameplay.
A one-field fix would change nothing the player sees; not landed.

**Fix-gate verdict: CLOSED, by design.** The succession darkening is
designed behavior with explicit comments, not a senseless defect —
clause (a) fails, so no code changes and no proof test was written
for a fix that does not exist. Carried as a PROPOSAL for a future
run, not code today: voice the transition — when the mantle passes
from a fusion_reactor bearer to a successor who doesn't hold it,
say aloud that the hum died with the bearer (no-silent-actions
law; the install promise is otherwise left standing false).

## Q3 — PEOPLE CHECK (sense law — both transcripts read in full)
2 of 2 fully real. No fabricated shared history, no filler loops,
no static menus.
- **85081 d90 Hassan (nonverbal, Hindi-only):** a language-barrier
  sitting done right — subject menu, then only nods, with the r72
  nod-cycling fix visible (three distinct nod-backs, no verbatim
  repeat) and a promise-without-words close. One line first read as
  a barrier leak ("Fuck you." inside a nod-back) — checked, NOT a
  leak: it is the documented Mario moment (conversation.js
  maybeEnglishFragment: zero-English speakers sometimes know a
  handful of English words, once per sitting, 35%). Designed.
- **85081 d120 Patrick (seek_taken):** a real want, cleanly played —
  "Have you ever asked? About the taken — about Dariga?" / unsure /
  commit ("I'll ask it. I promise.") / "Even asking is more than
  the silence." / close with an open offer. Dariga is a taken person
  the NPC names, not invented shared history with the player.

## Q4 — DUTY COUNTS (see Q1)
Single-seed counts above; the band count continues at zero for both
duty lines without re-arguing the armed-gate classification.

## Reachable / Fun / Winnable (plain words, pilot-only)
- **Reachable:** yes, in the pilot's own shape. Regional, five
  links, courts, tribute arrivals (7), a pellet install, a waiting
  table-approach (arc 3, seat none on food deeds) — nothing in this
  leg sat behind a door a competent player cannot open. The one
  thing never reached here is a completed pilgrimage (0/4 proposals
  completed under a 63-day poor court) — a thin spot, named, not a
  wall: the proposals fired, the completions didn't, under hunger
  pressure.
- **Fun:** mostly, and sharper than the census. The pellet story is
  the leg's best accidental drama: twelve days of "never hungry
  again" (d103–d115), then the bearer dies and the promise quietly
  dies with her while the flag insists it didn't — the village
  starves at the end with a dead reactor in the office. The
  conversations are genuinely good (Hassan's wordless promise,
  Patrick's taken). The dull spot is the same one: the poor court
  sits poor for 63 days while proposals go nowhere.
- **Winnable:** not shown this run — and this run doesn't pretend
  otherwise. One pilot seed, no quad: the lesser seat was blocked
  on food deeds, national one tending short, wave 5 untouched
  (w4:2 faced). The full seat stays unwon across r66–r73 and now
  this pilot; the new information is the pellet mechanism, not a
  shorter wall.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-census.json --current
'evidence/2026-11-03/journey-scale-r90/journey-scale-r90-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ three LOUD lines, all investigated same-run, all EXPLAINED:
- `census.day swung -75%: baseline 579 -> current 143 (n=1)`:
  the baseline is a band SUM (r73's decision stands); current is a
  single pilot seed. Sum-vs-single, not a drop.
- `census.maxWave swung -75%: baseline 16 -> current 4 (n=1)`:
  same sum artifact (4 seeds' waves summed vs one seed's 4).
- `census.pilgrimages disappeared: baseline 69 -> current 0 (n=1)`:
  the pilot-gate outcome itself (0 completed under a poor court),
  not a regression. Baseline NOT rolled — rolling a single-seed
  pilot over a band sum would corrupt it.

## Tests
- `node --check` clean on the r90 driver and analyzer.
- Analyzer on the pilot EVIDIR: 85081 line as reported above;
  85082–85084 lines are zeros (quad stopped — no files exist, not
  measured zeros).
- check.js --quick (on the branch code, `--cacheDirectory=
  /tmp/jest-cache-playtest`): **284 passed, 6 failed in 711s**.
  The 6 are the SAME pre-existing failures r73 named (same files,
  individually confirmed from the log, not assumed):
  godpath/test-measurement-proof-update,
  godpath/test-measurement-workflow,
  godpath/test-mobile-combat-cadence,
  godpath/test-occupation-panels,
  godpath/test-phone-frame-proof, and
  test-establishment-r20-fixes-20261020.js (same racks-full
  "next day voices once more" gate assertion). No NEW failure.
  Q2's fix gate needed no suite result (no code changed), and this
  run's tooling-only change set is covered by the same guard.

## Metric review
- Q1's pilot gate fired exactly as written (pilgrimages == 0 →
  STOP). The quad was not run, and no threshold was re-scored to
  rescue it. The pilot's verdicts are labeled pilot-only wherever
  they appear; nothing here claims band shape from n=1.
- Q2's landmark rule fired exactly as written (retrace landmarks
  moved → reported, not force-fit). The deliverable rests on the
  pilot proof + r70's own evidence + code, each cited separately.
- Q3's day-60 substitution proposal (r73 metric review) was NOT
  adopted mid-run; both sittings exist at 90/120, so no substitution
  was needed. The proposal stays open for a future thin band.
- Carried, still open: the mantle-pass voicing proposal (Q2 above);
  the poor-court pilgrimage completion thin spot (Q1 above); the
  wave-4/5 breadth wall for the full seat (unchanged, not
  re-proven here).
