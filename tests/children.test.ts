import { getAction } from './util';
import addChildren from '../src/children';

describe('adds', () => {
  let parent: HTMLElement;
  let childA: HTMLElement;
  let childB: HTMLElement;
  let childC: HTMLElement;
  let childD: HTMLElement;

  beforeEach(() => {
    parent = document.createElement('div');
    childA = document.createElement('span');
    childB = document.createElement('span');
    childC = document.createElement('span');
    childD = document.createElement('span');
  });

  it('appends children when called in an array', async () => {
    const ch = addChildren(parent, [childA, childB, childC, childD]);
    expect(parent.children.length).toBe(4);
    expect(parent.children[0]).toBe(childA);
    expect(parent.children[1]).toBe(childB);
    expect(parent.children[2]).toBe(childC);
    expect(parent.children[3]).toBe(childD);
    expect(await ch).toEqual([childA, childB, childC, childD]);
  });

  it('appends children with behaviour', async () => {
    let mountCalled = false;
    const ch = addChildren(parent, [childA, {
      child: childB,
      presence: true,
      onMount: mount => {
        mountCalled = true;
        mount();
      }
    }, childC]);
    expect(mountCalled).toBe(true);
    expect(parent.children[0]).toBe(childA);
    expect(parent.children[1]).toBe(childB);
    expect(parent.children[2]).toBe(childC);
    expect(await ch).toEqual([childA, childB, childC]);
  });

  it('does not add a child when behaviour is false', async () => {
    let mountCalled = false;
    const ch = addChildren(parent, [childA, {
      child: childB,
      presence: false,
      onMount: mount => {
        mountCalled = true;
        mount();
      }
    }, childC]);
    expect(mountCalled).toBe(false);
    expect(parent.children[0]).toBe(childA);
    expect(parent.children[1]).toBe(childC);
    expect(await ch).toEqual([childA, childC]);
  });

  it('unmounts a child when needed', async () => {
    const action = getAction()
    const ch = addChildren(parent, [childA, {
      child: childB,
      presence: async present => {
        expect(present()).toBe(-1);
        present(true);
        expect(present()).toBe(1);
        expect(await present(false)).toBe(-1)
        action.resolve();
      },
      onMount: mount => {mount()}
    }, childC]);
    expect(parent.children[0]).toBe(childA);
    expect(await ch).toEqual([childA, childC]);
    expect(parent.children[1]).toBe(childC);
  });

  it('unmounts a child and deletes it', async () => {
    const action = getAction()
    const ch = addChildren(parent, [childA, {
      child: childB,
      presence: async (present, deletion) => {
        expect(present()).toBe(-1);
        present(true);
        expect(present()).toBe(1);
        expect(await present(false)).toBe(-1)
        expect(await deletion(true)).toBe(true)
        action.resolve();
      },
      onMount: mount => {mount()}
    }, childC]);
    expect(parent.children[0]).toBe(childA);
    expect(await ch).toEqual([childA, childC]);
    expect(parent.children[1]).toBe(childC);
  });

  it('unmounts a child and cancels mount', async () => {
    let cancelMountCalled = false;
    const ch = addChildren(parent, [childA, {
      child: childB,
      onMount: mount => {
        setTimeout(mount, 1000);
        return () => {
          cancelMountCalled = true;
        }
      },
      presence: present => {
        present(true);
        present(false);
      },
    }, childC]);
    expect(cancelMountCalled).toBe(true);
  });

  it('throws for invalid argument type', () => {
    expect(() => addChildren(parent, 'invalid' as any)).toThrow(Error);
  });
});
