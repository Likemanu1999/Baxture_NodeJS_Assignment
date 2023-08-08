import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FdComponent } from './fd/fd.component';
import { AllFdRoutingModule } from './all-fd-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { TableModule } from 'primeng/table';
import { ToasterModule } from 'angular2-toaster';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { ButtonModule } from 'primeng/button';
import { BsDatepickerModule, ModalModule } from 'ngx-bootstrap';
import { NumbersDirectiveModule } from '../../directives/numbers-directive.module';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { FilterModule } from '../../shared/filters/filter.module';
import { FdEditoreComponent } from './fd-editore/fd-editore.component';
import { CKEditorModule } from 'ngx-ckeditor';
import { QuarterlyFdReportComponent } from './quarterly-fd-report/quarterly-fd-report.component';
import { LinkFdComponent } from './link-fd/link-fd.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { FdLinkingListComponent } from './fd-linking-list/fd-linking-list.component';
import { CurrencyPipeModule } from '../../shared/currency/currency.module';
import { AmountToWordPipeModule } from '../../shared/amount-to-word/amount-to-word.module';
import {TooltipModule} from 'primeng/tooltip';
import { PayableRequestModule } from '../../shared/payable-request/payable-request.module';

@NgModule({
  declarations: [FdComponent, FdEditoreComponent, QuarterlyFdReportComponent, LinkFdComponent, FdLinkingListComponent ],
  imports: [
    CommonModule,
    AllFdRoutingModule,
    MultiSelectModule,    
    NgSelectModule,
    FormsModule,
    TableModule,
    ToasterModule,
    LoadingSpinnerModule,
    ButtonModule,
    HttpClientModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ConfirmationPopoverModule.forRoot({
      confirmButtonType:'danger'
    }),
    NumbersDirectiveModule,
    FilterModule,
    CurrencyPipeModule,
    CKEditorModule,
    TooltipModule,
    AmountToWordPipeModule,
    PayableRequestModule
  ],
  providers: [
    {provide:HTTP_INTERCEPTORS,
    useClass:TokenInterceptorService,
     multi:true}
    ],
})
export class AllFdModule { }
