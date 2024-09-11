import { TableDemo } from "@/components/TableDemo";


export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] p-4">
      <h1 className="text-2xl font-bold mb-8">Task manager app</h1>  

      <TableDemo />

    </div>
  );
}
