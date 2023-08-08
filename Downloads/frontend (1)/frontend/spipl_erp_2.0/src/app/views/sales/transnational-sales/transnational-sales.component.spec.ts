import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransnationalSalesComponent } from './transnational-sales.component';

describe('TransnationalSalesComponent', () => {
  let component: TransnationalSalesComponent;
  let fixture: ComponentFixture<TransnationalSalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransnationalSalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransnationalSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
