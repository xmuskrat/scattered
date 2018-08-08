
export default class RadialMath {
    polarX (ra, th) {
        return ra * Math.cos(th * (Math.PI / 180));
    }

    polarY (ra, th) {
        return ra * Math.sin(th * (Math.PI / 180));
    }

    cartesianX (x, y) {
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    }

    cartesianY (x, y) {
        let ra = (Math.atan2(y, x) / (Math.PI / 180));
        if (ra < 0) {
            ra = 360 - Math.abs(ra);
        }
        return ra;
    }
}