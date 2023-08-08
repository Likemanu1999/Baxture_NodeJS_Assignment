import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { ContactSearchComponent } from './contact-search/contact-search.component';
import { OrgDetailsSearchComponent } from './org-details-search/org-details-search.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: ''
    },
    children: [
      {
        path: '',
        redirectTo: 'search'
      },
      {
        path: 'contact-search',
        component: ContactSearchComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Search Contact'
        }
      },
      {
        path: 'org-search',
        component: OrgDetailsSearchComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Search Org'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
