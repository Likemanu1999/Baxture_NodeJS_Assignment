import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourrierMasterComponent } from './courrier-master.component';

describe('CourrierMasterComponent', () => {
  let component: CourrierMasterComponent;
  let fixture: ComponentFixture<CourrierMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourrierMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourrierMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
