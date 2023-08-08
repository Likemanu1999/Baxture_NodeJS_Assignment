import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { DashboardNewComponent } from './dashboard-new/dashboard-new.component';
import { ImportDashboardComponent } from './import-dashboard/import-dashboard.component';
import { SurishaPurchaseSalesComponent } from './surisha-purchase-sales/surisha-purchase-sales.component';
import { LocalPurchaseDashboardComponent } from '../local-purchase/local-purchase-dashboard/local-purchase-dashboard.component';
import { ForexDashboardComponent } from '../forex/forex-dashboard/forex-dashboard.component';


const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Home'
		},
		children: [
			{
				path: '',
				redirectTo: 'home'
			},
			{
				path: 'dashboard',
				component: DashboardNewComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Dashboard'
				}
			},
			{
				path: 'import-dashboard',
				component: ImportDashboardComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Import Dashboard'
				}
			},
			{
				path: 'surisha-purchase-sale',
				component: SurishaPurchaseSalesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Surisha Purchase Sale Dashboard'
				}
			},
			{
				path: 'local-purchase-dashboard',
				component: LocalPurchaseDashboardComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Local Purchase Dashboard'
				}
			},
			{
				path: 'forex-dashboard',
				component: ForexDashboardComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Forex Dashboard'
				}
			}
		]
	}
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class HomeRoutingModule { }