import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import "./LoadingOverlay.css";

const LoadingOverlay = ({ message }: { message: string | undefined }) => {
  return (
    <div className="loading-overlay">
      <LoadingSpinner />
      {message && (
        <div className="text">
          <p>{message}</p>
          <p className="long-time-text">
            Loading may take longer than expected due to the server spinning down after
            not being used for a while.
          </p>
        </div>
      )}
    </div>
  );
};
export default LoadingOverlay;
