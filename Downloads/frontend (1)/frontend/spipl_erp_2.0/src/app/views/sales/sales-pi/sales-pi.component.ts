import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { roundAmount, staticValues } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import {
	SpiplBankMaster,
	PercentageDetails,
	SalesPi,
	SalesLc,
	ValueStore,
	OrganizationBank,
	subOrgRespectiveBank,
	FileUpload
} from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { PiPdfService } from '../../../shared/pi-pdf/pi-pdf.service';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import { element } from 'protractor';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
	selector: 'app-sales-pi',
	templateUrl: './sales-pi.component.html',
	styleUrls: ['./sales-pi.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, ToasterService, PermissionService, LoginService, CrudServices, Calculations, PiPdfService]
})

export class SalesPiComponent implements OnInit {

	@ViewChild("createLcModal", { static: false }) public createLcModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild("confirmLCModal", { static: false }) public confirmLCModal: ModalDirective;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});
	summary: any;
	page_title: any = "Upload LC"
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

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = staticValues.sales_deals_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;
	selected_status: any = this.statusList[0];
	gst_no: any = staticValues.gst_no;
	pan_no: any = staticValues.pan_no;
	minDate: any = new Date();
	maxDate: any = new Date();

	cols: any = [];
	data: any = [];
	filter: any = [];
	checked: any = [];

	lcForm: FormGroup;
	fileData = new FormData();
	filesArr: Array<File> = [];


	lc_payment_terms: any = [];
	spipl_banks: any = [];
	org_banks: any = [];
	percentValues: any = [];

	loadingBtn: boolean = false;
	isLoading: boolean = false;
	enableCreateLCButton: boolean = false;

	sub_org_id: any = null;
	tcs: any = null;
	tds: any = null;
	con_ids: any = [];
	dispatch_ids: any = [];
	gstRate: any = 0;
	pi_ids: any = [];
	company_name: any = null;
	company_address: any = null;
	companyId: any;
	company_division_title: any;
	isQuantityExceed: boolean = false;
	finalTotalQuantity: any = [];
	piRateTotal: number = 0;
	finalQuantity: number = 0;
	invoice_no: any[];
	complete: number = 0;
	finalDealsRate: number;
	finalDealsQuantity: number;
	pi_Data: any[];
	sub_org_name: any;
	selectedBank: any;
	deal_ids: any;

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private exportService: ExportService,
		private crudServices: CrudServices,
		private calculations: Calculations,
		private piPdf: PiPdfService
	) {
		let user: UserDetails = this.loginService.getUserDetails();
		this.links = user.links;
	}

	ngOnInit() {
		this.initForm();
		this.getSpiplbanks();
		this.getPercentValues();
		this.getValueStore(null);
		this.getCols();
	}

	initForm() {
		this.lcForm = new FormGroup({
			lc_no: new FormControl(null, Validators.required),
			lc_date: new FormControl(new Date(), Validators.required),
			lc_amount: new FormControl(null, Validators.required),
			quantity: new FormControl(null),
			lc_opening_bank: new FormControl(null, Validators.required),
			last_date_of_shipment: new FormControl(null, Validators.required),
			expiry_date: new FormControl(null, Validators.required),
			tolerance_rate: new FormControl(null, Validators.required),
			total_lc_amount: new FormControl(null, Validators.required),
			lc_copy: new FormControl(null),
			remark: new FormControl(null)
		});
	}

	getCols() {
		this.cols = [
			{ field: "sub_org_name", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "pi_invoice_no", header: "PI No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "is_pi_approved", header: "PI Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "pi_quantity", header: "PI Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "covered_quantity", header: "Covered Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "pending_quantity", header: "Pending Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "pi_date", header: "PI Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "place_of_loading", header: "Loading Place", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "place_of_destination", header: "Destination", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "total_amount", header: "Total Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "advance_recieved", header: "Advance Received", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "pi_value", header: "PI Value", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "bank_charges", header: "Bank Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "bank_name", header: "Bank Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "type", header: "Type", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" },
		];
		this.filter = ['sub_org_name', 'pi_invoice_no', 'place_of_loading', 'place_of_destination', 'bank_name'];

		this.getData();
	}


	onChangeValue(e, type) {
		if (type == 'complete') {
			this.lcForm.reset();
			this.getOrgBanks();
			this.lcForm.get('quantity').setValidators([Validators.required]);
			let total_amount = 0;
			let quantity = 0;
			this.con_ids = [];
			this.pi_ids = [];

			this.checked.forEach(element => {
				this.pi_ids.push(element.id);
				total_amount = total_amount + Number(element.total_amount);
				quantity = element.pi_quantity;
				element.partialQuantity = Number(element.pi_quantity) - Number((element.covered_quantity || 0));
				element.total = element.partialQuantity * element.pi_rate;
				if (element.deals && element.deals.length > 0) {
					const result = element.deals.map((item) => {
						item.partialQuantity = Number(item.covered).toFixed(2);
						item.total = item.pi_rate * item.partialQuantity;
					});
				}
			});
			this.lcForm.patchValue({
				pi_date: new Date(),
				lc_amount: Number(total_amount),
				quantity: Number(quantity)
			});
			this.checked.forEach(element => {
				this.con_ids.push(element.con_id);
			});
			this.finalTotalQuantity = [];
			this.piRateTotal = 0;
			this.finalQuantity = 0;

		} else if (type == 'partial') {
			this.getOrgBanks();
			this.lcForm.reset();
			this.lcForm.get('quantity').setValidators([Validators.required]);
			let total_amount = 0;
			let quantity = 0;
			this.con_ids = [];
			this.pi_ids = [];
			this.checked.forEach(element => {
				this.pi_ids.push(element.id);
			});
			this.checked.forEach(element => {
				this.con_ids.push(element.con_id);
				element.partialQuantity = 0;
				element.total = 0;
				total_amount = total_amount + Number(element.total_amount);
				quantity = quantity + Number(element.pi_quantity);
				if (element.deals && element.deals.length > 0) {
					const result = element.deals.map((item) => {
						item.partialQuantity = 0;
						item.total = 0
					});
				}
			});

			this.lcForm.patchValue({
				pi_date: new Date(),
				lc_amount: 0
			});

			this.finalTotalQuantity = [];
			this.piRateTotal = 0;
			this.finalQuantity = 0;
		}
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SalesPi.getOne, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			company_id: (this.role_id == 1) ? null : this.company_id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				res.data.forEach(element => {
					element.pi_quantity = (element.total_quantity > 0) ? (element.total_quantity) : null;
					element.covered_quantity = (element.covered_quantity > 0) ? (element.covered_quantity) : null;
					element.is_pi_approved = (element.is_pi_approved == 0) ? 'Pending' : ((element.is_pi_approved == 1) ? 'Approved' : 'Rejected');
					element.type = (element.type == 1) ? "Regular" : "Advance";
				})
				this.data = res.data;
				this.pushDropdown(this.data);
				this.footerTotal(this.data);
			}
		});
	}

	getTotal(rate, quantity, invoice_no) {
		quantity = Number(quantity.target.value);
		const result = this.checked.map((item) => {
			let pending = (item.covered_quantity > 0 ? (item.pi_quantity - item.covered_quantity) : 0)
			if (item.pi_invoice_no == invoice_no) {
				if (quantity > (pending ? pending : item.pi_quantity)) {
					this.isQuantityExceed = true;
					item.partialQuantity = 0;
				}
				else {
					this.isQuantityExceed = false;
					this.finalTotalQuantity.push(quantity * rate);
					item.partialQuantity = quantity;
					item.total = quantity * rate;
				}
			}
		});
		this.piRateTotal = 0;
		this.finalQuantity = 0;
		const result1 = this.checked.map((item) => {
			if (item.partialQuantity) {
				this.piRateTotal += (item.partialQuantity * item.pi_rate);
				this.finalQuantity += JSON.parse(item.partialQuantity);
			}
		});
		this.lcForm.patchValue({
			lc_amount: this.piRateTotal,
			quantity: this.finalQuantity
		});
	}

	getDealTotal(checkedID, deals, rate, quantity, invoice_no) {
		quantity = Number(quantity.target.value);
		
		const result = this.checked.map((record) => {
			if (record.id == checkedID) {
				if (deals && deals.length > 0) {
					const result = deals.map((item) => {
						let pending = (item.lc_covered_quantity > 0 ? (item.covered - item.lc_covered_quantity) : 0)
						if (item.invoice_no == invoice_no) {
							if (quantity > (pending ? pending : item.covered)) {
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
					this.finalDealsRate = 0;
					this.finalDealsQuantity = 0;
					if (deals && deals.length > 0) {
						const result1 = deals.map((item) => {
							if (item.partialQuantity) {
								this.finalDealsRate += (item.partialQuantity * item.pi_rate);
								this.finalDealsQuantity += JSON.parse(item.partialQuantity);
							}
						});
					}
					record.partialQuantity = this.finalDealsQuantity;
					record.total = this.finalDealsRate;
				}

			}
		});
		this.piRateTotal = 0;
		this.finalQuantity = 0;
		const result1 = this.checked.map((item) => {
			if (item.partialQuantity) {
				this.piRateTotal += (item.partialQuantity * item.pi_rate);
				this.finalQuantity += JSON.parse(item.partialQuantity);
			}
		});
		this.lcForm.patchValue({
			lc_amount: this.piRateTotal,
			quantity: this.finalQuantity
		});
	}

	closeModal() {
		this.isQuantityExceed = false;
		this.checked = [];
		this.enableCreateLCButton = false
		this.createLcModal.hide();
		this.lcForm.reset();
	}

	getSpiplbanks() {
		this.crudServices.getAll<any>(SpiplBankMaster.getAll).subscribe(res_bank => {
			if (res_bank.length > 0) {
				this.spipl_banks = res_bank;
			}
		});
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
	}

	getOrgBanks() {
		this.org_banks = [];
		this.crudServices.getOne<any>(subOrgRespectiveBank.getPerticularOrgBank, {
			sub_org_id: this.sub_org_id
		}).subscribe(res => {
			if (res.length > 0) {
				this.org_banks = res;
			}
		});
	}

	getPercentValues() {
		this.crudServices.getOne<any>(PercentageDetails.getOne, {
			detail_type: 2
		}).subscribe((response) => {
			let item = response.find(o => o.percent_type === 'gst');
			if (item != null && item != undefined) {
				this.gstRate = item.percent_value;
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

	onCheck(checked) {
		if (checked.length > 0) {
			this.checked.forEach(element => {
				element.deals = [];
				this.pi_ids.push(element.id);
			});
			let arr = checked.map(item => item.sub_org_id).filter((value, index, self) => self.indexOf(value) === index);
			if (arr.length == 1) {
				this.enableCreateLCButton = true;
				this.sub_org_id = checked[0].sub_org_id;
				this.sub_org_name = checked[0].sub_org_name;
				this.companyId = checked[0].company_id;
			} else {
				this.enableCreateLCButton = false;
			}
		} else {
			this.enableCreateLCButton = false;
		}
	}

	createLc() {
		this.loadingBtn = true;
		this.deal_ids = [];
		this.crudServices.getOne<any>(SalesPi.getOnePIData, {
			id: this.pi_ids,
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data && res.data.length > 0) {
					const groupedData = {};
					res.data.forEach((item) => {
						this.deal_ids.push(item.id);
						const { id, ...rest } = item;
						if (groupedData.hasOwnProperty(id)) {
							groupedData[id].push(rest);
						} else {
							groupedData[id] = [rest];
						}
					});
					this.checked.forEach(record => {
						record.deals = groupedData[record.id]
					});
				}
				this.loadingBtn = false;
				this.complete = 0;
				this.onChangeValue(null, 'complete');
				this.createLcModal.show();
			}
		});
	}

	onChangeBank(selectedBank) {
		this.selectedBank = selectedBank ?  selectedBank.bank_name : "";
	}

	onChangeTolerance(tolerance_rate) {
		if (tolerance_rate != null || tolerance_rate != undefined) {
			let tolerance_value = Number(this.lcForm.value.lc_amount) * (Number(tolerance_rate) / 100);
			let total_lc_amount = Number(this.lcForm.value.lc_amount) + Number(tolerance_value);
			let final_value = this.calculations.getRoundValue(total_lc_amount);
			this.lcForm.patchValue({
				total_lc_amount: final_value
			});
		}
	}

	onFileChange(e) {
		this.filesArr = <Array<File>>e.target.files;
	}

	confirmationModal() {
		this.summary = this.lcForm.value;
		this.confirmLCModal.show();
	}

	submitLcForm() {
		this.pi_Data = [];
		const result = this.checked.map((item) => {
			item.covered_quantity = item.covered_quantity ? (item.covered_quantity + item.partialQuantity) : item.partialQuantity;
			item.received_amount = (item.partialQuantity * item.pi_rate );
			if (this.complete == 1) {
				let piData = {
					pi_id: item.id,
					covered_quantity: item.partialQuantity,
					covered_amount: (item.partialQuantity * item.pi_rate)
				};
				this.pi_Data.push(piData);
			} else {
				let piData = {
					pi_id: item.id,
					covered_quantity: item.covered_quantity,
					covered_amount: (item.covered_quantity * item.pi_rate )
				};
				this.pi_Data.push(piData);
			}
			if (item.deals && item.deals.length > 0) {
				const result = item.deals.map((deal) => {
					deal.lc_covered_quantity = deal.lc_covered_quantity ? (deal.lc_covered_quantity + deal.partialQuantity) : deal.partialQuantity;
					deal.lc_covered_amount = deal.total;
				});
			}
		});

		this.loadingBtn = true;
		let fileData: any = new FormData();
		const files: Array<File> = this.filesArr;
		for (let i = 0; i < files.length; i++) {
			fileData.append('sales_lc_copy', files[i], files[i]['name']);
		}
		this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res_aws => {
			let sales_lc_copy = null;
			if (res_aws != null && res_aws.upload != null) {
				sales_lc_copy = res_aws.uploads["sales_lc_copy"][0].location;
			}
			let body = {
				data: {
					lc_no: this.lcForm.value.lc_no,
					lc_date: moment(this.lcForm.value.lc_date).format("YYYY-MM-DD"),
					lc_amount: Number(this.lcForm.value.lc_amount),
					quantity: this.lcForm.value.quantity,
					lc_opening_bank: Number(this.lcForm.value.lc_opening_bank),
					sub_org_id: Number(this.sub_org_id),
					company_id: this.companyId,
					last_date_of_shipment: moment(this.lcForm.value.last_date_of_shipment).format("YYYY-MM-DD"),
					expiry_date: moment(this.lcForm.value.expiry_date).format("YYYY-MM-DD"),
					tolerance_rate: Number(this.lcForm.value.tolerance_rate),
					status: 0,
					is_payment_done: 0,
					remark: this.lcForm.value.remark,
					lc_copy: sales_lc_copy
				},
				pi_ids: this.pi_Data,
				deal_ids: this.deal_ids
			};
			this.crudServices.addData<any>(SalesLc.add, body).subscribe(res => {
				if (res.code == '100') {
					this.crudServices.updateData<any>(SalesPi.updateStatus, {
						pi_ids: this.pi_Data,
						data: this.checked
					}).subscribe(res_pi => {
						this.afterFormSubmit();
						this.toasterService.pop("success", "Success", "LC Created Successfully");
					});
				}
			});
		});
	}

	onAction(item, type) {
		if (type == 'Delete') {
			this.crudServices.addData<any>(SalesPi.delete, {
				id: item.id
			}).subscribe(res => {
				this.afterFormSubmit();
				this.toasterService.pop("success", "Success", "PI Deleted Successfully");
			});
		} else if (type == 'Download') {
			this.getValueStore(item.company_id);
			this.generatePdf(item);
		} else if (type == 'Email') {

		} else if (type == 'WhatsApp') {

		}else if(type == 'Update'){

		}
	}

	afterFormSubmit() {
		this.loadingBtn = false;
		this.lcForm.reset();
		this.pi_ids = [];
		this.con_ids = [];
		this.checked = [];
		this.complete = null;
		this.createLcModal.hide();
		this.confirmLCModal.hide();
		this.getCols();
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

	onChangeStatus(e) {
		if (e != null && e != undefined) {
			this.selected_status = {
				id: e.value.id,
				name: e.value.name
			};
			this.getData();
		}
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
				if (element.field == 'pending_quantity') {
					let total = data.map(item =>
					(item['covered_quantity'] > 0 ? (item['pi_quantity'] -
						item['covered_quantity']) : (item['pi_quantity'] || 0))
					).reduce((sum, item) => sum + item);
					element.total = total;
				} else {
					let total = data.map(item =>
						item[element.field]
					).reduce((sum, item) => sum + item);
					element.total = total;
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


	async generatePdf(item) {
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
				this.piPdf.createPi(data, item, res.data);
			}
		});
	}
}
