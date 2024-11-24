import BalanceCard from "../components/BalanceCard";
import MinterActionsCard from "~~/components/MinterActions";

export default function Page() {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">Token Interface</span>
        </h1>
        <div className="flex flex-col items-center gap-4">
          {" "}
          {/* Add this container */}
          <MinterActionsCard />
          <BalanceCard />
        </div>
      </div>
    </div>
  );
}
