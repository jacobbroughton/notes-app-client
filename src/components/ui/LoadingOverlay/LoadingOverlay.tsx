import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import "./LoadingOverlay.css";

const LoadingOverlay = ({
  message,
  error,
}: {
  message: string | undefined;
  error: string | undefined | null;
}) => {
  return (
    <div className="loading-overlay">
      <LoadingSpinner />
      {message && <p>{message}</p>}
      {error && (
        <div className="error">
          <p>There was an error</p>
          <code>{error}</code>
        </div>
      )}
    </div>
  );
};
export default LoadingOverlay;
