import { Component, OnInit, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Table } from 'primeng/table';
import { GradeMaster, LiveInventory, MainGrade } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';

@Component({
	selector: 'app-redis-bd-inventory-new',
	templateUrl: './redis-bd-inventory-new.component.html',
	styleUrls: ['./redis-bd-inventory-new.component.scss'],
	providers: [CrudServices, ToasterService, PermissionService, LoginService, ExportService]
})
export class RedisBdInventoryNewComponent implements OnInit {
	@ViewChild('dt', { static: false }) table: Table;

	cols: any = [];
	_selectedColumns: any[];
	data: any = [];
	isLoading: Boolean = false;

	tot_order_in_stock = 0;

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
	gradeDetails: any[];
	tot_local_intransite = 0;
	tot_inventory = 0;
	tot_total_unsold = 0;
	tot_sales_pending: any;
	tot_available: any;
	lookup_type = {};
	types = [];

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
			{ field: "supplier_type", header: "Supplier Type", permission: true, style: '100px' },
			{ field: "local_intransite", header: "Order in Stock", permission: true, style: '100px' },
			{ field: "order_in_stock", header: "Intransite", permission: true, style: '100px' },
			{ field: "inventory", header: "Godown Stock", permission: true, style: '100px' },
			{ field: "total_unsold", header: "Total Stock", permission: true, style: '100px' },
			{ field: "sales_pending", header: "Blocking", permission: true, style: '100px' },
			{ field: "available", header: "Available Stock", permission: true, style: '100px' },


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


		this.CrudServices.getRequest<any>(GradeMaster.getAll).subscribe((response) => {
			console.log(response, "gradeDetails");
			this.gradeDetails = response;

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

		});



		//this.loadData();


	}

	ngOnInit() {
		this.CrudServices.getRequest<any>(MainGrade.getAll).subscribe((response) => {
			console.log(response, "main_grade");
			this.main_grade = response;

		});

	}


	loadData() {

		this.isLoading = true;
		this.data = [];
		this.CrudServices.postRequest<any>(LiveInventory.getPvcPolyInventoryRedisNew, { main_grade_ids: this.main_grade_ids }).subscribe((response) => {
			console.log(response);
			this.isLoading = false;
			if (response.length > 0) {
				console.log(response, "response.data");
				this.data = response;


				for (let item, i = 0; item = this.data[i++];) {


					let godown_name = item.godown_name;
					let main_godown_id = item.main_godown_id;



					if (!(godown_name in this.lookup_godowns)) {
						this.lookup_godowns[godown_name] = 1;
						this.godowns.push({ 'godown_name': godown_name });
					}


					if (item.grade_details.length) {




						for (let sub_item, j = 0; sub_item = item.grade_details[j++];) {

							let main_org_name = '';

							let GradeDetailsRes = this.gradeDetails.filter(val => val.grade_id == sub_item.grade_id);

							if (GradeDetailsRes.length > 0) {

								if (GradeDetailsRes[0]['main_org_master'] != null) {

									main_org_name = GradeDetailsRes[0]['main_org_master'] ? GradeDetailsRes[0]['main_org_master']['org_name'] : '';
								}

							}


							let grade_name = sub_item.grade_name;
							let grade_id = sub_item.grade_id;
							let main_grade_name = sub_item.main_grade_name;
							let product_name = sub_item.product_name;
							let supplier_type = sub_item.supplier_type;

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

							if (!(supplier_type in this.lookup_type)) {
								this.lookup_type[supplier_type] = 1;
								this.types.push({ 'supplier_type': supplier_type });
							}


							sub_item.grade_name = grade_name;
							sub_item.main_grade_name = main_grade_name;
							sub_item.product_name = product_name;
							sub_item.main_org_name = main_org_name;
							sub_item.godown_name = godown_name;
							sub_item.main_godown_id = main_godown_id;
							sub_item.grade_id = grade_id;
							sub_item.order_in_stock = sub_item.order_in_stock + sub_item.order_in_stock_mou;
							sub_item.local_intransite = sub_item.local_purchase_local_intransite + sub_item.local_purchase_import_intransite + sub_item.local_purchase_import_mou + sub_item.local_purchase_import_mou + sub_item.local_purchase_local_mou;
							sub_item.inventory = sub_item.inventory_import + sub_item.inventory_local + sub_item.inventory_local_mou + sub_item.inventory_import_mou
							sub_item.total_unsold = sub_item.inventory + sub_item.order_in_stock
							sub_item.sales_pending = sub_item.sales_pending_import + sub_item.sales_pending_local + sub_item.sales_pending_local_mou + sub_item.sales_pending_import_mou
							sub_item.available = sub_item.total_unsold - sub_item.sales_pending




							this.newData.push(sub_item);
						}




					}


				}
				this.calculateTotal(this.newData)


				console.log(this.newData, "this.newData")



			}
		});
	}

	calculateTotal(data) {

		if (data) {
			this.tot_order_in_stock = data.reduce((sum, item) => sum + item.order_in_stock, 0)
			this.tot_local_intransite = data.reduce((sum, item) => sum + item.local_intransite, 0)
			this.tot_inventory = data.reduce((sum, item) => sum + item.inventory, 0)
			this.tot_total_unsold = data.reduce((sum, item) => sum + item.total_unsold, 0)
			this.tot_sales_pending = data.reduce((sum, item) => sum + item.sales_pending, 0)
			this.tot_available = data.reduce((sum, item) => sum + item.available, 0)
		}
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

		this.calculateTotal(this.filteredValuess)


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

			if (this._selectedColumns[j]['field'] === 'order_in_stock') {
				foot[this._selectedColumns[j]['header']] = this.tot_order_in_stock;
			} else if (this._selectedColumns[j]['field'] === 'local_intransite') {
				foot[this._selectedColumns[j]['header']] = this.tot_local_intransite;
			} else if (this._selectedColumns[j]['field'] === 'inventory') {
				foot[this._selectedColumns[j]['header']] = this.tot_inventory;
			} else if (this._selectedColumns[j]['field'] === 'total_unsold') {
				foot[this._selectedColumns[j]['header']] = this.tot_total_unsold;
			}
			else if (this._selectedColumns[j]['field'] === 'sales_pending') {
				foot[this._selectedColumns[j]['header']] = this.tot_sales_pending;
			} else if (this._selectedColumns[j]['field'] === 'available') {
				foot[this._selectedColumns[j]['header']] = this.tot_available;
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
