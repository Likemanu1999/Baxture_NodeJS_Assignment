import { AmountFormattingPipe } from './amount-formatting.pipe';

describe('AmountFormattingPipe', () => {
  it('create an instance', () => {
    const pipe = new AmountFormattingPipe();
    expect(pipe).toBeTruthy();
  });
});
