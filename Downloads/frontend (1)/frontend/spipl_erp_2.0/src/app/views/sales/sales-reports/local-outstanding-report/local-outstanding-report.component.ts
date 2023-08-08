import { pdfMake } from 'pdfmake/build/pdfmake';
import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from "primeng/table";
import { FileUpload, LocalPurchase, SalesReportsNew } from '../../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { ExportService } from '../../../../shared/export-service/export-service';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../../login/login.service';
import { UserDetails } from '../../../login/UserDetails.model';
@Component({
	selector: 'app-local-outstanding-report',
	templateUrl: './local-outstanding-report.component.html',
	styleUrls: ['./local-outstanding-report.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService, LoginService, CurrencyPipe],

})
export class LocalOutstandingReportComponent implements OnInit {

	@ViewChild("partyWiseReportModal", { static: false }) public partyWiseReportModal: ModalDirective;

	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild("dt2", { static: false }) table2: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Finance Report";
	popoverTitle: string = 'Warning';
	popoverMessage: string = 'Are you sure, you want to send message?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';

	cancelClicked: boolean = false;
	user: UserDetails;
	role_id: any = null;
	company_id: any = null;
	selectedZone: any = null;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	delete_opt: boolean = false;
	isLoading: boolean = false;
	showModal: boolean = false;
	selected_tab: any = 0;

	tab_1_title = "";

	cols: any = [];
	data: any = [];
	filter: any = [];
	cols2: any = [];
	data2: any = [];
	filter2: any = [];
	fileData: FormData = new FormData();
	isLocal: boolean = false;
	isImoport: boolean = false;
	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private currencyPipe: CurrencyPipe
	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;
		this.isLocal = (this.links.indexOf('local_outstanding_link') > -1);
		this.isImoport = (this.links.indexOf('import_outstanding_link') > -1);

		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33) {
			this.selectedZone = this.user.userDet[0].id;
		}
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.delete_opt = perms[3];
	}

	ngOnInit() {
		this.getCols(null);
	}

	getOutstandingReport() {
		this.data = [];
		this.isLoading = true;
		let import_local_flag = 0;
		if (this.isLocal) {
			this.tab_1_title = `Group Outstanding Local Report`
			import_local_flag = 2
		} else if (this.isImoport) {
			this.tab_1_title = `Group Outstanding Import Report`
			import_local_flag = 1
		} else {
			this.tab_1_title = `Group Outstanding  Report`
			import_local_flag = 0
		}
		this.crudServices.getOne<any>(SalesReportsNew.getGroupOutstandingReportBycategory, {
			import_local_flag: import_local_flag
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown();
					this.footerTotal();
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}
		});
	}

	getCreditLimitReport() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SalesReportsNew.getCreditLimitReport, {
			zone_id: this.selectedZone,
			deleted: 0
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown();
					this.footerTotal();
				}
			}
			if (this.table != null && this.table != undefined) {
				this.table.reset();
			}
		});
	}

	getPartyWiseOutstandingReport(sub_org_id) {
		this.data2 = [];
		this.isLoading = true;
		let import_local_flag = 0;

		if (this.isLocal && this.isImoport == false) {
			this.tab_1_title = `Group Outstanding Local Report`
			import_local_flag = 2
		} else if (this.isImoport && this.isLocal == false) {
			this.tab_1_title = `Group Outstanding Import Report`
			import_local_flag = 1
		}
		else {
			this.tab_1_title = `Group Outstanding  Report`
			import_local_flag = 0
		}
		this.crudServices.getOne<any>(SalesReportsNew.getPartyWiseOutstandingReport, {
			sub_org_id: sub_org_id,
			import_local_flag: import_local_flag
		})
			.subscribe(res => {
				this.isLoading = false;
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.data2 = res.data;
						this.pushDropdown();
						this.footerTotal();
					}
				}
				if (this.table2 != null && this.table2 != undefined) {
					this.table2.reset();
				}
			});
	}

	getCols(value) {
		if (this.showModal) {
			this.cols2 = [
				{ field: "id", header: "#", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "invoice_date", header: "Invoice Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
				{ field: "invoice_no", header: "Invoice No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "opening_amount", header: "Opening Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "pending_amount", header: "Pending Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "payment_due_date", header: "Due Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
				{ field: "overdue_by_days", header: "Overdue By Days", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null }
			];
			this.filter2 = ['invoice_no'];
			this.getPartyWiseOutstandingReport(value);
		} else {
			if (this.selected_tab == 0) {
				this.cols = [
					{ field: "sub_org_id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
					{ field: "sub_org_name", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
					{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
					{ field: "total_outstanding", header: "Total Outstanding", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
					{ field: "overdue_amount", header: "Overdue Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
					{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
				];
				this.getOutstandingReport();
			}
			this.filter = ['sub_org_name', 'zone'];
		}
	}

	pushDropdown() {
		if (this.showModal) {
			let filter_cols = this.cols2.filter(col => col.filter == true);
			filter_cols.forEach(element => {
				let unique = this.data.map(item =>
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
		} else {
			let filter_cols = this.cols.filter(col => col.filter == true);
			filter_cols.forEach(element => {
				let unique = this.data.map(item =>
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
	}

	footerTotal() {
		if (this.showModal) {
			let filter_cols = this.cols2.filter(col => col.footer == true);
			filter_cols.forEach(element => {
				let total = this.data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
			});
			this.partyWiseReportModal.show();
		} else {
			let filter_cols = this.cols.filter(col => col.footer == true);
			filter_cols.forEach(element => {
				let total = this.data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
			});
		}
	}

	customFilter(value, col, data) {
		this.table.filter(value, col, data);
		this.footerTotal();
	}

	onAction(item, type) {
		if (type == 'Tab') {
			this.selected_tab = item.index;
			this.getCols(null);
		} else if (type == 'View') {
			this.showModal = true;
			this.getCols(item.sub_org_id);
		} else if (type == 'Whatsapp') {
			let numbers = item.mobile_no ? item.mobile_no.split(',') : []
			if (numbers.length) {
				let main_obj = {
					"locale": "en",
					"template_name": 'payment_overdue_reminder',
					"numbers": numbers,
					"params": [item.overdue_amount]
				}
				this.crudServices.postRequest<any>(LocalPurchase.sendSMS, [main_obj]).subscribe(res => {
					this.toasterService.pop('success', 'WhatsApp Notification !', 'WhatsApp Notification !')
				}, error => {
					this.toasterService.pop('warning', 'something Went wrong', 'something Went wrong')
				});
			}
		}
	}

	closePartyWiseModal() {
		this.showModal = false;
		this.partyWiseReportModal.hide();
	}

	exportData(type) {
		let title = "";
		if (this.showModal) {
			title = "Party Wise Outstanding Report";
		} else {
			if (this.selected_tab == 0) {
				title = "Group Outstanding Report";
			} else {
				title = "Credit Limit Report";
			}
		}

		let fileName = title + ' (' + moment().format('DD-MM-YYYY') + ')';
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
				} else if (this.cols[j]["field"] == "total_outstanding" ||
					this.cols[j]["field"] == "overdue_amount" ||
					this.cols[j]["field"] == "credit_limit" ||
					this.cols[j]["field"] == "utilized_credit" ||
					this.cols[j]["field"] == "overdue_amount" ||
					this.cols[j]["field"] == "available_credit" ||
					this.cols[j]["field"] == "adhoc_limit" ||
					this.cols[j]["field"] == "adhoc_limit_utilized" ||
					this.cols[j]["field"] == "adhoc_available" ||
					this.cols[j]["field"] == "overdue_limit" ||
					this.cols[j]["field"] == "overdue_limit_utilized" ||
					this.cols[j]["field"] == "overdue_available" ||
					this.cols[j]["field"] == "opening_amount" ||
					this.cols[j]["field"] == "pending_amount"
				) {
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

	whatsappData() {
		this.generateSo().then(async (pdfObj) => {
			let pdfOBjFromData = pdfObj;
			await pdfMake.createPdf(pdfOBjFromData).getBlob(data => {
				if (data) {
					this.fileData.append('customer_outstanding_report', data, 'customer_invoice_list.pdf')
					this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
						let path = res.uploads.customer_outstanding_report[0].location;
						let wa_data = this.data2.filter(x => x.overdue_by_days >= 0);
						this.sendWtsapp(wa_data, path);
						this.toasterService.pop('success', 'Success', 'Deal Added Successfully');

					})
				}
			});
		});
	}


	sendWtsapp(data, path) {
		let percent = (data[0]['product_type'] == 1) ? 24 : 36;
		let main_obj_for_cust = {
			"locale": "en",
			"template_name": "overall_outstanding_payments",
			'attachment': [
				{
					"caption": `${data[0]['invoice_no']}`,
					"filename": `${data[0]['invoice_no']}.pdf`,
					"url": path
				}
			],
			params: [percent],
			numbers: [data[0].mobile_no.split(',')]
		}
		this.crudServices.postRequest<any>(LocalPurchase.sendSMS, [main_obj_for_cust]).subscribe(response => {
		})
	}
	async generateSo() {
		let logo = await this.exportService.getBase64ImageFromURL('assets/img/brand/parmar_logo.png');
		// let sign = await this.exportService.getBase64ImageFromURL('assets/img/sign.png');
		let docDefinition = {
			pageSize: 'A4',
			pageMargins: [25, 25, 25, 25],
			content: [
				{
					table: {
						widths: ['10%', '90%'],
						body: [
							[
								{
									border: [true, true, false, false],
									image: logo,
									width: 60,
									height: 60,
									margin: [3, 5, 3, 5],
									alignment: 'left'
								},
								{
									text: [
										{
											text: 'Sushila Parmar International Pvt. Ltd.\n',
											fontSize: 16,
											bold: true,
											alignment: 'center'
										},
										{
											text: [
												{ text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, MH, India.', fontSize: 8, alignment: 'center' },
												'\n',
												{ text: 'Corp. Office: 2nd & 3rd Floor, JDC Platinum Towers, Near Zambare Palace, Maharshi Nagar, Pune - 411037, MH, India', fontSize: 8, alignment: 'center' },
												'\n',
												{ text: `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com `, fontSize: 8, alignment: 'center' }
											],
											fontSize: 8
										}
									],
									margin: [0, 5, 0, 0],
									border: [false, true, true, false],
									alignment: 'center'
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: "Invoice Outstanding Report",
									bold: true,
									fontSize: 10,
									decoration: 'underline',
									margin: [0, 5, 0, 0],
									border: [true, true, true, false],
									alignment: 'center'
								}
							]
						]
					}
				},
				{
					table: {
						headerRows: 1,
						widths: ['*', 'auto', 'auto', 'auto', 'auto'],
						body: [
							['Invoice No', 'Invoice Date', 'Opening Amount', 'Pending Amount', 'Due Date'],
							...this.data2.map(p => ([p.invoice_no, moment(p.invoice_date).format('DD-MMM-YYYY'), this.currencyPipe.transform(p.opening_amount, 'INR'), this.currencyPipe.transform(p.pending_amount, 'INR'), moment(p.payment_due_date).format('DD-MMM-YYYY')])),
							[{ text: 'Total Amount', colSpan: 2 }, {}, this.currencyPipe.transform(this.getSumOf(this.data2, 'opening_amount'), 'INR'), this.currencyPipe.transform(this.getSumOf(this.data2, 'opening_amount'), 'INR'), '']
						]
					}
				},
			]
		};
		return docDefinition;
	}


	getSumOf(arraySource, field) {
		return arraySource.reduce(function (x, y) { return x + Number(y[field]); }, 0);
	}



}
