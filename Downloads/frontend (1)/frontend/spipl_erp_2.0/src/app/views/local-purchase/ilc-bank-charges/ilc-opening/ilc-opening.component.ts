import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { Table } from 'primeng/table';
import { ModalDirective } from 'ngx-bootstrap';
import { FormControl, FormGroup } from '@angular/forms';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { ExportService } from '../../../../shared/export-service/export-service';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../../login/login.service';
import { bankChargesList, IlcOpeningCharges, PercentageDetails, ValueStore } from '../../../../shared/apis-path/apis-path';
import { staticValues } from '../../../../shared/common-service/common-service';
import { IlcPdfService } from '../../../../shared/ilc-pdf/ilc-pdf.service';

@Component({
	selector: 'app-ilc-opening',
	templateUrl: './ilc-opening.component.html',
	styleUrls: ['./ilc-opening.component.scss'],
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService, ExportService, IlcPdfService],
	encapsulation: ViewEncapsulation.None,
})

export class IlcOpeningComponent implements OnInit {
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
			update_ilc_open_amt_inr: new FormControl(0),
			update_ilc_open_charges: new FormControl(0),
			update_ilc_open_swift: new FormControl(0),
			additional_header: new FormControl(null),
			additional_charges: new FormControl(0)
		});
		this.loadData()
	}

	loadData() {
		this.getValueStore();
		this.getCgstSgstValue();
		this.getIlcOpeningChargesList();
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

	getIlcOpeningChargesList() {
		this.crudServices.getAll<any>(IlcOpeningCharges.getAll).subscribe((response) => {
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
					let bank = item.spipl_bank.bank_name;
					item.bank_name = bank;
					this.chargesList.push(item);
					if (!(bank in this.lookup_bank)) {
						this.lookup_bank[bank] = 1;
						this.banks.push({ 'bank_name': bank });
					}
				}
				console.log(this.chargesList);
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

	ilcOpenChargesCalculation() {
		let ilc_open_charges_sum = 0;
		let ilc_swift_sum = 0;

		let ilc_open_amt = this.editChargesDetails.ilc_open_amt_inr;
		let ilc_open_charges = this.editChargesDetails.ilc_open_charges;
		let ilc_swift = this.editChargesDetails.ilc_open_swift;
		let total_charges_system = this.editChargesDetails.total_charges_system;

		let update_ilc_open_amt = this.updateChargesForm.value.update_ilc_open_amt_inr;
		let update_ilc_open_charges = this.updateChargesForm.value.update_ilc_open_charges;
		let update_ilc_swift = this.updateChargesForm.value.update_ilc_open_swift;
		let additional_charges = this.updateChargesForm.value.additional_charges;

		if (ilc_open_amt != update_ilc_open_amt || ilc_open_charges != update_ilc_open_charges) {
			let ilc_open_charges_amount = Number(update_ilc_open_amt) * (Number(update_ilc_open_charges) / 100);
			let ilc_open_cgst = Number(ilc_open_charges_amount) * (Number(this.cgstDbValue) / 100);
			let ilc_open_sgst = Number(ilc_open_charges_amount) * (Number(this.sgstDbValue) / 100);
			ilc_open_charges_sum = Number(ilc_open_charges_amount) + Number(ilc_open_cgst) + Number(ilc_open_sgst);
		}

		if (ilc_swift != update_ilc_swift) {
			let ilc_swift_cgst = Number(update_ilc_swift) * (Number(this.cgstDbValue) / 100);
			let ilc_swift_sgst = Number(update_ilc_swift) * (Number(this.sgstDbValue) / 100);
			ilc_swift_sum = Number(update_ilc_swift) + Number(ilc_swift_cgst) + Number(ilc_swift_sgst);
		}

		let totalChargesAccordingToBank = Number(total_charges_system) + Number(ilc_open_charges_sum) + Number(ilc_swift_sum) + Number(additional_charges);

		return totalChargesAccordingToBank.toFixed(3);
	}

	recalculateCharges(ilc_id) {
		let body = {
			ilc_id: ilc_id
		};
		this.crudServices.updateData<any>(IlcOpeningCharges.recalculate, body).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.myModal.hide();
				this.getIlcOpeningChargesList();
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.myModal.hide();
				this.getIlcOpeningChargesList();
			}
		});
	}

	updateCharges(item) {
		this.editChargesDetails = item;
		this.charge_id = item.id;
		this.updateChargesForm.patchValue({
			charges_date: this.editChargesDetails['charges_date'],
			update_ilc_open_amt_inr: this.editChargesDetails['update_ilc_open_amt_inr'],
			update_ilc_open_charges: this.editChargesDetails['update_ilc_open_charges'],
			update_ilc_open_swift: this.editChargesDetails['update_ilc_open_swift'],
			additional_header: this.editChargesDetails['additional_header'],
			additional_charges: this.editChargesDetails['additional_charges']
		});
		this.myModal.show();
	}

	updateChargesSubmit() {
		let chargesACcordingToBank = this.ilcOpenChargesCalculation();
		let charges_date = this.updateChargesForm.value.charges_date;
		let update_ilc_open_amt_inr = this.updateChargesForm.value.update_ilc_open_amt_inr;
		let update_ilc_open_charges = this.updateChargesForm.value.update_ilc_open_charges;
		let update_ilc_open_swift = this.updateChargesForm.value.update_ilc_open_swift;
		let additional_header = this.updateChargesForm.value.additional_header;
		let additional_charges = this.updateChargesForm.value.additional_charges;
		let data = {
			charges_date,
			update_ilc_open_amt_inr: update_ilc_open_amt_inr ? update_ilc_open_amt_inr : 0,
			update_ilc_open_charges: update_ilc_open_charges ? update_ilc_open_charges : 0,
			update_ilc_open_swift: update_ilc_open_swift ? update_ilc_open_swift : 0,
			additional_header: additional_header ? additional_header : null,
			additional_charges: additional_charges ? additional_charges : 0,
			total_charges_bank: Number(chargesACcordingToBank)
		};
		let body = {
			data: data,
			id: this.charge_id,
			message: "ILC Opening Charges Updated"
		};
		this.crudServices.updateData<any>(IlcOpeningCharges.update, body).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.myModal.hide();
			this.getIlcOpeningChargesList();
		});
	}

	updateVoucher(id, flag) {
		let body = {
			flag: flag,
			id: id,
			message: "ILC Opening Charges Updated"
		}
		this.crudServices.getOne<any>(IlcOpeningCharges.update, body).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.getIlcOpeningChargesList();
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
		this.ilcPdf.ilcOpening(item, flag, data);
	}

}
