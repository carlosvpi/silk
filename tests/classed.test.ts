import classed from '../src/classed';

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

  it('sets class using a function returning true', () => {
    const div = document.createElement('div');
    classed(div, 'alpha', () => true);
    expect(div.classList.contains('alpha')).toBe(true);
  });

  it('sets class using a function returning false', () => {
    const div = document.createElement('div');
    div.classList.add('beta');
    classed(div, 'beta', () => false);
    expect(div.classList.contains('beta')).toBe(false);
  });

  it('returns class presence if function returns neither true nor false', () => {
    const div = document.createElement('div');
    div.classList.add('gamma');
    expect(classed(div, 'gamma', () => undefined as any)).toBe(true);
    expect(classed(div, 'gamma', () => null as any)).toBe(true);
  });

  it('throws an error for invalid argument type', () => {
    const div = document.createElement('div');
    expect(() => classed(div, 'foo', 123 as any)).toThrow(Error);
    expect(() => classed(div, 'foo', {} as any)).toThrow(Error);
  });
});
