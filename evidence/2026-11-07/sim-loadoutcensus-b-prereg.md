# sim-loadoutcensus-b — prereg

**Arm:** sim-loadoutcensus-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261107T2130Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 (this arm is the bisect's fix-shape sketch Q1) · **Branch:** sim-loadoutcensus-b, cut at master `ece67e0b2` (read fresh in the worktree immediately before writing this prereg; branch tip at prereg time) · **Base for sweeps:** candidate checkouts C1 / P2 inside this worktree (detached for sweeps only); commits always made on the branch tip.

## The question

Does the gear-protection retune in xp-gear (`50881fbf2`) shift the opening keep-5 loadout — armor kept over weapons/tools — leaving villages under-armed in the early game?

The frozen band 53001–53008 collapsed after xp-gear (median 150d → 70.5d, sits 5/8 → 0/8). The bisect (`evidence/2026-11-07/sim-frozenband-bisect-b.md`) partitioned it: the gear retune alone (P2) carries most of the collapse (median 76d, sits 2/8); the XP/synergy/deed half alone (P1) does not collapse the median. The retune feeds only three places: defensive math (`armorReduction`, monotonic — higher is better in a fight), loadout keep-scores (`choosePersonalFive`: armor scores protection×5), and equip preference (`equipScore`: protection×10). Leading hypothesis: the loadout shift.

## Mechanism (design record is code — no canon doc covers keep-5/loadout)

No canon doc covers the keep-5 / loadout system specifically (checked `docs/CANON.md` manifest: no entry for loadout, equipment, or opening gear). The design record is code, cited not invented:

- `choosePersonalFive` (`src/js/game.js:1920`): each villager scores their 8-item pool — sentimental +1000, weapon bonus×10, tool +50, armor protection×5, + `Math.random()*10` idiosyncrasy — keeps the top 5, stashes the other 3 (`ch.stashed`, still theirs, at their space in haven; nobody else's hands touch them).
- `equipScore` (`src/js/equipment.js:240`): weapon slots score weapon bonus×10; body slots score armor protection×10.
- `autoEquip` (`src/js/equipment.js`, "Auto-equip from inventory"): equips ONLY from `v.items` (the kept 5) — never from `ch.stashed`. A weapon in the stash is owned but NOT worn.
- The retune (`git diff 16369893c 50881fbf2 -- src/data/items.json`, 24 insertions / 24 deletions, all armor `protection` values ×~1.5: e.g. hide armor 20→30, SWAT vest 35→53, police vest 30→45). Worked example: a weapon with bonus 12 scores 120; hide armor scored 100 at C1 (kept below the weapon) and 150 at P2 (kept above it). The keep-5 is where the shift bites; equip ranking within a slot is monotonic in protection/bonus, so equipped choice among kept items should barely move.

Earned-vs-kept distinction (binding for the read): the stashed 3 are NOT lost — the owner can equip from their own stash later, give/trade deliberately, or die with them (corpse-lootable except sentimental). A census that counted only kept items would overstate the harm; the census therefore dumps pool + kept + stashed + equipped per villager, and the verdict rests on what they CARRY and WEAR on day 0, not on what they own.

## Candidates (exact construction)

- **C1 = `16369893c`** (journey-deepening r114, HEALTHY in the bisect: median 150d, sits 5/8). Checked out detached in the worktree for sweeps.
- **P2 = C1 + the gear retune only.** Constructed exactly as the bisect did: `git diff 16369893c 50881fbf2 -- src/data/items.json` applied onto a C1 checkout (patch verified to apply cleanly before this prereg was written; 20 hunks, all in `src/data/items.json`, protection values only — no code change at all). The patch file is kept at `/tmp/loadoutcensus-kit/retune-items.patch` during sweeps (bisect working data, not committed); the construction above is the durable record.
- The branch-tip code (post-collapse master) is NOT a candidate: the census compares C1 vs P2 only.

## Census instrument (new, committed before any judged census read)

- Driver: `scripts/loadoutcensus-20261107.js` — per seed: `loadGame({seed})` (seeded `Math.random` before eval, per the harness rules) + `setupGame(Game)`, then a day-0 dump of every living villager in `Game.data.villagers`: name, occupation, `fullPool` (8 ids), kept 5, stashed 3, equipped slots, each item classified weapon / tool / armor / sentimental / other with its keep-score components (weapon bonus, tool flag, armor protection). No `runDays` — this is an opening-days census. Per-seed JSON to `evidence/2026-11-07/perseed-loadoutcensus-b-<c1|p2>/` (committed corpus).
- Analyzer: `scripts/analyze-loadoutcensus-20261107.js` — reads the two corpora, prints per-seed and pooled tables: mean weapons/tools/armor/sentimental kept per villager, armor-kept share, equipped-weapon rate (% villagers with a melee weapon equipped at day 0), stashed-weapons count, and the per-villager keep-5 diffs (which villagers changed keeps C1→P2, and what swapped).
- Proof: `scripts/test-loadoutcensus-20261107.js` — determinism legs (census identical across re-runs), C1-vs-P2 diff legs, earned-vs-kept distinction cases, and an old-code control: the census instrument must read a known shift on a synthetic loadout (a pool where retuned protection flips the keep, worked example above). Per the proof-of-effect rule, the proof artifact IS the census diff itself: the actual keep-5 dumps go in the evidence file, not assertions alone.

## Reproduction gate (runs FIRST, before any judged census read)

The doorwalk baseline driver (`scripts/doorwalk-b-driver-20261107.js`, BASELINE leg only, 150d, frozen band 53001–53008) is replayed at C1 and at P2 with the same frozen instrument the bisect used. The driver + `scripts/policies/competent-doorwalk-b.js` do not exist at C1; fixed copies from this branch tip are placed in the worktree UNTRACKED for sweeps (they survive `git checkout <sha>`; deleted before returning to the branch tip, never committed). All other instrument files are the in-tree versions at the candidate SHA (verified byte-identical across the range by the bisect prereg, §C).

- **C1 must reproduce the bisect's C1:** median 150d, sits 5/8.
- **P2 must reproduce the bisect's P2 shape:** median 76d ±15d, sits 2/8 ±1.
- A failed reproduction is an instrument/base problem, NOT a verdict, and stops the arm.

## Seeds, horizon, policy

- **Seeds:** 53001–53008, FROZEN, deliberately reused — the bisect's diagnostic band. NO new seeds. The frozen band is a diagnostic instrument here, not a tuning target.
- **Horizon:** opening days — the census is a day-0 dump (after `setupGame`, before any day runs). The reproduction sweeps run the standard 150d death-aware horizon.
- **Policy:** none for the census (no days run). Reproduction sweeps use the doorwalk baseline leg (takeseat substrate, door drive off), as the bisect did.

## GO bars (binding, §14)

- **Primary metric:** mean weapons kept per villager (pooled over all villagers × 8 seeds), and armor-kept share (armor items kept ÷ 5 kept, pooled).
- **DIAG-GO (loadout pathway confirmed):** EITHER (a) mean weapons kept per villager falls ≥1.0 from C1 to P2, OR (b) armor-kept share rises ≥10 percentage points C1→P2. Either bar is a systematic shift, and the evidence file names the per-villager swaps that carry it.
- **DIAG-NO-GO (loadout pathway not confirmed):** neither bar met. The verdict then goes to the combat-divergence account: first-divergence day + fight-outcome comparison, already partly done in the bisect (identical first 2–5 fights, streams split d6–d9, first living-count divergence d10–d23) — cite it, do not re-prove the stuck state. A NO-GO does NOT re-score against a friendlier metric.
- **Proof bars:** `scripts/test-loadoutcensus-20261107.js` green (determinism + C1-vs-P2 diff + earned-vs-kept + synthetic-loadout control); reproduction gate passed (above); census dumps attached to the evidence file as the keep-5 tables.
- **Sense-test:** 2–3 keep-5 dumps read in plain words in the evidence file — do the loadouts read like people gearing for the wild, or like a scoring artifact? Plus the village assessment (what the village looked like, who thrived/died and why, what knowledge/capabilities were missing).

## Scale-wall numbers (reported for the reproduction corpora)

National / table / wins, wave 4–5 unlocks, median survival — for C1 and P2 sweeps.

## Non-goals

- DIAG only: zero src/js changes, zero src/data changes on the branch. If the census confirms the loadout pathway, the fix (freeze keep/equip scores at pre-retune protection while keeping retuned combat protection) gets its own prereg and its own arm — do NOT build it here.
- No balanced-panel compare (§15): the question is a census diff between two frozen checkouts, judged by the pre-registered bars above; the reproduction sweeps are the validity check.
- No fresh band, no confirm sweep, no landing, no merge — report ready-to-merge; the coordinator lands it.

## Metric review (pre-registered note)

- The primary metric (mean weapons kept, armor-kept share) is the bisect sketch's own GO bar, tightened here into numbers (≥1.0 weapons, ≥10pp armor share). No friendlier re-scoring is available — the bars above are the judge. If the reproduction gate fails, the metric is not wrong, the instrument/base is — that is a NO-GO with cause, recorded in the evidence file.
- One known limit, stated before the read: the keep-5 score includes a `Math.random()*10` idiosyncrasy term, so small per-villager flips are noise; the bars are pooled over ~96 villagers (12 × 8 seeds) so that a systematic shift, not noise, is what clears them. A shift concentrated in 1–2 seeds with no pooled movement does not clear either bar.
- The stashed-weapons count is a secondary guard against overstating harm: if weapons mostly move kept→stashed (still owned, still equipable by the owner), the evidence file says so plainly and the fix-shape sketch must account for it.
