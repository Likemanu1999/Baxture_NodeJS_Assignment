import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispatchAcknowledgmentComponent } from './dispatch-acknowledgment.component';

describe('DispatchAcknowledgmentComponent', () => {
  let component: DispatchAcknowledgmentComponent;
  let fixture: ComponentFixture<DispatchAcknowledgmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispatchAcknowledgmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispatchAcknowledgmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
