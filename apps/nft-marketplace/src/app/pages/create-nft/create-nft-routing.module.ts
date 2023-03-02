import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateNFTPageComponent } from "./create-nft-page.component";

const routes: Routes = [
    {
        path: "",
        component: CreateNFTPageComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CreateNFTRoutingModule {}
