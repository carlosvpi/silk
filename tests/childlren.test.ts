import addChildren from '../src/addChildren';

describe('children', () => {
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

  it('appends children when called in an array', () => {
    const ch = addChildren(parent, [childA, childB, childC, childD]);
    expect(parent.children.length).toBe(4);
    expect(parent.children[0]).toBe(childA);
    expect(parent.children[1]).toBe(childB);
    expect(parent.children[2]).toBe(childC);
    expect(parent.children[3]).toBe(childD);
    expect(ch).toEqual([childA, childB, childC, childD]);
  });

  it('appends children with behaviour', () => {
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
    expect(ch).toEqual([childA, childB, childC]);
  });

  it('does not add a child when behaviour is false', () => {
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
    expect(ch).toEqual([childA, childC]);
  });

  it('unmounts a child when needed', () => {
    let cancelMountCalled = false;
    const ch = addChildren(parent, [childA, {
      child: childB,
      presence: present => {
        expect(present()).toBe(-1);
        present(true);
        expect(present()).toBe(1);
        present(false);
      },
      onCancelMount: () => {
        cancelMountCalled = true;
      }
    }, childC]);
    expect(parent.children[0]).toBe(childA);
    expect(parent.children[1]).toBe(childC);
    expect(ch).toEqual([childA, childC]);
  });

  it('unmounts a child and cancels mount', () => {
    let cancelMountCalled = false;
    const ch = addChildren(parent, [childA, {
      child: childB,
      onMount: mount => {
        setTimeout(mount, 1000);
      },
      presence: present => {
        present(true);
        present(false);
      },
      onCancelMount: () => {
        cancelMountCalled = true;
      }
    }, childC]);
    expect(cancelMountCalled).toBe(true);
  });

  it('throws for invalid argument type', () => {
    expect(() => addChildren(parent, 'invalid' as any)).toThrow(Error);
  });
});
