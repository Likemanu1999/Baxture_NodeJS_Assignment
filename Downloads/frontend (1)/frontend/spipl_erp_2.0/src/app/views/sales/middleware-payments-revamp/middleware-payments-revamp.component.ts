import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import { MiddlewarePaymentsUtilizationRevamp, SubOrg } from '../../../shared/apis-path/apis-path';
import { roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';
import * as moment from "moment";

@Component({
	selector: 'app-middleware-payments-revamp',
	templateUrl: './middleware-payments-revamp.component.html',
	styleUrls: ['./middleware-payments-revamp.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService, Calculations]
})

export class MiddlewarePaymentsRevampComponent implements OnInit {

	@ViewChild("modificationModal", { static: false }) public modificationModal: ModalDirective;
	@ViewChild("changesModal", { static: false }) public changesModal: ModalDirective;
	@ViewChild("dt", { static: false }) table: Table;

	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Middleware Payments Utilization";

	popoverTitle: string = 'Warning';
	popoverMessage: string = 'Are you sure, you want to delete?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'right';
	cancelClicked: boolean = false;

	user: UserDetails;
	links: string[] = [];
	role_id: any = null;
	company_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;

	disableAction: boolean = false;
	isLoading: boolean = false;
	isBtnLoading: boolean = false;
	datePickerConfig: any = staticValues.datePickerConfig;
	companyList: any = staticValues.company_list;
	flagTypes: any = staticValues.flag_type;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	selected_company: any = this.companyList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];
	modifyOptions: any = [];
	subOrgList: any = [];
	invoiceList: any = [];
	salesOrdersList: any = [];
	selected_row: any = null;
	changesArr: any = [];
	changeOrganizationForm: FormGroup;
	adjustPaymentForm: FormGroup;
	selectedModifyOption: any = null;
	adjust_type: any = null;

	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;

		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		if (environment.production) {
			this.disableAction = true;
		}
		this.getCols();
		this.initForm();
	}

	initForm() {
		this.changeOrganizationForm = new FormGroup({
			id: new FormControl(null, Validators.required),
			current_sub_org_id: new FormControl(null, Validators.required),
			main_org_id: new FormControl(null, Validators.required),
			sub_org_id: new FormControl(null, Validators.required),
			sub_org_name: new FormControl(null, Validators.required),
			virtual_acc_no: new FormControl(null, Validators.required),
			va_no_flag_wise: new FormControl(null)
		});
		this.adjustPaymentForm = new FormGroup({
			id: new FormControl(null, Validators.required),
			adjust_type: new FormControl(null),
			main_org_id: new FormControl(null),
			sub_org_id: new FormControl(null),
			con_id: new FormControl(null),
			dispatch_id: new FormControl(null),
			invoice_no: new FormControl(null),
			invoice_amount: new FormControl(null),
			va_no_flag_wise: new FormControl(null),
			import_local_flag: new FormControl(null),
			company_id: new FormControl(null)
		});
	}

	getCols() {
		this.cols = [
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "virtual_acc_no", header: "Virtual Account No", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "va_no_flag_wise", header: "VA Number State Wise", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "actual_amount", header: "Actual Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "utilized_amount", header: "Utilized Amount", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "remark", header: "Remark", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "remark_new", header: "Remark New", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "invoice_no", header: "Invoice No", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "con_id", header: "Con ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "category", header: "Category", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Badge" },
			{ field: "payment_type_label", header: "Payment Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: "Badge" },
			{ field: "added_date", header: "Added Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
			{ field: "division", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
		];
		this.filter = ['id', 'con_id', 'invoice_no', 'customer', 'virtual_acc_no'];
		this.getData();
	}

	getData() {
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(MiddlewarePaymentsUtilizationRevamp.getMiddlewareUtilizedPayments, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			company_id: this.selected_company.id
		}).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
			this.table.reset();
		});
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
		this.footerTotal(this.data);
	}

	onFilter(e, dt) {
		this.footerTotal(dt.filteredValue);
	}

	exportData(type) {
		let fileName = this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		for (let i = 0; i < this.data.length; i++) {
			let obj = {};
			for (let j = 0; j < this.cols.length; j++) {
				if (this.cols[j]["field"] != "action") {
					if (this.cols[j]["field"] == "quantity") {
						obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]] + " MT";
					} else {
						obj[this.cols[j]["header"]] = this.data[i][this.cols[j]["field"]];
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
				} else if (this.cols[j]["field"] == "final_rate" ||
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

	submitChangeOrganizationForm() {
		let data = {
			main_org_id: Number(this.changeOrganizationForm.value.main_org_id),
			sub_org_id: Number(this.changeOrganizationForm.value.sub_org_id),
			virtual_acc_no: this.changeOrganizationForm.value.virtual_acc_no,
			va_no_flag_wise: this.changeOrganizationForm.value.va_no_flag_wise
		};

		let org_data = this.subOrgList.find(x => x.sub_org_id == data.sub_org_id);

		let change_remark = "Switch to " + org_data.sub_org_name;

		let body = {
			data: data,
			id: Number(this.changeOrganizationForm.value.id),
			change_remark: change_remark
		};
		this.crudServices.updateData<any>(MiddlewarePaymentsUtilizationRevamp.update, body).subscribe(res => {
			if (res.code == '100') {
				this.toasterService.pop('success', 'Success', 'Organization Is Changed Successfully');
				this.closeModal();
				this.getCols();
			}
		});
	}

	submitAdjustPaymentForm(type) {
		if (type == 'Remove_Payment') {
			let remark_new = 'Payment Recieved Amount of ' + this.selected_row.utilized_amount + ', Virtual Account No.: ' + this.selected_row.virtual_acc_no + ', Added As Suspense';
			let data = {
				actual_amount: this.selected_row.utilized_amount,
				utilized_amount: 0,
				con_id: null,
				dispatch_id: null,
				invoice_no: null,
				invoice_amount: null,
				va_no_flag_wise: null,
				import_local_flag: 0,
				is_utilized: 0,
				remark: remark_new,
				remark_new: remark_new
			};

			let body = {
				data: data,
				id: this.selected_row.id,
				invoice_no: this.selected_row.invoice_no
			};

			this.crudServices.getOne<any>(MiddlewarePaymentsUtilizationRevamp.removePayment, body).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop('success', 'Success', 'Payment Removed Successfully');
					this.closeModal();
					this.getCols();
				}
			});
		}
		if (type == 'Adjust_Payment') {
			let actual_amount = this.selected_row.actual_amount;
			let formData = this.adjustPaymentForm.value;
			let new_obj: any = {};
			let new_suspense = null;

			if (formData.adjust_type == 'Invoice') {
				new_obj = {
					middleware_payment_id: this.selected_row.middleware_payment_id,
					virtual_acc_no: this.selected_row.virtual_acc_no,
					main_org_id: formData.main_org_id,
					sub_org_id: formData.sub_org_id,
					con_id: formData.con_id,
					dispatch_id: formData.dispatch_id,
					invoice_no: formData.invoice_no,
					invoice_amount: formData.invoice_amount,
					va_no_flag_wise: formData.va_no_flag_wise,
					import_local_flag: formData.import_local_flag,
					company_id: formData.company_id,
					payment_reverse: this.selected_row.payment_reverse,
					middleware_bank_acc_no: this.selected_row.middleware_bank_acc_no,
					added_date: Date.now(),
					parent_id: this.selected_row.id,
					actual_amount: actual_amount
				};
				var remark_new = `Adjust Suspense: Payment Adjust Against Invoice Number: ` + new_obj.invoice_no + `, Invoice Value: ` + new_obj.invoice_amount + `, Utilize Amount: ` + new_obj.utilized_amount + `, Virtual Account No. : ` + new_obj.virtual_acc_no + `, New Virtual Id: ` + new_obj.va_no_flag_wise;
				new_obj['remark'] = remark_new;
				new_obj['remark_new'] = remark_new;

				if (actual_amount > formData.invoice_amount) {
					new_obj['utilized_amount'] = formData.invoice_amount;
					new_obj['is_utilized'] = 0;
				} else {
					new_obj['utilized_amount'] = actual_amount;
					new_obj['is_utilized'] = 1;
				}
			}

			let update_obj = {
				is_utilized: 1
			};

			if (new_obj.is_utilized == 0) {
				let suspense_amount = Number(new_obj['actual_amount']) - Number(new_obj['utilized_amount']);
				let suspense_remark = 'Payment Recieved Amount of ' + suspense_amount + ', Virtual Account No.: ' + this.selected_row.virtual_acc_no + ', Added As Suspense';
				new_suspense = {
					middleware_payment_id: this.selected_row.middleware_payment_id,
					virtual_acc_no: this.selected_row.virtual_acc_no,
					main_org_id: formData.main_org_id,
					sub_org_id: formData.sub_org_id,
					import_local_flag: 0,
					company_id: formData.company_id,
					payment_reverse: this.selected_row.payment_reverse,
					middleware_bank_acc_no: this.selected_row.middleware_bank_acc_no,
					added_date: Date.now(),
					parent_id: null,
					actual_amount: suspense_amount,
					utilized_amount: 0,
					con_id: null,
					dispatch_id: null,
					invoice_no: null,
					invoice_amount: null,
					is_utilized: 0,
					remark: suspense_remark,
					remark_new: suspense_remark
				};
			}

			let body = {
				new_data: new_obj,
				new_suspense: new_suspense,
				update_data: update_obj,
				id: Number(this.selected_row.id)
			};

			this.crudServices.getOne<any>(MiddlewarePaymentsUtilizationRevamp.adjustPayment, body).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop('success', 'Success', 'Payment Adjusted Against ' + formData.adjust_type + ' Successfully');
					this.closeModal();
					this.getCols();
				}
			});
		}
	}

	closeModal() {
		this.selected_row = null;
		this.adjust_type = null;
		this.selectedModifyOption = null;
		this.changeOrganizationForm.reset();
		this.adjustPaymentForm.reset();
		this.modificationModal.hide();
		this.changesModal.hide();
	}

	onAction(rowData, type, event) {
		if (type == 'View_Changes') {
			this.changesArr = [];
			this.crudServices.getOne<any>(MiddlewarePaymentsUtilizationRevamp.getChanges, {
				middleware_utilisation_id: rowData.id
			}).subscribe(res => {
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.changesArr = res.data;
						this.changesModal.show();
					} else {
						this.toasterService.pop('error', 'Alert', "No Changes Found");
					}
				}
			});
		}
		if (type == 'Modification') {
			if (rowData.invoice_no != null) {
				this.modifyOptions = [
					{ label: 'Adjust Payment', value: 3 }
				];
			} else {
				if (rowData.import_local_flag != 0) {
					this.modifyOptions = [
						{ label: 'Change Organization', value: 1 },
						{ label: 'Swap Import/Local', value: 2 },
						{ label: 'Adjust Payment', value: 3 }
					];
				} else {
					this.modifyOptions = [
						{ label: 'Change Organization', value: 1 },
						{ label: 'Adjust Payment', value: 3 }
					];
				}
			}
			this.selected_row = rowData;
			this.selectedModifyOption = null;
			this.modificationModal.show();
		}
		if (type == "Modification_Option") {
			this.subOrgList = [];
			this.selectedModifyOption = event;
			if (event.value == 1) { // CHANGE ORGANIZATION
				this.crudServices.getOne<any>(SubOrg.getGroupCustomer, {
					org_id: this.selected_row.main_org_id
				}).subscribe(res => {
					if (res.code == '100') {
						if (res.data.length > 1) {
							res.data.map(x => {
								x.customer = x.sub_org_name + ' (' + x.location_vilage + ')';
								return x;
							});
							this.subOrgList = res.data;
							this.changeOrganizationForm.reset();
							this.changeOrganizationForm.patchValue({
								id: this.selected_row.id,
								current_sub_org_id: this.selected_row.sub_org_id,
								main_org_id: this.selected_row.main_org_id,
								sub_org_id: null,
								sub_org_name: null,
								virtual_acc_no: null,
								va_no_flag_wise: null
							});
						} else {
							this.toasterService.pop('error', 'Alert', "No Branch Found");
						}
					}
				});
			}
			if (event.value == 2) { // SWAP IMPORT/LOCAL
				// 
			}
			if (event.value == 3) { // ADJUST PAYMENT
				this.adjustPaymentForm.reset();
				this.adjustPaymentForm.patchValue({
					id: this.selected_row.id
				});
			}
		}
		if (type == 'Sub_Organization') {
			console.log(event);
			let va_no_flag_wise = null;
			if (event.state_master != null) {
				if (Number(this.selected_row.import_local_flag) == 1) {
					va_no_flag_wise = event.virtual_acc_no + '-IM' + event.state_master.state_code;
				} else if (Number(this.selected_row.import_local_flag) == 2) {
					va_no_flag_wise = event.virtual_acc_no + '-LC' + event.state_master.state_code;
				} else {
					va_no_flag_wise = null;
				}
			}
			if (event.virtual_acc_no != null) {
				this.changeOrganizationForm.patchValue({
					sub_org_name: event.customer,
					virtual_acc_no: event.virtual_acc_no,
					va_no_flag_wise: va_no_flag_wise
				});
			} else {
				this.changeOrganizationForm.patchValue({
					virtual_acc_no: null,
					va_no_flag_wise: null
				});
				this.toasterService.pop('error', 'Alert', "Virtual Account Number Not Found");
			}
		}
		if (type == 'Adjust_Type') {
			if (event != null && event != undefined) {
				this.adjustPaymentForm.reset();
				this.adjustPaymentForm.patchValue({
					id: this.selected_row.id,
					adjust_type: event.target.value
				});
				if (event.target.value == 'Invoice') {
					this.adjust_type = event.target.value;
					this.crudServices.getOne<any>(MiddlewarePaymentsUtilizationRevamp.getSubOrgInvoiceList, {
						virtual_acc_no: this.selected_row.virtual_acc_no
					}).subscribe(res => {
						if (res.code == '100') {
							if (res.data.length > 0) {
								this.invoiceList = res.data;
							}
						}
					});
				}
				if (event.target.value == 'Sales_Order') {
					this.adjust_type = event.target.value;
					this.crudServices.getOne<any>(MiddlewarePaymentsUtilizationRevamp.getSubOrgSalesOrdersList, {
						sub_org_id: this.selected_row.sub_org_id
					}).subscribe(res => {
						if (res.code == '100') {
							if (res.data.length > 0) {
								this.salesOrdersList = res.data;
							}
						}
					});
				}
			}
		}
		if (type == 'Import_Local_Flag') {
			let new_va_no_flag_wise = null;
			let new_import_local_flag = null;
			if (event.id == 1) {
				new_import_local_flag = 1;
				new_va_no_flag_wise = this.selected_row.va_no_flag_wise.replace('-LC', '-IM');
			}
			if (event.id == 2) {
				new_import_local_flag = 2;
				new_va_no_flag_wise = this.selected_row.va_no_flag_wise.replace('-IM', '-LC');
			}

			let data = {
				import_local_flag: new_import_local_flag,
				va_no_flag_wise: new_va_no_flag_wise
			};
			let body = {
				data: data,
				id: Number(this.selected_row.id)
			};
			this.crudServices.updateData<any>(MiddlewarePaymentsUtilizationRevamp.update, body).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop('success', 'Success', 'Flag Is Changed Successfully');
					this.closeModal();
					this.getCols();
				}
			});
		}
		if (type == 'Invoice_No') {
			this.adjustPaymentForm.patchValue({
				main_org_id: event.org_id,
				sub_org_id: event.sub_org_id,
				con_id: event.con_id,
				dispatch_id: event.dispatch_id,
				invoice_no: event.invoice_no,
				invoice_amount: event.total_amount,
				va_no_flag_wise: event.va_no_flag_wise,
				import_local_flag: event.import_local_flag,
				company_id: event.product_type
			});
		}
		if (type == 'Company') {
			if (event != null && event != undefined) {
				this.selected_company = {
					id: event.value.id,
					name: event.value.name
				};
				this.getCols();
			}
		}
		if (type == 'Data_Transfer') {
			this.dataTransfer();
		}
	}

	dataTransfer() {
		this.isLoading = true;
		this.crudServices.getOne<any>(MiddlewarePaymentsUtilizationRevamp.getOldMiddlewareUtilizedPayments, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					let arr = [];
					res.data.forEach(element => {
						let parent_id = null;
						let remark_old = element.remark.toString();

						if (remark_old.includes('NOTE:')) {
							let note_remark = remark_old.slice(remark_old.indexOf('NOTE:') + 1);
							if (note_remark != null && note_remark.match(/\d/g) != null) {
								parent_id = note_remark.match(/\d/g).join("");
							}
						}

						element.remark = element.remark.toString().split('  New').join(', New');
						let remark_arr = (element.remark != null) ? element.remark.split(",") : null;
						let remark_arr_new = [];
						remark_arr.forEach(str => {
							let str_trim = str.toString().split('  ').join(' ');
							let str_title_case = this.toTitleCase(str_trim);
							let str_arr = str_title_case.split(":");
							let key = (str_arr[0] != null && str_arr[0] != undefined) ? str_arr[0].trim() : '';
							let value = (str_arr[1] != null && str_arr[1] != undefined) ? str_arr[1].trim() : '';
							let value_new = (key.includes("Invoice") || key.includes("Virtual")) ? value.toUpperCase() : value;
							let str_new = key + ' : ' + value_new;
							remark_arr_new.push(str_new);
						});
						let remark_new = remark_arr_new.toString().split(',').join(', ');

						let obj = {
							middleware_payment_id: element.middleware_payment_id,
							main_org_id: element.org_id,
							sub_org_id: element.sub_org_id,
							con_id: element.con_id,
							dispatch_id: element.dispatch_id_final,
							invoice_no: element.invoice_number,
							actual_amount: element.actual_amount,
							utilized_amount: element.utilised_amount,
							virtual_acc_no: element.virtual_id,
							va_no_flag_wise: element.vanumber,
							import_local_flag: element.import_local_flag,
							company_id: element.company_id_new,
							remark: element.remark,
							remark_new: remark_new,
							added_date: element.added_at,
							is_transfered: element.is_transfered,
							transfered_date: element.transfered_date,
							middleware_bank_acc_no: element.middleware_bank_acc_no,
							is_restricted: element.is_restricted,
							payment_reverse: element.payment_reverse,
							old_id: element.id,
							old_parent_id: parent_id,
							modified_by: null,
							modified_date: null
						};
						arr.push(obj);
					});

					if (arr.length == res.data.length) {
						this.crudServices.getOne<any>(MiddlewarePaymentsUtilizationRevamp.transferData, arr).subscribe(res_t => {
							this.isLoading = false;
							if (res_t.code == '100') {
								this.toasterService.pop('success', 'Success', res_t['data']);
								this.getData();
							}
						});
					}
				}
			}
		});
	}

	toTitleCase(str) {
		return str.replace(
			/\w\S*/g,
			function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}
		);
	}

}
