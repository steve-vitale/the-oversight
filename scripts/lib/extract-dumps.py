#!/usr/bin/env python3
"""extract-dumps.py -- recover evWrite STDOUT-DUMP sections from a driver run.

Reads stdin, finds:
  ===== STDOUT-DUMP <name> BEGIN =====
  ...content...
  ===== STDOUT-DUMP <name> END =====
and writes each <name> to OUTDIR with retry (the container's EPERM write
flap is intermittent; we wait it out instead of losing evidence).

Usage: node scripts/journey-xxx.js 2>&1 | python3 scripts/lib/extract-dumps.py <outdir>
Prints RECOVERED <name> per file, and a final RECOVERY-SUMMARY line.
"""
import sys, os, time, re

outdir = sys.argv[1] if len(sys.argv) > 1 else '.'
os.makedirs(outdir, exist_ok=True)

BEGIN = re.compile(r'^===== STDOUT-DUMP (\S+) BEGIN =====\s*$')
END = re.compile(r'^===== STDOUT-DUMP \S+ END =====\s*$')

current = None
buf = []
recovered = []
lost = []

def flush():
    global current, buf
    if current is None:
        return
    name, lines = current, buf
    current, buf = None, []
    data = '\n'.join(lines)
    fp = os.path.join(outdir, name)
    for attempt in range(120):  # up to ~10 min
        try:
            with open(fp, 'w') as f:
                f.write(data)
            recovered.append(name)
            print(f"RECOVERED {name} ({len(data)} chars)", flush=True)
            return
        except OSError as e:
            if attempt % 12 == 0:
                print(f"  retrying {name}: {e} (attempt {attempt})", flush=True)
            time.sleep(5)
    lost.append(name)
    print(f"LOST {name} after 120 attempts", flush=True)

for line in sys.stdin:
    line = line.rstrip('\n')
    m = BEGIN.match(line)
    if m:
        flush()
        current = m.group(1)
        buf = []
        continue
    if END.match(line):
        flush()
        continue
    if current is not None:
        buf.append(line)
flush()
print(f"RECOVERY-SUMMARY recovered={len(recovered)} lost={len(lost)}", flush=True)
if lost:
    print("LOST-FILES: " + " ".join(lost), flush=True)
