import type { Restaurant, Cuisine } from "@/types";

export const cuisines: Cuisine[] = [
  { id: "1", name: "Indian", slug: "indian", emoji: "🍛" },
  { id: "2", name: "Pakistani", slug: "pakistani", emoji: "🍖" },
  { id: "3", name: "Turkish", slug: "turkish", emoji: "🌯" },
  { id: "4", name: "Arabic", slug: "arabic", emoji: "🥙" },
  { id: "5", name: "Burgers", slug: "burgers", emoji: "🍔" },
  { id: "6", name: "Desserts", slug: "desserts", emoji: "🍮" },
  { id: "7", name: "Pizza", slug: "pizza", emoji: "🍕" },
  { id: "8", name: "Breakfast", slug: "breakfast", emoji: "🥐" },
  { id: "9", name: "Bangladeshi", slug: "bangladeshi", emoji: "🍚" },
  { id: "10", name: "Lebanese", slug: "lebanese", emoji: "🫔" },
];

export const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Zouk Restaurant",
    slug: "zouk-restaurant-manchester",
    description:
      "One of Manchester's most celebrated South Asian restaurants, Zouk has earned a legendary reputation for its authentic charcoal-grilled meats and fragrant biryanis. Set across two floors in the heart of the city, the atmosphere is lively and warm — a proper Manchester institution since 2002.",
    cuisine: cuisines[1],
    location: {
      address: "The Orient, Lloyd Street",
      city: "Manchester",
      postcode: "M2 5WA",
      region: "Greater Manchester",
    },
    area: "City Centre",
    phone: "0161 233 1090",
    website: "https://zoukteabar.co.uk",
    priceRange: 2,
    halalCertification: "HMC",
    certificationBody: "Halal Monitoring Committee",
    certExpiry: "December 2026",
    certNotes:
      "All meat sourced from HMC-approved suppliers. No alcohol served on the premises.",
    score: 9.2,
    reviewCount: 3241,
    reviewSummary:
      "Reviewers consistently praise Zouk for its exceptional lamb chops and fragrant rice dishes. The attentive service and buzzing atmosphere make it a go-to for both family gatherings and date nights. A few guests noted longer waits at peak times, but the overwhelming consensus is that the food is absolutely worth it.",
    reviewKeywords: [
      "lamb chops",
      "biryani",
      "attentive service",
      "lively atmosphere",
      "family favourite",
    ],
    gradientFrom: "#10B981",
    gradientTo: "#065F46",
    tags: ["Charcoal Grill", "Family Friendly", "Groups", "Special Occasion"],
    highlights: [
      "Award-winning charcoal-grilled seekh kebabs",
      "Signature slow-cooked lamb karahi",
      "Extensive vegetarian menu",
      "Private dining room for up to 30 guests",
      "Fully licensed — mocktails available",
    ],
    faqs: [
      {
        question: "Is Zouk Restaurant fully halal?",
        answer:
          "Yes, Zouk is fully HMC certified. All meat is sourced from HMC-approved slaughterhouses and the restaurant does not serve alcohol.",
      },
      {
        question: "Do they take reservations?",
        answer:
          "Yes, bookings are strongly recommended for weekends and large groups. You can book online via their website or by calling.",
      },
      {
        question: "Is there parking nearby?",
        answer:
          "The NCP car park on Lloyd Street is a 2-minute walk from the restaurant.",
      },
      {
        question: "Is it suitable for large groups?",
        answer:
          "Zouk has a dedicated private dining room available for groups of up to 30, ideal for celebrations and corporate events.",
      },
    ],
    meals: ["Lunch", "Dinner", "Late Night"],
    amenities: ["Dine-in", "Takeaway", "Delivery", "Parking nearby", "Wheelchair Accessible"],
    reservations: true,
    isOpen: true,
    closingTime: "Closes 11:30 PM",
    busyness: "Busy right now",
    openingHours: [
      { day: "Monday", open: "Closed", close: "", closed: true },
      { day: "Tuesday", open: "12:00 PM", close: "11:00 PM" },
      { day: "Wednesday", open: "12:00 PM", close: "11:00 PM" },
      { day: "Thursday", open: "12:00 PM", close: "11:30 PM" },
      { day: "Friday", open: "12:00 PM", close: "12:00 AM" },
      { day: "Saturday", open: "12:00 PM", close: "12:00 AM" },
      { day: "Sunday", open: "12:00 PM", close: "11:00 PM" },
    ],
    featured: true,
    verified: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Mughli",
    slug: "mughli-rusholme",
    description:
      "A modern reimagining of Rusholme's Curry Mile, Mughli brings inventive Indian small plates and street food to a stylish, relaxed setting. The menu takes inspiration from across the subcontinent, combining bold spices with contemporary technique. Perfect for sharing and exploring.",
    cuisine: cuisines[0],
    location: {
      address: "30 Wilmslow Road",
      city: "Manchester",
      postcode: "M14 5TQ",
      region: "Greater Manchester",
    },
    area: "Rusholme",
    phone: "0161 248 0900",
    priceRange: 2,
    halalCertification: "HFA",
    certificationBody: "Halal Food Authority",
    certExpiry: "June 2026",
    certNotes: "HFA certified. Vegetarian and vegan options clearly labelled.",
    score: 9.0,
    reviewCount: 2187,
    reviewSummary:
      "Guests love the innovative small-plates concept and the vibrant, modern atmosphere that sets Mughli apart from the traditional Curry Mile experience. The staff are passionate and knowledgeable about the menu. Some reviewers mention the portions could be larger for the price, but the quality is undeniable.",
    reviewKeywords: [
      "small plates",
      "creative menu",
      "modern Indian",
      "sharing dishes",
      "vibrant atmosphere",
    ],
    gradientFrom: "#F59E0B",
    gradientTo: "#92400E",
    tags: ["Small Plates", "Modern Indian", "Date Night", "Cocktail Bar"],
    highlights: [
      "Innovative chaat and street food inspired starters",
      "Wood-fired bread baked to order",
      "Extensive mocktail and lassi menu",
      "Outdoor seating on Wilmslow Road",
      "Monthly chef's tasting menu",
    ],
    faqs: [
      {
        question: "Is Mughli halal certified?",
        answer:
          "Yes, Mughli holds a current HFA (Halal Food Authority) certificate. All meat and poultry served is HFA approved.",
      },
      {
        question: "Can I book a table?",
        answer:
          "Reservations are available via their website. Walk-ins are welcome but booking is advised on Friday and Saturday evenings.",
      },
      {
        question: "Do they have vegan options?",
        answer:
          "Mughli has an extensive plant-based menu with clearly labelled vegan and vegetarian dishes.",
      },
    ],
    meals: ["Dinner", "Late Night"],
    amenities: ["Dine-in", "Outdoor Seating", "Takeaway"],
    reservations: true,
    isOpen: true,
    closingTime: "Closes 10:30 PM",
    busyness: "Not too busy",
    openingHours: [
      { day: "Monday", open: "Closed", close: "", closed: true },
      { day: "Tuesday", open: "5:00 PM", close: "10:00 PM" },
      { day: "Wednesday", open: "5:00 PM", close: "10:00 PM" },
      { day: "Thursday", open: "5:00 PM", close: "10:30 PM" },
      { day: "Friday", open: "5:00 PM", close: "11:30 PM" },
      { day: "Saturday", open: "12:00 PM", close: "11:30 PM" },
      { day: "Sunday", open: "12:00 PM", close: "10:00 PM" },
    ],
    featured: true,
    verified: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Istanbul Grill",
    slug: "istanbul-grill-longsight",
    description:
      "An authentic slice of Anatolia on Longsight's bustling high street. Istanbul Grill serves proper Turkish mangal cooking — hand-pressed adana, juicy shish, and freshly baked pide bread straight from the stone oven. Unpretentious, generous portions at great prices.",
    cuisine: cuisines[2],
    location: {
      address: "512 Stockport Road",
      city: "Manchester",
      postcode: "M13 0RQ",
      region: "Greater Manchester",
    },
    area: "Longsight",
    phone: "0161 256 4422",
    priceRange: 1,
    halalCertification: "HMC",
    certificationBody: "Halal Monitoring Committee",
    certExpiry: "March 2026",
    certNotes: "HMC certified. Meat sourced from local HMC approved butcher.",
    score: 8.7,
    reviewCount: 1654,
    reviewSummary:
      "Customers rave about the generous portions and the authenticity of the charcoal-grilled meats. Istanbul Grill is frequently called out as one of the best value halal restaurants in South Manchester. A handful of reviewers mention the décor is basic, but everyone agrees the food more than makes up for it.",
    reviewKeywords: [
      "charcoal grill",
      "great value",
      "generous portions",
      "authentic Turkish",
      "adana kebab",
    ],
    gradientFrom: "#EF4444",
    gradientTo: "#7F1D1D",
    tags: ["Charcoal Grill", "BYO", "Family Friendly", "Late Night"],
    highlights: [
      "Hand-pressed adana kebab, a house speciality",
      "Fresh pide and lavash baked in-house",
      "Mixed grill platter feeds 2-3",
      "Open until 2 AM on weekends",
    ],
    faqs: [
      {
        question: "Is Istanbul Grill HMC certified?",
        answer:
          "Yes, fully HMC certified. All meat is sourced from HMC-approved suppliers and slaughtered according to Islamic requirements.",
      },
      {
        question: "Do they deliver?",
        answer:
          "Yes, delivery is available via Uber Eats and Deliveroo within a 3-mile radius.",
      },
      {
        question: "Is it BYO?",
        answer:
          "Yes, you are welcome to bring your own soft drinks. No alcohol is served or permitted.",
      },
    ],
    meals: ["Lunch", "Dinner", "Late Night"],
    amenities: ["Dine-in", "Takeaway", "Delivery"],
    reservations: false,
    isOpen: true,
    closingTime: "Closes 1:00 AM",
    busyness: "Moderate right now",
    openingHours: [
      { day: "Monday", open: "12:00 PM", close: "12:00 AM" },
      { day: "Tuesday", open: "12:00 PM", close: "12:00 AM" },
      { day: "Wednesday", open: "12:00 PM", close: "12:00 AM" },
      { day: "Thursday", open: "12:00 PM", close: "12:00 AM" },
      { day: "Friday", open: "12:00 PM", close: "2:00 AM" },
      { day: "Saturday", open: "12:00 PM", close: "2:00 AM" },
      { day: "Sunday", open: "12:00 PM", close: "12:00 AM" },
    ],
    featured: false,
    verified: true,
    createdAt: "2024-02-01T00:00:00Z",
    updatedAt: "2024-10-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Al-Faisal",
    slug: "al-faisal-rusholme",
    description:
      "A Rusholme Curry Mile stalwart for over 25 years, Al-Faisal serves hearty Pakistani and Kashmiri home cooking at prices that are hard to beat. Known for their legendary nihari, slow-cooked overnight, and thick, creamy haleem.",
    cuisine: cuisines[1],
    location: {
      address: "72 Wilmslow Road",
      city: "Manchester",
      postcode: "M14 5AL",
      region: "Greater Manchester",
    },
    area: "Rusholme",
    phone: "0161 256 3440",
    priceRange: 1,
    halalCertification: "Self-Certified",
    certificationBody: "Self-certified by owner",
    certExpiry: undefined,
    certNotes:
      "Owner-declared halal. Meat sourced from Rusholme halal butchers. Independent verification pending.",
    score: 8.4,
    reviewCount: 987,
    reviewSummary:
      "Al-Faisal is a beloved local institution praised for its no-frills, home-style cooking. Regulars swear by the nihari and haleem, calling them the best in Manchester. Some newer visitors note the décor is dated, but the authenticity and value for money keep people coming back for decades.",
    reviewKeywords: [
      "nihari",
      "haleem",
      "home cooking",
      "no frills",
      "local favourite",
    ],
    gradientFrom: "#8B5CF6",
    gradientTo: "#4C1D95",
    tags: ["Curry Mile", "No Frills", "Late Night", "BYO"],
    highlights: [
      "Overnight slow-cooked nihari, a house legend",
      "Thick, rich haleem available weekends only",
      "Whole roasted chicken karahi",
      "BYOB — soft drinks and water provided",
    ],
    faqs: [
      {
        question: "Is Al-Faisal halal?",
        answer:
          "Al-Faisal is self-certified halal by the owner. All meat is purchased from halal butchers on Wilmslow Road. It does not currently hold a third-party certification.",
      },
      {
        question: "Do they take card payments?",
        answer:
          "Yes, card payments are accepted. Cash is also welcome.",
      },
    ],
    meals: ["Lunch", "Dinner", "Late Night"],
    amenities: ["Dine-in", "Takeaway", "Delivery"],
    reservations: false,
    isOpen: false,
    closingTime: "Opens 12:00 PM",
    busyness: undefined,
    openingHours: [
      { day: "Monday", open: "12:00 PM", close: "11:00 PM" },
      { day: "Tuesday", open: "12:00 PM", close: "11:00 PM" },
      { day: "Wednesday", open: "12:00 PM", close: "11:00 PM" },
      { day: "Thursday", open: "12:00 PM", close: "11:30 PM" },
      { day: "Friday", open: "12:00 PM", close: "12:30 AM" },
      { day: "Saturday", open: "12:00 PM", close: "12:30 AM" },
      { day: "Sunday", open: "12:00 PM", close: "11:00 PM" },
    ],
    featured: false,
    verified: true,
    createdAt: "2024-03-01T00:00:00Z",
    updatedAt: "2024-09-01T00:00:00Z",
  },
  {
    id: "5",
    name: "Bundobust",
    slug: "bundobust-manchester",
    description:
      "Indian street food and craft beer — that's the Bundobust promise. The Manchester outpost of this cult northern chain is set inside a stunning former bank on Oxford Road, serving bhel puri, fried dhokla, and pani puri alongside a tap list of adventurous brews.",
    cuisine: cuisines[0],
    location: {
      address: "53 Oxford Street",
      city: "Manchester",
      postcode: "M1 6EJ",
      region: "Greater Manchester",
    },
    area: "Oxford Road",
    phone: "0161 359 6757",
    website: "https://bundobust.com",
    priceRange: 1,
    halalCertification: "HFA",
    certificationBody: "Halal Food Authority",
    certExpiry: "September 2026",
    certNotes:
      "HFA certified. Predominantly vegetarian menu with certified halal meat options.",
    score: 8.5,
    reviewCount: 2891,
    reviewSummary:
      "Bundobust is a firm favourite for its energetic atmosphere and genuinely exciting vegetarian Indian street food. The bhel puri and fried chilli paneer are standout dishes. Reviewers frequently note how approachable and fun the menu is for groups. The craft beer selection is a bonus for non-drinking visitors' companions.",
    reviewKeywords: [
      "street food",
      "bhel puri",
      "craft beer",
      "vegetarian",
      "groups",
    ],
    gradientFrom: "#3B82F6",
    gradientTo: "#1E3A8A",
    tags: ["Street Food", "Veggie Friendly", "Casual", "Groups"],
    highlights: [
      "Famous bhel puri — the signature dish",
      "Fried dhokla with tamarind and coconut",
      "Extensive tap craft beer list",
      "Set inside a stunning Grade II-listed former bank",
      "Gluten-free and vegan options throughout",
    ],
    faqs: [
      {
        question: "Is Bundobust halal certified?",
        answer:
          "Yes, Bundobust holds an HFA certificate. The majority of the menu is vegetarian, with halal-certified meat options available.",
      },
      {
        question: "Is it suitable for large groups?",
        answer:
          "Yes, the space can accommodate large groups. Contact them directly for group bookings of 10+.",
      },
    ],
    meals: ["Lunch", "Dinner"],
    amenities: ["Dine-in", "Takeaway", "Wheelchair Accessible"],
    reservations: false,
    isOpen: true,
    closingTime: "Closes 10:00 PM",
    busyness: "Not too busy",
    openingHours: [
      { day: "Monday", open: "12:00 PM", close: "10:00 PM" },
      { day: "Tuesday", open: "12:00 PM", close: "10:00 PM" },
      { day: "Wednesday", open: "12:00 PM", close: "10:00 PM" },
      { day: "Thursday", open: "12:00 PM", close: "10:00 PM" },
      { day: "Friday", open: "12:00 PM", close: "11:00 PM" },
      { day: "Saturday", open: "12:00 PM", close: "11:00 PM" },
      { day: "Sunday", open: "12:00 PM", close: "9:00 PM" },
    ],
    featured: true,
    verified: true,
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-10-15T00:00:00Z",
  },
  {
    id: "6",
    name: "Taka Taka",
    slug: "taka-taka-northern-quarter",
    description:
      "A bright, Mediterranean-inspired spot in the Northern Quarter serving Lebanese and Greek favourites with a halal twist. Think fluffy pittas, smoky mezze, and grilled halloumi alongside perfectly spiced kofta and shish. Light, fresh, and effortlessly cool.",
    cuisine: cuisines[9],
    location: {
      address: "68 High Street",
      city: "Manchester",
      postcode: "M4 1ES",
      region: "Greater Manchester",
    },
    area: "Northern Quarter",
    phone: "0161 834 2200",
    priceRange: 2,
    halalCertification: "HFA",
    certificationBody: "Halal Food Authority",
    certExpiry: "July 2026",
    certNotes:
      "HFA certified. Fish and seafood also served. Fully alcohol-free.",
    score: 8.9,
    reviewCount: 1432,
    reviewSummary:
      "Taka Taka earns consistent praise for its fresh, light Mediterranean food that feels genuinely different from Manchester's many South Asian halal options. The halloumi fries are a crowd-pleaser and the colourful interior makes it a popular spot for Instagram-worthy lunches. Service is described as friendly and fast.",
    reviewKeywords: [
      "fresh",
      "mezze",
      "halloumi fries",
      "Northern Quarter",
      "light meals",
    ],
    gradientFrom: "#F59E0B",
    gradientTo: "#D97706",
    tags: ["Mezze", "Vegetarian Options", "Date Night", "Brunch"],
    highlights: [
      "Crowd-favourite halloumi fries with honey drizzle",
      "Freshly baked flatbreads and house-made hummus",
      "Vibrant sharing mezze platters",
      "Fully alcohol-free with excellent mocktails",
      "Outdoor terrace for summer dining",
    ],
    faqs: [
      {
        question: "Is Taka Taka halal?",
        answer:
          "Yes, Taka Taka is fully HFA certified. All meat is halal and no alcohol is served on the premises.",
      },
      {
        question: "Can I book for brunch?",
        answer:
          "Yes, brunch is served on weekends from 10 AM. Booking ahead is recommended.",
      },
      {
        question: "Is there outdoor seating?",
        answer:
          "Yes, there is a small outdoor terrace which is open during warmer months.",
      },
    ],
    meals: ["Breakfast", "Lunch", "Dinner"],
    amenities: ["Dine-in", "Outdoor Seating", "Takeaway", "Delivery"],
    reservations: true,
    isOpen: false,
    closingTime: "Opens 5:00 PM",
    busyness: undefined,
    openingHours: [
      { day: "Monday", open: "Closed", close: "", closed: true },
      { day: "Tuesday", open: "12:00 PM", close: "10:00 PM" },
      { day: "Wednesday", open: "12:00 PM", close: "10:00 PM" },
      { day: "Thursday", open: "12:00 PM", close: "10:30 PM" },
      { day: "Friday", open: "12:00 PM", close: "11:00 PM" },
      { day: "Saturday", open: "10:00 AM", close: "11:00 PM" },
      { day: "Sunday", open: "10:00 AM", close: "9:00 PM" },
    ],
    featured: true,
    verified: true,
    createdAt: "2024-02-15T00:00:00Z",
    updatedAt: "2024-11-01T00:00:00Z",
  },
];

export const featuredRestaurants = restaurants.filter((r) => r.featured);

export const ukCities = [
  { name: "Manchester", count: 284, emoji: "🏙️" },
  { name: "Birmingham", count: 312, emoji: "🏭" },
  { name: "London", count: 891, emoji: "🎡" },
  { name: "Leeds", count: 156, emoji: "🦉" },
  { name: "Bradford", count: 198, emoji: "🧶" },
];
