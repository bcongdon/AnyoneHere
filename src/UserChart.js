import { Component } from 'react'
import * as d3 from 'd3'
import Faux from 'react-faux-dom'
import moment from 'moment'
import { chain, reduce, map } from 'lodash'

const margin = {top: 25, right: 10, bottom: 10, left: 100}
const width = 600 - margin.left - margin.right
const height = 405 - margin.top - margin.bottom
const padding = 3
const xLabelHeight = 30
const yLabelWidth = 80
const borderWidth = 3
const duration = 500

const xLabels = ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a',
                 '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p',
                 '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p']
const yLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
                 'Thursday', 'Friday', 'Saturday']

class UserChart extends Component {
  getMeasurementSummary() {
    return chain(this.props.measurements)
    .filter('time')
    .map((o) => { return moment.utc(o.time).local() })
    .groupBy((m) => { return m.day() })
    .mapValues((day) => {
      return reduce(day, (result, time) => {
        var hour = time.hour()
        result[hour] = result[hour] ? result[hour] + 1 : 1
        return result
      }, {})
    })
    .map((hours, day) => {
      return map(hours, (c, h) => {
        return {
          day: Number(day),
          hour: Number(h),
          count: c
        }
      })
    })
    .flatten()
    .value()
  }

  render() {
    var data = this.getMeasurementSummary()
    var elem = Faux.createElement('div')
    var chart = d3.select(elem).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    const x = d3.scaleLinear()
    .domain([0, 23])
    .range([0, width])

    const y = d3.scaleLinear()
    .domain([0, 6])
    .range([0, height])

    const xAxis = d3.axisBottom()
    .scale(x)
    .ticks(24)
    .tickFormat((_, i) => xLabels[i])

    const yAxis = d3.axisLeft()
    .scale(y)
    .ticks(7)
    .tickFormat((_, i) => yLabels[i])

    chart.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height - 25})`)
    .call(xAxis)

    chart.append('g')
    .attr('class', 'y axis')
    .call(yAxis)

    var rScale = d3.scaleSqrt()
    .domain([0, 50])
    .range([0, 15])

    chart.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => x(d.hour))
    .attr('cy', d => y(d.day))
    .attr('r', d => rScale(d.count))
    .style('fill', '#333')


    return elem.toReact()
  }
}

export default UserChart
