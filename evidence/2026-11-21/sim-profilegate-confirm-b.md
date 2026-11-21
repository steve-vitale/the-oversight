# sim-profilegate-confirm-b — 16-seed confirm of the landed PROFILEGATE4 lever — NO-GO (instrument)

**Arm:** sim-profilegate-confirm-b (confirm of the landed PROFILEGATE4 lever) ·
**Loop B run:** fleshout-loop-b-20261121T1530Z · **Axis:** winnability chain
**Verdict: NO-GO under the frozen rules — B5 fails on D3 alone, and the D3
flag is proven a false positive (see §9). B1 + B2 + B3 all pass; B4
(tracked) improves sharply. This is an instrument verdict, not a lever
verdict: the lever passes every frozen bar that measures the game, and
fails only a drift check whose bound the corpus proves wrong. No default
flip. The follow-up is a one-line re-freeze + a D3 re-run on these same
corpora (no new sims).**
**Type:** LEVER CONFIRM, no src/ change. The lever is already on master
(commit `84e57fcc3`, [needs-eyes]).
**Branch:** `sim-profilegate-confirm-b` · **Worktree:**
`~/workspace/worktrees/sim-profilegate-confirm-b`
**Base:** master `df4867134` (full
`df4867134afaf556232c4a7c377a4595b644a55c`; branch base; the coordinator
rebases at landing).
**Policy:** competent verbatim, sha256 `1884c8852d38` (12-char prefix).
**Band:** seeds 106751–106766 (16 seeds, FRESH — verified unused before
freezing) · **Horizon:** 150d death-aware.
**Prereg:** `evidence/2026-11-21/sim-profilegate-confirm-b-prereg.md`
(frozen before any judged sim; GO bars B1–B5 frozen there; one dated
CORRECTION before any judged leg — fixture seed 106757 → 106764, see
§9 — and nothing amended after).

## 1. The lever — exact sites (already landed; no src/ change in this arm)

Companion eligibility is gated in exactly TWO places, the `findCompanion`
twins:

1. `src/js/villager-brain.js` `findCompanion` — the DAWN BID gate.
2. `src/js/win-plan.js` `findCompanion` — the LEGACY depart gate.

The change in each twin, and nowhere else: the profile check
`if (prof !== 'wanderer' && prof !== 'explorer') continue;` is skipped
when `PROFILEGATE4=1` AND the holder's own plan has `needWave >= 4`.
No plan, or a wave-3 plan, keeps the old gate. Every other check is
unchanged: alive, away flag, trust ≥ 15, at Haven, engaged,
non-expedition. **This arm made NO src/ change** — the proof test
asserts the src/ diff vs the frozen base is EMPTY (verified: 0 files)
and asserts the lever's presence by content reads (scoped gate line,
env gate, scope helper, parent flag not reused, depart bypass landed,
`winPlanSecondCompanion` still profile-open, seeding gate and
`expeditionCand` NOT widened, PINQUAD blocks untouched — all green).

## 2. Frozen bars — results

| Bar | Frozen threshold | Measured | Result |
| --- | --- | --- | --- |
| B1 pool fills (wave-4+ dawns only) | ON empty share ≤ 0.47 AND mean eligible/dawn ≥ 1.5 | empty 5/105 = **0.0476**, mean eligible **2.99** | **PASS** |
| B2 launches rise | launched instances ON ≥ 5 AND ON > OFF | ON **14**, OFF **8** | **PASS** |
| B3 scalemetric cost (parent's bar, identical) | starvation ON ≤ OFF + 2; arm-only ON ≤ OFF + 2; median survival ON ≥ 0.8 × OFF median | starvation **11 vs 10** (bar 12); arm-only **3 vs 2** (bar 4); median **151 vs 150.5d** (bar 120.4) | **PASS** (with margin — unlike the pilot's exact-at-bar pass; see §9) |
| B4 damage wall | TRACKED only | pooled share **0.1198** over 7 meetings (launchfunnel 0.085; pilot ON 0.0336; this band's OFF 0.0488) | TRACKED |
| B5 instrument valid | proof green; D1 + D2 green; D2 full-band 0 divergences; D3 CLEAN; panel built; anchors `df4867134afa`; 16/16/16/16, 0 errors, classified ≥ 0.9, unknown 0 | proof **72/72**; D2 on **0**, D2 off **0**; drift **15/16 CLEAN + 1 DRIFT (106751)**; panel built (§8); anchors all match; 16/16/16/16, 0 errors, classified **1.0**, unknown **0** | **FAIL — D3 only** (see §9: the 106751 flag is proven a false positive, but the frozen D3 definition fails it, so B5 fails as frozen) |

**Verdict is GO iff B1+B2+B3+B5 pass. B5 does not pass as frozen, so the
verdict is NO-GO.** B4 is reported either way.

## 3. Before / after (identical seeds 106751–106766, full substrate both legs)

Substrate on ALL legs: `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1` (ALLYSLOT3 inert on this base —
no reader in `src/`; carried for parity). Legs differ ONLY by
`PROFILEGATE4` (off: unset; on: `1`; rec/rec0: recorder OFF).

### 3.1 The pool (B1) — the gate opens on the bigger band too

| Population | Dawns | Empty | Empty share | Mean eligible |
| --- | --- | --- | --- | --- |
| OFF, needWave≥4 | 146 | 109 | 0.7466 | 0.336 |
| **ON, needWave≥4** | **105** | **5** | **0.0476** | **2.99** |
| OFF, all dawns | 317 | 234 | 0.7382 | 0.36 |
| ON, all dawns | 328 | 176 | 0.5366 | 1.128 |

The OFF leg on this fresh band reproduces the pilot's OFF picture
(0.9315 empty on the pilot band; 0.7466 here — the gate still binds
hardest where the scoped lever acts). ON, the gate-open rows are 105/105
on wave-4+ dawns and the picked companions are foragers (67), homebodies
(24) and wanderers (9) — the pool is no longer ranger-only.
`agree` 100/100 on wave-4+ rows (replica matches the real pick every
time; 0 `agree: false` rows). The ON leg scores fewer wave-4+ dawns
(105 vs 146) because trajectories diverge once parties actually launch
— launches change who holds plans and who is at Haven (the prereg
anticipated this). The homebody share is priced, not hidden: 24 of 100
wave-4+ picks are homebodies, and a homebody cannot launch (range-0).
Seed calls W4: 159 ON vs 106 OFF — launched parties meet more monsters,
which seeds more wave-4 plans, which opens more instances (35 vs 20).

### 3.2 The funnel — launches nearly double; the depart block grows

| Bucket | OFF (20 instances) | ON (35 instances) |
| --- | --- | --- |
| launched-killed | 0 | 1 |
| launched-fought-no-kill | 5 | 4 |
| launched-no-meeting | 3 | 9 |
| **launched total** | **8** | **14** |
| target-killed | 1 | 0 |
| selected-blocked | 3 | 14 |
| bid-not-selected | 0 | 1 |
| plan-churned-before-dawn | 4 | 5 |
| candidate-not-bid | 4 | 1 |
| unknown | 0 | 0 |

OFF's binding stage was split between `candidate-not-bid` (4) and
`plan-churned` (4). ON's binding stage is `selected-blocked` (14/35):
the pool fills, a bid is made, and the launch then fails at the depart
step — the same leak the pilot found (8/21), now larger on the bigger
band because more bids are made. Wave-4+ launch events: ON 116 vs OFF
59 — nearly double. The lever did its job and the next constraint is
still getting the party out of the door, not finding a companion.

### 3.3 Damage (B4, tracked) — parties now hurt wave-4 monsters

Pooled share **0.1198** (595 dealt / 4,967 derived max HP over 7
meetings; 5 derived from fight logs, 2 from the hp-range midpoint
fallback) vs this band's OFF **0.0488** (9 meetings), the pilot ON
**0.0336**, and launchfunnel's 0.085. Per-meeting ON:

| Day | Fighter | Monster | Dealt / max HP | Share | Via |
| --- | --- | --- | --- | --- | --- |
| 64 | liam_davis | eater | 174 / 664 | 0.262 | log |
| 68 | liam_davis | eater | 42 / 639 | 0.0657 | log |
| 74 | luis_fernandez | influencer | 0 / 950 | 0 | range-mid |
| 94 | nina_petrova | herald | 77 / 379 | 0.2032 | log |
| 95 | nina_petrova | herald | 10 / 302 | 0.0331 | log |
| 104 | app_mgpspke5167 | herald | 9 / 800 | 0.0113 | range-mid |
| 127 | chloe_dubois | audit | 283 / 1233 | 0.2295 | log |

The day-64 eater fight (26.2%) is a shared pre-divergence meeting — it
appears identically on the OFF leg. The ON-only meetings are the story:
chloe_dubois vs the audit (23.0%) and nina_petrova vs the herald
(20.3%) are launched-party fights the OFF leg never had. One launched
kill on the ON leg (none OFF). The damage wall that bound the pilot band
(0.0336) does NOT bind this band (0.1198) — but the per-meeting spread
(0% ×1, best 26.2%) and the small meeting count (7) say the wall moved,
not vanished: more launches, more damage, still only 1 kill in 14
launches. No further pool widening will move the kill count; that is a
fighting-strength problem, not a companion-supply problem.

### 3.4 The wall (scale numbers, every run)

Analyzer wall (seeds with standing ≥ 200 / scaleRank ≥ national / table /
wins / wave-4 unlock / wave-5 unlock / deaths / starvation):

| | OFF | ON |
| --- | --- | --- |
| standing ≥ 200 | 6/16 | 5/16 |
| national rank | 0/16 | 0/16 |
| table | 0/16 | 0/16 |
| wins | 0/16 | 0/16 |
| wave-4 unlocked | 16/16 | 16/16 |
| wave-5 unlocked | 6/16 | 5/16 |
| total deaths | 1254 | 1293 (+3.1%) |
| starvation deaths | 10 | 11 |
| median survival | 150.5d | 151d |
| villages survived to 150d | 11/16 | 10/16 |

Per-seed (days / end / standing / rank / maxWave / deaths):

| Seed | OFF | ON |
| --- | --- | --- |
| 106751 | 151d survived, 199, regional, w4, 77 | 151d survived, 415, regional, w5, 83 |
| 106752 | 145d village-lost, 450, regional, w5, 72 | 151d survived, 510, regional, w5, 88 |
| 106753 | 149d village-lost, 199, regional, w4, 96 | 76d village-lost, 199, regional, w4, 72 |
| 106754 | 150d survived, 500, regional, w5, 103 | 95d village-lost, 199, regional, w4, 98 |
| 106755 | 151d survived, 435, regional, w5, 67 | 151d survived, 395, regional, w5, 92 |
| 106756 | 151d survived, 199, regional, w4, 87 | identical |
| 106757 | 151d survived, 425, regional, w5, 104 | 105d village-lost, 325, regional, w5, 79 |
| 106758 | 112d village-lost, 199, regional, w4, 97 | identical |
| 106759 | 150d survived, 455, regional, w5, 71 | 150d survived, 199, regional, w4, 100 |
| 106760 | 151d survived, 195, regional, w4, 53 | identical |
| 106761 | 151d survived, 290, regional, w5, 58 | identical |
| 106762 | 151d survived, 199, regional, w4, 61 | identical |
| 106763 | 72d village-lost, 140, regional, w4, 53 | identical |
| 106764 | 150d survived, 199, regional, w4, 105 | 140d village-lost, 199, regional, w4, 124 |
| 106765 | 139d village-lost, 199, regional, w4, 65 | 151d survived, 199, regional, w4, 63 |
| 106766 | 151d survived, 199, regional, w4, 85 | identical |

Seven seeds are byte-identical trajectories off vs on (the drift check
calls them IDENTICAL: 106756, 106758, 106760, 106761, 106762, 106763,
106766) — the lever never acted there. Three seeds improve ON (106751:
standing 199→415 and wave 5 unlocked; 106752: lost→survived, 450→510;
106765: lost→survived). Five worsen (106753: lost 149d→76d; 106754:
survived→lost 95d, 500→199; 106757: survived→lost 105d; 106759:
standing 455→199, deaths 71→100; 106764: survived→lost 140d, deaths
105→124). The standing-199 stall persists: 9 ON villages sit at exactly
199 (8 OFF). No village reached national, the table, or a win on either
leg. Wave 4 unlocks everywhere (16/16 both legs); wave 5 unlocks on 5–6
of 16.

### 3.5 Cost (B3) — passes with margin on 16 seeds; the panel flags the shape the bars miss

The frozen B3 bars pass with real margin this time: starvation 11 vs
bar 12, arm-only 3 vs bar 4, median 151 vs bar 120.4. The pilot's
exact-at-bar fragility did NOT reproduce — the cost is not starvation
and not survival time. But the balanced panel (§8) flags
`regression_signal` on village deaths per 100 days (56.2 → 64.5, paired
delta +8.3, interval +3.0 to +14.4 — the interval excludes zero), and
the cause breakdown prices it: expedition deaths 285 → 349 (+64) while
villager-combat deaths fall 549 → 541 and combat 215 → 202. The extra
deaths are parties walking out and dying on the road — the cost of the
lever doing its job (116 launch events vs 59). The early losses are the
same shape: 106754, 106757, 106764 survive OFF and collapse ON, and
106753 collapses 73 days earlier ON — all with FEWER total deaths ON
than OFF (98 vs 103, 79 vs 104, 124 vs 105 is the exception, 72 vs 96),
i.e. the village stops accumulating deaths because it stops existing.
Median survival is blind to this (151 vs 150.5) because the median is
robust to 3–4 early losses. The frozen B3 bars pass as written; the
panel signal says the NEXT cost bar should price expedition deaths and
early village loss, not just starvation and the median. See §10.

## 4. Reachability verdict

- **Wave-4 hunts:** reachable and launchable — 14 launched instances,
  116 wave-4+ launch events, 7 fought meetings, 1 launched kill. The
  content is no longer decoration; parties walk out, meet the monster,
  and now deal real damage (pooled 11.98%).
- **Wave-5:** unlocks on 5/16 ON villages (6/16 OFF) but no wave-5 kill
  or facing is recorded in this corpus — the door opens, nobody walks
  through it yet.
- **Regional → national → table → win:** not reached on either leg (0/16
  national rank, 0 table, 0 wins). The scale wall stands past regional;
  the 199-standing stall (§3.4) is its visible form here — 9 ON villages
  at exactly 199. This lever does not touch it.
- **Veterans:** wave-4 seed calls 159 ON vs 106 OFF; the readiness bar
  still needs its second living wave-4 veteran, which is a
  kill-conversion problem, not a companion problem now.

## 5. Village assessment (plain words)

Sixteen villages, same starting conditions, two different rules about
who may walk with a hunting party. Under the old rule, a wave-4 hunting
party usually had nobody to take: three mornings in four, the holder
looked for a companion and the pool was empty — not because nobody
trusted the holder (trust runs in the 90s), but because the only people
allowed were rangers and almost nobody is a ranger. Under the new rule,
the mornings fill: foragers stand beside the holder, trust in the 90s,
and parties walk out — twice as often as before, 116 departures against
59.

What the villages look like after: ten of the sixteen ON villages are
still standing at day 150, eleven under the old rule. The ones that are
gone died the usual deaths, plus one new one: parties that walk out and
don't come back. The road takes its price — 64 more expedition deaths
than the old rule, and three villages that survived before collapse
after their parties bleed out. The ones standing are stuck at the same
place the game has been stuck: regional standing, a 199-point wall, no
road to national. The parties that do launch meet wave-4 monsters and
now hurt them — a quarter of the monster's health in the best fight, a
kill at last — but one kill in fourteen launches is still not a hunting
culture. The village can now field a party, and the party can now draw
blood. It cannot yet win a fight with one, reliably, and it pays for
every walk out in bodies on the road. That is the next blank, and it is
not a companion problem anymore.

## 6. Sense-testing (SENSE-TESTING LAW — read transcripts, judge meaning)

Real `vetSays` lines from the ON leg, verbatim:

- Seed 106752, day 1: *"A man, maybe 60s, with a scarred cheek heads
  out for water. \"Fetching water. Somebody has to.\" The pantry won't
  fill itself."*
- Seed 106752, day 2: *"A man, maybe 60s, with a scarred cheek looks at
  you flatly. \"Why should I listen to you?\" (Trust too low.)"*
- Seed 106752, day 2: *"You catch fragments by the fire — A man, maybe
  60s, with a scarred cheek telling A man, maybe 50s, with restless
  hands about you. It's picking up decorations as it travels."*
- Seed 106753, day 27: *"🛡️ Salvador, Felicite, Fatima and Nina met
  them at the door — 2 put down, 1 barely walked away. Felicite didn't
  come back. Salvador, Fatima, Nina are hurt."*
- Seed 106751, day 40: *"📺 SYSTEM: \"Oh — OH. Everybody saw that,
  right? Luis just put down The Callback... on CAMERA. That's a veteran
  kill, folks. REMEMBER the name.\""*
- Seed 106751, day 69: *"◆ SYSTEM: \"Four waves. FOUR. The producers
  are — okay, I'm saying it: FINALES need a NATION. You've got a
  region; now make it a REALM. Bind fires under one head, or bend the
  knee to someone who has. The higher-ups are watching. ...Did I say
  higher-ups? I said NOTHING. Forget the higher-ups.\""*
- Seed 106751, day 69: *"◆ ARC IV — THE INEFFICIENCY. SYSTEM:
  \"ROUNDING ERROR RECLASSIFIED: ANOMALY. Organic consumption yields
  impossible output. Recalculating. Recalculating.\" — They finally see
  it. The thing they laughed at — needing to EAT — is the engine. Their
  confusion is your weapon now."*

The daily fiction is coherent and personal: people fetch water, argue
about trust, gossip by the fire and get the details wrong as the story
travels, defend the door and sometimes don't come back — and the dead
are named ("Felicite didn't come back"). The alien-audience voice lands
as menace, and the System's arc beats (FINALES need a NATION, the
inefficiency of eating as a weapon) track the village's actual standing.

**Launch-adjacent scene — a forager walks the road (ON, seed 106751,
day 74).** Holder gen_ggt7q0q is a wanderer holding a wave-4 plan
against the influencer. At dawn the pool holds 3 eligible villagers at
Haven, all foragers — omar_farouk (trust 90), luis_fernandez (trust
90), daniyar_askarov (trust 35) — while five others are away and a
homebody (elijah_scott, trust 90) is away too. The ranker picks
luis_fernandez; a four-person party walks out (holder + Luis + Omar +
Daniyar). Luis meets the influencer the same day and backs off
(evade, 0 damage dealt). This reads as people choosing to go: the pick
is trust-gated and ranked among named foragers, the party is four named
people, and the meeting is real — they walked out, sized up the
influencer, and chose not to die on it. It is not a roster slot filling.
The same seed's day-67 agency-flee (gen_ggt7q0q fled the influencer
and the plan was seeded) is the lived history behind the hunt: the
holder met the monster, ran, and came back with friends. That is a
person acting like a person.

**The gap the fiction does not cover (confirmed on this band):**
ordinary departures. No `vetSays` line in the ON corpus marks the
day-74 launch, and a corpus-wide search for launch/departure language
("walk out", "set out", "depart", "expedition launch") across all 16 ON
files returns **0 hits**. The pilot filed this as a new finding
(ordinary-launch silence); this band confirms it stands. When a party
walks out to hunt a wave-4 monster, the village still never says it is
happening. The hold lines ARE voiced in code (villager-brain.js:736/:768)
— do not re-file them as silent.

## 7. Balanced panel (§15, off → on)

Built with `scripts/build-profilegate4-confirm-b-panels-20261121.js` and
compared with `scripts/balance-panel.js compare`:
`evidence/2026-11-21/profilegate4-confirm-b-panel.{json,md}` (+
before/after `.json.gz`). Panel decision: **review_required** (screen
only, 16 paired cases). No material signal on the contract metrics:
table win rate 0 → 0; national scale access 0 → 0; first-bearer survival
through day 30/60: 1 → 1. Flags: **regression_signal** on village
deaths per 100 days: 56.2 → 64.5 (paired delta +8.3, 95% exploratory
interval +3.0 to +14.4 — excludes zero); **regression_watch** on village
deaths per run: 78.4 → 80.8 (paired delta +2.44, interval −4.3 to +9.4)
and community loss: 0.3125 → 0.375 (interval −0.19 to +0.38). The panel
is the instrument, not the judge: the frozen B3 bars (which pass with
margin) are what judge the cost. But the deaths/100d signal is the
same-run investigation item, and §3.5 prices it: expedition deaths
+64, three extra village collapses. The next cost bar should price
that shape (see §10).

## 8. Instrument validity (B5)

- Proof test `scripts/test-profilegate4-confirm-b.js`: **72 passed, 0
  failed** — static checks (lever present, env-gated, scoped in both
  twins; src/ diff EMPTY as required for a no-src-change confirm;
  depart bypass untouched; `winPlanSecondCompanion` still profile-open;
  seeding gate and `expeditionCand` NOT widened; PINQUAD blocks
  untouched; instrument file list is the 5 confirm files), analyzer
  fixtures (needWave>=4 pool-shape filter, damage-share derivation,
  arm-only starvation, anchor-mismatch B5 fail, F4 frozen bar logic
  with 16-file counts, F5 anchorReport with the 12-char anchor),
  live gate fixture (staged forager picked ON at dawn, null OFF;
  needWave-3 staging null in BOTH states — the scope holds; homebody
  picked ON but blocked at launch by range-0; depart variants proving
  the landed bypass lets a picked forager depart), live gate-act on
  fixture seed 106764 (OFF pool 28 v4 dawns, 19 empty; ON pool 26 v4
  dawns, 0 empty, mean 2.808), D1 repeatability + D2 wrap neutrality
  (60d, seed 106764, both PROFILEGATE4 states).
- D2 full-band: rec ≡ on on all 16 seeds, rec0 ≡ off on all 16 seeds —
  **0 divergences** either way. The recorder is neutral.
- D3 drift: **15/16 CLEAN, 1 DRIFT (seed 106751)** — first divergence
  day 75, first-lever-day (frozen definition: first world-tick v4 seed
  row) day 111. §9 proves this is a false positive: the lever first
  acted on day 74 (a gate-open launch), 37 days before the bound's
  day 111, because the wave-4 plan was seeded by a day-67 agency-flee
  row, not a world-tick row. Under the corrected bound the seed is
  CLEAN. But the frozen definition fails it, so B5 fails as frozen.
- Corpus anchors: every file on all four legs stamps `df4867134afa`
  (analyzer `anchorAll: true`); file counts 16/16/16/16; 0 instrument
  errors on every leg; classified share 1.0; unknown 0.
- `check.js --quick`: **INCOMPLETE, never green** — killed by the 280s
  timeout after 159/344 scripts, 0 failures in the completed portion
  (`profilegate4-confirm-b-check-quick.log`, exit 124). Recorded
  honestly per the prereg; the full quick suite needs ~20+ min and was
  not re-run — the proof test (72/72) is the substantive gate for this
  scripts-only instrument change (no src/ change in this arm).
- Proof history (recorded, not hidden): the first proof run went
  **70/72** with two failures, both instrument defects, both fixed
  before any judged leg and re-run green at 72/72: (a) the sed rename
  missed three filenames containing no `profilegate4-b` substring, so
  the test's requires and EXPECTED_SCRIPTS pointed at the PILOT driver
  and the old names (the gate fixture, D1/D2, and gate-act ran against
  the pilot driver module; the driver's own `firstCallerFrame` filter
  missed its own frames) — fixed by renaming those references to the
  `-confirm-b` files; (b) the frozen fixture seed 106757's ON leg
  scores only 1 v4 dawn in 150d, making the single-seed meanEligible
  clause a one-dawn lottery — fixed by a dated prereg CORRECTION
  switching the fixture seed to the named alternate 106764 (OFF 28 v4
  / 19 empty; ON 26 v4 / 0 empty / mean 2.808), with the bars unchanged.
- Run history: a machine restart at ~16:23Z killed the OFF leg after
  2/16 seeds (uptime 1 min at recovery); the leg was resumed with the
  remaining 14 seeds in a second invocation under the identical env
  and anchor (the driver refuses overwrites, so no file was re-run;
  the two pre-restart files were verified: anchor `df4867134afa`,
  policySha `1884c8852d38`, 0 errors). Heartbeat re-established first
  after the restart, per the standing lesson. No host write flap block
  observed on any file write in this run (all writes verified by
  size/readback); the commit outcome is reported at closeout.

## 9. Metric review

1. **B5's D3 bound is provably non-conservative — the 106751 flag is a
   false positive, and the verdict follows the frozen rule anyway.**
   The frozen D3 defines first-lever-day as the first world-tick v4
   seed row on the ON leg, on the premise that "a needWave>=4 plan
   requires a wave-4 seed first". The premise is true; the
   implementation is not: wave-4 plans are seeded by agency-flee and
   agency-evade rows too. The causal chain on 106751, verified by hand
   from the corpora: day 67, BOTH legs — gen_ggt7q0q meets the
   influencer via agency-flee (`expeditionMonster`,
   villager-agency.js:764), target influencer, stageAfter party — the
   needWave>=4 plan is seeded; day 68, ON — a dawnbidScore picks
   `party_launch` on that needWave>=4 plan; day 74, ON — the first
   gate-open pool row (3 eligible foragers, bid luis_fernandez) and the
   first committed launch (a 4-person party against the influencer);
   OFF day 74 — no depart row at all (pool empty); day 75 — the daily
   fingerprints diverge (kill-log: OFF has one extra cliffhanger kill;
   the ON party is out on the road). The lever acted on day 74; the
   trajectories diverged on day 75. The frozen bound says the lever
   could not have acted before day 111 (first world-tick row) — 37
   days late. Under the corrected bound — first needWave>=4 pool row
   (day 74) or first needWave>=4 dawnbidScore (day 68) on the ON leg,
   both directly observable in the corpus and both conservative (the
   gate cannot act before a scored dawn for a needWave>=4 holder) —
   the seed is CLEAN (75 ≥ 74). The other 15 seeds are CLEAN under
   either bound, and the 7 IDENTICAL seeds have no divergence at all.
   **Handling, per §14 and the poolfirstfail re-anchor precedent: a
   miss is NO-GO, never re-scored.** The D3 clause is not corrected
   mid-run and the verdict stands as measured (NO-GO). The correction
   is proposed for the NEXT run, not this one: re-freeze
   first-lever-day as the first needWave>=4 pool row on the ON leg
   (fallback: first needWave>=4 dawnbidScore), re-run D3 on THESE
   corpora — no new sims are needed, D3 is a pure re-analysis — and
   re-judge B5. If D3 passes under the corrected bound (expected:
   16/16 CLEAN), the verdict on this evidence becomes GO and the
   default flip can be decided then.
2. **B3 passes with margin on 16 seeds — the pilot's fragility did not
   reproduce.** Starvation 11 vs bar 12, arm-only 3 vs bar 4, median
   151 vs bar 120.4. The pilot's exact-at-bar pass was a property of
   8 seeds, not of the lever. No B3 revision needed — but see (3).
3. **The panel's deaths/100d regression_signal prices a cost B3 does
   not see.** Expedition deaths +64, three extra village collapses,
   deaths/100d +8.3 with an interval excluding zero (§3.5, §7). The
   frozen B3 bars (starvation + median) pass while the panel flags the
   road-death shape. A future cost bar for launch-heavy levers should
   price expedition deaths and early village loss alongside starvation
   — the median is blind to 3–4 early collapses. No revision to THIS
   verdict (B3 passes as frozen); the proposal is for the next
   cost-bar freeze.
4. **B1's dawn-count asymmetry is expected, not a defect.** ON scores
   105 wave-4+ dawns vs OFF's 146 because launches change the village.
   The bar was deliberately set looser than the counterfactual mean
   (1.5 vs 3.23) for this reason, and ON cleared it at 2.99. No
   revision needed.
5. **B2's "launched instances" understates the effect, again.**
   Instances 14 vs 8; wave-4+ launch EVENTS are 116 vs 59. A future
   arm measuring launch throughput should bar on events, not
   instances — the instance count is capped by how many plans exist,
   which the lever does not create.
6. **B4's damage derivation is honest about its limits.** 2 of 7 ON
   meetings fall back to the hp-range midpoint (both 0-damage meetings
   where no strike landed). The per-meeting table makes every
   derivation auditable. The pooled share rose sharply (0.1198 vs the
   pilot's 0.0336) — but 1 of the 7 meetings is the shared
   pre-divergence eater fight, so the ON-only damage is 421/4303 =
   0.0978 over 6 meetings. Still above launchfunnel's 0.085 and the
   pilot's 0.0336. The damage wall moved; it did not vanish.

## 10. Blanks filled / documented

**Filled by this arm (evidence + instrument, no src/ change):** the
16-seed confirm of the landed scoped profile-gate relaxation. The pool
fills (0.75 → 0.048 empty), launches rise (8 → 14 instances, 59 → 116
events), the frozen cost bars pass with margin, damage improves
(0.0488 → 0.1198 pooled). The winnability chain's companion-supply link
is confirmed no longer binding — on 16 fresh seeds, not 8.

**Documented, not built (findings backlog — see sim-findings.md):**
- The D3 first-lever-day bound is non-conservative: agency-flee/evade
  wave-4 seed rows plant needWave>=4 plans before the first world-tick
  row (proven on 106751: day-67 agency-flee → day-74 gate-open launch
  → day-75 divergence, vs a day-111 world-tick bound). The drift
  check's bound needs the one-line re-freeze (first needWave>=4 pool
  row) and a D3 re-run on these corpora.
- The next binding links are now measured on 16 seeds: (a) party
  damage vs wave-4 monsters (pooled 11.98%, best single meeting 26.2%,
  1 kill in 14 launches) — better than the pilot band, still a
  fighting-strength problem, not a supply problem; (b) selected-blocked
  depart failures (14/35 instances) — holders who bid parties they
  cannot lead out of the door; (c) the standing-199 stall (9 ON
  villages at exactly 199) — the gate to national still does not open;
  (d) the road-death cost of launching (expedition deaths +64, three
  extra village collapses) — the next cost bar should price it.
- Sense gap (confirmed on this band): ordinary wave-4+ party departures
  have no fiction line — 0 launch-mention `vetSays` lines across all 16
  ON files. When a party walks out to hunt a wave-4 monster, the village
  should say so. The holds, by contrast, ARE voiced
  (villager-brain.js:736/:768) — do not re-file them as silent.

## 11. Files / disposition

- Lever: NONE in this arm (already on master, commit `84e57fcc3`).
- Instrument: `scripts/profilegate4-confirm-b-driver-20261121.js`,
  `scripts/analyze-profilegate4-confirm-b.js`,
  `scripts/profilegate4-confirm-b-drift-check.js`,
  `scripts/build-profilegate4-confirm-b-panels-20261121.js`,
  `scripts/test-profilegate4-confirm-b.js`.
- Corpora: `evidence/2026-11-21/perseed-profilegate4-confirm-b-{off,on,rec,rec0}/`
  (16 files each).
- Analysis: `evidence/2026-11-21/profilegate4-confirm-b-analysis.json`
  (analyzer verdict GO; the run verdict is NO-GO on the frozen D3
  clause — see §9).
- Panel: `evidence/2026-11-21/profilegate4-confirm-b-panel.{json,md}` (+
  before/after `.json.gz`).
- Legs log: `evidence/2026-11-21/profilegate4-confirm-b-legs.log`;
  check-quick log
  `evidence/2026-11-21/profilegate4-confirm-b-check-quick.log`.
- Prereg: `evidence/2026-11-21/sim-profilegate-confirm-b-prereg.md`
  (with the dated CORRECTION).
- Evidence: this file.
- **Disposition: NO-GO under the frozen rules (B5/D3 only) — no default
  flip. The instrument + evidence commit is ready to merge; the
  follow-up (re-freeze the D3 bound, re-run D3 on these corpora, re-judge
  B5) needs no new sims and is the next blank in order. No push; no
  version bump; no live verification. The coordinator merges via
  --ff-only and reports 'merged locally, pending ship'.**
