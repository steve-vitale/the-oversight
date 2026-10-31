# sim-pocketcall-a — the pocket-call census on the supply band (DIAG-GO)

Run: Loop A worker, arm sim-pocketcall-a, axis scale-onramp, run
fleshout-20261031T0726Z. DIAG ONLY: zero src/js changes, zero
policy-default flips, zero edits to existing files
(scripts/policies/deadfall-b.js reused VERBATIM as staffing).
The deliverable is a landed instrument set + this census.
Worktree branch: sim-pocketcall-a. Base anchor: this worktree's
HEAD at sweep time (recorded per seed as anchorCommit in the
per-seed JSONs; the anchor differs from deadfall-b's b2518ece2,
so all judged numbers are judged on THIS base — see
§Reproduction, where the deadfall-b comparison is labeled
cross-base and verified, never assumed).
Pre-registration: evidence/2026-10-31/sim-pocketcall-a-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/pocketcall-diag-20261031.js (PCDIAG=1,
read-only, installed on top of ammo-diag + supply-diag +
stickfiber-diag, all verbatim) + scripts/pocketcall-sweep-
20261031.js (deadfall-sweep logic, single-base census arm,
DEADFALL_B=1 required) + scripts/pocketcall-analyze-20261031.js
(derives every judged number from the per-seed JSONs only).
Proof: scripts/test-pocketcall-20261031.js — 41/41 GREEN
(classification fixtures incl. priority order + anomaly flag,
sensed-contact fixtures incl. stale-grid + overlap cases,
static read-only scan, live gate on NON-band seed 85901, 60d,
staffing ON, byte-identical re-run, zero errors).
No [needs-eyes] (measurement only; nothing player-facing ships).
Panel (§15): NOT APPLICABLE, none fabricated — single-base DIAG
measurement, no before/after comparison exists in this arm (the
deadfall-b corpus is a cross-base historical corpus, not a panel
before/after on this base), same declaration as mustercall-b. A
later lever arm reusing this corpus as its baseline runs the
panel then.

## Verdict: DIAG-GO (judged exactly against the prereg)

1. Classification completeness 100%: 3/3 wave >= 4 ranged fights
   classified, class counts sum exactly to 3, PC fight rows join
   1:1 with ammo-diag fight rows on all 16 seeds (zero join
   problems), zero classification anomalies (no NEVER-DEPARTED
   fight with W > 0), instrument errors 0/0/0/0 on all seeds
   (ammo / PC / supply / stickfiber). PASS.
2. Every class count reported with n, including the two clean
   zeros with their reasons (§Clean zeros). PASS.
3. The sensed-reachable never-called subset is sized: union 0,
   per-channel C1/C2/C3/C4 all 0, unreachable 1, with the reason
   (every channel absent, itemized in §Sensed contact). A clean
   zero with its reason satisfies the bar exactly as a nonzero
   count does. PASS.
4. Wall numbers + volley reproduction reported (§Wall,
   §Reproduction), and one fight transcript read per class
   present in the band (§Sense test, quoted). PASS.
5. Ranged fights band-wide: 3 (>= 1). PASS.
DIAG-GO.

## The answer, in plain words

On the supply band — the village where sticks now flow — the
bow still almost never sings, and the census says why, fight by
fight. There are only three ranged fights in sixteen villages,
and they are one of each kind that matters. One fighter walked
in armed and fired a real volley (Maya, the deadfall-b volley,
reproduced exactly). One fighter walked in dry after pocketing
twice — but her story is subtler than "dry": Jovan pocketed six
sling stones on the morning of the fight and spent all six on
three lesser beasts the same day, then met a wave-4 Eulogy empty
and walked around it. The sling works; the quiver is one day
deep. And one fighter was never called at all: Chloe carried a
crossbow for 85 days, never once departed, never once pocketed,
and met a Eulogy alone on a node one step from the scholar —
close on the map, but with no sensed channel between them: not
the same node, not the same grid, not in the travelling crew,
not in the party. Nobody could have handed her a bolt at that
moment, because nobody who could hand her one was with her.
That is the hole the call design must fill, sized: on this band
it is exactly one never-called fighter, unreachable at fight
time, standing next to a pile of 209 sticks back home that
could have made her bolts. The other two classes the census was
built to find are empty, and their emptiness is informative, not
missing data: nobody on this band was called-to-depart but never
went before a fight (though 95 departure calls sat out
band-wide — see §Clean zeros), and nobody fought dry while
standing at home with pocket history (the only home-node ranged
fight is Chloe's never-called one).

## Pilot + confirm

Pilot (85101–85108): 11 wave >= 4 fights, 3 ranged, join 1:1,
errors 0, completeness 1 — pilot GO under the prereg (instrument
fires on all 8, zero errors, 1:1 join, >= 1 wave >= 4 fight), so
the confirm ran. Confirm (85109–85116) adds 3 wave >= 4 fights,
0 ranged: s85110 1 fight (vFlee), s85114 2 fights (vFlee, vFlee),
the rest fightless. Band total: 16 seeds, 14 wave >= 4 fights,
3 ranged. The confirm changed no class count — the pilot already
held all three ranged fights — which is itself a finding about
how thin the ranged-fight band is: 13 of 16 seeds contribute
zero ranged fights, and the census rests on 3 fights in 3
villages. The classes are exact; their generality is not. A
future call arm wanting a bigger ranged sample needs a band (or
a substrate) that produces more ranged meetings, not a bigger
seed count on this one — 16 seeds already show the shape.

## Band numbers (judged band, 16 seeds)

- Wave >= 4 fights: 14 (non-ranged 11). Ranged: 3. Lower-wave
  fights counted only: 1,769 (fieldFight calls 1,783).
- Class counts (mutually exclusive, priority order ARMED >
  NEVER-CALLED > NEVER-DEPARTED > DRY-AT-HOME > DRY-AT-FIGHT):
  ARMED 1, NEVER-CALLED 1, NEVER-DEPARTED 0, DRY-AT-HOME 0,
  DRY-AT-FIGHT 1. Cross-tab P/D/A: P0/D0/A0 1, P>0/D>0/A>0 1,
  P>0/D>0/A0 1. No other P/D/A combination occurs.
- By weapon: crossbow 1 (NEVER-CALLED), crude_bow 1 (ARMED),
  sling 1 (DRY-AT-FIGHT). By caller: resolveWildMonsterEncounter
  1 (NEVER-CALLED), expeditionMonster 2 (ARMED, DRY-AT-FIGHT).
  No aidFight / resolvePatrol / raid ranged fight occurs.
- Outcomes (ranged): vFlee 2, evade 1, vKill 0, vDie 0.
- Volley: 1 fight with shots, 4 shots, 48 damage (Maya only).
- Supply split (dry fights only, 2/2): NEVER-CALLED 1
  call-blocked, DRY-AT-FIGHT 1 call-blocked, supply-blocked 0.
  At fight time the pile held sticks 209 / 225, fiber 73 / 79,
  stone 164 / 280 for the two dry fights — the pile could have
  armed both. On the staffed substrate, the binding block for
  every dry ranged fight in the band is the call, not supply.
  (This does not retire the supply rung: it says the rung now
  holds at fight moments on this band. Transient pile empties
  still occur at pocket-call moments per deadfall-b.)
- Deadfall ledger (substrate check): hauls 2,561, sticks 3,700,
  fiber 1,309; seeds with hauls 16/16; pile sticks positive on
  16/16 seeds (per-seed stick max 6–1,007). The staffed
  substrate behaved exactly as deadfall-b measured it (§Repro).
- Departures band-wide: 203 departure calls, 108 went, 95
  sat-out, 108 pocket invocations (went <=> pocket invoked,
  exactly, on every call — see §Clean zeros). ALL 203 departure
  calls are startExpedition; resolvePatrol records ZERO calls
  band-wide (see §Findings for the coordinator).
- Instrument errors: ammo 0, PC 0, supply 0, stickfiber 0.

## The three fights (the whole census, one row each)

- s85101 d87, chloe_dubois, crossbow, need bolt, carried 0,
  P=0 D=0 W=0, NEVER-CALLED, caller resolveWildMonsterEncounter,
  supply call-blocked, volley 0/0, outcome vFlee, pile
  st209/f73/s164, sensed all-absent, reachable false.
  Crossbow since day 2 (founder), 0 departures, 0 pockets in 85
  days before the fight.
- s85103 d41, maya_singh, crude_bow, need arrow, carried 4,
  P=1 D=1 W=1, ARMED, caller expeditionMonster, volley 4/48,
  outcome vFlee, pile st148/f52/s286. Bow since day 2; one
  departure day 40, one craft success (batch of 5 arrows from
  pile st141/f50/s270; 4 carried into the wave-4 meeting, all 4
  fired — the fifth arrow is not in the fight-entry pack; where
  it went between craft and fight is not traced in this corpus).
- s85106 d61, jovan_milic, sling, need stone, carried 0, P=2
  D=3 W=2, DRY-AT-FIGHT, caller expeditionMonster, supply
  call-blocked, volley 0/0 (evade — no volley, see §Sense test),
  outcome evade, pile st225/f79/s280. Sling since day 2; one
  sat-out departure day 35, went departures days 38 and 60,
  each pocketing 6 stones; see §Sense test for where the day-60
  stones went.

## Sensed contact (never-called: n = 1; never-departed secondary: n = 0)

Never-called sensed breakdown: union 0, unreachable 1, C1 0,
C2 0 (C2-stale 0), C3 0, C4 0, overlaps all 0. The single row,
in full (s85101 d87, chloe_dubois): fighter node 3,3 — the
monster's own node, as wild-encounter selection requires;
scholar node 4,4; fighter grid null (grid positions populate
only on the scholar's node, and she is not on it); scholar grid
0,1; crew membership false, crew alive others []; party false;
fight opts allies 0, allyVids []. Every channel is absent for a
distinct, checkable reason — not a null row: she is one node
away from the scholar (adjacent on the map, not the same
place), outside the travelling crew, outside the party, with
no ally attached to the fight. Adjacent-node is NOT sensed
contact under this test: the code's shout channel is the crew
("a villager jumped in the wild can call to whoever's out there
with them"), and its see-channel is same-node / same-grid. A
future call design that wants cross-node shouting must define
its range in code; this census does not invent one, and it
records that the need arises here — the scholar stood one node
away while Chloe fought alone.
Never-departed secondary: n = 0, so no sensed rows exist to
summarize; the class's emptiness is explained in §Clean zeros,
not by a sensed result.

## Clean zeros (with reasons, not just counts)

- NEVER-DEPARTED 0 — NOT because departures never sat out.
  Band-wide, 95 of 203 departure calls sat out (47%), every one
  a startExpedition call with away/exped unset afterwards
  (heal, sick, or max-distance gates firing before pocketing —
  the instrument records the outcome, not which gate; see
  §Findings). Repeat sat-out villagers recur across days
  (leo_martin 9+ sat-outs across seeds 85107/85111; several
  generated-id villagers sat out 3–9 times each). But no ranged
  fighter's story ends at sat-outs: every ranged fighter who
  was ever departure-called also went at least once before
  fighting (Maya: went day 40; Jovan: sat out day 35, went days
  38 and 60). The class is empty because sat-outs and
  ranged-fighter status do not overlap before a fight on this
  band — a statement about these 3 fighters, not a claim that
  sat-outs are rare. A call design aimed at "called but never
  went" fighters would find its population elsewhere: among the
  95 sat-out calls' villagers, not among ranged fighters.
- DRY-AT-HOME 0 — because no P > 0 fighter fought dry while
  standing at home. The only home-node ranged fight is Chloe's,
  and she has no pocket history at all (P = 0, D = 0). The two
  P > 0 fights are both expeditionMonster fights, out in the
  field. Dry-at-home is therefore unmeasured, not refuted: a
  band with a home-node ranged fight by a previously-pocketed
  fighter (e.g. a raid fight by a returned expedition veteran)
  is what would populate it.

## Reproduction (cross-base check, labeled, not assumed)

Full fight identity (seed, day, vid, monster, outcome) matches
deadfall-b's prototype corpus on all 14/14 wave >= 4 fights —
zero mine-not-in-db, zero db-not-in-mine. Deadfall ledger
matches exactly (hauls 2,561, sticks 3,700, fiber 1,309; pile
sticks 16/16). Wall matches exactly (national 12/16, table
11/16, wins 11/16, wave 4 10/16, wave 5 0/16, median 95d, max
202d). Volley reproduces exactly: the band's only volley fight
is Maya Singh, s85103 d41, 4 shots / 48 damage — the same seed,
day, fighter, weapon, shots, and damage as deadfall-b's. The
other two ranged fights are the other two ranged fights of
deadfall-b's band (Chloe never-called, Jovan dry-at-fight),
now classified. Note on the analyzer's reproduction field: it
compares ranged rows only (3/3 identical) against deadfall-b's
14 total fights; the 14/14 full-identity verification above was
run as a separate comparison over both corpora and is the
number this section claims. The base moved (anchor differs from
b2518ece2) and trajectories still reproduced exactly — the
PC instrument draws no RNG and writes no state, as its det-gate
requires, and the added departure/fight wrappers did not
perturb a single fight identity.

## Wall numbers (honest, same caveats as deadfall-b)

National 12/16, table reached 11/16, wins 11/16, wave 4 unlocked
10/16, wave 5 unlocked 0/16, median survival 95 days, max 202
days. Table/win flags are the policy stack's substrate flags,
not ordinary-play claims. Arc II/III/IV reach, four-realm
formation, trap acquisition by source, counter discovery/kill
rates, and young-link succession survival are NOT instrumented
in this substrate and are NOT reported.

## Sense test (SENSE-TESTING LAW)

One transcript per class present, read as scenes:

1. NEVER-CALLED — Chloe, s85101 d87 (full log from the corpus):
   "Chloe has Crossbow but no arrows — the string stays drawn,
   useless. R1: Chloe strikes for 22 (878 left) / Chloe's gear
   absorbs 44. / R1: Final Chapter hits Chloe for 21 (40 left) /
   R2: Chloe strikes for 22 (856 left) / ... / Chloe BELLOWS —
   not volume, a promise. The Eulogy falters. They hold the line
   a little longer. (War Cry) / R3: The Eulogy hesitates — Chloe
   bought a breath. / R3: Chloe strikes for 19 (837 left) / R3:
   Chloe strikes for 22 (815 left) / Chloe has seen enough —
   withdraws to report back. (Learn-first: not winnable, not
   worth the blood.)"
   Judgment: this reads like a person, and the gap reads as a
   real absence, not a narration bug. She fights with what she
   has (strikes, war cry), judges the fight unwinnable, and
   withdraws *to report back* — the post-fight contact the call
   design would need before the fight. Nothing in the scene
   pretends a bolt existed, and nothing reaches her: no ally
   line, no shout answered, no crew. The "report back" ending
   is the sharpest form of the hole: after the fight she walks
   toward the people who could have armed her; before it, no
   channel carried a bolt the other way. (Narration nit carried
   from supply-b, unchanged: the dry line says "no arrows" for a
   crossbow — bolts, not arrows — and the pile by the door held
   209 sticks that could have made them.)
2. ARMED — Maya, s85103 d41 (full log from the corpus):
   "Maya walks straight into The Suburb. No avoiding it. / Maya
   sees The Suburb coming and nocks an arrow — the fight opens
   at range (4 shots). / loosed — it takes The Suburb for 15
   (1328 left). / loosed — 17 (1311 left). / loosed — 16 (1295
   left). / loosed wide — the arrow buries itself in the dirt.
   (spent) / Maya lowers the bow — The Suburb is on them now.
   (3/4 hit) / R1: Maya strikes for 23 (x1.3) (1272 left) / ...
   / Maya is losing — shouts for help! Arlo charges in! / ...
   / Arlo goes down! / Maya sees how this ends — and runs while
   running still works."
   Judgment: the volley reads as a real opening, not a decoration
   — 48 damage, a spent quiver, then melee, a shouted call for
   help that IS answered (Arlo charges in — the code's crew
   shout channel working mid-fight), an ally death, and a
   retreat while retreat still works. The contrast with Chloe
   is the census in miniature: Maya's shout reached someone
   because someone was out there with her; Chloe's fight had
   nobody to shout to. The volley does not win the fight — she
   still flees — which is deadfall-b's VOLLEY-AS-WIN question,
   still open, not answered here.
3. DRY-AT-FIGHT — Jovan, s85106 d61 (full log from the corpus):
   "Jovan saw The Eulogy in time and gave it room."
   Judgment: the shortest transcript is the most instructive
   about what "dry" means here. This is not a dry fight at all
   — it is an evade. The dryness never got tested, because
   Jovan saw the beast in time and walked around it. The
   census class is honest (carried 0 at entry) but the scene
   warns against reading "dry-at-fight" as "fought dry": on
   this band the one dry-at-fight fighter never exchanged a
   blow with the wave-4 beast. Where did his stones go? A
   post-confirm probe (NOT judged data, /tmp script, same
   substrate/seed, trajectory reproduced exactly — same pocket
   calls, same wave-4 fight) traces them: his day-60 pocket of
   6 stones was spent the same day in three low-wave fights
   (drumbelly_tanuki 2 shots / vKill, review_drone 2 shots /
   mFlee, ad_break 2 shots / mFlee — 6 spent, 0 left), and the
   day-61 Eulogy meeting found him empty. His day-38 pocket met
   the same fate days 39–40 (callback x3, 2 shots each). So the
   sling DOES work — Jovan's low-wave volleys kill and drive
   off — and the ammo economy is exactly one expedition-day
   deep: 6 stones cover about three small fights, and a wave-4
   meeting later in the same outing finds an empty sling. A
   call/top-up design that fires only at departure will
   systematically miss wave-4 meetings late in an outing; the
   hole is not just "never called" but "called once, spent,
   never topped up".

## What the village looked like, in plain words

A village where the pile by the door holds hundreds of sticks
and stones, where the bow fighter who goes out properly armed
fires a real volley, where the sling fighter spends his stones
on the small beasts he meets along the way and walks around
the big one empty-handed, and where the crossbow woman who
never leaves home carries her weapon for 85 days and never
once gets a bolt — then fights alone one node from the leader,
flees, and walks back to report. The supply rung holds. The
call is the whole remaining hole for ranged fighters on this
band, and it has a shape now: it must reach fighters who never
depart (Chloe), and it must top up fighters whose departure
pocketing is already spent (Jovan) — two different call
moments, not one. The departure gates, meanwhile, filter hard:
nearly half of all departure calls never leave the village at
all, which is a second, quieter hole underneath the first.

## Findings for the coordinator (reported here, NOT edited into hidden_files/sim-findings.md — coordinator owns that file)

- F1 (new): PATROL DEPARTURE SITE SILENT BAND-WIDE. 0
  resolvePatrol calls in 203 departures; the departure census
  is expedition-only on this band. If a future call design
  leans on patrols (the other departure site), it needs a band
  where patrols actually fire, or a check that patrols fire at
  all under this policy stack.
- F2 (new): SAT-OUT RATE 95/203 (47%). Departure gates (heal /
  sick / max-distance, before pocketing) filter nearly half of
  all departure calls, with repeat sat-out villagers (leo_martin
  9+ times). The instrument records sat-out outcomes but not
  which gate fired — a future arm wanting to fix departures
  needs a gate-attribution census first.
- F3 (new): SLING AMMO IS ONE-DAY-DEEP (Jovan probe, post-
  confirm, not judged data). 6 stones = ~3 small volleys; a
  wave-4 meeting later in the same outing finds an empty sling.
  A departure-only top-up systematically misses late-outing
  wave-4 meetings. This refines the pocket-call design brief:
  the call needs a top-up moment, not just a first-call moment.
- F4 (new): ADJACENT-NODE NON-CONTACT (Chloe). Scholar one node
  away (4,4 vs 3,3) with no sensed channel. Cross-node shouting
  is undefined in code; a call design must either accept
  node-locality or define a shout range — the census does not
  invent one.

## Metric review (for the NEXT run, never a re-score of this one)

1. The departure count D MUST be read from the PC pre-call
   counter, not from the ammo-diag departure list: the ammo-diag
   wrapper appends only after the original returns, i.e. after
   any fight inside a patrol call, so reading D from that list
   at fight time undercounts in-progress patrols by exactly the
   call that produced the fight. No patrol fight occurs on this
   band, so the distinction is untested here — a future band
   with a patrol ranged fight is the test that would catch a
   regression to the wrong list.
2. The analyzer's reproduction field compares ranged rows only
   (3/3) against deadfall-b's 14 total fights; the 14/14
   full-identity claim in §Reproduction comes from a separate
   comparison over both corpora. A future analyzer should
   compute the full-identity check itself instead of relying on
   an ad-hoc comparison.
3. The weaponNote ("pocket-after-weapon") uses pockets with day
   strictly before fight day; a same-day pocket (the patrol
   case) would read as "pocket-same-day-only". No patrol fight
   occurs here, so the same-day branch is untested — same
   caveat as (1), same future test.
4. Low-wave volley spending is invisible to the census
   instruments (wave < 4 fights are counted only). Jovan's
   dryness was only explained by a post-confirm probe. A future
   dry-at-fight analysis should instrument low-wave volley spend
   directly, or the "dry" label will mislead: his sling worked,
   it was just empty.
5. The sensed test's C2 grid channel never fires on this band
   (fighter grid null for the only never-called fight, since
   grid positions populate only on the scholar's node). C2 is
   therefore untested in the wild here — only in fixtures. A
   band with a never-called fighter on the scholar's node is
   what would exercise it.

## Convergence state

converging — the scale-onramp axis measurement: the pocket-call
hole is now sized (1 never-called unreachable fighter, 1 spent
dry-at-fight fighter, 1 armed volley fighter on 16 seeds), but
the call itself is still undesigned and unbuilt.

## Files

- Pre-registration: evidence/2026-10-31/sim-pocketcall-a-prereg.md
- Evidence: evidence/2026-10-31/sim-pocketcall-a.md (this file)
- Instrument: scripts/pocketcall-diag-20261031.js (PCDIAG=1)
- Sweep: scripts/pocketcall-sweep-20261031.js
- Analyzer: scripts/pocketcall-analyze-20261031.js
- Proof: scripts/test-pocketcall-20261031.js (41/41 GREEN)
- Corpora: evidence/2026-10-31/perseed-pocketcall-a/census/
  s85101–s85116.json
- Reused, unmodified: scripts/ammo-diag-20261031.js,
  scripts/supply-diag-20261031.js,
  scripts/stickfiber-diag-20261031.js,
  scripts/policies/deadfall-b.js (VERBATIM staffing)
- Probe (not committed, /tmp): /tmp/jovan-probe.js — outputs
  quoted in §Sense test; trajectory reproduced the judged corpus
  exactly.
