export interface Actuator extends Promise<void> {
  resolve: () => void
}

export function getAction () {
  let r!: Actuator['resolve']
  const action = new Promise<void>(resolve => {
    r = resolve
  })
  ;(action as Actuator).resolve = r
  return action as Actuator
}
