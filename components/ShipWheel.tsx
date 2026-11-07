// 키(배 운전대) 무늬. 색은 글자색(currentColor)을 따라가서 className의 text-* 와 opacity로 조절한다.
export default function ShipWheel({ className }: { className?: string }) {
  // 바퀴살 8개: 가운데에서 바퀴 밖까지 뻗고, 끝에 손잡이 동그라미
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return { x1: Math.cos(a) * 5, y1: Math.sin(a) * 5, x2: Math.cos(a) * 44, y2: Math.sin(a) * 44 };
  });
  return (
    <svg viewBox="-50 -50 100 100" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeLinecap="round" fill="none">
        <circle r="30" strokeWidth="2.2" />
        <circle r="25" strokeWidth="0.8" />
        {spokes.map((s, i) => (
          <line key={i} {...s} strokeWidth="1.8" />
        ))}
      </g>
      <g fill="currentColor">
        <circle r="5" />
        {spokes.map((s, i) => (
          <circle key={i} cx={s.x2} cy={s.y2} r="2.8" />
        ))}
      </g>
    </svg>
  );
}
