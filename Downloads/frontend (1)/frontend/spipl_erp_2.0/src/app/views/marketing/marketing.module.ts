import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DataTableModule } from 'angular2-datatable';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { TextMaskModule } from 'angular2-text-mask';
import { TimepickerModule, BsDatepickerModule, TabsModule, ModalModule, CollapseModule } from 'ngx-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CKEditorModule } from 'ngx-ckeditor';
import {ButtonModule} from 'primeng/button';


import { FilterModule } from '../../shared/filters/filter.module';
import { TableModule } from 'primeng/table';
import {DropdownModule} from 'primeng/dropdown';
import { MultiSelectModule} from 'primeng/multiselect';
import { CalendarModule} from 'primeng/calendar';
import { ProgressBarModule} from 'primeng/progressbar';
import {TooltipModule} from 'primeng/tooltip';


import { CurrencyPipeModule } from '../../shared/currency/currency.module';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import { NumbersDirectiveModule } from '../../directives/numbers-directive.module';


import { FileNamePipeModule } from '../../shared/file-name/file-name.module';
import { AmountToWordPipe } from '../../shared/amount-to-word/amount-to-word.pipe';
import { InrCurrencyPipe } from '../../shared/currency/currency.pipe';
import { ChipsModule } from 'primeng/chips';
import { MarketingRoutingModule } from './marketing-routing.module';
import { OrganizationDataImportComponent } from './organization-data-import/organization-data-import.component';



@NgModule({
	imports: [
        MarketingRoutingModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        DataTableModule,
        LoadingSpinnerModule,
        TextMaskModule,
        TimepickerModule.forRoot(),
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        NgSelectModule,
        NgOptionHighlightModule,
        ToasterModule,
        TabsModule,
        FilterModule,
        DropdownModule,
        MultiSelectModule,
        ProgressBarModule,
        CalendarModule,
        TableModule,
        CKEditorModule,
        MatTabsModule,
        ButtonModule,
        TooltipModule,
        ModalModule.forRoot(),
        CollapseModule.forRoot(),
        ConfirmationPopoverModule.forRoot({
          confirmButtonType: 'danger' // set defaults here
        }),
     
        CurrencyPipeModule,
        NumbersDirectiveModule,
        ConfirmDialogModule,
        FileNamePipeModule,
        ChipsModule
	],
	declarations: [
	
  OrganizationDataImportComponent],
	providers: [
		{
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptorService,
            multi: true},
            AmountToWordPipe,
            InrCurrencyPipe
	]
})

export class MarketingModule { }
