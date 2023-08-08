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
import { ChipsModule } from 'primeng/chips';
import { ChartsModule } from 'ng2-charts';
import { InventoryRoutingModule } from './inventory-routing.module';
import { AmountFormattingPipeModule } from '../../shared/amount-formatting/amount-formatting.module';
import { LiveInventoryComponent } from './live-inventory/live-inventory.component';
import { LiveStockComponent } from './live-stock/live-stock.component';
import { DetailInventoryComponent } from './detail-inventory/detail-inventory.component';
import { UnsoldSummaryComponent } from './unsold-summary/unsold-summary.component';
import { CentralLiveStockComponent } from './central-live-stock/central-live-stock.component';
import { ZoneWiseStockComponent } from './zone-wise-stock/zone-wise-stock.component';
import { SalesPurchaseDispatchStockReportComponent } from './sales-purchase-dispatch-stock-report/sales-purchase-dispatch-stock-report.component';
import { PvcPolyInventoryComponent } from './pvc-poly-inventory/pvc-poly-inventory.component';
import { CentralLiveStockImportLocalComponent } from './central-live-stock-import-local/central-live-stock-import-local.component';
import { CentralInventoryLocalComponent } from './central-inventory-local/central-inventory-local.component';
import { ShortDamageClearanceComponent } from './short-damage-clearance/short-damage-clearance.component';
import { DetailInventoryImportLocalComponent } from './detail-inventory-import-local/detail-inventory-import-local.component';
import { AllocatedImportLocalInventoryComponent } from './allocated-import-local-inventory/allocated-import-local-inventory.component';
import { UnsoldSummaryImportLocalComponent } from './unsold-summary-import-local/unsold-summary-import-local.component';
import { UnsoldSummaryOldComponent } from './unsold-summary-old/unsold-summary.component-old';
import { GodownStockComponent } from './godown-stock/godown-stock.component';
import { UnsoldSummaryImportLocalFilteredComponent } from './unsold-summary-import-local-filtered/unsold-summary-import-local-filtered.component';
import { CentralLiveStockImportLocalNewComponent } from './central-live-stock-import-local-new/central-live-stock-import-local-new.component';

@NgModule({
	declarations: [
		LiveInventoryComponent,
		LiveStockComponent,
		DetailInventoryComponent,
		UnsoldSummaryComponent,
		CentralLiveStockComponent,
		ZoneWiseStockComponent,
		//SalesPurchaseDispatchStockReportComponent,
		PvcPolyInventoryComponent,
		CentralLiveStockImportLocalComponent,
		CentralInventoryLocalComponent,
		DetailInventoryImportLocalComponent,
		//ShortDamageClearanceComponent,
		AllocatedImportLocalInventoryComponent,
		UnsoldSummaryImportLocalComponent,
		UnsoldSummaryOldComponent,
		GodownStockComponent,
		UnsoldSummaryImportLocalFilteredComponent,
		CentralLiveStockImportLocalNewComponent],
	imports: [
		CommonModule,
		InventoryRoutingModule,
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
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptorService,
			multi: true
		}
	]
})
export class InventoryModule { }
