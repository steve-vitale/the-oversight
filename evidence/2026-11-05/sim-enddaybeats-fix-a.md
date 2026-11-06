# sim-enddaybeats-fix-a — EVIDENCE (arm completion, Loop A fleshout-20261106T0028Z)

Worker: sim-enddaybeats-fix-a (Loop A, food-economy / narration).
Run: fleshout-20261106T0028Z — COMPLETION of the dead 2215Z run's arm.
Prereg: evidence/2026-11-05/sim-enddaybeats-fix-a-prereg.md (committed BEFORE
any judged sim; base 25de3b127). Proof: scripts/test-enddaybeats-fix-a.js.
Driver: scripts/enddaybeats-fix-trace-a.js (census driver + fix-corpus
OUTDIR/prefix + read-only pendingHavenNews depth observation only).
Base for this arm: branch sim-enddaybeats-fix-a at 0c9fca121 (tree =
25de3b127 + prereg + driver). Horizon 60 loop-days, policies
bankfood(warmed(woodcarry(nighttravel))) over competent, env gates
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel
WOODCARRY=1 WOODWARM=0 BANKFOOD=1 STRANDNARR=1. Seeds 46001–46040 (pilot
46001–46008, screen 46009–46040); extension 46041–46064 NOT triggered.

## Verdict — FAMILY GO (with one disclosed measurement artifact, read §1)

Every GATE/RELAY beat is 0 stranded-sleep windows after, the controls stay
0, guardrail (i) passes, and the relayed beats' return delivery reads true.
The single window-label exception (46022 d8, overhear + settle + village-raid
in one window) is a mid-window return: the scholar walked back into Haven
mid-window and all four lines fired AT the fire afterwards — no beat fired
while the scholar was stranded. §1 gives the full-window read and the
verbatim lines; the strict window-label counts are stated alongside so
nothing is hidden. The panel compare decision is `review_required` (capable
player-deaths regression_signal) — investigated and explained in §6 as
downstream divergence from the prereg-disclosed one-draw RNG shift, with
mixed signs across policies and 23/32 paired cases byte-identical.

Per-beat verdict table (stranded-sleep windows, AFTER vs BEFORE, pooled
pilot+screen; denominators 36 after / 32 before unless noted):

| Beat | Direction | Before | After | Sense verdict |
|---|---|---|---|---|
| FRAGMENTS | GATE-suppress | 18/32 (40 lines) | 0/36 | gated — reads true: at-Haven fragments still fire (ns rate 43.9% → 45.1%) |
| PANTRY deposit | GATE-suppress | 25/32 (25 lines) | 0/36 | gated — ns rate 60.6% → 62.0% |
| PANTRY plenty | GATE-suppress | 0/32 (gate-off) | 0/36 (gate-off) | gate-off both legs (PLENTYDEPRI=0); gate is the same one-line shape as deposit (proof B5) |
| RAID CALL 🚨 | GATE-suppress | 1/32 | 0/36 | gated — the one before-hit (46007 d25) is gone; the crisis still raises (proof B2/B7) and a live crisis surfaces in the Haven panel |
| RAID NEWS 🐗 + escalation + contest-ack + defender + linger | RELAY kind 'raid' | 1/32 (raid-line) | 0/36 | relayed-true — the before-hit raid (46007 d25, same raiders) is said at the fire on return, d27 (§5) |
| RAID AFTERMATH 🕯️ | RELAY kind 'raid' | 0/32 | 0/36 | relayed-true (no stranded hit either leg; totals 21 → 19, explained §4) |
| OVERHEAR | GATE-hold (ledger queue) | 1/32 | 1/36 label-only | gated-then-fired-on-return — the one after-hit is the 46022 d8 post-return delivery (§1); the beat was held through 4 stranded nights (d4–d7 clean) and fired at the fire on return |
| VILLAGE RAID 🌙 | RELAY kind 'raid' | 2 windows (full-scan) | 1 window label-only | relayed-true — the after-hit is the 46022 d8 post-return delivery (§1); before-hits (46007 d25, 46039 d18) fired while stranded and are gone |
| CONFRONTATION 🔥 | GATE-suppress | 1 window (full-scan, s46039 d19) | 0 windows | gated |
| KILLER TALE (control) | none | 0/32 | 0/36 | stays 0 |
| BURST (control) | none | 0/32 | 0/36 | stays 0 |
| SETTLE (control) | none | 0/32 | 1/36 label-only | relayed-true — the one after-hit is the 46022 d8 post-return delivery of a queued 'settled' naming line (§1); the relay delivered it on return as designed |
| WITNESS (control) | none | 0/32 | 0/36 | stays 0 |
| MOOT summons | LEAVE | 2 windows | 2 windows | left — still present, unchanged (s46017 d14, s46018 d9 both legs) |
| NIGHTFALL line | LEAVE | 3 windows | 4 windows | left — still present |
| DIRECT-ADDRESS chatter | LEAVE (class) | 3 windows | 4 windows | left — still present |

Family verdict: GO. No stranded scholar heard a fireside line in the after
leg (36 windows); the only lines inside a stranded-labeled window fired
after the scholar returned to Haven mid-window (§1).

## §1 — The 46022 d8 artifact (the one window behind every label-hit)

After-leg stranded sleep windows: 36. Exactly one spans a mid-window
return (sleep-end marker inside Haven; BEFORE had 0 such windows of 32).
Seed 46022, loop-day 8: stranded nights d4, d5, d6, d7, d8 (out-of-reach /
travel-refused). The d8 sleep window (idx 763–825) in transcript order:

- idx 783–791: the scholar Harper Diarra dies (starvation); the mantle
  passes; "You wake up somebody else. Scarlett Cao, 35 — a bike messenger."
- idx 796: "You walk back into Haven. 14 Codex entries. The village is
  glad to see you."
- idx 799: "You overhear it at the fire, and stop pretending not to
  listen. Riders from Thornfield are telling the deer story again — with
  your name attached this time."
- idx 802: "It's settled. The village is calling it "Loud-Eyes." The
  Journal keeps it."
- idx 803: "🌙 Raid — Stonebridge came in the night from the southeast.
  They carried off ~1394 kcal from the pantry. Nobody's dead, but the
  message is clear: the ground is theirs too, and they're done asking.
  (Trust -10.)"
- idx 804: "🌙 Raid — Thornfield came in the night from the northwest.
  They carried off ~640 kcal from the pantry. Nobody's dead, but the
  message is clear: the ground is theirs too, and they're done asking.
  (Trust -10.)"
- Sleep-end d8 marker: inside Haven (mx 4, my 4); d9 evening inside Haven;
  pendingHavenNews depth 5 on the d8 evening → 0 on d9 (queue flushed on
  return).

Read: the scholar returned mid-window and the four lines fired AT the fire
afterwards, in that order — the overhear beat released from the ledger
queue on return (its design), the settle line and the two village-raid
lines flushed from the haven-news relay on return (their design). The
window is labeled "stranded" by its sleep-start position (away, wetland
7,0), so the pre-registered window-label counting scores overhear 1/36,
settle 1/36, village-raid 1 window. That counting misfires on windows
spanning a mid-window return; the sense read is unambiguous and the gate
and relay behaved exactly as pre-registered. The beat was held through the
four preceding stranded nights (d4–d7 clean of overhear) — the hold works.
Strict-label reading stated for the record: by window-label counting alone
the verdict rule would call overhear / village-raid / settle NO-GO at 1/36;
on the evidence (no beat fired while the scholar was stranded) the verdict
is GO. See "metric review".

## §2 — Before leg (judged first; fix did not exist yet)

- PILOT 46001–46008: 7 stranded sleep windows across 2 seeds (46006, 46007)
  — misses the power bar by construction, as the prereg predicted, and
  triggers the pre-registered screen. Incidence: fragments 2/7,
  pantry-deposit 5/7, raid-call 1/7, raid-line 1/7, overhear 0/7, controls 0.
  Upkeep mechanism check: 7 stranded upkeep windows, 0 family hits.
  daysAlive per seed: 33, 60, 60, 60, 60, 60, 47, 60.
- SCREEN 46009–46040 (32 seeds, every seed run, stranding or not).
- POOLED BEFORE (40 seeds): 63 stranded windows, 32 stranded sleep
  windows across 10 stranding seeds (46006, 46007, 46014, 46017, 46018,
  46022, 46024, 46028, 46037, 46039); 31 stranded upkeep windows, 0 family
  hits (mechanism check passes). POWER BAR PASSED (≥20 windows, ≥4 seeds).
  Per-beat stranded-sleep windows: fragments 18/32 (56.3%, 40 lines),
  pantry-deposit 25/32 (78.1%, 25 lines), pantry-plenty 0 (gate-off),
  raid-call 1/32, raid-line 1/32, raid-aftermath 0, overhear 1/32,
  tale/burst/settle/witness 0. Full-window scan (diag has no classifiers
  for these two): village-raid 2 windows (s46007 d25, s46039 d18),
  confrontation 1 window (s46039 d19, verbatim in §7).
  Non-stranded sleep windows 2242. Transcript errors 0. Days alive: 34/40
  survived 60d; 6 village-lost (46001 d33, 46007 d47, 46011 d55, 46020 d27,
  46026 d37, 46037 d36).

Per-seed before stranded detail (loop-day: family hits in that window):
46006 (60d): d4 clean; d5 frag×2 + pantry; d6 frag×2 + pantry; d9 pantry.
46007 (47d): d23 clean; d24 pantry; d25 raid-line + raid-call + pantry.
46014 (60d): d59 pantry; d60 frag + pantry. 46017 (60d): d13 frag + pantry;
d14 frag + pantry; d15 pantry. 46018 (60d): d8 clean; d9 frag×4 + pantry;
d10 frag×3 + pantry; d11 frag + pantry. 46022 (60d): d4 clean; d5 frag×3 +
pantry; d6 clean. 46024 (60d): d26 frag×10 + pantry; d27 frag + pantry;
d28 pantry. 46028 (60d): d12 pantry; d13 clean; d14 frag + pantry. 46037
(36d): d4 clean; d5 frag×2 + pantry + overhear; d6 frag + pantry; d7 frag +
pantry. 46039 (60d): d17 frag + pantry; d18 frag + pantry; d19 frag×4 +
pantry.

Before verbatim (the wrong read the fix addresses), s46037 d5 — the scholar
is sleeping rough, starving, miles from Haven, and hears:
"You overhear it at the fire, and stop pretending not to listen. Riders
from Thornfield are telling the deer story again — with your name attached
this time." In the same window: "You catch fragments by the fire — A woman,
maybe 20s telling Wei about Esteban. The retelling is already better than
the event." and "🍽️ Caleb watches another basket arrive and laughs. "We're
feeding the shelves more than ourselves. Not today.""

## §3 — After leg (fixed code; proof test green first)

Proof: scripts/test-enddaybeats-fix-a.js 64/64 green on the fixed code
(2026-11-06 ~00:35Z): unit classifiers, per-beat gate/relay scenarios B1–B8
(relay queue/flush, raid-call gate, overhear hold, village-raid relay,
pantry stamp, fragments twin-run, monster-raid relay+gate, confrontation
gate), det-gate ON vs OFF identical on 17021, 17021 re-pin 60d survived /
0 stranded nights, 15003 loop-day-7 word anchor inside Haven.

- PILOT 46001–46008: 7 stranded sleep windows across the same 2 seeds
  (46006, 46007); all family tallies 0. daysAlive IDENTICAL per seed to
  before (33, 60, 60, 60, 60, 60, 47, 60); non-stranded sleep windows 432,
  identical to before. Trajectory identity holds exactly on the pilot.
- SCREEN 46009–46040 (32 seeds).
- POOLED AFTER (40 seeds): 71 stranded windows, 36 stranded sleep windows
  across the same 10 stranding seeds; 35 stranded upkeep windows, 0 family
  hits. POWER BAR PASSED (36 windows, 10 seeds). Per-beat stranded-sleep
  windows: fragments 0/36, pantry-deposit 0/36, pantry-plenty 0 (gate-off),
  raid-call 0/36, raid-line 0/36, raid-aftermath 0/36, overhear 1/36
  (label-only, §1), village-raid 1 window label-only (§1, full-scan),
  confrontation 0 (full-scan), tale/burst/witness 0, settle 1/36
  (label-only, §1). Non-stranded sleep windows 2232. Transcript errors 0.
  Days alive: 34/40 survived 60d; 6 village-lost. Two per-seed divergences
  (see §4): 46028 60d → 30d, 46037 36d → 60d; the other 38 seeds identical.

## §4 — Guardrails

(i) NO SILENCING of non-stranded delivery (judged by the ledger, per the
prereg). Suppressed beats, non-stranded sleep-window rate before → after:
fragments 985/2242 = 43.9% → 1007/2232 = 45.1% (+1.2pp, within ±3pp);
pantry-deposit 1358/2242 = 60.6% → 1384/2232 = 62.0% (+1.4pp, within
±3pp); raid-call 154/2242 = 6.9% → 150/2232 = 6.7% (−0.15pp, within ±3pp);
confrontation non-stranded rate is not measurable from the trimmed corpus
(no classifier/counter for it; the trimmed transcript keeps stranded
windows in full only) — the unit scenario (proof B8) proves at-Haven
delivery intact (≥1 naming heard in 300 ticks at Haven, 0 away), and the
gate fires only while away by construction. Relayed beats, total line
counts across the band before → after: raid-line 185 → 181 (−2.2%, within
±5%); overhear 38 → 38 (0%, within ±5%); raid-aftermath 21 → 19 (−9.5%,
OUTSIDE ±5% — explained line by line: per-seed, only 46028 lost aftermath
lines (2 → 0); 46028 is the diverged seed that died at day 30 after vs
survived 60d before, losing ~30 days of raid+contest collisions; no other
seed lost an aftermath line; no relay loss — the pendingHavenNews final
depth is 1 in both legs, same seed 46014, a line queued on the final night
with no return night to deliver on). Village-raid total count is not
measurable from the trimmed corpus (no classifier); stranded-window
incidence 2 windows → 1 window (the after one a post-return delivery, §1)
and unit B4 proves the relay path. Tale 775 → 786 (+1.4%), witness
159 → 160 (+0.6%) — controls stable.
Total fragments lines fell 10134 → 8941 (−11.8%): expected, not silencing —
the gate silences fireside chatter whenever the scholar is away, including
daytime travel (stranded sleep windows account for only 40 of the 1193
fewer lines); non-stranded sleep delivery is unchanged (+1.2pp above), and
the gossip itself still spreads identically (proof B6 twin-run: heard and
distortion totals identical away vs at Haven). The hear_10_rumors count
correction is disclosed in the prereg (hearing requires presence); the
threshold (10) is unchanged.
Held-volume accounting (pendingHavenNews depth, read-only): max depth per
seed before → after: 20 → 20 (46018, the 20-cap), 16 → 6 (46028, fewer days),
16 → 10 (46037), 11 → 11 (46024), 5 → 8 (46039), 2 → 5 (46007), 2 → 5
(46022); final depth at run end: 1 in both legs (46014, same line queued on
the final night). No queued item was lost to the fix.
(ii) DET-GATE: instrument ON vs OFF identical on seed 17021 on the fixed
code (proof test, det-gate check green; transcript errs 0 in both legs).
(iii) TRAJECTORY IDENTITY: daysAlive identical on 38/40 seeds. The two
divergences are the prereg-disclosed one-draw RNG shift (a deferred first
gossip beat defers its beat.text() R() draw): 46028 survived 60d before →
village-lost d30 after; 46037 village-lost d36 before → survived 60d after.
Both are stranding seeds; end reasons in aggregate are identical (6 lost /
34 survived both legs). The verdict is judged on pooled rates, not paired
windows, as the prereg directs.
(iv) NO gate/price/deed-RULE change: the fix touches only say calls plus
the hear_10_rumors hearing count (disclosed count correction; threshold 10
unchanged). Balanced-panel compare decision is `review_required`, not
`no_material_signal` — investigated and explained in §6 before landing.

## §5 — Sense test (return delivery reads true)

Relayed raid news, seed 46007 (the before leg's only stranded raid):
BEFORE d25, stranded, the window held "🐗 RAID — 3 raiders (tick, Big Big,
The Ugly Beast) hit Haven in the night, drawn by the smell of the pantry!
No walls. No warning but the noise." AND the 🚨 summons. AFTER: the d25
stranded window is empty (0 hits); the 🐗 line — the same raid, same raiders
— is said at the fire on d27, inside Haven, after the scholar returned
(d26 inside, queue depth 5 → 0 on d27): "🐗 RAID — 3 raiders (tick, Big Big,
The Ugly Beast) hit Haven in the night, drawn by the smell of the pantry!
No walls. No warning but the noise." Reads true: the news stays true on
return. The 🚨 summons does NOT reappear (gated, not relayed, by design —
the crisis was raised on d25; a stale summons would invite action on a
fought crisis). Per beat: fragments gated; pantry gated; raid-call gated;
raid-line relayed-true; raid-aftermath relayed-true (no stranded hit either
leg); overhear gated-then-fired-on-return (§1); village-raid relayed-true
(§1); confrontation gated; tale/burst/witness relayed-true (0 stranded
either leg; their at-Haven delivery continues: tale ns windows 109 → 116).

## §6 — Balanced panel (§15) — decision `review_required`, investigated

Panel invocation (both legs): `node scripts/balance-panel.js --out
<dir> --seeds 46001,46002,46003,46004,46005,46006,46007,46008 --policies
capable,risk-aware,socialite,winseek --days 60`; compare:
`node scripts/balance-panel.js compare --before ...-panel-before/panel.json.gz
--after ...-panel-after/panel.json.gz --out ...-panel-compare`.
Compare file: evidence/2026-11-05/sim-enddaybeats-fix-a-panel-compare.md
(.json alongside). Decision: `review_required`, driven by capable
"Player deaths per run" 0.75 → 1.25 (+0.5, 95% exploratory interval
0.125–1, regression_signal) and per-100-days 1.29 → 2.10
(regression_signal). All other policies: risk-aware deaths −0.875
(no_material_signal — an improvement), socialite ALL metrics delta 0,
winseek deaths +0.875 (regression_watch, interval includes 0). Table win /
entry / sitting, national access: 0 → 0 everywhere except winseek national
0 → 0.125 (no_material_signal, 1 case).
Investigation (paired case files, before/after panel cases/):
- 23/32 paired cases byte-identical (same stateHash): capable 5/8,
  risk-aware 5/8, socialite 7/8, winseek 6/8.
- Diverged with metrics: capable 46001 (deaths +2, ability +2, village
  deaths +3, first divergent day 15), 46003 (deaths +1, ability +17,
  village deaths −15, day 13), 46007 (deaths +1, ability +64, village
  deaths +13, day 14); risk-aware 46003 (deaths −1, ability +11, days −4,
  survived → lost, day 11), 46006 (deaths −6, ability +27, day 7); winseek
  46003 (deaths +1, ability +9, days +11, lost → survived, day 5).
- The signs are MIXED: risk-aware improves by 6 deaths on 46006 while
  capable worsens by 1–2; winseek 46001 and 46003 both flip lost → survived.
  Ability events rise in every diverged case (+2 to +64) — a deed delay
  would push ability events DOWN, not up; the swings (notably +64) are the
  signature of an RNG-stream divergence, not a systematic effect.
- Mechanism: the only RNG-stream difference the fix introduces is the
  prereg-disclosed one-draw deferral (a held first gossip beat defers its
  beat.text() R() draw). All other gates sit after their RNG draws or on
  deterministic text; the hear_10_rumors correction changes a count, not a
  draw. Stranded fragments lines are 40 of 10134 total fragments lines
  (0.4%), so the deed-delay channel is <1 day on the 10-rumor deed and
  cannot produce day-5–15 divergences with ±64 ability-event swings.
- Quirk (pre-existing, not fix-caused): the 46001 case files lack metrics
  in both legs for risk-aware and winseek (row + stateHash only, no
  warnings); socialite 46001 lacks metrics before but has them after with
  the same end (village-lost d54). The compare tool still paired 8/8 per
  policy.
Verdict on the signal: explained as downstream divergence from the
disclosed one-draw RNG shift in an 8-pair panel; no consistent direction in
deaths, village deaths, community loss, wins, national, or table; no
gate/price/deed-rule change. Landing proceeds with the review_required
disclosed here (guardrail (iv) requires investigation + explanation, which
this section is — it does not require a no_material_signal re-run).

## §7 — "Other" enumeration (full-window scan of stranded sleep windows)

Before (32 windows, 825 sleep-phase lines, 68 family-classified): the
position-blind lines the fix does NOT touch — moot-call lines ("Lorenzo has
been talking at the fires. Enough voices — tonight they call a moot." ×3,
"🔴 LIVE! THE MOOT!" ×3, "Lorenzo calls the moot." ×3), "The moot turns to
you. Your vote matters here — and everyone will remember it." ×2 (s46017
d14, s46018 d9), "The moot doesn't wait forever..." ×2, nightfall "Night
settles. The fire is the whole world now. No watches posted." ×3, lingerer
gorge "🌙 Night. The lingering … gorges at the treeline — … kcal gone from
the stores." ×6 (s46014), runner commons lines ("A runner from Stonebridge,
dusty and direct: "Your foragers are stripping our side…"") ×5, direct-address
("👀 Walt pronounced a Denver place-name…" ×2, "💬 Aria pulls you aside…" ×1),
"A runner from …" and "🌙 Something went missing from the pantry in the
night." ×1, plus sleep-loop prose (settle/dawn/hunger/camp-wild) and
village-activity reports (wood/stone/cooking/teaching) that name no fire.
After (36 windows, 940 sleep-phase lines, 1 family-classified): moot-turns-to-you
×2 (same seeds/days), nightfall ×4, lingerer gorge ×6, runner ×3,
direct-address ×4, moot-call/LIVE lines unchanged in kind. The LEAVE beats
are untouched, as pre-registered. Confrontation: 1 window before ("🔥 Marcus
has been turning something over all evening. Finally: "Nikolai. The story
about what you're after — we all eat from the same pot here, we don't get
to lie about who's at it." It costs Marcus to say it; you can see the price
land." — s46039 d19) → 0 after. New follow-up items from this enumeration
(see sim-findings.md): the nightly lingerer-gorge 🌙 line fires in stranded
windows (6 lines both legs) and is not in any family — it needs its own
gate/relay decision (note: master r143 re-voiced its empty-pantry variant
after this arm's base; the line itself is untouched here); the moot-turns-to-you
summons still reaches stranded scholars (2 windows both legs) with no
return-time vote surface — the follow-up arm the prereg already named.

## §8 — The fix (one commit, [needs-eyes] narration/feel)

src/js/game.js — FRAGMENTS gate (spreadGossip say + hear_10_rumors note
inside scholarAtHaven()); PANTRY gates (_depositGateDayVoice,
_plentyDepriDayVoice deposit + stand-down voices, say only, stamps consumed);
commonsRaid 🌙 line → sayHavenNews kind 'raid'.
src/js/havenGrowth.js — havenRaidTick: 🐗 line, 🐗⚠️ escalation, 🕯️
contest-ack, "Nobody met" linger line, 🛡️ defender report → sayHavenNews
kind 'raid'.
src/js/comms.js — raiseAidCrisis: 🚨 summons + already-at-the-door echo
gated on scholarAtHaven(); crisis state + journalNote untouched.
src/js/ledger.js — _checkDimBeats + flushLedgerBeats: a first gossip beat
that would carry the "You overhear it at the fire" prefix stays queued
while away; fires with its prefix on return. No new queue, no new cap.
src/js/exposure.js — exposureFireTick 🔥 accusation gated on
scholarAtHaven(); rep dent, trust move, memory, exposure record untouched.
NOT touched, per the prereg: relay internals (sayHavenNews /
flushHavenNews / pendingHavenNews — sibling arm sim-awaynaming-rereg-a
owns them; this arm only ADDS callers), killer tale / burst / settle /
witness sites, moot / nightfall / direct-address / word-travels. No
gate/price/deed-rule change.

## §9 — Code facts re-verified + master drift (step 3 of the assignment)

- Step 1 (first step): uncommitted work found on arrival, NOT discarded:
  the fix itself in src/js/comms.js, exposure.js, game.js, havenGrowth.js,
  ledger.js (109 insertions, 18 deletions, written 23:33–23:36Z), the proof
  test scripts/test-enddaybeats-fix-a.js (23:56Z), the BEFORE corpus
  evidence/2026-11-05/sim-enddaybeats-fix-a-corpus/before/ (40 seeds) and
  the BEFORE panel evidence/2026-11-05/sim-enddaybeats-fix-a-panel-before/.
  Nothing was written within 15 minutes of this worker's start (00:31:46Z;
  latest mtime 23:56:31Z, 35 min prior) — no live-worker signal. The 2215Z
  worker had in fact run the BEFORE pilot+screen+panel and implemented the
  fix before the coordinator died; this worker verified the work (proof
  64/64 green, BEFORE corpus pooled and judged, fix diff checked beat by
  beat against the prereg table) and completed the arm (AFTER pilot+screen+
  panel, compare, evidence) rather than redoing it. The BEFORE leg ran on
  the pre-fix code (corpus written 23:17Z, before the src edits at 23:33Z;
  panel-before written 23:32Z) — sequencing per the prereg holds.
- Prereg code facts re-verified on this worktree's base (25de3b127 +
  prereg/driver): every site in the prereg's table is present as described;
  the fix diff matches the table beat for beat (FRAGMENTS/PANTRY/RAID-CALL/
  CONFRONTATION gate-suppress; RAID NEWS + escalation + contest-ack +
  defender + linger + VILLAGE RAID relay via sayHavenNews kind 'raid';
  OVERHEAR gate-hold in the ledger queue; MOOT/NIGHTFALL/DIRECT-ADDRESS/
  WORD-TRAVELS left; tale/burst/settle/witness untouched as controls).
  Line numbers drifted from the prereg's citations (daily churn), but the
  functions and call sites are the same.
- Master moved under the arm: local master is now a7dfc4a45
  (journey-endgame r143) vs this branch's base 25de3b127, and origin/master
  is further ahead (1a898136c, batch ship bump). The master delta's src
  changes do NOT touch any fix site: combat.js help-branch fallback (combat
  AI), game.js "holds and watches" say (tactical-escape narration), and
  havenGrowth.js empty-pantry lingerer-gorge re-voice (a DIFFERENT line from
  this arm's relayed linger line). No awaynaming merge landed (relay
  internals unchanged on master). This arm was NOT rebased mid-run: rebasing
  would put the AFTER leg on a different substrate from the BEFORE leg and
  break the prereg's same-seed before/after comparability (the combat.js
  change can shift trajectories). The coordinator owns the merge: --ff-only
  will fail on the moved master, so the merge needs a rebase/3-way merge
  with proof + det-gate + anchors re-run after it. Flagged here, not done
  silently.

## §10 — Band freshness re-verified (step 2 of the assignment)

Band 46001–46040 + extension 46041–46064, re-verified 2026-11-06 ~00:40Z
(after the prereg's 22:56Z check), whole-token grep:
- ALL dated preregs (evidence/*/sim-*-prereg.md): ZERO in-band tokens.
- ALL evidence .md (main tree, excluding this arm's own files): ZERO.
- sim-findings.md: ZERO. scripts/ + docs/: ZERO.
- Goal hidden_files (*.md + *.json): ZERO.
- Sibling arm sim-awaynaming-rereg-a prereg: ZERO (its band is 94601–94728).
- Forbidden-band lists (99201–99248): no touch.
- Files created after the 22:56Z check: only tbretreat-refind-confirm-b
  (92011–92018 / 93011+, different bands).
- OUT-OF-SCOPE note: whole-token 46xxx values DO occur inside archived
  October per-seed JSON corpora (goal hidden_files/evidence/ and sibling
  worktree evidence/) — as measurement values (e.g. pantry kcal), not as
  seed-band namings; the filenames there carry their own seeds (s3101,
  s1505, seed228, …), none 46xxx. The prereg's freshness scope (preregs,
  evidence .md, sim-findings, scripts, docs, forbidden lists) is the scope
  where a band is NAMED; raw JSON corpora were never in scope, because any
  5-digit band collides with some measurement value somewhere. No collision
  in scope; the band stands. Extension NOT triggered (both legs powered:
  before 32 windows / 10 seeds, after 36 / 10).

## Metric review (binding — proposals for the NEXT run, not re-scores)

1. WINDOW-LABEL MISFIRE (proved this run): a "stranded sleep window" is
   labeled by its sleep-start position + evening outcome, but the scholar
   can return mid-window (46022 d8 is the only such window in 68 pooled;
   BEFORE had 0). Beats firing after the return are counted as stranded
   hits. Proposal: judge a hit by the scholar's position AT FIRING TIME
   (record firing-time insideHaven on each hit) and count a window as
   stranded only if the scholar is still away at the hit's idx; keep the
   window-label count alongside for comparability.
2. CLASSIFIER GAP (proved this run): enddaybeats-diag has no 'village-raid'
   or 'confrontation' classifiers (BEAT_KINDS lacks them), so those two
   family beats are invisible to the tallies and were judged here via the
   full-window scan. Proposal: add isVillageRaidLine ("🌙 Raid — <village>
   came in the night…") and isConfrontationLine ("🔥 … sets their bowl
   down / … turning something over all evening") to the diag module, with
   proof fixtures, before the next enddaybeats arm.
3. TOTAL-COUNT MEASURABILITY GAP: total village-raid and non-stranded
   confrontation counts are not recoverable from the trimmed corpus (the
   trim keeps stranded windows in full only). Proposal: record per-beat
   total line counts in the driver's per-seed summary (cheap: count during
   analysis, store the numbers, not the lines).
4. RELAYED-BEAT ±5% BAND: raid-aftermath 21 → 19 (−9.5%) tripped the band
   on a 2-line difference driven by one diverged seed's early death. The
   band is too tight for rare beats (n < 25). Proposal: for beats with
   before-total < 25, judge the shortfall by per-seed attribution (as done
   here) rather than the ±5% band.
5. PANEL DIVERGENCE FROM THE ONE-DRAW SHIFT: the balanced panel's 8-pair
   screen is sensitive to the disclosed RNG shift (6/32 pairs diverged,
   mixed signs). Proposal: for narration-only arms, run the panel compare
   with a determinism note (pairs identical / diverged-from-shift) as done
   in §6, and treat a review_required driven solely by mixed-sign
   divergence as investigated-and-explained rather than blocking.
6. No metric was re-scored mid-run. The overhear/village-raid/settle
   verdicts above rest on the prereg's own sense test (full-window read of
   every residual hit), with the strict window-label counts stated
   alongside; the metric-review revision (item 1) is proposed for the next
   run, not applied retroactively to the counting.

## Deliverables

- evidence/2026-11-05/sim-enddaybeats-fix-a.md (this file)
- evidence/2026-11-05/sim-enddaybeats-fix-a-corpus/before/ (40 seeds,
  judged windows + every classified line + per-loop-day counts; stranded
  sleep windows in full transcript; pendingHavenNews depth series)
- evidence/2026-11-05/sim-enddaybeats-fix-a-corpus/after/ (40 seeds, same)
- evidence/2026-11-05/sim-enddaybeats-fix-a-panel-before/ (balanced panel,
  before leg) and ...-panel-after/ (after leg)
- evidence/2026-11-05/sim-enddaybeats-fix-a-panel-compare.md + .json
  (decision review_required, investigated §6)
- scripts/test-enddaybeats-fix-a.js (proof 64/64 green)
- scripts/enddaybeats-fix-trace-a.js (driver, committed 0c9fca121)
- src/js fixes (game.js, havenGrowth.js, comms.js, ledger.js, exposure.js),
  one commit with [needs-eyes] (narration/feel) — ready for coordinator
  merge, pending ship. No push, no bump, no live verification (ship loop
  owns deploys).

## Wall numbers (carried, NOT re-measured — per prereg)

Carried from the 1041Z round (0915Z run, 24 distinct seeds): wins 0/24,
national 0/24, table 0/24, wave-5 0/24, readiness-5-ready days 0/24.
This narration corpus records no scale outcomes. Panel legs agree: table
win/entry/sitting 0, national 0, except one winseek national case 0.125
after (1 case, no_material_signal).

## Run note

check.js --quick: 281 passed, 9 failed in 1326s on the committed tree (base 25de3b127; gate log goal hidden_files enddaybeats-fix-checkquick-20261105.log; main-session adjudication, NOT the worker's 280/10 — its failure list was incomplete). Failures, all standing/freshness class, none in the fix's code: measurement-proof-update, measurement-workflow (freshness), mobile-combat-cadence (2 sub-failures), occupation-panels, measurement-cache-flags (verified failing identically standalone on master fd2d0c5ef), phone-frame-proof (stale receipt), establishment-r20-fixes (racks-full, known since r103), trust-observer-neutrality + capable-bot (both 120s timeouts, load flake). Fix's own proof test 64/64 on the same tree. Gate verdict: no new failures — closeout bar met.
