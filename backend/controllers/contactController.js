import db from '../config/database.js';

export function submitContact(req, res) {
  try {
    const { name, phone, email, message, botCheck } = req.body;

    if (botCheck) {
      return res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully.'
      });
    }

    const cName = (name || '').trim();
    const cPhone = (phone || '').replace(/[^0-9+]/g, '').trim();
    const cEmail = (email || '').trim().toLowerCase();
    const cMessage = (message || '').trim();

    if (!cName) {
      return res.status(400).json({ success: false, message: 'Please provide your name.' });
    }
    if (!cPhone || cPhone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number.' });
    }
    if (!cMessage || cMessage.length < 5) {
      return res.status(400).json({ success: false, message: 'Please enter a message of at least 5 characters.' });
    }

    const insert = db.prepare(`
      INSERT INTO CONTACT_MESSAGES (name, phone, email, message, status)
      VALUES (?, ?, ?, ?, 'unread')
    `);

    const result = insert.run(cName, cPhone, cEmail || null, cMessage);

    return res.status(201).json({
      success: true,
      messageId: Number(result.lastInsertRowid),
      message: 'Thank you for reaching out to Shashank Tours & Travels. Our travel coordinator will contact you shortly.'
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error sending your message. Please reach us via phone or WhatsApp directly.'
    });
  }
}

export function getAllContactMessages(req, res) {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM CONTACT_MESSAGES';
    const params = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY createdAt DESC';

    const messages = db.prepare(query).all(...params);

    const counts = {
      unread: db.prepare("SELECT COUNT(*) as count FROM CONTACT_MESSAGES WHERE status = 'unread'").get().count,
      read: db.prepare("SELECT COUNT(*) as count FROM CONTACT_MESSAGES WHERE status = 'read'").get().count,
      resolved: db.prepare("SELECT COUNT(*) as count FROM CONTACT_MESSAGES WHERE status = 'resolved'").get().count,
      total: db.prepare("SELECT COUNT(*) as count FROM CONTACT_MESSAGES").get().count
    };

    return res.json({
      success: true,
      counts,
      messages
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve messages.' });
  }
}

export function updateContactStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['unread', 'read', 'resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be unread, read, or resolved.' });
    }

    const message = db.prepare('SELECT * FROM CONTACT_MESSAGES WHERE id = ?').get(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    db.prepare('UPDATE CONTACT_MESSAGES SET status = ? WHERE id = ?').run(status, id);

    return res.json({
      success: true,
      message: `Message status updated to ${status}.`
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update message status.' });
  }
}
