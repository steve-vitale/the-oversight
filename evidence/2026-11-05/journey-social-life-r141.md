# Journey social life r141 — CLOSEOUT (Lane B, 2026-11-05)

Leg 5 (social life). Rotation-b read 5, writes 6 (crisis next).
Base: master 1a898136c (post r140 fixes + batch ship 05d82de89).
Run: 12:00 CST occurrence. Coordinator TIMED OUT at 7200s before
closeout; closed out in the main session per INSPECT HELD WORK.
Liveness at closeout: lock run_id 2026-11-05T17:56:51Z (read before
deletion); registry heartbeat for journey2-social 18:53Z but ZERO
worker processes and no heartbeat loop — orphan-heartbeat pattern
(r138/r140 precedent), run DEAD. Branch base 1a898136c; master moved
to 5ffbdaa1a (Lane A r100) during the run — rebased before merge.

Prereg: evidence/2026-11-05/journey-social-life-r141-prereg.md
(two jobs: continuity panel M1–M5 + land the gossip-position fix).

## (B) Gossip-position fix — LANDED [needs-eyes]

sim-gossipcensus-a (Lane A, today) proved DIAG-GO: haven-gossip
burst reaches a stranded scholar and reads wrong. Fix landed here,
commit 5b225fe0a: naming debate/tale/witness lines wait until the
scholar is at Haven — `scholarAtHaven()`, `sayHavenNews()` (queue
cap 20, drop oldest), `flushHavenNews()` at top of endDay (drops
stale word/debate lines once the settle line covers the outcome).
Routed: monsterNewsCheck word, seedMonsterNames debate,
monsterNamingCheck settle, endDay witness branch, tellKillerTale
prose. Mechanics untouched: kick/proposals/majority/knowers/tale-log
run identically away or at Haven — only the delivery waits.
Proof scripts/test-gossip-position-r141.js 29/29 (RED verified in
closeout: with game.js fix stashed, case 1 fails — burst lines
present while away; see gate section). [needs-eyes]: narration
delivery change, Steve should feel it on his phone.

NOT in scope (separate mechanisms, own arms): raid call, fire
overhear lines, pantry "full shelves" lines, dayPart-3 ambient.

## Instrument corrections (M6, all pre-judgment)

Three corrections, panel re-run each time; M6 judged on the THIRD
run only. (1) Driver recorded no per-night position — added
nightlyNews + namingEnd census. (2) Slice ran from this daily
call's start, missing endDay lines (2 burst vs 48 in full stream)
+ 50k trim index shift — slice now previous-daily-end to this
daily-end on GLOBAL indices. (3) Day attribution was the artifact
(slice covers previous day's parts, stranded flag reads next
morning) — driver now classifies each naming-beat line AT EMIT
TIME with the scholar's position then. First three runs'
nightlyNews discarded as M6 verdict inputs; trajectories stand
(determinism proof re-verified each time).

## (A) Continuity panel — seeds 41801–41804

All 4 villages lost (d37, d55, d102, d62). Full convs 34/45/81/58.
Deaths dominated by the wild (36 of 56 fallen); 1 ambush kill
(Bac, d16, seed 41803). Successions rapid: 41801 saw 6 bearers
in 37 days; 41803 saw 10 in 102 days.

- M1 arming motive GO: 19/19 plots grievance-linked at arming;
  13 grievance-holder → later leader cases. DROUGHT BOUND
  BROKEN: 2 plots armed after d30 (late d30+: 2) — the d9–d19
  drought bound does not hold on this panel.
- M2 villager-initiated bonds: 0 propose* calls — Q1 STILL OPEN,
  fifth baseline datapoint (0 across linkseek/standaccum/r103/
  r125/r132/r136/r141). Measurement gap: bond records carry no
  initiator field, so NPC-initiated formation cannot be inferred
  from end bonds — the bond-initiate build's panel needs this.
- M3 invite refusal: party accept 13, lure accept 14, lure
  decline 15, party decline 7 — invitations sometimes taken,
  sometimes refused, split by inviter as pre-registered.
- M4 sense GO (closeout read — the worker recorded no M4):
  Katarina, seed 41801 day 27, C-friendship, 10 turns, natural
  end. She wants something real: a leadership bid ("If I don't
  step up, someone worse will"), watching the player's standing
  ("Some of them are waiting for an alternative"), and it plants
  an open thread ("Think about it? I'll be around"). It also
  connects to the panel — Katarina led plot_1 and was the target
  of plots 3/5. Caveats: the player's side is all generic prompts
  ("Tell me more" ×4, "Go on", "I'm listening" — never agree,
  deflect, or challenge her bid); trust 55→55, no movement; one
  beat repeats near-verbatim two turns apart ("Someone asked me
  yesterday what the plan was. I had one" / "Someone asked me
  what we should do yesterday. I had an answer").
- M5 census guardrail NOT MET: 1/4 villages past d100 (only
  41803, d102) — dark-channel verdicts are within-window only.
  Short-panel sequence now 1/4, 1/4, 0/4, 1/4.
- M6 gossip-position GO: 0 naming-beat lines emitted while the
  scholar was away (emit-time classification: 52 burst + 26
  settle + 8 witness + 22 tale at Haven, 0 away); 113 debates
  kicked, 112 settled — mechanics alive, not silenced.

## Village assessment (plain words)

Four villages, all lost before the long game. The wild does most
of the killing, not monsters or each other — people die on the
trail, in ones and twos, while the village keeps talking: 218
full conversations across the panel, friendships forming, moots
firing, plots arming on real grievances (ambushes remembered,
guilty votes tallied). Katarina's bid is the clearest people
moment — a villager who has decided she should lead and says so
to the player's face. But nobody lives long enough for any of it
to compound: the longest village reached day 102 and still died
with no one left. Social life is alive; survival is the wall, as
it has been all cycle.

## Reachable / Fun / Winnable

REACHABLE partly (social systems fire end to end; the long social
arc needs a village that lives past d100). FUN yes — the panel
reads as people, not counters. WINNABLE not yet (0/4 past the
scale the leg needs; same wall as r99/r100).

## Gate

check.js --quick in the worktree (rebased tree): **284 passed, 6 failed
in 425s** — identical profile to r99/r100 (284/6). The 6 failures are
the standing families, verified byte-for-byte against r100's gate
log on master (same 6 scripts FAIL there): measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20-fixes. NO new failures.

RED→GREEN (closeout, proof test scripts/test-gossip-position-r141.js):
routing reverted only (5 say→sayHavenNews call sites back to say(),
helpers kept) → 18/29 checks pass, stranded witness/tale lines
leak while away; fix restored byte-identical → 29/29 GREEN.

Telemetry check (closeout): all 5 l3.* keys LOUD-disappeared
(baseline 318/168/8/7/99 → current 0, n=4). EXPLAINED, not a bug:
the social driver never emits l3.* fields (prereg-known schema
drift; bonds live under bondEnd 53/57/113/56). Baseline NOT rolled.

## Metric review

- M4 was not recorded by the run (no transcript in the analysis);
  closeout read done in the main session from the panel JSONs.
  Next run: the analyzer should carry the M4 verdict line, not
  leave it to closeout.
- M2 needs an initiator field on bond records before the
  bond-initiate build's panel can judge NPC-initiated formation
  from end bonds.
- M5's short-panel sequence (1/4, 1/4, 0/4, 1/4) is a standing
  survival fact, not a leg-5 metric problem — do not re-score it.

## Landing

Commits on journey2-social (base 1a898136c): 564723073 prereg;
5b225fe0a [needs-eyes] haven-news relay fix + proof + driver/
analyzer; 47dbfdcc9 M6 instrument; 1d9dd943c M6 slice fix;
adde43c99 M6 emit-time classification. Evidence commit (panel
JSONs + analysis + check log + this note) by closeout. Rebased
onto master 5ffbdaa1a, ff-merged, worktree released. Rotation-b
5→6. Telemetry check vs social.json: see below.
