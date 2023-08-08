import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster/angular2-toaster';
import { GradeMaster, MainOrg, SubOrg, PriceList } from '../../../shared/apis-path/apis-path';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
	selector: 'app-sales-purchase-price-list',
	templateUrl: './sales-purchase-price-list.component.html',
	styleUrls: ['./sales-purchase-price-list.component.scss'],
	providers: [CrudServices, ToasterService, ExportService]
})
export class SalesPurchasePriceListComponent implements OnInit {


	columnFrirght = [];
	colsFrirght = [];
	DataListFrieght = [];
	downLoadColumnDataFrieght: any = [];
	downLoadDataListFrieght: any = [];
	export_list_frieght = [];
	uploadFreight: boolean = false;
	addFreightListForm: FormGroup;
	isLoading: boolean = false;

	column = [];
	cols = [];
	DataList = [];
	downLoadColumnData: any = [];
	downLoadDataList: any = [];
	export_list = [];
	uploadPriceList: boolean = false;
	addPriceListForm: FormGroup;
	docPriceList: any;

	polymerManufacturer = [];
	selectFreightOrPrice: any;

	public toasterconfig: ToasterConfig =
		new ToasterConfig({
			tapToDismiss: true,
			timeout: 5000
		});

	constructor(private CrudServices: CrudServices, private toasterService: ToasterService, private exportService: ExportService) {

		this.addPriceListForm = new FormGroup({
			'change_date': new FormControl(null, Validators.required),
			'cash_discount': new FormControl(null, Validators.required),
			'other_discount': new FormControl(null, Validators.required),
			'bcd': new FormControl(null),
			'sws': new FormControl(null)
		});

		this.addFreightListForm = new FormGroup({
			'change_date': new FormControl(null, Validators.required)
		});

		this.CrudServices.getRequest<any>(SubOrg.getPetrochemicalManufacture).subscribe(response => {
			this.polymerManufacturer = response;
		});


	}

	ngOnInit() {
	}

	onRadioChange(event) {
		this.selectFreightOrPrice = event.value;
	}
	onSelectManufacture(event) {
		this.CrudServices.postRequest<any>(GradeMaster.getManufactureWiseGrade, { petro_manu_org_id: event.org_id }).subscribe((response) => {

			let Columnobj = [];
			let ColumnData = response.location;
			for (let elem_col of ColumnData) {
				Columnobj.push({ header: elem_col.location, field: elem_col.location })
			}

			this.downLoadColumnData = Columnobj;
			this.downLoadDataList = response.grade;

		});
		this.CrudServices.postRequest<any>(MainOrg.getManufactureSupplyDestination, { org_id: event.org_id }).subscribe((response) => {
			this.downLoadColumnDataFrieght = [];
			this.downLoadDataListFrieght = [];
			if (response) {
				let ColumnData = Object.keys(response[0]);
				let Columnobj = [];
				for (let i = 0; i < ColumnData.length; i++) {
					Columnobj.push({ header: ColumnData[i], field: ColumnData[i] })
				}
				this.downLoadColumnDataFrieght = Columnobj;
				this.downLoadDataListFrieght = response;
			}

		});

	}


	exportDataFrieght() {
		if (this.downLoadDataListFrieght) {
			this.export_list_frieght = [];
			for (let i = 0; i < this.downLoadDataListFrieght.length; i++) {
				const exportList = {};
				for (let j = 0; j < this.downLoadColumnDataFrieght.length; j++) {
					exportList[this.downLoadColumnDataFrieght[j]['header']] = this.downLoadDataListFrieght[i][this.downLoadColumnDataFrieght[j]['field']];
				}
				this.export_list_frieght.push(exportList);
			}
		}
	}

	exportExcelFrieght() {

		this.exportDataFrieght();
		this.exportService.exportExcel(this.export_list_frieght, 'Frieght-List');
	}

	uploadFileFrightList(ev) {
		this.uploadFreight = true;

		let workBook = null;
		let jsonData = null;
		const reader = new FileReader();
		const file = ev.target.files[0];
		reader.onload = (event) => {
			const data = reader.result;
			workBook = XLSX.read(data, { type: 'binary' });
			jsonData = workBook.SheetNames.reduce((initial, name) => {
				const sheet = workBook.Sheets[name];
				initial[name] = XLSX.utils.sheet_to_json(sheet);
				return initial;
			}, {});


			const dataString: any = JSON.stringify(jsonData);
			this.columnFrirght = Object.keys((JSON.parse(JSON.stringify(jsonData))).data[0]);
			let ColumnData = this.columnFrirght
			let obj = [];
			for (let i = 0; i < ColumnData.length; i++) {
				obj.push({ header: ColumnData[i], field: ColumnData[i] })
			}
			this.colsFrirght = obj;
			this.DataListFrieght = (JSON.parse(JSON.stringify(jsonData))).data;


		}
		reader.readAsBinaryString(file);
	}

	onSubmitFreightList() {
		this.isLoading = true;

		let change_date = this.addFreightListForm.value.change_date;
		this.CrudServices.postRequest<any>(PriceList.addFrieght, { data: this.DataListFrieght, change_date: change_date }).subscribe((response) => {
			this.isLoading = false;
			this.toasterService.pop(response.message, response.data, response.data);

		});
	}



	exportData() {
		if (this.downLoadDataList) {
			this.export_list = [];
			for (let i = 0; i < this.downLoadDataList.length; i++) {
				const exportList = {};
				for (let j = 0; j < this.downLoadColumnData.length; j++) {
					exportList[this.downLoadColumnData[j]['header']] = this.downLoadDataList[i][this.downLoadColumnData[j]['field']];
				}

				this.export_list.push(exportList);
			}

		}
	}

	exportExcel() {

		this.exportData();
		this.exportService.exportExcel(this.export_list, 'Price-List');
	}


	uploadFilePriceList(ev) {
		this.uploadPriceList = true;
		//this.docPriceList = ev.target.files[0];
		let workBook = null;
		let jsonData = null;
		const reader = new FileReader();
		const file = ev.target.files[0];
		reader.onload = (event) => {
			const data = reader.result;
			workBook = XLSX.read(data, { type: 'binary' });
			jsonData = workBook.SheetNames.reduce((initial, name) => {
				const sheet = workBook.Sheets[name];
				initial[name] = XLSX.utils.sheet_to_json(sheet);
				return initial;
			}, {});
			const dataString: any = JSON.stringify(jsonData);


			this.column = Object.keys((JSON.parse(JSON.stringify(jsonData))).data[0]);

			let ColumnData = this.column
			let obj = [];
			for (let i = 0; i < ColumnData.length; i++) {
				obj.push({ header: ColumnData[i], field: ColumnData[i] })
			}
			this.cols = obj;

			this.DataList = (JSON.parse(JSON.stringify(jsonData))).data;

		}
		reader.readAsBinaryString(file);
	}

	onSubmitPriceList() {

		this.isLoading = true;
		let change_date = this.addPriceListForm.value.change_date;
		let cash_discount = this.addPriceListForm.value.cash_discount;
		let other_discount = this.addPriceListForm.value.other_discount;
		let bcd = this.addPriceListForm.value.bcd;
		let sws = this.addPriceListForm.value.sws;

		//VIIP Code 
		let priceListArray = [];
		for (let dl = 0; dl <= this.DataList.length; dl++) {
			if (this.DataList[dl]) {
				for (const [key, value] of Object.entries(this.DataList[dl])) {
					let cityObj;
					if (key == 'petro_manu_org_id' || key == 'grade_id' || key == 'grade_name') {
					} else {
						cityObj = {
							manu_org_id: Number(this.DataList[dl].petro_manu_org_id),
							city_id: Number((key.split(/[_]+/))[1]),
							basic_rate: Number(value),
							grade_id: this.DataList[dl].grade_id,
							change_date: change_date,
							cash_discount: Number(cash_discount),
							other_discount: Number(other_discount),
							bcd: bcd,
							sws: sws,
						}
						priceListArray.push(cityObj)
					}
				}
			}

		}
		this.CrudServices.postRequest<any>(PriceList.addPriceList, { data: priceListArray }).subscribe((response) => {
			this.isLoading = false;
			this.toasterService.pop(response.message, response.data, response.data);
			this.addPriceListForm.reset();
		});
	}

	onFilter(event, dt) {

	}
}
