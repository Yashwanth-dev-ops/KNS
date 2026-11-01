// Every fact here comes from KNS's own card, flyer, scope sheet, listings and layout PDF.
export const company = {
  name: 'KNS Construction and Real Estate',
  tagline: 'Building dreams, brick by brick',
  proprietor: 'Kiran Gajbhare',
  phones: ['+91 91004 25645', '+91 92465 63397'],
  tel: ['+919100425645', '+919246563397'],
  whatsapp: '919100425645',
  email: 'knsconstructions@gmail.com',
  address: ['Raghavendra Colony, Bajaj Showroom Line', 'Kondapur, Hyderabad 500084', 'Telangana, India'],
};

export const wa = (text: string) => `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;

export type Photo = { src: string; alt: string; caption: string; w: number; h: number };
export type Zone = {
  id: string; n: number; title: string; short: string; body: string; photos?: Photo[];
  facts: [string, string][]; ask: string;
  focus: [number, number, number]; view: [number, number, number]; pin: [number, number, number];
};

export const zones: Zone[] = [
  {
    id: 'projects', n: 1, title: 'Our projects', short: 'Projects',
    body: 'Every KNS project on one map table. Tap a pin to open it.',
    facts: [['Kondapur', 'Ready-to-move G+1 duplex'], ['Raghavendra Colony', '10 premium 3BHK flats'], ['Ganapatiguda', '100-villa community, concept'], ['Hyderabad', 'Open plots']],
    ask: 'Please send me details of your projects',
    focus: [-17, 1.3, 44], view: [-9.5, 9.5, 47], pin: [-17, 6, 44],
  },
  {
    id: 'build', n: 2, title: 'Design your home', short: 'Design your home',
    photos: [
      { src: 'photos/flyer-villa-dusk.jpg', w: 499, h: 263, alt: 'A two-storey villa with warm wall lights at dusk', caption: "Elevation style from a KNS flyer. Artist's impression" },
      { src: 'photos/flyer-modern-house.jpg', w: 323, h: 285, alt: 'A modern G+1 house with a glass balcony and timber panels', caption: "Elevation style from a KNS flyer. Artist's impression" },
    ],
    body: 'Choose your plot, floors and package. Your house takes shape with its price, then watch KNS build it, footings to front door.',
    facts: [['Standard', '₹1,600 to 1,800 a sft'], ['Premium', '₹1,900 to 2,200 a sft'], ['Commercial', '₹2,200 to 2,500 a sft'], ['Includes', 'Planning, 2D and 3D design, structure, civil work, finishing, materials']],
    ask: 'I want a quote for turnkey construction',
    focus: [29, 5, 10], view: [3, 13, 34], pin: [30, 16, 10],
  },
  {
    id: 'finish', n: 3, title: 'Finishes studio', short: 'Finishes',
    body: 'Tap the samples to change the floor, kitchen platform, walls and main door. Your picks join your house design.',
    facts: [['Floors', 'Vitrified tiles, anti-skid on balconies'], ['Kitchen', 'Granite platform, steel sink, dado tiles'], ['Bathrooms', 'Designer tiles, CP fittings'], ['Paint', 'Emulsion inside, weatherproof outside']],
    ask: 'I am interested in interior and exterior finishing',
    focus: [-31, 1.4, -2], view: [-19, 5.2, 4.5], pin: [-30, 6, -2],
  },
  {
    id: 'duplex', n: 4, title: 'Ready-to-move duplex, Kondapur', short: 'Kondapur duplex',
    body: 'A 200 sq yd, east-facing, Vastu-compliant G+1 duplex with covered car parking, false ceilings and attached bathrooms. Drag the sun to see the morning light on its front.',
    facts: [['Plot', '200 sq yd, G+1'], ['Built-up', 'About 1,400 to 1,600 sft a floor'], ['Facing', 'East, Vastu compliant'], ['Status', 'Ready to move']],
    ask: 'I want to see the ready-to-move duplex in Kondapur',
    focus: [30, 3.5, -32], view: [11, 7, -16], pin: [30, 11, -32],
  },
  {
    id: 'apartments', n: 5, title: '3BHK apartments, Raghavendra Colony', short: 'Apartments',
    body: 'Ten premium 3BHK flats on a 600 sq yd east-facing site in Raghavendra Colony, Kondapur, close to IT offices, schools and hospitals.',
    facts: [['Flats', '10, each 1,650 sft'], ['Site', '600 sq yd, east facing'], ['Location', 'Raghavendra Colony, Kondapur'], ['Status', 'On request']],
    ask: 'I want details of the 3BHK apartments in Raghavendra Colony',
    focus: [-30, 8, -40], view: [-6, 16, -14], pin: [-30, 22, -40],
  },
  {
    id: 'plots', n: 6, title: 'Villa community, Ganapatiguda', short: 'Villa plots',
    photos: [{ src: 'brand/villa-layout.jpg', w: 1819, h: 1287, alt: 'Master layout of the KNS Premium Villa Community with numbered plots, roads, clubhouse and pool', caption: 'KNS Premium Villa Community, concept layout' }],
    body: '100 villas of 250 sq yd on 8.25 acres at Pocharam, Patancheru, plus open plots across Hyderabad. Fly over the site and pick a plot.',
    facts: [['Villa plots', '250 sq yd, 30 ft by 75 ft'], ['Community', '8.25 acres, clubhouse, pool, parks'], ['Roads', '40 ft and 30 ft wide'], ['Status', 'Concept layout, subject to approvals']],
    ask: 'I would like to know about your villa plots and open plots',
    focus: [-36, 0, 24], view: [-13, 13, 44], pin: [-36, 6, 24],
  },
  {
    id: 'office', n: 7, title: 'Visit the KNS office', short: 'Visit KNS',
    photos: [{ src: 'photos/kns-card-in-hand.jpg', w: 680, h: 420, alt: 'The KNS visiting card held in a hand, with the crane logo, address and phone numbers', caption: 'The KNS visiting card' }],
    body: 'Bring your plot papers or your idea. Pick a day and Kiran Gajbhare and the team will show you a site.',
    facts: [['Office', 'Raghavendra Colony, Bajaj Showroom Line, Kondapur'], ['Phone', '91004 25645, 92465 63397'], ['Email', 'knsconstructions@gmail.com'], ['WhatsApp', 'Available']],
    ask: 'I would like to fix a site visit with KNS',
    focus: [0, 5, -64], view: [9, 7, -36], pin: [0, 14, -64],
  },
];

export type Project = {
  slug: string; zone: string; name: string; place: string; status: string; summary: string;
  facts: [string, string][]; maps: string; mapPos: [number, number]; photos: Photo[];
};

// Status words are KNS's own; "Concept" and "On request" stay until KNS confirms otherwise.
export const projects: Project[] = [
  {
    slug: 'kondapur-duplex', zone: 'duplex', name: 'G+1 duplex, Kondapur', place: 'Kondapur, Hyderabad', status: 'Ready to move',
    summary: 'A 200 sq yd, east-facing, Vastu-compliant duplex with covered car parking.',
    facts: [['Plot', '200 sq yd'], ['Floors', 'G+1'], ['Facing', 'East'], ['Status', 'Ready to move']],
    maps: 'https://www.google.com/maps/search/?api=1&query=Kondapur%2C%20Hyderabad', mapPos: [0.07, 0.02],
    photos: [],
  },
  {
    slug: 'raghavendra-colony-apartments', zone: 'apartments', name: '3BHK apartments, Raghavendra Colony', place: 'Raghavendra Colony, Kondapur', status: 'On request',
    summary: 'Ten premium 3BHK flats of 1,650 sft on a 600 sq yd east-facing site.',
    facts: [['Flats', '10'], ['Size', '1,650 sft each'], ['Site', '600 sq yd, east facing'], ['Status', 'On request']],
    maps: 'https://www.google.com/maps/search/?api=1&query=Raghavendra%20Colony%2C%20Kondapur%2C%20Hyderabad', mapPos: [-0.03, 0.1],
    photos: [],
  },
  {
    slug: 'ganapatiguda-villas', zone: 'plots', name: 'Premium villa community, Ganapatiguda', place: 'Pocharam, Patancheru, Sangareddy', status: 'Concept',
    summary: '100 villas of 250 sq yd on 8.25 acres, with clubhouse, pool and parks.',
    facts: [['Land', '8.25 acres'], ['Villas', '100 planned'], ['Plots', '250 sq yd, 30 by 75 ft'], ['Status', 'Concept layout, subject to approvals']],
    maps: 'https://www.google.com/maps/search/?api=1&query=Ganapatiguda%2C%20Pocharam%2C%20Patancheru', mapPos: [-0.33, -0.26],
    photos: [{ src: 'brand/villa-layout.jpg', w: 1819, h: 1287, alt: 'Concept master layout of the villa community', caption: 'Concept layout' }],
  },
  {
    slug: 'open-plots', zone: 'plots', name: 'Open plots, Hyderabad', place: 'Locations on request', status: 'Available',
    summary: 'Open plots in prime Hyderabad locations. Ask KNS for current plots and sizes.',
    facts: [['Sizes', 'On request'], ['Locations', 'On request']],
    maps: 'https://www.google.com/maps/search/?api=1&query=Hyderabad', mapPos: [0.3, 0.16],
    photos: [],
  },
];

export const allPhotos = zones.flatMap((z) => (z.photos ?? []).map((p) => ({ ...p, zone: z.title })));
