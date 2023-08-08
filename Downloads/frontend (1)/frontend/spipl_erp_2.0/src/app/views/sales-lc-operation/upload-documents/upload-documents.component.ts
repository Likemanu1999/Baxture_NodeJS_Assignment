import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { staticValues } from '../../../shared/common-service/common-service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import {
	SpiplBankMaster,
	PercentageDetails,
	SalesPi,
	SalesLc,
	ValueStore,
	SalesBex,
	SubOrg,
	ChargesMasters,
	DispatchNew,
	SalesOrders,
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
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-upload-documents',
	templateUrl: './upload-documents.component.html',
	styleUrls: ['./upload-documents.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [ExportService, ToasterService, PermissionService, LoginService, CrudServices, Calculations]
})
export class UploadDocumentsComponent implements OnInit {

	@ViewChild("createModal", { static: false }) public createModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = " Sales LC List"
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
	minDate: any = new Date();
	maxDate: any = new Date();

	cols: any = [];
	data: any = [];
	dataOne: any = [];
	filter: any = [];
	checked: any = [];

	uploadForm: FormGroup;

	lc_payment_terms: any = [];
	spipl_banks: any = [];
	percentValues: any = [];

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
	invoice_no_list: any = [];
	companyId: any;
	fileData: FormData = new FormData();
	filesToUpload: Array<File> = [];
	filesArr: Array<File> = [];
	lc_id: any;
	copy_arr: any[];
	body: {};
	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private exportService: ExportService,
		private crudServices: CrudServices,
		private calculations: Calculations
	) {
		let user: UserDetails = this.loginService.getUserDetails();
		this.links = user.links;
	}

	ngOnInit() {
		this.initForm();
		this.getSpiplbanks();
		this.getCols();
	}

	initForm() {
		this.uploadForm = new FormGroup({
			invoice_copy: new FormControl(null, Validators.required),
			eway_copy: new FormControl(null),
			lc_lr_copy: new FormControl(null)
		});
	}

	getSpiplbanks() {
		this.crudServices.getAll<any>(SpiplBankMaster.getAll).subscribe(res_bank => {
			if (res_bank.length > 0) {
				this.spipl_banks = res_bank;
			}
		});
	}

	getCols() {
		this.cols = [
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: "Action" },
			{ field: "sub_org_name", header: "Customer", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "lc_no", header: "LC No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "lc_date", header: "LC Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "lc_amount", header: "LC Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "bank_name", header: "LC Opening Bank", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "invoice_copy", header: "Invoice Copy", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "copy" },
			{ field: "eway_copy", header: "Eway Bill", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "copy" },
			{ field: "lc_lr_copy", header: "LR Copy", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "copy" },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['sub_org_name', 'lc_no', 'bank_name'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SalesLc.getOne, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			company_id: (this.role_id == 1) ? null : this.company_id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				this.data = res.data;
				if(this.data != null || this.data != undefined){
					this.data = res.data.map(item =>{
						item.invoice_copy = item.invoice_copy? item.invoice_copy.split(',') : '';
						item.eway_copy = item.eway_copy? item.eway_copy.split(',') : '';
						item.lc_lr_copy = item.lc_lr_copy? item.lc_lr_copy.split(',') : '';
						return item
					})
				}
			
				console.log(this.data)
				
				this.pushDropdown(this.data);
				this.footerTotal(this.data);
			}
		});
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
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

	onFileChange(e) {
		//this.filesArr = <Array<File>>e.target.files;
		const files: FileList = e.target.files;
    
		if (files && files.length > 0) {
		  for (let i = 0; i < files.length; i++) {
			this.filesArr.push(files[i]);
		  }
		}
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

	onAction(item, type) {
		if (type == 'Upload') {
			this.lc_id = item.id
			this.dataOne = item
			this.createModal.show();
		} else if (type == 'Download') {
			this.copy_arr = [];
			this.copy_arr.push(item);
			let images_arr = this.copy_arr;
			this.crudServices.downloadMultipleFiles(images_arr);
		}
	}

	// onChangeInvoice(item) {
	// 	let bex_amount = 0;
	// 	if (item != null && item != undefined) {
	// 		bex_amount = item.total_amount;
	// 	}
	// 	this.bexForm.patchValue({
	// 		bex_amount: bex_amount
	// 	});
	// }

	submitForm() {
		this.body = {}
		const fileData: FormData = new FormData();
		const files: Array<File> = this.filesArr;
	
			for (let i = 0; i < files.length; i++) {
				fileData.append('invoice_copy', files[i], files[i]['name']);
				fileData.append('eway_copy', files[i], files[i]['name']);
				fileData.append('lc_lr_copy', files[i], files[i]['name']);
			  }
		
		this.crudServices.fileUpload(FileUpload.upload,fileData).subscribe(res_aws => {
			let invoice_copy = null;
			let eway_copy = null;
			let lc_lr_copy = null;
			
			if (res_aws != null && res_aws.uploads != null) {
				invoice_copy = this.dataOne.invoice_copy? this.dataOne.invoice_copy  +','+ res_aws.uploads["invoice_copy"][0].location : res_aws.uploads["invoice_copy"][0].location;
				eway_copy = this.dataOne.eway_copy? this.dataOne.eway_copy +','+ res_aws.uploads["eway_copy"][1].location : res_aws.uploads["eway_copy"][1].location;
				lc_lr_copy = this.dataOne.lc_lr_copy? this.dataOne.lc_lr_copy +','+ res_aws.uploads["lc_lr_copy"][2].location :  res_aws.uploads["lc_lr_copy"][2].location;
			}

			this.body = {
				invoice_copy: invoice_copy,
				eway_copy: eway_copy,
				lc_lr_copy: lc_lr_copy
			};
		
			this.crudServices.updateData<any>(SalesLc.update, {
				id: this.lc_id,
				data: this.body
			}).subscribe(res => {
				if (res.code === '100') {
					this.createModal.hide();
					this.uploadForm.reset();
					this.getCols();
					this.toasterService.pop('success', 'Success', 'Files uploaded Successfully...');
				} else{
					this.toasterService.pop('error', 'Danger', 'Something Went Wrong...');
				}
			})
		})
	}

	closeModel(){
		this.createModal.hide();
		this.uploadForm.reset();
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
