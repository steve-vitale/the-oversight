# sim-gunholder-census-b — census of what loaded-gun holders do with their guns

**Status: COMPLETE (frozen prereg bars all pass). The census answers the
question it was asked.**

- Run: fleshout-loop-b-20261124T0630Z, axis winnability-chain, arm
  sim-gunholder-census-b.
- Branch: `sim-gunholder-b`, base master `60f6e7436`, prereg commit
  `2046eed3e`, instrument commit `621e06b60` (the pilot anchor),
  corpus commits `f9dafc991` (analysis + log) + `271e28626` (per-seed files).
- Prereg: `evidence/2026-11-24/sim-gunholder-census-b-prereg.md` (frozen
  ~07:10Z, before any judged run).
- Finding: sim-findings.md line 2725 `[claimed]` — TAKERS DON'T FIGHT
  (sim-rearm-witness-b NO-GO §11).
- Type: DIAGNOSTIC census — no game-code change, no lever, no
  before/after. Neutral recorder + analyzer on the rearm substrate.
- Pilot: 8 seeds 107750–107757, single leg MODE=arm, substrate
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 KILLBUNDLE=1 STAGE_SEAR=1
  REARM_CELLS=1`, horizon 150d death-aware, competent verbatim. ONE
  process, seeds sequential (no parallel drivers — the 2026-11-24
  ~04:22Z OOM kill is why).

## 1. The answer in one paragraph

A villager holding a loaded gun almost never gets to use it, and the
reasons stack in a clear order. Across 989 equipped-loaded
holder-days on 8 fresh seeds, the gun fired **zero times**. On 826 of
those days (83.5%) no fight touched the holder at all — no monster
came near them. When holders did lead a fight (138 led fights), it
was always wave 1–3, and the CELLGATE floor held fire every time
(59 hold-days). When holders did reach a wave-4 fight, it was only
ever as an ally (12 allied wave-4 fights on holder-days) — and
allies never get a volley, by construction: the opening volley reads
only the lead fighter's kit. In the whole pilot, **no holder led a
single wave-4 or wave-5 fight** (0/138), while the villages fought
58 wave-4+ fights around them. The takers don't fight because (1)
they are not where the fights are, (2) the fights they do lead are
below the wave-4 floor, and (3) the wave-4 fights they do reach put
them in a role that cannot fire. A new re-arm lever is not the next
step — the next step is a lever that puts the holder in the lead at
wave 4, or lets an ally fire.

## 2. Census table (frozen classes, prereg §6)

| seed | days | end | maxWave | standing | scale | holders | holder-days | fired | hold | no-cells | evaded | alrDead | other | ally | not-picked | no-fight |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 107750 | 45 | village-lost | 4 | 100 | village | 1 | 39 | 0 | 10 | 0 | 7 | 0 | 1 | 2 | 2 | 17 |
| 107751 | 152 | survived | 4 | 199 | regional | 3 | 322 | 0 | 10 | 0 | 6 | 0 | 1 | 1 | 4 | 300 |
| 107752 | 133 | village-lost | 4 | 199 | regional | 1 | 128 | 0 | 2 | 0 | 0 | 0 | 1 | 1 | 5 | 119 |
| 107753 | 151 | survived | 4 | 199 | regional | 2 | 104 | 0 | 9 | 0 | 17 | 0 | 1 | 4 | 9 | 64 |
| 107754 | 151 | survived | 4 | 199 | regional | 3 | 124 | 0 | 7 | 0 | 0 | 0 | 0 | 5 | 12 | 100 |
| 107755 | 151 | survived | 5 | 200 | regional | 1 | 101 | 0 | 3 | 0 | 0 | 0 | 1 | 4 | 4 | 89 |
| 107756 | 146 | village-lost | 4 | 150 | regional | 2 | 57 | 0 | 6 | 0 | 2 | 0 | 1 | 2 | 0 | 46 |
| 107757 | 115 | village-lost | 4 | 165 | regional | 2 | 114 | 0 | 12 | 0 | 3 | 0 | 1 | 3 | 4 | 91 |
| **LEG** | — | 4 survived / 4 lost | — | — | — | **15** | **989** | **0** | **59** | **0** | **35** | **0** | **7** | **22** | **40** | **826** |

Shares of 989 holder-days: fired 0.0%, led-cellgate-hold 6.0%,
led-no-cells 0.0%, led-evaded 3.5%, led-already-dead 0.0%,
led-other 0.7%, ally-no-fire 2.2%, not-picked 4.0%, no-fight 83.5%.
Unclassified: **0** (class counts sum to 989 exactly, per seed and
per leg). Carried-loaded days (gun in pack + pack cells > 0, not
equipped): 3 — the gun is essentially always in hand when loaded.

### Fights faced by wave (holders)

- **Led:** wave 1: 89, wave 2: 37, wave 3: 12, **wave 4: 0,
  wave 5: 0** — 138 led fights, none at wave 4+.
- **Allied:** wave 1: 5, wave 2: 5, wave 3: 9, **wave 4: 12**,
  wave 5: 0 — 31 allied fights, 12 at wave 4.
- All village fights by wave (942 total): w1 464, w2 297, w3 123,
  **w4 55, w5 3**. Wild fights (matched encounters): w4 51, w5 3.
  Non-wild (expedition / aid / contest / raid / sortie): w4 4.
- **Wave-4+ fights (58 total) — holder presence:** holder led 0,
  holder joined ally 15 instances, holder listed as an ally but
  never joined 7, holder a wild-node candidate but not in the
  fight 1, **no holder anywhere near 35**. In 60% of wave-4+
  fights, no gun-holder was even present.

### Holders (15)

| seed | holder | acquisition | holder-days | span | led (by wave) | allied (by wave) | fate |
|---|---|---|---|---|---|---|---|
| 107750 | gen_stjqoen | staged d7 | 39 | d7–45 | 28 (17/9/2) | 4 (2/0/2/0) | still-holding |
| 107751 | gen_09x1kzt | staged d9 | 142 | d9–151 | 22 (11/9/2) | 2 (0/1/1/0) | dead d54 'Big Ugly' |
| 107751 | gen_ccrpfc9 | contest-prize d64 | 85 | d65–150 | 0 | 0 | dead-gun-on-corpse d151 'the wild' |
| 107751 | ruth_goldstein | rearm-take:haven d54 | 95 | d55–150 | 1 (w3) | 0 | gun-lost |
| 107752 | elijah_scott | staged d5 | 128 | d5–133 | 3 (w1) | 1 (w4) | still-holding |
| 107753 | james_okonkwo | rearm-take:expedition d83 | 45 | d84–128 | 1 (w3) | 4 (w4) | dead-gun-on-corpse d129 'the wild' |
| 107753 | leo_martin | staged d10 | 59 | d10–68 | 36 (25/8/3) | 1 (w3) | dead d82 'the wild' |
| 107754 | gen_lq0e0m5 | staged d7 | 95 | d8–102 | 5 (3/2) | 7 (2/1/4/0) | dead-gun-on-corpse d133 'the wild' |
| 107754 | gen_pc7f25r | contest-prize d124 | 26 | d125–150 | 2 (w1) | 0 | still-holding |
| 107754 | zoltan_nagy | unknown (gun d131, cells d147) | 3 | d148–150 | 0 | 0 | still-holding |
| 107755 | gen_olsjsph | staged d11 | 101 | d11–111 | 5 (3/2) | 6 (w4) | dead d129 'the wild' |
| 107756 | gen_stv6af5 | staged d6 | 10 | d6–15 | 9 (7/2) | 2 (w2) | dead d108 'the wild' |
| 107756 | yara_haddad | contest-prize d79 | 47 | d80–126 | 3 (w1) | 1 (w4) | dead-gun-on-corpse d145 starvation |
| 107757 | gen_7xal8o9 | rearm-take:haven d44 | 3 | d45–47 | 0 | 0 | dead-gun-on-corpse d58 'the wild' |
| 107757 | gen_k57mu85 | staged d5 | 111 | d5–115 | 23 (15/5/3) | 3 (1/1/1/0) | dead d44 'The Static Kite' |

Rearm takes in the pilot: 4 (ruth_goldstein haven d54,
james_okonkwo expedition d83, zoltan_nagy haven d147 cells-only,
gen_7xal8o9 haven d44) — the re-arm path still works on this
substrate; the census is not re-judging it.

### The led-other 7 (defect tripwire — did not trip)

All seven are arrival-week, gun-not-in-hand-at-fight, wave 1,
outcome vKill: the holder fought with whatever was already in
hand (no ranged weapon, or a sling) on the day they gained the
gun, before it was equipped. No wave-4+ fight with cells > 0 and
shots 0 exists anywhere in the corpus — the volley machinery is
not misfiring; it is never reached at wave 4+.

### Scholar side table (not in the primary denominator)

The scholar held an equipped gun 118 days across the pilot and
fired 0 searcaster volleys — but the scholar never fights through
`fieldFight` (their fights are tactical, on the board), so the
census cannot speak to scholar gun use. Recorded, not counted.

## 3. Sense-test — four traces, end to end

### Ella Johnson (seed 107737, witness corpus — the known take)

Took the gun + 2 cells on day 73 from Sam Wilson's corpse, on
expedition. Held it loaded for 77 census days (d74–d150) and
**never led a single fight with any ranged weapon in 150 days** —
zero volley records of any kind, no kill-loot, no grants, no
prizes. She survived to day 150; her village survived, reached
wave 5, standing 430. Sam Wilson, the staged holder whose corpse
she took, led 24 searcaster fights before dying on day 73 — all
waves 1–3, all CELLGATE holds, 0 shots. Caveat, stated plainly:
the old corpus records no fight or encounter events, so it cannot
show whether Ella ever stood as an ally or a candidate — the
census instrument was built because that blindness existed. The
pilot's no-fight days are the same shape with full visibility.

### Wanjiru Kamau (seed 107741, witness corpus — the known take)

A working bow fighter before the take (volleys from day 6 to 95,
bow then apex bow, up to 105 damage in a fight). Took the gun + 2
cells on day 97 from Diana Osei's corpse, on expedition. Held it
loaded for 27 census days (d98–d124) and led exactly two
searcaster fights — day 102 vs a wave-2 giant mosquito, day 106
vs a wave-1 sunbasker — both CELLGATE holds (0 shots, 2 cells
kept). On day 124 the gun left her hands: the scholar is suddenly
scholar-equipped that day and her gun is gone from day 125, with
no grant, take, or kill-loot event behind the move. She died day
130 of sickness; her corpse still held a gun + 2 cells (a gun she
must have re-taken on day 130 itself, after the census — the
transfer path again, see §5). Her 33-day take-to-death span is 27
census days + 6 days the gun sat with the scholar, not with her.

### James Okonkwo (seed 107753, new — the expedition taker)

Took the gun + 2 cells on day 83 from Leo Martin's corpse, on
expedition — the witness channel working exactly as designed.
Held it loaded 45 days (d84–d128). He led one fight with it: day
111 vs a wave-3 Callback, CELLGATE hold (0 shots, 4 cells — he
had also won a contest-prize searcaster on day 108). He fought at
wave 4 **four times as an ally** on holder-days — day 90 vs a
Herald (vKill), day 97 vs The Eater (vFlee), day 105 vs The
Eulogy (vFlee), day 109 vs The Suburb (vKill) — the gun was
standing in a wave-4 fight four times, in hands the engine never
lets fire. (He had already been a wave-4 ally before the take,
day 78.) He died day 129 'the wild', gun on his corpse — supply
for the next taker, which nobody took.

### Leo Martin (seed 107753, new — the staged holder who fought most)

Staged arrival day 10. Held the gun loaded 59 days (d10–d68) and
led 36 fights — more than any other holder in the pilot — every
one wave 1–3 (25/8/3). Twenty-four of those 36 fights ended in
evade: he saw the beast in time and gave it room, 17 evaded days
in all. The rest were CELLGATE holds. He was a wild-node
candidate on 9 more days and never picked. On day 69 his gun was
suddenly the scholar's (see §5); he died day 82 'the wild',
gun-less. Leo is the purest form of the finding: the village's
most active fighter, holding the best weapon in the game for two
months, never once faced anything the gun is allowed to shoot.

## 4. Village assessment (plain words)

The villages look like the rearm-witness band's villages: four
survived to day 150, four were lost (days 45, 132, 146, 116). One
reached wave 5 (seed 107755, standing 200, faced The Editor).
Nobody won, nobody reached national, standing sat at 199 on five
seeds — the same scale wall. The guns circulated: 8 staged
arrivals, 3 contest prizes, 4 re-arm takes, 15 holders in all,
and the weapons kept moving — from holder to corpse to taker to
scholar — while never once firing. The most telling holder is
gen_ccrpfc9 (seed 107751): 85 loaded days, zero fights led, zero
fights allied, zero candidate days — she carried the village's
best weapon for nearly three months and the world never once
asked her to use it. The gun is not a weapon the village fights
with; it is an heirloom the village carries.

## 5. The unrecorded transfer (finding, not a chase)

Four times in the pilot, a living holder's gun moved to the
scholar overnight with no event behind it — Leo Martin (s107753,
day 69), gen_lq0e0m5 (s107754, day 103), gen_olsjsph (s107755,
day 112), yara_haddad (s107756, day 127). In every case the
village's total gun count stays 1 across the move: the holder's
equipped gun on day N is the scholar's equipped gun on day N+1.
Wanjiru's day-124 move in the witness band is the same shape
(fifth case). A sixth move runs villager-to-villager: on day 130
of seed 107754, gen_pc7f25r carried a second gun; on day 131
Zoltan Nagy is equipped with a dry gun that has no acquisition
event anywhere (no prize, no grant, no kill-loot, no rearm-take
with a gun — he later takes 1 cell via Haven rearm on day 147).
Some living-person gear transfer — a gift, a hand-over, a scholar
take — moves guns between people, and none of the census's wraps
(grant / kill-loot / rearm-take / corpse-take) sees it. It is
appended to sim-findings.md as a new open item; it is not chased
here (stay on axis).

## 6. Wall numbers (pilot, 8 seeds)

Wins 0/8. National 0/8 (scaleRank: regional 7, village 1).
Wave-5 unlocks 1/8 (s107755, standing 200). Wave-5 faced 1/8
(The Editor, s107755). Wave-4 reached 8/8. Median survival 148.5
gameDays (per-seed gameDays: 45, 152, 133, 151, 151, 151, 146,
115; village-lost 4/8). Table: not instrumented by this driver —
recorded as not instrumented, never faked. The scale wall stands
exactly where the witness band left it.

## 7. Bar-by-bar judgment (frozen prereg §7)

1. **Instrument validity — PASS.** Analyzer `--selftest` 25/25;
   `test-gunholder-census-b.js` 28/28; `--live` 30/30;
   `test-rearm-witness-b.js --live` 51/51 (lineage);
   `analyze-killlootbundle-a.js --selftest` 43/43 (lineage). 0
   instrument errors on all 8 pilot files; single anchor
   `621e06b60` + policySha throughout; `rearmPresent` true on
   every file; `rearmOn` true; 8 staged arrivals bundled
   (`klBundled == klArrivals == 8`, `klDry == 0`).
2. **Classification completeness — PASS.** 989/989 holder-days
   classified, 0 unclassified, class sums exact per seed and per
   leg.
3. **Supply floor — PASS.** 989 equipped-loaded holder-days ≥ 60
   (16× the floor).
4. **Sense-test delivered — PASS.** Ella + Wanjiru read end to end
   from the witness corpora (§3) and two new holder traces
   (James Okonkwo, Leo Martin) read end to end from the pilot.
5. **Wall numbers recorded — PASS** (§6; table not instrumented,
   said so).
6. **No game-code change — PASS.** Zero src/js diffs
   (`git diff --stat HEAD -- src/js` empty at corpus validation;
   test `--dir-arm` asserts it). The census is a driver-side
   recorder only.

**Verdict: COMPLETE.** The census distribution is the deliverable:
no-fight 83.5% / led-cellgate-hold 6.0% / not-picked 4.0% /
led-evaded 3.5% / ally-no-fire 2.2% / led-other 0.7% / fired 0.0%.
Per the frozen reading rule, the dominant class names the next
lever: encounter supply binds first (holders are not where the
fights are), the lead-only volley binds second (holders reach
wave 4 only as allies), the CELLGATE floor binds third (the
fights they do lead are below wave 4).

## 8. Metric review (§14 — no in-run re-scoring)

- Every metric above is the frozen prereg §7 metric, judged by
  `analyze-gunholder-census-b.js --dir` (verdict field: COMPLETE)
  plus `test-gunholder-census-b.js --dir-arm` (PASS). No metric
  was re-scored or swapped mid-run.
- `days` vs `gameDays`: survival is judged on `gameDays` (same
  field rearm-b / rearm-witness-b used); the raw per-seed `days`
  field can read up to 8 days higher. Consistent across the band.
- The `led-other` class worked as designed: it caught only
  arrival-week timing artifacts (7/7 gun-not-in-hand, wave 1),
  never a wave-4+ misfire — the tripwire is live and did not trip.
- Instrument gap, recorded not hidden: the transfer detector
  flags living-holder gun moves with no event (§5) — six moves
  across the two corpora have no mechanism in any wrap. A future
  arm that wants custody to close needs a wrap on the
  living-person transfer path (gift / hand-over / scholar take),
  once that path is identified in code.
- The scholar side table is thin by design: the scholar holds a
  gun 118 days and fires 0 fieldFight volleys because the scholar
  never fights through `fieldFight`. Any claim about scholar gun
  use needs the tactical engine, not this census.
- Note on the `no-fight` reading: a holder-day is a census day
  with no fight touching the holder. It does not distinguish "no
  monster anywhere near" from "monster nearby, holder not
  involved" — the `not-picked` class carries the second case
  (40 days). The 826 no-fight days are days the holder's gun
  simply had nothing to do.

## 9. Balanced panel (§15)

**INAPPLICABLE — pure diagnostic, no before/after change exists
to compare.** No panel built, no compare run; stated explicitly
per the frozen prereg §7 so the absence is a design fact, not an
omission.

## 10. Files

- Prereg: `evidence/2026-11-24/sim-gunholder-census-b-prereg.md`
  (commit `2046eed3e`)
- Instrument: `scripts/gunholder-census-driver-b.js`,
  `scripts/analyze-gunholder-census-b.js`,
  `scripts/test-gunholder-census-b.js` (commit `621e06b60`)
- Evidence (this file): `evidence/2026-11-24/sim-gunholder-census-b.md`
- Pilot corpora (8 files):
  `evidence/2026-11-24/perseed-gunholder-census-b/` (commit
  `271e28626`)
- Analysis: `evidence/2026-11-24/gunholder-census-b-analysis.json`
  + leg log `evidence/2026-11-24/gunholder-census-b-legs-pilot.log`
  (commit `f9dafc991`)
- Fixture corpora (repro only, not judged):
  `evidence/2026-11-21/perseed-rearm-witness-b-arm/`
  (s107737 Ella, s107741 Wanjiru)

## 11. Infra notes (closeout only)

- `check.js --quick` on this base: 338 passed, 6 failed in 998s
  — identical to the standing gate recorded in the 0215Z adoption
  closeout ("gate 338/6 0 attributable"); the 3 visible failures
  are 120s timeouts on slow godpath tests under load
  (test-trust-observer-neutrality, test-one-person-army-deed-attainment,
  test-living-garden-deed-attainment). Zero src/js diffs in this
  arm, so nothing here is attributable to the census. A re-run
  under idle load can confirm; not a blocker.
- The runtime restarted once mid-run (~07:2xZ), killing an
  in-flight `check.js --quick` (no result; re-ran cleanly after).
  The pilot driver ran detached (`setsid nohup`) and survived.
- Heartbeat: one attempt failed on a registry lock held > 120s
  (~07:47Z, "retry later"); retried successfully ~07:56Z.
- `safe-commit.sh` does NOT accept directory paths (AGENTS.md
  lesson, re-learned the hard way: the first corpus commit took
  only the 2 files; the 8 per-seed files needed an expanded file
  list in a second commit). The main-index clobber struck on 3 of
  4 commits in this arm; repaired each time with the `git ls-tree
  HEAD -r | git update-index --add --index-info` pipe, tree
  verified clean after every repair.
- Sim-findings: line 2725 marked `fixed` on this commit (the
  census IS the next step the entry asked for); the unrecorded
  living-holder transfer path (§5) appended as a new open item.
