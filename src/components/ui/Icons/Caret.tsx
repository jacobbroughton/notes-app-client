const Caret = ({ direction }: { direction: string }) => {
  return (
    // <svg
    //   width="512px"
    //   height="512px"
    //   viewBox="0 0 512 512"
    //   xmlns="http://www.w3.org/2000/svg"
    //   style={{transition: 'transform 0.1s ease', transform: direction === 'down' ? "rotate(-180deg)" : "rotate(0deg)"}}
    // >
    //   <title>ionicons-v5-b</title>
    //   <path d="M414,321.94,274.22,158.82a24,24,0,0,0-36.44,0L98,321.94c-13.34,15.57-2.28,39.62,18.22,39.62H395.82C416.32,361.56,427.38,337.51,414,321.94Z" />
    // </svg>
    <svg
      version="1.1"
      viewBox="0 0 574 1024"
      style={{
        transform: direction === "down" ? "rotate(90deg)" : "rotate(0deg)",
      }}
    >
      <path d="M10 9Q0 19 0 32t10 23l482 457L10 969Q0 979 0 992t10 23q10 9 24 9t24-9l506-480q10-10 10-23t-10-23L58 9Q48 0 34 0T10 9z" />
    </svg>
  );
};

export default Caret;
