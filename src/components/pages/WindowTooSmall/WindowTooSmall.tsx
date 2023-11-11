import "./WindowTooSmall.css";

const WindowTooSmall = () => {
  return (
    <div className="wrong-browser-view">
      <div className="wrong-browser-container">
        <h1>Oops!</h1>
        <p>
          Looks like your window is too small. This app is currently only designed for
          desktop use. I am, however, working on a mobile adaptation, so stay tuned!
        </p>

        <strong>
          By the way, i'm sorry about this. I hope you find a chance to check the app out
          on desktop for the time being.
        </strong>
      </div>
    </div>
  );
};
export default WindowTooSmall;
