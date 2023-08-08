import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillOfEntryEmailComponent } from './bill-of-entry-email.component';

describe('BillOfEntryEmailComponent', () => {
  let component: BillOfEntryEmailComponent;
  let fixture: ComponentFixture<BillOfEntryEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillOfEntryEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillOfEntryEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
