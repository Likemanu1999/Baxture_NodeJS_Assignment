import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { NumbersDirectiveModule } from '../../directives/numbers-directive.module';
import { CurrencyPipeModule } from '../../shared/currency/currency.module';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { FilterModule } from '../../shared/filters/filter.module';
import { MouMasterComponent } from './mou-master/mou-master.component';
import { MouRoutingModule } from './mou-routing.module';
import { DiscountMasterComponent } from './discount-master/discount-master.component';
import { SalesPurchasePriceListComponent } from './sales-purchase-price-list/sales-purchase-price-list.component';
import {MatRadioModule} from '@angular/material/radio';
import { PriceListViewComponent } from './price-list-view/price-list-view.component';
import { EditCopyPriceListComponent } from './edit-copy-price-list/edit-copy-price-list.component';
import { PriceListSearchComponent } from './price-list-search/price-list-search.component';
import { DiscountReportComponent } from './discount-report/discount-report.component';


@NgModule({
  declarations: [MouMasterComponent, DiscountMasterComponent, SalesPurchasePriceListComponent, PriceListViewComponent, EditCopyPriceListComponent, PriceListSearchComponent, DiscountReportComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    MouRoutingModule,
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
    DropdownModule,
    MultiSelectModule,
    FilterModule,
    MatRadioModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true}],
})
export class MouModule { }



