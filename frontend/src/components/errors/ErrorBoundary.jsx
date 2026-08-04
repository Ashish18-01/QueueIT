import { Component } from 'react';
import { ErrorState } from '../ui/ErrorState.jsx';
export class ErrorBoundary extends Component { constructor(props){ super(props); this.state={ error:'' }; } static getDerivedStateFromError(error){ return { error: error?.message || 'Something went wrong.' }; } render(){ if(this.state.error) return <ErrorState title="Unable to render this view" message={this.state.error} />; return this.props.children; } }
