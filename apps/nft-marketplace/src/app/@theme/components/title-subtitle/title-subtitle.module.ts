import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TitleSubtitleComponent } from "./title-subtitle.component";

@NgModule({
    imports: [CommonModule],
    declarations: [TitleSubtitleComponent],
    exports: [TitleSubtitleComponent]
})
export class TitleSubTitleModule {}
