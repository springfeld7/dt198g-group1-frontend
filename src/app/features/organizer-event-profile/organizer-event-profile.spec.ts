import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerEventProfileComponent } from './organizer-event-profile';

describe('OrganizerEventProfile', () => {
  let component: OrganizerEventProfileComponent;
  let fixture: ComponentFixture<OrganizerEventProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizerEventProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizerEventProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
