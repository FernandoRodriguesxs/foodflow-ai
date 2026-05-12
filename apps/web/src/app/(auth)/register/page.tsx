"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { register } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    storeName: "",
    storeSlug: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      router.push("/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Falha ao registrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Cadastre sua loja e comece a centralizar pedidos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup label="Seu nome" id="name" value={form.name} onChange={updateField("name")} />
          <FieldGroup label="Email" id="email" type="email" autoComplete="email" value={form.email} onChange={updateField("email")} />
          <FieldGroup label="Senha (mín. 8)" id="password" type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={updateField("password")} />
          <FieldGroup label="Nome da loja" id="storeName" value={form.storeName} onChange={updateField("storeName")} />
          <FieldGroup label="Slug da loja" id="storeSlug" value={form.storeSlug} onChange={updateField("storeSlug")} placeholder="ex: pizzaria-do-zeca" />
          {error ? (
            <p className="text-sm text-(--color-destructive)" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-(--color-muted-foreground)">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-(--color-primary) hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

interface FieldGroupProps {
  readonly label: string;
  readonly id: string;
  readonly value: string;
  readonly onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readonly type?: string;
  readonly autoComplete?: string;
  readonly minLength?: number;
  readonly placeholder?: string;
}

function FieldGroup(props: FieldGroupProps) {
  const { label, id, ...inputProps } = props;
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} required {...inputProps} />
    </div>
  );
}
