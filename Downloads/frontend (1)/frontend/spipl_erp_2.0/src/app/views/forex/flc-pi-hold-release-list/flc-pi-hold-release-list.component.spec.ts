import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlcPiHoldReleaseListComponent } from './flc-pi-hold-release-list.component';

describe('FlcPiHoldReleaseListComponent', () => {
  let component: FlcPiHoldReleaseListComponent;
  let fixture: ComponentFixture<FlcPiHoldReleaseListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlcPiHoldReleaseListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlcPiHoldReleaseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
