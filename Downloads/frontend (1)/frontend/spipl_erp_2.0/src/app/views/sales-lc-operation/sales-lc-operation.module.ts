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
import { SalesPiComponent } from '../sales/sales-pi/sales-pi.component';
import { SalesLcComponent } from '../sales/sales-lc/sales-lc.component';
import { SalesDealsComponent } from '../sales/sales-deals/sales-deals.component';
import { SalesLcOperationRoutingModule } from './sales-lc-operation-routing.module';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { ApprovePiComponent } from './approve-pi/approve-pi.component';
import { ApproveLcComponent } from './approve-lc/approve-lc.component';
import { UploadDocumentsComponent } from './upload-documents/upload-documents.component';

@NgModule({
	declarations: [
		SalesDealsComponent,
		SalesPiComponent,
		SalesLcComponent,
		ApprovePiComponent,
		ApproveLcComponent,
		UploadDocumentsComponent	
	],
	imports: [
		CommonModule,
		SharedModuleModule,
		SalesLcOperationRoutingModule,
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
export class SalesLcOperationModule { }


