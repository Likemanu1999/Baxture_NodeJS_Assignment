import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { DiscountMasterComponent } from './discount-master/discount-master.component';
import { MouMasterComponent } from './mou-master/mou-master.component';
import { SalesPurchasePriceListComponent } from './sales-purchase-price-list/sales-purchase-price-list.component';
import { PriceListViewComponent } from './price-list-view/price-list-view.component';
import { EditCopyPriceListComponent } from './edit-copy-price-list/edit-copy-price-list.component';
import { PriceListSearchComponent } from './price-list-search/price-list-search.component';
import { DiscountReportComponent } from './discount-report/discount-report.component';
const routes: Routes = [
    {
        path: '',
        data: {
            title: 'Mou'
        },
        children: [
            {
                path: '',
                redirectTo: 'mou'
            },
            {
                path: 'mou-master',
                component: MouMasterComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'MOU Master'
                }
            },
            {
                path: 'discount-master',
                component: DiscountMasterComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'Discount Master'
                }
            },
            {
                path: 'sales-purchase-price-list',
                component: SalesPurchasePriceListComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'Price List'
                }
            },
            {
                path: 'price-list-view',
                component: PriceListViewComponent,
                canActivate: [AuthGuard],
                data: {
                    title: 'Price List - View'
                }
            },
            {
                path: 'edit-copy-price-list/:freight_id',
				component: EditCopyPriceListComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Edit Price List'
				}
            },
            {
                path: 'price-list-search',
				component: PriceListSearchComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Price List Search'
				}
            },
            {
                path: 'discount-report',
				component: DiscountReportComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Discount Report'
				}
            }
    ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MouRoutingModule { }
