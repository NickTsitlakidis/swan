import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ImagesModule } from "./images.module";

@Injectable({
    providedIn: ImagesModule
})
export class ImagesService {
    constructor(private sanitizer: DomSanitizer) {}

    transform(base64Image: string) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(base64Image);
    }
}
