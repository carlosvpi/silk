import addChild, { Behaviour } from '../src/addChild';
import { Accessor } from '../types';

describe('addChild', () => {
  let parent: HTMLElement;
  let child: HTMLElement;

  beforeEach(() => {
    jest.useFakeTimers();
    parent = document.createElement('div');
    child = document.createElement('span');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('gets child presence when present', () => {
    parent.appendChild(child);
    const idx = addChild(parent, child);
    expect(parent.children.length).toBe(1);
    expect(parent.children[0]).toBe(child);
    expect(idx).toBe(0);
  });

  it('gets child presence when absent', () => {
    const idx = addChild(parent, child);
    expect(parent.children.length).toBe(0);
    expect(idx).toBe(-1);
  });

  it('appends child when behaviour is true', () => {
    const idx = addChild(parent, child, true);
    expect(parent.children.length).toBe(1);
    expect(parent.children[0]).toBe(child);
    expect(idx).toBe(0);
  });

  it('removes child when behaviour is false, returns its old index when it was a child', () => {
    parent.appendChild(child);
    const idx = addChild(parent, child, false);
    expect(parent.children.length).toBe(0);
    expect(idx).toBe(0);
  });

  it('removes child when behaviour is false, returns -1 when it was not a child', () => {
    const idx = addChild(parent, child, false);
    expect(parent.children.length).toBe(0);
    expect(idx).toBe(-1);
  });

  it('inserts child at index when behaviour is a number', () => {
    const other = document.createElement('div');
    parent.appendChild(other);
    const idx = addChild(parent, child, 0);
    expect(parent.children[0]).toBe(child);
    expect(idx).toBe(0);
  });

  it('removes child when behaviour is -1', () => {
    parent.appendChild(child);
    const idx = addChild(parent, child, -1);
    expect(parent.children.length).toBe(0);
    expect(idx).toBe(-1);
  });

  it('calls onMount and onUnmount in behaviour object', () => {
    const onMount = jest.fn(mount => mount());
    const onUnmount = jest.fn(unmount => unmount());
    // Mount
    addChild(parent, child, { onMount, presence: true });
    expect(onMount).toHaveBeenCalled();
    expect(parent.children[0]).toBe(child);
    // Unmount
    addChild(parent, child, { onUnmount, presence: false });
    expect(onUnmount).toHaveBeenCalled();
    expect(parent.children.length).toBe(0);
  });

  it('calls onCancelMount and onCancelUnmount if mountingState is set', () => {
    const onCancelMount = jest.fn();
    const onCancelUnmount = jest.fn();
    const behaviour = { onCancelUnmount, onCancelMount, presence: true, isMounting: true, isUnmounting: true }
    // Mounting: should call onCancelUnmount and reset isUnmounting
    addChild(parent, child, behaviour);
    expect(onCancelUnmount).toHaveBeenCalled();
    expect(behaviour.isUnmounting).toBe(false);
    addChild(parent, child, true);
    expect(parent.children[0]).toBe(child);
    // Unmounting: should call onCancelMount and reset isMounting
    behaviour.isMounting = true;
    behaviour.presence = false;
    addChild(parent, child, behaviour);
    expect(onCancelMount).toHaveBeenCalled();
    expect(behaviour.isMounting).toBe(false);
  });

  it('calls onCancelMount and onCancelUnmount if presence is a function', () => {
    const onCancelMount = jest.fn();
    const onMount = jest.fn();
    const onCancelUnmount = jest.fn();
    const onUnmount = jest.fn();
    const behaviour: Behaviour = {
      onCancelUnmount,
      onCancelMount,
      onMount: (mount) => {
        setTimeout(() => {
          onMount(mount());
        }, 1000)
      },
      onUnmount: (unmount) => {
        setTimeout(() => {
          onUnmount(unmount());
        }, 1000)
      },
      presence: (presence) => {
        expect(presence()).toBe(-1);
        expect(presence(true)).toBe(true);
        expect(presence()).toBe(-1);
        jest.advanceTimersByTime(1000);
        expect(onMount).toHaveBeenLastCalledWith(true);
        expect(presence()).toBe(0);
        expect(presence(false)).toBe(true);
        expect(presence(true)).toBe(true);
        expect(onCancelUnmount).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(1000);
        expect(onMount).toHaveBeenCalledTimes(2);
        expect(onMount).toHaveBeenLastCalledWith(true);
        expect(onUnmount).toHaveBeenCalledTimes(1);
        expect(onUnmount).toHaveBeenCalledWith(false);
        expect(presence(false)).toBe(true);
        expect(presence(true)).toBe(true);
        jest.advanceTimersByTime(500);
        expect(presence(false)).toBe(true);
        expect(onCancelUnmount).toHaveBeenCalledTimes(2);
        expect(onCancelMount).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(500);
        expect(onMount).toHaveBeenCalledTimes(3);
        expect(onUnmount).toHaveBeenCalledTimes(2);
        expect(onUnmount).toHaveBeenCalledWith(false);
        jest.advanceTimersByTime(500);
        expect(onUnmount).toHaveBeenCalledTimes(3);
        expect(onUnmount).toHaveBeenCalledWith(true);
      }
    }
    addChild(parent, child, behaviour);
  });

  it('handles presence as a function', () => {
    let called = false;
    addChild(parent, child, {
      presence: (set) => {
        called = true;
        set(true);
      }
    });
    expect(called).toBe(true);
    expect(parent.children[0]).toBe(child);
  });

  it('handles adding a child that is a string', () => {
    addChild(parent, 'Hello World', true);
    expect(parent.childNodes.length).toBe(1);
    expect(parent.childNodes[0].textContent).toBe('Hello World');
  });

  it('handles accessing the first child that is a string', () => {
    parent.appendChild(document.createTextNode('Hello'));
    parent.appendChild(document.createTextNode('World'));
    parent.appendChild(document.createTextNode('Hello'));
    expect(addChild(parent, 'Hello')).toBe(0);
    expect(addChild(parent, 'World')).toBe(1);
  });

  it('handles not adding a string child that already exists', () => {
    parent.appendChild(document.createTextNode('Lorem'));
    parent.appendChild(document.createTextNode('Ipsum'));
    expect(addChild(parent, 'Ipsum', 1)).toBe(false);
  });

  it('handles adding a string child in a specific location', () => {
    parent.appendChild(document.createTextNode('Lorem'));
    parent.appendChild(document.createTextNode('Consectetur'));
    expect(addChild(parent, 'Ipsum', 1)).toBe(1);
    expect(parent.childNodes.length).toBe(3);
    expect(parent.childNodes[1].textContent).toBe('Ipsum');
  });

  it('handles behaviour as a function', () => {
    let called = false;
    addChild(parent, child, (set) => {
      called = true;
      set(true);
    });
    expect(called).toBe(true);
    expect(parent.children[0]).toBe(child);
  });

  it('throws for invalid argument type', () => {
    expect(() => addChild(parent, child, 'invalid' as any)).toThrow(Error);
  });
});
