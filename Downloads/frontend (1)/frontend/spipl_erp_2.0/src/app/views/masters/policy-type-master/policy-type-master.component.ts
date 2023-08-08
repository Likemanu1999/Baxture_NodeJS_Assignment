import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Router, ActivatedRoute } from '@angular/router';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { PolicyTypeMaster } from "../../../shared/apis-path/apis-path";

@Component({
	selector: 'app-policy-type-master',
	templateUrl: './policy-type-master.component.html',
	styleUrls: ['./policy-type-master.component.scss'],
	providers: [CrudServices, ToasterService, PermissionService, LoginService]
})

export class PolicyTypeMasterComponent implements OnInit {

	policyForm: FormGroup;
	data: any = [];

	isLoading: boolean = false;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	filterQuery: any = '';

	private toasterService: ToasterService;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	constructor(private fb: FormBuilder,
		toasterService: ToasterService,
		private router: Router,
		private permissionService: PermissionService,
		private crudServices: CrudServices
	) {
		this.toasterService = toasterService;
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		this.loadData();
		this.initForms();
	}

	loadData() {
		this.isLoading = true;
		this.crudServices.getAll<any>(PolicyTypeMaster.getAll).subscribe(res => {
			this.isLoading = false;
			if (res.code == '100') {
				if (res.data.length > 0) {
					this.data = res.data;
				}
			}
		});
	}

	initForms() {
		this.policyForm = new FormGroup({
			policy_type: new FormControl(null, Validators.required)
		});
	}

	onSubmit() {
		let body = {
			data: {
				policy_type: this.policyForm.value.policy_type
			},
			message: "New Policy Type Added"
		};
		this.crudServices.addData<any>(PolicyTypeMaster.add, body).subscribe(res => {
			this.toasterService.pop(res.message, res.message, res.data);
			this.policyForm.reset();
			this.loadData();
		});
	}

}
