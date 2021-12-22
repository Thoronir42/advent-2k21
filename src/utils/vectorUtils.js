export function inArea(point, area) {
    return point.every((p, i) => withinRange(p, area[i]))
}
export function withinRange(p, range) {
    return range[0] <= p && p <= range[1]
}