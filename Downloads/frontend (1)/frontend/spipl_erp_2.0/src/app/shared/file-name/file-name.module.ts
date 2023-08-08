import {NgModule} from '@angular/core';
import { FileNamePipe } from './file-name.pipe';

@NgModule({
declarations: [FileNamePipe],
exports: [FileNamePipe]
})
export class FileNamePipeModule {}
