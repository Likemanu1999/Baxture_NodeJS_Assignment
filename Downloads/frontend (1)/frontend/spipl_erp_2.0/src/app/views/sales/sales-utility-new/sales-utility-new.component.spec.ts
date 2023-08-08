import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesUtilityNewComponent } from './sales-utility-new.component';

describe('SalesUtilityNewComponent', () => {
  let component: SalesUtilityNewComponent;
  let fixture: ComponentFixture<SalesUtilityNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesUtilityNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesUtilityNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
