
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { NgModule } from '@angular/core';
//__________________________________________Report Component________________________________//
import { SalesRegisterReportComponent } from './sales-register-report/sales-register-report.component';
import { PurchaseRegisterLocalReportComponent } from './purchase-register-local-report/purchase-register-local-report.component';
import { PurchaseRegisterImportReportComponent } from './purchase-register-import-report/purchase-register-import-report.component';
import { FreightOutwardRegisterReportComponent } from './freight-outward-register-report/freight-outward-register-report.component';
import { FreightStockTransferRegisterReportComponent } from './freight-stock-transfer-register-report/freight-stock-transfer-register-report.component';
import { FreightInwardRegisterReportComponent } from './freight-inward-register-report/freight-inward-register-report.component';

import { LocalPurchaseShortDamageComponent } from './local-purchase-short-damage/local-purchase-short-damage.component';
import { SalesShortDamageComponent } from './sales-short-damage/sales-short-damage.component';
import { SalesDiscountReportComponent } from './sales-discount-report/sales-discount-report.component';
import{ImportClearanceReportComponent} from './import-clearance-report/import-clearance-report.component';
import{ImportClearanceReport2Component} from './import-clearance-report2/import-clearance-report2.component';
import { PurchaseRegisterImportReportNewComponent } from './purchase-register-import-report-new/purchase-register-import-report-new.component';
import { ClearingExpensesReportComponent } from './clearing-expenses-report/clearing-expenses-report.component';
const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Reports'
		},
		children: [
			{
				path: '',
				redirectTo: 'account-reports'
			},
			
			{
				path: 'sales-register-report',
				component: SalesRegisterReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Register Report'
				}
			},

			{
				path: 'purchase-register-report-local',
				component: PurchaseRegisterLocalReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Purchase Register Local Report'
				}
			},

			{
				path: 'purchase-register-report-import',
				component: PurchaseRegisterImportReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Purchase Register Import Report'
				}
			},

			{
				path: 'purchase-register-report-import-new',
				component: PurchaseRegisterImportReportNewComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Purchase Register Import New Report'
				}
			},
			
			{
				path: 'freight-stock-transfer-register-report',
				component: FreightStockTransferRegisterReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Freight Stock Transfer Register Report'
				}
			},
			
			{
				path: 'freight-outward-register-report',
				component: FreightOutwardRegisterReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Freight Outward Register Report'
				}
			},

			{
				path: 'freight-inward-register-report',
				component: FreightInwardRegisterReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Freight Inward Register Report'
				}
			},
			// _________________NEW REPORT________________________________

			{
				path: 'local-purchase-short-damage',
				component: LocalPurchaseShortDamageComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Local Purchase Short Damage'
				}
			},
			{
				path: 'sales-short-damage',
				component: SalesShortDamageComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Short Damage'
				}
			},
			{
				path: 'sales-discount-report',
				component: SalesDiscountReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Discount Report'
				}
			},
			{
				path: 'import-clearance-report',
				component: ImportClearanceReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Import Clearance Report'
				}
			},
			{
				path: 'import-clearance-report2',
				component: ImportClearanceReport2Component,
				canActivate: [AuthGuard],
				data: {
					title: 'Import Clearance Report TEST'
				}
			},

			{
				path: 'clearing-expenses-report',
				component: ClearingExpensesReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Clearing Expenses Report'
				}
			},

			
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AccountingAuditReportRoutingModule { }
