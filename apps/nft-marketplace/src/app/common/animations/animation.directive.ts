import { AnimationBuilder, AnimationPlayer } from "@angular/animations";
import { AfterViewInit, Directive, ElementRef, Input, OnChanges } from "@angular/core";
import { SwanAnimations } from "./animation";

@Directive({
    selector: `[swanAnimation]`
})
export class SwanAnimationDirective implements AfterViewInit, OnChanges {
    player: AnimationPlayer | undefined;
    private eleAnimations = "";
    private textAnimations = "";
    private viewInitialized = false;

    @Input()
    set animation(elementAnimation: string) {
        if (elementAnimation) {
            this.eleAnimations = elementAnimation;
        }
    }

    @Input()
    set textAnimation(textAnimation: string) {
        if (textAnimation) {
            this.textAnimations = textAnimation;
        }
    }

    constructor(private builder: AnimationBuilder, private el: ElementRef) {}

    ngAfterViewInit() {
        this.viewInitialized = true;
        this.animate();
    }

    ngOnChanges() {
        if (this.viewInitialized) {
            this.animate();
        }
    }

    animate() {
        if (this.eleAnimations) {
            if (this.player) {
                this.player.destroy();
            }
            if (SwanAnimations[this.eleAnimations]) {
                const metadata = SwanAnimations[this.eleAnimations];
                const factory = this.builder.build(metadata);
                const player = factory.create(this.el.nativeElement);
                player.play();
            } else {
                throw new Error(`Inavild animation  ${this.eleAnimations}`);
            }
        }

        if (this.textAnimations) {
            if (this.player) {
                this.player.destroy();
            }
            if (SwanAnimations[this.textAnimations]) {
                const metadata = SwanAnimations[this.textAnimations];
                const factory = this.builder.build(metadata);
                const player = factory.create(this.el.nativeElement);
                player.play();
            } else {
                throw new Error(`Inavild animation  ${this.textAnimations}`);
            }
        }
    }
}
