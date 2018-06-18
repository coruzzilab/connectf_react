/**
 * @author zacharyjuang
 * 6/18/18
 */
import _ from 'lodash';

export function blueShader(c, min, max) {
  let l = 48 + Math.round(52 * ((Math.log10(c) - min) / (max - min)));
  l = l < 48 ? 48 : l;
  let background = c ? `hsl(228,89%,${l}%)` : '#FFFFFF';
  let color = l <= 65 && l >= 48 ? 'white' : 'black';

  return [background, color];
}

export function getLogMinMax(data) {
  let res = _(data).flatten().filter((n) => typeof n === 'number');

  return [Math.floor(Math.log10(res.min())), Math.ceil(Math.log10(res.max()))];
}
