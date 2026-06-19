"use client";
import React from "react";
import Link from "next/link";

const DIGITS = [
  { d: "1", code: ".----", parent: "J",    parentCode: ".---",  isNew: false, endDash: true  },
  { d: "2", code: "..---", parent: "..--", parentCode: "..--",  isNew: true,  endDash: true  },
  { d: "3", code: "...--", parent: "V",    parentCode: "...-",  isNew: false, endDash: true  },
  { d: "4", code: "....-", parent: "H",    parentCode: "....",  isNew: false, endDash: true  },
  { d: "5", code: ".....", parent: "H",    parentCode: "....",  isNew: false, endDash: false },
  { d: "6", code: "-....", parent: "B",    parentCode: "-...",  isNew: false, endDash: false },
  { d: "7", code: "--...", parent: "Z",    parentCode: "--..",  isNew: false, endDash: false },
  { d: "8", code: "---..","parent": "---.",parentCode: "---.",  isNew: true,  endDash: false },
  { d: "9", code: "----.", parent: "----", parentCode: "----",  isNew: true,  endDash: false },
  { d: "0", code: "-----", parent: "----", parentCode: "----",  isNew: true,  endDash: true  },
];

const NEW_NODES = [
  { path: "..--", parentLetter: "U", parentCode: "..-",  note: "con dấu gạch của U" },
  { path: "---.", parentLetter: "O", parentCode: "---",  note: "con chấm của O" },
  { path: "----", parentLetter: "O", parentCode: "---",  note: "con dấu gạch của O" },
];

// SVG layout constants
const SVG_W = 750;
const SVG_H = 280;
const PY = 90;   // parent nodes y
const DY = 210;  // digit nodes y
const NR = 14;   // circle radius
const RW = 34; const RH = 20; const RRX = 4; // rect dims

// Parent nodes (depth 4 existing or new)
const parents = [
  { label: "J",    code: ".---", x: 50,  isDash: true,  isNew: false },
  { label: "..--", code: "..--", x: 140, isDash: true,  isNew: true  },
  { label: "V",    code: "...-", x: 230, isDash: true,  isNew: false },
  { label: "H",    code: "....", x: 325, isDash: false, isNew: false },
  { label: "B",    code: "-...", x: 420, isDash: false, isNew: false },
  { label: "Z",    code: "--..", x: 510, isDash: false, isNew: false },
  { label: "---.", code: "---.", x: 600, isDash: false, isNew: true  },
  { label: "----", code: "----", x: 690, isDash: true,  isNew: true  },
];

// Digit leaf nodes (depth 5)
const digitNodes = [
  { d: "1", code: ".----", x: 50,  parentX: 50,  isDash: true  },
  { d: "2", code: "..---", x: 140, parentX: 140, isDash: true  },
  { d: "3", code: "...--", x: 230, parentX: 230, isDash: true  },
  { d: "4", code: "....-", x: 288, parentX: 325, isDash: true  },
  { d: "5", code: ".....", x: 362, parentX: 325, isDash: false },
  { d: "6", code: "-....", x: 420, parentX: 420, isDash: false },
  { d: "7", code: "--...", x: 510, parentX: 510, isDash: false },
  { d: "8", code: "---..","x": 600, parentX: 600, isDash: false },
  { d: "9", code: "----.", x: 654, parentX: 690, isDash: false },
  { d: "0", code: "-----", x: 726, parentX: 690, isDash: true  },
];

function ParentNode({ label, x, isDash, isNew }: { label: string; x: number; isDash: boolean; isNew: boolean }) {
  const fill   = isNew ? "#1a1200" : "#0f172a";
  const stroke = isNew ? "#fbbf24" : "#94a3b8";
  const sw     = isNew ? 2.5 : 1.5;
  const text   = isNew ? "#fbbf24" : "#e2e8f0";
  const fs = label.length > 2 ? 7 : 11;
  return (
    <g>
      {isDash ? (
        <rect x={x - RW / 2} y={PY - RH / 2} width={RW} height={RH} rx={RRX}
          fill={fill} stroke={stroke} strokeWidth={sw} />
      ) : (
        <circle cx={x} cy={PY} r={NR} fill={fill} stroke={stroke} strokeWidth={sw} />
      )}
      <text x={x} y={PY + fs * 0.38} textAnchor="middle" fontSize={fs} fontWeight="bold"
        fill={text} style={{ pointerEvents: "none" }}>{label}</text>
    </g>
  );
}

function DigitNode({ d, x, isDash }: { d: string; x: number; isDash: boolean }) {
  const fill   = isDash ? "#1a0050" : "#00101a";
  const stroke = isDash ? "#a855f7" : "#22d3ee";
  return (
    <g>
      {isDash ? (
        <rect x={x - RW / 2} y={DY - RH / 2} width={RW} height={RH} rx={RRX}
          fill={fill} stroke={stroke} strokeWidth={2} />
      ) : (
        <circle cx={x} cy={DY} r={NR} fill={fill} stroke={stroke} strokeWidth={2} />
      )}
      <text x={x} y={DY + 11 * 0.38} textAnchor="middle" fontSize={11} fontWeight="bold"
        fill="#f1f5f9" style={{ pointerEvents: "none" }}>{d}</text>
    </g>
  );
}

function morseSymbols(code: string) {
  return code.split("").map((c, i) => (
    <span key={i} className={c === "-" ? "text-orange-400" : "text-blue-400"}>{c}</span>
  ));
}

export default function NumbersProposal() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center py-6 px-4">
      <h1 className="text-xl font-bold tracking-widest text-yellow-400 mb-1">
        ĐỀ XUẤT — Thêm chữ số 0–9
      </h1>
      <p className="text-xs text-gray-500 mb-5 text-center max-w-sm">
        Mã Morse cho chữ số dùng 5 ký hiệu (độ sâu 5). Cần thêm 3 node trung gian mới ở độ sâu 4.
      </p>

      {/* SVG diagram */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-800 bg-gray-950 mb-6" style={{ maxWidth: 780 }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width: SVG_W, height: SVG_H, display: "block", fontFamily: "monospace", minWidth: SVG_W }}
        >
          {/* Edges parent → digit */}
          {digitNodes.map(dn => (
            <line key={`e${dn.d}`}
              x1={dn.parentX} y1={PY + (dn.parentX === 325 || dn.parentX === 690 ? NR : RH / 2)}
              x2={dn.x}       y2={DY - (dn.isDash ? RH / 2 : NR)}
              stroke={dn.isDash ? "#a855f7" : "#22d3ee"} strokeWidth={1.5} opacity={0.6}
            />
          ))}

          {/* Parent nodes */}
          {parents.map(p => (
            <ParentNode key={p.code} label={p.label} x={p.x} isDash={p.isDash} isNew={p.isNew} />
          ))}

          {/* Digit nodes */}
          {digitNodes.map(dn => (
            <DigitNode key={dn.d} d={dn.d} x={dn.x} isDash={dn.isDash} />
          ))}

          {/* Legend */}
          <rect x={10} y={SVG_H - 40} width={12} height={8} rx={1} fill="#1a0050" stroke="#a855f7" strokeWidth={1.5} />
          <text x={27} y={SVG_H - 33} fontSize={9} fill="#a855f7">chữ số kết bằng − (hình chữ nhật)</text>
          <circle cx={16} cy={SVG_H - 18} r={5} fill="#00101a" stroke="#22d3ee" strokeWidth={1.5} />
          <text x={27} y={SVG_H - 14} fontSize={9} fill="#22d3ee">chữ số kết bằng · (hình tròn)</text>
          <rect x={260} y={SVG_H - 40} width={12} height={8} rx={1} fill="#1a1200" stroke="#fbbf24" strokeWidth={1.5} />
          <text x={277} y={SVG_H - 33} fontSize={9} fill="#fbbf24">★ node mới (chưa có trong cây)</text>
        </svg>
      </div>

      {/* New intermediate nodes */}
      <div className="w-full mb-5" style={{ maxWidth: 480 }}>
        <h2 className="text-xs font-bold text-yellow-400 mb-2 tracking-widest">NODE TRUNG GIAN CẦN THÊM (độ sâu 4)</h2>
        <div className="flex flex-col gap-2">
          {NEW_NODES.map(n => (
            <div key={n.path} className="flex items-center gap-3 bg-gray-900 border border-yellow-900 rounded-lg px-3 py-2">
              <code className="text-yellow-400 font-mono font-bold w-10">{n.path}</code>
              <span className="text-gray-400 text-sm">← {n.note}</span>
              <span className="ml-auto text-xs text-gray-600">parent: {n.parentLetter} ({n.parentCode})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Digit table */}
      <div className="w-full mb-6" style={{ maxWidth: 480 }}>
        <h2 className="text-xs font-bold text-gray-400 mb-2 tracking-widest">BẢNG MÃ MORSE CÁC CHỮ SỐ</h2>
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="bg-gray-900 text-gray-500 text-xs">
                <th className="px-3 py-2 text-left">Số</th>
                <th className="px-3 py-2 text-left">Mã Morse</th>
                <th className="px-3 py-2 text-left">Node cha</th>
                <th className="px-3 py-2 text-center">Hình</th>
              </tr>
            </thead>
            <tbody>
              {DIGITS.map((row, i) => (
                <tr key={row.d} className={i % 2 === 0 ? "bg-gray-950" : "bg-gray-900"}>
                  <td className="px-3 py-2 font-bold text-white text-base">{row.d}</td>
                  <td className="px-3 py-2 tracking-widest">{morseSymbols(row.code)}</td>
                  <td className="px-3 py-2">
                    <span className={row.isNew ? "text-yellow-400" : "text-gray-400"}>
                      {row.parent}{row.isNew && " ★"}
                    </span>
                    <span className="text-gray-600 text-xs ml-1">({row.parentCode})</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {row.endDash
                      ? <span className="text-orange-400 text-xs">■ rect</span>
                      : <span className="text-blue-400 text-xs">● circle</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link href="/morse"
        className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-2 transition-colors">
        ← Quay lại Morse
      </Link>
    </div>
  );
}
