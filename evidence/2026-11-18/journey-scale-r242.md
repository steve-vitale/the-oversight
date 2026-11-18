# Journey scale r242 — the tableActive distinction, staged (Lane A, leg 3, days 80–140)

Run: `oversight-playtest-loop`, Lane A, r242. Scheduled Wed 2026-11-18 10:45 CST.
Branch `journey-scale`, base master `430b849d2` (r237 deepening). Seeds **103841–103848**
(fresh band; 0 hits in all journey/sim preregs and goal evidence). Policy frozen:
`scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON + STAGE herald;
sortie INERT; SIT false; DAYCAP=140, death-aware stop.

Prereg: `evidence/2026-11-18/journey-scale-r242-prereg.md` (Q1 staged
tableActive distinction, Q2 national/deed gate, Q3 regression guards, Q4 people
check, Q5 census + spotter + W5, Q6 dialogue watch). Rotation read `3`; written
back to `0` at closeout on success.

## The question, in plain words

When a village hands over a great deed (a capstone) while the monster it
honours is still alive, the game opens a long waiting window — about 74 days —
before the final table sitting. During that window the old code treated the
table as "active" and told the village's war council to stand down, even though
no sitting was actually happening. The monster stood in the open and the
village never marched. This run proves the fix: a new question the code can
ask — "is a sitting actually live right now?" — so the council only stands
down during a real sitting.

## Q1 — THE FIX: GO (corrected instrument; both verdicts reported)

The panel ran 8 seeds × 2 arms (A = old behaviour, B = the fix), staged so
every village was handed a capstone while its herald still lived.

- **Arm A REPRODUCED the mask:** worst seed 103848 held **45 present-held
  mercy rows** (days 96–140, herald present, table "active" but no sitting
  live). Bar was ≥7. The defect is real on this band.
- **Arm B held 0 mercy rows on every seed** (table-predicate holds only) and
  **90 mercy-window musters proceeded** with the herald present. The one
  held mercy row on arm B was a coalition 8 blades short (`short:8`) — the
  muster had passed the table check and hit its real constraint, not the
  table holding it.
- **Live-sitting holds: 0 fired on either arm** — no live sitting ever
  coincided with a muster/march row on this band (ts=true rows: 0), so the
  "holds still fire when a sitting coincides" leg is vacuous in the panel.
  It is covered directly by the unit proof test (`test-table-sitting-20261117.js`,
  40/40 green, which includes live-sitting cases). Not a gap in the fix; a
  gap in what this band could show.
- **MUSTER and MARCH both MOVED on both arms** (2 titans slain each); wave-4
  fights 88/87, kills 11/11; living-veteran peak 5.

### Instrument correction, disclosed (r237 precedent)

The analyzer as first run said **NO-GO**: its mercy-held count counted ANY
held mercy row, and arm B held one — the Nielsen `short:8` row. But the
prereg's (a) says the muster "no longer holds **on mercy**": a shortage hold
during mercy is the muster hitting its real constraint, not the table
holding it. The instrument misread the fix's own mechanism (45 → 0 table
holds, 90 proceedings). Corrected mid-run, same as r237 re-pointed a
wrong-reading instrument:

- `mercyHeld` / `mercyHeldPresent` now count only `tableActive` /
  `tableSitting` held reasons; non-table holds during mercy are counted
  separately as `mercyHeldOther` and never feed the (a) bar.
- Proof cases added: (49) stage `armed-unresolved` (see below); (50) arm A
  reproduces + arm B holds 8 mercy days on `short` → GO (pins the
  correction; the old analyzer would say NO-GO). Case (44) already pins the
  control: a `tableSitting` hold on arm B still reads NO-GO.
- Analyzer proof test: **148/148 green** (was 139/139).
- Re-ran the analyzer on the frozen panel corpora: **as-implemented NO-GO**
  (`journey-scale-r242-analyze-a.log`), **corrected GO**
  (`journey-scale-r242-analyze-b.log`). Both logs kept.
- **Verdict on the corrected instrument: Q1 GO. The fix lands.**

### STAGE outcomes (arm-consistent on all 8 seeds)

- 103848 **delivered-natural day 96** (armed d61; the R113 verb delivered the
  trade charter while the herald lived — the r233 shape occurring naturally).
- 4 abandoned never-ready (103841 d73, 103842 d114, 103843 d76, 103846 d77).
- 3 **armed-unresolved** (103844 d68, 103845 d80, 103847 d78) — the villages
  collapsed before the day-120 deadline, so the stage never abandoned.
  Label corrected from `never-armed`: the stage DID arm. Proof case (49).
- STAGE arm-consistency holds (armed/delivered days identical across arms).

### What fighting costs (103848, the seed that matters)

Arm B fought the herald; arm A sat it out. The fight's price, in plain words:

| | arm A (sat out) | arm B (fought) |
|---|---|---|
| deaths | 17 | 22 |
| days at national standing | 46 | 10 |
| wave-4 fights | 5 | 4 |

The village still reached national on day 95 and held on — but fighting cost
five more lives and 36 fewer days standing tall. That is the honest cost of
the fix working: the village acts now, and acting costs blood. It is not a
reason to hold the fix — the fix's job is to let the village act; the deaths
are the game's combat cost, and the village survived the fight.

## Q2 — NATIONAL / DEED GATE: GO (measurement, staging disclosed)

- National reached **1/8** (103848, TRADE 3/3, first day 95, global same
  day; delivered trade_charter day 96). On-ramp open.
- Others blocked on link seasoning (1 more seasoned link: 103841 LEAD 2/3,
  103842 TRADE 2/3) or collapsed before national (103844 d97, 103845 d108,
  103846 d133, 103847 d82).
- Tribute payability: 103843 READY-UNPAYABLE (ready d132, payable 1, 9
  attempts all veterans-short) — the veterans bar is still the tribute
  bottleneck, same shape as r239.

## Q3 — REGRESSION GUARDS: all HOLD/GO

- Vetbar: **GO** (0 disagreements on all 8 seeds, both arms). Phantom days
  noted on 103843 (d48–140) and 103846 (d128–132) — the ladder's veteran
  count and the living count agree; the phantom read is the instrument
  recording days where the bar's shadow count exceeds the living count.
  Disagreements are the guard; it passes.
- Lived-days: **HOLD** — mean 122.6 (A) / 122.8 (B) vs control 123 (−0.3% /
  −0.2%; guardrail ±25%).
- Lesser seat priced: **8/8** — HOLD.
- Spoken-raise: **GO** (19 talks, 7 properly answered, 0 not-offered-spoken).
- Trap-line: **HOLD** (4–5 sittings, 0 defects; mimes answered).
- Betrayal sibling: **HOLD** (2 offers, invite label in the opening, 0 defects).
- Nod-loop: **HOLD** (worst 3x identical `nv:nod` streak).

## Q4 — PEOPLE CHECK: PASS, with the echo at full scale

Read in full (arm B): 103848 day 90 (Pavel, bush pilot, dry, trust 24),
103841 day 120 (Tom, truck driver, withdrawn, trust 90), 103848 day 120
nonverbal (Yuki, librarian, cautious, trust 53), and all 19 raise talks.

- **Pavel d90** is a real conversation: opens on grief ("It's quiet today.
  Wrong kind of quiet."), a walk invitation that lands — fresh tracks, a
  quiet retreat — then a foraging ask for tomorrow, a comfort exchange
  ("Nobody's asked me that in a while"), gossip about Sari. The want
  (ask_favor) escalates honestly to stage 2.
- **Tom d120** is a confession: skimming extra food, ashamed, can't stop.
  The player promises secrecy; Tom thanks them; the player leaves. The
  closing line — "...I'm going to go. This was... fine. It was fine." —
  fits a withdrawn man. No fabricated history.
- **Yuki d120 (nonverbal)** nods three times, each with a distinct Japanese
  line and a distinct reaction — slow, quicker, winding down — then a
  wordless promise (touch chest, point at you). The nod-loop guard holds
  (worst 3x) and it reads as a real exchange ending, not a loop.
- **The echo, at scale:** every one of the 13 accepted/counter raise talks
  ends with the NPC repeating the player's acceptance back nearly verbatim
  — `YOU: "All right. Let's ask them."` → `THEM: "All right — let's ask
  them." You carry the proposal to X.` r239 noted a single instance (Walt)
  as "short and functional, not a defect". Here it is 13/13: the
  raise-accept reply is a fixed line that parrots the player. Same ruling
  as r239 — documented, not fixed in this run: it is a dialogue-content
  change, outside this panel's scope — but the scale is now the story: the
  NPC adds nothing of their own at the moment the proposal is carried.
  Standing content item for a future dialogue pass.
- Minor: Katarina d136 (103843-11) has a garbled fragment ("What's this
  about? making do."); Li d33 has a small stutter ("Um — The free
  things."). Not defects, noted.
- The raise talks themselves are coherent and voiced: Alina's dream of
  rural Ireland, Li's community-gardener thread, Katarina's "strangers are
  just people you haven't disappointed yet", Carmine's trapping résumé
  ("nobody's died from it yet"). No filler loops.

## Q5 — CENSUS

- Survived to day 140: 4/8 (103841, 103842, 103843, 103848). Collapsed:
  103844 d97, 103845 d108, 103846 d133, 103847 d82.
- All books close, unattributed 0, teleOnly 0 on every seed.
- Spotter: no anomaly (spotter skill ≥1 on 1–3 villagers per surviving
  village by end).
- Sortie: 0 lingerer days everywhere (inert, as expected — the step is not
  armed in this leg).
- Wave-5: **0 fights on all seeds, both arms** — no wave-5 entity walked the
  world on this band except 103843 (max 1/day on 2 days). The wave-5 door
  question stays open.
- Daily-play mime (read-only): 35–39 daily mimes, 0 proven daily accepts.
  The lane decision is still owed: teach the shared chooser to take
  betrayal:accept + nv:accept when offered, or keep proving fixes only
  where the driver looks.

## Q6 — DIALOGUE WATCH: the echo shape, confirmed at scale

See Q4. The r239 echo (one line) is now 13/13 raise acceptances. Documented
as a standing content item; no fix in this run.

## Gate and telemetry

- **Gate:** `node scripts/check.js --quick` — **336 passed, 6 failed in 752s**
  (`journey-scale-r242-gate.log`). All 6 failures are pre-existing on the
  base: the identical 6 fail on r237's gate, and the ladder-bundle failure
  is byte-identical (same single assertion, 78 passed / 1 failed:
  "control: 200 monster turns WITHOUT delivery fire the ambient raid —
  fires 0"). The other five (measurement-proof-update, measurement-workflow,
  phone-frame-proof, two 120s godpath deed-attainment timeouts) do not
  reference `tableSitting`/`tableActive`/`MUSTER_HOLD` at all. **No
  regression from this run's change.** The fix's own proof tests pass:
  table-sitting 40/40, analyzer 148/148.
- **Telemetry:** two LOUD lines, both adjudicated, baseline NOT rolled
  (r239 precedent — provenance unrecoverable):
  - `fightsTotal` 241 → 402 (+67%, n=16 files): file-count artifact + band
    mix. The baseline is a 4-file sum (60/file) from an unknown band; the
    current is 16 files (25/file). The wave-4 subset — the metric that
    matters for this leg — is **175 vs 178, flat**. Explained, not a bug.
  - `maxGameDay` 468 → 1963 (+319%, n=16): the known artifact. Per-file
    122.7 vs baseline 117/seed — in family. Explained.
  - `fightsByWave.4` did not trip (175 vs 178).

## What lands

- **The fix** (`src/js/table.js`): new read-only query `tableSitting()` —
  true only while a table sequence is actually live (`T.winDeferred`, or
  `pg.tableDone && T.phase && T.phase !== 'done'`). `tableActive()` is
  byte-identical. Muster/march hold only on the live-sitting predicate under
  `MUSTER_HOLD=sitting`. Proof test `scripts/test-table-sitting-20261117.js`:
  22/40 RED pre-fix, **40/40 GREEN** with fix (re-run at closeout).
- **Tooling** (`scripts/`): driver + analyzer + stage mode for r242; the
  analyzer instrument correction (mercy-held counts table holds only;
  `armed-unresolved` stage label); analyzer proof test 148/148 green
  (cases (49)–(50) added).

## Metric review

- **Mercy-held instrument (CORRECTED this run):** the prereg's (a) counts
  holds *on mercy* — the table predicate — not any hold during mercy. The
  old any-held count misread a real constraint (coalition shortage) as a
  table hold. Next run inherits the corrected instrument.
- **STAGE label (CORRECTED this run):** armed-but-unresolved (village
  collapsed before the deadline) is not never-armed.
- **Q1 (c) live-sitting leg:** vacuous on this band — no sitting coincided
  with a muster. The unit proof test covers it; a future band with a
  coinciding sitting would test it in the panel. Not a gap in the fix.

## Infrastructure

- **Write flap 17:27–~17:33Z (~6 min):** EPERM write refusals on btrfs
  (/home) and tmpfs (/tmp); the manual heartbeat failed on the atomic
  registry write (empty `REGISTRY.json.tmp` left behind, old registry
  intact). Cleared by ~17:33:52Z. The 17:25:46Z heartbeat held through it.
  Recorded; not re-reported (the watchdog already caught the window).
- Safe-commit index clobber struck on all commits so far; repaired each time
  with the `ls-tree -r` pipe + hash verification.
- Heartbeat: 9-min loop firing; manual heartbeats at registration, ~17:34Z,
  ~17:39Z, and through closeout.

## Closeout

- Merged locally (ff-only) to master [PATCH — commit hash], pending ship.
  No bump, no push, no live verification — the ship loop owns those.
- Rotation written 3 → 0 (read back). Lock deleted after run_id verification.
- Worktree released (`journey-scale`, merged); final reap done; main tree clean.
