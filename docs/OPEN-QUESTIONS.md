# OPEN QUESTIONS for Steve

Only questions **not already answered** in `docs/godpath/STEVE-ANSWERS.md`.
Check that file first. When Steve answers, copy his words there (dated) and
delete the question here. The early-October list is archived in
`docs/_archive-OPEN-QUESTIONS-2026-10-03.md`.

Format: question, the default in place now, and where the lever is.

1. **Second-person bios.** Generated villager bios sometimes address the
   player as "you". Is the System's assessment allowed to speak to the player
   there?
   - Default: treated as a bug; test quarantined (`test-backgrounds-20261006`).
2. **Skill pairings for jobs.** New background skills given to jobs:

   | Job | Skills |
   |---|---|
   | locksmith, street artist | thief |
   | mortician | grave robber |
   | hunting guide | scarecrow, come get some |
   | exterminator | tripwire |
   | soldier | tripwire, shield wall |
   | rancher | shoulder check, hogtie |
   | police officer | hogtie, bodyguard |
   | bartender | come get some |
   | firefighter | draw fire, rally |

   - Default: as listed (`knowledge.json` backgrounds).
