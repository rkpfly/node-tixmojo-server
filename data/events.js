// Helper function to format dates
const formatDate = (date) => {
  const day = date.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  return `${day} ${month}`;
};

// Generate dates for events
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const todayFormatted = formatDate(today);
const tomorrowFormatted = formatDate(tomorrow);

// One week from now
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const nextWeekFormatted = formatDate(nextWeek);

// One month from now
const nextMonth = new Date(today);
nextMonth.setMonth(nextMonth.getMonth() + 1);
const nextMonthFormatted = formatDate(nextMonth);

// Format for human readable display
const formatFullDate = (date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = date.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const dayName = days[date.getDay()];

  return `${dayName}, ${day} ${month}, ${year}`;
};

// Organizers data with complete details
const organizers = {
  "org_saf001": {
    id: "org_saf001",
    name: "Sydney Arts Foundation",
    description: "A leading event organizer known for creating exceptional experiences for participants. With a proven track record of successful events, they focus on attention to detail and memorable moments.",
    location: "Sydney",
    contactEmail: "events@sydneyarts.org",
    phone: "+61 2 9876 5432",
    website: "www.sydneyartsfoundation.org",
    specialization: ["Art Exhibitions", "Cultural Events", "Galas"],
    yearEstablished: 1995
  },
  "org_sjf002": {
    id: "org_sjf002",
    name: "Sydney Jazz Foundation",
    description: "Premier jazz event organizer bringing world-class musical experiences to Sydney. Known for curating intimate jazz evenings and large-scale festivals.",
    location: "Sydney",
    contactEmail: "bookings@sydneyjazz.org",
    phone: "+61 2 9876 1234",
    website: "www.sydneyjazzfoundation.org",
    specialization: ["Jazz Concerts", "Music Festivals", "VIP Events"],
    yearEstablished: 1988
  },
  "org_sso003": {
    id: "org_sso003",
    name: "Sydney Symphony Orchestra",
    description: "Australia's premier orchestra organization, delivering world-class classical music performances and cultural experiences.",
    location: "Sydney",
    contactEmail: "info@sydneysymphony.org",
    phone: "+61 2 9876 8765",
    website: "www.sydneysymphony.org",
    specialization: ["Classical Concerts", "Orchestra Events", "Musical Education"],
    yearEstablished: 1932
  },
  "org_sfe004": {
    id: "org_sfe004",
    name: "Sydney Food Events",
    description: "Leading culinary event organizer specializing in food festivals, tastings, and gastronomic experiences across Sydney.",
    location: "Sydney",
    contactEmail: "taste@sydneyfoodevents.com",
    phone: "+61 2 9876 9876",
    website: "www.sydneyfoodevents.com",
    specialization: ["Food Festivals", "Culinary Events", "Tastings"],
    yearEstablished: 2010
  },
  "org_sbsa005": {
    id: "org_sbsa005",
    name: "Sydney Beach Sports Association",
    description: "Premier sports event organizer specializing in beach sports tournaments and recreational events.",
    location: "Sydney",
    contactEmail: "events@sydneybeachsports.org",
    phone: "+61 2 9876 3456",
    website: "www.sydneybeachsports.org",
    specialization: ["Beach Sports", "Tournaments", "Recreational Events"],
    yearEstablished: 2005
  },
  "org_gbb006": {
    id: "org_gbb006",
    name: "Gardens by the Bay",
    description: "Singapore's premier horticultural attraction and event space, known for spectacular light shows and cultural festivals.",
    location: "Singapore",
    contactEmail: "events@gardensbythebay.com.sg",
    phone: "+65 6420 6848",
    website: "www.gardensbythebay.com.sg",
    specialization: ["Light Festivals", "Cultural Events", "Garden Shows"],
    yearEstablished: 2012
  },
  "org_sft007": {
    id: "org_sft007",
    name: "Singapore Food Trails",
    description: "Expert food tour operator showcasing Singapore's rich culinary heritage through guided experiences.",
    location: "Singapore",
    contactEmail: "bookings@singaporefoodtrails.com.sg",
    phone: "+65 6789 5432",
    website: "www.singaporefoodtrails.com.sg",
    specialization: ["Food Tours", "Culinary Experiences", "Cultural Tours"],
    yearEstablished: 2015
  },
  "org_tae008": {
    id: "org_tae008",
    name: "TechAsia Events",
    description: "Leading technology conference and event organizer in Asia, connecting innovators and industry leaders.",
    location: "Singapore",
    contactEmail: "info@techasiaevents.com.sg",
    phone: "+65 6789 8765",
    website: "www.techasiaevents.com.sg",
    specialization: ["Tech Conferences", "Innovation Events", "Business Networking"],
    yearEstablished: 2008
  }
};

// Spotlight events data
const spotlightEvents = [
  {
    id: "exclusive-arts-gala",
    eventName: "EXCLUSIVE ARTS GALA",
    eventAddress: "National Gallery, Sydney",
    eventLocation: "Sydney",
    eventPrice: "299",
    eventPoster:
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2787&auto=format&fit=crop",
    rankScore: 98,
    eventRanking: "1",
    eventDateType: "nextWeek",
    date: formatFullDate(nextWeek),
    time: "07:00 pm to 11:00 pm (AEST)",
    venueName: "National Gallery",
    venueAddress: "Art Avenue, Sydney NSW 2000",
    locationMap: "https://maps.google.com/?q=National+Gallery+Sydney+NSW+2000",
    tags: ["Art", "Exhibition", "Gala", "Formal", "VIP"],
    description: `<p>Join us for the most prestigious arts event of the year. The Exclusive Arts Gala brings together acclaimed artists, collectors, and art enthusiasts for an evening of culture and elegance.</p>
    <p>Event highlights:</p>
    <ul>
      <li>Exhibition of rare and exclusive artworks</li>
      <li>Silent auction of select pieces</li>
      <li>Live performances by renowned musicians</li>
      <li>Gourmet catering and premium beverages</li>
      <li>Networking with industry leaders</li>
    </ul>
    <p>Formal attire required. Limited tickets available.</p>`,

    organizerId: "org_saf001",
    sponsors: ["Sotheby's", "Westpac"],
  },
  {
    id: "vip-jazz-evening",
    eventName: "VIP JAZZ EVENING",
    eventAddress: "Opera House, Sydney",
    eventLocation: "Sydney",
    eventPrice: "349",
    eventPoster:
      "https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=2940&auto=format&fit=crop",
    rankScore: 95,
    eventRanking: "2",
    eventDateType: "thisWeek",
    date: formatFullDate(nextWeek),
    time: "08:00 pm to 11:30 pm (AEST)",
    venueName: "Sydney Opera House",
    venueAddress: "Bennelong Point, Sydney NSW 2000",
    locationMap:
      "https://maps.google.com/?q=Sydney+Opera+House+Bennelong+Point+Sydney+NSW+2000",
    tags: ["Jazz", "VIP", "Live Music", "Opera House", "Evening"],
    description: `<p>An intimate evening of world-class jazz at the iconic Sydney Opera House. This VIP event features acclaimed jazz musicians in a sophisticated setting.</p>
    <p>The evening includes:</p>
    <ul>
      <li>Performances by award-winning jazz artists</li>
      <li>Intimate concert hall setting with perfect acoustics</li>
      <li>Pre-show reception with complimentary champagne</li>
      <li>Meet and greet with the performers (VIP ticket holders only)</li>
      <li>Commemorative program</li>
    </ul>
    <p>Smart casual attire. Early arrival recommended.</p>`,
    organizerId: "org_sjf002",
    sponsors: ["Yamaha", "American Express"],
  },
];

// Carousel flyers data
const flyerData = [
  {
    id: "bollywood-sydney",
    image:
      "https://images.unsplash.com/photo-1556035511-3168381ea4d4?q=80&w=3087&auto=format&fit=crop",
    title: "Bollywood Sydney",
    location: "Mirror Bar, The Rocks",
    date: "15 MAR",
    ticketLink: "https://tixmojo.com",
    ticketSite: "TIXMOJO.COM",
  },
  {
    id: "st-patricks-day",
    image:
      "https://images.unsplash.com/photo-1628359355624-855775b5c9c4?q=80&w=3000&auto=format&fit=crop",
    title: "St. Patrick's Day",
    location: "Jameson Connects, Gurugram",
    date: "17 MAR",
    ticketLink: "https://tixmojo.com",
    ticketSite: "TIXMOJO.COM",
  },
  {
    id: "love-is-blind",
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2940&auto=format&fit=crop",
    title: "Love is Blind",
    location: "1-Altitude Coast",
    date: "2 MAR",
    ticketLink: "https://tixmojo.com",
    ticketSite: "TIXMOJO.COM",
  },
];

// Custom events for Sydney and Singapore
const sydneyEvents = [
  {
    id: "sydney-opera-house-symphony",
    eventName: "SYDNEY OPERA HOUSE SYMPHONY",
    eventAddress: "Sydney Opera House, Sydney",
    eventLocation: "Sydney",
    eventPrice: "199",
    eventPoster: "https://images.unsplash.com/photo-1595740229246-cfdda61917c6?q=80&w=2836&auto=format&fit=crop",
    rankScore: 98,
    eventRanking: "1",
    eventDateType: "thisWeek",
    date: formatFullDate(nextWeek),
    time: "7:30 pm to 10:00 pm (AEST)",
    venueName: "Sydney Opera House",
    venueAddress: "Bennelong Point, Sydney NSW 2000",
    locationMap: "https://maps.google.com/?q=Sydney+Opera+House",
    tags: ["Classical", "Symphony", "Orchestra", "Cultural"],
    description: `<p>Experience the magic of classical music at the iconic Sydney Opera House. The Sydney Symphony Orchestra presents an evening of timeless compositions by Mozart, Beethoven, and Tchaikovsky.</p>
    <p>The program includes:</p>
    <ul>
      <li>Mozart's Symphony No. 40 in G minor</li>
      <li>Beethoven's Piano Concerto No. 5</li>
      <li>Tchaikovsky's Symphony No. 6 "Pathétique"</li>
    </ul>
    <p>This performance features world-renowned guest conductor James Williams and piano soloist Emily Chang.</p>`,
    organizerId: "org_sso003",
    sponsors: ["Australia Council for the Arts", "NSW Government"]
  },
  {
    id: "sydney-harbour-food-festival",
    eventName: "SYDNEY HARBOUR FOOD FESTIVAL",
    eventAddress: "Circular Quay, Sydney",
    eventLocation: "Sydney",
    eventPrice: "75",
    eventPoster: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2940&auto=format&fit=crop",
    rankScore: 96,
    eventRanking: "2",
    eventDateType: "today",
    date: formatFullDate(today),
    time: "11:00 am to 9:00 pm (AEST)",
    venueName: "Circular Quay",
    venueAddress: "Circular Quay, Sydney NSW 2000",
    locationMap: "https://maps.google.com/?q=Circular+Quay+Sydney",
    tags: ["Food", "Festival", "Culinary", "Waterfront", "Today's Event"],
    description: `<p>Indulge in the ultimate culinary experience at the Sydney Harbour Food Festival. Set against the stunning backdrop of Sydney Harbour, this festival brings together the city's finest chefs, restaurants, and food producers.</p>
    <p>Festival highlights:</p>
    <ul>
      <li>Cooking demonstrations by celebrity chefs</li>
      <li>Artisanal food market featuring local producers</li>
      <li>Wine and craft beer tasting sessions</li>
      <li>Seafood pavilion showcasing fresh Australian seafood</li>
      <li>Street food alley with international cuisines</li>
      <li>Live music and entertainment throughout the day</li>
    </ul>
    <p>Tickets include entry and five food sampling tokens. Additional tokens available for purchase at the event.</p>`,
    organizerId: "org_sfe004",
    sponsors: ["Tourism NSW", "Australian Culinary Federation"]
  },
  {
    id: "bondi-beach-volleyball-tournament",
    eventName: "BONDI BEACH VOLLEYBALL TOURNAMENT",
    eventAddress: "Bondi Beach, Sydney",
    eventLocation: "Sydney",
    eventPrice: "25",
    eventPoster: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=2007&auto=format&fit=crop",
    rankScore: 92,
    eventRanking: "3",
    eventDateType: "tomorrow",
    date: formatFullDate(tomorrow),
    time: "9:00 am to 6:00 pm (AEST)",
    venueName: "Bondi Beach",
    venueAddress: "Queen Elizabeth Dr, Bondi Beach NSW 2026",
    locationMap: "https://maps.google.com/?q=Bondi+Beach+Sydney",
    tags: ["Sports", "Beach", "Volleyball", "Tournament", "Tomorrow's Event"],
    description: `<p>Join us for the annual Bondi Beach Volleyball Tournament, featuring competitive matches, music, food, and good vibes!</p>
    <p>Event details:</p>
    <ul>
      <li>Professional and amateur divisions</li>
      <li>Teams of 2-4 players (register in advance)</li>
      <li>Cash prizes for winning teams</li>
      <li>Beach bar and food stalls</li>
      <li>DJ sets throughout the day</li>
      <li>Free volleyball clinics for spectators</li>
    </ul>
    <p>Spectator tickets include access to viewing areas, shade tents, and one complimentary drink.</p>`,
    organizerId: "org_sbsa005",
    sponsors: ["Mikasa", "Australian Volleyball Federation"]
  }
];

const singaporeEvents = [
  {
    id: "gardens-by-the-bay-light-festival",
    eventName: "GARDENS BY THE BAY LIGHT FESTIVAL",
    eventAddress: "Gardens by the Bay, Singapore",
    eventLocation: "Singapore",
    eventPrice: "35",
    eventPoster: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2835&auto=format&fit=crop",
    rankScore: 97,
    eventRanking: "1",
    eventDateType: "thisWeek",
    date: formatFullDate(nextWeek),
    time: "7:00 pm to 11:00 pm (SGT)",
    venueName: "Gardens by the Bay",
    venueAddress: "18 Marina Gardens Dr, Singapore 018953",
    locationMap: "https://maps.google.com/?q=Gardens+by+the+Bay+Singapore",
    tags: ["Light Festival", "Art", "Outdoor", "Family"],
    description: `<p>Witness Gardens by the Bay transformed into a magical wonderland of lights and sounds during this spectacular night festival.</p>
    <p>Festival features:</p>
    <ul>
      <li>Immersive light installations by international artists</li>
      <li>Interactive projection mapping on the Supertrees</li>
      <li>Illuminated garden trails</li>
      <li>Live performances by local and international musicians</li>
      <li>Food village featuring Singapore's best street food</li>
      <li>Art workshops for all ages</li>
    </ul>
    <p>Special extended hours for the Flower Dome and Cloud Forest during the festival period.</p>`,
    organizerId: "org_gbb006",
    sponsors: ["Singapore Tourism Board", "National Arts Council"]
  },
  {
    id: "singapore-night-food-tour",
    eventName: "SINGAPORE NIGHT FOOD TOUR",
    eventAddress: "Chinatown, Singapore",
    eventLocation: "Singapore",
    eventPrice: "85",
    eventPoster: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=2940&auto=format&fit=crop",
    rankScore: 94,
    eventRanking: "2",
    eventDateType: "tomorrow",
    date: formatFullDate(tomorrow),
    time: "6:00 pm to 10:00 pm (SGT)",
    venueName: "Chinatown Food Street",
    venueAddress: "Smith Street, Chinatown, Singapore",
    locationMap: "https://maps.google.com/?q=Chinatown+Food+Street+Singapore",
    tags: ["Food Tour", "Culinary", "Cultural", "Night", "Tomorrow's Event"],
    description: `<p>Embark on a gastronomic journey through Singapore's vibrant food scene on this guided night food tour.</p>
    <p>Tour highlights:</p>
    <ul>
      <li>Visit to 5 different food stops across Singapore's diverse neighborhoods</li>
      <li>Sample over 12 local dishes and delicacies</li>
      <li>Learn about the cultural significance of Singapore's hawker centers</li>
      <li>Try Singapore's signature dishes like Hainanese Chicken Rice, Laksa, and Chili Crab</li>
      <li>Expert local guide sharing insights on Singapore's food culture</li>
      <li>Small group experience (maximum 8 participants)</li>
    </ul>
    <p>Tour includes all food tastings, one local beverage, and transportation between food stops.</p>`,
    organizerId: "org_sft007",
    sponsors: ["Singapore Tourism Board"]
  },
  {
    id: "marina-bay-tech-conference",
    eventName: "MARINA BAY TECH CONFERENCE",
    eventAddress: "Marina Bay Sands, Singapore",
    eventLocation: "Singapore",
    eventPrice: "299",
    eventPoster: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?q=80&w=2940&auto=format&fit=crop",
    rankScore: 93,
    eventRanking: "3",
    eventDateType: "today",
    date: formatFullDate(today),
    time: "9:00 am to 6:00 pm (SGT)",
    venueName: "Marina Bay Sands Convention Centre",
    venueAddress: "10 Bayfront Avenue, Singapore 018956",
    locationMap: "https://maps.google.com/?q=Marina+Bay+Sands+Singapore",
    tags: ["Tech", "Conference", "Business", "Innovation", "Today's Event"],
    description: `<p>Asia's premier technology conference bringing together innovators, entrepreneurs, and industry leaders to explore the future of technology.</p>
    <p>Conference agenda:</p>
    <ul>
      <li>Keynote speeches by global tech visionaries</li>
      <li>Panel discussions on AI, blockchain, cybersecurity, and more</li>
      <li>Startup pitch competition with $100,000 prize</li>
      <li>Product demos and interactive exhibitions</li>
      <li>Networking sessions with industry leaders</li>
      <li>Career fair featuring top tech companies</li>
    </ul>
    <p>Full day pass includes access to all sessions, lunch, refreshments, and networking reception.</p>`,
    organizerId: "org_tae008",
    sponsors: ["Google", "Microsoft", "Singapore Economic Development Board"]
  }
];

// Additional events for each organizer
const additionalEvents = [
  // Additional events for Sydney Arts Foundation (org_saf001)
  {
    id: "sydney-art-festival",
    eventName: "SYDNEY ART FESTIVAL",
    eventAddress: "Sydney Art Gallery, Sydney",
    eventLocation: "Sydney",
    eventPrice: "149",
    eventPoster: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?q=80&w=2787&auto=format&fit=crop",
    rankScore: 87,
    eventRanking: "4",
    eventDateType: "nextMonth",
    date: formatFullDate(nextMonth),
    time: "10:00 am to 8:00 pm (AEST)",
    venueName: "Sydney Art Gallery",
    venueAddress: "Art Street, Sydney NSW 2000",
    locationMap: "https://maps.google.com/?q=Sydney+Art+Gallery+Sydney+NSW+2000",
    tags: ["Art", "Festival", "Family", "Cultural"],
    description: `<p>Experience Sydney's premier art festival featuring works from local and international artists. This annual event showcases contemporary art in all its forms and celebrates artistic expression and creativity.</p>
    <p>Festival highlights:</p>
    <ul>
      <li>Interactive art installations</li>
      <li>Live painting demonstrations</li>
      <li>Artist talks and workshops</li>
      <li>Children's art zone</li>
      <li>Food and drink vendors</li>
    </ul>
    <p>Perfect for art lovers of all ages. Family tickets available.</p>`,
    organizerId: "org_saf001",
    sponsors: ["Sydney City Council", "Art Australia Foundation"]
  },
  {
    id: "sydney-cultural-night",
    eventName: "SYDNEY CULTURAL NIGHT",
    eventAddress: "Hyde Park, Sydney",
    eventLocation: "Sydney",
    eventPrice: "85",
    eventPoster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2574&auto=format&fit=crop",
    rankScore: 86,
    eventRanking: "5",
    eventDateType: "tomorrow",
    date: formatFullDate(tomorrow),
    time: "6:00 pm to 11:00 pm (AEST)",
    venueName: "Hyde Park",
    venueAddress: "Elizabeth Street, Sydney NSW 2000",
    locationMap: "https://maps.google.com/?q=Hyde+Park+Sydney+NSW+2000",
    tags: ["Cultural", "Night", "Performance", "Food"],
    description: `<p>An enchanting evening celebrating Sydney's diverse cultural landscape. Sydney Cultural Night brings together performances, food, and traditions from communities around the world.</p>
    <p>Experience includes:</p>
    <ul>
      <li>Cultural dance performances</li>
      <li>Traditional music ensembles</li>
      <li>International food stalls</li>
      <li>Artisan craft market</li>
      <li>Lantern lighting ceremony</li>
    </ul>
    <p>Bring the whole family for an unforgettable cultural journey.</p>`,
    organizerId: "org_saf001",
    sponsors: ["Cultural Diversity Council", "World Food Market"]
  },
  
  // Additional events for Sydney Jazz Foundation (org_sjf002)
  {
    id: "downtown-jazz-series",
    eventName: "DOWNTOWN JAZZ SERIES",
    eventAddress: "State Theatre, Sydney",
    eventLocation: "Sydney",
    eventPrice: "125",
    eventPoster: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=2940&auto=format&fit=crop",
    rankScore: 90,
    eventRanking: "6",
    eventDateType: "nextWeek",
    date: formatFullDate(nextWeek),
    time: "7:30 pm to 10:30 pm (AEST)",
    venueName: "State Theatre",
    venueAddress: "49 Market St, Sydney NSW 2000",
    locationMap: "https://maps.google.com/?q=State+Theatre+Sydney+NSW+2000",
    tags: ["Jazz", "Live Music", "Concert Series"],
    description: `<p>The Downtown Jazz Series presents world-class jazz musicians in an intimate setting. Each performance in this acclaimed series features a different jazz style and artist.</p>
    <p>Event highlights:</p>
    <ul>
      <li>Performances by internationally acclaimed jazz artists</li>
      <li>Curated selection of classic and contemporary jazz</li>
      <li>Intimate venue with superior acoustics</li>
      <li>Pre-show talk with the artists (VIP tickets only)</li>
      <li>Complimentary program</li>
    </ul>
    <p>Smart casual attire recommended. Bar service available.</p>`,
    organizerId: "org_sjf002",
    sponsors: ["ABC Jazz", "Sydney Music Conservatory"]
  },
  {
    id: "sunset-jazz-cruise",
    eventName: "SUNSET JAZZ CRUISE",
    eventAddress: "Sydney Harbour",
    eventLocation: "Sydney",
    eventPrice: "175",
    eventPoster: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2874&auto=format&fit=crop",
    rankScore: 89,
    eventRanking: "7",
    eventDateType: "nextMonth",
    date: formatFullDate(nextMonth),
    time: "5:30 pm to 9:00 pm (AEST)",
    venueName: "Sydney Harbour Cruise",
    venueAddress: "Circular Quay, Sydney NSW 2000",
    locationMap: "https://maps.google.com/?q=Circular+Quay+Sydney+NSW+2000",
    tags: ["Jazz", "Cruise", "Dinner", "Sunset"],
    description: `<p>Experience the magic of live jazz while cruising Sydney Harbour at sunset. This exclusive event combines world-class jazz, gourmet dining, and stunning views of Sydney's iconic landmarks.</p>
    <p>The experience includes:</p>
    <ul>
      <li>Three-hour harbor cruise with iconic Sydney views</li>
      <li>Live jazz ensemble performance</li>
      <li>Three-course gourmet dinner with wine pairing</li>
      <li>Welcome champagne reception</li>
      <li>Professional photography service (additional fee)</li>
    </ul>
    <p>Smart casual dress code. Boarding begins 30 minutes before departure.</p>`,
    organizerId: "org_sjf002",
    sponsors: ["Harbour Cruises", "Sydney Jazz Festival"]
  },
  
  // Additional events for Sydney Symphony Orchestra (org_sso003)
  {
    id: "beethoven-symphony-night",
    eventName: "BEETHOVEN SYMPHONY NIGHT",
    eventAddress: "Sydney Opera House, Sydney",
    eventLocation: "Sydney",
    eventPrice: "185",
    eventPoster: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=2940&auto=format&fit=crop",
    rankScore: 92,
    eventRanking: "8",
    eventDateType: "nextWeek",
    date: formatFullDate(nextWeek),
    time: "7:00 pm to 9:30 pm (AEST)",
    venueName: "Sydney Opera House Concert Hall",
    venueAddress: "Bennelong Point, Sydney NSW 2000",
    locationMap: "https://maps.google.com/?q=Sydney+Opera+House+Bennelong+Point+Sydney+NSW+2000",
    tags: ["Classical", "Orchestra", "Beethoven", "Symphony"],
    description: `<p>Experience the power and emotion of Beethoven's most beloved symphonies performed by the Sydney Symphony Orchestra. This special concert showcases Beethoven's revolutionary musical genius.</p>
    <p>Program includes:</p>
    <ul>
      <li>Symphony No. 5 in C minor</li>
      <li>Symphony No. 7 in A major</li>
      <li>Egmont Overture</li>
    </ul>
    <p>Conducted by Maestro David Robertson with special guest soloist Anna Fedorova on piano. Pre-concert talk available 45 minutes before the performance.</p>`,
    organizerId: "org_sso003",
    sponsors: ["Steinway & Sons", "Classical Music Foundation"]
  },
  {
    id: "family-orchestra-adventure",
    eventName: "FAMILY ORCHESTRA ADVENTURE",
    eventAddress: "Sydney Town Hall, Sydney",
    eventLocation: "Sydney",
    eventPrice: "45",
    eventPoster: "https://images.unsplash.com/photo-1461784180009-21121b2f204c?q=80&w=2940&auto=format&fit=crop",
    rankScore: 85,
    eventRanking: "9",
    eventDateType: "tomorrow",
    date: formatFullDate(tomorrow),
    time: "11:00 am to 12:30 pm (AEST)",
    venueName: "Sydney Town Hall",
    venueAddress: "483 George St, Sydney NSW 2000",
    locationMap: "https://maps.google.com/?q=Sydney+Town+Hall+483+George+St+Sydney+NSW+2000",
    tags: ["Family", "Orchestra", "Educational", "Children"],
    description: `<p>Introduce your children to the wonder of orchestral music with this special family concert. Designed for young audiences, this interactive performance makes classical music accessible and fun.</p>
    <p>Program features:</p>
    <ul>
      <li>Child-friendly arrangements of classical favorites</li>
      <li>Introduction to orchestral instruments</li>
      <li>Audience participation moments</li>
      <li>Narrated musical stories</li>
      <li>Meet-the-musicians session after the concert</li>
    </ul>
    <p>Recommended for ages 5-12. Children under 2 admitted free if sitting on parent's lap.</p>`,
    organizerId: "org_sso003",
    sponsors: ["Music Education Foundation", "Children's Arts Council"]
  },
  {
    id: "movie-scores-concert",
    eventName: "MOVIE SCORES CONCERT",
    eventAddress: "Sydney Opera House, Sydney",
    eventLocation: "Sydney",
    eventPrice: "155",
    eventPoster: "https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?q=80&w=2940&auto=format&fit=crop",
    rankScore: 91,
    eventRanking: "10",
    eventDateType: "nextMonth",
    date: formatFullDate(nextMonth),
    time: "8:00 pm to 10:30 pm (AEST)",
    venueName: "Sydney Opera House Concert Hall",
    venueAddress: "Bennelong Point, Sydney NSW 2000",
    locationMap: "https://maps.google.com/?q=Sydney+Opera+House+Bennelong+Point+Sydney+NSW+2000",
    tags: ["Orchestra", "Film Music", "Movie Scores", "Popular"],
    description: `<p>Experience the Sydney Symphony Orchestra performing iconic film scores from cinematic history. This concert brings to life the music that has defined generations of beloved films.</p>
    <p>Program includes scores from:</p>
    <ul>
      <li>Star Wars and Indiana Jones (John Williams)</li>
      <li>The Lord of the Rings (Howard Shore)</li>
      <li>The Godfather (Nino Rota)</li>
      <li>Pirates of the Caribbean (Hans Zimmer)</li>
      <li>James Bond themes (Various composers)</li>
    </ul>
    <p>Film clips will be displayed on large screens during the performance. Special guest conductor John Novacek.</p>`,
    organizerId: "org_sso003",
    sponsors: ["Film Australia", "Screen NSW"]
  }
];

// Add the additional events to Sydney events
sydneyEvents.push(...additionalEvents);

// Add location-specific events collections
const locationEvents = {
  "Sydney": sydneyEvents,
  "Singapore": singaporeEvents
};

module.exports = {
  spotlightEvents,
  flyerData,
  locationEvents,
  organizers,
  formatDate,
  formatFullDate,
};
