import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation, } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { StateMaster } from '../../../shared/apis-path/apis-path';
import { CrudServices } from '../../../shared/crud-services/crud-services';
pdfMake.vfs = pdfFonts.pdfMake.vfs;




@Component({
	selector: 'app-delivery-challan-pdf',
	templateUrl: './delivery-challan-pdf.component.html',
	styleUrls: ['./delivery-challan-pdf.component.css'],
	providers: [DatePipe, CrudServices]
})
export class DeliveryChallanPdfComponent implements OnInit {
	@Input() checkArr: any;
	@Output() emitFunctionPdf: EventEmitter<any> = new EventEmitter<any>();
	port_state: any = '';
	godown_state: any = '';
	state_code_godown: any;
	state_code_port: any;

	constructor(private datePipe: DatePipe, private crudServices: CrudServices) {

	}

	ngOnInit() {


		this.getpdf();

		this.emitFunctionPdf.emit(false);

	}




	async getpdf() {


		let val = this.checkArr;
		let signArr = [];
		let signature = 'assets/img/blank.png';


		if (val.godown.godown_incharge_sign != null) {
			signArr = JSON.parse(val.godown.godown_incharge_sign);
			if (signArr.length) {
				signature = signArr[0];
			}
		}

		let g_state_code = '';
		let port_state_code = '';
		let godown_state = '';
		let port_state = '';

		if (val.godown_state_code) {
			g_state_code = val.godown_state_code
		}

		if (val.port_state_code) {
			port_state_code = val.port_state_code
		}

		if (val.godown_state) {
			godown_state = val.godown_state
		}


		if (val.port_state) {
			port_state = val.port_state
		}


		var documentDefinition = {

			pageSize: 'B3',
			// pageOrientation: 'landscape',

			// [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
			pageMargins: [70, 40, 40, 60],
			content: [

				{ text: 'ORIGINAL FOR CONSIGNEE', style: 'subheader', fontSize: 10, alignment: 'right' },
				{
					style: 'tableExample',
					color: '#444',
					headerRows: 2,
					widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
					table: {

						// keepWithHeaderRows: 1,
						body: [
							[
								{
									text: [
										{ text: 'Delivery Challan ', fontSize: '16', bold: true, alignment: 'center', },
										{ text: '\n ', fontSize: 12, },
										{ text: '\n ', fontSize: 12, },
									],

									border: [true, true, true, false],
									colSpan: 16,
								}, {}, {}, {}, {}, {},
								{}, {}, {}, {}, {}, {}, {}, {}, {}, {},

							],

							[
								{
									text: [
										{ text: 'Delivery challan no. :  ' + val.delivery_challen_no, fontSize: '12', bold: true, alignment: 'right', },
										{ text: '\n Delivery challan Date. : ' + this.datePipe.transform(val.delivery_challen_dt, 'dd-MM-yyyy'), fontSize: '12', bold: true, alignment: 'right', },
										{ text: '\n ', fontSize: 12, },

									],

									border: [true, false, true, true],
									colSpan: 16,
								}, {}, {}, {}, {}, {},
								{}, {}, {}, {}, {}, {}, {}, {}, {}, {},

							],
							[
								{
									text: [
										{ text: 'Consigner Details: Sushila Parmar International Pvt Ltd', fontSize: '12' },
										{ text: '\n Name : ' + val.port_master.port_full_name, fontSize: 12, },
										{ text: '\n Address : ' + val.port_master.port_address, fontSize: 12, },
										{ text: '\n State : ' + port_state, fontSize: 12, },
										{ text: '\n State Code: ' + port_state_code, fontSize: 12, },
										{ text: '\n GSTN/UIN: ' + val.port_master.gst_no, fontSize: 12, },
										{ text: '\n BE No: ' + val.be_number, fontSize: 12, },

									],

									border: [true, true, false, false],
									colSpan: 8,
								}, {}, {}, {}, {}, {}, {}, {},
								{
									text: [
										{ text: 'Consignee Details: Sushila Parmar International Pvt Ltd', fontSize: '12' },
										{ text: '\n Name : ' + val.godown.godown_name, fontSize: 12, },
										{ text: '\n Address : ' + val.godown.godown_address, fontSize: 12, },
										{ text: '\n State :' + godown_state, fontSize: 12, },
										{ text: '\n State Code: ' + g_state_code, fontSize: 12, },
										{ text: '\n GSTN/UIN: ' + val.godown.gst_no, fontSize: 12, },
										{ text: '\n ', fontSize: 12, },
										{ text: '\n ', fontSize: 12, },
										{ text: '\n Place of Supply (in case of interstate movement)', fontSize: 12, },
										{ text: '\n State : ' + godown_state, fontSize: 12, },
										{ text: '\n State Code: '+ + g_state_code, fontSize: 12, },
										{ text: '\n ', fontSize: 12, },
										{ text: '\n ', fontSize: 12, },


									],

									border: [false, true, true, false],
									colSpan: 8,
									alignment: 'left'
								}, {}, {}, {}, {}, {}, {}, {},

							],

							[
								{
									text: 'sr no.',
									fontSize: 12,
									bold: true,
									rowSpan: 2,
									style: "header",
									alignment: 'left',

								},
								{
									text: 'Description of goods',
									fontSize: 12,
									bold: true,
									rowSpan: 2,
									style: "header",
									alignment: 'center',


								},
								{
									text: 'HSN/SAC Code',
									fontSize: 11,
									bold: true,
									rowSpan: 2,
									style: "header",
									alignment: 'left',

								},
								{
									text: 'Quantity',
									fontSize: 11,
									bold: true,
									rowSpan: 2,
									style: "header",
									alignment: 'center'

								},
								{
									text: 'Unit',
									fontSize: 11,
									bold: true,
									rowSpan: 2,
									style: "header",
									alignment: 'center',

								},
								{
									text: 'Rate',
									fontSize: 11,
									bold: true,
									rowSpan: 2,
									style: "header",
									alignment: 'center',

								},
								{
									text: 'Taxable Value',
									fontSize: 11,
									bold: true,
									rowSpan: 2,
									style: "header",
									alignment: 'center',

								},
								{
									text: 'EGST/UGST',
									fontSize: 11,
									bold: true,
									colSpan: 2,
									alignment: 'center',



								}, {},
								{
									text: 'SGST ',
									fontSize: 11,
									bold: true,
									colSpan: 2,
									style: "header",
									alignment: 'center',

								}, {},
								{
									text: 'IGST ',
									fontSize: 11,
									bold: true,
									colSpan: 2,
									style: "header",
									alignment: 'center',

								}, {},
								{
									text: 'CESS ',
									fontSize: 11,
									bold: true,
									colSpan: 2,
									style: "header",
									alignment: 'center',

								},
								{},
								{

									text: 'Total Val ',
									fontSize: 11,
									bold: true,
									rowSpan: 2,
									style: "header",
									alignment: 'center',

								},


							],
							[{}, {}, {}, {}, {}, {}, {}, { text: 'Rate', fontSize: 11 }, { text: 'Amount', fontSize: 11 }, { text: 'Rate', fontSize: 11 }, { text: 'Amount', fontSize: 11 }, { text: 'Rate', fontSize: 11 }, { text: 'Amount', fontSize: 11 }, { text: 'Rate', fontSize: 11 }, { text: 'Amount', fontSize: 11 }, {}
							],
							[{ text: '1', fontSize: 11 }, { text: val.product_master.desc_goods, fontSize: 11, alignment: 'center' }, { text: val.product_master.hsn_code, fontSize: 11, alignment: 'center' }, { text: (val.net_wt).toFixed(2), fontSize: 11, alignment: 'center' }, { text: 'MT', fontSize: 11, alignment: 'center' }, { text: (val.acs_val_per_cntr / (val.net_wt)).toFixed(2), fontSize: 11, alignment: 'center' }, { text: (val.net_wt * (val.acs_val_per_cntr / (val.net_wt))).toFixed(2), fontSize: 11, alignment: 'center' }, { text: '-', fontSize: 11, alignment: 'center' }, { text: '-', fontSize: 11 }, { text: '-', fontSize: 11 }, { text: '-', fontSize: 11 }, { text: 0.18, fontSize: 11 }, { text: (val.acs_val_per_cntr * 0.18).toFixed(2), fontSize: 11 }, { text: '-', fontSize: 11 }, { text: '-', fontSize: 11 }, { text: (val.acs_val_per_cntr + (val.acs_val_per_cntr * 0.18)).toFixed(2) }
							],

							[
								{
									text: [
										{ text: '\n ', fontSize: 12, },
										{ text: 'Declaration Terms and Condition', fontSize: '12' },


									],

									border: [true, true, false, false],
									colSpan: 8,
								}, {}, {}, {}, {}, {}, {}, {},
								{


									// image: await this.getBase64ImageFromURL(
									// 	'assets/img/brand/parmar_logo.png'
									// ),

									 image: await this.getBase64ImageFromURL(
									  signature
									    ),



									width: 100,
									height: 40,



									border: [false, true, true, false],
									colSpan: 8,
									alignment: 'left'
								}, {}, {}, {}, {}, {}, {}, {},

							],


							[
								{
									text: [

										{ text: '\n ', fontSize: 12, },
										{ text: '\n Certified that the perticular given above are true and correct', fontSize: 12, },


									],

									border: [true, false, false, true],
									colSpan: 8,
								}, {}, {}, {}, {}, {}, {}, {},
								{



									//border: [true, true, false, true],
									text: [


										{ text: '\n' + val.godown.godown_incharge_name, fontSize: 12, },
										{ text: '\n Godown Incharge ', fontSize: 12, },



									],

									border: [false, false, true, true],
									colSpan: 8,
									alignment: 'left'
								}, {}, {}, {}, {}, {}, {}, {},

							],

						],

					}
				},
			],

			styles: {
				header: {
					fontSize: 18,
					bold: true,
					margin: [0, 0, 0, 10]
				},
				tableExample: {
					margin: [20, 8, 0, 20]
				},
				tableHeader: {
					bold: true,
					fontSize: 13,
					color: 'black'
				}
			}
		};

		try {
			pdfMake.createPdf(documentDefinition).open();
		}
		catch (err) {
			console.log(err);

		}



	}


	getBase64ImageFromURL(url) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			// img.setAttribute('crossOrigin', 'anonymous');

			img.crossOrigin = "Anonymous";

			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;

				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0);

				const dataURL = canvas.toDataURL('image/png');

				resolve(dataURL);
			};

			img.onerror = error => {
				reject(error);
			};

			img.src = url;
		});
	}



	




}
