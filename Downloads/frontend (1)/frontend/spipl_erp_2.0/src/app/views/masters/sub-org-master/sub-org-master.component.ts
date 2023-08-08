import { ActivatedRoute, Params, Router } from "@angular/router";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { PayableParameter, PayableParameterModel } from '../../../shared/payable-request/payable-parameter.model';
import { ToasterConfig, ToasterService } from "angular2-toaster";

import { CrudServices } from "../../../shared/crud-services/crud-services";
import { LoginService } from "../../login/login.service";
import { esLocale, ModalDirective } from "ngx-bootstrap";
import { PermissionService } from "../../../shared/pemission-services/pemission-service";
import { SelectService } from "../../../shared/dropdown-services/select-services";
import { ConsumeCapacity, GradeMaster, MainOrg, OrganizationCategory, SpiplBankMaster, SubOrg } from "../../../shared/apis-path/apis-path";
import { UserDetails } from "../../login/UserDetails.model";
import { staticValues } from "../../../shared/common-service/common-service";
import { forkJoin } from "rxjs";

@Component({
	selector: "app-sub-org-master",
	templateUrl: "./sub-org-master.component.html",
	styleUrls: ["./sub-org-master.component.scss"],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		SelectService,
		CrudServices,
	],
})

export class SubOrgMasterComponent implements OnInit {

	@ViewChild("extraPaymentModal", { static: false }) public extraPaymentModal: ModalDirective;
	@ViewChild("advancePaymentLCModal", { static: false }) public advancePaymentLCModal: ModalDirective;
	@ViewChild("consumeCapacity", { static: false }) public consumeCapacity: ModalDirective;
	@ViewChild("updateBcdLicenseModal", { static: false }) public updateBcdLicenseModal: ModalDirective;
	@ViewChild("myModal", { static: false }) public myModal: ModalDirective;
	@ViewChild('producttypemodal', { static: false }) public producttypemodal: ModalDirective;
	@ViewChild('sendWhatsappModel', { static: false }) public sendWhatsappModel: ModalDirective;



	chqCopyUpload: Array<File> = [];
	mailCopyUpload: Array<File> = [];
	public filterQuery = '';
	data: any = [];
	copyItem: any = [];
	isLoading = false;
	org_id: any = null;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	add_extra_payment_sub_org: boolean = false;
	add_sub_org: boolean = false;
	edit_sub_org: boolean = false;
	delete_sub_org: boolean = false;
	view_sub_org: boolean = false;
	user: UserDetails;
	mode: string;
	// producttype: any;
	editmode: boolean = false;
	initialPara: PayableParameterModel;
	form_error = new Array();
	links: any = [];

	toMobileArr = [];
	mainOrg: any = [];

	public popoverTitle: string = "Warning";
	public popoverMessage: string = "Are you sure, you want to delete?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Yes";
	public cancelText: string = "No";
	public placement: string = "right";
	public closeOnOutsideClick: boolean = true;

	addExtraPaymentForm: FormGroup;
	advancePaymentLCForm: FormGroup;
	consumeCapacityForm: FormGroup;
	productTypeform: FormGroup;

	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});
	copy_sub_org: boolean;
	change_status: boolean;
	showPaymentList: boolean;
	payment_req_vendor: boolean;
	cols: any = [];
	filter: any = [];

	limit: any = 50;
	offset: any = 0;
	selectedZone: any;
	company_id: any;
	enable_buttons: boolean = false;
	grade_arr = [];
	consumeGradeCapcityArr = [];
	ConsumeCapacityMode = 'add';
	consumeCapacityId: any;
	updateBcdPercentage: FormGroup;
	bcd_percentage: boolean;
	product_type_list: any = staticValues.product_type_list;
	show_both_company: boolean;

	addDeclarationLink: boolean = false;
	consumeCapacityLink: boolean = false;
	extraPaymentLink: boolean = false;
	type: { id: number; name: string; }[];
	subDetails: any;
	typeId: any;
	categories: any = [];
	categories_ids: any;
	whatsappData: string;
	sendHeads: any[];
	virtual_acc_whatsapp: boolean;
	productType: any;
	value: any;


	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private selectService: SelectService,
		private crudServices: CrudServices
	) {
		this.mode = "Add New";
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.add_extra_payment_sub_org = this.links.indexOf("add_extra_payment_sub_org") > -1;
		this.add_sub_org = this.links.indexOf("add sub org") > -1;
		this.edit_sub_org = this.links.indexOf("edit sub org") > -1;
		this.delete_sub_org = this.links.indexOf("delete sub org") > -1;
		this.view_sub_org = this.links.indexOf("view sub org") > -1;
		this.copy_sub_org = this.links.indexOf("copy sub org") > -1;
		this.change_status = this.links.indexOf("status sub org") > -1;
		this.payment_req_vendor = this.links.indexOf("Payment Req sub org") > -1;
		this.bcd_percentage = this.links.indexOf("Sub org BCD Percentage") > -1;
		this.show_both_company = (this.links.indexOf('org both company list') > -1);
		this.addDeclarationLink = (this.links.indexOf('addDeclarationLink') > -1);
		this.consumeCapacityLink = (this.links.indexOf('consumeCapacityLink') > -1);
		this.extraPaymentLink = (this.links.indexOf('extraPaymentLink') > -1);
		this.virtual_acc_whatsapp = (this.links.indexOf('virtual_acc_whatsapp') > -1);

		this.company_id = this.user.userDet[0].company_id;

		this.route.params.subscribe((params: Params) => {
			this.org_id = params["org_id"];
		});

		if (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33) {
			if (this.user.userDet[0].insider_parent_id != null) {
				this.selectedZone = this.user.userDet[0].insider_parent_id;
			} else {
				this.selectedZone = this.user.userDet[0].id;
			}
		}

		// if (this.user.userDet[0].role_id != 1 && (this.user.userDet[0].role_id == 5 || this.user.userDet[0].role_id == 33)) {
		// 	this.selectedZone = this.user.userDet[0].id;
		// }

		this.cols = [
			{ field: 'action', header: 'Action', style: '300' },
			{ field: 'sub_org_id', header: 'Sr No.', style: '60' },
			{ field: 'sub_org_name', header: 'Customer Name', style: '300' },
			{ field: 'product_type', header: 'Company Type', style: '60' },
			{ field: 'gst_no', header: 'GST No', style: '120' },
			{ field: 'virtual_acc_no', header: 'VA No', style: '120' },
			{ field: 'org_address', header: 'Address', style: '300' },
			{ field: 'port_name', header: 'Port', style: '60' },
			{ field: 'categories', header: 'Category', style: '150' },
			{ field: 'products', header: 'Product', style: '150' },
			{ field: 'zone', header: 'Zone', style: '120' },
			{ field: 'extra', header: 'Extra', style: '300' },
			{ field: 'payment', header: 'Payment', style: '300' },
			{ field: 'bcd_lic_percent', header: 'BCD%', style: '300' },
			{ field: 'base_limit', header: 'Base Limit', style: '150' },
			{ field: 'payment_term', header: 'Payment Term', style: '150' },
			{ field: 'extra_local', header: 'Extra Local', style: '150' },
			{ field: 'extra_import', header: 'Extra Import', style: '150' },
		];
		this.filter = ['sub_org_id', 'sub_org_name', 'product_type', 'gst_no', 'virtual_acc_no', 'org_address', 'zone', 'port_name'];

		this.addExtraPaymentForm = new FormGroup({
			sub_org_id: new FormControl(null, Validators.required),
			extra_payment: new FormControl(null, Validators.required)
		});

		this.advancePaymentLCForm = new FormGroup({
			sub_org_id: new FormControl(null, Validators.required),
			advance_lc_payment: new FormControl(null, Validators.required)
		});

		this.consumeCapacityForm = new FormGroup({
			sub_org_id: new FormControl(null, Validators.required),
			consume_capacity: new FormControl(null, Validators.required),
			grade_id: new FormControl(null, Validators.required)
		});

		this.productTypeform = new FormGroup({
			type: new FormControl(null, Validators.required),
			main_org_id: new FormControl(null)
		});

		this.updateBcdPercentage = new FormGroup({
			sub_org_id: new FormControl(null, Validators.required),
			bcd_lic_percent: new FormControl(null, Validators.required)
		});

		this.crudServices.getAll<any>(GradeMaster.getAll).subscribe((response) => {
			this.grade_arr = response;
		});

		this.crudServices.getAll<any>(OrganizationCategory.getAll).subscribe((response) => {
			this.categories = response;
		});
	}

	ngOnInit() {
		this.getMainOrgData();
		if (this.org_id != null && this.org_id != undefined) {
			this.getMainOrg();
		} else {
			this.enable_buttons = true;
			this.get_list();
		}
	}

	getMainOrgData() {
		this.crudServices.getAll(MainOrg.getAll).subscribe(response => {
			this.mainOrg = response["data"];
		});
	}
	getMainOrg() {
		this.crudServices.getOne(MainOrg.getOneData, {
			org_id: this.org_id
		}).subscribe((response) => {
			if (response['code'] == '100') {
				if (response['data'].length > 0) {
					let org_company_id = response['data'][0].company_id;
					this.company_id = org_company_id;
					this.enable_buttons = true;
					this.get_list();
				} else {
					this.data = [];
				}
			} else {
				this.data = [];
			}
		});
	}

	get_list() {
		this.data = [];
		this.isLoading = true;
		let conditions = {
			company_id: this.company_id,
			main_org_id: this.org_id,
			category_id: null
		}

		if (this.categories_ids != undefined && this.categories_ids.length) {
			conditions.category_id = this.categories_ids.toString()
		}



		if (this.selectedZone) {
			conditions['sales_acc_holder'] = this.selectedZone
		}
		this.crudServices.getOne<any>(SubOrg.getCategoryCustomers, conditions).subscribe(response => {
			response.forEach(element => {
				if (Number(element.tds) > 0) {
					element.tds_tcs_label = "TDS - " + element.tds;
				} else if (Number(element.tcs) > 0) {
					element.tds_tcs_label = "TCS - " + element.tcs;
				} else {
					element.tds_tcs_label = null;
				}
			});
			this.data = response;
			this.isLoading = false;
		});
	}

	getDate(regDate: string) {
		const date = new Date(regDate);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "2-digit",
		});
	}

	onDelete(id: number) {
		if (id) {
			this.crudServices.deleteData(SubOrg.delete_sub_org, { sub_org_id: id }).subscribe((response) => {
				this.get_list();
				this.toasterService.pop(response['message'], "Success", response['data']);
			});
		}
	}

	addNew() {
		if (this.org_id) {
			this.router.navigate(["/masters/add-sub-org", this.org_id]);
		} else {
			this.router.navigate(["/masters/add-sub-org"]);
		}
	}

	onEdit(sub_org_id) {
		this.router.navigate(["/masters/edit-sub-org", sub_org_id]);
	}

	onBlock(sub_org_id, blackList) {
		if (sub_org_id != null) {
			this.crudServices.updateData(SubOrg.blockSubOrg, { sub_org_id: sub_org_id, blackList: blackList }).subscribe((response) => {
				this.get_list();
				this.toasterService.pop(response['message'], "Success", response['data']);
			});
		}
	}

	onDetail(sub_org_id) {
		if (sub_org_id != null) {
			this.router.navigate([]).then(result => { window.open('/#/masters/sub-org-detail/' + sub_org_id, '_blank'); });
			// this.router.navigate(["masters/sub-org-detail", sub_org_id]);
		}
	}

	openExtraPaymentModal(item) {
		this.addExtraPaymentForm.patchValue({
			sub_org_id: item.sub_org_id,
			extra_payment: item.extra_payment
		});
		this.extraPaymentModal.show();
	}

	closeExtraPaymentModal() {
		this.addExtraPaymentForm.patchValue({
			sub_org_id: null,
			extra_payment: null
		});
		this.extraPaymentModal.hide();
	}

	addExtraPayment() {
		this.crudServices.postRequest<any>(SubOrg.addExtraPayment, {
			sub_org_id: this.addExtraPaymentForm.value.sub_org_id,
			extra_payment: Number(this.addExtraPaymentForm.value.extra_payment)
		}).subscribe(response => {
			if (response.code == '100') {
				this.extraPaymentModal.hide();
				this.get_list();
			}
		});
	}

	openAdvancePaymentLCModal(item) {
		this.advancePaymentLCForm.patchValue({
			sub_org_id: item.sub_org_id,
			advance_lc_payment: item.advance_lc_payment
		});
		this.advancePaymentLCModal.show();
	}

	openConsumeCapacity(item, flag) {
		this.crudServices.postRequest<any>(ConsumeCapacity.getGrdaeAgainstSubOrg, {
			sub_org_id: item.sub_org_id
		}).subscribe((response) => {
			this.consumeGradeCapcityArr = response;
		});

		if (flag == 'add') {
			this.ConsumeCapacityMode = 'add';
			this.consumeCapacityForm.patchValue({
				sub_org_id: item.sub_org_id,
			});
			this.consumeCapacityId = null;
		} else if ('edit') {
			this.ConsumeCapacityMode = 'edit';
			this.consumeCapacityForm.patchValue({
				sub_org_id: item.sub_org_id,
				grade_id: item.grade_master.grade_id,
				consume_capacity: item.consume_capacity,
			});

			this.consumeCapacityId = item.id;
		}
		this.consumeCapacity.show();

	}



	closeAdvancePaymentLCModal() {
		this.advancePaymentLCForm.patchValue({
			sub_org_id: null,
			advance_lc_payment: null
		});
		this.advancePaymentLCModal.hide();
	}

	bcdPercentage(item) {
		this.updateBcdPercentage.patchValue({
			sub_org_id: item.sub_org_id,
			bcd_lic_percent: item.bcd_lic_percent
		});
		this.updateBcdLicenseModal.show();
	}
	addbcdPercentage() {
		this.crudServices.postRequest<any>(SubOrg.addBcdPercentage, {
			sub_org_id: this.updateBcdPercentage.value.sub_org_id,
			bcd_lic_percent: Number(this.updateBcdPercentage.value.bcd_lic_percent)
		}).subscribe(response => {
			if (response.code == '100') {
				this.closeBCDLicenseModal()
				this.get_list();
			}
		});
	}

	closeBCDLicenseModal() {
		this.updateBcdPercentage.patchValue({
			sub_org_id: null,
			bcd_lic_percent: null
		});
		this.updateBcdLicenseModal.hide();
	}
	consumeCapacityModelClose() {
		this.consumeCapacity.hide();
	}


	addAdvancePaymentLC() {
		this.crudServices.postRequest<any>(SubOrg.updateAdvanceLCAmount, {
			sub_org_id: this.advancePaymentLCForm.value.sub_org_id,
			advance_lc_payment: Number(this.advancePaymentLCForm.value.advance_lc_payment)
		}).subscribe(response => {
			if (response.code == '100') {
				this.advancePaymentLCModal.hide();
				this.get_list();
			}
		});
	}

	addConsumeCapacity() {

		if (this.ConsumeCapacityMode == 'add') {
			this.crudServices.postRequest<any>(ConsumeCapacity.addData, {
				sub_org_id: this.consumeCapacityForm.value.sub_org_id,
				consume_capacity: this.consumeCapacityForm.value.consume_capacity,
				grade_id: this.consumeCapacityForm.value.grade_id,
			}).subscribe(response => {
				if (response.code == '100') {
					this.toasterService.pop(response.message, response.message, response.data)
					this.consumeCapacity.hide();
					//this.get_list();
					this.consumeCapacityForm.reset();
				}
			});
		} else if (this.ConsumeCapacityMode == 'edit') {
			this.crudServices.postRequest<any>(ConsumeCapacity.updateData, {
				sub_org_id: this.consumeCapacityForm.value.sub_org_id,
				consume_capacity: this.consumeCapacityForm.value.consume_capacity,
				grade_id: this.consumeCapacityForm.value.grade_id,
				id: this.consumeCapacityId
			}).subscribe(response => {
				if (response.code == '100') {
					this.toasterService.pop(response.message, response.message, response.data)
					this.consumeCapacity.hide();
					//this.get_list();
					this.consumeCapacityForm.reset();
				}
			});
		}

	}
	deleteCosnumeCapacity(id) {
		this.crudServices.postRequest<any>(ConsumeCapacity.delete, {
			id: id
		}).subscribe(response => {
			if (response.code == '100') {
				this.toasterService.pop(response.message, response.message, response.data)
				//this.get_list();
				this.consumeCapacity.hide();
			}
		});
	}

	onBackToList() {
		this.router.navigate(["/masters/org-master"]);
	}

	tdstcsdeclaration(item) {
		this.crudServices.postRequest<any>(SubOrg.tdstcsDeclaration, {
			sub_org_id: item.sub_org_id,
			gst_no: item.gst_no
		}).subscribe(response => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.message, response.data)
				this.get_list();
			}
		});

	}

	copyRow() {
		this.isLoading = true;
		this.crudServices.getOne<any>(SubOrg.getCustomer, {
			sub_org_id: this.copyItem.sub_org_id
		}).subscribe(response => {
			let res = response.data[0];
			let categories = [];
			let products = [];
			let product_tags = [];
			let tds_tcs = [];
			let bank_master = [];
			let contact_person = [];

			let org_data = {
				adhoc_limit: res.adhoc_limit,
				base_limit: res.base_limit,
				blacklist: res.blacklist,
				chq_amount: res.chq_amount,
				chq_no: res.chq_no,
				chq_scan_copy: res.chq_scan_copy,
				chq_status: res.chq_status,
				city_id: res.city_id,
				country_id: res.country_id,
				deleted: res.deleted,
				extra_payment: res.extra_payment,
				extra_payment_added_by: res.extra_payment_added_by,
				extra_payment_added_date: res.extra_payment_added_date,
				gst_no: res.gst_no,
				iec: res.iec,
				intro_mail_scan_copy: res.intro_mail_scan_copy,
				location_vilage: res.location_vilage,
				note: res.note,
				org_address: res.org_address,
				org_id: this.productTypeform.value.main_org_id,
				org_unit: res.org_unit,
				overdue_limit: res.overdue_limit,
				pan_no: res.pan_no,
				payment_term: res.payment_term,
				pin_code: res.pin_code,
				purchase_acc_holder: res.purchase_acc_holder,
				sales_acc_holder: res.sales_acc_holder,
				state_id: res.state_id,
				sub_org_name: res.sub_org_name,
				trader_manufacture: res.trader_manufacture,
				virtual_acc_no: res.virtual_acc_no,
				product_type: this.productTypeform.value.type

			};

			if (res.org_categories != null && res.org_categories.length > 0) {
				res.org_categories.forEach(element => {
					categories.push(element.org_cat_id);
				});
			}
			if (res.org_products != null && res.org_products.length > 0) {
				res.org_products.forEach(element => {
					products.push(element.prod_id);
				});
			}
			if (res.rel_suborg_products_tags != null && res.rel_suborg_products_tags.length > 0) {
				res.rel_suborg_products_tags.forEach(element => {
					product_tags.push(element.product_tag_id);
				});
			}

			if (res.org_tds_tcs != null && res.org_tds_tcs.length > 0) {
				res.org_tds_tcs.forEach(element => {
					let tds_tcsData = (({ id, ...rest } = element) => (rest))()
					tds_tcs.push(tds_tcsData);
				});
			}
			if (res.org_bank_masters != null && res.org_bank_masters.length > 0) {
				res.org_bank_masters.forEach(element => {
					let bankData = (({ bank_id, ...rest } = element) => (rest))()
					bank_master.push(bankData);
				});
			}
			if (res.org_contact_people != null && res.org_contact_people.length > 0) {
				res.org_contact_people.forEach(element => {
					let contactData = (({ cont_id, ...rest } = element) => (rest))()
					let numbersArray = [];
					contactData['contact_numbers'] = [];
					if (element.org_contact_numbers != null && element.org_contact_numbers.length > 0) {
						element.org_contact_numbers.forEach(element1 => {
							let numberData = (({ id, ...rest } = element1) => (rest))()
							numbersArray.push(numberData)
						});
						contactData['contact_numbers'] = numbersArray
					}
					let emailArray = [];
					contactData['contact_emails'] = [];
					if (element.org_contact_emails != null && element.org_contact_emails.length > 0) {
						element.org_contact_emails.forEach(element1 => {
							let emailData = (({ id, ...rest } = element1) => (rest))()
							emailArray.push(emailData);
						});
						contactData['contact_emails'] = emailArray
					}
					contact_person.push(contactData);
				});
			}
			// if (res.org_contact_people != null && res.org_contact_people.length > 0) {
			// 	res.org_contact_people.forEach(element => {
			// 		if (element.org_contact_emails != null && element.org_contact_emails.length > 0) {
			// 			element.org_contact_emails.forEach(element1 => {
			// 				let emailData = (({ id, ...rest } = element1) => (rest))()
			// 				contact_email.push(emailData);
			// 			});
			// 		}
			// 	});
			// }
			// if (res.org_contact_people != null && res.org_contact_people.length > 0) {
			// 	res.org_contact_people.forEach(element => {
			// 		if (element.org_contact_numbers != null && element.org_contact_numbers.length > 0) {
			// 			element.org_contact_numbers.forEach(element1 => {
			// 				let numberData = (({ id, ...rest } = element1) => (rest))()
			// 				contact_numbers.push(numberData);
			// 			});
			// 		}
			// 	});
			// }
			let body = {
				sub_org_Data: org_data,
				categories: categories,
				products: products,
				product_tags: product_tags,
				tds_tcs: tds_tcs,
				bank_master: bank_master,
				contact_person: contact_person,
				// contact_email: contact_email,
				// contact_numbers: contact_numbers
			};
			this.crudServices.addData<any>(SubOrg.add_sub_org, body).subscribe(res => {
				this.isLoading = false;
				if (res.code == '100') {
					this.get_list();
					this.toasterService.pop(res.message, res.message, 'New Organization Added');
					this.productTypeform.reset();
				}
			});
		});
	}

	product_Type(e) {
		this.value = e;
		if (this.value != this.productType) {
			this.productTypeform.get('main_org_id').setValidators([Validators.required]);
			this.productTypeform.get('main_org_id').updateValueAndValidity();
		}
		else {
			this.productTypeform.get('main_org_id').clearValidators();
			this.productTypeform.get('main_org_id').updateValueAndValidity();

		}
	}

	copyData(item) {
		this.copyItem = item;
		this.productType = item.product_type;
		this.producttypemodal.show();
	}
	typeSubmit() {
		this.copyRow();
		this.producttypemodal.hide();
	}
	onCloseTypeModal() {
		this.productTypeform.reset();
		this.producttypemodal.hide();
	}

	paymentRequest(): void {
		this.myModal.hide()
		let item = this.subDetails
		this.showPaymentList = true;
		let req_flag = this.typeId;
		const headerMsg = 'Payment Details for: ' + item.sub_org_name;
		this.initialPara = new PayableParameter(item.sub_org_id, 0, headerMsg, 0, item.sub_org_id, req_flag, item.sub_org_name, true, true, item.product_type);
	}

	backFromPayable(event) {
		this.typeId = null
		this.subDetails = null
		this.showPaymentList = false;
	}

	closeModal() {
		this.typeId = null
		this.subDetails = null
		this.myModal.hide()

	}


	getName(product_type) {

		if (product_type == 1) {
			return 'PVC';
		} else if (product_type == 2) {
			return 'PE & PP';
		} else if (product_type == 3) {
			return 'Surisha';
		} else {
			return '';
		}

	}

	selectType(item) {
		this.type = staticValues.other_payment_type
		this.subDetails = item
		this.myModal.show();



	}

	sendWhatsapp(item) {
		let req1 = this.crudServices.postRequest<any>(SubOrg.getSubOrgByContactEmail, { supplier_id: item.sub_org_id });
		let req2 = this.crudServices.postRequest<any>(SpiplBankMaster.getOne, { id: 28 });

		forkJoin([req1, req2]).subscribe(([data1, data2]) => {
			this.toMobileArr = data1.number;
			let html = `Dear Customer<br> Greetings from <b>SURISHA – IMPORT-in-INR</b> <br> ${item.sub_org_name}have been assigned a Virtual Account for automated reconciliation of payments<br>
			ACCOUNT NO : ${item.virtual_acc_no}<br>
			ACCOUNT NAME : <b>SURISHA A DIVISION OF SUSHILA PARMAR INTERNATIONAL PVT LTD</b><br>
			ACCOUNT BRANCH : <b>PUNE</b><br>
			BRANCH ADDRESS : MH<br>
			RTGS/NEFT/IFSC : ${data2[0].ifsc_code}<br>
			MICR : 411049049<br>
			Kindly make payments towards BOOKING / BALANCE amount payments to this account only.<br>
			Thank you once again for subscribing to <b>SURISHA IMPORT-in-INR service.</b><br>
			<b>TEAM SURISHA</b>
			`;

			this.sendHeads = [item.sub_org_name, item.virtual_acc_no, data2[0].ifsc_code, '411049049']

			this.whatsappData = html


			this.sendWhatsappModel.show();
		})
		//   this.crudServices.postRequest<any>(SubOrg.getSubOrgByContactEmail , {supplier_id : sub_org_id}).subscribe(response => {
		//     this.toMobileArr = response.number
		// 	let html = 	`Dear Customer \n `


		//   })
	}

	onCLoseWhatsapp() {
		this.toMobileArr = [];
		this.sendWhatsappModel.hide();

	}

	sendMessage() {


		if (this.toMobileArr.length) {
			this.crudServices.postRequest<any>(SubOrg.virtualAccUpdateWhatsapp, [{
				"template_name": 'virtual_account_update',
				"locale": "en",
				"numbers": this.toMobileArr,
				"params": this.sendHeads,
				"company_id": 3
			}
			]).subscribe(res => {
				this.toasterService.pop('success', "Success", "Message Sent");
				this.onCLoseWhatsapp();
			})
		}
	}


}
