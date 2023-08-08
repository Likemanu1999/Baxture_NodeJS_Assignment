import { ActivatedRoute, Params, Router } from "@angular/router";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { PayableParameter, PayableParameterModel } from '../../../shared/payable-request/payable-parameter.model';
import { ToasterConfig, ToasterService } from "angular2-toaster";

import { CrudServices } from "../../../shared/crud-services/crud-services";
import { LoginService } from "../../login/login.service";
import { esLocale, ModalDirective } from "ngx-bootstrap";
import { PermissionService } from "../../../shared/pemission-services/pemission-service";
import { SelectService } from "../../../shared/dropdown-services/select-services";
import { CommonApis, ConsumeCapacity, GodownMaster, GradeMaster, inventoryRedis, MainOrg, ShortDamageClearance, SubOrg } from "../../../shared/apis-path/apis-path";
import { UserDetails } from "../../login/UserDetails.model";
import { staticValues } from "../../../shared/common-service/common-service";
import { DatePipe } from "@angular/common";
import { Table } from "primeng/table";
import * as moment from "moment";

@Component({
	selector: 'app-short-damage-clearance',
	templateUrl: './short-damage-clearance.component.html',
	styleUrls: ['./short-damage-clearance.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		SelectService,
		CrudServices,
		DatePipe
	],
})
export class ShortDamageClearanceComponent implements OnInit {
	@ViewChild('dt', { static: false }) table: Table;
	@ViewChild("clearanceModal", { static: false }) public clearanceModal: ModalDirective;
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	clearanceForm: FormGroup;
	grade_arr: any;
	company_arr: any;
	godown: any;
	type_list = [];
	flag_list = [];
	bsRangeValue = [];
	type_arr: any = [];
	type_data = {};
	cols: { field: string; header: string; style: string; }[];
	data = [];
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'right';
	public closeOnOutsideClick: boolean = true;
	id: any;
	add_opt: any;
	view_opt: any;
	edit_opt: any;
	del_opt: any;
	filteredValuess = [];
	totalQty: any;
	fromDate: string;
	toDate: string;
	viewData: any = [];
	viewName: any = [];
	filter: any = [];
	lookup_godown = {};
	lookup_grade = {};
	lookup_type = {};
	godown_list = [];
	grade_list = [];
	types_list = [];
	isLoading: boolean = false;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;
	constructor(private route: ActivatedRoute,
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private datePipe: DatePipe,
		private crudServices: CrudServices) {

		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];

		this.crudServices.getAll<any>(CommonApis.getCompanies).subscribe((response) => {
			this.company_arr = response.data;
		})

		this.crudServices.getAll<any>(GodownMaster.getAll).subscribe(res => {
			this.godown = res
		});

		this.type_list = [{ label: 'Purchase Clearance', value: 1 }, { label: 'Sales Clearance', value: 2 }, { label: 'Stock Transfer', value: 3 }]
		this.flag_list = [{ label: 'Import', value: 1 }, { label: 'Local', value: 2 }]
		this.cols = [
			{ field: '', header: 'Action', style: '80px' },
			{ field: 'company_name', header: 'Company', style: '100px' },
			{ field: 'godown_name', header: 'Godown', style: '110px' },
			{ field: 'grade_name', header: 'Grade', style: '110px' },
			{ field: 'quantity', header: 'Quantity', style: '100px' },
			{ field: 'date', header: 'Date', style: '100px' },
			{ field: 'type', header: 'Type', style: '110px' },
			{ field: 'remark', header: 'Remark', style: '200px' },
			{ field: 'modified_by', header: 'Updated By', style: '100px' },
			{ field: 'modified_date', header: 'Updated At', style: '100px' }
		];

	}
	// getCols() {
	// 	// if (this.selected_status.id == 0) {
	// 	this.cols = [
	// 		{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
	// 		{ field: "company_name", header: "company_name", sort: true, filter: true, dropdown: [], footer: false, total: 0,type:null },
	// 		{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
	// 		{ field: "grade_name", header: "Grade", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
	// 		{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
	// 		{ field: "date", header: "Date", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Date" },
	// 		{ field: "type", header: "Type", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
	// 		{ field: "modified_by", header: "Updated By", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
	// 		{ field: "modified_date", header: "Updated At", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },

	// 	];
	// 	this.filter = ['company_name', 'godown_name', 'type', 'grade_name'];
	// }

	ngOnInit() {

		this.clearanceForm = new FormGroup({
			company_id: new FormControl(null, Validators.required),
			grade_id: new FormControl(null, Validators.required),
			godown_id: new FormControl(null, Validators.required),
			quantity: new FormControl(null, Validators.required),
			import_local_flag: new FormControl(null),
			date: new FormControl(null, Validators.required),
			sale_purchase_type: new FormControl(null, Validators.required),
			remark: new FormControl(null, Validators.required),
		});

		this.getData();
	}

	getGrade(item) {
		if (item.id == 1 || item.id == 2) {
			this.crudServices.getOne<any>(GradeMaster.getOne, { company_id: item.id }).subscribe((response) => {
				this.grade_arr = response;
			});
		} else {
			this.crudServices.getAll<any>(GradeMaster.getAll).subscribe((response) => {
				this.grade_arr = response;
			});
		}
	}



	onChangeDate(event) {

		if (event != null && event != undefined) {
			this.fromDate = this.datePipe.transform(event[0], 'yyyy-MM-dd');
			this.toDate = this.datePipe.transform(event[1], 'yyyy-MM-dd');
		} else {
			this.fromDate = '';
			this.toDate = '';
		}
		this.getData();
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}

	getData() {
		this.crudServices.getOne<any>(ShortDamageClearance.getAllData, { fromDate: this.fromDate, toDate: this.toDate }).subscribe(response => {
			for (let i = 0; i < response.length; i++) {
				if (!(response[i].godown.godown_name in this.lookup_godown)) {
					this.lookup_godown[response[i].godown.godown_name] = 1;
					this.godown_list.push({ 'godown_name': response[i].godown.godown_name });
				}
				if (!(response[i].grade_master.grade_name in this.lookup_grade)) {
					this.lookup_grade[response[i].grade_master.grade_name] = 1;
					this.grade_list.push({ 'grade_name': response[i].grade_master.grade_name });
				}
				if (!(response[i].sale_purchase_type in this.lookup_type)) {
					this.lookup_type[response[i].sale_purchase_type] = 1;
					this.types_list.push({ type: this.getstatus(response[i].sale_purchase_type) });
				}
			}
			this.data = response.map(item => {
				item.godown_name = item.godown.godown_name;
				item.grade_name = item.grade_master.grade_name;
				if (item.sale_purchase_type == 1) {
					item.type = 'Purchase Clearance'
				} else if (item.sale_purchase_type == 2) {
					item.type = 'Sales Clearance'
				} else if (item.sale_purchase_type == 3) {
					item.type = 'Stock Transfer'
				} else {
					item.type = ''
				}
				return item;
			})
			this.filteredValuess = this.data;
			this.totalQty = this.data.reduce((sum, item) => sum + item.quantity, 0)
		})
	}

	getstatus(val) {
		if (val == 1) {
			return 'Purchase Clearance';
		} else if (val == 2) {
			return 'Sales Clearance';
		} else if (val == 3) {
			return 'Stock Transfer'
		} else {
			return ''
		}
	}

	onchange(event, name) {
		const arr = [];
		if (event.value.length > 0) {
			for (let i = 0; i < event.value.length; i++) {
				arr.push(event.value[i][name]);
			}
			this.table.filter(arr, name, 'in');
		} else {
			this.table.filter('', name, 'in');
		}
	}


	closeModal() {
		this.clearanceModal.hide();
		this.id = null;
		this.clearanceForm.reset();
		this.getData();
	}

	addClearance() {
		this.clearanceModal.show();
	}

	onSubmit() {
		this.isLoading = true;
		let data = {
			company_id: this.clearanceForm.value.company_id,
			grade_id: this.clearanceForm.value.grade_id,
			godown_id: this.clearanceForm.value.godown_id,
			quantity: this.clearanceForm.value.quantity,
			import_local_flag: this.clearanceForm.value.import_local_flag,
			date: this.clearanceForm.value.date,
			sale_purchase_type: this.clearanceForm.value.sale_purchase_type,
			remark: this.clearanceForm.value.remark,
		}

		if (this.id != null && this.id != undefined) {
			data['id'] = this.id
			this.crudServices.updateData<any>(ShortDamageClearance.updateData, data).subscribe(response => {
				if (response) {
					this.toasterService.pop(response.message, response.message, response.data)
					this.calculate_redis_unosld();
					this.closeModal();
				}
			})


		} else {
			this.crudServices.addData<any>(ShortDamageClearance.addData, data).subscribe(response => {
				if (response) {
					this.toasterService.pop(response.message, response.message, response.data)
					this.closeModal();
				}
			})
		}



	}

	calculate_redis_unosld() {
		this.crudServices.getRequest<any>(inventoryRedis.calculateUnsold).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
			}
		});
	}

	onDelete(item) {
		this.crudServices.deleteData<any>(ShortDamageClearance.deleteData, { id: item.id, sale_purchase_type: item.sale_purchase_type }).subscribe(response => {
			if (response) {
				this.toasterService.pop(response.message, response.message, response.data);
				this.calculate_redis_unosld();
				this.getData();
			}
		})
	}

	onEdit(item) {
		this.id = item.id;
		this.getGrade(item);
		this.clearanceForm.patchValue(item);
		this.clearanceModal.show();
	}

	onFilter(event, dt) {
		this.filteredValuess = event.filteredValue;
		this.totalQty = this.filteredValuess.reduce((sum, item) => sum + item.quantity, 0)
	}


}
