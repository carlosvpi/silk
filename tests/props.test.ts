import props from '../src/props';

describe('props', () => {
  it('sets class using "class" key', () => {
    const div = document.createElement('div');
    props(div, { class: { foo: true, bar: false } });
    expect(div.classList.contains('foo')).toBe(true);
    expect(div.classList.contains('bar')).toBe(false);
  });

  it('sets styles using "style" key', () => {
    const div = document.createElement('div');
    props(div, { style: { color: 'red', zIndex: 10 } });
    expect(div.style.color).toBe('red');
    expect(div.style.zIndex).toBe('10');
  });

  it('sets ref using "ref" key', () => {
    const div = document.createElement('div');
    const ref = { current: null as any };
    props(div, { ref });
    expect(ref.current).toBe(div);
  });

  it('sets attributes', () => {
    const div = document.createElement('div');
    props(div, { id: 'foo', title: 'bar' });
    expect(div.getAttribute('id')).toBe('foo');
    expect(div.getAttribute('title')).toBe('bar');
  });

  it('sets boolean attributes', () => {
    const div = document.createElement('div');
    props(div, { hidden: true });
    expect(div.hasAttribute('hidden')).toBe(true);
    props(div, { hidden: false });
    expect(div.hasAttribute('hidden')).toBe(false);
  });

  it('sets event handlers', () => {
    const div = document.createElement('div');
    const handler = jest.fn();
    props(div, { onClick: handler });
    div.click();
    expect(handler).toHaveBeenCalled();
  });

  it('sets event handlers with capture', () => {
    const div = document.createElement('div');
    const handler = jest.fn();
    props(div, { onClickCapture: handler });
    const event = new MouseEvent('click', { bubbles: true });
    div.dispatchEvent(event);
    expect(handler).toHaveBeenCalled();
  });

  it('sets props using a function argument', () => {
    const div = document.createElement('div');
    props(div, (set: (value?: any) => any) => {
      set({ id: 'bar', class: { baz: true } });
    });
    expect(div.getAttribute('id')).toBe('bar');
    expect(div.classList.contains('baz')).toBe(true);
  });

  it('returns a record of all attributes', () => {
    const div = document.createElement('div');
    div.setAttribute('foo', 'bar');
    div.setAttribute('baz', 'qux');
    const result = props(div);
    expect(result).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('throws an error for invalid argument type', () => {
    const div = document.createElement('div');
    expect(() => props(div, 123 as any)).toThrow(Error);
    expect(() => props(div, null as any)).toThrow(Error);
  });
});
