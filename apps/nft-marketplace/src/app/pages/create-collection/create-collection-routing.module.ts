import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateCollectionPageComponent } from "./create-collection-page/create-collection-page.component";
import { CreateCollectionComponent } from "./create-collection.component";

const routes: Routes = [
    {
        path: "",
        component: CreateCollectionComponent,
        children: [
            {
                path: "",
                component: CreateCollectionPageComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateCollectionRoutingModule {}
