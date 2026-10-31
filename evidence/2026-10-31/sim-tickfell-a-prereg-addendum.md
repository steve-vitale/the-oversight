# sim-tickfell-a — prereg addendum (committed BEFORE any judged leg; bars otherwise unchanged)

## Death, defined (clause (c) clarification)

The prereg's clause (c) says "no death moves earlier versus
the control legs" and glosses the death day as "any death
in the run's death record, or a game-over before day 30".
That gloss is TOO BROAD as written, and this addendum
narrows it before any leg runs, for a reason visible in
the prior corpora themselves: a judged corpus's death
record is dominated by background monster and NPC deaths
(e.g. the lackingline ON corpus for 15215 records monster
deaths on days 3, 7, 8 and an NPC ambush death on day 17
alongside the vessel's own death). Those background deaths
shift under any trajectory divergence and are not the
stranded villager's fate, so judging clause (c) on them
would fail any arm that changes anything at all, for
noise reasons — including a tickfell leg whose fell
succeeds and rescues.

Narrowed definition, used for clause (c) only: a DEATH
is (i) the earliest death record in the run with
player:true (the scholar/vessel's own death — the
stranded villager dying, including a death that ends
the strand by succession), or (ii) a game-over before
day 30 (daysAlive < 30 with endReason game-over).
Clause (c) FAILS iff a tickfell leg's death day is
earlier than its same-WOODWARM control leg's death day
under this definition, or the tickfell leg dies (by
(i) or (ii)) while its control survives 30 days with
no player death. Monster and NPC deaths (player:false)
are still reported in the census for context; they
neither pass nor fail clause (c).

No other bar changes. In particular the rescue
definition (woodcarry bucket creek + rescued true on
the same loop-day) and the strand-length definition
(total still count AND maximal still-run length, both
non-increasing on both legs) stand exactly as
pre-registered. This addendum is committed before the
pilot legs run, so no judged number depends on it
retroactively.
