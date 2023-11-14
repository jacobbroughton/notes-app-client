import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import "./LoadingOverlay.css";

const LoadingOverlay = ({ message }: { message: string | undefined }) => {
  return (
    <div className="loading-overlay">
      <LoadingSpinner />
      {message && <p>{message}</p>}
    </div>
  );
};
export default LoadingOverlay;
