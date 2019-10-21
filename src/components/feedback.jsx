/**
 * @author zacharyjuang
 * 7/13/17
 */
import React from 'react';
import instance from '../utils/axios_instance';

const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;

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
    });
  }

  submit(e) {
    let {name, feedback} = this.state;
    e.preventDefault();

    let data = new FormData();
    data.set('name', name);
    data.set('feedback', feedback);

    new Promise(function (resolve, reject) {
      if (RECAPTCHA_SITE_KEY) {
        window.grecaptcha.ready(function () {
          window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: 'feedback'})
            .then(function (token) {
              resolve(token);
            }, reject);
        });
      } else {
        reject(new Error('No google recaptcha site key.'));
      }
    }).then((token) => {
      data.set('token', token);
    }).finally(() => {
      return instance('/api/feedback/', {
        data,
        method: 'POST'
      });
    }).then(() => {
      alert("Feedback recorded!");
      this.clear();
    }).catch(() => {
      alert("Something went wrong.");
    });
  }

  render() {
    return <div className="container">
      <h1>Feedback</h1>
      <form onSubmit={this.submit.bind(this)}>
        <div className="form-row mb-1">
          <label htmlFor="name">Name:</label>
          <input type="text" className="form-control" name="name" onChange={this.setName.bind(this)} required
                 value={this.state.name} autoFocus/>
        </div>
        <div className="form-row mb-1">
          <label htmlFor="feedback">Feedback:</label>
          <textarea className="form-control" name="feedback" onChange={this.setFeedback.bind(this)}
                    value={this.state.feedback}/>
        </div>
        <div className="form-row">
          <div className="btn-group">
            <button type="button" className="btn btn-danger" onClick={this.clear.bind(this)}>Reset</button>
            <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </div>
      </form>
    </div>;
  }
}
