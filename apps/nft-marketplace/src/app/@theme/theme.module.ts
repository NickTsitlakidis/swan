import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { FooterComponent, HeaderComponent } from "./components";
import { CapitalizePipe, PluralPipe, RoundPipe, TimingPipe, NumberWithCommasPipe } from "./pipes";
import { ImagesModule } from "../@core/services/images/images.module";
import { CascadeSelectModule } from "primeng/cascadeselect";
import { ButtonModule } from "primeng/button";
import { MessageService } from "primeng/api";
import { MenuModule } from "primeng/menu";

const PRIME_NG_MODULES = [CascadeSelectModule, ButtonModule];
const COMPONENTS = [HeaderComponent, FooterComponent];
const PIPES = [CapitalizePipe, PluralPipe, RoundPipe, TimingPipe, NumberWithCommasPipe];

@NgModule({
    imports: [CommonModule, FormsModule, ImagesModule, ...PRIME_NG_MODULES, MenuModule],
    exports: [CommonModule, ...PIPES, ...COMPONENTS],
    declarations: [...COMPONENTS, ...PIPES],
    providers: [MessageService]
})
export class ThemeModule {
    static forRoot(): ModuleWithProviders<ThemeModule> {
        return {
            ngModule: ThemeModule,
            providers: []
        };
    }
}
