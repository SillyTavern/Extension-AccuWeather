/**
 * Convert wind direction degrees to a compass direction string.
 * @param {number} degrees - Wind direction in degrees
 * @returns {string} Compass direction (e.g. 'N', 'NNE', 'NE', etc.)
 */
export function degreesToDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}
