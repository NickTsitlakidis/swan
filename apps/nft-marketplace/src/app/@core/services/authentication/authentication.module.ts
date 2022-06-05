import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { ChainsModule } from "../chains/chains.module";


@NgModule({
    declarations: [],
    imports: [HttpClientModule, ChainsModule]
})
export class AuthenticationModule {
}
