import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Permission } from '../../shared/apis-path/apis-path';
import { AuthGuard } from '../../_helpers/auth.guard';
import { TelephoneExtensionsComponent } from './telephone-extensions/telephone-extensions.component';
import { UpcomingBirthdaysComponent } from '../account/upcoming-birthdays/upcoming-birthdays.component';
import { MyJobReferencesComponent } from './my-job-references/my-job-references.component';

const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Account'
		},
		children: [
			{
				path: '',
				redirectTo: 'account'
			},
			{
				path: 'telephone-extensions',
				component: TelephoneExtensionsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Telephone Extensions'
				}
			},
			{
				path: 'upcoming-birthdays',
				component: UpcomingBirthdaysComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Upcoming Birthdays'
				}
			},
			{
				path: 'my-job-references',
				component: MyJobReferencesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'My Job References'
				}
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AccountRoutingModule { }
