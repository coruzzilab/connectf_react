/**
 * @author zacharyjuang
 * 2019-02-18
 */
import _ from "lodash";
import {blobFromString} from "../../utils";

const clampWeight = _.memoize(_.partial(_.clamp, _, 1, 5));

export const style = [
  {
    selector: 'node',
    style: {
      'font-family': 'helvetica',
      'text-rotation': 270,
      'text-outline-color': '#000000',
      'text-valign': 'center',
      'color': '#000000',
      'shape': 'data(shape)',
      'background-color': 'data(color)',
      'width': 'data(size)',
      'height': 'data(size)',
      'min-zoomed-font-size': 3
    }
  },
  {
    selector: "node[?showLabel]",
    style: {
      'content': function (ele) {
        let name = ele.data('name');
        if (!name) {
          return ele.data('id');
        }
        return `${ele.data('id')} (${ele.data('name')})`;
      }
    }
  },
  {
    selector: "node[predicted][?predicted]",
    style: {
      'border-width': '2px',
      'border-color': '#ff7f00'
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 1,
      'target-arrow-shape': 'data(shape)',
      'target-arrow-color': 'data(color)',
      'curve-style': 'bezier',
      'line-color': 'data(color)',
      'arrow-scale': 0.5,
      'min-zoomed-font-size': 3
    }
  },
  {
    selector: 'edge[weight]',
    style: {
      'width': (ele) => clampWeight(ele.data('weight'))
    }
  }
];

const edge_value = _.unary(_.partial(_.pick, _, ['data.source', 'data.target', 'data.name']));
export const edge_compare = _.overArgs(_.isEqual, [edge_value, edge_value]);

export const networkPNG = _.flow(
  _.partial(_.split, _, ',', 2),
  _.partial(_.get, _, 1),
  atob,
  _.partial(blobFromString, _, 'image/png'),
  URL.createObjectURL
);
