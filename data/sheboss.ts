// Content for the SheBoss Global hub (/events/sheboss-global) and the
// Marrakech Retreat 2027 page. Sources: the "SheBoss Global brief —
// direction" document and SheBoss_Global_Marrakech_Retreat_2027_Payment_Plan_Final_v2.pdf.

const IMG = "/images/sheboss";

export const SHEBOSS_EMAIL = "sheboss@glitzafrica.com";
export const SHEBOSS_PHONES = ["+233 553 540 970", "+233 509 388 909"];

/**
 * Luma registration/checkout embed for the Marrakech Retreat.
 * Paste the `src` of the iframe Luma gives you (Share → Embed → iframe),
 * e.g. "https://lu.ma/embed/event/evt-XXXXXXXX/simple".
 * While empty, the page shows the booking contacts instead.
 */
export const RETREAT_LUMA_EMBED_URL = "https://luma.com/embed/event/evt-LlzwbOZV5uksQk6/simple";

export const shebossOverview = [
  "SHE BOSS is a Glitz Africa initiative aimed at bringing together corporate executives, middle- and high-income earners and entrepreneurs in one space to network and share ideas.",
  "It is designed to help women at every stage navigate the unspoken rules of business and explore universal issues that are not often addressed: suitable career fields for each individual, money management, beauty, lifestyle and total wellness.",
  "Women are their own advocates on issues that can either stigmatise or empower growth. The platform's activities encourage women to own their voice, skill and intellect, so they are better equipped and positioned for impact.",
];

export const shebossObjectives = [
  "To build a high-level network of women professionals and entrepreneurs globally, across sectors.",
  "To promote the growth and visibility of women-led businesses.",
  "To advocate for inclusive policies and business environments.",
  "To expand access to finance, business and capital.",
  "To create a culture of knowledge sharing and collective growth.",
];

export const shebossImpact = [
  {
    figure: "10 years",
    copy: "Thousands of women impacted across various countries: top business leaders and executives, entrepreneurs, politicians and diplomats.",
  },
  {
    figure: "100%",
    copy: "An annual 100% positive rating in attendee feedback.",
  },
  {
    figure: "One platform",
    copy: "A single platform that brings women together for targeted engagement, dialogue and networking.",
  },
];

/** Optional brief sections. They render only once their text is filled in. */
export const shebossTargetAudience: string[] = [];
export const shebossConvener: { name: string; role: string; bio: string[]; image?: string } | null = null;
export const shebossUkSummary2026: string[] = [];

export type SheBossEdition = {
  month: string;
  title: string;
  location?: string;
  status: string;
  href?: string;
};

export const shebossCalendar2027: SheBossEdition[] = [
  { month: "February 2027", title: "SheBoss Global Retreat", location: "Marrakech, Morocco", status: "Registration open", href: "/events/sheboss-marrakech-retreat-2027" },
  { month: "July 2027", title: "SheBoss UK", status: "Save the date" },
  { month: "August 2027", title: "SheBoss South Africa", status: "Save the date" },
  { month: "September 2027", title: "SheBoss USA", status: "Save the date" },
  { month: "November 2027", title: "SheBoss Nigeria", status: "Save the date" },
  { month: "December 2027", title: "SheBoss Ghana", status: "Save the date" },
];

export const dohaSummary2026 = [
  "SheBoss Global Doha Retreat 2026 was a six-day international women's leadership and business retreat held from 10–15 February 2026 at the Marsa Malaz Kempinski Hotel, The Pearl, Doha, Qatar.",
  "Organised by Glitz Africa through its SheBoss platform, the retreat brought together accomplished women, entrepreneurs, executives, creatives, media personalities, professionals and influential leaders from Africa, the Middle East and the global diaspora. It marked an important expansion of the SheBoss brand beyond its established African markets, positioning Doha as a strategic meeting point between African and Middle Eastern women in business and leadership.",
  "A major highlight was the collaboration with the Qatari Businesswomen Association (QBWA), which strengthened the retreat's international positioning and created opportunities for cross-border engagement, business relationships and Africa–Middle East collaboration.",
];

export type GalleryPhoto = { src: string; alt: string; wide?: boolean };

export const dohaGallery: GalleryPhoto[] = [
  { src: `${IMG}/delegates-on-stage.jpg`, alt: "Delegates on stage at the SheBoss Global Doha Retreat", wide: true },
  { src: `${IMG}/podium-keynote.jpg`, alt: "Keynote address at the SheBoss podium" },
  { src: `${IMG}/speaker-address.jpg`, alt: "A speaker addresses the retreat" },
  { src: `${IMG}/honours-presentation.jpg`, alt: "An honours presentation on stage" },
  { src: `${IMG}/networking-lunch.jpg`, alt: "Delegates during a networking lunch", wide: true },
  { src: `${IMG}/gala-dinner.jpg`, alt: "Guests at the retreat dinner" },
  { src: `${IMG}/wellness-session.jpg`, alt: "A morning wellness session outdoors" },
  { src: `${IMG}/group-selfie.jpg`, alt: "Delegates take a selfie in front of the SheBoss backdrop" },
  { src: `${IMG}/yacht-lounge.jpg`, alt: "Guests relaxing on the yacht", wide: true },
  { src: `${IMG}/sunset-duo.jpg`, alt: "Two guests at sunset on the water" },
  { src: `${IMG}/katara-towers.jpg`, alt: "The Katara Towers at Lusail" },
  { src: `${IMG}/souq-afternoon.jpg`, alt: "An afternoon at the souq" },
  { src: `${IMG}/staircase-portrait.jpg`, alt: "A guest on the hotel staircase" },
  { src: `${IMG}/sunset-friends.jpg`, alt: "Friends at sunset on the yacht" },
  { src: `${IMG}/speaker-closing.jpg`, alt: "Closing remarks at the retreat" },
];

export const shebossImages = {
  hero: `${IMG}/group-in-white.jpg`,
  overview: `${IMG}/podium-sheboss.jpg`,
  impact: `${IMG}/delegate-portrait.jpg`,
  retreatHero: `${IMG}/yacht-sunset-portrait.jpg`,
  retreatFeature: `${IMG}/white-group-promenade.jpg`,
};

// --- Marrakech Retreat 2027 ------------------------------------------------

export const retreat = {
  slug: "sheboss-marrakech-retreat-2027",
  name: "Marrakech Retreat 2027",
  dates: "3–7 February 2027",
  location: "Marrakech, Morocco",
  tagline: "A curated escape for women who lead, inspire and shape what's next.",
};

// Prices mirror the ticket types on the Luma event (evt-LlzwbOZV5uksQk6),
// which is where payment is actually taken. Change both together.

/** Early bird closes when Luma stops selling it: 15 Dec 2026, 23:59 UTC. */
export const EARLY_BIRD_CLOSES_AT = "2026-12-15T23:59:00Z";

export const earlyBird = {
  price: "$3,300",
  label: "One-time full payment",
  deadline: "15 December 2026",
  copy: "Secure the preferred rate of $3,300 with one full payment made on or before 15 December 2026. The early bird rate is reserved exclusively for full-payment registrations and is not available on the installment plan.",
};

export const standardFull = {
  price: "$3,550",
  label: "One-time full payment",
  copy: "Secure your place at the SheBoss Global Retreat 2027 with a one-time full payment of $3,550.",
};

export const installmentPlan = {
  price: "$1,184",
  label: "× 3 monthly installments",
  copy: "Make your booking more flexible with our three-month installment option: three scheduled monthly payments of $1,184.",
  installments: [
    { label: "First installment", amount: "$1,184", due: "At booking" },
    { label: "Second installment", amount: "$1,184", due: "Monthly, per your payment schedule" },
    { label: "Third installment", amount: "$1,184", due: "Monthly, per your payment schedule" },
  ],
  total: "$3,552",
  note: "Your booking is subject to the agreed payment schedule and is not considered fully paid until all three installments have been received. All outstanding payments must be completed by the final payment deadline communicated at booking, and before the retreat begins.",
};

export const retreatInclusions = [
  "Full access to the two-day conference, including conference materials and a welcome pack",
  "Coffee breaks and lunch on both conference days",
  "Four curated luxury dinners: a Moroccan-themed welcome dinner, a garden candlelight dinner, a closing gala in the Agafay Desert and a dinner at a world-renowned hotel",
  "Private equestrian horse-show experience and dinner",
  "Cultural visit to Jardin Majorelle and the Musée Yves Saint Laurent",
  "Spa and wellness experiences, including yoga, hammam and massages",
  "Sunset camel ride and an after-party featuring a DJ, belly dancers and a fire performance",
  "Optional excursion to Kasbah Tamadot for lunch and an open-air Moroccan-inspired film experience overlooking the Atlas Mountains",
];

export const retreatImportantInfo = [
  "International flights and accommodation are not included in the registration fee.",
  "Detailed retreat locations, itinerary and the exclusive dress-code lookbook will be shared after registration.",
  "Registration is considered confirmed once the applicable payment has been received.",
];

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}
