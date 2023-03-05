import { Directive, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { PlatformUtils } from "../utils/platform-utils";

@Directive({
    selector: "[swanOnlySsr]"
})
export class OnlySsrDirective implements OnInit {
    constructor(
        private _viewContainer: ViewContainerRef,
        private _templateRef: TemplateRef<unknown>,
        private _platformUtils: PlatformUtils
    ) {}

    ngOnInit(): void {
        if (this._platformUtils.isServer) {
            this._viewContainer.createEmbeddedView(this._templateRef);
        } else {
            this._viewContainer.clear();
        }
    }
}
