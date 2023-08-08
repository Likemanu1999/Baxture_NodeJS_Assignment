import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { SalesLcComponent } from '../sales/sales-lc/sales-lc.component';
import { SalesDealsComponent } from '../sales/sales-deals/sales-deals.component';
import { SalesPiComponent } from '../sales/sales-pi/sales-pi.component';
import { ApproveLcComponent } from './approve-lc/approve-lc.component';
import { ApprovePiComponent } from './approve-pi/approve-pi.component';
import { UploadDocumentsComponent } from './upload-documents/upload-documents.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Sales LC Operation'
    },
    children: [
      {
        path: '',
        redirectTo: 'sales-lc-operation'
      },
      {
        path: 'pi-creation',
        component: SalesDealsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Generate Proforma Invoice'
        }
      },
      {
        path: 'approve-pi',
        component: ApprovePiComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Approve PI'
        }
      },
      {
        path: 'upload-lc',
        component: SalesPiComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Upload LC'
        }
      },
      {
        path: 'approve-lc',
        component: ApproveLcComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Approve LC'
        }
      },
      {
        path: 'lc-list',
        component: SalesLcComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Sales LC List'
        }
      },
      {
        path: 'upload-documents',
        component: UploadDocumentsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Upload Documents'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesLcOperationRoutingModule { }
