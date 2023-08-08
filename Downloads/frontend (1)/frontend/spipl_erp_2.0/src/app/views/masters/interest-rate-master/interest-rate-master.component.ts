import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { InterestRateMaster, SubOrg } from '../../../shared/apis-path/apis-path';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-interest-rate-master',
	templateUrl: './interest-rate-master.component.html',
	styleUrls: ['./interest-rate-master.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService, DatePipe],
})
export class InterestRateMasterComponent implements OnInit {
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;
	private toasterService: ToasterService;
	interestForm: FormGroup;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	sub_org = [];
	data = [];
	public filterQuery = '';
	filterArray = [];
	isLoading: boolean;
	id: any;

	constructor(
		private fb: FormBuilder,
		private crudServices: CrudServices,
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private permissionService: PermissionService,
		private datePipe: DatePipe
	) {
		this.toasterService = toasterService;

		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];



		this.crudServices.getAll<any>(SubOrg.get_sub_org).subscribe(response => {

			response = response.filter(item => item.product_type == 2)

			if (response.length) {
				response.map(item => {
					item.sub_org_name = `${item.sub_org_name} - (${item.org_unit_master.unit_type}) - (${item.location_vilage})`
				})
			}

			this.sub_org = response;





		});
	}



	ngOnInit() {
		this.interestForm = new FormGroup({
			from_date: new FormControl(null, Validators.required),
			to_date: new FormControl(null),
			organization_id: new FormControl(null, Validators.required),
			rate: new FormControl(null, Validators.required)
		});

		this.getData();


	}

	getData() {
		this.isLoading = true;
		this.crudServices.getAll<any>(InterestRateMaster.getAllData).subscribe((response) => {
			this.isLoading = false;
			if (response) {
				response.map(item => item.sub_org_name = item.sub_org_master.sub_org_name)
				this.data = response
			}

		});

	}

	onSubmit() {
		const data = {
		  organization_id: this.interestForm.value.organization_id,
		  from_date: this.datePipe.transform(this.interestForm.value.from_date, 'yyyy-MM-dd'),
		  to_date: this.datePipe.transform(this.interestForm.value.to_date, 'yyyy-MM-dd'),
		  rate: this.interestForm.value.rate
		};
	  
		if (this.id != undefined && this.id != null && this.id > 0) {
		  data["id"] = this.id;
		  this.crudServices.updateData<any>(InterestRateMaster.updateData, data).subscribe((response) => {
			this.toasterService.pop("success", "Update", response.message);
			this.interestForm.reset();
			this.id = null;
			this.getData();
		  });
		} else {
		  this.crudServices.addData<any>(InterestRateMaster.addData, data).subscribe((response) => {
			this.toasterService.pop("success", "Add", response.message);
			this.interestForm.reset();
			this.getData();
		  });
		}
	}
	  

	onEdit(item) {
		let obj = {};
		this.id = item.id
		for (let key in item) {
			obj[key] = item[key];
			if (key == 'from_date' || key == "to_date") {
				obj[key] = item[key] != null ? this.datePipe.transform(item[key], 'dd-MM-yyyy') : '';
				this.interestForm.patchValue(obj);
			} else {
				this.interestForm.patchValue(obj);
			}
		}

	}

	onDelete(id) {
		this.crudServices.deleteData<any>(InterestRateMaster.deleteData, { id: id }).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.getData();
		});

	}

}
