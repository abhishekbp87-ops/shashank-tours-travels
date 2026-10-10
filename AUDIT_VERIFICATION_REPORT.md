# Full-Stack Audit & Production Verification Report
**Project:** Shashank Tours & Travels (ApexCabs)  
**Location:** `D:\webproject\ApexCabs`  
**Role:** Senior Full-Stack Engineer, Security Auditor & DevOps / Cloudflare Specialist
**Date:** October 2026
**Repository:** `https://github.com/abhishekbp87-ops/shashank-tours-travels.git` (Branch: `main`)

---

## 1. Executive Summary & Root Cause Analysis

A comprehensive audit was performed across the entire repository to resolve why customer review submissions and contact inquiries submitted from the live Cloudflare-hosted site did not appear in the Admin Portal, and why `admin.html` exhibited parse5 errors during Vite builds.

### Confirmed Root Causes Identified & Fixed:

1. **Cloudflare Pages Edge Disconnect (Architecture Mismatch):**
   * The live frontend is hosted on **Cloudflare Pages static CDN** (`dist/`).
   * In `js/main.js`, `API_BASE` defaulted to `""` (relative path) when `VITE_API_URL` was not supplied at build time.
   * Browsers dispatched requests to `https://<project>.pages.dev/api/...`. Because Cloudflare Pages is static without a backend handler, requests returned HTTP 404/520 and never reached the Express backend or SQLite database.
   * **Fix:** Created a production Cloudflare Pages Function (`functions/api/[[catchall]].js`) that proxies all `/api/*` traffic to `BACKEND_API_URL`, with loop prevention and CORS preflight handling at the edge. Also added `public/_redirects` as a fallback.

2. **Mobile Autofill Honeypot Trap:**
   * Forms contained a hidden input (`name="botCheck"`). Mobile browsers (Chrome Android and Safari iOS) auto-filled this field when users selected autofill for name/email.
   * In `reviewController.js`, `contactController.js`, and `bookingController.js`, `if (botCheck)` responded with **HTTP 200 `{ success: true }`** without writing to SQLite, creating a false-success experience for users while discarding the record.
   * **Fix:** Placed the honeypot strictly off-screen (`position: absolute; left: -9999px;`) with `autocomplete="new-password"`. Updated controllers to return honest **HTTP 400 Bad Request** when honeypots are triggered.

3. **CORS Preflight Blocking on Mobile LAN & Tunnel Origins:**
   * In `backend/server.js`, `devAllowedOrigins` hardcoded only `localhost` and `127.0.0.1`.
   * **Fix:** Enhanced CORS middleware to dynamically permit local LAN subnets (`192.168.*`, `10.*`, `172.16-31.*`) and Cloudflare Quick Tunnels (`*.trycloudflare.com`) in development, while strictly enforcing `ALLOWED_ORIGINS` in production.

4. **Admin Portal Script Parsing & HTML Parse5 Errors:**
   * In `admin.html`, an opening `<script>` tag was missing before line 748. Vite's HTML parser (`parse5`) attempted to parse ~400 lines of JavaScript containing `<option>` template strings and `.replaceAll('<', '&lt;')` as HTML body elements, triggering parse errors.
   * **Fix:** Extracted all admin logic into a clean, dedicated ES module: `js/admin.js`. Linked it in `admin.html` via `<script type="module" src="/js/admin.js"></script>`. Bound action functions to `window` for inline event compatibility.

5. **Admin Portal Live Counter Desynchronization:**
   * In `admin.html`, table loaders (`loadReviews()` and `loadContacts()`) did not update badge pills (`#badgeReviews`, `#badgeContacts`) or filter button text counts with the returned `counts` payload.
   * **Fix:** Updated `loadReviews()` and `loadContacts()` in `js/admin.js` to immediately update counters and badges upon fetching.

6. **Credential Hardening:**
   * Removed hardcoded fallback password from `backend/config/database.js`. The server now strictly requires `process.env.ADMIN_PASSWORD`.

---

## 2. Production Architecture & Database Persistence

```
┌────────────────────────────────────────────────────────┐
│               LIVE PRODUCTION ARCHITECTURE             │
└────────────────────────────────────────────────────────┘

 [End-User Browser / Mobile Phone]
             │
             │ HTTPS
             ▼
 ┌───────────────────────────────────────────────────────┐
 │               Cloudflare Pages (CDN)                  │
 │   - Static Assets (HTML, CSS, JS, Images)             │
 │   - functions/api/[[catchall]].js (Pages Function)    │
 └──────────────────────────┬────────────────────────────┘
                            │
                            │ Proxies /api/* requests
                            │ with custom headers
                            ▼
 ┌───────────────────────────────────────────────────────┐
 │            Production Node.js Express API             │
 │   - Port 5000 / Reverse Proxy (Render / VPS / Tunnel) │
 │   - CORS Allowlist Validation                         │
 │   - Rate Limiting (per-route isolated buckets)        │
 │   - JWT Bearer Authentication                         │
 │   - Input Sanitization & Anti-Spam Check              │
 └──────────────────────────┬────────────────────────────┘
                            │
                            │ Synchronous WAL Writes
                            ▼
 ┌───────────────────────────────────────────────────────┐
 │               Persistent SQLite Database              │
 │   - backend/data/shashank_travels.db                  │
 │   - Tables: REVIEWS, CONTACT_MESSAGES, BOOKINGS,      │
 │             CUSTOMERS, ADMIN_USERS, TOURS, VEHICLES   │
 └───────────────────────────────────────────────────────┘
```

### Database Persistence Analysis:
* **Engine:** Node.js built-in `node:sqlite` (`DatabaseSync`).
* **Storage Location:** `backend/data/shashank_travels.db`.
* **Integrity Modes:** WAL mode enabled (`PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;`).
* **Production Persistence Requirement:** Cloudflare Pages does NOT run a Node.js process with a writable local filesystem. The Express backend must run on a server with persistent storage (VPS, Railway volume, Fly.io volume, or Render disk). SQLite data survives application restarts on persistent volumes.

---

## 3. Empirical Test Matrix

A comprehensive 21-case test suite (`test_e2e_verification.js`) was executed against the running backend server. All test rows were created with timestamped identifiers and purged immediately after verification.

| # | Test Case | Target / Endpoint | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| 1 | Health Endpoint | `GET /api/health` | HTTP 200, status: ok | HTTP 200, uptime reported | **PASS** |
| 2 | Admin Login (Valid) | `POST /api/admin/login` | HTTP 200, JWT returned | HTTP 200, JWT token acquired | **PASS** |
| 3 | Admin Login (Invalid) | `POST /api/admin/login` | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| 4 | Valid Review Submission | `POST /api/reviews` | HTTP 201 Created, ID returned | HTTP 201 Created, ID generated | **PASS** |
| 5 | Invalid Review Submission | `POST /api/reviews` | HTTP 400 Bad Request (rating > 5) | HTTP 400 Bad Request | **PASS** |
| 6 | Missing Fields in Review | `POST /api/reviews` | HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** |
| 7 | Review Honeypot Bot Check | `POST /api/reviews` | HTTP 400 Bad Request (not fake 200) | HTTP 400 Bad Request | **PASS** |
| 8 | Review in Admin All | `GET /api/reviews/all` | Review ID in `reviews` array | Found review ID in admin listing | **PASS** |
| 9 | Review in Admin Pending | `GET /api/reviews/all?status=pending` | Pending count >= 1 | Found review, pending count incremented | **PASS** |
| 10 | Review Moderation Approval | `PATCH /api/reviews/:id` | Visible in `GET /api/reviews` | Review immediately visible in public feed | **PASS** |
| 11 | Review Moderation Rejection | `PATCH /api/reviews/:id` | Hidden from `GET /api/reviews` | Review excluded from public feed | **PASS** |
| 12 | Valid Contact Submission | `POST /api/contact` | HTTP 201 Created, ID returned | HTTP 201 Created, ID generated | **PASS** |
| 13 | Missing Phone in Contact | `POST /api/contact` | HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** |
| 14 | Contact Honeypot Bot Check | `POST /api/contact` | HTTP 400 Bad Request | HTTP 400 Bad Request | **PASS** |
| 15 | Inquiry in Admin List | `GET /api/contact` | Inquiry ID in `messages` array | Found inquiry in admin list | **PASS** |
| 16 | Contact Status Update | `PATCH /api/contact/:id` | HTTP 200, status updated | Status updated to resolved | **PASS** |
| 17 | Unauthorized Admin Request | `GET /api/reviews/all` | HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| 18 | CORS Preflight from Pages | `OPTIONS /api/reviews` | HTTP 204 with Allow-Origin | HTTP 204 with `Access-Control-Allow-Origin: https://shashanktravels.pages.dev` | **PASS** |
| 19 | Pages Proxy Forwarding | `functions/api/[[catchall]].js` | Proxies to backend /api/health | HTTP 200, status: ok forwarded | **PASS** |
| 20 | Pages Proxy Loop Prevention | `functions/api/[[catchall]].js` | Detects self-referential URL | HTTP 508 Loop Detected | **PASS** |
| 21 | Test Data Cleanup & Integrity | SQLite `REVIEWS`, `CONTACT_MESSAGES` | 0 test rows remaining | All test records deleted, 0 lingering rows | **PASS** |

### Build & Linter Verification:
* **Static Linter:** `npm run lint` (`oxlint`) — **Found 0 warnings and 0 errors** across 36 files.
* **Production Build:** `npm run build` (`vite build`) — **Built in 278ms** with zero errors or warnings.

---

## 4. Production Configuration Requirements

### Required Cloudflare Pages Environment Variables:
In Cloudflare Dashboard -> **Workers & Pages** -> Select Project -> **Settings** -> **Environment variables**:
* `BACKEND_API_URL`: `https://your-deployed-backend-api.com` (public HTTPS URL of your Node.js Express server).

### Required Backend Environment Variables:
On the host running `node backend/server.js`:
```ini
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://shashanktravels.pages.dev,https://yourcustomdomain.com
JWT_SECRET=<unique-cryptographic-secret-at-least-32-chars>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-production-password>
```

---

## 5. Security & Operational Status

* **Status:** PASS (All local and automated architectural tests verified).
* **Live Production Connection:** BLOCKED pending configuration of `BACKEND_API_URL` in the Cloudflare Pages dashboard and deployment of the Express server to a publicly accessible host.
* **Credentials:** No secrets, passwords, or customer records committed to Git.
