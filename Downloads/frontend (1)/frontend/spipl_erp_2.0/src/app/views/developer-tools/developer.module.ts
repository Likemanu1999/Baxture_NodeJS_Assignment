import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { CommonModule } from '@angular/common';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { DataTableModule } from 'angular2-datatable';
import { DeveloperRoutingModule } from './developer-routing-module';
import { FilterModule } from '../../shared/filters/filter.module';
import { FormsModule } from '@angular/forms';
import { LinkMasterComponent } from './link-master/link-master.component';
import { LoadingSpinnerModule } from '../../shared/loading-spinner/loading-spinner.module';
import { MenuMasterComponent } from './menu-master/menu-master.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import {NgxPaginationModule} from 'ngx-pagination';
import { NotificationComponent } from './notification/notification.component';
import { NotificationNameMasterComponent } from './notification-name-master/notification-name-master.component';
import { NotificationsMastersComponent } from './notifications-masters/notifications-masters.component';
import { PermissionComponent } from './permission/permission.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RoleMasterComponent } from '../masters/role-master/role-master.component';
import { SafeHtmlPipe } from './permission/safehtmlpipe';
import { ToasterModule } from 'angular2-toaster';
import { TokenInterceptorService } from '../../shared/interceptors/token-interceptor-service';

@NgModule({
  declarations: [
   PermissionComponent,
   SafeHtmlPipe,
   RoleMasterComponent,
   MenuMasterComponent,
   LinkMasterComponent,
   NotificationsMastersComponent,
   NotificationComponent,
   NotificationNameMasterComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DeveloperRoutingModule,
    HttpClientModule,
    FormsModule,
    DataTableModule,
    LoadingSpinnerModule,
    ToasterModule,
    NgSelectModule,
    FilterModule,
    ModalModule.forRoot(),
    NgxPaginationModule,
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'danger' // set defaults here
    })
  ],
  providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptorService,
    multi: true}],
})
export class DeveloperModule { }
