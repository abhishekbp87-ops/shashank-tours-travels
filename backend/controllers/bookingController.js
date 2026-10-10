import db from '../config/database.js';

export function createBooking(req, res) {
  try {
    const {
      name,
      customerName,
      phone,
      customerPhone,
      email,
      customerEmail,
      pickup,
      drop,
      dropLocation,
      travelDate,
      travelTime,
      tripType,
      passengers,
      vehicle,
      tour,
      message,
      notes,
      estimatedFare,
      botCheck // Honeypot field
    } = req.body;

    // 1. Bot spam protection check
    if (botCheck) {
      console.warn('⚠️ [ANTI-SPAM]: Booking submission rejected by honeypot trigger.');
      return res.status(400).json({
        success: false,
        message: 'Automated spam validation check failed. Please refresh and try again.'
      });
    }

    const cName = (name || customerName || '').trim();
    const cPhone = (phone || customerPhone || '').replace(/[^0-9+]/g, '').trim();
    const cEmail = (email || customerEmail || '').trim().toLowerCase();
    const cPickup = (pickup || '').trim();
    const cDrop = (drop || dropLocation || '').trim();
    const cDate = (travelDate || '').trim();
    const cTime = (travelTime || '').trim();
    const cType = (tripType || 'One Way').trim();
    const cPass = parseInt(passengers, 10) || 1;
    const cVeh = (vehicle || '').trim();
    const cTour = (tour || '').trim();
    const cMsg = (message || notes || '').trim();
    const cFare = (estimatedFare || '').trim();

    // 2. Validation
    if (!cName) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' });
    }
    if (!cPhone || cPhone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
    }
    if (!cPickup) {
      return res.status(400).json({ success: false, message: 'Please enter a pickup location.' });
    }
    if (!cDrop) {
      return res.status(400).json({ success: false, message: 'Please enter a destination / drop location.' });
    }
    if (!cDate) {
      return res.status(400).json({ success: false, message: 'Please select a travel date.' });
    }

    // 3. Upsert Customer Record
    try {
      db.prepare(`
        INSERT INTO CUSTOMERS (name, phone, email, updatedAt)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(phone) DO UPDATE SET
          name = excluded.name,
          email = COALESCE(excluded.email, CUSTOMERS.email),
          updatedAt = CURRENT_TIMESTAMP
      `).run(cName, cPhone, cEmail || null);
    } catch (e) {
      console.warn('Customer upsert note:', e.message);
    }

    // 4. Insert Booking
    const insertBooking = db.prepare(`
      INSERT INTO BOOKINGS (
        customerName, phone, email, pickup, dropLocation, travelDate, travelTime,
        tripType, passengers, vehicle, tour, message, estimatedFare, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
    `);

    const result = insertBooking.run(
      cName,
      cPhone,
      cEmail || null,
      cPickup,
      cDrop,
      cDate,
      cTime || null,
      cType,
      cPass,
      cVeh || null,
      cTour || null,
      cMsg || null,
      cFare || null
    );

    const bookingId = Number(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      bookingId,
      message: 'Booking enquiry submitted successfully. Our team will contact you shortly to confirm chauffeur allocation.'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing your booking request. Please call or WhatsApp us directly.'
    });
  }
}

export function getAllBookings(req, res) {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM BOOKINGS WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (customerName LIKE ? OR phone LIKE ? OR pickup LIKE ? OR dropLocation LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const bookings = db.prepare(query).all(...params);

    const countQuery = 'SELECT COUNT(*) as total FROM BOOKINGS' + (status && status !== 'all' ? ' WHERE status = ?' : '');
    const countParams = status && status !== 'all' ? [status] : [];
    const totalRow = db.prepare(countQuery).get(...countParams);

    return res.json({
      success: true,
      total: totalRow ? totalRow.total : bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve bookings.' });
  }
}

export function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const booking = db.prepare('SELECT * FROM BOOKINGS WHERE id = ?').get(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    return res.json({ success: true, booking });
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve booking.' });
  }
}

export function updateBooking(req, res) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const existing = db.prepare('SELECT * FROM BOOKINGS WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const validStatuses = ['new', 'contacted', 'confirmed', 'completed', 'cancelled'];
    const newStatus = status && validStatuses.includes(status) ? status : existing.status;
    const notes = adminNotes !== undefined ? adminNotes : existing.adminNotes;

    db.prepare(`
      UPDATE BOOKINGS
      SET status = ?, adminNotes = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, notes, id);

    const updated = db.prepare('SELECT * FROM BOOKINGS WHERE id = ?').get(id);

    return res.json({
      success: true,
      message: 'Booking status updated successfully.',
      booking: updated
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
}
