import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import "./LoadingOverlay.css";

const LoadingOverlay = ({ message }: { message: string | undefined }) => {
  return (
    <div className="loading-overlay">
      <LoadingSpinner />
      {message && <p>{message}</p>}
      <p>
        Loading may take longer than expected due to the server spinning down after not being used for a while.
      </p>
    </div>
  );
};
export default LoadingOverlay;
