import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Table } from 'primeng/table';
import { bankOtherCharges, ValueStore, bankChargesList } from '../../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../../login/login.service';
import { UserDetails } from '../../../login/UserDetails.model';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { ExportService } from '../../../../shared/export-service/export-service';
import { insertToArray, searchInArray } from '../../../../shared/common-service/common-service';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
	selector: 'app-bank-other-charges',
	templateUrl: './bank-other-charges.component.html',
	styleUrls: ['./bank-other-charges.component.scss'],
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService,ExportService],
	encapsulation: ViewEncapsulation.None,
})
export class BankOtherChargesComponent implements OnInit {

	@ViewChild('dt', { static: false }) table: Table;

	cols: { field: string; header: string; }[];
	isLoading: boolean = true;
	chargesGgetOne: any;

	mode: string;
	editmode: boolean = false;

	add_opt: boolean = false;
	edit_opt: boolean = false;
	view_opt: boolean = false;
	add_flc_charges: boolean = false;
	edit_flc_charges: boolean = false;
	view_flc_charges: boolean = false;
	user: UserDetails;
	links: any = [];
	lookup_bank = {};
	banks = [];
	_selectedColumns: any[];

	fromDate: any;
	toDate: any;

	bsRangeValue: Date[];
	currentYear: number;
	date = new Date();
	flag1: string;
	flag2: string;
	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000,
	});

	otherChargesList: any = [];

	public popoverTitle: string = "Warning";
	public popoverMessage: string = "Are you sure, you want to Change?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Yes";
	public cancelText: string = "No";
	public placement: string = "left";
	public closeOnOutsideClick: boolean = true;

	company_name: any;
	company_address: any;
	sgstDbValue:any;
	cgstDbValue:any;




	other_charges_edit = false;  
	other_charges_delete = false;
	other_charges_checked_by = false;
	other_charges_entered_by = false;
	other_charges_entered_by_status = false;
	status = [];
	complete_pending_status = 1;
	globalList = [];

	constructor(private CrudServices: CrudServices,
		private router: Router,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private toasterService: ToasterService,private exportService: ExportService) {


			this.user = this.loginService.getUserDetails();
			this.links = this.user.links;
	
			this.other_charges_edit = (this.links.indexOf('other_charges_edit') > -1);
			this.other_charges_delete = (this.links.indexOf('other_charges_delete') > -1);
			this.other_charges_checked_by = (this.links.indexOf('other_charges_checked_by') > -1);
			this.other_charges_entered_by = (this.links.indexOf('other_charges_entered_by') > -1);
			this.other_charges_entered_by_status = (this.links.indexOf('other_charges_entered_by_status') > -1);


		this.cols = [
			// { field: 'id', header: 'id' },
			{ field: 'bank_name', header: 'Bank Name' },
			{ field: 'charges_date', header: 'Charges Date' },
			{ field: 'charges_category', header: 'Charges Category' },
			{ field: 'charges_description', header: 'Charges Description' },
			{ field: 'total_charges', header: 'Total Charges' },
			{ field: 'edit', header: 'Edit' },
			{ field: 'cheecked', header: 'Checked' },
			{ field: 'entered', header: 'Entered' },
		];

		this._selectedColumns = this.cols;
		this.status = [{ id: 1, name: "Pending" }, { id: 2, name: "Complete" }]


		this.mode = "Add New";
		const perms = this.permissionService.getPermission();
		this.add_opt = perms[0];
		this.view_opt = perms[1];
		this.edit_opt = perms[2];


		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		this.bsRangeValue = [];


		this.fromDate = this.bsRangeValue[0];
		this.toDate = this.bsRangeValue[1];

	}

	ngOnInit() {
		this.isLoading = true;

		this.getOtherCharges();

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
	}

	onStatusChange(event) {

		console.log(event.id, this.otherChargesList, "eeeee")
		this.otherChargesList = this.globalList;
		if (event.id == 1) {
			this.otherChargesList = this.otherChargesList.filter(item => item.entered_by == null && item.checked_by != null);
		} else if (event.id == 2) {
			this.otherChargesList = this.otherChargesList.filter(item => item.entered_by != null &&  item.checked_by != null);
		}
		
	}



	getOtherCharges() {
		this.CrudServices.getOne<any>(bankOtherCharges.getAll, { fromdate: this.fromDate, todate: this.toDate }).subscribe((response) => {
			
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.isLoading = false;
				this.otherChargesList = [];
			} else {
				this.isLoading = false;
				//this.otherChargesList = response;
				this.otherChargesList = [];

				for (let item, i = 0; item = response[i++];) {
					const chargescategory = item.charges_stage_master.name;
					const bank = item.spipl_bank.bank_name;
					item.charges_category = chargescategory;
					item.bank_name = bank;
					this.otherChargesList.push(item);

					if (!(bank in this.lookup_bank)) {
						this.lookup_bank[bank] = 1;
						this.lookup_bank[chargescategory] = 1;
						this.banks.push({ 'bank_name': bank });
						this.banks.push({ 'charges_category': chargescategory });
					}
				}

				this.globalList = this.otherChargesList;

				if(this.other_charges_entered_by_status) //Mayur Sir Pending List
				{
				   this.otherChargesList=this.globalList
				   this.otherChargesList = this.otherChargesList.filter(item => item.entered_by == null && item.checked_by != null);
				}


				console.log(this.banks, "bankss");
			}
		});
	}

	onSelect($e, state) {

		if ($e) {
			if (state === '1') {
				this.flag1 = '1';
				this.fromDate = $e[0];
				this.toDate = $e[1];
			}


		}
		this.getOtherCharges();

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

	onFilter(event, dt) {
	}

	addOtherCharges() {
		this.router.navigate(["/forex/add-bank-other-charges"]);
	}

	onEdit(id) {

		this.router.navigate(["/forex/edit-bank-other-charges", id]);
	}

	onDelete(id) {
		this.CrudServices.getOne<any>(bankOtherCharges.delete, {
			id: id
		}).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getOtherCharges();
			}
		});
	}

	async generatePdf(otherChargesDeatils) {

		let bankName = otherChargesDeatils.spipl_bank.bank_name;
		let bankGstNo = otherChargesDeatils.spipl_bank.gst_no;
		let bankAccountNo = otherChargesDeatils.spipl_bank.account_no;

		let header = otherChargesDeatils.header;
		let charges_description = otherChargesDeatils.charges_description;
		let chargesValue = otherChargesDeatils.charges_value;
		let chargesCgst = otherChargesDeatils.cgst;
		let chargesSgst = otherChargesDeatils.sgst;
		let totalCharges = otherChargesDeatils.total_charges;
		let gst_flag = otherChargesDeatils.gst_flag;
		let chargesDate =otherChargesDeatils.charges_date ? otherChargesDeatils.charges_date.substr(8, 2) + '/' + otherChargesDeatils.charges_date.substr(5, 2) + '/' + otherChargesDeatils.charges_date.substr(0, 4): null;

		

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

								text:header ,
								margin: [10, 5, 0, 0],
								style: 'tableHeader',
								colSpan: 3,
								alignment: 'center'
							}, {}, {}],

							[{ text: 'Sr.No.', alignment: 'center' }, { text: 'Perticular', alignment: 'center' }, { text: 'Amount', alignment: 'center' }],

							[{ text: 'A]', alignment: 'center', border: [true, false, true, false] },
							{
								text: charges_description, border: [false, false, true, false]
							},
							{ text: chargesValue, alignment: 'right', border: [false, false, true, false] }

							],
							[{ text: '', border: [true, true, true, true] },
							{ text: 'TOTAL CHARGES DEBITED BY BANK' },
							{ text: totalCharges, alignment: 'right' }
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

						paddingLeft: function (i, node) { return 8; },
						paddingRight: function (i, node) { return 8; },
						paddingTop: function (i, node) { return 8; },
						paddingBottom: function (i, node) { return 8; },
					}

				},
			]

		};


		let cgstCharges =[];
		let sgstCharges =[];
		if(gst_flag==1)
		{
			sgstCharges=[{ text: '', alignment: 'center', border: [true, false, true, false] },
			{
				text: 'SGST @ '+this.sgstDbValue+'%', border: [false, false, true, false]
			},
			{ text: chargesSgst, alignment: 'right', border: [false, false, true, false] }

			];
			let arr = docDefinition.content[0].table.body;
			var additional_charges_index = searchInArray(arr, "TOTAL CHARGES DEBITED BY BANK");
			let newArr = insertToArray(arr, sgstCharges, (additional_charges_index-1));
				docDefinition.content[0].table.body = newArr;

			cgstCharges=	[{ text: '', alignment: 'center', border: [true, false, true, false] },
			{
				text: 'CGST @ '+this.cgstDbValue+'%', border: [false, false, true, false]
			},
			{ text: chargesCgst, alignment: 'right', border: [false, false, true, false] }

			];

			let arr1 = docDefinition.content[0].table.body;
			let newArr1 = insertToArray(arr, cgstCharges, (additional_charges_index-1));
			docDefinition.content[0].table.body = newArr1;
		}



		pdfMake.createPdf(docDefinition).open();

	};


	checkVoucher(id, flag_check_enter) {
		//flag_check_enter
		//1- check 
		//2 - entered 
		let body = {
			id: id,
			flag_check_enter: flag_check_enter
		}
		this.CrudServices.getOne<any>(bankOtherCharges.voucher_check, body).subscribe((response) => {

			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.getOtherCharges();
			}
		});

	}

}
