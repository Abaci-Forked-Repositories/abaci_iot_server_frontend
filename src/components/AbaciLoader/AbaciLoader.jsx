import React from 'react'
import './AbaciLoader.css';

const AbaciLoader = () => {
  return (
    <div>
      <div className="box">
  <div className="bead-container">
    <div className="rod" >
      <div className="bead" style={{backgroundColor:'#AD2175'}} />
      <div className="bead"style={{backgroundColor:'#C33737'}} />
      <div className="bead"style={{backgroundColor:'#CF2227'}} />
      <div className="bead"style={{backgroundColor:'#D55C28'}} />
    </div>
    <div className="rod" id="rod-one">
    <div className="bead"style={{backgroundColor:'#F57E21'}} />
      <div className="bead"style={{backgroundColor:'#F9A43F'}} />
      <div className="bead"style={{backgroundColor:'#FCAF17'}} />
      <div className="bead"style={{backgroundColor:'#FCC847'}} />
    </div>
    <div className="rod" id="rod-two">
    <div className="bead"style={{backgroundColor:'#EFDD12'}} />
      <div className="bead"style={{backgroundColor:'#9FCC3A'}} />
      <div className="bead"style={{backgroundColor:'#8BC43F'}} />
      <div className="bead"style={{backgroundColor:'#60A058'}} />
    </div>
    <div className="rod" id="rod-three">
    <div className="bead"style={{backgroundColor:'#219947'}} />
      <div className="bead"style={{backgroundColor:'#1AA484'}} />
      <div className="bead"style={{backgroundColor:'#0FA8D3'}} />
      <div className="bead"style={{backgroundColor:'#2195D3'}} />
    </div>
    <div className="rod" id="rod-four">
    <div className="bead"style={{backgroundColor:'#177BC0'}} />
      <div className="bead"style={{backgroundColor:'#1157A7'}} />
      <div className="bead"style={{backgroundColor:'#48286F'}} />
      <div className="bead"style={{backgroundColor:'#882676'}} />
    </div>
  </div>
  {/* <div className="column"></div> */}
</div>
</div>
  )
}
export default AbaciLoader