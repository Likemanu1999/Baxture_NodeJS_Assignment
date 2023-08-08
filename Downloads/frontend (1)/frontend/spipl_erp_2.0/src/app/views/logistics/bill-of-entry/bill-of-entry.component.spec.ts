import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillOfEntryComponent } from './bill-of-entry.component';

describe('BillOfEntryComponent', () => {
  let component: BillOfEntryComponent;
  let fixture: ComponentFixture<BillOfEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillOfEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillOfEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
