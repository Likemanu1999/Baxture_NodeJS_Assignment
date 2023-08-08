import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { LiveInventoryComponent } from './live-inventory/live-inventory.component';
import { LiveStockComponent } from './live-stock/live-stock.component';
import { DetailInventoryComponent } from './detail-inventory/detail-inventory.component';
import { UnsoldSummaryComponent } from './unsold-summary/unsold-summary.component';
import { CentralLiveStockComponent } from './central-live-stock/central-live-stock.component';
import { ZoneWiseStockComponent } from './zone-wise-stock/zone-wise-stock.component';
import { SalesPurchaseDispatchStockReportComponent } from './sales-purchase-dispatch-stock-report/sales-purchase-dispatch-stock-report.component';
import { PvcPolyInventoryComponent } from './pvc-poly-inventory/pvc-poly-inventory.component';
import { CentralLiveStockImportLocalComponent } from './central-live-stock-import-local/central-live-stock-import-local.component';
import { CentralInventoryLocalComponent } from './central-inventory-local/central-inventory-local.component';
import { ShortDamageClearanceComponent } from './short-damage-clearance/short-damage-clearance.component';
import { DetailInventoryImportLocalComponent } from './detail-inventory-import-local/detail-inventory-import-local.component';
import { AllocatedImportLocalInventoryComponent } from './allocated-import-local-inventory/allocated-import-local-inventory.component';
import { UnsoldSummaryImportLocalComponent } from './unsold-summary-import-local/unsold-summary-import-local.component';
import { UnsoldSummaryOldComponent } from './unsold-summary-old/unsold-summary.component-old';
import { UnsoldSummaryImportLocalFilteredComponent } from './unsold-summary-import-local-filtered/unsold-summary-import-local-filtered.component';
import { CentralLiveStockImportLocalNewComponent } from './central-live-stock-import-local-new/central-live-stock-import-local-new.component';
import { GodownStockComponent } from './godown-stock/godown-stock.component'


const routes: Routes = [
  {
    path: "",
    data: {
      title: "Inventory",
    },
    children: [
      {
        path: "",
        redirectTo: "inventory",
      },
      {
        path: "live-inventory",
        component: LiveInventoryComponent,
        canActivate: [AuthGuard],
        data: {
          title: "Live Inventory",
        },
      },
      {
        path: "live-stock",
        component: LiveStockComponent,
        //canActivate: [AuthGuard],
        data: {
          title: "Live Stock",
        },
      },
      {
        path: "detail-inventory",
        component: DetailInventoryComponent,
        //canActivate: [AuthGuard],
        data: {
          title: "Detail Inventory",
        },
      },
      {
        path: "unsold-summary",
        component: UnsoldSummaryComponent,
        //canActivate: [AuthGuard],
        data: {
          title: "Unsold Summary",
        },
      },
      {
        path: "unsold-summary-old",
        component: UnsoldSummaryOldComponent,
        //canActivate: [AuthGuard],
        data: {
          title: "Unsold Summary",
        },
      },
      {
        path: "central-live-stock",
        component: CentralLiveStockComponent,
        //canActivate: [AuthGuard],
        data: {
          title: "Central Live Inventory",
        },
      },
      {
        path: "zone-wise-stock",
        component: ZoneWiseStockComponent,
        //canActivate: [AuthGuard],
        data: {
          title: "Zone Wise Stock",
        },
      },
      // {
      //   path: "sales-purchase-dispatch-stock-report",
      //   component: SalesPurchaseDispatchStockReportComponent,
      //   //canActivate: [AuthGuard],
      //   data: {
      //     title: "Sale-Purchase-Dispatch-Stock",
      //   },
      // },
      {
        path: "pvc-poly-inventory",
        component: PvcPolyInventoryComponent,
        //canActivate: [AuthGuard],
        data: {
          title: "Inventory",
        },
      },
      {
        path: "central-live-stock-import-local",
        component: CentralLiveStockImportLocalComponent,
        //canActivate: [AuthGuard],
        data: {
          title: "Inventory Import",
        },
      },
      {
        path: "central-live-stock-import-local-new",
        component: CentralLiveStockImportLocalNewComponent,
        //canActivate: [AuthGuard],
        data: {
          title: "Inventory Import New",
        },
      },
      {
        path: "central-inventory-local",
        component: CentralInventoryLocalComponent,
        //canActivate: [AuthGuard],
        data: {
          title: "Inventory Local",
        },
      },
      // {
      //   path: "short-damage-clearance",
      //   component: ShortDamageClearanceComponent,
      //   canActivate: [AuthGuard],
      //   data: {
      //     title: "Short-Damage Clearnce",
      //   },
      // },

      {
        path: "detail-inventory-import-local",
        component: DetailInventoryImportLocalComponent,
        canActivate: [AuthGuard],
        data: {
          title: "Import/Local Inventory",
        },
      },

      {
        path: "allocated-import-local-inventory",
        component: AllocatedImportLocalInventoryComponent,
        canActivate: [AuthGuard],
        data: {
          title: "Import/Local Allocated Inventory",
        },
      },

      {
        path: "unsold-summary-import-local",
        component: UnsoldSummaryImportLocalComponent,
        canActivate: [AuthGuard],
        data: {
          title: "Import/Local Unsold Summary",
        },
      },

      {
        path: "godown-stock",
        component: GodownStockComponent,
        canActivate: [AuthGuard],
        data: {
          title: "Inventory Movement",
        },
      },
      {
        path: "unsold-summary-import-local-new",
        component: UnsoldSummaryImportLocalFilteredComponent,
        canActivate: [AuthGuard],
        data: {
          title: "Import/Local Filtered Unsold Summary",
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryRoutingModule {}
