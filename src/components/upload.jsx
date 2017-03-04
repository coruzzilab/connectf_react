/**
 * @author zacharyjuang
 * 2/22/17
 */
import React from 'react';

export default class Upload extends React.Component {
  render() {
    let today = new Date().toISOString().slice(0, 10);

    return <div>
      <h1> Metadata Submission Form </h1>
      <form action='' method="post" encType="multipart/form-data">
        <font size="4"> <strong> &nbsp; Experiment ID: </strong> </font> <input type="text" name="exp_id"
                                                                                placeholder="e.g. AT4G24020_AS090116_RNASEQ (TFID_ExperimenterInitials&ExperimentDate_Type)"
                                                                                style={{
                                                                                  height: '25px',
                                                                                  width: '470px'
                                                                                }}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Transcription Factor ID: </strong> </font> <input type="text" name="tf_id"
                                                                                          placeholder="e.g. AT4G24020"
                                                                                          style={{
                                                                                            height: '25px',
                                                                                            width: '300px'
                                                                                          }}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Experiment: </strong> </font> <input type="text" name="exp"
                                                                             placeholder="e.g. Target/Inplanta etc."
                                                                             style={{height: '25px', width: '300px'}}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Experiment Type: </strong> </font>
        <select name="exp_type">
          <option placeholder="Expression">Expression</option>
          <option placeholder="Binding">Binding</option>
        </select> <br/> <br/>
        <font size="4"> <strong> &nbsp; Expression Type: </strong> </font>
        <select name="expr_type">
          <option placeholder="NA">NA</option>
          <option placeholder="RNAseq">RNAseq</option>
          <option placeholder="Microarray">Microarray</option>
          <option placeholder="4tU">4tU</option>
        </select> <br/> <br/>
        <font size="4"> <strong> &nbsp; Binding Type: </strong> </font>
        <select name="b_type">
          <option placeholder="NA">NA</option>
          <option placeholder="ChIPseq">ChIPseq</option>
          <option placeholder="DamID">DamID</option>
        </select> <br/> <br/>
        <font size="4"> <strong> &nbsp; Direction: </strong> </font> <input type="text" name="direc"
                                                                            placeholder="e.g. 1"
                                                                            style={{height: '25px', width: '300px'}}/>
        <br/>
        <br/>
        <font size="4"> <strong> &nbsp; Genotype: </strong> </font> <input type="text" name="geno"
                                                                           placeholder="e.g. nlp7-1 or Col-0"
                                                                           style={{height: '25px', width: '300px'}}/>
        <br/>
        <br/>
        <font size="4"> <strong> &nbsp; Data Source: </strong> </font> <input type="text" name="source"
                                                                              placeholder="e.g. CoruzziLab_unpublished_AS (AS=ExperimenterInitials)"
                                                                              style={{height: '25px', width: '350px'}}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Time (min): </strong></font> <input type="text" name="tyme"
                                                                            placeholder="e.g. 180"
                                                                            style={{height: '25px', width: '300px'}}/>
        <br/>
        <br/>
        <font size="4"> <strong> &nbsp; Growth Period (days): </strong> </font> <input type="text" name="g_period"
                                                                                       placeholder="e.g. 9"
                                                                                       style={{
                                                                                         height: '25px',
                                                                                         width: '300px'
                                                                                       }}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Growth Medium: </strong> </font> <input type="text" name="g_med"
                                                                                placeholder="e.g. plates,1mM_KNO3"
                                                                                style={{
                                                                                  height: '25px',
                                                                                  width: '300px'
                                                                                }}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Plasmids: </strong> </font> <input type="text" name="plasmids"
                                                                           placeholder="e.g. NLP7pBOB11"
                                                                           style={{height: '25px', width: '300px'}}/>
        <br/>
        <br/>
        <font size="4"> <strong> &nbsp; Control: </strong> </font>
        <select name="control">
          <option value="mDEX">mDEX</option>
          <option value="EmptyVector">Empty Vector</option>
        </select> <br/> <br/>
        <font size="4"> <strong> &nbsp; Treatments: </strong> </font> <input type="text" name="treat"
                                                                             placeholder="e.g. PN,MDEX,PDEX,PCHX"
                                                                             style={{height: '25px', width: '300px'}}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Replicates: </strong> </font> <input type="text" name="rep"
                                                                             placeholder="e.g. PN+PCHX(3),PN+PDEX+PCHX(3)"
                                                                             style={{height: '25px', width: '300px'}}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Batch: </strong> </font> <input type="text" name="batch"
                                                                        placeholder="List the exp ids for experiments done together (comma separated)"
                                                                        style={{height: '25px', width: '400px'}}/> <br/>
        <br/>
        <font size="4"> <strong> &nbsp; Analysis Method: </strong> </font> <input type="text" name="a_method"
                                                                                  placeholder="e.g. DESEQ2"
                                                                                  style={{
                                                                                    height: '25px',
                                                                                    width: '300px'
                                                                                  }}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Analysis Cutoff: </strong> </font> <input type="text" name="a_cutoff"
                                                                                  placeholder="e.g. FDR<0.1"
                                                                                  style={{
                                                                                    height: '25px',
                                                                                    width: '300px'
                                                                                  }}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Analysis Command: </strong> </font> <input type="text" name="a_cmd"
                                                                                   placeholder="e.g. aov(dataframe$y~dataframe$Nitrogen*dataframe$Genotype*dataframe$Tissue)"
                                                                                   style={{
                                                                                     height: '25px',
                                                                                     width: '550px'
                                                                                   }}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Analysis Notes: </strong> </font> <input type="text" name="a_notes"
                                                                                 placeholder="e.g. Add notes about the analysis (alignment method, annotation version, read count tool  etc.)"
                                                                                 style={{
                                                                                   height: '80px',
                                                                                   width: '500px'
                                                                                 }}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; TF History Notes: </strong> </font> <input type="text" name="tf_hist"
                                                                                   placeholder="e.g. Wang_2009_Plant_physiology,Castaings_2009_Plant_journal"
                                                                                   style={{
                                                                                     height: '80px',
                                                                                     width: '500px'
                                                                                   }}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Experimenter: </strong> </font>
        <select name="experimenter">
          <option value="Anna_Schinke">Anna Schinke</option>
          <option value="Matthew_Brooks">Matthew Brooks</option>
          <option value="Ying_Li">Ying Li</option>
          <option value="Joseph_Swift">Joseph Swift</option>
          <option value="Sophie_Leran">Sophie Leran</option>
          <option value="Joan_Doidy">Joan Doidy</option>
          <option value="Eleonore_Bouguyon">Eleonore Bouguyon</option>
          <option value="Chia-Yi_Cheng">Chia-Yi Cheng</option>
        </select> <br/> <br/>
        <font size="4"> <strong> &nbsp; Submission Date: </strong> </font> <input type="text" name="s_date"
                                                                                  placeholder={today}
                                                                                  style={{
                                                                                    height: '25px',
                                                                                    width: '300px'
                                                                                  }}/>
        <br/> <br/>
        <font size="4"> <strong> &nbsp; Experiment Date: </strong> </font> <input type="text" name="e_date"
                                                                                  placeholder="mm-dd-yyyy"
                                                                                  style={{
                                                                                    height: '25px',
                                                                                    width: '300px'
                                                                                  }}/>
        <br/> <br/> <br/>
        <font size="5"> <strong> &nbsp; Metadata Notes: </strong> </font> <input type="text" name="m_notes"
                                                                                 placeholder="e.g. Add notes for this data"
                                                                                 style={{
                                                                                   height: '80px',
                                                                                   width: '500px'
                                                                                 }}/>
        <br/> <br/> <br/>

        <font size="5"> <strong> &nbsp; Upload Gene List: </strong> </font> <input name="file_1" type="file"/> <br/>
        <br/> <br/>
        <font size="5"> <strong> &nbsp; Upload Raw Expression Values: </strong> </font> <input name="file_2"
                                                                                               type="file"/> <br/>
        <br/> <br/>
        <font size="5"> <strong> &nbsp; Upload Experimental Design File: </strong> </font> <input name="file_3"
                                                                                                  type="file"/> <br/>
        <br/> <br/>

        <button type="submit" className="btn btn-default">SUBMIT</button>

      </form>
    </div>;
  }
}
