import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { Table } from 'primeng/table';
import { DiscountMaster } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';

@Component({
	selector: 'app-discount-report',
	templateUrl: './discount-report.component.html',
	styleUrls: ['./discount-report.component.scss'],
	providers: [CrudServices, ToasterService, DatePipe, ExportService]
})
export class DiscountReportComponent implements OnInit {

	@ViewChild('dt', { static: false }) table: Table;

	isLoading: boolean = false;
	data = [];
	_selectedColumns: any[];
	cols: any = [];

	lookup_petro_manu_sub_org = {};
	petro_manu_sub_org_arr = [];

	lookup_discount_type = {};
	discount_arr = [];

	lookup_duration_type = {};
	duration_type_arr = [];

	lookup_product_name = {};
	product_name_arr = [];

	lookup_main_grade_name = {};
	main_grade_name_arr = [];

	lookup_grade_name = {};
	grade_name_arr = [];

	lookup_month = {};
	month_arr = [];


	filteredValuess: any[];
	export_list = [];

	tot_amount = 0;

	financial_year_list: any = [];

	selected_financial_year: any = null;

	constructor(private CrudServices: CrudServices, public datepipe: DatePipe, private toasterService: ToasterService, private exportService: ExportService) {

		this.cols = [
			{ field: "month", header: "Month" },
			{ field: "duration_type", header: "Duration Type" },
			{ field: "petro_manu_sub_org", header: "Manufacture Name" },
			{ field: "discount_type", header: "Discount Type" },
			{ field: "product_name", header: "Product Name" },
			{ field: "main_grade_name", header: "Main Grade Name" },
			{ field: "grade_name", header: "Grade Name" },
			{ field: "lifting_qty", header: "Quantity" },
			{ field: "rate", header: "Rate" },
			{ field: "amount", header: "Amount" },
			{ field: "from_date", header: "From Date" },
			{ field: "to_date", header: "To Date" },
			{ field: "completion", header: "Completion" },

		];

		this._selectedColumns = this.cols;

		this.CrudServices.getRequest<any>(DiscountMaster.get_fiscal_year_lifting).subscribe((response) => {
			this.financial_year_list = response.data;
			this.selected_financial_year = this.financial_year_list[0];
			this.getData();
		})
	}

	ngOnInit() {

	}


	getData() {
		this.isLoading = true;

		this.CrudServices.postRequest<any>(DiscountMaster.get_discount_report, { finacncial_year: this.selected_financial_year }).subscribe((response) => {
			this.isLoading = false;
			let final_arr = [];

			for (let elem_qd of response.quantity_discount) {
				final_arr.push(elem_qd)
			}

			for (let elem_qd of response.mou_discount) {
				final_arr.push(elem_qd)
			}

			for (let elem_qd of response.special_discount) {
				final_arr.push(elem_qd)
			}

			for (let elem_qd of response.price_protection) {
				final_arr.push(elem_qd)
			}

			for (let elem_qd of response.mou_quater_discount) {
				final_arr.push(elem_qd)
			}

			for (let elem_qd of response.mou_annual_discount) {
				final_arr.push(elem_qd)
			}


			for (let elem_qd of response.additional_mou_discount) {
				final_arr.push(elem_qd)
			}

			this.data = final_arr;


			this.tot_amount = 0;

			for (let item, i = 0; item = final_arr[i++];) {
				this.tot_amount = this.tot_amount + item.amount;

				item.month_date = `${item.month.substr(3, 4)}-${item.month.substr(0, 2)}-01`;

				const today = new Date(item.month_date);

				item.month = `${today.toLocaleString('default', { month: 'short' })}-${item.month_date.substr(0, 4)}`;


				const month = item.month;
				if (!(month in this.lookup_month)) {

					this.lookup_month[month] = 1;
					this.month_arr.push({ 'month': month });
				}




				const petro_manu_sub_org = item.petro_manu_sub_org;
				if (!(petro_manu_sub_org in this.lookup_petro_manu_sub_org)) {

					this.lookup_petro_manu_sub_org[petro_manu_sub_org] = 1;
					this.petro_manu_sub_org_arr.push({ 'petro_manu_sub_org': petro_manu_sub_org });
				}

				const discount_type = item.discount_type;
				if (!(discount_type in this.lookup_discount_type)) {

					this.lookup_discount_type[discount_type] = 1;
					this.discount_arr.push({ 'discount_type': discount_type });
				}

				const duration_type = item.duration_type;
				if (!(duration_type in this.lookup_duration_type)) {

					this.lookup_duration_type[duration_type] = 1;
					this.duration_type_arr.push({ 'duration_type': duration_type });
				}
				const product_name = item.product_name;
				if (!(product_name in this.lookup_product_name)) {

					this.lookup_product_name[product_name] = 1;
					this.product_name_arr.push({ 'product_name': product_name });
				}

				const main_grade_name = item.main_grade_name;
				if (!(main_grade_name in this.lookup_main_grade_name)) {

					this.lookup_main_grade_name[main_grade_name] = 1;
					this.main_grade_name_arr.push({ 'main_grade_name': main_grade_name });
				}

				const grade_name = item.grade_name;
				if (!(grade_name in this.lookup_grade_name)) {

					this.lookup_grade_name[grade_name] = 1;
					this.grade_name_arr.push({ 'grade_name': grade_name });
				}


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

		this.calculateTotal();
	}

	exportData() {
		this.export_list = [];
		let arr = [];
		const foot = {};
		if (this.filteredValuess === undefined) {
			arr = this.data;
		} else {
			arr = this.filteredValuess;
		}

		for (let i = 0; i < arr.length; i++) {
			const exportList = {};
			for (let j = 0; j < this.cols.length; j++) {
				exportList[this.cols[j]['header']] = arr[i][this.cols[j]['field']];

			}
			this.export_list.push(exportList);
		}

		this.export_list.push(foot);
	}

	exportExcel() {
		this.exportData();
		this.exportService.exportExcel(this.export_list, 'Discount-Report');
	}

	onFilter(event, dt) {
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;

		this.tot_amount = 0;
		for (const val of this.filteredValuess) {
			this.tot_amount = this.tot_amount + Number(val.amount);

		}
	}


	calculateTotal() {
		this.tot_amount = 0;
		for (const val of this.data) {
			this.tot_amount = this.tot_amount + Number(val.amount);

		}
	}

}


