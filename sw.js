/* The Oversight — service worker.
   Update policy (v2): the SW is PURELY an offline cache. It never drives
   updates — version.json polling in index.html does that (it works even where
   SWs are unsupported, e.g. older iOS home-screen apps). A new SW installs in
   the background and activates on next load; the update banner flow
   unregisters SWs and wipes caches before navigating, so staleness is
   impossible regardless of SW state.
   CACHE version is bumped per build via scripts/bump-sw-version.sh. */
const VERSION = 'de87ef632-20261102-053200';
const CACHE = 'oversight-cache-' + VERSION;

// BEGIN GENERATED OFFLINE ASSETS
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./version.json",
  "./src/js/engine/state.js?v=de87ef632-20261102-053200",
  "./src/js/engine/modifiers.js?v=de87ef632-20261102-053200",
  "./src/js/engine/calories.js?v=de87ef632-20261102-053200",
  "./src/js/engine/day.js?v=de87ef632-20261102-053200",
  "./src/js/engine/forage.js?v=de87ef632-20261102-053200",
  "./src/js/engine/combat.js?v=de87ef632-20261102-053200",
  "./src/js/audio-registry.js?v=de87ef632-20261102-053200",
  "./src/js/text.js?v=de87ef632-20261102-053200",
  "./src/js/game.js?v=de87ef632-20261102-053200",
  "./src/js/encounters.js?v=de87ef632-20261102-053200",
  "./src/js/conversation.js?v=de87ef632-20261102-053200",
  "./src/js/convo-mood.js?v=de87ef632-20261102-053200",
  "./src/js/convoTopics.js?v=de87ef632-20261102-053200",
  "./src/js/naming-rite.js?v=de87ef632-20261102-053200",
  "./src/js/convo-wants.js?v=de87ef632-20261102-053200",
  "./src/js/convo-dialogue.js?v=de87ef632-20261102-053200",
  "./src/js/convo-beats.js?v=de87ef632-20261102-053200",
  "./src/js/convo-scene.js?v=de87ef632-20261102-053200",
  "./src/js/voice-piper.js?v=de87ef632-20261102-053200",
  "./src/js/voice-system.js?v=de87ef632-20261102-053200",
  "./src/js/examine.js?v=de87ef632-20261102-053200",
  "./src/js/equipment.js?v=de87ef632-20261102-053200",
  "./src/js/journal.js?v=de87ef632-20261102-053200",
  "./src/js/party.js?v=de87ef632-20261102-053200",
  "./src/js/favor-water.js?v=de87ef632-20261102-053200",
  "./src/js/favor-forage.js?v=de87ef632-20261102-053200",
  "./src/js/party-formal.js?v=de87ef632-20261102-053200",
  "./src/js/truth.js?v=de87ef632-20261102-053200",
  "./src/js/galactic-cast.js?v=de87ef632-20261102-053200",
  "./src/js/contests.js?v=de87ef632-20261102-053200",
  "./src/js/broadcast.js?v=de87ef632-20261102-053200",
  "./src/js/contestEngine.js?v=de87ef632-20261102-053200",
  "./src/js/alienPlayers.js?v=de87ef632-20261102-053200",
  "./src/js/storage.js?v=de87ef632-20261102-053200",
  "./src/js/perceive.js?v=de87ef632-20261102-053200",
  "./src/js/carexplore.js?v=de87ef632-20261102-053200",
  "./src/js/justice.js?v=de87ef632-20261102-053200",
  "./src/js/food.js?v=de87ef632-20261102-053200",
  "./src/js/betrayal.js?v=de87ef632-20261102-053200",
  "./src/js/corpses.js?v=de87ef632-20261102-053200",
  "./src/js/corruption.js?v=de87ef632-20261102-053200",
  "./src/js/lifeseed.js?v=de87ef632-20261102-053200",
  "./src/js/spawn-knack.js?v=de87ef632-20261102-053200",
  "./src/js/trial-deeds.js?v=de87ef632-20261102-053200",
  "./src/js/practice-deeds.js?v=de87ef632-20261102-053200",
  "./src/js/tracks.js?v=de87ef632-20261102-053200",
  "./src/js/villager-build.js?v=de87ef632-20261102-053200",
  "./src/js/progression.js?v=de87ef632-20261102-053200",
  "./src/js/waveLedger.js?v=de87ef632-20261102-053200",
  "./src/js/standing.js?v=de87ef632-20261102-053200",
  "./src/js/feastBuff.js?v=de87ef632-20261102-053200",
  "./src/js/ledger.js?v=de87ef632-20261102-053200",
  "./src/js/exposure.js?v=de87ef632-20261102-053200",
  "./src/js/abilityActions.js?v=de87ef632-20261102-053200",
  "./src/js/buildarounds.js?v=de87ef632-20261102-053200",
  "./src/js/foodPower.js?v=de87ef632-20261102-053200",
  "./src/js/monsterBehaviors.js?v=de87ef632-20261102-053200",
  "./src/js/partyTactics.js?v=de87ef632-20261102-053200",
  "./src/js/sigW3a.js?v=de87ef632-20261102-053200",
  "./src/js/statusEffects.js?v=de87ef632-20261102-053200",
  "./src/js/sigW3b.js?v=de87ef632-20261102-053200",
  "./src/js/metaProgression.js?v=de87ef632-20261102-053200",
  "./src/js/sigW3c.js?v=de87ef632-20261102-053200",
  "./src/js/sigW4.js?v=de87ef632-20261102-053200",
  "./src/js/sigW5.js?v=de87ef632-20261102-053200",
  "./src/js/villager-agency.js?v=de87ef632-20261102-053200",
  "./src/js/npc-triggers.js?v=de87ef632-20261102-053200",
  "./src/js/fieldFights.js?v=de87ef632-20261102-053200",
  "./src/js/party-wiring.js?v=de87ef632-20261102-053200",
  "./src/js/party-bond.js?v=de87ef632-20261102-053200",
  "./src/js/villager-objectives.js?v=de87ef632-20261102-053200",
  "./src/js/villager-mapmem.js?v=de87ef632-20261102-053200",
  "./src/js/codex-people.js?v=de87ef632-20261102-053200",
  "./src/js/fallen-memorial.js?v=de87ef632-20261102-053200",
  "./src/js/graves.js?v=de87ef632-20261102-053200",
  "./src/js/membership.js?v=de87ef632-20261102-053200",
  "./src/js/gardenCultivation.js?v=de87ef632-20261102-053200",
  "./src/js/havenGrowth.js?v=de87ef632-20261102-053200",
  "./src/js/shelter.js?v=de87ef632-20261102-053200",
  "./src/js/hierarchy.js?v=de87ef632-20261102-053200",
  "./src/js/scaleDiscovery.js?v=de87ef632-20261102-053200",
  "./src/js/comms.js?v=de87ef632-20261102-053200",
  "./src/js/table.js?v=de87ef632-20261102-053200",
  "./src/js/pods.js?v=de87ef632-20261102-053200",
  "./src/js/titans.js?v=de87ef632-20261102-053200",
  "./src/js/finale-campaign.js?v=de87ef632-20261102-053200",
  "./src/js/godhood.js?v=de87ef632-20261102-053200",
  "./src/js/pantheon.js?v=de87ef632-20261102-053200",
  "./src/js/records.js?v=de87ef632-20261102-053200",
  "./src/js/table-feared.js?v=de87ef632-20261102-053200",
  "./src/js/table-indispensable.js?v=de87ef632-20261102-053200",
  "./src/js/table-beloved.js?v=de87ef632-20261102-053200",
  "./src/js/table-witness.js?v=de87ef632-20261102-053200",
  "./src/js/table-assimilated.js?v=de87ef632-20261102-053200",
  "./src/js/table-defiant.js?v=de87ef632-20261102-053200",
  "./src/js/relay-ext.js?v=de87ef632-20261102-053200",
  "./src/js/relay-dialogue.js?v=de87ef632-20261102-053200",
  "./src/js/table-relay.js?v=de87ef632-20261102-053200",
  "./src/js/safetynets.js?v=de87ef632-20261102-053200",
  "./src/js/villageAgency.js?v=de87ef632-20261102-053200",
  "./src/js/memdepth.js?v=de87ef632-20261102-053200",
  "./src/js/overtime.js?v=de87ef632-20261102-053200",
  "./src/js/network-campaign.js?v=de87ef632-20261102-053200",
  "./src/js/debug-scenarios.js?v=de87ef632-20261102-053200",
  "./src/js/keepsakes.js?v=de87ef632-20261102-053200",
  "./src/js/skill-teaching.js?v=de87ef632-20261102-053200",
  "./src/js/world.js?v=de87ef632-20261102-053200",
  "./src/js/nomad.js?v=de87ef632-20261102-053200",
  "./src/js/nomad-wild.js?v=de87ef632-20261102-053200",
  "./src/js/nomad-scenes.js?v=de87ef632-20261102-053200",
  "./src/js/nomad-drive.js?v=de87ef632-20261102-053200",
  "./src/js/temperature.js?v=de87ef632-20261102-053200",
  "./src/js/godpath.js?v=de87ef632-20261102-053200",
  "./src/js/godverbs.js?v=de87ef632-20261102-053200",
  "./src/js/endingKey.js?v=de87ef632-20261102-053200",
  "./src/js/telemetry-hooks.js?v=de87ef632-20261102-053200",
  "./src/js/feel.js?v=de87ef632-20261102-053200",
  "./src/js/build.js?v=de87ef632-20261102-053200",
  "./src/js/whereAreWe.js?v=de87ef632-20261102-053200",
  "./src/js/drama.js?v=de87ef632-20261102-053200",
  "./src/js/move-anim.js?v=de87ef632-20261102-053200",
  "./src/js/presentation.js?v=de87ef632-20261102-053200",
  "./src/js/sprites.js?v=de87ef632-20261102-053200",
  "./src/js/tile-scenes.js?v=de87ef632-20261102-053200",
  "./src/js/regional-audio.js?v=de87ef632-20261102-053200",
  "./src/js/favor-company.js?v=de87ef632-20261102-053200",
  "./src/js/timeSettlement.js?v=de87ef632-20261102-053200",
  "./src/js/app.js?v=de87ef632-20261102-053200",
  "./src/js/feel-audio.js?v=de87ef632-20261102-053200",
  "./manifest.json?v=de87ef632-20261102-053200",
  "./assets/icons/icon-192.png",
  "./src/css/main.css?v=de87ef632-20261102-053200",
  "./assets/icons/icon-512.png",
  "./src/data/abilities.json?v=de87ef632-20261102-053200",
  "./src/data/alienPlayers.json?v=de87ef632-20261102-053200",
  "./src/data/animals.json?v=de87ef632-20261102-053200",
  "./src/data/arrivalText.json?v=de87ef632-20261102-053200",
  "./src/data/background_survivors.json?v=de87ef632-20261102-053200",
  "./src/data/biomes.json?v=de87ef632-20261102-053200",
  "./src/data/books.json?v=de87ef632-20261102-053200",
  "./src/data/build-notes.json?v=de87ef632-20261102-053200",
  "./src/data/cell_defs.json?v=de87ef632-20261102-053200",
  "./src/data/characterGen.json?v=de87ef632-20261102-053200",
  "./src/data/climates.json?v=de87ef632-20261102-053200",
  "./src/data/contests.json?v=de87ef632-20261102-053200",
  "./src/data/cooking.json?v=de87ef632-20261102-053200",
  "./src/data/events.json?v=de87ef632-20261102-053200",
  "./src/data/evolutions.json?v=de87ef632-20261102-053200",
  "./src/data/favor-rules.json?v=de87ef632-20261102-053200",
  "./src/data/feast-surge.json?v=de87ef632-20261102-053200",
  "./src/data/foreignSpeech.json?v=de87ef632-20261102-053200",
  "./src/data/gardening.json?v=de87ef632-20261102-053200",
  "./src/data/godpaths.json?v=de87ef632-20261102-053200",
  "./src/data/items.json?v=de87ef632-20261102-053200",
  "./src/data/justiceVoice.json?v=de87ef632-20261102-053200",
  "./src/data/knowledge.json?v=de87ef632-20261102-053200",
  "./src/data/lifeseeds.json?v=de87ef632-20261102-053200",
  "./src/data/locations.json?v=de87ef632-20261102-053200",
  "./src/data/monsterBehaviors.json?v=de87ef632-20261102-053200",
  "./src/data/monsters.json?v=de87ef632-20261102-053200",
  "./src/data/nameCultures.json?v=de87ef632-20261102-053200",
  "./src/data/originPicker.json?v=de87ef632-20261102-053200",
  "./src/data/plants.json?v=de87ef632-20261102-053200",
  "./src/data/presentation.json?v=de87ef632-20261102-053200",
  "./src/data/recipes.json?v=de87ef632-20261102-053200",
  "./src/data/regions.json?v=de87ef632-20261102-053200",
  "./src/data/relicEnhancements.json?v=de87ef632-20261102-053200",
  "./src/data/reward-economy.json?v=de87ef632-20261102-053200",
  "./src/data/schemas.json?v=de87ef632-20261102-053200",
  "./src/data/statusEffects.json?v=de87ef632-20261102-053200",
  "./src/data/synergies.json?v=de87ef632-20261102-053200",
  "./src/data/table-beats.json?v=de87ef632-20261102-053200",
  "./src/data/table-endings.json?v=de87ef632-20261102-053200",
  "./src/data/titans.json?v=de87ef632-20261102-053200",
  "./src/data/tracks.json?v=de87ef632-20261102-053200",
  "./src/data/villagers.json?v=de87ef632-20261102-053200",
  "./src/data/wave-ledger.json?v=de87ef632-20261102-053200"
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
