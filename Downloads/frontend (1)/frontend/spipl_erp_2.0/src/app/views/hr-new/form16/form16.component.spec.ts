import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Form16Component } from './form16.component';

describe('Form16Component', () => {
  let component: Form16Component;
  let fixture: ComponentFixture<Form16Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Form16Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Form16Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
