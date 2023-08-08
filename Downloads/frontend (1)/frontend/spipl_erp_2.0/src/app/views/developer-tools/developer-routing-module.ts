import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../_helpers/auth.guard';
import { LinkMasterComponent } from './link-master/link-master.component';
import { MenuMasterComponent } from './menu-master/menu-master.component';
import { NgModule } from '@angular/core';
import { NotificationComponent } from './notification/notification.component';
import { NotificationNameMasterComponent } from './notification-name-master/notification-name-master.component';
import { NotificationsMastersComponent } from './notifications-masters/notifications-masters.component';
import { PermissionComponent } from './permission/permission.component';
import { RoleMasterComponent } from '../masters/role-master/role-master.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Masters'
    },
    children: [
      {
        path: '',
        redirectTo: 'developer-tools'
      },
      {
        path: 'permission',
        component: PermissionComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Permissions'
        }
      },
      {
        path: 'menu-master',
        component: MenuMasterComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Menu'
        }
      },

      {
        path: 'role-master',
        component: RoleMasterComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Menu'
        }
      },


      {
        path: 'link-master',
        component: LinkMasterComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Link'
        }
      },

      {
        path: 'notifications-permission',
        component: NotificationsMastersComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Notification'
        }
      },

      {
        path: 'notifications',
        component: NotificationComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Notification'
        }
      },

      {
        path: 'notifications-name',
        component: NotificationNameMasterComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Notification name master '
        }
      }



      



    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeveloperRoutingModule {}
