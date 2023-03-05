import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ImagePlaceholderComponent } from "./image-placeholder.component";

@NgModule({
    imports: [CommonModule],
    declarations: [ImagePlaceholderComponent],
    exports: [ImagePlaceholderComponent]
})
export class ImagePlaceholderModule {}
