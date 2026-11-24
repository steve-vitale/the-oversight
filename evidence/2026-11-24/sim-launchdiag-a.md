# sim-launchdiag-a — EVIDENCE (frozen prereg judged)

**Arm:** sim-launchdiag-a · **Loop A run:** fleshout-20261124T0215Z
(ADOPTION of the dead run fleshout-20261123T2315Z)
**Axis:** scale-onramp · **Type:** DIAGNOSTIC — instrument only, zero
`src/js` changes
**Base:** `7344d8a56` (branch `sim-launchdiag-a`; fast-forwarded from
`f5d2c3caa`, zero own commits, verified clean before the move)
**Prereg:** `evidence/2026-11-24/sim-launchdiag-a-prereg.md` (commit
`cdf789b47`, frozen 2026-11-24 ~02:45 UTC, + Amendment 1 committed
with the (1a) instrument as `ed4f7f50d`, before any judged run)

## 0. Adoption note (inherited state, verified)

The dead run's worker never committed anything: the tree was clean at
`f5d2c3caa` with zero branch commits, verified by `git status` (empty)
and `git log` at run start. The branch was fast-forwarded onto local
master `7344d8a56` (remote master is `f5d2c3caa`; local master sits
ahead of origin with landings pending ship — the normal state). The
`safe-commit.sh` index clobber (AGENTS.md, known class) struck on all
three commits in this run; each was repaired with the documented pipe
(`git ls-tree HEAD -r -- <dirs> | git update-index --add
--index-info`) and verified (`git status` empty, `git diff HEAD`
empty, blob hash matches HEAD). All three commits are intact.

## Verdicts

- **(1a) pick-early-return delay-vs-wall: DIAG-GO.** 14/14 days
  named, 0 unclassified. **DELAY 11, WALL 3 — the dawn body gate is a
  one-day deferral, not a wall.** In 11 of 14 cases the holder is
  asked the very next day; the 3 WALL cases all resolve within 2 days
  (first scored day D+2 in every case). The longest silence after a
  pick-early-return day on this band is 2 days.
- **(1b) corpseloot — Omar's corpse thread: DIAG-GO.** 2,376
  corpse-takes censused, 0 unclassified; fixture matrix F1–F8 all
  behave as the prereg predicted (60/60 checks). **Villagers never
  loot a scholar's or wild corpse except through the two REARM-gated
  channels — a witness at death-time, or the Haven sweep after the
  village brings the body home — and only for gun + cells. With
  REARM off (the shipped default) villagers loot nothing at all.**

---

# Sub-arm (1a) — pick-early-return delay-vs-wall

## 1. The answer in one paragraph

The 14 pick-early-return days are a hunger story with a one-day
horizon. On 11 of the 14, the holder — picked to eat (or seek) instead
of being fed to the scorer — is back at the dawn fire the next morning
and gets asked: scored at dawn (9 cases) or by a mid-day refresh
(2 cases). The 3 exceptions are not the body gate persisting: one is
the same gate firing a second day in a row (meera_reddy eats three
times on d117 and is asked d118), and two are the holder leaving on
guard duty the next morning (away at dawn, asked the day after that).
Nobody's silence runs longer than 2 days. The dawn body gate defers
the ask; it never walls it. If the axis wants more asks, the feed's
position relative to the body gates buys at most one day per holder —
the pool, not the body, is the wall after that.

## 2. Bars (frozen §3 — judged)

| # | Bar | Threshold | Result |
|---|---|---|---|
| 1 | PRIMARY — classification completeness | ≥ 13/14 named (≤ 1 unclassified) | **PASS — 14/14 named, 0 unclassified** |
| 2 | PRIMARY — mechanism proof | Each class proven by ≥ 1 probe (seed/day/vid + corpus row) | **PASS — §3, one probe per class; the 3 WALL probes cite the dawn row + the D+1 cause** |
| 3 | Instrument validity | Proof test green; analyzer selftest green; 0 instrument errors; D+1 cause cross-check reproduces musterask | **PASS — test 10/10, selftest 17/17, errors 0, neverScored 8/8 seeds match, wall matches frozen exactly** |
| 4 | Determinism | Analyzer twice byte-identical; 14-day set re-extracted matches prereg | **PASS — byte-identical; re-extraction matches the §1 table exactly** |
| 5 | Instrument errors | 0 on all judged corpora | **PASS — 0** |

**Verdict: DIAG-GO.** The classification is complete and proven;
the split (DELAY 11 / WALL 3) is the finding, and the finding says
DELAY.

## 3. The 14, classified (next-day fate)

Judged corpus: frozen musterask replay corpora
(`evidence/2026-11-23/perseed-musterask-a-ctl/`, anchor `dbe748d46`).
Analysis: `evidence/2026-11-24/launchdiag-a-analysis.json`.

| # | Seed | Day | Holder | D+1 fate | First scored ≤ D+3 |
|---|---|---|---|---|---|
| 1 | 107617 | 109 | visjoin_84 | **DELAY** — scored d110, part 0, party_wait | d110 |
| 2 | 107617 | 136 | visjoin_130 | **DELAY** — scored d137, part 0, party_wait | d137 |
| 3 | 107620 | 141 | visjoin_135 | **DELAY** — scored d142, part 1 (mid-day refresh), party_wait | d142 |
| 4 | 107620 | 144 | visjoin_135 | **WALL** — other dawn cause: away at dawn d145 (guard, sinceDay 145) | d146 |
| 5 | 107622 | 120 | james_okonkwo | **DELAY** — scored d121, part 0, no-candidate | d121 |
| 6 | 107623 | 124 | daniyar_askarov | **DELAY** — scored d125, part 0, party_wait | d125 |
| 7 | 107623 | 126 | daniyar_askarov | **DELAY** — scored d127, part 0, party_wait | d127 |
| 8 | 107624 | 74 | sofia_chen | **DELAY** — scored d75, part 0, party_launch | d75 |
| 9 | 107624 | 74 | tashi_sherpa | **DELAY** — scored d75, part 1 (mid-day refresh), party_launch | d75 |
| 10 | 107624 | 79 | gen_o96e0k3 | **DELAY** — scored d80, part 0, party_launch | d80 |
| 11 | 107624 | 116 | meera_reddy | **WALL** — early-return AGAIN d117 (EAT@p1, EAT@p2, EAT@p3) | d118 |
| 12 | 107624 | 116 | sofia_chen | **DELAY** — scored d117, part 0, party_launch | d117 |
| 13 | 107624 | 117 | meera_reddy | **DELAY** — scored d118, part 0, no-candidate | d118 |
| 14 | 107624 | 120 | henry_zhang | **WALL** — other dawn cause: away at dawn d121 (guard, sinceDay 121; Amendment 1 — named underneath the EOD label `holder-not-scored`) | d122 |

Class counts: `delay-scored-next-day` 11, `wall-early-return-again`
1, `wall-other-dawn-cause` 2, `unclassified` 0. No day classifies
`delay-launched-next-day`, `wall-holder-dead`, `wall-plan-gone`, or
`wall-village-lost` — nobody died, no plan dissolved, no village was
lost on any D+1 (all five seeds survived to 150d).

### The three WALL probes

- **#11 meera_reddy, s107624 d116→d117 (early-return again).**
  d116: EAT@p2, EAT@p3, no feed. d117: EAT@p1, EAT@p2, EAT@p3 — she
  ate at every part of the day and was never fed to the scorer
  either day. d118: scored at dawn (no-candidate). Two consecutive
  hunger days, then asked. The gate fired twice; it still let go.
- **#4 visjoin_135, s107620 d144→d145 (away at dawn).** d145
  dawnState: away, purpose guard sinceDay 145 — `objTick` skips the
  dawn re-pick for away villagers. Scored d146. The silence is a
  guard duty, not a body.
- **#14 henry_zhang, s107624 d120→d121 (away at dawn, Amendment 1).**
  The re-derived D+1 cause was the old EOD label
  (`holder-not-scored`, subcause `holder-not-at-haven` — the
  planCensus node read (5,3) at end of day). The dawn row underneath
  says: away at dawn, purpose guard sinceDay 121, node (5,3),
  objective GUARD/out. He came back mid-day (part-3 trace: node
  (4,4), idle/done, pick EAT, feedRan false) — and was scored d122.
  The EOD label was the proxy; the mechanism is guard duty at dawn.
  This is the case Amendment 1 was written for, and the dawn
  classifier names it `holder-away-at-dawn`.

## 4. Sense-test (frozen §4)

- **s107617 d109→d110, visjoin_84.** d109 he spent finishing a chore
  and eating twice; d110 he is scored at dawn (party_wait) with a
  healthy man at Haven. A man fed and back at the fire is asked the
  next morning. Sensible — the scorer notices him as soon as his
  body lets it.
- **s107624 d116→d117, meera_reddy.** Three eats in one day (EAT@p1,
  EAT@p2, EAT@p3) on d117, after two eats on d116. Read as a body in
  genuine need, not a gate that never lets go: she is asked d118,
  the morning after the eating stops. Sensible — and it bounds the
  gate: even the worst hunger silence on this band is 2 days.

## 5. Wall numbers (replay corpus, 8 seeds — reproduced exactly)

Wins 0, national 0, table 0 (not instrumented — recorded, never
faked), wave-5 reached 3, wave-4 reached 8, median survival 150, max
survival 150, villages lost 2 (107618 d47, 107621 d144), total
deaths 778. Identical to the frozen musterask wall (cross-check
`wallMatch: true`). The wall did not move — this sub-arm is
diagnostic; it was never expected to.

## 6. Metric review (prereg §10 questions)

- **DELAY/WALL split — DELAY, decisively.** 11/14 asked the next
  day; the 3 WALLs are one repeat gate + two guard duties, all
  resolved by D+2. The body gate is a one-day deferral with a
  two-day worst case on this band.
- **Succession artifact?** No WALL day is a holder-scholar-at-dawn
  on D+1. The succession story (40 scholar-days) does not leak into
  the next-day fate.
- **D+1..D+3 secondary:** every WALL day resolves by D+2 (d118,
  d146, d122). No WALL persists to D+3. The secondary confirms the
  primary: there is no multi-day wall hiding behind the D+1 cut.
- **Mid-day refreshes matter:** 2 of the 11 DELAYs are scored by a
  mid-day refresh (part 1), not at dawn — the refresh is the second
  chance the same-day commit sometimes (but not always) blocks. On
  the two refresh-refused days in the judged set (#2, #6) the holder
  was still scored at dawn the next day, so the refusal cost one
  day, not the ask.
- **Amendment 1 paid off:** without it the split would have read
  DELAY 11 / WALL 2 / unclassified 1 — the same verdict, but with
  the henry day unnamed and the guard-duty mechanism hidden behind
  an EOD label. With it, 14/14 are named and both WALL-other cases
  are guard duties.
- **What the gate costs:** at most one day per holder per hunger
  episode. Moving the feed before the body gates would buy ≤ 14
  asks on this band (and the two guard-duty WALLs would not move at
  all — they are not body gates). The lever is small; the pool is
  the wall after the first day.

## 7. Village assessment (plain words, 1a)

The eight villages look exactly as musterask left them: six survive
the full 150 days, two are lost, nobody wins, nobody reaches
national. The muster story's last loose thread — the hungry holder
who is never asked — turns out to be a one-day story. People eat,
then they come back to the fire and get asked. The village behaves
like people with bodies: hunger eats a day, guard duty eats a day,
and the ask waits until they are back. Nothing here is broken; the
silence was always short, and now it is measured.

---

# Sub-arm (1b) — corpseloot: Omar's corpse thread

## 1. The answer in one paragraph

Across 41 villages and 2,376 corpse-takes, **not one villager ever
took anything from a corpse** — every take was the scholar's, by the
scholar-only `lootCorpse` / `corpseTakeItem` path. The only villager
takes anywhere are the four re-arm takes on the REARM-on leg, all
through the Haven sweep, all gun + 2 cells, zero through the witness
channel. The forced fixture proves why, live: a wild corpse is
unreachable by villagers — the Haven sweep only sees the Haven tile,
villager corpses are never recovered, and a scholar's corpse records
no witnesses, so the witness channel can never fire on it. The one
road home for a scholar's wild gun is the village itself: one day
after the death, `recoverBearer` brings the body to the fire, and the
next Haven sweep takes the gun — **but only with REARM on**. With
REARM off (the shipped default), the gun sits at Haven, unlooted,
exactly as Omar's did. Omar's gun was never lost by a mechanic
failure; it was lost because the only villager take path was switched
off and the successor scholar never walked back to the body. And a
dry gun is unlootable by villagers by design: Emma Larsen's gun sat
on her corpse with 0 cells, and no channel will ever take it.

## 2. Bars (frozen §7 — judged)

| # | Bar | Threshold | Result |
|---|---|---|---|
| 1 | PRIMARY — census completeness | Every take classified by taker kind, 0 unclassified; every gun/cell take has its corpse kind named | **PASS — 2,376/2,376 classified, 0 unclassified; all 11 gun/cell takes named (10 person, 1 non-person)** |
| 2 | PRIMARY — fixture proof | F1–F8 every cell as its §6 prediction; F3/F4 answer the wild-scholar-corpse question | **PASS — 60/60 checks; F3 takes (day after death), F4 does not** |
| 3 | Instrument validity | Proof test green; census totals reproduce frozen counts; 0 instrument errors | **PASS — test 60/60, selftests 9/9 + 17/17, totals reproduce (50 / 405 / 956 / 965 / 4), errors 0** |
| 4 | Determinism | Census twice byte-identical; fixture matrix twice identical | **PASS — census byte-identical; fixture log byte-identical across two full runs** |
| 5 | Instrument errors | 0 on all judged corpora and fixture runs | **PASS — 0** |

**Verdict: DIAG-GO.** The census is complete, the fixture proves
every channel live, and the answer is named in one line (§1).

## 3. Census (frozen corpora — no new sims)

Analysis: `evidence/2026-11-24/launchdiag-corpseloot-a-analysis.json`.
Corpse location is NOT in the frozen rows (the `deaths` rows carry
no node; `corpseTakeEvents` carry no node) — recorded as
`unrecorded`, never guessed; the fixture supplies the location
answer live.

| Band | Seeds | REARM | Takes | Scholar | Villager | Gun/cell takes | Rearm takes (haven/witness) |
|---|---|---|---|---|---|---|---|
| gunloss | 107369 (1) | off | 50 | 50 | 0 | 0 | 0 |
| corpsecap | 107271–107278 (8) | off | 405 | 405 | 0 | 3 | 0 |
| rearm-b ctl | 107533–107548 (16) | off | 956 | 956 | 0 | 4 | 0 |
| rearm-b arm | 107533–107548 (16) | **on** | 965 | 965 | 0 | 4 | **4 (4/0)** |
| **Total** | **41** | | **2,376** | **2,376** | **0** | **11** | **4** |

All §5 expectations confirmed exactly (cross-check `allMatch:
true` on every band). The 2,376 `corpseTakeEvents` are the scholar's
bulk takes (trophies, gear, food — the gunloss band's top items are
trophies); the 4 `rearmTakeEvents` are the ONLY villager takes in
the entire census, and they are a different stream (`rearm_take`)
from a different mechanism.

### The 11 gun/cell takes (all scholar)

| Band | Seed | Day | Item | Corpse | Corpse kind | Taker |
|---|---|---|---|---|---|---|
| corpsecap | 107275 | 66 | fusion_cell | katarina_novak | person | scholar |
| corpsecap | 107275 | 113 | searcaster | giulia_bianchi | person | scholar |
| corpsecap | 107275 | 113 | fusion_cell | giulia_bianchi | person | scholar |
| rearm-ctl | 107539 | 61 | searcaster | corpse_57_yws32w | **non-person** | scholar |
| rearm-ctl | 107545 | 78 | searcaster | elena_petrova | person | scholar |
| rearm-ctl | 107545 | 78 | fusion_cell | elena_petrova | person | scholar |
| rearm-ctl | 107547 | 116 | fusion_cell | yuki_mori | person | scholar |
| rearm-arm | 107539 | 61 | searcaster | corpse_57_yws32w | **non-person** | scholar |
| rearm-arm | 107545 | 78 | searcaster | elena_petrova | person | scholar |
| rearm-arm | 107545 | 78 | fusion_cell | elena_petrova | person | scholar |
| rearm-arm | 107547 | 116 | fusion_cell | yuki_mori | person | scholar |

The s107539 d61 non-person take is resolved, not a loose end:
`corpse_57_yws32w` is a MONSTER corpse — a kill-loot searcaster
drop (`grantEvents`: `toKind: 'corpse', caller:
'kill-loot-corpse'`) that the scholar picked up with a trophy the
same day. A kill-loot gun, not a person-corpse gun.

### The 4 villager re-arm takes (rearm-arm leg only)

| Seed | Day | Taker | Corpse (holder) | Moved | Channel |
|---|---|---|---|---|---|
| 107535 | 114 | olivia_bennett | adaeze_nwosu | gun + 2 cells | haven |
| 107542 | 116 | sigrun_eiriksdottir | emma_larsen | gun + 2 cells | haven |
| 107543 | 136 | gen_b4uk4mq | oliver_moore | gun + 2 cells | haven |
| 107548 | 100 | amina_diallo | olivia_bennett | gun + 2 cells | haven |

Witness channel: **0 of 4.** Every villager take happened at Haven,
a day after the death, never at the death itself.

### Emma Larsen, seed 107539 (cellgate sense-test, reproduced)

Died d86 "the wild" as the scholar (`player: true`). Her corpse
`corpse_86_z6zl89` reads at the end of the run (d149): **gun 1,
cells 0, buried false**. The cells-gate explains the never-looted
gun: she fired her volley on d51 (2 shots, 1 hit, 68 dmg — both
cells spent), so the corpse held a dry gun, and no channel takes a
dry gun. The scholar (her successor) never walked back to the body
either. The gun's story ends on an unburied corpse by the rules as
written, not by a missing mechanic.

## 4. Fixture matrix F1–F8 (live harness, fresh game per cell)

Proof test: `scripts/test-launchdiag-corpseloot-a.js` — **60/60
checks, byte-identical across two full runs.** Cell supply note
(probe-verified, not a prediction): a villager corpse collapses a
2-cell stack to 1 (`generatePossessions` writes one `units:1`
entry per gear id); a scholar corpse preserves the full stack
(`playerDeath` packs `units` as carried). That is why the rearm-b
takes moved 2 cells — Emma died as the scholar, so her corpse held
the full stack — while the fixture's villager corpses move 1.

| Cell | Setup | REARM | Predicted | Observed |
|---|---|---|---|---|
| F1 | Villager dies WILD, no witnesses; 3 Haven sweeps | on | NO take | **NO take** — corpse keeps gun + 1 cell |
| F2 | Villager dies at HAVEN, no witnesses; sweep | on | TAKE (haven) | **TAKE** — second-life, haven, gun + 1 cell |
| F3 | SCHOLAR dies WILD, gun + 2 cells; endDay ×2 | on | TAKE day after death | **TAKE** — recovered to Haven on endDay#2, second-life/haven, gun + 2 cells, recorded day = death day + 1 |
| F4 | Same as F3 | off | NO take (recovery only) | **NO take** — corpse recovered to Haven, keeps gun + 2 cells |
| F5 | Villager dies WILD WITH a witness | on | TAKE at death (witness) | **TAKE** — witness gains gun + 1 cell at death time |
| F6 | Same as F5 | off | NO take | **NO take** — corpse keeps gun + 1 cell |
| F7 | SCHOLAR dies WILD, DRY gun (0 cells); endDay ×2 | on | NO take (cells-gated) | **NO take** — recovered, keeps the dry gun |
| F8 | Villager dies WILD, no witnesses; scholar walks to it, `lootCorpse` | on | TAKE by scholar | **TAKE** — scholar gains gun + 1 cell |

Every cell behaves as the prereg predicted. The wild-scholar-corpse
question (F3/F4) is answered with a recorded take on the named day:
death d1 → recovery + take during the endDay closing d2.

### F3 in full (Omar's case, lever on)

Death staged the faithful way: the scholar walked to wild tile
(1,2), gun seated in the ranged slot, 2-cell stack in the pack,
then the real `playerDeath('the wild')`. The corpse held gun + 2
cells at (1,2), witnesses `[]`, `pendingBurials` entry day 1.
endDay#1: nothing — the body is not due. endDay#2: "That night,
they bring Otis home. Nobody asks you to help carry; nobody has
to. By morning the grave is dug by the fire, and the body is laid
out beside it." — the corpse moves to (4,4), `recovered: true` —
and the sweep takes the gun + both cells the same night. The take
is voiced: "A person, maybe 50s, with a nervous tic lifts A person,
maybe 40s's Searcaster from the body, and the fusion cells with it.
The gun has a new holder."

## 5. Sense-test (frozen §8)

- **s107275 d113, giulia_bianchi** (corpsecap evidence §5, cited
  not re-read): the scholar strips her whole death pack in one pass
  — nine `loot_taken` rows, the gun one line among nine, no grief
  beat, no pause. Corpse looting as built is a silent bulk take.
- **F3's say line** (new material): the take IS voiced — but the
  people are anonymous descriptions, not names: "A person, maybe
  50s, with a nervous tic lifts A person, maybe 40s's Searcaster
  from the body." The village moment is legible in the census and
  half-legible in the words: the gun changes hands and the game
  says so, but it cannot say WHO, because the taker and the dead
  are strangers to the scholar's knowledge. That is the
  knowledge-gate working as designed ("if you don't know, it
  doesn't show") — and it is also why the moment reads as a
  mechanic firing on a schedule rather than a village mourning a
  friend. A design question for the corpse system, not a defect.

## 6. Wall numbers (frozen bands — reported, never judged)

| Band | Wins | National | Wave 5 | Wave 4 | Median surv. | Lost | Deaths |
|---|---|---|---|---|---|---|---|
| gunloss (1 seed) | 0 | 0 | 0/1 | 1/1 | 145 | 1 (d145) | 90 |
| corpsecap (8) | 0 | 0 | 3/8 | 8/8 | 150.5 | 2/8 | 622 |
| rearm-b ctl (16) | 0 | 0 | 11/16 | 16/16 | 150* | 8/16 | 1581 |
| rearm-b arm (16) | 0 | 0 | 11/16 | 16/16 | 150* | 8/16 | 1574 |

\* Median convention note: this analyzer takes the upper-middle
(sorted[8] of 16); the rearm-b evidence reports 149 (mean of the
two middle values). Same villages, different median rule — not a
drift in the game.

## 7. Metric review (prereg §10 questions)

- **Census vs §5 expectations — confirmed exactly.** Every count
  reproduced (50 / 405 / 956 / 965 / 4 takes; 4 haven / 0 witness;
  Emma gun 1, cells 0, unburied). No expectation overturned.
- **The s107539 d61 non-person take — resolved.** A monster-corpse
  kill-loot gun (grant `kill-loot-corpse`), not a person-corpse
  gun. The corpse-kind field earns its keep: without it the take
  would read as a scholar looting a person for a gun.
- **F3 changes the Omar reading — precisely.** With the lever on,
  Omar's gun gets its second life one day after death (recovery +
  sweep). The gunloss band ran REARM off, so on that band the gun
  sat at Haven unlooted from d137 to the village's loss on d145 —
  the setting is the whole story, and the fixture proves the
  mechanism that would have saved it exists and fires.
- **No fixture cell contradicts its prediction.** F1/F4/F6/F7 are
  the four no-takes, and each no-take has a different named reason
  (wild + no witness; lever off; lever off; no cells). The code
  reads true in every direction.
- **The binding constraint on wild takes is perception, not
  opportunity.** F5 proves the witness channel fires the moment a
  witness exists; rearm-b's 0/16 witness takes prove witnesses
  almost never exist at a gun-holder's death (holders die in the
  wild, in contests, or as the scholar — alone). The next arm that
  wants more takes should look at wild-corpse expeditions (go to
  the death site), as rearm-b §10 already named — not at the
  channels, which work.

## 8. What this means for the scale-onramp axis

Two loose threads are now tied off with numbers, not stories. The
dawn body gate costs at most one day per hunger episode (1a) — it
is not the wall. And the corpse gun is not lost to a sink or a bug
(1b): with the re-arm lever on, a scholar's wild gun comes home and
fires again the next day; with it off, it rots on the corpse by
design. Neither thread moves national, the table, or wins — both
were diagnostic, and both close as DIAG-GO. The wall stands where
the frozen bands left it: villages reach wave 5 and survive to the
horizon, but none reaches national and none wins.

## 9. Blanks filled / documented

- **Filled:** tracker blank #5 (pick-early-return delay-vs-wall —
  DELAY, 11/14 next-day, worst case 2 days) and tracker blank #3
  (Omar's corpse thread — villagers never loot a scholar's/wild
  corpse except via the two REARM-gated channels; F3 proves the
  scholar's wild gun is recoverable with the lever on).
- **Documented:** witness channel 0/16 in rearm-b + F5 live (next
  question: wild-corpse expedition); F3's say line names people by
  anonymous description, not name (knowledge-gate working as
  designed, moment reads half-legible); rearm median-convention
  note (§6); villager-corpse 1-cell collapse vs scholar-corpse
  full-stack preservation (§4 note).
- **Not built here:** no default flip (REARM stays env-gated — a
  Steve/coordinator call, not this arm's); no wild-corpse
  expedition; no corpse-collapse fix (the 1-cell scholar-path
  collapse from gunloss is a separate arm — and note: the collapse
  applies to VILLAGER corpses via `generatePossessions`; scholar
  corpses preserve stacks via the `playerDeath` pack).

## 10. Findings update (for the coordinator to append)

> [UPDATE 2026-11-24 — sim-launchdiag-a DIAG-GO, both sub-arms]
> (1a) Pick-early-return delay-vs-wall (tracker blank #5): 14/14
> days named, 0 unclassified — DELAY 11, WALL 3. The dawn body gate
> is a one-day deferral, not a wall: 11/14 holders are asked the
> very next day; the 3 WALLs all resolve by D+2 (one repeat
> early-return, two guard-duty aways). Longest silence after a
> pick-early-return day is 2 days. Moving the feed before the body
> gates buys at most one day per holder. Evidence:
> evidence/2026-11-24/sim-launchdiag-a.md §1–§7.
> (1b) Corpseloot — Omar's corpse thread (tracker blank #3):
> 2,376 corpse-takes censused across 41 villages, 0 unclassified —
> ALL scholar, 0 villager. The only villager takes anywhere are the
> 4 re-arm takes on the REARM-on leg, all Haven channel, 0 witness.
> Fixture F1–F8 (60/60 checks): a wild corpse is unreachable by
> villagers (Haven sweep is same-tile only; villager corpses are
> never recovered; scholar corpses record no witnesses). A
> scholar's wild gun DOES come home — recoverBearer brings the body
> to the fire one day after death, and the Haven sweep takes the gun
> + 2 cells — but only with REARM on (F3 takes, F4 does not). A dry
> gun is unlootable by villagers by design (Emma s107539: gun 1,
> cells 0, unburied to d149). Omar's gun was lost because the only
> villager take path was switched off and the successor never walked
> back to the body. Evidence: evidence/2026-11-24/sim-launchdiag-a.md
> §1b.

## 11. Files

- Prereg (frozen + Amendment 1):
  `evidence/2026-11-24/sim-launchdiag-a-prereg.md`
- This evidence: `evidence/2026-11-24/sim-launchdiag-a.md`
- (1a) analysis: `evidence/2026-11-24/launchdiag-a-analysis.json`
  (DELAY 11, WALL 3, 0 unclassified; cross-check 8/8, wall exact)
- (1a) instrument: `scripts/analyze-launchdiag-a.js`,
  `scripts/test-launchdiag-a.js`
- (1b) analysis:
  `evidence/2026-11-24/launchdiag-corpseloot-a-analysis.json`
  (2,376 takes, all scholar; 4 rearm takes, all haven)
- (1b) instrument: `scripts/analyze-launchdiag-corpseloot-a.js`,
  `scripts/test-launchdiag-corpseloot-a.js`
- Substrate: no `src/js` changes on the branch (verified: the only
  commits are prereg + instruments + analyses + this evidence).
  Policy competent verbatim on the frozen replay corpora; fixture
  env `KILLBUNDLE=1 CELLGATE=1` + `REARM_CELLS` toggled per cell.
