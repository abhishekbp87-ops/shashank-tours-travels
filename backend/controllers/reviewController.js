import db from '../config/database.js';

export function createReview(req, res) {
  try {
    const {
      customerName,
      name,
      rating,
      reviewText,
      review,
      tripType,
      service,
      destination,
      vehicle,
      email,
      botCheck
    } = req.body;

    // Honeypot anti-spam check
    if (botCheck) {
      return res.status(200).json({
        success: true,
        message: 'Thank you for your feedback. Your review has been submitted successfully.'
      });
    }

    const cName = (customerName || name || '').trim();
    const cRating = parseInt(rating, 10);
    const cText = (reviewText || review || '').trim();
    const cService = (service || tripType || destination || vehicle || '').trim();
    const cEmail = (email || '').trim();

    if (!cName || cName.length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter your name (at least 2 characters).' });
    }
    if (cName.length > 100) {
      return res.status(400).json({ success: false, message: 'Name must not exceed 100 characters.' });
    }
    if (isNaN(cRating) || cRating < 1 || cRating > 5) {
      return res.status(400).json({ success: false, message: 'Please choose a rating between 1 and 5 stars.' });
    }
    if (!cText || cText.length < 10) {
      return res.status(400).json({ success: false, message: 'Please write a review of at least 10 characters describing your experience.' });
    }
    if (cText.length > 1500) {
      return res.status(400).json({ success: false, message: 'Review text must not exceed 1500 characters.' });
    }
    if (cEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cEmail) || cEmail.length > 150) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      }
    }

    const insert = db.prepare(`
      INSERT INTO REVIEWS (customerName, rating, reviewText, tripType, service, email, status, source)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', 'website')
    `);

    const result = insert.run(
      cName,
      cRating,
      cText,
      cService || null,
      cService || null,
      cEmail || null
    );

    return res.status(201).json({
      success: true,
      reviewId: Number(result.lastInsertRowid),
      message: 'Thank you for your feedback! Your review has been submitted for moderation and will appear on the website once approved by our team.'
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error saving your review. Please try again.'
    });
  }
}

export function getApprovedReviews(req, res) {
  try {
    // Note: 'email' is explicitly excluded to protect customer privacy
    const reviews = db.prepare(`
      SELECT id, customerName, rating, reviewText, tripType, service, source, createdAt
      FROM REVIEWS
      WHERE status = 'approved'
      ORDER BY createdAt DESC
    `).all();

    return res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reviews.' });
  }
}

export function getAllReviews(req, res) {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM REVIEWS';
    const params = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY createdAt DESC';

    const reviews = db.prepare(query).all(...params);

    const counts = {
      pending: db.prepare("SELECT COUNT(*) as count FROM REVIEWS WHERE status = 'pending'").get().count,
      approved: db.prepare("SELECT COUNT(*) as count FROM REVIEWS WHERE status = 'approved'").get().count,
      rejected: db.prepare("SELECT COUNT(*) as count FROM REVIEWS WHERE status = 'rejected'").get().count,
      total: db.prepare("SELECT COUNT(*) as count FROM REVIEWS").get().count
    };

    return res.json({
      success: true,
      counts,
      reviews
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve reviews.' });
  }
}

export function updateReviewStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be pending, approved, or rejected.' });
    }

    const review = db.prepare('SELECT * FROM REVIEWS WHERE id = ?').get(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const approvedAt = status === 'approved' ? new Date().toISOString() : null;

    db.prepare(`
      UPDATE REVIEWS
      SET status = ?, approvedAt = COALESCE(?, approvedAt)
      WHERE id = ?
    `).run(status, approvedAt, id);

    const updated = db.prepare('SELECT * FROM REVIEWS WHERE id = ?').get(id);

    return res.json({
      success: true,
      message: `Review ${status === 'approved' ? 'approved and published to website' : 'marked as ' + status}.`,
      review: updated
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update review status.' });
  }
}

export function deleteReview(req, res) {
  try {
    const { id } = req.params;

    const review = db.prepare('SELECT * FROM REVIEWS WHERE id = ?').get(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    db.prepare('DELETE FROM REVIEWS WHERE id = ?').run(id);

    return res.json({
      success: true,
      message: 'Review deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
}
