import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "volume" })
export class VolumePipe implements PipeTransform {
    transform(value: number): string {
        if (value < 1000) {
            return value.toString();
        }

        if (value < 1000000) {
            const fixed = (value / 1000).toFixed(2);
            return `${parseFloat(fixed)}k`;
        }

        const fixed = (value / 1000000).toFixed(2);
        return `${parseFloat(fixed)}m`;
    }
}
