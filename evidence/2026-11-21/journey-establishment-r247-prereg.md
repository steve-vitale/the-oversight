# Journey leg ESTABLISHMENT — r247 pre-registration (2026-11-21, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r85/r135/r136/
r137/r138/r139/r210/r213/r214/r217/r221/r225/r230/r231/r232/r233/r240/
r241/r242/r243/r244/r245/r246 precedent). Death-aware: stop after 10 consecutive
all-dead daily checks; never tick a dead village to fill the leg.

## Run
Run id `playtest-20261121T0943Z` (scheduled Sat 2026-11-21 03:45 CST).
Rotation file read **1 (establishment)** — this run plays leg 1, no queue
jump. Run number r247 (r246 is the last establishment run, 2026-11-20
22:32Z). **Base:** local master `2b97163b0` at registration (worktree
fast-forwarded to it; branch tip was the old master tip `06852bcd4`,
a direct ancestor — 16 commits landed between r246's base and this
run's, see Base delta). Heartbeat loop running (9-min cadence,
detached setsid loop, PID 115539). Pre-flight: main tree CLEAN, disk 47%.
**Write flap:** a new window hit at registration — the first
`worktree-register.sh` failed after a full 106k-file checkout with
`fatal: Could not reset index file to revision 'HEAD'`; two more
attempts failed instantly on `could not write to
'.git/worktrees/journey-establishment/locked': Operation not permitted`.
A traced attempt proved the flap switching ON mid-checkout (~9 min in,
first refused write on `evidence/2026-11-04/perseed-exphurt-24-a/
exphurt-24-a-competent-s99956.json`, then all 80,926 further writes
EPERM; trace log `/tmp/strace-wt3.log`). Per the local_write_flap_response
skill: no forced writes. Workaround (documented, repeatable): register
with `--no-checkout`, then a cone sparse checkout of every top-level
dir EXCEPT `evidence/` (94,203 files — the checkout that kept dying),
12,516 files in ~49s with a clean status; registry entry added manually
in the register script's exact shape + atomic write; heartbeat
immediately; branch fast-forwarded to master in the worktree. The
worktree therefore has NO `evidence/` dir — panel JSONs go to the goal
hidden_files evidence dir (as always; the driver writes there, not
into the repo), and the prereg/run note are written into
`evidence/2026-11-21/` in the worktree for commit (sparse-add that
dir at closeout before safe-commit). **Rotation handling at closeout:**
read the rotation file then; if it reads `1`, write `1→2` with read-back.

## Base delta vs r246's panel base `1581a7887` (src/js)
`git diff --stat 1581a7887..2b97163b0 -- src/js/` — 9 files, +933/−19.
Unlike r246's conversation-only delta, this one carries REAL game
changes on this leg's systems — this run is the first live-panel read
of each:
- `win-plan.js` +337 (reseed, `ef2cf64c2`) +116/−29 (reseedbeat,
  `9145db1ef`, finding #2632) — **WIN-PLAN LIVE + expanded**: villagers
  pursue a winning gameplan (gear → party → hunt → standing → table);
  expired-plan re-seed + the launch beat ("is hunting X now — the
  fire found a new trail", spoken at the launch, never at commit);
  death cleanup (winPlan dies with the villager, `5f583a056`);
  vetreengage trio lever env-gated OFF by default (`46426eb2e`).
  The SENSEEXPED launch watch (silent six panels) becomes the WINPLAN
  launch watch this run.
- `game.js` +301 — win-plan wiring + vetreengage + wildavoid + lendfix
  substrate (see below).
- `fieldFights.js` +11 — **DOWNTWICE fix** (`f11b30882`, finding #2634
  GO): a downed ally is never re-targeted, 'goes down' fires once.
  Affects the fights this leg plays (2–7 combat starts/seed on r246).
- `game.js` (wildavoid, `5402d4cc3`, finding #2506) — **WILDAVOID**:
  outmatched-avoid on the wild routers. Could move wild scholar
  deaths — adjudicate base-effect vs band noise on the F2 watch.
- `bond-initiation.js` +65 — scale r248 raise-opener variety by
  lore-how ([needs-eyes]): the conversation/bond surface.
- `contests.js` +53 — lendfix rebuild of GUNRATE + CELLGATE + LEND,
  env-gated OFF by default, + the dead-borrower gun return fix
  (finding #2629).
- `convo-dialogue.js` +25, `conversation.js` +4/−1 — succession r262
  (M12 escalator cap fix, staged witness sitting, M4 strip).
- `villager-brain.js` +6/+12 — reseedbeat + reseed hooks.
- `build.js` +2 — version stamp only.
- REVERTED, net 0 from those families: SHAPE2 (+138/−138),
  M2STEP2 (+19/−19), LEADSIDE (contests +9/−9), DEPMAT/ROLL35/AMMO
  substrate (+96/−96, twice), holdersupply BIGBUNDLE. None of those
  levers is live in this base.
- Everything else in range: evidence/scripts-only landings (deepening
  r246, scale r247/r248, crisis r257/r261, succession r262,
  winnability rounds, lever arms). **The settled-ledger favorless-ask
  mechanism, the sitting-close machinery, and the freeloader pipeline
  are untouched** except through the conversation changes above
  (watched, §§7–11). Q1/Q1b/Q2/Q5 bars carry verbatim from the r246
  prereg except the pre-registered revisions below.

## Leg question (r246's named next steps, first)

**Q1 FAMILY RE-READ — the favorless-ask mechanism on a fresh band
+ the r246 metric-review revisions (E1 majority rule, SPOTTER
cumulative second number, REACT retirement, silent-arrival watch)
+ the first live-panel read of the win-plan system + the F2
scholar-death watch, sixth panel + the wave-4 / standing watch.**
1. **Q1 TENTH FRESH-BAND RE-READ.** r231 13/82 (15.9%) → r232
   2/77 (2.6%) → r233 1/53 (1.9%) → r240 1/70 (1.4%) → r241 1/55
   (1.8%, class C 1/1, never surfaced) → r242 2/70 (2.9%, E1 2/2,
   stage-0-surfaced 2/2, LOST 0) → r243 2/53 (3.8%, E1 2/2,
   stage-0-surfaced 2/2, LOST 0) → r244 3/61 (4.9%, E1 2 + C 1,
   stage-0-surfaced 1/3, LOST 2) pre-fix / 0/60 (LOST 0)
   re-panel → r245 4/70 (5.7%, E1 2 + C 1 + ?, stage-0-surfaced
   2/4, LOST 2 — both E1-case) → r246 3/69 (4.3%, E1 3,
   stage-0-surfaced 0/3, LOST 3 — the worst LOST count yet, none
   surfaced). Same trace + classifier as r232–r246 (read-only probes;
   classes A–E verbatim; widened LOST trigger from r242). Thresholds
   verbatim from the r243 prereg: GO = rate <20% AND zero stage-0
   wants resolved 'deflected' AND every favorless sit classified;
   NO-GO = rate ≥32.8% OR any stage-0 want resolved 'deflected'.
   LOST asks reported separately (each a defect finding, documented
   + proposed, not landed).
2. **E1 SPLIT — MAJORITY RULE (r246 metric review §2).** The
   "any betrayal pick" split mislabels DeShawn (1/12 case picks).
   This run: E1-case = case picks are the MAJORITY of the sitting
   (≥50%); E1-plain otherwise. DeShawn re-classifies E1-plain under
   that rule; August (7/7) and the r245 pair stay E1-case; Lauren
   (0 picks) stays E1-plain. The analyzer prints both counts + the
   case-thread detail lines. The fix proposal (the opener gets one
   turn in a case sitting, or the case thread yields one pick to a
   u≥3 need) stays with the goals/conversation arm — proposed, not
   landed.
3. **SPOTTER RE-READ + CUMULATIVE SECOND NUMBER (r246 metric review
   §1).** r246: panel foodXp['spotter'] total 33 (bar ≥10 ✓) but
   seeds with >0 = **4/5** — seed 101961 reads **0** (five scholars
   in 42 days; the XP died with Lauren d42; succession transfers no
   foodXp). The binding bar (end-holding) stays the judge; the
   NO-GO stands. This run reports a SECOND number alongside it:
   cumulative village spotter earned = Σ tenure-end XP (the driver's
   spotterTenure snapshots each scholar at succession + at end) +
   end foodXp for persons who never held the role — plus max spotter
   skill reached (bump log). A turnover seed that earned knowledge
   and lost its holder must not read as a no-knowledge seed.
4. **SILENT-ARRIVAL WATCH (r246 metric review §11, NEW).** r246:
   Lena Ruiz and Nathan Lee joined 101961 in the final three days
   with no arrival line in any channel the driver captures (no
   telemetry key, no convo-dump mention, no dawn SAY). This run:
   the driver dates every join (rosterArrivals daily diff, the
   mirror of the r231 departure diff) and scans dayLines for
   arrival narration; the analyzer flags end-members never in the
   start roster and judges each narrated-or-silent. A silent join
   is a blank (documented, not landed). The analyzer's roster
   reconcile also now flags end-members never in the start roster
   (it previously only flagged start-members with no death/
   departure record — which is why r246 read UNACCOUNTED=0).
5. **WINPLAN LAUNCH WATCH (first live read; SENSEEXPED renamed).**
   With win-plan live (win-intel + reseed + reseedbeat +
   deathcleanup), does any party-launch signal appear? The driver
   reads the raw `village.winPlanStats` + plan table at end
   (read-only property read — it NEVER calls Game.winPlanStats(),
   whose stateOf() would materialize the store and IGNITE the plan
   system in a village where it sleeps) and scans dayLines for the
   three deterministic beats (launch "new trail", reseed/expiry
   "already put down", expiry "called off"). Any launch is named
   with seed/day/party shape + stage; a launch that kills a wave-4
   beast is a base-effect, not a panel finding alone. Six panels
   silent before this one (r241–r246): a first launch here is the
   finding this leg has been waiting for.
6. **F2 SCHOLAR DEATHS (r242: 6/5, r243: 3/5, r244: 4/5 pre-fix
   + 2/5 re-panel, r245: 4/5, r246: 6/5 — sixth panel).** Same rule:
   ≤2 per 5-seed panel = WATCH (report causes + last-dawn
   locations); ≥3 = investigate. The haven-edge (4,4) last-dawn
   shape GRADUATED on r246 to a goals-arm question (3/6 this panel,
   6 across three panels: should the scholar sleep INSIDE the
   haven?) — this run reports the count + causes and whether
   WILDAVOID (new in this base) moves the wild-death shape;
   adjudicate base-effect vs band noise, propose nothing to land
   unilaterally.
7. **WARN-HEED WATCH (r150 fix, second live panel).** r246: GO —
   8 warn_you sittings, 5 with a warning delivered, 0 engaged
   sittings with no warning delivered. But all 8 sittings were one
   villager (Tom, 101965) — the watch has not yet seen a second
   warn_you voice. Keep it until the panel shows a second voice.
   Same rule: GO = every engaged warn_you sitting names a danger;
   an engaged sitting with no warning delivered is a defect finding.
8. **SETTLED-FAVOR NAMING WATCH (r247 fix, second live panel,
   report-only).** r246: 0/0, no opportunity — the naming got no
   live read. Expect named lines where a short exists, bare only
   where there is no speakable short. A bare line where the favor
   carried a short is a watch item for the scale arm, not a defect
   finding this run.
9. **DRY2 WATCH (r256 fix, second live panel on this leg,
   report-only).** r246: 0 dry lines. Expect 0. Any sighting is
   named with seed/day/vid and read against the transcript.
10. **GOAL-BRIDGE WATCH (r149 fix, second live panel,
    report-only).** Post-hoc grep over the held convo txts: within
    one held convo, does any goal-bridge line repeat (the six-line
    pool)? r246: 0 repeats in any held convo. A repeat within one
    sitting is a watch item for the landing arm.
11. **SELFWIT WATCH (r258 fix, second live panel, report-only).**
    r246: 0 observable — no death on the panel carried a witness
    list (the one ambush death has witnesses null in telemetry).
    The watch is unobservable through telemetry on this leg until
    a death carries a witness list; no ambush death with a list =
    report-only outcome, not a miss.
12. **WAVE-4 / STANDING WATCH.** r242: 3/5 wave 4, standing to
    160. r243: 0/5, standing to 70. r244: 0/5 pre-fix (standing to
    50), 2/5 re-panel (standing 120/100). r245: 3/5 wave 4,
    standing to 135. r246: 1/5 wave 4, standing 95/65/0/130/95 —
    seed 101963 survived to wave 3 with standing **0** despite
    joint forages, bonds, deeds, and a scale event. This run
    reports wave reached + standing per seed; a matched-band A/B
    is still owed before any claim about the wave-4 door. The
    standing-0 shape is a question, not a finding: is standing too
    narrowly sourced, or is the village simply not doing the paying
    deeds?
13. **REACT WATCH — RETIRED for this leg (r246 metric review §3).**
    Second live panel at max 1 on all 5 seeds, 0 sittings ≥3. The
    computation and output lines are removed from the r247 analyzer.
    Kept on scale only (the defect was a scale-leg shape).
14. **MOURNING WITNESS WATCH (r254 variant, third live panel,
    report-only).** Post-hoc grep over the held convo txts: any
    mourning sitting where the speaker witnessed the latest fresh
    dead fall — does the served line name the witnessed dead?
    r246: 1 sitting, generic line, witness status unknown. Same
    handling: a sitting that serves a generic mourning line where
    a witness line was due is a watch item for the succession arm.
15. **F2 ECHO WATCH (carried).** With the r243 echo fix in,
    expect 0 acceptance echoes in the people check; a sighting is
    recorded for the conversation build arm with the transcript.
16. **COUNTER (comma-only, carried).** Defect finding = a COUNTER
    LEARNED label containing `", "` only. Report the comma count,
    the em-dash count (watch), and the total lines per seed.
    r246: 100 lines, 0 comma-clause, 0 em-dash.

## Bars (verbatim from the r246 prereg unless revised below)
- **Q1b WANT-RAISE:** GO = panel raise rate ≥10% AND no seed with
  0 raises. r246: 69/374 (18.4%). Report kinds (forage_help /
  heal_help / sick_help / food_share / water_haul / no-kind).
- **Q2 SITTING CLOSES:** GO = 0 cut sittings (mechanical half:
  engine-ended + 0 beats after last THEM + no closing line; the
  open-question half is a human read). WATCH 1–2 (read in full);
  NO-GO ≥3 or any cut ending on an open question/invitation.
- **Q3 RECAP PARAPHRASE (report-only):** distinct <6 report-only;
  ≥6 a second formulation is owed. Carried canned-line watch
  (pod-dream, recap stitch, slope-reading, walked-in, take-it,
  stew-bowl, pod-dream-open). r246 distinct: 2 of 10 sittings
  (raw 4).
- **Q6 POLICY FORAGING (report-only):** per seed, scholar
  bumpCalls vs wedgeSits vs joint forage_help commits. F4 shape =
  bumpCalls ≤2 AND wedgeSits ≥50. r246 per-seed: bumpCalls
  41/45/24/27/31, joint commits 1–6; wedgeSits 77–82.
  No F4 shape.
- **SPOTTER:** panel foodXp['spotter'] total ≥10 AND every panel
  seed contributes >0. r246: 33, 4/5 — **NO-GO** (101961 reads 0).
  The bar stays the judge; the cumulative second number is
  reported alongside it (see leg question §3).
- **LADDER (report-only under a SPOTTER GO — pace read):** ≥1
  villager reaches 5 XP on ≥4/5 seeds. r246: 3/5 (moot under the
  NO-GO).
- **FASTER-ID:** threshold benefit fires on ≥2/5 seeds. r246: 5/5
  (122 benefit plays in 168 bump calls).
- **END (standing bar, qualifying-only denominator):** every
  broken-live forage run that broke ≥2 days before the run's end,
  bearer is the player, ending status ready on ≥1 dawn after
  breaking, is closed by the wedge within 2 dawns of breaking.
  GO = every QUALIFYING opportunity closed within 2 dawns.
  r246: 3/3 GO.
- **STRANDED (carried watch):** previous-bearer runs in
  strandedLog with 0 work performed. Social sits printed against
  DISTINCT stranded days with the entry count alongside. r246: 0.
- **TRAVEL / THREAD branches (carried watch):** homeward sits on
  a clearable blockage reach home the same dawn; paged (Yara-shape)
  end opportunities close within 2 dawns. r246: TRAVEL 0/0,
  THREAD 1/1 paged (1/3 end sits paged).
- **TRUST GUARD (hard, DROP-ONLY):** trust[vid] must not drop
  across any end press. Any drop = defect finding. r246: 0 drops.
- **JAM (report-only):** jam-days = dawns with a promised run
  while a broken-live run was live. r246: 0.
- **VILLAGE:** alive at d40 on ≥3/5 panel seeds. r246: 5/5.
- **PEOPLE CHECK:** PASS/FAIL on 2 held convos from one panel
  seed, read in full (meaning, coherence, consequence — not
  counts). The r241 dry beat ("The moment passes without landing.
  Not yet.") is watched: a further serving is recorded for the
  conversation build arm.
- **WATER INSTRUMENT (report-only):** broken-live water runs seen
  across the panel.
- **ROSTER-RECONCILIATION WATCH:** 0 unaccounted on all panel
  seeds, departures logged and matched by id, the how named per
  departure — AND end-members never in the start roster flagged
  as arrivals (r247 revision). r246: 0 unaccounted (arrivals
  found only by ID-diff in the run note, not by the instrument).
- **CODEX (report-only):** plants per seed. r246: 128.
- **SCHOLAR-DEATH STANDING METRIC:** see leg question §6.
- **COUNTER (REVISED, carried):** defect finding = a COUNTER
  LEARNED label containing `", "` (comma class only). Report the
  comma count, the em-dash count (§16 watch), and the total lines
  per seed. r246: 100 lines, 0 comma, 0 em-dash.
- **REACT (RETIRED for this leg):** see leg question §13.
- **BOWCRAFT (REVISED WATCH):** per leg question — bow items
  in the end-census equipped lists per seed; panel total vs r246
  corpus (10 bows: crude_bow ×4, bow ×3, crossbow ×3) and r245
  corpus (7 bows). Telemetry /bow/i scan kept as a secondary line.
- **WARN-HEED (BAR):** per leg question §7 — GO = every engaged
  warn_you sitting names a danger. An engaged sitting with no
  warning delivered is a defect finding (the r150 shape).
- **DRY2 (WATCH):** per leg question §9 — dry-line count,
  expect 0.
- **SETTLED-FAVOR (WATCH):** per leg question §8 — named vs
  bare counts.
- **SELFWIT (WATCH):** per leg question §11 — victim in own
  witness list is a defect finding; no ambush death with a
  witness list is report-only.
- **SILENT-ARRIVAL (NEW WATCH):** per leg question §4 — arrivals
  dated by the roster diff, narrated-or-silent by arrivalLines.
  A silent join is a blank finding (documented, not landed).
- **WINPLAN LAUNCH (NEW WATCH):** per leg question §5 — first
  live read of the win-plan system. partyDepartures > 0 is the
  first launch signal on this leg; launches named with
  seed/day/party shape + stage; launch beats counted.

## Q4 — census (plain words)
Five villages played (pilot + 4-seed panel): who lived, who died,
what they knew, what was missing — in plain words. Census records
per-villager `spotterXp`; village knowledge is measured by
codexPlantsEnd + per-villager spotter XP + the cumulative spotter
second number. Report party launches and wave-4 kills per seed,
standing totals at end per seed, and the scholar's last-dawn location
for every scholar death. A full telemetry type-count map is recorded
at end (read-only) so a launch/kill signal can be named if telemetry
records it.

## Seeds, policy, horizon
Pilot: **101966**. Panel: **101966–101970**, 42d horizon. Policy:
competent (r85/r136/r137/r138/r139/r210/r213/r217/r221/r225/r230/
r231/r232/r233/r240/r241/r242/r243/r244/r245/r246 driver shape — no
withDelegate/HUNTSTAFF flags). Death-aware tail +10d. Driver clone
is verbatim r246 except run number / seed band / output names /
header comment + the instrument-only revisions (§§2, 3, 4, 5:
rosterArrivals + arrivalLines, spotterTenure + spotterXpOf,
winPlanEnd raw-state snapshot + winplanLines). The analyzer is the
r247 analyzer verbatim except run number / file names / the Q1 +
Q1b + Q1c + Q3 + Q5 comparison lines (now vs r246) + the E1
majority split + the SPOTTER cumulative second number + the
SILENT-ARRIVAL / WINPLAN watch lines + REACT removed. Proof tests
re-run in this worktree to confirm the mechanisms still hold on
the new base: r240 walkHome 27/27, r231 settled-help 19/19, r230
stage0-help 13/13, r225 stage0-cant 18/18, r214 mood-goodbye
10/10, r139 spotter 35/35, r221 want-raise 7/7, r137 clearhome
37/37, r146 want-bridge, r243 link-accept 61/61, r148
link-accept rotation 3/3, r147 maps-pools, r244 counter-label
19/19, r254 mourning witness 4 cases. New proof test only if a
defect is found.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Band 101966–101970 is FRESH.** Full-scope search performed
  2026-11-21 ~10:30Z before this prereg: filesystem grep over
  `evidence/` `--include="*prereg.md"` for `10196[6-9]` / `101970`:
  zero hits. Evidence filenames for `10196[6-9]` / `101970`: zero
  hits. `git log --oneline --grep=10196`: zero hits. Filesystem
  grep over repo `evidence/` `--include="*.md"` for `10196[6-9]` /
  `101970`: zero hits. Filesystem grep over the goal hidden_files
  tree `--include="*.md"` for the same patterns: zero hits. The
  full-tree JSON grep over the goal hidden_files tree found EIGHT
  files — ALL value/float collisions, NOT seed-band namings:
  `hidden_files/evidence/2026-10-17/panel-grieftrib-compare.json`
  (float substring), `hidden_files/evidence/2026-11-17/
  journey-crisis-r238-delayed-seed14515.json` (`"kcal":101966` — a
  kcal VALUE in a seed-14515 file), `hidden_files/
  sim-plentydepri-confirm-b/panel-before/cases/fb65d34d....json`
  (`5619.410196603883` — float substring), `hidden_files/
  map-panel-before16/cases/70ce35cb....json` and `hidden_files/
  map-panel-after16/cases/0d4a4daa....json`
  (`1019697.2638483128` — a kcal float), `hidden_files/
  armc-b-partial-20261029T0454Z/evidence/2026-10-15/
  perseed-bearercombat/leadfeast-s33-full.json` and `.../
  perseed-holdloss2/leadfeast-s33-full.json` (seed-33 files, float
  noise), `hidden_files/armc-b-partial-20261029T0454Z/evidence/
  2026-10-17/panel-grieftrib-compare.json` (same float noise as
  the first). The 10196x range is named in no earlier prereg,
  forbidden list, contaminated list, screen, or extension band
  checked. (Backup candidate 108101–108105 was verified clean by
  r245 the same way — held in reserve, not used.)
- Rejected bands (carried from r246): 100901–100903,
  100601–100605, 100701–100705, 6301–6305, 6401–6405, 6501–6505,
  101501–101505 (retired-ambiguous, r241).
- Contaminated bands NOT reused (r246 list carried, plus r246):
  101201–101205, 101301–101305, 101401–101405, 101601–101605
  (r241), 101701–101705 (r242), 101801–101805 (r243),
  101901–101905 (r244), 108001–108005 (r244 re-panel),
  101951–101955 (r245), 101961–101965 (r246), 1502, 1504, 1603,
  1604, 17101–17112, 1142–1151, 1801–1804, 1901–1916, 2001–2010,
  2101–2116, 2201–2216, 2301–2316, 2401–2416, 100001–100008,
  1200–1209, 2501–2516, 2601–2616, 2701–2705, 2801–2805,
  2901–2905, 3001–3005, 3101–3105, 3201–3205, 5001–5005 (r139),
  5101–5105, 5201–5205, 5301–5305, 5401–5405, 5501–5505 (r210),
  5601–5605, 5701–5705, 5801–5805, 5901–5905, 6001–6005,
  6101–6105, 6201–6205 (r213 rejections), 100501–100505
  (r213/r214), 100801–100805 (r217), 101001–101005 (r221),
  101101–101105 (r225), 102001–102008, 102101, 102201, 102301,
  103001, 103101, 103201, 104001, 104101.

## Instrument proof (before the panel)
- Analyzer fork proven on the r246 corpus BEFORE the panel
  (r246 JSONs + convo txts in the goal hidden_files evidence dir
  for 2026-11-20, copied to
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/r247-analyzer-proof/`,
  renamed to r247 names; logs `r246-baseline.log` +
  `r247-fork.log` in the same dir — NOT /tmp, which a sibling
  cleanup wipes): the re-run r246 baseline reproduces the
  committed r246 analyzer log exactly (diff clean modulo
  per-seed lines), and the r247 fork reproduces every old-bar
  number exactly — Q1 3/69 (4.3%), stage-0-surfaced 0/3, LOST 3;
  Q1b 69/374 (18.4%); SPOTTER 33, 4/5; LADDER 3/5; FASTER-ID 5/5
  (122/168); END 3/3; VILLAGE 5/5; Q2 0/10 CUT; Q3 distinct 2;
  scholar deaths 6; STRANDED 0. The fork changes no scorer logic
  for the old bars.
- NEW lines on the old corpus (expected, not a fork break):
  E1 majority split (r246's 3 E1s re-classify E1-case 1 — August,
  7/7 case picks — and E1-plain 2 — Lauren, 0 picks, and DeShawn,
  1/12; the r246 run note's E1-case 2 / E1-plain 1 was the any-pick
  rule) + SPOTTER cumulative lines (ABSENT on the old corpus —
  spotterTenure is an r247 instrument; the line reports the
  instrument as absent, not a measurement) + ARRIVAL lines (the
  r246 pair IS flagged by the census diff — Lena Ruiz + Nathan Lee
  — with day UNKNOWN, rosterArrivals ABSENT on the old corpus) +
  WINPLAN lines (ABSENT on the old corpus — winPlanEnd is an r247
  instrument) + REACT lines GONE (retired).
- The pilot seed exercises the instruments directly: standing
  totals present at end, `scholarDawns` recorded per dawn,
  teleTypeCounts present, mootLines + caseLog present in the JSON.
  (Scholar-location-at-death fires only on a scholar death; if
  the pilot has none, the instrument is proven structurally by
  the per-dawn records, and the death-reading is exercised by any
  panel seed with a scholar death.) The warnLog instrument is
  proven structurally by the wrap (a warn_you sitting on the pilot
  exercises it; if the pilot has none, any panel seed with one
  does.) The r247 instruments are proven structurally the same
  way: rosterArrivals + spotterTenure + winPlanEnd + arrivalLines
  + winplanLines present in the pilot JSON (arrays possibly empty,
  winPlanEnd an object or null).

## Canon
docs/CANON.md read at run start. docs/CONVERSATIONS.md is the Q1/Q2
area (energy budget + natural ending signal; "Tell me more." depth;
no-repeat ledger; recap reframes are grammar, not content).
KNOWLEDGE.md laws binding the spotter question: "Human skills ≠
alien abilities" (spotter is earthly knowledge — practice earns it,
never a System slot); "identification happens BACK AT CAMP". **No
canon doc covers the favorless-ask mechanism, want-raise rates, or
seed selection rules** — said here instead of inventing canon.
Win-plan canon: the system is governed by its own ontology header
(src/js/win-plan.js rules block — plans start from lived or heard
knowledge only, never a roster scan; stages gear → party → hunt →
standing → table). ENCOUNTER-GEAR RULE (Steve 2026-11-13): the
journey driver plays the live village state (real gear/progression,
competent policy), not a staged solo-scholar fixture — same as
r137–r246; proof tests stage for the mechanism only, not a combat
fixture.

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
the goals arm as a named open item — the haven-edge shape graduated
to a goals-arm question on r246. The Q1 E1 residual (3 LOST r246,
worst yet, none surfaced) stays with the conversation build arm.
The senseexped launch silence (6 panels) is re-read as the WINPLAN
launch watch this run — the system it was waiting for is now live.

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
dayDesync object, loopDay on daily + scholarDawns entries) AND
the r247 instruments are present in the JSON (rosterArrivals array,
spotterTenure array, arrivalLines array, winplanLines array,
winPlanEnd object-or-null). If the pilot forces a driver or fix
change, the panel restarts on fresh seeds and the pilot seed is NOT
scored — EXCEPT that a driver change after the pilot on a FRESH band
voids the band only if the change is game behavior (instrument-only
changes keep the band, recorded in the run note); any src/js change
forces a fresh-band restart.

## Telemetry
Live baseline is the r132 BEFORE panel; r133–r139/r210/r213/r214/
r217/r221/r225/r230/r231/r232/r233/r240/r241/r242/r243/r244/r245/r246
did NOT roll forward. This run's panel is the r246 driver regime
on a fresh band — guardrails should stay quiet; any LOUD line is
adjudicated as band noise vs real bug BEFORE rolling the baseline
forward. Metrics: guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths (r135's set). The r246
checker hit the known schema mismatch (the driver never emits
`guardrails.*` fields, so the checker reads missing paths as 0) —
expected again, not a finding. NOTE: this run changes src/js only
if Q1/Q2/Q5 or the END BAR warrant a fix; a guardrail move on a
no-src-change run cannot be caused by this run's code — any LOUD
line gets adjudicated as band noise vs a pre-existing drift, and
the baseline is NOT rolled on a mismatch.
