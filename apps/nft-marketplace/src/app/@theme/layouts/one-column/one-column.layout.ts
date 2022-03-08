import { Component } from "@angular/core";

@Component({
    selector: "nft-marketplace-one-column-layout",
    styleUrls: ["./one-column.layout.scss"],
    template: `
        <nb-layout>
            <nb-layout-header fixed>
                <nft-marketplace-header></nft-marketplace-header>
            </nb-layout-header>

            <!-- <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive>
                <ng-content select="nb-menu"></ng-content>
            </nb-sidebar> -->

            <nb-layout-column>
                <ng-content select="router-outlet"></ng-content>
            </nb-layout-column>

            <nb-layout-footer fixed>
                <nft-marketplace-footer></nft-marketplace-footer>
            </nb-layout-footer>
        </nb-layout>
    `
})
export class OneColumnLayoutComponent {}
