export type Partner = {
  id: number;
  name: string;
  logo: { full_url: string };
  website: string;
};

// Partner logos live in public/images/partners.
export const partners: Partner[] = [
  { id: 1, name: "Scent of Africa", logo: { full_url: "/images/partners/scent-of-africa.png" }, website: "https://www.scentofafrica.com/" },
  { id: 2, name: "Consolidated Bank Ghana", logo: { full_url: "/images/partners/cbg.jpg" }, website: "https://www.cbg.com.gh/" },
  { id: 3, name: "Standard Chartered Bank", logo: { full_url: "/images/partners/standard-chartered.svg" }, website: "https://www.sc.com/gh/" },
  { id: 4, name: "Stallion Motors", logo: { full_url: "/images/partners/stallion-motors.png" }, website: "https://stalliongroup.com/" },
  { id: 5, name: "Electricity Company of Ghana", logo: { full_url: "/images/partners/ecg.png" }, website: "https://www.ecg.com.gh/" },
  { id: 6, name: "Ghana Gas", logo: { full_url: "/images/partners/ghana-gas.jpg" }, website: "https://ghanagas.com.gh/" },
  { id: 7, name: "Access Bank Ghana", logo: { full_url: "/images/partners/access-bank.png" }, website: "https://www.ghana.accessbankplc.com/" },
  { id: 8, name: "Ghana Export Promotion Authority", logo: { full_url: "/images/partners/gepa.png" }, website: "https://www.gepaghana.org/" },
  { id: 9, name: "GIADEC", logo: { full_url: "/images/partners/giadec.png" }, website: "https://giadec.com/" },
  { id: 10, name: "Darling Hair", logo: { full_url: "/images/partners/darling-hair.svg" }, website: "https://www.darlingafrica.com/ghana/" },
  { id: 11, name: "Guinness Ghana", logo: { full_url: "/images/partners/guinness-ghana.png" }, website: "https://www.guinnessghana.com/" },
  { id: 12, name: "M·A·C Cosmetics", logo: { full_url: "/images/partners/mac-cosmetics.png" }, website: "https://www.maccosmetics.com/" },
];
