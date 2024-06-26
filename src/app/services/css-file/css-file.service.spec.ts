import { TestBed } from '@angular/core/testing';

import { CssFileService } from './css-file.service';

describe('CssFileService', () => {
  let service: CssFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CssFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
