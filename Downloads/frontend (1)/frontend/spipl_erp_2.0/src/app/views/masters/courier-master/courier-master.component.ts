import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
// import { MasterServicesService } from '../master-services/master-services.service';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
// import { Courier } from '../interfaces/courier';

@Component({
	selector: 'app-courier-master',
	templateUrl: './courier-master.component.html',
	styleUrls: ['./courier-master.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})

export class CourierMasterComponent implements OnInit {

	// courier: Courier[] = [];
	courier: any[] = [];
	loading: boolean = false;

	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	del_opt: boolean = false;

	courierForm: FormGroup;

	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	constructor(
		// private masterServices: MasterServicesService,
		private permissionService: PermissionService,
		private crudServices: CrudServices
	) {
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
	}

	ngOnInit() {
		this.initForm();
		this.getData();
	}

	initForm() {
		this.courierForm = new FormGroup({
			name: new FormControl(null, Validators.required),
		});
	}

	getData() {
		this.loading = true;
		this.crudServices.list().subscribe(res => {
			this.loading = false;
			this.courier = res;
		});
		this.crudServices.getChannel().bind('new', data => {
			data.new = true;
			if (this.courier.length > 0) {
				this.courier.push(data);
			} else {
				this.courier = [data];
			}
		});
		this.crudServices.getChannel().bind('deleted', data => {
			this.courier = this.courier.filter(o => o.id !== data.id);
		});
	}

	onSubmit() {
		const param = this.courierForm.value;
		this.crudServices.create(param).subscribe((courier: any) => {
			this.loading = false;
			this.courierForm.reset();
		}, (error) => {
			this.loading = false;
		});
	}

}
