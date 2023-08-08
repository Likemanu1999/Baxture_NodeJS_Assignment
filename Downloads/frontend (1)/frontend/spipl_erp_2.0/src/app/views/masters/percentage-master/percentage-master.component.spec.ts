import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentageMasterComponent } from './percentage-master.component';

describe('PercentageMasterComponent', () => {
  let component: PercentageMasterComponent;
  let fixture: ComponentFixture<PercentageMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PercentageMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentageMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
