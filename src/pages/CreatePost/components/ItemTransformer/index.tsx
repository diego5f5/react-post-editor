/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useEffect, useRef } from 'react';
import Konva from 'konva';
import { Image, Text, Transformer } from 'react-konva';
import handleTextInteraction from './handleTextInteraction';

import { defaultAnchors } from './constants';

import { ItemTransformerPropsTypes } from './models';

const ItemTransformer = ({
  itemProps,
  setIsTyping,
  isSelected,
  onSelect,
  onChange,
  stageRef,
  stageScale,
}: ItemTransformerPropsTypes) => {
  const imageRef = useRef<Konva.Image | null>(null);
  const textRef = useRef<Konva.Text | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current) {
      const transformerNode = transformerRef.current;
      transformerNode.nodes([handleCurrentItemNode().node]);

      const transformerLayer = transformerNode.getLayer();
      transformerLayer.batchDraw();
    }
  }, [isSelected]);

  const handleTransformText = () => {
    const { node } = handleCurrentItemNode();
    const scaleX = node.scaleX();

    node.scaleX(1);
    onChange(
      {
        ...itemProps,
        x: node.x(),
        y: node.y(),
        width: node.width() * scaleX,
        rotation: node.rotation(),
      },
      true
    );
  };

  const handleTransformEnd = () => {
    const { node, type } = handleCurrentItemNode();

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);

    if (node && type === 'image') {
      node.scaleY(1);

      onChange({
        ...itemProps,
        x: node.x(),
        y: node.y(),
        width: Math.max(10, node.width() * scaleX),
        height: Math.max(node.height() * scaleY),
        rotation: node.rotation(),
      });

      return;
    }

    if (node && type === 'text') {
      onChange({
        ...itemProps,
        x: node.x(),
        y: node.y(),
        width: node.width() * scaleX,
        rotation: node.rotation(),
      });

      return;
    }
  };

  const handleDragEnd = (e) => {
    onChange({
      ...itemProps,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleCurrentItemNode = (): Konva.Node | null => {
    if (imageRef && imageRef.current) {
      return { node: imageRef.current, type: 'image' };
    }

    if (textRef && textRef.current) {
      return { node: textRef.current, type: 'text' };
    }

    return null;
  };

  return (
    <>
      {itemProps.itemType === 'image' ? (
        <Image
          {...itemProps}
          ref={imageRef}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        />
      ) : itemProps.itemType === 'text' ? (
        <Text
          {...itemProps}
          ref={textRef}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDblClick={() => {
            handleTextInteraction(
              textRef,
              transformerRef,
              stageRef,
              itemProps,
              onChange,
              setIsTyping,
              stageScale
            );
          }}
          onDragEnd={handleDragEnd}
          onTransform={handleTransformText}
          onTransformEnd={handleTransformEnd}
        />
      ) : null}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          enabledAnchors={defaultAnchors[itemProps.itemType] || []}
          rotationSnaps={[0, 90, 180, 270]}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default ItemTransformer;
