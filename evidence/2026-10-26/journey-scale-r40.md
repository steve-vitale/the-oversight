# journey-scale r40 — THE SUBJECT MENU IS THE DOOR (2026-10-26, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261026T1555Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + post-national tail); write 3→0 on completion.
**Base:** master@0beb7da8b at run start (sim-food-economy round 1529-b). No sibling
landed mid-run, so no rebase was needed. Main tree verified clean at start; disk 25%.
**Arm:** r39's named next question #2, NOT a re-measure of the table approach
(r39 measured it) and NOT the pellet-vs-table tension (a Steve call, not a
measurement). **Driver:** `scripts/journey-scale-r40-20261026.js` (r39 driver,
labels/EVIDIR/mode only, PLUS one picker variant behind `WANT_SUBJECT=1`:
take `dlg:subject` at turn 0 when offered; every other turn, the policy, and
the engine inputs unchanged). **Analyzer:** `scripts/analyze-scale-r40-20261026.js`
(r39 analyzer + WANT section + tightened TABLE-VOICED filter).
**Proof test:** `scripts/test-journey-scale-r40-want.js` (static + synthetic-EVIDIR
functional; green before any sim).
**Policy:** `scripts/policies/scalecourt-nogate.js` — UNCHANGED. Standing
scalecourt.js untouched. Zero src/js change: r40 is measurement plus a
driver-picker variant.
**Pre-register:** `evidence/2026-10-26/journey-scale-r40-prereg.md` (written
before any sim; no corrections needed after the pilot).
**Seeds:** MATCHED to r30–r39: 85001–85004. Horizon DAYCAP=180, death-aware stop.
Pilot: Mode A 85001, then Mode B 85001, then the same-base control (r39 driver,
EVIDIR only changed, scratch dir `journey-scale-r40-controlrun`, never r39's own
dir) on 85001 — all passed the gate (no crash, pilgrimages = 4, transcripts
produced) before the remaining seeds ran.

## Pre-registered leg question

Is the want-treadmill a driver artifact or a system blank? r38/r39's flat talks
(seek_taken stage 0, ask_favor stage 2) named the want in the header and never
spoke about it. The r39 picker never selects `dlg:subject` — it is absent from
both ENGAGE and ENGAGE2 — so the talk never reaches the subject menu where
alive want items live. If subject-first talks surface the want, the flat
verdicts were the picker. If they still drift to gossip, the blank is the system's.

## Verdicts (binding — none re-scored)

- **WANT-CONTROL: MEASURED 8/8 with headers.** Every Mode A transcript carries
  want + stage + picker in its header. subjectPicked = false on all 8 — the
  control picker never once takes `dlg:subject`, confirming the r39 diagnosis
  exactly. aliveWantPicked = false on all 8.
- **WANT-SUBJECT: FIRED 2/2 WHERE OFFERED, silent otherwise.** Mode B picks
  `dlg:subject` at turn 0 in exactly the 2 transcripts where turn 0 offered it
  (85003-d120, 85004-d120), and in both it then picks the alive want item
  (`alive:want:ask_favor`, `alive:want:curious`). In the other 6, turn 0 was
  a hanging question (ans:/gq: answers own the menu by design) or a
  no-shared-language menu — `dlg:subject` was never offered, so the variant
  correctly did not fire, and those transcripts are byte-identical to control.
  The variant is proven to have fired where it could; it is not assumed.
- **WANT-SURFACING (the comparison): subject-first IMPROVES both talks it
  touches, and neither talk gets worse.** 85003-d120 (ask_favor stage 1):
  control commits straight from the opener and never hears the stakes;
  subject-first goes subject → alive:want → the wound's why
  ("It's getting worse, not better. If it festers I'm no good to anyone —
  can't haul, can't hunt, can't watch") → the same commit, now with a reason.
  85004-d120 (curious stage 0): control loops `dlg:more`/`dlg:react` ×7 on
  the restless thread ("somewhere better", "a way out", moving X's) and ends
  by leaving; subject-first breaks the circle into a real exchange
  ("Has this changed you? Like, fundamentally?" / mechanic-on-time vs
  alive) and closes on work, not on leaving. The subject menu is the door:
  where it opens, the talk gets better.
- **WANT-TREADMILL REPRODUCTION: NOT REPRODUCED — and that is itself the
  finding.** No r40 transcript, in either mode, is a stage-0 seek_taken or
  stage-2 ask_favor talk whose want never surfaces. The wants that appear are
  curious (7), seek_taken stage 1 (2), ask_favor stage 1 (2), and none (2,
  both Bruno no-language). The stage-1 wants surface through their openers in
  BOTH modes (Joshua's pods line, Pamela's clean-it-out ask). The r38/r39
  flat shape may be stage-gated, base-moved, or seed-luck — r40 cannot say
  which, and does not claim it. What r40 does establish: (a) the control
  picker never reaches the subject menu, (b) reaching it improves talks,
  (c) the one control talk that does loop (85004-d120) loops on a real
  thread, not gossip — a circling thread, not an ignored want. The next run
  that wants the original flat shape must hunt it deliberately (stage-0
  seek_taken / stage-2 ask_favor sittings), not expect it from these seeds.
- **TABLE-PARITY (method): GO — byte-identical.** r40 Mode A pilot 85001
  outcome line == same-base r39-driver control outcome line (day 181, over
  false, pop 2/2, pantry 9,361, lead 1/0, rank global, seat lesser, arc 4).
  The r40 instrument contaminates nothing. (Note: the driver's two outcome
  lines disagree with each other on `proposed` — 0 on the per-seed line, 1
  on the summary line — because the per-seed line reads ctx.proposedLead
  while the census falls back to ctx.proposed. Pre-existing driver quirk,
  same in both runs, not a parity break; parity is judged on the summary
  line, as r39 did.)
- **TABLE-REGRESSION (report-only): the r39 approach picture holds and
  strengthens on this base.** Mode A: lesser seat 4/4 (r39: 3/4), arc 4 4/4
  (r39: 3/4), waiting 4/4, announced 4/4, full seat 0/4, wave 5 0/4. At global:
  85001 sits seatless only on w3 0/3 (exactly r39's one-bar-short shape) and
  holds lesser from d123; 85002 and 85003 already hold lesser at global.
  85004 reaches lesser d152 at regional, never national. The table still
  waits unplayed in every seed (policy courts, never sits) — lane B's leg.
- **TABLE-VOICED-TIGHT (tooling): GO, live-proven for the pellet decoy.**
  Tightened counts (control 4/5/5/4; subject 4/5/6/4) exclude the pellet line
  ("It does not come out") while correctly KEEPING the true withdrawal line
  ("does not come. Not yet") and the genuine ARC IV beat line — the
  exclusion is precisely scoped, not a blanket /ARC IV/ drop. No standalone
  feast decoy ("Arc IV burns hotter") appeared in r40's captures, so the
  feast half of the tightening rests on the proof test's synthetic case,
  not on live data; reported as such, not as live-proven.
- **BOOK-TITAN (regression watch): GO — all booked.** Control: 8/8, 11/11,
  14/14, 0 events; subject: 8/8, 11/11, 16/16, 0 events. r36's fix holds.
- **BOOK-POOL: control 3/3, 0, 9/9, 0; subject 3/3, 0, 9/9, 0.** Pool booking
  holds where events occur.
- **PICK-G (picker-cap guard, inherited): GO in both modes.** Max consecutive
  dlg:more/goon ≤ 1 on all 16 transcripts; post-deflect goon = 0. Mode B's
  turn-0 subject pick does not interact with the cap.
- **BONDS/NATIONAL (report-only):** third bond by d110: control 85001/85002/
  85003 reached (seasoned covenants 3/1/2 at end; 85004 0 seasoned —
  seasoned-trust bar); national by d140: 85001 d88, 85002 d102, 85003 d132,
  85004 never; global: 85001 d98, 85002 d103, 85003 d133, 85004 never.

## Village assessments (plain words)

- **85001 control = subject (identical):** the village that made it to the
  table's door, twice over — national d88, global d98, three covenants
  seasoned, pantry 9,361, 2 villagers left at d181, lesser seat from d123,
  arc 4 and announced d124, overtime tier 6. It waits at the table with the
  seat open and nobody sitting. The two modes agree to the last line: where
  the talks never diverge, the worlds never diverge.
- **85002 control = subject (identical outcome line):** the village that
  courted itself to death, again — 20 pilgrimages, lesser seat from d93 at
  regional, global d103, arc 4 d94, announced d94, overtime tier 6 — and
  then the village empties, down to its last villager at d163 with an empty
  pantry. The seat outlived the village, again.
- **85003 control vs subject (diverged downstream):** control ends 3/3 alive
  at d181, pantry 1,055, national d132, global d133, lesser from d85;
  subject ends 4/4 alive, pantry 0, national d149, global d150, lesser from
  d85, and a wave-5 deed (w5 1, the run's only one). The day-120 talk is
  the fork — but the honest mechanism is the seeded RNG stream, not a
  proven talk-to-victory chain: different picks draw different random
  numbers for everything after, so downstream differences are observed
  divergence, not a causal estimate. One more villager alive and one
  wave-5 deed is the shape of that divergence, not a verdict on
  subject-first as a survival strategy.
- **85004 control vs subject (diverged downstream):** control ends 9/9 alive
  at d181, pantry 61,320, regional, 3 covenants (0 seasoned), lesser d152;
  subject ends 10/10 alive at d180, pantry 28,953, regional, 0 covenants,
  0 peer proposals (control: 4). Same RNG-stream caveat as 85003, louder:
  a single talk difference should not be read as causing a covenant
  collapse. What it does prove is that conversation choices are not
  cosmetic in this engine — they move the random stream the whole world
  runs on, and any mode comparison must say so.

## People check (SENSE-TESTING LAW — all 16 transcripts read in full)

- **85001-d90/d120 Irving (curious stage 1, both modes identical): GO, short.**
  A question answered honestly ("I heard them too" / "A real hot meal"),
  a warm specific reply (noises past the treeline; soup, with a spoon),
  clean closes. Same villager, same shape as r39 — the game's most reliable
  small talk.
- **85002-d90 Keisha (curious stage 1, both modes identical): GO, short.**
  Old-life skill exchange ("waiting — really waiting — is a superpower
  now"), a real answer back. A villager with a point of view.
- **85002-d120 Bruno (no shared language, both modes identical): MIXED —
  documented, not fixed (third appearance: r39 Kaushik, r40 Bruno).**
  The nod treadmill again (four nv:nod presses), but honest as far as it
  goes: glossed words accumulate ('Sí', 'verdad'), the mime is
  unmistakable (come with me to the hollow), the close is graceful. No new
  shared words are ever learned, so the conversation cannot escalate —
  part driver artifact (nod every turn), part system flatness. The
  subject menu is never offered in no-language talks, so subject-first
  cannot rescue this one; it needs its own fix (a gesture that teaches,
  or a word learned per sitting), not a picker change.
- **85003-d90 Joshua (seek_taken stage 1, both modes identical): GO.**
  The opener speaks the want ("About the taken. The pods."), the unsure
  answer is given room, the commit lands ("Even asking is more than the
  silence"). The taken-kin pattern from r36–r39 holds.
- **85003-d120 Pamela (ask_favor stage 1): control GO-short, subject
  BETTER.** Control: the ask is the opener, the commit lands, thank-you,
  done — correct but thin. Subject-first: the same commit, but after the
  wound's stakes ("festering... can't haul, can't hunt, can't watch").
  The favor now has a reason to matter. This is the run's clearest
  before/after pair.
- **85004-d90 Dorothy (curious stage 1, both modes identical): GO.**
  A dream exchange with a specific place in it (Columbus, Ohio; the
  street that keeps getting longer). A villager dreaming, not a menu.
- **85004-d120 Dorothy (curious stage 0): control MIXED, subject GO.**
  Control: the restless thread is real ("somewhere better", "a way out",
  maps with a moving X) but it circles — four more/react pairs, no
  question, no escalation, ends by leaving. Subject-first: the subject
  menu breaks the circle into a question exchange about being changed
  ("I don't recognize the person in my head anymore") answered with
  both-counts wisdom ("The old you got you here. The new you keeps you
  here"). Not a want resolved — curious stage 0 has no pressing want to
  resolve — but a conversation instead of a loop.

## Reachable / fun / winnable (leg 3)

- **Reachable: YES, further than r39.** Lesser seat 4/4, global 3/4, arc 4
  4/4. The road past national is walkable, the seat is earnable, and the
  game voices every stage of the approach on every seed that gets there.
- **Fun: SHARP, with a picker-shaped lesson.** The approach sings as in
  r39; the new lesson is about talks: the subject menu makes talks
  better whenever it opens, and the control picker never opens it. A
  real player would tap "Can I ask you something else?" — the driver
  should too, and r40 proves the improvement is real where it fires.
  The cruel edge remains the open seat nobody sits (policy, lane B).
- **Winnable: APPROACH-ARRIVED, finale unplayed.** Lesser seat + arc 4 +
  announced on 4/4 seeds; full seat 0/4; the win itself (sitting and
  playing a path) belongs to lane B's endgame leg. For lane A the leg
  question is answered: the treadmill's cause is isolated — the picker
  never reaching the subject menu — and the fix direction (a
  subject-reaching picker, or a want that surfaces without it) is proven
  on live talks, not asserted.

## Metric review

- No metric re-scored mid-run. TABLE-PARITY is judged exactly as
  pre-registered (same-base control, not r39's published numbers) and
  holds byte-identical on the summary line.
- **PILOT NOTE (no correction needed):** the pilot showed subject-first
  cannot fire when turn 0 is a hanging question — that is the menu's
  design (answering comes first), not a variant failure, and the prereg
  already scoped the NO-GO to "when turn 0 offered it". No bar changed.
- **DRIVER QUIRK (for r41):** the per-seed outcome line and the summary
  line disagree on `proposed` (0 vs 1) because they read different ctx
  fields (proposedLead vs the census fallback to proposed). Harmless here
  (same in both runs), but a future run should pick one field and print
  it in both places.
- **RNG-STREAM CAVEAT (method, for every mode comparison):** modes share
  the seed but not the random stream after the first divergent talk pick.
  Downstream census differences between modes are observed divergence,
  not causal estimates of the picker change. The transcript comparison
  is the clean estimate; the census comparison is not.
- **TABLE-VOICED-TIGHT, live vs synthetic:** pellet decoy excluded live;
  feast decoy excluded only synthetically (no standalone feast decoy line
  appeared in r40's captures). If a future run's captures contain one,
  re-verify live before claiming the tightening fully live-proven.
- **Telemetry check:** same-shape check quiet — `telemetry-check.js`
  against scale.json with metrics day, popAlive, pantryKcal: "quiet (4
  files, 3 metrics, no large deviations)". Baseline NOT rolled (panel
  baseline, journey aggregates — same standing note as r37/r38/r39). A
  journey-shaped baseline is still owed by a future run.
- **Test suites:** proof test green before sims (static + synthetic-EVIDIR
  functional); analyzer exit 0 on all 8 seed-runs (4 control + 4 subject);
  node --check green on driver and analyzer. check.js --quick: 278 passed,
  9 failed in 492s, zero EPERM mentions in the gate log. The 9 are r39's
  standing 8 (hide-discovery, measurement-comparison,
  measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, parity-20261014) PLUS one new
  failure: test-establishment-r20-fixes (racks-full voice gate — "next day
  voices once more: expected 2, got 1"). Verdict: NO regressions
  attributable to this run — it changes zero src/js and zero existing
  scripts (new files only), and the worktree shows no modified tracked
  files after the gate. The 9th failure flipped with the base between r39
  and r40 (287 scripts both runs; r39 279/8, r40 278/9); it is a new
  standing failure for the next run to watch, named here rather than
  silently absorbed into "the standing set".

## Next arms (named, not started)

1. **The picker should reach the subject menu (driver/tooling, r41's
   likely arm):** r40 proves subject-first improves talks where it fires.
   The control picker reaching `dlg:subject` — at turn 0 when offered, or
   after a hanging question resolves — is the cheap, proven improvement.
   It is a driver change, not an engine change, and it should be measured
   the same way (subject-picked rate + hand-read talks).
2. **The original flat shape, hunted deliberately:** stage-0 seek_taken /
   stage-2 ask_favor sittings where the opener never speaks. r40's seeds
   did not produce them; a future run should construct or select for
   them instead of hoping matched seeds do.
3. **No-language escalation (repeat pattern, third run):** Bruno, like
   r39's Kaushik, nods four times and learns nothing new. A gesture that
   teaches a word per sitting, or a shared-word counter that grows, is
   the fix shape — not a picker change, since no subject menu exists here.
4. **The unplayed finale (lane B's leg):** four villages wait with open
   lesser seats and overtime tiered (6/6/6/3). Lane A documents the open
   seat; lane B plays it.
5. **The pellet-vs-table tension (Steve call, carried from r39):** a
   pellet-fed village cannot prove the food thesis. Still his call.
