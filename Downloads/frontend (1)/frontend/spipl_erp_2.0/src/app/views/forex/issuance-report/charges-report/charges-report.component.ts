import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChildren, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Table } from 'primeng/table';
import { forexReports } from '../../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../../shared/crud-services/crud-services';
import { ExportService } from '../../../../shared/export-service/export-service';
import { PermissionService } from '../../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../../login/login.service_back';
import { TemplateService } from '../../../masters/template-editor/template-service';

@Component({
	selector: 'app-charges-report',
	templateUrl: './charges-report.component.html',
	styleUrls: ['./charges-report.component.css', './charges-report.scss'],
	encapsulation: ViewEncapsulation.None,
	providers: [
		ToasterService,
		PermissionService,
		LoginService,
		DatePipe,
		CrudServices,
		ExportService,
		TemplateService]
})
export class ChargesReportComponent implements OnInit {

	@ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];

	isLoading = false;
	all_charges_list = [];
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});
	@ViewChild('dt', { static: false }) table: Table;

	cols: { field: string; header: string; }[];
	_selectedColumns: any[];
	bank_list = [];
	charges_type_list = [];
	supplier_list = [];

	lookup_bank = {};
	lookup_charges_type = {};
	lookup_supplier = {};

	filteredValuess: any;
	total_qty = 0;
	total_amt = 0;
	export_all_charges_list = [];
	exportColumns: any[];
	checkedList = [];
	fromDate: any;
	toDate: any;
	bsRangeValue: Date[];
	currentYear: number;
	date = new Date();

	bank_name: any = '';
	charges_type: any = ';'
	charges_date: any;
	system_charges_amount: Number = 0;
	bank_charges_amount: Number = 0;

	total_system_charges = 0;
	total_bank_charges = 0;




	constructor(private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private CrudServices: CrudServices,
		private exportService: ExportService,
		private templateService: TemplateService,
		private route: ActivatedRoute,
		private router: Router) {
		this.cols = [
			{ field: 'bank_name', header: 'Bank Name' },
			{ field: 'supplier_name', header: 'Supplier Name' },
			{ field: 'charges_type', header: 'Charges Type' },
			// { field: 'charges_date', header: 'Charges Date' },
			{ field: 'system_charges_amount', header: 'System Charges Amount' },
			{ field: 'bank_charges_amount', header: 'Bank Charges Amount' },
		];

		this._selectedColumns = this.cols;

		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		if (this.datepipe.transform(this.date, 'MM') > '03') {

            this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

        } else {

            this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

        }
		// this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
		//this.bsRangeValue = [];


		this.fromDate = this.bsRangeValue[0];
		this.toDate = this.bsRangeValue[1];
	}

	ngOnInit() {
		this.getData();
	
	}
	


	getData() {

		this.CrudServices.postRequest<any>(forexReports.getChargesReport, { from_dt: this.fromDate, to_dt: this.toDate }).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {

				this.all_charges_list = [];
				this.total_system_charges = 0;
				this.total_bank_charges = 0;
				console.log(response, "response");
			

				let ChargesObj = {};

				for (let item, i = 0; item = response.lcOPen[i++];) {

					let lcOpenType = "LC Opening";
					ChargesObj = {
						bank_name: item.bank_name,
						charges_type: lcOpenType,
						system_charges_amount: item.system_charges,
						bank_charges_amount: item.bank_charges,
						supplier_name: item.sub_org_name
					};

					this.all_charges_list.push(ChargesObj)

					if (!(item.bank_name in this.lookup_bank)) {
						this.lookup_bank[item.bank_name] = 1;
						this.bank_list.push({ 'bank_name': item.bank_name });
					}

					if (!(item.sub_org_name in this.lookup_supplier)) {
						this.lookup_supplier[item.sub_org_name] = 1;
						this.supplier_list.push({ 'supplier_name': item.sub_org_name });
					}

					if (!(lcOpenType in this.lookup_charges_type)) {
						this.lookup_charges_type[lcOpenType] = 1;
						this.charges_type_list.push({ 'charges_type': lcOpenType });
					}

					this.total_system_charges = this.total_system_charges + Number(item.system_charges);
					this.total_bank_charges = this.total_bank_charges + Number(item.bank_charges);


				}


				for (let item, i = 0; item = response.lcAmmend[i++];) {
					let lcAmmendType = "LC Ammendment";
					ChargesObj = {
						bank_name: item.bank_name,
						charges_type: lcAmmendType,
						system_charges_amount: item.system_charges,
						bank_charges_amount: item.bank_charges,
						supplier_name: item.sub_org_name
					};

					this.all_charges_list.push(ChargesObj)

					if (!(item.bank_name in this.lookup_bank)) {
						this.lookup_bank[item.bank_name] = 1;
						this.bank_list.push({ 'bank_name': item.bank_name });
					}

					if (!(item.sub_org_name in this.lookup_supplier)) {
						this.lookup_supplier[item.sub_org_name] = 1;
						this.supplier_list.push({ 'supplier_name': item.sub_org_name });
					}

					if (!(lcAmmendType in this.lookup_charges_type)) {
						this.lookup_charges_type[lcAmmendType] = 1;
						this.charges_type_list.push({ 'charges_type': lcAmmendType });
					}

					this.total_system_charges = this.total_system_charges + Number(item.system_charges);
					this.total_bank_charges = this.total_bank_charges + Number(item.bank_charges);



				}

				for (let item, i = 0; item = response.paymentRemittance[i++];) {

					let paymentRemitType = "Payment Remittance";

					ChargesObj = {
						bank_name: item.bank_name,
						charges_type: paymentRemitType,
						system_charges_amount: item.system_charges,
						bank_charges_amount: item.bank_charges,
						supplier_name: item.sub_org_name
					};
					this.all_charges_list.push(ChargesObj)

					if (!(item.bank_name in this.lookup_bank)) {
						this.lookup_bank[item.bank_name] = 1;
						this.bank_list.push({ 'bank_name': item.bank_name });
					}

					if (!(item.sub_org_name in this.lookup_supplier)) {
						this.lookup_supplier[item.sub_org_name] = 1;
						this.supplier_list.push({ 'supplier_name': item.sub_org_name });
					}

					if (!(paymentRemitType in this.lookup_charges_type)) {
						this.lookup_charges_type[paymentRemitType] = 1;
						this.charges_type_list.push({ 'charges_type': paymentRemitType });
					}

					this.total_system_charges = this.total_system_charges + Number(item.system_charges);
					this.total_bank_charges = this.total_bank_charges + Number(item.bank_charges);

				}

				for (let item, i = 0; item = response.nonRemittance[i++];) {

					let nonLcRemitType = "NONLC Remittance";


					ChargesObj = {
						bank_name: item.bank_name,
						charges_type: nonLcRemitType,
						system_charges_amount: item.system_charges,
						bank_charges_amount: item.bank_charges,
						supplier_name: item.sub_org_name
					};

					this.all_charges_list.push(ChargesObj)

					if (!(item.bank_name in this.lookup_bank)) {
						this.lookup_bank[item.bank_name] = 1;
						this.bank_list.push({ 'bank_name': item.bank_name });
					}

					if (!(item.sub_org_name in this.lookup_supplier)) {
						this.lookup_supplier[item.sub_org_name] = 1;
						this.supplier_list.push({ 'supplier_name': item.sub_org_name });
					}

					if (!(nonLcRemitType in this.lookup_charges_type)) {
						this.lookup_charges_type[nonLcRemitType] = 1;
						this.charges_type_list.push({ 'charges_type': nonLcRemitType });
					}

					this.total_system_charges = this.total_system_charges + Number(item.system_charges);
					this.total_bank_charges = this.total_bank_charges + Number(item.bank_charges);
				}

				for (let item, i = 0; item = response.ForwardBook[i++];) {

					let forwardBookType = "Forward Booking";
					ChargesObj = {
						bank_name: item.bank_name,
						charges_type: forwardBookType,
						system_charges_amount: item.system_charges,
						bank_charges_amount: item.bank_charges,
						supplier_name: ""
					};

					this.all_charges_list.push(ChargesObj)

					if (!(item.bank_name in this.lookup_bank)) {
						this.lookup_bank[item.bank_name] = 1;
						this.bank_list.push({ 'bank_name': item.bank_name });
					}

					if (!(forwardBookType in this.lookup_charges_type)) {
						this.lookup_charges_type[forwardBookType] = 1;
						this.charges_type_list.push({ 'charges_type': forwardBookType });
					}

					this.total_system_charges = this.total_system_charges + Number(item.system_charges);
					this.total_bank_charges = this.total_bank_charges + Number(item.bank_charges);
				}


				for (let item, i = 0; item = response.other[i++];) {
					let otherType = "Other";

					ChargesObj = {
						bank_name: item.bank_name,
						charges_type: otherType,
						system_charges_amount: item.totalcharges,
						bank_charges_amount: item.totalcharges,
						supplier_name: ""
					};

					this.all_charges_list.push(ChargesObj);

					if (!(item.bank_name in this.lookup_bank)) {
						this.lookup_bank[item.bank_name] = 1;
						this.bank_list.push({ 'bank_name': item.bank_name });
					}

					if (!(otherType in this.lookup_charges_type)) {
						this.lookup_charges_type[otherType] = 1;
						this.charges_type_list.push({ 'charges_type': otherType });
					}

					this.total_system_charges = this.total_system_charges + Number(item.totalcharges);
					this.total_bank_charges = this.total_bank_charges + Number(item.totalcharges);
				}

				console.log(this.all_charges_list, "all_charges_list");


			}
		});

	}

	@Input() get selectedColumns(): any[] {
		//localStorage.setItem('selected_col_non', JSON.stringify(this._selectedColumns));
		return this._selectedColumns;
	}

	set selectedColumns(val: any[]) {
		this._selectedColumns = this.cols.filter(col => val.includes(col));
	}


	onSelect($e) {

		if ($e) {
			this.fromDate = $e[0];
			this.toDate = $e[1];
		}
		this.getData();

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
			// console.log(arr);
			this.table.filter(arr, name, 'in');

		} else {
			this.table.filter('', name, 'in');
		}
	}

	onFilter(event, dt) {
		this.filteredValuess = [];
		this.total_system_charges = 0;
		this.total_bank_charges = 0;
		this.filteredValuess = event.filteredValue;
		for (const val of this.filteredValuess) {
			this.total_system_charges = this.total_system_charges + Number(val.system_charges_amount);
			this.total_bank_charges = this.total_bank_charges + Number(val.bank_charges_amount);
		}
	}

	exportData() {

		let arr = [];
		const foot = {};
		let system_charges = 0;
		let bank_charges = 0;
		if (this.filteredValuess === undefined) {
			arr = this.all_charges_list;
		} else {
			arr = this.filteredValuess;
		}
		for (let i = 0; i < arr.length; i++) {
			const export_issuance = {};
			for (let j = 0; j < this._selectedColumns.length; j++) {
				export_issuance[this._selectedColumns[j]['header']] = arr[i][this._selectedColumns[j]['field']];

			}
			this.export_all_charges_list.push(export_issuance);
			system_charges = system_charges + Number(arr[i]['system_charges_amount']);
			bank_charges = bank_charges + Number(arr[i]['bank_charges_amount']);


		}

		for (let j = 0; j < this._selectedColumns.length; j++) {
			if (this._selectedColumns[j]['field'] === 'system_charges_amount') {
				foot[this._selectedColumns[j]['header']] = system_charges;

			} else if (this._selectedColumns[j]['field'] === 'bank_charges_amount') {
				foot[this._selectedColumns[j]['header']] = bank_charges;

			} else {
				foot[this._selectedColumns[j]['header']] = '';
			}
		}

		this.export_all_charges_list.push(foot);



	}

	exportPdf() {
		this.export_all_charges_list = [];
		this.exportData();
		this.exportColumns = this._selectedColumns.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdf(this.exportColumns, this.export_all_charges_list, 'Charges List');
	}

	exportExcel() {
		this.export_all_charges_list = [];
		this.exportData();
		this.exportService.exportExcel(this.export_all_charges_list, 'Charges List');
	}



}
