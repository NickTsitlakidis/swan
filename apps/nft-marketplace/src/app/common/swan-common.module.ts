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
import { HeaderComponent } from "./components/header/header.component";
import { FooterComponent } from "./components/footer/footer.component";
import { FormsModule } from "@angular/forms";
import { MessagesModule } from "primeng/messages";
import { OnlySsrDirective } from "./directives/only-ssr.directive";
import { NoSsrDirective } from "./directives/no-ssr.directive";

const PIPES = [CapitalizePipe, PluralPipe, RoundPipe, TimingPipe, NumberWithCommasPipe];
const COMPONENTS = [HeaderComponent, FooterComponent];
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
    exports: [...PIPES, ...COMPONENTS]
})
export class SwanCommonModule {}
