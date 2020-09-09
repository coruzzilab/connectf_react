# Making a Query

There are two main ways to query the ConnecTF database:
- Write the query in the text box provided. We imagine this will be the preferred method for researchers as they become comfortable with the syntax.
- Use the query builder to create the query. This is a great way to start if you are not familiar with the syntax.

## Searching for a Transcription Factor

![query box](../../images/query1.png)

Typing the name or ID of a transcription factor (TF) in the query search bar brings up a list of available TFs in the ConnecTF database.

![query box](../../images/tf_search_textbox.jpg)

Select the TF you are interested in and select "Submit". 

## Query Builder

### Adding Transcription Factors to a Query

![query box](../../images/query2.png)

For more complex queries, click **Add TF** to add one or more TFs to the query. Selecting **and** or **or** will query the target genes that form the intersection or union, respectively, of the TFs in the query. For example, the query in the following two images will return only targets that have an interaction with *both* AT5G65210 and AT5G10030.

![query box](../../images/tf_search_query_builder.jpg)

The **Build Query** button will turn orange when it needs to be updated. Click on it to see the query in the textbox. Click on the the **Submit** button to execute the query. You may choose to unselect the checkbox **Confirm Query Before Submit** if you would like to bypass the popup to confirm the query submission.

![query box](../../images/tf_search_query_builder_built.jpg)

TFs can further be arranged by drag-and-drop into groups created using the **Add TF Group** button. TF groups and filter groups (see following section) are containted within a set of parentheses in the query search bar when the query is built and allow more complex queries to be created. For example, the following query uses a TF group containing AT4G01500 and AT3G10800 to return targets that have in interaction with AT3G26790 and *either* AT4G01500 or AT3G10800

*AT3G26790 and (AT4G01500 or AT3G10800)*

Compare that to the following query without a TF group. This query will return targets with an edge from *both* AT3G26790 and AT4G01500 as well any targets with a AT3G10800 interaction. 

*AT3G26790 and AT4G01500 or AT3G10800*

### Adding Metadata Filters to a Query

Constraits can be added to restrict the target genes returned by the query based on the metadata associated with an experiment. This is done by clicking on the **Add Filter** button and then selecting the desired metadata field from the dropdown menu and a value in the adjacent text box. Available values can be seen by clicking on the empty text box. Metadata filters will appear within a set of square brackets in the query search bar when the query is built. 

Combinations of filters can be created with the **Add Filter Group** enabling complex filtering of TF-target gene datasets. Users familiar with the query syntax can add metadata filters to queries they type into the query search bar.  

The following example returns targets of AT5G65210 and AT5G10030 that are induced and have a *P*-value less than 0.05.

![query box](../../images/meta_filter_query_builder.jpg)


#### Generate Query Created in Query Builder

Click the **Build Query** button to populate the query search bar once all the desired TFs have been selected and grouped.

### Select Additional Edge Features

Additional directed and undirected TF-target interactions, including TF-TF protein-protein interactions and in vitro TF-binding (DAP-seq) filtered for open chomatin regions are included in ConnecTF. These interactions can be displayed as additional columns in the results table by selecting the desired edge type in the **Additional Edge Features** section. 

![edgefeatures](../../images/additional_edge_features.jpg)

### Select a Target Gene List

The **Target Genes** allows users to limit the output of the TF targets to a user defined set of genes. Rather than returning all available TF-targeted genes, only the subset of the TF-targeted genes that are in the selected target gene list will be returned. This can be used to limit the output of the query to genes you are interested in, e.g. a pathway of interest. Users can upload a file containing a one or more list of gene IDs. For example, a single user-uploaded file can contain genes that are induced by a treatment as well as a separate list of genes that are repressed by the treatment. 


![targetgenes](../../images/target_genes.jpg)

Predefined target gene lists for the nitrogen by time response and hormone respones are available for selection. (See [Citations](/citations))

### Select Filter TFs

The **Filter TFs** limits the *TFs queried* to a user-selected list. This only affects queried TFs, and not its targets. Often used with the built-in keywords (see below) such as ***all_tfs*** to return the results for many TFs without having to enter each of them into the query search bar one by one.

![targetgenes](../../images/filter_tfs.jpg)


### Select Target Network

Users further have the option of uploading their own network, formatted as tab- or space-delimited file with *source, edge_type, target* columns using the **Target Network** field. An optional fourth *edge score* column can also be included. The selected network is used to limit both queried TFs (first column in network) and targets (third column in network). If a set of TFs or targets are also selected using the **Target Genes** or **Filter TFs** inputs, the network can be further limited to thsoe genes. When a **Target Network** is included in a query, an interactive precision-recall (AUPR) tool appears in the **Network** tab.

![targetnetwork](../../images/target_network.jpg)

A predefined list of gene networks are available for selection. (See [Citations](/citations))

### Select Background

Several of the analysis tools in ConnecTF report enrichment of the queried TF-target gene list(s) (see below). By default, all protein coding genes are used the background for these calculations. Users can input there own list of genes (e.g. all genes expressed under their experimental condition) for these calcuations using the **Select Background** option. 

![background](../../images/background.jpg)

## Built-in Keywords for Common Queries

Special keywords have been added that allow users to easily query commonly used sets TFs. These include:

***all_tfs***  - query *all* TFs in the ConnecTF database<br>
***multitype*** -  query TFs that have more than one "Experiment_Type" in the metadata<br>
***all_expression*** - short hand query for "all_tfs[EXPERIMENT_TYPE = Expression]", returns all RNA-seq/microaray experiments<br>
***in_planta_bound*** - short hand query for "all_tfs[EDGE_TYPE = in planta:Bound]", returns all binding experiments done in planta<br>
***all_dap*** - short hand query for "all_tfs[EDGE_TYPE = in vitro:Bound:DAP or EDGE_TYPE = in vitro:Bound:ampDAP]", returns all DAP-seq binding experiments

*Caution!* Queries generated using these shortcuts can easily return a large number of TF experiments which could result in long wait times.

## Advanced Queries

### Query Expansion

A special ***expand()*** function has been added that allows more complex queries to be applied to a set of TFs which are specified in the **Filter TFs** (or **Target Network**) box. 

The basic syntax is:

*expand(query, operator)*

To demonstrate, for the following query and list of TFs:

*expand("$filter_tf[log2fc < 0] and $filter_tf[EDGE_TYPE='in planta:Bound']", or)*

*Filter TFs:<br>
AT5G04340<br>
AT2G46680*

A query is built by replacing each occurence of **$filter_tf** with the TFs in the list one by one, and combining them using the chosen operator (**and** or **or**). The above example would be equivilent to:

*(AT5G04340[log2fc < 0] and AT5G04340[EDGE_TYPE='in planta:Bound']) or (AT2G46680[log2fc < 0] and AT2G46680[EDGE_TYPE='in planta:Bound'])*


---

# Results

Once the query is submitted, the first screen that is presented is the **Summary** of the results. The different tabs in the results is based on the original query and filters that were applied. 

One the top right of the results there are 4 different buttons:
- **Show/Hide Analysis** - Select analyses to include/exclude. Only the selected analyses will be used for multiple testing correction. This can be useful when **and** is used to compare the overlap of two analyses, as the query will return both analyses with the same set of targets. Users can also assign custom labels to an analysis that can be displayed in the various tools.
- **Show Query** - The query that was submitted in the textbox
- **Back** - Return to the query page keeping the same inputs
- **New Query** - Start a new query from scratch. 

## Summary

Summary includes a horizontal bar chart detailing the number of targets per experimental analysis for each TF. If there are greater than 50 TFs queried, only top 50 by total target count will be displayed. The TFs are ordered (top to bottom) by the total number of edges across all analyses returned by the query.

![summary](../../images/summary2.jpg)


## Table

![table](../../images/table.png)

Displays all of the target genes of each analysis. If *P*-values and Log<sub>2</sub> fold change are available they will be displayed. A "**+**" sign will be displayed if no *P*-value and Log<sub>2</sub> fold change is available for that analysis. The table can be exported as an Excel or CSV file. The combined list of target genes from the query can be exported as a text file, copied to the clipboard, or saved as a temporary list within ConnecTF that the user can then use to filter TFs or targets in subsequent queries.

## Metadata

Metadata for each analysis returned by the query is displayed here and can be exported as a CSV file.

## Network

![network summary](../../images/network_summary.png)

### Summary, Export, and Link to Graph View

A summary of the network is included along with a link to the [Network Graph](#network-graph). An overview of how many edges, transcription factors, and targets are presented. There are also options to export the network as a [SIF](https://manual.cytoscape.org/en/stable/Supported_Network_File_Formats.html#sif-format) or JSON file, which you can open with [Cytoscape](https://cytoscape.org).

### Network Graph

![network graph](../../images/network.png)

*Network Graph will be slow and will impact overall browser performance if the network has too many edges.*

Queried TFs are displayed as a group on the left side, with target genes on the right side, grouped by the number of targeting TFs. Green triangles represent TFs, while all other genes are blue squares. 

Additionally, you can upload a list of edges to be displayed along with the current network with the "**Upload Edges**" button. Note that user uploaded edges will only connect existing genes in the network. No new genes will be placed in the network.

### AUPR — (Area Under Precision Recall)

If a [Target Network](#select-target-network) is selected/uploaded during the query, an auotmated precision/recall analysis is performed and AUPR for the predicted/inferred network is reported using the validated edges from the query results. A precision cutoff can be selected using the slide bar or text box to refine/prune the network and the table will auotmatically be updated to display the results.   

*This feature only appears if a [Target Network](#select-target-network) is selected during query. **A ranked network is required**, otherwise the results will be meaningless*

## Target List Enrichment

All the queried analyses will be checked against [uploaded gene list](#select-a-target-gene-list) or [uploaded network](#select-target-network) for enrichment.

![listenrichment](../../images/target_list_enrichment.jpg)

Enrichment is calculated using a Fisher's exact test to check for significant overlap between the validated TF-targets returned by the query and the selected target gene list(s). The user can toggle between *P*-value, specificity (percent of TF-target genes in the selected target list) or influence (percent of genes in the selected target list regulated by the TF). All *P*-values are FDR corrected using the Bonferroni correction.

![listenrichment](../../images/list_enrichment.svg)

The heatmap presents similar information as the table but provides a graphical representation.

![listenrichment](../../images/list_enrichment_options.jpg)

The options tab above the results can be used to :
- Adjust the color range for the heatmap
- Add additional fields to the table
- Add extra fields to the heatmap



## Motif Enrichment

### Motif Cluster Table

For each TF analysis returned by the query, the 500 bp promoter region of the TF-target genes will be checked for enrichment of any of 80 cis-motif clusters from Brooks et al 2019 (See [Citations](/citations)). By default, a *P*-value cutoff (alpha) of 0.05 is used and only clusters that are enriched in at least one TF-analysis are displayed. All *P*-values are FDR corrected using the Bonferroni correction.

Enrichment is also shown for any selected target gene list or network. FDR correction on these is done independently of the validated TF-target analyses returned by the query. 

![motifenrichment](../../images/motif_enrichment.jpg)

### Individual Motifs

ConnecTF also contains 1310 cis-motifs for 730 Arabidopsis TFs collected from Cis-BP (See [Citations](/citations)). Enrichement of each of these experimentally validated TF cis-motifs in the queried TF-target analyses can calculated in this tab. By default, only the cis-motif(s) for the TF itself will be calculated, but users can use the *Select Motifs* button to calculate enrichment of any of the other motifs in the targets of a specifc TF analysis, or use the *Add/Remove Motifs* button to select a cis-motif for all queried analyses

![motifindividual](../../images/motif_enrichment_individual.jpg)

![motifindividualselect](../../images/motif_enrichment_select_individual.jpg)
### Changing the Cutoff and Geneic Region 

The *Options* button at the top of each of the motif enrichment tabs can be used to adjust the *P*-value cutoff (alpha) or select other geneic regions (e.g. 1000bp promoter, 5'UTR, CDS etc.). 

![motifgenomic](../../images/motif_enrichment_location.jpg)

## Gene Set Enrichment

Gene set enrichment is the pairwise significance of overlap between all the analyses queried using the one-sided Fisher's exact test. The position on the grid indicates which overlap  the cell represents, with each row and column representing a different queried analysis. Cells above the diagonal report the *P*-value for the upper tail (greater or equal to the observed overlap between TF-target sets) and cells below the diagonal report the *P*-value for the lower tail (lesser or equal to the observed overlap between TF-target sets). The shading color indicates the significance of overlap, with a darker color indicating lower *P*-values.

Adapted from the Genesect tool described in [Krouk *et al* and Katari *et al*](/citations#tools).

![genesetenichment](../../images/geneset_enrichment.jpg)

## Sungear

![sungear](../../images/Sungear.png)

Sungear, orginally published by [Poultney *et al*](/citations#tools), is an interactive tool to display/visual overlaps between gene lists resulting from different queries, similar to a Venn diagram.  

Vertices on the outer polygon are anchor points, one for each TF-target analysis queried. Circular nodes represents non-overlapping gene sets that are in common between combinations of analyses. Each node has one or more arrows pointing to the vertices corresponding to the analyses which contains the genes. 

The *P*-values indicate whether a node contains greater or fewer genes than expected given the total number of targets regulated by each of the queried analyses.
