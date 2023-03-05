import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UploadComponent } from "./upload.component";

import { NgxDropzoneModule } from "ngx-dropzone";

@NgModule({
    exports: [UploadComponent],
    imports: [CommonModule, NgxDropzoneModule],
    declarations: [UploadComponent]
})
export class UploadModule {}
