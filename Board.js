import { data } from "./data";
import React, { useEffect, useRef, useState } from "react";
import { PageHeader } from "antd";
import { useHistory } from "react-router-dom";

window.data = data;

let artboards = [];
let left = 100;
let top = 100;
data.artboards.forEach((b, i) => {
  b.left = left;
  b.top = top;

  left += 40;
  left += b.width;

  artboards.push(b);
});
function FreeBoard(props) {
  let history = useHistory();
  const { activeBoardId, setActiveBoardId } = props;
  let [scale, setScale] = useState(1);
  let [posX, setPosX] = useState(0);
  let [posY, setPosY] = useState(0);
  let ref = useRef(0);

  useEffect(() => {
    ref.current.addEventListener("wheel", (e) => {
      console.log(" wheel");
      e.preventDefault();
      if (e.ctrlKey) {
        setScale((scale) => {
          let s = scale - e.deltaY * 0.005;
          if (s < 0.1) return 0.1;
          if (s > 3) return 3;
          //  setPosX(posX => (posX - e.deltaX) )
          //  setPosY(posY => (posY - e.deltaY) )
          return s;
        });
      } else {
        setPosX((posX) => posX - e.deltaX);
        setPosY((posY) => posY - e.deltaY);
      }
    });

    ref.current.addEventListener("mousedown", (e) => {
      function move(e) {
        setPosX((posX) => posX + e.movementX);
        setPosY((posY) => posY + e.movementY);
      }
      function up() {
        ref.current.removeEventListener("mousemove", move);
        ref.current.removeEventListener("mouseup", up);
      }
      ref.current.addEventListener("mousemove", move);
      ref.current.addEventListener("mouseup", up);
    });
  }, []);

  return (
    <div className="free-board" ref={ref}>
      <div
        style={{
          position: "relative",
          transform: `translate3D(${posX}px, ${posY}px, 0px) scale(${scale})`,
        }}
      >
        {artboards.map((d, i) => (
          <div
            key={i}
            className={`board-wrap${
              activeBoardId === d.objectID ? "-active" : ""
            }`}
            style={{ top: d.top, left: d.left, width: d.width }}
            onClick={() => {
              setActiveBoardId(d.objectID);
              // setPosX(d.top)
              // setPosY(d.left)
              // setScale(1)
            }}
          
            onDoubleClick={() => {
              history.push( "/detail/" + d.objectID);
            }}
          >
            <img draggable="false" src={publicPath + d.imagePath} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardPage(props) {
  let history = useHistory();
  console.log(props);
  const [activeBoardId, setActiveBoardId] = useState(
    data.artboards[0].objectID
  );

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
            <div
              key={d.objectID}
              onClick={() => {
                setActiveBoardId(d.objectID);
              }}
              onDoubleClick={() => {
                history.push("/detail/" + d.objectID);
              }}
              className={`tree-item${
                activeBoardId === d.objectID ? "-active" : ""
              }`}
            >
              {d.name}
            </div>
          ))}
        </div>

        <FreeBoard
          activeBoardId={activeBoardId}
          setActiveBoardId={setActiveBoardId}
        />
      </div>
    </>
  );
}

export default BoardPage;
