# sim-answercourt-b — BUILD: scaleclimb + the First Court answer, NOTHING else — GO

Run: fleshout-loop-b-20261114T1945Z (Loop B), arm sim-answercourt-b
Axis: winnability chain. BUILD arm — the recovered scaleclimb policy
(baseline) vs scaleclimb + answerNationalChoice on EVERY staged
national beat (armed), measured before/after on identical seeds.
Policy-side only: one baseline policy restored verbatim + one new
armed policy, zero src/js changes.
Branch: sim-answercourt-b — worktree ~/workspace/worktrees/sim-answercourt-b
Base: master at worktree creation (62dd6d36f)
Date: 2026-11-14
Prereg: evidence/2026-11-14/sim-answercourt-b-prereg.md (binds G1/G2/G3)

## Verdict: GO on G2 (national ever 5/8 vs 0/8) — G1 GO, G3 GO, cost bar PASSES

- **G1 INSTRUMENT VALIDITY — GO.** Full per-day link roll on all 16
  configs, **0 instrument errors**, **0 unattributed diplomacy points
  (up AND down)**, **0 unattributed steps**, telescope gap 0 on every
  record, **0 UNCLASSIFIED links**. The episode analyzer is validated
  on a genuinely flickering leg (100106's polity counts d88–127,
  un-counts, and re-counts d133–137; every step named in both
  directions). The lever
  fired: answerNationalChoice calls armed **6**, baseline **0**.
- **G2 THE LEVER — GO.** NATIONAL EVER (scaleRank ever 'national'
  or 'global' in the per-day series) on **5/8** armed seeds (need
  ≥4/8; baseline **0/8**, need ≤1/8). All five first-national days
  land in the canon window (62, 88, 62, 89, 71 — national ~day
  61–90). Held-days read alongside: median **40** armed vs **26.5**
  baseline; ever-counted 5/8 both. End-state national (the
  holdpantry-style count) is 3/8 armed vs 0/8 baseline — the other
  two nationals were held for weeks and dissolved before the
  horizon, which is a HOLD finding, not an answer failure.
- **G3 LEVER-ONLY — GO.** Zero `src/js` changes in the branch diff;
  proof test green (static 70/70, game 26/26 on smoke seed 100101).
- **COST BAR — PASSES both halves.** Starvation deaths pooled armed
  **1** vs baseline **1** (≤ control+2 ✓). Median survival armed
  **137d** vs baseline **126.5d** (1.08× control, need ≥0.8× ✓).
  Guardrail (§14c): no seed's armed villager combat deaths exceed
  the before leg by >50% (worst: 100107, 63 vs 55, +15%).

A GO licenses a 12–16 seed confirm (coordinator's call). The pilot
IS the result until then; no confirm band was spent.

## The answer in one paragraph

Answer the court and the realm becomes a nation — five times out of
eight, on the first try, with nothing else changed. The baseline
villages climb exactly as far — same polities, same regional day
(32–33), same 5/8 ever-counted — and their courts sit staged and
unread for 230 days while the realm waits: the beat is there, the
speakers rode in, nobody answers, and national never lands. The
armed villages answer the morning the beat arrives (6 answers, all
the lead shape, all 'feast', all sat), the propose block that cost
the baseline 230 days vanishes to zero, and five villages hear the
governance-layer announcement and hold national for 34–89 days each.
Three of the five hold it to the village's death or the horizon; two
dissolve silently weeks later — the hold is still the open problem,
but the answer is no longer the question. The answer costs nothing:
no banking, no extra trips, no extra fights — the armed villages
live longer (median 137 vs 126.5 days) and die at the same rate per
day (67.0 vs 67.6 deaths per 100 game-days). The only thing the
answer spends is the feast itself, 5,000 kcal, and it buys +10 trust
with every subordinate fire. The First Court was the missing verb.

## Before / after (paired seeds, 150d)

| Seed | Before: scaleclimb (days, end, scale, maxW, stand, w1/w2/w3/w4/w5) | Armed (days, end, scale, maxW, stand, w1/w2/w3/w4/w5) | dip end (peak, held d) | nat day (nat held d) | polity bar day | regional day |
|---|---|---|---|---|---|---|
| 100101 | 139, lost, regional, 4, 175, 22/11/10/0/0 | 139, lost, regional, 4, 175, 22/11/10/0/0 | 0 (0, 0) | — | — | 32 → 32 |
| 100102 | 77, lost, regional, 4, 199, 50/27/7/3/0 | 113, lost, national, 4, 199, 53/27/11/5/0 | 0 (102, 60) | 62 (53) | 54 | 32 → 32 |
| 100103 | 119, lost, regional, 4, 199, 23/16/7/3/0 | 121, lost, national, 4, 199, 26/18/8/0/0 | 102 (102, 35) | 88 (34) | 87 | 33 → 33 |
| 100104 | 135, lost, regional, 5, 470, 50/32/13/5/0 | 135, lost, regional, 5, 470, 50/32/13/5/0 | 0 (0, 0) | — | — | 32 → 32 |
| 100105 | 120, lost, regional, 4, 199, 39/36/9/4/0 | 150, lost, national, 4, 199, 39/37/9/6/0 | 0 (102, 91) | 62 (89) | 59 | 32 → 32 |
| 100106 | 133, lost, regional, 5, 355, 27/24/5/7/0 | 144, lost, regional, 5, 365, 32/26/5/7/1 | 0 (102, 45) | 89 (45) | 88 | 33 → 33 |
| 100107 | 150, survived, regional, 4, 199, 25/19/12/1/0 | 150, survived, regional, 5, 345, 29/20/10/4/1 | 0 (136, 68) | 71 (67) | 70 | 32 → 32 |
| 100108 | 104, lost, regional, 5, 325, 20/11/6/5/2 | 104, lost, regional, 5, 325, 20/11/6/5/2 | 0 (0, 0) | — | — | 32 → 32 |

Pooled wave kills — baseline 256/176/69/28/2 (waves 1–5),
armed 271/182/72/32/4. Median survival 126.5d → 137d; survived
1/8 → 1/8 (100107 both). Gated standing median 199 → 262
(baseline standings 175–470, armed 175–470; 100104 reads 470 on
both legs — no 199 park on this band). National ever 0/8 → 5/8;
end-state national 0/8 → 3/8; table/wins 0/8 both (by design — no
seat-taking in this lever).

Three seeds (100101, 100104, 100108) are byte-identical twins: the
polity bar was never reached there (max 1–2 Haven-primary seasoned
subs at once), no beat ever staged, the lever never fired, and the
armed trajectory is the baseline trajectory to the kill. That is the
instrument working, not a failure — the answer can only answer a
court that stages, and on those seeds the climb itself fell short.

## The verb table (armed leg, 8 seeds)

| verb | calls | trust moved | first-crossings | refused |
|---|---|---|---|---|
| proposeLink (LEAD) | 29 | — | — | 0 declined, 0 shut |
| └ accepted outright | 23 | — | — | — |
| └ countered | 6 | — | — | — |
| answerCounter ('accept') | 6 | — | — | 0 |
| answerAccord ('gift' +10) | 19 | +190 | 19 | 0 |
| answerNationalChoice | 6 | — | — | 0 |
| └ lead → 'feast' (sat) | 6 | +10 each sub | — | 0 |
| └ conquest/belong/covenant/trade | 0 | — | — | (no such beat staged) |
| answerGlobalChoice | 0 | — | — | (not answered by design) |
| tendLink, policy (+8/week) | 143 | +592 (74 paid) | 18 | 69 (n=0) |
| tendLink, engine — villagers' own drive | 19 | +152 | 2 | 0 |
| payTribute | 0 | 0 | 0 | 0 |
| hostFeast (engine's own feasts, not the policy) | 25 | 0 (no link) | 0 | — |

Baseline leg for contrast: propose 29 (23 accepted, 6 counter, 0
declined), counter-answers 6, accord 19 (+190, 19 crossings), tend
policy 143 (+600, 75 paid, 19 crossings, 68 refused), tend engine
19 (+152, 2 crossings), national/global answers 0. The two legs are
near-identical on every verb EXCEPT the answer — the courtship is
the same courtship, which is exactly the isolation this arm was
built to prove. Propose judge still exact: **0 cold declines in 29
calls**. Propose blocks (days): pantry 332, 3-sub cap 380, pending
counter/accord/national **0** (baseline 230 — the national answers
eliminated the block entirely, as designed), not-ready 242.
PendingNational days: armed **6** (one per staged beat — answered
the next morning), baseline **230**. PendingGlobal days armed
**171** (the Watchers beat staged on all five national seeds and
sat unanswered by design — see metric review §4); baseline 0
(no national, so no global beat can stage).

## The answer, seed by seed

- **100102 — the court that saved the village's season.** Polity
  d54, beat staged d61, feast d62, national held 53 days to the
  village's death at d113. The baseline village died at d77 with
  the same polity standing and its court unread for 15 days. The
  answer bought 36 more days of life and a nation: same kills at
  waves 1–2, more at waves 3–4 (11/5 vs 7/3). The feast line names
  the grief: "Trust +10 with each — 3 grieving fire(s); theirs
  waits."
- **100103 — the late court.** Polity d87, beat d87, feast d88,
  national 34 days, village died d121. The baseline died d119 with
  the court unread for 31 days. The answer's margin here is thin
  (2 days) but the nation is real: the village died national, not
  regional.
- **100105 — the long hold.** Polity d59, beat d61, feast d62,
  national 89 days — the longest hold in the band — village lost
  d150. Baseline died d120 with the court unread for 58 days. The
  answer bought 30 days and a nation that outlived the village's
  whole remaining season. One caveat: the diplomacy falls to 0 on
  the horizon day itself (d150), the same last-day cliff holdpantry
  saw on 91102 — the realm died on the last day, not before it.
- **100106 — the court that sat twice.** Polity d88, beat d88,
  feast d89, national d89–128 (40 days), dissolved — then the
  polity re-counted d133, a SECOND beat staged and was answered
  d134 (feast again), national d134–138 (5 more days), dissolved
  again. The village reached national, lost it, and reached it
  again, and died d144 regional. The baseline died d133 with the
  court unread for 46 days.
- **100107 — the warned realm.** Drift warnings at d48 (two fires),
  polity d70, beat d70, feast d71, national 67 days, dissolved
  silently before the horizon — the village survived to 150d
  regional, its realm gone with no line marking the loss. The
  baseline survived too, its court unread for 80 days. The feast
  was answered by four fires (Emberhold, Ashford, Stonebridge,
  Thornfield) — the band's only 4-sub court.
- **100101 / 100104 / 100108 — no court to answer.** Max 1–2
  seasoned subs; the polity bar never stood. 100104 is the
  sharpest: standing 470, wave 5 unlocked, 5 wave-4 kills — a
  strong village that never formed the third seasoned bond. The
  climb, not the answer, is the blocker there.

## Per-seed link table (armed leg)

`seas` = seasoned day; `count` = first day counted; `eps` =
counting episodes; `cross` = verb that carried the first trust-40
crossing; `end` = end trust/age. Only counted links shown; the full
table (all links, both legs) is in answercourt-b-analysis.json.

| seed | link | formed | t40 | seas | count | eps | cross | end |
|---|---|---|---|---|---|---|---|---|
| 100102 | village_3 | d10 propose | d11 | d40 | d54 | 54–113 | accord | 35/104 |
| 100102 | village_1 | d12 propose | d13 | d42 | d54 | 54–113 | accord | 71/102 |
| 100102 | village_0 | d24 propose | d24 | d54 | d54 | 54–113 | accord | 37/90 |
| 100103 | village_2 | d42 propose | d49 | d76 | d87 | 87–121 | tend:policy | 43/79 |
| 100103 | village_spl_25 | d45 propose | d49 | d75 | d87 | 87–121 | tend:policy | 41/76 |
| 100103 | village_0 | d57 propose | d58 | d87 | d87 | 87–121 | tend:policy | 58/64 |
| 100105 | village_0 | d10 propose | d11 | d40 | d59 | 59–150 | accord | 38/140 |
| 100105 | village_1 | d11 propose | d12 | d41 | d59 | 59–150 | accord | 66/139 |
| 100105 | village_spl_25 | d29 propose | d30 | d59 | d59 | 59–150 | accord | 37/121 |
| 100106 | village_0 | d40 propose | d41 | d70 | d88 | 88–127, 133–137 | tend:policy | 49/105 |
| 100106 | village_spl_32 | d54 propose | d56 | d84 | d88 | 88–127, 133–137 | tend:policy | 35/91 |
| 100106 | village_spl_29 | d58 propose | d77 | d88 | d88 | 88–127, 133–137 | tend:policy | 44/87 |
| 100107 | village_0 | d10 propose | d11 | d40 | d70 | 70–137 | accord | 38/141 |
| 100107 | village_3 | d11 propose | d12 | d41 | d70 | 70–137 | accord | 23/140 |
| 100107 | village_1 | d12 propose | d13 | d70 | d70 | 70–137 | accord | 33/139 |
| 100107 | village_2 | d37 propose | d70 | d70 | d70 | 70–137 | tend:policy | 52/114 |

Dip steps (armed leg, each ±34 named to its link episode; down-steps
named to the un-counting link — 0 unattributed steps band-wide):
100102 d54 +102, d114 −102 (village died national); 100103 d87
+102, no down-step (ended counted, dip 102 at the death); 100105
d59 +102, d150 −102 (the dip falls to 0 on the horizon day itself
— the same last-day cliff holdpantry saw on 91102); 100106 d88
+102, d128 −102, d133 +102, d138 −102 (counted, dissolved,
re-counted, dissolved again); 100107 d70 +136, d138 −136
(dissolved silently).

## Wall numbers (scale wall, every run)

- National / table / wins: armed reaches national (ever) on **5/8**,
  end-state national on **3/8**, takes the table on **0/8**, wins
  **0/8**; baseline national ever **0/8**, end-state **0/8**, table
  **0/8**, wins **0/8**. No village reaches the table as a distinct
  step — by design, this lever never sits.
- Wave 4–5 reach: wave 4 unlocked 8/8 both policies; wave 5
  unlocked **4/8 armed** (100104, 100106, 100107, 100108) vs **3/8
  baseline** (100104, 100106, 100108). Pooled wave kills — armed
  271/182/72/32/4 (waves 1–5), baseline 256/176/69/28/2.
- Median survival: baseline **126.5d** (77–150; 1/8 survived to
  150d); armed **137d** (104–150; 1 survived to 150d, 7
  village-lost).
- Death causes (§14c co-primary): villager (non-scholar) combat
  deaths pooled **600 armed vs 563 baseline** (+6.6%). Total deaths
  707 vs 660 (+7.1%). Deaths per 100 game-days: **67.0 armed vs
  67.6 baseline** — flat. The armed villages accumulate more deaths
  because they live longer (1,056 vs 977 game-days), not because
  they die faster. Per-seed armed exceeds the before leg by >50% on
  NO seed (worst 100107, +15%), named here per the prereg
  guardrail. Starvation deaths: 1 armed (100103) vs 1 baseline
  (100103) — the same death, the same seed.

## Balanced panel (§15 — instrument, not judge)

`evidence/2026-11-14/answercourt-panel.md` (+ .json, .json.gz pair;
pseudo-panels built from the driver's per-seed JSONs, scaleclimb
pattern — the real balance-panel.js compare cannot judge a policy
contrast, see prereg): decision **review_required** (8 paired
cases, screen only). National 0 → 0.375 end-state (the panel sees
only end-state national, not series-ever); wins 0 → 0
(descriptive); survival30 1.0 → 1.0 (no_material_signal);
survival60 1.0 → 1.0 (no_material_signal); villageDeaths/run
82.5 → 88.375 (**regression_signal**, CI [2.25, 9.875]);
villageDeaths/100d 71.77 → 67.44 (no_material_signal, CI straddles
0 — the panel's per-run mean of per-run rates; the pooled rates
are 67.0 armed vs 67.6 baseline, flat);
communityLost 0.875 → 0.875 (no_material_signal). Per §15 this
does NOT override the prereg verdict (already GO on G2); the
panel's one signal is the per-run death count, which is a survival
artifact — the armed villages live 79 more game-days in total and
die at the same rate per day. The panel cannot see the lever's
primary effect at all (series-ever national is not a contract
metric; end-state national is, at 0.375). Panel limitation (stated
in the prereg): the pseudo-panel covers only contract metrics
mappable from the driver JSONs (won, national, survival30/60,
communityLost, villageDeaths); playerDeaths, gear, luck, and NPC
metrics are null, never faked.

## Telemetry deviation check (loop step 10)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-14/perseed-answercourt-b/*.json' --metrics
national,table,wins,exiled` REFUSES the input by design:
"refusing recorder-corpus input: all 16 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs.
Recorder corpora are compared with sweep-compare tables, never
against a run baseline here." No LOUD line was produced — the
refusal is the tool's designed behavior for a sweep corpus, not a
finding. The §15 pseudo-panel compare above is the instrument
for this corpus instead.

## Village assessment

The same eight villages, twice — once with their courts left
unread, once with them answered. The unread villages are the
stranger story: the speakers ride in, the court is staged, the
System announces the governance layer — and nobody answers. For
230 days across the band, a polity stands with a court waiting and
the village goes on foraging while its own realm waits at the
gate. The answered villages are the plain story: the morning after
the speakers arrive, the granary opens, 5,000 kcal walks to every
fire, and the realm becomes a nation — five times, in the canon
window, for 34 to 89 days each. Three of the five hold it to the
end. Two lose it silently, weeks before the village itself dies,
and nothing in the game says the realm is gone — the loss is still
a number falling, not a sentence. The three villages with no court
at all are the other half of the picture: 100104 is strong by every
fighting measure (standing 470, wave 5 unlocked) and never forms
the third seasoned bond, so there is nothing to answer. The answer
is proven. The climb to the third bond, and the hold after the
court sits, are still the open problems — and they are now cleanly
separated from the answer, which was the point of this arm.

## Sense-testing (SENSE-TESTING LAW)

The court reads like a played ceremony, and the sequence is the
same on all five seeds — which is the point and the limit. The
staging (100102, day 61): "◈ SYSTEM: 'Four fires. One head.
GOVERNANCE LAYER: online — polity tribute routing, the court
calendar, famine reserves. You built a realm. Try not to lose it
the way you found it.'" The arrival (same day): "👑 Speakers from
Ashford, Stonebridge, Emberhold ride in for the first court — and
every one of them is measuring you. FEAST them from a shared
granary (5,000 kcal, no strings), HOST the court at Haven's fire
(your speaker holds the room)..." The answer (day 62): "🍲 The
shared granary opens: 5,000 kcal for every fire of the realm, no
strings. Ashford, Stonebridge, Emberhold count it — and remember
who fed them first. (Trust +10 with each — 3 grieving fire(s);
theirs waits.)" — the game itself names the grief, and the feast
pays it. The drift warning is the realm's other played line
(100107, day 48): "⚠️ Emberhold's fire is drifting from ours —
their speaker doesn't linger at the gate the way they used to, and
nobody over there says why. Bonds don't mend themselves; a tended
fire remembers who fed it." What is STILL missing, third run in a
row: the dissolution has no played line. 100106's realm dissolves
after 45 days as a nation, 100107's after 67 — and the captured
lines around those days are workbench chatter and watch reports,
nothing marking the loss. The Watchers beat, staged on all five
national seeds, DOES have played lines (100106, day 104): "◈
SYSTEM: '35. You see the number. THE WORLD IS WATCHING. Broadcast
tier: planetary — the audience has picked its favorite fire and it
is YOURS...'" and "📡 The feed floods in — fan art, messages in
languages nobody speaks, a countdown that isn't yours. The
audience demands Haven for the world feed: SEND your speaker..." —
and then it waits, unanswered by design, for 2–87 days with no
re-prompt and no consequence line. A staged beat that waits forever
reads like a letter never opened. Villager dialogue in the
captured lines stays coherent and specific — except one robotic
repeat worth a backlog line: on 100107, Yuki's "Crossbow bolt came
apart in their hands. The materials are wasted." fires verbatim
14 times between day 2 and day 43, mostly every three days, the same
workbench failure with no learning, no variation, no comment.

## Metric review (§14)

1. The metrics held. G1 held in its EPISODE form: the analyzer
   attributed every step on flickering legs (0 unattributed up,
   0 unattributed down, telescope gap 0) — validated first on the
   holdpantry corpus (16/16 records, 0 unattributed) before this
   pilot ran. G2 held on its own terms (5/8 vs the 4/8 bar). G3 held.
2. The series-ever reading of "national ever" is the right judge
   for THIS lever, and the pilot proves why: end-state national
   (3/8) would have hidden two courts that sat, held 45 and 67
   days, and dissolved — the answer's work, erased by the hold's
   failure. The prereg's series-ever definition is what separates
   the answer from the hold. Both numbers are reported; the series
   number judges, the end-state number contextualizes.
3. The cost bar's median half caught nothing this time and the
   starvation half caught nothing either — the lever is free on
   both. The panel's per-run villageDeaths regression signal is a
   survival artifact (longer-lived villages accumulate more
   deaths); deaths per 100 game-days is flat (67.0 vs 67.6). A
   future panel read should lead with the per-day rate for levers
   that change survival.
4. The global-beat isolation choice has a visible cost: the
   Watchers beat stages on every national seed (1–65 days after
   the court, viewership-gated) and sits unanswered 2–87 days with
   no re-prompt.
   It does not block proposing (armed propose-block days from
   pending beats: 0) and cannot move the primary — but a human
   player would not leave it sitting, and a future arm that
   answers global beats should measure whether the Watchers
   answer changes the hold. The global answer is still untested.
5. Only ONE shape staged on this band (lead, 6/6). The other four
   per-shape answers (conquest mercy, belong swear, covenant pact,
   trade sign) are proven by fake-Game unit tests only — they
   never fired in live play. A confirm band, or a band built to
   stage the other shapes, is the only way to prove them live.
6. Say-capture: the meal filter + 600 cap held (max captured day
   69–114 across the band), the drift warning and the Watchers
   staging were both captured — but the cap still binds
   on long runs (all 16 records hit 600 lines) and the polity's
   dissolution still has no played line in the game at all. The
   holdpantry recommendation stands: keep every polity/drift/
   seasoning line and cap only the rest, and the game needs a
   dissolution line before any recorder can capture one.

## Evidence files

- Prereg: evidence/2026-11-14/sim-answercourt-b-prereg.md
- Baseline policy: scripts/policies/competent-scaleclimb-b.js
  (restored verbatim from 29a794df6 — instrument, not a lever)
- Policy: scripts/policies/competent-answercourt-b.js (new)
- Driver: scripts/answercourt-driver-20261114.js (new)
- Analyzer: scripts/analyze-answercourt-b.js (new)
- Panel builder: scripts/build-answercourt-panels-20261114.js (new)
- Proof: scripts/test-answercourt-b-20261114.js (new; static 70/70,
  game 26/26 on smoke seed 100101)
- Per-seed JSON: evidence/2026-11-14/perseed-answercourt-b/ (16 files)
- Analysis JSON: evidence/2026-11-14/answercourt-b-analysis.json
- Pilot log: evidence/2026-11-14/answercourt-b-pilot.log
- Analyzer log: evidence/2026-11-14/answercourt-b-analyzer.log
- Panel: evidence/2026-11-14/answercourt-panel.{json,md}
  (+ -before/-after .json.gz pair)
- Evidence: this file

## Commits (branch sim-answercourt-b)

- d79b39fa1 prereg (G1/G2/G3 bars; fresh band 100101–100108;
  leadcourt answer map)
- f6c1decf4 instrument: baseline policy (verbatim 29a794df6) +
  armed policy + driver + analyzer + panel builder + proof test
  (static 70/70, game 26/26 on smoke seed 100101)
- (this commit — pilot corpora + analysis JSON + panel + evidence)

## Findings for the backlog (coordinator owns sim-findings.md)

1. **The hold after the court sits is the open problem.** Two of
   five nationals dissolved silently weeks after sitting (45d,
   67d held). The answer is proven; the hold needs a grief/spend
   lever (holdpantry's conclusion stands) or a dissolution
   mechanic that says so aloud.
2. **The polity's dissolution has no played line** (third run:
   scaleclimb, holdpantry, now answercourt). The drift warning
   exists; the loss itself is silent in the numbers. The game
   needs a dissolution line before any recorder can capture one.
3. **The Watchers beat waits forever when unanswered.** It stages
   1–65 days after every court and sits 2–87 days with no
   re-prompt and no consequence. A future arm should answer
   global beats and measure whether the Watchers answer changes
   the hold.
4. **Only the lead shape staged (6/6).** Conquest/belong/covenant/
   trade answers are unit-proven only. A confirm band, or a band
   built to stage the other shapes, is owed before those answers
   are called proven in live play.
5. **Robotic repeat: Yuki's workbench failure** (100107, days
   2–43, 14 verbatim repeats of "Crossbow bolt came apart in
   their hands. The materials are wasted."). A villager failing
   the same craft mostly every three days for six weeks with no learning,
   variation, or comment reads as a loop, not a person.
6. **Say-capture cap still binds** (600 lines, all 16 records hit
   it). Future recorders should keep every polity/drift/seasoning
   line and cap only the rest.

## Convergence state

BUILD — GO against the preregged G2 bar (national ever 5/8 vs the
4/8 bar, baseline 0/8 vs the ≤1/8 bar), G1 GO, G3 GO, cost bar
passes both halves. A 12–16 seed confirm is licensed
(coordinator's call); a NO-GO would have parked the lever, but
the pilot IS a GO, so the lever is a confirm candidate, not a
park. Either way the axis line updates from this run's numbers
only: the answer is closed (courts sit when answered, 6/6 sat);
the climb to the third bond (3/8 seeds never stage a beat) and
the hold after the court (2/5 nationals dissolve silently) stay
open. No confirm band is licensed by this worker — only by the
coordinator.
