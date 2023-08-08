import { BsDatepickerModule, ModalModule, TabsModule, TimepickerModule } from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AddExpenseComponent } from './add-expense/add-expense.component';
import { AddTripComponent } from './add-trip/add-trip.component';
import { CommonModule } from '@angular/common';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { DataTableModule } from 'angular2-datatable';
import { ExpenseCatComponent } from './expense-cat/expense-cat.component';
import { ExpenseCatFilterPipe } from './expense-cat/expensecatfilterpipe';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ExpenseRoutingModule } from './expense-routing.module';
import { FilterModule } from '../../shared/filters/filter.module';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { NgModule } from '@angular/core';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { NgSelectModule } from '@ng-select/ng-select';
import { PayableRequestModule } from '../../shared/payable-request/payable-request.module';
import { TextMaskModule } from 'angular2-text-mask';
import { ToasterModule } from 'angular2-toaster';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import { TripDetailsComponent } from './trip-details/trip-details.component';
import { TripMasterComponent } from './trip-master/trip-master.component';

import { ToggleButtonModule } from 'primeng/togglebutton';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { CKEditorModule } from 'ngx-ckeditor';
import { TableModule } from 'primeng/table';
import { ChipsModule } from 'primeng/chips';
import { ChartModule } from 'primeng/chart';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SharedModuleModule } from '../../shared/shared-module/shared-module.module';
@NgModule({
  declarations: [
    ExpenseListComponent,
    AddExpenseComponent,
    TripMasterComponent,
    TripDetailsComponent,
    ExpenseCatComponent,
    ExpenseCatFilterPipe,
    AddTripComponent,
    TripDetailsComponent
  ],
  imports:
  [

    CommonModule,
    SharedModuleModule,
    ExpenseRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    DataTableModule,
    LoadingSpinnerModule,
    TextMaskModule,
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    NgOptionHighlightModule,
    ToasterModule,
    TabsModule,
    FilterModule,
    ModalModule.forRoot(),
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger' // set defaults here
    }),
    PayableRequestModule,
    MatTabsModule,
		MatStepperModule,
    ToggleButtonModule,
    BsDropdownModule.forRoot(),
    ProgressBarModule,
		CalendarModule,
		TableModule,
		InputSwitchModule,
		CKEditorModule,
		MatTabsModule,
		TooltipModule,
    ChipsModule,
		ChartModule,
    DropdownModule,
		MultiSelectModule,
		CheckboxModule

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true}],
})
export class ExpenseModule { }
