import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DataTableModule } from 'angular2-datatable';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { TextMaskModule } from 'angular2-text-mask';
import { TimepickerModule, BsDatepickerModule, TabsModule, ModalModule, CollapseModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CKEditorModule } from 'ngx-ckeditor';
import { ButtonModule } from 'primeng/button';


import { FilterModule } from '../../shared/filters/filter.module';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { LocalPurchaseRoutingModule } from './local-purchase-routing.module';
import { ListPurchaseDealComponent } from './list-purchase-deal/list-purchase-deal.component';
import { LiftingDetailsComponent } from './lifting-details/lifting-details.component';
import { CompleteLiftingListComponent } from './complete-lifting-list/complete-lifting-list.component';
import { PayableRequestModule } from '../../shared/payable-request/payable-request.module';
import { CurrencyPipeModule } from '../../shared/currency/currency.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NumbersDirectiveModule } from '../../directives/numbers-directive.module';
import { GeneratePiComponent } from './generate-pi/generate-pi.component';
import { IlcPiComponent } from './ilc-pi/ilc-pi.component';
import { ILcCreationComponent } from './letter-of-credit/lc-creation/ilc-creation.component';
import { IlcEditorComponent } from './ilc-editor/ilc-editor.component';
import { IlcInOperationComponent } from './letter-of-credit/ilc-in-operation/ilc-in-operation.component';
import { BillOfExchangeComponent } from './letter-of-credit/bill-of-exchange/bill-of-exchange.component';
import { BillOfExchangeListComponent } from './letter-of-credit/bill-of-exchange-list/bill-of-exchange-list.component';
import { IlcOpeningComponent } from './ilc-bank-charges/ilc-opening/ilc-opening.component';
import { IlcAmmendmentComponent } from './ilc-bank-charges/ilc-ammendment/ilc-ammendment.component';
import { IlcRemittanceComponent } from './ilc-bank-charges/ilc-remittance/ilc-remittance.component';
import { IlcDiscountComponent } from './ilc-bank-charges/ilc-discount/ilc-discount.component';
import { FileNamePipeModule } from '../../shared/file-name/file-name.module';
import { AmountToWordPipe } from '../../shared/amount-to-word/amount-to-word.pipe';
import { InrCurrencyPipe } from '../../shared/currency/currency.pipe';
import { ChipsModule } from 'primeng/chips';
import { AverageGradeRateReportComponent } from './average-grade-rate-report/average-grade-rate-report.component';
import { JourneyOfTransactionComponent } from './journey-of-transaction/journey-of-transaction.component';
import { LocalPurchaseChargesComponent } from './local-purchase-charges/local-purchase-charges.component';
import { ShortDamageListComponent } from './short-damage-list/short-damage-list.component';
import { PaymentInterestReportComponent } from './payment-interest-report/payment-interest-report.component';
import { GodownAllocationComponent } from './godown-allocation/godown-allocation.component';
import { IlcPurchareReportsComponent } from './reports/ilc-purchare-reports/ilc-purchare-reports.component';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';
import { RadioButtonModule } from 'primeng/radiobutton';







@NgModule({
  declarations: [
    ListPurchaseDealComponent,
    LiftingDetailsComponent,
    CompleteLiftingListComponent,
    GeneratePiComponent,
    IlcPiComponent,
    ILcCreationComponent,
    IlcEditorComponent,
    IlcInOperationComponent,
    BillOfExchangeComponent,
    BillOfExchangeListComponent,
    IlcOpeningComponent,
    IlcAmmendmentComponent,
    IlcRemittanceComponent,
    IlcDiscountComponent,
    AverageGradeRateReportComponent,
    JourneyOfTransactionComponent,
    LocalPurchaseChargesComponent,
    ShortDamageListComponent,
    PaymentInterestReportComponent,
    GodownAllocationComponent,
    IlcPurchareReportsComponent

  ],
  imports:
    [
      LocalPurchaseRoutingModule,
      CommonModule,
      ReactiveFormsModule,
      FormsModule,
      HttpClientModule,
      DataTableModule,
      LoadingSpinnerModule,
      TextMaskModule,
      TimepickerModule.forRoot(),
      BsDatepickerModule.forRoot(),
      BsDropdownModule.forRoot(),
      NgSelectModule,
      NgOptionHighlightModule,
      ToasterModule,
      TabsModule,
      FilterModule,
      DropdownModule,
      MultiSelectModule,
      ProgressBarModule,
      CalendarModule,
      TableModule,
      CKEditorModule,
      MatTabsModule,
      ButtonModule,
      TooltipModule,
      ModalModule.forRoot(),
      CollapseModule.forRoot(),
      ConfirmationPopoverModule.forRoot({
        confirmButtonType: 'danger' // set defaults here
      }),
      PayableRequestModule,
      CurrencyPipeModule,
      NumbersDirectiveModule,
      ConfirmDialogModule,
      FileNamePipeModule,
      ChipsModule,
      SharedModuleModule,
      RadioButtonModule
    ],
  providers: [

    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    AmountToWordPipe,
    InrCurrencyPipe
  ],
})
export class LocalPurchaseModule { }
