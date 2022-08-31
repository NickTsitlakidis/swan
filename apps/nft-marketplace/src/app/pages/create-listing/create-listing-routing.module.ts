import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateListingPageComponent } from "./create-listing-page/create-listing-page.component";
import { CreateListingComponent } from "./create-listing.component";

const routes: Routes = [
    {
        path: "",
        component: CreateListingComponent,
        children: [
            {
                path: "",
                component: CreateListingPageComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateListingRoutingModule {}
