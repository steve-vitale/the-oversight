# Journey social r63 — PRE-REGISTER (lane B, 2026-10-28)

Written before any r63 seed ran. Leg 5 (social life), cycle r63.
Rotation-b read 5 at run start. This run ADVANCES rotation-b to 6
at closeout: leg 5's named-next question after r62 is the WILD
INVITATION SCORING run (see below). (Rotation note: r62 advanced
5 -> 6 at its closeout, but the file reads 5 again at this run's
start — the same clobber class as the r59/r60/r61/r62 clobbers, a
later sibling write landing after r62's. The file is the
authority, and leg 5 also carries the named-next question, so
this run plays social again and writes 6 itself at closeout.)

## Follows

- r62 (lane B, 2026-10-28, merged locally pending ship): B7
  FIX-SCORING GO — pooled dry-family 0.266/convo (r61: 2.245),
  end-on-dry 0.0% (r61: 65.7%), all remaining dry dry9, cold-open
  baseline 0.56% (9/1618). Guardrails: no-offer 12.4%, late picks
  297, deep2 127, alive 7/8/0/0. r62's metric review named one
  open method item (engine-counter gap +3.9%, closing-sequence
  lines outside the driver transcript) — NOT this run's question;
  it stays a fixing-lane note.
- tackle-invite (89d3c1ee4, in master, shipped 20261028-052429):
  character-driven invitation decisions — shared
  npcInviteDecision (temperament, trust, relationship, stakes,
  goal, clamped 5-95, sick lure veto) wired into party invites
  (player -> villager) and NPC lure takes (villager -> villager
  plots). Its proof (scripts/test-invite-accept-character.js,
  15/15) used PINNED rolls in fixtures, not wild runs. What it
  did NOT change, deliberately: the player's own accept/decline
  of an NPC invitation (player's choice, never automated);
  backstabber always-yes party accepts (designed plot trap);
  visitor invite-to-stay (Haven panel button, not conversation).
- Memory 2026-10-28 line 64 (pre-tackle-invite wild note): NPC
  lures 6/15 accepted (40%) in live play; player-side
  conversation invitations 0/5 taken (driver never picks
  betrayal:accept). The lure figure is the wild baseline this
  run re-measures under the new decision function.

## Leg questions

- (Q1) WILD INVITATION SCORING: in natural full runs, do the
  landed character decisions actually fire, and do they decide
  like characters — lure-take rate + character split (warm/bond
  vs hostile bands), sick-lure vetoes, and party-probe decision
  rate? This is the first wild measurement of tackle-invite.
- (Q2) DRY REPLICATION: does r62's B7 census hold on fresh
  seeds (same driver definition, same bars)?
- (Q3) COLD OPEN vs r62 baseline 0.56% (first NPC 'them' line
  matching one of the 12 deflection lines, per conversation).
- (Q4) PEOPLE: do the sense-reads still read like people —
  0 fabricated-history flags, weak endings <= 1?

## Arms (fresh seeds 5801-5804, smoke 5805 30d, DAYCAP=140, death-aware)

ALL linger, seeded-speaker steering ON (constant, excluded from
the natural funnel, as r56-r62). Policy is r62's verbatim
EXCEPT two declared, driver-only additions (zero src/js):

(a) npcInviteDecision RECORDING WRAP: driver wraps
Game.npcInviteDecision in runWorld (same wrap pattern as the
r48/r59 wraps). The wrap calls through unchanged and records
{day, kind, invitee, inviter, chance, accept, veto, inputs,
reasons} per decision. It consumes NO RNG (no Math.random call
in the wrapper; the decision's own roll is the game's). Lure
decisions fire naturally via npcPlotTick during day ticks;
party decisions fire only when the probe (b) issues an invite.
Backstabber party accepts bypass the decision by design and
are NOT counted; visitor invite-to-stay is NOT counted.

(b) PARTY PROBE: at most one probe pick per day — in a
non-seeded deep conversation, after gossip + ans + linger and
before the others-steer, if 'invite_party' is offered, pick it
and mark the convo partyProbePick. Probe convos STAY in the dry
census (same definition as r62; the probe changes at most one
pick per day and is declared here, not hidden). The wrap tags
a party decision as probe when it fires during the probe
pick's convoTurn (day + invitee match).

No other policy change. The player-side accept/decline of NPC
invitations is NOT measured: the driver never picks
betrayal:accept, so any player-side take rate would be a
driver artifact, not a game finding. That half stays open and
is named, not claimed.

## Bindings (a miss is NO-GO, never re-scored)

- F1 dry-family < 1.0/convo pooled (r62: 0.266). A miss is a
  REPLICATION FAILURE (B7 does not hold on fresh seeds), not a
  game regression — this run changes zero src/js.
- F2 end-on-dry < 20% pooled (r62: 0.0%). Same reading as F1;
  both bars must pass for a dry REPLICATION GO.
- M5 people: 5 sense-reads, 0 fabricated-history flags, weak
  <= 1 (r62's floor), >= 2 dry-bearing or cold-open. At least
  1 of the 5 must be a party-probe or lure-adjacent read when
  such material exists; if no probe decision fires on any seed,
  M5 falls back to r62's composition and the shortfall is
  reported as an instrument finding, not a people failure.
- LURE (report-only + interesting-finding rules, no bar):
  pooled lure decisions >= 10 AND accept rate strictly between
  0% and 100% AND a visible character split (warm/bond band
  accepts above hostile band) => CHARACTER-DECIDES-IN-WILD.
  Accept rate 0% or 100% on >= 10 decisions => WART (the fix
  does not move wild decisions). Fewer than 10 pooled lure
  decisions => INSUFFICIENT DATA, not a verdict (plots are
  sparse; the count itself is the finding).
- PARTY-PROBE (report-only): offers, decisions, accepts
  reported per seed + pooled. Fewer than 5 pooled probe
  decisions => INSUFFICIENT DATA for a party rate (offer
  sparsity is the finding — cf. tackle-invite after.md: the
  invite choice never surfaced in neutral-turn probes).
- COLD: cold-open rate reported per seed + pooled vs r62's
  0.56%; >= 10% => wart (r62's rule, carried). No new bar.
- D1/D2 census completeness (r62's bars, carried): dry census
  + mechanism split + invite census reported for all 4 seeds;
  a seed with zero instrumented conversations fails D1.
- G guardrails (report-only, not bars): no-offer rate, late
  picks, deep2 pairs, villages alive — reported against r62
  (12.4%, 297, 127, 7/8/0/0).
- NO-REGRESSION: check.js --quick at the CURRENT base profile
  (r62's profile was 278/9; if the base moved, the actual
  profile is recorded and any NEW failure vs that profile
  fails the run — r62's list is not assumed current).
- Bars explicitly NOT adopted: any lure or party accept-rate
  threshold (first wild measurement); any cold-open threshold
  other than r62's carried 10% wart rule; any dry threshold
  other than 1.0 / 20%.

## Interesting-finding rule (pre-registered)

- Dry replication GO (F1+F2 pass) AND lure
  CHARACTER-DECIDES-IN-WILD => invitations join dry as
  scored-in-the-wild; the social leg's next question becomes
  the residual dry9 burden (1 in 5 conversations still stalls
  once) or the player-side accept half, whichever the
  tackle-all coordinator has not already taken.
- Dry replication GO but lure INSUFFICIENT DATA => report the
  census as measured; the wild invitation question stays open
  and the next run needs a denser plot instrument (not a
  lower bar).
- Dry replication FAIL => B7's wild hold is seed-fragile; the
  next run must find why before any new social question.
- Lure WART (0%/100% on >= 10) => the pinned-fixture win does
  not transfer; the next run must find why (fixture vs wild
  pick mix is the first suspect, as r62's prereg noted for B7).

## Metric review (§14 — mandatory section in the evidence file)

Pre-registered metrics bind the run — a miss is NO-GO, never
re-scored against a friendlier metric mid-run. Metric doubts
go here for the NEXT run. In particular: r62's numbers are a
share-level baseline only (fresh seeds); no matched-seed or
turn-identity claim is made; lure/party rates are first wild
measurements with no baseline bars by design; the probe pick
is a declared policy delta vs r62, so dry replication is
share-level, not trajectory-matched.

## Telemetry

Deviation check vs telemetry-baselines/social.json (metrics
l3.bonds, l3.deep2, dryRate — r57-r62's exact set) after the
evidence is written. A LOUD line is a same-run investigation
item before any baseline roll; r62's l3.deep2 LOUD line was an
EXPLAINED schema artifact (baseline predates the deep2 key)
and the baseline was NOT rolled — the same practice applies
here unless a LOUD line is a real deviation.

## What would count as an interesting finding

Any of: a wild lure accept rate with a character split (the
tackle-invite fixture win transferring to plots); a wild
party decision at all (the invite choice surfacing in natural
play, given the neutral-probe sparsity note); a dry
replication miss on fresh seeds; a cold-open rate that names
a new wart; a sense-read where an invitation decision lands
as character rather than a roll.
