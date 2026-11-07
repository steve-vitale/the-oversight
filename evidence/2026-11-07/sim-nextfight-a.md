# sim-nextfight-a — VETERAN'S EDGE (shape 2) — NO-GO (median 9d < 14d; TB share 87.5% ≥ 50%)

**Arm:** sim-nextfight-a (run fleshout-20261107T0515Z, Loop A, axis
scale-onramp / winnability chain, tracker blank #3: killer survivorship).
**Verdict: NO-GO.** The edge is real and fires, and it chains kills on
one seed — but the pilot misses BOTH pre-registered bars by a wide
margin, so per the kill rule it is killed fast: no re-run, no re-score.
The build is reverted in this branch (revert commit follows this
evidence file); the measurement record lands, the lever does not.
**Prereg:** `evidence/2026-11-07/sim-nextfight-a-prereg.md` (committed
c969b1840 before any judged work) · **Build:** commit 5b7d847d0
(reverted after the pilot per the kill rule; the proof test lived there)
· **Corpus:** `evidence/2026-11-07/perseed-nextfight-a/` (8 files, 0
instrument errors) · **Analysis:**
`evidence/2026-11-07/nextfight-a-analysis.json` (killersurvive-b analyzer
verbatim) · **Proof:** `scripts/test-nextfight-a-20261107.js` **38/38
green** (17 red on base — the edge assertions all fail without the
build).

## The one-line result, plainly

A wave-4 killer who brings a 50%-harder hit into their next big fight
lives about nine days instead of five and a half — a real improvement,
but nowhere near the fourteen the pilot demanded, and they still die in
a turn-based fight almost every time. The edge wins the next fight and
then it is gone; the killer who survives it walks into the fight after
that with nothing. One village chained the edge into ten kills and a
living killer, which proves the shape can work — but across eight
villages it did not move the middle of the distribution.

## Before / after (identical seeds 99689–99696, 150d death-aware, competent verbatim)

| Metric | Baseline (killersurvive-b confirm) | Armed (this pilot) | Bar | Verdict |
|---|---|---|---|---|
| Killers / dead | 10 / 10 | 9 / 8 (+1 living) | — | — |
| **Median kill→death (PRIMARY a)** | **5.5d** | **9d** | **≥ 14d** | **MISS** |
| **TB-fight share of deaths (PRIMARY b)** | **9/10 = 90%** | **7/8 = 87.5%** | **< 50%** | **MISS** |
| Kill→death days (dead) | 1, 1, 1, 3, 5, 6, 8, 9, 9, 12 | 1, 1, 5, 8, 10, 12, 18, 19 | — | — |
| Death-fight monster HP left (median) | 53% | 56% | — | barely moved |
| Wave-4 kills (log) | 11 | 18 | — | +7 |
| Wave-4 unlocks | 8/8 | 8/8 | — | — |
| Wave-5 unlocks / kills | 0/8 / 0 | 1/8 / 0 | — | 99689 opened w5 |
| Median survival (guard ≥ 89.6d) | 112d | 120d | ≥ 89.6d | HOLDS |
| Starvation deaths (guard ≤ 2) | 0 | 0 | ≤ 2 | HOLDS |
| Starvation deaths among killers | 0 | 0 | ≤ 2 | HOLDS |
| National / table / wins | 0 / 0 / 0 | 0 / 0 / 0 | — | — |
| Instrument errors / unmatched | 0 / 0 | 0 / 0 | — | — |

Per-seed: 99689 140d lost → **150d survived**, standing 199 → **380**,
maxWave 4 → **5**, w4 kills 2 → 3 · 99690 identical (72d, 0 kills) ·
99691 identical (84d, 1 kill) · 99692 105d → 121d, kills 3 → 2 ·
99693 identical (61d, 1 kill) · 99694 identical (119d, 1 kill) ·
99695 identical (128d, 0 kills) · 99696 150d survived, kills 3 → **10**,
standing 199. Four seeds are byte-identical to baseline on days/kills/
standing (the edge never fired there, or fired with no downstream
effect); two diverged strongly (99689, 99696); 99692 diverged mildly.
Zero src/ drift between the baseline anchor (7c68449f4) and this pilot's
base (41007b9d4), so every difference is the edge alone.

## The lever as built (shape 2 — VETERAN'S EDGE)

`recordWaveKill` arms `state.veteranEdge[killerVid]` on any wave-4+ kill
(player TB, companion, field, contest); `startCombat` claims armed
edges onto the fight object when the monster is wave 4+ (wave 1–3
fights claim nothing, so the edge waits); `tbDamage` multiplies the
claimed fighter's own blows ×1.5 against wave-4+ monsters for the whole
of that one fight, with one honest say line per fighter per fight.
No rounds-cap change, no armor-ignoring hits, no first-kill effect (the
kill is recorded at the end of the killing fight, so no strike inside it
can read an edge), no gate/price/deed/readiness change. Field fights are
out of scope (they do not run through `tbDamage`). Proof 38/38 on real
fights: arm/claim/spend/re-arm, wave-3/2 non-claim, companion's own
strikes ×1.5, first-kill guard (no edge before any kill).

## Why it missed — the edge fired, and still did not move the middle

The edge fired on 6 fight-days across 4 seeds (say-line days: 99689
d126 + d144, 99691 d69, 99692 d83 + d94, 99696 d104) and never on the
other four seeds. Per-killer, armed leg vs the same killer on baseline:

| Killer | Armed k2d / death fight | Baseline k2d / death fight | What happened |
|---|---|---|---|
| carlos_diaz 99689 | 19d, reunion 7r/76% | 3d, eulogy 6r/10% | Edge WON his next fight (d126 eulogy, won) — then he died in the fight AFTER, unprotected. The one-shot limit, seen live. |
| app_mgpsphh4424 99689 (wild kill) | 8d, eater 9r/26% | — (no such killer) | New villager killer; edge fired d144, beast at 26% — closest to a flip, still lost. |
| farid_ahmed 99691 | 1d, reunion 5r/95% | 1d, reunion 5r/96% | Edge FIRED in the death fight (d69 line) and changed nothing: a whiff fight. ×1.5 of ~nothing is ~nothing. |
| gen_s571hf7 99692 (companion) | 18d, influencer 9r/47% | 18d, influencer 9r/53% | Edge fired (d83) but the companion's own blows are a small share of the side's damage: 53% → 47%. |
| gen_sookgbd 99692 | 10d, reunion 7r/62% | 9d, algorithm 11r/31% | Edge fired (d94); different death fight, same ending. |
| gen_lcp47we 99693 | 1d, fallen: a stranger | 1d, fallen: a stranger | Identical. No TB fight involved — the edge cannot touch it. |
| rosa_mendez 99694 (companion) | 5d, buffering 96r/22% | 5d, buffering 96r/22% | Identical. A wave-3 stall death — outside the edge's wave-4+ gate by design. |
| stan_kowalski 99696 | 12d, reunion 12r/56% | 12d, reunion 12r/62% | Edge fired (d104) — and the beast only moved 62% → 56%. His one refight was a wave-2 statickite (no claim), so the edge was intact for the death fight and still did not flip it. |
| benoit_lambert 99696 | ALIVE at 150d | 8d, eulogy 6r/18% | The chaining shape: killed a Strike d116, then 9 more wave-4 kills (suburb, algorithm, suburb, eulogy ×2, eater, reunion ×2) and lived. Every kill re-armed the next fight. |

Four distinct reasons the median stayed at 9d: **(1) one-shot** — the
edge covers the next fight only, and killers who survive it die in the
fight after (carlos is the clean case: +16 days, then dead unprotected);
**(2) small share** — a companion killer's own blows are a fraction of
the side's damage, so their edge barely moves the total (gen_s571hf7:
6 points); **(3) whiff fights** — the edge multiplies damage dealt, and
in a fight where the killer barely lands a blow there is nothing to
multiply (farid: 95% HP left with the edge on); **(4) out-of-gate
deaths** — a stranger (no fight) and the wave-3 stall (rosa, 96 rounds)
are untouched by construction. The Reunion is still the commonest killer
of killers (4 of the 7 armed TB deaths). The death-fight HP-left median
barely moved (53% → 56%) because most death fights are ones where the
edge was already spent, was small-share, or had nothing to multiply —
the sizing arithmetic assumed the edge would be live IN the death fight
at full side share, and on this band it usually was not.

## What did move (real, but not the bars)

- Wave-4 kills 11 → 18 (+64%), driven by benoit's 9-kill chain on 99696
  and carlos's extra life on 99689. The edge compounds when it chains:
  each kill re-arms the next fight.
- 99689 reached wave 5 (standing 380, maxWave 5) — the first wave-5
  unlock on this band (baseline 0/8). No wave-5 kills yet.
- One living killer at the horizon (benoit) vs zero on baseline; median
  survival 112d → 120d. No village banked two living killers and sat.

## Sense-test read

**Carlos Diaz (99689) — the edge, won and spent.** d126 the System line
fires mid-fight — "VETERAN'S EDGE ×1.5: you've killed one of these
before — this time you know where to cut." — and he wins the eulogy
fight. Sixteen days later he dies to a Reunion, and the fiction says
nothing about any of it: "📖 The Codex turns a page on its own. Carlos
Diaz is dead. You didn't ask. It knew." / "🕯️ Carlos Diaz is dead — the
wild. The village stops. Somebody screams. Somebody else starts
digging." The kill got a camera line when it happened; the edge got one
line in the fight it won; the death is the same boilerplate as every
death. The killer's story is still invisible at the moment that matters
— the invisibility blank killersurvive-b filed, unchanged.

**Benoit Lambert (99696) — the chain.** Nine wave-4 kills in thirty
days, each one celebrated on camera ("Benoit just put down Ad Break...
on CAMERA. That's a veteran kill, folks. REMEMBER the name." — the
camera calls wave-3 kills veteran kills too, a pre-existing wording
looseness in the companionKillBeat's wave≥3 gate). He is alive at the
horizon with 16 refights behind him. It reads as a person becoming the
village's killer, one fight at a time — the first time a killer's arc
has read as a career rather than a single week. The village still cannot
climb: standing 199, village rank, no road to the table.

## Wall numbers (national / table / wins, wave 4–5, median survival)

| Leg | Seeds | Median days | End | W4 kills | W5 kills | W4 unlock | W5 unlock | National | Table | Wins |
|---|---|---|---|---|---|---|---|---|---|---|
| Baseline | 8 | 112d | 7/8 lost | 11 | 0 | 8/8 | 0/8 | 0 | 0 | 0 |
| Armed | 8 | 120d | 6/8 lost | 18 | 0 | 8/8 | 1/8 | 0 | 0 | 0 |

No village banks two living wave-4 killers and sits; the full seat is
still unreached; wins are 0 on both legs.

## Metric review (§14)

Pre-registered metrics bind this run (prereg c969b1840). Primary: median
kill→death ≥ 14d AND TB-fight share < 50% on the pilot band. Both miss
(9d; 87.5%) — **NO-GO, no re-score, no re-run.** Guards hold (starvation
0 ≤ 2 both counts; median 120d ≥ 89.6d), but guards do not rescue a
primary miss.
- **One judgment call, recorded:** the analyzer's median counts dead
  killers only; benoit (alive at the horizon) is censored out of it, the
  same way the baseline method treats its living killers. Counting him
  as 34d (kill d116 → horizon 150d) would lift the median to 10d — still
  far short of 14d, so the verdict does not turn on the convention.
- **Balanced panel (§15):** no separate balance-panel run is attached.
  The prereg named the killer census analyzer on identical seeds as the
  judge, and both legs ran through it verbatim (same driver, same
  instrument, same policy, zero src/ drift between legs). The panel
  driver runs its own sims; it cannot re-derive a per-killer census from
  recorder corpora. Recorded as a method note, not a gap filled by
  assertion.
- **Telemetry:** `telemetry-check.js` first refused the recorder corpus
  (same refusal as killersurvive-b), then with `--allow-recorder-corpus`
  fired LOUD: national 12 → 0, table 16 → 0, wins 16 → 0. Investigated:
  the scale-wall baseline's `_regime` is "winseat — full win-side win
  stack, ~100%-win suite" and carries the note "DO NOT compare pre-seat
  / courtship / readiness substrates against this baseline — wins are
  structurally ~0 there and telemetry-check will fire a spurious LOUD
  'wins disappeared'." This pilot (like its before leg, which fires the
  identical LOUD lines) is a competent-policy pre-seat substrate with
  wins structurally 0. **Explained regime artifact, not a regression.**
  Baseline NOT rolled forward.
- **Proof-test note:** the proof (38/38, 17 red on base) measured the
  multiplier exactly (×1.5 on claimed strikes, ×1.0 without) in live
  fights. The pilot's shortfall is therefore not a broken hook — it is
  the shape: one-shot, per-killer share, and whiff/stall/out-of-gate
  deaths bound what a damage multiplier can do on this band.

## What this arm does NOT claim

- Not a first-kill change: the edge arms only after a recorded wave-4+
  kill; first-kill fights are untouched (proof section 2/3 guard it).
- Not a party fix: the edge is per-killer damage, not company.
- Not a Reunion counter: Reunion deaths persist (4/7 armed TB deaths).
- Not a win: 0 wins on both legs; no wave-5 kills; no national.
- Not a field-fight lever: villager field fights never see the edge.

## Findings for the backlog

- ONE-SHOT EDGE LIMIT (open — this arm's NO-GO mechanism): the edge
  covers the next wave-4 fight only; a killer who survives it dies in
  the fight after (carlos_diaz 99689: +16d, then dead unprotected).
  A persistent or per-kill-refreshing veteran bonus is a different
  shape from the one-shot pilot and needs its own prereg, not a
  re-score of this one. (Filed in sim-findings.md.)
- COMPANION DAMAGE SHARE (open): a companion killer's own blows are a
  small share of the side's damage, so a per-killer damage edge barely
  moves their death fights (gen_s571hf7: 53% → 47%). Any veteran lever
  aimed at companion killers must reach the side's damage, not just
  the killer's own. (Filed in sim-findings.md.)
- (Not re-filed: killer-death invisibility — killersurvive-b holds it;
  the 96-round stall — killersurvive-b holds it; the arena venue —
  killersurvive-b holds it.)

## Proof and commits

- Proof `scripts/test-nextfight-a-20261107.js`: **38/38 green**
  (17 red on base: every edge assertion fails without the build; the
  no-edge baselines pass on both). The proof caught nothing post-build —
  the build was green first run.
- Prereg committed c969b1840 before any judged work (safe-commit index
  clobber hit; repaired via HEAD-blob cacheinfo, hashes verified).
- Build committed 5b7d847d0 (safe-commit index clobber hit again;
  repaired the same way). Pilot anchor is the build commit.
- `node scripts/check.js --quick`: **282 passed, 8 failed** — the exact
  standing pre-existing profile (godpath test-measurement-proof-update,
  test-measurement-workflow, test-mobile-combat-cadence,
  test-occupation-panels, test-phone-frame-proof,
  test-trust-observer-neutrality [120s timeout],
  test-capable-bot-20261014 [120s timeout],
  test-establishment-r20-fixes-20261020). The cadence failure was
  re-verified on base code (same 13/2, same 2 assertions) — pre-existing,
  unrelated: the tbDamage hook is inert without an armed edge and the
  test never arms one.
- Worktree contains only committed work at closeout; the build commit is
  reverted after this evidence file (kill rule) and the branch is NOT
  ready to merge as a lever — the measurement (prereg + evidence +
  corpus + analysis) is the landing, the code is not. No push, no version
  bump, no live verification (coordinator owns the merge).
- **Rebase note:** the branch was rebased onto master dab55c696 after
  the pilot (sibling vetkilltale-a landed in between). Commit hashes
  renumbered: prereg c969b1840 → 9d8e8b9a6, build 5b7d847d0 →
  338584348, evidence 91a21b7a8 → 5f6c8a02e, revert aeba74e8e →
  d1c6049ba. The per-seed corpus files still record the pre-rebase build
  hash (5b7d847d0) as their anchorCommit — that is the commit the pilot
  actually ran at; the rebased build commit (338584348) is byte-identical
  in content. Net src/ change on the branch after the revert: zero.

## Convergence

**scale-onramp: converging, NOT converged.** The next fight is still
where killers die (TB share 87.5%), but the pilot proved two things the
census only sized: a damage edge CAN win the next fight and CAN chain
into a living killer with nine more kills — and a one-shot damage edge
cannot move the middle of the distribution, because the killer who
survives the next fight dies in the one after, the companion's share is
small, and whiff/stall/stranger deaths never touch it. The binding
problem is now narrower: killer survivorship needs something that
PERSISTS past one fight, or that reaches the whole side's damage, or
that addresses the whiff/stall deaths — not a bigger one-shot number.
No village banks two living wave-4 killers and sits; the full seat is
still unreached; wins are 0 everywhere on judged corpora.
