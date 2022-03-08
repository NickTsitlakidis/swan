import { Component } from "@angular/core";

import { MENU_ITEMS } from "./pages-menu";

@Component({
    selector: "nft-marketplace-pages",
    styleUrls: ["pages.component.scss"],
    template: `
        <nft-marketplace-one-column-layout>
            <nb-menu [items]="menu"></nb-menu>
            <router-outlet></router-outlet>
        </nft-marketplace-one-column-layout>
    `
})
export class PagesComponent {
    menu = MENU_ITEMS;
}
