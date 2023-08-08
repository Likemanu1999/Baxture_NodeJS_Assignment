import { Component } from "@angular/core";
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()

export class UserActivityService {

	private componentMethodCallSource = new Subject<any>();
	componentMethodCalled$ = this.componentMethodCallSource.asObservable();

	constructor() {
		// 
	}

	callComponentMethod() {
		this.componentMethodCallSource.next();
	}

	callMyName() {
		// 
	}

}
