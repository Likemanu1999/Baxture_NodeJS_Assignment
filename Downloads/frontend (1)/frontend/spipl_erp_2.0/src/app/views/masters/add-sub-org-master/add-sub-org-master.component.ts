import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap";
import { Table } from "primeng/table";
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { Calculations } from "../../../shared/calculations/calculations";
import {
	MainOrg,
	SalesOrders,
	Consignments,
	PercentageDetails,
	SubOrg,
	GodownMaster,
	LiveInventory,
	GradeMaster,
	orgContactPerson,
	MainContact,
	CountryStateCityMaster,
	ValueStore,
	Notifications,
	UsersNotification,
	StaffMemberMaster,
	LocalPurchase,
	FileUpload,
	EmailTemplateMaster,
	SpiplBankMaster
} from '../../../shared/apis-path/apis-path';
import { roundAmount, roundQuantity, staticValues } from '../../../shared/common-service/common-service';
import { AmountToWordPipe } from '../../../shared/amount-to-word/amount-to-word.pipe';
import { MessagingService } from '../../../service/messaging.service';
import { UserDetails } from '../../login/UserDetails.model';
import { LoginService } from '../../login/login.service';
import { ExportService } from '../../../shared/export-service/export-service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import * as moment from "moment";
import { forkJoin } from "rxjs";
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-add-sub-org-master',
	templateUrl: './add-sub-org-master.component.html',
	styleUrls: ['./add-sub-org-master.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		CrudServices,
		ToasterService,
		PermissionService,
		ExportService,
		Calculations,
		CurrencyPipe,
		AmountToWordPipe
	]
})

export class AddSubOrgMasterComponent implements OnInit {

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 10000
	});

	datePickerConfig: any = staticValues.datePickerConfig;
	companyList: any = staticValues.companies;
	editMode: boolean = false;

	user: UserDetails;
	role_id: any = null;
	links: string[] = [];

	page_title: any = "Add New Sub-Organisation";
	id: any = null;
	subOrgForm: FormGroup;
	mainOrgList: any = [];
	fileData: FormData = new FormData();
	company_id: any = null;

	constructor(
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private loginService: LoginService,
		private permissionService: PermissionService,
		private crudServices: CrudServices,
		private exportService: ExportService,
		private calculations: Calculations,
		private currencyPipe: CurrencyPipe,
		private amountToWord: AmountToWordPipe,
		private messagingService: MessagingService
	) {
		this.toasterService = toasterService;
		this.user = this.loginService.getUserDetails();
		this.role_id = this.user.userDet[0].role_id;
		this.company_id = this.user.userDet[0].company_id;
		this.links = this.user.links;
		const perms = this.permissionService.getPermission();

		this.route.params.subscribe((params: Params) => {
			if (params["id"] != null) {
				this.id = params["id"];
				this.editMode = true;
				this.page_title = "Edit Sub-Organisation";
			}
		});
	}

	ngOnInit() {
		this.initForm();
	}

	initForm() {
		this.subOrgForm = new FormGroup({
			org_id: new FormControl(null, Validators.required),
			org_unit: new FormControl(null),
			org_address: new FormControl(null),
			sub_org_name: new FormControl(null, Validators.required),
			country_id: new FormControl(null),
			state_id: new FormControl(null),
			city_id: new FormControl(null),
			location_village: new FormControl(null),
			pin_code: new FormControl(null),
			pan_no: new FormControl(null),
			tan_no: new FormControl(null),
			iec: new FormControl(null),
			gst_no: new FormControl(null),
			virtual_acc_no: new FormControl(null),
			product_id: new FormControl(null),
			category_id: new FormControl(null),
			product_tag_id: new FormControl(null),
			is_advance_payment: new FormControl(null),
			payment_term: new FormControl(null),
			chq_status: new FormControl(null),
			chq_no: new FormControl(null),
			chq_amount: new FormControl(null),
			base_limit: new FormControl(null),
			adhoc_limit: new FormControl(null),
			overdue_limit: new FormControl(null),
			sales_acc_holder: new FormControl(null),
			purchase_acc_holder: new FormControl(null),
			note: new FormControl(null),
			chq_scan_copy: new FormControl(null),
			intro_mail_scan_copy: new FormControl(null),
			chq_copy_hidden: new FormControl(null),
			mail_copy_hidden: new FormControl(null),
			trader_manufacture: new FormControl(null),
			product_type: new FormControl(null),
			transit_days: new FormControl(null),
			bcd_lic_percent: new FormControl(null)
		});
	}

	onSubmit() {
		// 
	}

	onChangeValue(value, type) {
		// 
	}

}
