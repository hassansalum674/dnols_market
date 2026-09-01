import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { isStaleChunkLoadError } from "../lib/chunkReload";

export function AppErrorPage() {
  const error = useRouteError();
  const staleBuild = isStaleChunkLoadError(error);
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "Something went wrong";

  return (
    <div className="center-state app-error-page">
      <img src="/brand/logo4_submark.svg" alt="Dnols" width={64} height={64} />
      {staleBuild ? (
        <>
          <h1 className="app-error-title">Update available</h1>
          <p>
            Dnols Shop was just updated. Refresh the page to load the latest
            version.
          </p>
        </>
      ) : (
        <>
          <h1 className="app-error-title">Something went wrong</h1>
          <p className="muted">{message}</p>
        </>
      )}
      <button
        type="button"
        className="btn"
        style={{ width: "auto", padding: "0 28px" }}
        onClick={() => window.location.reload()}
      >
        Refresh page
      </button>
      <Link to="/" className="back-link">
        Back to home
      </Link>
    </div>
  );
}

export function ServerErrorPage() {
  return (
    <div className="center-state">
      <img src="/brand/logo4_submark.svg" alt="Dnols" width={64} height={64} />
      <p>Something broke on our side.</p>
      <Link className="btn" to="/">
        Back to Today
      </Link>
    </div>
  );
}

export function formatTzs(n: number): string {
  return `${n.toLocaleString("en-TZ")} TZS`;
}
