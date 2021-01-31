const config = {

    time: false,

    gwas: {
        defaultGwasMlogpThreshold: 8
    },

    network: {
        nodes: {
            sizeDomain: [0, 10],
            sizeRange: [2, 10],
            defaultColor: 'rgb(99, 110, 114)'
        },
        links: {
            threshold: 0.7,
            colorThresholds: [0.9, 1],
            colors: ['#eeeeee', '#333333', '#ff0000']
        },
        force: {
            xy: 0.05,
            charge: -40,
            alphaMin: 0.05,
            alphaTarget: 0.005
        }
    },

    matrix: {

        margin: {top: 90, right: 0, bottom: 0, left: 90},

        selfThresholds: [-0.1, 0.4], // remove to have these determined from the data
        selfColors: ['blue', 'white', 'red'], // USA

        transition: {
            duration: 750,
            delay: 3
        }
    },

    histogram: {
        maxLog: 10,
        ticks: 20,
        margin: {
            small: {top: 0, right: 0, left: 0, bottom: 0},
            big: {top: 30, right: 50, left: 50, bottom: 50}
        }
    },

    genePage: {
        showViolin: false,
        gut: false
    }
}

export default config
