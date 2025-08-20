import addChild, { PresenceAccessor, Behaviour, Presence } from '../src/child';
import { noop } from '../src/util';
import { Argument } from '../types';
import { Actuator, getAction } from './util';

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

  it('appends child when behaviour is true', async () => {
    const idx = await addChild(parent, child, true);
    expect(parent.children.length).toBe(1);
    expect(parent.children[0]).toBe(child);
    expect(idx).toEqual(0);
  });

  it('removes child when behaviour is false, returns its old index when it was a child', async () => {
    parent.appendChild(child);
    const idx = await addChild(parent, child, false);
    expect(parent.children.length).toBe(0);
    expect(idx).toEqual(-1);
  });

  it('removes child when behaviour is false, returns -1 when it was not a child', async () => {
    const idx = await addChild(parent, child, false);
    expect(parent.children.length).toBe(0);
    expect(idx).toEqual(-1);
  });

  it('inserts child at index when behaviour is a number', async () => {
    const other = document.createElement('div');
    parent.appendChild(other);
    const idx = await addChild(parent, child, 0);
    expect(parent.children[0]).toBe(child);
    expect(idx).toEqual(0);
  });

  it('removes child when behaviour is -1', async () => {
    parent.appendChild(child);
    const idx = await addChild(parent, child, -1);
    expect(parent.children.length).toBe(0);
    expect(idx).toEqual(-1);
  });

  it('calls onMount and onUnmount in behaviour object', async () => {
    const onMount = jest.fn(mount => mount());
    const onUnmount = jest.fn(unmount => unmount());
    // Mount
    addChild(parent, child, true, { onMount, onUnmount });
    expect(onMount).toHaveBeenCalled();
    expect(parent.children[0]).toBe(child);
    // Unmount
    addChild(parent, child, false, { onMount, onUnmount });
    expect(onUnmount).toHaveBeenCalled();
    expect(parent.children.length).toBe(0);
  });

  it('calls onMount and onUnmount and retrieves their value inside the accessor', async () => {
    const onCancelMount = jest.fn();
    const onCancelUnmount = jest.fn();
    let resolveMount = getAction()
    let resolveUnmount = getAction()
    const behaviour: Behaviour = {
      onMount: mount => {
        resolveMount.then(mount)
        return onCancelMount
      },
      onUnmount: unmount => {
        resolveUnmount.then(unmount)
        return onCancelUnmount
      }
    }
    addChild(parent, child, async presence => {
      const promise = presence(true)
      resolveMount.resolve()
      await promise
      expect(onCancelUnmount).not.toHaveBeenCalled();
      const promiseUnmount = presence(false)
      resolveUnmount.resolve()
      expect(await promiseUnmount).toBe(-1)
      const promiseMount = presence(true)
      resolveMount.resolve()
      expect(await promiseMount).toBe(0)
    }, behaviour);
    expect(onCancelMount).not.toHaveBeenCalled()
    expect(onCancelUnmount).not.toHaveBeenCalled()
  });

  // it('calls delete and onDelete; does not cancel the deletion', async () => {
  //   const onCancelMount = jest.fn();
  //   const onCancelUnmount = jest.fn();
  //   const onCancelDelete = jest.fn();
  //   const deleteChild = jest.fn();
  //   let resolveMount = getAction()
  //   let resolveUnmount = getAction()
  //   let resolveDelete = getAction()
  //   const behaviour: Behaviour = {
  //     onMount: mount => {
  //       resolveMount.then(mount)
  //       return onCancelMount
  //     },
  //     onUnmount: unmount => {
  //       resolveUnmount.then(unmount)
  //       return onCancelUnmount
  //     },
  //     onDelete: async del => {
  //       resolveDelete.then(del)
  //       return onCancelDelete
  //     }
  //   }
  //   const del = addChild(parent, child, async presence => {
  //     presence(true)
  //     resolveMount.resolve()
  //     await promise
  //     presence(false)
  //     return deleteChild;
  //   }, behaviour);
  //   const promise = del();
  //   expect(await promise).toBe(true);
  // });

  // it('calls delete and onDelete; cancels the deletion', async () => {
  // });

  it('calls onCancelUnmount if mountingState is set', async () => {
    const onCancelMount = jest.fn(() => {});
    const onCancelUnmount = jest.fn(() => {});
    let resolveMount = getAction()
    let resolveUnmount = getAction()
    const behaviour: Behaviour = {
      onMount: mount => {
        resolveMount.then(mount)
        return onCancelMount
      },
      onUnmount: unmount => {
        resolveUnmount.then(unmount)
        return onCancelUnmount
      }
    }
    parent.appendChild(child);
    expect(addChild(parent, child)).toBe(0);
    addChild(parent, child, async presence => {
      expect(presence()).toBe(0)
      expect(onCancelUnmount).not.toHaveBeenCalled();
      const promiseUnmount = presence(false)
      const promiseMount = presence(true)
      resolveMount.resolve()
      resolveUnmount.resolve()
      expect(onCancelUnmount).toHaveBeenCalled()
      expect(await promiseUnmount).toBe(0)
      expect(await promiseMount).toBe(0)
    }, behaviour);
    expect(onCancelMount).not.toHaveBeenCalled()
  });

  it('calls onCancelUnmount but it unmounts after another call', async () => {
    const onCancelMount = jest.fn(() => {});
    const onCancelUnmount = jest.fn(() => {});
    let resolveMounts: Actuator[] = []
    let resolveUnmounts: Actuator[] = []
    const behaviour: Behaviour = {
      onMount: mount => {
        const resolveMount = getAction()
        resolveMounts.push(resolveMount)
        resolveMount.then(mount)
        return onCancelMount
      },
      onUnmount: unmount => {
        const resolveUnmount = getAction()
        resolveUnmounts.push(resolveUnmount)
        resolveUnmount.then(unmount)
        return onCancelUnmount
      }
    }
    parent.appendChild(child);
    expect(addChild(parent, child)).toBe(0);
    addChild(parent, child, async presence => {
      expect(presence()).toBe(0)
      expect(onCancelUnmount).not.toHaveBeenCalled();
      const promiseUnmount1 = presence(false)
      const promiseMount = presence(true)
      resolveMounts.shift()?.resolve()
      expect(await promiseMount).toBe(0)
      const promiseUnmount2 = presence(false)
      resolveUnmounts.shift()?.resolve()
      resolveUnmounts.shift()?.resolve()
      expect(onCancelUnmount).toHaveBeenCalledTimes(1)
      expect(await promiseUnmount1).toBe(0)
      expect(await promiseUnmount2).toBe(-1)
    }, behaviour);
    expect(onCancelMount).not.toHaveBeenCalled()
  });

  it('throws for invalid argument type', () => {
    expect(() => addChild(parent, child, 'invalid' as any)).toThrow(Error);
  });
});
