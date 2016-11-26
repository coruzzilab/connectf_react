/**
 * Created by zacharyjuang on 11/23/16.
 */
import React from 'react';

import Querybuilder from './querybuilder';

class App extends React.Component {
  render() {
    return <div>
      <h1>TargetDB</h1>
      <Querybuilder/>
    </div>;
  }
}

App.propTypes = {
  router: React.PropTypes.object.isRequired
};

export default App;
