import text from '../src/text';
import { getAction } from './util';

describe('text', () => {
  it('returns textContent when called with only a Text node', () => {
    const node = document.createTextNode('hello');
    expect(text(node)).toBe('hello');
  });

  it('creates a new Text node when called with a string', async () => {
    const node = document.createTextNode('');
    const promise = text(node, 'world');
    expect(node.textContent).toBe('world');
    expect(await promise).toBe('world');
  });

  it('creates a new Text node when called with a number', async () => {
    const node = document.createTextNode('');
    const promise = text(node, 42);
    expect(node.textContent).toBe('42');
    expect(await promise).toBe('42');
  });

  it('sets textContent when called with a function (resolved immediately)', async () => {
    const node = document.createTextNode('');
    const promise = text(node, value => value('computed text'));
    expect(node.textContent).toBe('computed text');
    expect(await promise).toBe('computed text')
    expect(node.textContent).toBe('computed text');
  });

  it('sets textContent when called with a function (resolved later)', async () => {
    const node = document.createTextNode('');
    const action = getAction()
    const promise = text(node, async value => {
      await action
      value('computed text')
    });
    expect(node.textContent).toBe('');
    action.resolve()
    expect(await promise).toBe('computed text');
    expect(node.textContent).toBe('computed text');
  });

  it('gets textContent value when called with a function', async () => {
    const node = document.createTextNode('Hello');
    const promise = text(node, value => {
      expect(value()).toBe('Hello');
      value('World');
    });
    expect(node.textContent).toBe('World');
    expect(await promise).toBe('World');
  });

  it('the setter returns the correct value', async () => {
    const node = document.createTextNode('Hello');
    const promise = text(node, async value => {
      expect(await value('World')).toBe('World')
    });
    expect(node.textContent).toBe('World');
    expect(await promise).toBe('World');
  });

  it('throws an error when called with an invalid argument type', () => {
    const node = document.createTextNode('');
    expect(() => text(node, {} as unknown as string)).toThrow(Error);
  });
});
