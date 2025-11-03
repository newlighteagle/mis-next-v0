import ScoreCard from "@/components/cards/score_card/ScoreCard";

export default function Main() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
      <ScoreCard type="ics" value={12} />
      <ScoreCard type="farmers" value={240} />
      <ScoreCard type="trained" value={190} />
      <ScoreCard type="certified" value={75} />
    </div>
  );
}
