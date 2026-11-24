# sim-guntransfer-b — PREREG (frozen)

**Arm:** sim-guntransfer-b · **Loop B run:** fleshout-loop-b-20261124T0840Z
**Axis:** winnability-chain · **Finding:** sim-findings.md line 2732 `[open]`
— UNRECORDED LIVING-HOLDER TRANSFER (sim-gunholder-census-b, run
fleshout-loop-b-20261124T0630Z, verdict COMPLETE, evidence/2026-11-24/
sim-gunholder-census-b.md §5)
**Type:** DIAGNOSTIC instrument — no game-code change, no lever, no
before/after. A neutral recorder + analyzer on the rearm substrate that
names the transfer path(s) and classifies every living-holder gun
transfer. Zero src/js diffs expected.
**Base:** worktree `~/workspace/worktrees/sim-guntransfer-b`, branch
`sim-guntransfer-b`, HEAD `a77a5a749` at run start.
**Frozen:** 2026-11-24 ~09:00 UTC, before any judged run. No judged
run has run.

## 1. The question (from the brief + gunholder-census-b §5)

A loaded gun moves between living people with no grant / kill-loot /
rearm-take / corpse-take event behind it — 4 times holder→scholar
overnight in the pilot (Leo Martin s107753 d69, gen_lq0e0m5 s107754
d103, gen_olsjsph s107755 d112, yara_haddad s107756 d127; village total
stays 1 across each move), once villager→villager (gen_pc7f25r→Zoltan
Nagy s107754 d131), plus Wanjiru Kamau→scholar in the witness band
(s107741 d124). Some gift / hand-over / scholar-take path moves guns
between the living, and no census wrap sees it. This arm identifies
the path(s) in code and wraps them, before any lever that assumes
custody is tracked.

## 2. Code read (grounding — done before designing anything)

Two paths are named in code, neither of them a gift / hand-over /
scholar-take between the living in the sense the finding assumed.
Both were verified by reading, not trusted from the brief's starting
points (the brief's three starting points are all rearm/corpse
channels, already wrapped by the census):

- **Succession — the holder→scholar "transfers" are not transfers
  at all.** `playerDeath(cause)` (`src/js/ledger.js:658`): the old
  scholar's gear goes on the corpse (death pack); the successor is
  chosen by trust (`candidates.sort` by `v.trust` desc,
  `newId = candidates[0]`); `this.villagerId = newId` and
  `mantleBecome(oldId, newId)` replaces the scholar record with the
  successor's OWN kit — "SUCCESSOR'S OWN KIT (Steve 2026-10-09):
  the dead bearer's gear stays on the corpse — the new bearer starts
  from their own belongings... what they wore stays worn." The gun
  never moves between people: the holder BECOMES the scholar. The
  census reads the gun as `__scholar__` because `gunLocationsOf`
  keys the scholar by `Game.villagerId`, which changes — the
  identity change is invisible to every census wrap. Corroboration
  from the frozen corpora (read, not run): on every one of the four
  pilot transfers the previous scholar dies `player:true` the same
  day (s107753 d69 gen_4vex9qm; s107754 d103 somchai_prasert;
  s107755 d112 gen_0eslqya; s107756 d126 gen_kwi3h3w, row d127) and
  the holder's own later death is `player:true` (Leo d82, lq0e0m5
  d133, olsjsph d129, yara d145) — each holder later IS the scholar.
  Wanjiru (s107741 d124) fits the same shape: gen_q49jzk0 dies
  `player:true` d124 (arena), Wanjiru dies `player:true` d130
  (sickness). The replay must PROVE this with a `playerDeath` wrap
  (oldId → newId), not rest on the death-log correlation.
- **Gear-day spares-gift — the villager→villager transfer.**
  `villagerGearDay()` (`src/js/villager-build.js:895`, daily):
  step 2, "spares to whoever gains most" — a weapon/armor carried
  but not worn (a duplicate; the worn copy stays) is gifted to the
  villager who gains most from it
  (`_gearValue` gain × `villagerGearFit`), moved by entry splice
  from the giver's items into the taker's items, then `autoEquip`
  seats it; telemetry `tele('villager_gear', {vid, item, from,
  via: 'gift'})`. Only villagers at home take part (scholar and
  away villagers excluded); worn gear is never taken. This is the
  only code path found that moves an item between two living
  villagers' packs. It fits the Zoltan case exactly: gen_pc7f25r
  won a SECOND gun by contest prize d130 (GUNRATE redirect, prize
  seq 27, gains +1 gun +2 cells — already in the census wraps), so
  the spare was a duplicate; Zoltan held no ranged weapon, so his
  gain beat the owner's (owner's own gain 0 — he already wears one);
  the gun moved d130→d131, the cells stayed (cells are not gear —
  the step-2 filter is `d.weapon || d.armor`), so Zoltan's gun is
  dry. The replay must PROVE this with a `tele` wrap (villager_gear
  + searcaster) and a `villagerGearDay` before/after diff.
- **Ruled out by code read (stated, not assumed):**
  - `_lendSearcaster` / `_returnLentSearcaster`
    (`src/js/game.js:21182` / `:21304`): env-gated LEND=1, and the
    census substrate leaves LEND unset — the function returns null
    before any move. Wrapped anyway to prove it never fires.
  - `villagerGearUp` (`src/js/game.js:7702`): own stash + communal
    armory (deposited weapons only — deposit is consent) + whittle.
    It never touches another person's gear. Armory borrow needs a
    deposit; deposits are scholar-only UI actions
    (`donateWeapon`, storage.js) and the competent policy donates
    only food to the pantry. Not a path on this substrate.
  - `villagerRearmFromCorpse` (`src/js/corpses.js:1125`): corpse→
    taker only, and only when the corpse holds cells; a gun in a
    living villager's pack is never a source. Already wrapped.
  - `alienLootGrant` / `villagerKillLoot` / `_corpseTakeStack`:
    grants and loot, already wrapped; they ADD guns, never move
    one between the living.
  - No gift / trade / share / hand-over helper exists between
    villagers: grep for giveItem/giftItem/offerItem/shareItem/
    passItem/transferItem/tradeItem across src/js finds nothing
    (one dead branch in alienPlayers.js). Conversation gifts are
    food-only (`game.js:4134` gift path). Theft is pantry-only
    (betrayal.js visitors). `maybeGrantCapstoneItem` grants
    godhood capstones, never a searcaster.
  - `mantleBecome` (`src/js/villager-build.js:551`): replaces the
    scholar's inventory/equipped with the successor's own — the
    succession's kit half, not a separate path.
- **Canon:** docs/CANON.md + docs/MONSTER-WAVES.md read (wave 4/5
  gates, readiness bars, "monster encounters are fought, not
  rolled"). No canon doc covers gun custody, succession kit, or
  gear-day gifts — said here rather than inventing canon. The
  succession kit rule is Steve 2026-10-09 / 2026-10-14 ("You
  become that villager"), quoted in the code comments above.

## 3. Band (replay, not a fresh band — stated deliberately)

- **Pilot replay band: 107750–107757 (8 seeds) — the census's own
  band.** This arm replays it with the transfer recorder to
  classify the SAME transfers the census observed. Reuse is
  intended: the question is about those transfers, and the
  substrate is byte-identical (`git diff 60f6e7436..HEAD --
  src/js scripts/policies` is EMPTY — the retarget-a lever was
  reverted, nothing lands; only scripts/evidence moved). A
  deterministic replay must reproduce the census corpus exactly
  (havenlink-b already showed 8/8 exact reproduction on this
  harness); bar 2 judges that reproduction.
- **Witness fixture: s107741 (Wanjiru).** The witness corpus ran
  on base `2298a7311`; src/js HAS moved since (build.js,
  conversation.js, win-plan.js, policies/oracleV2.js), so a replay
  of s107741 on current master may diverge. The arm attempts the
  replay with the new driver; if the d124 transfer reproduces it
  is classified from the replay. If the seed diverges, Wanjiru is
  classified from the OLD corpus by the succession identity rule
  (player:true death d124 + holder's own player:true death d130)
  — a mechanism the pilot-band successions prove — and the
  evidence labels that classification as old-corpus + rule, not
  replay-proven. Either way the classification table says which.
- No fresh band is spent: this is a classification replay, and
  the seed budget buys classification, not new measurement.

## 4. Instrument (frozen design)

- Driver `scripts/guntransfer-driver-b.js` (NEW; copies
  `scripts/gunholder-census-driver-b.js` verbatim for the shared
  wraps and daily census, then adds the transfer wraps — copy,
  don't rebuild, so the replay corpus stays comparable). Single
  leg, MODE=arm, RUN=guntransfer-b. Substrate identical to the
  census §5 (VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1
  KILLBUNDLE=1 STAGE_SEAR=1 REARM_CELLS=1; LEND unset, PRESENCE
  unset). Horizon 150d death-aware, competent verbatim, ONE
  process sequential.
  - NEW wraps (pure reads + driver-local writes; every game
    function runs exactly once, untouched):
    - `playerDeath` — pre-call oldId (`Game.villagerId`),
      post-call newId, cause arg, day. The succession record.
    - `tele` — record ONLY `villager_gear` events (day, vid,
      item, from, via); all other tele types ignored (the
      harness fires tele constantly — recording all of it would
      drown the corpus).
    - `_lendSearcaster` — record every call + return value
      (expect null on every call with LEND unset).
    - `_returnLentSearcaster` — record every call + return
      (expect never called).
    - `villagerGearDay` — before/after `snapshotGunCells` diff
      (gun counts per vid); any gun-count move inside a gear
      day is attributed to the gear day even if the tele wrap
      missed it (safety net — such a move is reported as
      `gear-day-diff`, never silently folded into a tele class).
  - KEPT wraps (copied from the census driver): `fieldFight`,
    `resolveWildMonsterEncounter`, `fireContest`, `_cxItemPrize`,
    `alienLootGrant`, `villagerKillLoot` (STAGE_SEAR staging),
    `_corpseTakeStack`, `villagerRearmFromCorpse`,
    `registerDeath`.
  - Daily census row: `gunLocationsOf` + `packCellsByVid` (as
    before) PLUS `scholarVid` (`Game.villagerId` that day) — the
    census lacked this, which is why an identity change read as
    an item move.
  - STOP checks (exit 2, loud): same substrate gates as the
    census driver (MODE=arm; REARM_CELLS=1, KILLBUNDLE=1,
    STAGE_SEAR=1, GUNRATE=1, CELLGATE=1, VETREENGAGE=1,
    PARTYSIZE4=1, FLEEREPAIR2=1, FIGHTALLY2=1, SENSEEXPED=1,
    BOWOPEN=1, SPEARGATE=1; LEND unset, PRESENCE unset; lever
    code present; SEEDS required; refuse to overwrite).
  - OUTDIR `evidence/2026-11-24/perseed-guntransfer-b/`, files
    `guntransfer-b-s<seed>-guntransfer-b-arm.json`. Witness
    replay OUTDIR `evidence/2026-11-24/perseed-guntransfer-b/`,
    file `guntransfer-b-s107741-guntransfer-b-witness.json`.
- Analyzer `scripts/analyze-guntransfer-b.js` (NEW):
  - `detectTransfers(seedJson)` — rebuild per-day holdings
    from the daily rows (villager rows + scholar-equipped row
    keyed by that day's `scholarVid`, so a succession reads as
    ONE identity change, never two item moves). A transfer is a
    day-boundary holdings change not explained by an
    acquisition wrap (grant / kill-loot / prize / rearm-take /
    corpse-take): holder A loses a gun and holder B gains one
    (or the scholar identity changes while the gun stays with
    the same person).
  - `classifyTransfer` — match each detected transfer to the
    same-day (or N→N+1 window) wrap events, in this order:
    1. `succession` — a `playerDeath` event that day with
       newId == the gun's person (the gun stays with the person;
       the person becomes the scholar).
    2. `gear-gift` — a `villager_gear` tele event that day with
       item searcaster, from == loser, vid == gainer.
    3. `gear-day-diff` — a `villagerGearDay` diff that day moves
       a gun loser→gainer with no matching tele event (a wrap
       gap, reported as its own class, never folded into 2).
    4. `lend` / `lend-return` — a `_lendSearcaster` /
       `_returnLentSearcaster` record that day moving the gun.
    5. `rearm` / `grant` / `kill-loot` / `corpse-take` — the
       acquisition wraps (these are NOT living transfers; a
       detected move matching one of them is a detector error,
       listed separately and never counted as a living transfer).
    6. `unclassified` — no event matches. Any occurrence fails
       bar 3.
  - `analyzeLeg` — leg totals + the classification table + the
    holder-day reproduction (reuses
    `scripts/analyze-gunholder-census-b.js` exports for the
    9-class census; holder-days must equal the census's 989).
  - `--selftest` (synthetic fixtures): succession transfer;
    gear-gift transfer; gear-day-diff (tele missing); lend
    record (fired, classified lend); rearm take (must NOT
    classify as a living transfer); contest-prize grant (must
    NOT classify as a living transfer); corpse-take by the
    scholar (must NOT classify as a living transfer); the
    Wanjiru double-row (scholar identity change with the same
    gun counted once).
  - `--fixture <file>` — classify the transfers in an existing
    corpus file (the old witness file: expected result is the
    Wanjiru transfer listed as `unclassified-by-old-corpus`
    with the identity-rule note, since the old file has no
    playerDeath/tele wraps — the fixture proves the detector
    sees the move and refuses to invent a path for it).
- Arm test `scripts/test-guntransfer-b.js` (NEW): frozen-band
  checks, driver-export + presence checks, `--live` proof on the
  harness (T1 succession: kill the scholar while a trust-top
  gun-holder lives → `playerDeath` wrap records old→new and
  the new scholar holds the gun; T2 gear gift: a villager with
  a spare searcaster + a gun-less villager at home, run
  `villagerGearDay` → tele `villager_gear` fires, the gun
  moves, the giver keeps the cells; T3 corpse-take (rearm
  from a corpse) does NOT classify as a living transfer; T4
  contest-prize grant does NOT classify as a living transfer;
  T5 `_lendSearcaster` returns null with LEND unset),
  `--dir-arm` corpus validation (8 files, mode arm, all
  substrate flags on, one shared anchor, policySha matches
  competent.js, 0 instrument errors, 8 staged arrivals
  bundled, holder-days == 989).
- **Parallelism:** ONE process, 8 seeds sequential. No parallel
  drivers (the 2026-11-24 ~04:22Z OOM kill).

## 5. Definitions (frozen)

- **Living-holder gun transfer:** between two consecutive daily
  census rows, a searcaster entry leaves a living person's items
  (equipped or carried) and appears in a different living
  person's items, OR the scholar identity (`scholarVid`) changes
  while the gun stays with the same person. Acquisitions (a gun
  appearing with no loser: grant / kill-loot / prize / rearm /
  corpse-take) are NOT transfers.
- **Succession transfer (class `succession`):** the gun stays with
  the person; the person becomes the scholar via `playerDeath`.
  No item moves. This is a custody-label change, not a custody
  change — the finding's "transfer" dissolves into it.
- **Gear-gift transfer (class `gear-gift`):** a spare gun moves
  giver→taker inside `villagerGearDay` step 2. Cells never move
  with it (the step moves gear only).
- **Holder-days:** as the census prereg §6 (equipped-loaded
  holder-day; scholar excluded). Reproduction is judged on the
  census's own 9-class analyzer.
- **Known transfers (to classify):** Leo Martin s107753 d69,
  gen_lq0e0m5 s107754 d103, gen_olsjsph s107755 d112, yara_haddad
  s107756 d127 (all holder→scholar); gen_pc7f25r→Zoltan Nagy
  s107754 d131 (villager→villager); Wanjiru Kamau s107741 d124
  (witness band). Expected classes from the code read:
  succession ×5, gear-gift ×1. The replay judges whether the
  code read holds — if a transfer classifies otherwise, the
  evidence says so and the code read is corrected there.

## 6. Frozen bars (judge: analyzer --dir + test --dir-arm + --live)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — analyzer `--selftest` green + `test-guntransfer-b.js` pre-run + `--live` green, all on this base; 0 instrument errors on all 8 replay files; single anchor + policySha per corpus; `rearmPresent` true on every file; `rearmOn` true; 8 staged arrivals bundled (`klBundled == klArrivals`, `klDry == 0`) | all must hold |
| 2 | **Reproduction** — replay holder-days == 989 (the census's exact count), class sums exact per seed and per leg (census analyzer re-run on the replay corpus) | exact, else INCOMPLETE-by-reproduction |
| 3 | **Classification completeness** — every living-holder gun transfer detected on the replay band classified into `succession` / `gear-gift` / `gear-day-diff` / `lend` / `lend-return`; 0 `unclassified`; the 5 known pilot-band transfers classified by path + actors + day (expected: succession ×4, gear-gift ×1); Wanjiru classified per §3 (replay if reproduced, else old-corpus + identity rule, labeled) | must hold for DIAG-GO |
| 4 | **No misclassification** — no rearm take, grant, kill-loot, or corpse-take in the replay corpus is classified as a living transfer; `_lendSearcaster` records 0 non-null returns (LEND unset) | must hold |
| 5 | **Sense-test delivered** — one transfer read end to end in plain words (the succession or the gear-gift, whichever the replay proves first), naming the people, the day, and what actually moved (or did not move) | must be delivered |
| 6 | **Wall numbers recorded** — wins / national / table (not instrumented — recorded as not instrumented, never faked) / wave-5 unlocks + wave-5 faced / median survival, from the replay corpus | must be recorded |
| 7 | **No game-code change** — zero src/js diffs in this arm (neutral recorder only) | must hold as stated |

**Verdict rule (frozen, DIAGNOSTIC vocabulary):** DIAG-GO = bars
1–7 pass (the paths are named, every transfer classified, the
census verdict stands with custody now tracked). DIAG-NO-GO =
bar 3 or 4 fails (a transfer resists classification, or an
acquisition misclassifies — the instrument or the code read is
wrong; fix it, do not publish a classification). INCOMPLETE =
bar 1 or 2 fails (instrument broken or replay does not reproduce
the census; fix the instrument, do not judge transfers). The
deliverable is the classification table + the named paths; the
custody question ("does custody tracking now hold?") is answered
by whether the wrap sees every move — DIAG-GO means yes.

**Balanced panel (§15): INAPPLICABLE — pure diagnostic, no
before/after change exists to compare.** No panel built, no
compare run; stated explicitly per the frozen prereg §7 so the
absence is a design fact, not an omission.

## 7. Run plan (frozen)

- **Pre-flight (NOT judged):** `node
  scripts/analyze-guntransfer-b.js --selftest` → green; `node
  scripts/test-guntransfer-b.js` → green; `node
  scripts/test-guntransfer-b.js --live` → green; lineage: `node
  scripts/analyze-gunholder-census-b.js --selftest` → green
  (reused census analyzer intact); `node
  scripts/test-gunholder-census-b.js --live` → green (substrate
  channels still behave on this base).
- **Replay (judged):** 8 seeds 107750–107757, single leg MODE=arm,
  substrate §4, horizon 150d death-aware, competent verbatim,
  ONE process sequential. Instrument check (anchor, policySha,
  0 errors, flags, staged arrivals) before judging.
- **Witness replay (judged for §3 only):** s107741 with the new
  driver, same substrate, horizon 150d. If it diverges, §3's
  Wanjiru fallback applies (labeled in the evidence).
- **Analysis (judged):** analyzer `--dir` on the corpus; test
  `--dir-arm` corpus validation; classification table (all
  transfers + any new ones); sense-test trace; wall numbers;
  custody chains for every gun.
- **Metric review** (to be filled in the evidence file; §14 — no
  in-run re-scoring: a miss is judged as written, and any metric
  that proves wrong is proposed for the NEXT run, never swapped
  here).
- **Sim-findings:** mark line 2732 `claimed` on this commit;
  mark `fixed` only if the arm lands DIAG-GO (every transfer
  classified, paths named — the entry's next step, done).

## 8. Infra notes

- The prereg commits BEFORE any judged run (this commit: prereg
  + findings-claimed only; instrument commits after, before the
  replay). The replay corpus will carry the prereg-commit anchor.
- The replay runs on one process sequentially — the 2026-11-24
  ~04:22Z OOM kill (16 concurrent drivers) is the reason; do not
  "speed it up" with parallel legs.
- If the run window ends mid-band, corpus + progress note are
  committed and the exact done-seed list reported (coordinator
  adopts; nothing faked or extrapolated).
- `days` vs `gameDays`: survival is judged on `gameDays` (same
  field the census used); the raw per-seed `days` field can read
  up to 8 days higher. Consistent across the band.
- The heartbeat may fail on a registry lock held > 120s (the
  census arm hit this ~07:47Z); retry, do not treat a failed
  heartbeat as a run failure.

## Amendment A1 — custody exits are not transfers (detector correction, 2026-11-24)

**What happened.** The frozen detector counted any day-boundary holdings
loss with no gainer as a transfer candidate (`kind: 'vanished'`), which
classified as `unclassified` and failed bar 3. Two such moves appeared on
the replay band: s107751 d151 (ruth_goldstein) and s107756 d44
(gen_stv6af5). Live kit-dump probes (patched driver copy in /tmp, same
substrate, deterministic replay) proved BOTH are custody EXITS, not
transfers: the gun left the counted universe while the holder lived — a
worn-only gun is dropped when `autoEquip` re-seats the slot (evidence
§7). No living person received either gun.

**Change (instrument only, zero src/js).** The analyzer (v2) names custody
exits separately from transfers: `destroyed` (loser alive, no gainer, no
corpse gun), `death-pack` (gun on the loser's corpse), `unexplained-exit`
(liveness cannot be established from the row). Bar 3 now reads: **0
unclassified transfers AND 0 unexplained exits**. The frozen transfer
taxonomy (succession / gear-gift / gear-day-diff / lend / lend-return) is
unchanged; the exit classes are additive. Selftest gains F13–F15 (destroyed
scholar gun, ruth double-succession pattern, unknown-liveness exit).

**Why this is a correction, not a re-judge.** The prereg's own definition
of a transfer (§5) is "a loaded gun moves between living people". A
destruction moves the gun to no one. The detector over-counted by treating
every holdings loss as a transfer candidate. The two exits are named with
mechanism proof, not waved through.

**Wanjiru day correction.** The census read Wanjiru's move as d124 (the
day the double row appeared). The witness replay (same substrate, current
code) reproduces the trajectory through d123 byte-for-byte and shows the
succession is d125: gen_q49jzk0 dies (arena, `player:true`) d124 and
gen_wrbs9h9 becomes the scholar; gen_wrbs9h9 dies (`player:true`) d125
and Wanjiru becomes the scholar. The gun never moved; she did. Wanjiru is
classified succession, replay-proven, day d125.
