import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { LiveInventory } from '../../../shared/apis-path/apis-path';
import { Table } from 'primeng/table';

@Component({
	selector: 'app-live-stock',
	templateUrl: './live-stock.component.html',
	styleUrls: ['./live-stock.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices]
})
export class LiveStockComponent implements OnInit {

	@ViewChild("inventoryModal", { static: false }) public inventoryModal: ModalDirective;
	@ViewChild('dt', { static: false }) table: Table;

	isLoading: Boolean = false;
	data: any = [];
	cols: any = [];
	statusList: any = [];
	inventoryDetails: any = [];
	inventoryDate: any = null;
	_selectedColumns: any[];

	grades = [];
	lookup_grade = {};

	godowns = [];
	lookup_godowns = {};

	tot_import_pur_reg = 0;
	tot_import_pur_bond = 0;
	tot_stock_transfer = 0;
	tot_local_pur = 0;
	tot_physical_stock = 0;
	tot_sales_pending = 0;
	tot_available = 0;
	tot_hold = 0;
	filteredValuess: any[];

	constructor(private CrudServices: CrudServices) { }

	ngOnInit() {

		this.cols = [
			{ field: "import_purchase_reg", header: "Intransite Import Purchase Regular", permission: true },
			{ field: "import_purchase_bond", header: "Intransite Import Purchase Bond", permission: true },
			{ field: "stock_transfer_intransite", header: "Intransite Stock Transfer", permission: true },
			{ field: "local_purchase_intransite", header: "Intransite Local Purchase", permission: true },
			{ field: "godown_name", header: "Godown", permission: true },
			{ field: "grade_name", header: "Grade", permission: true },
			{ field: "physical_stock", header: "Physical Stock", permission: true },
			{ field: "physical_stock", header: "Sales Booking", permission: true },
			{ field: "sales_booking_pending", header: "Available Quantity", permission: true },
			{ field: "hold_qty", header: "Hold Quantity", permission: true },

			{ field: "action", header: "Action", permission: true }
		];

		this._selectedColumns = this.cols;

		this.loadData();

		//this.getDetailsStock();

		// this.CrudServices.getAll<any>(LiveInventory.getcentrallivestock).subscribe((response) => {
		// 	console.log(response, "centralstock");
		// });

	}

	loadData() {
		this.isLoading = true;
		this.data = [];
		this.CrudServices.getAll<any>(LiveInventory.getlivestock).subscribe((response) => {
			console.log(response);
			this.isLoading = false;
			if (response.data.length > 0) {
				console.log(response.data, "response.data");
				this.data = response.data;

				this.tot_import_pur_reg = 0;
				this.tot_import_pur_bond = 0;
				this.tot_stock_transfer = 0;
				this.tot_local_pur = 0;
				this.tot_physical_stock = 0;
				this.tot_sales_pending = 0;
				this.tot_available = 0;
				this.tot_hold = 0;
				for (let item, i = 0; item = this.data[i++];) {

					let grade_name = item.grade_name;
					let godown_name = item.godown_name;

					if (!(grade_name in this.lookup_grade)) {
						this.lookup_grade[grade_name] = 1;
						this.grades.push({ 'grade_name': grade_name });
					}

					if (!(godown_name in this.lookup_godowns)) {
						this.lookup_godowns[godown_name] = 1;
						this.godowns.push({ 'godown_name': godown_name });
					}


					this.tot_import_pur_reg = this.tot_import_pur_reg + item.ints_import_purchase_reg;
					this.tot_import_pur_bond = this.tot_import_pur_bond + item.ints_import_purchase_bond;
					this.tot_stock_transfer = this.tot_stock_transfer + item.stock_transfer_intransite;
					
					this.tot_local_pur = this.tot_local_pur + item.inst_local_purchase;
					this.tot_physical_stock = this.tot_physical_stock + (item.inward - item.outward);
					this.tot_sales_pending = this.tot_sales_pending + item.sales_pending;
					this.tot_available = this.tot_available + ((item.inward - item.outward) - (item.sales_pending));
					//this.tot_hold = this.tot_hold + 0;

				}

			}
		});
	}


	onchange(event, name) {
		const arr = [];
		if (event.value.length > 0) {
			for (let i = 0; i < event.value.length; i++) {
				arr.push(event.value[i][name]);
			}
			// console.log(arr);
			this.table.filter(arr, name, 'in');

		} else {
			this.table.filter('', name, 'in');
		}





	}
	getColumnPresent(name) {
		if (this._selectedColumns.find(ob => ob['field'] === name)) {
			return true;
		} else {
			return false;
		}
	}

	onFilter(event, dt) {
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;

		this.tot_import_pur_reg = 0;
		this.tot_import_pur_bond = 0;
		this.tot_stock_transfer = 0;
		this.tot_local_pur = 0;
		this.tot_physical_stock = 0;
		this.tot_sales_pending = 0;
		this.tot_available = 0;
		this.tot_hold = 0;
		for (const val of this.filteredValuess) {
			this.tot_import_pur_reg = this.tot_import_pur_reg + val.ints_import_purchase_reg;
			this.tot_import_pur_bond = this.tot_import_pur_bond + val.ints_import_purchase_bond;
			this.tot_stock_transfer = this.tot_stock_transfer + val.stock_transfer_intransite;
			
			this.tot_local_pur = this.tot_local_pur + val.inst_local_purchase;
			this.tot_physical_stock = this.tot_physical_stock + (val.inward - val.outward);
			this.tot_sales_pending = this.tot_sales_pending + val.sales_pending;
			this.tot_available = this.tot_available + ((val.inward - val.outward) - (val.sales_pending));
			//this.tot_hold = this.tot_hold + 0;
		}

	}

}
