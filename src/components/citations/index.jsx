/**
 * @author zacharyjuang
 * 2019-04-12
 */
import React from 'react';
import citations from './citations.md';

const Citations = () => {
  return <div className='container'>
    <div className="row">
      <div className="col">
        <div dangerouslySetInnerHTML={{__html: citations}}/>
      </div>
    </div>
  </div>;
};

export default Citations;
