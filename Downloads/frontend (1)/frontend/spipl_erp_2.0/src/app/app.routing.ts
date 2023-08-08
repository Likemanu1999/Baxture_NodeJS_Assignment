
import { RouterModule, Routes } from '@angular/router';

import { AddFormSpiplSsurishaComponent } from './views/spipl-ssurisha-list/add-form-spipl-ssurisha/add-form-spipl-ssurisha.component';
import { AuthGuard } from './_helpers/auth.guard';
import { DefaultLayoutComponent } from './containers';
import { LoginComponent } from './views/login/login.component';
import { NgModule } from '@angular/core';
import { SSurishaTdsChargesFormComponent } from './views/ssurisha-tds-charges-form/tds-charges-form.component';
import { SpiplSsurishaListComponent } from './views/spipl-ssurisha-list/spipl-ssurisha-list.component';
import { TdsChargesFormComponent } from './views/tds-charges-form/tds-charges-form.component';
import { EwayDeclarationFormComponent } from './views/eway-declaration-form/eway-declaration-form.component';

// Import Containers

export const routes: Routes = [
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full',
	},
	{
		path: 'ewayform',
		component: EwayDeclarationFormComponent,
		data: {
			title: 'E-Way Declaration Form'
		}
	},
	{
		path: 'tdsform',
		component: TdsChargesFormComponent,
		data: {
			title: 'TDS Form'
		}
	},
	{
		path: 'ssurishatds',
		component: SSurishaTdsChargesFormComponent,
		data: {
			title: 'SSurisha TDS Form'
		}
	},
	{
		path: 'spipl_ssurisha_list',
		component: SpiplSsurishaListComponent,
		canActivate: [AuthGuard],
		data: {
			title: 'Spipl List'
		}
	},
	{
		path: 'add-form-spipl-ssurisha',
		component: AddFormSpiplSsurishaComponent,
		data: {
			title: 'Add Form SPIPL/Ssurisha'
		}
	},
	{
		path: 'login',
		component: LoginComponent,
		data: {
			title: 'Login Page'
		}
	},
	{
		path: '',
		component: DefaultLayoutComponent,
		canActivate: [AuthGuard],
		// data: {
		// 	title: 'ERP 2.0'
		// },
		children: [
			// {
			// 	path: 'dashboard_v2',
			// 	loadChildren: () => import('./views/dashboard-new/dashboard-new.module').then(m => m.DashboardNewModule)
			// },
			{
				path: 'home',
				loadChildren: () => import('./views/home/home.module').then(m => m.HomeModule)
			},
			{
				path: 'account',
				loadChildren: () => import('./views/account/account.module').then(m => m.AccountModule)
			},
			{
				path: 'masters',
				loadChildren: () => import('./views/masters/masters.module').then(m => m.MasterModule)
			},
			{
				path: 'hr',
				loadChildren: () => import('./views/hr/hr.module').then(m => m.HrModule)
			},
			{
				path: 'hr-new',
				loadChildren: () => import('./views/hr-new/hr-new.module').then(m => m.HrNewModule)
			},
			{
				path: 'developer-tools',
				loadChildren: () => import('./views/developer-tools/developer.module').then(m => m.DeveloperModule)
			},
			{
				path: 'expense',
				loadChildren: () => import('./views/expense/expense.module').then(m => m.ExpenseModule)
			},
			{
				path: 'forex',
				loadChildren: () => import('./views/forex/forex.module').then(m => m.ForexModule)
			},
			{
				path: 'sales',
				loadChildren: () => import('./views/sales/sales.module').then(m => m.SalesModule)
			},
			{
				path: 'sales-lc-operation',
				loadChildren: () => import('./views/sales-lc-operation/sales-lc-operation.module').then(m => m.SalesLcOperationModule)
			},
			{
				path: 'search',
				loadChildren: () => import('./views/search/search.module').then(m => m.SearchModule)
			},
			{
				path: 'local-purchase',
				loadChildren: () => import('./views/local-purchase/local-purchase.module').then(m => m.LocalPurchaseModule)
			},
			{
				path: 'payables',
				loadChildren: () => import('./views/payables/payables.module').then(m => m.PayablesModule)
			},
			{
				path: 'fd',
				loadChildren: () => import('./views/all-fd/all-fd.module').then(m => m.AllFdModule)
			},
			{
				path: 'sales',
				loadChildren: () => import('./views/sales/sales.module').then(m => m.SalesModule)
			},
			{
				path: 'logistics',
				loadChildren: () => import('./views/logistics/logistics.module').then(m => m.LogisticsModule)
			},
			{
				path: 'inventory',
				loadChildren: () => import('./views/inventory/inventory.module').then(m => m.InventoryModule)
			},
			{
				path: 'settings',
				loadChildren: () => import('./views/settings/settings.module').then(m => m.SettingsModule)
			},
			{
				path: 'mou',
				loadChildren: () => import('./views/mou/mou.module').then(m => m.MouModule)
			},
			{
				path: 'whatsapp',
				loadChildren: () => import('./views/whatsapp-broadcast/whatsapp-broadcast.module').then(m => m.WhatsappBroadcastModule)
			},
			{
				path: 'account-reports',
				loadChildren: () => import('./views/accounting-audit-report/accounting-audit-report.module').then(m => m.AccountingAuditReportModule)
			},
			{
				path: 'analytics',
				loadChildren: () => import('./views/analytics-new/analytics-new.module').then(m => m.AnalyticsNewModule)
			},
			{
				path: 'inventory-redis',
				loadChildren: () => import('./views/inventory-redis/inventory-redis.module').then(m => m.InventoryRedisModule)
			},
			{
				path: 'dumpyard',
				loadChildren: () => import('./views/all-reports-dump-yard/all-reports-dump-yard.module').then(m => m.AllReportsDumpYardModule)
			},
			{
				path: 'admin-control',
				loadChildren: () => import('./views/admin-control/admin-control.module').then(m => m.AdminControlModule)
			},
			{
				path: 'surisha-ops',
				loadChildren: () => import('./views/surisha-ops/surisha-ops.module').then(m => m.SurishaOpsModule)
			},
			{
				path: 'marketing',
				loadChildren: () => import('./views/marketing/marketing.module').then(m => m.MarketingModule)
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
