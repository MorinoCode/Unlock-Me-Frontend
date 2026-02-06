import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw, Compass, Send } from "lucide-react";
import "./ErrorBoundary.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState((s) => ({ ...s, errorInfo }));
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoExplore = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onGoExplore?.();
  };

  handleSendReport = async () => {
    const { error, errorInfo } = this.state;
    if (!error) return;
    try {
      const description = [
        String(error?.message || "Unknown error"),
        errorInfo?.componentStack ? `\n\nComponent stack:\n${errorInfo.componentStack.slice(0, 800)}` : "",
      ].join("");
      await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          category: "technical",
          description: description.slice(0, 2000),
          url: typeof window !== "undefined" ? window.location.href : "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          screenSize: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "",
          timestamp: new Date().toISOString(),
        }),
      });
      this.setState({ reportSent: true });
      this.props.onReportSent?.();
    } catch (err) {
      this.props.onReportSent?.(err);
    }
  };

  render() {
    if (!this.state.hasError || !this.state.error) {
      return this.props.children;
    }

    return this.props.fallback ?? (
      <this.props.FallbackComponent
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        onRefresh={this.handleRefresh}
        onGoExplore={this.handleGoExplore}
        onSendReport={this.handleSendReport}
        reportSent={!!this.state.reportSent}
      />
    );
  }
}

export const DefaultErrorFallback = ({
  onRefresh,
  onGoExplore,
  onSendReport,
  reportSent,
}) => {
  const navigate = useNavigate();

  const goExplore = () => {
    onGoExplore?.();
    navigate("/explore", { replace: true });
  };

  return (
    <div className="error-boundary-box" role="alert">
      <div className="error-boundary-icon">
        <AlertTriangle size={48} strokeWidth={1.5} />
      </div>
      <h2 className="error-boundary-title">Something went wrong</h2>
      <p className="error-boundary-message">
        The app ran into an error. You can refresh the page, go to Explore, or send a report to help us fix it.
      </p>
      <div className="error-boundary-actions">
        <button type="button" className="error-boundary-btn error-boundary-btn--primary" onClick={onRefresh}>
          <RefreshCw size={18} />
          Refresh
        </button>
        <button type="button" className="error-boundary-btn error-boundary-btn--secondary" onClick={goExplore}>
          <Compass size={18} />
          Go to Explore
        </button>
        <button
          type="button"
          className="error-boundary-btn error-boundary-btn--secondary"
          onClick={onSendReport}
          disabled={reportSent}
        >
          <Send size={18} />
          {reportSent ? "Report sent" : "Send report"}
        </button>
      </div>
    </div>
  );
};

function ErrorBoundaryWithFallback({ children }) {
  return (
    <ErrorBoundaryClass FallbackComponent={DefaultErrorFallback}>
      {children}
    </ErrorBoundaryClass>
  );
}

export default ErrorBoundaryWithFallback;
