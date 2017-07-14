/**
 * @author zacharyjuang
 * 7/13/17
 */
import React from 'react';
import {BASE_URL} from '../actions';
import $ from 'jquery';

export default class Feedback extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      feedback: ''
    };
  }

  setName(e) {
    this.setState({
      name: e.target.value
    });
  }

  setFeedback(e) {
    this.setState({
      feedback: e.target.value
    });
  }

  clear() {
    this.setState({
      name: '',
      feedback: ''
    })
  }

  submit(e) {
    let {name, feedback} = this.state;
    e.preventDefault();
    $.ajax(BASE_URL + '/api/feedback/', {
      data: JSON.stringify({name, feedback}),
      contentType: 'application/json',
      type: 'POST'
    }).done(() => {
      alert("Feedback recorded!");
      this.setState({
        name: '',
        feedback: ''
      });
    }).fail(() => {
      alert("Something went wrong.");
    });
  }

  render() {
    return <div className="col-md-4 col-md-offset-4">
      <h1>Feedback</h1>
      <form onSubmit={this.submit.bind(this)}>
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" className="form-control" name="name" onChange={this.setName.bind(this)}
                 value={this.state.name} autoFocus/>
        </div>
        <div>
          <label htmlFor="feedback">Feedback:</label>
          <textarea className="form-control" name="feedback" onChange={this.setFeedback.bind(this)}
                    value={this.state.feedback}/>
        </div>
        <button type="button" className="btn btn-danger" onClick={this.clear.bind(this)}>Reset</button>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>;
  }
}
