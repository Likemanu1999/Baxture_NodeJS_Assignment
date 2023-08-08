
import { Component, OnInit, ViewEncapsulation, ViewChild, EventEmitter, ElementRef, ViewChildren } from '@angular/core';
import { DatePipe, JsonPipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap';

import { ExportService } from '../../../shared/export-service/export-service';
import { SelectService } from '../../../shared/dropdown-services/select-services';
import { HrServices } from '../../hr/hr-services';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { EmailTemplateMaster, FileUpload, GodownMaster, GradeMaster, LiftingDetails, LocalPurchase, LocalPurchaseGodownAlloc, Notifications, NotificationsUserRel, PercentageDetails, SubOrg, UsersNotification } from '../../../shared/apis-path/apis-path';
import { MessagingService } from '../../../service/messaging.service';


@Component({
	selector: 'app-lifting-details',
	templateUrl: './lifting-details.component.html',
	styleUrls: ['./lifting-details.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		HrServices,
		DatePipe,
		SelectService,
		ExportService,
		CrudServices,
		MessagingService
	]
})
export class LiftingDetailsComponent implements OnInit {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('myModalPending', { static: false }) public myModalPending: ModalDirective;
	@ViewChild('myModalUpdateFile', { static: false }) public myModalUpdateFile: ModalDirective;


	@ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];

	serverUrl: string;
	user: UserDetails;
	addPaymentForm: FormGroup;
	links: any;
	id: number;
	supplier: any;
	godown_name: any;
	grade_name: any;
	quantity: any;
	rate: any;
	addForm: FormGroup;
	grade_list = [];
	godownList = [];
	cols_lift = [];
	lifitng_details_arr = [];
	lifitng_details = [];
	//  lifitng_details_arr: any;
	docs: Array<File> = [];

	// form fields

	lift_quantity: number;
	godown_id: string;
	sub_org_id: number;
	grade_id: number;
	invoice_number: string;
	invoice_date: string;
	truck_no: string;
	purchase_rate: Number;
	remark: string;
	lift_id: string;
	short_material_qty: any;
	damage_material_qty: any;
	isLoading: boolean = false;
	public today = new Date();

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'right';
	public closeOnOutsideClick: boolean = true;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	delivery_term: string;
	godown: any;
	term: string;
	index: any;
	balance_amt = 0;
	total_qty: any = 0;
	total_short_qty = 0;
	total_damage_qty = 0;
	filteredValuess: any[];
	export_lifting_list: any[];
	exportColumnsLifting: any[];
	excel_lift: boolean = false;
	pdf_lift: boolean = false;
	add_lift: boolean = false;
	edit_lift: boolean = false;
	del_lift: boolean = false;
	qtyCheckFlag: boolean = false;
	lift_quantity_check: any;
	material_received_date: any;
	godown_id_global: any;
	short_deb_credit_no: any;
	damage_deb_credit_no: any;
	docs2: Array<File> = [];
	checkedList = [];
	maillist = [];
	tomail = [];
	ccMail = [];
	tomailtext: string;
	ccmailtext: string;
	template: string;
	subject: string;
	footer: string;
	isLoadingMail: boolean;

	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	message: any;
	FcmDealAdd: any;
	addedBy: any;
	main_org_id: any;
	sister_company_list: any = [];
	invoice_amount: string
	copy_record: boolean;
	gst: any;
	tds: any;
	tcs: any;
	vendor_ref_number: any;
	local_deal_id: number;
	tds_percent: any;
	gst_percentege: any;
	transporter: any = [];
	material_rcv_date: any;
	deal_type: any;
	company_id: any;
	freight: number;
	less_cash_discount: any;
	less_mou_discount: any;
	less_other_discount: any;




	constructor(
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private exportService: ExportService,
		private crudServices: CrudServices,
		private messagingService: MessagingService,
		private route: ActivatedRoute,
	) {

		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.excel_lift = (this.links.indexOf('Local Purchase Lifting Export Excel') > -1);
		this.pdf_lift = (this.links.indexOf('Local Purchase Lifting Export PDF') > -1);
		this.add_lift = (this.links.indexOf('add lifting') > -1);
		this.edit_lift = (this.links.indexOf('edit lifting') > -1);
		this.del_lift = (this.links.indexOf('del lifting') > -1);
		this.copy_record = (this.links.indexOf('Copy Local Lifting') > -1);



		this.addForm = new FormGroup({

			'quantity': new FormControl(null, Validators.required),
			'grade_id': new FormControl(null, Validators.required),
			'godown_id': new FormControl(null, Validators.required),
			'sub_org_id': new FormControl(null, Validators.required),
			'invoice_number': new FormControl(null),
			'invoice_date': new FormControl(null),
			'material_received_date': new FormControl(null),
			'truck_no': new FormControl(null, Validators.required),
			'purchase_rate': new FormControl(null),
			'remark': new FormControl(''),
			'purchase_invoice_copy': new FormControl(null),
			'short_material_qty': new FormControl(0),
			'damage_material_qty': new FormControl(0),
			'original_doc_recv_flag': new FormControl(false),
			'org_doc_invoice_copy': new FormControl(null),
			'damage_short_dr_cr_note': new FormControl(null),
			'other_remark': new FormControl(null),
			'lr_number': new FormControl(null),
			'transporter_id': new FormControl(null),
			'freight_amount': new FormControl(null),
			'invoice_value': new FormControl(null),
		});




		this.cols_lift = [
			{ field: 'quantity', header: 'Qty (Tons)', style: '100px' },
			{ field: 'truck_no', header: 'Truck No', style: '120px' },
			{ field: 'grade_name', header: 'Grade', style: '100px' },
			{ field: 'purchase_invoice_no', header: 'Invoice No', style: '150px' },
			{ field: 'purchase_invoice_date', header: 'Invoice date', style: '150px' },
			{ field: 'short_material_qty', header: 'Short Material Quantity', style: '100px' },
			{ field: 'damage_material_qty', header: 'Damage Material Quantity', style: '100px' },
			{ field: 'purchase_rate', header: 'Purchase Rate', style: '100px' },
			{ field: 'freight_amount', header: 'Freight', style: '100px' },
			{ field: 'remark', header: 'Remark', style: '200px' },
		];


		this.crudServices.getAll<any>(GradeMaster.getAll).subscribe((response) => {
			this.grade_list = response;
		});





	}

	ngOnInit() {

		this.route.params.subscribe((params: Params) => {
			this.local_deal_id = +params['id'];


		});

		this.getDropdown();
		this.setTaxValue();
		this.getLocalPurchaseDetails();
	}

	getDropdown() {
		this.crudServices.getAll<any>(GodownMaster.getAll).subscribe((response) => {

			this.godownList = response;
		});
		this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 103 }).subscribe(response => {
			this.transporter = response;

		})
	}

	getLocalPurchaseDetails() {

		this.isLoading = true;
		this.crudServices.getOne<any>(LocalPurchase.getOneLocalPurchaseDeal, {
			id: this.local_deal_id
		}).subscribe((response) => {
			this.isLoading = false;

			this.lifitng_details_arr = response[0];
			this.company_id = response[0]['company_id'];
			this.supplier = response[0]['sub_org_name'];
			this.sub_org_id = response[0]['supplier_id'];
			this.godown_name = response[0]['godown_name'];
			this.godown_id = response[0]['godown_id'];
			this.godown_id_global = response[0]['godown_id'];
			this.grade_name = response[0]['grade_name'];
			this.quantity = response[0]['quantity'];
			this.godown = response[0]['godown_name'];
			this.vendor_ref_number = response[0]['vendor_ref_number'];
			this.addForm.patchValue({ godown_id: this.godown_id });
			this.addForm.patchValue({ grade_id: response[0]['grade_id'] });
			this.gst = response[0]['cgst_percent'] + response[0]['sgst_percent'];
			this.rate = Number(response[0].rate)
			this.freight = Number(response[0].freight);
			this.delivery_term = response[0]['deliveryTerm'];
			this.term = this.getTerm(response[0]['term']);
			this.FcmDealAdd = response[0]['Fcm_token'] ? response[0]['Fcm_token'] : null;
			this.addedBy = response[0]['added_by'];
			this.deal_type = response[0]['deal_type']
			this.less_cash_discount = Number(response[0]['less_cash_discount']);
			this.less_mou_discount = Number(response[0]['less_mou_discount']);
			this.less_other_discount = Number(response[0]['less_other_discount']);

			this.id = response[0]['id'];
			if (response[0]['LocalPurchaseLiftingDetails']) {
				this.lifitng_details = response[0]['LocalPurchaseLiftingDetails'];
			}

			this.main_org_id = response[0]['org_id'];
			this.crudServices.getOne<any>(SubOrg.get_suborg_agst_main, { org_id: this.main_org_id }).subscribe((response) => {

				if (response.length) {
					response.map(item => {
						item.sub_org_name = `${item.sub_org_name} - (${item.org_unit_master.unit_type}) - (${item.location_vilage})`
					})
				}

				this.sister_company_list = response;
			});

			this.crudServices.getOne<any>(SubOrg.getSubOrgByContactEmail, { supplier_id: this.sub_org_id }).subscribe(res => {
				if (res) {
					this.maillist = res.email;
					// for (let email of res) {
					// 	if (email.org_contact_emails != null) {
					// 		for (let mail of email.org_contact_emails) {
					// 			this.maillist.push(mail.email_id);
					// 		}
					// 	}

					// }
				}
			})
			this.totalCalculation();
		})
	}

	addNew() {
		this.getNotifications('ADD_LIFTING_DETAILS');
		this.addForm.patchValue({ sub_org_id: this.lifitng_details_arr['supplier_id'] });
		this.myModal.show();
	}

	oncloseModal() {
		this.lift_id = '';
		this.lift_quantity_check = 0;
		this.invoice_amount = '';


		this.addForm.reset();
		this.godown_id = this.godown_id_global;
		this.addForm.patchValue({ godown_id: this.godown_id });
		this.addForm.patchValue({ grade_id: this.lifitng_details_arr['grade_id'] });

		this.myModal.hide();
		this.myModalUpdateFile.hide();
	}

	onSubmit() {
		let data = {
			quantity: Number(this.addForm.value.quantity) / 1000,
			grade_id: this.addForm.value.grade_id,
			purchase_invoice_no: this.addForm.value.invoice_number,
			purchase_invoice_date: this.convert(this.addForm.value.invoice_date),
			material_received_date: this.convert(this.addForm.value.material_received_date),
			truck_no: this.addForm.value.truck_no,
			purchase_rate: this.addForm.value.purchase_rate,
			remark: this.addForm.value.remark,
			short_material_qty: Number(this.addForm.value.short_material_qty) / 1000,
			damage_material_qty: Number(this.addForm.value.damage_material_qty) / 1000,
			sub_org_id: this.addForm.value.sub_org_id,
			godown_id: this.addForm.value.godown_id,
			local_purchase_id: this.id,
			short_deb_credit_no: this.addForm.value.short_deb_credit_no,
			damage_deb_credit_no: this.addForm.value.damage_deb_credit_no,
			damage_short_dr_cr_note: this.addForm.value.damage_short_dr_cr_note,
			other_remark: this.addForm.value.other_remark,
			lr_number: this.addForm.value.lr_number,
			invoice_value: this.addForm.value.invoice_value,
			transporter_id: this.addForm.value.transporter_id,
			freight_amount: this.addForm.value.freight_amount,
			original_doc_recv_flag: this.addForm.value.original_doc_recv_flag ? 1 : 0,
			id: this.lift_id,
			material_rcv_date: this.material_rcv_date,
			deal_type: this.deal_type,
			surisha_stock_flag: this.company_id == 3 ? 1 : 0
		}
		let fileData: any = new FormData();
		const document: Array<File> = this.docs;
		const document1: Array<File> = this.docs2;

		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('local_purchase_lifting_invoice', document[i], document[i]['name']);

			}

		}

		if (document1.length > 0) {
			for (let i = 0; i < document1.length; i++) {
				fileData.append('local_purchase_original_docs_copy', document1[i], document1[i]['name']);

			}

		}



		if (document.length || document1.length) {

			this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
				let fileDealDocs = [];
				let fileDealDocs2 = [];
				let filesList = res.uploads.local_purchase_lifting_invoice;
				let filesList1 = res.uploads.local_purchase_original_docs_copy;



				if (res.uploads.local_purchase_original_docs_copy) {
					for (let i = 0; i < filesList1.length; i++) {
						fileDealDocs2.push(filesList1[i].location);

					}
					data['org_doc_invoice_copy'] = JSON.stringify(fileDealDocs2);
				}

				if (res.uploads.local_purchase_lifting_invoice) {
					for (let i = 0; i < filesList.length; i++) {
						fileDealDocs.push(filesList[i].location);
					}
					data['purchase_invoice_copy'] = JSON.stringify(fileDealDocs);
				}

				this.saveData(data);

			})

		} else {
			this.saveData(data);
		}
	}

	saveData(formData) {
		this.isLoading = true;
		if (this.lift_id === undefined || this.lift_id === '') {
			this.crudServices.addData<any>(LiftingDetails.add, formData).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
				if (response.code === '100') {
					this.oncloseModal();
					this.isLoading = false;
					let notificationdata = {
						"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
						"body": `Lifting added for ${this.supplier} of Qty: ${formData.quantity}`,
						"click_action": "#"
					}
					if (this.FcmDealAdd != null) {
						this.notification_tokens.push(this.FcmDealAdd);
						this.notification_users.push(this.addedBy);
					}


					this.generateNotification(notificationdata, 1);

					this.lifitng_details.push(response.dataResult[0]);
					this.totalCalculation();
				}
			});
		} else {
			this.crudServices.updateData<any>(LiftingDetails.update, formData)
				.subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
					if (response.code === '100') {
						let notificationdata = {
							"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
							"body": `Lifting updated for ${this.supplier} of Qty: ${formData.quantity}`,
							"click_action": "#"
						}


						this.generateNotification(notificationdata, formData.id);
						this.oncloseModal();
						this.isLoading = false;
						this.lifitng_details.splice(this.index, 1, response.dataResult[0]);
						this.totalCalculation();
					}
				});
		}
	}

	totalCalculation() {
		this.total_qty = 0;
		this.total_short_qty = 0;
		this.total_damage_qty = 0;
		if (this.lifitng_details) {
			this.total_qty = this.lifitng_details.reduce((sum, item) => sum + Number(item.quantity), 0);
			this.total_short_qty = this.lifitng_details.reduce((sum, item) => sum + item.short_material_qty, 0);
			this.total_damage_qty = this.lifitng_details.reduce((sum, item) => sum + item.damage_material_qty, 0);
		}
		this.balance_amt = ((this.quantity.toFixed(3) * 1000) - (this.total_qty.toFixed(3) * 1000)) / 1000;

	}




	checkQuantity(qty) {
		this.qtyCheckFlag = false;
		var total_qty_lifting = 0;

		if (this.lift_quantity_check > 0 && this.lift_quantity_check != undefined) {
			total_qty_lifting = (this.lifitng_details.reduce((sum, item) => sum + item.quantity, 0)) - this.lift_quantity_check;

		} else {
			total_qty_lifting = this.lifitng_details.reduce((sum, item) => sum + item.quantity, 0);
		}

		var total_lifting = Number(total_qty_lifting * 1000) + Number(qty.target.value);
		if (total_lifting > Number(this.quantity) * 1000) {
			this.qtyCheckFlag = true;
			this.lift_quantity = null;

		}

		if (qty.target.value <= 0) {
			this.qtyCheckFlag = true;
			this.lift_quantity = null;
		}



		let invoice_amount = 0;
		/*
			SPIPL-1270 : BUG : LOCAL PURCHASE : MANUCTURER : LIFTING LIST - INVOICE TOTAL INCORRECT : SHOULD BE SAME AS DEAL
			In rate add freigth and subtract all discounts if available.
		*/
		let rate = this.rate + (this.freight || 0) - ((this.less_cash_discount || 0) + (this.less_mou_discount || 0) + (this.less_other_discount || 0))
		let basic_amount = (qty.target.value / 1000) * rate;
		const deal_gst = ((basic_amount) * (this.gst_percentege / 100));
		const deal_value_tds = ((basic_amount) * (this.tds_percent / 100));
		invoice_amount = (basic_amount) + deal_gst - deal_value_tds;
		this.invoice_amount = `<div><b>Invoice Amount: ${invoice_amount}</b></div>`;

		this.addForm.patchValue({ invoice_value: invoice_amount })



	}


	setTaxValue() {
		this.crudServices.getOne<any>(PercentageDetails.getOne, { detail_type: 2 }).subscribe(response => {

			response.forEach(element => {


				if (element.percent_type === 'tds') {
					this.tds_percent = element.percent_value;
				}

				if (element.percent_type === 'gst') {
					this.gst_percentege = element.percent_value;
				}
			});

		})


	}




	convert(date) {
		if (date) {
			return this.datepipe.transform(date, 'yyyy-MM-dd');
		} else {
			return null;
		}
	}

	addDocs(event: any) {
		this.docs = <Array<File>>event.target.files;
	}

	addDocsOriginal(event: any) {
		this.docs2 = <Array<File>>event.target.files;
	}


	onEdit(item, index) {
		this.getNotifications('EDIT_LIFTING_DETAILS');

		if (item.addby) {
			if (item.addby.fcm_web_token != null) {
				this.notification_tokens.push(item.addby.fcm_web_token);
				this.notification_users.push(item.addby.id);
			}
		}


		this.lift_quantity_check = item.quantity * 1000;
		this.lift_id = item.id;
		this.index = index;
		this.invoice_amount = `<div><b>Invoice Amount: ${item.invoice_value}</b></div>`;
		this.material_rcv_date = item.material_received_date
		this.addForm.patchValue({
			quantity: item.quantity * 1000,
			godown_id: item.godown_id,
			sub_org_id: item.sub_org_id != null ? item.sub_org_id : this.sub_org_id,
			grade_id: Number(item.grade_id),
			invoice_number: item.purchase_invoice_no,
			material_received_date: item.material_received_date,
			invoice_date: item.purchase_invoice_date,
			truck_no: item.truck_no,
			purchase_rate: item.purchase_rate,
			short_material_qty: item.short_material_qty * 1000,
			damage_material_qty: item.damage_material_qty * 1000,
			short_deb_credit_no: item.short_deb_credit_no,
			damage_deb_credit_no: item.damage_deb_credit_no,
			remark: item.remark,
			damage_short_dr_cr_note: item.damage_short_dr_cr_note,
			other_remark: item.other_remark,
			lr_number: item.lr_number,
			transporter_id: item.transporter_id,
			freight_amount: item.freight_amount,
			invoice_value: item.invoice_value,
			original_doc_recv_flag: item.original_doc_recv_flag ? item.original_doc_recv_flag : false


		})

		this.myModal.show();

	}

	onDelete(item, index) {
		if (item) {
			this.crudServices.deleteData<any>(LiftingDetails.delete, {
				id: item.id,
				local_purchase_id: this.id,
				quantity: item.quantity,
				godown_id: item.godown_id,
				purchase_invoice_date: this.datepipe.transform(item.purchase_invoice_date, 'yyyy-MM-dd'),
				surisha_stock_flag: this.company_id == 3 ? 1 : 0
			}).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
				this.lifitng_details.splice(index, 1);
				this.totalCalculation();
			});
		}
	}



	// data exported for pdf excel download
	exportDataLifting() {

		let arr = [];
		if (this.filteredValuess === undefined) {
			arr = this.lifitng_details;
		} else {
			arr = this.filteredValuess;
		}

		for (let i = 0; i < arr.length; i++) {
			const export_lifitng = {};
			for (let j = 0; j < this.cols_lift.length; j++) {
				export_lifitng[this.cols_lift[j]['header']] = arr[i][this.cols_lift[j]['field']];
			}

			this.export_lifting_list.push(export_lifitng);

		}
		this.export_lifting_list.push({
			'Qty (Tons)': this.total_qty,
			'Truck No': '',
			'Grade': '',
			'Remark': '',
			'Invoice No': '',
			'Invoice date': '',
			'Short Material Quantity': this.total_short_qty,
			'Damage Material Quantity': this.total_damage_qty,

		});

	}

	// download doc ,pdf , excel

	exportPdfLifting() {
		this.export_lifting_list = [];
		this.exportDataLifting();
		this.exportColumnsLifting = this.cols_lift.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdf(this.exportColumnsLifting, this.export_lifting_list, 'Local-Purchase');
	}

	exportExcelLifting() {
		this.export_lifting_list = [];
		this.exportDataLifting();
		this.exportService.exportExcel(this.export_lifting_list, 'Local-Purchase');
	}

	// on your component class declare
	onFilter(event, dt) {
		this.filteredValuess = [];
		this.total_qty = 0;
		this.total_short_qty = 0;
		this.total_damage_qty = 0;
		this.filteredValuess = event.filteredValue;
		this.total_qty = this.filteredValuess.reduce((sum, item) => sum + item.quantity, 0);
		this.total_short_qty = this.filteredValuess.reduce((sum, item) => sum + item.short_material_qty, 0);
		this.total_damage_qty = this.filteredValuess.reduce((sum, item) => sum + item.damage_material_qty, 0);

	}



	getDocsArray(doc) {
		return JSON.parse(doc);
	}


	getTerm(id) {

		switch (id) {
			case 1: {
				return '+GST ';
				break;
			}

			case 2: {
				return '+GST +Frt ';
				break;
			}

			case 3: {
				return '+GST-TDS';
				break;
			}
		}

	}

	// for all check box check
	onCheckAll(checked) {

		let arr = [];
		if (this.filteredValuess === undefined) {
			arr = this.lifitng_details;
		} else {
			arr = this.filteredValuess;
		}
		if (checked) {
			this.inputs.forEach(check => {
				check.nativeElement.checked = true;
			});
			for (const val of arr) {
				this.checkedList.push(val);
			}

		} else {
			this.inputs.forEach(check => {
				check.nativeElement.checked = false;
			});
			for (const val of arr) {
				this.checkedList.splice(this.checkedList.indexOf(val), 1);
			}
		}
	}

	// set check item list
	onCheck(checked, item) {
		if (checked) {
			this.checkedList.push(item);
		} else {
			this.checkedList.splice(this.checkedList.indexOf(item), 1);
		}
	}

	sendMail() {
		this.getTemplate();
		if (this.checkedList.length) {
			let status = false;

			if (this.checkedList.length) {


				for (let val of this.checkedList) {

					if (!val.original_doc_recv_flag) {
						status = true;
					} else {
						status = false;
						break;
					}

				}



				if (status) {
					this.myModalPending.show();
				} else {
					this.toasterService.pop('warning', 'warning', 'Please Select Record Which is Pending')
				}

			} else {
				this.toasterService.pop('warning', 'warning', 'Please Select Record ')
			}


		}

	}

	// set mail variable for to and cc
	mailto(check, val) {
		this.tomailtext = '';
		if (check) {
			this.tomail.push(val);
		} else {
			this.tomail.splice(this.tomail.indexOf(val), 1);
		}

		for (let i = 0; i < this.tomail.length; i++) {
			this.tomailtext = this.tomailtext + this.tomail[i] + ',';
		}
	}
	ccmail(check, val) {
		this.ccmailtext = '';
		if (check) {
			this.ccMail.push(val);
		} else {
			this.ccMail.splice(this.ccMail.indexOf(val), 1);
		}
		for (let i = 0; i < this.ccMail.length; i++) {
			this.ccmailtext = this.ccmailtext + this.ccMail[i] + ',';
		}

	}

	ccmailvalue($e) {
		this.ccmailtext = $e.target.value;
	}

	tomailvalue($e) {
		this.tomailtext = $e.target.value;
	}


	// close all open modal with data clear
	closeModalPending() {
		this.checkedList = [];
		this.tomail = [];
		this.ccMail = [];
		this.subject = '';
		this.template = '';
		this.footer = '';
		this.myModal.hide();
		this.myModalPending.hide();
		this.uncheckAll();
		this.getLocalPurchaseDetails();
	}

	// uncheck all checkbox

	uncheckAll() {

		this.inputs.forEach(check => {
			check.nativeElement.checked = false;
		});
	}

	// send mail to original pending
	original_pending_mail() {
		if (this.checkedList.length > 0 && this.tomailtext !== undefined && this.tomailtext !== '') {
			let html = '';
			let template_html = '';
			let arr = {};
			const non_id = [];
			let id = [];
			let company_id = this.lifitng_details_arr['company_id'];

			const to = this.tomailtext;
			const cc = this.ccmailtext;

			html += `Con ID: ${this.id} , Quantity: ${this.quantity} MT , Rate: ${this.rate} , Grade: ${this.grade_name} , Destination: ${this.godown_name}`;
			html += '<p>With reference to the above mentioned deal/s kindly find below the details of the pending purchase invoices against the same.</P>'

			html = html + '<table id="table"><tr><th>Sr.No</th><th>Material Received Date.</th><th>Particulars.</th> <th>Voucher Type</th><th>Invoice No</th><th>Invoice Date</th></tr>';
			for (let i = 0; i < this.checkedList.length; i++) {

				id.push(this.checkedList[i]['id']);

				html = html + `<tr><td> ${Number(i + 1)} </td><td> ${this.datepipe.transform(this.checkedList[i]['material_received_date'], 'dd/MM/yyyy')} </td><td> ${this.supplier} </td><td> LOCAL PURCH-PP</td><td> ${this.checkedList[i]['purchase_invoice_no']}</td><td> ${this.datepipe.transform(this.checkedList[i]['purchase_invoice_date'], 'dd/MM/yyyy')} </td>`;

				non_id.push(this.checkedList[i]['id']);
			}

			html = html + '</table>';
			let html2 = '';
			const re2 = /{TABLE}/gi;
			const SUBORG = /{SUBORG}/gi;

			let html_rep = this.template.replace(re2, html);
			html2 = html_rep.replace(SUBORG, this.supplier);
			html2 = html2 + this.footer;

			arr = { 'to': to, 'cc': cc, 'subject': this.subject, 'html': html2 };
			this.isLoadingMail = true;
			this.crudServices.postRequest<any>(LiftingDetails.sendPendingMail, { mail_object: arr, id: id, companyId: company_id }).subscribe(response => {
				this.isLoadingMail = false;
				this.closeModalPending();
				this.toasterService.pop(response.message, response.message, response.data);
			})



		} else {
			this.toasterService.pop('error', 'error', 'Check Email');
		}
	}

	getTemplate() {
		this.template = '';
		this.subject = '';

		this.footer = '';
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Original Pending Local Purchase' }).subscribe(response => {

			this.template = response[0].custom_html;
			this.subject = response[0].subject;


		})

		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
			this.footer = response[0].custom_html;

		})
	}

	getNotifications(name) {
		this.notification_tokens = [];
		this.notification_id_users = []
		this.notification_users = [];



		this.crudServices.getOne(Notifications.getNotificationDetailsByName, { notification_name: name }).subscribe((notification: any) => {
			if (notification.code == '100' && notification.data.length > 0) {
				this.notification_details = notification.data[0];
				this.crudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
					if (notificationUser.code == '100' && notificationUser.data.length > 0) {
						notificationUser['data'].forEach((element) => {
							if (element.fcm_web_token) {
								this.notification_tokens.push(element.fcm_web_token);
								this.notification_id_users.push(element.id);
							}
						});
					}
				});
			}
		})





	}


	generateNotification(data, id) {
		if (this.notification_details != undefined) {
			let body = {
				notification: data,
				registration_ids: this.notification_tokens
			};
			this.messagingService.sendNotification(body).then((response) => {
				if (response) {
					this.saveNotifications(body['notification'], id)
				}
				this.messagingService.receiveMessage();
				this.message = this.messagingService.currentMessage;

			})

		}


	}

	saveNotifications(notification_body, id) {
		this.notification_users = [];
		for (const element of this.notification_id_users) {
			this.notification_users.push({
				notification_id: this.notification_details.id,
				reciever_user_id: element,
				department_id: 1,
				heading: notification_body.title,
				message_body: notification_body.body,
				url: notification_body.click_action,
				record_id: id,
				table_name: 'local_purchase_lifting_dt',
			})
		}
		this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		}, (error) => console.error(error));
	}


	openUpdateFile(item, index) {
		this.index = index;
		this.lift_id = item.id;
		this.addForm.patchValue({
			purchase_rate: item.purchase_rate,
			original_doc_recv_flag: item.original_doc_recv_flag ? item.original_doc_recv_flag : false


		})

		this.myModalUpdateFile.show();

	}

	updateFile() {


		let data = {

			purchase_rate: this.addForm.value.purchase_rate,

			original_doc_recv_flag: this.addForm.value.original_doc_recv_flag ? 1 : 0,

			id: this.lift_id
		}



		let fileData: any = new FormData();
		const document: Array<File> = this.docs;
		const document1: Array<File> = this.docs2;

		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('local_purchase_lifting_invoice', document[i], document[i]['name']);

			}

		}

		if (document1.length > 0) {
			for (let i = 0; i < document1.length; i++) {
				fileData.append('local_purchase_original_docs_copy', document1[i], document1[i]['name']);

			}

		}



		if (document.length || document1.length) {

			this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
				let fileDealDocs = [];
				let fileDealDocs2 = [];
				let filesList = res.uploads.local_purchase_lifting_invoice;
				let filesList1 = res.uploads.local_purchase_original_docs_copy;



				if (res.uploads.local_purchase_original_docs_copy) {
					for (let i = 0; i < filesList1.length; i++) {
						fileDealDocs2.push(filesList1[i].location);
					}
					data['org_doc_invoice_copy'] = JSON.stringify(fileDealDocs2);
				}

				if (res.uploads.local_purchase_lifting_invoice) {
					for (let i = 0; i < filesList.length; i++) {
						fileDealDocs.push(filesList[i].location);
					}
					data['purchase_invoice_copy'] = JSON.stringify(fileDealDocs);
				}
				this.crudServices.updateData<any>(LiftingDetails.updateLiftingFile, data)
					.subscribe(response => {
						this.toasterService.pop(response.message, response.message, response.data);
						if (response.code === '100') {
							this.lifitng_details.splice(this.index, 1, response.dataResult[0]);
							this.oncloseModal();
							this.isLoading = false;

						}
					});

			})

		} else {

			this.crudServices.updateData<any>(LiftingDetails.updateLiftingFile, data)
				.subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
					this.isLoading = false;
					if (response.code === '100') {


						this.lifitng_details.splice(this.index, 1, response.dataResult[0]);

						this.oncloseModal();

					}
				});
		}


	}

	copyRecord(item) {


		let total_qty_lifting = this.lifitng_details.reduce((sum, item) => sum + item.quantity, 0);
		var total_lifting = Number(total_qty_lifting) + Number(item.quantity);
		if (total_lifting > Number(this.quantity)) {
			this.toasterService.pop('warning', 'warning', `Quantity Exceed By ${(total_lifting - this.quantity)} MT`)
		} else {
			this.isLoading = true;
			let data = {
				quantity: Number(item.quantity),
				grade_id: item.grade_id,
				//purchase_invoice_no: item.purchase_invoice_no,
				purchase_invoice_no: '',
				purchase_invoice_date: this.convert(item.purchase_invoice_date),
				truck_no: item.truck_no,
				sub_org_id: item.sub_org_id,
				godown_id: item.godown_id,
				local_purchase_id: this.id,

			}
			this.crudServices.addData<any>(LiftingDetails.add, data).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
				if (response.code === '100') {

					this.isLoading = false;
					this.lifitng_details.push(response.dataResult[0]);
					this.totalCalculation();
				}
			});
		}



	}










}
