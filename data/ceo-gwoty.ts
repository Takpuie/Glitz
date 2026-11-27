// Content for the Ghana Female CEO Summit and Ghana Women of the Year Honours
// pages. Source: "CEO & GWOTYH BRIEF 2027.pdf". Photos: AIMS Fotography
// galleries of the 2026 edition.

const CEO = "/images/ceo-summit";
const GW = "/images/gwoty";

export const CEO_EMAIL = "femaleceosummit@glitzafrica.com";
export const CEO_PHONE = "+233 501 581 266";

export const edition2027 = {
  dates: "28–30 April 2027",
  venue: "Kempinski Hotel Gold Coast City, Accra",
  title: "Ghana Female CEO Summit & Ghana Women of the Year Honours",
  focus:
    "The 2027 edition expands its focus on the opportunities emerging from Africa's increasingly integrated economy, with particular emphasis on women-led businesses, trade, investment, innovation, technology, industrialisation, market expansion and regional competitiveness.",
};

export type ProgrammeDay = {
  day: string;
  date: string;
  title: string;
  time?: string;
  copy: string;
  href?: string;
};

export const programme2027: ProgrammeDay[] = [
  {
    day: "Day 1",
    date: "Wednesday 28 April 2027",
    title: "Business Owners Breakfast Forum",
    copy: "An exclusive breakfast for around 100–150 of Ghana's leading founders and business owners, women and men, meeting financiers, investors, capital-market institutions and strategic partners on scaling businesses across Ghana and Africa.",
  },
  {
    day: "Day 2",
    date: "Thursday 29 April 2027",
    title: "Ghana Female CEO Summit",
    copy: "The foremost leadership conference for women in executive and entrepreneurial roles, bringing together over 1,000 CEOs, policymakers, financiers, investors and development partners.",
  },
  {
    day: "Day 3",
    date: "Friday 30 April 2027",
    time: "Morning",
    title: "Deal Room & Executive Masterclasses",
    copy: "A structured Deal Room connecting entrepreneurs and SME owners with investors and partners, alongside deep-dive masterclasses with practical frameworks, case studies and toolkits.",
  },
  {
    day: "Day 3",
    date: "Friday 30 April 2027",
    time: "Evening gala",
    title: "Ghana Women of the Year Honours",
    copy: "The red tie gala celebrating exceptional Ghanaian women, with an awards ceremony, musical performances and a curated dining experience.",
    href: "/events/gwoty",
  },
];

// --- Ghana Female CEO Summit -------------------------------------------------

export const summitIntro = [
  "The Ghana Female CEO Summit & Ghana Women of the Year Honours is a premier platform dedicated to advancing women's leadership, enterprise development, innovation and economic participation across Ghana and Africa.",
  "The Summit is the foremost female leadership and empowerment conference for women in executive and entrepreneurial roles: a dynamic platform for dialogue, collaboration and knowledge-sharing that brings together over 1,000 participants every year.",
];

export const summitStats = [
  { figure: "1,000+", label: "Participants every year" },
  { figure: "11", label: "Years convening women leaders" },
  { figure: "3", label: "Days of programme in 2027" },
  { figure: "100,000+", label: "Digital impressions" },
];

export const focusAreas = [
  { title: "Access to Finance", copy: "Exploring financing models and investment mechanisms for women-led enterprises." },
  { title: "Innovation and Growth", copy: "Leveraging technology and creativity to scale businesses." },
  { title: "Leadership and Governance", copy: "Strengthening corporate culture and board-level inclusion." },
  { title: "Policy and Partnerships", copy: "Advancing gender-responsive business ecosystems." },
];

export const keyHighlights = [
  { title: "Opening Ceremony & Keynote Address", copy: "Delivered by a distinguished African leader." },
  { title: "Fireside Chats", copy: "Intimate conversations with pioneering CEOs." },
  { title: "Panel Discussions", copy: "Deep dives into finance, trade, sustainability and enterprise growth." },
  { title: "Young Female Entrepreneurs Masterclass", copy: "A pre-summit initiative with financial institutions providing mentorship, access to funding and leadership training." },
  { title: "Networking Cocktail", copy: "A closing engagement to facilitate collaboration among participants and partners." },
];

export const dealRoom = {
  title: "Deal Room",
  copy: [
    "A focused business engagement and investment platform connecting selected entrepreneurs, SME owners, business leaders and investors with potential financing, investment and strategic partnership opportunities.",
    "Businesses present their ventures, discuss growth strategies and explore opportunities for investment, expansion and commercial collaboration.",
  ],
};

export type Masterclass = {
  title: string;
  subtitle: string;
  focus: string;
  audience: string;
  objectives: string[];
  image: string;
  /** CSS object-position for the card crop; defaults to "center 22%". */
  position?: string;
};

export const masterclasses: Masterclass[] = [
  {
    title: "Real Estate",
    subtitle: "Building the Future: Sustainable Cities",
    focus: "Understanding the basics of real estate, exploring investment opportunities and promoting sustainable urban development.",
    audience: "Real estate developers, urban planners, architects, policymakers and infrastructure investors.",
    objectives: [
      "Address housing deficits and promote green construction.",
      "Encourage women's participation in infrastructure development.",
      "Build frameworks for sustainable cities.",
    ],
    image: `${CEO}/masterclass-real-estate.jpg`,
  },
  {
    title: "Energy and Mining",
    subtitle: "Powering Sustainable Businesses",
    focus: "Green energy solutions and good mining practices that protect the environment while driving industrial growth.",
    audience: "Energy companies, mining firms, ESG specialists, policymakers, investors and women-led enterprises in extractives.",
    objectives: ["Women leaders advancing Africa's energy transition and promoting responsible mining for sustainability."],
    image: `${CEO}/masterclass-keynote.jpg`,
  },
  {
    title: "Fintech, AI & Cybersecurity",
    subtitle: "Safeguarding Growth in Uncertain Markets",
    focus: "Women leveraging fintech and cybersecurity to strengthen resilience, competitiveness and trust in uncertain markets.",
    audience: "Banks, fintech startups, SMEs, investors, regulators, trade finance institutions and women-led enterprises.",
    objectives: [
      "Equip businesses to integrate fintech and cybersecurity solutions into operations.",
      "Explore digital readiness, risk management and competitive advantage through secure technology adoption.",
      "Strengthen governance, compliance and investor confidence with secure, tech-enabled reporting.",
    ],
    image: `${CEO}/masterclass-fintech.jpg`,
  },
  {
    title: "Manufacturing, Agribusiness, Trade & Industry",
    subtitle: "From Raw Material to Global Brand",
    focus: "Producing export-ready goods and exploring the opportunities of Africa's single market under AfCFTA.",
    audience: "Agribusiness leaders, manufacturers, exporters, trade policymakers, logistics firms and commodity exchanges.",
    objectives: [
      "Optimise agribusiness and manufacturing value chains for export readiness.",
      "Explore the opportunities of Africa's single market.",
      "Integrate climate-smart and gender-inclusive practices.",
    ],
    image: `${CEO}/masterclass-trade-industry.jpg`,
    position: "center 45%",
  },
];

export const summit2026 = {
  heading: "Women Driving Sustainable Businesses for a Resilient Africa",
  meta: "7–8 May 2026 · Kempinski Hotel Gold Coast City, Accra",
  paragraphs: [
    "The 2026 edition convened an exceptional community of CEOs, policymakers, government officials, diplomats, investors, entrepreneurs, development partners and industry leaders for dialogue, knowledge exchange, strategic networking and practical business development.",
    "A major component was the Executive Masterclass Sessions, delivering sector-specific learning across AI & Technology; Trade, Manufacturing & Industry; and Real Estate & Infrastructure, from artificial intelligence, fintech and export readiness to intra-African trade, sustainable urban development and infrastructure investment.",
  ],
  distinguished: [
    "H.E. Ellen Johnson Sirleaf, Former President of Liberia",
    "H.E. Dr. Jewel Howard-Taylor, Former Vice President of Liberia",
    "Hon. Julius Debrah, Chief of Staff, Office of the President (Special Guest of Honour and Keynote Speaker)",
    "Hon. Elizabeth Ofosu-Adjare, Minister for Trade, Agribusiness and Industry",
    "Hon. Sylvester A. Mensah, CEO, Ghana Export-Import Bank",
    "Mrs. Matilda Asante-Asiedu, Second Deputy Governor, Bank of Ghana",
    "Mrs. Emily Mburu-Ndoria, Director of Trade in Services",
    "Rev. Dr. Joyce Aryee, Executive Director, Salt and Light Ministries",
  ],
};

export const partners2026 = [
  "KGL Group", "Ghana Export-Import Bank", "Consolidated Bank Ghana", "Telecel Ghana",
  "Ghana Export Promotion Authority", "Scent of Africa", "Devtraco Group", "Ghana Tourism Authority", "Stanbic Bank",
];
export const mediaPartners2026 = ["Joy FM", "MX24", "Pulse Ghana"];

export type Person = { name: string; role: string };

export const pastGuestsOfHonour: Person[] = [
  { name: "H.E. Ellen Johnson Sirleaf", role: "Former President, Liberia" },
  { name: "Dr. Mahamudu Bawumia", role: "Former Vice President of Ghana" },
  { name: "Hon. Frema Osei Opare", role: "Former Chief of Staff, Republic of Ghana" },
  { name: "Hon. Julius Debrah", role: "Chief of Staff to the President of Ghana" },
  { name: "Hon. Elizabeth Ofosu-Adjare (MP)", role: "Minister for Trade, Agribusiness and Industry" },
  { name: "Nana Oye Bampoe Addo", role: "Deputy Chief of Staff, Office of the President" },
  { name: "Rev. Dr. Joyce Aryee", role: "Executive Director, Salt & Light Ministries" },
  { name: "Matilda Asante-Asiedu", role: "2nd Deputy Governor, Bank of Ghana" },
  { name: "Hon. Sylvester Mensah", role: "CEO, Ghana Exim Bank" },
  { name: "Mr. Alex Apau Dadey", role: "Executive Chairman, KGL Group" },
  { name: "Dr. David Wilfred Ochan", role: "UNFPA Country Director" },
];

export const pastSpeakers: Person[] = [
  { name: "Patricia Obo-Nai", role: "CEO, Telecel Ghana" },
  { name: "Mrs. Abena Osei-Poku", role: "MD & Regional Executive, Ecobank Ghana PLC (AWA)" },
  { name: "Dr. Elsie Awadzi", role: "Former Deputy Governor, Bank of Ghana" },
  { name: "Angela Kyerematen-Jimoh", role: "Founder & CEO, BrainWave AfricaTech" },
  { name: "Beatrice Tayui", role: "CEO, Cybele Energy Ltd" },
  { name: "Gillian Darko", role: "Vice President, Strategy, Yellow Card" },
  { name: "Pearl Nkrumah", role: "Executive Director & Head, Retail & Digital Africa" },
  { name: "H.E. Grace Jeanette Mason", role: "Former South African Ambassador to Ghana" },
  { name: "Kate Quartey-Papafio", role: "CEO, Reroy Group" },
  { name: "Dr. Afua Asabea Asare", role: "Former CEO, GEPA" },
  { name: "Ing. Carlien Bou Chedid", role: "Structural Engineer" },
  { name: "H.E. Anne Sophie Avé", role: "Former French Ambassador to Ghana" },
  { name: "Estelle Akofio-Sowah", role: "Managing Director, CSquared West Africa" },
];

/**
 * The brief's "proposed" 2027 guests and speakers are NOT confirmed, so they
 * are kept out of the public pages. Set to true once confirmed (and trim the
 * list to the people who have accepted).
 */
export const SHOW_PROPOSED_SPEAKERS = false;
export const proposedSpeakers2027: Person[] = [];

export const whyPartner = [
  { title: "High-Level Visibility", copy: "Engage with over 1,000 CEOs, policymakers, investors and global development partners." },
  { title: "Strategic Brand Positioning", copy: "Align your brand with Ghana's most credible leadership and empowerment platforms." },
  { title: "Media Reach", copy: "Over 100,000 digital impressions and extensive coverage across print, TV and online platforms." },
  { title: "Proven Impact", copy: "Over a decade of transformative storytelling, empowerment and corporate partnerships." },
  { title: "Cross-Sector Engagement", copy: "Access to leaders across finance, trade, health, technology and the creative industries." },
];

export type Photo = { src: string; alt: string; caption?: string; wide?: boolean };

export const summitImages = {
  hero: `${CEO}/speakers-on-stage.jpg`,
  intro: `${CEO}/opening-address.jpg`,
  breakfast: `${CEO}/registration.jpg`,
  summitDay: `${CEO}/main-stage.jpg`,
  dealRoom: `${CEO}/masterclass-roundtable.jpg`,
  focus: `${CEO}/delegate-portrait.jpg`,
  partner: `${CEO}/women-leaders-group.jpg`,
};

export const summitGallery: Photo[] = [
  { src: `${CEO}/guest-of-honour-sirleaf.jpg`, alt: "H.E. Ellen Johnson Sirleaf introduced as Special Guest of Honour", caption: "Special Guest of Honour, H.E. Ellen Johnson Sirleaf", wide: true },
  { src: `${CEO}/panelist-speaking.jpg`, alt: "A panellist speaking on stage" },
  { src: `${CEO}/sirleaf-keynote.jpg`, alt: "H.E. Ellen Johnson Sirleaf at the podium", caption: "H.E. Ellen Johnson Sirleaf" },
  { src: `${CEO}/trade-panel.jpg`, alt: "Panel on expanding trade opportunities and market access for women-led enterprises", caption: "Expanding Trade Opportunities & Market Access", wide: true },
  { src: `${CEO}/panelist-portrait.jpg`, alt: "A panellist on the summit stage" },
  { src: `${CEO}/guest-of-honour-debrah.jpg`, alt: "Hon. Julius Debrah introduced as Special Guest of Honour", caption: "Special Guest of Honour, Hon. Julius Debrah", wide: true },
  { src: `${CEO}/delegates-at-table.jpg`, alt: "Delegates in the summit hall" },
  { src: `${CEO}/summit-family-photo.jpg`, alt: "Speakers and guests on stage at the 2026 summit", caption: "The 2026 summit family photo", wide: true },
  { src: `${CEO}/speakers-group.jpg`, alt: "Speakers gathered on stage", wide: true },
  { src: `${CEO}/panel-discussion.jpg`, alt: "Panel discussion on the main stage", wide: true },
  { src: `${CEO}/masterclass-trade-room.jpg`, alt: "Trade & Industry masterclass in session", caption: "Trade & Industry masterclass" },
  { src: `${CEO}/masterclass-conversation.jpg`, alt: "A conversation at the masterclass" },
  { src: `${CEO}/masterclass-networking.jpg`, alt: "Networking between masterclass sessions", wide: true },
];

// --- Ghana Women of the Year Honours ------------------------------------------

export const gwoty = {
  name: "Ghana Women of the Year Honours",
  short: "GWOTYH",
  edition: "10th edition",
  when: "Friday 30 April 2027 · Evening gala",
  venue: "Kempinski Hotel Gold Coast City, Accra",
  dressCode: "Red tie",
  intro:
    "The Ghana Women of the Year Honours is a red tie evening that celebrates exceptional Ghanaian women whose achievements have significantly impacted their industries and communities. Now in its 10th edition, the Honours continues to recognise women who embody leadership, vision and service, inspiring future generations to excel in their chosen fields.",
  evening:
    "The evening features an inspiring awards ceremony, musical performances and a curated dining experience celebrating the brilliance and resilience of Ghanaian women leaders.",
  recap2026:
    "The 2026 Honours brought together more than 500 distinguished guests to celebrate exceptional women whose achievements are contributing to Ghana's national development and Africa's transformation, recognising outstanding achievement across governance, business, public service, education, health, hospitality, media, humanitarian work, activism, creative arts and emerging leadership.",
};

export const awardCategories = [
  "Woman of the Year", "Lifetime Achievement", "Corporate Personality", "Activist of the Year",
  "Excellence in Business", "Excellence in Education", "Excellence in Health", "Excellence in Technology",
  "Excellence in Media", "Excellence in Governance", "Excellence in Hospitality", "Excellence in Creative Arts",
  "Humanitarian of the Year", "Young Star",
];

export const gwotyAudience = [
  "Corporate executives and entrepreneurs",
  "Policymakers and diplomats",
  "Development partners and donors",
  "Influencers, media and cultural icons",
];

export const pastHonourees: Person[] = [
  { name: "H.E. Rebecca Akufo-Addo", role: "Woman of the Year 2024" },
  { name: "The Late Nana Konadu Agyeman-Rawlings", role: "Lifetime Achievement 2024" },
  { name: "Tucci Goka Ivowi", role: "Excellence in Public Service 2024" },
  { name: "Patience Akyianu", role: "Corporate Personality of the Year 2023" },
  { name: "Prof. Nana Aba Appiah Amfo", role: "Excellence in Education 2023" },
  { name: "Yvette Adounvo Atekpe", role: "Excellence in Technology 2023" },
  { name: "H.E. Ellen Johnson Sirleaf", role: "Woman of the Year, Africa" },
  { name: "Rev. Dr. Joyce Aryee", role: "Lifetime Achievement" },
  { name: "Shirley Ayorkor Botchwey", role: "Excellence in Governance" },
  { name: "Nana Oye Bampoe Addo", role: "Excellence in Governance" },
  { name: "Dr. Charlotte Osafo", role: "Excellence in Health" },
  { name: "Mrs. Matilda Asante-Asiedu", role: "2nd Deputy Governor, Bank of Ghana" },
  { name: "Patricia Obo-Nai", role: "CEO, Telecel Ghana" },
  { name: "Mrs. Abena Osei-Poku", role: "MD & Regional Executive, Ecobank Ghana PLC (AWA)" },
];

export const gwotyImages = {
  hero: `${GW}/honourees-on-stage.jpg`,
  intro: `${GW}/red-carpet-silver.jpg`,
  evening: `${GW}/live-performance.jpg`,
  dinner: `${GW}/gala-dinner.jpg`,
  closing: `${GW}/honourees-celebrate.jpg`,
};

/** Award moments from the 2026 gala; captions are the categories shown on stage. */
export const gwotyAwardMoments: Photo[] = [
  { src: `${GW}/citation-presentation.jpg`, alt: "A citation presented on stage at the 2026 Honours", caption: "Presenting a citation" },
  { src: `${GW}/corporate-personality.jpg`, alt: "Corporate Personality of the Year presentation", caption: "Corporate Personality of the Year" },
  { src: `${GW}/excellence-governance.jpg`, alt: "Excellence in Governance presentation", caption: "Excellence in Governance" },
  { src: `${GW}/lifetime-achievement.jpg`, alt: "Lifetime Achievement presentation", caption: "Lifetime Achievement" },
  { src: `${GW}/humanitarian.jpg`, alt: "Humanitarian of the Year presentation", caption: "Humanitarian of the Year" },
  { src: `${GW}/excellence-hospitality.jpg`, alt: "Excellence in Hospitality presentation", caption: "Excellence in Hospitality" },
  { src: `${GW}/activist-of-the-year.jpg`, alt: "Activist of the Year presentation", caption: "Activist of the Year" },
  { src: `${GW}/excellence-creative-arts.jpg`, alt: "Excellence in Creative Arts presentation", caption: "Excellence in Creative Arts" },
  { src: `${GW}/young-star.jpg`, alt: "Young Star award presentation", caption: "Young Star" },
];

export const gwotyRedCarpet: Photo[] = [
  { src: `${GW}/red-carpet-blue.jpg`, alt: "A guest on the Women of the Year red carpet" },
  { src: `${GW}/red-carpet-pair.jpg`, alt: "Two guests on the red carpet" },
  { src: `${GW}/red-carpet-kente.jpg`, alt: "A guest in kente on the red carpet" },
  { src: `${GW}/red-carpet-portrait.jpg`, alt: "A guest portrait at the Honours" },
  { src: `${GW}/gala-guest.jpg`, alt: "A guest at the gala dinner" },
  { src: `${GW}/gala-address.jpg`, alt: "An address from the Honours podium" },
];
