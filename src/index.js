/* global $ */
import {RadarChart} from './lib/radar-chart';
import './scss/main.scss';

if (!RadarChart) {
    throw new Error('No radar chart');
}

let serverData = {
    "report": {
        "name": "Tech Radar 2016",
        "type": "Polar Radar Scatterplot",
        "axis": {
            "r": "stage",
            "a": "section"
        },
        "point": "technology",
        "tooltip": [
            "description",
            "products",
            "investigators"
        ],
        "colors": [
            "#EA1",
            "#00F",
            "#090",
            "#909",
            "#099",
            "#C00"
        ],
        "sections": {},
        "bands": {
            "order": [
                "adopt",
                "trial",
                "investigate",
                "hold"
            ]
        }
    }
}

let swUrl = 'http://localhost:8080/data';
fetch(swUrl)
    .then(response => {

        let json = response.json().then(json => {
            let BANDS = json.bands;
            let RADAR = json.radar;

            // let BANDS = {
            //     PHASE1 : {value: 1, name: "Phase 1", code: "A"},
            //     PHASE2 : {value: 2, name: "Phase 2", code: "B"},
            //     PHASE3 : {value: 3, name: "Phase 3", code: "C"},
            //     PHASE4 : {value: 4, name: "Phase 4", code: "D"},
            //     PHASE5 : {value: 5, name: "Phase 5", code: "E"}
            // };
            
            // let RADAR = [
            //     {
            //         name: 'Segment 1',
            //         points: [
            //             {
            //                 name: "Company 1",
            //                 band: BANDS.PHASE1
            //             }
            //         ]
            //     },
            //     {
            //         name: 'Segment 2',
            //         points: [
            //             {
            //                 name: "Company 2",
            //                 band: BANDS.PHASE2
            //             }
            //         ]
            //     },
            //     {
            //         name: 'Segment 3',
            //         points: [
            //             {
            //                 name: "Company 3",
            //                 band: BANDS.PHASE3
            //             },
            //             {
            //                 name: "Company 4",
            //                 band: BANDS.PHASE5
            //             }
            //         ]
            //     },
            //     {
            //         name: 'Segment 4',
            //         points: [
            //             {
            //                 name: "Company 3",
            //                 band: BANDS.PHASE4
            //             },
            //             {
            //                 name: "Company 4",
            //                 band: BANDS.PHASE3
            //             }
            //         ]
            //     },
            //     {
            //         name: 'Segment 5',
            //         points: [
            //             {
            //                 name: "Company 7",
            //                 band: BANDS.PHASE1
            //             },
            //             {
            //                 name: "Company 8",
            //                 band: BANDS.PHASE4
            //             }
            //         ]
            //     },
            //     {
            //         name: 'Segment 6',
            //         points: [
            //             {
            //                 name: "Technology 4",
            //                 band: BANDS.PHASE4
            //             },
            //             {
            //                 name: "Technology 5",
            //                 band: BANDS.PHASE4
            //             },
            //             {
            //                 name: "Technology 5",
            //                 band: BANDS.PHASE5
            //             },
            //             {
            //                 name: "Technology 5",
            //                 band: BANDS.PHASE5
            //             },
            //             {
            //                 name: "Technology 5",
            //                 band: BANDS.PHASE3
            //             }
            //         ]
            //     }
            // ];
            
            let radarChart = new RadarChart({
                radar: RADAR,
                bands: BANDS
            });
        
            radarChart.render(document.getElementById('app'));


            // add the tooltip area to the webpage
            window.tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);


            window.show_tooltip = function(d,x,y) {
                if (!d.tags) {
                    d.tags = [];
                }

                //console.log("d", d);

                var template = "<div style='font-size: 1.6em; border-top: 6px  " + colors[d.point[0]] + " solid; padding-top: 4px; color: " + colors[d.point[0]] + ";'><div style='float: right; font-size: 10px; text-align: right; opacity: 0.8;'>Drag To Transition<br />Double-Click Edit</div><b>" + (d.label || d.name) +"</b></div>";


                _.each(serverData.report.tooltip, function(tip) {
                    if (d.description && tip.toLowerCase() == "description") {
                        template += "" + d.description + "<br />";
                    } else if (d[tip] && serverData.schema.columnNames[tip]  && serverData.schema.columnNames[tip].type.toLowerCase() == "array") {
                        template += "<br /><div class='list'>" + tip + ":<br />";
                        _.each(d[tip], function (t) {
                            template += "<div class='item' style='background: #EEE; border: 1px #DDD solid; float: left; padding: 4px; margin-right: 2px;'>" + t + "</div>";
                        });
                        template += "</div><div style='clear: both;'></div>";
                    } else if (d[tip]) {
                        template += "<br />" + tip + ":<br />" + d[tip] + "<br />";
                    } else {
                        template += "<br />" + tip  + ":<br />None<br />";
                    }
                });

                if (!window.tooltip) {
                    return;
                }

                window.tooltip.transition()
                    .delay(300)

                    .duration(200)
                    .style("opacity", 0.9);
                window.tooltip.html(template)
                    .attr("font-size", "9px")
                    .style("left", x + "px")
                    .style("top", y + "px");
            }




        });

    })
    .catch((err) => {
        console.log(
            'Catch.', err
        );
    });

