import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentTypeMasterComponent } from './percent-type-master.component';

describe('PercentTypeMasterComponent', () => {
  let component: PercentTypeMasterComponent;
  let fixture: ComponentFixture<PercentTypeMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PercentTypeMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentTypeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
