import { TablaSalonesExpandible } from "./tabla-salones";

export default function SalonesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Salones</h1>
      <TablaSalonesExpandible />
    </div>
  );
}