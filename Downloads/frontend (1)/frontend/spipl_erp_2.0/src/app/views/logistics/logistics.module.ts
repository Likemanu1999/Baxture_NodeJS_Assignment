import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DataTableModule } from 'angular2-datatable';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';

// Angular 2 Input Mask
import { TextMaskModule } from 'angular2-text-mask';
// Timepicker
import { TimepickerModule, TabsModule, ModalModule } from 'ngx-bootstrap';
// Datepicker
import { BsDatepickerModule } from 'ngx-bootstrap';
// Ng2-select
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import { ToasterModule } from 'angular2-toaster';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';

import { FilterModule } from '../../shared/filters/filter.module';
import { TableModule } from 'primeng/table';
import {TooltipModule} from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import {ButtonModule} from 'primeng/button';
import { MatTabsModule } from '@angular/material/tabs';

import {InputTextModule} from 'primeng/inputtext';

import { CalendarModule} from 'primeng/calendar';
import { ProgressBarModule} from 'primeng/progressbar';

import { CollapseModule } from 'ngx-bootstrap/collapse';
import {MatStepperModule} from '@angular/material/stepper';
import { NumbersDirectiveModule } from '../../directives/numbers-directive.module';
import { CurrencyPipeModule } from '../../shared/currency/currency.module';

import {LogisticsRoutingModule } from './logistics-routing.module';
import { CKEditorModule } from 'ngx-ckeditor';

import{ MaterialReceivedChartComponent } from './material-received-chart/material-received-chart.component';
import { BillOfLadingComponent } from './bill-of-lading/bill-of-lading.component';
import { ContainerDetailsComponent } from './container-details/container-details.component';
import { LicenceInvoiceListComponent } from './licence-invoice-list/licence-invoice-list.component';
import { LicenseListComponent } from './license-list/license-list.component';
import { BillOfEntryComponent } from './bill-of-entry/bill-of-entry.component';
import { DeliveryChallanComponent } from './delivery-challan/delivery-challan.component';
import { KnockOfLicenseComponent } from './knock-of-license/knock-of-license.component';
import { DeliveryChallanPdfComponent } from './delivery-challan-pdf/delivery-challan-pdf.component';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { BillOfEntryEmailComponent } from './bill-of-entry-email/bill-of-entry-email.component';
import { ChipsModule } from 'primeng/chips';
import { ChaChargesMasterComponent } from './cha-charges-master/cha-charges-master.component';
import { AddChargesComponent } from './add-charges/add-charges.component';
import { NullReplacePipeModule } from '../../shared/null-replace/null-replace.module';
import { FileNamePipeModule } from '../../shared/file-name/file-name.module';
import { ContainerDetailListComponent } from './container-detail-list/container-detail-list.component';
import { LogisticsChargesListComponent } from './logistics-charges-list/logistics-charges-list.component';
import { BillOfEntryListComponent } from './bill-of-entry-list/bill-of-entry-list.component';
import { InsuranceClaimComponent } from './insurance-claim/insurance-claim.component';
import { InsuranceMailEditorComponent } from './insurance-mail-editor/insurance-mail-editor.component';
import { AmountToWordPipeModule } from '../../shared/amount-to-word/amount-to-word.module';
import { ImportForexReportComponent } from './import-forex-report/import-forex-report.component';
import { LogisticsChargesReportComponent } from './logistics-charges-report/logistics-charges-report.component';
import { ImportLogisticsReportComponent } from './import-logistics-report/import-logistics-report.component';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';

@NgModule({
  declarations: [
    MaterialReceivedChartComponent,
    BillOfLadingComponent,
    ContainerDetailsComponent,
    LicenceInvoiceListComponent,
    LicenseListComponent,
    BillOfEntryComponent,
    DeliveryChallanComponent,
    KnockOfLicenseComponent,
    DeliveryChallanPdfComponent,
    BillOfEntryEmailComponent,
    ChaChargesMasterComponent,
    AddChargesComponent,
    ContainerDetailListComponent,
    LogisticsChargesListComponent,
    BillOfEntryListComponent,
    InsuranceClaimComponent,
    InsuranceMailEditorComponent,
    ImportForexReportComponent,
    LogisticsChargesReportComponent,
    ImportLogisticsReportComponent
   ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModuleModule,
    FormsModule,
    LogisticsRoutingModule,
    DataTableModule,
    LoadingSpinnerModule,
    TextMaskModule,
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    NgOptionHighlightModule,
    ToasterModule,
    FilterModule,
    TabsModule,
    TableModule,
    ChipsModule,
    ButtonModule,
    MultiSelectModule,
    CalendarModule,
    CollapseModule,
    ProgressBarModule,
    CKEditorModule,
    ModalModule.forRoot(),
    MatTabsModule,
    MatStepperModule,
    DropdownModule,
    TooltipModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger' // set defaults here
    }),
    InputTextModule,
    ConfirmDialogModule,
    NumbersDirectiveModule,
    CurrencyPipeModule,
    NullReplacePipeModule,
    FileNamePipeModule,
    AmountToWordPipeModule

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true}],
})
export class LogisticsModule { }
