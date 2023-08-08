import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplTaxTypeComponent } from './compl-tax-type.component';

describe('ComplTaxTypeComponent', () => {
  let component: ComplTaxTypeComponent;
  let fixture: ComponentFixture<ComplTaxTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplTaxTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplTaxTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
