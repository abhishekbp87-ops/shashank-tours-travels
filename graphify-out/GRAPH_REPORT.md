# Graph Report - ApexCabs  (2026-10-09)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 664 nodes · 1243 edges · 42 communities (31 shown, 11 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 96 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `24e7e0bc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- main.js
- server.js
- package.json
- public/js/gsap.min.js
- js/gsap.min.js
- js/MotionPathPlugin.min.js
- public/js/MotionPathPlugin.min.js
- js/ScrollTrigger.min.js
- public/js/ScrollTrigger.min.js
- r
- r
- Tween
- Bc
- K
- Tween
- _d
- Bc
- K
- df
- _d
- ja
- mc
- ja
- mc
- df
- cb
- initJourneyMotion
- cb
- Qa
- .oxlintrc.json
- Qa
- src-vite-backup/data/testimonials.js
- Ub
- Vb
- Ub
- Vb
- companyInfo.js
- src-vite-backup/data/destinations.js
- src-vite-backup/data/fleet.js
- routes.js
- src-vite-backup/data/services.js
- src-vite-backup/data/tours.js

## God Nodes (most connected - your core abstractions)
1. `Bc()` - 19 edges
2. `Bc()` - 19 edges
3. `r()` - 13 edges
4. `s()` - 13 edges
5. `Tween()` - 13 edges
6. `Tween()` - 13 edges
7. `r()` - 13 edges
8. `s()` - 13 edges
9. `initBookingWidget()` - 10 edges
10. `t()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `jf()` --indirect_call--> `s()`  [INFERRED]
  js/ScrollTrigger.min.js → js/gsap.min.js
- `pf()` --indirect_call--> `s()`  [INFERRED]
  js/ScrollTrigger.min.js → js/gsap.min.js
- `tf()` --indirect_call--> `s()`  [INFERRED]
  js/ScrollTrigger.min.js → js/gsap.min.js
- `yb()` --indirect_call--> `t()`  [INFERRED]
  js/ScrollTrigger.min.js → js/gsap.min.js
- `Bc()` --indirect_call--> `Z()`  [INFERRED]
  js/ScrollTrigger.min.js → js/MotionPathPlugin.min.js

## Import Cycles
- None detected.

## Communities (42 total, 11 thin omitted)

### Community 0 - "main.js"
Cohesion: 0.05
Nodes (49): businessConfig, companyInfo, paymentInfo, destinationsData, fleetData, servicesData, howItWorksSteps, trustHighlights (+41 more)

### Community 1 - "server.js"
Cohesion: 0.07
Nodes (38): db, dbDir, dbPath, __dirname, __filename, initDatabase(), adminLogin(), getAdminDashboardStats() (+30 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (38): dependencies, bcryptjs, cors, dotenv, express, jsonwebtoken, lucide-react, qrcode (+30 more)

### Community 3 - "public/js/gsap.min.js"
Cohesion: 0.06
Nodes (20): de(), ee(), Jd(), Kd(), la(), Ld(), ma(), Md() (+12 more)

### Community 4 - "js/gsap.min.js"
Cohesion: 0.06
Nodes (19): ee(), Jd(), Kd(), la(), Ld(), ma(), Md(), na() (+11 more)

### Community 5 - "js/MotionPathPlugin.min.js"
Cohesion: 0.09
Nodes (31): aa(), arcToSegment(), ba(), C(), cacheRawPathMeasurements(), convertToPath(), getGlobalMatrix(), getPositionOnPath() (+23 more)

### Community 6 - "public/js/MotionPathPlugin.min.js"
Cohesion: 0.09
Nodes (31): aa(), arcToSegment(), ba(), C(), cacheRawPathMeasurements(), convertToPath(), getGlobalMatrix(), getPositionOnPath() (+23 more)

### Community 7 - "js/ScrollTrigger.min.js"
Cohesion: 0.07
Nodes (5): de(), gc(), Ja(), Ka(), qb()

### Community 8 - "public/js/ScrollTrigger.min.js"
Cohesion: 0.07
Nodes (4): gc(), Ja(), Ka(), qb()

### Community 9 - "r"
Cohesion: 0.12
Nodes (24): _a(), ac(), Co(), db(), ea(), eb(), fa(), ga() (+16 more)

### Community 10 - "r"
Cohesion: 0.14
Nodes (21): _a(), ac(), Co(), db(), ea(), eb(), ga(), gb() (+13 more)

### Community 11 - "Tween"
Cohesion: 0.15
Nodes (17): _assertThisInitialized(), Ec(), Fc(), gc(), ka(), qa(), t(), tb() (+9 more)

### Community 12 - "Bc"
Cohesion: 0.17
Nodes (14): Bc(), Cq(), Dq(), Jq(), Ha(), Ia(), ob(), rc() (+6 more)

### Community 13 - "K"
Cohesion: 0.15
Nodes (14): A(), B(), F(), G(), dd(), K(), O(), P() (+6 more)

### Community 14 - "Tween"
Cohesion: 0.21
Nodes (13): _assertThisInitialized(), Ec(), Fc(), gc(), qa(), t(), Timeline(), Tween() (+5 more)

### Community 15 - "_d"
Cohesion: 0.19
Nodes (13): be(), _d(), ia(), ie(), je(), ka(), ke(), le() (+5 more)

### Community 16 - "Bc"
Cohesion: 0.19
Nodes (12): Bc(), Cq(), Dq(), Jq(), Ha(), Ia(), ob(), tc() (+4 more)

### Community 17 - "K"
Cohesion: 0.18
Nodes (11): A(), B(), F(), G(), dd(), K(), O(), P() (+3 more)

### Community 18 - "df"
Cohesion: 0.27
Nodes (11): df(), ff(), gf(), hf(), jf(), M(), N(), of() (+3 more)

### Community 19 - "_d"
Cohesion: 0.29
Nodes (10): be(), _d(), fa(), ia(), ie(), je(), ke(), le() (+2 more)

### Community 20 - "ja"
Cohesion: 0.28
Nodes (9): Aa(), Animation(), ha(), ja(), Jc(), Lc(), Ra(), Sa() (+1 more)

### Community 21 - "mc"
Cohesion: 0.22
Nodes (9): Cb(), J(), mb(), mc(), oc(), Ta(), tb(), Ua() (+1 more)

### Community 22 - "ja"
Cohesion: 0.28
Nodes (9): Aa(), Animation(), ha(), ja(), Jc(), Lc(), Ra(), Sa() (+1 more)

### Community 23 - "mc"
Cohesion: 0.22
Nodes (9): Cb(), J(), mb(), mc(), oc(), Ta(), tb(), Ua() (+1 more)

### Community 24 - "df"
Cohesion: 0.32
Nodes (8): df(), ff(), gf(), hf(), N(), of(), pf(), qf()

### Community 25 - "cb"
Cohesion: 0.29
Nodes (7): Ab(), Bb(), cb(), Context(), fb(), Gw(), zb()

### Community 26 - "initJourneyMotion"
Cohesion: 0.38
Nodes (4): initJourneyMotion(), handleMouseEnter(), handleMouseMove(), updateMouseParallax()

### Community 27 - "cb"
Cohesion: 0.29
Nodes (7): Ab(), Bb(), cb(), Context(), fb(), Gw(), zb()

### Community 28 - "Qa"
Cohesion: 0.53
Nodes (6): Db(), La(), Ma(), Na(), Qa(), z()

### Community 29 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 30 - "Qa"
Cohesion: 0.53
Nodes (6): Db(), La(), Ma(), Na(), Qa(), z()

## Knowledge Gaps
- **4 isolated node(s):** `lucide-react`, `oxlint`, `@types/react`, `@types/react-dom`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 193 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `de()` connect `public/js/gsap.min.js` to `public/js/ScrollTrigger.min.js`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Bc()` (e.g. with `Z()` and `Jq()`) actually correct?**
  _`Bc()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `lucide-react`, `oxlint`, `@types/react` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `main.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05365296803652968 - nodes in this community are weakly interconnected._
- **Why does `de()` connect `js/ScrollTrigger.min.js` to `js/gsap.min.js`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Bc()` (e.g. with `Z()` and `Jq()`) actually correct?**
  _`Bc()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._