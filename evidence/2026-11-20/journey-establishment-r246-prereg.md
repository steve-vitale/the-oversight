# Journey leg ESTABLISHMENT — r246 pre-registration (2026-11-20, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230/r231/r232/r233/r240/
r241/r242/r243/r244/r245 precedent). Death-aware: stop after 10 consecutive
all-dead daily checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-20261120T2232Z` (scheduled Fri 2026-11-20 15:45 CST).
Rotation file read **1 (establishment)** — this run plays leg 1, no queue
jump. Run number r246 (r245 is the last establishment run, 2026-11-20
05:45 CST). **Base:** local master `1581a7887` at registration. Heartbeat
loop running (9-min cadence, detached setsid loop, PID recorded in the
run note). Pre-flight: main tree CLEAN, disk 49%.
**Write flap:** a new window hit at registration (~22:33Z — the first
`worktree-register.sh` failed with `error: unable to write file
tools/mobile-sim.html` / `version.json` / `fatal: Could not reset index
file to revision 'HEAD'`; a probe write to a fresh file failed EPERM in
both /tmp and ~/workspace/worktrees at ~22:36Z). Per the
local_write_flap_response skill: no forced writes, wait for the clear.
The flap cleared ~22:34:51Z (probe passed on the first re-check after a
1-minute wait). Registration retried after the clear: the first attempt
had failed before creating the branch, but the branch name already
existed — r245's branch, pointing at the current master tip and fully
merged (ancestor of master, no registry entry). Deleted with
`git branch -d` (safe: master holds the commits) and re-registered
cleanly. Lock created 22:32:12Z (run_id playtest-20261120T2232Z) before
the flap window. No push (ship loop owns pushes). **Rotation handling
at closeout:** read the rotation file then; if it reads `1`, write
`1→2` with read-back.

## Base delta vs r245's panel base `683c9a6e5` (src/js)
`git diff --stat 683c9a6e5..1581a7887 -- src/js/` — 5 files, +89/−11.
All five changes are conversation/villager systems this leg exercises —
this run is the first live-panel read of each:
- `convo-dialogue.js` +53 — **WARN-HEED (journey-landing r150,
  `a11df1fac`, [needs-eyes])**: the first heed of a warn_you sitting
  now speaks the warning itself (`convoWantWarning`), once per
  sitting; the details path marks it delivered so it never
  double-delivers. **The base change to watch:** a player who
  promises to be careful is told WHAT to be careful about. r150's
  panel: 4/4 warn_you sittings, 0 dangers named — the defect this
  fixes. Watch via the new warnLog instrument (see leg question §7).
- `convo-dialogue.js` (same file) — **SETTLED-FAVOR NAMING
  (journey-scale r247, `b6a551691`, [needs-eyes])**: the bare "It's
  already handled. Thank you for asking." now names the favor —
  "It's already handled — {short}. Thank you for asking." — falling
  back to the bare line only when there is no speakable short. Wild
  evidence: seed 103891 d120, Karlygash — the favor died off-screen
  and the answer named no part of it. Watch via the new
  settledFavorLines extract (see leg question §8).
- `conversation.js` +23 — **DRY2 REPLACEMENT CHECK (journey-social-life
  r256, `ed19c3d57`)**: when the exhausted-pool pick is itself
  run-blocked, the guard walks the pool for a variant that isn't
  blocked; if every variant is blocked, the admission is spoken
  structural instead of drying ("...Sorry, lost my train of
  thought."). The wild F6 site was Sigrun 45766 d45 (ask:gossip —
  composed gossip line run-blocked, guard's exhausted pick
  run-blocked too). Watch via the new dryLines extract (see leg
  question §9). r256's panel: F6 0 dry GO.
- `convo-beats.js` +15 — **GOAL-BRIDGE POOL (journey-landing r149,
  `0d38a74d1`, [needs-eyes])**: the goal bridge pool grows 2 → 6
  lines — the two-line pool meant convoPickCycle's without-replacement
  cycle was strict alternation, and a third goal-bridge in one sitting
  repeated a line heard two turns earlier (1274 d7, turns 8 and 16).
  Six lines means seven goal-bridges before any repeat; the keep-3
  memory window keeps near repeats out. Watch via post-hoc grep over
  the held convo txts (see leg question §10).
- `betrayal.js` +7 — **SELFWIT (journey-succession r258, `ef5e65cb1`)**:
  the ambush path's witness list now excludes the victim (the combat
  path already did via fightWitnesses; the ambush path let the dead
  witness their own death). Proof test 4 cases GREEN. Watch via the
  deaths-extraction witnesses passthrough (see leg question §11);
  r258's panel supply was 1/9 seeds (REL-WIT insufficient-data), so
  no ambush death on this panel is a report-only outcome, not a miss.
- `build.js` +2 — version stamp only.
- Everything else in range: evidence/scripts-only landings (deepening
  r246 growth-line GO, scale r247, crisis r257, succession r258,
  winnability rounds 1530/1830, strikeband screens, raiddef-a
  NO-GO, lend/evade/draftmiss/roll35 levers reverted — instrument +
  evidence only, no panel effect). **None of the above touches the
  settled-ledger favorless-ask mechanism, the sitting-close machinery,
  or the freeloader pipeline** except through the five conversation
  changes above (watched, §§7–11). Q1/Q1b/Q2/Q5 bars carry verbatim
  from the r245 prereg except the pre-registered revisions below.

## Leg question (r245's named next steps, first)

**Q1 FAMILY RE-READ — the favorless-ask mechanism on a fresh band
+ the r245 metric-review revisions (bow gear count, E1-case split,
driver day-desync diagnosis) + the five conversation changes' first
live-panel read (warn-heed, settled-favor naming, DRY2, goal-bridge,
self-witness) + the F2 scholar-death watch, fifth panel + the
senseexped launch watch + the wave-4 / standing watch + the REACT
watch, last run before retirement decision.**
1. **Q1 NINTH FRESH-BAND RE-READ.** r231 13/82 (15.9%) → r232
   2/77 (2.6%) → r233 1/53 (1.9%) → r240 1/70 (1.4%) → r241 1/55
   (1.8%, class C 1/1, never surfaced) → r242 2/70 (2.9%, E1 2/2,
   stage-0-surfaced 2/2, LOST 0) → r243 2/53 (3.8%, E1 2/2,
   stage-0-surfaced 2/2, LOST 0) → r244 3/61 (4.9%, E1 2 + C 1,
   stage-0-surfaced 1/3, LOST 2) pre-fix / 0/60 (LOST 0)
   re-panel → r245 4/70 (5.7%, E1 2 + C 1 + ?, stage-0-surfaced
   2/4, LOST 2 — both E1-case, see §2). Same trace + classifier as
   r232–r245 (read-only probes; classes A–E verbatim; widened LOST
   trigger from r242). Thresholds verbatim from the r243 prereg: GO
   = rate <20% AND zero stage-0 wants resolved 'deflected' AND
   every favorless sit classified; NO-GO = rate ≥32.8% OR any
   stage-0 want resolved 'deflected'. LOST asks reported separately
   (each a defect finding, documented + proposed, not landed).
2. **E1 SPLIT (r245 metric review).** E1 (opener never ran) splits
   into **E1-case** (the sitting's picks include ≥1 `betrayal:*`
   case-thread pick — the case thread crowded the opener out) vs
   **E1-plain** (opener never ran, no case picks — some other
   thread pre-empted it). Both r245 LOST asks were E1-case
   (Victoria 101953 d17, Heinrich 101954 d10); the class name hid
   the mechanism. The analyzer prints both counts + the case-thread
   detail lines. The fix proposal (the opener gets one turn in a
   case sitting, or the case thread yields one pick to a u≥3 need)
   stays with the goals/conversation arm — proposed, not landed.
3. **BOWCRAFT WATCH REVISED (r245 metric review).** The /bow/i
   telemetry-key scan is blind: bows exist as equipped gear but
   crafting emits generic `weapon_craft`/`ammo_craft`/`craft` keys
   (r245: 0 bow-key events panel-wide, yet the fork-proof gear count
   finds 7 bows equipped on the r245 corpus — crude_bow ×3, bow ×3,
   crossbow ×1; the r245 run note undercounted bow ×2). This run counts bow items in the end-census
   `equipped` lists per seed (itemIds matching /bow/i) and reports
   the panel total against the r245 corpus (7 bows) and the r244
   corpus. The old telemetry scan stays as a secondary line (its
   continued 0 is the blind-scan confirmation, not a finding).
   Deepening r246's bow watch counted 23 bows equipped the same
   way — the gear-count method is the established one.
4. **DRIVER DAY-DESYNC DIAGNOSIS (r245 metric review).** Seed
   101955 ended d42: the driver's day counter desynced (d40 dawn
   missing, d42 dawn doubled — two `daily` entries both read
   game-day 42). The r246 fork proof on the r245 corpus CORRECTS
   the r245 note's reading: repeat/skip pairs are SYSTEMATIC clock
   jitter, not a one-seed quirk — 51 pairs across the 5-seed panel,
   every seed showing several (a repeat then a skip, netting to
   zero). The finding-relevant metric is NET DRIFT —
   (lastDay − firstDay + 1) − loopDays: 0 on 4/5 r245 seeds, −1 on
   101955 (last day 42, not 43). The r246 driver records the loop
   counter `d` alongside `nowDay(Game)` in `daily` and
   `scholarDawns` (`loopDay`), and emits a `dayDesync` summary
   (the repeat/skip list with loop days, for diagnosis); the
   analyzer recomputes net drift from `daily` and cross-checks the
   count. Instrument-only change — the band is kept (r245 prereg
   rule: instrument-only changes keep the band). A seed with net
   drift −1 is named as one game-day short (the r245 101955 shape);
   bars are unaffected unless a desync costs a full game-day on a
   seed, in which case it is named per seed like r245's 101955.
5. **F2 SCHOLAR DEATHS (r242: 6/5, r243: 3/5, r244: 4/5 pre-fix
   + 2/5 re-panel, r245: 4/5 — fifth panel).** Same rule: ≤2 per
   5-seed panel = WATCH (report causes + last-dawn locations); ≥3 =
   investigate. r245 causes: Paisley d24 (wild, haven-edge (4,4)),
   Werner d26 (wild, haven-edge (4,4)), Eli d13 (stranger, out in
   the wild), Emon d39 (wild, out in the wild). The haven-edge
   (4,4) last-dawn shape now appears on 3 panels running (r244
   Domingo + r245 Paisley/Werner): **if it recurs on this panel it
   graduates from watch to a goals-arm question** about whether the
   scholar should sleep inside the haven. This run reports the
   count + causes, adjudicates base-effect vs band noise, proposes
   nothing to land unilaterally.
6. **SENSEEXPED LAUNCH WATCH.** With the launch-party sense fix
   in, does any party-launch signal appear in the telemetry
   type-count map (r241/r242/r243/r244/r245: zero on all five
   panels)? Any launch is named with its seed/day/party shape;
   a launch that kills a wave-4 beast is reported as a
   base-effect, not a panel finding alone.
7. **WARN-HEED WATCH (r150 fix, first live panel).** The driver
   wraps `Game.convoWantWarning` and logs every warning delivery
   (`warnLog`: day, vid, line start). The analyzer counts warn_you
   sittings (wedge sits whose picks carry wantId warn_you) and,
   for each, whether a warning was delivered for that vid on that
   day — and whether `dlg:heed` or `dlg:details` was pressed
   (engagement). **Defect finding:** a warn_you sitting where the
   player engaged (heed or details pressed) and no warning was
   delivered for that vid that day — the r150 shape (4/4 sittings,
   0 dangers named). GO = every engaged warn_you sitting names a
   danger; a sitting that ends before any engagement is reported
   separately (no finding — the player walked away before asking).
8. **SETTLED-FAVOR NAMING WATCH (r247 fix, first live panel,
   report-only).** The driver extracts from dayLines every line
   matching /It's already handled/ (`settledFavorLines`: day, line,
   named vs bare). Expect named lines where a short exists and bare
   lines only where there is no speakable short. A bare line where
   the favor carried a short is a watch item for the scale arm,
   not a defect finding this run (the mechanism is the one-line
   branch; the panel watch is the live read).
9. **DRY2 WATCH (r256 fix, first live panel on this leg,
   report-only).** The driver extracts from dayLines every line
   matching /lost my train of thought/ (`dryLines`: day, line).
   Expect 0 — the r256 panel read 0 dry on its F6 watch. Any
   sighting is named with seed/day/vid and read against the
   transcript (was the exhausted pick itself blocked, or did some
   other path dry?).
10. **GOAL-BRIDGE WATCH (r149 fix, first live panel,
    report-only).** Post-hoc grep over the held convo txts: within
    one held convo, does any goal-bridge line repeat (the six-line
    pool: "Anyway — that's my cross to carry…", "Right. Sorry, I go
    on about it…", "That's my road to walk…", "I'll carry it a while
    longer…", "Enough about what I'm chasing…", "One day at a time…")?
    A repeat within one sitting is a watch item for the landing arm
    (the r149 defect shape: turns 8 and 16 on 1274 d7). The people
    check reads 2 convos per seed, 8 turns each — a repeat inside
    8 turns is detectable; a sitting longer than the held sample is
    outside this watch's reach and is said so.
11. **SELFWIT WATCH (r258 fix, first live panel, report-only).**
    The driver passes `witnesses` through in the deaths extraction
    when the telemetry death entry carries it. The analyzer reports
    any ambush-cause death whose witness list contains the victim
    id — that is a defect finding (the r258 shape: the dead
    witnessing their own death). r258's panel supply was 1/9 seeds;
    no ambush death on this panel = report-only outcome, not a miss.
12. **WAVE-4 / STANDING WATCH.** r242: 3/5 wave 4, standing to
    160. r243: 0/5, standing to 70. r244: 0/5 pre-fix (standing to
    50), 2/5 re-panel (standing 120/100). r245: 3/5 wave 4,
    standing to 135 — the best wave-4 showing on the leg in the
    recent run, with no mechanism tying it to the BOWCRAFT turn-on
    (no observable bow activity). This run reports wave reached +
    standing per seed; a matched-band A/B is still owed before any
    claim about the wave-4 door.
13. **REACT WATCH (r246 wind-down fix, second live panel).**
    Per r245 metric review: keep it one more run; if the panel max
    consecutive `dlg:react` stays at 1, **retire it for this leg**
    and keep it on scale only (the r246 defect was a scale-leg
    shape). r245: max 1 on all 5 seeds, 0 sittings ≥3. Same rule:
    a run ≥3 is a finding ONLY if the transcript shows the
    dead-react pool cycling verbatim with no landed beat between.
14. **MOURNING WITNESS WATCH (r254 variant, second live panel,
    report-only).** Post-hoc grep over the held convo txts: any
    mourning sitting where the speaker witnessed the latest fresh
    dead fall — does the served line name the witnessed dead?
    r245: the mourning topic was picked (15 on 101955 alone) but
    no held convo captured a mourning sitting. Same handling: a
    sitting that serves a generic mourning line where a witness
    line was due is a watch item for the succession arm.
15. **F2 ECHO WATCH (carried).** With the r243 echo fix in,
    expect 0 acceptance echoes in the people check; a sighting is
    recorded for the conversation build arm with the transcript.
16. **COUNTER (comma-only, carried).** Defect finding = a COUNTER
    LEARNED label containing `", "` only. Report the comma count,
    the em-dash count (watch), and the total lines per seed.
    r245: 110 lines, 0 comma-clause, 0 em-dash.

## Bars (verbatim from the r245 prereg unless revised below)
- **Q1b WANT-RAISE:** GO = panel raise rate ≥10% AND no seed with
  0 raises. r245: 70/322 (21.7%). Report kinds (forage_help /
  heal_help / sick_help / food_share / water_haul / no-kind).
- **Q2 SITTING CLOSES:** GO = 0 cut sittings (mechanical half:
  engine-ended + 0 beats after last THEM + no closing line; the
  open-question half is a human read). WATCH 1–2 (read in full);
  NO-GO ≥3 or any cut ending on an open question/invitation.
- **Q3 RECAP PARAPHRASE (report-only):** distinct <6 report-only;
  ≥6 a second formulation is owed. Carried canned-line watch
  (pod-dream, recap stitch, slope-reading, walked-in, take-it,
  stew-bowl, pod-dream-open). r245 distinct: 2 of 10 sittings
  (raw 4).
- **Q6 POLICY FORAGING (report-only):** per seed, scholar
  bumpCalls vs wedgeSits vs joint forage_help commits. F4 shape =
  bumpCalls ≤2 AND wedgeSits ≥50. r245 per-seed: 45/58?/4 —
  (bumpCalls 45/21/52/66/20, joint commits 2–8; wedgeSits 61–83).
  No F4 shape.
- **SPOTTER:** panel foodXp['spotter'] total ≥10 AND every panel
  seed contributes >0. r245: 52, 5/5 GO.
- **LADDER (report-only under a SPOTTER GO — pace read):** ≥1
  villager reaches 5 XP on ≥4/5 seeds. r245: 4/5.
- **FASTER-ID:** threshold benefit fires on ≥2/5 seeds. r245: 5/5
  (145 benefit plays in 204 bump calls).
- **END (standing bar, qualifying-only denominator):** every
  broken-live forage run that broke ≥2 days before the run's end,
  bearer is the player, ending status ready on ≥1 dawn after
  breaking, is closed by the wedge within 2 dawns of breaking.
  GO = every QUALIFYING opportunity closed within 2 dawns.
  r245: 12/12 GO.
- **STRANDED (carried watch):** previous-bearer runs in
  strandedLog with 0 work performed. Social sits printed against
  DISTINCT stranded days with the entry count alongside. r245: 0.
- **TRAVEL / THREAD branches (carried watch):** homeward sits on
  a clearable blockage reach home the same dawn; paged (Yara-shape)
  end opportunities close within 2 dawns. r245: TRAVEL 0/0,
  THREAD 4/4 paged (4/13 end sits paged).
- **TRUST GUARD (hard, DROP-ONLY):** trust[vid] must not drop
  across any end press. Any drop = defect finding. r245: 0 drops.
- **JAM (report-only):** jam-days = dawns with a promised run
  while a broken-live run was live. r245: 0.
- **VILLAGE:** alive at d40 on ≥3/5 panel seeds. r245: 5/5.
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel
  seed, read in full (meaning, coherence, consequence — not
  counts). The r241 dry beat ("The moment passes without landing.
  Not yet.") is watched: a further serving is recorded for the
  conversation build arm.
- **WATER INSTRUMENT (report-only):** broken-live water runs seen
  across the panel.
- **ROSTER-RECONCILIATION WATCH:** 0 unaccounted on all panel
  seeds, departures logged and matched by id, the how named per
  departure. r245: 0 unaccounted.
- **CODEX (report-only):** plants per seed. r245: 138.
- **SCHOLAR-DEATH STANDING METRIC:** see leg question §5.
- **COUNTER (REVISED, carried):** defect finding = a COUNTER
  LEARNED label containing `", "` (comma class only). Report the
  comma count, the em-dash count (§16 watch), and the total lines
  per seed. r245: 110 lines, 0 comma, 0 em-dash.
- **REACT (WATCH, last run):** per leg question §13 — max
  consecutive `dlg:react` picks per sitting; run ≥3 listed as a
  REACT-WATCH candidate, adjudicated against the transcript in the
  run note (finding only if the dead-react pool cycles verbatim
  with no landed beat between). Retire for this leg if the panel
  max stays 1.
- **BOWCRAFT (REVISED WATCH):** per leg question §3 — bow items
  in the end-census equipped lists per seed; panel total vs r245
  corpus (7 bows) and r244 corpus. Telemetry /bow/i scan kept as a
  secondary line.
- **WARN-HEED (NEW BAR):** per leg question §7 — GO = every
  engaged warn_you sitting names a danger. An engaged sitting
  with no warning delivered is a defect finding (the r150 shape).
- **DRY2 (NEW WATCH):** per leg question §9 — dry-line count,
  expect 0.
- **SETTLED-FAVOR (NEW WATCH):** per leg question §8 — named vs
  bare counts.
- **SELFWIT (NEW WATCH):** per leg question §11 — victim in own
  witness list is a defect finding; no ambush death is
  report-only.

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp`; village knowledge is measured by
codexPlantsEnd + per-villager spotter XP. Report party launches
and wave-4 kills per seed, standing totals at end per seed, and
the scholar's last-dawn location for every scholar death. A full
telemetry type-count map is recorded at end (read-only) so a
launch/kill signal can be named if telemetry records it.

## Seeds, policy, horizon
Pilot: **101961**. Panel: **101961–101965**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217/r221/r225/r230/
r231/r232/r233/r240/r241/r242/r243/r244/r245 driver shape — no
withDelegate/HUNTSTAFF flags). Death-aware tail +10d. Driver clone
is verbatim r245 except run number / seed band / output names /
header comment + the instrument-only revisions (§§3, 4, 7, 8, 9,
11: warnLog wrap, settledFavorLines + dryLines extracts,
witnesses passthrough, loopDay + dayDesync). The analyzer is the
r245 analyzer verbatim except run number / file names / the Q1 +
Q1b + Q1c + Q3 + Q5 comparison lines (now vs r245) + the E1-case
split + the BOWCRAFT gear-count watch + the WARN-HEED / DRY2 /
SETTLED-FAVOR / SELFWIT / day-desync watch lines. Proof tests
re-run in this worktree to confirm the mechanisms still hold on
the new base: r240 walkHome 27/27, r231 settled-help 19/19, r230
stage0-help 13/13, r225 stage0-cant 18/18, r214 mood-goodbye
10/10, r139 spotter 35/35, r221 want-raise 7/7, r137 clearhome
37/37, r146 want-bridge, r243 link-accept 61/61, r148
link-accept rotation 3/3, r147 maps-pools, r244 counter-label
19/19, r246 react wind-down 10/10, r254 mourning witness 4
cases. New proof test only if a defect is found.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 101961–101965 is FRESH.** Full-scope search performed
  2026-11-20 ~22:45Z before this prereg: filesystem grep over
  `evidence/` `--include="*prereg.md"` for `10196[1-5]`: zero
  hits. Evidence filenames for `10196[1-5]`: zero hits.
  `git log --oneline --grep=10196`: zero hits. Filesystem grep
  over `evidence/` `--include="*.md"` for `10196`: zero hits.
  Filesystem grep over the goal hidden_files tree for
  `10196[1-5]`: four hits — ALL digit substrings inside
  floating-point values in old October JSON corpora, NOT seed-band
  namings: `...431.71008651019656...` in
  `hidden_files/evidence/2026-10-25/journey-crisis-r55-seed101.json`
  and `...4.75101965146459...` in
  `hidden_files/armc-b-partial-20261029T0454Z/evidence/2026-10-19/
  perseed-spikechar-b/sweep-leadfeast.json` (the other two listed
  files carry the same float-noise shape). A filesystem grep over
  repo `evidence/` `--include="*.json"` for `10196` found three
  October files (`journey-deepening-r8-71001.json`,
  `overdrawfloor-baseline-leadcourt-s44.json`,
  `overdrawfloor-baseline.json`) — the same float-noise shape, no
  `10196[1-5]` context line in any of them. The 10196x range is
  named in no earlier prereg, forbidden list, contaminated list,
  screen, or extension band checked. (Backup candidate
  108101–108105 was verified clean by r245 the same way, same
  scope — held in reserve, not used.)
- Rejected bands (carried from r245): 100901–100903,
  100601–100605, 100701–100705, 6301–6305, 6401–6405, 6501–6505,
  101501–101505 (retired-ambiguous, r241).
- Contaminated bands NOT reused (r245 list carried, plus r245):
  101201–101205, 101301–101305, 101401–101405, 101601–101605
  (r241), 101701–101705 (r242), 101801–101805 (r243),
  101901–101905 (r244), 108001–108005 (r244 re-panel),
  101951–101955 (r245), 1502, 1504, 1603, 1604, 17101–17112,
  1142–1151, 1801–1804, 1901–1916, 2001–2010, 2101–2116,
  2201–2216, 2301–2316, 2401–2416, 100001–100008, 1200–1209,
  2501–2516, 2601–2616, 2701–2705, 2801–2805, 2901–2905,
  3001–3005, 3101–3105, 3201–3205, 5001–5005 (r139), 5101–5105,
  5201–5205, 5301–5305, 5401–5405, 5501–5505 (r210), 5601–5605,
  5701–5705, 5801–5805, 5901–5905, 6001–6005, 6101–6105,
  6201–6205 (r213 rejections), 100501–100505 (r213/r214),
  100801–100805 (r217), 101001–101005 (r221), 101101–101105
  (r225), 102001–102008, 102101, 102201, 102301, 103001, 103101,
  103201, 104001, 104101.

## Instrument proof (before the panel)
- Analyzer fork proven on the r245 corpus BEFORE the panel
  (r245 JSONs + convo txts in the goal hidden_files evidence dir
  for 2026-11-20, copied to
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/r246-analyzer-proof/`,
  renamed to r246 names; logs `r245-baseline.log` +
  `r246-fork.log` in the same dir — NOT /tmp, which a sibling
  cleanup wipes): the re-run r245 baseline reproduces the
  committed r245 analyzer log exactly (diff clean modulo
  per-seed lines), and the r246 fork reproduces every old-bar
  number exactly — Q1 4/70 (5.7%), stage-0-surfaced 2/4, LOST 2;
  Q1b 70/322 (21.7%); SPOTTER 52, 5/5; LADDER 4/5; FASTER-ID 5/5
  (145/204); END 12/12; VILLAGE 5/5; Q2 0/10 CUT; Q3 distinct 2;
  scholar deaths 4; STRANDED 0. The fork changes no scorer logic
  for the old bars.
- NEW lines on the old corpus (expected, not a fork break):
  E1-case split (r245's 3 E1s re-classify E1-case 2 — Victoria +
  Heinrich, both LOST — and E1-plain 1 — Katarina, who surfaced
  with dlg:help pressed YES) + BOWCRAFT gear-count lines (r245
  corpus: crude_bow ×3, bow ×3, crossbow ×1 = 7 — the r245 run note
  undercounted bow ×2; the fork is the correction) + WARN-HEED watch
  lines (r245 corpus has no warnLog — the line reports the
  instrument as absent on all 5 seeds and the 15 engaged sittings
  as unobservable, not findings) + DRY2 / SETTLED-FAVOR / SELFWIT
  watch lines (same absence handling: 0s on the old corpus are
  instrument-absence, not measurements) + day-desync line (r245
  corpus: net drift 0 on 4/5 seeds, −1 on 101955 — and the fork
  CORRECTS the r245 note's reading: 51 repeat/skip pairs across
  the panel, systematic clock jitter netting to zero, not a
  one-seed quirk).
- The pilot seed exercises the instruments directly: standing
  totals present at end, `scholarDawns` recorded per dawn,
  teleTypeCounts present, mootLines + caseLog present in the JSON.
  (Scholar-location-at-death fires only on a scholar death; if
  the pilot has none, the instrument is proven structurally by
  the per-dawn records, and the death-reading is exercised by any
  panel seed with a scholar death.) The warnLog instrument is
  proven structurally by the wrap (a warn_you sitting on the pilot
  exercises it; if the pilot has none, any panel seed with one
  does).

## Canon
docs/CANON.md read at run start. docs/CONVERSATIONS.md is the Q1/Q2
area (energy budget + natural ending signal; "Tell me more." depth;
no-repeat ledger; recap reframes are grammar, not content).
KNOWLEDGE.md laws binding the spotter question: "Human skills ≠
alien abilities" (spotter is earthly knowledge — practice earns it,
never a System slot); "identification happens BACK AT CAMP". **No
canon doc covers the favorless-ask mechanism, want-raise rates, or
seed selection rules** — said here instead of inventing canon.
ENCOUNTER-GEAR RULE (Steve 2026-11-13): the journey driver plays
the live village state (real gear/progression, competent policy),
not a staged solo-scholar fixture — same as r137–r245; proof tests
stage for the mechanism only, not a combat fixture.

## Context arriving mid-run (not this run's scope)
Standing design questions unchanged: gating recalibration proposal,
answercourt cost, richer layered medicine design (holder-less
levers, build-medicduty-h), wave-4 kill A/B + companion-guard A/B
(sim lane), family 7 UNMEASURED. **Landing r145 F1/F2 are NOT this
run's scope** (door-skip lives in the competent policy, not the
game — this run only measures its panel effect). This run does NOT
take any of those builds. The panel's wound-fever/healer numbers
are reported as context only. **Q1c precedence and the Q5
unmet-exile policy are design questions for the conversation build
arm** — this run measures them, documents them, and proposes
nothing to land unilaterally. The r240 walkHome axis-step
oscillation residual stays with the build arm (watch item). The
r242 F1 want-raise floor finding stays with the build arm (this
run reports the spread; the finding is not re-fired). The F2
scholar-death finding (home-tile succession exposure) stays with
the goals arm as a named open item — the haven-edge shape graduates
to a goals-arm question if it recurs this panel (see leg question
§5). The Q1 E1 residual (2 LOST pre-fix r244, 0 re-panel, 2 LOST
r245 — all E1-case) stays with the conversation build arm. The
senseexped launch silence (5 panels) stays with the sim lane.

## Pilot gate
Pilot seed runs first on the final driver; completes without crash
AND (≥1 people-check sitting is held OR game over before the check
with the skip note written — r240 metric-review revision) AND its
transcript is written AND the spotter instruments fire (≥1
bumpPlantFamiliarity wrap record AND ≥1 villager forage resolution
observed) AND the sittingCloses record is present in the JSON
(beatsAfterLastThem counted) AND wedgeSits carry pick wantIds on
VERBAL sits (nonverbal sits carry wantId null by design — the
nonverbal marker is the `nv:*` picks, NOT openThread — r242
metric-review revision) AND ≥1 wedge social sit carries the Q1
trace fields (fromSeed / seedFavorId / need / ledgerFavor recorded
at sit start) AND the rosterDepartures instrument is present in
the JSON (array, possibly empty) AND the r240 instruments are
present (standingEnd non-null, scholarDawns recorded per dawn,
teleTypeCounts present) AND the Q5 instruments are present
(mootLines array + caseLog array in the JSON) AND the Q5 exileLines
regex extension is present in the driver source (grep for "pull
weight") AND the r246 instruments are present in the JSON
(warnLog array, settledFavorLines array, dryLines array,
dayDesync object, loopDay on daily + scholarDawns entries). If the
pilot forces a driver or fix change, the panel restarts on fresh
seeds and the pilot seed is NOT scored — EXCEPT that a driver change
after the pilot on a FRESH band voids the band only if the change
is game behavior (instrument-only changes keep the band, recorded
in the run note); any src/js change forces a fresh-band restart.

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221/r225/r230/r231/r232/r233/r240/r241/r242/r243/r244/r245
did NOT roll forward. This run's panel is the r245 driver regime
on a fresh band — guardrails should stay quiet; any LOUD line is
adjudicated as band noise vs real bug BEFORE rolling the baseline
forward. Metrics: guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths (r135's set). The r245
checker hit the known schema mismatch (the driver never emits
`guardrails.*` fields, so the checker reads missing paths as 0) —
expected again, not a finding. NOTE: this run changes src/js only
if Q1/Q2/Q5 or the END BAR warrant a fix; a guardrail move on a
no-src-change run cannot be caused by this run's code — any LOUD
line gets adjudicated as band noise vs a pre-existing drift, and
the baseline is NOT rolled on a mismatch.
