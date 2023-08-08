import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { TdsSettingsComponent } from './tds-settings/tds-settings.component';



const routes: Routes = [
  {
    path: '',
    data: {
      title: ''
    },
    children: [
      {
        path: '',
        redirectTo: 'settings'
      },
      {
        path: 'tds-settings',
        component: TdsSettingsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'TDS Settings'
        }
      },
    
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
