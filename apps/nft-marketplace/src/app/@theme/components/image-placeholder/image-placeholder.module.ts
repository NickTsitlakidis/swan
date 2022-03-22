import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ImagePlaceholderComponent } from "./image-placeholder.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@NgModule({
    imports: [CommonModule, FontAwesomeModule],
    declarations: [ImagePlaceholderComponent],
    exports: [ImagePlaceholderComponent]
})
export class ImagePlaceholderModule {}
