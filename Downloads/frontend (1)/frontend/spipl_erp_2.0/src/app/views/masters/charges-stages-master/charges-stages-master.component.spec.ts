import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargesStagesMasterComponent } from './charges-stages-master.component';

describe('ChargesStagesMasterComponent', () => {
  let component: ChargesStagesMasterComponent;
  let fixture: ComponentFixture<ChargesStagesMasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChargesStagesMasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargesStagesMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
