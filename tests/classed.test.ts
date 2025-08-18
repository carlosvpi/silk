import classed from '../src/classed';
import { getAction } from './util';

describe('classed', () => {
  it('returns true if the class is present', () => {
    const div = document.createElement('div');
    div.classList.add('foo');
    expect(classed(div, 'foo')).toBe(true);
  });

  it('returns false if the class is not present', () => {
    const div = document.createElement('div');
    expect(classed(div, 'bar')).toBe(false);
  });

  it('adds the class when called with true', () => {
    const div = document.createElement('div');
    classed(div, 'baz', true);
    expect(div.classList.contains('baz')).toBe(true);
  });

  it('removes the class when called with false', () => {
    const div = document.createElement('div');
    div.classList.add('qux');
    classed(div, 'qux', false);
    expect(div.classList.contains('qux')).toBe(false);
  });

  it('sets class using a function', async () => {
    const action = getAction()
    const div = document.createElement('div');
    const promise = classed(div, 'alpha', async (isClassed) => {
      expect(isClassed()).toBe(false)
      await action
      const promise = isClassed(true)
      expect(isClassed()).toBe(true)
      await promise
      expect(isClassed()).toBe(true)
    });
    expect(div.classList.contains('alpha')).toBe(false);
    action.resolve()
    expect(await promise).toBe(true)
    expect(div.classList.contains('alpha')).toBe(true);
  });

  it('throws an error for invalid argument type', () => {
    const div = document.createElement('div');
    expect(() => classed(div, 'foo', 123 as any)).toThrow(Error);
    expect(() => classed(div, 'foo', {} as any)).toThrow(Error);
  });
});
