# Journey — crisis, run r181 (Lane B, leg 6)

**Run:** oversight-playtest-loop-2, Wed 2026-11-11 16:00 CST (21:55Z). Rotation 6 → **7** (succession next).
**Worktree:** `journey2-crisis`, branch `journey2-crisis`, base master `1f27fd269`.
**Panel:** policy oracleV2, 150d death-aware + 10d tail, seeds **14411–14415** (fresh band, verified against all prior preregs and forbidden bands). Pilot 14411–14413, then full panel. Determinism proof passed: seed 14411 re-run is byte-identical (JSON + transcripts).

## Leg question (preregistered)

**Decompose the zero.** In r180 the Haven pharmacy was EMPTY on 5/5 seeds — 0 medicine acquisitions, 0 medicine cures — while ability cures ran 0–22/seed. Where does the supply die: searches, the rare roll, the cure tables, or the pharmacy?

**Answer — the zero is at stage 1 (SEARCHES).** Across the full pre-fix panel the bot foraged **~2,000 times and searched a ruin exactly once** (seed 14415, day 1, one collapsed barn, nothing found). Every other forage call landed on a plant tile (forest floor, grove, trail edge, creek, wetland, thicket, meadow). No ruin search means no rare roll, no acquisition, no pharmacy stock — the cure tables never even get a chance to fail. The axefirst policy has a ruin-run road, but the crisis panel's bot does not use it. Changing the shared bot policy is a program call, **not** an in-run change. Filed as the supply-origin answer.

## What was built: the regional ruin-medicine fix (U2)

The code trace (done read-only before the scored seeds) found a second, real defect underneath the search zero: even *if* a villager searched a ruin and won the 8% rare roll, the regional medicines were dead stock.

- The four regional kinds (antimalarial, cold remedy/kakkonto, bandage, ORS) were **absent from every disease's cure table** — using one did nothing and still burned the dose.
- ORS packets carried no `medType` at all, so they entered the inventory as a zero-calorie "can" and the pharmacy never recognised them as medicine.
- Medic-duty channel 2 (a roster medic curing from the pharmacy) tried only antibiotics/antiparasitic.

The fix (unit probe U1 went RED pre-fix, 9 failures, control passing — **ALL PASS post-fix, 10/10**):

- **Fever:** antimalarial now cures; cold remedy and ORS ease it.
- **Gut Rot:** ORS eases it.
- **Wound Fever:** bandages ease it.
- ORS packets carry `medType: 'ors'`; the pharmacy admits any item with a `medType`; medic-duty channel 2 takes antimalarial (the only regional kind with a 'cure' mapping — the ease-only kinds stay usable through direct use).
- Canon: `docs/DISEASES.md` changelog records the tier. This extends the existing "specific ruin medicine" tier rather than inventing a new system; the two medicine pools never mix. Commit carries `[needs-eyes]` — cure fiction changed, Steve can overrule.

## Pre-fix panel verdicts (5 seeds, all game-over, d87–137, 0 horizons)

- **C1 — GO.** Every ending has named, varied causes: wild/monster/arena deaths dominate, with sickness, contest, thirst, starvation, lockjaw, and unclosing wounds in the mix. No siege-mechanic failure anywhere.
- **C2 — GO.** Attempts 12, ok 7, refused 5, cleared 2, deltaBad []. D1 delayed≥3 on 12/12 attempts.
- **C2b — GO.** D3 drift unknown [], leader-aware mismatches [] (the r180 Pavel-class instrument stands ready; no such case this panel).
- **C3 — GO.** 40 transcripts read in full (24 pilot + 16 expansion, 1,297 lines). All five named checks at zero: no fabricated shared history, no voiceline stacking, no naming-stance wobble, no double confession, no recap-quote glitch. Callbacks are accurate to the day (8-day and 14-day gaps land exactly). Favors carry real state across days (asked → promised → fulfilled → thanked). Grief reads as people: Victor setting out extra portions for the dead; Kira rinsing Petra's cup twice; "Henry always took the burnt piece. Said someone had to. I take it now." Kira's taken-sister pods thread ends in a promise to ask the System; the village names its party "MEAT AND FRIENDS". **One genuine defect, filed below.**
- **WRAP — GO.** Unmarked endings as expected for this panel shape (see analysis).
- **C7b — GO.** Buried-dead lists reported per seed (14414: Andre, Tariq Hassan, Katarina; 14415: Hank Nair, Socorro Medina, Yuki Mori, Rafael).
- **Q1 — below trigger.** Missed-window corrected = 1 (a valve-expiry case), far under the 8 trigger. No instrument look.
- **BENCH — mixed, no single lever.** 5 refusals: supply-empty 3, gate-one-short 2, availability-drain 0. Only 1 alive-bench refusal (gate-one-short, with 4 fighters away at other nodes).
- **Q6 — 18th panel at zero.** gorge-after-clear (id-matched) = 0 again. The watch stays open.
- **Q7 —** (see analysis; no overturning result).
- **Fight-1:** 5 of 7 sorties broke after the first fight, all on flee openers — fleeing is still the break driver, consistent with r180. The 2 cleared sorties opened with a kill and took little damage (7, 9). No cleared fight-1 with heavy damage taken — consistent.
- **Medic census:** ability cures 22 across the panel (10/0/1/11/0); medicine cures 0 everywhere; pharmacy empty everywhere; day-60 medicine stash empty everywhere. Nadia Olsen died of lockjaw on seed 14411, day 37 — a disease the fix targets.

## Post-fix panel (seeds 14411–14413, descriptive only)

Per the r180 metric-review rule, the fix shifts the RNG stream, so pre/post is reported descriptively — no fix-effect claim from trajectory deltas. Post-fix: attempts 9, ok 5, refused 4, cleared 1, deltaBad [], D1 9/9, D3 drift unknown [], mismatches [], missed-window 1 (the same valve case), gorge-after 0 (19th panel), ability cures 10/0/1 (identical counts), days and endings identical (100/87/108, all game-over). Ruin searches still 0/0/0, so still 0 acquisitions and 0 medicine cures — **as predicted**: with no searches, the fix cannot show in panel acquisitions. The fix is proven by the unit test, not by the panel; the panel confirms **no regression** in the headline bars.

## Village assessment, in plain words

Five villages, five endings, none of them a win. The pattern is the same one the loop keeps seeing: the village holds together through the middle weeks — people forage, grieve, name their parties, call moots over murders — and then the outside world thins it out faster than it can replace people. Monsters and the wild take the most; the arena and contests take the rest; sickness and thirst pick off the wounded and the unlucky. Two villages scattered with one or two people left rather than dying outright. Pantries ended at zero on four of five seeds. Nobody reached a horizon. The people in these villages act like people — they argue over beast names, keep promises to the dead, press a murder suspect until her story either splits or holds — but the village as a whole still cannot convert its living days into the strength the later waves demand. That is the winnability chain, unchanged by this run.

## Filed: one dialogue defect (C3, seed 14411 d57, Rafael Mendez)

The resume opener garbles a thread three ways at once: it attributes Rafael's own confession ("Before the scattering, I froze when it mattered") to Theo ("what *they* confided"), falsely claims "You weren't there for that one" when the player was there in d43, and then declares the thread "settled" after two recap loops in which nothing new was said. Fix item for the next run: the resume opener must name the speaker who actually left the thread, must not claim the player absent from a conversation they were in, and the "settled" closer must be gated on new content being shared. Localised to one transcript; it does not overturn the C3 GO.

## Reachable / fun / winnable

- **Reachable:** the crisis content fires — sieges, outbreaks, murders, moots, and grief all show up in ordinary play. The medicine content is reachable only through ruin searches the bot never makes; for a human player the road exists but is narrow (8% rare roll on a searched ruin).
- **Fun:** the people are the fun — the conversations in this panel are the strongest the loop has read in a while. The medicine fix removes a quiet trap (a labeled cure that did nothing and ate the dose).
- **Winnable:** unchanged. 0/5 horizons, 0/5 wins. The fix unblocks a cure path; it does not move the winnability chain.

## Metric review

- The supply decomposition worked: it pinned the zero to searches, not tables — but the tables were also broken, and the decomposition would have hidden that if the unit probe had not been run first. Keep the read-only code trace + unit probe as a pre-panel step for any future "zero" question.
- The post-fix panel cannot prove a fix whose supply never arrives. For supply-gated fixes, the unit test is the proof and the panel is a regression check only — say so in the prereg next time instead of implying the panel will show the fix working.
- Q6 (gorge-after-clear) is at 19 consecutive panels of zero. If it stays zero through r190, the bar itself should be re-judged rather than re-measured.

## Infrastructure (LOUD)

- `git pull --ff-only` failed twice with "no such ref was fetched" while `git fetch origin` and `ls-remote` succeed; origin/master is an ancestor of local HEAD (local 25 ahead; ship loop owns pushes). Nothing to pull; treated as a tooling quirk.
- `worktree-reap.sh` failed twice with EPERM on the REGISTRY.json atomic write. Registry itself intact and readable.
- Host write flap 22:28–22:36Z: git probes and plain file writes refused ("Operation not permitted"); cleared by ~22:36Z, heartbeat landed 22:36:03Z. Probe-first, wait-it-out discipline held; no work lost.

## Evidence

- Prereg: `hidden_files/evidence/2026-11-11/journey-crisis-r181-prereg.md`
- Pre-fix panel: `.../journey-crisis-r181-delayed-seed1441{1..5}.json`, `.../journey-crisis-r181-analysis.txt`, 40 transcripts
- Determinism: `.../r181-determinism/` (seed 14411 re-run byte-identical)
- U1 probe: `scripts/test-journey-crisis-r181-regional-meds.js` (ALL PASS post-fix)
- Post-fix panel: `.../postfix-r181/` (seeds 14411–14413), `.../journey-crisis-r181-postfix-analysis.txt`
- Driver/analyzer: `scripts/journey-crisis-r181-delayed-20261111.js`, `scripts/analyze-crisis-r181-delayed-20261111.js`

Merged locally, pending ship. Rotation written 7 (succession next).
