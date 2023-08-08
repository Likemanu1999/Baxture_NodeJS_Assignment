import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../_helpers/auth.guard';
import { GodownStockComponent } from '../inventory/godown-stock/godown-stock.component';
import { SalesPurchaseDispatchStockReportComponent } from '../inventory/sales-purchase-dispatch-stock-report/sales-purchase-dispatch-stock-report.component';
import { ShortDamageClearanceComponent } from '../inventory/short-damage-clearance/short-damage-clearance.component';
import { GodownStaffLinkComponent } from '../masters/godown-staff-link/godown-staff-link.component';
import { CentralRedisInventoryImportComponent } from './central-redis-inventory-import/central-redis-inventory-import.component';
import { CentralRedisInventoryLocalComponent } from './central-redis-inventory-local/central-redis-inventory-local.component';
import { PeppReleaseUnsoldComponent } from './pepp-release-unsold/pepp-release-unsold.component';
import { RedisAllocatedInventoryComponent } from './redis-allocated-inventory/redis-allocated-inventory.component';
import { RedisBdInventoryComponent } from './redis-bd-inventory/redis-bd-inventory.component';
import { RedisDetailInventoryImportLocalComponent } from './redis-detail-inventory-import-local/redis-detail-inventory-import-local.component';
import { RedisDetailInventoryComponent } from './redis-detail-inventory/redis-detail-inventory.component';
import { ReleaseUnsoldComponent } from './release-unsold/release-unsold.component';
import { UnsoldImportLocalComponent } from './unsold-import-local/unsold-import-local.component';
import { UnsoldSummaryComponent } from './unsold-summary/unsold-summary.component';
import { InventoryMovementNewComponent } from './inventory-movement-new/inventory-movement-new.component';
import { RedisSurishaDetailInventoryComponent } from './redis-surisha-detail-inventory/redis-surisha-detail-inventory.component';
import { RedisBdInventoryNewComponent } from './redis-bd-inventory-new/redis-bd-inventory-new.component';


const routes: Routes = [
	{
		path: '',
		data: {
			title: 'Inventory'
		},
		children: [
			{
				path: '',
				redirectTo: 'inventory-redis'
			},
			{
				path: 'unsold-summary-redis',
				component: UnsoldSummaryComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'Unsold Summary'
				}
			},
			{
				path: 'central-redis-inventory-import',
				component: CentralRedisInventoryImportComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'Central Redis Inventory Import'
				}
			},
			{
				path: 'central-redis-inventory-local',
				component: CentralRedisInventoryLocalComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'Central Redis Inventory Local'
				}
			},
			{
				path: 'unsold-import-local',
				component: UnsoldImportLocalComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'Unsold Import Local'
				}
			}, {
				path: 'redis-bd-inventory',
				component: RedisBdInventoryNewComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'BD Inventory'
				}
			},
			{
				path: 'redis-detail-inventory',
				component: RedisDetailInventoryComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'Detail Inventory'
				}
			},
			{
				path: 'redis-detail-inventory-import-local',
				component: RedisDetailInventoryImportLocalComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'Detail Inventory Import/Local'
				}
			},
			{
				path: 'redis-allocated-inventory',
				component: RedisAllocatedInventoryComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'Allocated Inventory'
				}
			},
			{
				path: 'release-unsold',
				component: ReleaseUnsoldComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'Release Unsold'
				}
			},
			{
				path: 'pepp-release-unsold',
				component: PeppReleaseUnsoldComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'PEPP Release Unsold'
				}
			},
			{
				path: 'sales-purchase-dispatch-stock-report-new',
				component: SalesPurchaseDispatchStockReportComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'Sale Purchase Dispatch Stock Report'
				}
			},
			{
				path: 'godown-staff-link-new',
				component: GodownStaffLinkComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'Godwon Staff Link'
				}
			},
			{
				path: 'short-damage-clearance-new',
				component: ShortDamageClearanceComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'Short Damage Clearance'
				}
			},
			{
				path: 'inventory-movement-new',
				component: InventoryMovementNewComponent,
				canActivate: [AuthGuard],
				data: {
					title: 'Inventory Movement New'
				}
			},
			{
				path: 'surisha-detail-inventory',
				component: RedisSurishaDetailInventoryComponent,
				//canActivate: [AuthGuard],
				data: {
					title: 'Surisha Detail Inventory'
				}
			},
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})

export class InventoryRedisRoutingModule { }
