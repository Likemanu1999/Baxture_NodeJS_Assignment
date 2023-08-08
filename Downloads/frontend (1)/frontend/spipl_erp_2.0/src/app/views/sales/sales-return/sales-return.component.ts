import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues, roundQuantity } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { SalesReturn } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
@Component({
	selector: 'app-sales-return',
	templateUrl: './sales-return.component.html',
	styleUrls: ['./sales-return.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class SalesReturnComponent implements OnInit {

	@ViewChild("invoiceModal", { static: false }) public invoiceModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild("updateModel",{static:false}) public updateModel: ModalDirective;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Sales Return";
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'right';
	cancelClicked: boolean = false;

	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	max_date: any = new Date();
	add_edit: any = null;
	isRange: any
	isQunaitytExceed: boolean = false;

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.billing_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().add(1, 'days').format("YYYY-MM-DD"))
	];

	selected_status: any = this.statusList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];
	invoiceForm: FormGroup;
	updateSalesReturn:FormGroup;
	fileData = new FormData();
	salesReturnObj: any;
	actualQuantity: any;

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		this.getCols();
		this.initForm();
	}

	initForm() {
		this.invoiceForm = new FormGroup({
			credit_note_number: new FormControl(null, Validators.required),

		});
		this.updateSalesReturn = new FormGroup({
			quantity: new FormControl(null, Validators.required),
			quantity_remark : new FormControl(null, Validators.required)
		});
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SalesReturn.getSalesReturns, {
			from_date: this.selected_date_range[0],
			to_date: moment(this.selected_date_range[1]).add(1, 'days').format("YYYY-MM-DD"),
			status: this.selected_status.id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}
		});
	}

	getCols() {
		this.cols = [
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "invoice_date", header: "Invoice Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "invoice_no", header: "Invoice No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "return_quantity", header: "Return Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "transport_charges", header: "Transport Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "remark", header: "Remark", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "transporter", header: "Transporter", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "truck_no", header: "Truck No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "lr_no", header: "LR No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "credit_note_number", header: "Credit Note Number", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['customer', 'zone', 'invoice_no', 'grade_name', 'transporter', 'truck_no', 'lr_no'];
		this.getData();
	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
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
				element.total = (element.type == "Quantity") ? roundQuantity(total) : total;
			}

		});
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		this.pushDropdown(this.data);
		// this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	Update() {
		this.crudServices.updateData(SalesReturn.update, { id: this.salesReturnObj.id, quantity: this.updateSalesReturn.value.quantity, quantity_remark: this.updateSalesReturn.value.quantity_remark }).subscribe(res => {
			this.isLoading = false; 
			if (res['code'] == '100') {
				this.toasterService.pop('success', 'Success', 'Updated Successfully.!');
				this.updateModel.hide();
				this.getData();
			} else {
				this.updateModel.hide();
				this.toasterService.pop('error', 'Failed', 'Failed');
			}
		});
		this.updateSalesReturn.reset();
	}

	onAction(item, type) {
		if (type == 'View') {

		} 
		else if (type == 'credit_note') {
			this.add_edit = "Add";
			this.salesReturnObj = item
			this.invoiceForm.patchValue({
				credit_note_number: item.credit_note_number,
			});
			this.invoiceModal.show();
		}else if(type == 'Edit'){
			this.isQunaitytExceed = false;
			this.salesReturnObj = item;
			this.actualQuantity = item.quantity;
			this.updateSalesReturn.patchValue({
				quantity: item.return_quantity,
			});
			this.updateModel.show();
		}else if(type == 'Delete'){
				this.isLoading = true;
					this.crudServices.deleteData(SalesReturn.delete, {
						id: item.id
					}).subscribe(res => {
						if (res['code'] == '100') {
							this.isLoading = false;
							this.toasterService.pop('success', 'Success', 'Order Deleted');
							this.getData();
						} else {
							this.isLoading = false;
							this.toasterService.pop('error', 'Alert', 'Order Cannot Be Deleted');
						}
					});
		}
	}

	checkLimit(){
		const enteredValue = this.updateSalesReturn.controls.quantity.value;
		if(enteredValue > this.actualQuantity){
			this.isQunaitytExceed = true;
			this.updateSalesReturn.controls.quantity.patchValue(null);
		}else{
			this.isQunaitytExceed = false;
		}
	}
	submitinvoiceForm() {
		let data = {
			credit_note_number: this.invoiceForm.value.credit_note_number,
			grade_id: this.salesReturnObj.grade_id,
			godown_id: this.salesReturnObj.godown_id,
			sub_org_id: this.salesReturnObj.sub_org_id,
			import_local_flag: this.salesReturnObj.import_local_flag,
			date: this.salesReturnObj.return_date,
			quantity: this.salesReturnObj.return_quantity,
			surisha_stock_flag: this.salesReturnObj.deal_type == 3 ? this.salesReturnObj.deal_type : 0,
			id: this.salesReturnObj.id,
			status: 1
		};

		this.crudServices.addData<any>(SalesReturn.addCreditNote, data).subscribe(res => {
			if (res.code === '100') {
				this.toasterService.pop('success', 'Success', "Data Updated");
				this.invoiceForm.reset();
				this.invoiceModal.hide();
				this.getCols();
			}
		});
	}

	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				name: e.value.name
			};
			this.getData();
		}
	}

	exportData(type) {
		let fileName = this.selected_status.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]] + " MT";
					} else {
						obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
					}
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["field"] == "quantity") {
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


}
