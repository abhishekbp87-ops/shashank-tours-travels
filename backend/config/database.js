import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'shashank_travels.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency & integrity
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
} catch (e) {
  console.warn('SQLite PRAGMA warning:', e.message);
}

// 1. Initialize Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS CUSTOMERS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS BOOKINGS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      pickup TEXT NOT NULL,
      dropLocation TEXT NOT NULL,
      travelDate TEXT NOT NULL,
      travelTime TEXT,
      tripType TEXT NOT NULL,
      passengers INTEGER DEFAULT 1,
      vehicle TEXT,
      tour TEXT,
      message TEXT,
      estimatedFare TEXT,
      status TEXT DEFAULT 'new', -- 'new', 'contacted', 'confirmed', 'completed', 'cancelled'
      adminNotes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS REVIEWS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      reviewText TEXT NOT NULL,
      tripType TEXT,
      service TEXT,
      destination TEXT,
      vehicle TEXT,
      email TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
      source TEXT DEFAULT 'website', -- 'website', 'google', 'manual', 'admin'
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      approvedAt DATETIME
    );

    CREATE TABLE IF NOT EXISTS CONTACT_MESSAGES (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread', -- 'unread', 'read', 'resolved'
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS TOURS (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      destination TEXT NOT NULL,
      duration TEXT NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      highlights TEXT, -- JSON array
      inclusions TEXT, -- JSON array
      exclusions TEXT, -- JSON array
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS VEHICLES (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      model TEXT,
      seatingCapacity TEXT NOT NULL,
      luggageCapacity TEXT NOT NULL,
      features TEXT, -- JSON array
      image TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ADMIN_USERS (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe migrations for REVIEWS table
  try { db.exec('ALTER TABLE REVIEWS ADD COLUMN email TEXT;'); } catch {}
  try { db.exec('ALTER TABLE REVIEWS ADD COLUMN service TEXT;'); } catch {}

  // 2. Ensure Default Admin User
  const adminCheck = db.prepare('SELECT id FROM ADMIN_USERS WHERE username = ?').get('admin');
  if (!adminCheck) {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'Shashank@2026';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(defaultPassword, salt);
    db.prepare(`
      INSERT INTO ADMIN_USERS (username, passwordHash, name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', hash, 'Shashank Administrator', 'admin');
    console.log('✓ Default Admin User created: "admin"');
  }

  // 3. Seed initial tours if empty
  const tourCount = db.prepare('SELECT COUNT(*) as count FROM TOURS').get();
  if (tourCount && tourCount.count === 0) {
    const initialTours = [
      {
        id: 'coorg-tour',
        title: 'Coorg Hill Station Tour',
        destination: 'Coorg (Kodagu)',
        duration: '3 Days / 2 Nights',
        description: 'Explore misty coffee hills, Abbey & Iruppu Falls, Raja Seat sunsets, and peaceful Golden Temple Tibetan Monastery in Bylakuppe.',
        image: 'images/dest-coorg.jpg',
        highlights: JSON.stringify(['Abbey & Iruppu Waterfalls', 'Dubare Elephant Camp', 'Namdroling Tibetan Monastery', 'Coffee Plantation Walks']),
        inclusions: JSON.stringify(['AC Cab with Chauffeur', 'Fuel, Toll & Driver Allowance', 'Interstate Road Permits', 'Customized Stops']),
        exclusions: JSON.stringify(['Hotel Stay', 'Entry Tickets', 'Meals']),
        status: 'active'
      },
      {
        id: 'ooty-tour',
        title: 'Ooty & Coonoor Tour',
        destination: 'Ooty & Coonoor',
        duration: '3 Days / 2 Nights',
        description: 'Breathtaking Nilgiri mountain drive via Bandipur tiger reserve, visiting Botanical Gardens, Ooty Lake, and Sim Park Coonoor.',
        image: 'images/dest-ooty.jpg',
        highlights: JSON.stringify(['Nilgiri Scenic Viewpoints', 'Tea Factory & Heritage Museum', 'Doddabetta Highest Peak', 'Pykara Lake Boating']),
        inclusions: JSON.stringify(['Sedan / SUV Cab', 'Bandipur Ghat Road Drive', 'All Chauffeur Charges', 'Photo & Meal Flexibility']),
        exclusions: JSON.stringify(['Hotel Stay', 'Toy Train Tickets', 'Boating Fees']),
        status: 'active'
      },
      {
        id: 'mysore-tour',
        title: 'Mysore Heritage Tour',
        destination: 'Mysore',
        duration: '2 Days / 1 Night',
        description: 'Royal Mysore Palace illumination, Chamundi Hill temple darshan, Brindavan musical fountains, and Srirangapatna historical sites.',
        image: 'images/dest-mysore.jpg',
        highlights: JSON.stringify(['Mysore Amba Vilas Palace', 'Chamundeshwari Temple', 'Brindavan Musical Fountains', 'St. Philomena Cathedral']),
        inclusions: JSON.stringify(['Bangalore-Mysore Expressway Travel', 'Sightseeing Coordination', 'Chauffeur Allowance', 'Parking & Tolls']),
        exclusions: JSON.stringify(['Entry Tickets', 'Palace Audio Guide', 'Food']),
        status: 'active'
      },
      {
        id: 'chikmagalur-tour',
        title: 'Chikmagalur Peaks Tour',
        destination: 'Chikmagalur',
        duration: '3 Days / 2 Nights',
        description: 'Mullayanagiri peak trek, Baba Budangiri cloud vistas, coffee estate homestay visits, and Hebbe & Jhari waterfall adventures.',
        image: 'images/dest-chikmagalur.jpg',
        highlights: JSON.stringify(['Mullayanagiri Highest Peak', 'Baba Budangiri Shrine', 'Jhari Buttermilk Falls', 'Coffee Roasting Tour']),
        inclusions: JSON.stringify(['Comfortable Hill-Drive Cab', 'Experienced Highway Driver', 'Toll & Fuel Included', 'Custom Itinerary']),
        exclusions: JSON.stringify(['Jeep Safari Off-road Tickets', 'Hotel Stay', 'Personal Expenses']),
        status: 'active'
      }
    ];

    const insertTour = db.prepare(`
      INSERT INTO TOURS (id, title, destination, duration, description, image, highlights, inclusions, exclusions, status)
      VALUES (@id, @title, @destination, @duration, @description, @image, @highlights, @inclusions, @exclusions, @status)
    `);

    for (const t of initialTours) {
      insertTour.run(t);
    }
    console.log(`✓ Seeded ${initialTours.length} initial tours into database.`);
  }

  // 4. Seed initial vehicles if empty
  const vehicleCount = db.prepare('SELECT COUNT(*) as count FROM VEHICLES').get();
  if (vehicleCount && vehicleCount.count === 0) {
    const initialVehicles = [
      {
        id: 'toyota-rumion',
        name: 'Toyota Rumion',
        category: 'SUV / MUV',
        model: 'Signature Tour Fleet',
        seatingCapacity: '6–7 Seats',
        luggageCapacity: '3–4 Large Bags',
        features: JSON.stringify(['Dual Automatic Air Conditioning', 'Reclining Captain Comfort Seats', 'Roof Luggage Carrier', 'Mobile Fast Charging']),
        image: 'images/client-vehicle.jpg',
        status: 'active'
      },
      {
        id: 'prime-sedan',
        name: 'Prime Sedan (Dzire / Etios)',
        category: 'Sedan',
        model: 'City & Outstation',
        seatingCapacity: '4 Seats',
        luggageCapacity: '2 Large Bags',
        features: JSON.stringify(['Chilled Air Conditioning', 'Spacious Legroom & Clean Boot', 'Smooth Highway Ride', 'Music & USB Charging']),
        image: 'images/fleet-sedan.jpg',
        status: 'active'
      },
      {
        id: 'luxury-suv',
        name: 'Ertiga / Carens Premium',
        category: 'SUV',
        model: 'Family Travel',
        seatingCapacity: '6 Seats',
        luggageCapacity: '3 Bags',
        features: JSON.stringify(['Dual Zone Climate AC', 'Comfortable Flexible 3-Row Seating', 'High Ground Clearance', 'Smooth Highway Cruising']),
        image: 'images/fleet-suv.jpg',
        status: 'active'
      },
      {
        id: 'tempo-traveller',
        name: 'Tempo Traveller (12–16 Seater)',
        category: 'Group Minibus',
        model: 'Group & Corporate',
        seatingCapacity: '12–16 Seats',
        luggageCapacity: '8+ Luggage Bags',
        features: JSON.stringify(['Push-back Luxury Seats', 'High-Roof Spacious Cabin', 'Separate Heavy Boot Space', 'LCD Screen & Surround Audio']),
        image: 'images/fleet-tempo.jpg',
        status: 'active'
      }
    ];

    const insertVehicle = db.prepare(`
      INSERT INTO VEHICLES (id, name, category, model, seatingCapacity, luggageCapacity, features, image, status)
      VALUES (@id, @name, @category, @model, @seatingCapacity, @luggageCapacity, @features, @image, @status)
    `);

    for (const v of initialVehicles) {
      insertVehicle.run(v);
    }
    console.log(`✓ Seeded ${initialVehicles.length} vehicles into database.`);
  }
}

export default db;
