import attr from '../src/attr';

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

  it('sets attribute using a function returning a string', () => {
    const div = document.createElement('div');
    attr(div, 'data-x', () => 'abc');
    expect(div.getAttribute('data-x')).toBe('abc');
  });

  it('sets attribute using a function returning true', () => {
    const div = document.createElement('div');
    attr(div, 'checked', () => true);
    expect(div.hasAttribute('checked')).toBe(true);
  });

  it('gets attribute inside a function', () => {
    const div = document.createElement('div');
    attr(div, 'checked', checked => {
      checked(true);
      expect(checked()).toBeTruthy();
      return false
    });
    expect(div.hasAttribute('checked')).toBe(false);
  });

  it('removes attribute using a function returning false', () => {
    const div = document.createElement('div');
    div.setAttribute('checked', '');
    attr(div, 'checked', () => false);
    expect(div.hasAttribute('checked')).toBe(false);
  });

  it('removes attribute using a function returning null', () => {
    const div = document.createElement('div');
    div.setAttribute('checked', '');
    attr(div, 'checked', () => null);
    expect(div.hasAttribute('checked')).toBe(false);
  });

  it('throws an error for invalid object argument', () => {
    const div = document.createElement('div');
    expect(() => attr(div, 'foo', {} as any)).toThrow(Error);
  });

  it('throws an error for invalid argument type', () => {
    const div = document.createElement('div');
    expect(() => attr(div, 'foo', 123 as any)).toThrow(Error);
  });
});
