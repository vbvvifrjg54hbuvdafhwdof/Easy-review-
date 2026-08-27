import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="error-boundary-screen"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#F5F6FA',
            fontFamily: 'sans-serif'
          }}
        >
          <div
            style={{
              maxWidth: '420px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              textAlign: 'center'
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#2B2B33', marginBottom: '12px' }}>
              アプリの読み込みで問題が発生しました
            </h2>
            <p style={{ fontSize: '13px', color: '#6B6B76', lineHeight: 1.6, marginBottom: '20px' }}>
              画面を再読み込みするか、データを初期化して再試行してください。
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#6495ED',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                再読み込み
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 18px',
                  backgroundColor: '#FFF',
                  color: '#C15C7C',
                  border: '1.5px solid #F7ADC3',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                データを初期化
              </button>
            </div>
          </div>
        </div>
      );
    }

    // @ts-expect-error React 19 component props typing
    return this.props.children;
  }
}
