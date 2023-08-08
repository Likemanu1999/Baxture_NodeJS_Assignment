import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GradeAssortmentComponent } from './grade-assortment/grade-assortment.component';
import { AddGradePortComponent } from './add-grade-port/add-grade-port.component';
import { ForexSupplierListComponent } from './forex-supplier-list/forex-supplier-list.component';
import { ProformaInvoiceComponent } from './proforma-invoice/proforma-invoice.component';
import { AddFsDealComponent } from './add-fs-deal/add-fs-deal.component';
import { EditFsDealComponent } from './edit-fs-deal/edit-fs-deal.component';
import { LcCreationComponent } from './lc-creation/lc-creation.component';
import { EditPiComponent } from './edit-pi/edit-pi.component';
import { LcInOperationComponent } from './lc-in-operation/lc-in-operation.component';
import { EditLcComponent } from './edit-lc/edit-lc.component';
import { UtilisationChartComponent } from './utilisation-chart/utilisation-chart.component';
import { NonNegotiableListComponent } from './non-negotiable-list/non-negotiable-list.component';
import { NonLcPiComponent } from './non-lc-pi/non-lc-pi.component';
import { EditorComponent } from './editor/editor.component';
import { PaymentDetailsComponent } from './payment-details/payment-details.component';
import { ForwardBookingComponent } from './forward-booking/forward-booking.component';
import { ForwardCoveredComponent } from './forward-covered/forward-covered.component';
import { SalesContractReportComponent } from './sales-contract-report/sales-contract-report.component';
import { bankChargesList, paymentRemittanceCharges } from '../../shared/apis-path/apis-path';
import { BankChargesListComponent } from './bank-charges-list/bank-charges-list.component';
import { LcAmmendChargesComponent } from './bank-charges-list/lc-ammend-charges/lc-ammend-charges.component';
import { NonlcRemittanceChargesComponent } from './bank-charges-list/nonlc-remittance-charges/nonlc-remittance-charges.component';
import { PaymentRemittanceChargesComponent } from './bank-charges-list/payment-remittance-charges/payment-remittance-charges.component';
import { BankOtherChargesComponent } from './bank-charges-list/bank-other-charges/bank-other-charges.component';
import { AddEditBankOtherChargesComponent } from './bank-charges-list/bank-other-charges/add-edit-bank-other-charges/add-edit-bank-other-charges.component';
import { ForwardBookingChargesComponent } from './bank-charges-list/forward-booking-charges/forward-booking-charges.component';
import { AuthGuard } from '../../_helpers/auth.guard';
import { LcMailComponent } from './lc-mail/lc-mail.component';
import { IssuanceReportComponent } from './issuance-report/issuance-report.component';
import { MonthlyAnnexureComponent } from './issuance-report/monthly-annexure/monthly-annexure.component';
import { FlcIlcTtPaymentReportComponent } from './issuance-report/flc-ilc-tt-payment-report/flc-ilc-tt-payment-report.component';
import { ChargesReportComponent } from './issuance-report/charges-report/charges-report.component';
import { ForexSummaryComponent } from './issuance-report/forex-summary/forex-summary.component';
import { BankGauranteeComponent } from './bank-gaurantee/bank-gaurantee.component';
import { AddEditBgComponent } from './bank-gaurantee/add-edit-bg/add-edit-bg.component';
import { LcOutstandingReportComponent } from './lc-outstanding-report/lc-outstanding-report.component';
import { LcInOperationNewComponent } from './lc-in-operation-new/lc-in-operation-new.component';
import { ForexAvgReportComponent } from './forex-avg-report/forex-avg-report.component';
import { FlcPiHoldReleaseListComponent } from './flc-pi-hold-release-list/flc-pi-hold-release-list.component';
import { SupplierQuantityComponent } from './supplier-quantity/supplier-quantity.component';
import { ForexDashboardComponent } from './forex-dashboard/forex-dashboard.component';
import { ContigentLiabilityComponent } from './issuance-report/contigent-liability/contigent-liability.component';

const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Forex'
		},
		children: [
			{
				path: '',
				redirectTo: 'forex'
			},

			{
				path: 'grade-assortment/:sub_org_id',
				component: GradeAssortmentComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'List Foreign Supplier Deals'
				}
			},
			{
				path: 'add-grade-port/:id',
				component: AddGradePortComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Grade  Assortment'
				}
			},

			{
				path: 'sales-contract',
				component: ForexSupplierListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Supplier List'
				}
			},

			{
				path: 'proforma-invoice/:ga_id',
				component: ProformaInvoiceComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Invoice List'
				}
			},

			{
				path: 'edit-pi/:pi_id',
				component: EditPiComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Proforma Invoice'
				}
			},

			{
				path: 'add-fs-deal',
				component: AddFsDealComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Contarct'
				}
			},

			{
				path: 'edit-fs-deal/:deal_id',
				component: EditFsDealComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Contarct'
				}
			},

			{
				path: 'flc-pi-list',
				component: LcCreationComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'FLC PI List'
				}
			},

			{
				path: 'flc-pi-hold-release-list',
				component: FlcPiHoldReleaseListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'FLC PI Hold-Release List'
				}
			},

			{
				path: 'forex-avg-report',
				component: ForexAvgReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Forex Average Report'
				}
			},

			{
				path: 'lc-in-operation',
				component: LcInOperationComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Lc in Operation'
				}
			},

			{
				path: 'lc-in-operation-new',
				component: LcInOperationNewComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Lc in Operation'
				}
			},

			{
				path: 'edit-lc/:id',
				component: EditLcComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Lc'
				}
			},



			{
				path: 'utilisation-chart',
				component: UtilisationChartComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Utilization Chart'
				}
			},


			{
				path: 'non-negotiable-list',
				component: NonNegotiableListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Non Negotiable List'
				}
			},
			{
				path: 'non-lc-pi/:pi_id',
				component: NonLcPiComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Non LC PI'
				}
			},

			{
				path: 'download-word/:lc_id',
				component: EditorComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Download'
				}
			},

			{
				path: 'payment-details',
				component: PaymentDetailsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Payment Detail List'
				}
			},

			{
				path: 'forward-booking',
				component: ForwardBookingComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Forward Booking'
				}
			},

			{
				path: 'forward-covered/:id',
				component: ForwardCoveredComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Forward Covered'
				}
			},

			{
				path: 'sales-contract-report',
				component: SalesContractReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sales Contract Average Report'
				}
			},
			{
				path: 'bank-list-charges',
				component: BankChargesListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Bank Charges List'
				}
			},
			{
				path: 'lc-ammend-charges',
				component: LcAmmendChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'LC Ammendment Charges'
				}
			},
			{
				path: 'nonlc-remittance-charges',
				component: NonlcRemittanceChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'NONLC Remittance Charges'
				}
			},
			{
				path: 'payment-remittance-charges',
				component: PaymentRemittanceChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Payment Remittance Charges'
				}
			},
			{
				path: 'bank-other-charges',
				component: BankOtherChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Other Charges'
				}
			},
			{
				path: 'add-bank-other-charges',
				component: AddEditBankOtherChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Other Charges'
				}
			},
			{
				path: 'edit-bank-other-charges/:other_charges_id',
				component: AddEditBankOtherChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Other Charges'
				}
			},
			{
				path: 'forward-booking-charges',
				component: ForwardBookingChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Forward Booking Charges'
				}
			},
			{
				path: 'lc-mail',
				component: LcMailComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Lc Mail'
				}
			},
			{
				path: 'issuance-report',
				component: IssuanceReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'FLC/ILC/TT Issuance'
				}
			},
			{
				path: 'contigent-liability',
				component: ContigentLiabilityComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Contigent Liability'
				}
			},
			{
				path: 'monthly-annexure',
				component: MonthlyAnnexureComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Monthly Annexure'
				}
			},
			{
				path: 'flc-ilc-tt-payment-report',
				component: FlcIlcTtPaymentReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'FLC/ILC/TT Payment'
				}
			},
			{
				path: 'charges-report',
				component: ChargesReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Charges Report'
				}
			},
			{
				path: 'forex-summary',
				component: ForexSummaryComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Forex Summary'
				}
			},

			{
				path: 'bank-gaurantee',
				component: BankGauranteeComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Bank Gaurantee'
				}
			},
			{
				path: 'add-bg',
				component: AddEditBgComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Bank Gaurantee'
				}
			},
			{
				path: 'edit-bg/:bg_id',
				component: AddEditBgComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Bank Gaurantee'
				}
			},

			{
				path: 'lc-outstanding-report',
				component: LcOutstandingReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'LC Outstanding Report'
				}
			},
			{
				path: 'supplier-quantity-report',
				component: SupplierQuantityComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Supplier Quantity Report'
				}
			}
		]
	}
];



@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class ForexRoutingModule { }
