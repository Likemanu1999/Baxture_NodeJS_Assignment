import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayablesRoutingModule } from './payables-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { ToasterModule } from 'angular2-toaster';
import { ModalModule, BsDatepickerModule } from 'ngx-bootstrap';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { NumbersDirectiveModule } from '../../directives/numbers-directive.module';
import { CurrencyPipeModule } from '../../shared/currency/currency.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { PaymentRequestListComponent } from './payment-request-list/payment-request-list.component';
import { PaymentProcessComponent } from './payment-process/payment-process.component';
import { ApprovedListComponent } from './payment-process/approved-list/approved-list.component';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { FilterModule } from '../../shared/filters/filter.module';
import { ProcessListComponent } from './payment-process/process-list/process-list.component';
import { PastPaymentsListComponent } from './payment-process/past-payments-list/past-payments-list.component';
import { ImportCollectionComponent } from './import-collection/import-collection.component';
import { LocalCollectionComponent } from './local-collection/local-collection.component';
import { DataTableModule } from 'angular2-datatable';
import { LocalCollectionStatementComponent } from './local-collection-statement/local-collection-statement.component';
import { ImportCollectionStatementComponent } from './import-collection-statement/import-collection-statement.component';
import { PolicyMasterComponent } from './policy-master/policy-master.component';
import { RentMasterComponent } from './rent-master/rent-master.component';
import { PropertyMasterComponent } from './property-master/property-master.component';
import { PayableRequestModule } from '../../shared/payable-request/payable-request.module';
import { PolicyClaimsComponent } from './policy-claims/policy-claims.component';
import { PolicyDetailsComponent } from './policy-details/policy-details.component';
import { BankStatusComponent } from './bank-status/bank-status.component';
import { ContraPaymentsListComponent } from './contra-payments-list/contra-payments-list.component';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';

@NgModule({
	declarations: [
		PaymentRequestListComponent,
		PaymentProcessComponent,
		ApprovedListComponent,
		ProcessListComponent,
		PastPaymentsListComponent,
		ImportCollectionComponent,
		LocalCollectionComponent,
		LocalCollectionStatementComponent,
		ImportCollectionStatementComponent,
		PolicyMasterComponent,
		RentMasterComponent,
		PropertyMasterComponent,
		PolicyClaimsComponent,
		PolicyDetailsComponent,
		BankStatusComponent,
		ContraPaymentsListComponent
	],
	imports: [
		CommonModule,
		HttpClientModule,
		SharedModuleModule,
		PayablesRoutingModule,
		LoadingSpinnerModule,
		CurrencyPipeModule,
		LoadingSpinnerModule,
		TableModule,
		ReactiveFormsModule,
		InputTextModule,
		ButtonModule,
		ToasterModule,
		ModalModule.forRoot(),
		BsDatepickerModule.forRoot(),
		ConfirmationPopoverModule.forRoot({
			confirmButtonType: 'danger' // set defaults here
		}),
		NumbersDirectiveModule,
		FormsModule,
		ConfirmDialogModule,
		NgSelectModule,
		MatTabsModule,
		MatStepperModule,
		DataTableModule,
		DropdownModule,
		MultiSelectModule,
		FilterModule,
		InputSwitchModule,
		PayableRequestModule
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptorService,
			multi: true
		}],
})
export class PayablesModule { }



