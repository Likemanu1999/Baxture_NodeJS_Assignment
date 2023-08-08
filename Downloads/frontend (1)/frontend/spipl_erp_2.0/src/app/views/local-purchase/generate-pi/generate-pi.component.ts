
import { Component, OnInit, ViewEncapsulation, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { DatePipe } from '@angular/common';
import { FileUpload, Ilc_Pi, PaymentTermMaster,GodownMaster, } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { LoginService } from '../../login/login.service';
import { UserDetails } from '../../login/UserDetails.model';



@Component({
	selector: 'app-generate-pi',
	templateUrl: './generate-pi.component.html',
	styleUrls: ['./generate-pi.component.css'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		DatePipe,
		CrudServices,
		LoginService
	]
})
export class GeneratePiComponent implements OnInit {
	@ViewChild('generateModal', { static: false }) public generateModal: ModalDirective;
	@Input() deal_arr: any;
	@Input() mode: string;
	@Output() emitFunctionOfPi: EventEmitter<any> = new EventEmitter<any>();

	generatePiForm: FormGroup;
	paymentTerm: any[];
	paymentMethod: any[];
	docs: Array<File> = [];
	dealArray = [];
	supplierName: string;
	user: UserDetails;
	godownsList: any = [];

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	pi_date: string;
	pi_invoice_no: string;
	place_of_destination: string;
	place_of_loading: string;
	remark: string;
	pi_id: number;
	supplier_id: number;
	role_id: any;
	company_id: any;

	constructor(
		private toasterService: ToasterService,
		private fb: FormBuilder,
		private datePipe: DatePipe,
		private crudServices: CrudServices,
		private loginService: LoginService,
	) {

		this.user = this.loginService.getUserDetails();
		this.company_id = this.user.userDet[0].company_id;
		this.role_id = this.user.userDet[0].role_id;


		this.crudServices.getOne<any>(PaymentTermMaster.getOneByType, {
			pay_type: 3
		}).subscribe((response) => {
			console.log(response);
			
			this.paymentTerm = response;
		});

		this.paymentMethod = [ { label: 'LC', id: 2 }, { label: 'RTGS/NEFT', id: 1 }];
		this.generatePiForm = this.fb.group({
			pi_date: new FormControl(null, Validators.required),
			pi_invoice_no: new FormControl(null, Validators.required),
			place_of_loading: new FormControl(null, Validators.required),
			place_of_destination: new FormControl(null, Validators.required),
			pi_copy: new FormControl(null),
			remark: new FormControl(null),
			dealDetails: this.fb.array([]),
		});
	}

	ngOnInit() {
		console.log(this.deal_arr);

		const deals = this.generatePiForm.controls.dealDetails as FormArray;
		if (this.mode === 'Add') {
			this.supplierName = this.deal_arr[0]['sub_org_name'];
			this.supplier_id = this.deal_arr[0]['supplier_id'];
			this.dealArray = this.deal_arr;

			deals.controls = [];
			for (const val of this.deal_arr) {
				deals.push(this.fb.group({
					deal_value: new FormControl(null),
					payment_term: new FormControl(null, Validators.required),
					payment_mode: new FormControl('2', Validators.required),
					quantity: new FormControl(val.quantity , Validators.required),
					deal_id: new FormControl(val.id),
				}));
			}
		} else if (this.mode === 'Edit') {
			const array = this.deal_arr.LocalPurchaseDealDet;
			this.supplier_id = this.deal_arr.supplier_id;
			this.supplierName = this.deal_arr.sub_org_name;
			this.pi_date = this.deal_arr.pi_date;
			this.pi_invoice_no = this.deal_arr.pi_invoice_no;
			this.place_of_destination = this.deal_arr.place_of_destination;
			this.place_of_loading = this.deal_arr.place_of_loading;
			this.remark = this.deal_arr.remark;
			this.pi_id = this.deal_arr.id;
			deals.controls = [];
			for (const val of array) {
				const amount = val.quantity * val.rate;
				const gst_percent = val.cgst_percent + val.sgst_percent;
				const tcs_percent = val.tcs_percent;
				const deal_value = ((amount) * gst_percent / 100);
				const deal_value_gst_tcs = (amount + deal_value) * (tcs_percent / 100);
				const deal_value_gst = (amount) + deal_value_gst_tcs + deal_value;
				const totalRequestAmount = Number(val.TotalReqAmt) + Number(val.TotalReqAmtIlc) + Number(val.TotalPiAmt);
				val.deal_value_gst = deal_value_gst;
				val.RemainingAmount = deal_value_gst - totalRequestAmount;
				deals.push(this.fb.group({
					deal_value: new FormControl(Math.round(val.AmountUtiliseAgainstDeal)),
					payment_term: new FormControl(val.PayTypeAgainstDeal, Validators.required),
					payment_mode: new FormControl(val.PayMethodAgainstDeal, Validators.required),
					quantity: new FormControl(val.PiQuantity, Validators.required),
					deal_id: new FormControl(val.id),
				}));
				this.dealArray.push(val);
			}


		}
		this.getGodowns();

	}
	onChangeValue(e, type) {
	// 	this.zone_fcm = [];
	// if (type == 'godown') {
	// 	this.salesOrderForm.patchValue({
	// 		godown: null
	// 	});
	// 	if (e != null && e != undefined) {
	// 		this.salesOrderForm.patchValue({
	// 			godown: e.godown_name
	// 		});
	// 		this.getGrades(e.id, this.salesOrderForm.value.zone_id);
	// 	} else {
	// 		this.gradesList = [];
	// 		this.salesOrderForm.patchValue({
	// 			grade_id: null
	// 		});
	// 	}
	// }
}
	getGodowns() {
		this.crudServices.getAll<any>(GodownMaster.getAllHeadGodown).subscribe(res => {
			if (res.length > 0) {
				this.godownsList = res;
			}
		});
	}

	
	addDocs(event: any) {
		this.docs = <Array<File>>event.target.files;
	}

	onSubmit() {

		const dealArray = this.generatePiForm.value.dealDetails;
		const local_purchase_deal_details = [];
		dealArray.forEach(element => {
			if (element.deal_value !== '' && element.deal_value !== undefined && element.deal_value !== 0) {
				local_purchase_deal_details.push({
					lp_con_id: element.deal_id,
					amount: element.deal_value,
					pay_type: element.payment_term,
					pay_method: element.payment_mode,
					quantity: element.quantity != '' ? element.quantity : null
				});
			}
		});


		var data = {
			pi_date: this.datePipe.transform(this.generatePiForm.value.pi_date, 'yyyy-MM-dd'),
			pi_invoice_no: this.generatePiForm.value.pi_invoice_no,
			place_of_loading: this.generatePiForm.value.place_of_loading,
			place_of_destination: this.generatePiForm.value.place_of_destination,
			remark: this.generatePiForm.value.remark,
			supplier_id: this.supplier_id,
			local_purchase_deal_details: local_purchase_deal_details,
			company_id: this.company_id,
			id: this.pi_id
		}



		let fileData: any = new FormData();
		const document: Array<File> = this.docs;

		if (document.length > 0) {
			for (let i = 0; i < document.length; i++) {
				fileData.append('local_purchase_pi', document[i], document[i]['name']);

			}

		}


		this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {

			let fileDealDocs = [];
			let filesList = res.uploads.local_purchase_pi;

			if (res.uploads.local_purchase_pi) {
				for (let i = 0; i < filesList.length; i++) {
					fileDealDocs.push(filesList[i].location);
				}
				data['pi_copy'] = JSON.stringify(fileDealDocs);
			}


			this.saveData(data, local_purchase_deal_details);


		})

	}


	saveData(formData, local_purchase_deal_details) {

		if (local_purchase_deal_details.length > 0) {

			if (this.mode === 'Add') {
				this.crudServices.addData<any>(Ilc_Pi.add, formData).subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
					setTimeout(() => {
						this.onBack();
					}, 1000);

				});
			} else if (this.mode === 'Edit') {
				this.crudServices.updateData<any>(Ilc_Pi.update, formData).subscribe(response => {
					this.toasterService.pop(response.message, response.message, response.data);
					setTimeout(() => {
						this.onBack();
					}, 1000);

				});
			}

		} else {
			this.toasterService.pop('warning', 'warning', 'Please Add Amount to Cover');
		}
	}

	onBack() {
		this.emitFunctionOfPi.emit(false);
	}

	checkAmount($e, item, i) {
		const amt = item.RemainingAmount;
		if ($e.target.value) {
			if ($e.target.value > amt) {
				this.toasterService.pop('warning', 'warning', 'Amount Exceeds');
				const deals = this.generatePiForm.controls.dealDetails as FormArray;
				deals.controls[i].patchValue({ deal_value: amt });
			}
		}
	}


	checkQuantity($e, item, i) {
         
		const qty = item.quantity;
		if ($e.target.value) {
			if ($e.target.value > qty) {
				this.toasterService.pop('warning', 'warning', 'Quantity Exceeds');
				const deals = this.generatePiForm.controls.dealDetails as FormArray;
				deals.controls[i].patchValue({ quantity: qty });
			} 
			 if($e.target.value == 0) {
				this.toasterService.pop('warning', 'warning', 'Quantity Cannot be 0');
				const deals = this.generatePiForm.controls.dealDetails as FormArray;
				deals.controls[i].patchValue({ quantity: qty });
			} 

			if($e.target.value == '') {
				this.toasterService.pop('warning', 'warning', 'Add some quantity');
				const deals = this.generatePiForm.controls.dealDetails as FormArray;
				deals.controls[i].patchValue({ quantity: qty });
				
			}
		}
	}





}
