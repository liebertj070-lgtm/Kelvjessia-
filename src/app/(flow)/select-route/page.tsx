import { SelectRouteClient } from "./SelectRouteClient";

export default async function SelectRoutePage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; mode?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode === "package" ? "package" : "seat";
  return (
    <SelectRouteClient
      initialTo={params.to}
      initialReversed={params.dir === "return"}
      mode={mode}
    />
  );
}
