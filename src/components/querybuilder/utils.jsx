/**
 * @author zacharyjuang
 * 2018-11-29
 */
export function isMod(node) {
  return node.nodeType === 'MOD' || node.nodeType === 'MOD_GROUP';
}

export function isTF(node) {
  return node.nodeType === 'TF' || node.nodeType === 'GROUP';
}
