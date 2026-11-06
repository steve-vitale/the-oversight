# sim-entrycensus-a — census of wave-4+ fight traces with entry HP < 100: GO

**Arm:** sim-entrycensus-a (run fleshout-20261106T1916Z, Loop A, axis
scale-onramp / winnability chain) · **DIAG-ONLY. No src/js changes. No
new seeds. No new sims.** Follow-up to sim-congtrace-a, which proved a
wanderer-cast Congregation spawned at 20/20 HP and died to one ordinary
56-damage strike on seed 53006 day 149. Question: how many RECORDED
wave-4 kills may be 20-HP spawn artifacts rather than real kills?
**Verdict: GO** — the census is complete across every listed corpus,
every wave-4+ entry-HP<100 trace is classified or explicitly marked
unclassifiable-with-reason, and the verdict-change list below is
complete. No threshold on how many artifacts were found: the census
found **7 artifact traces and 3 artifact kills** (one more kill than
the frozen-tool first pass — see Tooling correction).
**Corpora:** all 1,049 `perseed-*` dirs under `evidence/` (all dates),
21,702 JSON files scanned, 5,124 with markers, 356 fully parsed, 0
parse errors, 418 derived (analysis/summary) files skipped ·
**Prereg:** `evidence/2026-11-06/sim-entrycensus-a-prereg.md` ·
**Proof:** `scripts/test-entrycensus-20261106.js` **23/23 green** (19
pre-registered + 4 alias/matcher fixtures added with the tooling
correction — see below) · **Analyzer:**
`scripts/entrycensus-analyze-20261106.js` · **Machine table:**
`evidence/2026-11-06/sim-entrycensus-a.json` (1.95 MB: every trace,
every kill record, every kill event, per-corpus stats).

**The one-line result, plainly:** the 20-HP spawn bug is not a
one-seed story. Three recorded wave-4 kills — on two seeds, both legs
of one band — were beasts born at 20 hit points out of 900–1400, and
two past verdicts counted them: the stageally confirm's only
post-first-blood kill, and the tbretreat pilot's only baseline kill
plus one of its three armed kills. Neither verdict flips — the confirm
was already NO-GO, the pilot's GO rests on its retreat gates — but the
kill evidence underneath both is thinner than the ledgers say, and the
pilot's only surviving village ends with zero living wave-4 killers
once the artifact kill is removed. Across the whole recorded history,
only 65 of 367 distinct wave-4+ kill events can be shown clean from
the corpus; 299 cannot be ruled either way. The funnel's binding link
rests on very few proven-clean kills.

## Primary metric (binding)

GO = census complete across every listed corpus, with every wave-4+
entry-HP<100 trace classified or explicitly marked
unclassifiable-with-reason. **Met: 42/42 low-entry traces classified**
(7 artifact, 1 legitimate, 34 unclassifiable-with-reason), all 1,049
perseed dirs enumerated (Stage C), every named corpus searched (table
below), zero-hit corpora listed, not assumed. No metric was swapped,
re-cut, or re-thresholded. The tooling correction (alias reads +
kill-or-rout matcher) changed the tool, not the pre-decided classifier
— see Tooling correction.

## Census headline

| | |
|---|---|
| perseed dirs enumerated (Stage C) | 1,049 |
| JSON files scanned / with markers / fully parsed | 21,702 / 5,124 / 356 |
| Parse errors | 0 |
| Derived files skipped (analysis/summary restatements) | 418 |
| Wave-4+ traces with entry HP (Stage A) | 1,625 |
| Low-entry traces (entry HP < 100) | **42** |
| Artifact traces (entry max < 100, born crippled) | **7** |
| Legitimate low-entry traces (canonical max, ground down) | 1 |
| Unclassifiable low-entry traces (no max under any field name) | 34 |
| Trail-artifact traces (type never seen healthy in the run) | 5 |
| Wave-4+ kill records (waveKillLog + killsLive, per file) | 903 |
| Distinct kill events (seed, day, monster) | 367 |
| **Suspect kills (matched to an artifact trace)** | **3** |
| Clean kills (killing fight traced, canonical entry) | 65 |
| Unresolvable-from-corpus kills | 299 |
| TB wave-4 fight rows / field wave-4 fight rows | 428 / 6,275 |
| Field wave-4 kills (fights rows, outcome vKill) | 11 |

Canonical HP bands verified against `src/data/monsters.json` at census
time (wave 4: 850–1500; wave 5: 1000–2200; lowest canonical low is
herald/finale_crew at 700): congregation 900–1100, strike 1000–1200,
influencer 850–1050, audit 1100–1300, reunion 1200–1400, suburb
1300–1500, eulogy 900–1100, algorithm 1000–1200, eater 950–1150,
herald 700–900; cancellation 1600–2000, editor 1500–1900, rerun
1200–1500, spoiler 1300–1600, timeslot 1400–1700, nielsen 1100–1400,
finale 1800–2200, finale_crew 700–900, finale_opening 900–1100,
network_note 1000–1300.

## The 7 artifact traces (born crippled)

Every one is 20/20, or ground down from 20/20. Spawn source is
`unknown-with-reason` except 53006 d149 (wanderer, proven live by the
congtrace probe). A 20/20 beast can only come from a bare-`{id}` caller
of `spawnWorldMonster` (`|| 20` fallback, game.js:20271) — wanderer,
trap, or finale-campaign — since `maintainWorldMonsters` and the
tile-entry spawn pass the full def; the corpus carries no spawn
evidence to pin which one per trace.

| Seed / day | Monster | Entry | Ending | Rounds | Corpus | Kill? |
|---|---|---|---|---|---|---|
| 99722 d119 | Reunion | 20/20 | kill | 2 | tbretreat-b armed, field fight (Ines Duarte, `via: wild`) | **YES — suspect kill** |
| 99722 d104 | Reunion | 20/20 | kill-or-rout | 1 | tbretreat-b baseline, TB (gen_fqc40em, `via: player`); max read via `entryMaxHpPrimary` | **YES — suspect kill** |
| 99732 d68 | Audit | 20/20 | flee | 1 | tbretreat-b-confirm baseline, field | no |
| 99732 d68 | Audit | 10/20 | death | 1 | tbretreat-b-confirm baseline, field — same beast by the trail (same day, same file, HP 20→10); the scholar died in the second fight | no |
| 53006 d149 | Congregation | 20/20 | kill | 1 | congtrace-a, TB (gen_y8hmuwz, solo, 56-damage strike) | **YES — suspect kill (the anchor)** |
| 55005 d131 | Eulogy | 20/20 | vFlee | 1 | finishprobe-a, field — the 20-HP Eulogy finishprobe already flagged in its sense-test | no |
| 55005 d131 | Eulogy | 20/20 | vDie | 2 | finishprobe-a, field — same beast, the villager fled, then died to it | no |

Damage accounts close exactly on the three kills, as on the anchor:
99722 d119 — 20 damage dealt, 2 rounds; 99722 d104 — 20 damage dealt,
1 round, the only Reunion fight that day; 53006 d149 — 56 damage, 1
round (congtrace-a). A beast with 20 max HP dies to the first
damaging hit; there is no other reading of a 1–2 round kill at 20/20.

## The 3 suspect kills (distinct events)

| Seed / day | Monster | Killed by | Via | Counted in |
|---|---|---|---|---|
| 99722 d119 | Reunion | Ines Duarte | wild (field) | sim-tbretreat-b (armed kill 3 of 3 matched) |
| 99722 d104 | Reunion | gen_fqc40em | player (TB) | sim-tbretreat-b (baseline kill 1 of 1) |
| 53006 d149 | Congregation | gen_y8hmuwz | player (TB) | sim-stageally-confirm-b (armed post-first-blood kill 1 of 1); sim-killersurvive-a; sim-baseline9-a |

## Verdict changes

Unresolvable-from-corpus kills do NOT change a verdict by themselves;
only the 3 artifact-matched kills do. **No past verdict flips.** Two
verdicts are restated (numbers change, verdict stands); the rest are
unchanged, with the per-corpus reasoning.

### 1. sim-stageally-confirm-b.md — NO-GO stands, numbers restated

- Armed post-first-blood wave-4 kills **1 → 0** (the d149 kill was the
  leg's only post-first-blood kill; it is an artifact). The NO-GO bar
  was ≥3; restated 0 — NO-GO stands, does not flip.
- Armed wave-4 kills **3 → 2** (d78 Eulogy unresolvable, d89 Strike
  legitimate at 750/1000, d149 artifact removed). Baseline 9 unchanged
  (all 9 unresolvable-from-corpus — see uncertainty bound).
- Pooled n=16 armed **11 → 10** (baseline 11 unchanged). The pooled GO
  was already qualified as the pilot's one-seed headline; restated, the
  pooled clean-kill count is 1 armed vs 2 baseline (only the
  finishprobe-confirmed kills are proven clean).
- The confirm's mechanism findings (rally fires, ally presence,
  party-days) are untouched — none of them is a kill count.

### 2. sim-tbretreat-b.md — pilot GO stands, numbers restated

- Baseline wave-4 kills **1 → 0**: the pilot's only baseline kill
  (99722 d104, gen_fqc40em) is a 20-HP spawn artifact. The baseline
  killed nothing real on this band.
- Armed matched kills **3 → 2**: d85 Strike (736/1000, 24 rounds, 736
  damage dealt) and d85 Influencer (613/850, 11 rounds, 613 damage)
  are legitimate; d119 Reunion is an artifact. Kill-log armed
  **4 → 3**: the fourth is the 99723 midnight kill (fought d53 at
  3/1200, logged d54 — legitimate in substance, see Matcher limits).
- G3 (armed kill rate ≥ ½ baseline) restated: baseline **0/21 = 0%**,
  armed 2/25 = 8.0% matched (3/25 = 12% by log). The bar holds
  (½ × 0 = 0), but the reported **2.52× ratio is vacuous** — there is
  no baseline kill to improve on. The evidence file already warned the
  kill "improvement" is noise on a tiny denominator; the restatement
  makes it explicit. The GO stands on G1 (retreat survival 45.5%),
  G2 (thin), G4 (0.82×) — the gates the prereg said carry a thin
  verdict.
- Killers ever: baseline **1 → 0**, armed **2 → 1** (Leo Martin only).
  Living killers at end on 99722 armed: **1 → 0** — the living killer
  was Ines Duarte (alive at the horizon, health 22–100, no fallen
  entry), whose only kill was the artifact; Leo died day 112. The
  band's only surviving village ends with **zero living wave-4
  killers**, standing 199, one short of the 200 the fifth wave asks
  for. The pilot's story — "the one village that lived, with one
  living killer" — is now "the one village that lived, with no living
  killer."

### 3. sim-killersurvive-a.md — DIAG-GO stands

- The staged killer census loses one row: gen_y8hmuwz (Congregation
  d149, alive at end) is removed — staged killers 3 → 2, staged kills
  3 → 2. The DIAG-GO (census completeness + party persistence) does
  not flip: the persistence answer (party persists, shrinks only by
  death/promotion) does not turn on that row, and the first-killer
  median (9.5d staged) is unaffected — gen_y8hmuwz was a second killer,
  not a first killer. The census's own blank ("the 1-round solo kill
  is not explained here") is now closed by this census + congtrace-a.

### 4. sim-baseline9-a.md — DIAG-GO stands, gap widened by one

- Kill ledger 12 → 11 (d149 removed). Gap decomposition (baseline
  minus armed): scholar-TB +3 → **+4** (baseline 6 vs armed 2),
  companion-TB +2, wild-field +1 — total gap **6 → 7**. The DIAG-GO
  (every kill classified by channel) does not flip; the channel
  reading is unchanged, the gap is one kill wider. The d149 kill's
  channel (scholar-TB) was never in doubt; only its mechanism was.

### 5. sim-congtrace-a.md — no change

- Its verdict IS that d149 is an artifact. The census confirms it and
  finds it is not the only one. No restatement.

### 6. sim-fightinterior-b.md — no change

- All 7 fight-ending kills are trace-legitimate (canonical entry,
  including the 51005 d66 Reunion at 123/1200 — the wounded-entry
  shape, confirmed genuine). The 2 pyrrhic kills (51005 d65 Reunion,
  51002 d80 Strike) are clean in substance: their fights are traced
  at canonical pack entry (1778/2507 and 2805/3882; 1071/1071) — see
  Matcher limits for why the match label reads differently. DIAG-NO-GO
  (D1, one taxonomy string) stands.

### 7. sim-finishprobe-a.md — no change

- Both kills legitimate: 55005 d121 Strike 695/1000 over 32 rounds
  (695 damage dealt), 55006 d113 Strike 750/1000 over 46 rounds (750
  damage dealt). Stage 1 DIAG-GO / Stage 2 NO-GO stand. The 55005
  d131 20-HP Eulogy rows are non-kill artifact traces — the evidence
  file already flagged that beast in its sense-test; the census
  confirms it was born 20/20, not ground down.

### 8. sim-tbretreat-b-confirm.md — no change

- All 7 kill events on the band are trace-legitimate (99733 d114/d122,
  99735 d57/d77, 99738 d123/d135 — the 6 armed kills; 99735 d57 is
  also the baseline's 1 kill, the same deterministic event in both
  legs). The 99732 Audit artifact traces are non-kills (that seed
  killed 0 on both legs). G3 (1/97 vs 6/112) is untouched; confirm
  NO-GO stands.

### 9. sim-killerwild-b.md — no change (uncertainty bound)

- All 7 kills are unresolvable-no-trace: the killerdeath instrument
  records no entry HP and no TB fight rows. The DIAG verdict (first
  killers die at home) does not turn on kill counts, so nothing is
  restated — but none of its 7 kills can be ruled clean either. They
  sit inside the uncertainty bound below.

### 10. sim-stageally-a.md (pilot GO) — no change, bound noted

- No pilot kill matched an artifact trace, so the GO does not flip.
  But all 8 armed kills are tbfight-won-no-entryhp (the stageally
  recorder's tbFights rows carry no entry HP) — unresolvable, not
  proven clean. Only the 2 baseline kills are proven clean (55005
  d121, 55006 d113, via the finishprobe corpus). The pilot's GO rests
  on 8 kills, 0 of which the corpus can show were against healthy
  beasts. That does not overturn the GO — it bounds it.

### 11. Endgame panels (journey-endgame r138–r144 and others) — no change

- The census is global: any artifact-matched kill in any corpus would
  appear among the 3 suspect events, all in tbretreat-b /
  stageally-confirm-b. No panel kill matched an artifact trace, so no
  panel verdict changes. Panel kills that sit in unresolvable-no-trace
  corpora (the 2026-10-22–25 wall/panel bands dominate that class)
  carry the uncertainty bound below.

### 12. sim-partydamage-b.md — NO-GO stands, all kills legitimate

- This corpus arrived with the rebase onto current master (it was not
  in the tree when the census first ran) and was picked up by the
  third census run. 16 files, 54 wave-4+ traces, 0 low-entry traces,
  10 kill records, 5 distinct kill events: **4 trace-legitimate**
  (87006 d100 Strike, 87006 d108 Congregation, 87007 d81 Eater,
  87008 d102 Influencer). The 5th (87004 d118 Influencer) is
  unresolvable-no-trace in the JSON — day-exact matching only — but
  legitimate in substance: the d117 fight trace enters at 637/850
  (canonical max, wounded entry, 9 rounds, outcome won), and the
  partydamage evidence itself names it a midnight span (fight d117,
  kill logged d118). No artifact anywhere in the band; the NO-GO
  (armed 2/24 = 8.3% < 10% bar) is unchanged in both its numbers and
  its verdict.

## The uncertainty bound (read this before citing any kill count)

Distinct kill events, 367 total:

| Match class | Events | Meaning |
|---|---|---|
| trace-artifact | 3 | suspect — born-crippled kill |
| trace-legitimate | 25 | clean — killing fight traced at canonical entry |
| trace-unclassifiable-high | 38 | clean in substance — killing fight entered at ≥100 (a born-20 beast cannot enter at ≥100), max unrecorded |
| trace-entry100plus-not-kill | 2 | clean in substance — the pyrrhic pair, fights traced at canonical pack entry (see Matcher limits) |
| trace-unclassifiable-low | 15 | **unresolvable** — killing fight entered <100, no max recorded |
| tbfight-won-no-entryhp | 18 | **unresolvable** — TB win confirmed, entry HP never recorded |
| unresolvable-field-kill | 6 | **unresolvable** — field kill (`via: wild`), no fight record |
| unresolvable-no-trace | 260 | **unresolvable** — kill logged, no fight record at all |

**Clean: 65 events (18%). Suspect: 3 (0.8%). Unresolvable: 299
(81%).** Per-file kill records: 742 of 903 (82%) unresolvable. The
unresolvable mass is concentrated in the old corpora whose recorders
never carried entry HP: the top dirs are the 2026-10-22–25 wall/panel
bands (defer4transfer 25, vetcontact 20, l887-armed 17, restraint 16,
wallseg 16) plus postblood-b (13) and mantlechain (12). Only 15 of
1,049 perseed dirs carry entry-HP traces at all — the entry-HP
recorder family is small (dmground, finishhold, freshkill, grindfinish,
killersim, killersim2, secondkiller, staypolicy, tbretreat-b,
tbretreat-b-confirm, tbretreat-refind-b, tbretreat-refind-confirm-b,
congtrace-a, fightinterior-b, finishprobe-a, partydamage-b). Every other corpus is
unclassifiable-by-recorder, not zero-artifact: the absence of entry HP
is a recorder gap, not evidence of no artifact.

The 15 trace-unclassifiable-low kill events (killing fight entered
<100, max unknown) are the sharp end of the bound. Three have a
trail-artifact note — the type was never seen healthy in that run, so
the beast was most likely born crippled (spawn-bug class, mechanism
unproven): 99207 d118 Strike 15/? (kill-or-rout), 96811 d112 Strike
15/? (kill, `via: aid-crisis`), 93021 d83 Eulogy 20/? (kill — records
in BOTH legs, possibly two separate 20-HP beasts, one per leg). The
other 12 could be ground-down beasts or second crippled spawns —
indistinguishable without entity identity. No reproduction probe was
run for any of them: the prereg requires an amendment naming the probe
first, and none is named. They stay unclassifiable-with-reason, and
they do not change any verdict by themselves.

## The 42 low-entry traces (full census table)

`entry` is entryHp/entryMaxHp (`?` = no max under any field name).
`maxSrc` is the field the max was read from. `trail` is the
artifact-by-trail note where it applies (type never seen healthy in
the run).

| Seed / day | Monster | Entry | Max src | Ending | Class |
|---|---|---|---|---|---|
| 99202 d106 | Reunion | 20/? | — | kill-or-rout | unclassifiable |
| 99203 d99 | Eulogy | 59/? | — | death | unclassifiable |
| 99203 d100 | Eulogy | 31/? | — | kill-or-rout | unclassifiable |
| 99204 d145 | Eulogy | 20/? | — | flee | unclassifiable |
| 99207 d110 | Eulogy | 98/? | — | death | unclassifiable |
| 99207 d111 | Eulogy | 55/? | — | kill-or-rout | unclassifiable |
| 99207 d118 | Strike | 15/? | — | kill-or-rout | unclassifiable, trail-artifact |
| 99161 d101 | Eulogy | 20/? | — | kill | unclassifiable |
| 99164 d105 | Eater | 29/? | — | kill-or-rout | unclassifiable |
| 99167 d55 | Eulogy | 98/? | — | death | unclassifiable |
| 99167 d56 | Eulogy | 12/? | — | kill-or-rout | unclassifiable |
| 99326 d90 | Influencer | 55/? | — | kill-or-rout | unclassifiable |
| 99327 d68 | Strike | 20/? | — | death | unclassifiable |
| 99327 d72 | Strike | 4/? | — | kill-or-rout | unclassifiable |
| 99332 d117 | Eater | 20/? | — | death | unclassifiable |
| 99334 d121 | Congregation | 20/? | — | death | unclassifiable, trail-artifact |
| 99151 d114 | Eulogy | 93/? | — | unfinished | unclassifiable |
| 99241 d85 | Suburb | 52/? | — | flee | unclassifiable |
| 99241 d85 | Suburb | 31/? | — | flee | unclassifiable |
| 99241 d86 | Suburb | 19/? | — | kill-or-rout | unclassifiable |
| 99241 d79 | Eulogy | 93/? | — | death | unclassifiable |
| 99241 d79 | Eulogy | 80/? | — | death | unclassifiable |
| 99722 d104 | Reunion | 20/20 | entryMaxHpPrimary | kill-or-rout | **artifact** |
| 99722 d119 | Reunion | 20/20 | entryMaxHp | kill | **artifact** |
| 99723 d53 | Reunion | 3/1200 | entryMaxHpPrimary | kill-or-rout | **legitimate** (ground down 1200→3 across 6 fights the same day) |
| 99732 d68 | Audit | 20/20 | entryMaxHp | flee | **artifact** |
| 99732 d68 | Audit | 10/20 | entryMaxHp | death | **artifact** || 96811 d112 | Strike | 15/? | — | kill | unclassifiable, trail-artifact |
| 96811 d100 | Strike | 15/? | — | kill-or-rout | unclassifiable |
| 96812 d75 | Influencer | 20/? | — | kill | unclassifiable (×2 files, both legs) |
| 96827 d59 | Algorithm | 49/? | — | kill-or-rout | unclassifiable (×2 files, both legs) |
| 92012 d128 | Suburb | 76/? | — | kill-or-rout | unclassifiable (×2 files, both legs) |
| 92015 d82 | Eulogy | 95/? | — | flee | unclassifiable |
| 92015 d84 | Eulogy | 55/? | — | death | unclassifiable |
| 93021 d83 | Eulogy | 20/? | — | kill | unclassifiable, trail-artifact (×2 files, both legs) |
| 53006 d149 | Congregation | 20/20 | entryMaxHp | kill | **artifact** (anchor) |
| 55005 d131 | Eulogy | 20/20 | entryMaxHp | vFlee | **artifact** |
| 55005 d131 | Eulogy | 20/20 | entryMaxHp | vDie | **artifact** |

The 34 unclassifiable rows are field-fight (`fights[]`) rows: the
recorder wrote entry HP but no max under any field name. The grind
trail supports the unclassifiable call where present (same type seen
healthy in the run — e.g. 99202's Reunion seen at 1228 the same day;
99723's Reunion ground 1200→3 across six fights). Its absence does not
by itself reclassify a trace whose max is canonical — only one row
(99723 d53) carries a max, and it is legitimate.

## Per-corpus coverage (named corpora)

| Corpus dir | Files | Traces | Low-entry | Artifacts | W4 kills (records) |
|---|---|---|---|---|---|
| perseed-stageally-confirm-b (53001–53008) | 16 | 0 | 0 | 0 | 24 |
| perseed-fightinterior-b (51001–51008) | 16 | 59 | 0 | 0 | 17 |
| perseed-finishprobe-a (55001–55008) | 8 | 54 | 2 | 2 | 4 |
| perseed-killerwild-b (56001–56008) | 8 | 0 | 0 | 0 | 13 |
| perseed-stageally-a (55001–55008) | 16 | 0 | 0 | 0 | 20 |
| perseed-killersurvive-verify (53004, 53006) | 3 | 0 | 0 | 0 | 12 |
| perseed-congtrace-a (53006) | 1 | 6 | 1 | 1 | 4 |
| perseed-tbretreat-refind-b (96xxx) | 32 | 191 | 6 | 0 | 30 |
| perseed-tbretreat-refind-confirm-b (92xxx/93xxx) | 48 | 250 | 6 | 0 | 20 |
| perseed-tbretreat-b (99721–99728) | 16 | 44 | 3 | 2 | 10 |
| perseed-tbretreat-b-confirm (99731–99742) | 24 | 203 | 2 | 2 | 14 |
| perseed-dmground-a (99201–99208) | 16 | 100 | 7 | 0 | 18 |
| perseed-finishhold-b (99161–99168) | 16 | 215 | 4 | 0 | 28 |
| perseed-killersim2-b (993xx) | 32 | 194 | 5 | 0 | 20 |
| perseed-secondkiller-b (99151–99158) | 8 | 55 | 1 | 0 | 6 |
| perseed-staypolicy-a (99241–99248) | 16 | 91 | 5 | 0 | 4 |
| perseed-toggle-confirm-trickoff-b (99761–99772) | 24 | 0 | 0 | 0 | 0 |
| perseed-partydamage-b (87001–87008) | 16 | 54 | 0 | 0 | 10 |
| perseed-bondinit-b (84101–84108) | 33 | 0 | 0 | 0 | 0 |

Stage C: 1,049 dirs enumerated; 579 with zero marker files (searched,
zero wave-4 traces/kills); 63 with wave-4 kills; 16 with entry-HP
traces. The stageally-confirm-b and stageally-a corpora carry no entry
HP at all (tbFights-only recorder) — unclassifiable-by-recorder, as
the prereg anticipated. The killersurvive-verify and killerwild-b
corpora likewise carry no entry HP.

Bands named, no corpus on disk: **enddaybeats 46001–46040** — no
per-seed corpus exists under `evidence/` for that band. (The
`sim-enddaybeats-a-corpus/` dir on disk is a different band's corpus,
seeds 15xxx/17xxx, and carries no `entryHp` and no `waveKillLog` —
no wave-4 kill records.) **Trickoff 99761–99772: the prereg's
expectation was wrong — a corpus DOES exist**
(`perseed-toggle-confirm-trickoff-b/`, 24 files, seeds 99761–99772),
and the census searched it: 0 traces, 0 wave-4 kills, 15 files with
markers (wave-4 fights below the kill line only).

## Tooling correction (read before re-using the numbers)

The frozen-tool first pass (proof 19/19, census to /tmp, superseded)
under-read two recorder fields. Found live during verification, when
the 99722 d104 row was checked by hand against its file:

1. **Entry-max aliases.** The tbretreat/finishprobe-class recorders
   carry the entry max as `entryMaxHpPrimary` (TB rows) or
   `worldHpAtLift.maxHp`, not `entryMaxHp`. The frozen analyzer read
   only the direct field, so 99722 d104 Reunion (20/20 via alias, the
   only fight row that day, 1 round, 20 damage dealt, kill logged)
   classified unclassifiable and its kill went unmatched — a third
   artifact kill the census would have missed. The fix resolves the
   max through `entryMaxHp → entryMaxHpPrimary →
   worldHpAtLift.maxHp` (direct field wins; the aliases agree wherever
   two are present). `defHpLo/defHpHi` is the canonical band, never
   the entry max, and is not used.
2. **Kill-or-rout matcher.** The frozen matcher only accepted
   `ending` kill/vKill as the killing trace. The tbretreat/finishprobe
   recorders end their fight rows `kill-or-rout` — their own ambiguity
   about one fight — so their kills never matched their own rows. The
   fix falls back to a `kill-or-rout` row for the same (seed, day,
   mid) while matching a logged kill: the log resolves the ambiguity
   (a kill IS logged for that key). A `kill-or-rout` row is only ever
   consulted while matching a logged kill, never on its own.

The classifier rule itself is unchanged (same bands, same thresholds,
same three classes). Proof gained 4 fixtures (the exact 99722 d104,
99723 d53, finishprobe d121/d131 rows, plus a synthetic-corpus
runCensus test of the matcher) and re-ran **23/23 green**; the census
was re-run end to end. Before/after deltas (frozen → corrected):
artifact traces 6 → 7; low-entry legitimate 0 → 1; suspect kills 2 →
3; kill events matched legitimate 8 → 21 (the tbretreat-b-confirm
armed kills, the finishprobe kills, the 99722 d85 kills, three
killersim2 kills); trace-entry100plus-not-kill events 56 → 2 (the
pyrrhic pair); trace-unclassifiable-high events 0 → 38 (killing fight
entered ≥100, max unrecorded — clean in substance). No verdict-change
entry above depends on the frozen numbers; every number in this file
is the corrected run.

## Analyzer notes and limits (disclosed, not hidden)

- **Reason-string wording.** The analyzer's unclassifiable reason reads
  "no entry HP recorded (recorder gap: tbFights-only / field-fight
  row)" even on the 34 field-fight rows that DO record entryHp and
  only lack entryMaxHp. The class is right per the prereg (max
  missing → unclassifiable); the string mislabels which field is
  missing. Cosmetic; disclosed here rather than silently re-run for.
- **Day-exact matching.** Kills match traces by (seed, day, mid)
  exactly. The 99723 midnight kill (fought d53 at 3/1200, logged d54)
  therefore reads unresolvable-no-trace in the JSON, although the
  tbretreat-b evidence and the d53 trace prove it legitimate in
  substance. The ±1-day join the tbretreat-b evidence proposed is a
  matcher change for the next census, not this one.
- **Cross-leg matching.** Traces match kills by (seed, day, mid)
  across ALL files, so a kill in one leg can match a trace from the
  other leg of the same seed. For the 3 suspect kills this is verified
  same-trajectory: 53006 d149 is re-recorded across three staged files
  of one deterministic trajectory (congtrace verified byte-identical);
  99722 d104/d119 are single-file matches. The 93021 d83
  trail-artifact kill has records in both legs — possibly two separate
  20-HP beasts, one per leg — counted as one distinct (seed, day, mid)
  event.
- **Pyrrhic pair naming.** The two fightinterior pyrrhic kills read
  `trace-entry100plus-not-kill` in the JSON because their fight rows
  end `scholar-death`/`unfinished` (the pyrrhic path writes
  waveKillLog directly and bypasses `recordWaveKill`), not because
  their entries are suspect: both fights are traced at canonical pack
  entry. They are clean in substance; the label is a matcher-naming
  gap, recorded here.
- **The 99732 Audit, and the 55005 Eulogy, are the shape to watch.**
  A 20-HP beast that FLEES or is fought twice (20/20, then 10/20)
  still kills: the 99732 Audit fled at 20, came back at 10, and killed
  the scholar; the 55005 Eulogy was fled from at 20 and then killed
  its villager. Spawn-crippled beasts are not just free kills — in
  the field they are still lethal to the person arguing with them.
- **No reproduction probes were run.** Three trail-artifact kills
  (99207 d118, 96811 d112, 93021 d83) could be settled by a minimal
  deterministic reproduction on their recorded seeds — but the prereg
  requires an amendment naming the probe first, and none is named.
  They stay unclassifiable-with-reason. A future arm may write that
  amendment; this one does not run ahead of it.

## Village assessment (plain words)

Eight villages in the tbretreat pilot band, two ever meeting a wave-4
beast — and the one village that lived did it with a kill that was
never a kill: a Reunion with twenty hit points, met in the field by a
villager, dead in two rounds to twenty damage. Take that away and the
survivor's story is thinner and stranger: Leo Martin killed two real
beasts on day 85 — a Strike ground down over twenty-four rounds, an
Influencer over eleven — and then died in the wild, and the village
carried on to day 150 with nobody left who had ever killed a wave-4
beast for real. The confirm band tells the same story from the other
side: its only post-first-blood kill was a solo scholar walking into a
chapel with twenty hit points and ending it with one swing, and the
sixty days between the first killer's death and that kill were not a
village learning to kill — they were a village waiting for a crippled
beast to wander by. The census does not say the villages never kill
wave-4 beasts. It says the recorded kills are mostly unverifiable —
299 of 367 events with no entry-HP record at all — and the few that
can be checked split into real grinds and born-crippled gifts, with
the gifts concentrated exactly where the verdicts leaned on them: the
confirm's one post-blood kill, the pilot's one baseline kill. The
spawn bug is the quiet thumb on the scale: until the fix congtrace-a
named lands and the seeds are re-run, every wave-4 kill count from a
corpus without entry HP carries an unknown number of twenty-hit-point
beasts in it.

## Sense-test read

**One field kill — 99722 day 119, Ines Duarte vs the Reunion.** The
record is a field-fight row: 2 rounds, 20 damage dealt, kill logged
`via: wild`. No transcript line was pulled for this arm (DIAG census,
no SAY read), but the shape is the thing: a villager out in the wild
meets a Reunion — the village you failed, given teeth — and it folds
in two rounds because it was born with twenty hit points. The game
never announces it as anything special, because nothing in the engine
knows the beast is crippled. It reads, from the village's side, as a
triumph; from the census's side, as a gift.

**One grind — 99723 day 53, Xavier vs the Reunion.** Nine scholars fed
themselves to one beast across days 48–53, grinding it from 1200 down
to 3 health, and Xavier finished it at 3 health — six fights the same
day, entries 3386 → 3190 → 1735 → 409 → 188 → 3. That is the legitimate
shape, and the census proves it: the same file carries the whole wound
trail, and the last row enters at 3 of a 1200 max. The contrast with
the artifact kills is the whole census in miniature: a real kill
leaves a trail of the dead; a crippled kill leaves one row and a
twenty.

**One survivor — 99722 armed, day 150.** The village that lived ends
with standing 199, one short of the fifth wave, and — restated — no
living wave-4 killer. Leo's two real kills died with him on day 112;
Ines's gift kill is the only one that survived to the horizon, and it
does not count. The village survived without ever banking a real
killer. That is the scale wall, stated as a village: alive, one point
short of the door, with nobody left who has killed what the door asks
for.

## Metric review

Pre-registered metrics bind this run (prereg, committed before any
judged sim). Primary: GO iff the census is complete across every
listed corpus with every wave-4+ entry-HP<100 trace classified or
explicitly marked unclassifiable-with-reason. **Met: 42/42 traces,
1,049/1,049 dirs, 0 parse errors.** No metric was swapped, re-cut, or
re-thresholded. The tooling correction is disclosed in full above
(alias reads + kill-or-rout matcher; classifier rule unchanged; proof
19 → 23 green; census re-run end to end). Known limitations for the
NEXT run, not re-scores of this one: the unclassifiable reason string
mislabels the missing field; day-exact matching misses the 99723
midnight kill; the matcher should record best-round composition for
the pyrrhic pair; the three trail-artifact kills want a prereg
amendment + minimal reproduction before anyone classifies them. The
Stage-0 smoke and proof legs are not evidence; only the judged census
above is.

## Balanced panel (§15) and telemetry

- `scripts/balance-panel.js`: INAPPLICABLE — no armed leg exists in
  this arm (DIAG census, no policy built, no before/after pair). Same
  outcome as every sibling killer-chain arm: the panel runs its own
  full panel and takes no corpus input. No compare `.md` is fabricated.
- `scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-06/perseed-congtrace-a/*.json' --metrics
  national,table,wins,exiled`: **REFUSED** — "refusing recorder-corpus
  input: all 1 --current rows carry top-level anchorCommit, so they are
  sweep recorder rows, not runs." Recorded as the result, same as every
  prior killer-chain arm. No telemetry deviation check was possible on
  this corpus; the wall numbers are the instrument's own. No baseline
  roll-forward.

## What this arm does NOT claim

- Not a lever: no policy was built, no pilot was spent, no
  gate/price/deed change is proposed. The spawn fix is named by
  congtrace-a (resolve the def for object-form `mdef` in
  `spawnWorldMonster`, or pass the full def at the wanderer call
  site) — still unbuilt, still the next proof (re-run 53006/99722
  after the fix; the artifact kills should vanish).
- Not a flip of any verdict: the two restated verdicts (stageally
  confirm NO-GO, tbretreat pilot GO) stand on their other gates and
  bars. The restatements are the deliverable.
- Not a claim that every wanderer spawn is 20 HP: proven live for the
  53006 Congregation only. The other artifact traces match the same
  code shape (`{id}` object + `|| 20` fallback) and the same 20/20
  signature, but their spawn path is unproven — source
  unknown-with-reason.
- Not a claim about the 299 unresolvable kills: they are unresolvable,
  not clean and not artifact. Any future kill-count claim from those
  corpora must carry the bound.
- Not a win: 0 wins anywhere in the census; no wave-5 kill matched an
  artifact trace — all 10 distinct wave-5 kill events in the corpora
  are unresolvable-from-corpus (6 no-trace, 3 field-kill, 1
  tbfight-won-no-entryhp, incl. 55007 d100 Editor).

## Next blanks (for the loop, not this arm)

1. **The spawn fix** — resolve the def for object-form `mdef` in
   `spawnWorldMonster` (or pass the full def at the wanderer call
   site). Then re-run seeds 53006 and 99722: the d149/d104/d119 kills
   should vanish, and the d85/d53 grinds should stand. That re-run is
   the fix's proof, not this arm's.
2. **The three trail-artifact kills** (99207 d118, 96811 d112, 93021
   d83) — a prereg amendment naming a minimal deterministic
   reproduction on each recorded seed, then the probe. They are the
   most likely next artifact kills, and the amendment is the gate.
3. **Entry HP in the stageally recorder** — the pilot and confirm
   corpora (32 files, 44 kill records) carry no entry HP at all. The
   next staging arm should record entry HP on its tbFights rows, or
   its kill counts will land in the same unresolvable bucket.
4. **The ±1-day kill join** — the 99723 midnight kill proves the
   day-exact join loses real kills. The next census should join ±1
   day and say so in its prereg.
5. **The 99732 Audit shape** — a 20-HP beast that flees, then kills
   the scholar at 10 HP. Spawn-crippled beasts are still lethal in
   the field; the fix's re-run should check the field channel too,
   not just the TB kills.

## Proof and commits

- Proof `scripts/test-entrycensus-20261106.js`: 19/19 green before
  the first judged census run (known traces: 53006 d149 Congregation
  20/20 → artifact; Eulogy 675/900 → legitimate; Reunion 123/1200 →
  legitimate; tbFights-only row → unclassifiable). After the tooling
  correction the proof is **23/23** (4 new fixtures: the exact 99722
  d104, 99723 d53, finishprobe d121/d131 rows, and a synthetic-corpus
  runCensus test of the kill-or-rout matcher), re-run green before the
  corrected judged census, and re-run green again after each rebase
  onto current master (5ba7f167f, then 408ba9648).
- Prereg committed before any judged sim (uncommitted at adoption;
  committed with this run — see below). Analyzer + proof + prereg +
  evidence + JSON table committed with this file.
- Judged corpus: the committed `evidence/` tree itself (1,049
  perseed dirs, 21,702 files). Analyzer outputs: frozen first pass
  (superseded — see Tooling correction) and the corrected run, the
  latter committed as `evidence/2026-11-06/sim-entrycensus-a.json`
  (the /tmp working copies are ephemeral; the committed JSON is the
  record). The census was run a third time after the rebase onto
  current master (5ba7f167f) because the rebase brought in two new
  perseed corpora (`perseed-partydamage-b`, 16 files; `perseed-bondinit-b`,
  33 files); all numbers in this file are the third run's. A second
  rebase (onto 408ba9648, journey-scale r105) added no perseed corpus
  and no src/data or src/js change, so the census numbers stand
  unchanged on the final tip.
- `node scripts/check.js --quick`: **283 passed, 7 failed in 990s**
  (exit 1; output `/tmp/checkquick-entrycensus.log`). All 7 failures
  pre-existing on this branch base and unrelated to this arm: 5
  proof-freshness failures (measurement-proof-update,
  measurement-workflow, phone-frame-proof, mobile-combat-cadence,
  occupation-panels), 1 timeout (capable-bot, 120s job limit under
  parallel load), 1 src/js behavior failure (establishment-r20
  racks-voice gate). None of the 7 references the new files, and none
  enumerates a directory the new files could enter. No src/js changed
  here, and this arm's own proof test is 23/23 green on the rebased
  tip (see above).

## Convergence

**scale-onramp / winnability chain: converging, NOT converged.** The
contamination is now sized, not guessed: 3 artifact kills in 367
distinct recorded wave-4+ kill events, 7 artifact traces in 1,625
traced fights, across 4 seeds and 2 bands — and an 81% uncertainty
bound over everything else, because most corpora never recorded entry
HP. Two verdicts are restated and none flips, which is itself the
news: the kill evidence was thin enough that removing three kills
moves numbers but not verdicts. The binding constraint is unchanged
(the fight interior, killer survival, the pair) — but the instrument
reading it is now honest about which kills were real. Next run: the
spawn fix, then the re-run that should make the artifact kills vanish.
