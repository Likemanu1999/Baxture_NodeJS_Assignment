import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Params, ActivatedRoute, Router } from "@angular/router";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { CountryStateCityMaster, StateMaster } from "../../../shared/apis-path/apis-path";
import * as XLSX from 'xlsx';
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
	selector: 'app-state-master',
	templateUrl: './state-master.component.html',
	styleUrls: ['./state-master.component.scss'],
	providers: [CrudServices, ToasterService, PermissionService, LoginService]
})

export class StateMasterComponent implements OnInit {

	stateForm: FormGroup;
	fileForm: FormGroup;
	public filterQuery = '';
	data: any = [];
	statesList: any = [];
	country_id: any = null;
	submitted = false;
	error: any;
	isLoading: boolean = false;
	zone_type: any = staticValues.zone_type;


	private toasterService: ToasterService;

	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});
	state_id: any;
	zoneVisible: boolean = false;

	constructor(private fb: FormBuilder,
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private crudServices: CrudServices
	) {
		this.toasterService = toasterService;
		this.route.params.subscribe((params: Params) => {
			this.country_id = +params["id"];
		});


	}

	ngOnInit() {
		if (this.country_id == 101) {
			this.zoneVisible = true
		}
		this.loadData();
		this.initForms();
	}

	loadData() {
		this.isLoading = true;
		this.crudServices.getOne<any>(CountryStateCityMaster.getStates, {
			country_id: this.country_id
		}).subscribe(res => {
			this.data = res.data;
			this.isLoading = false;
		});
	}

	initForms() {
		this.stateForm = new FormGroup({
			state_name: new FormControl(null, Validators.required),
			zone_id: new FormControl(null)
		});
		this.fileForm = new FormGroup({
			file: new FormControl(null, Validators.required)
		});
	}

	onSubmit() {
		this.submitted = true;

		if (this.state_id > 1) {
			let body = {
				type: "One",
				data: {
					name: this.stateForm.value.state_name,
					zone_id: this.stateForm.value.zone_id,
				},
				message: " State Updated",
				id: this.state_id
			};
			this.crudServices.updateData<any>(StateMaster.update, body).subscribe(res => {
				this.toasterService.pop(res.message, res.message, res.data);
				this.stateForm.reset();
				this.state_id = 0;
				this.loadData();
			});

		} else {
			let body = {
				type: "One",
				data: {
					name: this.stateForm.value.state_name,
					zone_id: this.stateForm.value.zone_id,
					country_id: parseInt(this.country_id)
				},
				message: "New State Added"
			};
			this.crudServices.addData<any>(StateMaster.add, body).subscribe(res => {
				this.toasterService.pop(res.message, res.message, res.data);
				this.loadData();
			});
		}

	}

	editState(item) {
		this.state_id = item.id;
		this.stateForm.patchValue({ state_name: item.name, zone_id: item.zone_id })
	}

	onReset() {

	}

	onClick(id) {
		this.router.navigate(['masters/city-master', id]);
	}

	onFileSelect(event) {
		let workBook = null;
		let jsonData = null;
		const reader = new FileReader();
		reader.onload = (event) => {
			const data = reader.result;
			workBook = XLSX.read(data, { type: 'binary' });
			jsonData = workBook.SheetNames.reduce((initial, name) => {
				const sheet = workBook.Sheets[name];
				initial[name] = XLSX.utils.sheet_to_json(sheet);
				return initial;
			}, {});
			this.statesList = jsonData[Object.keys(jsonData)[0]];
		};
		reader.readAsBinaryString(event.target.files[0]);
	}

	onFileSubmit() {
		let states = [];
		this.statesList.forEach(element => {
			let obj = {
				name: element.state_name,
				country_id: parseInt(this.country_id)
			}
			states.push(obj);
		});
		if (states.length == this.statesList.length) {
			let body = {
				type: "Bulk",
				data: states,
				message: "New States Added"
			};
			this.crudServices.addData<any>(StateMaster.add, body).subscribe(res => {
				this.toasterService.pop(res.message, res.message, res.data);
				this.loadData();
			});
		}
	}

	onFileReset() {
		this.statesList = [];
	}


}
