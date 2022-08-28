import { NbMenuItem } from "@nebular/theme";

export const MENU_ITEMS: NbMenuItem[] = [
    {
        title: "Home",
        icon: "home-outline",
        link: "/home",
        home: true
    },
    {
        title: "Create collection",
        link: "/create-collection"
    },
    {
        title: "Create nft",
        link: "/create-nft"
    },
    {
        title: "Create listing",
        link: "/create-listing"
    },
    {
        title: "Miscellaneous",
        icon: "shuffle-2-outline",
        children: [
            {
                title: "404",
                link: "/miscellaneous/404"
            }
        ]
    }
];
