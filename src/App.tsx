import { Component, type ErrorInfo, type ReactNode } from 'react'
import { OSProvider } from './os/OSProvider'
import { Shell } from './os/Shell'

interface BoundaryState {
  failed: boolean
}

class Boundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('MATRIXX OS kernel panic', error, info)
  }

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <div className="error-screen">
          <div>
            <h1>Something went wrong</h1>
            <p>The desktop session hit an unexpected error. Restart the session to continue.</p>
            <button type="button" onClick={() => window.location.reload()}>
              Restart Session
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <Boundary>
      <OSProvider>
        <Shell />
      </OSProvider>
    </Boundary>
  )
}
