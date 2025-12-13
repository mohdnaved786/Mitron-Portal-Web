import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoPilotComponent } from './auto-pilot.component';

describe('AutoPilotComponent', () => {
  let component: AutoPilotComponent;
  let fixture: ComponentFixture<AutoPilotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoPilotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoPilotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
