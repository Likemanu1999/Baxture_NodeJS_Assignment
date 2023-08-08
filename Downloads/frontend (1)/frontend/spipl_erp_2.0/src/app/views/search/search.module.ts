import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchRoutingModule } from './search-routing.module';
import { ContactSearchComponent } from './contact-search/contact-search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { TableModule } from 'primeng/table';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';
import {CalendarModule} from 'primeng/calendar';
import {MultiSelectModule} from 'primeng/multiselect';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {ProgressBarModule} from 'primeng/progressbar';
import {DropdownModule} from 'primeng/dropdown';
import { OrgDetailsSearchComponent } from './org-details-search/org-details-search.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [ContactSearchComponent, OrgDetailsSearchComponent],
  imports: [
    CommonModule,
    SearchRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerModule,
    TableModule,
    HttpClientModule,
    CalendarModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    ProgressBarModule,
    NgSelectModule,
    MatTabsModule,
    CollapseModule.forRoot(),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    }
  ],
})
export class SearchModule { }
