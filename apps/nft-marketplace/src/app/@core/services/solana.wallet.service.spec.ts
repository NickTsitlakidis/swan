import { TestBed } from '@angular/core/testing';

import { Solana.WalletService } from './solana.wallet.service';

describe('Solana.WalletService', () => {
  let service: Solana.WalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Solana.WalletService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
