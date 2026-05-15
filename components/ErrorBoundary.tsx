'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-surface border border-red-500/20 rounded-2xl animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-display text-xl font-700 text-paper mb-2">Something went wrong</h2>
          <p className="text-muted text-sm font-body text-center mb-6">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={this.resetErrorBoundary}
            className="px-6 py-3 bg-accent text-ink rounded-xl text-sm font-display font-600 hover:bg-accent-dim transition-colors"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
