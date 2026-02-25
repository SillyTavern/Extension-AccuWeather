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

/**
 * Convert Celsius to Fahrenheit.
 * @param {number} celsius
 * @returns {number}
 */
export function cToF(celsius) {
    return celsius * 9 / 5 + 32;
}

/**
 * Convert m/s to mph.
 * @param {number} ms
 * @returns {number}
 */
export function msToMph(ms) {
    return ms * 2.23694;
}

/**
 * Convert mm to inches.
 * @param {number} mm
 * @returns {number}
 */
export function mmToIn(mm) {
    return mm / 25.4;
}
