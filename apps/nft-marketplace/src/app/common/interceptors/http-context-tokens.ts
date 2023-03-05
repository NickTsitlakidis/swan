import { HttpContextToken } from "@angular/common/http";

export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);
export const SKIP_RETRY = new HttpContextToken<boolean>(() => false);
