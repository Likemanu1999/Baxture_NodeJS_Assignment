import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Params, ActivatedRoute, Router } from "@angular/router";
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { CityMaster, CountryStateCityMaster } from "../../../shared/apis-path/apis-path";
import * as XLSX from 'xlsx';

@Component({
	selector: 'app-city-master',
	templateUrl: './city-master.component.html',
	styleUrls: ['./city-master.component.scss'],
	providers: [CrudServices, ToasterService, PermissionService, LoginService]
})
export class CityMasterComponent implements OnInit {

	cityForm: FormGroup;
	fileForm: FormGroup;
	data: any = [];
	citiesList: any = [];
	state_id: any = null;
	isLoading: boolean = false;
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
		private crudServices: CrudServices
	) {
		this.toasterService = toasterService;
		this.route.params.subscribe((params: Params) => {
			this.state_id = +params["id"];
		});
	}

	ngOnInit() {
		this.loadData();
		this.initForms();
	}

	loadData() {
		this.isLoading = true;
		this.crudServices.getOne<any>(CountryStateCityMaster.getCities, {
			state_id: this.state_id
		}).subscribe(res => {
			this.data = res.data;
			this.isLoading = false;
		});
	}

	initForms() {
		this.cityForm = new FormGroup({
			city_name: new FormControl(null, Validators.required)
		});
		this.fileForm = new FormGroup({
			file: new FormControl(null, Validators.required)
		});
	}

	onSubmit() {
	
		let body = {
			type: "One",
			data: {
				name: this.cityForm.value.city_name,
				state_id: this.state_id
			},
			message: "New City Added"
		};
		this.crudServices.addData<any>(CityMaster.add, body).subscribe(res => {
			this.toasterService.pop(res.message, res.message, res.data);
			this.loadData();
		});
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
			this.citiesList = jsonData[Object.keys(jsonData)[0]];
		};
		reader.readAsBinaryString(event.target.files[0]);
	}

	onFileSubmit() {
		let cities = [];
		this.citiesList.forEach(element => {
			let obj = {
				name: element.city_name,
				state_id: this.state_id
			}
			cities.push(obj);
		});
		if(cities.length == this.citiesList.length) {
			let body = {
				type: "Bulk",
				data: cities,
				message: "New Cities Added"
			};
			this.crudServices.addData<any>(CityMaster.add, body).subscribe(res => {
				this.toasterService.pop(res.message, res.message, res.data);
				this.loadData();
			});
		}
	}

	onFileReset() {
		this.citiesList = [];
	}

}
