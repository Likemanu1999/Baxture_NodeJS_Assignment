import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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

import { NgSelectModule } from '@ng-select/ng-select';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { MatTabsModule } from '@angular/material/tabs';
import { TdsSettingsComponent } from './tds-settings/tds-settings.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { ToasterModule } from 'angular2-toaster';
import { BsDatepickerModule, ModalModule } from 'ngx-bootstrap';




@NgModule({
  declarations: [TdsSettingsComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
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
    ToasterModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
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
export class SettingsModule { }
