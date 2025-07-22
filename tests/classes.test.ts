import classes from '../src/classes';

describe('classes', () => {
  it('returns className when called with only a node', () => {
    const div = document.createElement('div');
    div.className = 'foo bar';
    expect(classes(div)).toEqual(['foo', 'bar']);
  });

  it('sets className when called with a string', () => {
    const div = document.createElement('div');
    classes(div, 'baz qux');
    expect(div.className).toBe('baz qux');
  });

  it('adds classes when called with an array', () => {
    const div = document.createElement('div');
    classes(div, ['alpha', 'beta']);
    expect(div.classList.contains('alpha')).toBe(true);
    expect(div.classList.contains('beta')).toBe(true);
  });

  it('adds/removes classes when called with an object', () => {
    const div = document.createElement('div');
    classes(div, { foo: true, bar: false, baz: true });
    expect(div.classList.contains('foo')).toBe(true);
    expect(div.classList.contains('bar')).toBe(false);
    expect(div.classList.contains('baz')).toBe(true);
  });

  it('updates classes using a function callback', () => {
    const div = document.createElement('div');
    div.className = 'start';
    classes(div, (set) => {
      set('foo', true);
      set('bar', false);
      expect(set('foo')).toBe(true)
    });
    expect(div.classList.contains('foo')).toBe(true);
    expect(div.classList.contains('bar')).toBe(false);
    expect(div.classList.contains('start')).toBe(true);
  });

  it('returns className when function callback is called with undefined key', () => {
    const div = document.createElement('div');
    div.className = 'x y';
    let classNameResult = '';
    classes(div, (set) => {
      classNameResult = set();
    });
    expect(classNameResult).toBe(div.className);
  });

  it('throws an error for invalid argument type', () => {
    const div = document.createElement('div');
    expect(() => classes(div, 123 as any)).toThrow(Error);
    expect(() => classes(div, null as any)).toThrow(Error);
    expect(() => classes(div, undefined as any)).not.toThrow(); // undefined is allowed
  });
});
