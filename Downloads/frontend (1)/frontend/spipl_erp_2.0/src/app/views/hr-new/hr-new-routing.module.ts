import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { ListOfStaffComponent } from './list-of-staff/list-of-staff.component';
import { AddStaffMemberComponent } from './add-staff-member/add-staff-member.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { LeavesComponent } from './leaves/leaves.component';
import { AttendanceRulesComponent } from './attendance-rules/attendance-rules.component';
import { SalaryManagerComponent } from './salary-manager/salary-manager.component';
import { SalarySheetComponent } from './salary-sheet/salary-sheet.component';
import { AnnualCtcComponent } from './annual-ctc/annual-ctc.component';
import { Form16Component } from './form16/form16.component';

const routes: Routes = [
	{
		path: '',
		data: {
			title: 'HR'
		},
		children: [
			{
				path: '',
				redirectTo: 'hr-new'
			},
			{
				path: 'list-of-staff',
				component: ListOfStaffComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'List of Staff'
				}
			},
			{
				path: 'add-staff-member',
				component: AddStaffMemberComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Staff Member'
				}
			},
			{
				path: 'edit-staff-member/:id',
				component: AddStaffMemberComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Staff Member'
				}
			},
			{
				path: 'leaves',
				component: LeavesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Leaves'
				}
			},
			{
				path: 'holidays',
				component: HolidaysComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Holidays'
				}
			},
			{
				path: 'attendance-rules',
				component: AttendanceRulesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Attendance Rules'
				}
			},
			{
				path: 'salary-manager',
				component: SalaryManagerComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Salary Manager'
				}
			},
			{
				path: 'salary-sheet',
				component: SalarySheetComponent,
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
				path: 'form-16',
				component: Form16Component,
				canActivate: [AuthGuard],
				data: {
					title: 'Form 16'
				}
			},
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class HrNewRoutingModule { }
