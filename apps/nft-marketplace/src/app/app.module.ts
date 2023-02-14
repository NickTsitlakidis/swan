import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";

import { MobxAngularModule } from "mobx-angular";

@NgModule({
    imports: [
        BrowserModule.withServerTransition({ appId: "serverApp" }),
        BrowserAnimationsModule,
        HttpClientModule,
        MobxAngularModule
    ]
})
export class AppModule {}
