/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'eec64a07a-20261101-120219';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=eec64a07a-20261101-120219",
  "./src/js/engine/modifiers.js?v=eec64a07a-20261101-120219",
  "./src/js/engine/calories.js?v=eec64a07a-20261101-120219",
  "./src/js/engine/day.js?v=eec64a07a-20261101-120219",
  "./src/js/engine/forage.js?v=eec64a07a-20261101-120219",
  "./src/js/engine/combat.js?v=eec64a07a-20261101-120219",
  "./src/js/audio-registry.js?v=eec64a07a-20261101-120219",
  "./src/js/text.js?v=eec64a07a-20261101-120219",
  "./src/js/game.js?v=eec64a07a-20261101-120219",
  "./src/js/encounters.js?v=eec64a07a-20261101-120219",
  "./src/js/conversation.js?v=eec64a07a-20261101-120219",
  "./src/js/convo-mood.js?v=eec64a07a-20261101-120219",
  "./src/js/convoTopics.js?v=eec64a07a-20261101-120219",
  "./src/js/naming-rite.js?v=eec64a07a-20261101-120219",
  "./src/js/convo-wants.js?v=eec64a07a-20261101-120219",
  "./src/js/convo-dialogue.js?v=eec64a07a-20261101-120219",
  "./src/js/convo-beats.js?v=eec64a07a-20261101-120219",
  "./src/js/convo-scene.js?v=eec64a07a-20261101-120219",
  "./src/js/voice-piper.js?v=eec64a07a-20261101-120219",
  "./src/js/voice-system.js?v=eec64a07a-20261101-120219",
  "./src/js/examine.js?v=eec64a07a-20261101-120219",
  "./src/js/equipment.js?v=eec64a07a-20261101-120219",
  "./src/js/journal.js?v=eec64a07a-20261101-120219",
  "./src/js/party.js?v=eec64a07a-20261101-120219",
  "./src/js/favor-water.js?v=eec64a07a-20261101-120219",
  "./src/js/favor-forage.js?v=eec64a07a-20261101-120219",
  "./src/js/party-formal.js?v=eec64a07a-20261101-120219",
  "./src/js/truth.js?v=eec64a07a-20261101-120219",
  "./src/js/galactic-cast.js?v=eec64a07a-20261101-120219",
  "./src/js/contests.js?v=eec64a07a-20261101-120219",
  "./src/js/broadcast.js?v=eec64a07a-20261101-120219",
  "./src/js/contestEngine.js?v=eec64a07a-20261101-120219",
  "./src/js/alienPlayers.js?v=eec64a07a-20261101-120219",
  "./src/js/storage.js?v=eec64a07a-20261101-120219",
  "./src/js/perceive.js?v=eec64a07a-20261101-120219",
  "./src/js/carexplore.js?v=eec64a07a-20261101-120219",
  "./src/js/justice.js?v=eec64a07a-20261101-120219",
  "./src/js/food.js?v=eec64a07a-20261101-120219",
  "./src/js/betrayal.js?v=eec64a07a-20261101-120219",
  "./src/js/corpses.js?v=eec64a07a-20261101-120219",
  "./src/js/corruption.js?v=eec64a07a-20261101-120219",
  "./src/js/lifeseed.js?v=eec64a07a-20261101-120219",
  "./src/js/spawn-knack.js?v=eec64a07a-20261101-120219",
  "./src/js/trial-deeds.js?v=eec64a07a-20261101-120219",
  "./src/js/practice-deeds.js?v=eec64a07a-20261101-120219",
  "./src/js/tracks.js?v=eec64a07a-20261101-120219",
  "./src/js/villager-build.js?v=eec64a07a-20261101-120219",
  "./src/js/progression.js?v=eec64a07a-20261101-120219",
  "./src/js/waveLedger.js?v=eec64a07a-20261101-120219",
  "./src/js/standing.js?v=eec64a07a-20261101-120219",
  "./src/js/feastBuff.js?v=eec64a07a-20261101-120219",
  "./src/js/ledger.js?v=eec64a07a-20261101-120219",
  "./src/js/exposure.js?v=eec64a07a-20261101-120219",
  "./src/js/abilityActions.js?v=eec64a07a-20261101-120219",
  "./src/js/buildarounds.js?v=eec64a07a-20261101-120219",
  "./src/js/foodPower.js?v=eec64a07a-20261101-120219",
  "./src/js/monsterBehaviors.js?v=eec64a07a-20261101-120219",
  "./src/js/partyTactics.js?v=eec64a07a-20261101-120219",
  "./src/js/sigW3a.js?v=eec64a07a-20261101-120219",
  "./src/js/statusEffects.js?v=eec64a07a-20261101-120219",
  "./src/js/sigW3b.js?v=eec64a07a-20261101-120219",
  "./src/js/metaProgression.js?v=eec64a07a-20261101-120219",
  "./src/js/sigW3c.js?v=eec64a07a-20261101-120219",
  "./src/js/sigW4.js?v=eec64a07a-20261101-120219",
  "./src/js/sigW5.js?v=eec64a07a-20261101-120219",
  "./src/js/villager-agency.js?v=eec64a07a-20261101-120219",
  "./src/js/npc-triggers.js?v=eec64a07a-20261101-120219",
  "./src/js/fieldFights.js?v=eec64a07a-20261101-120219",
  "./src/js/party-wiring.js?v=eec64a07a-20261101-120219",
  "./src/js/party-bond.js?v=eec64a07a-20261101-120219",
  "./src/js/villager-objectives.js?v=eec64a07a-20261101-120219",
  "./src/js/villager-mapmem.js?v=eec64a07a-20261101-120219",
  "./src/js/codex-people.js?v=eec64a07a-20261101-120219",
  "./src/js/fallen-memorial.js?v=eec64a07a-20261101-120219",
  "./src/js/graves.js?v=eec64a07a-20261101-120219",
  "./src/js/membership.js?v=eec64a07a-20261101-120219",
  "./src/js/gardenCultivation.js?v=eec64a07a-20261101-120219",
  "./src/js/havenGrowth.js?v=eec64a07a-20261101-120219",
  "./src/js/shelter.js?v=eec64a07a-20261101-120219",
  "./src/js/hierarchy.js?v=eec64a07a-20261101-120219",
  "./src/js/scaleDiscovery.js?v=eec64a07a-20261101-120219",
  "./src/js/comms.js?v=eec64a07a-20261101-120219",
  "./src/js/table.js?v=eec64a07a-20261101-120219",
  "./src/js/pods.js?v=eec64a07a-20261101-120219",
  "./src/js/titans.js?v=eec64a07a-20261101-120219",
  "./src/js/finale-campaign.js?v=eec64a07a-20261101-120219",
  "./src/js/godhood.js?v=eec64a07a-20261101-120219",
  "./src/js/pantheon.js?v=eec64a07a-20261101-120219",
  "./src/js/records.js?v=eec64a07a-20261101-120219",
  "./src/js/table-feared.js?v=eec64a07a-20261101-120219",
  "./src/js/table-indispensable.js?v=eec64a07a-20261101-120219",
  "./src/js/table-beloved.js?v=eec64a07a-20261101-120219",
  "./src/js/table-witness.js?v=eec64a07a-20261101-120219",
  "./src/js/table-assimilated.js?v=eec64a07a-20261101-120219",
  "./src/js/table-defiant.js?v=eec64a07a-20261101-120219",
  "./src/js/relay-ext.js?v=eec64a07a-20261101-120219",
  "./src/js/relay-dialogue.js?v=eec64a07a-20261101-120219",
  "./src/js/table-relay.js?v=eec64a07a-20261101-120219",
  "./src/js/safetynets.js?v=eec64a07a-20261101-120219",
  "./src/js/villageAgency.js?v=eec64a07a-20261101-120219",
  "./src/js/memdepth.js?v=eec64a07a-20261101-120219",
  "./src/js/overtime.js?v=eec64a07a-20261101-120219",
  "./src/js/network-campaign.js?v=eec64a07a-20261101-120219",
  "./src/js/debug-scenarios.js?v=eec64a07a-20261101-120219",
  "./src/js/keepsakes.js?v=eec64a07a-20261101-120219",
  "./src/js/skill-teaching.js?v=eec64a07a-20261101-120219",
  "./src/js/world.js?v=eec64a07a-20261101-120219",
  "./src/js/nomad.js?v=eec64a07a-20261101-120219",
  "./src/js/nomad-wild.js?v=eec64a07a-20261101-120219",
  "./src/js/nomad-scenes.js?v=eec64a07a-20261101-120219",
  "./src/js/nomad-drive.js?v=eec64a07a-20261101-120219",
  "./src/js/temperature.js?v=eec64a07a-20261101-120219",
  "./src/js/godpath.js?v=eec64a07a-20261101-120219",
  "./src/js/godverbs.js?v=eec64a07a-20261101-120219",
  "./src/js/endingKey.js?v=eec64a07a-20261101-120219",
  "./src/js/telemetry-hooks.js?v=eec64a07a-20261101-120219",
  "./src/js/feel.js?v=eec64a07a-20261101-120219",
  "./src/js/build.js?v=eec64a07a-20261101-120219",
  "./src/js/whereAreWe.js?v=eec64a07a-20261101-120219",
  "./src/js/drama.js?v=eec64a07a-20261101-120219",
  "./src/js/move-anim.js?v=eec64a07a-20261101-120219",
  "./src/js/presentation.js?v=eec64a07a-20261101-120219",
  "./src/js/sprites.js?v=eec64a07a-20261101-120219",
  "./src/js/tile-scenes.js?v=eec64a07a-20261101-120219",
  "./src/js/regional-audio.js?v=eec64a07a-20261101-120219",
  "./src/js/favor-company.js?v=eec64a07a-20261101-120219",
  "./src/js/timeSettlement.js?v=eec64a07a-20261101-120219",
  "./src/js/app.js?v=eec64a07a-20261101-120219",
  "./src/js/feel-audio.js?v=eec64a07a-20261101-120219",
  "./manifest.json?v=eec64a07a-20261101-120219",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=eec64a07a-20261101-120219",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=eec64a07a-20261101-120219",
  "./src/data/alienPlayers.json?v=eec64a07a-20261101-120219",
  "./src/data/animals.json?v=eec64a07a-20261101-120219",
  "./src/data/arrivalText.json?v=eec64a07a-20261101-120219",
  "./src/data/background_survivors.json?v=eec64a07a-20261101-120219",
  "./src/data/biomes.json?v=eec64a07a-20261101-120219",
  "./src/data/books.json?v=eec64a07a-20261101-120219",
  "./src/data/build-notes.json?v=eec64a07a-20261101-120219",
  "./src/data/cell_defs.json?v=eec64a07a-20261101-120219",
  "./src/data/characterGen.json?v=eec64a07a-20261101-120219",
  "./src/data/climates.json?v=eec64a07a-20261101-120219",
  "./src/data/contests.json?v=eec64a07a-20261101-120219",
  "./src/data/cooking.json?v=eec64a07a-20261101-120219",
  "./src/data/events.json?v=eec64a07a-20261101-120219",
  "./src/data/evolutions.json?v=eec64a07a-20261101-120219",
  "./src/data/favor-rules.json?v=eec64a07a-20261101-120219",
  "./src/data/feast-surge.json?v=eec64a07a-20261101-120219",
  "./src/data/foreignSpeech.json?v=eec64a07a-20261101-120219",
  "./src/data/gardening.json?v=eec64a07a-20261101-120219",
  "./src/data/godpaths.json?v=eec64a07a-20261101-120219",
  "./src/data/items.json?v=eec64a07a-20261101-120219",
  "./src/data/justiceVoice.json?v=eec64a07a-20261101-120219",
  "./src/data/knowledge.json?v=eec64a07a-20261101-120219",
  "./src/data/lifeseeds.json?v=eec64a07a-20261101-120219",
  "./src/data/locations.json?v=eec64a07a-20261101-120219",
  "./src/data/monsterBehaviors.json?v=eec64a07a-20261101-120219",
  "./src/data/monsters.json?v=eec64a07a-20261101-120219",
  "./src/data/nameCultures.json?v=eec64a07a-20261101-120219",
  "./src/data/originPicker.json?v=eec64a07a-20261101-120219",
  "./src/data/plants.json?v=eec64a07a-20261101-120219",
  "./src/data/presentation.json?v=eec64a07a-20261101-120219",
  "./src/data/recipes.json?v=eec64a07a-20261101-120219",
  "./src/data/regions.json?v=eec64a07a-20261101-120219",
  "./src/data/relicEnhancements.json?v=eec64a07a-20261101-120219",
  "./src/data/reward-economy.json?v=eec64a07a-20261101-120219",
  "./src/data/schemas.json?v=eec64a07a-20261101-120219",
  "./src/data/statusEffects.json?v=eec64a07a-20261101-120219",
  "./src/data/synergies.json?v=eec64a07a-20261101-120219",
  "./src/data/table-beats.json?v=eec64a07a-20261101-120219",
  "./src/data/table-endings.json?v=eec64a07a-20261101-120219",
  "./src/data/titans.json?v=eec64a07a-20261101-120219",
  "./src/data/tracks.json?v=eec64a07a-20261101-120219",
  "./src/data/villagers.json?v=eec64a07a-20261101-120219",
  "./src/data/wave-ledger.json?v=eec64a07a-20261101-120219"
];
// END GENERATED OFFLINE ASSETS

self.addEventListener('install', e => {
  // Cache everything fresh for this version, then sit in "waiting" —
  // do NOT skipWaiting here; the page decides when to switch.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Only cache successful same-origin basics; game data is versioned by CACHE.
        // AUDIO RUNTIME CACHE (2026-10-12): voice lines are 14MB — too heavy to
        // precache at install, but the fetch handler never stored them, so the
        // offline PWA lost all voice after first install. Cache audio responses
        // at runtime: play once online, then it works offline.
        try {
          const ct = resp.headers.get('content-type') || '';
          if (resp.ok && (ct.indexOf('audio/') === 0 || e.request.url.indexOf('/src/audio/') !== -1)) {
            const copy = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
          }
        } catch (err) { /* cache failure must never break playback */ }
        return resp;
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('offline');
      });
    })
  );
});
