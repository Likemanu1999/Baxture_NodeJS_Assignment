import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CrudServices } from '../../../shared/crud-services/crud-services';
import { ExportService } from '../../../shared/export-service/export-service';
import { forexReports } from '../../../shared/apis-path/apis-path';
import { staticValues } from '../../../shared/common-service/common-service';
import { ToasterConfig, ToasterService } from 'angular2-toaster';

@Component({
  selector: 'app-forex-avg-report',
  templateUrl: './forex-avg-report.component.html',
  styleUrls: ['./forex-avg-report.component.scss'],
	providers: [
		ExportService,
		ToasterService,
		CrudServices
	]
})
export class ForexAvgReportComponent implements OnInit {

public supplier_list= [];
public port_wise_list= [];
public mergerData = [];
  export_data: any;
  checkSupplierData: any;
  checkPortData: any = [];
  checkProductData: any = [];
  checkMainGradeData: any = [];
  checkGradeData: any = [];
  filteredValuess: any = []
  colss: any;
  exportColumns: any;
	pi_flag = [{ 'name': 'ALL', 'id': 4 }, { 'name': 'LC', 'id': 1 }, { 'name': 'NON-LC', 'id': 2 }, { 'name': 'Indent', 'id': 3 }];
	lc_flag = [{ 'name': 'ALL', 'id': 4 }, { 'name': 'Regular', 'id': 1 }, { 'name': 'Forward', 'id': 2 }, { 'name': 'High Seas', 'id': 3 }];
	pi_flag_status = 4;
	lc_flag_status = 4;
  supplierSumQty: Number;
  supplierSumAmnt: Number;
  portWiseSumQty: Number;
  productWiseSumQty: Number;
  mainGradeWiseSumQty: Number;
  gradeWiseSumQty: Number;
  portWiseSumAmnt: Number;
  productWiseSumAmnt: Number;
  mainGradeWiseSumAmnt: Number;
  gradeWiseSumAmnt: Number;
  datePickerConfig: any = staticValues.datePickerConfigNew;
  
	public toasterconfig: ToasterConfig =
	new ToasterConfig({
		tapToDismiss: true,
		timeout: 5000
	});
  currentYear: number;
  date = new Date();
  selected_date_range: Date[];
  maxDate:any;

  constructor(private exportService: ExportService, private datepipe: DatePipe, private CrudServices: CrudServices, private toasterService: ToasterService,) { }

  ngOnInit() {
    this.currentYear = Number(this.datepipe.transform(this.date, 'yyyy'));
    this.selected_date_range = [new Date(this.currentYear, 3, 1), new Date(Number(this.currentYear + 1), 2, 31)];
    this.fetchForexReport();
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
  fetchForexReport(){
	this.pi_flag_status = this.pi_flag_status ? this.pi_flag_status : 4;
	this.lc_flag_status = this.lc_flag_status ? this.lc_flag_status : 4;
    this.CrudServices.postRequest<any>(forexReports.getForexAvgReport,{
      dateRange: { 
        startDate: this.convert(this.selected_date_range[0]),
        endDate: this.convert(this.selected_date_range[1]),
      },
      piFlagStatus: this.pi_flag_status,
      lcFlagStatus: this.lc_flag_status
    }).subscribe((response) =>{
      console.log('Api call from forex reports',response);
	  if(response.message == "error"){
		this.toasterService.pop(response.message, response.message, response.data);
	  }else{
		  this.mergerData = [response.data[0], response.data[1], response.data[2], response.data[3], response.data[4]];
		  console.log('Api call from forex reports',this.mergerData);
		  this.checkSupplierData = this.mergerData[0];
		  this.checkPortData = this.mergerData[1];
		  this.checkProductData = this.mergerData[2];
		  this.checkMainGradeData = this.mergerData[3];
		  this.checkGradeData = this.mergerData[4];
	
		this.supplierSumQty = this.mergerData[0].reduce((acc, o) => acc + o.sumQunantity, 0);
		this.supplierSumAmnt = this.mergerData[0].reduce((acc, o) => acc + o.sumAmount, 0);

		this.portWiseSumQty = this.mergerData[1].reduce((acc, o) => acc + o.sumQunantity, 0);
		this.portWiseSumAmnt = this.mergerData[1].reduce((acc, o) => acc + o.sumAmount, 0);

		this.productWiseSumQty = this.mergerData[2].reduce((acc, o) => acc + o.sumQunantity, 0);
		this.productWiseSumAmnt = this.mergerData[2].reduce((acc, o) => acc + o.sumAmount, 0);

		this.mainGradeWiseSumQty = this.mergerData[3].reduce((acc, o) => acc + o.sumQunantity, 0);
		this.mainGradeWiseSumAmnt = this.mergerData[3].reduce((acc, o) => acc + o.sumAmount, 0);

		this.gradeWiseSumQty = this.mergerData[4].reduce((acc, o) => acc + o.sumQunantity, 0);
		this.gradeWiseSumAmnt = this.mergerData[4].reduce((acc, o) => acc + o.sumAmount, 0);
	  }
    })
  }

    // Supplier Data Export
	exportSupplierData() {
		let data = {};
		this.export_data = [];
		let qty = 0;
		let rate = 0;
		let amount = 0;

		for (const val of this.checkSupplierData) {
			data = {
				'Supplier Name': val.filterDataForName,
				'Quantity': val.sumQunantity,
				'Rate': val.avgRate,
				'Amount': val.sumAmount,
			};
			this.export_data.push(data);
			qty = qty + Number(val.sumQunantity);
			amount = amount + Number(val.sumAmount);
			// amount = amount + Number(val.sumAmount) / Number(val.sumQunantity) ;

		}

		const foot = {
			'Supplier Name': '',
			'Quantity': qty,
			'Rate': amount / qty,
			'Amount': amount,
		};
		this.export_data.push(foot);
	}

	// Supplier Export Excel
	exportSupplierExcel() {
		this.export_data = [];
		this.exportSupplierData();
		this.exportService.exportExcel(this.export_data, 'Sales Contract List Supplier Wise');
	}

	// Supplier Export PDF
	exportSupplierPdf() {
		this.export_data = [];
		this.exportSupplierData();
		this.exportColumns = [
			{ title: 'Supplier Name', dataKey: 'Supplier Name' },
			{ title: 'Quantity', dataKey: 'Quantity' },
			{ title: 'Rate', dataKey: 'Rate' },
			{ title: 'Amount', dataKey: 'Amount' }
		];
		this.exportService.exportPdf(this.exportColumns, this.export_data, 'Sales Contract List Supplier Wise');
	}
	
	// Supplier Filter
	onSupplierFilter(event, dt) {
		console.log('On filter', event)
		console.log('On filter dt', dt)
		// this.filteredValuess = [];
		// this.filteredValuess = event.filteredValue;
		this.checkSupplierData = event.filteredValue;
		// this.totalCalculation(this.filteredValuess);
	}



	// Port Data Export
	exportPortData() {
		let data = {};
		this.export_data = [];
		let qty = 0;
		let rate = 0;
		let amount = 0;

		for (const val of this.checkPortData) {
			data = {
				'Port Name': val.filterDataForName,
				'Quantity': val.sumQunantity,
				'Rate': val.avgRate,
				'Amount': val.sumAmount,
			};
			this.export_data.push(data);
			qty = qty + Number(val.sumQunantity);
			amount = amount + Number(val.sumAmount);
			// amount = amount + Number(val.sumAmount) / Number(val.sumQunantity) ;

		}

		const foot = {
			// 'Port Name': `Records: ${this.checkPortData.length}`,
			'Port Name': '',
			'Quantity': qty,
			'Rate': amount / qty,
			'Amount': amount,
		};
		this.export_data.push(foot);
	}

	// Supplier Export Excel
	exportPortExcel() {
		this.export_data = [];
		this.exportPortData();
		this.exportService.exportExcel(this.export_data, 'Sales Contract List Port Wise');
	}

	// Supplier Export PDF
	exportPortPdf() {
		this.export_data = [];
		this.exportPortData();
		this.exportColumns = [
			{ title: 'Port Name', dataKey: 'Port Name' },
			{ title: 'Quantity', dataKey: 'Quantity' },
			{ title: 'Rate', dataKey: 'Rate' },
			{ title: 'Amount', dataKey: 'Amount' }
		];
		this.exportService.exportPdf(this.exportColumns, this.export_data, 'Sales Contract List Supplier Wise');
	}

	// Port Filter
	onPortFilter(event, dt) {
		console.log('On filter', event)
		console.log('On filter dt', dt)
		// this.filteredValuess = [];
		// this.filteredValuess = event.filteredValue;
		this.checkPortData = event.filteredValue;
		// this.totalCalculation(this.filteredValuess);
	}
	


	// Product Data Export
	exportProductData() {
		let data = {};
		this.export_data = [];
		let qty = 0;
		let rate = 0;
		let amount = 0;

		for (const val of this.checkProductData) {
			data = {
				'Product Name': val.filterDataForName,
				'Quantity': val.sumQunantity,
				'Rate': val.avgRate,
				'Amount': val.sumAmount,
			};
			this.export_data.push(data);
			qty = qty + Number(val.sumQunantity);
			amount = amount + Number(val.sumAmount);
			// amount = amount + Number(val.sumAmount) / Number(val.sumQunantity) ;
		}

		const foot = {
			// 'Port Name': `Records: ${this.checkPortData.length}`,
			'Product Name': '',
			'Quantity': qty,
			'Rate': amount / qty,
			'Amount': amount,
		};
		this.export_data.push(foot);
	}

	// Product Export Excel
	exportProductExcel() {
		this.export_data = [];
		this.exportProductData();
		this.exportService.exportExcel(this.export_data, 'Sales Contract List Product Wise');
	}

	// Product Export PDF
	exportProductPdf() {
		this.export_data = [];
		this.exportProductData();
		this.exportColumns = [
			{ title: 'Product Name', dataKey: 'Product Name' },
			{ title: 'Quantity', dataKey: 'Quantity' },
			{ title: 'Rate', dataKey: 'Rate' },
			{ title: 'Amount', dataKey: 'Amount' }
		];
		this.exportService.exportPdf(this.exportColumns, this.export_data, 'Sales Contract List Product Wise');
	}

	// Product Filter
	onProductFilter(event, dt) {
		console.log('On filter', event)
		console.log('On filter dt', dt)
		// this.filteredValuess = [];
		// this.filteredValuess = event.filteredValue;
		this.checkProductData = event.filteredValue;
		// this.totalCalculation(this.filteredValuess);
	}


	// Main Grade Data Export
	exportMainGradeData() {
		let data = {};
		this.export_data = [];
		let qty = 0;
		let amount = 0;

		for (const val of this.checkMainGradeData) {
			data = {
				'Product Name': val.productName,
				'Main Grade Name': val.filterDataForName,
				'Quantity': val.sumQunantity,
				'Rate': val.avgRate,
				'Amount': val.sumAmount,
			};
			this.export_data.push(data);
			qty = qty + Number(val.sumQunantity);
			amount = amount + Number(val.sumAmount);
			// amount = amount + Number(val.sumAmount) / Number(val.sumQunantity) ;
		}

		const foot = {
			// 'Port Name': `Records: ${this.checkPortData.length}`,
			'Product Name': '',
			'Main Grade Name': '',
			'Quantity': qty,
			'Rate': amount / qty,
			'Amount': amount,
		};
		this.export_data.push(foot);
	}

	// Main Grade Export Excel
	exportMainGradeExcel() {
		this.export_data = [];
		this.exportMainGradeData();
		this.exportService.exportExcel(this.export_data, 'Sales Contract List Product Wise');
	}

	// Main Grade Export PDF
	exportMainGradePdf() {
		this.export_data = [];
		this.exportMainGradeData();
		this.exportColumns = [
			{ title: 'Product Name', dataKey: 'Product Name' },
			{ title: 'Main Grade Name', dataKey: 'Main Grade Name' },
			{ title: 'Quantity', dataKey: 'Quantity' },
			{ title: 'Rate', dataKey: 'Rate' },
			{ title: 'Amount', dataKey: 'Amount' }
		];
		this.exportService.exportPdf(this.exportColumns, this.export_data, 'Sales Contract List Main Grade Wise');
	}

	// Main Grade Filter
	onMainGradeFilter(event, dt) {
		console.log('On filter', event)
		console.log('On filter dt', dt)
		this.checkMainGradeData = event.filteredValue;
	}

	// Grade Data Export
	exportGradeData() {
		let data = {};
		this.export_data = [];
		let qty = 0;
		let amount = 0;

		for (const val of this.checkGradeData) {
			data = {
				'Product Name': val.productName,
				'Main Grade Name': val.mainGradeName,
				'Grade Name': val.filterDataForName,
				'Quantity': val.sumQunantity,
				'Rate': val.avgRate,
				'Amount': val.sumAmount,
			};
			this.export_data.push(data);
			qty = qty + Number(val.sumQunantity);
			amount = amount + Number(val.sumAmount);
			// amount = amount + Number(val.sumAmount) / Number(val.sumQunantity) ;
		}

		const foot = {
			// 'Port Name': `Records: ${this.checkPortData.length}`,
			'Product Name': '',
			'Main Grade Name': '',
			'Grade Name': '',
			'Quantity': qty,
			'Rate': amount / qty,
			'Amount': amount,
		};
		this.export_data.push(foot);
	}

	// Grade Export Excel
	exportGradeExcel() {
		this.export_data = [];
		this.exportGradeData();
		this.exportService.exportExcel(this.export_data, 'Sales Contract List Grade Wise');
	}

	// Grade Export PDF
	exportGradePdf() {
		this.export_data = [];
		this.exportGradeData();
		this.exportColumns = [
			{ title: 'Product Name', dataKey: 'Product Name' },
			{ title: 'Main Grade Name', dataKey: 'Main Grade Name' },
			{ title: 'Grade Name', dataKey: 'Grade Name' },
			{ title: 'Quantity', dataKey: 'Quantity' },
			{ title: 'Rate', dataKey: 'Rate' },
			{ title: 'Amount', dataKey: 'Amount' }
		];
		this.exportService.exportPdf(this.exportColumns, this.export_data, 'Sales Contract List Main Grade Wise');
	}

	// Grade Filter
	onGradeFilter(event, dt) {
		console.log('On filter', event)
		console.log('On filter dt', dt)
		this.checkGradeData = event.filteredValue;
	}

  getData(){
    console.log('Date range', this.selected_date_range);
    console.log('pi_flag_status', this.pi_flag_status);
  }

}
