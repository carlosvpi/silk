import { getAction } from './util'
import styles from '../src/styles';

describe('styles', () => {
  it('returns the current cssText', () => {
    const div = document.createElement('div');
    div.style.color = 'red';
    div.style.backgroundColor = 'blue';
    expect(styles(div)).toMatchObject({"background-color": "blue", "color": "red"});
  });

  it('sets multiple styles when called with an object', async () => {
    const div = document.createElement('div');
    const promise = styles(div, { color: 'green', backgroundColor: 'yellow', zIndex: 5 });
    expect(div.style.color).toBe('green');
    expect(div.style.backgroundColor).toBe('yellow');
    expect(div.style.zIndex).toBe('5');
    await promise
    expect(div.style.color).toBe('green');
    expect(div.style.backgroundColor).toBe('yellow');
    expect(div.style.zIndex).toBe('5');
  });

  it('sets styles when called with an object of functions', () => {
    const div = document.createElement('div');
    let bgColor
    styles(div, {
      color: async color => {
        expect(color()).toBe('')
        const promise = color('blue')
        expect(color()).toBe('blue')
        expect(await promise).toBe('blue')
      },
      backgroundColor: backgroundColor => {
        backgroundColor('green');
        bgColor = backgroundColor();
      },
      zIndex: 5 });
    expect(div.style.color).toBe('blue');
    expect(bgColor).toBe('green');
    expect(div.style.backgroundColor).toBe('green');
    expect(div.style.zIndex).toBe('5');
  });

  it('updates styles using a function callback', async () => {
    const action = getAction()
    const div = document.createElement('div');
    div.style.color = 'black';
    div.style.backgroundColor = 'white';
    styles(div, async (accessor) => {
      expect(accessor()).toMatchObject({ color: 'black', backgroundColor: 'white' })
      expect(accessor('color')).toBe('black')
      expect(await accessor('color', 'purple')).toBe('purple')
      expect(await accessor('backgroundColor', 'orange')).toBe('orange');
      expect(accessor('color')).toBe('purple');
      expect(accessor('backgroundColor')).toBe('orange');
      expect(await accessor('color', 'red')).toBe('red')
      action.resolve()
    });
    expect(div.style.color).toBe('purple');
    expect(div.style.backgroundColor).toBe('white');
    await action
    expect(div.style.color).toBe('red');
    expect(div.style.backgroundColor).toBe('orange');
  });

  it('throws an error for invalid argument type', () => {
    const div = document.createElement('div');
    expect(() => styles(div, null as any)).toThrow(Error);
    expect(() => styles(div, 123 as any)).toThrow(Error);
    expect(() => styles(div, null as any)).toThrow(Error);
  });
});
