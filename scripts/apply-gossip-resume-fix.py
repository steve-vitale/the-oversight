#!/usr/bin/env python3
# One-shot refactor: extract convoGossipBeat(vid) from convoAskTopic's gossip
# block and wire a gossip branch into convoThreadBeat. Line-surgery (no
# backslash-laden regex matching).
import re, sys

P = 'src/js/conversation.js'
lines = open(P).read().split('\n')

# --- 1. locate the gossip if-block inside convoAskTopic ---
start = next(i for i, l in enumerate(lines)
             if l == "      if (topic === 'gossip') {")
# brace-match to the block end
depth = 0
end = None
for i in range(start, len(lines)):
    depth += lines[i].count('{') - lines[i].count('}')
    if depth == 0:
        end = i
        break
assert end is not None, 'gossip block end not found'
block = lines[start:end + 1]
# sanity: block ends with the voiceLine return
assert 'return this.voiceLine(vid, line) || exh();' in block[-2], block[-3:]

# body = block minus the if/} lines, dedented 2
body = [l[2:] if l.startswith('  ') else l for l in block[1:-1]]
# drop the thread-setting line (callers own their thread state now)
body = [l for l in body if l.strip() not in ("c.thread = 'gossip'; c.depth = 1;")]
# replace the final voiceLine return with a raw-line return
body = [l if 'return this.voiceLine(vid, line)' not in l
        else l.replace('return this.voiceLine(vid, line) || exh();', 'return line;')
        for l in body]

helper = []
helper.append('    // convoGossipBeat: one gossip beat from the gossip engine, captured')
helper.append('    // into a speakable line. Shared by the ask:gossip topic and by thread')
helper.append('    // resumptions/follow-ups (convoThreadBeat). Returns the raw line (may be')
helper.append("    // '' when the engine said nothing); the caller voices. The gossip engine")
helper.append('    // always speaks at least its honest dry admission ("Quiet lately. Too')
helper.append('    // quiet, maybe."), so a resume beat is never a lie.')
helper.append('    convoGossipBeat(vid) {')
helper.extend(body)
helper.append('    },')
helper.append('')

new_block = [
    "      if (topic === 'gossip') {",
    '        // THE SOCIALITE\'S VERB: "heard anything about anyone?" The gossip',
    '        // engine lives in askAbout (game.js); convoGossipBeat captures its',
    '        // beats into a speakable line. (askedTopics already gates this to',
    '        // once per conversation.)',
    '        const line = this.convoGossipBeat(vid);',
    "        c.thread = 'gossip'; c.depth = 1;",
    '        return this.voiceLine(vid, line) || exh();',
    '      }',
]

out = lines[:start] + new_block + lines[end + 1:]

# --- 2. insert the helper before convoThreadBeat ---
idx = next(i for i, l in enumerate(out) if l == '    convoThreadBeat(vid) {')
out = out[:idx] + helper + out[idx:]

# --- 3. add the gossip branch in convoThreadBeat, before the TOPIC PACK line ---
tidx = next(i for i, l in enumerate(out)
            if l.strip() == 'else if (this.topic2Has && this.topic2Has(t)) l = this.topic2Beat(vid);')
branch = [
    '      // GOSSIP THREAD (journey-social r28 2026-10-19): resuming an open',
    '      // gossip thread (or a follow-up on it) must deliver the gossip',
    "      // engine's next beat — the old fall-through returned null and the",
    '      // resume stalled: generic echo, then winddown with no content',
    '      // (transcript-verified r27, Christian d34). The engine honestly',
    '      // declines when the pool is dry ("Quiet lately. Too quiet, maybe."),',
    '      // so the beat is content, never a lie.',
    "      else if (t === 'gossip') {",
    '        l = this.voiceLine(vid, this.convoGossipBeat(vid)) || null;',
    '      }',
]
out = out[:tidx] + branch + out[tidx:]

open(P, 'w').write('\n'.join(out))
print('refactor applied; helper + branch inserted')
