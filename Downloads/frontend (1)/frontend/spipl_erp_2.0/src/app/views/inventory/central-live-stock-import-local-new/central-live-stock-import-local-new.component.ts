import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { UserDetails } from '../../login/UserDetails.model';
import { ToasterConfig, ToasterService } from 'angular2-toaster/angular2-toaster';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { forexReports, inventoryRedis, LiveInventory } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-central-live-stock-import-local-new',
	templateUrl: './central-live-stock-import-local-new.component.html',
	styleUrls: ['./central-live-stock-import-local-new.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, LoginService, ExportService]
})
export class CentralLiveStockImportLocalNewComponent implements OnInit {

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
	pi_flag_hold_release: boolean = false;

	tot_import_pur_reg_import = 0;
	tot_import_pur_bond_import = 0;
	tot_stock_tranfer_import = 0;
	tot_physical_stock_import = 0;
	tot_sales_pending_import = 0;
	tot_available_import = 0;
	tot_hold_import = 0;
	inventory_after_hold_import = 0;
	tot_arrival_till_date = 0
	tot_unsold_import = 0;
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

	tot_local_purchase_import_intransite: any;


	constructor(private CrudServices: CrudServices, private toasterService: ToasterService,
		private permissionService: PermissionService, private loginService: LoginService,
		private exportService: ExportService) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		 this.pi_flag_hold_release = (this.links.indexOf('Flc Pi Hold/Release Link') > -1);
		console.log('Unsold link access', this.pi_flag_hold_release);
	}

	ngOnInit() {

		this.cols = [

			{ field: "godown_name", header: "Godown", permission: true, style: '100px' },
			{ field: "main_grade_name", header: "Main Grade", permission: true, style: '100px' },
			{ field: "grade_name", header: "Grade", permission: true, style: '100px' },
			{ field: "arrival_grade", header: "Arrival till Date", permission: true, style: '100px' },
			{ field: "reg_intransite", header: "Intransite Import Purchase Regular ", permission: true, style: '100px' },
			{ field: "bond_intransite", header: "Intransite Import Purchase Bond", permission: true, style: '100px' },
			{ field: "local_purchase_import_intransite", header: "Intransite Local Purchase Import", permission: true, style: '100px' },
			{ field: "stock_transfer_intransite_import", header: "Intransite Stock Transfer Import", permission: true, style: '100px' },
			{ field: "inventory_import", header: "Physical Stock Import", permission: true, style: '100px' },
			{ field: "total_unsold_import", header: "Total Unsold Import", permission: true, style: '100px' },
			{ field: "sales_pending_import", header: "Sales Pending Import", permission: true, style: '100px' },
			{ field: "available_import", header: "Available Stock Import", permission: true, style: '100px' },
			{ field: "action", header: "Action", permission: true, style: '100px' },
			{ field: "hold_qty_import", header: "Hold stock Import", permission: true, style: '100px' },
			{ field: "stock_after_hold_import", header: "Inventory After Hold Import", permission: true, style: '100px' }

		];
		this._selectedColumns = this.cols;

		this.loadData();
	}

	loadData() {

		this.arrival_date = this.bsValue;

		this.isLoading = true;
		this.data = [];
		this.CrudServices.postRequest<any>(LiveInventory.getcentrallivestockImportLocal, {
			arrival_date: this.arrival_date
		}).subscribe((response) => {
			console.log(response);
			this.isLoading = false;
			if (response.length > 0) {
				this.CrudServices.postRequest<any>(forexReports.getUnsoldSummaryImportLocalNewFiltered, {
					main_grade_id_array: [0]
				}).subscribe((responseHold) => {
					let filteredArrayPortWise = [];
					console.log(responseHold, "response.data.hold");

					console.log(response, "response.data");
					this.data = response;

					this.tot_import_pur_reg_import = 0;
					this.tot_import_pur_bond_import = 0;
					this.tot_stock_tranfer_import = 0;
					this.tot_physical_stock_import = 0;
					this.tot_sales_pending_import = 0;
					this.tot_available_import = 0;
					this.tot_hold_import = 0;
					this.tot_unsold_import = 0;
					this.inventory_after_hold_import = 0;
					this.tot_arrival_till_date = 0;
					this.tot_local_purchase_import_intransite = 0
					this.newData = [];
					for (let item, i = 0; item = this.data[i++];) {
						// console.log(item, "stage 1")


						let godown_name = item.godown_name;
						let main_godown_id = item.main_godown_id;


						if (!(godown_name in this.lookup_godowns)) {
							this.lookup_godowns[godown_name] = 1;
							this.godowns.push({ 'godown_name': godown_name });
						}
						if (item.grade_details.length) {

							for (let sub_item, j = 0; sub_item = item.grade_details[j++];) {
								// console.log(sub_item, "stage 2")

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
								sub_item.stock_transfer_intransite_import_num = Number(sub_item.stock_transfer_intransite_import);

								if (!(grade_name in this.lookup_grade)) {
									this.lookup_grade[grade_name] = 1;
									this.grades.push({ 'grade_name': grade_name });
								}

								if (!(main_grade_name in this.lookup_main_grade)) {
									this.lookup_main_grade[main_grade_name] = 1;
									this.mainGrades.push({ 'main_grade_name': main_grade_name });
								}

								if (!this.pi_flag_hold_release) {
									filteredArrayPortWise = responseHold.resRegIntransite.filter((item) => item.godown_id == sub_item.main_godown_id && item.grade_id == sub_item.grade_id);
									sub_item.reg_intransite = sub_item.reg_intransite - filteredArrayPortWise.reduce((accumulator, object) => {
										return accumulator + object.pending_qty;
									}, 0);

									filteredArrayPortWise = responseHold.resMaterialInBondPending.filter((item) => item.godown_id == sub_item.main_godown_id && item.grade_id == sub_item.grade_id);
									sub_item.bond_intransite = sub_item.bond_intransite - filteredArrayPortWise.reduce((accumulator, object) => {
										return accumulator + object.pending_qty;
									}, 0);

								} else {
									this.tot_import_pur_reg_import = this.tot_import_pur_reg_import + sub_item.reg_intransite;
									this.tot_import_pur_bond_import = this.tot_import_pur_bond_import + sub_item.bond_intransite;
								}
								this.tot_stock_tranfer_import = this.tot_stock_tranfer_import + Number(sub_item.stock_transfer_intransite_import);
								this.tot_physical_stock_import = this.tot_physical_stock_import + (sub_item.inventory_import);

								this.tot_local_purchase_import_intransite = this.tot_local_purchase_import_intransite + Number(sub_item.local_purchase_import_intransite);

								// sub_item.reg_intransite +
								this.tot_unsold_import = this.tot_unsold_import + (sub_item.reg_intransite  + sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite_import) + sub_item.inventory_import) + Number(sub_item.local_purchase_import_intransite);

								// sub_item.reg_intransite + 
								sub_item.total_unsold = (sub_item.reg_intransite + sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite_import) + sub_item.inventory_import + Number(sub_item.local_purchase_import_intransite));


								this.tot_sales_pending_import = this.tot_sales_pending_import + sub_item.sales_pending_import;



								// sub_item.reg_intransite +
								this.tot_available_import = this.tot_available_import + ((sub_item.reg_intransite + sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite_import) + sub_item.inventory_import + Number(sub_item.local_purchase_import_intransite)) - (sub_item.sales_pending_import));

								//sub_item.reg_intransite + 
								sub_item.available_import = ((sub_item.reg_intransite + sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite_import) + sub_item.inventory_import + Number(sub_item.local_purchase_import_intransite)) - (sub_item.sales_pending_import));

								this.tot_hold_import = this.tot_hold_import + Number(sub_item.hold_qty_import);

								//sub_item.reg_intransite +
								this.inventory_after_hold_import = this.inventory_after_hold_import + (((sub_item.reg_intransite + sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite_import) + sub_item.inventory_import + Number(sub_item.local_purchase_import_intransite)) - (sub_item.sales_pending_import)) - Number(sub_item.hold_qty_import));

								//sub_item.reg_intransite + 
								sub_item.stock_after_hold_import = (((sub_item.reg_intransite +sub_item.bond_intransite + Number(sub_item.stock_transfer_intransite_import) + sub_item.inventory_import + Number(sub_item.local_purchase_import_intransite)) - (sub_item.sales_pending_import)) - Number(sub_item.hold_qty_import));

								this.tot_arrival_till_date = this.tot_arrival_till_date + (sub_item.arrival_grade ? sub_item.arrival_grade : 0);

								this.newData.push(sub_item);
							}

						}
					}
					console.log(this.newData, "this.newData")


				})

			}
		});
	}

	getColumnPresent(name) {
		if (this._selectedColumns.find(ob => ob['field'] === name)) {
			return true;
		} else {
			return false;
		}
	}

	OnCheckGodownAllocationImport(checked, item) {
		console.log(checked, item);
		let is_allocate_import = 0;
		if (checked) {
			is_allocate_import = 1;
		}

		let allocate_condition = { is_allocate_import: is_allocate_import }
		this.CrudServices.postRequest<any>(LiveInventory.updateAllocationCheckImportLocal, {
			grade_id: item.grade_id,
			main_godown_id: item.main_godown_id,
			allocate_condition: allocate_condition
		}).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				//this.loadData();
			} else {
				this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
			}
		});


		//For redis inventory
		this.CrudServices.postRequest<any>(inventoryRedis.updateAllocationCheckImportLocal, {
			grade_id: item.grade_id,
			main_godown_id: item.main_godown_id,
			allocate_condition: allocate_condition,
			field_name: "is_allocate_import"
		}).subscribe((response) => {
		});

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
			this.hold_qty_input = response[0].hold_qty_import;
			this.myHoldModel.show();
		});
	}


	submitHold() {

		let condition_hold_import = {
			hold_qty_import: Number(this.hold_qty_input)
		}
		this.CrudServices.postRequest<any>(forexReports.updateHoldQtyLocalImport, {
			main_godown_id: this.main_godown_id_set,
			grade_id: this.grade_id_set,
			hold_qty: condition_hold_import
		}).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				console.log(response, "response")

				this.newData.map((element) => {
					console.log(this.main_godown_id_set, element.main_godown_id, this.grade_id_set, element.grade_id, "nnn");
					if (this.main_godown_id_set == element.main_godown_id && this.grade_id_set == element.grade_id) {
						element.hold_qty_import = this.hold_qty_input;
						console.log(element, "elemm")
					}
					return element;
				});

				//	this.table.reset();
				//  this.loadData();
			} else {
				this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
			}
			this.myHoldModel.hide();
		});



		this.CrudServices.postRequest<any>(inventoryRedis.addUpdateHoldImport, {
			main_godown_id: this.main_godown_id_set,
			grade_id: this.grade_id_set,
			hold_qty: condition_hold_import
		}).subscribe((response) => {
		});

	}

	closeModal() {
		this.myHoldModel.hide();
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

	onFilter(event, dt) {

		console.log(event, "eventevent")
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;

		if (this.filteredValuess) {
			this.tot_import_pur_reg_import = 0;
			this.tot_import_pur_bond_import = 0;
			this.tot_stock_tranfer_import = 0;
			this.tot_physical_stock_import = 0;
			this.tot_sales_pending_import = 0;
			this.tot_available_import = 0;
			this.tot_hold_import = 0;
			this.tot_unsold_import = 0;
			this.inventory_after_hold_import = 0;
			this.tot_arrival_till_date = 0;
			this.tot_local_purchase_import_intransite = 0;
			for (const val of this.filteredValuess) {
				this.tot_import_pur_reg_import = this.tot_import_pur_reg_import + val.reg_intransite;
				this.tot_import_pur_bond_import = this.tot_import_pur_bond_import + val.bond_intransite;
				this.tot_stock_tranfer_import = this.tot_stock_tranfer_import + Number(val.stock_transfer_intransite_import);

				this.tot_physical_stock_import = this.tot_physical_stock_import + (val.inventory_import);

				this.tot_local_purchase_import_intransite = this.tot_local_purchase_import_intransite + (val.local_purchase_import_intransite);

				//val.reg_intransite +
				this.tot_unsold_import = this.tot_unsold_import + (val.reg_intransite + val.bond_intransite + Number(val.stock_transfer_intransite_import) + val.inventory_import + Number(val.local_purchase_import_intransite));
				this.tot_sales_pending_import = this.tot_sales_pending_import + val.sales_pending_import;
				//val.reg_intransite +
				this.tot_available_import = this.tot_available_import + ((val.reg_intransite + val.bond_intransite + Number(val.stock_transfer_intransite_import) + val.inventory_import + Number(val.local_purchase_import_intransite)) - (val.sales_pending_import));
				this.tot_hold_import = this.tot_hold_import + Number(val.hold_qty_import);
				//val.reg_intransite + 
				this.inventory_after_hold_import = this.inventory_after_hold_import + (((val.reg_intransite +  val.bond_intransite + Number(val.stock_transfer_intransite_import) + val.inventory_import + Number(val.local_purchase_import_intransite)) - (val.sales_pending_import)) - val.hold_qty_import);

				this.tot_arrival_till_date = this.tot_arrival_till_date + (val.arrival_grade ? val.arrival_grade : 0);

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
				foot[this._selectedColumns[j]['header']] = this.tot_import_pur_reg_import;
			} else if (this._selectedColumns[j]['field'] === 'bond_intransite') {
				foot[this._selectedColumns[j]['header']] = this.tot_import_pur_bond_import;
			}
			else if (this._selectedColumns[j]['field'] === 'stock_transfer_intransite_import') {
				foot[this._selectedColumns[j]['header']] = this.tot_stock_tranfer_import;
			}
			else if (this._selectedColumns[j]['field'] === 'inventory_import') {
				foot[this._selectedColumns[j]['header']] = this.tot_physical_stock_import;
			}
			else if (this._selectedColumns[j]['field'] === 'arrival_grade') {
				foot[this._selectedColumns[j]['header']] = this.tot_arrival_till_date;
			}

			else if (this._selectedColumns[j]['field'] === 'total_unsold_import') {
				foot[this._selectedColumns[j]['header']] = this.tot_unsold_import;
			}

			else if (this._selectedColumns[j]['field'] === 'sales_pending_import') {
				foot[this._selectedColumns[j]['header']] = this.tot_sales_pending_import;
			}

			else if (this._selectedColumns[j]['field'] === 'available_import') {
				foot[this._selectedColumns[j]['header']] = this.tot_available_import;
			}

			else if (this._selectedColumns[j]['field'] === 'hold_qty_import') {
				foot[this._selectedColumns[j]['header']] = this.tot_hold_import;
			}

			else if (this._selectedColumns[j]['field'] === 'stock_after_hold_import') {
				foot[this._selectedColumns[j]['header']] = this.inventory_after_hold_import;
			}
			else if (this._selectedColumns[j]['field'] === 'local_purchase_import_intransite') {
				foot[this._selectedColumns[j]['header']] = this.tot_local_purchase_import_intransite;
			}






		}


		this.export_list.push(foot);


	}

	exportExcel() {
		this.exportData();
		this.exportService.exportExcel(this.export_list, 'Central-Inventory-Import');
	}


}
