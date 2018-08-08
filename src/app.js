/* global $ */
import {RadarChart} from './lib/radar-chart';
import './scss/main.scss';

if (!RadarChart) {
    throw new Error('No radar chart');
}

let BANDS = {
    PHASE1 : {value: 1, name: "Phase 1", code: "A"},
    PHASE2 : {value: 2, name: "Phase 2", code: "B"},
    PHASE3 : {value: 3, name: "Phase 3", code: "C"},
    PHASE4 : {value: 4, name: "Phase 4", code: "D"},
    PHASE5 : {value: 5, name: "Phase 5", code: "E"}
};

let RADAR = [
    {
        name: 'Segment 1',
        points: [
            {
                name: "Company 1",
                band: BANDS.PHASE1
            }
        ]
    },
    {
        name: 'Segment 2',
        points: [
            {
                name: "Company 2",
                band: BANDS.PHASE2
            }
        ]
    },
    {
        name: 'Segment 3',
        points: [
            {
                name: "Company 3",
                band: BANDS.PHASE3
            },
            {
                name: "Company 4",
                band: BANDS.PHASE5
            }
        ]
    },
    {
        name: 'Segment 4',
        points: [
            {
                name: "Company 3",
                band: BANDS.PHASE4
            },
            {
                name: "Company 4",
                band: BANDS.PHASE3
            }
        ]
    },
    {
        name: 'Segment 5',
        points: [
            {
                name: "Company 7",
                band: BANDS.PHASE1
            },
            {
                name: "Company 8",
                band: BANDS.PHASE4
            }
        ]
    },
    {
        name: 'Segment 6',
        points: [
            {
                name: "Technology 4",
                band: BANDS.PHASE4
            },
            {
                name: "Technology 5",
                band: BANDS.PHASE4
            },
            {
                name: "Technology 5",
                band: BANDS.PHASE5
            },
            {
                name: "Technology 5",
                band: BANDS.PHASE5
            },
            {
                name: "Technology 5",
                band: BANDS.PHASE3
            }
        ]
    }
];

let radarChart = new RadarChart({
    radar: RADAR,
    bands: BANDS
});

radarChart.render(document.getElementById('app'));
