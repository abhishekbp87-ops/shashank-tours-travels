// Centralized Business Configuration for Shashank Tours & Travels
// Real client business information - NO fake statistics, fake ratings, or invented numbers.

export const businessConfig = {
  company: {
    name: "Shashank Tours & Travels",
    legalName: "Shashank Tours and Travels",
    tagline: "Travel Comfortably. Explore Freely.",
    shortDesc: "Reliable cab services for airport transfers, local city travel, outstation journeys, and memorable tours across South India.",
    phone: "+91 89042 16594",
    phoneDisplay: "+91 89042 16594",
    phoneRaw: "918904216594",
    whatsapp: "+91 89042 16594",
    whatsappRaw: "918904216594",
    email: "shashanktoursandtravels23@gmail.com",
    address: "MG Road, Indiranagar, Bengaluru, Karnataka 560038",
    operatingHours: "24 Hours / 7 Days a Week",
    serviceRegions: ["Karnataka", "Tamil Nadu", "Kerala", "Goa"],
    hubCity: "Bengaluru, Karnataka"
  },

  // Service descriptions (factual benefits, not fabricated stats)
  heroBenefits: [
    {
      title: "Professional Service",
      desc: "Experienced, courteous chauffeurs trained for safe city and highway travel."
    },
    {
      title: "Transparent Booking",
      desc: "Clear upfront quotes with zero hidden surcharges or surprise extras."
    },
    {
      title: "Easy Support",
      desc: "Direct telephone and live WhatsApp assistance available whenever you need."
    }
  ],

  // Real cab services offered (Clean consistent schema)
  services: [
    {
      id: "airport-transfers",
      title: "Airport Transfers",
      category: "Airport Travel",
      badge: "Airport Travel",
      description: "Punctual pickup and drop to Kempegowda International Airport (BLR) with dedicated flight delay tracking.",
      desc: "Punctual pickup and drop to Kempegowda International Airport (BLR) with dedicated flight delay tracking.",
      icon: "airport",
      features: [
        "Terminal pickup & drop",
        "Flight tracking support",
        "Luggage assistance",
        "Clean air-conditioned cab"
      ],
      cta: "Book This Service",
      tripType: "Airport Transfer",
      pickupDefault: "Kempegowda International Airport (BLR)",
      dropDefault: "Bangalore City"
    },
    {
      id: "outstation-cabs",
      title: "Outstation Cabs",
      category: "Intercity Travel",
      badge: "Intercity Travel",
      description: "Comfortable long-distance journeys between cities across Karnataka, Tamil Nadu, Kerala, and Goa.",
      desc: "Comfortable long-distance journeys between cities across Karnataka, Tamil Nadu, Kerala, and Goa.",
      icon: "outstation",
      features: [
        "Doorstep pickup",
        "Experienced highway drivers",
        "Well-maintained fleet",
        "Flexible photo & meal stops"
      ],
      cta: "Book This Service",
      tripType: "One Way",
      pickupDefault: "Bangalore",
      dropDefault: "Mysore"
    },
    {
      id: "local-rentals",
      title: "Local Hourly Rentals",
      category: "City Travel",
      badge: "City Travel",
      description: "Flexible 4-hour and 8-hour cab rentals for business meetings, shopping, city sightseeing, and family events.",
      desc: "Flexible 4-hour and 8-hour cab rentals for business meetings, shopping, city sightseeing, and family events.",
      icon: "local",
      features: [
        "Multiple stops permitted",
        "Chilled dual AC",
        "Courteous city drivers",
        "Flexible time extensions"
      ],
      cta: "Book This Service",
      tripType: "Local",
      pickupDefault: "Bangalore City",
      dropDefault: "Local Sightseeing"
    },
    {
      id: "round-trips",
      title: "Round-Trip Travel",
      category: "Vacations & Holidays",
      badge: "Vacations & Holidays",
      description: "Complete round-trip service with dedicated cab and driver staying with your party for the duration of the journey.",
      desc: "Complete round-trip service with dedicated cab and driver staying with your party for the duration of the journey.",
      icon: "roundTrip",
      features: [
        "Dedicated chauffeur throughout",
        "Flexible itinerary",
        "Ghat road expertise",
        "Overhead luggage carrier"
      ],
      cta: "Book This Service",
      tripType: "Round Trip",
      pickupDefault: "Bangalore",
      dropDefault: "Coorg (Kodagu)"
    },
    {
      id: "one-way-taxi",
      title: "One-Way Taxi",
      category: "Intercity Drops",
      badge: "Intercity Drops",
      description: "Convenient point-to-point drop service between major South Indian cities without return fare charges.",
      desc: "Convenient point-to-point drop service between major South Indian cities without return fare charges.",
      icon: "oneWay",
      features: [
        "No return fare",
        "Door-to-door drop",
        "Toll receipt provided",
        "Instant WhatsApp update"
      ],
      cta: "Book This Service",
      tripType: "One Way",
      pickupDefault: "Bangalore",
      dropDefault: "Mysore"
    },
    {
      id: "corporate-travel",
      title: "Corporate & Event Travel",
      category: "Corporate Travel",
      badge: "Corporate Travel",
      description: "Reliable executive cab services for client transfers, employee transit, airport delegations, and corporate events.",
      desc: "Reliable executive cab services for client transfers, employee transit, airport delegations, and corporate events.",
      icon: "corporate",
      features: [
        "GST invoice available",
        "Executive vehicles",
        "Punctual arrival guaranteed",
        "Professional drivers"
      ],
      cta: "Book This Service",
      tripType: "Airport Transfer",
      pickupDefault: "Tech Park, Bangalore",
      dropDefault: "Kempegowda Airport (BLR)"
    }
  ],

  // Real destinations (factual descriptions, NO invented prices or distances)
  destinations: [
    {
      id: "mysore",
      name: "Mysore",
      state: "Karnataka",
      category: "Heritage & Culture",
      subtitle: "Heritage & Culture",
      image: "images/dest-mysore.jpg",
      tagline: "City of Palaces & Heritage",
      description: "Explore the iconic Mysore Palace, Chamundi Hills temple, Brindavan Gardens, and historic Srirangapatna.",
      desc: "Explore the iconic Mysore Palace, Chamundi Hills temple, Brindavan Gardens, and historic Srirangapatna.",
      highlights: ["Mysore Palace", "Chamundi Hill", "Brindavan Gardens", "Silk & Sandalwood"]
    },
    {
      id: "coorg",
      name: "Coorg",
      state: "Karnataka",
      category: "Coffee & Hills",
      subtitle: "Coffee & Hills",
      image: "images/dest-coorg.jpg",
      tagline: "Misty Coffee Plantations",
      description: "Escape to refreshing coffee estates, Abbey Falls, Raja's Seat viewpoint, and Dubare Elephant Camp.",
      desc: "Escape to refreshing coffee estates, Abbey Falls, Raja's Seat viewpoint, and Dubare Elephant Camp.",
      highlights: ["Coffee Estates", "Abbey Falls", "Dubare Camp", "Raja's Seat"]
    },
    {
      id: "ooty",
      name: "Ooty",
      state: "Tamil Nadu",
      category: "Nilgiri Escape",
      subtitle: "Nilgiri Escape",
      image: "images/dest-ooty.jpg",
      tagline: "Queen of Hill Stations",
      description: "Breathtaking Nilgiri tea gardens, Ooty lake boating, Pykara falls, and scenic mountain drives.",
      desc: "Breathtaking Nilgiri tea gardens, Ooty lake boating, Pykara falls, and scenic mountain drives.",
      highlights: ["Tea Gardens", "Doddabetta Peak", "Pykara Waterfalls", "Botanical Garden"]
    },
    {
      id: "chikmagalur",
      name: "Chikmagalur",
      state: "Karnataka",
      category: "Coffee Country",
      subtitle: "Coffee Country",
      image: "images/dest-chikmagalur.jpg",
      tagline: "Western Ghats Peaks & Coffee",
      description: "Discover Mullayanagiri peak, tranquil mountain homestays, rolling coffee hills, and pristine streams.",
      desc: "Discover Mullayanagiri peak, tranquil mountain homestays, rolling coffee hills, and pristine streams.",
      highlights: ["Mullayanagiri Peak", "Coffee Plantations", "Baba Budangiri", "Jhari Falls"]
    },
    {
      id: "wayanad",
      name: "Wayanad",
      state: "Kerala",
      category: "Rainforest Retreat",
      subtitle: "Rainforest Retreat",
      image: "images/dest-wayanad.jpg",
      tagline: "Lush Greenery & Wildlife",
      description: "Experience Edakkal prehistoric caves, Banasura Sagar dam, lush spice plantations, and mist-clad hills.",
      desc: "Experience Edakkal prehistoric caves, Banasura Sagar dam, lush spice plantations, and mist-clad hills.",
      highlights: ["Banasura Dam", "Edakkal Caves", "Chembra Peak", "Wildlife Sanctuary"]
    },
    {
      id: "goa",
      name: "Goa",
      state: "Goa",
      category: "Coastal Highway",
      subtitle: "Coastal Highway",
      image: "images/dest-goa.jpg",
      tagline: "Beaches & Coastal Heritage",
      description: "Relaxed coastal road journey covering North & South Goa beaches, historic churches, and coastal cuisine.",
      desc: "Relaxed coastal road journey covering North & South Goa beaches, historic churches, and coastal cuisine.",
      highlights: ["Coastal Drive", "Historic Forts", "South Goa Beaches", "Scenic Western Ghats Route"]
    }
  ],

  // Real client fleet (factual specifications)
  fleet: [
    {
      id: "toyota-rumion",
      name: "Toyota Rumion",
      model: "KA 05 AR 7793",
      image: "images/client-vehicle.jpg",
      passengers: "6–7 Passengers",
      luggage: "3 Luggage + Roof Carrier",
      ac: "Dual Chilled AC",
      ratePerKm: "₹18/km",
      startingFrom: "₹2,499",
      description: "Toyota Rumion equipped with plush captain seats, independent rear air conditioning, and heavy-duty overhead luggage carrier. Ideal for family road trips, ghat road excursions, and airport transfers.",
      features: [
        "Plush Reclining Captain Seats",
        "Overhead Roof Luggage Carrier",
        "Independent Rear Cabin AC Vents",
        "High Ground Clearance for Hills"
      ]
    },
    {
      id: "sedan",
      name: "Prime Sedan",
      badge: "City & Highway",
      model: "Swift Dzire / Toyota Etios",
      image: "images/fleet-sedan.jpg",
      passengers: "4 Passengers",
      luggage: "2 Luggage Bags",
      ac: "Air Conditioned",
      isClientOwned: false,
      ratePerKm: "₹12/km",
      startingFrom: "₹1,499",
      description: "Comfortable air-conditioned sedan ideal for individual travellers, couples, and small families for local city runs, corporate commutes, and smooth highway trips.",
      features: [
        "4 Ergonomic Passenger Seats",
        "Spacious Boot for Luggage",
        "Chilled Dual-Zone Air Conditioning",
        "Clean & Sanitized Daily"
      ]
    },
    {
      id: "premium-suv",
      name: "Luxury SUV",
      badge: "Executive Class",
      model: "Toyota Hycross / Ertiga",
      image: "images/fleet-suv.jpg",
      passengers: "6 Passengers",
      luggage: "3 Luggage Bags",
      ac: "Multi-Zone Climate Control",
      isClientOwned: false,
      ratePerKm: "₹16/km",
      startingFrom: "₹2,199",
      description: "Spacious multi-utility vehicle offering generous legroom and quiet highway cruising for family holidays and executive delegation transit.",
      features: [
        "6 Passenger Seating Capacity",
        "Smooth Highway Suspension",
        "Generous Legroom in All Rows",
        "Clean & Sanitized Daily"
      ]
    },
    {
      id: "tempo-traveller",
      name: "Tempo Traveller",
      badge: "Group Tour",
      model: "Force Traveller (12–16 Seater)",
      image: "images/fleet-tempo.jpg",
      passengers: "9–16 Passengers",
      luggage: "8+ Luggage Bags",
      ac: "High-Capacity Dual AC",
      isClientOwned: false,
      ratePerKm: "₹24/km",
      startingFrom: "₹3,999",
      description: "Spacious minibus with pushback seats and separate rear luggage compartment, perfectly suited for large family get-togethers, corporate outings, and group pilgrimages.",
      features: [
        "Pushback Reclining Seats",
        "Large Dedicated Luggage Area",
        "High-Capacity Roof AC",
        "Ample Headroom & Wide Aisle"
      ]
    }
  ],

  // Real tour packages (NO fabricated prices)
  tours: [
    {
      id: "coorg-tour",
      title: "Coorg Hill Station Tour",
      destination: "Coorg (Kodagu)",
      duration: "3 Days / 2 Nights",
      image: "images/dest-coorg.jpg",
      tagline: "Coffee Estates & Abbey Falls",
      description: "Complete tour covering Abbey Falls, Raja's Seat, Dubare Elephant Camp, Golden Temple Kushalnagar, and scenic estate drives.",
      highlights: ["Dedicated Private Cab & Driver", "Sightseeing As Per Plan", "All Interstate Permits & Tolls Covered"]
    },
    {
      id: "ooty-tour",
      title: "Ooty & Coonoor Tour",
      destination: "Ooty & Coonoor",
      duration: "3 Days / 2 Nights",
      image: "images/dest-ooty.jpg",
      tagline: "Queen of Hills & Tea Valleys",
      description: "Experience misty Nilgiri tea estates, Botanical Garden, Ooty Lake boating, Pykara Waterfalls, and Sim's Park Coonoor.",
      highlights: ["Experienced Mountain Chauffeur", "Flexible Photo & Tea Stops", "Complete Interstate Road Permits"]
    },
    {
      id: "mysore-tour",
      title: "Mysore Heritage Tour",
      destination: "Mysore",
      duration: "2 Days / 1 Night",
      image: "images/dest-mysore.jpg",
      tagline: "Palaces & Royal History",
      description: "Immerse in royal history with visits to the illuminated Mysore Palace, Chamundi Hills, Srirangapatna, and Brindavan Gardens.",
      highlights: ["Doorstep Pickup & Return", "Flexible Sightseeing Schedule", "Expressway Tolls Accounted For"]
    },
    {
      id: "chikmagalur-tour",
      title: "Chikmagalur Peaks Tour",
      destination: "Chikmagalur",
      duration: "3 Days / 2 Nights",
      image: "images/dest-chikmagalur.jpg",
      tagline: "Mountain Peaks & Coffee",
      description: "Explore the highest peak of Karnataka at Mullayanagiri, tranquil Baba Budangiri hills, and peaceful coffee plantation retreats.",
      highlights: ["High-Clearance Mountain Cab", "Expert Ghat Road Chauffeur", "Customized Itinerary Stops"]
    }
  ],

  // Exactly 4 factual "Why Choose Us" cards (Rule 33)
  whyChooseUs: [
    {
      title: "Reliable Travel",
      desc: "Punctual arrivals, well-maintained vehicles, and dependable door-to-door service across South India.",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
    },
    {
      title: "Transparent Communication",
      desc: "Clear upfront quotes, detailed route plans, and honest billing with zero hidden surcharges.",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
    },
    {
      title: "Comfortable Vehicles",
      desc: "Clean, air-conditioned cabs with ergonomic seating, spacious boot room, and careful mechanical upkeep.",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`
    },
    {
      title: "Easy Support",
      desc: "Reach our team anytime before, during, or after your trip via direct phone call or quick WhatsApp helpdesk.",
      icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`
    }
  ],


  // Popular quick locations for smart input
  popularPickups: [
    { name: "Bangalore City", note: "Any doorstep, hotel, or address in Bengaluru" },
    { name: "Kempegowda International Airport (BLR)", note: "Terminal 1 & Terminal 2 Pickups" },
    { name: "Indiranagar / MG Road", note: "Central Bengaluru" },
    { name: "Electronic City / Whitefield", note: "Tech corridors & South Bengaluru" }
  ],

  popularDestinations: [
    { name: "Mysore", note: "Heritage Gateway & Palaces" },
    { name: "Coorg (Madikeri)", note: "Coffee Highlands & Hill Retreat" },
    { name: "Ooty", note: "Nilgiri Mountain Valleys" },
    { name: "Chikmagalur", note: "Western Ghats & Coffee Estates" },
    { name: "Wayanad", note: "Lush Rainforests & Wildlife" },
    { name: "Kempegowda International Airport (BLR)", note: "Direct Airport Drop" }
  ]
};
