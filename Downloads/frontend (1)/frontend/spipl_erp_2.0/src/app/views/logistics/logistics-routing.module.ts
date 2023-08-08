import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LicenceInvoiceListComponent } from './licence-invoice-list/licence-invoice-list.component';
import { LicenseListComponent } from './license-list/license-list.component';
import{ MaterialReceivedChartComponent } from './material-received-chart/material-received-chart.component';
import { BillOfLadingComponent } from './bill-of-lading/bill-of-lading.component';
import { ContainerDetailsComponent } from './container-details/container-details.component';
import { BillOfEntryComponent } from './bill-of-entry/bill-of-entry.component';
import { DeliveryChallanComponent } from './delivery-challan/delivery-challan.component';
import { KnockOfLicenseComponent } from './knock-of-license/knock-of-license.component';
import { BillOfEntryEmailComponent } from './bill-of-entry-email/bill-of-entry-email.component';
import { AuthGuard } from '../../_helpers/auth.guard';

import { ChaChargesMasterComponent } from './cha-charges-master/cha-charges-master.component';
import { AddChargesComponent } from './add-charges/add-charges.component';
import { LogisticsChargesListComponent } from './logistics-charges-list/logistics-charges-list.component';

import { ContainerDetailListComponent } from './container-detail-list/container-detail-list.component';
import { InsuranceClaimComponent } from './insurance-claim/insurance-claim.component';
import { InsuranceMailEditorComponent } from './insurance-mail-editor/insurance-mail-editor.component';
import { ImportForexReportComponent } from './import-forex-report/import-forex-report.component';
import { LogisticsChargesReportComponent } from './logistics-charges-report/logistics-charges-report.component';
import { ImportLogisticsReportComponent } from './import-logistics-report/import-logistics-report.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Logistics'
    },
    children: [
      {
        path: '',
        redirectTo: 'logistics'
      },
      {
        path: 'material-arrival-chart',
        component: MaterialReceivedChartComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Material Arrival Chart'
        }
      },
      {
        path: 'knock-of-license/:BE_id',
        component: KnockOfLicenseComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'License Knock Of'
        }
      },

      {
        path: 'bill-of-lading/:id',
        component: BillOfLadingComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Bill Of Lading'
        }
      },

      {
        path: 'container-details/:bl_id',
        component: ContainerDetailsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Container Details'
        }
      },

      {
        path: 'bill-of-entry/:id',
        component: BillOfEntryComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Bill of Entry'
        }
      },
      {
        path: 'invoice-list',
        component: LicenceInvoiceListComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'License Invoice List'
        }
      },
      {
        path: 'license-master',
        component: LicenseListComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'License  List'
        }
      },



      {
        path: 'delivery-challan/:id',
        component: DeliveryChallanComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Delivery Challan'
        }
      },

      {
        path: 'be-email',
        component: BillOfEntryEmailComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Bill Of Entry Email'
        }
      },

      {
        path: 'cha-charges-master',
        component: ChaChargesMasterComponent,
        data: {
          title: 'CHA Charges Master'
        }
      },

      {
        path: 'add-charges/:bl_id',
        component: AddChargesComponent,
        data: {
          title: 'Logistics Charges'
        }
      },

      {
        path: 'logistics-charges-list',
        component: LogisticsChargesListComponent,
        data: {
          title: 'Logistics Charges List'
        }
      },

      {
        path: 'container-detail-list',
        component: ContainerDetailListComponent,
        data: {
          title: 'Container Detail List'
        }
      },

      {
        path: 'insurance-claim-list',
        component: InsuranceClaimComponent,
        data: {
          title: 'Insurance Claim'
        }
      },
      {
        path: 'insurance-claim-editor/:id/:type',
        component: InsuranceMailEditorComponent,
        data: {
          title: 'Insurance Editor'
        }
      },
      {
        path: 'import-forex-report',
        component: ImportForexReportComponent,
        data: {
          title: 'Import Forex Report'
        }
      },

      {
        path: 'logistics-charges-report',
        component: LogisticsChargesReportComponent,
        data: {
          title: 'Logistics Charges Report'
        }
      },

      {
        path: 'import-logistics-reports',
        component: ImportLogisticsReportComponent,
        data: {
          title: 'Import Logistics Report'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticsRoutingModule {}
