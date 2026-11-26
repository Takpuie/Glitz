import { editorialImage } from "@/lib/img";

export type EventEdition = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  dates: string;
  venue: string;
  image: string;
  status: "On sale" | "Applications open" | "Save the date" | "Archived";
  description: string;
  gallery?: { src: string; caption: string }[];
};

export const events: EventEdition[] = [
  {
    slug: "gafw",
    name: "Glitz Africa Fashion Week",
    shortName: "GAFW",
    tagline: "The continent's runway, four days in Accra.",
    dates: "10–13 November 2026",
    venue: "The Underbridge Annex, Accra, Ghana",
    image: "/images/gafw/group-finale-walk.jpg",
    status: "On sale",
    description:
      "Runway, exhibitions and the Young Designers Showcase — GAFW 2026 brings together established houses and emerging talent from across Africa and the diaspora for its landmark four-day edition.",
  },
  {
    slug: "gwoty",
    name: "Ghana Women of the Year Honours",
    shortName: "GWOTY",
    tagline: "Honouring the women shaping Ghana.",
    dates: "6 December 2026",
    venue: "Kempinski Hotel Gold Coast City, Accra",
    image: editorialImage("event-gwoty", 1600, 1000),
    status: "Applications open",
    description:
      "A black-tie honours evening recognising sixteen women across business, government, arts and advocacy — permanent profiles published for every honouree, every year.",
  },
  {
    slug: "female-ceo-summit",
    name: "Ghana Female CEO Summit",
    shortName: "Female CEO Summit",
    tagline: "Where Ghana's women in leadership convene.",
    dates: "18 March 2027",
    venue: "Mövenpick Ambassador Hotel, Accra",
    image: "/images/female-ceo-summit/panel-trade-opportunities.jpg",
    status: "Save the date",
    description:
      "A day of panels, workshops and closed-door roundtables for women leading companies across every sector in Ghana.",
    gallery: [
      { src: "/images/female-ceo-summit/panel-trade-opportunities.jpg", caption: "Panel — Expanding Trade Opportunities & Market Access for Women-Led Enterprises" },
      { src: "/images/female-ceo-summit/podium-speaker.jpg", caption: "Keynote address" },
      { src: "/images/female-ceo-summit/podium-red-dress.jpg", caption: "Closing remarks" },
    ],
  },
  {
    slug: "sheboss-marrakech-retreat-2027",
    name: "SheBoss Global Marrakech Retreat 2027",
    shortName: "Marrakech Retreat",
    tagline: "A curated escape for women who lead, inspire and shape what's next.",
    dates: "3–7 February 2027",
    venue: "Marrakech, Morocco",
    image: "/images/sheboss/yacht-sunset-portrait.jpg",
    status: "On sale",
    description:
      "Two conference days, four curated luxury dinners, a closing gala in the Agafay Desert, spa and wellness, and cultural visits to Jardin Majorelle and the Musée Yves Saint Laurent. Early bird $3,300 until 15 December 2026.",
  },
  {
    slug: "sheboss-global",
    name: "SheBoss Global",
    shortName: "SheBoss Global",
    tagline: "Women in business, networking and growing together, worldwide.",
    dates: "2027 season · Marrakech, UK, South Africa, USA, Nigeria, Ghana",
    venue: "Global",
    image: "/images/sheboss/group-in-white.jpg",
    status: "On sale",
    description:
      "A Glitz Africa initiative bringing together corporate executives, professionals and entrepreneurs to network, share ideas and explore the unspoken rules of business, with editions across Africa, Europe and North America in 2027.",
  },
  {
    slug: "style-awards",
    name: "Glitz Style Awards",
    shortName: "Style Awards",
    tagline: "Africa's night of the best-dressed.",
    dates: "August 2027",
    venue: "Accra",
    image: editorialImage("event-style-awards", 1600, 1000),
    status: "Save the date",
    description:
      "The definitive celebration of style across fashion, entertainment and culture, with categories voted on by readers and a panel of editors.",
  },
];

export const gafwProgramme = [
  {
    day: "Day One",
    date: "Tue 10 Nov",
    theme: "Beauty Forum",
    items: [
      { time: "10:00–13:00", title: "Beauty Forum", venue: "W. Emporium" },
    ],
  },
  {
    day: "Day Two",
    date: "Wed 11 Nov",
    theme: "Young Design Talent Show",
    items: [
      { time: "15:00–18:00", title: "Young Design Talent Show", venue: "Viva Boutique" },
    ],
  },
  {
    day: "Day Three",
    date: "Thu 12 Nov",
    theme: "Private Show & Main Runway",
    items: [
      { time: "17:00–18:00", title: "Atafo & Christie Brown Private Show", venue: "The Underbridge" },
      { time: "19:00–23:00", title: "Main Runway — Day 1", venue: "The Underbridge" },
    ],
  },
  {
    day: "Day Four",
    date: "Fri 13 Nov",
    theme: "Business, Graduate & Main Runway",
    items: [
      { time: "09:00–12:00", title: "Business of Fashion Seminar", venue: "The Underbridge" },
      { time: "13:00–15:00", title: "Graduate Show", venue: "The Underbridge" },
      { time: "17:00–23:00", title: "Main Runway — Day 2", venue: "The Underbridge" },
    ],
  },
];

export const gafwTickets = [
  {
    tier: "Runway — General",
    price: "GHS 450",
    detail: "Single-day mainstage runway access, Day Three or Day Four.",
  },
  {
    tier: "Runway — VIP",
    price: "GHS 1,200",
    detail: "Front-section seating, VIP reception access, gift bag.",
  },
  {
    tier: "Trade Tents Pass",
    price: "GHS 150",
    detail: "All-access to exhibitions and trade tents, Days One & Two.",
  },
  {
    tier: "Full Festival Pass",
    price: "GHS 2,800",
    detail: "All four days, VIP runway seating, GAFW Village access.",
  },
  {
    tier: "Table of 10 — Finale Gala",
    price: "GHS 18,000",
    detail: "Reserved table, finale runway and closing gala, Day Four.",
  },
];

export const gafwGallery = [
  { src: "/images/gafw/look-yellow-fringe.jpg", caption: "Asantewaa — beaded fringe collar" },
  { src: "/images/gafw/look-red-rope-belt.jpg", caption: "Asantewaa — rope-belt evening look" },
  { src: "/images/gafw/look-menswear-necklace.jpg", caption: "Menswear — beaded statement necklace" },
  { src: "/images/gafw/accessory-crossbody-bag.jpg", caption: "Menswear — beaded crossbody" },
  { src: "/images/gafw/accessory-beaded-backpack.jpg", caption: "Accessories — beaded backpack" },
];

export function getEvent(slug: string) {
  return events.find((e) => e.slug === slug);
}
