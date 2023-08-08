import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { SalesReportsNew, ReportRemark } from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";

@Component({
	selector: 'app-sales-register-report',
	templateUrl: './sales-register-report.component.html',
	styleUrls: ['./sales-register-report.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class SalesRegisterReportComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild('remarkModel', { static: false }) public remarkModel: ModalDirective;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	page_title: any = "Sales Register Report";
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
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	cols: any = [];
	data: any = [];
	misData: any = [];
	filter: any = [];
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;

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

	}

	ngOnInit() {
		this.getData();

		// Form for remarks
		this.remarkForm = new FormGroup({
			remark: new FormControl(null),
			dispatchBilling_id: new FormControl(null),
			mis_id: new FormControl(null),
		})
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}

	getData() {
		let condition = {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")
		}
		this.getCols();
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SalesReportsNew.salesRegisterReport, condition).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					console.log("MY REMARKS >>", this.data);

					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				} else {
					this.toasterService.pop('error', 'Alert', 'No Data Found..!');
					// No Data Found - Toaster
				}
			}
			this.table.reset();
		});

	}

	onSelect(event, mode) {
	}

	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}

	getCols() {
		this.cols = [
			{ field: 'id', header: 'ID', style: '100px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'invoice_date', header: 'Invoice Date', style: '300px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: 'invoice_no', header: 'Invoice No', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "INV" },
			{ field: 'sub_org_name', header: 'Organization', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: 'import_local_flag', header: 'Party Type', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: 'division_name', header: 'Division', style: '200px', sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: 'sales_person_name', header: 'Zone', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'depot', header: 'Depot', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'party_state', header: 'Party State', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'truck_no', header: 'Truck No', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'lr_no', header: 'LR Number', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'term', header: 'Delivery Term', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'transporter', header: 'Transporter', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'gst_no', header: 'GSTIN/UIN', style: '200px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'grade_name', header: 'Grade', style: '200px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'category', header: 'Category', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: 'quantity', header: 'Quantity', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: 'unit_type', header: 'Unit', style: '200px', sort: false, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: 'freight_rate', header: 'Freight Rate', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Avg" },
			{ field: 'rate', header: 'Rate', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Avg" },
			{ field: 'base_amount', header: 'Basic Amount', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: 'total_amount', header: 'Total Amount', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: 'remark', header: 'Auditor Remark', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "REMARK" },
			{ field: 'added_at', header: 'Remark Time', style: '200px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "created_at" },

		];
		this.filter = ['invoice_date', 'invoice_no', 'sub_org_name', 'import_local_flag', 'division_name', 'sales_person_name', 'depot', 'party_state', 'gst_no', 'grade_name', 'category', 'rate'];
		this.pushDropdown(this.data);
		this.footerTotal(this.data);
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
		// this.pushDropdown(dt.filteredValue);
		this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}


	onAction(item, type) {
		if (type == 'View') {
			console.log(item, "VIEW-DATA");
		}
		if (type == 'Download') {
			window.open(item.so_copy, "_blank");
		}
		if (type == "REMARK") {
			this.remark_add(item, "add");
		}
		if (type == 'Edit_Remark') {
			console.log("EDIT REMARK >>", item.remark_id);
			this.getMisAuditReport(item.remark_id);
			//this.remark_add(this.misData, "update");
		}
		if (type == 'Download_Invoice') {
			let invoice_arr = JSON.parse(item);
			this.crudServices.downloadMultipleFiles(invoice_arr);
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
		console.log("Update Data >>", data);
		this.remarkForm.reset();
		if (type == 'add') {
			this.remarkForm.patchValue({
				remark: data.remark,
				dispatchBilling_id: data.id,
				mis_id: data.remark_id,
			});
		}
		else if (type == 'update') {
			this.remarkForm.patchValue({
				remark: data.remark,

				mis_id: data.id,
			});
		}

		// console.log("DATA >>",this.remarkForm.dispatchBilling_id);	
		this.remarkModel.show();
	}


	oncloseModal() {
		this.remarkForm.reset();
		this.remarkModel.hide();
	}

	onSubmit() {
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
				table_name: 'dispatch_billing',
				table_primary_id: this.remarkForm.value.dispatchBilling_id,
				report_remark: 1,
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

}
