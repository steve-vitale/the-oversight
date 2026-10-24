/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'adcbc2b29-20261024-052441';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=adcbc2b29-20261024-052441",
  "./src/js/engine/modifiers.js?v=adcbc2b29-20261024-052441",
  "./src/js/engine/calories.js?v=adcbc2b29-20261024-052441",
  "./src/js/engine/day.js?v=adcbc2b29-20261024-052441",
  "./src/js/engine/forage.js?v=adcbc2b29-20261024-052441",
  "./src/js/engine/combat.js?v=adcbc2b29-20261024-052441",
  "./src/js/audio-registry.js?v=adcbc2b29-20261024-052441",
  "./src/js/text.js?v=adcbc2b29-20261024-052441",
  "./src/js/game.js?v=adcbc2b29-20261024-052441",
  "./src/js/encounters.js?v=adcbc2b29-20261024-052441",
  "./src/js/conversation.js?v=adcbc2b29-20261024-052441",
  "./src/js/convo-mood.js?v=adcbc2b29-20261024-052441",
  "./src/js/convoTopics.js?v=adcbc2b29-20261024-052441",
  "./src/js/naming-rite.js?v=adcbc2b29-20261024-052441",
  "./src/js/convo-wants.js?v=adcbc2b29-20261024-052441",
  "./src/js/convo-dialogue.js?v=adcbc2b29-20261024-052441",
  "./src/js/convo-beats.js?v=adcbc2b29-20261024-052441",
  "./src/js/convo-scene.js?v=adcbc2b29-20261024-052441",
  "./src/js/voice-piper.js?v=adcbc2b29-20261024-052441",
  "./src/js/voice-system.js?v=adcbc2b29-20261024-052441",
  "./src/js/examine.js?v=adcbc2b29-20261024-052441",
  "./src/js/equipment.js?v=adcbc2b29-20261024-052441",
  "./src/js/journal.js?v=adcbc2b29-20261024-052441",
  "./src/js/party.js?v=adcbc2b29-20261024-052441",
  "./src/js/favor-water.js?v=adcbc2b29-20261024-052441",
  "./src/js/party-formal.js?v=adcbc2b29-20261024-052441",
  "./src/js/truth.js?v=adcbc2b29-20261024-052441",
  "./src/js/galactic-cast.js?v=adcbc2b29-20261024-052441",
  "./src/js/contests.js?v=adcbc2b29-20261024-052441",
  "./src/js/broadcast.js?v=adcbc2b29-20261024-052441",
  "./src/js/contestEngine.js?v=adcbc2b29-20261024-052441",
  "./src/js/alienPlayers.js?v=adcbc2b29-20261024-052441",
  "./src/js/storage.js?v=adcbc2b29-20261024-052441",
  "./src/js/perceive.js?v=adcbc2b29-20261024-052441",
  "./src/js/carexplore.js?v=adcbc2b29-20261024-052441",
  "./src/js/justice.js?v=adcbc2b29-20261024-052441",
  "./src/js/food.js?v=adcbc2b29-20261024-052441",
  "./src/js/betrayal.js?v=adcbc2b29-20261024-052441",
  "./src/js/corpses.js?v=adcbc2b29-20261024-052441",
  "./src/js/corruption.js?v=adcbc2b29-20261024-052441",
  "./src/js/lifeseed.js?v=adcbc2b29-20261024-052441",
  "./src/js/spawn-knack.js?v=adcbc2b29-20261024-052441",
  "./src/js/trial-deeds.js?v=adcbc2b29-20261024-052441",
  "./src/js/practice-deeds.js?v=adcbc2b29-20261024-052441",
  "./src/js/tracks.js?v=adcbc2b29-20261024-052441",
  "./src/js/villager-build.js?v=adcbc2b29-20261024-052441",
  "./src/js/progression.js?v=adcbc2b29-20261024-052441",
  "./src/js/waveLedger.js?v=adcbc2b29-20261024-052441",
  "./src/js/standing.js?v=adcbc2b29-20261024-052441",
  "./src/js/feastBuff.js?v=adcbc2b29-20261024-052441",
  "./src/js/ledger.js?v=adcbc2b29-20261024-052441",
  "./src/js/exposure.js?v=adcbc2b29-20261024-052441",
  "./src/js/abilityActions.js?v=adcbc2b29-20261024-052441",
  "./src/js/buildarounds.js?v=adcbc2b29-20261024-052441",
  "./src/js/foodPower.js?v=adcbc2b29-20261024-052441",
  "./src/js/monsterBehaviors.js?v=adcbc2b29-20261024-052441",
  "./src/js/partyTactics.js?v=adcbc2b29-20261024-052441",
  "./src/js/sigW3a.js?v=adcbc2b29-20261024-052441",
  "./src/js/statusEffects.js?v=adcbc2b29-20261024-052441",
  "./src/js/sigW3b.js?v=adcbc2b29-20261024-052441",
  "./src/js/metaProgression.js?v=adcbc2b29-20261024-052441",
  "./src/js/sigW3c.js?v=adcbc2b29-20261024-052441",
  "./src/js/sigW4.js?v=adcbc2b29-20261024-052441",
  "./src/js/sigW5.js?v=adcbc2b29-20261024-052441",
  "./src/js/villager-agency.js?v=adcbc2b29-20261024-052441",
  "./src/js/npc-triggers.js?v=adcbc2b29-20261024-052441",
  "./src/js/fieldFights.js?v=adcbc2b29-20261024-052441",
  "./src/js/party-wiring.js?v=adcbc2b29-20261024-052441",
  "./src/js/party-bond.js?v=adcbc2b29-20261024-052441",
  "./src/js/villager-objectives.js?v=adcbc2b29-20261024-052441",
  "./src/js/villager-mapmem.js?v=adcbc2b29-20261024-052441",
  "./src/js/codex-people.js?v=adcbc2b29-20261024-052441",
  "./src/js/fallen-memorial.js?v=adcbc2b29-20261024-052441",
  "./src/js/graves.js?v=adcbc2b29-20261024-052441",
  "./src/js/membership.js?v=adcbc2b29-20261024-052441",
  "./src/js/gardenCultivation.js?v=adcbc2b29-20261024-052441",
  "./src/js/havenGrowth.js?v=adcbc2b29-20261024-052441",
  "./src/js/shelter.js?v=adcbc2b29-20261024-052441",
  "./src/js/hierarchy.js?v=adcbc2b29-20261024-052441",
  "./src/js/scaleDiscovery.js?v=adcbc2b29-20261024-052441",
  "./src/js/comms.js?v=adcbc2b29-20261024-052441",
  "./src/js/table.js?v=adcbc2b29-20261024-052441",
  "./src/js/pods.js?v=adcbc2b29-20261024-052441",
  "./src/js/titans.js?v=adcbc2b29-20261024-052441",
  "./src/js/finale-campaign.js?v=adcbc2b29-20261024-052441",
  "./src/js/godhood.js?v=adcbc2b29-20261024-052441",
  "./src/js/pantheon.js?v=adcbc2b29-20261024-052441",
  "./src/js/records.js?v=adcbc2b29-20261024-052441",
  "./src/js/table-feared.js?v=adcbc2b29-20261024-052441",
  "./src/js/table-indispensable.js?v=adcbc2b29-20261024-052441",
  "./src/js/table-beloved.js?v=adcbc2b29-20261024-052441",
  "./src/js/table-witness.js?v=adcbc2b29-20261024-052441",
  "./src/js/table-assimilated.js?v=adcbc2b29-20261024-052441",
  "./src/js/table-defiant.js?v=adcbc2b29-20261024-052441",
  "./src/js/relay-ext.js?v=adcbc2b29-20261024-052441",
  "./src/js/relay-dialogue.js?v=adcbc2b29-20261024-052441",
  "./src/js/table-relay.js?v=adcbc2b29-20261024-052441",
  "./src/js/safetynets.js?v=adcbc2b29-20261024-052441",
  "./src/js/villageAgency.js?v=adcbc2b29-20261024-052441",
  "./src/js/memdepth.js?v=adcbc2b29-20261024-052441",
  "./src/js/overtime.js?v=adcbc2b29-20261024-052441",
  "./src/js/network-campaign.js?v=adcbc2b29-20261024-052441",
  "./src/js/debug-scenarios.js?v=adcbc2b29-20261024-052441",
  "./src/js/keepsakes.js?v=adcbc2b29-20261024-052441",
  "./src/js/skill-teaching.js?v=adcbc2b29-20261024-052441",
  "./src/js/world.js?v=adcbc2b29-20261024-052441",
  "./src/js/nomad.js?v=adcbc2b29-20261024-052441",
  "./src/js/nomad-wild.js?v=adcbc2b29-20261024-052441",
  "./src/js/nomad-scenes.js?v=adcbc2b29-20261024-052441",
  "./src/js/nomad-drive.js?v=adcbc2b29-20261024-052441",
  "./src/js/temperature.js?v=adcbc2b29-20261024-052441",
  "./src/js/godpath.js?v=adcbc2b29-20261024-052441",
  "./src/js/godverbs.js?v=adcbc2b29-20261024-052441",
  "./src/js/endingKey.js?v=adcbc2b29-20261024-052441",
  "./src/js/telemetry-hooks.js?v=adcbc2b29-20261024-052441",
  "./src/js/feel.js?v=adcbc2b29-20261024-052441",
  "./src/js/build.js?v=adcbc2b29-20261024-052441",
  "./src/js/whereAreWe.js?v=adcbc2b29-20261024-052441",
  "./src/js/drama.js?v=adcbc2b29-20261024-052441",
  "./src/js/move-anim.js?v=adcbc2b29-20261024-052441",
  "./src/js/presentation.js?v=adcbc2b29-20261024-052441",
  "./src/js/sprites.js?v=adcbc2b29-20261024-052441",
  "./src/js/tile-scenes.js?v=adcbc2b29-20261024-052441",
  "./src/js/regional-audio.js?v=adcbc2b29-20261024-052441",
  "./src/js/favor-company.js?v=adcbc2b29-20261024-052441",
  "./src/js/timeSettlement.js?v=adcbc2b29-20261024-052441",
  "./src/js/app.js?v=adcbc2b29-20261024-052441",
  "./src/js/feel-audio.js?v=adcbc2b29-20261024-052441",
  "./manifest.json?v=adcbc2b29-20261024-052441",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=adcbc2b29-20261024-052441",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=adcbc2b29-20261024-052441",
  "./src/data/alienPlayers.json?v=adcbc2b29-20261024-052441",
  "./src/data/animals.json?v=adcbc2b29-20261024-052441",
  "./src/data/arrivalText.json?v=adcbc2b29-20261024-052441",
  "./src/data/background_survivors.json?v=adcbc2b29-20261024-052441",
  "./src/data/biomes.json?v=adcbc2b29-20261024-052441",
  "./src/data/books.json?v=adcbc2b29-20261024-052441",
  "./src/data/build-notes.json?v=adcbc2b29-20261024-052441",
  "./src/data/cell_defs.json?v=adcbc2b29-20261024-052441",
  "./src/data/characterGen.json?v=adcbc2b29-20261024-052441",
  "./src/data/climates.json?v=adcbc2b29-20261024-052441",
  "./src/data/contests.json?v=adcbc2b29-20261024-052441",
  "./src/data/cooking.json?v=adcbc2b29-20261024-052441",
  "./src/data/events.json?v=adcbc2b29-20261024-052441",
  "./src/data/evolutions.json?v=adcbc2b29-20261024-052441",
  "./src/data/favor-rules.json?v=adcbc2b29-20261024-052441",
  "./src/data/feast-surge.json?v=adcbc2b29-20261024-052441",
  "./src/data/foreignSpeech.json?v=adcbc2b29-20261024-052441",
  "./src/data/gardening.json?v=adcbc2b29-20261024-052441",
  "./src/data/godpaths.json?v=adcbc2b29-20261024-052441",
  "./src/data/items.json?v=adcbc2b29-20261024-052441",
  "./src/data/justiceVoice.json?v=adcbc2b29-20261024-052441",
  "./src/data/knowledge.json?v=adcbc2b29-20261024-052441",
  "./src/data/lifeseeds.json?v=adcbc2b29-20261024-052441",
  "./src/data/locations.json?v=adcbc2b29-20261024-052441",
  "./src/data/monsterBehaviors.json?v=adcbc2b29-20261024-052441",
  "./src/data/monsters.json?v=adcbc2b29-20261024-052441",
  "./src/data/nameCultures.json?v=adcbc2b29-20261024-052441",
  "./src/data/originPicker.json?v=adcbc2b29-20261024-052441",
  "./src/data/plants.json?v=adcbc2b29-20261024-052441",
  "./src/data/presentation.json?v=adcbc2b29-20261024-052441",
  "./src/data/recipes.json?v=adcbc2b29-20261024-052441",
  "./src/data/regions.json?v=adcbc2b29-20261024-052441",
  "./src/data/relicEnhancements.json?v=adcbc2b29-20261024-052441",
  "./src/data/reward-economy.json?v=adcbc2b29-20261024-052441",
  "./src/data/schemas.json?v=adcbc2b29-20261024-052441",
  "./src/data/statusEffects.json?v=adcbc2b29-20261024-052441",
  "./src/data/synergies.json?v=adcbc2b29-20261024-052441",
  "./src/data/table-beats.json?v=adcbc2b29-20261024-052441",
  "./src/data/table-endings.json?v=adcbc2b29-20261024-052441",
  "./src/data/titans.json?v=adcbc2b29-20261024-052441",
  "./src/data/tracks.json?v=adcbc2b29-20261024-052441",
  "./src/data/villagers.json?v=adcbc2b29-20261024-052441",
  "./src/data/wave-ledger.json?v=adcbc2b29-20261024-052441"
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
