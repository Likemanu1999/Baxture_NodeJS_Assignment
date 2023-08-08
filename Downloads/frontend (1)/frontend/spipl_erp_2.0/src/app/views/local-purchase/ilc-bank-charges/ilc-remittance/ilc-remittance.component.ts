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
import {
	bankChargesList,
	ChargesMasters,
	IlcOpeningCharges,
	IlcRemittanceCharges,
	PercentageDetails,
	ValueStore
} from '../../../../shared/apis-path/apis-path';
import { IlcPdfService } from '../../../../shared/ilc-pdf/ilc-pdf.service';
import { staticValues } from '../../../../shared/common-service/common-service';

@Component({
	selector: 'app-ilc-remittance',
	templateUrl: './ilc-remittance.component.html',
	styleUrls: ['./ilc-remittance.component.scss'],
	providers: [CrudServices, PermissionService, LoginService, DatePipe, ToasterService, ExportService, IlcPdfService],
	encapsulation: ViewEncapsulation.None,
})

export class IlcRemittanceComponent implements OnInit {
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
		this.getIlcRemittanceChargesList();
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

	getIlcRemittanceChargesList() {
		this.crudServices.getAll<any>(IlcRemittanceCharges.getAll).subscribe((response) => {
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
					console.log(this.chargesList);
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

	ilcRemitChargesCalculation() {
		let totalChargesAccordingtoBank = 0;
		return totalChargesAccordingtoBank;
	}

	recalculateCharges(bex_id) {
		let body = {
			bex_id: bex_id
		};
		this.crudServices.updateData<any>(IlcRemittanceCharges.recalculate, body).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
				this.myModal.hide();
				this.getIlcRemittanceChargesList();
			} else {
				this.toasterService.pop(response.message, response.message, response.data);
				this.myModal.hide();
				this.getIlcRemittanceChargesList();
			}
		});
	}

	updateCharges(item) {
		this.editChargesDetails = item;
		this.charge_id = item.id;
		this.updateChargesForm.patchValue({
			charges_date: this.editChargesDetails['charges_date'],
			update_bex_amount: this.editChargesDetails['update_bex_amount'],
			update_remit_charges: this.editChargesDetails['update_remit_charges'],
			update_boa_charges: this.editChargesDetails['update_boa_charges'],
			update_discrepancy_charges: this.editChargesDetails['update_discrepancy_charges'],
			update_swift_charges: this.editChargesDetails['update_swift_charges'],
			additional_header: this.editChargesDetails['additional_header'],
			additional_charges: this.editChargesDetails['additional_charges']
		});
		this.myModal.show();
	}

	updateChargesSubmit() {
		let chargesACcordingToBank = this.ilcRemitChargesCalculation();
		let charges_date = this.updateChargesForm.value.charges_date;
		let update_bex_amount = this.updateChargesForm.value.update_bex_amount;
		let update_remit_charges = this.updateChargesForm.value.update_remit_charges;
		let update_boa_charges = this.updateChargesForm.value.update_boa_charges;
		let update_discrepancy_charges = this.updateChargesForm.value.update_discrepancy_charges;
		let update_swift_charges = this.updateChargesForm.value.update_swift_charges;
		let additional_header = this.updateChargesForm.value.additional_header;
		let additional_charges = this.updateChargesForm.value.additional_charges;

		let data = {
			charges_date,
			update_bex_amount: update_bex_amount ? Number(update_bex_amount).toFixed(3) : 0,
			update_remit_charges: update_remit_charges ? Number(update_remit_charges).toFixed(3) : 0,
			update_boa_charges: update_boa_charges ? Number(update_boa_charges).toFixed(3) : 0,
			update_discrepancy_charges: update_discrepancy_charges ? Number(update_discrepancy_charges).toFixed(3) : 0,
			update_swift_charges: update_swift_charges ? Number(update_swift_charges).toFixed(3) : 0,
			additional_header: additional_header ? additional_header : null,
			additional_charges: additional_charges ? additional_charges : 0,
			total_charges_bank: Number(chargesACcordingToBank).toFixed(3)
		};

		let body = {
			data: data,
			id: this.charge_id,
			message: "ILC Remittance Charges Updated"
		};
		this.crudServices.updateData<any>(IlcRemittanceCharges.update, body).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.myModal.hide();
			this.getIlcRemittanceChargesList();
		});
	}

	updateVoucher(id, flag) {
		let body = {
			flag: flag,
			id: id,
			message: "ILC Remittance Charges Updated"
		}
		this.crudServices.getOne<any>(IlcRemittanceCharges.update, body).subscribe((response) => {
			this.toasterService.pop(response.message, response.message, response.data);
			this.getIlcRemittanceChargesList();
		});
	}

	calculateGodownWiseCharges(item) {
		return this.crudServices.getOne<any>(IlcOpeningCharges.getLocalDealPiDetails, {
			ilc_id: item.ilc_id
		}).map(response => {
			let totalBankCharges = item.total_charges_bank;
			let totalPiQty = 0;
			let totalAmount = 0;
			let percentageArr = [];
			let godownWiseChargesArray = {};

			for (let element1 of response.data) {
				totalPiQty += Number(element1.qauntity);
				totalAmount += Number(element1.amount);
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
					ilc_amount: totalAmount
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
			logo: await this.exportService.getBase64ImageFromURL('assets/img/brand/parmar_logo.png'),
			remit_charges: null,
			remit_min_value: null,
			remit_max_value: null,
			boa_charges: null,
			boa_min_value: null,
			boa_max_value: null,
			disc_charges: null,
			disc_min_value: null,
			disc_max_value: null,
			remit_swift_charges: null
		};
		this.crudServices.getOne<any>(ChargesMasters.getOne, {
			head_id: [35, 36, 37, 38, 39, 40, 41, 42]
		}).subscribe((response) => {
			response.data.forEach(element => {
				let head = element.charges_heads_master.name;
				if (head == "Remittance Charges") {
					data.remit_charges = element.charges;
				}
				if (head == "Remittance Min Value") {
					data.remit_min_value = element.charges;
				}
				if (head == "Remittance Max Value") {
					data.remit_max_value = element.charges;
				}
				if (head == "Bill of Acceptance Charges") {
					data.boa_charges = element.charges;
				}
				if (head == "Bill of Acceptance Min Value") {
					data.boa_min_value = element.charges;
				}
				if (head == "Bill of Acceptance Max Value") {
					data.boa_max_value = element.charges;
				}
				if (head == "Discrepancy Charges") {
					data.disc_charges = element.charges;
				}
				if (head == "Discrepancy Min Value") {
					data.disc_min_value = element.charges;
				}
				if (head == "Discrepancy Max Value") {
					data.disc_max_value = element.charges;
				}
				if (head == "Remittance Swift Charges") {
					data.remit_swift_charges = element.charges;
				}
			});
			this.ilcPdf.ilcRemittance(item, flag, data);
		});
	}

}
