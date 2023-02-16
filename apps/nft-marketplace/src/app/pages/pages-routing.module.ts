import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";

import { PagesComponent } from "./pages.component";
import { NotFoundComponent } from "./miscellaneous/not-found/not-found.component";
import { AuthGuard } from "../@core/guards/user-auth.guard";

const routes: Routes = [
    {
        path: "",
        component: PagesComponent,
        children: [
            {
                path: "home",
                loadChildren: () => import("./home/home.module").then((m) => m.HomeModule)
            },
            {
                path: "profile",
                canActivate: [AuthGuard],
                loadChildren: () => import("./profile/profile.module").then((m) => m.ProfileModule)
            },
            {
                path: "create-collection",
                canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./create-collection/create-collection-page.module").then(
                        (m) => m.CreateCollectionPageModule
                    )
            },
            {
                path: "create-nft",
                canActivate: [AuthGuard],
                loadChildren: () => import("./create-nft/create-nft.module").then((m) => m.CreateNFTModule)
            },
            {
                path: "create-listing",
                canActivate: [AuthGuard],
                loadChildren: () => import("./create-listing/create-listing.module").then((m) => m.CreateListingModule)
            },
            {
                path: "miscellaneous",
                loadChildren: () => import("./miscellaneous/miscellaneous.module").then((m) => m.MiscellaneousModule)
            },
            {
                path: "",
                redirectTo: "home",
                pathMatch: "full"
            },
            {
                path: "**",
                component: NotFoundComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {}
