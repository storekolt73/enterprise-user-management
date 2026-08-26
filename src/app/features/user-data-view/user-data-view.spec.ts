import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDataView } from './user-data-view';

describe('UserDataView', () => {
  let component: UserDataView;
  let fixture: ComponentFixture<UserDataView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDataView],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDataView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
