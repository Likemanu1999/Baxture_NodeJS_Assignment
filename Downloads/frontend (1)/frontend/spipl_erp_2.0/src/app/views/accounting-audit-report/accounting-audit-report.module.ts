import { BsDatepickerModule, CollapseModule, ModalModule, TabsModule, TimepickerModule } from 'ngx-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatTabsModule } from '@angular/material/tabs';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTableModule } from 'angular2-datatable';
import { TextMaskModule } from 'angular2-text-mask';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { ToasterModule } from 'angular2-toaster';
import { TooltipModule } from 'primeng/tooltip';
import { CKEditorModule } from 'ngx-ckeditor';
import { TableModule } from 'primeng/table';
import { ChipsModule } from 'primeng/chips';
import { ChartsModule } from 'ng2-charts';
import { NgModule } from '@angular/core';
import { AmountFormattingPipeModule } from '../../shared/amount-formatting/amount-formatting.module';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { AmountToWordPipe } from '../../shared/amount-to-word/amount-to-word.pipe';
import { NumbersDirectiveModule } from '../../directives/numbers-directive.module';
import { FileNamePipeModule } from '../../shared/file-name/file-name.module';
import { CurrencyPipeModule } from '../../shared/currency/currency.module';
import { InrCurrencyPipe } from '../../shared/currency/currency.pipe';
import { MessagingService } from '../../service/messaging.service';
import { FilterModule } from '../../shared/filters/filter.module';

//______________________ADD CODE Manually____________________________________//
import { AccountingAuditReportRoutingModule } from './accounting-audit-report-routing.module';
import { SalesRegisterReportComponent } from './sales-register-report/sales-register-report.component';
import { PurchaseRegisterLocalReportComponent } from './purchase-register-local-report/purchase-register-local-report.component';
import { PurchaseRegisterImportReportComponent } from './purchase-register-import-report/purchase-register-import-report.component';
import { FreightOutwardRegisterReportComponent } from './freight-outward-register-report/freight-outward-register-report.component';
import { FreightStockTransferRegisterReportComponent } from './freight-stock-transfer-register-report/freight-stock-transfer-register-report.component';
import { FreightInwardRegisterReportComponent } from './freight-inward-register-report/freight-inward-register-report.component';
import { LocalPurchaseShortDamageComponent } from './local-purchase-short-damage/local-purchase-short-damage.component';
import { SalesShortDamageComponent } from './sales-short-damage/sales-short-damage.component';
import { SalesDiscountReportComponent } from './sales-discount-report/sales-discount-report.component';
import { ImportClearanceReportComponent } from './import-clearance-report/import-clearance-report.component';
import { ImportClearanceReport2Component } from './import-clearance-report2/import-clearance-report2.component';
import { PurchaseRegisterImportReportNewComponent } from './purchase-register-import-report-new/purchase-register-import-report-new.component';
import { ClearingExpensesReportComponent } from './clearing-expenses-report/clearing-expenses-report.component';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';

@NgModule({
	declarations: [
		SalesRegisterReportComponent,
		PurchaseRegisterLocalReportComponent,
		PurchaseRegisterImportReportComponent,
		FreightOutwardRegisterReportComponent,
		FreightStockTransferRegisterReportComponent,
		FreightInwardRegisterReportComponent,
		LocalPurchaseShortDamageComponent,
		SalesShortDamageComponent,
		SalesDiscountReportComponent,
		ImportClearanceReportComponent,
		ImportClearanceReport2Component,
		PurchaseRegisterImportReportNewComponent,
		ClearingExpensesReportComponent,
		
	],
	imports: [
		CommonModule,
		AccountingAuditReportRoutingModule,
		SharedModuleModule,
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		HttpClientModule,
		DataTableModule,
		LoadingSpinnerModule,
		TextMaskModule,
		ChipsModule,
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
		CheckboxModule,
		ProgressBarModule,
		CalendarModule,
		TableModule,
		InputSwitchModule,
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
		AmountFormattingPipeModule,
		ChartsModule,
		RadioButtonModule,
		ToggleButtonModule,
		FileNamePipeModule
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptorService,
			multi: true
		},
		AmountToWordPipe,
		InrCurrencyPipe,
		MessagingService,
	]
})
export class AccountingAuditReportModule { }
