# sim-reunionwild-b — is the wild Reunion pack over-lethal relative to its spawn share?

**Arm:** sim-reunionwild-b · **Loop B run:** fleshout-loop-b-20261125T0130Z
**Axis:** winnability-chain · **Answers:** wilddeath blank #2 / 2230Z
next blank (3)
**Verdict: DIAG-GO** (all 4 frozen bars pass, §7) —
**substantive answer: ELEVATED-BUT-UNPROVEN** (frozen ladder, §3).
**Prereg:** `evidence/2026-11-24/sim-reunionwild-b-prereg.md`
(committed `99f2b00e0` before any judged join)
**Analyzer:** `scripts/analyze-reunionwild-b.js` ·
**Proof:** `scripts/test-reunionwild-b.js` (13/13 PASS)
**Type:** DIAG join of two landed corpora. **NO NEW SIMS. Zero src/js
changes.**

## 1. The answer in one paragraph

The wild Reunion pack kills more often per meeting than the other
wave-4 kinds — 29 deaths from 23 TB meetings (1.26 per meeting)
against 40 deaths from 54 meetings (0.74) for the pooled other
wave-4 kinds, a rate ratio of **1.70×** — but the 95% confidence
interval is **[0.86, 3.37]**, so parity is not ruled out and
over-lethality is not proven. The elevation is a **pack-size
effect, not a per-mirror effect**: a Reunion meeting brings 36
mirrors to 23 fights (1.57 per fight) while the other kinds bring
59 monsters to 54 fights (1.09 per fight), and per monster present
the rates are nearly even (0.81 vs 0.68, 1.19×). Nine of the 29
Reunion deaths involve two or three mirrors at once; the other
kinds almost always kill alone. In plain words: one mirror is an
ordinary wave-4 monster; a pack of mirrors is what kills you. The
question as asked — over-lethal relative to spawn share — is
answered as far as these two corpora can answer it: elevated,
unproven, and the mechanism is the pack.

## 2. The join, and the correction that made it honest

The brief named fieldFight rows as the contact denominator. That
is the wrong channel, and the prereg froze the correction before
the judged join: **all 95 wild deaths are turn-based fights**
(`tbEnd` losses), while field fights never kill the scholar — 0
scholar-vid `vDie` in 2346 bloodcluster field rows (the 10 scholar
field rows are 9 `vKill` + 1 `evade`). The judged denominator is
genuine TB starts (`tbStarts`, `rebuilt !== false`, wave ≥ 4).
The two channels are disjoint fights (1 of 89 genuine TB starts
shares a day+kind with a field row — coincidence level), and the
kind mix differs sharply by channel: eulogy is 54 field / 16 TB,
Reunion is 15 field / 23 TB, herald is 19 field / 0 TB. A field
denominator would have answered a different question — and it
would have screamed over-lethal (Reunion 29/15 = 1.93 vs eulogy
16/54 = 0.30, 6.5×), which is the channel mismatch talking, not
the monster. The field denominator is reported below only as
sensitivity S2.

No seed/day matching is possible: the corpora are disjoint seed
bands (bloodcluster 109310–109325, wilddeath 109447–109462) on
different anchors. The join is pooled band-level. The substrate
check (prereg §5) found the drift between anchors is voice/naming
only — calledname, hold-line wording, conversation files; a grep
of the full `src/` diff for spawn / wave-pool / startCombat /
tbEnd / fieldFight finds no mechanics change. The absolute
kills-per-contact rates above 1.0 are the cross-band scaling
artifact (the wilddeath band is simply more lethal per day: 95
scholar wild deaths / 2202 days vs 72 / 2082 on the bloodcluster
band, 1.25×); only the ratio-of-ratios is interpretable, which is
why the metric is a rate ratio with a confidence interval.

## 3. The joined table — kills per TB contact, wave-4+ kinds

| kind | wave | deaths | TB contacts | kills / TB contact | field contacts | kills / field | pooled contacts | kills / pooled | flag |
|---|---|---|---|---|---|---|---|---|---|
| reunion | 4 | 29 | 23 | **1.26** | 15 | 1.93 | 38 | 0.76 | TARGET |
| eulogy | 4 | 16 | 16 | 1.00 | 54 | 0.30 | 70 | 0.23 | |
| suburb | 4 | 8 | 7 | 1.14 | 8 | 1.00 | 15 | 0.53 | |
| algorithm | 4 | 8 | 9 | 0.89 | 12 | 0.67 | 21 | 0.38 | |
| eater | 4 | 6 | 7 | 0.86 | 19 | 0.32 | 26 | 0.23 | |
| audit | 4 | 4 | 3 | 1.33 | 17 | 0.24 | 20 | 0.20 | LOW-N |
| editor | 5 | 3 | 3 | 1.00 | 15 | 0.20 | 18 | 0.17 | LOW-N |
| spoiler | 5 | 3 | 1 | 3.00 | 16 | 0.19 | 17 | 0.18 | LOW-N |
| rerun | 5 | 2 | 2 | 1.00 | 1 | 2.00 | 3 | 0.67 | LOW-N |
| influencer | 4 | 2 | 9 | 0.22 | 14 | 0.14 | 23 | 0.09 | |
| strike | 4 | 0 | 6 | 0.00 | 12 | 0.00 | 18 | 0.00 | |
| congregation | 4 | 0 | 3 | 0.00 | 4 | 0.00 | 7 | 0.00 | LOW-N |
| timeslot | 5 | 1 | 0 | — | 3 | 0.33 | 3 | 0.33 | DENOM-ZERO |
| herald | 4 | 0 | 0 | — | 19 | 0.00 | 19 | 0.00 | structural zero |
| finale_crew | 5 | 0 | 0 | — | 2 | 0.00 | 2 | 0.00 | LOW-N |

Pooled other wave-4 kinds with ≥ 5 TB contacts (eulogy,
algorithm, influencer, eater, suburb, strike): **40 deaths /
54 contacts = 0.74**. Reunion **29 / 23 = 1.26**.
**Rate ratio RR = 1.70, 95% CI [0.86, 3.37]** →
**ELEVATED-BUT-UNPROVEN** on the frozen ladder.

Per-monster check (entry-time monster counts, not judged): Reunion
29 deaths / 36 monsters present = 0.81; pooled others 40 / 59 =
0.68; ratio 1.19×. Entry-time counts understate the Reunion pack
(mirrors join mid-fight — the death traces show 1-at-entry
becoming 3 by the kill), so 0.81 is an upper bound on per-mirror
lethality. Death-time pack sizes: Reunion deaths are 20 solo, 4
pairs, 5 triples (9/29 multi-mirror); eulogy 14 solo / 2 pairs,
suburb 7/1, algorithm 6/2, eater 5/1. The pack is the difference.

Named non-rates: **timeslot** killed once with zero TB contacts on
the bloodcluster band — a DENOMINATOR-ZERO join gap (different
bands; a kind can kill on one band and never be met on the other
at n = 1), not a rate. **Herald** is a structural zero: 0 TB
contacts and 0 deaths because it never enters TB at all (84/84
`startCombat` calls refused while a fight was live) — it fights
only in the field. **Spoiler** 3.00 and **audit** 1.33 are LOW-N
artifacts (1 and 3 contacts); no verdict is drawn from them.

## 4. Sense-test — three Reunion deaths, read as stories

All three read as a mirror-pack doing mirror things — the returned
move is the killer in each.

**Rosa Mendez, 109450, day 79** (solo, one Reunion, trail edge,
day-part 3). She strikes for 81 with a Phase blade — a huge hit —
and the mirror answers: "reunion's Your Move finds you — no
dodging it." / "Armor absorbs 49." / "Reunion's Your Move hits you
for 17." / "You go down." One strike out, one returned strike
back, dead. The mirror did not out-stat her; it returned her.

**Saengduean, 109460, day 144** (grove, two Reunions, four
fighters). Brian hits reunion 1 for 9; "A face goes still —
released. The mass shudders." — one mirror dies — then reunion 2's
Your Move lands for 14 through armor and she goes down. The pack
absorbs a death and answers. (Same seed, same day: Brian succeeds
her as scholar and dies to an Editor the same day — succession can
put the next scholar straight into a fatal fight.)

**Amina Diallo, 109456, day 116** (solo, one Reunion, haven,
day-part 3, ROUND 8). Eight rounds against a single mirror before
the returned move lands for 23. A long duel, not a gank — the
mirror outlasted her. The three deaths together show the pack's
two faces: the quick returned kill (Rosa, Saengduean) and the
grinding one (Amina).

Every death trace ends with the gambler line ("OH. Oh no. ...The
gamblers are very quiet.") — already filed by wilddeath; it is the
arena audience's voice on a wild fight, still unvaried.

## 5. Village assessment (plain words)

Two bands, sixteen villages each, and the Reunion's reputation
survives the denominator — but only just. It really is the
commonest killer in the wild, and per meeting it really does kill
more often than the other wave-4 kinds. What the join takes away
is the certainty: with 23 meetings on one band and 29 deaths on
another, the gap could be seed luck, and the interval says so
plainly (0.86 to 3.37). What the join adds is the mechanism: the
mirror is not individually over-lethal. One mirror kills at about
the going rate for a wave-4 monster. The pack kills because there
are two or three of it, and each one returns your own moves. If
Steve ever wants the wild Reunion tamed, the lever is the pack —
how many mirrors a meeting brings — not the mirror's own numbers.
Nothing in this join touches the arena Reunion, which already
carries the 40%-HP / 60%-damage cut and the mirror cap of one; the
wild pack has no such cap, and these deaths are the receipt for
that. The villages themselves look the same as in the two source
censuses: no wins, no national, the door opening on the same
handful of seeds, veterans living about twelve days after blooding
and dying in field fights.

## 6. Scale-wall numbers (both corpora — no new sims in this arm)

| | wilddeath band (109447–109462) | bloodcluster band (109310–109325) |
|---|---|---|
| Wins | 0/16 | 0/16 |
| National / table | 0/16 / 0/16 | 0/16 / 0/16 |
| Wave-5 unlocked | 9/16 | 4/16 |
| Wave-5 faced | 7/16 | 3/16 |
| Wave-4 faced | 16/16 | 15/16 |
| Median survival | 150 days (censored, 10/16 survived) | 150 days (censored, 11/16 survived) |

## 7. Frozen bars — judged

| Bar (prereg §4) | Result |
|---|---|
| 1. Classification completeness — 95/95 wild deaths attributed to exactly one kind; 0 unclassified | **PASS** — 95/95; 0 unclassified; 0 multi-kind after dropping null-wave adds (the one focus_group + focus_group_eye death attributes to focus_group alone); cross-check regDeaths wild+player = 95 |
| 2. Denominator integrity — TB contacts reproduce the bloodcluster counts; refused excluded and counted; every w4+ kind's denominator stated | **PASS** — genuine TB 89 + refused 92 = 181 w4+ starts; field 211; pooled 300 (reproduces bloodcluster exactly); every kind's denominator stated including timeslot 0, herald 0, finale_crew 0 |
| 3. Cross-checks — numerator 95 = regDeaths 95; BC-band scholar wild deaths reported | **PASS** — 95 = 95; BC band 72 scholar wild deaths / 2082 days vs WD 95 / 2202 days (1.25× per-day scaling, the artifact behind absolute rates > 1.0) |
| 4. Verdict rule — DIAG-GO iff bars 1–3 pass, table complete, answer read off the frozen ladder | **PASS** — table complete for all 15 w4+ kinds; RR 1.70 CI [0.86, 3.37] → ELEVATED-BUT-UNPROVEN |

**Verdict: DIAG-GO.** The join answers the question on the frozen
bars. The substantive answer is ELEVATED-BUT-UNPROVEN: the wild
Reunion pack kills ~1.7× per meeting vs the pooled other wave-4
kinds, but the interval spans parity, and per mirror the rate is
nearly even — the pack, not the mirror, is the elevation.

## 8. Metric review (for the NEXT run, §14 — no in-run re-scoring)

- **The field denominator would have lied.** S2 (field-only)
  gives Reunion 1.93 vs eulogy 0.30 — a 6.5× "finding" that is
  pure channel mismatch: field fights kill villagers, never the
  scholar. The prereg's correction (TB denominator) is validated
  by the join itself: the TB ladder answer (1.70×, CI spans
  parity) and the field answer (6.5×) cannot both be right, and
  only the TB channel contains the deaths. Any future join of a
  death corpus to a contact corpus must match channels first.
- **Absolute rates > 1.0 are the artifact, named in advance.** The
  prereg expected them (cross-band scaling 1.25×); they appear for
  reunion (1.26), eulogy (1.00), suburb (1.14), audit (1.33),
  editor (1.00), rerun (1.00), spoiler (3.00). No rate is read
  absolutely; only the ratio is interpreted. A same-band join
  (one instrument recording both contacts and deaths) would remove
  the artifact — that is the next arm's prereg if Steve wants the
  question settled rather than bounded.
- **Small-n is the whole story.** The largest kind count in the
  join is 29 deaths / 23 contacts. The CI width (0.86–3.37) is
  honest about that. No lever should be built on RR 1.70 alone;
  the pack-size mechanism (36 mirrors / 23 fights vs 59 / 54) is
  the sturdier finding because it does not depend on the ratio.
- **Bloodcluster per-seed table mismatch (finding, not chased).**
  The published per-seed "W4 contacts" column in
  sim-bloodcluster-b.md §5 does not reproduce from the raw JSONs
  on 10 of 16 seeds (e.g. 109312: table 61 vs 56 field + 12 TB =
  68), though the pooled totals reproduce exactly (300; door 167 /
  non-door 133). This join computes everything from the raw
  per-seed JSONs and does not use that table. Filed in
  sim-findings.md.
- **No re-scoring.** The interpretation ladder was frozen before
  the judged join; the analyzer's ELEVATED-BUT-UNPROVEN is the
  ladder's output for RR 1.70 CI [0.86, 3.37], not a judgment
  call made after seeing the numbers.
- **Arena contamination bounded, not corrected.** TB starts carry
  no arena flag; the wilddeath band has 4 scholar arena deaths on
  16 seeds, so arena TB fights are rare and any denominator
  inflation per kind is small. The one w4 kind with an arena
  death (eater, 1) would move from 6/7 to 6/6 if its arena start
  were excluded — the pooled rate would move 0.74 → 0.75 and RR
  1.70 → 1.68. Immaterial; left as is.

## 9. Next blanks, in order

1. **Settle it same-band.** A single instrument recording TB
   contacts AND wild deaths on one seed band would remove the
   cross-band scaling artifact and the CI would tighten on the
   same n. If RR stays > 1.5 with the lower bound above 1.0, the
   pack-cap lever follows; if it falls to ~1.0, the Reunion is
   proportional and the question closes.
2. **The pack-size lever.** If the question is settled toward
   over-lethal, the lever the mechanism points at is the wild
   pack size (mirrors per meeting), not the mirror's HP/damage —
   the arena already caps the mirror at one; the wild has no cap.
   Do not build on RR 1.70 alone.
3. **Herald never enters TB.** 84/84 `startCombat` calls refused
   while a fight was live; 19 field contacts, 0 TB contacts, 0
   deaths. Either the herald is field-only by design (then the
   refused calls are noise) or its TB entry is broken (then a
   whole monster never reaches the fight the deaths come from).
   Worth one look at the call site.
4. **Same-day succession deaths.** Seed 109460 day 144: Saengduean
   dies to two Reunions and Brian, succeeding her the same day,
   dies to an Editor the same day. A new scholar inheriting a live
   fatal fight the same day they take over is worth a check — is
   the successor thrown into the predecessor's fight, or did two
   separate fights land on one day?

## 10. Infrastructure

- Write flap: probe `git update-ref refs/heads/probe HEAD` OK at
  run start; no write refusals during this arm's three commits.
- Safe-commit index clobber struck on the prereg commit AND the
  analyzer commit (committed files showing staged-as-deleted
  while byte-identical on disk). Repaired both times with the
  documented pipe (`git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info`); verified status empty +
  diff HEAD empty + hash-object matches after each repair. The
  commits themselves were always correct.
- Heartbeat sent at run start (`bash scripts/worktree-heartbeat.sh
  sim-reunionwild-b`).

## 11. Proof and landing

- Proof: `scripts/test-reunionwild-b.js` — **13/13 PASS**
  (determinism byte-identical; corpora 16+16 files, exact seed
  bands; numerator 95 = regDeaths 95; classification 0
  unclassified / 0 multi-kind; denominators 89 + 92 = 181 TB,
  211 field, pooled 300; TB contacts by kind; RR 1.70 CI
  [0.86, 3.37]; ladder rungs; denom-zero / structural-zero
  named). Analyzer output reproduced every prereg §6 spot-check
  exactly.
- Commits (branch sim-reunionwild-b; coordinator merges via
  --ff-only; ready to merge, pending ship — no push, no bump, no
  live verification by this worker):
  - `99f2b00e0` sim-reunionwild-b prereg (before any judged join)
  - `1ad5a787d` sim-reunionwild-b analyzer + proof test (13/13)
  - (evidence commit follows)
- Files: prereg + evidence in `evidence/2026-11-24/
  sim-reunionwild-b*.md`; analyzer `scripts/analyze-reunionwild-b.js`;
  proof `scripts/test-reunionwild-b.js`.
- Telemetry deviation check (body step 10): NOT APPLICABLE — a
  DIAG join of landed corpora with no before/after change; the
  wall numbers in §6 are the report.
- Convergence state: DIAG-GO — the census question is answered as
  far as these corpora can answer it (elevated, unproven, pack
  mechanism named); settling it needs a same-band instrument
  (blank #1 above), and any lever follows from the pack size, not
  the mirror's numbers.
