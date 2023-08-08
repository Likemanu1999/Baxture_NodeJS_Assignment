import { Component, OnInit, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { forexReports, inventoryRedis } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';

@Component({
	selector: 'app-unsold-summary',
	templateUrl: './unsold-summary.component.html',
	styleUrls: ['./unsold-summary.component.scss'],
	providers: [CrudServices, ToasterService, LoginService]
})
export class UnsoldSummaryComponent implements OnInit {

	@ViewChild("unsoldSummaryList", { static: false }) public unsoldSummaryList: ModalDirective;
	@ViewChild('myModelImportSurisha', { static: false }) public myModelImportSurisha: ModalDirective;
	@ViewChild('myModelSPIPL', { static: false }) public myModelSPIPL: ModalDirective;



	testData: any[];
	todayDate = Date.now();
	tot_non_pending = 0;
	cols: any[];

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

	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	BookingPendingImportSurisha: any = [];
	BookingPendingSPIPL: any = [];

	public filterQuery = '';
	filterArray = [];
	tot_surisha_stock_intransite: number;
	tot_surisha_stock_intransite_det: number;

	constructor(private CrudServices: CrudServices, private toasterService: ToasterService, private loginService: LoginService) {

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

			this.getInventoryFromRdis();


		});

		this.cols = [
			{ field: "port", header: "Godown", permission: true, style: '100px' },
			{ field: "pnforRegular", header: "Port Not Alloted For Regular", permission: true, style: '90px' },
			{ field: "pnforInport", header: "Port Not Alloted For Import", permission: true, style: '90px' },
			{ field: "lc_not_issue", header: "LC not Issue", permission: true, style: '90px' },
			{ field: "non_pending", header: "Non Docs Pending", permission: true, style: '90px' },
			{ field: "reg_arrival", header: "Material Under Clearance", permission: true, style: '90px' },
			{ field: "bond_arrival", header: "Material In Bond", permission: true, style: '90px' },
			{ field: "stock_transfer_intransite", header: "Stock Transfer Intransit", permission: true, style: '90px' },
			{ field: "local_purchase", header: "Purchase In Transit", permission: true, style: '89px' },
			{ field: "godwon_stock", header: "Godown Inventory", permission: true, style: '90px' },
			{ field: "totalQuantity", header: "Total Quantity", permission: true, style: '90px' },
			{ field: "sales_pending", header: "Order Pending", permission: true, style: '90px' },
			{ field: "forward_sales_pending", header: "Import Order Pending", permission: true, style: '90px' },
			{ field: "totalUnsold", header: "Total Unsold", permission: true, style: '90px' }
		];



		this.popCols = [
			{ field: "port1", header: "Grade", permission: true, style: '90px' },
			{ field: "pnforRegular1", header: "Main Grade", permission: true, style: '90px' },
			{ field: "pnforInport1", header: "LC Not Issue", permission: true, style: '90px' },
			{ field: "lc_not_issue1", header: "Non Docs Pending", permission: true, style: '90px' },
			{ field: "non_pending1", header: "Material Under Clearance", permission: true, style: '90px' },
			{ field: "reg_arrival1", header: "Material In Bond", permission: true, style: '90px' },
			{ field: "stock_transfer_intransite1", header: "Stock Transfer Intransit", permission: true, style: '90px' },
			{ field: "local_purchase1", header: "Local Purchase In Transit", permission: true, style: '89px' },
			{ field: "godwon_stoc1k", header: "Godown Inventory", permission: true, style: '90px' },
			{ field: "totalQuantity1", header: "Total Quantity", permission: true, style: '90px' },
			{ field: "sales_pending1", header: "Order Pending", permission: true, style: '90px' },
			{ field: "forward_sales_pending1", header: "Import Order Pending", permission: true, style: '90px' },
			{ field: "sales_pending1", header: "Total Unsold", permission: true, style: '90px' }
		]

	}

	ngOnInit() {



	}


	getImportSurishaDealPending() {
		this.CrudServices.postRequest<any>(forexReports.sales_contract_booking_pending_import_surisha, {
			id: 1
		}).subscribe((response) => {
			console.log(response, "IMPORTSURISHARESPONSE");
			var helper = {};
			let resultImportSurisha = response.data.reduce(function (r, o) {
				var key = o.sub_org_id;
				if (!helper[key]) {
					helper[key] = Object.assign({}, o); // create a copy of o
					r.push(helper[key]);
				} else {
					helper[key].booking_pending += o.booking_pending;
				}
				return r;
			}, []);

			console.log(resultImportSurisha.filter(val => val.booking_pending != 0), "resultImportSurisha")
			this.BookingPendingImportSurisha = resultImportSurisha.filter(val => val.booking_pending != 0);

			this.myModelImportSurisha.show();
		});
	}

	getSPIPLDealPending() {
		this.CrudServices.postRequest<any>(forexReports.sales_contract_booking_pending_spipl, {
			id: 1
		}).subscribe((response) => {
			console.log(response, "SPIPLRESPONSE");
			var helper = {};
			let resultSPIPL = response.data.reduce(function (r, o) {
				var key = o.sub_org_id;
				if (!helper[key]) {
					helper[key] = Object.assign({}, o); // create a copy of o
					r.push(helper[key]);
				} else {
					helper[key].booking_pending += o.booking_pending;
				}
				return r;
			}, []);

			console.log(resultSPIPL.filter(val => val.booking_pending != 0), "resultImportSurisha")
			this.BookingPendingSPIPL = resultSPIPL.filter(val => val.booking_pending != 0);

			this.myModelSPIPL.show();
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

			if (this.main_grade_ids) {
				{
					if (this.main_grade_ids.includes(0) || this.main_grade_ids.length == 0) {
						this.main_grade_ids = [];
						// this.company_Ids = [0];
						// console.log('above for each', this.main_grade_ids);
						this.main_grade.forEach((element) => {
							if (element.id !== 0) {
								this.main_grade_ids.push(element.id);
							}
						})
					}
				}
			}
			console.log(this.main_grade_ids, "this.main_grade_ids")

			let main_grade_single_array = [];
			this.main_grade.forEach((element) => {
				main_grade_single_array.push(element.id);
			})


			let data = parseData.filter(val => this.main_grade_ids.includes(val.main_grade_id));
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
			this.tot_surisha_stock_intransite = 0;
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
			var result = [];
			result = data.reduce(function (r, o) {
				var key = o.main_godown_id;
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
					helper[key].local_purchase_import_intransite += (o.local_purchase_import_intransite + o.local_purchase_import_mou);
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
					helper[key].surisha_stock_intransite += o.surisha_stock_intransite;
				}
				return r;
			}, []);


			console.log(result, "result")
			let finalArr = [];


			//  finalArr = [{
			// 	pnforRegular: response.data.port_not_allocate_regular,
			// 	pnforInport: response.data.port_not_allocate_import,
			// 	lc_not_issue_spipl: 0,
			// 	lc_not_issue_import_surisha: 0,
			// 	non_pending_spipl: 0,
			// 	non_pending_import_surisha: 0,
			// 	regular_intransite_spipl: 0,
			// 	regular_intransite_import_surisha: 0,
			// 	bond_intransite_spipl: 0,
			// 	order_in_stock: 0,
			// 	stock_transfer_instransite_all: 0,
			// 	stock_transfer_import_instransite: 0,
			// 	stock_transfer_local_instransite: 0,
			// 	local_purchase_intransite_all: 0,
			// 	local_purchase_import_intransite: 0,
			// 	local_purchase_local_intransite: 0,
			// 	inventory_all: 0,
			// 	inventory_import: 0,
			// 	inventory_local: 0,
			// 	inventory_import_surisha: 0,
			// 	sales_pending_all: 0,
			// 	sales_pending_import: 0,
			// 	sales_pending_local: 0,
			// 	sales_pending_import_surisha: 0,

			// }];
			this.tot_non_pending = 0


			let import_local_arr = [0]

			if (
				(this.company_Ids.length == 1 && this.company_Ids[0] == 0) ||
				(this.company_Ids.length == 3 && (this.company_Ids.includes(1, 2) && this.company_Ids.includes(3))) ||
				(this.company_Ids.length == 2 && this.company_Ids.includes(1, 3)) ||
				(this.company_Ids.length == 2 && this.company_Ids.includes(2, 3))
			) {
				finalArr = [{
					pnforRegular: response.data.port_not_allocate_regular,
					pnforInport: response.data.port_not_allocate_import,
					lc_not_issue_spipl: 0,
					lc_not_issue_import_surisha: 0,
					non_pending_spipl: 0,
					non_pending_import_surisha: 0,
					regular_intransite_spipl: 0,
					regular_intransite_import_surisha: 0,
					bond_intransite_spipl: 0,
					order_in_stock: 0,
					stock_transfer_instransite_all: 0,
					stock_transfer_import_instransite: 0,
					stock_transfer_local_instransite: 0,
					surisha_stock_intransite: 0,
					local_purchase_intransite_all: 0,
					local_purchase_import_intransite: 0,
					local_purchase_local_intransite: 0,
					inventory_all: 0,
					inventory_import: 0,
					inventory_local: 0,
					inventory_import_surisha: 0,
					sales_pending_all: 0,
					sales_pending_import: 0,
					sales_pending_local: 0,
					sales_pending_import_surisha: 0,

				}];

				console.log("FIRST")
				if (import_local_arr.length == 1 && import_local_arr.includes(0)) {
					console.log("FIRST ALL")
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
						this.tot_surisha_stock_intransite = this.tot_surisha_stock_intransite + elem.surisha_stock_intransite;
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
					console.log("FIRST Import")
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
						this.tot_surisha_stock_intransite = this.tot_surisha_stock_intransite + elem.surisha_stock_intransite;
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
					console.log("FIRST ALL")
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
						elem.surisha_stock_intransite = 0;
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
						this.tot_surisha_stock_intransite = this.tot_surisha_stock_intransite + elem.surisha_stock_intransite;
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
				console.log("Second")
				finalArr = [{
					pnforRegular: 0,
					pnforInport: response.data.port_not_allocate_import,
					lc_not_issue_spipl: 0,
					lc_not_issue_import_surisha: 0,
					non_pending_spipl: 0,
					non_pending_import_surisha: 0,
					regular_intransite_spipl: 0,
					regular_intransite_import_surisha: 0,
					bond_intransite_spipl: 0,
					order_in_stock: 0,
					stock_transfer_instransite_all: 0,
					stock_transfer_import_instransite: 0,
					stock_transfer_local_instransite: 0,
					surisha_stock_intransite: 0,
					local_purchase_intransite_all: 0,
					local_purchase_import_intransite: 0,
					local_purchase_local_intransite: 0,
					inventory_all: 0,
					inventory_import: 0,
					inventory_local: 0,
					inventory_import_surisha: 0,
					sales_pending_all: 0,
					sales_pending_import: 0,
					sales_pending_local: 0,
					sales_pending_import_surisha: 0,

				}];

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
					//elem.surisha_stock_intransite = 0
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
					this.tot_port_regular = 0;
					this.tot_port_forward = this.tot_port_forward + elem.pnforInport;

					this.tot_lc_not_issue_spipl = this.tot_lc_not_issue_spipl + elem.lc_not_issue_spipl;
					this.tot_lc_not_issue_import_surisha = this.tot_lc_not_issue_import_surisha + elem.lc_not_issue_import_surisha;


					this.tot_non_pending_spipl = this.tot_non_pending_spipl + elem.non_pending_spipl;
					this.tot_non_pending_import_surisha = this.tot_non_pending_import_surisha + elem.non_pending_import_surisha;
					this.tot_regular_intransite_spipl = this.tot_regular_intransite_spipl + elem.regular_intransite_spipl;
					this.tot_regular_intransite_import_surisha = this.tot_regular_intransite_import_surisha + elem.regular_intransite_import_surisha;
					this.tot_bond_intransite_spipl = this.tot_bond_intransite_spipl + elem.bond_intransite_spipl;
					this.tot_stock_transfer_import_instransite = this.tot_stock_transfer_import_instransite + elem.stock_transfer_import_instransite;
					this.tot_stock_transfer_local_instransite = this.tot_stock_transfer_local_instransite + elem.stock_transfer_local_instransite;
					this.tot_surisha_stock_intransite = this.tot_surisha_stock_intransite + elem.surisha_stock_intransite;
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
				console.log(result, "THIRD")
				finalArr = [{
					pnforRegular: response.data.port_not_allocate_regular,
					pnforInport: 0,
					lc_not_issue_spipl: 0,
					lc_not_issue_import_surisha: 0,
					non_pending_spipl: 0,
					non_pending_import_surisha: 0,
					regular_intransite_spipl: 0,
					regular_intransite_import_surisha: 0,
					bond_intransite_spipl: 0,
					order_in_stock: 0,
					stock_transfer_instransite_all: 0,
					stock_transfer_import_instransite: 0,
					stock_transfer_local_instransite: 0,
					tot_surisha_stock_intransite: 0,
					local_purchase_intransite_all: 0,
					local_purchase_import_intransite: 0,
					local_purchase_local_intransite: 0,
					inventory_all: 0,
					inventory_import: 0,
					inventory_local: 0,
					inventory_import_surisha: 0,
					sales_pending_all: 0,
					sales_pending_import: 0,
					sales_pending_local: 0,
					sales_pending_import_surisha: 0,

				}];

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
						elem.inventory_import_surisha = 0;
						elem.surisha_stock_intransite = 0
						//elem.sales_pending_all = 0;
						//elem.sales_pending_import = 0;
						//elem.sales_pending_local = 0;
						elem.sales_pending_import_surisha = 0;
						finalArr.push(elem);

						this.tot_port_regular = this.tot_port_regular + elem.pnforRegular;
						this.tot_port_forward = 0;

						this.tot_lc_not_issue_spipl = this.tot_lc_not_issue_spipl + elem.lc_not_issue_spipl;
						//this.tot_lc_not_issue_import_surisha = this.tot_lc_not_issue_import_surisha + elem.lc_not_issue_import_surisha;
						this.tot_lc_not_issue_import_surisha = 0;
						this.tot_non_pending_spipl = this.tot_non_pending_spipl + elem.non_pending_spipl;
						this.tot_non_pending_import_surisha = this.tot_non_pending_import_surisha + elem.non_pending_import_surisha;
						this.tot_regular_intransite_spipl = this.tot_regular_intransite_spipl + elem.regular_intransite_spipl;
						this.tot_regular_intransite_import_surisha = this.tot_regular_intransite_import_surisha + elem.regular_intransite_import_surisha;
						this.tot_bond_intransite_spipl = this.tot_bond_intransite_spipl + elem.bond_intransite_spipl;
						this.tot_stock_transfer_import_instransite = this.tot_stock_transfer_import_instransite + elem.stock_transfer_import_instransite;
						this.tot_stock_transfer_local_instransite = this.tot_stock_transfer_local_instransite + elem.stock_transfer_local_instransite;
						this.tot_surisha_stock_intransite = this.tot_surisha_stock_intransite + elem.surisha_stock_intransite;
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

						this.tot_port_regular = this.tot_port_regular + elem.pnforRegular;
						this.tot_port_forward = 0;

						this.tot_lc_not_issue_spipl = this.tot_lc_not_issue_spipl + elem.lc_not_issue_spipl;
						this.tot_lc_not_issue_import_surisha = this.tot_lc_not_issue_import_surisha + elem.lc_not_issue_import_surisha;


						this.tot_non_pending_spipl = this.tot_non_pending_spipl + elem.non_pending_spipl;
						this.tot_non_pending_import_surisha = this.tot_non_pending_import_surisha + elem.non_pending_import_surisha;
						this.tot_regular_intransite_spipl = this.tot_regular_intransite_spipl + elem.regular_intransite_spipl;
						this.tot_regular_intransite_import_surisha = this.tot_regular_intransite_import_surisha + elem.regular_intransite_import_surisha;
						this.tot_bond_intransite_spipl = this.tot_bond_intransite_spipl + elem.bond_intransite_spipl;
						this.tot_stock_transfer_import_instransite = this.tot_stock_transfer_import_instransite + elem.stock_transfer_import_instransite;
						this.tot_stock_transfer_local_instransite = this.tot_stock_transfer_local_instransite + elem.stock_transfer_local_instransite;
						this.tot_surisha_stock_intransite = this.tot_surisha_stock_intransite + elem.surisha_stock_intransite;
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

						this.tot_port_regular = this.tot_port_regular + elem.pnforRegular;
						this.tot_port_forward = 0

						this.tot_lc_not_issue_spipl = this.tot_lc_not_issue_spipl + elem.lc_not_issue_spipl;
						this.tot_lc_not_issue_import_surisha = this.tot_lc_not_issue_import_surisha + elem.lc_not_issue_import_surisha;

						this.tot_non_pending_spipl = this.tot_non_pending_spipl + elem.non_pending_spipl;
						this.tot_non_pending_import_surisha = this.tot_non_pending_import_surisha + elem.non_pending_import_surisha;
						this.tot_regular_intransite_spipl = this.tot_regular_intransite_spipl + elem.regular_intransite_spipl;
						this.tot_regular_intransite_import_surisha = this.tot_regular_intransite_import_surisha + elem.regular_intransite_import_surisha;
						this.tot_bond_intransite_spipl = this.tot_bond_intransite_spipl + elem.bond_intransite_spipl;
						this.tot_stock_transfer_import_instransite = this.tot_stock_transfer_import_instransite + elem.stock_transfer_import_instransite;
						this.tot_stock_transfer_local_instransite = this.tot_stock_transfer_local_instransite + elem.stock_transfer_local_instransite;
						this.tot_surisha_stock_intransite = this.tot_surisha_stock_intransite + elem.surisha_stock_intransite;
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

			this.testData = finalArr;
		});

	}

	onSelectMainGrade() {
		this.getInventoryFromRdis();
	}

	onCompanyChange(event: Array<any>) {
		this.main_grade_ids = [];
		let changeEvent = [0]
		event.forEach((element) => {
			if (element.id === 0 || element.id === 3) {
				changeEvent.push(1, 2);
			} else {
				changeEvent.push(element.id)
			}
		});

		console.log('Company change Event', event[0]);
		if (event.length === 0 && event[0] === undefined) {
			// console.log('inside length zero event')
			this.main_grade = [];
		} else {
			this.main_grade = this.main_grade_master.filter((item) => changeEvent.includes(item.company_id));
		}

	}



	getDetailUn(main_godown_id) {

		let main_grade_single_array = [];
		this.main_grade.forEach((element) => {
			main_grade_single_array.push(element.id);
		})
		let data1 = this.unsoldData.filter(val => main_grade_single_array.includes(val.main_grade_id));

		let data = []


		data = data1.filter(val => val.main_godown_id == main_godown_id);

		console.log(data, "datadata")


		var helper = {};
		var result = data.reduce(function (r, o) {
			var key = o.grade_id;
			if (!helper[key]) {
				helper[key] = Object.assign({}, o); // create a copy of o
				helper[key].local_purchase_import_intransite += o.local_purchase_import_mou;
				helper[key].local_purchase_local_intransite += o.local_purchase_local_mou;
				helper[key].inventory_local += o.inventory_local_mou;
				helper[key].inventory_import += o.inventory_import_mou;
				helper[key].sales_pending_import += o.sales_pending_import_mou;
				helper[key].sales_pending_local += o.sales_pending_local_mou
				r.push(helper[key]);
			} else {
				helper[key].lc_not_issue_spipl += o.lc_not_issue_spipl;
				helper[key].lc_not_issue_import_surisha += o.lc_not_issue_import_surisha;
				helper[key].bond_intransite_spipl += o.bond_intransite_spipl;
				helper[key].inventory_all += o.inventory_all;
				helper[key].inventory_import += o.inventory_import + o.inventory_import_mou;
				helper[key].inventory_import_surisha += o.inventory_import_surisha;
				helper[key].inventory_local += o.inventory_local + o.inventory_local_mou;
				helper[key].local_purchase_import_intransite += (o.local_purchase_import_intransite + o.local_purchase_import_mou);
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
				helper[key].surisha_stock_intransite += o.surisha_stock_intransite;
			}
			return r;
		}, []);

		console.log(result, "resultresult");

		this.tot_lc_not_issue_spipl_det = 0;
		this.tot_lc_not_issue_import_surisha_det = 0;
		this.tot_non_pending_spipl_det = 0;
		this.tot_non_pending_import_surisha_det = 0;
		this.tot_regular_intransite_spipl_det = 0;
		this.tot_regular_intransite_import_surisha_det = 0;
		this.tot_bond_intransite_spipl_det = 0;
		this.tot_stock_transfer_import_instransite_det = 0;
		this.tot_stock_transfer_local_instransite_det = 0;
		this.tot_surisha_stock_intransite_det = 0;
		this.tot_local_purchase_import_intransite_det = 0;
		this.tot_local_purchase_local_intransite_det = 0;
		this.tot_inventory_import_det = 0;
		this.tot_inventory_local_det = 0;
		this.tot_inventory_import_surisha_det = 0;
		this.tot_sales_pending_import_det = 0;
		this.tot_sales_pending_local_det = 0;
		this.tot_sales_pending_import_surisha_det = 0;

		let finalArr = [];
		let import_local_arr = [0]

		if (
			(this.company_Ids.length == 1 && this.company_Ids[0] == 0) ||
			(this.company_Ids.length == 3 && (this.company_Ids.includes(1, 2) && this.company_Ids.includes(3))) ||
			(this.company_Ids.length == 2 && this.company_Ids.includes(1, 3)) ||
			(this.company_Ids.length == 2 && this.company_Ids.includes(2, 3))
		) {
			console.log("First IF")
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
					this.tot_lc_not_issue_spipl_det = this.tot_lc_not_issue_spipl_det + elem.lc_not_issue_spipl;
					this.tot_lc_not_issue_import_surisha_det = this.tot_lc_not_issue_import_surisha_det + elem.lc_not_issue_import_surisha;
					this.tot_non_pending_spipl_det = this.tot_non_pending_spipl_det + elem.non_pending_spipl;
					this.tot_non_pending_import_surisha_det = this.tot_non_pending_import_surisha_det + elem.non_pending_import_surisha;
					this.tot_regular_intransite_spipl_det = this.tot_regular_intransite_spipl_det + elem.regular_intransite_spipl;
					this.tot_regular_intransite_import_surisha_det = this.tot_regular_intransite_import_surisha_det + elem.regular_intransite_import_surisha;
					this.tot_bond_intransite_spipl_det = this.tot_bond_intransite_spipl_det + elem.bond_intransite_spipl;
					this.tot_stock_transfer_import_instransite_det = this.tot_stock_transfer_import_instransite_det + elem.stock_transfer_import_instransite;
					this.tot_surisha_stock_intransite_det = this.tot_surisha_stock_intransite_det + elem.surisha_stock_intransite
					this.tot_stock_transfer_local_instransite_det = this.tot_stock_transfer_local_instransite_det + elem.stock_transfer_local_instransite;
					this.tot_local_purchase_import_intransite_det = this.tot_local_purchase_import_intransite_det + elem.local_purchase_import_intransite;
					this.tot_local_purchase_local_intransite_det = this.tot_local_purchase_local_intransite_det + elem.local_purchase_local_intransite;
					this.tot_inventory_import_det = this.tot_inventory_import_det + elem.inventory_import;
					this.tot_inventory_local_det = this.tot_inventory_local_det + elem.inventory_local;
					this.tot_inventory_import_surisha_det = this.tot_inventory_import_surisha_det + elem.inventory_import_surisha;
					this.tot_sales_pending_import_det = this.tot_sales_pending_import_det + elem.sales_pending_import;
					this.tot_sales_pending_local_det = this.tot_sales_pending_local_det + elem.sales_pending_local;
					this.tot_sales_pending_import_surisha_det = this.tot_sales_pending_import_surisha_det + elem.sales_pending_import_surisha;
				}

			} else if (import_local_arr.length == 1 && import_local_arr.includes(1)) {
				//Import
				console.log("Importt")
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

					this.tot_lc_not_issue_spipl_det = this.tot_lc_not_issue_spipl_det + elem.lc_not_issue_spipl;
					this.tot_lc_not_issue_import_surisha_det = this.tot_lc_not_issue_import_surisha_det + elem.lc_not_issue_import_surisha;

					this.tot_non_pending_spipl_det = this.tot_non_pending_spipl_det + elem.non_pending_spipl;
					this.tot_non_pending_import_surisha_det = this.tot_non_pending_import_surisha_det + elem.non_pending_import_surisha;
					this.tot_regular_intransite_spipl_det = this.tot_regular_intransite_spipl_det + elem.regular_intransite_spipl;
					this.tot_regular_intransite_import_surisha_det = this.tot_regular_intransite_import_surisha_det + elem.regular_intransite_import_surisha;
					this.tot_bond_intransite_spipl_det = this.tot_bond_intransite_spipl_det + elem.bond_intransite_spipl;
					this.tot_stock_transfer_import_instransite_det = this.tot_stock_transfer_import_instransite_det + elem.stock_transfer_import_instransite;
					this.tot_stock_transfer_local_instransite_det = this.tot_stock_transfer_local_instransite_det + elem.stock_transfer_local_instransite;
					this.tot_surisha_stock_intransite_det = this.tot_surisha_stock_intransite_det + elem.surisha_stock_intransite
					this.tot_local_purchase_import_intransite_det = this.tot_local_purchase_import_intransite_det + elem.local_purchase_import_intransite;
					this.tot_local_purchase_local_intransite_det = this.tot_local_purchase_local_intransite_det + elem.local_purchase_local_intransite;
					this.tot_inventory_import_det = this.tot_inventory_import_det + elem.inventory_import;
					this.tot_inventory_local_det = this.tot_inventory_local_det + elem.inventory_local;
					this.tot_inventory_import_surisha_det = this.tot_inventory_import_surisha_det + elem.inventory_import_surisha;
					this.tot_sales_pending_import_det = this.tot_sales_pending_import_det + elem.sales_pending_import;
					this.tot_sales_pending_local_det = this.tot_sales_pending_local_det + elem.sales_pending_local;
					this.tot_sales_pending_import_surisha_det = this.tot_sales_pending_import_surisha_det + elem.sales_pending_import_surisha;
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
					elem.surisha_stock_intransite = 0,
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
					this.tot_lc_not_issue_spipl_det = this.tot_lc_not_issue_spipl_det + elem.lc_not_issue_spipl;
					this.tot_lc_not_issue_import_surisha_det = this.tot_lc_not_issue_import_surisha_det + elem.lc_not_issue_import_surisha;
					this.tot_non_pending_spipl_det = this.tot_non_pending_spipl_det + elem.non_pending_spipl;
					this.tot_non_pending_import_surisha_det = this.tot_non_pending_import_surisha_det + elem.non_pending_import_surisha;
					this.tot_regular_intransite_spipl_det = this.tot_regular_intransite_spipl_det + elem.regular_intransite_spipl;
					this.tot_regular_intransite_import_surisha_det = this.tot_regular_intransite_import_surisha_det + elem.regular_intransite_import_surisha;
					this.tot_bond_intransite_spipl_det = this.tot_bond_intransite_spipl_det + elem.bond_intransite_spipl;
					this.tot_stock_transfer_import_instransite_det = this.tot_stock_transfer_import_instransite_det + elem.stock_transfer_import_instransite;
					this.tot_stock_transfer_local_instransite_det = this.tot_stock_transfer_local_instransite_det + elem.stock_transfer_local_instransite;
					this.tot_surisha_stock_intransite_det = this.tot_surisha_stock_intransite_det + elem.surisha_stock_intransite
					this.tot_local_purchase_import_intransite_det = this.tot_local_purchase_import_intransite_det + elem.local_purchase_import_intransite;
					this.tot_local_purchase_local_intransite_det = this.tot_local_purchase_local_intransite_det + elem.local_purchase_local_intransite;
					this.tot_inventory_import_det = this.tot_inventory_import_det + elem.inventory_import;
					this.tot_inventory_local_det = this.tot_inventory_local_det + elem.inventory_local;
					this.tot_inventory_import_surisha_det = this.tot_inventory_import_surisha_det + elem.inventory_import_surisha;
					this.tot_sales_pending_import_det = this.tot_sales_pending_import_det + elem.sales_pending_import;
					this.tot_sales_pending_local_det = this.tot_sales_pending_local_det + elem.sales_pending_local;
					this.tot_sales_pending_import_surisha_det = this.tot_sales_pending_import_surisha_det + elem.sales_pending_import_surisha;
				}

			}


		}
		else if (this.company_Ids.length == 1 && this.company_Ids[0] == 3) {
			console.log("Sencond else")
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

				this.tot_lc_not_issue_spipl_det = this.tot_lc_not_issue_spipl_det + elem.lc_not_issue_spipl;
				this.tot_lc_not_issue_import_surisha_det = this.tot_lc_not_issue_import_surisha_det + elem.lc_not_issue_import_surisha;
				this.tot_non_pending_spipl_det = this.tot_non_pending_spipl_det + elem.non_pending_spipl;
				this.tot_non_pending_import_surisha_det = this.tot_non_pending_import_surisha_det + elem.non_pending_import_surisha;
				this.tot_regular_intransite_spipl_det = this.tot_regular_intransite_spipl_det + elem.regular_intransite_spipl;
				this.tot_regular_intransite_import_surisha_det = this.tot_regular_intransite_import_surisha_det + elem.regular_intransite_import_surisha;
				this.tot_bond_intransite_spipl_det = this.tot_bond_intransite_spipl_det + elem.bond_intransite_spipl;
				this.tot_stock_transfer_import_instransite_det = this.tot_stock_transfer_import_instransite_det + elem.stock_transfer_import_instransite;
				this.tot_stock_transfer_local_instransite_det = this.tot_stock_transfer_local_instransite_det + elem.stock_transfer_local_instransite;
				this.tot_surisha_stock_intransite_det = this.tot_surisha_stock_intransite_det + elem.surisha_stock_intransite
				this.tot_local_purchase_import_intransite_det = this.tot_local_purchase_import_intransite_det + elem.local_purchase_import_intransite;
				this.tot_local_purchase_local_intransite_det = this.tot_local_purchase_local_intransite_det + elem.local_purchase_local_intransite;
				this.tot_inventory_import_det = this.tot_inventory_import_det + elem.inventory_import;
				this.tot_inventory_local_det = this.tot_inventory_local_det + elem.inventory_local;
				this.tot_inventory_import_surisha_det = this.tot_inventory_import_surisha_det + elem.inventory_import_surisha;
				this.tot_sales_pending_import_det = this.tot_sales_pending_import_det + elem.sales_pending_import;
				this.tot_sales_pending_local_det = this.tot_sales_pending_local_det + elem.sales_pending_local;
				this.tot_sales_pending_import_surisha_det = this.tot_sales_pending_import_surisha_det + elem.sales_pending_import_surisha;
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
					elem.inventory_import_surisha = 0;
					//elem.sales_pending_all = 0;
					//elem.sales_pending_import = 0;
					//elem.sales_pending_local = 0;
					elem.sales_pending_import_surisha = 0;
					elem.surisha_stock_intransite = 0,
						finalArr.push(elem);

					// this.tot_port_regular = this.tot_port_regular + elem.pnforRegular;
					// this.tot_port_forward = this.tot_port_forward + elem.pnforInport;

					this.tot_lc_not_issue_spipl_det = this.tot_lc_not_issue_spipl_det + elem.lc_not_issue_spipl;
					this.tot_lc_not_issue_import_surisha_det = this.tot_lc_not_issue_import_surisha_det + elem.lc_not_issue_import_surisha;
					this.tot_non_pending_spipl_det = this.tot_non_pending_spipl_det + elem.non_pending_spipl;
					this.tot_non_pending_import_surisha_det = this.tot_non_pending_import_surisha_det + elem.non_pending_import_surisha;
					this.tot_regular_intransite_spipl_det = this.tot_regular_intransite_spipl_det + elem.regular_intransite_spipl;
					this.tot_regular_intransite_import_surisha_det = this.tot_regular_intransite_import_surisha_det + elem.regular_intransite_import_surisha;
					this.tot_bond_intransite_spipl_det = this.tot_bond_intransite_spipl_det + elem.bond_intransite_spipl;
					this.tot_stock_transfer_import_instransite_det = this.tot_stock_transfer_import_instransite_det + elem.stock_transfer_import_instransite;
					this.tot_stock_transfer_local_instransite_det = this.tot_stock_transfer_local_instransite_det + elem.stock_transfer_local_instransite;
					this.tot_surisha_stock_intransite_det = this.tot_surisha_stock_intransite_det + elem.surisha_stock_intransite
					this.tot_local_purchase_import_intransite_det = this.tot_local_purchase_import_intransite_det + elem.local_purchase_import_intransite;
					this.tot_local_purchase_local_intransite_det = this.tot_local_purchase_local_intransite_det + elem.local_purchase_local_intransite;
					this.tot_inventory_import_det = this.tot_inventory_import_det + elem.inventory_import;
					this.tot_inventory_local_det = this.tot_inventory_local_det + elem.inventory_local;
					this.tot_inventory_import_surisha_det = this.tot_inventory_import_surisha_det + elem.inventory_import_surisha;
					this.tot_sales_pending_import_det = this.tot_sales_pending_import_det + elem.sales_pending_import;
					this.tot_sales_pending_local_det = this.tot_sales_pending_local_det + elem.sales_pending_local;
					this.tot_sales_pending_import_surisha_det = this.tot_sales_pending_import_surisha_det + elem.sales_pending_import_surisha;
				}
			} else if (import_local_arr.length == 1 && import_local_arr.includes(1)) {
				console.log("third else")
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
					elem.surisha_stock_intransite = 0,
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

					this.tot_lc_not_issue_spipl_det = this.tot_lc_not_issue_spipl_det + elem.lc_not_issue_spipl;
					this.tot_lc_not_issue_import_surisha_det = this.tot_lc_not_issue_import_surisha_det + elem.lc_not_issue_import_surisha;
					this.tot_non_pending_spipl_det = this.tot_non_pending_spipl_det + elem.non_pending_spipl;
					this.tot_non_pending_import_surisha_det = this.tot_non_pending_import_surisha_det + elem.non_pending_import_surisha;
					this.tot_regular_intransite_spipl_det = this.tot_regular_intransite_spipl_det + elem.regular_intransite_spipl;
					this.tot_regular_intransite_import_surisha_det = this.tot_regular_intransite_import_surisha_det + elem.regular_intransite_import_surisha;
					this.tot_bond_intransite_spipl_det = this.tot_bond_intransite_spipl_det + elem.bond_intransite_spipl;
					this.tot_stock_transfer_import_instransite_det = this.tot_stock_transfer_import_instransite_det + elem.stock_transfer_import_instransite;
					this.tot_stock_transfer_local_instransite_det = this.tot_stock_transfer_local_instransite_det + elem.stock_transfer_local_instransite;
					this.tot_surisha_stock_intransite_det = this.tot_surisha_stock_intransite_det + elem.surisha_stock_intransite
					this.tot_local_purchase_import_intransite_det = this.tot_local_purchase_import_intransite_det + elem.local_purchase_import_intransite;
					this.tot_local_purchase_local_intransite_det = this.tot_local_purchase_local_intransite_det + elem.local_purchase_local_intransite;
					this.tot_inventory_import_det = this.tot_inventory_import_det + elem.inventory_import;
					this.tot_inventory_local_det = this.tot_inventory_local_det + elem.inventory_local;
					this.tot_inventory_import_surisha_det = this.tot_inventory_import_surisha_det + elem.inventory_import_surisha;
					this.tot_sales_pending_import_det = this.tot_sales_pending_import_det + elem.sales_pending_import;
					this.tot_sales_pending_local_det = this.tot_sales_pending_local_det + elem.sales_pending_local;
					this.tot_sales_pending_import_surisha_det = this.tot_sales_pending_import_surisha_det + elem.sales_pending_import_surisha;
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
					elem.surisha_stock_intransite = 0,
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

					this.tot_lc_not_issue_spipl_det = this.tot_lc_not_issue_spipl_det + elem.lc_not_issue_spipl;
					this.tot_lc_not_issue_import_surisha_det = this.tot_lc_not_issue_import_surisha_det + elem.lc_not_issue_import_surisha;
					this.tot_non_pending_spipl_det = this.tot_non_pending_spipl_det + elem.non_pending_spipl;
					this.tot_non_pending_import_surisha_det = this.tot_non_pending_import_surisha_det + elem.non_pending_import_surisha;
					this.tot_regular_intransite_spipl_det = this.tot_regular_intransite_spipl_det + elem.regular_intransite_spipl;
					this.tot_regular_intransite_import_surisha_det = this.tot_regular_intransite_import_surisha_det + elem.regular_intransite_import_surisha;
					this.tot_bond_intransite_spipl_det = this.tot_bond_intransite_spipl_det + elem.bond_intransite_spipl;
					this.tot_stock_transfer_import_instransite_det = this.tot_stock_transfer_import_instransite_det + elem.stock_transfer_import_instransite;
					this.tot_stock_transfer_local_instransite_det = this.tot_stock_transfer_local_instransite_det + elem.stock_transfer_local_instransite;
					this.tot_surisha_stock_intransite_det = this.tot_surisha_stock_intransite_det + elem.surisha_stock_intransite
					this.tot_local_purchase_import_intransite_det = this.tot_local_purchase_import_intransite_det + elem.local_purchase_import_intransite;
					this.tot_local_purchase_local_intransite_det = this.tot_local_purchase_local_intransite_det + elem.local_purchase_local_intransite;
					this.tot_inventory_import_det = this.tot_inventory_import_det + elem.inventory_import;
					this.tot_inventory_local_det = this.tot_inventory_local_det + elem.inventory_local;
					this.tot_inventory_import_surisha_det = this.tot_inventory_import_surisha_det + elem.inventory_import_surisha;
					this.tot_sales_pending_import_det = this.tot_sales_pending_import_det + elem.sales_pending_import;
					this.tot_sales_pending_local_det = this.tot_sales_pending_local_det + elem.sales_pending_local;
					this.tot_sales_pending_import_surisha_det = this.tot_sales_pending_import_surisha_det + elem.sales_pending_import_surisha;
				}
			}

		}


		console.log(finalArr, "finalArrDetails")
		this.DetailUnsoldData = finalArr;
		this.unsoldSummaryList.show();


	}


	closeModalForm() {
		this.unsoldSummaryList.hide();
	}


	calculate_redis_unosld() {
		this.CrudServices.getRequest<any>(inventoryRedis.calculateUnsold).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
			}
		});
	}

	whatsapp_unsold() {
		this.CrudServices.postRequest<any>(inventoryRedis.unsoldWhatsApp, {
			company_Ids: this.company_Ids
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
			}
		});
	}

	closeModal() {
		this.myModelImportSurisha.hide();
		this.myModelSPIPL.hide();

	}
}
