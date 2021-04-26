import * as d3B from 'd3'
import * as topojson from 'topojson'
import englandRaw from 'assets/england.json'
import textures from 'textures'

const d3 = Object.assign({}, d3B, topojson);

let mapWidth = d3.selectAll('.councils-wrapper').nodes()[0].getBoundingClientRect().width;
let mapHeight = 400 * mapWidth / 300;

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

const map = d3.select('.councils-wrapper')
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
.attr('class', d => 'area ' + d.properties.code + " " + d.properties.name)


let texture = textures.lines()
.size(5)
.stroke("#BDBDBD")
.strokeWidth(1);

map.call(texture);


let parties = []


d3.json('<%= path %>/allData.json')
.then(resultsRaw => {

    resultsRaw.england.full.map(d => {

        let feature = allFeatures.find(f => f.properties.code === d.code)

        if(feature)
        {

            if(d.declared)
            {

                parties.push(d.winningParty)

                d3.select('.' + d.code)
                .classed(d.winningParty, true)
            }
            else
            {
                parties.push('Undeclared')

                d3.select('.' + d.code)
                .classed('undefined', true)
                .style("fill", texture.url());
            }

            
        }

        
    })

    parties = [...new Set(parties)];

    console.log(parties)

    if(window.resize)window.resize()
})
