import {NgModule} from '@angular/core';
import { SanitizeHtmlPipe } from './html-sanitize.pipe';


@NgModule({
declarations: [SanitizeHtmlPipe],
exports: [SanitizeHtmlPipe]
})
export class HTMLSanitizeModule {}