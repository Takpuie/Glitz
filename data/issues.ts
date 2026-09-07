import { editorialImage } from "@/lib/img";

export type Issue = {
  slug: string;
  issueNumber: string;
  title: string;
  season: string;
  price: string;
  image: string;
  soldOut?: boolean;
};

export const currentIssue: Issue = {
  slug: "issue-118",
  issueNumber: "Issue 118",
  title: "The Power Issue",
  season: "October / November 2026",
  price: "GHS 60",
  image: editorialImage("current-issue-cover", 1000, 1300),
};

export const backIssues: Issue[] = [
  { slug: "issue-117", issueNumber: "Issue 117", title: "The Bridal Issue", season: "Aug / Sep 2026", price: "GHS 55", image: editorialImage("issue-117", 1000, 1300) },
  { slug: "issue-116", issueNumber: "Issue 116", title: "The Beauty Issue", season: "Jun / Jul 2026", price: "GHS 55", image: editorialImage("issue-116", 1000, 1300) },
  { slug: "issue-115", issueNumber: "Issue 115", title: "The GAFW Issue", season: "Apr / May 2026", price: "GHS 55", image: editorialImage("issue-115", 1000, 1300), soldOut: true },
  { slug: "issue-114", issueNumber: "Issue 114", title: "The Business Issue", season: "Feb / Mar 2026", price: "GHS 55", image: editorialImage("issue-114", 1000, 1300) },
  { slug: "issue-113", issueNumber: "Issue 113", title: "The Culture Issue", season: "Dec 2025 / Jan 2026", price: "GHS 50", image: editorialImage("issue-113", 1000, 1300) },
  { slug: "issue-112", issueNumber: "Issue 112", title: "The Anniversary Issue", season: "Oct / Nov 2025", price: "GHS 50", image: editorialImage("issue-112", 1000, 1300), soldOut: true },
];

export const subscriptionPlans = [
  {
    name: "Digital",
    price: "GHS 240",
    cadence: "/ year",
    features: ["Full digital flipbook archive", "New issue on release day", "Read on any device"],
  },
  {
    name: "Print",
    price: "GHS 480",
    cadence: "/ year",
    features: ["6 print issues delivered", "Ghana & international shipping", "Collector's cover variants"],
    highlight: true,
  },
  {
    name: "Print + Digital",
    price: "GHS 600",
    cadence: "/ year",
    features: ["Everything in Print", "Full digital archive access", "Early access to event tickets"],
  },
];
