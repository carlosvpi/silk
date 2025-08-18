import classes from '../src/classes';
import { getAction } from './util';

describe('classes', () => {
  it('returns className when called with only a node', () => {
    const div = document.createElement('div');
    div.className = 'foo bar';
    expect(classes(div)).toEqual(['foo', 'bar']);
  });

  it('sets className when called with a string', () => {
    const div = document.createElement('div');
    classes(div, ['baz', 'qux']);
    expect(div.classList.contains('baz')).toBe(true);
    expect(div.classList.contains('qux')).toBe(true);
  });

  it('adds/removes classes when called with an object', () => {
    const div = document.createElement('div');
    classes(div, { foo: true, bar: false, baz: true });
    expect(div.classList.contains('foo')).toBe(true);
    expect(div.classList.contains('bar')).toBe(false);
    expect(div.classList.contains('baz')).toBe(true);
  });

  it('adds/removes classes when called with an object of functions', async () => {
    const action1 = getAction();
    const action2 = getAction();
    const div = document.createElement('div');
    classes(div, { foo: true, bar: async bar => {
      expect(bar()).toBe(false)
      bar(false)
      await action1
      bar(true)
      expect(bar()).toBe(true)
      action2.resolve()
    }, baz: true });
    expect(div.classList.contains('foo')).toBe(true);
    expect(div.classList.contains('baz')).toBe(true);
    expect(div.classList.contains('bar')).toBe(false);
    action1.resolve()
    await action2
    expect(div.classList.contains('bar')).toBe(true);
  });

  it('updates classes using a function callback', () => {
    const div = document.createElement('div');
    div.className = 'start';
    classes(div, async (accessor) => {
      expect(await accessor('foo', true)).toBe(true);
      expect(await accessor('bar', false)).toBe(false);
      expect(accessor('foo')).toBe(true)
      expect(accessor()).toEqual(['start', 'foo'])
    });
    expect(div.classList.contains('foo')).toBe(true);
    expect(div.classList.contains('bar')).toBe(false);
    expect(div.classList.contains('start')).toBe(true);
  });

  it('throws an error for invalid argument type', () => {
    const div = document.createElement('div');
    expect(() => classes(div, 123 as any)).toThrow(Error);
    expect(() => classes(div, null as any)).toThrow(Error);
    expect(() => classes(div, undefined as any)).not.toThrow(); // undefined is allowed
  });
});
