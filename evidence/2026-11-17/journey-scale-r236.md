# journey-scale r236 — scale leg (days 80–140), run 2026-11-17

**Leg:** scale (days 80–140, DAYCAP 140). **Run:** `playtest-a-20261117T1838Z`, Lane A.
**Branch:** `journey-scale` (base master `eb2d3714f`). **Seeds:** fresh 103701–103708.
**Policy (frozen):** `scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON, SIT false, sortie INERT.
**Prereg:** `evidence/2026-11-17/journey-scale-r236-prereg.md`.

## Verdict up front

**Q6 — INCOMPLETE. The run stopped at its own pre-registered rule, and did not build the fix.**

The question was whether the table's "mercy window" (the ~74 days after a village delivers a
capstone deed, when the table is quietly holding the seat open for them) wrongly freezes the
player's titan muster. On the last run's band it did: one village held its muster 78 days with a
titan standing right there. The fix was a new, read-only question the engine can ask — "is a table
sitting actually happening right now?" — so the muster only waits for a real sitting, not for the
whole mercy window.

On this band the mask never had a chance to bite. Only one village out of eight delivered a
capstone at all, and during its mercy window the only titan on the books was the finale beast,
which is never actually present in the world outside the finale — the muster held 19 days on paper,
but the titan wasn't there to fight, so the hold cost the player nothing. The other seven villages
never entered a mercy window at all. Worst "present-held" count: **0 on every seed** (bar was ≥7).

So the fix has nothing to prove itself against on this band, and per the prereg the run stops
here instead of landing a change proven against nothing. Arm B never ran. The fix itself is still
owed, and the proof test for it is already written and verified red (22/40 on the pre-fix tree —
every failure is the missing method; every tableActive control passes). It is preserved at
`hidden_files/evidence/2026-11-17/journey-scale-r236-table-sitting-test-RED.js` for the next run.

What the next run needs: a band where a capstone lands while a herald-class titan is still
present in the world. On this band that combination occurred 0 times in 8 seeds. The mask's
precondition is narrower than the last run suggested — it needs a delivered capstone AND a
present titan at the same time, and the finale titan does not count (it is never present outside
the finale campaign).

## The villages, in plain words

Eight villages played days 80–140 as a competent player. Five survived to day 140; three fell
apart before the end (day 96, day 110, day 138 — one down to a single survivor with an empty
pantry, one scattered after a betrayal and a contest death, one ground down by the wild).

- **103701 — the one that made it.** Reached national standing on day 109 through the trade
  road (three seasoned trade links), then global standing the very next day. Delivered its
  military tribute on day 108. Eight people alive at the end, full pantry, two wave-4 kills
  among the villagers. But: no full seat. The village had national standing, a delivered
  tribute, and two living wave-4 veterans at one point — and the table still never offered the
  full seat by day 140. The deed gate is still the wall.
- **103702 — steady but stalled.** Four people, lesser seat since day 51, tribute ready on day
  122 but never payable: ten attempts, all refused for lack of veterans. Its road to national
  needs one more seasoned lead link. It did call a muster once and marched — the titan fight
  never came off, but the march arrived.
- **103703 — the scholar carried it.** All four wave-4 kills were the scholar's; no villager
  killed one. Five people alive, lesser seat since day 47, never reached national (lead road
  needs two more seasoned links).
- **103704 — the unlucky one.** Three people alive, eight of its eighteen deaths to monsters.
  No wave-4 kills at all, no tribute ever ready. Survived, but barely.
- **103705 — the titan-slayer.** Two people left, but the muster slew a titan (the only
  march-completed titan kill that was also a straight fight). Five meetings with the titan
  ended in refusal before the kill came.
- **103706 — collapsed day 110.** Down to one person, pantry empty. It did slay a titan
  first (two muster days, one call, one kill) — then starved.
- **103707 — collapsed day 138.** Two people left. Fifteen refused titan meetings across two
  days (thirteen on one day), then a kill. The road to national was one seasoned link short.
- **103708 — collapsed day 96.** One person left, twenty deaths, seven of them to monsters.
  It slew a titan on its only muster call, then fell apart within weeks.

Band totals: 195 fights (98 wave-4), 14 wave-4 kills, 4 titans slain by muster, 122 deaths,
books closed on every seed (no unattributed deaths, no teleport-only deaths). Every village
reached stage 3 of the standing ladder; every village held the lesser seat (all 8 priced, bar
was ≥4/8). No wave-5 fights anywhere — the door never opened, though wave-5 beasts were seen
walking the world on 103701 (up to 9 a day, 33 days) without ever being fought.

## Q1 — national on-ramp: GO (measurement)

1 of 8 villages reached national (103701, trade road, day 109). The other seven were blocked
on link seasoning: their closest road needs 1–2 more seasoned links. Three collapsed before
they could get there. The on-ramp is open — the trade road carried a village to national and
then global in two days — but seasoning is slow and the villages that collapse never get the
chance. The full seat stayed out of reach on all eight: national plus a delivered tribute plus
two living veterans was still not enough for the table to offer it. That is the next wall, and
it is not this run's question.

## Q2 — guards: all HOLD

- **Vetbar:** 0 disagreements on all 8 seeds (GO).
- **Lived-days:** band mean 131.1 days per seed vs the control mean of 123 (+6.6%, inside the
  ±25% guardrail) — HOLD. Lesser seat priced 8/8 — HOLD.
- **Spoken-raise:** 14 raise talks, 7 properly answered, 0 defects (no talk spoken where the
  offer was never made) — GO.
- **Trap-line:** 3 nonverbal sittings, all answered, 0 defects — HOLD.
- **Nod-loop:** worst identical-reaction streak 3× (bar is 4×) — HOLD.
- **Betrayal sibling:** 4 turn-0 betrayal offers, invite label in the opening every time,
  0 defects — HOLD.
- **Daily-play mime (read-only):** 20 daily-play mimes in the capture; the lower bound on
  daily-play accepts is 0 (no walk lines outside driver sittings). The lane decision is still
  owed: teach the shared chooser to take betrayal:accept + nv:accept when offered, or keep
  proving fixes only where the driver looks.

## Q3 — muster and march: MOVED (measurement)

The muster slew 4 titans band-wide (one each on 103705–103708); 8 calls sounded, 18 ready
days, 16 villagers committed, 12 of them died afterward (mostly to the wild in the days after
the fight — that is the price, read against the kill gain, not gated). The march completed 4
titan fights, all 4 slain. The muster's usual blocker is still "short blades" (a coalition
1–5 fighters short), and the titan is simply absent on 180 of 360 titan days — the beast is
often not in the world to fight.

## Q4 — people check: PASS, with one documented blank

Read in full: 103701 day 120 (Muhindo, radio DJ, intense — asked "Did you leave someone
behind?", matched the player's "Yes" with a quiet "Me too", and deflected honestly: "I don't
talk about that... Someday. Not today."), 103701 day 90 nonverbal (Carolina, cook, speaks
only Spanish — a trap-line walk in mime, nods exchanged, one proud English word: "Shit."),
and 103702 day 90 (Paolo, fisherman — the trap-line invite with the betrayal label in the
opening, then a real ask: haul water at first light, 6 liters left).

**The blank:** in Paolo's sitting, "Tell me more" after his water ask repeats his ask
verbatim — "Water's almost gone — 6 liters. I need someone to haul water with me at first
light. Two of us, half the trips. Will you come?" — the exact same line as before, no new
information. The conversation still works (the ask is concrete, the commit defers for a real
reason, the closing line lands), but "tell me more" should deepen — why the water is short,
what happens if nobody hauls — instead of echoing the ask. Documented, not fixed this run:
it is a dialogue-content change, outside this run's panel scope. It belongs to a dialogue
pass, with the transcript cited (`journey-scale-r236-a-transcript-103702-day90.txt`).

## Q5 — census: recorded above

Five villages to day 140, three collapses. Deaths are dominated by the wild (the biggest
single cause on every seed) and monsters; the arena and contests take a steady few. No
bookkeeping errors anywhere: every death attributed, every teleport accounted for.

## Q6 — the blank: INCOMPLETE (see verdict)

- (a) Refusal spam, measurement only: worst day 14 refused meetings (103701, day 73) and 13
  (103707). Outcomes are still recorded on every refusal by design — the last run's fix
  deduped only the spoken line, and the spoken-line dedupe is proved by its own test (25/25),
  not by this panel.
- (b) Mercy mask: **NOT REPRODUCED.** Arm A mercy rows held: 19 (all 103701, all the absent
  finale titan), present-held: 0 on every seed. Arm B never ran. The analyzer's arm-B
  sections are "corpus unavailable" and its exit code 1 is solely the missing arm-B corpora
  (the arm-B "BREACH" lines for lived-days and lesser seat are artifacts of the missing
  corpus, not real breaches).

## Metric review

- The Q6(b) bar ("≥7 present-held mercy rows") proved its worth: it refused to let the run
  claim a reproduction on 19 held rows that cost the player nothing. The bar stays as written.
- The control lived-days mean used this run is 123 (r233's 8-seed mean, rolled forward per
  r233's metric review) — not the stale 119. Band mean 131.1 is inside the guardrail.
- Q6(a) has no bar by design (outcomes are recorded on every refusal) — the worst-day number
  is reported, not judged. That stands.
- The mercy accounting now runs over muster AND march rows (march rows carry no `present`
  field and are treated as present by construction). No march mercy rows occurred.

## Gate and telemetry

- **Gate (`check.js --quick`):** run by the adopting main session on the branch tip (1247s): **331 passed, 9 failed, 0 attributable.** Staleness pair (proof-update + workflow) inherited from the base — this run touches no `src/`; phone-frame (stale receipt) + ladder-bundle (ambient-raid control) standing; cache-flags + four exact-120s timeouts (living-garden, occupation-panels, one-person-army, trust-observer) = load artifacts (sibling gates running). Analyzer proof re-run by the adopter: **129/129**.

## Adoption (main session, 2026-11-17 ~14:13 CST)

The 11:45 Lane A occurrence timed out at closeout with the gate never run (the worker's "gate still running" report was mistaken — the `check.js` processes found in `ps` belonged to the sibling sim-profilegate-b arm; the hbloop was already dead and no gate log existed). Adopted: gate run by me (above), analyzer proof re-run 129/129, commit via safe-commit, rebase onto current master, proof re-run on the rebased tip, ff-merge. Rotation A 3→0, lock deleted after run_id verification, worktree released.
- **Telemetry:** one LOUD line — maxGameDay swung 124% (baseline 468 → current 1049, n=8).
  Adjudicated as the known file-count artifact: the baseline is a 4-seed-era sum, the current
  figure is an 8-seed sum; per-seed means are ~117 vs 131.1. fightsTotal and fightsByWave.4
  did not trip. **Baseline NOT rolled** — same reasoning as r233: its provenance is
  unrecoverable, and this band (3 collapses, 1 national) is not the band to re-anchor on. The
  re-baseline is owed from a clean 8-seed panel once the Q6 fix lands and both arms run.

## Tooling

- Driver/analyzer/proof tests committed in `badca626f` (tooling only, 4 files). The analyzer
  proof test ran 129/129 green. The `tableSitting()` proof test was written and red-verified
  (22/40: all 18 failures are the missing method; all tableActive controls pass) and is
  preserved in the goal evidence dir as `journey-scale-r236-table-sitting-test-RED.js` — it
  was NOT committed, so no failing test entered the tree.
- No engine change landed this run. `tableActive()` is byte-identical.

## Reachable / fun / winnable (scale leg)

- **Reachable:** the national on-ramp is reachable — one village walked it in two days. The
  full seat is not yet reachable on this band: national + tribute + two living veterans still
  earned no offer.
- **Fun:** the villages read like people (see the people check), the muster slew four titans,
  and the trade road delivered a real climb. The collapses are the usual shape — the wild and
  monsters grind small villages down before their links season.
- **Winnable:** not yet on this leg. No full seat on any of the eight, no wave-5 fight, no
  wave-5 door. The wall moved from "reach national" to "the deed gate opens after national"
  — that is the next question, and it is not this run's.

## Closeout

- Rotation 3 → 0 (scale done; next run is landing). Lock deleted. Heartbeat loop killed.
- Branch merged locally, pending ship (ship loop owns bump/push/live verification).
