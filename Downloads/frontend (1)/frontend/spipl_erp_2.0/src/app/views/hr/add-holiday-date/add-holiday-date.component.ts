


import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToasterService, ToasterConfig } from 'angular2-toaster/angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { HolidayType, newHoliday } from '../../../shared/apis-path/apis-path';
import { staticValues, CommonService } from '../../../shared/common-service/common-service';
import * as moment from "moment";

@Component({
	selector: 'app-add-holiday-date',
	templateUrl: './add-holiday-date.component.html',
	styleUrls: ['./add-holiday-date.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [CrudServices, ToasterService, PermissionService],
})
export class AddHolidayDateComponent implements OnInit {

	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;

	yearPickerConfig: any = staticValues.yearPickerConfig;
	selected_year: Date = new Date();
	holidayForm: FormGroup;
	data = [];
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
	holiday: any = [];

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

		this.holidayForm = new FormGroup({
			date: new FormControl(null, Validators.required),
			holiday_id: new FormControl(null, Validators.required),
			remark: new FormControl(null)
		});

		this.crudServices.getAll<any>(HolidayType.getAll).subscribe(res => {
			this.holiday = res.data;
		});
	}

	ngOnInit() {
		this.getHolidays();
	}

	getHolidays() {
		this.mode = 'Add';
		this.id = 0;
		this.isLoading = true;
		this.crudServices.getOne<any>(newHoliday.getOne, {
			year: moment(this.selected_year).format("YYYY")
		}).subscribe(res => {
			if (res.code == 100) {
				this.data = res.data;
			}
			this.isLoading = false;
		});
	}

	onSubmit() {
		if (this.holidayForm.invalid) {
			return;
		}
		if (this.id) {
			this.crudServices.updateData<any>(newHoliday.update, {
				date: this.holidayForm.value.date,
				holiday_id: this.holidayForm.value.holiday_id,
				remark: this.holidayForm.value.remark,
				id: this.id
			}).subscribe(res => {
				this.id = 0;
				if (res.code == '100') {
					this.toasterService.pop(res.message, 'Success', res.data);
					this.holidayForm.reset();
					this.getHolidays();
				} else {
					this.toasterService.pop('error', 'error', 'Something Went wrong');
				}
			});
		} else {
			this.crudServices.addData<any>(newHoliday.add, {
				date: this.holidayForm.value.date,
				holiday_id: this.holidayForm.value.holiday_id,
				remark: this.holidayForm.value.remark
			}).subscribe(res => {
				if (res.code == '100') {
					this.toasterService.pop(res.message, 'Success', res.data);
					this.holidayForm.reset();
					this.getHolidays();
				} else {
					this.toasterService.pop('error', 'error', 'Something Went wrong');
				}

			});
		}
	}

	onEdit(item) {
		this.mode = 'Edit';
		if (item.id != null) {
			this.id = item.id;
			this.holidayForm.controls.date.setValue(item.date);
			this.holidayForm.controls.holiday_id.setValue(item.holiday_id);
			this.holidayForm.controls.remark.setValue(item.remark);
		}
	}

	onDelete(id: number) {
		if (id) {
			this.crudServices.deleteData<any>(newHoliday.delete, {
				id: id
			}).subscribe((res) => {
				this.getHolidays();
				this.toasterService.pop(res.message, 'Success', res.data);
			});
		}
	}

}

