'use strict';

import {
  capitalise,
  svg,
  minusHalfOf,
  remove,
  polygon
} from '../utils.js';

export default class Graph {
  constructor(config) {
    this._scale = 1;

    this.el = config.el;
    this.data = config.data || { nodes: [], links: [] };
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.elements();
    this.components();
    this.listeners();
    this.render();
  }

  set scale(value) {
    this._scale = value;
    // this.forceLink.distance(150 * this._scale);
    // this.forceCollide.radius(40 * this._scale);

    this.scheduleRender();
  }

  get scale() {
    return this._scale;
  }



  elements() {
    this.svg = d3.select(this.el).append('svg');

    this.svg.attr('width', this.width);
    this.svg.attr('height', this.height);

    this.links = this.svg.append('g')
      .attr('class', 'links');

    this.nodes = this.svg.append('g')
      .attr('class', 'nodes');
  }

  components() {
    this.forceLink = d3.forceLink()
      .id(d => d.id)
      .distance(d => (d.distance || 150) * this._scale)
      .strength(.6);

    this.forceCollide = d3.forceCollide()
      .radius(d => 30 * this._scale);

    this.simulation = d3.forceSimulation()
      .force('link', this.forceLink)
      .force('charge', d3.forceManyBody())
      .force('collision', this.forceCollide)
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));
  }

  listeners() {
    this.simulation.on('tick', this.onTick.bind(this));
  }

  add(data) {
    data.nodes.forEach(node => {
      node.x = this.width / 2;
      node.y = this.height / 2;
    });

    this.data.nodes = this.data.nodes.concat(data.nodes);
    this.data.links = this.data.links.concat(data.links);

    this.scheduleRender();
  }

  unlink(source, target) {
    remove(this.data.links, link => {
      const sourceId = link.source.id || link.source;
      const targetId = link.target.id || link.target;

      return (sourceId === source && targetId === target) || (sourceId === target && targetId === source);
    });

    this.scheduleRender();
  }

  clear() {
    this.data.nodes = [];
    this.data.links = [];

    this.scheduleRender();
  }

  remove(nodeId) {
    remove(this.data.nodes, node => node.id === nodeId);
    remove(this.data.links, link => {
      const sourceId = link.source.id || link.source;
      const targetId = link.target.id || link.target;

      return sourceId === nodeId || targetId === nodeId;
    });

    this.scheduleRender();
  }

  scheduleRender() {
    if (!this.scheduledRender) {
      this.scheduledRender = setTimeout(() => {
        this.scheduledRender = null;
        this.render();
      }, 0);
    }
  }

  render() {
    let links = this.links
      .selectAll('.link')
      .data(this.data.links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);

    let nodes = this.nodes
      .selectAll('.node')
      .data(this.data.nodes, d => d.id);

    this.renderNodes(nodes);
    this.renderLinks(links);

    this.nodes
      .selectAll('.node')
      .call(
        d3.drag()
          .on('start', this.onDragStarted.bind(this))
          .on('drag', this.onDrag.bind(this))
          .on('end', this.onDragEnd.bind(this))
      );

    this.simulation
      .nodes(this.data.nodes);

    this.simulation
      .force('link')
      .links(this.data.links);

    this.simulation
      .alphaTarget(1)
      .restart();
  }

  onTick() {
    this.links
      .selectAll('.link')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    this.nodes
      .selectAll('.node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
  }

  onDragStarted(d) {
    if (!d3.event.active) {
      this.simulation
        .alphaTarget(1)
        .restart();
    }

    d.fx = d.x;
    d.fy = d.y;
  }

  onDrag(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  onDragEnd(d) {
    if (!d3.event.active) {
      this.simulation
        .alphaTarget(0);
    }

    d.fx = null;
    d.fy = null;
  }

  renderNodes(nodes) {
    const graph = this;

    nodes.exit()
      .each(function() {
        const node = d3.select(this);

        node
          .transition()
          .duration(1000)
          .style('opacity', '0')
          .remove();
      });

    nodes.enter()
      .append((d) => {
        const renderer = graph.getRenderer(d);
        const group = svg('g')
          .attr('class', `node ${d.cls || ''}`)
          .attr('id', d.id);

        renderer.enter.call(graph, group, d);
        renderer.update.call(graph, group, d);

        return group.node();
      });

    nodes
      .each(function(d) {
        const renderer = graph.getRenderer(d);
        const group = d3.select(this);

        renderer.update.call(graph, group, d);
      });
  }

  renderLinks(links) {
    links.enter()
      .append('line')
      .attr('class', d => `link ${d.cls || ''}`)
      .attr('id', d => `${d.source.id || d.source}-${d.target.id || d.target}`)
      .attr('stroke-width', d => 2)
      .attr('stroke', 'currentColor');

    links.exit()
      .transition()
      .duration(1000)
      .style('opacity', 0)
      .remove();
  }

  renderDevice(graph) {
    const size = {
      width: 50 * graph.scale,
      height: 90 * graph.scale
    };

    return {
      enter: g => {
        g.append('rect');
        g.append('circle');
      },
      exit: g => g.remove(),
      update: g => {
        g
          .select('rect')
          .transition()
          .duration(500)
          .attr('width', size.width)
          .attr('height', size.height)
          .attr('rx', size.width / 10)
          .attr('ry', size.width / 10)
          .attr('x', minusHalfOf(size.width))
          .attr('y', minusHalfOf(size.height))
          .attr('fill', 'currentColor');

        g
          .select('circle')
          .transition()
          .duration(500)
          .attr('cy', size.height / 2 - (size.height / 10))
          .attr('r', size.width / 10)
          .attr('fill', 'black')

      }
    };
  }

  renderMobile(graph) {
    const size = {
      width: 45 * graph.scale,
      height: 90 * graph.scale
    };

    size.screenWidth = size.width * .95;
    size.screenHeight = size.height * .9;
    size.screenLeft = (size.width - size.screenWidth) / 2;
    size.screenTop = (size.height - size.screenHeight) / 2;

    return {
      enter: g => {
        g.append('rect')
          .attr('class', 'body');

        g.append('rect')
          .attr('class', 'screen');
      },
      exit: g => g.remove(),
      update: g => {
        g
          .select('.body')
          .transition()
          .duration(500)
          .attr('width', size.width)
          .attr('height', size.height)
          .attr('rx', size.width / 10)
          .attr('ry', size.width / 10)
          .attr('x', minusHalfOf(size.width))
          .attr('y', minusHalfOf(size.height))
          .style('fill', 'currentColor');

        g
          .select('.screen')
          .transition()
          .duration(500)
          .attr('width', size.screenWidth)
          .attr('height', size.screenHeight)
          .attr('x', minusHalfOf(size.width) + size.screenLeft)
          .attr('y', minusHalfOf(size.height) + size.screenTop)
          .attr('rx', size.width / 10)
          .attr('ry', size.width / 10)
          .style('fill', 'black');

      }
    };
  }

  renderServer(graph) {
    const size = {
      width: 50 * graph.scale,
      height: 90 * graph.scale,

      padding: 5 * graph.scale
    };

    size.discWidth = size.width / 3;
    size.discHeight = 3 * graph.scale;
    size.rackWidth = size.width - (size.padding * 2);
    size.rackHeight = size.height / 6;

    return {
      enter: g => {
        g
          .append('rect')
          .attr('class', 'body');

        addRack(0);
        addRack(1);
        addRack(2);

        function addRack(index) {
          g
            .append('rect')
            .attr('class', `rack-${index}`);

          g
            .append('rect')
            .attr('class', `disc-${index}`);

          g
            .append('circle')
            .attr('class', `hdd-${index}`)
        }
      },
      exit: g => g.remove(),
      update: g => {
        g
          .select('rect')
          .transition()
          .duration(500)
          .attr('width', size.width)
          .attr('height', size.height)
          .attr('x', minusHalfOf(size.width))
          .attr('y', minusHalfOf(size.height))
          .style('fill', 'currentColor');

        setRack(0);
        setRack(1);
        setRack(2);

        function setRack(index) {
          const left = minusHalfOf(size.width) + size.padding;
          const top = minusHalfOf(size.height) + size.padding * (index + 1) + size.rackHeight * index;

          g
            .select(`.rack-${index}`)
            .transition()
            .duration(500)
            .attr('width', size.rackWidth)
            .attr('height', size.rackHeight)
            .attr('x', left)
            .attr('y', top)
            .attr('fill', 'black');

          g
            .select(`.disc-${index}`)
            .transition()
            .duration(500)
            .attr('width', size.discWidth)
            .attr('height', size.discHeight)
            .attr('x', left + size.padding)
            .attr('y', top + size.padding)
            .style('fill', 'currentColor');

          g
            .select(`.hdd-${index}`)
            .transition()
            .duration(500)
            .attr('cy', top + size.padding * 1 + size.width / 25)
            .attr('cx', left + size.rackWidth - size.rackWidth / 5)
            .attr('r', size.width / 20)
            .style('fill', 'currentColor')

        }

      }
    };
  }

  renderWifi(graph) {
    const size = {
      width: 30 * graph.scale,
      height: 90 * graph.scale,

      ledRadius: 2 * graph.scale,
      ledStep: 8 * graph.scale,

      buttonRadius: 3.5 * graph.scale
    };

    return {
      enter: g => {
        g.append('rect');

        g.append('circle')
          .attr('class', 'led-0');

        g.append('circle')
          .attr('class', 'led-1');

        g.append('circle')
          .attr('class', 'led-2');

        g.append('circle')
          .attr('class', 'button');

      },
      exit: g => g.remove(),
      update: g => {
        g
          .select('rect')
          .transition()
          .duration(500)
          .attr('width', size.width)
          .attr('height', size.height)
          .attr('x', minusHalfOf(size.width))
          .attr('y', minusHalfOf(size.height))
          .attr('fill', 'currentColor');

        g
          .select('.led-0')
          .transition()
          .duration(500)
          .attr('r', size.ledRadius)
          .attr('fill', 'black');

        g
          .select('.led-1')
          .transition()
          .duration(500)
          .attr('r', size.ledRadius)
          .attr('cy', size.ledStep)
          .attr('fill', 'black');

        g
          .select('.led-2')
          .transition()
          .duration(500)
          .attr('r', size.ledRadius)
          .attr('cy', size.ledStep * 2)
          .attr('fill', 'black');

        g
          .select('.button')
          .transition()
          .duration(500)
          .attr('r', size.buttonRadius)
          .attr('cy', (size.height / 2) - (size.buttonRadius * 2))
          .attr('fill', 'black')

      }
    };
  }

  renderHpwh(graph) {
    return graph.polygonRenderer(graph, 3);
  }

  renderEcc(graph) {
    return graph.polygonRenderer(graph, 5);
  }


  renderEwh(graph) {
    return graph.polygonRenderer(graph, 7);
  }

  polygonRenderer(graph, sides) {
    const radius = 25 * graph.scale;

    return {
      enter: g => g.append('polygon'),
      exit: g => g.remove(),
      update: g => {
        g
          .select('polygon')
          .attr('points',
            polygon(0, 0, radius, sides)
              .map(point => point.toString())
              .join(' ')
          )
          .style('fill', 'currentColor')
      }
    }
  }

  iconRenderer(graph, renderIcon, scaler) {
    const size = {
      scale: scaler * graph.scale
    };

    return {
      enter: g => {
        const icon = g
          .append('g')
          .attr('class', 'icon');

        renderIcon(icon);
      },
      exit: g => g.remove(),
      update: g => {
        setTimeout(() => {
          const el = g.select('.icon').node();
          const iconSize = el.getBBox();

          iconSize.width *= scaler / 2;
          iconSize.height *= scaler / 2;

          g
            .select('.icon')
            .transition()
            .duration(500)
            .attr('transform', `scale(${size.scale}) translate(-${iconSize.width / 2}, -${iconSize.height / 2})`);
        })
      }
    }
  }

  renderDb(graph) {
    return graph.iconRenderer(
      graph,
      icon =>
        icon
          .append('path')
          .attr('d', 'M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z')
          .style('fill', 'currentColor'),
      3
    );
  }


  renderDefault(graph) {
    const size = {
      radius: 40
    };

    return {
      enter: g => g.append('circle'),
      exit: g => g.remove(),
      update: g =>
        g
          .select('circle')
          .transition()
          .duration(500)
          .attr('r', size.radius * graph.scale)
          .attr('fill', 'white')
    }
  }

  getRenderer(d) {
    const [type] = d.id.split('-');
    const renderer = (this[`render${capitalise(type)}`] || this.renderDefault);

    return renderer(this);
  }
}