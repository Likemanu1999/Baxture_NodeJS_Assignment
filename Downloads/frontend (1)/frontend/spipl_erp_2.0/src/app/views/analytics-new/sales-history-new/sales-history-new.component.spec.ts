import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesHistoryNewComponent } from './sales-history-new.component';

describe('SalesHistoryNewComponent', () => {
  let component: SalesHistoryNewComponent;
  let fixture: ComponentFixture<SalesHistoryNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesHistoryNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesHistoryNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
