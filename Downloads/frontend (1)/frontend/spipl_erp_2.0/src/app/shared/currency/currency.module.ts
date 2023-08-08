import {NgModule} from '@angular/core';
import { InrCurrencyPipe } from './currency.pipe';


@NgModule({
declarations: [InrCurrencyPipe],
exports: [InrCurrencyPipe]
})
export class CurrencyPipeModule {}
