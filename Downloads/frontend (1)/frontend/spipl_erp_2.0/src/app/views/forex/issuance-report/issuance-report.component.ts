import { Component, OnInit, ViewChild, Input, ViewChildren, ElementRef, ViewEncapsulation } from '@angular/core';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { PermissionService } from '../../../shared/pemission-services/pemission-service';
import { LoginService } from '../../login/login.service';
import { DatePipe } from '@angular/common';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { TemplateService } from '../../masters/template-editor/template-service';
import { ActivatedRoute, Router } from '@angular/router';
import { forexReports } from '../../../shared/apis-path/apis-path';
import { Table } from 'primeng/table';

@Component({
	selector: 'app-issuance-report',
	templateUrl: './issuance-report.component.html',
	styleUrls: ['./issuance-report.component.scss'],
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
export class IssuanceReportComponent implements OnInit {

	@ViewChildren('inputs') public inputs: ElementRef<HTMLInputElement>[];

	isLoading = false;
	issuance_list = [];
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});


	@ViewChild('dt', { static: false }) table: Table;

	cols: { field: string; header: string; }[];
	_selectedColumns: any[];
	supplier_list = [];
	banks = [];
	types = [];
	lookup_bank = {};
	lookup_supplier = {};
	lookup_type = {};

	filteredValuess: any;
	total_qty = 0;
	total_amt = 0;
	export_issuance_list = [];
	exportColumns: any[];
	checkedList = [];
	fromDate: any;
	toDate: any;
	bsRangeValue: Date[];
	currentYear: number;
	date = new Date();
	total_amt_inr = 0;


	constructor(private toasterService: ToasterService,
		private permissionService: PermissionService,
		private loginService: LoginService,
		public datepipe: DatePipe,
		private CrudServices: CrudServices,
		private exportService: ExportService,
		private templateService: TemplateService,
		private route: ActivatedRoute,
		private router: Router,) {
		this.cols = [
			{ field: 'supplier_name', header: 'Supplier Name' },
			{ field: 'issuance_bank', header: 'Bank Name' },
			{ field: 'issuance_date', header: 'Issuance Date' },
			{ field: 'flc_ilc_tt_no', header: 'FLC/ILC/TT No.' },
			{ field: 'quantity', header: 'Quantity' },
			{ field: 'amount_new', header: 'Amount' },
			{ field: 'amount_inr', header: 'Amount(INR)' },
			{ field: 'type', header: 'Type' }
		];

		this._selectedColumns = this.cols;

		this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
		// this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

		if (this.datepipe.transform(this.date, 'MM') > '03') {

			this.bsRangeValue = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];

		} else {

			this.bsRangeValue = [new Date(this.currentYear - 1, 3, 1), new Date(Number(this.currentYear), 2, 31)];

		}
		//this.bsRangeValue = [];


		this.fromDate = this.bsRangeValue[0];
		this.toDate = this.bsRangeValue[1];
	}

	ngOnInit() {
		//this.getData();
	}

	getData() {
		this.CrudServices.postRequest<any>(forexReports.getIssuanceReport, { from_dt: this.fromDate, to_dt: this.toDate }).subscribe((response) => {
			if (response.code === "101") {
				this.toasterService.pop(response.message, response.message, response.data);
			} else {
				console.log(response, "response");
				this.issuance_list = response;
				this.total_qty = 0;
				this.total_amt = 0;
				this.total_amt_inr = 0;
				for (let item, i = 0; item = this.issuance_list[i++];) {
					const name = item.supplier_name;
					const bank = item.issuance_bank;
					const type = item.type;

					if (!(name in this.lookup_supplier)) {
						this.lookup_supplier[name] = 1;
						this.supplier_list.push({ 'supplier_name': name });
					}
					if (!(bank in this.lookup_bank)) {
						this.lookup_bank[bank] = 1;
						this.banks.push({ 'issuance_bank': bank });
					}
					if (!(type in this.lookup_type)) {
						this.lookup_type[type] = 1;
						this.types.push({ 'type': type });
					}

					if (type == 'ILC') {
						item.amount_new = 0;
						item.amount_inr = (Number(item.amount));
						this.total_amt_inr = this.total_amt_inr + (Number(item.amount));
						this.total_qty = this.total_qty + Number(item.quantity);
						this.total_amt = this.total_amt + 0;


					} else {
						item.amount_new = item.amount;
						item.amount_inr = (Number(item.amount) * Number(item.lc_rate));

						this.total_amt_inr = this.total_amt_inr + (Number(item.amount) * Number(item.lc_rate));
						this.total_qty = this.total_qty + Number(item.quantity);
						this.total_amt = this.total_amt + Number(item.amount_new);

					}

				}
				console.log(this.issuance_list, "issuancelist");

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


	onSelect($e, state) {
		if ($e) {
			this.fromDate = $e[0];
			this.toDate = $e[1];
		}
		this.getData();
	}

	onFilter(event, dt) {
		this.filteredValuess = [];
		this.total_qty = 0;
		this.total_amt = 0;
		this.total_amt_inr = 0;
		this.filteredValuess = event.filteredValue;
		for (const val of this.filteredValuess) {
			this.total_qty = this.total_qty + Number(val.quantity);
			this.total_amt = this.total_amt + Number(val.amount_new);
			this.total_amt_inr = this.total_amt_inr + (Number(val.amount_new) * Number(val.lc_rate));

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

	getColumnPresent(name) {
		if (this._selectedColumns.find(ob => ob['field'] === name)) {
			return true;
		} else {
			return false;
		}
	}


	exportData() {

		let arr = [];
		const foot = {};
		let qty = 0;
		let amt = 0;
		let amt_inr = 0;
		if (this.filteredValuess === undefined) {
			arr = this.issuance_list;
		} else {
			arr = this.filteredValuess;
		}
		for (let i = 0; i < arr.length; i++) {
			const export_issuance = {};
			for (let j = 0; j < this._selectedColumns.length; j++) {
				export_issuance[this._selectedColumns[j]['header']] = arr[i][this._selectedColumns[j]['field']];

			}
			this.export_issuance_list.push(export_issuance);
			qty = qty + Number(arr[i]['quantity']);
			if (arr[i]['type'] != 'ILC') {
				amt = amt + Number(arr[i]['amount']);
				amt_inr = amt_inr + (Number(arr[i]['amount']) * Number(arr[i]['lc_rate']));
			} else {
				amt = amt + 0;
				amt_inr = amt_inr + (Number(arr[i]['amount']));
			}
		}

		for (let j = 0; j < this._selectedColumns.length; j++) {
			if (this._selectedColumns[j]['field'] === 'quantity') {
				foot[this._selectedColumns[j]['header']] = qty;

			} else if (this._selectedColumns[j]['field'] === 'amount_new') {
				foot[this._selectedColumns[j]['header']] = amt;

			} else if (this._selectedColumns[j]['field'] === 'amount_inr') {
				foot[this._selectedColumns[j]['header']] = amt_inr;
			} else {
				foot[this._selectedColumns[j]['header']] = '';
			}
		}

		this.export_issuance_list.push(foot);
	}

	exportPdf() {
		this.export_issuance_list = [];
		this.exportData();
		this.exportColumns = this._selectedColumns.map(col => ({ title: col.header, dataKey: col.header }));
		this.exportService.exportPdf(this.exportColumns, this.export_issuance_list, 'Issuance List');
	}

	exportExcel() {
		this.export_issuance_list = [];
		this.exportData();
		this.exportService.exportExcel(this.export_issuance_list, 'Issuance List');
	}

	// for all check box check
	onCheckAll(checked) {

		let arr = [];
		if (this.filteredValuess === undefined) {
			arr = this.issuance_list;
		} else {
			arr = this.filteredValuess;
		}
		if (checked) {
			this.inputs.forEach(check => {
				check.nativeElement.checked = true;
			});
			for (const val of arr) {
				this.checkedList.push(val);
			}

		} else {
			this.inputs.forEach(check => {
				check.nativeElement.checked = false;
			});
			for (const val of arr) {
				this.checkedList.splice(this.checkedList.indexOf(val), 1);
			}
		}
	}

	onCheck(checked, item) {
		if (checked) {
			this.checkedList.push(item);
		} else {
			this.checkedList.splice(this.checkedList.indexOf(item), 1);
		}
	}



	uncheckAll() {

		this.inputs.forEach(check => {
			check.nativeElement.checked = false;
		});
	}

	onDateSelect($event, name) {
		this.table.filter(this.convert($event), name, 'equals');
	}
	convert(str) {
		if (str) {
			const date = new Date(str),
				mnth = ('0' + (date.getMonth() + 1)).slice(-2),
				day = ('0' + date.getDate()).slice(-2);
			return [date.getFullYear(), mnth, day].join('-');
		} else {
			return '';
		}
	}
}
