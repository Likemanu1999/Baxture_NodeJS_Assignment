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
import { AmountFormattingPipeModule } from '../../shared/amount-formatting/amount-formatting.module';
import { UnsoldSummaryComponent } from './unsold-summary/unsold-summary.component';
import { InventoryRedisRoutingModule } from './inventory-redis-routing.module';
import { CentralRedisInventoryImportComponent } from './central-redis-inventory-import/central-redis-inventory-import.component';
import { CentralRedisInventoryLocalComponent } from './central-redis-inventory-local/central-redis-inventory-local.component';
import { UnsoldImportLocalComponent } from './unsold-import-local/unsold-import-local.component';
import { RedisBdInventoryComponent } from './redis-bd-inventory/redis-bd-inventory.component';
import { RedisDetailInventoryComponent } from './redis-detail-inventory/redis-detail-inventory.component';
import { RedisDetailInventoryImportLocalComponent } from './redis-detail-inventory-import-local/redis-detail-inventory-import-local.component';
import { RedisAllocatedInventoryComponent } from './redis-allocated-inventory/redis-allocated-inventory.component';
import { ReleaseUnsoldComponent } from './release-unsold/release-unsold.component';
import { PeppReleaseUnsoldComponent } from './pepp-release-unsold/pepp-release-unsold.component';
import { SalesPurchaseDispatchStockReportComponent } from '../inventory/sales-purchase-dispatch-stock-report/sales-purchase-dispatch-stock-report.component';
import { GodownStaffLinkComponent } from '../masters/godown-staff-link/godown-staff-link.component';
import { ShortDamageClearanceComponent } from '../inventory/short-damage-clearance/short-damage-clearance.component';
import { GodownStockComponent } from '../inventory/godown-stock/godown-stock.component';
import { InventoryMovementNewComponent } from './inventory-movement-new/inventory-movement-new.component';
import { RedisSurishaDetailInventoryComponent } from './redis-surisha-detail-inventory/redis-surisha-detail-inventory.component';
import { RedisBdInventoryNewComponent } from './redis-bd-inventory-new/redis-bd-inventory-new.component';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';

@NgModule({
	declarations: [
		UnsoldSummaryComponent,
		CentralRedisInventoryImportComponent,
		CentralRedisInventoryLocalComponent,
		UnsoldImportLocalComponent,
		RedisBdInventoryComponent,
		RedisDetailInventoryComponent,
		RedisDetailInventoryImportLocalComponent,
		RedisAllocatedInventoryComponent,
		ReleaseUnsoldComponent,
		PeppReleaseUnsoldComponent,
		SalesPurchaseDispatchStockReportComponent,
		GodownStaffLinkComponent,
		ShortDamageClearanceComponent,
		InventoryMovementNewComponent,
		RedisSurishaDetailInventoryComponent,
		RedisBdInventoryNewComponent,
		//GodownStockComponent
	],
	imports: [
		CommonModule,
		InventoryRedisRoutingModule,
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
		ChartsModule,
		SharedModuleModule
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptorService,
			multi: true
		}
	]
})
export class InventoryRedisModule { }
