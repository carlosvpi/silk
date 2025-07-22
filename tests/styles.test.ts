import styles from '../src/styles';

describe('styles', () => {
  it('sets cssText when called with a string', () => {
    const div = document.createElement('div');
    styles(div, 'color: red; background: blue;');
    expect(div.style.color).toBe('red');
    expect(div.style.background).toBe('blue');
  });

  it('sets multiple styles when called with an object', () => {
    const div = document.createElement('div');
    styles(div, { color: 'green', backgroundColor: 'yellow', zIndex: 5 });
    expect(div.style.color).toBe('green');
    expect(div.style.backgroundColor).toBe('yellow');
    expect(div.style.zIndex).toBe('5');
  });

  it('sets styles when called with an object of functions', () => {
    const div = document.createElement('div');
    let bgColor
    styles(div, {
      color: color => color('blue'),
      backgroundColor: backgroundColor => {
        backgroundColor('green');
        bgColor = backgroundColor();
        return 'yellow'
      },
      zIndex: 5 });
    expect(div.style.color).toBe('blue');
    expect(bgColor).toBe('green');
    expect(div.style.backgroundColor).toBe('yellow');
    expect(div.style.zIndex).toBe('5');
  });

  it('updates styles using a function callback', () => {
    const div = document.createElement('div');
    div.style.color = 'black';
    div.style.backgroundColor = 'white';
    styles(div, (set) => {
      set('color', 'purple');
      set('backgroundColor', 'orange');
      expect(set('color')).toBe('purple');
    });
    expect(div.style.color).toBe('purple');
    expect(div.style.backgroundColor).toBe('orange');
  });

  it('gets styles', () => {
    const div = document.createElement('div');
    div.style.color = 'black';
    div.style.backgroundColor = 'white';
    expect(styles(div)).toBe('color: black; background-color: white;');
  });

  it('returns cssText when function callback is called with undefined key', () => {
    const div = document.createElement('div');
    div.style.color = 'red';
    div.style.backgroundColor = 'blue';
    let cssTextResult = '';
    styles(div, (set) => {
      cssTextResult = `${set()}`;
    });
    expect(cssTextResult).toBe(div.style.cssText);
  });

  it('returns the updated cssText after setting styles', () => {
    const div = document.createElement('div');
    const cssText = styles(div, { color: 'pink', fontWeight: 'bold' });
    expect(cssText).toBe(div.style.cssText);
    expect(div.style.color).toBe('pink');
    expect(div.style.fontWeight).toBe('bold');
  });

  it('throws an error for invalid argument type', () => {
    const div = document.createElement('div');
    expect(() => styles(div, 123 as any)).toThrow(Error);
    expect(() => styles(div, null as any)).toThrow(Error);
  });
});
