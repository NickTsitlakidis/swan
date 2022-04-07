import { Injectable } from "@angular/core";
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { AvailabilityDto } from "@nft-marketplace/common";
import { debounceTime, distinctUntilChanged, map, Observable } from "rxjs";
import { CollectionsService } from "../../../@core/services/collections/collections.service";

@Injectable()
export class ValidateUrl {
    static validateUrl(_collectionsService: CollectionsService): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> | any => {
            if (control.value === null || !control.value) {
                return {};
            }
            return _collectionsService.validateCollectionUrl(control.value).pipe(
                // get value
                map((event: AvailabilityDto) => {
                    if (event.isAvailable) {
                        return {};
                    } else {
                        return { invalidUrl: true };
                    }
                }),
                // Time in milliseconds between key events
                debounceTime(500),
                // If previous query is diffent from current
                distinctUntilChanged()
            );
        };
    }
}

@Injectable()
export class ValidateName {
    static validateName(_collectionsService: CollectionsService): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            return _collectionsService.validateCollectionName(control.value).pipe(
                // get value
                map((event: AvailabilityDto) => {
                    if (event.isAvailable) {
                        return {};
                    } else {
                        return { invalidName: true };
                    }
                }),
                // Time in milliseconds between key events
                debounceTime(500),
                // If previous query is diffent from current
                distinctUntilChanged()
            );
        };
    }
}
