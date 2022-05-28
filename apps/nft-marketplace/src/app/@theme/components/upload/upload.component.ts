import { Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from "@angular/core";
import { NgxDropzoneChangeEvent, NgxDropzoneComponent } from "ngx-dropzone";
import { BehaviorSubject } from "rxjs";

@Component({
    selector: "nft-marketplace-upload",
    templateUrl: "./upload.component.html",
    styleUrls: ["./upload.component.scss"]
})
export class UploadComponent {
    @Input() multiple = false;
    @Input() fileType = "image/*";
    @Input() disabled = false;
    @Input() hoverAnimation = false;
    @Input() hideBorder = false;
    @Input() loader = false;
    @Input() autoUpload = false;
    @Input() disableClick = true;
    @Input() showPreviewLabel = true;
    @Input() uploadMessage: string | boolean = "Drag and drop, or click to browse";
    @Input() imageUrl: string;
    @Input() imageDimensions: { width?: number; height?: number };
    @Input() imageAsBackground: boolean;
    @Input() class: string;
    @Input() width: number;
    @Input() height: number;
    @Input() maxFileSize: number;
    @Input() imageType: string;

    @Output() uploadTriggered = new EventEmitter<boolean>();
    @Output() uploadFiles = new EventEmitter<File[]>();

    public files: File[] = [];
    public isLoading = new BehaviorSubject(false);

    public backgroundBase64: string | ArrayBuffer | null;

    @ViewChild("dropzoneContainer") dropzoneContainer: NgxDropzoneComponent;

    constructor(private cd: ChangeDetectorRef) {}

    triggerUploadDialog() {
        this.dropzoneContainer?.showFileSelector();
    }

    async onSelect(event: NgxDropzoneChangeEvent | never) {
        if (event.rejectedFiles.length) {
            console.log(event.rejectedFiles);
        }
        if (!event.addedFiles.length) {
            return;
        }
        this.uploadTriggered.emit(true);
        this.files.push(...event.addedFiles);
        if (!this.multiple) {
            this.files = [this.files[this.files.length - 1]];
        }

        if (this.imageAsBackground && this.files[0]?.type?.startsWith("image")) {
            try {
                this.backgroundBase64 = await this._getBase64(this.files[0]);
            } catch (e) {
                console.log(e);
                this.backgroundBase64 = null;
            }
        } else {
            this.backgroundBase64 = null;
        }

        this.uploadFiles.emit(this.files);
        setTimeout(() => {
            this.cd.detectChanges();
        }, 200);
    }

    async onRemove(event: File | number | never, emitEvent: boolean = true) {
        if (typeof event === "number") {
            event = this.files[event];
        }
        if (this.files.indexOf(event) === -1) {
            return;
        }
        this.files.splice(this.files.indexOf(event), 1);

        if (this.imageAsBackground && this.files[0]?.type?.startsWith("image")) {
            try {
                this.backgroundBase64 = await this._getBase64(this.files[0]);
            } catch (e) {
                console.log(e);
                this.backgroundBase64 = null;
            }
        } else {
            this.backgroundBase64 = null;
        }

        this.files = [...this.files];
        if (emitEvent) {
            this.uploadFiles.emit(this.files);
        }
        this.cd.detectChanges();
    }

    clear() {
        this.files = [];
        this.uploadFiles.emit([]);
        this.cd.detectChanges();
    }

    /* ****************************************
     *            Private methods
     * ****************************************/

    public _getBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            const result = reader.result || "";
            reader.onload = () => resolve(result.toString());
            reader.onerror = (error) => reject(error);
        });
    }
}
