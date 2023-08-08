import { NullReplacePipe } from './null-replace.pipe';

describe('NullReplacePipe', () => {
  it('create an instance', () => {
    const pipe = new NullReplacePipe();
    expect(pipe).toBeTruthy();
  });
});
