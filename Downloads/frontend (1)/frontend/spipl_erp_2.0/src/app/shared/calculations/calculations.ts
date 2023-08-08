import { Component } from "@angular/core";
import { Injectable } from '@angular/core';

@Injectable()

export class Calculations {

	constructor() {
		// 
	}

	getOverdueLimit(value) {
		let overdue = (Number(value) * 0.20).toFixed(3);
		return Number(overdue);
	}

	roundQuantity(value) {
		if (value != null || value != undefined) {
			return Number((value).toFixed(3));
		} else {
			return 0;
		}
	}

	getRoundValue(value) {
		let round_decimal = Number(value.toFixed(1));

		let split = round_decimal.toString().split('.');
		let final_value = 0;
		if (Number(split[1]) < 5) {
			final_value = Math.floor(round_decimal);
		} else {
			final_value = Math.ceil(round_decimal);
		}
		return final_value;
	}

	getBaseAmount(data) {
		let total = Number(data.rate) * Number(data.quantity);
		return this.getRoundValue(total);
	}

	getNb(data) {
		if (Number(data.rate) > 0) {
			return Number(data.rate) - Number(data.frieght_rate);
		} else {
			return 0;
		}
	}

	getNbNew(data) {
		if (Number(data.rate) > 0) {
			return Number(data.rate) - Number(data.freight_rate);
		} else {
			return 0;
		}
	}

	getCommision(data) {
		if (data.commision_type == 3) {
			return data.commision;
		} else {
			return Number(data.commision) * data.quantity;
		}
	}

	getCommission(data) {
		if (data.commission_type == 3) {
			return Number(data.commission);
		} else {
			return Number(data.commission) * Number(data.quantity);
		}
	}

	totalWithTax(data) {
		let obj_gst = data.percent_values.find(o => o.percent_type === 'gst');
		let gst = Number(obj_gst.percent_value) / 100;
		let obj_tcs = data.percent_values.find(o => o.percent_type === 'tcs');
		let tcs = Number(obj_tcs.percent_value) / 100;

		let base_amount = Number(data.quantity) * Number(data.rate);

		let gst_rate = base_amount * gst;
		let base_with_gst = base_amount + gst_rate;

		let tcs_rate = base_with_gst * tcs;
		let final_amount = base_with_gst + tcs_rate;

		return final_amount;
	}

	getAvailableLimit(data) {
		let obj_gst = data.percent_values.find(o => o.percent_type === 'gst');
		let gst = Number(obj_gst.percent_value) / 100;
		let obj_tcs = data.percent_values.find(o => o.percent_type === 'tcs');
		let tcs = Number(obj_tcs.percent_value) / 100;
		let gst_rate = Number(data.rate) * gst;
		let base_with_gst = Number(data.rate) + gst_rate;
		let tcs_rate = base_with_gst * tcs;
		let final_rate = base_with_gst + tcs_rate;
		let base_limit_capping = Number(data.base_limit) * 2;
		let bslimit = (base_limit_capping / final_rate);
		bslimit = bslimit - Number(data.total_consignment);
		bslimit = bslimit + Number(data.total_dispatch);
		let finalLimit = bslimit.toFixed(3);
		return Number(finalLimit);
	}

	getCurrentLimit(data) {
		let obj_gst = data.percent_values.find(o => o.percent_type === 'gst');
		let gst = Number(obj_gst.percent_value) / 100;
		let obj_tcs = data.percent_values.find(o => o.percent_type === 'tcs');
		let tcs = Number(obj_tcs.percent_value) / 100;
		let gst_rate = Number(data.rate) * gst;
		let base_with_gst = Number(data.rate) + gst_rate;
		let tcs_rate = base_with_gst * tcs;
		let final_rate = base_with_gst + tcs_rate;
		let base_limit_capping = Number(data.base_limit) * 2;

		if (data.use_adhoc_power == true) {
			base_limit_capping += Number(data.adhoc_limit);
		}

		if (data.use_logistic_power == true) {
			base_limit_capping += Number(data.logistic_power);
		}

		let bslimit = (base_limit_capping / final_rate);
		bslimit = bslimit - Number(data.total_consignment);
		bslimit = bslimit + Number(data.total_dispatch);
		let finalLimit = bslimit.toFixed(3);
		return Number(finalLimit);
	}

	getAvailableLimitFinancePlanning(data) {
		let available_base_limit = Number(data.current_limit);
		let base_limit_capping = available_base_limit;// * 2;

		if (data.use_adhoc_power == true) {
			base_limit_capping += Number(data.adhoc_limit);
		}

		if (data.use_logistic_power == true) {
			base_limit_capping += Number(data.logistic_power);
		}

		let bslimit = base_limit_capping / Number(data.rate);

		// bslimit = bslimit - Number(data.total_consignment);
		// bslimit = bslimit + Number(data.total_dispatch);

		let finalLimit = bslimit.toFixed(3);

		return Number(finalLimit);
	}

	getAvailableLimitFinancePlanningNew(data) {
		let available_base_limit = Number(data.current_limit);
		let base_limit_capping = available_base_limit;// * 2;

		if (data.use_adhoc_power == true) {
			base_limit_capping += Number(data.adhoc_limit);
		}

		if (data.use_logistic_power == true) {
			base_limit_capping += Number(data.logistic_power);
		}

		let bslimit = base_limit_capping / Number(data.rate);

		bslimit = bslimit - Number(data.total_consignment);
		bslimit = bslimit + Number(data.total_dispatch);

		let finalLimit = bslimit.toFixed(3);

		return Number(finalLimit);
	}

	getTenPercent(data) {
		let ten_percent = Number(data.available_qty) * 0.10;
		let ten_available_qty = Number(data.available_qty) + ten_percent;
		let bslimit = ten_available_qty.toFixed(3);
		return bslimit;
	}

	getTotalLoadingCrossing(data) {
		let load = Number(data.loading_quantity) * Number(data.loading_charges);
		let cross = Number(data.crossing_quantity) * Number(data.crossing_charges);

		if (data.type == 1) {
			return load;
		} else if (data.type == 2) {
			return cross;
		} else if (data.type == 3) {
			return load + cross;
		}
	}

	countDay(from_date, to_date) {
		let startDate = new Date(from_date);
		let endDate = new Date(to_date);
		let days = Math.floor((endDate.getTime() - startDate.getTime()) / 1000 / 60 / 60 / 24);
		return Number(days);
	}

	overdueCalculation(data) {


		// 	let holidays_array = [];

		// 	let current_date = moment("2021-03-30");

		// 	let con_id = data.id;
		// 	let org_virtual_acc_no = data.virtual_acc_no;
		// 	let payment_term = data.payment_term;
		// 	let base_limit = data.base_limit;
		// 	let dispatch_date = data.dispatch_date;
		// 	let total_purchase = Number(data.rate * data.quantity);
		// 	let balance_base_limit = Number(base_limit - total_purchase);
		// 	let interest_rate = 0.03; // 3%
		// 	let due_limit = 3; // 3 Days
		// 	let total_payment = total_purchase;

		// 	let start_date = moment(dispatch_date);
		// 	let end_date = moment(current_date);
		// 	let date_diff = end_date.diff(start_date, 'days');
		// 	let start_due_date = moment(start_date).add(payment_term, 'days');
		// 	let interest_date = moment(start_due_date).add(due_limit, 'days');

		// 	if (payment_term != 0) {
		// 		if (date_diff <= payment_term) {
		// 			// Regular Case
		// 			total_payment = total_purchase;
		// 		} else {
		// 			// Overdue Case
		// 			for (let i = start_due_date; i <= end_date; i.add(1, 'days')) {
		// 				let date = moment(i).format("YYYY-MM-DD");
		// 				// let is_holiday = holidays_array.indexOf(date);

		// 				let condition = {
		// 					virtual_acc_no: org_virtual_acc_no,
		// 					begin_date: moment(i).format("YYYY-MM-DD"),
		// 					end_date: moment(end_date).format("YYYY-MM-DD")
		// 				};

		// 				/* START PAYMENT LOOP */
		// 				this.crudServices.getOne<any>(MiddlewarePayments.getPaymentDetails, condition).subscribe((response) => {
		// 					let payment_result = response.data;

		// 					if (payment_result == null || payment_result == undefined) {
		// 						if (i >= interest_date) {
		// 							let interest_value = total_payment * interest_rate;
		// 							total_payment += interest_value;
		// 							
		// 						} else {
		// 							
		// 						}
		// 					} else {
		// 						// Payment Logic
		// 					}
		// 				});
		// 				/* END PAYMENT LOOP */
		// 			}
		// 		}
		// 	}
	}

	getQuantityFromAmount(value, item, percent) {
		let obj_gst = percent.find(o => o.percent_type === 'gst');
		let gst = obj_gst.percent_value;
		let rate = item.final_rate;
		let gst_rate = Number(rate) * (Number(gst) / 100);
		let rate_with_gst = Number(rate) + Number(gst_rate);
		let tds_rate = 0;
		let tcs_rate = 0;
		if (item.tds != null && item.tds != undefined) {
			tds_rate = (Number(item.tds) > 0) ? Number(rate) * (Number(item.tds) / 100) : 0;
		}
		if (item.tcs != null && item.tcs != undefined) {
			tcs_rate = (Number(item.tcs) > 0) ? Number(rate_with_gst) * (Number(item.tcs) / 100) : 0
		}
		let rate_minus_tds = rate_with_gst - tds_rate;
		let final_value = rate_minus_tds + tcs_rate;
		let quantity = (Number(value) / final_value).toFixed(3);
		return quantity;
	}

	getRateWithTax(rate, tds, tcs, gst) {
		let new_tds = tds;
		let new_tcs = tcs;
		let gst_rate = Number(rate) * (Number(gst) / 100);
		let rate_with_gst = Number(rate) + Number(gst_rate);
		if (tds == 0 && tcs == 0) {
			new_tds = 0.1;
			new_tcs = 0;
		}
		let tds_rate = (Number(new_tds) > 0) ? Number(rate) * (Number(new_tds) / 100) : 0;
		let tcs_rate = (Number(new_tcs) > 0) ? Number(rate_with_gst) * (Number(new_tcs) / 100) : 0
		let rate_minus_tds = rate_with_gst - tds_rate;
		let final_value = rate_minus_tds + tcs_rate;
		return final_value;
	}

	getTotalAmountWithTax(amount, tds, tcs, gst, company_id) {
		let new_tds = tds;
		let new_tcs = tcs;
		let gst_rate = Number(amount) * (Number(gst) / 100);
		let total_with_gst = Number(amount) + Number(gst_rate);
		if (tds == 0 && tcs == 0) {
			if (company_id == 2) {
				new_tds = 0;
				new_tcs = 0.1;
			} else {
				new_tds = 0.1;
				new_tcs = 0;
			}
		}
		let tds_rate = (Number(new_tds) > 0) ? Number(amount) * (Number(new_tds) / 100) : 0;
		let tcs_rate = (Number(new_tcs) > 0) ? Number(total_with_gst) * (Number(new_tcs) / 100) : 0
		let total_minus_tds = total_with_gst - tds_rate;
		let final_amount = total_minus_tds + tcs_rate;
		return final_amount;
	}

}