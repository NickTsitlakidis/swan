import { NgModule } from "@angular/core";

import { MobxAngularModule } from "mobx-angular";
import { ExploreCollectionsPageComponent } from "./explore-collections-page.component";
import { CollectionItemComponent } from "./collection-item/collection-item.component";
import { CommonModule } from "@angular/common";
import { ExploreCollectionsRoutingModule } from "./explore-collections-routing.module";
import { CardModule } from "primeng/card";
import { SwanCommonModule } from "../../common/swan-common.module";

@NgModule({
    imports: [MobxAngularModule, CommonModule, ExploreCollectionsRoutingModule, CardModule, SwanCommonModule],
    declarations: [ExploreCollectionsPageComponent, CollectionItemComponent],
    providers: []
})
export class ExploreCollectionsPageModule {}
