import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CrudServices } from "../../../shared/crud-services/crud-services";
import { DatePipe } from '@angular/common';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ActivatedRoute, Params } from '@angular/router';
import { GodownMaster, LocalPurchase, LocalPurchaseCharges, LocalPurchaseGodownAlloc, SubOrg } from '../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-local-purchase-charges',
	templateUrl: './local-purchase-charges.component.html',
	styleUrls: ['./local-purchase-charges.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		DatePipe,
		CrudServices

	]
})
export class LocalPurchaseChargesComponent implements OnInit {
	id: number;
	TransporterForm: FormGroup;
	TransporterArr: FormArray;
	transporter: any;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	StorageForm: any;
	StorageArr: FormArray;
	godown: any;
	sub_org_name: any;
	port: any;

	constructor(private toasterService: ToasterService,
		public datepipe: DatePipe,
		private crudServices: CrudServices,
		private route: ActivatedRoute,
		private fb: FormBuilder,
	) {
		this.crudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 111 }).subscribe(response => {
			this.transporter = response;

		})



		//   this.crudServices.getAll<any>(GodownMaster.getAll).subscribe(response => {
		//     this.godown = response;

		//   })

	}

	ngOnInit() {

		this.route.params.subscribe((params: Params) => {
			this.id = +params['local_purchase_id'];

		});

		this.TransporterForm = this.fb.group({

			TransporterArr: this.fb.array([

			]),
		});

		this.StorageForm = this.fb.group({

			StorageArr: this.fb.array([

			]),
		});

		this.crudServices.getOne<any>(LocalPurchaseGodownAlloc.getGodownAllocation, { id: this.id }).subscribe(response=> {
            response.map(item => item.godown_name = `${item.godown_name} (Qty: ${item.quantity} MT)` )
			this.godown = response;
		});

		this.getDetails();
		this.getTransporterCharges();
		this.getStorageCharges();
	}

	getDetails() {
		this.crudServices.getOne<any>(LocalPurchase.getOneLocalPurchaseDeal, { id: this.id }).subscribe(response => {
			if (response.length) {
				this.sub_org_name = response[0]['sub_org_name'];
				this.port = response[0]['port_master']['port_name'];
			}

		})
	}

	addRow(): void {


		this.TransporterArr = this.TransporterForm.get('TransporterArr') as FormArray;
		this.TransporterArr.push(this.createItem(null));
	}

	delete(index: number) {
		this.TransporterArr = this.TransporterForm.get('TransporterArr') as FormArray;
		this.TransporterArr.removeAt(index);

	}

	addRowStorage(): void {


		this.StorageArr = this.StorageForm.get('StorageArr') as FormArray;
		this.StorageArr.push(this.createItemStorage(null));
	}

	deleteStorage(index: number) {
		this.StorageArr = this.StorageForm.get('StorageArr') as FormArray;
		this.StorageArr.removeAt(index);

	}

	createItem(data): FormGroup {

		if (data == null) {

			return this.fb.group({
				transporter_id: new FormControl(null),
				amount: new FormControl(null),
				bill_no: new FormControl(null)
			});
		} else {
			return this.fb.group({
				transporter_id: new FormControl(data.transporter_id),
				amount: new FormControl(data.amount),
				bill_no: new FormControl(data.bill_no)

			});
		}


	}

	createItemStorage(data): FormGroup {

		if (data == null) {

			return this.fb.group({
				godown_id: new FormControl(null),
				amount: new FormControl(null),
				from_date: new FormControl(null),
				to_date: new FormControl(null),


			});
		} else {
			return this.fb.group({
				godown_id: new FormControl(data.godown_id),
				amount: new FormControl(data.amount),
				from_date: new FormControl(data.from_date != null ? new Date(data.from_date) : null),
				to_date: new FormControl(data.to_date != null ? new Date(data.to_date) : null),


			});
		}


	}

	getTransporterCharges() {
		this.crudServices.getOne<any>(LocalPurchaseCharges.getTransporterCharges, { id: this.id }).subscribe(response => {
			if (response.length) {
				console.log(response, 'DATA');
				for (let val of response) {
					this.TransporterArr = this.TransporterForm.get('TransporterArr') as FormArray;
					this.TransporterArr.push(this.createItem(val));
				}


			}
		})
	}

	getStorageCharges() {
		this.crudServices.getOne<any>(LocalPurchaseCharges.getStorageCharges, { id: this.id }).subscribe(response => {
			if (response.length) {
				console.log(response, 'DATA');
				for (let val of response) {
					this.StorageArr = this.StorageForm.get('StorageArr') as FormArray;
					this.StorageArr.push(this.createItemStorage(val));
				}


			}
		})
	}

	submitTransporterCharges() {
		let transporter_data = this.TransporterForm.value.TransporterArr;
		let data = [];

		transporter_data.forEach(element => {
			data.push({
				'local_deal_id': this.id,
				'transporter_id': element.transporter_id,
				'amount': element.amount != '' ? element.amount : 0,
				'bill_no': element.bill_no
			})
		});

		this.crudServices.addData<any>(LocalPurchaseCharges.addTransporterCharges, data).subscribe(response => {
			this.toasterService.pop(response.message, response.message, response.data);
		})

	}

	submitStorageCharges() {
		let Storage_data = this.StorageForm.value.StorageArr;
		let data = [];

		Storage_data.forEach(element => {
			data.push({
				'local_deal_id': this.id,
				'godown_id': element.godown_id,
				'from_date': this.datepipe.transform(element.from_date, 'yyyy-MM-dd'),
				'to_date': this.datepipe.transform(element.to_date, 'yyyy-MM-dd'),
				'amount': element.amount != '' ? element.amount : 0,

			})
		});

		this.crudServices.addData<any>(LocalPurchaseCharges.addStorageCharges, data).subscribe(response => {
			this.toasterService.pop(response.message, response.message, response.data);
		})
	}

	getGodownDetails(event , i) {
		console.log(i);
		console.log(event.from_date);
		
		
	
		((this.StorageForm.controls.StorageArr as FormArray).at(i) as FormGroup).get('from_date').patchValue(new Date(event.from_date));
		((this.StorageForm.controls.StorageArr as FormArray).at(i) as FormGroup).get('to_date').patchValue(new Date(event.to_date));
		
	}





}
