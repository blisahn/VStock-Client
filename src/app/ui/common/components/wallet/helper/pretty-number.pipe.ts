// pretty-number.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'pretty' })
export class PrettyNumberPipe implements PipeTransform {
    transform(value: number | string | null | undefined, min = 0, max = 8, locale = 'en-US'): string {
        if (value === null || value === undefined || value === '') return '—';
        const n = typeof value === 'string' ? Number(value) : value;
        if (Number.isNaN(n)) return '—';
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: min,
            maximumFractionDigits: max,
            useGrouping: true,
        }).format(n);
    }
}
