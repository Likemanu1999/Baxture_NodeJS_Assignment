import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayableRequestComponent } from './payable-request.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CurrencyPipeModule } from '../currency/currency.module';
import { LoadingSpinnerModule } from '../loading-spinner/loading-spinner.module';
import { TableModule } from 'primeng/table';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToasterModule } from 'angular2-toaster';
import { BsDatepickerModule, ModalModule } from 'ngx-bootstrap';
import { NumbersDirectiveModule } from '../../directives/numbers-directive.module';
import { TokenInterceptorService } from '../interceptors/token-interceptor-service';
import { NgSelectModule } from '@ng-select/ng-select';
import { NullReplacePipeModule } from '../null-replace/null-replace.module';

@NgModule({
  declarations: [PayableRequestComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    CurrencyPipeModule,
    LoadingSpinnerModule,
    TableModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    ToasterModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger' // set defaults here
    }),
    NumbersDirectiveModule,
    FormsModule,
    NgSelectModule,
    NullReplacePipeModule
  ],
  exports: [PayableRequestComponent],


})
export class PayableRequestModule { }
