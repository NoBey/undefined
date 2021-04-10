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

  const [selectLayer, setSelectLayer] = useState(null);
  const [moveLayer, setMoveLayer] = useState(null);
  const [distances, setDistances] = useState({
    top: null,
    right: null,
    bottom: null,
    left: null,
  });
  useEffect(() => {
    const distances = calcDistance(selectLayer, moveLayer, zoom);
    if (distances) setDistances(distances);
  }, [moveLayer, zoom]);

  const boxmousemove = (e) => {
    if (e.target.className === "detail-layer") {
      if (selectLayer) {
        if (!moveLayer) {
          const info = layers.find(
            ({ objectID }) => objectID === e.target.dataset.id
          );
          setMoveLayer(info);
          return;
        }

        if (moveLayer && moveLayer.objectID !== e.target.dataset.id) {
          const info = layers.find(
            ({ objectID }) => objectID === e.target.dataset.id
          );
          setMoveLayer(info);
        }
      }
    }
  };
  console.log({ moveLayer, distances });
  return (
    <>
      <div className={"detail-warp"} ref={wrapRef}>
        <div
          className={"detail-box-wrap"}
          onMouseMove={boxmousemove}
          style={boxStyle}
        >
          {/* 选择的 layer */}
          {selectLayer && (
            <div
              className={"detail-layer-selected"}
              style={{
                width: selectLayer.rect.width * zoom,
                height: selectLayer.rect.height * zoom,
                top: selectLayer.rect.y * zoom,
                left: selectLayer.rect.x * zoom,
              }}
            >
              <div className="layer-rect-width-value">
                {selectLayer.rect.width}px
              </div>
              <div className="layer-rect-height-value">
                {selectLayer.rect.height}px
              </div>
            </div>
          )}

          {layers.map(({ rect, ...layer }) => (
            <div
              data-id={layer.objectID}
              key={layer.objectID}
              style={{
                width: rect.width * zoom,
                height: rect.height * zoom,
                top: rect.y * zoom,
                left: rect.x * zoom,
              }}
              className={`detail-layer`}
              onClick={() => setSelectLayer({ ...layer, rect })}
            />
          ))}

          <img draggable="false" src={"/" + info.imagePath} />

          {/* 测距  */}
          {distances.top && (
            <div
              style={distances.top}
              className={"top-distance distance distance-vertical"}
            >
              <span>{distances.top.height * zoom}px</span>
            </div>
          )}
          {distances.right && (
            <div
              style={distances.right}
              className={"right-distance distance distance-horizontal"}
            >
              <span>{distances.right.width * zoom}px</span>
            </div>
          )}
          {distances.bottom && (
            <div
              style={distances.bottom}
              className={"bottom-distance distance distance-vertical"}
            >
              <span>{distances.bottom.height * zoom}px</span>
            </div>
          )}
          {distances.left && (
            <div
              style={distances.left}
              className={"left-distance distance distance-horizontal"}
            >
              <span>{distances.left.width * zoom}px</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Detail;

function calcDistance(selectLayer, targetLayer, zoom) {
  if (!selectLayer || !targetLayer) return;
  if (selectLayer.objectID === targetLayer.objectID) return;
  const zoomSize = (v) => v * zoom;

  let selectedRect = selectLayer.rect;
  let targetRect = targetLayer.rect;
  let topData, rightData, bottomData, leftData;
  let x = zoomSize(selectedRect.x + selectedRect.width / 2);
  let y = zoomSize(selectedRect.y + selectedRect.height / 2);

  let selectedX2 = selectedRect.x + selectedRect.width;
  let selectedY2 = selectedRect.y + selectedRect.height;
  let targetX2 = targetRect.x + targetRect.width;
  let targetY2 = targetRect.y + targetRect.height;

  if (!getIntersection(selectedRect, targetRect)) {
    if (selectedRect.y > targetY2) {
      //top
      topData = {
        left: x,
        top: zoomSize(targetY2),
        height: zoomSize(selectedRect.y - targetY2),
      };
    }
    if (selectedX2 < targetRect.x) {
      //right
      rightData = {
        left: zoomSize(selectedX2),
        top: y,
        width: zoomSize(targetRect.x - selectedX2),
      };
    }
    if (selectedY2 < targetRect.y) {
      //bottom
      bottomData = {
        left: x,
        top: zoomSize(selectedY2),
        height: zoomSize(targetRect.y - selectedY2),
      };
    }
    if (selectedRect.x > targetX2) {
      //left
      leftData = {
        left: zoomSize(targetX2),
        top: y,
        width: zoomSize(selectedRect.x - targetX2),
      };
    }
  } else {
    var distance = getDistance(selectedRect, targetRect);
    if (distance.top != 0) {
      //top
      topData = {
        left: x,
        top:
          distance.top > 0 ? zoomSize(targetRect.y) : zoomSize(selectedRect.y),
        height: zoomSize(Math.abs(distance.top)),
      };
    }
    if (distance.right != 0) {
      //right
      rightData = {
        left: distance.right > 0 ? zoomSize(selectedX2) : zoomSize(targetX2),
        top: y,
        width: zoomSize(Math.abs(distance.right)),
      };
    }
    if (distance.bottom != 0) {
      //bottom
      bottomData = {
        left: x,
        top: distance.bottom > 0 ? zoomSize(selectedY2) : zoomSize(targetY2),
        height: zoomSize(Math.abs(distance.bottom)),
      };
    }
    if (distance.left != 0) {
      //left
      leftData = {
        left:
          distance.left > 0 ? zoomSize(targetRect.x) : zoomSize(selectedRect.x),
        top: y,
        width: zoomSize(Math.abs(distance.left)),
      };
    }
  }
  return {
    top: topData,
    right: rightData,
    bottom: bottomData,
    left: leftData,
  };
}

function getDistance(selected, target) {
  return {
    top: selected.y - target.y,
    right: target.x + target.width - selected.x - selected.width,
    bottom: target.y + target.height - selected.y - selected.height,
    left: selected.x - target.x,
  };
}

export function getIntersection(a, b) {
  let x1 = Math.max(a.x, b.x);
  let y1 = Math.max(a.y, b.y);
  let x2 = Math.min(a.x + a.width, b.x + b.width);
  let y2 = Math.min(a.y + a.height, b.y + b.height);
  let width = x2 - x1;
  let height = y2 - y1;
  if (width <= 0 || height <= 0) {
    // no intersection
    return undefined;
  }
  return {
    x: x1,
    y: y1,
    width: width,
    height: height,
  };
}
