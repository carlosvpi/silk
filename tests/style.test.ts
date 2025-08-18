import style from '../src/style';
import { getAction } from './util';

describe('style', () => {
  it('returns the current style value when called with only a node and styleName', () => {
    const div = document.createElement('div');
    div.style.color = 'red';
    expect(style(div, 'color')).toBe('red');
  });

  it('sets the style when called with a string', async () => {
    const div = document.createElement('div');
    const promise = style(div, 'backgroundColor', 'blue');
    expect(div.style.backgroundColor).toBe('blue');
    expect(await promise).toBe('blue')
  });

  it('sets the style when called with a number', async () => {
    const div = document.createElement('div');
    const promise = style(div, 'opacity', 0.5);
    expect(div.style.opacity).toBe('0.5');
    expect(await promise).toBe('0.5')
  });

  it('sets the style using a function', async () => {
    const action = getAction()
    const div = document.createElement('div');
    div.style.backgroundColor = 'blue';
    const promise = style(div, 'backgroundColor', async style => {
      expect(style()).toBe('blue')
      await action
      const promise = style('red')
      expect(style()).toBe('red')
      expect(await promise).toBe('red')
      expect(style()).toBe('red')
    });
    expect(div.style.backgroundColor).toBe('blue');
    action.resolve()
    expect(div.style.backgroundColor).toBe('blue');
    expect(await promise).toBe('red')
    expect(div.style.backgroundColor).toBe('red');
  });

  it('throws an error for invalid style name', () => {
    const div = document.createElement('div');
    expect(() => style(div, 'length' as any)).toThrow(Error);
    expect(() => style(div, 'parentRule' as any)).toThrow(Error);
  });

  it('throws an error for invalid argument type', () => {
    const div = document.createElement('div');
    expect(() => style(div, 'color', {} as any)).toThrow(Error);
  });
});
