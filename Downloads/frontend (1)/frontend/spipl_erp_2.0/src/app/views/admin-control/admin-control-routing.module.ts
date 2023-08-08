import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { AdjustAttendanceComponent } from './adjust-attendance/adjust-attendance.component';
import { CronTriggerComponent } from './cron-trigger/cron-trigger.component';
import { PlastIndiaComponent } from './plast-india/plast-india.component';

const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Admin Control'
		},
		children: [
			{
				path: '',
				redirectTo: 'admin-control'
			},
			{
				path: 'adjust-attendance',
				component: AdjustAttendanceComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Adjust Attendance'
				}
			},
			{
				path: 'plast-india',
				component: PlastIndiaComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Plast India'
				}
			},
			{
				path: 'cron-trigger',
				component: CronTriggerComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Trigger CRON'
				}
			},
		]
	}
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class AdminControlRoutingModule { }