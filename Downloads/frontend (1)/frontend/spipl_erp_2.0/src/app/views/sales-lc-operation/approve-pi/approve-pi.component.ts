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
	selector: 'app-approve-pi',
	templateUrl: './approve-pi.component.html',
	styleUrls: ['./approve-pi.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, ToasterService, PermissionService, LoginService, CrudServices, Calculations, PiPdfService]
})
export class ApprovePiComponent implements OnInit {

	@ViewChild("confirmPiModal", { static: false }) public confirmPiModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Approve PI"
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
	statusList: any = staticValues.approve_status;
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
	summary: any;
	dealsData: any;
	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private exportService: ExportService,
		private crudServices: CrudServices,
		private calculations: Calculations,
		private piPdf: PiPdfService) {
		let user: UserDetails = this.loginService.getUserDetails();
		this.links = user.links;
	}

	ngOnInit() {
		this.getSpiplbanks();
		this.getCols();
		this.getValueStore(null);
	}


	getCols() {
		this.cols = [
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" },
			{ field: "is_pi_approved", header: "PI Status", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: 'Badge' },
			{ field: "sub_org_name", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "pi_invoice_no", header: "PI Invoice No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "pi_quantity", header: "PI Quantity", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "pi_date", header: "PI Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "place_of_loading", header: "Loading Place", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "place_of_destination", header: "Destination", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "total_amount", header: "Total Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "advance_recieved", header: "Advance Received", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "pi_value", header: "PI Value", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "bank_charges", header: "Bank Charges", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "bank_name", header: "Bank Name", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "type", header: "Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['sub_org_name', 'pi_invoice_no', 'place_of_loading', 'place_of_destination', 'bank_name'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SalesPi.getOneData, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			company_id: (this.role_id == 1) ? null : this.company_id,
			status: this.selected_status.id,
			type: 2
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				res.data.forEach(element => {
					element.pi_quantity = (element.total_quantity > 0) ? (element.total_quantity) : null;
					element.covered_quantity = (element.covered_quantity > 0) ? (element.covered_quantity) : null;
					element.is_pi_approved = (element.is_pi_approved == 0) ? 'Pending' : ((element.is_pi_approved == 1) ? 'Approved' : 'Rejected')
					element.type = (element.type == 1) ? "Regular" : "Advance";
				})
				this.data = res.data;
				this.pushDropdown(this.data);
				this.footerTotal(this.data);
			}
		});
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

	onAction(item, type) {
		if (type == 'view') {
			this.summary = item;
			this.crudServices.getOne<any>(SalesPi.getOnePIData, {
				id: [item.id],
			}).subscribe(res => {
				if (res.code == '100') {
					if (res.code == '100') {
						console.log(res.data);

						res.data.forEach(element => {
							element.pi_quantity = (element.total_quantity > 0) ? (element.total_quantity) : null;
							element.covered_quantity = (element.covered_quantity > 0) ? (element.covered_quantity) : null;
							element.type = (element.type == 1) ? "Regular" : "Advance";
						})
						this.dealsData = res.data;
						this.confirmPiModal.show();
					} else {
						this.toasterService.pop('warning', 'warning', 'Record Not Found!');
					}
				}
			});
		} else if (type == 'Download') {
			this.getValueStore(item.company_id);
			this.generatePdf(item);
		}
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

	async generatePdf(item) {
		console.log(item)
		this.crudServices.getOne<any>(SalesPi.getPiDetails, {
			pi_id: item.id,
			pi_type: item.type
		}).subscribe(async (res) => {
			if (res.code == '100') {
				console.log(res)
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

	approvePi() {
		this.crudServices.updateData<any>(SalesPi.approvePi, {
			data: { is_pi_approved: 1 },
			id: this.summary.id
		}).subscribe(res => {
			if (res.code == '100') {
				this.confirmPiModal.hide();
				this.getCols();
				this.toasterService.pop("success", "Success", "PI Approved Successfully");
			}
		});
	}

	cancelPi(){
		this.confirmPiModal.hide();
	}

	rejectPi() {
		this.crudServices.updateData<any>(SalesPi.approvePi, {
			data: { is_pi_approved: 2 },
			id: this.summary.id
		}).subscribe(res => {
			if (res.code == '100') {
				this.confirmPiModal.hide();
				this.getCols();
				this.toasterService.pop("error", "Danger", "PI Rejected");
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
				let total = data.map(item =>
					item[element.field]
				).reduce((sum, item) => sum + item);
				element.total = total;
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


}
