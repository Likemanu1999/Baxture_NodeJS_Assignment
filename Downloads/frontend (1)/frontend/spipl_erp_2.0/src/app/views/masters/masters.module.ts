import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
// import { RoleMasterComponent } from './role-master/role-master.component';
import { MastersRoutingModule } from './masters-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DataTableModule } from 'angular2-datatable';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import { ToasterModule } from 'angular2-toaster';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
// import { JobProfileMasterComponent } from './job-profile-master/job-profile-master.component';
// import { QualificationMasterComponent } from './qualification-master/qualification-master.component';
// import { DepartmentMasterComponent } from './department-master/department-master.component';
import { OrgMasterComponent } from './org-master/org-master.component';
import { FilterModule } from '../../shared/filters/filter.module';
import { UnitMasterComponent } from './unit-master/unit-master.component';
import { SubOrgMasterComponent } from './sub-org-master/sub-org-master.component';
import { OrgCategoriesComponent } from './org-categories/org-categories.component';
import { ProductMasterComponent } from './product-master/product-master.component';
import { PaymentTermMasterComponent } from './payment-term-master/payment-term-master.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { GradeMasterComponent } from './grade-master/grade-master.component';
import { PortMasterComponent } from './port-master/port-master.component';
import { MaterialLoadPortMasterComponent } from './material-load-port-master/material-load-port-master.component';

import { TreeTableModule } from 'primeng/treetable';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';




// tabsmodule
import { BsDatepickerModule, TabsModule } from 'ngx-bootstrap';
import { CKEditorModule } from 'ngx-ckeditor';
import { SpiplBankMasterComponent } from './spipl-bank-master/spipl-bank-master.component';
import { GodownComponent } from './godown/godown.component';
import { TemplateEditorComponent } from './template-editor/template-editor.component';
import { AddSubOrgComponent } from './sub-org-master/add-sub-org/add-sub-org.component';

import { HolidayMasterComponent } from './holiday-master/holiday-master.component';

import { MatTabsModule } from '@angular/material/tabs';
import { FlcChargesComponent } from './flc-charges/flc-charges.component';
import { IlcChargesComponent } from './ilc-charges/ilc-charges.component';
import { OthersChargesComponent } from './others-charges/others-charges.component';
import { CountryMasterComponent } from './country-master/country-master.component';
import { StateMasterComponent } from './state-master/state-master.component';
import { CityMasterComponent } from './city-master/city-master.component';
import { AddEditFlcChargesComponent } from './flc-charges/add-edit-flc-charges/add-edit-flc-charges.component';
import { CurrencyConvertComponent } from './currency-convert/currency-convert.component';
import { AddEditIlcChargesComponent } from './ilc-charges/add-edit-ilc-charges/add-edit-ilc-charges.component';
import { AddEditCurrencyConvertComponent } from './currency-convert/add-edit-currency-convert/add-edit-currency-convert.component';
import { ChargesHeadMasterComponent } from './charges-head-master/charges-head-master.component';
import { ChargesStagesMasterComponent } from './charges-stages-master/charges-stages-master.component';
import { ChargesComponent } from './charges/charges.component';
import { PercentageMasterComponent } from './percentage-master/percentage-master.component';
import { PercentTypeMasterComponent } from './percent-type-master/percent-type-master.component';
import { AddChargesComponent } from './add-charges/add-charges.component';
import { SubOrgUpdateComponent } from './sub-org-update/sub-org-update.component';
import { PayableRequestModule } from '../../shared/payable-request/payable-request.module';
import { IntroductionMailComponent } from './introduction-mail/introduction-mail.component';

import { FileNamePipeModule } from '../../shared/file-name/file-name.module';
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
import { ChipsModule } from 'primeng/chips';
import { SalesDocumentTypeComponent } from './sales-document-type/sales-document-type.component';
import { CourrierMasterComponent } from './courrier-master/courrier-master.component';
import { CourierMasterComponent } from './courier-master/courier-master.component';
import { PusherService } from '../../service/pusher.service';
import { MasterServicesService } from './master-services/master-services.service';
import { PackagingMasterComponent } from './packaging-master/packaging-master.component';
import { RentTypeMasterComponent } from './rent-type-master/rent-type-master.component';
import { PriceProtectionComponent } from './price-protection/price-protection.component';
import { PaymentCategoryComponent } from './payment-category/payment-category.component';
import { SubOrgTdsComponent } from './sub-org-tds/sub-org-tds.component';
import { WhatsappTemplateTypeMasterComponent } from './whatsapp-template-type-master/whatsapp-template-type-master.component';
import { WhatsappTemplatesMasterComponent } from './whatsapp-templates-master/whatsapp-templates-master.component';
import { TermsMasterComponent } from './terms-master/terms-master.component';

@NgModule({
	declarations: [
		// RoleMasterComponent,
		// JobProfileMasterComponent,
		// QualificationMasterComponent,
		// DepartmentMasterComponent,
		OrgMasterComponent,
		UnitMasterComponent,
		SubOrgMasterComponent,
		OrgCategoriesComponent,
		ProductMasterComponent,
		PaymentTermMasterComponent,
		GradeMasterComponent,
		PortMasterComponent,
		SpiplBankMasterComponent,
		GradeMasterComponent,
		GodownComponent,
		TemplateEditorComponent,
		MaterialLoadPortMasterComponent,
		AddSubOrgComponent,
		HolidayMasterComponent,
		ChargesComponent,
		FlcChargesComponent,
		IlcChargesComponent,
		OthersChargesComponent,
		CountryMasterComponent,
		StateMasterComponent,
		CityMasterComponent,
		AddEditFlcChargesComponent,
		CurrencyConvertComponent,
		AddEditIlcChargesComponent,
		AddEditCurrencyConvertComponent,
		ChargesHeadMasterComponent,
		ChargesStagesMasterComponent,
		PercentageMasterComponent,
		PercentTypeMasterComponent,
		AddChargesComponent,
		SubOrgUpdateComponent,
		IntroductionMailComponent,
		//GodownStaffLinkComponent,
		StaffDocumentsTypesComponent,
		GradeCategoryComponent,
		InterestRateMasterComponent,
		ManufactureSupplyDestinationComponent,
		SuborgConsumeCapacityComponent,
		ComplTaxTypeComponent,
		ComplReturnTypeComponent,
		BanksFedaiRateComponent,
		SubOrgDetailNewComponent,
		OrganizationZoneAssignComponent,
		AddSubOrgMasterComponent,
		PolicyTypeMasterComponent,
		MailToCustomersComponent,
		SalesDocumentTypeComponent,
		CourrierMasterComponent,
		CourierMasterComponent,
		PackagingMasterComponent,
		RentTypeMasterComponent,
		PriceProtectionComponent,
		PaymentCategoryComponent,
		SubOrgTdsComponent,
		WhatsappTemplateTypeMasterComponent,
		WhatsappTemplatesMasterComponent,
		TermsMasterComponent
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MastersRoutingModule,
		HttpClientModule,
		FormsModule,
		NgSelectModule,
		NgOptionHighlightModule,
		DataTableModule,
		LoadingSpinnerModule,
		ToasterModule,
		TabsModule,
		CKEditorModule,
		FilterModule,
		DropdownModule,
		MultiSelectModule,
		ProgressBarModule,
		CalendarModule,
		TreeTableModule,
		TableModule,
		InputSwitchModule,
		CheckboxModule,
		BsDatepickerModule.forRoot(),
		MatTabsModule,
		PayableRequestModule,
		ModalModule.forRoot(),
		BsDatepickerModule.forRoot(),
		ConfirmationPopoverModule.forRoot({
			confirmButtonType: 'danger' // set defaults here
		}),
		FileNamePipeModule,
		ChipsModule,
		ToastModule
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptorService,
			multi: true
		},
		MasterServicesService,
		PusherService
	],
})
export class MasterModule { }
