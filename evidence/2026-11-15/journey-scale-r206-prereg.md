# journey-scale r206 — PRE-REGISTER (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-scale-r206-20261115T0417Z` (lock run_id
`oversight-playtest-loop-2026-11-15T04:17Z`).
**Run:** scheduled Sat 2026-11-14 21:45 CST (2026-11-15 03:45 UTC); lock
created 04:17:30Z.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `2a0c9b0d6` (ove48-mech evidence) at worktree
registration.
**Pre-flight:** main tree clean (`git status --short` empty, 0 files),
disk 37%, lock absent (no stale-lock recovery). `git pull`: already up
to date at 2a0c9b0d6. Reap: SKIP — registry lock held by a live sibling
registration (consecutive skips: 1; holder legitimate, not stuck; no
cleanup this run). Worktree `journey-scale` registered 04:18:10Z
(registry run_id 2026-11-15T04:18:10+00:00); heartbeat landed
04:24:58Z after two write-flap refusals (the known host write flap —
EPERM on REGISTRY.json writes, 04:20–04:24Z; flap-watch probe confirms
the window). hbloop
`~/workspace/worktrees/journey-scale-hbloop-r206.sh` (10-min cadence)
launched 04:25Z.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run — it measures the on-ramp and reads people; any fix it
finds is dialogue/narration-scoped, or it is documented, not built.
**DELIVER OVER MEASURE (2026-11-01):** this run measures the national
on-ramp on current master after a day of landings (see below). It does not
re-prove the veteran census or the survival collapse (the bisect owns
that) — but the panel's wall reading IS a fresh-band check on the collapse
shape, and a moved wall would be the run's headline.

## Standing context (read before scoring)

- **r204 scale (landed 2026-11-14 via adoption r205, a998413cf):**
  national 0/4 on fresh seeds 135401–135404; 1/4 survived (down from
  r197's 3/4); lived-days 419 vs r197 band 526 (-20.3%, HOLD, near the
  lower edge 395); lesser seat priced 4/4; **wave-5 fights 5 on 2/4
  seeds, 0 kills** (door open, nothing died); tribute readied twice
  (135401 d90, 135403 d72) and delivered never — **0/51 + 0/27 attempts,
  all refused veterans-short** (the M23 shape: readiness counts the
  scholar as a veteran, delivery needs 2 non-scholar veterans; payable
  held at 1 for 51 and 27 straight days). Nod-loop re-proven (worst 3x,
  thin-out visible). Telemetry: 2 LOUD lines vs the old baseline
  (fightsTotal -69%, w4 -75%); investigated (band composition +
  collapse shape, no combat code changed); **baseline ROLLED to 3-band
  means 241/178/468** (backup scale.json.20261114-pre-r204.bak); re-check:
  w4 -60% still LOUD (marginal, 0.1 over the bar) — the honest residual,
  this band judges the center.
- **What changed in the game since r204's base (dcae77800 → 2a0c9b0d6):**
  four src/js landings, none touching combat initiation or the
  hierarchy/scale systems:
  - journey-establishment r139 (93f88819c): **spotter wiring** — forage
    grants 1 spotter XP/day + bumpPlantFamiliarity grants 1/day +
    spotter ≥1 drops recognition threshold by 1 (floor 1), never field
    identification. Forage/knowledge-scoped; the scale leg's food
    economy may read it in the census, not the question.
  - Lane B social life r206 (365b17d7d): **invite-small double-serve
    fix** (betrayal.js + partyTactics.js) — a conversation-invite
    double-serve. Dialogue-scoped; the people check may read it.
  - Reunion arena balance (e17c08d78 + ee8292e0b, Steve-ordered
    2026-11-14): arena-only Reunion at 40% HP / 60% damage, mirror cap
    1; wild Reunion untouched. Arena-only — the wild wave-5 door this
    leg measures is untouched.
  - sim-holdbuild-b: the hold build was BUILT then REVERTED on master
    (aea3cb311) — net zero in game code; the upkeep-tending lever is
    killed, the evidence stays.
  - The rest of the delta is evidence/scripts-only (ove48-mech DIAG
    instruments + corpora, transplant8c evidence, succpolity g1join fix
    evidence, proofrefresh-b19 regenerated neutral panel). OVE-48 mech
    DIAG verdicts: (a) kind GO 76.8%, (b) naming NO-GO 18.7%,
    (c) causal PROVEN-NEGATIVE — and **revert-vs-keep is now DECIDED:
    KEEP** (Nov 14 0215Z, recorded in MEMORY.md during this run: causal
    path proven negative, kcal +0.014% pantry flow, no state divergence
    before first death; 0/8 reads as seed-band artifact / RNG re-roll).
    OVE-52 is also a carrier. Next on that axis: matched-band 8c rerun,
    family 6b + narrowed 7b, family 2b AMBIGUOUS — the flesh-out loop's
    job, NOT this run's.
- **The wall (tracker, scale-onramp — converging, NOT converged):** on
  every judged corpus this week, survived 1–2/8, regional 8/8, national
  0/8, table 0/8, wins 0/8, wave-5 1–2/8, median ~134–139d. The collapse
  cause is localized to merge e4dbe581b (CULPRIT_MERGE); narrowed 15A–15F
  arms are the tracker's next blanks, NOT this run's job. This run plays
  the scheduled scale leg; its panel is a fresh-band wall reading, not a
  bisect step.
- **Scale canon (docs/SCALE.md):** national is a POLITY — one primary with
  ≥3 SEASONED subordinates (30+ days old, trust 40+), or BELONG (valued
  subordinate in a ≥4-village realm), COVENANT (≥3 seasoned peer links),
  TRADE (≥3 seasoned trade links), CONQUEST, or REFUSE. Ladder stage 3
  (National Standing, points) is NOT national (polity rank) — the r134
  panel reached stage 3 on points while staying regional. Q1 measures the
  polity (natgate `nat=true`), with ladder stage as the secondary read.
- **Carried gaps (not this run's to build):** daily-play chooser never
  takes invites (verbal or mimed) — lane decision owed; hunger scatter
  now 2 bands running (135304 r197, 135404 r204); sickness-without-a-
  healer collapse (135402, healerDays 0 — the medicine levers are the
  standing answer); "left someone behind" line-pool reuse (fourth band
  running); raise-talk closers formulaic ("All right — let's ask them."
  echo); Elif flag-emoji opener inconsistency; "And... scene. Good
  talk." stage-direction closer; culpritbisect narrowed 15A–15F (tracker
  blanks — bisect steps, not a journey leg).

## The blank to fill this run (r194 follow-up, owed)

**M23 tribute-payability metric revision.** Since r194 the tribute
"ready" signal has overstated deliverability: readiness counts the
scholar as a veteran (Steve RULED 2026-11-10), so scholar + 1 villager
veteran reads ready, while delivery (`src/js/table.js:200`) needs 2
non-scholar veterans and honestly refuses until a second payable
veteran stands. r204 made the consequence concrete: payable=1 held for
51 and 27 straight days, 0/51 + 0/27 deliveries. The revision is an
INSTRUMENT change, not a game change: the analyzer gains a tribute
section that reports, per seed, ready day, attempts, deliveries, reason
tally, and the payable-veteran count at ready — and names the state
READY-UNPAYABLE when a tribute is ready for the whole remaining run
with 0 deliveries and payable < 2. The ready signal stays as the engine
reports it; the section adds the payability read beside it. Proof cases
(15)–(17) cover READY-UNPAYABLE, DELIVERED, and NEVER-READY before the
panel runs. No fail change: the section is measurement, like Q1.

## Q1 (PRIMARY) — NATIONAL ON-RAMP: measure it on current master

**Question:** in a competent 140d panel on fresh seeds, how many villages
reach national (a polity lives, `nat=true` in the natgate file), and when they
don't, what is the single binding constraint per seed — the closest road
(LEAD/COVENANT/TRADE seasoned counts), what it lacks, the pending shape,
the belong good flag, or collapse before the national window?

**Interesting-finding rule (binding):** the run is informative iff EITHER
≥1/4 seeds reach national (GO — the on-ramp is open on current master, the
wall moved) OR 0/4 AND the analyzer names a per-seed blocker for every
seed (NO-GO on the wall, blocker named — the finding IS the blocker). 0/4
with no diagnosable constraint (e.g. all seeds die before d60 with no links
at all) = INCOMPLETE — document and move on, do not re-score the panel
against a friendlier metric.

**What would overturn the picture:** ≥2/4 national, or a full seat, or a
seed whose blocker is a named defect with a narrow fix (that becomes the
run's blank — fix + proof, or document in sim-findings.md).

## Q2 — REGRESSION GUARDS (fail the run if any breaches)

- r134 spoken-raise: 0 not-offered-spoken raise talks AND ≥1 properly
  answered (the analyzer's classifier; exit 2 if the band has no raise
  talks at all — INCOMPLETE, not a verdict).
- Vetbar: 0 days where readiness veterans != ladder veterans per wave 4
  and wave 5.
- Trap-line: 0 defect sittings (mime shown, no nv:answer at turn 0).
- Betrayal sibling: 0 turn-0 betrayal:accept offers without the invite
  label in the sitting's opening THEM lines.
- Nod-loop (r132 re-proof): 0 sittings with a streak of ≥4 consecutive
  identical nv: react gestures (nod/smile/pointself, excluding
  nv:listen, which progresses); max streak reported per sitting.
- Lived-days within ±25% of the **r204 band's 419** (re-based from r197's
  526 — most recent same-instrument band; guardrail 314–524); no
  alive/dead flip without an attributed cause.
- Lesser seat priced ≥3/4.

## Q3 — BARAKA / DAILY-PLAY MIME (read-only, carried)

Count in the panel's say-captures: daily-play mimes shown vs
nv:accept/betrayal:accept taken in daily play (capture lower bound + betray
watch off-day events). Expected 0 daily accepts — the gap, confirmed.
Record the lane decision owed; no build claimed. Baraka re-check: any
comm-'none' villager with a staged raise in the band, and what happened.

## Q4 — PEOPLE CHECK (d90/d120 + nonverbal + raise talks, in full)

Read in full: the d90/d120 transcripts AND the explicit nonverbal sittings
AND all raise talks. Bar: senseless 0 for the raise-answer class (a spoken
raise answered with the words that fit what was said; no English YOU lines
in a no-words sitting; no nod loops past the answer). NEW surfaces this
run: the r206 invite-small double-serve fix (Lane B) — any raise talk
that double-serves the same invite line is a live defect, read in full.
The r132 nod-loop thinning and the r201 favor-want settle gate are
re-checked, not re-litigated as defects.

## Q5 — CENSUS (plain words)

Per-seed: who lived/died, what they knew (monster meat, places, links),
what was missing. Standard scale census fields (ladder stage, lesser/full
seat, national, deaths by cause, books close). Spotter read: any villager
reaching spotter skill 1 in the band (the r139 wiring's first live read
on the scale leg — a census line, not a bar).

## Panel

- **Seeds: FRESH 135501–135504** (freshness verified below). One seed per
  process (r183 adoption: driver multi-seed state leak).
- **Horizon:** DAYCAP=140, death-aware stop (+10d tail max).
- **Policy:** `scalecourt-traderoad-r113-linkraise-sit` (same as
  r131/r132/r133/r134/r195/r196/r197/r204) — NO chooser change in this run (Q3 is read-only).
- **Driver:** `scripts/journey-scale-r206-20261115.js` (r204 driver cloned:
  labels/EVIDIR/seed list only; r204 picker, full-opening-transcript log,
  nonverbal sitting on CONVO_DAYS, vetbar recorder kept).
- **Analyzer:** `scripts/analyze-journey-scale-r206-20261115.js` (r204
  analyzer cloned + lived-days control re-based to the r204 band's 419 +
  NEW tribute-payability section: ready day, attempts, deliveries, reason
  tally, payable at ready, READY-UNPAYABLE / DELIVERED / NEVER-READY).
- **Proof:** `scripts/test-journey-scale-r206-analyzer-20261115.js` — the
  real analyzer on synthetic corpora (r204's 37 assertions + new tribute
  cases: (15) ready d90, 51 attempts all veterans-short, payable=1 ->
  READY-UNPAYABLE; (16) delivered d96, 1/1 ok -> DELIVERED; (17) never
  ready -> NEVER-READY). Green before the panel runs.
- **Pilot:** seed 135501 first. Pilot gates: crash, census errors > 0,
  0 census rows, reconciliation residual != 0, teleOnly > 0,
  0 trustset rows by d60, 0 national-gate rows, or no vetbar rows by
  d60 → STOP and diagnose (INCOMPLETE, not a verdict).

## Seed freshness

135501–135504: 0 hits naming the band in any dated prereg
(`grep -rlE '13550[1-4]' evidence/ --include='*prereg*'`, run
2026-11-15 in the worktree). No forbidden-band or contaminated-band
list exists in evidence/ naming this band. Fresh band confirmed before
the panel runs. No game fixture seed is needed this run (the analyzer
proof uses synthetic corpora, no staged game).

## Metric review (to fill at closeout)

- Q1: the interesting-finding rule as written (national count + per-seed
  blocker).
- Q2: the guards as written (lived-days control re-based r197 526 → r204
  419 — the re-base itself is this run's metric change, recorded here
  before the panel ran; nod-loop guard carried).
- Q3/Q4/Q5: as written.
- Tribute: NEW payability section — the M23 revision owed since r194,
  added here before the panel ran (instrument change, not a game change).
- Telemetry: scale.json baseline is the r204 3-band roll (241/178/468);
  the w4 residual LOUD -60% stands as band noise + collapse shape until
  this band judges the center — evaluate after this panel.

## CLOSEOUT — run 2026-11-15T0417Z (this run)

**Panel (seeds 135501–135504, DAYCAP=140):** 135501 over d137 (0/0,
extinct, the wild 12, lesser d72); 135502 over d136 (0/0, extinct, the
wild 12, 191 fights / 167 herald, tribute ready d115 undelivered 0/9);
135503 alive d141 (9/9, lesser d46, tribute DELIVERED d108, wave-5
spoiler killed d122); 135504 alive d141 (8/8, lesser d48, tribute ready
d120 undelivered 0/1, wave-5 editor killed d129). Lived-days 555 vs
r204 band 419 (+32.5%, BREACH — see run note §Metric review). Lesser
4/4. Books close, unattributed 0, teleOnly 0. Wave-5 fights 5, kills 2.

**Q1 — NO-GO on the wall, blocker named per seed (informative):** national
0/4. 135501: COLLAPSE (the wild, d136 six-death day). 135502: COLLAPSE
(the wild + herald flood). 135503: LEAD 0/3 seasoned (2 active).
135504: LEAD 0/3 seasoned (1 active), belong not good (trust 20,
arrears 67,500). Wall stands on a fresh band; survival rose to 2/4.

**Q2 — one BREACH (lived-days), the rest GO/HOLD:** raise 8 talks
(6 answered, 1 counter, 0 defects); vetbar 0 disagreements; trap HOLD
(2 mimes answered); betrayal HOLD (1 turn-0 offer, labeled); nod-loop
HOLD (worst 3x in 7/7 -nv sittings — the r132 thin-out visible);
lived-days BREACH (+32.5%, long side — NO-GO per §14, not re-scored);
lesser 4/4.

**Q3 — RECORDED:** daily-play mimes 46, daily accepts proven 0; five
comm-'none' villagers (Yuki, Isaac, Stepan, Tashi, Sophie); Isaac +
Sophie mimes answered in driver sittings. Lane decision still owed.

**Q4 — PASS:** all 15 transcripts + all 8 raise talks read in full.
Senseless 0. Strongest: Ursula the mortician, Gina on leadership,
Mateo on having hurt someone, Salvador's cache + taken kin. New
surfaces: no invite double-serve (Lane B r206 fix reads clean);
driver picker has no secret:* handling (Omar d120 walk-away — fix
proposed for the next run); just_company filler loop (Ray d90);
flag-emoji openers now systematic in all -nv sittings.

**Q5 — census in the run note** (`evidence/2026-11-15/journey-scale-r206.md`).
Spotter skill NOT MEASURABLE from this corpus (no foodXp snapshot;
owed to the next run's driver).

**The blank filled:** M23 tribute-payability metric revision LANDED as
an instrument (analyzer section + proof cases 15–17; all three states
exercised this band: READY-UNPAYABLE ×2, DELIVERED ×1, NEVER-READY
×1). Plus the herald finding characterized: wave-4 variety collapses
to herald on the fighting seeds (167 + 96 fights, 1 kill each),
nightly gorge tax, carried as a spawn/encounter question.

**Telemetry:** 2 LOUD lines (fightsTotal +66%, w4 +86%); investigated
(band composition + herald flood, no combat code changed);
**baseline NOT rolled** (4-band sequence shows the metric is
noise-dominated; rolling would chase noise). maxGameDay QUIET.

**Verdicts:** reachable YES, fun YES, winnable NO (this leg).

**Gate / landing:** see the run note's Gate/landing section (filled at
closeout). Full record: `evidence/2026-11-15/journey-scale-r206.md`.
Corpus: `hidden_files/evidence/2026-11-15/journey-scale-r206-*` (goal
store).
