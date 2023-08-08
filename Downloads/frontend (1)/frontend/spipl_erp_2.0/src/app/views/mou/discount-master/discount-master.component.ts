import { Component, OnInit, ViewChild } from '@angular/core';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { DatePipe } from '@angular/common';
import { ExportService } from '../../../shared/export-service/export-service';
import { Table } from 'primeng/table';
import { ModalDirective } from 'ngx-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DiscountMaster, GradeMaster, MainGrade, ProductMaster, SubOrg } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';


@Component({
	selector: 'app-discount-master',
	templateUrl: './discount-master.component.html',
	styleUrls: ['./discount-master.component.scss'],
	providers: [CrudServices, ToasterService, DatePipe, ExportService]
})
export class DiscountMasterComponent implements OnInit {
	@ViewChild('dt', { static: false }) table: Table;
	@ViewChild('myModal', { static: false }) public myModal: ModalDirective;

	isLoading: boolean = false;
	cols: any = [];
	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});


	manufacturer_arr = [];
	lookup_manufature = {};
	product_arr_flt = [];
	lookup_product = {};


	lookup_main_grade = {};
	main_grade_arr_flt = [];
	lookup_grade_master = {};
	grade_master_arr_flt = [];


	discount_type_arr_flt = [];
	lookup_discount_type = {};
	time_slab_arr_flt = [];

	product_arr = [];
	main_grade_arr = [];
	grade_master_arr = [];
	discount_type_arr = [];


	_selectedColumns: any[];
	data = [];
	tot_mou_quantity = 0;
	total_lifting = 0;
	total_pending = 0;

	filteredValuess: any[];
	export_list = [];
	addDiscountForm: FormGroup;
	sub_org_arr = [];

	manufacture_id: any;
	product_id: any;
	main_grade_id: any;
	grade_id: any;
	discount_type_id: any;
	slab_percentage_limit_ge: any;
	slab_qunatity_limit_ge: any;
	discount_pmt_rate: any;
	time_slab_type: any;
	from_date: any;
	to_date: any;

	add_update_status = 0;
	discount_id: any;


	time_slab_arr: any = staticValues.time_slab;
	lookup_time_slab = {};

	public popoverTitle: string = "Warning";
	public popoverMessage: string = "Are you sure, you want to delete?";
	public confirmClicked: boolean = false;
	public cancelClicked: boolean = false;
	public confirmText: string = "Yes";
	public cancelText: string = "No";
	public placement: string = "left";
	public closeOnOutsideClick: boolean = true;



	constructor(private CrudServices: CrudServices, public datepipe: DatePipe, private toasterService: ToasterService, private exportService: ExportService) {

		this.cols = [
			{ field: "manufacture_name", header: "Manufacture Name" },
			{ field: "product_name", header: "Sector Name" },
			{ field: "main_grade_name", header: "Main Grade Name" },
			{ field: "grade_name", header: "Grade Name" },
			{ field: "discount_type", header: "Discount Type" },
			{ field: "time_slab", header: "Time Slab" },
			{ field: "slab_percentage_limit_ge", header: "Percentage Limit" },
			{ field: "slab_qunatity_limit_ge", header: "Quantity Limit" },
			{ field: "discount_pmt_rate", header: "Discount Rate PMT" },
			{ field: "from_date", header: "From Date" },
			{ field: "to_date", header: "To Date" },
			{ field: "#", header: "Action" },
		];

		this._selectedColumns = this.cols;

		this.addDiscountForm = new FormGroup({
			'manufacture_id': new FormControl(null, Validators.required),
			'product_id': new FormControl(null),
			'main_grade_id': new FormControl(null),
			'grade_id': new FormControl(null),
			'discount_type_id': new FormControl(null),
			'slab_percentage_limit_ge': new FormControl(null),
			'slab_qunatity_limit_ge': new FormControl(null),
			'discount_pmt_rate': new FormControl(null),
			'time_slab_type': new FormControl(null),
			'from_date': new FormControl(null),
			'to_date': new FormControl(null),
			'discount_id': new FormControl(null),
		});


		this.CrudServices.getOne<any>(SubOrg.getSubOrgByCategory, { category_id: 116 }).subscribe(response => {

			if (response.length) {
				response.map(item => {
					item.sub_org_name = `${item.sub_org_name} - (${item.org_unit_master.unit_type}) - (${item.location_vilage})`
				})
			}
			this.sub_org_arr = response;
		});

		this.CrudServices.getRequest<any>(ProductMaster.getAll).subscribe(response => {
			if (response.length) {
				this.product_arr = response;
			}
		});



		this.CrudServices.getRequest<any>(MainGrade.getAll).subscribe(response => {
			if (response.length) {
				this.main_grade_arr = response;
			}
		});


		this.CrudServices.getRequest<any>(GradeMaster.getAll).subscribe(response => {
			if (response.length) {
				this.grade_master_arr = response;
			}
		});


		this.CrudServices.getRequest<any>(DiscountMaster.get_discount_type).subscribe(response => {
			if (response.length) {
				this.discount_type_arr = response;
			}
		});


		this.getDiscountMaster();
	}

	ngOnInit() {

		this.CrudServices.postRequest<any>(DiscountMaster.get_discount_report, { id: 1 }).subscribe((response) => {
			// 
		});



	}

	getDiscountMaster() {
		this.CrudServices.postRequest<any>(DiscountMaster.get_all, { id: 1 }).subscribe((response) => {
			for (let item, i = 0; item = response[i++];) {
				item.manufacture_name = item.sub_org_master.sub_org_name;
				item.product_name = item.product_master ? item.product_master.name : '';
				item.main_grade_name = item.main_grade ? item.main_grade.name : '';
				item.grade_name = item.grade_master ? item.grade_master.grade_name : '';
				item.discount_type = item.discount_type_master.discount_type;
				const manufacture_name = item.manufacture_name;
				if (!(manufacture_name in this.lookup_manufature)) {
					this.lookup_manufature[manufacture_name] = 1;
					this.manufacturer_arr.push({ 'manufacture_name': manufacture_name });
				}
				const product_name = item.product_master ? item.product_master.name : '';
				if (!(product_name in this.lookup_product)) {

					this.lookup_product[product_name] = 1;
					this.product_arr_flt.push({ 'product_name': product_name });
				}

				const main_grade_name = item.main_grade ? item.main_grade.name : '';
				if (!(main_grade_name in this.lookup_main_grade)) {

					this.lookup_main_grade[main_grade_name] = 1;
					this.main_grade_arr_flt.push({ 'main_grade_name': main_grade_name });
				}

				const grade_name = item.grade_master ? item.grade_master.grade_name : '';
				if (!(grade_name in this.lookup_grade_master)) {

					this.lookup_grade_master[grade_name] = 1;
					this.grade_master_arr_flt.push({ 'grade_name': grade_name });
				}

				const discount_type = item.discount_type;
				if (!(discount_type in this.lookup_discount_type)) {
					this.lookup_discount_type[discount_type] = 1;
					this.discount_type_arr_flt.push({ 'discount_type': discount_type });
				}

				item.time_slab = this.getSlab(item.time_slab_type);
				const time_slab = item.time_slab;
				if (!(time_slab in this.lookup_time_slab)) {
					this.lookup_time_slab[time_slab] = 1;
					this.time_slab_arr_flt.push({ 'time_slab': time_slab });
				}
			}
			this.data = response;
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
	onFilter(event, dt) {
		this.filteredValuess = [];
		this.filteredValuess = event.filteredValue;

		this.tot_mou_quantity = 0;
		this.total_lifting = 0;
		this.total_pending = 0;
		for (const val of this.filteredValuess) {
			this.tot_mou_quantity = this.tot_mou_quantity + Number(val.quantity);

		}

	}

	getSlab(time_slab) {

		if (time_slab == 1) {
			return 'Monthly';
		} else if (time_slab == 2) {
			return 'Quaterly';
		} else if (time_slab == 3) {
			return 'Yearly';
		} else {
			return '';
		}

	}


	addNew() {
		this.add_update_status = 0;
		this.myModal.show();
	}


	oncloseModal() {
		this.myModal.hide();
	}

	onSubmit() {
		let discount_id = this.addDiscountForm.value.discount_id;
		const data = {
			manufacture_id: this.addDiscountForm.value.manufacture_id,
			product_id: this.addDiscountForm.value.product_id,
			main_grade_id: this.addDiscountForm.value.main_grade_id,
			grade_id: this.addDiscountForm.value.grade_id,
			discount_type_id: this.addDiscountForm.value.discount_type_id,
			slab_percentage_limit_ge: this.addDiscountForm.value.slab_percentage_limit_ge,
			slab_qunatity_limit_ge: this.addDiscountForm.value.slab_qunatity_limit_ge,
			discount_pmt_rate: this.addDiscountForm.value.discount_pmt_rate,
			time_slab_type: this.addDiscountForm.value.time_slab_type,
			from_date: this.addDiscountForm.value.from_date,
			to_date: this.addDiscountForm.value.to_date
		};

		if (this.add_update_status == 0) { //add
			this.CrudServices.postRequest<any>(DiscountMaster.add, { data: data }).subscribe((response) => {
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.data, response.data);
					this.onResetForm();
					this.oncloseModal();
					this.getDiscountMaster();

				} else {
					this.toasterService.pop(response.message, response.data, response.data);
				}
			});
		} else if (this.add_update_status == 1) { //update
			this.CrudServices.postRequest<any>(DiscountMaster.update, { data: data, id: discount_id }).subscribe((response) => {
				if (response.code == 100) {
					this.toasterService.pop(response.message, response.data, response.data);
					this.onResetForm();
					this.oncloseModal();
					this.getDiscountMaster();
				} else {
					this.toasterService.pop(response.message, response.data, response.data);
				}
			});
		}

	}



	onEdit(item) {
		this.manufacture_id = item['manufacture_id'];
		this.product_id = item['product_id'];
		this.main_grade_id = item['main_grade_id'];
		this.grade_id = item['grade_id'];
		this.discount_type_id = item['discount_type_id'];
		this.slab_percentage_limit_ge = item['slab_percentage_limit_ge'];
		this.slab_qunatity_limit_ge = item['slab_qunatity_limit_ge'];
		this.discount_pmt_rate = item['discount_pmt_rate'];
		this.time_slab_type = item['time_slab_type'];
		this.from_date = item['from_date'];
		this.to_date = item['to_date'];

		this.discount_id = item['id'];
		this.add_update_status = 1;
		this.myModal.show();
	}

	onDelete(id) {
		this.CrudServices.postRequest<any>(DiscountMaster.delete, {
			id: id
		}).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.data, response.data);
				this.getDiscountMaster();
			} else {
				this.toasterService.pop(response.message, response.data, response.data);
			}
		});
	}

	duplicate(id) {
		this.CrudServices.postRequest<any>(DiscountMaster.dupliate_record, {
			id: id
		}).subscribe((response) => {
			if (response.code == 100) {
				this.toasterService.pop(response.message, response.data, response.data);
				this.getDiscountMaster();
			} else {
				this.toasterService.pop(response.message, response.data, response.data);
			}
		});
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

		// for (let j = 0; j < this._selectedColumns.length; j++) {

		// 	if (this._selectedColumns[j]['field'] === 'quantity') {
		// 		foot[this._selectedColumns[j]['header']] = this.tot_mou_quantity;
		// 	}

		// }
		this.export_list.push(foot);
	}

	exportExcel() {
		this.exportData();
		this.exportService.exportExcel(this.export_list, 'Discount-Master');
	}

	onResetForm() {
		this.addDiscountForm.reset();
	}



}
