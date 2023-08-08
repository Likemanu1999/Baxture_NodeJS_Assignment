import {
	AppAsideModule,
	AppBreadcrumbModule,
	AppFooterModule,
	AppHeaderModule,
	AppSidebarModule,
} from '@coreui/angular';
import { AsyncPipe, DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ModalModule, TimepickerModule } from 'ngx-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { AddFormSpiplSsurishaComponent } from './views/spipl-ssurisha-list/add-form-spipl-ssurisha/add-form-spipl-ssurisha.component';
import { AmountFormattingPipeModule } from './shared/amount-formatting/amount-formatting.module';
import { AmountToWordPipeModule } from './shared/amount-to-word/amount-to-word.module';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireModule } from '@angular/fire';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ChartsModule } from 'ng2-charts';
import { CrudServices } from './shared/crud-services/crud-services';
import { DefaultLayoutComponent } from './containers';
import { FileNamePipeModule } from './shared/file-name/file-name.module';
import { LoadingSpinnerModule } from './shared/loading-spinner/loading-spinner.module';
import { LoginComponent } from './views/login/login.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MessagingService } from './service/messaging.service';
import { NgModule } from '@angular/core';
import { NullReplacePipeModule } from './shared/null-replace/null-replace.module';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SSurishaTdsChargesFormComponent } from './views/ssurisha-tds-charges-form/tds-charges-form.component';
import { SpiplSsurishaListComponent } from './views/spipl-ssurisha-list/spipl-ssurisha-list.component';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TdsChargesFormComponent } from './views/tds-charges-form/tds-charges-form.component';
import { ToasterModule } from 'angular2-toaster';
import { TokenInterceptorService } from './shared/interceptors/token-interceptor-service';
import { environment } from '../environments/environment';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { EwayDeclarationFormComponent } from './views/eway-declaration-form/eway-declaration-form.component';
import { MatTableModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	suppressScrollX: true
};

const APP_CONTAINERS = [
	DefaultLayoutComponent
];

@NgModule({
	imports: [
		BrowserModule,
		HttpClientModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		ReactiveFormsModule,
		FormsModule,
		// ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
		AppAsideModule,
		AppBreadcrumbModule.forRoot(),
		AppFooterModule,
		AppHeaderModule,
		AppSidebarModule,
		PerfectScrollbarModule,
		// DropdownModule,
		BsDropdownModule.forRoot(),
		TabsModule.forRoot(),
		ChartsModule,
		LoadingSpinnerModule,
		BsDatepickerModule.forRoot(),
		ModalModule.forRoot(),
		AmountFormattingPipeModule,
		AmountToWordPipeModule,
		NullReplacePipeModule,
		FileNamePipeModule,
		ToasterModule,
		MatTabsModule,
		TableModule,
		AngularFireDatabaseModule,
		AngularFireAuthModule,
		AngularFireMessagingModule,
		AngularFireModule.initializeApp(environment.firebaseConfig),
		ConfirmationPopoverModule.forRoot({
			confirmButtonType: 'danger' // set defaults here
		}),
		MatTableModule,
		MatIconModule

	],
	declarations: [
		AppComponent,
		...APP_CONTAINERS,
		LoginComponent,
		TdsChargesFormComponent,
		SSurishaTdsChargesFormComponent,
		SpiplSsurishaListComponent,
		AddFormSpiplSsurishaComponent,
		EwayDeclarationFormComponent,
	],
	providers: [
		MessagingService,
		CrudServices,
		DatePipe,
		AsyncPipe,
		{
			provide: LocationStrategy,
			useClass: HashLocationStrategy
		}
		,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: TokenInterceptorService,
			multi: true
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
