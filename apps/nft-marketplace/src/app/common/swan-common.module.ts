import { NgModule } from "@angular/core";
import { ContractFactory } from "@swan/contracts";
import { CapitalizePipe, NumberWithCommasPipe, PluralPipe, RoundPipe, TimingPipe } from "./pipes";
import { CascadeSelectModule } from "primeng/cascadeselect";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { MobxAngularModule } from "mobx-angular";
import { ProgressBarModule } from "primeng/progressbar";
import { CommonModule } from "@angular/common";
import { MessageService } from "primeng/api";
import { FooterComponent } from "./components/footer/footer.component";
import { FormsModule } from "@angular/forms";
import { MessagesModule } from "primeng/messages";
import { HttpProgressBarComponent } from "./components/http-progress-bar/http-progress-bar.component";
import { OnlySsrDirective } from "./directives/only-ssr.directive";
import { NoSsrDirective } from "./directives/no-ssr.directive";
import { VolumePipe } from "./pipes/volume.pipe";

const PIPES = [CapitalizePipe, PluralPipe, RoundPipe, TimingPipe, NumberWithCommasPipe, VolumePipe];
const COMPONENTS = [FooterComponent, HttpProgressBarComponent];
@NgModule({
    imports: [
        FormsModule,
        CascadeSelectModule,
        ButtonModule,
        MenuModule,
        MobxAngularModule,
        ProgressBarModule,
        CommonModule,
        MessagesModule
    ],
    providers: [
        MessageService,
        {
            provide: ContractFactory,
            useValue: new ContractFactory()
        }
    ],
    declarations: [...PIPES, ...COMPONENTS, OnlySsrDirective, NoSsrDirective],
    exports: [...PIPES, ...COMPONENTS, NoSsrDirective, OnlySsrDirective]
})
export class SwanCommonModule {}
