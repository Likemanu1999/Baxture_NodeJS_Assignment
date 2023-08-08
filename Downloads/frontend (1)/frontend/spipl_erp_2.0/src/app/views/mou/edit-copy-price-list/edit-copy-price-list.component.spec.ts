import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCopyPriceListComponent } from './edit-copy-price-list.component';

describe('EditCopyPriceListComponent', () => {
  let component: EditCopyPriceListComponent;
  let fixture: ComponentFixture<EditCopyPriceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCopyPriceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCopyPriceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
