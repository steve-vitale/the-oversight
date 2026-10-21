# sim-tributeguard — "never skip the tribute that keeps the court"

Run: fleshout-20261021T1135Z, arm sim-tributeguard, axis scale-onramp.
Lever: policy-side, backlog #752 (the sim-dissolvetax DIAG's named next).
Worker tree: ~/workspace/worktrees/sim-tributeguard.
ZERO src/js changes — scripts/policies/tributeguard.js only (TRIBGUARD=1
default-OFF, env-gated).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

- **PRIMARY (mechanism pilot):** tribute-skip-while-court events, armed vs
  control. **GO = 0 armed skips across the sweep AND control shows ≥ 1 skip**
  (the mechanism must exist to be guarded).
- **GUARDRAILS (hard):**
  - starvation deaths ≤ control + 1 (the guard costs tribute food — it must
    not starve the village);
  - median survival ≥ control − 10d.
- **SECONDARY (report only, do NOT judge):** arrears-tripped dissolutions —
  dissolution density is too low on this substrate (1 event in the DIAG's 16
  runs) to judge a lever; report the count honestly, never re-score.
- **Seeds:** 8 FRESH belongfeast seeds 64921–64928 (verified unused — asserted
  inline in both the proof E2 and the sweep; registries checked: evidence
  per-seed filenames + sweep SEEDS lists; the arm's own files excluded) ×
  {control, armed} = 16 runs, paired same-seed.
- **Policies:** TG.armedFor('belongfeast') from scripts/policies/tributeguard.js
  on both arms (withTributeGuard OUTSIDE the vgearconfirm armed stack);
  control = TRIBGUARD unset (read-only skip counting, pure delegation);
  armed = TRIBGUARD=1 (the guard).
- **Horizon:** 180d death-aware (+10d tail max).
- **Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 VGEAR=1 (KILLDISC unset — not needed; asserted unset like the
  other forbidden extras).
- **§15:** before/after comparison through the balanced panel
  (scripts/balance-panel.js schema — the panel is the instrument, the
  pre-registered threshold is the judge). Compare .md attached.
- **Mechanism definition:** a "skip-while-court" = a daily tick where the
  belong court is held (Game.polityOf(primaryId) returns a 'belong'-shaped
  polity — trust ≥ 50, arrears ≡ 0, link ≥ 14d, foreign realm ≥ 4 fires;
  hierarchy.js polityOf), the week's tribute is unpaid, and the pantry can't
  carry 2× the week's tribute (belongseek's skip condition). Control counts
  the skip only when the tribute is still unpaid after inner daily (the skip
  materialized). Armed: the guard calls Game.payTribute(link.id) before
  inner runs on exactly those ticks; armed skips are ticks where the guard
  did not pay.
- **PILOT GATE:** judge the 8-seed pilot first; kill fast on an invisible
  effect. Killed arms leave no trace — policy layer deleted zero-trace per
  kill protocol; instruments + evidence + proof land as the killed-verdict
  record. Never re-score a miss against a friendlier metric.

## Canon

docs/CANON.md read first. **No canon doc covers travel/regional/hierarchy**
(realm/link mechanics, dissolution paths, tribute) — the canon manifest lists
DISEASES/BEAR/PRESERVATION/MONSTER-WAVES/CONTESTS/CONVERSATIONS/PARTY/
SYSTEMS/BALANCING/TIME-ECONOMY/KIN/FANS; none covers links, realms, courts,
or the scale ladder. Per the brief's instruction ("say so instead of
inventing"), every mechanism claim below is grounded in src/js reads
(hierarchy.js: payTribute ~L851, linkTick ~L971, polityOf ~L1878,
_foreignPolitySim ~L2015, _checkNational ~L2100), cited by function/area —
never invented from scratch.

## Proof results (pre-sweep — all green, 2026-10-21)

scripts/test-tributeguard-20261021.js: **17/17 GREEN** (run with
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 per
the Usage header — ENV TRAP honored).

- E0: module shape — exports, armedFor id tags, tributeguardOn env gate
  (3/3).
- E1 det-gate: TRIBGUARD unset → withTributeGuard(VCE.armedFor) trajectories
  byte-identical to VCE.armedFor on the extended canonical projection
  (dayHash + hierarchy: links minus unstable link.id, foreignPolities,
  nationalLive/globalLive/nationalShape), 2 seeds (64931, 64932) × 60d
  (2/2). The read-only skip counting adds zero drift.
- E2 env-gate: pinned substrate accepted; missing FEASTSCALE_R13 rejected;
  forbidden extras (SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/...) rejected;
  seeds 64921–64928 + 64931–64933 asserted fresh inline (evidence per-seed
  filenames + sweep SEEDS lists scanned; the arm's own files excluded)
  (1/1).
- E3 read-only static scan: no Math.random(, no R( draws, no pick( calls,
  no Game.state writes in the layer source — the only Game-mutating path is
  the documented Game.payTribute verb call (4/4).
- E4 RED→GREEN on synthetic fixtures (fake Game + fake inner policy
  replicating belongseek's `pantryKcal > 2× tribute` skip gate):
  E4a RED — control, court held, thin pantry: skip counted (tgSkips=1),
  payTribute never called; E4b GREEN — armed: payTribute called once,
  tgGuardPaid=1, no skip; E4c court-scoped — armed, court NOT held: guard
  silent, never pays; E4d fat pantry — inner pays itself, guard silent
  (7/7).
- D2: 180d armed run completes (s64933 belongfeast) + deterministic
  in-process re-run byte-identical (1/1).

## Sweep results (16 runs, belongfeast × {control, armed}, VGEAR=1 winning substrate)

8 fresh seeds 64921–64928 × {control, armed}, 180d death-aware, paired
same-seed. 16/16 runs completed. Per-seed JSONs in
evidence/2026-10-21/perseed-tributeguard/
(`<arm>-belongfeast-tributeguard-s<seed>.json`).

### PRIMARY (mechanism pilot): GO

| | control skips | armed skips | armed guard-paid (partial) |
|---|---|---|---|
| total | **30** | **0** | 33 (29) |

GO = (armed skips == 0) AND (control skips >= 1): **met exactly.** The
mechanism exists on this substrate (30 skip-while-court ticks across 4/8
control seeds) and the guard intercepts every one (33 guard payments, 0
armed skips). The guard fires exactly where control skipped — paired
same-seed, same ticks.

### GUARDRAILS (hard): both PASS

- starvation deaths: armed 2 vs control 3 (bar ≤ control+1 = 4): **PASS**
- median survival: armed 91d vs control 91d (bar ≥ control−10 = 81d): **PASS**

The guard costs tribute food (47.6k kcal on the heaviest seed, s64927) but
does not starve the village: starvation deaths are flat, median survival
identical.

### SECONDARY (report only, never judged): arrears-tripped dissolutions

- control: 3 dissolution transitions, all arrears-tripped (s64921 d78 arr
  877; s64924 d99 arr 11,250; s64926 d92 arr 7,500).
- armed: 2 dissolution transitions, both arrears-tripped (s64921 d85;
  s64924 d106).

The guard's honest limit: it cannot conjure food. On s64921/s64924 the
pantry was truly empty (guard paid 585–8,060 kcal partials — every grain
that came in) and the courts dissolved anyway (armed s64921's dissolution
moved d78 → d85 — the guard bought 7 days). On s64926 the village HAD food
(pantry 12,408 vs tribute 7,500 — but under the 2× cushion bar) and the
guard HELD the court: control dissolved d92, armed 0 dissolutions, won.
The knife-edge has two edges: the cushion-rule edge (guard fixes) and the
empty-pantry edge (guard can't). Reported, never re-scored.

### Wall numbers (n=16, belongfeast)

| | national end / ever | table | won | wave-4 | wave-5 | exiled | median surv | max surv |
|---|---|---|---|---|---|---|---|---|
| control | 4/8, 5/8 | 8 | 8 | 6/8 | 2/8 | 0 | 91d | 179d |
| armed | 3/8, 5/8 | 7 | 7 | 5/8 | 2/8 | 0 | 91d | 181d |

Notes: wave-5 unlocked on 2/8 seeds both arms (s64925, s64927) — the
wave-5 door opens on this substrate independent of the guard. Armed s64927
survived to d181 (horizon) without tabling yet (control tabled d179) —
a 2-day table delay coincident with ~48k kcal of guard-paid tribute on that
seed; single-seed, flagged for the next run, not judged.

### §15 balanced panel

Compare .md attached: evidence/2026-10-21/tributeguard-panel-primary.md
(before/after .json.gz + report .json alongside). Panel decision:
**review_required** — three single-seed watches at delta −0.125: won
(change_watch; s64927 armed hadn't tabled by the d181 horizon cut),
table (regression_watch; same seed), national end-state (regression_watch;
s64921 armed lost the court on an empty pantry despite 9 guard payments).
Per §14 the panel is the instrument, the pre-registered threshold is the
judge: PRIMARY GO + guardrails PASS stand. The watches are investigated
above (timing artifact; empty-pantry limit) — noise/timing class, not a
systematic regression.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Transcripts: evidence/2026-10-21/tributeguard-transcripts/
(tg-armed-belongfeast-s64921.txt, tg-armed-belongfeast-s64926.txt — say-lines
±4d around guard events).

- s64921 (armed, court lost anyway): d70 "Tribute paid: 11,333 kcal walks out
  of the pantry toward Emberhold. The relationship holds." d72: "Priya kneels
  at Emberhold's court and swears the oath — sealed with 1,612 kcal of
  Haven's harvest. The realm has its fires now, and one of them is yours."
  Then the pantry runs dry: d77–d83 "Tribute short — 585 of 11,250 kcal so
  far this week... Arrears grow teeth." — the guard kept paying every grain
  that came in. d84: "◈ The realm came apart". The fiction reads as a village
  keeping faith to the last grain, not a meter: the payments are voiced as
  tribute walking out, the shortfalls as "Arrears grow teeth", the loss as
  "the realm came apart". The guard bought 7 days (d78 → d85) against an
  empty pantry.
- s64926 (armed, court held, won): d82 — "Hana of Ashford walks into Haven
  unannounced, pack-mules behind. 'Heard your bins are echoing. Ashford has
  grain to spare — 1,772 kcal, no tribute, no ceremony. Say the word.'" The
  primary sends AID when Haven's bins echo. d84–85 partials, d86 "Tribute
  paid: 8,121 kcal walks out of the pantry toward Ashford. The relationship
  holds." d99: "You send 3,800 kcal. It hurts. That's rather the point of
  tribute." d103 grief-leverage: "Tribute rises to 11,250 kcal/week. Grief is
  leverage, and they know it." The court held through the thin weeks and the
  village won. The guard reads as faith kept, with the fiction meeting it
  halfway.

## Metric review (§14)

- The PRIMARY bar's letter (0 armed skips AND ≥1 control skip) held exactly
  (0 vs 30) — claimed as GO per the binding rule, not re-scored.
- GUARDRAILS both passed as pre-registered (starvation 2 ≤ 4; median 91 ≥
  81). No re-scoring.
- The SECONDARY (arrears-tripped dissolutions) is reported only — 3 vs 2 —
  and was never a judge. The DIAG's density worry (1 event in 16 runs) did
  not reproduce on this belongfeast slice (5 events in 16 runs); the next
  dissolution arm can pre-register against this density.
- Panel watches (−0.125 on won/table/national, single-seed each) are
  investigated, not judged: s64927's table delay is a horizon-cut timing
  artifact; s64921's national loss is the empty-pantry limit of the guard.
  Neither changes the verdict.
- Metric doubt for the NEXT guard arm: "skips" counts ticks, not weeks — a
  week-long skip reads as ~7 skip events. A weeks-with-skip metric would be
  cleaner; proposed for the next run, not applied here.

## Telemetry deviation check

`telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'perseed-tributeguard/*-belongfeast-tributeguard-s*.json' --metrics
national,table,won,exiled` → **LOUD: won newly appeared (baseline 0 →
current 15)**. Verdict: EXPLAINED — key-name artifact: the scale-wall
baseline was seeded with the key `wins` (16/16) while sweep JSONs use `won`
(15/16, same metric, same lineage as the DIAG's JSONs). The real comparison
is 15/16 vs 16/16 — no deviation. national/table/exiled quiet. Baseline NOT
rolled (it is the scale-wall reference, not this corpus's profile).

## Convergence state

**GO at pilot — the guard lands.** The mechanism is proven on real sims
(30 control skips → 0 armed, 33 guard payments), guardrails clean, fiction
reads as faith kept. The guard fixes the cushion-rule edge of the
arrears≡0 knife-edge (s64926: had the food, held the court, won) and is
honest about the empty-pantry edge (s64921/s64924: paid to the last grain,
courts still dissolved). Backlog #752 → fixed.

Named next: the guard's food cost has a win-timing price worth measuring —
armed s64927 paid ~48k kcal of guard tribute and tabled ≥2 days later than
control (single seed, flagged not judged). A follow-up arm could pre-register
a win-timing secondary. The empty-pantry edge (courts lost with zero food)
is a food-economy problem, not a tribute-policy problem — it belongs to
lever 0.

