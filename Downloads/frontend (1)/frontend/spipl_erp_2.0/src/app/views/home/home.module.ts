import { ChartsModule } from 'ng2-charts';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ChipsModule } from 'primeng/chips';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { ToasterModule } from 'angular2-toaster';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CKEditorModule } from 'ngx-ckeditor';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { NumbersDirectiveModule } from '../../directives/numbers-directive.module';
import { CurrencyPipeModule } from '../../shared/currency/currency.module';
import { FilterModule } from '../../shared/filters/filter.module';
import { AmountFormattingPipeModule } from '../../shared/amount-formatting/amount-formatting.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { DashboardNewComponent } from './dashboard-new/dashboard-new.component';
import { HomeRoutingModule } from './home-routing.module';
import { ImportDashboardComponent } from './import-dashboard/import-dashboard.component';
import { SurishaPurchaseSalesComponent } from './surisha-purchase-sales/surisha-purchase-sales.component';
import { SharedModule } from 'primeng/components/common/shared';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';
import { LocalPurchaseDashboardComponent } from '../local-purchase/local-purchase-dashboard/local-purchase-dashboard.component';
import { ForexDashboardComponent } from '../forex/forex-dashboard/forex-dashboard.component';

@NgModule({
	imports: [
		FormsModule,
		SharedModule,
		SharedModuleModule,
		HomeRoutingModule,
		ChartsModule,
		ButtonsModule.forRoot(),
		CommonModule,
		ReactiveFormsModule,
		NgxPaginationModule,
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
		ChartsModule
	],
	declarations: [
		DashboardNewComponent,
		ImportDashboardComponent,
		SurishaPurchaseSalesComponent,
		LocalPurchaseDashboardComponent,
		ForexDashboardComponent
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptorService,
			multi: true
		}
	]
})

export class HomeModule { }
