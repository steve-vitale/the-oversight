# journey-scale r18 — the overtime ledger (2026-10-21)

**Run id:** playtest-20261021T080639Z (oversight-playtest-loop, LANE A, leg 3 scale).
**Base:** master e27eb6821 (worktree `journey-scale`, verified; branch base == master tip at registration).
**Rotation note:** journey-rotation-a.txt read "3" at run start. This run plays
leg 3 and writes back "0".

## INFRA (fail-loud, recorded)

- **Direct-push incident (LOUD):** at run start, `git pull --ff-only` failed —
  local master (58 commits) and origin/master diverged. Three commits authored
  "Steven Vitale" 02:15–03:05 CDT ("Track cultivated food through meals and
  save completed pack bites", "Record live garden accounting and prioritize
  missing harvest controller", "Preserve crop preparation and expose plant
  cooking in Pack") were pushed DIRECTLY to origin/master from dea9296f6,
  bypassing the ship loop — and origin/main was moved to the same tip, so
  live Vercel is now serving an unbatched push. This run did NOT reconcile:
  no rebase/merge of master, no push. Reconciliation belongs to the ship loop
  / main agent. Recorded here and flagged in the run report.
- Main-tree pre-flight: one untracked sibling evidence file
  (evidence/2026-10-21/sim-fleshout-20261021-0515z.md, flesh-out loop's, active
  run) — left untouched. Disk 22%. Reaper: 5/16 active (4 flesh-out sibling
  trees with uncommitted work + journey2-social lane B), none touched.
- Worktree registered via scripts/worktree-register.sh with
  WT_RUN_ID=playtest-20261021T080639Z (lock/registry run_id agreement, the
  2026-10-16 lesson). Heartbeat loop ran every 10 min for the whole run.

## PRE-REGISTER (MEASUREMENT.md §§9–12, 14 — written before any play or code change)

**Leg question:** after the table is announced, what does WAITING cost and
does the game speak it honestly — does each overtime tier stage aloud on air,
does the sitting audit name the delay tier and the price honestly (numbers ==
state), are the door standings really docked (state-verified, never
copy-trusted), and is any part a trap, a silent flip, or unfireable?

**The open gap (why this, not a re-run):** r17 played the table approach with
prompt sittings (tier 0 on all four) and named the next question: "does the
overtime line speak honestly at tier ≥ 1?" The overtime clock (TABLE.md,
2026-10-14: every 7 unseated days = +1 tier, cap 6; RERUN scaling, raid
knobs, seat price −4 standing/tier −3 per Haven loss, cap −40) was entirely
unplayed in journey sims.

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 staging — the table is announced (tableAnnounced) on ≥2/4 pilot seeds
  (substrate: r16 5/10, r17 4/4 with this policy). A seed that never
  announces is replaced, never a miss.
- M2 overtime honest — on every announced seed: overtime tier events fire at
  1 tier / 7 unseated days (System line on air captured, tier ==
  floor(days/7) capped 6), the sitting audit names the delay tier aloud,
  the offered door standings == undocked − 4·tier − 3·havenLost (cap −40,
  state-verified via a tier-forced-0 re-read of tableEarnedPaths at the
  sitting moment), no silent flip (a seat that takes or withdraws with no
  text is NO-GO).
- M3 people — ≥4 full transcripts sense-read (announce window, waiting
  days, sitting-adjacent), 0 senseless flags.
- M4 survival — ≥2/4 villages alive+coherent AT the sitting day (revised per
  r17 metric review: score at sitting, not d120 — post-sitting modal-open
  days are not natural play).
- M5 instrument-honesty — tablePreview() is a pure read: two consecutive
  calls return deep-equal results with no progState mutation between them
  (r1 instrument-honesty, the havenViewership() lesson).

**Interesting-finding bar:** the overtime price curve (tier → standing dock
per door, tier → raid/rerun texture); whether the System's on-air lines stay
honest at high tiers; whether a long delay can withdraw the seat (the beat
must fire aloud) and whether the approach still completes; any flattery or
any price the audit names but never charges.

**Policy:** belongfeast-watchfeast (r16/r17 continuity; FEASTSCALE_R13=1).
The Binding answered 'swear'; the Watchers answered 'feast'. Nothing changes
from r17 except the graded waiting driver.

**Seeds:** 18001–18004 (fresh, disjoint from r9–r17). Delays: 7/14/21/42
days → tiers 1/2/3/6 (R18_DELAY=7,14,21,42).

**Horizon:** DAYCAP=185, death-aware (+10d tail max; never tick a dead village).

**Substrate checklist (§14b):**
1. Contact: r17 sat 4/4 with this policy on this tip — the approach is live. PASS.
2. Pool sizing: engine-path exercise with state verification, not a lever measure — the pilot + graded delays suffice. PASS.
3. Verb existence: tablePreview/tableTakeSeat/tableEarnedPaths/overtimeStanding are the established idiom. PASS.
4. Horizon fit: announce d90+, max wait 42d → sitting ≤ d132 < 185. PASS.

**Kill verdict taxonomy:** an M2 miss is METRIC-BROKEN unless the autopsy
finds the price can't be state-verified from the Haven-panel idiom (then
CONCEPT-DEAD). A silent take/withdraw is NO-GO for the leg's canon.

## HARNESS

`scripts/journey-scale-r18-20261021.js` (built by the auditable transform
`scripts/make-r18.py` from the r17 instrument; `node --check` clean):
- graded waiting: sits on the first ready day ≥ announceDay + delay
- overtime-tier change watch (captures the on-air System lines per tier)
- seat-withdrawal watch (logs the beat if the seat withdraws mid-wait)
- at sitting: captures audit line, the overtime audit line, overtimeStanding
  state, door offer, and the UNDOCKED strengths (tier forced to 0
  momentarily — pure read, progState restored immediately, restore asserted)
- M5 pure-read check on every daily preview (unchanged from r17)

## RESULTS

### The overtime ledger — 4/4, every tier honest, every price charged

| seed | announce | sat (wait) | tier | penalty (4·t+3·l, cap 40) | audit names it | price state-verified |
|------|----------|-----------|------|---------------------------|----------------|---------------------|
| 18001 | d90 | d97 (+7) | 1 | −4 (0 losses) | "1 week kept waiting… standing −4" | 6/6 doors PASS |
| 18002 | d90 | d104 (+14) | 2 | −8 (0 losses) | "2 weeks kept waiting… standing −8" | 6/6 doors PASS |
| 18003 | d90 | d111 (+21) | 3 | −12 (0 losses) | "3 weeks kept waiting… standing −12" | 6/6 doors PASS |
| 18004 | d90 | d132 (+42) | 6 | −40 (9 losses; 24+27 capped) | "6 weeks kept waiting, 9 of Haven lost meanwhile… standing −40" | 6/6 doors PASS |

Tier cadence: exactly 1 tier / 7 unseated days on all four (d97/d104/d111/
d118/d125/d132 on 18004 — six events, tier == floor(days/7), cap 6 holds).
Every tier staged aloud on air with its own voice:
- ×1: "OVERTIME! The season was supposed to END. You didn't sit. So we kept the cameras rolling. RERUNS, folks — the hits, but HUNGRIER." + the ◈ price line (−4/tier, RERUN percentages, "Take your seat from Haven to stop the clock").
- ×2: "Ratings are UP! The audience loves a stall! The OTHER climax is warming up in the wings" (the tier-2 third-titan beat, per TABLE.md).
- ×3: "The producers are drafting something BIG. Map-sized." (the network foreshadow).
- ×4: "Raids every few nights now! Bigger packs! Is this cruel? It's TELEVISION."
- ×5: "We've stopped writing scripts. Everything is a rerun of a rerun and they all have teeth."
- ×6: "MAXIMUM OVERTIME! The table is still set. The chair is getting cold. Sit — or don't! We LOVE this!"
Each tier's ◈ line also names the live RERUN numbers (+25% HP/+12% dmg per
tier, pack bonuses) and the current standing dock — state-exact on all four
(e.g. ×4 said −31 = 4·4+3·5; ×6 said −40 = cap).

The sitting audit (tableScene) speaks the price on all four: "The table
notes the overtime: N week(s) kept waiting[, M of Haven lost meanwhile].
Every door's standing −N." The main audit line stays honest (waves/contests/
crises/rank all == seat detail, 0 mismatches — including 18004's "regional
standing" though the village never went national, and 18003's "national
standing" which it earned at d99).

Price verification (the copy≠trusted check): at each sitting, undocked
strengths (tier forced 0) vs offered: offered == max(0, undocked − penalty)
on all 24 door-seats. The dock bites visibly at the top: 18004's relay went
100→60→…→0 (offered standing 0, still offered as a door, prompt shows the
docked numbers: Feared 60, Witness 60, Assimilated 5, Defiant 24). The
Indispensable stayed priced-away (full-seat-only), never hidden, on all four.
No silent flips: 0 withdrawals in 4 seeds (the seat held through 9 Haven
losses on 18004 — the deed gate is robust to long delays), 4/4 sittings
staged the full scene aloud.

### M1 staging — GO (4/4 announced, d90 on all four)
### M2 overtime honest — GO (4/4: cadence exact, on-air lines captured per tier, audit names tier+price, 24/24 door prices state-verified)
### M3 people — GO (4 transcripts sense-read, 0 senseless)
- **Zahra d120 (18003, curious, trust 20):** opener reacts to the wait — "The table's here. The ring — the light — it's just sitting there. Waiting on you, as it were." The overtime context bleeds into conversation — excellent. Gossip is slice-of-life ("Sari headed out to check the snares"); one wrinkle: "Boris headed out for water" then "Tariq headed out for water" — same phrasing twice in 8 lines. The driver spammed dlg:more 7× and she drifted off honestly ("They're already drifting away. 'Later.'") — a fair close at trust 20. PASS.
- **Xiuying d140 (18001, seek_taken fromSeed):** wants news of her taken kin. unsure → "I'll ask the System about the pods." → "You'd do that? Ask it? ...Thank you. Really. Even asking is more than the silence." → "Come see what I found. You won't believe it." → warm close. Want resolved 'promised' — the obligation persists. PASS.
- **Dante d100 (18004, curious, trust 23):** "What's something you're good at that nobody here knows about?" → files the answer ("extremely useful"), shares his own gallows résumé, asks a small real favor ("Help me haul something back?"). resolution=engaged. PASS. (This transcript surfaced the {skill} blank — see BLANKS.)
- **Chae-yoon d140 (18002, curious, trust 36):** "Got a read on anyone here yet?" → "some people here are performing, not surviving" → "Watch the quiet ones." In-voice for a stoic exterminator, no fabricated history. PASS.
### M4 survival — GO (4/4 alive+coherent at sitting)
All four villages sat the table as going concerns (a Haven, a seat, a
player). Villager deaths before sitting: 9/11/5/17 — the wait bleeds (18004
lost 9 Haven people during its 42-day wait; the overtime losses counter is
honest). 18001/18004 lost their villages AFTER sitting (d183/d170, 6 and 3
post-sitting villager deaths: combat, contest, dehydration, starvation —
ordinary attrition, no post-table death spiral; both were thin at sitting).
18002/18003 survived to d177/d186. Per the revised metric (score at sitting),
4/4.
### M5 instrument-honesty — GO
tablePreview() pure-read check on every daily preview (8/15/22/43 previews
per seed): deep-equal, zero progState mutations. The undocked re-read
restored pg.overtime/pg.overtimeLosses on all four (asserted in-driver).

## FINDINGS

1. **The price curve is real and legible.** −4 standing/tier is gentle at ×1
   (−4) and brutal at ×6 (−40 cap): 18004's relay docked to 0, assimilated
   to 5. The audit names the number; the offer shows it; the state
   verification confirms the charge. PRICES ARE PRICES holds.
2. **The tier voices are the content.** Each tier has its own on-air line
   (stall → ratings → network foreshadow → television cruelty → rerun
   despair → maximum overtime). The ×2 line even stages the third-titan
   beat. Waiting is a show, not a spreadsheet.
3. **The seat does not withdraw under delay pressure (4/4).** 42 days,
   9 Haven losses, tier 6 — the deed gate held and the approach completed
   aloud. The withdrawal beat exists in code (table.js) but never fired
   here; a longer or loss-heavier run might find it. Named-next: force the
   withdrawal path and verify the beat fires aloud.
4. **The wait bleeds the village — that's the cost made real.** 18004's 9
   overtime losses are villagers who died while the player dithered; the
   audit says "9 of Haven lost meanwhile" to the player's face. The price
   is standing AND people.
5. **Wave-3 fight volume rises with waiting** (telemetry: 25→46 over 4
   seeds): more days in the window + higher roaming caps (+⌈t/2⌉) = more
   encounters. Mechanism as designed (see TELEMETRY).

## VILLAGE ASSESSMENTS — in plain words

- **18001 (regional road, sat d97 @tier 1, village lost d183):** bled early
  (9 villager deaths before sitting — combat, wounds, dehydration), sat the
  table with 4 left (Hector, Fanie, Leah among them), then attritioned out
  over 86 more days (combat, a contest, dehydration). A thin village that
  still walked the approach. What was missing: people — the wait didn't
  kill it, the early game did.
- **18002 (regional road, sat d104 @tier 2, survived d177):** the healthiest
  run — 8 alive at the end (Memuna, Caleb, Susan at trust 90), 11
  pre-sitting deaths but a deep bench. Regional the whole way; the table
  came on the regional bar again (r17's finding holds).
- **18003 (regional→national, sat d111 @tier 3, survived d186):** the only
  national road (d99–d124); The Binding answered 'swear' at d99. 5 alive
  (Leo, Álvaro at 90). Scholars to the bone — 514 plants known in r17's
  sibling seed; this seed's census shows the same shape.
- **18004 (regional road, sat d132 @tier 6, village lost d170):** the
  maximum-overtime run — 17 villager deaths before sitting, 9 counted as
  overtime losses, tier-6 RERUNs (+150% HP) in the field. Sat with 4 left
  (Rashid 60, Mamdouh 54, Yuting 46). The village paid for the wait in
  people and the audit said so aloud. Still walked the full approach.

## REACHABLE / FUN / WINNABLE (scale leg, the overtime ledger)

- **REACHABLE:** YES — 4/4 announced and sat at graded delays, including a
  42-day wait to the tier cap. The approach completes after any delay the
  game permits; the wait is one Haven-panel action deferred.
- **FUN:** the tiers are a show — each week the System gets louder and more
  desperate, the RERUNs get hungrier, and the audit reads the delay back to
  you with the body count. Waiting is priced in the open.
- **WINNABLE:** the price is standing, not the run — doors stay offered
  (even at 0 standing), the seat never traps, the clock stops when you sit.
  A 6-week wait costs −40 standing and 9 graves on one seed and the approach
  still completes. No trap, no silent flip.

## METRIC REVIEW (§14)

- M4 revised per r17's metric review: scored at the sitting day (not d120).
  Applied from the start of this run (pre-registered above), not mid-run.
- M2's price check needed the undocked re-read (new instrument); the
  first analyzer version compared against promptHtml standings only and
  flagged a false FAIL on 18004's relay (driver mapped strength 0 → null
  via `p.strength || null`). Fixed in the instrument
  (`p.strength == null ? null : p.strength`); re-verified 24/24 PASS. The
  fix is instrument-only, no game code.
- The relay's promptHtml reason was truncated by the driver's 800-char
  slice (instrument limit, not a game gap); the door's option and docked
  standing (0) were captured via tableChoices/tableEarnedPaths.
- No metric was re-scored mid-run.

## TELEMETRY

`telemetry-check.js` vs `scale-belong.json` (4 seeds, 10 metrics):
4 LOUD lines, all investigated same-run:
- `markerCounts.theBinding swung -86% (14 → 2)`: EXPLAINED — content-draw
  variance (r17's established finding: the baseline's hits come from "The
  Oath" contest text). The Binding beat itself fired and was answered on
  the one national-road seed (18003 d99 'swear'). No beat regression.
- `markerCounts.demand disappeared (251 → 0)`: EXPLAINED — instrument gap
  (r14–r18 family defines no demand marker; the 251 comes from an older
  baseline corpus). Same as r16/r17.
- `tableTele newly appeared (0 → 4)`: EXPLAINED — `table_entered`
  telemetry fires at each sitting. r18 sits the table; r16 never did.
  This is the run's own signal, not a regression.
- `fightsByWave.3 swung +84% (25 → 46)`: EXPLAINED — the graded waits add
  7–42 days of scale-window exposure and overtime tiers raise the roaming
  monster cap (+⌈t/2⌉); more monsters for more days → more wave-3 fights
  (r17: 25/4 seeds, all sat ≤d102; r18: 46/4 seeds, sat d97–d132). The
  mechanism working as designed; 4-seed variance.
Baseline NOT rolled forward (all deviations explained).

## BLANKS

1. **FILLED — the {skill} stub (game-code fix).** Dante's d100 transcript
   (18004) rendered "I can making do. Not well — …" — fillTalkLine
   hardcoded `{skill}` → 'making do', ignoring the villager's actual
   lifeseed human skills. Fix (src/js/game.js): {skill} now renders the
   villager's first lifeseed skillOrigins key as an activity noun
   (trapping, field medicine, weather-reading…), fallback 'making do'.
   The noun form was chosen because {skill} appears in 10 templates with
   different frames ("I can do {skill}", "The trick to {skill} is
   confidence", "This week it's {skill}") — the noun fits them all.
   Companion data fixes (src/data/characterGen.json): the q_skill deeper
   template "I can {skill}." → "I can do {skill}." (grammatical with the
   noun), and the small-talk line "The System gave me {skill}." →
   "I taught myself {skill}. The System was no help — …" (the old line
   contradicted HUMAN SKILLS vs ALIEN ABILITIES canon once the slot
   became real — the System doesn't grant earthly skills).
   Proof: scripts/test-skillslot-20261021.js — RED on pre-fix code
   ("making do" in every frame), GREEN after (20 frame checks across 11
   villagers + data assertions). Ontology gate: 123/123 validated.
2. **Documented (instrument-only):** the favor-menu precedence blank from
   r17 reproduced (Jesse d120, 18001: ask_favor stage 2 fromSeed, turn-0
   offered only betrayal/leave — stated favor unanswerable that sitting;
   persists via fromSeed). Still a candidate for a social-loop run; no
   game-code change here. The Vasyl language-barrier bail (driver offered
   no nv:* choices at turn 0) fixed in-harness (nv:nod/smile/pointself/
   listen added to ENGAGE).
3. **Named-next:** force the seat-withdrawal path (deed re-check with a
   failing seat during a long wait) and verify the withdrawal beat fires
   aloud; probe whether the ×6 relay-at-0-standing door is still winnable
   (lane B's path-play domain).

## FILES

- Harness: `scripts/journey-scale-r18-20261021.js` (built by auditable
  `scripts/make-r18.py` from the r17 instrument; `node --check` clean)
- Proof: `scripts/test-skillslot-20261021.js` (RED→GREEN verified)
- Fix: `src/js/game.js` (fillTalkLine {skill} wiring), `src/data/characterGen.json` (2 template fixes)
- Evidence: `evidence/2026-10-21/journey-scale-r18-belongfeast-watchfeast-1800{1,2,3,4}.json`
  (4 seeds) + `-transcript-1800{1..4}-day{80,100,120,140}.txt` (16 transcripts; 4 sense-read)
- Analyzer (outside repo, not committed): `~/workspace/journey-scale-r18-analyze.py`
- Ontology: `node scripts/validate-ontology.js` → 123/123, release permitted.
- No src/js changes beyond the fillTalkLine fix. Merged locally, pending ship.
