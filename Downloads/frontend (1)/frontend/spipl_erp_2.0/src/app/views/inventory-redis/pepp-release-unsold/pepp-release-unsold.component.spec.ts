import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeppReleaseUnsoldComponent } from './pepp-release-unsold.component';

describe('PeppReleaseUnsoldComponent', () => {
  let component: PeppReleaseUnsoldComponent;
  let fixture: ComponentFixture<PeppReleaseUnsoldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeppReleaseUnsoldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeppReleaseUnsoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
