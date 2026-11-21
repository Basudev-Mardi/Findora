const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { Readable } = require("node:stream");

const app = require("../src/app");
const { env } = require("../src/config/env");
const { resetDemoStore } = require("../src/models/demoStore");
const { setDatabaseTestOverride } = require("../src/config/db");

const ADMIN_HEADERS = { "x-admin-key": env.adminApiKey };

/**
 * Invokes the real Express app in-memory (no network sockets required)
 * so middleware, JSON parsing, routing, controllers, services, models,
 * and centralized error handling are tested end-to-end.
 */
function requestApp({ method = "GET", url = "/", body, rawBody, headers = {} }) {
  return new Promise((resolve, reject) => {
    const payload =
      rawBody !== undefined
        ? rawBody
        : body !== undefined
          ? JSON.stringify(body)
          : "";

    const buffer = payload ? Buffer.from(payload, "utf8") : null;
    const req = Readable.from(buffer ? [buffer] : []);
    req.method = method;
    req.url = url;
    req.httpVersion = "1.1";
    req.httpVersionMajor = 1;
    req.httpVersionMinor = 1;
    req.connection = { remoteAddress: "127.0.0.1" };
    req.socket = { remoteAddress: "127.0.0.1" };
    req.headers = {
      host: "localhost:5000",
      ...(buffer
        ? {
            "content-type": "application/json",
            "content-length": String(buffer.length),
          }
        : {}),
      ...headers,
    };

    const resHeaders = {};
    const chunks = [];
    const res = new EventEmitter();
    res.statusCode = 200;
    res.statusMessage = "OK";
    res.headersSent = false;
    res.locals = {};
    res.setHeader = (name, value) => {
      resHeaders[name.toLowerCase()] = value;
      return res;
    };
    res.getHeader = (name) => resHeaders[name.toLowerCase()];
    res.getHeaders = () => ({ ...resHeaders });
    res.hasHeader = (name) => name.toLowerCase() in resHeaders;
    res.removeHeader = (name) => {
      delete resHeaders[name.toLowerCase()];
    };
    res.writeHead = (statusCode, statusMessage, hdrs) => {
      res.statusCode = statusCode;
      const headerObj = typeof statusMessage === "object" ? statusMessage : hdrs;
      if (headerObj) {
        for (const [k, v] of Object.entries(headerObj)) {
          resHeaders[k.toLowerCase()] = v;
        }
      }
      res.headersSent = true;
      return res;
    };
    res.write = (chunk) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      return true;
    };
    res.end = (chunk) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      res.headersSent = true;
      const rawText = Buffer.concat(chunks).toString("utf8");
      let parsedBody = rawText;
      try {
        parsedBody = JSON.parse(rawText);
      } catch {
        // Keep raw text if not JSON
      }
      res.emit("finish");
      resolve({
        status: res.statusCode,
        headers: resHeaders,
        body: parsedBody,
      });
      return res;
    };

    app.handle(req, res, reject);
  });
}

describe("Findora REST API", () => {
  beforeEach(() => {
    setDatabaseTestOverride({ isDemoMode: true });
    resetDemoStore();
  });

  afterEach(() => {
    setDatabaseTestOverride(null);
  });

  describe("Health & Routing", () => {
    it("GET /api/health returns 200 in demo mode", async () => {
      const res = await requestApp({ method: "GET", url: "/api/health" });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.status, "ok");
      assert.equal(res.body.data.mode, "demo");
    });

    it("returns 404 for unknown routes", async () => {
      const res = await requestApp({ method: "GET", url: "/api/does-not-exist" });
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });

    it("returns 400 for malformed JSON body", async () => {
      const res = await requestApp({
        method: "POST",
        url: "/api/lost-items",
        rawBody: "{ invalid json",
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
    });
  });

  describe("Lost Items CRUD & Filters (/api/lost-items)", () => {
    it("GET /api/lost-items lists seeded items without exposing private details", async () => {
      const res = await requestApp({ method: "GET", url: "/api/lost-items" });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.total, 8);
      for (const item of res.body.data.items) {
        assert.equal(item.privateIdentifyingDetails, undefined);
        assert.equal(item.submissionHash, undefined);
      }
    });

    it("GET /api/lost-items supports search, category, location, date, and sort filters", async () => {
      const res = await requestApp({
        method: "GET",
        url: "/api/lost-items?search=AirPods&category=Electronics&location=Science%20Library&dateFrom=2026-11-19&dateTo=2026-11-20&sort=oldest",
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.total, 1);
      assert.equal(res.body.data.items[0].id, "lost-airpods");
    });

    it("GET /api/lost-items/:id returns item or 404 when missing", async () => {
      const found = await requestApp({
        method: "GET",
        url: "/api/lost-items/lost-wallet",
      });
      assert.equal(found.status, 200);
      assert.equal(found.body.data.title, "Black Leather Wallet");

      const missing = await requestApp({
        method: "GET",
        url: "/api/lost-items/non-existent",
      });
      assert.equal(missing.status, 404);
      assert.equal(missing.body.success, false);
    });

    it("POST /api/lost-items creates an item, rejects invalid input, and blocks duplicates", async () => {
      const invalid = await requestApp({
        method: "POST",
        url: "/api/lost-items",
        body: { title: "A", publicDescription: "short" },
      });
      assert.equal(invalid.status, 400);
      assert.equal(invalid.body.success, false);
      assert.ok(invalid.body.details.title);
      assert.ok(invalid.body.details.category);

      const sensitive = await requestApp({
        method: "POST",
        url: "/api/lost-items",
        body: {
          title: "Dorm Access Card",
          category: "ID & Cards",
          campusZone: "North Hall",
          location: "North Hall Lobby",
          dateLost: "2026-11-20",
          publicDescription: "Lost my card with number 123456789 near the lobby.",
        },
      });
      assert.equal(sensitive.status, 400);
      assert.ok(sensitive.body.details.publicDescription);

      const validPayload = {
        title: "Graphite Mechanical Pencil Case",
        category: "Stationery",
        campusZone: "Main Library",
        location: "Main Library, 2nd Floor Quiet Desk",
        dateLost: "2026-11-20",
        publicDescription:
          "Matte gray zip pencil pouch containing drafting pens left near the windows.",
        privateIdentifyingDetails: "Initials written inside the zipper flap.",
      };

      const created = await requestApp({
        method: "POST",
        url: "/api/lost-items",
        body: validPayload,
      });
      assert.equal(created.status, 201);
      assert.equal(created.body.success, true);
      assert.equal(created.body.data.title, validPayload.title);
      assert.equal(created.body.data.privateIdentifyingDetails, undefined);

      const duplicate = await requestApp({
        method: "POST",
        url: "/api/lost-items",
        body: validPayload,
      });
      assert.equal(duplicate.status, 409);
      assert.equal(duplicate.body.success, false);
    });

    it("PUT /api/lost-items/:id enforces admin auth, updates existing item, and returns 404 for missing", async () => {
      const unauthorized = await requestApp({
        method: "PUT",
        url: "/api/lost-items/lost-wallet",
        body: { status: "claim_requested" },
      });
      assert.equal(unauthorized.status, 401);

      const updated = await requestApp({
        method: "PUT",
        url: "/api/lost-items/lost-wallet",
        headers: ADMIN_HEADERS,
        body: { location: "Student Union, 2nd Floor Mezzanine", status: "claim_requested" },
      });
      assert.equal(updated.status, 200);
      assert.equal(updated.body.data.location, "Student Union, 2nd Floor Mezzanine");
      assert.equal(updated.body.data.status, "claim_requested");

      const missing = await requestApp({
        method: "PUT",
        url: "/api/lost-items/missing-id",
        headers: ADMIN_HEADERS,
        body: { status: "recovered" },
      });
      assert.equal(missing.status, 404);
    });

    it("DELETE /api/lost-items/:id enforces admin auth, removes item, and returns 404 on second delete", async () => {
      const unauthorized = await requestApp({
        method: "DELETE",
        url: "/api/lost-items/lost-charger",
      });
      assert.equal(unauthorized.status, 401);

      const del1 = await requestApp({
        method: "DELETE",
        url: "/api/lost-items/lost-charger",
        headers: ADMIN_HEADERS,
      });
      assert.equal(del1.status, 200);
      assert.equal(del1.body.data.deleted, true);

      const del2 = await requestApp({
        method: "DELETE",
        url: "/api/lost-items/lost-charger",
        headers: ADMIN_HEADERS,
      });
      assert.equal(del2.status, 404);
    });
  });

  describe("Found Items CRUD & Filters (/api/found-items)", () => {
    it("GET /api/found-items filters and strips privateVerificationDetails", async () => {
      const res = await requestApp({
        method: "GET",
        url: "/api/found-items?category=Accessories&sort=newest",
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.data.total, 2);
      for (const item of res.body.data.items) {
        assert.equal(item.privateVerificationDetails, undefined);
      }
    });

    it("POST, PUT, and DELETE /api/found-items work end-to-end with duplicate protection", async () => {
      const payload = {
        title: "Navy Umbrella with Wood Handle",
        category: "Personal",
        campusZone: "West Quad",
        location: "West Quad Bus Shelter",
        dateFound: "2026-11-20",
        publicDescription:
          "Compact dark navy folding umbrella with a curved wooden handle found on the bench.",
        privateVerificationDetails: "Small initials tag inside the strap.",
        additionalNotes: "Turned in to West Quad Front Desk.",
      };

      const created = await requestApp({
        method: "POST",
        url: "/api/found-items",
        body: payload,
      });
      assert.equal(created.status, 201);
      const createdId = created.body.data.id;
      assert.equal(created.body.data.privateVerificationDetails, undefined);

      const dup = await requestApp({
        method: "POST",
        url: "/api/found-items",
        body: payload,
      });
      assert.equal(dup.status, 409);

      const updated = await requestApp({
        method: "PUT",
        url: `/api/found-items/${createdId}`,
        headers: ADMIN_HEADERS,
        body: { additionalNotes: "Moved to Student Union Central Desk." },
      });
      assert.equal(updated.status, 200);
      assert.equal(
        updated.body.data.additionalNotes,
        "Moved to Student Union Central Desk."
      );

      const removed = await requestApp({
        method: "DELETE",
        url: `/api/found-items/${createdId}`,
        headers: ADMIN_HEADERS,
      });
      assert.equal(removed.status, 200);
    });
  });

  describe("Claim & Recovery Workflow (/api/claims)", () => {
    it("GET /api/claims and GET /api/claims/:id return public summaries without leaking private data", async () => {
      const list = await requestApp({ method: "GET", url: "/api/claims" });
      assert.equal(list.status, 200);
      assert.equal(list.body.data.total, 2);
      for (const claim of list.body.data.claims) {
        assert.equal(claim.verificationDetails, undefined);
        assert.equal(claim.additionalExplanation, undefined);
        assert.equal(claim.claimantEmail, undefined);
      }

      const single = await requestApp({
        method: "GET",
        url: "/api/claims/clm-demo-1",
      });
      assert.equal(single.status, 200);
      assert.equal(single.body.data.status, "claim_requested");
      assert.equal(single.body.data.verificationDetails, undefined);

      const missing = await requestApp({
        method: "GET",
        url: "/api/claims/clm-missing",
      });
      assert.equal(missing.status, 404);
    });

    it("blocks unauthorized access to admin review and status update endpoints", async () => {
      const noKeyReview = await requestApp({
        method: "GET",
        url: "/api/claims/admin/review",
      });
      assert.equal(noKeyReview.status, 401);

      const wrongKeyReview = await requestApp({
        method: "GET",
        url: "/api/claims/admin/review",
        headers: { "x-admin-key": "wrong-key" },
      });
      assert.equal(wrongKeyReview.status, 403);

      const noKeyPatch = await requestApp({
        method: "PATCH",
        url: "/api/claims/clm-demo-1/status",
        body: { status: "approved" },
      });
      assert.equal(noKeyPatch.status, 401);

      const wrongKeyPatch = await requestApp({
        method: "PATCH",
        url: "/api/claims/clm-demo-1/status",
        headers: { "x-admin-key": "wrong-key" },
        body: { status: "approved" },
      });
      assert.equal(wrongKeyPatch.status, 403);
    });

    it("POST /api/claims submits claim (never auto-approved), prevents duplicates, and updates item status", async () => {
      const invalid = await requestApp({
        method: "POST",
        url: "/api/claims",
        body: { itemType: "found", claimantName: "A" },
      });
      assert.equal(invalid.status, 400);

      const missingTarget = await requestApp({
        method: "POST",
        url: "/api/claims",
        body: {
          itemType: "found",
          itemId: "found-nonexistent",
          claimantName: "Samira Rao",
          claimantEmail: "samira.rao@university.edu",
          approximateDateLost: "2026-11-20",
          locationLost: "Main Library Quiet Study",
          verificationDetails: "Has my initials engraved on the underside.",
        },
      });
      assert.equal(missingTarget.status, 404);

      const validClaim = {
        itemType: "found",
        itemId: "found-glasses",
        claimantName: "Samira Rao",
        claimantEmail: "samira.rao@university.edu",
        approximateDateLost: "2026-11-20",
        locationLost: "Main Library Quiet Study Zone",
        verificationDetails:
          "Inside the matte black case there is a light blue microfiber cloth with gold edge.",
        additionalExplanation: "Left them on the corner table near the window.",
      };

      const created = await requestApp({
        method: "POST",
        url: "/api/claims",
        body: validClaim,
      });
      assert.equal(created.status, 201);
      assert.equal(created.body.data.status, "claim_requested");
      assert.equal(created.body.data.verificationDetails, undefined);

      // Referenced found item automatically moves from available -> claim_requested
      const itemRes = await requestApp({
        method: "GET",
        url: "/api/found-items/found-glasses",
      });
      assert.equal(itemRes.body.data.status, "claim_requested");

      // Duplicate active claim by same claimant on same item returns 409
      const duplicate = await requestApp({
        method: "POST",
        url: "/api/claims",
        body: validClaim,
      });
      assert.equal(duplicate.status, 409);
    });

    it("enforces admin review, approval, physical handover confirmation, and rejection recovery", async () => {
      // Authorized admin can view private verification details and item clues
      const adminList = await requestApp({
        method: "GET",
        url: "/api/claims/admin/review",
        headers: ADMIN_HEADERS,
      });
      assert.equal(adminList.status, 200);
      const demoClaim = adminList.body.data.claims.find(
        (c) => c.id === "clm-demo-1"
      );
      assert.ok(demoClaim.verificationDetails);
      assert.ok(demoClaim.itemSummary.privateClues);

      // Cannot jump directly to recovered before approval or without handoverConfirmed
      const jumpAttempt = await requestApp({
        method: "PATCH",
        url: "/api/claims/clm-demo-1/status",
        headers: ADMIN_HEADERS,
        body: { status: "recovered", handoverConfirmed: true },
      });
      assert.equal(jumpAttempt.status, 400);

      // Move to under_verification
      const verifying = await requestApp({
        method: "PATCH",
        url: "/api/claims/clm-demo-1/status",
        headers: ADMIN_HEADERS,
        body: { status: "under_verification" },
      });
      assert.equal(verifying.status, 200);
      assert.equal(verifying.body.data.status, "under_verification");

      // Approve claim
      const approved = await requestApp({
        method: "PATCH",
        url: "/api/claims/clm-demo-1/status",
        headers: ADMIN_HEADERS,
        body: {
          status: "approved",
          reviewerNotes: "Details match confidential item record.",
        },
      });
      assert.equal(approved.status, 200);
      assert.equal(approved.body.data.status, "approved");

      // Attempting recovered without handoverConfirmed=true fails with 400
      const noHandover = await requestApp({
        method: "PATCH",
        url: "/api/claims/clm-demo-1/status",
        headers: ADMIN_HEADERS,
        body: { status: "recovered" },
      });
      assert.equal(noHandover.status, 400);

      // Confirm physical handover -> Recovered
      const recovered = await requestApp({
        method: "PATCH",
        url: "/api/claims/clm-demo-1/status",
        headers: ADMIN_HEADERS,
        body: {
          status: "recovered",
          handoverConfirmed: true,
          reviewerNotes: "Verified student ID and completed physical handover.",
        },
      });
      assert.equal(recovered.status, 200);
      assert.equal(recovered.body.data.status, "recovered");
      assert.ok(recovered.body.data.handoverConfirmedAt);

      const itemRes = await requestApp({
        method: "GET",
        url: "/api/found-items/found-backpack",
      });
      assert.equal(itemRes.body.data.status, "recovered");

      // Test rejection reverts item back to available
      const claimForReject = await requestApp({
        method: "POST",
        url: "/api/claims",
        body: {
          itemType: "found",
          itemId: "found-watch",
          claimantName: "Test Student",
          claimantEmail: "test@university.edu",
          approximateDateLost: "2026-11-18",
          locationLost: "Student Union",
          verificationDetails: "Incorrect guess about engraving on back case.",
        },
      });
      assert.equal(claimForReject.status, 201);

      const rejected = await requestApp({
        method: "PATCH",
        url: `/api/claims/${claimForReject.body.data.id}/status`,
        headers: ADMIN_HEADERS,
        body: { status: "rejected", reviewerNotes: "Engraving did not match." },
      });
      assert.equal(rejected.status, 200);

      const watchAfterReject = await requestApp({
        method: "GET",
        url: "/api/found-items/found-watch",
      });
      assert.equal(watchAfterReject.body.data.status, "available");
    });
  });

  describe("Dashboard Stats (/api/dashboard/stats)", () => {
    it("GET /api/dashboard/stats returns accurate campus metrics", async () => {
      const res = await requestApp({
        method: "GET",
        url: "/api/dashboard/stats",
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.mode, "demo");
      assert.equal(res.body.data.totalLostItems, 8);
      assert.equal(res.body.data.totalFoundItems, 8);
      assert.equal(res.body.data.itemsReported, 16);
      assert.equal(res.body.data.itemsRecovered, 2);
      assert.equal(res.body.data.pendingClaims, 1);
      assert.ok(Array.isArray(res.body.data.categoryBreakdown));
      assert.ok(Array.isArray(res.body.data.zoneBreakdown));
    });
  });

  describe("PostgreSQL Error Handling", () => {
    it("maps PostgreSQL connection failures to 503 without leaking credentials", async () => {
      setDatabaseTestOverride({
        isDemoMode: false,
        query: async () => {
          const err = new Error("connect ECONNREFUSED neon.tech:5432");
          err.code = "ECONNREFUSED";
          throw err;
        },
      });

      const res = await requestApp({ method: "GET", url: "/api/lost-items" });
      assert.equal(res.status, 503);
      assert.equal(res.body.success, false);
      assert.equal(
        res.body.message,
        "Database service is temporarily unavailable."
      );
    });

    it("maps PostgreSQL unique constraint violation (23505) to 409 Conflict", async () => {
      setDatabaseTestOverride({
        isDemoMode: false,
        query: async () => {
          const err = new Error("duplicate key value violates unique constraint");
          err.code = "23505";
          throw err;
        },
      });

      const res = await requestApp({
        method: "POST",
        url: "/api/lost-items",
        body: {
          title: "Unique Test Item",
          category: "Personal",
          campusZone: "West Quad",
          location: "West Quad Bench",
          dateLost: "2026-11-20",
          publicDescription:
            "Testing PostgreSQL unique constraint violation handling.",
        },
      });
      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
    });
  });

  describe("End-to-End 8-Step Wallet Workflow", () => {
    it("executes full flow: report lost -> report found -> browse -> claim -> admin approve -> recover -> verify dashboard stats", async () => {
      const statsBefore = await requestApp({
        method: "GET",
        url: "/api/dashboard/stats",
      });
      assert.equal(statsBefore.status, 200);
      const initialLost = statsBefore.body.data.totalLostItems;
      const initialFound = statsBefore.body.data.totalFoundItems;
      const initialRecovered = statsBefore.body.data.itemsRecovered;

      // 1. Report a lost wallet
      const lostRes = await requestApp({
        method: "POST",
        url: "/api/lost-items",
        body: {
          title: "QA Tan Bifold Leather Wallet",
          category: "Wallets",
          campusZone: "Main Library",
          location: "Main Library 2nd Floor Reading Room",
          dateLost: "2026-11-20",
          publicDescription:
            "Slim tan leather bifold wallet misplaced while studying near the north windows.",
          privateIdentifyingDetails: "Embossed initials 'K.M.' inside the billfold.",
        },
      });
      assert.equal(lostRes.status, 201);
      const lostId = lostRes.body.data.id;

      // 2. Report the same wallet as found
      const foundRes = await requestApp({
        method: "POST",
        url: "/api/found-items",
        body: {
          title: "QA Tan Bifold Leather Wallet",
          category: "Wallets",
          campusZone: "Main Library",
          location: "Main Library 2nd Floor Reading Room",
          dateFound: "2026-11-20",
          publicDescription:
            "Tan leather bifold wallet found on a reading room desk near the north windows.",
          privateVerificationDetails: "Embossed initials 'K.M.' inside billfold.",
          additionalNotes: "Turned in to Main Library Circulation Desk.",
        },
      });
      assert.equal(foundRes.status, 201);
      const foundId = foundRes.body.data.id;
      assert.equal(foundRes.body.data.privateVerificationDetails, undefined);

      // 3. Browse found items and locate the wallet
      const browseRes = await requestApp({
        method: "GET",
        url: "/api/found-items?search=QA%20Tan%20Bifold&category=Wallets",
      });
      assert.equal(browseRes.status, 200);
      assert.ok(browseRes.body.data.items.some((item) => item.id === foundId));

      // 4. Submit an ownership claim
      const claimRes = await requestApp({
        method: "POST",
        url: "/api/claims",
        body: {
          itemType: "found",
          itemId: foundId,
          claimantName: "Kiran Mehta",
          claimantEmail: "kiran.mehta@university.edu",
          approximateDateLost: "2026-11-20",
          locationLost: "Main Library 2nd Floor",
          verificationDetails: "Embossed initials 'K.M.' inside the billfold.",
        },
      });
      assert.equal(claimRes.status, 201);
      assert.equal(claimRes.body.data.status, "claim_requested");
      const claimId = claimRes.body.data.id;

      // 5. Access demo-admin mode and review private details
      const adminReview = await requestApp({
        method: "GET",
        url: "/api/claims/admin/review",
        headers: ADMIN_HEADERS,
      });
      assert.equal(adminReview.status, 200);
      const reviewEntry = adminReview.body.data.claims.find((c) => c.id === claimId);
      assert.ok(reviewEntry);
      assert.match(reviewEntry.verificationDetails, /K\.M\./);
      assert.match(reviewEntry.itemSummary.privateClues, /K\.M\./);

      // 6. Approve the claim
      const approveRes = await requestApp({
        method: "PATCH",
        url: `/api/claims/${claimId}/status`,
        headers: ADMIN_HEADERS,
        body: { status: "approved", reviewerNotes: "Initials match confidential clue." },
      });
      assert.equal(approveRes.status, 200);
      assert.equal(approveRes.body.data.status, "approved");

      // 7. Confirm physical handover and mark item Recovered
      const recoverRes = await requestApp({
        method: "PATCH",
        url: `/api/claims/${claimId}/status`,
        headers: ADMIN_HEADERS,
        body: {
          status: "recovered",
          handoverConfirmed: true,
          reviewerNotes: "Verified student ID and completed handover.",
        },
      });
      assert.equal(recoverRes.status, 200);
      assert.equal(recoverRes.body.data.status, "recovered");

      // Verify item details reflect Recovered
      const detailRes = await requestApp({
        method: "GET",
        url: `/api/found-items/${foundId}`,
      });
      assert.equal(detailRes.status, 200);
      assert.equal(detailRes.body.data.status, "recovered");

      // 8. Verify dashboard statistics updated accurately
      const statsAfter = await requestApp({
        method: "GET",
        url: "/api/dashboard/stats",
      });
      assert.equal(statsAfter.status, 200);
      assert.equal(statsAfter.body.data.totalLostItems, initialLost + 1);
      assert.equal(statsAfter.body.data.totalFoundItems, initialFound + 1);
      assert.equal(statsAfter.body.data.itemsRecovered, initialRecovered + 1);
      assert.ok(lostId);
    });
  });

  describe("Potential Lost/Found Matching (/api/matches)", () => {
    it("matches lost AirPods with found Wireless Earbuds without exposing private clues", async () => {
      const res = await requestApp({
        method: "GET",
        url: "/api/matches/lost/lost-airpods",
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.total >= 1);
      const top = res.body.data.matches[0];
      assert.equal(top.item.id, "found-earbuds");
      assert.ok(top.matchScore >= 70);
      assert.ok(Array.isArray(top.matchReasons) && top.matchReasons.length > 0);
      assert.equal(top.item.privateVerificationDetails, undefined);
    });

    it("returns 400 on invalid itemType and 404 on missing item", async () => {
      const badType = await requestApp({
        method: "GET",
        url: "/api/matches/invalid/lost-airpods",
      });
      assert.equal(badType.status, 400);

      const missing = await requestApp({
        method: "GET",
        url: "/api/matches/lost/does-not-exist",
      });
      assert.equal(missing.status, 404);
    });
  });
});
