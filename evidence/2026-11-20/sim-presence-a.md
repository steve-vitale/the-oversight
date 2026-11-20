# sim-presence-a — NO-GO (PARTICIPATION + GUARDRAIL) — full 8-seed pilot judged

**Arm:** sim-presence-a · **Loop A run:** fleshout-20261120T1315Z (dead run,
adopted by run fleshout-20261120T1515Z — this file)
**Type:** BUILD + measure — the PRESENCE lever for finding #2599
(finding #2625, the topmost named scale-onramp blank)
**Status: NO-GO, kind PARTICIPATION (frozen precedence) with bar 4 also
failing — the lever is REVERTED (game code leaves no trace).** The pilot
ran to 16/16 seeds (ctl 107051–107058, arm 107051–107058). The analyzer
judges the five frozen bars on the full band: bars 1, 3, and 5 pass; bar 2
misses by exactly one entry again (2 vs floor 3); bar 4 misses STRICT
(deaths per engaged meeting 4.22 vs 3.95, no allowance). Per the frozen
ladder, a NO-GO reverts the game code before commit; instrument +
evidence commit only. The draft DID fire — once, on the adjacent branch,
in exactly the fight the cellgate arm named as the gap — and produced the
second armed wave-4+ volley in this finding's history. But one draft fire
in 8 seeds does not move the entry pool, and the single-seed RNG cascade
it set off trips the strict guardrail. The binding constraint has moved
again — from holder presence at the fight (the draft fires when the
holder is there) to holder CONTACT with wave-4+ tick fights at all.
**Prereg:** `evidence/2026-11-20/sim-presence-a-prereg.md` (commit
`aabe8af14`, frozen 2026-11-20 ~13:55 UTC, before any judged sim;
adoption rebase onto master `0106e423c` at ~15:33 UTC, proofs re-run
green after the rebase).
**Branch:** `sim-presence-a`, base master `0106e423c` (adopted; the
1315Z run's base was `57b085a44`).

## 1. The lever (frozen design, built as preregistered)

**PRESENCE=1** (default OFF). One shape only: the ARMED-HOLDER DRAFT
(shape (c) — holder-lead weighting). In `villagerMonsterTick`
(`src/js/game.js` ~21147): after the 0.5 coin flip passes (a fight is
happening) and when the monster's wave is ≥ 4, if a living armed
searcaster holder is on the monster's tile or an adjacent tile, that
holder LEADS the fight instead of the uniform-random pick. On-tile
holders first (roster order), then adjacent holders (roster order). If
no armed holder is in earshot, the old pick stands exactly as before.
An armed holder: a roster villager (never the scholar) whose equipped
ranged weapon is a searcaster, carrying ≥ 1 fusion cell, village health
> 20, not sheltered, not post-flee resting. The draft helper is
`Game._presenceDraftLead(npcIds, m)`; the tick uses it only when
PRESENCE=1 and the monster's wave is ≥ 4. The 0.5 coin flip, the
table-sanctity return, the player's-tile skip, and the sheltered /
post-flee filters are untouched — the lever acts only inside a fight
that was already going to happen, on a lead pick that was already going
to be made.

**Control substrate (rebuilt, not re-argued):** the gunrate + cellgate
code (searcaster weight 4/18 in the tier-4 contest pool +
expedition-holder redirect + 2-cell bundle; wave-gated volley), env-gated
GUNRATE=1 + CELLGATE=1 on both legs. The control leg runs GUNRATE=1 +
CELLGATE=1; the arm leg runs GUNRATE=1 + CELLGATE=1 + PRESENCE=1. The
two legs differ ONLY by PRESENCE.

**NOT built:** shape (a) (prize-recipient weighting — the gunrate
redirect already weights expedition holders +8 and every gun reached a
lead-weighted villager) and shape (b) (gun lend/pass at launch — a
transfer with a return, a death-of-borrower sink, and a second mechanism
to prove; the named next shape if the draft fails on contact).

**No new narration.** The encounter's own narration names the lead, so
a drafted holder reads as the lead in the fight record itself.

**Draw-neutrality (verified, not waved through):** the diff's only
`Math.random` mentions on added lines are comments, plus ONE moved code
line — the pick itself, `if (!vid) vid =
npcIds[Math.floor(Math.random() * npcIds.length)]`, replacing the
unconditional `const vid = npcIds[...]` (one removed code line, one
added code line, same draw). Net new draw call sites: zero
(contests.js and fieldFights.js: zero added code lines with
`Math.random`). When the draft fires, the pick's ONE draw is skipped —
that is the mechanism, disclosed in the prereg. The proof test counts
draws around the draft on every fixture.

**Canon note:** `docs/CANON.md` (manifest) and `docs/CONTESTS.md` were
consulted. **No canon doc covers the searcaster, the contest-prize area
specifically, or holder presence at fights** — said here rather than
inventing canon (same as the diag, fix, participation, searsupply,
gunrate, and cellgate arms). The prize, grant, equip, volley, lead,
expedition-holder, and world-tick rules are cited from code, not canon.
The draft is a design call (this arm's, Steve can overrule): when the
village's best weapon is standing in earshot of the hardest beast, its
carrier steps forward — the village does not draw lots for who meets it.

## 2. Proof (before any sim)

- `scripts/test-gunrate-a.js` **39/39 GREEN** on rebased master
  `0106e423c` before the pilot (substrate rebuild proven).
- `scripts/test-cellgate-a.js` **12/12 GREEN** before the pilot
  (gate rebuild proven).
- `scripts/test-presence-a.js` **20/20 GREEN** before the pilot: draft
  fixtures (on-tile, adjacent, on-tile-beats-adjacent, unarmed holder
  not drafted, wounded holder not drafted, wave-3 monster not drafted,
  PRESENCE-off identity, helper env-independent) + the live drafted
  lead firing an armed wave-4+ volley on the encounter-gear fixture
  (shots > 0, cells spent per loosed shot, hits in the 64–68 band).
- `scripts/analyze-presence-a.js --selftest` **47 passed, 0 failed**
  (GO / NO-GO-per-bar judge shapes, incl. the 1.00× guardrail and the
  starvation bar; the `armedLeads` counter fix from finding #2622 is
  covered — a new selftest row adds an armed LEAD and asserts
  `armedLeads === 1`).
- **Fidelity (prereg §14b item 5): PASS.** Control-leg seed 107053
  matches the cellgate-a ARM corpus for seed 107053 on every SIMULATION
  field (`scripts/presence-fidelity-a.js`). Two instrument fixes were
  needed to get there, both made before any judged sim and both in the
  honest direction: (a) the cloned script still compared the cellgate
  control vs gunrate arm corpora with the old exclusion set — updated
  to compare this arm's control leg vs the cellgate ARM corpus and to
  exclude the new `presenceOn` / `presencePresent` /
  `v4tickPresence` / `v4transfers` keys; (b) the first run failed on
  `grantEvents.*.frame` strings only — the same
  `Game.alienLootGrant` call, different driver filename and line:col
  (`presence-driver-a.js:1264` vs `gunrate-driver-a.js:1201`) — the
  normalizer now collapses driver filename + line:col in stack-frame
  strings, as the prereg's frame/caller normalization intends ("the
  paths differ, the calls do not"). After the fix the check passes on
  all simulation fields.
- **Gate (a) — control reproduction: PASS.** The fresh control leg
  reproduces the cellgate ARM corpus exactly: holder-days **194**,
  cell-days **182**, armed entries **2**, armed volleys **1**, median
  **146d**. The substrate rebuild is faithful; the pilot judged against
  a non-drifting control.

## 3. Pilot status (16 of 16 seeds — COMPLETE)

- **Band:** REUSED 107051–107058, per the task (paired before/after on
  identical seeds, one flag apart). Horizon 150d, death-aware.
  Competent verbatim policy. Substrate `VETREENGAGE=1 + PARTYSIZE4=1 +
  FLEEREPAIR2=1 + FIGHTALLY2=1 + SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1`
  on both legs; ctl GUNRATE=1 CELLGATE=1, arm GUNRATE=1 CELLGATE=1
  PRESENCE=1.
- **Done:** ctl 8/8, arm 8/8. All 16 corpora valid, 0 instrument
  errors. Census coverage complete on all 8 seeds per leg (analyzer
  coverage bar).
- **Adoption notes (this run):** the 1315Z run died before its pilot
  with the lever + instruments written but uncommitted (branch
  `sim-presence-a` at `aabe8af14`, verified at adoption: uncommitted
  `contests.js` +76, `fieldFights.js` +18, `game.js` +87; five
  untracked presence scripts, all non-empty). Adopted 15:28Z: write
  probes 3/3 OK (15:30–15:31Z, no flap); interim WIP commit
  `ad2d8029c` (the rebase needed a clean tree); the known safe-commit
  index clobber struck (files staged-as-deleted, worktree byte-identical
  to HEAD) — repaired with `git ls-tree -r HEAD -- <paths> | git
  update-index --add --index-info` after removing a stale
  `index.lock` from 15:21Z (no live git process held it); rebased
  cleanly onto master `0106e423c` (new tip `2270e571e`); proofs
  re-run green on the rebased tree. No work was lost; nothing was
  re-done. The host write flap (active until ~15:26Z) did not recur
  during this run.
- **Instrument fixes during adoption (before any judged sim):**
  `scripts/presence-fidelity-a.js` (see §2) and
  `scripts/build-presence-panels-a.js` — the cloned builder still
  pointed at the cellgate corpora and cellgate filenames (its first
  run, with defaults, rebuilt the cellgate panels byte-identically —
  `git diff` empty, no harm — and exposed the stale defaults). Fixed
  to the presence corpora / filenames / panel labels (`presence-a`
  pseudo-policy, observer digest, origin) and re-run.
- **Analysis:** `evidence/2026-11-20/presence-a-analysis.json`
  (analyzer verdict NO-GO / PARTICIPATION). Panel:
  `evidence/2026-11-20/presence-a-panel-before.json.gz` /
  `-after.json.gz` + `presence-a-panel.md` (compare decision
  `review_required` — see §4, it corroborates the frozen guardrail,
  it does not overturn the prereg judge).

## 4. Verdict — NO-GO (PARTICIPATION, bar 4 also fails)

| Frozen bar | Ctl (8 seeds) | Arm (8 seeds) | Bar | Result |
|---|---|---|---|---|
| 1. Searcaster-holder-days ≥ 40 | **194** | **194** | 40 | **PASS** |
| 2. Armed-holder entries ≥ 3 | 2 | **2** | 3 | **FAIL** |
| 3. Armed volleys fired ≥ 2 | 1 | **2** | 2 | **PASS** |
| 4. Guardrail (exposure-normalized, STRICT) | deaths/engaged 3.95; median 146d | deaths/engaged **4.22** (bar ≤ 3.95); median **146d** (bar ≥ 116.8) | — | **FAIL** |
| 5. Starvation guardrail | 4 villager starvation deaths | **4** (bar ≤ 6) | — | **PASS** |

**Why it is PARTICIPATION, and why the guardrail miss is a second,
separate failure:** the draft fired exactly once in 8 seeds (§6) and
that one fire produced the second volley (bar 3 passes: 1 → 2, armed
leads 1 → 2). But the armed-entry pool did not move — still 2 entries,
because the draft converted an entry the village already had (naran
entering as an ally) into a lead, instead of adding a third entry. Bar
2's floor (≥ 3) misses by one entry again. The guardrail fails on the
same single seed: deaths per engaged meeting 4.22 vs 3.95 is +10 deaths
(829 → 839) on 11 fewer engaged meetings (210 → 199), ALL of it on
seed 107057 — the seed where the draft fired. Every other seed is
identical between legs (same days, same deaths, same standing, to the
death). The drafted fight itself saved lives (§7: yara dies round 1 on
ctl; on arm naran leads, fights 7 rounds, and the party flees alive).
The +10 deaths came later, from the RNG cascade the skipped pick draw
set off: after day 87 the seed's whole stream shifted (meetings 59 →
49, standing 650 → 525). The frozen bar is STRICT (≤ 1.00×, no
allowance) and it binds — a miss is NO-GO, never re-scored. The
kind is PARTICIPATION by the frozen precedence (bar 2 fails first in
the ladder); the guardrail miss is recorded here as a co-equal failure,
not hidden behind the kind label.

**The panel's `review_required` corroborates the guardrail, it does
not re-score it.** The balanced-panel compare flags "Village deaths
per run" as `regression_watch` (+1.25: 103.625 → 104.875) and deaths
per 100 days (+0.76) — the same +10 deaths on 107057 averaged over 8
seeds. Community loss is unchanged (0.5 vs 0.5, 4/8 villages lost on
both legs). Every other metric is `no_material_signal`. Per §14 metric
binding, the panel is the instrument and the pre-registered threshold
is the judge; the frozen guardrail already fails on these same numbers.

**Instrument note — the presence stats undercount draft fires:** the
`v4tickPresence` pool counts only `world-tick`-origin encounters
(`fightOrigin` returns `aid` for any tick fight routed through
`aidFight` — see §6), so the draft's one proven fire is invisible to
`poolHolderLed` (1 on both legs — Lautaro's fight, identical on both
legs, draft-or-pick indistinguishable) and to `poolDraftMiss`.
`poolDraftMiss` (arm 64 rows) also overcounts: the rows collapse to 21
distinct day|mid pairs (the tick runs once per day-part, so up to 4
rows per fight), and the recorder's adjacent list does not filter
sheltered / post-flee-resting holders the way the draft does, and its
pre-tick read goes stale when an earlier monster in the same call
moves or kills the holder. The honest draft-fire count for this band
is established by direct corpus comparison (§6), not by the pool
counters: exactly one fire. The next presence arm needs a fired-row in
the draft itself (see §11).

## 5. Wall numbers (full 16-seed band)

- National **0/16**, table not instrumented (null, never faked),
  wins **0/16**. Wave 4 reached 16/16, wave 5 reached 6/16
  (ctl 3/8, arm 3/8). Median survival 146d ctl, 146d arm.
  Community lost 4/8 ctl, 4/8 arm. Scale rank regional on all 16.
- Standing: ctl 175–650 (four seeds pinned at the 199 wave-4 floor),
  arm 175–595 (four at 199; 107057 falls 650 → 525 on the cascade).
  The wall is unmoved — the pilot band carries the wall numbers, as
  expected; the lever was never a scale lever. The only wall-adjacent
  movement is the guardrail going the wrong way on one seed's cascade
  (§4).

Per-seed (days / end / max wave / standing / holder-days /
wave-4+ meetings / engaged / armed entries / deaths):

| Seed | Ctl | Arm |
|---|---|---|
| 107051 | 142d lost w4 st199 hd0 m33 e27 a0 d138 | 142d lost w4 st199 hd0 m33 e27 a0 d138 |
| 107052 | 112d lost w4 st199 hd51 m33 e26 a0 d83 | 112d lost w4 st199 hd51 m33 e26 a0 d83 |
| 107053 | 150d survived w4 st199 hd0 m37 e31 a0 d125 | 150d survived w4 st199 hd0 m37 e31 a0 d125 |
| 107054 | 106d lost w4 st175 hd39 m15 e12 a0 d61 | 106d lost w4 st175 hd39 m15 e12 a0 d61 |
| 107055 | 139d lost w5 st595 hd24 m27 e26 a1 d87 | 139d lost w5 st595 hd24 m27 e26 a1 d87 |
| 107056 | 150d survived w4 st199 hd0 m19 e15 a0 d115 | 150d survived w4 st199 hd0 m19 e15 a0 d115 |
| 107057 | 150d survived w5 st650 hd64 m59 e43 a1 d123 | 150d survived w5 st525 hd64 m49 e32 a1 d133 |
| 107058 | 150d survived w5 st350 hd16 m32 e30 a0 d97 | 150d survived w5 st350 hd16 m32 e30 a0 d97 |

Seven of eight seeds are byte-identical between legs. The entire
experiment lives on 107057.

## 6. The mechanism (why bar 2 is 2 and bar 3 is 2)

The two legs' encounter lists are identical through the first 16
wave-4+ fights. They split at exactly one fight — seed 107057, day 87,
the Algorithm ("Don't-Look"):

- **Ctl:** yara_haddad leads an aid fight and dies in round 1
  ("Recommended For You hits Yara for 14 (0 left)"); naran_tumen
  stands by as an ally with a loaded searcaster + 2 cells; the gun
  never fires because naran doesn't lead. vDie, 0 damage dealt.
- **Arm:** naran_tumen LEADS the same fight, fires the volley (2 shots,
  1 hit, 64 damage), fights 7 rounds, calls for help (Meera charges
  in), and the party flees alive (vFlee, 565 damage dealt).

The tick rows prove the draft fired on the adjacent branch: at that
fight the monster's tile held exactly one eligible villager (yara,
unarmed — the pick was forced to her on ctl), and naran stood adjacent
with a searcaster + 2 cells, HP > 20, not sheltered, not resting. The
draft overrode the forced pick and put the armed holder in front. The
origin label `aid` is a taxonomy artifact, not a different path: the
tick's `resolveWildMonsterEncounter` routes through `aidFight` when the
monster is lingering during an aid crisis, and `fightOrigin` reads the
first game frame below `fieldFight` — `aidFight` — so a world-tick
fight that routes through aid reads as `aid`. That is also why the
presence pool counters miss this fire (§4).

The contact pool is the story, not the draft's aim: across 8 seeds the
holder was in earshot of a wave-4+ tick 1,019 times (rows, arm) — but
12,163 of 12,529 tick rows are no-fight rows (the 0.5 coin flip fails),
and of the 366 fight rows only ~22 distinct fights had a holder pooled
at all. And the holder is NEVER on the monster's tile at tick time:
`poolOnTile` is 0 on both legs — every pooled holder is adjacent, one
tile away. The draft's on-tile branch never fired; the whole lever
rides on earshot. Holders sit a tile away from the beasts and almost
never share a tile with one — which is also why the village's armed
holder so rarely leads: the tick only picks from the tile, and the
holder is almost never on it.

**Transfers / vanishes (finding #2624, answered):** 0 inter-villager
gun transfers on either leg in 16 seeds — the gun never changes hands
between villagers in the census. Three vanishes, identical on both
legs: victor_lopez day 110 (107052), catalina_reyes day 93 (107058 —
the gunrate §6 vanish, third repeat), and the scholar's gun day 119
(107058). The vanish is deterministic and lever-independent; its sink
is still unrecorded (gift / trade / theft / drop), but the transfer
detector now rules out villager-to-villager hand-offs as the route.

## 7. Sense testing (transcripts read, not just counted)

- **Naran (107057, day 87) is the draft working as designed — and
  reads like it.** The System's gun reaches naran on day 86; the next
  day the hardest beast in the village's history comes to his tile and
  the village does not draw lots: "Naran sees Don't-Look coming and
  nocks an arrow — the fight opens at range (2 shots). loosed wide —
  the arrow buries itself in the dirt. (spent) loosed — it takes
  Don't-Look for 64 (686 left)." He then fights seven rounds, tries a
  parley ("walks in open-handed — and it goes wrong"), takes hits his
  gear mostly absorbs, shouts for help ("Naran is losing — shouts for
  help! Meera charges in!"), and the party — naran, Meera, yara — gets
  out alive. On the control leg the same day reads: yara dies in round
  1, nothing is dealt, nobody answers. The drafted holder reads as a
  fighter stepping forward with the village's best weapon, not as the
  village shoving its gun-carrier at the monster — he fights, he calls
  for help, he lives. The one false note is the same as cellgate's:
  the volley lines are bow-generic ("nocks an arrow", "lowers the
  bow") for an alien gun. Filed in the backlog (§11), not a verdict
  item.
- **Lautaro (107055, day 117) is unchanged, honestly:** the same
  rerun fight, the same volley (2 shots, 1 hit, 67 damage, vKill) on
  both legs. Whether the draft or the random pick put him in front on
  the arm leg is indistinguishable from the corpus — and it does not
  matter, since the outcome is identical. The gun still goes quiet
  after: Lautaro leads seven more wave-4+ fights with the empty gun
  (the cellgate §7 shape, unchanged).
- **Victor and yuki are the quiet proof again:** loaded guns carried
  51 and 39 days to the villages' losses without ever firing, on both
  legs — not because the draft failed, but because no wave-4+ fight
  ever put them in it. The draft can only draft a holder who is there;
  these two were never there.

## 8. How it finished

The pilot ran as two background legs (ctl ~5.3 min, arm ~4.5 min):

```
cd ~/workspace/worktrees/sim-presence-a
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl OUTDIR=perseed-presence-a-ctl SEEDS=107051,107052,107053,107054,107055,107056,107057,107058 RUN=presence-a node scripts/presence-driver-a.js > evidence/2026-11-20/presence-a-sweep-ctl.log 2> evidence/2026-11-20/presence-a-sweep-ctl.err
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 PRESENCE=1 MODE=arm OUTDIR=perseed-presence-a-arm SEEDS=107051,107052,107053,107054,107055,107056,107057,107058 RUN=presence-a node scripts/presence-driver-a.js > evidence/2026-11-20/presence-a-sweep-arm.log 2> evidence/2026-11-20/presence-a-sweep-arm.err
```

Then:

```
cd ~/workspace/worktrees/sim-presence-a
node scripts/presence-fidelity-a.js   # PASS (see §2)
node scripts/analyze-presence-a.js --ctl evidence/2026-11-20/perseed-presence-a-ctl --arm evidence/2026-11-20/perseed-presence-a-arm --out evidence/2026-11-20/presence-a-analysis.json
node scripts/build-presence-panels-a.js
node scripts/balance-panel.js compare --before evidence/2026-11-20/presence-a-panel-before.json.gz --after evidence/2026-11-20/presence-a-panel-after.json.gz --out evidence/2026-11-20/presence-a-panel
```

**Revert (NO-GO per the frozen ladder):** the game code was reverted
before commit — the lever leaves no trace in `src/`.
`src/js/contests.js`, `src/js/game.js`, and `src/js/fieldFights.js`
were restored to master `0106e423c` (`git checkout 0106e423c --
<files>`; `git diff 0106e423c -- <files>` is empty for all three).
Verified: 0 `GUNRATE` / `CELLGATE` refs in `src/`; the 4 remaining
`PRESENCE` matches are pre-existing on master (drifter-loop comments,
INTIMIDATING PRESENCE ability, membership comment). `node --check`
clean on all three files. The proof tests now read **26/39**
(gunrate — the 13 lever-on assertions fail against reverted code, the
26 control / off-leg assertions still pass), **9/12** (cellgate — the 3
hold-specific assertions fail, the 9 control / identity / data
assertions still pass), and **10/20** (presence — the 10 lever-on
assertions fail, the 10 off-leg / control assertions still pass) — the
same record the gunrate and cellgate NO-GO arms left for their own
tests. The analyzer `--selftest` is lever-independent: **47/47** after
the revert. None of the three proof tests is on the green list.
`node scripts/check.js --quick` after the revert: **334 passed, 10
failed in 1578s** (exit 1;
`evidence/2026-11-20/presence-a-check-quick.log`). The 10 failures,
by class: six 120s timeouts (godpath living-garden-deed-attainment,
occupation-panels, one-person-army-deed-attainment,
test-synergy-stall, test-capable-bot-20261014, and
trust-observer-neutrality at 110.6s — the slow-godpath class, slower
this run under sibling load: a second check.js ran concurrently in
journey-landing); three stale retained proofs (godpath
measurement-proof-update, measurement-workflow, and phone-frame-proof
— the retained-proof class); one measurement-cache-flags (4
assertions, 91.7s, observer/cache identity). None touches the arm's
area — no contest, loot, prize, searcaster, cell, volley, or presence
test failed — and the reverted `src/` is byte-identical to master
`0106e423c`, so none is attributable to this arm. The cellgate arm's
post-revert record on its base was 335/9; this base runs 344 scripts.

## 9. Metric review (§14)

- No bar was re-scored; the verdict is the analyzer's frozen-bar judge
  on the full band. Bar 3 passes with the draft's first live fire
  (naran's volley, §6–7); bar 2 misses by one entry for the third
  consecutive arm in this finding (gunrate 0, cellgate 2, presence 2 —
  the floor has not moved while the mechanism has).
- The metric that proved wrong is bar 2's floor as a measure of THIS
  lever, again, but in a new way: armed entries count holder presence
  at wave-4+ fights, and the draft can only convert an entry the
  village already has into a lead — it cannot create entries. The draft
  did exactly that (naran ally → lead) and bar 2 stayed at 2. A floor
  on entries will keep missing by one until a lever creates entries;
  the presence question is now a CONTACT question (how often is an
  armed holder in earshot of a wave-4+ tick fight that happens — ~22
  distinct fights in 8 seeds, of which the draft could take 1), not a
  lead-pick question.
- Bar 4's strict 1.00× with n=8 seeds is fragile to single-seed RNG
  cascades: the entire guardrail failure is one seed (107057), and the
  drafted fight itself saved lives — the +10 deaths are downstream
  stream-shift, not draft-caused deaths. This is a proposal for the
  NEXT run, not a re-score: either keep the strict bar and accept that
  presence levers will often trip it on cascade noise, or pre-register
  a guardrail that separates the drafted fight's own outcome from
  downstream cascade (e.g. deaths in drafted fights vs deaths per
  engaged meeting with a single-seed exclusion rule stated up front).
  The strict bar did its job here — it caught a real divergence — but
  it cannot tell a harmful lever from an unlucky cascade, and the next
  presence-adjacent arm should decide that before judging.
- Bar 1's floor (40) passed 4.9× again — the weight overshot the
  floor's purpose for the third arm running. The binding constraint is
  downstream of the grant rate, of cell survival, AND now of the lead
  pick: it is contact. Neither a further gun-rate increase, a bigger
  bundle, nor a wider draft is the next lever on this evidence (see
  §4). The named next shape from the prereg is (b) the lend — the gun
  to the fighters already going — but the 21 distinct draft-miss pairs
  (§4) deserve diagnosis first: if the misses are mostly sheltered /
  post-flee holders or stale pre-tick reads, the lend answers a
  different question than the misses ask.
- The fidelity check's exclusion classes (per-process `seq`, worktree
  paths + driver filename/line in stack-frame strings, top-level
  metadata incl. the new presence keys) are the honest form of the
  "byte-identical" check — the amendment narrows the check to
  simulation state, it does not weaken it (see §2).

## 10. Village assessment (plain words)

Nine of the sixteen villages lived to day 150; seven died out (four
per leg, the same four seeds). Every village reached wave 4; six
reached wave 5; none reached national, none won. Most villages sit
pinned at standing 199 — the wave-4 floor — for the whole back half
of the run: they survive, they fight, they do not climb. The two
strongest villages are both seed 107057 (650 on control, 525 on the
arm leg after the cascade).

People die out in the wild and in fights, not at home: the arm leg's
deaths per engaged meeting actually rose (4.22 vs 3.95) on one seed's
bad luck after the draft fired, while median survival is identical
(146d both legs) and starvation is flat (4 vs 4 villagers; the raw
death rows show a fifth arm starvation, but it is the scholar, not a
villager — the analyzer's villager-only count is the judged number).
Five villages in eight finally saw the System's rarest weapon stay
loaded, and two of them watched it fire at the monster it was made
for — the second volley in this finding's history, fired by a holder
the village put in front on purpose for the first time. But three of
those five carried it loaded for weeks and never once stood in front
of a wave-4 beast with it, and the draft only ever got its chance
once. The supply line works. The gun fires when it is brought. The
village still almost never brings it.

## 11. Files

- Prereg: `evidence/2026-11-20/sim-presence-a-prereg.md`
  (commit `aabe8af14`; adoption rebase `2270e571e` onto master
  `0106e423c`)
- Lever (REVERTED — no trace in `src/`):
  `src/js/contests.js`, `src/js/game.js`, `src/js/fieldFights.js`
  restored to master `0106e423c` (see §8)
- Instrument (committed, this run): `scripts/presence-driver-a.js`
  (clone of `scripts/gunrate-driver-a.js` + `v4tickPresence` recorder
  + `v4transfers` detector), `scripts/analyze-presence-a.js` (frozen-bar
  judge; selftest 47/47; `armedLeads` counter fix, finding #2622),
  `scripts/test-presence-a.js` (20/20 pre-revert on `0106e423c`;
  10/20 post-revert, lever-on assertions only),
  `scripts/presence-fidelity-a.js` (field-exclusion fidelity check,
  PASS), `scripts/build-presence-panels-a.js` (presence corpora /
  filenames / labels). Reused unmodified:
  `scripts/test-gunrate-a.js` (39/39 pre-revert, 26/39 post-revert)
  and `scripts/test-cellgate-a.js` (12/12 pre-revert, 9/12
  post-revert).
- Sweeps (complete corpora):
  `evidence/2026-11-20/presence-a-sweep-ctl.log` / `.err`,
  `evidence/2026-11-20/presence-a-sweep-arm.log` / `.err`,
  `evidence/2026-11-20/perseed-presence-a-ctl/` (8 files),
  `evidence/2026-11-20/perseed-presence-a-arm/` (8 files)
- Analysis + panel: `evidence/2026-11-20/presence-a-analysis.json`,
  `evidence/2026-11-20/presence-a-analysis-ctl.json`,
  `evidence/2026-11-20/presence-a-panel-before.json.gz`,
  `evidence/2026-11-20/presence-a-panel-after.json.gz`,
  `evidence/2026-11-20/presence-a-panel.json`,
  `evidence/2026-11-20/presence-a-panel.md`
- Quick check (post-revert, backgrounded during evidence writing):
  `evidence/2026-11-20/presence-a-check-quick.log` / `.err`
- This evidence file

## 12. Findings for the backlog (append to sim-findings.md)

- [open] 2026-11-20 — instrument — the PRESENCE draft needs its own
  telemetry: a fired-row (day / seed / monster / holder / source) in
  the draft itself. The `v4tickPresence` pool counters cannot
  attribute draft fires: `fightOrigin` labels any tick fight routed
  through `aidFight` as `aid`, so the draft's one proven fire is
  invisible to `poolHolderLed` / `poolDraftMiss`, and `poolDraftMiss`
  overcounts ~3× (one tick row per day-part call per fight) and counts
  holders the draft must refuse (sheltered / post-flee, unfiltered in
  the recorder's adjacent list). The next presence arm should count
  fires directly instead of inferring them from corpus diffs
  (presence evidence §4, §6).
- [open] 2026-11-20 — participation — finding #2599's contact pool:
  an armed holder is NEVER on a wave-4+ monster's tile at tick time
  (`poolOnTile` 0 on both legs, 12,529 tick rows) — every pooled holder
  is adjacent, one tile away — and only ~22 distinct world-tick fights
  in 8 seeds had a holder pooled at all. The draft's on-tile branch
  never fired; the lever rides entirely on earshot. The next lever
  (prereg shape (b), the lend — the gun to the fighters already going)
  should be weighed against diagnosing the 21 distinct draft-miss
  pairs first: sheltered / post-flee holders, stale pre-tick reads, or
  duplicate-row inflation (presence evidence §4, §6).
- [open] 2026-11-20 — items — gun vanishes, transfer question closed:
  0 inter-villager gun transfers in 16 seeds; three vanishes repeat
  exactly on both legs (victor_lopez day 110 on 107052, catalina_reyes
  day 93 on 107058 — the gunrate §6 vanish, third repeat — and the
  scholar's gun day 119 on 107058). The vanish is deterministic and
  lever-independent; its sink is still unrecorded (presence evidence
  §6).
- [open] 2026-11-20 — measurement — the strict 1.00× guardrail cannot
  tell a harmful lever from an unlucky cascade: the whole bar-4 failure
  is one seed's RNG cascade after a single skipped pick draw, while the
  drafted fight itself saved lives. The next presence-adjacent arm
  should pre-register a guardrail that separates the drafted fight's
  own outcome from downstream cascade (or keep the strict bar knowing
  it will trip on cascade noise) BEFORE judging (presence evidence
  §9, metric review — a proposal for the next run, not a re-score).
- [open] 2026-11-20 — narration — the opening-volley log lines are
  bow-generic even for the searcaster ("nocks an arrow", "lowers the
  bow"); #2593 fixed only the no-ammo line. A searcaster volley should
  read as an alien weapon firing (cellgate evidence §7; repeated on
  the presence arm — naran's day-87 volley reads as archery).
