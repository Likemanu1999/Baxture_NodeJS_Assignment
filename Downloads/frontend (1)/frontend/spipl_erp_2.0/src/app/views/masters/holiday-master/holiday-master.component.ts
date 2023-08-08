import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { staticValues } from "../../../shared/common-service/common-service";
import { HolidayType } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-holiday-master',
	templateUrl: './holiday-master.component.html',
	styleUrls: ['./holiday-master.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})
export class HolidayMasterComponent implements OnInit {

	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	holiday_types: any = staticValues.holiday_types;
	holidayForm: FormGroup;
	data: any = [];
	public filterQuery = '';
	filterArray = [];
	isLoading = false;
	mode = 'Add';
	private toasterService: ToasterService;
	id: number;
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
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	constructor(private fb: FormBuilder,
		private crudServices: CrudServices,
		toasterService: ToasterService,
		private permissionService: PermissionService) {
		this.toasterService = toasterService;

		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];

		this.holidayForm = this.fb.group({
			name: new FormControl(null, Validators.required),
			icon: new FormControl(null),
			type: new FormControl(null, Validators.required)
		});
	}

	ngOnInit() {
		this.getHolidays();
	}

	getHolidays() {
		this.mode = 'Add';
		this.id = 0;
		this.isLoading = true;
		this.crudServices.getAll<any>(HolidayType.getAll).subscribe(res => {
			res.data.forEach(element => {
				element.icon_path = "../assets/img/holidays/" + element.icon + ".png";
				element.type_label = (element.type == 1) ? "Full Day" : "Half Day";
			});
			this.data = res.data;
			this.isLoading = false;
		});
	}

	onSubmit() {
		if (this.holidayForm.invalid) {
			return;
		}

		if (this.id) {
			this.crudServices.updateData<any>(HolidayType.update, {
				name: this.holidayForm.value.name,
				icon: this.holidayForm.value.icon,
				type: this.holidayForm.value.type,
				id: this.id
			}).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, 'Success', res.data);
					this.holidayForm.reset();
					this.getHolidays();
				} else {
					this.toasterService.pop('error', 'error', 'Somethimg Went wrong');
				}
			});
		} else {
			this.crudServices.addData<any>(HolidayType.add, {
				name: this.holidayForm.value.name,
				icon: this.holidayForm.value.icon,
				type: this.holidayForm.value.type
			}).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, 'Success', res.data);
					this.holidayForm.reset();
					this.getHolidays();
				} else {
					this.toasterService.pop('error', 'error', 'Somethimg Went wrong');
				}

			});
		}
	}

	onEdit(item) {
		this.mode = 'Edit';
		if (item.id != null) {
			this.id = item.id;
			this.holidayForm.patchValue({
				name: item.name,
				icon: item.icon,
				type: item.type
			});
		}
	}

	onDelete(id: number) {
		if (id) {
			this.crudServices.deleteData<any>(HolidayType.delete, {
				id: id
			}).subscribe((res) => {
				this.getHolidays();
				this.toasterService.pop(res.message, 'Success', res.data);
			});
		}
	}

}
