import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { billOfEntry, billOfLading, chacharges, FileUpload, Notifications, NotificationsUserRel, PercentageDetails, percentage_master, UsersNotification } from '../../../shared/apis-path/apis-path';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UserDetails } from '../../login/UserDetails.model';
import { MessagingService } from '../../../service/messaging.service';

@Component({
	selector: 'app-bill-of-entry',
	templateUrl: './bill-of-entry.component.html',
	styleUrls: ['./bill-of-entry.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		CrudServices,
		MessagingService
	]
})
export class BillOfEntryComponent implements OnInit {
	addBeForm: FormGroup;
	non_id: number;
	addBeFlag: boolean;
	bl_list = [];
	beDocs: Array<File> = [];
	tr6Docs: Array<File> = [];
	mode_of_payment: { id: number; value: string; }[];
	non_invoice: any;
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to delete?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;
	cols: { field: string; header: string; style: string; }[];
	be_list = [];
	be_id: any;
	addMode: boolean = true;
	non_list: any;
	exchange_rate: any;
	bcd: any;
	sws = 0;
	igst: any;
	licence_val: boolean = false;
	cash_val: boolean = false;
	blDetails = [];
	user: UserDetails;
	links: string[] = [];
	be_add: boolean;
	be_edit: boolean;
	be_del: boolean;
	be_license_utilization: boolean;
	docs1 = [];
	docs2 = [];
	material_type = [];
	int_rmk: boolean;
	fine_rmk: boolean;

	notification_details: any;
	notification_tokens = [];
	notification_id_users = []
	notification_users = [];
	message: any;

	constructor(private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		private route: ActivatedRoute,
		private router: Router,
		private fb: FormBuilder,
		public datepipe: DatePipe,
		private messagingService: MessagingService,
		private crudServices: CrudServices) {


		const perms = this.permissionService.getPermission();

		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.be_add = (this.links.indexOf('BE add') > -1);
		this.be_edit = (this.links.indexOf('BE edit') > -1);
		this.be_del = (this.links.indexOf('BE delete') > -1);
		this.be_license_utilization = (this.links.indexOf('BE Licence Utilization') > -1);

		this.mode_of_payment = [{ id: 1, value: "Transactional" }, { id: 1, value: "Deffered" }]

		this.addBeForm = this.fb.group({
			be_dt: new FormControl(null, Validators.required),
			be_no: new FormControl(null, Validators.required),
			accessable_val: new FormControl(null, Validators.required),
			invoice_val: new FormControl(0),
			load_charge: new FormControl(0),
			bcd_license_val: new FormControl(null),
			bcd_cash_val: new FormControl(null),
			sws_val: new FormControl(null),
			anti_dumping_val: new FormControl(0),
			anti_dumping_rate: new FormControl(0),
			anti_dumping_val_gst: new FormControl(0),
			custom_interest_amt: new FormControl(0),
			custom_fine_amt: new FormControl(0),
			igst_amt: new FormControl(0),
			custom_duty_amt: new FormControl(0),
			custom_duty_date: new FormControl(null),
			custom_interest_rmk: new FormControl(null),
			custom_fine_rmk: new FormControl(null),
			mode_of_payment: new FormControl(null),
			license_val: new FormControl(false),
			cash_val: new FormControl(false),
			be_copy: new FormControl(null),
			tr6_copy: new FormControl(null),
			exchange_rate: new FormControl(null),
			freight: new FormControl(0),
			insurance: new FormControl(0),
			high_seas_commision: new FormControl(0),
			bcd_percent: new FormControl(0),
			be_shipment_status: new FormControl(0),
			blDetails: this.fb.array([]),
			safe_guard_duty:new FormControl(0)
		});



		this.cols = [
			{ field: 'be_dt', header: 'BE Date', style: '100' },
			{ field: 'be_no', header: 'BE Number', style: '100' },
			{ field: 'bl_no', header: 'BL Number', style: '100' },
			{ field: 'bl_qty', header: 'Total BL Quantity', style: '100' },
			{ field: 'covered_bl_qty', header: 'Covered BL Qty', style: '100' },
			{ field: 'be_copy', header: 'BE copy', style: '120' },
			{ field: 'tr6_copy', header: 'TR6 Copy', style: '120' },

		];

		this.crudServices.getAll<any>(chacharges.getShipmentStatus).subscribe(response => {
			this.material_type.push({id:0 , type : 'Normal'});
			response.forEach(element => {
				if(element.type == "EXBOND" || element.type == "INBOND" ) {
					this.material_type.push(element)
				}
			});
		
		})


	}

	ngOnInit() {

		this.route.params.subscribe((params: Params) => {
			this.non_id = +params['id'];


		});

		this.getBilloflading();



		this.crudServices.getAll<any>(percentage_master.getAllDataByCurrentDate).subscribe(response => {
			console.log(response);
            if(response.length) {
				response.forEach(element => {
					// if (element.percentage_type.type == 'BCD Percent Value') {
					// 	console.log(element.percent_value);
	
					// 	this.bcd = element.percent_value;
					// }
					if (element.percentage_type.type == 'SWS Percent Value') {
						this.sws = element.percent_value;
					}
	
				});
	
			}
			
		})

		this.crudServices.getOne<any>(PercentageDetails.getOne, { detail_type: 2 }).subscribe(response => {
			console.log(response);

			response.forEach(element => {
				if (element.percent_type === 'gst') {
					this.igst = element.percent_value;
				}

			});

		})

		this.getBeList();

	}

	getBilloflading() {
		this.crudServices.getOne<any>(billOfLading.getData, { id: this.non_id }).subscribe(response => {

			console.log(response, 'bill');
			this.non_list = response[0].non_negotiable;
			this.non_invoice = response[0].non_negotiable.invoice_no;

			this.bl_list = [];
			const bl = this.addBeForm.controls.blDetails as FormArray;
			bl.controls = [];

			for (let element of response) {
				let covered_qty = 0;
				if (element.non_be_bls.length > 0) {
					for (let val of element.non_be_bls) {
						covered_qty += Number(val.covered_bl_qty);
					}
				}
				element.covered_qty = covered_qty;
				this.bl_list.push(element);

				console.log(element);
				



				bl.push(this.fb.group({
					n_id: new FormControl(element.n_id),
					bl_id: new FormControl(element.id),
					original_qty: new FormControl(element.bl_qauntity),
					covered_bl_qty: new FormControl(0)

				}));

			}




		})

	}




	LicenseKnockOff(data) {
		let BE_id = data.id;
		this.router.navigate(["logistics/knock-of-license", BE_id]);
	}

	getBeList() {
		this.crudServices.getOne<any>(billOfEntry.getAll, { id: this.non_id }).subscribe(response => {

			this.be_list = [];
			for (let val of response) {
				let bl_no = '';
				let bl_qty = 0;
				let covered_bl_qty = 0;
				if (val.non_be_bls.length > 0) {
					for (let det of val.non_be_bls) {
						bl_no = bl_no + det.bill_of_lading.bill_lading_no + '  ';
						bl_qty = bl_qty + det.bill_of_lading.bl_qauntity
						covered_bl_qty += det.covered_bl_qty;
					}

				}

				val.bl_no = bl_no;
				val.covered_bl_qty = covered_bl_qty;
				val.bl_qty = bl_qty;
				this.be_list.push(val);

			}

		});
	}


	addBeCopy(event: any) {
		this.beDocs = <Array<File>>event.target.files;
	}


	addTr6Copy(event: any) {
		this.tr6Docs = <Array<File>>event.target.files;
	}


	deleteFile(i, doc) {

		if (doc == 1) {
			this.docs1.splice(i, 1);
			console.log(this.docs1);

		}

		if (doc == 2) {
			this.docs2.splice(i, 1);
			console.log(this.docs2);

		}


	}


	onSubmit() {

		let fileDealDocs1 = [];
		let fileDealDocs2 = [];

		if (this.docs1.length > 0) {
			for (let doc of this.docs1) {
				fileDealDocs1.push(doc);

			}
		}

		if (this.docs2.length > 0) {
			for (let doc of this.docs2) {
				fileDealDocs2.push(doc);

			}
		}

		console.log(this.addBeForm.value.be_shipment_status , 'testtt');
		console.log(fileDealDocs2 , 'rrrr');
		

		var data = {
			n_id: this.non_id,
			be_dt: this.datepipe.transform(this.addBeForm.value.be_dt, 'yyyy-MM-dd'),
			be_no: this.addBeForm.value.be_no,
			accessable_val: this.addBeForm.value.accessable_val,
			sws_val: this.addBeForm.value.sws_val,
			anti_dumping_val: this.addBeForm.value.anti_dumping_val,
			anti_dumping_rate: this.addBeForm.value.anti_dumping_rate,
			anti_dumping_val_gst: this.addBeForm.value.anti_dumping_val_gst,
			bcd_percent: this.addBeForm.value.bcd_percent,
			custom_interest_amt: this.addBeForm.value.custom_interest_amt,
			custom_fine_amt: this.addBeForm.value.custom_fine_amt,
			custom_interest_rmk: this.addBeForm.value.custom_interest_rmk,
			custom_fine_rmk: this.addBeForm.value.custom_fine_rmk,
			igst_amt: this.addBeForm.value.igst_amt,
			custom_duty_amt: this.addBeForm.value.custom_duty_amt,
			exchange_rate: this.addBeForm.value.exchange_rate,
			freight: this.addBeForm.value.freight,
			insurance: this.addBeForm.value.insurance,
			high_seas_commision: this.addBeForm.value.high_seas_commision,
			custom_duty_date: this.datepipe.transform(this.addBeForm.value.custom_duty_date, 'yyyy-MM-dd'),
			mode_of_payment: this.addBeForm.value.mode_of_payment,
			bcd_license_val: this.addBeForm.value.bcd_license_val,
			bcd_cash_val: this.addBeForm.value.bcd_cash_val,
			be_shipment_status: this.addBeForm.value.be_shipment_status,
			safe_guard_duty:this.addBeForm.value.safe_guard_duty,
		}



		// if (this.addBeForm.value.license_val) {
		// 	data['bcd_license_val'] = this.addBeForm.value.bcd_license_val;
		// }

		// if (this.addBeForm.value.cash_val) {
		// 	data['bcd_cash_val'] = this.addBeForm.value.bcd_cash_val;
		// }

        
		const bl = this.addBeForm.value.blDetails;
		let blArr = [];
		if (bl.length > 0) {
			
				for (let val of bl) {
					if (val.covered_bl_qty > 0 && val.covered_bl_qty != null && val.covered_bl_qty != 0) {
						if( this.addBeForm.value.be_shipment_status != 2) {
							blArr.push({
								n_id: val.n_id,
								bl_id: val.bl_id,
								original_qty : val.original_qty,
								covered_bl_qty: val.covered_bl_qty
							})
						} else {
							blArr.push({
								n_id: val.n_id,
								bl_id: val.bl_id,
								original_qty : val.original_qty,
								covered_bl_qty: 0
							})
						}
						
					}
				}
			
			
			data['blDetails'] = blArr;
		}



		let fileData: any = new FormData();
		const document1: Array<File> = this.beDocs;
		const document2: Array<File> = this.tr6Docs;

		if (document1.length > 0) {
			for (let i = 0; i < document1.length; i++) {
				fileData.append('be_copy', document1[i], document1[i]['name']);
			}
		}

		if (document2.length > 0) {
			for (let i = 0; i < document2.length; i++) {
				fileData.append('tr6_copy', document2[i], document2[i]['name']);
			}
		}


		this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {


			let filesList1 = [];
			let filesList2 = [];

			if (res.uploads.be_copy) {
				filesList1 = res.uploads.be_copy;
				for (let i = 0; i < filesList1.length; i++) {
					fileDealDocs1.push(filesList1[i].location);
				}
			//	data['be_copy'] = JSON.stringify(fileDealDocs1);

			}

			if (res.uploads.tr6_copy) {
				filesList2 = res.uploads.tr6_copy;
				for (let i = 0; i < filesList2.length; i++) {
					fileDealDocs2.push(filesList2[i].location);
				}
			//	data['tr6_copy'] = JSON.stringify(fileDealDocs2);

			}

			if(fileDealDocs1.length > 0) {
				data['be_copy'] = JSON.stringify(fileDealDocs1);

			}

			if(fileDealDocs2.length > 0) {
				data['tr6_copy'] = JSON.stringify(fileDealDocs2);

			}

			this.saveData(data);


		})




	}

	saveData(data) {
		if (this.be_id) {
			//data.id = this.be_id;
			this.crudServices.updateData<any>(billOfEntry.update, {details: data , id: this.be_id}).subscribe(response => {
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.message, response.data);
					this.onBackList();
				} else {
					this.toasterService.pop(response.message, response.message, 'Something Went Wrong!!');
				}

			});
		} else {
			if (data['blDetails'].length > 0 && this.addBeForm.value.be_shipment_status != 2) {
				this.crudServices.addData<any>(billOfEntry.add, data).subscribe(response => {
					if (response.code == 100) {
						let notification_data = {
							"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
							"body": `Bill of Entry added for Invoice : ${this.non_invoice} `,
							"click_action": "#"
						  }
						this.generateNotification(notification_data,1);
						this.toasterService.pop(response.message, response.message, response.data);
						this.onBackList();
					} else {
						this.toasterService.pop(response.message, response.message, 'Something Went Wrong!!');
					}

				});
			}else if( this.addBeForm.value.be_shipment_status == 2) {
				this.crudServices.addData<any>(billOfEntry.add, data).subscribe(response => {
					if (response.code == 100) {
						let notification_data = {
							"title": `  ${this.notification_details.title} ${this.user.userDet[0].first_name}  ${this.user.userDet[0].last_name} `,
							"body": `Bill of Entry added for Invoice : ${this.non_invoice} `,
							"click_action": "#"
						  }
						this.generateNotification(notification_data,1);
						this.toasterService.pop(response.message, response.message, response.data);
						this.onBackList();
					} else {
						this.toasterService.pop(response.message, response.message, 'Something Went Wrong!!');
					}

				});
			} else {
				this.toasterService.pop('warning', 'warning', 'Add Bl Quantity');
			}

		}

	}

	addBe() {
		this.getNotifications('ADD_BILL_OF_ENTRY');
		this.addBeFlag = true;
	}

	onBackList() {
		this.addBeFlag = false;
		this.be_id = 0;
		this.blDetails = [];
		this.addMode = true;
		this.licence_val = false;
		this.cash_val = false;
		this.docs1 = [];
		this.docs2 = [];
		this.addBeForm.reset();
		this.getBeList();
		this.getBilloflading();
	}

	onBack() {
		this.router.navigate(['logistics/material-arrival-chart']);
	}

	getDocsArray(doc) {
		return JSON.parse(doc);
	}

	editBe(item) {
		console.log(item);
		
	

		let pi =  [];
		let qty = 0;
		pi = this.non_list.nonPi;


		let rate = 0;
		let totalRate = 0;
		for (let pival of pi) {
			console.log(pival.amount);

			totalRate += (pival.amount / pival.pi_qty);

		}

		for(let be_bl of item.non_be_bls) {
			if(item.be_shipment_status == 1) {
				qty += be_bl.original_qty;
			} else {
				qty += be_bl.covered_bl_qty;
			}
			
		}



		if (pi.length > 0) {
			rate = totalRate / pi.length;

		}

		

		
		this.docs1 = [];
		this.docs2 = [];
		this.licence_val = false;
		this.cash_val = false;
		this.be_id = item.id;
		this.addMode = false;
		this.addBeFlag = true;
		this.blDetails = item.non_be_bls;

		if (item.be_copy) {

			this.docs1 = JSON.parse(item.be_copy);
		}

		if (item.tr6_copy) {

			this.docs2 = JSON.parse(item.tr6_copy);
		}

		let object = {};
		for (let key in item) {
			if (key != 'be_copy' && key != 'tr6_copy') {
				object[key] = item[key]
			}

			if (key == 'be_dt') {
				object[key] = item[key] ? new Date(item[key]) : null;
			}

		}



		this.addBeForm.patchValue(object);
		console.log(object);
		
		this.addBeForm.patchValue({invoice_val : Number(qty * rate) });
	

		if (item.bcd_license_val) {


			this.addBeForm.patchValue({
				'license_val': true
			});

			this.licence_val = true;

		}

		if (item.bcd_cash_val) {
			this.addBeForm.patchValue({
				'cash_val': true
			});
			this.cash_val = true;
		}


	}

	checkQty(event, item, i) {
		const pendingQty = item.bl_qauntity - item.covered_qty;
		if (event) {
			if (event.target.value > pendingQty) {
				const bl = this.addBeForm.controls.blDetails as FormArray;
				(bl.at(i) as FormGroup).get('covered_bl_qty').patchValue(pendingQty);
				//	event.target.value = 0;
				this.toasterService.pop('warning', 'warning', 'Quantity Exceed to Pending Quantity');
			}
			this.calculateCustomDuty();


		}
	}


	calculateCustomDuty() {
		let bl = [];
		if (this.be_id) {
			bl = this.blDetails
		} else {
			bl = this.addBeForm.value.blDetails;
		}

		let pi = [];


		let totalQty = 0;
		if (bl.length > 0) {
			for (let val of bl) {
				if (val.covered_bl_qty > 0 && val.covered_bl_qty != null) {
					totalQty = totalQty + val.covered_bl_qty;
				}
			}

		}



		pi = this.non_list.nonPi;


		let rate = 0;
		let totalRate = 0;
		for (let pival of pi) {
			console.log(pival.amount);

			totalRate += (pival.amount / pival.pi_qty);

		}



		if (pi.length > 0) {
			rate = totalRate / pi.length;

		}



		let invoice_value = 0;
		let exchnageRate = 0;
		let cif = 0;
		let bcd_per = 0;
		let bcd = 0;
		let sws = 0;
		let freight = 0;
		let insurance = 0;
		let high_seas_commision = 0;
		let custom_duty = 0;
		let anti_dumping_val = 0;
		let igst_percent = 0;
		let custom_duty_amt = 0;
		let anti_dumping = 0;
		let anti_dumping_rate = 0;
		let anti_dumping_igst = 0;
		let bcdCash = 0;
		let load_charge = 0;
		let new_invoice_value = 0;
		let custom_interest_amt = 0;
		let custom_fine_amt = 0;




		invoice_value = rate * totalQty;
		load_charge = Number(this.addBeForm.value.load_charge);
 
		if(load_charge) {
			new_invoice_value = (rate + load_charge)  * totalQty ;
		} else {
			new_invoice_value = invoice_value;
		}
		bcd_per = this.addBeForm.value.bcd_percent;
		exchnageRate = this.addBeForm.value.exchange_rate;
		freight = this.addBeForm.value.freight;
		insurance = this.addBeForm.value.insurance;
		high_seas_commision = this.addBeForm.value.high_seas_commision;
		custom_interest_amt = this.addBeForm.value.custom_interest_amt;
		custom_fine_amt = this.addBeForm.value.custom_fine_amt;

		anti_dumping_rate = this.addBeForm.value.anti_dumping_rate;

		cif = (new_invoice_value ) * exchnageRate;

		if (freight != null && freight) {
			cif = cif + Number(freight);
		}

		if (insurance != null && insurance) {
			cif = cif + Number(insurance);
		}

		if (high_seas_commision != null && high_seas_commision) {
			cif = (cif + Number(cif * high_seas_commision / 100));
		}


		bcd = (cif * bcd_per / 100);
		sws = (bcd * this.sws / 100);

		
		let bcd_cash_val = 0;
		let bcd_lic_val = 0;

		if (this.addBeForm.value.cash_val) {

			if (this.addBeForm.value.bcd_cash_val !== 0 && this.addBeForm.value.bcd_cash_val !== null) {
				console.log(this.addBeForm.value.bcd_cash_val);

				bcd_cash_val = this.addBeForm.value.bcd_cash_val;
			} else {
				bcd_cash_val = bcd;
			}

		}

		if (this.addBeForm.value.license_val) {

			if (this.addBeForm.value.bcd_license_val !== 0 && this.addBeForm.value.bcd_license_val !== null) {
				bcd_lic_val = this.addBeForm.value.bcd_license_val;
			} else {
				bcd_lic_val = bcd;
			}

		}

		console.log(bcd_cash_val);
		console.log(bcd_lic_val);


		// if (this.addBeForm.value.license_val && this.addBeForm.value.cash_val) {
		// 	bcd_lic_val = 0;
		// 	bcd_cash_val = 0;
		// }




		// if (this.addBeForm.value.cash_val) {
		// 	if( this.addBeForm.value.bcd_cash_val) {
		// 		bcdCash = this.addBeForm.value.bcd_cash_val;
		// 	} else {

		// 	}

		// }

		custom_duty = Number(bcd) + Number(sws) + Number(cif) ;
		// igst_percent = Number(custom_duty * this.igst / 100) + Number(sws);
		igst_percent = Number((custom_duty * this.igst) / 100);

		custom_duty_amt = Number(bcd_cash_val) + Number(sws) + Number(igst_percent) + Number(custom_interest_amt) + Number(custom_fine_amt);



		if (anti_dumping_rate != null && anti_dumping_rate) {
			anti_dumping_val = (anti_dumping_rate * totalQty) * exchnageRate;
			anti_dumping_igst = anti_dumping_val * this.igst / 100;
			//console.log(anti_dumping_igst);
			igst_percent = igst_percent + anti_dumping_igst;

			custom_duty_amt = custom_duty_amt + anti_dumping_val + anti_dumping_igst;
		}




		this.addBeForm.patchValue({ invoice_val: invoice_value, accessable_val: cif, bcd_license_val: bcd_lic_val, bcd_cash_val: bcd_cash_val, sws_val: sws, igst_amt: igst_percent, custom_duty_amt: Math.round(custom_duty_amt), anti_dumping_val: anti_dumping_val, anti_dumping_val_gst: anti_dumping_igst });








	}

	changePercent() {
		
		this.addBeForm.patchValue({ license_val: false, cash_val: false })

	}

	deleteBe(id) {
		if (id) {
			this.crudServices.deleteData<any>(billOfEntry.delete, { id: id }).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getBilloflading();
				this.getBeList();
			})
		}
	}

	getFileName(filepath) {

		const test = filepath.split('/');
		return test[3] + "/" + test[4];

	}

	openRmk(event ,val) {
		
		
		if(event.target.value!=0 && event.target.value!='' && event.target.value != null && event.target.value!=undefined && val == 'interest') {
			
			this.int_rmk = true;
		}else  if(event.target.value!=0 && event.target.value!='' && event.target.value != null  && event.target.value!=undefined && val == 'fine') {
			console.log(event.target.value);
			this.fine_rmk = true;
		} else if((event.target.value==0 || event.target.value =='' || event.target.value == null  || event.target.value==undefined) && val == 'interest'){
			this.int_rmk = false;
			
		}  else if((event.target.value==0|| event.target.value=='' || event.target.value == null  || event.target.value==undefined) &&  val == 'fine'){
			console.log(event.target.value);
			this.fine_rmk = false;
			
		}
	}

	getNotifications(name) {
		this.notification_tokens = [];
		this.notification_id_users = []
		this.notification_users = [];
	
	
	    
		this.crudServices.getOne(Notifications.getNotificationDetailsByName, { notification_name: name }).subscribe((notification: any) => {
		  if (notification.code == '100' && notification.data.length > 0) {
			this.notification_details = notification.data[0];
			console.log(this.notification_details, "received details")
			this.crudServices.getOne(NotificationsUserRel.getOne, { notification_id: notification.data[0].id }).subscribe((notificationUser: any) => {
				console.log(notificationUser ,'DATA');
				
			  if (notificationUser.code == '100' && notificationUser.data.length > 0) {
				notificationUser['data'].forEach((element) => {
				  if (element.fcm_web_token) {
					this.notification_tokens.push(element.fcm_web_token);
					this.notification_id_users.push(element.id);
					console.log(this.notification_tokens, this.notification_id_users)
				  }
				});
			  }
			});
		  }
		})
	
	
	
	
	
	  }
	
	
	  generateNotification(data,id) {
		console.log(this.notification_details,'DIKSHA');
		if (this.notification_details != undefined) {
		  let body = {
			notification: data,
			registration_ids: this.notification_tokens
		  };
	
		  console.log(body,'BODY');
		  
	
		  this.messagingService.sendNotification(body).then((response) => {
			if (response) {
			  console.log(response);
			  
			  this.saveNotifications(body['notification'],id)
			}
			this.messagingService.receiveMessage();
			this.message = this.messagingService.currentMessage;
	
		  })
	
		}
	
	
	  }
	
	  saveNotifications(notification_body, id) {
		console.log(id, 'DATA');
	
		this.notification_users = [];
		for (const element of this.notification_id_users) {
		  this.notification_users.push({
			notification_id: this.notification_details.id,
			reciever_user_id: element,
			department_id: 1,
			heading: notification_body.title,
			message_body: notification_body.body,
			url: notification_body.click_action,
			record_id: id,
			table_name: 'bill_of_lading',
		  })
		}
		console.log(this.notification_users, "this.notification_users")
		this.crudServices.addData(UsersNotification.add, { data: this.notification_users }).subscribe((data) => {
		}, (error) => console.error(error));
	  }




}
