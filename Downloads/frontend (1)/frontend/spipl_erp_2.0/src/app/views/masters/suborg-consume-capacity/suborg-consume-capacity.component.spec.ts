import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuborgConsumeCapacityComponent } from './suborg-consume-capacity.component';

describe('SuborgConsumeCapacityComponent', () => {
  let component: SuborgConsumeCapacityComponent;
  let fixture: ComponentFixture<SuborgConsumeCapacityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuborgConsumeCapacityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuborgConsumeCapacityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
