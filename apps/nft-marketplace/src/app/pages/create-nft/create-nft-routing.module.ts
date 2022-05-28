import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateNFTPageComponent } from "./create-nft-page/create-nft-page.component";
import { CreateNFTComponent } from "./create-nft.component";

const routes: Routes = [
    {
        path: "",
        component: CreateNFTComponent,
        children: [
            {
                path: "",
                component: CreateNFTPageComponent
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateNFTRoutingModule {}
