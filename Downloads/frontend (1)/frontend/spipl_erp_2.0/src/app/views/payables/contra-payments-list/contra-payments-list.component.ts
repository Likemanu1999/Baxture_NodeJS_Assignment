import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";
import { EmailTemplateMaster, LocalPurchase, Payables, SpiplBankMaster, OrganizationBank, SubOrg } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-contra-payments-list',
	templateUrl: './contra-payments-list.component.html',
	styleUrls: ['./contra-payments-list.component.scss'],
	providers: [DatePipe, ExportService, PermissionService, LoginService, CrudServices, ToasterService],
	encapsulation: ViewEncapsulation.None
})

export class ContraPaymentsListComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Contra Payments List";
	popoverTitle: string = 'Warning';
	popoverMessage: string = 'Are you sure you want to Change Status?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;

	user: UserDetails;
	links: string[] = [];
	company_id: any = null;
	category: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	mail_send: boolean = false;
	whatsap_send: boolean = false;
	complete_list: boolean = false;
	delete_payable: boolean = false;
	update_discount_status: boolean = false;
	fromdate: string;
	todate: string;
	totalPaidAmt: number;
	contraPaymentList: any[];
	isLoading: boolean = false;
	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.dispatch_report_status;
	selected_from_bank: any = null;
	selected_to_bank: any = null;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	selected_status: any = this.statusList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];
	spipl_bank_list: any = [];

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private datePipe: DatePipe,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.company_id = this.user.userDet[0].company_id;
		this.update_discount_status = (this.links.find(x => x == 'update_discount_status') != null) ? true : false;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.mail_send = (this.links.indexOf('Payment Details Mail') > -1);
		this.whatsap_send = (this.links.indexOf('Payment Details Whatsapp') > -1);
		this.complete_list = (this.links.indexOf('Past Payment Complete List') > -1);
		this.delete_payable = (this.links.indexOf('Past Payment Delete') > -1);
	}

	ngOnInit() {
		this.getFilterDropdowns();
		this.getCols();
	}
	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}
	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}

	getFilterDropdowns() {
		this.crudServices.getAll<any>(SpiplBankMaster.getAll).subscribe(res => {
			this.spipl_bank_list = res.map(x => {
				let element = {};
				element['id'] = x.id;
				element['bank_name'] = x.bank_name;
				return element;
			});
			let obj = {
				id: null,
				bank_name: "From Bank"
			};
			this.spipl_bank_list.unshift(obj);
			this.selected_from_bank = obj;
			this.selected_to_bank = obj;
		});
	}



	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(Payables.contraPaymentList, {
			paid_date_from: this.selected_date_range[0],
			paid_date_to: moment(this.selected_date_range[1]).add(1, 'days').format("YYYY-MM-DD"),
			listType: (!this.complete_list) ? 1 : 0,
			company_id: this.company_id,
			from_bank_id: (this.selected_from_bank != null) ? this.selected_from_bank.id : null,
			to_bank_id: (this.selected_to_bank != null) ? this.selected_to_bank.id : null
		}).subscribe(res => {

			this.isLoading = false;
			if (res.length > 0) {
				res.forEach((item) => {
					item.payment = (item.advanced_agnst_bill == 1) ? "NEFT" : "RTGS";
					item.priority = (item.normal_priority == 1) ? "Normal" : "High";
				})
				this.data = res;
				this.pushDropdown(this.data);
				this.footerTotal(this.data);
			}
		});
	}


	getCols() {
		this.cols = [
			{ field: 'id', header: 'ID', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			// { field: 'category', header: 'Category.', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'org_emp_name', header: 'Beneficiary', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'spiplbank', header: 'From Bank', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'tobank', header: 'To Bank', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'paid_amount', header: 'Paid Amount', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Amount' },
			{ field: 'paid_date', header: 'Paid Date', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'Date' },
			{ field: 'added_by_name', header: 'Request By', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'added_date', header: 'Added Date', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'approved_by_name', header: 'Approve By', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'approved_date', header: 'Approve Date', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'utr_no', header: 'UTR No', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			// { field: 'proceed_date', header: 'Proceed Date', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'payment', header: 'Payment Type', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'priority', header: 'Priority', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			// { field: 'beneficiary_bank_name', header: 'Beneficiary Bank Name', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			// { field: 'beneficiary_account_no', header: 'Beneficiary Account Number', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			// { field: 'beneficiary_bank_ifsc', header: 'Beneficiary Bank IFSC', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'cheque_no', header: 'Cheque No', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'remark', header: 'Remark', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'ref_no', header: 'Reference No', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: 'neft_rtgs', header: 'NEFT/RTGS', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
		];
		this.filter = ['org_emp_name'];
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

	onAction(item, type) {
		if (type == 'View') {
			// 
		}
		if (type == 'from_bank') {
			if (item != null && item != undefined) {
				this.selected_from_bank = {
					id: item.value.id,
					bank_name: item.value.bank_name
				};
				this.getData();
			}
		}
		if (type == 'to_bank') {
			if (item != null && item != undefined) {
				this.selected_to_bank = {
					id: item.value.id,
					bank_name: item.value.bank_name
				};
				this.getData();
			}
		}
	}

	closeModal() {
		this.getCols();
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

	getContraPaymentList() {
		this.isLoading = true;
		this.totalPaidAmt = 0;
		let listType = 0;

		if (this.complete_list == false) {
			listType = 1;
		}
		this.crudServices.getOne<any>(Payables.contraPaymentList, {
			paid_date_from: this.fromdate,
			paid_date_to: this.todate,
			listType: listType,
			company_id: this.company_id
		}).subscribe(response => {

			this.isLoading = false;

			if (response.length) {

				this.contraPaymentList = response.map(item => {
					item.categoryName = item.category
					item.category = item.category + ' (' + item.record_id + ') ';
					item.added_date = this.datePipe.transform(item.added_date, 'dd-MM-yyyy')
					item.approved_date = this.datePipe.transform(item.approved_date, 'dd-MM-yyyy')
					item.proceed_date = this.datePipe.transform(item.proceed_date, 'dd-MM-yyyy')
					item.paid_date = this.datePipe.transform(item.paid_date, 'dd-MM-yyyy')
					item.normal_priority = this.getPriorityText(item.normal_priority)
					item.neft_rtgs = this.getNeftRtgsText(item.neft_rtgs)
					item.advanced_agnst_bill = this.getRequestText(item.advanced_agnst_bill)
					return item

				});
			}
		});
	}
	getRequestText(val) {
		if (val === 1) {
			return 'Advanced';
		} else if (val === 2) {
			return 'Against Bill';
		}
	}
	getPriorityText(val) {
		if (val === 1) {
			return 'Normal';
		} else if (val === 2) {
			return 'High';
		}
	}

	getNeftRtgsText(val) {
		if (val === 1) {
			return 'NEFT';
		} else if (val === 2) {
			return 'RTGS';
		}
	}

}