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
  selector: 'app-approve-lc',
  templateUrl: './approve-lc.component.html',
  styleUrls: ['./approve-lc.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [ExportService, ToasterService, PermissionService, LoginService, CrudServices, Calculations, PiPdfService]
})
export class ApproveLcComponent implements OnInit {

	@ViewChild("confirmPiModal", { static: false }) public confirmPiModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

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
  }

	getCols() {
		this.cols = [
      { field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" },
			{ field: "sub_org_name", header: "Customer", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "lc_no", header: "LC No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "lc_date", header: "LC Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "lc_amount", header: "LC Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "bank_name", header: "LC Opening Bank", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "tolerance_rate", header: "Tolerance Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "last_date_of_shipment", header: "Last Date Shipment", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "expiry_date", header: "Expiry Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['sub_org_name', 'lc_no', 'bank_name'];
		this.getData();
	}

  getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SalesLc.getOneData, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			company_id: (this.role_id == 1) ? null : this.company_id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
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
		console.log(item)
		 if (type == 'view') {
		// 	this.crudServices.getOne<any>(SalesPi.getPiDetails, {
		// 		from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
		// 		to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
		// 		pi_type: 2,
		// 		pi_id: item.id
		// 	}).subscribe(res => {
		// 		this.isLoading = false;
		// 		if (res.code == '100') {
		// 			res.data.forEach(element => {
		// 				element.pi_quantity = (element.total_quantity > 0) ? (element.total_quantity) : null;
		// 				element.covered_quantity = (element.covered_quantity > 0) ? (element.covered_quantity) : null;
		// 				element.type = (element.type == 1) ? "Regular" : "Advance";
		// 			})
					this.summary = item;
		// 		}
		// 	});
			this.confirmPiModal.show();
		} else if(type == 'Download'){

    }
	}

	approvePi() {
		this.crudServices.updateData<any>(SalesLc.approveLC, {
			is_lc_approved: 1
		}).subscribe(res => {
			if (res.length > 0) {
				this.toasterService.pop("success", "Success", "PI Approved Successfully");
			}
		});

	}

	rejectPi() {
		this.crudServices.updateData<any>(SalesLc.approveLC, {
			is_lc_approved: 2
		}).subscribe(res => {
			if (res.length > 0) {
				this.toasterService.pop("success", "Success", "PI Approved Successfully");
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
