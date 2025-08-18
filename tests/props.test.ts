import { ClassesAccessor } from '../src/classes';
import props from '../src/props';
import { StylesAccessor } from '../src/styles';

describe('props', () => {
  describe('class', () => {
    it('gets class as array', () => {
      const div = document.createElement('div');
      div.classList.add('foo')
      div.classList.add('bar')
      expect(props(div, 'class')).toEqual(['foo', 'bar'])
    });
    it('sets class as array', () => {
      const div = document.createElement('div');
      props(div, { class: ['foo', 'bar'] });
      expect(div.classList.contains('foo')).toBe(true);
      expect(div.classList.contains('bar')).toBe(true);
    });
    it('sets class as an object', () => {
      const div = document.createElement('div');
      props(div, { class: { foo: true, bar: false } });
      expect(div.classList.contains('foo')).toBe(true);
      expect(div.classList.contains('bar')).toBe(false);
    });
    it('sets class as function', () => {
      const div = document.createElement('div');
      div.classList.add('foo')
      div.classList.add('bar')
      props(div, { class: (accessor: ClassesAccessor) => {
        expect(accessor()).toEqual(['foo', 'bar'])
        expect(accessor('bar')).toBe(true)
        accessor('bar', false)
      }});
      expect(div.classList.contains('foo')).toBe(true);
      expect(div.classList.contains('bar')).toBe(false);
    });
    it('sets class as array within a callback', () => {
      const div = document.createElement('div');
      props(div, accessor => {
        accessor({ class: ['foo', 'bar']})
      });
      expect(div.classList.contains('foo')).toBe(true);
      expect(div.classList.contains('bar')).toBe(true);
    });
    it('sets class as an object within a callback', () => {
      const div = document.createElement('div');
      props(div, accessor => {
        accessor({ class: { foo: true, bar: false }})
      });
      expect(div.classList.contains('foo')).toBe(true);
      expect(div.classList.contains('bar')).toBe(false);
    });
  })
  describe('style', () => {
    it('gets style', () => {
      const div = document.createElement('div');
      div.style.color = 'red'
      div.style.backgroundColor = 'blue'
      expect(props(div, 'style')).toMatchObject({ color: 'red', backgroundColor: 'blue' })
    });
    it('sets style as an object', () => {
      const div = document.createElement('div');
      props(div, { style: { color: 'red', backgroundColor: 'blue' } });
      expect(div.style.color).toBe('red')
      expect(div.style.backgroundColor).toBe('blue')
    });
    it('sets style as function', () => {
      const div = document.createElement('div');
      div.style.color = 'red'
      div.style.backgroundColor = 'blue'
      props(div, { style: async (accessor: StylesAccessor) => {
        expect(accessor()).toMatchObject({ color: 'red', backgroundColor: 'blue' })
        expect(accessor('color')).toBe('red')
        expect(await accessor('color', 'green')).toBe('green')
      }});
      expect(div.style.color).toBe('green')
      expect(div.style.backgroundColor).toBe('blue')
    });
  })

  it('sets ref using "ref" key', () => {
    const div = document.createElement('div');
    const ref = { current: null as any };
    props(div, { ref });
    expect(ref.current).toBe(div);
  });

  it('sets attributes as an object', () => {
    const div = document.createElement('div');
    props(div, { id: 'foo', title: 'bar', hidden: false });
    expect(div.getAttribute('id')).toBe('foo');
    expect(div.getAttribute('title')).toBe('bar');
    expect(div.hasAttribute('hidden')).toBe(false);
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
    props(div, async (accessor) => {
      expect(await accessor({ id: 'bar', zIndex: 3, class: { baz: true }, style: { color: 'red' }})).toEqual({class: 'baz', zindex: '3', id: 'bar', style: 'color: red;' });
      expect(accessor('class')).toEqual(['baz'])
      expect(accessor('style')).toMatchObject({ color: 'red' })
      expect(accessor()).toEqual({class: 'baz', zindex: '3', id: 'bar', style: 'color: red;' });
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
