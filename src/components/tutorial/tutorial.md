# Making A Query

## Searching For A Transcription Factor

<img src="../../images/query1.png" class="img-fluid shadow" style="max-height: 400px" alt="query box"/>

&nbsp;

Typing the name or ID of a Transcription Factor brings up a list of available Transcription Factors.

## Build Query

### Adding Transcription Factors To Query

<img src="../../images/query2.png" class="img-fluid shadow" style="max-height: 400px" alt="query box"/>

&nbsp;

For more complex queries, click **Add TF** to add multiple transcription factors to the query.
Use **Add TF Group** plus drag-and-drop to arrange transcription factors into groups.
Selecting **and** or **or** will query either intersection or union of the group.

#### Pseudo transcription factor keywords

The special ***oralltf*** keyword can be used in place of transcription factor IDs to query *all* transcription factors at once. 
While the ***multitype*** keyword can be used to query transcription factors that have multiple experiment types,
as defined in the metadata of each experiment.

*Caution!* The more transcription factors queried will result in a longer wait time.

#### Build Query

Click the **Build Query** button to populate the search query input once all the desired transcription factors have been selected and grouped.

### Select Additional Edges

In the **Additional Edges** section, select additional edge properties that you would like to be displayed alongside the results. 
(*e.g.* whether each edge is validated by DAP, etc.)

### Select A Target Gene List

The **Target Genes** allows user to limit the output of transcription factor targets to a user defined set of genes.
Rather than returning all available targeted genes, only the selected subset of genes that are being targeted in the query will be returned.
This can be used to limit the output of the query to genes you are interested in. Users can upload a file containing a list of gene IDs.

A predefined list of target genes from separate experiments are also available for selection. (See [citation](/citations))

### Select Filter TFs

The **Filter TFs** limits the *transcription factors queried* to a predetermined list.
This only affects queried transcriptions factors, and not its targets.

### Select Target Network

The **Target Network** option uses the selected network to limit both queried transcription factors and their targets.
Effectively limiting the output to the subset of the network provided.

A predefined list of gene networks from separate experiments are also available for selection. (See [citation](/citations))

---

# Results

## Summary

<img src="../../images/summary.png" class="img-fluid shadow" style="max-height: 400px" alt="summary"/>

&nbsp;

A horizontal bar chart detailing the number of targets per analysis per transcription factor.
If there are greater than 50 transcription factors queried, only top 50 by target count will be displayed.

## Table

<img src="../../images/table.png" class="img-fluid shadow" style="max-height: 400px" alt="table"/>

&nbsp;

Displays all of the target genes of each analysis. 
If P-values and Log<sub>2</sub> fold change are available they will be displayed.
A "**+**" sign will be displayed if only binding data is available.

## Metadata

Metadata for each analysis is displayed here.

## Network

<img src="../../images/network_summary.png" class="img-fluid shadow" style="max-height: 400px" alt="network summary"/>

&nbsp;

### Summary, Export, and Link to Graph  View

A summary of the network is included along with a link to the [Network Graph](#network-graph).
An overview of how many edges, transcription factors, and targets are presented.
There are also options to export the network as a [SIF](https://manual.cytoscape.org/en/stable/Supported_Network_File_Formats.html#sif-format) or JSON file, which you can open with [Cytoscape](https://cytoscape.org).

### AUPR — Area Under Precision Recall

*Disclaimer: Only Available if a [Target Network](#select-target-network) is selected during query.*

If a [Target Network](#select-target-network) is selected during the query.

### Network Graph

<img src="../../images/network.png" class="img-fluid shadow" style="max-height: 400px" alt="network graph"/>

&nbsp;

*Network Graph will be slow and will impact overall browser performance if the network has too many edges.*

Queried transcription factors are displayed as a group on the left side, with target genes on the right side, grouped by the number of targeting transcription factors.

Additionally, you can upload a list of edges to be displayed along with the current network with the "**Upload Edges**" button.
Note that user uploaded edges will only connect existing genes in the network. No new genes will be placed in the network.

## Target List Enrichment

All the queried analyses will be checked against [uploaded gene list](#select-a-target-gene-list) or [uploaded network](#select-target-network) for enrichment.

Enrichment is calculated using a Fisher's exact test to check for significant overlap of an analysis' target genes and the gene list.
P-values represents the probability of having an overlap greater than the one observed. All p-values are FDR corrected using the Bonferroni correction.

## Motif Enrichment

## Gene Set Enrichment

Gene set enrichment is the pairwise significance of overlap between all the analyses queried using the Fisher's exact test.
The coordinates on the grid, with each row and column representing a different analysis, indicate which 2 analyses the cell represents, and the shading color indicates the significance off overlap.
A darker color indicates an increased significance of overlap.

## Sungear
