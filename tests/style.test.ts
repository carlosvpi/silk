import style from '../src/style';

describe('style', () => {
  it('returns the current style value when called with only a node and styleName', () => {
    const div = document.createElement('div');
    div.style.color = 'red';
    expect(style(div, 'color')).toBe('red');
  });

  it('sets the style when called with a string', () => {
    const div = document.createElement('div');
    style(div, 'backgroundColor', 'blue');
    expect(div.style.backgroundColor).toBe('blue');
  });

  it('sets the style when called with a number', () => {
    const div = document.createElement('div');
    style(div, 'opacity', 0.5);
    expect(div.style.opacity).toBe('0.5');
  });

  it('sets the style using a function that returns the new value', () => {
    const div = document.createElement('div');
    div.style.opacity = '0.5';
    style(div, 'opacity', prev => prev() === '0.5' ? '1' : '0.5');
    expect(div.style.opacity).toBe('1');
  });

  it('sets the style using a function that returns void', () => {
    const div = document.createElement('div');
    div.style.opacity = '0.5';
    style(div, 'opacity', prev => prev(prev() === '0.5' ? '1' : '0.5'));
    expect(div.style.opacity).toBe('1');
  });

  it('sets the style using a function that returns the new value', () => {
    const div = document.createElement('div');
    div.style.opacity = '0.5';
    style(div, 'opacity', prev => prev() === '0.5' ? '1' : '0.5');
    expect(div.style.opacity).toBe('1');
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
