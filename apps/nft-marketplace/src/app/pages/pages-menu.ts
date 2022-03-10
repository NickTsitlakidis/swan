import { NbMenuItem } from "@nebular/theme";

export const MENU_ITEMS: NbMenuItem[] = [
    {
        title: "Home",
        icon: "home-outline",
        link: "/pages/home",
        home: true
    },
    {
        title: "Miscellaneous",
        icon: "shuffle-2-outline",
        children: [
            {
                title: "404",
                link: "/pages/miscellaneous/404"
            }
        ]
    }
];
