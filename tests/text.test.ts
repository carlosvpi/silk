import text from '../src/text';

describe('text', () => {
  it('returns textContent when called with only a Text node', () => {
    const node = document.createTextNode('hello');
    expect(text(node)).toBe('hello');
  });

  it('creates a new Text node when called with a string', () => {
    const node = document.createTextNode('');
    text(node, 'world');
    expect(node.textContent).toBe('world');
  });

  it('creates a new Text node when called with a number', () => {
    const node = document.createTextNode('');
    text(node, 42);
    expect(node.textContent).toBe('42');
  });

  it('sets textContent when called with a function', () => {
    const node = document.createTextNode('');
    text(node, value => value('computed text'));
    expect(node.textContent).toBe('computed text');
  });

  it('gets textContent value when called with a function', () => {
    const node = document.createTextNode('Hello');
    text(node, value => {
      expect(value()).toBe('Hello');
      return 'World';
    });
    expect(node.textContent).toBe('World');
  });

  it('throws an error when called with an invalid argument type', () => {
    const node = document.createTextNode('');
    expect(() => text(node, {} as unknown as string)).toThrow(Error);
  });
});
