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
import { ChartModule } from 'primeng/chart';
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
import { SalesHistoryNewComponent } from './sales-history-new/sales-history-new.component';
import { SalesPurchaseAverageNewComponent } from './sales-purchase-average-new/sales-purchase-average-new.component';
import { AnalyticsNewRoutingModule } from './analytics-new-routing.module';
import { ForwardBookingAvgPriceComponent } from './forward-booking-avg-price/forward-booking-avg-price.component';
import { ForexAverageReportComponent } from './forex-average-report/forex-average-report.component';
import { TotalLcOpenReportComponent } from './total-lc-open-report/total-lc-open-report.component';
import { HedgedUnhedgedSummaryComponent } from './hedged-unhedged-summary/hedged-unhedged-summary.component';
import { UserActivityLogComponent } from './user-activity-log/user-activity-log.component';
import { OrgContactsListComponent } from './org-contacts-list/org-contacts-list.component';
import { ForeignPurchseContractAverageReportComponent } from './foreign-purchse-contract-average-report/foreign-purchse-contract-average-report.component';
import { InactiveSalesAccountsComponent } from './inactive-sales-accounts/inactive-sales-accounts.component';
import { SalesAnalyticsBuyingTrendsComponent } from './sales-analytics-buying-trends/sales-analytics-buying-trends.component';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';
import { OrgSummaryViewComponent } from './org-summary-view/org-summary-view.component';

@NgModule({
	declarations: [
		SalesHistoryNewComponent,
		SalesPurchaseAverageNewComponent,
		ForwardBookingAvgPriceComponent,
		ForexAverageReportComponent,
		TotalLcOpenReportComponent,
		HedgedUnhedgedSummaryComponent,
		UserActivityLogComponent,
		OrgContactsListComponent,
		ForeignPurchseContractAverageReportComponent,
		InactiveSalesAccountsComponent,
		SalesAnalyticsBuyingTrendsComponent,
		OrgSummaryViewComponent
	],
	imports: [
		CommonModule,
		SharedModuleModule,
		AnalyticsNewRoutingModule,
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		HttpClientModule,
		DataTableModule,
		LoadingSpinnerModule,
		TextMaskModule,
		ChipsModule,
		ChartModule,
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
export class AnalyticsNewModule { }
