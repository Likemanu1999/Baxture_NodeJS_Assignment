import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from 'moment';
import { EmailTemplateMaster, SurishaSalePurchase } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { staticValues } from '../../../shared/common-service/common-service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-sales-eta-planning',
	templateUrl: './sales-eta-planning.component.html',
	styleUrls: ['./sales-eta-planning.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, ToasterService, LoginService, CrudServices, DatePipe]
})
export class SalesEtaPlanningComponent implements OnInit {
	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild('sendEmailModal', { static: false }) public sendEmailModal: ModalDirective;
	@ViewChild('viewModal', { static: false }) public viewModal: ModalDirective;
	@ViewChild('myEditor', { static: false }) myEditor: any;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	selected_date_range: any = [];
	selected_status = 0;
	minDate: any = new Date();
	maxDate: any = new Date();
	isRange: any;
	cols: any = [];
	data: any = [];
	isLoading: boolean;
	filter: string[];
	page_title: any = "Surisha Sale ETA Planning"
	date = new Date();
	currentYear: number;
	toEmailArr = [];
	emailSubject: any;
	emailFooterTemplete: any;
	emailBodyTemplete: any;
	amount: any;
	amountshow: boolean = false;
	isLoadingmsg: boolean;
	originalEmailTemp: any;
	currObj: any;
	mailList: any = [];
	statusList = staticValues.dispatch_report_status;

	user: UserDetails;

	links: string[] = [];
	add_credit_amount: boolean;
	ckeConfig: { editable: boolean; spellcheck: boolean; height: string; };


	constructor(private loginService: LoginService,
		private exportService: ExportService,
		private crudServices: CrudServices,
		private toasterService: ToasterService,
		private router: Router,
		public datepipe: DatePipe) {
		this.user = this.loginService.getUserDetails();

		this.links = this.user.links;
		this.add_credit_amount = (this.links.find(x => x == 'add_credit_amount') != null) ? true : false;
		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		if (this.datepipe.transform(this.date, 'MM') > '03') {
			this.selected_date_range = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		} else {
			this.selected_date_range = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
		}

		this.ckeConfig = {
			'editable': true, 'spellcheck': true, 'height': '700px', // you can also set height 'minHeight': '100px',
		};
	}

	ngOnInit() {
		this.getCols();
	}

	getCols() {
		this.cols = [
			{ field: "so_no", header: "SO NO", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "buyer", header: "Buyer", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: "virtual_acc_no", header: "VA NO", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "grade_name", header: "Grade", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: "port_name", header: "Port", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			{ field: "quantity", header: "Qty", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "total_amount", header: "Total Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "received_amount", header: "Received Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "payment_term", header: "Advance Payment Term", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "booking_date", header: "Booking Date", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Date" },
			{ field: "etd", header: "ETD", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Date' },
			{ field: "arrival_date", header: "ETA", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: 'Date' },


		];
		this.filter = ['buyer', 'grade_name', 'port_name', 'so_no', 'virtual_acc_no'];

		this.getData();
	}

	onChangeStatus(event) {

		this.selected_status = event.value.id
		this.getData()
	}
	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SurishaSalePurchase.surishaSaleEtaplanning, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status

		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {



				this.data = res.data;


				this.pushDropdown(this.data);
				this.footerTotal(this.data);
			}
		});
	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		if (data.length > 0) {
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
	}

	footerTotal(arg) {
		let data = null;
		if (arg) {
			data = arg;
		} else {
			data = this.data;
		}
		if (data.length > 0) {
			let filter_cols = this.cols.filter(col => col.footer == true);
			filter_cols.forEach(element => {
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
			});
		}
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);
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
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]] + " MT";
					} if (this.cols[j]["field"] == "status") {
						obj[this.cols[j]["header"]] = this.convertToPlain(final_data[i][this.cols[j]["field"]]);
					}
					else {
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
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
				} else if (this.cols[j]["field"] == "total_amount" ||
					this.cols[j]["field"] == "received_amount") {
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

	convertToPlain(html) {

		// Create a new div element
		var tempDivElement = document.createElement("div");

		// Set the HTML content with the given value
		tempDivElement.innerHTML = html;

		// Retrieve the text property of the element 
		return tempDivElement.textContent || tempDivElement.innerText || "";
	}

	onAction(rowdata, type) {

		if (type == 'view') {
			this.viewModal.show();
			this.crudServices.getOne<any>(SurishaSalePurchase.getETAEmail, { id: rowdata.id }).subscribe(response => {
				this.mailList = response.data
			})
		}
		if (type == 'emailAdv') {
			this.amountshow = true;
			rowdata.temp = 'Surisha Payment Received'
			this.currObj = rowdata
			this.toEmailArr = rowdata.temp_email.trim().split(',')
			let amount: any
			if (rowdata.received_amount == 0) {
				amount = (rowdata.advance_amount).toFixed(3)
			} else {
				amount = rowdata.received_amount
			}
			let obj = {
				SO_NO: rowdata.so_no,
				QTY: rowdata.quantity + ' ' + rowdata.unit_type,
				GRADE: rowdata.grade_name,
				AMOUNT: amount

			}
			this.getEmailTemplate('Surisha Payment Received', obj)
			this.sendEmailModal.show()
		}

		if (type == 'emailBal') {
			this.amountshow = false;
			rowdata.temp = 'surisha Balance Payment'
			this.currObj = rowdata
			this.toEmailArr = rowdata.temp_email.trim().split(',')
			let obj = {
				SO_NO: rowdata.so_no,
				QTY: rowdata.quantity + ' ' + rowdata.unit_type,
				GRADE: rowdata.grade_name,
				DATE: moment(rowdata.booking_date).format('DD-MM-YYYY'),

				COUNTRY: rowdata.country_of_origin,
				PORT: rowdata.port_name,
				ETD: rowdata.etd,
				ETA: moment(rowdata.arrival_date).format('DD-MM-YYYY')
			}
			this.getEmailTemplate('surisha Balance Payment', obj)
			this.sendEmailModal.show()
		}

		if (type == 'add_amount') {
			this.router.navigate(['sales/import-sales'])
		}
	}

	async getEmailTemplate(name, obj) {
		this.emailSubject = undefined;
		this.emailFooterTemplete = undefined;
		this.emailBodyTemplete = undefined;
		let headerRed = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: name });
		let footer_req = this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Surisha Footer' });
		await forkJoin([headerRed, footer_req]).subscribe(response => {
			if (response[0].length > 0) {
				this.emailBodyTemplete = response[0][0].custom_html;
				this.emailSubject = response[0][0].subject;

				const SO_NO = /{SO_NO}/gi;
				this.emailSubject = this.emailSubject.replace(SO_NO, obj.SO_NO);

				for (const key in obj) {
					this.emailBodyTemplete = this.emailBodyTemplete.replace(new RegExp('{' + key + '}', 'g'), obj[key]);
				}

			}
			if (response[1].length > 0) {
				this.emailFooterTemplete = response[1][0].custom_html;

				this.emailBodyTemplete = this.emailBodyTemplete + this.emailFooterTemplete
				this.originalEmailTemp = this.emailBodyTemplete
			}
		})
	}


	onClose() {
		this.toEmailArr = [];
		this.amountshow = false;
		this.sendEmailModal.hide();
		this.viewModal.hide();
	}


	sendMail() {

		let emailBody = {

			tomail: this.toEmailArr,
			subject: this.emailSubject,
			bodytext: this.emailBodyTemplete,

		}

		this.isLoadingmsg = true;
		this.crudServices.postRequest<any>(SurishaSalePurchase.sendMailETA, emailBody).subscribe((response) => {
			this.isLoadingmsg = false;
			let body = {
				so_id: this.currObj.so_id,
				link_id: this.currObj.id,
				html: this.emailBodyTemplete,
				email: this.toEmailArr.toString(),
				email_name: this.currObj.temp,

			}
			this.crudServices.addData<any>(SurishaSalePurchase.addETAEmail, body).subscribe(response => {
				this.onClose();
				this.getData();
				this.toasterService.pop('success', 'Mail Sent', ' MAIL SEND SUCCESS!')
			})


		});



	}


	onFilter(e, dt) {
		this.footerTotal(dt.filteredValue);
	}

}
