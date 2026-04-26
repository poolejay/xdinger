type SparklineProps = {
  values: number[];
};

function getBarStyle(value: number) {
  if (value > 0.6) {
    return { backgroundColor: "rgba(34,197,94,0.75)" };
  }
  if (value >= 0.3) {
    return { backgroundColor: "rgba(234,179,8,0.65)" };
  }
  return { backgroundColor: "rgba(239,68,68,0.55)" };
}

export function Sparkline({ values }: SparklineProps) {
  return (
    <div className="flex h-5 items-end gap-[3px]">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="inline-block w-[6px] rounded-[2px]"
          style={{
            ...getBarStyle(value),
            height: `${Math.max(4, value * 20)}px`,
          }}
        />
      ))}
    </div>
  );
}
