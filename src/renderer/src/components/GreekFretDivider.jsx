/**
 * A repeated Greek key pattern, used as a decorative separator.
 */
function GreekFretDivider() {
  return (
    <svg className="greek-fret" aria-hidden="true" focusable="false">
      <defs>
        <pattern
          id="greek-fret-pattern"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 11H11V1H3V8H8V4H5" fill="none" strokeWidth="1.25" />
        </pattern>
      </defs>
      <rect width="100%" height="12" fill="url(#greek-fret-pattern)" />
    </svg>
  );
}

export default GreekFretDivider;
