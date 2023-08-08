import { Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { EmailTemplateMaster, FileUpload, ssurishaTDSChargesForm, tdsChargesForm } from '../../shared/apis-path/apis-path';
import { CrudServices } from '../../shared/crud-services/crud-services';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ExportService } from '../../shared/export-service/export-service';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { LoginService } from '../login/login.service';
import { UserDetails } from '../login/UserDetails.model';

@Component({
	selector: 'app-spipl-ssurisha-list',
	templateUrl: './spipl-ssurisha-list.component.html',
	styleUrls: ['./spipl-ssurisha-list.component.scss'],
	providers: [CrudServices, ToasterService, ExportService, DatePipe, LoginService]
})
export class SpiplSsurishaListComponent implements OnInit {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];

	spipl_list = [];
	ssurisha_list = [];
	addformspiplssurisha: FormGroup;
	declrForm: Array<File> = [];
	docs = [];
	id: any;
	company: any;
	tds_declation_form = [];
	export_data: any[];
	export_data_ssurisha: any[];

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	defaultDate: any;
	checkedList = [];
	filteredValuess: any[];

	currentYear: number;
	date = new Date();

	bsRangeValue: Date[];

	fromDate: any;
	todate: any;
	selectedYear: any
	PreviousofPreviousFinacialYear: any;
	PreviousFinacialYear: any;
	emailTemplate: string;
	subject: string;
	from: string;
	footer: string;

	links: any = [];
	user: UserDetails;
	send_bulk_whatsapp: boolean;
	send_bulk_email: boolean;

	showTan: any;


	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure! You want to send ?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Send';
	public cancelText: string = "Don't";
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;

	constructor(private CrudServices: CrudServices, private router: Router, private toasterService: ToasterService, private exportService: ExportService, private datePipe: DatePipe, private loginService: LoginService) {

		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
		this.send_bulk_email = this.links.indexOf("Send Bulk Email Declaration") > -1;
		this.send_bulk_whatsapp = this.links.indexOf("Send Bulk Whatsapp Declaration") > -1;



		this.addformspiplssurisha = new FormGroup({
			'vendor_customer': new FormControl(null),
			'tds_declation_form': new FormControl(null),
			'tally_transfer': new FormControl(null),
			'gst_no': new FormControl(null, [
				Validators.required,
				Validators.pattern("^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[0-9A-Za-z]{3}$"),
			]),
			'remark': new FormControl(null),
			'pan_number': new FormControl(null),
			'org_name': new FormControl(null),
			'turnover_20_21_status': new FormControl(null),
			'roi_18_19_status': new FormControl(null),
			'roi_19_20_status': new FormControl(null),
			'incorporation_date': new FormControl(null, Validators.required),
			'tan_no': new FormControl(null, Validators.required),
		});


		this.currentYear = Number(this.datePipe.transform(this.date, 'yyyy'));
		if (this.datePipe.transform(this.date, 'MM') > '03') {
			this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		} else {
			this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];
		}

		this.fromDate = this.bsRangeValue[0];
		this.todate = this.bsRangeValue[1];


		let PreviousOfPreviousYear = ((new Date()).getFullYear() - 2);
		let PreviousYear = ((new Date()).getFullYear() - 1);
		let CurrentYear = (new Date()).getFullYear();
		// this.PreviousofPreviousFinacialYear = `${PreviousOfPreviousYear}-${PreviousYear}`;
		//this.CurrentYear = `${PreviousYear}-${CurrentYear}`;
		// this.PreviousFinacialYear = `${PreviousOfPreviousYear}-${PreviousYear}`;
		// this.PreviousofPreviousFinacialYear = `${(PreviousOfPreviousYear - 1)}-${(PreviousYear - 1)}`;

		let currentFinacialYearDStartDate = `${CurrentYear}'-04-01'`;
		let currentFinacialYearEndDate = `${(CurrentYear + 1)}'-03-31'`;

		// let PreviousFinacialYearDStartDate = `${PreviousYear}'-04-01'`;
		// let PreviousFinacialYearEndDate = `${(PreviousYear + 1)}'-03-31'`;

		// let PreviousofPreviousFinacialYearDStartDate = `${PreviousOfPreviousYear}'-04-01'`;
		// let PreviousofPreviousFinacialYearEndDate = `${(PreviousOfPreviousYear + 1)}'-03-31'`;
		let TodaysDate = ((new Date()).toISOString()).substring(0, 10);

		if (TodaysDate >= currentFinacialYearDStartDate && TodaysDate <= currentFinacialYearEndDate) {
			this.PreviousFinacialYear = `${PreviousYear}-${CurrentYear}`;
			this.PreviousofPreviousFinacialYear = `${PreviousOfPreviousYear}-${PreviousYear}`;

		} else {
			this.PreviousFinacialYear = `${(PreviousYear - 1)}-${(CurrentYear - 1)}`;
			this.PreviousofPreviousFinacialYear = `${(PreviousOfPreviousYear - 1)}-${(PreviousYear - 1)}`;

		}



	}

	ngOnInit() {
		//this.spiplData();
	}

	spiplData() {
		this.selectedYear = `${Number(this.datePipe.transform(this.fromDate, 'yyyy'))} -${(Number(this.datePipe.transform(this.fromDate, 'yyyy')) + 1)} `;

		this.spipl_list = [];
		this.CrudServices.postRequest<any>(tdsChargesForm.spiplList, {
			from_date: this.fromDate,
			to_date: this.todate
		}).subscribe((response) => {
			for (let val of response) {
				val.company = 1;
				this.spipl_list.push(val);
			}
			// this.spipl_list = response
		});
	}

	ssurishaData() {
		this.ssurisha_list = [];
		this.CrudServices.getAll<any>(ssurishaTDSChargesForm.ssurishaList).subscribe((response) => {
			for (let val of response) {
				val.company = 2;
				this.ssurisha_list.push(val);
			}
			//  this.ssurisha_list = response;
		});
	}
	onChangtab(event) {
		this.checkedList = [];
		this.filteredValuess = [];
		const tab = event.tab.textLabel;
		if (tab === 'SPIPL LIST') {
			this.spiplData();
		}

		if (tab === 'SSURISHA LIST') {
			this.ssurishaData();
		}

	}


	get f() {
		return this.addformspiplssurisha.controls;
	}

	add_spip_ssurisha_form() {

		this.router.navigate(["/add-form-spipl-ssurisha"]);

	}

	declaration(event: any) {
		this.declrForm = <Array<File>>event.target.files;
	}

	getDocsArray(docs: string) {
		return JSON.parse(docs);
	}


	editForm(item) {
		this.myModal.show();
		this.docs = [];

		this.id = item.id;
		this.company = item.company;
		this.addformspiplssurisha.controls.vendor_customer.setValue(item.vendor_customer);
		this.addformspiplssurisha.controls.tally_transfer.setValue(item.tally_transfer);
		this.addformspiplssurisha.controls.remark.setValue(item.remark);
		this.addformspiplssurisha.controls.pan_number.setValue(item.pan_number);
		this.addformspiplssurisha.controls.gst_no.setValue(item.gst_no);
		this.addformspiplssurisha.controls.org_name.setValue(item.org_name);
		this.addformspiplssurisha.controls.turnover_20_21_status.setValue(item.turnover_20_21_status);
		//this.addformspiplssurisha.controls.roi_18_19_status.setValue(item.roi_18_19_status);
		this.addformspiplssurisha.controls.roi_19_20_status.setValue(item.roi_19_20_status);
		this.addformspiplssurisha.controls.tan_no.setValue(item.tan_no);


		if (item.incorporation_date == null) {
			this.defaultDate = '2017-04-01';
		} else {
			this.defaultDate = item.incorporation_date;
		}

		this.addformspiplssurisha.controls.incorporation_date.setValue(this.defaultDate);


		if (item.tds_declation_form) {
			//  this.declrForm = JSON.parse(item.tds_declation_form);
			this.docs = JSON.parse(item.tds_declation_form);
		}

	}

	deleteFile(i) {
		this.docs.splice(i, 1);
	}

	reset() {
		this.docs = [];
		this.id = 0;
		this.company = 0;
		this.addformspiplssurisha.reset();
	}


	onSubmit() {
		if (this.id) {
			if (!this.addformspiplssurisha.invalid) {
				this.tds_declation_form = [];
				let formData = {
					id: this.id,
					data: {
						vendor_customer: this.addformspiplssurisha.value.vendor_customer,
						remark: this.addformspiplssurisha.value.remark,
						pan_number: this.addformspiplssurisha.value.pan_number,
						tally_transfer: this.addformspiplssurisha.value.tally_transfer,
						gst_no: this.addformspiplssurisha.value.gst_no,
						org_name: this.addformspiplssurisha.value.org_name,
						turnover_20_21_status: this.addformspiplssurisha.value.turnover_20_21_status,
						// roi_18_19_status: this.addformspiplssurisha.value.roi_18_19_status,
						roi_19_20_status: this.addformspiplssurisha.value.roi_19_20_status,
						incorporation_date: this.addformspiplssurisha.value.incorporation_date,
						tan_no: this.addformspiplssurisha.value.tan_no,
					}
				};

				const fileData = new FormData();
				const declaration_from: Array<File> = this.declrForm;

				if (declaration_from.length > 0) {
					for (let i = 0; i < declaration_from.length; i++) {
						fileData.append('tds_declation_form', declaration_from[i], declaration_from[i]["name"]);
					}
				}

				this.CrudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {
					let tds_declare = [];
					let tds_declareList = res.uploads.tds_declation_form;
					if (tds_declareList != null) {
						if (tds_declareList.length > 0) {
							for (let i = 0; i < tds_declareList.length; i++) {
								tds_declare.push(tds_declareList[i].location);
							}
							this.tds_declation_form = tds_declare;
							// formData['tds_declation_form'] = JSON.stringify(tds_declare);
						}
					}

					if (this.docs.length > 0) {
						for (let doc of this.docs) {
							this.tds_declation_form.push(doc);

						}
					}

					if (this.tds_declation_form.length > 0) {
						formData.data['tds_declation_form'] = JSON.stringify(this.tds_declation_form);
					}
					if (this.company == 1) {
						this.CrudServices.postRequest<any>(tdsChargesForm.update,
							formData
						).subscribe((response) => {
							this.myModal.hide();
							this.toasterService.pop(response.message, response.message, response.data);
							this.spiplData();
							this.reset();
						});
					} else if (this.company == 2) {
						this.CrudServices.postRequest<any>(ssurishaTDSChargesForm.update,
							formData
						).subscribe((response) => {
							this.myModal.hide();
							this.toasterService.pop(response.message, response.message, response.data);
							this.ssurishaData();
							this.reset();
						});

					}

				});



			}
		}


	}



	exportExcel_spipl() {
		this.export_data = [];
		this.exportData();
		this.exportService.exportExcel(this.export_data, 'SPIPL List');
	}

	exportExcel_ssurisha() {
		this.export_data_ssurisha = [];
		this.exportData_ssurisha();
		this.exportService.exportExcel(this.export_data_ssurisha, 'Ssurisha List');
	}

	exportData_ssurisha() {
		let data = {};
		this.export_data_ssurisha = [];

		for (const val of this.ssurisha_list) {

			data = {
				'Orgnization Name': val.org_name,
				'GST No.': val.gst_no,
				'Pan No.': val.pan_number,
				'Vendor/Customer': val.vendor_customer,
				'Turn Over 20-21': val.turnover_20_21_status,
				'Tan No.': val.tan_no,
				'ROI 18-19': val.roi_18_19_status,
				'ROI 19-20': val.roi_19_20_status,
				'TDS': val.tds,
				'TCS': val.tcs,
				'Remark': val.remark,
				'Transfer To Tally': val.tally_transfer
			};
			this.export_data_ssurisha.push(data);


		}

		const foot = {
			'Orgnization Name': '',
			'GST No.': '',
			'Pan No.': '',
			'Vendor/Customer': '',
			'Turn Over 20-21': '',
			'Tan No': '',
			'ROI 18-19': '',
			'ROI 19-20': '',
			'TDS': '',
			'TCS': '',
			'Remark': '',
			'Transfer To Tally': ''
		};
		this.export_data_ssurisha.push(foot);

	}


	exportData() {
		let data = {};
		this.export_data = [];

		for (const val of this.spipl_list) {

			data = {
				'Orgnization Name': val.org_name,
				'GST No.': val.gst_no,
				'Pan No.': val.pan_number,
				'Vendor/Customer': val.vendor_customer,
				'Turn Over 20-21': val.turnover_20_21_status,
				'Tan No.': val.tan_no,
				'ROI 18-19': val.roi_18_19_status,
				'ROI 19-20': val.roi_19_20_status,
				'TDS': val.tds,
				'TCS': val.tcs,
				'Remark': val.remark,
				'Transfer To Tally': val.tally_transfer
			};
			this.export_data.push(data);


		}

		const foot = {
			'Orgnization Name': '',
			'GST No.': '',
			'Pan No.': '',
			'Vendor/Customer': '',
			'Turn Over 20-21': '',
			'Tan No.': '',
			'ROI 18-19': '',
			'ROI 19-20': '',
			'TDS': '',
			'TCS': '',
			'Remark': '',
			'Transfer To Tally': ''
		};
		this.export_data.push(foot);
	}



	onCheckAll(checked) {
		let arr = [];

		if (this.filteredValuess.length > 0) {
			arr = this.filteredValuess
		} else {
			arr = this.spipl_list;
		}


		if (checked) {
			this.inputs.forEach(check => {
				check.nativeElement.checked = true;
			});
			for (const val of arr) {
				// this.item.push(val);
				this.onChange(true, val);
			}

		} else {
			this.inputs.forEach(check => {
				check.nativeElement.checked = false;
			});
			for (const val of arr) {
				// this.item.splice(this.item.indexOf(val), 1);
				this.onChange(false, val);
			}
		}

		// this.onChange(true, this.item);



	}

	onCheckAllSurish(checked) {
		let arr = [];

		if (this.filteredValuess.length > 0) {
			arr = this.filteredValuess
		} else {
			arr = this.ssurisha_list;
		}


		if (checked) {
			this.inputs.forEach(check => {
				check.nativeElement.checked = true;
			});
			for (const val of arr) {
				// this.item.push(val);
				this.onChange(true, val);
			}

		} else {
			this.inputs.forEach(check => {
				check.nativeElement.checked = false;
			});
			for (const val of arr) {
				// this.item.splice(this.item.indexOf(val), 1);
				this.onChange(false, val);
			}
		}

		// this.onChange(true, this.item);



	}

	onChange(checked, item) {

		if (checked) {
			this.checkedList.push(item);

		} else {
			this.checkedList.splice(this.checkedList.indexOf(item), 1);

		}
	}

	updateEmail(event, company, id) {
		if (event) {
			if (company == 1) {
				this.CrudServices.updateData<any>(tdsChargesForm.update_email, { email_id: event.target.value, id: id }).subscribe(response => {

					if (response.code == 100) {
						this.toasterService.pop(response.message, response.message, response.data);
					}
				})
			} else if (company == 2) {
				this.CrudServices.updateData<any>(ssurishaTDSChargesForm.update, { data: { email_id: event.target.value }, id: id }).subscribe(response => {
					if (response.code == 100) {
						this.toasterService.pop(response.message, response.message, response.data);
					}
				})
			}
		}
	}

	sendMail() {
		if (this.checkedList.length > 0) {

			this.composeMail();

		} else {
			this.toasterService.pop('warning', 'warning', 'Please Select Record');
		}
	}


	composeMail() {
		let arr = [];
		let html = '';
		let to = '';
		let subject = '';
		for (let check of this.checkedList) {

			if (check.email_id) {
				arr.push({
					created_date: this.datePipe.transform(check.created_date, 'dd-MM-yyyy'),
					email: check.email_id,
					gst_no: check.gst_no,
					pan_no: check.pan_number,
					tds: check.tds,
					tcs: check.tcs,
					company: check.company
				})

			}

		}

		if (arr.length) {


			this.CrudServices.postRequest<any>(tdsChargesForm.sendMail, { mail_object: arr }).subscribe(response => {
				this.toasterService.pop(response.message, response.message, response.data);
				this.uncheckAll();

				// this.closeModal();
			})
		} else {
			this.toasterService.pop('warning', 'warning', ' Records Not Contain Email Id');

		}
	}

	uncheckAll() {
		this.checkedList = [];
		this.inputs.forEach(check => {
			check.nativeElement.checked = false;
		});
	}


	// on your component class declare
	onFilter(event, dt) {


		this.filteredValuess = [];

		this.filteredValuess = event.filteredValue;




	}






	// getValue(val)
	// {
	//   if(val == 'yes')
	//   {
	//       return "Transferred";
	//   }else if(val == 'no')
	//   {
	//      return "Not Transferred";
	//   }else
	//   {
	//     return "Not Transferred";
	//   }
	// }



	onSelect($e) {
		this.fromDate = this.convert($e[0]);
		this.todate = this.convert($e[1]);

		this.spiplData();

	}

	convert(date) {
		if (date) {
			return this.datePipe.transform(date, 'yyyy-MM-dd');
		} else {
			return '';
		}
	}

	sendEmailBulk() {

		this.emailTemplate = '';
		this.subject = '';
		this.from = '';
		this.footer = '';

		let res1 = this.CrudServices.getRequest<any>(tdsChargesForm.getEmailCustomers);
		let res2 = this.CrudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'TDS/TCS Email Template' });
		let res3 = this.CrudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' });
		let res4 = this.CrudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Surisha Footer' });
		forkJoin([res1, res2, res3, res4]).subscribe(([data1, data2, data3, data4]) => {

			let spipl_list = data1.filter(item => item.product_type == 1);
			let pepp_list = data1.filter(item => item.product_type == 2);
			let ssurisha_list = data1.filter(item => item.product_type == 3);

			let EmailListSpipl = [];
			let EmailListpepp = [];
			let EmailListSsurisha = [];

			if (spipl_list.length) {
				EmailListSpipl = spipl_list.map(value => value.email_id.trim());
			}

			if (ssurisha_list.length) {
				EmailListSsurisha = ssurisha_list.map(value => value.email_id.trim());
			}

			if (pepp_list.length) {
				EmailListpepp = pepp_list.map(value => value.email_id.trim());
			}

			//  EmailListSpipl = data1.map(value => value.email_id);

			//let SpiplEmail = this.getChunks(EmailListSpipl);
			let perChunk = 50 // items per chunk   
			var SpiplEmail = EmailListSpipl.reduce((resultArray, item, index) => {
				const chunkIndex = Math.floor(index / perChunk)

				if (!resultArray[chunkIndex]) {
					resultArray[chunkIndex] = [] // start a new chunk
				}

				resultArray[chunkIndex].push(item)

				return resultArray
			}, [])

			let SSurishaEmail = EmailListSsurisha.reduce((resultArray, item, index) => {
				const chunkIndex = Math.floor(index / perChunk)

				if (!resultArray[chunkIndex]) {
					resultArray[chunkIndex] = [] // start a new chunk
				}

				resultArray[chunkIndex].push(item)

				return resultArray
			}, [])

			let peppEmail = EmailListpepp.reduce((resultArray, item, index) => {
				const chunkIndex = Math.floor(index / perChunk)

				if (!resultArray[chunkIndex]) {
					resultArray[chunkIndex] = [] // start a new chunk
				}

				resultArray[chunkIndex].push(item)

				return resultArray
			}, [])

			this.emailTemplate = data2[0].custom_html;
			this.subject = data2[0].subject;
			this.from = data2[0].from_name;
			this.footer = data3[0].custom_html;
			let footer_surisha = data4[0].custom_html;

			let html = this.emailTemplate + this.footer;
			let html_surisha = this.emailTemplate + footer_surisha;





			if (SpiplEmail.length) {
				this.toasterService.pop('success', 'Email  Notification !', 'Email Send To All Customers of SPIPL!')
				for (let email of SpiplEmail) {
					let to = 'parmar@parmarglobal.com';
					let bcc = email.toString();

					let arr = { 'from': this.from, 'to': to, 'bcc': bcc, 'subject': this.subject, 'html': html };


					this.CrudServices.postRequest<any>(tdsChargesForm.send_bulk_mail, { mail_object: arr }).subscribe(response => {

						this.toasterService.pop(response.message, response.message, response.data);

					})

				}


			}


			if (SSurishaEmail.length) {
				this.toasterService.pop('success', 'Email  Notification !', 'Email Send To All Customers of SSurisha!')
				for (let email of SSurishaEmail) {
					let to = 'surisha@parmarglobal.com';
					let bcc = email.toString();//

					let arr = { 'from': this.from, 'to': to, 'bcc': bcc, 'subject': this.subject, 'html': html_surisha };



					this.CrudServices.postRequest<any>(tdsChargesForm.send_bulk_mail_ssurisha, { mail_object: arr }).subscribe(response => {

						this.toasterService.pop(response.message, response.message, response.data);

					})

				}


			}

			if (peppEmail.length) {
				this.toasterService.pop('success', 'Email  Notification !', 'Email Send To All Customers of SSurisha!')
				for (let email of peppEmail) {
					let to = 'spipl@parmarglobal.com';
					let bcc = email.toString();//

					let arr = { 'from': this.from, 'to': to, 'bcc': bcc, 'subject': this.subject, 'html': html };


					this.CrudServices.postRequest<any>(tdsChargesForm.send_bulk_mail_pepp, { mail_object: arr }).subscribe(response => {

						this.toasterService.pop(response.message, response.message, response.data);

					})

				}

			}







		});
	}




	sendWhatsApp() {

		this.CrudServices.getRequest<any>(tdsChargesForm.getContactCustomers).subscribe(response => {

			var contactList = response.map(value => value.contact_no);

			var perChunk = 50 // items per chunk    



			var contactArray = contactList.reduce((resultArray, item, index) => {
				const chunkIndex = Math.floor(index / perChunk)

				if (!resultArray[chunkIndex]) {
					resultArray[chunkIndex] = [] // start a new chunk
				}

				resultArray[chunkIndex].push(item)

				return resultArray
			}, [])

			if (contactArray.length) {
				this.toasterService.pop('success', 'WhatsApp  Notification !', 'WhatsApp Send To All Customers!')
				for (let contact of contactArray) {

					let link = `https://erp.sparmarglobal.com:8085/#/tdsform`;
					//let sendHeads = [link];

					this.CrudServices.postRequest<any>(tdsChargesForm.sendWhatsapp, [{
						"template_name": 'tds_tcs_2022',
						"locale": "en",
						"numbers": contact,
						"params": []

					}]).subscribe(res => {


					})

				}
			}


		})





	}


	CheckTurnOver($event) {
		if ($event.target.value == 'yes') {
			this.showTan = true;
		} else if ($event.target.value == 'no') {
			this.showTan = false;
		} else {
			this.showTan = false;
		}
	}
}
