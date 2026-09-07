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
};

export const events: EventEdition[] = [
  {
    slug: "gafw",
    name: "Glitz Africa Fashion Week",
    shortName: "GAFW",
    tagline: "The continent's runway, three days in Accra.",
    dates: "10–13 November 2026",
    venue: "Accra International Conference Centre",
    image: "/images/gafw/group-finale-walk.jpg",
    status: "On sale",
    description:
      "Runway, exhibitions and the Young Designers Showcase — GAFW 2026 brings together established houses and emerging talent from across Africa and the diaspora for its landmark 3-day edition.",
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
    image: editorialImage("event-ceo-summit", 1600, 1000),
    status: "Save the date",
    description:
      "A day of panels, workshops and closed-door roundtables for women leading companies across every sector in Ghana.",
  },
  {
    slug: "sheboss-global",
    name: "SheBoss Global",
    shortName: "SheBoss Global",
    tagline: "Entrepreneurship, scaled beyond borders.",
    dates: "April 2027",
    venue: "Lagos, Nigeria",
    image: editorialImage("event-sheboss", 1600, 1000),
    status: "Save the date",
    description:
      "Glitz Africa's founder-focused summit expands to Lagos — bringing SheBoss Global's mentorship, capital and community programming to a second market.",
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
    theme: "Trade & Exhibitions",
    items: [
      { time: "10:00", title: "Trade tents open to the public" },
      { time: "12:00", title: "Sustainability in African Textiles — panel" },
      { time: "18:30", title: "Opening cocktail, GAFW Village" },
    ],
  },
  {
    day: "Day Two",
    date: "Wed 11 Nov",
    theme: "Young Designers Showcase",
    items: [
      { time: "11:00", title: "Exhibitions continue" },
      { time: "16:00", title: "Young Designers Showcase runway" },
      { time: "19:30", title: "Press & media accreditation desk" },
    ],
  },
  {
    day: "Day Three",
    date: "Thu 12 Nov",
    theme: "Mainstage Runway",
    items: [
      { time: "12:00", title: "Emerging designers runway" },
      { time: "17:00", title: "VIP reception" },
      { time: "19:00", title: "Mainstage runway — headline designers" },
    ],
  },
  {
    day: "Day Four",
    date: "Fri 13 Nov",
    theme: "Finale",
    items: [
      { time: "18:00", title: "Doors open, red carpet" },
      { time: "20:00", title: "Finale runway & awards" },
      { time: "22:30", title: "Closing gala" },
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
