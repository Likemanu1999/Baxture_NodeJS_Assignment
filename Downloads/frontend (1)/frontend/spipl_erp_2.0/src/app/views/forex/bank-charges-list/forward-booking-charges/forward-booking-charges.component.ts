import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { ModalDirective } from 'ngx-bootstrap';
import { Table } from 'primeng/table';
import { forwardBookingCharges, ValueStore, bankChargesList } from '../../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { ExportService } from '../../../../shared/export-service/export-service';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../../login/login.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { insertToArray, searchInArray } from '../../../../shared/common-service/common-service';
import { UserDetails } from '../../../login/UserDetails.model';
import * as moment from 'moment';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-forward-booking-charges',
	templateUrl: './forward-booking-charges.component.html',
	styleUrls: ['./forward-booking-charges.component.scss'],
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService, ExportService],
	encapsulation: ViewEncapsulation.None,
})
export class ForwardBookingChargesComponent implements OnInit {

	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('dt', { static: false }) table: Table;

	cols: { field: string; header: string; }[];
	isLoading: boolean = true;
	ChargesList: any = [];
	_selectedColumns: any[];
	banks = [];
	lookup_bank = {};
	editChargesDetails: any;
	updateChargesForm: FormGroup;
	charge_id: any;

	company_name: any;
	company_address: any;
	totalSystemCharges = 0;
	totalBankCharges = 0;
	sgstDbValue:any;
	cgstDbValue:any;

	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	})

	user: UserDetails;
	links: string[] = [];

	forward_book_recalculate = false;  
	forward_book_update_charges = false;
	forward_book_checked_by = false;
	forward_book_entered_by = false;
	forward_book_entered_by_status = false;
	status = [];
	complete_pending_status = 1;
	globalList = [];
	isRange: any;
	selected_date_range: any = [
		new Date(moment().startOf('month').format("YYYY-MM-DD")),
		new Date(moment().format("YYYY-MM-DD"))
	];
	  uploadSuccess: EventEmitter<boolean> = new EventEmitter();


	constructor(private CrudServices: CrudServices,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private toasterService: ToasterService, private exportService: ExportService) {

			this.user = this.loginService.getUserDetails();
			this.links = this.user.links;
	
			this.forward_book_recalculate = (this.links.indexOf('forward_book_recalculate') > -1);
			this.forward_book_update_charges = (this.links.indexOf('forward_book_update_charges') > -1);
			this.forward_book_checked_by = (this.links.indexOf('forward_book_checked_by') > -1);
			this.forward_book_entered_by = (this.links.indexOf('forward_book_entered_by') > -1);
			this.forward_book_entered_by_status = (this.links.indexOf('forward_book_entered_by_status') > -1);

		this.cols = [
			// { field: 'id', header: 'id' },
			{ field: 'bank_name', header: 'Bank Name' },
			{ field: 'forward_details', header: 'Forward Covered Details' },
			{ field: 'claimed_by_system', header: 'Claimed By System' },
			{ field: 'system_charges', header: 'System Charges' },
			{ field: 'claimed_by_bank', header: 'Claimed By Bank' },
			{ field: 'bank_charges', header: 'Bank Charges' },
			{ field: 'cheecked', header: 'Checked' },
			{ field: 'entered', header: 'Entered' },
			{ field: 'created_by', header: 'Created by' },
			{ field: 'created_date', header: 'Created Date' }
		];

		this._selectedColumns = this.cols;
		this.status = [{ id: 1, name: "Pending" }, { id: 2, name: "Complete" }];
		this.getBankChargesList();

	}

	ngOnInit() {
		this.isLoading = true;

		this.getBankChargesList();

		this.CrudServices.getAll<any>(ValueStore.getAll).subscribe((response) => {
			console.log(response, "valuestore");
			for (let elem of response) {

				if (elem.thekey == "company_name") {
					this.company_name = elem.value;
				}
				if (elem.thekey == "company_address") {
					this.company_address = elem.value;
				}
			}

		});

		this.CrudServices.getAll<any>(bankChargesList.getGSTValue).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.sgstDbValue = response.sgst;
				this.cgstDbValue = response.cgst;
				console.log(this.sgstDbValue, this.cgstDbValue, "GST Value");
			}

		});

		this.updateChargesForm = new FormGroup({
			update_forward_booking_charges: new FormControl(0),
			charges_date: new FormControl(null)
		});
	}

	onStatusChange(event) {

		console.log(event.id, this.ChargesList, "eeeee")
		this.ChargesList = this.globalList;
		if (event.id == 1) {
			this.ChargesList = this.ChargesList.filter(item => item.entered_by == null && item.checked_by != null);
		} else if (event.id == 2) {
			this.ChargesList = this.ChargesList.filter(item => item.entered_by != null &&  item.checked_by != null);
		}
		this.calculateTotal();
	}

	receiveDate(dateValue: any) {
		this.isRange = dateValue.range
		this.selected_date_range = dateValue.range;
	
	  }

	  
	clearDropdown() {
		if (JSON.stringify(this.isRange) != JSON.stringify(this.selected_date_range))
			this.uploadSuccess.emit(false);
	}


	getBankChargesList() {
		//this.isLoading = true;
		this.ChargesList = [];
		let condition = {
			from_date: moment(this.selected_date_range[0]).format("YYYY-MM-DD"),
			to_date: moment(this.selected_date_range[1]).format("YYYY-MM-DD")
		  }
		this.CrudServices.getOne<any>(forwardBookingCharges.getAllNew,condition).subscribe((response) => {
			
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.isLoading = false;
			
			} else {
				this.isLoading = false;
				//this.ChargesList = response;
		
				for (let item, i = 0; item = response[i++];) {
					const bank = item.spipl_bank.bank_name;
					item.bank_name = bank;
					this.ChargesList.push(item);

					if (!(bank in this.lookup_bank)) {
						this.lookup_bank[bank] = 1;
						this.banks.push({ 'bank_name': bank });
					}
				}

				this.globalList = this.ChargesList;
				if(this.forward_book_entered_by_status) //Mayur Sir Pending List
				{
				   this.ChargesList=this.globalList
				//   this.ChargesList = this.ChargesList.filter(item => item.entered_by == null && item.checked_by != null);
				}
				this.calculateTotal();
				console.log(this.banks, "bankss");
			}
		});

	}

	getColumnPresent(name) {

		if (this._selectedColumns.find(ob => ob['field'] === name)) {
			return true;
		} else {
			return false;
		}
	}

	// multiselect filter
	onchange(event, name) {
		const arr = [];

		if (event.value.length > 0) {
			for (let i = 0; i < event.value.length; i++) {
				arr.push(event.value[i][name]);
			}
			// console.log(arr);
			this.table.filter(arr, name, 'in');


		} else {
			this.table.filter('', name, 'in');
		}
	}

	async generatePdf(forwardBookingDeatils, create_update_flag) {

		let bookingDate = (forwardBookingDeatils.forward_book.booking_date).substr(8, 2) + '/' + (forwardBookingDeatils.forward_book.booking_date).substr(5, 2) + '/' + (forwardBookingDeatils.forward_book.booking_date).substr(0, 4);
		let forwardAmount = forwardBookingDeatils.forward_book.amount;
		let fromDate = 	(forwardBookingDeatils.forward_book.from_date).substr(8, 2) + '/' + (forwardBookingDeatils.forward_book.from_date).substr(5, 2) + '/' + (forwardBookingDeatils.forward_book.from_date).substr(0, 4);
		let toDate = (forwardBookingDeatils.forward_book.to_date).substr(8, 2) + '/' + (forwardBookingDeatils.forward_book.to_date).substr(5, 2) + '/' + (forwardBookingDeatils.forward_book.to_date).substr(0, 4);

		

		let final_rate = forwardBookingDeatils.forward_book.final_rate;
		let headerTxt = 'Being Forward booking charges against forward booked on '+bookingDate+' from period '+fromDate+' to '+toDate+' for USD '+forwardAmount +' @ '+final_rate;

		let bankName = forwardBookingDeatils.spipl_bank.bank_name;
		let bankGstNo = forwardBookingDeatils.spipl_bank.gst_no;
		let bankAccountNo = forwardBookingDeatils.spipl_bank.account_no;

		let forwardBookingCharges = forwardBookingDeatils.forward_booking_charges;
		let fbCgst = forwardBookingDeatils.fb_cgst;
		let fcSgst = forwardBookingDeatils.fb_sgst;
		let totalSystemCharges = forwardBookingDeatils.total_system_charges;
		let totalBankCharges = forwardBookingDeatils.total_bank_charges;
		let chargesDate =forwardBookingDeatils.charges_date ? forwardBookingDeatils.charges_date.substr(8, 2) + '/' + forwardBookingDeatils.charges_date.substr(5, 2) + '/' + forwardBookingDeatils.charges_date.substr(0, 4): null;



		var docDefinition = {

			content: [

				{
					style: 'tableExample',
					table: {

						body: [

							[{
								width: '*',
								text: [bankName + ' ' + bankAccountNo + ' GSTIN - ' + bankGstNo+' ('+chargesDate+')'],
								margin: [10, 5, 0, 0],
								bold: true,
								style: 'tableHeader',
								colSpan: 3,
								alignment: 'center'
							}, {}, {}],

							[{
								columns: [
									{
										image: await this.exportService.getBase64ImageFromURL(
											'assets/img/brand/parmar_logo.png'
										),
										margin: [38, 0, , 0],
										width: 60,
										height: 60,
										alignment: 'center'
									},
									{
										width: '*',
										text: [
											{ text: this.company_name + '\n', fontSize: 18, bold: true, },
											{ text: this.company_address, fontSize: 8 },
										],
										margin: [0, 15, 0, 0]
									},
								],
								colSpan: 3,
								alignment: 'center'
							}, {}, {}],

							[{
								width: '*',

								text: headerTxt,
								margin: [10, 5, 0, 0],
								style: 'tableHeader',
								colSpan: 3,
								alignment: 'center'
							}, {}, {}],

							[{ text: 'Sr.No.', alignment: 'center' }, { text: 'Perticular', alignment: 'center' }, { text: 'Amount', alignment: 'center' }],

							[{ text: 'A]', alignment: 'center', border: [true, false, true, false] },
							{
								text: 'Forward Booking charges', border: [false, false, true, false]
							},
							{ text: forwardBookingCharges, alignment: 'right', border: [false, false, true, false] }

							],

							[{ text: '', alignment: 'center', border: [true, false, true, false] },
							{
								text: 'CGST @ '+this.cgstDbValue+'%', border: [false, false, true, false]
							},
							{ text: fbCgst, alignment: 'right', border: [false, false, true, false] }

							],

							[{ text: '', alignment: 'center', border: [true, false, true, false] },
							{
								text: 'SGST @ '+this.sgstDbValue+'%', border: [false, false, true, false]
							},
							{ text: fcSgst, alignment: 'right', border: [false, false, true, false] }

							],


							[{ text: '', border: [true, true, true, true] },
							{ text: 'TOTAL CHARGES BY SYSTEM' },
							{ text: totalSystemCharges, alignment: 'right' }
							],

							[{ text: '', border: [true, true, true, true] },
							{ text: 'TOTAL CHARGES DEBITED BY BANK' },
							{ text: totalBankCharges, alignment: 'right' }
							],


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


					},

					layout: {

						paddingLeft: function (i, node) {
							return 8;
						},
						paddingRight: function (i, node) { return 8; },
						paddingTop: function (i, node) { return 8; },
						paddingBottom: function (i, node) { return 8; },
					}

				},
			]

		};

		let updateForwardBookingCharges = [];
		if (create_update_flag == 2) {

			let short_excess_forward_booking_charges = 0;
			let short_excess_forward_booking_charges_show = '';

			let setExcessShortForwardBookingCharges = [{ text: '', border: [true, false, true, false] }, { text: '', border: [false, false, true, false] }, { text: '', alignment: 'right', border: [false, false, true, false] }];

			if (forwardBookingDeatils.forward_booking_charges > forwardBookingDeatils.update_forward_booking_charges) {
				//short
				short_excess_forward_booking_charges = Number(forwardBookingDeatils.forward_booking_charges - forwardBookingDeatils.update_forward_booking_charges);

				short_excess_forward_booking_charges_show = '-' + short_excess_forward_booking_charges.toFixed(2);

				setExcessShortForwardBookingCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Short Debited by Bank', border: [false, false, true, false] }, { text: short_excess_forward_booking_charges_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;

				var index = searchInArray(arr, "Forward Booking charges");
		
				let newArr = insertToArray(arr, setExcessShortForwardBookingCharges, index);
				docDefinition.content[0].table.body = newArr;

			} else if (forwardBookingDeatils.forward_booking_charges < forwardBookingDeatils.update_forward_booking_charges) {
				//excess
				short_excess_forward_booking_charges = Number(forwardBookingDeatils.update_forward_booking_charges - forwardBookingDeatils.forward_booking_charges);
				short_excess_forward_booking_charges_show = '+' + short_excess_forward_booking_charges.toFixed(2);
				setExcessShortForwardBookingCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Debited by Bank', border: [false, false, true, false] }, { text: short_excess_forward_booking_charges_show, alignment: 'right', border: [false, false, true, false] }];

				let arr = docDefinition.content[0].table.body;
				
				var index = searchInArray(arr, "Forward Booking charges");

				let newArr = insertToArray(arr, setExcessShortForwardBookingCharges, index);
				docDefinition.content[0].table.body = newArr;
			}

			let totalChargesAccordingToBank = forwardBookingDeatils.total_bank_charges;
			

			let short_excess_bank_charges = 0;
			let short_excess_bank_charges_show = '';
			let totalBankCharges = [];
			if (forwardBookingDeatils.total_system_charges > totalChargesAccordingToBank) {

				console.log(forwardBookingDeatils.total_system_charges,"total_system_charges");
				console.log(totalChargesAccordingToBank,"totalChargesAccordingToBank");
				short_excess_bank_charges = Number(forwardBookingDeatils.total_system_charges) - Number(totalChargesAccordingToBank);

				console.log(short_excess_bank_charges,"short_excess_bank_charges");

				short_excess_bank_charges_show = '-' + short_excess_bank_charges.toFixed(2);				

				 totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Short Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];


				 let arr = docDefinition.content[0].table.body;
				 var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM"); 
				 let newArr = insertToArray(arr, totalBankCharges, total_bank_charges_index-1);
				 docDefinition.content[0].table.body = newArr;


			}else if(forwardBookingDeatils.total_system_charges < totalChargesAccordingToBank)
			{
				short_excess_bank_charges = Number(totalChargesAccordingToBank - forwardBookingDeatils.total_system_charges);
				short_excess_bank_charges_show = '+' + short_excess_bank_charges.toFixed(2);

				 totalBankCharges = [{ text: '', border: [true, false, true, false] }, { text: 'Excess Charges According to Bank ', border: [false, false, true, false] }, { text: short_excess_bank_charges_show, alignment: 'right', border: [false, false, true, false] }];

				 let arr = docDefinition.content[0].table.body;
				 var total_bank_charges_index = searchInArray(arr, "TOTAL CHARGES BY SYSTEM"); 
				 let newArr = insertToArray(arr, totalBankCharges, total_bank_charges_index-1);
				 docDefinition.content[0].table.body = newArr;


			}

		
		}



		pdfMake.createPdf(docDefinition).open();
	}

	updateCharges(forwardBookingDeatils) {

		console.log(forwardBookingDeatils);
		this.editChargesDetails = forwardBookingDeatils;
		this.charge_id = forwardBookingDeatils.id;

		this.updateChargesForm.patchValue({
			update_forward_booking_charges: this.editChargesDetails['update_forward_booking_charges'],
			charges_date: this.editChargesDetails['charges_date'],
		});
		this.myModal.show();
	}

	UpdateChargesSave() {

		let ChargesACcordingToBank = this.forwardBookingCalculation();
		console.log(ChargesACcordingToBank, "ChargesACcordingToBank");
		let data = {
			update_forward_booking_charges: this.updateChargesForm.value.update_forward_booking_charges ? this.updateChargesForm.value.update_forward_booking_charges : 0,
			charges_date: this.updateChargesForm.value.charges_date ? this.updateChargesForm.value.charges_date : 0,
			total_bank_charges: ChargesACcordingToBank
		}

		let body = {
			ChargesData: data,
			id: this.charge_id

		}

		this.CrudServices.updateData<any>(forwardBookingCharges.update, body).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);

				this.myModal.hide();
				this.getBankChargesList();

			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.myModal.hide();
				this.getBankChargesList();

			}
		});

	}
	forwardBookingCalculation() {
		let UpdateForwardBookingCharges = Number(this.updateChargesForm.value.update_forward_booking_charges);
		let fb_Cgst = Number(UpdateForwardBookingCharges * (Number(this.cgstDbValue) / 100));
		let fb_Sgst = Number(UpdateForwardBookingCharges * (Number(this.sgstDbValue) / 100));
		let totalChargesAccordingtoBank = Number(UpdateForwardBookingCharges) + Number(fb_Cgst) + Number(fb_Sgst);
		return totalChargesAccordingtoBank;
	}

	recalculateCharges(forward_book_id) {
		let body = {
			forward_book_id: forward_book_id
		};

		console.log(body);

		this.CrudServices.updateData<any>(forwardBookingCharges.reCalculateCharges, body).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);

				this.myModal.hide();
				this.getBankChargesList();

			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.myModal.hide();
				this.getBankChargesList();

			}
		});
	}


	calculateTotal() {
		this.totalSystemCharges = 0;
		this.totalBankCharges = 0;

		for (const val of this.ChargesList) {
			this.totalSystemCharges = this.totalSystemCharges + Number(val.total_system_charges);
			this.totalBankCharges = this.totalBankCharges + Number(val.total_bank_charges);
		}

	}


	
	checkVoucher(id, flag_check_enter) {
		//flag_check_enter
		//1- check 
		//2 - entered 
		let body = {
			id: id,
			flag_check_enter: flag_check_enter
		}
		this.CrudServices.getOne<any>(forwardBookingCharges.voucher_check, body).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getBankChargesList();
			}
		});

	}
}
