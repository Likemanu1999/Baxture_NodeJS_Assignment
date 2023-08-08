import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { godownStock, ReportRemark, GodownMaster, inventoryRedis, GradeMaster } from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";

@Component({
	selector: 'app-inventory-movement-new',
	templateUrl: './inventory-movement-new.component.html',
	styleUrls: ['./inventory-movement-new.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class InventoryMovementNewComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild('remarkModel', { static: false }) public remarkModel: ModalDirective;
	@ViewChild('splitStockModel', { static: false }) public splitStockModel: ModalDirective;
	@ViewChild('gradeModel', { static: false }) public gradeModel: ModalDirective;



	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	page_title: any = "Inventory Movement";
	user: UserDetails;
	links: string[] = [];
	company_id: any = null;
	role_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	drop_down: boolean = false;
	maxDate: any = new Date();
	datePickerConfig: any = staticValues.datePickerConfigNew;
	reports_name: any = staticValues.reports_name;
	remarkForm: any = FormGroup;
	gradeForm: any = FormGroup;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	cols: any = [];
	data: any = [];
	misData: any = [];
	filter: any = [];
	pdf_excell: any = [];
	godownList: any = [];
	gradeList: any = [];
	inventory_movement_actions: boolean;
	beforeChangeGodownData: any;
	inwardTotal: number;
	outwardTotal: number;
	tot_qty: number;
	splitQtyForm: any = FormGroup;
	splitHeader: string = ''
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.inventory_movement_actions = (this.links.find(x => x == 'inventory_movement_actions') != null) ? true : false;
		// this.inventory_movement_actions = true;
		this.remarkForm = new FormGroup({
			godown_id: new FormControl(null),
			id: new FormControl(null),
		})

		this.gradeForm = new FormGroup({
			grade_id: new FormControl(null),
			id: new FormControl(null),
		})

		this.splitQtyForm = new FormGroup({
			id: new FormControl(null),
			quantity: new FormControl(null)
		})
	}

	ngOnInit() {
		this.getGodown();
		this.getGrade();
		this.getData();
	}

	getGodown() {
		this.crudServices
			.getAll<any>(GodownMaster.getAll)
			.subscribe((godown) => {
				this.godownList = godown;
			});
	}
	getGrade() {
		this.crudServices
			.getAll<any>(GradeMaster.getAll)
			.subscribe((grade) => {
				this.gradeList = grade;
			});
	}
	oncloseModal() {
		this.remarkForm.reset();
		this.splitQtyForm.reset();
		this.gradeForm.reset();
		this.remarkModel.hide();
		this.splitStockModel.hide();
		this.gradeModel.hide();
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}
	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}

	getData() {
		this.getCols();
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(godownStock.getAll, {
			from_date: this.selected_date_range[0],
			to_date: this.selected_date_range[1],
			company_id: (this.role_id == 1 || this.role_id == 11 || this.role_id == 50) ? null : this.company_id,
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(item => {
						item.import_local_name = (item.import_local_flag == 1) ? "Import" : "Local";
						item.quantity = (item.inward - item.outward);
						item.setColor = (item.quantity > 0) ? "badge text-bg-suceess" : "badge text-bg-danger";
						item.company_name = (item.surisha_stock_flag == 1) ? 'Surisha' : item.company_name;
					})
					this.data = res.data;
					console.log("Amol >>", this.data);

					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				} else {
					this.toasterService.pop('error', 'Alert', 'No Data Found..!');

				}
			}
			this.table.reset();
		});
	}

	getCols() {
		this.cols = [
			{ field: 'id', header: 'Serial no', style: '100px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			// { field: 'id', header: 'ID', style: '100px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'import_local_name', header: 'Type', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null, oprations: null },
			{ field: 'company_name', header: 'Division', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null, oprations: null },
			{ field: 'godown_name', header: 'Godown', style: '100px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'grade_name', header: 'Grade', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null, oprations: null },
			{ field: 'added_date', header: 'Date', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Date", oprations: null },
			{ field: 'inward', header: 'Inward', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity", oprations: null },
			{ field: 'outward', header: 'Outward', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity", oprations: null },
			// { field: 'quantity', header: 'Quntity', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity", oprations: null },
			{ field: 'action', header: 'Action', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "action", oprations: null },

		];
		this.filter = ['id', 'import_local_name', 'company_name', 'godown_name', 'grade_name', 'date', 'inward', 'outward'];
		// this.pushDropdown(this.data);
		// this.footerTotal(this.data);
	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
			this.pdf_excell = arg;
		} else {
			data = this.data;
			this.pdf_excell = this.data;
		}
		let filter_cols = this.cols.filter(col => col.filter == true);
		filter_cols.forEach(element => {
			let unique = data.map(item =>
				item[element.field]
			).filter((value, index, self) =>
				self.indexOf(value) === index
			);
			let array = [];
			unique.forEach(item => {
				array.push({
					value: item,
					label: item
				});
			});
			element.dropdown = array;
		});
	}


	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		let filter_cols = this.cols.filter(col => col.footer == true);
		filter_cols.forEach(element => {
			if (data.length > 0) {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);

				if (element.type == "Avg") {
					element.total = total / (data.length)
				} else if (element.type == "Quantity") {
					if (element.field == 'inward') {
						this.inwardTotal = element.total = roundQuantity(total);
					} else if (element.field == 'outward') {
						this.outwardTotal = element.total = roundQuantity(total);
					} else {
						element.total = roundQuantity(total);
					}

				}
				else {
					element.total = total;
				}
			}

		});

		this.tot_qty = roundQuantity(this.inwardTotal - this.outwardTotal);
		// parseFloat(num.toFixed(2))
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		// this.pushDropdown(this.data);
		//this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		//this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}


	onAction(item, type) {

		if (type == "changeLocalImportFlag") {
			let data = {};
			data['import_local_flag'] = (item.import_local_flag == 1) ? 2 : 1;
			data['outward'] = item.outward;
			data['record_id'] = item.record_id;
			this.crudServices.updateData<any>(godownStock.update, { data: data, id: item.id }).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data)
			})
			console.log("changing flag of ", item.id);
			this.getData();
			this.calculate_redis_unosld();
		}

		if (type == "changeSurishaFlag") {
			let data = {};
			data['surisha_stock_flag'] = (item.surisha_stock_flag == 0) ? 1 : 0;
			this.crudServices.updateData<any>(godownStock.update, { data: data, id: item.id }).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data)
			})
			console.log("change Surisha Flag of", item.id);
			this.getData();
			this.calculate_redis_unosld();
		}

		if (type == 'changeGodownFlag') {
			console.log(item, "changegodownFlag");

			// this.remarkForm.reset();
			this.remarkForm.patchValue({
				godown_id: item.godown_id,
				id: item.id,
			});
			this.beforeChangeGodownData = null;
			this.beforeChangeGodownData = item;
			console.log("godown>>", item);
			this.remarkModel.show();
		}

		if (type == 'splitStockFlag') {
			this.splitHeader = item && item.inward > 0 ? 'Inward' : item && item.outward > 0 ? 'Outward' : '';
			this.splitQtyForm.patchValue({
				quantity: item && item.inward > 0 ? item.inward : item.outward,
				id: item.id,
			});
			this.beforeChangeGodownData = null;
			this.beforeChangeGodownData = item;
			this.splitStockModel.show();
		}

		if (type == 'changeGradeFlag') {
			this.gradeForm.patchValue({
				grade_id: item.grade_id,
				id: item.id,
			});
			this.beforeChangeGodownData = null;
			this.beforeChangeGodownData = item;
			this.gradeModel.show();
		}
	}
	allowedLimit = false
	validateQty(qty) {
		const quantity = this.beforeChangeGodownData.inward > 0 ? this.beforeChangeGodownData.inward : this.beforeChangeGodownData.outward
		if (qty.target.value < quantity && qty.target.value > 0) {
			this.allowedLimit = true;
		} else {
			this.allowedLimit = false;
		}
	}
	splitStock() {
		this.splitStockModel.hide();
	}

	onSplitSubmit() {
		let data = {};
		let addData = {};
		if (this.splitHeader == 'Inward') {
			data['inward'] = this.splitQtyForm.value.quantity;
			this.beforeChangeGodownData['inward'] = this.beforeChangeGodownData.inward - Number(this.splitQtyForm.value.quantity)
		} else {
			data['outward'] = this.splitQtyForm.value.quantity;
			this.beforeChangeGodownData['outward'] = this.beforeChangeGodownData.outward - Number(this.splitQtyForm.value.quantity)
		}

		data['record_id'] = this.beforeChangeGodownData.record_id;
		data['table_name'] = this.beforeChangeGodownData.table_name;
		addData = { ...this.beforeChangeGodownData }

		this.crudServices.updateData<any>(godownStock.splitQuantity, {
			data: data,
			addData: addData,
			id: this.beforeChangeGodownData.id
		}).subscribe(response => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				this.remarkModel.hide();
				this.remarkForm.reset();
				this.getData();
				this.calculate_redis_unosld()
			}
		});

	}
	onSubmit() {

		let data = {};
		data['godown_id'] = this.remarkForm.value.godown_id;
		data['record_id'] = this.beforeChangeGodownData.record_id;
		data['table_name'] = this.beforeChangeGodownData.table_name;
		console.log("data>>", data);
		this.crudServices.updateData<any>(godownStock.updateGodown, {
			data: data,
			id: this.beforeChangeGodownData.id
		}).subscribe(response => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				console.log("GODOWN CHANGE SUCCESS");
				this.remarkModel.hide();
				this.remarkForm.reset();
				this.getData();
				this.calculate_redis_unosld()
			}
		});
	}

	onSubmitGrade (){
		let data = {};
		data['grade_id'] = this.gradeForm.value.grade_id;
		data['record_id'] = this.beforeChangeGodownData.record_id;
		data['table_name'] = this.beforeChangeGodownData.table_name;
		this.crudServices.updateData<any>(godownStock.updateGrade, {
			data: data,
			id: this.beforeChangeGodownData.id
		}).subscribe(response => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				this.gradeModel.hide();
				this.gradeForm.reset();
				this.getData();
				this.calculate_redis_unosld()
			}
		});
	}
	// godownChange(data, type) {
	// 	console.log("Update Data >>", data);
	// 	this.remarkForm.reset();
	// 	if (type == 'add') {
	// 		this.remarkForm.patchValue({
	// 			remark: data.remark,
	// 			freightInward_id: data.id,
	// 			mis_id: data.remark_id,
	// 		});
	// 	}
	// 	else if (type == 'update') {
	// 		this.remarkForm.patchValue({
	// 			remark: data.remark,			
	// 			mis_id: data.id,
	// 		});
	// 	}

	// 	// console.log("DATA >>",this.remarkForm.dispatchBilling_id);	
	// 	this.remarkModel.show();
	// }
	calculate_redis_unosld() {
		this.crudServices.getRequest<any>(inventoryRedis.calculateUnsold).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
			}
		});
	}

	exportData(type) {
		let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.pdf_excell.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = this.pdf_excell[i][this.cols[j]["field"]];
					} else {
						obj[this.cols[j]["header"]] = this.pdf_excell[i][this.cols[j]["field"]];
					}
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["field"] == "order_quantity" || this.cols[j]["field"] == "dispatch_quantity") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
				} else if (this.cols[j]["field"] == "final_rate") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"];
				} else {
					foot[this.cols[j]["header"]] = "";
				}
			}
		}
		exportData.push(foot);
		if (type == 'Excel') {
			this.exportService.exportExcel(exportData, fileName);
		} else {
			let exportColumns = this.cols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}

	onDelete(data){
		console.log(data);
		this.crudServices.updateData<any>(godownStock.deleteOne, {
			data: data,
		}).subscribe(response => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getData();
				this.calculate_redis_unosld()
			}
		});
		
	}

}


