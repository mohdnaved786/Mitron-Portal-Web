import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignAgentsComponent } from './assign-agents.component';

describe('AssignAgentsComponent', () => {
  let component: AssignAgentsComponent;
  let fixture: ComponentFixture<AssignAgentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignAgentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignAgentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
