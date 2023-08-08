import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { forexReports, LiveInventory } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ToasterConfig, ToasterService } from 'angular2-toaster/angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { ExportService } from '../../../shared/export-service/export-service';

@Component({
	selector: 'app-central-live-stock',
	templateUrl: './central-live-stock.component.html',
	styleUrls: ['./central-live-stock.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, LoginService, ExportService]
})
export class CentralLiveStockComponent implements OnInit {

	@ViewChild("centralModel", { static: false }) public inventoryModal: ModalDirective;
	@ViewChild('myHoldModel', { static: false }) public myHoldModel: ModalDirective;

	@ViewChild('dt', { static: false }) table: Table;

	cols: any = [];
	isLoading: Boolean = false;
	data: any = [];


	_selectedColumns: any[];

	grades = [];
	lookup_grade = {};

	godowns = [];
	lookup_godowns = {};

	mainGrades = [];
	lookup_main_grade = {};


	links: string[] = [];
	user: UserDetails;



	tot_import_pur_reg = 0;
	tot_import_pur_bond = 0;
	tot_stock_tranfer = 0;
	tot_local_pur = 0;
	tot_physical_stock = 0;
	tot_sales_pending = 0;
	tot_available = 0;
	tot_hold = 0;
	inventory_after_hold = 0;
	tot_arrival_till_date = 0
	tot_unsold = 0;
	filteredValuess: any[];
	newData = [];
	hold_qty_input: any;
	main_godown_id_set: any;
	grade_id_set: any;
	cal_central_stock: any;
	arrival_date: any;
	bsValue: Date;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;

	exportColumns: any[];
	export_list: any[];
	hold_column: any;

	constructor(private CrudServices: CrudServices, private toasterService: ToasterService,
		private permissionService: PermissionService, private loginService: LoginService,
		private exportService: ExportService,
	) {


		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.cal_central_stock = (this.links.indexOf('cal_central_stock') > -1);
		
	}

	ngOnInit() {


		this.cols = [

			{ field: "godown_name", header: "Godown", permission: true, style: '100px' },
			{ field: "main_grade_name", header: "Main Grade", permission: true, style: '100px' },
			{ field: "grade_name", header: "Grade", permission: true, style: '100px' },
			{ field: "arrival_grade", header: "Arrival till Date", permission: true, style: '100px' },
			{ field: "reg_intransite", header: "Intransite Import Purchase Regular", permission: true, style: '100px' },
			{ field: "bond_intransite", header: "Intransite Import Purchase Bond", permission: true, style: '100px' },
			{ field: "stock_transfer_intransite", header: "Intransite Stock Transfer", permission: true, style: '100px' },
			{ field: "local_intransite", header: "Intransite Local Purchase", permission: true, style: '100px' },
			{ field: "inventory", header: "Physical Stock", permission: true, style: '100px' },
			{ field: "total_unsold", header: "Total Unsold", permission: true, style: '100px' },
			{ field: "sales_pending", header: "Sales Pending", permission: true, style: '100px' },
			{ field: "available", header: "Available Stock", permission: true, style: '100px' },
			{ field: "action", header: "Action", permission: true, style: '100px' },
			{ field: "hold_qty", header: "Hold stock", permission: true, style: '100px' },
			{ field: "stock_after_hold", header: "Inventory After Hold", permission: true, style: '100px' }

		];
		this._selectedColumns = this.cols;

		this.loadData();
		// this.CrudServices.getRequest<any>(LiveInventory.marketing_person_wise_stock).subscribe((reponse) => {
		//   console.log(reponse, " Marketinperson");
		// });

	}

	loadData() {

		console.log(this.bsValue,"this.bsValue")
		this.arrival_date = this.bsValue;

		this.isLoading = true;
		this.data = [];
		this.CrudServices.postRequest<any>(LiveInventory.getcentrallivestock, {
			arrival_date: this.arrival_date
		}).subscribe((response) => {
			console.log(response);
			this.isLoading = false;
			if (response.length > 0) {
				console.log(response, "response.data");
				this.data = response;


				this.tot_import_pur_reg = 0;
				this.tot_import_pur_bond = 0;
				this.tot_stock_tranfer = 0;
				this.tot_local_pur = 0;
				this.tot_physical_stock = 0;
				this.tot_sales_pending = 0;
				this.tot_available = 0;
				this.tot_hold = 0;
				this.tot_unsold = 0;
				this.inventory_after_hold = 0;
				this.tot_arrival_till_date = 0;
				this.newData = [];
				for (let item, i = 0; item = this.data[i++];) {
					console.log(item, "stage 1")


					let godown_name = item.godown_name;
					let main_godown_id = item.main_godown_id;


					if (!(godown_name in this.lookup_godowns)) {
						this.lookup_godowns[godown_name] = 1;
						this.godowns.push({ 'godown_name': godown_name });
					}
					if (item.grade_details.length) {

						for (let sub_item, j = 0; sub_item = item.grade_details[j++];) {
							console.log(sub_item, "stage 2")

							let grade_name = sub_item.grade_master.grade_name;
							let grade_id = sub_item.grade_master.grade_id;

							if (item.arrival) {
								for (let arrival_item, k = 0; arrival_item = item.arrival[k++];) {
									if (arrival_item.grade_id == grade_id) {
										sub_item.arrival_grade = arrival_item.non_received_cntr;
									}
								}

							}


							let main_grade_name = sub_item.grade_master.main_grade.name;

							sub_item.grade_name = grade_name;
							sub_item.main_grade_name = main_grade_name;
							sub_item.godown_name = godown_name;
							sub_item.main_godown_id = main_godown_id;
							sub_item.grade_id = grade_id;
							sub_item.stock_transfer_intransite_num = Number(sub_item.stock_transfer_intransite);

							if (!(grade_name in this.lookup_grade)) {
								this.lookup_grade[grade_name] = 1;
								this.grades.push({ 'grade_name': grade_name });
							}

							if (!(main_grade_name in this.lookup_main_grade)) {
								this.lookup_main_grade[main_grade_name] = 1;
								this.mainGrades.push({ 'main_grade_name': main_grade_name });
							}

							this.tot_import_pur_reg = this.tot_import_pur_reg + sub_item.reg_intransite;
							this.tot_import_pur_bond = this.tot_import_pur_bond + sub_item.bond_intransite;
							this.tot_stock_tranfer = this.tot_stock_tranfer + Number(sub_item.stock_transfer_intransite);
							this.tot_local_pur = this.tot_local_pur + sub_item.local_intransite;
							this.tot_physical_stock = this.tot_physical_stock + (sub_item.inventory);

							// sub_item.reg_intransite +
							this.tot_unsold = this.tot_unsold + (sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite) + sub_item.local_intransite + sub_item.inventory);

							// sub_item.reg_intransite + 
							sub_item.total_unsold = (sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite) + sub_item.local_intransite + sub_item.inventory);


							this.tot_sales_pending = this.tot_sales_pending + sub_item.sales_pending;

							// sub_item.reg_intransite +
							this.tot_available = this.tot_available + ((sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite) + sub_item.local_intransite + sub_item.inventory) - (sub_item.sales_pending));

							//sub_item.reg_intransite + 
							sub_item.available = ((sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite) + sub_item.local_intransite + sub_item.inventory) - (sub_item.sales_pending));

							this.tot_hold = this.tot_hold + sub_item.hold_qty;

							//sub_item.reg_intransite +
							this.inventory_after_hold = this.inventory_after_hold + (((sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite) + sub_item.local_intransite + sub_item.inventory) - (sub_item.sales_pending)) - sub_item.hold_qty);

							//sub_item.reg_intransite + 
							sub_item.stock_after_hold = (((sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite) + sub_item.local_intransite + sub_item.inventory) - (sub_item.sales_pending)) - sub_item.hold_qty);

							this.tot_arrival_till_date = this.tot_arrival_till_date + (sub_item.arrival_grade ? sub_item.arrival_grade : 0);

							this.newData.push(sub_item);
						}




					}


				}


				console.log(this.newData, "this.newData")



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

		console.log(event, "eventevent")
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;

		if (this.filteredValuess) {
			this.tot_import_pur_reg = 0;
			this.tot_import_pur_bond = 0;
			this.tot_stock_tranfer = 0;
			this.tot_local_pur = 0;
			this.tot_physical_stock = 0;
			this.tot_sales_pending = 0;
			this.tot_available = 0;
			this.tot_hold = 0;
			this.tot_unsold = 0;
			this.inventory_after_hold = 0;
			for (const val of this.filteredValuess) {
				this.tot_import_pur_reg = this.tot_import_pur_reg + val.reg_intransite;
				this.tot_import_pur_bond = this.tot_import_pur_bond + val.bond_intransite;
				this.tot_stock_tranfer = this.tot_stock_tranfer + Number(val.stock_transfer_intransite);
				this.tot_local_pur = this.tot_local_pur + val.local_intransite;
				this.tot_physical_stock = this.tot_physical_stock + (val.inventory);

				//val.reg_intransite +
				this.tot_unsold = this.tot_unsold + (val.bond_intransite + Number(val.stock_transfer_intransite) + val.local_intransite + val.inventory);
				this.tot_sales_pending = this.tot_sales_pending + val.sales_pending;
				//val.reg_intransite +
				this.tot_available = this.tot_available + ((val.bond_intransite + Number(val.stock_transfer_intransite) + val.local_intransite + val.inventory) - (val.sales_pending));
				this.tot_hold = this.tot_hold + val.hold_qty;
				//val.reg_intransite + 
				this.inventory_after_hold = this.inventory_after_hold + (((val.bond_intransite + Number(val.stock_transfer_intransite) + val.local_intransite + val.inventory) - (val.sales_pending)) - val.hold_qty);

				this.tot_arrival_till_date = this.tot_arrival_till_date + (val.arrival_grade ? val.arrival_grade : 0);

			}

		}


	}

	holdQtyUpdate(main_godown_id, grade_id, hold_qty) {
		this.hold_column = hold_qty;
		this.main_godown_id_set = main_godown_id;
		this.grade_id_set = grade_id;
		this.CrudServices.postRequest<any>(forexReports.getHoldQty, {
			main_godown_id: main_godown_id,
			grade_id: grade_id
		}).subscribe((response) => {
			console.log(response, "Grade Wise Unsold");
			this.hold_qty_input = response[0].hold_qty;
			this.myHoldModel.show();
		});
	}

	closeModal() {
		this.myHoldModel.hide();
	}

	submitHold() {



		this.CrudServices.postRequest<any>(forexReports.updateHoldQty, {
			main_godown_id: this.main_godown_id_set,
			grade_id: this.grade_id_set,
			hold_qty: this.hold_qty_input
		}).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);

				console.log(response, "response")
				this.newData.map((element) => {
					console.log(this.main_godown_id_set, element.main_godown_id, this.grade_id_set, element.grade_id, "nnn");
					if (this.main_godown_id_set == element.main_godown_id && this.grade_id_set == element.grade_id) {
						element.hold_qty = this.hold_qty_input;
						console.log(element, "elemm")
					}

					return element;

				});
				this.table.reset();
				//  this.loadData();
			} else {
				this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
			}
			this.myHoldModel.hide();
		});

	}

	calculateCentralStock() {
		this.CrudServices.getRequest<any>(LiveInventory.centralStockCalculate).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				this.loadData();
			} else {
				this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
			}
		});

	}

	calculateCentralStockOptimize() {
		this.CrudServices.getRequest<any>(LiveInventory.cal_all_central_stock_optimize).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				this.loadData();
			} else {
				this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
			}
		});

	}

	


	exportData() {
		this.export_list = [];
		let arr = [];
		const foot = {};
		if (this.filteredValuess === undefined) {
			arr = this.newData;
		} else {
			arr = this.filteredValuess;
		}

		for (let i = 0; i < arr.length; i++) {
			const exportList = {};
			for (let j = 0; j < this.cols.length; j++) {
				exportList[this.cols[j]['header']] = arr[i][this.cols[j]['field']];

			}
			this.export_list.push(exportList);
		}

		for (let j = 0; j < this._selectedColumns.length; j++) {

			if (this._selectedColumns[j]['field'] === 'reg_intransite') {
				foot[this._selectedColumns[j]['header']] = this.tot_import_pur_reg;
			} else if (this._selectedColumns[j]['field'] === 'bond_intransite') {
				foot[this._selectedColumns[j]['header']] = this.tot_import_pur_bond;
			}
			else if (this._selectedColumns[j]['field'] === 'stock_transfer_intransite') {
				foot[this._selectedColumns[j]['header']] = this.tot_stock_tranfer;
			}
			else if (this._selectedColumns[j]['field'] === 'local_intransite') {
				foot[this._selectedColumns[j]['header']] = this.tot_local_pur;
			}
			else if (this._selectedColumns[j]['field'] === 'inventory') {
				foot[this._selectedColumns[j]['header']] = this.tot_physical_stock;
			}
			else if (this._selectedColumns[j]['field'] === 'arrival_grade') {
				foot[this._selectedColumns[j]['header']] = this.tot_arrival_till_date;
			}

			else if (this._selectedColumns[j]['field'] === 'total_unsold') {
				foot[this._selectedColumns[j]['header']] = this.tot_unsold;
			}

			else if (this._selectedColumns[j]['field'] === 'sales_pending') {
				foot[this._selectedColumns[j]['header']] = this.tot_sales_pending;
			}

			else if (this._selectedColumns[j]['field'] === 'available') {
				foot[this._selectedColumns[j]['header']] = this.tot_available;
			}

			else if (this._selectedColumns[j]['field'] === 'hold_qty') {
				foot[this._selectedColumns[j]['header']] = this.tot_hold;
			}

			else if (this._selectedColumns[j]['field'] === 'stock_after_hold') {
				foot[this._selectedColumns[j]['header']] = this.inventory_after_hold;
			}





		}


		this.export_list.push(foot);


	}

	exportExcel() {
		this.exportData();
		this.exportService.exportExcel(this.export_list, 'Central-Inventory');
	}


	OnCheckGodownAllocation(checked, item) {
		console.log(checked, item);
		let is_allocate = 0;
		if (checked) {
			is_allocate = 1;
		}

		this.CrudServices.postRequest<any>(LiveInventory.updateAllocationCheck, {
			grade_id: item.grade_id,
			main_godown_id: item.main_godown_id,
			is_allocate: is_allocate
		}).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				//this.loadData();
			} else {
				this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
			}
		});

	}
	// 

}
