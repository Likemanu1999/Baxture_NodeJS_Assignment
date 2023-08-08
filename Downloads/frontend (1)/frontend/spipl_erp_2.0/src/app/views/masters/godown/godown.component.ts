import { Component, OnInit, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
// import { PortService, PortDataList } from './port_master_service';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { environment } from '../../../../environments/environment';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { FileUpload, GodownMaster, PortMaster } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';

@Component({
	selector: 'app-godown',
	templateUrl: './godown.component.html',
	styleUrls: ['./godown.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [ToasterService, CrudServices, PermissionService]
})
export class GodownComponent implements OnInit, OnDestroy {

	port_data: any = [];
	main_godown_list: any = [];

	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;

	godownMasterForm: FormGroup;
	updateGodownMaster: FormGroup;
	submitted = false;
	updated = false;
	update_godown_name: string;
	update_port_id: number;
	update_load_charges: string;
	update_cross_charges: string;
	update_gst_no: string;
	update_godown_incharge_name: string;
	update_godown_address: string;
	update_godown_incharge_sign: any;

	error: any;
	public data: any = [];
	clicked = false;
	public filterQuery = '';
	filterArray = ['godown_name', 'godown_address', 'gst_no', 'godown_incharge_name'];
	isLoading = false;
	private toasterService: ToasterService;
	id: number;
	subscription: Subscription;
	subscriptionConfirm: Subscription;
	count = 0;
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

	filesToUpload: Array<File> = [];

	godownTypeList = staticValues.godown_type;

	imageSrc: string;
	size: string;
	constructor(
		private crudServices: CrudServices,
		private fb: FormBuilder,
		toasterService: ToasterService,
		private route: ActivatedRoute,
		private router: Router,
		private permissionService: PermissionService
	) {
		this.size = "col-md-8"
		this.toasterService = toasterService;
		this.initForm();
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];
		this.del_opt = perms[3];
		this.getGodown();

	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	ngOnInit(): void {
		this.crudServices.getAll<any>(PortMaster.getAll).subscribe(response => {
			this.port_data = response;
		});

		this.crudServices.getAll<any>(GodownMaster.getAllHeadGodown).subscribe(response => {
			this.main_godown_list = response;
		});

		this.size = 'col-md-8';
	}


	initForm() {

		this.godownMasterForm = new FormGroup({

			'godown_name': new FormControl(null, Validators.required),
			'port_id': new FormControl(null, Validators.required),
			'load_charges': new FormControl(0),
			'cross_charges': new FormControl(0),
			'gst_no': new FormControl(null),
			'godown_address': new FormControl(null),
			'godown_incharge_name': new FormControl(null),
			'godown_incharge_contact': new FormControl(null),
			'godown_incharge_sign': new FormControl(null),
			'main_godown_id': new FormControl(null),
			'godown_type': new FormControl(null),
			'mat_hand_charges': new FormControl(null),

		});

		this.updateGodownMaster = new FormGroup({

			'update_godown_name': new FormControl(null, Validators.required),
			'update_port_id': new FormControl(null, Validators.required),
			'update_load_charges': new FormControl(0),
			'update_cross_charges': new FormControl(0),
			'update_gst_no': new FormControl(null),
			'update_godown_address': new FormControl(null),
			'update_godown_incharge_name': new FormControl(null),
			'update_godown_incharge_contact': new FormControl(null),
			'update_godown_incharge_sign': new FormControl(null),
			'update_main_godown_id': new FormControl(null),
			'update_godown_type': new FormControl(null),
			'update_mat_hand_charges': new FormControl(null),

		});

	}

	getGodown() {
		this.isLoading = true;
		this.subscription = this.crudServices.getAll<any>(GodownMaster.getAll).subscribe(res => {
			this.data = res;
			this.isLoading = false;
		}, error => this.error = error);
	}

	// convenience getter for easy access to form fields
	get f() { return this.godownMasterForm.controls; }
	get g() { return this.updateGodownMaster.controls; }

	onReset() {
		this.submitted = false;
		this.godownMasterForm.reset();
	}

	onSubmit() {
		this.submitted = true;
		// stop here if form is invalid
		if (this.godownMasterForm.invalid) {
			return;
		}



		let formData = {
			godown_name: this.godownMasterForm.value.godown_name,
			port_id: parseInt(this.godownMasterForm.value.port_id),
			load_charges: this.godownMasterForm.value.load_charges,
			cross_charges: this.godownMasterForm.value.cross_charges,
			gst_no: this.godownMasterForm.value.gst_no,
			godown_incharge_name: this.godownMasterForm.value.godown_incharge_name,
			godown_incharge_contact: this.godownMasterForm.value.godown_incharge_contact,
			godown_address: this.godownMasterForm.value.godown_address,
			main_godown_id: this.godownMasterForm.value.main_godown_id,
			godown_type: this.godownMasterForm.value.godown_type,
			mat_hand_charges: this.godownMasterForm.value.mat_hand_charges
		};
		const fileData: any = new FormData();
		const files: Array<File> = this.filesToUpload;
		if (files.length > 0) {
			if (files.length > 0) {
				for (let i = 0; i < files.length; i++) {
					fileData.append('godown_incharge_sign', files[i], files[i]['name']);
				}
			}

			this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
				let files = [];
				let filesList = res.uploads.godown_incharge_sign;
				if (filesList.length > 0) {
					for (let i = 0; i < filesList.length; i++) {
						files.push(filesList[i].location);
					}
					formData['godown_incharge_sign'] = JSON.stringify(files);
				}
				this.saveData(formData);
			});

		} else {
			this.saveData(formData);
		}

	}

	saveData(body) {
		this.crudServices.addData<any>(GodownMaster.add, body).subscribe((response) => {
			this.onReset();
			this.getGodown();
			this.toasterService.pop(response.message, 'Success', response.data);
		});
	}

	fileChangeEvent(fileInput: any) {
		this.filesToUpload = <Array<File>>fileInput.target.files;
	}

	onEdit(id: number) {

		if (id != null) {
			this.id = id;
			let godown_name = '';
			let port_id: number;
			let load_charges: number;
			let cross_charges: number;
			let gst_no: string;
			let godown_address: string;
			let godown_incharge_name: string;
			let godown_incharge_contact: string;
			let godown_incharge_sign: string;
			let update_godown_incharge_sign;
			let update_main_godown_id;
			let update_godown_type;
			let update_mat_hand_charges;

			this.crudServices.getOne<any>(GodownMaster.getOne, {
				id: this.id
			}).subscribe((response) => {
				if (response === null) {
					this.error = response;
					this.toasterService.pop('error', 'Error', 'Something Went Wrong');
				} else {
					id = response['id'];
					godown_name = response[0]['godown_name'];
					port_id = response[0]['port_id'];
					load_charges = response[0]['load_charges'];
					cross_charges = response[0]['cross_charges'];
					gst_no = response[0]['gst_no'];
					godown_address = response[0]['godown_address'];
					godown_incharge_name = response[0]['godown_incharge_name'];
					godown_incharge_contact = response[0]['godown_incharge_contact'];
					godown_incharge_sign = response[0]['godown_incharge_sign'];
					update_godown_incharge_sign = response[0]['godown_incharge_sign'];
					update_main_godown_id = response[0]['parent_id'];
					update_godown_type = response[0]['head_godown'];
					update_mat_hand_charges = response[0]['mat_hand_charges'];

					this.imageSrc = environment.serverUrl + response[0]['godown_incharge_sign'];
					this.updateGodownMaster.patchValue({
						'update_godown_name': godown_name,
						'update_port_id': port_id,
						'update_load_charges': load_charges,
						'update_cross_charges': cross_charges,
						'update_gst_no': gst_no,
						'update_godown_address': godown_address,
						'update_godown_incharge_name': godown_incharge_name,
						'update_godown_incharge_contact': godown_incharge_contact,
						'update_main_godown_id': update_main_godown_id,
						'update_godown_type': update_godown_type,
						'update_mat_hand_charges': update_mat_hand_charges,
					})

					// this.updateGodownMaster = new FormGroup({



					// });
				}
			}, errorMessage => {
				this.error = errorMessage.message;
			});
			this.myModal.show();
		}
	}


	onUpdate() {
		this.updated = true;
		if (this.updateGodownMaster.dirty) {
			let formData = {
				godown_name: this.updateGodownMaster.value.update_godown_name,
				port_id: this.updateGodownMaster.value.update_port_id,
				load_charges: this.updateGodownMaster.value.update_load_charges,
				cross_charges: this.updateGodownMaster.value.update_cross_charges,
				gst_no: this.updateGodownMaster.value.update_gst_no,
				godown_incharge_name: this.updateGodownMaster.value.update_godown_incharge_name,
				godown_incharge_contact: this.updateGodownMaster.value.update_godown_incharge_contact,
				godown_address: this.updateGodownMaster.value.update_godown_address,
				parent_id: this.updateGodownMaster.value.update_main_godown_id,
				head_godown: this.updateGodownMaster.value.update_godown_type,
				mat_hand_charges: this.updateGodownMaster.value.update_mat_hand_charges,
				id: this.id,
			};

			const fileData: any = new FormData();
			const files: Array<File> = this.filesToUpload;
			if (files.length > 0) {

				for (let i = 0; i < files.length; i++) {
					fileData.append('godown_incharge_sign', files[i], files[i]['name']);
				}

				this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let files = [];
					let filesList = res.uploads.godown_incharge_sign;
					if (filesList.length > 0) {
						for (let i = 0; i < filesList.length; i++) {
							files.push(filesList[i].location);
						}
						formData['godown_incharge_sign'] = JSON.stringify(files);

					}
					this.updateGodown(formData);
				});


			} else {
				this.updateGodown(formData);
			}



		} else {
			this.myModal.hide();
		}
	}

	updateGodown(formData) {
		this.crudServices.updateData<any>(GodownMaster.update, formData).subscribe((response) => {
			this.getGodown();
			this.toasterService.pop(response.message, 'Success', response.data);
			this.myModal.hide();
		});
	}

	viewfullscreen() {
		this.add_opt = !this.add_opt;
		this.size = (this.add_opt == true) ? 'col-md-8' : 'col-md-12';
	}

	onDelete(id: number) {
		this.crudServices.deleteData<any>(GodownMaster.delete, {
			id: this.id
		}).subscribe((response) => {
			this.getGodown();
			this.toasterService.pop(response.message, 'Success', response.data);
		});
	}

}
