import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { staticValues, CommonService, roundAmount } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import {
	SalesDeals,
	PaymentTermMaster,
	SpiplBankMaster,
	PercentageDetails,
	ChargesMasters,
	SalesPi,
	DispatchNew,
	SalesOrders,
	DispatchBilling,
	ValueStore,
	FileUpload
} from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import { PiPdfService } from '../../../shared/pi-pdf/pi-pdf.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-sales-deals',
	templateUrl: './sales-deals.component.html',
	styleUrls: ['./sales-deals.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, ToasterService, PermissionService, LoginService, CrudServices, CommonService, Calculations, PiPdfService]
})

export class SalesDealsComponent implements OnInit {

	@ViewChild("createPiModal", { static: false }) public createPiModal: ModalDirective;
	@ViewChild("confirmPiModal", { static: false }) public confirmPiModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Generate Proforma Invoice"
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to change Status?';
	popoverMessage3: string = 'Are you sure, you want to Renew Deal?';
	popoverMessage4: string = 'Are you sure, you want to Reverse Payment?';
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
	quantityExceed: boolean = false;
	disableBank: boolean = true;
	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.sales_deals_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;
	dealTypes: any = [
		{
			id: 2,
			name: "Advance"
		},
		{
			id: 1,
			name: "Regular"
		}
	];
	selected_deal_type: any = this.dealTypes[0];
	selected_status: any = this.statusList[0];
	minDate: any = new Date();
	maxDate: any = new Date();

	cols: any = [];
	data: any = [];
	filter: any = [];
	checked: any = [];

	piForm: FormGroup;

	lc_payment_terms: any = [];
	spipl_banks: any = [];
	percentValues: any = [];

	isLoading: boolean = false;
	enableCreatePIButton: boolean = false;

	sub_org_id: any = null;
	tcs: any = null;
	tds: any = null;

	con_ids: any = [];
	dispatch_ids: any = [];
	companyId: any;
	invoice_no: any;
	totalQuantity: any;
	rate: any = null;
	piRateTotal: number = 0;
	finalQuantity: any = 0;
	isQuantityExceed: boolean = false;
	complete: number = 0;
	dispatch_from = null;
	summary: any;
	pay_days: any;
	sub_org_name: any;
	company_name: any = null;
	company_division_title: any;
	company_address: any = null;
	gst_no: any = staticValues.gst_no;
	pan_no: any = staticValues.pan_no;
	gstRate: any = 0;
	fileData: FormData = new FormData();

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private exportService: ExportService,
		private commonService: CommonService,
		private crudServices: CrudServices,
		private calculations: Calculations,
		private piPdf: PiPdfService
	) {
		let user: UserDetails = this.loginService.getUserDetails();
		this.links = user.links;
	}

	ngOnInit() {
		this.initForm();
		this.getLCPaymentTerms();
		this.getSpiplbanks();
		this.getPercentValues();
		this.getCols();
	}

	initForm() {
		this.piForm = new FormGroup({
			pi_date: new FormControl(null, Validators.required),
			pi_invoice_no: new FormControl(null),
			pi_value: new FormControl(null, Validators.required),
			total_pi_value: new FormControl(null, Validators.required),
			place_of_loading: new FormControl(null, Validators.required),
			place_of_destination: new FormControl('Buyer Warehouse', Validators.required),
			total_amount: new FormControl(0, Validators.required),
			total_quantity: new FormControl(0, Validators.required),
			quantity: new FormControl(null),
			advance_recieved: new FormControl(0),
			payment_term_id: new FormControl(null, Validators.required),
			payment_term_days: new FormControl(null, Validators.required),
			bank_interest_rate: new FormControl(null, Validators.required),
			bank_interest_value: new FormControl(null, Validators.required),
			bank_charges: new FormControl(null, Validators.required),
			advising_negotiating_bank_id: new FormControl(20, Validators.required),
			remark: new FormControl(null)
		});
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
	}

	getLCPaymentTerms() {
		this.crudServices.getOne<any>(PaymentTermMaster.getOneByType, {
			pay_type: 4
		}).subscribe(res => {
			if (res.length > 0) {
				this.lc_payment_terms = res;
			}
		});
	}

	getSpiplbanks() {
		this.crudServices.getOne<any>(SpiplBankMaster.getParticularBanks, { id: [20, 24] }).subscribe(res_bank => {
			if (res_bank.length > 0) {
				this.spipl_banks = res_bank;
			}
		});
	}

	getPercentValues() {
		this.crudServices.getOne<any>(PercentageDetails.getOne, {
			detail_type: 2
		}).subscribe((response) => {
			this.percentValues = response;
			let item = response.find(o => o.percent_type === 'gst');
			if (item != null && item != undefined) {
				this.gstRate = item.percent_value;
			}
		});
	}

	getCols() {
		if (this.selected_deal_type.id == 2) {
			this.cols = [
				{ field: "con_id", header: "Con ID", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "days_left", header: "Days Left", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
				{ field: "sub_org_name", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "payment_type", header: "Payment Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "booking_date", header: "Booking Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
				{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "covered_quantity", header: "Covered Quantity", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Quantity" },
				{ field: "pending_quantity", header: "Pending Quantity", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Quantity" },
				{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "total_amount", header: "Total Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "pending_amount", header: "Pending Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null },
			];
			this.filter = ['invoice_no', 'sub_org_name', 'con_id', 'company_name'];
		} else {
			this.cols = [
				{ field: "con_id", header: "Con ID", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "invoice_no", header: "Invoice No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "invoice_date", header: "Invoice Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
				{ field: "sub_org_name", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "payment_type", header: "Payment Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
				{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
				{ field: "covered_quantity", header: "Covered Quantity", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Quantity" },
				{ field: "pending_quantity", header: "Pending Quantity", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Quantity" },
				{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "total_amount", header: "Total Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "pending_amount", header: "Pending Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
				{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: true, total: 0, type: null }
			];
			this.filter = ['invoice_no', 'sub_org_name', 'con_id', 'company_name'];
		}
		this.getData();
	}

	getData() {
		this.isLoading = true;
		this.data = [];
		if (this.selected_deal_type.id == 2) {
			this.crudServices.getOne<any>(SalesDeals.getAdvanceDeals, {
				from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
				to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
				status: this.selected_status.id,
				company_id: (this.role_id == 1) ? null : this.company_id
			}).subscribe(res => {
				this.isLoading = false;
				if (res.code == '100') {
					if (res.data.length > 0) {
						res.data.forEach(element => {
							element.days_left = this.countDaysLeft(element.booking_date, element.extend_days, element.company_id);
							element.payment_type = (element.payment_type == 5) ? 'LC' : 'Advance by LC';
						});
						this.data = res.data;
						this.pushDropdown(this.data);
						this.footerTotal(this.data);
					}
				}
			});
		} else {
			this.crudServices.getOne<any>(SalesDeals.getRegularDeals, {
				from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
				to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
				status: this.selected_status.id,
				company_id: (this.role_id == 1) ? null : this.company_id
			}).subscribe(res => {
				this.isLoading = false;
				if (res.code == '100') {
					if (res.data.length > 0) {
						res.data.forEach(element => {
							element.days_left = this.countDaysLeft(element.booking_date, element.extend_days, element.company_id);
							element.payment_type = (element.payment_type == 5) ? 'LC' : 'Advance by LC';
						});
						this.data = res.data;
					}
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			});
		}
	}

	checkLimit() {
		this.totalQuantity = this.piForm.value.total_quantity;
		const enteredAmt = this.piForm.controls.quantity.value;
		if (enteredAmt >= this.totalQuantity) {
			this.quantityExceed = true;
			this.piForm.controls.quantity.patchValue(null);
		} else {
			this.quantityExceed = false;
		}
	}

	onCheck(checked) {
		this.checked = checked;
		if (checked.length > 0) {
			let arr = checked.map(item => item.sub_org_id).filter((value, index, self) => self.indexOf(value) === index);
			if (arr.length == 1) {
				this.companyId = checked[0].company_id;
				this.tcs = checked[0].tcs;
				this.enableCreatePIButton = true;
				this.sub_org_id = checked[0].sub_org_id;
				this.sub_org_name = checked[0].sub_org_name;
				this.tds = checked[0].tds;
				this.rate = checked[0].final_rate;
			} else {
				this.enableCreatePIButton = false;
			}
		} else {
			this.enableCreatePIButton = false;
		}
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
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
				element.total = total;
			} else {
				element.total = 0;
			}

		});
	}

	closeModel() {
		this.isQuantityExceed = false;
		this.checked = [];
		this.enableCreatePIButton = false
		this.createPiModal.hide();
		this.piForm.reset();
	}

	createPi() {
		if(Number(this.tds) > 0 || Number(this.tcs) > 0){
			console.log(this.tcs , this.tds);
			
			let dispatch_from = [];
			this.checked.map((item) => {
				dispatch_from.push(item.godown_name);
			});
			dispatch_from = dispatch_from.filter(function (x, i, a) {
				return a.indexOf(x) === i;
			});
			this.dispatch_from = dispatch_from.toString();
			this.onChangeValue(null, 'complete');
			this.createPiModal.show();
		}else{
			this.toasterService.pop('warning', 'warning', 'TDS/TCS Declaration Not Found!');
		}
	}

	getTotal(rate, quantity, invoice_no) {
		quantity = Number(quantity.target.value);

		if (this.selected_deal_type.id == 2) {
			const result = this.checked.map((item) => {
				let pending = (item.covered_quantity > 0 ? (item.quantity - item.covered_quantity) : 0)
				if (item.con_id == invoice_no) {
					if (quantity > (pending ? pending : item.quantity)) {
						this.isQuantityExceed = true;
						item.partialQuantity = 0;
					}
					else {
						this.isQuantityExceed = false;
						item.partialQuantity = quantity;
						item.total = quantity * rate;
					}
				}
			});
		} else if (this.selected_deal_type.id == 1) {
			const result = this.checked.map((item) => {
				let pending = (item.covered_quantity > 0 ? (item.quantity - item.covered_quantity) : 0)
				if (item.invoice_no == invoice_no) {
					if (quantity > (pending ? pending : item.quantity)) {
						this.isQuantityExceed = true;
						item.partialQuantity = 0;
					}
					else {
						this.isQuantityExceed = false;
						item.partialQuantity = quantity;
						item.total = quantity * rate;
					}
				}
			});
		}
		this.piRateTotal = 0;
		this.finalQuantity = 0;
		const result1 = this.checked.map((item) => {
			if (item.partialQuantity) {
				this.piRateTotal += (item.partialQuantity * item.final_rate);
				this.finalQuantity += JSON.parse(item.partialQuantity);
			}
		});
		this.piForm.patchValue({
			total_amount: this.piRateTotal,
			total_quantity: this.finalQuantity
		});
		this.calculatePiValue();
	}

	confirmationModal() {
		this.summary = this.piForm.value;
		this.confirmPiModal.show();
	}

	submitPiForm() {
		if (this.complete == 1) {
			this.con_ids = [];
			this.dispatch_ids = [];
		}
		const result = this.checked.map((item) => {
			item.covered_quantity = item.covered_quantity ? (item.covered_quantity + item.partialQuantity) : item.partialQuantity;
			item.received_amount = (item.partialQuantity * (item.total_amount / item.quantity));

			if (this.complete == 1) {
				if (this.selected_deal_type.id == 2) {
					let conData = {
						con_id: item.con_id,
						covered_quantity: item.partialQuantity,
						covered_amount: item.received_amount
					};
					this.con_ids.push(conData);
				} else {
					let dispatchData = {
						dispath_id: item.dispath_id,
						covered_quantity: item.partialQuantity,
						covered_amount: item.received_amount
					};
					this.dispatch_ids.push(dispatchData);
				}
			}
		});


		let bank_charges_value = Number(this.piForm.value.bank_interest_value) * (Number(this.piForm.value.payment_term_days) / 365);
		let net_bank_charges = bank_charges_value + Number(this.piForm.value.bank_charges);
		let total_bank_charges = Number(net_bank_charges) + this.calculateGST(net_bank_charges);
		let grand_total = Number(this.piForm.value.total_pi_value) + total_bank_charges;
		let body = {
			data: {
				pi_date: moment(this.piForm.value.pi_date).format("YYYY-MM-DD"),
				pi_invoice_no: this.piForm.value.pi_invoice_no,
				quantity: this.piForm.value.quantity,
				place_of_destination: this.piForm.value.place_of_destination,
				place_of_loading: this.piForm.value.place_of_loading,
				total_amount: Number(this.piForm.value.total_amount.toFixed(2)),
				total_quantity: Number(this.piForm.value.total_quantity),
				advance_recieved: Number(this.piForm.value.advance_recieved),
				payment_term_id: Number(this.piForm.value.payment_term_id),
				pi_value: Number(this.piForm.value.pi_value),
				total_pi_value: Number(this.piForm.value.total_pi_value),
				bank_interest_rate: Number(this.piForm.value.bank_interest_rate),
				bank_charges: Number(this.piForm.value.bank_charges),
				total_bank_charges: roundAmount(total_bank_charges),
				grand_total: roundAmount(grand_total),
				advising_negotiating_bank_id: Number(this.piForm.value.advising_negotiating_bank_id),
				sub_org_id: Number(this.sub_org_id),
				pi_rate: this.rate,
				company_id: this.companyId,
				status: 0,
				type: this.selected_deal_type.id,
				remark: this.piForm.value.remark
			},
			con_ids: this.con_ids,
			dispatch_ids: this.dispatch_ids
		};
		this.getValueStore(this.companyId);
		this.crudServices.addData<any>(SalesPi.add, body).subscribe(res => {
			if (res.code == '100') {
				// this.generatePi(res.data);
				if (this.selected_deal_type.id == 2) {
					this.crudServices.updateData<any>(SalesOrders.updatePiStatus, {
						con_ids: this.checked
					}).subscribe(res => {
						this.afterFormSubmit();
					});
				} else if (this.selected_deal_type.id == 1) {
					this.crudServices.updateData<any>(SalesPi.updateDispatchBilling, {
						data: this.checked
					}).subscribe(res => {
						if (res.code === '100') {
							this.afterFormSubmit();
						}
					});
				}
			}
		});
	}

	getValueStore(company_id) {
		this.crudServices.getAll<any>(ValueStore.getAll).subscribe((response) => {
			for (let elem of response) {
				if (company_id == 3) {
					if (elem.thekey == "surisha_division_title") {
						this.company_division_title = elem.value;
					}
					if (elem.thekey == "company_address") {
						this.company_address = elem.value;
					}
					if (elem.thekey == "surisha_company_name") {
						this.company_name = elem.value;
					}
				} else {
					if (elem.thekey == "company_name") {
						this.company_name = elem.value;
					}
					if (elem.thekey == "company_address") {
						this.company_address = elem.value;
					}
				}

			}
		});
	}

	generatePi(item) {
		this.crudServices.getOne<any>(SalesPi.getPiDetails, {
			pi_id: item.id,
			pi_type: item.type
		}).subscribe(async (res) => {
			if (res.code == '100') {
				let data = {
					company_name: this.company_name,
					company_address: this.company_address,
					company_division_title: this.company_division_title ? this.company_division_title : '',
					logo: await this.exportService.getBase64ImageFromURL('assets/img/brand/parmar_logo.png'),
					sign: await this.exportService.getBase64ImageFromURL('assets/img/sign.png'),
					gst_rate: this.gstRate,
					gst_no: this.gst_no,
					pan_no: this.pan_no
				};

				this.piPdf.createPi(data, item, res.data).then(async (pdfObj) => {
					let pdfOBjFromData = pdfObj;
					await pdfMake.createPdf(pdfOBjFromData).getBlob(data => {
						if (data) {
							this.fileData.append('pi_copy_generate', data, 'SO_PI-' + item.pi_invoice_no + '.pdf')
							this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
								let path = res.uploads.pi_copy_generate[0].location;
								this.crudServices.updateData(SalesPi.update, {
									id: res.data[0].id,
									data: {
										pi_copy_generate: path
									}
								}).subscribe(result => {
									if (result) {
										this.afterFormSubmit();
									}
								})
							})
						}
					})

				})
			}
		})
	}

	afterFormSubmit() {
		this.toasterService.pop("success", "Success", "PI Created Successfully");
		this.piForm.reset();
		this.sub_org_id = null
		this.con_ids = [];
		this.dispatch_ids = [];
		this.checked = [];
		this.complete = null;
		this.enableCreatePIButton = false;
		this.createPiModal.hide();
		this.confirmPiModal.hide();
		this.getCols();
	}

	onChangeAdvanceRecieved(value) {
		this.calculatePiValue();
	}

	onChangeValue(e, type) {
		if (type == 'bank_interest_rate') {
			if (e != null && e != undefined) {
				let bank_interest_value = roundAmount(Number(this.piForm.value.total_pi_value) * (Number(e) / 100));
				this.piForm.patchValue({
					bank_interest_value: bank_interest_value
				});
			}
		} else if (type == 'complete') {
			this.piForm.reset();
			this.isQuantityExceed = false;
			this.piForm.get('quantity').setValidators(null);
			let total_amount = 0;
			let total_quantity = 0;
			this.con_ids = [];
			this.dispatch_ids = [];
			this.invoice_no = [];

			if (this.selected_deal_type.id == 2) {
				this.checked.forEach(element => {
					element.partialQuantity = element.quantity - (element.covered_quantity || 0);
					element.total = element.partialQuantity * element.final_rate;
					total_amount = Number((total_amount + Number(element.total)).toFixed(2));
					total_quantity = total_quantity + Number(element.partialQuantity);
					let conData = {
						con_id: element.con_id,
						covered_quantity: element.partialQuantity,
						covered_amount: element.total
					};
					this.con_ids.push(conData);
				});
			} else {
				this.checked.forEach(element => {
					element.partialQuantity = element.quantity - (element.covered_quantity || 0);
					element.total = element.partialQuantity * element.final_rate;
					total_amount = Number((total_amount + Number(element.total)).toFixed(2));
					total_quantity = total_quantity + Number(element.partialQuantity);//Calculate remaining quantity based on pending qty.
					let dispatchData = {
						dispath_id: element.dispath_id,
						covered_quantity: element.partialQuantity,
						covered_amount: element.total
					};
					this.dispatch_ids.push(dispatchData);
					this.invoice_no.push(element.invoice_no);
				});
			}

			/* Create Invoice no in backend
			let pi_invoice_no
			if (this.selected_deal_type.id == 2) {
				pi_invoice_no = "SPIPL/PI/" + this.commonService.getCurrentFinancialYear() + "/" + this.con_ids;
			} else {
				pi_invoice_no = "SPIPL/PI/" + this.commonService.getCurrentFinancialYear() + "/" + this.invoice_no;
			}
			*/

			this.piForm.patchValue({
				pi_date: new Date(),
				pi_invoice_no: '',
				total_amount: total_amount,
				total_quantity: total_quantity,
				advising_negotiating_bank_id: 20, //Select ICICI bank bydefault for PI,
				place_of_loading: this.dispatch_from,
				place_of_destination: 'Buyer Warehouse'
			});
			this.calculatePiValue();
			this.piRateTotal = 0;
			this.finalQuantity = 0;

		} else if (type == 'partial') {
			this.piForm.reset();
			this.isQuantityExceed = false;
			this.piForm.get('quantity').setValidators([Validators.required]);
			let total_amount = 0;
			let total_quantity = 0;
			this.con_ids = [];
			this.dispatch_ids = [];
			this.invoice_no = [];

			if (this.selected_deal_type.id == 2) {
				this.checked.forEach(element => {
					element.partialQuantity = 0;
					element.total = 0;
					total_amount = Number((total_amount + Number(element.pending_amount)).toFixed(2));
					total_quantity = total_quantity + Number(element.quantity);
					let conData = {
						con_id: element.con_id,
						covered_quantity: element.covered_quantity,
						covered_amount: element.total
					};
					this.con_ids.push(conData);
				});
			} else {
				this.checked.forEach(element => {
					element.partialQuantity = 0;
					element.total = 0;
					total_amount = Number((total_amount + Number(element.pending_amount)).toFixed(2));
					total_quantity = total_quantity + Number(element.quantity);
					let dispatchData = {
						dispath_id: element.dispath_id,
						covered_quantity: element.covered_quantity,
						covered_amount: element.total
					};
					this.dispatch_ids.push(dispatchData);
					this.invoice_no.push(element.invoice_no);
				});
			}
			let pi_invoice_no
			if (this.selected_deal_type.id == 2) {
				pi_invoice_no = "SPIPL/PI/" + this.commonService.getCurrentFinancialYear() + "/" + this.con_ids;
			} else {
				pi_invoice_no = "SPIPL/PI/" + this.commonService.getCurrentFinancialYear() + "/" + this.invoice_no;
			}

			this.piForm.patchValue({
				pi_date: new Date(),
				pi_invoice_no: pi_invoice_no,
				total_amount: 0,
				total_quantity: 0,
				advising_negotiating_bank_id: 20, //Select ICICI bank bydefault for PI
				place_of_loading: this.dispatch_from,
				place_of_destination: 'Buyer Warehouse'
			});
			this.calculatePiValue();
			this.piRateTotal = 0;
			this.finalQuantity = 0;
		}
	}

	onChangePaymentTerm(item) {
		if (item != null && item != undefined) {
			this.pay_days = item.pay_term;
			this.piForm.patchValue({
				payment_term_days: Number(item.pay_val)
			});
		}
	}

	calculatePiValue() {
		//Final PI value calculation: Total_amt + GST - (Advance from SO) - TDS + TCS.
		let pi_value = Number(this.piForm.value.total_amount) - Number(this.piForm.value.advance_recieved);
		let pi_value_with_gst = Number(pi_value) + this.calculateGST(pi_value);

		let tcs_value = 0;
		let tds_value = 0;
		if (this.tcs > 0) {
			tcs_value = (Number(this.tcs) > 0) ? (pi_value_with_gst) * (Number(this.tcs) / 100) : 0;
			tds_value = 0;
		} else if (this.tds > 0) {
			tcs_value = 0;
			tds_value = (Number(this.tds) > 0) ? pi_value * (Number(this.tds) / 100) : 0;
		} else {
			tcs_value = 0;
			tds_value = (Number(this.tds) > 0) ? pi_value * (Number(this.tds) / 100) : 0;
		}

		let total_pi_value = (pi_value_with_gst + tcs_value - tds_value).toFixed(2);
		let final_pi_value = total_pi_value;
		this.piForm.patchValue({
			pi_value: pi_value,
			total_pi_value: final_pi_value
		});
	}

	calculateGST(value) {
		let obj_gst = this.percentValues.find(o => o.percent_type === 'gst');
		let gst_rate = Number(obj_gst.percent_value);
		let gst_value = value * (gst_rate / 100);
		return roundAmount(gst_value);
	}

	onChangePaymentType(item) {
		let payment_type = null;
		let payment_type_label = null;
		if (item.payment_type == 1) {
			payment_type = 5;
			payment_type_label = 'LC';
		} else {
			payment_type = 1;
			payment_type_label = 'RTGS';
		}
		this.crudServices.getOne<any>(DispatchNew.updatePaymentType, {
			payment_type: payment_type,
			id: item.dispath_id
		}).subscribe((response) => {
			this.getCols();
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

	onChangeDealType(e) {
		if (e != null && e != undefined) {
			this.selected_deal_type = {
				id: e.value.id,
				name: e.value.name
			};
			this.getCols();
		}
	}

	exportData(type) {
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}
		let fileName = this.selected_status.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < final_data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]] + " MT";
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
				if (this.cols[j]["field"] == "quantity") {
					foot[this.cols[j]["header"]] = this.cols[j]["total"] + " MT";
				} else if (this.cols[j]["field"] == "deal_rate" ||
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
}
