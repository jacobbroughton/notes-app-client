const Caret = ({ direction }) => {
  return (
    <svg
      width="512px"
      height="512px"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      style={{transition: 'transform 0.1s ease', transform: direction === 'up' ? "rotate(0deg)" : "rotate(-180deg)"}}
    >
      <title>ionicons-v5-b</title>
      <path d="M414,321.94,274.22,158.82a24,24,0,0,0-36.44,0L98,321.94c-13.34,15.57-2.28,39.62,18.22,39.62H395.82C416.32,361.56,427.38,337.51,414,321.94Z" />
    </svg>
  );
};

export default Caret;
