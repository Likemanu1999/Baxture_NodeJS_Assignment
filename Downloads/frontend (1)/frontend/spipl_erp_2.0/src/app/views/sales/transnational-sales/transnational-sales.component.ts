import { Component, OnInit, ViewEncapsulation, ViewChild, Input, ElementRef, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { AmountToWordPipe } from '../../../shared/amount-to-word/amount-to-word.pipe';
import { ExportService } from '../../../shared/export-service/export-service';
import { staticValues, CommonService, roundQuantity } from '../../../shared/common-service/common-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { TransnationalSales, CommonApis, FileUpload } from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import * as moment from "moment";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-transnational-sales',
	templateUrl: './transnational-sales.component.html',
	styleUrls: ['./transnational-sales.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		ExportService,
		AmountToWordPipe,
		CurrencyPipe,
		Calculations,
		CommonService
	],
})
export class TransnationalSalesComponent implements OnInit {

	@ViewChild("viewDealModal", { static: false }) public viewDealModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;
	@ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];
	@ViewChild("lcModal", { static: false }) public lcModal: ModalDirective;
	@ViewChild("paymentModal", { static: false }) public paymentModal: ModalDirective;
	@ViewChild("nonModal", { static: false }) public nonModal: ModalDirective;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Transnational Sales Orders List"
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to change Status?';
	popoverMessage3: string = 'Are you sure, you want to proceed for Payment?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	cancelClicked: boolean = false;

	user: UserDetails;
	role_id: any = null;
	company_id: any = null;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	delete_opt: boolean = false;
	isLoading: boolean = false;

	dealArr: FormArray;

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = [];
	selected_date_range: any = [
		// new Date(moment().subtract(30, 'days').format("YYYY-MM-DD")),
		// new Date(moment().format("YYYY-MM-DD"))
	];
	maxDate: any = new Date();

	fileData: FormData = new FormData();
	generateInvoiceForm: FormGroup;
	uploadPiForm: FormGroup;
	uploadAgreementForm: FormGroup;
	selected_deal: any = null;
	selected_status: any = null;
	cols: any = [];
	selected_cols: any = [];
	data: any = [];
	filter: any = [];
	checked: any = [];
	suppliers: any = [];
	material_packs: any = [];
	filteredValuess: any;
	checkedList = [];
	checkstatus: boolean = false;
	lcForm: FormGroup;
	lcdocs: File[];
	bankList = [];
	payment = [];
	status: { id: number; value: string; }[];
	paymentTypesList: any = staticValues.payment_types_transnational;
	amountRemain: any;
	nonForm: any;
	dealList = [];
	non_list = [];

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private amountToWord: AmountToWordPipe,
		private currencyPipe: CurrencyPipe,
		private fb: FormBuilder,

	) {
		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();


		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.delete_opt = perms[3];

		this.status = [{ id: 0, value: 'Pending' }, { id: 1, value: 'Remited' }]
		this.selected_status = this.statusList[0];

	}

	ngOnInit() {
		this.initForm();
		this.getCols();
	}

	initForm() {
		this.lcForm = new FormGroup({
			lc_copy: new FormControl(null, Validators.required),
			lc_no: new FormControl(null, Validators.required),
			lc_date: new FormControl(null, Validators.required),
			tolerance: new FormControl(null),
			additional_set_doc: new FormControl(null),
			lc_issue_bank: new FormControl(null),
		});

		this.nonForm = this.fb.group({
			invoice_number: new FormControl(null, Validators.required),
			invoice_date: new FormControl(null, Validators.required),
			grade_name: new FormControl(null),
			customer: new FormControl(null),
			rate: new FormControl(null),
			total: new FormControl(null),
			dealArr: this.fb.array([])
		});
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(TransnationalSales.getTransnationalSalesOrders, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			company_id: (this.role_id == 1) ? null : this.company_id
		}).subscribe(res => {
			this.isLoading = false;
			this.data = res;
			this.pushDropdown(this.data);
			this.footerTotal(this.data);
			this.table.reset();
		});
	}

	getCols() {

		this.cols = [
			{ field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'customer' },
			{ field: "port_name", header: "Port", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "amount", header: "Total Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },

			{ field: "paid_amount", header: "Paid Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },

			{ field: "payment_remain", header: "Payment Remain", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "booking_date", header: "Booking Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "pay_term", header: "Payment Term", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "pi_details", header: "PI Details", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "pi_details" },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['customer', 'port_name', 'main_grade', 'grade_name'];
		this.selected_cols = this.cols;
		this.getData();

	}

	@Input() get selectedColumns(): any[] {
		localStorage.setItem(
			"selected_sales_order_col",
			JSON.stringify(this.selected_cols)
		);
		return this.selected_cols;
	}

	set selectedColumns(val: any[]) {
		this.selected_cols = this.cols.filter((col) => val.includes(col));
	}

	getColumnPresent(col) {
		if (this.selected_cols.find((ob) => ob.field === col)) {
			return true;
		} else {
			return false;
		}
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
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		this.filteredValuess = dt.filteredValue;
		this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	countDaysLeft(from_date, extend_days, company_id) {
		let dayCount = (company_id == 1) ? 10 : 8;
		dayCount += extend_days;
		let startDate = new Date(from_date);
		let endDate = new Date();
		let days = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24);
		let total_days = Number(days);
		if (total_days > dayCount) {
			return '*';
		} else {
			return dayCount - total_days;
		}
	}

	closeModal() {
		this.selected_deal = null;
		this.lcModal.hide();
		this.lcForm.reset();
		this.bankList = [];
		this.checkedList = [];

		this.viewDealModal.hide();
		this.paymentModal.hide();
		this.dealList = [];
		this.nonModal.hide();
		this.nonForm.reset();
		this.getData();
	}

	onAction(item, type) {
		if (type == 'Add Transnational Order') {
			this.router.navigate(["sales/add-transnational-order"]);
		} else if (type == 'View') {
			this.selected_deal = item;
			this.viewDealModal.show();
		} else if (type == 'Edit') {
			this.router.navigate(["sales/edit-transnational-order", item.id]);
		} else if (type == 'Delete') {
			this.crudServices.deleteData(TransnationalSales.delete, {
				id: item.id
			}).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', 'Order Deleted');
					this.getData();
				}
			});
		} else if (type == 'Generate_PI') {
			this.selected_deal = item;
			this.generateSo(item).then(async (pdfObj) => {
				let pdfOBjFromData = pdfObj;
				await pdfMake.createPdf(pdfOBjFromData).getBlob(pdf_file => {
					if (pdf_file) {
						this.fileData.append('sales_order_pdf', pdf_file, 'so.pdf')
						this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
							let path = res.uploads.sales_order_pdf[0].location;
							let body = {
								id: this.selected_deal.id,
								type: 'so_copy',
								sales_order_data: this.selected_deal,
								data: {
									so_copy: path
								}
							};
							this.crudServices.updateData(TransnationalSales.update, body).subscribe(result => {
								if (result) {
									this.toasterService.pop('success', 'Success', 'PI Generated Successfully');
									this.closeModal();
									this.getCols();
								}
							});
						});
					}
				});
			});
		}



	}

	onChangeValue(e, type) {
		if (type == "exchange_rate") {
			// 
		}
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

	submitPiForm() {
		this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res_aws => {
			let path = res_aws.uploads.sales_order_pdf[0].location;
			let body = {
				id: this.selected_deal.id,
				data: {
					so_sign_copy: path
				}
			};
			this.crudServices.updateData(TransnationalSales.update, body).subscribe(result => {
				if (result) {
					this.toasterService.pop('success', 'Success', 'Sign PI Uploaded Successfully');
					this.closeModal();
					this.getCols();
				}
			})
		})
	}

	getDocArr(doc) {
		if (doc) {
			return JSON.parse(doc);
		} else {
			return [];
		}
	}




	exportData(type) {
		let fileName = this.selected_status.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.selected_cols.length; j++) {
				if (this.selected_cols[j]["field"] != "action") {
					if (this.selected_cols[j]["field"] == "quantity") {
						obj[this.selected_cols[j]["header"]] = this.data[i][this.selected_cols[j]["field"]] + " MT";
					} else {
						obj[this.selected_cols[j]["header"]] = this.data[i][this.selected_cols[j]["field"]];
					}
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.selected_cols.length; j++) {
			if (this.selected_cols[j]["field"] != "action") {
				if (this.selected_cols[j]["field"] == "quantity") {
					foot[this.selected_cols[j]["header"]] = this.selected_cols[j]["total"] + " MT";
				} else if (this.selected_cols[j]["field"] == "rate") {
					foot[this.selected_cols[j]["header"]] = this.selected_cols[j]["total"];
				} else {
					foot[this.selected_cols[j]["header"]] = "";
				}
			}
		}
		exportData.push(foot);
		if (type == 'Excel') {
			this.exportService.exportExcel(exportData, fileName);
		} else {
			let exportColumns = this.selected_cols.map(function (col) {
				if (col.field != "action") {
					return { title: col.header, dataKey: col.header }
				}
			});
			this.exportService.exportPdf(exportColumns, exportData, fileName);
		}
	}

	async generateSo(item) {
		let logo = await this.exportService.getBase64ImageFromURL('assets/img/brand/parmar_logo.png');
		let sign = await this.exportService.getBase64ImageFromURL('assets/img/sign.png');
		let mid_date = moment().format("YYYY-MM") + "-20";
		let start_date = null;
		let end_date = null;
		if (moment().isBefore(moment(mid_date))) {
			start_date = moment().format("MMMM YYYY");
			end_date = moment().add(1, 'M').format("MMMM YYYY");
		} else {
			start_date = moment().add(1, 'M').format("MMMM YYYY");
			end_date = moment().add(2, 'M').format("MMMM YYYY");
		}
		let shipment_month = start_date + ' / ' + end_date;

		const docDefinition = {
			content: [
				{
					table: {
						widths: ['10%', '90%'],
						body: [
							[
								{
									border: [false, false, false, false],
									image: logo,
									width: 60,
									height: 60,
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
												{ text: `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com | PAN: ${item.godown ? item.godown.gst_no.substr(2, 10) : ''}`, fontSize: 8, alignment: 'center' }
											],
											fontSize: 8
										}
									],
									border: [false, false, false, false],
									alignment: 'center'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['100%'],
						body: [
							[
								{
									text: "SALES CONTRACT / PROFORMA INVOICE",
									bold: true,
									fontSize: 9,
									decoration: 'underline',
									border: [false, false, false, false],
									alignment: 'center'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['70%', '30%'],
						border: [false, false, false, false],
						body: [
							[
								{
									text: 'Buyer / Customer / Invoice To: ',
									fontSize: 8,
									bold: true,
									margin: [0, 0, 0, 0],
									border: [false, false, false, false]
								},
								{
									text: [
										{ text: 'SC NO: ' + item.so_no, fontSize: 8, bold: true, },
									],
									margin: [0, 0, 0, 0],
									border: [false, false, false, false]
								}
							],
							[

								{
									text: item.customer.toUpperCase(),
									fontSize: 9,
									bold: true,
									border: [false, false, false, false]
								},
								{
									text: [
										{ text: 'SC DATE: ', fontSize: 8, bold: true, },
										{ text: moment(item.booking_date).format('DD-MMM-YYYY'), fontSize: 8, bold: true, },
									],
									border: [false, false, false, false]
								}
							],
							[
								{
									text: item.org_address,
									fontSize: 8,
									bold: true,
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							],
							[
								{
									text: [
										{ text: 'IE CODE: ', fontSize: 8, bold: true, },
										{ text: item.ie_code, fontSize: 8, bold: true, },
									],
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							],
							[
								{
									text: [
										{ text: 'GST NO: ', fontSize: 8, bold: true, },
										{ text: item.org_gst_no, fontSize: 8, bold: true, },
									],
									margin: [0, 0, 0, 5],
									border: [false, false, false, false]
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							]
						]
					}
				},
				{
					table: {
						widths: ['40%', '20%', '20%', '20%'],
						body: [
							[
								{
									text: 'DESCRIPTION OF GOODS',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'QUANTITY\n(MT)',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'UNIT PRICE\n' + item.inco_term.toUpperCase() + ' ' + item.port_name.toUpperCase() + '\n(USD/MT)',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								},
								{
									text: 'AMOUNT\n(USD)',
									fontSize: 8,
									bold: true,
									alignment: 'center'
								}
							],
							[
								{
									text: item.grade_name.toUpperCase(),
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: item.quantity + ' ' + item.unit_type,
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: this.currencyPipe.transform(item.final_rate, 'USD'),
									fontSize: 8,
									alignment: 'center'
								},
								{
									text: this.currencyPipe.transform(item.base_amount, 'USD'),
									fontSize: 8,
									alignment: 'center'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['38.5%', '61.5%'],
						body: [
							[
								{
									text: 'SHIPMENT',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: shipment_month.toUpperCase(),
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'INCOTERMS',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.inco_term.toUpperCase() + '-' + item.port_name.toUpperCase() + ', INDIA',
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'FINAL PLACE OF DELIVERY',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.inco_term.toUpperCase() + '-' + item.port_name.toUpperCase() + ', INDIA',
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'PAYMENT',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: 'IMMEDIATE BY RTGS AGAINST TRANSFER OF HIGH SEAS DOCUMENTS',
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'PACKING',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.packing.toUpperCase(),
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'NAME OF THE MANUFACTURER',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.supplier.toUpperCase(),
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'COUNTRY OF ORIGIN',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.supplier_country.toUpperCase(),
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['38.5%', '61.5%'],
						body: [
							[
								{
									text: 'BENEFICIARY NAME',
									fontSize: 8,
									bold: true,
									border: [true, true, false, false],
									alignment: 'left'
								},
								{
									text: 'SUSHILA PARMAR INTERNATIONAL PVT. LTD.',
									fontSize: 8,
									border: [true, true, true, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'BANK NAME',
									fontSize: 8,
									bold: true,
									border: [true, false, false, false],
									alignment: 'left'
								},
								{
									text: 'IDFC FIRST BANK',
									fontSize: 8,
									border: [true, false, true, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'BANK ADDRESS',
									fontSize: 8,
									bold: true,
									border: [true, false, false, false],
									alignment: 'left'
								},
								{
									text: 'BKC BRANCH, MUMBAI',
									fontSize: 8,
									border: [true, false, true, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'ACCOUNT NUMBER',
									fontSize: 8,
									bold: true,
									border: [true, false, false, false],
									alignment: 'left'
								},
								{
									text: 'PARMARZPAPLP1087',
									fontSize: 8,
									border: [true, false, true, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'IFSC Code',
									fontSize: 8,
									bold: true,
									border: [true, false, false, true],
									alignment: 'left'
								},
								{
									text: 'IDFB0040101',
									fontSize: 8,
									border: [true, false, true, true],
									alignment: 'left'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['38.5%', '61.5%'],
						body: [
							[
								{
									text: 'REMARKS',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									ol: [
										'THE USD CONVERSION RATE WILL BE DERIVED ON THE DATE OF TRANSFER OF HIGH SEAS DOCUMENT.',
										'MATERIAL SOLD ON HIGHSEAS BASIS, HENCE THE MATERIAL HAS TO BECLEARED BY THE BUYER DIRECTLY FROM MUNDRA PORT.',
										'ALL CLEARING CHARGES / DUTY ARE TO THE ACCOUNT OF BUYER.',
										'TRANSIT INSURANCE FROM MUNDRA PORT TO BUYERS LOCATION WILL BE TOTHE ACCOUNT OF BUYER.'
									],
									fontSize: 8,
									border: [false, false, false, false],
									alignment: 'left'
								}
							]
						]
					}
				},
				'\n',
				{
					table: {
						widths: ['50%', '50%'],
						body: [
							[
								{
									text: 'THE SELLER',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: 'ACCEPTED BY',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									text: 'SUSHILA PARMAR INTERNATIONAL PVT. LTD.',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: item.customer.toUpperCase(),
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								}
							],
							[
								{
									image: sign,
									margin: [0, 0, 0, 0],
									border: [false, false, false, false],
									width: 70,
									height: 70
								},
								{
									text: '',
									border: [false, false, false, false]
								}
							],
							[
								{
									text: 'AUTHORIZED SIGNATORY',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								},
								{
									text: 'AUTHORIZED SIGNATORY',
									fontSize: 8,
									bold: true,
									border: [false, false, false, false],
									alignment: 'left'
								}
							]
						]
					}
				}
			]
		};
		return docDefinition;
		// pdfMake.createPdf(docDefinition).open();
	}

	// for all check box check
	onCheckAll(checked) {

		let arr = [];
		if (this.filteredValuess === undefined) {
			arr = this.data;
		} else {
			arr = this.filteredValuess;
		}
		if (checked) {
			this.inputs.forEach(check => {
				check.nativeElement.checked = true;
			});
			for (const val of arr) {
				this.checkedList.push(val);
				// if (val.RemainingAmount > 0 && this.findInarray(val.mode_of_payment, 2)) {
				//   this.checkedList.push(val);
				// }

			}

		} else {
			this.inputs.forEach(check => {
				check.nativeElement.checked = false;
			});
			for (const val of arr) {
				this.checkedList.splice(this.checkedList.indexOf(val), 1);
				// if (val.RemainingAmount > 0 && this.findInarray(val.mode_of_payment, 2)) {
				//   this.checkedList.splice(this.checkedList.indexOf(val), 1);
				// }
			}
		}

		this.checkSelection();




	}


	// set check item list
	onCheck(checked, item) {
		this.checkstatus = false;
		if (checked) {
			this.checkedList.push(item);
		} else {
			this.checkedList.splice(this.checkedList.indexOf(item), 1);
		}
		this.checkSelection();

	}

	checkSelection() {
		if (this.checkedList.length > 0) {
			for (let i = 0; i < this.checkedList.length; i++) {
				if (this.checkedList[0]['sub_org_id'] === this.checkedList[i]['sub_org_id'] && this.checkedList[0]['grade_id'] === this.checkedList[i]['grade_id']) {
					this.checkstatus = true;
				} else {
					this.checkstatus = false;
					break;
				}
			}
			if (this.checkstatus) {
				this.bankList = this.checkedList[0]['sub_org_master']['org_bank_masters'];
			} else {
				this.toasterService.pop('error', 'warning', 'Customer and Grade Not Same ');
			}
		}
	}

	onSubmitLc() {
		let Id = this.checkedList.map(item => item.id)
		let data = {
			lc_date: moment(this.lcForm.value.lc_date).format('DD-MM-YYYY'),
			lc_no: this.lcForm.value.lc_no,
			lc_issue_bank: this.lcForm.value.lc_issue_bank,
			tolerance: this.lcForm.value.tolerance,
			additional_set_doc: this.lcForm.value.additional_set_doc ? 1 : 0,
		}

		let fileData: any = new FormData();
		const document: Array<File> = this.lcdocs;
		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('transnational_lc_copy', document[i], document[i]['name']);
			}

			this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {


				let filesList = [];
				let files = [];


				if (res.uploads.transnational_lc_copy) {
					filesList = res.uploads.transnational_lc_copy;
					for (let i = 0; i < filesList.length; i++) {
						files.push(filesList[i].location);
					}
					//	data['be_copy'] = JSON.stringify(fileDealDocs1);

				}


				if (files.length > 0) {
					data['lc_copy'] = JSON.stringify(files);

				}

				this.crudServices.addData(TransnationalSales.addDataLC, { data: data, id: Id }).subscribe(res => {

					if (res['code'] == '100') {
						this.lcForm.reset();
						this.lcModal.hide();
						this.toasterService.pop('success', 'Success', 'LC Added Successfully');
						//this.generateSalesOrder(res['data']);
					}
				});





			})
		} else {
			this.crudServices.addData(TransnationalSales.addDataLC, { data: data, id: Id }).subscribe(res => {
				if (res['code'] == '100') {
					this.lcModal.hide();
					this.lcForm.reset();
					this.toasterService.pop('success', 'Success', 'LC Added Successfully');
					//this.generateSalesOrder(res['data']);
				}
			});
		}


	}

	onClickLc() {
		this.lcModal.show();
	}
	onFileChange(event: any) {
		this.lcdocs = <Array<File>>event.target.files;
	}

	paymentDetails(item) {
		this.payment = [];
		this.amountRemain = item.payment_remain;

		if (item.transnational_payments.length) {
			this.payment = item.transnational_payments;
		}


		this.paymentModal.show();
	}

	updateSwift(id, event, val) {

		let data = {};
		if (val == 'date') {
			data['swift_date'] = moment(event).format('YYYY-MM-DD');
			this.crudServices.updateData(TransnationalSales.updateSwiftDet, { data: data, id: id }).subscribe(res => {

				if (res['code'] == '100') {

					this.toasterService.pop('success', 'Success', ' Updated Successfully');
					//this.generateSalesOrder(res['data']);
				}
			});
		}

		if (val == 'amount') {
			if (event.target.value <= this.amountRemain) {
				data['amount'] = event.target.value;
				this.crudServices.updateData(TransnationalSales.updateSwiftDet, { data: data, id: id }).subscribe(res => {

					if (res['code'] == '100') {

						this.toasterService.pop('success', 'Success', ' Updated Successfully');
						//this.generateSalesOrder(res['data']);
					}
				});
			} else {
				this.toasterService.pop('warning', 'Warning', 'Amount Exceeded');
				event.target.value = 0;
			}

		}

		if (val == 'file') {
			const doc = <Array<File>>event.target.files;
			let fileData: any = new FormData();
			if (doc.length) {
				for (let i = 0; i < doc.length; i++) {
					fileData.append('transnational_swift_copy', doc[i], doc[i]['name']);
				}


				this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {

					let filesList = [];
					let files = [];

					if (res.uploads.transnational_swift_copy) {
						filesList = res.uploads.transnational_swift_copy;
						for (let i = 0; i < filesList.length; i++) {
							files.push(filesList[i].location);
						}

					}

					if (files.length > 0) {
						data['swift_copy'] = JSON.stringify(files);
						this.crudServices.updateData(TransnationalSales.updateSwiftDet, { data: data, id: id }).subscribe(res => {

							if (res['code'] == '100') {

								this.toasterService.pop('success', 'Success', 'File Updated Successfully');
								//this.generateSalesOrder(res['data']);
							}
						});

					}
				})

			}
		}

		if (val == 'status') {
			data['payment_flag'] = event.id;
			this.crudServices.updateData(TransnationalSales.updateSwiftDet, { data: data, id: id }).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', ' Updated Successfully');
				}
			});
		}

	}

	getType(id) {

		let data = this.paymentTypesList.find(item => item.id == id);

		return data.name

	}

	addNon(item) {
		this.dealArr = this.nonForm.get('dealArr') as FormArray;
		this.dealArr.clear();
		let nonData = item.transnational_rel_non_lcs
		this.non_list = []
		nonData.forEach(element => {
			this.non_list.push({
				invoice_number: element.transnational_non.invoice_number,
				invoice_date: element.transnational_non.invoice_date,
				quantity: element.quantity,
				amount: Number(element.quantity) * Number(item.rate),
				deals: item
			})
		});


		let qty_utilize = item.transnational_rel_non_lcs.reduce((sum, deal) => sum + deal.quantity, 0);
		let remain = Number(item.quantity) - Number(qty_utilize)
		this.dealArr.push(this.fb.group({
			con_id: new FormControl(item.id),
			quantity: new FormControl(item.quantity),
			quantity_remain: new FormControl(remain),
			lc_id: new FormControl(null),
			customer: new FormControl(item.customer),
			grade_name: new FormControl(item.grade_name),
			rate: new FormControl(item.rate),
			total: new FormControl(item.rate * item.quantity),


		}))

		this.nonModal.show();
	}

	onSubmitNon() {

		let relArr = this.nonForm.value.dealArr;
		let data = {
			invoice_date: this.nonForm.value.invoice_date,
			invoice_number: this.nonForm.value.invoice_number,
			quantity: relArr.reduce((sum, item) => sum + Number(item.quantity_remain), 0),
			lc_id: null,
		}

		this.crudServices.addData(TransnationalSales.addDataNON, { data: data, relArr: relArr }).subscribe(res => {
			if (res['code'] == '100') {
				this.closeModal()
				this.toasterService.pop('success', 'Success', 'NON Added Successfully');
				//this.generateSalesOrder(res['data']);
			}
		});
	}

	editNon(item) {
		this.dealArr = this.nonForm.get('dealArr') as FormArray;
		this.dealArr.push(this.fb.group({
			con_id: new FormControl(item.id),
			quantity: new FormControl(item.quantity),
			quantity_remain: new FormControl(item.quantity),
			lc_id: new FormControl(null),
			customer: new FormControl(item.customer),
			grade_name: new FormControl(item.grade_name),
			rate: new FormControl(item.rate),
			total: new FormControl(item.rate * item.quantity),


		}))

	}

}
