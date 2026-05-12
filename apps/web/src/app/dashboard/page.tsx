import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Bem-vindo</h2>
        <p className="text-sm text-(--color-muted-foreground)">
          A lista de pedidos em tempo real será exibida aqui (TASK-22).
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard title="Pedidos hoje" description="Aguardando ingestão de dados." />
        <SummaryCard title="Em preparo" description="Atualiza via Socket.IO." />
        <SummaryCard title="Concluídos" description="Histórico do dia." />
      </div>
    </div>
  );
}

function SummaryCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <span className="text-3xl font-semibold tabular-nums">—</span>
      </CardContent>
    </Card>
  );
}
