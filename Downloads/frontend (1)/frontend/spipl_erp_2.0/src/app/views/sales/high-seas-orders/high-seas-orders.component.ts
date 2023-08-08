import { Component, OnInit, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
import { GenerateSoHighSeasService } from "../../../shared/generate-doc/generate-so-high-seas";
import { GenerateInvoiceHighSeasService } from "../../../shared/generate-doc/generate-invoice-high-seas";
import {
	HighSeasOrders,
	CommonApis,
	FileUpload,
	DispatchPayments,
	SpiplBankMaster
} from '../../../shared/apis-path/apis-path';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import * as moment from "moment";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
	selector: 'app-high-seas-orders',
	templateUrl: './high-seas-orders.component.html',
	styleUrls: ['./high-seas-orders.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		ExportService,
		AmountToWordPipe,
		CurrencyPipe,
		Calculations,
		CommonService,
		GenerateSoHighSeasService,
		GenerateInvoiceHighSeasService
	],
})

export class HighSeasOrdersComponent implements OnInit {

	@ViewChild("generateInvoiceModal", { static: false }) public generateInvoiceModal: ModalDirective;
	@ViewChild("uploadPiModal", { static: false }) public uploadPiModal: ModalDirective;
	@ViewChild("uploadAgreementModal", { static: false }) public uploadAgreementModal: ModalDirective;
	@ViewChild("viewDealModal", { static: false }) public viewDealModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "High Seas Orders List"
	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	popoverMessage2: string = 'Are you sure, you want to Approve this Deal?';
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

	datePickerConfig: any = staticValues.datePickerConfig;
	statusList: any = [];
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	isRange: any;

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
	company_bank_details: any = null;

	constructor(
		private toasterService: ToasterService,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private amountToWord: AmountToWordPipe,
		private currencyPipe: CurrencyPipe,
		private calculations: Calculations,
		private commonService: CommonService,
		private generateSoHighSeas: GenerateSoHighSeasService,
		private generateInvoiceHighSeas: GenerateInvoiceHighSeasService
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

		if (this.role_id == 1) {
			this.statusList = staticValues.sales_orders_status_ssurisha;
			this.selected_status = this.statusList[0];
		} else {
			if (this.company_id == 1) {
				this.statusList = staticValues.sales_orders_status_spipl;
				this.selected_status = this.statusList[0];
			} else if (this.company_id == 2) {
				this.statusList = staticValues.sales_orders_status_ssurisha;
				this.selected_status = this.statusList[0];
			} else {
				this.statusList = [];
				this.selected_status = null;
			}
		}
	}

	ngOnInit() {
		this.getSpiplBank();
		this.initForm();
		this.getCols();
	}

	getSpiplBank() {
		this.crudServices.getOne<any>(SpiplBankMaster.getOne, {
			id: 2
		}).subscribe(res => {
			if (res.length > 0) {
				this.company_bank_details = {
					account_no: res[0].account_no,
					bank_name: res[0].bank_name,
					branch_name: res[0].branch_name,
					ifsc_code: res[0].ifsc_code
				};
			}
		});
	}

	initForm() {
		this.uploadPiForm = new FormGroup({
			so_sign_copy: new FormControl(null, Validators.required)
		});
		this.uploadAgreementForm = new FormGroup({
			high_agreement_copy: new FormControl(null, Validators.required)
		});
		this.generateInvoiceForm = new FormGroup({
			hsi_id: new FormControl(null),
			import_local_flag: new FormControl(null),
			con_id: new FormControl(null),
			exchange_rate: new FormControl(null, Validators.required),
			invoice_no: new FormControl(null, Validators.required),
			invoice_date: new FormControl(null, Validators.required),
			bl_no: new FormControl(null),
			bl_date: new FormControl(null),
			container_lines: new FormControl(null, Validators.required),
			vessel: new FormControl(null, Validators.required),
			custom_house: new FormControl(null, Validators.required),
			// custom_house_2: new FormControl(null, Validators.required),
			// shipping_name: new FormControl(null, Validators.required),
			// custom_r_no: new FormControl(null, Validators.required),
			// shipping_address: new FormControl(null, Validators.required),
			commercial_invoice_no: new FormControl(null, Validators.required),
			authorized_person_name: new FormControl(null, Validators.required),
			witness_1_name: new FormControl(null, Validators.required),
			witness_1_address: new FormControl(null, Validators.required),
			witness_1_pan: new FormControl(null, Validators.required),
			witness_2_name: new FormControl(null, Validators.required),
			witness_2_address: new FormControl(null, Validators.required),
			witness_2_pan: new FormControl(null, Validators.required)
		});
	}

	getSalesOrders() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(HighSeasOrders.getHighSeasOrders, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			company_id: (this.role_id == 1) ? null : this.company_id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.days_left = this.countDaysLeft(element.booking_date, element.extend_days, element.company_id)
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
		// if (this.selected_status.id == 0) {
		this.cols = [
			{ field: "id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "port_name", header: "Port", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "final_rate", header: "Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "booking_date", header: "Booking Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "payment_term_label", header: "Payment Term", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null }
		];
		this.filter = ['customer', 'zone', 'port_name', 'main_grade', 'grade_name'];
		this.selected_cols = this.cols;
		this.getSalesOrders();
		// }
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

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
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
		// this.pushDropdown(this.data);
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		// this.pushDropdown(dt.filteredValue);
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
		this.generateInvoiceForm.reset();
		this.generateInvoiceModal.hide();
		this.uploadPiForm.reset();
		this.uploadPiModal.hide();
		this.uploadAgreementForm.reset();
		this.uploadAgreementModal.hide();
		this.viewDealModal.hide();
	}

	onAction(item, type) {
		if (type == 'Add High Seas Order') {
			this.router.navigate(["sales/add-high-seas-order"]);
		} else if (type == 'View') {
			this.selected_deal = item;
			this.viewDealModal.show();
		} else if (type == 'Edit') {
			this.router.navigate(["sales/edit-high-seas-order", item.id]);
		} else if (type == 'Delete') {
			this.crudServices.deleteData(HighSeasOrders.delete, {
				id: item.id
			}).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', 'Order Deleted');
					this.getSalesOrders();
				}
			});
		} else if (type == 'Generate_PI') {
			this.selected_deal = item;
			this.generateSoHighSeas.generateSo(item, this.company_bank_details).then(async (pdfObj) => {
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
							this.crudServices.updateData(HighSeasOrders.update, body).subscribe(result => {
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
		} else if (type == 'Upload_PI') {
			this.selected_deal = item;
			this.uploadPiForm.reset();
			this.uploadPiModal.show();
		} else if (type == 'Download_PI') {
			if (item.so_sign_copy != null) {
				window.open(item.so_sign_copy, "_blank");
			} else {
				window.open(item.so_copy, "_blank");
			}
		} else if (type == 'Generate_Invoice') {
			this.selected_deal = item;
			this.generateInvoiceForm.reset();
			this.generateInvoiceForm.patchValue({
				hsi_id: item.hsi_id,
				import_local_flag: item.import_local_flag,
				con_id: item.id,
				exchange_rate: item.exchange_rate,
				invoice_no: item.invoice_no,
				invoice_date: (item.invoice_date != null) ? new Date(item.invoice_date) : null,
				bl_no: item.bl_no,
				bl_date: (item.bl_date != null) ? new Date(item.bl_date) : null,
				container_lines: item.container_lines,
				vessel: item.vessel,
				custom_house: item.custom_house,
				commercial_invoice_no: item.commercial_invoice_no,
				authorized_person_name: item.authorized_person_name,
				witness_1_name: item.witness_1_name,
				witness_1_address: item.witness_1_address,
				witness_1_pan: item.witness_1_pan,
				witness_2_name: item.witness_2_name,
				witness_2_address: item.witness_2_address,
				witness_2_pan: item.witness_2_pan
			});
			this.generateInvoiceModal.show();
		} else if (type == 'Upload_Agreement') {
			this.selected_deal = item;
			this.uploadAgreementForm.reset();
			this.uploadAgreementModal.show();
		} else if (type == 'Download_Agreement') {
			window.open(item.high_agreement_copy, "_blank");
		} else if (type == 'Status') {
			let body = {
				data: {
					status: (item.status == 0) ? 1 : 0
				},
				id: item.id
			};
			this.crudServices.updateData(HighSeasOrders.update, body).subscribe(res => {
				if (res['code'] == '100') {
					this.toasterService.pop('success', 'Success', 'Order Approved');
					this.getSalesOrders();
				}
			});
		} else if (type == 'Payment') {
			let payment_due_date = moment(item.dispatch_date).add(item.payment_term, "days").format("YYYY-MM-DD");
			let total_amount = Number(item.base_amount) * Number(item.exchange_rate);
			let payment_received_date = null;
			let status = 0;
			let balance_advance = 0;
			let received_amount = 0;

			// if (Number(item.advance_amount) >= Number(total_amount)) {
			// 	received_amount = Number(total_amount);
			// 	balance_advance = Number(item.advance_amount) - Number(total_amount);
			// 	status = 1;
			// } else {
			// 	received_amount = Number(item.advance_amount);
			// 	balance_advance = Number(total_amount) - Number(item.advance_amount);
			// 	status = 0;
			// }

			if (status == 1) {
				payment_received_date = new Date();
			}
			let data = {
				dispatch_id: item.dispatch_id,
				sub_org_id: item.sub_org_id,
				invoice_no: item.invoice_no.toUpperCase(),
				invoice_date: item.invoice_date,
				virtual_acc_no: item.virtual_acc_no,
				total_amount: total_amount,
				payment_type: 1,
				payment_due_date: payment_due_date,
				received_amount: received_amount,
				payment_received_date: payment_received_date,
				status: status,
				import_local_flag: item.import_local_flag
			};
			let body = {
				data: data,
				fp_id: item.fp_id,
				con_id: item.con_id
			};
			this.crudServices.addData<any>(DispatchPayments.add, body).subscribe(res => {
				if (res.code === '100') {
					this.toasterService.pop('success', 'Success', "Proceed for Payment");
					this.getCols();
				}
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
			this.getSalesOrders();
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
			this.crudServices.updateData(HighSeasOrders.update, body).subscribe(result => {
				if (result) {
					this.toasterService.pop('success', 'Success', 'Sign PI Uploaded Successfully');
					this.closeModal();
					this.getCols();
				}
			})
		})
	}

	submitAgreementForm() {
		this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res_aws => {
			let path = res_aws.uploads.sales_order_pdf[0].location;
			let body = {
				id: this.selected_deal.id,
				data: {
					high_agreement_copy: path
				}
			};
			this.crudServices.updateData(HighSeasOrders.update, body).subscribe(result => {
				if (result) {
					this.toasterService.pop('success', 'Success', 'Agreement Uploaded Successfully');
					this.closeModal();
					this.getCols();
				}
			});
		});
	}

	submitGenerateInvoiceForm() {
		let body = {
			hs_invoice_data: {
				con_id: this.generateInvoiceForm.value.con_id,
				bl_no: this.generateInvoiceForm.value.bl_no,
				bl_date: this.generateInvoiceForm.value.bl_date,
				invoice_no: this.generateInvoiceForm.value.invoice_no,
				invoice_date: this.generateInvoiceForm.value.invoice_date,
				exchange_rate: this.generateInvoiceForm.value.exchange_rate,
				container_lines: this.generateInvoiceForm.value.container_lines,
				vessel: this.generateInvoiceForm.value.vessel,
				custom_house: this.generateInvoiceForm.value.custom_house,
				commercial_invoice_no: this.generateInvoiceForm.value.commercial_invoice_no,
				authorized_person_name: this.generateInvoiceForm.value.authorized_person_name,
				witness_1_name: this.generateInvoiceForm.value.witness_1_name,
				witness_1_pan: this.generateInvoiceForm.value.witness_1_pan,
				witness_1_address: this.generateInvoiceForm.value.witness_1_address,
				witness_2_name: this.generateInvoiceForm.value.witness_2_name,
				witness_2_pan: this.generateInvoiceForm.value.witness_2_pan,
				witness_2_address: this.generateInvoiceForm.value.witness_2_address
			},
			// dispatch_bill_data: {
			// 	import_local_flag: this.generateInvoiceForm.value.import_local_flag,
			// 	dispatch_id: this.generateInvoiceForm.value.dispatch_id,
			// 	invoice_no: this.generateInvoiceForm.value.invoice_no,
			// 	invoice_date: this.generateInvoiceForm.value.invoice_date,
			// 	invoice_copy: null,
			// 	status: 1
			// },
			con_id: this.generateInvoiceForm.value.con_id,
			type: "Add"
		};
		this.crudServices.updateData(HighSeasOrders.updateHighSeasInvoice, body).subscribe(result => {
			if (result['code'] == '100') {
				this.toasterService.pop('success', 'Success', 'Invoice Generated Successfully');
				this.closeModal();
				this.getCols();
				this.crudServices.getOne<any>(HighSeasOrders.getHighSeasOrders, {
					id: result['data']
				}).subscribe(res => {
					if (res.code == '100') {
						if (res.data.length > 0) {
							this.generateInvoiceHighSeas.generateInvoice(res.data[0]).then(async (pdfObj) => {
								let pdfOBjFromData = pdfObj;
								await pdfMake.createPdf(pdfOBjFromData).getBlob(pdf_file => {
									if (pdf_file) {
										this.fileData.append('sales_order_pdf', pdf_file, 'so.pdf')
										this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
											let path = res.uploads.sales_order_pdf[0].location;
											let body = {
												hs_invoice_data: {
													invoice_copy: path
												},
												con_id: result['data'],
												type: "Edit"
											};
											this.crudServices.updateData(HighSeasOrders.updateHighSeasInvoice, body).subscribe(result => {
												this.getCols();
											});
										});
									}
								});
							});
						}
					}
				});
			}
		});
	}

	onFileChange(e) {
		let files = <Array<File>>e.target.files;
		for (let i = 0; i < files.length; i++) {
			this.fileData.append("sales_order_pdf", files[i], files[i]['name']);
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
				} else if (this.selected_cols[j]["field"] == "final_rate" ||
					this.selected_cols[j]["field"] == "freight_rate") {
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

}

