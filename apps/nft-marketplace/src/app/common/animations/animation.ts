import { style, animate, keyframes, AUTO_STYLE, AnimationAnimateMetadata } from "@angular/animations";

/**********  Entries Animations ********************/

export const SwanAnimations: { [key: string]: AnimationAnimateMetadata } = {};

/* SwanAnimations["scale_in_top"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "scale(0)", transformOrigin: "50% 0%" }),
        style({ transform: "scale(1)", transformOrigin: "50% 0%", opacity: 1 })
    ])
);

SwanAnimations["scale_in_hor_center"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "scaleX(0)" }),
        style({ transform: "scaleX(1)", opacity: 1 })
    ])
);

SwanAnimations["scale_in_ver_center"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "scaleY(0)" }),
        style({ transform: "scaleY(1)", opacity: 1 })
    ])
);

SwanAnimations["rotate_animation"] = animate(
    "0.6s",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "rotate(-90deg)" }),
        style({ transform: "rotate(0)", opacity: 1 })
    ])
);

SwanAnimations["swirl_fwd"] = animate(
    "0.6s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "rotate(-540deg) scale(0)" }),
        style({ transform: "rotate(0) scale(1)", opacity: 1 })
    ])
);

SwanAnimations["swirl_back"] = animate(
    "0.7s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "rotate(540deg) scale(5)" }),
        style({ transform: "rotate(0) scale(1)", opacity: 1 })
    ])
);

SwanAnimations["flip_in"] = animate(
    "0.5s",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "rotateX(80deg)" }),
        style({ transform: "rotateX(0)", opacity: 1 })
    ])
);

SwanAnimations["slit_in_ver"] = animate(
    "1s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateZ(-800px) rotateY(90deg)" }),
        style({ transform: "translateZ(-160px) rotateY(87deg)", opacity: 1 }),
        style({ transform: "translateZ(0) rotateY(0)" })
    ])
);

SwanAnimations["slit_in_hor"] = animate(
    "1s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateZ(-800px) rotateX(90deg)" }),
        style({ transform: "translateZ(-160px) rotateX(87deg)", opacity: 1 }),
        style({ transform: "translateZ(0) rotateX(0)" })
    ])
);

SwanAnimations["slide_in_top"] = animate(
    "0.65s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateY(-1000px)", opacity: 0 }),
        style({ transform: "translateY(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_in_bottom"] = animate(
    "0.65s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateY(1000px)", opacity: 0 }),
        style({ transform: "translateY(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_in_right"] = animate(
    "0.65s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateX(1000px)", opacity: 0 }),
        style({ transform: "translateX(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_in_left"] = animate(
    "0.65s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateX(-1000px)", opacity: 0 }),
        style({ transform: "translateX(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_in_blurred_top"] = animate(
    "0.7s 0.1s cubic-bezier(0.230, 1.000, 0.320, 1.000)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({
            transform: "translateY(-1000px) scaleY(2.5) scaleX(0.2)",
            transformOrigin: "50% 0%",
            filter: "blur(40px)"
        }),
        style({
            transform: "translateY(0) scaleY(1) scaleX(1)",
            transformOrigin: "50% 50%",
            filter: "blur(0)",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_in_blurred_bottom"] = animate(
    "0.7s 0.1s cubic-bezier(0.230, 1.000, 0.320, 1.000)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({
            transform: "translateY(1000px) scaleY(2.5) scaleX(0.2)",
            transformOrigin: "50% 0%",
            filter: "blur(40px)"
        }),
        style({
            transform: "translateY(0) scaleY(1) scaleX(1)",
            transformOrigin: "50% 50%",
            filter: "blur(0)",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_in_blurred_right"] = animate(
    "0.7s 0.1s cubic-bezier(0.230, 1.000, 0.320, 1.000)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({
            transform: "translateX(1000px) scaleX(2.5) scaleY(0.2)",
            transformOrigin: "50% 0%",
            filter: "blur(40px)"
        }),
        style({
            transform: "translateX(0) scaleX(1) scaleY(1)",
            transformOrigin: "50% 50%",
            filter: "blur(0)",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_in_blurred_left"] = animate(
    "0.7s 0.1s cubic-bezier(0.230, 1.000, 0.320, 1.000)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({
            transform: "translateX(-1000px) scaleX(2.5) scaleY(0.2)",
            transformOrigin: "50% 0%",
            filter: "blur(40px)"
        }),
        style({
            transform: "translateX(0) scaleX(1) scaleY(1)",
            transformOrigin: "50% 50%",
            filter: "blur(0)",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_in_elliptic_top"] = animate(
    "0.7s",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({
            transform: "translateY(-600px) rotateX(-30deg) scale(0)",
            transformOrigin: "50% 100%"
        }),
        style({
            transform: "translateY(0) rotateX(0) scale(1)",
            transformOrigin: "50% 1400px",
            opacity: 1
        }),
        style({
            transform: "translateX(0) rotateY(0) scale(1)",
            transformOrigin: "50% 50%",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_in_elliptic_bottom"] = animate(
    "0.7s",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({
            transform: "translateY(600px) rotateX(30deg) scale(0)",
            transformOrigin: "50% 100%"
        }),
        style({
            transform: "translateY(0) rotateX(0) scale(1)",
            transformOrigin: "50% -1400px",
            opacity: 1
        }),
        style({
            transform: "translateX(0) rotateY(0) scale(1)",
            transformOrigin: "50% 50%",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_in_elliptic_right"] = animate(
    "0.7s",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({
            transform: "translateX(800px) rotateY(-30deg) scale(0)",
            transformOrigin: "-100% 50%"
        }),
        style({
            transform: "translateX(0) rotateY(0) scale(1)",
            transformOrigin: "-1800px 50%",
            opacity: 1
        }),
        style({
            transform: "translateX(0) rotateY(0) scale(1)",
            transformOrigin: "50% 50%",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_in_elliptic_left"] = animate(
    "0.7s",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({
            transform: "translateX(-800px) rotateY(30deg) scale(0)",
            transformOrigin: "-100% 50%"
        }),
        style({
            transform: "translateX(0) rotateY(0) scale(1)",
            transformOrigin: "1800px 50%",
            opacity: 1
        }),
        style({
            transform: "translateX(0) rotateY(0) scale(1)",
            transformOrigin: "50% 50%",
            opacity: 1
        })
    ])
);

SwanAnimations["bounce_in_top"] = animate(
    "1.5s",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateY(-500px)", animationTimingFunction: "ease-in", opacity: 0 }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out", opacity: 1 }),
        style({ transform: "translateY(-65px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateY(-28px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateY(-8px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" })
    ])
);

SwanAnimations["bounce_in_bottom"] = animate(
    "1.5s",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateY(500px)", animationTimingFunction: "ease-in", opacity: 0 }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out", opacity: 1 }),
        style({ transform: "translateY(65px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateY(28px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateY(8px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" })
    ])
);

SwanAnimations["bounce_in_right"] = animate(
    "1.5s",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateX(500px)", animationTimingFunction: "ease-in", opacity: 0 }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out", opacity: 1 }),
        style({ transform: "translateX(65px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateX(28px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateX(8px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" })
    ])
);

SwanAnimations["bounce_in_left"] = animate(
    "1.5s",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateX(-500px)", animationTimingFunction: "ease-in", opacity: 0 }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out", opacity: 1 }),
        style({ transform: "translateX(-65px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateX(-28px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateX(-8px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" })
    ])
);

SwanAnimations["roll_in_top"] = animate(
    "0.6s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateY(-800px) rotate(-540deg)" }),
        style({ transform: "translateY(0) rotate(0deg)", opacity: 1 })
    ])
);

SwanAnimations["roll_in_bottom"] = animate(
    "0.6s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateY(800px) rotate(540deg)" }),
        style({ transform: "translateY(0) rotate(0deg)", opacity: 1 })
    ])
);

SwanAnimations["roll_in_right"] = animate(
    "0.6s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateX(-800px) rotate(-540deg)" }),
        style({ transform: "translateX(0) rotate(0deg)", opacity: 1 })
    ])
);

SwanAnimations["roll_in_left"] = animate(
    "0.6s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateX(800px) rotate(540deg)" }),
        style({ transform: "translateX(0) rotate(0deg)", opacity: 1 })
    ])
);

SwanAnimations["roll_in_blurred_top"] = animate(
    "0.6s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateY(-800px) rotate(-540deg)", filter: "blur(50px)" }),
        style({ transform: "translateY(0) rotate(0deg)", opacity: 1, filter: "blur(0)" })
    ])
);

SwanAnimations["roll_in_blurred_bottom"] = animate(
    "0.6s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateY(800px) rotate(540deg)", filter: "blur(50px)" }),
        style({ transform: "translateY(0) rotate(0deg)", opacity: 1, filter: "blur(0)" })
    ])
);

SwanAnimations["roll_in_blurred_right"] = animate(
    "0.6s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateX(800px) rotate(540deg)", filter: "blur(50px)" }),
        style({ transform: "translateX(0) rotate(0deg)", opacity: 1, filter: "blur(0)" })
    ])
);

SwanAnimations["roll_in_blurred_left"] = animate(
    "0.6s ease-out",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "translateX(-800px) rotate(-540deg)", filter: "blur(50px)" }),
        style({ transform: "translateX(0) rotate(0deg)", opacity: 1, filter: "blur(0)" })
    ])
);

SwanAnimations["swing_in_top"] = animate(
    "1s 0.1s cubic-bezier(0.175, 0.885, 0.320, 1.275)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "rotateX(-100deg)", transformOrigin: "top" }),
        style({ transform: "rotateX(0deg)", transformOrigin: "top", opacity: 1 })
    ])
);

SwanAnimations["swing_in_bottom"] = animate(
    "1s 0.1s cubic-bezier(0.175, 0.885, 0.320, 1.275)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "rotateX(100deg)", transformOrigin: "bottom" }),
        style({ transform: "rotateX(0deg)", transformOrigin: "bottom", opacity: 1 })
    ])
);

SwanAnimations["swing_in_right"] = animate(
    "1s 0.1s cubic-bezier(0.175, 0.885, 0.320, 1.275)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "rotateY(-100deg)", transformOrigin: "right" }),
        style({ transform: "rotateY(0deg)", transformOrigin: "right", opacity: 1 })
    ])
);

SwanAnimations["swing_in_left"] = animate(
    "1s 0.1s cubic-bezier(0.175, 0.885, 0.320, 1.275)",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "rotateY(100deg)", transformOrigin: "left" }),
        style({ transform: "rotateY(0deg)", transformOrigin: "left", opacity: 1 })
    ])
);

SwanAnimations["fade_in"] = animate(
    "1.2s",
    keyframes([style({ visibility: "visible", opacity: 0 }), style({ opacity: 0 }), style({ opacity: 1 })])
);

SwanAnimations["fade_in_normal"] = animate(
    "0.9s",
    keyframes([style({ visibility: "visible", opacity: 0 }), style({ opacity: 0 }), style({ opacity: 1 })])
);*/

SwanAnimations["fade_in_quick"] = animate(
    "0.28s",
    keyframes([style({ visibility: "visible", opacity: 0 }), style({ opacity: 0 }), style({ opacity: 1 })])
);

/*SwanAnimations["pulse"] = animate(
    "0.35s",
    keyframes([
        style({ visibility: AUTO_STYLE, transform: "scale3d(1, 1, 1)", easing: "ease", offset: 0 }),
        style({ transform: "scale3d(1.25, 1.25, 1.25)", easing: "ease", offset: 0.5 }),
        style({ transform: "scale3d(1, 1, 1)", easing: "ease", offset: 1 })
    ])
);

SwanAnimations["puff_in"] = animate(
    "0.7s",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ transform: "scale(1.2)", filter: "blur(2px)" }),
        style({ transform: "scale(1)", filter: "blur(0px)", opacity: 1 })
    ])
);

SwanAnimations["flicker_in"] = animate(
    "1.5s linear",
    keyframes([
        style({ visibility: "visible", opacity: 0 }),
        style({ opacity: 0 }),
        style({ opacity: 0 }),
        style({ opacity: 1 }),
        style({ opacity: 0 }),
        style({ opacity: 0 }),
        style({ opacity: 1 }),
        style({ opacity: 0 }),
        style({ opacity: 0 }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 0 }),
        style({ opacity: 0 }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 0 }),
        style({ opacity: 0 }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 0 }),
        style({ opacity: 0 }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 0 }),
        style({ opacity: 0 }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 0 }),
        style({ opacity: 0 }),
        style({ opacity: 1 }),
        style({ opacity: 1 })
    ])
); */

/********************* Basic Animations ***********************/

/*SwanAnimations["rotate_center"] = animate(
    "0.6s ease-in-out",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotate(0)" }),
        style({ transform: "rotate(360deg)" })
    ])
);

SwanAnimations["rotate_top"] = animate(
    "0.6s ease-in-out",
    keyframes([
        style({ visibility: "visible" }),
        style({ transformOrigin: "top", transform: "rotate(0)" }),
        style({ transform: "rotate(360deg)", transformOrigin: "top" })
    ])
);

SwanAnimations["rotate_hor_center"] = animate(
    "0.5s 0.1ms cubic-bezier(0.455, 0.030, 0.515, 0.955)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotateX(0)" }),
        style({ transform: "rotateX(-360deg)" })
    ])
);

SwanAnimations["rotate_ver_center"] = animate(
    "0.5s 0.1ms cubic-bezier(0.455, 0.030, 0.515, 0.955)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotateY(0)" }),
        style({ transform: "rotateY(-360deg)" })
    ])
);

SwanAnimations["rotate_diagonal"] = animate(
    "0.5s linear",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotate3d(1, 1, 0, 0deg)" }),
        style({ transform: "rotate3d(1, 1, 0, -180deg)" }),
        style({ transform: "rotate3d(1, 1, 0, -360deg)" })
    ])
);

SwanAnimations["rotate_scale"] = animate(
    "0.65s linear",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scale(1) rotateZ(0)" }),
        style({ transform: "scale(1.5) rotateZ(180deg)" }),
        style({ transform: "scale(1) rotateZ(360deg)" })
    ])
);

SwanAnimations["rotate_scale_down"] = animate(
    "0.65s linear",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scale(1) rotateZ(0)" }),
        style({ transform: "scale(0.5) rotateZ(180deg)" }),
        style({ transform: "scale(1) rotateZ(360deg)" })
    ])
);

SwanAnimations["rotate_scale_up_hor"] = animate(
    "0.65s linear",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scale(1) rotateX(0)" }),
        style({ transform: "scale(1.2) rotateX(-180deg)" }),
        style({ transform: "scale(1) rotateX(-360deg)" })
    ])
);

SwanAnimations["rotate_scale_down_hor"] = animate(
    "0.65s linear",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scale(1) rotateX(0)" }),
        style({ transform: "scale(0.5) rotateX(-180deg)" }),
        style({ transform: "scale(1) rotateX(-360deg)" })
    ])
);

SwanAnimations["rotate_scale_up_ver"] = animate(
    "0.65s linear",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scale(1) rotateY(0)" }),
        style({ transform: "scale(1.2) rotateY(180deg)" }),
        style({ transform: "scale(1) rotateY(360deg)" })
    ])
);

SwanAnimations["rotate_scale_down_ver"] = animate(
    "0.65s linear",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scale(1) rotateY(0)" }),
        style({ transform: "scale(0.5) rotateY(180deg)" }),
        style({ transform: "scale(1) rotateY(360deg)" })
    ])
);

SwanAnimations["rotate_scale_diag_up"] = animate(
    "0.7s linear",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scale(1) rotate3d(1, 1, 0, 0deg)" }),
        style({ transform: "scale(2) rotate3d(1, 1, 0, -180deg)" }),
        style({ transform: "scale(1) rotate3d(1, 1, 0, -360deg)" })
    ])
);

SwanAnimations["rotate_scale_diag_down"] = animate(
    "0.7s linear",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scale(1) rotate3d(1, 1, 0, 0deg)" }),
        style({ transform: "scale(0.5) rotate3d(1, 1, 0, -180deg)" }),
        style({ transform: "scale(1) rotate3d(1, 1, 0, -360deg)" })
    ])
);

SwanAnimations["rotate_scale_diag_up_2"] = animate(
    "0.7s linear",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scale(1) rotate3d(-1, 1, 0, 0deg)" }),
        style({ transform: "scale(2) rotate3d(-1, 1, 0, 180deg)" }),
        style({ transform: "scale(1) rotate3d(-1, 1, 0, 360deg)" })
    ])
);

SwanAnimations["rotate_scale_diag_down_2"] = animate(
    "0.7s linear",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scale(1) rotate3d(-1, 1, 0, 0deg)" }),
        style({ transform: "scale(0.5) rotate3d(-1, 1, 0, 180deg)" }),
        style({ transform: "scale(1) rotate3d(-1, 1, 0, 360deg)" })
    ])
);

SwanAnimations["rotate_90"] = animate(
    "0.4s",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotate(0)" }),
        style({ transform: "rotate(90deg)" })
    ])
);

SwanAnimations["flip"] = animate(
    "0.4s",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotateX(0)" }),
        style({ transform: "rotateX(-180deg" })
    ])
);

SwanAnimations["flip_hor_top"] = animate(
    "0.5s 0.1ms cubic-bezier(0.455, 0.030, 0.515, 0.955)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(-100%) rotateX(-180deg)", transformOrigin: "50% 100%" }),
        style({ transform: "translateY(0) rotateX(0)", transformOrigin: "50% 0%" })
    ])
);

SwanAnimations["flip_ver_right"] = animate(
    "0.5s 0.1ms cubic-bezier(0.455, 0.030, 0.515, 0.955)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(0) rotateY(-180deg)", transformOrigin: "0% 50%" }),
        style({ transform: "translateX(0) rotateY(-180deg)", transformOrigin: "50% 100%" })
    ])
);

SwanAnimations["slide_top"] = animate(
    "0.5s 0.1ms cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(-100px)", opacity: 1 }),
        style({ transform: "translateY(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_tr"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(-100px) translateX(100px)" }),
        style({ transform: "translateY(0) translateX(0)" })
    ])
);

SwanAnimations["slide_right"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(100px)" }),
        style({ transform: "translateX(0)" })
    ])
);

SwanAnimations["slide_br"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(100px) translateX(100px)" }),
        style({ transform: "translateY(0) translateX(0)" })
    ])
);

SwanAnimations["slide_bottom"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(100px)" }),
        style({ transform: "translateY(0)" })
    ])
);

SwanAnimations["slide_bl"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(100px) translateX(-100px)" }),
        style({ transform: "translateY(0) translateX(0)" })
    ])
);

SwanAnimations["slide_left"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(-100px)" }),
        style({ transform: "translateX(0)" })
    ])
);

SwanAnimations["slide_tl"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(-100px) translateX(-100px)" }),
        style({ transform: "translateY(0) translateX(0)" })
    ])
);

SwanAnimations["slide_back_in"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(-400px)" }),
        style({ transform: "perspective(500px) translateZ(0)" })
    ])
);

SwanAnimations["slide_back_top"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(0) translateY(0)" }),
        style({ transform: "perspective(500px) translateZ(-400px) translateY(-200px)" })
    ])
);

SwanAnimations["slide_back_right"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(0) translateX(0)" }),
        style({ transform: "perspective(500px) translateZ(-400px) translateX(200px)" })
    ])
);

SwanAnimations["slide_back_left"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(0) translateX(0)" }),
        style({ transform: "perspective(500px) translateZ(-400px) translateX(-200px)" })
    ])
);

SwanAnimations["slide_fwd_center"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(0)" }),
        style({ transform: "perspective(500px) translateZ(160px)" })
    ])
);

SwanAnimations["slide_fwd_top"] = animate(
    "0.5s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(0) translateY(0)" }),
        style({ transform: "perspective(500px) translateZ(160px) translateX(-100px)" })
    ])
);

SwanAnimations["slide_rotate_hor_top"] = animate(
    "1s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "perspective(500px) translateY(-150px) translateZ(130px) rotateX(-90deg)"
        }),
        style({ transform: "perspective(500px) translateY(0) translateZ(0) rotateX(0deg)" })
    ])
);

SwanAnimations["slide_rotate_hor_bottom"] = animate(
    "1s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "perspective(500px) translateY(150px) translateZ(130px) rotateX(90deg)"
        }),
        style({ transform: "perspective(500px) translateY(0) translateZ(0) rotateX(0deg)" })
    ])
);

SwanAnimations["slide_rotate_right_fwd"] = animate(
    "1s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "perspective(500px) translateX(150px) translateZ(130px) rotateY(-90deg)"
        }),
        style({ transform: "perspective(500px) translateY(0) translateZ(0) rotateX(0deg)" })
    ])
);

SwanAnimations["slide_rotate_left_fwd"] = animate(
    "1s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "perspective(500px) translateX(-150px) translateZ(130px) rotateY(90deg)"
        }),
        style({ transform: "perspective(500px) translateY(0) translateZ(0) rotateX(0deg)" })
    ])
);

SwanAnimations["shadow_drop"] = animate(
    "2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ boxShadow: "0 0 60px 0px rgba(0, 0, 0, 0.35)" }),
        style({ boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)" })
    ])
);

SwanAnimations["shadow_drop_right"] = animate(
    "2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ boxShadow: "30px 0 60px -30px rgba(0, 0, 0, 0.35)" }),
        style({ boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)" })
    ])
);

SwanAnimations["shadow_drop_left"] = animate(
    "2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ boxShadow: "-30px 0 60px -30px rgba(0, 0, 0, 0.35)" }),
        style({ boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)" })
    ])
);

SwanAnimations["shadow_drop_top"] = animate(
    "2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ boxShadow: "0 -30px 60px -30px rgba(0, 0, 0, 0.35)" }),
        style({ boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)" })
    ])
);

SwanAnimations["shadow_drop_bottom"] = animate(
    "2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ boxShadow: "0 30px 60px -30px rgba(0, 0, 0, 0.35)" }),
        style({ boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)" })
    ])
);*/

/******************************* Exists animations ************************************ */
/*SwanAnimations["scale_out_center"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scale(1)", opacity: 1 }),
        style({ transform: "scale(0)", opacity: 0, visibility: "hidden" }),
        style({ transform: "scale(1)", opacity: 1 })
    ])
);

SwanAnimations["scale_out_horizontal"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scaleX(1)", opacity: 1 }),
        style({ transform: "scaleX(0)", opacity: 0, visibility: "hidden" }),
        style({ transform: "scaleX(1)", opacity: 1 })
    ])
);

SwanAnimations["scale_out_vertical"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scaleY(1)", opacity: 1 }),
        style({ transform: "scaleY(0)", opacity: 0, visibility: "hidden" }),
        style({ transform: "scaleY(1)", opacity: 1 })
    ])
);

SwanAnimations["rotate_out_center"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotate(0)", opacity: 1 }),
        style({ transform: "rotate(-360deg) scale(0.5)", opacity: 0, visibility: "hidden" }),
        style({ transform: "rotate(0) scale(1)", opacity: 1 })
    ])
);

SwanAnimations["rotate_out_horizontal"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotateX(360deg)", opacity: 1 }),
        style({ transform: "rotateX(0deg) scale(0.5)", opacity: 0, visibility: "hidden" }),
        style({ transform: "rotateX(0) scale(1)", opacity: 1 })
    ])
);

SwanAnimations["rotate_out_diagonal"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotate3d(1, 1, 0, 360deg)", opacity: 1 }),
        style({
            transform: "rotate3d(1, 1, 0, 0deg) scale(0.5)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "rotate3d(0, 0, 0, 0) scale(1)", opacity: 1 })
    ])
);

SwanAnimations["rotate_out_fade_center"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotate(0)", opacity: 1 }),
        style({ transform: "rotate(45deg)", opacity: 0, visibility: "hidden" }),
        style({ transform: "rotate3d(0, 0, 0, 0) scale(1)", opacity: 1 })
    ])
);

SwanAnimations["swirl_out_bck"] = animate(
    "1s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotate(0) scale(1)", opacity: 1 }),
        style({ transform: "rotate(-540deg) scale(0)", opacity: 0, visibility: "hidden" }),
        style({ transform: "perspective(0) rotate(0) scale(0)", opacity: 1 })
    ])
);

SwanAnimations["swirl_out_fwd"] = animate(
    "1s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotate(0) scale(1)", opacity: 1 }),
        style({ transform: "rotate(540deg) scale(2)", opacity: 0, visibility: "hidden" }),
        style({ transform: "perspective(0) rotate(0) scale(0)", opacity: 1 })
    ])
);

SwanAnimations["rotate_out_fade_bck"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(0) rotate(0)", opacity: 1 }),
        style({
            transform: "perspective(500px) translateZ(-180px) rotate(-45deg)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "perspective(0) rotate3d(0, 0, 0, 0) scale(1)", opacity: 1 })
    ])
);

SwanAnimations["flip_out_top"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotateX(0)", opacity: 1 }),
        style({ transform: "rotateX(70deg)", opacity: 0, visibility: "hidden" }),
        style({ opacity: 1, transform: "rotateX(0)" })
    ])
);

SwanAnimations["flip_out_bottom"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotateX(0)", opacity: 1 }),
        style({ transform: "rotateX(-70deg)", opacity: 0, visibility: "hidden" }),
        style({ transform: "rotateX(0)", opacity: 1 })
    ])
);

SwanAnimations["flip_out_left"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotateY(0)", opacity: 1 }),
        style({ transform: "rotateY(-70deg)", opacity: 0, visibility: "hidden" }),
        style({ transform: "rotateY(0)", opacity: 1 })
    ])
);

SwanAnimations["flip_out_right"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotateY(0)", opacity: 1 }),
        style({ transform: "rotateY(70deg)", opacity: 0, visibility: "hidden" }),
        style({ transform: "rotateY(0)", opacity: 1 })
    ])
);

SwanAnimations["flip_out_diagonal"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotate3d(1, 1, 0, 0deg)", opacity: 1 }),
        style({ transform: "rotate3d(-1, 1, 0, 70deg)", opacity: 0, visibility: "hidden" }),
        style({ transform: "rotate3d(0, 0, 0, 0)", opacity: 1 })
    ])
);

SwanAnimations["slit_out_vertical"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(0) rotateY(0)", opacity: 1 }),
        style({ transform: "perspective(500px) translateZ(-160px) rotateY(87deg)", opacity: 1 }),
        style({
            transform: "perspective(500px) translateZ(-800px) rotateY(90deg)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "perspective(0) translateZ(0) rotateY(0)", opacity: 1 })
    ])
);

SwanAnimations["slit_out_horizontal"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(0) rotateX(0)", opacity: 1 }),
        style({ transform: "perspective(500px) translateZ(-160px) rotateX(87deg)", opacity: 1 }),
        style({
            transform: "perspective(500px) translateZ(-800px) rotateX(90deg)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "perspective(0) translateZ(0) rotateX(0)", opacity: 1 })
    ])
);

SwanAnimations["slit_out_diagonal"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(0) rotate3d(1, 1, 0, 0)", opacity: 1 }),
        style({
            transform: "perspective(500px) translateZ(-160px) rotate3d(1, 1, 0, 87deg)",
            opacity: 1
        }),
        style({
            transform: "perspective(500px) translateZ(-800px) rotate3d(1, 1, 0, 90deg)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "perspective(0) translateZ(0) rotate3d(0, 0, 0, 0)", opacity: 1 })
    ])
);

SwanAnimations["slide_out_top"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(0)", opacity: 1 }),
        style({ transform: "translateY(-400px)", opacity: 0, visibility: "hidden" }),
        style({ transform: "translateY(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_out_bottom"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(0)", opacity: 1 }),
        style({ transform: "translateY(200px)", opacity: 0, visibility: "hidden" }),
        style({ opacity: 1, transform: "translateY(0)" })
    ])
);

SwanAnimations["slide_out_right"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(0)", opacity: 1 }),
        style({ transform: "translateX(400px)", opacity: 0, visibility: "hidden" }),
        style({ transform: "translateX(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_out_left"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(0)", opacity: 1 }),
        style({ transform: "translateX(-400px)", opacity: 0, visibility: "hidden" }),
        style({ transform: "translateX(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_out_back"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(0)", opacity: 1 }),
        style({
            transform: "perspective(500px) translateZ(-400px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "perspective(0) translateZ(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_out_forward"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(1px)", opacity: 1 }),
        style({
            transform: "perspective(500px) translateZ(200px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "perspective(0) translateZ(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_out_blurred_top"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "translateY(0) scaleY(1) scaleX(1)",
            transformOrigin: "50% 0%",
            filter: "blur(0)",
            opacity: 1
        }),
        style({
            transform: "translateY(-100px) scaleY(1.5) scaleX(0.2)",
            transformOrigin: "50% 0%",
            filter: "blur(40px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({
            transform: "translateY(0) scaleY(1) scaleX(1)",
            transformOrigin: "0% 0%",
            filter: "blur(0)",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_out_blurred_bottom"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "translateY(0) scaleY(1) scaleX(1)",
            transformOrigin: "50% 50%",
            filter: "blur(0)",
            opacity: 1
        }),
        style({
            transform: "translateY(100px) scaleY(-1) scaleX(0.2)",
            transformOrigin: "50% 100%",
            filter: "blur(40px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({
            transform: "translateY(0) scaleY(1) scaleX(1)",
            transformOrigin: "0% 0%",
            filter: "blur(0)",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_out_blurred_right"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "translateX(0) scaleY(1) scaleX(1)",
            transformOrigin: "50% 50%",
            filter: "blur(0)",
            opacity: 1
        }),
        style({
            transform: " translateX(400px) scaleX(2) scaleY(0.2)",
            transformOrigin: "0% 50%",
            filter: "blur(40px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({
            transform: " translateX(0) scaleX(1) scaleY(1)",
            transformOrigin: "0% 0%",
            filter: "blur(0)",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_out_blurred_left"] = animate(
    "1.2s 0.1s cubic-bezier(0.250, 0.460, 0.450, 0.940)",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "translateX(0) scaleY(1) scaleX(1)",
            transformOrigin: "50% 50%",
            filter: "blur(0)",
            opacity: 1
        }),
        style({
            transform: " translateX(-400px) scaleX(2) scaleY(0.2)",
            transformOrigin: "100% 50%",
            filter: "blur(40px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({
            transform: " translateX(0) scaleX(1) scaleY(1)",
            transformOrigin: "0% 0%",
            filter: "blur(0)",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_out_elliptic_top"] = animate(
    "1.2s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "translateY(0) rotateX(0) scale(1)",
            transformOrigin: "50% 1400px",
            opacity: 1
        }),
        style({
            transform: "translateY(-400px) rotateX(-30deg) scale(0)",
            transformOrigin: "50% 100%",
            opacity: 0,
            visibility: "hidden"
        }),
        style({
            transform: "translateY(0) rotateX(0) scale(0)",
            transformOrigin: "0% 0%",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_out_elliptic_bottom"] = animate(
    "1.2s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "translateY(0) rotateX(0) scale(1)",
            transformOrigin: "50% -1400px",
            opacity: 1
        }),
        style({
            transform: "translateY(200px) rotateX(30deg) scale(0)",
            transformOrigin: "50% 100%",
            opacity: 0,
            visibility: "hidden"
        }),
        style({
            opacity: 1,
            transform: "translateY(0) rotateX(0) scale(0)",
            transformOrigin: "0% 0%"
        })
    ])
);

SwanAnimations["slide_out_elliptic_right"] = animate(
    "1.2s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "translateX(0) rotateY(0) scale(1)",
            transformOrigin: "-2000px 50%",
            opacity: 1
        }),
        style({
            transform: "translateX(1000px) rotateY(-30deg) scale(0)",
            transformOrigin: "-100% 50%",
            opacity: 0,
            visibility: "hidden"
        }),
        style({
            transform: "translateX(0) rotateY(0) scale(1)",
            transformOrigin: "0% 0%",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_out_elliptic_left"] = animate(
    "1.2s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "translateX(0) rotateY(0) scale(1)",
            transformOrigin: "2000px 50%",
            opacity: 1
        }),
        style({
            transform: "translateX(-400px) rotateY(30deg) scale(0)",
            transformOrigin: "-100% 50%",
            opacity: 0,
            visibility: "hidden"
        }),
        style({
            transform: "translateX(0) rotateY(0) scale(1)",
            transformOrigin: "0% 0%",
            opacity: 1
        })
    ])
);

SwanAnimations["slide_out_bounce_out_top"] = animate(
    "1.5s",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateY(-30px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateY(-38px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateY(-75px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" }),
        style({ opacity: 1 }),
        style({ transform: "translateY(-400px)", opacity: 0, visibility: "hidden" }),
        style({ transform: "translateY(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_out_bounce_out_bottom"] = animate(
    "1.5s",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateY(30px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateY(38px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateY(75px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateY(0)", animationTimingFunction: "ease-out" }),
        style({ opacity: 1 }),
        style({ transform: "translateY(200px)", opacity: 0, visibility: "hidden" }),
        style({ transform: "translateY(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_out_bounce_out_right"] = animate(
    "1.5s",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateX(30px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateX(38px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateX(80px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" }),
        style({ opacity: 1 }),
        style({ transform: "translateX(400px)", opacity: 0, visibility: "hidden" }),
        style({ transform: "translateX(0)", opacity: 1 })
    ])
);

SwanAnimations["slide_out_bounce_out_left"] = animate(
    "1.5s",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateX(-30px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateX(-38px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" }),
        style({ transform: "translateX(-80px)", animationTimingFunction: "ease-in" }),
        style({ transform: "translateX(0)", animationTimingFunction: "ease-out" }),
        style({ opacity: 1 }),
        style({ transform: "translateX(-400px)", visibility: "hidden", opacity: 0 }),
        style({ transform: "translateX(0)", opacity: 1 })
    ])
);

SwanAnimations["roll_out_top"] = animate(
    "1.2s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(0) rotate(0deg)", opacity: 1 }),
        style({
            transform: "translateY(-400px) rotate(-540deg)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "translateY(0) rotate(0)", opacity: 1 })
    ])
);

SwanAnimations["roll_out_bottom"] = animate(
    "1.2s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(0) rotate(0deg)", opacity: 1 }),
        style({ transform: "translateY(200px) rotate(540deg)", opacity: 0, visibility: "hidden" }),
        style({ transform: "translateY(0) rotate(0)", opacity: 1 })
    ])
);

SwanAnimations["roll_out_left"] = animate(
    "1.2s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(0) rotate(0deg)", opacity: 1 }),
        style({
            transform: "translateX(-400px) rotate(-540deg)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "translateX(0) rotate(0)", opacity: 1 })
    ])
);

SwanAnimations["roll_out_right"] = animate(
    "1.2s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(0) rotate(0deg)", opacity: 1 }),
        style({ transform: "translateX(400px) rotate(540deg)", opacity: 0, visibility: "hidden" }),
        style({ transform: "translateX(0) rotate(0)", opacity: 1 })
    ])
);

SwanAnimations["roll_out_blurred_top"] = animate(
    "1.2s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(0) rotate(0deg)", filter: "blur(0)", opacity: 1 }),
        style({
            transform: "translateY(-400px) rotate(-720deg)",
            filter: "blur(50px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "translateY(0) rotate(0)", filter: "blur(0)", opacity: 1 })
    ])
);

SwanAnimations["roll_out_blurred_bottom"] = animate(
    "1.2s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(0) rotate(0deg)", filter: "blur(0)", opacity: 1 }),
        style({
            transform: "translateY(200px) rotate(-720deg)",
            filter: "blur(50px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "translateY(0) rotate(0)", filter: "blur(0)", opacity: 1 })
    ])
);

SwanAnimations["roll_out_blurred_right"] = animate(
    "1.2s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(0) rotate(0deg)", filter: "blur(0)", opacity: 1 }),
        style({
            transform: "translateX(400px) rotate(720deg)",
            filter: "blur(50px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "translateX(0) rotate(0deg)", filter: "blur(0)", opacity: 1 })
    ])
);

SwanAnimations["roll_out_blurred_left"] = animate(
    "1.2s ease-in",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(0) rotate(0deg)", filter: "blur(0)", opacity: 1 }),
        style({
            transform: "translateX(-400px) rotate(-720deg)",
            filter: "blur(50px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "translateX(0) rotate(0)", filter: "blur(0)", opacity: 1 })
    ])
);

SwanAnimations["swing_out_top"] = animate(
    "1.2s",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotateX(0deg)", transformOrigin: "top", opacity: 1 }),
        style({
            transform: "rotateX(-100deg)",
            transformOrigin: "top",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "rotateX(0)", transformOrigin: "0% 0%", opacity: 1 })
    ])
);

SwanAnimations["swing_out_bottom"] = animate(
    "1.2s",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotateX(0deg)", transformOrigin: "bottom", opacity: 1 }),
        style({
            transform: "rotateX(100deg)",
            transformOrigin: "bottom",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "rotateX(0)", transformOrigin: "0% 0%", opacity: 1 })
    ])
);

SwanAnimations["swing_out_left"] = animate(
    "1.2s",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotateY(0deg)", transformOrigin: "left", opacity: 1 }),
        style({
            transform: "rotateY(100deg)",
            transformOrigin: "left",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "rotateY(0)", transformOrigin: "0% 0%", opacity: 1 })
    ])
);

SwanAnimations["swing_out_right"] = animate(
    "1.2s",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "rotateY(0deg)", transformOrigin: "right", opacity: 1 }),
        style({
            transform: "rotateY(-100deg)",
            transformOrigin: "right",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "rotateY(0)", transformOrigin: "0% 0%", opacity: 1 })
    ])
);

SwanAnimations["fade_out"] = animate(
    "1.2s ease-out",
    keyframes([
        style({ visibility: "visible" }),
        style({ opacity: 1 }),
        style({ opacity: 0, visibility: "hidden" }),
        style({ opacity: 1 })
    ])
);

SwanAnimations["fade_out_back"] = animate(
    "1.2s ease-out",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "perspective(500px) translateZ(0)", opacity: 1 }),
        style({
            transform: "perspective(500px) translateZ(-80px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "perspective(0) translateZ(0)", opacity: 1 })
    ])
);

SwanAnimations["fade_out_top"] = animate(
    "1.2s ease-out",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(0)", opacity: 1 }),
        style({ transform: "translateY(-100px)", opacity: 0, visibility: "hidden" }),
        style({ transform: "translateY(0)", opacity: 1 })
    ])
);

SwanAnimations["fade_out_bottom"] = animate(
    "1.2s ease-out",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateY(0)", opacity: 1 }),
        style({ transform: "translateY(100px)", opacity: 0, visibility: "hidden" }),
        style({ transform: "translateY(0)", opacity: 1 })
    ])
);

SwanAnimations["fade_out_left"] = animate(
    "1.2s ease-out",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(0)", opacity: 1 }),
        style({ transform: "translateX(-100px)", opacity: 0, visibility: "hidden" }),
        style({ transform: "translateX(0)", opacity: 1 })
    ])
);

SwanAnimations["fade_out_right"] = animate(
    "1.2s ease-out",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "translateX(0)", opacity: 1 }),
        style({ transform: "translateX(100px)", opacity: 0, visibility: "hidden" }),
        style({ transform: "translateX(0)", opacity: 1 })
    ])
);

SwanAnimations["puff_out_center"] = animate(
    "1.2s 0.1s cubic-bezier(0.165, 0.840, 0.440, 1.000)",
    keyframes([
        style({ visibility: "visible" }),
        style({ transform: "scale(1)", filter: "blur(0px)", opacity: 1 }),
        style({ transform: "scale(1.2)", filter: "blur(2px)", opacity: 0, visibility: "hidden" }),
        style({ transform: "scale(1)", filter: "blur(0)", opacity: 1 })
    ])
);

SwanAnimations["puff_out_top"] = animate(
    "1.2s 0.1s cubic-bezier(0.165, 0.840, 0.440, 1.000)",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "scale(1)",
            transformOrigin: "50% 0%",
            filter: "blur(0px)",
            opacity: 1
        }),
        style({
            transform: "scale(1.2)",
            transformOrigin: "50% 0%",
            filter: "blur(2px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "scale(1)", transformOrigin: "0% 0%", filter: "blur(0)", opacity: 1 })
    ])
);

SwanAnimations["puff_out_bottom"] = animate(
    "1.2s 0.1s cubic-bezier(0.165, 0.840, 0.440, 1.000)",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "scale(1)",
            transformOrigin: "50% 100%",
            filter: "blur(0px)",
            opacity: 1
        }),
        style({
            transform: "scale(1.2)",
            transformOrigin: "50% 100%",
            filter: "blur(2px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "scale(1)", transformOrigin: "0% 0%", filter: "blur(0)", opacity: 1 })
    ])
);

SwanAnimations["puff_out_left"] = animate(
    "1.2s 0.1s cubic-bezier(0.165, 0.840, 0.440, 1.000)",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "scale(1)",
            transformOrigin: "100% 50%",
            filter: "blur(0px)",
            opacity: 1
        }),
        style({
            transform: "scale(1.2)",
            transformOrigin: "100% 50%",
            filter: "blur(2px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "scale(1)", transformOrigin: "0% 0%", filter: "blur(0)", opacity: 1 })
    ])
);

SwanAnimations["puff_out_right"] = animate(
    "1.2s 0.1s cubic-bezier(0.165, 0.840, 0.440, 1.000)",
    keyframes([
        style({ visibility: "visible" }),
        style({
            transform: "scale(1)",
            transformOrigin: "0% 50%",
            filter: "blur(0px)",
            opacity: 1
        }),
        style({
            transform: "scale(1.2)",
            transformOrigin: "0% 50%",
            filter: "blur(2px)",
            opacity: 0,
            visibility: "hidden"
        }),
        style({ transform: "scale(1)", transformOrigin: "0% 0%", filter: "blur(0)", opacity: 1 })
    ])
);

SwanAnimations["flicker_out"] = animate(
    "2s linear",
    keyframes([
        style({ visibility: "visible" }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 1 }),
        style({ opacity: 1 }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 1 }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 0, boxShadow: "none" }),
        style({ opacity: 1 }),
        style({ opacity: 0, boxShadow: "none", visibility: "hidden" }),
        style({ filter: "blur(0)", opacity: 1 })
    ])
);*/

/**************************TEXT ANIMATIONS ***************************/

/*SwanAnimations["tracking_in_expand"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ letterSpacing: "-0.5em", opacity: 0 }),
        style({ letterSpacing: "-0.25em", opacity: 0.6 }),
        style({ letterSpacing: "normal", opacity: 1 })
    ])
);

SwanAnimations["tracking_in_expand_fwd"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({
            transform: "perspective(100px) translateZ(-700px)",
            letterSpacing: "-0.5em",
            opacity: 0
        }),
        style({ letterSpacing: "-0.25em", opacity: 0.6 }),
        style({ transform: "perspective(0) translateZ(0)", letterSpacing: "normal", opacity: 1 })
    ])
);

SwanAnimations["tracking_in_expand_fwd_top"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({
            letterSpacing: "-0.5em",
            opacity: 0,
            transform: "perspective(500px) translateZ(-700px) translateY(-200px)"
        }),
        style({ letterSpacing: "-0.25em", opacity: 0.6 }),
        style({
            letterSpacing: "normal",
            opacity: 1,
            transform: "perspective(500px) translateZ(0) translateY(0)"
        })
    ])
);

SwanAnimations["tracking_in_expand_fwd_bottom"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({
            letterSpacing: "-0.5em",
            opacity: 0,
            transform: "perspective(500px) translateZ(-700px) translateY(200px)"
        }),
        style({ letterSpacing: "-0.25em", opacity: 0.6 }),
        style({
            letterSpacing: "normal",
            opacity: 1,
            transform: "perspective(500px) translateZ(0) translateY(0)"
        })
    ])
);

SwanAnimations["tracking_in_contract"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ letterSpacing: "1em", opacity: 0 }),
        style({ letterSpacing: "0.5em", opacity: 0.6 }),
        style({ letterSpacing: "normal", opacity: 1 })
    ])
);

SwanAnimations["tracking_in_contract_back_top"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({
            letterSpacing: "0.5em",
            opacity: 0,
            transform: "perspective(200px) translateZ(200px) translateY(-200px)"
        }),
        style({ letterSpacing: "0.2em", opacity: 0.6 }),
        style({
            letterSpacing: "normal",
            opacity: 1,
            transform: "perspective(200px) translateZ(0) translateY(0)"
        })
    ])
);

SwanAnimations["tracking_in_contract_back_bottom"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({
            letterSpacing: "0.5em",
            opacity: 0,
            transform: "perspective(400px) translateZ(400px) translateY(300px)"
        }),
        style({ letterSpacing: "0.2em", opacity: 0.6 }),
        style({
            letterSpacing: "normal",
            opacity: 1,
            transform: "perspective(0) translateZ(0) translateY(0)"
        })
    ])
);

SwanAnimations["tracking_out_contract"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ opacity: 1 }),
        style({ letterSpacing: "-0.2em", opacity: 1 }),
        style({ opacity: 0, letterSpacing: "-0.5em", visibility: "hidden" }),
        style({ letterSpacing: "normal" })
    ])
);

SwanAnimations["tracking_out_contract_top"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ opacity: 1, transform: "translateZ(0) translateY(0)" }),
        style({ letterSpacing: "-0.2em", opacity: 1 }),
        style({
            opacity: 0,
            letterSpacing: "-0.5em",
            transform: "perspective(500px) translateZ(-500px) translateY(-200px)",
            visibility: "hidden"
        }),
        style({ letterSpacing: "normal", transform: "perspective(0) translateZ(0) translateY(0)" })
    ])
);

SwanAnimations["tracking_out_contract_bottom"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ opacity: 1, transform: "perspective(500px) translateZ(0) translateY(0)" }),
        style({ letterSpacing: "-0.2em", opacity: 1 }),
        style({
            opacity: 0,
            letterSpacing: "-0.5em",
            transform: "perspective(500px) translateZ(-500px) translateY(200px)",
            visibility: "hidden"
        }),
        style({ letterSpacing: "normal", transform: "perspective(0) translateZ(0) translateY(0)" })
    ])
);

SwanAnimations["tracking_out_expand"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ opacity: 1 }),
        style({ letterSpacing: "0.5em", opacity: 1 }),
        style({ opacity: 0, letterSpacing: "1em", visibility: "hidden" }),
        style({ letterSpacing: "normal", opacity: 1 })
    ])
);

SwanAnimations["tracking_out_expand_fwd_top"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ opacity: 1 }),
        style({
            transform: "perspective(500px) translateZ(0) translateY(0)",
            letterSpacing: "0.5em",
            opacity: 1
        }),
        style({
            opacity: 0,
            transform: "perspective(500px) translateZ(300px) translateY(-200px)",
            letterSpacing: "1em",
            visibility: "hidden"
        }),
        style({
            letterSpacing: "normal",
            opacity: 1,
            transform: "perspective(0) translateZ(0) translateY(0)"
        })
    ])
);

SwanAnimations["tracking_out_expand_fwd_bottom"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ opacity: 1 }),
        style({
            transform: "perspective(500px) translateZ(0) translateY(0)",
            letterSpacing: "0.5em",
            opacity: 1
        }),
        style({
            opacity: 0,
            transform: "perspective(500px) translateZ(300px) translateY(200px)",
            letterSpacing: "1em",
            visibility: "hidden"
        }),
        style({
            letterSpacing: "normal",
            opacity: 1,
            transform: "perspective(0) translateZ(0) translateY(0)"
        })
    ])
);

SwanAnimations["text_focus_in"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ opacity: 0, filter: "blur(12px)" }),
        style({ opacity: 1, filter: "blur(0)" })
    ])
);

SwanAnimations["text_focus_in_expand"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ opacity: 0, filter: "blur(12px)", letterSpacing: "-0.5em" }),
        style({ opacity: 1, filter: "blur(0)", letterSpacing: "normal" })
    ])
);

SwanAnimations["text_focus_in_contract"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ opacity: 0, filter: "blur(12px)", letterSpacing: "1em" }),
        style({ opacity: 1, filter: "blur(0)", letterSpacing: "normal" })
    ])
);

SwanAnimations["text_blur_out"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ filter: "blur(5px)" }),
        style({ opacity: 0, filter: "blur(5px)", visibility: "hidden" }),
        style({ filter: "blur(0)", opacity: 1 })
    ])
);

SwanAnimations["text_blur_out_contract"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ filter: "blur(0.01px)" }),
        style({ opacity: 0, filter: "blur(5px)", letterSpacing: "-0.5em", visibility: "hidden" }),
        style({ filter: "blur(0)", letterSpacing: "normal", opacity: 1 })
    ])
);

SwanAnimations["text_blur_out_expand"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ filter: "blur(0.01px)" }),
        style({ opacity: 0, filter: "blur(5px)", letterSpacing: "1em", visibility: "hidden" }),
        style({ filter: "blur(0)", letterSpacing: "normal", opacity: 1 })
    ])
);

SwanAnimations["text_flicker_in"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ opacity: 0 }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 1, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 1, textShadow: "0 0 30px rgba(255, 255, 255, 0.25)" }),
        style({ opacity: 0, textShadow: "none" }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.45), 0 0 60px rgba(255, 255, 255, 0.25)"
        }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.45), 0 0 60px rgba(255, 255, 255, 0.25)"
        }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.45), 0 0 60px rgba(255, 255, 255, 0.25)"
        }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.45), 0 0 60px rgba(255, 255, 255, 0.25)"
        }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.45), 0 0 60px rgba(255, 255, 255, 0.25)"
        }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35)"
        }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35)"
        }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({
            opacity: 1,
            textShadow:
                "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1)"
        }),
        style({
            opacity: 1,
            textShadow:
                "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1)"
        }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({
            opacity: 1,
            textShadow:
                "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1)"
        }),
        style({
            opacity: 1,
            textShadow:
                "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1)"
        }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({
            opacity: 1,
            textShadow:
                "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1)"
        }),
        style({
            opacity: 1,
            textShadow:
                "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1)"
        }),
        style({ textShadow: "none" })
    ])
);

SwanAnimations["text_flicker_out"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ opacity: 0 }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 1, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 1, textShadow: "0 0 30px rgba(255, 255, 255, 0.25)" }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.45), 0 0 60px rgba(255, 255, 255, 0.25)"
        }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.45), 0 0 60px rgba(255, 255, 255, 0.25)"
        }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.45), 0 0 60px rgba(255, 255, 255, 0.25)"
        }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.45), 0 0 60px rgba(255, 255, 255, 0.25)"
        }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.45), 0 0 60px rgba(255, 255, 255, 0.25)"
        }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35)"
        }),
        style({
            opacity: 1,
            textShadow: "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35)"
        }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({
            opacity: 1,
            textShadow:
                "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1)"
        }),
        style({
            opacity: 1,
            textShadow:
                "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1)"
        }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({
            opacity: 1,
            textShadow:
                "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1)"
        }),
        style({
            opacity: 1,
            textShadow:
                "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1)"
        }),
        style({ opacity: 0, textShadow: "none" }),
        style({ opacity: 0, textShadow: "none" }),
        style({
            opacity: 1,
            textShadow:
                "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1)"
        }),
        style({
            opacity: 0,
            textShadow:
                "0 0 30px rgba(255, 255, 255, 0.55), 0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1)",
            visibility: "hidden"
        }),
        style({ opacity: 1, textShadow: "none" })
    ])
);

SwanAnimations["text_pop_up_top"] = animate(
    "1.2s 0.1s cubic-bezier(0.215, 0.610, 0.355, 1.000)",
    keyframes([
        style({ visibility: "visible", textShadow: "none" }),
        style({ transform: "translateY(0)", transformOrigin: "50% 50%", textShadow: "none" }),
        style({
            transform: "translateY(-50px)",
            transformOrigin: "50% 50%",
            textShadow:
                "0 1px 0 #ccc, 0 2px 0 #ccc, 0 3px 0 #ccc, 0 4px 0 #ccc, 0 5px 0 #ccc, 0 6px 0 #ccc, 0 7px 0 #ccc, 0 8px 0 #ccc, 0 9px 0 #ccc, 0 50px 30px rgba(0, 0, 0, 0.3)"
        })
    ])
);*/
