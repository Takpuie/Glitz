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
    image: "/images/gafw/hero-designer-and-model.jpg",
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
  {
    slug: "kosi-yankey-ayeh-kaya-institute",
    category: "News",
    title: "Kosi Yankey-Ayeh on Building the KAYA Women's Leadership Institute From the Ground Up",
    dek: "The former GIPC CEO on why she left the public sector to build a training pipeline for Ghana's next generation of women executives.",
    author: "Nana Yaa Asante",
    date: "Sep 10, 2026",
    readTime: "9 min read",
    image: editorialImage("kosi-yankey-ayeh", 1200, 1500),
  },
  {
    slug: "gcb-bank-women-sme-fund",
    category: "News",
    title: "Inside GCB Bank's New GHS 50M Fund for Women-Owned SMEs",
    dek: "Lower collateral requirements and a mentorship track — how the country's largest bank is trying to close the gender lending gap.",
    author: "Efua Mensah",
    date: "Sep 5, 2026",
    readTime: "7 min read",
    image: editorialImage("gcb-sme-fund", 1200, 1500),
  },
  {
    slug: "amaarae-gyakie-new-afrobeats-wave",
    category: "Entertainment",
    title: "Amaarae, Gyakie and the Sound Defining Ghana's New Afrobeats Wave",
    dek: "Three producers on the alté-highlife hybrid that's pulling Accra back onto the continent's playlists.",
    author: "Kwame Owusu",
    date: "Aug 26, 2026",
    readTime: "8 min read",
    image: editorialImage("afrobeats-wave", 1200, 1500),
  },
  {
    slug: "sarkodie-grammy-nomination-hiplife",
    category: "Entertainment",
    title: "Sarkodie's Grammy Nomination and What It Means for Hip-Life",
    dek: "A first for the genre — and a reminder of how long Ghanaian rap has been waiting for this exact recognition.",
    author: "Editorial Board",
    date: "Aug 18, 2026",
    readTime: "5 min read",
    image: editorialImage("sarkodie-grammy", 1200, 1500),
  },
  {
    slug: "christie-brown-ashanti-regalia-collection",
    category: "Fashion",
    title: "Christie Brown's New Collection Draws on Ashanti Royal Regalia",
    dek: "Gold-dust embroidery, kente structuring and a runway show staged like a durbar — inside the house's most ambitious season yet.",
    author: "Ama Boateng",
    date: "Aug 22, 2026",
    readTime: "6 min read",
    image: editorialImage("christie-brown-regalia", 1200, 1500),
  },
  {
    slug: "slow-fashion-accra-independent-designers",
    category: "Fashion",
    title: "The Rise of Slow Fashion Among Accra's Independent Designers",
    dek: "Made-to-order runs, deadstock fabric and a generation of designers who would rather sell fewer pieces, better.",
    author: "Selasi Tetteh",
    date: "Aug 12, 2026",
    readTime: "7 min read",
    image: editorialImage("slow-fashion-accra", 1200, 1500),
  },
  {
    slug: "shea-butter-ghanaian-brands-going-global",
    category: "Hair & Beauty",
    title: "Shea Butter, Reinvented: The Ghanaian Brands Going Global",
    dek: "From Tamale co-operatives to Sephora shelves — how three founders took the country's most exported ingredient upmarket.",
    author: "Linda Appiah",
    date: "Aug 8, 2026",
    readTime: "6 min read",
    image: editorialImage("shea-butter-brands", 1200, 1500),
  },
  {
    slug: "accra-natural-hair-salon-boom",
    category: "Hair & Beauty",
    title: "Inside Accra's Boom in Natural Hair Salons",
    dek: "A wave of new studios is betting that clients want technique and community, not just a wash-and-go.",
    author: "Adjoa Darko",
    date: "Jul 28, 2026",
    readTime: "5 min read",
    image: editorialImage("natural-hair-salons", 1200, 1500),
  },
  {
    slug: "accra-chop-bar-revival",
    category: "Lifestyle",
    title: "A Foodie's Guide to Accra's New Wave of Chop Bar Revivals",
    dek: "Waakye and red-red get a design upgrade as a new generation reopens the neighbourhood chop bar as a destination.",
    author: "Kwame Owusu",
    date: "Jul 20, 2026",
    readTime: "6 min read",
    image: editorialImage("chop-bar-revival", 1200, 1500),
  },
  {
    slug: "boutique-hotels-ghanaian-hospitality",
    category: "Lifestyle",
    title: "Inside the Boutique Hotels Redefining Ghanaian Hospitality",
    dek: "Small, design-forward properties in Accra, Kumasi and the Volta Region are rewriting what a Ghana stay looks like.",
    author: "Efua Mensah",
    date: "Jul 14, 2026",
    readTime: "5 min read",
    image: editorialImage("boutique-hotels-ghana", 1200, 1500),
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export function relatedArticles(slug: string, count = 3) {
  return articles.filter((a) => a.slug !== slug).slice(0, count);
}
