import * as d3B from 'd3'
import * as topojson from 'topojson'
import englandRaw from 'assets/england.json'

const d3 = Object.assign({}, d3B, topojson);

let mapWidth = d3.selectAll('.map-wrapper').nodes()[0].getBoundingClientRect().width;
let mapHeight = 400 * mapWidth / 300;

const parties = ['Con', 'Lab', 'Lib Dem', 'Ind']

let extent = {
        type: "LineString",
        id:'england',
         coordinates: [
            [-6,55],
            [2,55],
            [2, 51],
            [-6, 51],
        ]
}

const featuresCounties = topojson.feature(englandRaw, englandRaw.objects['county-council']);
const featuresBoroughs = topojson.feature(englandRaw, englandRaw.objects['metropolitan-borough']);
const featuresUnitaries = topojson.feature(englandRaw, englandRaw.objects['unitary-authority']);
const featuresDistricts = topojson.feature(englandRaw, englandRaw.objects['district-council']);

const allFeatures = featuresCounties.features.concat(featuresBoroughs.features).concat(featuresUnitaries.features).concat(featuresDistricts.features)

let projection = d3.geoMercator()
.fitExtent([[0, 0],[mapWidth , mapHeight]], extent)

let path = d3.geoPath()
.projection(projection);

const centroids = []

const radius = d3.scaleSqrt()
.range([0,10])

allFeatures.map(d => centroids[d.properties.code] = path.centroid(d))

parties.map(d => {

    const map = d3.select('.map-wrapper.' + d.replace(' ', '.'))
    .append('svg')
    .attr('width', mapWidth)
    .attr('height', 400 * mapWidth / 300);

    const england = map.append('g')
    const areas = map.append('g')

    england
    .selectAll('path')
    .data(topojson.feature(englandRaw, englandRaw.objects['england']).features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', 'map-bg')

    areas
    .selectAll('path')
    .data(allFeatures)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', 'selected-area')

})

d3.json('<%= path %>/allData.json')
.then(resultsRaw => {


    let parties = []
    resultsRaw.england.full.map(d => {if(d.parties) d.parties.map(p => parties.push(p.party))})

    parties = [...new Set(parties)];

    let divisions = []




    resultsRaw.england.full.map(d => {

        if(d.parties){

            d.parties.map( p => {

                if(p.change / d.totalSeats > 0)divisions.push(p.change / d.totalSeats)

            })
        }
    })

    radius.domain([0,d3.max(divisions)])


    resultsRaw.england.full.map(d => {


        if(d.parties){

            let others = d.parties.filter(f => f.party !== 'Con' && f.party !== 'Lab' && f.party !== 'Lib Dem')

            let othersSum = d3.sum(others, s => s.change)

            if(othersSum > 0)
            {
                d3.select('.map-wrapper.Ind svg')
                .append('circle')
                .attr('class', 'Others')
                .attr('r' , radius(othersSum / d.totalSeats) + 'px')
                .attr('transform', `translate(${centroids[d.code]})` )
            }

            d.parties.map( p => {

                if(p.party === 'Con')
                {

                    if(p.change > 0)
                    {
                        d3.select('.map-wrapper.Con svg')
                        .append('circle')
                        .attr('class', 'CON')
                        .attr('r' , radius(p.change / d.totalSeats) + 'px')
                        .attr('transform', `translate(${centroids[d.code]})` )
                    } 

                    
                }

                if(p.party === 'Lab')
                {

                    if(p.change > 0)
                    {
                        d3.select('.map-wrapper.Lab svg')
                        .append('circle')
                        .attr('class', 'LAB')
                        .attr('r' , radius(p.change / d.totalSeats) + 'px')
                        .attr('transform', `translate(${centroids[d.code]})` )
                    } 

                    
                }

                if(p.party === 'Lib Dem')
                {

                    if(p.change > 0)
                    {
                        d3.select('.map-wrapper.Lib.Dem svg')
                        .append('circle')
                        .attr('class', 'LD')
                        .attr('r' , radius(p.change / d.totalSeats) + 'px')
                        .attr('transform', `translate(${centroids[d.code]})` )
                    } 

                    
                }
            })
        }
    })

    if(window.resize)window.resize()
})
