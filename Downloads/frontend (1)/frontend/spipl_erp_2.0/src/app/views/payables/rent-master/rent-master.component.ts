import { Component, OnInit, ViewEncapsulation, ViewChild, Input, ElementRef, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { CurrencyPipe, LowerCasePipe, PercentPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { staticValues, CommonService } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CountryStateCityMaster, GodownMaster, RentMaster, StaffMemberMaster, SubOrg, rentType, FileUpload } from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import { add } from 'ngx-bootstrap/chronos';
import { logging } from 'protractor';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-rent-master',
	templateUrl: './rent-master.component.html',
	styleUrls: ['./rent-master.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		ExportService,
		CurrencyPipe,
		CommonService
	],
})

export class RentMasterComponent implements OnInit {

	@ViewChild("addRentModal", { static: false }) public addRentModal: ModalDirective;
	@ViewChild("viewRentModal", { static: false }) public viewRentModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild('tds_open_close', { static: false }) tds_open_close: ElementRef;
	@ViewChild('gst_open_close', { static: false }) gst_open_close: ElementRef;


	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Rent Master List"
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = "Are you sure to confirm this action?";
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
	isEdit: boolean = false;


	propertyStatusList: any = staticValues.property_status_list;
	datePickerConfig: any = staticValues.datePickerConfig;
	dayPickerconfig: any = staticValues.dayPickerconfig;
	Increment_Type: any = staticValues.increment_type;
	rentTypeCharge: any = staticValues.rentTypeCharge;
	// month_year_payment: any = staticValues.month_year_payment;
	min_date: any = new Date();
	max_date: any;
	period_end: any;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	rentForm: FormGroup;
	selected_rent: any = null;
	cols: any = [];
	data: any = [];
	filter: any = [];

	statesList: any = [];
	godownsList: any = [];
	partiesList: any = [];
	staffList: any = [];

	isTDS: boolean = false;
	isGST: boolean = false;
	tdsRate: any = 0;
	gstRate: any = 0;
	godownSelect: boolean = false;
	rentTypeList: any = [];
	set_area_sq_ft: any;
	set_rate_per_sq_ft: any;
	incrementType: any = 0;
	fileData: FormData = new FormData();
	selected_row: any = null;
	id: any = null;
	tds_checked: boolean;
	gst_checked: boolean;
	rentAmount = 0;
	incrementRate = 0;
	incrementAmount: any = 0;
	reteWiseAmountIncrement: boolean = false;
	formTitle: any = "";
	selectedRowData: any;
	updateID: any;
	MyObj: any;
	paymentList: any;
	rowExpansion: any;





	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private currencyPipe: CurrencyPipe,
		private commonService: CommonService
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

		this.updateID = 0;
		this.incrementType = 1;
	}

	ngOnInit() {
		this.initForm();
		this.getCols();
		this.getStates();
		this.getGodowns();
		this.getParties();
		this.getRentTypeMaster();
	}

	getStates() {
		this.crudServices.getOne<any>(CountryStateCityMaster.getStates, {
			country_id: 101
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.statesList = res.data;
				}
			}
		});
	}
	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}
	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}

	//  parties only Categories/vendors  org_catagories_master
	getParties() {
		this.crudServices.getOne<any>(SubOrg.getCategoryCustomers, {
			company_id: 1,
			category_id: null
		}).subscribe(res => {
			if (res.length > 0) {
				this.partiesList = res;
			}
		});
	}

	getGodowns() {
		this.crudServices.getAll<any>(GodownMaster.getAll).subscribe(res => {
			if (res.length > 0) {
				this.godownsList = res;
			}
		});
	}

	getRentTypeMaster() {
		this.crudServices.getAll<any>(rentType.getAll).subscribe(res => {
			if (res.length > 0) {
				this.rentTypeList = res;
			}
		});
	}




	initForm() {
		this.rentForm = new FormGroup({
			godown_id: new FormControl(null),
			state_id: new FormControl(null, Validators.required),
			sub_org_id: new FormControl(null, Validators.required),
			is_tds: new FormControl(false),
			is_gst: new FormControl(false),
			tds_rate: new FormControl(null),
			gst_rate: new FormControl(null),
			security_deposit: new FormControl(null, Validators.required),
			rent_amount: new FormControl(null, Validators.required),
			period_start: new FormControl(null, Validators.required),
			period_end: new FormControl(null, Validators.required),
			area_sq_ft: new FormControl(null, Validators.required),
			rate_per_sq_ft: new FormControl(null, Validators.required),
			increment_rate: new FormControl(null, Validators.required),
			increment_amount: new FormControl(null),
			increment_date: new FormControl(null),
			remark: new FormControl(null),
			rent_copy: new FormControl(null, Validators.required),
			rent_aggrement_purpose: new FormControl(null),
			payment_date: new FormControl(null),
			increment_type: new FormControl(null),
			increment_by_month: new FormControl(null),
			charges_type: new FormControl(null),
		});
	}


	// month_year_payment: new FormControl(null),

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(RentMaster.getRentMasterList, {
			from_date: this.selected_date_range[0],
			to_date: this.selected_date_range[1]
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(item => {

						item.tds_amount = (item.tds_rate !== 0 || item.tds_rate != null) ? item.rent_amount * (item.tds_rate / 100) : 0;
						item.gst_amount = (item.gst_rate !== 0 || item.gst_rate != null) ? item.rent_amount * (item.gst_rate / 100) : 0;
						item.status_name = (item.status == 0) ? "Inactive" : "Active";
						item.increment_by_rate_amt = (item.increment_type == 1) ? 1 : 2;
						item.increment_type = (item.increment_type == 1) ? 1 : 2;
						// item.increment_type = (item.increment_type == 1) ? "In Percent(%)" : "In Amount";
						item.totalPayable = (item.tds_rate > 0) ? item.rent_amount - item.tds_amount : item.rent_amount;
						item.totalPayable = (item.gst_rate > 0) ? item.totalPayable + item.gst_amount : item.totalPayable;

						// if (item.month_year_payment == 0) { item.payment = "no Payment type selected" } else
						// 	if (item.month_year_payment == 1) { item.payment = "Monthly" } else
						// 		if (item.month_year_payment == 2) { item.payment = "Yearly" } else
						// 			if (item.month_year_payment == 3) { item.payment = "Quartely" } else
						// 				if (item.month_year_payment == 4) { item.payment = "Half Year" }


						// item.net_rate_payable=item.rentAmount
						if (item.increment_date == null) {
							item.badge = 'badge badge-warning';
							item.renewInc = true;
						} else {
							item.badge = '';
							item.renewInc = false;
						}

					})
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
			this.table.reset();
		});
	}


	getCols() {
		this.cols = [
			{ field: "", header: "More Action", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: 'moreAction' },
			{ field: "id", header: "Sr.no", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "godown_name", header: "Property Name(if Godown)", style: '300px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "godown" },
			{ field: "party_name", header: "Party Name", style: '300px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "state_name", header: "Party State", style: '300px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "security_deposit", header: "Security Deposit", style: '300px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "rent_amount", header: "Rent Amount", style: '300px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "tds_rate", header: "TDS Rate (%)", style: '300px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "tds_amount", header: "TDS Amount", style: '300px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "gst_rate", header: "GST Rate (%)", style: '300px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: null },
			{ field: "gst_amount", header: "GST Amount", style: '300px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "totalPayable", header: "Net Rate Payable", style: '300px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "period_start", header: "Period Start", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "period_end", header: "Period End", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "area_sq_ft", header: "Area (Sq.Ft)", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "rate_per_sq_ft", header: "Rate (Per Sq.Ft)", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "increment_type", header: "Increment Type", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "increment_rate", header: "Increment Rate", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "perc" },
			{ field: "increment_by_month", header: "Increment By Month", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "perc" },
			{ field: "increment_amount", header: "Increment Amount", style: '300px', sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "increment_date", header: "Increment Date", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "payment_day", header: "Payment  Date", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "totalPayable", header: "Total Payment", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Amount" },
			{ field: "remark", header: "Remark", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "Amount", header: "Amount", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "Payment Date", header: "Payment Date", style: '300px', sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "UTR-No", header: "UTR-No", style: '300px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "status_name", header: "Status", style: '300px', sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Status" },
			{ field: "action", header: "Action", style: '300px', sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['id', 'godown_name', 'state_name', 'party_name', 'status_name', 'remark'];
		this.getData();
	}

	@Input() get selectedColumns(): any[] {
		localStorage.setItem(
			"selected_rent_col",
			JSON.stringify(this.cols)
		);
		return this.cols;
	}

	set selectedColumns(val: any[]) {
		this.cols = this.cols.filter((col) => val.includes(col));
		this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	getColumnPresent(col) {
		if (this.cols.find((ob) => ob.field === col)) {
			return true;
		} else {
			return false;
		}
	}

	checkDate(period_end) {
		let current_date = moment().format("YYYY-MM-DD");
		let after_two_monts = moment(current_date).add('month', 2).format("YYYY-MM-DD");
		const end_date = period_end != null ? moment(period_end).format('YYYY-MM-DD') : null;
		return (current_date <= end_date && end_date <= after_two_monts) ? 'new' : ((current_date > end_date) ? 'old' : false);
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
				if(item){
				array.push({
					value: item,
					label: item
				});
			}
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
			}

		});
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		//this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}
	// ----------------------ACtion Performed-----------------------------------------

	onAction(item, type) {

		if (type == 'Add') {
			this.rentForm.reset();
			this.formTitle = "Add New Rent"
			this.incrementType = 1;
			this.isGST = false;
			this.isTDS = false;
			this.reteWiseAmountIncrement = false;
			this.id = null;
			this.addRentModal.show();
		}

		if (type == 'View') {
			this.selected_rent = null;
			this.selected_rent = item;
			this.viewRentModal.show();
		}

		if (type == 'Edit_Rent') {
			this.rentForm.reset();
			this.id = item.id;
			this.formTitle = "Update Rent"
			this.reteWiseAmountIncrement = false;
			this.incrementType = 0;
			this.patchVAl(item);
		}

		if (type == 'Delete_Rent') {
			this.crudServices.deleteData(RentMaster.delete, {
				id: item.id
			}).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getCols();
					this.closeModal();
				} else {
					this.toasterService.pop('error', 'Alert', 'Rent Master cant be deleted');
				}
			});
		}

		if (type == "godown_select") {
			// 
		}

		if (type == "rentTypeCharge") {
			if (item.id == 1 || item.id == 2) {
				this.rentForm.get('remark').setValidators([Validators.required]);
				this.rentForm.get('remark').updateValueAndValidity();
			}
			else {
				this.rentForm.get('remark').clearValidators();
				this.rentForm.get('remark').updateValueAndValidity();
			}

			if (item.id == 1) {
				this.isTDS = true
				this.isGST = false
				this.rentForm.patchValue({
					gst_rate: 0
				});
			} else if (item.id == 2) {
				this.isGST = true
				this.isTDS = false
				this.rentForm.patchValue({
					tds_rate: 0
				});
			} else if (item.id == 3) {
				this.isTDS = false
				this.isGST = false
				this.rentForm.patchValue({
					gst_rate: 0,
					tds_rate: 0
				});
			} else {
				this.isTDS = true
				this.isGST = true
				this.rentForm.patchValue({
					gst_rate: 0,
					tds_rate: 0
				})
			}

		}

		if (type == 'rent_amount') {
			if (item > 0) {
				this.rentAmount = item
			}
		}

		if (type == "tds") {
			this.tdsRate = item;
		}

		if (type == "gst") {
			this.gstRate = item;
		}

		if (type == "increment_type") {
			this.incrementAmount = 0;
			this.incrementRate = null;
			this.incrementType = (item.name != null && item.name == '%') ? 1 : 2
			if (this.incrementType == 1) {
				this.rentForm.get('increment_rate').setValidators([Validators.required]);
				this.rentForm.get('increment_rate').updateValueAndValidity();
				this.rentForm.get('increment_amount').clearValidators();
				this.rentForm.get('increment_amount').updateValueAndValidity();

			} else if (this.incrementType == 2) {
				this.reteWiseAmountIncrement = false
				this.rentForm.get('increment_amount').setValidators([Validators.required]);
				this.rentForm.get('increment_amount').updateValueAndValidity();
				this.rentForm.get('increment_rate').clearValidators();
				this.rentForm.get('increment_rate').updateValueAndValidity();

			}
		}

		if (type == "increment_rate") {
			this.incrementRate = item;
			this.reteWiseAmountIncrement = false
			if (this.rentAmount != null && this.rentAmount > 0) {
				this.incrementAmount = this.rentAmount * (this.incrementRate / 100);
				this.reteWiseAmountIncrement = true

			}

		}

		if (type == "increment_amount") {
			this.reteWiseAmountIncrement = false
			this.incrementAmount = item;

		}
		if (type == 'increment_date') {
			// 
		}
		if (type == 'period_end') {
			// 
		}
		if (type == 'payment_date') {
			// 
		}


	}

	onFileChange(e) {
		let files = <Array<File>>e.target.files;
		for (let i = 0; i < files.length; i++) {
			this.fileData.append("rent_bill_copy", files[i], files[i]['name']);
		}
	}

	onSubmitForm() {

		let rentAmt = Number(this.rentForm.value.rent_amount);
		let secDeposite = Number(this.rentForm.value.security_deposit);
		let paymentAmt = rentAmt;
		let tds = Number(this.rentForm.value.tds_rate);
		let gst = Number(this.rentForm.value.gst_rate);
		let tdsAmt = (tds > 0) ? Math.round(rentAmt * (tds / 100)) : 0;
		let gstAmt = (gst > 0) ? Math.round(rentAmt * (gst / 100)) : 0;

		if (tds > 0) {
			paymentAmt = paymentAmt - tdsAmt;
		}
		if (gst > 0) {
			paymentAmt = paymentAmt + gstAmt;
		}
		if (tds == 0 && gst == 0) {
			paymentAmt = paymentAmt;
		}

		let data = {
			godown_id: this.rentForm.value.godown_id,
			state_id: this.rentForm.value.state_id,
			sub_org_id: this.rentForm.value.sub_org_id,
			tds_rate: Number(this.rentForm.value.tds_rate),
			gst_rate: Number(this.rentForm.value.gst_rate),
			security_deposit: Number(this.rentForm.value.security_deposit),
			rent_amount: Number(this.rentForm.value.rent_amount),
			period_start: this.rentForm.value.period_start,
			period_end: this.rentForm.value.period_end,
			area_sq_ft: Number(this.rentForm.value.area_sq_ft),
			rate_per_sq_ft: Number(this.rentForm.value.rate_per_sq_ft),
			increment_rate: Number(this.rentForm.value.increment_rate),
			increment_amount: Number(this.incrementAmount),
			increment_date: this.rentForm.value.increment_date,
			increment_type: this.incrementType,
			remark: this.rentForm.value.remark,
			rent_type: this.rentForm.value.rent_aggrement_purpose,
			payment_day: moment(Number(this.rentForm.value.payment_date)).format("DD"),
			increment_by_month: Number(this.rentForm.value.increment_by_month),
			gst_amount: gstAmt,
			tds_amount: tdsAmt,
			total_payment: paymentAmt,
			charges_type: Number(this.rentForm.value.charges_type),
		};

		let body = {
			data: data
		};

		if (this.fileData.get('rent_bill_copy') == null) {
			body['id'] = this.id;
			this.addUpdateData("Update", body);
			this.rentForm.reset();
		} else {
			this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res_aws => {
				if (res_aws != null) {
					let file_path = res_aws.uploads["rent_bill_copy"][0].location;
					body.data['rent_copy'] = file_path;
					this.fileData = new FormData();
				}
				if (this.id == null) {
					this.addUpdateData("Add", body);
					this.rentForm.reset();
				} else {
					body['id'] = this.id;
					this.addUpdateData("Update", body);
					this.rentForm.reset();
				}
			});
		}
	}

	addUpdateData(type, body) {
		if (type == "Add") {
			this.crudServices.addData<any>(RentMaster.add, body).subscribe((res) => {
				// this.loadingBtn = false;
				if (res.code == 100) {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getCols();
					this.closeModal();
				} else {
					this.toasterService.pop(res.message, res.data, res.data);
				}
			});
		} else {
			this.crudServices.updateData<any>(RentMaster.update, body).subscribe((res) => {
				// this.loadingBtn = false;
				if (res.code == 100) {
					this.toasterService.pop('success', 'Success', res['data']);
					this.data = null;
					this.getCols();
					this.closeModal();
				} else {
					this.toasterService.pop(res.message, res.data, res.data);

				}
			});
		}
	}


	closeModal() {
		// 
		this.godownSelect = false;
		this.id = null;

		this.isEdit = false;
		this.selected_rent = null;

		this.rentForm.reset();
		this.addRentModal.hide();
		this.viewRentModal.hide();


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
					obj[this.cols[j]["header"]] = final_data[i][this.cols[j]["field"]];
				}
			}
			exportData.push(obj);
		}
		let foot = {};
		for (let j = 0; j < this.cols.length; j++) {
			if (this.cols[j]["field"] != "action") {
				if (this.cols[j]["field"] == "rate") {
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
	patchVAl(data) {
		this.rentForm.reset();
		this.godownSelect = (data.godown_id == null || data.godown_id == 0) ? false : true;
		this.isTDS = (data.tds_rate > 0) ? true : false;
		this.isGST = (data.gst_rate > 0) ? true : false;
		this.incrementType = (data.increment_type == 1) ? 1 : 2;

		// if(data.increment_type==1)
		if (data.increment_by_rate_amt == 1) {
			this.incrementType = 1;
			this.reteWiseAmountIncrement = true;
		}
		else {
			this.incrementType = 2;
			this.reteWiseAmountIncrement = false;
		}

		this.rentForm.patchValue({
			rent_aggrement_purpose: data.rent_type,
			godown_id: data.godown_id,
			state_id: data.state_id,
			sub_org_id: data.sub_org_id,
			tds_rate: data.tds_rate,
			gst_rate: data.gst_rate,
			security_deposit: data.security_deposit,
			rent_amount: data.rent_amount,
			period_start: data.period_start,
			period_end: data.period_end,
			area_sq_ft: data.area_sq_ft,
			rate_per_sq_ft: data.rate_per_sq_ft,
			increment_rate: data.increment_rate,
			increment_amount: data.increment_amount,
			increment_date: data.increment_date,
			payment_date: data.payment_day,
			payment_day: data.payment_date,
			increment_by_month: data.increment_by_month,
			charges_type: data.charges_type,
			increment_type: data.increment_type,
			total_payment: data.total_payment,

		});
		// month_year_payment: data.month_year_payment,

		this.rentForm.get('rent_copy').clearValidators();
		this.rentForm.get('rent_copy').updateValueAndValidity();
		this.addRentModal.show();
	}

	godownAdd() {
		this.router.navigate(["masters/godown-master"]);
	}

	newRentTypeAdd() {
		this.router.navigate(["masters/rent-type-master"]);
	}

	selectGodown($e, type) {
		if (type == 'rent_type') {
			this.rentForm.get('godown_id').clearValidators();
			this.rentForm.get('godown_id').updateValueAndValidity();

			if ($e.type == 'godown' || $e.type == 'Godown') {
				this.godownSelect = true;
				this.rentForm.get('godown_id').setValidators([Validators.required]);
				this.rentForm.get('godown_id').updateValueAndValidity()
			}
			else {
				this.godownSelect = false;
				this.rentForm.patchValue({ godown_id: null });
			}
		}
		if (type == "godown_select") {
			// 
		}
	}

	changeStatus(status, id) {
		let data = {}
		if (status == 1) {
			data['status'] = 0
		} else {
			data['status'] = 1
		}
		this.crudServices.updateData<any>(RentMaster.update, { data: data, id: id }).subscribe(response => {
			this.toasterService.pop(response.message, response.message, response.data)
			this.getCols();
		})

	}

	paymentRequestRent(item) {
		this.paymentList = null;
		this.rowExpansion = null;
		this.rowExpansion = item.id;
		this.crudServices.getOne<any>(SubOrg.getRentMasterPayment, {
			record_id: item.id
		}).subscribe(res => {
			if (res.length > 0) {
				this.paymentList = res;
			}
		});



	}

}
