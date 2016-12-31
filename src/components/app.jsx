/**
 * @author zacharyjuang
 */
import React from 'react';

import Querybuilder from './querybuilder';

/**
 * Main app component
 */
class App extends React.Component {
  render() {
    return <div>
      <h1>TargetDB</h1>
      <Querybuilder/>
    </div>;
  }
}

/**
 * Receives router object from react-router
 * @memberOf App
 * @type {{router: (*)}}
 */
App.propTypes = {
  router: React.PropTypes.object.isRequired
};

export default App;
