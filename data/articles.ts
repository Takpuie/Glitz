import { editorialImage } from "@/lib/img";

export const CATEGORIES = ["News", "Entertainment", "Fashion", "Hair & Beauty", "Lifestyle"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Article = {
  slug: string;
  category: Category;
  title: string;
  dek: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
};

export const articles: Article[] = [
  {
    slug: "gafw-2026-lineup",
    category: "Fashion",
    title: "Inside the GAFW 2026 Lineup: Twenty Designers Redefining African Luxury",
    dek: "From Accra to Lagos to the diaspora, the Glitz Africa Fashion Week runway returns this November with its most ambitious showcase yet.",
    author: "Ama Boateng",
    date: "Sep 2, 2026",
    readTime: "8 min read",
    image: editorialImage("gafw-2026-lineup", 1600, 2000),
    featured: true,
  },
  {
    slug: "claudia-lumor-interview",
    category: "News",
    title: "Claudia Lumor on Building a Media House That Refuses to Choose One Lane",
    dek: "The Glitz Africa founder on publishing, events, and why the brand had to become a platform.",
    author: "Nana Yaa Asante",
    date: "Aug 28, 2026",
    readTime: "11 min read",
    image: editorialImage("claudia-lumor-interview", 1200, 1500),
  },
  {
    slug: "gwoty-honourees-announced",
    category: "News",
    title: "Ghana Women of the Year 2026: Meet the Honourees",
    dek: "Sixteen women across business, government, arts and advocacy join the GWOTY roll of honour.",
    author: "Efua Mensah",
    date: "Aug 20, 2026",
    readTime: "6 min read",
    image: editorialImage("gwoty-honourees", 1200, 1500),
  },
  {
    slug: "kente-couture-comeback",
    category: "Fashion",
    title: "Kente, Reimagined: The Fabric's Quiet Couture Comeback",
    dek: "A new generation of designers is taking Ghana's most storied textile onto international runways.",
    author: "Kwame Owusu",
    date: "Aug 15, 2026",
    readTime: "7 min read",
    image: editorialImage("kente-couture", 1200, 1500),
  },
  {
    slug: "sheboss-founders-watchlist",
    category: "News",
    title: "The SheBoss Global Founders Watchlist for 2026",
    dek: "Twelve entrepreneurs across fintech, fashion and consumer goods to know before the summit.",
    author: "Adjoa Darko",
    date: "Aug 10, 2026",
    readTime: "9 min read",
    image: editorialImage("sheboss-watchlist", 1200, 1500),
  },
  {
    slug: "skincare-harmattan-edit",
    category: "Hair & Beauty",
    title: "The Harmattan Edit: Skincare for West Africa's Dry Season",
    dek: "Dermatologists and editors weigh in on the routine that actually survives the dust and the dry heat.",
    author: "Linda Appiah",
    date: "Aug 5, 2026",
    readTime: "5 min read",
    image: editorialImage("harmattan-edit", 1200, 1500),
  },
  {
    slug: "why-african-fashion-weeks-matter",
    category: "Entertainment",
    title: "Why Africa Needs More Fashion Weeks, Not Fewer",
    dek: "An argument for platform over prestige — and why GAFW's model of trade tents alongside runway is worth copying.",
    author: "Editorial Board",
    date: "Jul 30, 2026",
    readTime: "6 min read",
    image: editorialImage("fashion-weeks-opinion", 1200, 1500),
  },
  {
    slug: "living-accra-design-district",
    category: "Lifestyle",
    title: "A Design-Lover's Weekend Guide to Accra's Osu District",
    dek: "Studios, concept stores and the best light for a Sunday walk, mapped by Glitz Africa Living.",
    author: "Selasi Tetteh",
    date: "Jul 24, 2026",
    readTime: "4 min read",
    image: editorialImage("osu-district", 1200, 1500),
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export function relatedArticles(slug: string, count = 3) {
  return articles.filter((a) => a.slug !== slug).slice(0, count);
}
