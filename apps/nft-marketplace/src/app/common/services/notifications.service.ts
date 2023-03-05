import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { HttpErrorDto } from "@swan/dto";

@Injectable({ providedIn: "root" })
export class NotificationsService {
    constructor(private _messageService: MessageService) {}

    displayHttpError(error: HttpErrorDto, life = 3000) {
        this._messageService.add({
            severity: "error",
            life: life,
            summary: "HTTP error",
            detail: error.message
        });
    }

    displayError(summary: string, detail: string, life = 3000) {
        this._messageService.add({
            severity: "error",
            life: life,
            summary: summary,
            detail: detail
        });
    }
}
