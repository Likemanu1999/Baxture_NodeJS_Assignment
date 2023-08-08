import {NgModule} from '@angular/core';
import { AmountToWordPipe } from './amount-to-word.pipe';


@NgModule({
declarations: [AmountToWordPipe],
exports: [AmountToWordPipe]
})
export class AmountToWordPipeModule {}