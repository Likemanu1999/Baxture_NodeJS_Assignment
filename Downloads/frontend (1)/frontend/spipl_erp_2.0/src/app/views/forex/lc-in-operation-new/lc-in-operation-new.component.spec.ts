import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LcInOperationNewComponent } from './lc-in-operation-new.component';

describe('LcInOperationNewComponent', () => {
  let component: LcInOperationNewComponent;
  let fixture: ComponentFixture<LcInOperationNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LcInOperationNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LcInOperationNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
