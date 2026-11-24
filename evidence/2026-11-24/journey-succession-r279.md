# Journey succession r279 — Lane B, leg 7 (succession) — RUN NOTE

**ADOPTION.** This note is written by the adoption run
(`playtest-loop-2-2026-11-24T07:58:50Z`), finishing the dead 06:02Z
occurrence. That run played the full panel and ran the analyzer, then
died in the VM restart (~07:25Z) before closeout: no run note, no
proof re-runs, no gate, no commit. Every number below was re-read
from the recovered files (panel log, analyzer, per-seed JSONs,
transcripts); the proofs and gate are this adoption's own work on the
rebased tip. Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout and verifies the file reads 4 afterwards.

Panel base: master `bf7444a49` at registration (dead run). Panel ran
06:38–06:44Z, all 26 seeds exit 0, analyzer exit 0. Adoption
re-based the branch onto master `612872ae2` (journey-scale r279,
landed while the dead run was down) — see Adoption notes for the
flap W26 interruption during the first ff attempt. Proofs + gate run
on `612872ae2`.

Prereg: `evidence/2026-11-24/journey-succession-r279-prereg.md`
(committed with this note; the dead run wrote it before any play).
Driver `scripts/journey-succession-r279-20261124.js`, analyzer
`scripts/analyze-journey-succession-r279-20261124.js`, runner
`scripts/run-journey-succession-r279-panel.sh` (r268 forks + WIT-SIT
v4: phase-A scan restored, single-fresh gate removed, language
filter, skip ledger, unscanned list). Seeds: FRESH BAND 34542–34565
(24 seeds; EARLY_KILL_DAY=40, POST_DAYS=70) + positive control
34403 + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25).

## Verdicts (frozen bars, §14)

| Bar | Verdict | Detail |
|---|---|---|
| DRY CENSUS | **FAIL** | 1 dry hit, other-class (34547 d35 Benoit — see below); honest fallbacks 35; null silences 0 |
| MOURN-TEMPLATE | **FAIL** | 2 village-window repeats (see below); same-speaker 0; double-stage exemptions 0 |
| MOURN-EXHAUST | PASS | 0 exhausted-line servings in mourning sittings (0 total) |
| SUPPLY | SUPPLY-PRESENT | 3 witnessed person corpses, all combat (34545 Wyatt, 34551 Carlos, 34556 Mandla) |
| MONSTER-WITNESS | PASS | monster corpses with witnesses 873/873 = 100% (bar ≥90%) |
| STAGE | PASS | 5 wit-sits fired on supplied seeds with living witness speakers, inside the fresh window |
| REL-WIT | **INSUFFICIENT-DATA** | 1 single-fresh draw (floor 3); 0 witness-variant servings |
| REL-BOND | PASS | 13/13 servings where close, 0 where not |
| REL-VET | PASS | 20/20 servings where both veteran, 0 where not; 79 opener draws in both-veteran convos |
| MANTLE-FINE | PASS | 90 deaths observed, 0 flippedImmediate=false, 0 fineLatency≥2, 0 unexplained fineLatency==1, 0 day-skips |
| SKIP-LEDGER (new, binding) | PASS | every witnessed corpse accounted for: 5 staged + 2 !fired (both no-living-witness); 0 unscanned, 0 unexplained |
| CAP-NC | PASS | bonded-by-deadline 8/8 eligible seeds; bondedEver 16/17 probe-opened seeds; selfReqDayEntries 0 |
| HABIT-COLLISION | PASS | 1 habit-for serving, 0 same-seed collisions |
| CONTROLS (smoke) | **MOVED — BASE DRIFT, RE-BASELINED** | relEnd 48→50, NPC-NPC 13→15; handoff, relPost 33, relD14 47, mourning 0, selfId grace_obi, machinery all match |
| WILD CHECK | PASS | 7 carried proofs re-run GREEN on 612872ae2; DRY wild check deflect_q 0, dlg:doubt 0, other-class 1 (the Benoit hit, filed); no F4a/F4b/F4c/F5/F6/C3c/F2 regression observed in the transcripts read |
| C3d WILD HOLD | PASS | 0 erasures in the transcripts read; 269 recap lines all name live threads |
| F5 WILD EXERCISE (descriptive) | 0 firings | 22 "settled" lines: 13 wind-down, 1 "that one's settled", 8 ambush/murder-case "Nobody's settled it"; none settled-favor; rolling window r233+r245+r248+r254+r258+r263+r266+r267+r268+r279 stays 0 |
| POSITIVE CONTROL (descriptive) | 0 witnessed corpses | 34403 yields no witnessed person corpse — replay divergence (proven r262), NOT instrument failure |

## The two FAILs, investigated (not re-scored)

### DRY CENSUS — 1 other-class hit: a drift note that dried

Seed 34547, day 35, Benoit, pick=null, key `"Benoit has an edge
today — something curdled."` The player was served `"...Sorry, lost
my train of thought."` instead of the drift note.

Mechanism, verified in code and in the seed JSON (sayTrace entry:
preSelf=false, preRun=true, fellBack=true): `convoDriftNote(vid)`
returned the bitterness stage-direction beat (Benoit's drift crossed
≥2), and the caller serves it through `sayLine(vid, dn)`
(conversation.js:6493). The exact line was already in the RUN ledger
— Benoit had said the same sentence in an earlier sitting — so
sayLine's no-repeat machinery run-blocked it and substituted the
honest dry line. A stage direction got replaced by spoken
meta-speech: the player sees Benoit say he lost his train of
thought, apropos of nothing, where the game meant to show him with
an edge.

This is NOT a stage-2 indictment (stage 2 is pool-exhaustion retry;
this is a repeat-block on a stage-direction beat) and NOT a mourning
follow-up (so it does not promote the filed topic2Beat fix). It is
the analyzer's `other:` new surface, failing the bar as written.
Filed as the next fix item: drift-note beats should not be served
through the repeat-ledgered sayLine path — they are stage directions,
already stamped at most once per day per villager, and when the
ledger blocks one the fallback must be silence/suppression, never a
spoken dry line. The five drift sentences are shared across all
villagers (name-swapped), so this will recur whenever a villager's
drift stays crossed across sittings.

### MOURN-TEMPLATE — 2 verbatim repeats, five days apart

Both pairs are the same sentence served word-for-word by two
different villagers about the same dead person, at d+3 and d+8
(difference exactly 5, the LINE_FRESH_DAYS window edge):

- 34544, opener:owed-favor, Gabriela — Tashi d+3: "Gabriela owed me
  a favor. I keep thinking about collecting. Stupid." / Javier d+8:
  identical.
- 34549, opener:burnt-piece, Claire — Tebogo d+3: "Claire always
  took the burnt piece. Said someone had to. I take it now." /
  Enrique d+8: identical.

Verified against the full transcripts (read in full, quoted above).
Neither pair is a double-stage exemption: the exemption covers only
the two sittings of one double-staged death (consecutive days,
different speakers); these are independent wild sittings, and
double-staged deaths on this panel number 0. The village-fresh
steering did not engage for these shapes.

Note the schedule geometry: the mourning sittings run at d+3, d+7/8,
d+14… — the d+3→d+8 gap is exactly the window's edge, so any
same-shape repeat across those two sittings fires the bar. That does
not soften the verdict (the bar is 0 and the lines read as the
village repeating itself), but it says where the fix lives: the
second sitting must steer away from the first sitting's shape, or
the shape pool per dead person must be wider than the sitting
cadence. Filed for the next run; the bar stands at 0.

## REL-WIT: v4 restored the sittings; the draw count still misses

The r268 filing asked for three things; v4 delivered all three, and
the panel shows the result:

- Sittings back to r267 levels: **5 fired** (r268 v3: 1; r267 v2: 5).
  Single-fresh fired: **3** (r268: 1; r267: 3).
- Language filter: **0 nonverbal-despite-filter sittings**. No fired
  sitting's speaker lacked a shared language. (0 no-shared-language
  skips were recorded either — the filter never had to bite; the
  r268 Yanina case did not recur.)
- Skip ledger: 2 !fired, both `no-living-witness` (Wyatt 34545,
  Carlos 34551); 0 `cap` skips. Unscanned: 0 unexplained — every
  witnessed corpse is staged, skip-recorded, or explained.

But the REL-WIT draw floor is still missed: **1 draw** (floor 3).
A draw needs fired && freshPersonN==1 && latelyWitnessed, and only
one sitting met all three — 34564, Diego on Wei (ambush, witnessed
by Diego; his "lately" event named Wei and the sitting named the
staged dead). The other two single-fresh sittings (34546 Elif on A,
34547 Arlo on Galym) fired but their lately events did not name the
staged dead (latelyDead=none). And on the one draw, the witness
variant still never served: Diego's conversation mourned Wei with
the generic shapes ("Since Wei died... I keep expecting to see Wei
at the fire"; "I keep turning over the last thing Wei said to me")
but never said he was there when it happened.

So the bottleneck moved. v4 fixed the staging supply; the scarce
step is now the conversation's lately-event naming the dead, and
then the witness-variant line itself firing. REL-WIT returns
INSUFFICIENT-DATA for the third straight panel (r267: 3 draws, 1
serving; r268: 1 draw, 0 servings; r279: 1 draw, 0 servings) — the
instrument question is answered (staging works), the game question
(will a witness ever say "I saw it"?) is still unmeasured. Next run's
staging design must address the lately-naming step, not the sitting
supply.

## Village assessment (plain words)

Twenty-six villages, each played 110 days with the bearer killed on
day 40 (or earlier, where death came organically). The mantle passed
**90 times** and never stuck: every death found a living successor
the same day, including chains seven deep — seed 34545 went
Shanice → Worlasi → Aki → Saul → Nikos → Imani → Daniel → Elijah
in 70 days, and still had six people standing at the end. The
villages absorb loss and keep going: bonds grew after every death
(relEnd beats relPost on nearly every seed), 58 newcomers arrived
across the panel, villagers formed 88 new bonds with each other.

One village broke. Seed 34564 lost Ethel on day 41 and then bled:
Vivian → Nikolai → Hassan → Kurt → Elijah → David, fifteen dead in
41 post days, one person left alive when the run stopped — the only
village that did not reach day 110. Every other village ended with
5–11 people alive. The dead are mourned in their own words, mostly:
165 mourning servings, bond and veteran variants firing only where
the relationship held (13/13, 20/20). The two cracks are the two
FAILs above — one villager losing his train of thought where a mood
should have shown, and two sentences the whole village repeated
verbatim.

## People check (transcripts read in full)

Six full transcripts: the two MOURN-TEMPLATE pairs (Tashi/Javier on
Gabriela, Tebogo/Enrique on Claire), the judged witness sitting
(Diego on Wei, 34564), and a new-bearer mourning sitting (Elif on
Isaac, 34542). Plus the recap census (269 recap lines) and the
"settled" census (22 lines).

The conversations have wants, engage or deflect them, and end with
something resolved or owed. Diego opens with a real want (find
someone for the pantry run — "we're choosing who eats") and only
then, asked what's on his mind, grieves Wei. Elif teaches, asks to
join the party, and grieves Isaac in her own words. The mourning
lines land in context. The defects are the ones the bars caught: the
verbatim repeats read as the village sharing one mouth, and Diego
— who watched Wei die — never gets to say he was there.

## Controls — smoke moved: base drift, re-baselined

Smoke 33998 vs the r268 snapshot (handoff d6 Heinrich → Grace,
relPost bonds 33, relD14 47, relEnd 48, mourning servings 0,
NPC-NPC bonds 13, selfId grace_obi):

- handoff d6 Heinrich → Grace ✓
- relPost bonds 33 ✓
- relD14 47 ✓
- relEnd **50** (was 48)
- mourning servings 0 ✓
- NPC-NPC bonds **15** (was 13)
- selfId grace_obi ✓
- machinery: pick rank 1 ✓, funeral INCALL true ✓, selfReq 0 on
  every seed ✓ (OPP totals: selfReqDayEntries total 0)

Investigated as staging-vs-drift, per the prereg (not assumed): the
smoke seed has exactly 1 person corpse (cause: the expedition,
witnessed 0) and the r279 witSits list for 33998 is empty — no
witnessed death, so no wit-sit could fire on it under v2, v3, or v4
staging. The v4 staging change cannot explain the move. The base
moved between r268's base and this run's base (`bf7444a49`, which
includes the departname naming fix and the deepening/crisis/scale
landings, several touching conversation serving). The move is base
drift: +2 bonds by end, +2 NPC-NPC bonds — small, same direction,
no machinery moved. Per the prereg, the bar re-baselines by
measurement: the smoke snapshot is now handoff d6 Heinrich → Grace,
relPost bonds 33, relD14 47, relEnd 50, mourning servings 0,
NPC-NPC bonds 15, selfId grace_obi.

## WILD CHECK

Carried proofs re-run GREEN on the rebased tip `612872ae2` (see
`evidence/2026-11-24/journey-succession-r279-proofs.log`): r262
escalator-cap, r254 multiwit, r232 relationship-mourning, r225 F5
harness (22/22), r258 selfwit, r267 mourning-dry, r268 table-dry
(the stage-2 fix holds). Analyzer DRY wild check: deflect_q 0,
dlg:doubt 0, other-class 1 (the Benoit drift-note hit, filed above).
No F4a/F4b/F4c/F5/F6/C3c/F2 regression observed in the panel
transcripts. C3d: 0 erasures — 269 recap lines all name live
threads, including resumed-thread recaps quoting the unfinished
line. F5 WILD EXERCISE: 0 firings — 22 "settled" lines (13× "Good —
what's been happening / that question / your plan here / whether you
still sing, settled. Feels better said out loud." wind-down; 1×
"Right. Forget it. ... No — that one's settled. I just like saying
it out loud."; 8× "There's still the matter of the ambush/murder of
X. Nobody's settled it." ambush/murder-case, incl. 1× "Nobody's
settled the ambush against me yet."), none settled-favor.
Rolling window r233+r245+r248+r254+r258+r263+r266+r267+r268+r279
stays 0.

## Telemetry

`node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/succession.json --current
'evidence/2026-11-24/journey-succession-r279-tele-*.json' --metrics
deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`
— 2 LOUD lines, both explained, no real bug shown:

- deaths.bearer: baseline 7.6 → current 89 (n=26 files). The panel
  forces a bearer death on day 40 of every seed (EARLY_KILL_DAY=40)
  plus the scripted smoke death; 89 bearer deaths across 26 seeds is
  the forced chain doing its job (r268: 106, r267: 99, r266: 87).
  Per-file mean ≈ 3.42 — BELOW the baseline mean. The LOUD is the
  tool's sum-vs-mean mismatch (unresolved since r229), not drift.
- census.fallen: baseline 14.3 → 171. Same regime — forced chain +
  110-day panel horizon (r268: 179, r267: 193, r266: 175). Per-file
  mean ≈ 6.58 — BELOW the baseline mean.
- census.alive (mean 7.65 vs baseline 3.8), census.integrationStage
  (3.0 = 3.0), week2.deadBearerMentions (4.19 ≈ 4.2): quiet (no LOUD
  lines); the alive mean runs above the unforced baseline because
  forced-chain villages survive to day 110 — regime, same pattern as
  r266/r267/r268.

Per the prereg rule (a forced-chain panel must NOT roll the unforced
baseline forward), **the baseline is NOT rolled**. The LOUD lines are
regime + tool mismatch, not drift.

## Reachable / fun / winnable

This run's variable was an instrument (WIT-SIT v4), not a game
change: no game code changed, no standing, gear, fight, or veteran
count moves. The succession leg itself is reachable and holds up —
the mantle passes 90 times without a hitch, villages survive losing
their leader seven times over, and the mourning conversations read
like people grieving. What is still unproven is the witness story:
three panels running, a villager who watched someone die has never
yet said "I saw it" in the game's own words. The leg is fun to watch
and the village endures; the witness-variant serving is the piece
still missing from the succession story, and the next run's work is
the lately-naming step, not more sittings.

## Metric review (carried + filed)

- REL-WIT: v4 staging delivered (5 sittings, 3 single-fresh, 0
  nonverbal, skip ledger complete) but draws stay at 1 — the
  bottleneck is now the lately event naming the staged dead (2 of 3
  single-fresh sittings had latelyDead=none), and then the
  witness-variant serving itself (0 on the 1 draw). The 3-draw floor
  stands. Next run: address lately-naming, not sitting supply.
- MOURN-TEMPLATE: first wild FAIL on this bar (2 pairs, both at the
  d+3→d+8 window edge). The double-stage-pair exemption is still
  untested in the wild (0 double-staged deaths). The bar stands at 0;
  the fix direction is second-sitting shape steering (filed above).
- DRY CENSUS: first other-class hit since the stage-2 fix landed
  (r268: 0). New surface: drift-note stage directions served through
  the repeat-ledgered sayLine path. Filed as the next fix item (see
  above); the bar stands at 0.
- F5 WILD EXERCISE stays DESCRIPTIVE; rolling window advances one
  panel (…+r279), stays 0.
- Proof refresh rounds 11 + 12 remain owed (measurement-proof track,
  carried since r192/r194/r195).
- Day-skip watch: thirtieth straight panel watch, 0 skips.
- Scout-role ping-pong / driver re-ask pestering: carried,
  unchanged.
- Multi-name relationship mourning stays open (not built). KIN
  mourning stays unavailable (no kin signal). BOWCRAFT bisect for
  the 34362 drift stays open (not this run's). Outing-chain re-tune
  stays open (conversion 12.9%, r260).
- **Filed (this run, game):** drift-note beats must not fall back to
  the spoken dry line — serve stage directions outside the
  repeat-ledgered sayLine path, or suppress on block.
- **Filed (this run, game):** mourning second sittings must steer
  away from the first sitting's shape about the same dead (d+3→d+8
  repeats).
- **Filed (instrument, carried):** the 40-entry corpse-census cap
  can hide witnessed corpses (r266: Sari, 34435); the census also
  undercounts ambush-witnessed deaths systematically (r267) — this
  panel: census counted 3 witnessed person corpses, the live scan
  found 7 (3 combat + 4 ambush). The census verdict stays a lower
  bound; the wit-sit live scan stays the backstop.
- **Filed (diagnostic, carried):** the witness-population map is
  corrected (r266) — ambush is a second witness path (bystander
  within 6 tiles). The `hurtVillager` fix proposal stays filed for
  Steve, NOT built (a game change to grief/gossip/murder gating,
  needs his call).
- **Filed (carried):** `topic2Beat` follow-ups share the
  template-vs-filled gap — a mourning follow-up whose filled line is
  run-blocked would dry the same way. No wild hit on this panel; fix
  only if a panel shows one. (The Benoit hit is a drift note, not a
  follow-up — it does not promote this.)
- **Filed (carried):** mourning total pool exhaustion still dries by
  design (the stage-2 carve-out) — a larger single-name pool or a
  last-resort structural serve would close it; neither is built here.

## Gate

**333 passed, 11 failed in 1558s** — `node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-playtest2` on tip `612872ae2`,
08:08:16–08:34:15Z, log
`evidence/2026-11-24/journey-succession-r279-gate.log`. **0
attributable.**

- Standing known failures (3): measurement staleness pair
  (`test-measurement-proof-update.js`, `test-measurement-workflow.js`
  — proof freshness, refreshed by `balance-proof-update.js`, not this
  run) and phone-frame stale receipt
  (`test-phone-frame-proof.js`).
- Load flakes (8), all green standalone serialized on the same tip
  (`evidence/2026-11-24/journey-succession-r279-gate-standalone.log`,
  08:34:55–08:51:18Z): 7 scripts hit check.js's 120s per-script
  timeout under three concurrent gates (living-garden,
  occupation-panels, one-person-army, solo-campaign-endings,
  trust-observer-neutrality, synergy-stall, capable-bot — the last
  40 passed / 0 failed); `test-measurement-cache-flags.js`
  (0/4 in-gate, 4/4 standalone — same load-sensitive failure as
  r268's gate 2, same standalone pass).

No failure names this run's code or its panel: this run changes no
game code (tooling + evidence only).

## Adoption notes

- Stale-lock recovery: the dead run's lock
  (`playtest-loop-2-2026-11-24T06:02:12Z`) was 1h53m old at this
  run's start; its worktree `journey2-7` heartbeat was 33 min stale
  (last 07:22:25Z); no live coordinator process, no live subagent,
  and `uptime` showed a VM restart at ~07:25Z. Lock deleted in the
  same call as its re-read (run_id matched); this run's lock
  (`playtest-loop-2-2026-11-24T07:58:50Z`) created. Registry entry
  for `journey2-7` re-pointed to this run (run_id + purpose) after
  the flap cleared; heartbeat loop
  `journey2-7-hbloop-r279adopt.sh` (setsid, 5-min beats) verified
  landing in the registry.
- Flap window 26: 08:02:11–~08:05:30Z (~3.5 min), caught by the
  watcher (A/G/H FAIL EPERM, B update-ref rc=128, C/D/F OK) and by
  this run's first ff attempt, which failed mid-checkout: 174
  zero-byte files created across the new-master evidence/scripts
  paths, and `src/js/win-plan.js` truncated to 0 bytes. Recovered
  per the write-flap skill: probe failed → stopped writing; stray
  zero-byte files removed; `win-plan.js` restored from its committed
  copy at `bf7444a49` (blob `91e65f40…`, hash verified after the
  restore); ff re-run clean to `612872ae2`. No r279 evidence was
  touched by the flap (all 26 per-seed JSONs + analyzer verified
  complete before the ff).
- The dead run's panel is adopted as-is (26/26 seeds exit 0,
  analyzer exit 0, all files complete, last write 06:44:03Z — over
  an hour before the restart). Nothing was re-run: the panel was
  judged on base `bf7444a49`; the proofs and gate are re-run on the
  rebased tip `612872ae2` per loop practice.
- Rotation: 7 → 4 (to be written at closeout; verified after).
