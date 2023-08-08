import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DataTableModule } from 'angular2-datatable';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { TextMaskModule } from 'angular2-text-mask';
import { TimepickerModule, BsDatepickerModule, TabsModule, ModalModule, CollapseModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { ToasterModule } from 'angular2-toaster';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CKEditorModule } from 'ngx-ckeditor';


import { FilterModule } from '../../shared/filters/filter.module';
import { ForexRoutingModule } from './forex-routing.module';
import { GradeAssortmentComponent } from './grade-assortment/grade-assortment.component';
import { AddGradePortComponent } from './add-grade-port/add-grade-port.component';
import { ForexSupplierListComponent } from './forex-supplier-list/forex-supplier-list.component';
import { ProformaInvoiceComponent } from './proforma-invoice/proforma-invoice.component';
import { AddFsDealComponent } from './add-fs-deal/add-fs-deal.component';
import { EditFsDealComponent } from './edit-fs-deal/edit-fs-deal.component';
import { LcCreationComponent } from './lc-creation/lc-creation.component';
import { EditPiComponent } from './edit-pi/edit-pi.component';
import { LcInOperationComponent } from './lc-in-operation/lc-in-operation.component';
import { SalesContractReportComponent } from './sales-contract-report/sales-contract-report.component';



import { TableModule } from 'primeng/table';
import {DropdownModule} from 'primeng/dropdown';
import { MultiSelectModule} from 'primeng/multiselect';
import { CalendarModule} from 'primeng/calendar';
import { ProgressBarModule} from 'primeng/progressbar';
import { EditLcComponent } from './edit-lc/edit-lc.component';
import { UtilisationChartComponent } from './utilisation-chart/utilisation-chart.component';
import { NonNegotiableListComponent } from './non-negotiable-list/non-negotiable-list.component';
import { NonLcPiComponent } from './non-lc-pi/non-lc-pi.component';
import { EditorComponent } from './editor/editor.component';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';

import {TooltipModule} from 'primeng/tooltip';
import { ForwardBookingComponent } from './forward-booking/forward-booking.component';
import { ForwardCoveredComponent } from './forward-covered/forward-covered.component';
import { NumbersDirectiveModule } from '../../directives/numbers-directive.module';
import { CurrencyPipeModule } from '../../shared/currency/currency.module';
import { BankChargesListComponent } from './bank-charges-list/bank-charges-list.component';
import { LcAmmendChargesComponent } from './bank-charges-list/lc-ammend-charges/lc-ammend-charges.component';
import { NonlcRemittanceChargesComponent } from './bank-charges-list/nonlc-remittance-charges/nonlc-remittance-charges.component';
import { PaymentRemittanceChargesComponent } from './bank-charges-list/payment-remittance-charges/payment-remittance-charges.component';
import { BankOtherChargesComponent } from './bank-charges-list/bank-other-charges/bank-other-charges.component';
import { AddEditBankOtherChargesComponent } from './bank-charges-list/bank-other-charges/add-edit-bank-other-charges/add-edit-bank-other-charges.component';
import { ForwardBookingChargesComponent } from './bank-charges-list/forward-booking-charges/forward-booking-charges.component';
import { LcMailComponent } from './lc-mail/lc-mail.component';
import { FileNamePipeModule } from '../../shared/file-name/file-name.module';
import { IssuanceReportComponent } from './issuance-report/issuance-report.component';
import { ForexSummaryComponent } from './issuance-report/forex-summary/forex-summary.component';
import { ChargesReportComponent } from './issuance-report/charges-report/charges-report.component';
import { FlcIlcTtPaymentReportComponent } from './issuance-report/flc-ilc-tt-payment-report/flc-ilc-tt-payment-report.component';
import { MonthlyAnnexureComponent } from './issuance-report/monthly-annexure/monthly-annexure.component';
import { BankGauranteeComponent } from './bank-gaurantee/bank-gaurantee.component';
import { AddEditBgComponent } from './bank-gaurantee/add-edit-bg/add-edit-bg.component';
import { LcOutstandingReportComponent } from './lc-outstanding-report/lc-outstanding-report.component';
import { LcInOperationNewComponent } from './lc-in-operation-new/lc-in-operation-new.component';
import { MatTableModule } from '@angular/material';
import {MatIconModule} from '@angular/material/icon';
import { ForexAvgReportComponent } from './forex-avg-report/forex-avg-report.component';
import { FlcPiHoldReleaseListComponent } from './flc-pi-hold-release-list/flc-pi-hold-release-list.component';
import { SupplierQuantityComponent } from './supplier-quantity/supplier-quantity.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';
import { ContigentLiabilityComponent } from './issuance-report/contigent-liability/contigent-liability.component';



@NgModule({
  declarations: [

    GradeAssortmentComponent,
    AddGradePortComponent,
    ForexSupplierListComponent,
    ProformaInvoiceComponent,
    AddFsDealComponent,
    EditFsDealComponent,
    LcCreationComponent,
    EditPiComponent,
    LcInOperationComponent,
    EditLcComponent,
    UtilisationChartComponent,
    NonNegotiableListComponent,
    NonLcPiComponent,
    EditorComponent,
    PaymentDetailsComponent,
    ForwardBookingComponent,
    ForwardCoveredComponent,
    SalesContractReportComponent,
    BankChargesListComponent,
    LcAmmendChargesComponent,
    NonlcRemittanceChargesComponent,
    PaymentRemittanceChargesComponent,
    BankOtherChargesComponent,
    AddEditBankOtherChargesComponent,
    ForwardBookingChargesComponent,
    LcMailComponent,
    IssuanceReportComponent,
    MonthlyAnnexureComponent,
    ForexSummaryComponent,
    ChargesReportComponent,
    FlcIlcTtPaymentReportComponent,
    BankGauranteeComponent,
    AddEditBgComponent,
    LcOutstandingReportComponent,
    LcInOperationNewComponent,
    ForexAvgReportComponent,
    FlcPiHoldReleaseListComponent,
    SupplierQuantityComponent,
    ContigentLiabilityComponent

  ],
  imports:
  [
    SharedModuleModule,
    CommonModule,
    ForexRoutingModule,
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
    TooltipModule,
    ModalModule.forRoot(),
    CollapseModule.forRoot(),
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger' // set defaults here
    }),
    NumbersDirectiveModule,
    CurrencyPipeModule,
    FileNamePipeModule,
    MatTableModule,
    MatIconModule,
    ProgressSpinnerModule 

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true}],
})
export class ForexModule { }
