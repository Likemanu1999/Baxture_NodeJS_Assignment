import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { CountryMaster, CountryStateCityMaster } from "../../../shared/apis-path/apis-path";


@Component({
	selector: 'app-country-master',
	templateUrl: './country-master.component.html',
	styleUrls: ['./country-master.component.scss'],
	providers: [CrudServices, ToasterService, PermissionService, LoginService]
})

export class CountryMasterComponent implements OnInit {

	countryForm: FormGroup;
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
		private route: ActivatedRoute,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
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
		this.crudServices.getAll<any>(CountryStateCityMaster.getAllCountries).subscribe(res => {
			this.data = res.data;
			this.isLoading = false;
		});
	}

	initForms() {
		this.countryForm = new FormGroup({
			country_name: new FormControl(null, Validators.required),
			country_code: new FormControl(null, Validators.required),
			phone_code: new FormControl(null, Validators.required)
		});
	}

	onSubmit() {
		let body = {
			data: {
				name: this.countryForm.value.country_name,
				sortname: this.countryForm.value.country_code,
				phonecode: parseInt(this.countryForm.value.phone_code),
			},
			message: "New Country Added"
		};
		this.crudServices.addData<any>(CountryMaster.add, body).subscribe(res => {
			this.toasterService.pop(res.message, res.message, res.data);
			this.loadData();
		});
	}

	onClick(id) {
		this.router.navigate(['masters/state-master', id]);
	}

}
