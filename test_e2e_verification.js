import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { onRequest as cloudflareProxyHandler } from './functions/api/[[catchall]].js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_URL = 'http://127.0.0.1:5000/api';
const dbPath = path.resolve(__dirname, 'backend/data/shashank_travels.db');
const db = new DatabaseSync(dbPath);

const results = [];
function record(name, passed, details) {
  results.push({ name, passed, details });
  console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name} - ${details}`);
}

async function run() {
  console.log('====================================================');
  console.log('   STARTING COMPREHENSIVE E2E VERIFICATION SUITE');
  console.log('====================================================');

  const testSuffix = 'TEST_' + Date.now();
  let adminToken = '';
  let createdReviewId = null;
  let createdContactId = null;

  try {
    // Test 1: Health endpoint
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    if (healthRes.status === 200 && healthData.status === 'ok') {
      record('Test 1: Health Endpoint', true, `API service healthy (uptime: ${healthData.uptime}s)`);
    } else {
      record('Test 1: Health Endpoint', false, `Status: ${healthRes.status}`);
    }

    // Test 2: Admin Authentication (Valid Credentials)
    const loginRes = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.ADMIN_USER || 'admin',
        password: process.env.ADMIN_PASSWORD
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.token) {
      adminToken = loginData.token;
      record('Test 2: Admin Authentication (Valid)', true, 'Successfully logged in and acquired JWT');
    } else {
      record('Test 2: Admin Authentication (Valid)', false, `Status ${loginRes.status}: ${JSON.stringify(loginData)}`);
      return;
    }

    // Test 3: Admin Authentication (Invalid Credentials Rejected)
    const badLoginRes = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.ADMIN_USER || 'admin',
        password: 'IncorrectPassword999!'
      })
    });
    if (badLoginRes.status === 401) {
      record('Test 3: Admin Authentication (Invalid Rejected)', true, 'Rejected invalid credentials with HTTP 401');
    } else {
      record('Test 3: Admin Authentication (Invalid Rejected)', false, `Expected 401, got ${badLoginRes.status}`);
    }

    // Test 4: Valid Review Submission
    const reviewPayload = {
      customerName: `Verifier Client ${testSuffix}`,
      rating: 5,
      service: 'Bangalore to Mysore Outstation',
      reviewText: 'Excellent verification trip with prompt response and professional driver.',
      verifiedTrip: true
    };
    const revRes = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewPayload)
    });
    const revData = await revRes.json();
    createdReviewId = revData.id || revData.reviewId || revData.data?.id;
    if (revRes.status === 201 && revData.success && createdReviewId) {
      record('Test 4: Valid Review Submission', true, `Created pending review ID ${createdReviewId}`);
    } else {
      record('Test 4: Valid Review Submission', false, `Status ${revRes.status}: ${JSON.stringify(revData)}`);
    }

    // Test 5: Invalid Review Submission (rating > 5)
    const invalidReviewRes = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: 'Bad Rating', rating: 9, reviewText: 'Invalid rating test text' })
    });
    const invalidRevData = await invalidReviewRes.json();
    if (invalidReviewRes.status === 400 && !invalidRevData.success) {
      record('Test 5: Invalid Review Submission Rejected', true, `Correctly returned 400: ${invalidRevData.message || invalidRevData.error}`);
    } else {
      record('Test 5: Invalid Review Submission Rejected', false, `Expected 400, got ${invalidReviewRes.status}`);
    }

    // Test 6: Missing Required Fields in Review
    const missingFieldReviewRes = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: 5, reviewText: 'Short' })
    });
    const missingFieldData = await missingFieldReviewRes.json();
    if (missingFieldReviewRes.status === 400) {
      record('Test 6: Missing Required Fields in Review Rejected', true, `Returned HTTP 400: ${missingFieldData.message}`);
    } else {
      record('Test 6: Missing Required Fields in Review Rejected', false, `Expected 400, got ${missingFieldReviewRes.status}`);
    }

    // Test 7: Review Honeypot Bot Rejection
    const honeypotRes = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Spam Bot',
        rating: 5,
        reviewText: 'Spam content that is long enough to trigger check',
        botCheck: 'automated-bot-payload'
      })
    });
    const honeypotData = await honeypotRes.json();
    if (honeypotRes.status === 400 && !honeypotData.success) {
      record('Test 7: Review Honeypot Rejection Returns HTTP 400', true, `Returned status 400 Bad Request: ${honeypotData.message}`);
    } else {
      record('Test 7: Review Honeypot Rejection Returns HTTP 400', false, `Expected 400, received ${honeypotRes.status}`);
    }

    // Test 8: Review Appears in Admin All
    const adminAllRes = await fetch(`${API_URL}/reviews/all`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminAllData = await adminAllRes.json();
    const reviewsList = adminAllData.reviews || adminAllData.data || [];
    const foundInAll = reviewsList.some(r => r.id === createdReviewId);
    if (adminAllRes.status === 200 && foundInAll) {
      record('Test 8: Review Appears in Admin All', true, `Found review ID ${createdReviewId} in admin list (total: ${reviewsList.length})`);
    } else {
      record('Test 8: Review Appears in Admin All', false, `Review ID ${createdReviewId} not found in admin list`);
    }

    // Test 9: Review Appears under Pending & counts are present
    const adminPendingRes = await fetch(`${API_URL}/reviews/all?status=pending`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminPendingData = await adminPendingRes.json();
    const pendingList = adminPendingData.reviews || adminPendingData.data || [];
    const foundInPending = pendingList.some(r => r.id === createdReviewId);
    if (adminPendingRes.status === 200 && foundInPending && adminPendingData.counts?.pending >= 1) {
      record('Test 9: Review Appears Under Pending Filter', true, `Pending filter returned ID ${createdReviewId}, pending count: ${adminPendingData.counts.pending}`);
    } else {
      record('Test 9: Review Appears Under Pending Filter', false, `Pending filter check failed: ${JSON.stringify(adminPendingData.counts)}`);
    }

    // Test 10: Review Approval makes it publicly visible
    const approveRes = await fetch(`${API_URL}/reviews/${createdReviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    const approveData = await approveRes.json();
    const publicRevRes = await fetch(`${API_URL}/reviews`);
    const publicRevData = await publicRevRes.json();
    const publicList = publicRevData.reviews || publicRevData.data || [];
    const foundInPublic = publicList.some(r => r.id === createdReviewId);
    if (approveRes.status === 200 && approveData.success && foundInPublic) {
      record('Test 10: Approval Makes Review Publicly Visible', true, `Approved review ${createdReviewId} visible in GET /api/reviews`);
    } else {
      record('Test 10: Approval Makes Review Publicly Visible', false, `Public check failed.`);
    }

    // Test 11: Rejected Review is hidden from public
    const rejectRes = await fetch(`${API_URL}/reviews/${createdReviewId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'rejected' })
    });
    const rejectData = await rejectRes.json();
    const publicRevResAfterReject = await fetch(`${API_URL}/reviews`);
    const publicRevDataAfterReject = await publicRevResAfterReject.json();
    const publicListAfterReject = publicRevDataAfterReject.reviews || publicRevDataAfterReject.data || [];
    const foundInPublicAfterReject = publicListAfterReject.some(r => r.id === createdReviewId);
    if (rejectRes.status === 200 && rejectData.success && !foundInPublicAfterReject) {
      record('Test 11: Rejected Review Remains Hidden Publicly', true, `Rejected review ${createdReviewId} hidden from public reviews`);
    } else {
      record('Test 11: Rejected Review Remains Hidden Publicly', false, `Rejected review was still visible publicly`);
    }

    // Test 12: Valid Contact Inquiry Submission
    const contactPayload = {
      name: `Tester Inquiry ${testSuffix}`,
      email: 'tester@example.com',
      phone: '+91 98765 43210',
      message: 'Testing contact inquiry submission and admin portal integration.'
    };
    const contactRes = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactPayload)
    });
    const contactData = await contactRes.json();
    createdContactId = contactData.id || contactData.messageId || contactData.data?.id;
    if (contactRes.status === 201 && contactData.success && createdContactId) {
      record('Test 12: Valid Inquiry Submission', true, `Created contact inquiry ID ${createdContactId}`);
    } else {
      record('Test 12: Valid Inquiry Submission', false, `Status ${contactRes.status}: ${JSON.stringify(contactData)}`);
    }

    // Test 13: Invalid Contact Inquiry (Missing phone)
    const badContactRes = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester', message: 'Missing phone inquiry' })
    });
    if (badContactRes.status === 400) {
      record('Test 13: Missing Phone Inquiry Rejected', true, 'Returned HTTP 400 for missing phone number');
    } else {
      record('Test 13: Missing Phone Inquiry Rejected', false, `Expected 400, got ${badContactRes.status}`);
    }

    // Test 14: Contact Honeypot Rejection
    const botContactRes = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Spam Contact',
        phone: '+91 98765 43210',
        message: 'Spam message test',
        botCheck: 'automated-spambot'
      })
    });
    if (botContactRes.status === 400) {
      record('Test 14: Contact Honeypot Rejection Returns HTTP 400', true, 'Rejected bot contact with HTTP 400');
    } else {
      record('Test 14: Contact Honeypot Rejection Returns HTTP 400', false, `Expected 400, got ${botContactRes.status}`);
    }

    // Test 15: Inquiry appears in Admin contact listing
    const adminContactRes = await fetch(`${API_URL}/contact`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminContactData = await adminContactRes.json();
    const messagesList = adminContactData.messages || adminContactData.data || [];
    const foundInContacts = messagesList.some(c => c.id === createdContactId);
    if (adminContactRes.status === 200 && foundInContacts) {
      record('Test 15: Inquiry Appears in Admin Panel', true, `Found contact ID ${createdContactId} in admin inquiries (total: ${messagesList.length})`);
    } else {
      record('Test 15: Inquiry Appears in Admin Panel', false, `Contact ID ${createdContactId} not found in admin inquiries`);
    }

    // Test 16: Contact status update in Admin
    const updateContactRes = await fetch(`${API_URL}/contact/${createdContactId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'resolved' })
    });
    const updateContactData = await updateContactRes.json();
    if (updateContactRes.status === 200 && updateContactData.success) {
      record('Test 16: Admin Contact Status Update', true, `Updated contact ${createdContactId} status to resolved`);
    } else {
      record('Test 16: Admin Contact Status Update', false, `Failed to update status: ${JSON.stringify(updateContactData)}`);
    }

    // Test 17: Unauthorized Admin requests are rejected
    const unauthRes = await fetch(`${API_URL}/reviews/all`, {
      headers: { 'Authorization': 'Bearer invalid-token-xyz' }
    });
    if (unauthRes.status === 401 || unauthRes.status === 403) {
      record('Test 17: Unauthorized Admin Requests Rejected', true, `Rejected with HTTP ${unauthRes.status}`);
    } else {
      record('Test 17: Unauthorized Admin Requests Rejected', false, `Expected 401/403, got ${unauthRes.status}`);
    }

    // Test 18: CORS preflight from legitimate production frontend
    const corsPreflightRes = await fetch(`${API_URL}/reviews`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://shashanktravels.pages.dev',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    const allowOrigin = corsPreflightRes.headers.get('access-control-allow-origin');
    if (corsPreflightRes.status === 204 && allowOrigin === 'https://shashanktravels.pages.dev') {
      record('Test 18: CORS Preflight for Production Frontend', true, `Status 204 with Access-Control-Allow-Origin: ${allowOrigin}`);
    } else {
      record('Test 18: CORS Preflight for Production Frontend', false, `Status ${corsPreflightRes.status}, Allow-Origin: ${allowOrigin}`);
    }

    // Test 19: Cloudflare Pages Function Proxy Simulation
    const proxyContext = {
      request: new Request('https://shashanktravels.pages.dev/api/health', {
        method: 'GET',
        headers: { 'Host': 'shashanktravels.pages.dev' }
      }),
      env: { BACKEND_API_URL: 'http://127.0.0.1:5000' }
    };
    const proxyResponse = await cloudflareProxyHandler(proxyContext);
    const proxyData = await proxyResponse.json();
    if (proxyResponse.status === 200 && proxyData.status === 'ok') {
      record('Test 19: Cloudflare Pages Proxy Function Simulation', true, 'Successfully forwarded /api/health through Pages proxy to backend');
    } else {
      record('Test 19: Cloudflare Pages Proxy Function Simulation', false, `Status ${proxyResponse.status}: ${JSON.stringify(proxyData)}`);
    }

    // Test 20: Cloudflare Pages Proxy Loop Prevention
    const loopContext = {
      request: new Request('https://shashanktravels.pages.dev/api/health', {
        method: 'GET'
      }),
      env: { BACKEND_API_URL: 'https://shashanktravels.pages.dev' }
    };
    const loopResponse = await cloudflareProxyHandler(loopContext);
    if (loopResponse.status === 508) {
      record('Test 20: Cloudflare Pages Proxy Loop Detection', true, 'Correctly detected self-referential backend URL and prevented infinite loop with HTTP 508');
    } else {
      record('Test 20: Cloudflare Pages Proxy Loop Detection', false, `Expected 508, got ${loopResponse.status}`);
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    // Test 21: Data cleanup and persistence verification
    console.log('\n--- Cleaning up test records ---');
    try {
      if (createdReviewId) {
        db.prepare('DELETE FROM REVIEWS WHERE id = ?').run(createdReviewId);
        console.log(`Deleted test review ID ${createdReviewId}`);
      }
      if (createdContactId) {
        db.prepare('DELETE FROM CONTACT_MESSAGES WHERE id = ?').run(createdContactId);
        console.log(`Deleted test contact inquiry ID ${createdContactId}`);
      }
      // Verify clean state
      const checkRev = db.prepare('SELECT count(*) as cnt FROM REVIEWS WHERE customerName LIKE ?').get(`%${testSuffix}%`);
      const checkCon = db.prepare('SELECT count(*) as cnt FROM CONTACT_MESSAGES WHERE name LIKE ?').get(`%${testSuffix}%`);
      if (checkRev.cnt === 0 && checkCon.cnt === 0) {
        record('Test 21: Test Data Cleaned & SQLite Intact', true, 'All test records cleanly deleted; 0 test records left in SQLite.');
      } else {
        record('Test 21: Test Data Cleaned & SQLite Intact', false, 'Lingering test records detected.');
      }
    } catch (cleanErr) {
      console.error('Error during cleanup:', cleanErr);
      record('Test 21: Test Data Cleaned & SQLite Intact', false, cleanErr.message);
    }
  }

  console.log('\n====================================================');
  console.log('                 SUMMARY OF RESULTS');
  console.log('====================================================');
  const allPassed = results.every(r => r.passed);
  console.log(`Total Tests: ${results.length} | Passed: ${results.filter(r => r.passed).length} | Failed: ${results.filter(r => !r.passed).length}`);
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
  } else {
    console.log('⚠️ SOME TESTS FAILED. Inspect details above.');
  }
}

run();
