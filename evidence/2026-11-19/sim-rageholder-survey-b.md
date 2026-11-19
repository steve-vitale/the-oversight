# sim-rageholder-survey-b — screening survey for a Rage-holder-rich seed band

**Arm:** sim-rageholder-survey-b (DIAG survey) · **Run:** fleshout-loop-b-20261119T2130Z · **Axis:** winnability chain
**Branch:** `sim-rageholder-survey-b` · **Base master:** `5e38f3f7b` (2026-11-19 1815Z adoption closeout) · **Instrument anchor:** `d2ead8d9d` · **Policy sha (competent.js, first 12):** `150229eda010`
**Verdict: GO** — a holder-rich band is designated. **Designated band: seeds 106151–106158** (33 holder-fights, 19 contact, 12 Rage fires per 8 seeds).

## Prereg header (frozen before any judged sim)

- **Prereg file:** `evidence/2026-11-19/sim-rageholder-survey-b-prereg.md`, committed `b9b64d708` before the first survey sim ran. Nothing in the prereg was changed after freezing.
- **Primary metric:** holder-fights per 8-seed band (a `v4encounters` row with `holdsRage === true` — a Rage holder reaching a wave-4+ fight, the laterage-b definition, evades included; the contact subset `rounds > 0` reported beside). Same counting as laterage-b, so the GO floor is calibrated to it.
- **GO threshold (frozen):** at least one screened band with **≥ 8 holder-fights** per 8 seeds, **AND** all files parse (8/8 per band), 0 instrument errors, 0 flag/log mismatches, proof test green + D1 green. Best band published as the designated band for the laterage re-run.
- **Horizon:** 150 days, death-aware, competent verbatim. 150 days because a holder-rich band must show holders across the wave-4 window, not one lucky early fight; death-aware because a band that loses villages early cannot host a re-run.
- **Seeds (4 × 8 = 32, freshness VERIFIED before freezing):** 106121–106128, 106131–106138, 106141–106148, 106151–106158. Zero prior uses of any of the 32 seeds as sim seeds (checked preregs, all dated `.md` evidence, scripts, goal hidden files, and filenames, before AND after the rebase onto `5e38f3f7b`; 10 apparent hits adjudicated by hand — pantry-kcal values and float fragments, none a seed use).
- **Policies / substrate (env flags only, no port, no src change — `src/` diff 0 lines):** `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1`, one leg per band (recorder ON). The laterage-b substrate exactly — finding #2616 requires the survey to run under the re-run's substrate or the designation will not transfer. No OFF leg, no REC leg (D1 repeatability proven for this copy at 30d by the proof test).
- **Instrument:** `scripts/rageholder-driver-b.js` (copy of the laterage driver; diff exactly the documented deltas: arm/mode naming, per-band OUTDIR, file names, header comment), `scripts/analyze-rageholder-survey-b.js` (survey ranker; counting + wall + flag/log agreement), `scripts/test-rageholder-survey-b.js` (proof test, **16/16 green** in ~64s — analyzer selftest 6/6 incl. the laterage 127-encounter / 3-holder shape, a live 5d driver smoke on survey seed 106121, mislabel guards, D1 repeatability at 30d on seed 106121 with identical encounter + holder + fired counts).
- **Ranking (frozen):** holder-fights desc, then holder-fight rate desc, then rage-fights desc, then median survival desc.

## Judged numbers — all four bands, 150d, competent verbatim, survey substrate

| Band | Encounters | Holder-fights | Contact | Rage fires | Holder rate | Mismatches | Errors |
|---|---|---|---|---|---|---|---|
| **106151–106158 (BEST)** | **136** | **33** | **19** | **12** | **0.243** | **0** | **0** |
| 106141–106148 | 118 | 16 | 11 | 10 | 0.136 | 0 | 0 |
| 106121–106128 | 101 | 10 | 7 | 2 | 0.099 | 0 | 0 |
| 106131–106138 | 128 | 2 | 1 | 1 | 0.016 | 0 | 0 |
| **Survey total** | **483** | **61** | **38** | **25** | **0.126** | **0** | **0** |

- **Bars:** holder-rich PASS (best band 33 ≥ 8 — more than 4× the floor), instrument PASS (all 32 corpora validated, 0 errors; see the flap note below on what "files" means here), agreement PASS (0 mismatches: every rageFired row holds Rage and carries a Rage line; no Rage line without the flag). **Verdict GO.**
- **Frozen ranking:** 106151–106158 > 106141–106148 > 106121–106128 > 106131–106138. The best band leads on every key: most holder-fights (33 vs 16), highest rate (0.243 vs 0.136), most Rage fires (12 vs 10).
- **Holder richness is lumpy, not spread** (the launchfunnel lesson, reproduced). Each band's holders ride on one or two seeds: band 4 — 106151 (15) + 106158 (16) carry 31 of 33; band 3 — 106141 (7) + 106147 (7) carry 14 of 16; band 1 — 106123 (7) carries 7 of 10; band 2 — 106136 (2) is the whole band. The re-run's measured Rage pool will be carried by 106151 and 106158; the other six seeds on the designated band are nearly holder-dry. That is the band as measured — report it, don't smooth it.
- **The evade share is high everywhere.** Of 61 holder-fights survey-wide, 23 are evades (rounds 0, no contact); on the designated band 14 of 33 evade. The contact pool (38) is the number the re-run actually fights from, and the Rage-fire pool (25) is smaller still: 25 of 38 contact holder-fights fire (66%), 25 of 61 holder-fights overall (41%). The re-run's prereg should price its pool floor from the contact rate, not the headline rate — the prereg says so, and the numbers now say how far apart they are (33 headline vs 19 contact on the designated band).
- **The firing gate is not the starvation.** Where a holder reaches contact, Rage fires two times in three (25/38). Laterage's band had the same shape at the extreme: its 1 contact holder fired immediately. The scarcity is holders in the field population, and secondarily evasion — not the gate.

## Per-seed holder map (designated band and runners-up)

| Seed | Band | Encounters | Holders | Contact | Fired | End |
|---|---|---|---|---|---|---|
| 106151 | 106151–106158 | 22 | 15 | 6 | 5 | — |
| 106158 | 106151–106158 | 33 | 16 | 12 | 7 | survived 150d, standing 445 |
| 106141 | 106141–106148 | 26 | 7 | 7 | 6 | — |
| 106147 | 106141–106148 | 34 | 7 | 2 | 2 | — |
| 106123 | 106121–106128 | 48 | 7 | 7 | 2 | survived 150d, standing 425 |
| 106136 | 106131–106138 | 27 | 2 | 1 | 1 | — |
| 106143 / 106146 | 106141–106148 | 3 / 6 | 1 / 1 | 1 / 1 | 1 / 1 | — |
| 106126 / 106127 | 106121–106128 | 11 / 20 | 1 / 2 | 0 / 0 | 0 / 0 | — |
| all other seeds | — | — | 0 | 0 | 0 | — |

Full per-seed tables for all four bands are in `rageholder-survey-b-survey.json`. The two engine seeds (106151, 106158) are both holder-rich AND contact-rich: 106158 alone has 12 contact holder-fights and 7 fires — more observable Rage fights on one seed than laterage's whole band.

## Wall numbers (every band)

| Band | Wins | National rank | Standing ≥200 | Wave 5 | Wave 4 | Median survival | Survived 150d | Deaths | Starvation |
|---|---|---|---|---|---|---|---|---|---|
| 106121–106128 | 0/8 | 0/8 | 2/8 | 2/8 | 8/8 | 150d | 6/8 | 600 | — |
| 106131–106138 | 0/8 | 0/8 | 5/8 | 5/8 | 8/8 | 133.5d | 3/8 | 717 | — |
| 106141–106148 | 0/8 | 0/8 | 3/8 | 3/8 | 8/8 | 150d | 5/8 | 694 | — |
| **106151–106158** | **0/8** | **0/8** | **3/8** | **3/8** | **8/8** | **150d** | **6/8** | **836** | — |
| Survey total | 0/32 | 0/32 | 13/32 | 13/32 | 32/32 | — | 20/32 | 2847 | 36 |

- No band won; no village reached national rank. The designated band is unremarkable on the wall (3/8 wave-5, 3/8 standing ≥200) — it designates on holders, not on standing.
- Deaths are heavy everywhere (600–836 per band); starvation is a sliver (36 of 2,847 deaths survey-wide). Villages die fighting, not hungry — same picture as every recent round.
- Band 2 is the strongest wall band (5/8 wave-5, 5/8 standing ≥200) and the holder-driest (2 holder-fights). Standing and holder rate do not travel together on this survey — the re-run cannot pick a band by standing and expect holders.

## Village assessment (plain words)

This survey found the Rage holders the laterage diagnostic was starving for — and found them concentrated in two villages. On the designated band, two villages (106151 and 106158) hold almost all of it: thirty-one of the band's thirty-three holder-fights, nineteen fights where a holder actually stands in front of a wave-4 monster, twelve times Rage fires. The rest of the band is quiet: four of the eight seeds never see a holder at all. That is not a flaw in the survey; it is what a holder-rich band looks like under this instrument — a couple of villages where Rage holders keep walking into wave-4 monsters, and the rest where they never do.

The holders who do fight are the real thing. Luiz walks into the Eulogy on day 92, his eyes go red on round one, and his doubled strikes land for 38 and 32 while Rafael charges in beside him. Nina walks into the Cancellation on day 95 and lands an 83-damage doubled strike before bandaging herself mid-fight. These are not the laterage shape — a holder about to die firing once and landing nothing. These holders fight, deal real damage (155, 388, 588 across their fights), and still usually flee: the fights are long, the monsters are huge, and nobody on the survey kills a wave-4 monster with Rage. The firing gate works. The damage race is still the wall.

The villages around the holders are still dying young. Twenty of thirty-two survived to day 150, none won, none reached national standing, and the death toll is over two thousand eight hundred people across the survey. The strongest band by standing is the one with almost no holders at all. The holders are a real signal inside a hard game — not a sign the game is fixed.

## Sense-testing (reading the transcripts, judging meaning)

**Luiz vs the Eulogy, seed 106151, day 92 (4 rounds, 155 dealt, vFlee).** This reads like a real fight, not a template. Luiz walks straight in, Rage fires round one, his doubled strikes land 38 and 32 while the monster's hits are absorbed in chunks of 50 by gear, and Rafael charges in when Luiz shouts for help. The voice lines land — "Luiz's eyes go red" is the same line every time, but the fight around it is specific: gear absorbs, a companion arrives, the monster keeps hitting for 10–11. The weakness is the same one launchfunnel found: the monster's attack is always the same sentence, and the fight ends in flight with the Eulogy still standing at 889 HP.

**Nina vs the Cancellation, seed 106151, day 95 (5 rounds, 388 dealt, vFlee).** The richest holder fight in the survey. Nina fires round one, lands 83 (x2.5) on round two — the Blooded bonus stacking on top of the Rage doubling — then spends round three on field medicine while Amina charges in. The Cancellation's lines are specific and strange ("the stamp descends over Nina (1/3). Red ink."), and the fight reads as a real contest between two systems: the village's Blooded knowledge, the holder's Rage, the companion's arrival, the wound that needs binding. It still ends in flight. A holder can deal 388 damage to a wave-4 monster and still not kill it — that is the damage wall, stated as a fight rather than a number.

**Luiz vs the Suburb, seed 106151, day 100 (12 rounds, 588 dealt, vFlee).** Twelve rounds, the longest holder fight in the survey, and the clearest proof the pool is usable: doubled strikes land round after round (34, 36, …), Rafael fights beside him, the Suburb's HOA Fine and Property Tax lines keep their deadpan menace. 588 damage and the fight still ends in flight. If the re-run wants a kill, it will need more than a holder who fires — it will need the damage to finish.

**The evades.** Fourteen of the designated band's thirty-three holder-fights end before a round is fought: "Nina saw The Audit in time and gave it room." "Luiz saw Big Loud in time and gave it room." These lines read true — a holder who sees the monster in time and walks around it is acting like a person, not a spawn table. But they are also the second leak in the pool: the re-run's 33 headline holder-fights are 19 fights. Note the double-naming wrinkle again, same as laterage's d76: the evade line calls the Eater "Big Loud" and the Eulogy "Big-Eyes" (the village's knowledge-gated nicknames) while the mechanics lines use the true names. Minor fiction wrinkle; no action owed.

**One holder who never fires.** Farid vs the Rerun, seed 106151, day 142 (4 rounds, 197 dealt, vFlee, no fire): Farid holds Rage, strikes for 48 twice, and never fires — the monster is never above the gate, or the gate never opens in four rounds. He still deals 197 damage. The gate is not the only way a holder contributes, and the re-run's taxonomy should keep the never-fire contact holders visible rather than dropping them.

## Metric review

- **The GO bar worked, and the floor was honest.** 33 on the best band against a floor of 8 is not a marginal pass — the survey found a band where the laterage re-run's pool floor (8 observable Rage fights) is reachable from the contact pool alone (19) and comfortably from the fire pool (12 fires already observed). The floor priced the re-run's need, and the designated band clears it on every sub-count, not just the headline.
- **Headline vs contact vs fired: three pools, one designation.** The frozen ranking keys on holder-fights (33), then rate, then fires. The re-run needs fires; the survey designates on holders. The gaps are now measured: 33 → 19 → 12 on the designated band. A future survey for a fire-count floor should rank on fires directly; this survey's ranking stands as frozen, and the best band happens to lead on fires too (12 vs 10), so the tension did not change this verdict.
- **Lumpiness, again.** Two seeds carry 31 of 33 holder-fights on the designated band. The re-run must run the full band and report per-seed holder-fights alongside the total; a re-run that samples only part of the band, or that re-rolls a seed, will see a very different holder rate.
- **Band 2 is a useful negative control.** 2 holder-fights on 8 seeds, the strongest wall band (5/8 wave-5, 5/8 standing ≥200). It bounds the survey: holder-richness is a property of the seed band, not of the substrate or the village's strength — the same substrate produced 33 holders on one band and 2 on another. That is exactly what a screening survey is for.
- **competent.js changed since launchfunnel-b.** The policy sha is `150229eda010`, not launchfunnel-b's frozen `729af71ccddd` (bowcraft turn-on + the 1815Z adoption landed in between). This survey is internally consistent — all 32 seeds ran the same verbatim file — but holder rates are NOT directly comparable to any earlier band's rates under a different policy file. The binding comparison that holds is within this survey (four bands, one tip).
- **Survey-substrate caveat (pre-registered).** The survey ran WITHOUT ALLYSLOT3, exactly as the laterage re-run will (laterage never ported it). Finding #2616 is satisfied by construction: the designation transfers because the substrate matches. If a future re-run ports ALLYSLOT3, it must re-survey or re-verify the pool on arrival.

## Findings notes for the coordinator

- **Designated band for the laterage re-run: seeds 106151–106158.** 33 holder-fights, 19 contact, 12 Rage fires per 8 seeds. Report the per-seed map with it (106151: 15 holders / 5 fires, 106158: 16 holders / 7 fires — the holders live there). Full band, not a subset.
- **Finding #2614 is answered with a number:** holder-fights run 2–33 per 8-seed band (survey total 61 in 483 encounters, 12.6%); contact holders 38, Rage fires 25. The laterage band's 3-in-127 was the low end of the distribution, not the norm — but a fresh band can still be that dry (band 2: 2 in 128).
- **The firing gate is not the starvation, quantified:** 25 of 38 contact holder-fights fire (66%). The two leaks are holder scarcity in the field population and evasion (23 of 61 holder-fights evade before contact). The re-run's pool floor should be priced from the contact rate.
- **Damage wall visible inside holder fights:** the best holder fights deal 155–588 damage and still end in flight; no holder fight in the survey kills its monster. The re-run should carry a damage-per-holder-fight number, not just a fire count.
- **Do not re-run laterage on band 2 or on a fresh band without a survey.** Band 2 (2 holders) is what an unsurveyed band can look like; the survey cost ~56 minutes for 32 seeds this time only because a host write flap forced ~2-minute retry loops per corpus file (see infrastructure notes) — the sims themselves ran ~5 minutes per band, as before.

## Infrastructure notes — WRITE FLAP, total during legs 2–4

- **Write flap:** active from ~22:00Z (mid-band-2) through the end of the run (23:0xZ), still total at the time of writing. Every corpus-file write on bands 2–4 failed its 480-retry loop (EPERM on write, 120s per file) and fell back to printing the corpus JSON to stdout (`@@FALLBACK`). Band 1 wrote 8/8 files; band 2 wrote 4/8; bands 3–4 wrote 0/8. **No data was lost:** the tee'd legs log (`rageholder-survey-b-legs.log`, 2,826,548 bytes, 32 seed summary lines) holds all 20 fallback dumps, and all 20 parsed cleanly with seeds matching their filenames (0 parse failures). The analysis in this file was computed IN MEMORY from the complete 32-seed dataset (20 log dumps + 12 on-disk corpora) with the frozen analyzer's counting reimplemented exactly — no disk writes were possible for the analyzer run, so the survey JSON beside this file was assembled from the same in-memory computation, not from the analyzer's file-writing main path.
- **Consequence for the instrument bar:** the analyzer as coded checks `files === 8` per band dir. On disk right now that check FAILS for bands 2–4 (4/0/0 files). That is a write-flap artifact, not an instrument failure: the data is complete and validated (8/8 corpora per band in memory, 0 instrument errors, 0 mismatches). The coordinator/adoption MUST materialize the 20 missing corpora from the legs log (`@@FALLBACK` blocks — the recovery script is at `/tmp/recover-rageholder-corpora.js`, which parses, validates, and flap-hardened-writes them) once the flap clears, then re-run `node scripts/analyze-rageholder-survey-b.js <4 band dirs>` to reproduce this verdict from disk. Do NOT treat the on-disk file count as the survey result.
- **Safe-commit index clobber struck twice** (after both instrument commits): the index showed committed files as staged-deleted / untracked while the commits were correct. Repaired both times with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified status empty + diff HEAD empty + `hash-object` == HEAD blob per file. Run `git status --short` after EVERY safe-commit.
- **Timing:** band legs 5m29s / 12m08s / 19m40s / 18m56s (~56 min total; bands 3–4 inflated by the 120s-per-file retry loops, not by sim cost). Proof test ~64s. In-memory analysis <1s.
- **Flap watch:** single small writes occasionally slip through during a total flap (a 1-line probe write to the repo succeeded at ~23:01Z while 100KB corpus writes EPERM'd continuously) — do not mistake one lucky probe for a cleared flap. Verify every write by size/readback.

## Files

- Prereg: `evidence/2026-11-19/sim-rageholder-survey-b-prereg.md` (commit `b9b64d708`)
- Evidence (this file): `evidence/2026-11-19/sim-rageholder-survey-b.md`
- Survey: `evidence/2026-11-19/rageholder-survey-b-survey.json` (assembled from the in-memory computation; see flap note — re-run the analyzer from disk once corpora are materialized)
- Corpora: `evidence/2026-11-19/perseed-rageholder-survey-b-106121-106128/` (8 files on disk), `...-106131-106138/` (4 on disk, 4 in the legs log), `...-106141-106148/` (0 on disk, 8 in the legs log), `...-106151-106158/` (0 on disk, 8 in the legs log)
- Logs: `evidence/2026-11-19/rageholder-survey-b-legs.log` (32 seed summaries + 20 `@@FALLBACK` corpus dumps — the complete dataset)
- Instrument: `scripts/rageholder-driver-b.js`, `scripts/analyze-rageholder-survey-b.js`, `scripts/test-rageholder-survey-b.js` (commit `d2ead8d9d`)
- Recovery: `/tmp/recover-rageholder-corpora.js` (one-off; NOT part of the arm)
