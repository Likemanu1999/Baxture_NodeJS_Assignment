import { Component, OnInit, ViewEncapsulation, ViewChildren, ElementRef, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { containerDetails, EmailTemplateMaster, FileUpload, NonNegotiable, StateMaster } from '../../../shared/apis-path/apis-path';
import { ActivatedRoute, Params, Router } from '@angular/router';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ModalDirective } from 'ngx-bootstrap';
import { UserDetails } from '../../login/UserDetails.model';
import { ExportService } from '../../../shared/export-service/export-service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
	selector: 'app-delivery-challan',
	templateUrl: './delivery-challan.component.html',
	styleUrls: ['./delivery-challan.component.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		CrudServices,
		ExportService
	]
})
export class DeliveryChallanComponent implements OnInit {
	@ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];
	@ViewChild('myModalCoaMail', { static: false }) public myModalCoaMail: ModalDirective;
	public popoverTitle: string = 'Warning';
	public popoverMessage: string = 'Are you sure, you want to Change?';
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = 'Yes';
	public cancelText: string = 'No';
	public placement: string = 'left';
	public closeOnOutsideClick: boolean = true;


	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	non_id: number;
	cols: { field: string; header: string; style: string; }[];
	cols2: { field: string; header: string; style: string; }[];
	containerDetails=[];
	bl_invoice: string;
	be_invoice: string;
	non_invoice: any;
	ewayDocs: Array<File> = [];
	isLoading: boolean;
	checkedList = [];
	generate_pdf: boolean;
	challanPdf: any;
	bccText: string;
	ccText: string;
	be_date: string;
	mailArr = [];
	coaTemplate: string;
	subject: string;
	from: string;
	footer: string;
	pdfDataBase64 = [];

	user: UserDetails;
	links: string[] = [];
	challan_mail: boolean;
	generate_delivery_challan: boolean;
	tomail = [];
	ccMail =[];
	email = [];
	isLoadingMail: boolean;
	port_name: any;
	countChallan = 0;
	exportColumns: { title: string; dataKey: string; }[];
	export_list: any;


	constructor(private route: ActivatedRoute, private router: Router, private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe, private crudServices: CrudServices, private exportService: ExportService,) {


		const perms = this.permissionService.getPermission();

		this.user = this.loginService.getUserDetails();
		this.links = this.user.links;
				
		this.challan_mail = (this.links.indexOf('Delivery Challan Mail') > -1);
		this.generate_delivery_challan = (this.links.indexOf('Generate Delivery Challan') > -1);


		this.cols = [
			{ field: 'ewaybill_no', header: 'E-Way Bill Number', style: '100' },
			{ field: 'container_number', header: 'Container Number', style: '100' },
			{ field: 'delivery_challen_no', header: 'Delivery Challan ', style: '100' },
			{ field: 'delivery_challen_dt', header: 'Delivery Challan Date', style: '100' },
			{ field: 'ewaybill_path', header: 'Upload E-way Bill', style: '150' },


		];

		this.cols2 = [
			{ field: 'ewaybill_no', header: 'E-Way Bill Number', style: '100' },
			{ field: 'container_number', header: 'Container Number', style: '100' },
			{ field: 'delivery_challen_no', header: 'Delivery Challan ', style: '100' },
			{ field: 'delivery_challen_dt', header: 'Delivery Challan Date', style: '100' },
			

		];
	
	}

	ngOnInit() {

		this.route.params.subscribe((params: Params) => {
			this.non_id = +params['id'];
		});
	

		this.getNonDetail();
		 this.getCount();
	
	}

	getCount() {
		this.crudServices.getAll<any>(NonNegotiable.getCountofDelChallanNo).subscribe(response => {
			if(response != null) {
				this.countChallan = response.count;
				console.log(response, 'COUNT CONTAINER');	
			}
		})
	}


	getNonDetail() {
		this.isLoading = true;
		this.crudServices.getOne<any>(NonNegotiable.getMaterialArrivalDet, { n_id: this.non_id }).subscribe(response => {
			console.log(response);

			this.isLoading = false;
			let be_invoices = '';
			let bl_invoices = '';
			let be_date = '';
			for (let element of response) {

				let be_copy = [];
				if (element.bill_of_entries != null) {
					for (let val of element.bill_of_entries) {
						if (val.deleted == 0) {
							be_invoices = be_invoices + val.be_no + ' ';
							be_date = be_date + this.datepipe.transform(val.be_dt, 'dd-MM-yyyy') + ' ';
							if (val.be_copy) {
								for (let doc of JSON.parse(val.be_copy)) {
									be_copy.push(doc)
								}
							}
						}
					}
				}

				if (element.bill_of_ladings != null) {
					for (let val of element.bill_of_ladings) {
						if (val.deleted == 0) {
							bl_invoices = bl_invoices + val.bill_lading_no + ' ';


						}

					}
				}






			}

			this.bl_invoice = bl_invoices;
			this.be_invoice = be_invoices;
			this.be_date = be_date;
			this.non_invoice = response[0].invoice_no;

			this.port_name = response[0].port_master != null ? response[0].port_master.port_name : null;


			this.containerDetails = [];
			if (response[0].bill_of_ladings.length > 0) {
				for (let bl of response[0].bill_of_ladings) {
					if (bl.container_details.length > 0) {
						for (let container of bl.container_details) {
							if (container.godown) {
								let str = container.godown.gst_no;
								var res = str.substring(0, 2);
								container.godown_state_code = res;
								this.crudServices.getOne<any>(StateMaster.getStateNameStateCode, { tin: res }).subscribe(res => {
                                   if(res.length) {
									container.godown_state = res[0].name;
								   }
								



								})

							}



							if (response[0].port_master) {
								let str = response[0].port_master.gst_no;
								var res = str.substring(0, 2);

								container.port_state_code = res;
								this.crudServices.getOne<any>(StateMaster.getStateNameStateCode, { state_code: res }).subscribe(res => {

									if( res.length) {
										container.port_state = res[0].name;
									}

									
								})

							}

							container.port_master = response[0].port_master;
							container.product_master = response[0].grade_master.main_grade.product_master;
							container.be_number = be_invoices;
							console.log(container);
							this.containerDetails.push(container);
						}
					}
				}
			}

			const  sorter = (a, b) => {
				return a.id - b.id;
			 };
			const  sortByID = arr => {
				arr.sort(sorter);
			 };

			 sortByID(this.containerDetails);





		})
	}



	updateContainer(event, id, val) {
		if (event) {

			if (val == 1) {
				this.crudServices.updateData<any>(containerDetails.updateFiles, { ewaybill_no: event.target.value, id: id }).subscribe(response => {
					if (response.code == 100) {
						this.toasterService.pop(response.message, response.message, response.data);
						this.getNonDetail();
					} else {
						this.toasterService.pop(response.message, response.message, 'something Went Wrong');
						this.getNonDetail();
					}

				})
			}

			if (val == 2) {

				this.crudServices.updateData<any>(containerDetails.updateFiles, { delivery_challen_dt: this.datepipe.transform(event, 'yyyy-MM-dd'), id: id }).subscribe(response => {
					if (response.code == 100) {
						this.toasterService.pop(response.message, response.message, response.data);
						this.getNonDetail();
					} else {
						this.toasterService.pop(response.message, response.message, 'something Went Wrong');
						this.getNonDetail();
					}

				})
			}

		}
	}

	onBack() {
		this.router.navigate(['logistics/material-arrival-chart']);
	}

	getDocArray(val) {
		return JSON.parse(val);
	}

	addEwayCopy(event: any) {
		this.ewayDocs = <Array<File>>event.target.files;

	}

	uploadDocs(id) {

		let fileData: any = new FormData();
		const document1: Array<File> = this.ewayDocs;
		if (document1.length > 0) {
			for (let i = 0; i < document1.length; i++) {
				fileData.append('logistics_eway_bill_copy', document1[i], document1[i]['name']);
			}
		}



		this.crudServices.fileUpload(FileUpload.upload, fileData).subscribe(res => {


			let fileDealDocs1 = [];
			let filesList1 = [];
			let data = {};

			if (res.uploads.logistics_eway_bill_copy) {
				filesList1 = res.uploads.logistics_eway_bill_copy;
				for (let i = 0; i < filesList1.length; i++) {
					fileDealDocs1.push(filesList1[i].location);
				}
				data['ewaybill_path'] = JSON.stringify(fileDealDocs1);

			}

			if (data['ewaybill_path']) {
				data['id'] = id;


				this.crudServices.updateData<any>(containerDetails.updateFiles, data).subscribe(response => {
					if (response.code == 100) {
						this.toasterService.pop(response.message, response.message, response.data);
						this.getNonDetail();
					} else {
						this.toasterService.pop(response.message, response.message, 'Something Went Wrong');
						this.getNonDetail();
					}
				})

			} else {
				this.toasterService.pop('warning', 'warning', 'No File Uloaded');
			}

		});
	}


	// when checkbox change, add/remove the item from the array
	onChange(checked, item) {

		

		if (checked) {
			this.checkedList.push(item);

		} else {
			this.checkedList.splice(this.checkedList.indexOf(item), 1);

		}

		console.log(this.checkedList);



	}


	onCheckAll(checked) {
		let arr = [];
		arr = this.containerDetails;

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

	uncheckAll() {
		this.checkedList = [];
		this.mailArr = [];
		this.inputs.forEach(check => {
		  check.nativeElement.checked = false;
		});
	  }

	generateChallan() {
		if (this.checkedList.length > 0) {
			let updateChallan = [];
			let date = new Date();
			let month_day = this.datepipe.transform(date, 'MM-dd');
			let year_start;
			let year_end;
			let challan_no;
			let series = this.countChallan + 10000 ;
			for (let val of this.checkedList) {


				if (val.godown && val.be_number && val.delivery_challen_no == null) {
					 series = Number(series) + 1;

					if (month_day >= "01-01" && month_day <= "03-31") {
						const year = this.datepipe.transform(date, 'yy');
						year_start = Number(year) - 1;
						challan_no =   year + year_start + val.port_master.abbr + series;
					}
					else {
						const year = this.datepipe.transform(date, 'yy');
						year_start = Number(year) + 1;
						challan_no = year + year_start  + val.port_master.abbr + series;
					}
					console.log(challan_no);
					updateChallan.push({
						id: val.id,
						delivery_challen_dt: this.datepipe.transform(date, 'yyyy-MM-dd'),
						delivery_challen_no: challan_no
					})
				}


			}


			this.crudServices.updateData<any>(containerDetails.updateChallanDetails, updateChallan).subscribe(response => {
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.message, response.data);
					this.checkedList = [];
					this.onCheckAll(false);
					this.getNonDetail();
					this.getCount();
				} else {
					this.toasterService.pop(response.message, response.message, 'something went wrong!!');
				}

			})

		} else {
			this.toasterService.pop('warning', 'warning', 'No Record Selected');
		}
	}

	sendMail() {
		if (this.checkedList.length > 0) {

			let email = this.checkedList[0].port_master!= null? this.checkedList[0].port_master.email_delivery : null;

		if(email != null) {
			this.email = email.split(/[,;]/);
		}
			this.mailArr = [];
			for (let val of this.checkedList) {
				this.mailArr.push({
					bl_no: this.bl_invoice,
					be_dt: this.be_date,
					be_no: val.be_number,
					eway_bill_no: val.ewaybill_no,
					eway_doc: val.ewaybill_path,
					delivery_challen_no: val.delivery_challen_no,
					container_number : val.container_number,
					item: val
				})
			}
			this.getTemplate();
			this.getpdf();
			this.myModalCoaMail.show();
		} else {
			this.toasterService.pop('warning', 'warning', 'No Record Selected');
		}
	}

	oncloseCoaMail() {

	
		this.checkedList = [];
		this.tomail = [];
		this.ccMail = [];
		this.ccText = '';
		this.bccText = '';
		this.uncheckAll();
		this.myModalCoaMail.hide();

	}

	mailto(check, val) {
		// console.log(check);
		this.ccText = '';
		if (check) {
		  this.tomail.push(val);
		} else {
		  this.tomail.splice(this.tomail.indexOf(val), 1);
		}
	
		for (let i = 0; i < this.tomail.length; i++) {
		  this.ccText = this.ccText + this.tomail[i] + ',';
		}
		// console.log(this.tomail);
	  }

	  ccmail(check, val) {
		// console.log(check);
		this.bccText = '';
		if (check) {
		  this.ccMail.push(val);
		} else {
		  this.ccMail.splice(this.ccMail.indexOf(val), 1);
		}
	
		// console.log( this.ccMail);
		for (let i = 0; i < this.ccMail.length; i++) {
		  this.bccText = this.bccText + this.ccMail[i] + ',';
		}
	
	  }

	  ccmailvalue($e) {
		this.bccText = $e.target.value;
		//  console.log(this.ccmailtext);
	  }
	
	  tomailvalue($e) {
		this.ccText = $e.target.value;
		// console.log(this.tomailtext);
	  }


	downloadPdf(item) {
		this.generate_pdf = true;
		console.log(item);


		this.challanPdf = item;
	}







	emitPdf(event) {
		this.generate_pdf = event;
		this.challanPdf = {};
		this.getNonDetail();
	}

	sendMailEway() {
		if (this.checkedList.length > 0) {

			if (this.ccText != null && this.ccText != undefined && this.ccText != '') {
				let ccText = [];
				let bccText = [];
				let attachment = [];
				let html = '';
				let pdf = '';
				if (this.ccText) {
					ccText = this.ccText.split(";");
				}

				if (this.bccText) {
					bccText = this.bccText.split(";");
				}

				html = html + '<table id="table" ><tr><th>Sr.No</th><th>Bill of Lading No. </th><th>Container No</th><th>Bill of Entry No and Date </th><th >E-Way Bill Number </th></tr>';
				let pdfArr = [];

				for (let i = 0; i < this.mailArr.length; i++) {

					html = html + '<tr>';
					html = html + '<td>' + Number(i + 1) + '</td><td>' + this.mailArr[i]['bl_no']  + '</td><td>' + this.mailArr[i]['container_number'] + '</td><td>' + this.mailArr[i]['be_no']+ '\n'+ this.mailArr[i]['be_dt'] + '</td><td>' + this.mailArr[i]['eway_bill_no'] + '</td>';
					html = html + '</tr>';

					// if (this.mailArr[i]['eway_doc']) {
					// 	const files = JSON.parse(this.mailArr[i]['eway_doc']);
					// 	for (let j = 0; j < files.length; j++) {
					// 		const test = files[j].split('/');

					// 		attachment.push({ 'filename': test[4], 'path': files[j] });
					// 	}
					// }

					pdf = this.mailArr[i]['item'];
					
					


				}
				html = html + '</table> ';


			




				// html = this.coaTemplate + this.footer;

				let html2 = '';
				const re2 = /{TABLE}/gi;
				html2 = this.coaTemplate.replace(re2, html);
				html2 = html2 + this.footer;

				console.log(pdfArr);


				let arr = { 'from': this.from, 'to': ccText, 'cc': bccText, 'subject': this.subject, 'html': html2, 'attachments': attachment };

                 this.isLoadingMail = true;
				this.crudServices.postRequest<any>(containerDetails.sendEmailDeliveryChallan, { mail_object: arr, pdf: this.pdfDataBase64 ,data: this.checkedList}).subscribe(response => {
					this.isLoadingMail = false;
					this.toasterService.pop(response.message, response.message, response.data);
					this.oncloseCoaMail();
					this.getNonDetail();
				})



			} else {
				this.toasterService.pop('warning', 'warning', 'Enter Email Address ');
			}
		}
	}

	getTemplate() {
		this.coaTemplate = '';
		this.subject = '';
		this.from = '';
		this.footer = '';
		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Delivery Challan' }).subscribe(response => {

			this.coaTemplate = response[0].custom_html;
			this.subject = response[0].subject;
			this.from = response[0].from_name;
			console.log(this.coaTemplate);


			const re = /{BE_NO}/gi;

			this.subject = this.subject.replace(re, this.be_invoice);

		})

		this.crudServices.getOne<any>(EmailTemplateMaster.getOne, { template_name: 'Footer' }).subscribe(response => {
			this.footer = response[0].custom_html;

		})
	}



	async getpdf() {


		this.pdfDataBase64 = [];
		for (let details of this.mailArr) {
			let val = details.item;
			let signArr = [];
			let signature = 'assets/img/blank.png';

			if (val.godown.godown_incharge_sign) {
				signArr = JSON.parse(val.godown.godown_incharge_sign);
				if (signArr.length) {
					signature = signArr[0];
				}
			}

			let g_state_code = '';
			let port_state_code = '';
			let godown_state = '';
			let port_state = '';

			if (val.godown_state_code) {
				g_state_code = val.godown_state_code
			}

			if (val.port_state_code) {
				port_state_code = val.port_state_code
			}

			if (val.godown_state) {
				godown_state = val.godown_state
			}


			if (val.port_state) {
				port_state = val.port_state
			}


			var documentDefinition = {

				pageSize: 'B3',
				// pageOrientation: 'landscape',

				// [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
				pageMargins: [70, 40, 40, 60],
				content: [

					{ text: 'ORIGINAL FOR CONSIGNEE', style: 'subheader', fontSize: 10, alignment: 'right' },
					{
						style: 'tableExample',
						color: '#444',
						headerRows: 2,
						widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
						table: {

							// keepWithHeaderRows: 1,
							body: [
								[
									{
										text: [
											{ text: 'Delivery Challan ', fontSize: '16', bold: true, alignment: 'center', },
											{ text: '\n ', fontSize: 12, },
											{ text: '\n ', fontSize: 12, },
										],

										border: [true, true, true, false],
										colSpan: 16,
									}, {}, {}, {}, {}, {},
									{}, {}, {}, {}, {}, {}, {}, {}, {}, {},

								],

								[
									{
										text: [
											{ text: 'Delivery challan no. :  ' + val.delivery_challen_no, fontSize: '12', bold: true, alignment: 'right', },
											{ text: '\n Delivery challan Date. : ' + this.datepipe.transform(val.delivery_challen_dt, 'dd-MM-yyyy'), fontSize: '12', bold: true, alignment: 'right', },
											{ text: '\n ', fontSize: 12, },

										],

										border: [true, false, true, true],
										colSpan: 16,
									}, {}, {}, {}, {}, {},
									{}, {}, {}, {}, {}, {}, {}, {}, {}, {},

								],
								[
									{
										text: [
											{ text: 'Consigner Details: Sushila Parmar International Pvt Ltd', fontSize: '12' },
											{ text: '\n Name : ' + val.port_master.port_full_name, fontSize: 12, },
											{ text: '\n Address : ' + val.port_master.port_address, fontSize: 12, },
											{ text: '\n State : ' + port_state, fontSize: 12, },
											{ text: '\n State Code: ' + port_state_code, fontSize: 12, },
											{ text: '\n GSTN/UIN: ' + val.port_master.gst_no, fontSize: 12, },
											{ text: '\n BE No: ' + val.be_number, fontSize: 12, },

										],

										border: [true, true, false, false],
										colSpan: 8,
									}, {}, {}, {}, {}, {}, {}, {},
									{
										text: [
											{ text: 'Consignee Details: Sushila Parmar International Pvt Ltd', fontSize: '12' },
											{ text: '\n Name : ' + val.godown.godown_name, fontSize: 12, },
											{ text: '\n Address : ' + val.godown.godown_address, fontSize: 12, },
											{ text: '\n State :' + godown_state, fontSize: 12, },
											{ text: '\n State Code: ' + g_state_code, fontSize: 12, },
											{ text: '\n GSTN/UIN: ' + val.godown.gst_no, fontSize: 12, },
											{ text: '\n ', fontSize: 12, },
											{ text: '\n ', fontSize: 12, },
											{ text: '\n Place of Supply (in case of interstate movement)', fontSize: 12, },
											{ text: '\n State : ' + godown_state, fontSize: 12, },
											{ text: '\n State Code: ' + + g_state_code, fontSize: 12, },
											{ text: '\n ', fontSize: 12, },
											{ text: '\n ', fontSize: 12, },


										],

										border: [false, true, true, false],
										colSpan: 8,
										alignment: 'left'
									}, {}, {}, {}, {}, {}, {}, {},

								],

								[
									{
										text: 'sr no.',
										fontSize: 12,
										bold: true,
										rowSpan: 2,
										style: "header",
										alignment: 'left',

									},
									{
										text: 'Description of goods',
										fontSize: 12,
										bold: true,
										rowSpan: 2,
										style: "header",
										alignment: 'center',


									},
									{
										text: 'HSN/SAC Code',
										fontSize: 11,
										bold: true,
										rowSpan: 2,
										style: "header",
										alignment: 'left',

									},
									{
										text: 'Quantity',
										fontSize: 11,
										bold: true,
										rowSpan: 2,
										style: "header",
										alignment: 'center'

									},
									{
										text: 'Unit',
										fontSize: 11,
										bold: true,
										rowSpan: 2,
										style: "header",
										alignment: 'center',

									},
									{
										text: 'Rate',
										fontSize: 11,
										bold: true,
										rowSpan: 2,
										style: "header",
										alignment: 'center',

									},
									{
										text: 'Taxable Value',
										fontSize: 11,
										bold: true,
										rowSpan: 2,
										style: "header",
										alignment: 'center',

									},
									{
										text: 'EGST/UGST',
										fontSize: 11,
										bold: true,
										colSpan: 2,
										alignment: 'center',



									}, {},
									{
										text: 'SGST ',
										fontSize: 11,
										bold: true,
										colSpan: 2,
										style: "header",
										alignment: 'center',

									}, {},
									{
										text: 'IGST ',
										fontSize: 11,
										bold: true,
										colSpan: 2,
										style: "header",
										alignment: 'center',

									}, {},
									{
										text: 'CESS ',
										fontSize: 11,
										bold: true,
										colSpan: 2,
										style: "header",
										alignment: 'center',

									},
									{},
									{

										text: 'Total Val ',
										fontSize: 11,
										bold: true,
										rowSpan: 2,
										style: "header",
										alignment: 'center',

									},


								],
								[{}, {}, {}, {}, {}, {}, {}, { text: 'Rate', fontSize: 11 }, { text: 'Amount', fontSize: 11 }, { text: 'Rate', fontSize: 11 }, { text: 'Amount', fontSize: 11 }, { text: 'Rate', fontSize: 11 }, { text: 'Amount', fontSize: 11 }, { text: 'Rate', fontSize: 11 }, { text: 'Amount', fontSize: 11 }, {}
								],
								[{ text: '1', fontSize: 11 }, { text: val.product_master.desc_goods, fontSize: 11, alignment: 'center' }, { text: val.product_master.hsn_code, fontSize: 11, alignment: 'center' }, { text: (val.net_wt).toFixed(2), fontSize: 11, alignment: 'center' }, { text: 'MT', fontSize: 11, alignment: 'center' }, { text: (val.acs_val_per_cntr / (val.net_wt)).toFixed(2), fontSize: 11, alignment: 'center' }, { text: (val.net_wt * (val.acs_val_per_cntr / (val.net_wt))).toFixed(2), fontSize: 11, alignment: 'center' }, { text: '-', fontSize: 11, alignment: 'center' }, { text: '-', fontSize: 11 }, { text: '-', fontSize: 11 }, { text: '-', fontSize: 11 }, { text: 0.18, fontSize: 11 }, { text: (val.acs_val_per_cntr * 0.18).toFixed(2), fontSize: 11 }, { text: '-', fontSize: 11 }, { text: '-', fontSize: 11 }, { text: (val.acs_val_per_cntr + (val.acs_val_per_cntr * 0.18)).toFixed(2) }
								],

								[
									{
										text: [
											{ text: '\n ', fontSize: 12, },
											{ text: 'Declaration Terms and Condition', fontSize: '12' },


										],

										border: [true, true, false, false],
										colSpan: 8,
									}, {}, {}, {}, {}, {}, {}, {},
									{


										// image: await this.getBase64ImageFromURL(
										// 	'assets/img/brand/parmar_logo.png'
										// ),

										image: await this.getBase64ImageFromURL(
											signature
										),



										width: 100,
										height: 40,



										border: [false, true, true, false],
										colSpan: 8,
										alignment: 'left'
									}, {}, {}, {}, {}, {}, {}, {},

								],


								[
									{
										text: [

											{ text: '\n ', fontSize: 12, },
											{ text: '\n Certified that the perticular given above are true and correct', fontSize: 12, },


										],

										border: [true, false, false, true],
										colSpan: 8,
									}, {}, {}, {}, {}, {}, {}, {},
									{



										//border: [true, true, false, true],
										text: [


											{ text: '\n' + val.godown.godown_incharge_name, fontSize: 12, },
											{ text: '\n Godown Incharge ', fontSize: 12, },



										],

										border: [false, false, true, true],
										colSpan: 8,
										alignment: 'left'
									}, {}, {}, {}, {}, {}, {}, {},

								],

							],

						}
					},
				],

				styles: {
					header: {
						fontSize: 18,
						bold: true,
						margin: [0, 0, 0, 10]
					},
					tableExample: {
						margin: [20, 8, 0, 20]
					},
					tableHeader: {
						bold: true,
						fontSize: 13,
						color: 'black'
					}
				}
			};
			const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
			const file_name = val.delivery_challen_no + '.pdf';
			let dataVal = '';
			pdfDocGenerator.getBase64((data) => {
				dataVal = data;
				
				this.pdfDataBase64.push({dataVal : dataVal , file_name : file_name});

				//this.pdfDataBase64.push(dataVal );

			});
			


		}


	}

	

	getData() {
		console.log(this.pdfDataBase64);

	}


	getBase64ImageFromURL(url) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			// img.setAttribute('crossOrigin', 'anonymous');

			img.crossOrigin = "Anonymous";

			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;

				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0);

				const dataURL = canvas.toDataURL('image/png');

				resolve(dataURL);
			};

			img.onerror = error => {
				reject(error);
			};

			img.src = url;
		});
	}

		// data exported for pdf excel download
		exportData() {

			let arr = [];
			const foot = {};
			
	
		
				arr = this.containerDetails;
			
	
		
			//  console.log(this.non_list);
			for (let i = 0; i < arr.length; i++) {
				const export_data = {};
				for (let j = 0; j < this.cols2.length; j++) {
					if( this.cols2[j]['field'] == 'delivery_challen_dt') {
						export_data[this.cols2[j]['header']] = arr[i][this.cols2[j]['field']]? this.datepipe.transform(arr[i][this.cols2[j]['field']] , 'dd/MM/yyyy') : '';
					}else {
						export_data[this.cols2[j]['header']] = arr[i][this.cols2[j]['field']];
					}
					
						
				
				}
				this.export_list.push(export_data);
	
	
			}
	
		
	
	
		}
	// download doc ,pdf , excel

	exportPdf() {
		this.export_list = [];
		this.exportData();
		let text = ` Delivery Challan For ${this.non_invoice} ( BL Number : ${this.bl_invoice} 
            ,  BE Number : ${this.be_invoice} , Port : ${this.port_name}`
		this.exportColumns = this.cols2.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdfText(this.exportColumns, this.export_list, 'Eway-Bill' , text);
	}

	exportExcel() {
		this.export_list = [];
		this.exportData();
		
	   this.exportService.exportExcel(this.export_list, 'Container-List');
	}



}
