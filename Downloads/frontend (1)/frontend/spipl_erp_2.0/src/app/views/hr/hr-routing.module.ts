import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddStaffMasterComponent } from './add-staff-master/add-staff-master.component';
import { ListStaffMasterComponent } from './list-staff-master/list-staff-master.component';
import { ViewStaffMasterComponent } from './view-staff-master/view-staff-master.component';
import { LeavesMasterComponent } from './leaves-master/leaves-master.component';
import { AttendenceRuleComponent } from './attendence-rule/attendence-rule.component';
import { SalaryCalculatorComponent } from './salary-calculator/salary-calculator.component';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';
import { TdsCalComponent } from './tds-cal/tds-cal.component';
import { AppointmentLetterComponent } from './appointment-letter/appointment-letter.component';
import { HolidayCalendarComponent } from './holiday-calendar/holiday-calendar.component';
import { TaxComplianceComponent } from './tax-compliance/tax-compliance.component';
import { AddEditTaxComplianceMasterComponent } from './tax-compliance/add-edit-tax-compliance-master/add-edit-tax-compliance-master.component';
import { TaxComplianceDetailsComponent } from './tax-compliance/tax-compliance-details/tax-compliance-details.component';
import { AddEditTaxComplianceDetailsComponent } from './tax-compliance/tax-compliance-details/add-edit-tax-compliance-details/add-edit-tax-compliance-details.component';
import { AuthGuard } from '../../_helpers/auth.guard';
import { JobProfileMasterComponent } from '../masters/job-profile-master/job-profile-master.component';
import { DepartmentMasterComponent } from '../masters/department-master/department-master.component';
import { QualificationMasterComponent } from '../masters/qualification-master/qualification-master.component';
import { SalaryDetailsSheetComponent } from './salary-details-sheet/salary-details-sheet.component';
import { SalaryManagerComponent } from './salary-manager/salary-manager.component';
import { AnnualCtcComponent } from './annual-ctc/annual-ctc.component';
import { AddHolidayDateComponent } from './add-holiday-date/add-holiday-date.component';
import { EmployeeInvestmentComponent } from './employee-investment/employee-investment.component';
import { EmployeeForm16Component } from './employee-form16/employee-form16.component';
import { JobReferencesComponent } from './job-references/job-references.component';
import { ThirdPartyPayrollComponent } from './third-party-payroll/third-party-payroll.component';
import { SalaryViewComponent } from './salary-view/salary-view.component';
import { EmployeeEsiComponent } from './employee-esi/employee-esi.component';
import { EmployeePfComponent } from './employee-pf/employee-pf.component';

const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Hr'
		},
		children: [
			{
				path: '',
				redirectTo: 'hr'
			},
			{
				path: 'add-staff',
				component: AddStaffMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Staff'
				}
			},
			{
				path: 'list-staff',
				component: ListStaffMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'List Staff'
				}
			},
			{
				path: 'add-staff/:id',
				component: AddStaffMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Staff'
				}
			},
			{
				path: 'my-profile/:id',
				component: ViewStaffMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'My Profile'
				}
			},
			{
				path: 'view-staff/:id',
				component: ViewStaffMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'View Staff'
				}
			},
			{
				path: 'leaves',
				component: LeavesMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'View Leaves'
				}
			},
			{
				path: 'attendance-rule',
				component: AttendenceRuleComponent,
				data: {
					title: 'Attendence Rules'
				}
			},
			// {
			// 	path: 'salary-manager',
			// 	component: SalaryCalculatorComponent,
			// 	canActivate: [AuthGuard],
			// 	data: {
			// 		title: 'Salary Manager'
			// 	}
			// },
			{
				path: 'salary-manager',
				component: SalaryManagerComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Salary Manager'
				}
			},
			{
				path: 'salary-view',
				component: SalaryViewComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Salary View'
				}
			},
			{
				path: 'attendance-report',
				component: AttendanceReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Report'
				}
			},
			{
				path: 'tds-cal',
				component: TdsCalComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'TDS Calculator'
				}
			},
			{
				path: 'appointment-letter',
				component: AppointmentLetterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Appointment Letter'
				}
			},
			{
				path: 'holiday-calendar',
				component: HolidayCalendarComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Holiday Calendar'
				}
			},
			{
				path: 'tax-compliance',
				component: TaxComplianceComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Tax Compliance'
				}
			},
			{
				path: 'add-tax-compliance-master',
				component: AddEditTaxComplianceMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Tax Compliance'
				}
			},
			{
				path: 'edit-tax-compliance-master/:tax_compliance_master_id',
				component: AddEditTaxComplianceMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Tax Compliance'
				}
			},
			{
				path: 'tax-compliance-details/:tax_compliance_master_id',
				canActivate: [AuthGuard],
				component: TaxComplianceDetailsComponent,
				data: {
					title: 'Tax Compliance Details'
				}
			},
			{
				path: 'add-tax-compliance-details/:tax_compliance_master_id',
				canActivate: [AuthGuard],
				component: AddEditTaxComplianceDetailsComponent,
				data: {
					title: 'Tax Compliance Details Add'
				}
			},
			{
				path: 'edit-tax-compliance-details/:tax_compliance_details_id/:tax_compliance_master_id',
				component: AddEditTaxComplianceDetailsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Tax Compliance Details Edit'
				}
			},
			{
				path: 'job-profile-master',
				component: JobProfileMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Job Profile Master'
				}
			},
			{
				path: 'department-master',
				component: DepartmentMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Department Master'
				}
			},
			{
				path: 'qualification-master',
				component: QualificationMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Qualification master'
				}
			},
			{
				path: 'salary-sheet',
				component: SalaryDetailsSheetComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Salary Sheet'
				}
			},
			{
				path: 'annual-ctc',
				component: AnnualCtcComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Annual CTC'
				}
			},
			{
				path: 'add-new-holiday',
				component: AddHolidayDateComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add New Holiday'
				}
			},
			{
				path: 'employee-tds',
				component: EmployeeInvestmentComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Employee TDS'
				}
			},
			{
				path: 'employee-form-16',
				component: EmployeeForm16Component,
				canActivate: [AuthGuard],
				data: {
					title: 'Employee Form-16'
				}
			},
			{
				path: 'job-references',
				component: JobReferencesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Job References'
				}
			},
			{
				path: 'third-party-payroll',
				component: ThirdPartyPayrollComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Third Party Payroll'
				}
			},
			{
				path: 'employee-pf',
				component: EmployeePfComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Employee PF'
				}
			},
			{
				path: 'employee-esi',
				component: EmployeeEsiComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Employee ESI'
				}
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HrRoutingModule { }
