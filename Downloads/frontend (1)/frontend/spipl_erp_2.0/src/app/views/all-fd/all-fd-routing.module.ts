import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FdEditoreComponent } from './fd-editore/fd-editore.component';
import { FdComponent } from './fd/fd.component';
import { QuarterlyFdReportComponent } from './quarterly-fd-report/quarterly-fd-report.component';
import { FdLinkingListComponent } from './fd-linking-list/fd-linking-list.component';
import { AuthGuard } from '../../_helpers/auth.guard';


const routes: Routes = [
    {
        path: '', data: { title: 'All FDs' },
        children: [

          {
            path : '',
            redirectTo : 'fd'
          },
          {
            path : 'all-fds',
            component : FdComponent,
            canActivate: [AuthGuard],
            data : {
              title : 'FDs List'
            }
          },

         { path: 'download-word/:fd_id',
             component: FdEditoreComponent,
             canActivate: [AuthGuard],
             data: {
                title: 'Download'
              }
            },
          { path: 'quarterly-fd-report',
          component: QuarterlyFdReportComponent,
          canActivate: [AuthGuard],
          data: {
              title: 'Quarterly Fd Report'
            }
          },
          { path: 'fd-linking-list',
          component: FdLinkingListComponent,
          canActivate: [AuthGuard],
          data: {
              title: 'FD Linking List'
            }
          }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllFdRoutingModule { }
