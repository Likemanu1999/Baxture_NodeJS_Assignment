import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountRoutingModule } from './account-routing.module';

import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DataTableModule } from 'angular2-datatable';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import { FilterModule } from '../../shared/filters/filter.module';
import { ToasterModule } from 'angular2-toaster';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { TreeTableModule } from 'primeng/treetable';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { BsDatepickerModule, TabsModule } from 'ngx-bootstrap';
import { CKEditorModule } from 'ngx-ckeditor';

import { TelephoneExtensionsComponent } from './telephone-extensions/telephone-extensions.component';
import { UpcomingBirthdaysComponent } from '../account/upcoming-birthdays/upcoming-birthdays.component';
import { MyJobReferencesComponent } from './my-job-references/my-job-references.component';

@NgModule({
	declarations: [
		TelephoneExtensionsComponent,
		UpcomingBirthdaysComponent,
		MyJobReferencesComponent
	],
	imports: [
		CommonModule,
		AccountRoutingModule,
		ReactiveFormsModule,
		HttpClientModule,
		FormsModule,
		NgSelectModule,
		NgOptionHighlightModule,
		DataTableModule,
		LoadingSpinnerModule,
		ToasterModule,
		TabsModule,
		CKEditorModule,
		DropdownModule,
		MultiSelectModule,
		ProgressBarModule,
		CalendarModule,
		TreeTableModule,
		TableModule,
		FilterModule,
		InputSwitchModule,
		BsDatepickerModule.forRoot(),
		ModalModule.forRoot(),
		BsDatepickerModule.forRoot(),
		ConfirmationPopoverModule.forRoot({
			confirmButtonType: 'danger' // set defaults here
		})
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptorService,
			multi: true
		}
	]
})
export class AccountModule { }
