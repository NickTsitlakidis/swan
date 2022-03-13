import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Injectable({
    providedIn: "root"
})
export class ImagesService {
    constructor(private sanitizer: DomSanitizer) {}

    transform(base64Image: string) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(base64Image);
    }
}
