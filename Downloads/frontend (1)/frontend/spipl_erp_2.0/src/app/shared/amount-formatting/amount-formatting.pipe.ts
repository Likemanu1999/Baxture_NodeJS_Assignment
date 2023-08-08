import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'amountFormatting'
})
export class AmountFormattingPipe implements PipeTransform {

	transform(value: any): any {
		let final = null;
		if (value > 0) {
			let val = Math.abs(value);
			if (val >= 10000000) {
				final = (val / 10000000).toFixed(2) + ' Cr';
			} else if (val >= 100000) {
				final = (val / 100000).toFixed(2) + ' Lac';
			}
		}
		return final;
	}

}
