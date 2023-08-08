import { BsDatepickerModule, ModalModule, TabsModule, TimepickerModule } from 'ngx-bootstrap';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HrNewRoutingModule } from './hr-new-routing.module';
import { AmountToWordPipe } from '../../shared/amount-to-word/amount-to-word.pipe';
import { CurrencyPipeModule } from '../../shared/currency/currency.module';
import { FileNamePipeModule } from '../../shared/file-name/file-name.module';
import { FilterModule } from '../../shared/filters/filter.module';
import { InrCurrencyPipe } from '../../shared/currency/currency.pipe';
import { NullReplacePipeModule } from '../../shared/null-replace/null-replace.module';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import { AmountFormattingPipeModule } from '../../shared/amount-formatting/amount-formatting.module';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { MessagingService } from '../../service/messaging.service';
import { NumbersDirectiveModule } from '../../directives/numbers-directive.module';
import { CrudServices } from '../../shared/crud-services/crud-services';
import { PermissionService } from '../../shared/pemission-services/pemission-service';
import { ExportService } from '../../shared/export-service/export-service';

import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { ButtonModule } from 'primeng/button';
import { CKEditorModule } from 'ngx-ckeditor';
import { CheckboxModule } from 'primeng/checkbox';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataTableModule } from 'angular2-datatable';
import { DropdownModule } from 'primeng/dropdown';
import { FullCalendarModule } from 'primeng/fullcalendar';
import { InputTextModule } from 'primeng/inputtext';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NgSelectModule } from '@ng-select/ng-select';
import { TableModule } from 'primeng/table';
import { TextMaskModule } from 'angular2-text-mask';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { ListOfStaffComponent } from './list-of-staff/list-of-staff.component';
import { AddStaffMemberComponent } from './add-staff-member/add-staff-member.component';
import { LeavesComponent } from './leaves/leaves.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { AttendanceRulesComponent } from './attendance-rules/attendance-rules.component';
import { SalaryManagerComponent } from './salary-manager/salary-manager.component';
import { SalarySheetComponent } from './salary-sheet/salary-sheet.component';
import { AnnualCtcComponent } from './annual-ctc/annual-ctc.component';
import { Form16Component } from './form16/form16.component';

@NgModule({
	declarations: [
		ListOfStaffComponent,
		AddStaffMemberComponent,
		LeavesComponent,
		HolidaysComponent,
		AttendanceRulesComponent,
		SalaryManagerComponent,
		SalarySheetComponent,
		AnnualCtcComponent,
		Form16Component
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		HttpClientModule,
		FormsModule,
		HrNewRoutingModule,
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
		ButtonModule,
		CollapseModule,
		CKEditorModule,
		ModalModule.forRoot(),
		MatTabsModule,
		MatStepperModule,
		NullReplacePipeModule,
		TooltipModule.forRoot(),
		ConfirmationPopoverModule.forRoot({
			confirmButtonType: 'danger' // set defaults here
		}),
		InputTextModule,
		NumbersDirectiveModule,
		CurrencyPipeModule,
		AmountFormattingPipeModule,
		DropdownModule,
		MultiSelectModule,
		CheckboxModule,
		FullCalendarModule,
		ContextMenuModule,
		CalendarModule.forRoot({
			provide: DateAdapter,
			useFactory: adapterFactory,
		}),
		FileNamePipeModule,
		RadioButtonModule
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptorService,
			multi: true
		},
		AmountToWordPipe,
		InrCurrencyPipe,
		FileNamePipeModule,
		MessagingService,
		CrudServices,
		ToasterService,
		PermissionService,
		ExportService
	],
})
export class HrNewModule { }
