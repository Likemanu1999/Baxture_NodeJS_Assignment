import { BsDatepickerModule, ModalModule, TabsModule, TimepickerModule } from 'ngx-bootstrap';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AddEditTaxComplianceDetailsComponent } from './tax-compliance/tax-compliance-details/add-edit-tax-compliance-details/add-edit-tax-compliance-details.component';
import { AddEditTaxComplianceMasterComponent } from './tax-compliance/add-edit-tax-compliance-master/add-edit-tax-compliance-master.component';
import { AddStaffMasterComponent } from './add-staff-master/add-staff-master.component';
import { AmountToWordPipe } from '../../shared/amount-to-word/amount-to-word.pipe';
import { AppointmentLetterComponent } from './appointment-letter/appointment-letter.component';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';
import { AttendenceRuleComponent } from './attendence-rule/attendence-rule.component';
import { ButtonModule } from 'primeng/button';
import { CKEditorModule } from 'ngx-ckeditor';
import { CheckboxModule } from 'primeng/checkbox';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { CommonModule } from '@angular/common';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { ContextMenuModule } from 'primeng/contextmenu';
import { CurrencyPipeModule } from '../../shared/currency/currency.module';
import { DataTableModule } from 'angular2-datatable';
import { DepartmentMasterComponent } from '../masters/department-master/department-master.component';
import { DropdownModule } from 'primeng/dropdown';
import { FileNamePipeModule } from '../../shared/file-name/file-name.module';
import { FilterModule } from '../../shared/filters/filter.module';
import { FullCalendarModule } from 'primeng/fullcalendar';
import { HolidayCalendarComponent } from './holiday-calendar/holiday-calendar.component';
import { HrRoutingModule } from './hr-routing.module';
import { InputTextModule } from 'primeng/inputtext';
import { InrCurrencyPipe } from '../../shared/currency/currency.pipe';
import { InvestmentDetailsComponent } from './investment-details/investment-details.component';
import { JobProfileMasterComponent } from '../masters/job-profile-master/job-profile-master.component';
import { LeavesMasterComponent } from './leaves-master/leaves-master.component';
import { ListStaffMasterComponent } from './list-staff-master/list-staff-master.component';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgModule } from '@angular/core';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NgSelectModule } from '@ng-select/ng-select';
import { NullReplacePipeModule } from '../../shared/null-replace/null-replace.module';
import { NumbersDirectiveModule } from '../../directives/numbers-directive.module';
import { PayableRequestModule } from '../../shared/payable-request/payable-request.module';
import { QualificationMasterComponent } from '../masters/qualification-master/qualification-master.component';
import { SalaryCalculatorComponent } from './salary-calculator/salary-calculator.component';
import { SalaryDetailsComponent } from './salary-details/salary-details.component';
import { SalaryDetailsSheetComponent } from './salary-details-sheet/salary-details-sheet.component';
import { SalaryManagerComponent } from './salary-manager/salary-manager.component';
import { TableModule } from 'primeng/table';
import { TaxComplianceComponent } from './tax-compliance/tax-compliance.component';
import { TaxComplianceDetailsComponent } from './tax-compliance/tax-compliance-details/tax-compliance-details.component';
import { TdsCalComponent } from './tds-cal/tds-cal.component';
import { TextMaskModule } from 'angular2-text-mask';
import { ToasterModule } from 'angular2-toaster';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ViewStaffMasterComponent } from './view-staff-master/view-staff-master.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { AnnualCtcComponent } from './annual-ctc/annual-ctc.component';
import { AddHolidayDateComponent } from './add-holiday-date/add-holiday-date.component';
import { EmployeeInvestmentComponent } from './employee-investment/employee-investment.component';
import { AppointmentLetterNewComponent } from './appointment-letter-new/appointment-letter-new.component';
import { EmployeeForm16Component } from './employee-form16/employee-form16.component';
import { JobReferencesComponent } from './job-references/job-references.component';
import { ThirdPartyPayrollComponent } from './third-party-payroll/third-party-payroll.component';
import { SalarySheetNewComponent } from './salary-sheet-new/salary-sheet-new.component';
import { SalaryViewComponent } from './salary-view/salary-view.component';
import { EmployeeEsiComponent } from './employee-esi/employee-esi.component';
import { EmployeePfComponent } from './employee-pf/employee-pf.component';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';
@NgModule({
	declarations: [
		AddStaffMasterComponent,
		ListStaffMasterComponent,
		ViewStaffMasterComponent,
		LeavesMasterComponent,
		AttendenceRuleComponent,
		SalaryDetailsComponent,
		SalaryCalculatorComponent,
		AttendanceReportComponent,
		InvestmentDetailsComponent,
		TdsCalComponent,
		QualificationMasterComponent,
		DepartmentMasterComponent,
		AppointmentLetterComponent,
		HolidayCalendarComponent,
		TaxComplianceComponent,
		AddEditTaxComplianceMasterComponent,
		TaxComplianceDetailsComponent,
		AddEditTaxComplianceDetailsComponent,
		JobProfileMasterComponent,
		SalaryDetailsSheetComponent,
		SalaryManagerComponent,
		AnnualCtcComponent,
		AddHolidayDateComponent,
		EmployeeInvestmentComponent,
		AppointmentLetterNewComponent,
		EmployeeForm16Component,
		JobReferencesComponent,
		ThirdPartyPayrollComponent,
		SalarySheetNewComponent,
		SalaryViewComponent,
		EmployeeEsiComponent,
		EmployeePfComponent
	],
	imports: [
		CommonModule,
		SharedModuleModule,
		ReactiveFormsModule,
		HttpClientModule,
		FormsModule,
		HrRoutingModule,
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
		PayableRequestModule,
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
		FileNamePipeModule
	],
})
export class HrModule { }
