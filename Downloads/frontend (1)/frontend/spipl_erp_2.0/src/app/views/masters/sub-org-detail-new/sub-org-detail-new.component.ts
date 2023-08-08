import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { UserDetails } from '../../login/UserDetails.model';
import { environment } from '../../../../environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster/angular2-toaster';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { LoginService } from '../../login/login.service';
// import { MainSubOrgService } from '.././main-sub-org-service';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from "primeng/table";
import {
	CountryMaster,
	FileUpload,
	JobProfileMaster,
	MainContact,
	SubOrg,
	subOrgRespectiveBank
} from '../../../shared/apis-path/apis-path';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-sub-org-detail-new',
	templateUrl: './sub-org-detail-new.component.html',
	styleUrls: ['./sub-org-detail-new.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		CrudServices,
	],
})

export class SubOrgDetailNewComponent implements OnInit {

	@ViewChild("addContactPersonModal", { static: false }) public addContactPersonModal: ModalDirective;
	@ViewChild("editContactPersonModal", { static: false }) public editContactPersonModal: ModalDirective;
	@ViewChild("updateContactNumberModal", { static: false }) public updateContactNumberModal: ModalDirective;
	@ViewChild("updateContactEmailModal", { static: false }) public updateContactEmailModal: ModalDirective;
	@ViewChild("updateBankModal", { static: false }) public updateBankModal: ModalDirective;
	@ViewChild('copyContactsModal', { static: false }) public copyContactsModal: ModalDirective;


	@ViewChild("dt1", { static: false }) table1: Table;
	@ViewChild("dt2", { static: false }) table2: Table;
	@ViewChild("dt3", { static: false }) table3: Table;

	popoverTitle: string = 'Warning';
	popoverMessage: string = 'Are you sure, you want to delete?';
	confirmText: string = 'Confirm';
	cancelText: string = 'Cancel';
	placement: string = 'left';

	cancelClicked: boolean = false;
	isLoadingBank: boolean = false;
	isLoadingContact: boolean = false;
	isLoadingDca: boolean = false;
	isLoadingCopy: boolean = false;

	type: any = null;
	user: UserDetails;
	links: string[] = [];
	sub_org_id: any = null;

	disableCheckOptions: boolean = false;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;

	job_list: any = [];
	dca_cs_list: any = [];
	gst_logo_list: any = [];
	Follow_list: any = [];
	countryList: any = [];

	org_data: any = {};
	bank_data: any = [];
	contact_data: any = [];
	dca_data: any = [];
	copy_contacts_data: any = [];

	bank_cols: any = [];
	contact_cols: any = [];
	dca_cols: any = [];
	copy_contacts_cols: any = [];

	dca_filter: any = [];
	contact_filter: any = [];
	bank_filter: any = [];
	checked_org: any = [];
	copy_contacts_filter: any[];

	addContactPersonForm: FormGroup;
	editContactPersonForm: FormGroup;
	contactNumberForm: FormGroup;
	contactEmailForm: FormGroup;
	bankForm: FormGroup;
	dcaCsForm: FormGroup;
	fileUploadForm: FormGroup;
	copiedContact: any = null;
	fileData: FormData = new FormData();

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});
	fileupload: any;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private crudServices: CrudServices,
		toasterService: ToasterService,
	) {
		this.toasterService = toasterService;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;

		this.route.params.subscribe((params: Params) => {
			this.sub_org_id = params["sub_org_id"];
		});
	}

	ngOnInit() {
		this.getOrgData();
		this.initForm();
		this.getCountries();
		this.getJobProfile();
		this.getDcaCs();
		this.getFileGST();
	}

	initForm() {
		this.addContactPersonForm = new FormGroup({
			person_name: new FormControl(null, Validators.required),
			designation_id: new FormControl(null),
			country_code: new FormControl(null),
			area_code: new FormControl(null),
			contact_no: new FormControl(null),
			check_phone_finance: new FormControl(false),
			check_phone_logistics: new FormControl(false),
			check_phone_sales: new FormControl(false),
			email: new FormControl(null),
			check_email_finance: new FormControl(false),
			check_email_logistics: new FormControl(false),
			check_email_sales: new FormControl(false)
		});
		this.editContactPersonForm = new FormGroup({
			cont_id: new FormControl(null, Validators.required),
			person_name: new FormControl(null, Validators.required),
			designation_id: new FormControl(null)
		});
		this.contactNumberForm = new FormGroup({
			id: new FormControl(null),
			cont_id: new FormControl(null, Validators.required),
			country_code: new FormControl(null),
			area_code: new FormControl(null),
			contact_no: new FormControl(null, Validators.required),
			check_phone_finance: new FormControl(false),
			check_phone_logistics: new FormControl(false),
			check_phone_sales: new FormControl(false),
			check_phone_offers:  new FormControl(false)
		});
		this.contactEmailForm = new FormGroup({
			id: new FormControl(null),
			contact_id: new FormControl(null, Validators.required),
			email: new FormControl(null, Validators.required),
			check_email_finance: new FormControl(false),
			check_email_logistics: new FormControl(false),
			check_email_sales: new FormControl(false),
			check_email_offers: new FormControl(false)
		});
		this.bankForm = new FormGroup({
			bank_id: new FormControl(null),
			bank_name: new FormControl(null, Validators.required),
			bank_address: new FormControl(null, Validators.required),
			account_no: new FormControl(null),
			account_name: new FormControl(null),
			branch_name: new FormControl(null),
			swift_code: new FormControl(null),
			ifsc_code: new FormControl(null)
		});
		this.dcaCsForm = new FormGroup({
			dca_cs: new FormControl(null),
		});

		this.fileUploadForm = new FormGroup({
			gst_certificate: new FormControl(null),
			chq_scan_copy: new FormControl(null),
			logo: new FormControl(null)
		})
	}

	getOrgData() {
		this.crudServices.getOne(SubOrg.get_one_sub_org, {
			sub_org_id: this.sub_org_id
		}).subscribe(res => {
			if (res != null && res['length'] > 0) {
				this.org_data = res[0];
				this.org_data.company = (res[0]["product_type"] == 1) ? "PVC" : "PE & PP";
				this.org_data.sales_acc_holder = (res[0]["salesAccHolder"] != null) ? (res[0]["salesAccHolder"].first_name + ' ' + res[0]["salesAccHolder"].last_name) : null;
				this.org_data.puchase_acc_holder = (res[0]["purchaseAccHolder"] != null) ? (res[0]["purchaseAccHolder"].first_name + ' ' + res[0]["purchaseAccHolder"].last_name) : null;
				this.org_data.category_list = (res[0]["categories"] != null) ? this.slashSplit(res[0]["categories"]) : [];
				this.org_data.product_list = (res[0]["products"] != null) ? this.slashSplit(res[0]["products"]) : [];
				this.org_data.documents = (res[0]["intro_mail_scan_copy"] != null) ? JSON.parse(res[0]["intro_mail_scan_copy"]) : null;
				this.getContactsCols();
				this.getBankCols();
				this.getDcaCols();
			}
		});
	}

	getCountries() {
		this.crudServices.getAll<any>(CountryMaster.getAll).subscribe(res => {
			this.countryList = res.data.map((i) => { i.name = i.name + ' (+' + i.phonecode + ' )'; return i; });
		});
	}

	getJobProfile() {
		this.crudServices.getAll<any>(JobProfileMaster.getAll).subscribe(res => {
			if (res) {
				this.job_list = res.data;
			}
		});
	}

	getDcaCs() {
		this.crudServices.getOne<any>(SubOrg.getDCACSList, {
			org_cat_id: [117, 118]
		}).subscribe(res => {
			if (res.length > 0) {
				this.dca_cs_list = res;
			}
		});
	}

	getFileGST() {
		this.crudServices.getOne<any>(SubOrg.getsubOrgFile, {
			sub_org_id: this.sub_org_id
		}).subscribe(res => {
			if (res.data.length > 0) {
				this.gst_logo_list = res.data;
			}
		});
	}

	getContactsCols() {
		this.contact_cols = [
			{ field: "cont_id", header: "#", sort: true, type: null },
			{ field: "person_name", header: "Person Name", sort: true, type: null },
			{ field: "designation", header: "Designation No", sort: true, type: null },
			{ field: "phone", header: "Phone", sort: true, type: null },
			{ field: "email", header: "Email", sort: true, type: null },
		];
		this.contact_filter = ['person_name'];
		this.getContactData();
	}

	getContactData() {
		this.isLoadingContact = true;
		this.crudServices.getOne(MainContact.get_org_contact_person_by_suborg, {
			sub_org_id: this.sub_org_id
		}).subscribe(res => {
			this.isLoadingContact = false;
			if (res != null && res['length'] > 0) {
				for (let i = 0; i < res['length']; i++) {
					res[i].designation = (res[i].job_profile_master != null) ? res[i].job_profile_master.profile_name : null;

					if (res[i].org_contact_numbers.length > 0) {
						res[i].org_contact_numbers.forEach(element => {
							if (element.contact_type == "Mobile") {
								element.phone_no = element.country_code + "-" + element.contact_no;
							} else if (element.contact_type == "Landline") {
								element.phone_no = element.area_code + "-" + element.contact_no;
							} else {
								element.phone_no = element.contact_no;
							}
						});
						res[i].phone = res[i].org_contact_numbers;
					}

					if (res[i].org_contact_emails.length > 0) {
						res[i].org_contact_emails.forEach(element => {
							if (element.contact_type == "Mobile") {
								element.phone_no = element.country_code + "-" + element.contact_no;
							} else if (element.contact_type == "Landline") {
								element.phone_no = element.area_code + "-" + element.contact_no;
							} else {
								element.phone_no = element.contact_no;
							}
						});
						res[i].email = res[i].org_contact_emails;
					}
				}
				this.contact_data = res;				
				if (this.table1 != null && this.table1 != undefined) {
					this.table1.reset();
				}
			}
		});
	}

	getBankCols() {
		this.bank_cols = [
			{ field: "bank_id", header: "#", sort: true, type: null },
			{ field: "bank_name", header: "Bank Name", sort: true, type: null },
			{ field: "account_no", header: "Account No", sort: true, type: null },
			{ field: "ifsc_code", header: "IFSC Code", sort: true, type: null },
			{ field: "swift_code", header: "Swift Code", sort: true, type: null },
			{ field: "action", header: "Action", sort: false, type: "Action" }
		];
		this.bank_filter = ['bank_name'];
		this.getBankData();
	}

	getBankData() {
		this.bank_data = [];
		this.isLoadingBank = true;
		this.crudServices.getOne(subOrgRespectiveBank.getPerticularOrgBank, {
			sub_org_id: this.sub_org_id
		}).subscribe(res => {
			this.isLoadingBank = false;
			if (res != null && res['length'] > 0) {
				this.bank_data = res;
				if (this.table2 != null && this.table2 != undefined) {
					this.table2.reset();
				}
			}
		});
	}

	getDcaCols() {
		this.dca_cols = [
			{ field: "sub_org_name", header: "DCA/CS", sort: true, type: null },
			{ field: "org_address", header: "Address", sort: true, type: null },
			{ field: "action", header: "Action", sort: false, type: "Action" }
		];
		this.dca_filter = ['sub_org_name', 'org_address'];
		this.getDcaData();
	}

	getDcaData() {
		this.dca_data = [];
		this.isLoadingDca = true;
		this.crudServices.getOne(SubOrg.getDCACSAgainstSuborg, {
			sub_org_id: this.sub_org_id
		}).subscribe(res => {
			this.isLoadingDca = false;
			if (res != null && res['length'] > 0) {
				let arr = [];
				for (let i = 0; i < res['length']; i++) {
					res[i].dca_cs_org.id = res[i].id;
					arr.push(res[i].dca_cs_org);
				}
				this.dca_data = arr;
				if (this.table3 != null && this.table3 != undefined) {
					this.table3.reset();
				}
			}
		});
	}

	onAction(row, item, type) {
		this.type = type;

		if (type == "Add_Contact") {
			this.addContactPersonForm.reset();
			this.addContactPersonModal.show();
		}
		if (type == "Edit_Contact") {
			this.editContactPersonForm.reset();
			this.editContactPersonForm.patchValue({
				cont_id: row.cont_id,
				person_name: row.person_name,
				designation_id: row.designation_id
			});
			this.editContactPersonModal.show();
		}
		if (type == "Add_Phone") {
			this.contactNumberForm.reset();
			this.contactNumberForm.patchValue({
				cont_id: row.cont_id
			});
			this.updateContactNumberModal.show();
		}
		if (type == "Edit_Phone") {			
			this.contactNumberForm.reset();
			this.contactNumberForm.patchValue({
				id: item.id,
				cont_id: item.cont_id,
				country_code: Number(item.country_code),
				area_code: item.area_code,
				contact_no: item.contact_no,
				check_phone_finance: (item.finance == 1) ? true : false,
				check_phone_logistics: (item.logistics == 1) ? true : false,
				check_phone_sales: (item.sales == 1) ? true : false,
				check_phone_offers: (item.offers == 1) ? true : false,
			});
			if (item.area_code != null) {
				this.disableCheckOptions = true;
			}
			this.updateContactNumberModal.show();
		}
		if (type == "Delete_Phone") {
			this.crudServices.deleteData(SubOrg.deleteContactNumber, {
				id: item.id
			}).subscribe(res => {
				this.toasterService.pop('success', "Success", "Contact Number Deleted Successfully");
				this.getContactData();
			});
		}
		if (type == "Add_Email") {
			this.contactEmailForm.reset();
			this.contactEmailForm.patchValue({
				contact_id: row.cont_id
			});
			this.updateContactEmailModal.show();
		}
		if (type == "Edit_Email") {
			this.contactEmailForm.reset();
			this.contactEmailForm.patchValue({
				id: item.id,
				contact_id: item.contact_id,
				email: item.email_id,
				check_email_finance: (item.finance == 1) ? true : false,
				check_email_logistics: (item.logistics == 1) ? true : false,
				check_email_sales: (item.sales == 1) ? true : false,
				check_email_offers: (item.offers == 1) ? true : false,
			});
			this.updateContactEmailModal.show();
		}
		if (type == "Delete_Email") {
			this.crudServices.deleteData(SubOrg.deleteContactEmail, {
				id: item.id
			}).subscribe(res => {
				this.toasterService.pop('success', "Success", "Email ID Deleted Successfully");
				this.getContactData();
			});
		}
		if (type == "Add_Bank") {
			this.bankForm.reset();
			this.updateBankModal.show();
		}
		if (type == "Edit_Bank") {
			this.bankForm.reset();
			this.bankForm.patchValue({
				bank_id: row.bank_id,
				bank_name: row.bank_name,
				bank_address: row.bank_address,
				account_no: row.account_no,
				account_name: row.account_name,
				branch_name: row.branch_name,
				swift_code: row.swift_code,
				ifsc_code: row.ifsc_code
			});
			this.updateBankModal.show();
		}
		if (type == "Delete_Bank") {
			this.crudServices.deleteData(SubOrg.deleteOrgBankNew, {
				bank_id: row.bank_id
			}).subscribe(res => {
				this.toasterService.pop('success', "Success", "Bank Deleted Successfully");
				this.getBankData();
			});
		}
		if (type == "Delete_DCA") {
			this.crudServices.deleteData(SubOrg.deleteDcaCsLink, {
				id: row.id
			}).subscribe(res => {
				this.toasterService.pop('success', "Success", "Deleted Successfully");
				this.getDcaCols();
			});
		}
		if (type == "download") {
		}
	}

	submitAddContactPersonForm() {
		let contact_person = {
			person_name: this.addContactPersonForm.value.person_name,
			designation_id: this.addContactPersonForm.value.designation_id,
			sub_org_id: this.sub_org_id
		};

		let contact_email = null;
		let contact_number = null;

		if (this.addContactPersonForm.value.contact_no != null) {
			contact_number = {
				contact_no: this.addContactPersonForm.value.contact_no,
				country_code: this.addContactPersonForm.value.country_code,
				area_code: this.addContactPersonForm.value.area_code,
				contact_type: (this.addContactPersonForm.value.area_code != null && this.addContactPersonForm.value.area_code != "") ? "Landline" : "Mobile",
				sub_org_id: this.sub_org_id,
				finance: (this.addContactPersonForm.value.check_phone_finance) ? 1 : 0,
				logistics: (this.addContactPersonForm.value.check_phone_logistics) ? 1 : 0,
				sales: (this.addContactPersonForm.value.check_phone_sales) ? 1 : 0
			};
		}

		if (this.addContactPersonForm.value.email != null) {
			contact_email = {
				email_id: this.addContactPersonForm.value.email,
				sub_org_id: this.sub_org_id,
				finance: (this.addContactPersonForm.value.check_email_finance) ? 1 : 0,
				logistics: (this.addContactPersonForm.value.check_email_logistics) ? 1 : 0,
				sales: (this.addContactPersonForm.value.check_email_sales) ? 1 : 0
			};
		}

		this.crudServices.addData(SubOrg.addContactPerson, {
			sub_org_id: this.sub_org_id,
			contact_person: contact_person,
			contact_number: contact_number,
			contact_email: contact_email,
			type: this.type
		}).subscribe(res => {
			this.toasterService.pop('success', "Success", "New Contact Person Added Successfully");
			this.closeModal();
			this.getContactData();
		});
	}

	submitEditContactPersonForm() {
		this.crudServices.updateData(SubOrg.updateContactPersonNew, {
			person_name: this.editContactPersonForm.value.person_name,
			designation_id: this.editContactPersonForm.value.designation_id,
			cont_id: this.editContactPersonForm.value.cont_id,
		}).subscribe(res => {
			this.closeModal();
			this.toasterService.pop('success', "Success", "Contact Person Updated Successfully");
			this.getContactData();
		});
	}

	
	onChangeSubOrgFiles(e) {
		let files = <Array<File>>e.target.files;
		//  this.fileData.append("sub_org_file", files[0], files[0]['name']);
		for (let i = 0; i < files.length; i++) {
			this.fileData.append("sub_org_file", files[i], files[i]['name']);
		}

	}

	fileUploadFormSubmit() {
		this.crudServices.fileUpload(FileUpload.upload, this.fileData).subscribe(res => {
			this.crudServices.updateData<any>(SubOrg.subOrgFileUpload, {
				sub_org_id: this.sub_org_id,
				gst_certificate: res.uploads['sub_org_file'][0] ?  res.uploads['sub_org_file'][0].location : '',
				chq_scan_copy: res.uploads['sub_org_file'][1]?  res.uploads['sub_org_file'][1].location :  '',
				logo: res.uploads['sub_org_file'][2] ?  res.uploads['sub_org_file'][2].location : ''
			}
			).subscribe(res => {
				if (res.code === '100') {
					this.fileupload = res;
					this.getFileGST();
					this.toasterService.pop('success', 'Success', 'Files uploaded Successfully...');				
				}
			})
		})
	}

	submitContactNumberForm() {
		let contact_number = {
			cont_id: Number(this.contactNumberForm.value.cont_id),
			contact_no: this.contactNumberForm.value.contact_no,
			country_code: this.contactNumberForm.value.country_code,
			area_code: this.contactNumberForm.value.area_code,
			contact_type: (this.contactNumberForm.value.area_code != null && this.contactNumberForm.value.area_code != "") ? "Landline" : "Mobile",
			sub_org_id: Number(this.sub_org_id),
			finance: (this.contactNumberForm.value.check_phone_finance) ? 1 : 0,
			logistics: (this.contactNumberForm.value.check_phone_logistics) ? 1 : 0,
			sales: (this.contactNumberForm.value.check_phone_sales) ? 1 : 0,
			offers: (this.contactNumberForm.value.check_phone_offers) ? 1 : 0,
		};
		let id = Number(this.contactNumberForm.value.id);
		this.crudServices.addData(SubOrg.updateContactNumber, {
			id: id,
			contact_number: contact_number,
			type: this.type
		}).subscribe(res => {
			this.toasterService.pop('success', "Success", "Contact Updated Successfully");
			this.closeModal();
			this.getContactData();
		});
	}

	submitContactEmailForm() {
		let contact_email = {
			contact_id: Number(this.contactEmailForm.value.contact_id),
			email_id: this.contactEmailForm.value.email,
			sub_org_id: Number(this.sub_org_id),
			finance: (this.contactEmailForm.value.check_email_finance) ? 1 : 0,
			logistics: (this.contactEmailForm.value.check_email_logistics) ? 1 : 0,
			sales: (this.contactEmailForm.value.check_email_sales) ? 1 : 0,
			offers: (this.contactEmailForm.value.check_email_offers) ? 1 : 0
		};
		let id = Number(this.contactEmailForm.value.id);
		this.crudServices.addData(SubOrg.updateContactEmail, {
			id: id,
			contact_email: contact_email,
			type: this.type
		}).subscribe(res => {
			this.toasterService.pop('success', "Success", "Contact Updated Successfully");
			this.closeModal();
			this.getContactData();
		});
	}

	submitBankForm() {
		let org_bank = {
			bank_name: this.bankForm.value.bank_name,
			bank_address: this.bankForm.value.bank_address,
			account_no: this.bankForm.value.account_no,
			account_name: this.bankForm.value.account_name,
			branch_name: this.bankForm.value.branch_name,
			swift_code: this.bankForm.value.swift_code,
			ifsc_code: this.bankForm.value.ifsc_code,
			sub_org_id: Number(this.sub_org_id)
		};
		let bank_id = Number(this.bankForm.value.bank_id);
		this.crudServices.addData(SubOrg.updateOrgBankNew, {
			bank_id: bank_id,
			org_bank: org_bank,
			type: this.type
		}).subscribe(res => {
			this.toasterService.pop('success', "Success", "Contact Updated Successfully");
			this.closeModal();
			this.getBankData();
		});
	}

	submitDcaCsForm() {
		let dcacs_sub_org_id = this.dcaCsForm.value.dca_cs;
		this.crudServices.addData(SubOrg.addDcaCsAgainstSuborg, {
			dca_cs_sub_org_id: dcacs_sub_org_id,
			petro_manufacturer_sub_org_id: this.sub_org_id
		}).subscribe(res => {
			this.dcaCsForm.reset();
			this.getDcaCols();
		});
	}

	slashSplit(str) {
		return str.split("/").slice(0, -1);
	}

	disableChecks(val) {
		if (val) {
			this.disableCheckOptions = true;
		} else {
			this.disableCheckOptions = false;
		}
	}



	copyData(item) {
		this.copiedContact = item;
		this.copy_contacts_cols = [
			{ field: "sub_org_id", header: "ID", sort: true, type: null },
			{ field: "sub_org_name", header: "Name", sort: true, type: null },
			{ field: "org_address", header: "Address", sort: true, type: null },
		];
		this.copy_contacts_filter = ['sub_org_id', 'sub_org_name', 'org_address'];
		this.copyContactsModal.show();
	}

	onChange(e, type) {
		if (type == "Product_Type") {
			this.isLoadingCopy = true;
			this.copy_contacts_data = [];
			this.crudServices.getOne<any>(SubOrg.getDivisionData, {
				type: e
			}).subscribe(res => {
				this.isLoadingCopy = false;
				if (res.code == '100') {
					if (res.data.length > 0) {
						this.copy_contacts_data = res.data;
					}
				}
			});
		}
	}

	onCheckOrg(event) {
		// const checked = event.target.checked;
		// if (checked) {
		// 	this.Follow_list.push(Id);
		// } else {
		// 	const index = this.Follow_list.findIndex(list => list.user_id == Id);
		// 	this.Follow_list.splice(index, 1);
		// }
	}

	onSubmitCopyContact() {
		let copy_arr = [];
		if (this.checked_org.length > 0) {
			this.checked_org.forEach(element => {
				let sub_org_id = element.sub_org_id;
				let main_org_id = element.org_id;

				let org_contact_person = {
					person_name: this.copiedContact.person_name,
					designation_id: this.copiedContact.designation_id,
					email: null,
					sub_org_id: sub_org_id,
					main_org_id: main_org_id,
					deleted: this.copiedContact.deleted,
					is_default_person: this.copiedContact.is_default_person
				};

				let org_contact_numbers = [];
				if (this.copiedContact.org_contact_numbers.length > 0) {
					this.copiedContact.org_contact_numbers.forEach(element_number => {
						let obj = {
							contact_no: element_number.contact_no,
							sales_order_sms: element_number.sales_order_sms,
							dispatch_sms: element_number.dispatch_sms,
							reminder_sms: element_number.reminder_sms,
							event_sms: element_number.event_sms,
							whatsapp_flag: element_number.whatsapp_flag,
							country_code: element_number.country_code,
							area_code: element_number.area_code,
							deleted: element_number.deleted,
							sub_org_id: sub_org_id,
							main_org_id: main_org_id,
							finance: element_number.finance,
							logistics: element_number.logistics,
							sales: element_number.sales,
							phone_no: element_number.phone_no,
						};
						org_contact_numbers.push(obj);
					});
				};

				let org_contact_email = [];
				if (this.copiedContact.org_contact_emails.length > 0) {
					this.copiedContact.org_contact_emails.forEach(element_email => {
						let obj = {
							email_id: element_email.email_id,
							sub_org_id: sub_org_id,
							main_org_id: main_org_id,
							finance: element_email.finance,
							logistics: element_email.logistics,
							sales: element_email.sales,
							deleted: element_email.deleted
						};
						org_contact_email.push(obj);
					});
				}
				let obj = {
					org_contact_person: org_contact_person,
					org_contact_numbers: org_contact_numbers,
					org_contact_email: org_contact_email
				};
				copy_arr.push(obj);
			});
			let body = {
				data: copy_arr
			};
			this.crudServices.addData<any>(SubOrg.copy_org_contact, body).subscribe(res => {
				this.toasterService.pop('success', "Success", "Contact Copied Successfully");
				this.closeModal();
			});
		}
	}

	closeModal() {
		this.copy_contacts_data = [];
		this.copiedContact = null;
		this.addContactPersonForm.reset();
		this.editContactPersonForm.reset();
		this.contactNumberForm.reset();
		this.contactEmailForm.reset();
		this.bankForm.reset();
		this.addContactPersonModal.hide();
		this.editContactPersonModal.hide();
		this.updateContactNumberModal.hide();
		this.updateContactEmailModal.hide();
		this.updateBankModal.hide();
		this.copyContactsModal.hide();
	}
}
