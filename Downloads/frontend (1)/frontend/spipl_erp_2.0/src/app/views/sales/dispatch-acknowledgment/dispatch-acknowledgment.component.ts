import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import {
	Consignments,
	Dispatch,
	DispatchBilling,
	DispatchPayments,
	EmailTemplateMaster,
	FileUpload,
	GodownMaster,
	LocalPurchase,
	Notifications,
	UsersNotification,
	PercentageDetails,
	SalesOrders,
	DispatchAcknowledgment
} from '../../../shared/apis-path/apis-path';
import { roundAmount, roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import { MessagingService } from '../../../service/messaging.service';
import { FileNamePipe } from '../../../shared/file-name/file-name.pipe';
import { forkJoin, Observable } from 'rxjs';
import { tap } from "rxjs/operators";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
@Component({
	selector: 'app-dispatch-acknowledgment',
	templateUrl: './dispatch-acknowledgment.component.html',
	styleUrls: ['./dispatch-acknowledgment.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService, FileNamePipe, Calculations]
})

export class DispatchAcknowledgmentComponent implements OnInit {

	@ViewChild("acknowledgmentModal", { static: false }) public acknowledgmentModal: ModalDirective;
	@ViewChild("viewDealModal", { static: false }) public viewDealModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Acknowledgment";
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to change Status?';
	popoverMessage3: string = 'Are you sure, you want to proceed for Payment?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'right';
	cancelClicked: boolean = false;

	user: UserDetails;
	links: string[] = [];
	role_id: any = null;
	company_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	isBtnLoading: boolean = false;
	customer_email_billing: boolean = false;
	company_wise_billing: boolean = false;
	max_date: any = new Date();
	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.billing_status;
	companyList: any = staticValues.company_list;
	selected_date_range: any = [
		new Date(moment().format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any
	selected_status: any = this.statusList[2];
	selected_company: any = null;
	cols: any = [];
	data: any = [];
	filter: any = [];
	acknowledgmentForm: FormGroup;

	fileData = new FormData();
	filesArr: Array<File> = [];

	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	zone_fcm = [];
	selectedDispatch: any;
	selected_deal: any;
	percent: any;
	add_edit: any = null;
	godown_list = [];

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
		private FileNamePipe: FileNamePipe,
		private calculations: Calculations,
		private http: HttpClient
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;

		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.del_opt = perms[3];
		// this.customer_email_billing=true;
		// this.customer_email_billing = (this.links.find(x => x == 'customer_email_billing') != null) ? true : false;
		// this.company_wise_billing = (this.links.find(x => x == 'company_wise_billing') != null) ? true : false;
		this.customer_email_billing = true;
		this.company_wise_billing = true;

		if (this.role_id == 1) {
			this.selected_company = this.companyList[0];
		} else {
			if (this.company_id == 2) {
				this.selected_company = this.companyList[2];
			} else {
				this.selected_company = this.companyList[1];
			}
		}
	}

	ngOnInit() {
		this.getGodownPersonId();
		this.getPercentValues();
		this.getCols();
		this.initForm();
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
	}

	getGodownPersonId() {
		this.crudServices.getOne<any>(GodownMaster.getAllGodownByUser, {
			user: ''
		}).subscribe(res => {
			if (res.length > 0) {
				this.godown_list = res;
			}
		});
	}

	getPercentValues() {
		this.crudServices.getOne<any>(PercentageDetails.getOne, {
			detail_type: 2
		}).subscribe(res => {
			this.percent = res;
		});
	}

	initForm() {
		this.acknowledgmentForm = new FormGroup({
			id: new FormControl(null),
			acknowledgment_no: new FormControl(null),
			acknowledgment_date: new FormControl(null),
			acknowledgment_copy: new FormControl(null),
		});
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		let company_id_new = null;

		if (this.company_wise_billing) {
			if (this.selected_company.id != 0) {
				company_id_new = this.selected_company.id;
			} else {
				company_id_new = null;
			}
		} else {
			company_id_new = null;
		}

		this.crudServices.getOne<any>(DispatchAcknowledgment.getUnbilledDispatches, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			company_id: company_id_new,
			emp_id: (this.role_id == 18) ? this.user.userDet[0].id : null
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.customer = element.customer + ' (' + element.location_vilage + ')';
					});
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
			{ field: "invoice_no", header: "Invoice No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "acknowledgment_no", header: "Acknowledgment No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "city", header: "City", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "godown_name", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "dispatch_quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "delivery_term", header: "Delivery Term", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "dispatch_date", header: "Dispatch Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "modified_by_name", header: "Approved By", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "modified_date", header: "Approved On", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
		];
		this.filter = ['customer', 'zone', 'godown_name', 'grade_name', 'invoice_no', 'acknowledgment_no'];
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
		// this.pushDropdown(this.data); 
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	closeModal() {
		this.viewDealModal.hide();
	}

	onAction(item, type) {
		this.selectedDispatch = item;
		if (type == 'View') {
			this.crudServices.getOne<any>(DispatchBilling.getDispatchDetails, {
				id: item.id
			}).subscribe(res => {
				if (res.code == '100') {
					if (res.data.length > 0) {
						let data = res.data[0];
						let base_amount = Number(data.final_rate) * (Number(data.quantity) + Number(data.logistic_power));
						data.total_freight_with_load_cross = roundAmount(Number(data.total_freight)) + roundAmount(Number(data.total_load_cross));
						let total_freight_with_load_cross = (data.delivery_term_id == 3) ? Number(data.total_freight_with_load_cross) : 0;
						let total_base = base_amount + total_freight_with_load_cross;
						let obj_gst = this.percent.find(o => o.percent_type === 'gst');
						let gst = obj_gst.percent_value;
						let gst_rate = Number(total_base) * (Number(gst) / 100);
						let base_with_gst = Number(total_base) + Number(gst_rate);
						let tds_rate = (Number(data.tds) > 0) ? Number(total_base) * (Number(data.tds) / 100) : 0;
						let tcs_rate = (Number(data.tcs) > 0) ? Number(base_with_gst) * (Number(data.tcs) / 100) : 0;
						let final_tds_tcs_rate = 0;
						if (tds_rate > 0) {
							final_tds_tcs_rate = roundAmount(tds_rate);
							data.tds_tcs_label = "TDS";
						} else if (tcs_rate > 0) {
							final_tds_tcs_rate = roundAmount(tcs_rate);
							data.tds_tcs_label = "TCS";
						} else {
							final_tds_tcs_rate = 0;
							data.tds_tcs_label = "TDS/TCS";
						}
						let invoice_value = base_with_gst - tds_rate;
						invoice_value = invoice_value + tcs_rate;
						data.gst_amount = roundAmount(gst_rate);
						data.tds_tcs_amount = roundAmount(final_tds_tcs_rate);
						data.total_amount_without_tds = roundAmount(base_with_gst);
						data.e_way_status = (data.is_eway_bill == 1) ? "Yes" : "No";
						data.supplier = (data.company_id == 3) ? "SURISHA (A DIVISION OF SUSHILA PARMAR INTERNATIONAL PVT LTD)" : "Sushila Parmar International Private Limited";
						data.status_name = (data.status == 1) ? "Complete" : "Pending";
						data.total_quantity = roundQuantity(Number(data.quantity) + Number(data.logistic_power));

						if (data.transporter == "Other" || data.transporter == null) {
							data.transporter_gst_no = data.temp_gst_no;
						}
						this.selected_deal = data;
						this.viewDealModal.show();
					}
				}
			});
		} else if (type == 'Download_Invoice') {
			let invoice_arr = JSON.parse(item);
			this.crudServices.downloadMultipleFiles(invoice_arr);
		}
		else if (type == 'Edit_Acknowledgment') {
			this.acknowledgmentForm.reset();
			this.acknowledgmentForm.patchValue({
				id: item.invoice_id,
				acknowledgment_no: item.acknowledgment_no,
				acknowledgment_date: item.acknowledgment_date,
			});
			this.acknowledgmentModal.show();
		}
	}

	onFileChange(e) {
		this.filesArr = <Array<File>>e.target.files;
	}

	submitAcknowledgmentForm() {
		this.isBtnLoading = true;
		let body = { data: {}, id: `` };
		let data = {
			acknowledgment_no: this.acknowledgmentForm.value.acknowledgment_no,
			acknowledgment_date: moment(this.acknowledgmentForm.value.acknowledgment_date).format("YYYY-MM-DD"),
		}

		body = {
			data: data,
			id: this.acknowledgmentForm.value.id
		};

		if (this.filesArr.length > 0) {
			let fileData: any = new FormData();
			const files: Array<File> = this.filesArr;

			for (let i = 0; i < files.length; i++) {
				fileData.append('sales_acknowledgment', files[i], files[i]['name']);
			}
			this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res_aws => {
				if (res_aws != null) {
					let acknowledgment_copies = [];
					res_aws.uploads["sales_acknowledgment"].forEach(element => {
						acknowledgment_copies.push(element.location);
					});

					data['acknowledgment_copy'] = JSON.stringify(acknowledgment_copies)



					this.crudServices.updateData<any>(DispatchAcknowledgment.update, body).subscribe(res => {
						if (res.code === '100') {
							this.toasterService.pop('success', 'Success', "Acknowledgment Updated Successfully");
							this.acknowledgmentForm.reset();
							this.acknowledgmentModal.hide();
							this.isBtnLoading = false;
							this.getCols();
						} else {
							this.toasterService.pop('error', 'Alert', "Acknowledgment Already Exist");
							this.acknowledgmentForm.reset();
							this.acknowledgmentModal.hide();
							this.isBtnLoading = false;
						}
					});

				} else {
					this.toasterService.pop('error', 'Error', "Acknowledgment Details Uploading Failed");
				}
			});
		}

		this.crudServices.updateData<any>(DispatchAcknowledgment.update, body).subscribe(res => {
			if (res.code === '100') {
				this.toasterService.pop('success', 'Success', "Acknowledgment Updated Successfully");
				this.acknowledgmentForm.reset();
				this.acknowledgmentModal.hide();
				this.isBtnLoading = false;
				this.getCols();
			} else {
				this.toasterService.pop('error', 'Alert', "Acknowledgment Already Exist");
				this.acknowledgmentForm.reset();
				this.acknowledgmentModal.hide();
				this.isBtnLoading = false;
			}
		});

		this.getData();

	}

	exportData(type) {
		let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
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
				} else if (this.cols[j]["field"] == "final_rate" ||
					this.cols[j]["field"] == "freight_rate") {
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

	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				name: e.value.name
			};
			this.getCols();
		}
	}

	onChangeCompany(e) {
		if (e != null && e != undefined) {
			this.selected_company = {
				id: e.value.id,
				name: e.value.name
			};
			this.getCols();
		}
	}

}

