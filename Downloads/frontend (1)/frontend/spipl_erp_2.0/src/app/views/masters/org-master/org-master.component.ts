import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Router, ActivatedRoute } from '@angular/router';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { MainOrg } from "../../../shared/apis-path/apis-path";
import { ExportService } from '../../../shared/export-service/export-service';
import { InputSwitch } from 'primeng/inputswitch';
import { ModalDirective } from 'ngx-bootstrap';
import { staticValues } from '../../../shared/common-service/common-service';
@Component({
	selector: 'app-org-master',
	templateUrl: './org-master.component.html',
	styleUrls: ['./org-master.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, LoginService, ExportService],
})

export class OrgMasterComponent implements OnInit {

	@ViewChild("dt", { static: false }) inputSwitch: InputSwitch;
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;

	user: UserDetails;
	links: string[] = [];
	add_sub_org: boolean = false;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	role_id: any = null;
	company_id: any = null;
	isLoading = false;
	orgForm: FormGroup;
	org_id: number;
	tab: any = {
		title: "Main_Org_List",
		cols: [
			{ field: "org_id", header: "ID", permission: true },

			{ field: "org_name", header: "Organization Name", permission: true },
			{ field: "company_name", header: "Company Name", permission: true },
			// { field: "website", header: "Website", permission: true },

		],
		filter: [
			'org_name',
			'company_name'
			// 'website'
		],
		data: []
	};

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	private toasterService: ToasterService;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	petrochemical_manu: any = 0;

	gradeList = [];

	product_type_list: any = staticValues.product_type_list;
	show_both_company: boolean;
	selectedTabIndex: number;


	constructor(private fb: FormBuilder,
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private crudServices: CrudServices,
		private exportService: ExportService
	) {
		this.toasterService = toasterService;
		const perms = this.permissionService.getPermission();
		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.add_sub_org = (this.links.indexOf('add sub org') > -1);
		this.show_both_company = (this.links.indexOf('org both company list') > -1);
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];

		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;

		this.orgForm = this.fb.group({
			org_name: new FormControl(null, [Validators.required]),
			website: new FormControl(null),
			person_name: new FormControl(null),
			contact_no: new FormControl(null),
			email_id: new FormControl(null),
			petrochemical_manufacture: new FormControl(null),
			product_type: new FormControl(0),
		});
	}

	ngOnInit() {
		this.selectedTabIndex = this.company_id == 1 ? 0 : 1;
		this.getOrg();
		//this.copyAllOrgData();
	}

	getOrg() {
		this.isLoading = true;
		this.crudServices.getOne<any>(MainOrg.getCompanyOrg, {
			company_id: this.company_id
		}).subscribe(res => {
			this.tab.data = res.data;
			this.tab.data.map(item => {
				if (item.company_id == 1) {
					item.company_name = 'PVC';
				} else if (item.company_id == 2) {
					item.company_name = 'PE & PP'
				}
				else if (item.company_id == 3) {
					item.company_name = 'Surisha'
				}
			});
			this.isLoading = false;
		});
	}

	copyAllOrgData() {
		this.crudServices.getAll<any>(MainOrg.copyAllOrgData).subscribe(res => {
			if (res === null) {
				this.toasterService.pop('error', 'Error', 'Something Went Wrong');
			} else {
				this.toasterService.pop(res.message, 'Success', res.data);
			}
		});
	}

	onReset() {
		this.org_id = null;
		this.orgForm.reset();
	}

	onSubmit() {
		let body = {
			main_org_data: {
				org_name: this.orgForm.value.org_name,
				website: this.orgForm.value.website,
				petrochemical_manufacture: this.petrochemical_manu,
				company_id: this.orgForm.value.product_type ? this.orgForm.value.product_type : this.company_id,
			}
		};
		if (this.orgForm.value.person_name != null) {
			body['org_contact_person'] = {
				person_name: this.orgForm.value.person_name
			};
		}
		if (this.orgForm.value.contact_no != null) {
			body['org_contact_number'] = {
				contact_no: this.orgForm.value.contact_no,
				country_code: '91',
				area_code: '0',
				contact_type: 'Mobile'
			};
		}
		if (this.orgForm.value.email_id != null) {
			body['org_contact_email'] = {
				email_id: this.orgForm.value.email_id
			};
		}
		if (this.org_id == null) {
			this.crudServices.addData<any>(MainOrg.add, body).subscribe(res => {
				this.toasterService.pop(res.message, 'Success', res.data);
				this.onReset();
				this.getOrg();
			});
		} else {
			body['main_org_id'] = this.org_id;
			this.crudServices.updateData<any>(MainOrg.update, body).subscribe(res => {
				this.toasterService.pop(res.message, 'Success', res.data);
				this.onReset();
				this.getOrg();
			});
		}
	}

	onEdit(id) {
		this.org_id = id;
		this.crudServices.getOne<any>(MainOrg.getOne, {
			org_id: id
		}).subscribe(res => {
			this.orgForm.patchValue({
				org_name: res.data[0].org_name,
				website: res.data[0].website,
				person_name: res.data[0].person_name,
				contact_no: res.data[0].contact_no,
				email_id: res.data[0].email_id,
				petrochemical_manufacture: res.data[0].petrochemical_manufacture,
				product_type: res.data[0].company_id,
			});
		});
	}

	onDelete(id) {
		this.crudServices.getOne<any>(MainOrg.delete, {
			org_id: id
		}).subscribe(res => {
			this.getOrg();
			this.toasterService.pop(res.message, 'Success', res.data);
		});
	}

	onView(org_id) {
		if (org_id != null) {
			this.router.navigate(['masters/sub-org', org_id]);
		}
	}

	exportExcel() {
		let exportData = [];
		this.tab.data.forEach(element => {
			let data = {
				'ID': element.org_id,
				'Organization Name': element.org_name
			};
			exportData.push(data);
		});
		this.exportService.exportExcel(exportData, 'Main Organizations List');
	}


	onChangeManufacture(item) {
		if (item.checked) {
			this.petrochemical_manu = 1;
		} else {
			this.petrochemical_manu = 0;
		}
	}

	onShowGrade(org_id: number) {

		if (org_id != null) {
			this.crudServices.getOne<any>(MainOrg.getGrdaeAgainstManufacture, {
				org_id: org_id
			}).subscribe((response) => {
				if (response === null) {
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					this.gradeList = response;
				}
			});
			this.myModal.show();
		}
	}


	onChangtab(event) {
		const tab = event.tab.textLabel;
		if (tab == 'PVC') {
			this.company_id = 1
			this.getOrg();
		}
		if (tab == 'PE & PP') {
			this.company_id = 2
			this.getOrg();
		}
		if (tab == 'Surisha') {
			this.company_id = 3
			this.getOrg();
		}

		if (tab == 'IT_DB_CLEAN') {
			this.company_id = 4
			this.getOrg();
		}
	}
}

