
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { NgModule } from '@angular/core';
import { SurishaTrackingReportComponent } from './surisha-tracking-report/surisha-tracking-report.component';
import { PurchaseSalesLinkingComponent } from './purchase-sales-linking/purchase-sales-linking.component';
import { SalesEtaPlanningComponent } from './sales-eta-planning/sales-eta-planning.component';
import { SalesPendingLinksComponent } from './sales-pending-links/sales-pending-links.component';
import { CustomerSalesReportComponent } from './customer-sales-report/customer-sales-report.component';
import { DealOffersComponent } from './deal-offers/deal-offers.component';
import { AddDealComponent } from './add-deal/add-deal.component';
import { DealLauncherComponent } from './deal-launcher/deal-launcher.component';
import { MaterialArrivalChartComponent } from './material-arrival-chart/material-arrival-chart.component';


const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Surisha Operations'
		},
		children: [
			{
				path: '',
				redirectTo: 'surisha-ops'
			},
			{
				path: 'surisha-tracking-report',
				component: SurishaTrackingReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Surisha Sale Purchase Tracking'
				}
			},
			{
				path: 'purchase-sales-linking',
				component: PurchaseSalesLinkingComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Purchase Sales Linking'
				}
			},

			{
				path: 'sales-eta-planning',
				component: SalesEtaPlanningComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales ETA Planning'
				}
			},

			{
				path: 'sales-pending-links',
				component: SalesPendingLinksComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Pending Links'
				}
			},

			{
				path: 'customer-sales-report',
				component: CustomerSalesReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Customer Sales Report'
				}
			},

			{
				path: 'deal-offer',
				component: DealOffersComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Deal Offer'
				}
			},

			{
				path: 'deal-launcher',
				component: DealLauncherComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Deal Launcher'
				}
			},

			{
				path: 'add-deal',
				component: AddDealComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Deal'
				}
			},
			{
				path: 'edit-deal/:record',
				component: AddDealComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Deal'
				}
			},
			{
				path: 'material-arrival-chart',
				component: MaterialArrivalChartComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Material Arrival Chart'
				}
			}
		]
	}
];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class SurishaOpsRoutingModule { }
