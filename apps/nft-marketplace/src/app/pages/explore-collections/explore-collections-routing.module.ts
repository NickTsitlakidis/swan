import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ExploreCollectionsPageComponent } from "./explore-collections-page.component";

const routes: Routes = [
    {
        path: "",
        component: ExploreCollectionsPageComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ExploreCollectionsRoutingModule {}
