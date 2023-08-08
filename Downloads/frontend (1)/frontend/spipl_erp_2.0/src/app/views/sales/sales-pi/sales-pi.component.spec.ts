import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPiComponent } from './sales-pi.component';

describe('SalesPiComponent', () => {
  let component: SalesPiComponent;
  let fixture: ComponentFixture<SalesPiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesPiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesPiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
