import attr from '../src/attr';
import { getAction } from './util';

describe('attr', () => {
  it('gets the attribute value when called with only a node and attrName', () => {
    const div = document.createElement('div');
    div.setAttribute('data-test', 'value');
    expect(attr(div, 'data-test')).toBe('value');
  });

  it('sets the attribute when called with a string', () => {
    const div = document.createElement('div');
    attr(div, 'title', 'hello');
    expect(div.getAttribute('title')).toBe('hello');
  });

  it('removes the attribute when called with null', () => {
    const div = document.createElement('div');
    div.setAttribute('id', 'foo');
    attr(div, 'id', null);
    expect(div.hasAttribute('id')).toBe(false);
  });

  it('sets/removes the attribute when called with boolean', () => {
    const div = document.createElement('div');
    attr(div, 'hidden', true);
    expect(div.hasAttribute('hidden')).toBe(true);
    attr(div, 'hidden', false);
    expect(div.hasAttribute('hidden')).toBe(false);
  });

  it('sets attribute using a function', async () => {
    const action1 = getAction()
    const action2 = getAction()
    const div = document.createElement('div');
    const promise = attr(div, 'data-x', async accessor => {
      expect(accessor()).toBe(null)
      expect(await accessor('abc')).toBe('abc')
      expect(accessor()).toBe('abc')
      await action1
      expect(await accessor(null)).toBe(null)
      expect(accessor()).toBe(null)
      action2.resolve()
    });
    expect(div.getAttribute('data-x')).toBe('abc');
    action1.resolve()
    expect(await promise).toBe('abc') // the first value set
    expect(div.getAttribute('data-x')).toBe('abc');
    await action2
    expect(div.getAttribute('data-x')).toBe(null);
  });

  it('throws an error for invalid object argument', () => {
    const div = document.createElement('div');
    expect(() => attr(div, 'foo', {} as any)).toThrow(Error);
  });
});
