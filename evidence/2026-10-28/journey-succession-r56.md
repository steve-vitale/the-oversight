# Journey succession r56 — SECOND HANDOFF INTEGRITY (lane B, 2026-10-28)

Leg 7 (succession). Rotation-b 7 → 4 (endgame next). Seeds 26131–26136
(fresh band), competent policy, mature regime aspiration
(EARLY_KILL_DAY=40), 45-day successor window. Instrument only, zero
src/js changes. Base master@b6e1677b1 at branch point (lane A's
journey-establishment run was active concurrently in its own worktree;
no shared files touched). Merged locally, pending ship (no bump/push/
live check — ship loop owns those).

Pre-registration: evidence/2026-10-28/journey-succession-r56-prereg.md
(written BEFORE any run). Instrument: scripts/journey-succession-
r56-20261028.js (r55 driver + SECOND_KILL_DPLUS forced second handoff
+ dual-keyed relEnd) + analyzer + proof test, all new files in this
commit. NO FIX in this run, by decision (documented for overrule):
tackle-succession owns the succession inheritance build; this run
delivers the second-handoff BASELINE on master. A competing Lane B
succession change would collide with that workstream (same no-compete
decision as r54/r55).

## HEADLINE

The second handoff keeps the web intact exactly like the first — and
the ledger never forgets a dead bearer, so every handoff adds another
phantom web to the book.

1. SECOND HANDOFF: 28/28. Every second-successor bond present before
   the forced second kill is present at the second handoff, with the
   same warmth (26131: 9/9, 26132: 10/10, 26133: 9/9), and
   pairAffinity is identical pre2 vs post2 on all three forced seeds
   (affinityDiff 0). The first handoff's 45/45 (r55) was not a
   first-time-only effect: the machinery is faithful at every handoff.
2. PHANTOMS COMPOUND. At window end the ledger still holds the first
   successor's whole web on all three forced seeds (Ava 5, Enzo 9,
   Ornella 8 — 22 phantom bonds), plus the original bearer's thin
   web where it had one (Nicole 3; Aurora and Robin died with 0
   bonds, so 0). After 26133's four bearers (Nicole → Ornella →
   Hank → Tashi → Carl), the book holds three dead webs at once.
   Talk dodges them (convoTopics' close-read skips dead partners),
   so no ghost ever speaks — but the book keeps them, handoff after
   handoff. Ledger hygiene (prune vs dodge) is a question for
   tackle-succession, now with a compounding count attached.
3. DUAL-KEYED END RETIRES r55's CAVEAT — FOR BONDS. r55's end columns
   mixed live + phantom rows on chained seeds. r56 reports both keys
   from the same snapshot: original-successor bonds at end vs final-
   bearer bonds at end (26131: 5 vs 9, 26132: 9 vs 10, 26133: 8 vs 12;
   controls agree where no chain intervened: 26135: 5 vs 5). The
   person-deed/affinity end columns still cannot be dual-keyed the
   same way (relEnd only records living villagers, so a dead
   successor reads as snap-missing/null) — that half of the caveat
   stands, named in metric review.
4. SECOND TAKEOVERS FEEL LIKE CONTINUATIONS, NOT RESETS. INH2 class
   mixed on all three forced seeds: kept plants 23/19/22, inherited
   skills 10/9/12 (the second successor's own NPC life plus the
   first successor's teachings), transferred items 1–2, vanished
   items ALL sentimental-class under the death-pack rule
   (contract_quill, boot_stone, mothers_ring, winter_coat_button,
   trail_compass, lucky_coin — every one flagged sentimental in the
   pre-death snapshot). The r54 explained class, second order.
5. NO POST-SECOND-DEATH GRIEVANCE GROWTH. Grievances recorded
   against/by the first successor AFTER their second death: 0 on all
   three forced seeds. r55's finding 7 (grievances rising against a
   successor after her own mid-window death) did not reproduce as
   post-death growth here — the end-window grievance counts (Enzo 3,
   Ornella 3) were recorded while they lived. Caveat: grievances
   stamped on the second-death day itself are not counted as
   post-death by this metric (day > secondDeath.day only).
6. THE DAY-40 SCRIPTED KILL NEVER FIRED. All six first deaths were
   organic phase-A deaths on days 8–20 (Aurora d10, Robin d10,
   Nicole d9, George d20, Tanisha d13, Carmen d8). r55's 3/3 staged
   mature kills now look like the outlier; the r50–r54 organic
   pre-emption streak resumes (now 6/6 this band, 15/18 across
   r50–r55 mature seeds). The villages lose their bearers early
   and organically — the "mature staging" regime is an aspiration
   the game rarely grants, not a reliable test bed. Regime variance,
   not a rule change — but the next band decides whether any
   mature-regime claim can be made at all.
7. M4 ANOMALY, ONE SEED (26133). The first handoff Nicole →
   Ornella reads linOk=false, moOk=false while passed=true and the
   village plays on cleanly for 44 more days through three further
   handoffs, all cause-known. The driver reads lineage/mantleOf at
   detection, a day after the true death day (d9 vs detected d10);
   lineage() is the progression list, not a mantle-only list, so a
   same-day grant/milestone can displace the mantle as "last entry"
   — but mantleOf IS mantle-only (single push site, ledger.js),
   so the moOk miss is not explained by that artifact alone.
   Recorded as an anomaly with a next-step (record the lineage/
   mantleOf tails at organic detection), NOT claimed as a game bug:
   the mantle functionally passed and every later handoff on the
   seed is machinery-clean.

## Village assessment (plain words)

All six villages lived through the 45 days after the mantle passed —
nobody scattered, nobody starved out. Aurora's village (26131) went
Aurora → Ava → Jorge and ended with 10 alive and a comfortable
pantry (26,894 kcal). Robin's village (26132) went Robin → Enzo →
Kwame, 8 alive, pantry fine (19,463). Nicole's village (26133) had
the roughest run: Nicole → Ornella → Hank → Tashi → Carl, four
handoffs, ending with 8 alive but a thin pantry (5,684) — the one
to watch, alive but leaning hungry. George's village (26134) went
George → Khaled → Aki → Leonor, 7 alive, pantry thinnest of the
band (3,850) — alive, but one bad week from trouble. Tanisha's
village (26135) was the quiet one: Tanisha → Rosa, no chains, 11
alive, pantry fat (34,655). Carmen's village (26136) went Carmen →
Ashley → Norman → Liam, 8 alive, pantry fine (23,016). Nobody's
story stopped because the bearer died; the villages bend and keep
going, through as many as four bearers.

## People check (full transcripts read)

Three full transcripts sense-read; villagers act like people in this
leg's windows, with the same two seams as r55.

- 26131 d+30 Lauren (as Jorge, second successor, trust 90): Lauren
  opens with a real want (crying quietly at night so no one hears),
  the bearer answers honestly (how to be hungry and keep going),
  the invitation is ACCEPTED ("Someone should watch your back.
  Might as well be me."), the teach lands (spicebush), ending
  resolved ("This was good. They mean it."). Invitations are
  sometimes taken — as ruled.
- 26133 d+30 Tashi (as Hank, second successor, trust 89): Tashi
  wants solitude talk, a real back-and-forth (treeline breaths,
  "alone is a luxury, and also a little bit a lie"), the invitation
  is DECLINED with a reason ("I've got my own things to handle"),
  the village naming debate is a real shared event (what to call
  Speedbump), the teach lands (dandelion), ending resolved.
  Sometimes taken, sometimes not — the ruling working as designed.
- 26134 d+14 Leonor (bond partner of Khaled, depth 0 v 10): burial
  grief, a trap-line invitation from the NPC, a gift of a kept
  tool ("I made an extra"), grief for Linh BY NAME ("Since Linh
  died... I keep expecting to see Linh at the fire"), and the
  driver's invitation dissolving into "Sorry, lost my train of
  thought" — the r55 dropped-request seam, reproduced a third run
  running. Warm, grieving, generous — and the follow-up still drops.
- Seams carried, not fixed: (a) no bond/shared-past naming anywhere
  (the ledger stores no shared events, so talk invents none —
  honest per design); (b) the dropped-request seam (invite follow-
  ups → lost train of thought), now seen on r54, r55, and r56.

## Verdicts (binding, §14 — a miss is NO-GO, never re-scored)

- CHAIN-READABLE: GO — 3/3 forced seeds carry a full second record
  (relPreDeath2 + relPost2 + secondDeath linOk/moOk + inh2
  readable). The proof seed adds a bonus organic chain (Ray →
  Ethan, scriptedSecond=false) that the tagging distinguishes.
- CHAIN-BONDS (reported): 28/28 survived to the second handoff;
  affinityDiff 0 on all three forced seeds.
- DUAL-END (reported): orig vs final bond counts per seed above;
  r55's mixed-column caveat retired for bonds, standing for
  person-deed/affinity end columns (living-only snapshots).
- INH2 (reported): mixed 3/3; vanished 6/6 sentimental-class.
- SCRIPT first kill (carried): staged-or-organic honored on 6/6 —
  all organic, 0 scripted (finding 6, not a miss: organic counts).
- V1 (carried): 0 snapshot seeds (all organic), 0 FAIL-alive-
  silent — GO vacuously, named.
- C1v3 (binds): GO — 0 missing on all seeds.
- W1d-tightened POOLED HEADLINE (binds): GO — 3/3 = 1 ≥ 0.5.
- S1 (carried): GO — 0 missing bearerDeltaExact, 0 bad solo.
- MG2v2 (binds): GO — 0 violations, all seeds.
- M3v2b (carried): GO — ≥ 2 on 4/6 seeds (3, 6, 6, 4; 26131 and
  26133 at 1).
- M1: GO — true on 6/6. M4: PARTIAL — true on 5/6; 26133's
  organic-detection anomaly documented in finding 7, not scored
  as a machinery failure (mantle functionally passed).
- Chain mantles: all cause-known (forced scriptedSecond=true,
  organic chains arena/known causes). Identity trips: 0 everywhere.

## Fun / reachable / winnable (leg verdict)

- REACHABLE: yes — every seed staged a mantle pass (all organic
  this band) plus a full 45-day successor life, and the forced
  second handoff fired on 3/3 forced seeds without driver
  intervention beyond the competent policy.
- FUN: yes, with the known texture — second successors arrive
  mid-web (their own friends, their own deeds, the first
  successor's teachings in their skill list), not as resets. The
  four-bearer village (26133) and the two thin-pantry villages
  (26133, 26134) are the leg's best drama.
- WINNABLE: the leg doesn't gate the win, but nothing in this band
  blocks progress toward it — successors climb, villages warm,
  the codex only grows, bonds only deepen. No NO-GO.

## Blanks filled or documented

- FILLED (instrument): second-handoff integrity is now measured —
  the r56 driver/analyzer/proof test are the baseline
  tackle-succession asked for (item 5's "second handoff" half;
  r54 covered first-handoff items/knowledge/skills, r55 covered
  first-handoff relationships/history).
- DOCUMENTED, NOT FIXED: (a) phantom-bond compounding (22 first-
  successor phantoms this band; prune-vs-dodge question for
  tackle-succession); (b) dropped-request seam, third run running;
  (c) 26133 M4 anomaly + tail-recording next step; (d) mature
  staging aspiration unreliable (0/6 scripted kills this band);
  (e) thin pantries on 26133/26134 — watched, not crises.

## Metric review (§14)

1. DUAL-KEYING FIXES BONDS ONLY. relEnd is a whole-ledger snapshot,
   so bond columns dual-key cleanly (orig vs final ids). But
   personDeeds and affinity in relEnd cover only LIVING villagers
   (relSnap iterates livingRoster), so a dead original successor
   reads snap-missing/null at end no matter the key. Future runs
   that want person-deed/affinity end comparisons on chained seeds
   must snapshot them at the second handoff (relPost2 already
   carries both for the second successor) rather than at end.
2. SECOND-KILL DAY SLIPS WHEN runDays JUMPS TWO DAYS. 26132's
   second kill landed at d+21, not d+20: the pre-call daysSince
   went 19 → 21 across one runDays call (the r41b two-day jump),
   so the first iteration with daysSince >= 20 was d+21. The
   dplus value is recorded per seed, never assumed — no metric
   reads "d+20" as exact.
3. ORGANIC FIRST DEATHS MAKE relPre LAGGED ON ALL SEEDS. With 0/6
   scripted kills, every first-handoff pre column is the morning
   before the death day, not same-day. The handoff comparison
   (pre vs post) is still valid — bonds barely move in a day —
   but same-day precision this band exists only for the second
   handoff (relPreDeath2).
4. GRIEVANCE-DAY BOUNDARY. grievAfter2 counts day > secondDeath.day
   only; a grievance stamped on the second-death day itself would
   not count. The 0/3 result is therefore "no grievance growth
   after the second-death day," not "no grievance ever touched the
   dead" — the r55 finding-7 comparison should use the same
   boundary before claiming a contradiction.
5. TELEMETRY (run after this note per loop step 14, on the
   per-seed TELE files where the baseline keys live top-level):
   2 LOUD lines, both EXPLAINED, baseline NOT rolled. deaths.bearer
   baseline 5 -> current 15: this band records 15 bearer deaths
   exactly (6 first + 9 chains: 3 forced second kills + 6 organic
   chain deaths), so the line measures the run's own chain-heavy
   regime, not new mortality. census.fallen baseline 10 -> current
   21 (+110%): same regime — 15 bearer deaths plus villager
   deaths across 6 chain-heavy villages, against a single-
   handoff-era baseline (r55's band already ran deaths.bearer 7
   vs 5). census.alive, census.integrationStage, and
   week2.deadBearerMentions are quiet. Rolling the baseline
   would bake the forced-chain regime into it, so it stands.
   (A first telemetry run against the stdout JSONs printed all-0
   current values: the keys live inside rec.tele, not top-level —
   instrument-reading trap, not a deviation; the tele-glob run
   above is the valid one.)

## Regression + proof

- Proof test scripts/test-journey-succession-r56-instruments-
  20261028.js: 58 PASS, 0 FAIL (RED: r55 driver lacks all r56
  fields; GREEN: r56 driver emits secondDeath linOk/moOk,
  relPreDeath2/relPost2, inh2 readable, chain tag scriptedSecond,
  dual-keyed end ids, tele counts matching raw arrays). Proof
  scratch (seed 24999 tele + transcripts, both r55 RED-run and
  r56 GREEN-run files) deleted after the run; the proof log is
  committed as journey-succession-r56-prooftest.log.
- Regression: node scripts/check.js --only succession
  --cacheDirectory=/tmp/jest-cache-playtest2: 11 passed, 0 failed
  in 47s (same 11/0 as r55's succession-only check).
- Telemetry: node scripts/telemetry-check.js --baseline
  <goal-hidden>/telemetry-baselines/succession.json --current
  'evidence/2026-10-28/journey-succession-r56-tele-*.json'
  --metrics deaths.bearer,census.alive,census.fallen,
  census.integrationStage,week2.deadBearerMentions: 2 LOUD lines,
  both EXPLAINED above; baseline NOT rolled.
- Full evidence: repo evidence/2026-10-28/journey-succession-r56.md
  (+ prereg, analyzer, 6 stdout/stderr/tele JSONs, 65 transcripts).
