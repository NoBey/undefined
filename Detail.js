import React, { useEffect, useRef, useState } from "react";

import { useRouteMatch } from "react-router-dom";

import { data } from "./data";

import "./detail.css";


function Detail(props) {
  let { params } = useRouteMatch("/detail/:id");
  const info = data.artboards.find(({ objectID }) => objectID === params.id);
  const { layers } = info;
  const [zoom, setZoom] = useState(1);
  const [boxStyle, setBoxStyle] = useState({
    top: 160,
    left: 250,
    width: info.width,
    height: info.height,
  });
  const wrapRef = useRef();
  useEffect(() => {
    const width = zoom * info.width;
    const height = zoom * info.height;
    setBoxStyle({ ...boxStyle, width, height });
  }, [zoom]);
  useEffect(() => {
    wrapRef.current.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (e.ctrlKey) {
        setZoom((zoom) => {
          let s = zoom - e.deltaY * 0.005;
          if (s < 0.1) return 0.1;
          if (s > 3) return 3;
          return s;
        });
      } else {
        setBoxStyle(({ top, left, ...s }) => ({
          ...s,
          top: top - e.deltaY,
          left: left - e.deltaX,
        }));
      }
    });
    // setWrapStyle({  })
    // info.width
    // info.height
    // window.innerHeight
    // window.innerWidth
  }, []);

  const [selectLayer, setSelectLayer] = useState(null)


  return (
    <>
      <div className={"detail-warp"} ref={wrapRef}>
        <div className={"detail-box-wrap"} style={boxStyle}>

          {layers.map(({ rect, ...layer }) => (
            <div
              key={layer.objectID}
              style={{ width: rect.width * zoom, height: rect.height * zoom, top: rect.y * zoom, left: rect.x * zoom}}
              className={`detail-layer${selectLayer && selectLayer.objectID === layer.objectID ? '-selected' : ''}`}
              onClick={() => setSelectLayer(layer)}
            ></div>
          ))}

          <img draggable="false" src={"/" + info.imagePath}></img>
        </div>
      </div>
    </>
  );
}

export default Detail;
