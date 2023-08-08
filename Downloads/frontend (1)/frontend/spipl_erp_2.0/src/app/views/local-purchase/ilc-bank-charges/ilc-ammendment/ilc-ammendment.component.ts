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
import { bankChargesList, IlcAmendmentCharges, IlcOpeningCharges, PercentageDetails, ValueStore } from '../../../../shared/apis-path/apis-path';
import { IlcPdfService } from '../../../../shared/ilc-pdf/ilc-pdf.service';
import { staticValues } from '../../../../shared/common-service/common-service';
import { element } from 'protractor';

@Component({
	selector: 'app-ilc-ammendment',
	templateUrl: './ilc-ammendment.component.html',
	styleUrls: ['./ilc-ammendment.component.scss'],
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService, ExportService, IlcPdfService],
	encapsulation: ViewEncapsulation.None,
})

export class IlcAmmendmentComponent implements OnInit {
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
			{ field: 'ilc_no', header: 'ILC NO' },
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
			update_ilc_amt_inr: new FormControl(0),
			update_amd_ch_value_change: new FormControl(0),
			update_amd_ch_date_change: new FormControl(0),
			update_ammend_clause_charges: new FormControl(0),
			update_swift_charges: new FormControl(0),
			additional_header: new FormControl(null),
			additional_charges: new FormControl(0)
		});
		this.loadData()
	}

	loadData() {
		this.getValueStore();
		this.getCgstSgstValue();
		this.getIlcAmendmentChargesList();
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

	getIlcAmendmentChargesList() {
		this.crudServices.getAll<any>(IlcAmendmentCharges.getAll).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.isLoading = false;
				this.chargesList = [];
			} else {
				this.isLoading = false;
				this.chargesList = [];

				for (let item, i = 0; item = response.data[i++];) {
					this.calculateGodownWiseCharges(item).subscribe(res => {
						item["piQuantity"] = Number(res["piQuantity"]);
						item["godownWiseCharges"] = Number(res["godownWiseCharges"]);
						item["godown"] = res["godown"];
						item["ilc_amount"] = res["ilc_amount"];
					});
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
			this.totalSystemCharges = this.totalSystemCharges + Number(val.total_charges_system);
			this.totalBankCharges = this.totalBankCharges + Number(val.total_charges_bank);
		}
	}

	ilcAmendChargesCalculation() {
		let amend_value_sum = 0;
		let amend_date_sum = 0;
		let amend_clause_sum = 0;
		let amend_swift_sum = 0;
		let ilc_ammend_flag = this.editChargesDetails.ilc_letter_of_credit.ilc_ammend_flag;

		let ilc_amt_inr = this.editChargesDetails.ilc_amt_inr;
		let amd_ch_value_change = this.editChargesDetails.amd_ch_value_change;
		let amd_ch_date_change = this.editChargesDetails.amd_ch_date_change;
		let ammend_clause_charges = this.editChargesDetails.ammend_clause_charges;
		let swift_charges = this.editChargesDetails.swift_charges;
		let total_charges_system = this.editChargesDetails.total_charges_system;
		
		let update_ilc_amt_inr = this.editChargesDetails.update_ilc_amt_inr;
		let update_amd_ch_value_change = this.editChargesDetails.update_amd_ch_value_change;
		let update_amd_ch_date_change = this.editChargesDetails.update_amd_ch_date_change;
		let update_ammend_clause_charges = this.editChargesDetails.update_ammend_clause_charges;
		let update_swift_charges = this.editChargesDetails.update_swift_charges;
		let additional_charges = this.editChargesDetails.additional_charges;

		// Amendment Value Change
		if (amd_ch_value_change != update_amd_ch_value_change) {
			let ammend_value_amount = Number(update_amd_ch_value_change);
			let ammend_value_cgst = Number(ammend_value_amount * (Number(this.cgstDbValue) / 100));
			let ammend_value_sgst = Number(ammend_value_amount * (Number(this.sgstDbValue) / 100));
			amend_value_sum = Number(ammend_value_amount) + Number(ammend_value_cgst) + Number(ammend_value_sgst);
		}

		// Amendment Date Change
		if (amd_ch_date_change != update_amd_ch_date_change) {
			let ammend_date_amount = Number(update_amd_ch_date_change);
			let ammend_date_cgst = Number(ammend_date_amount * (Number(this.cgstDbValue) / 100));
			let ammend_date_sgst = Number(ammend_date_amount * (Number(this.sgstDbValue) / 100));
			amend_date_sum = Number(ammend_date_amount) + Number(ammend_date_cgst) + Number(ammend_date_sgst);
		}

		// Amendment Clause Change
		if (ammend_clause_charges != update_ammend_clause_charges) {
			let amend_clause_amount = Number(update_ammend_clause_charges);
			let amend_clause_cgst = Number(amend_clause_amount * (Number(this.cgstDbValue) / 100));
			let amend_clause_sgst = Number(amend_clause_amount * (Number(this.sgstDbValue) / 100));
			amend_clause_sum = Number(amend_clause_amount) + Number(amend_clause_cgst) + Number(amend_clause_sgst);
		}

		// Amendment Swift Change
		if (swift_charges != update_swift_charges) {
			let amend_swift_amount = Number(update_swift_charges);
			let amend_swift_cgst = Number(amend_swift_amount * (Number(this.cgstDbValue) / 100));
			let amend_swift_sgst = Number(amend_swift_amount * (Number(this.sgstDbValue) / 100));
			amend_swift_sum = Number(amend_swift_amount) + Number(amend_swift_cgst) + Number(amend_swift_sgst);
		}

		let totalChargesAccordingToBank = Number(total_charges_system) + Number(amend_value_sum) + Number(amend_date_sum) + Number(amend_clause_sum) + Number(amend_swift_sum) + Number(additional_charges);

		return totalChargesAccordingToBank.toFixed(3);
	}

	recalculateCharges(ilc_id) {
		let body = {
			ilc_id: ilc_id
		};
		this.crudServices.updateData<any>(IlcAmendmentCharges.recalculate, body).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.myModal.hide();
				this.getIlcAmendmentChargesList();
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.myModal.hide();
				this.getIlcAmendmentChargesList();
			}
		});
	}

	updateCharges(item) {
		this.editChargesDetails = item;
		this.charge_id = item.id;
		this.updateChargesForm.patchValue({
			charges_date: this.editChargesDetails['charges_date'],
			update_ilc_amt_inr: this.editChargesDetails['update_ilc_amt_inr'],
			update_amd_ch_value_change: this.editChargesDetails['update_amd_ch_value_change'],
			update_amd_ch_date_change: this.editChargesDetails['update_amd_ch_date_change'],
			update_ammend_clause_charges: this.editChargesDetails['update_ammend_clause_charges'],
			update_swift_charges: this.editChargesDetails['update_swift_charges'],
			additional_header: this.editChargesDetails['additional_header'],
			additional_charges: this.editChargesDetails['additional_charges']
		});
		this.myModal.show();
	}

	updateChargesSubmit() {
		let chargesACcordingToBank = this.ilcAmendChargesCalculation();
		let charges_date = this.updateChargesForm.value.charges_date;
		let update_ilc_amt_inr = this.updateChargesForm.value.update_ilc_amt_inr;
		let update_amd_ch_value_change = this.updateChargesForm.value.update_amd_ch_value_change;
		let update_amd_ch_date_change = this.updateChargesForm.value.update_amd_ch_date_change;
		let update_ammend_clause_charges = this.updateChargesForm.value.update_ammend_clause_charges;
		let update_swift_charges = this.updateChargesForm.value.update_swift_charges;
		let additional_header = this.updateChargesForm.value.additional_header;
		let additional_charges = this.updateChargesForm.value.additional_charges;

		let data = {
			charges_date,
			update_ilc_amt_inr: update_ilc_amt_inr ? update_ilc_amt_inr : 0,
			update_amd_ch_value_change: update_amd_ch_value_change ? update_amd_ch_value_change : 0,
			update_amd_ch_date_change: update_amd_ch_date_change ? update_amd_ch_date_change : 0,
			update_ammend_clause_charges: update_ammend_clause_charges ? update_ammend_clause_charges : 0,
			update_swift_charges: update_swift_charges ? update_swift_charges : 0,
			additional_header: additional_header ? additional_header : null,
			additional_charges: additional_charges ? additional_charges : 0,
			total_charges_bank: Number(chargesACcordingToBank)
		};
		let body = {
			data: data,
			id: this.charge_id,
			message: "ILC Amendment Charges Updated"
		};
		this.crudServices.updateData<any>(IlcAmendmentCharges.update, body).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.myModal.hide();
			this.getIlcAmendmentChargesList();
		});
	}

	updateVoucher(id, flag) {
		let body = {
			flag: flag,
			id: id,
			message: "ILC Amendment Charges Updated"
		}
		this.crudServices.getOne<any>(IlcAmendmentCharges.update, body).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.getIlcAmendmentChargesList();
		});
	}

	calculateGodownWiseCharges(item) {
		return this.crudServices.getOne<any>(IlcOpeningCharges.getLocalDealPiDetails, {
			ilc_id: item.ilc_id
		}).map(response => {
			let totalBankCharges = item.total_charges_bank;
			let totalPiQty = 0;
			let ilc_amount = 0;
			let percentageArr = [];
			let godownWiseChargesArray = {};

			for (let element1 of response.data) {
				totalPiQty += Number(element1.qauntity);
				ilc_amount += Number(element1.amount);
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
					godown: element3.godown,
					ilc_amount: ilc_amount
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
		console.log(item);
		this.ilcPdf.ilcAmendment(item, flag, data);
	}

}
