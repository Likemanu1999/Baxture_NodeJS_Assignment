import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { CrudServices } from '../../shared/crud-services/crud-services';
import { HttpClient } from '@angular/common/http';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { StaffMemberMaster } from '../../shared/apis-path/apis-path';
@Component({
	selector: 'app-dashboard',
	templateUrl: 'login.component.html',
	styleUrls: ['login.component.scss'],
	providers: [CrudServices]
})
export class LoginComponent implements OnInit {
	loginForm: FormGroup;
	tokenForm: FormGroup;
	isLoading = false;
	error?= null;
	currentYear = (new Date()).getFullYear();
	showPassword: boolean = false;
	token_flag: boolean = false;
	login_flag: boolean = true;
	display: any;
	home: any
	show_resend_otp: boolean = false;
	timer_display: boolean = false;
	constructor(
		private loginService: LoginService,
		private router: Router,
		private angularFireMessaging: AngularFireMessaging,
		private http: HttpClient,
		private crudServices: CrudServices
	) {
		// 
	}
	/**
	* Check user is logged in or not based on loginService function if logged in then navigate to dashboard otherwise initialize login Form.
	*/
	ngOnInit() {
		if (this.loginService.isLoggedIn()) {
			for (let index = 0; index < JSON.parse(localStorage.getItem('menu')).length; index++) {
				if (JSON.parse(localStorage.getItem('menu'))[index].name == "Home") {
					this.home = JSON.parse(localStorage.getItem('menu'))[index].children[0].url;
					this.router.navigate([`${this.home}`]);
				} else {
					this.router.navigate(['home/dashboard']);
				}

			}
		}
		this.loginForm = new FormGroup({
			'email': new FormControl(null, Validators.required),
			'password': new FormControl(null, Validators.required),
		});
		this.tokenForm = new FormGroup({
			'allow_2fa': new FormControl(null, Validators.required),
		});
	}
	/**
	* Validate user inputs by checking form validation if true then skip if block and pass credentials as parameters to loginService method login.
	 Checking response code return by login() if code is 101 that means wrong credentials else navigating to dashboard.
	*/
	onSubmit() {
		if (!this.loginForm.valid) {
			return;
		}
		this.isLoading = true;
		this.error = null;
		this.loginService.login(this.loginForm.value.email, this.loginForm.value.password)
			.subscribe((response) => {
				this.token_flag = response.allow_2fa;
				if (this.token_flag) {
					this.login_flag = false;
					this.timer(1);
				} else {
					this.login_flag = true;
				}
				if (response.code === '101') {
					this.error = response.data;
					this.isLoading = false;
				} else {
					this.isLoading = false;
					for (let index = 0; index < JSON.parse(localStorage.getItem('menu')).length; index++) {
						if (JSON.parse(localStorage.getItem('menu'))[index].name == "Home") {
							if(JSON.parse(localStorage.getItem('menu'))[index].permission.role_id == 20){
								console.log('role id',JSON.parse(localStorage.getItem('menu'))[index].permission.role_id);
								this.router.navigate(['home/local-purchase-dashboard']);
							}
							else if(JSON.parse(localStorage.getItem('menu'))[index].permission.role_id == 6 && JSON.parse(localStorage.getItem('menu'))[index].permission.role_id == 21 && JSON.parse(localStorage.getItem('menu'))[index].permission.role_id == 19){
								this.router.navigate(['home/forex-dashboard'])
							}
							else{
							this.home = JSON.parse(localStorage.getItem('menu'))[index].children[0].url;
							this.router.navigate([`${this.home}`]);
							}
						} 
						// else {
						// 	this.router.navigate(['home/dashboard']);
						// }
					}
				}
			}, errorMessage => {
				this.isLoading = false;
				this.error = 'Server Not Responding...try again..';
			});
	}
	onSubmitoken() {
		if (!this.loginForm.valid) {
			return;
		}
		this.isLoading = true;
		this.error = null;
		let user_id = localStorage.getItem('user_id');
		let role_id = localStorage.getItem('role_id');
		let email = localStorage.getItem('email');
		let mobile_no = localStorage.getItem('mobile_no');
		this.loginService.token_validate(this.tokenForm.value.allow_2fa, user_id, role_id)
			.subscribe((response) => {
				if (response.code === '101') {
					localStorage.setItem('user_id', user_id);
					localStorage.setItem('role_id', role_id);
					localStorage.setItem('email', email);
					localStorage.setItem('mobile_no', mobile_no);
					this.error = response.data;
					this.isLoading = false;
				} else {
					this.isLoading = false;
					for (let index = 0; index < JSON.parse(localStorage.getItem('menu')).length; index++) {
						if (JSON.parse(localStorage.getItem('menu'))[index].name == "Home") {
							this.home = JSON.parse(localStorage.getItem('menu'))[index].children[0].url;
							this.router.navigate([`${this.home}`]);
						} else {
							this.router.navigate(['home/dashboard']);
						}
					}
				}
			}, errorMessage => {
				this.isLoading = false;
				this.error = 'Server Not Responding...try again..';
			});
	}
	showHidePassword() {
		if (this.showPassword) {
			this.showPassword = false;
		} else {
			this.showPassword = true;
		}
	}
	timer(minute) {
		this.timer_display = true;
		// let minute = 1;
		let seconds: number = minute * 60;
		let textSec: any = "0";
		let statSec: number = 60;
		const prefix = minute < 10 ? "0" : "";
		const timer = setInterval(() => {
			seconds--;
			if (statSec != 0) statSec--;
			else statSec = 59;
			if (statSec < 10) {
				textSec = "0" + statSec;
			} else textSec = statSec;
			this.display = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
			if (seconds == 0) {
				let user_id = localStorage.getItem('user_id');
				let role_id = localStorage.getItem('role_id');
				let email = localStorage.getItem('email');
				let mobile_no = localStorage.getItem('mobile_no');
				this.loginService.auth_token_expire(user_id)
					.subscribe((response) => {
						localStorage.setItem('user_id', user_id);
						localStorage.setItem('role_id', role_id);
						localStorage.setItem('email', email);
						localStorage.setItem('mobile_no', mobile_no);
						if (response.code === '101') {
							this.error = response.data;
							this.isLoading = false;
						}
					});
				this.show_resend_otp = true;
				this.timer_display = false;
				clearInterval(timer);
			}
		}, 1000);
	}
	resend_otp() {
		let user_id = localStorage.getItem('user_id');
		let role_id = localStorage.getItem('role_id');
		let email = localStorage.getItem('email');
		let mobile_no = localStorage.getItem('mobile_no');
		this.loginService.auth_token_set(user_id, mobile_no, email)
			.subscribe((response) => {
				localStorage.setItem('user_id', user_id);
				localStorage.setItem('role_id', role_id);
				localStorage.setItem('email', email);
				localStorage.setItem('mobile_no', mobile_no);
				if (response.code === '101') {
					this.error = response.data;
					this.isLoading = false;
				}
			});
		this.show_resend_otp = false;
		this.timer(1);
	}
}