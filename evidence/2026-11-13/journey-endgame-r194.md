# Journey endgame r194 — RUN NOTE (Lane B, leg 4)

## Adoption

- Original run TIMED OUT at 1h (lock `playtest-loop-2.lock`, run_id
  `journey2-4-20261113-1655`). The measurement chain kept running detached
  (PID 109362) and was ADOPTED, not restarted: chain completed
  2026-11-13T18:24:59Z with all six passes (A-live, A-frozen, B, C, C-wide,
  dark) done.
- Registration hit the 16:59:51Z single-cycle write flap (first register
  attempt failed on file writes + index reset); manual probes OK ~17:01Z;
  second register succeeded ~17:05Z (prereg).
- Substrate: master `48ed1ffd7` exactly. Master moved during the run (r85
  adoption landing `c9f78c12b`, then sim-steeple-a `25368315b`) — rebase at
  closeout onto the explicit current master SHA.
- Instruments committed `0e4a6426e` (prereg + probe/analyzer/dark-probe +
  proof tests; COMPETENT_PIN=r127 support). No src/js change in this run.
- Passes are byte-stable: pass B per-seed flat summaries are identical to
  pass A on all 5 matched seeds (sat/alive/ladder/w5/uw/peakVets), as
  designed — only the capstone/buy-out leg differs.

## Prereg (binding)

`evidence/2026-11-13/journey-endgame-r194-prereg.md` (477 lines). Seeds
89701–89705 matched reuse (89704 forcedrift experimental). Env base:
FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1
RELAYGREY=1. Passes: A-live (CAPSTONE/Buyout unset), A-frozen
(COMPETENT_PIN=r127), B (CAPSTONE=1 BUYOUT=1), C (CAPSTONE=1 BUYOUT=1
BUYOUT_EARLY=1), C-wide (fresh 89706–89713, C flags), dark (7 variants).
Q1 is the (l) A/B: does the competent.js delta kill 89704 / collapse
wave-5 facing (r188's loss)? Q2–Q12 as in the prereg.

## Pass A-live — PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO

| seed | sat | alive | ladder | w5 | uw | peakVets | seat | final |
|------|-----|-------|--------|----|----|----------|------|-------|
| 89701 | d110 | 8 | 3/3/58 | 0 | 4 | 1 | lesser | mercy/feared |
| 89702 | d116 | 10 | 3/3/82 | 0 | 4 | 1 | lesser | audience/beloved |
| 89703 | d97 | 8 | 3/3/71 | 0 | 4 | 0 | lesser | audience/beloved |
| 89704 | d90 | 8 | 3/3/70 | 3 | 5 | 2 | lesser | merge/relay-dark |
| 89705 | d115 | 9 | 3/3/79 | 1 | 5 | 3 | lesser | audience/beloved |

Tally: lesser 5/5, full 0/5, lost 0/5. M1 GO 5/5, M2c GO 4/4 (fights ==
distinct opens: 19/19, 12/12, 6/6, 7/7; the adoptedRefs guard held, no
re-entrant double-count), CORPUS-PURITY GO 5/5, M10 gaps named, M13 89705
release snapshot ready=true (vets 2, armed 9, armored 6, tricks 31), M5
89704 crossed+voiced, M21 audit crosscheck 5/5.

## Q1 (l) A/B — VERDICT: (l) EXONERATED

Neither arm reproduces r188's 89704 loss (both arms: alive d90, deedGate
ok, w5:3); both arms reproduce r188's 89702 w5:0 (deedGate never ok). The
bot-policy delta did NOT kill 89704 and did NOT collapse wave-5 facing.

| seed | r188 A | r194 A-live | r194 A-frozen |
|------|--------|-------------|---------------|
| 89701 | sat90 alive9 lad66 w5:1 | sat110 alive8 lad58 w5:0 | sat110 alive8 lad58 w5:0 — IDENTICAL |
| 89702 | sat97 alive7 lad68 w5:0 | sat116 alive10 lad82 w5:0 | sat116 alive10 lad82 w5:0 — IDENTICAL |
| 89703 | sat105 alive5 lad45 w5:0 | sat97 alive8 lad71 w5:0 | sat91 alive4 lad46 w5:0 — DIFFERS |
| 89704 | LOST d77 alive0 lad39 | sat90 alive8 lad70 w5:3 dg ok | sat90 alive8 lad70 w5:3 dg ok — IDENTICAL |
| 89705 | sat90 alive8 lad86 w5:1 | sat115 alive9 lad79 w5:1 | sat90 alive10 lad76 w5:0 — DIFFERS |

Caveat: (l) DOES reshape trajectories on 2/5 seeds (89703, 89705), so it is
not inert — but the headline differences are not (l). Delta list verified:
exactly 12 src/js commits bd29d8bd7..48ed1ffd7, matching prereg (a)–(j) —
no missed delta (unlike r188's prereg, which missed (l)). Resurrection
attribution: a small-perturbation flip on a borderline village (r188 89704
was 1 point short of National at best, 14 deaths) from game deltas
(a)/(b)/(e)/(g) in aggregate; no single delta pinned without a bisection.
SAY-dedup deltas (c)/(d)/(f) excluded by their own survival-identical
proofs; (h) voice is SAY-only with a no-perturbation PASS. The M2c probe
guard is counting-only (adoptedRefs Set consulted by wrapper guard) —
trajectory-neutral by construction, but no formal trajectory-identity proof
was run for it; note as a caveat, not a claim.

Pass A-frozen verdicts: PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO
(identical verdict shape to live; the two differing seeds still sit lesser
on both arms).

## Pass B — PRIMARY-BINDINGS NO-GO on M23-capstone alone

Trajectories pass-A identical. M23: 1 eligible, delivered 0/1, none-ready 0,
**refused-despite-ready 4, pricedFull 0/1 — 89704:none**. Detail: 89704
deedGate first ok d87, end ok=true w5:3 pantry 74577 at Haven; attempts=4,
delivery=none, refused=`veterans-short,veterans-short,veterans-short,over`,
missedSit=d90, ready:military_tribute. M24 VACUOUS (no tribute delivery).
**M24b GO — first time ever exercised: 89704 scholar+1, refusal-recorded.**

Analysis (code read): the split is DOCUMENTED AS DESIGNED, a direct
consequence of Steve's 2026-11-10 ruling — `src/js/ladder.js:489` comment
("That split is the ruling's consequence, not a bug: the bar measures the
village's strength, the payment measures who can leave") and
`src/js/table.js:164` comment (readiness counts scholar toward the BAR,
delivery pays 2 NON-scholar veterans, refuses honestly with
'veterans-short', voiced in app.js:17031 as "Two living wave-4 veterans
must stand for the tribute."). So **M23 NO-GO is a METRIC-RULE artifact,
not a game defect** — M23's rule counts 'veterans-short' refusals as
failures but does not exempt scholar+1 refusals the way it exempts
'none-ready'. Metric revision owed for next run: exempt scholar+1
'veterans-short' refusals (and 'over' refusals — the 4th attempt was
post-game, a probe artifact: the probe should not attempt delivery once
`this.over`). Pass-B transcript for 89704 is only 53 lines (d90→d90
window) and contains NO refusal voicing — the attempts were d87–d89,
pre-window, so voicing in-window is unproven from this corpus (the app.js
panel voicing exists in code).

## Pass C — PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO. TWO full seats.

M23 GO: 2 eligible, delivered 2/2, pricedFull 2/2 — **89704
feast_embassy@d69/FULL d70, 89705 feast_embassy@d72/FULL d73**. M25c GO:
6 eligible early-days, 0 skipped, 31 attempts, 5 bought (89701 d55/pantry
9795, 89702 d28/21242, 89703 d49/8700, 89704 d30/27999, 89705 d30/15696;
89701 d46 attempted-refused first). M24/M24b VACUOUS. Per-seed: 89701 sat
d128 lesser final quiet (ladder 95, bundles 3); 89702 sat d90 lesser final
pledge; 89703 sat d104 lesser final mercy; 89704 sat d90 FULL d70 final
voice (w5max 3, cap feast_embassy, bundles 3); 89705 sat d90 FULL d73
final mercy (w5max 2, cap feast_embassy, bundles 3). Tally: lesser 3/5,
full 2/5, lost 0/5 — best matched panel this leg (r188: full 1/5; r185
pass C full 0/5). Tribute road still never fires (M24 VACUOUS on B and C).

## Pass C-wide (fresh 89706–89713) — WIDE-VERDICT GO (M25c + purity)

M25c GO: 8 eligible early-days, 0 skipped, 66 attempts, 7 bought (89706
d34/10481, 89708 d81/11853 — vs d46 in r188, 89709 d30/9000, 89710
d51/32785, 89711 d35/16625, 89712 d37/11896, 89713 d32/19876; 89707 bought
NONE, as in r188). CORPUS-PURITY GO 8/8. Tally: **lesser 4/8, full 2/8
(89711 d93, 89712 d92), lost 2/8 (89707 scattered, 89713 scattered)** —
best wide result yet (r188: lesser 6/8, full 0/8, lost 2/8). Per-seed:
89706 sat d99 lesser alive 4 ladder 52; 89707 village-lost alive 4 ladder
2/2/35 (Regional stall, same as r188); 89708 sat d104 lesser alive 4
ladder 56; 89709 sat d105 lesser alive 8 ladder 54; 89710 sat d90 lesser
alive 9 ladder 63 uw5 peakVets 2; 89711 sat d93 FULL alive 7 ladder 78
w5:2 peakVets 2; 89712 sat d92 FULL alive 9 ladder 65 w5:2 peakVets 3;
89713 village-lost alive 1 ladder 45.

Full-seat tally this run: **4 full seats** (89704 d70, 89705 d73, 89711
d93, 89712 d92) — all via bought bundle → feast_embassy. The tribute road
delivered 0 times on any leg.

## Starvation watch (Joja price) — ZERO lives on all 12 bought seeds

Pantry trajectories (windowEarly, per-day) checked for every starvation
death on a bought seed:

- **89708 Kobina d87** (bought d81, after 3740): pantry recovered to
  8222–8347 on d83–84, then a SECOND collapse d85–87 (4037→1447→331)
  while the scholar was away from Haven. NOT buy-caused. (Bao Iyer d12 is
  pre-buy.)
- **89713 Maximiliano d61** (bought d32, after 11500): pantry recovered to
  31,975 on d38, death 29 days post-buy in a late fast collapse
  (d58–62: 5658→0). Same seed/day as r188, which judged it NOT buy-caused;
  the r194 trajectory matches. NOT buy-caused.
- **89704 (pass C) Rosa Mendez d60, Omar Farouk d62** (bought d30, after
  19,837): pantry stayed 24k–46k through d56, then collapsed d57–62
  alongside four thirst deaths (Jorge d53, Nikos d54, Henrik d60,
  Roberto d61) — a late water/food collapse, 30 days after the buy.
  NOT buy-caused.
- **89705 (pass C) Leo Martin d59** (bought d30, after 7646): pantry
  recovered to 31k on d44, then sagged 15 days to 0. Death 29 days
  post-buy with a 31k recovery in between. NOT buy-caused.
- 89703 (pass C) bought d49 with pantry after **535** — the thinnest
  matched buy — and nobody starved. 89707 bought none; its loss is a
  Regional stall, not a buy.

## Dark probe — 7 variants, ONLY failure v1a-loss:D2-twist-fired, bit-identical to r171/r178/r182/r185/r188

v1a 26/27, v1b 23/23, v1c 24/24, v2 18/18, v3 25/25, v4 20/20, v5 17/17.
v3 walk-out names Amelia Moon (sitter), not Bill Palmer — Q8 confirmed.
D1–D4/D6 hold.

## People check (pass A, full transcripts read) — all 5 finales read as people

- 89701 (lesser, mercy/feared): audit names the gap honestly ("only 0 of
  2 different wave-5 monsters faced; no capstone deed delivered"); ladder
  line present (National, Fight 2 · Forage 10 · Craft 8 · Talk 14 ·
  Explore 38→24 capped); "Even now the wave-5 bar reads: blood your
  fighters (1 of 2 veterans)" fires correctly; final "Show mercy" text as
  in r188.
- 89702 (lesser, audience/beloved): audit honest; war path names Luis/
  Herald d116, Daniel/Loud-Bane d99; "Even now" fires (1 of 2); distinct
  truth-teller Ivy, children's-game act, Architect Agnese Barbagallo,
  OVERSIGHT coda "The mourners asked you, and you changed the subject."
- 89703 (lesser, audience/beloved): truth-teller Sofia, improv-dies act,
  Architect Salvador Lugo, coda "Someone did the math at the fire, and
  you let the question hang."; "Even now" fires (0 of 2 veterans).
- 89704 (lesser, merge/relay-dark, 53 lines): audit honest; war path
  names Old Big d80, Hassan Big-Eyes d74; relay finale dark and specific
  ("The pods open — not like morning. Like a barracks." / "Poran's
  brother is in that row." / "The village doesn't cheer."); OUTSHONE beat
  (Roberto Feng). Header: "capstone MISSED SIT d90: deed half complete,
  ready kinds: military_tribute".
- 89705 (lesser, audience/beloved): war path Wanjiru/Herald d114,
  Sanne/Big-Eyes d96; truth-teller Lizelle, feast-song act, Architect Leo
  Martin; OVERSIGHT coda with the pods; "0 weeks kept waiting, 2 of Haven
  lost meanwhile."
- BELOVED scaffolding repeats verbatim across seeds (audience chanting,
  "You spend it all...", "Speak for the quiet ones") with per-seed
  variable slots — reads as people; the variables carry the specificity.
- Dialogue deltas (r192 F1–F5, r193 closers, r135 field-ask, (h) wave-5
  shortfall voice): ALL UNEXERCISED in this corpus, same caveat as r188 —
  SAY-window transcripts don't capture conversation turns. **(h) voice: 0
  hits on all 5 pass-A transcripts** — but the voice's condition was NOT
  met: it requires pair held (veterans ≥2) AND armed < 6; at sit, armed
  was 8–10 on all measured seeds (89701 arm 6/armed 8, 89702 10/10, 89703
  7/8, 89705 6/9) and only 89704/89705 ever held a pair. Verdict:
  VACUOUS on pass A, not a failure. The build is proven 123/123 on its
  own band corpus. (Morning briefings themselves are nearly absent from
  these transcripts — 0 "morning briefing" hits; only 2 "🌅" dawn markers
  in 89705.)
- Cures voiced (Florence cured Ananya + Natalie via herbal remedy, "and
  the camp saw it"). No pellet lines on 89701 (no pellet in that village
  — not a finding). "met them and lived" raid-defense beat: 0 hits — r188
  fix holds. Vague synergy line recurs once (89701, "(2/3)").
  Expedition-meat loop: 0 on 89701 (does not recur).
- Corpus-wide: pellet lines 0 on A/A-frozen/B, 4 on C, 17 on C-wide
  (REACTOR boosts firing, +2 rads each — the pellet works and its cost
  shows). Cures voiced 9 on A, 16 on C, 18 on C-wide. "Even now" fires 3
  per matched pass. Table offer never withdraws (0 hits, all passes).

## Pass-C full-seat finales (people check) — both read as earned

- **89704 (relay/dark, final:voice):** "Become its voice" — the merge
  completes ("glorious: every conversation, every wire, every thought
  the machine thinks, with your accent on it. Human things seem small
  from in here. The village grieves you while you're alive"). Audit names
  the (+4 feast-bundle bonus) in the counted points. War path names Rosa
  (d55 Ugly Bastard) and Omar (d47 Big Bastard) — the same two who later
  starve d60/d62 in the collapse. "Gerhard makes a sound that isn't a
  word. Gerhard's son is in that row." The village doesn't cheer.
- **89705 (feared/light, final:mercy):** "Show mercy" with the
  folded-letter beat ("A folded letter was still a folded letter. You
  had learned enough to leave some things closed."), Zoe Adams ascending
  ("relay"), OVERSIGHT coda "You never asked. Not once. ... They are
  still there. Still small. Still waiting for someone to decide they
  matter more than the moment."

## The 159-turn Algorithm fight (89701 d107) — NOT (l), a game-behavior observation

A vFlee fight, party 7, 159 turns, damage 626/1000, closeHp 374. The
source of 89701's 631 V-WAITVARIETY holds (r188 pass-A 89701: total 0;
r188 max fight 13 turns). Transcript read (lines ~1839–2100): a REAL
fight, not a stuck record — Florence SCREAMS (stun), Ava/Ethan Take Aim,
scholar tanks on purpose (data-poisoning trick, Algorithm's counter)
twice, Natalie strikes 10–12/turn, Ethan harries 3–5, scholar uses
Scream/Dead Aim/Unleash Rage/Read Stance (food-powered abilities firing);
Ananya/Ivy/Florence/Ava rotate the 5 hold variants (0 adjacent repeats —
rotation works). The party dealt ~30/round against 1000 HP and fled at
374. **FROZEN ARM REPRODUCES IT EXACTLY: 159 turns, V-WAITVARIETY 631
[126,127,126,126,126], 126 "holds and watches" — so (l) does not cause
it.** Finding to file: one 159-turn fight where the party holds ~150
villager-turns and flees — the win-plan-null / steering-inert shape at
scale (fight-play census: 97% null). On pass C the fight does not recur in
the captured window (89701's trajectory differs, sat d128).

## Village assessment (plain words)

All five matched villages live to sit at the table — nobody loses the
village on pass A this time, which is the first clean matched panel in the
leg. But only two of the five ever face the fifth wave's monsters, and
only one (89704) ever gets the tribute deed ready — and even that one
can't pay it, because the only second veteran is the scholar, and the
table won't take the scholar as payment. The villages are strong enough
to reach the door and strong enough to survive, but the door opens on a
coincidence: two living wave-4 killers at the same time, plus a feast
bundle bought early. When the bundle is bought early (pass C), the door
opens — two full seats on the matched seeds, two more on fresh seeds —
and the villages that buy it pay nothing in lives for it. The wide panel
still loses two of eight villages, both to the same old shape: the pantry
runs dry and the village scatters, or the village stalls at Regional and
never gets moving again. The endgame is reachable and occasionally won;
the tribute road is still the road nobody walks.

## Verdicts — leg 4

- **REACHABLE: yes.** 5/5 matched villages sat (r188: 4/5 sat, 1 lost);
  8/8 wide sat or scattered only after sitting was missed, not before the
  door. The table is reached on every leg.
- **FUN: yes.** Finales read as people with named kills, named dead,
  distinct truth-tellers and architects; the dark relay and the merciful
  feared endings both land; cures, pellet boosts, and the 159-turn
  Algorithm fight show the systems talking to each other.
- **WINNABLE: yes, rarely — and now less rarely.** Full seats 4/13 across
  C + C-wide (2/5 matched, 2/8 wide), all via the bought bundle. Pass A
  (no bundle) still 0/5 full. The tribute road delivered 0/13. The
  bundle is the win path; the tribute road is the road nobody walks.

## Telemetry — QUIET, baseline NOT rolled

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/endgame.json
--current 'evidence/2026-11-13/perseed-endgame-r194/*.json'
--metrics veterans.unlockedWave,won,peakLivingVeterans` →
"quiet (5 files, 3 metrics, no large deviations)". Pass-A sums: uw 22 (=
baseline 22), won 5 (baseline 4), peakVet 7 (baseline 8). Differences are
±1, same regime. The r188 baseline stands; the prereg says pass-A-live
compares against the r188 baseline and pass-A-frozen compares against the
r185 panel descriptively, NOT the baseline. Decision: HOLD the baseline;
re-seed only if a later panel moves the sums by more than this.

## Metric review

- **M23-capstone (REVISE):** exempt scholar+1 'veterans-short' refusals
  and 'over' refusals from the failure count. The 89704 shape (bar ready,
  delivery refused) is the ruling's consequence, not a defect; M24b is
  the correct verdict for that shape. M24b GO on its first-ever firing —
  keep M24b as the metric for scholar+1 villages.
- **M2c adoptedRefs (HOLD):** the guard held on 4/4 seeds; keep the
  re-scope (fights == distinct opens) as the r188 closure.
- **CORPUS-PURITY (HOLD):** GO 5/5 matched, 8/8 wide; keep as the guard
  against another r188-style contamination.
- **M25c buyout-early (HOLD):** GO on matched and wide; keep.
- **§BLANK (fullseat-diag ladder decomposition) — OUT OF SCOPE, documented.**
  `scripts/fullseat-analyze-20261031.js` BARS (line 19) is deed-only; the
  fullseat probes (`probe-fullseat-20261021.js`,
  `fullseat-97339-probe-20261103.js`) capture neither ladder peak nor
  capstone, so the fix needs new probe-side capture wiring (ladder peak +
  capstone in the fullseat probes) + a fresh census run to prove it +
  a DET proof. The endgame analyzer's M10 already does the ladder-aware
  decomposition (this run: gaps named with capstone + w5), so the stale
  layer is confined to the sim-fullseat-a census diag. Not forced.
- **M2c probe-guard caveat:** counting-only by construction, no formal
  trajectory-identity proof run; keep as caveat, not claim.

## Findings filed / blanks

1. **r188 corpus contamination (FILED in sim-findings.md):**
   `evidence/2026-11-12/perseed-endgame-r188/endgame-r188-89701.json` (+
   transcript) is PASS-C data, not pass A: retained satDay 124 vs pass-A
   log sat 90; greedy waits 23, seatDay 124, bundles=3. Other 4 seeds
   match pass A. Mechanism: the r188 M2c debug probe ran "89705 pass A
   flags; 89701 pass C flags" in smoke mode with default EVIDDIR pointing
   at the pass-A dir — 89705 overwritten with identical pass-A data
   (invisible), 89701 overwritten with pass-C data. r188's analyzer
   verdicts stand (computed at chain time on true files); only the
   retained file is wrong. Do NOT re-run any probe writing into a retained
   pass dir; always point diagnostics at a `-diag-<name>` dir (per the
   probe header's R130 OUTDIR FIX rule). Also explains why r188's
   V-WAITVARIETY 89701 total=0 (true pass-A file) vs the earlier 10-holds
   count (contaminated file).
2. **M23 metric revision** (above) — no game fix owed; metric-only.
3. **159-turn Algorithm fight** (above) — game-behavior observation,
   filed in this note; not a defect per se, but the win-plan-null /
   steering-inert shape at scale. No fix attempted this run (COMBAT-PLAY
   GATE: no tuning until play improves; the fight-play census owns it).
4. **Pass-B transcript window too narrow for voicing** — the 89704
   refusal voicing (d87–d89) falls outside the d90→d90 captured window.
   Probe-side: widen the transcript window for capstone-refusal seeds, or
   capture refusal voicing at attempt time. Owed, not forced.
5. **§BLANK** — documented out of scope (above).

## Evidence

- Prereg: `evidence/2026-11-13/journey-endgame-r194-prereg.md`
- Chain log: `evidence/2026-11-13/journey-endgame-r194-chain.log`
- Per-pass logs: `journey-endgame-r194-{a,a-frozen,b,c,c-wide,dark}.{log,err}`,
  `journey-endgame-r194-{a,a-frozen,b,c,c-wide}-analyzer.{log,err}`
- Per-seed corpora: `perseed-endgame-r194/` (A-live),
  `perseed-endgame-r194-frozen/`, `perseed-endgame-r194-b/`,
  `perseed-endgame-r194-c/`, `perseed-endgame-r194-cwide/`,
  `perseed-endgame-r194-dark/`
- Instruments: `scripts/probe-endgame-r194-20261113.js`,
  `scripts/analyze-endgame-r194-20261113.js`,
  `scripts/test-competent-pin-r194.js`,
  `scripts/test-corpus-purity-r194.js`,
  `scripts/test-m2c-adopted-refs-r194.js`,
  `scripts/dark-endgame-r194-20261113.js` (names per the committed tree)

## Landing

- Evidence/tooling commit: (to fill)
- Rebase base: master (to fill — read at rebase time)
- Proof re-run after rebase: (to fill)
- Gate: (to fill)
- Merge commit: (to fill)
- Rotation-b: 4 → 5
- Lock `playtest-loop-2.lock` (run_id journey2-4-20261113-1655): deleted at closeout
