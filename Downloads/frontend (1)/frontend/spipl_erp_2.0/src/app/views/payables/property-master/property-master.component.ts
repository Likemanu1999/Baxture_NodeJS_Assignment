import { Component, OnInit, ViewEncapsulation, ViewChild, Input, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Table } from "primeng/table";
import { staticValues, CommonService } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { PropertyMaster } from '../../../shared/apis-path/apis-path';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import * as moment from "moment";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
	selector: 'app-property-master',
	templateUrl: './property-master.component.html',
	styleUrls: ['./property-master.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		ExportService,
		CurrencyPipe,
		CommonService
	]
})

export class PropertyMasterComponent implements OnInit {

	@ViewChild("addPropertyModal", { static: false }) public addPropertyModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Property Master List"
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
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

	datePickerConfig: any = staticValues.datePickerConfig;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	propertyStatusList: any = staticValues.property_status_list;
	propertyForm: FormGroup;
	selected_property: any = null;
	cols: any = [];
	data: any = [];
	filter: any = [];

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
	}

	ngOnInit() {
		this.initForm();
		this.getCols();
	}

	initForm() {
		this.propertyForm = new FormGroup({
			property_name: new FormControl(null, Validators.required),
			owner_name: new FormControl(null, Validators.required),
			document_type: new FormControl(null, Validators.required),
			mortgaged_to: new FormControl(null, Validators.required),
			property_area: new FormControl(null, Validators.required),
			property_address: new FormControl(null, Validators.required),
			is_valuation_done: new FormControl(null, Validators.required),
			is_tsr_done: new FormControl(null, Validators.required),
			is_completion_certificate_received: new FormControl(null, Validators.required),
			is_possesion_letter_received: new FormControl(null, Validators.required),
			is_no_dues_certificate_received: new FormControl(null, Validators.required),
			is_property_tax_name_change: new FormControl(null, Validators.required),
			is_mseb_name_change: new FormControl(null, Validators.required),
			is_shares_certificate_received: new FormControl(null, Validators.required),
			is_society_formed: new FormControl(null, Validators.required),
			is_name_registered_on_7_12_8a: new FormControl(null, Validators.required),
			is_demarcation_done: new FormControl(null, Validators.required),
			remark: new FormControl(null),
		});
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(PropertyMaster.getPropertyMasterList, {
			from_date: this.selected_date_range[0],
			to_date: this.selected_date_range[1]
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.valuation_done = this.getPropertStatus(element.is_valuation_done);
						element.tsr_done = this.getPropertStatus(element.is_tsr_done);
						element.completion_certificate_received = this.getPropertStatus(element.is_completion_certificate_received);
						element.possesion_letter_received = this.getPropertStatus(element.is_possesion_letter_received);
						element.no_dues_certificate_received = this.getPropertStatus(element.is_no_dues_certificate_received);
						element.property_tax_name_change = this.getPropertStatus(element.is_property_tax_name_change);
						element.mseb_name_change = this.getPropertStatus(element.is_mseb_name_change);
						element.shares_certificate_received = this.getPropertStatus(element.is_shares_certificate_received);
						element.society_formed = this.getPropertStatus(element.is_society_formed);
						element.name_registered_on_7_12_8a = this.getPropertStatus(element.is_name_registered_on_7_12_8a);
						element.demarcation_done = this.getPropertStatus(element.is_demarcation_done);
					});
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
			{ field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "property_name", header: "Property Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "owner_name", header: "Owner Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "document_type", header: "Document Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "mortgaged_to", header: "Mortgaged To", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "property_address", header: "Property Address", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "property_area", header: "Property Area", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "valuation_done", header: "Is Valuation Done", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "tsr_done", header: "Is TSR Done", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "completion_certificate_received", header: "Is Completion Certificate Received", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "possesion_letter_received", header: "Is Possesion Letter Received", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "no_dues_certificate_received", header: "Is No Dues Certificate Received", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "property_tax_name_change", header: "Is Property Tax Name Change", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "mseb_name_change", header: "Is MSEB Name Change", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "shares_certificate_received", header: "Is Shares Certificate Received", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "society_formed", header: "Is Society Formed", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "name_registered_on_7_12_8a", header: "Is Name Registered On 7/12 & 8A", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "demarcation_done", header: "Is Demarcation Done", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "remark", header: "Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "status", header: "Status", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['id', 'property_name', 'owner_name', 'document_type', 'mortgaged_to', 'property_address'];
		this.getData();
	}

	@Input() get selectedColumns(): any[] {
		localStorage.setItem(
			"selected_property_col",
			JSON.stringify(this.cols)
		);
		return this.cols;
	}

	set selectedColumns(val: any[]) {
		this.cols = this.cols.filter((col) => val.includes(col));
		this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}
	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;

	}
	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}

	getColumnPresent(col) {
		if (this.cols.find((ob) => ob.field === col)) {
			return true;
		} else {
			return false;
		}
	}

	pushDropdown(arg) {
		let data = null;
		if (arg) {
			data = arg.filter(item => item != null && item !== ''); 
		} else {
			data = this.data && this.data.length > 0 ? this.data.filter(item => item != null && item !== '') : [];
		}
		let filter_cols = this.cols.filter(col => col.filter == true);
		filter_cols.forEach(element => {
			let unique = data.map(item =>
				item[element.field]
			).filter((value, index, self) =>
			value != null && value !== '' && self.indexOf(value) === index 
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
			}

		});
	}

	customFilter(value, col, data) {
		let res = this.table.filter(value, col, data);
		this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		this.pushDropdown(dt.filteredValue);
		this.footerTotal(dt.filteredValue);
	}

	getPropertStatus(value) {
		let result = this.propertyStatusList.find(o => o.id === value);
		return result.name;
	}

	onAction(item, type) {
		if (type == 'Add') {
			this.propertyForm.reset();
			this.propertyForm.patchValue({
				is_valuation_done: 0,
				is_tsr_done: 0,
				is_completion_certificate_received: 0,
				is_possesion_letter_received: 0,
				is_no_dues_certificate_received: 0,
				is_property_tax_name_change: 0,
				is_mseb_name_change: 0,
				is_shares_certificate_received: 0,
				is_society_formed: 0,
				is_name_registered_on_7_12_8a: 0,
				is_demarcation_done: 0,
			});
			this.addPropertyModal.show();
		}
		if (type == 'View') {
			this.selected_property = item;
		}
		if (type == 'Edit') {
			this.isEdit = true;
			this.propertyForm.reset();
			this.propertyForm.patchValue({
				property_name: null
			});
			this.addPropertyModal.show();
		}
	}

	onSubmitForm() {
		let data = {
			property_name: this.propertyForm.value.property_name,
			owner_name: this.propertyForm.value.owner_name,
			document_type: this.propertyForm.value.document_type,
			mortgaged_to: this.propertyForm.value.mortgaged_to,
			property_area: this.propertyForm.value.property_area,
			property_address: this.propertyForm.value.property_address,
			is_valuation_done: Number(this.propertyForm.value.is_valuation_done),
			is_tsr_done: Number(this.propertyForm.value.is_tsr_done),
			is_completion_certificate_received: Number(this.propertyForm.value.is_completion_certificate_received),
			is_possesion_letter_received: Number(this.propertyForm.value.is_possesion_letter_received),
			is_no_dues_certificate_received: Number(this.propertyForm.value.is_no_dues_certificate_received),
			is_property_tax_name_change: Number(this.propertyForm.value.is_property_tax_name_change),
			is_mseb_name_change: Number(this.propertyForm.value.is_mseb_name_change),
			is_shares_certificate_received: Number(this.propertyForm.value.is_shares_certificate_received),
			is_society_formed: Number(this.propertyForm.value.is_society_formed),
			is_name_registered_on_7_12_8a: Number(this.propertyForm.value.is_name_registered_on_7_12_8a),
			is_demarcation_done: Number(this.propertyForm.value.is_demarcation_done),
			remark: this.propertyForm.value.remark
		};
		let body = {
			data: data
		};
		if (this.isEdit) {
			body['id'] = this.selected_property.id;
			this.crudServices.updateData(PropertyMaster.update, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getCols();
					this.closeModal();
				}
			  if (res['code'] == '100') {
				this.toasterService.pop('success', 'Success', res['data']);
				this.getCols();
				this.closeModal();
			  }
			});
		} else {
			this.crudServices.addData(PropertyMaster.add, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', res['data']);
					this.getCols();
					this.closeModal();
				}
			});
		}
	}

	closeModal() {
		this.isEdit = false;
		this.selected_property = null;
		this.propertyForm.reset();
		this.addPropertyModal.hide();
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

}
