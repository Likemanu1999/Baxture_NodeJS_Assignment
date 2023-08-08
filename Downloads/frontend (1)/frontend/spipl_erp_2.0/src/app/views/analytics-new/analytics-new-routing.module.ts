import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { NgModule } from '@angular/core';
import { SalesHistoryNewComponent } from './sales-history-new/sales-history-new.component';
import { SalesPurchaseAverageNewComponent } from './sales-purchase-average-new/sales-purchase-average-new.component';
import { ForwardBookingAvgPriceComponent } from './forward-booking-avg-price/forward-booking-avg-price.component';
import { ForexAverageReportComponent } from './forex-average-report/forex-average-report.component';
import { TotalLcOpenReportComponent } from './total-lc-open-report/total-lc-open-report.component';
import { HedgedUnhedgedSummaryComponent } from './hedged-unhedged-summary/hedged-unhedged-summary.component';
import { UserActivityLogComponent } from './user-activity-log/user-activity-log.component';
import { OrgContactsListComponent } from './org-contacts-list/org-contacts-list.component';
import { ForeignPurchseContractAverageReportComponent } from './foreign-purchse-contract-average-report/foreign-purchse-contract-average-report.component';
import { InactiveSalesAccountsComponent } from './inactive-sales-accounts/inactive-sales-accounts.component';
import { SalesAnalyticsBuyingTrendsComponent } from './sales-analytics-buying-trends/sales-analytics-buying-trends.component';
import { OrgSummaryViewComponent } from './org-summary-view/org-summary-view.component';


const routes: Routes = [
	{
		path: "",
		data: {
			title: "Analytics",
		},
		children: [
			{
				path: "",
				redirectTo: "analytics",
			},
			{
				path: "sales-history-new",
				component: SalesHistoryNewComponent,
				canActivate: [AuthGuard],
				data: {
					title: "Sales History",
				},
			},
			{
				path: "sales-purchase-average-new",
				component: SalesPurchaseAverageNewComponent,
				canActivate: [AuthGuard],
				data: {
					title: "Sales Purchase Average Report",
				},
			},
			{
				path: "forward-booking-avg-price",
				component: ForwardBookingAvgPriceComponent,
				canActivate: [AuthGuard],
				data: {
					title: "Forward Booking Price Avg",
				},
			},
			{
				path: "forex-average-report",
				component: ForexAverageReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: "Forex Average Reports",
				},
			},
			{
				path: 'total-lc-open-report',
				component: TotalLcOpenReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Total LC Open Report'
				}
			},

			{
				path: 'hedged-unhedged-summary',
				component: HedgedUnhedgedSummaryComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Hedged Unhedged Summary'
				}
			},
			{
				path: 'user-activity-log',
				component: UserActivityLogComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'User Activity Log'
				}
			},
			{
				path: 'org-contacts-list',
				component: OrgContactsListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Org Contacts List'
				}
			},
			{
				path: 'foreign-purchase-contract-average-report',
				component: ForeignPurchseContractAverageReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Foreign Purchase Contract Average Report'
				}
			},
			{
				path: 'inactive-sales-accounts',
				component: InactiveSalesAccountsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Inactive Sales Accounts'
				}
			},
			{
				path: 'sales-buying-trends',
				component: SalesAnalyticsBuyingTrendsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Buying Trends'
				}
			},
			{
				path: 'org-summary-view',
				component: OrgSummaryViewComponent,
				canActivate: [AuthGuard],
				data:{
					title: 'Org Summary View'
				}
			}
		]
	}
];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class AnalyticsNewRoutingModule { }
