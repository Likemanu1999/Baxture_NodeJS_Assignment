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
import { AdminControl, EmailTemplateMaster, MonthlySalary, MonthlySalaryNew, PlastIndia, SalesReturn, ValueStore } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";

@Component({
	selector: 'app-salary-sheet-new',
	templateUrl: './salary-sheet-new.component.html',
	styleUrls: ['./salary-sheet-new.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class SalarySheetNewComponent implements OnInit {

	@ViewChild("viewDetailsModal", { static: false }) public viewDetailsModal: ModalDirective;
	@ViewChild("dt1", { static: false }) table1: Table;
	@ViewChild("dt2", { static: false }) table2: Table;
	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});
	page_title: any = "Salary Sheet";
	monthPickerConfig: any = staticValues.monthPickerConfig;
	selected_month: any = moment().format("MMM-YYYY");
	selected_month_sheet: any = moment().format("MMM-YYYY");
	statusList: any = staticValues.yes_no_status;
	selected_status: any = this.statusList[2];
	selected_tab: any = 0;
	minDate: any = new Date("2021-08-01");
	maxDate: any = new Date();
	user: UserDetails;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	cols1: any = [];
	cols2: any = [];
	data1: any = [];
	data2: any = [];
	filter: any = [];
	bank_email: any = null;
	bank_acc_no: any = null;
	verify_salary_bank_mail: any = null;
	email_body: any = null;
	subject: any = null;
	footer: any = null;

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
		this.getEmailTemplate();
		this.getBankDetails();
		this.getCols();
	}

	getEmailTemplate() {
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, {
			template_name: 'Salary Sheet'
		}).subscribe(response => {
			this.email_body = response[0].custom_html;
			this.subject = response[0].subject;

			this.crudServices.getOne<any>(EmailTemplateMaster.getOne, {
				template_name: 'Footer'
			}).subscribe(response => {
				this.footer = response[0].custom_html;
			});
		});
	}

	getBankDetails() {
		this.crudServices.getAll<any>(ValueStore.getAll).subscribe(res => {
			if (res.length > 0) {
				res.forEach(element => {
					if (element.thekey == 'salary_bank_email') {
						this.bank_email = element.value;
					}
					if (element.thekey == 'salary_bank_acc_no') {
						this.bank_acc_no = element.value;
					}
					if (element.thekey == 'verify_salary_bank_mail') {
						this.verify_salary_bank_mail = element.value;
					}
				});
			}
		})
	}

	getCols() {
		this.cols1 = [
			{ field: "index", header: "Product Code", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "salary_bank_account_no", header: "Debit Account Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "emp_name", header: "Beneficiary Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "net_salary", header: "Instrument Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "ifsc_code", header: "Beneficiary Bank IFSC Code", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "bank_account_no", header: "Beneficiary Account Number", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
		];
		this.cols2 = [
			{ field: "serial_no", header: "4 Digit Serial No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "salary_bank_account_no", header: "14 Digit Debit Account No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "net_salary", header: "Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "ifsc_code", header: "11 Digit IFSC Code", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "bank_account_no", header: "Beneficiary Account No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "emp_name", header: "Name of Beneficiary", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "acc_type_name", header: "Type of Beneficiary Account (SB/CA)", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
		];
		this.filter = ['bank_account_no', 'ifsc_code', 'bank_account_no', 'emp_name'];
		this.getData();
	}

	getData() {
		this.data1 = [];
		this.data2 = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(MonthlySalaryNew.getMonthlySalaryNew, {
			month: moment(this.selected_month).format('MM'),
			year: moment(this.selected_month).format('YYYY'),
			status: this.selected_status.id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code === '100') {
				this.data1 = res.data.filter(item => item.bank_id == 1 && Number(item.net_salary) > 0);
				this.data1.map((x, index) => {
					x.index = (index + 1);
					x.salary_bank_account_no = this.bank_acc_no;
				});
				this.footerTotal(this.data1, 0);

				this.data2 = res.data.filter(item => item.bank_id != 1 && Number(item.net_salary) > 0);
				this.data2.map((x, index) => {
					x.serial_no = (index + 1).toString().padStart(4, "0");
					x.salary_bank_account_no = this.bank_acc_no;
				});
				this.footerTotal(this.data2, 1);
			} else {
				this.toasterService.pop('error', 'error', 'Something Went Wrong')
			}
			if (this.table1 != null && this.table1 != undefined) {
				this.table1.reset();
			}
			if (this.table2 != null && this.table2 != undefined) {
				this.table2.reset();
			}
		});
	}

	footerTotal(arg, tab) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = (tab == 1) ? this.data2 : this.data1;
		}
		let cols = (tab == 1) ? this.cols2 : this.cols1;
		let filter_cols = cols.filter(col => col.footer == true);
		filter_cols.forEach(element => {
			if (data.length > 0) {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
			}
		});
	}

	customFilter(value, col, data) {
		let table = (this.selected_tab == 1) ? this.table2 : this.table1;
		let res = table.filter(value, col, data);
		let final_data = (this.selected_tab == 1) ? this.data2 : this.data1;
		this.footerTotal(final_data, this.selected_tab);
	}

	onFilter(e, dt) {
		this.footerTotal(dt.filteredValue, this.selected_tab);
	}

	onAction(rowData, type, event) {
		if (type == 'Verify_Mail') {
			this.verifyMail();
		}
		if (type == 'Send_Mail_To_BOB') {
			this.sendMailToBob();
		}
		if (type == 'WhatsApp') {
			this.whatsApp();
		}
	}

	onTabChange(event) {
		this.selected_tab = event.index;
		this.getCols();
	}

	onChangeStatus(event) {
		if (event != null && event != undefined) {
			this.selected_status = {
				id: event.value.id,
				name: event.value.name
			};
			this.getCols();
		}
	}

	onOpenCalendar(container) {
		container.monthSelectHandler = (event: any): void => {
			container._store.dispatch(container._actions.select(event.date));
		};
		container.setViewMode('month');
	}

	exportData(type) {
		let fileName = this.page_title + ' (' + moment(this.selected_month).format("MMM-YYYY") + ')';
		let final_data = null;
		let final_cols = null;
		if (this.selected_tab == 0) {
			final_cols = this.cols1;
			final_data = (this.table1.filteredValue == null) ? this.data1 : this.table1.filteredValue;
		}
		if (this.selected_tab == 1) {
			final_cols = this.cols2;
			final_data = (this.table2.filteredValue == null) ? this.data2 : this.table2.filteredValue;
		}
		let exportData = [];
		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < final_cols.length; j++) {
				obj[final_cols[j]["header"]] = final_data[i][final_cols[j]["field"]];
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < final_cols.length; j++) {
			if (final_cols[j]["field"] == "net_salary") {
				foot[final_cols[j]["header"]] = final_cols[j]["total"];
			} else {
				foot[final_cols[j]["header"]] = "";
			}
		}
		exportData.push(foot);
		if (type == 'Excel') {
			this.exportService.exportExcel(exportData, fileName);
		} else {
			let exportColumns = final_cols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}

	verifyMail() {
		if (confirm("Send Verification Mail")) {
			let fileName = this.page_title + ' (' + moment(this.selected_month).format("MMM-YYYY") + ')';
			const re = /{MONTH_YEAR}/gi;
			this.subject = this.subject.replace(re, moment(this.selected_month).format('MMM-YYYY'));
			this.email_body = this.email_body.replace(re, moment(this.selected_month).format('MMM-YYYY'));
			let Htmldata = this.email_body + this.footer;

			// TABLE 1
			let exportData1 = [];
			let table1 = (this.table1.filteredValue == null) ? this.data1 : this.table1.filteredValue;
			for (let i = 0; i < table1.length; i++) {
				let obj = {};
				for (let j = 0; j < this.cols1.length; j++) {
					obj[this.cols1[j]["header"]] = table1[i][this.cols1[j]["field"]];
				}
				exportData1.push(obj);
			}
			let foot1 = {};
			for (let j = 0; j < this.cols1.length; j++) {
				if (this.cols1[j]["field"] == "net_salary") {
					foot1[this.cols1[j]["header"]] = this.cols1[j]["total"];
				} else {
					foot1[this.cols1[j]["header"]] = "";
				}
			}
			exportData1.push(foot1);

			// TABLE 2
			let exportData2 = [];
			let table2 = (this.table2.filteredValue == null) ? this.data2 : this.table2.filteredValue;
			for (let i = 0; i < table2.length; i++) {
				let obj = {};
				for (let j = 0; j < this.cols2.length; j++) {
					if (this.cols2[j]["field"] == "net_salary") {
						obj[this.cols2[j]["header"]] = table2[i][this.cols2[j]["field"]].toFixed(2);
					} else {
						obj[this.cols2[j]["header"]] = table2[i][this.cols2[j]["field"]];
					}
				}
				exportData2.push(obj);
			}
			let foot2 = {};
			for (let j = 0; j < this.cols2.length; j++) {
				if (this.cols2[j]["field"] == "net_salary") {
					foot2[this.cols2[j]["header"]] = this.cols2[j]["total"].toFixed(2);
				} else {
					foot2[this.cols2[j]["header"]] = "";
				}
			}
			exportData2.push(foot2);

			let header1 = this.cols1.map(
				obj => {
					return {
						"header": obj.header,
						"key": obj.field,
					}
				}
			);

			let header2 = this.cols2.map(
				obj => {
					return {
						"header": obj.header,
						"key": obj.field
					}
				}
			);

			let post_data = {
				list1: exportData1,
				list2: exportData2,
				header1: header1,
				header2: header2,
				tomail: this.verify_salary_bank_mail,
				subject: this.subject,
				bodytext: Htmldata,
				file_name: fileName
			};
			this.isLoading = true;
			this.crudServices.postRequest<any>(MonthlySalary.salarySheetMail, post_data).subscribe(res => {
				this.isLoading = false;
				this.toasterService.pop(res.message, res.message, res.data);
			});
		}
	}

	sendMailToBob() {
		if (confirm("Send Mail To BOB")) {
			// 
		}
	}

	whatsApp() {
		if (confirm("Send WhatsApp")) {
			// 
		}
	}

}
