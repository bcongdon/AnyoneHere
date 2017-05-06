import React, { Component } from 'react';
import * as d3 from 'd3'
import Faux from 'react-faux-dom'
import moment from 'moment';
import { chain, filter, groupBy } from 'lodash';

const margin = {top: 10, right: 10, bottom: 10, left: 15}
const width = 960 - margin.left - margin.right
const height = 405 - margin.top - margin.bottom
const padding = 3
const xLabelHeight = 30
const yLabelWidth = 80
const borderWidth = 3
const duration = 500

class UserChart extends Component {

  getMeasurementSummary() {
    return chain(this.props.measurements)
    .filter('time')
    .map((o) => { return moment.utc(o.time).local() })
    .groupBy((m) => { return m.day() })
    .mapValues((day) => { 
      return groupBy(day, (m) => { return m.hour() });
    })
    .value();
  }

  render() {
    console.log(this.getMeasurementSummary());
    var elem = Faux.createElement('div');
    var chart = d3.select(elem).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var border = chart.append('rect')
    .attr('x', yLabelWidth)
    .attr('y', xLabelHeight)
    .style('fill-opacity', 0)
    .style('stroke', '#000')
    .style('stroke-width', borderWidth)
    .style('shape-rendering', 'crispEdges');

    return elem.toReact();
  }
}

export default UserChart;