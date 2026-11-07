# Journey-scale r107 — run note

Lane A leg 3 SCALE (days 80–140), run `laneA-20261107T1045Z`. Base master
`38aa62dce` (includes the r113 deepening merge, landed earlier this run).
Rotation 3 → 0 at closeout.

## Pre-registration (committed before any scored seed)

**Q1 (PRIMARY, binding): Does the scale-leg competent player ever ask?**
Fresh evidence (sim-regionalstep-b, landed 2026-11-07 as 6a59ed7fe) showed
that on the STAGED policy (band 53001–53008) scale never leaves `village`
because nobody ever asks: villages known d3–5, courtship-ready the same
day, would accept outright from ~d9, yet `proposeLink` called 0 times on
all 8 seeds; 931/940 no-regional days courtship-no-attempt (99.0%). This
run tests whether the same failure reproduces on the SCALE driver
(r106 clone, policy `scalecourt-nogate-morntrace3` UNCHANGED, control
shape TEND_PEER=0, FILL_ARM=0), with the regionalstep recorder attached
(`scripts/regionalstep-instrument-20261107.js`, required — not a copy).
Fresh band 97001–97004, DAYCAP=180, death-aware. Every no-regional day
classified by first failing gate with the shared `classifyGate` rule.

Verdicts, in order: **ASK-HAPPENS** (proposeCalls ≥ 1 on ≥ 1 seed → name
downstream gate + whether Dawn fired); **CONFIRMED** (courtship-no-attempt
≥ 80% of no-regional days band-wide AND proposeCalls = 0 on every seed
that ever had a courtship-ready village); **GAME-GAP** (known-no-courtship
dominates).

Secondaries (report-only): national/global staging (natGate), table
approach (tableWatch), village assessment in plain words, people check
(CONVO_DAYS [90, 120] transcripts read in full), D-THING/bonds/betrayals.
Purity guard: recorder must not change the played game.

Gate note (carried, not hidden): full `check.js --quick` will NOT run
inside this run — the r113 gate (276/14, all adjudicated pre-existing/load)
ran on this exact master ~30 min earlier and this run changes ZERO src/js
(scripts + evidence only). Gate owed on the next run that touches src/js;
r107 proof tests + pilot evidence are the regression cover, as for
regionalstep-b.

Commits: prereg+driver+analyzer+proof `1c43a064a`. Proof test
`scripts/test-journey-scale-r107-reggate-20261107.js` **43/43 green**.

## Q1 verdict: ASK-HAPPENS

The regionalstep diagnosis does **not** reproduce on the scale driver. The
ask fires on the first eligible day, on every seed, and the Dawn follows.

Pooled (4 seeds, 346 reggate rows, 172 no-regional days):

| gate | days | share of no-regional |
|---|---|---|
| no-known-village | 4 | 2.3% |
| courtship-no-attempt | 84 | 48.8% |
| link-young | 80 | 46.5% |
| seasoned-no-dawn | 4 | 2.3% |
| regional (Dawn fired) | 174 | — |

Timeline — **identical on all 4 seeds**: known d4, courtship-ready d4,
attempt d25, link d25, accord d26, regional (Dawn) d47. The 21
courtship-no-attempt days per seed are days 4–24: the policy's own
day-25 pacing rule, not a missed ask — the ask fires the first day it is
allowed to. proposeCalls: 1, 1, 1, 2 (97004 asked again on d132, the day
before the village ended, after its first link broke). Links ever formed:
8 (3+1+2+2); the first link was accepted outright on every seed
(answerAccord d26, gift accepted). 97001 went on to covenant: propose
d89 → link, propose d90 → counter, answer d91 → accept → link.

Downstream gates after the ask: link-young (80 pooled days) is the 21-day
seasoning wait, by design. Then the binding gate is **survival, not the
ask**: no link ever reaches the national bar (30 days seasoned + trust
40) because the villages end first. natGate: firstQual {} on all 4 seeds;
RUNG (waiting for the 30-day regional rung) then NO-SHAPE (rung ready, no
qualifying polity: leadSeasoned 0, covSeasoned 0 on every seed).
**National 0/4, global 0/4.**

## Village assessment (plain words)

Four villages, four short lives. Every one reached regional standing —
the scale ladder's first rung works — and then died before it could climb.

- **97001** (ended d93, one person left): reached regional d47, built
  three links (one lead, two covenant), tribute grain arrived three times
  from Emberhold. The table priced a lesser seat on d56 and waited. Then
  the pantry hit zero and stayed there; four hungry days in a row and the
  village scattered, leaving only the scholar.
- **97002** (ended d54, five alive): the shortest life. Regional d47, one
  link, then the same hunger scatter at four hungry days — four villagers
  starved outright along the way.
- **97003** (ended d79, one person left): regional d47, two links, but the
  scholar spent the village's days on the road — 24 pilgrimages and 22
  codex studies chasing the courtship climb — while the pantry emptied
  and the roster thinned to one.
- **97004** (ended d133, nobody left): the longest life, regional d47 with
  84 regional days, a second link asked for on d132 — and then the
  scholar, Nora, and Nino all died in the wild on d131–133. The village
  didn't starve; it walked out into the wild and didn't come back.

What they knew: counters were learned and shared (the Swarm Hum bellow
trick on three seeds, the Resonant Croak on 97003). What was missing:
food, and time. The scale leg's wall on this band is not the ask and not
the ladder — it is keeping a village alive long enough for a link to
season into national standing. No full seat, no wave-5 content faced, no
kill claimed in the scale line — the wall from r105/r106 stands.

Table approach: only 97001 got there (lesser seat d56, waiting, never
sat — the village scattered d93). The other three never priced a seat.
Viewership in the 40s on 97001. The First Court never appeared on any
seed (firstCourtDay None ×4; courtPoorDays 40/12/24/65) — a panel
observation, not a bug claim; the court stayed poor throughout.

## People check

Two transcripts exist (only 97004 lived past day 90; the other villages
had nobody talkable left on their CONVO_DAYS). Both read in full.

- **Day 90, Bishoy** (radio DJ, trust 90): talks about the family he
  left behind — keeps them in his head like a photograph, building a
  chosen family here. His ask for a favour stays open while the scholar
  listens and leaves. Coherent, human, ends with an honest "Don't be a
  stranger."
- **Day 120, Luis** (mason, trust 90): grieving, hands idle. The scholar
  accepts his invitation ("All right. Let's go."), gets a kept tool in
  return, comforts him, and the gossip carries real village news — Nora
  won Siege on the cameras, Nino out for water. Ends "Thanks. I just...
  need some air."

**0 senseless sittings.** Both villagers want something (a favour, comfort),
the options engage or deflect it, the endings resolve or leave an honest
debt. No fabricated shared history, no filler loops.

## Blanks filled / documented

- **Blank documented (not fixed this run): the villagers' link raises all
  die unanswered.** Villagers raised link ideas on every seed (3–5 raises
  each) and **all 16 expired** — 0 accepted, 0 declined, 1 still pending
  when 97002 ended. The game stages the raises; the scale driver never
  answers them. Same class as r113's Q1 before-panel (driver-side, not
  game-side): a fix would teach the scale driver to answer live link
  raises first, as r113 did for sittings. Candidate for the next scale
  run — this run was measurement-only by prereg.
- **Console-line nit (noted, not fixed):** the per-seed console line
  prints `proposed=0` while the census and recorder both count the real
  proposals (1, 1, 1, 2). It prints `ctx.proposedLead`, which the policy
  never sets; the policy sets `ctx.proposed`. Display-only; the R107
  SUMMARY lines and the census carry the right numbers.

## Metric review

Q1 bound the run and the metric proved the right instrument: proposeCalls
+ the courtship-no-attempt share cleanly separated the ask question from
the seasoning/survival question, and the identical d4/d25/d47 timeline
across all 4 seeds makes the verdict robust at n=4. No revision proposed,
but a note for the next run: the day-25 rule guarantees ~21
courtship-no-attempt days on this policy, so a future cross-policy
comparison should use "days after day 25 with a courtship-ready village
and no attempt" as the no-ask share, not the raw share.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
`hidden_files/telemetry-baselines/scale.json` (metrics firstCourt,
watchers, tableTele, fightsTotal, fightsByWave.4, maxGameDay), run against
the r107 regional JSONs, printed LOUD "disappeared" lines (fightsTotal
90→0, fightsByWave.4 3→0, maxGameDay 880→0). Investigated: **shape
artifact, not a real deviation.** The scale baseline was seeded from an
old aggregate shape (same caveat as r93–r106); this run's per-seed files
don't carry those metrics in resolvable form (the regional JSONs are the
reggate corpus; the trust JSONs carry the census under `census.*`). The
baseline was **not** rolled forward from these files — rolling it forward
would zero out real metrics. Honest comparison from the census itself:
regional 4/4, national 0/4, global 0/4, maxWave 3–4, networkLiveDay 46
on all 4 seeds — consistent with r105/r106, no overturning deviation.

## Regression

No full `check.js --quick` this run (see gate note in the prereg). r113's
gate ran on this exact master ~30 min before the pilot (276/14, all
adjudicated pre-existing/load); r107 changes zero src/js. Proof test
43/43 green + pilot evidence (0 instrument errors on all 4 seeds) are the
regression cover.

## Commits

- `1c43a064a` — prereg + driver + analyzer + proof test (43/43)
- (this commit) — run note + analysis + pilot log

## Closeout

- Merged locally, pending ship (no bump, no push, no live verification —
  the ship loop owns those).
- Rotation 3 → 0 written at closeout.
- Stale-lock recovery of r113 (laneA-20261107T0845Z) performed at run
  start; see the r113 recovery paragraphs in the r113 run note (merged as
  `38aa62dce` earlier this run).
