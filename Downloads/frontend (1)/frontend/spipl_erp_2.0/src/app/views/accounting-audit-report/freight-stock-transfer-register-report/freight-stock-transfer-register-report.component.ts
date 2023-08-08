import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { SalesReportsNew, StockTransfer,ReportRemark } from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";
// 


@Component({
	selector: 'app-freight-stock-transfer-register-report',
	templateUrl: './freight-stock-transfer-register-report.component.html',
	styleUrls: ['./freight-stock-transfer-register-report.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class FreightStockTransferRegisterReportComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('remarkModel', { static: false }) public remarkModel: ModalDirective;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;

	page_title: any = "Freight Stock Transfer Register Report";
	user: UserDetails;
	links: string[] = [];
	company_id: any = null;
	role_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	maxDate: any = new Date();
	datePickerConfig: any = staticValues.datePickerConfigNew;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	cols: any = [];
	data: any = [];
	filter: any = [];
	customer: any;
	update_bill_status: boolean = false;
	stockTransferForm: FormGroup;
	optionArr: any = [
		{ id: 0, name: 'Pending' },
		{ id: 1, name: 'Received' }
	];
	reports_name: any = staticValues.reports_name;
	remarkForm: any = FormGroup;
	misData: any = [];	
	

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
		this.update_bill_status = (this.links.find(x => x == 'update_bill_status') != null) ? true : false;

		this.stockTransferForm = new FormGroup({
			'customer': new FormControl(null),
			'trans_invoice_no': new FormControl(null),
			'lr_pending': new FormControl(null),
			'bill_status': new FormControl(null),
			'remark_account': new FormControl(null),
			'stockTransfer_id': new FormControl(null)
		});

	}

	ngOnInit() {
		this.getData();


		// Form for remarks
		this.remarkForm = new FormGroup({
			remark: new FormControl(null),
			stockTransferId: new FormControl(null),
			mis_id: new FormControl(null),
		})
	}

	
	clearDropdown(){		
		if(JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
		this.uploadSuccess.emit(false);
	}

  receiveDate(dateValue: any){
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
		
	}

	getData() {
		this.getCols();
		this.data = [];
		this.isLoading = true;
		let condition = {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
		}
		this.crudServices.getOne<any>(SalesReportsNew.freightStockTransferRegisterReport,condition).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					console.log("DATA 1 >>",res.data)
					this.data.forEach((item) => {
						item.Total_Amount = (item.total_amount + item.tlca);
						item.invoice_arr = (item.bill_copy != null) ? JSON.parse(item.bill_copy) : null;
						
						item.badge_show =(item.trans_invoice_no!=null)?true:false;
						item.badge=(item.trans_invoice_no!=null)? 'badge badge-danger':'';
						item.bill_status_value=(item.bill_status==0)?'Pending':'Received'
						item.lr_pending_value=(item.lr_pending==0)?'Pending':'Received'
					});
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
			{ field: 'id', header: 'ID', style: '100px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'customer', header: 'Customer', style: '100px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'party_state', header: 'Party State', style: '100px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'gst_no', header: 'GSTIN/UIN', style: '100px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'party_type', header: 'Party Type', style: '100px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'division_name', header: 'Division Name', style: '100px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'invoice_num', header: 'Sales Invoice No', style: '200px', sort: false, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'invoice_date', header: 'Invoice Date', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Date", oprations: null },
			{ field: 'depot', header: 'Depot', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			// { field: 'delivery_term', header: 'Delivery Term', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'truc_no', header: 'Truck No', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'quantity', header: 'Quantity', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'unit', header: 'Unit', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'lr_no', header: 'LR No', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'frt_rate', header: 'Freight Rate per MT', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
			{ field: 'freight_amount', header: 'Freight Amount', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
			{ field: 'total_load_or_cross_amount', header: 'Total Load/Cross Amount', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
			{ field: 'total_amount', header: 'Total Amount', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount", oprations: null },
			{ field: 'transporter_name', header: 'Transporter Name', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null, oprations: null },
			{ field: 'trans_invoice_no', header: 'Transport Invoice No.', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Edited_1", oprations: null },
			{ field: 'lr_pending_value', header: 'LR Pending', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Edited_1", oprations: null },
			{ field: 'bill_status_value', header: 'Bill Status', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Edited_1", oprations: null },
			{ field: 'remark_account', header: 'Remark-Accounts', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Edited_1", oprations: null },
			{ field: 'action', header: 'Action', style: '200px', sort: true, filter: false, footer: false, total: 0, type: null, oprations: null },
			{ field: 'remark', header: 'Auditor Remark', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "REMARK", oprations: null },
			{ field: 'added_at', header: 'Remark Time', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "created_at", oprations: null },

		];
		this.filter = ['invoice_date', 'invoice_no', 'sub_org_name', 'import_local_flag', 'division_name', 'sales_person_name', 'depot', 'party_state', 'gst_no', 'grade_name', 'category', 'rate'];
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
				if (item) {
					array.push({
					  value: item,
					  label: item
					});
				  }
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
					element.total = roundQuantity(total);
				}
				else {
					element.total = total;
				}
			}

		});
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		//this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	exportData(type) {
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
					} else {
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
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

	onAction(item, type) {
		
		if (type == "REMARK") {
			this.remark_add(item, "add");
		}
		else if (type == 'Edit_Remark') {
			console.log("EDIT REMARK >>", item.remark_id);
			this.getMisAuditReport(item.remark_id);
			//this.remark_add(this.misData, "update");
		}
	}

	getMisAuditReport(id) {
		this.crudServices.getOne<any>(ReportRemark.getOneReportRemark, {
			from_date: this.selected_date_range[0],
			to_date: this.selected_date_range[1],
			id: id,
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.misData = res.data[0];
					this.remark_add(this.misData, "update");
					console.log("MY REMARKS >>", this.misData);
				} else {
					this.toasterService.pop('error', 'Alert', 'No Data Found..!');
					// No Data Found - Toaster
				}
			}
			this.table.reset();
		});
	}

	remark_add(data, type) {
		// console.log("Update Data >>", data);
		this.remarkForm.reset();
		if (type == 'add') {
			console.log("AddRemark",data.id);
			
			this.remarkForm.patchValue({
				remark: data.remark,
				stockTransferId: data.id,
				mis_id: data.remark_id,
			});
			console.log("AddRemark1",this.remarkForm.value.stockTransferId);

		}
		else if (type == 'update') {
			console.log("UpdateRemark");
			this.remarkForm.patchValue({
				remark: data.remark,			
				mis_id: data.id,
			});
		}

		// console.log("DATA >>",this.remarkForm.dispatchBilling_id);	
		this.remarkModel.show();
	}


	oncloseModal() {
		this.stockTransferForm.reset();
		this.myModal.hide();
		this.remarkForm.reset();
		this.remarkModel.hide();
	}

	onSubmitRemark() {
		console.log("MY ID >>", this.remarkForm.value.mis_id);
		let id = this.remarkForm.value.mis_id;
		if (id != null) {
			let data = {
				remark: this.remarkForm.value.remark,
			};
			this.oncloseModal();
			let body = {
				data: data,
				id: id,
			};
			console.log("Update Mis >>", body);

			this.crudServices.postRequest<any>(ReportRemark.reportRemarkUpdate, body).subscribe((response) => {
				// console.log(response, "AMOL");
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.data, response.data);
					this.oncloseModal();
					this.getData();
				} else {
					this.toasterService.pop(response.message, response.data, response.data);
				}
			});
		}

		else {
			let data = {
				table_name: 'stock_transfer',
				table_primary_id: this.remarkForm.value.stockTransferId,
				report_remark: 4,
				remark: this.remarkForm.value.remark
			};
			// console.log("MYDATA >>",data);
			this.oncloseModal();
			let body = {
				data: data,
				id: null,

			};
			// console.log("Amol", data);
			this.crudServices.postRequest<any>(ReportRemark.reportRemarkAdd, body).subscribe((response) => {
				// console.log(response, "AMOL");
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.data, response.data);
					this.oncloseModal();
					this.getData();
				} else {
					this.toasterService.pop(response.message, response.data, response.data);
				}
			});
		}

	}

	// add function for forms
	onEdit(item) {
		// console.log(item, "AMOL");
		this.customer = item.customer;
		this.stockTransferForm.patchValue({
			trans_invoice_no: item.trans_invoice_no,
			lr_pending: item.lr_pending,
			bill_status: item.bill_status,
			remark_account: item.remark_account,
			stockTransfer_id: item['id']
		});
		this.myModal.show();
	}


	onSubmit() {

		// code for adding 4 field for related person
		let data = {
			trans_invoice_no: this.stockTransferForm.value.trans_invoice_no,
			lr_pending: this.stockTransferForm.value.lr_pending,
			bill_status: this.stockTransferForm.value.bill_status,
			remark_account: this.stockTransferForm.value.remark_account
		};
		let body = {
			data: data,
			id: this.stockTransferForm.value.stockTransfer_id
		};
		// console.log("Amol", data);
		this.crudServices.postRequest<any>(StockTransfer.updateBillStatus, body).subscribe((response) => {
			// console.log(response, "AMOL");
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.data, response.data);
				this.oncloseModal();
				this.getData();
			} else {
				this.toasterService.pop(response.message, response.data, response.data);
			}
		});
	}
}

