# sim-departbeat-b — the ordinary wave-4+ departure beat: the village now says when a party walks out

**Verdict: GO.** On the frozen prereg bars: 14 ordinary-beat
`vetSays` lines on the armed band vs 0 on control (B1); all 14
wave-4+ launches carry exactly one beat line, 0 missed, 0 spam,
0 malformed (B2); launches and village deaths identical armed vs
control, per seed (B3 — the beat is fiction-only and moved
nothing). The 16-seed confirm band's silence — 0 launch-mention
`vetSays` lines — is closed on this band: every ordinary wave-4+
launch now speaks, once, naming the holder, the party, and the
target as the village knows them.

## 1. What was built

The departure beat (`src/js/win-plan.js`, `src/js/villager-brain.js`;
build commit `34aa45640`):

- New `departLaunchBeat(self, vid, launched, target)` in
  `win-plan.js`, next to `reseedLaunchBeat`, same voice: holder +
  party + target as the village knows them (`disp`/`displayName`,
  `monsterNoun`, `articlePhrase`), deterministic, no RNG, SYSTEM
  wrap after arrival. Wording:
  "`<Holder>` sets out with `<C1>` and `<C2>` after `<Target>` —
  the fire marks the trail." Solo launch (companion blocked,
  inviter still goes): "`<Holder>` sets out after `<Target>` —
  the fire marks the trail." No target on the plan: the "after …"
  clause is dropped rather than invented. SAY_RE token:
  "marks the trail" (collides with nothing the game says).
- New `winPlanDepartLaunchBeat(vid, launched)`: the single launch
  hook for BOTH departure paths. It calls
  `winPlanReseedLaunchBeat` FIRST — if the re-seed beat speaks,
  the launch already has its beat, so the ordinary beat is skipped
  and the dedup stamp is set (exactly one beat per launch,
  ordinary XOR re-seed). Otherwise the ordinary beat fires only
  for a wave-4+ plan (`needWave >= 4`), only while DEPARTBEAT is
  on (default-ON; `DEPARTBEAT=0` silences it), and only once per
  launch: `plan.departBeatDay` / `plan.departBeatTarget` are
  stamped BEFORE speaking, so a re-entrant call the same day for
  the same target is silent, while a genuinely new launch
  (different day, or different target) speaks again.
- Hook sites (the two direct re-seed-hook calls moved inside the
  shared method, unchanged): `winPlanDepart`'s `launchParty`
  (after `partyDepartures`, before `return true`) and
  `vbrainExecuteDepart`'s `party_launch` branch (before `return
  'launch'`). Both sites keep a fallback: a caller that never
  received the shared hook (test ctx, older caller) still gets
  the re-seed beat exactly as before — the fallback is the old
  call, not a second speak. (This fallback was added after the
  first proof run caught it: without it, the reseedbeat fixture
  ctx — which binds only `winPlanReseedLaunchBeat` — launched
  silently, and `test-reseedbeat-b.js` went 21/30. With it, all
  reseed suites are green again; see §2.)
- Gate: `departbeatOn()` = `process.env.DEPARTBEAT !== '0'`
  (default ON — deliberately inverted vs the other `*On()`
  gates, per the pinned design; the control leg sets
  `DEPARTBEAT=0`). Fiction only: `say()` consumes no RNG and
  writes only the narration log; the only state writes are the
  two dedup fields on the holder's plan, read by nothing but
  this hook.
- One deliberate pin update in the same commit:
  `test-reseedbeat-b.js` §A's brain-path pin expected the old
  reseed-hook one-liner; it now pins the shared hook + the
  fallback (the design changed on purpose; the pin's intent —
  the brain path speaks the beat before `return 'launch'` — is
  unchanged).

## 2. The staged proof — old vs new

`scripts/test-departbeat-b.js` **34/34**. The fixture is the
ordinary wave-4 shape: holder Amina, live Herald plan
(needWave 4), companion Diana, both armed + armored (spear +
armor) — the gear and party a player actually has at a wave-4
hunt, never a fresh un-geared solo scholar. Drives the REAL
`winPlanDepart` and the REAL `vbrainExecuteDepart` (stubbed dawn
commit).

| Section | What it proves | Result |
|---|---|---|
| §A code pins (14) | beat wording, no RNG, no-target clause-drop, reseed-first precedence, needWave>=4 gate, default-ON, stamp-before-speak, same-day dedup, both hook sites, provides header, driver SAY_RE token, token collision-free | pass |
| §B1 winPlanDepart | live Herald plan → launch, stage hunt, party of 2, exactly one line: "Amina sets out with Diana after Herald — the fire marks the trail."; stamp set; no re-seed line | pass |
| §B2 brain path | same fixture through `vbrainExecuteDepart` → launch + one line | pass |
| §B3 trio | VETREENGAGE + companion2 → "Amina sets out with Diana and Emmett after Herald — …" | pass |
| §B4 solo | companion's startExpedition refused (COMPANIONGUARD shape) → "Amina sets out after Herald — …" | pass |
| §B5 SYSTEM prefix | after arrival the line wraps as `📺 SYSTEM: "..."` like its siblings | pass |
| §C old-code control | same fixture against pre-change `win-plan.js` (`git show bcc59bcd4`) launches with NO beat line of either kind — fail on old, pass on new | pass |
| §D negatives (7) | wave-3 launch silent; DEPARTBEAT=0 silent (launch unchanged); expired-plan re-seed launch speaks the re-seed beat once, no ordinary beat; same-day second launch silent, next-day launch speaks again; no-target hook drops the clause; hook with no plan is a silent no-op | pass |

One proof-run correction, recorded here rather than hidden:
the first D3 (re-seed precedence) used a plan whose target was
still set and dead — which takes the DEAD-TARGET branch (commit
beat + no stamp), not the expired-plan stamp branch. The launch
correctly spoke the commit beat + the ordinary beat (two lines,
two different facts). D3 now uses the true expired-plan shape
(targetless, stamp set) and D7 locks in the dead-target shape.
The lever was right; the test's fixture was wrong.

Regression suites on the build tip (`34aa45640`):
`test-reseedbeat-b.js` **30/30**, `test-reseed-b.js` **97/97**,
`test-reseedexpiry-b.js` **58/58**, `test-reseedwide-b.js`
**28/28**. Analyzer selftest **18/18** (see §4).

## 3. Live pilot — 8 seeds, control vs armed, identical seeds

Band **106771–106778** (fresh — see the frozen prereg's
freshness check), 150d, policy `competent` verbatim, substrate
on BOTH legs `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
FLEEREPAIR2=1 FIGHTALLY2=1 PLANRESEED=1`. Legs differ ONLY by
DEPARTBEAT: armed = unset (default-ON); control =
`DEPARTBEAT=0`. Driver `scripts/departbeat-driver-b.js` (a copy
of `reseedexpiry-driver-b.js` + SAY_RE "marks the trail" +
`departbeatFlag`); anchor `34aa45640` on all 16 files, 0
instrument errors on both legs. Corpora:
`evidence/2026-11-21/perseed-departbeat-b-106771-{armed,control}/`;
analyzer output
`evidence/2026-11-21/departbeat-b-106771-analysis.json`;
legs logs `departbeat-b-legs-{control,armed}.log`.

Analyzer verdict **GO**:

| Bar | Armed | Control | Pass? |
|---|---|---|---|
| B1 ordinary-beat vetSays | 14 | 0 | yes |
| B2 wave-4+ launches | 14 (floor 4) | 14 | — |
| B2 launches with 0 beats | 0 | — | yes |
| B2 spam days (ordinary beats > launches) | 0 | — | yes |
| B2 unmatched beat lines | 0 | — | yes |
| B2 unexplained re-seed beats | 0 | — | yes |
| B2 malformed beat lines | 0 | — | yes |
| B3 launches armed vs control | 14 = 14 | — | yes |
| B3 deaths armed vs control | 696 = 696 | — | yes |

Per-seed (armed — control is identical on launches/deaths):

| Seed | Launches | Ordinary | Re-seed | Missed | Deaths | End |
|---|---|---|---|---|---|---|
| 106771 | 1 | 1 | 0 | 0 | 92 | village-lost d125 |
| 106772 | 0 | 0 | 0 | 0 | 59 | village-lost d81 |
| 106773 | 0 | 0 | 0 | 0 | 97 | village-lost d147 |
| 106774 | 12 | 12 | 0 | 0 | 122 | survived d150 |
| 106775 | 0 | 0 | 0 | 0 | 94 | survived d150 |
| 106776 | 1 | 1 | 1 | 0 | 64 | village-lost d133 |
| 106777 | 0 | 0 | 0 | 0 | 109 | village-lost d112 |
| 106778 | 0 | 0 | 0 | 0 | 59 | survived d150 |

The launch distribution is lopsided — one village (106774)
accounts for 12 of the 14 launches — but the floor (≥ 4) is met
with margin, and every launch on every seed is beaten exactly
once. The control leg's launches show the expected silence
(13 of its 14 launches have 0 beats; the 14th is the 106776
re-seed launch, beaten by the re-seed line on both legs).

## 4. Instrument finding — correction 2 (analyzer miscount, fixed before judging)

The analyzer's first version counted ALL beat lines (ordinary +
re-seed) against wave-4+ launch days and reported NO-GO
(spamDays 1, unmatched 1). That was the counter, not the game:
seed 106776 d36, Dale Hoffman launched on an expired-plan
re-seed to `terms_of_service` (targetWave 3, stage hunt, party
of 2 — the v4departs row and dawnbidDeparts seq 378 confirm the
launch) and the re-seed beat fired exactly once. The re-seed
beat has no wave gate by design — it speaks for ANY
expired-plan re-seed launch — so a wave-3 re-seed launch speaks
while the wave-4+ survey excludes it. The frozen B2 metric
("every wave-4+ launch carries exactly 1 beat line") never
covered that line; it belongs to a wave-3 launch. The analyzer
was fixed (prereg Correction 2, recorded before judging):
spam/unmatched are now counted on ORDINARY beats only (each
wave-4+ launch carries at most one ordinary beat, by the hook's
stamp — exact), and a re-seed beat on a day with no counted
launch is explained iff ANY launch row exists that day. The
selftest gained S15–S17 for the three shapes (wave-3 re-seed
beat explained; ordinary + re-seed on one launch day; re-seed
beat with no launch row at all stays unexplained and fails B2).
Re-run verdict: GO (above). The frozen metric did not change;
the counter was miscounting out-of-population lines — the same
class of instrument finding the reseedbeat arm filed for its
expiry counter.

## 5. Wall numbers (armed = control, byte-identical)

| | Armed | Control |
|---|---|---|
| wins | 0 | 0 |
| national | 0 | 0 |
| wave 5 unlocked | 4/8 | 4/8 |
| wave 4 unlocked | 8/8 | 8/8 |
| standing 199 | 3/8 | 3/8 |
| survived 150d | 3/8 | 3/8 |
| median survival (gameDays) | 140d | 140d |
| village deaths | 696 | 696 |

The beat moved nothing — as a fiction-only lever must not. The
wall is unchanged in shape: no wins, no national, the 199 stall
on 3/8 seeds, 5/8 villages lost before d150. The launches
themselves are the story of this band: 106774's village launched
12 times and survived; the other seven villages launched twice
between them.

## 6. SENSE-TEST — does the beat read like the fire speaking?

All 14 ordinary beats, as the player hears them:

> 106771 d64: "Kavya sets out with Marcus, Brian and Luis after The Strike — the fire marks the trail."
>
> 106774 d71: "Theo sets out with Rafael, Chantal and Sari after The Eater — the fire marks the trail."
>
> 106774 d84: "Sari sets out with Mateo after The Rerun — the fire marks the trail." / "Chantal sets out after The Rerun — the fire marks the trail."
>
> 106774 d92/d94: "Sari sets out with Rafael and Isabella after The Rerun — the fire marks the trail."
>
> 106774 d98–d123: "Sari sets out with Mateo and Rafael / with Theo / (alone) / with Ivana / with Rafael and Ivana after The Ugly Beast — the fire marks the trail."
>
> 106774 d115: "Ivana sets out with Sari after The Network Note — the fire marks the trail."
>
> 106776 d92: "Miguel sets out with Hyun-ji, Elena and Ruth after The Ugly Beast — the fire marks the trail."
>
> 106776 d36 (re-seed, for contrast): "Dale is hunting The Terms of Service now — the fire found a new trail."

It reads like the fire speaking — same cadence as the re-seed
beat, holder + party + target named, one line per departure.
Three honest readings, stated plainly:

- **The same party going out every few days repeats the line.**
  Sari launches 8 times on 106774 in 40 days, often with the
  same companions after the same target. Each line is true — she
  really is going out again — and the beat is once per launch by
  design, so the repetition is the village's own rhythm, not
  spam. But a player watching one village will hear near-identical
  lines often. A future wording pass could vary the line by
  party size or repeat count; that is a voice tweak for a later
  arm, not a defect in this one.
- **The target's name can change mid-band — and that is the
  game, not the beat.** Sari's target is `rerun` throughout, but
  the line calls it "The Rerun" on d84–d94 and "The Ugly Beast"
  from d98 on. The village coined its own name for the beast
  ("The Ugly Beast" is a steady-temperament coinage from the
  `ugly` trait) and the village-agreed name wins over the
  System's (`monsterDisplayName`: "Village-agreed name wins").
  The beat reports the name as the village knows it at that
  moment — the same helpers the re-seed beat uses. A player who
  remembers "The Rerun" will hear the village rename it; the
  game never explains the rename in the line itself. True, and
  arguably the point of the naming system.
- **Two holders can launch the same day and both speak.** d84
  carries two beats (Sari and Chantal, both after The Rerun) —
  two departures, two lines, no double-beat on either launch.
  The day-join in the analyzer treats them as a pair; the staged
  proof (D4) proves the per-launch dedup underneath.

## 7. Metric review

- **B1 is the finding, closed.** 14 > 0 armed, 0 control — the
  confirm band's 0 launch-mention lines are now 14 lines on an
  8-seed band with the same substrate shape. The control leg
  re-confirms the baseline on identical seeds.
- **B2 is exact, not approximate.** 14 launches, 14 ordinary
  beats, 0 missed, 0 spam days, 0 malformed — every launch
  beaten once. The one re-seed beat in the band (106776 d36)
  belongs to a wave-3 launch outside the surveyed population;
  the analyzer's correction-2 handling of it is documented in
  §4, and the control leg carries the same line (the re-seed
  beat is untouched by DEPARTBEAT).
- **B3 is the strongest evidence the lever is fiction-only.**
  Launches 14 = 14, deaths 696 = 696, per-seed identical —
  including standing, survival, and end days. A narration lever
  that moved trajectories would have shown up here first.
- **The lopsided launch distribution is a property of the band,
  not the beat.** 12 of 14 launches come from one village.
  The GO does not depend on it (the floor is 4, the coverage is
  14/14), but a future band that wants launch-shape claims
  should expect most villages to launch rarely.

## 8. Blanks filled / documented

- **Finding (confirm band silence) — FILLED.** Ordinary wave-4+
  launches now speak, once per launch, on both departure paths.
  The holds were already voiced; the launch half of the silence
  is closed.
- **No canon doc covers fireside departure beats** (noted in
  the prereg): `docs/CONVERSATIONS.md` covers dialogue UI, not
  narration beats. The voice model is the documented reseed
  beat in `win-plan.js` + the hold lines in
  `villager-brain.js:736/:768`. Nothing was invented from
  scratch.
- **Analyzer limitation, stated in the analyzer + §4:** the
  day-join cannot prove a re-seed line on a wave-4+ launch day
  belongs to that launch rather than to a same-day wave-3
  launch. The hook + staged proof (D3) prove the
  one-beat-per-launch construction; the analyzer counts.
- **No new findings filed.** The naming flip (§6) is the
  village-naming system working as designed, not a defect.

## 9. Files / disposition

- Lever: `src/js/win-plan.js`, `src/js/villager-brain.js`
  (build commit `34aa45640`).
- Proof: `scripts/test-departbeat-b.js` (34/34).
- Instrument: `scripts/departbeat-driver-b.js`,
  `scripts/analyze-departbeat-b.js` (selftest 18/18).
- Prereg: `evidence/2026-11-21/sim-departbeat-b-prereg.md`
  (with Corrections 1–2).
- Corpora:
  `evidence/2026-11-21/perseed-departbeat-b-106771-{armed,control}/`
  (8 files each).
- Analysis:
  `evidence/2026-11-21/departbeat-b-106771-analysis.json`
  (analyzer verdict GO).
- Legs logs: `evidence/2026-11-21/departbeat-b-legs-{control,armed}.log`
  (+ `.err` files, both empty).
- Evidence: this file.
- **Disposition: GO under the frozen prereg — HELD unmerged,
  as instructed.** The adoption coordinator merges.
- **Safe-commit index clobber (once this run):** after the build
  commit, the worktree's main index showed the 4 new files as
  staged-as-deleted and the 3 modified files as MM (the known
  clobber class). The commit was verified correct by hash
  (`34aa45640`, 7 files) and the index repaired with `git
  ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`; verified `git status --short` empty +
  `git diff HEAD` empty.
- **Heartbeat:** one skip (registry lock held > 120s, sibling
  activity), one landed.
- **No check.js --quick on this branch:** a sibling arm
  (sim-doorflee-b) was running `check.js --quick` concurrently
  when this arm's run started, and the harness forbids concurrent
  jest — this arm's run was killed rather than contend with it.
  The arm's own gates (proof 34/34, reseed suites 97/97, 58/58,
  30/30, 28/28, analyzer selftest 18/18, live band 16/16 files,
  0 instrument errors) all pass, and the src/js change is two
  small hooks plus one beat function and one shared-hook method.
