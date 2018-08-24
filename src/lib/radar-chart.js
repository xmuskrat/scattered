/* global d3 */

// ES6 module, import with webpack babel
// Renders it's own UI, so react not needed.

import {BaseChart} from './base-chart';
import DragHandler from './handlers/drag-handler';
import RadialMath from './math/radial-math'

let lookup = {
    band: [],
    slice: []
};

var radialMath = new RadialMath();

class RadarChart extends BaseChart {

    constructor (data, options = {}) {
        super(data, options);

        if (!data.radar) {
            throw new Error("must pass in radar option");
        }
        if (!data.bands) {
            throw new Error("must pass in radar option");
        }

        // Slice Colors
        if (options.colors) {
            this.colors = options.colors;
        } else {
            this.colors = [
                "#EA1",
                "#00F",
                "#090",
                "#909",
                "#099",
                "#C00"
            ];
        }

        // Radar Data
        this.radar = data.radar;
        this.bands = data.bands;

        let slices = this.radar.map(slice => slice['name']);
        this.sliceSize = (360 / (slices.length )) - 1;

        // Size to the window, unless custom options were passed
        this.width = window.innerWidth;
        this.height = window.innerHeight - 15 - 70;

        if (this.width > this.height) {
            this.width = this.height;
        }
        if (this.width < this.height) {
            this.height = this.width;
        }

        this.indentWidth = 0;

        let bandNames = Object.values(this.bands).map(names => names['name']);
        this.bandSize = (this.getRadius() / (bandNames.length ));
        if (!this.bandSize || this.bandSize.length < 1) {
            throw new Error("must pass bands, found none");
        }

        this.clearPolarMap();
    }

    render (element) {
        if (!this.radar) {
            throw new Error("no data, can't render");
        }
        if (!element) {
            throw new Error("no element, can't render");
        }
        this.element = element;
        this.drawChart(element);
    }

    drawChart (element) {
        let svg = d3.select(element).append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("margin-left", this.indentWidth + "px")
            .append("g")
            .attr("class", "chart")
            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

        this.drawBands(svg);
        this.drawSlices(svg);
        this.drawPoints(svg);
    }

    drawBands(svg) {
        if (!this.bands) {
            throw new Error("no bands");
        }
        let bandNames = Object.values(this.bands).map(names => names['name']);
        let radius = this.getRadius();

        let r = d3.scaleLinear()
            .domain([0, bandNames.length])
            .range([0, radius]);

        let gr = svg.append("g")
            .attr("class", "r axis")
            .selectAll("g")
            .data(r.ticks(bandNames.length).slice(0))
            .enter().append("g");

        // Outer Bounds
        gr.append("circle")
            .attr("r", r);

        // Band Labels
        gr.append("text")
            .attr("x", (d) => { return -r(d) - ((radius / bandNames.length) /2 ) ; })
            .attr("data-id", (d) => {
                return lookup.band.map(band => band['id'])[d];
            })
            .attr("class", "radiusField label")
            .style("text-anchor", "middle")
            .text((d) => { return bandNames[d]; });

        return gr;
    }

    drawSlices(svg) {
        if (!this.bands) {
            throw new Error("no slices");
        }

        let slices = this.radar.map(slice => slice['name']);
        let radius = this.getRadius();
        let colors = this.colors;

        // Slice Lines
        let ga = svg.append("g")
            .attr("class", "a axis")
            .selectAll("g")
            .data(d3.range(0, 360, 360 / slices.length))
            .enter().append("g")
            .attr("transform", (d) => { return "rotate(" + d + ")"; });

        // Slice Lines
        ga.append("line")
            .attr("x2", radius);

        // Slice Labels
        ga.append("text")
            .attr("dx", radius)
            .attr("dy", (d) => { return d < 270 && d > 90 ? -15 : 20 })

            .style("text-anchor", (d) => { return d < 270 && d > 90 ? "begin" : "end"; })
            .style("fill", (d) => { return typeof colors !== 'undefined' ? colors[d / (360/slices.length)] : "#999"; })
            .style("fill-opacity", () => { return "0.4"; })
            .attr("transform", (d) => { return d < 270 && d > 90 ? "rotate(180 " + (radius) + ",0)" : "rotate(0 " + (radius) + ",0)"; })

            .text((d) => { return slices[d / (360/slices.length)]; })
            .attr("data-id", (d) => {
                let slice = d / (360/slices.length);
                return lookup.slice.map(slice => slice['id'])[slice];
            })
            .attr("class", "slice label");

        return ga;
    }

    drawPoints (svg) {
        let colors = this.colors;

        let data = [];
        let pointId = 0;

        this.radar.forEach((slice, sk) => {
            if (slice.points) {
                slice.points.forEach((point) => {
                    let pointData = {
                        pointId: ++pointId,
                        point: [sk, point.band.value],
                        name: point.name,
                        band: point.band,
                        slice: slice.name
                    };
                    data.push(pointData);
                });
            }
        });

        let points = svg.selectAll(".point")
            .data(data)
            .enter().append("circle")

            .attr("data-name", (d) => {
                return d.label;
            })
            .attr("class", (d, i) => { return "point point" + i; })
            .attr("r", 12)

            .on("webkitmouseforcewillbegin", () => {
                d3.event.stopPropagation();
            })
            .on("webkitmouseforcechanged", () => {
                d3.event.stopPropagation();
            })
            .on("webkitmouseforcedown", () => {
                d3.event.stopPropagation();
            })
            .on("click", () => {
                d3.event.stopPropagation();
            })
            .on("dblclick", () => {
                d3.event.stopPropagation();
            })
            .on("mouseover", function (d, i)  {
                let ball = d3.select(this);
                //console.log("ball", ball);
                ball.attr('r',12);
                ball.transition().delay(0).duration(1000).attr("r", 18);

                let label = d3.select(".pointLabel" + i);
                label.transition().delay(0).duration(1000).attr("font-size", "19px");

                // if ( $(this).attr("dragging") !== "true" ) {
                //     show_tooltip(d, (d3.event.pageX + 35), (d3.event.pageY - 28) );
                // }

            })
            .on("mouseout", function (d, i) {
                let ball = d3.select(this);
                ball.transition().delay(0).duration(1000).attr("r", 12);

                let label = d3.select(".pointLabel" + i);
                label.transition().delay(0).duration(1000).attr("font-size", "11px");

                if (typeof tooltip === 'undefined' || !tooltip) {
                    //console.log('no tooltip');
                    return;
                }
                tooltip.transition()
                    .delay(0)
                    .duration(0)
                    .style("opacity", 0);
            })

            .attr('cx', (d) => {
                // console.log('cx d', d);
                this.setPolar(d.pointId, d.point);
                return this.getPolar(d.pointId).x;
            })
            .attr('cy', (d) => {
                return this.getPolar(d.pointId).y;
            })
            .style("fill", (d) => {
                    if (!d) {
                        return;
                    }
                    return colors[d.point[0]];
                }
            )
            .call(new DragHandler(this, this.element).register(d3));

        svg.selectAll(".pointLabel")
            .data(data)
            .enter().append("text")
            .style("fill", () => {
                return "#FFF";
            })
            .style("fill-opacity", () => {
                return "0.7";
            })

            //            .attr("data-name", (d) => {
            //                return d.label;
            //            })
            .attr("class", (d, i) => { return "pointLabel pointLabel" + i; })
            .text((d) => {
                return d.pointId;
            })
            .attr('x', (d) => {
                return this.getPolar(d.pointId).x;
            })
            .attr('y', (d) => {
                return this.getPolar(d.pointId).y;
            })
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "red");

        return points;
    }

    getPolar (id) {
        return {
            pointRadius: this.radiuses[id],
            pointTheta: this.thetas[id],
            x: radialMath.polarX(this.radiuses[id], this.thetas[id]),
            y: radialMath.polarY(this.radiuses[id], this.thetas[id])
        };
    }

    setPolar (id, point) {
        if (!point || point.length !== 2) {
            throw new Error("invalid point, " + point);
        }
        let bandNames = Object.values(this.bands).map(names => names['name']);
        if (!bandNames.length) {
            throw new Error("no bands");
        }

        let pointRadius;
        let bandMin = point[1] * (this.bandSize) + 25;
        let bandMax = bandMin + this.bandSize - 30;
        //console.log('bandMinMax radius range', bandMin, bandMax);

        let pointTheta;
        let sliceMin = (point[0] * (this.sliceSize + 1)) + ((bandNames.length - point[1]) * 4);
        let sliceMax = sliceMin + this.sliceSize - ((bandNames.length - point[1]) * 8);
        //console.log('sliceMinMax theta range', sliceMin, sliceMax);

        if (!sliceMin) {
            throw new Error("Can't calculate sliceMin in setPolar, got " + sliceMin);
        }
        if (!sliceMax) {
            throw new Error("Can't calculate sliceMax in setPolar, got " + sliceMax);
        }
        if (!bandMin) {
            throw new Error("Can't calculate bandMin in setPolar, got " + bandMin);
        }
        if (!bandMax) {
            throw new Error("Can't calculate bandMax in setPolar, got " + bandMax);
        }

        let isColliding = true;

        let ballSize = 14;

        let max_retries = 1300;
        let retries = 0;

        while (isColliding && retries < max_retries) {
            retries++;

            pointRadius = this.getRandom(bandMin, bandMax);
            pointTheta = this.getRandom(sliceMin, sliceMax);

            let checkCollide = false;
            this.thetas.forEach((cachedTheta) => {
                this.radiuses.forEach((cachedRadius) => {
                    let inx = Math.abs(radialMath.polarX(pointRadius, pointTheta) -  radialMath.polarX(cachedRadius, cachedTheta));
                    let iny = Math.abs(radialMath.polarY(pointRadius, pointTheta) -  radialMath.polarY(cachedRadius, cachedTheta));

                    if (!checkCollide && inx < ballSize && iny < ballSize) {
                        //console.log("collision number", retries, "for", id, this.polarX(pointRadius, pointTheta) - this.polarY(cachedRadius, cachedTheta), this.polarY(cachedRadius, cachedTheta) - this.polarY(pointRadius, pointTheta) );
                        checkCollide = true;
                    }
                });
            });

            if (!checkCollide) {
                isColliding = true;
                break;
            }

            if (retries > max_retries - 1) {
                console.log("GIVING UP AT ", retries, "for", id);
                console.log(sliceMax, "|", bandMax);
            }
        }

        if (isNaN(pointTheta)) {
            throw new Error('pointTheta isNaN');
        }
        if (isNaN(pointRadius)) {
            throw new Error('Radius isNaN');
        }

        this.radiuses[id] = pointRadius;
        this.thetas[id] = pointTheta;

        return this.getPolar(id);
    }

    getRadius () {
        return Math.min(this.width, this.height) / 2 - 30;
    }

    getRandom (min, max) {
        if (!min) {
            throw new Error('No min passed into getRandom, got ' + min);
        }
        if (!max) {
            throw new Error('No max passed into getRandom, got ' + max);
        }
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    clearPolarMap () {
        this.thetas = [];
        this.radiuses = [];
    }


}

export {RadarChart};