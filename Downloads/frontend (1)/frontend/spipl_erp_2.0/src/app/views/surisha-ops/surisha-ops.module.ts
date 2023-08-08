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
import { SelectButtonModule } from 'primeng/selectbutton';
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
import { SurishaOpsRoutingModule } from './surisha-ops-routing.module';
import { SurishaTrackingReportComponent } from './surisha-tracking-report/surisha-tracking-report.component';
import { PurchaseSalesLinkingComponent } from './purchase-sales-linking/purchase-sales-linking.component';
import { SalesEtaPlanningComponent } from './sales-eta-planning/sales-eta-planning.component'
import { HTMLSanitizeModule } from '../../shared/html-sanitize/html-sanitize.module';
import { SalesPendingLinksComponent } from './sales-pending-links/sales-pending-links.component';
import { CustomerSalesReportComponent } from './customer-sales-report/customer-sales-report.component';
import { DealOffersComponent } from './deal-offers/deal-offers.component';
import { AddDealComponent } from './add-deal/add-deal.component';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';
import { DealLauncherComponent } from './deal-launcher/deal-launcher.component';
import { MaterialArrivalChartComponent } from './material-arrival-chart/material-arrival-chart.component';


@NgModule({
	declarations: [
		SurishaTrackingReportComponent,
		PurchaseSalesLinkingComponent,
		SalesEtaPlanningComponent,
		SalesPendingLinksComponent,
		CustomerSalesReportComponent,
		DealOffersComponent,
		AddDealComponent,
		DealLauncherComponent,
		MaterialArrivalChartComponent],
	imports: [
		CommonModule,
		SurishaOpsRoutingModule,
		SharedModuleModule,
		ReactiveFormsModule,
		FormsModule,
		HttpClientModule,
		DataTableModule,
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
		HTMLSanitizeModule
	]
})
export class SurishaOpsModule { }
