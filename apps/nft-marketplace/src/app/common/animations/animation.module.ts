import { NgModule } from "@angular/core";
import { SwanAnimationDirective } from "./animation.directive";

@NgModule({
    declarations: [SwanAnimationDirective],
    exports: [SwanAnimationDirective]
})
export class AnimationsModule {}
