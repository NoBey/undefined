import { data } from "./data";
import React, { useEffect, useState} from "react";
import { PageHeader } from "antd";

window.data = data;

let artboards = [

]
let left = 100
let top = 100
data.artboards.forEach((b, i) => {

    b.left = left
    b.top = top

    left += 40
    left += b.width

    artboards.push(b)

})
function FreeBoard() {
  let [scale, setScale] = useState(1)
  let [posX, setPosX] = useState(0)
  let [posY, setPosY] = useState(0)

  useEffect(()=>{
    window.addEventListener('mousewheel', (e) => {
      e.preventDefault();
      e.stopPropagation()
    })
    window.addEventListener("wheel", (e) => {
      e.preventDefault();
      e.stopPropagation()
      if (e.ctrlKey) {
        setScale(scale => scale - e.deltaY * 0.01)
      } else {
        setPosX(posX => posX - e.deltaX * 2)
        setPosY(posY => posY - e.deltaY * 2)
      }
  
    });
  }, [])

  return (
    <div className="free-board" style={{ transform: `translate3D(${posX}px, ${posY}px, 0px) scale(${scale})` }}>
         {artboards.map((d, i) => (
              <div className="board-wrap" style={{ top: d.top, left: d.left, width: d.width  }}>
                  <img src={'/'+d.imagePath} />
              </div>
          ))}
    </div>
  );
}

function BoardPage() {
  return (
    <>
      <PageHeader
        className="page-header"
        onBack={() => null}
        title="画板"
        subTitle="画板画板画板"
      />
      <div className="wrap">
        <div className="tree">
          {data.artboards.map((d) => (
            <div className="tree-item">{d.name}</div>
          ))}
        </div>

        <FreeBoard />
      </div>
    </>
  );
}

export default BoardPage;
