import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { Table } from 'primeng/table';
import { ModalDirective } from 'ngx-bootstrap';
import { FormControl, FormGroup } from '@angular/forms';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../../login/login.service';
import { ExportService } from '../../../../shared/export-service/export-service';
import { IlcPdfService } from '../../../../shared/ilc-pdf/ilc-pdf.service';
import { staticValues } from '../../../../shared/common-service/common-service';
import { bankChargesList, IlcDiscountCharges, IlcOpeningCharges, PercentageDetails, ValueStore } from '../../../../shared/apis-path/apis-path';

@Component({
	selector: 'app-ilc-discount',
	templateUrl: './ilc-discount.component.html',
	styleUrls: ['./ilc-discount.component.scss'],
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService, ExportService],
	encapsulation: ViewEncapsulation.None,
})

export class IlcDiscountComponent implements OnInit {
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;
	@ViewChild('dt', { static: false }) table: Table;

	cols: { field: string; header: string; }[];
	isLoading: boolean = true;
	chargesList: any = [];
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
	sgstDbValue: any;
	cgstDbValue: any;
	datePickerConfig = staticValues.datePickerConfig;

	public toasterconfig: ToasterConfig = new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});

	constructor(private crudServices: CrudServices,
		public datepipe: DatePipe,
		private toasterService: ToasterService,
		private exportService: ExportService,
		private ilcPdf: IlcPdfService) {
		this.cols = [
			{ field: 'bank_name', header: 'Bank Name' },
			{ field: 'be_no', header: 'Bill Of Entry No.' },
			{ field: 'claimed_by_system', header: 'Claimed By System' },
			{ field: 'system_charges', header: 'System Charges' },
			{ field: 'claimed_by_bank', header: 'Claimed By Bank' },
			{ field: 'bank_charges', header: 'Bank Charges' },
			{ field: 'godown_wise_charges', header: 'Godown Wise Charges' },
			{ field: 'checked', header: 'Checked' },
			{ field: 'entered', header: 'Entered' },
		];
		this._selectedColumns = this.cols;
	}

	ngOnInit() {
		this.isLoading = true;
		this.updateChargesForm = new FormGroup({
			charges_date: new FormControl(new Date()),
			update_bex_amount: new FormControl(0),
			update_remit_charges: new FormControl(0),
			update_boa_charges: new FormControl(0),
			update_discrepancy_charges: new FormControl(0),
			update_swift_charges: new FormControl(0),
			additional_header: new FormControl(null),
			additional_charges: new FormControl(0)
		});
		this.loadData()
	}

	loadData() {
		this.getValueStore();
		this.getCgstSgstValue();
		this.getIlcDiscountChargesList();
	}

	getValueStore() {
		this.crudServices.getAll<any>(ValueStore.getAll).subscribe((response) => {
			for (let elem of response) {
				if (elem.thekey == "company_name") {
					this.company_name = elem.value;
				}
				if (elem.thekey == "company_address") {
					this.company_address = elem.value;
				}
			}
		});
	}

	getCgstSgstValue() {
		this.crudServices.getAll<any>(PercentageDetails.getCgstSgstValue).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				this.cgstDbValue = response[0].percent_value;
				this.sgstDbValue = response[1].percent_value;
			}
		});
	}

	getIlcDiscountChargesList() {
		this.crudServices.getAll<any>(IlcDiscountCharges.getAll).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.isLoading = false;
				this.chargesList = [];
			} else {
				this.isLoading = false;
				this.chargesList = [];

				console.log(response,"response");

				for (let item, i = 0; item = response.data[i++];) {

					item.total_charges_system = Number(item.bex_amount - item.intrest_amt);

					let dt1=new Date(item.bill_of_exchange.dut_dt);
					let dt2=new Date(item.bill_of_exchange.discount_date);

					let int_days=Math.floor((dt1.getTime() - dt2.getTime()) / 1000 / 60 / 60 / 24);

					item.int_days=int_days;
				



					item.total_charges_bank = Number(item.bex_amount - item.intrest_amt);
					// this.calculateGodownWiseCharges(item).subscribe(res => {
					// 	item["piQuantity"] = Number(res["piQuantity"]);
					// 	item["godownWiseCharges"] = Number(res["godownWiseCharges"]);
					// 	item["godown"] = res["godown"];
					// });
					const bank = item.spipl_bank.bank_name;
					item.bank_name = bank;
					this.chargesList.push(item);
					if (!(bank in this.lookup_bank)) {
						this.lookup_bank[bank] = 1;
						this.banks.push({ 'bank_name': bank });
					}
				}
				this.calculateTotal();
			}
		});
	}

	calculateTotal() {
		this.totalSystemCharges = 0;
		this.totalBankCharges = 0;
		for (const val of this.chargesList) {
			this.totalSystemCharges = this.totalSystemCharges + Number(val.bex_amount - val.intrest_amt);
			this.totalBankCharges = this.totalBankCharges + Number(val.bex_amount - val.intrest_amt);
		}
	}

	ilcOpenChargesCalculation() {
		let totalChargesAccordingtoBank = 0;
		return totalChargesAccordingtoBank;
	}

	recalculateCharges(bex_id) {
		let body = {
			bex_id: bex_id
		};
		this.crudServices.updateData<any>(IlcDiscountCharges.recalculate, body).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.myModal.hide();
				this.getIlcDiscountChargesList();
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.myModal.hide();
				this.getIlcDiscountChargesList();
			}
		});
	}

	updateCharges(item) {
		this.editChargesDetails = item;
		this.charge_id = item.id;
		this.updateChargesForm.patchValue({
			charges_date: this.editChargesDetails['charges_date'],
			additional_header: this.editChargesDetails['additional_header'],
			additional_charges: this.editChargesDetails['additional_charges']
		});
		this.myModal.show();
	}

	updateChargesSubmit() {
		let charges_date = this.updateChargesForm.value.charges_date;
		let additional_header = this.updateChargesForm.value.additional_header;
		let additional_charges = this.updateChargesForm.value.additional_charges;

		let data = {
			charges_date,
			additional_header: additional_header ? additional_header : null,
			additional_charges: additional_charges ? additional_charges : 0,
		};

		let body = {
			data: data,
			id: this.charge_id,
			message: "ILC Dicount Charges Updated"
		};
		this.crudServices.updateData<any>(IlcDiscountCharges.update, body).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.myModal.hide();
			this.getIlcDiscountChargesList();
		});
	}

	updateVoucher(id, flag) {
		let body = {
			flag: flag,
			id: id,
			message: "ILC Dicount Charges Updated"
		}
		this.crudServices.getOne<any>(IlcDiscountCharges.update, body).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.getIlcDiscountChargesList();
		});
	}

	calculateGodownWiseCharges(item) {
		return this.crudServices.getOne<any>(IlcOpeningCharges.getLocalDealPiDetails, {
			ilc_id: item.ilc_id
		}).map(response => {
			let totalBankCharges = item.total_charges_bank;
			let totalPiQty = 0;
			let percentageArr = [];
			let godownWiseChargesArray = {};

			for (let element1 of response.data) {
				totalPiQty += Number(element1.qauntity);
			}

			for (let element2 of response.data) {
				let piPercent = (Number(element2.qauntity) * 100) / Number(totalPiQty);
				percentageArr.push({
					piPercent: piPercent,
					godown: element2.local_purchase_deal.godown.godown_name,
					piQuantity: element2.qauntity
				})
			}

			for (let element3 of percentageArr) {
				let godownWiseCharges = (Number(element3.piPercent) / 100) * Number(totalBankCharges);
				godownWiseChargesArray = {
					piQuantity: element3.piQuantity.toFixed(2),
					godownWiseCharges: godownWiseCharges.toFixed(2),
					godown: element3.godown
				}
			}

			return godownWiseChargesArray;
		});
	}

	getColumnPresent(name) {
		if (this._selectedColumns.find(ob => ob['field'] === name)) {
			return true;
		} else {
			return false;
		}
	}

	onchange(event, name) {
		const arr = [];
		if (event.value.length > 0) {
			for (let i = 0; i < event.value.length; i++) {
				arr.push(event.value[i][name]);
			}
			this.table.filter(arr, name, 'in');
		} else {
			this.table.filter('', name, 'in');
		}
	}

	async generatePdf(item, flag) {
		let data = {
			company_name: this.company_name,
			company_address: this.company_address,
			cgstDbValue: this.cgstDbValue,
			sgstDbValue: this.sgstDbValue,
			logo: await this.exportService.getBase64ImageFromURL('assets/img/brand/parmar_logo.png')
		};
		this.ilcPdf.ilcDiscountCharges(item, flag, data);
	}

}
