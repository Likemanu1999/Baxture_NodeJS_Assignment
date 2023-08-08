import { LocalCollectionComponent } from './local-collection/local-collection.component';
import { ImportCollectionComponent } from './import-collection/import-collection.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentProcessComponent } from './payment-process/payment-process.component';
import { PaymentRequestListComponent } from './payment-request-list/payment-request-list.component';
import { PastPaymentsListComponent } from './payment-process/past-payments-list/past-payments-list.component';
import { AuthGuard } from '../../_helpers/auth.guard';
import { LocalCollectionStatementComponent } from './local-collection-statement/local-collection-statement.component';
import { ImportCollectionStatementComponent } from './import-collection-statement/import-collection-statement.component';
import { PropertyMasterComponent } from './property-master/property-master.component';
import { RentMasterComponent } from './rent-master/rent-master.component';
import { PolicyMasterComponent } from './policy-master/policy-master.component';
import { PolicyClaimsComponent } from './policy-claims/policy-claims.component';
import { PolicyDetailsComponent } from './policy-details/policy-details.component';
import { BankStatusComponent } from './bank-status/bank-status.component';
import { ContraPaymentsListComponent } from './contra-payments-list/contra-payments-list.component';
const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Payables'
		},
		children: [
			{
				path: '',
				redirectTo: 'payables'
			},
			{
				path: 'request-list',
				component: PaymentRequestListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Payables Request List'
				}
			},
			{
				path: 'payment-process',
				component: PaymentProcessComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Payment Process'
				}
			},

			{
				path: 'past-payments',
				component: PastPaymentsListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Past Payment history'
				}
			},

			{
				path: 'local-collections',
				component: LocalCollectionComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Local  Collections History'
				}
			},


			{
				path: 'import-collections',
				component: ImportCollectionComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Import Collections History'
				}
			},
			{
				path: 'local-collection-statement',
				component: LocalCollectionStatementComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Local collection Statement'
				}
			},
			{
				path: 'import-collection-statement',
				component: ImportCollectionStatementComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Import Collection Statement'
				}
			},

			{
				path: 'property-master',
				component: PropertyMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Property Master'
				}
			},
			{
				path: 'rent-master',
				component: RentMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Rent Master'
				}
			},
			{
				path: 'policy-master',
				component: PolicyMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Policy Master'
				}
			},
			{
				path: 'policy-details/:id',
				component: PolicyDetailsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Policy Details'
				}
			},
			{
				path: 'policy-claims/:id',
				component: PolicyClaimsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Policy Claims'
				}
			},
			{
				path: 'bank-status',
				component: BankStatusComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Bank Status'
				}
			},
			{
				path: 'contra-payments',
				component: ContraPaymentsListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Contra Payments List'
				}
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PayablesRoutingModule { }
