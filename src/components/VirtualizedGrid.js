// src/components/VirtualizedGrid.js
import React, { useState, useEffect, useMemo } from 'react';

/*
  Props
  ─────────────────────────────────────────────
  items        : array             – data list
  columnWidth  : number (px)       – card width
  rowHeight    : number (px)       – card height
  overscan     : number            – extra rows (default 2)
  maxColumns   : number            – hard cap (default 3)
  renderItem   : fn(item)          – render function
*/
const VirtualizedGrid = ({
  items,
  columnWidth = 320,
  rowHeight   = 540,
  overscan    = 2,
  maxColumns  = 3,
  renderItem,
}) => {
  // ── viewport state ─────────────────────────
  const [scrollY, setScrollY] = useState(window.pageYOffset);
  const [winH,    setWinH   ] = useState(window.innerHeight);
  const [winW,    setWinW   ] = useState(window.innerWidth);

  useEffect(() => {
    const onScroll = () => setScrollY(window.pageYOffset);
    const onResize = () => {
      setWinH(window.innerHeight);
      setWinW(window.innerWidth);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // ── grid maths ─────────────────────────────
  const { columns, totalRows } = useMemo(() => {
    const usable = Math.max(winW - 64, columnWidth);        // some page padding
    const raw    = Math.floor(usable / columnWidth);
    const cols   = Math.min(Math.max(1, raw), maxColumns);  // 1 … maxColumns
    return { columns: cols, totalRows: Math.ceil(items.length / cols) };
  }, [winW, items.length, columnWidth, maxColumns]);

  // visible slice
  const firstRow = Math.max(0, Math.floor(scrollY / rowHeight) - overscan);
  const lastRow  = Math.min(totalRows,
                     Math.ceil((scrollY + winH) / rowHeight) + overscan);

  const visible = useMemo(() => {
    const arr = [];
    for (let r = firstRow; r < lastRow; r++) {
      for (let c = 0; c < columns; c++) {
        const i = r * columns + c;
        if (i < items.length) arr.push(items[i]);
      }
    }
    return arr;
  }, [firstRow, lastRow, columns, items]);

  const padTop    = firstRow * rowHeight;
  const padBottom = (totalRows - lastRow) * rowHeight;

  // ── render ────────────────────────────────
  return (
    <div className="virtual-grid" style={{ width: '100%', position: 'relative' }}>
      {padTop > 0 && <div style={{ height: padTop }} />}

      <div
        className="virtual-grid-inner"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, ${columnWidth}px)`,
          gap: '2rem',
          justifyContent: 'center',
        }}
      >
        {visible.map(renderItem)}
      </div>

      {padBottom > 0 && <div style={{ height: padBottom }} />}
    </div>
  );
};

export default VirtualizedGrid;
