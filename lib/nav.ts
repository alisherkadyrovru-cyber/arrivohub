import type { NavItem } from "@/components/Sidebar";

export const agencyNav: NavItem[] = [
  { href: "/agency", label: "Home" },
  {
    label: "Active requests",
    children: [
      { href: "/agency/requests/pending", label: "Pending" },
      { href: "/agency/requests/confirmed", label: "Confirmed" },
    ],
  },
  { href: "/agency/requests/archive", label: "Archived requests" },
  { href: "/agency/find", label: "Find Assistant/Guide" },
  { href: "/agency/favorites", label: "My Favorites" },
  { href: "/agency/credits", label: "Credits" },
  { href: "/agency/statistics", label: "Statistics", disabled: true },
  { href: "/agency/profile", label: "Profile" },
];

export const assistantNav: NavItem[] = [
  { href: "/assistant", label: "Home" },
  {
    label: "Active requests",
    children: [
      { href: "/assistant/requests/pending", label: "Pending" },
      { href: "/assistant/requests/confirmed", label: "Confirmed" },
    ],
  },
  { href: "/assistant/requests/archive", label: "Archived requests" },
  { href: "/assistant/subscription", label: "Subscription" },
  { href: "/assistant/statistics", label: "Statistics", disabled: true },
  { href: "/assistant/profile", label: "Profile" },
];

export const guideNav: NavItem[] = [
  { href: "/guide", label: "Home" },
  {
    label: "Active requests",
    children: [
      { href: "/guide/requests/pending", label: "Pending" },
      { href: "/guide/requests/confirmed", label: "Confirmed" },
    ],
  },
  { href: "/guide/requests/archive", label: "Archived requests" },
  { href: "/guide/subscription", label: "Subscription" },
  { href: "/guide/statistics", label: "Statistics", disabled: true },
  { href: "/guide/profile", label: "Profile" },
];
