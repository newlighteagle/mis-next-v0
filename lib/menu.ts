import { LayoutDashboard, Database } from "lucide-react";
export const items = {
  mainMenu: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      defaultOpen: true,
    },
    {
      title: "Master Data",
      url: "#",
      icon: Database,
      defaultOpen: false,
    },
  ],
};
