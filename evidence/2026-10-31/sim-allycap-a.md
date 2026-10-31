# sim-allycap-a — second-ally engine-cap census (CLAIM-CONFIRMED)

Run: Loop A, oversight-flesh-out-loop, run fleshout-20261031T1415Z,
axis scale-onramp, arm sim-allycap-a. Worktree branch: sim-allycap-a.
Base anchor: worktree fast-forwarded from 4c92bbb04 (verified 0 commits
ahead, tree clean) to master 19b3e1ae0 before any work; instrument
anchorCommit is the last commit touching src/ (b10f3eb7f3fcd7e5abe604814ac165711475e778,
the game code actually measured — spearxbow-a lesson).
Pre-registration: evidence/2026-10-31/sim-allycap-a-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/allycap-fixture-20261031.js (forced-meeting
fixture band through the real Game.fieldFight; spearxbow-a lineage:
same harness, same leader boris_kowalski + first other roster NPCs,
age 35 / steady / 100 HP, FULL Game.state restored before every
fight; no game code changed, no policy, no policy-default flips).
Proof: scripts/test-allycap-20261031.js — 38/38 green
(determinism gate: two fresh fixture runs byte-identical to each
other AND to the committed corpus, sha256 293541bc3251; independent
re-derivation of the pilot gate, C1/C2/C3, count-channel and
rear-guard secondaries, and the static-census invariants).
Corpus: evidence/2026-10-31/perseed-allycap-a/fixture-band.json
(96 fights: 12 pilot + 84 confirm).
No [needs-eyes] (measurement only; nothing player-facing ships).
DIAG ONLY: no engine-cap fix was built here, per the task — the
findings backlog says that needs an engine-cap design decision
first. A fixable small lever, if any, is documented as a next arm
below, not landed.

## Verdict: CLAIM-CONFIRMED (judged exactly against the prereg)

- C1 (primary): second-ally combat entries 0/24 confirm fights
  (FS-V2 12 + SH-V2 12). No fight shows a second distinct allyVid
  entering the blows by any of the three detectors: rec.allyVid
  == B 0 times, charges-in lines naming B 0 times, strike lines
  naming B 0 times. Across ALL 96 fights: B strikes 0, B charges 0,
  B health delta 0, rec.allyVid == B 0.
- C2 (count-controlled identity): FS-V2 identical to FS-C2 on
  12/12 confirm streams — every recorded field AND the full log
  text, with the allies COUNT held fixed at 2 and only the vid
  list differing ([A] vs [A,B]). This is partyvolley's P2 == P3
  with the count confound removed: the second vid adds nothing.
- C3 (shout-once): max "shouts for help" per SH fight 1 across
  all 32 SH fights (8 shouted, each exactly once); second-shout
  fights 0. QUALIFICATION (reported, not hidden): the ally-down
  prong of C3 is UNOBSERVED on this band — in 0 SH fights does
  the shouted ally ever fall (allyHpLeft is only ever null or
  100), so "no re-shout after the ally falls" has no test here.
  The max-1 prong holds regardless, and the static census (below)
  shows a re-shout is structurally impossible: helpCalled is
  never reset.
The 2-ally yardstick component is therefore UNFIELDABLE through
fieldFight as wired. What caps it, in order of binding force:

## Finding 1 — the cap is the engine's single-scalar fighter state, gated by helpCalled (not caller staging)

Callers already stage two allies — staging is NOT the cap:
party-wiring.js `villagerFightAllies` returns up to 2 (slice(0, 2),
comment: "the fight engine takes the first two and one answers per
fight"); patrol/wild stage the first 2 crew vids; the lingerer
muster is leader + up to 2; aidFight passes its whole present
list (unbounded) and alienPlayers passes brave.slice(1)
(unbounded). Every caller feeds the engine two or more fighters.
The engine then drops all but one, in three stacked layers:
1. TRUNCATION (fieldFights.js ~967): `allyVids =
   (opts.allyVids || []).slice(0, 2)` — a third staged vid never
   survives intake. (Callers cap at 2 anyway, so this layer is
   currently redundant — except for aidFight/alien callers.)
2. SINGLE-SCALAR STATE (fieldFights.js ~994): one allyVid,
   allyHp, allyIn, allyName — no array, no second slot. The ally
   strike is one flat [3,6] roll per round (~1782); monster
   targeting rolls one 0.4 ally-share against that one ally
   (~1240-1255). There is nowhere for a second fighter's HP,
   strikes, or wounds to live.
3. helpCalled GATE (the binding lock): exactly two shift sites
   exist in the whole file — fromStart (~1033) and the hopeless
   shout (~1887) — and both set helpCalled = true. The shout
   branch requires !helpCalled (~1885). So: a fromStart fight
   can never shout (helpCalled already true), and a shout fight
   can shout at most once (helpCalled flips true and is NEVER
   reset — one declaration false, two sets, zero resets, verified
   by grep in the proof). After the first ally joins, the
   remaining vids are never re-read for combat.
So the answer to the brief's three hypotheses: helpCalled
gating YES (primary lock); shout gating YES (same boolean,
once-only by construction, and the shout sits in an else-if
chain so later hopeless rounds fall through to flee/rally, not
to a second shout); caller staging caps NO — callers stage 2,
the engine fields 1. "Congregation limits" as a separate
hypothesis does not exist in the engine: no congregation-sized
cap was found; the only congregation in this band is the beast
of that name.

## Finding 2 — the staged-but-unjoined ally is not nothing: it steadies morale, and that can kill

The second vid is a ghost in the blows but NOT in the morale
math, and the count channel is real and bidirectional:
- FS-C2 (count 2, vids [A]) vs FS-C1 (count 1, vids [A]) differ
  on exactly 1/12 streams (205): count 2 holds the fighter to
  round 2 (total 83 -> 123). holdBonus adds min(0.12,
  allies * 0.04) from opts.allies (~968) — the COUNT, not the
  vids, steadies the fighter.
- FS-V3 (count 3, vids [A,B]) vs FS-V2 (count 2, vids [A,B])
  differ on 2/12 streams (204, 207). Stream 204 is the caution:
  FS-V2 flees round 1 at 32 HP; FS-V3 holds to round 2 and DIES
  (the band's only FS vDie). More "nearby allies" steadied the
  fighter into a lethal second round. The count channel buys
  damage (FS-V3 median total 99.5 vs FS-V2 95.5) at death risk.
- Bond average is a second non-combat channel in principle
  (bondCombatBonus averages over the staged vids, ~973), but on
  this band it moved nothing: FS-V2 == FS-C2 12/12, so with
  fresh-state bonds the average is inert. A bonded village
  could differ — unmeasured here, flagged for a future arm.
Practical meaning: "bring two friends" DOES change a field
fight today, but only as courage, never as a second pair of
hands — and courage can get the leader killed.

## Finding 3 — the shouted ally never fights on this band (stillborn reinforcement)

Across all 32 SH fights, shouted allies deal 0 total damage and
take 0 damage (allyDealt sum 0; allyHpLeft only null/100). The
transcript explains why: the shout fires at round end when the
leader is already past holding (2 HP in the read fight), and the
very next line is the flee — "answered the shout, but ... past
holding — they run while running still works." The ally joins
and the fight ends in the same breath; its first round never
comes. So on the wave-4 congregation band, the shout path's one
ally is narratively present but mechanically stillborn — the
effective fielded party through the shout path is one fighter
who runs, not two who fight. (Scope: this is the congregation
band at P2-hide scale; a weaker beast or a sturdier leader
might give the shouted ally a round. Not measured here.)

## Finding 4 — the second ally's only appearance in 96 fights is the rear-guard line

In cornered (sortie) fights only, leftover vids are named at
close (fieldFights.js rear-guard block, sim-gaps-ghost 2026-10-29):
CORN-V2 rearGuardHasB 12/12, and CORN == SH-C1 on 12/12 streams
excluding rear/log — cornered changes NOTHING except that line.
B's sole appearance in the entire corpus is "the man in his 40s,
with a broad frame stood the rear through it, watching the
treeline behind them." In non-cornered fights B has no line at
all: no entry, no strike, no wound, no mention. The engine
already knows how to account for the second marcher — as a
watcher, not a fighter. Any "party of three" narration that
implies otherwise is lying about this engine.

## Numbers (confirm sample unless stated)

Confirm: 84 fights (FS-C1/C2/V2/V3, CORN-V2, SH-C1/V2 x 12
streams 201-212, congregation only). Pilot: 12 fights (FS-V2,
SH-V2 cong, SH-V2 eater x streams 101-104). Pilot gate: FS
from-start 4/4; SH congregation shouts 2/4, SH eater shouts 0/4
(the eater's faster damage kills or flees before hopeless
shouting — SH confirm beast congregation per the prereg
fallback rule); pilot outcomes included 2 vDie, both in
no-ally SH fights.
Per-variant confirm medians (total damage / rounds / outcomes):
- FS-C1: 87.5 / 2 / 12 vFlee.
- FS-C2: 95.5 / 2 / 12 vFlee.
- FS-V2: 95.5 / 2 / 12 vFlee (identical to FS-C2, see C2).
- FS-V3: 99.5 / 2 / 11 vFlee + 1 vDie.
- CORN-V2: 71.5 / 1 / 12 vFlee, rear B 12/12.
- SH-C1: 71.5 / 1 / 12 vFlee, shout 3/12.
- SH-V2: 71.5 / 1 / 12 vFlee, shout 3/12 (identical to SH-C1
  on every stream — the second vid changes nothing here either).
Kills/drive-offs 0/96 overall. From-start join 48/48 FS
confirm fights; shout join 8/32 SH fights total (pilot +
confirm), each exactly once.
Charges lines in the whole corpus: exactly 2 distinct lines,
both naming ally A (grey-streaked hair) as joiner and the leader
(calloused knuckles) as fighter. Strike actors in the whole
corpus: exactly 2 — leader and A. No third name ever strikes.

## What the village looked like, in plain words

Three villagers walk up to the beast. One fights. One, the friend
at the door, charges in, lands a single small blow, and takes a
blow worth more than a person's whole health in return. The
third — the broad-framed man who marched out with them — never
lifts a weapon, never takes a wound, never even gets named,
unless the fight is a sortie, in which case the log notes at the
end that he stood at the back watching the treeline. When the
leader fights alone and starts losing, a friend does come
running at the shout — and arrives just in time to watch the
leader run: the shout comes when the leader is already past
holding, so the rescue has no round to fight in. And the two
friends standing nearby do steady the leader's nerve — that
courage is real, and on one stream it is what got the leader
killed, holding for a second round instead of running while
running still worked. So "a party, fully geared" through this
engine is, honestly: one fighter, one friend who may die in the
first exchange, one watcher, and a little extra nerve from
having company. The yardstick's "2 allies" is not a party the
engine can field — it is a party the engine can only narrate
from the rear.

## Sense-testing (full transcripts read, not just counted)

- FS-V2 confirm s201 (vFlee, 2 rounds, total 115): volley 3/3
  for 45, A "already at the door — charges in", leader strikes
  33, A strikes 6, Absolution hits A for 136 (0 left, "goes
  down!"), leader strikes 31, absorbs 27, takes 36 (64 left),
  "sees how this ends — and runs while running still works."
  Reads as people fighting; B is absent without comment, which
  is the finding, not a narration bug — except that a reader
  counting marchers would find one missing. (Non-cornered
  fights have no rear line; only sorties account for leftovers.)
- SH-V2 confirm s204 (vFlee, 2 rounds, total 95): volley 2/3,
  leader strikes 35, absorbs 47, takes 61 (39 left); round 2:
  strikes 32, absorbs 28, takes 37 (2 left); "is losing —
  shouts for help! ... charges in!"; then immediately "answered
  the shout, but ... past holding — they run." The rescue that
  arrives too late reads as tragedy, not a bug — but it means
  the shout path's ally is a witness, not a reinforcement, on
  this band.
- CORN-V2 confirm s204: byte-identical to SH-V2 s204 plus the
  rear line naming B. The rear line is honest and complete —
  it is the engine's own answer to "where did the second ally
  go," and it only exists for sorties.
- Known blanks, neither chased (DIAG only): the beast is
  unnamed in fixture logs ("something" — knowledge-gating,
  coherent); volley lines say "arrow"/"bow" for every weapon
  (the volleyfix blank, unchanged).

## Wall numbers

NOT OBSERVABLE on this substrate, stated structurally per the
prereg (not as 0s): a fixture band has no village trajectory,
no scale ladder, and no win flag, so national / table / wins /
wave reach cannot be read off it. The wall relevance is the
bound this census establishes: the wave-4 demand shape "party"
cannot exceed leader + 1 fighting ally through fieldFight, and
the second ally's only engine-real effects are morale-count
courage (which can kill) and, in sorties, a rear-guard line.
Any yardstick, demand, or readiness bar that prices "2 allies"
as fighting strength is pricing something the engine cannot
field — it must be re-expressed for a 2-fighter engine, or the
engine must gain a genuine multi-ally path, by design decision.

## Panel (§15)

NOT APPLICABLE, and none fabricated. scripts/balance-panel.js is
a policy-comparison driver: it runs registry policies on ONE
frozen root and compares panel outputs. It cannot express this
arm's substrate (a forced-meeting fixture band with no policy,
no sim days, and a party-size/entry-path ladder as the
comparison) and it has no fixture mechanism. The judge is the
pre-registered census + determinism gate above (same rationale
class as volleyfix-b / partyvolley-b / spearxbow-a / sighit-a).

## Metric review (applies to the NEXT run, never a re-score of this one)

1. The C3 ally-down prong was unobservable (0/32 SH fights with
   a fallen shouted ally) because the shouted ally never gets a
   round on this band. A future shout-mechanism prereg should
   either use a weaker beast / sturdier leader where the
   shouted ally survives to round 2+, or pre-register the
   prong as "max shouts <= 1" alone and treat re-shout-after-
   fall as a static-census claim (helpCalled never reset),
   which is what this run effectively did.
2. The first-token name match for B strikes was vacuous as
   first written (displayName returns descriptions, not first
   names) and was caught before judging: the fixture was fixed
   to descriptor-grounded detection (actors read off the
   engine's own door/rear lines) and the corpus regenerated,
   with zero field diffs outside the fixed fields. Future
   fixture preregs should state the name-resolution method
   (descriptor, not first name) up front.
3. The count channel (FS-C1 vs FS-C2 vs FS-V3) earned its
   place: without the count-controlled C2, partyvolley's P2 ==
   P3 identity left the morale-count confound open. Future
   party preregs should always include a count control.
4. Pilot stream luck: SH eater pilot shouted 0/4 while SH
   congregation pilot shouted 2/4 on the same streams — beast
   speed changes shout observability. The prereg's fallback
   rule (congregation preferred, eater second) worked as
   designed; keep it.
5. EPERM flap, second sighting in this loop family: the first
   corpus write failed (0-byte file left behind), plus five
   retry-loop failures with empty redirected logs, then writes
   cleared and the corpus landed whole (198,831 bytes) with
   byte-identical re-runs. Fixture scripts should keep the
   sighit-a recovery pattern in mind (sweep to a scratch dir,
   copy with retries in the same command) if the flap returns.

## Ranked next arms (for the coordinator — not chased here)

1. ENGINE-CAP DECISION (highest value, needs a call — carried
   from partyvolley-b / spearxbow-a, now closed as a question):
   the 2-ally yardstick component is unfieldable. Either
   re-express the wave-4 "party" demand for a 2-fighter engine
   (leader + 1 ally + morale-count courage, priced honestly
   including the FS-V3 death case), or commission a genuine
   multi-ally engine path (array fighter state, second strike
   + target share, re-shout rules), or recompute the yardstick
   for 2 fighters. A fixture cannot resolve this.
2. SHOUTED-ALLY STILLBORN MEASUREMENT: on weaker beasts or
   with a sturdier leader, does the shouted ally ever get a
   round? If the shout always fires past holding, the shout
   path is narration-only at every scale, and the "one ally
   answers per fight" comment overstates it.
3. BOND-AVERAGE CHANNEL: with a village that has real bonds,
   does FS-V2 diverge from FS-C2 (bondCombatBonus averaging
   over [A] vs [A,B])? Fresh-state bonds are inert here; bonded
   villages are unmeasured.
4. COUNT-CHANNEL PRICING on live sorties: the morale-count
   effect (hold longer, sometimes die) was measured on a
   fixture band only. A live-sortie arm could price whether
   mustering extra watchers (who never fight) helps or harms
   survival — the FS-V3 stream-204 death says "harms" is
   possible.

## Convergence state

measured (no game change): the scale-onramp axis gains a closed
question from this arm — the second-ally cap is now attributed
exactly (truncation + single-scalar state + helpCalled lock;
caller staging exonerated) with count-controlled identity proof
and a priced morale-count side channel. The axis does not gain
a lever: no fix was built (DIAG ONLY by task + backlog), and the
wave-4 demand shape remains unfieldable as written. The binding
constraints after this arm are unchanged in kind and sharper in
form: the engine-cap decision (next arm 1) and the morale flee
rule / damage race named by sighit-a.

## Files

- Pre-registration: evidence/2026-10-31/sim-allycap-a-prereg.md
- Evidence: evidence/2026-10-31/sim-allycap-a.md (this file)
- Fixture: scripts/allycap-fixture-20261031.js
- Proof: scripts/test-allycap-20261031.js (38/38 GREEN)
- Corpus: evidence/2026-10-31/perseed-allycap-a/fixture-band.json
  (96 fights; sha256 293541bc3251 for the proof's det gate —
  recompute from the file; the corpus file itself is the record)
