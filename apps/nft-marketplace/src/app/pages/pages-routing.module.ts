import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";

import { PagesComponent } from "./pages.component";
import { NotFoundComponent } from "./miscellaneous/not-found/not-found.component";

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
                path: "create-collection",
                loadChildren: () =>
                    import("./create-collection/create-collection.module").then((m) => m.CreateCollectionModule)
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
