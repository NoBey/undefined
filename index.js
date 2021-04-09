
import ReactDOM from "react-dom";
import React from "react";
import 'antd/dist/antd.css'; 

import Board from './Board'



function App(){
  return <>
   <Board/>
  </>
}



const app = document.createElement('div')
document.querySelector('body').appendChild(app)

ReactDOM.render(<App />, app);