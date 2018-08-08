/* global d3 */

class BaseChart {
    constructor (data) {
        if (!data) {
            throw new Error("no data, can't construct chart");
        }
    }
}

export {BaseChart};