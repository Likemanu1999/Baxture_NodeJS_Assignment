import { Component, OnInit, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { forexReports, inventoryRedis, LiveInventory } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';

@Component({
	selector: 'app-central-redis-inventory-local',
	templateUrl: './central-redis-inventory-local.component.html',
	styleUrls: ['./central-redis-inventory-local.component.scss'],
	providers: [CrudServices, ToasterService, LoginService, ExportService]
})
export class CentralRedisInventoryLocalComponent implements OnInit {

	@ViewChild('dt', { static: false }) table: Table;
	@ViewChild('myHoldModel', { static: false }) public myHoldModel: ModalDirective;


	_selectedColumns: any[];
	testData: any[];
	todayDate = Date.now();
	tot_non_pending = 0;
	cols: any[];
	filteredValuess: any[];

	main_grade_master = [{ id: 0, name: 'All', company_id: 0 }];
	company_List = [{ id: 0, name: 'All' }, ...staticValues.companies];
	main_grade: any[];
	main_grade_ids: any[];
	company_Ids: any[];
	user: UserDetails
	isLoading: boolean = false;

	tot_port_regular = 0;
	tot_port_forward = 0;
	tot_lc_not_issue = 0;
	tot_non_pending_spipl = 0;
	tot_non_pending_import_surisha = 0;
	tot_regular_intransite_spipl = 0;
	tot_regular_intransite_import_surisha = 0;
	tot_bond_intransite_spipl = 0;
	tot_stock_transfer_import_instransite = 0;
	tot_stock_transfer_local_instransite = 0;
	tot_local_purchase_import_intransite = 0;
	tot_local_purchase_local_intransite = 0;
	tot_inventory_import = 0;
	tot_inventory_local = 0;
	tot_inventory_import_surisha = 0;
	tot_sales_pending_import = 0;
	tot_sales_pending_local = 0;
	tot_sales_pending_import_surisha = 0;
	tot_lc_not_issue_spipl = 0;
	tot_lc_not_issue_import_surisha = 0;

	unsoldData: any[];
	DetailUnsoldData: any[];

	popCols: any[];

	tot_lc_not_issue_spipl_det = 0;
	tot_lc_not_issue_import_surisha_det = 0;
	tot_non_pending_spipl_det = 0;
	tot_non_pending_import_surisha_det = 0;
	tot_regular_intransite_spipl_det = 0;
	tot_regular_intransite_import_surisha_det = 0;
	tot_bond_intransite_spipl_det = 0;
	tot_stock_transfer_import_instransite_det = 0;
	tot_stock_transfer_local_instransite_det = 0;
	tot_local_purchase_import_intransite_det = 0;
	tot_local_purchase_local_intransite_det = 0;
	tot_inventory_import_det = 0;
	tot_inventory_local_det = 0;
	tot_inventory_import_surisha_det = 0;
	tot_sales_pending_import_det = 0;
	tot_sales_pending_local_det = 0;
	tot_sales_pending_import_surisha_det = 0;

	grades = [];
	lookup_grade = {};

	godowns = [];
	lookup_godowns = {};

	mainGrades = [];
	lookup_main_grade = {};

	hold_column: any;
	main_godown_id_set: any;
	grade_id_set: any;
	hold_qty_input: any;

	newData = [];
	holdQtyArr: any[];

	tot_hold_qty_local = 0;

	allocateArr: any[];

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	export_list: any[];

	constructor(private CrudServices: CrudServices, private toasterService: ToasterService, private loginService: LoginService, private exportService: ExportService) {

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

		this.CrudServices.getRequest<any>(forexReports.getAllGradeWithCompanyId).subscribe((response) => {
			console.log(response, "main_grade");
			this.main_grade_master = [...this.main_grade_master, ...response];
			this.main_grade = this.main_grade_master;

			let main_grade_array = [];
			this.main_grade.forEach((element) => {
				main_grade_array.push(element.id);
			})

			this.main_grade_ids = main_grade_array;

			console.log('Inside constructor', this.main_grade_ids);
			this.company_Ids = [0];


			this.getImportHoldQty();
			this.getInventoryFromRdis();


		});

		this.cols = [
			{ field: "main_godown_name", header: "Main Godown", permission: true, style: '100px' },
			{ field: "main_grade_name", header: "Main Grade", permission: true, style: '100px' },
			{ field: "grade_name", header: "Grade Name", permission: true, style: '100px' },
			{ field: "stock_transfer_local_instransite", header: "Stock Transfer Intransit", permission: true, style: '100px' },
			{ field: "local_purchase_local_intransite", header: "Purchase In Transit", permission: true, style: '100px' },
			{ field: "inventory_local", header: "Godown Inventory", permission: true, style: '100px' },
			{ field: "totalQuantity", header: "Total Quantity", permission: true, style: '100px' },
			{ field: "sales_pending_local", header: "Order Pending", permission: true, style: '100px' },
			{ field: "totalUnsold", header: "Available Quantity", permission: true, style: '100px' },
			{ field: "hold_action", header: "Hold", permission: true, style: '100px' },
			{ field: "hold_qty_local", header: "Hold Import", permission: true, style: '100px' },
			{ field: "available_qty", header: "Available Qty After Hold", permission: true, style: '100px' }
		];

		this._selectedColumns = this.cols;



	}

	ngOnInit() {
	}

	getImportHoldQty() {
		this.CrudServices.postRequest<any>(inventoryRedis.getAllHoldImportLocal, {
			id: 1
		}).subscribe((response) => {
			this.holdQtyArr = response.data.filter(val => val.hold_qty_local != 0);
			this.allocateArr = response.data;
			console.log(this.holdQtyArr, "this.holdQtyArr")
		});
	}

	getInventoryFromRdis() {

		console.log(this.main_grade, this.company_Ids, "compnatId");

		this.CrudServices.postRequest<any>(inventoryRedis.getUnsoldSummaryRedis, {
			id: 1
		}).subscribe((response) => {

			this.tot_port_regular = response.data.port_not_allocate_regular;
			this.tot_port_forward = response.data.port_not_allocate_import;

			console.log(response.data.port_not_allocate_regular, response.data.port_not_allocate_import, "DEBUG_VIEW")

			console.log(JSON.parse(response.data.data_detail), "redisUnsold");
			let parseData = JSON.parse(response.data.data_detail);
			this.unsoldData = parseData

			let main_grade_single_array = [];
			this.main_grade.forEach((element) => {
				main_grade_single_array.push(element.id);
			})


			let data = parseData.filter(val => main_grade_single_array.includes(val.main_grade_id));
			console.log(data, "datadata")


			this.tot_lc_not_issue_spipl = 0;
			this.tot_lc_not_issue_import_surisha = 0;
			this.tot_non_pending_spipl = 0;
			this.tot_non_pending_import_surisha = 0;
			this.tot_regular_intransite_spipl = 0;
			this.tot_regular_intransite_import_surisha = 0;
			this.tot_bond_intransite_spipl = 0;
			this.tot_stock_transfer_import_instransite = 0;
			this.tot_stock_transfer_local_instransite = 0;
			this.tot_local_purchase_import_intransite = 0;
			this.tot_local_purchase_local_intransite = 0;
			this.tot_inventory_import = 0;
			this.tot_inventory_local = 0;
			this.tot_inventory_import_surisha = 0;
			this.tot_sales_pending_import = 0;
			this.tot_sales_pending_local = 0;
			this.tot_sales_pending_import_surisha = 0;

			let portArray = [];

			var helper = {};
			var result = data.reduce(function (r, o) {
				var key = o.main_godown_id + '-' + o.grade_id;
				//var key =  o.grade_id;
				if (!helper[key]) {
					helper[key] = Object.assign({}, o); // create a copy of o
					helper[key].local_purchase_import_intransite += (o.local_purchase_import_mou);
					helper[key].local_purchase_local_intransite += o.local_purchase_local_mou;
					helper[key].inventory_local += o.inventory_local_mou;
					helper[key].inventory_import += o.inventory_import_mou;
					helper[key].sales_pending_import += o.sales_pending_import_mou;
					helper[key].sales_pending_local += o.sales_pending_local_mou;
					r.push(helper[key]);
				} else {
					helper[key].lc_not_issue_spipl += o.lc_not_issue_spipl;
					helper[key].lc_not_issue_import_surisha += o.lc_not_issue_import_surisha;
					helper[key].bond_intransite_spipl += o.bond_intransite_spipl;
					helper[key].inventory_all += o.inventory_all;
					helper[key].inventory_import += o.inventory_import + o.inventory_import_mou;
					helper[key].inventory_import_surisha += o.inventory_import_surisha;
					helper[key].inventory_local += o.inventory_local + o.inventory_local_mou;
					helper[key].local_purchase_import_intransite += o.local_purchase_import_intransite + o.local_purchase_import_mou;
					helper[key].local_purchase_intransite_all += o.local_purchase_intransite_all;
					helper[key].local_purchase_local_intransite += o.local_purchase_local_intransite + o.local_purchase_local_mou;
					helper[key].non_pending_import_surisha += o.non_pending_import_surisha;
					helper[key].non_pending_spipl += o.non_pending_spipl;
					helper[key].order_in_stock += o.order_in_stock;
					helper[key].regular_intransite_import_surisha += o.regular_intransite_import_surisha;
					helper[key].regular_intransite_spipl += o.regular_intransite_spipl;
					helper[key].sales_pending_all += o.sales_pending_all;
					helper[key].sales_pending_import += o.sales_pending_import + o.sales_pending_import_mou;
					helper[key].sales_pending_import_surisha += o.sales_pending_import_surisha;
					helper[key].sales_pending_local += o.sales_pending_local + o.sales_pending_local_mou;
					helper[key].stock_transfer_import_instransite += o.stock_transfer_import_instransite;
					helper[key].stock_transfer_instransite_all += o.stock_transfer_instransite_all;
					helper[key].stock_transfer_local_instransite += o.stock_transfer_local_instransite;
				}
				return r;
			}, []);


			console.log(result, "result")

			let finalArr = [];
			this.tot_non_pending = 0


			let import_local_arr = [0]

			if (
				(this.company_Ids.length == 1 && this.company_Ids[0] == 0) ||
				(this.company_Ids.length == 3 && (this.company_Ids.includes(1, 2) && this.company_Ids.includes(3))) ||
				(this.company_Ids.length == 2 && this.company_Ids.includes(1, 3)) ||
				(this.company_Ids.length == 2 && this.company_Ids.includes(2, 3))
			) {
				if (import_local_arr.length == 1 && import_local_arr.includes(0)) {
					//All Import + Local
					for (let elem of result) {
						elem.pnforRegular = 0;
						elem.pnforInport = 0;
						// elem.lc_not_issue_spipl = 0;
						// elem.lc_not_issue_import_surisha = 0;
						//elem.non_pending_spipl = 0;
						//elem.non_pending_import_surisha = 0;
						//elem.regular_intransite_spipl = 0;
						//elem.regular_intransite_import_surisha = 0;
						//elem.bond_intransite_spipl = 0;
						//elem.order_in_stock = 0;
						elem.stock_transfer_instransite_all = 0;
						//elem.stock_transfer_import_instransite = 0;
						//elem.stock_transfer_local_instransite = 0;
						elem.local_purchase_intransite_all = 0;
						//elem.local_purchase_import_intransite = 0;
						//elem.local_purchase_local_intransite = 0;
						elem.inventory_all = 0;
						//elem.inventory_import = 0;
						//elem.inventory_local = 0;
						//elem.inventory_import_surisha = 0;
						elem.sales_pending_all = 0;
						//elem.sales_pending_import = 0;
						//elem.sales_pending_local = 0;
						//elem.sales_pending_import_surisha = 0;
						finalArr.push(elem);
						// this.tot_port_regular = this.tot_port_regular + elem.pnforRegular;
						// this.tot_port_forward = this.tot_port_forward + elem.pnforInport;
						this.tot_lc_not_issue_spipl = this.tot_lc_not_issue_spipl + elem.lc_not_issue_spipl;
						this.tot_lc_not_issue_import_surisha = this.tot_lc_not_issue_import_surisha + elem.lc_not_issue_import_surisha;
						this.tot_non_pending_spipl = this.tot_non_pending_spipl + elem.non_pending_spipl;
						this.tot_non_pending_import_surisha = this.tot_non_pending_import_surisha + elem.non_pending_import_surisha;
						this.tot_regular_intransite_spipl = this.tot_regular_intransite_spipl + elem.regular_intransite_spipl;
						this.tot_regular_intransite_import_surisha = this.tot_regular_intransite_import_surisha + elem.regular_intransite_import_surisha;
						this.tot_bond_intransite_spipl = this.tot_bond_intransite_spipl + elem.bond_intransite_spipl;
						this.tot_stock_transfer_import_instransite = this.tot_stock_transfer_import_instransite + elem.stock_transfer_import_instransite;
						this.tot_stock_transfer_local_instransite = this.tot_stock_transfer_local_instransite + elem.stock_transfer_local_instransite;
						this.tot_local_purchase_import_intransite = this.tot_local_purchase_import_intransite + elem.local_purchase_import_intransite;
						this.tot_local_purchase_local_intransite = this.tot_local_purchase_local_intransite + elem.local_purchase_local_intransite;
						this.tot_inventory_import = this.tot_inventory_import + elem.inventory_import;
						this.tot_inventory_local = this.tot_inventory_local + elem.inventory_local;
						this.tot_inventory_import_surisha = this.tot_inventory_import_surisha + elem.inventory_import_surisha;
						this.tot_sales_pending_import = this.tot_sales_pending_import + elem.sales_pending_import;
						this.tot_sales_pending_local = this.tot_sales_pending_local + elem.sales_pending_local;
						this.tot_sales_pending_import_surisha = this.tot_sales_pending_import_surisha + elem.sales_pending_import_surisha;
					}

				} else if (import_local_arr.length == 1 && import_local_arr.includes(1)) {
					//Import
					for (let elem of result) {
						elem.pnforRegular = 0;
						elem.pnforInport = 0;

						// elem.lc_not_issue_spipl = 0;
						// elem.lc_not_issue_import_surisha = 0;
						//elem.non_pending_spipl = 0;
						//elem.non_pending_import_surisha = 0;
						//elem.regular_intransite_spipl = 0;
						//elem.regular_intransite_import_surisha = 0;
						//elem.bond_intransite_spipl = 0;
						elem.order_in_stock = 0;
						elem.stock_transfer_instransite_all = 0;
						//elem.stock_transfer_import_instransite = 0;
						elem.stock_transfer_local_instransite = 0;
						elem.local_purchase_intransite_all = 0;
						//elem.local_purchase_import_intransite = 0;
						elem.local_purchase_local_intransite = 0;
						elem.inventory_all = 0;
						//elem.inventory_import = 0;
						elem.inventory_local = 0;
						//elem.inventory_import_surisha = 0;
						elem.sales_pending_all = 0;
						//elem.sales_pending_import = 0;
						elem.sales_pending_local = 0;
						//elem.sales_pending_import_surisha = 0;
						finalArr.push(elem);
						// this.tot_port_regular = this.tot_port_regular + elem.pnforRegular;
						// this.tot_port_forward = this.tot_port_forward + elem.pnforInport;

						this.tot_lc_not_issue_spipl = this.tot_lc_not_issue_spipl + elem.lc_not_issue_spipl;
						this.tot_lc_not_issue_import_surisha = this.tot_lc_not_issue_import_surisha + elem.lc_not_issue_import_surisha;

						this.tot_non_pending_spipl = this.tot_non_pending_spipl + elem.non_pending_spipl;
						this.tot_non_pending_import_surisha = this.tot_non_pending_import_surisha + elem.non_pending_import_surisha;
						this.tot_regular_intransite_spipl = this.tot_regular_intransite_spipl + elem.regular_intransite_spipl;
						this.tot_regular_intransite_import_surisha = this.tot_regular_intransite_import_surisha + elem.regular_intransite_import_surisha;
						this.tot_bond_intransite_spipl = this.tot_bond_intransite_spipl + elem.bond_intransite_spipl;
						this.tot_stock_transfer_import_instransite = this.tot_stock_transfer_import_instransite + elem.stock_transfer_import_instransite;
						this.tot_stock_transfer_local_instransite = this.tot_stock_transfer_local_instransite + elem.stock_transfer_local_instransite;
						this.tot_local_purchase_import_intransite = this.tot_local_purchase_import_intransite + elem.local_purchase_import_intransite;
						this.tot_local_purchase_local_intransite = this.tot_local_purchase_local_intransite + elem.local_purchase_local_intransite;
						this.tot_inventory_import = this.tot_inventory_import + elem.inventory_import;
						this.tot_inventory_local = this.tot_inventory_local + elem.inventory_local;
						this.tot_inventory_import_surisha = this.tot_inventory_import_surisha + elem.inventory_import_surisha;
						this.tot_sales_pending_import = this.tot_sales_pending_import + elem.sales_pending_import;
						this.tot_sales_pending_local = this.tot_sales_pending_local + elem.sales_pending_local;
						this.tot_sales_pending_import_surisha = this.tot_sales_pending_import_surisha + elem.sales_pending_import_surisha;
					}

				} else if (import_local_arr.length == 1 && import_local_arr.includes(2)) {
					//Local
					for (let elem of result) {
						elem.pnforRegular = 0;
						elem.pnforInport = 0;

						elem.lc_not_issue_spipl = 0;
						elem.lc_not_issue_import_surisha = 0;
						elem.non_pending_spipl = 0;
						elem.non_pending_import_surisha = 0;
						elem.regular_intransite_spipl = 0;
						elem.regular_intransite_import_surisha = 0;
						elem.bond_intransite_spipl = 0;
						//elem.order_in_stock = 0;
						elem.stock_transfer_instransite_all = 0;
						elem.stock_transfer_import_instransite = 0;
						//elem.stock_transfer_local_instransite = 0;
						elem.local_purchase_intransite_all = 0;
						elem.local_purchase_import_intransite = 0;
						//elem.local_purchase_local_intransite = 0;
						elem.inventory_all = 0;
						elem.inventory_import = 0;
						//elem.inventory_local = 0;
						elem.inventory_import_surisha = 0;
						elem.sales_pending_all = 0;
						elem.sales_pending_import = 0;
						//elem.sales_pending_local = 0;
						//elem.sales_pending_import_surisha = 0;
						finalArr.push(elem);
						// this.tot_port_regular = this.tot_port_regular + elem.pnforRegular;
						// this.tot_port_forward = this.tot_port_forward + elem.pnforInport;
						this.tot_lc_not_issue_spipl = this.tot_lc_not_issue_spipl + elem.lc_not_issue_spipl;
						this.tot_lc_not_issue_import_surisha = this.tot_lc_not_issue_import_surisha + elem.lc_not_issue_import_surisha;


						this.tot_non_pending_spipl = this.tot_non_pending_spipl + elem.non_pending_spipl;
						this.tot_non_pending_import_surisha = this.tot_non_pending_import_surisha + elem.non_pending_import_surisha;
						this.tot_regular_intransite_spipl = this.tot_regular_intransite_spipl + elem.regular_intransite_spipl;
						this.tot_regular_intransite_import_surisha = this.tot_regular_intransite_import_surisha + elem.regular_intransite_import_surisha;
						this.tot_bond_intransite_spipl = this.tot_bond_intransite_spipl + elem.bond_intransite_spipl;
						this.tot_stock_transfer_import_instransite = this.tot_stock_transfer_import_instransite + elem.stock_transfer_import_instransite;
						this.tot_stock_transfer_local_instransite = this.tot_stock_transfer_local_instransite + elem.stock_transfer_local_instransite;
						this.tot_local_purchase_import_intransite = this.tot_local_purchase_import_intransite + elem.local_purchase_import_intransite;
						this.tot_local_purchase_local_intransite = this.tot_local_purchase_local_intransite + elem.local_purchase_local_intransite;
						this.tot_inventory_import = this.tot_inventory_import + elem.inventory_import;
						this.tot_inventory_local = this.tot_inventory_local + elem.inventory_local;
						this.tot_inventory_import_surisha = this.tot_inventory_import_surisha + elem.inventory_import_surisha;
						this.tot_sales_pending_import = this.tot_sales_pending_import + elem.sales_pending_import;
						this.tot_sales_pending_local = this.tot_sales_pending_local + elem.sales_pending_local;
						this.tot_sales_pending_import_surisha = this.tot_sales_pending_import_surisha + elem.sales_pending_import_surisha;
					}

				}


			}
			else if (this.company_Ids.length == 1 && this.company_Ids[0] == 3) {
				//Surisha Import
				for (let elem of result) {
					elem.pnforRegular = 0;
					elem.pnforInport = 0;
					elem.lc_not_issue_spipl = 0;
					//elem.lc_not_issue_import_surisha = 0;
					elem.non_pending_spipl = 0;
					//elem.non_pending_import_surisha = 0;
					elem.regular_intransite_spipl = 0;
					//elem.regular_intransite_import_surisha = 0;
					elem.bond_intransite_spipl = 0;
					elem.order_in_stock = 0;
					elem.stock_transfer_instransite_all = 0;
					elem.stock_transfer_import_instransite = 0;
					elem.stock_transfer_local_instransite = 0;
					elem.local_purchase_intransite_all = 0;
					elem.local_purchase_import_intransite = 0;
					elem.local_purchase_local_intransite = 0;
					elem.inventory_all = 0;
					elem.inventory_import = 0;
					elem.inventory_local = 0;
					//elem.inventory_import_surisha = 0;
					elem.sales_pending_all = 0;
					elem.sales_pending_import = 0;
					elem.sales_pending_local = 0;
					//elem.sales_pending_import_surisha = 0;
					finalArr.push(elem)
					// this.tot_port_regular = this.tot_port_regular + elem.pnforRegular;
					// this.tot_port_forward = this.tot_port_forward + elem.pnforInport;

					this.tot_lc_not_issue_spipl = this.tot_lc_not_issue_spipl + elem.lc_not_issue_spipl;
					this.tot_lc_not_issue_import_surisha = this.tot_lc_not_issue_import_surisha + elem.lc_not_issue_import_surisha;


					this.tot_non_pending_spipl = this.tot_non_pending_spipl + elem.non_pending_spipl;
					this.tot_non_pending_import_surisha = this.tot_non_pending_import_surisha + elem.non_pending_import_surisha;
					this.tot_regular_intransite_spipl = this.tot_regular_intransite_spipl + elem.regular_intransite_spipl;
					this.tot_regular_intransite_import_surisha = this.tot_regular_intransite_import_surisha + elem.regular_intransite_import_surisha;
					this.tot_bond_intransite_spipl = this.tot_bond_intransite_spipl + elem.bond_intransite_spipl;
					this.tot_stock_transfer_import_instransite = this.tot_stock_transfer_import_instransite + elem.stock_transfer_import_instransite;
					this.tot_stock_transfer_local_instransite = this.tot_stock_transfer_local_instransite + elem.stock_transfer_local_instransite;
					this.tot_local_purchase_import_intransite = this.tot_local_purchase_import_intransite + elem.local_purchase_import_intransite;
					this.tot_local_purchase_local_intransite = this.tot_local_purchase_local_intransite + elem.local_purchase_local_intransite;
					this.tot_inventory_import = this.tot_inventory_import + elem.inventory_import;
					this.tot_inventory_local = this.tot_inventory_local + elem.inventory_local;
					this.tot_inventory_import_surisha = this.tot_inventory_import_surisha + elem.inventory_import_surisha;
					this.tot_sales_pending_import = this.tot_sales_pending_import + elem.sales_pending_import;
					this.tot_sales_pending_local = this.tot_sales_pending_local + elem.sales_pending_local;
					this.tot_sales_pending_import_surisha = this.tot_sales_pending_import_surisha + elem.sales_pending_import_surisha;
				}
			} else {
				//SPIPL

				if (import_local_arr.length == 1 && import_local_arr.includes(0)) {
					//All import +local
					for (let elem of result) {
						elem.pnforRegular = 0;
						elem.pnforInport = 0;
						//elem.lc_not_issue_spipl = 0;
						elem.lc_not_issue_import_surisha = 0;
						//elem.non_pending_spipl = 0;
						elem.non_pending_import_surisha = 0;
						//elem.regular_intransite_spipl = 0;
						elem.regular_intransite_import_surisha = 0;
						//elem.bond_intransite_spipl = 0;
						//elem.order_in_stock = 0;
						//elem.stock_transfer_instransite_all = 0;
						//elem.stock_transfer_import_instransite = 0;
						//elem.stock_transfer_local_instransite = 0;
						//elem.local_purchase_intransite_all = 0;
						//elem.local_purchase_import_intransite = 0;
						//elem.local_purchase_local_intransite = 0;
						//elem.inventory_all = 0;
						//elem.inventory_import = 0;
						//elem.inventory_local = 0;
						//elem.inventory_import_surisha = 0;
						//elem.sales_pending_all = 0;
						//elem.sales_pending_import = 0;
						//elem.sales_pending_local = 0;
						elem.sales_pending_import_surisha = 0;
						finalArr.push(elem);

						// this.tot_port_regular = this.tot_port_regular + elem.pnforRegular;
						// this.tot_port_forward = this.tot_port_forward + elem.pnforInport;

						this.tot_lc_not_issue_spipl = this.tot_lc_not_issue_spipl + elem.lc_not_issue_spipl;
						this.tot_lc_not_issue_import_surisha = this.tot_lc_not_issue_import_surisha + elem.lc_not_issue_import_surisha;

						this.tot_non_pending_spipl = this.tot_non_pending_spipl + elem.non_pending_spipl;
						this.tot_non_pending_import_surisha = this.tot_non_pending_import_surisha + elem.non_pending_import_surisha;
						this.tot_regular_intransite_spipl = this.tot_regular_intransite_spipl + elem.regular_intransite_spipl;
						this.tot_regular_intransite_import_surisha = this.tot_regular_intransite_import_surisha + elem.regular_intransite_import_surisha;
						this.tot_bond_intransite_spipl = this.tot_bond_intransite_spipl + elem.bond_intransite_spipl;
						this.tot_stock_transfer_import_instransite = this.tot_stock_transfer_import_instransite + elem.stock_transfer_import_instransite;
						this.tot_stock_transfer_local_instransite = this.tot_stock_transfer_local_instransite + elem.stock_transfer_local_instransite;
						this.tot_local_purchase_import_intransite = this.tot_local_purchase_import_intransite + elem.local_purchase_import_intransite;
						this.tot_local_purchase_local_intransite = this.tot_local_purchase_local_intransite + elem.local_purchase_local_intransite;
						this.tot_inventory_import = this.tot_inventory_import + elem.inventory_import;
						this.tot_inventory_local = this.tot_inventory_local + elem.inventory_local;
						this.tot_inventory_import_surisha = this.tot_inventory_import_surisha + elem.inventory_import_surisha;
						this.tot_sales_pending_import = this.tot_sales_pending_import + elem.sales_pending_import;
						this.tot_sales_pending_local = this.tot_sales_pending_local + elem.sales_pending_local;
						this.tot_sales_pending_import_surisha = this.tot_sales_pending_import_surisha + elem.sales_pending_import_surisha;
					}
				} else if (import_local_arr.length == 1 && import_local_arr.includes(1)) {
					//Import
					for (let elem of result) {
						elem.pnforRegular = 0;
						elem.pnforInport = 0;
						//elem.lc_not_issue_spipl = 0;
						elem.lc_not_issue_import_surisha = 0;
						//elem.non_pending_spipl = 0;
						elem.non_pending_import_surisha = 0;
						//elem.regular_intransite_spipl = 0;
						elem.regular_intransite_import_surisha = 0;
						//elem.bond_intransite_spipl = 0;
						elem.order_in_stock = 0;
						elem.stock_transfer_instransite_all = 0;
						//elem.stock_transfer_import_instransite = 0;
						elem.stock_transfer_local_instransite = 0;
						elem.local_purchase_intransite_all = 0;
						//elem.local_purchase_import_intransite = 0;
						elem.local_purchase_local_intransite = 0;
						elem.inventory_all = 0;
						//elem.inventory_import = 0;
						elem.inventory_local = 0;
						elem.inventory_import_surisha = 0;
						elem.sales_pending_all = 0;
						//elem.sales_pending_import = 0;
						elem.sales_pending_local = 0;
						elem.sales_pending_import_surisha = 0;
						finalArr.push(elem);

						// this.tot_port_regular = this.tot_port_regular + elem.pnforRegular;
						// this.tot_port_forward = this.tot_port_forward + elem.pnforInport;

						this.tot_lc_not_issue_spipl = this.tot_lc_not_issue_spipl + elem.lc_not_issue_spipl;
						this.tot_lc_not_issue_import_surisha = this.tot_lc_not_issue_import_surisha + elem.lc_not_issue_import_surisha;


						this.tot_non_pending_spipl = this.tot_non_pending_spipl + elem.non_pending_spipl;
						this.tot_non_pending_import_surisha = this.tot_non_pending_import_surisha + elem.non_pending_import_surisha;
						this.tot_regular_intransite_spipl = this.tot_regular_intransite_spipl + elem.regular_intransite_spipl;
						this.tot_regular_intransite_import_surisha = this.tot_regular_intransite_import_surisha + elem.regular_intransite_import_surisha;
						this.tot_bond_intransite_spipl = this.tot_bond_intransite_spipl + elem.bond_intransite_spipl;
						this.tot_stock_transfer_import_instransite = this.tot_stock_transfer_import_instransite + elem.stock_transfer_import_instransite;
						this.tot_stock_transfer_local_instransite = this.tot_stock_transfer_local_instransite + elem.stock_transfer_local_instransite;
						this.tot_local_purchase_import_intransite = this.tot_local_purchase_import_intransite + elem.local_purchase_import_intransite;
						this.tot_local_purchase_local_intransite = this.tot_local_purchase_local_intransite + elem.local_purchase_local_intransite;
						this.tot_inventory_import = this.tot_inventory_import + elem.inventory_import;
						this.tot_inventory_local = this.tot_inventory_local + elem.inventory_local;
						this.tot_inventory_import_surisha = this.tot_inventory_import_surisha + elem.inventory_import_surisha;
						this.tot_sales_pending_import = this.tot_sales_pending_import + elem.sales_pending_import;
						this.tot_sales_pending_local = this.tot_sales_pending_local + elem.sales_pending_local;
						this.tot_sales_pending_import_surisha = this.tot_sales_pending_import_surisha + elem.sales_pending_import_surisha;
					}

				}
				else if (import_local_arr.length == 1 && import_local_arr.includes(2)) {

					//Local
					for (let elem of result) {
						elem.pnforRegular = 0;
						elem.pnforInport = 0;
						elem.lc_not_issue_spipl = 0;
						elem.lc_not_issue_import_surisha = 0;
						elem.non_pending_spipl = 0;
						elem.non_pending_import_surisha = 0;
						elem.regular_intransite_spipl = 0;
						elem.regular_intransite_import_surisha = 0;
						elem.bond_intransite_spipl = 0;
						//elem.order_in_stock = 0;
						elem.stock_transfer_instransite_all = 0;
						elem.stock_transfer_import_instransite = 0;
						//elem.stock_transfer_local_instransite = 0;
						elem.local_purchase_intransite_all = 0;
						elem.local_purchase_import_intransite = 0;
						//elem.local_purchase_local_intransite = 0;
						elem.inventory_all = 0;
						elem.inventory_import = 0;
						//elem.inventory_local = 0;
						elem.inventory_import_surisha = 0;
						elem.sales_pending_all = 0;
						elem.sales_pending_import = 0;
						//elem.sales_pending_local = 0;
						//elem.sales_pending_import_surisha = 0;
						finalArr.push(elem);

						// this.tot_port_regular = this.tot_port_regular + elem.pnforRegular;
						// this.tot_port_forward = this.tot_port_forward + elem.pnforInport;

						this.tot_lc_not_issue_spipl = this.tot_lc_not_issue_spipl + elem.lc_not_issue_spipl;
						this.tot_lc_not_issue_import_surisha = this.tot_lc_not_issue_import_surisha + elem.lc_not_issue_import_surisha;
						this.tot_non_pending_spipl = this.tot_non_pending_spipl + elem.non_pending_spipl;
						this.tot_non_pending_import_surisha = this.tot_non_pending_import_surisha + elem.non_pending_import_surisha;
						this.tot_regular_intransite_spipl = this.tot_regular_intransite_spipl + elem.regular_intransite_spipl;
						this.tot_regular_intransite_import_surisha = this.tot_regular_intransite_import_surisha + elem.regular_intransite_import_surisha;
						this.tot_bond_intransite_spipl = this.tot_bond_intransite_spipl + elem.bond_intransite_spipl;
						this.tot_stock_transfer_import_instransite = this.tot_stock_transfer_import_instransite + elem.stock_transfer_import_instransite;
						this.tot_stock_transfer_local_instransite = this.tot_stock_transfer_local_instransite + elem.stock_transfer_local_instransite;
						this.tot_local_purchase_import_intransite = this.tot_local_purchase_import_intransite + elem.local_purchase_import_intransite;
						this.tot_local_purchase_local_intransite = this.tot_local_purchase_local_intransite + elem.local_purchase_local_intransite;
						this.tot_inventory_import = this.tot_inventory_import + elem.inventory_import;
						this.tot_inventory_local = this.tot_inventory_local + elem.inventory_local;
						this.tot_inventory_import_surisha = this.tot_inventory_import_surisha + elem.inventory_import_surisha;
						this.tot_sales_pending_import = this.tot_sales_pending_import + elem.sales_pending_import;
						this.tot_sales_pending_local = this.tot_sales_pending_local + elem.sales_pending_local;
						this.tot_sales_pending_import_surisha = this.tot_sales_pending_import_surisha + elem.sales_pending_import_surisha;
					}
				}

			}




			// this.tot_non_pending = 0
			// for (let elem of result) {
			// 	elem.pnforRegular = 0;
			// 	elem.pnforInport = 0;
			// 	elem.lc_not_issue = 0;
			// 	finalArr.push(elem)

			// 	this.tot_non_pending = this.tot_non_pending + elem.non_pending_spipl;
			// }


			this.tot_hold_qty_local = 0;

			for (let item of finalArr) {

				let main_godown_name = item.main_godown_name;
				if (!(main_godown_name in this.lookup_godowns)) {
					this.lookup_godowns[main_godown_name] = 1;
					this.godowns.push({ 'main_godown_name': main_godown_name });
				}

				let main_grade_name = item.main_grade_name;
				if (!(main_grade_name in this.lookup_main_grade)) {
					this.lookup_main_grade[main_grade_name] = 1;
					this.mainGrades.push({ 'main_grade_name': main_grade_name });
				}

				let grade_name = item.grade_name;
				if (!(grade_name in this.lookup_grade)) {
					this.lookup_grade[grade_name] = 1;
					this.grades.push({ 'grade_name': grade_name });
				}

				let holdImportResult = this.holdQtyArr.filter(val => val.main_godown_id == item.main_godown_id && val.grade_id == item.grade_id)

				if (holdImportResult.length > 0) {
					item.hold_qty_local = holdImportResult[0].hold_qty_local
				} else {
					item.hold_qty_local = 0
				}


				let allocateLocalResult = this.allocateArr.filter(val => val.main_godown_id == item.main_godown_id && val.grade_id == item.grade_id)
				if (allocateLocalResult.length > 0) {
					item.is_allocate_local = allocateLocalResult[0].is_allocate_local;
				} else {
					item.is_allocate_local = 0;
				}

				this.tot_hold_qty_local = this.tot_hold_qty_local + item.hold_qty_local;


				item.totalQuantity = (
					item.stock_transfer_local_instransite +
					item.local_purchase_local_intransite +
					item.inventory_local
				)
				item.totalUnsold = (
					(
						item.stock_transfer_local_instransite +
						item.local_purchase_local_intransite +
						item.inventory_local
					) -
					(
						item.sales_pending_local
					)
				)
				item.available_qty = (((
					item.stock_transfer_local_instransite +
					item.local_purchase_local_intransite +
					item.inventory_local
				) -
					(
						item.sales_pending_local
					)) - (item.hold_qty_local))

			}

			this.testData = finalArr;
			this.newData = finalArr;
		});

	}

	getColumnPresent(name) {
		if (this._selectedColumns.find(ob => ob['field'] === name)) {
			return true;
		} else {
			return false;
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

	onFilter(event, dt) {

		console.log(event, "eventevent")
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;

		if (this.filteredValuess) {
			this.tot_regular_intransite_spipl = 0;
			this.tot_regular_intransite_import_surisha = 0;
			this.tot_bond_intransite_spipl = 0;
			this.tot_stock_transfer_import_instransite = 0;
			this.tot_stock_transfer_local_instransite = 0;
			this.tot_local_purchase_import_intransite = 0;
			this.tot_local_purchase_local_intransite = 0;
			this.tot_inventory_import = 0;
			this.tot_inventory_local = 0;
			this.tot_inventory_import_surisha = 0;
			this.tot_sales_pending_import = 0;
			this.tot_sales_pending_local = 0;
			this.tot_sales_pending_import_surisha = 0;
			this.tot_hold_qty_local = 0;
			for (const elem of this.filteredValuess) {
				this.tot_regular_intransite_spipl = this.tot_regular_intransite_spipl + elem.regular_intransite_spipl;
				this.tot_regular_intransite_import_surisha = this.tot_regular_intransite_import_surisha + elem.regular_intransite_import_surisha;
				this.tot_bond_intransite_spipl = this.tot_bond_intransite_spipl + elem.bond_intransite_spipl;
				this.tot_stock_transfer_import_instransite = this.tot_stock_transfer_import_instransite + elem.stock_transfer_import_instransite;
				this.tot_stock_transfer_local_instransite = this.tot_stock_transfer_local_instransite + elem.stock_transfer_local_instransite;
				this.tot_local_purchase_import_intransite = this.tot_local_purchase_import_intransite + elem.local_purchase_import_intransite;
				this.tot_local_purchase_local_intransite = this.tot_local_purchase_local_intransite + elem.local_purchase_local_intransite;
				this.tot_inventory_import = this.tot_inventory_import + elem.inventory_import;
				this.tot_inventory_local = this.tot_inventory_local + elem.inventory_local;
				this.tot_inventory_import_surisha = this.tot_inventory_import_surisha + elem.inventory_import_surisha;
				this.tot_sales_pending_import = this.tot_sales_pending_import + elem.sales_pending_import;
				this.tot_sales_pending_local = this.tot_sales_pending_local + elem.sales_pending_local;
				this.tot_sales_pending_import_surisha = this.tot_sales_pending_import_surisha + elem.sales_pending_import_surisha;
				this.tot_hold_qty_local = this.tot_hold_qty_local + elem.hold_qty_local;

			}

		}


	}


	holdQtyUpdate(main_godown_id, grade_id, hold_qty) {
		this.hold_column = hold_qty;
		this.main_godown_id_set = main_godown_id;
		this.grade_id_set = grade_id;
		this.CrudServices.postRequest<any>(inventoryRedis.getholdImportLocal, {
			main_godown_id: main_godown_id,
			grade_id: grade_id
		}).subscribe((response) => {
			console.log(response, "Grade Wise Unsold");
			this.hold_qty_input = response.data[0] ? response.data[0].hold_qty_local : 0;
			this.myHoldModel.show();
		});
	}


	submitHold() {

		let condition_hold_import = {
			hold_qty_local: Number(this.hold_qty_input)
		}
		this.CrudServices.postRequest<any>(inventoryRedis.addUpdateHoldLocal, {
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
						element.hold_qty_local = this.hold_qty_input;
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


		//In Redis HoldUpdate - Update LiveStock holdQty
		let condition_hold_local = {
			hold_qty_local: Number(this.hold_qty_input)
		}
		this.CrudServices.postRequest<any>(forexReports.updateHoldQtyLocalImport, {
			main_godown_id: this.main_godown_id_set,
			grade_id: this.grade_id_set,
			hold_qty: condition_hold_local
		}).subscribe((response) => {
		});

	}


	closeModal() {
		this.myHoldModel.hide();
	}

	OnCheckGodownAllocationImport(checked, item) {
		console.log(checked, item);
		let is_allocate_local = 0;
		if (checked) {
			is_allocate_local = 1;
		}

		let allocate_condition = { is_allocate_local: is_allocate_local }
		this.CrudServices.postRequest<any>(inventoryRedis.updateAllocationCheckImportLocal, {
			grade_id: item.grade_id,
			main_godown_id: item.main_godown_id,
			allocate_condition: allocate_condition,
			field_name: "is_allocate_local"
		}).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				//this.loadData();
			} else {
				this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
			}
		});

		//In Redis Allocate - Update LiveStock Allocate
		this.CrudServices.postRequest<any>(LiveInventory.updateAllocationCheckImportLocal, {
			grade_id: item.grade_id,
			main_godown_id: item.main_godown_id,
			allocate_condition: allocate_condition
		}).subscribe((response) => {
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

			if (this._selectedColumns[j]['field'] === 'stock_transfer_local_instransite') {
				foot[this._selectedColumns[j]['header']] = this.tot_stock_transfer_local_instransite;
			} else if (this._selectedColumns[j]['field'] === 'local_purchase_local_intransite') {
				foot[this._selectedColumns[j]['header']] = this.tot_local_purchase_local_intransite;
			}
			else if (this._selectedColumns[j]['field'] === 'inventory_local') {
				foot[this._selectedColumns[j]['header']] = this.tot_inventory_local;
			}

			else if (this._selectedColumns[j]['field'] === 'totalQuantity') {
				foot[this._selectedColumns[j]['header']] = (this.tot_stock_transfer_local_instransite + this.tot_local_purchase_local_intransite + this.tot_inventory_local
				)
			}

			else if (this._selectedColumns[j]['field'] === 'sales_pending_local') {
				foot[this._selectedColumns[j]['header']] = this.tot_sales_pending_local;
			}

			else if (this._selectedColumns[j]['field'] === 'totalUnsold') {
				foot[this._selectedColumns[j]['header']] =
					(
						(
							this.tot_stock_transfer_local_instransite + this.tot_local_purchase_local_intransite +
							this.tot_inventory_local
						) - (this.tot_sales_pending_local)
					)
			}



			else if (this._selectedColumns[j]['field'] === 'hold_qty_local') {
				foot[this._selectedColumns[j]['header']] = this.tot_hold_qty_local;
			}

			else if (this._selectedColumns[j]['field'] === 'available_qty') {
				foot[this._selectedColumns[j]['header']] = (
					((
						this.tot_stock_transfer_local_instransite + this.tot_local_purchase_local_intransite +
						this.tot_inventory_local
					) -
						(this.tot_sales_pending_local)
					) - (this.tot_hold_qty_local)
				)
			}

		}

		this.export_list.push(foot);


	}

	exportExcel() {
		this.exportData();
		this.exportService.exportExcel(this.export_list, 'Central-Inventory-Local');
	}
}
