import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseUnsoldComponent } from './release-unsold.component';

describe('ReleaseUnsoldComponent', () => {
  let component: ReleaseUnsoldComponent;
  let fixture: ComponentFixture<ReleaseUnsoldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseUnsoldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseUnsoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
