'use strict';

import Component from './lib/component.js';
import loader from './lib/loader.js';

import Graph from './model/graph.js';
import { style, anyOf, rand } from './utils.js';

const colors = {
  rheem: '#CD2A39',
  websocket: '#E66728',
  http: '#455D93',

  dart: '#3A77C3',
  erlang: '#7B1333',

  psql: '#45688C',
  mongo: '#6FAD4F'
};

class Solution extends Component {
  constructor() {
    super({
      selectors: {
        graph: '.graph'
      }
    });
  }

  init() {
    this.currentStage = 0;
    this.stages = [
      () => {
        this.graph.scale = 1;
        this.graph.add({
          nodes: [
            {id: 'device-0'},
            {id: 'wifi-0'}
          ],
          links: [
            {source: 'device-0', target: 'wifi-0'}
          ]
        });
      },

      () => {
        this.graph.unlink('device-0', 'wifi-0');
        this.graph.add({
          nodes: [
            { id: 'server-0', cls: 'comm erlang' },
          ],
          links: [
            { source: 'server-0', target: 'wifi-0' },
            { source: 'server-0', target: 'device-0', cls: 'http' }
          ]
        })
      },

      () => {
        this.graph.add({
          nodes: [
            { id: 'hpwh-0' },
            { id: 'ecc-0' },
            { id: 'ewh-0' }
          ],
          links: [
            { source: 'hpwh-0', target: 'wifi-0', cls: 'econet' },
            { source: 'ecc-0', target: 'wifi-0', cls: 'econet' },
            { source: 'ewh-0', target: 'wifi-0', cls: 'econet' },
          ]
        })
      },

      () => {
        this.graph.add({
          nodes: [
            { id: 'mobile-0' }
          ],
          links: [
            { source: 'mobile-0', target: 'server-0', cls: 'http' }
          ]
        })
      },

      () => {
        this.graph.unlink('server-0', 'device-0');
        this.graph.unlink('server-0', 'mobile-0');

        this.graph.add({
          nodes: [
            { id: 'server-1', cls: 'api-bridge dart' }
          ],
          links: [
            { source: 'server-1', target: 'mobile-0', cls: 'http' },
            { source: 'server-1', target: 'device-0', cls: 'http' },
          ]
        })
      },

      () => {
        this.graph.add({
          nodes: [
            { id: 'db-0', cls: 'mongo' }
          ],
          links: [
            { source: 'server-1', target: 'db-0', cls: 'mongo' },
            { source: 'server-0', target: 'db-0', cls: 'mongo' },
            { source: 'server-1', target: 'server-0', cls: 'http' }
          ]
        })
      },

      () => {
        this.graph.add({
          nodes: [
            { id: 'db-1', cls: 'psql' }
          ],
          links: [
            { source: 'server-1', target: 'db-1', cls: 'psql' },
            { source: 'server-0', target: 'db-1', cls: 'psql' },
          ]
        })
      },

      () => {
        this.graph.unlink('server-0', 'wifi-0');
        this.graph.add({
          nodes: [
            { id: 'server-2', cls: 'gateway dart' }
          ],
          links: [
            { source: 'wifi-0', target: 'server-2', cls: 'websocket' },
            { source: 'server-0', target: 'server-2', cls: 'http' },
          ]
        })
      },

      () => {
        const devices = 50;

        this.graph.scale = .5;

        for (let i = 0, ii = devices; i < ii; i++) {
          const id = `${anyOf(['device', 'mobile'])}-${1 + i}`;

          this.graph.add({
            nodes: [{ id }],
            links: [{ source: id, target: 'server-1', distance: rand(100, 600), cls: 'http' }]
          });
        }
      },

      () => {
        const devices = 100;

        this.graph.scale = .4;

        for (let i = 0, ii = devices; i < ii; i++) {
          const id = `${anyOf(['wifi', 'hpwh', 'ecc', 'ewh'])}-${1 + i}`;

          this.graph.add({
            nodes: [{ id }],
            links: [{ source: id, target: 'server-2', distance: rand(100, 600), cls: 'econet' }]
          });
        }
      },

      () => {
        style(this.graph.el, '.dart', { color: colors.dart });
        style(this.graph.el, '.erlang', { color: colors.erlang });
        style(this.graph.el, '.mongo', { color: colors.mongo });
        style(this.graph.el, '.psql', { color: colors.psql });
      },

      () => {
        style(this.graph.el, '.econet', { color: colors.rheem });
        style(this.graph.el, '.websocket', { color: colors.websocket });
        style(this.graph.el, '.http', { color: colors.http });
      }
    ];

    this.graph = new Graph({ el: this.el.graph });

    Array(10).fill(0).map(() => this.next());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'x') {
        this.next();
      }
    });

  }

  next() {
    let nextStage = this.currentStage + 1;

    if (nextStage > this.stages.length) {
      this.graph.clear();
      this.currentStage = 0;
    } else {
      this.stages[this.currentStage++]();
    }
  }
}

////////////////////////////////////////////////////////////////

window.solution = new Solution();