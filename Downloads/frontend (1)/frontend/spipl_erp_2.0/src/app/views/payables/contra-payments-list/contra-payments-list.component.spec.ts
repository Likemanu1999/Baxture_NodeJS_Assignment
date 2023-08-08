import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContraPaymentsListComponent } from './contra-payments-list.component';

describe('ContraPaymentsListComponent', () => {
  let component: ContraPaymentsListComponent;
  let fixture: ComponentFixture<ContraPaymentsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContraPaymentsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContraPaymentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
