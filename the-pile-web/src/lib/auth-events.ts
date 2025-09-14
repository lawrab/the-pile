// Global auth event emitter for handling auth state changes
export type AuthEvent = 'session-expired' | 'auth-required' | 'logout'

class AuthEventEmitter extends EventTarget {
  emit(event: AuthEvent, detail?: any) {
    this.dispatchEvent(new CustomEvent(event, { detail }))
  }

  on(event: AuthEvent, handler: (e: CustomEvent) => void) {
    this.addEventListener(event, handler as EventListener)
    return () => this.removeEventListener(event, handler as EventListener)
  }
}

export const authEvents = new AuthEventEmitter()