import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TotalLcOpenSummaryComponent } from './total-lc-open-summary/total-lc-open-summary.component';
import { DumpYardRoutingModule } from './dump-yard-routing.module';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTableModule } from 'angular2-datatable';
import { TableModule } from 'primeng/table';
import { ToasterModule } from 'angular2-toaster';
import { BsDatepickerModule } from 'ngx-bootstrap';
import { MatIconModule } from '@angular/material';



@NgModule({
  declarations: [TotalLcOpenSummaryComponent],
  imports: [
    CommonModule,
    DumpYardRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    DataTableModule,
    TableModule,
    BsDatepickerModule.forRoot(),
    ToasterModule,
    MatIconModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true}],
})
export class AllReportsDumpYardModule { }
