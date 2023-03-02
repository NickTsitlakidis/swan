import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: "swan-image-placeholder",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./image-placeholder.component.scss"],
    templateUrl: "image-placeholder.component.html"
})
export class ImagePlaceholderComponent {
    public filePath: string;
    public selectedFile: File | null;

    @Input() title: string | undefined;
    @Input() subtitle: string | undefined;
    @Output() uploadedImage = new EventEmitter();

    constructor(private _changeRef: ChangeDetectorRef) {}

    public onFileChanged(event: Event) {
        const inputImage = event.target as HTMLInputElement as HTMLInputElement;
        this.selectedFile = inputImage?.files && inputImage.files[0];
        this.uploadedImage.emit(this.selectedFile);
        const reader = new FileReader();
        reader.onload = () => {
            this.filePath = reader.result as string;
            this._changeRef.detectChanges();
        };
        reader.readAsDataURL(this.selectedFile as Blob);
    }
}
