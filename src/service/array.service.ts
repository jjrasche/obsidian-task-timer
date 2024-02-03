export const filterOutliers = (values: number[]): number[] => {
	const sorted = values.slice().sort((a, b) => a - b); // Sort the array
	const quartile1 = sorted[Math.floor(sorted.length / 4)];
	const quartile3 = sorted[Math.floor(3 * sorted.length / 4)];
	const iqr = quartile3 - quartile1;
	const lowBoundary = quartile1 - 1.5 * iqr;
	const highBoundary = quartile3 + 1.5 * iqr;
	// todo find a way to tighten these outliers, seems like I should use grouping over stats
	const filtered = values.filter(num => {
	  return (num >= lowBoundary) && (num <= highBoundary);
	});
    
	return filtered;
}

export const averageNumbersNoOutliers = (values: number[]): number => {
    const filtered = filterOutliers(values);
    return filtered.reduce((sum, number) => sum + number, 0) / filtered.length;
}