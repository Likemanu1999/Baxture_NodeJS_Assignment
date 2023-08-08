import { Component, OnInit, ViewEncapsulation, ViewChild, Input, ViewChildren, QueryList, ElementRef, EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { environment } from '../../../../environments/environment';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { SpiplBankService } from '../../masters/spipl-bank-master/spipl-bank-service';
import { MainSubOrgService } from '../../masters/sub-org-master/main-sub-org-service';
import { ProformaInvoiceService, ProformaInvoiceList } from '../proforma-invoice/proforma-invoice-service';
import { PaymentTermService } from '../../masters/payment-term-master/payment-term-service';
import { CreateLcService, CreateLcList } from './create-lc-service';
import { OrgBankService } from '../../masters/sub-org-master/sub-org-detail/org-bank-service';
import { Table } from 'primeng/table';
import { IndentPIService } from './indent-pi-service';
import { TemplateService } from '../../masters/template-editor/template-service';
import { ExportService } from '../../../shared/export-service/export-service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import {
	FileUpload, foreignSupplier, PaymentTermMaster, SpiplBankMaster, flcProformaInvoice, subOrgRespectiveBank, lcCreation, EmailTemplateMaster, indentPi, nonLcPaymentList, ProformaInvoice, PortMaster,
	Notifications, NotificationsUserRel, UsersNotification
} from '../../../shared/apis-path/apis-path';
import { MessagingService } from '../../../service/messaging.service';
import { HelperService } from '../../../_helpers/helper_service';
import { staticValues } from '../../../shared/common-service/common-service';



@Component({
	selector: 'app-lc-creation',
	templateUrl: './lc-creation.component.html',
	styleUrls: ['./lc-creation.component.css', './lc-creation.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		SpiplBankService,
		MainSubOrgService,
		ProformaInvoiceService,
		PaymentTermService,
		CreateLcService,
		OrgBankService,
		IndentPIService,
		TemplateService,
		ExportService,
		CrudServices,
		MessagingService,
		HelperService
	]
})
export class LcCreationComponent implements OnInit {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('pendingMailModal', { static: false }) public pendingMailModal: ModalDirective;
	@ViewChild('indentModal', { static: false }) public indentModal: ModalDirective;
	@ViewChild('indentSwiftModal', { static: false }) public indentSwiftModal: ModalDirective;
	@ViewChild('registrationModal', { static: false }) public registrationModal: ModalDirective;


	@ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];
	@ViewChild('dt', { static: false }) table: Table;
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'right';
	public closeOnOutsideClick: boolean = true;
	serverUrl: string;
	user: UserDetails;
	filterForm: FormGroup;
	isLoading = false;
	links: string[] = [];
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	create_lc: boolean = false;
	sendMail: boolean = false;
	non_lc_pi: boolean = false;
	pi_flag_hold_release: boolean = false;
	company_wise_pi_list: boolean = false;
	lc_form: boolean = false;
	title: string = 'Proforma Invoices';
	public today = new Date();


	fileData: any = new FormData();
	pi_flag = [];
	spipl_bank = [];
	status = [];
	sub_org = [];
	lc_data = [];
	globalLcData = [];
	checkedList = [];
	pi_id_list = [];
	paymentTerm = [];
	qtyRate = [];
	quantity = [];
	org_bank = [];
	one_pi = [];
	item = [];
	tomail = [];
	ccMail = [];
	exportColumns: any[];

	// filter values
	pi_flag_status = 0;
	availability = 0;
	supplier = 0;
	bank = 0;
	non_pending_check = 0;

	lookup = {};
	supplier_list = [];
	buyer_list = [];
	lookup_bank = {};
	lookup_buyer = {};
	lookup_port = {};
	destports = [];
	loadports = [];
	lookup_load_port = [];

	lookup_grade = {}
	grade_arr = [];
	lookup_mainGrade = {};
	mainGrade_arr = [];

	banks = [];


	// lc form details
	buyerBankName: string;
	buyerBankAddress: string;
	buyerOrgAddress: string;
	buyerOrgName: string;
	suppierOrgName: string;
	suppierOrgAddress: string;
	currency: string;
	destinationPort: string;

	firstAdvBank: string;
	firstAdvBankAddress: string;
	material_load_port: string;
	adv_bank_swift_code: string;
	buyerBankSwiftCode: string;
	gradeName: string;
	piInsuranceType: string;
	payment_term: string;
	totamount = 0;
	totquantity = 0;
	expiry = 0;
	latest_date = '';
	exp_date = '';
	total_qty = 0;
	tot_rate = 0;
	commision_amt = 0;
	commision_received = 0;

	mode: any;
	buyeriec: any;
	filteredValuess: any[];
	total_amt: number;
	tomailtext: string;
	ccmailtext: string;
	email: any;




	// addform
	addForm: FormGroup;
	supplier_id: Number;
	spipl_bank_id: Number;
	available_with_bank_name: string;
	tolarance = [];
	transship = [];
	confirm = [];
	colss: any[];

	// Indent Lc Form
	indentForm: FormGroup;
	indentSwiftForm: FormGroup;


	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	indentlcdoc: Array<File> = [];
	nondoc: Array<File> = [];
	indentAmendDoc: Array<File> = [];
	indentSwiftDoc: Array<File> = [];
	indent_pi_id: any;
	indent_invoive: any;
	indet_commission: any;
	indent_flag: any;
	footer_template = [];
	html_template = [];
	tot_amt: number;
	export_data: any[];
	submitted: boolean;
	checkData: any[];
	IndentSwiftList = [];
	indentSwiftid: any;
	swift_date: any;
	swift_commision_amt: any;
	appDate: any;

	lcpaymentTerm: string;
	sendMailPI: boolean;
	sendMailNON: boolean;
	piRegistrationForm: FormGroup;
	piRegDoc: Array<File> = [];
	pi_id: any;
	port_list = [];
	company_list = [];

	destination_port_id = null;
	sc_lable: any;
	pi_registration_copy = [];


	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	message: any;

	bsRangeValue2: any = [];
	piFromDate: string;
	piToDate: string;
	currentYear: number;
	currdate = new Date();
	datePickerConfig: any = staticValues.datePickerConfigNew;
	uploadSuccess: EventEmitter<boolean> = new EventEmitter();
	isRange: any;

	company_flag = null;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private templateService: TemplateService,
		private exportService: ExportService,
		private fb: FormBuilder,
		private CrudServices: CrudServices,
		private deleteFile: HelperService,
		private MessagingService: MessagingService,
	) {


		this.currentYear = Number(this.datepipe.transform(this.currdate, 'yyyy'));
		if (this.datepipe.transform(this.currdate, 'MM') > '03') {

			this.bsRangeValue2 = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		} else {
			this.bsRangeValue2 = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

		}



		this.sc_lable = "Sales Contract List"
		this.serverUrl = environment.serverUrl;
		const perms = this.permissionService.getPermission();

		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		console.log(this.user.userDet[0].company_id
			, "this.user")
		this.links = this.user.links;

		this.create_lc = (this.links.indexOf('create lc') > -1);
		this.sendMail = (this.links.indexOf('send mail') > -1);
		this.sendMailPI = (this.links.indexOf('Mail PI Registration') > -1);
		this.sendMailNON = (this.links.indexOf('Mail NON Pending') > -1);
		this.non_lc_pi = (this.links.indexOf('non lc pi') > -1);

		this.pi_flag_hold_release = (this.links.indexOf('Flc Pi Hold/Release Link') > -1);
		this.company_wise_pi_list = (this.links.indexOf('company_wise_pi_list') > -1);

		this.company_list = staticValues.company_list;
		this.colss = [

			{ field: 'suppierOrgName', header: 'Supplier', style: '250px' },
			{ field: 'buyerOrgName', header: 'Buyer', style: '250px' },
			{ field: 'buyerBankName', header: 'Buyer Bank', style: '250px' },
			{ field: 'proform_invoice_no', header: 'PI Invoice Number', style: '150px' },
			{ field: 'shipment_month_year', header: 'Shipment Month Year', style: '150px' },
			{ field: 'proform_invoice_date', header: 'PI Invoice Date', style: '100px' },
			{ field: 'pi_quantity', header: 'Quantity', style: '100px' },
			{ field: 'unit', header: 'Unit', style: '100px' },
			{ field: 'pi_rate', header: 'Rate', style: '100px' },
			{ field: 'pi_rate', header: 'Amount', style: '200px' },
			{ field: 'currency', header: 'Currency', style: '100px' },
			{ field: 'mainGradeName', header: 'Main Grade', style: '100px' },
			{ field: 'gradeName', header: 'Grade', style: '100px' },
			{ field: 'destinationPort', header: 'Port', style: '150px' },
			{ field: 'pi_registration_date', header: 'PI Registration Date', style: '150px' },
			{ field: '', header: 'ETD/ETA', style: '200px' },
			{ field: '', header: 'LC/TT Details', style: '200px' },
			{ field: 'firstAdvBank', header: 'First Advising Bank', style: '180px' },
			{ field: 'secondAdvBank', header: 'Second Advising Bank', style: '180px' },
			{ field: 'pi_flag', header: 'PI Flag', style: '100px' },
			{ field: 'high_seas_label', header: 'High Seas Flag', style: '100px' },
			{ field: 'added_date', header: 'Added Date', style: '150px' },
			{ field: 'remark', header: 'Remark', style: '150px' },
			{ field: 'no_of_pallet', header: 'No of Pallets', style: '150px' },
		];


		//1 for our Spipl Bank
		// this.SpiplService.getBankListType(1).subscribe((response) => {
		// 	this.spipl_bank = response;
		// });


		//1 for our Spipl Bank
		this.CrudServices.getOne<any>(SpiplBankMaster.bankType, {
			bank_type: 1
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.spipl_bank = response;
			}

		});

		this.CrudServices.getAll<any>(PortMaster.getAll).subscribe(response => {
			this.port_list = response;


		})


		//get ForeignSupplier List
		this.CrudServices.getAll<any>(foreignSupplier.getAll).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.sub_org = response;
			}

		});

		// this.subOrgService.getForeignSupplier().subscribe((response) => {
		// 	this.sub_org = response;

		// });

		// this.paymentTermService.getPaymentTerm().subscribe((response) => {
		// 	this.paymentTerm = response;
		// });

		this.CrudServices.getAll<any>(PaymentTermMaster.getAll).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.paymentTerm = response;
			}
		});



		this.status = [{ 'name': 'All', 'id': 3 }, { 'name': 'Available', 'id': 1 }, { 'name': 'Lc Created', 'id': 2 }];
		this.pi_flag = [{ 'name': 'LC PI', 'id': 1 }, { 'name': 'NON-LC PI', 'id': 2 }, { 'name': 'Indent PI', 'id': 3 }];
		this.tolarance = [{ 'id': 0, 'name': 'Nill' }, { 'id': 1, 'name': '+/-1%' }, { 'id': 2, 'name': '+/-5%' }, { 'id': 3, 'name': '+/-10%' }];
		this.transship = [{ 'id': 1, 'name': 'ALLOWED' }, { 'id': 2, 'name': 'NOT ALLOWED' }];
		this.confirm = [{ 'id': 1, 'name': 'WITH' }, { 'id': 2, 'name': 'WITHOUT' }];

		this.addForm = this.fb.group({
			payment_term_id: [null, [Validators.required]],
			lc_date: [null, [Validators.required]],
			date_of_shipment: [null, [Validators.required]],
			lc_expiry_date: [null, [Validators.required]],
			transhipment: [null, [Validators.required]],
			partial_shipment: [null, [Validators.required]],
			confirmation: [null, [Validators.required]],
			available_with_by: [null, [Validators.required]],
			annexe_6_date: [null, [Validators.required]],
			annexe_7_date: [null, [Validators.required]],
			bl_description: [null, [Validators.required]],
			tolerance: [null, [Validators.required]],
			place: [null],
			supplier_id: [null, [Validators.required]],
			spipl_bank_id: [null, [Validators.required]],
			expiry_count: [null],
			app_date: [null],
		});

		// update indent
		this.indentForm = new FormGroup({

			'indent_commision_amt_usd': new FormControl(null),
			'indent_invoice_no': new FormControl(null),
			'indent_shipment_complete_flag': new FormControl(null),
			'scanimg_indent_lc': new FormControl(null),
			'scanimg_indent_non': new FormControl(null),
			'scanimg_indent_amend': new FormControl(null)
		});

		this.indentSwiftForm = new FormGroup({

			'indent_swift_date': new FormControl(null, [Validators.required]),
			'commision_amt': new FormControl(null, [Validators.required]),
			'indent_lc_copy': new FormControl(null)
		});

		this.piRegistrationForm = new FormGroup({

			'pi_registration_date': new FormControl(null),
			'pi_registration_copy': new FormControl(null)
		});


		this.templateService.getOneTemplate(2)
			.subscribe(response => {
				this.footer_template = response;
			});


		// this.CrudServices.getAll<any>(nonLcPaymentList.nonlcpaymentlist).subscribe((response) => {
		// 	console.log(response, "responsenonlcpayment");
		// });


	}


	ngOnInit() {
		this.piFromDate = this.bsRangeValue2[0];
		this.piToDate = this.bsRangeValue2[1];
		this.getNotifications('FOREIGN_SALE_CONTRACT_DELETE');
		//this.getPiList();
	}

	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.bsRangeValue2))
			this.uploadSuccess.emit(false);
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.bsRangeValue2 = dateValue.range;
		// this.selected_date_range = dateValue.range;

	}

	getNotifications(name) {
		this.notification_tokens = [];
		this.notification_id_users = []
		this.notification_users = [];

		this.CrudServices.getOne(Notifications.getNotificationDetailsByName, { notification_name: name }).subscribe((notification: any) => {
			if (notification.code == '100' && notification.data.length > 0) {
				this.notification_details = notification.data[0];
				console.log(this.notification_details, "received details")
				this.CrudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
					console.log(notificationUser, 'DATA');

					if (notificationUser.code == '100' && notificationUser.data.length > 0) {
						notificationUser['data'].forEach((element) => {
							if (element.fcm_web_token) {
								this.notification_tokens.push(element.fcm_web_token);
								this.notification_id_users.push(element.id);
								console.log(this.notification_tokens, this.notification_id_users)
							}
						});
					}
				});
			}
		})
	}

	async generateNotification(data, id) {
		console.log(this.notification_details, 'DIKSHA************');
		if (this.notification_details != undefined) {
			let body = {
				notification: data,
				registration_ids: this.notification_tokens
			};

			console.log(body, 'BODY****************');


			await this.MessagingService.sendNotification(body).then((response) => {
				if (response) {
					console.log(response);

					this.saveNotifications(body['notification'], id)
				}
				this.MessagingService.receiveMessage();
				this.message = this.MessagingService.currentMessage;

			})

		}
	}

	saveNotifications(notification_body, id) {
		console.log(id, 'DATA');

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
				table_name: 'flc_proforma_invoice',
			})
		}
		console.log(this.notification_users, "this.notification_users")
		this.CrudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		}, (error) => console.error(error));
	}

	get f() { return this.addForm.controls; }


	// on submit filter values
	onSubmit($e, name, id) {



		this.checkedList = [];
		this.lc_form = false;
		this.pi_id_list = [];
		this.qtyRate = [];
		this.quantity = [];
		this.item = [];
		this.available_with_bank_name = '';
		this.addForm.reset();
		if ($e) {
			this[name] = $e[id];
		} else {
			this[name] = 0;
		}


		console.log('global lc data', this.globalLcData)
		if (this.pi_flag_status !== 0 && this.availability === 0) {
			this.lc_data = this.filterFlag(this.globalLcData);
			this.sc_lable = "Sales Contract List";
		} else if (this.pi_flag_status !== 0 && this.availability !== 0) {
			this.sc_lable = "Create LC : Available Sales Contract List";
			this.lc_data = this.filterFlag_availability(this.globalLcData);
		} else {
			this.lc_data = this.globalLcData;
			this.sc_lable = "Sales Contract List";
		}
		this.checkData = this.lc_data;
		console.log(this.checkData, "checkdata");
		this.totalCalculation(this.lc_data);
		// this.getPiList();
	}

	checkNonPending(event) {
		if (event.currentTarget.checked) {
			this.non_pending_check = 1;
			this.sc_lable = "NON Pending List For LC/NON LC Sales Contracts";
		} else {
			this.non_pending_check = 0;
			this.sc_lable = "Sales Contract List";
		}
		this.getPiList();
	}

	dateChange($e) {
		console.log($e, "$e")
		this.piFromDate = this.convert($e[0]);
		this.piToDate = this.convert($e[1]);
		this.getPiList();
	}



	filterFlag(row) {
		return row.filter(data => data.pi_flag === this.pi_flag_status);
	}

	filterFlag_availability(row) {
		if (this.pi_flag_status === 1) {

			if (this.availability === 1) {
				return row.filter(data => data.pi_flag === this.pi_flag_status && data.lc_id == null);
			} else if (this.availability === 2) {
				return row.filter(data => data.pi_flag === this.pi_flag_status && data.lc_id != null);
			} else {
				return row.filter(data => data.pi_flag === this.pi_flag_status);
			}
		}

		if (this.pi_flag_status === 2) {
			return row.filter(data => data.pi_flag === this.pi_flag_status);
		}

		if (this.pi_flag_status === 3) {
			return row.filter(data => data.pi_flag === this.pi_flag_status);
		}
	}

	// conver string to array
	getDocsArray(docs) {
		if (docs != null || docs != '') {
			return JSON.parse(docs);
		} else {
			return null;
		}
		//return null;
	}

	// edit pi
	onEdit(id) {
		if (id) {
			this.router.navigate(['forex/edit-pi/' + id]);
		}
	}

	// delete pi
	onDelete(id: number) {

		if (id) {

			this.CrudServices.postRequest<any>(flcProformaInvoice.deletePi, {
				id: id
			}).subscribe((response) => {

				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {

					let subOrgDetailsNew: any = [];
					subOrgDetailsNew = this.globalLcData.find(item => item.id === id);
					console.log(subOrgDetailsNew, "subOrgDetailsNew")
					let data = {
						"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
						"body": `Foreign Sales Contract: Updated Sales Contract Against ${subOrgDetailsNew.suppierOrgName} of Sales Contract No. : ${subOrgDetailsNew.proform_invoice_no} `,
						"click_action": "#"
					}
					this.generateNotification(data, 1);


					this.toasterService.pop(response.message, 'Success', response.data);
					// this.getPiList();
					this.backToList();
				}

			});

			// this.piService.delete_pi(id).subscribe((response) => {
			// 	this.toasterService.pop(response.message, 'Success', response.data);
			// 	// this.getPiList();
			// 	this.backToList();
			// });
		}
	}


	// date conversion
	public getDate(regDate: string) {
		const date = new Date(regDate);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
	}



	// check if the item are selected
	checked(item) {
		if (this.checkedList.indexOf(item) !== -1) {
			return true;
		}
	}

	// when checkbox change, add/remove the item from the array
	onChange(checked, item) {
		const val = item.supplier_id;
		const amount = item.pi_quantity * item.pi_rate;

		if (checked) {
			this.checkedList.push(val);
			this.pi_id_list.push(item.id);
			this.qtyRate.push(amount);
			this.quantity.push(item.pi_quantity);
			this.item.push(item);

		} else {
			this.checkedList.splice(this.checkedList.indexOf(val), 1);
			this.pi_id_list.splice(this.pi_id_list.indexOf(item.id), 1);
			this.qtyRate.splice(this.qtyRate.indexOf(amount), 1);
			this.quantity.splice(this.quantity.indexOf(item.pi_quantity), 1);
			this.item.splice(this.item.indexOf(item), 1);
		}

		console.log(this.item, 'Neha don');



	}

	onCheckAll(checked) {
		let arr = [];
		arr = this.checkData;
		console.log(arr);
		if (checked) {
			this.inputs.forEach(check => {
				check.nativeElement.checked = true;
			});
			for (const val of arr) {
				// this.item.push(val);
				this.onChange(true, val);
			}

		} else {
			this.inputs.forEach(check => {
				check.nativeElement.checked = false;
			});
			for (const val of arr) {
				// this.item.splice(this.item.indexOf(val), 1);
				this.onChange(false, val);
			}
		}

		// this.onChange(true, this.item);




	}

	onSelectPort(event) {
		this.lc_data = [];
		this.destination_port_id = null;
		if (event != null) {
			this.destination_port_id = event.id;

		}
		this.getPiList();
	}

	onSelectCompany(event) {
		this.lc_data = [];
		if (event.id == 1) {
			this.company_flag = 1;
		} else if (event.id == 2) {
			this.company_flag = 2;
		} else if (event.id == 3) {
			this.company_flag = 3;
		}
		this.getPiList();
	}



	// get pi list
	getPiList() {

		console.log(this.bsRangeValue2[0], this.bsRangeValue2[1], "NEHAHHA");

		this.isLoading = true;
		this.lc_data = [];

		this.CrudServices.postRequest<any>(flcProformaInvoice.getAllPi, {
			pi_flag: this.pi_flag_status,
			avail_not_avail_all: this.availability,
			supplier_id: this.supplier,
			spipl_bank_id: this.bank,
			non_pending_check: this.non_pending_check,
			destination_port_id: this.destination_port_id,
			piFromDate: this.bsRangeValue2[0],
			piToDate: this.bsRangeValue2[1]
		}).subscribe((response) => {
			this.lc_data = [];
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				console.log(response, "getallPI");
				this.isLoading = false;
				const Currdate = new Date();
				let Difference_In_Time = 0;
				let Difference_In_Days = 0;
				let lc_exp_prev = 0;
				let lc_exp_next = 0;
				let lc_exp_flag = 0;

				for (const val of response) {
					if (this.pi_flag_hold_release || ((!this.pi_flag_hold_release) && (val.purchase_hold_qty_flag == 0))) {
						// LC Exp

						const lc_expiry = new Date(val.lc_expiry_date);
						const lc_expiry_nxt = new Date(val.lc_expiry_date);

						lc_exp_prev = lc_expiry.setDate(lc_expiry.getDate() - 12);
						lc_exp_next = lc_expiry_nxt.setDate(lc_expiry_nxt.getDate() + 10);

						// if ((new Date(lc_exp_prev) <= new Date(lc_exp_next)) && (new Date(lc_exp_prev) <= Currdate) && (Currdate <= new Date(lc_exp_next) )) {
						if ((new Date(lc_exp_prev) <= Currdate) && (Currdate <= new Date(lc_exp_next))) {
							lc_exp_flag = 1; // for Blink lc expiry date
						}

						//  ETD
						const ETD = new Date(val.tentitive_departure_date);
						if (val.tentitive_departure_date != null) {
							Difference_In_Time = Currdate.getTime() - ETD.getTime();
							Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
							val.ETD_diff = Math.floor(Difference_In_Days);

						} else {
							val.ETD_diff = 0;
						}



						val.lc_exp_flag = lc_exp_flag;
						if (val.high_seas_pi == 1) {
							val.high_seas_label = 'High Seas PI';
						} else {
							val.high_seas_label = '';
						}


						if (val.forward_sale_pi == 1) {
							val.forward_sale_label = 'Import Surisha PI';
						} else {
							val.forward_sale_label = '';
						}


						if (val.transnational_sale_pi == 1) {
							val.transnational_sale_label = 'Transnational Sale PI';
						} else {
							val.transnational_sale_label = '';
						}


						val.fsd_id = `FSD${val.foreign_deal_id}`;

						this.lc_data.push(val);

						// filter list

						if (!(val.suppierOrgName in this.lookup)) {
							this.lookup[val.suppierOrgName] = 1;
							this.supplier_list.push({ 'suppierOrgName': val.suppierOrgName });
						}

						if (!(val.buyerOrgName in this.lookup_buyer)) {
							this.lookup_buyer[val.buyerOrgName] = 1;
							this.buyer_list.push({ 'buyerOrgName': val.buyerOrgName });
						}						

						if (val.buyerBankName && val.buyerBankName.trim() !== '' && !(val.buyerBankName in this.lookup_bank)) {
							this.lookup_bank[val.buyerBankName] = 1;
							this.banks.push({ 'buyerBankName': val.buyerBankName });
						}
						  
						//destinationPort
						if (!(val.destinationPort in this.lookup_port)) {
							this.lookup_port[val.destinationPort] = 1;
							this.destports.push({ 'destinationPort': val.destinationPort });
						}


						if (!(val.loadPort in this.lookup_load_port)) {
							this.lookup_load_port[val.loadPort] = 1;
							this.loadports.push({ 'loadPort': val.loadPort });
						}


						if (!(val.gradeName in this.lookup_grade)) {
							this.lookup_grade[val.gradeName] = 1;
							this.grade_arr.push({ 'gradeName': val.gradeName });
						}

						if (!(val.mainGradeName in this.lookup_mainGrade)) {
							this.lookup_mainGrade[val.mainGradeName] = 1;
							this.mainGrade_arr.push({ 'mainGradeName': val.mainGradeName });
						}

						val.shipment_month_year = this.getMonth(val.shipment_month) + " - " + (val.shipment_year)


					}

				}


				let filterdata = [];
				if (this.user.userDet[0].company_id == 3) {
					filterdata = this.lc_data.filter(val => val.forward_sale_pi == 1);
				} else {
					if (this.company_flag == 1) {
						filterdata = this.lc_data.filter(val => val.companyId == 1 && val.forward_sale_pi == 0)
					} else if (this.company_flag == 2) {
						filterdata = this.lc_data.filter(val => val.companyId == 2 && val.forward_sale_pi == 0)
					} else if (this.company_flag == 3) {
						filterdata = this.lc_data.filter(val => val.forward_sale_pi == 1)
					} else if (this.company_flag == 0) {
						filterdata = this.lc_data;
					} else {
						filterdata = this.lc_data;
					}
				}


				this.lc_data = filterdata;

				this.globalLcData = this.lc_data;
				this.checkData = this.lc_data;
				this.totalCalculation(this.lc_data);
			}

			//this.table.reset();


		});

		// this.piService.getAllPi(this.pi_flag_status, this.availability, this.supplier, this.bank, this.non_pending_check).subscribe(response => {

		// 	console.log(response, "getallPI");
		// 	this.isLoading = false;
		// 	const Currdate = new Date();
		// 	let Difference_In_Time = 0;
		// 	let Difference_In_Days = 0;
		// 	let lc_exp_prev = 0;
		// 	let lc_exp_next = 0;
		// 	let lc_exp_flag = 0;

		// 	for (const val of response) {
		// 		// LC Exp

		// 		const lc_expiry = new Date(val.lc_expiry_date);
		// 		const lc_expiry_nxt = new Date(val.lc_expiry_date);

		// 		lc_exp_prev = lc_expiry.setDate(lc_expiry.getDate() - 12);
		// 		lc_exp_next = lc_expiry_nxt.setDate(lc_expiry_nxt.getDate() + 10);

		// 		// if ((new Date(lc_exp_prev) <= new Date(lc_exp_next)) && (new Date(lc_exp_prev) <= Currdate) && (Currdate <= new Date(lc_exp_next) )) {
		// 		if ((new Date(lc_exp_prev) <= Currdate) && (Currdate <= new Date(lc_exp_next))) {
		// 			lc_exp_flag = 1; // for Blink lc expiry date
		// 		}

		// 		//  ETD
		// 		const ETD = new Date(val.tentitive_departure_date);
		// 		Difference_In_Time = Currdate.getTime() - ETD.getTime();
		// 		Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
		// 		val.ETD_diff = Math.floor(Difference_In_Days);
		// 		val.lc_exp_flag = lc_exp_flag;



		// 		this.lc_data.push(val);

		// 		// filter list

		// 		if (!(val.suppierOrgName in this.lookup)) {
		// 			this.lookup[val.suppierOrgName] = 1;
		// 			this.supplier_list.push({ 'suppierOrgName': val.suppierOrgName });
		// 		}

		// 		if (!(val.buyerBankName in this.lookup_bank)) {
		// 			this.lookup_bank[val.buyerBankName] = 1;
		// 			this.banks.push({ 'buyerBankName': val.buyerBankName });
		// 		}

		// 		//destinationPort
		// 		if (!(val.destinationPort in this.lookup_port)) {
		// 			this.lookup_port[val.destinationPort] = 1;
		// 			this.destports.push({ 'destinationPort': val.destinationPort });
		// 		}

		// 	}
		// 	this.globalLcData = this.lc_data;
		// 	this.checkData = this.lc_data;
		// 	this.totalCalculation(this.lc_data);

		// });

	}




	totalCalculation(data) {

		console.log(data, "totalCalculation");
		this.total_qty = 0;
		this.tot_rate = 0;
		this.tot_amt = 0;
		this.commision_amt = 0;
		this.commision_received = 0;

		//item.half_pending_non

		if (this.non_pending_check == 1) {

			this.total_qty = this.someFunction(data)
		} else {
			this.total_qty = data.reduce((sum, item) => sum + Number(item.pi_quantity), 0);
		}


		console.log(this.non_pending_check, this.total_qty, "this.total_qty")
		// this.total_qty = data.reduce((sum, item) => sum + Number(item.pi_quantity), 0);
		this.tot_rate = data.reduce((sum, item) => sum + Number(item.pi_rate), 0);
		this.tot_amt = data.reduce((sum, item) => sum + (Number(item.pi_rate) * Number(item.pi_quantity)), 0);



		this.commision_amt = data.reduce((sum, item) => sum + Number(item.indent_commision_amt_usd), 0);


		this.commision_received = data.reduce((sum, item) => sum + Number(item.indentComissionReceived), 0);

		console.log(this.commision_amt, "cal");
	}


	someFunction(data) {
		return data.reduce(function (sum, item) {
			return (item.half_pending_non == 0) ? sum + item.pi_quantity : sum + item.half_pending_non;
		}, 0);
	}
	// open lc creation form
	createLc() {
		let status: boolean;
		this.totamount = 0;
		this.totquantity = 0;
		const msg = 'Select Same Supplier while creating Lc';
		// console.log(this.item);
		for (let i = 0; i < this.checkedList.length; i++) {

			if (this.checkedList[0] === this.checkedList[i]) {
				status = true;
			} else {
				status = false;
				break;
			}
		}
		if (!status) {
			this.toasterService.pop('error', msg);
		} else {
			this.lc_form = true;
			this.title = 'Letter of Credit';
			for (let i = 0; i < this.qtyRate.length; i++) {
				this.totamount = this.totamount + this.qtyRate[i];
			}

			for (let i = 0; i < this.quantity.length; i++) {
				this.totquantity = this.totquantity + this.quantity[i];
			}


			this.CrudServices.postRequest<any>(flcProformaInvoice.getOnePi, {
				id: this.pi_id_list[0]
			}).subscribe((response) => {

				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {

					this.one_pi = response;
					console.log(response, "loadport");
					this.buyerBankName = response[0]['buyerBankName'];
					this.buyerBankAddress = response[0]['buyerBankAddress'];
					this.buyerOrgName = response[0]['buyerOrgName'];
					this.buyerOrgAddress = response[0]['buyerOrgAddress'];
					this.suppierOrgName = response[0]['suppierOrgName'];
					this.suppierOrgAddress = response[0]['suppierOrgAddress'];
					this.currency = response[0]['currency'];
					this.destinationPort = response[0]['destinationPort'];
					this.firstAdvBank = response[0]['firstAdvBank'];
					this.firstAdvBankAddress = response[0]['firstAdvBankAddress'];
					this.material_load_port = response[0]['loadPort'];
					this.adv_bank_swift_code = response[0]['adv_bank_swift_code'];
					this.buyerBankSwiftCode = response[0]['buyerBankSwiftCode'];
					this.gradeName = response[0]['gradeName'];
					this.piInsuranceType = response[0]['piInsuranceType'];
					this.supplier_id = response[0]['supplier_id'];
					this.spipl_bank_id = response[0]['buyer_bank_id'];
					this.payment_term = response[0]['paymentTerm'];
					this.buyeriec = response[0]['iec'];

					this.CrudServices.postRequest<any>(subOrgRespectiveBank.getPerticularOrgBank, {
						sub_org_id: Number(this.supplier_id)
					}).subscribe((response) => {
						if (response.code === "101") {
							this.toasterService.pop(response.message, response.message, response.data);
						} else {
							this.org_bank = response;
							this.org_bank.push({ 'bank_id': 0, 'bank_name': 'Any Bank' });
							// console.log(this.org_bank);
						}
					});
					// this.BankService.getOrgBank(Number(this.supplier_id))
					// 	.subscribe((result) => {
					// 		this.org_bank = result;
					// 		this.org_bank.push({ 'bank_id': 0, 'bank_name': 'Any Bank' });
					// 		// console.log(this.org_bank);
					// 	});
				}
			});


			// this.piService.getOnePi(this.pi_id_list[0]).subscribe((response) => {
			// 	this.one_pi = response;
			// 	//console.log(response,"loadport");
			// 	this.buyerBankName = response[0]['buyerBankName'];
			// 	this.buyerBankAddress = response[0]['buyerBankAddress'];
			// 	this.buyerOrgName = response[0]['buyerOrgName'];
			// 	this.buyerOrgAddress = response[0]['buyerOrgAddress'];
			// 	this.suppierOrgName = response[0]['suppierOrgName'];
			// 	this.suppierOrgAddress = response[0]['suppierOrgAddress'];
			// 	this.currency = response[0]['currency'];
			// 	this.destinationPort = response[0]['destinationPort'];
			// 	this.firstAdvBank = response[0]['firstAdvBank'];
			// 	this.firstAdvBankAddress = response[0]['firstAdvBankAddress'];
			// 	this.material_load_port = response[0]['loadPort'];
			// 	this.adv_bank_swift_code = response[0]['adv_bank_swift_code'];
			// 	this.buyerBankSwiftCode = response[0]['buyerBankSwiftCode'];
			// 	this.gradeName = response[0]['gradeName'];
			// 	this.piInsuranceType = response[0]['piInsuranceType'];
			// 	this.supplier_id = response[0]['supplier_id'];
			// 	this.spipl_bank_id = response[0]['buyer_bank_id'];
			// 	this.payment_term = response[0]['paymentTerm'];
			// 	this.buyeriec = response[0]['iec'];

			// 	this.BankService.getOrgBank(Number(this.supplier_id))
			// 		.subscribe((result) => {
			// 			this.org_bank = result;
			// 			this.org_bank.push({ 'bank_id': 0, 'bank_name': 'Any Bank' });
			// 			// console.log(this.org_bank);
			// 		});

			// });
		}

		//  console.log(this.item);

	}

	// submit lc form

	onSubmitLc() {
		this.submitted = true;
		if (this.addForm.invalid) {
			return;
		}

		const invalid = [];
		const controls = this.addForm.controls;
		for (const name in controls) {
			if (controls[name].invalid) {
				invalid.push(name);
			}
		}

		if (!this.addForm.invalid) {

			//const formData: any = new FormData();
			// formData.append('payment_term_id', this.addForm.value.payment_term_id);
			// formData.append('lc_date', this.convert(this.addForm.value.lc_date));
			// formData.append('date_of_shipment', this.convert(this.addForm.value.date_of_shipment));
			// formData.append('lc_expiry_date', this.convert(this.addForm.value.lc_expiry_date));
			// formData.append('transhipment', this.addForm.value.transhipment);
			// formData.append('partial_shipment', this.addForm.value.partial_shipment);
			// formData.append('confirmation', this.addForm.value.confirmation);
			// formData.append('annexe_6_date', this.convert(this.addForm.value.annexe_6_date));
			// formData.append('annexe_7_date', this.convert(this.addForm.value.annexe_7_date));
			// formData.append('bl_description', this.addForm.value.bl_description);
			// formData.append('tolerance', this.addForm.value.tolerance);
			// formData.append('supplier_id', this.addForm.value.supplier_id);
			// formData.append('spipl_bank_id', this.addForm.value.spipl_bank_id);
			// formData.append('available_with_by', this.addForm.value.available_with_by);
			// formData.append('pi_arr', this.pi_id_list);

			let formData: any = {
				payment_term_id: this.addForm.value.payment_term_id,
				lc_date: this.convert(this.addForm.value.lc_date),
				date_of_shipment: this.convert(this.addForm.value.date_of_shipment),
				lc_expiry_date: this.convert(this.addForm.value.lc_expiry_date),
				transhipment: this.addForm.value.transhipment,
				partial_shipment: this.addForm.value.partial_shipment,
				confirmation: this.addForm.value.confirmation,
				annexe_6_date: this.convert(this.addForm.value.annexe_6_date),
				annexe_7_date: this.convert(this.addForm.value.annexe_7_date),
				bl_description: this.addForm.value.bl_description,
				tolerance: this.addForm.value.tolerance,
				supplier_id: this.addForm.value.supplier_id,
				spipl_bank_id: this.addForm.value.spipl_bank_id,
				available_with_by: this.addForm.value.available_with_by,
				pi_arr: this.pi_id_list
			};

			this.CrudServices.postRequest<any>(lcCreation.createLc, formData).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					this.submitted = false;
					setTimeout(() => {
						this.router.navigate(['forex/download-word/' + response.LCID]);
					}, 2000);
				}
			});

			// this.createLcService.addlc(formData).subscribe((response) => {
			// 	this.toasterService.pop(response.message, response.message, response.data);
			// 	if (response.code === '100') {
			// 		this.submitted = false;
			// setTimeout(() => {
			// 	this.router.navigate(['forex/download-word/' + response.LCID]);
			// }, 2000);

			// 	}
			// });


		}

	}

	backToList() {
		this.lc_form = false;
		this.checkedList = [];
		this.pi_id_list = [];
		this.qtyRate = [];
		this.quantity = [];
		this.item = [];
		this.available_with_bank_name = '';
		this.addForm.reset();
		this.submitted = false;
		this.title = 'Proforma Invoices';
		this.pi_flag_status = 0;
		this.availability = 0;
		this.getPiList();
	}


	convert(date) {
		if (date != null) {
			return this.datepipe.transform(date, 'yyyy-MM-dd');
		} else {
			return null;
		}
	}

	lastDateCalculate(val, date) {
		if (date) {
			this.latest_date = this.convert(date);
			const someDate = new Date(this.latest_date);
			someDate.setDate(someDate.getDate() + val); // number  of days to add, e.x. 15 days
			const dateFormated = someDate.toISOString().substr(0, 10);
			this.addForm.controls['lc_expiry_date'].setValue(dateFormated);
			// console.log(dateFormated);
		}
	}

	// appDateChange(lc_date)
	// {   
	// 	console.log(this.convert(lc_date) ,"lcDate");
	// 	this.appDate =this.convert(lc_date);
	// }




	public setSelectedStatus($e) {
		this.available_with_bank_name = $e['bank_name'];
	}

	// on your component class declare
	onFilter(event, dt) {
		console.log(event, dt, "onfilter")
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;
		this.checkData = this.filteredValuess;
		this.totalCalculation(this.filteredValuess);
	}


	// send Mail PI Registration
	sendPiMail(mode) {
		let status = false;
		this.html_template = [];
		if (this.item.length > 0) {
			console.log(this.item, "item");

			if (mode === '1') {
				// for pi registration mail
				for (let i = 0; i < this.item.length; i++) {
					if (this.item[0]['destination_port_id'] === this.item[i]['destination_port_id']) {
						status = true;
					} else {
						status = false;
						break;
					}
				}
				if (status) {
					this.getHtmlTemplate('6');
					this.email = this.item[0]['emailPort'].split(',');
					this.myModal.show();
					this.mode = mode;
				} else {
					this.toasterService.pop('error', 'error', 'PIs Port Not Same');
					this.uncheckAll();
				}
			} else if (mode === '2') {
				// for Non pending mail
				for (let i = 0; i < this.item.length; i++) {
					if (this.item[0]['supplier_id'] === this.item[i]['supplier_id']) {
						status = true;
					} else {
						status = false;
						break;
					}
				}
				//  console.log(status);
				if (status) {
					this.getHtmlTemplate('7');
					this.email = this.item[0]['org_email'];
					this.pendingMailModal.show();
					this.mode = mode;
				} else {
					this.toasterService.pop('error', 'error', 'PIs Supplier Not Same');
					this.uncheckAll();
				}
			}


		} else {
			this.toasterService.pop('error', 'error', 'Select PIs');
		}
	}


	send_mail() {
		if (this.item.length > 0 && this.tomailtext !== undefined && this.tomailtext !== '') {
			//console.log(this.item,"item");
			let html = '';
			const attachment = [];
			let template_html = '';
			let arr = {};
			const to = this.tomailtext;
			const cc = this.ccmailtext;
			const from = this.html_template[0]['from_name'];

			let subject = '';
			if (this.mode === '1') {
				const re = /{PORT}/gi;
				const str = this.html_template[0]['subject'];
				const sub_temp = str.replace(re, this.item[0]['destinationPort']);
				subject = sub_temp;
				html = html + '<table id="table"><tr><th>Sr.No</th><th>Customer Name</th><th>SC No.</th><th>SC Date</th><th>Quantity</th><th>Grade</th></tr>';
				for (let i = 0; i < this.item.length; i++) {

					// let proformaInvoiceDate =  this.item[i]['proform_invoice_date'].substr(8, 2) + '/' + this.item[i]['proform_invoice_date'].substr(5, 2) + '/' + this.item[i]['proform_invoice_date'].substr(0, 4);

					let proformaInvoiceDate = this.item[i]['proform_invoice_date'] != null ? this.datepipe.transform(this.item[i]['proform_invoice_date'], 'dd/MM/yyyy') : '';


					html = html + '<tr>';
					html = html + '<td>' + Number(i + 1) + '</td><td>' + this.item[i]['suppierOrgName'] + '</td><td>' + this.item[i]['proform_invoice_no'] + '</td><td>' + proformaInvoiceDate + '</td><td>' + this.item[i]['pi_quantity'] + '</td><td>' + this.item[i]['gradeName'] + '</td>';
					html = html + '</tr>';


				}
				html = html + '</table> ';

				for (let i = 0; i < this.item.length; i++) {
					if (this.item[i]['pi_copy']) {
						const files = JSON.parse(this.item[i]['pi_copy']);
						for (let j = 0; j < files.length; j++) {
							const test = files[j].split('/');

							attachment.push({ 'filename': test[4], 'path': files[j] });
						}
					}
				}

			}

			if (this.mode === '2') {
				subject = this.html_template[0]['subject'];

				html = html + '<table id="table" ><tr><th>Sr.No</th><th>Sales Contract No. </th><th>LC No. </th><th >Quantity </th><th>Grade</th><th >Port Of Discharge </th><th >ETD/Closing Date </th></tr>';
				let quantity = '';
				for (let i = 0; i < this.item.length; i++) {
					if (this.item[i].half_pending_non > 0) {
						quantity = this.item[i].half_pending_non;
					} else {
						quantity = this.item[i].pi_quantity;
					}

					let lcno = '';
					if (this.item[i]['pi_flag'] == 1) {
						lcno = this.item[i]['bank_lc_no'];
					}
					// let tentitiveShipDate = this.item[i]['tentitive_arrival_date'].substr(8, 2) + '/' + this.item[i]['tentitive_arrival_date'].substr(5, 2) + '/' + this.item[i]['tentitive_arrival_date'].substr(0, 4);
					let tentitiveShipDate = this.item[i]['tentitive_departure_date'] != null ? this.datepipe.transform(this.item[i]['tentitive_departure_date'], 'dd/MM/yyyy') : '';
					html = html + '<tr>';
					html = html + '<td>' + Number(i + 1) + '</td><td>' + this.item[i]['proform_invoice_no'] + '</td><td>' + lcno + '</td><td>' + quantity + 'MT </td><td>' + this.item[i]['gradeName'] + '</td><td>' + this.item[i]['destinationPort'] + '</td><td>' + tentitiveShipDate + '</td>';
					html = html + '</tr>';
				}
				html = html + '</table> ';
			}

			let html2 = '';
			const re2 = /{TABLE}/gi;
			template_html = this.html_template[0]['custom_html'];
			html2 = template_html.replace(re2, html);
			html2 = html2 + this.footer_template[0]['custom_html'];





			arr = { 'from': from, 'to': to, 'cc': cc, 'subject': subject, 'html': html2, 'attachments': attachment };
			// console.log(arr);

			if (arr) {
				this.isLoading = true;

				this.CrudServices.postRequest<any>(flcProformaInvoice.sendPiMail, {
					mail_object: arr,
					piid_arr: this.pi_id_list,
					flag: this.mode
				}).subscribe((response) => {
					this.toasterService.pop(response.message, response.message, response.data);
					if (response.code === "101") {
						this.isLoading = false;
						this.mode = '';
						this.closeModal();
					} else {
						this.isLoading = false;
						this.mode = '';
						this.closeModal();
					}
				});

				// this.piService.sendPIMail(arr, this.pi_id_list, this.mode).subscribe((response) => {
				// 	console.log(response);
				// 	this.toasterService.pop(response.message, response.message, response.data);
				// 	if (response.code === '100') {
				// 		this.isLoading = false;
				// 		this.mode = '';
				// 		this.closeModal();

				// 	} else {
				// 		this.isLoading = false;
				// 		this.mode = '';
				// 		this.closeModal();

				// 	}
				// });
			}


		} else {
			this.toasterService.pop('error', 'error', 'Check Email');
		}
	}




	getHtmlTemplate(id) {
		if (id) {
			this.CrudServices.postRequest<any>(EmailTemplateMaster.getOne, {
				id: id
			}).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					this.html_template = response;
				}

			});

			// this.templateService.getOneTemplate(id)
			// 	.subscribe(response => {
			// 		console.log(response);
			// 		this.html_template = response;
			// 	});
		}
	}

	// set mail variable for to and cc
	mailto(check, val) {
		// console.log(check);
		this.tomailtext = '';
		if (check) {
			this.tomail.push(val);
		} else {
			this.tomail.splice(this.tomail.indexOf(val), 1);
		}

		for (let i = 0; i < this.tomail.length; i++) {
			this.tomailtext = this.tomailtext + this.tomail[i] + ',';
		}
		// console.log(this.tomail);
	}
	ccmail(check, val) {
		// console.log(check);
		this.ccmailtext = '';
		if (check) {
			this.ccMail.push(val);
		} else {
			this.ccMail.splice(this.ccMail.indexOf(val), 1);
		}

		// console.log( this.ccMail);
		for (let i = 0; i < this.ccMail.length; i++) {
			this.ccmailtext = this.ccmailtext + this.ccMail[i] + ',';
		}

	}

	ccmailvalue($e) {
		this.ccmailtext = $e.target.value;
		//  console.log(this.ccmailtext);
	}

	tomailvalue($e) {
		this.tomailtext = $e.target.value;
		// console.log(this.tomailtext);
	}



	// close all open modal with data clear
	closeModal() {
		this.backToList();
		this.tomail = [];
		this.ccMail = [];
		this.ccmailtext = '';
		this.tomailtext = '';
		this.mode = '';
		this.myModal.hide();
		this.pendingMailModal.hide();
		this.uncheckAll();
	}

	// uncheck all checkbox

	uncheckAll() {
		this.item = [];
		this.inputs.forEach(check => {
			check.nativeElement.checked = false;
		});
	}


	// indent lc creation

	indentLc(item) {
		if (item.id) {
			this.indent_pi_id = item.id;
			this.indent_invoive = item.indent_invoice_no;
			this.indet_commission = item.indent_commision_amt_usd;
			console.log(this.indet_commission, " indent");
			this.indent_flag = item.indent_shipment_complete_flag;
			// console.log(this.indent_invoive);
			this.indentModal.show();
		}
	}

	addIndentSwiftDt(item) {
		if (item.id) {
			this.indent_pi_id = item.id;
			this.getIndentSwiftDetails();
			this.indentSwiftModal.show();

		}
	}


	addIndentLc(event: any) {

		this.indentlcdoc = <Array<File>>event.target.files;

		let files = <Array<File>>event.target.files;
		for (let i = 0; i < files.length; i++) {
			this.fileData.append('scanimg_indent_lc', files[i], files[i]['name']);
		}
	}


	scanIndentNon(event: any) {

		this.nondoc = <Array<File>>event.target.files;


		let files = <Array<File>>event.target.files;
		for (let i = 0; i < files.length; i++) {
			this.fileData.append('scanimg_indent_non', files[i], files[i]['name']);
		}
	}

	scanIndentAmend(event: any) {

		this.indentAmendDoc = <Array<File>>event.target.files;

		let files = <Array<File>>event.target.files;
		for (let i = 0; i < files.length; i++) {
			this.fileData.append('scanimg_indent_amend', files[i], files[i]['name']);
		}


	}

	addIndentswiftLc(event: any) {

		this.indentSwiftDoc = <Array<File>>event.target.files;

	}
	addRegistrationCopy(event: any) {

		this.piRegDoc = <Array<File>>event.target.files;

	}




	onSubmitIndent() {

		if (!this.indentForm.invalid) {
			// let indent_shipment_complete_flag = 0;
			// const formData: any = new FormData();
			// formData.append('indent_invoice_no', this.indentForm.value.indent_invoice_no);
			// formData.append('indent_commision_amt_usd', this.indentForm.value.indent_commision_amt_usd);
			// formData.append('id', this.indent_pi_id);
			// // console.log(this.indentForm.value.indent_shipment_complete_flag);
			// if (this.indentForm.value.indent_shipment_complete_flag) {
			// 	indent_shipment_complete_flag = 1;
			// }
			// formData.append('indent_shipment_complete_flag', indent_shipment_complete_flag);

			let indent_shipment_complete_flag = 0;
			if (this.indentForm.value.indent_shipment_complete_flag) {
				indent_shipment_complete_flag = 1
			}
			let formData: any = {
				indent_invoice_no: this.indentForm.value.indent_invoice_no,
				indent_commision_amt_usd: this.indentForm.value.indent_commision_amt_usd,
				id: this.indent_pi_id,
				indent_shipment_complete_flag

			};
			const document1: Array<File> = this.indentlcdoc;
			const document2: Array<File> = this.nondoc;
			const document3: Array<File> = this.indentAmendDoc;

			if (document1.length > 0 || document2.length > 0 || document3.length > 0) {


				this.CrudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
					let indentLc = [];
					let indentNon = [];
					let indentAmmend = [];
					let scanimg_indent_lc = res.uploads.scanimg_indent_lc;
					let scanimg_indent_non = res.uploads.scanimg_indent_non;
					let scanimg_indent_amend = res.uploads.scanimg_indent_amend;
					if (scanimg_indent_lc != null) {
						if (scanimg_indent_lc.length > 0) {
							for (let i = 0; i < scanimg_indent_lc.length; i++) {
								indentLc.push(scanimg_indent_lc[i].location);
							}
							formData['scanimg_indent_lc'] = JSON.stringify(indentLc);
						}

					}
					if (scanimg_indent_non != null) {
						if (scanimg_indent_non.length > 0) {
							for (let i = 0; i < scanimg_indent_non.length; i++) {
								indentNon.push(scanimg_indent_non[i].location);
							}
							formData['scanimg_indent_non'] = JSON.stringify(indentNon);
						}
					}

					if (scanimg_indent_amend != null) {
						if (scanimg_indent_amend.length > 0) {
							for (let i = 0; i < scanimg_indent_amend.length; i++) {
								indentAmmend.push(scanimg_indent_amend[i].location);
							}
							formData['scanimg_indent_amend'] = JSON.stringify(indentAmmend);
						}
					}

					this.saveIndentDocument(formData);
				});
			} else {

				this.CrudServices.postRequest<any>(indentPi.updateIndentPi, formData).subscribe((response) => {
					if (response.code === "101") {
						this.toasterService.pop(response.message, response.message, response.data);
					} else {
						this.toasterService.pop(response.message, response.message, response.data);
						this.indent_pi_id = '';
						this.indentForm.reset();
						this.indentModal.hide();
						this.backToList();
					}
				});

				// this.indentService.updateIndentPI(formData).subscribe((response) => {
				// 	this.toasterService.pop(response.message, response.message, response.data);
				// 	if (response.code === '100') {
				// 		this.indent_pi_id = '';
				// 		this.indentForm.reset();
				// 		this.indentModal.hide();
				// 		this.backToList();
				// 	}
				// });


			}



			// const document1: Array<File> = this.indentlcdoc;
			// if (document1.length > 0) {
			// 	for (let i = 0; i < document1.length; i++) {
			// 		formData.append('scanimg_indent_lc', document1[i], document1[i]['name']);
			// 	}
			// }

			// const document2: Array<File> = this.nondoc;
			// if (document2.length > 0) {
			// 	for (let i = 0; i < document2.length; i++) {
			// 		formData.append('scanimg_indent_non', document2[i], document2[i]['name']);
			// 	}
			// }


			// const document3: Array<File> = this.indentAmendDoc;
			// if (document3.length > 0) {
			// 	for (let i = 0; i < document3.length; i++) {
			// 		formData.append('scanimg_indent_amend', document3[i], document3[i]['name']);
			// 	}
			// }




		}



	}

	saveIndentDocument(form) {

		this.CrudServices.postRequest<any>(indentPi.updateIndentPi, form).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.indent_pi_id = '';
				this.indentForm.reset();
				this.indentModal.hide();
				this.backToList();
			}
		});

		// this.indentService.updateIndentPI(form).subscribe((response) => {
		// 	this.toasterService.pop(response.message, response.message, response.data);
		// 	if (response.code === '100') {
		// 		this.indent_pi_id = '';
		// 		this.indentForm.reset();
		// 		this.indentModal.hide();
		// 		this.backToList();
		// 	}
		// });

	}

	onSubmitIndentSwift() {

		// const formData: any = new FormData();
		// formData.append('swift_date', this.convert(this.indentSwiftForm.value.indent_swift_date));
		// formData.append('commision_amt', this.indentSwiftForm.value.commision_amt);
		// formData.append('piid', this.indent_pi_id);
		// formData.append('id', this.indentSwiftid);

		let formData: any = {
			indent_swift_date: this.convert(this.indentSwiftForm.value.indent_swift_date),
			indent_commision_amt: this.indentSwiftForm.value.commision_amt,
			pi_id: this.indent_pi_id,
			id: this.indentSwiftid,
		};


		const fileData = new FormData();
		const document: Array<File> = this.indentSwiftDoc;
		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('indent_swift_copy', document[i], document[i]['name']);
			}
			this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
				let files = [];
				let filesList = res.uploads.indent_swift_copy;
				if (filesList.length > 0) {
					for (let i = 0; i < filesList.length; i++) {
						files.push(filesList[i].location);
					}
					formData['indent_swift_copy'] = JSON.stringify(files);
					this.saveIndentSwift(formData);
				}
			});
		} else {

			if (this.indentSwiftid) {


				this.CrudServices.postRequest<any>(indentPi.updateIndentSwiftDetails, formData).subscribe((response) => {
					if (response.code === "101") {
						this.toasterService.pop(response.message, response.message, response.data);
					} else {
						this.toasterService.pop(response.message, response.message, response.data);
						this.indentSwiftForm.reset();
						this.indentSwiftid = 0;
						this.getIndentSwiftDetails();
						//  this.indentModal.hide();
						//  this.backToList();

					}
				});

				// this.indentService.updateIndentSwiftDt(formData).subscribe((response) => {
				// 	this.toasterService.pop(response.message, response.message, response.data);
				// 	if (response.code === '100') {
				// 		this.indentSwiftForm.reset();
				// 		this.indentSwiftid = 0;
				// 		this.getIndentSwiftDetails();
				// 		//  this.indentModal.hide();
				// 		//  this.backToList();
				// 	}
				// });

			} else {
				this.CrudServices.postRequest<any>(indentPi.addIndentSwiftDetails, formData).subscribe((response) => {
					if (response.code === "101") {
						this.toasterService.pop(response.message, response.message, response.data);
					} else {
						this.toasterService.pop(response.message, response.message, response.data);
						this.indentSwiftForm.reset();
						this.getIndentSwiftDetails();
						//  this.indentModal.hide();
						//  this.backToList();

					}
				});

				// this.indentService.addIndentSwiftDt(formData).subscribe((response) => {
				// 	this.toasterService.pop(response.message, response.message, response.data);
				// 	if (response.code === '100') {
				// 		this.indentSwiftForm.reset();
				// 		this.getIndentSwiftDetails();
				// 		//  this.indentModal.hide();
				// 		//  this.backToList();
				// 	}
				// });
			}

		}
	}


	saveIndentSwift(form) {

		if (this.indentSwiftid) {

			this.CrudServices.postRequest<any>(indentPi.updateIndentSwiftDetails, form).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					this.toasterService.pop(response.message, response.message, response.data);
					this.indentSwiftForm.reset();
					this.indentSwiftid = 0;
					this.getIndentSwiftDetails();
					//  this.indentModal.hide();
					//  this.backToList();
				}

			});

			// this.indentService.updateIndentSwiftDt(form).subscribe((response) => {
			// 	this.toasterService.pop(response.message, response.message, response.data);
			// 	if (response.code === '100') {
			// 		this.indentSwiftForm.reset();
			// 		this.indentSwiftid = 0;
			// 		this.getIndentSwiftDetails();
			// 		//  this.indentModal.hide();
			// 		//  this.backToList();
			// 	}
			// });
		} else {

			this.CrudServices.postRequest<any>(indentPi.addIndentSwiftDetails, form).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					this.toasterService.pop(response.message, response.message, response.data);
					this.indentSwiftForm.reset();
					this.getIndentSwiftDetails();
					//  this.indentModal.hide();
					//  this.backToList();
				}

			});

			// this.indentService.addIndentSwiftDt(form).subscribe((response) => {
			// 	this.toasterService.pop(response.message, response.message, response.data);
			// 	if (response.code === '100') {
			// 		this.indentSwiftForm.reset();
			// 		this.getIndentSwiftDetails();
			// 		//  this.indentModal.hide();
			// 		//  this.backToList();
			// 	}
			// });
		}

	}
	onDeleteIndentSwift(item, index) {
		if (item.id) {

			this.CrudServices.postRequest<any>(indentPi.deleteIndentSwiftDetails, {
				id: item.id,
			}).subscribe((response) => {
				if (response.code === "101") {
					this.toasterService.pop(response.message, response.message, response.data);
				} else {
					this.toasterService.pop(response.message, response.message, response.data);
					this.IndentSwiftList.splice(index, 1);
				}

			});

			// this.indentService.deleteIndentSwiftDt(item.id)
			// 	.subscribe(response => {
			// 		this.toasterService.pop(response.message, response.message, response.data);
			// 		this.IndentSwiftList.splice(index, 1);
			// 	});

		}
	}

	resetIndentSwift() {
		this.indentSwiftForm.reset();
		this.indentSwiftid = 0;
	}

	onCloseIndentSwiftModal() {
		this.resetIndentSwift();
		this.indentSwiftModal.hide();
	}

	// get indent swift details

	getIndentSwiftDetails() {
		this.CrudServices.postRequest<any>(indentPi.getIndentSwiftDetails, {
			piid: this.indent_pi_id
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.IndentSwiftList = response;
			}
		});
		// this.indentService.getIndentSwiftDt(this.indent_pi_id)
		// 	.subscribe(response => {
		// 		this.IndentSwiftList = response;
		// 		console.log(this.IndentSwiftList, "indentswift")
		// 	});

	}

	onEditIndentSwift(item) {
		if (item.id) {
			this.indentSwiftid = item.id;
			this.swift_date = item.indent_swift_date;
			this.swift_commision_amt = item.indent_commision_amt;
		}
	}


	// non lc pi

	non_lc_details(id: number) {
		this.router.navigate(['forex/non-lc-pi/' + id]);

	}

	exportData() {
		let data = {};
		this.export_data = [];
		let qty = 0;
		let rate = 0;
		let indent_comm = 0;
		let indent_comm_received = 0;
		let amount = 0;


		for (const val of this.checkData) {
			let lc_tt_details = '';
			let etd_eta = '';
			let flag = '';
			etd_eta = 'ETD:' + val.tentitive_departure_date + 'ETA :' + val.tentitive_arrival_date;
			if (val.pi_flag === 1 && val.lc_expiry_date) {
				lc_tt_details = 'Lc Expiry Date: ' + val.lc_expiry_date + '\nBank Lc No:' + val.bank_lc_no + '\nLc Opening Date:' + val.lc_opening_date;
			} else if (val.pi_flag === 2) {

				//non_lc_swift_tt_details
				if (val.non_lc_swift_details !== null) {
					//this.getDocsArray(val.non_lc_swift_details)
					for (const swiftdtt of val.non_lc_swift_details) {
						lc_tt_details = lc_tt_details + '\nREF No: ' + swiftdtt.non_lc_swift_ref_no + '\nSwift Date:' + swiftdtt.non_lc_swift_date;
					}
				}

			}

			if (val.pi_flag === 1) {
				flag = 'LC PI';
			} else if (val.pi_flag === 2) {
				flag = 'Non Lc PI';
			} else if (val.pi_flag === 3) {
				flag = 'Indent PI';
			}
			data = {
				'Supplier': val.suppierOrgName,
				'Buyers': val.buyerOrgName,
				'Buyer Bank': val.buyerBankName,
				'PI Invoice Number': val.proform_invoice_no,
				'PI Invoice Date': val.proform_invoice_date,
				'Quantity': val.pi_quantity,
				'Unit': val.unit,
				'Rate': val.pi_rate,
				'Amount': Number(val.pi_quantity) * Number(val.pi_rate),
				'Currency': val.currency,
				'Grade': val.gradeName,
				'Port': val.destinationPort,
				'ETD/ETA': etd_eta,
				'LC/TT Details': lc_tt_details,
				'First Advising Bank': val.firstAdvBank,
				'Second Advising Bank': val.secondAdvBank,
				'PI Flag': flag,
				'Indent Invoice No.': val.indent_invoice_no,
				'Indent Commision Amount': val.indent_commision_amt_usd,
				'Indent Commision Received': val.indentComissionReceived,
				'Added Date': val.added_date,
				'No of Pallets':val.no_of_pallet
			};
			this.export_data.push(data);
			qty = qty + Number(val.pi_quantity);
			rate = rate + Number(val.pi_rate);
			amount = amount + Number(val.pi_quantity) * Number(val.pi_rate);

			indent_comm = indent_comm + Number(val.indent_commision_amt_usd);
			indent_comm_received = indent_comm_received + Number(val.indentComissionReceived);

		}

		const foot = {
			'Supplier': 'Total',
			'Buyers': '',
			'Buyer Bank': '',
			'PI Invoice Number': '',
			'PI Invoice Date': '',
			'Quantity': qty,
			'Unit': '',
			'Rate': '',
			'Amount': amount,
			'Currency': '',
			'Grade': '',
			'Port': '',
			'ETD/ETA': '',
			'LC/TT Details': '',
			'First Advising Bank': '',
			'Second Advising Bank': '',
			'PI Flag': '',
			'Indent Invoice No.': '',
			'Indent Commision Amount': indent_comm,
			'Indent Commision Received': indent_comm_received,
			'Added Date': ''
		};
		this.export_data.push(foot);
	}

	exportExcel() {
		this.export_data = [];
		this.exportData();
		this.exportService.exportExcel(this.export_data, 'PI List');
	}

	exportPdf() {
		this.export_data = [];
		this.exportData();
		this.exportColumns = this.colss.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdf(this.exportColumns, this.export_data, 'PI List');
	}


	// multiselect filter
	onchange(event, name) {
		const arr = [];
		if (event.value.length > 0) {
			for (let i = 0; i < event.value.length; i++) {
				arr.push(event.value[i][name]);
			}
			// console.log(arr);
			this.table.filter(arr, name, 'in');

		} else {
			this.table.filter('', name, 'in');
		}
	}




	getFlag(val: Number) {
		switch (val) {
			case 1: {
				return '<span class="badge badge-primary" style="font-size: 1em;">LC PI</span>';
				break;
			}
			case 2: {
				return '<span class="badge badge-success" style="font-size: 1em;">Non LC PI</span>';
				break;
			}
			case 3: {
				return '<span class="badge badge-danger" style="font-size: 1em;">Indent PI</span>';
				break;
			}

		}
	}

	onchange_payterm(e) {
		console.log(e.pay_term, "incoterm");
		this.lcpaymentTerm = e.pay_term;
	}

	piRegistration(item) {
		this.pi_id = item.id;
		this.piRegistrationForm.patchValue({
			pi_registration_date: item.pi_registration_date != null ? new Date(item.pi_registration_date) : null
		})
		this.pi_registration_copy = JSON.parse(item.pi_registration_copy);
		this.registrationModal.show();

	}

	clodeModalPiRegistartion() {
		this.registrationModal.hide();
		this.piRegistrationForm.reset();
		this.pi_id = null;
		this.getPiList();
	}

	onSubmitPiRegDoc() {
		let data = {
			pi_registration_date: this.piRegistrationForm.value.pi_registration_date,
			id: this.pi_id
		}

		const fileData = new FormData();
		const document: Array<File> = this.piRegDoc;
		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('pi_registration_copy', document[i], document[i]['name']);
			}
			this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
				let files = [];
				if (this.pi_registration_copy != null) {
					files = this.pi_registration_copy;
				}

				let filesList = res.uploads.pi_registration_copy;
				if (filesList.length > 0) {
					for (let i = 0; i < filesList.length; i++) {
						files.push(filesList[i].location);
					}
					data['pi_registration_copy'] = JSON.stringify(files);
					this.CrudServices.updateData<any>(ProformaInvoice.piRegistrationUpdate, data).subscribe(response => {
						if (response) {
							this.toasterService.pop(response.message, response.message, response.data);
							this.clodeModalPiRegistartion();

						} else {
							this.clodeModalPiRegistartion();
						}
					})
				}
			});
		} else {
			this.CrudServices.updateData<any>(ProformaInvoice.piRegistrationUpdate, data).subscribe(response => {
				if (response) {
					this.toasterService.pop(response.message, response.message, response.data);
					this.clodeModalPiRegistartion();

				} else {
					this.clodeModalPiRegistartion();
				}
			})
		}


	}


	getMonth(month: Number) {
		switch (month) {
			case 1: {
				return 'January';
				break;
			}
			case 2: {
				return 'February';
				break;
			}
			case 3: {
				return 'March';
				break;
			}
			case 4: {
				return 'April';
				break;
			}
			case 5: {
				return 'May';
				break;
			}
			case 6: {
				return 'June';
				break;
			}
			case 7: {
				return 'July';
				break;
			}
			case 8: {
				return 'August';
				break;
			}
			case 9: {
				return 'September';
				break;
			}
			case 10: {
				return 'October';
				break;
			}
			case 11: {
				return 'November';
				break;
			}
			case 12: {
				return 'December';
				break;
			}

		}
	}

	onDeletePIReg(arr, doc, name, id) {



		this.deleteFile.deleteDoc(JSON.parse(arr), doc, name, { id: id }, ProformaInvoice.deleteRegistrationDoc).subscribe(res => {
			this.toasterService.pop(res.message, res.message, res.data)
		})

	}

}
