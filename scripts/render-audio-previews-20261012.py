#!/usr/bin/env python3
"""Render labeled MP3 previews of the game's synth SFX/music, v2.

v2 (2026-10-12): Steve judged v1 "generic synth garbage" — fair. The v1
recipes were bare oscillators with simple envelopes. v2 rebuilds the engine:
FM synthesis (bells, brass, growls), filtered noise (static, thumps, breath,
squelches), tape-stop pitch drops, wow/flutter, bit-crush, layered detuned
voices, and per-sound design intent. Palette: haunted broadcast (wave 4-5 are
TV/media horror) + organic FM horror for the fleshy ones.

Each recipe carries (monster, wave, trigger, intent) — printed as labels.
Deterministic: every sound seeded, so re-renders are byte-stable-ish.
Output: ~/workspace/your_files/audio-previews/*.mp3 + LABELS.md
"""
import numpy as np, os, subprocess, sys

SR = 44100
OUT = os.path.expanduser("~/workspace/your_files/audio-previews")
os.makedirs(OUT, exist_ok=True)

# ---------------- toolkit ----------------
def t_lin(dur):
    return np.arange(int(dur * SR)) / SR

def adsr(n, a, d, s, r, peak=1.0):
    """Attack/decay/sustain-level/release envelope over n samples."""
    na, nd, nr = int(a*SR), int(d*SR), int(r*SR)
    ns = max(0, n - na - nd - nr)
    parts = []
    if na: parts.append(np.linspace(0, peak, na))
    if nd: parts.append(np.linspace(peak, peak*s, nd))
    if ns: parts.append(np.full(ns, peak*s))
    if nr: parts.append(np.linspace(peak*s, 0, nr))
    e = np.concatenate(parts) if parts else np.zeros(n)
    if len(e) < n: e = np.pad(e, (0, n-len(e)))
    return e[:n]

def exp_decay(n, tau, peak=1.0):
    t = np.arange(n)/SR
    return peak*np.exp(-t/tau)

def osc(freq, dur, kind="sine", phase=0.0):
    """freq: scalar or array. Returns waveform."""
    t = t_lin(dur)
    f = freq if np.ndim(freq) else np.full_like(t, float(freq))
    ph = 2*np.pi*np.cumsum(f)/SR + phase
    if kind == "sine": return np.sin(ph)
    if kind == "tri":
        return 2*np.abs(2*((ph/(2*np.pi)) % 1)-1)-1
    if kind == "saw":
        return 2*((ph/(2*np.pi)) % 1)-1
    if kind == "square":
        return np.sign(np.sin(ph))
    raise ValueError(kind)

def fm(fc, fm_f, index, dur):
    """FM synthesis. fc/fm_f scalar or array; index scalar or array."""
    t = t_lin(dur)
    c = fc if np.ndim(fc) else np.full_like(t, float(fc))
    m = fm_f if np.ndim(fm_f) else np.full_like(t, float(fm_f))
    idx = index if np.ndim(index) else np.full_like(t, float(index))
    mod = np.cumsum(2*np.pi*m)/SR
    car = np.cumsum(2*np.pi*c)/SR
    return np.sin(car + idx*np.sin(mod))

def noise(dur, seed=0):
    rng = np.random.default_rng(seed)
    return rng.standard_normal(int(dur*SR))

def filt(x, kind, cutoff, q=0.8):
    """Smooth FFT filter. cutoff scalar Hz or (lo,hi) for bandpass."""
    n = len(x)
    X = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(n, 1/SR)
    if kind == "low":
        H = 1/(1+(freqs/max(cutoff,1))** (2*q+2))
    elif kind == "high":
        H = 1/(1+(max(cutoff,1)/np.maximum(freqs,1))** (2*q+2))
    elif kind == "band":
        lo, hi = cutoff
        H = 1/(1+(np.maximum(freqs,1)/hi)**8) * 1/(1+(lo/np.maximum(freqs,1))**8)
        H = 1/((1+(freqs/hi)**6)*(1+(lo/np.maximum(freqs,1))**6))
    else: raise ValueError(kind)
    return np.fft.irfft(X*H, n)

def wow(x, rate=5.5, depth=0.006):
    """Tape wow/flutter: resample with slow pitch LFO."""
    n = len(x); t = np.arange(n)/SR
    src = np.arange(n) + depth*SR*np.sin(2*np.pi*rate*t)/ (2*np.pi*rate)
    src = np.clip(src, 0, n-1)
    i0 = src.astype(int); frac = src - i0; i1 = np.minimum(i0+1, n-1)
    return x[i0]*(1-frac) + x[i1]*frac

def crush(x, bits=8):
    q = 2**bits
    return np.round(x*q)/q

def pitch_drop(f0, f1, dur, curve=3.0):
    """Exponential pitch drop f0->f1 (tape stop feel)."""
    t = t_lin(dur)
    k = (np.exp(curve*t/dur)-1)/(np.exp(curve)-1)
    return f0*(f1/f0)**k

def place(base, x, at):
    i = int(at*SR); n = len(x)
    if i < len(base):
        j = min(len(base), i+n)
        base[i:j] += x[:j-i]
    return base

def finish(x, peak=0.89):
    x = np.tanh(x*1.1)
    m = np.max(np.abs(x))
    if m > 0: x = x/m*peak
    return x.astype(np.float32)

def heartbeat(dur, bpm0=70, bpm1=40, seed=1):
    """Two-thump heartbeat slowing bpm0->bpm1, then stops partway."""
    x = np.zeros(int(dur*SR)); t = 0.0; i = 0
    while True:
        k = t/dur
        bpm = bpm0 + (bpm1-bpm0)*k
        if t > dur*0.75: break
        for dt, amp in ((0.0, 1.0), (0.16, 0.6)):
            th = filt(noise(0.12, seed+i), "low", 180)*exp_decay(int(0.12*SR), 0.03)*amp
            x = place(x, th, t+dt)
        t += 60.0/bpm; i += 1
        if i > 40: break
    return x

def bell(f0, dur, seed=0, bright=1.0):
    """Inharmonic FM bell."""
    n = int(dur*SR); t = t_lin(dur)
    idx = 6*np.exp(-t/0.4) + 1.2*np.exp(-t/1.2)
    y = fm(f0, f0*2.76, idx*bright, dur)
    y += 0.4*fm(f0*2.01, f0*2.01*2.4, idx*0.5, dur)
    return y*exp_decay(n, dur*0.35)

def brass_note(f0, dur, seed=0):
    idx = np.minimum(8, 1+7*t_lin(dur)/0.08)*np.exp(-t_lin(dur)/(dur*0.7))
    y = fm(f0, f0, idx, dur)*adsr(int(dur*SR), 0.06, 0.1, 0.8, min(0.2, dur*0.3))
    return y

LABELS = []
def label(slug, name, wave, trigger, intent):
    LABELS.append((slug, name, wave, trigger, intent))

# ---------------- recipes ----------------
def r_congregation_invite():
    dur = 3.2; x = np.zeros(int(dur*SR))
    # detuned bell, slightly sour fifth
    x += place(x, bell(196, 2.8, seed=11)*0.7, 0.0)
    x += place(x, bell(196*1.498, 2.8, seed=12)*0.55, 0.05)
    # breathy choir-ish pad swelling underneath: 4 detuned saws, slow attack
    t = t_lin(dur)
    pad = sum(osc(98*(1+dt), dur, "saw") for dt in (-0.004, 0.003, -0.0015, 0.005))
    pad = filt(pad, "low", 900)*adsr(len(pad), 1.2, 0.4, 0.7, 1.0, peak=0.35)
    x += wow(pad, rate=4.2, depth=0.004)
    label("sfx-congregation-invite", "The Congregation", "wave 4",
          "it turns aggro / calls you in",
          "warm but wrong: detuned church bell over a swelling breathy choir that never quite resolves")
    return finish(x)

def r_congregation_geas():
    dur = 3.0; x = np.zeros(int(dur*SR))
    x += place(x, bell(146.8, 2.6, seed=21)*0.8, 0.0)          # low minor bell
    x += place(x, bell(138.6, 2.6, seed=22)*0.6, 0.35)         # sour neighbor
    for i, at in enumerate([0.1, 0.5, 0.9, 1.3]):              # commanding sub pulses
        th = osc(55, 0.25)*exp_decay(int(0.25*SR), 0.05)*0.9
        x = place(x, th, at)
    seal = filt(noise(0.3, 23), "low", 300)*exp_decay(int(0.3*SR), 0.06)
    x = place(x, seal*1.2, 1.7)
    label("sfx-congregation-geas", "The Congregation", "wave 4",
          "it binds you (geas attack)",
          "a low tolling bell with a sour neighbor tone, sub-bass pulses like a gavel, then a sealing thud")
    return finish(x)

def r_congregation_absolve():
    dur = 3.4; x = np.zeros(int(dur*SR))
    t = t_lin(2.6)
    shimmer = sum(np.sin(2*np.pi*np.cumsum(1200*(1.5**(t/2.6))*(1+d))/SR)
                  for d in (-0.002, 0.002, 0.006))
    shimmer = filt(shimmer, "high", 2500)*adsr(len(t_lin(2.6)), 0.8, 0.6, 0.5, 1.0, peak=0.4)
    x = place(x, shimmer, 0.0)
    x += place(x, bell(392, 2.4, seed=31)*0.6, 0.4)
    x += place(x, bell(523.25, 2.6, seed=32)*0.6, 0.9)         # resolves upward
    breath = filt(noise(1.6, 33), "low", 700)*adsr(int(1.6*SR), 0.3, 0.4, 0.4, 0.5, peak=0.5)
    x = place(x, breath, 1.6)
    label("sfx-congregation-absolve", "The Congregation", "wave 4",
          "it releases you / fight ends",
          "rising shimmer, two bells resolving upward, then a long exhale — relief with an aftertaste")
    return finish(x)

def r_strike_shutdown():
    dur = 2.6; x = np.zeros(int(dur*SR))
    f = pitch_drop(820, 58, 1.5, curve=2.2)                    # power whine dying
    whine = osc(f, 1.5, "saw")*adsr(int(1.5*SR), 0.02, 0.2, 0.5, 0.9, peak=0.7)
    x = place(x, filt(whine, "low", 2400), 0.0)
    for i, at in enumerate([0.25, 0.55, 0.9, 1.25]):           # relay clicks
        ck = filt(noise(0.05, 40+i), "high", 1800)*exp_decay(int(0.05*SR), 0.008)*0.8
        x = place(x, ck, at)
    clunk = filt(noise(0.35, 44), "low", 260)*exp_decay(int(0.35*SR), 0.05)
    clunk += osc(48, 0.35)*exp_decay(int(0.35*SR), 0.06)
    x = place(x, clunk*1.3, 1.55)
    hum = osc(120, 0.7)*exp_decay(int(0.7*SR), 0.25)*0.25       # residual hum fading
    x = place(x, hum, 1.7)
    label("sfx-strike-shutdown", "The Strike", "wave 4",
          "it dies / its shutdown attack lands",
          "a power-whine collapsing, relay breakers snapping, one last clunk, then the hum bleeds out")
    return finish(x)

def r_suburb_hum():
    dur = 4.0; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    hum = osc(120, dur) + 0.5*osc(240, dur) + 0.25*osc(360, dur) + 0.12*osc(480, dur)
    hum *= (0.75 + 0.25*np.sin(2*np.pi*0.7*t))                 # slow threatening wobble
    x += hum*0.5
    putter = filt(noise(dur, 51), "low", 220)*(0.5+0.5*np.sign(np.sin(2*np.pi*7*t)))**2*0.12
    x += putter                                                # distant mower-ish putter
    creak = filt(noise(1.4, 52), "band", (900, 2400))*np.sin(np.pi*np.arange(int(1.4*SR))/int(1.4*SR))**2*0.35
    x = place(x, creak, 2.2)                                   # screen-door creak
    x = wow(x, rate=3.1, depth=0.003)
    label("sfx-suburb-hum", "The Suburb", "wave 4",
          "its aggro aura / area pressure",
          "fluorescent-mains hum with a slow menacing wobble, a far-off putter, a screen door creaking — dread, not jump")
    return finish(x)

def r_eulogy_verse():
    dur = 4.2; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    chord = [110, 130.81, 164.81, 196]                        # Dm-ish, mournful
    organ = sum(osc(f*(1+d), dur, "saw") for f in chord for d in (-0.002, 0.002))
    organ = filt(organ, "low", 1100)*adsr(len(organ), 0.9, 0.5, 0.75, 1.4, peak=0.4)
    x += wow(organ, rate=4.8, depth=0.005)                     # tape warble on the organ
    x += place(x, bell(73.4, 3.6, seed=61)*0.9, 0.2)           # deep toll
    x += place(x, bell(73.4, 3.0, seed=62)*0.7, 2.1)
    label("sfx-eulogy-verse", "The Eulogy", "wave 5",
          "it speaks its verse (telegraphed attack)",
          "a warbling funeral organ under deep bell tolls — grief weaponized, slow and inevitable")
    return finish(x)

def r_eater_gorge():
    dur = 2.8; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    idx = 9 + 3*np.sin(2*np.pi*6*t)                            # FM growl, wobbling index
    growl = fm(70+8*np.sin(2*np.pi*0.9*t), 55, idx, dur)
    x += filt(growl, "low", 500)*adsr(len(growl), 0.15, 0.3, 0.8, 0.6, peak=0.85)
    for i, at in enumerate([0.35, 1.0, 1.65, 2.2]):            # gulps: bandpass pitch-drop
        gdur = 0.4; gt = t_lin(gdur)
        f = pitch_drop(420, 140, gdur, curve=2.5)
        gulp = np.sin(2*np.pi*np.cumsum(f)/SR)*exp_decay(int(gdur*SR), 0.09)
        gulp = filt(gulp + 0.6*noise(gdur, 70+i), "band", (200, 900))
        x = place(x, gulp*0.9, at)
    sq = filt(noise(0.5, 74), "band", (1200, 3600))*exp_decay(int(0.5*SR), 0.05)*0.4
    x = place(x, sq, 0.15)                                     # wet squelch detail
    label("sfx-eater-gorge", "The Eater", "wave 5",
          "it feeds (heals mid-fight)",
          "a wet FM growl under huge gulping swallows — you hear it getting stronger and it turns your stomach")
    return finish(x)

def r_algorithm_tick():
    dur = 3.6; x = np.zeros(int(dur*SR))
    drone = osc(55, dur) + 0.6*osc(55*1.007, dur) + 0.3*osc(110.3, dur)
    x += filt(drone, "low", 300)*0.4
    times = [0, .18, .31, .55, .62, .90, 1.02, 1.30, 1.33, 1.61, 1.95, 2.02, 2.40, 2.71, 2.74, 3.05, 3.30]
    for i, at in enumerate(times):                             # uneven inhuman rhythm
        ck = filt(noise(0.03, 80+i), "high", 3000)*exp_decay(int(0.03*SR), 0.004)
        x = place(x, ck*(0.9 if i % 4 else 1.4), at)
    zap = crush(osc(pitch_drop(200, 2400, 0.22, curve=1.5), 0.22, "saw"), bits=5)
    x = place(x, filt(zap, "high", 1200)*0.5, 1.7)
    zap2 = crush(osc(pitch_drop(3000, 300, 0.18, curve=2.0), 0.18, "square"), bits=4)
    x = place(x, filt(zap2, "high", 1500)*0.4, 2.9)
    label("sfx-algorithm-tick", "The Algorithm", "wave 5",
          "it calculates (telegraphs its counter)",
          "a server-room drone under clock ticks in a rhythm your brain can't predict, cut by bit-crushed glitch zaps")
    return finish(x)

def r_herald_trumpet():
    dur = 3.0; x = np.zeros(int(dur*SR))
    motif = [(261.63, 0.0, 0.45), (329.63, 0.5, 0.45), (392.0, 1.0, 0.5), (415.3, 1.55, 1.1)]
    for f, at, d in motif:                                    # rising fanfare, final note sour
        n = brass_note(f*(1-0.004 if d > 1 else 0), d, seed=int(f))
        x = place(x, crush(n, bits=9)*0.75, at)
    swell = filt(noise(1.2, 91), "band", (400, 3000))*adsr(int(1.2*SR), 0.5, 0.2, 0.6, 0.4, peak=0.3)
    x = place(x, swell, 1.4)
    label("sfx-herald-trumpet", "The Herald", "wave 5",
          "it announces a wave / finale phase",
          "a brassy FM fanfare climbing three clean notes — then the fourth lands sour and lo-fi, and the crowd-noise isn't cheering")
    return finish(x)

def r_cancellation_descend():
    dur = 3.0; x = np.zeros(int(dur*SR))
    arp = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25]
    j = np.zeros(int(1.3*SR))
    for i, f in enumerate(arp):                                # bright ident jingle...
        j = place(j, bell(f, 0.5, seed=100+i)*0.5, i*0.18)
    fcurve = pitch_drop(1.0, 0.06, 1.3, curve=2.8)             # ...tape-stopped to death
    n = len(j); src = np.clip((np.arange(n)*fcurve).astype(int), 0, n-1)
    stopped = j[src]*np.linspace(1, 0.15, n)
    x = place(x, stopped, 0.0)
    pop = filt(noise(0.06, 105), "low", 900)*exp_decay(int(0.06*SR), 0.01)
    x = place(x, pop*1.2, 1.45)                                # the plug pulled
    # dead air: faint hiss only
    x = place(x, filt(noise(1.2, 106), "high", 6000)*0.02, 1.6)
    label("sfx-cancellation-descend", "Cancellation", "wave 5",
          "it axes something (heavy debuff / kill)",
          "a cheerful station ident that gets tape-stopped mid-jingle into a dead plug-pop — then nothing. The nothing is the point")
    return finish(x)

def r_editor_cut():
    dur = 2.2; x = np.zeros(int(dur*SR))
    snip = filt(noise(0.07, 110), "high", 2500)*exp_decay(int(0.07*SR), 0.006)*1.2
    x = place(x, snip, 0.05)
    tone = osc(440, 1.0, "square")*0.25                        # frames stuttering
    stut = np.zeros(int(1.0*SR))
    at = 0.0
    for i in range(9):
        d = 0.09 - i*0.008
        stut = place(stut, tone[:int(d*SR)]*np.hanning(int(d*SR)), at)
        at += d + 0.02
    x = place(x, filt(stut, "low", 2000), 0.35)
    x = place(x, snip*1.1, 1.35)                               # clean cut to silence
    label("sfx-editor-cut", "The Editor", "wave 5",
          "its cut attack (removes a buff / severs)",
          "a splice snip, frames stuttering faster and faster, then one clean cut — and the sound just stops existing")
    return finish(x)

def r_rerun_clap():
    dur = 3.0; x = np.zeros(int(dur*SR))
    rng = np.random.default_rng(121)
    one = filt(noise(0.42, 122), "band", (900, 4200))           # one canned clap swell
    one *= adsr(len(one), 0.05, 0.1, 0.7, 0.12)* (0.8+0.2*rng.random(len(one)))
    for i in range(5):                                        # looped with machine precision
        x = place(x, one*0.75, 0.1 + i*0.5)
    x = x[:int(2.62*SR)]                                       # abrupt end mid-loop
    x = np.pad(x, (0, int(dur*SR)-len(x)))
    label("sfx-rerun-clap", "The Rerun", "wave 5",
          "its aggro loop / encore attack",
          "canned applause — but it's the SAME half-second of clapping looped with inhuman precision, then chopped dead mid-clap")
    return finish(x)

def r_spoiler_spoil():
    dur = 2.6; x = np.zeros(int(dur*SR))
    t = t_lin(1.6)
    f = 300*(900/300)**(t/1.6)
    f *= 1 + 0.25*np.sign(np.sin(2*np.pi*9*t))*(t/1.6)          # gets "scratched"
    tone = osc(f, 1.6, "saw")*adsr(int(1.6*SR), 0.05, 0.2, 0.7, 0.3, peak=0.6)
    x = place(x, filt(tone, "low", 3000), 0.0)
    for at in [0.5, 0.9, 1.25]:                               # scratch bursts
        sc = filt(noise(0.09, 130+int(at*10)), "high", 2000)*exp_decay(int(0.09*SR), 0.015)*0.7
        x = place(x, sc, at)
    thud = filt(noise(0.2, 134), "low", 200)*exp_decay(int(0.2*SR), 0.04)
    x = place(x, thud*1.1, 1.75)                               # needle drop
    label("sfx-spoiler-spoil", "Spoiler", "wave 5",
          "it spoils (reveals / ruins a plan)",
          "a rising tone getting needle-scratched three times, then the needle drops — the sound of your plan being ruined")
    return finish(x)

def r_timeslot_tick():
    dur = 3.2; x = np.zeros(int(dur*SR))
    for i in range(12):                                       # relentless metronome
        tick = osc(840, 0.05)*exp_decay(int(0.05*SR), 0.008)*0.8
        tock = osc(660, 0.05)*exp_decay(int(0.05*SR), 0.008)*0.8
        x = place(x, tick if i % 2 == 0 else tock, 0.15 + i*0.24)
        if i % 4 == 3:                                        # station-ident chime
            x = place(x, bell(174.6, 1.6, seed=140+i)*0.5, 0.15 + i*0.24)
    x = wow(x, rate=5.0, depth=0.004)
    label("sfx-timeslot-tick", "Timeslot", "wave 5",
          "its countdown pressure aura",
          "an unrelenting tick-tock with a deep station chime every fourth beat, all slightly tape-warped — time itself is the attack")
    return finish(x)

def r_finale_titlecard():
    dur = 3.6; x = np.zeros(int(dur*SR))
    boom = fm(60, 45, 8*np.exp(-t_lin(0.5)/0.12), 0.5)          # taiko-ish boom
    boom = filt(boom + 0.8*noise(0.5, 151), "low", 400)*exp_decay(int(0.5*SR), 0.12)
    x = place(x, boom*1.2, 0.0)
    t = t_lin(2.8)
    swell = sum(osc(f*(1+d), 2.8, "saw") for f in (130.81, 164.81, 196) for d in (-0.003, 0.003))
    swell = filt(swell, "low", 1400)*adsr(len(swell), 0.5, 0.4, 0.7, 1.2, peak=0.5)
    x = place(x, swell, 0.35)
    shim = sum(np.sin(2*np.pi*f*t) for f in (2093, 2637, 3136))
    x = place(x, filt(shim, "high", 1800)*exp_decay(len(shim), 0.8)*0.25, 0.4)
    held = sum(osc(f*1.001, 1.6, "tri") for f in (65.4, 98, 130.81, 164.81))
    x = place(x, filt(held, "low", 800)*adsr(int(1.6*SR), 0.1, 0.2, 0.8, 0.9, peak=0.4), 1.8)
    label("sfx-finale-titlecard", "The Finale", "wave 5",
          "it arrives (boss intro)",
          "a taiko boom, a brass swell that never settles, shimmer, then a held chord that's tuned just wrong enough to dread")
    return finish(x)

def r_finale_sacrifice():
    dur = 4.4; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    drone = osc(55, dur) + 0.7*osc(55*1.008, dur)
    x += filt(drone, "low", 220)*adsr(len(drone), 0.6, 0.5, 0.8, 1.2, peak=0.55)
    x += heartbeat(dur, bpm0=72, bpm1=34, seed=161)*0.8         # heart slows... stops
    vib = 1 + 0.012*np.sin(2*np.pi*5.5*t_lin(2.6))              # violin-ish wail, FM + vibrato
    wail = fm(440*vib*np.linspace(1, 0.89, len(vib)), 438, 3.5*np.exp(-t_lin(2.6)/1.4), 2.6)
    x = place(x, filt(wail, "low", 2400)*adsr(int(2.6*SR), 0.25, 0.4, 0.5, 1.2, peak=0.5), 0.5)
    label("sfx-finale-sacrifice", "The Finale", "wave 5",
          "its dark rite (sacrifice attack)",
          "a low drone, a heartbeat slowing to nothing, and one wailing string line sinking — the darkest sound in the game")
    return finish(x)

def r_focusgroup_murmur():
    dur = 3.4; x = np.zeros(int(dur*SR))
    rng = np.random.default_rng(171)
    for v in range(5):                                        # five overlapping whisperers
        vd = 3.0; n = int(vd*SR)
        syll = np.ones(n)
        at = 0.0
        while at < vd:
            d = rng.uniform(0.08, 0.3)
            i0, i1 = int(at*SR), min(n, int((at+d)*SR))
            syll[i0:i1] *= np.sin(np.pi*np.linspace(0, 1, i1-i0))**2 * rng.uniform(0.3, 1)
            at += d + rng.uniform(0.02, 0.12)
        voice = filt(noise(vd, 172+v), "band", (1100+rng.uniform(-200, 600), 3200))
        voice *= syll*0.3
        fshift = 1 + rng.uniform(-0.03, 0.03)
        x = place(x, voice, rng.uniform(0, 0.4))
    rising = filt(noise(1.2, 179), "band", (1400, 3400))
    rising *= np.linspace(0.2, 1.0, len(rising))*exp_decay(len(rising), 0.5)*0.6
    x = place(x, rising, 1.9)                                  # one whisper gets clear...
    x = x[:int(3.05*SR)]; x = np.pad(x, (0, int(dur*SR)-len(x)))  # ...then cut
    label("sfx-focusgroup-murmur", "Focus Group", "wave 4",
          "it deliberates (debuff murmur)",
          "five whispering voices overlapping in syllable rhythms you almost understand — one starts getting clear, then it's cut off")
    return finish(x)

def r_villager_death():
    dur = 4.0; x = np.zeros(int(dur*SR))
    x += heartbeat(dur, bpm0=66, bpm1=30, seed=181)*0.7
    breath = filt(noise(1.8, 182), "low", 600)*adsr(int(1.8*SR), 0.2, 0.5, 0.3, 0.8, peak=0.5)
    x = place(x, breath, 1.4)
    x += place(x, bell(659.25*0.997, 3.4, seed=183)*0.55, 0.6)  # detuned music-box note
    x += place(x, bell(523.25*1.003, 3.0, seed=184)*0.45, 1.1)
    label("sfx-villager-death", "—", "any",
          "a villager dies",
          "a heartbeat slowing out, one last breath, and a detuned music-box note that rings too long — grief, not gore")
    return finish(x)

def r_player_death():
    dur = 4.4; x = np.zeros(int(dur*SR))
    f = pitch_drop(400, 38, 2.6, curve=2.4)                    # long fall into sub-bass
    fall = osc(f, 2.6, "saw")*adsr(int(2.6*SR), 0.03, 0.4, 0.6, 1.6, peak=0.7)
    x = place(x, filt(fall, "low", 1200), 0.0)
    x += heartbeat(dur, bpm0=80, bpm1=28, seed=191)*0.85
    breath = filt(noise(2.0, 192), "low", 500)*adsr(int(2.0*SR), 0.3, 0.6, 0.3, 0.8, peak=0.55)
    x = place(x, breath, 1.8)
    thud = filt(noise(0.4, 193), "low", 150)*exp_decay(int(0.4*SR), 0.08)
    x = place(x, thud*1.2, 2.9)
    label("sfx-player-death", "—", "any",
          "YOU die (succession)",
          "a long pitch-fall into sub-bass, your heartbeat giving out, breath, impact — then the succession sting takes over")
    return finish(x)

def r_horror_sting():
    dur = 1.8; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    cluster = [261.63, 277.18, 370.0, 466.16]                  # minor 2nds = dread
    hit = sum(osc(f, dur, "saw") for f in cluster)
    hit = filt(hit, "low", 4000)*adsr(len(hit), 0.005, 0.25, 0.25, 1.2, peak=0.8)
    x += hit
    crash = filt(noise(0.7, 201), "high", 900)*exp_decay(int(0.7*SR), 0.12)*0.5
    x = place(x, crash, 0.0)
    tail = osc(pitch_drop(220, 55, 1.0, curve=2.0), 1.0, "sine")*exp_decay(int(1.0*SR), 0.3)*0.5
    x = place(x, tail, 0.7)
    label("sfx-horror-sting", "—", "any",
          "jump scare / ambush reveal",
          "a dissonant cluster slammed hard with a noise crash, then a low tail sinking — the classic, done mean")
    return finish(x)

def r_ui_select():
    dur = 0.35; x = np.zeros(int(dur*SR))
    knock = filt(noise(0.06, 211), "band", (300, 2500))*exp_decay(int(0.06*SR), 0.012)
    x = place(x, knock*0.9, 0.0)
    x = place(x, osc(180, 0.09)*exp_decay(int(0.09*SR), 0.02)*0.7, 0.0)
    blip = osc(880, 0.12)*adsr(int(0.12*SR), 0.005, 0.03, 0.4, 0.06, peak=0.4)
    x = place(x, blip, 0.05)
    label("ui-select", "—", "UI",
          "menu button press",
          "a soft wooden knock with a tiny warm blip — tactile, quiet, never annoying on the 500th press")
    return finish(x)

def footstep(kind):
    dur = 0.28; x = np.zeros(int(dur*SR))
    if kind == "soft":
        x += filt(noise(dur, 221), "low", 320)*exp_decay(int(dur*SR), 0.035)*1.0
        x += osc(70, dur)*exp_decay(int(dur*SR), 0.03)*0.5
        intent = "muffled thud on dirt/grass — felt more than heard"
    elif kind == "wet":
        gdur = dur; f = pitch_drop(640, 190, gdur, curve=2.2)
        sq = np.sin(2*np.pi*np.cumsum(f)/SR)*exp_decay(int(gdur*SR), 0.05)
        x += filt(sq + 0.7*noise(gdur, 222), "band", (300, 1500))*0.9
        x = place(x, filt(noise(0.05, 223), "high", 2000)*0.3, 0.16)  # suction pop
        intent = "a proper squelch with a little suction pop at the end"
    elif kind == "stone":
        x = place(x, filt(noise(0.04, 224), "high", 2500)*exp_decay(int(0.04*SR), 0.006)*1.1, 0.0)
        x = place(x, osc(2100, 0.09)*exp_decay(int(0.09*SR), 0.02)*0.25, 0.0)  # short ring
        x += filt(noise(dur, 225), "low", 500)*exp_decay(int(dur*SR), 0.03)*0.5
        intent = "bright heel-click with a faint stone ring under it"
    elif kind == "haven":
        x = place(x, osc(150, 0.1)*exp_decay(int(0.1*SR), 0.025)*0.9, 0.0)      # wood knock
        x = place(x, filt(noise(0.08, 226), "band", (400, 2000))*exp_decay(int(0.08*SR), 0.015)*0.7, 0.0)
        intent = "hollow wood-floor knock — you're home"
    label(f"footstep-{kind}", "—", "movement",
          f"footstep on {kind} terrain",
          intent)
    return finish(x*0.8)

def r_sting_wave_unlock():
    dur = 2.8; x = np.zeros(int(dur*SR))
    penta = [261.63, 293.66, 329.63, 392.0, 523.25, 659.25]
    for i, f in enumerate(penta):                             # rising FM plucks
        p = fm(f, f*2, 4*np.exp(-t_lin(0.4)/0.1), 0.4)
        x = place(x, p*exp_decay(int(0.4*SR), 0.09)*0.55, 0.15+i*0.22)
    boom = filt(fm(55, 40, 6*np.exp(-t_lin(0.6)/0.15), 0.6)+0.6*noise(0.6, 231), "low", 350)
    x = place(x, boom*exp_decay(int(0.6*SR), 0.14)*1.1, 1.5)
    shim = sum(np.sin(2*np.pi*f*t_lin(1.2)) for f in (1568, 2093, 2637))
    x = place(x, filt(shim, "high", 1500)*exp_decay(int(1.2*SR), 0.4)*0.3, 1.55)
    label("sting-wave-unlock", "—", "meta",
          "new monster wave unlocked",
          "a rising pentatonic climb on FM plucks, a deep boom, shimmer — triumph with an alien aftertaste")
    return finish(x)

def r_sting_succession():
    dur = 3.2; x = np.zeros(int(dur*SR))
    x += place(x, bell(196, 2.8, seed=241)*0.7, 0.0)            # call: low bell
    x += place(x, bell(294, 2.8, seed=242)*0.7, 1.1)           # response: higher bell
    low = osc(98, dur)*adsr(int(dur*SR), 0.4, 0.5, 0.6, 1.2, peak=0.25)
    x += filt(low, "low", 400)
    label("sting-succession", "—", "meta",
          "you die; a new villager takes up the mantle",
          "two bells in call-and-response, low then higher — one voice handing the song to the next")
    return finish(x)

def r_music_menu():
    dur = 11.0; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    drone = osc(65.4, dur) + 0.6*osc(65.4*1.003, dur)
    x += filt(drone, "low", 260)*0.35
    motif = [(523.25, 0.5), (587.33, 1.6), (523.25, 2.7), (392.0, 3.8),
             (440.0, 5.3), (523.25, 6.4), (587.33, 7.5), (659.25, 8.6)]
    for f, at in motif:                                       # detuned music-box waltz, minor
        x = place(x, bell(f*0.998, 2.2, seed=int(f))*0.4, at)
        x = place(x, bell(f*1.004, 2.2, seed=int(f)+7)*0.3, at+0.03)
    x = wow(x, rate=4.6, depth=0.006)
    x += filt(noise(dur, 251), "high", 7000)*0.015             # faint tape hiss
    label("music-menu-theme", "—", "music",
          "title screen loop",
          "a haunted music-box waltz in a minor key over a low drone, tape-warped with faint hiss — the station ident for dread")
    return finish(x*0.9)

def r_music_ambient():
    dur = 13.0; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    pad = sum(osc(f*(1+d), dur, "tri") for f in (110, 164.81, 220) for d in (-0.002, 0.002))
    pad = filt(pad, "low", 700)*adsr(len(pad), 2.5, 1.5, 0.8, 3.0, peak=0.4)
    x += pad
    wind = filt(noise(dur, 261), "low", 400)*(0.6+0.4*np.sin(2*np.pi*0.13*t+1))*0.25
    x += wind
    rng = np.random.default_rng(262)                          # sparse distant birds
    for _ in range(7):
        at = rng.uniform(1, dur-1.5); f0 = rng.uniform(2400, 4200)
        chirp = fm(f0*(1+0.3*np.sin(2*np.pi*18*t_lin(0.18))), f0*1.5, 2.0, 0.18)
        x = place(x, filt(chirp, "high", 2000)*exp_decay(int(0.18*SR), 0.05)*0.12, at)
    x = place(x, bell(392*1.002, 5.0, seed=263)*0.18, 6.0)     # far-off bell
    label("music-ambient-haven", "—", "music",
          "haven daytime ambience loop",
          "a warm slow pad, wind in the grass, a few distant birds, one far bell — safe, alive, worth protecting")
    return finish(x*0.9)

def r_music_contest():
    dur = 10.0; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    gate = (0.5+0.5*np.sign(np.sin(2*np.pi*2.2*t)))**2         # pulsing low synth
    pulse = filt(osc(55, dur, "saw")*gate, "low", 500)*0.55
    x += pulse
    for i in range(20):                                       # ticking
        tick = filt(noise(0.03, 271+i), "high", 3500)*exp_decay(int(0.03*SR), 0.004)*0.5
        x = place(x, tick, 0.25+i*0.48)
    rise = filt(noise(dur, 272), "band", (300, 4000))*np.linspace(0.05, 0.5, len(t))**2*0.4
    x += rise                                                  # tension swell
    sub = osc(36.7, dur)*np.linspace(0.2, 0.6, len(t))*0.4
    x += filt(sub, "low", 120)
    x = x[:int(9.6*SR)]; x = np.pad(x, (0, int(dur*SR)-len(x)))
    label("music-contest-bed", "—", "music",
          "televised contest tension bed (loops)",
          "a gated sub pulse, relentless ticking, and a swelling noise bed that never quite peaks — dread that loops cleanly")
    return finish(x*0.9)

RECIPES = [
    ("sfx-congregation-invite", r_congregation_invite),
    ("sfx-congregation-geas", r_congregation_geas),
    ("sfx-congregation-absolve", r_congregation_absolve),
    ("sfx-strike-shutdown", r_strike_shutdown),
    ("sfx-suburb-hum", r_suburb_hum),
    ("sfx-eulogy-verse", r_eulogy_verse),
    ("sfx-eater-gorge", r_eater_gorge),
    ("sfx-algorithm-tick", r_algorithm_tick),
    ("sfx-herald-trumpet", r_herald_trumpet),
    ("sfx-cancellation-descend", r_cancellation_descend),
    ("sfx-editor-cut", r_editor_cut),
    ("sfx-rerun-clap", r_rerun_clap),
    ("sfx-spoiler-spoil", r_spoiler_spoil),
    ("sfx-timeslot-tick", r_timeslot_tick),
    ("sfx-finale-titlecard", r_finale_titlecard),
    ("sfx-finale-sacrifice", r_finale_sacrifice),
    ("sfx-focusgroup-murmur", r_focusgroup_murmur),
    ("sfx-villager-death", r_villager_death),
    ("sfx-player-death", r_player_death),
    ("sfx-horror-sting", r_horror_sting),
    ("ui-select", r_ui_select),
    ("footstep-soft", lambda: footstep("soft")),
    ("footstep-wet", lambda: footstep("wet")),
    ("footstep-stone", lambda: footstep("stone")),
    ("footstep-haven", lambda: footstep("haven")),
    ("sting-wave-unlock", r_sting_wave_unlock),
    ("sting-succession", r_sting_succession),
    ("music-menu-theme", r_music_menu),
    ("music-ambient-haven", r_music_ambient),
    ("music-contest-bed", r_music_contest),
]

def main():
    import wave
    ok = 0
    for slug, fn in RECIPES:
        y = fn()
        wav = os.path.join(OUT, slug + ".wav")
        with wave.open(wav, "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((np.clip(y, -1, 1)*32767).astype(np.int16).tobytes())
        mp3 = os.path.join(OUT, slug + ".mp3")
        r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", wav, "-codec:a", "libmp3lame",
                            "-b:a", "128k", mp3], capture_output=True, text=True)
        os.remove(wav)
        size = os.path.getsize(mp3) if os.path.exists(mp3) else 0
        flag = "" if size > 4000 else "  <-- SUSPICIOUSLY SMALL"
        print(f"{slug}: {size} bytes{flag}")
        if size > 4000: ok += 1
        else: print(r.stderr[:300])
    print(f"\n{ok}/{len(RECIPES)} rendered OK")
    with open(os.path.join(OUT, "LABELS.md"), "w") as f:
        f.write("# Audio previews v2 — labels\n\n")
        f.write("Rendered 2026-10-12 from the v2 synth (FM + filtered noise + tape artifacts).\n")
        f.write("Palette: haunted broadcast for wave 4-5 TV-horror; organic FM horror for the fleshy ones.\n\n")
        for slug, name, wave, trigger, intent in LABELS:
            f.write(f"## {slug}\n**{name}** · {wave} · trigger: {trigger}\n\n{intent}\n\n")
    print("LABELS.md written")

if __name__ == "__main__v2__":  # superseded by dispatch block at file end
    main()

# ---------------- v3 helpers ----------------
def vox(f0, dur, nsyl=3, seed=0, f1=(600, 1400), f2=(1800, 3200)):
    """Formant-ish voice: saw through two formant bands, syllable envelopes."""
    n = int(dur*SR)
    env = np.zeros(n)
    edges = np.linspace(0, 1, nsyl+1)
    rng = np.random.default_rng(seed)
    for i in range(nsyl):
        i0, i1 = int(edges[i]*n), int(edges[i+1]*n)
        if i1 > i0:
            env[i0:i1] = np.sin(np.pi*np.linspace(0, 1, i1-i0))**2 * rng.uniform(0.7, 1.0)
    src = osc(f0, dur, "saw")
    v = filt(src, "band", f1)*0.6 + filt(src, "band", f2)*0.4
    return v*env

def slapback(x, delay=0.09, decay=0.35, n=3):
    y = x.copy()
    for i in range(1, n+1):
        y = place(y, x*(decay**i), i*delay)
    return y

def dog_bark(x, at, seed=0):
    d = 0.18
    f = pitch_drop(420, 240, d, curve=2.0)
    b = np.sin(2*np.pi*np.cumsum(f)/SR)*exp_decay(int(d*SR), 0.03)
    b = filt(b + 0.5*noise(d, seed), "band", (300, 1200))
    return place(x, b*0.9, at)

def gavel_bang(x, at, seed=0, amp=1.0):
    th = filt(noise(0.12, seed), "low", 500)*exp_decay(int(0.12*SR), 0.02)
    th += osc(150, 0.12)*exp_decay(int(0.12*SR), 0.025)*0.8
    return place(x, th*amp, at)

LABELS_V3 = []
def label3(slug, name, wave, trigger, derivation):
    LABELS_V3.append((slug, name, wave, trigger, derivation))

# ---------------- v3: per-monster signatures, derived from fiction ----------------
def v3_congregation_invite():
    dur = 4.2; x = np.zeros(int(dur*SR))
    # a hymn sung by eight voices, staggered entrances, one voice a semitone off
    prog = [(130.81, 164.81, 196.0), (116.54, 146.83, 174.61), (146.83, 174.61, 220.0)]
    for ci, chord in enumerate(prog):
        for vi, f in enumerate(chord):
            for det in (-0.003, 0.003):
                v = vox(f*(1+det)*(0.5 if vi == 2 and ci == 1 else 1.0), 1.9, nsyl=2,
                        seed=300+ci*10+vi, f1=(500, 1100), f2=(1600, 2800))
                v *= adsr(len(v), 0.35+vi*0.12, 0.2, 0.8, 0.5, peak=0.30)
                x = place(x, v, ci*1.25 + vi*0.1)
    x = wow(x, rate=3.8, depth=0.003)
    label3("sfx-congregation-invite", "The Congregation", "wave 4",
           "it calls you in",
           "a hymn sung by eight staggered voices — warm, welcoming, and one of them is a semitone off and nobody corrects her")
    return finish(x)

def v3_congregation_geas():
    dur = 3.0; x = np.zeros(int(dur*SR))
    chord = sum(vox(f, 1.0, nsyl=1, seed=310+i)*0.4 for i, f in enumerate((130.81, 164.81, 196.0)))
    chord *= adsr(len(chord), 0.1, 0.1, 0.9, 0.05, peak=0.8)
    x = place(x, chord, 0.0)
    # everything stops dead on one word — that word sustains and binds
    word = vox(110, 1.9, nsyl=1, seed=315, f1=(400, 900), f2=(1400, 2400))
    word *= np.linspace(0.4, 1.0, len(word))*adsr(len(word), 0.05, 0.3, 0.9, 0.4, peak=0.9)
    x = place(x, filt(word, "low", 1800), 0.95)
    for at in [1.1, 1.5, 1.9]:
        x = place(x, osc(55, 0.22)*exp_decay(int(0.22*SR), 0.05)*0.9, at)
    label3("sfx-congregation-geas", "The Congregation", "wave 4",
           "it binds you",
           "the hymn stops dead mid-word — the one remaining voice sustains that word while sub-bass nails it down")
    return finish(x)

def v3_congregation_absolve():
    dur = 3.8; x = np.zeros(int(dur*SR))
    organ = sum(osc(f*(1+d), 2.4, "saw") for f in (87.31, 130.81, 174.61) for d in (-0.002, 0.002))
    organ = filt(organ, "low", 900)*adsr(len(organ), 0.5, 0.4, 0.7, 1.2, peak=0.45)
    x = place(x, wow(organ, rate=4.4, depth=0.004), 0.0)          # resolving chord
    creak = filt(noise(0.9, 321), "band", (700, 2200))*np.sin(np.pi*np.arange(int(0.9*SR))/int(0.9*SR))**2*0.4
    x = place(x, creak, 2.0)                                      # pew creak
    x = place(x, filt(noise(0.3, 322), "low", 240)*exp_decay(int(0.3*SR), 0.07)*0.8, 2.6)  # door
    for i in range(3):                                            # footsteps leaving
        st = filt(noise(0.09, 323+i), "low", 500)*exp_decay(int(0.09*SR), 0.02)*(0.7-i*0.18)
        x = place(x, st, 2.9+i*0.28)
    label3("sfx-congregation-absolve", "The Congregation", "wave 4",
           "it releases you",
           "the organ finally resolves, a pew creaks, the door opens, footsteps walk away — absolution sounds like leaving")
    return finish(x)

def v3_strike_shutdown():
    dur = 2.8; x = np.zeros(int(dur*SR))
    t = t_lin(1.1)
    whistle = osc(620*(1+0.02*np.sin(2*np.pi*6*t)), 1.1, "saw")   # factory whistle...
    whistle *= adsr(int(1.1*SR), 0.05, 0.1, 0.9, 0.15, peak=0.6)
    choke = np.ones(int(1.1*SR)); choke[int(0.85*SR):] = np.linspace(1, 0.05, int(1.1*SR)-int(0.85*SR))
    fch = pitch_drop(1.0, 0.4, 1.1, curve=3.0)
    n = len(whistle); src = np.clip((np.arange(n)*fch).astype(int), 0, n-1)
    x = place(x, filt(whistle[src]*choke, "low", 2600), 0.0)      # ...choked off
    for i, (f0, at) in enumerate([(300, 0.15), (210, 0.5), (140, 0.95)]):  # machines winding down
        d = 0.7; w = osc(pitch_drop(f0, f0*0.3, d, curve=2.0), d, "saw")
        x = place(x, filt(w*exp_decay(int(d*SR), 0.2), "low", 900)*0.4, at)
    x = gavel_bang(x, 1.9, seed=331, amp=1.3)                     # breaker clunk
    label3("sfx-strike-shutdown", "The Strike", "wave 4",
           "it dies / its shutdown lands",
           "the factory whistle choked mid-blow, machines winding down one by one, one last breaker clunk")
    return finish(x)

def v3_suburb_hum():
    dur = 4.6; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    spr = filt(noise(dur, 341), "high", 3000)*(0.5+0.5*np.sign(np.sin(2*np.pi*3*t)))**2*0.10
    x += spr                                                     # sprinklers
    x += filt(noise(dur, 342), "low", 200)*(0.5+0.5*np.sign(np.sin(2*np.pi*6.5*t)))**2*0.14  # mower
    for i, at in enumerate([1.0, 1.38, 1.76]):
        x = dog_bark(x, at, seed=343+i)                          # exactly three barks
    creak = filt(noise(0.8, 346), "band", (900, 2400))*np.sin(np.pi*np.arange(int(0.8*SR))/int(0.8*SR))**2*0.4
    x = place(x, creak, 3.2)
    x = place(x, filt(noise(0.12, 347), "low", 800)*exp_decay(int(0.12*SR), 0.02)*0.9, 3.95)  # door slam
    hum = (osc(120, dur)+0.4*osc(240, dur))*(0.8+0.2*np.sin(2*np.pi*0.6*t))*0.18
    x += hum
    label3("sfx-suburb-hum", "The Suburb", "wave 4",
           "its aura / area pressure",
           "sprinklers, a far mower, a dog barking exactly three times, a screen door slamming — the terror of a perfect Tuesday")
    return finish(x)

def v3_focusgroup_murmur():
    dur = 3.2; x = np.zeros(int(dur*SR))
    for i in range(6):                                           # pens clicking into sync
        at = 0.15 + i*0.22 - i*i*0.012
        ck = filt(noise(0.03, 350+i), "high", 2500)*exp_decay(int(0.03*SR), 0.005)*0.7
        x = place(x, ck, at)
    shuf = filt(noise(0.5, 356), "band", (1200, 4000))*adsr(int(0.5*SR), 0.05, 0.2, 0.5, 0.15, peak=0.4)
    x = place(x, shuf, 1.5)                                      # paper
    dec = vox(pitch_drop(180, 120, 0.9, curve=1.2), 0.9, nsyl=3, seed=357)  # "we've decided"
    x = place(x, filt(dec, "low", 2000)*adsr(int(0.9*SR), 0.05, 0.1, 0.9, 0.2, peak=0.75), 2.1)
    label3("sfx-focusgroup-murmur", "Focus Group", "wave 4",
           "it deliberates (debuff)",
           "six pens clicking until they sync, paper shuffled once, and a single flat voice: we've decided")
    return finish(x)

def v3_redactor_censor():
    dur = 2.8; x = np.zeros(int(dur*SR))
    speech = vox(150, 2.4, nsyl=8, seed=361, f1=(500, 1200), f2=(1700, 3000))*0.7
    n = len(speech); gaps = [(0.35, 0.55), (0.95, 1.30), (1.70, 1.85), (2.05, 2.35)]
    for g0, g1 in gaps:                                          # words removed mid-syllable
        speech[int(g0*SR):int(g1*SR)] = 0
    x = place(x, filt(speech, "low", 3200), 0.1)
    for i, (g0, g1) in enumerate(gaps):                          # marker squeaks over the gaps
        d = g1-g0; sq = osc(pitch_drop(1800, 2600, d, curve=1.0), d, "sine")
        x = place(x, sq*exp_decay(int(d*SR), d*0.4)*0.25, g0)
    label3("sfx-redactor-censor", "The Redactor", "wave 4",
           "it redacts (silences / removes)",
           "a voice trying to speak, muted mid-syllable four times, marker squeaking over each gap — the sentence never survives")
    return finish(x)

def v3_gavel_verdict():
    dur = 3.0; x = np.zeros(int(dur*SR))
    rng = np.random.default_rng(371)
    mur = np.zeros(int(2.2*SR))                                   # gallery murmur
    at = 0.0
    while at < 2.0:
        d = rng.uniform(0.1, 0.28)
        v = vox(rng.uniform(120, 200), d, nsyl=2, seed=int(at*100))*0.25
        mur = place(mur, v, at); at += d + rng.uniform(0.03, 0.1)
    x = place(x, filt(mur, "low", 1500), 0.0)
    for i, at in enumerate([0.4, 1.1, 1.9]):                     # three bangs, accelerating
        b = np.zeros(int(0.5*SR)); b = gavel_bang(b, 0.0, seed=372+i, amp=1.0+i*0.25)
        x = place(x, slapback(b, delay=0.11, decay=0.4, n=2), at)
    x[int(2.45*SR):] *= np.linspace(1, 0.02, len(x)-int(2.45*SR))  # gallery goes silent
    label3("sfx-gavel-verdict", "The Gavel", "wave 4",
           "it passes judgment",
           "a murmuring gallery, three gavel bangs with courthouse slapback coming faster — then the room goes dead silent")
    return finish(x)

def v3_spool_tangle():
    dur = 3.0; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    rate = 12 + 8*t/dur                                          # projector clatter speeding up
    clat = filt(noise(dur, 381), "low", 1800)*(0.5+0.5*np.sign(np.sin(2*np.pi*np.cumsum(rate)/SR)))**2*0.5
    x += clat*adsr(len(clat), 0.05, 0.2, 0.9, 0.4, peak=0.8)
    wob = 1 + 0.06*np.sin(2*np.pi*3*t)*(t/dur)                   # tape wobble growing
    x = place(x, filt(osc(440*wob, dur)*0.12, "low", 1200), 0.0)
    squeal = osc(pitch_drop(900, 3400, 0.5, curve=1.4), 0.5, "sine")*exp_decay(int(0.5*SR), 0.18)*0.5
    x = place(x, squeal, 2.1)
    x = place(x, filt(noise(0.08, 382), "high", 1500)*exp_decay(int(0.08*SR), 0.01)*1.0, 2.55)  # snap
    label3("sfx-spool-tangle", "The Spool", "wave 4",
           "it tangles (snare / bind)",
           "projector clatter speeding up, the pitch wobbling wider, a tape squeal climbing — then the snap")
    return finish(x)

def v3_chorus_line_unison():
    dur = 3.6; x = np.zeros(int(dur*SR))
    rng = np.random.default_rng(391)
    f0s = rng.uniform(200, 260, 6)                               # warmup: six voices, scattered
    for i, f0 in enumerate(f0s):
        t = t_lin(dur)
        f = f0 + (220-f0)*np.clip((t-0.8)/1.6, 0, 1)             # ...locking into unison
        v = vox(f, dur, nsyl=4, seed=392+i, f1=(500, 1100), f2=(1600, 2800))
        v *= np.linspace(0.5, 1.0, len(v))*0.35
        v *= adsr(len(v), 0.2, 0.3, 0.9, 0.6, peak=1.0)
        x += v
    label3("sfx-chorus_line-unison", "Chorus Line", "wave 4",
           "it synchronizes (buffs allies)",
           "six warmup voices scattered across pitches, sliding over two seconds into perfect unison — the lock-in is the scare")
    return finish(x)

def v3_terms_of_service_fineprint():
    dur = 3.0; x = np.zeros(int(dur*SR))
    for i, at in enumerate([0.1, 0.45, 0.8]):                    # paper shuffling
        sh = filt(noise(0.25, 400+i), "band", (1500, 5000))*adsr(int(0.25*SR), 0.03, 0.1, 0.6, 0.08, peak=0.5)
        x = place(x, sh, at)
    scr = filt(noise(1.1, 403), "high", 4000)*(0.5+0.5*np.sign(np.sin(2*np.pi*22*t_lin(1.1))))*0.22
    x = place(x, scr*adsr(len(scr), 0.1, 0.2, 0.8, 0.2, peak=1.0), 1.15)  # pen scratching
    stamp = filt(noise(0.15, 404), "low", 400)*exp_decay(int(0.15*SR), 0.03)
    stamp = place(stamp, filt(noise(0.03, 405), "high", 3000)*exp_decay(int(0.03*SR), 0.006)*0.8, 0.0)
    x = place(x, slapback(stamp*1.3, delay=0.14, decay=0.45, n=3), 2.35)   # the stamp
    label3("sfx-terms_of_service-fineprint", "Terms of Service", "wave 4",
           "it enforces a clause (debuff)",
           "paper shuffled three times, a pen scratching the fine print, then one stamp slam that echoes — you've agreed")
    return finish(x)

def v3_callback_ringback():
    dur = 3.4; x = np.zeros(int(dur*SR)); t = t_lin(1.4)
    ring = (np.sin(2*np.pi*440*t)+np.sin(2*np.pi*480*t))*0.35
    ring *= (0.5+0.5*np.sign(np.sin(2*np.pi*20*t)))               # warble
    x = place(x, ring, 0.0)
    x = place(x, filt(noise(0.05, 411), "high", 2000)*0.5, 1.45)  # picked up
    hello = vox(pitch_drop(480, 440, 0.7, curve=1.0), 0.7, nsyl=2, seed=412)  # the ring, answering
    x = place(x, filt(hello, "low", 2400)*adsr(int(0.7*SR), 0.03, 0.1, 0.9, 0.2, peak=0.7), 1.6)
    label3("sfx-callback-ringback", "Callback", "wave 4",
           "it calls you back (summons)",
           "a phone ringing with the old two-tone warble — picked up at 1.4s, and the voice on the line is the ring itself, saying hello")
    return finish(x)

def v3_buffering_spin():
    dur = 3.8; x = np.zeros(int(dur*SR))
    at = 0.1
    for cyc in range(3):                                         # rise... freeze. rise... freeze.
        d = 0.7
        t = t_lin(d)
        tone = osc(300*(600/300)**(t/d), d, "sine")
        tone = wow(tone, rate=5.0, depth=0.008)
        x = place(x, tone*adsr(len(tone), 0.05, 0.1, 0.9, 0.05, peak=0.55), at)
        at += d
        frz = 0.25 + cyc*0.3                                     # each freeze longer
        tail = tone[-int(0.03*SR):]
        for r in range(int(frz/0.03)):
            x = place(x, tail*0.5, at); at += 0.03
    # third freeze never resumes
    label3("sfx-buffering-spin", "Buffering", "wave 4",
           "it stalls you (slow / skip)",
           "a tone climbing, freezing, climbing, freezing — the third freeze just never resumes. You know this sound. You hate it")
    return finish(x)

def v3_ad_break_jingle():
    dur = 3.0; x = np.zeros(int(dur*SR))
    notes = [523.25, 659.25, 783.99, 1046.5]
    at = 0.1
    for rep in range(3):                                         # louder every repeat, won't skip
        for i, f in enumerate(notes):
            b = bell(f, 0.35, seed=420+rep*4+i)*0.45*(1+rep*0.45)
            x = place(x, b, at); at += 0.16
        at += 0.12
    x = place(x, filt(noise(0.05, 424), "low", 1200)*1.0, at)     # cut mid-phrase
    label3("sfx-ad_break-jingle", "Ad Break", "wave 4",
           "it interrupts (stun / hijack)",
           "an obnoxiously cheerful four-note jingle, louder every repeat, no skip button — chopped off mid-phrase")
    return finish(x)

def v3_influencer_shutter():
    dur = 2.8; x = np.zeros(int(dur*SR))
    at = 0.1; gap = 0.4
    for _ in range(7):                                           # shutters accelerating
        for dt in (0.0, 0.045):
            ck = filt(noise(0.03, 430+int(at*50)), "high", 2000)*exp_decay(int(0.03*SR), 0.005)*0.8
            x = place(x, ck, at+dt)
        at += gap; gap *= 0.72
    for i in range(8):                                           # notification pile-up
        d1 = osc(880, 0.09)*exp_decay(int(0.09*SR), 0.02)*0.4
        d2 = osc(1318.5, 0.12)*exp_decay(int(0.12*SR), 0.025)*0.4
        x = place(x, d1, 1.5+i*0.09); x = place(x, d2, 1.5+i*0.09+0.07)
    x = place(x, filt(noise(0.06, 438), "high", 1800)*0.8, 2.45)
    label3("sfx-influencer-shutter", "The Influencer", "wave 4",
           "it goes live (charm / swarm)",
           "camera shutters firing faster and faster, then notification dings piling up until they trip over each other")
    return finish(x)

def v3_audit_stamp():
    dur = 3.0; x = np.zeros(int(dur*SR)); t = t_lin(1.6)
    pr = filt(noise(1.6, 441), "band", (2000, 6000))*(0.5+0.5*np.sign(np.sin(2*np.pi*28*t)))**2*0.35
    x = place(x, pr, 0.1)                                        # daisy-wheel printing
    feed = filt(noise(0.5, 442), "band", (800, 3000))*np.linspace(0.2, 1, int(0.5*SR))*0.4
    x = place(x, feed, 1.7)                                      # paper feed
    stamp = filt(noise(0.2, 443), "low", 350)*exp_decay(int(0.2*SR), 0.035)*1.2
    stamp = place(stamp, filt(noise(0.03, 444), "high", 3200)*exp_decay(int(0.03*SR), 0.006)*0.9, 0.0)
    x = place(x, slapback(stamp, delay=0.16, decay=0.5, n=3), 2.25)  # ONE red stamp
    label3("sfx-audit-stamp", "The Audit", "wave 4",
           "it finds the discrepancy (expose)",
           "a daisy-wheel printer chattering, paper feeding — then a single red stamp with a long echo. Whatever it found, it's final")
    return finish(x)

def v3_reunion_calling():
    dur = 4.2; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    x += filt(noise(dur, 451), "low", 350)*(0.6+0.4*np.sin(2*np.pi*0.11*t))*0.35  # wind
    for i, (at, f0, amp) in enumerate([(0.5, 196, 0.25), (1.6, 185, 0.4), (2.7, 207, 0.6)]):
        call = vox(pitch_drop(f0*1.2, f0*0.85, 1.0, curve=1.1), 1.0, nsyl=2, seed=452+i)
        call = filt(call, "low", 1600)*adsr(len(call), 0.15, 0.2, 0.7, 0.35, peak=amp)
        call = slapback(call, delay=0.3-0.07*i, decay=0.5-0.1*i, n=2)  # less echo = closer
        x = place(x, call, at)
    label3("sfx-reunion-calling", "The Reunion", "wave 4",
           "it calls the dead by name (summon)",
           "wind, then a familiar voice calling a name — wrong, a different wrong name each time, and getting closer")
    return finish(x)

def v3_nielsen_watch():
    dur = 3.4; x = np.zeros(int(dur*SR))
    ck = filt(noise(0.04, 461), "high", 1800)*exp_decay(int(0.04*SR), 0.006)*0.7
    x = place(x, ck, 0.1)                                        # first shutter: noticed
    at = 0.5; gap = 0.3
    while at < 2.2:                                              # viewership counter ticking up
        blip = osc(1200+ (at*500), 0.04)*exp_decay(int(0.04*SR), 0.008)*0.45
        x = place(x, blip, at); at += gap; gap *= 0.85
    dial = osc(pitch_drop(350, 900, 0.8, curve=1.3), 0.8, "sine") # dial tone bending toward you
    x = place(x, dial*adsr(int(0.8*SR), 0.1, 0.2, 0.8, 0.2, peak=0.4), 2.0)
    x = place(x, ck*1.4, 2.9)                                    # final shutter, close
    label3("sfx-nielsen-watch", "Nielsen", "wave 5",
           "it locks onto you (mark)",
           "a camera shutter, a viewership counter ticking faster and faster, a dial tone bending toward you — then one last shutter, very close")
    return finish(x)

def v3_eater_gorge():
    dur = 3.4; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    idx = 10 + 3*np.sin(2*np.pi*5*t)                             # inside the stomach now
    growl = fm(52+6*np.sin(2*np.pi*0.8*t), 48, idx, dur)
    x += filt(growl, "low", 380)*adsr(len(growl), 0.2, 0.3, 0.85, 0.7, peak=0.9)
    for i, at in enumerate([0.4, 1.15, 1.9, 2.6]):               # huge slow close-mic'd gulps
        gdur = 0.55; f = pitch_drop(330, 95, gdur, curve=2.6)
        gulp = np.sin(2*np.pi*np.cumsum(f)/SR)*exp_decay(int(gdur*SR), 0.11)
        gulp = filt(gulp + 0.8*noise(gdur, 470+i), "band", (120, 700))
        x = place(x, gulp*1.0, at)
    x = place(x, heartbeat(2.6, bpm0=110, bpm1=40, seed=474)*0.5, 0.4)  # the prey's heart, stopping
    label3("sfx-eater-gorge", "The Eater", "wave 5",
           "it feeds (heals)",
           "recorded from inside the stomach: a wet FM growl, huge close gulps — and underneath, the prey's heartbeat slowing out")
    return finish(x)

def v3_herald_crier():
    dur = 3.2; x = np.zeros(int(dur*SR))
    for i, at in enumerate([0.1, 0.42, 0.74, 1.35, 1.67]):       # handbell pattern 3-then-2
        x = place(x, bell(1318.5 if i < 3 else 1174.7, 1.1, seed=480+i)*0.5, at)
    hush = filt(noise(1.4, 485), "band", (500, 4000))*np.linspace(0.7, 0.02, int(1.4*SR))
    x = place(x, hush, 0.6)                                      # the crowd hushes
    cry = vox(pitch_drop(220, 165, 0.9, curve=1.0), 0.9, nsyl=2, seed=486)  # "hear ye"
    x = place(x, slapback(filt(cry, "low", 2200)*0.8, delay=0.18, decay=0.4, n=2), 2.1)
    label3("sfx-herald-trumpet", "The Herald", "wave 5",
           "it announces (wave / phase)",
           "a handbell rung three-then-two, the crowd hushing itself, and a town-crier voice with courtyard echo — hear ye")
    return finish(x)

def v3_spoiler_rewind():
    dur = 3.0; x = np.zeros(int(dur*SR))
    t = t_lin(1.2)
    ff = osc(1200*(3000/1200)**(t/1.2)*(1+0.05*np.sin(2*np.pi*30*t)), 1.2, "sine")  # VCR FF whine
    x = place(x, ff*adsr(len(ff), 0.05, 0.1, 0.9, 0.1, peak=0.4), 0.0)
    for at in [0.35, 0.7, 1.0]:                                  # tracking static
        st = filt(noise(0.08, 490+int(at*20)), "high", 2500)*exp_decay(int(0.08*SR), 0.015)*0.5
        x = place(x, st, at)
    for i, f in enumerate([392.0, 370.0]):                       # "previously on" — wrong notes
        n = brass_note(f, 0.4, seed=494+i)
        x = place(x, crush(n, bits=7)*0.6, 1.35+i*0.45)
    x = place(x, filt(noise(0.1, 496), "low", 600)*exp_decay(int(0.1*SR), 0.02)*1.0, 2.4)  # eject
    label3("sfx-spoiler-spoil", "Spoiler", "wave 5",
           "it spoils (ruins a plan)",
           "VCR fast-forward whine chewing the tape, tracking static — then the 'previously on' recap plays the WRONG notes, and the tape ejects")
    return finish(x)

def v3_timeslot_schedule():
    dur = 3.6; x = np.zeros(int(dur*SR)); t = t_lin(dur)
    x += (osc(120, dur)+0.35*osc(240, dur))*0.15                  # streetlight buzz
    flap = filt(noise(dur, 501), "band", (900, 3600))*(0.5+0.5*np.sign(np.sin(2*np.pi*6*t)))**2*0.16
    x += flap*adsr(len(flap), 0.3, 0.4, 0.8, 0.5, peak=1.0)       # schedule flapping
    for i in range(10):                                          # the tick underneath
        tk = osc(840 if i % 2 == 0 else 660, 0.05)*exp_decay(int(0.05*SR), 0.008)*0.55
        x = place(x, tk, 0.2+i*0.28)
    sigh = filt(noise(1.0, 502), "band", (300, 1200))*np.sin(np.pi*np.arange(int(1.0*SR))/int(1.0*SR))**2*0.5
    x = place(x, sigh, 2.5)                                      # bus air-brake sigh
    label3("sfx-timeslot-tick", "Timeslot", "wave 5",
           "its countdown pressure",
           "a streetlight buzzing over a bus schedule flapping in the wind, the tick-tock underneath — then a bus sighs and doesn't stop")
    return finish(x)

def v3_finale_countdown():
    dur = 3.8; x = np.zeros(int(dur*SR))
    for i, (at, f0) in enumerate([(0.2, 196), (1.1, 174.61)]):    # "3... 2..."
        cnt = vox(f0, 0.5, nsyl=1, seed=510+i)
        x = place(x, filt(cnt, "low", 1500)*adsr(int(0.5*SR), 0.03, 0.1, 0.9, 0.15, peak=0.8), at)
        boom = filt(fm(60, 45, 7*np.exp(-t_lin(0.5)/0.12), 0.5)+0.7*noise(0.5, 512+i), "low", 400)
        x = place(x, boom*exp_decay(int(0.5*SR), 0.12)*1.1, at+0.35)
    # "1" never comes — a whine rises instead, then the titlecard boom
    t = t_lin(1.0)
    whine = osc(800*(2400/800)**(t/1.0), 1.0, "saw")*np.linspace(0.1, 0.9, len(t))
    x = place(x, filt(whine, "low", 3000)*adsr(len(whine), 0.2, 0.2, 0.8, 0.1, peak=0.6), 2.1)
    boom2 = filt(fm(55, 42, 8*np.exp(-t_lin(0.7)/0.14), 0.7)+0.8*noise(0.7, 514), "low", 380)
    x = place(x, boom2*exp_decay(int(0.7*SR), 0.15)*1.3, 3.05)
    label3("sfx-finale-titlecard", "The Finale", "wave 5",
           "it arrives (boss intro)",
           "a voice counts 3... 2... — and 1 never comes. A whine rises in the silence where 1 should be, then the boom")
    return finish(x)

def v3_eulogy_verse():
    dur = 4.6; x = np.zeros(int(dur*SR))
    organ = sum(osc(f*(1+d), 2.8, "saw") for f in (110, 130.81, 164.81) for d in (-0.002, 0.002))
    organ = filt(organ, "low", 1000)*adsr(len(organ), 0.9, 0.5, 0.75, 1.4, peak=0.4)
    x = place(x, wow(organ, rate=4.8, depth=0.005), 0.0)
    for i, at in enumerate([0.6, 1.7, 2.8]):                     # reading the names
        nm = vox(pitch_drop(165-8*i, 130-8*i, 0.8, curve=1.0), 0.8, nsyl=2, seed=520+i)
        x = place(x, slapback(filt(nm, "low", 1800)*0.65, delay=0.22, decay=0.45, n=2), at)
    x = place(x, bell(73.4, 3.6, seed=524)*0.85, 0.2)
    x = place(x, bell(69.3, 3.4, seed=525)*0.7, 3.6)             # tolls a semitone apart
    label3("sfx-eulogy-verse", "The Eulogy", "wave 5",
           "it speaks its verse (telegraph)",
           "a warbling funeral organ, a voice reading names with chapel echo, and two bell tolls a semitone apart — grief, weaponized")
    return finish(x)

def v3_network_note_slip():
    dur = 2.4; x = np.zeros(int(dur*SR))
    slide = filt(noise(0.7, 531), "band", (1000, 4500))*np.linspace(0.3, 1.0, int(0.7*SR))
    slide *= np.sin(np.pi*np.linspace(0, 0.5, int(0.7*SR)))**0.5  # paper under a door
    x = place(x, slide*0.7, 0.15)
    x = place(x, bell(2093*0.94, 1.4, seed=532)*0.4, 1.0)        # typewriter ding, wrong pitch
    x = place(x, filt(noise(1.0, 533), "high", 6500)*0.012, 1.4)   # room tone after
    label3("sfx-network_note-slip", "Network Note", "wave 5",
           "it issues a note (mandate)",
           "paper sliding under a door, one typewriter ding at the wrong pitch — the note doesn't ask")
    return finish(x)

def v3_finale_crew_quiet():
    dur = 3.0; x = np.zeros(int(dur*SR))
    shh = filt(noise(0.9, 541), "band", (1500, 4500))*adsr(int(0.9*SR), 0.05, 0.2, 0.6, 0.25, peak=0.55)
    shh *= (0.6+0.4*np.sin(2*np.pi*3*t_lin(0.9)))                 # "quiet on set" hush
    x = place(x, shh, 0.1)
    for dt in (0.0, 0.06):                                       # clapperboard
        ck = filt(noise(0.03, 542+int(dt*1000)), "high", 2200)*exp_decay(int(0.03*SR), 0.005)*1.0
        x = place(x, ck, 1.15+dt)
    tally = osc(120, 1.4)*np.linspace(0.0, 0.5, int(1.4*SR))     # tally light hum fades in, stays
    x = place(x, filt(tally, "low", 500), 1.4)
    label3("sfx-finale_crew-quiet", "Finale Crew", "wave 5",
           "it starts filming (fight begins)",
           "a 'quiet on set' hush, the clapperboard snap — then the red tally-light hum fades in and doesn't leave. You're live")
    return finish(x)

def v3_finale_opening_theme():
    dur = 3.4; x = np.zeros(int(dur*SR))
    motif = [523.25, 659.25, 783.99, 1046.5]
    at = 0.1
    for rep in range(2):                                         # theme tries to resolve...
        for f in motif:
            x = place(x, bell(f, 0.4, seed=550+rep*4+int(f))*0.5, at); at += 0.19
        sc = filt(noise(0.12, 554+rep), "high", 1800)*exp_decay(int(0.12*SR), 0.02)*0.6
        x = place(x, sc, at); at += 0.35                         # ...scratched every time
    label3("sfx-finale_opening-sting", "Finale Opening", "wave 5",
           "the episode starts (finale phase)",
           "your own theme song starting — bright, major, almost triumphant — needle-scratched every time it tries to resolve")
    return finish(x)

RECIPES_V3 = [
    ("sfx-congregation-invite", v3_congregation_invite),
    ("sfx-congregation-geas", v3_congregation_geas),
    ("sfx-congregation-absolve", v3_congregation_absolve),
    ("sfx-strike-shutdown", v3_strike_shutdown),
    ("sfx-suburb-hum", v3_suburb_hum),
    ("sfx-focusgroup-murmur", v3_focusgroup_murmur),
    ("sfx-redactor-censor", v3_redactor_censor),
    ("sfx-gavel-verdict", v3_gavel_verdict),
    ("sfx-spool-tangle", v3_spool_tangle),
    ("sfx-chorus_line-unison", v3_chorus_line_unison),
    ("sfx-terms_of_service-fineprint", v3_terms_of_service_fineprint),
    ("sfx-callback-ringback", v3_callback_ringback),
    ("sfx-buffering-spin", v3_buffering_spin),
    ("sfx-ad_break-jingle", v3_ad_break_jingle),
    ("sfx-influencer-shutter", v3_influencer_shutter),
    ("sfx-audit-stamp", v3_audit_stamp),
    ("sfx-reunion-calling", v3_reunion_calling),
    ("sfx-nielsen-watch", v3_nielsen_watch),
    ("sfx-eater-gorge", v3_eater_gorge),
    ("sfx-algorithm-tick", r_algorithm_tick),
    ("sfx-herald-trumpet", v3_herald_crier),
    ("sfx-cancellation-descend", r_cancellation_descend),
    ("sfx-editor-cut", r_editor_cut),
    ("sfx-rerun-clap", r_rerun_clap),
    ("sfx-spoiler-spoil", v3_spoiler_rewind),
    ("sfx-timeslot-tick", v3_timeslot_schedule),
    ("sfx-finale-titlecard", v3_finale_countdown),
    ("sfx-finale-sacrifice", r_finale_sacrifice),
    ("sfx-eulogy-verse", v3_eulogy_verse),
    ("sfx-network_note-slip", v3_network_note_slip),
    ("sfx-finale_crew-quiet", v3_finale_crew_quiet),
    ("sfx-finale_opening-sting", v3_finale_opening_theme),
]

def main_v3():
    import wave
    ok = 0
    for slug, fn in RECIPES_V3:
        y = fn()
        wav = os.path.join(OUT, slug + ".wav")
        with wave.open(wav, "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((np.clip(y, -1, 1)*32767).astype(np.int16).tobytes())
        mp3 = os.path.join(OUT, slug + ".mp3")
        r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", wav, "-codec:a", "libmp3lame",
                            "-b:a", "128k", mp3], capture_output=True, text=True)
        os.remove(wav)
        size = os.path.getsize(mp3) if os.path.exists(mp3) else 0
        flag = "" if size > 4000 else "  <-- SUSPICIOUSLY SMALL"
        print(f"{slug}: {size} bytes{flag}")
        if size > 4000: ok += 1
        else: print(r.stderr[:300])
    print(f"\n{ok}/{len(RECIPES_V3)} rendered OK")
    with open(os.path.join(OUT, "LABELS_V3.md"), "w") as f:
        f.write("# Audio previews v3 — per-monster signatures\n\n")
        f.write("v3 rule (Steve 2026-10-12): every signature derived from the monster's own fiction — ")
        f.write("never a palette variation with a name taped on. 29 monsters, 32 signatures.\n\n")
        for slug, name, wave, trigger, derivation in LABELS_V3:
            f.write(f"## {slug}\n**{name}** · {wave} · trigger: {trigger}\n\n{derivation}\n\n")
    print("LABELS_V3.md written")

if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "v3"
    (main_v3 if which == "v3" else main)()
