import {NgModule} from '@angular/core';
import { TableFilterPipe } from './tablefilter.pipe';
import { DateFilterPipe } from './datefilter.pipe';
import { ColumnFilterPipe } from './columnfilter.pipe';
import { ColumnSumPipe } from './columnsum.pipe';
import { GoupbysumPipe } from './goupbysum.pipe';
// import { AmountFormattingPipe } from '../amount-formatting/amount-formatting.pipe';

@NgModule({
declarations: [TableFilterPipe, DateFilterPipe, ColumnFilterPipe, ColumnSumPipe, GoupbysumPipe ],
exports: [TableFilterPipe, DateFilterPipe, ColumnFilterPipe, ColumnSumPipe, GoupbysumPipe]
})

export class FilterModule {}
