# sim-vetkilltale-a — veteran-kill fireside tale for repeat wave-4+ kills

Run: `fleshout-20261107T0515Z`, Loop A, axis scale-onramp / winnability
chain. Tracker blank: sim-findings.md line 1848 (FIRESIDE TALE NEVER
FIRES FOR REPEAT WAVE-4 KILLS OF KNOWN BEASTS, from
sim-durablepair-a).
Prereg: `evidence/2026-11-07/sim-vetkilltale-a-prereg.md` (binding,
committed a2511fe2c before any judged work).

## VERDICT: GO — tale fires on 4/4 eligible repeat wave-4+ kills (100%),
## 0% baseline, trajectories identical 8/8

| leg | seeds | vet queued | eligible | moot | told | rate |
|---|---|---|---|---|---|---|
| baseline (`VETKILLTALE_OFF=1`) | 8 | 0 | 0 | 0 | 0 | — (0%) |
| armed | 8 | 4 | 4 | 0 | 4 | **100%** |

GO bar was >= 80% armed with 0% baseline, trajectories identical, and
the unit proof green including the no-debate-rerun negative and the
first-tale-once guard. All four hold. No extension was needed: eligible
n = 4, above the preregged < 3 extension trigger. Analyzer verdict
file: `evidence/2026-11-07/vetkilltale-a-verdict.json` (exit 0, no
failures).

## The change (plain words)

Until now, when a villager killed a big beast the village already knew
— a second Congregation, another Editor — the fire said nothing about
it. The first kill of a new beast gets a fireside telling; every kill
after that passed in silence. Now the killer tells that story too:
they stand up at the fire, name the beast (by the name the village
already gave it) and say they put another one down, describe what it
did, and the people around the fire react. The naming argument is
never re-opened — the tale names the beast and the killer and stops
there. It changes nothing about the game underneath: no fight, no
death, no standing, no readiness bar moves. A feel change only, hence
`[needs-eyes]` on the commit.

## What changed in code (src/js/game.js, +99/−2)

- `queueKillerTale`: a kill of an already-reported / naming-kicked /
  village-named type no longer returns silently — it routes to the new
  vet queue when the monster is wave 4+. Wave <= 3 repeat kills stay
  silent, exactly as before.
- New `queueVetKillerTale` / `tellVetKillerTale`: one untold vet tale
  per (type, killer); told from the same night fireside beat
  (`killerTaleBeat`); prose names the killer (`firstRef`) and the
  beast (`monsterDisplayName`, knowledge-gated, never the true name),
  quotes up to two attack telegraphs the killer actually saw, one or
  two listener reactions, delivered through `sayHavenNews` kind
  `'tale'` (same relay as the first tale). Cosmetics use the dedicated
  mulberry32 stream (`'vet|'` hash prefix) — no main-stream RNG.
  Logs to a bounded `state.vetKillerTaleLog` (20) and fires
  `tele('vet_killer_tale', …)`.
- `tellVetKillerTale` deliberately does NOT write the codex entry: no
  `reported`, no `knowers`, no `monsterNewsCheck`, no proposals, no
  `villageName`. The debate is settled; the tale is narration only.
- Same teller rule as the first tale: a killer dead before nightfall
  takes the tale with them (moot, marked told, never told).
- `killerTaleBeat`: the early return now requires BOTH queues empty —
  the original `if (!pending.length) return` would have skipped a
  night with only vet tales pending. (Caught by the proof test before
  the pilot: the first run was 22/30 with every vet-tale assertion
  failing on the silent beat.)
- Measurement switch (TALETELL_OFF precedent in the same function):
  `VETKILLTALE_OFF=1` queues nothing; browser-safe
  (`typeof process` guard), so the lever is always on in the browser.
- No naming-debate, deed-gate, win-price, or readiness-bar change.
  No other file touched.

## Proof

`scripts/test-vetkilltale-20261107.js` — **30/30 green**:
1. repeat wave-4 kill → vet tale queued, told at night, names beast +
   killer, `vet_killer_tale` tele fired, no first tale.
2. Negative: reported / knowers / proposals / villageName byte-identical
   across the vet tale (snapshot before the kill vs after the night).
3. Guard: first-report kill still tells exactly once (first tale only).
4. Wave gate: wave-3 repeat kill queues nothing.
5. Scholar kill of a reported wave-4 type queues nothing.
6. Dead killer before nightfall → moot, never told.
7. Two repeat kills, same killer, before night → one tale.
8. `VETKILLTALE_OFF=1` → nothing queued, nothing told.
Existing tale tests still green on this tip: `test-taletell-behavior.js`
12/12, `test-taletell-red.js` exit 0, `test-killbeat-20261019.js` 19/19.
`test-taletell-measure.js` (not green-listed; always exits 0) prints
its 2026-10-13 lever verdict "KILLED AT PILOT" with a scholar-fed
parity divergence (off 0.959/lat 6d vs on 1/lat 3d) — that verdict is
about the 2026-10-13 first-tale lever, not this arm; this arm's change
cannot move it (no debate writes, no main-stream RNG, vet tales live
in a separate queue/log). Recorded here, not re-judged.

## Pilot (band 99641–99648, 8 seeds, 150d death-aware, competent verbatim)

Documented reuse per the prereg (grind band, cited in
sim-killersurvive-b-prereg.md — NOT fresh, reused with justification).
Driver `scripts/vetkilltale-driver-20261107.js`, analyzer
`scripts/vetkilltale-analyze-20261107.js`. Corpora:
`evidence/2026-11-07/perseed-vetkilltale-a/` (16 files, 0 instrument
errors). Baseline days reproduce the committed grind corpus exactly
(150/132/145/71/137/125/99/64).

| seed | days | end | w4 kills | vet queued → told |
|---|---|---|---|---|
| 99641 | 150 | survived | 7 (+2 w5) | 3 → 3 |
| 99642 | 132 | village-lost | 1 | 0 → 0 |
| 99643 | 145 | village-lost | 3 | 0 → 0 |
| 99644 | 71 | village-lost | 1 | 0 → 0 |
| 99645 | 137 | village-lost | 3 | 1 → 1 |
| 99646 | 125 | village-lost | 2 | 0 → 0 |
| 99647 | 99 | village-lost | 1 | 0 → 0 |
| 99648 | 64 | village-lost | 0 | 0 → 0 |

The four eligible repeats, all told:
- 99641 d106 Vasyl kills an Audit in the wild (reported) → told d107.
- 99641 d143 Vasyl kills a Timeslot + Pavel kills an Editor (both
  companion kills, both reported) → both told d143.
- 99645 d94 visjoin_75 (Dias) kills a Congregation as companion
  (reported) → told d95.
- All four killers were alive at the night beat (moot 0). The other
  repeat kills on the band were scholar kills (99641 strike d115+d116,
  99643 influencer d121+d144) — the scholar's path is
  identifyMonster/tellbeast, so no tale is queued for them, by design
  (same as the first tale).

Trajectory identity (prereg criterion (c)): days, endReason,
waveKillLog, and first-tale count identical baseline-vs-armed on 8/8
seeds. The lever is narration-only, proven, not asserted.

## Sense-testing (read all four tales)

- 99641 Vasyl / The Loud Beast (Audit): "You all know The Loud Beast
  by now. I put another one down today." Telegraphs quoted verbatim
  (the abacus beads, the surprise inspection). Luis: "Say that again —
  slower." Ava: "Tell me you didn't go alone." Closes: "We know the
  name. We know the hand, too."
- 99641 Vasyl / The Timeslot + Pavel / The Editor, same night, both
  told: two distinct killers, two distinct beasts, no confusion
  between them. Pavel's Editor telegraphs (the scissors, the cutting
  room floor) read as his own fight, not a copy of Vasyl's.
- 99645 Dias / Big Loud (Congregation): "You all know Big Loud by
  now." The village name lands — the tale uses the name the debate
  settled, it never re-opens the naming question, and no line asks
  "what are we calling it".
- Judgement: the tales read as fireside prose, not counters. Each
  names the beast and the killer, quotes what the killer saw, and ends
  on remembrance rather than a question. The one wording risk — "I put
  another one down today" when the killer did not make the first kill
  of that type either — reads correctly in context: "another one" means
  another of a known kind, not another of mine.

## Wall numbers (pilot, both legs identical)

| leg | national | table | wins | wave-4 reach | wave-5 reach | w4 kills | median survival |
|---|---|---|---|---|---|---|---|
| baseline | 0 | 0 | 0 | 7/8 | 1/8 | 18 | 128.5d |
| armed | 0 | 0 | 0 | 7/8 | 1/8 | 18 | 128.5d |

No village reached national, let alone the table, on either leg — the
scale wall stands untouched by this narration change, as it should:
the lever was never meant to move the wall, only to make the kills
that do happen legible at the fire. Living killers at end: identical
across legs (trajectory identity). 99641 remains the furthest village
(150d survived, standing 400, 7 wave-4 kills, 2 wave-5 kills — and
still village rank).

## Village assessment (plain words)

Eight villages, eight stories that mostly end the same way: the
village dies before day 150, having killed a handful of the fourth
wave's beasts. What changed is that four of those kills now get
remembered out loud. On 99641, the strongest village, three killings
in one run — Vasyl twice, Pavel once — are now three fireside
tellings instead of three silent log entries: the village hears that
Vasyl put down the Audit and the Timeslot, that Pavel put down the
Editor, and it hears their names. On 99645, Dias's second Congregation
gets its telling the night after the kill. The other villages had no
repeat kill to tell, and the fire stayed quiet about it — correctly.
Nothing about who lives or dies changed, because a story was never
going to save a village. But the village now remembers its killers by
name at the fire, which is what the finding asked for.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-07/perseed-vetkilltale-a/*vetkilltale-armed.json'
--metrics national,table,wins,exiled` — REFUSED the pilot corpus:
"refusing recorder-corpus input: all 8 --current rows carry top-level
anchorCommit". Same as every prior killer-chain arm. Baseline NOT
rolled. Wall numbers above are the instrument's own.

## Metric review (§14)

Pre-registered metrics bind this run; the GO verdict is judged against
the prereg header, not re-scored. (a) 4/4 = 100% >= 80% armed; (b)
0% baseline; (c) 8/8 trajectories identical; (d) proof 30/30
including the no-debate negative and first-tale-once guard. All hold.
- Small-n rule: eligible n = 4, above the < 3 extension trigger, so
  no extension to 99681–99696 was run. The 4 is small in absolute
  terms but it is the whole eligible population on the band, and the
  unit proof (deterministic firing on a repeat kill) carries the
  mechanism; the pilot confirms it live-fires at the same rate.
- One instrument note: `killerTaleLog` is capped at 20, so the
  first-tale count comparison saturates at 20 on most seeds — the
  trajectory check leans on waveKillLog equality (byte-identical) for
  its strength, and the count comparison is the weaker half. Recorded
  for the next arm, not a verdict issue here.
- One known interaction, narration-only: vet tales route through the
  same `pendingHavenNews` queue (cap 20, oldest spliced) as first
  tales. On a night with more than 20 queued haven-news lines, a vet
  tale could displace an older queued line. The queue flushes every
  night at the haven and the pilot showed no displacement (log/tele/
  say counts agree on all 8 seeds); no state is ever at stake, only
  delivery order. Not a defect, noted for the record.

## Findings for the backlog

- (No new finding filed: this arm closes sim-findings.md line 1848.
  Mark it `fixed` on landing.)
- Killer-death invisibility (open, from sim-killersurvive-b): nothing
  in the fiction marks that a wave-4 killer died. This arm tells the
  kill; the death is still boilerplate. A death-side telling is the
  sibling blank, not built here.

## Proof and commits

- Proof `scripts/test-vetkilltale-20261107.js`: **30/30 green**.
- Prereg committed a2511fe2c before any judged work.
- Implementation + proof + driver + analyzer committed f85082ca9
  (`[needs-eyes]` — feel/narration change).
- Pilot corpora (16 files) + verdict JSON committed with this
  evidence file (see closeout commit).
- `node scripts/check.js --quick`: **281 passed, 9 failed in 1200s**
  (this worktree, 2026-11-07). 8 of the 9 are the standing pre-existing
  profile (measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  trust-observer-neutrality [120s timeout], capable-bot [food-deed
  assertion], establishment-r20-fixes). The 9th,
  measurement-cache-flags, FAILS ONLY under parallel load — re-run
  standalone on this tip it passes 4/4 (a load flake; the sibling
  nextfight-a check.js was running concurrently). This arm's own proof
  test is not on the green list (same as every recent arm's proof test
  — none of killersurvive/durablepair/tellinghook are listed), so it
  runs standalone: 30/30. No src/js-adjacent green-list test touches
  this arm's files, and the tale-area tests (taletell-behavior 12/12,
  taletell-red exit 0, killbeat-20261019 19/19) pass on this tip.
  NOTE: measurement-proof-update fails on this stale base because the
  retained proof predates the sibling proof-refresh landing
  (b690777cc); it is expected to clear after the rebase — re-run at
  closeout and record the result here.
- Worktree contains only committed work at closeout; branch ready to
  merge. No push, no version bump, no live verification (coordinator
  owns the merge).

## Convergence

**scale-onramp: converging, NOT converged.** The vet-kill tale closes
the narration blank (sim-findings.md line 1848): repeat wave-4+ kills
are now told at the fire, 4/4 live, with the debate untouched. It
moves no wall number — national/table/wins are 0 on both legs, no
village banks two living wave-4 killers and sits. The chain's binding
links stay upstream (next-fight survival, durable pairs).
