import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ListPurchaseDealComponent } from './list-purchase-deal/list-purchase-deal.component';
import { CompleteLiftingListComponent } from './complete-lifting-list/complete-lifting-list.component';
import { IlcPiComponent } from './ilc-pi/ilc-pi.component';
import { IlcInOperationComponent } from './letter-of-credit/ilc-in-operation/ilc-in-operation.component';
import { BillOfExchangeListComponent } from './letter-of-credit/bill-of-exchange-list/bill-of-exchange-list.component';
import { IlcOpeningComponent } from './ilc-bank-charges/ilc-opening/ilc-opening.component';
import { IlcAmmendmentComponent } from './ilc-bank-charges/ilc-ammendment/ilc-ammendment.component';
import { IlcRemittanceComponent } from './ilc-bank-charges/ilc-remittance/ilc-remittance.component';
import { AuthGuard } from '../../_helpers/auth.guard';
import { IlcDiscountComponent } from './ilc-bank-charges/ilc-discount/ilc-discount.component';
import { AverageGradeRateReportComponent } from './average-grade-rate-report/average-grade-rate-report.component';
import { JourneyOfTransactionComponent } from './journey-of-transaction/journey-of-transaction.component';
import { LocalPurchaseChargesComponent } from './local-purchase-charges/local-purchase-charges.component';
import { ShortDamageListComponent } from './short-damage-list/short-damage-list.component';
import { PaymentInterestReportComponent } from './payment-interest-report/payment-interest-report.component';
import { GodownAllocationComponent } from './godown-allocation/godown-allocation.component';
import { IlcPurchareReportsComponent } from './reports/ilc-purchare-reports/ilc-purchare-reports.component';
import { LiftingDetailsComponent } from './lifting-details/lifting-details.component';
import { LocalPurchaseDashboardComponent } from './local-purchase-dashboard/local-purchase-dashboard.component';

const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Local Purchase'
		},
		children: [
			{
				path: '',
				redirectTo: 'local-purchase'
			},
			{
				path: 'local-purchase-deal',
				component: ListPurchaseDealComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Local Purchase'
				}
			},
			{
				path: 'local-purchase-lifting/:id',
				component: LiftingDetailsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Local Purchase Lifting'
				}
			},
			{
				path: 'lifting-list',
				component: CompleteLiftingListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Lifitng List'
				}
			},
			{
				path: 'ilc-pi-list',
				component: IlcPiComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Ilc PI List'
				}
			},
			{
				path: 'ilc-in-operation',
				component: IlcInOperationComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Ilc List'
				}
			},
			{
				path: 'bill-of-exchange-list',
				component: BillOfExchangeListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Bill of Exchange List'
				}
			},
			{
				path: 'ilc-opening',
				component: IlcOpeningComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'ILC Opening'
				}
			},
			{
				path: 'ilc-amendment',
				component: IlcAmmendmentComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'ILC Amendment'
				}
			},
			{
				path: 'ilc-remittance',
				component: IlcRemittanceComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'ILC Remittance'
				}
			},
			{
				path: 'ilc-discount',
				component: IlcDiscountComponent,
				data: {
					title: 'ILC Discount'
				}
			},
			{
				path: 'average-grade-wise-list',
				component: AverageGradeRateReportComponent,
				data: {
					title: 'Grade Wist Rate List'
				}
			},
			{
				path: 'journey-of-inland-lc',
				component: JourneyOfTransactionComponent,
				data: {
					title: 'Journey of Inland Lc'
				}
			},
			{
				path: 'local-purchase-charges/:local_purchase_id',
				component: LocalPurchaseChargesComponent,
				data: {
					title: 'Local Purchase Charges'
				}
			},
			{
				path: 'short-damage-list',
				component: ShortDamageListComponent,
				data: {
					title: 'Short Damage List'
				}
			},
			{
				path: 'invoice-payment-report',
				component: PaymentInterestReportComponent,
				data: {
					title: 'Invoice Payments'
				}
			},
			{
				path: 'godown-allocation/:local_purchase_id',
				component: GodownAllocationComponent,
				data: {
					title: 'Godown Allocation'
				}
			},
			{
				path: 'reports/ilc-report',
				component:IlcPurchareReportsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Middleware Payments'
				}
			},
		]
	}
];



@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class LocalPurchaseRoutingModule { }
