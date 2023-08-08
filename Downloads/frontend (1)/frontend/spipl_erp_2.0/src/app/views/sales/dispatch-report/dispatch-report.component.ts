import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import {
	SalesReportsNew,
	DispatchBilling,
	Notifications,
	FileUpload,
	UsersNotification,
	Dispatch,
	DispatchNew,
	FreightTracking
} from '../../../shared/apis-path/apis-path';
import { roundAmount, roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { MessagingService } from '../../../service/messaging.service';
import * as moment from "moment";

@Component({
	selector: 'app-dispatch-report',
	templateUrl: './dispatch-report.component.html',
	styleUrls: ['./dispatch-report.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, ExportService]
})

export class DispatchReportComponent implements OnInit {

	@ViewChild("dt", { static: false }) table: Table;
	@ViewChild("transporterBillModal", { static: false }) public transporterBillModal: ModalDirective;
	@ViewChild("updateFreightModal", { static: false }) public updateFreightModal: ModalDirective;
	@ViewChild("truckImageModal", { static: false }) public truckImageModal: ModalDirective;
	@ViewChild("podModal", { static: false }) public podModal: ModalDirective;
	@ViewChild("lrModal", { static: false }) public lrModal: ModalDirective;
	@ViewChild("uploadedModal", { static: false }) public uploadedModal: ModalDirective;

	popoverTitle: string = 'Warning';
	popoverMessage1: string = 'Are you sure, you want to delete?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';
	popoverMessage2: string = 'Are you sure, you want to Update Freight?';
	popoverMessage3: string = 'Are you sure you want to confirm LR Original Received ?';
	placement2: string = 'right';
	placement3: string = 'left';
	cancelClicked: boolean = false;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;
	datePickerConfig = staticValues.datePickerConfigNew;
	maxDate: Date = new Date();
	toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	page_title: any = "Dispatch Report";
	user: UserDetails;
	lenghtOfRecord: number = 0;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	isLoading: boolean = false;
	add_transporter_bill: boolean = false;
	update_freight: boolean = false;
	statusList: any = staticValues.dispatch_report_status;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	selected_status: any = this.statusList[0];
	cols: any = [];
	data: any = [];
	filter: any = [];
	selectedDispatch: any;
	uplaodedFiles: any;
	truckImageCount: number = 0;
	truckImageNullCount: number = 0;
	lrCount: number = 0;
	lrNullCount: number = 0;
	podCount: number = 0;
	podNullCount: number = 0;
	lrRecCount: number = 0;
	lrRecNullCount: number = 0;
	fileData = new FormData();
	formTransportBill: FormGroup;
	formUpdateFreight: FormGroup;
	formTruckImage: FormGroup;
	formPod: FormGroup;
	formlr: FormGroup;
	transporter_bill_status_data = staticValues.dispatch_report_status;
	notification_details: any;
	notification_tokens = [];
	notification_id_users = [];
	notification_users = [];
	selectedZone: any;
	loadCrossTypeList: any;
	enableLoad: boolean = false;
	enableCross: boolean = false;
	dispatchForm: any;
	quantity: any;
	dispatch_id: any;
	constructor(
		private toasterService: ToasterService,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private messagingService: MessagingService,
	) {
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33 || this.user.userDet[0].role_id == 34 || this.user.userDet[0].role_id == 46) {
			if (this.user.userDet[0].insider_parent_id != null) {
				this.selectedZone = this.user.userDet[0].insider_parent_id;
			} else {
				this.selectedZone = this.user.userDet[0].id;
			}
		}
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];

		this.add_transporter_bill = (this.links.find(x => x == 'add_transporter_bill') != null) ? true : false;
		this.update_freight = (this.links.find(x => x == 'update_freight') != null) ? true : false;
	}

	ngOnInit() {
		this.initForm();
		this.getCols();
		this.getLoadCrossTypeList();
	}

	getLoadCrossTypeList() {
		this.crudServices.getAll<any>(SalesReportsNew.getLoadCrossType).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.loadCrossTypeList = res.data;
				}
			}
		});
	}

	onChangeValue(load_cross) {
		this.formUpdateFreight.patchValue({
			load_quantity: 0,
			cross_quantity: 0
		});
		this.enableLoad = false;
		this.enableCross = false;
		this.formUpdateFreight.get('new_load_quantity').clearValidators();
		this.formUpdateFreight.get('new_load_quantity').updateValueAndValidity();
		this.formUpdateFreight.get('new_cross_quantity').clearValidators();
		this.formUpdateFreight.get('new_cross_quantity').updateValueAndValidity();
		if (load_cross != null && load_cross != undefined) {
			if (load_cross == 1) {
				this.enableLoad = true;
				this.enableCross = false;
				this.formUpdateFreight.get('new_load_quantity').setValidators([Validators.required, Validators.min(0.5)]);
				this.formUpdateFreight.get('new_load_quantity').updateValueAndValidity();
				this.formUpdateFreight.get('new_cross_quantity').clearValidators();
				this.formUpdateFreight.get('new_cross_quantity').updateValueAndValidity();
				this.formUpdateFreight.patchValue({
					new_cross_quantity: 0
				});
			} else if (load_cross == 2) {
				this.enableLoad = false;
				this.enableCross = true;
				this.formUpdateFreight.get('new_cross_quantity').setValidators([Validators.required, Validators.min(0.5)]);
				this.formUpdateFreight.get('new_cross_quantity').updateValueAndValidity();
				this.formUpdateFreight.get('new_load_quantity').clearValidators();
				this.formUpdateFreight.get('new_load_quantity').updateValueAndValidity();
				this.formUpdateFreight.patchValue({
					new_load_quantity: 0
				});
			} else if (load_cross == 3) {
				this.enableLoad = true;
				this.enableCross = true;
				this.formUpdateFreight.get('new_load_quantity').setValidators([Validators.required, Validators.min(0.5)]);
				this.formUpdateFreight.get('new_load_quantity').updateValueAndValidity();
				this.formUpdateFreight.get('new_cross_quantity').setValidators([Validators.required, Validators.min(0.5)]);
				this.formUpdateFreight.get('new_cross_quantity').updateValueAndValidity();
			}
		}
	}


	getTotalQuantity() {
		let total_quantity = (Number(this.formUpdateFreight.value.quantity) + Number(this.formUpdateFreight.value.logistic_power)) / 1000;
		return total_quantity;
	}

	initForm() {
		this.formTransportBill = new FormGroup({
			transporter_bill_no: new FormControl(null, Validators.required),
			transporter_bill_copy: new FormControl(null, Validators.required),
			transporter_bill_status: new FormControl(null, Validators.required),
			transporter_bill_remark: new FormControl(null)
		});
		this.formUpdateFreight = new FormGroup({
			new_freight_rate: new FormControl(null, Validators.required),
			old_freight_rate: new FormControl(null, Validators.required),
			old_logistic_power: new FormControl(0),
			new_logistic_power: new FormControl(0),
			load_cross: new FormControl(0),
			old_load_quantity: new FormControl(0),
			new_load_quantity: new FormControl(0),
			old_cross_quantity: new FormControl(0),
			new_cross_quantity: new FormControl(0),
			load_charges: new FormControl(0),
			cross_charges: new FormControl(0),
			req_remark: new FormControl(null, Validators.required)
		});
		this.formTruckImage = new FormGroup({
			truck_image_copy: new FormControl(null, Validators.required)
		});
		this.formPod = new FormGroup({
			pod_copy: new FormControl(null, Validators.required)
		});
		this.formlr = new FormGroup({
			lr_copy: new FormControl(null, Validators.required)
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

	getData() {
		this.getCols();
		this.data = [];
		this.isLoading = true;
		this.crudServices.getOne<any>(SalesReportsNew.getDispatchReport, {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
			status: this.selected_status.id,
			zone_id: this.selectedZone
		}).subscribe(res => {
			if (res.code == '100') {
				if (res.data.length > 0) {
					res.data.forEach(element => {
						element.transporter = (element.transporter != null) ? element.transporter : "OTHER";
						element.quantity = roundQuantity(Number(element.quantity) + Number(element.logistic_power));
						element.total_freight_load_cross = Number(element.total_freight) + Number(element.total_load_cross);
					});
					this.data = res.data;
					this.pushDropdown(this.data);
					this.footerTotal(this.data);
				}
			}
			this.isLoading = false;
			this.table.reset();
		});
	}

	getCols() {
		this.cols = [
			{ field: "con_id", header: "SO ID", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "d_id", header: "ID", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Button" },
			{ field: "zone", header: "Zone", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "action", header: "Action", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "customer", header: "Customer", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "grade_name", header: "Grade Name", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "invoice_no", header: "Invoice No", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "invoice_date", header: "Invoice Date", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date" },
			{ field: "quantity", header: "Quantity", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Quantity" },
			{ field: "delivery_term", header: "Delivery Term", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "state_name", header: "State", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "godown", header: "Godown", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "truck_no", header: "Truck No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "lr_no", header: "LR No", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "transporter", header: "Transporter", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "freight_rate", header: "Freight Rate", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "total_freight", header: "Total Freight", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "total_load_cross", header: "Total Load/Cross", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "total_freight_load_cross", header: "Total Freight + Load/Cross", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "total_amount", header: "Invoice Total", sort: true, filter: false, dropdown: [], footer: true, total: 0, type: "Amount" },
			{ field: "transporter_bill_no", header: "Transporter Bill No.", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "remark", header: "Remark", sort: false, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "company_name", header: "Division", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "transition_type_label", header: "Transition Type", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "truck_image", header: "Truck Image", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "truck_image_by_name", header: "Image Uploaded By", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "truck_image_date", header: "Image Uploaded On", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
			{ field: "lr", header: "L.R", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "lr_added_by_name", header: "L.R Uploaded By", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "lr_added_date", header: "L.R Uploaded On", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
			{ field: "pod", header: "P.O.D", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "pod_by_name", header: "P.O.D Uploaded By", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "pod_date", header: "P.O.D Uploaded On", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
			{ field: "lr_received_by_name", header: "L.R Received By", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "lr_received_button" },
			{ field: "lr_received_date", header: "L.R Received On", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: "Date_Time" },
			{ field: "dispatched_by", header: "Dispatch By", sort: true, filter: true, dropdown: [], footer: false, total: 0, type: null },
			{ field: "source", header: "Source", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
			{ field: "destination", header: "Destination", sort: true, filter: false, dropdown: [], footer: false, total: 0, type: null },
		];
		this.filter = ['con_id', 'd_id', 'customer', 'invoice_no', 'state_name', 'truck_no', 'lr_no', 'transporter', 'transporter_bill_no', 'truck_image_by_name',''];
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

	onAction(item, type) {
		if (type == 'View') {
		}
		if (type == 'Freight_Request') {
			this.crudServices.updateData(DispatchNew.approveFreight, {
				id: item.d_id,
				freight_rate: Number(item.new_freight_rate),
				total_freight: Number(item.new_freight_rate) * Number(item.quantity),
				new_freight_status: 1
			}).subscribe((result) => {
				if (result['code'] == 100) {
					this.isLoading = false;
					this.toasterService.pop('success', 'Success', "Freight Updated Successfully");
					this.closeModal();
					this.getData();
				}
			});
		}
		if (type == 'Upload_Truck_Image') {
			this.selectedDispatch = item;
			this.formTruckImage.reset();
			this.truckImageModal.show();
		}
		if (type == 'Download_Truck_Image') {
			let images_arr = JSON.parse(item);
			this.crudServices.downloadMultipleFiles(images_arr);
		}
		if (type == 'Delete_Truck_Image') {
			this.crudServices.updateData(DispatchNew.updateTruckImage, {
				id: item.d_id,
				truck_image_copy: null
			}).subscribe((result) => {
				if (result['code'] == 100) {
					this.isLoading = false;
					this.toasterService.pop('success', 'Success', "Truck Images Deleted Successfully");
					this.closeModal();
					this.getData();
				}
			});
		}
		if (type == 'Upload_Pod') {
			this.selectedDispatch = item;
			this.formPod.reset();
			this.podModal.show();
		}
		if (type == 'Download_Pod') {
			let images_arr = item;
			this.crudServices.downloadMultipleFiles(images_arr);
		}
		if (type == 'Delete_Pod') {
			this.crudServices.updateData(DispatchNew.updatePod, {
				id: item.d_id,
				pod_copy: null
			}).subscribe((result) => {
				if (result['code'] == 100) {
					this.isLoading = false;
					this.toasterService.pop('success', 'Success', "P.O.D Deleted Successfully");
					this.closeModal();
					this.getData();
				}
			});
		}
		if (type == 'Upload_lr') {
			this.selectedDispatch = item;
			this.formlr.reset();
			this.lrModal.show();
		}
		if (type == 'Download_lr') {
			let images_arr = item;
			this.crudServices.downloadMultipleFiles(images_arr);
		}
		if (type == 'Delete_lr') {
			this.crudServices.updateData(DispatchNew.updateLr, {
				id: item.d_id,
				lr_copy: null
			}).subscribe((result) => {
				if (result['code'] == 100) {
					this.isLoading = false;
					this.toasterService.pop('success', 'Success', "P.O.D Deleted Successfully");
					this.closeModal();
					this.getData();
				}
			});
		}
		if (type == 'Download_Invoice') {
			let invoice_arr = JSON.parse(item);
			this.crudServices.downloadMultipleFiles(invoice_arr);
		}
		if (type == 'Transporter_Bill') {
			this.selectedDispatch = item;
			this.formTransportBill.reset();
			this.openTransporterBillModal(item)
			this.getFCMWithNotification('SALES_DISPATCH_TRANSPORTER_BILL');
		}
		if (type == 'Update_Freight') {
			this.quantity = item.quantity;
			this.dispatch_id = item.d_id;
			this.formUpdateFreight.reset();
			this.formUpdateFreight.patchValue({
				old_freight_rate: item.freight_rate,
				new_freight_rate: null,
				old_logistic_power: item.logistic_power,
				new_logistic_power: 0,
				load_cross: 0,
				old_load_quantity: item.load_quantity,
				new_load_quantity: 0,
				old_cross_quantity: item.cross_quantity,
				new_cross_quantity: 0,
				load_charges: item.load_charges,
				cross_charges: item.cross_charges

			})
			this.updateFreightModal.show()
		}
		if (type == "lr_received_request") {
			this.crudServices.updateData(DispatchNew.lrReceivedRequest, {
				id: item.d_id,
			}).subscribe((result) => {
				if (result['code'] == 100) {
					this.isLoading = false;
					this.toasterService.pop('success', 'Success', "LR Received Updated Successfully...");
					this.closeModal();
					this.getData();
				}
			});
		}
		if (type == "uplaodedFiles") {
			this.uploadedModal.show();
			this.crudServices.getOne<any>(SalesReportsNew.getDispatchReport, {
				from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
				to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD"),
				status: this.selected_status.id,
				zone_id: this.selectedZone
			}).subscribe(res => {
				if (res.code == '100') {
					this.lenghtOfRecord = res.data.length
					if (res.data.length > 0) {
						for (const obj of res.data) {
							if (obj.truck_image_copy === null) {
								this.truckImageNullCount++;
							} else {
								this.truckImageCount++;
							}
							if (obj.lr_copy === null) {
								this.lrNullCount++;
							} else {
								this.lrCount++;
							}
							if (obj.pod_copy === null) {
								this.podNullCount++;
							} else {
								this.podCount++;
							}
							if (obj.lr_received === null) {
								this.lrRecNullCount++;
							} else {
								this.lrRecCount++;
							}
						}
					}
				}
			});
		}
	}

	submitNewFreight() {
		let data = this.formUpdateFreight.value;
		data.old_quantity = this.quantity;
		data.dispatch_id = this.dispatch_id;
		if (data.load_cross == 1 && (data.new_load_quantity > (this.quantity + (data.new_logistic_power ? data.new_logistic_power : data.old_logistic_power)))) {
			this.toasterService.pop('warning', 'warning', 'Load quantity exceeds');
		} else if (data.load_cross == 2 && (data.new_cross_quantity > (this.quantity + (data.new_logistic_power ? data.new_logistic_power : data.old_logistic_power)))) {
			this.toasterService.pop('warning', 'warning', 'Cross quantity exceeds');
		} else if (data.load_cross == 3 && ((data.new_cross_quantity + data.new_load_quantity) > (this.quantity + (data.new_logistic_power ? data.new_logistic_power : data.old_logistic_power)))) {
			this.toasterService.pop('warning', 'warning', 'Load-Cross quantity exceeds');
		} else {
			this.crudServices.addData<any>(FreightTracking.add, data
			).subscribe((result) => {
				if (result['code'] == 100) {
					this.isLoading = false;
					this.toasterService.pop('success', 'Success', "Freight request submitted Successfully");
					this.enableLoad = false;
					this.enableCross = false;
					this.closeModal();
					this.getData();
				}
			});
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

	openTransporterBillModal(data) {
		this.selectedDispatch = data;
		this.formTransportBill.patchValue({
			transporter_bill_no: data.transporter_bill_no ? data.transporter_bill_no : null,
			transporter_bill_status: (data.transporter_bill_status == 0) ? 0 : 1,
			transporter_bill_remark: data.transporter_bill_remark ? data.transporter_bill_remark : null
		});
		this.transporterBillModal.show();
	}

	onFileChange(e, folder) {
		this.fileData = new FormData();
		let files = <Array<File>>e.target.files;
		for (let i = 0; i < files.length; i++) {
			if (folder == 'truck_image') {
				this.fileData.append(folder, files[i], files[i]['name']);
			}
			if (folder == 'pod_copy') {
				this.fileData.append(folder, files[i], files[i]['name']);
			}
			if (folder == 'lr_copy') {
				this.fileData.append(folder, files[i], files[i]['name']);
			}
		}

	}

	submitTransportBill() {
		this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res_aws => {
			let body = {
				transporter_bill_no: this.formTransportBill.value.transporter_bill_no,
				transporter_bill_copy: res_aws.uploads["transporter_bill"][0].location,
				transporter_bill_status: this.formTransportBill.value.transporter_bill_status,
				transporter_bill_remark: this.formTransportBill.value.transporter_bill_remark
			}
			this.crudServices.updateData(DispatchBilling.addTranporterBill, {
				dispatch_id: this.selectedDispatch.d_id, data: body
			}).subscribe((result) => {
				if (result['code'] == 100) {
					this.isLoading = false;
					this.toasterService.pop('success', 'Success', "Transporter Bill Added Successfully");
					this.closeModal();
					this.getData();
					if (this.selectedDispatch.zone_fcm_web_token) {
						this.notification_tokens = [...this.notification_tokens, this.selectedDispatch.zone_fcm_web_token];
						this.notification_id_users = [...this.notification_id_users, this.selectedDispatch.zone_id];
					}
					let notification_body = {
						notification: {
							"title": `${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name}  ${this.notification_details.title}`,
							"body": `Customer :  ${this.selectedDispatch.customer},  Grade:${this.selectedDispatch.grade_name} 0f  ${this.selectedDispatch.quantity} MT  Godown :${this.selectedDispatch.godown_name} ,Transporter : ${this.selectedDispatch.transporter}`,
							"click_action": "https://erp.sparmarglobal.com:8085/#/sales/billing"
						},
						registration_ids: this.notification_tokens
					}
					this.sendInAppNotification(notification_body);
				}
			});
		});
	}

	submitTruckImage() {
		this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res_aws => {
			let truck_images = [];
			res_aws.uploads["truck_image"].forEach(element => {
				truck_images.push(element.location);
			});
			this.crudServices.updateData(DispatchNew.updateTruckImage, {
				id: this.selectedDispatch.d_id,
				truck_image_copy: JSON.stringify(truck_images)
			}).subscribe((result) => {
				if (result['code'] == 100) {
					this.isLoading = false;
					this.toasterService.pop('success', 'Success', "Truck Image Uploaded Successfully");
					this.closeModal();
					this.getData();
				}
			});
		});
	}

	submitPod() {
		this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res_aws => {
			let pod_images = [];
			res_aws.uploads["pod_copy"].forEach(element => {
				pod_images.push(element.location);
			});
			this.crudServices.updateData(DispatchNew.updatePod, {
				id: this.selectedDispatch.d_id,
				pod_copy: pod_images
			}).subscribe((result) => {
				if (result['code'] == 100) {
					this.isLoading = false;
					this.toasterService.pop('success', 'Success', "P.O.D Uploaded Successfully");
					this.closeModal();
					this.getData();
				}
			});
		});
	}

	submitlr() {
		this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res_aws => {
			let lr_images = [];
			res_aws.uploads["lr_copy"].forEach(element => {
				lr_images.push(element.location);
			});
			this.crudServices.updateData(DispatchNew.updateLr, {
				id: this.selectedDispatch.d_id,
				lr_copy: lr_images
			}).subscribe((result) => {
				if (result['code'] == 100) {
					this.isLoading = false;
					this.toasterService.pop('success', 'Success', "L.R. Uploaded Successfully");
					this.closeModal();
					this.getData();
				}
			});
		});
	}

	getFCMWithNotification(name) {
		this.notification_details = undefined;
		this.notification_tokens = [];
		this.notification_id_users = [];
		let company_id = this.user.userDet[0].company_id;
		this.crudServices.getOne(Notifications.getNotificationWithFCM, { notification_name: name })
			.subscribe((notification: any) => {
				if (notification) {
					this.notification_details = notification.data[0];
					this.notification_tokens = [...this.notification_tokens, ...notification.data[0].fcm_list];
					this.notification_id_users = [...this.notification_id_users, ...notification.data[0].staff_id];
				}
			});
	}


	//!SEND NOTIFICATION TO SELECTED FCM / AND ID 
	sendInAppNotification(body) {
		this.messagingService.sendNotification(body).then((response) => {
			if (response) {
				this.saveNotifications(body['notification'])
			}
			this.messagingService.receiveMessage();
		})
	}

	//!SAVE NOTIFICATION INSIDE DATABASE 
	saveNotifications(notification_body) {
		this.notification_users = [];
		for (const element of this.notification_id_users) {
			this.notification_users.push({
				notification_id: this.notification_details.id,
				reciever_user_id: element,
				department_id: 1,
				heading: notification_body.title,
				message_body: notification_body.body,
				url: notification_body.click_action,
				record_id: 1,
				table_name: 'sales_orders',
			})
		}
		this.crudServices.addData(UsersNotification.add, {
			data: this.notification_users
		}).subscribe((data) => {
			// 
		}, (error) => { console.error(error) });
	}

	closeModal() {
		this.formUpdateFreight.reset();
		this.selectedDispatch = null;
		this.formTransportBill.reset();
		this.transporterBillModal.hide();
		this.updateFreightModal.hide();
		this.formTruckImage.reset();
		this.formPod.reset();
		this.formlr.reset();
		this.truckImageModal.hide();
		this.podModal.hide();
		this.lrModal.hide();
		this.uploadedModal.hide();
		this.lenghtOfRecord = 0;
		this.truckImageCount = 0;
		this.truckImageNullCount = 0;
		this.lrCount = 0;
		this.lrNullCount = 0;
		this.podCount = 0;
		this.podNullCount = 0;
		this.lrRecCount = 0;
		this.lrRecNullCount = 0;
	}

	exportData(type) {
		let fileName = this.selected_status.name + ' - ' + this.page_title + ' (' + moment(this.selected_date_range[0]).format('DD-MM-YYYY') + ' - ' + moment(this.selected_date_range[1]).format('DD-MM-YYYY') + ')';
		let exportData = [];
		let final_data = null;
		if (this.table.filteredValue == null) {
			final_data = this.data;
		} else {
			final_data = this.table.filteredValue;
		}

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

}
