import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillOfEntryListComponent } from './bill-of-entry-list.component';

describe('BillOfEntryListComponent', () => {
  let component: BillOfEntryListComponent;
  let fixture: ComponentFixture<BillOfEntryListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillOfEntryListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillOfEntryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
