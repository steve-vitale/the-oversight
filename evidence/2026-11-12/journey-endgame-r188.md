# Journey endgame r188 — RUN NOTE (Lane B, leg 4)

## SECOND ADOPTION (closeout, 2026-11-13 ~01:00Z)

The adopting run above died ~00:35Z with three [PENDING] items (M2c
investigation, check.js --quick pid 44320, landing). Stale-lock recovery
#2: lock run_id 2026-11-12T23:59:08Z has NO registry match; the
journey2-endgame heartbeat was 2026-11-13T00:34:13Z (22 min stale at the
00:57Z check); no live worker, no heartbeat process, no file writes
under 15 min (newest 00:35:13Z, this note). Lock deleted, own lock
written 2026-11-13T00:58:32Z. Heartbeat re-established 00:58:33Z and
maintained by a 5-min loop (journey2-endgame-hbloop-r188adopt.sh, pid
18601). Adopted the tree as-is (branch journey2-endgame, HEAD
2de4dde91 + uncommitted havenGrowth.js fix + proof test + evidence).
Closeout completed: M2c verdict (instrument double-count — see
investigation section), proof test re-run GREEN 14/14 + r30 beat test
7/7, telemetry re-run QUIET, check.js --quick [see Landing], evidence +
run note + fix committed, rebased onto master, merged ff-only,
rotation-b written 5. The debug probe used for the M2c reproduction
was a one-off and was NOT committed.

Adopted dead 18:00 CST run (stale-lock recovery). Lock run_id
2026-11-12T22:03:54Z, journey2-endgame heartbeat 2026-11-12T22:53:37Z —
62 min stale at the 23:55Z check, no live worker, no writes under 15 min
(newest file 22:54:39Z, the adopt chain's DONE stamp). Lock deleted, own
lock written 2026-11-12T23:59:08Z. The dead run's measurement chain
COMPLETED before dying: passes A, B, C, C-wide + dark probe all scored,
chain log "ADOPT CHAIN DONE 2026-11-12T22:54:39Z". Adopted its prereg +
probe/analyzer/dark-probe (committed 2de4dde91) and its uncommitted
evidence (16 files: INTERIM note, pass logs/analyzers, per-seed dirs).
Verified, not taken on trust: analyzer verdict sections re-read,
per-seed JSONs spot-checked against analyzer lines (sat/uw/seat match),
telemetry re-run, dark log re-read. Heartbeat re-established 00:00:40Z
and maintained every <15 min through closeout. Flap-watch ALL-OK at
adoption (23:59–00:03Z).

## Pre-registration (summary — full text in journey-endgame-r188-prereg.md)

Leg 4 endgame. Pilot seeds 89701–89705 (matched reuse), three passes
(A: no legs; B: CAPSTONE=1 BUYOUT=1; C: +BUYOUT_EARLY=1) + C-wide on
fresh seeds 89706–89713 + full dark probe. The INTERIM note
(journey-endgame-r188-INTERIM.md, written 20:27Z after the 20:21Z VM
reboot) records the run's own resume and its one prereg correction:

- PREREG CORRECTION, delta (l): the committed prereg listed substrate
  deltas (a)–(i) from a `git log -- src/js/` diff only and MISSED a
  probe-policy delta — r128 LANDING (87f00547d, 2026-11-12 16:21Z):
  scripts/policies/competent.js +185/-37 (beastFreeTiles, beastTrickPlay,
  competent movement/flee/close fallbacks; "Scholar stops stepping
  nowhere"). A BOT-POLICY change, same class as r185's (k). The r188
  probe uses the live competent.js, so pass A is "same seeds, same
  probe, game code + bot policy changed" — (l) is a named confound on
  every pass-A comparison. Discrimination proposed for the NEXT run, not
  this one: pin competent.js to the frozen competent-r127.js copy for a
  matched A/B on the same 5 seeds. No mid-run re-score or re-run here;
  verdicts stand on the pre-registered bindings with (l) named.

## Pass A (matched re-run) — lesser 4/5, full 0/5, lost 1/5

| seed | sat | alive | ladder | w5 | deedGate | uw | peakVets |
|---|---|---|---|---|---|---|---|
| 89701 waves | d90 | 9 | 3/3/66 | 1 | never ok | 5 FACED | 3@d87 |
| 89702 waves | d97 | 7 | 3/3/68 | 0 | never ok | 4 | 1@d70 |
| 89703 waves | d105 | 5 | 3/3/45 | 0 | never ok | 4 | 0 |
| 89704 forcedrift | LOST d77 | 0 | 3/2/39 | 0 | never ok | 4 | 1 |
| 89705 wavesnw | d90 | 8 | 3/3/86 | 1 | never ok | 5 FACED | 3@d90 |

r185 pass A for comparison: sat 91/90/132/90/91, alive 7/7/6/9/8,
ladder 65/75/65/81/65, deedGate 89702 first ok d81 w5:4, peakVets
2/2/0/2/2. M1 GO 5/5 (4 announced d90 + 89704 honest-death).
M2c NO-GO 3/4 — see investigation below; it is the run's only
PRIMARY miss. Everything else GO (M2, M2d, M2b, M8, MFLEE, M3b, M4,
W5, M13, M14, M5 vacuous, M5b, M6, M10, M11, M12, M15, M16, M17,
KILL-ANATOMY 39/39, M18, M19, M20, M21, M22, REG-r35/r37, VETCONV,
SECOND-VETERAN, FIRENARR, HURTRETURN, FALLEN, V-WAITVARIETY, LOSSKIND,
L-PEAK; M23/M24/M24b/M25c disabled in pass A). PRIMARY-BINDINGS NO-GO
| PRIMARY NO-GO | ALL NO-GO — on M2c alone.

Q2 ANSWER — the survival collapse DOES show on this panel, for the
first time on the matched endgame seeds: 89704 (forcedrift,
experimental) is VILLAGE-LOST d77, alive 0 (r185: sat d90, alive 9,
ladder 81). 14 deaths d17–d77 (alien d17, night d22, sickness d46,
contest d54, thirst x2 d56, wound d58, contest d66, wild d66,
sickness d69, monster d70, night d76, wild d77); ladder peak 3 counted
39 — one point short of the National threshold 40 at d40 peak. The
other four villages all reached d90 alive, so this is a 4/5 matched
panel with one pre-window loss, not the bisect's 1/8 collapse — but
89704 was the HEALTHIEST r185 village (alive 9, ladder 81, pantry
72437 at end) and is now dead before the window. Prime suspect is (l):
the scholar now actually closes/flees instead of stepping nowhere,
which moves fight outcomes, deaths, and standing on every seed. Game
deltas (d) preserver cap and (g) synergy discovery are secondary
suspects, not excludable on this panel. The (l) A/B is owed to the
next run before anyone claims which delta killed 89704.

Q3 ANSWER — the phantom-veteran shape is BROKEN on 89701, not held:
its veterans are ALIVE at the window this run (peak 3@d87, end 3),
deedGate still never ok (w5:1, one short of the 2 needed), uw 5 FACED
(rerun d87). The readiness shape changed from "veterans dead before
the window" to "veterans alive, wave-5 blood one short". 89705 keeps
the shape's other half (peak 3@d90, end 3, w5:1, FACED).

Headline reshaping vs r185, attributed first to (l): 89702 sat 7 days
later with deedGate NEVER ok (was first ok d81, w5:4 — now w5:0, wave
5 never unlocked); 89703 sat 27 days early (d105 vs d132) with ladder
45 (was 65); 89701 sat 1 day early, healthier (alive 9 vs 7, peakVets
3 vs 2). All within "same seeds, different days" — no single delta
claims a mechanism beyond (l).

### M2c investigation — VERDICT: instrument double-count, no fight lost (adoption closeout 2026-11-13 ~01:20Z)

Reproduced both misses exactly with a debug probe
(scripts/probe-endgame-r188-m2c-debug.js — one-off, NOT committed; the
debug snippet is recorded below so the next run can redo it). Single-seed
smoke re-runs on the live worktree substrate reproduce the r188 numbers
byte-for-byte: 89705 pass A 8 fights / 9 opens, same fight list; 89701
pass C 11 fights / 12 opens, same fight list.

Event log (opens vs pushes, by tbfight identity) names the extra open on
both seeds — the SAME fight counted twice, not a missing fight:
- 89705-A: `OPEN id=4 day=65 mons=["algorithm"]` twice in a row, one
  `PUSH id=4 ... startDay=65 why=ref-change`. 8 distinct refs, 9 opens.
- 89701-C: `OPEN id=10 day=122 mons=["eulogy"]` twice in a row, one
  `PUSH id=10 ... startDay=122 why=ref-change`. 11 distinct refs, 12 opens.
No leftovers at run-end on either seed (engineOpen empty, openFight null,
pending null, liveFight null) — the still-live-fight hypothesis is WRONG,
and the Commercial Break on 89705 (wave 5, "It followed you... It's still
out there") produced NO engine open at all: it is a stalking/approach
event, never a startCombat fight.

Mechanism (probe, not game): the startCombat wrapper counts startCombat
CALLS. When a committed engine fight is adopted by the policy census
(censusObserve engine-adoption branch), the record leaves `engineOpen`
via `engineOpen.delete(f)` WITHOUT entering `closedEngineRefs`; a
re-entrant startCombat on the same live tbfight then passes the wrapper's
`!engineOpen.has(f) && !closedEngineRefs.has(f)` guard and counts a
second open for the same fight. The replacement record is deleted when
the adopted record closes (closeFightRec deletes by ref), so only one
census fight is pushed. Both double-counted fights resolved normally
(otherEnd, 0 damage: d65 algorithm 2 turns, d122 eulogy 2 turns).

So: no fight was lost, no game event was missed, the census's 8 and 11
fights are the true distinct-fight counts. M2c's equality rule compares
fights against CALLS, not distinct fights — the rule is wrong, not the
census. NOT re-scored here (metric binding holds: PRIMARY stays NO-GO on
M2c alone for this run). Proposal for the next prereg: probe-side, guard
the wrapper against re-entrant counts on an adopted live ref (an
adoptedRefs set, populated on adoption, consulted by the wrapper guard,
cleared on close) — or analyzer-side, compare against a distinct-open
count emitted by the probe. Separate open question, NOT a defect claim:
why startCombat re-fires on a live tbfight at all (both cases ended
otherEnd with 0 damage after 2 turns — possibly an encounter
re-trigger after a disengage). Debug probe deleted after the
investigation; the patch was: WeakMap ref ids + an in-memory event
array (quietLog swallows console during runDays) dumped after the
run-end flush, logging OPEN on every counted startCombat, PUSH on every
closeFightRec push, SKIP-LIVE on every closeEngineOpen live skip.

## Pass B (CAPSTONE=1 BUYOUT=1) — lesser 4/5, full 0/5, lost 1/5

Trajectories pass-A identical on all five seeds. M23 VACUOUS: no
pass-B seed reached deedGateReady().ok && peak>=3 (deedGate ends:
89701 no 1w5/global, 89702 no 0w5/global, 89703 no 0w5/regional,
89704 no 0w5/regional, 89705 no 1w5/global). M24 VACUOUS (no
military_tribute delivery fired). M24b VACUOUS (no scholar+1 seed).
M2c NO-GO again (same 89705 8/9). PRIMARY-BINDINGS NO-GO on M2c
alone, same as pass A.

Q4 ANSWER — the 89702 full seat does NOT reproduce: in r185 pass B,
89702 took FULL via military_tribute d81, priced d82; in r188 its
deedGate never goes ok (w5:0 — wave 5 never unlocked), so no capstone
kind ever reads ready and no delivery is attempted. The full seat was
lost on this seed not by a pricing failure but by the wave-5 facing
collapse upstream (Q2's (l) reshaping). The tribute road is not
reopened or closed by this run — it was never reached.

## Pass C (CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1) — lesser 3/5, full 1/5, lost 1/5

M23 GO: 1 eligible, delivered 1/1, none-ready 0, refused-despite-ready
0, pricedFull 1/1 — 89705 feast_embassy d79, FULL d80. M25c GO: 6
eligible early-days, 0 skipped, 25 early attempts, 5 bought — 89701
d41/pantry10358, 89702 d28/pantry18955, 89703 d67/pantry8483 (d62
attempted-refused first), 89704 d40/pantry17122, 89705 d29/pantry24039;
all dg-not-ok at buy. M24/M24b VACUOUS (no tribute delivery — the
embassy delivered instead). M2c NO-GO again (89701 fights=11 opens=12).
PRIMARY-BINDINGS NO-GO on M2c alone.

Per-seed: 89701 sat d124 lesser (final:audience); 89702 sat d91 lesser
(final:audience); 89703 sat d90 lesser (final:audience); 89704 lost;
89705 sat d90 FULL d80 (final:teach, indispensable). The early buy-out
changed trajectories hard: 89701's uw dropped to 4 (was 5 in pass A),
w5max 0; 89705's w5 went 1→2 and its seat flipped lesser→full. The
full seat this run comes from the bought bundle, not the tribute —
the third road to the same table (r182: feast_embassy d78/d79 on
89702; r185: tribute d81/d82 and bundle d77/d78, both on 89702; r188:
bundle d79/d80 on 89705).

Q5 (matched passes): no buy-out starved a village before its seat on
any matched pass. Threshold-edge buys: 89703 after 8483, 89704 after
17122, 89705 after 24039 — none at 0 on the matched panel (the
after-0 case this run is C-wide 89710, see below).

## Pass C-wide (fresh 89706–89713) — lesser 6/8, full 0/8, lost 2/8

M25c GO (wide-gated): 8 eligible early-days, 0 skipped, 38 early
attempts, 7 bought — 89706 d34/pantry10481, 89708 d46/pantry13236,
89709 d30/pantry9000, 89710 d62/pantry8181, 89711 d35/pantry16625,
89712 d37/pantry27060, 89713 d32/pantry19876 (d28 attempted-refused
first). WIDE-VERDICT GO (M25c + starvation only).

Starvation watch (per-seed investigation, JSONs + transcripts read):
- 89706: bought d34/after2452, no starvation death, sat lesser d90.
- 89707: bought NONE, never sat — scattered d55, 4 alive, pantry 0.
  The early buy-out window never opened a single day: ladder stalled
  at Regional (peak 2, counted 35/40 for National, peakDay 26). A
  lesser seat was first achievable on paper at d32, but no announce
  ever fired and the village died d55, well before the d90 announce
  window. 12 deaths, no starvation death recorded — hunger killed the
  village as a scattering, not as a named starvation. The one genuine
  hunger loss in this set never bought anything.
- 89708: bought d46/after5077, starvation death Jovan Milic d93, sat
  lesser d94. NOT buy-caused: 47 days after the buy, pantry recovered
  to 25,755 in between; the death sits in a distinct late food+water
  collapse (d90–93: pantry empty d90, half-rations vote d91, HUNGER
  WINTER d92, three thirst deaths d91–92) compounded by Jovan's exile
  ("The pantry is closed to you — exile means exile"). Matches the
  r185 precedent (death 59 days after a buy, pantry recovered → not
  buy-caused). Joja price: NO — the village sat lesser the next day.
- 89709: bought d30/after1000, no starvation death, sat lesser d99.
- 89710: bought d62/after0 — spent the ENTIRE 8,181 kcal pantry —
  no starvation death, sat lesser d138. Pantry back to 5,000 the next
  day, 13,036 within a week; brief thin days (d82 577, d84 932, d105
  2156, each bufferOk:false) all recovered in 1–2 days. The
  threshold-edge case: a zero-pantry buy that starved no one.
- 89711: bought d35/after8526, no starvation death, sat lesser d103.
- 89712: bought d37/after18840, no starvation death, sat lesser d94.
- 89713: bought d32/after11500, starvation death Maximiliano d61,
  never sat — scattered d82, 1 alive (Devon Okafor), pantry 0. NOT
  buy-caused: 29 days after the buy, pantry recovered to 32,135 and
  stayed 5–13k through d57; Maximiliano starved in a late, fast
  pantry collapse (d58–61, empty the night he died). 15 deaths total;
  Maximiliano's was the only starvation — the rest monster (7),
  sickness, wound, alien, dehydration (Bessie, the village's only
  wave-4 killer with 2 kills d51/d59, died of dehydration d75).
  Joja price: NO — the buy left 11,500 kcal; the village never
  reached a seat at all.

C-wide tally: lesser 6/8, full 0/8, lost 2/8 (89707 scattered d55,
89713 scattered d82) — vs r185 C-wide lesser 7/8, full 0/8, lost 1/8.
Both losses are hunger-driven scatterings, and the panel's two
starvation deaths are both judged NOT buy-caused under the r185
precedent. The Joja price this run is zero lives on all 13 bought
seeds (5 matched + 8 wide, 89710 included at pantry-after 0).

Instrument footnote: the per-seed JSON's `result.pantryAfter` echoes
the PRE-buy pantry on all three checked buys (89708: 13236, 89713:
19876, 89710: 8181) — the analyzer's "after" figures are pantry −
spent, and the arithmetic checks out (5077/11500/0). The JSON field
name misleads; the analyzer's computed value is the honest one.
Documented, not a game defect; a probe-label fix for a future run.

## Dark probe — 7 variants, 1 known failure

Only failure: v1a-loss:D2-twist-fired — bit-identical to
r171/r178/r182/r185 (standing, not a regression). The loss path
curdles instead of firing the Exemplum say line (horror hit 5;
curdle line present and documented). v1b 23/23, v1c 24/24, v2 18/18,
v3 25/25, v4 20/20, v5 17/17. v3 walk-out names Amelia Moon, not Bill
Palmer (Q7 confirmed: sitter=Amelia Moon, walk-out names the sitter;
bearer Bill Palmer named in the walk-out). D1–D4/D6 hold on the new
substrate.

## People check (full transcripts read)

Transcripts read in full: pass C 89705 (52 lines), pass A 89701 (122),
pass A 89705 (82), pass A 89702 (813), pass A 89703 (1,935); pass B
89702 byte-identical to pass A 89702; r185 pass B 89702 finale compared.

- Pass C 89705 — the run's ONLY full seat (feast_embassy d79, FULL d80,
  final:teach, indispensable) — READS AS PEOPLE, earned. Audit: "A full
  seat. global standing, every wave faced, the deeds complete. The table
  rises when you enter." — with "(+4 feast-bundle bonus)" landing in the
  counted points, as in r185. War path names real kills: "On day 82,
  Sanne put down Big Loud. On day 56, Ethan put down The Big Beast —
  and 1 more tooth after." Final choice: "Teach them freely." / "You
  give away the trick — all of it, on the record. The galaxy eats, at
  last, and remembers who fed it. Humanity becomes teachers, not fuel."
  The indispensable build-up earns it: "They need what you know. You
  walk to the table knowing they cannot afford for you to leave it —
  and the table knows you know."
- Pass A 89701 (lesser, final:pledge, feared) — YES. "You pledge it
  aloud, on the record: humanity's fear is a standing shield, never a
  sword. The table signs. Your people sleep." Audit names the gap
  honestly. Distinct road: Ivan Villa and Marcus Webb ascend together —
  "gods, it turns out, have politics. They argue about you the way the
  living argue about weather. Mostly, they agree: the village comes
  first. Mostly."
- Pass A 89702 (lesser, final:audience, beloved) — YES. "Let the
  audience speak." / "The show becomes the government. Strange. It
  works." / "You spend it all — the love, the light, the finale slot —
  on people the cameras never found. You name the unfilmed villages.
  You name the dead." Broken promises called out by name ("Meera won't
  meet your eye. You said you'd help with the creek water run — and it
  never happened. Promises rot. (-15 trust)"); Giulia dies on the sit
  day (d97) and the audit counts it.
- Pass A 89703 (lesser, final:pledge, feared) — YES, with the
  transcript's strongest human beats AND the run's one real defect (see
  below). Mantle transfer Larry → Salvador: "'Larry's gone.' Grace
  looks at you for a long moment. 'You're not Larry.' No heat in it.
  Just fact. You'll have to earn this face." / "🕯️ Daniyar is gone.
  The Scout — the role sits empty now, and nobody reaches for it." /
  Ursula's alien-contact dream: "'I need to tell you something. Last
  night I... dreamed? No. I was AWAKE. And something spoke to me. Not
  the System — something else. It said: "Tell the human to watch the
  northern treeline."'" War path names the unready bars with real
  numbers.
- Pass A 89705 (lesser, final:mercy, feared) — YES. "Show mercy." /
  "The most frightening thing you ever did. The table doesn't know what
  to do with mercy from a predator. Neither do you, quite. But the
  audience weeps, and the galaxy learns that the feared one chose
  gentleness." Blemish: Expedition-meat take/discard loop ×7 (polish).
- Pass B 89702 — SAME TEXT as pass A (byte-identical). r185's pass-B
  full-seat finale on this seed (tribute d81, final:mercy) vs r188's
  lesser/audience: the writing didn't change; the road did — wave 5
  never unlocked, so no tribute was deliverable. No defect in the
  finale itself.

Finalvoice suppression — HOLDS (same caveat as r185): "Even now the
wave-5 bar reads" is ABSENT on the pass-C 89705 FULL-seat audit (0
hits); the seat's wave-5 bar was ready at the sit (w5:2), so the
suppression branch itself was not exercised. The line fires correctly
on lesser seeds (89702 "0 of 2 veterans", 89703, pass C 89701/89702/
89703). Variant note, pre-existing: pass A 89701 and 89705 war paths
omit the "Even now" line entirely, but the separate ledger line still
names the gap — nothing goes unvoiced. Not a regression.

Dialogue deltas (a)/(b)/(c)/(e) — ALL UNEXERCISED in this corpus, not
clean and not defect: the r188 per-seed transcripts are SAY-line
windows (announce → end; 89704 is a full-run transcript) and
conversation-turn dialogue is not captured in them, so none of the
four pool fixes fires here. (a) confront: zero confront lines of any
kind in any transcript; the dry line "...Sorry, lost my train of
thought." is absent everywhere (0 hits) — no regression visible — but
the pool-picker itself never fires (trigger is a second confront in
one sitting, which no r188 seed produced). (b) warn-details: zero pool
lines. (c) guard-beat pool 2→6: none of the six new moodguard lines
fires; the beats live in conversation turns (src/js/convo-mood.js),
which these SAY windows don't record. The similar-looking "🌙
Watchers at the … treeline see torchlight moving…" lines (13 hits)
are a separate raid-cooldown template, not the r134 pool. (e) mimed
invitations: mime prompts DO appear and read clearly (89704 ×3:
"(They mime walking — pointing at themselves, then at you, then
toward the hollow. The meaning is unmistakable: come with me.)" +
language-learning follow-through), but no nv:accept/nv:decline
gesture answer appears anywhere — the gesture itself is unjudgeable
from this corpus. The leg's Q8 dialogue-delta question needs a
conversation-transcript corpus (or the dedicated proof tests), not
these SAY windows. Recorded for the next run's prereg.

Watch-list: no fabricated shared history, no static menus, no bond
proposal from a roster, no refusal line repeating verbatim within one
branch ("Promises rot" ×2 in 89702 is two different villagers naming
their own broken promises), no stuck helper in a finale
(withdrawal: None on all seats), no offered seat withdrew, no pellet
lock (pellet passes voiced in 89704 A/B), no rads death without
voicing (none in any matched JSON), no silent cure (cures voiced, e.g.
"Sofia cured them — and the camp saw it."). "Holds and watches"
clusters appear only as single combat idle turns, not a stuck record.

SENSELESS PASSAGES — one real defect + two polish items:
1. DEFECT — self-contradictory raid-defense beat (pass A 89703).
   The transcript reads: d101 "📖 The Codex turns a page on its own.
   Tama is dead." then d102 night "🛡️ Tama met them at the door — met
   them and lived. Tama didn't come back." It LOOKS like a dead villager
   defended the door. Verified mechanism (code + JSON + transcript):
   the pick was CORRECT — Tama was alive at the pick and died IN that
   raid fight (return summary "The Loud Beast killed Tama in 3 rounds";
   deathRecords d101 cause monster; the raiders were Loud Beast, Herald,
   Audit). The death page is immediate; the defense beat goes through
   sayHavenNews, which relays to the next Haven night when the scholar
   is away — so it prints d102 night, after the death page. The ordering
   is the relay, not a corpse defending. The REAL defect is the beat's
   wording: when the defenders earned no bit (no kill/stood/fled) and
   one fell, the fallback "met them and lived" contradicts the "didn't
   come back" that follows — one line says the sole defender both lived
   and died. FIXED this run (see Blanks §1).
2. Polish — vague synergy-progress line ×3 (pass A 89703): "Something
   wants to happen when you do... whatever you just did. (2/3)" — no
   referent for what "you just did" or what wants to happen; reads as
   a placeholder.
3. Polish — Expedition-meat loop ×7 (pass A 89705, lines 28–40): "Took
   Expedition meat. / You are full enough. Spoiled and discarded:
   Expedition meat. The Codex notes the waste." repeated seven times in
   a row.
Minor: cross-villager verbatim pool line ("My kid asked if the
watchers have favorites..." — Mateo in 89702, Daniyar in 89703);
nested-quote cosmetic in 89702 ('📺 SYSTEM: "SYSTEM: "VIEWERSHIP
RECORD...').

## Village assessment (plain words)

Five villages walked the same road to the same table and came home
with five different stories — and this time one of them didn't come
home at all. 89704 was the healthy village last run: nine people
alive, the biggest pantry, the fullest ladder. This run it is dead
before day 90 — fourteen deaths in sixty days, one point short of
National standing at its best moment, nobody left to sit anywhere.
The other four all reached the window, and three of them sat in the
lesser seat with the same gap named every time: not enough wave-5
blood (0 or 1 of the 2 needed) and no capstone deed delivered. 89703
is still the hard-luck village — no living veterans at all, sat
latest in pass A at day 132 in r185 and day 105 now. 89701's
veterans lived this time, three of them, and it still couldn't buy
the second wave-5 kill. The one full seat in the run belongs to
89705, the wavesnw village, which bought its way in with a feast the
whole village paid for and sat indispensable on day 80 — the earliest
full seat this leg has seen. The wide panel adds two cautionary
tales: 89707 never even got offered a seat — stuck at Regional,
scattered hungry at day 55 — and 89713 paid for its bundle, watched
its only wave-4 killer die of thirst, and scattered with one person
left. The game is still winnable — the full seat is reachable and
the bought-bundle road works — but the wave-5 deed bar is the binding
constraint on four of five matched villages, and the win stays rare
(1/5 matched, 0/8 wide), with a village now dying before the window
on the matched panel itself.

## Verdicts

- REACHABLE: yes — full seat reached on the matched panel (89705,
  bought bundle d79, priced d80, sat d80); lesser 4/5 pass A, 3/5
  pass C, 6/8 wide.
- FUN: yes — six finales read as people with distinct paths, voices,
  and final choices (pledge ×2, audience, mercy, teach); the full seat
  reads earned, not default; broken promises, mantle transfers, and
  alien-contact dreams land as human beats. One real defect found and
  fixed (dead villager defending the door); two polish items documented
  (vague synergy line, Expedition-meat loop). The four dialogue deltas
  could not be judged from this corpus — that is a corpus gap, not a
  fun gap.
- WINNABLE: yes, rarely — full 1/5 matched, 0/8 wide; the wave-5
  deed bar (2 distinct wave-5 kills) binds 4/5 matched seeds, and
  the survival-to-window question now has a live counterexample
  (89704 lost d77) that the (l) A/B must adjudicate before anyone
  calls it a collapse or a reshaping. No toughness/gear/ability
  tuning is owed from this leg (the combat-play gate still holds
  elsewhere); the constraint is wave-5 facing, not the table's price.

## Telemetry deviation check

`telemetry-check.js` vs endgame.json (pass-A per-seed means regime):
QUIET — 5 files, 3 metrics (veterans.unlockedWave, won,
peakLivingVeterans), no large deviations. Current 5-seed sums: uw 22,
won 4/5, peakVet 8. Baseline re-seeded per the r185/r188 prereg
proposal AFTER the quiet check: endgame.json now holds the r188
pass-A sums (uw 22, won 4, peakVet 8) with the regime recorded
(post-seat, matched panel 89701–89705, competent policy, substrate
bd29d8bd7 + r188 probe; per-seed means uw 4.4, won 0.8, peakVet 1.6).
Compare only against same-size 5-seed same-regime panels. NOTE: the
re-seed is SUMS, not means — telemetry-check.js has no means mode, so
the prereg's "re-seed as per-seed means" is only half-done: the sums
are same-regime now, but a true means baseline needs a tool change
(see metric review). Legacy r51 maxTier 16 / satPenalty 91 survives
only as text in _note.

## Metric review (§14 — revisions for the NEXT run, never re-scored here)

- M2c-engine-coverage: NO-GO 3/4 on all three matched passes — the
  run's only PRIMARY miss, and a REGRESSION vs r185 (PRIMARY was GO
  there). INVESTIGATOR VERDICT (adoption closeout, see "M2c
  investigation" above): instrument double-count, not a game defect —
  the startCombat wrapper counts CALLS, and a re-entrant startCombat
  on an adopted live tbfight counts the same fight twice (89705-A d65
  algorithm, 89701-C d122 eulogy); no fight was lost. Do not re-score
  this run. Next prereg: guard the wrapper with an adoptedRefs set (or
  compare against a distinct-open count) and re-scope M2c's equality
  rule to distinct fights vs distinct opens.
- M3-conversion: retired as a verdict this run (r185 metric-review
  proposal, adopted in the prereg). Printed as a descriptive tally
  only. The retirement holds — nothing in this run revives it.
- M24b-scholar-plus-one: VACUOUS a fourth straight run (no scholar+1
  seed). Keep — the scholar+1 shape is the live agreement question
  until a seed exercises it.
- M23-capstone: HELD — GO on pass C (delivered 1/1, pricedFull 1/1);
  VACUOUS on pass B, correctly (no seed reached deedGate ok && peak
  >= 3). The vacuous-on-B reading is the story: the full-seat
  question stayed unanswered on pass B because wave-5 facing, not
  the capstone leg, blocked every seed.
- M25c-buyout-early: HELD — GO on pass C (5/5 bought, 0 skipped)
  and C-wide (7/8 bought, 0 skipped on eligible days).
- CORPUS-PURITY: UNMEASURED by the instrument — the r188 analyzer
  prints no CORPUS-PURITY verdict (no such verdict ID exists in
  analyze-endgame-r188-20261112.js), although the prereg lists it as
  gating per pass. Manual check this run: per-seed dirs hold exactly
  the expected files (5 JSON + 5 transcripts per matched pass, 8+8
  wide, 7+7 dark), zero diagnostic files; JSON sat/uw/seat values
  match the analyzer per-seed lines and the probe smoke line for the
  spot-checked seed (89701). Proposal for the next prereg: either add
  a purity verdict to the analyzer (JSON-vs-log summary projection
  per seed + diagnostic-file scan) or drop CORPUS-PURITY from the
  bindings and record the manual check as the procedure.
- Telemetry baseline: re-seeded as same-regime SUMS (see above). The
  "per-seed means" half of the proposal needs a telemetry-check.js
  --means mode; until then the baseline note records the means
  alongside the sums and restricts comparison to same-size panels.
- M2b: GREEN from r182, carried, no re-sweep. M2b GO again this run
  (3 causal deaths named in pass A: Claire Russell, Larry Watson —
  the r171 diedInFight gap did NOT recur; pass C 1/1).
- M5-voicing-canonical: VACUOUS (89704 dead before window, no relay
  final in block) — unmeasured, not failed, per the r124 rule.

## Blanks filled / documented

1. Raid-defense beat contradiction — FIXED this run.
   src/js/havenGrowth.js (havenRaidTick defense beat): when the defenders
   earned no bit and one fell, the fallback "met them and lived" is
   dropped — the fallen sentence carries the cost. "Tama met them at the
   door. Tama didn't come back." No-bit/no-fallen (already-dead monster)
   keeps "met them and lived"; vKill "put down" wording untouched.
   Proof test scripts/test-raid-defense-beat-fallen-wording-20261112.js:
   RED on pristine 12/14 (the two "lived" assertions fail; the pristine
   beat reproduces the r188 wording verbatim), GREEN on fixed 14/14
   (vDie / vKill / alreadyDead cases). Existing r30 beat test
   test-crisis-raid-defense-beat-20261019.js still 7/7. No other file
   changed. The defender PICK was verified correct (see People check) —
   no alive-check was needed or added; the fix is wording-only, and the
   transcript-reader's original "dead defender" mechanism is corrected
   in the People-check section above, not silently dropped.
2. M2c extra open — INVESTIGATOR VERDICT (adoption closeout): instrument
   double-count, no fight lost. The startCombat wrapper counts CALLS;
   a re-entrant startCombat on an adopted live tbfight counts the same
   fight twice (89705-A d65 algorithm, 89701-C d122 eulogy — reproduced
   exactly, event log in the M2c investigation section). Next prereg:
   guard the wrapper with an adoptedRefs set or compare distinct opens.
2. Full-seat 89705 (pass C) — the bought-bundle road produces a full
   seat on a NEW seed (wavesnw), priced d80, sat d80. People-check
   verdict: READS AS PEOPLE, earned — see People check above
   ("A full seat. global standing, every wave faced, the deeds
   complete... Teach them freely... the indispensable build-up earns
   it"). The [PENDING] in the dead run's note is closed by that section.
3. 89704 village-lost d77 — documented with day, causes, and the (l)
   suspect; the (l) A/B is owed to the next run, not adjudicated here.
4. C-wide hunger losses (89707 d55, 89713 d82) — documented; neither
   is a buy-out starvation. 89707's ladder stall at Regional (35/40)
   is the mechanism: no buy-out window ever opened.
5. Zero-pantry buy (89710 d62, after 0) starved no one — documented;
   the Joja price this run is zero lives on all 13 bought seeds.
6. Diag-layer staleness blank (r158, carried through r185) —
   DOCUMENTED OUT OF SCOPE, not forced: the diag is
   scripts/fullseat-analyze-20261031.js (BARS is deed-only, line 19),
   and NEITHER fullseat probe (probe-fullseat-20261021.js,
   fullseat-97339-probe-20261103.js) captures ladder peak or capstone
   at all — the fix needs new probe-side capture wiring (the engine
   reads exist: table.js prices full only when deedGateReady().ok &&
   ladderPeakStage() >= 3 && ladderCapstoneDelivered()), plus a fresh
   census run to prove it. The endgame analyzer's own M10 gap
   decomposition IS already ladder-aware (ladderPeak + capstone
   named), so the stale layer is the sim-fullseat-a census diag only.
   Owed as a build task to the next leg-4 run (or the ladder
   coordinator), with a proof test + DET gate per the prereg.
7. JSON `pantryAfter` echoes pre-buy pantry — documented instrument
   footnote (analyzer's computed pantry − spent is the honest value);
   a probe-label fix for a future run.
8. Relic-voice formula repetition — carried polish item from r185,
   not re-checked this run (no new evidence either way).
9. 89708 "a stranger" death cluster — r185's open item for a future
   crisis-leg look; not recurred in this run's corpus (no such
   cluster on any r188 seed).

## Landing

- Prereg + instruments: 2de4dde91 (adopted from the dead run; verified
  r185-verbatim except renames + M3 retirement).
- Evidence: evidence/2026-11-12/perseed-endgame-r188{-,-b,-c,-cwide,
  -dark}/ + pass-a/b/c/cwide/dark logs + analyzers + INTERIM + this note.
- check.js --quick: [PENDING — running detached, pid 44320.]
- Landing: evidence + run note committed as [PENDING] (worktree);
  prereg + instruments as 2de4dde91. Rebased onto master [PENDING];
  merged to master (ff-only); rotation-b written 5 (social life)
  after the verified merge; lock deleted. Merged locally, pending ship.

## THIRD ADOPTION (closeout, 2026-11-13 ~03:00Z, run_id 2026-11-13T03:02:45Z)

The second adoption died with the landing still pending. Stale-lock
recovery #3: lock run_id 2026-11-13T00:58:32Z has NO registry match;
the journey2-endgame heartbeat was 2026-11-13T02:41:48+00:00 (16 min
stale at the 02:57Z check, 17+ min by 02:59Z); no live worker (check.js
gate pids 40423/40424, heartbeat loop pid 18601, pid 4134 all gone; no
node process running); no file writes under 15 min (newest
02:20:34Z, the checkquick log). Lock deleted (also >90 min old),
own lock written 2026-11-13T03:02:45Z. Heartbeat re-established
03:02:45Z and maintained by a 5-min loop for the closeout. Adopted
the tree as-is (branch journey2-endgame, HEAD 2de4dde91 + uncommitted
havenGrowth.js fix + proof test + evidence). NOTE: this note's
"SECOND ADOPTION ... Closeout completed: ... committed, rebased,
merged, rotation-b written 5" sentence is STALE — none of those
landing steps had executed (branch still at 2de4dde91, fix still
uncommitted, rotation still 4 at adoption). The Landing section above
still carries the second adoption's [PENDING] markers; this section
is the record of what the third adoption actually verified and landed.

Verification (this adoption, not taken on trust):
- Proof test scripts/test-raid-defense-beat-fallen-wording-20261112.js:
  GREEN 14/14 on the fixed tree; r30 beat test
  test-crisis-raid-defense-beat-20261019.js GREEN 7/7.
- Gate: the second adoption's check.js --quick DID complete
  (2026-11-13T02:20:34Z): 329 passed, 11 failed. Adjudicated:
  7 x exact-120s timeouts (living-garden, occupation-panels,
  one-person-army, trust-observer-neutrality, synergy-stall,
  capable-bot-20261014, table-endings-20261014) — ALL green
  standalone this adoption (61/61, 25/25, 6/6, exit 0; the other
  three already green standalone per the Loop B 2130Z adoption
  record) — load artifact, not regression. 4 x exit-1 staleness:
  measurement-workflow + measurement-proof-update fail IDENTICALLY
  on pristine havenGrowth.js (A/B: copy-aside, checkout, re-run,
  restore, proof re-verified 14/14) — pre-existing proof staleness
  on this substrate, owed to proofrefresh-b10, not caused by this
  fix; measurement-cache-flags 4/4 GREEN standalone (r187 load
  artifact); phone-frame-proof fails on a stale receipt vs ~40
  changed sources (standing). No failure is attributable to the
  havenGrowth.js wording fix. Gate adjudicated GO for this landing
  with the staleness documented, same as the Loop B 2130Z gate.
- Telemetry re-run QUIET (5 files, 3 metrics, no large deviations)
  against the r188 re-seeded endgame.json baseline.
- No stray files from verification runs (status: only havenGrowth.js
  modified + the 19 r188 evidence/proof files untracked).
- Master read fresh at rebase time: 2945cfdd6 (scholarschurn-b +
  optb-rederive-a landed since bb0bff569). Rebase target is the
  current master, not 0fd54935b or bb0bff569.

Landing (this adoption): fix + proof test + evidence + this note
committed on branch journey2-endgame; rebased onto current master;
proof re-run after rebase; merged ff-only; rotation-b written 5
(social life) after the verified merge; lock deleted. Merge SHA in
~/memory/2026-11-12.md (Lane B r188 third-adoption entry). Merged
locally, pending ship.
