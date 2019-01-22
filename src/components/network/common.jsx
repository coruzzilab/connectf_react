/**
 * @author zacharyjuang
 * 9/5/18
 */
import React from "react";
import {PopoverBody, PopoverHeader, UncontrolledPopover} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export class UploadSifInfoPopover extends React.Component {
  render() {
    return <UncontrolledPopover {...this.props} trigger="legacy">
      <PopoverHeader>Upload Edges</PopoverHeader>
      <PopoverBody>
        <p>Accepts tab (<span className="text-monospace">&#34;\t&#34;</span>) delimited text file with 3 columns. In
          order: source, edge name, and target. <a target="_blank" rel="noopener noreferrer"
                                                   href="http://manual.cytoscape.org/en/stable/Supported_Network_File_Formats.html#sif-format">More
            info.</a>
        </p>
        <p>Only creates new edges on the current network. Does <b>not</b> create new nodes.</p>
        <p><a href={"data:text/plain,source1\tedge_name\ttarget1\nsource2\tedge_name\ttarget2\n...\t...\t...\n"}
              download="example.sif" className="btn btn-primary btn-sm">
          <FontAwesomeIcon icon="file-download" className="mr-1"/>Download Example File</a></p>
      </PopoverBody>
    </UncontrolledPopover>;
  }
}
