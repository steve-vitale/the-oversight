# journey-scale r73 — Lane A, leg 3 SCALE (2026-11-02)

**Run id:** laneA-scale-2026-11-02T19:45CST (scheduled 19:45 CST 2026-11-02).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@90637bc7c at branch creation (includes r72 Q2 nod-cycling
fix f375ce36b, verified present).
**Pre-register:** evidence/2026-11-02/journey-scale-r73-prereg.md
(written and committed before any scored seed ran).
**Change set at closeout:** ZERO src/js, ZERO src/data. Tooling only:
the speak-it-back test migrated to the shared harness (Q2, gate met —
see below) + r73 driver/analyzer (r72 clone, labels/seeds/EVIDIR only,
diff verified) + evidence. Gating freeze honored; perception law honored
(all instruments read-only; pickers only press offered menu items).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Pre-flight clean:** main-tree `git status` empty, disk 24%,
  `git pull` already up to date, worktree-reap ran (8/16 active — all
  dirty/held lane-B and build trees, correctly untouched).
- **Registration was slow, not stuck:** worktree-register took ~5 min
  (git worktree add under heavy sibling load), same as r67/r68/r71/r72.
  No action.
- **Heartbeat:** manual heartbeat at registration verified landed
  (01:49Z), plus a setsid+nohup loop re-beating every 10 minutes; the
  loop's landing was verified by read-back of the registry heartbeat,
  not trusted from a silenced log (2026-10-25 lesson).
- **Safe-commit index clobber struck on the prereg commit**, same class
  as r66–r72: after a correct private-index commit, the worktree's main
  index lied (3 files staged-as-deleted + untracked). Repaired via
  HEAD-blob cacheinfo, verified: `git status` clean, `git diff HEAD`
  empty, hash-object matches HEAD. The commit itself was correct.

## Verdicts (binding questions, answered)

### 1. SCALE CONTINUITY (report-only + verdicts)
Fresh quad 85071–85074, r72 instrument clone, SUBJECT_FIRST +
GOSSIP_FIRST, DAYCAP 180, death-aware stop. Pilot gate passed on
85071 (no crash, 2 pilgrimages).

| seed | end | day | pop | pantry | rank | seat | arc | maxWave | pilg |
|---|---|---|---|---|---|---|---|---|---|
| 85071 | SCATTERED (hunger, 5th day) | 79 | 3/3 | 0 | regional | lesser | 4 | 3 | 2 |
| 85072 | SURVIVED to cap | 180 | 7/7 | 10,222 | regional | lesser | 4 | 4 | 53 |
| 85073 | DIED OUT (attrition) | 30 | 0/0 | 14,050 | village | none | 3 | 3 | 0 |
| 85074 | SCATTERED (hunger, 3rd day) | 40 | 3/3 | 0 | village | none | 3 | 2 | 6 |

- **A thinner band than r72, same shape where it reaches the leg.**
  Only 85071 and 85072 reached the scale window at all; 85073 died
  out at day 30 and 85074 scattered at day 40, before any scale beat
  could stage. Where the leg IS reached, the shape is unchanged:
  lesser seat priced/waiting/announced and never sat (85071, 85072),
  full seat 0/4, wave 5 0/4, national 0/4, global 0/4 at end.
- **85071 — the village that priced the seat and scattered.** Lesser
  seat, arc 4, fusion installed — then a pantry cliff (8,865 kcal at
  d74 → 0 at d76) and five hungry days scatter it at d79. The table
  waits for no one, again — the third band in a row where the
  waiting period's price is paid in food.
- **85072 — the village that held.** 180 days, 7/7 alive, a 3-link
  network (1 lead subordinate trust 56 aged 155d + 2 covenant links
  trust 67/63), lesser seat waiting and announced, 53 pilgrimages.
  National correctly NOT staged: LEAD needs 3 subordinates (has 1),
  covenant needs 3 peers (has 2). The ladder's bars hold; the village
  is one link short of a polity, not blocked by a bug.
- **85073 — the village that died rich.** Pantry 14,050 kcal at the
  end, but the roster emptied by combat and sickness attrition
  ("No one is left to pick up the Codex"). Food was never the
  problem; bodies were. A landing/establishment-band death wearing a
  scale-leg seed number — it says nothing about the scale ladder.
- **85074 — the village that starved and sickened early.** Sickness
  deaths d7–d30, starvation deaths d27–d32, scatter on the third
  hungry day at d40. Same hunger ending as 85071, fifty days sooner.
- **Duty counts: TWELFTH consecutive 0/4 band.** Weapon-craft lines 0,
  deadfall-duty lines 0 on all four seeds; weaponless villager-days 0
  across all 1,836 villager-days (every knower-day armed, all from
  pack/both sources). The armed-gate classification reproduces again:
  there is nobody for the self-craft duty to fire on, so the duty
  counts stay zero without any code change.
- **Gossip exposure, this band:** 2 sittings (both 85072), 2 gossip
  picks, 16 THEM lines — gossip-first fired in every sitting it
  could. (The other seeds ended before day 90, so no sittings.)
- **REACHABLE:** the scale window itself is reachable — 85072 lived
  in it for 100+ days with a real network. **FUN:** the 85072 arc
  (courtship, covenants, a waiting seat, 53 pilgrimages) is the leg
  working as designed. **WINNABLE:** not demonstrated this band —
  no seed sat even the lesser seat, and half the band never reached
  the window; but the blockers here are food and early attrition,
  not the scale gates (85072's one-link-short polity is correct
  behavior, not a wall).

### 2. SPEAK-IT-BACK HARNESS MIGRATION: GATE MET — migration lands
Diagnosis (old file, before any change): `HARNESS ERROR: TypeError:
Cannot read properties of null (reading 'village')` — `Game.state`
null at init under the old eval-boilerplate load, proven pre-existing
on this base. Its mediated-reaction section (§10) was untestable.
Migration (tooling only, zero src/js): load through
scripts/sim-harness.js `loadGame` + `setupGame`, every assertion kept.
Three failures surfaced on the first migrated run; each was
investigated to a root cause, none waved through, no assertion
loosened:
- **§6 mediated failure — setup difference, not a game defect.**
  Harness villagers carry `person.languages` (English), which
  `npcLangs()` prefers over `bgLangs` — so the test's bgLangs-only
  "foreign speaker" was silently an English speaker and commLevel
  read 'full'. Fix in the test: set `person.languages` too, restoring
  the test's stated premise (native Italian, no English).
- **§7 trustGain crash — API removed, law preserved.** `trustGain`
  was removed 2026-10-08 (dead method, zero callers); the
  mediated-halves law lives in `resolveConsequence` (convo-scene.js
  header, kept from trustGain). Probed: +4 → 14 unmediated, +4 → 16
  mediated, −3 → 13 — the test's exact numbers through the surviving
  entry point. §7 now drives `resolveConsequence`.
- **§8 speak_back gating — menu-cache staleness, test method stale.**
  `buildMenu` caches the offered menu per sitting (replyMenu keyed
  on thread/depth/spent, NOT on langExposure or translatorStage), so
  re-reading choices after mid-sitting state surgery returns the
  sitting-start menu. The offer logic itself is correct
  (`convoSpeakBackChoice` returns the choice at exposure 5). The
  test now gives each condition its own fresh sitting — the way a
  real player meets the offer — with all three assertions' meanings
  unchanged. (In real play turns change the cache key, so the stale
  window is only same-turn state surgery; not filed as a game
  defect, but the cache key's omission of exposure/stage is noted
  here for a future pass.)
Result: **47 passed, 0 failed** on unmodified game code. Clause (a)
met (runs, mediated-reaction assertions pass), clause (b) met
(failures investigated, documented above), clause (c) — see Tests.

### 3. PEOPLE CHECK (sense law — both transcripts read in full)
Only 2 transcripts exist (85071 ended d79, 85073 d30, 85074 d40 — no
day-90/120 sittings). Both are with the same villager, Asher — a
driver artifact (the picker falls back to first-alive once every
roster member has convoCount ≥ 2), named here so the narrowness of
this band's people check is not hidden.
- **85072 d90 Asher (favor → subject → gossip):** real in structure.
  The opener is a genuine hook (dreams about humming pods — "Tell me
  I'm not the only one"), but the subject-first picker drops it
  ("Forget I said anything") for the gossip chain. The gossip itself
  is coherent village news with no fabricated shared history: Lena
  the army medic, the player's Duel win on the cameras, Amina
  drinking creek water unboiled, Lorena talking to the garden, the
  stray dog that lets Devon touch it. Ending resolves politely.
  Wrinkle, known class: the opening want (seek_taken, stage 1) is
  abandoned by picker design, not by the NPC — the want stays planted
  at pre-close.
- **85072 d120 Asher (subject → gossip):** real. A strong character
  opener ("I don't want to be in charge. I want us to survive"),
  again diverted to gossip by the picker: Lena is back, Asher's own
  confession that he once walked away from Haven, a lost waterskin
  Elijah sniffed out in an hour. Personal, specific, no repeats, no
  filler loops. Ending ("Good. We've got a plan forming") is mildly
  generic but resolves.
- No verbatim repeats, no fabricated shared history, no filler loops,
  no static menus in either sitting. The r72 nod-cycling fix has no
  in-band transcript instance (no nonverbal sitting fired) — the
  proof test, not the quad, remains its evidence.

## Metric review
- No metric re-scored mid-run. Census scalars unchanged from r51's
  list; duty-line and gossip-exposure counts from the r73 analyzer
  (r72 analyzer, labels/seeds only).
- Note for the NEXT run: the scale quad's pilot gate (pilgrimages >
  0) passed on 85071 but the band still lost half its seeds before
  day 90, leaving only 2 transcripts. If people-check breadth keeps
  thinning, a future run should consider a transcript day inside the
  reached window (e.g. day 60) rather than only 90/120 — proposed,
  not changed here.

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-census.json --current
'evidence/2026-11-02/journey-scale-r73/journey-scale-r73-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ one LOUD line, investigated same-run, EXPLAINED (band variance, not
a bug):
- `census.pantryKcal newly appeared: baseline 0 -> current 24272
  (n=4 files)`: the baseline is an old band's SUM (r72's band ended
  with every pantry at 0 — all hunger-scattered or died out), not a
  threshold. This band's sum is 0 + 10,222 + 14,050 + 0: 85072
  survived to the cap with food left, and 85073 died of attrition
  with a full pantry — neither end state zeroes the pantry. No
  mechanism changed; baseline NOT rolled (r68's decision stands).

## Tests
- `node --check` clean on the r73 driver, analyzer, and migrated
  speak-it-back test.
- Speak-it-back migrated: **47 passed, 0 failed** on unmodified game
  code (see §2 for the three investigated failures and their fixes).
- Neighbors green: foreign-react-nod-r72 **10/10**, gossip-r67
  **11 checks passed**, goal-opener-deep-r67 **7 passed, 0 failed**.
- check.js --quick (on the branch code): **284 passed, 6 failed in
  710s**. The 6 are the SAME pre-existing failures r72 named (same
  files, individually re-run to confirm on this base:
  godpath/test-measurement-proof-update,
  godpath/test-measurement-workflow,
  godpath/test-mobile-combat-cadence,
  godpath/test-occupation-panels,
  godpath/test-phone-frame-proof, and
  test-establishment-r20-fixes-20261020.js with the same racks-full
  "next day voices once more" gate assertion). The count moved from
  r72's 283/7 to 284/6 exactly by r72's capable-bot section-7 re-seed
  fix, which is on master — no NEW failure. Q2 clause (c) met.
- check.js --quick also re-ran the migrated speak-it-back file? No —
  it is not on the quick list; it was run directly (47/47 above).
