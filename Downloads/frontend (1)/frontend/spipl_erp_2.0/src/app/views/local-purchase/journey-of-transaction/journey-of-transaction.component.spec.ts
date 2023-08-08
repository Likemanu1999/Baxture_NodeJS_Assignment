import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyOfTransactionComponent } from './journey-of-transaction.component';

describe('JourneyOfTransactionComponent', () => {
  let component: JourneyOfTransactionComponent;
  let fixture: ComponentFixture<JourneyOfTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JourneyOfTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JourneyOfTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
