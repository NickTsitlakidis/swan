import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { environment } from "./environments/environment";
import { AppBrowserModule } from "./app/app.browser.module";

if (environment.production) {
    enableProdMode();
}

function bootstrap() {
    platformBrowserDynamic()
        .bootstrapModule(AppBrowserModule)
        .catch((err) => console.error(err));
}

if (document.readyState === "complete") {
    bootstrap();
} else {
    document.addEventListener("DOMContentLoaded", bootstrap);
}
