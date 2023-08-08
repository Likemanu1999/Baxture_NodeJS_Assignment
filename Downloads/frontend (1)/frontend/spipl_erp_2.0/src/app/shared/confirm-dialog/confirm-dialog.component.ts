import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: 'confirm-dialog.component.html',
    styleUrls: ['confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
    message: any;
    subscription: Subscription;
    constructor(
        private confirmDialogService: ConfirmDialogService
    ) { }

    ngOnInit() {
        // this function waits for a message from alert service, it gets
        // triggered when we call this from any other component
      this.subscription =  this.confirmDialogService.getMessage().subscribe(message => {
            this.message = message;
        });
    }
    ngOnDestroy(): void {
      this.subscription.unsubscribe();
    }
}
