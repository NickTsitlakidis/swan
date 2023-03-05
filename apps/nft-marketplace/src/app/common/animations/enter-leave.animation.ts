import { animate, style, transition, trigger } from "@angular/animations";

export const slideRight = trigger("slideRight", [
    transition(":enter", [
        style({ transform: "translateX(100%)" }),
        animate("100ms ease-in-out", style({ transform: "translateX(0%)" }))
    ]),
    transition(":leave", [animate("100ms ease-in-out", style({ transform: "translateX(100%)" }))])
]);
export const fade = trigger("fade", [
    transition(":enter", [style({ opacity: 0 }), animate(200, style({ opacity: 1 }))]),
    transition(":leave", [animate(100, style({ opacity: 0 }))])
]);
