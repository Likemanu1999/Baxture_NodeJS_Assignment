import { SalesOrderImportReportComponent } from './sales-reports/sales-order-import-report/sales-order-import-report.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { NgModule } from '@angular/core';
import { AddStockTransferComponent } from './add-stock-transfer/add-stock-transfer.component';
import { BlacklistUserComponent } from './blacklist-user/blacklist-user.component';
import { DailyGradeRatesComponent } from './daily-grade-rates/daily-grade-rates.component';
import { DailyStockAllocationComponent } from './daily-stock-allocation/daily-stock-allocation.component';
import { ManagementOperationsComponent } from './management-operations/management-operations.component';
import { PaymentDetailsComponent } from './sales-reports/payment-details/payment-details.component';
import { SalesUtilityComponent } from './sales-utility/sales-utility.component';
import { StockTransferComponent } from './stock-transfer/stock-transper.component';
import { BillOfExchangeComponent } from './bill-of-exchange/bill-of-exchange.component';
import { AddSalesOrderComponent } from './add-sales-order/add-sales-order.component';
import { SalesOrdersComponent } from './sales-orders/sales-orders.component';
import { AddFinanceComponent } from './add-finance/add-finance.component';
import { DispatchComponent } from './dispatch/dispatch.component';
import { AddDispatchComponent } from './add-dispatch/add-dispatch.component';
import { DispatchBillingComponent } from './dispatch-billing/dispatch-billing.component';
import { SalesReturnComponent } from './sales-return/sales-return.component';
import { ShortDamageComponent } from './short-damage/short-damage.component';
import { CommissionComponent } from './commission/commission.component';
import { MiddlewarePaymentsComponent } from './middleware-payments/middleware-payments.component';
import { DispatchPaymentComponent } from './dispatch-payment/dispatch-payment.component';
import { AddHighSeasOrderComponent } from './add-high-seas-order/add-high-seas-order.component';
import { HighSeasOrdersComponent } from './high-seas-orders/high-seas-orders.component';
import { FinanceReportComponent } from './finance-report/finance-report.component';
import { SalesAverageReportComponent } from './sales-average-report/sales-average-report.component';
import { LoadCrossReportComponent } from './load-cross-report/load-cross-report.component';
import { FinanceComponent } from './finance/finance.component';
import { SalesUtilityNewComponent } from './sales-utility-new/sales-utility-new.component';
import { DispatchReportComponent } from './dispatch-report/dispatch-report.component';
import { CustomerAdvancedComponent } from './sales-reports/customer-advanced/customer-advanced.component';
import { StockTransferNewComponent } from './stock-transfer-new/stock-transfer-new.component';
import { AdjustSuspenseAmountComponent } from './adjust-suspense-amount/adjust-suspense-amount.component';
import { BlacklistUsersNewComponent } from './blacklist-users-new/blacklist-users-new.component';
import { SalesOrderLocalReportComponent } from './sales-reports/sales-order-local-report/sales-order-local-report.component';
import { LocalOutstandingReportComponent } from './sales-reports/local-outstanding-report/local-outstanding-report.component';
import { DiscountReportComponent } from './discount-report/discount-report.component';
import { TransnationalSalesComponent } from './transnational-sales/transnational-sales.component';
import { AddTransnationalOrderComponent } from './add-transnational-order/add-transnational-order.component';
import { TransnationalLcComponent } from './transnational-lc/transnational-lc.component';
import { TransnationalNonComponent } from './transnational-non/transnational-non.component';
import { AddImportSalesOrderComponent } from './add-import-sales-order/add-import-sales-order.component';
import { ImportSalesComponent } from './import-sales/import-sales.component';
import { PriceProtectionComponent } from './sales-reports/price-protection/price-protection.component';
import { DispatchAcknowledgmentComponent } from './dispatch-acknowledgment/dispatch-acknowledgment.component';
import { IftPaymentComponent } from './ift-payment/ift-payment.component';
import { SalesAverageReportNewComponent } from './sales-average-report-new/sales-average-report-new.component';
import { InsiderListComponent } from './insider-list/insider-list.component';
import { DispatchTransporterListComponent } from './dispatch-transporters-list/dispatch-transporters-list.component';
import { KnockOffOrdersComponent } from './knock-off-orders/knock-off-orders.component';
import { VaErrorsComponent } from './va-errors/va-errors.component';
import { DetailAverageReportComponent } from './detail-average-report/detail-average-report.component';
import { ImportLocalRequestListComponent } from './import-local-request-list/import-local-request-list.component';
import { MiddlewarePaymentsRevampComponent } from './middleware-payments-revamp/middleware-payments-revamp.component';
import { FreightRateComponent } from './freight-rate/freight-rate.component';
import { FreightTrackingComponent } from './freight-tracking/freight-tracking.component';
import { LogisticsDashboradComponent } from './logistics-dashborad/logistics-dashborad.component';
import { ForwardSalesOrdersComponent } from './forward-sales-orders/forward-sales-orders.component';
import { ForwardSalesOutstandingComponent } from './forward-sales-outstanding/forward-sales-outstanding.component';
import { SalesActivityTrackingComponent } from './sales-activity-tracking/sales-activity-tracking.component';


const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Sales'
		},
		children: [
			{
				path: '',
				redirectTo: 'sales'
			},
			{
				path: 'daily-grade-rates',
				component: DailyGradeRatesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Daily Grade Rates'
				}
			},
			{
				path: 'daily-stock-allocation',
				component: DailyStockAllocationComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Daily Stock Allocation'
				}
			},
			{
				path: 'stock-transfer',
				component: StockTransferComponent, // StockTransferNewComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Stock Transfer'
				}
			},
			{
				path: 'add-stock-transfer',
				component: AddStockTransferComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Stock Transfer'
				}
			},
			{
				path: 'sales-average-report',
				component: SalesAverageReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Average Report'
				}
			},
			{
				path: 'reports/detail-average-report',
				component: DetailAverageReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Detail Average Report'
				}
			},
			{
				path: 'sales-reports/payment-details',
				component: PaymentDetailsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Payment Details Report'
				}
			},
			{
				path: 'black-list-user',
				component: BlacklistUsersNewComponent, // BlacklistUserComponent
				canActivate: [AuthGuard],
				data: {
					title: 'Black List User'
				}
			},
			{
				path: 'sales-utility',
				component: SalesUtilityNewComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales-Utility '
				}
			},
			{
				path: 'management-operations',
				component: ManagementOperationsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Management Operations'
				}
			},
			{
				path: 'bill-of-exchange',
				component: BillOfExchangeComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Bill of Exchange'
				}
			},
			{
				path: 'sales-orders',
				component: SalesOrdersComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Orders'
				}
			},
			{
				path: 'finance-plans',
				component: FinanceComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Finance'
				}
			},
			{
				path: 'add-sales-order',
				component: AddSalesOrderComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Sales Orders'
				}
			},
			{
				path: 'edit-sales-order/:id',
				component: AddSalesOrderComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Sales Orders'
				}
			},
			{
				path: 'finance/:con_id',
				component: AddFinanceComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Finance Planning'
				}
			},
			{
				path: 'logistic',
				component: DispatchComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Logistic'
				}
			},
			{
				path: 'forward-sales-orders',
				component: ForwardSalesOrdersComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Forward Sales Orders'
				}
			},
			{
				path: 'forward-sales-outstanding',
				component: ForwardSalesOutstandingComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Forward Sales Outstanding'
				}
			},
			{
				path: 'sales-activity-tracking',
				component: SalesActivityTrackingComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Activity Tracking'
				}
			},
			{
				path: 'add-dispatch/:company_id/:con_id/:fp_id',
				component: AddDispatchComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Dispatch'
				}
			},
			{
				path: 'edit-dispatch/:company_id/:id',
				component: AddDispatchComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Dispatch'
				}
			},
			{
				path: 'billing',
				component: DispatchBillingComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Billing'
				}
			},
			{
				path: 'acknowledgment',
				component: DispatchAcknowledgmentComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Acknowledgment'
				}
			},
			{
				path: 'sales-return',
				component: SalesReturnComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Return'
				}
			},
			{
				path: 'short-damage',
				component: ShortDamageComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Short & Damage'
				}
			},
			{
				path: 'commission',
				component: CommissionComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Commission'
				}
			},
			{
				path: 'payments',
				component: DispatchPaymentComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Payments'
				}
			},
			{
				path: 'add-high-seas-order',
				component: AddHighSeasOrderComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add High Seas Order'
				}
			},
			{
				path: 'edit-high-seas-order/:id',
				component: AddHighSeasOrderComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit High Seas Order'
				}
			},
			{
				path: 'high-seas-orders',
				component: HighSeasOrdersComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'High Seas Orders'
				}
			},
			{
				path: 'add-import-sales-order',
				component: AddImportSalesOrderComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Import Sales Order'
				}
			},
			{
				path: 'edit-import-sales-order/:id',
				component: AddImportSalesOrderComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Import Sales Order'
				}
			},
			{
				path: 'import-sales',
				component: ImportSalesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Import Sales'
				}
			},
			{
				path: 'reports/middleware-payments',
				component: MiddlewarePaymentsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Middleware Payments'
				}
			},
			{
				path: 'reports/finance-report',
				component: FinanceReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Finance Report'
				}
			},
			{
				path: 'reports/local-outstanding',
				component: LocalOutstandingReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Finance Report'
				}
			},
			{
				path: 'reports/load-cross-report',
				component: LoadCrossReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Load Cross Report'
				}
			},
			{
				path: 'reports/sales-average-report',
				component: SalesAverageReportNewComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Average Report'
				}
			},
			{
				path: 'reports/dispatch-report',
				component: DispatchReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Dispatch Report'
				}
			},
			{
				path: 'reports/logistics-dashboard',
				component: LogisticsDashboradComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Logistics Dashboard'
				}
			},
			{
				path: 'reports/freight-tracking',
				component: FreightTrackingComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Freight Tracking'
				}
			},
			{
				path: 'reports/sales-customer-advanced',
				component: CustomerAdvancedComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Customer Advanced Report'
				}
			},
			{
				path: 'adjust-suspense-amount',
				component: AdjustSuspenseAmountComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Adjust Suspense Amount'
				}
			},

			{
				path: 'reports/sales-order-local-report',
				component: SalesOrderLocalReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Order Local Report',
				}
			},

			{
				path: 'reports/sales-order-import-report',
				component: SalesOrderImportReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Order Import Report',
				}
			},
			{
				path: 'reports/discount-report',
				component: DiscountReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Discount Report'
				}
			},

			{
				path: 'transnational-sales/transnational-sales-list',
				component: TransnationalSalesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Transnational Sales'
				}
			},
			{
				path: 'add-transnational-order',
				component: AddTransnationalOrderComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Transnational Sales Order'
				}
			},
			{
				path: 'edit-transnational-order/:id',
				component: AddTransnationalOrderComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Transnational Sales Order'
				}
			},
			{
				path: 'transnational-sales/transnational-lc',
				component: TransnationalLcComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Transnational Lc'
				}
			},
			{
				path: 'transnational-sales/transnational-non',
				component: TransnationalNonComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Transnational NON'
				}
			},
			{
				path: 'reports/price-protection',
				component: PriceProtectionComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Price Protection'
				}
			},
			{
				path: 'ift-payment',
				component: IftPaymentComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'IFT Payment'
				}
			},
			{
				path: 'insider-list',
				component: InsiderListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Insider List'
				}
			},
			{
				path: 'dispatch-transporters-list',
				component: DispatchTransporterListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Dispatch Transporters List'
				}
			},
			{
				path: 'knock-off-orders',
				component: KnockOffOrdersComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Knock Off Orders'
				}
			},
			{
				path: 'va-errors',
				component: VaErrorsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Virtual Accounts Error'
				}
			},
			{
				path: 'import-local-request-list',
				component: ImportLocalRequestListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Import Local Request List'
				}
			},

			{
				path: 'middleware-payments-revamp',
				component: MiddlewarePaymentsRevampComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Middleware Payments Revamp'
				}
			},
			{
				path: 'freight-rate',
				component: FreightRateComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Freight Rate'
				}
			}


		]
	}
];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class SalesRoutingModule { }
