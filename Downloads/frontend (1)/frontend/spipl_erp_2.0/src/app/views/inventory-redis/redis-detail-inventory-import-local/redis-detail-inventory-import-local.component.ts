import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { BsDatepickerConfig, ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { LiveInventory } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';

@Component({
  selector: 'app-redis-detail-inventory-import-local',
  templateUrl: './redis-detail-inventory-import-local.component.html',
  styleUrls: ['./redis-detail-inventory-import-local.component.scss'],
  providers: [CrudServices, DatePipe, ToasterService, ExportService, LoginService]
})
export class RedisDetailInventoryImportLocalComponent implements OnInit {

  @ViewChild('dt', { static: false }) table: Table;
	@ViewChild('approveModel', { static: false }) public approveModel: ModalDirective;

	cols: any = [];
	data: any = [];
	bsConfig: Partial<BsDatepickerConfig>;
	bsValue: Date = new Date();
	currentYear: number;
	date = new Date();
	enddate: any;

	lookup_godown = {};
	godown_arr = [];

	lookup_grade = {};
	grade_arr = [];

	main_lookup_grade = {};
	main_grade_arr = [];

	lookup_import_local_str = {};
	import_local_arr = [];

	lookup_surisha_stock_flag_str = {};
	surisha_stock_flag_arr = [];

	_selectedColumns: any[];
	isLoading: Boolean = false;


	filteredValuess: any[];
	tot_open = 0;
	tot_inward = 0;
	tot_outward = 0;
	tot_close = 0;
	status_item = [];
	export_list: any[];
	approveForm: FormGroup;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	user: UserDetails;


  constructor(private CrudServices: CrudServices, public datepipe: DatePipe, private toasterService: ToasterService, private exportService: ExportService, private loginService: LoginService) { 
    this.user = this.loginService.getUserDetails();
		console.log(this.user.userDet[0].role_id, this.user.userDet[0].company_id, "roled");

		this.getDetailsStock();

  }

  ngOnInit() {
    this.bsConfig = Object.assign({}, {
			dateInputFormat: 'YYYY-MM-DD',
			adaptivePosition: true
		});

		this.cols = [

			{ field: "import_local_flag_str", header: "Import/Local Flag", permission: true },
			{ field: "surisha_stock_flag_str", header: "PVC/PP/Surisha", permission: true },
			{ field: "godown_name", header: "Godwon", permission: true },
			{ field: "main_grade", header: "Main Grade", permission: true },
			{ field: "grade_name", header: "Grade", permission: true },
			{ field: "open_stock", header: "Opening Stock", permission: true },
			{ field: "inward_stock", header: "Inward Stock", permission: true },
			{ field: "outward_stock", header: "Outward Stock", permission: true },
			{ field: "close_stock", header: "Closing Stock", permission: true },
		];

		this._selectedColumns = this.cols;

		this.approveForm = new FormGroup({
			'approved_date': new FormControl(null),
			'status': new FormControl(null),
			'approve_remark': new FormControl(null)
		});

		this.status_item = [{ id: 1, name: "Complete" }, { id: 2, name: "InComplete" }];

  }


  getDetailsStock() {
		this.isLoading = true;

		if (this.bsValue) {
			this.enddate = (this.bsValue).toLocaleString();
			// console.log( this.enddate.toISOString(),"toISOString");
			// console.log( this.enddate.toLocaleString(),"toLocaleString");

		} else {
			this.enddate = Date.now().toLocaleString();
			// console.log( this.enddate.toISOString(),"toISOString");
			// console.log( this.enddate.toLocaleString(),"toLocaleString");
		}
		//this.data = [];



		this.CrudServices.postRequest<any>(LiveInventory.getDetailImportLocalStock, {
			date: this.enddate
		}).subscribe((response) => {
			this.isLoading = false;
			console.log(response, "detailsStockneha");


			for (let item, i = 0; item = response[i++];) {

				const godown_name = item.godown_name;
				const grade_name = item.grade_name;
				const main_grade_name = item.main_grade;


				if (item.import_local_flag == 1) {
					item.import_local_flag_str = 'Import';
				} else if (item.import_local_flag == 2) {
					item.import_local_flag_str = 'Local';
				}

				if (item.surisha_stock_flag == 1) {
					item.surisha_stock_flag_str = 'Surisha Import';
				} else if (item.surisha_stock_flag == 0) {
					item.surisha_stock_flag_str = 'PVC && PP';
				}

				const import_local_flag_str = item.import_local_flag_str;
				const surisha_stock_flag_str = item.surisha_stock_flag_str;

				if (!(godown_name in this.lookup_godown)) {
					this.lookup_godown[godown_name] = 1;
					this.godown_arr.push({ 'godown_name': godown_name });
				}

				if (!(grade_name in this.lookup_grade)) {
					this.lookup_grade[grade_name] = 1;
					this.grade_arr.push({ 'grade_name': grade_name });
				}


				if (!(main_grade_name in this.main_lookup_grade)) {
					this.main_lookup_grade[main_grade_name] = 1;
					this.main_grade_arr.push({ 'main_grade': main_grade_name });
				}

				if (!(import_local_flag_str in this.lookup_import_local_str)) {
					this.lookup_import_local_str[import_local_flag_str] = 1;
					this.import_local_arr.push({ 'import_local_flag_str': import_local_flag_str });
				}

				if (!(surisha_stock_flag_str in this.lookup_surisha_stock_flag_str)) {
					this.lookup_surisha_stock_flag_str[surisha_stock_flag_str] = 1;
					this.surisha_stock_flag_arr.push({ 'surisha_stock_flag_str': surisha_stock_flag_str });
				}



			}

			if (this.user.userDet[0].role_id == 1) {
				this.data = response;
			} else {
				if (this.user.userDet[0].company_id == 1) {
					this.data = response.filter(e => e['company_id'] == 1);
				} else if (this.user.userDet[0].company_id == 2) {
					this.data = response.filter(e => e['company_id'] == 2);
				}
			}
			console.log(this.data, "this.data")



			this.calculateTotal();

		});

	}
	getFilteredData() {
		this.getDetailsStock();
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

		this.calculateTotal();

	}

	onFilter(event, dt) {
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;

		this.tot_open = 0;
		this.tot_inward = 0;
		this.tot_outward = 0;
		this.tot_close = 0;
		for (const val of this.filteredValuess) {
			this.tot_open = this.tot_open + Number(val.open_stock);
			this.tot_inward = this.tot_inward + Number(val.inward_stock);
			this.tot_outward = this.tot_outward + Number(val.outward_stock);
			this.tot_close = this.tot_close + Number(val.close_stock);
		}

	}


	calculateTotal() {
		this.tot_open = 0;
		this.tot_inward = 0;
		this.tot_outward = 0;
		this.tot_close = 0;
		for (const val of this.data) {
			this.tot_open = this.tot_open + Number(val.open_stock);
			this.tot_inward = this.tot_inward + Number(val.inward_stock);
			this.tot_outward = this.tot_outward + Number(val.outward_stock);
			this.tot_close = this.tot_close + Number(val.close_stock);
		}

	}

	approvedStock() {
		// this.crudServices.getAll<any>(PortMaster.getAll).subscribe(response => {
		// 	this.port_list = response;
		// 	// console.log(response);
		// })

		// this.crudServices.getAll<any>(shipmentType.getAll).subscribe(response => {
		// 	this.shipmentType = response;

		// //	console.log(response);


		// })
		this.approveModel.show();
	}

	oncloseModalSearch() {
		this.approveModel.hide();

	}
	approveInvnetory() {
		let data = {
			approved_date: this.approveForm.value.approved_date,
			status: this.approveForm.value.status,
			approve_remark: this.approveForm.value.approve_remark,

		}
		this.CrudServices.postRequest<any>(LiveInventory.approveInventory, data).subscribe(response => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				this.approveForm.reset();
				this.oncloseModalSearch();
			} else {
				this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
				this.oncloseModalSearch();
			}
		})

	}

	onChangeDate($event) {
		console.log($event, "$event")
		this.CrudServices.postRequest<any>(LiveInventory.existingApproved, {
			approved_date: $event
		}).subscribe(response => {
			if (response.code == 100) {
				//this.toasterService.pop(response.message, response.message, response.data);
				console.log(response.data, "data")
				this.approveForm.patchValue({
					status: response.data[0].status,
					approve_remark: response.data[0].approve_remark
				});

			} else {
				this.toasterService.pop(response.message, response.message, 'Something Went Wrong');

			}
		})

	}


	exportData() {
		this.export_list = [];
		let arr = [];
		const foot = {};
		if (this.filteredValuess === undefined) {
			arr = this.data;
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

			if (this._selectedColumns[j]['field'] === 'open_stock') {
				foot[this._selectedColumns[j]['header']] = this.tot_open;
			} else if (this._selectedColumns[j]['field'] === 'inward_stock') {
				foot[this._selectedColumns[j]['header']] = this.tot_inward;
			}
			else if (this._selectedColumns[j]['field'] === 'outward_stock') {
				foot[this._selectedColumns[j]['header']] = this.tot_outward;
			}
			else if (this._selectedColumns[j]['field'] === 'close_stock') {
				foot[this._selectedColumns[j]['header']] = this.tot_close;
			}

		}


		this.export_list.push(foot);


	}

	exportExcel() {
		this.exportData();
		this.exportService.exportExcel(this.export_list, 'Detail-Inventory');
	}

}
