# Maquis — HTML5 prototype (unofficial)

A **playable first milestone** for an HTML5 version of the 2021 tabletop game *Maquis*, built for static GitHub Pages hosting. This is **not** a rules-complete or art-complete adaptation and is not endorsed by the publisher.

## Quick start

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To validate and build:

```bash
npm test
npm run build
```

The `dist/` output is a self-contained static site. Autosave uses the browser's `localStorage`.

## GitHub Pages

1. Create a GitHub repository and put the **contents** of this folder at its root.
2. Push to the `main` branch.
3. In GitHub **Settings → Pages → Build and deployment**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` tests, builds, and publishes the site on every push to `main`.
5. Open `https://YOUR-USERNAME.github.io/YOUR-REPO/` once deployment has completed.

Vite is configured with `base: './'` so asset links work beneath GitHub Pages project paths.

## What works now

- Schematic, clickable town map with map edges and resistance/patrol markers
- Resistance worker placement alternating with automatic patrol-card drawing
- The **ten three-choice patrol card priority lists**, transcribed from the 2021 rulebook's summary
- Occupied-space fallback and patrol arrest of workers when all three listed locations are occupied
- Morale-based minimum patrol count; soldier patrols placed last
- Worker actions, escape-path checks, arrest on blocked return, four-token resource cap
- Five resources and basic collecting/trading/recruiting interactions
- Once-per-day shooting a Milice pawn with a weapon, causing soldier escalation and morale loss
- Two original **tutorial-only** missions with objectives and an ending
- Browser autosave, restart, and unit tests

## IMPORTANT: fidelity audit / deliberately incomplete

The purpose of this first slice is to make gameplay and deployment tangible without falsely presenting an inaccurate ruleset as definitive.

- **Board diagram and graph are placeholder reconstructions**, *not* verified copies of the printed board. Positioning, connections, and the safe-house handling (Café as return point) must be corrected from licensed or independently verified materials. This may significantly change difficulty.
- **Mission A (Supply Run) and Mission B (Radio Network) are invented tutorial missions**. None of the official 2021 mission-card behaviors have been implemented yet.
- Only a subset of location actions is available; location-action names, costs, yields, and the spare-room building subsystem still need faithful transcription and tests.
- Fields, airdrops, shooting timing (only in action phase here), fake IDs, official morale calendar, mission-area special rules, action/shield nuances, and endgame three-star variations are not yet implemented.
- Escape/reward resolution is simplified: escape is checked before actions and rewards cannot be taken if there is no path. Official timing offers more possibilities, including shooting between action and retreat.
- Worker supply is simplified: recruiting increases worker count, but does not have the full published reserve-token model.
- "Day 15" and orange-day morale losses are provisional; compare physical track precisely before representing them as official.
- Patrol cards **are** based on the published summary but should be cross-checked visually, including order.
- The implementation uses plain CSS art; **no copyrighted board scans, tokens, cards, logos, or artwork are included**.

### Next fidelity milestones

1. Trace exact 2021 printed **board nodes and edges**, safe house, fields and mission entrances.
2. Implement all printed base-space action choices (including limited supply and resource trade rules).
3. Build real 2021 mission definitions, starting with the suggested introductory pair **Officer's Mansion / Milice Parade Day**.
4. Implement airdrops, nine spare-room tiles, fake IDs, action-before-escape reward timing, and difficulty modes.
5. Add scenario-based tests replaying documented examples from the rulebook.
6. Replace schematics with original commissioned art or assets distributed with explicit permission.

## Rulebook source

2021 rules: https://gamers-hq.de/media/pdf/bf/b6/45/Maquis_2021_Rules_v1-1.pdf

*Maquis* was designed by Jake Staines, and the published game is © Side Room Games. Game art belongs to its respective rights holders. Obtain permission before reproducing or distributing copyrighted board graphics or card text. The code in this prototype is provided as an independent technical starting point, not a grant of rights to the underlying game.
