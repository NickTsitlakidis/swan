import { Component } from "@angular/core";

@Component({
    selector: "swan-footer",
    styleUrls: ["./footer.component.scss"],
    template: `
        <div class="footer-container">
            <div class="socials">
                <a href="#" target="_blank" class="ion ion-social-github"></a>
                <a href="#" target="_blank" class="ion ion-social-facebook"></a>
                <a href="#" target="_blank" class="ion ion-social-twitter"></a>
                <a href="#" target="_blank" class="ion ion-social-linkedin"></a>
            </div>
        </div>
    `
})
export class FooterComponent {}
