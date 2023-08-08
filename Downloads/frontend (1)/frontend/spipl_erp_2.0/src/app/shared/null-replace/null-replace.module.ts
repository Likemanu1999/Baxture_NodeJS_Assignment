import {NgModule} from '@angular/core';
import { NullReplacePipe } from './null-replace.pipe';


@NgModule({
declarations: [NullReplacePipe],
exports: [NullReplacePipe]
})
export class NullReplacePipeModule {}
