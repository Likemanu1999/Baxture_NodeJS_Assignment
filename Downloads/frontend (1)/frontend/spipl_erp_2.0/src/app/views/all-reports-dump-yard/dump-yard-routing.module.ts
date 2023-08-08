import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { TotalLcOpenSummaryComponent } from './total-lc-open-summary/total-lc-open-summary.component';
const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Dump Yard'
    },
    children: [
      {
        path: '',
        redirectTo: 'dumpyard'
      },
      {
        path: 'total-lc-open-summary',
        component: TotalLcOpenSummaryComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'LC Open Summary'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DumpYardRoutingModule {}
