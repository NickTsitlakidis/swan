import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import {
    NbActionsModule,
    NbLayoutModule,
    NbMenuModule,
    NbSearchModule,
    NbSidebarModule,
    NbUserModule,
    NbContextMenuModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbThemeModule
} from "@nebular/theme";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NbEvaIconsModule } from "@nebular/eva-icons";

import { FooterComponent, HeaderComponent } from "./components";
import { CapitalizePipe, PluralPipe, RoundPipe, TimingPipe, NumberWithCommasPipe } from "./pipes";
import { OneColumnLayoutComponent } from "./layouts";

const NB_MODULES = [
    NbLayoutModule,
    NbMenuModule,
    NbUserModule,
    NbActionsModule,
    NbSearchModule,
    NbSidebarModule,
    NbContextMenuModule,
    NbButtonModule,
    NbSelectModule,
    NbIconModule,
    NbEvaIconsModule
];
const COMPONENTS = [HeaderComponent, FooterComponent, OneColumnLayoutComponent];
const PIPES = [CapitalizePipe, PluralPipe, RoundPipe, TimingPipe, NumberWithCommasPipe];

@NgModule({
    imports: [CommonModule, FormsModule, FontAwesomeModule, ...NB_MODULES],
    exports: [CommonModule, ...PIPES, ...COMPONENTS],
    declarations: [...COMPONENTS, ...PIPES]
})
export class ThemeModule {
    static forRoot(): ModuleWithProviders<ThemeModule> {
        return {
            ngModule: ThemeModule,
            providers: [
                ...(NbThemeModule.forRoot(
                    {
                        name: "cosmic"
                    },
                    []
                ).providers || [])
            ]
        };
    }
}
