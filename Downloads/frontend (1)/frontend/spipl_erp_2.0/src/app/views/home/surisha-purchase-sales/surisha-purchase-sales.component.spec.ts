import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurishaPurchaseSalesComponent } from './surisha-purchase-sales.component';

describe('SurishaPurchaseSalesComponent', () => {
  let component: SurishaPurchaseSalesComponent;
  let fixture: ComponentFixture<SurishaPurchaseSalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurishaPurchaseSalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurishaPurchaseSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
