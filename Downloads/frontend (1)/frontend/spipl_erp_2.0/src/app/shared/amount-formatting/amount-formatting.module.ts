import {NgModule} from '@angular/core';
import { AmountFormattingPipe } from './amount-formatting.pipe';


@NgModule({
declarations: [AmountFormattingPipe],
exports: [AmountFormattingPipe]
})
export class AmountFormattingPipeModule {}
