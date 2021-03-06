import React, { useEffect, useRef, useState } from "react";

import { useRouteMatch } from "react-router-dom";
import { Drawer } from "antd";
import { data } from "./data"; 

import "./detail.css";




function InspectorItem({ title, values = [] }) {
  return (
    <div class="item">
      <div className="item-title">{title}</div>
      {values.map((value) => (
        <div className="item-value">{value}</div>
      ))}
    </div>
  );
}

function InspectorProperties({ layer }) {
  let items = [];
  // if()
  return (
    <section className={"inspector"}>
      <InspectorItem
        title={"位置"}
        values={[parseInt(layer.rect.x) + "px", parseInt(layer.rect.y) + "px"]}
      />
      <InspectorItem
        title={"大小"}
        values={[
          parseInt(layer.rect.width) + "px",
          parseInt(layer.rect.height) + "px",
        ]}
      />
      {typeof layer.opacity == "number" && (
        <InspectorItem
          title={"不透明度"}
          values={[+Math.round(layer.opacity * 10000) / 100 + "%"]}
        />
      )}
      {layer.radius && <InspectorItem
          title={"圆角"}
          values={[parseInt(layer.radius[0])+'px']}
        />}

    </section>
  );
}

function Inspector({ layer }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(!!layer);
  }, [layer]);

  const onClose = () => setShow(!show);
  return (
    <Drawer
      title={layer && layer.name}
      placement={"right"}
      closable={true}
      onClose={onClose}
      visible={show}
      mask={false}
      width={300}
    >
      {layer && (
        <>
          <InspectorProperties layer={layer} />
        </>
      )}
    </Drawer>
  );
}

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
      console.log(e)
      e.preventDefault();
      if (e.ctrlKey) {
        setZoom((zoom) => {
          let s = zoom - e.deltaY * 0.005;
          if (s < 0.1) s = 0.1;
          if (s > 3) s = 3;
          return s;
        });

      } else {
        setBoxStyle(({ top, left, ...s }) => ({
          ...s,
          top: top - (e.deltaY / zoom),
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

  const boxmouseout = () => {
    setMoveLayer(null);
    setDistances({
      top: null,
      right: null,
      bottom: null,
      left: null,
    });
  };


  return (
    <>
      <div className={"detail-warp"} ref={wrapRef}>
        <div
          className={"detail-box-wrap"}
          onMouseMove={boxmousemove}
          onMouseOut={boxmouseout}
          style={{
            ...boxStyle,
            left:  boxStyle.left * zoom,
            top:  boxStyle.top * zoom
          }}
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
                {parseInt(selectLayer.rect.width)}px
              </div>
              <div className="layer-rect-height-value">
                {parseInt(selectLayer.rect.height)}px
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

          <img draggable="false" src={publicPath + info.imagePath} />

          {/* 测距  */}
          {distances.top && (
            <div
              style={distances.top}
              className={"top-distance distance distance-vertical"}
            >
              <span>{parseInt(distances.top.height / zoom)}px</span>
            </div>
          )}
          {distances.right && (
            <div
              style={distances.right}
              className={"right-distance distance distance-horizontal"}
            >
              <span>{parseInt(distances.right.width / zoom)}px</span>
            </div>
          )}
          {distances.bottom && (
            <div
              style={distances.bottom}
              className={"bottom-distance distance distance-vertical"}
            >
              <span>{parseInt(distances.bottom.height / zoom)}px</span>
            </div>
          )}
          {distances.left && (
            <div
              style={distances.left}
              className={"left-distance distance distance-horizontal"}
            >
              <span>{parseInt(distances.left.width / zoom)}px</span>
            </div>
          )}

          {/* 标尺线 */}

          {moveLayer && moveLayer.rect && (
            <>
              <div
                className="top ruler ruler-horizontal"
                style={{ top: moveLayer.rect.y * zoom }}
              ></div>
              <div
                className="left ruler ruler-vertical"
                style={{ left: moveLayer.rect.x * zoom }}
              ></div>
              <div
                className="right ruler ruler-vertical"
                style={{
                  left: (moveLayer.rect.x + moveLayer.rect.width) * zoom,
                }}
              ></div>
              <div
                className="bottom ruler ruler-horizontal"
                style={{
                  top: (moveLayer.rect.y + moveLayer.rect.height) * zoom,
                }}
              ></div>
            </>
          )}
        </div>
        <Inspector layer={selectLayer} />
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
