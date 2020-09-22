import React from "react";

export const ArabidopsisOverview = () => (<table className="table small">
  <thead>
  <tr>
    <th/>
    <th>No. of TFs</th>
    <th>TF-target interactions</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <th>in planta TF-binding (ChIP-seq)</th>
    <td>26</td>
    <td>257,400</td>
  </tr>
  <tr>
    <th>in vitro TF-binding (DAP-seq)</th>
    <td>382</td>
    <td>3,335,595</td>
  </tr>
  <tr>
    <th>TF-regulation</th>
    <td>62</td>
    <td>145,283</td>
  </tr>
  </tbody>
</table>);

export const MaizeOverview = () => (<table className="table small">
  <thead>
  <tr>
    <th/>
    <th>No. of TFs</th>
    <th>TF-target interactions</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <th>in planta TF-binding (ChIP-seq)</th>
    <td>107</td>
    <td>301,388</td>
  </tr>
  <tr>
    <th>in vitro TF-binding (DAP-seq)</th>
    <td>32</td>
    <td>492,814</td>
  </tr>
  <tr>
    <th>TF-regulation</th>
    <td>5</td>
    <td>45,008</td>
  </tr>
  </tbody>
</table>);

export const RiceOverview = () => (<table className="table small">
  <thead>
  <tr>
    <th/>
    <th>No. of TFs</th>
    <th>TF-target interactions</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <th>in planta TF-binding (ChIP-seq)</th>
    <td>20</td>
    <td>120,366</td>
  </tr>
  <tr>
    <th>TF-regulation</th>
    <td>17</td>
    <td>172,728</td>
  </tr>
  </tbody>
</table>);
