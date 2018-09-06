

import RadialMath from '../math/radial-math';
var radialMath = new RadialMath();

export default class DragHandler {
    constructor(chart, element) {
        this.chart = chart;
        this.element = element;
    }

    rubberBand(i, duration) {
        let node = d3.select(".point" + i);
        let label = d3.select(".pointLabel" + i);

        if (duration) {
            node.transition().delay(0).duration(400).attr("transform", "translate(0 0)");
            label.transition().delay(0).duration(400).attr("transform", "translate(0 0)");
        } else {
            node.attr("transform", "translate(0 0)");
            label.attr("transform", "translate(0 0)");
        }
    }

    register(d3) {
        let chart = this.chart;
        let element = this.element;
        let colors = this.chart.colors;

        let dragHandlers = d3.drag()
        .on("start", function(d) {
            d3.select(this).attr("dragging", "true");
            d3.event.sourceEvent.stopPropagation();
            if (typeof window.tooltip == 'undefined' || !window.tooltip) {
                return;
            }

            tooltip.transition()
                .delay(0)
                .duration(0)
                .style("opacity", 0);

        })
        .on("drag", function(d, i) {
            let x = d3.event.x;
            let y = d3.event.y;

            let node = d3.select(this);

            let cx = node.attr("cx");
            let cy = node.attr("cy");

            let fx = parseFloat(x) + parseFloat(cx);
            let fy = parseFloat(y) + parseFloat(cy);

            let band = parseInt(radialMath.cartesianX(x, y) / chart.bandSize);
            let slice = parseInt(radialMath.cartesianY(x, y) / chart.sliceSize);
        
            let bandNames = Object.values(chart.bands).map(names => names['name']);
            let slices = chart.radar.map(slice => slice['name']);
        
            if ( (!bandNames[band] || !slices[slice])  ) {
                if (typeof tooltip !== 'undefined') {
                    tooltip.transition()
                        .delay(0)
                        .duration(0)
                        .style("opacity", 0);
                }
        
                dragHandlers.dragEvent = null;
                //console.log('skip drag', bandNames, band, bandNames[band], slice, slices[slice]);
                return;
            }

            node.style("fill", colors[slice]);
            // let $point = $(".point[data-pointid='" + d.pointId + "']");
            // $point.css({opacity: 0.1});
        
            //console.log(d);
        
            let templateHeader = "<div style='font-size: 1.6em; border-top: 6px  " + colors[slice] + " solid; padding-top: 4px; color: " + colors[slice] + ";'><b>" + d.name + "</b></div>";
            let template = "";
            //console.log('d.band', d.band);
        
            if (d.band && bandNames[band].toLowerCase() !== d.band.name.toLowerCase() ) {
                template += "<p>Move to <b>" + bandNames[band] + "</b> band.</p>";
            }
            if (d.slice && slices[slice].toLowerCase() != d.slice.toLowerCase() ) {
                template += "<p>Move to <b>" + slices[slice] + "</b> slice.</p>";
            }
        
            let coordinates = [0, 0];
            coordinates = d3.mouse( d3.select('body').node() );
        
            //console.log('drag', x, y);
        
            d3.event.sourceEvent.stopPropagation();
            d3.select(this).attr("transform", "translate(" + (x-cx) + "," + (y-cy) + ")");
        
            let label = d3.select(".pointLabel" + i);
            label.attr("transform", "translate(" + (x-cx) + "," + (y-cy) + ")");
        
            dragHandlers.dragEvent = {
                id: d.id,
                pointId: d.pointId,
                point: d.technology,
                band: bandNames[band],
                slice: slices[slice],
                fx: fx,
                fy: fy
            };
        
            if (typeof tooltip !== 'undefined') {
                if (!template) {
                    tooltip.transition()
                        .delay(0)
                        .duration(0)
                        .style("opacity", 0);
        
                    dragHandlers.dragEvent = null;
                    return;
                }
        
                tooltip
                    .style("opacity", 0.9);
        
                template = templateHeader + template;
        
        
                // Tooltip Offset
                let mx = coordinates[0] + 35;
                let my = coordinates[1] - 28;
                tooltip.html(template)
                    .attr("font-size", "9px")
                    .style("left",  mx  + "px")
                    .style("top",  my + "px");
            }
        }).on('end', function(d, i) {
            d3.select(this).attr("dragging", "false");
        
            let x = d3.event.x;
            let y = d3.event.y;
        
            let node = d3.select(this);
            let cx = node.attr("cx");
            let cy = node.attr("cy");
        
            let fx = parseFloat(x) + parseFloat(cx);
            let fy = parseFloat(y) + parseFloat(cy);
        
            let band = parseInt(radialMath.cartesianX(cx, cy) / chart.bandSize);
            let slice = parseInt(radialMath.cartesianY(cx, cy) / chart.sliceSize );
        
            // Rubber band effect, bad selection
            if (!dragHandlers.dragEvent || (dragHandlers.dragEvent.slice.toLowerCase() == d.slice.toLowerCase() && dragHandlers.dragEvent.band.toLowerCase() == d.band.name.toLowerCase())) {
                node.style("fill", colors[slice]);
        
                chart.rubberBand(i, 400);
                return;
            }
            //console.log("do this", dragHandlers.dragEvent);
        
            if (!d.pointId) {
                console.warn("Not sure which tech - " + d.pointId);
                node.style("fill", colors[slice]);
        
                chart.rubberBand(i, 400);
            }
            //console.log(d);
        });

        return dragHandlers;
    }
}
