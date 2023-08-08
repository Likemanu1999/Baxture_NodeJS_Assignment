import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry, tap, timeout } from 'rxjs/operators';

import { AmountToWordPipe } from '../../shared/amount-to-word/amount-to-word.pipe';
import { Consignments } from '../../shared/apis-path/apis-path';
import { CrudServices } from '../../shared/crud-services/crud-services';
import { Injectable } from '@angular/core';
import { InrCurrencyPipe } from '../../shared/currency/currency.pipe';
import { environment } from '../../../environments/environment';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import { throwError } from 'rxjs';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Injectable({
    providedIn: 'root'
})
export class GeneratePdfService {
    constructor(private http: HttpClient, private AmountToWordPipe: AmountToWordPipe, private datePipe: DatePipe, private CurrencyPipe: InrCurrencyPipe, private CrudServices: CrudServices) { }
    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('An error occurred:', error.error.message);
        } else {
            console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
        }
        return throwError('Something bad happened; please try again later.');
    }



    async updateFileInsideS(data) {
        return this.http.post<any>(environment.serverUrl + 'api/organization/addOrgContactPerson', data).pipe(catchError(this.handleError), tap(resData => {

        }));
    }


    slashSplit(str) {
        return str.split("/").slice(0, -1);
    }


    async generatePOCopy(data, mode) {
        console.log(data);
        let titleData = "";
        let image = "";
        let subTitle = "";
        let authorised_company_name = "";
        let buyer_billing_address = "";
        if (data.company_id == 3) {
            titleData = 'SURISHA \n';
            image = 'assets/img/brand/surisha_logo.png';
            subTitle = '(A DIVISION OF SUSHILA PARMAR INTERNATIONAL PVT. LTD.)\n';
            authorised_company_name = "For Surisha\n(A Division of Sushila Parmar International Pvt. Ltd.)";
            buyer_billing_address = `Buyer / Billing Address:
            SURISHA
            (A DIVISION OF SUSHILA PARMAR INTERNATIONAL PVT. LTD.)
            ${data.godown_address}.\n GST NO.: ${data.godown_gst_no}`;
        } else {
            titleData = 'Sushila Parmar International Pvt. Ltd.\n';
            image = 'assets/img/brand/parmar_logo.png';
            authorised_company_name = "For Sushila Parmar International Pvt. Ltd ";
            buyer_billing_address= `Buyer / Billing Address:
            Sushila Parmar International Pvt. Ltd.
            ${data.godown_address}.\n GST NO.: ${data.godown_gst_no}`; 
        }

        let basicAmt = Number((data.quantity) * Number(data.rate));
        let gstAmount = data.gst_percentege ? Math.round(basicAmt * (Number(data.gst_percentege) / 100)) : 0;

        let lable_tds_tcs = '';
        let tcs_tds_amt = 0;

        let totalAmt = 0;

        lable_tds_tcs = 'Less TDS to be deducted';

        if (data.tds_percent > 0) {
            lable_tds_tcs = 'Less TDS to be deducted';
            tcs_tds_amt = Math.round(basicAmt * (data.tds_percent / 100))
        } else {
            lable_tds_tcs = 'Less TDS to be deducted';
            tcs_tds_amt = Math.round(basicAmt * (Number(0.1) / 100))
        }


        // if (data.tcs_percent > 0) {
        //     lable_tds_tcs = 'Add TCS';
        //     tcs_tds_amt = ((basicAmt + gstAmount) / (data.tcs_percent / 100))
        // }

        let title = (mode == 0) ? 'PURCHASE ORDER' : 'PURCHASE ORDER (Revised)'

        totalAmt = Math.round((basicAmt + gstAmount) - tcs_tds_amt);
        // if (lable_tds_tcs == 'Add TCS') {
        //     totalAmt = basicAmt + gstAmount + tcs_tds_amt;

        // }
        // else if (lable_tds_tcs == 'Less TDS') {
        //     totalAmt = (basicAmt + gstAmount) - tcs_tds_amt;
        // }
        // else {
        //     totalAmt = (basicAmt + gstAmount)
        // }
        var dd = {
            // a string or { width: number, height: number }
            pageSize: 'A4',
            // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
            pageMargins: [10, 10, 10, 10],
            background: function (currentPage, pageSize) {
                return [
                    {
                        canvas: [
                            { type: 'line', x1: 10, y1: 35, x2: 585, y2: 35, lineWidth: 1 }, //Up line
                            { type: 'line', x1: 10, y1: 35, x2: 10, y2: 840, lineWidth: 1 }, //Left line
                            { type: 'line', x1: 10, y1: 840, x2: 585, y2: 840, lineWidth: 1 }, //Bottom line
                            { type: 'line', x1: 585, y1: 35, x2: 585, y2: 840, lineWidth: 1 }, //Rigth line
                        ]
                    }
                ]
            },



            content: [
                { text: `${title}`, fontSize: 10, alignment: 'center', decoration: 'underline' },
                { text: `Printed on : ${this.datePipe.transform(new Date(), "dd/MM/yyyy")}`, fontSize: 8, alignment: 'right' },

                '\n ',
                {
                    columns: [

                        {
                            image: await this.getBase64ImageFromURL(
                                image
                            ),
                            margin: [15, 0, 0, 0],
                            width: 65,
                            height: 65,
                        },
                        {
                            width: '*',
                            text: [
                                { text: titleData, fontSize: 18, bold: true, alignment: 'center' },
                                { text: subTitle, fontSize: 12, bold: true, alignment: 'center' },
                                { text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, Maharashtra, India.\n', fontSize: 8, alignment: 'center' },
                                { text: 'Corp. Office: 2nd & 3rd Floor, JDC Platinum Towers, Near Zambare Palace, Maharshi Nagar, Pune - 411037, Maharashtra, India.\n', fontSize: 8, alignment: 'center' },
                                { text: `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com | PAN: ${data.godown ? data.godown.gst_no ? data.godown.gst_no.substr(2, 10) : '' : ''}`, fontSize: 8, alignment: 'center' }
                            ],
                            margin: [30, 15, 0, 0]
                        }

                    ],

                },
                '\n ',

                {


                    table: {
                        widths: ['*', 'auto'],
                        body: [
                            [{
                                border: [false, true, true, true],
                                fontSize: 9,
                                margin: [10, 10, 10, 10],
                                rowSpan: 3,
                                text: `Seller : \n ${data.sub_org_name}
                                              Regd off: ${data.sub_org_master.org_address ? data.sub_org_master.org_address : ''}
                                              ${data.stateName ? 'State:' + data.stateName : ''}
                                              ${data.sub_org_master.gst_no ? '  GST : ' + data.sub_org_master.gst_no : ''}
                                              ${data.sub_org_master.gst_no ? '  PAN : ' + data.sub_org_master.gst_no.substr(2, 10) : ''} `
                            },
                            {
                                border: [true, true, false, true],
                                fontSize: 9,
                                // text: `Purchase Order No : ${data.id}- 2021`
                                text: `Purchase Order No.: ${this.getCurrentFinancialYear()}/SPIPL/PO/${data.id}\n`,
                            }],


                            [{},
                            {
                                border: [true, true, false, true],
                                fontSize: 9,
                                text: `Payment Terms :${data.PaymentTermName}`
                            }],



                            [{},
                            {
                                border: [true, true, false, true],
                                fontSize: 9,
                                //  text: `Delivery Terms :  ${data.delivery_term.term} to our  ${data.godown_name} Godown.\n ${data.deliveryText} `

                                text: `Delivery Terms :  ${data.delivery_term.term} \n ${data.deliveryText} `

                            }],

                            [{
                                border: [false, true, true, false],
                                fontSize: 9,
                                margin: [10, 10, 10, 10],
                                text: buyer_billing_address
                            },
                            {

                                border: [true, true, false, false],
                                fontSize: 9,
                                text: `Remark :  ${data.remark ? data.remark : ''}`
                            }]

                        ]
                    },
                    layout: {
                        defaultBorder: false,
                    },
                },


                {
                    table: {
                        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [{ border: [false, true, true, false], text: 'Sr. No', fontSize: '9' }, { text: 'Description Of Goods', fontSize: '9' }, { text: 'HSC/SAC Code', fontSize: '9', alignment: 'center' }, { text: 'Quantity', fontSize: '9', alignment: 'center' }, { text: 'Per', fontSize: '9', alignment: 'center' }, { text: 'Rate', fontSize: '9', alignment: 'center' }, { text: 'Amount', fontSize: '9', alignment: 'center' }],
                            [{ border: [false, true, true, false], text: '1' }, {
                                text: [
                                    { text: `  ${data.product_type_name}   -  ${data.grade_name}  \n\n\n`, fontSize: '9', margin: [10, 20, 10, 100] },
                                    { text: 'INPUT GST \n', fontSize: 9, alignment: 'right' },
                                    { text: `\n  ${lable_tds_tcs} \n\n`, fontSize: 9, alignment: 'right' }
                                ]

                            },
                            { text: `\n${data.hsn_code}`, fontSize: '9', alignment: 'center' },
                            {

                                text: [
                                    { text: `${this.CurrencyPipe.transform(Number(data.quantity))}`, fontSize: 9, alignment: 'center' },
                                    { text: `\n(${this.CurrencyPipe.transform(Number(data.quantity) * 40)} Bags`, fontSize: 9, alignment: 'center' },
                                    { text: `\n  of 25 kg each)`, fontSize: 7, alignment: 'center' },
                                ]
                            },
                            { text: `${data.unitName}`, fontSize: '9', alignment: 'center' },
                            { text: `${this.CurrencyPipe.transform(data.rate)} \n \n ${data.gst_percentege}% \n\n${data.tds_percent}'%`, fontSize: '9', alignment: 'center' },

                            {
                                text: [
                                    { text: `${this.CurrencyPipe.transform(data.quantity * data.rate)}`, fontSize: '9', alignment: 'center' },
                                    { text: `\n \n \n ${this.CurrencyPipe.transform((Number(data.quantity) * Number(data.rate)) * (data.gst_percentege / 100))}`, fontSize: '9', alignment: 'center' },
                                    { text: `\n\n${this.CurrencyPipe.transform(tcs_tds_amt)} \n\n`, fontSize: '9', alignment: 'center' },

                                ]
                            }],

                            [{ border: [false, true, true, true], text: '' }, { text: `Net Payble by SPIPL `, alignment: 'right', fontSize: '9' }, '', { text: ``, fontSize: '9', alignment: 'center' }, '',
                                '', { text: `${this.CurrencyPipe.transform(totalAmt)}`, fontSize: '9', alignment: 'center' }]
                        ]
                    },
                },
                {
                    margin: [10, 10, 5, 10],
                    text: [
                        { text: `Amount Payable (in Words) : `, fontSize: 10 },
                        { text: `${this.AmountToWordPipe.transform(totalAmt)}\n`, fontSize: 10 }

                    ]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 0.1 }] },
                {
                    margin: [10, 10, 5, 0],
                    text: [
                        { text: `Remarks :  `, fontSize: 9, bold: true, margin: [5, 5, 5, 5] },
                        { text: ` Being Purchase Order of ${data.product_type_name}  \n`, fontSize: 9, bold: true, margin: [5, 5, 5, 10] },
                        { text: ` Declaration  \n`, fontSize: 9, bold: true, margin: [5, 5, 5, 5] },
                        { text: ` We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct. `, fontSize: 9, margin: [5, 5, 5, 5] }

                    ]
                },
                '\n',
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 0.1 }] },
                { text: `Terms & Conditions`, fontSize: 9, bold: true, margin: [5, 5, 5, 3] },


                {
                    margin: [10, 10, 5, 0],
                    fontSize: 8,
                    text: [
                        { text: `Mandatory Terms & Conditions: \n`, fontSize: 9, bold: true },
                        { text: '1. Please Mention Terms of Delivery: ‘Ex-Godown’ OR ‘F.O.R. Delivered’.\n', bold: true, fontSize: 8 },
                        { text: '2. The detailed address of Material Dispatch from is mandatory: Address of Loading point/Godown/Warehouse/CFS/Port address with pin code.\n', bold: true, fontSize: 8 },
                        { text: '3. Our Purchase Order number is mandatory on Invoice & all documents related to this transaction, also need for releasing the payments.\n', bold: true, fontSize: 8 },
                        { text: '4. The Invoice & E-way Bill copies must have Address & Delivery Terms in all the documents as per details mentioned in the Purchase Order.\n', bold: true, fontSize: 8 },
                        { text: '5. The material COA is compulsory at the time of material delivery with Invoices.\n', bold: true, fontSize: 8 },
                        { text: '6. If any discrepancy found, please let us know immediately, else it shall be presumed that order is confirmed.\n', fontSize: 8 },
                        { text: '7. All goods must be packed, clearly marked and transported in accordance with the purchase order or, if not specified in the purchase order, in accordance with industry best practices.\n', fontSize: 8 },
                        { text: '8. The purchaser shall only be liable for payment to the supplier for the quantity of goods described in the purchase order\n', fontSize: 8 },
                        { text: '9. All prices in the purchase order shall be fixed unless otherwise stated in the purchase order.\n', fontSize: 8 },
                        { text: '10. Disputes (if any) will be subjected to Pune jurisdiction.\n', fontSize: 8 }

                    ],


                    // for numbered lists set the ol key
                    // ol: [
                    //     'If any deficiency found , Please let us know immediately, Else it shall be Presumed that order is confirmed',
                    //     'All goods must be packed, clearly marked and transported in accordance with the purchase order or, if not specified in the purchase order, in accordance with industry best practices ',
                    //     'The purchaser shall only be liable for payment to the supplier for the quantity of goods described in the purchase order ',
                    //     'All prices in the purchase order shall be fixed unless otherwise stated in the purchase order.',
                    //     'Disputes (if any) will be subjected to Pune jurisdiction.',
                    //     'Mandatory - The address of Material Loading point/Godown/Warehouse have to be mentioned in our Invoice as per the GST Rules & Regulatiions',
                    //     "Materail's COA is required at the time of Material delivery"

                    // ]
                },
                '\n',
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 0.1 }] },
                '\n',

                {
                    table: {
                        widths: ["*"],
                        body: [
                            [
                                { text: authorised_company_name, alignment: "right", border: [false, false, false, false], fontSize: 9 }
                            ]
                        ]
                    }

                },


                {
                    columns: [
                        {
                            image: await this.getBase64ImageFromURL(
                                'assets/img/sign.png'),
                            margin: [450, 0, 0, 0],
                            width: 62,
                            height: 62,


                        }
                    ],

                },
                {
                    text: 'Authorised Signatory',
                    fontSize: 9,
                    alignment: 'right',
                    margin: [0, 0, 50, 0]
                }

                // {
                //     text: [

                //         { text: '\n\n\n\n\n\n\n\n\n\n SUBJECT TO PUNE JURISDICTION', fontSize: 9, alignment: 'center'  ,margin: [0,200,0,0],},
                //         { text: '\n this is a Computer Generated Documnet', fontSize: 7, alignment: 'center' , margin: [0,200,0,0],}

                //      ]

                // }



            ],

            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 13,
                    color: 'black'
                }
            },
            defaultStyle: {
                // alignment: 'justify'
            }

        }



        return dd;



        // try {
        //     let emailBody: any;
        //    return await pdfMake.createPdf(dd).open();

        //     //   pdfDocGenerator.getBase64(data=>  {
        //     //     emailBody = {
        //     //      thepdf: data,
        //     //      tomail: "nitindube95@gmail.com",
        //     //      subject: 'Check Your Sale Report ',
        //     //      bodytext: '',
        //     //      filename: 'Salary_breakup.pdf'
        //     //    }
        //     //    		this.CrudServices
        //     // 					.postRequest<any>(Consignments.sendReportMail, emailBody)
        //     // 					.subscribe((response) => {
        //     // 					});
        //     //   })
        // }
        // catch (err) {
        // }
    }



    getCurrentFinancialYear() {
        var financial_year = "";
        var today = new Date();
        if ((today.getMonth() + 1) <= 3) {
            financial_year = (today.getFullYear() - 1).toString().substring(2, 4) + "-" + today.getFullYear().toString().substring(2, 4);
        } else {
            financial_year = today.getFullYear().toString().substring(2, 4) + "-" + (today.getFullYear() + 1).toString().substring(2, 4)
        }
        return financial_year;
    }


    async generatePDF(data, mode) {
        console.log(data);

        let title = (mode == 1) ? 'SALES ORDER(Revised)' : 'SALES ORDER ';
        if (data) {
            let basicAmt = 0;
            if (data.delivery_term_id != 3) {
                basicAmt = Number(data.quantity) * Number(data.sold_rate);
            } else {
                basicAmt = (Number(data.quantity) * Number(data.sold_rate)) + (Number(data.frieght_rate) * Number(data.quantity))
            }
            let gstAmount = Math.round(basicAmt * (Number(data.gst_percentege) / 100));
            let valid_till = 10;
            let lable_tds_tcs = '';
            let tcs_tds_amt = 0;
            let tds_value = 0;
            let tcs_value = 0;
            let tds_tcs_rate = 0;

            if (data.tds_percent > 0) {
                lable_tds_tcs = 'Less TDS to be deducted';
                tcs_tds_amt = Math.round((basicAmt * (Number(data.tds_percent) / 100)));
                tds_value = tcs_tds_amt;
                tds_tcs_rate = data.tds_percent;
            }

            if (data.tcs_percent > 0) {
                lable_tds_tcs = 'TCS to be added';
                tcs_tds_amt = Math.round(((basicAmt + gstAmount) * (Number(data.tcs_percent) / 100)));
                tcs_value = tcs_tds_amt;
                tds_tcs_rate = data.tcs_percent;
            }

            let minus_tds = Number((basicAmt + gstAmount) - tds_value);
            let recievable_amount = Number(minus_tds + tcs_value);

            var dd = {
                pageSize: 'A4',
                pageMargins: [10, 10, 10, 10],
                background: function (currentPage, pageSize) {
                    return [
                        {
                            canvas: [
                                { type: 'line', x1: 10, y1: 35, x2: 585, y2: 35, lineWidth: 1 }, //Up line
                                { type: 'line', x1: 10, y1: 35, x2: 10, y2: 830, lineWidth: 1 }, //Left line
                                { type: 'line', x1: 10, y1: 830, x2: 585, y2: 830, lineWidth: 1 }, //Bottom line
                                { type: 'line', x1: 585, y1: 35, x2: 585, y2: 830, lineWidth: 1 }, //Rigth line
                            ]
                        }
                    ]
                },
                content: [
                    { text: `${title}`, fontSize: 10, alignment: 'center', decoration: 'underline' },
                    { text: `Printed on : ${this.datePipe.transform(new Date(), "dd/MM/yyyy")}`, fontSize: 8, alignment: 'right' },
                    '\n ',
                    {
                        columns: [
                            {
                                image: await this.getBase64ImageFromURL(
                                    'assets/img/brand/parmar_logo.png'
                                ),
                                margin: [5, 0, 0, 10],
                                width: 65,
                                height: 65,
                            },
                            {
                                width: '*',
                                text: [
                                    { text: 'Sushila Parmar International Pvt. Ltd.\n', fontSize: 18, bold: true, alignment: 'center' },
                                    { text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, Maharashtra, India.\n', fontSize: 8, alignment: 'center' },
                                    { text: 'Corp. Office: 2nd & 3rd Floor, JDC Platinum Towers, Near Zambare Palace, Maharshi Nagar, Pune - 411037, Maharashtra, India.\n', fontSize: 8, alignment: 'center' },
                                    { text: `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com | PAN: ${data.godown ? data.godown.gst_no.substr(2, 10) : ''}`, fontSize: 8, alignment: 'center' },
                                    { text: `\n\n SO NO.: ${this.getCurrentFinancialYear()}/SPIPL/SO/${data.id}\n`, bold: true, fontSize: 9, alignment: 'right' },
                                    { text: `Booking Date: ${data.booking_date} \n\n`, fontSize: 9, bold: true, alignment: 'right' },
                                ],
                                margin: [0, 0, 5, 0]
                            }
                        ],

                    },
                    {
                        table: {
                            widths: ['50%', '50%'],
                            body: [
                                [
                                    {
                                        border: [true, true, true, true],
                                        text: [
                                            { text: `Seller :`, fontSize: 12, bold: true, color: '#000000' },
                                            { text: `\n Sushila Parmar International Pvt. Ltd. \n`, fontSize: 12 },
                                            { text: `\n ${data.godown ? data.godown.godown_address : '-'} \n`, fontSize: 9 },
                                            { text: `GST:${data.godown ? data.godown.gst_no : '-'} `, fontSize: 9 }
                                        ],
                                        alignment: 'left',
                                    },
                                    {
                                        border: [true, true, true, true],
                                        margin: [5, 0, 0, 0],
                                        text: [
                                            { text: `Buyer :`, fontSize: 12, bold: true, color: '#000000' },
                                            { text: `\n ${data.sub_org_master ? data.sub_org_name : ''}\n`, fontSize: 12 },
                                            { text: `\n ${data.sub_org_master.org_address ? data.sub_org_master.org_address : data.cityName}\n`, fontSize: 9 },
                                            { text: `State Name :-${data.sub_org_master.state_master ? data.sub_org_master.state_master.name : ''}\n`, fontSize: 9 },
                                            { text: `GST: ${data.sub_org_master.gst_no ? data.sub_org_master.gst_no : ''} | PAN: ${data.sub_org_master.gst_no ? data.sub_org_master.gst_no.substr(2, 10) : ''}  `, fontSize: 9 }
                                        ],
                                        alignment: 'left'
                                    }
                                ]
                            ]
                        },
                    },

                    {
                        table: {
                            widths: ['*', '*'],
                            body: [
                                [
                                    {
                                        border: [true, false, false, false],
                                        text: [
                                            { text: `\n Terms Of Delivery : ${data.delivery_term ? data.delivery_term.term : ''}\n`, fontSize: 9 },
                                            { text: `\n Order Validity: ${this.datePipe.transform(new Date((new Date(data.booking_date)).getTime() + (valid_till * 86400000)))} \n`, fontSize: 9 },
                                            { text: `\n\n Dispatch Location From : ${data.godown_name} Godown\n`, fontSize: 9 },
                                        ],
                                        alignment: 'left',
                                    },
                                    {

                                        border: [false, false, true, false],
                                        margin: [0, 0, 0, 0],
                                        text: [
                                            { text: `\n Name Of Transporter : \n`, fontSize: 9 },
                                            { text: `\n Payment Term: ${data.payment_terms_label}  `, fontSize: 8 },
                                            { text: `(Interest @ 24% will be charged on delayed payment)\n`, fontSize: 9 },

                                            { text: ` \n ${(data.delivery_term_id && data.delivery_term_id == 1) ? '' : 'Buyer is liable for generation of E-way bill.'}`, fontSize: 9 }
                                        ],
                                        alignment: 'left'
                                    }
                                ]
                            ]
                        },
                    },

                    {
                        table: {
                            headerRows: 0,
                            margin: [-30, 3, 3, 3],
                            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    { text: 'SI No.', fontSize: 9, alignment: 'center', border: [true, true, true, true] },
                                    { text: 'Description of Goods ', fontSize: 9, border: [true, true, true, true] },
                                    { text: 'HSN/SAC', fontSize: 9, alignment: 'center', border: [true, true, true, true] },
                                    { text: 'Quantity', fontSize: 9, alignment: 'center', border: [true, true, true, true] },
                                    { text: 'Per', fontSize: 9, alignment: 'center', border: [true, true, true, true] },
                                    { text: 'Rate', fontSize: 9, alignment: 'center', border: [true, true, true, true] },
                                    { text: 'Amount', fontSize: 9, alignment: 'center', border: [true, true, true, true] }
                                ],
                                [
                                    { text: `1`, fontSize: 9 },
                                    {
                                        text: [
                                            { text: `${data.grade_master.main_grade.product_master.name}  -  ${data.gradeName} `, fontSize: 9 },
                                            '\n\n',
                                            { text: ``, fontSize: 9 },

                                            { text: `Output GST`, fontSize: 9, alignment: 'right' },
                                            '\n',
                                            { text: `${lable_tds_tcs}`, fontSize: 9, alignment: 'right' },
                                        ],
                                    },
                                    { text: `${data.hsn_code}`, fontSize: 9, alignment: 'center' },

                                    {
                                        text: [
                                            { text: `${this.CurrencyPipe.transform(Number(data.quantity))} ${data.unitName} `, fontSize: 9, alignment: 'center' },
                                            { text: `\n(${this.CurrencyPipe.transform(Number(data.quantity) * 40)} Bags`, fontSize: 7, alignment: 'center' },
                                            { text: `\n  of 25 kg each)`, fontSize: 7, alignment: 'center' },
                                        ]
                                    },
                                    { text: ` ${data.unitName}`, fontSize: 9, alignment: 'center' },
                                    {
                                        text: [{ text: `${this.CurrencyPipe.transform(data.sold_rate.toFixed(2))}`, fontSize: 9, alignment: 'center' },
                                            '\n\n',
                                        { text: `${(data.gst_percentege > 0) ? data.gst_percentege : 0}%`, fontSize: 9, alignment: 'center' },
                                        { text: `\n ${tds_tcs_rate}%`, fontSize: 9, alignment: 'center' }
                                        ]
                                    },
                                    {
                                        text: [{ text: `${this.CurrencyPipe.transform(basicAmt.toFixed(2))}`, fontSize: 9, alignment: 'right' },
                                            '\n\n',
                                        { text: `${this.CurrencyPipe.transform(gstAmount.toFixed(2))}`, fontSize: 9, alignment: 'right' },
                                        { text: `\n ${this.CurrencyPipe.transform(tcs_tds_amt.toFixed(2))}`, fontSize: 9, alignment: 'right' }
                                        ]
                                    }
                                ],
                                [
                                    { text: '', fontSize: 9 },
                                    { text: ` Net Payble to  SPIPL `, fontSize: 9, alignment: 'right' },
                                    { text: '', fontSize: 9 },
                                    { text: ``, fontSize: 9, alignment: 'center' },
                                    { text: ``, fontSize: 9 },
                                    { text: '', fontSize: 9 },
                                    { text: `${this.CurrencyPipe.transform(recievable_amount.toFixed(2))}`, fontSize: 9, alignment: 'center' }
                                ],
                            ]
                        },


                    },

                    {
                        margin: [10, 10, 5, 10],
                        text: [
                            { text: `Amount Receivable (in Word) : `, fontSize: 10 },
                            { text: `${this.AmountToWordPipe.transform(recievable_amount)}\n`, fontSize: 10 }
                        ]
                    },
                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }] },
                    {
                        margin: [10, 10, 5, 0],
                        text: [
                            { text: `Remarks :  `, fontSize: 9, bold: true },
                            { text: ` Being Sales Order of PVC Resin (${data.gradeName}) \n`, fontSize: 9, bold: true, },
                            { text: ` Declaration  \n`, fontSize: 9, bold: true },
                            { text: ` We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.\n [Whether tax is payable on Reverse Charge Basis : No] `, fontSize: 9 }

                        ]
                    },
                    '\n',
                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }] },
                    { text: 'Terms and Conditions', fontSize: 9, bold: true },
                    {
                        margin: [10, 10, 5, 0],
                        fontSize: 8,
                        // for numbered lists set the ol key

                        ol: [
                            'If no objection received within 3 hours (from sent time over email) for the sales order / invoice, it will be presumed as confirmed & accepted by buyer.',
                            'Goods once sold will not be taken back at any condition.',
                            'In case of advance payment deals, advance amount must be paid to seller from buyer side within 10 days of the sales order / deal confirmation date or decided time (whichever is earlier) at time of deal confirmation. If buyer fails to do so,then it is 100% seller choice to keep the deal / modify the deal / cancel the deal.',
                            'In case any disputes arises (including delay payments without good consent of seller), seller has full right to go for legal action for payment recovery after 1 official reminder by email. In such scenario all legal charges/fees, interest, penalty, increased price difference (if any) etc. as mentioned in 2nd point will be added in the amount of recovery.',
                            'All liability / responsibility of goods/ cargo will be on buyer account only (including market prices fluctuation, goods in transit etc.)',
                            'All goods sold on ex ware-house (transportation arranged by buyer) basis, must get lifted within 3 days of confirmation / sales order date or as agreed during confirmation (whichever is earlier). In case of late lifting of goods(without good consent of seller), seller is not responsible for any damage/ theft etc. happening to goods & has right to modify the deal / cancel the deal & foreflight the amount paid without any reminder / notice to buyer.',
                            'All warranty / Guarantee for the goods to be entertained by principal companies only. Seller is not responsible for the same for any type of issues. In case if  Sushila Parmar International Pvt. Ltd. is the principal / manufacturer of the goods sold, buyer is bound to intimate by official e mail for the issue / problem in the goods (with satisfying proof including pictures, videos etc.) within 48 hours of dispatch of material. If buyer fails to intimate within 48 hours from time of dispatch, seller is not bound to accept return of goods or any damages caused at any time (damages like: return of goods /exchange the goods / any discount in prices / claims etc).',
                            'Disputes (if any) will be subjected to Pune jurisdiction.'

                        ]
                    },
                    '\n',
                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 575, y2: 0, lineWidth: 1 }] },
                    '\n',

                    {
                        table: {
                            widths: ["*"],
                            body: [
                                [
                                    { text: 'For Sushila Parmar International Pvt. Ltd ', alignment: "right", border: [false, false, false, false], fontSize: 9 }
                                ]
                            ]
                        }

                    },

                    {
                        columns: [
                            {
                                image: await this.getBase64ImageFromURL('assets/img/sign.png'),
                                margin: [450, 0, 0, 0],
                                width: 50,
                                height: 50,


                            }
                        ],

                    }
                    ,
                    {
                        text: 'Authorised Signatory',
                        fontSize: 9,
                        alignment: 'right',
                        margin: [0, 0, 50, 0]
                    }
                ]

            }
            return dd;
        }





        // try {
        //     let emailBody: any;
        //        return await pdfMake.createPdf(dd)
        //     if (data.contact_emails.length > 0) {
        //         //   pdfDocGenerator.getBase64(data=>  {
        //         //     emailBody = {
        //         //      thepdf: data,
        //         //      tomail: "nitindube95@gmail.com",
        //         //      subject: 'Check Your Sale Report ',
        //         //      bodytext: '',
        //         //      filename: 'Salary_breakup.pdf'
        //         //    }
        //         //    		this.CrudServices
        //         // 					.postRequest<any>(Consignments.sendReportMail, emailBody)
        //         // 					.subscribe((response) => {
        //         // 					});
        //         //   })
        //     }

        // }
        // catch (err) {
        // }
    }


    async getBase64ImageFromURL(url) {
        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
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



    async addPayment() {
        let payload = {
            bank_acc_no: '1273107993',
            virtual_acc_no: '23AAFCK3325E1Z1',
            amount: Number(5000),
            payment_type: Number(1),
            payment_date: new Date(),
            transaction_id: 'trans123456',
            utr_no: 'utr12334',
            remark: 'Test'
        };
        return this.http.post(environment.serverUrl + 'api/payments/add', payload
        ).subscribe((response) => {
            // 
        })

    }




    async generateNONCopy(data) {


        var dd = {
            // a string or { width: number, height: number }
            pageSize: 'A4',
            // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
            pageMargins: [10, 10, 10, 10],
            background: function (currentPage, pageSize) {
                return [
                    {
                        canvas: [
                            { type: 'line', x1: 10, y1: 35, x2: 585, y2: 35, lineWidth: 1 }, //Up line
                            { type: 'line', x1: 10, y1: 35, x2: 10, y2: 790, lineWidth: 1 }, //Left line
                            { type: 'line', x1: 10, y1: 790, x2: 585, y2: 790, lineWidth: 1 }, //Bottom line
                            { type: 'line', x1: 585, y1: 35, x2: 585, y2: 790, lineWidth: 1 }, //Rigth line
                        ]
                    }
                ]
            },



            content: [
                { text: `NON`, fontSize: 10, alignment: 'center', decoration: 'underline' },
                { text: `Printed on : ${this.datePipe.transform(new Date(), "dd/MM/yyyy")}`, fontSize: 8, alignment: 'right' },

                '\n ',
                {
                    columns: [

                        {
                            image: await this.getBase64ImageFromURL(
                                'assets/img/brand/parmar_logo.png'
                            ),
                            margin: [15, 0, 0, 0],
                            width: 65,
                            height: 65,
                        },
                        {
                            width: '*',
                            text: [
                                { text: 'Sushila Parmar International Pvt. Ltd.\n', fontSize: 18, bold: true, alignment: 'center' },
                                { text: 'Regd.Office: 31, Adinath Shopping Centre, Pune - Satara Road, Pune - 411037, Maharashtra, India.\n', fontSize: 8, alignment: 'center' },
                                { text: 'Corp. Office: 2nd & 3rd Floor, JDC Platinum Towers, Near Zambare Palace, Maharshi Nagar, Pune - 411037, Maharashtra, India.\n', fontSize: 8, alignment: 'center' },
                                { text: `P: +91 20 2452 9999 | F: +91 20 2452 9997  |  E: parmar@parmarglobal.com | PAN: ${data.godown ? data.godown.gst_no ? data.godown.gst_no.substr(2, 10) : '' : ''}`, fontSize: 8, alignment: 'center' }
                            ],
                            margin: [30, 15, 0, 0]
                        }

                    ],

                },
                '\n ',

                {


                    table: {
                        widths: ['*', 'auto'],
                        body: [
                            [{}],



                        ]
                    },
                    layout: {
                        defaultBorder: false,
                    },
                },









            ],

            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 13,
                    color: 'black'
                }
            },
            defaultStyle: {
                // alignment: 'justify'
            }

        }

        return dd;



    }



}
