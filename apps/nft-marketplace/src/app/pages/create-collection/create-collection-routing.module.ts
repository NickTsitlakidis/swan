import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateCollectionPageComponent } from "./create-collection-page.component";

const routes: Routes = [
    {
        path: "",
        component: CreateCollectionPageComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateCollectionRoutingModule {}
