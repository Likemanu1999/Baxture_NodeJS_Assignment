import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CountryMasterComponent } from './country-master/country-master.component';
import { StateMasterComponent } from './state-master/state-master.component';
import { CityMasterComponent } from './city-master/city-master.component';
// import { RoleMasterComponent } from './role-master/role-master.component';
// import { JobProfileMasterComponent } from './job-profile-master/job-profile-master.component';
// import { DepartmentMasterComponent } from './department-master/department-master.component';
// import { QualificationMasterComponent } from './qualification-master/qualification-master.component';
import { OrgMasterComponent } from './org-master/org-master.component';
import { UnitMasterComponent } from './unit-master/unit-master.component';
import { SubOrgMasterComponent } from './sub-org-master/sub-org-master.component';
import { OrgCategoriesComponent } from './org-categories/org-categories.component';
import { ProductMasterComponent } from './product-master/product-master.component';
import { PaymentTermMasterComponent } from './payment-term-master/payment-term-master.component';
import { AddSubOrgComponent } from './sub-org-master/add-sub-org/add-sub-org.component';
import { GradeMasterComponent } from './grade-master/grade-master.component';
import { PortMasterComponent } from './port-master/port-master.component';
import { SpiplBankMasterComponent } from './spipl-bank-master/spipl-bank-master.component';
import { GodownComponent } from './godown/godown.component';
import { TemplateEditorComponent } from './template-editor/template-editor.component';
import { MaterialLoadPortMasterComponent } from './material-load-port-master/material-load-port-master.component';
import { FlcChargesComponent } from './flc-charges/flc-charges.component';
import { AddEditFlcChargesComponent } from './flc-charges/add-edit-flc-charges/add-edit-flc-charges.component';
import { IlcChargesComponent } from './ilc-charges/ilc-charges.component';
import { CurrencyConvertComponent } from './currency-convert/currency-convert.component';
import { AddEditIlcChargesComponent } from './ilc-charges/add-edit-ilc-charges/add-edit-ilc-charges.component';
import { AddEditCurrencyConvertComponent } from './currency-convert/add-edit-currency-convert/add-edit-currency-convert.component';
import { HolidayMasterComponent } from './holiday-master/holiday-master.component';

import { ChargesStagesMasterComponent } from './charges-stages-master/charges-stages-master.component';
import { ChargesHeadMasterComponent } from './charges-head-master/charges-head-master.component';
import { ChargesComponent } from './charges/charges.component';
import { AddChargesComponent } from './/add-charges/add-charges.component';
import { Permission } from '../../shared/apis-path/apis-path';
import { PercentageMasterComponent } from './percentage-master/percentage-master.component';
import { PercentTypeMasterComponent } from './percent-type-master/percent-type-master.component';
import { AuthGuard } from '../../_helpers/auth.guard';
import { SubOrgUpdateComponent } from './sub-org-update/sub-org-update.component';
import { IntroductionMailComponent } from './introduction-mail/introduction-mail.component';
import { GodownStaffLinkComponent } from './godown-staff-link/godown-staff-link.component';
import { StaffDocumentsTypesComponent } from './staff-documents-types/staff-documents-types.component';
import { GradeCategoryComponent } from './grade-category/grade-category.component';
import { InterestRateMasterComponent } from './interest-rate-master/interest-rate-master.component';
import { ManufactureSupplyDestinationComponent } from './manufacture-supply-destination/manufacture-supply-destination.component';
import { SuborgConsumeCapacityComponent } from './suborg-consume-capacity/suborg-consume-capacity.component';
import { ComplTaxTypeComponent } from './compl-tax-type/compl-tax-type.component';
import { ComplReturnTypeComponent } from './compl-return-type/compl-return-type.component';
import { BanksFedaiRateComponent } from './banks-fedai-rate/banks-fedai-rate.component';
import { SubOrgDetailNewComponent } from './sub-org-detail-new/sub-org-detail-new.component';
import { OrganizationZoneAssignComponent } from './organization-zone-assign/organization-zone-assign.component';
import { AddSubOrgMasterComponent } from './add-sub-org-master/add-sub-org-master.component';
import { PolicyTypeMasterComponent } from './policy-type-master/policy-type-master.component';
import { MailToCustomersComponent } from './mail-to-customers/mail-to-customers.component';
import { SalesDocumentTypeComponent } from './sales-document-type/sales-document-type.component';
import { CourrierMasterComponent } from './courrier-master/courrier-master.component';
import { CourierMasterComponent } from './courier-master/courier-master.component';
import { PackagingMasterComponent } from './packaging-master/packaging-master.component';
import { RentTypeMasterComponent } from './rent-type-master/rent-type-master.component'
import { PaymentCategoryComponent } from './payment-category/payment-category.component';
import { PriceProtectionComponent } from './price-protection/price-protection.component';
import { SubOrgTdsComponent } from './sub-org-tds/sub-org-tds.component';
import { WhatsappTemplateTypeMasterComponent } from './whatsapp-template-type-master/whatsapp-template-type-master.component';
import { WhatsappTemplatesMasterComponent } from './whatsapp-templates-master/whatsapp-templates-master.component';
import { TermsMasterComponent } from './terms-master/terms-master.component';

const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Masters'
		},
		children: [
			{
				path: '',
				redirectTo: 'masters'
			},
			// {
			// 	path: 'role-master',
			// 	component: RoleMasterComponent,
			// 	canActivate: [AuthGuard],
			// 	data: {
			// 		title: 'Role Master'
			// 	}
			// },
			{
				path: 'country-master',
				component: CountryMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Country Master'
				}
			},
			{
				path: 'state-master/:id',
				component: StateMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'State Master'
				}
			},
			{
				path: 'city-master/:id',
				component: CityMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'City Master'
				}
			},
			// {
			// 	path: 'job-profile-master',
			// 	component: JobProfileMasterComponent,
			// 	canActivate: [AuthGuard],
			// 	data: {
			// 		title: 'Job Profile Master'
			// 	}
			// },
			// {
			// 	path: 'department-master',
			// 	component: DepartmentMasterComponent,
			// 	canActivate: [AuthGuard],
			// 	data: {
			// 		title: 'Department Master'
			// 	}
			// },
			// {
			// 	path: 'qualification-master',
			// 	component: QualificationMasterComponent,
			// 	canActivate: [AuthGuard],
			// 	data: {
			// 		title: 'Qualification master'
			// 	}
			// },
			{
				path: 'org-master',
				component: OrgMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Orgnization master'
				}
			},
			{
				path: 'sub-org/:org_id',
				component: SubOrgMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Orgnization master'
				}
			},
			{
				path: 'add-sub-org/:org_id',
				component: AddSubOrgComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Sub-Orgnization'
				}
			},
			{
				path: 'add-sub-org',
				component: AddSubOrgComponent, // AddSubOrgMasterComponent
				canActivate: [AuthGuard],
				data: {
					title: 'Add Sub-Orgnization'
				}
			},
			{
				path: 'edit-sub-org/:sub_org_id',
				component: AddSubOrgComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Sub-Orgnization'
				}
			},
			{
				path: 'sub-org-list',
				component: SubOrgMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sub-Orgnizations List'
				}
			},
			{
				path: 'sub-org-detail/:sub_org_id',
				component: SubOrgDetailNewComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sub-Orgnization Details'
				}
			},
			{
				path: 'unit-master',
				component: UnitMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Unit master'
				}
			},
			{
				path: 'org-categories-master',
				component: OrgCategoriesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Organisation Category'
				}
			},
			{
				path: 'product-master',
				component: ProductMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Product Master'
				}
			},
			{
				path: 'payment-term-master',
				component: PaymentTermMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Payment Term Master'
				}
			},
			{
				path: 'port-master',
				component: PortMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Port Master'
				}
			},
			{
				path: 'spipl-bank-master',
				component: SpiplBankMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'SPIPL Banks'
				}
			},
			{
				path: 'grade-master',
				component: GradeMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Grade Master'
				}
			},
			{
				path: 'godown-master',
				component: GodownComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Godown Master'
				}
			},
			{
				path: 'email-template-editor',
				component: TemplateEditorComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Email Template Editor'
				}
			},
			{
				path: 'material-load-port-master',
				component: MaterialLoadPortMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Material Load Port Master'
				}
			},
			{
				path: 'flc-charges',
				component: FlcChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'FLC Charges'
				}
			},
			{
				path: 'add-edit-flc-charges',
				component: AddEditFlcChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add FLC Charges'
				}
			},
			{
				path: 'edit-flc-charges/:flc_charges_id',
				component: AddEditFlcChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit FLC Charges'
				}
			},
			{
				path: 'ilc-charges',
				component: IlcChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'ILC Charges'
				}
			},
			{
				path: 'add-edit-ilc-charges',
				component: AddEditIlcChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add ILC Charges'
				}
			},
			{
				path: 'edit-ilc-charges/:ilc_charges_id',
				component: AddEditIlcChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit FLC Charges'
				}
			},
			{
				path: 'currency-convert',
				component: CurrencyConvertComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Currency-Conversion'
				}
			},
			{
				path: 'add-edit-currency-conversion',
				component: AddEditCurrencyConvertComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Currency Conversion'
				}
			},
			{
				path: 'edit-currency-conversion/:currency_conversion_id',
				component: AddEditCurrencyConvertComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Currency Conversion'
				}
			},
			{
				path: 'holiday-master',
				component: HolidayMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Holiday Master'
				}
			},
			{
				path: 'material-load-port-master',
				component: MaterialLoadPortMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Material Load Port Master'
				}
			},

			{
				path: 'charges-stages',
				component: ChargesStagesMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Charges Stages'
				}
			},
			{
				path: 'charges-heads',
				component: ChargesHeadMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Charges Heads'
				}
			},
			{
				path: 'charges',
				component: ChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Charges Master'
				}
			},

			{
				path: 'add-charges',
				component: AddChargesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Add Charges Master'
				}
			},

			{
				path: 'percentage-master',
				component: PercentageMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Percentage Master'
				}
			},
			{
				path: 'percentage-type',
				component: PercentTypeMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Percentage Type'
				}
			},

			{
				path: 'sub-org-update',
				component: SubOrgUpdateComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sub Org Update'
				}
			},

			{
				path: 'introduction-mail',
				component: IntroductionMailComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Introduction Mail'
				}
			},
			// {
			// 	path: 'godown-staff-link',
			// 	component: GodownStaffLinkComponent,
			// 	canActivate: [AuthGuard],
			// 	data: {
			// 		title: 'Godown-Staff'
			// 	}
			// },
			{
				path: 'staff-documents-types',
				component: StaffDocumentsTypesComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Staff Documents Types'
				}
			},
			{
				path: 'grade-category',
				component: GradeCategoryComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Grade Category'
				}
			},
			{
				path: 'interest-rate-master',
				component: InterestRateMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Interest Rate Master'
				}
			},
			{
				path: 'manufacture-supply-destination',
				component: ManufactureSupplyDestinationComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Manufacture Supply Station'
				}
			},
			{
				path: 'suborg-consume-capacity',
				component: SuborgConsumeCapacityComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Consume Capacity'
				}
			},
			{
				path: 'tax-type-master',
				component: ComplTaxTypeComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Tax Type Master'
				}
			},
			{
				path: 'return-type',
				component: ComplReturnTypeComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Return Type Master'
				}
			},
			{
				path: 'banks-fedai-rate',
				component: BanksFedaiRateComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Return Type Master'
				}
			},
			{
				path: 'organization-zone-assign',
				component: OrganizationZoneAssignComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Organization Zone List'
				}
			},
			{
				path: 'policy-type-master',
				component: PolicyTypeMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Policy Type Master'
				}
			},
			{
				path: 'mail-to-customers',
				component: MailToCustomersComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Send Mail'
				}
			},
			{
				path: 'sales-documents-types',
				component: SalesDocumentTypeComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sale Documents Types'
				}
			},
			{
				path: 'courrier-master',
				component: CourrierMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Courrier Master'
				}
			},
			{
				path: 'courier-master-new',
				component: CourierMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Courier Master'
				}
			},
			{
				path: 'packaging-master',
				component: PackagingMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Packaging Master'
				}
			},
			{
				path: 'rent-type-master',
				component: RentTypeMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Rent Type Master'
				}
			},
			{
				path: 'payment-category',
				component: PaymentCategoryComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Payment Category Master'
				}
			},
			{
				path: 'price-protection',
				component: PriceProtectionComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Price Protection Master'
				}
			},
			{
				path: 'sub-org-tds',
				component: SubOrgTdsComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Sub-Organization TDS'
				}
			},
			{
				path: 'whatsapp-template-type',
				component: WhatsappTemplateTypeMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'WhatsApp Template Type Master'
				}
			},
			{
				path: 'whatsapp-templates-master',
				component: WhatsappTemplatesMasterComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'WhatsApp Template Master'
				}
			},
			{
				path: 'term-master',
				component: TermsMasterComponent,
				canActivate:[AuthGuard],
				data:{
					title: 'Term Master'
				}
			}
			
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MastersRoutingModule { }
