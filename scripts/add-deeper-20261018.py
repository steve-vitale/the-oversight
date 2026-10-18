#!/usr/bin/env python3
# add-deeper-20261018.py -- surgical content insertion for #541 (playtest
# deepening r18). Adds a "deeper" beat to each of the 36 curious bespoke
# questions in src/data/characterGen.json: the NPC's own substantive
# reflection on their question (their stake, not the player's). Inserted
# textually after each question's "follow" line to preserve the file's
# byte style (no full JSON rewrite).
import re, sys

PATH = 'src/data/characterGen.json'

DEEPER = {
 "q_origin": "Me? {origin}. I still dream in its weather \u2014 rain on a tin roof, that specific smell. I wake up here and for a second I'm furious at the sky for the swap.",
 "q_plan": "Mine's simple: learn one useful thing a week. This week it's {skill}. A plan's just a direction you argue with.",
 "q_scared": "Me? Every day. I was {an_occ} \u2014 fear was a rumor there. Here it's the weather. You dress for it.",
 "q_miss": "Hot showers. Not the big things \u2014 the small, stupid, perfect things. {origin} in the morning, coffee going, nobody trying to kill me. I miss being bored.",
 "q_trust": "I'll tell you what I tell everyone: watch what I do when nobody's watching. That's the whole of me. The rest is just talking.",
 "q_think": "I think we're an experiment someone forgot to label. And the unlabeled part is what scares me \u2014 it means nobody's coming to check the results.",
 "q_hands": "These hands? {Occ} hands. Clipboards, mostly. Now they hold wire and wood, and they learn fast. Hands are honest that way.",
 "q_read": "Watch the quiet ones. Not the loud \u2014 the loud tell you everything. The quiet are either thinking or planning, and you can't tell which until it matters.",
 "q_theory": "My theory changes weekly. This week's: we're the control group. Somewhere there's a village that got instructions, and we're the ones they just... watched. Cheerful thought, right?",
 "q_night": "I sleep in shifts now \u2014 two hours, up, listen, two more. My body learned it before my head agreed. {origin} never taught me that. The treeline did.",
 "q_laugh": "Me? I laughed yesterday and it scared me \u2014 the sound of it. Like my body remembered something my head hadn't approved. Laughter's a mutiny. A good one.",
 "q_quiet": "Strangers are just people you haven't disappointed yet. That's what my mother said. Terrible advice, but it got me through parties.",
 "q_first_memory": "Mine's {origin}, I think \u2014 heat on pavement, someone's hand huge around mine. Or I invented it. First memories are half real and half the story you needed.",
 "q_regret": "I regret the ordinary days I rushed through. All those {origin} mornings I spent annoyed at small things. I'd pay anything for one annoyed morning now.",
 "q_skill": "I can {skill}. Not well \u2014 well enough that nobody's died from it yet. That's my whole r\u00e9sum\u00e9 now: nobody's died from it yet.",
 "q_believe": "I believe in breakfast. In people showing up. Small, provable things. The big beliefs all broke \u2014 the small ones held.",
 "q_someone": "I don't distrust anyone exactly \u2014 I just haven't finished trusting most of them yet. There's a difference. A slow one.",
 "q_change": "I used to be {an_occ} who worried about being on time. Now I worry about being alive. Same worry, bigger font. So yes \u2014 and also no.",
 "q_guilty": "I don't answer that one myself. Not yet. Maybe when I've decided whether surviving counts as an excuse or just a reason.",
 "q_hope": "A full night's sleep. Not safety, not answers \u2014 just eight hours where nothing needs me. That's my whole theology now.",
 "q_alone_time": "I go to the treeline edge and count my breaths. Ten of them. That's my alone. Then I come back \u2014 alone is a luxury, and also a little bit a lie.",
 "q_laugh_memory": "Three days ago. Someone dropped a whole basket of tubers and we just stood there laughing. It wasn't even funny. It was the standing there.",
 "q_teach_me": "Here's one: {skill}. Watch \u2014 no, like this. See? Your hands learn faster than your head. They always do.",
 "q_stay": "I stay where I'm useful. Right now that's here. {origin} is a direction, not a plan. Here is a plan, even if it's a hard one.",
 "q_system_fear": "That we're interesting to it. Being watched means being kept. I'd rather be boring to the sky. Boring things get left alone.",
 "q_kindness": "Someone saved me the last of the stew once. Didn't say anything, just put the bowl down and walked off. I think about that bowl more than I think about the monsters.",
 "q_before_skill": "Being {an_occ} taught me to read people fast \u2014 who's lying, who's scared, who needs a job. Turns out that's a survival skill. Who knew.",
 "q_fight": "I don't keep score on that. Score-keeping is how you stop sleeping. I do what the day needs and I don't rehearse it after.",
 "q_song": "Under my breath, when I'm working. Old songs from {origin}. The words are half gone but the tune holds. Tunes outlast everything.",
 "q_first_week": "Spite, mostly. Pure, clean spite at the sky. Then someone shared food with me and the spite turned into something else. I still don't have a word for the something else.",
 "q_angry": "Anger's a fire \u2014 useful if you cook with it, deadly if you sleep next to it. I cook with mine. Most days.",
 "q_dream": "{origin}, always. Same dream: I'm walking home and the street keeps getting longer. I wake up tired, like I actually walked it.",
 "q_left_behind": "I don't talk about that. Not because it's secret \u2014 because saying it out loud makes it real in a way I can't afford yet. Someday. Not today.",
 "q_name_day": "I count meals, not days. Three meals since the rain. Two since the alarm. Days are for people with calendars. I have a stomach.",
 "q_useful": "{skill}. Sounds small. But small useful things stack \u2014 and one day you look up and you're the person everyone asks. That's how it happens.",
 "q_fun": "I was {an_occ} \u2014 fun was whatever I could steal between shifts. Now fun is watching the fire and not being afraid. It's a downgrade and an upgrade.",
}

def main():
    with open(PATH, encoding='utf-8') as f:
        text = f.read()
    lines = text.split('\n')
    out = []
    cur_id = None
    inserted = set()
    for i, ln in enumerate(lines):
        out.append(ln)
        m = re.search(r'"id":\s*"(q_[a-z_0-9]+)"', ln)
        if m:
            cur_id = m.group(1)
        # after the follow line of a question, insert the deeper line
        if cur_id and cur_id in DEEPER and cur_id not in inserted and re.search(r'"follow":', ln):
            indent = ln[:len(ln) - len(ln.lstrip())]
            deeper = DEEPER[cur_id].replace('\\', '\\\\').replace('"', '\\"')
            # the file wraps spoken lines in escaped quotes: "\"...\""
            deeper_line = indent + '"deeper": "\\"' + deeper + '\\""'
            if out[-1].rstrip().endswith(','):
                # follow was NOT the last key (more keys follow) — deeper needs one too
                deeper_line += ','
            else:
                # follow was the last key — give it a comma, deeper stays bare
                out[-1] = out[-1].rstrip() + ','
            out.append(deeper_line)
            inserted.add(cur_id)
    # verify every follow line we inserted after ends with a comma
    missing = set(DEEPER) - inserted
    if missing:
        print('MISSING (no follow line found):', sorted(missing))
        sys.exit(1)
    with open(PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out))
    print('inserted deeper for', len(inserted), 'questions')

if __name__ == '__main__':
    main()
