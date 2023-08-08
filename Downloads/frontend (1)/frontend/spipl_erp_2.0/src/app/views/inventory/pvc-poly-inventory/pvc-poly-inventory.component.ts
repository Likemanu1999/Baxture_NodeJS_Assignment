import { Component, OnInit, ViewChild } from '@angular/core';
import { LiveInventory, MainGrade } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster/angular2-toaster';
import { Table } from 'primeng/table';
import { UserDetails } from '../../login/UserDetails.model';
@Component({
	selector: 'app-pvc-poly-inventory',
	templateUrl: './pvc-poly-inventory.component.html',
	styleUrls: ['./pvc-poly-inventory.component.scss'],
	providers: [CrudServices, ToasterService, PermissionService, LoginService, ExportService]
})
export class PvcPolyInventoryComponent implements OnInit {

	@ViewChild('dt', { static: false }) table: Table;

	cols: any = [];
	_selectedColumns: any[];
	data: any = [];
	isLoading: Boolean = false;

	tot_order_in_stock = 0;
	tot_import_pur_reg = 0;
	tot_import_pur_bond = 0;
	tot_stock_tranfer = 0;
	tot_local_pur = 0;
	tot_physical_stock = 0;
	tot_sales_pending = 0;
	tot_available = 0;
	tot_hold = 0;
	tot_intransite = 0;
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


	grades = [];
	lookup_grade = {};

	godowns = [];
	lookup_godowns = {};

	mainGrades = [];
	lookup_main_grade = {};

	productName = [];
	lookup_product_name = {};

	mainOrgName = [];
	lookup_main_org_name = {};

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});


	exportColumns: any[];
	export_list: any[];
	main_grade_ids: string[];

	links: string[] = [];

	user: UserDetails;
	main_grade = [{ id: 0, name: 'All' }];
	show_order_in_stock: any;
	ois_per: boolean;

	constructor(private CrudServices: CrudServices, private toasterService: ToasterService,
		private permissionService: PermissionService, private loginService: LoginService,
		private exportService: ExportService) {



		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.show_order_in_stock = (this.links.indexOf('show_order_in_stock') > -1);

		//this.show_order_in_stock = false;

		if (this.show_order_in_stock) {
			this.ois_per = true;
		} else {
			this.ois_per = false;
		}

		this.cols = [

			{ field: "godown_name", header: "Godown", permission: true, style: '100px' },
			{ field: "main_org_name", header: "Manufacturer", permission: true, style: '100px' },
			{ field: "product_name", header: "Sector", permission: true, style: '100px' },
			{ field: "main_grade_name", header: "Main Grade", permission: true, style: '100px' },
			{ field: "grade_name", header: "Grade", permission: true, style: '100px' },

			{ field: "local_intransite", header: "Order in Stock", permission: this.ois_per, style: '100px' },

			{ field: "instransite", header: "Other Intransite", permission: true, style: '100px' },
			// { field: "local_intransite", header: "Order in Stock", permission: true, style: '100px' },

			// { field: "arrival_grade", header: "Intransite Import Purchase Regular 5 Days B", permission: true, style: '100px' },
			// // { field: "reg_intransite", header: "Intransite Import Purchase Regular", permission: true, style: '100px' },
			// { field: "bond_intransite", header: "Intransite Import Purchase Bond", permission: true, style: '100px' },
			// { field: "stock_transfer_intransite", header: "Intransite Stock Transfer", permission: true, style: '100px' },
			// { field: "local_intransite", header: "Intransite Local Purchase", permission: true, style: '100px' },
			{ field: "order_in_stock", header: "Intransite", permission: true, style: '100px' },
			{ field: "inventory", header: "Godown Stock", permission: true, style: '100px' },
			{ field: "total_unsold", header: "Total Stock", permission: true, style: '100px' },
			{ field: "sales_pending", header: "Blocking", permission: true, style: '100px' },
			{ field: "available", header: "Available Stock", permission: true, style: '100px' },
			// { field: "action", header: "Action", permission: true, style: '100px' },
			// { field: "hold_qty", header: "Hold stock", permission: true, style: '100px' },
			// { field: "stock_after_hold", header: "Inventory After Hold", permission: true, style: '100px' }

		];
		this._selectedColumns = this.cols;



		this.user = this.loginService.getUserDetails();
		console.log(this.user.userDet[0].role_id, this.user.userDet[0].company_master.product_masters, "this.user")

		let productsArr = this.user.userDet[0].company_master.product_masters;
		console.log(Object.values(productsArr), "DEBUG_VIEW")

		var productIds = productsArr.map(function (e) {
			return e.id;
		}).filter(function (e, i, a) {
			return a.indexOf(e) === i;
		});
		console.log(productIds, "productIds");

		if (this.user.userDet[0].role_id == 1) {
			//all product
			this.loadData();
		} else {
			//spipl
			this.CrudServices.postRequest<any>(MainGrade.getMutipleMainGrade, {
				products_ids: productIds
			}).subscribe((response) => {
				console.log(Object.values(response), "multiple");
				var mainGradeIds = response.map(function (e) {
					return e.id;
				}).filter(function (e, i, a) {
					return a.indexOf(e) === i;
				});
				this.main_grade_ids = mainGradeIds;
				this.loadData();
			});
		}

		//this.loadData();

	}

	ngOnInit() {

		this.CrudServices.getRequest<any>(MainGrade.getAll).subscribe((response) => {
			console.log(response, "main_grade");
			this.main_grade = response;

		});

		// this.CrudServices.postRequest<any>(LiveInventory.getPvcPolyInventory, {}).subscribe((response) => {
		//   console.log(response, "response")
		// });
	}


	loadData() {

		this.isLoading = true;
		this.data = [];
		this.CrudServices.postRequest<any>(LiveInventory.getPvcPolyInventory, { main_grade_ids: this.main_grade_ids }).subscribe((response) => {
			console.log(response);
			this.isLoading = false;
			if (response.length > 0) {
				console.log(response, "response.data");
				this.data = response;


				this.tot_order_in_stock = 0;
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
				this.tot_intransite = 0;
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
							let product_name = sub_item.grade_master.product_master.name;
							let main_org_name = sub_item.grade_master.main_org_master ? sub_item.grade_master.main_org_master.org_name : '';

							sub_item.grade_name = grade_name;
							sub_item.main_grade_name = main_grade_name;
							sub_item.product_name = product_name;
							sub_item.main_org_name = main_org_name;
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

							if (!(product_name in this.lookup_product_name)) {
								this.lookup_product_name[product_name] = 1;
								this.productName.push({ 'product_name': product_name });
							}


							if (!(main_org_name in this.lookup_main_org_name)) {
								this.lookup_main_org_name[main_org_name] = 1;
								this.mainOrgName.push({ 'main_org_name': main_org_name });
							}





							this.tot_import_pur_reg = this.tot_import_pur_reg + sub_item.reg_intransite;

							this.tot_order_in_stock = this.tot_order_in_stock + sub_item.local_intransite;

							this.tot_import_pur_bond = this.tot_import_pur_bond + sub_item.bond_intransite;
							this.tot_stock_tranfer = this.tot_stock_tranfer + Number(sub_item.stock_transfer_intransite);

							// this.tot_local_pur = this.tot_local_pur + sub_item.local_intransite;

							this.tot_local_pur = this.tot_local_pur + sub_item.order_in_stock;

							this.tot_physical_stock = this.tot_physical_stock + (sub_item.inventory);

							// sub_item.reg_intransite +
							this.tot_unsold = this.tot_unsold + (Number(sub_item.bond_intransite) + Number(sub_item.stock_transfer_intransite) + Number(sub_item.order_in_stock) + Number(sub_item.inventory));

							// sub_item.reg_intransite + 
							sub_item.total_unsold = ((sub_item.arrival_grade ? sub_item.arrival_grade : 0) + sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite) + sub_item.order_in_stock + sub_item.inventory);


							this.tot_sales_pending = this.tot_sales_pending + sub_item.sales_pending;

							// sub_item.reg_intransite +
							this.tot_available = this.tot_available + (((sub_item.arrival_grade ? sub_item.arrival_grade : 0) + sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite) + sub_item.order_in_stock + sub_item.inventory) - (sub_item.sales_pending));

							//sub_item.reg_intransite + 
							sub_item.available = (((sub_item.arrival_grade ? sub_item.arrival_grade : 0) + sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite) + sub_item.order_in_stock + sub_item.inventory) - (sub_item.sales_pending));

							this.tot_hold = this.tot_hold + sub_item.hold_qty;

							//sub_item.reg_intransite +
							this.inventory_after_hold = this.inventory_after_hold + (((sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite) + sub_item.local_intransite + sub_item.inventory) - (sub_item.sales_pending)) - sub_item.hold_qty);

							//sub_item.reg_intransite + 
							sub_item.stock_after_hold = (((sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite) + sub_item.local_intransite + sub_item.inventory) - (sub_item.sales_pending)) - sub_item.hold_qty);

							this.tot_arrival_till_date = this.tot_arrival_till_date + (sub_item.arrival_grade ? sub_item.arrival_grade : 0);

							sub_item.instransite = ((sub_item.arrival_grade ? sub_item.arrival_grade : 0) + sub_item.bond_intransite +
								sub_item.stock_transfer_intransite_num);
							this.tot_intransite = this.tot_intransite + sub_item.instransite;


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
			this.tot_order_in_stock = 0;
			this.tot_arrival_till_date = 0;
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
			this.tot_intransite = 0;
			for (const val of this.filteredValuess) {
				this.tot_import_pur_reg = this.tot_import_pur_reg + val.reg_intransite;
				this.tot_order_in_stock = this.tot_order_in_stock + val.local_intransite;
				this.tot_import_pur_bond = this.tot_import_pur_bond + val.bond_intransite;
				this.tot_stock_tranfer = this.tot_stock_tranfer + Number(val.stock_transfer_intransite);
				this.tot_local_pur = this.tot_local_pur + val.order_in_stock;
				this.tot_physical_stock = this.tot_physical_stock + (val.inventory);

				//val.reg_intransite +
				this.tot_unsold = this.tot_unsold + ((val.arrival_grade ? val.arrival_grade : 0) + val.bond_intransite + Number(val.stock_transfer_intransite) + val.order_in_stock + val.inventory);


				this.tot_sales_pending = this.tot_sales_pending + val.sales_pending;
				//val.reg_intransite +
				this.tot_available = this.tot_available + (((val.arrival_grade ? val.arrival_grade : 0) + val.bond_intransite + Number(val.stock_transfer_intransite) + val.order_in_stock + val.inventory) - (val.sales_pending));
				this.tot_hold = this.tot_hold + val.hold_qty;
				//val.reg_intransite + 
				this.inventory_after_hold = this.inventory_after_hold + (((val.bond_intransite + Number(val.stock_transfer_intransite) + val.local_intransite + val.inventory) - (val.sales_pending)) - val.hold_qty);

				this.tot_arrival_till_date = this.tot_arrival_till_date + (val.arrival_grade ? val.arrival_grade : 0);
				this.tot_intransite = this.tot_intransite + ((val.arrival_grade ? val.arrival_grade : 0) + val.bond_intransite + Number(val.stock_transfer_intransite));

			}

		}


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
			else if (this._selectedColumns[j]['field'] === 'order_in_stock') {
				foot[this._selectedColumns[j]['header']] = this.tot_order_in_stock;
			} else if (this._selectedColumns[j]['field'] === 'intransite') {
				foot[this._selectedColumns[j]['header']] = this.tot_intransite;
			}
		}


		this.export_list.push(foot);


	}

	exportExcel() {
		this.exportData();
		this.exportService.exportExcel(this.export_list, 'Central-Inventory');
	}



	onSelectMainGrade() {
		//	this.detailView = false;
		// this.main_grade_ids =$e;
		//	console.log(this.main_grade_ids);
		this.loadData();


	}

}
