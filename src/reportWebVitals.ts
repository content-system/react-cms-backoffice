/**
 * reportWebVitals
 * 
 * Dynamically imports web-vitals and runs metric listeners
 * @param onPerfEntry - callback receiving metric objects
 */
const reportWebVitals = async (
  onPerfEntry?: (metric: { name: string; value: number; [key: string]: any }) => void
) => {
  if (!onPerfEntry) return;

  const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

  // Call each metric function and pass metrics to the callback
  onCLS(onPerfEntry);
  onFCP(onPerfEntry);
  onLCP(onPerfEntry);
  onTTFB(onPerfEntry);
  onINP(onPerfEntry); // new/optional metric supported by latest web-vitals
};

export default reportWebVitals;