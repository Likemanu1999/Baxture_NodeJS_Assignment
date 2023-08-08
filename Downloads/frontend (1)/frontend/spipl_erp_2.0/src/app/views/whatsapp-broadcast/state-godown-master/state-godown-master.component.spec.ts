import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StateGodownMasterComponent } from './state-godown-master.component';

describe('StateGodownMasterComponent', () => {
  let component: StateGodownMasterComponent;
  let fixture: ComponentFixture<StateGodownMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StateGodownMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StateGodownMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
