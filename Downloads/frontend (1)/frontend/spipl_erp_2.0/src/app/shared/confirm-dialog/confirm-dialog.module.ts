import { NgModule } from '@angular/core';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog.service';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        ConfirmDialogComponent
    ],
    imports: [CommonModule],
    exports: [
        ConfirmDialogComponent
    ], providers: [
       ConfirmDialogService
    ]
})
export class ConfirmDialogModule { }
