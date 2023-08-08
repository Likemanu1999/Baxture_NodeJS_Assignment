import { BsDatepickerModule, CollapseModule, ModalModule, TabsModule, TimepickerModule } from 'ngx-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SalesRoutingModule } from './sales-routing.module';
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
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ChartsModule } from 'ng2-charts';
import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table'  
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

import { AddStockTransferComponent } from './add-stock-transfer/add-stock-transfer.component';
import { BlacklistUserComponent } from './blacklist-user/blacklist-user.component';
import { DailyGradeRatesComponent } from './daily-grade-rates/daily-grade-rates.component';
import { DailyStockAllocationComponent } from './daily-stock-allocation/daily-stock-allocation.component';
import { ManagementOperationsComponent } from './management-operations/management-operations.component';
import { PaymentDetailsComponent } from './sales-reports/payment-details/payment-details.component';
import { SalesUtilityComponent } from './sales-utility/sales-utility.component';
import { StockTransferComponent } from './stock-transfer/stock-transper.component';
import { BillOfExchangeComponent } from './bill-of-exchange/bill-of-exchange.component';
import { AddSalesOrderComponent } from './add-sales-order/add-sales-order.component';
import { SalesOrdersComponent } from './sales-orders/sales-orders.component';
import { DispatchBillingComponent } from './dispatch-billing/dispatch-billing.component';
import { AddFinanceComponent } from './add-finance/add-finance.component';
import { DispatchComponent } from './dispatch/dispatch.component';
import { AddDispatchComponent } from './add-dispatch/add-dispatch.component';
import { SalesReturnComponent } from './sales-return/sales-return.component';
import { ShortDamageComponent } from './short-damage/short-damage.component';
import { CommissionComponent } from './commission/commission.component';
import { MiddlewarePaymentsComponent } from './middleware-payments/middleware-payments.component';
import { DispatchPaymentComponent } from './dispatch-payment/dispatch-payment.component';
import { AddHighSeasOrderComponent } from './add-high-seas-order/add-high-seas-order.component';
import { HighSeasOrdersComponent } from './high-seas-orders/high-seas-orders.component';
import { FinanceReportComponent } from './finance-report/finance-report.component';
import { LoadCrossReportComponent } from './load-cross-report/load-cross-report.component';
import { SalesAverageReportComponent } from './sales-average-report/sales-average-report.component';
import { FinanceComponent } from './finance/finance.component';
import { SalesUtilityNewComponent } from './sales-utility-new/sales-utility-new.component';
import { DispatchReportComponent } from './dispatch-report/dispatch-report.component';
import { CustomerAdvancedComponent } from './sales-reports/customer-advanced/customer-advanced.component';
import { StockTransferNewComponent } from './stock-transfer-new/stock-transfer-new.component';
import { AdjustSuspenseAmountComponent } from './adjust-suspense-amount/adjust-suspense-amount.component';
import { BlacklistUsersNewComponent } from './blacklist-users-new/blacklist-users-new.component';
import { SalesOrderLocalReportComponent } from './sales-reports/sales-order-local-report/sales-order-local-report.component';
import { SalesOrderImportReportComponent } from './sales-reports/sales-order-import-report/sales-order-import-report.component';
import { LocalOutstandingReportComponent } from './sales-reports/local-outstanding-report/local-outstanding-report.component';
import { DiscountReportComponent } from './discount-report/discount-report.component';
import { TransnationalSalesComponent } from './transnational-sales/transnational-sales.component';
import { AddTransnationalOrderComponent } from './add-transnational-order/add-transnational-order.component';
import { TransnationalLcComponent } from './transnational-lc/transnational-lc.component';
import { TransnationalNonComponent } from './transnational-non/transnational-non.component';
import { ImportSalesComponent } from './import-sales/import-sales.component';
import { AddImportSalesOrderComponent } from './add-import-sales-order/add-import-sales-order.component';
import { PriceProtectionComponent } from './sales-reports/price-protection/price-protection.component';
import { DispatchAcknowledgmentComponent } from './dispatch-acknowledgment/dispatch-acknowledgment.component';
import { IftPaymentComponent } from './ift-payment/ift-payment.component';
import { SalesAverageReportNewComponent } from './sales-average-report-new/sales-average-report-new.component';
import { InsiderListComponent } from './insider-list/insider-list.component';
import { DispatchTransporterListComponent } from './dispatch-transporters-list/dispatch-transporters-list.component';
import { KnockOffOrdersComponent } from './knock-off-orders/knock-off-orders.component';
import { VaErrorsComponent } from './va-errors/va-errors.component';
import { DetailAverageReportComponent } from './detail-average-report/detail-average-report.component';
import { ImportLocalRequestListComponent } from './import-local-request-list/import-local-request-list.component';
import { MiddlewarePaymentsRevampComponent } from './middleware-payments-revamp/middleware-payments-revamp.component';
import { FreightRateComponent } from './freight-rate/freight-rate.component';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';
import { FreightTrackingComponent } from './freight-tracking/freight-tracking.component';
import { LogisticsDashboradComponent } from './logistics-dashborad/logistics-dashborad.component';
import { ForwardSalesOrdersComponent } from './forward-sales-orders/forward-sales-orders.component';
import { ForwardSalesOutstandingComponent } from './forward-sales-outstanding/forward-sales-outstanding.component';
import { SalesActivityTrackingComponent } from './sales-activity-tracking/sales-activity-tracking.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
	declarations: [
		DailyGradeRatesComponent,
		StockTransferComponent,
		AddStockTransferComponent,
		DailyStockAllocationComponent,
		BlacklistUserComponent,
		SalesUtilityComponent,
		ManagementOperationsComponent,
		PaymentDetailsComponent,
		BillOfExchangeComponent,
		AddSalesOrderComponent,
		SalesOrdersComponent,
		DispatchBillingComponent,
		AddFinanceComponent,
		DispatchComponent,
		AddDispatchComponent,
		SalesReturnComponent,
		ShortDamageComponent,
		CommissionComponent,
		MiddlewarePaymentsComponent,
		DispatchPaymentComponent,
		AddHighSeasOrderComponent,
		HighSeasOrdersComponent,
		FinanceReportComponent,
		LoadCrossReportComponent,
		SalesAverageReportComponent,
		FinanceComponent,
		SalesUtilityNewComponent,
		DispatchReportComponent,
		CustomerAdvancedComponent,
		StockTransferNewComponent,
		AdjustSuspenseAmountComponent,
		BlacklistUsersNewComponent,
		SalesOrderLocalReportComponent,
		SalesOrderImportReportComponent,
		LocalOutstandingReportComponent,
		DiscountReportComponent,
		TransnationalSalesComponent,
		AddTransnationalOrderComponent,
		TransnationalLcComponent,
		TransnationalNonComponent,
		ImportSalesComponent,
		AddImportSalesOrderComponent,
		PriceProtectionComponent,
		DispatchAcknowledgmentComponent,
		IftPaymentComponent,
		SalesAverageReportNewComponent,
		InsiderListComponent,
		DispatchTransporterListComponent,
		KnockOffOrdersComponent,
		VaErrorsComponent,
		DetailAverageReportComponent,
		ImportLocalRequestListComponent,
		MiddlewarePaymentsRevampComponent,
		FreightRateComponent,
		FreightTrackingComponent,
		LogisticsDashboradComponent,
		ForwardSalesOrdersComponent,
		ForwardSalesOutstandingComponent,
		SalesActivityTrackingComponent
		
	],
	imports: [
		CommonModule,
		SharedModuleModule,
		SalesRoutingModule,
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		HttpClientModule,
		MatFormFieldModule,
		MatInputModule,
		DataTableModule,
		MatTableModule,
		LoadingSpinnerModule,
		TextMaskModule,
		ChipsModule,
		ChartModule,
		SelectButtonModule,
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
export class SalesModule { }
