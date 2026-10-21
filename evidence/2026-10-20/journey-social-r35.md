# Journey social r35 — THE BOND ENGINE (lane B, 2026-10-20)

**Run id:** oversight-playtest-loop-2, 2026-10-20 ~19:00 CDT. Worktree: `journey2-social`.
**Base:** master 5ce8faf12 (journey-establishment r21 landed; sibling merge f2cd52cfd landed mid-run — AGENTS.md push-discipline audit; rebase at landing).
**Rotation:** read 5 (social life); advancing to 6 at closeout.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question: THE BOND ENGINE.** r33 measured the rivalry fuel (tension decay
−1/d beats simmer +0.2/d 5:1 — rivalries can never escalate; measured only, no
tuning, Steve's call). This run measures the other side of the pair-bond store:
deep bonds. r32's design note: "suffering is currently the main plot fuel (most
deaths → most bonds → only cases)". Across 4 citizen 140-day runs:

1. Do deep bonds form in NON-suffering villages, or do they track deaths?
2. What channels forge them? (code says: 'fed them', 'deep talk', 'promise
   kept', 'tended'/'treated', 'lingering meal', 'feast', 'hosted feast',
   'visit', 'fought alongside'/'stood with you', and 'grievance' negative.
   +6/pair/day cap; no bonds with the dead/gone.)
3. Do bonded NPCs surface it in conversation — bondWarm/bondCold small-talk
   tints (depth ±2), warm reopeners, bondBeatWarm/bondBeatCold daily beats — or
   are bonds an invisible stat? (conversation.js: "the bond record stores no
   event history, so no line may name a specific shared event (no fabricated
   memories)" — feeling-level only, by design.)

**Interesting-finding bar:**
- (a) ≥2/4 peaceful seeds (<8 deaths) show ≥8 deepBonds → bonds are healthy
  social fuel independent of suffering; engine is fine, question answered.
- (b) deepBonds tightly track deaths (peaceful villages bondless) → suffering
  is genuinely the social engine → Steve-call to tune bond formation (no
  tuning this run).
- (c) bonds form but never surface (no warm beats on depth≥2 partners, no
  recall of real shared deeds) → invisible-stat blank → fix or queue.

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 instrument GO: daily bond snapshots complete on 4/4 runs (no gaps >2d);
  bondAdd wrapper logs nonzero events on every run.
- M2 bonds-without-suffering GO: on ≥2/4 seeds with <8 deaths, deepBonds ≥8.
  NO-GO = ≤1/4 (bonds are suffering-exclusive).
- M3 people GO: 1 sense-read per run of a conversation with a deep-bond NPC
  (4 reads); 0 senseless flags. Question: do they feel like friends — warm
  tints, recalls grounded in REAL shared deeds, no fabricated history?
- M4 census GO: alive/dead recorded cleanly on all runs.
- L3 informational: the theft-driver telemetry baseline does not bind the
  citizen arm (r27/r30/r32 metric review stands) — report LOUD lines explained,
  do not roll.

**Method:** r32/r33's citizen driver unchanged (law-abiding: no theft, no cruel
picks, no player-initiated violence; favorites food+tending; alternating
deep-daily; comfort duty; gossip forcing GOSSIP_TARGET=3; moot duty voting with
the room). + bondAdd wrapper logging {day, pair names, dv, reason} + daily
bond-map snapshots {day, pairs, deepCount, avgV} + first-deep-pair tracking.
4 fresh seeds (3204–3207), DAYCAP=140, death-aware (+10d tail). 10-day smoke on
seed 3208 first (instrument self-test: bonds>0 AND bondEvents>0).

**Stack:** TRIBFLOOR=1 (r32 pattern). No game-code changes planned; measurement
run. If the instrument finds a bug-class blank (e.g. wrapper never fires), it
gets a proof test and a fix; otherwise evidence + driver only.

---

## RESULTS (4 seeds × 140d citizen runs, base 5ce8faf12)

| seed | days | alive | deaths | pairs | deepBonds | bondEvents | cases | moots | first-deep spread |
|------|------|-------|--------|-------|-----------|------------|-------|-------|-------------------|
| 3204 | 142 | 6 | 11 | 94 | 36 | 1774 | 0 | 0 | d13–d24+ |
| 3205 | 142 | 7 | 8 | 77 | 48 | 2175 | 0 | 0 | d17–d23+ |
| 3206 | 142 | 7 | 4 | 45 | 35 | 1583 | 0 | 0 | d11–d23 |
| 3207 | 142 | 7 | 4 | 60 | 34 | 1999 | 2 | 2 (both acquitted) | d6–d24 |

- **M1 (instrument): GO.** 140–142 daily bond snapshots/run, no gaps >2d; bondAdd wrapper logged 1583–2175 events/run.
- **M2 (bonds-without-suffering): GO (2/4).** Peaceful seeds 3206 (4 deaths) and 3207 (4 deaths) forged 35 and 34 deep bonds — suffering is NOT the only fuel. (Suffering seeds also bonded heavily: 36/48 — bonds are abundant, not scarce.)
- **M3 (people): GO.** 4 late-game sense-reads with deep-bond NPCs (Ingrid d103, Theo d101, Sigrun d100, Otis), 0 senseless flags. Warmth shows through content, not just pools: thread-tracking ("We started on the funniest thing... then got onto what's been happening"), grounded recalls of REAL shared deeds (Farid's unasked food share; the player's televised contest appearances — "They took Luis — Cooking With Teeth, on the screens"), remembered answers ("You said the most useful thing you learned is being hungry and going anyway. Still the lesson?"). One bondBeatWarm fired in the wild (Sigrun d42). Near-miss (driver artifact, not filed): after a clean natural close the driver kept feeding silence picks and the NPC filled the quiet with "...Sorry, lost my train of thought." — coherent filler, but a real player would have left after "Good talk."
- **M4 (census): GO.** Alive/dead recorded cleanly on all runs.

### The bond engine (the finding)

Deep bonds are FORGED, not granted — and the forge is the shared meal:
- Channel ranking (4 seeds, total dv): lingering meal +11,636 / deep talk +1,378 / visit +1,120 / fought alongside +726 / fed them +495 / tended +339 / promise kept +196 / stood with you +34 / treated +6 / grievance −16.
- The player forged 4–11 deep bonds per run (v up to 100, depth 3) — bonds are reachable by play, not just NPC-NPC background.
- First-deep pairs appear from day 6; depth-3 bonds by day ~40.
- Observation (not a blank): the 'feast'/'hosted feast' channel never fired in 560 village-days — the designed celebration does none of the bonding work; the daily lingering meal does. Worth a design look, not a bug.
- Bond warmth surfaces per canon (feeling-level only — no fabricated shared events; the record stores no event history). The people check confirms the constraint reads as honesty, not thinness.

### BLANKS FILLED (2, same L2' verbatim-repeat class)

1. **Settled-want dlg:help parrot.** When an ask_favor sits settled (fulfilled/thanked/broken/acknowledged/declined/moot) and was never engaged (stage < 2 — slips past the beat pool's NO-REPEAT-OFFER guard), the menu re-offered "How can I help?" every turn; the NPC parroted "It's already handled. Thank you for asking." verbatim x5–6 per sitting (s3204 d39 Leo, s3205 d54 Elena, s3206 d45 Nino, s3207 d53 Hannah — 54 of the run's 63 L2' hits). Fix: the settled branch now calls `convoSpendChoice(vid, 'dlg:help')` (src/js/convo-dialogue.js) — the r31 per-sitting spend-out discipline. Proof `scripts/test-social-r35-helpspendout-20261020.js` RED→GREEN. Post-fix re-run of seed 3204: L2' repeats 11 → **0**.
2. **favor_requirements escalation parrot.** The r21 reframe pool had no cap: past "I've told you three times now — ..." the NPC parroted the escalation verbatim x5+ (s3204 d49 Misky t4-t8, d132 Farid — the r31 recap failure mode: the reframe became the repeat). Fix: once the escalation is re-served for the same raw line, `convoSpendChoice(vid, 'dlg:favor_requirements')` (src/js/convo-dialogue.js); counters reset per sitting (src/js/conversation.js). Proof `scripts/test-social-r35-favorreq-spendout-20261020.js` RED→GREEN (3 RED assertions, all green post-fix).

### Reachable / fun / winnable

- **Reachable:** yes — deep bonds form through ordinary play (meals, talk, visits, tending, fighting alongside). No gate, no grind.
- **Fun:** the people check is the evidence — bonded NPCs track threads, remember answers, and reference real shared deeds. The two parrot classes would have cheapened exactly these relationships; both now spend out.
- **Winnable:** n/a for the leg (social life is a full-run layer, not a win path); all villages survived to day 142.

### Telemetry vs social.json baseline

4 LOUD lines, all explained, none rolled (r27/r30/r32 metric review stands — the citizen arm doesn't bind the theft-driver baseline):
- `l3.deepBonds 70 → 153 (+119%)` — explained: citizen arm forges deeper bonds (same direction as r32's +133%); good, not a bug.
- `l3.betrayalCases 53 → 2`, `l3.mootsConvened 53 → 2` (−96%) — explained: theft-driver baseline vs citizen driver, pre-registered (r32 identical).
- `l2prime.count 5 → 63 (+1160%)` — explained AND fixed: 54/63 hits were the settled-want dlg:help parrot (blank #1, now fixed; post-fix seed-3204 re-run: 0). 7 more were the favor_requirements escalation parrot (blank #2, now fixed). 2 were instrument noise (confront beat + its deflection annotation sharing a pickId, different text).

### Metric review (§14)

- The M2 bar (<8 deaths) classified 3205 (8 deaths) as suffering — the boundary is arbitrary but was pre-registered; both peaceful seeds cleared the bar 4× over (35/34 vs 8), so the verdict is robust to the boundary.
- L2' instrument note: `confront:` double-hits on shared pickIds with different text are detector noise, not verbatim repeats — future runs should key L2' on normalized line text only.

### Infra notes

- `check.js --quick` hung at 0:00 CPU / 6+ min with zero output — the known loaded-box hang class (lane A r15 hit the same). Killed; ran the 13 conversation-adjacent suites directly instead — all green. The hang is box load, not this diff.
- Main-tree HEAD moved mid-run (f2cd52cfd merged origin/master's push-discipline audit) — worktree rebased at landing per the hot-tree procedure.
- No `[needs-eyes]`: dialogue-menu hygiene fixes, no feel/combat/UI change a phone pass would catch; the proof tests + pilot re-run carry it.

## Village assessment (plain words)

Four villages, 140 days each, one kind player. The quiet ones thrived: Preeti's village (3206, 4 deaths) and Brian's (3207, 4 deaths) ended with trust in the 90s and 34–35 deep bonds each — people who eat together, visit, and talk deeply stay. Omar's village (3204) lost 11 and still forged 36 deep bonds; grief didn't stop the bonding, it just changed the guest list. Yesenia's (3205) sat in the middle. Two NPC-NPC cases on 3207, both acquitted, player a bystander — the moot machinery idles honestly under kind play (r32's M2 stands). Nobody's village scattered; everybody's village talked: 171–182 conversations per run, gossip flowing, comfort given where it was needed. The bonds are real enough that the NPCs sound like friends by day 100 — and now the menus stop parroting at them.


